<template>
  <div class="carouselItemList">
    <el-carousel @change="handleChange" :interval="interval" v-if="info.length !== 0" height="clac( 100% - 10px )">
      <el-carousel-item v-for="item in Math.min(this.maxPage, Math.ceil(info.length / pageSize))" :key="item">
        <div :ref="'pluginItem_' + item" class="pluginItem"></div>
      </el-carousel-item>
    </el-carousel>
    <el-empty v-else description="暂无内容"></el-empty>
  </div>
</template>

<style scoped>
.carouselItemList,
.infoItemArea {
  position: relative;
  width: 100%;
  height: 100%;
}

.el-row,
.el-col {
  height: 100%;
}

.el-carousel,
.pluginItem {
  position: relative;
  width: 100%;
  height: 100%;
}

.el-carousel__container {
  height: 100%;
}

.el-carousel__button {
  width: 5px;
  height: 5px;
  border-radius: 5px;
}

.el-carousel__indicators--horizontal {
  background: rgba(110, 110, 110, 0.3);
  padding: 0px 15px 0px 15px;
  border-radius: 25px;
  bottom: 5px;
}

.el-select .el-input.is-focus .el-input__inner {
  box-shadow: none;
  text-align: right;
}

.el-input__inner {
  box-shadow: none;
  text-align: right;
}

.el-carousel__indicator--horizontal {
  padding: -5px 5px 5px 5px;
}
</style>

<script>
export default {
  data() {
    var size = WebTool.adjustSize([3, 2, 1]);
    return {
      pageSize: size,
      maxPage: 12,
      interval: 500000000,
      info: [],
      listApp: {
        url: "components/appSelector.vue",
        className: "ElementVueItem",
        dsl: {
          data: {
            base: 0,
            span: 2,
            style: {
              height: "100%",
            },
            bodyStyle: {
              height: "calc( 100% - 35px )"
            },
            listStyle: {
              overflow: "hidden"
            },
            title: "",
            select: null,
            pagerFlag: false,
            data: []
          },
        },
      },
    };
  },
  mounted() {
    this.handleChange(0);
  },
  methods: {
    handleChange(v) {
      var _self = this;
      setTimeout(() => {
        var n = Math.ceil(_self.info.length / _self.pageSize);
        for (var i = 0; i < n; i++) {
          var ref = `pluginItem_${v + 1}`;
          var elem = _self.$refs[ref];
          if (elem) {
            var app = _self.listApp;
            app.dsl.data.span = 24 / _self.pageSize;
            app.dsl.data.data = _self.info.slice(
              v * _self.pageSize,
              (v + 1) * _self.pageSize
            );
            webCpu.updateView(elem[0], app);
          }
        }
      }, 200);
    },
  },
};
</script>
