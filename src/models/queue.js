'use strict'

class Queue {
	constructor() {
		this.queue = []
	}

	add(element) {
		this.queue.push(element)
	}

	pop(element) {
		return this.queue.shift()
	}

	get(index) {
		return this.queue[index]
	}

	getLength() {
		return this.queue.length
	}

	isEmpty() {
		return this.queue.length === 0
	}
}

module.exports = Queue