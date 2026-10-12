<template>
  <div class="addImageArea">
    <el-radio-group
      style="margin-bottom: 10px; margin-left: 10px"
      @change="handleChangeRadio"
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
    <div
      style="margin-left: 10px"
      class="input-group"
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
          class="btn btn-outline-primary loadScriptBtn"
          ref="loadScriptBtn"
          type="button"
        >
          {{ $t("loadScript") }}
        </button>
        <button
          @click="confirmLoadScript()"
          class="btn btn-primary confirmScriptBtn"
          type="button"
          id="button-addon2"
        >
          {{ $t("confirmYes") }}
        </button>
      </div>
    </div>
    <div
      style="margin-left: 10px"
      class="input-group"
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
      <div class="input-group-append">
        <button
          class="btn btn-primary"
          type="button"
          @click="confirmLoadScript()"
          id="inputGroupFileAddon04"
        >
          {{ $t("confirmYes") }}
        </button>
      </div>
    </div>
    <div class="imageViewerArea" ref="agentListItem"></div>
  </div>
</template>

<style scoped>
.addImageArea {
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
  padding: 5px;
  overflow: auto;
}

.imageViewerArea .el-image {
  width: 100%;
  height: 100%;
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
      typeList: ["localScript", "webScript"],
      defaultImage: "",
      listMap: {
        webScript: "",
        localScript: "",
      },
      limit: 10 * 1024 * 1024,
      valueMap: {
        webScript: "",
        localScript: "",
      },
      supoportCustom: true,
      type: "localScript",
      file: null,
      publishInfo: {},
      agentListApp: {
        label: webCpu.messages[lang].agentList,
        url: webCpu.documentPrefix + "/plugins/elementVueItem/infoCardList.vue",
        className: "ElementVueItem",
        dsl: {
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
            span: WebTool.adjustSize([false, false, true]) ? 24 : 12,
            cardStyle: {
              border: "solid 1px #f3f3f3",
              background: "#f8f8f8",
              padding: "15px 20px",
              marginBottom: "10px",
              cursor: "pointer",
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
      },
      foreign:
        location.host === "transweb.ai" ||
        WebTool.urlQuery(location.href, "foreign"),
    };
  },
  computed: {},
  mounted() {
    this.updateAgentList();
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
    updateAgentList(arr) {
      let app = this.agentListApp;
      app.dsl.data.info = arr || [];
      let elem = this.$refs.agentListItem;
      webCpu.updateView(elem, app);
    },
    _confirmLoadScript(callback) {
      if (!this.currentList || this.currentList.length === 0) {
        this.$message({
          type: "warning",
          message: webCpu.messages[lang].invalidScriptTips,
        });
        return false;
      } else {
        let param = {};
        let agentString = WebTool.objectToString(this.currentList, true);
        if (lang === "zh") {
          param.agentList_zh = agentString;
        } else {
          param.agentList_en = agentString;
        }

        let tCard = webCpu.cards.documentEditor;
        if (tCard && tCard.task && tCard.task.childCard) {
          webCpu.CardItem.dismissMask(tCard.task.childCard);
          webCpu.CardItem.switchState(tCard.task.childCard, "loading");
        }

        webCpu.adapter.updateLoginInfo(
          {
            condition: {
              folderName: localStorage.folderName,
            },
            set: param,
          },
          function (d) {
            if (tCard) {
              tCard.task.vueItem.openPersonDialog();
            }
            if (typeof callback === "function") {
              callback(d);
            }
          }
        );
      }
    },
    confirmLoadScript(callback) {
      let info = webCpu.cards.aboutInfoCard.task.vueItem.info;
      if (info.agentList && info.agentList.length !== 0) {
        this.$confirm(
          webCpu.messages[lang].confirmLoadScript,
          webCpu.messages[lang].confirmDialogTitle,
          {
            confirmButtonText: webCpu.messages[lang].confirmYes,
            cancelButtonText: webCpu.messages[lang].confirmNo,
            type: "danger",
          }
        ).then(() => {
          this.backupOlder();
          this._confirmLoadScript(callback);
        });
      } else {
        this._confirmLoadScript(callback);
      }
    },
    backupOlder() {
      let info = webCpu.cards.aboutInfoCard.task.vueItem.info;
      let str = `transweb_agents({ agentList: ${WebTool.objectToString(
        info.agentList
      )}})`;
      let name = "bak." + (info.name || "未命名") + ".agentScript.js";
      WebTool.downloadString(str, name, "text/plain");
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
