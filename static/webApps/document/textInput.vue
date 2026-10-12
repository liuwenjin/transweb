<template>
  <div v-loading="isTransforming" class="oneKeyContentArea" ref="oneKeyContainer" :flag="flag">
    <div v-if="status == 1" ref="sloganInfoContainer" class="sloganInfoArea">
      <p class="z-text" :style="{ fontSize: flag ? '24px' : '' }" v-html="sanitizeHtml(meta.slogan || $t('slogan'))"></p>
      <p :style="{ fontSize: flag ? '14px' : '' }">
        {{ meta.slogan1 || $t("slogan1") }}
      </p>
    </div>
    <div class="selectPptFile stepItemArea" style="padding-bottom: 5px;">
              <span class="optionsArea">
                <span>
                  <el-popover v-if="aiEnable" placement="top-start" width="auto" trigger="click" :persistent="true" :teleported="false" append-to="parent" @show="handlePopoverOpen()">
                    <template #reference>
                      <el-button size="small" class="aiInfoArea">{{ apiInfo.current || $t("defaultKey") }}
                        <el-icon>
                          <setting></setting>
                        </el-icon>
                      </el-button>
                    </template>
                    <template #default>
                      <div :style="{
                          'font-weight': 900,
                          'max-width': flag ? '370px' : '500px',
                          width: '100%',
                          height: '200px',
                          overflow: 'hidden',
                          position: 'relative',
                          'font-size': '12px',
                        }">
                        <span style="
                            margin-bottom: 5px;
                            text-indent: 2px;
                            display: inline-block;
                            width: 100%;
                          " class="paneTitle">配置 AI 参数</span>
                        <span :style="{
                            display: 'inline-block',
                            width: flag
                              ? 'calc(100% - 78px)'
                              : 'calc(100% - 250px)',
                          }">
                          <el-select style="width: 100%" allow-create filterable clearable size="small" placement="bottom-start" :placeholder="$t('apiInputPlaceholder')" v-model="apiInfo.current" :persistent="true" :teleported="false" append-to="parent" @change="initApiEditor()">
                            <slot v-for="d in Object.keys(apiInfo.apiMap).reverse()">
                              <el-option v-if="d" :value="d" :label="d">
                                <span style="float: left">{{ d }}</span>
                                <el-button style="float: right; margin-top: 5px" size="small" text @click="removeApiItem(d)" type="danger">
                                  <el-icon>
                                    <delete></delete>
                                  </el-icon>
                                </el-button>
                              </el-option>
                            </slot>
                          </el-select>
                        </span>
                        <el-button v-if="apiInfo.current" @click="addParamItem()" style="
                            float: right;
                            margin-right: 2px;
                            width: 68px;
                            margin-bottom: 5px;
                          " size="small" type="info">{{ $t("addTips") }}</el-button>
                        <div class="paramsEditorArea" ref="paramsEditorItem"></div>
                        <div class="supportedPlatformArea">
                          {{ $t("supportedPlatformTips") }}:
                          <div class="marquee-wrapper" :style="{
                              width: lang === 'en' ? 'calc( 100% - 180px)' : '',
                            }">
                            <div class="marquee-container" ref="marqueeContainer">
                              <div class="marquee-content">
                                <el-tag size="small" @click="selectPlatformParam(item)" v-for="item in platformSupported" :key="item">{{ item }}</el-tag>
                              </div>
                              <div class="marquee-content" aria-hidden="true">
                                <el-tag size="small" @click="selectPlatformParam(item)" v-for="item in platformSupported" :key="item">{{ item }}</el-tag>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </template>
                  </el-popover>
                  <el-button style="margin-left: 10px" size="small" @click="newExampleItem()" class="newEmptyBtn" v-else-if="currentApp.contentExample && status === 1">新建文档(空白/示例)</el-button>
                </span>
                <el-button @click="clearInput()" :disabled="!textContent" style="
                    float: right;
                    display: inline-block;
                    vertical-align: middle;
                  " round type="warning" size="small">{{ $t("clearContent") }}</el-button>
              </span>
              <span :aiEnable="aiEnable" style="
                  display: inline-block;
                  width: 100%;
                  position: relative;
                  float: left;
                  height: calc(100% - 40px);
                ">
                <el-input v-model="textContent" :placeholder="
                      aiEnable
                        ? meta.inputPlaceholder || placeholder
                        : '输入文档的 JSON 字符串'
                    " :max="6" :min="6" :rows="6" type="textarea" resize="none" :clearable="true">
                </el-input>
              </span>
              <el-button style="position: absolute; bottom: 10px; right: 5px;" :disabled="
                  isTransforming ||
                  !textContent
                " :loading="isTransforming" :style="{ maxWidth: flag ? '400px' : '300px' }" class="shiny-button" @click="confirmStartTask()" type="primary">
                <el-icon v-if="!isTransforming" style="margin-right: 5px" :size="16">
                  <magic-stick />
                </el-icon>{{ meta.buttonText || $t("confirmButton") }}
              </el-button>
            </div>
  </div>
