'use strict'

const _ = require('lodash')
const Queue = require('../../models/queue')
const Graph = require('../../models/graph')

class BFS {
    constructor(foreignKeys) {
        this.foreignKeys = foreignKeys
        this.nodes = this.computeGraphNodes()

        this.queue = new Queue()
        this.graph = new Graph()
        this.initGraphEdges()
    }

    computeGraphNodes() {
        let nodes = []
        this.foreignKeys.forEach((key) => {
            nodes = appendTableNode(nodes, key.from, key.from_column)
            nodes = appendTableNode(nodes, key.to, key.to_column)
        })
        return nodes
    }

    initGraphEdges() {
        for (let i = 0; i < this.nodes.length - 1; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const firstTable = this.nodes[i].tableName
                const secondTable = this.nodes[j].tableName
                const foreignKeyExists = foreignKeyExistsBetweenTables(this.foreignKeys, firstTable, secondTable)
                if (foreignKeyExists) {
                    this.graph.addEdge(i, j)
                }
            }
        }
    }

    findShortestPathBetweenTables(sourceTableName, targetTableName) {
        const sourceTableId = getNodeIdByTableName(this.nodes, sourceTableName)
        const targetTableId = getNodeIdByTableName(this.nodes, targetTableName)
        let shortestPath = this.shortestPath(sourceTableId, targetTableId)

        let shortestPathTables = []
        shortestPath = [].concat(shortestPath)
        shortestPath.forEach((node) => {
            const nodeWithDetails = _.find(this.nodes, (n) => {
                return n.id === node
            })
            shortestPathTables.push(nodeWithDetails)
        })
        return shortestPathTables
    }

    shortestPath(source, target) {
        if (source === target) {
            return source
        }

        let visited = { source: true }
        let predecessor = {}
        let tail = 0
        this.queue.add(source)

        while (tail < this.queue.getLength()) {
            let queueElement = this.queue.get(tail)
            let neighbors = this.graph.neighbors[queueElement]
            tail += 1

            for (let i = 0; i < neighbors.length; ++i) {
                let neighbor = neighbors[i]
                if (visited[neighbor]) {
                    continue
                }

                visited[neighbor] = true
                if (neighbor === target) {
                    let path = [neighbor]
                    while (queueElement !== source) {
                        path.push(queueElement)
                        queueElement = predecessor[queueElement]
                    }
                    path.push(queueElement)
                    path.reverse()
                    return path
                }
                predecessor[neighbor] = queueElement
                this.queue.add(neighbor)
            }
        }
        return null
    }
}

function appendTableNode(nodes, tableToAppend, tableColumn) {
    if (!tableNameExistsInNodes(nodes, tableToAppend)) {
        nodes.push({ id: nodes.length, tableName: tableToAppend, tableColumn: tableColumn })
    }
    return nodes
}

function getNodeIdByTableName(nodes, tableName) {
    return _.find(nodes, (node) => {
        return node.tableName === tableName
    }).id
}

function tableNameExistsInNodes(nodes, tableName) {
    return _.some(nodes, (node) => {
        return node.tableName === tableName
    })
}

function foreignKeyExistsBetweenTables(foreignKeys, firstTable, secondTable) {
    return _.some(foreignKeys, (foreignKey) => {
        return ((foreignKey.from === firstTable && foreignKey.to === secondTable) ||
            (foreignKey.from === secondTable && foreignKey.to === firstTable))
    })
}

module.exports = BFS