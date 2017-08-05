'use strict'

const _ = require('lodash')
const Error = require('../../common/error')
const Utils = require('../../common/utils')

class InsertQuery {
    constructor(queryDetails) {
        const dataSource = queryDetails.dataSource
        const isMultiple = queryDetails.isMultiple || false

        this.columns = queryDetails.columns || []
        this.insert = `INSERT INTO ${dataSource}`
        this.valuesAppended = false
        this.objectAppended = false

        if (isMultiple) {
            this.insert += `( ${columns.toString()} ) VALUES `
        } else {
            this.insert += ' SET '
        }
    }

    appendValues(objectsToInsert) {
        if (this.objectAppended) {
            return Error.OBJECT_APPENDED_TO_QUERY
        }

        const valuesToAppend = _.map(objectsToInsert, (objToInsert) => {
            const value = extractColumnsFromObject(this.columns, objToInsert)
            return getSqlValueFromObject(value, this.columns)
        })
        this.insert += valuesToAppend.toString()
        this.valuesAppended = true
    }

    appendObject(objectToInsert) {
        if (this.valuesAppended) {
            return Error.VALUES_APPENDED_TO_QUERY
        }

        this.insert += objectToInsert
        this.objectAppended = true
    }
}

function extractColumnsFromObject(columns, object) {
    let result = {}
    for (const column of columns) {
        result[column] = object[column]
    }
    return result
}

function getSqlValueFromObject(object, columns) {
    let result = '('
    _.forEach(columns, (column, index) => {
        result += object[column]
        result += index !== columns.length - 1 ? ',' : ')'
    })
    return result
}

module.exports = InsertQuery