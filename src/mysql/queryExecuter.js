'use strict';

class QueryExecuter {
	constructor() { }

	static executeSimpleQuery(connection, queryOptions, maintainConnection) {
		return new Promise(function (resolve, reject) {
			connection.query(queryOptions, (err, result) => {
				if (err) {
					connection.release()
					return reject(err)
				}
				if (!maintainConnection) {
					connection.release()
				}
				resolve(result)
			})
		})
	}

	// async executeQuery(connection, query, data) {
	// 	data = [].concat(data);
	// 	try {
	// 		const result = await connection.query(query, data)
	// 		const finalResult = result.insertId ? result.insertId : false;
	// 		return finalResult;
	// 	} catch (err) {
	// 		connection.release()
	// 		throw err
	// 	}
	// }
}

module.exports = QueryExecuter