<template>
  <div class="posterAppContent" ref="rootElem">
    <span class="titleSpanItem ellipsis_2">
      {{appName}}
    </span>
    <span class="secondarySpanItem">
      {{contentTitle}}
    </span>
    <span class="scanTipsItem">{{scanTips}}</span>
    <el-image ref="imageItem" :src="bgUrl"></el-image>
    <div class="contentInfoArea" ref="mainContentItem"></div>
  </div>
</template>
<script>
  export default {
    style: {
      width: 900,
      height: 900
    },
    data() {
      return {
        contentTitle: "测试内容标题测试内容标题",
        appName: "Transweb-智能出题评测",
        scanTips: '扫一扫打开',
        url: "",
        bgUrl: "https://transweb-1254183942.cos.ap-beijing.myqcloud.com/images/lightPPT/contentPoster.png",
        infoCard: {
          "url": "/plugins/elementVueItem/pageCard.vue",
          cardName: "aboutInfoCard",
          dsl: {
            data: {
              cardStyle: {
                backgroundColor: "transparent",
              },
              optionMap: {
                url: {
                  style: {
                    position: "absolute",
                    bottom: "10px",
                    left: "275px",
                    zIndex: 5,
                  },
                  valueStyle: {
                    width: "340px",
                    height: "340px",
                    padding: "20px",
                    backgroundColor: "#fff"
                  }
                }
              },
              info: {
                url: "https://transweb.cn"
              },
              config: [{
                prop: "buttonItem",
                type: "button"
              }, {
                prop: "url",
                type: "qrCode"
              }]
            }
          }
        },
      };
    },
    mounted() {
      this.initInfoCard();
      this.getBgBase64();
    },
    methods: {
      getBgBase64() {
        $.get("/user/imageToBase64?url=" + this.bgUrl, (t) => {
          this.bgUrl = t.data;
        })
      },
      exportImage() {
        let tElem = this._parent.container;
        this.hiddenItem = true;
        this.$nextTick(() => {
          WebTool.transformImage(tElem, this.appName);
        });
      },
      initInfoCard() {
        let app = this.infoCard;
        app.dsl.data.info.url = this.url || location.origin;
        let elem = this.$refs.mainContentItem;
        webCpu.updateView(elem, app);
      },
    },
  };
</script>

<style scoped>
  .posterAppContent {
    position: relative;
    float: left;
    width: 100%;
    height: 100%;
    background-position: right bottom;
    background-repeat: no-repeat;
    color: #2f2a76;
    text-align: center;
  }

  .posterAppContent>.el-image {
    position: absolute;
    z-index: 1;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
  }

  .titleSpanItem {
    float: left;
    display: inline-block;
    text-align: center;
    width: 100%;
    color: #fff;
    padding: 20px 30px;
    font-size: 65px;
    line-height: 80px;
    z-index: 3;
    height: auto;
    border-radius: 10px;
    position: relative;
    margin-top: 85px;
  }

  .secondarySpanItem {
    display: inline-block;
    text-align: center;
    position: relative;
    width: 100%;
    float: left;
    text-align: center;
    color: #eee;
    font-size: 28px;
    z-index: 3;
  }

  .scanTipsItem {
    display: inline-block;
    width: 100%;
    bottom: 360px;
    left: 0px;
    position: absolute;
    text-align: center;
    font-size: 25px;
    z-index: 1000;
  }

  .posterAppContent .contentInfoArea {
    position: absolute;
    display: inline-block;
    background-size: cover;
    z-index: 1;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
  }
</style>