let fs = require("fs");
let moment = require("moment");
const sharp = require("sharp");
let env = require("./env.js");
const axios = require("axios");
let ObjectId = require("mongodb").ObjectId;

let objectTool = {};
objectTool.objectToString = function (obj) {
  // 转义字符串，防止单引号/反斜杠/换行破坏生成的 JS 字面量
  function escStr(s) {
    return String(s)
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "\\'")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t");
  }
  if (obj && obj.constructor.name === "Object") {
    var str = "{";
    for (var k in obj) {
      if (typeof obj[k] === "string") {
        str += k + ":'" + escStr(obj[k]) + "',";
      } else {
        str += k + ":" + this.objectToString(obj[k]) + ",";
      }
    }
    if (str.length === 1) {
      str = "{}";
    } else {
      str = str.slice(0, str.length - 1) + "}";
    }
  } else if (obj && obj.constructor.name === "Array") {
    if (obj.length > 0) {
      var str = "[ " + this.objectToString(obj[0]);
      for (var i = 1; i < obj.length; i++) {
        str += "," + this.objectToString(obj[i]);
      }
      str += "]";
    } else {
      var str = "[]";
    }
  } else if (obj && obj.constructor.name === "Function") {
    var str = obj.toString();
  } else if (typeof obj === "string") {
    var str = "'" + escStr(obj) + "'";
  } else if (
    typeof obj === "number" ||
    typeof obj === "boolean" ||
    typeof obj === "undefined" ||
    obj === null
  ) {
    var str = obj;
  } else {
    var str = "''";
  }
  return str;
};

objectTool.addItem = function (db, tableName, data, callback) {
  let dbItem = db.db();
  let tObject = dbItem.collection(tableName);
  if (data.constructor.name !== "Array") {
    data = [data];
  }
  tObject.insertMany(data, (err, result) => {
    if (err) throw err;
    if (typeof callback === "function") {
      callback(err, result, db);
    }
  });
};

objectTool.getDocumentData = function (query, dbInfo, db, callback) {
  let key = query.key || "productId";
  let id = query[key];
  if (id) {
    let config = {
      pageSize: query.pageSize || 10,
      pageNo: query.pageNo || 1,
    };
    let dbItem = db.db(dbInfo.database);
    let tName = query.table || "document";
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
            throw err;
          } else {
            if (typeof callback === "function") {
              callback(result, count, current, size);
            }
          }
        });
    });
  }
};

objectTool.transferPoints = function (db, params, callback, tCallback) {
  let value = Number(params.value);
  params.folderName = Number(params.folderName);
  params.object = Number(params.object);
  let time = new Date().getTime();
  if (params.object && value > 0) {
    this.dealIncome(
      db,
      {
        folderName: params.object,
        value: params.value,
        documentId: params.documentId,
        time: time,
        name: params.purposeTo || "转移",
      },
      (tData) => {
        this.dealExpenses(
          db,
          {
            folderName: params.folderName,
            value: params.value,
            documentId: params.documentId,
            time: time,
            name: params.purposeFrom || "转移",
          },
          callback
        );
      }
    );
  } else {
    if (typeof tCallback === "function") {
      tCallback();
    }
  }
};

objectTool.recordDeal = function (dbItem, params, callback) {
  params.time = params.time || new Date().getTime();
  params.folderName = params.folderName + "";
  console.log("recordDeal: ", params);
  this.addItem(dbItem, "pointsBill", params, callback);
};

objectTool.dealIncome = function (db, params, callback) {
  if (!params.value) {
    return false;
  }
  params.type = "income";
  this.dbUpdate(
    db,
    "account",
    {
      folderName: Number(params.folderName),
    },
    "inc",
    {
      tokenLimit: params.value || 0,
    },
    (ret) => {
      this.recordDeal(db, params, callback);
    }
  );
};

objectTool.dealExpenses = function (db, params, callback) {
  params.type = "expenses";
  if (!params.value) {
    return false;
  }
  this.dbUpdate(
    db,
    "account",
    {
      folderName: Number(params.folderName),
    },
    "inc",
    {
      tokenUsed: params.value || 0,
    },
    (ret) => {
      this.recordDeal(db, params, callback);
    }
  );
};

