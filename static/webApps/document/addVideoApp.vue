<template>
  <div class="addImageArea">
    <el-radio-group
      style="margin-bottom: 10px"
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
    <div class="input-group" v-if="type === 'iframeVideo'">
      <input
        type="text"
        class="form-control"
        :value="valueMap[type]"
        @change.native="handleInputChange"
        :placeholder="$t('iframeVideoTips')"
        :aria-label="$t('iframeVideoTips')"
        aria-describedby="button-addon2"
      />
      <div class="input-group-append">
        <button
          @click="confirmAddVideo()"
          class="btn btn-primary"
          type="button"
          id="button-addon2"
        >
          {{ $t("confirmYes") }}
        </button>
      </div>
    </div>

    <div class="input-group" v-else-if="type === 'urlVideo'">
      <input
        type="text"
        class="form-control"
        :value="valueMap[type]"
        @change.native="handleInputChange"
        :placeholder="$t('urlVideoTips')"
        :aria-label="$t('urlVideoTips')"
        aria-describedby="button-addon2"
      />
      <div class="input-group-append">
        <button
          @click="confirmAddVideo()"
          class="btn btn-primary"
          type="button"
          id="button-addon2"
        >
          {{ $t("confirmYes") }}
        </button>
      </div>
    </div>
    <div ref="resultInfoView" class="imageViewerArea">
      <el-icon :size="320" v-if="!valueMap[type]"><Film /></el-icon>
      <slot v-else>
        <iframe style="width: 100%; height: 100%; border: none;" v-if="type === 'urlVideo'" :src="valueMap[type]"></iframe>
        <span class="iframeCodeSpan" style="width: 100%; height: 100%; display: inline-block;" v-else v-html="valueMap[type]"></span>
      </slot>
    </div>
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
  display: flex;
  align-content: center;
  align-items: center;
  justify-content: center;
  color: #999;
  width: 100%;
  text-align: center;
  margin-top: 10px;
  height: calc(100% - 80px);
}

.imageViewerArea iframe,
.imageViewerArea video {
  width: 100% !important;
  height: 100% !important;
  border: none;
}

.el-radio-button__original-radio:checked+.el-radio-button__inner {
  background-color: #999 !important;
  color: #fff !important;
  border-color: #999 !important;
}

.iframeCodeSpan iframe {
  position: relative;
  width: 100% !important;
  height: 100% !important;
}

</style>

<script>
export default {
  data() {
    return {
      typeList: ["iframeVideo", "urlVideo"],
      defaultImage: "",
      urlMap: {
        iframeVideo: "",
        urlVideo: "",
      },
      valueMap: {
        iframeVideo: "",
        urlVideo: "",
      },
      type: "iframeVideo",
      file: null,
      userInfo: {},
      dataUrl: "",
      promptContext: "",
      interface: {
        aiGenerateImage: {
          url: "/gpt/aiGatewayRequest",
          method: "post",
          query: {
            apiName: "智谱-ppt-image",
            content: "",
          },
        },
        imageToBase64: {
          url: "/user/imageToBase64",
          method: "get",
        },
        getUserInfo: {
          url: "/user/getLoginInfo",
          method: "get",
          dataType: "json",
        },
      },
      foreign:
        location.host === "transweb.ai" ||
        WebTool.urlQuery(location.href, "foreign"),
    };
  },
  computed: {},
  mounted() {
    this.initAdapter();
  },
  methods: {
    handleChangeRadio(v) {
      this.dataUrl = this.urlMap[this.type];
      console.log("radio change", v, this.type);
    },
    initAdapter() {
      var config = this.interface || {};
      this.adapter = webCpu.initAdapter(config);
      return this.adapter;
    },
    confirmAddVideo() {
      this.dataUrl = this.valueMap[this.type];
      if (!this.dataUrl) {
        this.$message({
          type: "warning",
          message: webCpu.messages[lang].invalidVideoTips,
        });
        return false;
      }
      let url = this.dataUrl;
      if (this.type === "iframeVideo") {
        url = $(this.$refs.resultInfoView).find("iframe").attr("src");
      }
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
  },
};
</script>
