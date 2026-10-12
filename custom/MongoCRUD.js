var WebTool = require("./WebTool.js");
var ObjectId = require('mongodb').ObjectId;

var MongoCRUD = {
  get: function (db, dbInfo, req, res) {
    let dbItem = db.db ? db.db(dbInfo.database) : db;
    var tName = req.params.table;
   
    var tObject = dbItem.collection(tName);
    var condition = req.query.condition || "{}";
    var config = req.query.config || "{}";
    let tSize = req.query.size || req.query.pageSize || 0;
    let tCurrent = req.query.current;

    var type = req.query.type;
    if (typeof condition === "string") {
      try {
        condition = JSON.parse(condition);
      } catch(e) {
        return WebTool.requestTool.sendData({ ret: 1, message: "condition解析失败，需要为JSON字符串" }, req, res);
      }
    }

    if (typeof config === "string") {
      try {
        config = JSON.parse(config) || {};
      } catch(e) { config = {}; }
    }

    config.size = tSize || config.size;
    config.current = tCurrent || config.current;

    if (condition["_id"]) {
      var idString = String(condition["_id"]);
      if (idString.length === 12 || idString.length === 24) {
        try {
          condition["_id"] = ObjectId(idString);
        } catch (e) {
          console.log(e);
        }
      }
    }

    condition = WebTool.mongoTool.sanitizeQuery(condition);

    var method = type === "single" ? "findOne" : "find";

    if (method === "findOne") {
      // 修复：findOne 接受 (condition, callback)，没有 .toArray()
      tObject.findOne(condition, function (err, doc) {
        if (err) {
          WebTool.requestTool.sendData({ ret: 1, message: "查询出现异常。" }, req, res);
        } else {
          WebTool.requestTool.sendData({ ret: 0, data: doc, message: "success" }, req, res);
        }
      });
    } else if (method === "find") {
      var temp = tObject.find(condition);
      temp.count((err, count) => {
        var size = parseInt(config.pageSize || config.size || 10);
        var sort = config.sort || {};
        var current = parseInt(config.current || 1);
        if (current < 1) current = 1;

        temp.skip(size * (current - 1)).sort(sort).limit(size).toArray(function (err, result) {
          // 移除：db.close(); 保持单例连接池活跃
          if (err) {
            WebTool.requestTool.sendData({ ret: 1, message: "查询出现异常。" }, req, res);
          } else {
            WebTool.requestTool.sendData({
              ret: 0,
              pageSize: size,
              current: current,
              total: count,
              data: result,
            }, req, res);
          }
        });
      });
    } else {
      if (config && config.group) {
        var arr = [{ $group: { _id: "$" + config.group, value: { $sum: 1 } } }];
        if (condition) arr.push({ $match: condition });

        tObject.aggregate(arr).toArray(function (err, result) {
          if (err) {
            console.log(err);
            return WebTool.requestTool.sendData({ ret: 1, message: "聚合查询失败" }, req, res);
          }
          result = (result || []).map(item => ({ name: item._id, value: item.value }));
          WebTool.requestTool.sendData({ ret: 0, message: "success", data: result }, req, res);
        });
      } else {
        WebTool.requestTool.sendData({ ret: 1, message: "缺少统计对象列名称。" }, req, res);
      }
    }
  },

  put: function (db, dbInfo, req, res) {
    let dbItem = db.db ? db.db(dbInfo.database) : db;
    var tName = req.params.table;
    var tObject = dbItem.collection(tName);
    var data = req.body.data || req.query.data;

    if (!data) {
      // 移除：db.close();
      return WebTool.requestTool.sendData({ ret: 1, message: "缺少必要的data参数" }, req, res);
    }

    if (typeof data === "string") {
      try { data = JSON.parse(data); } catch (e) { console.log(e); }
    }

    if (!Array.isArray(data)) {
      data = [data];
    }

    data = data.map(item => {
      item._time = (new Date()).getTime();
      delete item._id;
      return item;
    });

    tObject.insertMany(data, function (err, result) {
      // 移除：db.close();
      if (err) {
        return WebTool.requestTool.sendData({ ret: 1, message: err.message }, req, res);
      }
      WebTool.requestTool.sendData({ ret: 0, data: result }, req, res);
    });
  },

  post: function (db, dbInfo, req, res) {
    let dbItem = db.db ? db.db(dbInfo.database) : db;
    var tName = req.params.table;
    var tObject = dbItem.collection(tName);
    var condition = req.body.condition || req.query.condition;
    var set = req.body.set || req.query.set;
    var type = req.body.type || req.query.type;

    if (!condition || !set) {
      // 移除：db.close();
      return WebTool.requestTool.sendData({ ret: 1, message: "缺少必要的参数" }, req, res);
    }

    if (typeof condition === "string") {
      try { condition = JSON.parse(condition); } catch(e) {}
    }
    if (typeof set === "string") {
      try { set = JSON.parse(set); } catch (e) {}
    }

    if (condition["_id"]) {
      try { condition["_id"] = ObjectId(condition["_id"]); } catch(e) {}
    }

    condition = WebTool.mongoTool.sanitizeQuery(condition);

    var method = type === "single" ? "updateOne" : "updateMany";

    tObject[method](condition, { $set: set }, function (err, result) {
      // 移除：db.close();
      if (err) {
        return WebTool.requestTool.sendData({ ret: 1, message: err.message }, req, res);
      }
      WebTool.requestTool.sendData({ ret: 0, data: result }, req, res);
    });
  },

  delete: function (db, dbInfo, req, res) {
    let dbItem = db.db ? db.db(dbInfo.database) : db;
    var tName = req.params.table;
    var tObject = dbItem.collection(tName);
    var condition = req.body.condition || req.query.condition;
    var type = req.body.type || req.query.type;

    if (!condition) {
      // 移除：db.close();
      return WebTool.requestTool.sendData({ ret: 1, message: "缺少必要的参数condition" }, req, res);
    }

    if (typeof condition === "string") {
      try { condition = JSON.parse(condition); } catch(e) {}
    }
    if (condition["_id"]) {
      try { condition["_id"] = ObjectId(condition["_id"]); } catch(e) {}
    }

    condition = WebTool.mongoTool.sanitizeQuery(condition);

    var method = type === "single" ? "deleteOne" : "deleteMany";

    tObject[method](condition, function (err, d) {
      // 移除：db.close();
      if (err) {
        return WebTool.requestTool.sendData({ ret: 1, message: err.message }, req, res);
      }
      WebTool.requestTool.sendData({ ret: 0, data: d ? d.result : null }, req, res);
    });
  }
};

module.exports = MongoCRUD;