objectTool.dbQuery = function query(
  db,
  collection,
  condition,
  param,
  callback
) {
  try {
    const dbItem = db.db();
    const tObject = dbItem.collection(collection);
    let cursor = tObject.find(condition);

    param = param || {};

    // 1. 排序逻辑
    if (param.sort) {
      cursor = cursor.sort(param.sort);
    }

    // 2. 分页逻辑：增加安全性检查
    if (param.pageSize) {
      const pageSize = Math.max(1, parseInt(param.pageSize) || 10);
      const pageNum = Math.max(1, parseInt(param.pageNum || param.pageNo || 1));
      cursor = cursor.skip((pageNum - 1) * pageSize).limit(pageSize);
    }

    // 3. 异步执行
    cursor.toArray((err, result) => {
      // 这里的 db.close() 取决于你的连接管理策略，建议在外部统一处理
      if (err) {
        return callback(err); // 安全传回错误
      }
      if (typeof callback === "function") {
        callback(null, result); // 遵循 Node.js 标准：callback(err, data)
      }
    });
  } catch (fatalErr) {
    callback(fatalErr);
  }
};

objectTool.compressImageNode = async function (
  input,
  { maxWidth = 800, maxHeight = 800, targetSizeKb = 200 } = {}
) {
  try {
    let imageBuffer;

    // --- 1. 统一输入源为 Buffer ---
    if (Buffer.isBuffer(input)) {
      imageBuffer = input;
    } else if (typeof input === "string" && input.startsWith("data:image")) {
      // 处理 Base64 字符串
      const base64Data = input.replace(/^data:image\/\w+;base64,/, "");
      imageBuffer = Buffer.from(base64Data, "base64");
    } else if (typeof input === "string" && input.startsWith("http")) {
      // 处理远程 URL：通过 axios 下载图片并转为 Buffer
      const response = await axios.get(input, { responseType: "arraybuffer" });
      imageBuffer = Buffer.from(response.data);
    } else if (typeof input === "string") {
      // 处理本地文件路径（假设输入的是路径）
      imageBuffer = input;
    }

    // --- 2. 预设压缩参数 ---
    let quality = 80; // 初始质量
    let outputBuffer;

    // 实例化 Sharp
    const sharpInstance = sharp(imageBuffer).resize({
      width: maxWidth,
      height: maxHeight,
      fit: "inside", // 等比缩放，不剪裁
      withoutEnlargement: true, // 如果原图比 800 小，不进行放大
    });

    // --- 3. 动态压缩逻辑 (确保 200k 以内) ---
    // 先进行一次标准压缩
    outputBuffer = await sharpInstance
      .jpeg({ quality, progressive: true })
      .toBuffer();

    // 如果结果依然大于 200k，则循环降低质量 (最多尝试3次，效率最高)
    while (outputBuffer.length > targetSizeKb * 1024 && quality > 20) {
      quality -= 20;
      outputBuffer = await sharpInstance.jpeg({ quality }).toBuffer();
    }

    // --- 4. 结果返回 ---
    // 根据你的业务需求，可以返回 Buffer 或者 Base64
    return {
      buffer: outputBuffer,
      sizeKb: (outputBuffer.length / 1024).toFixed(2),
      base64: `data:image/jpeg;base64,${outputBuffer.toString("base64")}`,
    };
  } catch (error) {
    console.error("图片处理失败:", error.message);
    return null; // 或者返回原 input
  }
};

objectTool.dbUpdate = function (
  db,
  collection,
  condition,
  type,
  param,
  callback
) {
  // 防御：空更新对象会导致 MongoDB 抛出 "'$set' is empty" 崩溃，直接跳过
  if (!param || typeof param !== "object" || Array.isArray(param) || Object.keys(param).length === 0) {
    console.warn("dbUpdate 跳过空更新对象:", collection, type);
    if (typeof callback === "function") {
      callback({ result: { n: 0, nModified: 0, ok: 1 } });
    }
    return;
  }
  var dbItem = db.db();
  var tObject = dbItem.collection(collection);
  let op = {};
  if (type === "inc") {
    op["$inc"] = param;
  } else {
    op["$set"] = param;
  }
  tObject.updateOne(condition, op, (err, result) => {
    if (err) {
      db.close();
      throw err;
    }
    if (typeof callback === "function") {
      callback(result);
    }
  });
};

