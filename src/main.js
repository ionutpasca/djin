// module.exports = require('./core/index')

const Djin = require('./core/index')

const djin = new Djin({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'test'
})

const testJson = {
    users: {
        select: ['name'],
        roles: 'name',
        messages: {}
    },
    messages: {

    }
}

doMagic()
async function doMagic() {
    await djin.initialize()
    try {
        console.time('query')
        const result = await djin.select(testJson);
        console.timeEnd('query')
        var trt = 4;
    } catch (err) {
        var xs = 5;
    }
}
