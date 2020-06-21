var path = require('path');
var fs = require("fs");
var moment = require('moment');

var objectTool = {};
objectTool.objectToString = function (obj) {
  if (obj && obj.constructor.name === "Object") {
    var str = "{";
    for (var k in obj) {
      if (typeof (obj[k]) === "string") {
        str += k + ":'" + obj[k] + "',";
      } else {
        str += k + ":" + this.objectToString(obj[k]) + ","
      }
    }
    if (str.length === 1) {
      str = "{}"
    } else {
      str = str.slice(0, str.length - 1) + "}";
    }
  } else if (obj && (obj.constructor.name === "Array")) {
    if (obj.length > 0) {
      var str = "[ " + this.objectToString(obj[0]);
      for (var i = 1; i < obj.length; i++) {
        str += "," + this.objectToString(obj[i]);
      }
      str += "]"
    } else {
      var str = "[]";
    }
  } else if (obj && (obj.constructor.name === "Function")) {
    var str = obj.toString();
  } else if ((typeof (obj) === "string")) {
    var str = "'" + obj + "'";
  } else if ((typeof (obj) === "number") || (typeof (obj) === "boolean") || (typeof (obj) === "undefined") || obj === null) {
    var str = obj;
  } else {
    var str = "''";
  }
  return str;
}

objectTool.getTime = function (format, time) {
  var format = format || "YYYY-MM-DD";
  var curDate = moment(time).format("YYYY-MM-DD");
  return curDate;
}

objectTool.urlQuery = function (url, key) {
  if (url) {
    var re = new RegExp(key + "=([^\&]*)", "i");
    var a = re.exec(url);
    if (a == null) {
      return null;
    }
    return a[1];
  } else {
    return null;
  }
}

objectTool.attachParams = function(url, params) {
  if(!url) {
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
}

objectTool.saveStringToFile = function (string, path, callback) {
  fs.open(path, "w+", function (err, fd) {
    fs.writeFile(fd, string, {
      encoding: "utf8"
    }, function (err) {
      if (typeof (callback) === "function") {
        callback(err);
      }
      fs.close(fd, function (err) {});
    });
  });
}

objectTool.readFile = function (path, callback) {
  fs.readFile(path, 'utf-8', function (err, data) {
    if (err) {
      console.log(data);
    } else {
      if (typeof (callback) === "function") {
        callback(data);
      }
    }
  })
}

objectTool.deleteFile = function(path, callback) {
  console.log(path)
  if(fs.existsSync(path)) {
    fs.unlink(path, function (err) {
      if (err) {
        throw err;
      }
      if(typeof(callback) === "function") {
        callback();
      }
    })
  }
}

objectTool.stringToObject = function (str) {
  function getObj(data) {
    return data;
  }
  try {
    var data = eval("getObj(" + str + ")");
    return data;
  } catch (e) {
    return str;
  }
}

objectTool.isExpired = function (duration, time) {
  var now = moment().format();
  var t = moment(time).add(duration, "y");
  return t < now;
}

objectTool.calcOrderList = function (list, config) {
  var v = 0;
  for(var i = 0; i < list.length; i++) {
    var id = list[i].product_id;
    if(!id) {
      continue;
    }
    var arr = id.split("_");
    if(arr.length < 4) {
      continue;
    }
    var volume = arr[1];
    volume = config.vMap[volume];
    var duration = arr[3];
    duration = config.vMap[duration];
    var time = list[i].time;
    if(!this.isExpired(duration, time)) {
      v += volume;
    }
  }
  return v;
}

var requestTool = {};

requestTool.getClientIp = function (req) {
  return req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
};

requestTool.sendData = function (data, req, res) {
  
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
    res.setHeader('content-type', 'text/html;charset=utf-8');
    res.send(str);
  } else {
    //json
    res.json(data);
  }
  return ;
}
//模板HTML字符串与JSON对象绑定
String.prototype.bindData = function (obj, filter) {
  var ret = this;
  if (obj && typeof (obj) === "object") {
    var re = /{{([^}}]+)?}}/g;
    this.filter = filter;
    var _self = this;
    var ret = this.replace(re, function (m, t) {
      var temp = obj;
      var ret = (function () {
        var o = temp;
        var keys = t.split(".");
        for (var i = 0; i < keys.length; i++) {
          o = o[keys[i]];
          if (o === undefined || o === null) {
            o = "{{" + keys[i] + "}}";
          }
        }
        var m = !(_self.filter && typeof (_self.filter[keys[i - 1]]) === "function") ? o : _self.filter[keys[i - 1]](o);
        return m;
      })();
      return ret;
    });
  }
  return ret;
}

Array.prototype.getIndex = function (key, value) {
  var ret = -1;
  for (var i = 0; i < this.length; i++) {
    if (this[i][key] === value) {
      ret = i;
      break;
    }
  }
  return ret;
}

Array.prototype.removeItem = function (key, value) {
  var index = this.getIndex(key, value);
  var ret = this.splice(index, 1);
  return ret;
}


exports.requestTool = requestTool;
exports.objectTool = objectTool;