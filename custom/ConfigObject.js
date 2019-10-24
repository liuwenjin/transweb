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

exports.create = function (name, obj, flag) {
  return new ConfigObject(name, obj, flag);
};