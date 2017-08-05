'use strict'

const _ = require('lodash')

class QueryUtils {
    constructor() { }

    static getParentTable(jsonSelectors) {
        return _.first(jsonSelectors, (selector) => {
            return !selector.parent
        })
    }

    // static getTablesWithoutParents(jsonSelectors) {
    //     return _.filter(jsonSelectors, (selector) => {
    //         return !selector.parent
    //     })
    // }

    static removeFromSelectors(selectors, selectorsToRemove) {
        selectorsToRemove = [].concat(selectorsToRemove)

        selectorsToRemove.forEach((selectorToRemove) => {
            _.remove(selectors, (selector) => {
                return _.isEqual(selector, selectorToRemove)
            })
        })
        return selectors
    }
}

module.exports = QueryUtils