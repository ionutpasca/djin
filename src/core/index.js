'use strict'

const _ = require('lodash')
const Analyzer = require('./analyzer')
const Cache = require('../cache/cache')
const MySqlWorker = require('../mysql/worker');

class Djin {
	constructor(host, user, password, database) {
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