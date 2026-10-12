webCpu.documentPrefix = webCpu.documentPrefix || location.origin;

transweb_loginRegItem({
  className: "ElementVueItem",
  cardName: "loginRegItem",
  task: {
    remote: true,
    template: "/components/loginBar.vue",
    url: "/user/getLoginInfo",
    requestType: "get",
    dialogCard: "",
    dialogStyle: {
      width: "80%",
      height: "98%",
      maxWidth: WebTool.adjustSize(["500px", "500px", "800px"]),
      transform: WebTool.adjustSize(["", "", "scale(1.2)"]),
      maxHeight: "400px",
      position: "relative",
      borderRadius: "20px",
      margin: "auto",
      background: "linear-gradient(to bottom right, #6951FF, #4B3E9F)",
      overflow: "hidden",
      border: "solid 1px #ddd",
    },
    appMap: {
      loginReg: {
        style: {
          paddingTop: "10px",
        },
        url: "/mainApp/app/loginReg.js",
        key: "transweb_loginReg",
      },
    },
    interface: {
      login: {
        url: webCpu.documentPrefix + "/user/check",
        method: "get",
        dataType: "json",
      },
      loginOff: {
        url: "/user/loginOff",
        method: "post",
        dataType: "json",
      },
      updateLoginInfo: {
        url: "/user/updateLoginInfo",
        method: "post",
        dataType: "json",
      },
      addCommonItem: {
        url: "/visualTool/{{name}}",
        method: "put",
        dataType: "json",
      },
      removeCommonItem: {
        url: webCpu.documentPrefix + "/visualTool/{{name}}",
        method: "delete",
        dataType: "json",
      },
      updateCommonItem: {
        url: "/visualTool/{{name}}",
        method: "post",
        dataType: "json",
      },
      getUserData: {
        url: "/user/getUserData",
        type: "get",
      },
      sendSMS: {
        url: "/user/sendSMS",
        method: "get",
        dataType: "json",
      },
      removeAppItem: {
        url:
          "/bucket/personal/{{folderName}}/webApps/{{name}}",
        method: "delete",
        dataType: "json",
      },
      submitAppData: {
        url:
          "/bucket/personal/{{folderName}}/webApps/{{name}}",
        method: "put",
        dataType: "json",
      },
      updateAccountInfo: {
        url: "/admin/updateCollectionInfo",
        method: "post",
        dataType: "json",
      },
    },
    data: {},
    methods: {
      handleClickBtn: function () {
        var _self = this;
        webCpu.config = webCpu.config || {};
        webCpu.config.loginStyle = webCpu.config.loginStyle || this._parent.dialogStyle;

        let card = document.body;
        if (this._parent.dialogCard && typeof this._parent.dialogCard === "string") {
          card = webCpu.cards[this._parent.dialogCard];
        } else if (this._parent.dialogCard) {
          card = this._parent.dialogCard;
        } else {
        }

        this._parent.appMap.loginReg.callback = function (cc, dd, tt) {
          dd.task.vueItem = _self;

          dd.task.confirmCallback = function (query) {
            let _that = this;
            _that.vueItem.isLogining = true;
            let meta = {};
            if (localStorage.currentDocumentMeta) {
              try {
                meta = JSON.parse(localStorage.currentDocumentMeta);
                query.rootAccount = meta.rootAccount;
                query.root = meta.root;
              } catch (e) { }
            }
            webCpu.adapter.login(
              query,
              function (dd) {
                _that.vueItem.isLogining = false;
                if (dd.data && (dd.data.folderName || dd.data.account)) {
                  _self.logined = true;
                  _that.vueItem.isLogining = false;
                  localStorage.logined = true;
                  webCpu.transwebToken = dd.data.token;
                  localStorage.setItem("transweb-token", dd.data.token);
                  _self.userData = dd.data;
                  dd.data.logined = true;

                  _self._parent.updateLoginStatus(dd.data);

                  // 2. 数据埋点：通知 GA4
                  if (typeof gtag === 'function') {
                    gtag('event', 'sign_up', {
                      'method': 'email'
                    });
                  }

                  webCpu.CardItem.dismissMask(card);
                  if (
                    webCpu.router &&
                    webCpu.router.redirect &&
                    webCpu.router.redirect.path
                  ) {
                    webCpu.router.push({
                      path: webCpu.router.redirect.path,
                      query: webCpu.router.redirect.query,
                    });
                  } else if (webCpu.router && webCpu.router.push) {
                    webCpu.router.push({
                      path: "/myApps",
                    });
                  } else {
                  }
                } else {
                  webCpu.cards.loginRegItem.task.vueItem.$message({
                    type: "warning",
                    message: dd.message,
                  });
                }
              },
              "json"
            );
          };
        };
        aigcInterface.openLoginDialog(card);
      },
      exitCallback: function () { },
      exitLogin: function () {
        this.$confirm(
          "确认要退出登录吗？",
          webCpu.messages[lang].confirmDialogTitle,
          {
            confirmButtonText: webCpu.messages[lang].confirmYes,
            cancelButtonText: webCpu.messages[lang].confirmNo,
            type: "warning",
          }
        )
          .then(() => {
            let _self = this;
            localStorage.logined = false;
            localStorage.folderName = "";
            localStorage.setItem("userInfo", "");
            localStorage.setItem("account", "");
            localStorage.setItem("userName", "");
            this.loading = true;
            webCpu.adapter.loginOff({}, function (d) {
              webCpu.transwebToken = "";
              localStorage.setItem("transweb-token", "");
              _self.logined = false;
              _self.userData = {};
              // localStorage.clear();
              if (typeof _self.exitCallback === "function") {
                _self.exitCallback();
              }
              if (window === window.parent) {
                location.reload();
              } else {
                webCpu.fresh(_self._parent.card);
              }
            });
          });

      },
    },
    updateLoginStatus: function (data) {
      this.data = this.data || {};
      this.data.logined = true;
      this.data.userData = data || {};
      localStorage.logined = true;
      localStorage.setItem("account", data.account);
      localStorage.setItem("userName", data["name_" + lang] || data.name || "");
      localStorage.setItem("folderName", data.folderName);

      webCpu.attachAttribute(this.defaultData, this.data);
      if (this.vueItem) {
        webCpu.attachAttribute(this.defaultData, this.vueItem);
      }

      if (typeof this.userInfoCallback === "function") {
        this.userInfoCallback(data);
      }
      else {
        webCpu.isContainerUpdated = "false";
      }
      delete data.appData;
      // delete data.image;
      localStorage.setItem("userInfo", JSON.stringify(data));
    },
    promise: {
      beforeRender: function (c, d, t) {
        let adapter = webCpu.initAdapter(t.interface);
        webCpu.adapter = webCpu.adapter || {};
        webCpu.attachAttribute(adapter, webCpu.adapter);
        if (d && d.data && d.data.logined) {
          t.updateLoginStatus(d.data);
        } else {
          if (!webCpu.currentCard && webCpu.cards.agentContainerCard && webCpu.cards.agentContainerCard.task && webCpu.cards.agentContainerCard.task.vueItem) {
            webCpu.cards.agentContainerCard.task.vueItem.updateContent();
          }
          t.data.logined = false;
          webCpu.appData = {};
          localStorage.logined = false;
          localStorage.userInfo = "";
          localStorage.folderName = "";
        }
      },
      afterRender: function (c, d, t) {
     
        t.data = t.tData;
        if (webCpu.router) {
          var arr = ["/myApps", "/plugin", "/module", "/chatGpt"];
          if ((!d || !d.data || !d.data.logined) && t.appMap.loginReg) {
            if (arr.indexOf(webCpu.router.path) !== -1) {
              // webCpu.util.setLoginFirst();
            } else {
              if (
                t.appMap.loginReg.flag &&
                typeof t.methods.handleClickBtn === "function"
              ) {
                t.methods.handleClickBtn();
              }
              t.appMap.loginReg.flag = false;
            }
          }
        }
      },
    },
  },
});
