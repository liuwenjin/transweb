var WebTool = require("./WebTool.js");
var mysql = require("mysql");
const neo4j = require('neo4j-driver');

const { MongoClient } = require('mongodb');
// 全局 Client 缓存
const clientCache = new Map();

// 改进版：准确判断 旧版 3.x/4.x 驱动下的连接状态
function isClientConnected(client) {
  if (!client) return false;
  
  // 1. 检查 isConnected 函数 (支持 3.x 和 4.x)
  if (typeof client.isConnected === 'function') {
    return client.isConnected();
  }
  
  // 2. 检查 topology 属性
  if (client.topology) {
    if (typeof client.topology.isConnected === 'function') {
      return client.topology.isConnected();
    }
    // 3. 检查 topology 是否已被关闭
    if (client.topology.s && client.topology.s.state === 'closed') {
      return false;
    }
  }

  return true;
}

// 获取或重新连接 MongoClient
async function getOrCreateClient(d) {
  const cacheKey = `${d.host}:${d.port}_${d.username || 'guest'}_${d.database}`;

  // 检查缓存中是否有连通的 client
  if (clientCache.has(cacheKey)) {
    const existingClient = clientCache.get(cacheKey);
    if (isClientConnected(existingClient)) {
      return existingClient;
    }
    // 如果连接已关闭或断开，清掉缓存准备重新连接
    console.log("检测到旧连接已关闭/断开，正在重新建立连接...");
    clientCache.delete(cacheKey);
  }

  // 拼接连接 URL
  let url = `mongodb://${d.host}:${d.port}/${d.database}`;

  if (d.username && d.password) {
    // 凭据需 URL 编码，避免含 @ : / # 等特殊字符时解析出错
    const user = encodeURIComponent(d.username);
    const pwd = encodeURIComponent(d.password);
    url = `mongodb://${user}:${pwd}@${d.host}:${d.port}/${d.database}`;
  }

  // 可选 authSource：用户创建在 admin 库时需配置 MONGO_AUTH_SOURCE=admin
  if (d.authSource) {
    url += (url.indexOf("?") === -1 ? "?" : "&") + "authSource=" + encodeURIComponent(d.authSource);
  }

  console.log("###mongodb url: ", url);

  // 创建新的 Client 实例
  const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000
  });

  await client.connect();
  
  // 重写该 client 的 close 方法，防止被 task.dbQuery 内部误杀关闭
  client.close = function () {
    // 屏蔽业务代码主动调用 close，保持单例常驻
    console.warn("拦截到业务代码试图关闭复用连接池 (client.close)，已强制阻止以保障连接池复用。");
  };

  clientCache.set(cacheKey, client);
  return client;
}


var data = {
  
  mongo: async function (req, res, d, task) {
  if (!d || !d.host) {
    WebTool.requestTool.sendData({
      ret: 1,
      message: "数据库不存在，缺少host。"
    }, req, res);
    return false;
  }

  d.port = d.port || 27017;
  d.database = d.database || "test";

  try {
    // 获取 MongoClient 客户端实例
    const client = await getOrCreateClient(d);

    if (typeof task.dbQuery === "function") {
      // 关键改动：将 client 直接作为第四个参数传入！
      // 这样 task.dbQuery 内部执行 db.db(d.database) 时，实际上是调用 client.db(d.database)，完美兼容
      task.dbQuery(req, res, d, client);
    } else {
      WebTool.requestTool.sendData({
        ret: 1,
        message: "暂时不支持该接口。"
      }, req, res);
    }
  } catch (err) {
    console.error("MongoDB 复用连接池获取/连接失败:", err.message);
    if (err.codeName === "AuthenticationFailed" || /Authentication failed/i.test(err.message || "")) {
      console.error(
        "提示：MongoDB 鉴权失败。请检查 .env 中 MONGO_USERNAME / MONGO_APP_PWD 是否与 MongoDB 中创建的用户一致；" +
          "若 MongoDB 未开启鉴权，请将这两项留空；若用户创建在 admin 库，请设置 MONGO_AUTH_SOURCE=admin。"
      );
    }
    WebTool.requestTool.sendData({
      ret: 1,
      message: "数据库连接失败。"
    }, req, res);
  }
},
  mysql: function (req, res, d, task) {
    if (!d || !d.host) {
      WebTool.requestTool.sendData({
        ret: 1,
        message: "数据库不存在，缺少host。"
      }, req, res);
      return false;
    }

    d.port = d.port || 3306;
    d.database = d.database || "test";
    console.log(d);
    var pool = mysql.createPool(d);
    pool.getConnection(function (err, connection) {
      if (err) {
        console.log(err);
        WebTool.requestTool.sendData({
          ret: 1,
          message: `数据库连接失败。`,
          dbInfo: d,
        }, req, res);
        return false;
      };
      // console.log("数据库已创建!");
      if (typeof (task.dbQuery) === "function") {
        task.dbQuery(req, res, d, connection);
      } else {
        WebTool.requestTool.sendData({
          ret: 1,
          message: `暂时不支持该接口。`
        }, req, res);
      }
    });
  },
  neo4j: function (req, res, d, task) {
    if (!d || !d.host) {
      WebTool.requestTool.sendData({
        ret: 1,
        message: "数据库不存在，缺少host。"
      }, req, res);
      return false;
    }
    var uri = 'bolt://' + d.host;
    try {
      const driver = neo4j.driver(uri, neo4j.auth.basic(d.username, d.password));
      if (typeof (task.dbQuery) === "function") {
        task.dbQuery(req, res, d, driver);
      } else {
        WebTool.requestTool.sendData({
          ret: 1,
          message: `暂时不支持该接口。`
        }, req, res);
      }
    } catch (e) {
      WebTool.requestTool.sendData({
        ret: 1,
        data: d,
        message: "连接数据库失败。"
      }, req, res);
      return false;
    }
  }
}

// 暴露给鉴权中间件复用同一个 MongoClient 单例
data.getClient = getOrCreateClient;

module.exports = data;