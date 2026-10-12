var menuData = [{
  path: "/home",
  label: "首页",
},
{
  path: "/myApps",
  label: "我的应用",
},
{
  label: "物料库",
  children: [{
    path: "/plugin",
    label: "插件库",
  },
  {
    path: "/module",
    label: "模板库",
  },
    // {
    //   path: "/interface",
    //   label: "Web服务接口",
    // }
  ]
},
{
  label: "使用说明",
  path: "/introduce"
}
];

let flag = WebTool.adjustSize([true, true, false]);
if (!flag) {
  menuData = [{
    path: "/home",
    label: "首页",
  }]
}

var temp1 = [{
  label: "个人中心",
  path: "/personal"
}];
var temp2 = [{
  label: "个人中心",
  path: "/personal"
}, {
  label: "我的应用",
  path: "/myApps"
}];
var arr = WebTool.adjustSize([temp1, temp1, temp2]);
let loginRegApp = {
  url: "mainApp/app/loginRegItem.js",
  key: "transweb_loginRegItem",
  dsl: {
    data: {
      position: "top",
      loginedMenu: arr
    }
  }
};

transweb_main({
  dependency: {
    css: "mainApp/style.css",
    script: {
      util: location.origin + "/common/util.js",
    },
  },
  moduleMap: {
    "home": {
      url: "mainApp/layout/home.vue",
      appData: [{
        url: "components/commonMenu.vue",
        className: "ElementVueItem",
        cardName: "commonMenuItem",
        dsl: {
          data: {
            defaultActive: "/home",
            menuData: menuData
          }
        }
      }, loginRegApp, {
        url: "mainApp/app/introduce.vue",
        className: "ElementVueItem",
        dsl: {
          methods: {
            handleClickButton: function () {
              let folderName = localStorage.getItem("folderName");
              if (!folderName) {
                var t = WebTool.adjustSize([true, true, false]);
                if (t) {
                  webCpu.util.loadLoginDialog();
                } else {
                  this.$message({
                    type: "warning",
                    message: "需要在PC端使用。"
                  })
                }
              } else {
                webCpu.router.push({
                  path: "/myApps"
                });
              }
            }
          }
        }
      }],
      callback: function (c, d, t) {
        // console.log(c, d, t);
      }
    },
    "plugin": {
      url: "mainApp/layout/home.vue",
      appData: [{
        url: "components/commonMenu.vue",
        className: "ElementVueItem",
        cardName: "commonMenuItem",
        dsl: {
          data: {
            defaultActive: "/plugin",
            menuData: menuData
          }
        }
      }, loginRegApp, {
        url: "mainApp/app/appEditor/main.vue",
        className: "ElementVueItem",
        dsl: {
          style: {
            paddingLeft: "30px",
            paddingRight: "30px",
            paddingTop: "20px",
          },
          params: {
            name: "default.js",
            folderName: localStorage.folderName
          },
          url: "bucket/personal/{{folderName}}/app/{{name}}",
          requestType: "_jsonp",
          query: "transweb_app_collection",
          dataFilter: function (tData) {
            this.defaultData = this.defaultData || {};
            this.defaultData.appList = tData;
            return this.defaultData;
          },
          data: {
            templatePath: "bucket/personal/{{folderName}}/layout",
            appList: []
          }
        }
      }],
      dsl: {
        url: "/user/getLoginInfo",
        requestType: "get",
        promise: {
          beforeRender: function (c, d, t) {
            if (d && d.data && d.data.logined) {
              localStorage.setItem("userInfo", JSON.stringify(d.data));
              var folderName = localStorage.getItem("folderName");
              if (folderName) {
                t.appData[2].dsl.params.folderName = folderName;
                // t.appData[2].dsl.params.name = "default.js";
                t.appData[2].dsl.data.templatePath = t.appData[2].dsl.data.templatePath.bindData({
                  folderName: folderName
                })
              } else {
                t.appData[2].dsl.url = "";
              }
            } else {
              webCpu.util.loadLoginDialog();
            }
          }
        },
      },
      callback: function (c, d, t) {

      }
    },
    "module": {
      url: "mainApp/layout/home.vue",
      appData: [{
        url: "components/commonMenu.vue",
        className: "ElementVueItem",
        cardName: "commonMenuItem",
        dsl: {
          data: {
            defaultActive: "/module",
            menuData: menuData
          }
        }
      }, loginRegApp, {
        url: "mainApp/app/moduleEditor/main.vue",
        className: "ElementVueItem",
        dsl: {
          style: {
            paddingLeft: "30px",
            paddingRight: "30px",
            paddingTop: "20px",
          },
          params: {
            name: "module.js",
            folderName: localStorage.folderName
          },
          url: "bucket/personal/{{folderName}}/app/{{name}}",
          requestType: "_jsonp",
          query: "transweb_layout_collection",
          dataFilter: function (tData) {
            this.defaultData = this.defaultData || {};
            this.defaultData.appList = tData;
            return this.defaultData;
          },
          data: {
            templatePath: "bucket/personal/{{folderName}}/layout",
            appList: []
          }
        }
      }],
      dsl: {
        url: "/user/getLoginInfo",
        requestType: "get",
        promise: {
          beforeRender: function (c, d, t) {
            if (d && d.data && d.data.logined) {
              var folderName = localStorage.getItem("folderName");
              localStorage.setItem("userInfo", JSON.stringify(d.data));
              if (folderName) {
                t.appData[2].dsl.params.folderName = folderName;
                // t.appData[2].dsl.params.name = "default.js";
                t.appData[2].dsl.data.templatePath = t.appData[2].dsl.data.templatePath.bindData({
                  folderName: folderName
                })
              } else {
                t.appData[2].dsl.url = "";
              }
            } else {
              webCpu.util.loadLoginDialog();
            }
          }
        },
      },
      callback: function (c, d, t) {

      }
    },
    "interface": {
      url: "mainApp/layout/home.vue",
      appData: [{
        url: "components/commonMenu.vue",
        className: "ElementVueItem",
        cardName: "commonMenuItem",
        dsl: {
          data: {
            defaultActive: "/interface",
            menuData: menuData
          }
        }
      }, loginRegApp, {
        url: "mainApp/app/interface.vue",
        className: "ElementVueItem",
        dsl: {
          style: {
            paddingLeft: "30px",
            paddingRight: "30px",
            paddingTop: "20px",
          },
          params: {
            name: "interface.js",
            folderName: ""
          },
          url: "bucket/personal/{{folderName}}/other/{{name}}",
          requestType: "_jsonp",
          query: "transweb_interface_collection",
          dataFilter: function (tData) {
            this.defaultData = this.defaultData || {};
            this.defaultData.appList = tData;
            return this.defaultData;
          },
          data: {
            templatePath: "bucket/personal/{{folderName}}/layout",
            appList: []
          }
        }
      }],
      dsl: {
        url: "/user/getLoginInfo",
        requestType: "get",
        promise: {
          beforeRender: function (c, d, t) {
            if (d && d.data && d.data.logined) {
              var folderName = localStorage.getItem("folderName");
              localStorage.setItem("userInfo", JSON.stringify(d.data));
              if (folderName) {
                t.appData[2].dsl.params.folderName = folderName;
                t.appData[2].dsl.data.templatePath = t.appData[2].dsl.data.templatePath.bindData({
                  folderName: folderName
                })
              } else {
                t.appData[2].dsl.url = "";
              }
            }
            else {
              webCpu.util.loadLoginDialog();
            }
          }
        },
      },
      callback: function (c, d, t) {

      }
    },
    "personal": {
      url: "mainApp/layout/home.vue",
      appData: [{
        url: "components/commonMenu.vue",
        className: "ElementVueItem",
        cardName: "commonMenuItem",
        dsl: {
          data: {
            menuData: menuData
          }
        }
      }, loginRegApp, {
        url: "mainApp/app/personalInfo.js",
        key: "transweb_personalInfo"
      }],
      callback: function (c, d, t) {
        // console.log(c, d, t);
      }
    },
    "myApps": {
      url: "mainApp/layout/home.vue",
      appData: [{
        url: "components/commonMenu.vue",
        className: "ElementVueItem",
        cardName: "commonMenuItem",
        dsl: {
          data: {
            defaultActive: "/myApps",
            menuData: menuData
          }
        }
      }, loginRegApp, {
        url: "mainApp/app/myAppList.js",
        key: "transweb_myAppList",
        dsl: {
          style: {
            paddingLeft: "30px",
            paddingRight: "30px",
            paddingTop: "20px",
          }
        },
        footStyle: {
          paddingLeft: "30px",
          paddingRight: "30px"
        },
        callback: function (cc, dd, tt) {
          dd.footHeight = WebTool.adjustSize([50, 50, 1]);
          var folderName = localStorage.getItem("folderName");
          if (folderName) {
            dd.task.url = dd.task.url.bindData({
              account: folderName
            });
          } else {
            webCpu.util.loadLoginDialog();
          }
        }
      }],
      callback: function (c, d, t) {
        // console.log(c, d, t);
      }
    },
    "introduce": {
      url: "mainApp/layout/home.vue",
      appData: [{
        url: "components/commonMenu.vue",
        className: "ElementVueItem",
        cardName: "commonMenuItem",
        dsl: {
          data: {
            defaultActive: "/introduce",
            menuData: menuData
          }
        }
      }, loginRegApp, {
        url: "plugins/elementVueItem/commonBook.vue",
        className: "ElementVueItem",
        cardName: "commonBookItem",
        dsl: {
          data: {
            defaultActive: "0"
          },
          promise: {
            beforeRender: function (c, d, t) {
              let index = WebTool.urlQuery(location.href, "article");
              t.data.defaultActive = index || t.data.defaultActive;
            }
          }
        }
      }],

    },
    "chatGpt": {
      url: "mainApp/layout/home.vue",
      appData: [{
        url: "components/commonMenu.vue",
        className: "ElementVueItem",
        cardName: "commonMenuItem",
        dsl: {
          data: {
            defaultActive: "/chatGpt",
            menuData: menuData
          }
        }
      }, loginRegApp, {
        url: "webApps/chatGpt/layout.vue",
        className: "ElementVueItem",
        dsl: {
          url: "/user/getUserData",
          method: "get",
          dataType: "json",
          dataFilter: function (tData) {
            if (tData.data) {
              localStorage.setItem("userInfo", JSON.stringify(tData.data));
            }
            return this.defaultData || {}
          },

        },
        style: {
          maxWidth: "1000px",
          padding: "5px 10px",
          background: "#f2f2f2"
        }
      }],
      dsl: {
        promise: {
          beforeRender: function (c, d, t) {

          }
        },
      },
      callback: function (c, d, t) {
        // console.log(c, d, t);
      }
    },
  },
  routeData: [{
    path: "/home",
    module: "home"
  }, {
    path: "/myApps",
    module: "myApps"
  }, {
    path: "/personal",
    module: "personal"
  }, {
    path: "/plugin",
    module: "plugin"
  }, {
    path: "/module",
    module: "module"
  }, {
    path: "/interface",
    module: "interface"
  }, {
    path: "/introduce",
    module: "introduce"
  }, {
    path: "/chatGpt",
    module: "chatGpt"
  }, {
    path: "/chatGpt_dev",
    module: "chatGpt_dev"
  }],
  interface: {
    login: {
      url: "/user/check",
      method: "get",
      dataType: "json"
    },
    loginOff: {
      url: "/user/loginOff",
      method: "post",
      dataType: "json"
    },
    addCommonItem: {
      url: "/visualTool/{{name}}",
      method: "put",
      dataType: "json"
    },
    removeCommonItem: {
      url: "/visualTool/{{name}}",
      method: "delete",
      dataType: "json"
    },
    updateCommonItem: {
      url: "/visualTool/{{name}}",
      method: "post",
      dataType: "json"
    },
    getUserData: {
      url: "/user/getUserData",
      type: "get"
    },
    sendSMS: {
      url: "/user/sendSMS",
      method: "get",
      dataType: "json"
    },
    removeAppItem: {
      url: "/bucket/personal/{{folderName}}/webApps/{{name}}",
      method: "delete",
      dataType: "json"
    },
    submitAppData: {
      url: "/bucket/personal/{{folderName}}/webApps/{{name}}",
      method: "put",
      dataType: "json",
    },
    chatQuestion: {
      url: "/gpt/_chatQuestion",
      method: "get",
      dataType: "json"
    },
    updateLoginInfo: {
      url: "/user/updateLoginInfo",
      method: "post",
      dataType: "json"
    },
    updateAccountInfo: {
      url: "/admin/updateCollectionInfo",
      method: "post",
      dataType: "json"
    }
  },
  appMap: {
    loginReg: {
      url: "mainApp/app/loginReg.js",
      key: "transweb_loginReg"
    },
    rechargeApp: {
      url: "/webApps/cms/recharge.js",
      key: "transweb_recharge",
    },
  },
  interceptor: {
    request: function () {

    },
    response: function (http) {
      if (http.status > 400) {
        // webCpu.router.push({
        //   path: "/home"
        // });
        // webCpu.appMap.loginReg.flag = false;
      }
    }
  }
})