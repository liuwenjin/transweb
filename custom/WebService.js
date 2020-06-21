var mmh3 = require('murmurhash3js');

var WebService = function (app, service, param) {
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
  var hashValue = mmh3.x86.hash32(_self.service.path, 22);
  // var hashValue = _self.service.path
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
      data = objectTool.objectToString(data);
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
  this.app[method](task.url, function (req, res) {
    task.receive = {};
    for(var k in req.query) {
      task.receive[k] = req.query[k];
    }
    for(var k in req.body) {
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
  });
}
WebService.prototype.getInterface = function () {
  var cData = this.service.data.cardData;
  var iData = {};
  for (var i = 0; i < cData.length; i++) {
    if (cData[i].cardName) {
      iData[cData[i].cardName] = {
        url: cData[i].url,
        method: cData[i].method
      }
    }
  }
  return iData;
}


module.exports = WebService;