'use strict';

class QueryExecuter {
    constructor() { }

    static executeSimpleQuery(connection, queryOptions, maintainConnection) {
        return executeSimpleQuery(connection, queryOptions, maintainConnection)
    }

    static executeQuery(connection, query, data) {
        return executeQuery(connection, query, data)
    }

    static createOrUpdate(connection, insertOrUpdateQuery, selectQuery, data, maintainConnection) {
        return new Promise((resolve, reject) => {
            executeQuery(connection, insertOrUpdateQuery, data)
                .then((insertedId) => {
                    let select = manipulateSelectQuery(selectQuery, insertedId)

                    const options = {
                        nestTables: true,
                        sql: select
                    }
                    return executeSimpleQuery(connection, options, maintainConnection)
                })
                .then((data) => {
                    resolve(data)
                })
                .catch((error) => {
                    reject(error)
                })
        })
    }

    static endTransaction(connection, err, result) {
        return new Promise((resolve, reject) => {
            if (!connection) {
                return reject(err)
            }
            if (err) {
                return rollback(connection, err)
            }

            connection.commit((err) => {
                if (err) {
                    return rollback(connection, err)
                }
                resolve(result)
            })
        })
    }
}

function executeSimpleQuery(connection, queryOptions, maintainConnection) {
    return new Promise((resolve, reject) => {
        connection.query(queryOptions, (err, result) => {
            if (err) {
                connection.release()
                return reject(err)
            }
            if (!maintainConnection) {
                connection.release()
            }
            resolve(result)
        })
    })
}

function executeQuery(connection, query, data) {
    data = [].concat(data)
    return new Promise((resolve, reject) => {
        connection.query(query, data, (err, result) => {
            if (err) {
                return reject(err)
            }
            const res = result.insertId ? result.insertId : false
            resolve(res)
        })
    })
}

function rollback(connection, err) {
    return new Promise((resolve, reject) => {
        return connection.rollback(() => {
            connection.release()
            reject(err)
        })
    })
}

function manipulateSelectQuery(selectQuery, insertedId) {
    let select = null
    if (selectQuery.sql) {
        select = selectQuery.sql
    } else {
        select = selectQuery.query ? selectQuery.query : selectQuery
    }
    select += insertedId ? insertedId : ''
    select += selectQuery.forUpdate ? ' FOR UPDATE' : ''
    return select
}

module.exports = QueryExecuter