objectTool.urlQuery = function (url, key) {
  if (url) {
    var re = new RegExp(key + "=([^&]*)", "i");
    var a = re.exec(url);
    if (a == null) {
      return null;
    }
    return a[1];
  } else {
    return null;
  }
};

objectTool.attachParams = function (url, params) {
  if (!url) {
    return url;
  }
  if (url.indexOf("?") === -1) {
    flag = 0;
  } else {
    flag = 1;
  }
  for (var k in params) {
    if (flag == 0) {
      url += "?" + k + "=" + encodeURIComponent(params[k]);
      flag = 1;
    } else {
      url += "&" + k + "=" + encodeURIComponent(params[k]);
    }
  }
  return url;
};
objectTool.isExpired = function (duration, time) {
  var now = moment().format();
  var t = moment(time).add(duration, "y");
  return t < now;
};

// SSRF 防护：仅允许公网 http(s) URL，拒绝非 http(s) 协议、回环/私网/链路本地地址。
// 注意：静态校验无法完全防御 DNS rebinding，生产环境应结合 DNS 解析后的 IP 二次校验。
objectTool.assertSafePublicUrl = function (url) {
  let u;
  try {
    u = new URL(String(url || ""));
  } catch (e) {
    throw new Error("SSRF blocked: invalid url");
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error("SSRF blocked: unsupported protocol " + u.protocol);
  }
  const host = (u.hostname || "").toLowerCase();
  if (!host) {
    throw new Error("SSRF blocked: empty host");
  }
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal")) {
    throw new Error("SSRF blocked: local host");
  }
  if (host.indexOf(":") !== -1) {
    // 直接拒绝 IPv6 字面量（含 ::1 回环、fe80:: 链路本地）
    throw new Error("SSRF blocked: ipv6 literal");
  }
  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    const c = Number(m[3]);
    const d = Number(m[4]);
    if (
      a === 10 || a === 127 || a === 0 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 169 && b === 254) ||
      (a === 100 && b >= 64 && b <= 127) ||
      a >= 224
    ) {
      throw new Error("SSRF blocked: private/loopback address");
    }
    void c; void d;
  }
  return u;
};

objectTool.saveStringToFile = function (str, tPath, callback) {
  fs.writeFile(
    tPath,
    str,
    {
      encoding: "utf8",
    },
    function (err) {
      if (err) throw err;
      if (typeof callback === "function") {
        callback(err);
      }
    }
  );
};

objectTool.traceVersions = async function (
  db,
  tableName,
  versionId,
  config = {},
  condition = {}
) {
  if (!versionId) return [];

  const collection = db.db().collection(tableName);

  // 1. 确保索引存在
  await this._ensureTableIndexes(collection, tableName);

  const { maxDepth = 1000, projection } = config;
  const baseRestrict = { ...condition, versionId: { $ne: "default" } };

  const pipeline = [
    { $match: { versionId, ...condition } },
    {
      $graphLookup: {
        from: tableName,
        startWith: "$baseId",
        connectFromField: "baseId",
        connectToField: "versionId",
        as: "ancestors",
        maxDepth: maxDepth,
        restrictSearchWithMatch: baseRestrict,
      },
    },
    {
      $graphLookup: {
        from: tableName,
        startWith: "$versionId",
        connectFromField: "versionId",
        connectToField: "baseId",
        as: "descendants",
        maxDepth: maxDepth,
        restrictSearchWithMatch: condition,
      },
    },
  ];

  if (projection) {
    const essentialFields = {
      versionId: 1,
      baseId: 1,
      ancestors: 1,
      descendants: 1,
    };
    pipeline.push({ $project: { ...projection, ...essentialFields } });
  }

  const [result] = await collection.aggregate(pipeline).toArray();
  if (!result) return [];

  // ========== 向上溯源（祖先链） ==========
  const ancestorMap = new Map(result.ancestors.map((d) => [d.versionId, d]));
  const upwardLineage = [];
  let upCursor = result.baseId;
  const visited = new Set([versionId]);

  while (upCursor && upCursor !== "default" && ancestorMap.has(upCursor)) {
    if (visited.has(upCursor)) {
      // 检测到循环引用 → 停止向上追溯，不抛出异常
      console.warn(
        `[traceVersions] Circular reference detected upward at versionId: ${upCursor}`
      );
      break;
    }
    visited.add(upCursor);
    const doc = ancestorMap.get(upCursor);
    upwardLineage.unshift(doc);
    upCursor = doc.baseId;
  }

  // ========== 向下溯源（后代链，仅线性） ==========
  const childrenMap = new Map();
  result.descendants.forEach((doc) => {
    const bId = doc.baseId;
    if (!childrenMap.has(bId)) childrenMap.set(bId, []);
    childrenMap.get(bId).push(doc);
  });

  const downwardLineage = [];
  let downCursor = result.versionId;

  while (true) {
    const children = childrenMap.get(downCursor) || [];
    if (children.length !== 1) break; // 分支或无子节点则停止

    const child = children[0];
    if (visited.has(child.versionId)) {
      console.warn(
        `[traceVersions] Circular reference detected downward at versionId: ${child.versionId}`
      );
      break;
    }
    visited.add(child.versionId);
    downwardLineage.push(child);
    downCursor = child.versionId;
  }

  // 清理临时字段
  delete result.ancestors;
  delete result.descendants;

  return [...upwardLineage, result, ...downwardLineage];
};

