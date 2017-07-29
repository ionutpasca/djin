'use strict'

const _ = require('lodash')
const Analyzer = require('./analyzer')
const Beautifier = require('nested-beautifier')
const Cache = require('../cache/cache')
const Error = require('../common/error')
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

    async execRaw(rawQuery) {
        try {
            return this.mySqlWorker.execRaw(rawQuery)
        } catch (error) {
            throw error
        }
    }

    async select(jsonTree) {
        const selectTrees = computeSelectTrees(jsonTree)
        let results = []
        for (let selectTree of selectTrees) {
            const analyzer = new Analyzer(selectTree)
            const selectors = analyzer.getSelectors()
            const localResult = await this.mySqlWorker.select(selectors)

            var beautifiedRes = Beautifier.beautify(localResult, Object.keys(analyzer.blueprint)[0])
            var resultValues = _.map(beautifiedRes, Object.keys(analyzer.blueprint)[0])

            results.push({ [Object.keys(analyzer.blueprint)[0]]: resultValues })
        }
        if (selectTrees.length === 1) {
            return results[0]
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