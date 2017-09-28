'use strict'

const _ = require('lodash')
const Error = require('../../common/error')

const InsertQuery = require('../../models/query/insertQuery')
const SelectBase = require('../../models/query/selectBase')

const TransactionalInserter = require('./transactionalInserter')
const QueryExecuter = require('../queryExecuter')

const PK_IDENTIFIER = 'pri'

class Inserter {
    constructor(connection) {
        if (!connection) {
            throw new Error.MISSING_DATA
        }
        this.connection = connection
    }

    async insert(objectToInsert, sourceTable, tablesStructure) {
        let tableColumns = tablesStructure[sourceTable].columns
        tableColumns = _.map(tableColumns, 'column')
        const sourceTablePKey = findTablePrimaryKeyColumn(sourceTable, tablesStructure)

        const canUseValues = canUseValuesInsert(objectToInsert, sourceTable, tableColumns)
        if (canUseValues) {
            return await insertValues(this.connection, objectToInsert, sourceTable, tableColumns)
        } else {
            const useTransaction = mustUseTransaction(objectToInsert, tablesStructure)
            return useTransaction ?
                await makeTransactionalInsert(this.connection, objectToInsert, sourceTable, tablesStructure) :
                await makeSimpleInsert(this.connection, objectToInsert, sourceTable, sourceTablePKey)
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
    const query = insertQuery.getQuery()

    return await QueryExecuter.executeSimpleQuery(connection, query, true)
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

function mustUseTransaction(objectToInsert, tablesStructure) {
    const dbTables = Object.keys(tablesStructure)
    Object.keys(objectToInsert).forEach((key) => {
        if (_.some(dbTables, key)) {
            return true
        }
    })
    return false
}

async function makeTransactionalInsert(connection, objectToInsert, sourceTable, tablesStructure) {
    const transactionalInserter = new TransactionalInserter(this.connection)

    throw Error.NOT_IMPLEMENTED
}

async function makeSimpleInsert(connection, objectToInsert, sourceTable, sourceTablePKey) {
    const insertArgs = {
        dataSource: sourceTable,
        isMultiple: false
    }
    const insertQuery = new InsertQuery(insertArgs)
    let query = insertQuery.getQuery()
    query = `${query} ?;`

    const selectBase = new SelectBase({ select: '*', dataSource: sourceTable })
    const selectQuery = `${selectBase.getSelectBase()} WHERE ${sourceTablePKey} = `

    return await QueryExecuter.createOrUpdate(connection, query, selectQuery, objectToInsert[sourceTable], true)
}

function findTablePrimaryKeyColumn(sourceTable, tablesStructure) {
    let tableColumns = tablesStructure[sourceTable].columns
    const primaryKeyColumn = _.find(tableColumns, (column) => {
        return column.key.toLowerCase() === PK_IDENTIFIER
    })
    return primaryKeyColumn ? primaryKeyColumn.column : ''
}

module.exports = Inserter
