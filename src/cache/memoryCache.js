'use strict'

const Utils = require('../common/utils')

class MemoryCacher {
    constructor() {
        this.cache = {}
    }

    get(key) {
        if (this.cache[key]) {
            return this.cache[key]
        } else {
            return null
        }
    }

    setObjects(objects) {
        if (typeof objects === 'object' && !Object.keys(objects).length) {
            return
        }

        this.cache = Utils.updateObjectPropsFromNewArray(this.cache, objects)
        return this.cache
    }
}

module.exports = MemoryCacher