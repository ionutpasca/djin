'use strict'

const mysql = require('promise-mysql')
const Error = require('../common/error')

class MysqlConnection {
    constructor(host, user, password, database) {
        this.host = host
        this.user = user
        this.password = password
        this.database = database

        this.connectionPool = null
    }

    async createConnectionPool() {
        try {
            this.connectionPool = mysql.createPool({
                host: this.host,
                user: this.user,
                password: this.password,
                database: this.database,
                connectionLimit: 5,
                multipleStatements: true
            })
            return this.connectionPool
        } catch (error) {
            throw Error.UNABLE_TO_CONNECT
        }
    }

    getConnection() {
        return new Promise((resolve, reject) => {
            if (!this.connectionPool) {
                reject(Error.UNINITIALIZED_POOL)
            }
            this.connectionPool.getConnection((err, connection) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(connection)
                }
            })
        })
    }
}

module.exports = MysqlConnection