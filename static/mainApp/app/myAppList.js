transweb_myAppList({
  task: {
    url: "bucket/personal/{{account}}/webApps/",
    requestType: "get",
    dataType: "json",
    data: [],
    style: {
      overflow: "auto"
    },
    webApp: {
      mode: "",
      moduleMap: {},
      routeData: [],
      dependency: {},
      appMap: {},
      style: {}
    },
    folderName: localStorage.getItem("folderName"),
    infoGallery: {
      url: "/plugins/elementVueItem/cardItemList.vue",
      className: "ElementVueItem",
      dsl: {
        dataFilter(d) {
          var size = WebTool.adjustSize([4, 3, 1]);
          d.span = 24 / size;
          var hidden = WebTool.adjustSize([false, false, true]);
          var width = WebTool.adjustSize(["75px", "75px", "30px"]);
          d.config[1].content[0].hidden = hidden;
          d.optionMap.buttonGroup.style.width = width;
          return d;
        },
        data: {
          span: 6,
          cardStyle: "height: 48px; background: #fff; margin-bottom: 10px; box-shadow: 1px 2px 3px 0px rgba(0, 0, 0, 0.85);",
          optionMap: {
            fileName: {
              class: "ellipsis",
              style: "display: inline-block; float: left; width: calc( 100% - 120px );"
            },
            buttonGroup: {
              style: {
                display: "inline-block",
                float: "right",
                width: "75px",
                textAlign: "right"
              }
              // style: "display: inline-block; float: right; width: 75px; text-align: right;"
            }
          },
          config: [{
            type: "text",
            prop: "fileName",
          }, {
            type: "button",
            prop: "buttonGroup",
            content: [{
              eventName: "edit",
              icon: "edit",
              width: "12px"
            }, {
              icon: "delete",
              width: "12px",
              eventName: "delete"
            }]
          }],
          info: []
        },
        methods: {
          handleClickButton: function () {

          }
        }
      }
    },
    previewWebApp: {
      url: "/components/commonAppViewer.vue",
      className: "ElementVueItem"
    },
    newItemDialog: {
      url: "/components/newItemDialog.vue",
      className: "ElementVueItem",
      cardName: "newItemDialog",
      dsl: {
        data: {
          title: ""
        },
      }
    },
    deleteWebApp: function (item) {
      var folderName = localStorage.getItem("folderName");
      var _self = this;
      webCpu.cards.commonMenuItem.task.vueItem.$confirm("确定删除应用吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        webCpu.adapter.removeAppItem({
          flag: 0
        }, function (tData) {
          webCpu.fresh(_self.card, null, true);
          console.log(tData);
        }, {
          name: encodeURIComponent(item.name),
          folderName: folderName
        });
      });
    },
    editWebApp: function (item) {
      var tUrl = this.url + "/" + item.name;
      $.get(tUrl, function (text) {
        var tData = webCpu.util.transformAppText(text);
        localStorage.setItem("currentWebApp", WebTool.objectToString(tData.card));
        localStorage.setItem("currentAppUrl", tUrl);
        localStorage.setItem("currentAppKey", tData.key);
        localStorage.setItem("currentAppName", item.name.replace(/\.js/, ""));
        webCpu.CardItem.iframeDialog(webCpu.cards.main, "编辑应用", location.origin + "/tool.html");
      }, "text");
    },
    viewWebApp: function (item) {
      var tUrl = this.url + "/" + item.name;
      var _self = this;
      $.get(tUrl, function (text) {
        var tData = webCpu.util.transformAppText(text);
        var tName = item.name.replace(/\.js$/, "");
        localStorage.setItem("currentWebApp", WebTool.objectToString(tData.card));
        localStorage.setItem("currentAppName", tName);
        localStorage.setItem("currentAppKey", tData.key);
        localStorage.setItem("currentAppUrl", tUrl);
        tData.card.type = "WebApp";
        _self.previewWebApp.dsl = {
          data: {
            label: "",
            app: tData.card
          }
        }
        webCpu.CardItem.renderCardDialog(webCpu.cards.main, _self.previewWebApp, {
          title: tName,
          closeType: "back"
        });
        // webCpu.CardItem.iframeDialog(webCpu.cards.main, "新建页面", "/tool.html");
      }, "text");
    },
    template: '<div class="clearfix" style="width: 100%; height: 40px; margin-right: 0px;">\
                  <button style="margin-top: 4px; padding: 5px 15px;" type="button"  class="rounded-pill btn btn-sm btn-outline-info align-middle newItemBtn"><i class="bi bi-plus-lg"></i>新增</button>\
                  <span style="transform: scale(0.95); transform-origin: 0 0; float: right; width: 240px; display: inline-block; margin-right: -10px; padding-right: 0px;"><div class="input-group mb-3">\
                      <input type="text" class="form-control keywordInput" placeholder="输入关键词" aria-label="输入关键词" aria-describedby="button-addon2">\
                      <div class="input-group-append">\
                        <button class="btn searchBtn btn-outline-secondary" type="button" id="button-addon2">检索</button>\
                      </div>\
                    </div></span>\
                </div>\
               <div class="myContentArea" style="width: 100%; height: calc( 100% - 60px );"></div>',
    promise: {
      beforeRender: function (c, d, t) {
        t.newItemDialog.dsl.promise = {
          methods: {
            cancelSubmit: function () {
              webCpu.CardItem.dismissMask(webCpu.cards.main);
            },
            confirmSubmit: function () {
              var name = this.formData.data[0].value || "";
              name = name.replace(/\.js$/, "");
              name = name.trim();
              // t.webApp.mode = this.formData.data[1].value || "mobile";
              var folderName = t.folderName;
              if (!name) {
                this.$message({
                  type: "warning",
                  message: "需要输入一个应用名称。"
                })
                return false;
              }
              if (!folderName) {
                this.$message({
                  type: "warning",
                  message: "登录失效，需要重新登录。"
                });
                return false;
              }
              // name = name + ".js";
              var _self = this;
              var tUrl = t.url + name + ".js";
              webCpu.util.verifyFileExist(tUrl, folderName, name + ".js", function () {
                var str = WebTool.objectToString(t.webApp);
                var key = webCpu.util.saveWebApp(str, folderName, name + ".js", "", function () {
                  _self.$message({
                    type: "success",
                    message: "新增成功。"
                  });
                  localStorage.setItem("currentAppUrl", tUrl);
                  localStorage.setItem("currentAppKey", key);
                  localStorage.setItem("currentAppName", name);
                  webCpu.fresh(t.card, null, true);
                  webCpu.CardItem.dismissMask(webCpu.cards.main);
                  localStorage.setItem("currentWebApp", str);
                  webCpu.CardItem.iframeDialog(webCpu.cards.main, "新增应用", location.origin + "/tool.html");
                }, function () {
                  _self.$message({
                    type: "warning",
                    message: "新增失败，服务端异常。"
                  });
                });

              }, function () {
                _self.$message({
                  type: "warning",
                  message: "应用名称不可以同名。"
                })
              });
            }
          }
        }
        if (d && d.data) {
          d = t.data = d.data.sort(function (a, b) {
            return b.attrs.atimeMs - a.attrs.atimeMs;
          })
          d = d.data || d || [];
          if (d.length !== 0) {
            var tArr = [];
            for (var j = 0; j < d.length; j++) {
              var tName = decodeURIComponent(d[j].name);
              if (tName.match(/\.js$/i)) {
                d[j].fileName = tName.replace(/\.js$/i, "");
                tArr.push(d[j]);
              }
            }
            d = tArr;
          }
          var pager = {
            front: 1,
            current: 1,
            size: WebTool.adjustSize([50, 50, 12]),
            total: d.length
          }

          t.infoGallery.dsl.methods = t.infoGallery.dsl.methods || {};

          t.infoGallery.dsl.methods.loadByScroll = function () {
            var _data = t._data || [];
            // var n = (t.option.page.current++);
            t.option.page.current++
            try {
              var start = t.option.page.current - 1;
              var size = t.option.page.size;
              var arr = _data.slice(start * size, (start + 1) * size)
              arr = this.info.concat(arr);
              this.updateData({
                info: arr
              });
              // this.info = t.data;
            } catch (e) {
              console.log(e);
            }
          }
          t.option = {
            page: pager
          };
        }
        else {
          location.href = "/";
        }
        console.log(d);
      },
      afterRender: function (c, d, t) {
        if(document.body.clientWidth < 1200){
          $(c).find(".newItemBtn").hide();
        }

        $(c).find("input.keywordInput").val(t.searchText || "");
        $(c).find(".searchBtn").on("click", function () {
          var v = $(c).find("input.keywordInput").val();
          t.searchText = v;
          t.dataFilter = function (tData) {
            var arr = tData.data;
            tData.data = [];
            for (var i = 0; i < arr.length; i++) {
              if (arr[i].name.search(v) !== -1) {
                tData.data.push(arr[i]);
              }
            }
            return tData;
          }
          webCpu.fresh(t, null, true);
        });
        $(c).find(".newItemBtn").on("click", function () {
          var param = {
            title: "新增应用"
          };
          webCpu.CardItem.renderCardDialog(webCpu.cards.main, t.newItemDialog, param, {
            width: "325px",
            height: "160px",
            border: "solid 1px #ddd"
          });
        });

        var elem = $(c).find(".myContentArea")[0];

        t.infoGallery.dsl.data.info = d;
        t.infoGallery.dsl.methods = t.infoGallery.dsl.methods || {};
        t.infoGallery.dsl.methods.handleClickButton = function (item, config, i) {
          console.log(item, config, i);
          if (config.eventName === "edit") {
            t.editWebApp(item);
          } else if (config.eventName === "delete") {
            t.deleteWebApp(item);
          } else {}
        }

        t.infoGallery.dsl.methods.handleClickCard = function (item, config, i) {
          if (config.prop !== "fileName") {
            return false;
          }
          t.viewWebApp(item);
        }

        webCpu.updateView(elem, t.infoGallery);
        // console.log(t.infoGallery);
      }
    }
  }
})