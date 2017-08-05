'use strict'

const Constants = require('../../common/constants');
const Utils = require('../../common/utils')

class QueryProvider {
    constructor(databaseName) {
        this.databaseName = databaseName
    }

    getDbSchemaLastModificationQuery(lastTableCreationDate, lastTableUpdateDate) {
        let dbSchemaQuery = this.getDbSchemaQuery();
        if (lastTableCreationDate && lastTableUpdateDate) {
            dbSchemaQuery += ` AND (create_time > '${lastTableCreationDate}' OR update_time > '${lastTableUpdateDate}')`
        } else if (lastTableCreationDate) {
            dbSchemaQuery += ` AND create_time > '${lastTableCreationDate}'`
        } else if (lastTableUpdateDate) {
            dbSchemaQuery += ` AND update_time > '${lastTableUpdateDate}'`
        }

        return dbSchemaQuery
    }

    getDbSchemaQuery() {
        const tableName = 'table_name as tableName'
        return Utils.getSingleLineStrings`SELECT ${tableName}, ${Constants.DB_CREATION_TIME}, 
			 ${Constants.DB_UPDATE_TIME}, ${Constants.DB_ENGINE}
			 FROM ${Constants.DB_INFORMATION_SCHEMA_TABLE}
			 WHERE table_schema = '${this.databaseName}'`
    }

    getDbForeignKeysQuery() {
        const foreignKey = `table_name as 'from', column_name as 'from_column'`
        const references = `referenced_table_name as 'to', referenced_column_name as 'to_column'`
        return Utils.getSingleLineStrings`SELECT ${foreignKey}, ${references}
				FROM ${Constants.DB_INFORMATION_SCHEMA_KEY_COLUMN}
				WHERE referenced_table_name IS NOT NULL
				AND table_schema = '${this.databaseName}'`
    }

    getTablesColumnsQuery() {
        const columns = `table_name as 'table', column_name as 'column'`
        return Utils.getSingleLineStrings`SELECT ${columns}
            FROM ${Constants.DB_INFORMATION_SCHEMA_COLUMNS}
            WHERE table_schema = '${this.databaseName}'`
    }
}

module.exports = QueryProvider