objectTool._traceVersions = async function (
  db,
  tableName,
  versionId,
  config = {},
  condition = {}
) {
  if (!versionId) return [];

  const collection = db.db().collection(tableName);

  // 1. 确保索引存在 (优化后的单例检查)
  await this._ensureTableIndexes(collection, tableName);

  const { maxDepth = 1000, projection } = config;

  // 构造基础过滤条件
  const baseRestrict = { ...condition, versionId: { $ne: "default" } };

  const pipeline = [
    // 初始匹配：当前版本也必须符合 condition
    { $match: { versionId, ...condition } },

    // 2. 向上溯源：查找祖先 (子找父)
    {
      $graphLookup: {
        from: tableName,
        startWith: "$baseId",
        connectFromField: "baseId",
        connectToField: "versionId",
        as: "ancestors",
        maxDepth: maxDepth,
        restrictSearchWithMatch: baseRestrict,
      },
    },

    // 3. 向下溯源：查找后代 (父找子)
    {
      $graphLookup: {
        from: tableName,
        startWith: "$versionId",
        connectFromField: "versionId",
        connectToField: "baseId",
        as: "descendants",
        maxDepth: maxDepth,
        restrictSearchWithMatch: condition, // 下行同样应用条件
      },
    },
  ];

  // 4. 处理投影：确保关联字段始终存在
  if (projection) {
    const essentialFields = {
      versionId: 1,
      baseId: 1,
      ancestors: 1,
      descendants: 1,
    };
    pipeline.push({ $project: { ...projection, ...essentialFields } });
  }

  const [result] = await collection.aggregate(pipeline).toArray();
  if (!result) return [];

  // ================= 链路重排逻辑 =================

  // 向上重排 (线性化)
  const ancestorMap = new Map(result.ancestors.map((d) => [d.versionId, d]));
  const upwardLineage = [];
  let upCursor = result.baseId;
  const visited = new Set([versionId]);

  while (upCursor && upCursor !== "default" && ancestorMap.has(upCursor)) {
    if (visited.has(upCursor))
      throw new Error(`Detected circular reference (Up): ${upCursor}`);
    visited.add(upCursor);
    const doc = ancestorMap.get(upCursor);
    upwardLineage.unshift(doc); // 使用 unshift 直接替代 reverse()
    upCursor = doc.baseId;
  }

  // 向下重排 (线性化 & 分支剪枝)
  const childrenMap = new Map();
  result.descendants.forEach((doc) => {
    const bId = doc.baseId;
    if (!childrenMap.has(bId)) childrenMap.set(bId, []);
    childrenMap.get(bId).push(doc);
  });

  const downwardLineage = [];
  let downCursor = result.versionId;

  while (true) {
    const children = childrenMap.get(downCursor) || [];
    // 严格线性：遇到分支（2个及以上子节点）或无子节点则停止
    if (children.length !== 1) break;

    const child = children[0];
    if (visited.has(child.versionId))
      throw new Error(`Detected circular reference (Down): ${child.versionId}`);
    visited.add(child.versionId);

    downwardLineage.push(child);
    downCursor = child.versionId;
  }

  // 清理临时字段
  delete result.ancestors;
  delete result.descendants;

  return [...upwardLineage, result, ...downwardLineage];
};

