<template>
  <div class="commonBookContainer">
    <el-menu
      :default-active="defaultActive || '0-0'"
      :mode="mode || 'horizontal'"
      :collapse="isCollapse"
      :router="router"
      v-if="show"
      class="leftMenuArea"
      @open="handleOpen"
      @close="handleClose"
      @select="handleSelect"
    >
      <slot v-for="(d, i) in menuData">
        <slot v-if="d.children">
          <el-sub-menu :index="String(i)">
            <template #title>
              <slot v-if="!!d.icon">
                <el-icon :size="20"
                  ><component :is="d.icon"></component
                ></el-icon>
              </slot>
              <span>{{ d.label }}</span>
            </template>
            <slot v-for="(t, j) in d.children">
              <el-menu-item :index="t.path || i + '-' + j">
                <template #title>
                  <slot v-if="!!t.icon">
                    <el-icon :size="20"
                      ><component :is="t.icon"></component
                    ></el-icon>
                  </slot>
                  <span>{{ t.label }}</span>
                </template>
              </el-menu-item>
            </slot>
          </el-sub-menu>
        </slot>
        <slot v-else>
          <el-menu-item :index="d.path || i + ''">
            <template #title>
              <slot v-if="!!d.icon">
                <el-icon :size="20"
                  ><component :is="d.icon"></component
                ></el-icon>
              </slot>
              <span>{{ d.label }}</span>
            </template>
          </el-menu-item>
        </slot>
      </slot>
    </el-menu>
    <div class="articleViewerArea" ref="articleViewerContainer"></div>
  </div>
</template>

<script>
export default {
  beforeMount() {
    if (this.menuInfo) {
      this.updateData(this.menuInfo);
    }
  },
  data() {
    return {
      show: true,
      defaultActive: "0",
      isCollapse: false,
      router: false,
      mode: "vertical",
      menuData: [
        {
          icon: "",
          label: "快速入门",
          url: "/assets/introduce.md",
        },
        {
          icon: "",
          label: "封装插件",
          url: "/assets/mdDocuments/packagePlugin.md",
        },
        {
          icon: "",
          label: "封装模板",
          url: "/assets/mdDocuments/packageTemplate.md",
        },
        {
          icon: "",
          label: "使用插件",
          url: "/assets/mdDocuments/usePlugin.md",
        },
        {
          icon: "",
          label: "使用模板",
          url: "/assets/mdDocuments/useTemplate.md",
        },
        {
          icon: "",
          label: "使用Web服务接口",
          url: "/assets/mdDocuments/useInterface.md",
        },
        {
          icon: "",
          label: "离线使用和部署",
          url: "/assets/mdDocuments/offlineDeployment.md",
        },
      ],
      articleViewer: {
        className: "MarkdownArticle",
        dsl: {
          url: "/assets/introduce.md",
          requestType: "get",
          dataType: "text",
          style: {
            padding: "20px 40px",
            overflow: "auto",
            background: "#f8f8f8",
          },
        },
      },
    };
  },
  mounted() {
    this.updateArticle();
  },
  methods: {
    updateArticle(key) {
      key = key || this.defaultActive || "0";
      this.defaultActive = key;
      let arr = key.split("-");
      let d = this.menuData[arr[0]];
      let url = d.url;
      if (d.children) {
        d = d.children[arr[1]] || {};
        url = d.url;
      }
      this.articleViewer.dsl.url = url;
      let elem = this.$refs.articleViewerContainer;
      webCpu.updateView(elem, this.articleViewer);
      if(webCpu.router) {
        location.hash = webCpu.router.path + "?article=" + key;
      }
    },
    updateData(menuInfo) {
      if (menuInfo) {
        this.show = false;
        this.defaultActive = menuInfo.defaultActive || this.defaultActive;
        this.menuData = menuInfo.data || this.menuData;
        this.router = menuInfo.router || true;
        this.isCollapse = menuInfo.isCollapse || this.isCollapse;
        this.mode = menuInfo.mode || this.mode;
        this.$nextTick(function () {
          this.show = true;
        });
      }
    },
    swtichMode(flag) {
      if (flag === true || flag === false) {
        this.isCollapse = flag;
      } else {
        this.isCollapse = !this.isCollapse;
      }
    },
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    },
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
      this.updateArticle(key);
      this.$emit("menuItemSelect", keyPath);
    },
  },
  created() {},
  props: {
    menuInfo: Object,
  },
};
</script>

<style scoped>
.commonBookContainer {
  vertical-align: middle;
  margin-top: 1px;
  display: inline-block;
  padding-left: 160px;
  width: 100%;
  height: 100%;
  position: relative;
}

.leftMenuArea {
  position: absolute;
  left: 0px;
  width: 160px;
  height: 100%;
  overflow: auto;
}

.articleViewerArea {
  position: relative;
  width: 100%;
  height: 100%;
}

.commonBookContainer .el-menu--horizontal {
  width: 100%;
  display: inline-block;
  border-bottom: none;
  background-color: transparent !important;
  text-align: right;
}

.commonBookContainer .el-menu--horizontal > .el-sub-menu .el-sub-menu__title {
  border-bottom: none;
}

.el-menu--horizontal {
  border-bottom: none;
  background-color: transparent !important;
}

.el-menu--horizontal > .el-menu-item {
  vertical-align: middle;
}

.el-menu--horizontal .el-menu-item:not(.is-disabled):focus,
.el-menu--horizontal .el-menu-item:not(.is-disabled):hover {
  background-color: rgba(100, 100, 100, 0.3);
}

.el-menu-item [class^="el-icon"] {
  margin-right: 0px;
}
</style>
