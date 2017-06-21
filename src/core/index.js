'use strict'

const _ = require('lodash')
const Analyzer = require('./analyzer')
const Cache = require('../cache/cache')
const Error = require('../common/error')
const MySqlWorker = require('../mysql/worker');

class Djin {
    constructor(config) {
        const host = config.host
        const user = config.user
        const password = config.password
        const database = config.database
        if (!host || !user || !password || !database) {
            throw Error.MISSING_DATA
        }

        this.mySqlWorker = new MySqlWorker(host, user, password, database)
    }

    async initialize() {
        await Cache.initialize()
        await this.mySqlWorker.initialize()
    }

    async select(jsonTree) {
        const analyzer = new Analyzer(jsonTree)
        const selectors = analyzer.getSelectors()
        return await this.mySqlWorker.select(selectors);
    }
}
module.exports = Djin