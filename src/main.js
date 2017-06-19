'use strict'

const testJson = {
  users: {
    select: ['email'],
    bill_details: ['*']
  }
}

const Djin = require('./core/index')

const djin = new Djin({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'erp'
})

djin.initialize()
  .then(() => {
    return djin.select(testJson)
  })
  .then((result) => {
    console.log(`RESULT: ${result}`)
  })
  .catch((err) => {
    console.log(`ERR: ${err}`)
  })

