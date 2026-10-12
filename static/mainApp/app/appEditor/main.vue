<template>
  <div :sizeFlag="sizeFlag" class="codeEditorArea">
    <div class="appListArea" v-if="sizeFlag" ref="appList">插件列表</div>
    <div v-else class="listOptionArea">
      <el-button
        class="newAppBtn"
        @click="openNewAppDialog"
        :disabled="!editable"
        type="primary"
        size="small"
        >新增</el-button
      >
      <el-dropdown
        @command="handleCommand"
        size="small"
        class="indexItem"
        placement="top-start"
      >
        <span class="el-dropdown-link" style="font-size: 12px">
          索引
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <slot v-for="(item, i) in appList">
              <el-dropdown-item :command="i">{{
                item.cardName
              }}</el-dropdown-item>
            </slot>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <span v-if="!sizeFlag" class="currentItem">
        <span
          class="cardNameItem ellipsis"
          :title="currentApp.label || currentApp.cardName"
          ><i class="bi bi-file-earmark-code-fill"></i
          >{{ currentApp.label || currentApp.cardName || "-" }}</span
        >
        <span class="topOptionArea">
          <el-button
            @click="generateHTML()"
            size="small"
            type="primary"
            plain
            text
            >复制移植代码</el-button
          ><el-button
            :disabled="!changeFlag && editable"
            @click="syncAppCollection()"
            size="small"
            type="primary"
            plain
            >保存</el-button
          ></span
        >
      </span>
    </div>
    <div class="editorArea">
      <slot v-if="currentApp">
        <span v-if="sizeFlag" class="currentItem">
          <span
            class="cardNameItem ellipsis"
            :title="currentApp.label || currentApp.cardName"
            ><i class="bi bi-file-earmark-code-fill"></i
            >{{ currentApp.label || currentApp.cardName || "-" }}</span
          >
          <span class="topOptionArea"
            ><el-button
              @click="generateHTML()"
              size="small"
              type="primary"
              plain
              text
              >复制移植代码</el-button
            ><el-button
              :disabled="!changeFlag"
              @click="syncAppCollection()"
              size="small"
              type="primary"
              plain
              >保存</el-button
            ></span
          >
        </span>
        <div class="codeEditorItem" ref="mainCodeEditor"></div>
      </slot>
      <el-empty v-else :description="emptyTips"></el-empty>
    </div>
  </div>
</template>

