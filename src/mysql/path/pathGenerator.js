'use strict'

const _ = require('lodash')
const BFS = require('./BFS')
const Cache = require('../../cache/cache')

const PATHS_CACHE_NAME = 'databasePaths'

class PathGenerator {
	constructor(foreignKeys) {
		this.foreignKeys = foreignKeys
		this.bfs = new BFS(this.foreignKeys)
	}

	async generatePath(fromTable, toTable) {
		if (!this.foreignKeys.length) {
			return null
		}
		let path = Cache.getDeep([PATHS_CACHE_NAME, `${fromTable}.${toTable}`])
		if (path) {
			return path
		}

		path = this.getOneToOneRelationship(path, fromTable, toTable)
		if (!path || !path.length) {
			path = this.bfs.findShortestPathBetweenTables(fromTable, toTable)
		}
		if (path.length) {
			await this.savePathInCache(path, fromTable, toTable)
			return path
		}
	}

	getOneToOneRelationship(initialPath, fromTable, toTable) {
		const oneToOneRelation = this.findBasicPathFromForeignKeys(fromTable, toTable)
		if (oneToOneRelation) {
			const tempPath = {
				tableName: toTable,
				tableColumn: oneToOneRelation.to_table === toTable
					? oneToOneRelation.to_column
					: oneToOneRelation.from_column
			}
			initialPath = [].concat(tempPath)
		}
		return initialPath
	}

	findBasicPathFromForeignKeys(fromTable, toTable) {
		return _.find(this.foreignKeys, (key) => {
			return ((key.from === fromTable && key.to === toTable) ||
				(key.from === toTable && key.to === fromTable))
		})
	}

	async savePathInCache(path, fromTable, toTable) {
		let currentSavedPaths = Cache.get(PATHS_CACHE_NAME)
		if (!currentSavedPaths) {
			currentSavedPaths = {}
		}
		const newPathKey = `${fromTable}.${toTable}`
		currentSavedPaths[newPathKey] = path
		await Cache.set(PATHS_CACHE_NAME, currentSavedPaths)
	}

}

module.exports = PathGenerator