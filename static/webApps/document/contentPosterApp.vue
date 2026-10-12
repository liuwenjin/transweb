<template>
  <div class="posterAppContent" ref="rootElem">
    <span class="titleSpanItem ellipsis_2">{{contentTitle}}</span>
    <span class="secondarySpanItem flex justify-center gap-4 items-center">
      <img v-if="image" style="width: 100px; height: 100px; border-radius: 100%;" :src="image"/>
      <span :style="{display: 'inline-block', width: '90%', marginTop: '-15px', textAlign: image ? 'left': 'cener'}">
        <span class="authorSpanItem" :style="{fontSize: '45px', width: '100%'}">{{author}}</span>
        <span class="appNameItem" style="display: inline-block; height: 50px; line-height: 50px; width: 100%;" >({{appName}})</span>
      </span>
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
        contentTitle: "测试内容标题测试内容标题测试内容标题测试容标题测试内容标题测试",
        author: "刘文津",
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
                    top: "560px",
                    left: "275px",
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
    display: inline-block;
    text-align: center;
    width: calc(100% - 100px);
    color: #fff;
    padding: 20px 30px;
    font-size: 80px;
		height: auto;
    border-radius: 10px;
    position: absolute;
    top: 65px;
    left: 50px;
    z-index: 1000;
  }

  .secondarySpanItem {
    position: absolute;
    width: 100%;
    text-align: center;
    color: #eee;
    font-size: 35px;
    bottom: 460px;
    z-index: 1000;
  }

  .scanTipsItem {
    display: inline-block;
    width: 100%;
    bottom: 370px;
    position: absolute;
    text-align: center;
    font-size: 25px;
    z-index: 1000;
  }

  .avatarItem {
    position: absolute;
    display: inline-block;
    text-align: center;
    width: 100%;
    top: 20px;
    z-index: 3;
  }

  .posterAppContent .contentInfoArea {
    position: relative;
    display: inline-block;
    background-size: cover;
    z-index: 2;
    width: 100%;
    height: 100%;
  }
</style>