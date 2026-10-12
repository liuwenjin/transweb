<template data-edit-id="1">
  <div class="ai-assistant-container tw-min-h-screen tw-bg-gray-50/50" data-edit-id="2">
    <div :class="[
        'tw-w-full tw-max-w-5xl tw-mx-auto tw-pt-8 tw-pb-12',
        flag ? 'tw-px-4' : 'tw-px-6',
      ]" data-edit-id="3">
      <div class="tw-flex tw-items-center tw-mb-6 tw-gap-2 tw-justify-between" data-edit-id="4">
        <div class="tw-flex tw-items-center tw-gap-4" data-edit-id="38">
          <h1 :class="[
              'tw-font-bold tw-text-gray-900 tw-whitespace-nowrap tw-m-0',
              flag ? 'tw-text-xl' : 'tw-text-2xl tw-w-[160px]',
            ]" data-edit-id="5">{{ workflowName }}</h1>
        </div>
        <span class="tw-flex tw-items-center tw-gap-4" data-edit-id="76">
          <div v-if="isSolo || content.isSolo" :class="[
              'loginRegItem',
              flag ? 'tw-h-[40px] tw-w-[120px]' : 'tw-h-[50px] tw-w-[160px]',
            ]" appName="loginRegItem" component="CardItem" data-edit-id="25"></div>

          <el-dropdown v-if="!flag" trigger="click" data-edit-id="39">
            <el-button circle size="small" data-edit-id="40">
              <el-icon data-edit-id="41">
                <setting data-edit-id="42" />
              </el-icon>
            </el-button>
            <template #dropdown data-edit-id="43">
              <el-dropdown-menu data-edit-id="44">
                <el-dropdown-item @click="handleEditingDialog" data-edit-id="46">应用配置</el-dropdown-item>
                <slot v-for="(item, index) in accountData.apps" :key="item.label">
                  <el-dropdown-item @click="openAppItem(item)" :divided="index === 0">{{ item.label }}</el-dropdown-item>
                </slot>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </span>
      </div>

      <div v-loading="isLoading" class="tw-bg-white tw-rounded-xl tw-shadow-sm tw-border tw-border-gray-200 tw-overflow-hidden tw-mb-8" data-edit-id="12">
        <div class="tw-p-2" data-edit-id="13">
          <el-input v-model="accountData.searchInput" type="textarea" :autosize="{ minRows: 3, maxRows: 3 }" :placeholder="inputPlaceholder" class="integrated-input" data-edit-id="14" />
        </div>

        <div class="tw-px-4 tw-pb-4" data-edit-id="15">
          <div :class="[
              'tw-flex tw-w-full',
              flag
                ? 'tw-flex-col tw-gap-2'
                : 'tw-flex-row tw-items-center tw-bg-white tw-rounded-lg tw-border tw-border-gray-200 tw-shadow-sm tw-overflow-hidden configuration-wrapper',
            ]" data-edit-id="6">
            <el-button :disabled="isRunning" :loading="isRunning" type="primary" @click="handleGenerate" :class="[
                'tw-px-8 tw-text-base tw-font-medium tw-bg-indigo-600 tw-border-none hover:tw-bg-indigo-700',
                flag
                  ? 'tw-h-12 tw-w-full tw-rounded-lg'
                  : 'tw-h-11 search-button-integrated',
              ]" data-edit-id="16">
              开始
            </el-button>
            <div :style="{width: flag ? '100%' : 'calc(100% - 80px)',  overflow: 'auto'}" data-edit-id="112">
              <el-steps style="width: auto; min-width: 800px" :space="0" :active="1" simple size="small" data-edit-id="103">
                <slot v-for="(app,index) in accountData.apps" :active="accountData.currentIndex" data-edit-id="104">
                  <el-step :title="app.label" :status="app.status" data-edit-id="109">
                    <template #title data-edit-id="106">
                      <span class="custom-tabs-label" :title="app.label" data-edit-id="107">
                        <span v-if="accountData.currentIndex === index" style="left: -22px; top: 6px;" class="tw-absolute tw-flex tw-h-2 tw-w-2" data-edit-id="28">
                          <span class="tw-animate-ping tw-absolute tw-inline-flex tw-h-full tw-w-full tw-rounded-full tw-bg-indigo-400 tw-opacity-75" data-edit-id="29"></span>
                          <span class="tw-relative tw-inline-flex tw-rounded-full tw-h-2 tw-w-2 tw-bg-indigo-500" data-edit-id="30"></span>
                        </span>
                        <span data-edit-id="108">{{app.label}}</span>
                      </span>
                    </template>
                  </el-step>
                </slot>
              </el-steps>
            </div>
            <div v-if="!flag" class="tw-w-px tw-h-6 tw-bg-gray-100" data-edit-id="9"></div>

            <el-button :loading="isExporting" :disabled="isExporting || !content.outputText" type="success" @click="handleExport" :class="[
                'tw-px-8 tw-text-base tw-font-medium tw-bg-indigo-600 tw-border-none hover:tw-bg-indigo-700',
                flag
                  ? 'tw-h-12 tw-w-full tw-rounded-lg'
                  : 'tw-h-11 search-button-integrated',
              ]" data-edit-id="16">
              导出
            </el-button>
          </div>
        </div>
      </div>

      <div v-if="accountData.apps.length !== 0" class="tw-bg-white tw-rounded-xl tw-shadow-lg tw-overflow-hidden tw-border tw-border-gray-200" data-edit-id="18">
        <el-tabs v-model="accountData.activeTab" type="border-card" class="integrated-tabs tw-w-full" data-edit-id="19">
          <el-tab-pane v-for="(item, index) in accountData.apps" :key="item.label" :name="item.value" data-edit-id="20">
            <template #label data-edit-id="106">
              <span class="custom-tabs-label" data-edit-id="107">
                <span v-if="accountData.currentIndex === index" style="left: 5px; top: 15px;" class="tw-absolute tw-flex tw-h-2 tw-w-2" data-edit-id="28">
                  <span class="tw-animate-ping tw-absolute tw-inline-flex tw-h-full tw-w-full tw-rounded-full tw-bg-indigo-400 tw-opacity-75" data-edit-id="29"></span>
                  <span class="tw-relative tw-inline-flex tw-rounded-full tw-h-2 tw-w-2 tw-bg-indigo-500" data-edit-id="30"></span>
                </span>
                <span data-edit-id="108">{{item.label}}</span>
              </span>
            </template>
            <div v-loading="isRunning" :ref="item.value" class="tw-w-full tw-h-[75vh] tw-min-h-[600px] tw-bg-gray-50 tw-overflow-auto" data-edit-id="21">
              {{ item.label + (index + 1) }}
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <div v-else class="tw-py-20 tw-bg-white tw-rounded-xl tw-border-2 tw-border-dashed tw-border-gray-200" data-edit-id="23">
        <el-empty description="暂无流程环节应用" data-edit-id="24" />
      </div>
    </div>

    <el-dialog v-model="showAppConfig" title="应用配置管理" width="550px" data-edit-id="63">
      <div class="tw-flex tw-justify-between tw-mb-4" data-edit-id="64">
        <el-button type="primary" size="small" @click="addItem('apps')" data-edit-id="65">新增应用</el-button>
        <el-button type="warning" size="small" plain @click="resetToDefault('apps')" data-edit-id="102">恢复默认</el-button>
      </div>
      <el-table :data="editingApps" border size="small" data-edit-id="66">
        <el-table-column label="应用名称" data-edit-id="67">
          <template #default="scope" data-edit-id="68">
            <el-input v-model="scope.row.label" size="small" data-edit-id="69" />
          </template>
        </el-table-column>
        <el-table-column label="应用 ID" data-edit-id="70">
          <template #default="scope" data-edit-id="71">
            <el-input v-model="scope.row.value" size="small" data-edit-id="72" />
          </template>
        </el-table-column>
        <el-table-column label="依赖" data-edit-id="70">
          <template #default="scope" data-edit-id="71">
            <el-input v-model="scope.row.facts" placeholder="间隔符号为分号" size="small" data-edit-id="72" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" data-edit-id="73">
          <template #default="scope" data-edit-id="74">
            <el-button type="danger" link @click="removeItem(scope.$index)" data-edit-id="75">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer data-edit-id="110">
        <div class="dialog-footer" data-edit-id="111">
          <el-button @click="showAppConfig = false" data-edit-id="112">取消</el-button>
          <el-button type="primary" @click="handleConfirmDialog" data-edit-id="113">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "CommonWorkflowItem",
    appMap: {
      loginRegItem: {
        url: "https://transweb.cn/mainApp/app/loginRegItem.js",
        key: "transweb_loginRegItem",
        cardName: "loginRegCard",
        dsl: {
          data: {
            position: "top",
            loginedMenu: [],
          },
        },
      },
    },
    data() {
      return {
        workflowName: "",
        showAppConfig: false,
        isLoading: false,
        flag: WebTool.adjustSize([false, false, true]),
        isSolo: WebTool.urlQuery(location.href, "solo"),
        isRunning: false,
        isExporting: false,
        content: {
          inputText: "",
          outputText: "",
        },
        editingApps: [],
        defaultData: {
          apps: [{
              value: "d90c567c8f6f2e72692148c1f16ec5d0",
              label: "框架",
              facts: ""
            },
            {
              value: "f67b2e9bb0eb1329515249e27949b1c8",
              label: "角色",
              facts: "框架"
            },
            {
              value: "2f0f54e443511afa4c30a8ef69b3aadf",
              label: "情节",
              facts: "框架;角色"
            },
            {
              value: "1b496037b107b53b5238fe6033a48a65",
              label: "冲突",
              facts: "框架;角色;情节"
            },
            {
              value: "a33b53f49975e27038901834ce8caab5",
              label: "结局",
              facts: "框架;角色;情节;冲突"
            },
            {
              value: "be66ad699aaf924c10ac712871407184",
              label: "润色",
              facts: "框架;角色;情节;冲突;结局"
            },
            {
              value: "90ca0d16e3c2ca43d0ba5ff5c1c81607",
              label: "合成",
              facts: "框架;角色;情节;冲突;结局;润色"
            }
          ],
        },
        accountData: {
          searchInput: "",
          appId: "",
          activeTab: "",
          currentIndex: -1,
          relationship: {
            
          },
          apps: [],
        },
      };
    },
    computed: {
      inputPlaceholder() {
        let str = this.accountData.apps && this.accountData.apps.length !== 0 ? '「' + this.accountData.apps[0].label + '」环节所需要的描述' : '输入第一个环节的需要';
        return str;
      }
    },
    created() {
      // 挂载时从默认数据初始化，避免空列表
      if (!this.accountData.apps || !this.accountData.apps.length) {
        this.accountData.apps = JSON.parse(JSON.stringify(this.defaultData.apps));
      }
      this.updateRelashipData(this.accountData.apps);
    },
    methods: {
      freshAppList() {
        let arr = this.accountData.apps;
        if (arr.length > 0) {
          this.accountData.activeTab = arr[0].value;
        }
        this.$nextTick(() => {
          this.initWorkApp();
        });
      },
      openAppItem(item) {
        let appId = item.value;
        window.open(`https://transweb.cn?id=${appId}`, "_blank");
      },
      handleEditingDialog() {
        this.editingApps = JSON.parse(JSON.stringify(this.accountData.apps));
        this.$nextTick(() => {
          this.showAppConfig = true;
        });
      },
      updateRelashipData(apps) {
        this.accountData.relationship = {};
        for (let i = 0; i < apps.length; i++) {
          let label = apps[i].label;
          apps[i].facts = apps[i].facts || "";
          let arr = apps[i].facts.split(/;|；/);
          arr = arr.map(item => {
            return item.trim();
          });
          this.accountData.relationship[label] = arr;
        }
      },
      handleConfirmDialog() {
        this.accountData.apps = JSON.parse(JSON.stringify(this.editingApps));
        let apps = this.accountData.apps;
        this.updateRelashipData(apps);
        let loadingItem = this.$loading({
          lock: true
        });
        setTimeout(() => {
          loadingItem.close();
          location.reload();
        }, 500);
      },
      // 恢复默认配置
      resetToDefault(type) {
        const label = type === "models" ? "模型" : "应用";
        this.$confirm(`确认要恢复${label}配置为初始默认值吗？`, "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          })
          .then(() => {
            this.accountData[type] = JSON.parse(
              JSON.stringify(this.defaultData[type])
            );
            this.$message.success("已回复默认设置");
          })
          .catch(() => {});
      },
      startTaskList(index) {
        index = index || 0;
        this.isRunning = true;
        this.resetContent(index);
        this.continueTasks(index);
      },
      stopTaskList() {
        this.isRunning = false;
        this.accountData.currentIndex = -1;
        this.resetContent(0);
      },
      formatSpec(json) {
        if (typeof json === "string") {
          json = JSON.parse(json);
        }
        for (let k in json) {
          if (typeof json[k] === "string") {
            try {
              json[k] = WebTool.extractJSON(json[k]);
            } catch (e) {
              console.log("error", e);
            }
          }
        }
        return json;
      },

      updateAppContent() {
        let index = -1;
        let arr = this.accountData.apps;
        for (let i = 0; i < arr.length; i++) {
          let appId = arr[i].value;
          let vueItem = webCpu.appMap[appId].card.task.vueItem;
          arr[i].content = vueItem.content || {};
          if (vueItem.content.outputText) {
            arr[i].status = "success";
            index = i;
          } else {
            arr[i].status = "wait";
          }
        }
        if (index !== -1 && index === arr.length - 1) {
          arr[index].status = "success";
          this.$message.success("工作流执行完毕！");
          this.isRunning = false;
          this.accountData.currentIndex = -1;
          this.content.outputText = arr[index].content.outputText;
          // Todo: 

        }
        return index;
      },
      resetContent(index) {
        this.content = this.content || {};
        this.content.inputText = "";
        this.content.outputText = "";
        
        let arr = this.accountData.apps;
        for (let i = index; i < arr.length; i++) {
          arr[i].content = arr[i].content || {};  
          arr[i].content.inputText = "";
          arr[i].content.outputText = "";

          arr[i].status = "wait";
          let appId = arr[i].value;
          if (webCpu.appMap[appId] && webCpu.appMap[appId].card) {
            let vueItem = webCpu.appMap[appId].card.task.vueItem;
            vueItem.content = vueItem.content || {};
            vueItem.content.inputText = "";
            vueItem.content.outputText = "";
          }
        }
      },
      getOutputText(arr) {
        let apps = this.accountData.apps;
        let ret = {};
        for (let i = 0; i < apps.length; i++) {
          let label = apps[i].label;
          if (arr.indexOf(label) !== -1) {
            ret[label] = apps[i].content.outputText;
          }
        }
        return JSON.stringify(ret);
      },
      continueTasks(index) {
        let list = this.accountData.apps;
        if (!list[index]) {
          console.log("index not valid, ", index);
          return false;
        }
        let vueItem = webCpu.appMap[list[index].value].card.task.vueItem;
        this.accountData.currentIndex = index;
        this.accountData.activeTab = list[index].value;
        let lastApp = list[index - 1];
        vueItem.content = vueItem.content || {};
        if (lastApp) {
          lastApp.content = lastApp.content || {};
          let tMap = this.accountData.relationship || {};
          let t = tMap[list[index].label];
          if (!t) {
            vueItem.content.inputText = lastApp.content.outputText;
          } else {
            let json = this.getOutputText(t);
            json = this.formatSpec(json);
            vueItem.content.inputText = JSON.stringify(json);
          }
        } else {
          this.content.inputText = this.accountData.searchInput;
          vueItem.content.inputText = this.content.inputText;
        }

        if (typeof vueItem.handleGenerate === "function") {
          try {
            vueItem.handleGenerate();
          } catch (e) {
            this.$message({
              type: "warning",
              message: "执行出现异常，索引为: " + index
            });
            console.log("执行出现异常，索引为: " + index, e);
            this.isRunning = false;
          }
        } else {
          this.$message({
            type: "warning",
            message: "缺少执行入口函数 handleGenerate，索引为: " + index
          });
          this.isRunning = false;
          //this.stopTaskList();
        }
      },
      // 新增列表项
      addItem(type) {
        this.editingApps.push({
          value: "",
          label: "新应用",
        });
      },
      // 删除列表项
      removeItem(index) {
        this.editingApps.splice(index, 1);
      },
      initWorkApp() {
        let arr = this.accountData.apps;
        if (!arr || arr.length === 0) {
          return false;
        }
        let list = arr.map((item) => {
          let v = item.value;
          let elem = this.$refs[item.value][0] || this.$refs[item.value];
          return {
            elem: elem,
            id: item.value,
          };
        });
        webCpu.renderAppList(list);
      },
      handleGenerate() {
        if (!this.accountData.searchInput.trim()) {
          this.$message.warning(`请输入：${this.inputPlaceholder}`);
          return;
        }
        this.content.outputText = this.accountData.searchInput;
        if (this.isRunning) {
          this.$confirm(
            "确定重新执行吗？",
            webCpu.messages[lang].confirmDialogTitle, {
              confirmButtonText: webCpu.messages[lang].confirmYes,
              cancelButtonText: webCpu.messages[lang].confirmNo,
              type: "warning",
            }
          ).then(() => {
            this.startTaskList();
          });
        } else {
          this.startTaskList();
        }
      },
      async handleExport() {
        let apps = this.accountData.apps;
        let lastApp = apps[apps.length - 1];
        let vueItem = webCpu.appMap[lastApp.value].card.task.vueItem;
        const session = WebTool.createExportSession();

        let json = JSON.parse(vueItem.content.outputText);

        json.title = json.title || "工作流成果";
        let temp = new Blob([vueItem.content.inputText], {
          type: "text/plain;charset=utf-8"
        });
        session.addFile(`${json.title}_spec.json`, temp);

        let output = vueItem.content.outputText
        temp = new Blob([output], {
          type: "text/plain;charset=utf-8"
        });
        session.addFile(`${json.title}_content.txt`, temp);

        let blob = await WebTool.transformImage(
          vueItem.$refs.previewArea,
          `${json.title}_image.png`,
          "png", {
            zip: true
          }
        );
        session.addFile(blob.filename, blob.blob);
        await session.finalize(`${json.title}.zip`);
        console.log(lastApp);
      },
    },
    mounted() {
      if (this.content && this.content.inputText) {
        this.accountData.searchInput = this.content.inputText;
      }

      this.stopTaskList();

      if (this.accountData.apps.length > 0) {
        this.accountData.activeTab = this.accountData.apps[0].value;
      }

      webCpu.mitt.on("taskDone", (value) => {
        if (this.isRunning) {
          let index = this.updateAppContent();
          let app = this.accountData.apps[index];
          if (app) {
            app.content = app.content || {};
            if (app.content.outputText && index === this.accountData.currentIndex) {
              this.continueTasks(index + 1);
            }
          }
        }
      });
      this.initWorkApp();
    },
  };
