<template>
  <div class="mainLayoutArea" style="height: 100%;">
    <div class="topArea">
      <div class="contentArea">
        <span class="logoArea text-primary" @click="handleClickLogo()">Transweb</span>
        <div
          class="menuItemArea"
          component="CardItem"
        ></div>
        <span class="loginRegArea" component="CardItem"></span>
      </div>
    </div>
    <div class="mainArea" component="CardItem">...</div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      flag: WebTool.adjustSize([true, true, false]),
    };
  },
  methods: {
    handleClickLogo() {
      webCpu.router.push({
        path: "/home"
      })
    }
  }
};
</script>
<style>
.topArea {
  width: 100%;
  height: 60px;
  line-height: 60px;
  position: absolute;
  top: 0px;
  z-index: 3;
  display: inline-block;
  border-bottom: solid 1px #ddd;
  background: rgba(255, 255, 255, 1);
}
.contentArea {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0px 30px;
}
.logoArea {
  position: relative;
  float: left;
  display: inline-block;
  line-height: 60px;
  margin-right: 30px;
  height: 60px;
  font-weight: 600;
  font-size: 24px;
  cursor: pointer;
  text-shadow: 1px 1px 1px #333;
}

.logoArea::after {
  position: absolute;
  content: 'alpha version';
  display: inline-block;
  font-size: 10px;
  left: 0px;
  bottom: -17px;
  color: #ddd;
}

.menuItemArea {
  position: relative;
  float: left;
  width: calc(100% - 250px);
  display: inline-block;
  height: 100%;
}

.loginRegArea {
  position: relative;
  width: 100px;
  padding-right: 0px;
  margin-top: 15px;
  display: inline-block;
  height: 30px;
  line-height: 30px;
  text-align: right;
}

.mainArea {
  position: relative;
  width: 100%;
  padding-top: 60px;
  height: 100%;
  display: inline-block;
}



</style>