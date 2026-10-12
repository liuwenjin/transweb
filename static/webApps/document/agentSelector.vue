<template>
  <div class="agentSelectorArea">
    <span class="selectTemplateOption">
      <el-radio-group
        @change="handleChangeRadio"
        v-if="supoportCustom"
        v-model="type"
      >
        <el-radio-button
          v-for="(item, index) in typeList"
          :key="index"
          :label="item"
          :value="item"
          size="small"
          >{{ $t(item) }}</el-radio-button
        >
      </el-radio-group>
      <el-button @click="loadAigcDialog()" type="primary" size="small"
        >AI 生成模板</el-button
      >
    </span>
    <div
      class="input-group"
      style="margin-left: 10px"
      v-if="type === 'webScript'"
    >
      <input
        type="text"
        class="form-control"
        :value="valueMap['webScript']"
        @change.native="handleInputChange"
        :placeholder="$t('webScriptTips')"
        :aria-label="$t('webScriptTips')"
        aria-describedby="button-addon2"
      />
      <div class="input-group-append">
        <button
          @click="loadScriptItem"
          class="btn btn-outline-primary"
          type="button"
        >
          {{ $t("loadScript") }}
        </button>
      </div>
    </div>
    <div
      class="input-group"
      style="margin-left: 10px"
      v-else-if="type === 'localScript'"
    >
      <div class="custom-file">
        <input
          type="file"
          @change.native="handleScriptChange"
          :value="valueMap[type]"
          class="custom-file-input"
          accept=".js"
          id="inputGroupFile04"
          aria-describedby="inputGroupFileAddon04"
        />
        <label
          ref="fileNameItem"
          class="custom-file-label text-primary"
          for="inputGroupFile04"
          >{{ $t("localScriptTips") }}</label
        >
      </div>
    </div>
    <div class="imageViewerArea" ref="agentListItem"></div>
  </div>
</template>

<style scoped>
.agentSelectorArea {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 5px;
}

.imageViewerArea {
  position: relative;
  float: left;
  width: 100%;
  margin-top: 10px;
  height: calc(100% - 80px);
}

.selectTemplateOption {
  display: inline-block;
  width: 100%;
  margin-bottom: 10px;
}

.selectTemplateOption
  .el-radio-button.is-active
  .el-radio-button__original-radio:not(:disabled)
  + .el-radio-button__inner {
  background-color: #666;
}
.selectTemplateOption .el-radio-group {
  float: left;
  vertical-align: middle;
  height: 25px;
  margin-left: 10px;
}
.selectTemplateOption .el-button {
  margin-right: 10px;
  float: right;
}

.imageViewerArea .el-image {
  width: 100%;
  height: 100%;
}

.cardListArea {
  padding: 0px 10px;
}

.cardListArea .el-card {
  border: solid 1px #f2f2f2;
  background-color: #fdfdfd;
}
.cardListArea .el-card[selected="true"] {
  border: solid 1px #ddd;
  box-shadow: 2px 2px #888;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 30px;
}
</style>

