webCpu.documentPrefix = webCpu.documentPrefix || location.origin;

transweb_loginReg({
  cardName: "loginRegCard",
  className: "ElementVueItem",
  task: {
    data: {
      timerout: 180,
      isValid: {
        numberLogin: [0, 0],
        passwordLogin: [0, 0]
      },
      sendSMS: true,
      count: 0
    },
    agreement: {
      zh: webCpu.documentPrefix + "/assets/agreement.md",
      en: webCpu.documentPrefix + "/assets/agreement_en.md"
    },
    confirmCallback: function (query) {

    },
    startTimer: function (n, elem, callback) {
      if (n === 0) {
        if (typeof (callback) === "function") {
          callback();
        }
      } else {
        $(elem).html(n);
        n = n - 1;
        var _self = this;
        setTimeout(function () {
          _self.startTimer(n, elem, callback);
        }, 1000);
      }
    },
    inputChecker: {
      mobile: function (v) {
        var ret = {
          result: true,
          message: ""
        };
        if (!v) {
          ret.message = webCpu.messages[lang].phoneErrorTips1
        } else {
          // var reg = /^[0-9]{11,}$/;
          // if (reg.test(v)) {
          //   ret.result = true;
          // }
        }
        return ret;
      },
      number: function (v) {
        var ret = {
          result: false,
          message: webCpu.messages[lang].codeErrorTips1
        };
        if (!v) {
          ret.message = webCpu.messages[lang].codeErrorTips
        } else {
          var reg = /^[0-9]{6}$/;
          if (reg.test(v)) {
            ret.result = true;
          }
        }
        return ret;
      },
      password: function (v) {
        var ret = {
          result: false,
          message: webCpu.messages[lang].passwordErrorTips1
        };
        if (!v) {
          ret.message = webCpu.messages[lang].passwordErrorTips
        } else {
          var reg = /^.{6,}$/;
          if (reg.test(v)) {
            ret.result = true;
          }
        }
        return ret;
      }
    },
    recordValid: function (index, ret) {
      var current = $(this.container).find("[aria-selected='true']").attr("aria-controls");
      this.data.isValid[current][index] = ret;
    },
    checkInput: function (input, type) {
      var v = $(input).val();
      var callback = this.inputChecker[type];
      var ret = false;
      if (typeof (callback) === "function") {
        ret = callback(v);
      }
      $(input).removeClass("is-valid");
      $(input).removeClass("is-invalid");
      var tRet = $(input).hasClass("numberInput");
      if (ret.result) {
        if (!tRet) {
          $(input).addClass("is-valid");
        }
        $(input).parent().find(".text-danger").hide();
      } else {
        if (!tRet) {
          $(input).addClass("is-invalid");
        }
        $(input).parent().find(".text-danger").html(ret.message);
        $(input).parent().find(".text-danger").show();
      }
      return ret.result;
    },
    vueItem: null,
    template: webCpu.documentPrefix + "/components/loginDialog.vue",
    promise: {
      afterRender: function (cc, dd, tt) {
        // 2. 数据埋点：通知 GA4
        if (typeof gtag === 'function') {
          gtag('event', 'open_sign_form');
        }
        $(cc).find(".getCodeBtn").off("click");
        $(cc).find(".getCodeBtn").on("click", function () {
          var t = $(cc).find(".nav-link.active");
          var id = t.attr("aria-controls");
          var selector = $(cc).find("#" + id).find("input");
          var tArr = [selector.eq(0).val(), selector.eq(1).val()];
          if (tArr[0]) {
            var query = {
              number: tArr[0]
            }
            webCpu.adapter.sendSMS(query, function (d) {
              if (d.ret !== 0 && tt.vueItem) {
                tt.vueItem.$message({
                  type: "warning",
                  message: d.msg
                });
                dd.timerout = 2;
                return false;
              } else {
                dd.timerout = 180;
              }
            });
            dd.sendSMS = false;
            $(cc).find(".gettingCodetips").show();
            $(cc).find(".getCodeBtn").hide();
            var elem = $(cc).find(".countTimerSpan")[0];
            tt.startTimer(dd.timerout, elem, function () {
              $(cc).find(".gettingCodetips").hide();
              $(cc).find(".getCodeBtn").show();
            })
          } else {
            if (tt.vueItem) {
              tt.vueItem.$message({
                type: "warning",
                message: webCpu.messages[lang].getCodeError
              })
            }
          }
        });
        setTimeout(function () {
          $(cc).find(".btn-link").off("click");
          $(cc).find(".btn-link").on("click", function () {
            lang = window.__APP_LANG__ || "zh";
            let path = tt.agreement[lang];
            let app = {
              className: "MarkdownArticle",
              dsl: {
                url: path,
                requestType: "get",
                dataType: "text",
                style: {
                  padding: "10px 20px",
                  overflow: "auto",
                  color: "#000",
                  background: "#fff"
                }
              }
            }

            webCpu.CardItem.renderCardDialog(
              webCpu.cards.regLoginDialog,
              app, {
              dialogName: "regInfoDialog",
              closeType: "back",
              title: webCpu.messages[lang].agreementDialogTitle,
              titleStyle: {
                background: "var(--el-color-primary-light-9)",
                color: "var(--el-color-primary)"
              }
            }, {
              width: "800px",
              height: "100%"
            }
            );
          });
        }, 200);


        let submitInput = function () {
          var t = $(cc).find(".nav-link.active");
          tt.vueItem.isLogining = false;
          var id = t.attr("aria-controls");
          var selector = $(cc).find("#" + id).find("input");
          var tArr = [selector.eq(0).val(), selector.eq(1).val()];
          if (!tArr[0] || !tArr[1]) {
            if (tt.vueItem) {
              tt.vueItem.$message({
                type: "warning",
                message: webCpu.messages[lang].loginErrorTips
              })
            }
            return false;
          }
          var query = {
            account: tArr[0],
            password: MurmurHash.rule(tArr[1], 32)
          }
          if (id !== "passwordLogin") {
            delete query.password;
            query.checkNumber = tArr[1];
          }
          let ret = tt.vueItem.agreementChecked;

          if (ret && tArr[0] && tArr[1]) {
            if (!ret) {
              let msg = "需要同意用户协议。";
              tt.vueItem.$message({
                type: "warning",
                message: msg
              })
            }
            if (typeof (tt.confirmCallback) === "function") {
              tt.confirmCallback(query);
            }
          } else {
            let msg = "需要检查输入是否正确。";
            if (!ret) {
              msg = "需要先同意《用户协议》";
            }
            if (tt.vueItem) {
              tt.vueItem.$message({
                type: "warning",
                message: msg
              })
            }
          }
        }

        $(cc).find(".passwordInput").off("change");
        $(cc).find(".passwordInput").on("change", function () {
          var ret = tt.checkInput(this, "password");
          tt.recordValid(1, ret);
        });

        $(cc).find(".numberInput").off("change");
        $(cc).find(".numberInput").on("change", function () {
          var ret = tt.checkInput(this, "number");
          tt.recordValid(1, ret);
        });

        $(cc).find(".mobileInput").off("change");
        $(cc).find(".mobileInput").on("change", function () {
          var ret = tt.checkInput(this, "mobile");
          tt.recordValid(0, ret);
        });

        $(cc).off("keydown");
        $(cc).on("keydown", function (e) {
          let theEvent = e || window.event;
          let keyCode = theEvent.keyCode || theEvent.which || theEvent.charCode;
          if (keyCode === 13) {
            $(cc).find("input").blur();
            submitInput();
          }
        })
        $(cc).find(".confirmBtn").off("click");
        $(cc).find(".confirmBtn").on("click", function () {
          submitInput();
        })
      }
    }
  }
})