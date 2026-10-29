<template>
  <!-- 主容器：严格锁定 100vh，隐藏外层所有溢出 -->
  <div
    class="novelAppRoot tw-w-full tw-h-screen tw-max-w-6xl tw-mx-auto tw-p-4 tw-font-sans tw-flex tw-flex-col tw-overflow-hidden"
  >
    <!-- 顶部 Header（标题 + 主步骤条右对齐） -->
    <div
      class="novel-header tw-flex-none tw-mb-3 tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-y-2 tw-border-b tw-border-slate-200 tw-pb-2.5"
    >
      <div class="novel-header__title tw-flex tw-items-center tw-gap-3 tw-shrink-0">
        <div class="novel-logo">
          <i class="bi bi-journal-richtext"></i>
        </div>
        <div class="tw-flex tw-flex-col tw-justify-center">
          <h3 class="tw-text-base tw-font-bold tw-text-slate-800 tw-m-0 tw-whitespace-nowrap tw-leading-tight">
            长篇小说创作工作台
          </h3>
          <span class="tw-text-[11px] tw-text-slate-400 tw-mt-0.5 tw-whitespace-nowrap">
            结构规划 · 智能分集 · 逐集生成
          </span>
        </div>
      </div>

      <!-- 主步骤条（小说规划 → 分集生成）+ 项目数据导入/导出（右对齐） -->
      <div class="novel-header__actions tw-flex tw-items-center tw-gap-2 tw-ml-4 tw-shrink-0">
        <div v-if="started" class="tw-flex tw-items-center tw-gap-3">
          <el-button
            size="small"
            text
            class="back-btn"
            title="返回输入设置"
            @click="handleBack"
          >
            <i class="el-icon-back"></i> 返回
          </el-button>
          <div class="main-steps">
            <span
              class="main-step"
              :class="{ 'is-active': activeMainStep === 0 }"
              @click="switchMainStep(0)"
              >小说规划</span
            >
            <span class="main-step-arrow">→</span>
            <span
              class="main-step"
              :class="{
                'is-active': activeMainStep === 1,
                'is-disabled': !planningDone,
              }"
              @click="switchMainStep(1)"
              >分集生成</span
            >
          </div>
        </div>
        <span v-else class="tw-text-[11px] tw-font-mono tw-text-slate-400"
          >TransWeb Engine Integrated</span
        >

        <!-- 导出项目：工作流面板显示时展示 -->
        <el-button
          v-if="started"
          size="small"
          :disabled="!canExportProject"
          title="导出项目数据（JSON）"
          @click="exportProject"
        >
          <i class="el-icon-download"></i> 导出项目
        </el-button>

        <!-- 读取：初始化选文件界面时展示 -->
        <template v-if="!started">
          <el-button
            size="small"
            title="读取项目数据（JSON）"
            @click="importProject"
          >
            <i class="el-icon-upload2"></i> 读取
          </el-button>
          <input
            ref="projectFileInput"
            type="file"
            accept=".json,application/json"
            class="doc-hidden-input"
            @change="handleProjectFileChange"
          />
        </template>
      </div>
    </div>

    <!-- 1. 操作区：文档选择 + 集数/字数设定 + 确认按钮（确认后隐藏，可通过「返回」重新显示） -->
    <div v-if="!started" class="tw-flex-none tw-mb-3">
      <div class="novel-setup-card">
        <div class="novel-setup-card__header">
          <span class="novel-setup-card__title">
            <i class="bi bi-sliders2"></i>创作设定
          </span>
          <span class="novel-setup-card__badge">上传素材 · 设定集数 · 一键生成</span>
        </div>
        <div class="novel-setup-card__body">
        <!-- 本地文档选择（类似 agentCreator 的点击选择 + 拖拽） -->
        <div
          class="doc-dropzone"
          :class="{
            'doc-dropzone--active': !!selectedDoc,
            'doc-dropzone--dragging': dragDepth > 0,
          }"
          :disabled="confirming"
          @click="triggerFilePicker"
          @dragenter.prevent="onDragEnter"
          @dragover.prevent
          @dragleave.prevent="onDragLeave"
          @drop.prevent="onDrop"
        >
          <i
            class="el-icon-upload2 doc-dropzone__icon"
            :class="{ 'is-active': !!selectedDoc }"
          ></i>

          <div v-if="parsingFile" class="doc-dropzone__text">
            <span class="doc-dropzone__action">正在解析文档…</span>
          </div>
          <div v-else-if="!selectedDoc" class="doc-dropzone__text">
            <span class="doc-dropzone__action">点击选择本地文档</span>
            <span class="doc-dropzone__hint"
              >支持 .md / .txt / .pdf / .docx，≤20MB</span
            >
          </div>
          <div v-else class="doc-dropzone__text">
            <span class="doc-dropzone__name">{{ selectedDoc.name }}</span>
            <span class="doc-dropzone__hint">
              ({{ formatSize(selectedDoc.size) }}) · 点击重新选择
            </span>
          </div>
        </div>

        <!-- 隐藏的原生文件输入 -->
        <input
          ref="fileInput"
          type="file"
          class="doc-hidden-input"
          accept=".md,.txt,.pdf,.docx"
          @change="handleFileChange"
        />

        <!-- 集数设定 -->
        <div class="tw-flex tw-items-center tw-gap-1.5">
          <span class="tw-text-xs tw-text-slate-500 tw-whitespace-nowrap"
            >集数</span
          >
          <el-input-number
            v-model="episodeCount"
            :min="1"
            :max="200"
            :step="1"
            size="small"
            :disabled="confirming"
            class="num-input"
          />
        </div>

        <!-- 每集字数设定 -->
        <!-- <div class="tw-flex tw-items-center tw-gap-1.5">
          <span class="tw-text-xs tw-text-slate-500 tw-whitespace-nowrap"
            >每集字数</span
          >
          <el-input-number
            v-model="wordsPerEpisode"
            :min="500"
            :max="20000"
            :step="500"
            size="small"
            :disabled="confirming"
            class="num-input"
          />
        </div> -->

        <el-button
          type="primary"
          size="small"
          :loading="confirming"
          :disabled="!canConfirm"
          class="!tw-px-6 !tw-font-medium confirmNovelBtn"
          @click="handleConfirm"
        >
          确认
        </el-button>
        </div>
      </div>
    </div>

    <!-- 状态提示框 + 继续按钮（始终显示，确认后仍可见） -->
    <div class="status-bar tw-flex-none tw-mb-3 tw-flex tw-flex-wrap tw-items-center tw-gap-2">
      <div
        v-if="statusMessage"
        class="tw-px-3 tw-py-1.5 tw-rounded-md tw-text-xs tw-flex tw-items-center tw-gap-2 tw-transition-all"
        :class="{
          'tw-bg-emerald-50 tw-text-emerald-700 tw-border tw-border-emerald-200':
            statusType === 'success',
          'tw-bg-rose-50 tw-text-rose-700 tw-border tw-border-rose-200':
            statusType === 'error',
          'tw-bg-[#f0f9ff] tw-text-[#0052a3] tw-border tw-border-[#bae6fd]':
            statusType === 'info',
        }"
      >
        <i
          :class="{
            'el-icon-circle-check': statusType === 'success',
            'el-icon-warning': statusType === 'error',
            'el-icon-info': statusType === 'info',
          }"
        ></i>
        <span>{{ statusMessage }}</span>
      </div>

      <el-button
        v-if="planningDone && activeMainStep === 0"
        type="primary"
        size="small"
        class="!tw-px-4 !tw-font-medium continueNovelBtn"
        @click="handleContinue"
      >
        继续 <i class="el-icon-right"></i>
      </el-button>

      <div
        v-if="activeMainStep === 1"
        class="tw-ml-auto tw-flex tw-items-center tw-gap-2"
      >
        <el-button
          size="small"
          :disabled="!canGoPrevEpisode"
          @click="handlePrevEpisode"
        >
          <i class="el-icon-arrow-left"></i> 上一集
        </el-button>
        <el-button
          size="small"
          :disabled="!canGoNextEpisode"
          @click="handleNextEpisode"
        >
          下一集 <i class="el-icon-arrow-right"></i>
        </el-button>
        <el-button
          size="small"
          :disabled="!canExport"
          @click="handleExport"
        >
          <i class="el-icon-download"></i> 导出 ({{ exportableCount }})
        </el-button>
      </div>
    </div>

    <!-- 2. 主内容展示区（占用剩余所有空间） -->
    <div class="tw-flex-1 tw-min-h-0 tw-flex tw-flex-col">
      <!-- 视图 A：默认空数据提示（Hero 空状态 + 三步引导） -->
      <div v-if="!started" class="novel-empty-state">
        <div class="novel-empty-state__icon">
          <i class="bi bi-journal-text"></i>
        </div>
        <h2 class="novel-empty-state__title">开始创作你的长篇小说</h2>
        <p class="novel-empty-state__desc">
          上传本地素材，设定目标集数，工作台将自动完成结构规划与逐集正文生成
        </p>
        <div class="novel-empty-state__steps">
          <div class="novel-step-hint">
            <span class="novel-step-hint__num">1</span>
            <span class="novel-step-hint__label">上传素材</span>
            <i class="bi bi-cloud-arrow-up novel-step-hint__icon"></i>
          </div>
          <div class="novel-step-hint novel-step-hint--arrow">
            <i class="bi bi-arrow-right novel-step-hint__arrow"></i>
          </div>
          <div class="novel-step-hint">
            <span class="novel-step-hint__num">2</span>
            <span class="novel-step-hint__label">设定集数</span>
            <i class="bi bi-hash novel-step-hint__icon"></i>
          </div>
          <div class="novel-step-hint novel-step-hint--arrow">
            <i class="bi bi-arrow-right novel-step-hint__arrow"></i>
          </div>
          <div class="novel-step-hint">
            <span class="novel-step-hint__num">3</span>
            <span class="novel-step-hint__label">逐集生成</span>
            <i class="bi bi-magic novel-step-hint__icon"></i>
          </div>
        </div>
      </div>

      <!-- 视图 B：确认后 —— 步骤切换显示区域（主步骤条已移至顶部 Header） -->
      <div
        v-else
        class="tw-w-full tw-h-full tw-flex tw-flex-col tw-border tw-border-slate-200 tw-rounded-lg tw-overflow-hidden tw-bg-white tw-shadow-sm"
      >
        <!-- 步骤切换显示区域 -->
        <div class="tw-flex-1 tw-min-h-0 tw-relative">
          <!-- 步骤一：小说规划（显示工作流 code.vue 组件） -->
          <div
            v-show="activeMainStep === 0"
            class="tw-absolute tw-inset-0 tw-flex tw-flex-col"
          >
            <div
              ref="planningWorkflow"
              class="workflow-host tw-w-full tw-h-full"
            ></div>
          </div>

          <!-- 步骤二：分集生成（纵向集数步骤条 + 工作流 code.vue 组件） -->
          <div
            v-show="activeMainStep === 1"
            class="episode-layout tw-absolute tw-inset-0 tw-flex tw-flex-row tw-gap-3 tw-p-3"
          >
            <!-- 纵向集数步骤条（左侧固定宽度，内部纵向滚动） -->
            <div
              class="episode-steps-panel tw-flex-none tw-flex tw-flex-col tw-bg-white tw-border tw-border-slate-200 tw-rounded-lg tw-overflow-hidden tw-shadow-sm"
            >
              <div
                class="episode-panel-header tw-flex-none tw-px-3 tw-py-2 tw-border-b tw-border-slate-100 tw-flex tw-items-center tw-justify-between tw-text-xs tw-text-slate-400 tw-select-none"
              >
                <span class="tw-font-medium">分集步骤</span>
                <span class="tw-font-mono">{{ episodeList.length }} 集</span>
              </div>
              <div
                class="episode-steps-scroll tw-flex-1 tw-min-h-0 tw-overflow-y-auto tw-px-1 tw-py-2"
              >
                <el-steps
                  finish-status="success"
                  direction="vertical"
                  class="episode-steps"
                >
                  <el-step
                    v-for="(ep, i) in episodeList"
                    :key="ep.id + '-' + i"
                    :title="ep.title"
                    :description="ep.id"
                    :status="ep.status"
                    :class="activeEpisodeIndex === i ? 'activeEpisodeItem' : ''"
                    @click="switchEpisode(i)"
                  ></el-step>
                </el-steps>
              </div>
            </div>

            <!-- 分集生成工作流 -->
            <div class="tw-flex-1 tw-min-w-0 tw-flex tw-flex-col">
              <div
                v-if="activeEpisode"
                class="tw-flex-none tw-px-1 tw-pb-2 tw-flex tw-items-center tw-gap-2"
              >
                <span
                  v-if="episodeGenerating"
                  class="tw-flex-none tw-text-[11px] tw-text-[#0052a3] tw-flex tw-items-center tw-gap-1.5"
                >
                  <i class="el-icon-loading"></i>
                  正在生成中…
                </span>
                <span v-else class="tw-text-[11px] tw-text-slate-400 tw-truncate">
                  当前分集：<span class="tw-font-mono tw-text-[#0052a3]">{{
                    activeEpisode.id
                  }}</span>
                </span>
                <div
                  class="tw-ml-auto tw-flex tw-items-center tw-gap-2 tw-shrink-0"
                >
                  <el-button
                    size="small"
                    type="primary"
                    class="!tw-px-4 !tw-font-medium"
                    :disabled="episodeGenerating"
                    @click="startEpisodeGeneration"
                  >
                    <i
                      :class="
                        isActiveEpisodeDone
                          ? 'el-icon-refresh'
                          : 'el-icon-caret-right'
                      "
                    ></i>
                    {{ isActiveEpisodeDone ? "重新生成" : "开始生成" }}
                  </el-button>
                </div>
              </div>
              <div
                ref="episodeWorkflow"
                class="workflow-host tw-flex-1 tw-min-h-0"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "LongNovelWorkbench",

  emits: ["confirm"],

  data() {
    // 局部变量：长篇小说业务 Skill 库（value 为 Skill ID，key 为语义标识，label 用于界面展示）
    const NOVEL_SKILLS = [
      { key: "material", value: "b991dbed9e44e1c85ba710a5821ac531", label: "素材知识库" },
      { key: "structure", value: "538b02f7fe3c6de28812e2789147b858", label: "小说结构规划" },
      { key: "taskBook", value: "758ed4ef99bc34c61efde98777854fd6", label: "分集任务书生成" },
      { key: "chapter", value: "a36fbd6735b21f9305a273a950fc134a", label: "章节正文生成" },
      { key: "quality", value: "2c6b2e1bd7702cfb37eb88f2a1a4be99", label: "质检章节正文" },
      { key: "polish", value: "00015696c5f072161483b5583500cd1f", label: "润色章节正文" },
    ];

    // 局部变量：根据 NOVEL_SKILLS 初始化 SKILL（语义标识 → Skill ID 映射）
    const SKILL = {};
    NOVEL_SKILLS.forEach((item) => {
      SKILL[item.key] = item.value;
    });

    return {
      // —— 输入区 ——
      // 本地文档（类似 agentCreator）：{ name, size, rawFile, content }
      selectedDoc: null,
      parsingFile: false,
      dragDepth: 0,
      episodeCount: 12,
      wordsPerEpisode: 3000,
      confirming: false,
      started: false,

      // —— 状态提示 ——
      statusMessage: "",
      statusType: "info",

      // —— 主区域步骤条 ——
      activeMainStep: 0,
      planningDone: false,

      // —— 分集生成 ——
      // episodeList 项结构：{ id, title, raw, status: 'wait'|'process'|'success', results: { agentResults, finalContent } }
      episodeList: [],
      activeEpisodeIndex: 0,
      activeEpisode: null,
      // 分集生成工作流当前已渲染的集索引（用于按集还原）
      episodeRenderedFor: -1,
      // 当前分集是否正在生成（生成中禁用「开始生成/重新生成」按钮）
      episodeGenerating: false,

      // 小说规划各节点结果缓存（供分集生成输入组合使用）
      planningResults: {
        material: null, // 素材知识库结果
        structure: null, // 小说结构规划结果
        taskBook: null, // 分集任务书（完整）
      },

      // —— Skill 配置（局部变量，SKILL 由 NOVEL_SKILLS 初始化）——
      NOVEL_SKILLS,
      SKILL,

      // 分集生成工作流节点依赖：润色节点(索引2)同时接收章节正文(索引0)与质检(索引1)结果
      episodeAllLines: [
        { from: 0, to: 2, property: [] },
        { from: 1, to: 2, property: [] },
      ],

      // —— 工作流实例引用（挂载后的 code.vue Vue 实例）——
      workflowRefs: {
        planning: null,
        episode: null,
      },
      // 挂载后的 code.vue Vue 应用实例（用于 force 重挂载前 unmount 清理消息监听）
      workflowApps: {
        planning: null,
        episode: null,
      },
      // 是否已完成首次渲染（避免重复挂载）
      rendered: {
        planning: false,
        episode: false,
      },

      // 小说规划结果地址（最后一个节点 resultUrl，含 dataId）
      planningResultUrl: "",
      // 小说规划工作流执行记录（用于切回规划面板时还原显示，避免重新触发自动生成）
      planningAgentResults: [],
      // mitt 监听句柄（用于移除监听）
      _onWorkflowNodeCompleted: null,
    };
  },

  computed: {
    canConfirm() {
      return (
        !!this.selectedDoc &&
        !!this.selectedDoc.content &&
        this.episodeCount >= 1 &&
        this.wordsPerEpisode >= 1
      );
    },

    // 当前分集是否已完成生成（有结果 → 显示「重新生成」，否则「开始生成」）
    isActiveEpisodeDone() {
      const ep = this.activeEpisode;
      return !!(
        ep &&
        ep.results &&
        Array.isArray(ep.results.agentResults) &&
        ep.results.agentResults.length
      );
    },

    canGoPrevEpisode() {
      return this.activeEpisodeIndex > 0;
    },

    canGoNextEpisode() {
      const next = this.episodeList[this.activeEpisodeIndex + 1];
      return !!(next && (next.status === "success" || next.status === "process"));
    },

    // 当前可导出的分集数（已有生成正文的分集）
    exportableCount() {
      return this.episodeList.filter(
        (ep) => ep.results && ep.results.finalContent
      ).length;
    },

    // 是否存在已生成的分集正文可导出
    canExport() {
      return this.exportableCount > 0;
    },

    // 是否有项目数据可导出（启动后即存在项目数据）
    canExportProject() {
      return this.started;
    },
  },

  methods: {
    /* ============================================================
     * 输入区 —— 本地文档选择（类似 agentCreator）
     * ============================================================ */

    triggerFilePicker() {
      if (this.confirming) return;
      this.$refs.fileInput && this.$refs.fileInput.click();
    },

    handleFileChange(e) {
      const file = e.target.files && e.target.files[0];
      if (file) this.validateAndSelect(file);
      // 允许重复选择同一文件
      e.target.value = "";
    },

    onDragEnter() {
      this.dragDepth += 1;
    },

    onDragLeave() {
      this.dragDepth = Math.max(0, this.dragDepth - 1);
    },

    onDrop(e) {
      this.dragDepth = 0;
      const file = e.dataTransfer && e.dataTransfer.files[0];
      if (file) this.validateAndSelect(file);
    },

    async validateAndSelect(file) {
      const allowed = [".md", ".txt", ".pdf", ".docx", ".doc"];
      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      if (!allowed.includes(ext)) {
        this.setStatus(
          "不支持的文件类型：" + ext + "（支持 .md / .txt / .pdf / .docx）",
          "error"
        );
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        this.setStatus("文件超过 20MB 大小限制", "error");
        return;
      }

      this.parsingFile = true;
      this.setStatus("正在解析文档…", "info");

      const suffix = (file.name.split(".").pop() || "").toLowerCase();
      try {
        let content = "";
        if (suffix !== "txt" && suffix !== "md" && suffix !== "html") {
          // 二进制/富文本类（pdf / docx / doc）：走运行时抽取
          if (
            typeof WebTool !== "undefined" &&
            typeof WebTool.extractTextFromFile === "function"
          ) {
            content = await WebTool.extractTextFromFile(file);
          } else {
            throw new Error("运行环境缺少 extractTextFromFile");
          }
        } else {
          // 文本类文件：按 UTF-8 读取
          content = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target.result);
            reader.onerror = () => reject(new Error("read fail"));
            reader.readAsText(file, "utf-8");
          });
        }

        this.selectedDoc = {
          name: file.name,
          size: file.size,
          rawFile: file,
          content: content,
        };
        this.setStatus("已选择文档：" + file.name, "success");
      } catch (err) {
        this.selectedDoc = null;
        const msg =
          typeof err === "string"
            ? err
            : err && err.message
            ? err.message
            : "未知错误";
        this.setStatus("文档解析失败：" + msg, "error");
      } finally {
        this.parsingFile = false;
      }
    },

    formatSize(bytes) {
      if (bytes == null) return "";
      if (bytes < 1024) return bytes + " B";
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
      return (bytes / 1024 / 1024).toFixed(1) + " MB";
    },

    handleConfirm() {
      if (!this.canConfirm || this.confirming) return;
      if (!this.selectedDoc || !this.selectedDoc.content) {
        this.setStatus("请先选择本地素材文档", "error");
        return;
      }
      if (this.episodeCount < 1) {
        this.setStatus("集数至少为 1", "error");
        return;
      }

      // 已启动：仅重置分集设定与状态；工作流本身可用 code.vue 面板内的「重置」按钮重跑
      if (this.started) {
        this.buildEpisodeListFromCount();
        this.planningDone = false;
        this.activeMainStep = 0;
        this.setStatus(
          "已按最新集数重置分集设定；如需重跑工作流，请使用工作流面板内的「重置」按钮",
          "info"
        );
        return;
      }

      this.confirming = true;
      this.setStatus("正在初始化创作工作台...", "info");

      try {
        // 初始化分集列表（优先依据集数设定，待小说规划完成后由分集任务书覆盖）
        this.buildEpisodeListFromCount();
        this.planningDone = false;
        this.activeMainStep = 0;
        this.started = true;

        this.$nextTick(() => {
          this.renderPlanningWorkflow();
          this.confirming = false;
          this.setStatus(
            "创作工作台已就绪，正在执行「小说规划」工作流...",
            "info"
          );
          localStorage.agentInput = this.selectedDoc.content || "";
          this.$emit("confirm", {
            docName: this.selectedDoc.name,
            docSize: this.selectedDoc.size,
            docContent: this.selectedDoc.content,
            episodeCount: this.episodeCount,
            wordsPerEpisode: this.wordsPerEpisode,
          });
        });
      } catch (err) {
        this.confirming = false;
        const msg =
          typeof err === "string"
            ? err
            : err && err.message
            ? err.message
            : "未知错误";
        this.setStatus("初始化失败：" + msg, "error");
      }
    },

    /* ============================================================
     * 返回输入区（确认后隐藏输入区，可返回重新设定）
     * ============================================================ */

    handleBack() {
      // 点击「返回」先提醒确认，确认后再执行真正的返回逻辑
      const doBack = () => this.doHandleBack();
      if (typeof this.$confirm === "function") {
        this.$confirm(
          "返回后将退出当前创作工作台，当前工作流进度将丢失。确定要返回吗？",
          "提示",
          {
            confirmButtonText: "确定返回",
            cancelButtonText: "取消",
            type: "warning",
          }
        )
          .then(doBack)
          .catch(() => {});
      } else {
        // 运行环境缺少 $confirm 时兜底直接返回
        doBack();
      }
    },

    doHandleBack() {
      // 重置状态，回到输入区（保留已选择的文档与集数/字数设定）
      this.started = false;
      this.planningDone = false;
      this.planningResultUrl = "";
      this.planningAgentResults = [];
      this.activeMainStep = 0;
      this.activeEpisodeIndex = 0;
      this.episodeRenderedFor = -1;
      this.episodeGenerating = false;
      this.planningResults = { material: null, structure: null, taskBook: null };
      // 卸载两个工作流实例（清理 code.vue 消息监听），确保再次「确认」时能干净重挂载
      this.destroyWorkflow("planning");
      this.destroyWorkflow("episode");
      this.setStatus("已返回，可重新选择文档与设定", "info");
    },

    /* ============================================================
     * 主区域步骤条切换
     * ============================================================ */

    switchMainStep(index) {
      if (index === this.activeMainStep) return;
      if (index === 1 && !this.planningDone) {
        this.setStatus(
          "请先完成「小说规划」工作流，再进入「分集生成」",
          "info"
        );
        return;
      }
      // 进入分集生成前，若规划结果尚未缓存，先走 handleContinue 拉取
      if (
        index === 1 &&
        !this.planningResults.structure &&
        !this.planningResults.taskBook
      ) {
        this.handleContinue();
        return;
      }
      this.activeMainStep = index;
      if (index === 0) {
        // 切回小说规划：有执行记录则还原显示（强制重挂载），无记录则走首次渲染
        this.renderPlanningWorkflow(this.planningAgentResults.length > 0);
      } else if (index === 1) {
        this.activateCurrentEpisode();
      }
    },

    switchEpisode(index) {
      if (index === this.activeEpisodeIndex) return;
      const target = this.episodeList[index];
      if (!target) return;
      // 只有成功或被点亮的节点可以切换到相应分集工作流
      if (target.status !== "success" && target.status !== "process") {
        this.setStatus("当前工作流暂时无法启动，需上一个工作流先完成", "info");
        return;
      }
      this.activeEpisodeIndex = index;
      this.activeEpisode = target;
      this.episodeGenerating = false;
      this.setStatus("已切换到 " + target.id, "info");
      // 激活当前分集：无执行记录则自动执行，有记录则还原并显示最后一个节点
      this.activateCurrentEpisode();
    },

    handlePrevEpisode() {
      if (!this.canGoPrevEpisode) return;
      this.switchEpisode(this.activeEpisodeIndex - 1);
    },

    handleNextEpisode() {
      if (!this.canGoNextEpisode) return;
      this.switchEpisode(this.activeEpisodeIndex + 1);
    },

    /* ============================================================
     * 工作流渲染（复用 code.vue 执行引擎）
     * ============================================================ */

    // 小说规划工作流：素材知识库 → 小说结构规划 → 分集任务书生成
    // 无执行记录时以编辑态渲染并自动执行；有执行记录时还原记录并定位到最后节点（不触发自动生成）
    renderPlanningWorkflow(force) {
      if (this.rendered.planning && !force) return;
      const hasRecords = !!(
        Array.isArray(this.planningAgentResults) &&
        this.planningAgentResults.length
      );
      this.renderWorkflow(
        "planning",
        {
          title: "小说规划",
          apps: this.NOVEL_SKILLS,
          isViewer: true,
          // 有执行记录时还原显示（不自动生成），否则为空以自动执行
          agentResults: hasRecords ? this.planningAgentResults : [],
          initialStepIndex: hasRecords ? -1 : 0,
          // 第三个节点（分集任务书生成，节点索引 2）的集数参照，以 episode_count 属性的值注入输入
          lastLevelInput: {
            2: { episode_count: this.episodeCount },
          },
          accountData: {
            appId: this.SKILL.material,
            workflow: [this.SKILL.structure, this.SKILL.taskBook],
            allLines: [],
          },
        },
        force
      );
    },

    // 分集生成工作流：章节正文生成 → 质检章节正文 → 润色章节正文
    // force=true 时强制按当前集重新挂载（用于切换分集 / 还原结果）
    renderEpisodeWorkflow(force) {
      const index = this.activeEpisodeIndex;
      const episode = this.episodeList[index];
      if (!episode) return;
      if (!force && this.rendered.episode && this.episodeRenderedFor === index) {
        return;
      }

      // 面板展示不应自动执行工作流：清理残留 agentInput，避免 code.vue 读到上一集输入误触发 auto=true。
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("agentInput");
      }

      // 已完成的分集：以预览模式还原结果并定位到最后一个节点；否则编辑态
      const hasResults = this.hasEpisodeResults(episode);

      this.renderWorkflow(
        "episode",
        {
          title: "分集生成 · " + episode.id,
          apps: this.NOVEL_SKILLS,
          isViewer: true,
          agentResults: hasResults ? episode.results.agentResults : [],
          // 有执行记录时初始展示最后一个节点（润色章节正文）
          initialStepIndex: hasResults ? -1 : 0,
          accountData: {
            appId: this.SKILL.chapter,
            workflow: [this.SKILL.quality, this.SKILL.polish],
            allLines: this.episodeAllLines,
          },
        },
        force
      );
      this.episodeRenderedFor = index;
    },

    // 判断某分集是否存在执行记录
    hasEpisodeResults(episode) {
      return !!(
        episode &&
        episode.results &&
        Array.isArray(episode.results.agentResults) &&
        episode.results.agentResults.length
      );
    },

    // 激活当前分集：无执行记录则自动立即执行；有记录则还原并显示最后一个节点
    activateCurrentEpisode() {
      const episode = this.activeEpisode;
      if (!episode) return;
      if (this.hasEpisodeResults(episode)) {
        this.renderEpisodeWorkflow(true);
      } else {
        this.startEpisodeGeneration();
      }
    },

    // 核心：将 code.vue 以 ElementVueItem 运行态 SFC 挂载到容器，注入工作流配置
    // key 为逻辑标识（"planning" | "episode"），对应容器 ref 为 key + "Workflow"
    renderWorkflow(key, config, force) {
      if (
        typeof webCpu === "undefined" ||
        typeof webCpu.updateView !== "function"
      ) {
        this.setStatus("运行环境缺少 webCpu，无法加载工作流引擎", "error");
        return;
      }
      const container = this.$refs[key + "Workflow"];
      if (!container) return;
      if (!force && container.__novelRendered) return;

      // 强制重挂载：先卸载旧 code.vue 实例（触发 beforeUnmount 移除消息监听），
      // 避免残留旧实例继续监听 window message / mitt 事件导致重复响应
      if (force) {
        this.destroyWorkflow(key);
      }
      container.__novelRendered = true;

      const option = {
        url: webCpu.documentPrefix + "/workflow/code.vue",
        data: config,
        callback: (c, d, t) => {
          // 捕获 code.vue 的 Vue 实例与应用实例，供后续读取状态与卸载清理
          const vm =
            (t && t.vueItem) || (d && d.task && d.task.vueItem) || null;
          const app =
            (t && t.currentApp) || (d && d.task && d.task.currentApp) || null;
          this.workflowRefs[key] = vm;
          this.workflowApps[key] = app;
          this.rendered[key] = true;
        },
      };
      webCpu.updateView(container, option);
    },

    // 卸载并清理某个工作流实例（释放 code.vue 的 window 消息监听与引用）
    destroyWorkflow(key) {
      const app = this.workflowApps[key];
      if (app && typeof app.unmount === "function") {
        try {
          // app.unmount() 会触发 code.vue 的 beforeUnmount，
          // 在其中 removeEventListener("message", ...) 解除消息监听
          app.unmount();
        } catch (e) {
          console.warn("[longNovel] 卸载旧工作流实例失败:", key, e);
        }
      }
      this.workflowApps[key] = null;
      this.workflowRefs[key] = null;
      this.rendered[key] = false;

      const container = this.$refs[key + "Workflow"];
      if (container) {
        container.innerHTML = "";
        delete container.__novelRendered;
      }
    },

    /* ============================================================
     * 分集任务书 / 分集列表
     * ============================================================ */

    // 依据集数设定生成占位分集列表（EP001...）
    buildEpisodeListFromCount() {
      this.episodeList = Array.from({ length: this.episodeCount }, (_, i) => {
        const seq = String(i + 1).padStart(3, "0");
        return {
          id: "EP" + seq,
          title: "第 " + (i + 1) + " 集",
          raw: null,
          status: i === 0 ? "process" : "wait",
          results: null,
        };
      });
      this.activeEpisodeIndex = 0;
      this.activeEpisode = this.episodeList[0] || null;
      this.episodeRenderedFor = -1;
    },

    /**
     * 依据「分集任务书」输出结构同步分集步骤节点。
     * 分集任务书生成 Skill 输出形如：
     *   { "title": "...", "episodes": [{ "episode_id": "EP012", "title": "被隐瞒的证词", ... }] }
     * @param {Object} taskBook 分集任务书完整 JSON
     */
    syncEpisodesFromTaskBook(taskBook) {
      const episodes = (taskBook && taskBook.episodes) || [];
      if (!Array.isArray(episodes) || !episodes.length) {
        this.buildEpisodeListFromCount();
        return;
      }
      this.episodeList = episodes.map((ep, i) => {
        const seq = String(i + 1).padStart(3, "0");
        return {
          id: ep.episode_id || "EP" + seq,
          title: ep.title || ep.episode_id || "第 " + (i + 1) + " 集",
          raw: ep,
          status: i === 0 ? "process" : "wait",
          results: null,
        };
      });
      this.activeEpisodeIndex = 0;
      this.activeEpisode = this.episodeList[0] || null;
      this.episodeRenderedFor = -1;
      this.setStatus(
        "已从分集任务书同步 " + this.episodeList.length + " 个分集节点",
        "success"
      );
    },

    /* ============================================================
     * 监听小说规划工作流执行状态（code.vue 通过 webCpu.mitt 释放事件）
     * ============================================================ */

    // code.vue handleIframeUrlChange 中节点完成时触发：区分规划完成 / 分集完成
    onWorkflowNodeCompleted(payload) {
      if (!payload || !this.started) return;
      const stepData = payload.stepData;
      if (!Array.isArray(stepData) || !stepData.length) return;
      const last = stepData[stepData.length - 1];
      if (!last || !last.resultUrl) return;

      // 小说规划：最后一个节点为「分集任务书生成」
      if (last.appId === this.SKILL.taskBook) {
        if (this.planningDone) return;
        this.planningDone = true;
        this.planningResultUrl = last.resultUrl;
        // 捕获规划工作流的执行记录，供切回规划面板时还原显示（避免重新自动生成）
        this.planningAgentResults = this.buildAgentResults(stepData);
        this.setStatus(
          "「小说规划」工作流已执行结束，点击「继续」进入「分集生成」",
          "success"
        );
        return;
      }

      // 分集生成：最后一个节点为「润色章节正文」
      if (last.appId === this.SKILL.polish) {
        this.onEpisodeCompleted(stepData);
      }
    },

    // 分集工作流某集完成：存储结果、标记成功、点亮下一集
    onEpisodeCompleted(stepData) {
      const index = this.activeEpisodeIndex;
      const episode = this.episodeList[index];
      if (!episode) return;

      episode.results = {
        agentResults: this.buildAgentResults(stepData),
        finalContent: "",
      };
      episode.status = "success";
      // 工作流执行完成，重新可点击「开始生成 / 重新生成」
      this.episodeGenerating = false;

      // 拉取最终正文内容（润色章节正文输出），供「上一集正文」组合使用
      const last = stepData[stepData.length - 1];
      if (last && last.resultUrl) {
        const p = WebTool.urlQuery(last.resultUrl);
        if (
          p &&
          p.dataId &&
          typeof aigcInterface !== "undefined" &&
          typeof aigcInterface.getDataItem === "function"
        ) {
          aigcInterface.getDataItem(p.dataId, (result) => {
            episode.results.finalContent = this.extractBodyContent(result);
          });
        }
      }

      // 点亮下一个节点
      const next = this.episodeList[index + 1];
      if (next && next.status === "wait") {
        next.status = "process";
      }

      this.setStatus(
        "「" + episode.id + "」生成完成，可切换到下一集或重新生成",
        "success"
      );
    },

    // 由 stepData 构造可还原的 agentResults
    buildAgentResults(stepData) {
      return (stepData || []).map((item) => ({
        appId: item.appId,
        resultUrl: item.resultUrl,
        inputData: item.inputData || item.skillInput || {},
      }));
    },

    // 点击「继续」：取小说规划各节点结果 → 缓存 → 初始化分集步骤 → 切换到分集生成
    handleContinue() {
      const planningVm = this.workflowRefs.planning;
      const stepData =
        planningVm && planningVm.stepData ? planningVm.stepData : [];
      if (!stepData.length) {
        this.setStatus("未获取到「小说规划」工作流数据，请重试", "error");
        return;
      }

      // 按节点 appId 归位 dataId，避免依赖数组顺序或缺失节点导致结果错位
      const dataIdByAppId = {};
      stepData.forEach((s) => {
        if (!s || !s.resultUrl) return;
        const p = WebTool.urlQuery(s.resultUrl);
        if (p && p.dataId) dataIdByAppId[s.appId] = p.dataId;
      });
      const dataIds = Object.keys(dataIdByAppId).map(
        (k) => dataIdByAppId[k]
      );

      if (!dataIds.length) {
        this.setStatus("未能从规划结果中获取 dataId，请重试", "error");
        return;
      }

      this.setStatus("正在获取「小说规划」各节点结果...", "info");

      const applyPlanningResults = (results, rawItems) => {
        // getDataItem 数组查询返回顺序可能不稳定，按 _id 归位
        const byId = {};
        (rawItems || []).forEach((item) => {
          byId[item._id] = item.result;
        });

        const parseJson = (v) => {
          if (typeof v !== "string") return v;
          try {
            return WebTool.extractJSON(v);
          } catch (e) {
            return v;
          }
        };

        // 第1节点=素材知识库、第2节点=小说结构规划、第3节点=分集任务书生成
        this.planningResults.material =
          parseJson(byId[dataIdByAppId[this.SKILL.material]]) || null;
        this.planningResults.structure =
          parseJson(byId[dataIdByAppId[this.SKILL.structure]]) || null;
        const taskBook =
          parseJson(byId[dataIdByAppId[this.SKILL.taskBook]]) || null;
        this.planningResults.taskBook = taskBook;

        if (
          taskBook &&
          Array.isArray(taskBook.episodes) &&
          taskBook.episodes.length
        ) {
          this.syncEpisodesFromTaskBook(taskBook);
        } else {
          this.buildEpisodeListFromCount();
        }
        this.switchToEpisodeStep();
      };

      if (
        typeof aigcInterface !== "undefined" &&
        typeof aigcInterface.getDataItem === "function"
      ) {
        aigcInterface.getDataItem(dataIds, applyPlanningResults, () => {
          // 获取失败：用集数设定兜底并切入分集生成
          this.buildEpisodeListFromCount();
          this.switchToEpisodeStep();
        });
      } else {
        // 运行环境缺少 getDataItem：用集数设定兜底
        this.buildEpisodeListFromCount();
        this.switchToEpisodeStep();
      }
    },

    // 切换到「分集生成」步骤（已初始化分集步骤数据）
    switchToEpisodeStep() {
      this.activeMainStep = 1;
      this.activeEpisodeIndex = 0;
      this.activeEpisode = this.episodeList[0] || null;
      this.episodeGenerating = false;
      this.activateCurrentEpisode();
    },

    // 「开始生成 / 重新生成」：组合输入 → 以编辑态重新挂载分集工作流
    async startEpisodeGeneration() {
      const index = this.activeEpisodeIndex;
      const episode = this.episodeList[index];
      if (!episode || this.episodeGenerating) return;

      // 重新生成：先清空当前分集的工作流各节点执行结果
      if (episode.results) {
        episode.results = null;
      }

      this.episodeGenerating = true;

      // 补齐上一集正文（若尚未异步拉取到），保证输入始终包含上一集正文
      await this.ensurePrevEpisodeBody(index);

      // 拉取期间若切换了分集，则放弃本次启动
      if (this.activeEpisodeIndex !== index) return;

      this.composeEpisodeInput(index);

      this.renderWorkflow(
        "episode",
        {
          title: "分集生成 · " + episode.id,
          apps: this.NOVEL_SKILLS,
          isViewer: true,
          agentResults: [],
          accountData: {
            appId: this.SKILL.chapter,
            workflow: [this.SKILL.quality, this.SKILL.polish],
            allLines: this.episodeAllLines,
          },
        },
        true
      );
      this.episodeRenderedFor = index;
      this.setStatus(
        "已启动「" + episode.id + "」正文生成，请在工作流面板内逐步执行",
        "info"
      );
    },

    // 若上一集正文尚未拉取到（finalContent 为空），从其最后一个节点 resultUrl 重新拉取
    ensurePrevEpisodeBody(index) {
      const prevEpisode = index > 0 ? this.episodeList[index - 1] : null;
      if (
        !prevEpisode ||
        !prevEpisode.results ||
        prevEpisode.results.finalContent
      ) {
        return Promise.resolve();
      }
      const results = prevEpisode.results.agentResults || [];
      const last = results[results.length - 1];
      if (!last || !last.resultUrl) return Promise.resolve();
      const p = WebTool.urlQuery(last.resultUrl);
      if (!p || !p.dataId) return Promise.resolve();
      if (
        typeof aigcInterface === "undefined" ||
        typeof aigcInterface.getDataItem !== "function"
      ) {
        return Promise.resolve();
      }
      return new Promise((resolve) => {
        aigcInterface.getDataItem(
          p.dataId,
          (result) => {
            prevEpisode.results.finalContent = this.extractBodyContent(result);
            resolve();
          },
          () => resolve()
        );
      });
    },

    // 组合当前集的初始输入到 localStorage.agentInput
    // = 规划节点0(素材知识库) + 节点1(小说结构规划) + 当前集任务书 + 上一集正文
    composeEpisodeInput(index) {
      const prevEpisode = index > 0 ? this.episodeList[index - 1] : null;

      const input = {
        material: this.planningResults.material || "",
        structure: this.planningResults.structure || "",
        taskBook: this.getEpisodeTaskBook(index),
        prevChapter:
          prevEpisode && prevEpisode.results
            ? prevEpisode.results.finalContent || ""
            : "",
      };

      localStorage.agentInput = JSON.stringify(input);
    },

    // 获取某一集对应的任务书数据：优先取该集已同步的 raw，否则从第3节点任务书结果中按索引取
    getEpisodeTaskBook(index) {
      const episode = this.episodeList[index];
      if (episode && episode.raw) return episode.raw;
      const taskBook = this.planningResults.taskBook;
      if (
        taskBook &&
        Array.isArray(taskBook.episodes) &&
        taskBook.episodes[index]
      ) {
        return taskBook.episodes[index];
      }
      return "";
    },

    /* ============================================================
     * 导出分集正文（.md 打包下载）
     * ============================================================ */

    // 提取某分集的「正文」内容（工作流最后一个节点结果里的正文字段）
    extractEpisodeContent(episode) {
      return this.extractBodyContent(
        episode && episode.results && episode.results.finalContent
      );
    },

    // 从工作流最后一个节点 result 中提取「正文」参数值
    // 兼容不同 Skill 的正文字段：润色稿 polishedContent / 正文 content / 质检 new
    extractBodyContent(raw) {
      if (raw == null) return "";
      let obj = raw;
      if (typeof obj === "string") {
        try {
          obj = WebTool.extractJSON(obj);
        } catch (e) {
          obj = null;
        }
      }
      if (obj && typeof obj === "object") {
        return obj.polishedContent || obj.content || obj.new || "";
      }
      return typeof raw === "string" ? raw : "";
    },

    // 导出所有已生成分集的正文为 .md，统一压缩打包下载
    async handleExport() {
      const generated = this.episodeList.filter(
        (ep) => ep.results && ep.results.finalContent
      );
      if (!generated.length) {
        this.setStatus("暂无可导出的分集正文", "info");
        return;
      }

      if (
        typeof WebTool === "undefined" ||
        typeof WebTool.createExportSession !== "function"
      ) {
        this.setStatus("运行环境缺少导出能力（JSZip 未加载）", "error");
        return;
      }

      try {
        const session = WebTool.createExportSession();
        generated.forEach((ep) => {
          const content = this.extractEpisodeContent(ep);
          const safe = (ep.id + "-" + ep.title).replace(/[\\/:*?"<>|]/g, "-");
          session.addFile(
            safe + ".md",
            new Blob([content], { type: "text/markdown;charset=utf-8" })
          );
        });
        const name =
          this.sanitizeFilename(this.getNovelTitle()) +
          "-" +
          this.formatTimestamp();
        await session.finalize(name + ".zip");
        this.setStatus("已导出 " + generated.length + " 个分集正文", "success");
      } catch (e) {
        this.setStatus(
          "导出失败：" + (e && e.message ? e.message : e),
          "error"
        );
      }
    },

    /* ============================================================
     * 项目数据导入 / 导出（JSON）
     * ============================================================ */

    // 收集当前项目数据（项目名称 + 规划执行记录 + 每集执行记录 + 配置）
    collectProjectData(projectName) {
      return {
        version: 1,
        name: projectName || "",
        docName: this.selectedDoc ? this.selectedDoc.name : "",
        episodeCount: this.episodeCount,
        wordsPerEpisode: this.wordsPerEpisode,
        planningResultUrl: this.planningResultUrl,
        planningAgentResults: Array.isArray(this.planningAgentResults)
          ? this.planningAgentResults
          : [],
        planningResults: this.planningResults || {},
        episodeList: Array.isArray(this.episodeList) ? this.episodeList : [],
      };
    },

    // 导出项目数据为 JSON 文件
    exportProject() {
      if (!this.canExportProject) return;
      const projectName = this.getProjectName();
      const json = JSON.stringify(this.collectProjectData(projectName), null, 2);
      const blob = new Blob([json], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = projectName + ".json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.setStatus("已导出项目数据（JSON）", "success");
    },

    // 触发读取项目数据文件选择
    importProject() {
      if (this.$refs.projectFileInput) {
        this.$refs.projectFileInput.click();
      }
    },

    // 读取并解析项目数据 JSON 文件
    async handleProjectFileChange(e) {
      const file = e.target.files && e.target.files[0];
      e.target.value = "";
      if (!file) return;
      try {
        const text = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target.result);
          reader.onerror = () => reject(new Error("文件读取失败"));
          reader.readAsText(file, "utf-8");
        });
        const data = JSON.parse(text);
        this.applyProjectData(data);
      } catch (err) {
        const msg = err && err.message ? err.message : String(err);
        this.setStatus("项目数据读取失败：" + msg, "error");
      }
    },

    // 应用读取到的项目数据：恢复配置、规划执行记录与每集执行记录
    applyProjectData(data) {
      if (!data || typeof data !== "object") {
        this.setStatus("项目数据格式无效", "error");
        return;
      }

      // 基本配置
      if (typeof data.episodeCount === "number" && data.episodeCount >= 1) {
        this.episodeCount = data.episodeCount;
      }
      if (
        typeof data.wordsPerEpisode === "number" &&
        data.wordsPerEpisode >= 1
      ) {
        this.wordsPerEpisode = data.wordsPerEpisode;
      }
      if (data.docName) {
        this.selectedDoc = {
          name: data.docName,
          size: 0,
          rawFile: null,
          content: "",
        };
      }

      // 规划执行记录与结果
      this.planningAgentResults = Array.isArray(data.planningAgentResults)
        ? data.planningAgentResults
        : [];
      this.planningResultUrl =
        typeof data.planningResultUrl === "string" ? data.planningResultUrl : "";
      const pr =
        data.planningResults && typeof data.planningResults === "object"
          ? data.planningResults
          : {};
      this.planningResults = {
        material: pr.material || null,
        structure: pr.structure || null,
        taskBook: pr.taskBook || null,
      };

      // 分集列表（含每集执行记录）
      if (Array.isArray(data.episodeList) && data.episodeList.length) {
        this.episodeList = data.episodeList.map((ep) => ({
          id: ep && ep.id ? ep.id : "",
          title: ep && ep.title ? ep.title : "",
          raw: (ep && ep.raw) || null,
          status: (ep && ep.status) || "wait",
          results: (ep && ep.results) || null,
        }));
      } else {
        this.buildEpisodeListFromCount();
      }

      // 状态恢复
      this.started = true;
      this.planningDone = this.planningAgentResults.length > 0;
      this.activeMainStep = 0;
      this.activeEpisodeIndex = 0;
      this.activeEpisode = this.episodeList[0] || null;
      this.episodeGenerating = false;
      this.episodeRenderedFor = -1;

      // 清理残留输入，避免读取后意外触发自动生成
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("agentInput");
      }

      // 卸载旧工作流实例，重新渲染规划工作流以显示执行记录
      this.destroyWorkflow("planning");
      this.destroyWorkflow("episode");
      this.$nextTick(() => {
        this.renderPlanningWorkflow(true);
        this.setStatus(
          "已读取项目数据：小说规划与分集生成执行记录已恢复",
          "success"
        );
      });
    },

    /* ============================================================
     * 通用工具
     * ============================================================ */

    // 获取小说标题：优先分集任务书标题，其次结构规划标题，再其次文档文件名（去扩展名）
    getNovelTitle() {
      const taskBook = this.planningResults.taskBook;
      if (taskBook && typeof taskBook.title === "string" && taskBook.title.trim()) {
        return taskBook.title.trim();
      }
      const structure = this.planningResults.structure;
      if (structure && typeof structure === "object") {
        const t =
          structure.title || structure.novelTitle || structure.bookTitle || structure.name;
        if (typeof t === "string" && t.trim()) return t.trim();
      }
      if (this.selectedDoc && typeof this.selectedDoc.name === "string") {
        const base = this.selectedDoc.name.replace(/\.[^.]+$/, "").trim();
        if (base) return base;
      }
      return "长篇小说";
    },

    // 项目名称：小说名称 + "-项目-" + 时间
    getProjectName() {
      return (
        this.sanitizeFilename(this.getNovelTitle()) +
        "-项目-" +
        this.formatTimestamp()
      );
    },

    // 清理文件名中的非法字符
    sanitizeFilename(name) {
      const v = String(name || "")
        .replace(/[\\/:*?"<>|]/g, "-")
        .trim();
      return v || "长篇小说";
    },

    // 生成时间戳：YYYYMMDD-HHmmss
    formatTimestamp() {
      const d = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      return (
        d.getFullYear() +
        pad(d.getMonth() + 1) +
        pad(d.getDate()) +
        "-" +
        pad(d.getHours()) +
        pad(d.getMinutes()) +
        pad(d.getSeconds())
      );
    },

    setStatus(msg, type = "info") {
      this.statusMessage = msg;
      this.statusType = type;
    },
  },

  mounted() {
    // 监听 code.vue 释放的工作流节点完成事件（webCpu.mitt）
    this._onWorkflowNodeCompleted = this.onWorkflowNodeCompleted.bind(this);
    if (typeof webCpu !== "undefined" && webCpu.mitt) {
      webCpu.mitt.on("workflowNodeCompleted", this._onWorkflowNodeCompleted);
    }
  },

  beforeUnmount() {
    if (
      this._onWorkflowNodeCompleted &&
      typeof webCpu !== "undefined" &&
      webCpu.mitt
    ) {
      webCpu.mitt.off("workflowNodeCompleted", this._onWorkflowNodeCompleted);
      this._onWorkflowNodeCompleted = null;
    }
  },
};
</script>

