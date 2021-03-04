var WebTool = require("./WebTool.js");
var ObjectId = require('mongodb').ObjectId;

var MongoCRUD = {
    get: function(db, dbInfo, req, res) {
        var dbItem = db.db(dbInfo.dbName);
        var tName = req.params.table;
        var tObject = dbItem.collection(tName);
        var condition = req.query.condition || "{}";
        var config = req.query.config || "{}"
        var type = req.query.type;
        if (typeof(condition)) {
            condition = JSON.parse(condition);
        }
        if (typeof(config)) {
            config = JSON.parse(config);
        }

        if (condition["_id"]) {
            condition["_id"] = ObjectId(condition["_id"]);
        }

        var method = type || "find";
        if (type === "single") {
            method = "findOne";
        }

        if (method === "findOne") {
            var temp = tObject[method](condition, function(err, doc) {
                if (err) {
                    WebTool.requestTool.sendData({
                        ret: 1,
                        message: "查询出现异常。"
                    }, req, res);
                } else {
                    WebTool.requestTool.sendData({
                        ret: 0,
                        data: doc,
                        message: "success"
                    }, req, res);
                }
            });
        } else if (method === "find") {
            var temp = tObject[method](condition);
            temp.count((err, count) => {
                var size = config.pageSize || config.size || 10;
                var current = config.current || 0;
                if (current < 0) {
                    current = 0;
                }
                temp.skip(size * current).limit(size).toArray(function(err, result) {
                    db.close();
                    if (err) {
                        WebTool.requestTool.sendData({
                            ret: 1,
                            message: "查询出现异常。"
                        }, req, res);
                        throw err;
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
            // var temp = tObject[method];
            if (config && config.group) {
                var arr = [{
                    $group: {
                        _id: "$" + config.group,
                        value: {
                            $sum: 1
                        }
                    }
                }]
                if (condition) {
                    arr.push({
                        $match: condition
                    })
                }

                console.log(arr);

                var ret = tObject.aggregate(arr).toArray(function(err, result) {
                    if (err) {
                        console.log(err);
                    }
                    result = result.map(item => {
                        return {
                            name: item._id,
                            value: item.value
                        }
                    });
                    WebTool.requestTool.sendData({
                        ret: 0,
                        message: "success",
                        data: result
                    }, req, res);
                });
            } else {
                WebTool.requestTool.sendData({
                    ret: 1,
                    message: "缺少统计对象列名称。"
                }, req, res);
            }

        }

    },
    put: function(db, dbInfo, req, res) {
        var dbItem = db.db(dbInfo.dbName);
        var tName = req.params.table;
        var tObject = dbItem.collection(tName);
        var data = req.body.data || req.query.data;
        if (!data) {
            db.close();
            WebTool.requestTool.sendData({
                ret: 1,
                message: "缺少必要的data参数",
            }, req, res);
            return false;
        }
        data = JSON.parse(data);
        if (data.constructor.name !== "Array") {
            data = [data];
        }
        tObject.insertMany(data, function(err, result) {
            db.close();
            if (err) throw err;
            WebTool.requestTool.sendData({
                ret: 0,
                data: result,
            }, req, res);
        })
    },
    post: function(db, dbInfo, req, res) {
        var dbItem = db.db(dbInfo.dbName);
        var tName = req.params.table;
        var tObject = dbItem.collection(tName);
        var condition = req.body.condition || req.query.condition;
        var set = req.body.set || req.query.set;
        var type = req.body.type || req.query.type;
        if (!condition || !set) {
            db.close();
            WebTool.requestTool.sendData({
                ret: 1,
                message: "缺少必要的参数",
            }, req, res);
            return false;
        } else {
            if (typeof(condition) === "string") {
                condition = JSON.parse(condition);
            }
            if (typeof(set) === "string") {
                set = JSON.parse(set);
            }
            if (condition["_id"]) {
                condition["_id"] = ObjectId(condition["_id"]);
            }
            var method = "updateMany";
            if (type === "single") {
                method = "updateOne";
            }
            tObject[method](condition, {
                $set: set
            }, function(err, result) {
                db.close();
                if (err) throw err;
                console.log("文档更新成功");
                WebTool.requestTool.sendData({
                    ret: 0,
                    data: result,
                }, req, res);
            })
        }

    },
    delete: function(db, dbInfo, req, res) {
        var dbItem = db.db(dbInfo.dbName);
        var tName = req.params.table;
        var tObject = dbItem.collection(tName);
        var condition = req.body.condition || req.query.condition;
        var type = req.body.type || req.query.type;
        if (!condition) {
            db.close();
            WebTool.requestTool.sendData({
                ret: 1,
                message: "缺少必要的参数condition",
            }, req, res);
            return false;
        } else {
            if (typeof(condition) === "string") {
                condition = JSON.parse(condition);
            }
            if (condition["_id"]) {
                condition["_id"] = ObjectId(condition["_id"]);
            }
            var method = "deleteMany";
            if (type === "single") {
                method = "deleteOne";
            }
            tObject[method](condition, function(err, d) {
                db.close();
                if (err) throw err;
                console.log("文档删除成功");
                WebTool.requestTool.sendData({
                    ret: 0,
                    data: d.result,
                }, req, res);
            })
        }
    }
}

module.exports = MongoCRUD;
