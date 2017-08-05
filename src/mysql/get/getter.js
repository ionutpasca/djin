'use strict'

const _ = require('lodash')
const Error = require('../../common/error')
const QueryExecuter = require('../queryExecuter')
const QueryBuilder = require('./queryBuilder')
const PathGenerator = require('../path/pathGenerator')

class Getter {
    constructor(connection, selectors, foreignKeys) {
        if (!connection || !selectors || !foreignKeys) {
            throw new Error.MISSING_DATA
        }
        this.selectors = selectors
        this.connection = connection
        this.foreignKeys = foreignKeys
        this.pathGenerator = new PathGenerator(this.foreignKeys)
    }

    async select() {
        const shortestPathsBetweenSelectors = await this.computeShortestPathsBetweenSelectors(this.selectors)
        const query = QueryBuilder.generateQuery(this.selectors, shortestPathsBetweenSelectors, this.foreignKeys)

        const options = { nestTables: true, sql: query }
        return await QueryExecuter.executeSimpleQuery(this.connection, options, false)
    }

    async computeShortestPathsBetweenSelectors(selectors) {
        const selectorsWithParents = getSelectorsWithParents(selectors)
        return await this.getSelectorsShortestPaths(selectorsWithParents)
    }

    async getSelectorsShortestPaths(selectors) {
        const results = _.map(selectors, (selector) => {
            return this.getShortestPathBetweenTables(selector.parent, selector.dataSource, true)
        })

        //MIGHT WANT TO MAKE IT SERIALLY
        return Promise.all(results)
    }

    async getShortestPathBetweenTables(fromTable, toTable, ignoreFirst) {
        if (!this.pathGenerator) {
            throw Error.UNINITIALIZED_PATH_GENERATOR
        }

        let path = await this.pathGenerator.generatePath(fromTable, toTable)

        let result = {}
        if (ignoreFirst && path.length > 1) {
            result[`${fromTable}.${toTable}`] = _.tail(path)
            return result
        }
        result[`${fromTable}.${toTable}`] = path
        return result
    }
}

function getSelectorsWithParents(selectors) {
    return _.filter(selectors, (selector) => {
        return selector.parent
    })
}

module.exports = Getter