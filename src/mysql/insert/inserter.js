'use strict'

const _ = require('lodash')
const InsertQuery = require('../../models/query/insertQuery')
const QueryExecuter = require('../queryExecuter')

class Inserter {
    constructor() { }

    static async insert(connection, objectToInsert, sourceTable, tablesStructure) {
        const tableColumns = tablesStructure[sourceTable].columns
        const canUseValuesInsert = canUseValuesInsert(objectToInsert, sourceTable, tableColumns)
        if (canUseValuesInsert) {
            insertValues(connection, objectToInsert, sourceTable, tableColumns)
        }
    }

}

async function insertValues(connection, objectToInsert, sourceTable, tableColumns) {
    const insertArgs = {
        dataSource: sourceTable,
        columns: tableColumns,
        isMultiple: true
    }
    let insertQuery = new InsertQuery(insertArgs)
    insertArgs.appendValues(objectToInsert)
    
}

function canUseValuesInsert(objectToInsert, sourceTable, tableColumns) {
    if (!_.isArray(objectToInsert)) {
        return false
    }
    _.forEach(objectToInsert, (obj) => {
        const objIsValid = objectContainsOnlyOwnColumns(obj, sourceTable, tableColumns)
        if (!objIsValid) {
            return false
        }
    })
    return true
}

function objectContainsOnlyOwnColumns(tableObject, tableName, tableColumns) {
    Object.keys(tableObject).forEach((key) => {
        if (!_.some(tableColumns, key)) {
            return false
        }
    })
    return true
}

module.exports = Inserter