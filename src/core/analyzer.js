'use strict'

const _ = require('lodash')
const Utils = require('../common/utils')
const Error = require('../common/error')
const Constants = require('../common/constants')

class Analyzer {
    constructor(jsonTree) {
        this.validateJson(jsonTree)
        this.jsonTree = jsonTree

        this.selectors = []
        this.translateJson(jsonTree, null)

        this.blueprint = {}
        this.generateBlueprint(jsonTree)
    }

    validateJson(jsonToValidate) {
        try {
            const stringifiedJson = JSON.stringify(jsonToValidate)
            JSON.parse(stringifiedJson)
            return true
        } catch (error) {
            throw Error.INVALID_JSON;
        }
    }

    translateJson(jsonTree, parentNode) {
        Object.keys(jsonTree).forEach(treeKey => {
            const keyValue = jsonTree[treeKey]

            let selector = {
                dataSource: treeKey,
                parent: parentNode || null,
                where: keyValue.where || null,
                join: keyValue.join || false,
                rightJoin: keyValue.rightJoin || keyValue.RightJoin || false,
                leftJoin: keyValue.leftJoin || keyValue.LeftJoin || false,
                innerJoin: keyValue.innerJoin || keyValue.innerJoin || false
            }

            if (keyValue instanceof String || typeof keyValue === 'string') {
                Object.assign(selector, { select: [].concat(keyValue) })
                this.selectors.push(selector)
                return;
            }

            if (Array.isArray(keyValue)) {
                Object.assign(selector, { select: keyValue })
                this.selectors.push(selector)
                return;
            }

            Object.assign(selector, { select: keyValue.select ? keyValue.select : Constants.SELECTALL })
            this.selectors.push(selector);

            const childKeys = Utils.removeStringsFromArray(Object.keys(keyValue), Constants.KEYVALUES)
            childKeys.forEach(childKey => {
                let newTree = {}
                newTree[childKey] = keyValue[childKey]
                this.translateJson(newTree, treeKey)
            })
        })
    }

    generateBlueprint() {
        const mainEntities = getSelectorsWithoutParent(this.selectors)
        mainEntities.forEach((entity) => {
            this.blueprint[entity.dataSource] = {}
        })

        Object.keys(this.blueprint).forEach((key) => {
            const children = findChildSelectors(this.selectors, key)
            this.blueprint[key] = appendChildrenToParent(this.blueprint[key], children)
        })
    }

    getBlueprint() {
        return this.blueprint
    }

    getSelectors() {
        return this.selectors
    }
}

function getSelectorsWithoutParent(selectors) {
    return _.filter(selectors, (selector) => {
        return !selector.parent
    })
}

function findChildSelectors(selectors, parent) {
    return _.filter(selectors, (selector) => {
        return selector.parent === parent
    })
}

function appendChildrenToParent(parent, children) {
    children.forEach((child) => {
        parent[child.dataSource] = {}
    })
    return parent
}

module.exports = Analyzer