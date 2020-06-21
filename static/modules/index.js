transweb_cn({
  titleData: {
    title: "#",
    menu: [],
    rightMenu: [{
      name: "管理",
      children: [{
        name: "书籍管理",
        callback: function () {
          var app = webCpu.plugin.signIn;
          app.callback = function (cc, dd, tt) {
            dd.task.successCallback = function (d) {
              webCpu.interface.bookManager.query.user = d.data.user;
              webCpu.interface.bookManager.logined = d.data.user;
              webCpu["CardItem"].renderCardDialog(webCpu.cards.main, webCpu.plugin.managerContainer, {
                title: "管理",
                closeType: "back",
                closeCallback: function () {
                  webCpu.startApp(document.body, appConfig);
                }
              });
            }
          }
          var logined = webCpu.interface.bookManager.logined;
          var user = webCpu.interface.bookManager.query.user;
          if (logined && user === webCpu.interface.bookManager.logined) {
            app = webCpu.plugin.managerContainer;
          }
          webCpu["CardItem"].renderCardDialog(webCpu.cards.main, app, {
            title: "书籍管理",
            closeType: "back",
            closeCallback: function () {
              webCpu.CardItem.fresh(webCpu.cards.testA);
            }
          });
        }
      }, {
        name: "系统设置",
        callback: function () {
          var app = webCpu.plugin.signIn;
          var logined = webCpu.interface.bookManager.logined;
          var user = webCpu.interface.bookManager.query.user;
          var arr = [{
            "key": "secretId",
            "label": "腾讯对象存储secretId",
            "editor": {
              "type": 'text',
              "placeholder": "输入secretId",
              "value": ""
            }
          }, {
            "key": "secretKey",
            "label": "腾讯对象存储secretKey",
            "editor": {
              "type": 'password',
              "placeholder": "输入secretKey",
              "value": ""
            }
          }, {
            "key": "appid",
            "label": "腾讯对象存储appid",
            "editor": {
              "type": 'text',
              "placeholder": "输入appid",
              "value": ""
            }
          }, {
            "key": "bucket",
            "label": "腾讯对象存储bucket",
            "editor": {
              "type": 'text',
              "placeholder": "输入bucket",
              "value": ""
            }
          }, {
            "key": "region",
            "label": "腾讯对象存储region",
            "editor": {
              "type": 'password',
              "placeholder": "输入region",
              "value": ""
            }
          }, {
            "key": "root",
            "label": "根目录",
            "editor": {
              "type": 'text',
              "placeholder": "输入根目录",
              "value": ""
            }
          }];
          var callback = function (d) {
            if (d && d.data) {
              webCpu.interface.bookManager.query.user = d.data.user;
              webCpu.interface.bookManager.logined = d.data.user;
            }
            var ret = webCpu.CardItem.configDialog(webCpu.cards.main, "编辑", arr, function () {
              var param = ret.task.data;
              console.log(param);
              webCpu.adapter.configCos(param, function(d) {

              });
            }, webCpu.style.configCosDialog);
          }
          if (logined && user === webCpu.interface.bookManager.logined) {
            callback();
          } else {
            app.callback = function (cc, dd, tt) {
              dd.task.successCallback = callback;
            }
            webCpu["CardItem"].renderCardDialog(webCpu.cards.main, app, {
              title: "系统设置",
              closeType: "back",
              closeCallback: function () {
                webCpu.CardItem.fresh(webCpu.cards.testA);
              }
            });
          }

        }
      }]
    }]
  },
  titleHeight: 50,
  titleStyle: {
    "background-color": "#f6f6f6",
    "box-shadow": "0px 1px 0px #f0f0f0"
  },
  task: {
    "style": {
      "padding": '5px 15px',
      "overflow": "auto"
    },
    template: '<div component="CardItem" cardName="testA" style="width: 100%; height: 100%; position: relative; text-align: center;"></div>',
    promise: {
      beforeRender: function (container, data, task) {

      },
      afterRender: function (container, data, task) {

      }
    }
  }
});