transweb_signIn({
  "border": 'none',
  "background": '#fff',
  "overflow": 'auto',
  "cardName": 'transwebSignIn',
  "style": {
    "max-width": 300,
    "max-height": 170
  },
  "titleMenu": [{
    "text": '<div style="width: 100%; text-align: left; padding-left: 10px;">请输入密码</div>'
  }],
  "task": {
    "checkNumber": '/checkNumber',
    "style": {
      "max-width": 400,
      "max-height": 250,
      "padding": '5px 10px',
    },
    "inputData": [{
      "name": 'password',
      "items": [{
        "type": 'password',
        "width": '385px',
        "value": '输入密码'
      }],
      "checkItems": [{
        "rule": function (v) {
          if (!v) {
            return false;
          } else {
            return true;
          }
        },
        "message": '密码不可为空。'
      }]
    }],
    "template": '<div class="userInfoInputArea" style="width: 100%; height: auto; position: relative; margin-top: 0px; float: left;"></div>\
                        <div class="checkInfoArea" style="width: 100%; postion: relative; float: left;">\
                        <p style="margin-top: 10px;"><button class="btn btn-primary confirmBtn" style="width: 100%; height: 35px">登录</button></p>                  </div></form>',
    "promise": {
      "beforeRender": function (container, data, task) {
        var w = Math.min($(container).width(), task.style["max-width"]);
        for (var i = 0; i < task.inputData.length; i++) {
          task.inputData[i].items[0].width = w + "px";
        }
      },
      "loginSuccess": function (container, data, task) {

      },
      "afterRender": function (container, data, task) {
        task.iTask = {
          style: {
            width: "100%"
          },
          container: $(container).find(".userInfoInputArea")[0],
          data: WebTool.copyObject(task.inputData),
          taskType: "multi",
          promise: {
            afterRender: function (c, d, t) {
              $(c).css("padding-right", "0px");
              $(c).find(".FormItem_inputItem").css("padding-right", "0px");
              $(c).find(".FormItem_inputItem input").eq(0).focus();
            }
          }
        };
        webCpu.render("FormItem", task.iTask);
        $(container).find(".confirmBtn").on("click", function () {
          task.submitLogin();
        });
        $(container).attr("onkeydown", "if(event.keyCode === 13) {  webCpu.cards.transwebSignIn.task.submitLogin(); }");
      }
    },
    "successCallback": function(d) {

    },
    "submitLogin": function () {
      var v = webCpu.FormItem.getValue(this.iTask);
      var r = webCpu.FormItem.checkValue(this.iTask);
      var input = v;
      for(var i = 0; v.length && i < v.length; i++) {
        input[v[i].name] = v[i].value;
      }
      var _self = this;
      if (r.result) {
        var query = webCpu.interface.login.query;
        console.log(query);
        query.value = MurmurHash.rule(input.password);
        webCpu.adapter.login(query, function(d) {
          if(d.ret === 0 && d.data && d.data.user) {
            if(typeof(_self.successCallback) === "function") {
              _self.successCallback(d)
            }
          }
        });
      } else {
        
      }
    }
  },
  "className": 'TemplateItem'
});