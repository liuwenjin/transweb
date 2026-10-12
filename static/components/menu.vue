<template>
  <div
    v-loading="isCopying"
    class="tw-flex tw-items-center tw-justify-center tw-gap-2 tw-h-full tw-w-full transwe-options-bar"
  >
    <input
      ref="fileInput"
      type="file"
      :accept="currentAccept"
      class="tw-hidden"
      @change="handleFileSelected"
    />

    <el-button-group class="custom-group">
      <template v-for="(item, index) in itemList">
        <el-dropdown
          v-if="item.children"
          :key="'drop-' + index"
          placement="top"
          trigger="click"
          @command="handleCommand"
        >
          <button
            class="menu-item-btn has-dropdown"
            :class="{ 'is-active': activeMenu === index }"
            @click="activeMenu = activeMenu === index ? null : index"
          >
            <span>{{ item.label }}</span>
            <svg
              class="arrow-icon"
              :class="{ rotated: activeMenu === index }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <template #dropdown>
            <el-dropdown-menu class="custom-dropdown-menu">
              <el-dropdown-item
                v-for="sub in item.children"
                :key="sub.label"
                :command="sub"
                class="custom-dropdown-item"
              >
                {{ sub.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <button
          v-else
          :key="'btn-' + index"
          @click="openEditorDialog(item.command)"
          class="menu-item-btn"
        >
          {{ item.label }}
        </button>
      </template>
      <button @click="copyAppId()" class="menu-item-btn">
        {{ "复制 AppId" }}
      </button>
      <button @click="openLink()" class="menu-item-btn">
        {{ "链接" }}
      </button>
    </el-button-group>
  </div>
</template>

<script>
export default {
  name: "TransweOptions",
  data() {
    return {
      activeMenu: null,
      currentAccept: "*",
      currentCommand: "",
      isCopying: false,
      isParter: false,
      appId: "",
      itemList: [
        {
          label: "修改",
          children: [
            {
              label: webCpu.messages.zh.selectModel,
              command: "openConfigDialog",
            },
            {
              label: webCpu.messages.zh.editPrompt,
              command: "openPromptEditor",
            },
            {
              label: webCpu.messages.zh.editResultApp,
              command: "editContentCode",
            },
          ],
        },
        {
          label: "打开",
          children: [
            {
              label: "本地提示词",
              command: "openPromptEditor",
              accept: ".txt,.md",
            },
            { label: "本地代码", command: "openCodeEditor", accept: ".vue" },
          ],
        },
      ],
    };
  },
  methods: {
    handleCommand(command) {
      this.activeMenu = null;
      if (command.accept) {
        this.currentAccept = command.accept;
        this.currentCommand = command.command;
        this.$nextTick(() => {
          if (this.$refs.fileInput) this.$refs.fileInput.click();
        });
      } else {
        this.openEditorDialog(command.command, "");
      }
    },
    copyAppId() {
      navigator.clipboard.writeText(this.appId).then(() => {
        console.log("AppId copied to clipboard:", this.appId);
        this.$message.success("AppId 已复制到剪贴板");
      });
    },
    openLink() {
      const url = "https://transweb.cn?id=" + this.appId;
      window.open(url, "_blank");
    },
    editContentCode(code, card) {
      let dataUrl = webCpu.currentVueItem.currentAppItem.task.template;
      // code = code || this.content.code;
      card = card || document.body;
      let app = {
        className: "CodeEditor",
        dsl: {
          changeCallback: function (dd) {},
          data: WebTool.parseDataUrl(dataUrl),
          options: {
            lineNumbers: true,
            value: "",
            mode: "vue",
          },
        },
      };
      let _self = this;
      let confirmCallback = function () {
        let tCode = app.card.task.data;
        dataUrl = WebTool.stringToDataURL(tCode);
        debugger;
        let opList = {
          ops: [
            {
              op: "js.data.update",
              path: "currentAppItem",
              raw: true,
              value: `{
									className: "ElementVueItem",
									task: {
										style: {
											overflow: "auto",
										},
										template: "${dataUrl}"
									}
								}`,
            },
          ],
        };
        const result = VueSfcEditorPlugin.applyWithResult(
          _self.content.code,
          opList
        );

        _self.content.code = result.code;
        _self.currentCode = result.code;
        //_self.content.code = app.card.task.data;
        //_self.currentCode = app.card.task.data;
        _self.updateAppItem();
        webCpu.CardItem.dismissMask(document.body);
        _self.saveContent();
      };
      let previewApp = function () {
        let code = app.card.task.data;
        _self.previewAppStr(code, webCpu.cards.codeEditorDialog);
      };
      webCpu.CardItem.renderCardDialog(
        card,
        app,
        {
          title: "代码编辑",
          titleStyle: {
            background: "var(--el-color-primary-light-9)",
            color: "var(--el-color-primary)",
          },
          closeType: "back",
          dialogName: "codeEditorDialog",
          menu: [
            {
              label: "确认",
              action: confirmCallback,
            },
          ],
        },
        {
          width: "100%",
          height: "100%",
        }
      );
      this.dismissLoadingTips();
    },
    openEditorDialog(command, vaule) {
      let vItem = null;
      try {
        vItem = webCpu.currentCard.task.vueItem;
      } catch (err) {
        console.error("No current card or vueItem found", err);
        return;
      }
      if (typeof vItem[command] !== "function") {
        console.warn("Command not found on vueItem:", command);
        return;
      }
      if (!localStorage.folderName) {
        this.$message({
          type: "warning",
          message: this.$t("loginTips"),
        });
        dialogMap.openLoginDialog(document.body);
        return false;
      }
      if (localStorage.folderName !== vItem.documentMeta.folderName) {
        this.$message.warning("无法编辑非当前账号下的应用内容");
        this.$confirm("是否生成可编辑的副本？", "提示", {
          confirmButtonText: "确认",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            this.isCopying = true;
            WebTool.copyWebApp(
              webCpu.cards.documentEditor.task.vueItem,
              {
                content: vItem.content,
                documentMeta: vItem.documentMeta,
                app: vItem.currentApp,
              },
              "",
              (id) => {
                WebTool.downloadApp(id, () => {
                  this.$message.success(
                    "已生成应用副本压缩包, 解压后打开 html 页面后即可进行编辑"
                  );
                  this.isCopying = false;
                });
              }
            );
          })
          .catch((e) => {
            console.log(e);
          });
        return;
      }

      vItem[command](vaule);
    },

    async handleFileSelected(e) {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const content = await file.text();
        this.openEditorDialog(this.currentCommand, content);
        console.log(
          `File loaded for command ${this.currentCommand}:`,
          file.name
        );
      } catch (err) {
        console.error("File load failed", err);
      } finally {
        e.target.value = "";
      }
    },
  },
  mounted() {
    let userInfo = JSON.parse(localStorage.userInfo || "{}");
    if (userInfo.role && userInfo.role.indexOf("partner") !== -1) {
      this.isPartner = true;
      this.itemList[0].children.push({
        label: webCpu.messages.zh.editCode,
        command: "openCodeEditor",
      });
    }
  },
};
</script>

<style scoped>
/* 1. 基础容器：确保上下垂直居中 */
.transwe-options-bar {
  font-size: 13px;
  color: #6b7280;
  display: flex;
  align-items: center;
}

/* 2. 按钮组样式调整 */
.custom-group {
  display: flex;
  align-items: center;
  border: none;
  border-radius: 6px;
  background: #fff;
  overflow: hidden;
}

/* 3. 一级按钮：融合 Element 风格与自定义动效 */
.menu-item-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0px 14px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: #4b5563;
  font-size: 13px;
  font-weight: 500;
  outline: none;
}

