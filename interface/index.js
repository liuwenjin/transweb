let env = require("../custom/env.js");

const config = {
  dbConfig: {
    visualTool: {
      host: env.get("MONGO_HOST"),
      port: env.get("MONGO_PORT"),
      type: "mongo",
      database: env.get("MONGO_DATABASE"),
      // 凭据改为可选：MongoDB 未开启鉴权时留空即可无凭据连接
      username: env.opt("MONGO_USERNAME"),
      password: env.opt("MONGO_APP_PWD"),
      // 用户创建在 admin 库时需配置 MONGO_AUTH_SOURCE=admin
      authSource: env.opt("MONGO_AUTH_SOURCE"),
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
    admin: "admin.js",
    apiKey: "apiKey.js"
  },
  limitConfig: {
    urls: [/visualTool\/account$/, /\/bucket\/personal/]
  }
}
module.exports = config;
