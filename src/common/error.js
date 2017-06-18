'use strict'

class DjinError extends Error {
	constructor(message) {
		super()

		this.message = `${message}`
		this.stack = (new Error()).stack
	}
}

module.exports.INVALID_JSON = () => new DjinError('Invalid JSON')
module.exports.UNABLE_TO_CONNECT = () => new DjinError('Unable to connect to MySql server')
module.exports.UNINITIALIZED_POOL = () => new DjinError('Connection Pool uninitialized')
module.exports.UNINITIALIZED_PATH_GENERATOR = () => new DjinError('Path generator uninitialized')

module.exports.CACHE_KEY_CANNOT_BE_NULL = () => new DjinError('Key to be stored in cache cannot be null or undefined')
module.exports.INVALID_CACHE_OBJECT = () => new DjinError('Invalid object for caching')
module.exports.CANNOT_READ_CACHE_FILE = () => new DjinError('Cannot read from cache file. Check file existance and permissions')
module.exports.CANNOT_WRITE_CACHE_FILE = () => new DjinError('Cannot write into cache file. Check file existance and permissions')