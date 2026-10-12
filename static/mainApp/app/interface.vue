<template>
  <div class="codeEditorArea">
    <div class="appListArea" ref="appList">列表区域</div>
    <div class="editorArea">
      <slot v-if="currentApp">
        <span class="currentItem">
          <span class="cardNameItem"
            ><i class="bi bi-file-earmark-code-fill"></i
            >{{ currentApp.label || currentApp.cardName || "-" }}</span
          >
          <span class="topOptionArea"
            ><el-button
              :disabled="!changeFlag"
              @click="syncInterfaceCollection()"
              type="primary"
              plain
              size="small"
              >保存</el-button
            ></span
          >
        </span>
        <div class="codeEditorItem" ref="mainCodeEditor"></div>
      </slot>
      <el-empty v-else :description="emptyTips"></el-empty>
    </div>
    <div v-if="currentApp" class="testArea">
      <span class="testTipsArea"
        ><i class="bi bi-arrow-down-short"></i
        ><span class="topTips">输入参数可调试</span></span
      >
      <div class="testItemArea" ref="testItemArea">
        <div class="testInterfaceArea">
          <div class="paramInputArea">
            <el-input
              style="
                width: calc(50% - 30px);
                display: inline-block;
                padding-bottom: 10px;
                float: left;
              "
              v-model="currentQuery"
              :rows="3"
              type="textarea"
              placeholder="请输入Query"
            ></el-input>
            <div
              style="
                width: calc(50% - 50px);
                display: inline-block;
                height: 70px;
                overflow: auto;
                margin-left: 10px;
                float: left;
              "
              v-if="currentParams && currentParams.length != 0"
            >
              <span
                class="paramItem"
                :key="item"
                v-for="item in currentParams"
                style="display: inline-block; width: 100%"
              >
                <span
                  class="ellipsis"
                  style="display: inline-block; margin-bottom: 5px; width: 55px"
                  :title="item.key"
                  >{{ item.key }}:</span
                >
                <el-input
                  :style="'display: inline-block; width: calc( 100% - 60px )'"
                  size="small"
                  placeholder="请输入URL内的参数"
                  v-model="item.value"
                ></el-input>
              </span>
            </div>
            <el-button
              style="float: left; margin-top: 3px; margin-left: 5px; width: 65px; height: 65px;padding: 24px"
              type="primary"
              @click="handleTestInterFace"
              plain
              >调用<br />接口</el-button
            >
          </div>
          <div class="testResultArea">
            <div v-if="!testResult" style="position: relative; color: #999; padding: 20px;">
              {{ emptyTips }}
            </div>
            <slot v-else>
              <div v-if="testResult === 'json'" ref="testResultElement"></div>
              <div v-else ref="testResultElement">
                {{ testResult }}
              </div>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  beforeMount() {},
  data() {
    return {
      title: "Web服务接口",
      type: "",
      tPath: "",
      activeName: "Main",
      current: 0,
      changeFlag: false,
      exampleUrl: "",
      emptyTips: "暂无Web服务接口",
      appList: [],
      currentQuery: "",
      currentParams: [],
      resultType: "",
      testResult: "",
      emptyTips: "暂无数据",
      listApp: {
        url: "components/infoItemList.vue",
        className: "ElementVueItem",
        cardName: "appItemList",
        dsl: {
          data: {
            buttonText: "新增",
            name: "Web服务接口",
            menuData: [],
            buttonOptions: [
              {
                label: "复制",
                command: "copy",
              },
              {
                label: "删除",
                command: "remove",
              },
            ],
          },
          promise: {
            mounted: function () {
              $(this.$refs.menuItemsArea).find(".myListItem").eq(0).click();
            },
          },
          methods: {
            handleClickItem: function (index) {},
            handleClickBtn: function () {},
            confirmDialog: function (d) {},
          },
        },
      },
      appEditor: {
        url: "plugins/elementVueItem/pageCard.vue",
        className: "ElementVueItem",
        cardName: "configInterfaceItem",
        dsl: {
          style: {
            "max-width": "800px",
            float: "left",
          },
          data: {
            mode: "edit",
            editorMap: {
              url: {
                type: "input",
                size: "default",
                placeholder: "输入Web服务接口URL",
                valueStyle: {
                  margin: "5px 0px 15px 0px",
                },
              },
              method: {
                type: "select",
                size: "default",
                placeholder: "输入数据请求的类型",
                options: ["get", "post", "put", "delete"],
                valueStyle: {
                  margin: "5px 0px 15px 0px",
                },
              },
              contentType: {
                type: "select",
                size: "default",
                placeholder: "输入请求参数的路径",
                valueStyle: {
                  margin: "5px 0px 15px 0px",
                },
                options: [
                  {
                    label: "form-urlencoded",
                    value: "form-urlencoded",
                  },
                  {
                    label: "json",
                    value: "json",
                  },
                  {
                    label: "form-data",
                    value: "form-data",
                  },
                ],
              },

              dataType: {
                type: "select",
                size: "default",
                placeholder: "输入请求参数的路径",
                valueStyle: {
                  margin: "5px 0px 15px 0px",
                },
                options: [
                  {
                    label: "json",
                    value: "json",
                  },
                  {
                    label: "text",
                    value: "text",
                  },
                ],
              },
            },
            config: [
              {
                type: "button",
                prop: "exampleBtn",
              },
              {
                type: "text",
                prop: "url",
              },
              {
                type: "text",
                prop: "path",
              },
              {
                type: "text",
                prop: "method",
              },
              {
                type: "text",
                prop: "contentType",
              },
              {
                type: "text",
                prop: "dataType",
              },
            ],
            optionMap: {
              exampleBtn: {
                style: {
                  right: "0px",
                  position: "absolute",
                },
                content: [
                  {
                    label: "测试授权文件",
                    style: {
                      width: "120px",
                    },
                  },
                ],
              },
              url: {
                style: {
                  "margin-top": "25px",
                  float: "right",
                  width: "100%",
                  position: "relative",
                },
                label: "Web服务接口URL",
              },
              method: {
                label: "请求类型",
              },
              contentType: {
                label: "参数类型",
              },
              paramContent: {
                label: "参数内容",
              },
              dataType: {
                label: "接口数据类型",
              },
              buttonGroup: {
                style: {
                  "text-align": "center",
                },
                content: [
                  {
                    label: "确认",
                    type: "primary",
                    style: {
                      width: "100px",
                    },
                  },
                  {
                    label: "重置",
                    style: {
                      width: "70px",
                    },
                  },
                ],
              },
            },
            info: {
              exampleBtn: "",
              url: "",
              path: "",
              method: "",
              dataType: "",
              contentType: "",
              paramContent: "",
            },
            style:
              "position: relative; width: 100%; height: 100%; overflow: auto;",
            cardStyle: "position: relative; width: 100%; height: 100%",
          },
          methods: {
            handleClickButton: function (d, config, i) {
              if (config.label === "测试授权文件") {
                let _self = this;
                webCpu.util.checkProxy(
                  d.url,
                  function () {
                    _self.$message({
                      type: "success",
                      message: "授权文件有效",
                    });
                  },
                  function () {
                    _self.$message({
                      type: "warning",
                      message: "授权文件无效或者网络连接超时(2s)",
                    });
                  }
                );
              }
            },
          },
        },
      },
      newItemDialog: {
        url: "plugins/elementVueItem/pageCard.vue",
        className: "ElementVueItem",
        cardName: "newItemDialog",
        dsl: {
          style: {
            padding: "0px 15px",
            boxSizing: "content",
          },
          data: {
            mode: "edit",
            config: [
              {
                type: "text",
                prop: "name",
              },
              {
                type: "button",
                prop: "buttonGroup",
              },
            ],
            info: {
              name: "",
              type: "",
            },
            optionMap: {
              name: {
                label: "接口名称",
                style: {
                  width: "100%",
                  marginTop: "30px",
                  display: "block",
                },
              },

              buttonGroup: {
                style: {
                  textAlign: "center",
                  position: "relative",
                  marginTop: "20px",
                  width: "100%",
                },
                content: [
                  {
                    label: "确认",
                    type: "primary",
                    size: "default",
                    style: {
                      width: "50%",
                    },
                  },
                  {
                    label: "重置",
                    size: "default",
                    style: {
                      width: "50%",
                    },
                  },
                ],
              },
            },
            editorMap: {
              name: {
                type: "input",
                size: "default",
                placeholder: "输入接口名称",
                valueStyle: {
                  width: "calc( 100% - 75px )",
                },
              },
            },
          },
          methods: {
            handleClickButton: function () {},
          },
        },
      },
      typeMap: {},
      interface: {
        loadAppExample: {
          url: "/mainApp/app/appEditor/example.js",
          requestType: "_jsonp",
          query: "transweb_example",
        },
        saveInterfaceCollection: {
          url: "/bucket/personal/{{folderName}}/other/{{name}}",
          method: "put",
          dataType: "json",
        },
        removeAppCollection: {
          url: "/bucket/personal/{{folderName}}/app/{{name}}",
          method: "delete",
          dataType: "json",
        },
        saveAppTemplate: {
          url: "/bucket/personal/{{folderName}}/layout/{{name}}",
          method: "put",
          dataType: "json",
        },
        removeAppTemplate: {
          url: "/bucket/personal/{{folderName}}/layout/{{name}}",
          method: "delete",
          dataType: "json",
        },
      },
    };
  },
  computed: {
    currentApp() {
      var app = this.appList[this.current];
      return app;
    },

    typeName() {
      var map = this.typeMap || {};
      var type = this.appList[this.current].type;
      map[type] = map[type] || {};
      return map[type].label || type || "-";
    },
  },
  mounted() {
    this.initAdapter();
    this.initAppList();
  },
  methods: {
    initAdapter() {
      this.adapter = {};
      var config = this.interface || {};
      for (var k in config) {
        var adapter = config[k];
        var type = adapter.type || adapter.requestType || adapter.method;
        this.adapter[k] = new WebRequest(
          adapter.url,
          type,
          adapter.dataType,
          adapter.contentType,
          adapter.proxy
        );
      }
    },
    searchArray(arr, key, v) {
      var ret = -1;
      for (var i = 0; i < arr.length; i++) {
        if (arr[i][key] === v) {
          ret = i;
          break;
        }
      }
      return ret;
    },
    testInterface: function (d, query, callback, params) {
      WebAdapter.request(
        d.url,
        d.method || "get",
        query || {},
        function (testData) {
          if (typeof callback === "function") {
            callback(testData);
          }
        },
        {
          contentType: d.contentType || "",
          dataType: d.dataType || "json",
          proxy: true,
          params: params || {},
        }
      );
    },
    checkProxy: function (url, callback, tCallback) {
      let arr = url.match(/https?:\/\/([^/]+)\//i);
      if (arr && arr[0]) {
        url = arr[0] + "proxy.html";
      } else {
        url += "/proxy.html";
      }
      let flag = true;
      setTimeout(function () {
        if (flag && typeof tCallback === "function") {
          tCallback();
        }
      }, 2000);
      WebAdapter.request(
        url,
        "get",
        {},
        function (testData) {
          flag = false;
          if (typeof callback === "function") {
            callback(testData);
          }
        },
        {
          contentType: "",
          dataType: "text",
          proxy: true,
        }
      );
    },
    handleTestInterFace() {
      let config = this.appEditor.card.task.vueItem.info;
      this.testResult = "loading";
      let _self = this;
      if (config.url) {
        let params = {};
        this.currentParams.map((item) => {
          params[item.key] = item.value;
        });
        let flag = true;
        setTimeout(function () {
          if (flag) {
            _self.resultType = "error";
            let el = _self.$refs.testResultElement;
            _self.$message({
              type: "warning",
              message: "接口调用失败，详细信息请打开调试台确认。",
            });
            $(el).html("接口调用失败，详细信息请打开调试台确认。");
          }
        }, 3000);
        _self.testInterface(
          config,
          {},
          function (tData) {
            flag = false;
            _self.testResult = tData;
            let el = _self.$refs.testResultElement;
            let dataType = config.dataType || "json";
            _self.resultType = dataType;
            if (dataType === "json") {
              try {
                let data = _self.testResult;
                // if(typeof _self.testResult === 'string') JSON.parse(_self.testResult);
                if (data) {
                  $(el).jsonViewer(data);
                } else {
                  $(el).html("暂无数据");
                }
              } catch (e) {}
            } else {
              // $(el).html(_self.testResult);
            }
          },
          params
        );
      } else {
      }
    },
    syncInterfaceCollection() {
      var params = this._parent.params;
      var _self = this;
      this.saveInterfaceCollection(
        this.appList,
        params.name,
        params.folderName,
        function (tData) {
          console.log("同步数据: interface clollection.");
          _self.$message({
            type: "success",
            message: "保存成功",
          });
          _self.changeFlag = false;
        }
      );
    },
    updateInterfaceParams(params, title) {
      var elem = this.$refs.mainCodeEditor;
      webCpu.CardItem.dismissMask(webCpu.cards.main);
      let _self = this;
      params = params || {};
      let info = this.appEditor.dsl.data.info;
      for (let k in info) {
        info[k] = params[k] || "";
      }
      this.currentQuery = "";
      this.appEditor.dsl.methods.dealChangeEvent = function (item, data) {
        _self.appList[_self.current][item.prop] = data[item.prop];
        if (item.prop === "url") {
          _self.updateCurrentParams();
        }
        _self.changeFlag = true;
      };
      _self.updateCurrentParams();
      webCpu.updateView(elem, this.appEditor);
    },
    initEditor() {
      var dsl = this.appList[this.current] || {};
      var title = dsl.cardName || this.title || "DSL编辑";
      this.updateInterfaceParams(dsl, title);
    },
    saveInterfaceCollection(arr, name, folderName, callback) {
      var str = WebTool.objectToString(arr);
      str = "transweb_interface_collection(" + str + ");";
      var file = new File([str], name, {
        type: "text/plain;charsst=utf8",
      });
      var formData = new FormData();
      formData.append("file", file);
      this.adapter.saveInterfaceCollection(
        formData,
        function (tData) {
          console.log(tData);
          if (typeof callback === "function") {
            callback();
          }
        },
        {
          folderName: folderName,
          name: name,
        }
      );
    },
    updateCurrentParams() {
      var app = this.appList[this.current];
      let url = app.url || "";
      let arr = url.getKeys();
      arr = arr.map((item) => {
        let t = {
          key: item,
          value: "",
        };
        return t;
      });
      this.currentParams = arr;
    },
    initAppList() {
      var _self = this;
      this.listApp.dsl.data.menuData = this.appList;
      this.newItemDialog.dsl.methods.handleClickButton = function (d, param) {
        if (param.label !== "确认") {
          this.info.name = "";
          return false;
        }

        if (!this.info || !this.info.name) {
          this.$message({
            type: "warning",
            message: "需要输入名称",
          });
          return false;
        }

        var index = _self.searchArray(
          _self.appList,
          "cardName",
          this.info.name
        );
        if (index !== -1) {
          this.$message({
            type: "warning",
            message: "名称不可以重名",
          });
          return false;
        }
        var app = {};
        if (this.info.name) {
          app = _self.newItemDialog.copyItem || app;
          app.label = this.info.name;
          _self.newItemDialog.copyItem = null;
        } else {
          this.$message({
            type: "warning",
            message: "名称或类型不可为空。",
          });
        }
        _self.newItemDialog.flag = "";
        _self.appList.unshift(app);
        _self.current = 0;
        _self.initAppList();
        _self.syncInterfaceCollection();
      };
      this.listApp.dsl.methods.handleClickItem = function (d, checkFlag) {
        var _this = this;
        if (_self.changeFlag && !checkFlag) {
          this.$confirm(
            "当前接口有修改，确认不先保存再切换新接口吗？",
            "提示",
            {
              confirmButtonText: "确认切换新接口",
              cancelButtonText: "稍等",
              type: "warning",
            }
          )
            .then(() => {
              _self.current = d;
              this.defaultActive = d + "";
              _self.initEditor();
              _self.changeFlag = false;
              _this.setActiveMenu(_this.defaultActive);
            })
            .catch(function (e) {
              _this.$nextTick(() => {
                _this.defaultActive = _self.current + "";
                _this.setActiveMenu(_this.defaultActive);
              });
            });
        } else {
          _self.current = d;
          this.defaultActive = d + "";
          _self.initEditor();
        }
        _this.setActiveMenu(_this.defaultActive);
      };
      this.listApp.dsl.methods.handleCommand = function (code) {
        if (code === "copy") {
          _self.newItemDialog.flag = "copy";
          _self.newItemDialog.dsl.data.info.name = "";
          _self.newItemDialog.copyItem = WebTool.copyObject(
            _self.appList[_self.current]
          );
          this.handleClickBtn();
        } else if (code === "remove") {
          this.$confirm("确定移除Web服务接口吗?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }).then(function () {
            _self.appList.splice(_self.current, 1);
            _self.current = (_self.current + 1) % _self.appList.length;
            _self.initAppList();
            _self.syncInterfaceCollection();
          });
        }
      };
      this.listApp.dsl.methods.handleClickBtn = function () {
        var param = {
          style: {
            background: "rgba(200, 200, 200, 0.9)",
          },
          titleStyle: {
            textAlign: "left",
            borderBottom: "solid 1px #f8f8f8",
          },
          title: "新增Web服务接口",
        };
        if (_self.newItemDialog.flag === "copy") {
          param.title = "复制Web服务接口";
          var type = _self.newItemDialog.copyItem.type;
          _self.newItemDialog.dsl.data.info.type = type;
          _self.newItemDialog.dsl.data.editorMap.type.disabled = true;
        }

        _self.newItemDialog.flag = "";

        webCpu.CardItem.renderCardDialog(
          webCpu.cards.main,
          _self.newItemDialog,
          param,
          {
            width: "325px",
            height: "220px",
            background: "#fff",
            borderRadius: "5px",
          }
        );
      };
      var elem = this.$refs.appList;
      webCpu.updateView(elem, this.listApp);
    },
    getAppData() {
      return this.appEditor.dsl.data.info.appDsl;
    },
    handleCommand(code) {},
    previewAppItem() {
      this.appEditor.dsl.methods.handleClickButton();
    },
    handleClick() {},
  },
};
</script>

