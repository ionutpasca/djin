'use strict'

const _ = require('lodash')
const QueryUtils = require('../queryUtils')

const Join = require('../../models/joins/join')
const InnerJoin = require('../../models/joins/innerJoin')
const LeftJoin = require('../../models/joins/leftJoin')
const RightJoin = require('../../models/joins/rightJoin')

const SelectBase = require('../../models/query/selectBase')
const SelectQuery = require('../../models/query/selectQuery')

class QueryBuilder {
    constructor() { }

    static generateQuery(jsonSelectors, relationPaths, foreignKeys) {
        const parentTableSelector = QueryUtils.getParentTable(jsonSelectors)
        jsonSelectors = QueryUtils.removeFromSelectors(jsonSelectors, parentTableSelector)

        let selectBase = initializeBaseQuery(parentTableSelector, jsonSelectors)
        let joinsToAppend = generateJoinsToAppend(jsonSelectors, relationPaths, foreignKeys)

        let selectQuery = new SelectQuery(selectBase, joinsToAppend, parentTableSelector.where)

        return selectQuery.getQuery()        
    }
}

function initializeBaseQuery(parentSelector, childSelectors) {
    let selectBase = new SelectBase(parentSelector)
    if (!childSelectors.length) {
        return selectBase.getSelectBase()
    }

    if (childSelectors.length) {
        selectBase.appendSelectors(childSelectors)
    }
    return selectBase
}

function generateJoinsToAppend(selectors, relationPaths, foreignKeys) {
    const joins = _.map(selectors, (selector) => {
        return findJoinToAppend(selector, relationPaths, foreignKeys)
    })
    return _.flatten(joins)
}

function findJoinToAppend(selector, relationPaths, foreignKeys) {
    const parentChildRelationPath = findRelationPathByParentAndChild(relationPaths, selector.parent, selector.dataSource)
    if (!parentChildRelationPath) {
        //FIND RELATION PATH USING ALREADY USED TABLES
    }

    let previousTable = null
    return _.map(parentChildRelationPath, (path, index) => {
        if (index === 0) {
            const foreignKey = findForeignKey(foreignKeys, selector.parent, path.tableName)
            const foreignKeyColumn = foreignKey.from === path.tableName ? foreignKey.to_column : foreignKey.from_column;
            const foreignKeyColumnForPath = foreignKey.from === path.tableName ? foreignKey.from_column : foreignKey.to_column

            previousTable = path
            return generateJoin(selector, path.tableName, foreignKeyColumnForPath, selector.parent, foreignKeyColumn)
        } else {
            return generateJoin(selector, path.tableName, path.tableColumn, previousTable.tableName, previousTable.tableColumn)
        }
    })
}

function findRelationPathByParentAndChild(relationPaths, parentTable, childTable) {
    const key = `${parentTable}.${childTable}`
    const result = _.find(relationPaths, (relationPath) => {
        return relationPath[key]
    })
    return result[key]
}

function findForeignKey(foreignKeys, fromTable, toTable) {
    return _.find(foreignKeys, (foreignKey) => {
        return (foreignKey.from === fromTable && foreignKey.to === toTable) ||
            (foreignKey.to === fromTable && foreignKey.from === toTable)
    })
}

function generateJoin(selector, tableToJoin, tableToJoinColumn, parentTable, parentColumn) {
    if (selector.innerJoin || selector.InnerJoin) {
        return new InnerJoin(tableToJoin, tableToJoinColumn, parentTable, parentColumn)
    }
    if (selector.rightJoin || selector.RightJoin) {
        return new RightJoin(tableToJoin, tableToJoinColumn, parentTable, parentColumn)
    }
    if (selector.leftJoin || selector.LeftJoin) {
        return new LeftJoin(tableToJoin, tableToJoinColumn, parentTable, parentColumn)
    }
    if (selector.join || selector.Join) {
        return new Join(tableToJoin, tableToJoinColumn, parentTable, parentColumn)
    }
    return new InnerJoin(tableToJoin, tableToJoinColumn, parentTable, parentColumn)
}

module.exports = QueryBuilder