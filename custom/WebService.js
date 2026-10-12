let mmh3 = require('murmurhash3js');
let WebTool = require("./WebTool.js");
// 1. 定义手动设置跨域头的“小助手”
const manualCors = (req, res, next) => {
  // 允许的源（生产环境建议将 '*' 换成具体域名）
  res.header('Access-Control-Allow-Origin', "*");
  // 允许的 Header 种类（如 Content-Type, Authorization 等）
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // 允许的方法
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');

  // 2. 关键：处理预检请求 (OPTIONS)
  // 如果不处理它，POST 请求将永远无法到达后面的逻辑
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
};

let WebService = function (app, service, param) {
  this.app = app;
  this.service = service;
  this.param = param || {};
  if (typeof (param) === "string") {
    this.param = {
      root: param
    }
  }
  this.param.root = this.param.root || "";
  for (var i in service.data.cardData) {
    var item = service.data.cardData[i];
    item.param = this.param;
    if (this.param.root && item.cardName) {
      item.url = "/" + this.param.root + "/" + item.cardName;
    } else {
      item.url = item.url || "/" + item.cardName;
    }
    this.addItem(item);
  }
  var _self = this;
  var hashValue = _self.service.path;
  if (hashValue.search(".js") !== -1) {
    hashValue = mmh3.x86.hash32(_self.service.path + "");
  }
  var tItem = {
    url: "/" + hashValue,
    method: "get",
    callback: function (req, res, task) {
      var data = _self.getInterface();
      _self.sendData(data, req, res);
    }
  }
  this.id = hashValue;
  _self.addItem(tItem);
}

WebService.prototype.sendData = function (data, req, res) {
  res.setHeader('content-type', 'text/html;charset=utf-8');
  if (req.query && req.query.callback) {
    //jsonp
    if (typeof (data) === "object") {
      data = WebTool.objectTool.objectToString(data);
    }
    var param = {
      callback: req.query.callback,
      data: data
    };
    var str = "typeof {{callback}} === 'function' && {{callback}}({{data}})".bindData(param);
    res.send(str);
  } else {
    //json
    res.json(data);
  }
}

WebService.prototype.addItem = function (task, config) {
  var method = task.method || "get";
  var _self = this;
  let callback = function (req, res) {
    task.receive = {};
    task.param = _self.param;
    for (var k in req.query) {
      task.receive[k] = req.query[k];
    }
    for (var k in req.body) {
      task.receive[k] = req.body[k];
    }
    if (_self.param && typeof (_self.param.begin) === "function" && req.url !== ("/" + _self.id)) {
      var ret = _self.param.begin(req, res, task);
      if (ret === false) {
        return false;
      }
    }
    task.callback(req, res, task);
    if (_self.param && typeof (_self.param.end) === "function") {
      _self.param.end(req, res, task);
    }
  };
  if(task.CORS) {
    this.app[method](task.url, manualCors, callback);
  }
  else {
    this.app[method](task.url, callback);
  }
}
WebService.prototype.getInterface = function () {
  var cData = this.service.data.cardData;
  var iData = {};
  for (var i = 0; i < cData.length; i++) {
    var url = cData[i].url || ("/" + cData[i].cardName);
    if (url) {
      iData[cData[i].cardName] = {
        url: url,
        method: cData[i].method,
        // param: this.param
      }
    }
  }
  return iData;
}


module.exports = WebService;