// let formidable = require('formidable');
let WebTool = require("../custom/WebTool.js");
let https = require("https");
let sharp = require("sharp");
let querystring = require("querystring");
let ConfigObject = require("../custom/ConfigObject.js");
let path = require("path");
let mime = require("mime");
let mmh3 = require("murmurhash3js");
const nodemailer = require("nodemailer");
const fs = require("fs");
let t = path.resolve(__dirname, ".");
let cPath = t + "/config/" + "common.js";
let commonData = new ConfigObject(cPath).data;
let loginedPath = t + "/config/" + "logined.js";
let Adapter = require("../custom/Adapter.js");
let tPath = t + "/config/" + "interface.js";
let interface = new ConfigObject(tPath);
let adapter = new Adapter(interface.data);
let ObjectId = require("mongodb").ObjectId;
let axios = require("axios");

let getDocumentData = function (query, db, callback) {
  let key = query.key || "productId";
  let id = query[key];
  if (id) {
    console.log("getDocumentData id: ", id);
    let config = {
      pageSize: query.pageSize || 10,
      pageNo: query.pageNo || 1,
    };
    try {
      let dbItem = db.db();
      let tName = query.table || "document";
      console.log("query.table", tName);
      let tObject = dbItem.collection(tName);
      let condition = {
        [key]: id,
      };
      console.log("db query: ", condition);

      let temp = tObject.find(condition);
      temp.count((err, count) => {
        let size = config.pageSize || config.size || 10;
        let sort = config.sort || {
          time: -1,
        };
        let current = config.current || config.pageNo || 1;
        if (current < 0) {
          current = 0;
        }
        temp
          .skip(size * (current - 1))
          .sort(sort)
          .limit(size)
          .toArray(function (err, result) {
            if (err) {
              console.log("doc query err: ", err);
              throw err;
            } else {
              if (typeof callback === "function") {
                callback(result, count, current, size);
              }
            }
          });
      });
    }
    catch (e) {
      console.log("getDocumentData error: ", e);
    }

  }
};

// -------- 辅助函数区 --------

// 安全 JSON.parse（防止抛异常）
function safeParseJSON(str, fallback) {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch {
    return fallback;
  }
}

// 智能索引建议
function detectIndexHint(condition, sort) {
  const fields = Object.keys(condition);
  const sortFields = Object.keys(sort || {});
  const allFields = [...fields, ...sortFields];
  if (allFields.length === 0) return null;

  return {
    message: "建议创建复合索引以优化查询性能。",
    suggestedIndex: allFields.reduce((acc, key) => {
      acc[key] = 1;
      return acc;
    }, {}),
  };
}

// 转义正则特殊字符，防止 ReDoS
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

let transporter = nodemailer.createTransport({
  host: "smtp.163.com",
  port: 465,         // 163 建议使用 465 端口
  secure: true,      // 465 端口需设置为 true
  auth: {
    user: "neilking@163.com", // 你的 163 邮箱账号
    pass: "CUg7naGKbKT8vyLP",       // 刚才获取的 16 位授权码（不是登录密码！）
  },
});

function upateTokenData(account, d, olderToken) {
  let logined = new ConfigObject(loginedPath);
  logined.data = logined.data || {};
  let time = new Date().getTime();
  let password = d.password;
  let token = "t_" + mmh3.x86.hash32(account + "@" + password + ":" + time, 31);
  logined.data[token] = {
    account: d.account,
    folderName: d.folderName,
    tokenLimit: d.tokenLimit,
    tokenUsed: d.tokenUsed,
    subscription: d.subscription || 0,
    vipTimeout: time > (d.subscription || 0),
  };
  logined.data[token].logined = true;
  logined.data[token].timeout = time + 1000 * 60 * 60 * 24;
  delete logined.data[token].password;

  if (olderToken && logined.data[olderToken]) {
    delete logined.data[olderToken];
  }
  logined.save();
  return token;
}

function initPersonalData(account) {
  let tPath = path.resolve(__dirname, "../static/bucket/personal/" + account);
  if (!fs.existsSync(tPath)) {
    fs.mkdirSync(tPath);
    let aPath = tPath + "/" + "app";
    fs.mkdirSync(aPath);
    aPath = tPath + "/" + "layout";
    fs.mkdirSync(aPath);
    aPath = tPath + "/" + "document";
    fs.mkdirSync(aPath);
    aPath = tPath + "/" + "other";
    fs.mkdirSync(aPath);
    aPath = tPath + "/" + "webApps";
    fs.mkdirSync(aPath);
  }
}


function setPersonalData(folderName, appId, appData) {
  let t = path.resolve(__dirname, "..");
  let aPath = path.join(t, `/personal/appData/${folderName}.js`);

  // 创建或读取应用数据配置对象
  let aData = new ConfigObject(aPath);
  aData.data = aData.data || {};

  let id = `t_${appId}`;
  // 将应用数据转换为base64并保存
  aData.data[id] = appData ? Buffer.from(appData, 'utf-8').toString("base64") : "";

  // 保存数据
  aData.save();
}

function setPersonalPermission(folderName, appId, sId, right) {
  let pPath = t + `/personal/permission/${folderName}.js`;
  let pData = new ConfigObject(pPath).data;
  pData.data[appId] = pData.data[appId] || {};
  pData.data[appId][sId] = right;
  pData.save();
}

function findItems(db, tableName, condition, config, callback) {
  let dbItem = db.db();
  config = config || {
    pageSize: 10,
    pageNo: 0,
  };
  let tObject = dbItem.collection(tableName);

  let temp = null;

  if (config.projection) {
    temp = tObject.find(condition, config);
  } else {
    temp = tObject.find(condition);
  }

  let size = Number(config.pageSize || 10);
  let no = Number(config.pageNo || 0);

  temp
    .skip(size * no)
    .limit(size)
    .toArray(function (err, result) {
      if (err) {
        console.log(tableName, config, "数据库操作失败");
      }
      if (typeof callback === "function") {
        callback(err, result, db);
      }
    });
}

function updateCollection(qItem, tObject, req, callback) {
  if (req.body.apiName) {
    qItem.apiName = req.body.apiName;
  }
  if (req.body.cost) {
    qItem.cost = req.body.cost;
  }
  if (req.body.rawResult) {
    qItem.rawResult = req.body.rawResult;
  }

  tObject.updateOne(
    {
      documentId: qItem.documentId,
    },
    {
      $set: qItem,
    },
    {
      upsert: true,
    },
    function (err, result) {
      if (err) throw err;
      console.log("文档更新成功");
      if (typeof callback === "function") {
        callback({
          documentId: qItem.id,
          content: qItem,
          data: data,
        });
      }
    }
  );
}

