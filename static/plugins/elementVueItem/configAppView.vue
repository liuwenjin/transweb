<template>
  <div class="configAppView">
    <div ref="settingAppItem" class="settingOptionArea"></div>
    <div ref="appItem" class="appPreviewArea"></div>
    <div class="confirmSettingArea">
      <div class="buttonListArea">
        <el-button
          v-for="item in buttonList"
          :key="item.label"
          @click="handleClickBtn(item)"
          :type="item.type"
          >{{ item.label }}</el-button
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
.configAppView {
  position: relative;
  width: 100%;
  height: 100%;
  padding-right: 0px;
  padding-left: 360px;
  padding-bottom: 100px;
  background-color: #fff;
  border-top: solid 1px #f2f2f2;
}

.appPreviewArea {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #f2f2f2;
  padding: 15px;
}

.settingOptionArea {
  position: absolute;
  left: 0px;
  width: 330px;
  height: calc(100% - 120px);
  padding-top: 20px;
  overflow: auto;
  top: 0px;
  z-index: 0;
}

.confirmSettingArea {
  position: absolute;
  left: 0px;
  width: 100%;
  height: 100px;
}

.buttonListArea {
  position: relative;
  border-top: solid 1px #f2f2f2;
  width: 100%;
  height: 100px;
  padding: 10px 20px;
}
</style>

