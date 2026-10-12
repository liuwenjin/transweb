var WebTool = require("./WebTool.js");
var path = require('path');
const fs = require('fs');

function checkPath(tPath, flag) {
  var ret = null;
  if (tPath && typeof (tPath) === "string") {
    var pArr = tPath.split("/");
    ret = {
      type: "file",
      isValid: false,
      isExist: fs.existsSync(tPath)
    }
    if (flag) {
      ret.type = "folder";
    }
    var tItem = pArr.pop();
    var rPath = pArr.join("/");
    ret.isValid = fs.existsSync(rPath);
    if (ret.isValid) {
      var t = fs.statSync(rPath);
      ret.isValid = !(t.isFile());
    }
  }
  return ret;
}

function renameFileName(tPath, name) {
  if (!name) {
    return false;
  }
  var ret = 1;
  var mPath = path.resolve(__dirname, "../static/" + "bucket");
  var mArr = mPath.split("/");
  var t = fs.statSync(tPath);
  if (fs.existsSync(tPath) && t.isFile()) {
    var arr = tPath.split("/");
    arr.pop();
    var tFolder = JSON.parse(JSON.stringify(arr));
    var tArr = name.split("/");
    if (tArr.length === 1) {
      arr.push(name);
    } else {
      var mArr = [];
      for (var i = 0; i < tArr.length; i++) {
        if (tArr[i] === "..") {
          arr.pop();
        } else if (tArr[i] !== ".") {
          mArr.push(tArr[i]);
        } else {

        }
      }
      tFolder = JSON.parse(JSON.stringify(arr));
      if (mArr.length === 0) {
        return false;
      }
      for (var j = 0; j < mArr.length; j++) {
        if (j === mArr.length - 2) {
          tFolder = JSON.parse(JSON.stringify(arr));
        }
        arr.push(mArr[j]);
      }
    }
    if (fs.existsSync(tFolder.join("/")) && tFolder.length < mArr.length) {
      fs.renameSync(tPath, arr.join("/"));
      ret = 0;
    } else {
      ret = 3;
    }
  }
  return ret;
}

function removeByPath(tPath, flag) {
  var ret = 0;
  console.log(tPath)
  if (fs.existsSync(tPath)) {
    var t = fs.statSync(tPath);
    if (t.isFile()) {
      fs.unlinkSync(tPath);
    } else {
      var arr = getDirFilePathArr(tPath);
      if (arr.length === 0) {
        fs.rmdirSync(tPath);
      } else if (flag) {
        for (var i = 0; i < arr.length; i++) {
          removeByPath(arr[i], flag);
        }
      } else {
        ret = 1;
      }
    }
  } else {
    ret = 2;
  }
  return ret;
}

function getDirFilePathArr(dir) {
  var arr = [];
  if (fs.existsSync(dir)) {
    arr = fs.readdirSync(dir, {
      withFileTypes: true
    });
    arr = arr.map(item => {
      var name = item.name || item;
      var tPath = dir + "/" + name;
      var data = fs.statSync(tPath);
      return {
        name: name,
        isFile: data.isFile(),
        attrs: data
      }
    })
  }
  else {
    arr = null;
  }

  return arr;
}

var BucketCRUD = {
  get: function (req, res) {
    var tPath = req.path;
    tPath = path.resolve(__dirname, "../static/" + tPath);
    tPath = decodeURIComponent(tPath);
    var tArr = getDirFilePathArr(tPath);
    if(tArr) {
      WebTool.requestTool.sendData({
        ret: 0,
        data: tArr,
        meta: {
          code: 0,
          message: "Bucket操作:get。"
        },
        path: req.path,
      }, req, res);
    }
    else {
      WebTool.requestTool.sendData({
        ret: 1,
        meta: {
          code: 404,
          message: "Bucket操作:get。"
        },
        path: req.path
      }, req, res);
    }
  },
  put: function (req, res) {
    console.log("###put file:", req.path, req.file);
    let file = req.file;
    var tPath = req.path;
    tPath = path.resolve(__dirname, "../static/" + tPath);
    tPath = decodeURIComponent(tPath);
    var t = (req.path[req.path.length - 1] === "/");
    var info = checkPath(tPath, t);
    var ret = {
      code: 1,
      method: req.method,
      path: req.path,
      message: "Bucket操作失败。"
    }
    if ((!t) && info.isValid && file) {
      fs.renameSync(file.path, tPath);
      ret.code = 0;
      ret.message = "上传文件成功。"
      WebTool.requestTool.sendData(ret, req, res);
    } else if (t && info.isValid) {
      if (!info.isExist) {
        fs.mkdirSync(tPath);
        ret.code = 0;
        ret.message = "创建文件夹成功。"
      } else {
        var t = fs.statSync(tPath);
        if (!t.isFile()) {
          ret.code = 1;
          ret.message = "文件夹已存在。"
        } else {
          ret.code = 1;
          ret.message = "同名文件已存在。"
        }
      }
      WebTool.requestTool.sendData(ret, req, res);
    } else {
      WebTool.requestTool.sendData(ret, req, res);
    }
  },
  delete: function (req, res) {
    var tPath = req.path;
    tPath = path.resolve(__dirname, "../static/" + tPath);
    console.log("delete", tPath);

    tPath = decodeURIComponent(tPath);
    var ret = removeByPath(tPath, req.query.flag);
    var msg = "删除操作成功";
    if (ret !== 0) {
      msg = "删除操作失败";
    }
    WebTool.requestTool.sendData({
      code: ret,
      method: req.method,
      message: msg
    }, req, res);
  },
  post: function (req, res) {
    var tPath = req.path;
    var name = req.body.name;
    tPath = path.resolve(__dirname, "../static/" + tPath);
    tPath = decodeURIComponent(tPath);
    var ret = 5;
    if (fs.existsSync(tPath)) {
      ret = renameFileName(tPath, name);
    }
    var msg = "重命名操作成功";
    if (ret !== 0) {
      msg = "重命名操作失败"
    }
    WebTool.requestTool.sendData({
      code: ret,
      method: req.method,
      message: msg
    }, req, res);

  }
}

module.exports = BucketCRUD;