</template>

<script>
  export default {
    data() {
      let defaultKey = webCpu.messages[lang]["defaultKey"];
      return {
        isTransforming: false,
        flag: WebTool.adjustSize([false, false, true]),
        status: 1,
        limit: 2,
        apiEditor: {
          url: "plugins/elementVueItem/infoCardList.vue",
          cardName: "configInterfaceCard",
          className: "ElementVueItem",
          dsl: {
            data: {
              style: {
                height: "100%",
              },
              value: {},
              mode: "edit",
              editorMap: {
                name: {
                  type: "input",
                  placeholder: "输入名称",
                },
                value: {
                  type: "select",
                  placeholder: "输入值"
                },
              },
              optionMap: {
                name: {
                  style: {
                    width: "80px",
                    display: "inline-block",
                  },
                },
                value: {
                  style: {
                    width: "calc( 100% - 160px )",
                    display: "inline-block",
                  },
                },
                buttonItem: {
                  style: {
                    width: "70px",
                    float: "right",
                    display: "inline-block",
                  },
                  content: [{
                    label: webCpu.messages[lang].removeTips,
                    style: {
                      width: "68px",
                    },
                  }, ],
                },
              },
              config: [{
                  type: "text",
                  prop: "name",
                },
                {
                  type: "text",
                  prop: "value",
                },
                {
                  type: "button",
                  prop: "buttonItem",
                },
              ],
              info: [],
            },
            methods: {
              changeCallback: function() {},
              updateInfo: function() {
                this.value = {};
                this.$nextTick(() => {
                  let info = this.info;
                  for (let i = 0; i < info.length; i++) {
                    let d = info[i];
                    d.name = d.name || "";
                    d.name = d.name.trim();
                    if (!!d.name && d.name !== "undefined") {
                      this.value[d.name] = d.value;
                    }
                  }
                  if (typeof this.changeCallback === "function") {
                    this.changeCallback(this.value);
                  }
                });
              },
              dealChangeEvent: function(item, data) {
                this.updateInfo();
              },
              handleClickButton: function(d, config, i) {
                if (config.label === "删除") {
                  this.removeDataItem(i);
                  this.updateInfo();
                }
              },
            },
          },
        },
        platformMap: {
          "智能体@腾讯": {
            platform: "智能体@腾讯",
            assistant_id: "",
            token: "",
          },
          抖音豆包: {
            platform: "抖音豆包",
            model: "",
            apiKey: "",
          },
          硅基流动: {
            platform: "深度求索",
            model: "deepseek-ai/DeepSeek-R1",
            apiKey: "",
          },
          "智能体@文心一言": {
            platform: "智能体@文心一言",
            appId: "",
            secretKey: "",
          },
          月之暗面: {
            platform: "月之暗面",
            apiKey: "",
            model: "moonshot-v1-32k",
          },
          深度求索: {
            platform: "深度求索",
            model: "deepseek-chat",
            apiKey: "",
          },
          "天宫-3.0": {
            platform: "深度求索",
            app_key: "",
            app_secret: "",
          },
        },
        platformSupported: [
          "深度求索",
          "月之暗面",
          "智能体@腾讯",
          "抖音豆包",
          "天宫-3.0",
          "硅基流动",
          "智能体@文心一言",
        ],
        apiInfo: {
          current: "",
          apiMap: {
            [defaultKey]: {
              model: "gpt-4o-mini",
            },
            ollama: {
              platform: "ollama",
              url: "",
              model: "",
            },
            "智能体@腾讯": {
              platform: "智能体@腾讯",
              assistant_id: "",
              token: "",
            },
            抖音豆包: {
              platform: "抖音豆包",
              model: "",
              apiKey: "",
            },
            硅基流动: {
              platform: "深度求索",
              model: "deepseek-ai/DeepSeek-R1",
              apiKey: "",
            },
            "智能体@文心一言": {
              platform: "智能体@文心一言",
              appId: "",
              secretKey: "",
            },
            月之暗面: {
              platform: "月之暗面",
              apiKey: "",
              model: "moonshot-v1-32k",
            },
            deepSeek: {
              platform: "深度求索",
              model: "",
              apiKey: "",
            },
          },
        },
        modelListMap: {
          [defaultKey]: ["deepseek-r1", "gpt-4o-mini", "gemini-2.5-flash-preview"],
        },
        meta: {
          buttonText: "",
          confirmTips: "",
          slogan: "",
          slogan1: "",
          inputPlaceholder: "",
        },
        placeholder: webCpu.messages[lang].inputUrlTips,
        textContent: "",
        aiEnable: true,
        popoverVisible: false,
        currentApp: {},
        lang: window.lang,
        answerLoading: false,
      };
    },
    mounted() {
      this.initAdapter();
      let ztxt = new Ztextify(".z-text", {
        depth: "10px",
        layers: 20,
        fade: true,
        direction: "forwards",
        event: "pointer",
        eventRotation: "10deg",
      });
      if (localStorage.currentPromptContent && window.parent !== window) {
        this.textContent = localStorage.currentPromptContent;
        // localStorage.currentPromptContent = "";
      }
      if (localStorage.apiInfo) {
        this.apiInfo = JSON.parse(localStorage.apiInfo || "{}") || this.apiInfo;
      }
      if (this.auto) {
        this.confirmStartTask();
      } 
    },
    methods: {
      sanitizeHtml(html) {
        return window.WebTool && typeof window.WebTool.sanitizeHtml === "function"
          ? window.WebTool.sanitizeHtml(html)
          : html;
      },
      confirmStartTask() {},
      addParamItem() {
        if (this.currentEditorApp && this.currentEditorApp.card) {
          let vueItem = this.currentEditorApp.card.task.vueItem;
          vueItem.info.unshift({
            name: "",
            value: "",
          });
        }
      },
      handlePopoverOpen() {
        this.initApiEditor();
      },
      selectPlatformParam(platform) {
        if (this.currentEditorApp && this.currentEditorApp.card) {
          this.apiInfo.current = platform;
          this.apiInfo.apiMap[this.apiInfo.current] =
            this.apiInfo.apiMap[this.apiInfo.current] ||
            this.platformMap[platform];
          this.initApiEditor();
          this.$nextTick(() => {
            let api = this.apiInfo.apiMap[this.apiInfo.current];
            if (api) {
              api.platform = platform;
              this.restoreApiInfo(api);
            }
          });
        }
      },
      newExampleItem() {
        let json = this.currentApp.contentExample;
        if (typeof json !== "string") {
          json = WebTool.objectToString(json);
        }
        this.textContent = this.removeInvisibleUnicode(json);
        this.confirmStartTask();
      },
      removeInvisibleUnicode(str) {
        let doc = document.createElement("div");
        doc.innerHTML = str;
        return doc.textContent;
      },
      updateEditorApp(info) {
        let elem = this.$refs.paramsEditorItem;
        if (
          this.currentEditorApp &&
          this.currentEditorApp.card &&
          elem.innerHTML
        ) {
          let vueItem = this.currentEditorApp.card.task.vueItem;
          let api = this.apiInfo.apiMap[this.apiInfo.current];
          vueItem.info = [];

          if (info) {
            vueItem.info = info;
          } else {
            for (let k in api) {
              vueItem.info.push({
                name: k,
                value: api[k],
              });
            }
          }
          if (vueItem.info.length === 0 && this.apiInfo.current) {
            vueItem.info = [{
                name: "platform",
                value: ""
              },
              {
                name: "apiKey",
                value: ""
              },
              {
                name: "model",
                value: ""
              },
            ];
          }

          this.restoreApiInfo(api);
        } else {
          this.initApiEditor(info);
        }
      },
      removeApiItem(d) {
        this.$confirm(
          webCpu.messages[lang].confirmRemoveTips,
          webCpu.messages[lang].confirmDialogTitle, {
            confirmButtonText: webCpu.messages[lang].confirmYes,
            cancelButtonText: webCpu.messages[lang].confirmNo,
            type: "warning",
          }
        ).then(() => {
          delete this.apiInfo.apiMap[d];
          if (this.apiInfo.current === d) {
            this.apiInfo.current = "";
          }
          this.apiInfo = JSON.parse(JSON.stringify(this.apiInfo));
          localStorage.setItem("apiInfo", JSON.stringify(this.apiInfo));
        });
      },
      restoreApiInfo(value) {
        this.apiInfo = this.apiInfo || {};
        this.apiInfo.apiMap = this.apiInfo.apiMap || {};
        this.apiInfo.apiMap[this.apiInfo.current] = value;
        localStorage.setItem("apiInfo", JSON.stringify(this.apiInfo));
      },
      initApiEditor(info, flag) {
        this.apiInfo.current = this.apiInfo.current || this.$t("defaultKey");
        let elem = this.$refs.paramsEditorItem;
        let app = WebTool.copyObject(this.apiEditor);
        let _self = this;
        app.dsl.methods.changeCallback = function(param) {
          _self.apiInfo.apiMap[_self.apiInfo.current] = param;
          localStorage.setItem("apiInfo", JSON.stringify(_self.apiInfo));
        };

        let aData = app.dsl.data;
        if (elem) {
          let api = this.apiInfo.apiMap[this.apiInfo.current];
          aData.info = [];
          for (let k in api) {
            aData.info.push({
              name: k,
              value: api[k],
            });
          }
          if (info) {
            aData.info = info;
          }

          if ((!aData.info || aData.info.length === 0) && this.apiInfo.current) {
            aData.info = [{
                name: "platform",
                value: ""
              },
              {
                name: "apiKey",
                value: ""
              },
              {
                name: "model",
                value: ""
              },
            ];
          }
          if (this.apiInfo.current === this.$t("defaultKey")) {
            delete app.dsl.data.editorMap.name;
            app.dsl.data.editorMap.value.type = "select";
            app.dsl.data.editorMap.value.options =
              this.modelListMap[this.apiInfo.current];
          } else {
            app.dsl.data.editorMap.name = {
              type: "input",
              placeholder: "输入名称"
            };
            app.dsl.data.editorMap.value.type = "input";
          }
          webCpu.updateView(elem, app);
          this.currentEditorApp = app;
          this.restoreApiInfo(api);
        }
      },
      
      clearInput() {
        this.textContent = "";
        this.handleRemoveItem();
      },
      updateDataUrl(arr) {
        for (let i = 0; i < arr.length; i++) {
          WebTool.urlToBase64(arr[i].url, function(str) {
            console.log(str);
            arr[i].url = str;
          });
        }
      },
      initAdapter() {
        var config = this.interface || {};
        this.adapter = webCpu.initAdapter(config);
        return this.adapter;
      },
      
    },
  };
