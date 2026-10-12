<template>
<div class="menuItemsArea">
  <el-menu :default-active="defaultActive || '0-0'" :mode="mode || 'horizontal'" :collapse="isCollapse" :router="router" v-if="show" @open="handleOpen" @close="handleClose" @select="handleSelect">
    <slot v-for="(d, i) in menuData">
      <slot v-if="d.children">
        <el-sub-menu :index="String(i)">
          <template #title>
             <slot v-if="!!d.icon">
              <el-icon :size="20"><component :is="d.icon" ></component></el-icon>
             </slot>
            <span>{{ d.label }}</span>
          </template>
          <slot v-for="(t, j) in d.children">
            <el-menu-item :index="t.path || i + '-' + j">
              <template #title>
                <slot v-if="!!t.icon">
                  <el-icon :size="20"><component :is="t.icon"></component></el-icon>
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
              <el-icon :size="20"><component :is="d.icon"></component></el-icon>
              
            </slot>
            <span>{{ d.label }}</span>
          </template>
        </el-menu-item>
      </slot>
    </slot>
  </el-menu>
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
      defaultActive: "1-1",
      isCollapse: false,
      router: false,
      mode: "vertical",
      menuData: [{
          icon: "",
          label: "菜单项1",
          children: [{
              icon: "",
              label: "菜单项1-1",
            },
            {
              icon: "",
              label: "菜单项1-2",
            },
          ],
        },
        {
          icon: "",
          label: "菜单项2",
          children: [{
              icon: "",
              label: "菜单项2-1",
            },
            {
              icon: "",
              label: "菜单项2-2",
            },
          ],
        }
      ],
    };
  },
  methods: {
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
.menuItemsArea {
  vertical-align: middle;
  margin-top: 1px;
  display: inline-block;
  color: #f1f1f1;
}

.menuItemsArea .el-menu--horizontal {
  width: 100%;
  display: inline-block;
  border-bottom: none;
  background-color: transparent !important;
  color: #f1f1f1;
  text-align: right;
}

.menuItemsArea .el-menu--horizontal>.el-sub-menu .el-sub-menu__title {
  border-bottom: none;
}

.el-menu--horizontal {
  border-bottom: none;
  background-color: transparent !important;
  color: #f1f1f1;
}

.el-menu--horizontal>.el-menu-item {
  color: #ddd !important;
      vertical-align: middle;
}

.el-menu--horizontal .el-menu-item:not(.is-disabled):focus, .el-menu--horizontal .el-menu-item:not(.is-disabled):hover {
  background-color: rgba(100, 100, 100, 0.3);
}

.el-menu-item [class^=el-icon] {
  margin-right: 0px;
}

</style>
