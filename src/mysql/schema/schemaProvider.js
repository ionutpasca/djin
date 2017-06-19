'use strict'

const _ = require('lodash')
const Cache = require('../../cache/cache')
const Utils = require('../../common/utils')
const QueryExecuter = require('../query/queryExecuter')
const QueryProvider = require('../query/queryProvider')

class SchemaProvider {
	constructor(databaseName) {
		this.queryProvider = new QueryProvider(databaseName)
		this.initializeData()
	}

	initializeData() {
		this.schema = Cache.get('databaseSchema')
		this.foreignKeys = Cache.get('foreignKeys')
		this.lastTableCreationDate = Cache.get('lastTableCreationDate')
		this.lastTableUpdateDate = Cache.get('lastTableUpdateDate')
	}

	getForeignKeys() {
		return this.foreignKeys
	}

	async syncDatabaseStructure(connection) {
		let dbStructure = null
		if (!this.schema) {
			await this.getStructureAndCache(connection)
			return true
		}
		const dbModifications = await this.findLastDatabaseModification(connection, true)
		if (dbModifications.length) {
			await this.getStructureAndCache(connection)
			return true
		} else {
			connection.release()
		}
		return false
	}

	async getStructureAndCache(connection) {
		try {
			const dbStructure = await this.getDatabaseStructure(connection)
			this.schema = dbStructure.databaseSchema
			this.foreignKeys = dbStructure.foreignKeys

			this.lastTableCreationDate = findLatestTableUpdateDate(this.schema, true)
			this.lastTableUpdateDate = findLatestTableUpdateDate(this.schema, true)

			Object.assign(dbStructure, {
				lastTableCreationDate: this.lastTableCreationDate,
				lastTableUpdateDate: this.lastTableUpdateDate
			})
			await Cache.setObjects(dbStructure)
		} catch (err) {
			throw err
		}
	}

	async findLastDatabaseModification(connection, maintainConnection) {
		try {
			const lastModifiedTablesQuery = await this.queryProvider.getDbSchemaLastModificationQuery(this.lastTableCreationDate, this.lastTableUpdateDate)
			return await QueryExecuter.executeSimpleQuery(connection, lastModifiedTablesQuery, maintainConnection)
		} catch (error) {
			throw error
		}
	}

	async getDatabaseStructure(connection) {
		try {
			const dbSchema = await this.getDatabaseSchema(connection, true)
			const dbForeignKeys = await this.getDatabaseForeignKeys(connection)
			return { databaseSchema: dbSchema, foreignKeys: dbForeignKeys };
		} catch (error) {
			throw error
		}
	}

	async getDatabaseSchema(connection, maintainConnection) {
		try {
			const dbSchemaQuery = this.queryProvider.getDbSchemaQuery()
			return await QueryExecuter.executeSimpleQuery(connection, dbSchemaQuery, maintainConnection)
		} catch (error) {
			throw error
		}
	}

	async getDatabaseForeignKeys(connection, maintainConnection) {
		try {
			const dbForeignKeysQuery = this.queryProvider.getDbForeignKeysQuery()
			return await QueryExecuter.executeSimpleQuery(connection, dbForeignKeysQuery, maintainConnection)
		} catch (error) {
			throw error
		}
	}
}

function findLatestTableUpdateDate(dbSchema, afterCreationDate) {
	const query = afterCreationDate ? 'creationTime' : 'updateTime'
	const sortedTables = _.sortBy(dbSchema, query)
	const latestCreatedTableTime = _.last(sortedTables).creationTime
	return Utils.formatDateToCurrentTimezone(latestCreatedTableTime)
}

module.exports = SchemaProvider