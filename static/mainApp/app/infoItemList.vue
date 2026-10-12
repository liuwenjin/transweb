<template>
  <div class="menuItemsArea" ref="menuItemsArea">
    <div class="selectorOptionArea">
      <span class="titleItem" v-html="name"></span>
      <el-select
        size="small"
        @change="handleChangeList"
        allow-create
        filterable
        default-first-option
        style="width: 120px; margin-left: 5px; display: none;"
        placeholder="选择或输入仓库 ID"
        v-model="currentStore"
      >
        <el-option
          :key="item.value"
          v-for="item in options"
          :label="item.label"
          :value="item.value"
          >{{ item.label }}</el-option
        >
      </el-select>
      <el-button
        @click="handleClickBtn"
        class="opBtn"
        size="small"
        v-if="buttonText"
        type="primary"
      >{{ buttonText }}</el-button>
    </div>
    <el-menu
      :default-active="defaultActive || '0-0'"
      :mode="mode || 'horizontal'"
      :collapse="isCollapse"
      :router="router"
      v-if="show && menuData && menuData.length !== 0"
      @open="handleOpen"
      @close="handleClose"
      class=""
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
                    class="myListItem"
                    ><span class="tw-truncate listSpan">{{ t.label || t.cardName }}</span>
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
                class="myListItem"
                @click="handleClickItem(i)"
                ><span class="tw-truncate listSpan">{{ d.label || d.cardName }}</span>
                <el-dropdown
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
          height: "450px",
        },
        width: "800px",
        title: "新增",
        visible: false,
        fullscreen: false,
        buttonText: ["取消", "确认"],
      },
      current: 0,
      currentStore: localStorage.folderName,
      options: [
        {
          label: webCpu.messages[lang].mineLabel,
          value: localStorage.folderName,
        },
      ],
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
    handleChangeList(v) {},
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
      if (elem) {
        $(elem).find(".el-menu-item").removeClass("is-active");
        $(elem).find(".el-menu-item").eq(index).addClass("is-active");
      }
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
  padding-top: 40px;
}

.myListItem {
  display: inline-block;
  width: 100%;
  height: 100%;
}

.myListItem .listSpan {
  display: inline-block;
  max-width: calc( 100% - 30px )  !important;
  vertical-align: middle;
}

.selectorOptionArea {
  position: absolute;
  height: 40px;
  line-height: 40px;
  z-index: 3;
  width: 100%;
  top: 0px;
  padding-right: 0px;
  border-bottom: solid 1px #ddd;
}

.titleItem {
  display: inline-block;
  vertical-align: middle;
  color: var(--el-color-primary);
  line-height: 20px;
  height: 20px;
  text-indent: 10px;
}
.titleItem::before {
  position: absolute;
  left: -2px;
  top: 17px;
  content: "";
  height: 8px;
  width: 8px;
  border-radius: 100%;
  display: inline-block;
  background-color: var(--el-color-primary);
}

.opBtn {
  float: right;
  margin-top: 9px;
  transform: scale(0.93);
  transform-origin: 100% center;
}

.el-menu {
}

.el-dialog__body {
  padding: 10px 15px;
}

.menuItemsArea .el-menu {
  position: relative;
  float: left;
  width: 100%;
  height: 100%;
  padding-top: 10px;
  margin-top: 1px;
  border-right: none !important;
  --el-menu-item-height: 40px !important;
  overflow: auto;
}

.menuItemsArea .el-menu .el-menu-item {
  padding: 0px 0px 0px 10px;
  padding-left: 10px !important;
  text-align: left;
  border-bottom: solid 1px rgba(200, 200, 200, 0.2);
}

.menuItemsArea .el-menu .el-menu-item.is-active {
  border-left: solid 3px var(--el-color-primary);
  background: rgba(200, 200, 200, 0.1);
}

.el-menu-item .el-dropdown {
  vertical-align: middle;
  float: right;
  margin-top: 0px;
  height: 100%;
  line-height: 100%;
  margin-right: 10px;
  padding: 13px 2px;
  display: none;
}

.el-menu-item.is-active .el-dropdown {
  display: inline-block;
}
</style>
