var WebTool = require("../custom/WebTool.js");
var Feedback = require("../custom/Feedback.js");
var ConfigObject = require("../custom/ConfigObject.js");
var path = require('path');

var data = {
  type: "service",
  cardData: [{
    cardName: "verify",
    method: "post",
    callback: function(req, res, task) {
      var key = task.receive.key;
      var value = task.receive.value;
      var flag = task.receive.flag;
      console.log(task.config)
      if(key !== undefined && value !== undefined) {
        var dealer = task.config;
        if (dealer === undefined) {
          WebTool.requestTool.sendData({
            ret: 1,
            message: "操作对象不存在。"
          }, req, res);
        } else {
          var tValue = dealer.data[key].value || task.config.data[key];
          var ret = (tValue === value);
          if(ret) {
            if(flag) {
              req.session.logined = task.config.data[key].data || {};
              req.session.logined.user = key;
            }
            WebTool.requestTool.sendData({
              ret: 0,
              data: req.session.logined,
              message: "验证通过。"
            }, req, res);
          }
          else {
            WebTool.requestTool.sendData({
              ret: 1,
              message: "验证不通过。"
            }, req, res);
          }
        }
      } 
      else {
        WebTool.requestTool.sendData({
          ret: 1,
          message: "缺少必要的参数。"
        }, req, res);
      }
    }
  },{
    cardName: "remove",
    method: "post",
    callback: function (req, res, task) {
      var key = task.receive.key;
      var ret;
      var dealer = task.config;
      if (dealer === undefined) {
        WebTool.requestTool.sendData({
          ret: 1,
          message: "操作对象不存在。"
        }, req, res);
      } else {
        ret = dealer.remove(key);
        WebTool.requestTool.sendData({
          ret: 0,
          data: {
            key: key,
            value: ret
          }
        }, req, res);
      }
    }
  }, {
    cardName: "find",
    method: "get",
    callback: function (req, res, task) {
      var key = task.receive.key;
      var ret;
      var dealer = task.config;
      if (!dealer) {
        WebTool.requestTool.sendData({
          ret: 1,
          message: "操作对象不存在。"
        }, req, res);
        return false;
      } 
      if(!key) {
        WebTool.requestTool.sendData({
          ret: 0,
          data: dealer.data
        }, req, res);
        return false;
      } else {
        ret = dealer.data[key];
        WebTool.requestTool.sendData({
          ret: 0,
          data: ret
        }, req, res);
      }
    }
  }, {
    cardName: "add",
    method: "post",
    callback: function (req, res, task) {
      var value = task.receive.value;
      var key = task.receive.key;
      if (value === undefined || key === undefined) {
        WebTool.requestTool.sendData({
          ret: 1,
          message: "缺少必要的参数value。"
        }, req, res)
      }
      
      var ret;
      var dealer = task.config;

      if (dealer === undefined) {
        WebTool.requestTool.sendData({
          ret: 1,
          message: "操作对象不存在。"
        }, req, res);
      } else {
        ret = dealer.add(key, value);
        WebTool.requestTool.sendData({
          ret: 0,
          data: ret
        }, req, res);
      }
    }
  }]
}

module.exports = data;