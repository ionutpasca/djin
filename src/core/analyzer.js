'use strict'

const _ = require('lodash')
const Utils = require('../common/utils')
const Error = require('../common/error')

const KEYVALUES = ['select', 'where']
const SELECTALL = '*'

class Analyzer {
	constructor(jsonTree) {
		this.validateJson(jsonTree)
		this.jsonTree = jsonTree
		this.selectors = []
		this.translateJson(jsonTree, null)
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
				parent: parentNode || null
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

			Object.assign(selector, { select: keyValue.select ? keyValue.select : SELECTALL })
			this.selectors.push(selector);

			const childKeys = Utils.removeStringsFromArray(Object.keys(keyValue), KEYVALUES)
			childKeys.forEach(childKey => {
				let newTree = {}
				newTree[childKey] = keyValue[childKey]
				this.translateJson(newTree, treeKey)
			})
		})
	}

	getSelectors() {
		return this.selectors
	}
}

module.exports = Analyzer