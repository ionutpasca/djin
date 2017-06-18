'use strict'

const Error = require('../common/error')
const FileCache = require('./fileCache')
const MemoryCache = require('./memoryCache')
const ObjectValidator = require('./objectValidator')

class Cache {
	constructor() { }

	static async initialize() {
		this.MemoryCacher = new MemoryCache()
		this.FileCacher = new FileCache()

		const fileCacheContent = await this.FileCacher.getAll()
		const cacheData = fileCacheContent
			? this.MemoryCacher.setObjects([].concat(fileCacheContent))
			: null
		return cacheData
	}

	static get(key) {
		return this.MemoryCacher.get(key)
	}

	static getDeep(keyList) {
		if (!keyList.length) {
			return null
		}
		if (keyList.length === 1) {
			return this.MemoryCacher.get(keyList[0])
		}

		let baseValue = this.MemoryCacher.get(keyList[0])
		if(!baseValue) {
			return null
		}
		for (let i = 1; i < keyList.length; i++) {
			baseValue = baseValue[keyList[i]]
		}
		return baseValue
	}

	static async set(key, value) {
		if (!key && key !== 0) {
			throw Error.CACHE_KEY_CANNOT_BE_NULL
		}

		const objToSave = getBaseCacheObject();
		objToSave[key] = value;
		try {
			return await this.saveObjects(objToSave)
		} catch (error) {
			throw error
		}
	}

	static async setObjects(objects) {
		objects = [getBaseCacheObject()].concat(objects)

		try {
			ObjectValidator.validateObjects(objects)
			return await this.saveObjects(objects)
		} catch (error) {
			throw error
		}
	}

	static async saveObjects(objects) {
		objects = [].concat(objects)
		const newCache = this.MemoryCacher.setObjects(objects)
		await this.FileCacher.setObjects(objects)
		return newCache
	}
}

function getBaseCacheObject() {
	return { latestCacheSave: new Date() }
}


module.exports = Cache