/**
 * 辅助方法：确保表索引
 */
objectTool._ensureTableIndexes = async function (collection, tableName) {
  if (!this._indexEnsured) this._indexEnsured = new Set();
  if (!this._indexEnsured.has(tableName)) {
    // 建议索引：versionId (唯一), baseId (加速查询)
    await collection.createIndex({ versionId: 1 });
    await collection.createIndex({ baseId: 1 });
    this._indexEnsured.add(tableName);
  }
};

objectTool._traceVersions = async function (
  db,
  tableName,
  versionId,
  config = {},
  condition = {}
) {
  if (!versionId) return [];

  const collection = db.db().collection(tableName);

  // ---------- 确保必要索引存在（仅执行一次） ----------
  if (!objectTool._indexEnsured) {
    objectTool._indexEnsured = new Set();
  }
  if (!objectTool._indexEnsured.has(tableName)) {
    // 假设 ensureIndexesForTable 内部已有避免并发处理的机制
    await ensureIndexesForTable(collection, tableName);
    objectTool._indexEnsured.add(tableName);
  }
  // -------------------------------------------------

  const { maxDepth = 1000, projection } = config;

  const pipeline = [
    { $match: { versionId } },
    // 1. 向上溯源：查找所有的祖先版本 (子找父)
    {
      $graphLookup: {
        from: tableName,
        startWith: "$baseId",
        connectFromField: "baseId",
        connectToField: "versionId",
        as: "ancestors",
        maxDepth: maxDepth,
        restrictSearchWithMatch: { versionId: { $ne: "default" } },
      },
    },
    // 2. 向下溯源：查找所有的后代版本 (父找子)
    {
      $graphLookup: {
        from: tableName,
        startWith: "$versionId",
        connectFromField: "versionId",
        connectToField: "baseId",
        as: "descendants",
        maxDepth: maxDepth,
      },
    },
  ];

  // 安全处理 projection：防止 MongoDB 的 project 误删溯源必需的关联字段
  if (projection) {
    pipeline.push({
      $project: {
        ...projection,
        versionId: 1,
        baseId: 1,
        ancestors: 1,
        descendants: 1,
      },
    });
  }

  const [result] = await collection.aggregate(pipeline).toArray();
  if (!result) return [];

  // ================= 1. 向上溯源链路重排 =================
  const ancestorMap = new Map(result.ancestors.map((d) => [d.versionId, d]));
  const upwardLineage = [];
  let upCursor = result.baseId;
  const upSeen = new Set();

  while (upCursor && upCursor !== "default" && ancestorMap.has(upCursor)) {
    if (upSeen.has(upCursor))
      throw new Error(`检测到循环版本引用(向上): ${upCursor}`);
    upSeen.add(upCursor);

    const doc = ancestorMap.get(upCursor);
    upwardLineage.push(doc);
    upCursor = doc.baseId;
  }
  // 反转向上溯源数组，使最旧的版本排在最前面
  upwardLineage.reverse();

  // ================= 2. 向下溯源链路计算及剪枝 =================
  // 构建基于 baseId 聚合的子节点映射：baseId -> children[]
  const childrenMap = new Map();
  for (const doc of result.descendants) {
    const bId = doc.baseId;
    if (!childrenMap.has(bId)) childrenMap.set(bId, []);
    childrenMap.get(bId).push(doc);
  }

  const downwardLineage = [];
  let downCursor = result.versionId;
  const downSeen = new Set();

  while (true) {
    const children = childrenMap.get(downCursor) || [];

    // 截止条件：碰到 versionId 作为两个或两个以上数据的 baseId (即遇到分支)
    if (children.length >= 2) {
      break; // 停止往下遍历，分支的子集都不放入结果
    }

    // 只有单路分支，继续往下溯源
    if (children.length === 1) {
      const child = children[0];
      if (downSeen.has(child.versionId)) {
        throw new Error(`检测到循环版本引用(向下): ${child.versionId}`);
      }
      downSeen.add(child.versionId);

      downwardLineage.push(child);
      downCursor = child.versionId;
    } else {
      // children.length === 0，到达叶子节点，结束
      break;
    }
  }

  // ================= 3. 整合清理并返回 =================
  // 剔除中间产生的拉取集，保持返回的数据干净
  delete result.ancestors;
  delete result.descendants;

  // 返回扁平化的有序时间线： [最旧祖先, ..., 父版本, 当前版本, 子版本, ..., 最末后代]
  return [...upwardLineage, result, ...downwardLineage];
};

