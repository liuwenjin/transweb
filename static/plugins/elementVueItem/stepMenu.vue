<template>
  <div
    class="stepItemsArea"
    :showHeader="
      dataInfo.showHeader === undefined ? 'true' : dataInfo.showHeader + ''
    "
  >
    <el-steps
      :active="dataInfo.current"
      :finish-status="dataInfo.finishStatus"
      :process-status="dataInfo.processStatus"
      :direction="dataInfo.direction"
      simple
      style="margin-top: 20px"
    >
      <slot v-for="(item, index) in dataInfo.data">
        <el-step
          :title="item.title"
          :description="item.description"
          :icon="item.icon"
          :status="item.status"
          style="cursor: pointer;"
          @click="handleClickStep(index, item)"
        ></el-step>
      </slot>
    </el-steps>
  </div>
</template>

<style scoped>
.stepItemsArea {
  width: 100%;
  height: 100%;
}

.stepItemsArea[showheader='false'] /deep/ .el-step__head {
  display: none !important;
}

.stepItemsArea[showheader='false'] /deep/ .el-step__arrow::before {
  display: none;
}
.stepItemsArea[showheader='false'] /deep/ .el-step__arrow:after {
  transform: none;
}
</style>

<script>
export default {
  props: {
    dataObj: Object,
  },
  data() {
    return {
      dataInfo: {
        current: 2,
        finishStatus: 'success',
        showHeader: false,
        style: '',
        data: [{
            title: '信息搜集',
            icon: '',
            status: 'process',
          },
          {
            title: '数据翻译',
            icon: '',
            status: 'process',
          },
          {
            title: '素材整编',
            icon: '',
            status: 'process',
          },
          {
            title: '分析印证',
            icon: '',
            status: 'process',
          },
          {
            title: '报告通报',
            icon: '',
            status: 'success',
          },
        ],
      },
    };
  },
  computed: {},
  mounted() {
    this.updateData(this.dataObj);
  },
  methods: {
    updateData(dataObj) {
      for (var k in dataObj) {
        this.dataInfo[k] = dataObj[k];
      }
    },
    handleClickStep(index, item) {
      this.$emit('click', index, item);
    },
  },
};
</script>
