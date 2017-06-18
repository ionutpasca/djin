'use strict'

const Analyzer = require('./core/analyzer')

const DjinWorker = require('./mysql/worker');

const t = new DjinWorker('localhost', 'root', 'root', 'world');
t.initialize();

const testJson = {
	users: {
		select: '*',
		roles: ['name', 'date']
	},
	cars: 'color',
	friends: ['name', 'age']
}


let analyzer = new Analyzer(testJson)
let result = analyzer.getSelectors()
console.log(result)