</script>

<style scoped>
  .oneKeyContentArea {
    position: relative;
    float: left;
    width: 100%;
    height: 100%;
    padding: 15px 0px;
    background: #F5F7FA;
    overflow: auto;
  }

  .aiGenerateArea {
    position: relative;
    width: 100%;
    float: left;
    text-align: center;
    display: inline-block;
  }

  .inputContentArea {
    margin: auto;
    display: inline-block;
    position: relative;
    text-align: left;
    width: 100%;
    height: auto;
    max-width: 700px;
    padding: 4px 30px;
  }

  .el-checkbox__label {
    padding-left: 3px;
    vertical-align: middle;
    padding-bottom: 4px;
  }

  .el-select-dropdown__item {
    padding-right: 3px;
    margin-top: 3px;
  }

  .selectImageBtn {
    position: absolute;
    bottom: 15px;
    right: 15px;
  }

  

  .oneKeyContentArea[flag="true"] .selectImageBtn {
    position: absolute;
    bottom: 15px;
    right: 33px;
  }

  .currentImageItem {
    position: absolute;
    bottom: 0px;
    right: 5px;
  }

  .oneKeyContentArea[flag="true"] .currentImageItem {
    position: absolute;
    bottom: 0px;
    right: 25px;
  }

  .currentImageItem .el-image {
    height: 60px;
    width: 80px;
  }

  .currentImageItem .removeImgBtn {
    position: absolute;
    left: -10px;
    top: -10px;
  }

  .sloganInfoArea {
    position: relative;
    float: left;
    width: 100%;
    margin: auto;
    display: inline-block;
    text-align: left;
    padding: 55px 20px 55px 20px;
    font-weight: 800;
  }

  .sloganInfoArea>p {
    position: relative;
    margin: auto;
    width: 100%;
    margin-bottom: 10px;
    text-align: center;
  }

  .sloganInfoArea>p:nth-child(1) {
    color: rgba(47, 42, 118, 0.5);
    font-size: 48px;
  }

  .sloganInfoArea>p:nth-child(2) {
    font-size: 16px;
    text-shadow: -1px 1px rgba(47, 42, 118, 0.3);
  }

  .shiny-button.el-button {
    color: white;
    border-top: solid 1px #ddd;
    border-left: solid 1px #ddd;
    box-shadow: 1px 1px #053388, 2px 2px #053388, 3px 3px #053388;
  }

  .shiny-button.el-button:hover {
    background: linear-gradient(90deg, #357abd, #4a90e2);
    box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.15);
    /* 增强阴影效果 */
    transform: translateY(-2px);
    /* 鼠标悬浮时微微上移 */
  }

  .shiny-button.el-button:active {
    /* 按钮按下时的样式 */
    box-shadow: inset 0px 5px 10px rgba(0, 0, 0, 0.2);
    /* 内阴影效果 */
    transform: translateY(2px);
    /* 稍微向下偏移 */
  }

  .aiInfoArea {
    font-size: 12px;
    display: inline-block;
    vertical-align: middle;
  }

  .aiInfoArea i {
    margin-left: 5px;
  }

  .paramsEditorArea {
    position: relative;
    width: calc(100% + 3px);
    height: calc(100% - 70px);
    margin-top: 5px;
    margin-left: -5px;
    margin-right: -5px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .paramsEditorArea .el-empty {
    transform: scale(0.5);
    transform-origin: center -10%;
  }

  .paramsEditorArea span[prop="name"] .el-input__wrapper {
    border-top-right-radius: 0px;
    border-bottom-right-radius: 0px;
  }

  .paramsEditorArea span[prop="value"] .el-input__wrapper,
  .paramsEditorArea span[prop="value"] .el-select__wrapper {
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
  }

  .supportedPlatformArea {
    float: left;
    text-align: left;
    width: 100%;
    height: 20px;
    overflow-x: auto;
  }

  

  .supportedPlatformArea .el-tag {
    margin-right: 5px;
    cursor: pointer;
  }

  /* 关键样式 */
  .marquee-wrapper {
    overflow: hidden;
    width: calc(100% - 110px);
    display: inline-block;
    vertical-align: middle;
    float: right;
  }

  .marquee-container {
    display: flex;
    width: max-content;
    animation: marquee 20s linear infinite;
    will-change: transform;
  }

  .marquee-content {
    display: flex;
    flex-shrink: 0;
    padding-right: 5px;
  }

  /* 悬停暂停 */
  .marquee-wrapper:hover .marquee-container {
    animation-play-state: paused;
  }

  .stepItemArea {
    width: 100%;
    display: inline-block;
    position: relative;
    float: left;
    font-size: 12px;
  }


  .transfromTipsItem {
    font-size: 10px;
    display: block;
    color: #999;
    width: 100%;
    margin-top: 20px;
  }

  .stepItemArea .el-textarea {
    height: 100%;
  }

  .stepItemArea .el-textarea textarea {
    height: 100%;
  }

  .selectFileItem {
    transform: scale(1.2);
    transform-origin: 20px 50px;
    width: 40px;
    vertical-align: middle;
    display: inline-block;
  }

  .selectFileItem .selectFileLabel {
    color: #aaa;
    width: 40px;
    cursor: pointer;
    border: none !important;
  }

  .selectFileItem .selectFileLabel::after {
    content: url(/webApps/document/card-image.svg);
    width: 100%;
    margin-right: 4px;
    background: #fff;
  }

  .pptExampleArea .el-card {
    width: 100%;
    margin-bottom: 15px;
    background-color: rgba(250, 250, 250, 0.95);
  }

  .contentItem {
    width: 100%;
    overflow: hidden;
    height: calc(100% - 40px);
  }

  .optionsArea {
    display: inline-block;
    position: relative;
    float: left;
    margin-bottom: 5px;
    text-indent: 2px;
    width: 100%;
  }

  .optionsArea .el-popper.is-light {
    overflow: hidden !important;
  }

  .optionsArea .el-select-dropdown__wrap {
    max-height: 145px;
    overflow: auto;
  }

  .selectModule .contentItem {
    border: solid 0px #f2f2f2;
  }

  .contentItem .el-upload {
    width: 100%;
    height: 100%;
  }

  .confirmItem {
    text-align: center;
    padding-right: 5px;
    margin-top: 35px;
  }


  .confirmItem .el-button {
    max-width: 350px;
    width: 90%;
    height: 50px;
    line-height: 50px;
    border-radius: 5px;
    font-size: 20px;
    background: linear-gradient(90deg, #4a90e2, #357abd);
    border: none;
    /* 无边框 */
    font-weight: bold;
    /* 加粗字体 */
  }



  .moduleSelector .el-radio-group {
    display: inline-block;
  }

  .selectPptFile .el-upload,
  .selectPptFile .el-textarea {
    background: linear-gradient(135deg, #f9f9f9, #e6e6e6);
    /* 淡灰色渐变背景 */
    border: 2px dashed #ccc;
    /* 虚线边框 */
    transition: background 0.3s ease;
    /* 背景渐变的过渡效果 */
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    /* 轻微的投影 */
    border-radius: 5px;
  }

</style>