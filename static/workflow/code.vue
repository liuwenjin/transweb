<template>
  <div id="rootContainerItem" class="tw-relative tw-bg-page-gradient tw-px-5">
    <div class="tw-w-full tw-max-w-5xl tw-mx-auto tw-pt-8 tw-relative">
      <div class="tw-w-full tw-flex tw-justify-between tw-items-center">
        <div class="tw-flex tw-items-center tw-gap-3">
          <div class="tw-flex tw-items-center tw-justify-center tw-w-9 tw-h-9">
            <img
              class="tw-w-9 tw-h-9"
              src="https://transweb.cn/assets/images/logo-brand.png"
            />
          </div>
          <h3
            :class="[
              'tw-font-bold tw-text-gray-900 tw-whitespace-nowrap tw-m-0',
              flag ? 'tw-text-xl' : 'tw-text-2xl tw-w-custom-160',
            ]"
            style="outline: none; line-height: 1.2"
            :contenteditable="!isViewer"
            @blur="handleTitleChange"
          >
            {{ title || "极简工作流" }}
          </h3>
        </div>
        <span
          class="optionsArea tw-flex tw-items-center tw-gap-1"
          v-if="!isViewer"
        >
          <el-button
            circle
            class="tw-mr-1 header-action-btn"
            size="small"
            title="新增可选 Skill"
            @click="newAgentDialog()"
          >
            <el-icon>
              <plus />
            </el-icon>
          </el-button>
          <el-dropdown trigger="click" data-edit-id="39">
            <el-button
              circle
              size="small"
              class="header-action-btn"
              data-edit-id="40"
            >
              <el-icon data-edit-id="41">
                <setting data-edit-id="42" />
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu data-edit-id="44">
                <el-dropdown-item @click="handleEditingDialog" data-edit-id="46"
                  >修改可选 Skill 列表</el-dropdown-item
                >
                <slot v-for="(item, index) in apps" :key="item.label">
                  <el-dropdown-item
                    @click="openAppItem(item)"
                    :divided="index === 0"
                    >{{ item.label }}</el-dropdown-item
                  >
                </slot>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-dropdown trigger="click">
            <el-button circle class="tw-ml-1 header-action-btn" size="small">
              <el-icon>
                <download />
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item title="导出编辑模式" @click="exportWorkflow()"
                  >导出编辑模式</el-dropdown-item
                >
                <el-dropdown-item
                  title="导出预览模式"
                  @click="exportWorkflow('record')"
                  >导出预览模式</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </span>
        <span v-else>
          <el-button
            circle
            class="tw-ml-2 header-action-btn"
            style="margin-top: -3px"
            size="small"
            title="编辑工作流"
            @click="switchEditMode()"
          >
            <el-icon>
              <el-icon>
                <edit />
              </el-icon>
            </el-icon>
          </el-button>
        </span>
      </div>

      <div
        v-if="!isViewer"
        :class="[
          'tw-w-full tw-mt-5 tw-relative tw-flex tw-gap-4',
          flag ? 'tw-flex-col tw-items-stretch' : 'tw-flex-row tw-items-center',
        ]"
      >
        <div
          :class="[
            'tw-w-full tw-transition-all tw-duration-300',
            flag
              ? 'tw-flex tw-flex-col tw-gap-3 tw-bg-transparent'
              : 'tw-flex tw-flex-col tw-gap-2 tw-bg-white tw-p-4 tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-card configuration-wrapper',
          ]"
        >
          <!-- 节点流标题 / 数量统计 / 折叠控制栏 -->
          <div
            class="tw-text-xs tw-text-slate-400 tw-flex tw-justify-between tw-items-center tw-select-none"
          >
            <div
              class="tw-flex tw-items-center tw-gap-1.5 tw-cursor-pointer hover:tw-text-blue-600 tw-transition-colors"
              @click="isExpanded = !isExpanded"
            >
              <span class="tw-font-medium">工作流节点链路：</span>
              <i
                :class="[
                  'bi bi-chevron-down tw-transition-transform tw-duration-200 tw-text-xs',
                  !isExpanded ? 'tw--rotate-90' : '',
                ]"
              ></i>
              <span class="tw-text-[11px] tw-text-slate-400">
                ({{ isExpanded ? "点击收起" : "点击展开" }})
              </span>
            </div>

            <span class="tw-text-slate-400 tw-font-mono">
              共
              {{
                accountData.workflow.length + (accountData.appId ? 1 : 0)
              }}
              个节点
            </span>
          </div>

          <!-- 统一的线性链路容器（受 isExpanded 状态控制显示/隐藏，附带过渡动画） -->
          <div
            v-show="isExpanded"
            :class="[
              'tw-transition-all tw-duration-300 tw-pt-1',
              flag
                ? 'tw-flex tw-flex-col tw-items-center tw-gap-2'
                : 'tw-flex tw-flex-wrap tw-items-center tw-gap-2',
            ]"
          >
            <!-- 1. 主 Agent 节点（链路起点 #0 / #1） -->
            <div
              :class="[
                'tw-flex tw-items-center tw-shrink-0',
                flag ? 'tw-flex-col tw-gap-2' : 'tw-gap-2',
              ]"
            >
              <!-- 主 Agent 卡片 -->
              <div
                class="tw-flex tw-items-center tw-gap-2 tw-bg-[#F6F9F7] tw-border tw-border-slate-200 tw-px-3 tw-py-1.5 tw-rounded-lg tw-shrink-0"
              >
                <div
                  class="tw-flex tw-items-center tw-gap-1 tw-text-blue-600 tw-font-semibold tw-text-sm"
                >
                  <i class="bi bi-robot tw-text-base"></i>
                </div>

                <el-select
                  v-model="accountData.appId"
                  allow-create
                  filterable
                  placeholder="挑选或输入 Skill ID"
                  class="tw-w-44 custom-select-no-border"
                >
                  <el-option
                    v-for="item in apps"
                    :key="item.value"
                    :label="item.label || item"
                    :value="item.value || item"
                  />
                </el-select>
              </div>

              <!-- 主 Agent 指向后续节点的连接箭头 -->
              <div
                class="tw-flex tw-items-center tw-justify-center tw-text-blue-500 tw-shrink-0"
              >
                <i
                  :class="[
                    flag ? 'bi bi-arrow-down' : 'bi bi-arrow-right',
                    'tw-text-sm tw-drop-shadow-glow',
                  ]"
                ></i>
              </div>
            </div>

            <!-- 2. 工作流节点列表 -->
            <div
              v-for="(node, index) in accountData.workflow"
              :key="index"
              :class="[
                'tw-flex tw-items-center tw-shrink-0',
                flag ? 'tw-flex-col tw-gap-2' : 'tw-gap-2',
              ]"
            >
              <!-- 单个工作流节点卡片 -->
              <div
                class="tw-group tw-relative tw-flex tw-items-center tw-gap-1.5 tw-bg-slate-50 tw-hover:bg-blue-50/50 tw-border tw-border-slate-200 tw-hover:border-blue-200 tw-px-3 tw-py-1.5 tw-rounded-lg tw-transition-all tw-shrink-0"
              >
                <span class="tw-text-xs tw-font-bold tw-text-blue-400">
                  #{{ index + 1 }}
                </span>
                <span class="tw-text-sm tw-text-slate-700 tw-font-medium">
                  {{ getLabel(node) }}
                </span>

                <!-- 节点操作按钮组 -->
                <div
                  class="tw-flex tw-items-center tw-gap-1 tw-ml-2 tw-opacity-80 group-hover:tw-opacity-100 tw-transition-opacity"
                >
                  <!-- 前移/上移 -->
                  <button
                    v-if="index > 0"
                    @click="moveNode(index, -1)"
                    title="前移节点"
                    class="tw-p-0.5 tw-text-slate-400 hover:tw-text-blue-600 tw-rounded hover:tw-bg-white"
                  >
                    <i
                      :class="flag ? 'bi bi-chevron-up' : 'bi bi-chevron-left'"
                    ></i>
                  </button>

                  <!-- 后移/下移 -->
                  <button
                    v-if="index < accountData.workflow.length - 1"
                    @click="moveNode(index, 1)"
                    title="后移节点"
                    class="tw-p-0.5 tw-text-slate-400 hover:tw-text-blue-600 tw-rounded hover:tw-bg-white"
                  >
                    <i
                      :class="
                        flag ? 'bi bi-chevron-down' : 'bi bi-chevron-right'
                      "
                    ></i>
                  </button>

                  <!-- 删除节点 -->
                  <button
                    @click="removeNode(index)"
                    title="删除节点"
                    class="tw-p-0.5 tw-text-slate-400 hover:tw-text-red-500 tw-rounded hover:tw-bg-white"
                  >
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>
              </div>

              <!-- 节点卡片后的连接箭头 -->
              <div
                class="tw-flex tw-items-center tw-justify-center tw-text-blue-400 tw-shrink-0"
              >
                <i
                  :class="[
                    flag ? 'bi bi-arrow-down' : 'bi bi-arrow-right',
                    'tw-text-sm tw-drop-shadow-glow',
                  ]"
                ></i>
              </div>
            </div>

            <!-- 3. 新增节点下拉选择器（始终处于链路最后） -->
            <div class="tw-flex tw-items-center tw-shrink-0">
              <el-select
                v-model="selectedNewNode"
                filterable
                placeholder="+ 添加节点"
                class="tw-w-36 custom-select-add-node"
                @change="handleAddNode"
              >
                <el-option
                  v-for="item in apps"
                  :key="item.value"
                  :label="item.label || item"
                  :value="item.value || item"
                />
              </el-select>
            </div>
          </div>
        </div>

        <!-- 编辑关联关系按钮 -->
        <el-button
          text
          :title="relationEditor.tips"
          v-if="!flag"
          @click="startEditRelation()"
        >
          <el-icon><edit-pen /></el-icon>
        </el-button>
      </div>

    </div>

    <!-- 步骤条 + iframe 组合区域：节点较多时步骤条纵向排列，与 iframe 同排同高 -->
    <div
      v-if="accountData.appId"
      :class="[
        'tw-mt-6 tw-w-full tw-max-w-5xl tw-mx-auto workflow-stage',
        isVerticalSteps ? 'workflow-stage-vertical' : 'workflow-stage-horizontal',
      ]"
    >
      <div
        class="steps-panel tw-relative tw-bg-white tw-p-6 tw-rounded-2xl tw-shadow-card tw-border tw-border-slate-200"
      >
        <div class="optionsBtnArea tw-flex tw-flex-col tw-items-center">
          <el-button
            circle
            @click="resetWorkflow()"
            class="tw-shadow-sm reset-btn"
            title="重置"
          >
            <el-icon>
              <refresh-right />
            </el-icon>
          </el-button>
          <span
            class="tw-shadow-sm"
            v-if="
              true ||
              (stepData[activeStepIndex] && stepData[activeStepIndex].resultUrl)
            "
          >
            <el-button
              :disabled="
                !(
                  stepData[activeStepIndex] &&
                  stepData[activeStepIndex].resultUrl
                )
              "
              class="continue-btn"
              circle
              @click="continueWorkflow()"
              title="继续"
            >
              <el-icon>
                <el-icon>
                  <caret-right />
                </el-icon>
              </el-icon>
            </el-button>
          </span>
        </div>
        <div class="steps-scroll" ref="stepsScroll">
          <el-steps
            class="tw-w-full tw-relative custom-cyber-steps"
            :active="activeStepIndex"
            finish-status="success"
            :direction="isVerticalSteps ? 'vertical' : 'horizontal'"
            :align-center="!isVerticalSteps"
          >
            <el-step
              :class="[
                'tw-cursor-pointer',
                index === Number(activeStepIndex) ? 'activeStepItem' : '',
              ]"
              @click="refreshCurrentWorkflow(index)"
              v-for="(wf, index) in stepData"
              :key="index"
              :active="index === Number(activeStepIndex)"
              :status="getStepStuts(index)"
              :title="getLabel(wf.appId).slice(0, 5)"
            ></el-step>
          </el-steps>
        </div>
      </div>

      <div
        class="iframe-shell tw-bg-white tw-rounded-2xl tw-shadow-iframe tw-overflow-hidden tw-border tw-border-slate-200 iframe-glow"
      >
        <iframe
          ref="workflowFrame"
          :src="currentNodeUrl"
          class="tw-w-full tw-h-full tw-border-none"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          loading="lazy"
          @load="onWorkflowFrameLoad"
        >
        </iframe>
      </div>
    </div>

    <div
      v-else
      class="tw-py-16 tw-px-5 tw-max-w-5xl tw-mx-auto tw-bg-white tw-rounded-2xl tw-border-2 tw-border-dashed tw-border-slate-300 tw-mt-6 empty-panel"
    >
      <el-empty description="请在上方输入 Skill ID 以加载工作流">
        <template #image>
          <div
            class="tw-flex tw-items-center tw-justify-center tw-w-20 tw-h-20 tw-rounded-full tw-bg-[#F0F9FF] tw-mx-auto"
          >
            <i class="bi bi-diagram-3 tw-text-blue-300 tw-text-4xl"></i>
          </div>
        </template>
      </el-empty>
    </div>

    <el-dialog
      v-model="showAppConfig"
      title="可选 Skill 列表"
      width="400px"
      destroy-on-close
    >
      <div class="tw-flex tw-justify-between tw-mb-4" data-edit-id="64">
        <el-button
          type="primary"
          size="small"
          @click="addItem('apps')"
          data-edit-id="65"
          >新增 Skill</el-button
        >
        <el-button
          type="warning"
          size="small"
          plain
          @click="resetToDefault()"
          data-edit-id="102"
          >恢复默认</el-button
        >
      </div>
      <el-table :data="editingApps" border size="small" data-edit-id="66">
        <el-table-column label="Skill 名称" width="80px" data-edit-id="67">
          <template #default="scope">
            <el-input
              v-model="scope.row.label"
              size="small"
              data-edit-id="69"
            />
          </template>
        </el-table-column>
        <el-table-column label="Skill ID" data-edit-id="70">
          <template #default="scope">
            <el-input
              v-model="scope.row.value"
              size="small"
              data-edit-id="72"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" data-edit-id="73">
          <template #default="scope">
            <el-button
              type="danger"
              link
              @click="removeItem(scope.$index)"
              data-edit-id="75"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <div class="dialog-footer" data-edit-id="111">
          <el-button @click="showAppConfig = false" data-edit-id="112"
            >取消</el-button
          >
          <el-button
            type="primary"
            @click="handleConfirmDialog"
            data-edit-id="113"
          >
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "SmartSearchVerification",
  data() {
    return {
      title: "行业认知工作流",
      apps: [
        {
          value: "97de7ea5d065e96a6b71909f4768fac1",
          label: "研究报告",
        },
        {
          value: "dcd76a6c644295cdc29b33bdbe825017",
          label: "商业方案",
        },
        {
          value: "2d233c906f091e2f17385e4494fdd05f",
          label: "行业认知",
        },
        {
          value: "236d92571c458ed21469b9c4327be3fe",
          label: "长文章",
        },
        {
          value: "60116b5ffe98003395b70402748aeab6",
          label: "课程课件",
        },
      ],
      accountData: {
        workflow: [
          "236d92571c458ed21469b9c4327be3fe",
          "60116b5ffe98003395b70402748aeab6",
        ],
        appId: "2d233c906f091e2f17385e4494fdd05f",
        allLines: [],
      },
      isViewer: WebTool.urlQuery(location.href).isView === "1",
      stepData: [],
      currentNodeUrl: "",
      relationEditor: {
        tips: "编辑 Skill 节点依赖关系",
        url: "",
        className: "ElementVueItem",
      },
      flag:
        typeof WebTool !== "undefined"
          ? WebTool.adjustSize([false, false, true])
          : false,
      activeStepIndex: 0,
      showAppConfig: false,
      agentResults: [],
      editingApps: [],
      isExpanded: true,
      selectedNewNode: "",
      // 待转发给子 iframe 的消息缓存（子 iframe 尚未就绪时暂存，加载完成后统一下发）
      pendingChildMessages: [],
    };
  },
  watch: {
    "accountData.workflow": function (newValue, older) {
      this.currentNodeUrl = this.getUrl();
      this.initStepData();
    },
    "accountData.appId": function (newValue, older) {
      this.currentNodeUrl = this.getUrl();
      this.initStepData();
    },
    // 切换步骤后，在纵向布局下保证当前步骤始终可见
    activeStepIndex: function () {
      this.scrollActiveStepIntoView();
    },
  },
  computed: {
    // 编辑区域可调整节点（workflow）数量达到阈值时，步骤条切换为纵向布局：
    // PC 端阈值为 8（≥8 即切换），移动端（flag 为 true）阈值为 4（≥4 即切换）
    isVerticalSteps() {
      const threshold = this.flag ? 4 : 8;
      return (this.accountData.workflow || []).length >= threshold;
    },
  },
  methods: {
    newAgentDialog() {
      let app = {
        className: "ElementVueItem",
        task: {
          template: `<div class='tw-w-full tw-h-full'>
                  <iframe class='tw-w-full tw-h-full' src='https://agent.transweb.cn?headerHidden=true'></iframe>
                </div>`,
        },
      };
      webCpu.renderCardDialog(
        document.body,
        app,
        {
          title: "新增可用 Skill",
          titleStyle: {
            background: "var(--el-color-primary-light-9)",
            color: "var(--el-color-primary)",
          },
          closeType: "back",
          menu: [
            {
              label: "确认添加",
              action: () => {
                let iframe = app.task.container.querySelector("iframe");
                if (iframe) {
                  let url = iframe.contentWindow.location.href;
                  let params = WebTool.urlQuery(url);
                  if (params.id) {
                    this.apps.push({
                      value: params.id,
                      label: (iframe.contentDocument.title || params.id).slice(
                        0,
                        5
                      ),
                    });
                    this.$message.success("已添加 Skill: " + params.id);
                    webCpu.CardItem.dismissMask(document.body);
                  } else {
                    this.$message.error(
                      "未获取到有效的 Skill ID，请确认后重试"
                    );
                  }
                } else {
                  this.$message.error("未找到内嵌的 Skill 页面，请确认后重试");
                }
              },
            },
          ],
        },
        {
          width: "100%",
          maxWidth: "900px",
          height: this.flag ? "100%" : "90%",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 102, 204, 0.08)",
        }
      );
    },
    switchEditMode() {
      this.isViewer = false;
    },
    handleAddNode(val) {
      if (!val) return;
      this.accountData.workflow.push(val);
      this.selectedNewNode = ""; // 清空选择框，允许再次选择相同 ID 的节点

      this.initStepData();
    },
    removeNode(index) {
      this.accountData.workflow.splice(index, 1);
      this.initStepData();
    },
    moveNode(index, step) {
      const targetIndex = index + step;
      if (targetIndex < 0 || targetIndex >= this.accountData.workflow.length)
        return;

      // 交换位置
      const temp = this.accountData.workflow[index];
      this.accountData.workflow[index] = this.accountData.workflow[targetIndex];
      this.accountData.workflow[targetIndex] = temp;
      this.initStepData();
    },
    getStepStuts(index) {
      let ret = "";
      if (this.stepData[index].resultUrl) {
        ret = "success";
      } else if (index === Number(this.activeStepIndex)) {
        ret = "process";
      } else {
        ret = "wait";
      }
      return ret;
    },
    openAppItem(item) {
      let appId = item.value;
      window.open(`https://transweb.cn?id=${appId}`, "_blank");
    },
    updateInputData(stepIndex, dataId) {
      let arr = this.accountData.allLines;
      for (let i = 0; i < arr.length; i++) {
        let idx = arr[i].to;
        let from = arr[i].from;
        if (from === Number(stepIndex)) {
          arr[i].property = arr[i].property || [];
          if (dataId) {
            this.stepData[idx].inputData = this.stepData[idx].inputData || {};
            this.stepData[idx].inputData[from] = {
              label: this.getLabel(this.stepData[from].appId),
              dataId: dataId,
              property: arr[i].property,
            };
          }
        }
      }
    },
    startEditRelation() {
      let app = JSON.parse(JSON.stringify(this.relationEditor));
      // console.log("this.stepData: ", this.stepData);
      app.dsl = {
        data: {
          nodes: this.stepData.map((item) => {
            return {
              id: item.appId,
              name: this.getLabel(item.appId).slice(0, 5),
            };
          }),
          allLines: this.accountData.allLines,
        },
      };
      let callback = () => {
        this.accountData.allLines = app.card.task.vueItem.allLines || [];
        this.$message.success("Skill 依赖关系已更新成功。");
        webCpu.CardItem.dismissMask(document.body);
      };
      webCpu.renderCardDialog(document.body, app, {
        title: this.relationEditor.tips,
        closeType: "back",
        titleStyle: {
          background: "var(--el-color-primary-light-9)",
          color: "var(--el-color-primary)",
        },
        menu: [
          {
            label: "确认",
            action: callback,
          },
        ],
      });
    },
    handleEditingDialog() {
      this.editingApps = JSON.parse(JSON.stringify(this.apps));
      this.$nextTick(() => {
        this.showAppConfig = true;
      });
    },
    handleConfirmDialog() {
      this.apps = JSON.parse(JSON.stringify(this.editingApps));
      this.showAppConfig = false;
    },
    addItem() {
      this.editingApps.push({
        value: "",
        label: "新应用",
      });
    },
    resetToDefault() {
      this.$confirm(`确认要恢复初始列表吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.editingApps = JSON.parse(JSON.stringify(this.apps));
          this.$message.success("已恢复默认设置");
        })
        .catch(() => {});
    },
    removeItem(index) {
      this.editingApps.splice(index, 1);
    },
    continueWorkflow() {
      if (Number(this.activeStepIndex) >= this.stepData.length - 1) {
        this.$message.warning("没有更多步骤了");
        return;
      }
      let currentNode = this.stepData[this.activeStepIndex];
      if (currentNode.resultUrl) {
        let params = WebTool.urlQuery(currentNode.resultUrl);
        let dataId = params.dataId;
        if (dataId) {
          let nextNode = this.stepData[Number(this.activeStepIndex) + 1];
          if (nextNode) {
            this.currentNodeUrl = WebTool.attachParams(
              nextNode.currentNodeUrl,
              {
                inputItem: dataId,
                auto: true,
              }
            );
          }
        }
      } else {
        this.$message.warning(
          "当前步骤没有结果可展示，请先在下方完成当前步骤的操作"
        );
      }
    },
    handleTitleChange(e) {
      let elem = e.currentTarget;
      this.title = elem.innerText;
      document.title = elem.innerText;
    },
    resetWorkflow() {
      this.$confirm(
        "确定要重置当前执行结果和状态吗？",
        webCpu.messages[lang].confirmDialogTitle,
        {
          confirmButtonText: webCpu.messages[lang].confirmYes,
          cancelButtonText: webCpu.messages[lang].confirmNo,
          type: "warning",
        }
      ).then(() => {
        this.stepData = this.stepData.map((item) => {
          item.resultUrl = "";
          return item;
        });
        this.refreshCurrentWorkflow(0, "currentNodeUrl");
      });
    },
    initStepData() {
      let arr = this.accountData.workflow || [];
      this.stepData = [];
      this.agentResults = this.agentResults || [];
      // 与节点链路编辑区一致：按数组顺序逐一生成步骤，允许相同 ID 节点重复出现
      for (let i = 0; i < arr.length; i++) {
        let item = arr[i];
        this.stepData.push({
          appId: item,
          currentNodeUrl: this.getUrl(item, i + 1),
          resultUrl: this.isViewer
            ? this.agentResults[i + 1]
              ? this.agentResults[i + 1].resultUrl
              : ""
            : "",
          inputData: this.isViewer
            ? this.agentResults[i + 1]
              ? this.agentResults[i + 1].inputData || {}
              : {}
            : {},
        });
      }
      this.activeStepIndex = 0;
      this.stepData.unshift({
        appId: this.accountData.appId,
        currentNodeUrl: this.getUrl(this.accountData.appId, 0),
        resultUrl: this.isViewer
          ? this.agentResults[0]
            ? this.agentResults[0].resultUrl
            : ""
          : "",
        inputData: this.isViewer
          ? this.agentResults[0]
            ? this.agentResults[0].inputData || {}
            : {}
          : {},
      });
      this.currentNodeUrl = this.isViewer
        ? this.stepData[0].resultUrl || this.getUrl()
        : this.getUrl();

      //this.accountData.allLines = [];
    },
    exportWorkflow(type, isViewer) {
      // 导出时保持 accountData.workflow / stepData 的原始顺序与重复项，不做去重
      let config = {
        title: this.title,
        accountData: this.accountData,
        apps: this.apps,
      };
      if (type === "record") {
        config.isViewer = true;
        // 预览模式：agentResults 与 stepData 一一对应，同样保留重复节点
        config.agentResults = this.stepData.map((item) => {
          return {
            appId: item.appId,
            resultUrl: item.resultUrl,
            inputData: item.inputData || {},
          };
        });
      } else {
        config.isViewer = isViewer;
        config.agentResults = [];
      }
      let time = new Date()
        .toLocaleString()
        .replace(/\//g, "-")
        .replace(/:\s*/g, "-");
      let tName = `${config.title || "workflow"}-${time}.html`;
      WebTool.exportWorkflow(
        config,
        (name) => {
          this.$message.success("工作流已导出，文件名: " + name);
        },
        config.isViewer ? tName : ""
      );
    },
    refreshCurrentWorkflow(index, flag) {
      let url = "";
      if (!flag) {
        url =
          this.stepData[index].resultUrl || this.stepData[index].currentNodeUrl;
      } else {
        url = this.stepData[index][flag] || this.stepData[index].currentNodeUrl;
      }
      this.currentNodeUrl = WebTool.attachParams(url, {
        _t: new Date().getTime(),
      });

      this.activeStepIndex = index || 0;
    },
    // 纵向步骤条：将当前激活节点滚动到可视区域内（避免带动整个页面滚动）
    scrollActiveStepIntoView() {
      if (!this.isVerticalSteps) return;
      this.$nextTick(() => {
        const container = this.$refs.stepsScroll;
        if (!container) return;
        const activeEl = container.querySelector(".activeStepItem");
        if (!activeEl) return;
        const containerRect = container.getBoundingClientRect();
        const elRect = activeEl.getBoundingClientRect();
        if (elRect.top < containerRect.top || elRect.bottom > containerRect.bottom) {
          container.scrollTop +=
            elRect.top - containerRect.top - containerRect.height / 2 + elRect.height / 2;
        }
      });
    },
    getLabel(val) {
      val = val || "";
      const item = this.apps.find((a) => a.value === val);
      return item ? item.label : val.slice(0, 5);
    },
    getUrl(id, index) {
      let params = {
        headerHidden: true,
        workflow: this.accountData.workflow.join(","),
        id: id || this.accountData.appId,
        solo: true,
      };

      params.index =
        index !== undefined ? index : 0;

      let url = webCpu.documentPrefix;
      return typeof WebTool !== "undefined"
        ? WebTool.attachParams(url, params)
        : url;
    },
    initMessageBridge() {
      // 统一消息监听（初始化时注册一次，卸载时移除）：
      // 1) 子 iframe → 本组件：IFRAME_URL_CHANGE，同步工作流步骤状态
      // 2) 父窗口 → 子 iframe：转发父窗口消息（如 AGENT_INPUT）
      if (this._iframeMessageCallback) {
        window.removeEventListener("message", this._iframeMessageCallback);
        this._iframeMessageCallback = null;
      }
      const callback = (event) => {
        const data = event.data;
        if (!data) return;

        if (data.type === "IFRAME_URL_CHANGE") {
          this.handleIframeUrlChange(data.url);
          return;
        }

        // 仅当本组件被嵌入父窗口时，才把父窗口发来的特定类型消息转发给子 iframe
        if (
          window.parent !== window &&
          event.source === window.parent &&
          data.type === "AGENT_INPUT"
        ) {
          this.relayToChildIframe(data);
        }
      };
      window.addEventListener("message", callback);
      this._iframeMessageCallback = callback;
    },
    handleIframeUrlChange(currentUrl) {
      const iframe = this.$refs.workflowFrame;
      try {
        if (!iframe || !iframe.contentWindow) return;

        let params = WebTool.urlQuery(currentUrl);
        const inputItem = params.inputItem;
        const dataId = params.dataId;
        const stepIndex = Number(params.index) + 1;

        this.activeStepIndex = stepIndex;

        if (stepIndex < this.stepData.length + 1) {
          this.activeStepIndex = stepIndex;
          const node = this.stepData[stepIndex - 1] || {};
          const url = webCpu.documentPrefix;

          if (inputItem) {
            params.id = node.appId;
            params.dataId = inputItem;
            delete params.inputItem;
            params.index = stepIndex - 1;
            node.resultUrl = WebTool.attachParams(url, params);
          } else if (dataId) {
            params.id = this.stepData[stepIndex - 1].appId;
            params.index = stepIndex - 1;
            this.stepData[stepIndex - 1].resultUrl = WebTool.attachParams(
              url,
              params
            );
          }

          const tParams = WebTool.urlQuery(currentUrl);
          if (inputItem) {
            this.updateInputData(stepIndex - 1, inputItem);
            tParams.index = stepIndex;
            tParams.id = this.stepData[stepIndex].appId;
            if (this.stepData[stepIndex].inputData) {
              // 修复：直接写外层 tParams，避免此前内层 let 遮蔽导致 inputData 丢失
              tParams.inputData = JSON.stringify(
                this.stepData[stepIndex].inputData
              );
              delete tParams.inputItem;
            }
            currentUrl = WebTool.attachParams(webCpu.documentPrefix, tParams);
            iframe.src = currentUrl;
          }
        }
      } catch (e) {
        console.warn("捕获异常: ", e);
      }
    },
    workflowFrameOrigin() {
      const iframe = this.$refs.workflowFrame;
      const src = (iframe && iframe.src) || this.currentNodeUrl || "";
      try {
        return new URL(src, window.location.origin).origin;
      } catch (e) {
        return "*";
      }
    },
    relayToChildIframe(data) {
      const iframe = this.$refs.workflowFrame;
      if (!iframe || !iframe.contentWindow) {
        // 子 iframe 尚未就绪，先缓存，待 load 后统一下发
        this.pendingChildMessages.push(data);
        return;
      }
      try {
        iframe.contentWindow.postMessage(data, this.workflowFrameOrigin());
      } catch (e) {
        this.pendingChildMessages.push(data);
      }
    },
    flushPendingChildMessages() {
      const iframe = this.$refs.workflowFrame;
      if (
        !iframe ||
        !iframe.contentWindow ||
        !this.pendingChildMessages.length
      ) {
        return;
      }
      const pending = this.pendingChildMessages;
      this.pendingChildMessages = [];
      pending.forEach((msg) => {
        try {
          iframe.contentWindow.postMessage(msg, this.workflowFrameOrigin());
        } catch (e) {
          this.pendingChildMessages.push(msg);
        }
      });
    },
    onWorkflowFrameLoad() {
      this.flushPendingChildMessages();
    },
  },
  mounted() {
    this.initMessageBridge();
    this.initStepData();
  },
  beforeUnmount() {
    if (this._iframeMessageCallback) {
      window.removeEventListener("message", this._iframeMessageCallback);
      this._iframeMessageCallback = null;
    }
    const iframe = this.$refs.workflowFrame;
    if (iframe) {
      iframe.onload = null;
    }
  },
};
</script>

<style scoped>
.tw-bg-page-gradient {
  background: linear-gradient(160deg, #f0f9ff 0%, #EEF3F0 45%, #F6F9F7 100%);
  min-height: 100vh;
}

.tw-bg-blue-gradient {
  background: linear-gradient(135deg, #0066CC 0%, #38BDF8 100%);
}

.tw-shadow-icon {
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
}

.tw-shadow-card {
  box-shadow: 0 2px 16px rgba(0, 102, 204, 0.07), 0 1px 4px rgba(0, 0, 0, 0.04);
}

.tw-shadow-iframe {
  box-shadow: 0 8px 40px rgba(0, 102, 204, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06);
}

.tw-w-custom-160 {
  width: 160px !important;
}

.tw-w-custom {
  width: 240px !important;
}

.tw-h-30 {
  height: 30px !important;
  line-height: 30px !important;
}

.tw-h-viewer {
  height: 105vh !important;
}

.tw-max-w-900 {
  width: 100%;
  max-width: 900px !important;
}

.header-action-btn {
  border-color: #BAE6FD !important;
  color: #0066CC !important;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(8px);
  transition: all 0.2s ease !important;
}

.header-action-btn:hover {
  border-color: #7DD3FC !important;
  background: #f0f9ff !important;
  box-shadow: 0 0 0 3px rgba(125, 211, 252, 0.18) !important;
  transform: translateY(-1px) !important;
}

/* 3D Glossy Metallic AI Bot Head */
.tw-ai-bot-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  box-shadow: inset 0 2px 5px rgba(255, 255, 255, 0.4),
    inset 0 -3px 6px rgba(0, 0, 0, 0.6), 0 4px 10px rgba(56, 189, 248, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(56, 189, 248, 0.6);
  position: relative;
  overflow: hidden;
}

.tw-ai-bot-icon::after {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 60%
  );
  transform: rotate(45deg);
  pointer-events: none;
}

.tw-bot-icon-inner {
  color: #38BDF8;
  font-size: 18px;
  text-shadow: 0 0 8px #38BDF8, 0 0 15px #7DD3FC;
  z-index: 1;
}

.tw-drop-shadow-glow {
  filter: drop-shadow(0 0 4px rgba(56, 189, 248, 0.8));
}

/* Input Fields with Soft Inner Shadows and Glow */
.configuration-wrapper {
  background: #ffffff;
  border: 1px solid rgba(56, 189, 248, 0.3) !important;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.04),
    0 0 15px rgba(56, 189, 248, 0.1) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 50px;
}

.configuration-wrapper:hover {
  border-color: rgba(0, 102, 204, 0.5) !important;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.04),
    0 0 20px rgba(168, 85, 247, 0.15) !important;
}

.configuration-wrapper:focus-within {
  border-color: #0066CC !important;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.04),
    0 0 0 3px rgba(0, 102, 204, 0.2), 0 0 25px rgba(168, 85, 247, 0.25) !important;
}

/* Select Dropdown Tags Enhancement */
:deep(.el-select__tags .el-tag) {
  background: linear-gradient(135deg, #f0f9ff, #f6f9f7) !important;
  border: 1px solid rgba(56, 189, 248, 0.4) !important;
  box-shadow: inset 0 1px 3px rgba(255, 255, 255, 0.9),
    0 2px 5px rgba(0, 102, 204, 0.1) !important;
  color: #1e293b !important;
  border-radius: 8px !important;
  font-weight: 500;
  transition: all 0.2s ease;
}

:deep(.el-select__tags .el-tag:hover) {
  box-shadow: inset 0 1px 3px rgba(255, 255, 255, 0.9),
    0 3px 8px rgba(0, 102, 204, 0.2) !important;
  transform: translateY(-1px);
}

.custom-select-no-border :deep(.el-select__wrapper) {
  box-shadow: none !important;
  border: none !important;
  background: transparent !important;
  padding: 6px 8px !important;
}

.custom-select-no-border :deep(.el-select__wrapper:hover) {
  background: rgba(240, 249, 255, 0.5) !important;
  border-radius: 10px !important;
}

.mobile-select-bordered :deep(.el-select__wrapper) {
  border: 1px solid #e0f2fe !important;
  border-radius: 12px !important;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02) !important;
  padding: 6px 10px !important;
  transition: all 0.3s ease !important;
}

.mobile-select-bordered :deep(.el-select__wrapper:hover) {
  border-color: #7DD3FC !important;
  box-shadow: 0 0 0 3px rgba(125, 211, 252, 0.2) !important;
}

.mobile-select-bordered :deep(.el-select__wrapper.is-focused) {
  border-color: #0066CC !important;
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.2) !important;
}

/* 步骤面板：干净白底 + 发丝边框 + 柔和弥散阴影（Apple 风格） */
.steps-panel {
  background: #ffffff !important;
  border-color: rgba(0, 0, 0, 0.08) !important;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06) !important;
}

/* 步骤条（el-steps）左边距 */
.custom-cyber-steps {
  margin-left: 5px;
}

/* ===== 步骤条 + iframe 组合区域的响应式布局 ===== */
.workflow-stage {
  display: flex;
}

.workflow-stage-horizontal {
  flex-direction: column;
  gap: 1.5rem;
}

.workflow-stage-vertical {
  flex-direction: row;
  align-items: stretch;
  gap: 1rem;
  height: 105vh;
}

/* 横向模式：步骤面板右侧为绝对定位按钮区预留空间 */
.workflow-stage-horizontal .steps-panel {
  padding-right: 3rem;
}

/* 纵向模式：步骤面板固定宽度 140px，上边距为 0，与 iframe 同高，内部纵向滚动 */
.workflow-stage-vertical .steps-panel {
  width: 140px;
  flex-shrink: 0;
  height: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.steps-scroll {
  width: 100%;
}

.workflow-stage-vertical .steps-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
}

/* iframe 外壳：横向模式固定高度，纵向模式占满剩余空间 */
.iframe-shell {
  position: relative;
}

.workflow-stage-horizontal .iframe-shell {
  height: 105vh;
}

.workflow-stage-vertical .iframe-shell {
  flex: 1 1 auto;
  height: 100%;
  min-width: 0;
}

/* 纵向模式：操作按钮区改为顶部横向工具条（按钮同一行，上边距为 0） */
.workflow-stage-vertical .optionsBtnArea {
  position: static;
  height: auto;
  width: auto;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 8px;
  border-radius: 0;
  border-left: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding: 8px 0 8px 0;
  margin-bottom: 8px;
}

/* 纵向步骤条：图标容器与连接线适配竖排 */
.workflow-stage-vertical .custom-cyber-steps :deep(.el-step.is-vertical) {
  min-height: 44px;
  justify-content: center;
}

.workflow-stage-vertical .custom-cyber-steps :deep(.el-step__main) {
  display: none;
}

.workflow-stage-vertical .custom-cyber-steps :deep(.el-step.is-vertical .el-step__head) {
  width: 32px !important;
}

.workflow-stage-vertical .custom-cyber-steps :deep(.el-step.is-vertical .el-step__line) {
  width: 2px !important;
  height: auto !important;
  top: 0 !important;
  bottom: 0 !important;
  left: 15px !important;
  background: #E8E8ED !important;
}

.workflow-stage-vertical .custom-cyber-steps :deep(.el-step.is-vertical .el-step__head.is-success .el-step__line),
.workflow-stage-vertical .custom-cyber-steps :deep(.el-step.is-vertical .el-step__head.is-process .el-step__line) {
  background: #0071E3 !important;
}

/* --- Apple 风格 Timeline & Milestones（克制、清晰、柔和） --- */
.custom-cyber-steps :deep(.el-step__line) {
  background: #E8E8ED !important;
  height: 2px !important;
  top: 15px !important;
  border-radius: 1px !important;
  box-shadow: none !important;
  opacity: 1;
  transition: background 0.3s ease;
}

.custom-cyber-steps :deep(.el-step__head.is-success .el-step__line),
.custom-cyber-steps :deep(.el-step__head.is-process .el-step__line) {
  background: #0071E3 !important;
}

.custom-cyber-steps :deep(.el-step__icon) {
  width: 32px !important;
  height: 32px !important;
  border-radius: 50% !important;
  background: #ffffff !important;
  border: 1.5px solid #D2D2D7 !important;
  color: transparent !important;
  position: relative;
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
  box-shadow: none !important;
}

.custom-cyber-steps :deep(.el-step__icon-inner) {
  display: none !important;
}

/* 已完成：填充系统蓝 + 白色对勾 */
.custom-cyber-steps :deep(.el-step__head.is-success .el-step__icon) {
  background: #0071E3 !important;
  border-color: #0071E3 !important;
  box-shadow: 0 2px 6px rgba(0, 113, 227, 0.28) !important;
}

.custom-cyber-steps :deep(.el-step__head.is-success .el-step__icon::before) {
  content: "\F26A";
  font-family: "bootstrap-icons";
  color: #ffffff !important;
  font-size: 15px;
  font-weight: bold;
  text-shadow: none;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 进行中：白色圆圈 + 蓝色描边 + 中心蓝点 */
.custom-cyber-steps :deep(.el-step__head.is-process .el-step__icon) {
  background: #ffffff !important;
  border-color: #0071E3 !important;
  box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.12) !important;
  animation: none;
}

.custom-cyber-steps :deep(.el-step__head.is-process .el-step__icon::before) {
  content: "";
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #0071E3;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 步骤标题：次要灰 / 当前步近黑加粗 */
.custom-cyber-steps :deep(.el-step__title) {
  color: #6E6E73 !important;
  font-weight: 500 !important;
  font-size: 14px !important;
  transition: color 0.3s ease;
}

.custom-cyber-steps :deep(.activeStepItem .el-step__title) {
  color: #1D1D1F !important;
  font-weight: 600 !important;
}

.iframe-glow {
  position: relative;
}

.iframe-glow::before {
  content: "";
  position: absolute;
  inset: -1px;
  border-radius: 18px;
  background: linear-gradient(
    135deg,
    rgba(20, 184, 166, 0.15),
    rgba(0, 102, 204, 0.1),
    rgba(20, 184, 166, 0.08)
  );
  z-index: -1;
  pointer-events: none;
}

.empty-panel {
  background: linear-gradient(135deg, #ffffff 0%, #f6f9f7 100%) !important;
  transition: border-color 0.3s ease;
}

.empty-panel:hover {
  border-color: #BAE6FD !important;
}

.optionsBtnArea {
  position: absolute;
  z-index: 1000;
  right: 0px;
  height: 108px;
  width: 50px;
  text-align: center;
  top: 0px;
  gap: 8px;
  justify-content: center;
  background: rgba(255, 255, 255, 0.72) !important;
  border-radius: 0 16px 16px 0 !important;
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-left: 1px solid rgba(0, 0, 0, 0.06);
}

.reset-btn,
.continue-btn {
  transition: transform 0.2s ease, box-shadow 0.2s ease,
    background-color 0.2s ease, border-color 0.2s ease !important;
  border-color: rgba(0, 0, 0, 0.1) !important;
  color: #0071E3 !important;
  background: #ffffff !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08) !important;
}

.el-button[disabled] {
  border-color: rgba(0, 0, 0, 0.05) !important;
  color: #C7C7CC !important;
  background: #F5F5F7 !important;
  box-shadow: none !important;
  cursor: not-allowed !important;
}

.continue-btn:hover {
  transform: translateY(-1px) !important;
  border-color: #0071E3 !important;
  color: #0071E3 !important;
  box-shadow: 0 4px 14px rgba(0, 113, 227, 0.2) !important;
  background: #f5f9ff !important;
}

.reset-btn:hover {
  transform: translateY(-1px) !important;
  border-color: rgba(0, 0, 0, 0.16) !important;
  color: #0071E3 !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  background: #f5f5f7 !important;
}

/* Muse 风格统一：弹窗、主按钮、表单控件 */
:deep(.el-dialog) {
  border-radius: 16px !important;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.18) !important;
}

:deep(.el-dialog__header) {
  margin-right: 0;
  padding: 20px 24px 12px;
  border-bottom: 1px solid #EEF3F0;
}

:deep(.el-dialog__title) {
  font-weight: 700;
  font-size: 1.125rem;
  color: #0f172a;
}

:deep(.el-dialog__body) {
  padding: 20px 24px;
}

:deep(.el-dialog__footer) {
  padding: 12px 24px 20px;
  border-top: 1px solid #EEF3F0;
}

:deep(.el-button--primary) {
  --el-button-bg-color: #0066CC;
  --el-button-border-color: #0066CC;
  --el-button-hover-bg-color: #0052A3;
  --el-button-hover-border-color: #0052A3;
  --el-button-active-bg-color: #004C99;
  --el-button-active-border-color: #004C99;
  border-radius: 999px;
}

:deep(.el-select__wrapper),
:deep(.el-input__wrapper) {
  border-radius: 10px;
}

:deep(.el-tag) {
  --el-tag-bg-color: #f0f9ff;
  --el-tag-border-color: #BAE6FD;
  --el-tag-text-color: #0052A3;
}
</style>
