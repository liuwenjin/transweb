<template>
  <div class="collapseItemList">
    <el-collapse
      v-model="activeName"
      accordion
      @change="handleChange"
      v-if="appData.length !== 0"
    >
      <el-collapse-item
        :style="
          activeName === (item.label || index)
            ? { height: `calc( 100% - ${75 * (appData.length - 1)}px )` }
            : {}
        "
        v-for="(item, index) in appData"
        :key="item.label"
        :title="item.label || item.name"
        :name="item.label || item.name || index"
      >
      <template #title>
          {{ item.label || item.name }}
          <el-button :title="'新增' + (item.label || item.name) " circle type="primary" plain size="small" style="margin-left: 10px; transform: scale(0.8);" @click.stop="handleClick(index)" class="header-icon">
            <el-icon><plus /></el-icon>
          </el-button>
        </template>
        <div
          :ref="'pluginItem_' + (item.label || item.name || index)"
          class="pluginItem"
        >
          {{ item.label || item.name || index }}
        </div>
      </el-collapse-item>
    </el-collapse>
    <el-empty v-else description="暂无内容"></el-empty>
  </div>
</template>

<style scoped>
.collapseItemList {
  position: relative;
  width: 100%;
  height: 100%;
}

.el-collapse,
.pluginItem {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 5px;
}

.el-collapse-transition-enter-active {
  max-height: none !important;
}
.el-collapse-item .el-collapse-item__header,
.el-collapse-item .el-collapse-item__content {
  padding-left: 10px;
  height: 100%;
  overflow: auto;
}

.el-collapse-item:first-child .el-collapse-item__header {
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}

.el-collapse-item.is-active > .el-collapse-item__wrap {
  position: relative;
  width: 100%;
  height: calc(100% - 50px);
}
</style>

<script>
export default {
  data() {
    return {
      current: 0,
      buttonText: "新增",
      activeName: "",
      appData: [],
      appMap: {},
    };
  },
  mounted() {
    this.initActive();
  },
  methods: {
    initActive() {
      this.appData = this.appData || [];
      let _self = this;
      this.appData.map((item) => {
        let k = item.label || item.name || "0";
        _self.appMap[k] = item;
      });
      let app = this.appData[this.current || 0] || {};
      this.activeName = app.label || app.name || "0";
      this.handleChange(this.activeName);
    },
    handleClick(index) {
      console.log(index);
    },
    handleChange(v, callback) {
      if (!v) {
        return false;
      }
      let app = this.appMap[v];
      this.$nextTick(() => {
        let elem = this.$refs["pluginItem_" + v][0];
        if (v === this.activeName && app.card && !elem && !elem.clientHeight) {
          if (typeof callback === "function") {
            callback();
          }
        } else {
          this.activeName = v || this.activeName;
          this.$nextTick(() => {
            webCpu.updateView(elem, app, function () {
              if (typeof callback === "function") {
                callback();
              }
            });
          });
        }
      });
    },
  },
};
</script>
