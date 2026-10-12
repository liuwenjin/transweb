let env = require("../custom/env.js");

const config = {
  dbConfig: {
    visualTool: {
      host: env.get("MONGO_HOST"),
      port: env.get("MONGO_PORT"),
      type: "mongo",
      database: env.get("MONGO_DATABASE"),
      username: env.get("MONGO_USERNAME"),
      password: env.get("MONGO_APP_PWD"),
    },
    exampleUrl:
      "mongodb://" +
      encodeURIComponent(env.get("MONGO_USERNAME")) +
      ":" +
      encodeURIComponent(env.get("MONGO_APP_PWD")) +
      "@" +
      env.get("MONGO_HOST") +
      ":" +
      env.get("MONGO_PORT") +
      "/" +
      env.get("MONGO_DATABASE"),
  },
  apiFiles: {
    user: "test.js",
    gpt: "gpt.js",
    admin: "admin.js"
  },
  limitConfig: {
    urls: [/visualTool\/account$/, /\/bucket\/personal/]
  }
}
module.exports = config;
