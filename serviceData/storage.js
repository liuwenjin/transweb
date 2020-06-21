var WebTool = require("../custom/WebTool.js");
var Feedback = require("../custom/Feedback.js");

function putObject(task, key, body, callback, req, res) {
  var config = task.config.data;
  task.cos.putObject({
    Bucket: `${config.bucket}-${config.appid}`,
    Region: config.region,
    Key: key,
    Body: body
  }, function (err, data) {
    if (err) {
      WebTool.requestTool.sendData({
        ret: 1,
        data: err
      }, req, res);
      return false;
    }
    if (typeof (callback) === "function") {
      callback(data);
    }
  });
}

function getBucket(task, prefix, callback, flag, req, res) {
  var config = task.config.data;
  var option = {
    Bucket: `${config.bucket}-${config.appid}`,
    Region: config.region,
    Prefix: prefix
  }
  if (flag) {
    option.Delimiter = flag;
  }
  task.cos.getBucket(option, function (err, data) {
    if (err) {
      WebTool.requestTool.sendData({
        ret: 1,
        data: err
      }, req, res);
      return false;
    }
    if (typeof (callback) === "function") {
      callback(data);
    }
  });
}

function removeObject(task, key, callback, req, res) {
  if (!key) {
    console.log(`The key [${key}] is not valid `)
    return false;
  }
  var config = task.config.data;
  var option = {
    Bucket: `${config.bucket}-${config.appid}`,
    Region: config.region,
    Key: key
  };
  if (key.constructor.name === "Array") {
    delete option.Key;
    option.Objects = key;
  }
  task.cos.deleteObject(option, function (err, data) {
    if (err) {
      console.log(err)
      return false;
    }
    if (typeof (callback) === "function") {
      callback(data);
    }
  });
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


var data = {
  type: "service",
  cardData: [{
    cardName: "createFolder",
    method: "post",
    callback: function (req, res, task) {
      var name = task.receive.name;
      var folderName = (new Date()).getTime();
      if (name) {
        var config = task.config.data;
        var path = `${config.root}${req.session.logined.user}/${folderName}/`;
        putObject(task, path, '', function (d) {
          task.index.data[folderName] = {
            name: name,
            children: []
          }
          task.index.save();
          WebTool.requestTool.sendData({
            ret: 0,
            message: "创建目录成功。"
          }, req, res);
        }, req, res);
      } else {
        WebTool.requestTool.sendData({
          ret: 1,
          message: `缺少必要的参数[name]。`
        }, req, res);
      }
    }
  }, {
    cardName: "index",
    method: "get",
    callback: function (req, res, task) {
      var folder = task.receive.folder;
      var temp = task.index.data;
      if (folder && temp[folder]) {
        temp = temp[folder];
      }
      WebTool.requestTool.sendData({
        ret: 0,
        data: temp
      }, req, res);
    }
  }, {
    cardName: "bookIndex",
    method: "post",
    callback: function (req, res, task) {
      var data = task.receive.data || [];
      var temp = task.index.data;
      if(typeof(data) === "string") {
        temp.index = JSON.parse(data);
      }
      task.index.save();
      WebTool.requestTool.sendData({
        ret: 0,
        data: temp
      }, req, res);
    }
  }, {
    cardName: "uploadFile",
    method: "post",
    callback: function (req, res, task) {
      var folder = task.receive.folder;
      var name = task.receive.name;
      var file = task.receive.file;
      var body = task.receive.body || "";
      var pObject = task.index.data[folder];
      var fName = file || (new Date()).getTime() + ".txt";
      if (folder && pObject) {
        var config = task.config.data;
        var path = `${config.root}${req.session.logined.user}/${folder}/${fName}`;
        putObject(task, path, body, function (d) {
          if (pObject.children.getIndex("path", file) === -1) {
            pObject.children.push({
              name: name,
              path: fName
            })
          }
          task.index.save();
          WebTool.requestTool.sendData({
            ret: 0,
            data: {
              path: fName,
              name: name,
              folder: folder,
              folderName: pObject.name
            },
            message: `文件上传成功(${pObject.name})。`
          }, req, res);
        }, req, res);
      } else {
        WebTool.requestTool.sendData({
          ret: 1,
          message: "缺少有效目录或者文件名。"
        }, req, res);
      }
    }
  }, {
    cardName: "removeFile",
    method: "post",
    callback: function (req, res, task) {
      var folder = task.receive.folder;
      try {
        var file = JSON.parse(task.receive.file);
      } catch (e) {}

      if (folder && file) {
        var config = task.config.data;
        var pObject = task.index.data[folder];
        if (pObject) {
          if (file.constructor.name === "String") {
            file = [file];
          }
          for (var i = 0; i < file.length; i++) {
            let key = `${config.root}${req.session.logined.user}/${folder}/${file[i]}`;
            removeObject(task, key, function (d) {
              console.log(key);
              console.log("删除成功。");
            }, req, res);
            pObject.children.removeItem("path", file[i]);

          }
          task.index.save();
          WebTool.requestTool.sendData({
            ret: 0,
            message: `文件删除成功。`
          }, req, res);

        } else {
          WebTool.requestTool.sendData({
            ret: 0,
            message: "文件路径不存在。"
          }, req, res);
        }
      } else {
        WebTool.requestTool.sendData({
          ret: 0,
          message: "缺少目录或文件名参数。"
        }, req, res);
      }

    }
  }, {
    cardName: "removeFolder",
    method: "post",
    callback: function (req, res, task) {
      var folder = task.receive.folder;
      if (folder) {
        var config = task.config.data;
        var pObject = task.index.data[folder];
        if (pObject) {
          var key = `${config.root}${req.session.logined.user}/${folder}/`;
          getBucket(task, key, function (data) {
            if (data.Contents.length !== 0) {
              for (let i = 0; i < data.Contents.length; i++) {
                let tKey = data.Contents[i].Key;
                removeObject(task, tKey, function (d) {
                  console.log(tKey + "删除成功");
                }, req, res);
              }
            }
            removeObject(task, key, function (d) {
              delete task.index.data[folder];
              task.index.save();
              WebTool.requestTool.sendData({
                ret: 0,
                message: `文件夹删除成功。`
              }, req, res);
            });
          }, "/" , req, res);
        } else {
          WebTool.requestTool.sendData({
            ret: 0,
            message: "文件路径不存在。"
          }, req, res);
        }
      } else {
        WebTool.requestTool.sendData({
          ret: 0,
          message: "缺少目录或文件名参数。"
        }, req, res);
      }
    }
  }, {
    cardName: "configFolder",
    method: "post",
    callback: function (req, res, task) {
      var folder = task.receive.folder;
      var value = task.receive.value;
      var param = task.receive.param;
      var key = task.receive.key;
      var configFolder = function (folderName, key, value) {
        var ret = 0;
        if (task.index.data[folder]) {
          if (key === "children" && typeof(value) === "string") {
            value = JSON.parse(value);
          }
          task.index.data[folder][key] = value;
          // task.index.save();
          ret = 1;
        } else {
          ret = 2;
        }
        return ret;
      }
      if (folder) {
        if (key) {
          if (folder.constructor.name === "Array") {
            for (var i = 0; i < folder.length; i++) {
              configFolder(folder[i], key, value);
            }
          } else {
            configFolder(folder, key, value);
          }
        } else if (param) {
          param = JSON.parse(param);
          for (let k in param) {
            if (folder.constructor.name === "Array") {
              for (let i = 0; i < folder.length; i++) {
                configFolder(folder[i], k, param[k]);
              }
            } else {
              configFolder(folder, k, param[k]);
            }
          }

          task.index.save();
          WebTool.requestTool.sendData({
            ret: 0,
            message: "配置参数成功。"
          }, req, res);
        } else {
          WebTool.requestTool.sendData({
            ret: 1,
            message: "缺少必要的参数。"
          }, req, res);
        }
      } else {
        WebTool.requestTool.sendData({
          ret: 1,
          message: "缺少必要的参数。"
        }, req, res);
      }

    }
  }, {
    cardName: "configFile",
    method: "post",
    callback: function (req, res, task) {
      var folder = task.receive.folder;
      var file = task.receive.file;
      var value = task.receive.value;
      if (folder && value !== undefined && file) {
        if (task.index.data[folder]) {
          var pChildren = task.index.data[folder].children;
          var index = pChildren.getIndex("path", file);
          if (index !== -1) {
            var key = task.receive.key || "name";
            task.index.data[folder].children[index][key] = value;
            task.index.save();
            WebTool.requestTool.sendData({
              ret: 0,
              data: task.index.data,
              message: "文件夹名称修改成功。"
            }, req, res);
          } else {
            WebTool.requestTool.sendData({
              ret: 1,
              message: "文件不存在"
            }, req, res);
          }
        } else {
          WebTool.requestTool.sendData({
            ret: 1,
            message: "文件夹不存在"
          }, req, res);
        }
      } else {
        WebTool.requestTool.sendData({
          ret: 1,
          message: "缺少必要的参数。"
        }, req, res);
      }
    }
  }, {
    cardName: "configCos",
    method: "post",
    callback: function(req, res, task) {
      if(task.receive && task.receive.secretId && task.receive.secretKey) {
        for(var k in task.receive) {
          task.config.data[k] = task.receive[k] || task.config.data[k];
        }
        task.config.data.time = (new Date()).getTime();
        task.config.save();
        WebTool.requestTool.sendData({
          ret: 0,
          message: "修改成功。"
        }, req, res);
      }
    }
  }]
}

module.exports = data;