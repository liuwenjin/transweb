var WebTool = require("./WebTool.js");
var MongoCRUD = require("./MongoCRUD.js");

var data = {
    mongo: function (req, res, dbInfo, connection) {
        var method = req.method.toLowerCase();
        if (typeof (MongoCRUD[method]) === "function") {
            MongoCRUD[method](connection, dbInfo, req, res);
        } else {
            WebTool.requestTool.sendData({
                ret: 1,
                method: req.method,
                message: "不支持该method"
            }, req, res);
            connection.close();
        }
    },
    mysql: function (req, res, dbInfo, connection) {
        var params = req.query;
        for (var k in req.body) {
            params[k] = req.body[k];
        }
        // SQL 注入缓解：转义字符串值中的单引号（标识符如 {{table}} 仍应改用参数化查询）
        var escParams = {};
        for (var k in params) {
            var v = params[k];
            escParams[k] = typeof v === "string" ? v.replace(/'/g, "''") : v;
        }
        var query = dbInfo.queryString.bindData(escParams);
        connection.query(query, function (err, result) {
            WebTool.requestTool.sendData({
                ret: 0,
                data: result
            }, req, res);
            connection.release();
        })
    },
    neo4j: function (req, res, dbInfo, driver) {
        const session = driver.session();
        var params = req.query;
        for (var k in req.body) {
            params[k] = req.body[k];
        }
        try {
            session.run(
                dbInfo.queryString, params
            ).then(result => {
                WebTool.requestTool.sendData({
                    ret: 0,
                    data: result.records
                }, req, res);
            }).then(() => {
                session.close();
                driver.close();
            }).catch(e => {
                session.close();
                driver.close();
                WebTool.requestTool.sendData({
                    ret: 1,
                    message: `执行cql失败:${dbInfo.queryString}`
                }, req, res);
            });
        } catch (e) {
            session.close();
            driver.close();
            WebTool.requestTool.sendData({
                ret: 1,
                message: `执行cql失败:${dbInfo.queryString}`
            }, req, res);
        }
    }
}

module.exports = data;