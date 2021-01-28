var express = require("express");
var path = require('path');
const bodyParser = require("body-parser");

var ConfigObject = require("./custom/ConfigObject.js");
var WebService = require("./custom/WebService.js");
var RestFulConfig = require("./custom/RestFulConfig.js");

var t = path.resolve(__dirname, '.');
var prefix = {
    root: t + "/",
    configData: t + '/interface/'
}

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static("static", {}));
//初始化Web服务
const port = 8686;
var urlPrefix = `http://localhost:${port}`;
var server = app.listen(port, function(a, b, c) {
    const host = "localhost";
    console.log(urlPrefix);
});

var cPath = prefix.configData + "index.js";
var config = new ConfigObject(cPath);


var apiFiles = config.data.apiFiles;
for (var k in apiFiles) {
    apiFiles[k] = prefix.configData + apiFiles[k];
}

var restfulConfig = new RestFulConfig(config.data.mongodb, apiFiles, config.data.prefix);

webService = new WebService(app, restfulConfig, {
    prefix: prefix
});
console.log(urlPrefix + "/" + webService.id);