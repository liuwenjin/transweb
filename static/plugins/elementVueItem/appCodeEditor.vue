<template>
  <div class="codeEditorArea" ref="containerItem">
    <el-row :gutter="1">
      <el-col :span="leftSpan">
        <div class="contentItemArea" ref="editorItemArea"></div>
      </el-col>
      <el-col :span="rightSpan">
        <div class="contentItemArea" ref="appPreviewArea"></div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  beforeMount() {},
  data() {
    return {
      leftSpan: 12,
      rightSpan: 12,
      title: "",
      type: "",
      appDsl: {},
      appEditor: {
        url: "plugins/elementVueItem/pageCard.vue",
        className: "ElementVueItem",
        dsl: {
          data: {
            config: [
              {
                type: "text",
                prop: "title",
              },
              {
                type: "button",
                prop: "buttonItem",
              },
              {
                type: "plugin",
                prop: "appDsl",
              },
            ],
            optionMap: {
              title: {
                style: {
                  width: "calc( 100% - 120px )",
                  display: "inline-block",
                  color: "#bbb",
                },
              },
              buttonItem: {
                style: {
                  width: "auto",
                  display: "inline-block",
                  float: "right",
                  marginRight: "-5px",
                },
                content: [
                  {
                    label: "预览",
                    type: "primary",
                    textFlag: true,
                    style: {
                      width: "auto",
                    },
                  },
                ],
              },
              appDsl: {
                className: "CodeEditor",
                style: {
                  width: "100%",
                  height: "calc( 100% - 10px )",
                  display: "block",
                  overflow: "auto",
                },
                dsl: {
                  changeCallback: function (dd) {},
                  options: {
                    lineNumbers: true,
                    value: "",
                    mode: "javascript",
                  },
                },
              },
            },
            info: {
              title: "DSL编辑",
              appDsl: {},
            },
            cardStyle: {
              height: "100%",
              width: "100%",
              position: "relative",
              float: "left",
            },
          },
          promise: {
            mounted: function () {
              var _self = this;
              this.optionMap.appDsl.card.task.changeCallback = function (dd) {
                var app = dd;
                if (typeof dd === "string") {
                  app = eval(`(${dd})`);
                }
                _self.info.appDsl = app;
              };
            },
          },
          methods: {
            handleClickButton: function (dd, config) {},
          },
        },
      },
    };
  },
  mounted() {
    this.initEditor();
    this.adjustLayout();
  },
  methods: {
    adjustLayout() {
      var elem = this.$refs.containerItem;
      if (elem.clientWidth < 800) {
        this.leftSpan = 24;
        this.rightSpan = 0;
      }
    },
    updateData(dsl, title) {
      this.appEditor.dsl.data.info.appDsl = dsl || {};
      this.appEditor.dsl.data.info.title = title;
      var elem = this.$refs.editorItemArea;
      let pElem = this.$refs.appPreviewArea;
      var _self = this;
      this.appEditor.dsl.methods.handleClickButton = function () {
        let param = {
          appDsl: this.info.appDsl,
          callback: function (c) {
            webCpu.previewAppData(c, this.appDsl, _self.type || "appData");
          },
          closeType: "left",
        };
        // debugger
        if (pElem.clientWidth !== 0) {
          webCpu.previewAppData(pElem, param.appDsl, _self.type || "appData");
        } else {
          webCpu.CardItem.htmlDialog(this._parent.card, "预览效果", "", param, {
            width: "100%",
          });
        }
      };
      webCpu.updateView(elem, this.appEditor);
      if (pElem.clientWidth !== 0) {
        webCpu.previewAppData(pElem, dsl, this.type || "appData");
      }
    },
    initEditor() {
      var dsl = this.appDsl || {};
      var title = this.title || "DSL编辑";
      this.updateData(dsl, title);
    },
    getAppData() {
      return this.appEditor.dsl.data.info.appDsl;
    },
    previewAppItem() {
      this.appEditor.dsl.methods.handleClickButton();
    },
  },
};
</script>

<style scoped>
.codeEditorArea,
.contentItemArea {
  float: left;
  position: relative;
  width: 100%;
  height: 100%;
}
.codeEditorArea .el-row {
  height: 100%;
  width: 100%;
  position: relative;
  float: left;
}
.codeEditorArea .el-row .el-col {
  position: relative;
  height: 100%;
}
</style>
