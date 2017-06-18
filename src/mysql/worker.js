'use strict'

const Cache = require('../cache/cache')
const Error = require('../common/error')
const MySqlConnection = require('./connection')
const SchemaProvider = require('./schema/schemaProvider')
const PathGenerator = require('./path/pathGenerator')

class DjinWorker {
	constructor(host, user, password, database) {
		this.mySqlClient = new MySqlConnection(host, user, password, database)

		this.connectionPool = null
		this.schemaProvider = null
		this.pathGenerator = null
		this.schemaWasUpdatedOnRestart = false
	}

	async initialize() {
		this.connectionPool = await this.mySqlClient.createConnectionPool()
		this.cachedData = await Cache.initialize()
		this.schemaProvider = new SchemaProvider(this.mySqlClient.database)

		try {
			const connection = await this.mySqlClient.getConnection()
			this.schemaWasUpdatedOnRestart = await this.schemaProvider.syncDatabaseStructure(connection)

			const foreignKeys = this.schemaProvider.getForeignKeys()
			this.pathGenerator = new PathGenerator(foreignKeys)
		} catch (error) {
			throw error
		}
	}

	getShortestPathBetweenTables(fromTable, toTable) {
		if(!this.pathGenerator) {
			throw Error.UNINITIALIZED_PATH_GENERATOR
		}
		return this.pathGenerator.generatePath(fromTable, toTable)
	}

}

module.exports = DjinWorker