// 辅助函数：创建必要的索引（幂等）
async function ensureIndexesForTable(collection, tableName) {
  // 检查索引是否已存在（避免重复创建）
  const existingIndexes = await collection.indexes();
  const hasVersionIdIndex = existingIndexes.some(
    (idx) => idx.name === "versionId_1"
  );
  const hasBaseIdIndex = existingIndexes.some((idx) => idx.name === "baseId_1");

  // 为 versionId 创建索引（graphLookup 连接字段，同时用于 $match）
  if (!hasVersionIdIndex) {
    await collection.createIndex({ versionId: 1 }, { name: "versionId_1" });
  }
  // 为 baseId 创建索引（用于 graphLookup 的 startWith 和遍历）
  if (!hasBaseIdIndex) {
    await collection.createIndex({ baseId: 1 }, { name: "baseId_1" });
  }
}

objectTool.findItems = async function (db, tableName, condition, config = {}) {
  const size = Number(config.pageSize || 10);
  const no = Number(config.pageNo || 0);
  if(typeof db.db === "function") {
    db = db.db();
  }

  // 直接利用驱动自带的 Promise 特性
  return await db
    .collection(tableName)
    .find(condition, config)
    .skip(size * no)
    .limit(size)
    .toArray();
};

objectTool.readFile = function (tPath, callback) {
  fs.readFile(tPath, "utf-8", function (err, data) {
    if (err) {
      console.log(data);
    } else {
      if (typeof callback === "function") {
        callback(data);
      }
    }
  });
};

objectTool.stringToObject = function (str) {
  if (typeof str !== "string") {
    return str;
  }
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
};

objectTool.fetchQuestionData = async function (
  { db, table, condition, sortField, pageNo, pageSize },
  options = {}
) {
  const { projection = {}, after, allowDiskUse = "true", debug = false } = options;
  console.log("knowledge query condition: ", condition)
  const collection = db.collection(table);

  // 1. 计算分页参数
  const size = Math.min(Number(pageSize) || 10, 200);
  const current = Math.max(Number(pageNo) || 1, 1);
  const skipCount = (current - 1) * size;

  // 2. 检查索引（Debug 模式）
  if (Object.keys(sortField).length > 0 && debug) {
    const indexes = await collection.indexes();
    const hasSortIndex = indexes.some((idx) =>
      Object.keys(sortField).every((field) => idx.key[field] !== undefined)
    );
    if (!hasSortIndex) {
      console.warn(`⚠️ 排序字段 ${Object.keys(sortField).join(", ")} 无对应索引，可能导致内存排序`);
    }
  }

  // 3. 构建游标与查询
  const query = { ...condition };
  if (after) {
    try {
      query._id = { $gt: new ObjectId(after) };
    } catch {
      throw new Error("Invalid ObjectId format in 'after'");
    }
  }

  const findOptions = {
    projection,
    allowDiskUse: allowDiskUse !== "false",
  };

  let cursor = collection.find(query, findOptions).sort(sortField).limit(size);
  if (!after) {
    cursor = cursor.skip(skipCount);
  }

  // 4. 并行执行数据查询与总数统计
  const [list, total] = await Promise.all([
    cursor.toArray(),
    collection.countDocuments(query).catch(() => 0),
  ]);

  // 5. 执行 Explain（Debug 模式）
  let explainInfo;
  if (debug) {
    try {
      const explain = await collection
        .find(query, { allowDiskUse: true })
        .sort(sortField)
        .limit(1)
        .explain("executionStats");

      const stats = explain.executionStats;
      explainInfo = {
        stage: stats.executionStages?.stage,
        totalDocsExamined: stats.totalDocsExamined,
        totalKeysExamined: stats.totalKeysExamined,
        executionTimeMillis: stats.executionTimeMillis,
        indexUsed: stats.executionStages?.inputStage?.indexName || null,
      };
    } catch (e) {
      explainInfo = { error: e.message };
    }
  }

  return { list, total, explainInfo, current, size };
}

