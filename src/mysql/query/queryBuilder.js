'use strict'

const _ = require('lodash')
const Constants = require('../../common/constants')
const Utils = require('../../common/utils')

class QueryBuilder {
	constructor() { }

	static generateQuery(jsonSelectors, relationPaths, foreignKeys) {
		const firstTableWithoutParent = getFirstTableWithoutParent(jsonSelectors)
		const tablesWithoutParents = getTablesWithoutParents(jsonSelectors)
		jsonSelectors = removeFromSelectors(jsonSelectors, firstTableWithoutParent)
		jsonSelectors = removeFromSelectors(jsonSelectors, tablesWithoutParents)

		let query = appendFirstTableToQuery(firstTableWithoutParent)

		if (!jsonSelectors.length && !tablesWithoutParents.length) {
			return `${query};`
		}
		if (jsonSelectors.length) {
			query = appendChildSelectorsToQuery(query, jsonSelectors, relationPaths, foreignKeys)
		}

		if(firstTableWithoutParent.where) {
			query = applyWhereConditionToQuery(query, firstTableWithoutParent.where)
		}
		//DON'T FORGET TO APPLY THE REMAINING TABLES WITHOUT PARENTS
		return `${query};`
	}
}

function getFirstTableWithoutParent(jsonSelectors) {
	return _.first(jsonSelectors, (selector) => {
		return !selector.parent
	})
}

function removeFromSelectors(selectors, selectorsToRemove) {
	selectorsToRemove = [].concat(selectorsToRemove)

	selectorsToRemove.forEach((selectorToRemove) => {
		_.remove(selectors, (selector) => {
			return _.isEqual(selector, selectorToRemove)
		})
	})
	return selectors
}

function getTablesWithoutParents(jsonSelectors) {
	return _.filter(jsonSelectors, (selector) => {
		return !selector.parent
	})
}

function appendFirstTableToQuery(firstTableSelector) {
	const selectors = generateSelectStringsFromSelector(firstTableSelector)
	return `SELECT ${selectors} FROM ${firstTableSelector.dataSource} `
}

function generateSelectStringsFromSelector(selector) {
	const fieldsToSelect = selector.select
	const dataSource = selector.dataSource
	const query = applySelectKeysToQuery('', fieldsToSelect, dataSource)
	return query
}

function appendChildSelectorsToQuery(query, selectors, relationPaths, foreignKeys) {
	selectors = [].concat(selectors)
	let splittedQuery = query.split(/(FROM)/g)

	let baseQuery = splittedQuery[0]
	selectors.forEach((selector) => {
		baseQuery = applySelectKeysToQuery(baseQuery, selector.select, selector.dataSource)
	})

	for (let i = 1; i < splittedQuery.length; i++) {
		baseQuery = `${baseQuery} ${splittedQuery[i]}`
	}

	selectors.forEach((selector) => {
		baseQuery = applyJoinStringToQuery(baseQuery, selector, relationPaths, foreignKeys)
	})

	return baseQuery
}

function applySelectKeysToQuery(query, fieldsToSelect, dataSource) {
	if (!query) {
		query = ''
	} else {
		query += ', '
	}

	if (!fieldsToSelect) {
		query += `${dataSource}.*`
	} else if (typeof fieldsToSelect === 'string') {
		query += `${dataSource}.${fieldsToSelect}`
	} else if (_.isArray(fieldsToSelect)) {
		query += _.map(fieldsToSelect, (fieldToSelect) => {
			let partialQuery = `${dataSource}.${fieldToSelect}`
			return partialQuery
		}).toString()
	} else {
		query += `${dataSource}.*`
	}
	return query
}

function applyJoinStringToQuery(query, selector, relationPaths, foreignKeys) {
	const parentChildRelationPath = findRelationPathByParentAndChild(relationPaths, selector.parent, selector.dataSource)
	if (!parentChildRelationPath) {
		//FIND RELATION PATH USING ALREADY USED TABLES
	}

	let previousTable = null
	parentChildRelationPath.forEach((path, index) => {
		if (index === 0) {
			const foreignKey = findForeignKey(foreignKeys, selector.parent, path.tableName)
			const foreignKeyColumn = foreignKey.from === path.tableName ? foreignKey.to_column : foreignKey.from_column;
			const foreignKeyColumnForPath = foreignKey.from === path.tableName ? foreignKey.from_column : foreignKey.to_column

			query += ` INNER JOIN ${path.tableName} ON ${path.tableName}.${foreignKeyColumnForPath} = ${selector.parent}.${foreignKeyColumn} `
			previousTable = path
		} else {
			query += ` INNER JOIN ${path.tableName} ON ${path.tableName}.${path.tableColumn} = ${previousTable.tableName}.${previousTable.tableColumn}`
		}
	})

	return query
}

function findRelationPathByParentAndChild(relationPaths, parentTable, childTable) {
	const key = `${parentTable}.${childTable}`
	const result = _.find(relationPaths, (relationPath) => {
		return relationPath[key]
	})
	return result[key]
}

function findForeignKey(foreignKeys, fromTable, toTable) {
	return _.find(foreignKeys, (foreignKey) => {
		return (foreignKey.from === fromTable && foreignKey.to === toTable) ||
			(foreignKey.to === fromTable && foreignKey.from === toTable)
	})
}

function applyWhereConditionToQuery(query, whereCondition) {
	if(Utils.stringContainsAny(whereCondition, Constants.INVALID_MYSQL_COMMANDS)) {
		return query
	}
	return `${query} WHERE ${whereCondition}`
}

module.exports = QueryBuilder