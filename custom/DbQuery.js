var WebTool = require("./WebTool.js");
var MongoCRUD = require("./MongoCRUD.js");

var data = {
  mongo: function (req, res, dbInfo, db) {
    var method = req.method.toLowerCase();
    if(typeof(MongoCRUD[method]) === "function") {
      MongoCRUD[method](db, dbInfo, req, res);
    }
    else {
      WebTool.requestTool.sendData({
        ret: 0,
        method: req.method,
        message: "不支持该method"
      }, req, res);
      db.close();
    }
  }
}

module.exports = data;