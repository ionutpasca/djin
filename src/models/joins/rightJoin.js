'use strict'

const Join = require('./join')

class RightJoin extends Join {
    constructor(tableToJoin, tableToJoinColumn, parentTable, parentColumn) {
        super(tableToJoin, tableToJoinColumn, parentTable, parentColumn)
        this.join = `RIGHT ${super.getJoin()}`
    }

    getJoin() {
        return this.join
    }
}

module.exports = RightJoin