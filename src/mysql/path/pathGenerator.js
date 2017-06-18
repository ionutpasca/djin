'use strict'

const _ = require('lodash')
const BFS = require('./BFS')
const Cache = require('../../cache/cache')

class PathGenerator {
	constructor(foreignKeys) {
		this.foreignKeys = foreignKeys
		this.bfs = new BFS(this.foreignKeys)
	}

	async generatePath(fromTable, toTable) {
		if (!this.foreignKeys.length) {
			return null
		}
		let path = Cache.getDeep(['databasePaths', `${fromTable}.${toTable}`])
		if(path) {
			return path
		}

		path = this.findBasicPathFromForeignKeys(fromTable, toTable)
		if (!path) {
			path = this.bfs.findShortestPathBetweenTables(fromTable, toTable)
		}
		if(path) {
			await this.savePathInCache(path, fromTable, toTable)
			return path
		}
	}

	findBasicPathFromForeignKeys(fromTable, toTable) {
		return _.find(this.foreignKeys, (key) => {
			return ((key.from === fromTable && key.to === toTable) ||
				(key.from === toTable && key.to === fromTable))
		})
	}

	async savePathInCache(path, fromTable, toTable) {
		let currentSavedPaths = Cache.get('databasePaths')
		if (!currentSavedPaths) {
			currentSavedPaths = {}
		}
		const newPathKey = `${fromTable}.${toTable}`
		currentSavedPaths[newPathKey] = path
		await Cache.set('databasePaths', currentSavedPaths)
	}

}

module.exports = PathGenerator