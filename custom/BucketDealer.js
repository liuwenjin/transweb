var WebTool = require("./WebTool.js");
var path = require('path');
const fs = require('fs');

// 桶文件系统根目录：所有桶操作都不得越过该目录
const BUCKET_ROOT = path.resolve(__dirname, "../static/bucket");

// 将 req.path 解码并解析为位于 BUCKET_ROOT 之内的绝对路径；越界/非法返回 null。
// 先 decode 再 resolve，再用 path.relative 校验结果仍在根目录内，杜绝 %2e%2e 逃逸。
function resolveBucketPath(reqPath) {
  if (typeof reqPath !== "string") return null;
  let decoded;
  try {
    decoded = decodeURIComponent(reqPath);
  } catch (e) {
    return null;
  }
  const marker = "/bucket/";
  if (decoded.indexOf(marker) !== 0) return null;
  const sub = decoded.slice(marker.length);
  const resolved = path.resolve(BUCKET_ROOT, sub);
  const rel = path.relative(BUCKET_ROOT, resolved);
  if (rel === ".." || rel.startsWith(".." + path.sep) || path.isAbsolute(rel)) {
    return null;
  }
  return resolved;
}

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
  if (!name || typeof name !== "string") {
    return 3;
  }
  if (!fs.existsSync(tPath)) return 3;
  let t;
  try {
    t = fs.statSync(tPath);
  } catch (e) {
    return 3;
  }
  if (!t.isFile()) return 3;
  // 目标路径必须仍位于 BUCKET_ROOT 之内
  const target = path.resolve(path.dirname(tPath), name);
  const rel = path.relative(BUCKET_ROOT, target);
  if (rel === ".." || rel.startsWith(".." + path.sep) || path.isAbsolute(rel)) {
    return 3;
  }
  fs.renameSync(tPath, target);
  return 0;
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
    var tPath = resolveBucketPath(req.path);
    if (!tPath) {
      return WebTool.requestTool.sendData({
        ret: 1,
        meta: { code: 403, message: "Bucket操作:get。非法路径" },
        path: req.path
      }, req, res);
    }
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
    let file = req.file;
    var tPath = resolveBucketPath(req.path);
    if (!tPath) {
      return WebTool.requestTool.sendData({ code: 1, message: "Bucket操作失败。非法路径" }, req, res);
    }
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
    var tPath = resolveBucketPath(req.path);
    if (!tPath) {
      return WebTool.requestTool.sendData({ code: 2, message: "删除操作失败。非法路径" }, req, res);
    }
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
    var tPath = resolveBucketPath(req.path);
    if (!tPath) {
      return WebTool.requestTool.sendData({ code: 5, message: "重命名操作失败。非法路径" }, req, res);
    }
    var name = req.body.name;
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