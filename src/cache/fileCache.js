'use strict'

const fs = require('fs')
const path = require('path')
const Utils = require('../common/utils')
const Error = require('../common/error')

const CACHE_FILE_NAME = 'cache.json'
const CACHE_FILE_DIR = path.join(__dirname, CACHE_FILE_NAME)

class FileCacher {
	constructor() {
		this.cacheFileDir = CACHE_FILE_DIR
		if (!fs.existsSync(this.cacheFileDir)) {
			fs.closeSync(fs.openSync(this.cacheFileDir, 'w'))
		}
	}

	async getAll() {
		return await this.readCacheFileContent()
	}

	async get(key) {
		const fileContent = await this.readCacheFileContent()
		return fileContent[key]
	}

	async setObjects(objects) {
		return await this.writeCacheFileContent(objects)
	}

	async readCacheFileContent() {
		try {
			let cacheFileContent = await Utils.readFile(this.cacheFileDir)
			if (typeof cacheFileContent === 'string' && cacheFileContent.length) {
				cacheFileContent = JSON.parse(cacheFileContent)
			}
			return Object.keys(cacheFileContent).length ? cacheFileContent : {}
		} catch (error) {
			throw Error.CANNOT_READ_CACHE_FILE
		}
	}

	async writeCacheFileContent(newObjects) {
		try {
			let fileContentAsJson = await this.readCacheFileContent()
			fileContentAsJson = Utils.updateObjectPropsFromNewArray(fileContentAsJson, newObjects)

			const newFileContent = JSON.stringify(fileContentAsJson)
			await Utils.writeFile(this.cacheFileDir, newFileContent)
			return fileContentAsJson
		} catch (error) {
			throw Error.CANNOT_WRITE_CACHE_FILE
		}
	}
}

module.exports = FileCacher;