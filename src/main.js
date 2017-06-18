'use strict'

const testJson = {
	users: {
		select: ['name', 'email'],
		roles: ['name'],
		chat_messages: { select: '*' },
		where: 'users.id = 172'
	}
}

const Djin = require('./core/index')

const djin = new Djin('localhost', 'root', 'root', 'world')

djin.initialize()
	.then(() => {
		return djin.select(testJson)
	})
	.then((result) => {
		var x = 5
	})
	.catch((err) => {
		console.log("ERR", err)
	})

