var path = require('path');
var fs = require("fs");
var WebTool = require("./WebTool.js");
var ConfigObject = function (name, object, flag) {
  this.path = name;
  this.data = object;
  this.init(flag);
}
ConfigObject.prototype.init = function (flag) {
  if (!fs.existsSync(this.path)) {
    var _self = this;
    if (flag) {
      WebTool.objectTool.saveStringToFile("var data={}; module.exports = data;", this.path, function () {
        _self._init();
      });
    }
  } else {
    this._init();
  }
}
ConfigObject.prototype._init = function () {
  var exp = require(this.path);
  if (this.data) {
    for (var k in this.data) {
      exp[k] = this.data[k];
    }
    this.save();
  }
  this.data = exp;
}

ConfigObject.prototype.dataToString = function () {
  var string = "var data=" + WebTool.objectTool.objectToString(this.data || {}) + "\n module.exports = data;";
  return string;
}
ConfigObject.prototype.saveString = function (string) {
  WebTool.objectTool.saveStringToFile(string, this.path);
}

ConfigObject.prototype.save = function (data) {
  this.data = data || this.data;
  var string = this.dataToString();
  this.saveString(string);
}

ConfigObject.prototype.update = function (data) {
  for (var k in data) {
    this.data[k] = data[k];
  }
  this.save();
}


ConfigObject.prototype.get = function (key) {
  var data = null;
  var ret = null;
  if (this.config) {
    data = this.data;
    if (key && data && data[key]) {
      ret = data[key];
    }
  }
  return ret;
}

ConfigObject.prototype.remove = function (key) {
  var data = null;
  var ret = null;
  data = this.data;
  if (key && data && data[key]) {
    ret = data[key];
    delete data[key];
    this.save();
  }
  return ret;
}

ConfigObject.prototype.add = function (d, key) {
  if (typeof (d) === "string") {
    d = JSON.parse(d);
  }
  var ret = null;
  if (d && d.constructor.name === "Array") {
    ret = [];
    for (var i = 0; i < d.length; i++) {
      var t = this._add(d[i]);
      ret.push(t);
    }
  } else {
    ret = this._add(d, key);
  }
  return ret;
}


ConfigObject.prototype._add = function (d, key) {
  var data = this.data;
  if (!key && d) {
    key = murmur.x86.hash32(JSON.stringify(d), 25);
  }
  if (key && data) {
    data[key] = d;
    this.save();
    data = {
      key: key,
      value: d
    }
  }

  return data;
}



module.exports = ConfigObject;