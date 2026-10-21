var WebTool = require("./WebTool.js");
var ConnectDB = require("./ConnectDB.js");
var ConfigObject = require("./ConfigObject.js");
var ApiKeyTool = require("./ApiKeyTool.js");
var xmlParser = require('fast-xml-parser')
var DbQuery = require("./DbQuery.js");
var fs = require("fs");
var path = require('path');

var RestFulConfig = function (data, expendApi, prefix, config) {
  this.path = "interface";
  this.config = config || {};
  // if (config) {
  //   for (var k in config) {
  //     var tPath = path.resolve(__dirname, `../interface/${config[k]}`);
  //     this.config[k] = new ConfigObject(tPath);
  //   }
  // }
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
    // var name = data[k].name || k;
    var url = "/" + k + "/:table";
    if (this.prefix) {
      url = "/" + this.prefix + url;
    }
    var dbQuery = DbQuery[type];

    //根据xml配置生成数据库操作接口
    if (type !== "mongo" && data[k].xml) {
      var xmlPath = path.resolve(__dirname, `../interface/${data[k].xml}`);
      var xmlString = fs.readFileSync(xmlPath).toString();
      var xmlJson = xmlParser.parse(xmlString, {
        attributeNamePrefix: "",
        textNodeName: "queryString",
        attrNodeName: "attr",
        ignoreAttributes: false,
        parseAttributeValue: true
      });
      if (xmlJson && xmlJson.root && xmlJson.root.interface) {
        var interface = xmlJson.root.interface;
        if (interface.constructor.name === "Object") {
          interface = [interface];
        }
        for (var i = 0; i < interface.length; i++) {
          var attr = interface[i].attr;
          var queryString = interface[i].queryString;
          if (attr && attr.name && queryString) {
            var info = JSON.parse(JSON.stringify(data[k]));
            info.queryString = queryString;
            var method = attr.method || "get";
            url = "/" + k + "/" + attr.name;
            if (this.prefix) {
              url = "/" + this.prefix + url;
            }
            if (dbQuery) {
              this.addCardData(url, dbQuery, method, info);
            }
          }
        }
      }

    }
    //mongodb操作接口全自动化生成
    else if (type === "mongo") {
      var method = "all";
      if (dbQuery) {
        this.addCardData(url, dbQuery, method, data[k]);
      }
    } else {}
  }

  //自定义数据接口生成
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
        this.addCardData(url, dbQuery, method, d, this.api[k][j]);
      }
    }
  }

}

RestFulConfig.prototype.check =function(url, method) {
  var config =  this.config || {};
  console.log(config)
  var urls = config.urls || [];
  var ret = true;
  url = url || "";

  if(method === "GET" || method === "get") {
    for(var i = 0; i < urls.length; i++) {
      if(urls[i] && urls[i].constructor.name === "RegExp" && urls[i].test(url)) {
        ret = false;
        break;
      }
    }
  }
  
 
  console.log(ret, urls, url);
  return ret;
}

RestFulConfig.prototype.addCardData = function (url, dbQuery, method, d, meta) {
  var k = url.replace(/\//g, "_");
  k = k.slice(1) || k;
  var task = {
    cardName: k,
    url: url,
    method: method,
    rest: this,
    dbQuery: dbQuery,
    callback: function (req, res, task) {
      //Todo: switch limit
      var ret = task.rest.check(req.path, req.method);
      if(!ret) {
        WebTool.requestTool.sendData({
          ret: 1,
          message: "接口不可访问。",
        }, req, res);
        return false;
      }

      // ---- Scope 权限控制（仅对标注 requiredScope 的接口生效）----
      var requiredScope = (meta && meta.requiredScope) || (d && d.requiredScope);
      if (requiredScope) {
        var authSession = (req.session && req.session.data) || {};
        if (!authSession.logined) {
          WebTool.requestTool.sendData({
            ret: 1,
            message: "请先登录账号。",
          }, req, res);
          return false;
        }
        if (!ApiKeyTool.authorize(req, requiredScope)) {
          WebTool.requestTool.sendData({
            ret: 3,
            message: "无权限（缺少 scope）。",
          }, req, res);
          return false;
        }
      }

      var dbInfo = JSON.parse(JSON.stringify(d)) || {};
      var type = dbInfo.type;
      if (type && typeof (ConnectDB[type]) === "function") {
        ConnectDB[type](req, res, dbInfo, task);
      } else if (typeof (task.dbQuery) === "function") {
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