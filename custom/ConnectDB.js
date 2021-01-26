var WebTool = require("./WebTool.js");
var MongoClient = require('mongodb').MongoClient;

var data = {
  mongo: function (req, res, d, task) {
    if (!d || !d.host) {
      WebTool.requestTool.sendData({
        ret: 1,
        message: "数据库不存在，缺少host。"
      }, req, res);
      return false;
    }

    d.port = d.port || 27017;
    d.dbName = d.dbName || "test";
    var url = `mongodb://${d.host}:${d.port}/${d.dbName}`
    if (d.username && d.password) {
      url = `mongodb://${d.username}:${d.password}@${d.host}:${d.port}/${d.dbName}`;
    }
    MongoClient.connect(url, {
      useNewUrlParser: true
    }, function (err, db) {
      if (err) {
        console.log(err);
        WebTool.requestTool.sendData({
          ret: 1,
          message: `数据库连接失败[${url}]。`
        }, req, res);
        return false;
      };
      // console.log("数据库已创建!");
      if(typeof(task.dbQuery) === "function") {
        task.dbQuery(req, res, d, db);
      }
      else {
        WebTool.requestTool.sendData({
          ret: 1,
          message: `暂时不支持该接口。`
        }, req, res);
      }
      
    });
  },
  mysql: function (req, res, task) {

  }
}




module.exports = data;