<template>
  <div class="codeEditorArea">
    <div v-if="sizeFlag" ref="appList" class="appListArea"></div>
    <div class="editorArea">
      <div class="editorToolbar">
        <div v-if="!sizeFlag" class="toolbarMain">
          <el-button
            class="newAppBtn"
            @click="openNewAppDialog()"
            :disabled="!editable"
            type="primary"
            size="small"
            >{{ $t("addTips") }}</el-button
          >
          <el-dropdown
            @command="handleCommand"
            size="small"
            class="indexItem"
            :class="{ 'is-empty': appList.length === 0 }"
            placement="bottom-start"
            trigger="click"
            :disabled="appList.length === 0"
          >
            <span class="el-dropdown-link">
              <span class="indexLabel">索引</span>
              <el-icon class="indexCaret"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="(item, i) in appList"
                  :key="item.cardName || i"
                  :command="i"
                >
                  <span class="dropdownItemLabel">{{
                    item.label || item.cardName
                  }}</span>
                  <i
                    v-if="i === current"
                    class="bi bi-check2 dropdownCheck"
                    aria-hidden="true"
                  ></i>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <div v-if="appList.length !== 0" class="currentItem">
          <span
            class="cardNameItem"
            :title="currentApp.label || currentApp.cardName || ''"
          >
            <i
              class="bi bi-file-earmark-code-fill cardNameIcon"
              aria-hidden="true"
            ></i>
            <span class="cardNameText">{{
              currentApp.label || currentApp.cardName || "-"
            }}</span>
          </span>
          <span
            v-if="changeFlag"
            class="dirtyDot"
            role="img"
            aria-label="有未保存的修改"
            title="有未保存的修改"
          ></span>
          <span class="topOptionArea">
            <el-popover
              trigger="click"
              :width="promptPanelWidth"
              placement="bottom-end"
            >
              <template #reference>
                <el-button
                  :disabled="aigcLoading || appList.length === 0"
                  :loading="aigcLoading"
                  size="small"
                >
                  <el-icon v-if="!aigcLoading" class="changeIcon"
                    ><magic-stick></magic-stick></el-icon
                  >变更
                </el-button>
              </template>
              <template #default>
                <div class="promptPanel">
                  <el-input
                    placeholder="请输入变更描述内容..."
                    :rows="5"
                    resize="none"
                    v-model="currentPrompt"
                    v-loading="aigcLoading"
                    type="textarea"
                  ></el-input>
                  <div class="promptFooter">
                    <span class="promptHint"
                      >生成后可预览并确认替换当前代码</span
                    >
                    <el-button
                      :disabled="aigcLoading"
                      :loading="aigcLoading"
                      @click="aigcNewVirsion()"
                      size="small"
                      type="primary"
                      >生成新版本</el-button
                    >
                  </div>
                </div>
              </template>
            </el-popover>
            <el-button
              :disabled="isRequesting || !changeFlag || appList.length === 0"
              :loading="isRequesting"
              @click="syncAppTemplate()"
              size="small"
              type="primary"
              >{{ $t("save") }}</el-button
            >
          </span>
        </div>
      </div>
      <div class="editorContent">
        <slot v-if="appList.length !== 0">
          <div class="codeEditorItem" ref="mainCodeEditor"></div>
        </slot>
        <el-empty v-else :description="emptyTips"></el-empty>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  beforeMount() {},
  data() {
    return {
      title: "",
      type: "module",
      tPath: "",
      activeName: "Main",
      isRequesting: false,
      aigcLoading: false,
      current: 0,
      exampleUrl: "",
      appList: [],
      emptyTips: webCpu.messages[lang].noMuduleTips,
      editable: true,
      changeFlag: false,
      currentPrompt: "",
      sizeFlag: WebTool.adjustSize([true, false, false]),
      currentStore: "",
      listApp: {
        url: "mainApp/app/infoItemList.vue",
        className: "ElementVueItem",
        cardName: "appItemList",
        dsl: {
          data: {
            buttonText: webCpu.messages[lang].addTips,
            defaultActive: "0",
            name: webCpu.messages[lang].moduleLibrary,
            menuData: [],
            buttonOptions: [
              {
                label: webCpu.messages[lang].copyBtn,
                command: "copy",
              },
              {
                label: webCpu.messages[lang].removeTips,
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
      _appEditor: {
        url: "plugins/elementVueItem/pageCard.vue",
        className: "ElementVueItem",
        cardName: "myAppEditor",
        dsl: {
          url: "",
          requestType: "get",
          dataType: "text",
          dataFilter: function (tData) {
            var dd = this.defaultData;
            dd.info.appDsl = tData;
            return dd;
          },
          data: {
            mode: "edit",
            config: [
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
              template: {
                label: "url",
                style: {
                  width: "calc( 100% - 120px )",
                  display: "inline-block",
                  verticalAlign: "middle",
                  paddingLeft: "20px",
                  marginTop: "5px",
                  color: "#bbb",
                },
                valueClass: "ellipsis",
                valueStyle: {
                  display: "inline-block",
                  verticalAlign: "middle",
                  width: "calc( 100% - 20px )",
                  color: "#999",
                  class: "ellipsis",
                },
              },
              buttonItem: {
                style: {
                  width: "auto",
                  display: "inline-block",
                  float: "right",
                  marginRight: "0px",
                  paddingRight: "5px",
                  height: "35px",
                  lineHeight: "35px",
                },
                content: [
                  {
                    label: webCpu.messages[lang].confirmPreview,
                    type: "primary",
                    text: true,
                    plain: true,
                    style: {
                      width: "auto",
                    },
                  },
                ],
              },
              appDsl: {
                valueStyle: {
                  position: "relative",
                  float: "left",
                  width: "100%",
                  height: "calc( 100% - 45px )",
                  display: "block",
                  overflow: "auto",
                },
                className: "CodeEditor",
                dsl: {
                  changeCallback: function (dd) {},
                  options: {
                    lineNumbers: true,
                    value: "",
                    mode: "vue",
                  },
                },
              },
            },
            info: {
              template: "",
              appDsl: "",
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
                var app = dd;
                if (
                  typeof dd === "string" &&
                  this.options.mode === "javascript"
                ) {
                  app = eval(`(${dd})`);
                }
                _self.info.appDsl = app;
                if (typeof _self.changeCallback === "function") {
                  _self.changeCallback(app);
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
          data: {
            mode: "edit",
            config: [
              {
                type: "text",
                prop: "name",
              },
              // {
              //   type: "text",
              //   prop: "type",
              // },
              {
                type: "text",
                prop: "prompt",
              },
              {
                type: "button",
                prop: "buttonGroup",
              },
            ],
            info: {
              name: "",
              type: "",
              prompt: "",
            },
            optionMap: {
              name: {
                label: webCpu.messages[lang].moduleName,
                style: {
                  width: "100%",
                  marginTop: "30px",
                  display: "block",
                },
                labelStyle: {
                  width: lang === "zh" ? "60px" : "110px",
                  display: "inline-block",
                },
              },
              type: {
                label: webCpu.messages[lang].moduleType,
                style: {
                  width: "100%",
                  marginTop: "20px",
                  display: "block",
                },
                labelStyle: {
                  width: lang === "zh" ? "60px" : "110px",
                  display: "inline-block",
                },
              },
              prompt: {
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
                  display: "block",
                },
                content: [
                  {
                    label: webCpu.messages[lang].confirmYes,
                    type: "primary",
                    style: {
                      width: "50%",
                    },
                  },
                  {
                    label: webCpu.messages[lang].confirmReset,
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
                size: "small",
                placeholder: webCpu.messages[lang].inputModuleName,
                valueStyle: {
                  width:
                    lang === "zh"
                      ? "calc( 100% - 60px )"
                      : "calc( 100% - 110px )",
                },
              },
              prompt: {
                type: "textarea",
                placeholder: webCpu.messages[lang].inputPrompt,
                valueStyle: {
                  width: "100%",
                },
              },
            },
          },
          methods: {
            handleClickButton: function () {},
          },
        },
      },
      interface: {
        saveAppCollection: {
          url: location.origin + "/bucket/personal/{{folderName}}/app/{{name}}",
          method: "put",
          dataType: "json",
        },
        aigcCodeString: {
          url: location.origin + "/gpt/aiGatewayRequest",
          method: "post",
          dataType: "json",
        },
        removeAppCollection: {
          url: location.origin + "/bucket/personal/{{folderName}}/app/{{name}}",
          method: "delete",
          dataType: "json",
        },
        saveAppTemplate: {
          url:
            location.origin + "/bucket/personal/{{folderName}}/layout/{{name}}",
          method: "put",
          dataType: "json",
        },
        removeAppTemplate: {
          url:
            location.origin + "/bucket/personal/{{folderName}}/layout/{{name}}",
          method: "delete",
          dataType: "json",
        },
      },
    };
  },
  computed: {
    currentApp() {
      return this.appList[this.current] || {};
    },
    promptPanelWidth() {
      const viewportWidth = window.innerWidth || 1200;
      return Math.max(240, Math.min(420, viewportWidth - 64));
    },
  },
  mounted() {
    let cardName = localStorage.getItem("layoutCardName");
    if (!cardName) {
      cardName = WebTool.urlQuery(location.href, "layoutCardName") || "";
    }
    this.initNewItemApp();
    this.$nextTick(() => {
      if (this.sizeFlag) {
        this.initAppList(cardName);
      } else {
        this.initEditor(cardName);
      }
    });
    this.initAdapter();
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
    syncAppCollection() {
      var params = this._parent.params;
      this.saveAppCollection(
        this.appList,
        params.name,
        params.folderName,
        function (tData) {
          console.log(tData);
        }
      );
    },
    updateAppData(dsl) {
      this.appEditor = WebTool.copyObject(this._appEditor);
      this.appEditor.dsl.data.optionMap.appDsl.valueStyle.height =
        "calc( 100% - 35px )";
      this.appEditor.dsl.url = dsl.url || "";
      this.appEditor.dsl.requestType = "get";
      this.appEditor.dsl.dataType = "text";
      this.appEditor.dsl.data.info.className =
        dsl.className || "ElementVueItem";
      this.editable =
        localStorage.folderName === this._parent.params.folderName;

      this.appEditor.dsl.data.optionMap.appDsl.dsl.options.readOnly =
        !this.editable;

      this.appEditor.dsl.style = {
        position: "absolute",
        left: "0px",
        transform: `scale(${1 / window.transformRadio})`,
        transformOrigin: "0 0",
        width: `${100 * window.transformRadio}%`,
        height: `${100 * window.transformRadio}%`,
      };

      this.appEditor.dsl.data.info.template = dsl.url;
      this.appEditor.dsl.data.optionMap.template.hidden = false;

      var _self = this;
      this.appEditor.dsl.methods.changeCallback = function (template) {
        _self.changeFlag = true;
        this.info.appDsl = template;
      };
      this.appEditor.dsl.methods.handleClickButton = function (d, config) {
        // $.base64.utf8encode = true;
        if (!d || !config) {
          return false;
        }
        let dUrl = this.info.appDsl;
        if (config.label === webCpu.messages[lang].confirmPreview) {
          _self.previewAppStr(dUrl, _self.appEditor.card);
        } else {
          let name = _self.appList[_self.current].cardName;
          _self.downloadWebApp(name, app);
        }
      };
      // let card = this._parent.card;
      // webCpu.CardItem.dismissMask(card);
      this.$nextTick(() => {
        var elem = this.$refs.mainCodeEditor;
        webCpu.updateView(elem, this.appEditor);
        this.isRequesting = false;
      });
    },
    generateHTML() {
      let plugin = WebTool.objectToString(this.appList[this.current]);
      delete plugin.dsl;
      let str = `let elem = document.body; webCpu.updateView(elem, ${plugin});`;
      str = beautifier.js(str);
      WebTool.copyString(str);
      this.$message({
        type: "success",
        message: "已生成在剪贴板中，可以直接粘贴",
      });

      // let app = this.appList[this.current];
      // this.downloadWebApp(app.cardName, app);
    },
    previewAppStr(appStr, card) {
      let jsParam = webCpu.getDslObj(appStr) || {};
      jsParam.style = jsParam.style || {};
      let style = {
        border: "solid 1px #ddd",
        borderRadius: "5px",
        padding: "15px",
        boxShadow: "1px 1px 1px #333",
        overflow: "auto",
        width: "100%",
        height: "100%",
      };
      style = webCpu.attachAttribute(jsParam.style, style);
      let app = {
        className: "ElementVueItem",
        task: {
          template: appStr,
          style: style,
        },
      };
      let param = {
        appDsl: app,
        callback: function (c) {
          webCpu.previewAppData(c, this.appDsl, "appData");
        },
        titleStyle: {
          background: "var(--el-color-primary-light-9)",
          color: "var(--el-color-primary)",
        },
        closeType: "back",
      };
      webCpu.CardItem.htmlDialog(
        card,
        webCpu.messages[lang].confirmPreview,
        "",
        param,
        {
          width: "100%",
        }
      );
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
      localStorage.setItem("layoutCardName", title);
      this.aigcLoading = false;
      this.updateAppData(dsl, title);
    },
    saveAppCollection(arr, name, folderName, callback) {
      var str = WebTool.objectToString(arr);
      str = "transweb_layout_collection(" + str + ");";
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
    saveAppTemplate(template, name, folderName, callback) {
      var file = new File([template], name, {
        type: "text/plain;charsst=utf8",
      });
      var formData = new FormData();
      formData.append("file", file);
      this.adapter.saveAppTemplate(
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
    removeAppTemplate(name, folderName) {
      let subfix = ".vue";
      name = name || this.currentApp.cardName + subfix;
      folderName = folderName || this._parent.params.folderName;
      this.adapter.removeAppTemplate(
        {},
        function (tData) {
          console.log(tData);
        },
        {
          name: name,
          folderName: folderName,
        }
      );
    },
    createNewApp(code, folderName, name, callback) {
      this.syncAppTemplate(code, folderName, name, () => {
        var app = {};
        var url = this.interface.saveAppTemplate.url;
        var param = {
          name: name + ".vue",
          folderName: folderName,
        };
        url = url.bindData(param);
        app = {
          cardName: name,
          className: "ElementVueItem",
          url: url,
          dsl: {},
        };
        this.appList.unshift(app);
        this.syncAppCollection();

        this.newItemDialog.code = "";
        this.current = 0;
        this.$nextTick(() => {
          if (this.sizeFlag) {
            this.initAppList();
          } else {
            this.initEditor();
          }
        });
        webCpu.CardItem.dismissMask(this._parent.card);
        if (typeof callback === "function") {
          callback(app);
        }
      });
    },
    initNewItemApp() {
      var _self = this;
      this.newItemDialog.dsl.methods.handleClickButton = function (d, param) {
        if (param.label !== webCpu.messages[lang].confirmYes) {
          this.info.name = "";
          this.info.prompt = "";
          return false;
        }

        if (!this.info || !this.info.name) {
          this.$message({
            type: "warning",
            message: webCpu.messages[lang].needInputName,
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
            message: webCpu.messages[lang].noDuplicateName,
          });
          return false;
        }

        this.loading = true;
        this.loadingTips = "生成组件中...预计需要等待 30 秒。";
        let folderName = _self._parent.params.folderName;
        let name = this.info.name;
        if (!this.info.code) {
          _self.requestCodeString(this.info.prompt, "", (str) => {
            _self.createNewApp(str, folderName, name, (app) => {
              this.loading = false;
            });
          });
        } else {
          _self.createNewApp(this.info.code, folderName, name, (app) => {
            this.loading = false;
          });
          this.info.code = "";
        }
      };
    },
    aigcNewVirsion() {
      if (!this.currentPrompt) {
        this.$message({
          type: "warning",
          message: "需要输入变更描述内容。",
        });
        return false;
      }
      let _self = this;
      this.aigcLoading = true;
      let context = this.appEditor.card.task.vueItem.info.appDsl;

      this.requestCodeString(this.currentPrompt, context, (str) => {
        if (str) {
          this.$message({
            type: "success",
            message: "新版本的代码已生成。",
          });
        }
        this.aigcLoading = false;
        let app = {
          className: "CodeEditor",
          dsl: {
            changeCallback: function (dd) {},
            options: {
              lineNumbers: true,
              value: "",
              mode: "vue",
            },
          },
        };
        app.dsl.data = str;

        let previewApp = function () {
          let code = app.card.task.data;
          _self.previewAppStr(code, webCpu.cards.newVersionDialog);
        };

        let confirmCallback = function () {
          _self.$message({
            type: "success",
            message: "确认新版本",
          });
          let code = app.card.task.data;
          _self.appEditor.card.task.vueItem.info.appDsl = code;
          _self.appEditor.card.task.vueItem.optionMap.appDsl.card.task.editor.setValue(
            code
          );
          webCpu.CardItem.dismissMask(document.body);

          let vueItem = _self.appEditor.card.task.vueItem;
          vueItem.handleClickButton(vueItem.info, {
            label: webCpu.messages[lang].confirmPreview,
          });
        };
        let card = this.appEditor.card;
        webCpu.CardItem.renderCardDialog(
          card,
          app,
          {
            title: "新版本",
            closeType: "back",
            dialogName: "newVersionDialog",
            menu: [
              {
                label: "预览",
                action: previewApp,
              },
              {
                label: "确认",
                action: confirmCallback,
              },
            ],
          },
          {
            width: "100%",
            height: "100%",
          }
        );
      });
    },
    requestCodeString(prompt, code, callback) {
      let context = prompt;
      let content = webCpu.messages[lang].codePrompt;
      if (code) {
        context = `- 现有组件代码：  
${code}}
- 修改需求：
${prompt}`;
        content = webCpu.messages[lang].modifyPrompt;
      }
      this.adapter.aigcCodeString(
        {
          context: context,
          content: content,
          apiName: "",
        },
        (tData) => {
          let json = {};
          try {
            json = JSON.parse(tData.usage.result);
            // WebTool.downloadString(tData.usage.result, "test.json");
          } catch (e) {
            console.log("##generate code error: ", e);
            this.$message({
              type: "warning",
              message: "生成代码出现异常，请重试",
            });
          }
          console.log("##aigc code data: ", tData);
          if (typeof callback === "function") {
            callback(json.code);
          }
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
      this.listApp.dsl.data.current = index;
      this.listApp.dsl.data.menuData = this.appList;

      if (this._parent && this._parent.params) {
        this.listApp.dsl.data.currentStore = this._parent.params.folderName;
      }
      this.listApp.dsl.methods.handleChangeList = function (v) {
        _self._parent.params.folderName = v;
        webCpu.fresh(_self._parent);
      };

      this.listApp.dsl.methods.handleClickItem = function (d, checkFlag) {
        if (_self.changeFlag && !checkFlag) {
          var _this = this;
          this.$confirm(
            "当前模板有修改，确认不先保存再切换新模板吗？",
            "提示",
            {
              confirmButtonText: "确认切换新模板",
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
          if (_self.current !== d) {
            _self.changeFlag = false;
          }
        }
        // _this.setActiveMenu(_this.defaultActive);
      };
      this.listApp.dsl.methods.handleCommand = function (code) {
        if (code === "copy") {
          let tCode = _self.appEditor.card.task.vueItem.info.appDsl;
          _self.newItemDialog.dsl.data.editorMap.prompt.disabled = true;
          this.handleClickBtn("copy", tCode);
        } else if (code === "remove") {
          this.$confirm(
            webCpu.messages[lang].confirmRemoveTips,
            webCpu.messages[lang].confirmDialogTitle,
            {
              confirmButtonText: webCpu.messages[lang].confirmYes,
              cancelButtonText: webCpu.messages[lang].confirmNo,
              type: "warning",
            }
          )
            .then(function () {
              _self.removeAppTemplate();
              _self.appList.splice(_self.current, 1);
              _self.current = (_self.current + 1) % _self.appList.length;
              _self.initAppList();
              _self.syncAppCollection();
            })
            .catch(function () {});
        }
      };
      this.listApp.dsl.methods.handleClickBtn = function (flag, code) {
        _self.openNewAppDialog(flag, code);
      };
      var elem = this.$refs.appList;
      webCpu.updateView(elem, this.listApp);
    },
    downloadWebApp(name, app, callback) {
      let param = {
        origin: location.origin,
        data: WebTool.objectToString(app),
        developer: localStorage.userName || webCpu.messages[lang].anonymous,
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
    openNewAppDialog(flag, content, title) {
      let code = content ? (content.code || content) : '';
      var param = {
        title: title || webCpu.messages[lang].addTips,
        dialogName: "newModuleDialog",
        titleStyle: {
          background: "var(--el-color-primary-light-9)",
          color: "var(--el-color-primary)",
        },
        closeType: "back",
      };

      if (flag === "copy") {
        param.title =  title || webCpu.messages[lang].copyBtn;
        this.newItemDialog.dsl.data.editorMap.prompt.disabled = true;
      } else {
        this.newItemDialog.dsl.data.editorMap.prompt.disabled = false;
      }

      this.newItemDialog.dsl.data.info.code = code;
      this.newItemDialog.dsl.data.info.name = content && content.name ? content.name : '';

      this.newItemDialog.flag = "";
      webCpu.CardItem.renderCardDialog(
        this._parent.card,
        this.newItemDialog,
        param,
        {
          width: "400px",
          height: "255px",
          background: "#fff",
          border: "solid 1px #ddd",
          borderRadius: "5px",
        }
      );
    },
    getAppData() {
      return this.appEditor.dsl.data.info.appDsl;
    },
    syncAppTemplate(template, folderName, name, callback) {
      if (!localStorage.folderName) {
        this.$message({
          type: "warning",
          message: webCpu.messages[lang].reLoginTips,
        });
        return false;
      }
      template = template || this.appEditor.card.task.vueItem.info.appDsl;
      folderName = folderName || this._parent.params.folderName;

      this.appList[this.current] = this.appList[this.current] || {};
      name = name || this.appList[this.current].cardName;
      name += ".vue";
      var _self = this;
      this.isRequesting = true;
      this.saveAppTemplate(template, name, folderName, function (tData) {
        console.log("模板代码同步成功。");
        _self.changeFlag = false;
        if (typeof callback === "function") {
          callback();
        }
        _self.isRequesting = false;
        _self.$message({
          type: "success",
          message: webCpu.messages[lang].saveSuccessTips,
        });
      });
    },
    handleCommand(code) {
      if (code === this.current) {
        return false;
      }
      var switchTo = () => {
        this.current = code;
        this.changeFlag = false;
        this.initEditor();
      };
      if (!this.changeFlag) {
        switchTo();
        return false;
      }
      this.$confirm(
        "当前模板有修改，确认不先保存再切换新模板吗？",
        "提示",
        {
          confirmButtonText: "确认切换新模板",
          cancelButtonText: "稍等",
          type: "warning",
        }
      )
        .then(switchTo)
        .catch(function () {});
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
    handleClick() {},
  },
};
</script>

<style scoped>
.codeEditorArea {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
}

.appListArea {
  position: relative;
  flex: 0 0 300px;
  width: 300px;
  height: 100%;
  min-height: 0;
  margin-right: 24px;
  overflow: hidden;
  box-sizing: border-box;
}

.editorArea {
  position: relative;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.editorToolbar {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  min-height: 48px;
  padding: 4px 0 12px;
  box-sizing: border-box;
}

.toolbarMain {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
}

.newAppBtn {
  flex: 0 0 auto;
}

.indexItem {
  flex: 0 0 auto;
}

.indexItem .el-dropdown-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 24px;
  padding: 0 8px;
  border-radius: 4px;
  color: var(--el-text-color-regular);
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
  outline: none;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.indexItem .el-dropdown-link:hover {
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-5);
}

.indexItem .el-dropdown-link:focus-visible {
  box-shadow: 0 0 0 2px var(--el-color-primary-light-5);
}

.indexItem.is-empty .el-dropdown-link {
  color: var(--el-text-color-placeholder);
  background-color: transparent;
  cursor: not-allowed;
}

.indexLabel {
  line-height: 1;
}

.indexCaret {
  font-size: 10px;
}

.currentItem {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.cardNameItem {
  display: inline-flex;
  flex: 0 1 auto;
  align-items: center;
  gap: 8px;
  min-width: 0;
  max-width: 100%;
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
}

.cardNameIcon {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background-color: var(--el-color-primary-light-5);
  color: var(--el-color-primary);
  font-size: 12px;
}

.cardNameText {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dirtyDot {
  flex: 0 0 auto;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--el-color-warning);
  box-shadow: 0 0 0 3px rgba(255, 122, 0, 0.12);
}

.topOptionArea {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.topOptionArea .el-button + .el-button {
  margin-left: 0;
}

.changeIcon {
  margin-right: 4px;
}

.editorContent {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
}

.codeEditorItem {
  position: relative;
  width: 100%;
  height: 100%;
  border-top: 1px solid var(--el-border-color-light);
  box-sizing: border-box;
}

.editorContent > .el-empty {
  height: 100%;
  margin: 0;
  box-sizing: border-box;
}

.promptPanel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.promptFooter {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  justify-content: space-between;
}

.promptHint {
  flex: 1 1 160px;
  min-width: 0;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 18px;
}

.promptFooter .el-button {
  flex: 0 0 auto;
  margin-left: auto;
}

.dropdownItemLabel {
  display: inline-block;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}

.dropdownCheck {
  margin-left: 8px;
  color: var(--el-color-primary);
  vertical-align: middle;
}

@media (max-width: 560px) {
  .currentItem {
    flex-basis: 100%;
  }
}
</style>
