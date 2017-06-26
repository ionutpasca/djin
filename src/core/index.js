'use strict'

const _ = require('lodash')
const Analyzer = require('./analyzer')
const Cache = require('../cache/cache')
const Error = require('../common/error')

const ResultMapper = require('./mapper')
const MySqlWorker = require('../mysql/worker')

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
        const selectTrees = computeSelectTrees(jsonTree)
        let results = []
        for (let selectTree of selectTrees) {
            const analyzer = new Analyzer(selectTree)
            const selectors = analyzer.getSelectors()
            const localResult = await this.mySqlWorker.select(selectors)

            if (analyzer.beautifyResponse) {
                const mappedResult = new ResultMapper(analyzer.getBlueprint(), localResult)
                results.push(mappedResult.getResult())
            } else {
                results.push(localResult)
            }
        }
        return results
    }
}

function computeSelectTrees(jsonTree) {
    const baseSelectors = Object.keys(jsonTree)
    return _.map(baseSelectors, (selector) => {
        let result = {}
        result[selector] = jsonTree[selector]
        return result
    })
}

module.exports = Djin