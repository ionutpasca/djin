'use strict'

class Join {
    constructor(tableToJoin, tableToJoinColumn, parentTable, parentColumn) {
        this.join = `JOIN ${tableToJoin} ON ${tableToJoin}.${tableToJoinColumn} = ${parentTable}.${parentColumn}`
    }

    getJoin() {
        return this.join
    }
}

module.exports = Join