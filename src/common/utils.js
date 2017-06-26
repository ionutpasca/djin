'use strict';

const _ = require('lodash')
const fs = require('fs')
const moment = require('moment')

class Utils {
    constructor() { }

    static getSingleLineStrings(strings, ...values) {
        let output = ''
        const valuesLength = values.length
        for (let i = 0; i < valuesLength; i++) {
            output += strings[i] + values[i]
        }
        output += strings[valuesLength]
        let lines = output.split(/(?:\r\n|\n|\r)/)

        return lines.map((line) => {
            return line.replace(/^\s+/gm, '')
        }).join(' ').trim()
    }

    // static *getObjectValues(object) {
    // 	const objectKeys = Object.keys(obj)
    // 	for (let prop of objectKeys) {
    // 		yield obj[prop]
    // 	}
    // }

    static getObjectIndex(arrayOfObjects, objectToFind, excludeArrays) {
        return _.findIndex(arrayOfObjects, (obj) => {
            if (excludeArrays) {
                obj = this.removeArraysFromObject(obj)
            }
            return _.isEqual(obj, objectToFind)
        })
    }

    static trimSpacesFromString(stringToTrim) {
        return stringToTrim.replace(/\s+/g, ' ')
    }

    static updateObjectPropsFromNewArray(objectToUpdate, objectsToAppend) {
        objectsToAppend.forEach((object) => {
            Object.keys(object).forEach((key) => {
                objectToUpdate[key] = object[key]
            })
        })
        return objectToUpdate
    }

    static removeStringsFromArray(arrayOfStrings, stringsToRemove) {
        let arrayCopy = _.clone(arrayOfStrings)

        _.remove(arrayCopy, stringFromArray => {
            return stringsToRemove.includes(stringFromArray)
        })
        return arrayCopy
    }

    static removeArraysFromObject(object) {
        let result = {}
        Object.keys(object).forEach((key) => {
            if (!_.isArray(object[key])) {
                result[key] = object[key]
            }
        })
        return result
    }

    static formatDateToCurrentTimezone(date) {
        const currentTimezoneHours = getTimezoneHours()
        const currentTimezoneMinutes = getTimezoneMinutes()
        const newDate = new Date(date)
        newDate.setHours(newDate.getHours() + currentTimezoneHours)
        newDate.setMinutes(newDate.getMinutes() + currentTimezoneMinutes)
        return newDate
    }

    static arrayContainsObject(arrayOfObjects, objectToFind) {
        return _.find(arrayOfObjects, (object) => {
            return _.isEqual(objectToFind, object)
        })
    }

    static readFile(filePath) {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(data)
                }
            })
        })
    }

    static writeFile(filePath, fileContent) {
        return new Promise((resolve, reject) => {
            fs.writeFile(filePath, fileContent, (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(true)
                }
            })
        })
    }

    static stringContainsAny(stringToCheck, strings) {
        return _.some(strings, (string) => {
            return stringToCheck.toLowerCase()
                .includes(string.toLowerCase())
        })
    }
}

function getTimezoneHours() {
    const date = new Date()
    const offset = -date.getTimezoneOffset()
    const resultSign = offset >= 0 ? '+' : '-'
    return parseInt(resultSign + parseInt(offset / 60))
}

function getTimezoneMinutes() {
    const date = new Date();
    const offset = -date.getTimezoneOffset()
    const resultSign = offset >= 0 ? '+' : '-'
    return parseInt(offset % 60)
}

module.exports = Utils;