'use strict'

const Analyzer = require('./analyzer')
const MySqlWorker = require('../mysql/worker');

class Djin {
	constructor(host, user, password, database) {
		this.mySqlWorker = new MySqlWorker(host, user, password, database)
	}
	
	select(jsonTree) {
		const analyzer = new Analyzer(jsonTree)
		const selectors = analyzer.getSelectors()
		
	}

	
}

module.exports = Djin