<style scoped>
/* 补齐 Tailwind 任意值类样式声明（运行时 SFC 不会被 JIT 扫描到） */
.tw-bg-\[\#0066cc\] {
  background-color: #0066cc;
}
.tw-bg-\[\#f0f9ff\],
.tw-bg-\[\#F0F9FF\] {
  background-color: #f0f9ff;
}
.tw-border-\[\#bae6fd\] {
  border-color: #bae6fd;
}
.tw-text-\[\#0052a3\] {
  color: #0052a3;
}
.tw-text-\[\#7DD3FC\] {
  color: #7dd3fc;
}
.tw-text-\[11px\] {
  font-size: 11px;
}

/* ============================================
   DESIGN TOKENS — Muse · 极简 · 精致（与 temp.vue / code.vue 对齐）
   ============================================ */
.novelAppRoot {
  --muse-primary: #0066cc;
  --muse-primary-hover: #0052a3;
  --muse-primary-active: #004c99;
  --muse-primary-soft: rgba(0, 102, 204, 0.08);
  --muse-primary-ring: rgba(0, 102, 204, 0.16);

  --muse-bg: #f5f5f7;
  --muse-card: #ffffff;
  --muse-surface: #ffffff;

  --muse-text: #0f172a;
  --muse-text-secondary: #475569;
  --muse-text-tertiary: #94a3b8;

  --muse-border: rgba(15, 23, 42, 0.08);
  --muse-border-strong: rgba(15, 23, 42, 0.14);
  --muse-hover: rgba(15, 23, 42, 0.07);

  --radius-lg: 10px;
  --radius-full: 999px;

  --font-system: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
    "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
}

.novelAppRoot {
  position: relative;
  height: 100vh;
  height: 100dvh;
  font-family: var(--font-system);
  color: var(--muse-text);
  background-color: var(--muse-bg);
}

/* ============================================
   头部品牌徽标
   ============================================ */
.novel-logo {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #0066cc 0%, #2f8bf0 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: 0 6px 14px rgba(0, 102, 204, 0.28);
  flex-shrink: 0;
}

/* ============================================
   创作设定卡片（初始化输入区）
   ============================================ */
.novel-setup-card {
  background: var(--muse-surface, #ffffff);
  border: 1px solid var(--muse-border, rgba(15, 23, 42, 0.08));
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
  overflow: hidden;
}

.novel-setup-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid #f1f5f9;
  background: linear-gradient(180deg, #fcfdff 0%, #f8fafc 100%);
}

.novel-setup-card__title {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 700;
  color: var(--muse-text, #0f172a);
  letter-spacing: 0.01em;
}

.novel-setup-card__title i {
  color: var(--muse-primary, #0066cc);
  font-size: 14px;
}

.novel-setup-card__badge {
  font-size: 11px;
  font-weight: 500;
  color: var(--muse-primary, #0066cc);
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 999px;
  padding: 3px 12px;
  white-space: nowrap;
}

.novel-setup-card__body {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
}

/* ============================================
   Hero 空状态（初始化主内容区）
   ============================================ */
.novel-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  padding: 48px 24px;
  background: radial-gradient(
      1100px 420px at 50% -8%,
      rgba(0, 102, 204, 0.07),
      transparent 62%
    ),
    #ffffff;
  border: 1px solid var(--muse-border, rgba(15, 23, 42, 0.08));
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  overflow: hidden;
}

.novel-empty-state__icon {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e8f4ff 0%, #f0f9ff 100%);
  color: var(--muse-primary, #0066cc);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  margin-bottom: 20px;
  box-shadow: inset 0 0 0 1px rgba(0, 102, 204, 0.08),
    0 10px 26px rgba(0, 102, 204, 0.14);
  animation: novel-float 3.6s ease-in-out infinite;
}

@keyframes novel-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

.novel-empty-state__title {
  font-size: 19px;
  font-weight: 700;
  color: var(--muse-text, #0f172a);
  margin: 0 0 8px;
  letter-spacing: -0.01em;
}

.novel-empty-state__desc {
  font-size: 13px;
  line-height: 1.7;
  color: #64748b;
  margin: 0 0 30px;
  max-width: 460px;
}

.novel-empty-state__steps {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.novel-step-hint {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px 16px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: #475569;
  transition: border-color 0.2s ease, background-color 0.2s ease,
    transform 0.2s ease;
}

.novel-step-hint:hover {
  border-color: #bae6fd;
  background: #f0f9ff;
  transform: translateY(-2px);
}

.novel-step-hint__num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--muse-primary, #0066cc);
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.novel-step-hint__label {
  white-space: nowrap;
}

.novel-step-hint__icon {
  color: #94a3b8;
  font-size: 14px;
}

.novel-step-hint--arrow {
  padding: 0;
  background: transparent;
  border: none;
  pointer-events: none;
}

.novel-step-hint__arrow {
  color: #cbd5e1;
  font-size: 14px;
}

/* ============================================
   Muse 统一 · Element Plus 控件
   ============================================ */
.el-button--primary {
  --el-button-bg-color: var(--muse-primary, #0066cc);
  --el-button-border-color: var(--muse-primary, #0066cc);
  --el-button-hover-bg-color: var(--muse-primary-hover, #0052a3);
  --el-button-hover-border-color: var(--muse-primary-hover, #0052a3);
  --el-button-active-bg-color: var(--muse-primary-active, #004c99);
  --el-button-active-border-color: var(--muse-primary-active, #004c99);
  --el-button-text-color: #ffffff;
  border-radius: 999px;
  font-weight: 600;
}

.el-button--primary:not(.is-disabled):hover {
  box-shadow: 0 2px 6px rgba(0, 102, 204, 0.2);
}

.el-button--primary:not(.is-disabled):active {
  transform: translateY(0) scale(0.98);
}

.el-input__wrapper,
.el-select__wrapper,
.el-input-number {
  border-radius: var(--radius-lg, 10px);
}

.el-input__wrapper.is-focus,
.el-select__wrapper.is-focused {
  box-shadow: 0 0 0 1px var(--muse-primary, #0066cc) inset !important;
}

.num-input {
  width: 120px;
}

/* 返回按钮：贴合 Muse 主题的文本按钮 */
.back-btn {
  color: var(--muse-text-secondary, #475569) !important;
  font-weight: 500;
}

.back-btn:hover {
  color: var(--muse-primary, #0066cc) !important;
  background: rgba(0, 102, 204, 0.06) !important;
}

/* ============================================
   本地文档选择 dropzone（类似 agentCreator）
   ============================================ */
.doc-dropzone {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 280px;
  flex: 1 1 280px;
  max-width: 460px;
  padding: 6px 12px;
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  background: #ffffff;
  cursor: pointer;
  user-select: none;
  transition: border-color 0.2s ease, background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.doc-dropzone:hover {
  border-color: var(--muse-primary, #0066cc);
  background: #f0f9ff;
}

.doc-dropzone--active {
  border-style: solid;
  border-color: #bae6fd;
  background: #f6f9f7;
}

.doc-dropzone--dragging {
  border-color: var(--muse-primary, #0066cc);
  background: #f0f9ff;
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.12);
}

.doc-dropzone__icon {
  font-size: 18px;
  color: #94a3b8;
  flex-shrink: 0;
}

.doc-dropzone__icon.is-active {
  color: var(--muse-primary, #0066cc);
}

.doc-dropzone__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.doc-dropzone__action {
  font-size: 12px;
  color: #475569;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.doc-dropzone__name {
  font-size: 12px;
  color: #0f172a;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.doc-dropzone__hint {
  font-size: 11px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.doc-hidden-input {
  display: none;
}

/* ============================================
   主步骤条（小说规划 → 分集生成，仅标签 + 顺序箭头，无编号）
   ============================================ */
.main-steps {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 180px;
  padding: 0 4px;
}

.main-step {
  font-size: 14px;
  line-height: 1;
  color: var(--muse-text-secondary, #475569);
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  transition: color 0.2s ease;
}

.main-step:hover {
  color: var(--muse-primary, #0066cc);
}

.main-step.is-active {
  color: var(--muse-primary, #0066cc);
  font-weight: 700;
}

.main-step.is-disabled {
  color: #cbd5e1;
  cursor: not-allowed;
}

.main-step.is-disabled:hover {
  color: #cbd5e1;
}

.main-step-arrow {
  color: var(--muse-text-tertiary, #94a3b8);
  font-size: 14px;
  line-height: 1;
  user-select: none;
}

/* ============================================
   分集步骤条（纵向）
   ============================================ */
.episode-steps-panel {
  width: 180px;
}

.episode-steps-scroll::-webkit-scrollbar {
  width: 6px;
}
.episode-steps-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.episode-steps-scroll::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 3px;
}
.episode-steps-scroll::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

/* 纵向步骤：节点容器适配竖排，标题紧随图标 */
.episode-steps .el-step.is-vertical {
  min-height: 44px;
  justify-content: center;
}

.episode-steps .el-step.is-vertical .el-step__head {
  width: 32px !important;
}

/* 图标：与 code.vue 工作流步骤条一致的 Apple 风格（白底圆环 / 蓝底对勾 / 蓝点） */
.episode-steps .el-step__icon {
  width: 32px !important;
  height: 32px !important;
  border-radius: 50% !important;
  background: #ffffff !important;
  border: 1.5px solid #cbd5e1 !important;
  color: transparent !important;
  position: relative;
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
  box-shadow: none !important;
}

.episode-steps .el-step__icon-inner {
  display: none !important;
}

.episode-steps .el-step__head.is-success .el-step__icon {
  background: var(--muse-primary, #0066cc) !important;
  border-color: var(--muse-primary, #0066cc) !important;
  box-shadow: 0 2px 6px rgba(0, 102, 204, 0.28) !important;
}

.episode-steps .el-step__head.is-success .el-step__icon::before {
  content: "\F26A";
  font-family: "bootstrap-icons";
  color: #ffffff !important;
  font-size: 15px;
  font-weight: bold;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.episode-steps .el-step__head.is-process .el-step__icon {
  background: #ffffff !important;
  border-color: var(--muse-primary, #0066cc) !important;
  box-shadow: 0 0 0 4px rgba(0, 102, 204, 0.12) !important;
}

.episode-steps .el-step__head.is-process .el-step__icon::before {
  content: "";
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--muse-primary, #0066cc);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 连接线：2px 细线，默认浅灰，已完成/进行中为主题蓝 */
.episode-steps .el-step__line {
  width: 2px !important;
  left: 15px !important;
  background: #e2e8f0 !important;
}

.episode-steps .el-step__head.is-success .el-step__line,
.episode-steps .el-step__head.is-process .el-step__line {
  background: var(--muse-primary, #0066cc) !important;
}

.episode-steps .el-step__title {
  cursor: pointer;
  font-size: 12px;
  line-height: 1.4;
  color: #475569;
  white-space: nowrap;
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s ease;
}

.episode-steps .el-step__description {
  font-size: 11px;
  color: #94a3b8;
  white-space: nowrap;
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.episode-steps .el-step__title:hover {
  color: var(--muse-primary, #0066cc);
}

.activeEpisodeItem .el-step__title {
  color: var(--muse-primary, #0066cc) !important;
  font-weight: 700 !important;
}

/* ============================================
   工作流宿主容器（内部 code.vue 自带滚动）
   ============================================ */
.workflow-host {
  overflow: auto;
}

/* ============================================
   响应式适配（Apple 标准：移动端 / 平板 / PC）
   ============================================ */

/* 平板及以下（≤768px）：压缩外边距 */
@media (max-width: 768px) {
  .novelAppRoot {
    padding: 12px;
  }

  /* 头部操作区换行后靠左，去掉左边距，允许内部换行 */
  .novel-header__actions {
    margin-left: 0;
    flex-wrap: wrap;
    row-gap: 6px;
  }
}

/* 手机（≤640px）：关键布局重排 */
@media (max-width: 640px) {
  .novelAppRoot {
    padding: 10px;
  }

  /* 分集生成：左侧步骤条收窄为「图标窄条」，工作流占满剩余空间 */
  .episode-layout {
    gap: 8px;
    padding: 8px;
  }
  .episode-steps-panel {
    width: 48px;
  }
  .episode-panel-header {
    padding: 6px 0;
    justify-content: center;
  }
  .episode-panel-header .tw-font-medium {
    display: none;
  }
  .episode-steps-scroll {
    padding-left: 4px;
    padding-right: 4px;
  }
  .episode-steps .el-step__main {
    display: none;
  }
  .episode-steps .el-step.is-vertical {
    min-height: 40px;
  }

  /* 输入区：文档选择占满一行，数值控件更紧凑 */
  .doc-dropzone {
    min-width: 0;
    flex-basis: 100%;
    max-width: 100%;
  }
  .num-input {
    width: 96px;
  }

  /* Hero 空状态：步骤提示纵向堆叠，隐藏连接箭头 */
  .novel-empty-state {
    padding: 32px 16px;
  }
  .novel-empty-state__steps {
    flex-direction: column;
    gap: 8px;
  }
  .novel-step-hint--arrow {
    display: none;
  }
  .novel-step-hint {
    width: 100%;
    justify-content: center;
  }
}
</style>
