'use strict'

const _ = require('lodash')
const Utils = require('../../common/utils')

class SelectBase {
    constructor(parentSelector) {
        const fieldsToSelect = parentSelector.select
        const dataSource = parentSelector.dataSource

        this.select = applySelectKeysToQuery(null, fieldsToSelect, dataSource)
        this.select = `SELECT ${this.select} FROM ${dataSource}`
    }

    appendSelectors(selectors) {
        selectors = [].concat(selectors)
        let splittedQuery = this.select.split(/(FROM)/g)
        let baseQuery = splittedQuery[0]

        selectors.forEach((selector) => {
            baseQuery = applySelectKeysToQuery(baseQuery, selector.select, selector.dataSource, selector.parent)
        })

        for (let i = 1; i < splittedQuery.length; i++) {
            baseQuery = `${baseQuery} ${splittedQuery[i]}`
        }
        this.select = baseQuery
    }

    getSelectBase() {
        return this.select
    }
}

function applySelectKeysToQuery(query, fieldsToSelect, dataSource) {
    if (!query) {
        query = ''
    } else {
        query += ', '
    }

    if (!fieldsToSelect) {
        query += `${dataSource}.*`
    } else if (typeof fieldsToSelect === 'string') {
        query += `${dataSource}.${fieldsToSelect}`
    } else if (_.isArray(fieldsToSelect)) {
        query += _.map(fieldsToSelect, (fieldToSelect) => {
            return `${dataSource}.${fieldToSelect}`
        }).toString()
    } else {
        query += `${dataSource}.*`
    }
    return query
}

module.exports = SelectBase