<template>
  <div class="introduceInfoArea">
    <div :style="{paddingTop: paddingTop}" ref="basicInfoContainer" class="basicInfoArea">
      <h1 v-html="title"></h1>
      <h3 v-if="!!secondary" v-html="secondary"></h3>
      <div class="buttonOptionArea"><el-button @click="handleClickButton" type="primary">免费使用</el-button></div>
      <div class="featureItems">
        <el-row :gutter="10">
          <slot v-for="item in features">
            <el-col :span="24 / featureSize">
              <div class="grid-content ep-bg-purple" v-html="item.label"></div>
            </el-col>
          </slot>
        </el-row>
      </div>
    </div>
    <div class="featuresInfoArea">
      
    </div>
    <div class="bottomInfoArea">
      <p>Copyright ©2022-2023 <a href="https://beian.miit.gov.cn/" target="blank">互联网ICP备案：京ICP备17026815号-1</a></p> 
    </div>
  </div>
</template>

<script>
export default {
  data() {
    var size = WebTool.adjustSize([3, 3, 1]);
    var span = WebTool.adjustSize([0, 0, 24]);
    // var height = WebTool.adjustSize([370, 300, 300]);
    return {
      title: "低代码编程，在线生成软件",
      secondary: "<span class='highlightItem'>封装</span>界面模板和功能插件，自由<span class='highlightItem'>组装</span>成软件界面",
      featureSize: size,
      span: span,
      proxyFile: "",
      paddingTop: "30px",
      features: [
        {
          label: "更灵活的功能<span class='highlightItem'>拓展</span>",
        },
        {
          label: "更高的代码<span class='highlightItem'>复用率</span>",
        },
        {
          label: "更友好的<span class='highlightItem'>二次开发</span>",
        },
      ],
    };
  },
  mounted() {
    // this.appMap = this.appMap || {};
    this.initContent();
  },
  methods: {
    initContent() {
      this.$nextTick(() => {
        let elem = this.$refs.basicInfoContainer;
        let h = elem.clientHeight;
        this.paddingTop = (h - 110)*1/3 + "px";
      });
    },
    updateData(data) {},
    handleClickButton() {

    }
  },
};
</script>

<style scoped>
.introduceInfoArea {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: auto;
}

.basicInfoArea {
  text-align: center;
  /* background: url(assets/puzzle.jpg) no-repeat; */
  background-size: 100% 100%;
  padding: 80px 0px;
  min-height: calc( 100% - 35px );
}

.basicInfoArea h1 {
  font-size: 38px;
  letter-spacing: 0.1em;
  font-weight: 900;
}

.basicInfoArea h3 {
  margin-top: 25px;
  font-size: 23px;
  font-weight: normal;
}

.featuresInfoArea {
  position: relative;
  width: 100%;
  height: auto;
}

.featureItems {
  position: relative;
  max-width: 800px;
  margin: auto;
  margin-top: 50px;
  text-align: center;
  font-size: 18px;
}

.buttonOptionArea {
  padding: 20px 0px;
  margin-top: 20px;
}
.buttonOptionArea .el-button {
  width: 240px;
  transform: scale(1.2);
}
.sectionItemArea {
  position: relative;
  margin: auto;
  margin-top: 80px;
  width: 100%;
  padding: 0px 30px;
  height: 380px;
  text-align: center;
}

.sectionItemArea:nth-child(1) {
  margin-top: 80px !important;
}

.sectionItemArea .sectionTitle {
  width: 100%;
  position: relative;
  float: left;
  text-align: left;
  color: #409eff;
}

.sectionItemArea .sectionTitle:before {
  content: "";
  display: inline-block;
  height: 13px;
  /* border-left: solid 3px #409eff; */
  margin-right: 0px;
  margin-top: 0px;
}

.sectionDescription {
  width: 100%;
  position: relative;
  float: left;  
  text-align: left;
}

.sparePartList {
  position: relative;
  width: 100%;
  height: calc(100% - 40px);
}

.sparePartList .el-row,
.sparePartList .el-col,
.sparePartList .el-col > div {
  height: 100%;
}

.highlightItem {
  font-weight: 900;
  display: inline-block;
  margin: 0px 5px;
  border-bottom: solid 1px #333;
}

.sparePartList > .el-row,
.sparePartList > .el-row > .el-col {
  background-color: #fff;
}

.featureItems .el-row {
  width: 100%;
}

.bottomInfoArea {
  display: block;
  position: relative;
  float: left;
  width: 100%;
  text-align: center;
  padding: 5px;
  font-size: 14px;
}

.bottomInfoArea p {
  text-align: center;
  margin-bottom: 0px;
  color: #aaa;
}

.bottomInfoArea p>a {
  color: #aaa !important;
}

.bottomInfoArea .el-col:nth-child(2)>p{
  text-align: left;
}

</style>
