'use strict'

const testJson = {
	users: {
		select: ['name', 'email'],
		roles: ['name'],
		chat_messages: ['message'],
		where: 'users.id = 172'
	}
}

const Djin = require('./core/index')

const djin = new Djin({
	host: 'localhost',
	user: 'root',
	password: 'root',
	database: 'world'
})

djin.initialize()
	.then(() => {
		return djin.select(testJson)
	})
	.then((result) => {
		console.log(`RESULT: ${result}`)
	})
	.catch((err) => {
		console.log(`ERR: ${err}`)
	})

