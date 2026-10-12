<template>
  <div
    v-loading="loading"
    class="permissionsArea"
    ref="permissionsContainer"
    :flag="flag"
  >
    loading...
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      documentData: {},
      logined: localStorage.logined,
      flag: WebTool.adjustSize([false, false, true]),
      lang: lang,
      cardApp: {
        url: "/webApps/document/portfolio.vue",
        className: "ElementVueItem",
        dsl: {
          data: {
            title: "即将打开(点击下面的卡片):",
            documentList: [],
            condition: null,
          },
        },
        cardName: "portfolioCard",
      },
      interface: {
        getUserInfo: {
          url: "/user/getLoginInfo",
          method: "get",
          dataType: "json",
        },
        purchaseDocument: {
          url: "/user/purchaseDocument",
          method: "post",
        },
      },
    };
  },
  mounted() {
    this.initCardApp();
  },
  methods: {
    initCardApp() {
      this.cardApp.dsl.data.documentList = [this.documentData];
      this.cardApp.dsl.style = {
        width: 600,
        height: 200,
      };
      if (this.flag) {
        this.cardApp.dsl.style = {
          width: "100%",
          height: "200px",
        };
      }
      let elem = this.$refs.permissionsContainer;
      if (elem) {
        elem.innerHTML = "";
        webCpu.updateView(elem, this.cardApp);
      }
    },
    successCallback: function (res) {
      console.log(res);
    },
  },
};
</script>

<style scoped>
.permissionsArea {
  position: relative;
  float: left;
  width: 100%;
  height: 100%;
  padding: 15px 0px 0px 0px;
  overflow: auto;
}
</style>