let WebTool = require("../custom/WebTool.js");
let ConfigObject = require("../custom/ConfigObject.js");
let path = require("path");
let t = path.resolve(__dirname, ".");
let cPath = t + "/config/" + "common.js";
let commonData = new ConfigObject(cPath).data;
let env = require("../custom/env.js");
const crypto = require("crypto");

// 常量时间比较，避免时序攻击
function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

let aPath = t + "/config/" + "appConfig.js";

console.log("appConfig path: ", aPath);

/**
 * 递归删除对象中的嵌套属性（支持 "a.b.c" 格式）
 */
function deleteNestedValue(obj, path) {
  if (!obj || !path) return;

  const keys = Array.isArray(path) ? path : path.split('.');
  const lastKey = keys.pop();

  // 逐层遍历查找父级对象
  const target = keys.reduce((current, key) => current && current[key], obj);

  // 执行删除操作
  if (target && Object.prototype.hasOwnProperty.call(target, lastKey)) {
    delete target[lastKey];
  }
}

// 辅助函数：安全设置嵌套对象的属性值
function setNestedValue(obj, path, value) {
  if (!obj || typeof obj !== 'object' || !path) return;

  const keys = Array.isArray(path) ? path : path.split('.');
  const lastKey = keys.pop();

  // 逐层深入，如果中间路径不存在或不是对象，则自动创建空对象
  const target = keys.reduce((current, key) => {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    return current[key];
  }, obj);

  target[lastKey] = value;
}

let data = {
  deleteAppConfig: {
    method: "get",
    callback: function (req, res) {
      let data = req.session.data;
      if (
        data && data.logined && data.account && data.account === commonData.adminAccount
      ) {
        try {
          const { docName } = req.query; // propPath 为要删除的属性路径，如 "a.b.c"

          // 参数校验
          if (!docName) {
            return WebTool.requestTool.sendData({
              ret: 1,
              message: "参数错误：propPath 不能为空"
            }, req, res);
          }

          const configObject = new ConfigObject(aPath);
          const appConfigData = configObject.data;

          // 支持删除 "a.b.c" 格式的深层属性
          deleteNestedValue(appConfigData, docName);

          // 保存配置变更
          configObject.save();

          return WebTool.requestTool.sendData({
            ret: 0,
            message: "删除成功"
          }, req, res);
        } catch (error) {
          return WebTool.requestTool.sendData({
            ret: -1,
            message: `删除失败: ${error.message}`
          }, req, res);
        }
      }
      else {
        return WebTool.requestTool.sendData({
          ret: -2,
          message: `需要有管理员权限`
        }, req, res);
      }
    }
  },
  setAppConfig: {
    method: "get",
    callback: function (req, res) {
      let data = req.session.data;
      if (
        data && data.logined && data.account && data.account === commonData.adminAccount
      ) {
        try {
          const { documentId, docName } = req.query;

          // 参数校验
          if (!docName) {
            return WebTool.requestTool.sendData({
              ret: 1,
              message: "参数错误：docName 不能为空"
            }, req, res);
          }

          const configObject = new ConfigObject(aPath);
          const appConfigData = configObject.data;

          // 支持 "a.b.c" 格式的深层设置
          setNestedValue(appConfigData, docName, documentId);

          // 如果 ConfigObject 需要显式保存，取消下一行的注释：
          configObject.save();

          return WebTool.requestTool.sendData({
            ret: 0,
            message: "设置成功"
          }, req, res);
        } catch (error) {
          return WebTool.requestTool.sendData({
            ret: -1,
            message: `设置失败: ${error.message}`
          }, req, res);
        }
      }
      else {
        return WebTool.requestTool.sendData({
          ret: -2,
          message: `需要有管理员权限`
        }, req, res);
      }
    }
  },
  getAppConfig: {
    method: "get",
    callback: function (req, res) {
      let appConfigData = new ConfigObject(aPath).data;
      console.log("appConfigData: ", appConfigData);
      WebTool.requestTool.sendData(appConfigData, req, res);
    }
  },
  updateCollectionInfo: {
    method: "post",
    dbItem: "visualTool",
    callback: function (req, res, dbInfo, db) {
      let data = req.session.data;
      console.log("req.body.adminKey: ", req.body.adminKey);
      if (
        (req.body.adminKey && safeEqual(req.body.adminKey, env.get("ADMIN_KEY")) && commonData.adminSwitch) ||
        (data && data.logined && data.account && data.account === "admin")
      ) {

        console.log("开始更新....")

        let value = req.body.value || req.query.value || 0;

        let folderName = req.body.folderName || req.query.folderName;

        console.log("更新账号：", folderName, value);

        if (!folderName) {
          WebTool.requestTool.sendData(
            {
              ret: 2,
              message: "需要携带folderName参数。",
            },
            req,
            res
          );
          return false;
        }

        let collection =
          req.body.collection || req.query.collection || "account";
        //属性
        let key = req.body.key || req.query.key || "tokenLimit";
        let incParam = {
          [key]: value,
        };
        let type = req.body.key || req.query.key || "inc";
        let vType = req.body.vType || req.query.vType || "number";
        if (key === "inc" || vType === "number") {
          incParam[key] = Number(value) || 0;
        }
        let hUrl = req.get("referer");
        let id = WebTool.objectTool.urlQuery(hUrl, "id") || "";
        console.log("update params:", collection, key, type, value);
        WebTool.objectTool.dbUpdate(
          db,
          collection,
          {
            folderName: Number(folderName),
          },
          type,
          incParam,
          function (ret) {
            WebTool.requestTool.sendData(
              {
                ret: 0,
                message: "更新成功。",
              },
              req,
              res
            );
            if (key === "tokenLimit") {
              WebTool.objectTool.recordDeal(
                db,
                {
                  name: "积分充值",
                  value: value,
                  type: "income",
                  documentId: id,
                  folderName: folderName,
                },
                (tData) => {
                  db.close();
                }
              );
            } else {
              db.close();
            }
          }
        );
      } else {
        WebTool.requestTool.sendData(
          {
            ret: 1,
            message: "需要使用管理员账号登录后使用。",
          },
          req,
          res
        );
      }
    },
  },
};

module.exports = data;
