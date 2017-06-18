'use strict'

const _ = require('lodash')
const BFS = require('./BFS')

class PathGenerator {
	constructor(foreignKeys) {
		this.foreignKeys = foreignKeys
		this.bfs = new BFS(this.foreignKeys)
	}

	generatePath(fromTable, toTable) {
		if (!this.foreignKeys.length) {
			return null
		}

		const path = this.findBasicPathFromForeignKeys(fromTable, toTable)
		if (path) {
			return path
		}
		return this.bfs.findShortestPathBetweenTables(fromTable, toTable)
	}

	findBasicPathFromForeignKeys(fromTable, toTable) {
		return _.find(this.foreignKeys, (key) => {
			return ((key.from === fromTable && key.to === toTable) ||
				(key.from === toTable && key.to === fromTable))
		})
	}

}

module.exports = PathGenerator