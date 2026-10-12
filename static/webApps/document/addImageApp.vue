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
    <div class="input-group" v-if="type === 'aiImage'">
      <input
        type="text"
        class="form-control"
        @click.native="handleInputChange"
        @change.native="handleInputChange"
        :placeholder="$t('aiImageTips')"
        :aria-label="$t('aiImageTips')"
        aria-describedby="button-addon2"
      />
      <div class="input-group-append">
        <button
          @click="sendImageRequest"
          class="btn btn-outline-primary"
          type="button"
        >
          {{ $t("aiImageRequest") }}
        </button>
        <button
          @click="confirmAddImage()"
          class="btn btn-primary"
          type="button"
          id="button-addon2"
        >
          {{ $t("confirmYes") }}
        </button>
      </div>
    </div>
    <div class="input-group" v-else-if="type === 'webImage'">
      <input
        type="text"
        class="form-control"
        :value="valueMap['webImage']"
        @change.native="handleInputChange"
        :placeholder="$t('webImageTips')"
        :aria-label="$t('webImageTips')"
        aria-describedby="button-addon2"
      />
      <div class="input-group-append">
        <button
          @click="loadImageItem"
          class="btn btn-outline-primary"
          type="button"
        >
          {{ $t("loadImage") }}
        </button>
        <button
          @click="confirmAddImage()"
          class="btn btn-primary"
          type="button"
          id="button-addon2"
        >
          {{ $t("confirmYes") }}
        </button>
      </div>
    </div>
    <div class="input-group" v-else-if="type === 'localImage'">
      <div class="custom-file">
        <input
          type="file"
          @change.native="handleImageChange"
          :value="valueMap[type]"
          class="custom-file-input"
          accept="image/*"
          id="inputGroupFile04"
          aria-describedby="inputGroupFileAddon04"
        />
        <label
          ref="fileNameItem"
          class="custom-file-label text-primary"
          for="inputGroupFile04"
          >{{ $t("localImageTips") }}</label
        >
      </div>
      <div class="input-group-append">
        <button
          class="btn btn-primary"
          type="button"
          @click="confirmAddImage()"
          id="inputGroupFileAddon04"
        >
          {{ $t("confirmYes") }}
        </button>
      </div>
    </div>
    <div class="imageViewerArea">
      <el-image fit="contain" :src="urlMap[type]">
        <template #error>
          <div class="image-slot">
            <el-icon :size="200"><picture-rounded /></el-icon>
          </div>
        </template>
      </el-image>
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
  width: 100%;
  margin-top: 10px;
  height: calc(100% - 80px);
}

