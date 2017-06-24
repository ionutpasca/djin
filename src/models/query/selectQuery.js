'use strict'

const Constants = require('../../common/constants')
const Utils = require('../../common/utils')

class SelectQuery {
    constructor(baseQuery, joinsToAppend, condition) {
        if (typeof baseQuery === 'object' && baseQuery.constructor.name === 'SelectBase') {
            this.query = baseQuery.getSelectBase()
        } else {
            this.query = baseQuery || ''
        }

        if (baseQuery && joinsToAppend) {
            this.appendJoins(joinsToAppend)
        }

        if(condition) {
            this.applyWhereConditionToQuery(condition)
        }
    }

    appendJoins(joins) {
        if (!joins.length) {
            return
        }
        joins.forEach((join) => {
            this.query += ` ${join.getJoin()}`
        })
    }

    applyWhereConditionToQuery(whereCondition) {
        if (Utils.stringContainsAny(whereCondition, Constants.INVALID_MYSQL_COMMANDS)) {
            return
        }
        this.query =  `${this.query} WHERE ${whereCondition}`
    }

    getQuery() {
        return this.query
    }
}

module.exports = SelectQuery