<script>
export default {
  beforeMount() {},
  data() {
    return {
      title: "",
      type: "",
      tPath: "",
      activeName: "Main",
      current: 0,
      changeFlag: false,
      sizeFlag: WebTool.adjustSize([true, false, false]),
      exampleUrl: "",
      emptyTips: "暂无插件",
      editable: true,
      appList: [],
      listApp: {
        url: "mainApp/app/infoItemList.vue",
        className: "ElementVueItem",
        cardName: "appItemList",
        dsl: {
          data: {
            buttonText: "新增",
            name: "插件库",
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
            current: 0,
          },
          promise: {
            mounted: function () {
              this.current = this.current || 0;
              $(this.$refs.menuItemsArea)
                .find(".myListItem")
                .eq(this.current)
                .click();
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
        url: "/plugins/elementVueItem/pageCard.vue",
        className: "ElementVueItem",
        dsl: {
          data: {
            mode: "edit",
            editorMap: {},
            config: [
              {
                type: "text",
                prop: "className",
              },
              {
                type: "button",
                prop: "buttonItem",
              },
              {
                type: "text",
                prop: "template",
              },
              {
                type: "plugin",
                prop: "appDsl",
              },
            ],
            optionMap: {
              className: {
                label: "className",
                style: {
                  width: "240px",
                  display: "inline-block",
                  verticalAlign: "middle",
                  paddingLeft: "20px",
                  color: "#bbb",
                },
                valueStyle: {
                  width: "calc( 100% - 80px )",
                  display: "inline-block",
                  verticalAlign: "middle",
                  color: "#999",
                },
              },
              template: {
                label: "url",
                style: {
                  width: "calc( 100% - 320px )",
                  display: "inline-block",
                  verticalAlign: "middle",
                  paddingLeft: WebTool.adjustSize(["0px", "0px", "20px"]),
                  color: "#bbb",
                },
                valueClass: "ellipsis",
                valueStyle: {
                  width: "calc( 100% - 40px )",
                  display: "inline-block",
                  verticalAlign: "middle",
                  color: "#999",
                },
              },
              buttonItem: {
                style: {
                  width: "auto",
                  display: "inline-block",
                  float: "right",
                  marginRight: "0px",
                  paddingRight: "5px",
                  height: "25px",
                  lineHeight: "25px",
                },
                content: [
                  {
                    label: "预览",
                    type: "primary",
                    text: true,
                    plain: true,
                    style: {
                      width: "auto",
                      marginTop: "0px",
                    },
                  },
                ],
              },
              appDsl: {
                className: "CodeEditor",
                cardName: "appCodeEditor",
                valueStyle: {
                  position: "relative",
                  float: "left",
                  width: "100%",
                  display: "block",
                  overflow: "auto",
                },
                style: {
                  paddingTop: "5px",
                },
                dsl: {
                  changeCallback: function (dd) {},
                  options: {
                    lineNumbers: true,
                    value: "",
                    mode: "jsObj",
                  },
                },
              },
            },
            info: {
              className: "TemplateItem",
              appDsl: {},
            },
            cardStyle: {
              height: "100%",
              width: "100%",
              position: "relative",
              background: "#f2f2f2",
              borderRadius: "0px",
              padding: "0px",
              float: "left",
            },
          },
          promise: {
            mounted: function () {
              var _self = this;
              this.optionMap.appDsl.card.task.changeCallback = function (dd) {
                _self.info.appDsl = dd;
                if (typeof _self.changeCallback === "function") {
                  _self.changeCallback(dd);
                }
              };
            },
          },
          methods: {
            handleClickButton: function (dd, config) {},
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
          url: "/mainApp/app/appEditor/example.js",
          requestType: "_jsonp",
          query: "transweb_example",
          dataFilter: function (tData) {
            var defaultData = this.defaultData;
            this.exampleMap = {};
            var _self = this;
            defaultData.editorMap.type.options = tData.map((item) => {
              var type = item.type || item.className;
              _self.exampleMap[type] = item;
              return {
                label: item.label,
                value: type,
              };
            });
            return defaultData;
          },
          data: {
            mode: "edit",
            config: [
              {
                type: "text",
                prop: "name",
              },
              {
                type: "text",
                prop: "type",
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
                label: "插件名称",
                style: {
                  width: "100%",
                  marginTop: "30px",
                  display: "block",
                },
              },
              type: {
                label: "插件类型",
                style: {
                  width: "100%",
                  marginTop: "20px",
                  display: "block",
                },
              },
              buttonGroup: {
                style: {
                  textAlign: "center",
                  position: "relative",
                  marginTop: "30px",
                  width: "100%",
                },
                content: [
                  {
                    label: "确认",
                    type: "primary",
                    size: "small",
                    style: {
                      width: "50%",
                    },
                  },
                  {
                    label: "重置",
                    size: "small",
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
                placeholder: "输入插件名称",
                valueStyle: {
                  width: "calc( 100% - 60px )",
                },
              },
              type: {
                type: "select",
                size: "default",
                placeholder: "输入插件类型",
                options: [],
                valueStyle: {
                  width: "calc( 100% - 60px )",
                  display: "inline-block",
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
        updatePluginGroup: {
          url: "/user/updatePluginGroup",
          requestType: "post",
          contentType: "application/json",
        },
        saveAppCollection: {
          url: "/bucket/personal/{{folderName}}/app/{{name}}",
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
      var app = this.appList[this.current] || this.appList[0] || {};
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
    let cardName = localStorage.getItem("appCardName");
    if (!cardName) {
      cardName = WebTool.urlQuery(location.href, "appCardName") || "";
    }

    this.initNewAppItem();
    this.$nextTick(() => {
      if (this.sizeFlag) {
        this.initAppList(cardName);
      } else {
        this.initEditor(cardName);
      }
    });

    this.getAppExample();
  },
  methods: {
    initNewAppItem() {
      let _self = this;
      this.newItemDialog.dsl.methods.handleClickButton = function (d, param) {
        if (param.label !== "确认") {
          this.info.name = "";
          this.info.type = "";

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
        var exampleMap = this._parent.exampleMap;
        var type = this.info.type;
        var app = {};

        if (this.info.name && this.editorMap.type.disabled) {
          app = _self.newItemDialog.copyItem;
          app.cardName = this.info.name;
        } else if (this.info.name && type) {
          let url = exampleMap[type].url || "";
          app = {
            type: type,
            cardName: this.info.name,
            className: exampleMap[type].className,
            url: url,
            dsl: exampleMap[type].dsl || {},
          };
        } else {
          this.$message({
            type: "warning",
            message: "名称或类型不可为空。",
          });
          return false;
        }
        _self.newItemDialog.flag = "";
        _self.appList.unshift(app);
        _self.current = 0;
        _self.syncAppCollection(true);
        _self.$nextTick(() => {
          if (_self.sizeFlag) {
            _self.initAppList();
          } else {
            _self.initEditor();
          }
        });
        webCpu.CardItem.dismissMask(_self._parent.card);
      };
    },
    initAdapter() {
      var config = this.interface || {};
      this.adapter = webCpu.initAdapter(config);
      window.tAdapter = this.adapter;
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
    getAppExample() {
      var _self = this;
      _self.typeMap = {};
      var config = this.interface.loadAppExample;
      WebAdapter.loadCardData(config.url, config.query, function (tData) {
        tData.map((item) => {
          _self.typeMap[item.type] = item;
        });
      });
    },
    checkAppCode(code) {
      if (
        !code &&
        (!webCpu.cards.appCodeEditor || !webCpu.cards.appCodeEditor.task)
      ) {
        return false;
      }
      code = code || webCpu.cards.appCodeEditor.task.data;
      var app = null;
      if (typeof code === "string") {
        try {
          app = eval(`(${code})`);
        } catch (e) {
          return false;
        }
      } else {
        app = code;
      }
      return app;
    },
    publishByOption(option, arr, callback, aOption) {
      let config = {
        loadCardList: {
          url: option.url,
          method: "jsonp",
          query: {
            callback: option.key,
          },
        },
        publishRequest: aOption || this.interface.updatePluginGroup,
      };
      let adapter = new webCpu.initAdapter(config);
      adapter.loadCardList(config.loadCardList.query, function (tData) {
        tData = tData || [];
        let list = tData.map((item) => {
          return {
            pluginUrl: option.url,
            pluginKey: option.key,
            cardName: item.cardName,
            account: localStorage.account,
            image: item.image || "",
            label: item.label || "",
          };
        });
        let tArr = [];
        arr = arr || [];
        for (let i = 0; i < list.length; i++) {
          if (arr.indexOf(list[i].cardName) === -1) {
            tArr.push(list[i]);
          }
        }
        adapter.publishRequest({ list: tArr }, function (tData) {
          if (typeof callback === "function") {
            callback(tData);
          }
        });
      });
    },
    publishPluginList(url, arr, callback) {
      url = url || this._parent.url.bindData(this._parent.params);
      let list = this.appList.map((item) => {
        return {
          pluginUrl: url,
          pluginKey: this._parent.query,
          cardName: item.cardName,
          account: localStorage.account,
          image: item.image || "",
          label: item.label || "",
        };
      });
      let tArr = [];
      arr = arr || [];
      // debugger
      for (let i = 0; i < list.length; i++) {
        if (arr.indexOf(list[i].cardName) === -1) {
          tArr.push(list[i]);
        }
      }
      this.adapter.updatePluginGroup({ list: tArr }, function (tData) {
        if (typeof callback === "function") {
          callback(tData);
        }
      });
    },
    syncAppCollection(flag) {
      var ret = true;
      if (!flag) {
        ret = this.checkAppCode();
      }
      if (!ret) {
        this.$message({
          type: "warning",
          message: "当前代码语法错误，无法编译成功",
        });
        return false;
      }
      if (!localStorage.folderName) {
        this.$message({
          type: "warning",
          message: "登录已失效，请重新登录",
        });
        return false;
      }
      var params = this._parent.params;
      var _self = this;
      this.saveAppCollection(
        this.appList,
        params.name,
        params.folderName,
        function (tData) {
          console.log("同步数据: app clollection.");
          _self.$message({
            type: "success",
            message: "保存成功",
          });
          _self.changeFlag = false;
        }
      );
    },
    generateHTML() {
      let url =
        location.origin + this._parent.url.bindData(this._parent.params);
      let name = this.appList[this.current].cardName;
      let str = `let elem = document.body; webCpu.renderCard(elem, { url: \"${url}\", key: "transweb_app_collection" }, \'${name}\')`;
      str = beautifier.js(str);
      WebTool.copyString(str);
      this.$message({
        type: "success",
        message: "已生成在剪贴板中，可以直接粘贴",
      });
      // let app = this.appList[this.current];
      // this.downloadWebApp(app.cardName, app);
    },
    downloadWebApp(name, app, callback) {
      var param = {
        origin: location.origin,
        data: WebTool.objectToString(app),
        developer: localStorage.userName || "匿名",
        folderName: localStorage.folderName,
        time: new Date().toLocaleString(),
      };
      name = name || app.cardName || "tempApp";
      name += ".html";
      WebAdapter.request(
        "template.html",
        "get",
        {},
        function (d) {
          var str = d.bindData(param);
          if (typeof callback !== "function") {
            WebTool.downloadString(str, name);
          } else {
            callback(str, name);
          }
        },
        "text"
      );
    },
    updateAppData(dsl) {
      this.appEditor.dsl.data.optionMap.appDsl.valueStyle.height =
        "calc( 100% - 35px )";

      this.editable =
        localStorage.folderName === this._parent.params.folderName;

      this.appEditor.dsl.data.optionMap.appDsl.dsl.options.readOnly =
        !this.editable;

      this.appEditor.dsl.data.info.appDsl = WebTool.objectToString(
        dsl.dsl || {}
      );
      this.appEditor.dsl.data.info.className = dsl.className;

      this.appEditor.dsl.style = {
        position: "absolute",
        left: "0px",
        transform: `scale(${1 / window.transformRadio})`,
        transformOrigin: "0 0",
        width: `${100 * window.transformRadio}%`,
        height: `${100 * window.transformRadio}%`,
      };

      this.appEditor.dsl.data.info.template = dsl.url;
      if (dsl.url) {
        this.appEditor.dsl.data.optionMap.template.hidden = false;
      } else {
        this.appEditor.dsl.data.optionMap.template.hidden = true;
      }

      var elem = this.$refs.mainCodeEditor;
      var _self = this;
      this.appEditor.dsl.methods.changeCallback = function (dd) {
        var app = _self.checkAppCode(dd);
        if (!app) {
          console.log("代码有异常，无法编译成功");
          return false;
        }
        var _app = _self.appList[_self.current];
        _self.appList[_self.current] = {
          className: this.info.className,
          type: _app.type || "-",
          url: this.info.template,
          cardName: _app.cardName,
          dsl: app,
        };
        _self.changeFlag = true;
      };
      this.appEditor.dsl.methods.handleClickButton = function (d, config) {
        if (config.label === "预览") {
          var app = _self.checkAppCode();
          if (!app) {
            console.log("代码有异常，无法编译成功");
            return false;
          }
          let param = {
            appDsl: {
              className: this.info.className,
              url: this.info.template,
              dsl: app,
            },
            callback: function (c) {
              var str = WebTool.objectToString(this.appDsl);
              webCpu.previewAppData(c, str, _self.type || "appData");
            },
            closeType: "right",
          };
          webCpu.CardItem.htmlDialog(this._parent.card, "预览效果", "", param, {
            width: "100%",
          });
        }
      };
      // webCpu.CardItem.dismissMask(this._parent.card);
      webCpu.updateView(elem, this.appEditor);
    },
    initEditor(cardName) {
      if (cardName) {
        this.current = this.searchArray(this.appList, "cardName", cardName);
        if (this.current === -1) {
          this.current = 0;
        }
      }
      var dsl = this.appList[this.current] || {};
      var title = dsl.cardName || this.title || "DSL编辑";
      localStorage.setItem("appCardName", title);
      this.updateAppData(dsl, title);
    },
    saveAppCollection(arr, name, folderName, callback) {
      var str = WebTool.objectToString(arr);
      str = "transweb_app_collection(" + str + ");";
      var file = new File([str], name, {
        type: "text/plain;charsst=utf8",
      });
      var formData = new FormData();
      formData.append("file", file);
      this.adapter.saveAppCollection(
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
    initAppList(cardName) {
      var _self = this;
      let index = 0;
      if (cardName) {
        index = this.searchArray(_self.appList, "cardName", cardName);
        if (index === -1) {
          index = 0;
        }
      }
      this.listApp.dsl.data.menuData = this.appList;
      this.listApp.dsl.data.current = index;

      if (this._parent && this._parent.params) {
        this.listApp.dsl.data.currentStore = this._parent.params.folderName;
      }
      this.listApp.dsl.methods.handleChangeList = function (v) {
        _self._parent.params.folderName = v;
        webCpu.fresh(_self._parent);
      };

      this.listApp.dsl.methods.handleClickItem = function (d, checkFlag) {
        var _this = this;
        if (_self.changeFlag && !checkFlag) {
          this.$confirm(
            "当前模板有修改，确认不先保存再切换新插件吗？",
            "提示",
            {
              confirmButtonText: "确认切换新插件",
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
          this.$confirm("确定移除页面插件吗?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }).then(function () {
            _self.appList.splice(_self.current, 1);
            _self.current = (_self.current + 1) % _self.appList.length;
            _self.initAppList();
            _self.syncAppCollection();
          });
        }
      };
      this.listApp.dsl.methods.handleClickBtn = function () {
        _self.openNewAppDialog();
      };
      var elem = this.$refs.appList;
      webCpu.updateView(elem, this.listApp);
    },
    openNewAppDialog() {
      var param = {
        title: "新增插件",
      };
      if (this.newItemDialog.flag === "copy") {
        param.title = "复制插件";
        var type = this.newItemDialog.copyItem.type;
        this.newItemDialog.dsl.data.info.type = type;
        this.newItemDialog.dsl.data.editorMap.type.disabled = true;
      } else {
        this.newItemDialog.dsl.data.editorMap.type.disabled = false;
        this.newItemDialog.dsl.data.editorMap.type.placeholder = "选择插件类型";
      }

      this.newItemDialog.flag = "";
      let card = this._parent.card;
      webCpu.CardItem.renderCardDialog(card, this.newItemDialog, param, {
        width: "325px",
        height: "235px",
        background: "#fff",
        borderRadius: "5px",
        border: "solid 1px #ddd",
      });
    },
    getAppData() {
      return this.appEditor.dsl.data.info.appDsl;
    },
    handleCommand(code) {
      this.current = code;
      this.initEditor();
    },
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

.codeEditorArea[sizeFlag="false"] {
  padding-left: 0px;
}

.codeEditorArea[sizeFlag="false"] .listOptionArea {
  position: relative;
  float: left;
  width: 100%;
  height: 30px;
  line-height: 30px;
}

.listOptionArea .indexItem {
  display: inline-block;
  vertical-align: middle;
}

.newAppBtn {
  float: left;
  margin-right: 20px;
  margin-left: -10px;
  vertical-align: middle;
  margin-top: 5px;
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
  position: relative;
  width: 100%;
  height: 100%;
}

div {
  line-height: 1.5;
}


span,
label {
  line-height: inherit;
}

.codeEditorArea[sizeFlag="false"] .editorArea {
  height: calc(100% - 30px);
  margin-top: 10px;
  width: calc(100% + 60px);
  margin-left: -30px;
}

.codeEditorItem {
  height: 100%;
  position: relative;
  padding-top: 40px;
}
.codeEditorArea[sizeFlag="false"] .codeEditorItem {
  padding-top: 0px;
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

.codeEditorItem > .CardItem {
  border-top: solid 1px #ddd;
}

.el-tabs__item.is-active {
  background: #fff;
}

.el-tabs__content {
  height: calc(100% - 40px);
  border-bottom: solid 1px #ddd;
}

.currentItem {
  position: absolute;
  width: 100%;
  display: inline-block;
  top: 10px;
  left: 0px;
  z-index: 3;
}

.codeEditorArea[sizeFlag="false"] .currentItem {
  left: 130px;
  width: calc(100% - 120px);
  top: 0px;
}

.topOptionArea {
  float: right;
  display: inline-block;
  margin-right: 0px;
  color: #999;
}

.codeEditorArea[sizeFlag="false"] .topOptionArea {
  margin-left: 5px;
}

.el-empty {
  margin-top: 20px;
  margin-left: -240px;
}

.cardNameItem {
  float: left;
  max-width: 160px;
}

.cardNameItem > i {
  margin-right: 5px;
}
</style>
