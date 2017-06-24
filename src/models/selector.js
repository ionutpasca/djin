'use strict'

class Selector {
    constructor(...props) {
        this.dataSource = props[0] || null
        this.parent = props[1] || null
        this.select = props.select[2] || null
        this.condition = props.condition[3] || null
    }

    get() {
        return {
            dataSource: this.dataSource,
            parent: this.parent,
            condition: this.condition
        }
    }

    addProp(key, value) {
        this[key] = value
        return this
    }
}

module.exports = Selector