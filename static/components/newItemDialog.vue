<template>
  <div class="configInputArea" ref="configInputArea">
    <div class="dialogTitleArea">
      <div v-if="title" style="position: relative; width: 100%; display: inline-block;">{{title}}</div>
    </div>
    <div class="formItemList" ref="formItemList"></div>
    <div class="footOptionArea">
      <div style="position: relative; width: 100%; display: inline-block; text-align: center;;">
        <el-button type="primary" @click="confirmSubmit">确认</el-button>
        <el-button type="info" @click="cancelSubmit">取消</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  beforeMount() {},
  data() {
    return {
      title: "创建中",
      formData: {
        labelWidth: "50px",
        data: [
          {
            label: "名称",
            type: "text",
            items: [
              {
                placeholder: "请输入名称",
              },
            ],
          }
        ],
      },
      formApp: {
        url: "/components/formInfo.vue",
        className: "ElementVueItem",
      },
    };
  },
  mounted() {
    this.updateData();
  },
  methods: {
    confirmSubmit() {

    },
    cancelSubmit() {

    },
    updateData() {
      var app = JSON.parse(JSON.stringify(this.formApp));
      app.dsl = {
        data: {
          dataInfo: this.formData
        }
      };
      var elem = this.$refs.formItemList;
      webCpu.updateView(elem, app);
    }
  },
};
</script>

<style scoped>
.configInputArea {
  position: relative;
  width: 100%;
  height: 100%;
  padding-top: 20px;
  padding-bottom: 20px;
}
.dialogTitleArea {
  position: absolute;
  width: 100%;
  top: 0px;
  height: 30px;
  line-height: 30px;
}

.footOptionArea {
  position: absolute;
  width: 100%;
  bottom: 20px;
  height: 30px;
  line-height: 30px;
  z-index: 10000;
}

.dialogTitleArea>div {
  position: relative;
  height: 50px;
  line-height: 50px;
  font-size: 18px;
  padding-left: 10px;
}

.formItemList {
  position: relative;
  width: 100%;
  height: 100%;
  padding-bottom: 10px;
  padding-left: 30px;
}

.el-form-item__content>label {
  width: calc( 100% - 30px );
}

.el-form-item__content>label .el-select {
  width: 100%;
}


</style>
