<template>
<div :type="cardType" class="infoCardArea">
  <div style="width: 100%;">
    <div @click="$emit('clickItem', item)" style="width: calc( 100% - 50px ); display: inline-block; cursor: pointer;">
      <h4>{{item.title}}</h4>
      <p v-if="item._title">{{item._title}}</p>
    </div>
    <el-button @click="$emit('clickBtn', item)" link plain v-if="cardType === 'view'" style="width: 50px; display: inline-block; vertical-align: top; text-align: right; cursor: pointer;">
      <el-icon v-if="item.favorite === true">
        <StarFilled />
      </el-icon>
      <el-icon v-else>
        <Star />
      </el-icon>
    </el-button>
    <el-button @click="$emit('clickBtn', item)"  link plain v-if="cardType === 'check'" style="width: 50px; display: inline-block; text-align: right; cursor: pointer;">
      <el-icon v-if="item.check === true">
        <CircleCheckFilled />
      </el-icon>
      <el-icon v-else>
        <CircleCheck />
      </el-icon>
    </el-button>
  </div>
  <el-form label-width="60px" label-position="left" label-suffix=":">
    <el-form-item label="摘要">
      <span class="ellipsis" :title="item.abstract"> {{item.abstract}}</span>
    </el-form-item>
    <el-form-item label="标签">
      <slot v-for="d in item.labels">
        <el-tag size="small">{{d}}</el-tag>
      </slot>
      <span v-if="!item.labels || item.labels.length === 0">暂无标签</span>
    </el-form-item>
    <el-form-item v-if="cardType === 'check'" label="综合得分" style="display: inline-block; width: 180px;">
      {{item.score}}
    </el-form-item>
    <el-form-item label="时间" style="display: inline-block; width: 250px;">
      <span>{{item.time}}</span>
    </el-form-item>
    <el-form-item label="源链接" style="display: inline-block; width: 250px;">
      <a class="ellipsis" :title="item.link.name || item.link.url" target="_blank" v-if="item.link && item.link.url" :href="item.link.url">{{item.link.name || item.link.url}}</a>
    </el-form-item>
  </el-form>

</div>
</template>

<script>
export default {
  beforeMount() {

  },
  data() {
    return {
      cardType: "view",
      item: {
        title: "测试标题001",
        abstract: "摘要内容....",
        labels: ["objective research and analysis", "Corporate publications", "document and trademark"],
        link: {
          name: "RAND",
          url: "http://182.92.69.3/dongtai/guowai_detail_new/?id=https://www.rand.org/pubs/corporate_pubs/CPA1927-1.html"
        },
        time: "2022-07-26 13:22:53",
        favorite: 1,
        checked: 0,
        score: 8
      }
    };
  },
  methods: {
    handleClickBtn() {

    },

  },
  created() {
    this.cardType = this.type;
    this.item = this.dataObj;
  },
  props: {
    dataObj: Object,
    type: String
  },
};
</script>

<style scoped>
:deep(.el-tag) {
  margin-right: 5px;
}

.el-form-item {
  margin-bottom: 0px;
}

:deep(.el-form-item__content) {
  position: relative;
  display: inline-block;
  max-width: calc(100% - 70px);
}

:deep(.el-form-item__content) span {
  vertical-align: middle;
}

:deep(.el-form-item__content) a {
  width: 100%;
  vertical-align: middle;
}

:deep(.el-form-item__label) {
  padding-right: 0px;
}

.infoCardArea h4,
.infoCardArea p {
  margin: 0px;
}
</style>