objectTool.extractJSON = function (text, safeMode = false) {
  if (!text) return null;
  if (typeof text !== "string") {
    return text;
  }

  /** 🔹 安全解析 JSON，带基础清理 */
  const tryParse = (s) => {
    const cleaned = s
      .replace(/^\uFEFF/, "") // 去掉 BOM
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]+/g, ""); // 去掉控制字符
    return JSON.parse(cleaned);
  };

  /** 🔹 去掉 Markdown 围栏与包裹引号 */
  const stripFencesAndQuotes = (s) => {
    let r = s.trim();

    // 去掉多行 ```json ... ``` 围栏
    r = r
      .replace(/^\s*```(?:json)?\s*/i, "")
      .replace(/```+$/i, "")
      .trim();

    // 若整体被引号包裹且中间包含 JSON 结构
    if (
      (r.startsWith("'") && r.endsWith("'")) ||
      (r.startsWith('"') && r.endsWith('"'))
    ) {
      const inner = r.slice(1, -1);
      if (/[{\[]/.test(inner) && /[}\]]/.test(inner)) r = inner;
    }
    return r;
  };

  /** 🔹 从文本中找到最可能的 JSON 片段（{...} 或 [...]） */
  const findBalancedJSON = (s) => {
    const start = Math.min(
      s.indexOf("{") === -1 ? Infinity : s.indexOf("{"),
      s.indexOf("[") === -1 ? Infinity : s.indexOf("[")
    );
    if (start === Infinity) return null;

    let inStr = false,
      esc = false,
      depth = 0;
    const open = s[start];
    const close = open === "{" ? "}" : "]";
    for (let i = start; i < s.length; i++) {
      const ch = s[i];
      if (esc) {
        esc = false;
        continue;
      }
      if (ch === "\\") {
        esc = true;
        continue;
      }
      if (ch === '"') {
        inStr = !inStr;
        continue;
      }

      if (!inStr) {
        if (ch === open) depth++;
        else if (ch === close) {
          depth--;
          if (depth === 0) return s.slice(start, i + 1);
        }
      }
    }
    const last = s.lastIndexOf(close);
    return last > start ? s.slice(start, last + 1) : null;
  };

  try {
    // 1️⃣ 初步清理
    let cleanText = stripFencesAndQuotes(text);

    // 2️⃣ 尝试直接解析（若 AI 输出就是纯 JSON）
    try {
      const parsed = tryParse(cleanText);
      if (parsed && typeof parsed === "object") return parsed;
    } catch (_) {
      /* 进入提取逻辑 */
    }

    // 3️⃣ 从文本中提取 JSON 片段
    const balanced = findBalancedJSON(cleanText);
    if (!balanced) throw new Error("未检测到 JSON 结构");

    // 4️⃣ 尝试解析提取片段
    try {
      const parsed = tryParse(balanced);
      if (parsed && typeof parsed === "object") return parsed;
    } catch (e) {
      // 5️⃣ 再清理一次尾部残留符号
      const trimmed = balanced
        .replace(/```[\s\S]*$/g, "")
        .replace(/['",\s]+$/g, "")
        .trim();
      const parsed = tryParse(trimmed);
      if (parsed && typeof parsed === "object") return parsed;
      throw e;
    }

    throw new Error("JSON 解析失败");
  } catch (err) {
    if (safeMode) {
      console.warn("⚠️ extractJSON 失败（安全模式）:", err.message);
      return null;
    }
    throw new Error("❌ JSON 提取失败：" + err.message);
  }
};

objectTool.calcOrderList = function (list, config) {
  var v = 0;
  for (var i = 0; i < list.length; i++) {
    var id = list[i].product_id;
    if (!id) {
      continue;
    }
    var arr = id.split("_");
    if (arr.length < 4) {
      continue;
    }
    var volume = arr[1];
    volume = config.vMap[volume];
    var duration = arr[3];
    duration = config.vMap[duration];
    var time = list[i].time;
    if (!this.isExpired(duration, time)) {
      v += volume;
    }
  }
  return v;
};

var mongoTool = {};

mongoTool.normalizeQuery = function (query) {
  if (!query || typeof query !== "object") return query;

  const value = query._id;
  if (!value) return query;

  // ---------- 单个 id ----------
  if (typeof value === "string") {
    if (/^[0-9a-fA-F]{24}$/.test(value)) {
      query._id = new ObjectId(value);
    }
    return query;
  }

  // ---------- $in ----------
  if (typeof value === "object" && Array.isArray(value.$in)) {
    query._id = {
      ...value,
      $in: value.$in.map((id) =>
        /^[0-9a-fA-F]{24}$/.test(id) ? new ObjectId(id) : id
      ),
    };
  }

  return query;
};

// 去除危险的 MongoDB 操作符，防止 NoSQL 注入（$where/$function 可执行服务端脚本）。
// 返回新的净化副本，不改动原对象；只保留常见的安全查询/逻辑操作符。
mongoTool.sanitizeQuery = function (query) {
  if (!query || typeof query !== "object") return query;
  if (Array.isArray(query)) {
    return query.map((item) => mongoTool.sanitizeQuery(item));
  }

  const deny = { $where: 1, $function: 1, $expr: 1, $accumulator: 1 };
  const allow = {
    $in: 1, $nin: 1, $eq: 1, $ne: 1, $gt: 1, $gte: 1, $lt: 1, $lte: 1,
    $exists: 1, $all: 1, $size: 1, $elemMatch: 1,
    $and: 1, $or: 1, $not: 1, $nor: 1, $regex: 1, $options: 1,
  };

  const out = {};
  for (const k of Object.keys(query)) {
    if (k.startsWith("$")) {
      if (deny[k] || !allow[k]) continue; // 丢弃危险/未知操作符
    }
    const v = query[k];
    // 仅递归普通对象/数组，避免把 RegExp/Date/ObjectId/Buffer 误当成对象而破坏其值
    const recurse =
      v && typeof v === "object" && (Array.isArray(v) || v.constructor === Object);
    out[k] = recurse ? mongoTool.sanitizeQuery(v) : v;
  }
  return out;
};

var requestTool = {};

requestTool.getClientIp = function (req) {
  return (
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress
  );
};

requestTool.sendData = function (data, req, res) {
  const callback = req?.query?.callback;

  // 校验回调函数名：支持点号调用的对象方法（如 webCpu.appConfigCallback），同时抵御 XSS
  if (
    callback &&
    /^[a-zA-Z_$][a-zA-Z0-9_$.]*$/.test(callback) &&
    !callback.includes("..")
  ) {
    // 安全序列化 JSON 数据
    const payload = typeof data === "string" ? data : JSON.stringify(data);
    const body = `typeof ${callback} === 'function' && ${callback}(${payload});`;

    // 1. 设置正确的 MIME 类型
    // 2. 移除 Content-Encoding: gzip（如果配置了 express compression 中间件会自动处理，不要手动强行指定）
    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    return res.send(body);
  }

  // 非 JSONP 请求直接返回标准 JSON
  return res.json(data);
};
//模板HTML字符串与JSON对象绑定
String.prototype.bindData = function (obj, filter) {
  if (!obj || typeof obj !== "object") return this.toString();

  // 优化点 1: 正则表达式修改，通过 \s* 匹配并忽略括号内头尾空格
  // 优化点 2: 使用非贪婪匹配 [^}]+?
  const re = /{{\s*([^} \t\n\r]+)\s*}}/g;
  const _filters = filter || {};

  return this.replace(re, (match, path) => {
    // path 已经是去掉头尾空格后的键路径（如 "user.name"）
    const keys = path.split(".");
    let value = obj;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      value = value[key];

      // 如果路径中断，返回原始占位符以方便调试
      if (value === undefined || value === null) {
        return match;
      }
    }

    // 优化点 3: 检查过滤器是否存在并执行
    const lastKey = keys[keys.length - 1];
    if (typeof _filters[lastKey] === "function") {
      return _filters[lastKey](value);
    }

    return value;
  });
};

objectTool.getTime = function (time, format) {
  var format = format || "YYYY-MM-DD";
  var curDate = moment(time).format("YYYY-MM-DD");
  return curDate;
};

exports.requestTool = requestTool;
exports.objectTool = objectTool;
exports.mongoTool = mongoTool;
