var WebTool = require("./WebTool.js");
var COS = require('cos-nodejs-sdk-v5');

var BucketItem = function (config) {
  this.config = config;
  console.log(config);
  this.cos = new COS({
    // 必选参数
    SecretId: config.secretId,
    SecretKey: config.secretKey,
  });
}

BucketItem.prototype.postObject = function (path, file, callback, req, res) {
  var config = this.config;
  var key = config.prefix + path;
  console.log(file.constructor.name);
  this.cos.postObject({
    Bucket: `${config.bucket}-${config.appid}`,
    Region: config.region,
    Key: key,
    file: file
  }, function (err, data) {
    
    console.log(err);
    if (err) {
      WebTool.requestTool.sendData({
        ret: 1,
        data: err
      }, req, res);
      return false;
    }
    if (typeof (callback) === "function") {
      callback(data, req, res);
    }
  });
}

BucketItem.prototype.putObject = function (path, body, callback, req, res) {
  var config = this.config;
  var key = config.prefix + path;
  console.log(body.constructor.name);
  this.cos.putObject({
    Bucket: `${config.bucket}-${config.appid}`,
    Region: config.region,
    Key: key,
    Body: body
  }, function (err, data) {
    
    console.log(err);
    if (err) {
      WebTool.requestTool.sendData({
        ret: 1,
        data: err
      }, req, res);
      return false;
    }
    if (typeof (callback) === "function") {
      callback(data, req, res);
    }
  });
}

BucketItem.prototype.getBucket = function(path, callback, flag, req, res) {
  var key = config.prefix + path;
  var config = this.config;
  var option = {
    Bucket: `${config.bucket}-${config.appid}`,
    Region: config.region,
    Prefix: key
  }
  if (flag) {
    option.Delimiter = flag;
  }
  this.cos.getBucket(option, function (err, data) {
    if (err) {
      WebTool.requestTool.sendData({
        ret: 1,
        data: err
      }, req, res);
      return false;
    }
    if (typeof (callback) === "function") {
      callback(data, req, res);
    }
  });
}

BucketItem.prototype.removeObject = function(path, callback, req, res) {
  if (!path) {
    var msg = `The path [${path}] is not valid `;
    WebTool.requestTool.sendData({
      ret: 1,
      data: msg
    }, req, res);
    return false;
  }
  var config = this.config;
  var key = config.prefix + path;
  var option = {
    Bucket: `${config.bucket}-${config.appid}`,
    Region: config.region,
    Key: key
  };
  if (key.constructor.name === "Array") {
    delete option.Key;
    option.Objects = key;
  }
  this.cos.deleteObject(option, function (err, data) {
    if (err) {
      WebTool.requestTool.sendData({
        ret: 1,
        data: err
      }, req, res);
      return false;
    }
    if (typeof (callback) === "function") {
      callback(data, req, res);
    }
  });
}



module.exports = BucketItem;