<script>
export default {
  data() {
    return {
      typeList: ["defaultScript", "localScript", "webScript"],
      defaultImage: "",
      listMap: {
        webScript: "",
        localScript: "",
        defaultScript: "",
      },
      supoportCustom: true,
      limit: 10 * 1024 * 1024,
      valueMap: {
        defaultScript: "",
        webScript: "",
        localScript: "",
      },
      type: "defaultScript",
      file: null,
      publishInfo: {},
      templateApp: {
        url: "/webApps/document/textInput.vue",
        dsl: {
          data: {
            meta: {
              buttonText: "生成模板",
              slogan: "AI 生成模板，快速配置或拼装组件",
              slogan1: "智能分析任务描述内容，自动生成应用程序模板",
              inputPlaceholder: "请输入任务描述内容",
            },
          },
          style: {
            width: 900,
            height: 450,
            padding: "10px 30px",
          },
        },
        className: "ElementVueItem",
      },
      agentListApp: {
        label: webCpu.messages[lang].agentList,
        url: webCpu.documentPrefix + "/plugins/elementVueItem/infoCardList.vue",
        className: "ElementVueItem",
        dsl: {
          style: {
            height: "100%",
            overflow: "auto",
          },
          dataFilter: function (tData) {
            let ret = this.defaultData;
            if (this.data.mode === "edit" && typeof ret.info !== "string") {
              ret.info = WebTool.objectToString(ret.info);
            } else if (
              this.data.mode !== "edit" &&
              typeof ret.info === "string"
            ) {
              ret.info = WebTool.stringToObject(ret.info);
            } else {
            }
            if (
              this.data.mode !== "edit" &&
              ret.info.constructor.name === "Array"
            ) {
              ret.info = ret.info.map((item) => {
                return {
                  name: item.name,
                  label: item.meta.label,
                  description: item.meta.description,
                };
              });
            }
            return ret;
          },
          data: {
            info: [],
            gutter: 20,
            selected: 0,
            span: WebTool.adjustSize([false, false, true]) ? 24 : 12,
            style: {
              height: "100%",
              overflow: "auto",
              padding: "0px 20px",
            },
            mode: "singleSelection",
            cardStyle: {
              borderWeight: "1px",
              padding: "15px 20px",
              marginBottom: "10px",
              height: "100%",
              cursor: "pointer",
              overflow: "auto",
            },
            optionMap: {
              name: {
                before: "-",
                style: {
                  display: "inline-block",
                  fontWeight: 900,
                },
              },
              label: {
                style: {
                  display: "inline-block",
                  fontWeight: 900,
                },
              },
              description: {
                class: "ellipsis_2",
                style: {
                  display: "block",
                  height: "40px",
                },
              },
            },
            config: [
              {
                type: "text",
                prop: "label",
              },
              {
                type: "text",
                prop: "name",
              },
              {
                type: "text",
                prop: "description",
              },
            ],
          },
          methods: {
            handleClickCard: function (d, config) {},
          },
        },
      },
      currentList: [],
      interface: {
        getAgentScript: {
          url: webCpu.documentPrefix + "/gpt/aiGatewayRequest",
          method: "jsonp",
          query: "transweb_agents",
        },
        apiGatewayRequest: {
          url: "/gpt/aiGatewayRequest",
          method: "post",
        },
      },
      foreign:
        location.host === "transweb.ai" ||
        WebTool.urlQuery(location.href, "foreign"),
    };
  },
  computed: {},
  mounted() {
    this.listMap.defaultScript = this.currentList;
    this.initAdapter();
    this.updateAgentList(this.listMap.defaultScript);
  },
  methods: {
    handleChangeRadio(v) {
      this.currentList = this.listMap[this.type] || [];
      this.updateAgentList(this.currentList || []);
    },
    loadScriptItem(e) {
      let url = this.valueMap["webScript"];
      if (!url) {
        this.$message({
          type: "warning",
          message: "URL" + webCpu.messages[lang].notEmptyTips,
        });
        return false;
      }
      let btn = e.target;
      $(btn).attr("disabled", true);
      $(btn).attr("title", webCpu.messages[lang].loadScriptTips);
      $(btn).html(webCpu.messages[lang].loadScriptTips);
      this.getAgentScript(() => {
        $(btn).attr("disabled", false);
        $(btn).attr("title", webCpu.messages[lang].loadScript);
        $(btn).html(webCpu.messages[lang].loadScript);
      });
    },
    getAgentScript(callback) {
      this.interface.getAgentScript.url = this.valueMap[this.type];
      this.initAdapter();
      this.adapter.getAgentScript({}, (tData) => {
        let tArr = tData.agentList || tData;
        this.updateAgentList(tArr);
        this.currentList = tArr;
        this.listMap[this.type] = tArr;
        if (typeof callback === "function") {
          callback(tArr);
        }
      });
    },
    initAdapter() {
      var config = this.interface || {};
      this.adapter = webCpu.initAdapter(config);
      return this.adapter;
    },
    getCurrentSelected() {
      let app = this.agentListApp;
      let vueItem = app.card.task.vueItem;
      return this.currentList[vueItem.selected] || vueItem.currentItem;
    },
    updateAgentList(arr) {
      let app = this.agentListApp;
      app.dsl.data.info = arr || [];

      app.dsl.methods.handleClickCard = function (d, c, i) {
        this.selected = i;
      };
      let elem = this.$refs.agentListItem;
      webCpu.updateView(elem, app);
    },
    confirmSelectAgent() {},
    confirmLoadScript(callback) {
      if (!this.currentList || this.currentList.length === 0) {
        this.$message({
          type: "warning",
          message: webCpu.messages[lang].invalidScriptTips,
        });
        return false;
      } else {
        this.currentList = this.currentList.map((item) => {
          delete item.publishInfo;
          return item;
        });
        // Todo: confirm select agent
        if (typeof this.confirmSelectAgent === "function") {
          this.confirmSelectAgent();
        }
      }
    },
    aigcTemplate(prompt, callback) {
      let query = {};
      query.content = webCpu.messages.zh.aigcTemplatePrompt;
      query.context = prompt;

      let param = {};
      let apiInfo = JSON.parse(localStorage.getItem("apiInfo") || "{}") || {};
      if (apiInfo.apiMap && apiInfo.current) {
        param = apiInfo.apiMap[apiInfo.current] || {};
        webCpu.attachAttribute(param, query);
      }

      if (param.platform) {
        query.apiName = param.platform;
        delete query.platform;
        if (param.platform !== "custom" && param.platform !== "ollama") {
          delete query.url;
        }
      }

      if (!query.apiName) {
        query.apiName = "智谱-代码生成";
        query.model = "GLM-4.5";
      }

      console.log("aigc params", query);
      this.adapter.apiGatewayRequest(query, function (tData) {
        if (typeof callback === "function") {
          callback(tData);
        }
      });
    },
    loadAigcDialog() {
      let app = this.templateApp;
      let card = this._parent.card;
      app.dsl.methods = app.dsl.methods || {};
      let _self = this;
      app.dsl.methods.confirmStartTask = function () {
        this.isTransforming = true;
        let text = this.textContent;
        _self.aigcTemplate(text, (tData) => {
          this.isTransforming = false;
          let result = tData.usage.result;
          result = JSON.parse(result);
          console.log(result);
          let appJson = {
            name: result.name,
            meta: {
              label: result.title,
              description: result.description,
              slogan: result.slogan,
              slogan1: result.slogan1,
              buttonText: webCpu.messages[lang].confirmRequest,
              inputPlaceholder: result.inputReq.info,
            },
            index: -1,
            appPrompts: result.prompt,
            appMap: {},
            contentApp: {
              url: "/webApps/document/defaultBlock.vue",
              className: "ElementVueItem",
            },
            startApp: "/webApps/document/input.vue",
          };
          if (!result.prompt) {
            appJson = {
              name: result.name,
              meta: {
                label: result.title,
                description: result.description,
              },
              index: -1,
              appMap: {},
              startApp: {
                url: "/webApps/document/defaultBlock.vue",
                className: "ElementVueItem",
              },
            };
          }
          let arr = result.contentReq.list || [];
          for (let i = 0; i < arr.length; i++) {
            let item = arr[i];
            appJson.appMap[item.name] = `To Select: ${item.description}`;
          }
          let app = _self.agentListApp;
          let vueItem = app.card.task.vueItem;
          vueItem.selected = -1;
          vueItem.currentItem = appJson;
          $(webCpu.cards.editInfoDialog.task.titleArea)
            .find(".menuItem")
            .click();
        });
      };
      webCpu.CardItem.renderCardDialog(
        card,
        app,
        {
          title: "AI 生成模板中",
          closeType: "back",
          titleStyle: {
            background: "var(--el-color-primary-light-9)",
            color: "var(--el-color-primary)",
          },
        },
        {
          width: 800,
          height: 400,
          border: "solid 1px #f2f2f2",
          borderRadius: "5px",
        }
      );
    },
    handleInputChange(e) {
      this.valueMap[this.type] = e.target.value;
    },
    strToAgents(str, callback) {
      // 仅接受固定格式 transweb_agents({...})，降低任意代码执行面
      if (
        typeof str !== "string" ||
        !/^\s*transweb_agents\s*\(\s*\{[\s\S]*\}\s*\)\s*;?\s*$/.test(str)
      ) {
        this.$message({
          type: "warning",
          message: webCpu.messages[lang].agentCodeError,
        });
        return;
      }
      try {
        window.transweb_agents = callback;
        eval(str);
      } catch (e) {
        this.$message({
          type: "warning",
          message: webCpu.messages[lang].agentCodeError,
        });
      }
    },
    handleScriptChange(e) {
      var _self = this;
      let file = e.target.files[0];
      let reader = new FileReader();
      if (file.size > this.limit) {
        this.$message({
          type: "warning",
          message: `修改失败，文件大小超过上限(${this.limit}b)。`,
        });
        return false;
      }
      reader.readAsText(file);
      reader.onload = function (event) {
        event.target.value = "";
        _self.$refs.fileNameItem.innerHTML = file.name;
        // _self.valueMap["localScript"] = event.target.result;
        _self.strToAgents(event.target.result, (tData) => {
          let tArr = tData.agentList || tData;
          _self.updateAgentList(tArr);
          _self.listMap[_self.type] = tArr;
          _self.currentList = tArr;
        });
      };
    },
  },
};
</script>