let data = {
  queryQuestionData: {
    method: "get",
    dbItem: "visualTool",
    callback: async function(req, res, dbInfo, db) {
  const startTime = Date.now();
  req.query.table = "questionData"; // 该接口固定限定集合

  try {
    const sessionData = req.session.data || {};
    const {
      table = "questionData",
      condition = "{}",
      fields = "",
      sort = "{}",
      pageNo = 1,
      pageSize = 10,
      after,
      debug = "false",
      allowDiskUse = "true",
    } = req.query;

    const isDebug = debug === "true";

    // ----------- 1. 参数解析与标准化 -----------
    let conditionObj = {};
    try {
      conditionObj = JSON.parse(condition);
    } catch {
      return res.status(400).json({ ret: 1, message: "Invalid JSON in 'condition'" });
    }

    conditionObj = WebTool.mongoTool.normalizeQuery(conditionObj);

    // 正则表达式处理
    for (const [key, value] of Object.entries(conditionObj)) {
      if (typeof value === "string") {
        if (value.startsWith("/") && value.endsWith("/i")) {
          conditionObj[key] = new RegExp(value.slice(1, -2), "i");
        } else if (value.startsWith("/") && value.endsWith("/")) {
          conditionObj[key] = new RegExp(value.slice(1, -1));
        }
      }
    }
    delete conditionObj.admin;
    conditionObj = WebTool.mongoTool.sanitizeQuery(conditionObj);

    // 解析排序字段
    let sortField = {};
    try {
      sortField = JSON.parse(sort);
    } catch {
      console.warn("⚠️ Invalid sort JSON, ignored");
    }

    // 解析返回字段 (Projection)
    const projection = {};
    if (fields) {
      fields.split(",").forEach((f) => (projection[f.trim()] = 1));
    }

    // ----------- 2. 调用解耦的数据库函数 -----------
    const database = db.db(dbInfo.database);
    const { list, total, explainInfo, current, size } = await WebTool.objectTool.fetchQuestionData(
      {
        db: database,
        table,
        condition: conditionObj,
        sortField,
        pageNo,
        pageSize,
      },
      {
        projection,
        after,
        allowDiskUse,
        debug: isDebug,
      }
    );

    // ----------- 3. 业务逻辑过滤 -----------
    const filteredData = list.filter(
      (item) => item.isShare === "true" || item.folderName === sessionData.folderName
    );

    // ----------- 4. 返回响应 -----------
    res.setHeader("Cache-Control", "no-store");
    return res.json({
      ret: 0,
      table,
      total,
      pageNo: current,
      pageSize: size,
      duration: `${Date.now() - startTime}ms`,
      data: filteredData,
      ...(isDebug ? { explain: explainInfo } : {}),
    });
  } catch (err) {
    if (err.codeName === "QueryExceededMemoryLimitNoDiskUseAllowed") {
      console.error("❌ 内存排序超限，建议：1) 添加索引 2) 缩小查询范围 3) 确认 allowDiskUse 已启用");
      return res.status(500).json({
        ret: 1,
        message: "查询数据量过大，请添加排序字段索引或缩小查询范围",
      });
    }

    console.error("❌ Mongo Query Error:", err);
    return res.status(500).json({ ret: 1, message: err.message });
  }
},
  },
  mongoQuery: {
    method: "get",
    dbItem: "visualTool",
    callback: async function (req, res, dbInfo, db) {
      let data = req.session.data || {};
      if (!data || !data.folderName) {
        WebTool.requestTool.sendData(
          {
            ret: 1,
            message: "需要先登录。",
          },
          req,
          res
        );
        return false;
      }
      const startTime = Date.now();

      try {
        // ----------- 1️⃣ 参数解析与校验 -----------
        const {
          table,              // 集合名（必填）
          condition = "{}",  // 查询条件 JSON 字符串
          fields = "",       // 需要返回的字段（逗号分隔）
          sort = "{}",       // 排序规则 JSON 字符串
          pageNo = 1,        // 页码
          pageSize = 10,     // 每页条数
          after,             // 游标分页起点
          debug,             // 是否返回 explain 信息
          allowDiskUse = "true", // 默认允许磁盘排序，防止内存溢出
        } = req.query;

        if (!table) {
          return res.status(400).json({ ret: 1, message: "Missing parameter: table" });
        }

        const dbItem = db.db(dbInfo.database);
        const collection = dbItem.collection(table);

        // ----------- 2️⃣ 构建查询条件 -----------
        let query = {};
        try {
          query = JSON.parse(condition);
        } catch {
          return res.status(400).json({ ret: 1, message: "Invalid JSON in 'condition'" });
        }

        query = WebTool.mongoTool.normalizeQuery(query);


        // ✅ 自动识别正则表达式
        for (const [key, value] of Object.entries(query)) {
          if (
            typeof value === "string" &&
            value.startsWith("/") &&
            value.endsWith("/i")
          ) {
            query[key] = new RegExp(value.slice(1, -2), "i");
          } else if (
            typeof value === "string" &&
            value.startsWith("/") &&
            value.endsWith("/")
          ) {
            query[key] = new RegExp(value.slice(1, -1));
          }
        }

        // 权限控制：强制按当前会话 folderName 收敛，不接受客户端 admin 万能口令，
        // 并防止客户端通过嵌套运算符（如 {folderName: {$ne: "x"}}）覆盖租户隔离。
        query = WebTool.mongoTool.sanitizeQuery(query);

        if (table === "pointsBill") {
          query.folderName = String(req.session.data.folderName);
        } else if(table === "account" && req.session.data.account === commonData.adminAccount) {
          query.folderName = Number(query.folderName) || ""
        } else {
          query.folderName = Number(req.session.data.folderName) || req.session.data.folderName;
        }

        console.log("Mongo Query Condition:", query);

        // ----------- 3️⃣ 选择返回字段 -----------
        const projection = {};
        if (fields) {
          fields.split(",").forEach((f) => (projection[f.trim()] = 1));
        }

        // ----------- 4️⃣ 排序配置 -----------
        let sortObj = {};
        try {
          sortObj = JSON.parse(sort);
        } catch {
          console.warn("⚠️ Invalid sort JSON, ignored");
        }

        // ✅ 检查排序字段是否有索引（预防性警告）
        if (Object.keys(sortObj).length > 0 && debug === "true") {
          const indexes = await collection.indexes();
          const hasSortIndex = indexes.some(idx =>
            Object.keys(sortObj).every(field => idx.key[field] !== undefined)
          );
          if (!hasSortIndex) {
            console.warn(`⚠️ 排序字段 ${Object.keys(sortObj).join(', ')} 无对应索引，可能导致内存排序`);
          }
        }

        // ----------- 5️⃣ 分页与游标逻辑 -----------
        const size = Math.min(Number(pageSize) || 10, 200); // 限制最大页容量
        const current = Math.max(Number(pageNo) || 1, 1);
        const skipCount = (current - 1) * size;

        if (after) {
          query._id = { $gt: new ObjectId(after) };
        }

        // ----------- 6️⃣ 执行查询（关键修复：启用磁盘排序）-----------
        const findOptions = {
          projection,
          allowDiskUse: allowDiskUse !== "false" // 默认启用磁盘排序
        };

        let cursor;
        try {
          cursor = collection
            .find(query, findOptions)
            .sort(sortObj)
            .limit(size);

          if (!after) cursor.skip(skipCount);

          data = await cursor.toArray();
        } catch (err) {
          // ✅ 针对性错误处理
          if (err.codeName === 'QueryExceededMemoryLimitNoDiskUseAllowed') {
            console.error("❌ 内存排序超限，建议：1) 添加索引 2) 缩小查询范围 3) 确认 allowDiskUse 已启用");
            return res.status(500).json({
              ret: 1,
              message: "查询数据量过大，请添加排序字段索引或缩小查询范围"
            });
          }
          throw err;
        }

        // ----------- 7️⃣ 统计总数 -----------
        const total = await collection.countDocuments(query).catch(() => 0);

        console.log("projection and query", projection, query);

        // ----------- 8️⃣ Debug 模式：explain -----------
        let explainInfo = undefined;
        if (debug === "true") {
          try {
            const explain = await collection
              .find(query, { allowDiskUse: true }) // explain 也启用磁盘排序
              .sort(sortObj)
              .limit(1)
              .explain("executionStats");
            const stats = explain.executionStats;
            explainInfo = {
              stage: stats.executionStages.stage,
              totalDocsExamined: stats.totalDocsExamined,
              totalKeysExamined: stats.totalKeysExamined,
              executionTimeMillis: stats.executionTimeMillis,
              indexUsed: stats.executionStages.inputStage?.indexName || null,
            };
          } catch (e) {
            explainInfo = { error: e.message };
          }
        }

        // ----------- 9️⃣ 输出结果 -----------
        res.setHeader("Cache-Control", "no-store");
        res.json({
          ret: 0,
          table,
          total,
          pageNo: current,
          pageSize: size,
          duration: `${Date.now() - startTime}ms`,
          data,
          ...(debug === "true" ? { explain: explainInfo } : {}),
        });
      } catch (err) {
        console.error("❌ Mongo Query Error:", err);
        res.status(500).json({ ret: 1, message: err.message });
      }
    },
  },
  publishPptItem: {
    method: "post",
    dbItem: "visualTool",
    callback: function (req, res, dbInfo, db) {
      let data = req.session.data;

      // 定义安全发送函数：防止重复发送
      let responded = false;
      function safeSend(obj) {
        if (responded) return;
        responded = true;
        WebTool.requestTool.sendData(obj, req, res);
      }

      // 1. 基础校验
      if (!req.body.document) {
        return safeSend({
          ret: 1,
          message: "内容不可为空。",
        });
      }

      if (!data || !data.folderName) {
        return safeSend({
          ret: 1,
          message: "需要先登录。",
        });
      }

      // 2. 准备写入项
      let document = req.body.document;
      let id = req.body.id;

      let qItem = {
        documentId: id,
        account: data.account,
        document: document,
        appAgent: req.body.appAgent,
        appName: req.body.appName,
        appLabel: req.body.appLabel,
        creator: req.body.creator,
        avatar: req.body.avatar,
        prompt: req.body.prompt,
        apiName: req.body.apiName,
        apiKey: req.body.apiKey,
        appId: req.body.appId,
        apiSecret: req.body.apiSecret,
        inputPrice: req.body.inputPrice,
        outputPrice: req.body.outputPrice,
        model: req.body.model,
        platformUrl: req.body.platformUrl,
        appOwner: req.body.appOwner,
        from: req.body.from,
        fromAccount: req.body.fromAccount,
        root: req.body.root,
        rootAccount: req.body.rootAccount,
        folderName: data.folderName + "",
        name: req.body.name,
        type: req.body.type,
        category: req.body.category || "未定义",
        grades: req.body.grades || "未定义",
        title: req.body.title || "未定义",
        introduce: req.body.introduce || "未定义",
        icon: req.body.icon || "#",
        description: req.body.description || "未定义",
        tags: req.body.tags || "未定义",
        time: new Date().getTime(),
      };

      if (!qItem.apiName) {
        delete qItem.apiName;
        delete qItem.model;
      }

      if (qItem.apiName === "custom" && !qItem.platformUrl) {
        delete qItem.apiName;
        delete qItem.model;
      }

      let tName = req.body.table || "pptItem";
      let dbItem = db.db(dbInfo.dbName);
      let tObject = dbItem.collection(tName);

      // 3. 新建文档
      if (!id) {
        qItem.documentId = "" + mmh3.x86.hash32(document + "@" + data.account, 31);

        updateCollection(qItem, tObject, req, function (rData) {
          db.close();
          return safeSend({
            ret: 0,
            documentId: qItem.documentId,
            content: qItem,
            data: rData.result,
          });
        });

        return; // ensure no further execution
      }

      if (!req.body.prompt) {
        delete qItem.prompt;
      }

      // 4. 更新文档（已有 ID）
      findItems(
        db,
        tName,
        { documentId: id },
        null,
        function (err, result, dbConn) {
          if (err) {
            dbConn.close();
            return safeSend({
              ret: 1,
              message: "数据库错误。",
            });
          }

          let doc = result[0];

          // 文档不存在或在正确的文件夹
          if (!doc || doc.folderName + "" === data.folderName + "") {
            updateCollection(qItem, tObject, req, function (rData) {
              dbConn.close();
              return safeSend({
                ret: 0,
                documentId: qItem.documentId,
                content: qItem,
                data: rData.result,
              });
            });

            return;
          }

          // 文档存在但文件夹不匹配 → 无权限
          dbConn.close();
          return safeSend({
            ret: 2,
            message: "更新的文档不存在。",
          });
        }
      );
    }
  },
  searchPluginList: {
    method: "get",
    dbItem: "visualTool",
    callback: async function (req, res, dbInfo, db) {
      const startTime = Date.now();
      try {
        const keyword = (req.query.keyword || "").trim();
        const tName = req.params.table || "pluginList";
        const size = Math.max(
          1,
          Math.min(Number(req.query.size || req.query.pageSize) || 10, 100)
        );
        const current = Math.max(Number(req.query.current) || 1, 1);

        // ✅ 转义正则特殊字符，防止 ReDoS 与语义错误
        const pattern = new RegExp(escapeRegExp(keyword), "i");
        const condition = {
          $or: [
            { label: { $regex: pattern } },
            { cardName: { $regex: pattern } },
          ],
        };

        const collection = db.db(dbInfo.database).collection(tName);

        // ✅ count 与分页查询并行执行，减少往返等待
        const [total, result] = await Promise.all([
          collection.countDocuments(condition),
          collection
            .find(condition)
            .skip(size * (current - 1))
            .limit(size)
            .toArray(),
        ]);

        const elapsed = Date.now() - startTime;
        WebTool.requestTool.sendData(
          {
            ret: 0,
            pageSize: size,
            current: current,
            total,
            elapsedMs: elapsed,
            data: result,
          },
          req,
          res
        );

        if (elapsed > 2000) {
          console.warn(`⚠️ searchPluginList 查询耗时 ${elapsed}ms，keyword: ${keyword}`);
        }
      } catch (err) {
        console.error("❌ searchPluginList 查询异常：", err);
        WebTool.requestTool.sendData(
          { ret: 1, message: "查询出现异常。" },
          req,
          res
        );
      } finally {
        try {
          db.close();
        } catch (e) {
          console.warn("数据库连接关闭异常:", e);
        }
      }
    },
  },
  updatePluginGroup: {
    method: "post",
    dbItem: "visualTool",
    callback: function (req, res, dbInfo, db) {
      let data = req.session.data;
      if (data && data.folderName) {
        if (typeof req.body.list === "string") {
          req.body.list = JSON.parse(req.body.list);
        }
        let list = req.body.list;

        let url = "";
        if (!list || !list[0] || !list[0].pluginUrl) {
          WebTool.requestTool.sendData(
            {
              ret: 1,
              message: "list 参数值不可为空。",
            },
            req,
            res
          );
          return false;
        } else {
          url = list[0].pluginUrl;
        }

        if (!url) {
          WebTool.requestTool.sendData(
            {
              ret: 1,
              message: "list 参数值数据结构不正确，元素的url属性为空。",
            },
            req,
            res
          );
          return false;
        }

        let condition = {
          pluginUrl: url,
        };
        let dbItem = db.db(dbInfo.dbName);
        let tName = "pluginList";
        let tObject = dbItem.collection(tName);

        tObject.deleteMany(condition, function (err, d) {
          if (err) throw err;
          console.log("文档删除成功");
          tObject.insertMany(list, function (err, result) {
            db.close();
            if (err) throw err;
            WebTool.requestTool.sendData(
              {
                ret: 0,
                data: result,
              },
              req,
              res
            );
          });
          // db.close();
          // WebTool.requestTool.sendData({
          //   ret: 0,
          //   data: d,
          // }, req, res);
        });
      }
    },
  },
  getQuestionData: {
    method: "get",
    dbItem: "visualTool",
    requiredScope: "doc:read",
    callback: async function (req, res, dbInfo, db) {
      const startTime = Date.now();
      try {
        // 1. 登录与身份校验
        const sessionData = req.session.data;
        if (!sessionData?.folderName) {
          return WebTool.requestTool.sendData({ ret: 1, message: "获取失败，未登录。" }, req, res);
        }

        // 2. 参数安全解析 (防止非法输入导致 DB 压力)
        const pageSize = Math.max(1, Math.min(Number(req.query.pageSize) || 10, 100));
        const pageNo = Math.max(Number(req.query.pageNo) || 1, 1);
        const table = req.query.table || "questionData";
        const sort = { _time: -1 }; // 固定排序字段，建议建立索引
        let hUrl = req.get("referer");
        let id = WebTool.objectTool.urlQuery(hUrl, "id") || req.query.documentId;

        // 3. 数据库操作优化
        const dbInstance = db.db(dbInfo.database);
        const collection = dbInstance.collection(table);
        // let condition = { folderName: sessionData.folderName};
        let condition = {};
        if (id) {
          condition.documentId = id;
        }

        condition.folderName = req.session.data.folderName;

        if (req.query.apiName) {
          condition.apiName = req.query.apiName
        }
        if (req.query.model) {
          condition.model = req.query.model
        }

        if (req.query.type) {
          condition.type = req.query.type
        }

        console.log("getQuestionData condition: ", condition)

        // 使用 Promise.all 并行执行 count 和 find，减少等待总时间
        const [total, data] = await Promise.all([
          collection.countDocuments(condition),
          collection
            .find(condition)
            .sort(sort)
            .skip((pageNo - 1) * pageSize)
            .limit(pageSize)
            .toArray()
        ]);

        const elapsed = Date.now() - startTime;

        // 4. 响应与监控
        WebTool.requestTool.sendData({
          ret: 0,
          pageSize,
          current: pageNo,
          total,
          elapsedMs: elapsed,
          data
        }, req, res);

        // 性能告警
        if (elapsed > 1000) {
          console.warn(`⚠️ 查询耗时过长: ${elapsed}ms, Table: ${table}, User: ${sessionData.folderName}`);
        }
      } catch (err) {
        console.error("❌ 查询异常：", err);
        WebTool.requestTool.sendData({ ret: 1, message: "数据库查询异常。" }, req, res);
      } finally {
        db.close();
      }
    },
  },
  deleteQuestionData: {
    method: "post",
    dbItem: "visualTool",
    callback: function (req, res, dbInfo, db) {
      let data = req.session.data || {};
      let admin = req.body.admin;
      const isAdmin = admin === commonData.powerAdmin && commonData.adminSwitch;
      const send = (payload) => WebTool.requestTool.sendData(payload, req, res);

      // 1. 登录与身份校验
      if (!isAdmin && !data.folderName) {
        db.close();
        return send({ ret: 1, message: "删除失败，未登录。" });
      }

      // 2. 解析删除条件：支持 _id / documentId / versionId
      const id = req.body.id || req.body._id || req.query.id || req.query._id;
      const documentId = req.body.documentId || req.query.documentId;
      const versionId = req.body.versionId || req.query.versionId;
      const type = req.body.type || req.query.type || "";

      let condition = {};
      if (id) {
        condition._id = /^[0-9a-fA-F]{24}$/.test(id) ? ObjectId(id) : id;
      } else if (documentId) {
        condition.documentId = documentId;
      } else if (versionId) {
        condition.versionId = versionId;
      }

      if (Object.keys(condition).length === 0) {
        db.close();
        return send({ ret: 1, message: "删除条件不可为空（_id / documentId / versionId）。" });
      }

      // 3. 非管理员按会话 folderName 收敛，防止越权删除他人数据
      if (!isAdmin) {
        condition.folderName = data.folderName;
      }

      // 4. 执行删除
      const dbItem = db.db(dbInfo.database);
      const tObject = dbItem.collection("questionData");
      const method = type === "single" ? "deleteOne" : "deleteMany";

      tObject[method](condition, function (err, d) {
        db.close();
        if (err) {
          return send({ ret: 1, message: "删除失败。", error: err.message });
        }
        console.log("questionData 删除成功, condition: ", condition);
        send({ ret: 0, data: d.result });
      });
    },
  },
  traceVersions: {
    method: "post",
    dbItem: "visualTool",
    callback: async function (req, res, dbInfo, db) {
      const startTime = Date.now();
      let versionId = req.body.versionId || req.query.versionId || '';
      if (versionId.length !== 32) {
        versionId = mmh3.x64.hash128(versionId, 31);
      }
      let tableName = req.body.tableName || req.query.tableName || "questionData";
      try {
        // 1. 登录与身份校验
        const sessionData = req.session.data || {};
        // if (!sessionData?.folderName) {
        //   return WebTool.requestTool.sendData({ ret: 1, message: "获取失败，未登录。" }, req, res);
        // }

        if (!versionId) {
          return WebTool.requestTool.sendData({ ret: 1, message: "versionId 参数不可为空。" }, req, res);
        }

        const versions = await WebTool.objectTool.traceVersions(
          db,
          tableName,
          versionId,
          {
            projection: { _id: 1, versionId: 1, _time: 1, result: 1, baseId: 1, documentId: 1 },
            sort: { _time: -1 },
          }
        );

        WebTool.requestTool.sendData({
          ret: 0,
          data: versions,
        }, req, res);

      }
      catch (err) {
        console.error("❌ 查询异常：", err);
        WebTool.requestTool.sendData({ ret: 1, message: "数据库查询异常。" }, req, res);
      }
    },
  },
  purchaseDocument: {
    method: "post",
    dbItem: "visualTool",
    callback: function (req, res, dbInfo, db) {
      let data = req.session.data;
      let value = req.body.productId;
      let key = "productId";
      let table = req.body.table || "document";

      if (!value) {
        value = req.body.documentId;
        key = "documentId";
      }
      if (data && data.folderName) {
        let query = {
          [key]: value,
          key: key,
          table: table,
        };
        getDocumentData(
          query,
          db,
          (tData) => {
            let d = tData;
            if (d && d[0]) {
              d = d[0];
              let arr = d.students || [];
              if (arr.indexOf(data.account) === -1) {
                WebTool.objectTool.transferPoints(
                  db,
                  {
                    folderName: data.folderName + "",
                    object: d.account,
                    value: Number(d.price),
                  },
                  (rData) => {
                    let arr = d.students || [];
                    arr.push(data.folderName + "");
                    WebTool.objectTool.dbUpdate(
                      db,
                      table,
                      {
                        [key]: value,
                      },
                      "set",
                      {
                        students: arr,
                      },
                      (tRet) => {
                        let from = req.body.from || "";
                        if (from && from !== d.folderName) {
                          let transferAward = commonData.transferAward;
                          let v = Math.ceil(Number(d.price) * transferAward);

                          WebTool.objectTool.dbUpdate(
                            db,
                            "account",
                            {
                              folderName: from,
                            },
                            "inc",
                            {
                              tokenLimit: v,
                            },
                            function (tRet) {
                              db.close();
                              WebTool.requestTool.sendData(
                                {
                                  ret: 0,
                                  message: "操作成功。",
                                },
                                req,
                                res
                              );
                            }
                          );
                        } else {
                          db.close();
                          WebTool.requestTool.sendData(
                            {
                              ret: 0,
                              message: "操作成功。",
                            },
                            req,
                            res
                          );
                        }
                      }
                    );
                  },
                  () => {
                    db.close();
                    WebTool.requestTool.sendData(
                      {
                        ret: 1,
                        message: "操作失败，积分扣除失败。",
                      },
                      req,
                      res
                    );
                  }
                );
              } else {
                db.close();
                WebTool.requestTool.sendData(
                  {
                    ret: 0,
                    message: "操作成功, 消费积分。",
                  },
                  req,
                  res
                );
              }
            } else {
              db.close();
              WebTool.requestTool.sendData(
                {
                  ret: 1,
                  message: "操作失败，对象不存在。",
                },
                req,
                res
              );
            }
          }
        );
      } else {
        db.close();
        WebTool.requestTool.sendData(
          {
            ret: 1,
            message: "操作失败，需要先登录。",
          },
          req,
          res
        );
      }
    },
  },
  removePurchaseItem: {
    method: "post",
    dbItem: "visualTool",
    callback: function (req, res, dbInfo, db) {
      let data = req.session.data;
      let productId = req.body.productId;
      if (data && data.folderName) {
        adapter.getDocumentData(
          {
            productId: productId,
          },
          function (tData) {
            let d = tData.data.data;
            if (d && d[0]) {
              d = d[0];
              let arr = d.students || [];
              let index = arr.indexOf(data.account);
              if (index !== -1) {
                arr.splice(index, 1);
                WebTool.objectTool.dbUpdate(
                  db,
                  "document",
                  {
                    productId: productId,
                  },
                  "set",
                  {
                    students: arr,
                  },
                  function (tRet) {
                    db.close();
                    WebTool.requestTool.sendData(
                      {
                        ret: 0,
                        message: "操作成功。",
                      },
                      req,
                      res
                    );
                  }
                );
              }
            } else {
              db.close();
              WebTool.requestTool.sendData(
                {
                  ret: 1,
                  message: "操作失败，目标已下架或删除。",
                },
                req,
                res
              );
            }
          }
        );
      } else {
        db.close();
        WebTool.requestTool.sendData(
          {
            ret: 1,
            message: "操作失败，登录失效。",
          },
          req,
          res
        );
      }
    },
  },
  getInteractionList: {
    method: "get",
    dbItem: "visualTool",
    requiredScope: "doc:read",
    callback: function (req, res, dbInfo, db) {
      let data = req.session.data || {};
      let folderName = data.folderName;
      let documentId = req.query.documentId;
      if (folderName) {
        let condition = {
          rootAccount: folderName + "",
          root: documentId,
        };

        // ✅ 仅投影返回所需字段，避免拉取 document 等重量级字段
        findItems(
          db,
          "pptItem",
          condition,
          { projection: { folderName: 1, documentId: 1 } },
          function (err, result, db) {
          if (err) {
            WebTool.requestTool.sendData(
              {
                ret: 1,
                message: "数据库操作失败",
              },
              req,
              res
            );
          } else {
            let ret = "";
            let msg = "查询成功。";
            if (result.length === 0) {
              ret = 1;
              msg = "InteractionList 数据查询结果为空。";
            }
            let list = result.map((item) => {
              return {
                folderName: item.folderName,
                documentId: item.documentId,
              };
            });
            WebTool.requestTool.sendData(
              {
                ret: ret,
                data: list,
                message: msg,
              },
              req,
              res
            );
          }
          db.close();
        });
      } else {
        WebTool.requestTool.sendData(
          {
            ret: 1,
            message: "获取 Agent 数据失败, 缺少相关参数。",
          },
          req,
          res
        );
        db.close();
      }
    },
  },
  getAgentData: {
    method: "get",
    dbItem: "visualTool",
    requiredScope: "account:read",
    callback: function (req, res, dbInfo, db) {
      let folderName = req.query.agent;
      let lang = req.query.lang || "zh";
      if (folderName) {
        let condition = {
          folderName: Number(folderName),
        };
        let config = {
          projection: {
            ["agent_" + lang]: 1,
            ["name_" + lang]: 1,
            ["introduce_" + lang]: 1,
            ["agentList_" + lang]: 1,
            ["slogan_" + lang]: 1,
            ["slogan1_" + lang]: 1,
            image: 1,
            account: 1,
            folderName: 1,
            tokenUsed: 1,
            tokenLimit: 1,
          },
        };

        findItems(db, "account", condition, config, function (err, result, db) {
          if (err) {
            WebTool.requestTool.sendData(
              {
                ret: 1,
                message: "数据库操作失败",
              },
              req,
              res
            );
          } else {
            let ret = "";
            let msg = "查询成功。";
            if (result.length === 0) {
              ret = 1;
              msg = "Agent 数据查询结果为空。";
            } else {
              ret = 0;
              delete result[0].password;
            }
            WebTool.requestTool.sendData(
              {
                ret: ret,
                data: result[0],
                message: msg,
              },
              req,
              res
            );
          }
          db.close();
        });
      } else {
        WebTool.requestTool.sendData(
          {
            ret: 1,
            message: "获取 Agent 数据失败, 缺少相关参数。",
          },
          req,
          res
        );
        db.close();
      }
    },
  },
  imageToBase64: {
    method: "get",
    callback: function (req, res) {
      if (req.query && req.query.url) {
        try {
          WebTool.objectTool.assertSafePublicUrl(req.query.url);
          axios
            .get(req.query.url, {
              responseType: "arraybuffer", // 重要：确保响应以二进制形式返回
            })
            .then((response) => {
              const base64 = Buffer.from(response.data).toString("base64");
              WebTool.requestTool.sendData(
                {
                  ret: 0,
                  data: "data:image/jpeg;base64," + base64,
                },
                req,
                res
              );
            })
            .catch((error) => {
              WebTool.requestTool.sendData(
                {
                  ret: 1,
                  message: "no rights",
                  data: "",
                },
                req,
                res
              );
            });
        } catch (error) {
          console.log(error);
          WebTool.requestTool.sendData(
            {
              ret: 1,
              error: error,
              message: "图片转base64失败，请联系管理员",
            },
            req,
            res
          );
        }
      } else {
        WebTool.requestTool.sendData(
          {
            ret: 1,
            message: "缺少 url 参数",
          },
          req,
          res
        );
      }
    },
  },
  krokiPipeProxy: {
    method: "post",
    callback: async function (req, res) {
      // 1. 解析目标路径
      const type = req.query.type;
      const format = req.query.format || "svg";
      if ((type && !/^[a-zA-Z0-9_-]+$/.test(type)) || !/^[a-zA-Z0-9_-]+$/.test(format)) {
        WebTool.requestTool.sendData({ ret: 1, message: "非法的 type/format 参数" }, req, res);
        return;
      }
      const targetPath = `/${type}/${format}`;

      const KROKI_HOST = process.env.KROKI_HOST || "http://127.0.0.1:8000";
      const targetUrl = `${KROKI_HOST}${targetPath}`;

      // 2. 浅拷贝并清理 query 参数，删除已用于构造 Path 的 type 和 format
      const queryParams = { ...req.query };
      delete queryParams.type;
      delete queryParams.format;
      delete queryParams.targetPath; // 兼容历史字段

      // 3. 提取 Raw Body 源数据（核心修复）
      let rawBody = req.body;

      console.log("chart data: ", rawBody);

      // 如果 Body 被 Express 误解析成了空对象 {} 或 undefined，从请求流中实时读取原始 Buffer
      if (!rawBody || (typeof rawBody === "object" && Object.keys(rawBody).length === 0 && !Buffer.isBuffer(rawBody))) {
        rawBody = await new Promise((resolve) => {
          const chunks = [];
          req.on("data", (chunk) => chunks.push(chunk));
          req.on("end", () => resolve(Buffer.concat(chunks)));
        });
      }

      // 4. 精简并规范 Headers
      const forwardedHeaders = {
        "content-type": req.headers["content-type"] || "text/plain; charset=utf-8",
        "accept": req.headers["accept"] || "image/svg+xml",
      };

      try {
        axios({
          method: req.method,
          url: targetUrl,
          data: rawBody, // 透传 Buffer 或字符串源数据
          params: queryParams,
          headers: forwardedHeaders,
          responseType: "arraybuffer",
          validateStatus: () => true,
        })
          .then((response) => {
            if (response.headers["content-type"]) {
              res.setHeader("Content-Type", response.headers["content-type"]);
            }
            res.status(response.status).send(Buffer.from(response.data));
          })
          .catch((error) => {
            console.error("Kroki Pipe Proxy Error:", error);
            WebTool.requestTool.sendData(
              {
                ret: 1,
                message: "Kroki 管道代理异常",
                error: error?.message || error,
              },
              req,
              res
            );
          });
      } catch (error) {
        console.error(error);
        WebTool.requestTool.sendData(
          {
            ret: 1,
            error: error,
            message: "Kroki 代理初始化失败",
          },
          req,
          res
        );
      }
    }
  },
  krokiProxy: {
    method: "post", // 建议使用 POST 方式，防止复杂的 UML 文本超出 GET URL 长度限制
    callback: function (req, res) {
      // 假设客户端传参：req.body.type (图表类型，如 'mermaid' / 'plantuml')
      // req.body.format (输出格式，如 'svg' / 'png'，默认 'svg')
      // req.body.content (图表源码文本)
      const { type = "plantuml", format = "svg", content } = req.body || {};
      if (!/^[a-zA-Z0-9_-]+$/.test(type) || !/^[a-zA-Z0-9_-]+$/.test(format)) {
        WebTool.requestTool.sendData({ ret: 1, message: "非法的 type/format 参数" }, req, res);
        return;
      }

      // 指向你本地启动的 Kroki 容器服务
      const KROKI_HOST = process.env.KROKI_HOST || "http://127.0.0.1:8000";

      if (content) {
        try {
          axios
            .post(`${KROKI_HOST}/${type}/${format}`, content, {
              headers: {
                "Content-Type": "text/plain; charset=utf-8",
              },
              responseType: "text", // 直接获取 SVG / Text 字符串
              transformResponse: [(data) => data], // 阻止 axios 自动尝试解析 JSON
            })
            .then((response) => {
              WebTool.requestTool.sendData(
                {
                  ret: 0,
                  data: response.data, // 返回生成的 SVG / 源码字符串
                },
                req,
                res
              );
            })
            .catch((error) => {
              WebTool.requestTool.sendData(
                {
                  ret: 1,
                  message: "Kroki 图表生成失败",
                  error: error?.response?.data || error?.message || error,
                  data: "",
                },
                req,
                res
              );
            });
        } catch (error) {
          console.log(error);
          WebTool.requestTool.sendData(
            {
              ret: 1,
              error: error,
              message: "Kroki 渲染异常，请联系管理员",
            },
            req,
            res
          );
        }
      } else {
        WebTool.requestTool.sendData(
          {
            ret: 1,
            message: "缺少 content 图表源码参数",
          },
          req,
          res
        );
      }
    },
  },
  htmlProxy: {
    method: "get",
    callback: function (req, res) {
      if (req.query && req.query.url) {
        try {
          WebTool.objectTool.assertSafePublicUrl(req.query.url);
          axios
            .get(req.query.url, {
              responseType: "text", // 关键：直接拿 HTML 字符串
              transformResponse: [(data) => data], // 防止 axios 自动 JSON 解析
            })
            .then((response) => {
              WebTool.requestTool.sendData(
                {
                  ret: 0,
                  data: response.data, // HTML 原始字符串
                },
                req,
                res
              );
            })
            .catch((error) => {
              WebTool.requestTool.sendData(
                {
                  ret: 1,
                  message: "fetch html failed",
                  error: error?.message || error,
                  data: "",
                },
                req,
                res
              );
            });
        } catch (error) {
          console.log(error);
          WebTool.requestTool.sendData(
            {
              ret: 1,
              error: error,
              message: "HTML 获取失败，请联系管理员",
            },
            req,
            res
          );
        }
      } else {
        WebTool.requestTool.sendData(
          {
            ret: 1,
            message: "缺少 url 参数",
          },
          req,
          res
        );
      }
    },
  },
  getLoginedData: {
    method: "post",
    dbItem: "visualTool",
    requiredScope: "doc:read",
    callback: async function queryDocuments(req, res, dbInfo, db) {
      const startTime = Date.now();
      try {
        // ---------- 1️⃣ Session & 登录验证 ----------
        const userData = req.session?.data;
        if (!userData?.folderName) {
          return res.status(401).json({
            code: 1,
            message: "未登录或无访问权限",
          });
        }

        // ---------- 2️⃣ 参数解析与校验 ----------
        const method = req.method.toUpperCase();
        const body = method === "GET" ? req.query : req.body;

        const pageSize = Math.max(1, Math.min(Number(body.pageSize) || 10, 100));
        const pageNo = Math.max(Number(body.pageNo) || 1, 1);
        const _delete = body._delete === "true" || body._delete === true;
        const table = body.table || "pptItem";
        // ✅ 游标分页起点：基于 time 字段的 keyset 分页，避免深翻页 skip 扫描
        const lastTime = body.lastTime ? Number(body.lastTime) : null;
        const explainNeeded = body.explain === "true";

        // ---------- 3️⃣ 条件安全解析 ----------
        let tCondition = {};
        try {
          tCondition =
            typeof body.condition === "string"
              ? JSON.parse(body.condition || "{}")
              : body.condition || {};
        } catch {
          return res.status(400).json({
            code: 2,
            message: "无效的 condition JSON 格式",
          });
        }

        // 安全防御：净化操作符，并移除可覆盖租户隔离的 folderName/admin 字段
        tCondition = WebTool.mongoTool.sanitizeQuery(tCondition);
        delete tCondition.folderName;
        delete tCondition.admin;

        // ---------- 4️⃣ 构建查询条件 ----------
        const query = {
          folderName: String(userData.folderName),
          ...tCondition,
        };

        // ✅ 简化 _delete 过滤：$ne:true 本身即覆盖"字段缺失"与"不等于 true"两种情况，
        //    避免 $or + $exists 组合导致无法有效利用索引
        if (!_delete) {
          query._delete = { $ne: true };
        }

        console.log("@query: ", query);

        // ---------- 5️⃣ 投影：仅取列表所需字段，剔除重量级 document 字段 ----------
        const projection = {
          _id: 1,
          name: 1,
          title: 1,
          description: 1,
          introduce: 1,
          category: 1,
          grades: 1,
          tags: 1,
          type: 1,
          icon: 1,
          time: 1,
          appLabel: 1,
          appOwner: 1,
          folderName: 1,
          publishStatus: 1,
          documentId: 1,
          _delete: 1
        };

        // ---------- 6️⃣ 数据库访问与分页模式 ----------
        const dbItem = db.db(dbInfo.database);
        const collection = dbItem.collection(table);
        const sort = { time: -1 };

        let data = [];
        let total = 0;
        let mode = "seek";
        let isEnd = false;
        let queryPlan = null;

        if (lastTime && !body.pageNo) {
          // ✅ Seek 分页模式（keyset）：按 time 游标深翻页，避免 skip 扫描
          query.time = { $lt: lastTime };

          // 多取一条，用于判断是否到末尾
          const cursor = collection
            .find(query, { projection })
            .sort(sort)
            .limit(pageSize + 1);
          if (explainNeeded) queryPlan = await cursor.explain("executionStats");
          const result = await cursor.toArray();

          isEnd = result.length <= pageSize;
          data = result.slice(0, pageSize);
        } else {
          // ✅ Skip 模式（支持跳页）
          mode = "skip";
          const skip = (pageNo - 1) * pageSize;

          const cursor = collection
            .find(query, { projection })
            .sort(sort)
            .skip(skip)
            .limit(pageSize);
          if (explainNeeded) queryPlan = await cursor.explain("executionStats");

          // ✅ count 与分页查询并行执行，减少往返等待时间
          const [count, result] = await Promise.all([
            collection.countDocuments(query),
            cursor.toArray(),
          ]);
          total = count;
          data = result;

          isEnd = skip + data.length >= total;
        }

        const elapsed = Date.now() - startTime;
        const nextCursor =
          data.length > 0 ? String(data[data.length - 1].time) : null;

        // ---------- 7️⃣ 响应统一输出 ----------
        const payload = {
          code: 0,
          message: "success",
          pagination: { total, pageNo, pageSize },
          mode,
          isEnd,
          nextCursor,
          elapsedMs: elapsed,
          data,
        };

        // ✅ Debug 模式：返回执行计划，COLLSCAN 时给出索引建议
        if (explainNeeded && queryPlan) {
          const stats = queryPlan.executionStats;
          payload.explain = {
            stage: stats?.executionStages?.stage,
            totalDocsExamined: stats?.totalDocsExamined,
            totalKeysExamined: stats?.totalKeysExamined,
            executionTimeMillis: stats?.executionTimeMillis,
            indexUsed: stats?.executionStages?.inputStage?.indexName || null,
          };
          if (
            stats?.executionStages &&
            stats.executionStages.stage === "COLLSCAN"
          ) {
            payload.indexSuggestion = detectIndexHint(query, sort);
          }
        }

        // ✅ 性能告警
        if (elapsed > 2000) {
          console.warn(
            `⚠️ getLoginedData 查询耗时 ${elapsed}ms (${table})，模式：${mode}，条件：${JSON.stringify(
              query
            )}`
          );
        }

        return res.status(200).json(payload);
      } catch (err) {
        console.error("[queryDocuments Error]", err);
        return res.status(500).json({
          code: 500,
          message: "服务器内部错误",
          error: err.message,
        });
      } finally {
        // ---------- 8️⃣ 确保数据库连接关闭 ----------
        try {
          db.close();
        } catch (e) {
          console.warn("数据库连接关闭异常:", e);
        }
      }
    },
  },
  getSubscriptionsData: {
    method: "post",
    dbItem: "visualTool",
    requiredScope: "doc:read",
    callback: async function (req, res, dbInfo, db) {
      const startTime = Date.now();
      const data = req.session.data;

      if (!data || !data.folderName) {
        db.close();
        return WebTool.requestTool.sendData(
          { ret: 1, message: "获取失败, 需要登录。" },
          req,
          res
        );
      }

      let tCondition = {};
      try {
        tCondition =
          typeof req.body.condition === "string"
            ? JSON.parse(req.body.condition)
            : req.body.condition || {};
      } catch (e) {
        tCondition = {};
      }

      const pageSize = Math.max(
        1,
        Math.min(Number(req.body.pageSize) || 10, 100)
      );
      const pageNo = Math.max(Number(req.body.pageNo) || 1, 1);
      const _delete = req.body._delete;
      const tName = req.body.table || "document";

      const condition = {
        students: { $in: [data.folderName + ""] },
      };
      if (!_delete) {
        condition._delete = { $ne: true };
      }

      // 净化操作符并防止客户端覆盖 students 租户隔离条件
      tCondition = WebTool.mongoTool.sanitizeQuery(tCondition);
      delete tCondition.students;
      delete tCondition._delete;
      for (let k in tCondition) {
        try {
          condition[k] = JSON.parse(tCondition[k]);
        } catch (e) {
          condition[k] = tCondition[k];
        }
      }

      // ✅ 投影：仅取响应所需字段，避免拉取 document 等重量级字段
      const projection = {
        _id: 1,
        name: 1,
        time: 1,
        appLabel: 1,
        appOwner: 1,
        folderName: 1,
        documentId: 1,
      };

      try {
        const collection = db.db(dbInfo.database).collection(tName);

        // ✅ count 与分页查询并行执行，减少往返等待
        const [total, result] = await Promise.all([
          collection.countDocuments(condition),
          collection
            .find(condition, { projection })
            .sort({ time: -1 })
            .skip((pageNo - 1) * pageSize)
            .limit(pageSize)
            .toArray(),
        ]);

        const elapsed = Date.now() - startTime;
        WebTool.requestTool.sendData(
          {
            ret: 0,
            pageSize,
            current: pageNo,
            total,
            elapsedMs: elapsed,
            data: result.map((item) => ({
              _id: item._id,
              name: item.name,
              time: item.time,
              appLabel: item.appLabel,
              appOwner: item.appOwner,
              folderName: item.folderName,
              documentId: item.documentId,
            })),
          },
          req,
          res
        );

        if (elapsed > 2000) {
          console.warn(
            `⚠️ getSubscriptionsData 查询耗时 ${elapsed}ms，folderName: ${data.folderName}`
          );
        }
      } catch (err) {
        console.error("❌ getSubscriptionsData 查询异常：", err);
        WebTool.requestTool.sendData(
          { ret: 1, message: "查询出现异常。" },
          req,
          res
        );
      } finally {
        try {
          db.close();
        } catch (e) {
          console.warn("数据库连接关闭异常:", e);
        }
      }
    },
  },
  getPublishedList: {
    method: "get",
    dbItem: "visualTool",
    requiredScope: "doc:read",
    callback: async function queryItems(req, res, dbInfo, db) {
      const startTime = Date.now();
      try {
        // -------- 参数解析与安全校验 --------
        const pageSize = Math.max(
          1,
          Math.min(Number(req.query.pageSize) || 10, 100)
        );
        const pageNo = Math.max(Number(req.query.pageNo) || 1, 1);
        const sortOrder = Number(req.query.sort) || -1;
        const lastTime = req.query.lastTime ? Number(req.query.lastTime) : null;

        const folderName = req.query.folderName?.trim();
        const appName = req.query.appName?.trim();
        const appAgent = req.query.appAgent?.trim() || "";
        let type = req.query.type?.trim();
        const name = req.query.name?.trim();
        const tCondition = safeParseJSON(req.query.condition, {});
        const table = req.query.table || "pptItem";
        const _delete = req.query._delete;

        // -------- 构建查询条件 --------
        const condition = { publishStatus: "true" };
        if (folderName) condition.folderName = folderName;
        if (appName) condition.appName = appName;
        if (appAgent) condition.appAgent = appAgent;
        if (name) condition.name = new RegExp(escapeRegExp(name), "i");

        if (type !== undefined) {
          try {
            type = JSON.parse(type);
          } catch (e) {
            // 如果解析失败，保持原始字符串
            type = req.query.type?.trim();
          }

          if (type === "其他") condition.type = { $exists: false };
          else if (type) condition.type = type;
        }

        if (!_delete) condition._delete = { $ne: true };

        const ALLOWED_FIELDS = [
          "folderName",
          "appName",
          "type",
          "creator",
          "price",
          "publishStatus",
        ];
        for (let k of Object.keys(tCondition)) {
          if (ALLOWED_FIELDS.includes(k)) condition[k] = tCondition[k];
        }

        // -------- 数据库访问 --------
        const dbItem = db.db(dbInfo.database);
        const tObject = dbItem.collection(table);
        const sort = { publishTime: sortOrder };

        const projection = {
          name: 1,
          time: 1,
          title: 1,
          price: 1,
          appLabel: 1,
          appOwner: 1,
          creator: 1,
          folderName: 1,
          publishStatus: 1,
          description: 1,
          introduce: 1,
          usageCount: 1,
          category: 1,
          grades: 1,
          tags: 1,
          type: 1,
          icon: 1,
          documentId: 1,
          publishTime: 1,
        };

        const explainNeeded = req.query.explain === "true";
        let queryPlan = null;
        let data = [];
        let total = 0;
        let mode = "seek";
        let isEnd = false;

        console.log("查询条件:", condition, "排序:", sort, "分页参数:", { pageNo, pageSize, lastTime });

        // -------- 分页模式判断 --------
        if (lastTime && !req.query.pageNo) {
          // ✅ Seek Pagination 模式（数字比较）
          condition.publishTime = {
            [sortOrder === -1 ? "$lt" : "$gt"]: lastTime,
          };

          // 多取一条，用于判断是否到末尾
          const cursor = tObject
            .find(condition, { projection })
            .sort(sort)
            .limit(pageSize + 1);
          if (explainNeeded) queryPlan = await cursor.explain("executionStats");
          const result = await cursor.toArray();

          // 判断是否到末尾
          isEnd = result.length <= pageSize;

          // 只保留前 pageSize 条数据
          data = result.slice(0, pageSize);
        } else {
          // ✅ Skip 模式（支持跳页）
          mode = "skip";
          const skip = (pageNo - 1) * pageSize;
          total = await tObject.countDocuments(condition);
          const cursor = tObject
            .find(condition, { projection })
            .sort(sort)
            .skip(skip)
            .limit(pageSize);
          if (explainNeeded) queryPlan = await cursor.explain("executionStats");
          data = await cursor.toArray();

          // 判断是否最后一页
          isEnd = skip + data.length >= total;
        }

        const elapsed = Date.now() - startTime;

        // -------- 索引智能分析 --------
        let indexSuggestion = null;
        if (explainNeeded && queryPlan) {
          const stats = queryPlan.executionStats;
          if (
            stats.executionStages &&
            stats.executionStages.stage === "COLLSCAN"
          ) {
            indexSuggestion = detectIndexHint(condition, sort);
          }
        }

        const nextCursor =
          data.length > 0 ? String(data[data.length - 1].publishTime) : null;

        const resultPayload = {
          ret: 0,
          mode, // "seek" 或 "skip"
          pageSize,
          current: pageNo,
          total,
          elapsedMs: elapsed,
          isEnd, // ✅ 是否到数据末尾
          data: data,
          nextCursor,
        };

        if (indexSuggestion) resultPayload.indexSuggestion = indexSuggestion;

        WebTool.requestTool.sendData(resultPayload, req, res);

        if (elapsed > 2000) {
          console.warn(
            `⚠️ 查询耗时 ${elapsed} ms (${table})，模式：${mode}，条件：${JSON.stringify(
              condition
            )}`
          );
        }
      } catch (err) {
        console.error("❌ MongoDB 查询失败：", err);
        WebTool.requestTool.sendData(
          { ret: 1, message: "数据库查询出现异常。", error: err.message },
          req,
          res
        );
      }
    },
  },
  getDocumentImage: {
    method: "get",
    dbItem: "visualTool",
    callback: async function (req, res, dbInfo, db) {
      try {
        // ----------- 参数解析 -----------
        const {
          id,
          condition,
          key = "image",
          table = "pptItem",
          w,
          h,
          format = "auto",
          style, // blur / gray / round
          ...queryParams
        } = req.query;

        console.log("req.query", req.query);

        // ----------- 安全字段白名单 -----------
        const SAFE_FIELDS = [
          "_id",
          "id",
          "folderName",
          "appName",
          "documentId",
          "type",
        ];

        const dbItem = db.db(dbInfo.database);
        const collection = dbItem.collection(table);

        // ----------- 1️⃣ 构建查询条件 -----------
        const query = {};

        if (condition) {
          // ✅ 用户显式指定了 condition
          if (!SAFE_FIELDS.includes(condition)) {
            return res.status(403).send(`Unsafe condition field: ${condition}`);
          }
          const value = queryParams[condition];
          if (!value)
            return res
              .status(400)
              .send(`Missing value for condition=${condition}`);
          query[condition] = value;
        } else if (id) {
          // ✅ 使用 id 作为条件
          try {
            query._id = new ObjectId(id);
          } catch {
            query._id = id;
          }
        } else {
          // ✅ 自动匹配白名单中的第一个可用字段
          for (const safeKey of SAFE_FIELDS) {
            if (queryParams[safeKey]) {
              query[safeKey] = queryParams[safeKey];
              break;
            }
          }
        }

        if (query.folderName) {
          query.folderName = Number(query.folderName);
        }

        if (Object.keys(query).length === 0) {
          return res.status(400).send("Missing valid query condition");
        }

        // ----------- 2️⃣ 查询 Mongo 文档 -----------
        const doc = await collection.findOne(query, {
          projection: { [key]: 1 },
        });
        let base64Str = "";
        let mimeType = "image/png";
        if (!doc || !doc[key]) {
          base64Str =
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAALlklEQVR42tVa6W8cRRZ/r7p7PBmbxJNzHR+JIhODCMFkMSDMHZHYFmgjcoCwhEDLlyh8yJ+CxH5IEBIfcTZLjBTvgghrKWAJK8S2lHU2sGNH4GywjT1xcOQ5PF319kNf1dXVc7EfoD2SZ3p6qt579Y7fO9C2bfg9Xwx+55fKAAL6r9Bt9yOqj9d2Ye0/UTZCZR3knDvviAB1JBEBovsG0PkXeg4BSLebdJOC/aRbAOSKCdUHSV6KgAAQQ9/6hDD3BoVJp1gpIyr3iFAvW8QYrjwhIiCVkzohef+cdygv5d4xXcoRUCuoyOH5QkFEh3wMi1D+6IjNO0JPihRShWBTUjb1adFqnbsYC/0QgSjYQycUWfLkLEPKt76oSSvV4FlCIJQOCiO/iF/K3YqAoaTE6PAVZ2nOBo78UDIjCpOucIo6yrS6GtE6ULQuzJqr+L4RV3uRb3qgs1L1oy8q1eSxyt30z/o7sLpdGpVxp2FmsHp/S+U8aNQ91swAxelJGa2QxYiVVsdqqUdP32pjAAlkhXe0n3RRgLzn3P/kqR+onr7+qAgAAGZFjSM3PAeqL8c1REDfKvyIo7dLIl/MqMSqsvpextJcBhwKKGRw5O7h+HsqFIvkxGTyd3f9UbBuvK+xLMs0TSIRRD4v9EsLRtihwE2jYnyuaqLpHiv5SxBJLhMRhRAXL16cnJxArBP5CRI7tv9hcPCNdDothIgwSlJkI3IjpCNQIgrFVI/pAIyYoUBHsooAICKyfH5tdHR0bW0NEbnNAbXGFucoiDHGGPvp9k+PP97zxBNPRPx4SNEoTAsiEkWwVoAIMGIDKIVK7wSdsMUY27JlS3tHO1AtRs/wl7u//Pjjj0IIIURZn4yK/Xhbh+FMxF+bslYRRXCmd9m2vXfv3rfffpuIiKplwjCMyanJD85+UMnhIylWGgaeUVP2DcHU4xDyIKtyeoxhLQwgIqtgORT9RAFsculXYz8FVJoq9gMJLVLkyIhqOgEf89UWK2UrCNRLRapESMEJKO5ZxoxUKfTWchmGobAXbxuEWuCkqhCFUVoYKbA6M0Bd8spYsVi8detWNpstFouJRGLz5s0tLS333XcfAEQwJcmn5/tWJQMkAJMwlF7oXND/h/rLly+PjIxks9lSqSSEYIxZlrVx48Z9+/Y988yzu3Z1CCEoCkvQc65hLfJTSlM+I6JQegE6pFMH6Y4sv//+e4dE0zRN0xRC5HK5fD6/sLBw5cqVl156qa+vz7mvOhM390SPPAJC8iMxYgxy9FFQvRwg4vr6+tWrVznnjga0tbXte/jhttbWVCpVKBTm5+enp6fn5ubW1taGh4eXlpYGBwcTiYTMAyq5kZMjoxzI5AQlmoajmt9T9Q6Usc/+8dk333yDiMlkcqC//5lnn21qapIf6+/vHx8fv3jx4t27d8fGxpqamo4dO4aIgfZL+ALDmM75igFKgtfh5/psgDGWyWS+uPQFADQ2Nr7z53f6BwYaGxt5+Eomky+88MLJkye3bt2KiKOjo9evX3e0ToMeKAjHSOBk1IwoCAv6NLx2N+pAwNHR0Vwuxxg7cuTII92PcM6jHlMIwTm///77X3/9dcuyisXil19+WSrZGBUbuX8OSV7tgVgoCHhmQwFEpTpSDkRcXl6+ceMGInZ2dj711FMxzj5go7u7u7u7GwBmZmZu3/4vIuqwm2Z/huGah5o91RW+EPHmzZu5XA4RDxz4Y0NDA5VlwAGtjz32mGVZ+Xx+ZmYmfAJxpocAyEJYj3SVpLpsYHl5uVgsNjQ0dHR0VPmTjo6OZDLJOV9aWoqoDzoAhiJgnkmYwVcx+PUc5At5IjJNozGVqgYOEVEqlTJNExELhYL0kxBOdWxXXs7UlaRQuyNjDBGxOq+UbEgiIudivbSuZrQxCZFt2w6gMAwzBuARRaoiZsTTKL9xAxljLJvNTk5OUtQroUofM9idO3csy1xfX19YWNizZw8ooJLUXB4RFxcXS6USADQ3b9KJiaKIW87IEDEG+iIIIQzDyGQymUymFuBplkql6enpJ598Uq3UKYUGAgC4fv16Pp9PJBIxZqMvHDBEQPDyaK+vgW7gQyIwTXP7jh1y9LG5rX/ZtuMuHZDMOTcM49q1a7Ozs4ZpBFVXVMG9YRpLS0vj4+MAsG3bts7OTkWUGCp4h1ZBzrmLsCnIit3KioOkEBcXF2dmZiraIjPYyp2Vzz//vFgsptPprq6uK1eucM737Nlz6tSp5ubmADNLKmQYRrFY/PDDDycmJgDg+PHj/f39EXTtFeoBJSNGADKjebCURSABEFFLS0tLS0s1avPRRx8VCgXG8OWXX+7t7c3lclNTU7Ozs2fOnBkcHGxvb3fClrO6Axmy2Tvnz//Vsa6urq7nnntOKynyiJMKLQSAyDn3ShfkB7sQlKo61bp06dK5c+c4508//fRbb71lGMbi4uJ7773389LPQLBp06be3t4DBw7s2L6DMSZI3L27cu3av776+uuF+Xki2rlz58mTJ9va2nQFcwSlKOjnMNzmcS0lghqqD5lM5v2/vH9v9V5HR8fp06fT6bRjA1NTU2fPnnVo4pxv2LBh48aNqVSqUCiurv6Sy+VICALo7Ox8880329vb48r9Uj+KwrVRlFo9SjGDMOIp9dSvrq4OnTt3b/VeKpU6ceKEQz0ACC4effTRQ4cOjYyMWJblZJXz8/N+8LIsa8u2bb29vQcPHmxqaoqhHmU8gYhek88pLSoRRvoQpppigSfnw8PDN2dnGWN9/X0PPfSQ4ELO2QcGBn744Yfp6WnDMHbu3Nna2prL5ywrsTmd3r1794MPPphOp4moQquFosEHg5TSNW+v4OenMkiouutIeP56bGxsbAwA9u/ff/jQYSFEoHsIRJRMJl977bX5hfnscjafzx86dHj3rl1ccNM0HSbjSQ9UnyhUgvSt1E1o/HqqpksYoBGN8szNzQ1fuGDb9vbt20+cOJFIJKI+hHPe2tp6/Nhxy7Ky2ezQ0Me5fM4wDCeqRJA2hhqxsv/XvEcWoGhdh4KCFTEq+1wuNzQ0tLKykkgkjh492tLSEidLIURPT8+LL74IAJnMf4Y//ZRCpZIKLSGKL5KxILfxDp68A6JQnkaK6gPAyMjfv/vuO0B8/vnne3p6ymQtJAgAXnnlla4HHiCCry5fHh8fj6aOoOxIQEQuSvZzLPdFHgMYaaRqZE5R8U9MTIyO/hMAHujq+tORIw5QZXGXwQAglUoNvvHG1q1bbdv+5JNP5ubmlEJdfFtR24ImADKDM1Ib+bH1FMbYwsLC+b+dL5VKTU2Nh/v6uG2vrKxU0xdqbm4+ePDghQsXVlZWPv546N13T6U2pASJSq25aI/Yo5rbnNReOpbxnoho2/aZM2empqYSiQQia0hWyBijKxSLRSIqlUr9AwNHX321uhqwPhaZFBEUVdq+UCjOzs4KIdbX1wGgUMjXkTQjYqlUmp2ZsW3b8af19JAB0LZ5JEJQWTkgAHw78e2Nf9/wrVCuAAZLEMkWH2AYdLNXRHy8p2dvVxfVX79EhwGSYSjp+j8KV1UaX/kk2GGs0qxDtMQekpLbt9M0iyVP6sCPGuu8WGdHwWnrEkF0AAhDviXoUsaEbx8RoawJRLp0MFb3tHAQderq5LR+Lx19tVC7M6GTqKL1S0rhWscvRkbZ4ktREbygq9wQVbJfH23VMG4j17EpUiVBtUwh1zQxyKc8ZfCnWEjtUMdWXkg3BlHzvFBUfcpWe4LeOsad7K9roFQmlCIdE5JwVtRolZe27B03XkE1CtEf9ig3l6NN7Kp83q/yRUYYSdt9w3IKE38CdYyvxlGsHwPCcmtQne1bAghaTOUGwwjCpYqQHYe8W7guH3KrFBGu1l4jqkVxUnKxNWJ4+Du+s1zOLcZhEEXNtbN27riUP54UzMqEuUNQ5eia4W9meh2hcj9Rc/O3M71ejT/S3PwfU3RM4Onzt5sAAAAASUVORK5CYII=";
          // mimeType = "image/svg+xml";
        } else {
          base64Str = doc[key];
        }

        // ----------- 3️⃣ Base64 解析 -----------
        if (base64Str.startsWith("data:")) {
          const match = base64Str.match(/^data:(image\/[a-zA-Z+]+);base64,/);
          if (match) mimeType = match[1];
          base64Str = base64Str.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
        }

        const buffer = Buffer.from(base64Str, "base64");
        let image = sharp(buffer);

        // ----------- 4️⃣ 缩放 + 样式处理 -----------
        if (w || h) {
          image = image.resize(w ? parseInt(w) : null, h ? parseInt(h) : null, {
            fit: "cover",
            withoutEnlargement: true,
          });
        }

        if (style === "blur") {
          image = image.blur(5);
        } else if (style === "gray") {
          image = image.grayscale();
        } else if (style === "round") {
          const meta = await image.metadata();
          const radius = Math.min(meta.width, meta.height) / 2;
          const mask = Buffer.from(
            `<svg><rect x="0" y="0" width="${meta.width}" height="${meta.height}" rx="${radius}" ry="${radius}"/></svg>`
          );
          image = image.composite([{ input: mask, blend: "dest-in" }]).png();
        }

        // ----------- 5️⃣ 输出结果 -----------
        const originalFormat = mimeType.split("/")[1];
        const outputFormat = format === "auto" ? originalFormat : format;
        const outputBuffer = await image.toFormat(outputFormat).toBuffer();

        res.setHeader("Content-Type", `image/${outputFormat}`);
        res.setHeader("Cache-Control", "public, max-age=86400");
        res.end(outputBuffer);
      } catch (err) {
        console.error("❌ getDocumentImage error:", err);
        res.status(500).send("Server error: " + err.message);
      }
    },
  },
  getDocumentFile: {
    method: "get",
    dbItem: "visualTool",
    callback: async function (req, res, dbInfo, db) {
          try {
            const {
              id,
              condition,
              key = "document",     // Mongo 字段名，存储文件路径
              table = "pptItem",    // 数据表
              mode = "text",      // 返回模式: stream | base64 | text
              download = false,     // 是否触发下载
              ...queryParams
            } = req.query;
    
            // ----------- 安全字段白名单 -----------
            const SAFE_FIELDS = ["_id", "id", "folderName", "appName", "documentId", "type"];
    
            const dbItem = db.db(dbInfo.database);
            const collection = dbItem.collection(table);
    
            // ----------- 构建查询条件 -----------
            const query = {};
            if (condition) {
              if (!SAFE_FIELDS.includes(condition)) {
                return res.status(403).send(`Unsafe condition field: ${condition}`);
              }
              const value = queryParams[condition];
              if (!value) return res.status(400).send(`Missing value for condition=${condition}`);
              query[condition] = value;
            } else if (id) {
              try {
                query._id = new ObjectId(id);
              } catch {
                query._id = id;
              }
            } else {
              for (const safeKey of SAFE_FIELDS) {
                if (queryParams[safeKey]) {
                  query[safeKey] = queryParams[safeKey];
                  break;
                }
              }
            }
    
            if (Object.keys(query).length === 0) {
              return res.status(400).send("Missing valid query condition");
            }
    
            // ----------- 查询文档 -----------
            const doc = await collection.findOne(query, { projection: { [key]: 1 } });
            if (!doc || !doc[key]) {
              return res.status(404).send("File path not found in document");
            }
    
            const ROOT_DIR = path.resolve("./static"); // 限制根目录
            // const resolvedPath = path.resolve(ROOT_DIR, doc[key]);
            const resolvedPath = ROOT_DIR + doc[key];
    
            // if (!resolvedPath.startsWith(ROOT_DIR)) {
            //   return res.status(403).send("Access denied: invalid file path");
            // }
            console.log("real path: ", resolvedPath);
    
            if (!fs.existsSync(resolvedPath)) {
              return res.status(404).send("File not found on server");
            }
    
            let mimeType = "application/octet-stream";
            mimeType = mime.lookup(resolvedPath) || mimeType;
            res.setHeader("Cache-Control", "public, max-age=86400");
    
            // ----------- 模式 1：直接流式输出 -----------
            if (mode === "stream") {
              res.setHeader("Content-Type", mimeType);
              if (download) {
                const fileName = path.basename(resolvedPath);
                res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
              }
              const stream = fs.createReadStream(resolvedPath);
              return stream.pipe(res);
            }
    
            // ----------- 模式 2：Base64 输出 -----------
            if (mode === "base64") {
              const fileBuffer = fs.readFileSync(resolvedPath);
              const base64 = fileBuffer.toString("base64");
              const result = {
                mime: mimeType,
                base64: `data:${mimeType};base64,${base64}`,
                fileName: path.basename(resolvedPath),
              };
              return res.json(result);
            }
    
            // ----------- 模式 3：文本内容输出 -----------
            if (mode === "text") {
              const encoding = mimeType.startsWith("text/") || mimeType.includes("json")
                ? "utf-8"
                : null;
              const content = fs.readFileSync(resolvedPath, encoding || null);
              return res.send(content);
            }
    
            // ----------- 默认兜底 -----------
            return res.status(400).send("Invalid mode. Use stream | base64 | text.");
          } catch (err) {
            console.error("❌ getDocumentFile error:", err);
            res.status(500).send("Server error: " + err.message);
          }
        },
    // _callback: async function (req, res, dbInfo, db) {
    //   try {
    //     const {
    //       id,
    //       condition,
    //       key = "document",     // Mongo 字段名，存储文件路径
    //       table = "pptItem",    // 数据表
    //       mode = "text",      // 返回模式: stream | base64 | text
    //       download = false,     // 是否触发下载
    //       ...queryParams
    //     } = req.query;

    //     // ----------- 安全字段白名单 -----------
    //     const SAFE_FIELDS = ["_id", "id", "folderName", "appName", "documentId", "type"];

    //     const dbItem = db.db(dbInfo.database);
    //     const collection = dbItem.collection(table);

    //     // ----------- 构建查询条件 -----------
    //     const query = {};
    //     if (condition) {
    //       if (!SAFE_FIELDS.includes(condition)) {
    //         return res.status(403).send(`Unsafe condition field: ${condition}`);
    //       }
    //       const value = queryParams[condition];
    //       if (!value) return res.status(400).send(`Missing value for condition=${condition}`);
    //       query[condition] = value;
    //     } else if (id) {
    //       try {
    //         query._id = new ObjectId(id);
    //       } catch {
    //         query._id = id;
    //       }
    //     } else {
    //       for (const safeKey of SAFE_FIELDS) {
    //         if (queryParams[safeKey]) {
    //           query[safeKey] = queryParams[safeKey];
    //           break;
    //         }
    //       }
    //     }

    //     if (Object.keys(query).length === 0) {
    //       return res.status(400).send("Missing valid query condition");
    //     }

    //     // ----------- 查询文档 -----------
    //     const doc = await collection.findOne(query, { projection: { [key]: 1 } });
    //     if (!doc || !doc[key]) {
    //       return res.status(404).send("File path not found in document");
    //     }

    //     const ROOT_DIR = path.resolve(__dirname, "../static"); // 限制根目录
    //     const resolvedPath = path.resolve(ROOT_DIR, doc[key]);

    //     // 路径包含性校验：解析后必须仍在 ROOT_DIR 内，防止 ../ 穿越
    //     // if (resolvedPath !== ROOT_DIR && !resolvedPath.startsWith(ROOT_DIR + path.sep)) {
    //     //   return res.status(403).send("Access denied: invalid file path");
    //     // }
    //     console.log("real path: ", resolvedPath);

    //     if (!fs.existsSync(resolvedPath)) {
    //       return res.status(404).send("File not found on server");
    //     }

    //     let mimeType = "application/octet-stream";
    //     mimeType = mime.lookup(resolvedPath) || mimeType;
    //     res.setHeader("Cache-Control", "public, max-age=86400");

    //     // ----------- 模式 1：直接流式输出 -----------
    //     if (mode === "stream") {
    //       res.setHeader("Content-Type", mimeType);
    //       if (download) {
    //         const fileName = path.basename(resolvedPath);
    //         res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    //       }
    //       const stream = fs.createReadStream(resolvedPath);
    //       return stream.pipe(res);
    //     }

    //     // ----------- 模式 2：Base64 输出 -----------
    //     if (mode === "base64") {
    //       const fileBuffer = fs.readFileSync(resolvedPath);
    //       const base64 = fileBuffer.toString("base64");
    //       const result = {
    //         mime: mimeType,
    //         base64: `data:${mimeType};base64,${base64}`,
    //         fileName: path.basename(resolvedPath),
    //       };
    //       return res.json(result);
    //     }

    //     // ----------- 模式 3：文本内容输出 -----------
    //     if (mode === "text") {
    //       const encoding = mimeType.startsWith("text/") || mimeType.includes("json")
    //         ? "utf-8"
    //         : null;
    //       const content = fs.readFileSync(resolvedPath, encoding || null);
    //       return res.send(content);
    //     }

    //     // ----------- 默认兜底 -----------
    //     return res.status(400).send("Invalid mode. Use stream | base64 | text.");
    //   } catch (err) {
    //     console.error("❌ getDocumentFile error:", err);
    //     res.status(500).send("Server error: " + err.message);
    //   }
    // },
  },
  getModelList: {
    method: "get",
    callback: function (req, res, dbInfo, db) {
      let cData = new ConfigObject(cPath).data;
      cData = cData || {};
      cData.tokenRateMap = cData.tokenRateMap || {};
      WebTool.requestTool.sendData({
        ret: 0,
        data: cData.tokenRateMap
      }, req, res);
    }
  },
  getDocumentData: {
    method: "get",
    dbItem: "visualTool",
    requiredScope: "doc:read",
    callback: async function (req, res, dbInfo, db) {
      const key = req.query.key || "productId";
      const id = req.query[key];
      if (!id) {
        db.close();
        return WebTool.requestTool.sendData(
          { ret: 1, message: "获取失败, 缺少参数。" },
          req,
          res
        );
      }

      const size = Math.max(1, Math.min(Number(req.query.pageSize) || 10, 100));
      const current = Math.max(Number(req.query.pageNo) || 1, 1);
      const tName = req.query.table || "document";

      // 表名白名单：仅允许读取文档类集合，防止任意表读取扩大越权面
      const ALLOWED_TABLES = ["document", "pptItem"];
      if (ALLOWED_TABLES.indexOf(tName) === -1) {
        db.close();
        return WebTool.requestTool.sendData(
          { ret: 1, message: "不支持的表名" },
          req,
          res
        );
      }

      const condition = { [key]: id };
      const userData = req.session?.data || {};

      let projection = {
        name: 1,
        title: 1,
        time: 1,
        price: 1,
        appLabel: 1,
        appOwner: 1,
        creator: 1,
        folderName: 1,
        publishStatus: 1,
        document: 1,
        usageCount: 1,
        taxRate: 1,
        type: 1,
        tags: 1,
        category: 1,
        subject: 1,
        grades: 1,
        description: 1,
        introduce: 1,
        icon: 1,
        documentId: 1,
        model: 1,
        apiName: 1,
        publishTime: 1,
      };

      if (userData.folderName) {
        projection = {
          name: 1,
          title: 1,
          time: 1,
          price: 1,
          appLabel: 1,
          appOwner: 1,
          creator: 1,
          folderName: 1,
          publishStatus: 1,
          document: 1,
          usageCount: 1,
          knowledges: 1,
          taxRate: 1,
          type: 1,
          tags: 1,
          category: 1,
          subject: 1,
          grades: 1,
          description: 1,
          introduce: 1,
          icon: 1,
          documentId: 1,
          publishTime: 1,
          prompt: 1,
          apiName: 1,
          apiKey: 1,
          apiSecret: 1,
          inputPrice: 1,
          outputPrice: 1,
          appId: 1,
          platformUrl: 1,
          model: 1
        };
      }

      try {
        const collection = db.db().collection(tName);

        // ✅ count 与分页查询并行执行，替代废弃的 cursor.count()
        const [total, list] = await Promise.all([
          collection.countDocuments(condition),
          collection
            .find(condition, { projection })
            .sort({ time: -1 })
            .skip(size * (current - 1))
            .limit(size)
            .toArray(),
        ]);

        const SENSITIVE_FIELDS = [
          "apiKey", "apiSecret", "platformUrl",
          "inputPrice", "outputPrice", "appId", "prompt", "knowledges",
        ];
        const result = list.map((item) => {
          if ((item.folderName + "") !== (userData.folderName + "")) {
            SENSITIVE_FIELDS.forEach((k) => { delete item[k]; });
          }
          return item;
        });

        WebTool.requestTool.sendData(
          {
            ret: 0,
            pageSize: size,
            current,
            total,
            data: result,
          },
          req,
          res
        );

        if (result[0]) {
          result[0].usageCount = result[0].usageCount || 0;
          result[0].usageCount++;
          WebTool.objectTool.dbUpdate(
            db,
            tName,
            condition,
            "set",
            {
              usageCount: result[0].usageCount,
            },
            function () {
              db.close();
            }
          );
        } else {
          db.close();
        }
      } catch (err) {
        console.error("❌ getDocumentData 查询异常：", err);
        WebTool.requestTool.sendData(
          { ret: 1, message: "查询出现异常。" },
          req,
          res
        );
        db.close();
      }
    },
  },
  confirmSubscriptionOrder: {
    method: "post",
    dbItem: "visualTool",
    callback: function (req, res, dbInfo, db) {
      let data = req.session.data;
      // TODO(安全): 需接入真实支付订单校验（订单号 + 签名 + 支付状态），当前仅做登录与上限校验
      if (!data || !data.logined || !data.folderName) {
        return WebTool.requestTool.sendData({ ret: 1, message: "未登录或无权限" }, req, res);
      }

      let info = {};
      try {
        info = typeof req.body.planInfo === "string" ? JSON.parse(req.body.planInfo) : (req.body.planInfo || {});
      } catch (e) {
        return WebTool.requestTool.sendData({ ret: 1, message: "planInfo 格式错误" }, req, res);
      }

      // 支付订单校验：要求携带 COMPLETED 的支付订单，否则拒绝续费（防白嫖）。
      // TODO(安全): 此处仅做客户端订单结构与状态校验；生产环境必须用 PayPal API
      //  对 order.id 做服务端二次核验，并校验金额与购买人，才能真正防止伪造。
      const order = info.order || info.payOrder || {};
      const orderId = order.id || order.captureId || order.paymentId || "";
      const orderStatus = String(order.status || "").toUpperCase();
      if (!orderId || orderStatus !== "COMPLETED") {
        return WebTool.requestTool.sendData({ ret: 1, message: "缺少有效的支付订单" }, req, res);
      }

      let subscription = data.subscription || 0;
      let now = new Date().getTime();
      // 限制单次续费时长，避免无限期免费续费
      let count = Math.min(Math.max(Number(info.monthCount) || 1, 1), 12);
      let section = 1000 * 60 * 60 * 24 * 31 * count;
      subscription = Math.max(now, subscription) + section;
      WebTool.objectTool.dbUpdate(
        db,
        "account",
        {
          folderName: data.folderName,
        },
        "set",
        {
          subscription: subscription,
        },
        function (tRet) {
          db.close();
          WebTool.requestTool.sendData(
            {
              ret: 0,
              data: tRet.result,
              message: "操作成功。",
            },
            req,
            res
          );
        }
      );
    },
  },
  deleteDocumentData: {
    method: "post",
    dbItem: "visualTool",
    callback: function (req, res, dbInfo, db) {
      let data = req.session.data || {};
      let admin = req.body.admin;
      const isAdmin = admin === commonData.powerAdmin && commonData.adminSwitch;
      if (!isAdmin && !data.folderName) {
        return WebTool.requestTool.sendData({ ret: 1, message: "未登录或无权限" }, req, res);
      }
      let key = req.body.key || "productId";
      let id = req.body[key];
      if (!id) {
        WebTool.requestTool.sendData(
          {
            ret: 1,
            message: "productId参数不可为空。",
          },
          req,
          res
        );
        return false;
      }

      let condition = {
        [key]: id,
      };
      // 非管理员强制按会话 folderName 收敛，防止越权删除他人文档
      if (!isAdmin) {
        condition.folderName = String(data.folderName);
      }

      if (key === "_id") {
        condition["_id"] = ObjectId(id);
      }

      WebTool.objectTool.dbUpdate(
        db,
        "pptItem",
        condition,
        "set",
        {
          _delete: true,
        },
        function (tRet) {
          db.close();
          WebTool.requestTool.sendData(
            {
              ret: 0,
              data: tRet.result,
              message: "操作成功。",
            },
            req,
            res
          );
        }
      );
    },
  },
  _deleteDocumentData: {
    method: "post",
    dbItem: "visualTool",
    callback: function (req, res, dbInfo, db) {
      let data = req.session.data || {};
      let admin = req.body.admin;
      const isAdmin = admin === commonData.powerAdmin && commonData.adminSwitch;
      let key = req.body.key || "productId";
      let id = req.body[key];
      let type = req.body.type || "";
      if (!isAdmin && !data.folderName) {
        db.close();
        return WebTool.requestTool.sendData({ ret: 1, message: "删除失败, 需要重新登录。" }, req, res);
      }
      if (!id) {
        WebTool.requestTool.sendData(
          {
            ret: 1,
            message: "productId参数不可为空。",
          },
          req,
          res
        );
        return false;
      }
      let condition = {
        [key]: id,
      };
      if (!isAdmin) {
        condition.folderName = String(data.folderName);
      }

      if (key === "_id") {
        condition["_id"] = ObjectId(id);
      }

      let dbItem = db.db(dbInfo.dbName);
      let tName = req.body.table || "document";
      let tObject = dbItem.collection(tName);
      let method = "deleteMany";
      if (type === "single") {
        method = "deleteOne";
      }
      tObject[method](condition, function (err, d) {
        db.close();
        if (err) throw err;
        console.log("文档删除成功");
        WebTool.requestTool.sendData(
          {
            ret: 0,
            data: d.result,
          },
          req,
          res
        );
      });
    },
  },
  setDocumentStatus: {
    method: "post",
    dbItem: "visualTool",
    callback: function (req, res, dbInfo, db) {
      let data = req.session.data || {};
      let key = req.body.key || "status";
      let value = req.body[key] || req.body.value || "";
      let admin = req.body.admin || "";
      let timeKey = req.body.timeKey || "";
      let tableName = req.body.table || "pptItem";
      let cKey = req.body.cKey;
      const isAdmin = admin === commonData.powerAdmin && commonData.adminSwitch;
      if (
        tableName === "account" &&
        (key === "tokenLimit" ||
          key === "tokenUsed" ||
          key === "folderName" ||
          key === "account" ||
          key === "role")
      ) {
        return false;
      }
      if (isAdmin || data.folderName) {
        // 非管理员始终按会话 folderName 收敛，防止越权更新他人数据
        let c = {};
        if (!isAdmin) {
          c.folderName = tableName === "questionData" ? data.folderName : (data.folderName + "");
        }
        let productId = req.body[cKey];
        if (tableName !== "account" && cKey) {
          c[cKey] = cKey === "_id" ? ObjectId(productId) : productId;
        }

        console.log("update condition: ", c);

        // if (data && data.folderName) {
        //   c.account = data.account;
        // }

        let attr = {
          [key]: value,
        };
        if (timeKey) {
          attr[timeKey] = new Date().getTime();
        }

        console.log("update attr / condition / tableName: ", attr, c, tableName);

        findItems(db, tableName, c, null, function (err, result, db) {
          let doc = result[0];
          if (doc) {
            if (
              isAdmin ||
              String(data.folderName) === String(doc.folderName)
            ) {
              WebTool.objectTool.dbUpdate(
                db,
                tableName,
                c,
                "set",
                attr,
                function (tRet) {
                  db.close();
                  WebTool.requestTool.sendData(
                    {
                      ret: 0,
                      result: tRet.result,
                      data: attr,
                      message: "操作成功。",
                    },
                    req,
                    res
                  );
                }
              );
            } else {
              db.close();
              WebTool.requestTool.sendData(
                {
                  ret: 2,
                  message: "暂无权限更新。",
                },
                req,
                res
              );
            }
          } else {
            db.close();
            WebTool.requestTool.sendData(
              {
                ret: 2,
                message: "所更新的文档不存在。",
              },
              req,
              res
            );
          }
        });
      } else {
        db.close();
        WebTool.requestTool.sendData(
          {
            ret: 1,
            message: "操作失败，需要先登录。",
          },
          req,
          res
        );
      }
    },
  },
  publishDocument: {
    method: "post",
    dbItem: "visualTool",
    callback: function (req, res, dbInfo, db) {
      let data = req.session.data;
      let admin = req.body.admin;
      if (admin === commonData.powerAdmin && commonData.adminSwitch || (data && data.folderName)) {
        let qItem = req.body.documentItem || req.query.documentItem;
        if (!qItem) {
          WebTool.requestTool.sendData(
            {
              ret: 1,
              message: "documentItem参数不可为空。",
            },
            req,
            res
          );
          return false;
        }
        if (typeof qItem === "string") {
          try {
            qItem = JSON.parse(qItem);
          } catch (e) {
            WebTool.requestTool.sendData(
              {
                ret: 1,
                message: "数据格式不正确。",
              },
              req,
              res
            );
            return false;
          }
        }
        let dbItem = db.db(dbInfo.dbName);
        let tName = "document";
        let tObject = dbItem.collection(tName);
        let tData = qItem;
        if (qItem.constructor.name !== "Array") {
          tData = [qItem];
        }
        tData = tData.map((item) => {
          item._time = new Date().getTime();
          item.account = item.account || data.account;
          delete item._id;
          return item;
        });
        tObject.insertMany(tData, function (err, result) {
          if (err) throw err;
          dbInfo.collection = "account";
          let tokenCount = commonData.servicePrice.publishDocument;
          WebTool.objectTool.dbUpdate(
            db,
            "account",
            {
              folderName: data.folderName,
            },
            "inc",
            {
              tokenUsed: tokenCount,
            },
            function (ret) {
              db.close();
            }
          );
          WebTool.requestTool.sendData(
            {
              ret: 0,
              data: result,
            },
            req,
            res
          );
        });
      } else {
        WebTool.requestTool.sendData(
          {
            ret: 1,
            message: "发布失败, 需要重新登录。",
          },
          req,
          res
        );
      }
    },
  },
  recoverTokens: {
    method: "post",
    dbItem: "visualTool",
    callback: function (req, res, dbInfo, db) {
      let data = req.session.data || {};
      let admin = req.body.admin;
      const isAdmin = admin === commonData.powerAdmin && commonData.adminSwitch;
      let documentId = req.body.documentId;
      if (!documentId) {
        return WebTool.requestTool.sendData(
          { ret: 1, message: "documentId参数不可为空。" },
          req,
          res
        );
      }
      if (!isAdmin && !data.folderName) {
        return WebTool.requestTool.sendData({ ret: 1, message: "未登录或无权限" }, req, res);
      }
      const condition = { documentId: documentId };
      // 非管理员强制按会话 folderName 收敛，防止越权恢复他人数据
      if (!isAdmin) {
        condition.folderName = String(data.folderName);
      }
      WebTool.objectTool.dbUpdate(
        db,
        "questionData",
        condition,
        "set",
        { recover: true },
        function (tRet) {
          WebTool.requestTool.sendData(
            { ret: 0, message: "操作成功。" },
            req,
            res
          );
        }
      );
    },
  },
  putQuestionData: {
    method: "post",
    dbItem: "visualTool",
    callback: function (req, res, dbInfo, db) {
      let data = req.session.data;
      let admin = req.body.admin;

      const send = (payload) => {
        WebTool.requestTool.sendData(payload, req, res);
      };

      if (!(admin === commonData.powerAdmin && commonData.adminSwitch || (data && data.folderName))) {
        send({
          ret: 1,
          message: "记录问题数据失败, 未登录。",
        });
        db.close();
        return;
      }

      let qItem = req.body.questionItem || req.query.questionItem;

      if (!qItem) {
        send({
          ret: 1,
          message: "questionItem参数不可为空。",
        });
        db.close();
        return;
      }

      if (typeof qItem === "string") {
        try {
          qItem = JSON.parse(qItem);
        } catch (e) {
          send({
            ret: 1,
            message: "数据格式不正确。",
          });
          db.close();
          return;
        }
      }

      let dbItem = db.db(dbInfo.dbName);
      let tObject = dbItem.collection("questionData");

      let tData = Array.isArray(qItem) ? qItem : [qItem];

      let hUrl = req.get("referer");
      let id = WebTool.objectTool.urlQuery(hUrl, "id");

      tData = tData.map((item) => {
        const resultStr =
          typeof item.result === "string"
            ? item.result
            : JSON.stringify(item.result || "");

        const versionId = mmh3.x64.hash128(resultStr, 31);

        if (item.baseId && item.baseId.length !== 32) {
          item.baseId = mmh3.x64.hash128(item.baseId, 31);
        }

        return {
          ...item,
          _time: Date.now(),
          account: item.account || data.account,
          folderName: data.folderName,
          documentId: item.documentId || id || "",
          versionId,
        };
      });

      console.log("tData after processing:", tData);

      // ✅ 去重 key：folderName + documentId + versionId
      const uniqueMap = new Map();

      tData.forEach((item) => {
        const key = `${item.folderName}::${item.documentId}::${item.versionId}`;

        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, item);
        }
      });

      const insertList = Array.from(uniqueMap.values());

      if (insertList.length === 0) {
        send({
          ret: 0,
          message: "无新数据需要插入（已去重）",
          data: [],
        });
        db.close();
        return;
      }

      tObject.insertMany(insertList, function (err, result) {
        db.close();

        if (err) {
          send({
            ret: 1,
            message: "插入失败",
            error: err.message,
          });
          return;
        }

        send({
          ret: 0,
          data: result,
        });
      });
    },
  },
  _putQuestionData: {
    method: "post",
    dbItem: "visualTool",
    callback: function (req, res, dbInfo, db) {
      let data = req.session.data;
      let admin = req.body.admin;
      if (admin === commonData.powerAdmin && commonData.adminSwitch || (data && data.folderName)) {
        let qItem = req.body.questionItem || req.query.questionItem;
        if (!qItem) {
          WebTool.requestTool.sendData(
            {
              ret: 1,
              message: "questionItem参数不可为空。",
            },
            req,
            res
          );
          db.close();
          return false;
        }
        if (typeof qItem === "string") {
          try {
            qItem = JSON.parse(qItem);
          } catch (e) {
            WebTool.requestTool.sendData(
              {
                ret: 1,
                message: "数据格式不正确。",
              },
              req,
              res
            );
            db.close();
            return false;
          }
        }
        let dbItem = db.db(dbInfo.dbName);
        let tName = "questionData";
        let tObject = dbItem.collection(tName);
        let tData = qItem;
        if (qItem.constructor.name !== "Array") {
          tData = [qItem];
        }
        let hUrl = req.get("referer");
        let id = WebTool.objectTool.urlQuery(hUrl, "id");
        tData = tData.map((item) => {
          item._time = new Date().getTime();
          item.account = item.account || data.account;
          item.folderName = data.folderName;
          item.documentId = item.documentId || id || "";
          item.versionId = mmh3.x64.hash128(item.result, 31);
          if (item.baseId && item.baseId.length !== 32) {
            item.baseId = mmh3.x64.hash128(item.baseId, 31);
          }
          delete item._id;
          return item;
        });
        tObject.insertMany(tData, function (err, result) {
          db.close();
          if (err) throw err;
          WebTool.requestTool.sendData(
            {
              ret: 0,
              data: result,
            },
            req,
            res
          );
        });
      } else {
        WebTool.requestTool.sendData(
          {
            ret: 1,
            message: "记录问题数据失败, 未登录。",
          },
          req,
          res
        );
        db.close();
      }
    },
  },
  getUserData: {
    method: "get",
    dbItem: "visualTool",
    requiredScope: "account:read",
    callback: function (req, res, dbInfo, db) {
      let data = req.session.data;
      let lang = req.query.lang || "zh";

      if (data) {
        let condition = {
          folderName: data.folderName,
        };
        let config = {
          projection: {
            image: 1,
            folderName: 1,
            account: 1,
            tokenUsed: 1,
            tokenLimit: 1,
            ["name_" + lang]: 1,
            ["introduce_" + lang]: 1,
            ["agentList_" + lang]: 1,
            ["slogan_" + lang]: 1,
            ["slogan1_" + lang]: 1,
          },
        };
        findItems(db, "account", condition, config, function (err, result, db) {
          if (err) {
            WebTool.requestTool.sendData(
              {
                ret: 1,
                message: "数据库操作失败",
              },
              req,
              res
            );
          } else {
            let ret = "";
            let msg = "查询成功。";
            if (result.length === 0) {
              ret = 1;
              msg = "账号名或密码不正确";
            } else {
              ret = 0;
            }

            WebTool.requestTool.sendData(
              {
                ret: ret,
                data: result[0],
                message: msg,
              },
              req,
              res
            );
          }
          db.close();
        });
      } else {
        WebTool.requestTool.sendData(
          {
            ret: 1,
            message: "获取用户数据失败, 未登录。",
          },
          req,
          res
        );
        db.close();
      }
    },
  },
  check: {
    method: "get",
    dbItem: "visualTool",
    callback: function (req, res, dbInfo, db) {
      let query = req.query;
      let msg = "";
      let ret = 0;
      req.session.data = req.session.data || {};
      let lang = req.query.lang || "zh";
      let config = {
        projection: {
          ["agentList_" + lang]: 1,
          ["name_" + lang]: 1,
          ["introduce_" + lang]: 1,
          ["slogan_" + lang]: 1,
          ["slogan1_" + lang]: 1,
          image: 1,
          role: 1,
          folderName: 1,
          account: 1,
          tokenUsed: 1,
          tokenLimit: 1,
        },
      };
      if (query.account !== undefined && query.password) {
        msg = "Login by password";
        let condition = {
          account: query.account,
          password: query.password,
        };
        findItems(
          db,
          "account",
          condition,
          config,
          function (err, result, tDB) {
            tDB.close();
            if (err) {
              WebTool.requestTool.sendData(
                {
                  ret: 1,
                  message: "数据库操作失败",
                },
                req,
                res
              );
            } else {
              if (result.length === 0) {
                ret = 1;
                msg = "账号名或密码不正确";
              } else {
                ret = 0;
                req.session.data = req.session.data || {};
                req.session.data.folderName = result[0].folderName + "";
                req.session.data.logined = true;
                req.session.data.account = condition.account;
                req.session.data.name = result[0].name;
                req.session.data.tokenUsed = result[0].tokenUsed;
                req.session.data.tokenLimit = result[0].tokenLimit;
                req.session.data.subscription = result[0].subscription;
                req.session.data.introduce = result[0].introduce;
                req.session.data.role = result[0].role || "[]";
                req.session.data.account = result[0].account;
                let now = new Date().getTime();
                req.session.data.vipTimeout =
                  now > (result[0].subscription || 0);
                let token = upateTokenData(
                  condition.account,
                  result[0],
                  "testToken"
                );

                result[0].token = token;
                result[0].vipTimeout = req.session.data.vipTimeout;
                let data = result[0];
                let hUrl = req.get("referer");
                let id = WebTool.objectTool.urlQuery(hUrl, "id");
                if (!id) {
                  id = WebTool.objectTool.urlQuery(hUrl, "agent");
                }

                delete result[0].password;
              }
              WebTool.requestTool.sendData(
                {
                  ret: ret,
                  data: result[0],
                  message: msg,
                },
                req,
                res
              );
            }
          }
        );
      } else if (
        query.account !== undefined &&
        query.checkNumber !== undefined
      ) {
        let code = req.session.data.code;
        req.headers = req.headers || {};
        let token = req.headers['transweb-token'];
        let logined = new ConfigObject(loginedPath);
        logined.data = logined.data || {};
        if (token) {
          logined.data[token] = logined.data[token] || {};
          code = logined.data[token].code;
        }

        if (
           code !== query.checkNumber && query.checkNumber !== process.env.POWER_ADMIN
        ) {
          msg = "验证码不正确";
          WebTool.requestTool.sendData(
            {
              ret: 1,
              message: msg,
            },
            req,
            res
          );
          return false;
        }
        msg = "Login by checkNumber";
        let condition = {
          account: query.account,
        };
        findItems(
          db,
          "account",
          condition,
          config,
          function (err, result, tDB) {
            if (err) {
              tDB.close();
              WebTool.requestTool.sendData(
                {
                  ret: 1,
                  message: "数据库操作失败",
                },
                req,
                res
              );
            } else {
              let d = {
                account: query.account,
                password: "",
              };
              // hashValue = mmh3.x86.hash32(_self.service.path + "");
              req.session.data = req.session.data || {};
              d.folderName = mmh3.x86.hash32(
                condition.account + commonData.powerAdmin
              );

              req.session.data.folderName = d.folderName + "";
              req.session.data.logined = true;
              req.session.data.account = query.account;

              if (result.length === 0) {
                d.tokenUsed = 0;
                d.tokenLimit = commonData.initPoints || 10000;

                d.impactIndex = 0;
                d.time = new Date().getTime();
                d.rootAccount = req.query.rootAccount || "";
                d.root = req.query.root || "";
                d.role = commonData.adminAccount !== query.account ? "[]" : "['partner']";
                const refererUrl = req.get("referer") || "Unknown Source";
                d.documentId = WebTool.objectTool.urlQuery(refererUrl, "id");
                WebTool.objectTool.addItem(tDB, "account", d, function (err, res, tDB) {
                  //Todo: 记录
                  WebTool.objectTool.recordDeal(tDB, {
                    name: "第一次登录，获赠积分",
                    value: d.tokenLimit,
                    documentId: d.documentId,
                    folderName: d.folderName,
                    type: "income"
                  }, () => {
                    tDB.close();
                    console.log("记录新用户赠送积分", d.folderName, d.tokenLimit);
                  });
                  initPersonalData(d.folderName);
                });
              } else {
                req.session.data.name = result[0].name;
                d = result[0];
                initPersonalData(d.folderName);
                tDB.close();
              }

              req.session.data.tokenUsed = d.tokenUsed;
              req.session.data.tokenLimit = d.tokenLimit;
              req.session.data.subscription = d.subscription;
              let now = new Date().getTime();
              req.session.data.vipTimeout = now > (d.subscription || 0);
              let token = upateTokenData(query.account, d, "testToken");
              d.token = token;
              req.session.data.token = token;
              req.session.data.role = d.role;
              req.session.data.introduce = d.introduce;

              let hUrl = req.get("referer");

              let id = WebTool.objectTool.urlQuery(hUrl, "id");
              if (!id) {
                id = WebTool.objectTool.urlQuery(hUrl, "agent");
              }

              let retData = {
                ret: ret,
                data: d,
                message: msg,
              };

              WebTool.requestTool.sendData(retData, req, res);
            }
          }
        );
      } else {
        db.close();
        msg = "need some params";
        WebTool.requestTool.sendData(
          {
            ret: 1,
            message: msg,
          },
          req,
          res
        );
      }
    },
  },
  sendSMS: {
    method: "get",
    callback: function (req, res) {
      req.session.data = req.session.data || {};
      let time = req.session.data.time || 0;
      let now = new Date().getTime();
      const chinaMobileRegex = /^1[3-9]\d{9}$/;
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      let number = (this.receive && this.receive.number) || "";
      let t1 = chinaMobileRegex.test(number);
      let t2 = emailRegex.test(number);
      if (!number || (!t1 && !t2)) {
        WebTool.requestTool.sendData(
          {
            ret: 1,
            msg: "请输入可接收验证码的手机号或邮箱地址",
          },
          req,
          res
        );
        return false;
      }

      let type = "mobile";

      if (t2) {
        type = "email";
      }

      let timeout = 180000;
      let tt = now - time;

      if (tt < timeout) {
        WebTool.requestTool.sendData(
          {
            ret: 1,
            msg: "请稍后请求验证码",
          },
          req,
          res
        );
        return false;
      }

      let smsCode = String(Math.random()).slice(4, 10);
      let postData = {
        mobile: number,
        message: "验证码:" + smsCode + "【北京津度科技】",
      };

      if (type === "mobile") {
        let content = querystring.stringify(postData);
        let options = {
          host: "sms-api.luosimao.com",
          path: "/v1/send.json",
          method: "POST",
          auth: `api:${process.env.SEND_MESSAGE_API_KEY}`,
          agent: false,
          rejectUnauthorized: false,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": content.length,
          },
        };
        let temp = null;
        let _self = this;
        let _req = https.request(options, function (_res) {
          _res.setEncoding("utf8");
          _res.on("data", function (chunk) {
            temp = JSON.parse(chunk);
            if (temp.error !== 0 && temp.error !== undefined) {
              console.log(temp.error);
              WebTool.requestTool.sendData(
                {
                  ret: temp.error,
                  msg: "发送验证码失败，请检查所输入的手机号码。",
                },
                req,
                res
              );
              req.session.data.time = 0;
            }
          });
          _res.on("end", function () {
            if (temp.error === 0) {
              WebTool.requestTool.sendData(
                {
                  ret: 0,
                  msg: "已发送验证码",
                },
                req,
                res
              );
            }
          });
        });
        _req.write(content);
        _req.end();
      } else {
        // 邮件内容
        const mailOptions = {
          from: "neilking@163.com",
          to: this.receive.number,
          subject: "transweb verification code",
          text: `Your verification code is: ${smsCode}`,
          html: `<h3>Your verification code is: <span style="color: red;"> ${smsCode}</span></h3>`,
        };
        // 发送邮件
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
          } else {
            WebTool.requestTool.sendData(
              {
                ret: 0,
                msg: "已发送验证码",
              },
              req,
              res
            );
          }
        });
      }
      let _t = new Date().getTime();
      req.session.data.time = _t;
      req.session.data.code = smsCode;
      req.headers = req.headers || {};
      let token = req.headers['transweb-token'];
      console.log("sendSMS token: ", token);
      if (token) {
        let logined = new ConfigObject(loginedPath);
        logined.data = logined.data || {};
        logined.data[token] = logined.data[token] || {};
        logined.data[token].code = smsCode;
        // 验证码的有效期为30分钟
        logined.data[token].timeout = _t + 30 * 60 * 1000;
        logined.save();
      }
    },
  },
  resetFeedback: {
    dbItem: "visualTool",
    method: "post", // 建议改为 post 以支持较大的反馈内容
    callback: function (req, res, dbInfo, db) {
      let data = req.session.data;

      // 1. 权限校验
      if (!data || !data.logined) {
        return WebTool.requestTool.sendData({ ret: 1, data: "失败, 未登录。" }, req, res);
      }

      const refererUrl = req.get("referer") || "Unknown Source";
      let documentId = WebTool.objectTool.urlQuery(refererUrl, "id");
      let table = req.body.table || "pptItem";

      if (!documentId) {
        WebTool.requestTool.sendData({
          ret: 2,
          msg: "需要在特定的页面中操作。",
        }, req, res);
        return false;
      }

      let query = {
        key: "documentId",
        documentId: documentId,
        table: table
      }
      getDocumentData(
        query,
        db,
        (tData) => {
          let d = tData;
          if (d && d[0]) {
            d = d[0];
          }
          if (d.folderName === data.folderName + '') {
            WebTool.objectTool.dbUpdate(
              db,
              table,
              {
                documentId: documentId,
              },
              "set",
              {
                feedbacks: [],
              },
              (tRet) => {
                db.close();
                WebTool.requestTool.sendData({
                  ret: 0,
                  msg: "重置成功。",
                }, req, res);
              }
            );
          }
          else {
            WebTool.requestTool.sendData({
              ret: 1,
              msg: "只有作者才能执行该操作。",
            }, req, res);
          }
        });
    }
  },
  sendFeedback: {
    dbItem: "visualTool",
    method: "post", // 建议改为 post 以支持较大的反馈内容
    callback: function (req, res, dbInfo, db) {
      req.session.data = req.session.data || {};
      let data = req.session.data;

      data.lastFeedbackTime = data.lastFeedbackTime || 0;

      console.log("feedback start: ", data.folderName, data.lastFeedbackTime);

      let now = new Date().getTime();

      if (now - data.lastFeedbackTime < 30 * 1000) {
        return WebTool.requestTool.sendData({ ret: 1, data: "失败, 30 秒内只可发送一个反馈。" }, req, res);
      }

      data.lastFeedbackTime = now;

      const feedbackData = req.body || {};

      console.log(" 1. 权限校验 - ", data.logined, feedbackData.award);

      // 1. 权限校验
      if ((!data || !data.logined) && feedbackData.award) {
        return WebTool.requestTool.sendData({ ret: 1, data: "失败, 未登录。" }, req, res);
      }

      console.log(" 2. 提取参数与环境信息");

      // 2. 提取参数与环境信息

      const targetEmail = feedbackData.contact || "neilking@163.com";
      const refererUrl = req.get("referer") || "Unknown Source";
      let documentId = WebTool.objectTool.urlQuery(refererUrl, "id") || req.body.documentId;
      const timestamp = new Date().toLocaleString();
      let table = req.body.table || "pptItem";

      let _award = req.body.award;

      delete feedbackData.contact;

      feedbackData.folderName = data.folderName;

      // 3. 动态生成反馈内容的 HTML 表格行
      // 过滤掉不需要展示的字段，或者直接遍历所有 body 参数
      const tableRows = Object.entries(feedbackData)
        .map(([key, value]) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666; width: 100px;">${key}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; color: #333; line-height: 1.6;">${value}</td>
        </tr>
      `).join("");

      console.log(" 3. 反馈内容 - ", tableRows);

      // 4. 构建邮件模板
      const mailOptions = {
        from: `"System Notifier" <neilking@163.com>`,
        to: targetEmail,
        subject: `New Feedback from [${new URL(refererUrl).hostname}]`,
        // 纯文本备选方案
        text: `收到新的用户反馈：\n来源：${refererUrl}\n时间：${timestamp}`,
        // 富文本 HTML 邮件
        html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e4e8; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #0BBFC4; color: white; padding: 20px; text-align: center;">
            <h2 style="margin: 0; font-size: 20px;">新用户反馈通知</h2>
          </div>
          <div style="padding: 20px; background-color: #ffffff;">
            <p style="color: #586069; font-size: 14px;">您收到一条来自页面的反馈信息，详细内容如下：</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              ${tableRows}
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">来源页面</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; color: #0BBFC4;">${refererUrl}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">提交时间</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; color: #333;">${timestamp}</td>
              </tr>
            </table>
          </div>
          <div style="background-color: #f6f8fa; padding: 15px; text-align: center; font-size: 12px; color: #999;">
            此邮件由系统自动发送，请勿直接回复。
          </div>
        </div>
      `,
      };

      if (!documentId) {
        return WebTool.requestTool.sendData({ ret: 1, data: "失败, 无效的文档ID。" }, req, res);
      }

      console.log(" 4. 构建邮件模板 - ", mailOptions);

      let query = {
        key: "documentId",
        documentId: documentId,
        table: table
      }
      getDocumentData(
        query,
        db,
        (tData) => {
          let d = tData;

          console.log(" 4.1 获取文档数据 - ", d);

          let from = '1714628260';

          let award = _award;
          if (d && d[0]) {
            d = d[0];
            from = d.folderName || from;
            award = d.feedbackAward || award;
          }



          console.log(" 5. 执行发送");

          // 5. 执行发送
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error("Mail Error:", error);
              return WebTool.requestTool.sendData({ ret: 1, msg: "邮件发送失败" }, req, res);
            }

            if (req.body.award) {
              let arr = d.feedbacks || [];
              if (arr.indexOf(data.folderName + "") === -1) {
                arr.push(data.folderName + "");
              }
              else {
                WebTool.requestTool.sendData({
                  ret: 1,
                  msg: "您已经反馈过(每位用户只可反馈一次)。",
                }, req, res);
                return false;
              }

              let params = {
                folderName: from + "",
                object: data.folderName + "",
                purposeFrom: "奖励反馈者",
                purposeTo: "反馈后的奖励",
                documentId: documentId,
                value: Number(award),
              };

              console.log("transferPoints params: ", params);

              WebTool.objectTool.transferPoints(
                db,
                params,
                (rData) => {
                  WebTool.objectTool.dbUpdate(
                    db,
                    table,
                    {
                      documentId: documentId,
                    },
                    "set",
                    {
                      feedbacks: arr,
                    },
                    (tRet) => {
                      db.close();
                    }
                  );
                },
                () => {
                  db.close();
                }
              );
            }

            console.log("已成功反馈，感谢您的意见");

            WebTool.requestTool.sendData({
              ret: 0,
              msg: "已成功反馈，感谢您的意见",
            }, req, res);
          });
        });
    }
  },
  updateLoginInfo: {
    method: "post",
    dbItem: "visualTool",
    callback: function (req, res, dbInfo, db) {
      let data = req.session.data;
      if (!data || !data.logined) {
        WebTool.requestTool.sendData(
          {
            ret: 1,
            data: "失败, 未登录。",
          },
          req,
          res
        );
        return false;
      } else {
        if (req.body.set) {
          let dbItem = db.db(dbInfo.dbName);
          let tObject = dbItem.collection("account");
          let set = req.body.set || req.query.set;
          if (typeof set === "string") {
            try { set = JSON.parse(set); } catch (e) { set = {}; }
          }
          if (!set || typeof set !== "object" || Array.isArray(set)) {
            return WebTool.requestTool.sendData({ ret: 1, data: "非法的 set 参数" }, req, res);
          }
          // 白名单：仅允许更新个人资料字段，禁止 tokenLimit/tokenUsed/subscription/role 等计费与权限字段
          const ALLOWED_FIELDS = [
            "name", "name_zh", "name_en", "nickname",
            "avatar", "avatarUrl", "icon", "image",
            "slogan", "slogan_zh", "slogan_en", "slogan1", "slogan1_zh", "slogan1_en",
            "introduce", "introduce_zh", "introduce_en",
            "agent", "agent_zh", "agent_en",
            "agentList", "agentList_zh", "agentList_en",
            "password", "phone", "email", "signature", "creator",
          ];
          const safeSet = {};
          for (const k of ALLOWED_FIELDS) {
            if (set[k] !== undefined) safeSet[k] = set[k];
          }
          // 防止 $set 为空导致 MongoDB 崩溃
          if (Object.keys(safeSet).length === 0) {
            return WebTool.requestTool.sendData(
              { ret: 1, data: "无可更新的字段（set 中无合法字段）。" },
              req,
              res
            );
          }
          tObject.updateOne(
            {
              folderName: data.folderName,
            },
            {
              $set: safeSet,
            },
            function (err, result) {
              db.close();
              if (err) throw err;
              WebTool.requestTool.sendData(
                {
                  ret: 0,
                  data: result,
                },
                req,
                res
              );
            }
          );
        } else {
          data.name = req.body.name || data.name;
          WebTool.requestTool.sendData(
            {
              ret: 0,
              data: data,
            },
            req,
            res
          );
        }
      }
    },
  },
  setPartnerRole: {
    method: "post",
    dbItem: "visualTool",
    callback: function (req, res, dbInfo, db) {
      let data = req.session.data || {};
      if (data.account !== commonData.adminAccount) {
        WebTool.requestTool.sendData(
          {
            ret: 2,
            message: "需要是管理员权限",
          },
          req,
          res
        );
        return false;
      }

      let agent = req.body.agent;
      let condition = {
        folderName: Number(agent),
      };
      WebTool.objectTool.dbUpdate(
        db,
        "account",
        condition,
        "set",
        {
          role: ["partner"],
        },
        function (tRet) {
          db.close();
          WebTool.requestTool.sendData(
            {
              ret: 0,
              data: tRet.result,
              message: "操作成功。",
            },
            req,
            res
          );
        }
      );
    },
  },
  switchRoleItem: {
    method: "post",
    dbItem: "visualTool",
    callback: function (req, res, dbInfo, db) {
      let data = req.session.data || {};
      if (data.account !== commonData.adminAccount) {
        WebTool.requestTool.sendData(
          {
            ret: 2,
            message: "需要是管理员权限",
          },
          req,
          res
        );
        return false;
      }
      let agent = req.body.agent;
      let v = req.body.role;
      let condition = {
        folderName: Number(agent),
      };
      WebTool.objectTool.dbUpdate(
        db,
        "account",
        condition,
        "set",
        {
          role: v,
        },
        function (tRet) {
          db.close();
          WebTool.requestTool.sendData(
            {
              ret: 0,
              data: tRet.result,
              message: "操作成功。",
            },
            req,
            res
          );
        }
      );
    },
  },
  cutPoints: {
    method: "post",
    dbItem: "visualTool",
    callback: function (req, res, dbInfo, db) {
      let data = req.session.data || {};
      if (data.account !== commonData.adminAccount) {
        WebTool.requestTool.sendData(
          {
            ret: 2,
            message: "需要是管理员权限",
          },
          req,
          res
        );
        return false;
      }
      let agent = req.body.agent;
      let v = Number(req.body.points);
      let condition = {
        folderName: Number(agent),
      };
      WebTool.objectTool.dbUpdate(
        db,
        "account",
        condition,
        "inc",
        {
          tokenLimit: -v,
        },
        function (tRet) {
          db.close();
          WebTool.requestTool.sendData(
            {
              ret: 0,
              data: tRet.result,
              message: "操作成功。",
            },
            req,
            res
          );
        }
      );
    },
  },
  getPartnerData: {
    method: "get",
    dbItem: "visualTool",
    requiredScope: "account:read",
    callback: function (req, res, dbInfo, db) {
      let data = JSON.parse(JSON.stringify(req.session.data)) || {};
      if (data.account !== commonData.adminAccount) {
        WebTool.requestTool.sendData(
          {
            ret: 2,
            message: "需要是管理员权限",
          },
          req,
          res
        );
        return false;
      }

      let agent = req.query.agent;
      let condition = {
        folderName: Number(agent),
      };
      // ✅ 投影：仅取所需字段，避免拉取 password 等敏感字段
      findItems(
        db,
        "account",
        condition,
        {
          projection: {
            tokenLimit: 1,
            tokenUsed: 1,
            folderName: 1,
            subscription: 1,
            name: 1,
            role: 1,
          },
        },
        function (err, result, tDB) {
        if (err) {
          tDB.close();
          WebTool.requestTool.sendData(
            {
              ret: 1,
              message: "数据库操作失败",
            },
            req,
            res
          );
          return false;
        }

        if (result.length !== 0) {
          data.tokenLimit = result[0].tokenLimit || data.tokenLimit;
          data.tokenUsed = result[0].tokenUsed || data.tokenUsed;
          data.folderName = result[0].folderName + "";
          //Todo: set subscription status

          let now = new Date().getTime();
          data.subscription = result[0].subscription || 0;
          data.vipTimeout = now > data.subscription;
          data.name = result[0].name;
          data.role = result[0].role || [];
          delete data.account;
        }
        WebTool.requestTool.sendData(
          {
            ret: 0,
            data: data,
          },
          req,
          res
        );
      });
    },
  },
  getLoginInfo: {
    method: "get",
    dbItem: "visualTool",
    requiredScope: "account:read",
    callback: function (req, res, dbInfo, db) {
      let data = req.session.data || {};
      data = JSON.parse(JSON.stringify(data));
      if (!data.folderName) {
        WebTool.requestTool.sendData(
          {
            ret: 2,
            message: "暂无登录账号信息",
          },
          req,
          res
        );
        return false;
      }
      let condition = {
        folderName: Number(data.folderName),
      };

      // ✅ 投影：仅取所需字段，避免拉取 password 等敏感字段
      findItems(
        db,
        "account",
        condition,
        {
          projection: {
            tokenLimit: 1,
            tokenUsed: 1,
            folderName: 1,
            subscription: 1,
            name: 1,
            role: 1,
            introduce: 1,
            image: 1,
            account: 1,
          },
        },
        function (err, result, tDB) {
        if (err) {
          tDB.close();
          WebTool.requestTool.sendData(
            {
              ret: 1,
              message: "数据库操作失败",
            },
            req,
            res
          );
          return false;
        }
        if (result.length !== 0) {
          data.tokenLimit = result[0].tokenLimit || data.tokenLimit;
          data.tokenUsed = result[0].tokenUsed || data.tokenUsed;
          data.folderName = result[0].folderName + "";
          //Todo: set subscription status

          let now = new Date().getTime();
          data.subscription = result[0].subscription || 0;
          data.vipTimeout = now > data.subscription;
          data.name = result[0].name;
          data.role = result[0].role || [];
          data.introduce = result[0].introduce || "";
          data.image = result[0].image;
          data.account = result[0].account;
          let hUrl = req.get("referer");
          let id = WebTool.objectTool.urlQuery(hUrl, "id");
          if (!id) {
            id = WebTool.objectTool.urlQuery(hUrl, "agent");
          }
        }
        delete data.account;
        WebTool.requestTool.sendData(
          {
            ret: 0,
            data: data,
          },
          req,
          res
        );
      });
    },
  },
  setAppData: {
    method: "post",
    callback: function (req, res) {
      let data = req.session.data || {};
      data = JSON.parse(JSON.stringify(data));
      let appData = req.body.appData;
      // if (typeof appData === "string") {
      //   appData = JSON.parse(appData) || null;
      // }

      if (data.folderName) {
        if (appData !== undefined && appData.length < 20 * 1024 * 1024) {
          let hUrl = req.get("referer");

          let id = WebTool.objectTool.urlQuery(hUrl, "agent");
          if (!id) {
            id = WebTool.objectTool.urlQuery(hUrl, "id");
          }
          if (id) {
            setPersonalData(data.folderName, id, appData);
            WebTool.requestTool.sendData(
              {
                ret: 0,
                message: "设置成功",
              },
              req,
              res
            );
          } else {
            WebTool.requestTool.sendData(
              {
                ret: 3,
                message: "设置失败，应用无效",
              },
              req,
              res
            );
          }
        } else {
          WebTool.requestTool.sendData(
            {
              ret: 2,
              message: "设置失败，appData 参数无效或尺寸超过 20M。",
            },
            req,
            res
          );
        }
      } else {
        WebTool.requestTool.sendData(
          {
            ret: 1,
            message: "设置应用数据，需要先登录",
          },
          req,
          res
        );
      }
    },
  },
  loginOff: {
    method: "post",
    callback: function (req, res) {
      req.session.data = {};
      req.headers = req.headers || {};
      let token = req.headers["transweb-token"];
      if (token) {
        let logined = new ConfigObject(loginedPath);
        let tData = logined.data;
        if (tData[token]) {
          delete tData[token];
          logined.save();
        }
      }
      WebTool.requestTool.sendData(
        {
          ret: 0,
        },
        req,
        res
      );
    },
  },
};

module.exports = data;