</script>

<style>
  /* 核心自定义样式 */
  .tw-w-\[160px\] {
    width: 160px !important;
  }

  .tw-w-\[240px\] {
    width: 240px !important;
  }

  .tw-h-\[50px\] {
    height: 50px !important;
  }

  .tw-h-\[75vh\] {
    height: 75vh !important;
  }

  .tw-min-h-\[600px\] {
    min-height: 600px !important;
  }

  .el-steps--simple {
    padding: 5px 10px;
  }

  /* 深度选择器保持原有 Select 样式 */
  .ai-assistant-container .custom-select-no-border .el-input__wrapper,
  .ai-assistant-container .custom-select-no-border .el-select__wrapper {
    box-shadow: none !important;
    border: none !important;
    background: transparent !important;
  }

  .ai-assistant-container .mobile-select-bordered .el-input__wrapper,
  .ai-assistant-container .mobile-select-bordered .el-select__wrapper {
    border: 1px solid #dcdfe6 !important;
    border-radius: 8px !important;
  }

  .ai-assistant-container .search-button-integrated {
    border-radius: 0 !important;
    margin-left: auto;
  }

  .ai-assistant-container .configuration-wrapper:focus-within {
    border-color: #818cf8 !important;
  }

  .ai-assistant-container .integrated-input .el-textarea__inner {
    box-shadow: none !important;
    border: none !important;
    background: transparent !important;
    padding: 15px !important;
    font-size: 15px;
    line-height: 1.6;
  }

  .el-step__title>.custom-tabs-label>span {
    min-width: 80px;
    max-width: 120px;
    display: inline-block;
    vertical-align: middle;
    margin-left: -5px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .el-step__main {
    min-width: 120px;
  }

  .ai-assistant-container .integrated-tabs.el-tabs--border-card {
    border: none !important;
  }

  .ai-assistant-container .integrated-tabs .el-tabs__content {
    padding: 0 !important;
  }

  .ai-assistant-container .integrated-tabs .el-tabs__header {
    background-color: #f9fafb !important;
    border-bottom: 1px solid #f3f4f6 !important;
  }
</style>