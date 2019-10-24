var express = require("express");
var multer = require('multer');
var path = require('path');
var ConfigObject = require("./custom/ConfigObject.js");
var WebService = require("./custom/WebService.js");


var t = path.resolve(__dirname, '.');
var prefix = {
  root: t + "/",
  upload: t + '/static/product',
  serviceData: t + '/serviceData/',
}

var app = express();



var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, prefix.upload)
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
var server = app.listen(port, function (a, b, c) {
  console.log(`http://localhost:${port}`);
});


var orginConfig = ConfigObject.create(prefix.serviceData + "origin.js");
var otherConfig = ConfigObject.create(prefix.serviceData + "other.js");
var webService = WebService.create(app, orginConfig, otherConfig, ConfigObject, {
  prefix: prefix
});


app.post("/upload", upload.single('fileContent'), function (req, res) {
  res.send({
    ret_code: '0'
  });
});

app.post("/crossData", function (req, res) {
  res.json({
    ret: 0,
    message: "跨域的post请求成功"
  });
});


app.get('*', function (request, response) {
  response.sendFile(path.resolve(__dirname, "static", 'index.html'))
});