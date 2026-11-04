let env = require("../custom/env.js");

// 可选凭据：MongoDB 未开启鉴权时留空，不应因 exampleUrl 而强制要求用户名/密码
const _mongoUser = env.opt("MONGO_USERNAME");
const _mongoPwd = env.opt("MONGO_APP_PWD");
const _mongoCreds = _mongoUser
  ? encodeURIComponent(_mongoUser) + ":" + encodeURIComponent(_mongoPwd) + "@"
  : "";

const config = {
  dbConfig: {
    visualTool: {
      host: env.get("MONGO_HOST"),
      port: env.get("MONGO_PORT"),
      type: "mongo",
      database: env.get("MONGO_DATABASE"),
      // 凭据改为可选：MongoDB 未开启鉴权时留空即可无凭据连接
      username: _mongoUser,
      password: _mongoPwd,
      // 用户创建在 admin 库时需配置 MONGO_AUTH_SOURCE=admin
      authSource: env.opt("MONGO_AUTH_SOURCE"),
    },
    exampleUrl:
      "mongodb://" +
      _mongoCreds +
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
