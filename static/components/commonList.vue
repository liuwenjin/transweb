<template>
  <div class="menuItemsArea" ref="menuItemsArea">
    <el-button
      @click="handleClickBtn"
      class="opBtn"
      size="small"
      v-if="buttonText"
      type="primary"
      >{{ buttonText }}</el-button
    >
    <el-menu
      :default-active="defaultActive || '0-0'"
      :mode="mode || 'horizontal'"
      :collapse="isCollapse"
      :router="router"
      v-if="show && menuData && menuData.length !== 0"
      @open="handleOpen"
      @close="handleClose"
    >
      <slot v-for="(d, i) in menuData">
        <slot v-if="d.children">
          <el-sub-menu :index="i + ''">
            <template #title>
              <span>{{ d.label || d.cardName }}</span>
            </template>
            <slot v-for="(t, j) in d.children">
              <el-menu-item :index="t.path || i + '-' + j">
                <template #title>
                  <span
                    :title="t.label || t.cardName"
                    @click="handleClickItem(j, i)"
                    class="myListItem "
                    ><span class="ellipsis listSpan">{{ t.label || t.cardName }}</span>
                    <el-dropdown
                      v-if="buttonOptions && buttonOptions.length !== 0"
                      trigger="hover"
                      @command="handleCommand"
                    >
                      <span class="el-dropdown-link">
                        <i class="bi bi-three-dots-vertical"></i>
                      </span>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <slot v-for="button in buttonOptions">
                            <el-dropdown-item :command="button.command">{{
                              button.label
                            }}</el-dropdown-item></slot
                          >
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown></span
                  >
                </template>
              </el-menu-item>
            </slot>
          </el-sub-menu>
        </slot>
        <slot v-else>
          <el-menu-item :index="d.path || i + ''">
            <template #title>
              <i v-if="d.icon" :class="d.icon"></i>
              <span
                :title="d.label || d.cardName"
                class="myListItem ellipsis"
                @click="handleClickItem(i)"
                ><span>{{ d.label || d.cardName
                }}</span><el-dropdown
                  v-if="buttonOptions && buttonOptions.length !== 0"
                  trigger="hover"
                  placement="bottom-start"
                  @command="handleCommand"
                >
                  <span class="el-dropdown-link">
                    <i class="bi bi-three-dots-vertical"></i>
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <slot v-for="button in buttonOptions">
                        <el-dropdown-item :command="button.command">{{
                          button.label
                        }}</el-dropdown-item></slot
                      >
                    </el-dropdown-menu>
                  </template>
                </el-dropdown></span
              >
            </template>
          </el-menu-item>
        </slot>
      </slot>
    </el-menu>
    <el-dialog
      @opened="handleOpened"
      :append-to-body="true"
      :top="dialogConfig.top"
      v-model="dialogConfig.visible"
      :title="dialogConfig.title"
      :width="dialogConfig.width"
      :fullscreen="dialogConfig.fullscreen || false"
    >
      <div ref="dialogContentArea" :style="dialogConfig.style">
        It's a draggable Dialog
      </div>
      <template
        v-if="dialogConfig.buttonText && dialogConfig.buttonText.length !== 0"
        #footer
      >
        <span class="dialog-footer">
          <el-button @click="dialogConfig.visible = false">{{
            dialogConfig.buttonText[0]
          }}</el-button>
          <el-button
            type="primary"
            @click="dialogConfig.visible = confirmDialog() || false"
            >{{ dialogConfig.buttonText[1] }}</el-button
          >
        </span>
      </template>
    </el-dialog>
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
      dialogConfig: {
        top: "30px",
        style: {
          height: "520px",
        },
        width: "90%",
        title: "新增插件",
        visible: false,
        fullscreen: false,
        buttonText: ["取消", "确认"],
      },
      dialogApp: {
        url: "components/appSelector.vue",
        className: "ElementVueItem",
      },
      show: true,
      defaultActive: "0",
      isCollapse: false,
      router: false,
      buttonText: "新增插件",
      mode: "vertical",
      buttonOptions: [],
      menuData: [],
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
    handleOpened() {
      var elem = this.$refs.dialogContentArea;
      webCpu.updateView(elem, this.dialogApp);
    },
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    },
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    },
    handleCommand(code) {
      console.log(code);
    },
    setActiveMenu(index) {
      var elem = this.$refs.menuItemsArea;
      $(elem).find(".el-menu-item").removeClass("is-active");
      $(elem).find(".el-menu-item").eq(index).addClass("is-active")
    },
    handleClickItem(index) {},
    confirmDialog(config) {},
    handleClickBtn() {
      this.dialogConfig.visible = true;
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
  width: 100%;
  height: 100%;
  padding-right: 10px;
}

.myListItem {
  display: inline-block;
  width: 100%;
  height: 100%;
}

.myListItem listSpan {
  display: inline-block;
  max-width: calc( 100% - 50px )  !important;
  vertical-align: middle;
}
.opBtn {
  width: 100%;
  margin-bottom: 8px;
  margin-top: 7px;
}

.el-dialog__body {
  padding: 10px 15px;
}

.menuItemsArea .el-menu {
  border-right: none !important;
  --el-menu-item-height: 40px !important;
  border-top: solid 1px #ddd;
}

.menuItemsArea .el-menu .el-menu-item {
  padding: 0px 0px 0px 10px;
  padding-left: 10px !important;
  text-align: left;
  border-bottom: solid 1px rgba( 200, 200, 200, 0.2);
}

.menuItemsArea .el-menu .el-menu-item:nth-child(1) {
  margin-top: -1px;
}

.menuItemsArea .el-menu .el-menu-item.is-active {
  border-top: solid 1px #ddd;
  border-left: solid 1px #ddd;
  box-shadow: 1px 1px 1px #666;
  border-radius: 3px;
  background: rgba( 200, 200, 200, 0.1);
}

.el-menu-item .el-dropdown {
  vertical-align: middle;
  float: right;
  margin-top: 0px;
  height: 100%;
  margin-right: 10px;
  padding: 13px 2px;
  display: none;
}

.el-menu-item.is-active .el-dropdown {
  display: inline-block;
}
</style>
