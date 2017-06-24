'use strict'

const Join = require('./join')

class InnerJoin extends Join {
    constructor(tableToJoin, tableToJoinColumn, parentTable, parentColumn) {
        super(tableToJoin, tableToJoinColumn, parentTable, parentColumn)
        this.join = `INNER ${super.getJoin()}`
    }

    getJoin() {
        return this.join
    }
}

module.exports = InnerJoin