<template>
  <div class="configExportImage">
    <div ref="settingAppItem" class="settingOptionArea"></div>
    <div v-if="contentTemplate" ref="appItem" class="appPreviewArea">
      <div
        class="contentCardArea"
        :style="{
          transform: 'scale(' + radio + ')',
          transformOrigin: '0 0',
          height: 100 / radio + '%',
        }"
      >
        <div
          class="contentInfoArea"
          ref="contentCardItem"
          :qrSwitch="current.qrSwitch"
          :style="exportAreaStyle"
          v-html="contentTemplate"
        ></div>
      </div>
    </div>
    <div v-else ref="appItem" class="appPreviewArea"></div>
  </div>
</template>

<style scoped>
.configExportImage {
  position: relative;
  width: 100%;
  height: 100%;
  padding-right: 0px;
  padding-left: 360px;
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

.contentCardArea {
  position: relative;
  width: 1600px;
  height: 100%;
  overflow: auto;
}

.contentInfoArea {
  position: relative;
  width: 1200px;
  height: auto;
  margin-left: calc(50% - 600px);
  float: left;
}

.settingOptionArea {
  position: absolute;
  left: 0px;
  width: 330px;
  height: 100%;
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

.contentInfoArea[qrSwitch="false"] img:last-child {
  display: none !important;
}

.contentInfoArea[qrSwitch="false"] img:nth-last-child(2) {
  margin-bottom: 0px !important;
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
        backgroundColor: "#DEDED0",
        paddingTop: 60,
        paddingRight: 60,
        paddingBottom: 20,
        paddingLeft: 60,
        cards: [],
        qrSwitch: true,
      },
      defaultParams: {
        backgroundImage: null,
        backgroundColor: "#DEDED0",
        paddingTop: 60,
        paddingRight: 60,
        paddingBottom: 20,
        paddingLeft: 60,
        cards: [],
        qrSwitch: true,
      },
      tempStyle: {
        backgroundSize: "auto",
        backgroundPosition: "center",
      },
      contentTemplate: "",
      radio: 1,
      settingApp: {
        url: "/plugins/elementVueItem/pageCard.vue",
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
              cards: {
                type: "select",
                options: [],
                multiple: true,
                valueStyle: {
                  float: "right",
                  display: "inline-block",
                  float: "right",
                },
              },
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
              qrSwitch: {
                type: "switch",
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
              cards: {
                style: {
                  display: "inline-block",
                  width: "100%",
                  padding: "10px 0px",
                },
              },
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
              qrSwitch: {
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
                prop: "cards",
                label: webCpu.messages[lang].selectCard,
                type: "text",
              },
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
              {
                prop: "qrSwitch",
                label: webCpu.messages[lang].qrSwitch,
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
          type: "primary",
          label: webCpu.messages[lang].exportMenu,
        },
      ],
      foreign:
        location.host === "transweb.ai" ||
        WebTool.urlQuery(location.href, "foreign"),
    };
  },
  computed: {
    exportAreaStyle() {
      let style = JSON.parse(JSON.stringify(this._defaultParams));
      style = webCpu.attachAttribute(this.current, style);
      style = this.paramsToStyle(style);
      return style;
    },
  },
  mounted() {
    this.initSettingApp(this.current);
    this.initAppItem();
    this.$nextTick(() => {
      this.radio = 1;
      let cardElem = this.$refs.appItem;
      if (cardElem) {
        this.radio = (cardElem.clientWidth - 60) / 1600;
      }
    });
  },
  methods: {
    handleClickBtn(param) {
      if (param.label === webCpu.messages[lang].exportMenu) {
        this.confirmExportImage(true);
      } else if (param.label === webCpu.messages[lang].confirmInitialize) {
        this.current = JSON.parse(JSON.stringify(this._defaultParams));
      } else {
        this.current = JSON.parse(JSON.stringify(this.defaultParams));
      }
    },
    updateImageStatus() {
      let vueItem = this.settingApp.card.task.vueItem;
      let cards = vueItem.info.cards;
      let imageSelector = $(this.$refs.contentCardItem).find("img");
      if (cards.length !== 0) {
        imageSelector.hide();
      } else {
        imageSelector.show();
      }
      for (let i = 0; i < cards.length; i++) {
        imageSelector.eq(cards[i] - 1).show();
      }
    },
    confirmExportImage() {
      this.hideBottom = false;
      this.$nextTick(() => {
        let div = this.$refs.contentCardItem;
        let _self = this;
        html2canvas(div).then((canvas) => {
          const iData = canvas.toDataURL("image/png");
          // 创建一个临时的a标签
          const link = document.createElement("a");
          link.href = iData;
          link.download = _self.name; // 设置下载的文件名
          // 模拟点击下载
          link.click();
          this.$message({
            type: "success",
            message: webCpu.messages[lang].exportSuccessTips,
          });
        });
      });
    },
    confirmExportZip() {
      let images = [];
      let vueItem = this.settingApp.card.task.vueItem;
      let cards = vueItem.info.cards;
      let imageSelector = $(this.$refs.contentCardItem).find("img");
      if (cards.length === 0) {
        let arr = imageSelector;
        for (let i = 0; i < arr.length - 1; i++) {
          cards.push(i + 1);
        }
      }

      for (let i = 0; i < cards.length; i++) {
        images.push(imageSelector.eq(cards[i] - 1)[0]);
      }
      this.downloadMultiFiles(images);
    },
    downloadMultiFiles(images, name, arr) {
      const zip = new JSZip();
      arr =
        arr ||
        this.fragments.map((item) => {
          return item.content.title;
        });
      let _self = this;
      let blobs = images.map((item) => {
        let blob = _self.dataURLToBlob(item.src);
        return blob;
      });
      blobs.forEach(async (blob, index) => {
        zip.file(`[${index + 1}]${arr[index]}.png`, blob); // 无损添加文件
      });
      zip.generateAsync({ type: "blob" }).then((content) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = (name || this.fragments[0].content.title) + ".zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href); // 释放内存
      });
    },
    dataURLToBlob(dataURL) {
      const arr = dataURL.split(",");
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    },
    initSettingApp() {
      let tParam = localStorage.getItem("exportImageParams");
      if (tParam) {
        try {
          this.current = JSON.parse(tParam) || {};
        } catch (e) {}
      }
      let elem = this.$refs.settingAppItem;
      let app = this.settingApp;
      let imageContainer = this.$refs.contentCardItem;
      app.dsl.data.editorMap.cards.options = [];
      let arr = imageContainer.children;
      for (let i = 0; i < arr.length - 1; i++) {
        app.dsl.data.editorMap.cards.options.push(i + 1);
      }

      app.dsl.data.optionMap.cards.hidden = arr.length === 2;

      let _self = this;
      tParams = JSON.parse(JSON.stringify(this.defaultParams));
      webCpu.attachAttribute(this.current, tParams);
      this.defaultParams = JSON.parse(JSON.stringify(tParams));
      webCpu.attachAttribute(tParams, app.dsl.data.info);
      // 默认显示二维码
      // app.dsl.data.info.qrSwitch = true;
      this.current = app.dsl.data.info;
      app.dsl.methods.dealChangeEvent = function (d, config) {
        _self.current = d;
        if (config.prop === "cards") {
          _self.updateImageStatus();
        }
        let tData = JSON.parse(JSON.stringify(d));
        tData.cards = [];
        localStorage.setItem("exportImageParams", JSON.stringify(tData));
      };
      this.current = app.dsl.data.info;
      webCpu.updateView(elem, app);
    },
    paramsToStyle(params) {
      let style = JSON.parse(JSON.stringify(params));
      if (typeof style.backgroundImage === "string") {
        if (style.backgroundImage !== "") {
          style.backgroundImage = `url(${style.backgroundImage})`;
          style.backgroundPosition = "center";
        } else {
          style.backgroundImage = "none";
        }
      } else {
        style.backgroundImage = "none";
      }
      if (style.paddingTop !== undefined) {
        style.paddingTop += "px";
      }
      if (style.paddingLeft !== undefined) {
        style.paddingLeft += "px";
      }
      if (style.paddingBottom !== undefined) {
        style.paddingBottom += "px";
      }
      if (style.paddingRight !== undefined) {
        style.paddingRight += "px";
      }
      return style;
    },
    initAppItem() {
      let elem = this.$refs.appItem;
      let app = this.app;
      if (!app) {
        return false;
      }
      let style = this.paramsToStyle(this.current);

      app.dsl.data.style = style;
      if (this.app) {
        webCpu.updateView(elem, app);
      }
    },
  },
};
</script>