<style scoped>
.codeEditorArea {
  float: left;
  position: relative;
  width: 100%;
  height: 100%;
  padding-left: 320px;
}
.appListArea {
  position: absolute;
  left: 0px;
  width: 300px;
  height: 100%;
  top: 0px;
}

.editorArea {
  float: left;
  display: inline-block;
  position: relative;
  width: 50%;
  height: 100%;
}
.testArea {
  float: right;
  display: inline-block;
  position: relative;
  width: calc(50% - 10px);
  height: 100%;
}

.codeEditorItem,
.testItemArea {
  height: 100%;
  position: relative;
  padding-top: 40px;
}
.testInterfaceArea {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #fff;
}

.el-tabs,
.el-tab-pane {
  position: relative;
  height: 100%;
}

.el-tabs__header {
  margin-bottom: 0px;
}

.el-tabs__nav {
  float: right;
}

.el-tabs__item.is-active {
  background: #fff;
}

.el-tabs__content {
  height: calc(100% - 40px);
  border-bottom: solid 1px #ddd;
}

.testResultArea {
  position: relative;
  float: left;
  width: 100%;
  height: calc(100% - 50px);
  padding: 15px 0px 0px 30px;
  overflow: auto;
  background: #f8f8f8;
}

.testResultArea > div {
  background: #f8f8f8;
  position: relative;
  float: left;
  width: 100%;
  min-height: 100%;
}

.currentItem,
.testTipsArea {
  position: absolute;
  width: 100%;
  display: inline-block;
  top: 10px;
  left: 0px;
  line-height: 30px;
  height: 30px;
  z-index: 3;
}

.topTips {
  color: #999;
  font-size: 12px;
}

.codeEditorItem > .CardItem,
.testInterfaceArea {
  border-top: solid 1px #ddd;
}

.el-menu.el-menu--vertical {
  position: relative;
  float: left;
  width: 100%;
}

.topOptionArea {
  float: right;
}

.topOptionArea .el-button {
  margin-bottom: 5px;
}

.testInterfaceArea {
  padding: 15px;
}

.el-empty {
  margin-top: 20px;
  margin-left: -240px;
}
.cardNameItem > i {
  margin-right: 5px;
}
</style>
