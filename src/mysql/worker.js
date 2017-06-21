'use strict'

const _ = require('lodash')

const Error = require('../common/error')
const MySqlConnection = require('./connection')
const SchemaProvider = require('./schema/schemaProvider')
const PathGenerator = require('./path/pathGenerator')

const QueryExecuter = require('./query/queryExecuter')
const QueryBuilder = require('./query/queryBuilder')

class MySqlWorker {
    constructor(host, user, password, database) {
        this.mySqlClient = new MySqlConnection(host, user, password, database)

        this.connectionPool = null
        this.schemaProvider = null
        this.pathGenerator = null
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
            this.pathGenerator = new PathGenerator(this.foreignKeys)
        } catch (error) {
            throw error
        }
    }

    async select(selectors) {
        try {
            const shortestPathsBetweenSelectors = await this.computeShortestPathsBetweenSelectors(selectors)
            const query = QueryBuilder.generateQuery(selectors, shortestPathsBetweenSelectors, this.foreignKeys)

            const options = {
                nestTables: true,
                sql: query
            }
            const connection = await this.mySqlClient.getConnection()
            return await QueryExecuter.executeSimpleQuery(connection, options, false)
        } catch (error) {
            throw error
        }
    }

    async computeShortestPathsBetweenSelectors(selectors) {
        const selectorsWithParents = getSelectorsWithParents(selectors)
        return await this.getSelectorsShortestPaths(selectorsWithParents)
    }

    async getSelectorsShortestPaths(selectors) {
        const results = _.map(selectors, (selector) => {
            return this.getShortestPathBetweenTables(selector.parent, selector.dataSource, true)
        })

        //MIGHT WANT TO MAKE IT SERIALLY
        return Promise.all(results)
    }

    async getShortestPathBetweenTables(fromTable, toTable, ignoreFirst) {
        if (!this.pathGenerator) {
            throw Error.UNINITIALIZED_PATH_GENERATOR
        }

        let path = await this.pathGenerator.generatePath(fromTable, toTable)

        let result = {}
        if (ignoreFirst && path.length > 1) {
            result[`${fromTable}.${toTable}`] = _.tail(path)
            return result
        }
        result[`${fromTable}.${toTable}`] = path
        return result
    }
}

function getSelectorsWithParents(selectors) {
    return _.filter(selectors, (selector) => {
        return selector.parent
    })
}

module.exports = MySqlWorker