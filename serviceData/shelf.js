var WebTool = require("../custom/WebTool.js");
var Feedback = require("../custom/Feedback.js");
var ConfigObject = require("../custom/ConfigObject.js");
var fs = require('fs');

function checkShelf(path) {
  var ret = true;
  var tConfig = new ConfigObject(path);
  if(tConfig.data) {
    var keys = Object.keys(tConfig.data);
    ret = (keys.length === 0);
  }
  return ret;
}

var data = {
  type: "service",
  cardData: [{
    cardName: "addClassItem",
    method: "post",
    callback: function (req, res, task) {
      var name = task.receive.name;
      if (name) {
        task.config.data["_index"] = task.config.data["_index"] || [];
        task.config.data[name] = task.config.data[name] || [];
        if(task.config.data["_index"].indexOf(name) !== -1) {
          task.config.data["_index"].push(name);
        }
        task.config.save();
        WebTool.requestTool.sendData({
          ret: 0,
          message: "增加类目成功。"
        }, req, res);
      } else {
        WebTool.requestTool.sendData({
          ret: 1,
          message: "缺少有效类目名称参数。"
        }, req, res);
      }
    }
  }, {
    cardName: "renameClassItem",
    method: "post",
    callback: function (req, res, task) {
      var name = task.receive.name;
      var newName = task.receive.newName;
      if (name && newName) {
        var tArr = task.config.data[name];
        var index = task.config.data["_index"].indexOf(name);
        if(index !== -1) {
          task.config.data["_index"][index] = newName;
        }
        delete task.config.data[name];
        task.config.data[newName] = tArr;
        task.config.save();
        WebTool.requestTool.sendData({
          ret: 0,
          message: "修改类目名称成功。"
        }, req, res);
      } else {
        WebTool.requestTool.sendData({
          ret: 1,
          message: "缺少有效类目名称参数。"
        }, req, res);
      }
    }
  }, {
    cardName: "removeClassItem",
    method: "post",
    callback: function (req, res, task) {
      var name = task.receive.name;
      if (name && task.config.data) {
        var tArr = task.config.data[name] || [];
        if (tArr.length === 0) {
          delete task.config.data[name];
          var index = task.config.data["_index"].indexOf(name);
          task.config.data["_index"].splice(index, 1);
          task.config.save();
          WebTool.requestTool.sendData({
            ret: 0,
            message: "删除类目成功。"
          }, req, res);
        } else {
          WebTool.requestTool.sendData({
            ret: 1,
            message: "删除类目失败, 需要先删除类目下的书架。"
          }, req, res);
        }

      } else {
        WebTool.requestTool.sendData({
          ret: 1,
          message: "缺少有效类目名称参数。"
        }, req, res);
      }
    }
  }, {
    cardName: "addShelfItem",
    method: "post",
    callback: function (req, res, task) {
      var name = task.receive.name;
      var className = task.receive.className;
      if (name && className) {
        task.config.data[className] = task.config.data[className] || [];

        var index = task.config.data[className].getIndex("name", name);
        console.log(index);
        console.log(task.config.data[className]);
        if (index === -1) {
          var item = {
            name: name,
            key: (new Date()).getTime()
          }
          var path = `${task.config.prefix}${item.key}.js`;
          WebTool.objectTool.saveStringToFile("var data={}; module.exports = data;", path, function () {
            console.log(`${path}保存成功！`);
          });
          task.config.data[className].push(item);
          task.config.save();
          WebTool.requestTool.sendData({
            ret: 0,
            message: "增加书架成功。"
          }, req, res);
        } else {
          WebTool.requestTool.sendData({
            ret: 1,
            message: "书架名称已存在。"
          }, req, res);
        }

      } else {
        WebTool.requestTool.sendData({
          ret: 1,
          message: "缺少有效类目名称或书架名称参数。"
        }, req, res);
      }
    }
  }, {
    cardName: "renameShelfItem",
    method: "post",
    callback: function (req, res, task) {
      var name = task.receive.name;
      var className = task.receive.className;
      var newName = task.receive.newName;
      if (name && className && newName) {
        task.config.data[className] = task.config.data[className] || [];
        var index = task.config.data[className].getIndex("name", name);
        var item = task.config.data[className][index];
        if (item) {
          item.name = newName;
        }
        task.config.save();
        WebTool.requestTool.sendData({
          ret: 0,
          message: "修改书架名称成功。"
        }, req, res);
      } else {
        WebTool.requestTool.sendData({
          ret: 1,
          message: "缺少有效类目名称参数。"
        }, req, res);
      }
    }
  }, {
    cardName: "removeShelfItem",
    method: "post",
    callback: function (req, res, task) {
      var name = task.receive.name;
      var className = task.receive.className;
      if (name && className) {
        task.config.data[className] = task.config.data[className] || [];
        var index = task.config.data[className].getIndex("name", name);
        if(index === -1) {
          WebTool.requestTool.sendData({
            ret: 0,
            message: "所删除的书架不存在。"
          }, req, res);
          return false;
        }
        
        var item = task.config.data[className][index];
        var path = `${task.config.prefix}${item.key}.js`;

        if (checkShelf(path)) {
          WebTool.objectTool.deleteFile(path, function () {
            console.log('文件:' + path + '删除成功！');
          });
          task.config.data[className].splice(index, 1);
          task.config.save();
          WebTool.requestTool.sendData({
            ret: 0,
            message: "删除书架成功。"
          }, req, res);
        } else {
          WebTool.requestTool.sendData({
            ret: 1,
            message: "删除失败，需要先删除书架中的书籍。"
          }, req, res);
        }

      } else {
        WebTool.requestTool.sendData({
          ret: 1,
          message: "缺少有效类目名称或书架名称参数。"
        }, req, res);
      }
    }
  }]
}

module.exports = data;