let path = require('path');
let docPath = path.resolve(__dirname, `/static/bucket/document`);
let multer = require('multer');

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, docPath); // 保存的路径，备注：需要自己创建
  },
  filename: function (req, file, cb) {
    // 将保存文件名设置为 字段名 + 时间戳，比如 logo-1478521468943
    cb(null, file.fieldname + '-' + Date.now());
  }
});
let upload = multer({
  storage: storage
});

let data = {
  getConfigData: {
    method: "get",
    callback: function (req, res, dbInfo, db) {
      let key = req.query.key || "common";
      let config = this.config[key];
      console.log(config)
      let d = {};
      if (config) {
        d = config.data;
      }
      res.json({
        ret: 0,
        data: d,
        message: "success"
      })
    }
  },
  updateLabelJson: {
    method: "post",
    callback: function (req, res, dbInfo, db) {
      console.log(this.config.user.data);
      let d = req.body.data;
      let type = req.body.type;
      if (type && d) {
        this.config.common.data[type] = d;
        this.config.common.save();
      }
      res.json({
        ret: 0,
        message: "success"
      })
    }
  },
  uploadFile: {
    method: "post",
    dbItem: "knowledge",
    before: function (req, res) {
      return upload.single("test");
    },
    callback: function (req, res, dbInfo, db) {
      res.json({
        ret: 0,
        message: "success"
      })
    }
  },
  removeFile: {
    method: "post",
    dbItem: "knowledge",
    callback: function (req, res, dbInfo, db) {
      res.json({
        ret: 0,
        message: "success"
      })
    }
  }
}

module.exports = data;