.menu-item-btn:last-child {
  border-right: none;
}

.menu-item-btn:hover {
  background-color: rgba(0, 0, 0, 0.06); /* 模拟 tw-bg-black/[0.06] */
  color: #000;
}

.menu-item-btn:active {
  transform: scale(0.96); /* 点击缩放动效 */
}

.menu-item-btn.is-active {
  background-color: rgba(0, 0, 0, 0.08);
  color: #000;
}

.el-dropdown {
  height: 40px;
}

/* 箭头动效 */
.arrow-icon {
  width: 12px;
  height: 12px;
  opacity: 0.5;
  transition: transform 0.3s ease;
}
.arrow-icon.rotated {
  transform: rotate(180deg);
  opacity: 1;
}

/* 4. Element Plus Dropdown 样式覆盖 */
.custom-dropdown-menu {
  border-radius: 10px !important;
  padding: 6px 0 !important;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1) !important;
}

.custom-dropdown-item {
  font-size: 13px !important;
  padding: 8px 16px !important;
  color: #4b5563 !important;
  transition: all 0.2s ease !important;
}

.custom-dropdown-item:hover {
  background-color: rgba(0, 0, 0, 0.04) !important;
  color: #000 !important;
  padding-left: 20px !important; /* 悬浮位移动效 */
}

/* 移除 Element 默认焦点蓝框 */
:focus {
  outline: none !important;
}
</style>