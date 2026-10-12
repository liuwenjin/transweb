<template>
  <div class="desingEffectArea">
    <el-image
      class="icon"
      @click="goBack()"
      style="width: 40px; height: auto"
      src="https://transweb-1254183942.cos.ap-beijing.myqcloud.com/tidyMeApp/icons/back.webp"
    ></el-image>
    <el-image :src="designImage" fit="cover" class="main-img"> </el-image>
  </div>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      current: "onTheWay",
      parentItem: null,
      imageMap: {
        onTheWay:
          "https://transweb-1254183942.cos.ap-beijing.myqcloud.com/tidyMeApp/design/onTheWay.png",
        upgrade:
          "https://transweb-1254183942.cos.ap-beijing.myqcloud.com/tidyMeApp/design/upgrade.png",
      },
    };
  },
  beforeMount() {},
  computed: {
    designImage() {
      let imageUrl = this.imageMap[this.current];
      return imageUrl;
    },
  },
  mounted() {},
  methods: {
    goBack() {
      webCpu.CardItem.dismissMask(this.parentItem || document.body);
    },
  },
};
</script>

<style scope>
.desingEffectArea {
  position: absolute;
  display: inline-block;
  width: 100%;
  height: 100%;
  left: 0px;
  top: 0px;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 1000;
}
.desingEffectArea .el-image {
  position: relative;
  width: 100%;
  height: 100%;
}

.desingEffectArea > .icon {
  position: absolute;
  left: 15px;
  top: 15px;
  z-index: 10000;
  cursor: pointer;
  display: inline-block;
}
</style>
