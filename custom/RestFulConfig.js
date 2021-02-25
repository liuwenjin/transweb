var WebTool = require("./WebTool.js");
var ConnectDB = require("./ConnectDB.js");
var ConfigObject = require("./ConfigObject.js");
var DbQuery = require("./DbQuery.js");
var path = require('path');

var RestFulConfig = function(data, expendApi, prefix, config) {
    this.path = "interface";
    this.config = {};
    if (config) {
        for (var k in config) {
            var tPath = path.resolve(__dirname, `../interface/${config[k]}`);
            this.config[k] = new ConfigObject(tPath);
        }
    }
    this.expendApi = expendApi || {};
    this.prefix = prefix;
    this.api = {};
    for (var k in this.expendApi) {
        this.api[k] = (new ConfigObject(this.expendApi[k])).data;
    }

    this.data = {
        type: "restful",
        cardData: []
    }

    for (let k in data) {
        var type = data[k].type;
        var name = data[k].name || k;
        var url = "/" + k + "/:table";
        if (this.prefix) {
            url = "/" + this.prefix + url;
        }
        var dbQuery = DbQuery[type];
        var method = "all";
        if (dbQuery) {
            this.addCardData(url, dbQuery, method, data[k]);
        }
    }

    for (var k in this.api) {
        for (var j in this.api[k]) {

            var dbQuery = this.api[k][j].callback;
            var url = `/${k}/${j}`;
            if (this.prefix) {
                url = "/" + this.prefix + url;
            }
            var method = this.api[k][j].method || "get";
            var dbItem = this.api[k][j].dbItem || "*";
            var d = null
            if (dbItem) {
                d = data[dbItem] || {};
            }

            if (dbQuery) {
                this.addCardData(url, dbQuery, method, d);
            }
        }
    }
}

RestFulConfig.prototype.addCardData = function(url, dbQuery, method, d) {
    var k = url.replace(/\//g, "_");
    k = k.slice(1) || k;
    var task = {
        cardName: k,
        url: url,
        method: method,
        config: this.config,
        dbQuery: dbQuery,
        callback: function(req, res, task) {
            var dbInfo = JSON.parse(JSON.stringify(d)) || {};
            var type = dbInfo.type;
            if (type && typeof(ConnectDB[type]) === "function") {
                ConnectDB[type](req, res, dbInfo, task);
            } else if (typeof(task.dbQuery) === "function") {
                task.dbQuery(req, res, dbInfo);
            } else {
                WebTool.requestTool.sendData({
                    ret: 1,
                    message: "暂不支持该接口。",
                    data: {
                        // dbItem: k,
                        dbType: type
                    }
                }, req, res);
            }
        }
    }
    this.data.cardData.push(task);
}

module.exports = RestFulConfig;
