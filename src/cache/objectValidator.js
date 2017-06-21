'use strct'

const Error = require('../common/error');

class ObjectsValidator {
    constructor() { }

    static validateObjects(objectsToValidate) {
        objectsToValidate.forEach((element) => {
            if (typeof element !== 'object') {
                throw Error.INVALID_CACHE_OBJECT
            }
        });
    }
}

module.exports = ObjectsValidator