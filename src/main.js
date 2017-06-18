'use strict'

const testJson = {
	users: {
		select: '*',
		roles: ['name', 'date']
	},
	cars: 'color',
	friends: ['name', 'age']
}

const Djin = require('./core/index')
const djin = new Djin('localhost', 'root', 'root', 'world')
djin.initialize();

