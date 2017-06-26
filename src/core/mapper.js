'use strict'

const Utils = require('../common/utils')

class ResultMapper {
     constructor(queryBlueprint, queryResult) {
        this.queryBlueprint = queryBlueprint
        this.queryResult = queryResult
        this.baseElement = getBaseElement(this.queryBlueprint)

        this.mappedResult = {}
        this.mapResultToBlueprint()
    }

    mapResultToBlueprint() {
        let baseResult = []

        this.queryResult.forEach((res) => {
            const base = res[this.baseElement] || null
            if (base && !Utils.arrayContainsObject(baseResult, base)) {
                baseResult.push(base)
            }
        });
        this.mappedResult[this.baseElement] = baseResult

        this.queryResult.forEach((res) => {
            this.appendQueryResult(res)
        })
    }

    appendQueryResult(queryResult) {
        const indexOfEntity = Utils.getObjectIndex(this.mappedResult[this.baseElement], queryResult[this.baseElement], true)
        const keysLen = Object.keys(queryResult).length

        Object.keys(queryResult).forEach((key, index) => {
            if (key === this.baseElement) {
                return
            }

            let resultFromIndex = this.mappedResult[this.baseElement][indexOfEntity]
            if (!resultFromIndex[key]) {
                resultFromIndex[key] = []
            }
            const alreadyAppended = Utils.arrayContainsObject(resultFromIndex[key], queryResult[key])
            if (alreadyAppended) {
                return
            }
            resultFromIndex[key].push(queryResult[key])
            
            if(index === keysLen - 1) {
                this.mappedResult[this.baseElement][indexOfEntity] = resultFromIndex
            }
        })
    }

    getResult() {
        return this.mappedResult
    }
}

function getBaseElement(blueprint) {
    return Object.keys(blueprint)[0]
}

module.exports = ResultMapper