var WebTool = require("../custom/WebTool.js");
var Feedback = require("../custom/Feedback.js");


var data = {
  type: "service",
  cardData: [{
    cardName: "checkNumber",
    url: "/checkNumber",
    method: "get",
    callback: function (req, res, task) {
      WebTool.requestTool.sendData({
        ret: 0,
        data: {
          name: "",
          number: ""
        }
      }, req, res);
    }
  }, {
    cardName: "removeKeyValue",
    url: "/removeKeyValue",
    method: "post",
    callback: function (req, res, task) {
      WebTool.requestTool.sendData({
        ret: 1
      }, req, res);
    }
  }, {
    cardName: "addKeyValue",
    url: "/addKeyValue",
    method: "post",
    callback: function (req, res, task) {
      WebTool.requestTool.sendData({
        ret: 2
      }, req, res);
    }
  }, {
    cardName: "updateData",
    url: "/updateData",
    method: "post",
    callback: function (req, res, task) {
      WebTool.requestTool.sendData({
        ret: 3
      }, req, res);
    }
  }, {
    cardName: "eBookList",
    url: "/eBookList",
    method: "get",
    callback: function (req, res, task) {
      WebTool.requestTool.sendData({
        ret: 4
      }, req, res);
    }
  }, {
    cardName: "gate",
    url: "/gate",
    method: "get",
    callback: function (req, res, task) {
      WebTool.requestTool.sendData({
        ret: 5
      }, req, res);
    },
  }, {
    cardName: "imageGateway",
    url: "/imageGateway",
    method: "get",
    callback: function (req, res, task) {
      WebTool.requestTool.sendData({
        ret: 6
      }, req, res);
    }
  }, {
    cardName: "gitLogin",
    url: "/gitLogin",
    method: "get",
    callback: function (req, res, task) {
      WebTool.requestTool.sendData({
        ret: 7
      }, req, res);
    }
  }, {
    cardName: "wxLogin",
    url: "/wxLogin",
    method: "get",
    callback: function (req, res, task) {
      WebTool.requestTool.sendData({
        ret: 8
      }, req, res);
    }
  }, {
    cardName: "exitLogin",
    url: "/exitLogin",
    method: "post",
    callback: function (req, res, task) {
      WebTool.requestTool.sendData({
        ret: 9
      }, req, res);
    }
  }, {
    cardName: "register",
    url: "/register",
    method: "post",
    callback: function (req, res, task) {
      
      WebTool.requestTool.sendData({
        ret: 10
      }, req, res);
    }
  }, {
    cardName: "changePassword",
    url: "/changePassword",
    method: "post",
    callback: function (req, res, task) {
      
      WebTool.requestTool.sendData({
        ret: 11
      }, req, res);

    }
  }, {
    cardName: "login",
    url: "/login",
    method: "post",
    callback: function (req, res, task) {
      WebTool.requestTool.sendData({
        ret: 12
      }, req, res);
    }
  }, {
    cardName: "sendSms",
    url: "/sendSms",
    method: "post",
    callback: function (req, res, task) {
      WebTool.requestTool.sendData({
        ret: 13
      }, req, res);
    }
  }]
}

module.exports = data;