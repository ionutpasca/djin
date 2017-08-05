'use strict'

const _ = require('lodash')

const Error = require('../common/error')
const MySqlConnection = require('./connection')
const SchemaProvider = require('./schema/schemaProvider')
const QueryExecuter = require('./queryExecuter')

const Getter = require('./get/getter')
const Inserter = require('./insert/inserter')

class MySqlWorker {
    constructor(host, user, password, database) {
        this.mySqlClient = new MySqlConnection(host, user, password, database)

        this.connectionPool = null
        this.schemaProvider = null
        this.foreignKeys = null
        this.schemaWasUpdatedOnRestart = false
    }

    async initialize() {
        try {
            this.connectionPool = await this.mySqlClient.createConnectionPool()
            this.schemaProvider = new SchemaProvider(this.mySqlClient.database)

            const connection = await this.mySqlClient.getConnection()
            this.schemaWasUpdatedOnRestart = await this.schemaProvider.syncDatabaseStructure(connection)

            this.foreignKeys = this.schemaProvider.getForeignKeys()
        } catch (error) {
            throw error
        }
    }

    async execRaw(rawQuery) {
        try {
            const options = { nestTables: true, sql: rawQuery }
            const connection = await this.mySqlClient.getConnection()
            return await QueryExecuter.executeSimpleQuery(connection, options, false)
        } catch (error) {
            throw error
        }
    }

    async select(selectors) {
        try {
            const connection = await this.mySqlClient.getConnection()
            const getter = new Getter(connection, selectors, this.foreignKeys)
            return await getter.select();
        } catch (error) {
            throw error
        }
    }

    async insert(objectsToInsert) {
        try {
            objectsToInsert = [].concat(objectsToInsert);
            const tablesSchema = this.schemaProvider.getTablesSchema()
            let results = []
            const connection = await this.mySqlClient.getConnection()
            for (const objectToInsert of objectsToInsert) {
                const res = await Inserter.insert(connection, objectToInsert, tablesSchema)
                results.push(res)
            }
            return results
        } catch (error) {
            throw error
        }
    }
}


module.exports = MySqlWorker