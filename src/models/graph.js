'use strict'

class Graph {
	constructor() {
		this.neighbors = {}
	}

	addEdge(from, to) {
		if(this.neighbors[from] === undefined) {
			this.neighbors[from] = []
		}
		this.neighbors[from].push(to)

		if(this.neighbors[to] === undefined) {
			this.neighbors[to] = []
		}
		this.neighbors[to].push(from)
	}
}

module.exports = Graph