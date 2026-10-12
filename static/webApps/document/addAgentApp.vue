<template>
  <div class="addDocumentArea">
    <span class="inputItem radioGroupInput">
      <el-radio-group
        @change="handleChangeRadio"
        v-model="type"
      >
        <el-radio-button
          v-for="(item, index) in typeList"
          :key="index"
          :label="item"
          :value="item"
          >{{ $t(item) }}</el-radio-button
        >
      </el-radio-group>
    </span>
    <span class="inputItem textGroupInput">
      <div class="input-group" v-if="type === 'documentItem'">
        <input
          type="text"
          class="form-control"
          :value="valueMap[type]"
          @change.native="handleInputChange"
          :placeholder="$t('documentItemTips')"
          :aria-label="$t('documentItemTips')"
          aria-describedby="button-addon2"
        />
        <div class="input-group-append">
          <button
            @click="confirmAddDocument()"
            class="btn btn-primary"
            type="button"
            id="button-addon2"
          >
            {{ $t("confirmYes") }}
          </button>
        </div>
      </div>

      <div class="input-group" v-else-if="type === 'agentItem'">
        <input
          type="text"
          class="form-control"
          :value="valueMap[type]"
          @change.native="handleInputChange"
          :placeholder="$t('agentItemTips')"
          :aria-label="$t('agentItemTips')"
          aria-describedby="button-addon2"
        />
        <input
          type="text"
          :value="extraMap[type]"
          :placeholder="$t('agentItemTips1')"
          :aria-label="$t('agentItemTips1')"
          aria-describedby="button-addon2"
          @change.native="handleExtraChange"
          class="form-control"
        />
        <div class="input-group-append">
          <button
            @click="confirmAddDocument()"
            class="btn btn-primary"
            type="button"
            id="button-addon2"
          >
            {{ $t("confirmYes") }}
          </button>
        </div>
      </div>
    </span>
    <div ref="resultInfoView" class="documentViewerArea">
      <el-icon :size="320" v-if="!valueMap[type] && type === 'agentItem'"
        ><svg
          t="1733721361445"
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="6934"
          width="200"
          height="200"
        >
          <path
            d="M746.62 799.85H277.38c-31.71 0-57.51-25.19-57.51-56.16v-371.5c0-30.97 25.8-56.16 57.51-56.16h469.24c31.71 0 57.51 25.19 57.51 56.16v371.5c0 30.97-25.8 56.16-57.51 56.16zM277.38 357.54c-8.82 0-15.99 6.57-15.99 14.65v371.5c0 8.08 7.18 14.65 15.99 14.65h469.24c8.82 0 15.99-6.57 15.99-14.65v-371.5c0-8.08-7.18-14.65-15.99-14.65H277.38z"
            fill="#8a8a8a"
            p-id="6935"
          ></path>
          <path
            d="M618.43 687.31H405.57c-11.47 0-20.76-9.3-20.76-20.76s9.29-20.76 20.76-20.76h212.85c11.47 0 20.76 9.3 20.76 20.76s-9.29 20.76-20.75 20.76zM638.38 435.96c27.43 0 49.67 22.24 49.67 49.67 0 27.43-22.24 49.66-49.67 49.66s-49.67-22.23-49.67-49.66c0-27.43 22.24-49.67 49.67-49.67zM385.63 435.96c27.43 0 49.66 22.24 49.66 49.67 0 27.43-22.23 49.66-49.66 49.66-27.43 0-49.67-22.23-49.67-49.66 0-27.43 22.24-49.67 49.67-49.67zM512 179.89c22.04 0 39.9 17.87 39.9 39.9 0 22.04-17.86 39.9-39.9 39.9s-39.9-17.86-39.9-39.9c0-22.03 17.86-39.9 39.9-39.9z"
            fill="#8a8a8a"
            p-id="6936"
          ></path>
          <path
            d="M512 347.55c-11.47 0-20.76-9.3-20.76-20.76v-69.18c0-11.46 9.29-20.76 20.76-20.76s20.76 9.3 20.76 20.76v69.18c0 11.46-9.29 20.76-20.76 20.76zM164.47 677.24c-11.47 0-20.76-9.3-20.76-20.76V472.01c0-11.46 9.29-20.76 20.76-20.76s20.76 9.3 20.76 20.76v184.47c-0.01 11.46-9.3 20.76-20.76 20.76zM859.53 677.24c-11.47 0-20.76-9.3-20.76-20.76V472.01c0-11.46 9.29-20.76 20.76-20.76 11.47 0 20.76 9.3 20.76 20.76v184.47c0 11.46-9.29 20.76-20.76 20.76z"
            fill="#8a8a8a"
            p-id="6937"
          ></path>
        </svg>
      </el-icon>
      <el-icon
        :size="240"
        v-else-if="!valueMap[type] && type === 'documentItem'"
        ><Document
      /></el-icon>
      <slot v-else>
        <iframe
          style="width: 100%; height: 100%; border: none"
          :src="currentUrl"
        ></iframe>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.addDocumentArea {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 5px;
}

