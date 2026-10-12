<template>
  <div class="commonCardArea">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="titleArea">{{ title }}</span>
          <span v-if="(buttonConfig && buttonConfig.length !== 0)">
            <slot v-for="item in buttonConfig">
              <el-dropdown 
                 v-if="item.children" @command="handleCommand">
                <span class="el-dropdown-link">
                  <el-button :type="item.type"
                    >{{ item.label }}
                    <el-icon class="el-icon--right"> <arrow-down /> </el-icon
                  ></el-button>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <slot v-for="d in item.children">
                      <el-dropdown-item :command="d.command || d.label">{{
                        d.label
                      }}</el-dropdown-item>
                    </slot>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-button
                v-else
                style="margin: 0px 5px;"
                :type="item.type"
                @click="handleCommand(item.command || item.label)"
                >{{ item.label }}</el-button
              >
            </slot>
          </span>
          <span ref="filterFormItem" :style="filterConfig.style" class="filterArea" v-else-if="(filterConfig && filterConfig.length !==0)">
           
          </span>
        </div>
      </template>
      <div class="card-content" :cardName="appName" ref="cardContentItem">
        <span v-if="!this.app" class="cardContentTips">{{
          "appName或者app无效"
        }}</span>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  beforeMount() {},
  data() {
    return {
      title: "示例标题A",
      _buttonConfig: [
        { label: "按钮A", command: "点击事件A" },
        {
          label: "操作组B",
          children: [
            {
              label: "按钮B-1",
              command: "点击事件B-1",
            },
            {
              label: "按钮B-2",
              command: "点击事件B-2",
            },
            {
              label: "按钮B-3",
              command: "点击事件B-3",
            },
          ],
        },
      ],
      buttonConfig: [],
      filterConfig: {
        labelWidth: "100px",
        labelPosition: "left",
        style: "width: 250px;",
        data: [{
          label: "筛选条件A",
          value: "",
          key: "key1",
          type: "input",
          placeholder: "请输入"
        }]
      },
      appName: "",
      app: null,
      formApp: {
        url: "/plugins/elementVueItem/formInfo.vue",
        className: "ElementVueItem"
      }
    };
  },
  mounted() {
    this.initCardItem();
    this.$nextTick(() => {
      this.initFormItem();
    })
    
  },
  methods: {
    initCardItem() {
      var elem = this.$refs.cardContentItem;
      if (this.appName) {
        this.appMap = this.appMap || {};
        this.app = this.appMap[this.appName] || this.app;
        if (!this.app && webCpu.currentWebApp && webCpu.currentWebApp.appMap) {
          this.app = webCpu.currentWebApp.appMap[this.appName] || this.app;
        }
      }
      if (this.app) {
        webCpu.updateView(elem, this.app);
      }
    },
    initFormItem() {
      var elem = this.$refs.filterFormItem;
      if(elem) {
        var app = this.formApp;
        app.dsl = {
          data: this.filterConfig
        }
        webCpu.updateView(elem, app);
      }
    },
    handleCommand(command) {
      console.log(command);
      this.$message({
        type: "success",
        message: command
      })
    }
  },
};
</script>

<style scoped>
.commonCardArea,
.box-card {
  float: left;
  position: relative;
  width: 100%;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  position: relative;
  width: 100%;
  height: 100%;
}

.el-card__body {
  height: calc(100% - 30px);
}

.titleArea {
  display: inline-block;
  max-width: 180px;
  vertical-align: middle;
}

.filterArea {
  display: inline-block;
  width: calc( 100% - 200px );
  height: 30px;
  vertical-align: middle;
  text-align: right;
}

.filterArea label {
  margin-bottom: 0px !important;
}

.filterArea .FormInfoArea .el-form-item {
  margin-bottom: 0px !important;
}

.filterArea  .el-form {
  padding: 0px 0px !important;
}


.cardContentTips {
  padding-left: 10px;
  padding-top: 10px;
}
</style>
