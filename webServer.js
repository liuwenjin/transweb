var express = require("express");
var multer = require('multer');
var session = require('express-session');
var path = require('path');
var ConfigObject = require("./custom/ConfigObject.js");
var WebService = require("./custom/WebService.js");
var WebTool = require("./custom/WebTool.js");
var COS = require('cos-nodejs-sdk-v5');

var t = path.resolve(__dirname, '.');
var commonPath = {
  root: t + "/",
  upload: t + '/static/product',
  serviceData: t + '/serviceData/',
  configData: t + "/" + "configData.js",
  bookData: t + "/" + "bookData/"
}

var app = express();
app.use(session({
  secret: "transweb", //secret的值建议使用随机字符串
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 60 * 1000 * 300
  } // 过期时间（毫秒）
}));

var bodyParser = require('body-parser'); //用于req.body获取值的
app.use(bodyParser.json());
// 创建 application/x-www-form-urlencoded 编码解析
app.use(bodyParser.urlencoded({
  extended: false
}));

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, commonPath.upload)
  },
  filename: function (req, file, cb) {
    var name = file.originalname || (new Date()).getTime();
    file.name = name + "";
    cb(null, file.name)
  }
});

var upload = multer({
  storage: storage
});


app.use(express.static("static", {}));
//初始化Web服务
var port = 8080;
var urlPrefix = `http://0.0.0.0:${port}`;
var server = app.listen(port, function (a, b, c) {
  console.log(urlPrefix);
});


var iConfig = new ConfigObject(commonPath.serviceData + "config.js");


var iService = new WebService(app, iConfig, {
  root: "config",
  begin: function (req, res, task) {
    var ret = true;
    //configObject index
    var index = commonPath.configData;
    var tConfig = new ConfigObject(index);
    tConfig = tConfig.data;
    var object = task.receive.object;
    if (object) {
      var tPath = tConfig[object];
      var iPath = tPath;
      if (typeof (tPath) === "string") {
        //configObject prefix
        var myPath = commonPath.root + tPath;
        if (req.session && req.session.logined) {
          myPath = myPath.bindData(req.session.logined);
        }
        if (task.receive) {
          myPath = myPath.bindData(task.receive);
        }

        task.config = new ConfigObject(myPath);
      } else {
        WebTool.requestTool.sendData({
          ret: 1,
          message: "操作对象暂时不存在。"
        }, req, res);
        ret = false;
      }
    } else {
      WebTool.requestTool.sendData({
        ret: 1,
        message: "缺少必要的参数object。"
      }, req, res);
      ret = false;
    }
    return ret;
  }
});
console.log(urlPrefix + "/" + iService.id)

var bConfig = new ConfigObject(commonPath.serviceData + 'storage.js');
var bService = new WebService(app, bConfig, {
  begin: function (req, res, task) {
    var ret = true;
    var session = req.session || {};
    if (session.logined && session.logined.user) {
      var user = session.logined.user;
      var object = session.logined.object;
      var tPath = `${commonPath.bookData}config.js`;
      var config = new ConfigObject(tPath);
      console.log(config.data.time);
      if (config.data && config.data.secretId && config.data.secretKey) {
        task.config = config;
        task.cos = new COS({
          // 必选参数
          SecretId: config.data.secretId,
          SecretKey: config.data.secretKey,
        });
        var index = commonPath.configData;
        var tConfig = new ConfigObject(index);
        tConfig = tConfig.data;
        tPath = tConfig["storage"].bindData(session.logined);
        tPath = tPath.bindData(task.receive);
        task.index = new ConfigObject(commonPath.root + tPath);
      } else {
        WebTool.requestTool.sendData({
          ret: 1,
          message: "当前处在未登录状态或者登录账号有异常。"
        }, req, res);
        ret = false;
      }
    } else {
      WebTool.requestTool.sendData({
        ret: 1,
        message: "当前处在未登录状态或者登录账号有异常。"
      }, req, res);
      ret = false;
    }
    return ret;
  }
});
console.log(urlPrefix + "/" + bService.id)

var sConfig = new ConfigObject(commonPath.serviceData + 'shelf.js');
var sService = new WebService(app, sConfig, {
  begin: function (req, res, task) {
    var ret = true;
    var session = req.session || {};
    if (session.logined && session.logined.user) {
      var user = session.logined.user;
      var object = session.logined.object;
      var tPath = `${commonPath.bookData}${user}/index.js`;
      var config = new ConfigObject(tPath);
      if (config.data) {
        task.config = config;
      } else {
        task.config  = new ConfigObject(tPath, {});
        task.config.save();
      }
      //shelf path prefix
      task.config.prefix = `${commonPath.bookData}${user}/shelf/`

    } else {
      WebTool.requestTool.sendData({
        ret: 1,
        message: "当前处在未登录状态或者登录账号有异常。"
      }, req, res);
      ret = false;
    }
    

    return ret;
  }
});
console.log(urlPrefix + "/" + sService.id);