.addDocumentArea .inputItem {
  
  display: inline-block;
}

.addDocumentArea .radioGroupInput {
  float: left;
  width: 180px;
}

.addDocumentArea .textGroupInput {
  float: right;
  width: calc(100% - 200px);
}
.addDocumentArea .el-radio-button__original-radio:checked+.el-radio-button__inner {
  background-color: #999 !important;
  color: #fff !important;
  border-color: #999 !important;
}

.documentViewerArea {
  position: relative;
  float: left;
  display: flex;
  align-content: center;
  align-items: center;
  justify-content: center;
  color: #999;
  width: 100%;
  text-align: center;
  margin-top: 10px;
  height: calc(100% - 40px);
}

.documentViewerArea iframe,
.documentViewerArea video {
  width: 100% !important;
  height: 100% !important;
  border: none;
}
</style>

<script>
export default {
  data() {
    return {
      typeList: ["agentItem", "documentItem"],
      urlMap: {
        documentItem: "",
        agentItem: "",
      },
      extraMap: {
        documentItem: "",
        agentItem: "",
      },
      valueMap: {
        documentItem: "",
        agentItem: "",
      },
      type: "agentItem",
      params: {
        fromAccount: "",
        rootAccount: ""
      },
      file: null,
      userInfo: {},
      dataUrl: "",
      promptContext: "",
      foreign:
        location.host === "transweb.ai" ||
        WebTool.urlQuery(location.href, "foreign"),
    };
  },
  computed: {
    currentUrl() {
      let param = {
        agent: this.valueMap[this.type],
        appName: this.extraMap[this.type],
        iframeEnable: true,
      };
      if (this.type === "documentItem") {
        param = {
          id: this.valueMap[this.type],
          iframeEnable: true,
          editMode: true,
        };
      }
      webCpu.attachAttribute(this.params, param);
      let url = WebTool.attachParams(location.origin, param);
      return url;
    },
  },
  mounted() {
    localStorage.currentPromptContent = this.promptContext;
  },
  methods: {
    handleChangeRadio(v) {
      this.dataUrl = this.urlMap[this.type];
      console.log("radio change", v, this.type);
    },
    confirmAddDocument() {
      this.dataUrl = this.valueMap[this.type];
      if (!this.dataUrl) {
        this.$message({
          type: "warning",
          message: webCpu.messages[lang].invalidVideoTips,
        });
        return false;
      }
      let tIframe = $(this.$refs.resultInfoView).find("iframe");
      let url = tIframe[0].contentWindow.location.href;
      this.$nextTick(() => {
        webCpu.mitt.emit("addVideoItem", {
          value: this.valueMap[this.type],
          type: this.type,
          dataUrl: url,
        });
      });
    },
    handleInputChange(e) {
      this.valueMap[this.type] = e.target.value;
    },
    handleExtraChange(e) {
      this.extraMap[this.type] = e.target.value;
    },
  },
};
</script>