.el-radio-button__original-radio:checked+.el-radio-button__inner {
  background-color: #999 !important;
  color: #fff !important;
  border-color: #999 !important;
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
      typeList: ["aiImage", "webImage", "localImage"],
      defaultImage: "",
      urlMap: {
        aiImage: "",
        webImage: "",
        localImage: "",
      },
      valueMap: {
        aiImage: "",
        webImage: "",
        localImage: "",
      },
      type: "aiImage",
      file: null,
      publishInfo: {},
      userInfo: {},
      dataUrl: "",
      params: {
        fromAccount: "",
        rootAccount: ""
      },
      promptContext: "",
      interface: {
        aiGenerateImage: {
          url: "/gpt/aiGatewayRequest",
          method: "post",
          query: {
            apiName: "智谱-图片生成",
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
    confirmAddImage() {
      if (!this.dataUrl) {
        this.$message({
          type: "warning",
          message: webCpu.messages[lang].invalidImageTips,
        });
        return false;
      }
      webCpu.mitt.emit("addImageItem", {
        value: this.valueMap[this.type],
        type: this.type,
        dataUrl: this.dataUrl,
      });
    },
    sendImageRequest(e) {
      let btn = e.target;
      this.confirmCostTips(webCpu.messages[lang].aigcImageDialog, 1200, () => {
        this.aigcImage(btn, function () {});
      });
    },
    loadImageItem(e) {
      let url = this.valueMap["webImage"];
      if (!url) {
        this.$message({
          type: "warning",
          message: "URL" + webCpu.messages[lang].notEmptyTips,
        });
        return false;
      }
      let btn = e.target;
      $(btn).attr("disabled", true);
      $(btn).attr("title", webCpu.messages[lang].loadImageTips);
      $(btn).html(webCpu.messages[lang].loadImageTips);
      if (url.search("data:") === 0) {
        this.dataUrl = url;
        this.urlMap[this.type] = url;
        $(btn).attr("disabled", false);
        $(btn).attr("title", webCpu.messages[lang].loadImage);
        $(btn).html(webCpu.messages[lang].loadImage);
      } else {
        this.getBase64(url, function () {
          $(btn).attr("disabled", false);
          $(btn).attr("title", webCpu.messages[lang].loadImage);
          $(btn).html(webCpu.messages[lang].loadImage);
        });
      }
    },
    getBase64(url, callback) {
      let _self = this;
      _self.adapter.imageToBase64(
        {
          url: url,
        },
        (rData) => {
          if (rData.ret === 0) {
            _self.dataUrl = rData.data;
            _self.urlMap[_self.type] = _self.dataUrl;
          } else {
            _self.$message({
              type: "warning",
              message: webCpu.messages[lang].loadingImageFailed,
            });
          }
          if (typeof callback === "function") {
            callback();
          }
        }
      );
    },
    aigcImage(btn, callback) {
      let _self = this;
      let tQuery = _self.interface.aiGenerateImage.query;
      $(btn).attr("disabled", true);
      $(btn).attr("title", webCpu.messages[lang].aigcLoading);
      $(btn).html(webCpu.messages[lang].aigcLoading);
      tQuery.content = this.valueMap[this.type] || this.promptContext;
      tQuery.context = this.valueMap[this.type]
        ? ""
        : webCpu.messages[lang].imageDefaultPrompt;
        tQuery.agent = this.publishInfo.folderName;
        tQuery.fromAccount = this.params.fromAccount;
        tQuery.rootAccount = this.params.rootAccount;
        
      _self.adapter.aiGenerateImage(tQuery, function (tData) {
        if (tData.data && tData.data[0]) {
          _self.$message({
            type: "success",
            message: webCpu.messages[lang].aigcSuccess,
          });
          _self.getBase64(tData.data[0].url, (rData) => {
            $(btn).attr("disabled", false);
            $(btn).attr("title", webCpu.messages[lang].aiImageRequest);
            $(btn).html(webCpu.messages[lang].aiImageRequest);
            if (typeof callback === "function") {
              callback();
            }
          });
        } else {
          let tips = _self.foreign
            ? webCpu.messages[lang].subscriptionExpiredTips
            : webCpu.messages[lang].notEnoughPoints;
          _self.$message({
            type: "warning",
            message: tips,
          });
          $(btn).attr("disabled", false);
          $(btn).attr("title", webCpu.messages[lang].aiImageRequest);
          $(btn).html(webCpu.messages[lang].aiImageRequest);
          if (_self.foreign) {
            webCpu.mitt.emit("openPriceInfo");
          } else {
            webCpu.mitt.emit("rechargeAccount");
          }
        }
      });
    },
    confirmCostTips(name, value, callback, eCallback) {
      this.getUserInfo((data) => {
        if (!this.userInfo.vipTimeout) {
          callback(value);
          return false;
        }
        let money = value / 6000;
        if (lang === "en") {
          money *= 14;
        }
        let mag = `${name}${webCpu.messages[lang].costTips} ${value || 0} ${
          webCpu.messages[lang].costTips1
        }  ${money.toFixed(1)} ${webCpu.messages[lang].costTips2} `;

        this.$confirm(mag, webCpu.messages[lang].confirmDialogTitle, {
          confirmButtonText: webCpu.messages[lang].confirmYes,
          cancelButtonText: webCpu.messages[lang].confirmNo,
          type: "warning",
        }).then(() => {
          if (typeof callback === "function") {
            callback(value);
          }
        });
      });
    },
    getUserInfo(callback) {
      let _self = this;
      this.adapter.getUserInfo({}, function (tData) {
        if (tData.ret === 0) {
          _self.userInfo = tData.data;
        }
        if (typeof callback === "function") {
          callback(tData);
        }
      });
    },
    confirmAiImage(btn) {
      let _self = this;
      if (_self.foreign) {
        _self.aigcImage(btn, tContent, function () {
          _self.freshCrurrentSlider(tContent);
        });
      } else {
        _self.confirmCostTips(
          webCpu.messages[lang].aigcImageDialog,
          1200,
          () => {
            _self.aigcImage(btn, tContent, function () {
              _self.freshCrurrentSlider(tContent);
              webCpu.mitt.emit("pointsChange");
            });
          }
        );
      }
    },
    handleInputChange(e) {
      this.valueMap[this.type] = e.target.value;
    },
    handleImageChange(e) {
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
      reader.readAsDataURL(file);
      reader.onload = function (event) {
        e.target.value = "";
        _self.$refs.fileNameItem.innerHTML = file.name;
        _self.dataUrl = event.target.result;
        _self.urlMap["localImage"] = _self.dataUrl;
      };
    },
  },
};
</script>