<script>
export default {
  data() {
    return {
      app: null,
      current: {},
      _defaultParams: {
        backgroundImage: null,
        backgroundColor: "",
        paddingTop: 40,
        paddingRight: 60,
        paddingBottom: 40,
        paddingLeft: 60,
      },
      defaultParams: {
        backgroundImage: null,
        backgroundColor: "",
        paddingTop: 40,
        paddingRight: 60,
        paddingBottom: 40,
        paddingLeft: 60,
      },
      tempStyle: {
        backgroundSize: "auto",
        backgroundPosition: "center",
      },
      settingApp: {
        url: webCpu.documentPrefix + "/plugins/elementVueItem/pageCard.vue",
        className: "ElementVueItem",
        cardName: "globalSettingCard",
        style: {
          padding: "0px 0px 10px 20px",
        },
        dsl: {
          data: {
            bodyStyle: {
              overflow: "auto",
            },
            mode: "edit",
            info: {
              backgroundImage: null,
              backgroundColor: "",
              color: "",
              paddingTop: "",
              paddingRight: "",
              paddingBottom: "",
              paddingLeft: "",
            },
            editorMap: {
              backgroundImage: {
                isImage: true,
                accept: "image/*",
                type: "file",
                valueStyle: {
                  transform: "scale(0.6)",
                  "transform-origin": "100% -55px",
                  display: "inline-block",
                  float: "right",
                  width: "calc( 100% + 28px )",
                },
              },
              color: {
                type: "colorPicker",
                valueStyle: {
                  float: "right",
                  display: "inline-block",
                  float: "right",
                },
              },
              backgroundColor: {
                type: "colorPicker",
                valueStyle: {
                  float: "right",
                  display: "inline-block",
                  float: "right",
                },
              },
              paddingTop: {
                type: "inputNumber",
                placeholder: "请输入内容上边距",
                valueStyle: {
                  display: "inline-block",
                  width: "calc( 100% -  90px )",
                  float: "right",
                },
              },
              paddingRight: {
                type: "inputNumber",
                placeholder: "请输入内容右边距",
                valueStyle: {
                  display: "inline-block",
                  width: "calc( 100% -  90px )",
                  float: "right",
                },
              },
              paddingBottom: {
                type: "inputNumber",
                placeholder: "请输入内容下边距",
                valueStyle: {
                  display: "inline-block",
                  width: "calc( 100% -  90px )",
                  float: "right",
                },
              },
              paddingLeft: {
                type: "inputNumber",
                placeholder: "请输入内容左边距",
                valueStyle: {
                  display: "inline-block",
                  width: "calc( 100% -  90px )",
                  float: "right",
                },
              },
            },
            optionMap: {
              backgroundImage: {
                style: {
                  display: "inline-block",
                  width: "100%",
                  padding: "10px 0px",
                },
              },
              backgroundColor: {
                style: {
                  display: "inline-block",
                  width: "100%",
                  padding: "10px 0px",
                  borderBottom: "solid 1px #f2f2f2",
                },
              },
              color: {
                style: {
                  display: "inline-block",
                  width: "100%",
                  padding: "10px 0px",
                  borderBottom: "solid 1px #f2f2f2",
                },
              },
              paddingTop: {
                style: {
                  display: "inline-block",
                  width: "100%",
                  padding: "10px 0px",
                  borderBottom: "solid 1px #f2f2f2",
                },
              },
              paddingRight: {
                style: {
                  display: "inline-block",
                  width: "100%",
                  padding: "10px 0px",
                  borderBottom: "solid 1px #f2f2f2",
                },
              },
              paddingBottom: {
                style: {
                  display: "inline-block",
                  width: "100%",
                  padding: "10px 0px",
                  borderBottom: "solid 1px #f2f2f2",
                },
              },
              paddingLeft: {
                style: {
                  display: "inline-block",
                  width: "100%",
                  padding: "10px 0px",
                  borderBottom: "solid 1px #f2f2f2",
                },
              },
            },
            config: [
              {
                prop: "backgroundImage",
                label: webCpu.messages[lang].backgroundImage,
                type: "text",
              },
              {
                prop: "backgroundColor",
                label: webCpu.messages[lang].backgroundColor,
                type: "text",
              },
              {
                prop: "color",
                label: webCpu.messages[lang].fontColor,
                type: "text",
              },
              {
                prop: "paddingTop",
                label: webCpu.messages[lang].paddingTop,
                type: "text",
              },
              {
                prop: "paddingRight",
                label: webCpu.messages[lang].paddingRight,
                type: "text",
              },
              {
                prop: "paddingBottom",
                label: webCpu.messages[lang].paddingBottom,
                type: "text",
              },
              {
                prop: "paddingLeft",
                label: webCpu.messages[lang].paddingLeft,
                type: "text",
              },
            ],
          },
          methods: {},
        },
      },
      buttonList: [
        {
          type: "",
          label: webCpu.messages[lang].confirmInitialize,
        },
        {
          type: "",
          label: webCpu.messages[lang].confirmReset,
        },
        {
          type: "success",
          label: webCpu.messages[lang].confirmPreview,
        },
        {
          type: "primary",
          label: webCpu.messages[lang].confirmYes,
        },
        {
          type: "warning",
          label: webCpu.messages[lang].confirmAll,
        },
      ],
      foreign:
        location.host === "transweb.ai" ||
        WebTool.urlQuery(location.href, "foreign"),
    };
  },
  computed: {},
  mounted() {
    this.initSettingApp(this.current);
    this.initAppItem();
  },
  methods: {
    handleClickBtn(param) {
      if (param.label === webCpu.messages[lang].confirmPreview) {
        this.initAppItem(true);
      } else if (param.label === webCpu.messages[lang].confirmYes) {
        webCpu.mitt.emit("confirmSetting", this.current);
      } else if (param.label === webCpu.messages[lang].confirmAll) {
        webCpu.mitt.emit("applyToAll", this.current);
      } else if (param.label === webCpu.messages[lang].confirmInitialize) {
        this.current = JSON.parse(JSON.stringify(this._defaultParams));
        this.initSettingApp(this.current);
        this.initAppItem();
      } else {
        this.current = JSON.parse(JSON.stringify(this.defaultParams));
        this.initSettingApp(this.current);
        this.initAppItem();
      }
    },
    initSettingApp(info) {
      let elem = this.$refs.settingAppItem;
      let app = this.settingApp;
      let _self = this;
      let tParams = JSON.parse(JSON.stringify(this.defaultParams));
      webCpu.attachAttribute(info, tParams);

      this.defaultParams = JSON.parse(JSON.stringify(tParams));

      webCpu.attachAttribute(tParams, app.dsl.data.info);
      app.dsl.methods.dealChangeEvent = function (d, config) {
        _self.current = d;
      };
      webCpu.updateView(elem, app);
    },
    initAppItem() {
      let elem = this.$refs.appItem;
      let app = this.app;
      let style = JSON.parse(JSON.stringify(this.current));
      if (typeof style.backgroundImage === "string") {
        if (style.backgroundImage !== "") {
          style.backgroundImage = `url(${style.backgroundImage})`;
          style.backgroundPosition = "center";
        } else {
          style.backgroundImage = "none";
        }

        // webCpu.attachAttribute(this.tempStyle, style);
        // style.backgroundColor = "transparent";
      } else {
        style.backgroundImage = "none";
      }
      style.paddingTop += "px";
      style.paddingLeft += "px";
      style.paddingBottom += "px";
      style.paddingRight += "px";
      app.dsl.data.style = style;
      if (this.app) {
        webCpu.updateView(elem, app);
      }
    },
  },
};
</script>
