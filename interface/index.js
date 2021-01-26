const config = {
    mongodb: {
        test: {
            host: "localhost",
            port: "27017",
            type: "mongo",
            dbName: "test"
        },
        abc: {
            host: "localhost",
            port: "27017",
            type: "mongo",
            dbName: "abc"
        }
    },
    apiFiles: {
        customTest: "test.js",
        customAbc: "abc.js"
    }
}


module.exports = config;