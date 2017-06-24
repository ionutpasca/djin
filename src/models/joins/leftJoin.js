'use strict'

const Join = require('./join')

class LeftJoin extends Join {
    constructor(tableToJoin, tableToJoinColumn, parentTable, parentColumn) {
        super(tableToJoin, tableToJoinColumn, parentTable, parentColumn)
        this.join = `LEFT ${super.getJoin()}`
    }

    getJoin() {
        return this.join
    }
}

module.exports = LeftJoin