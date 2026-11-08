<template>
  <!-- 主容器：严格锁定 100vh，隐藏外层所有溢出 -->
  <div
    class="cloneAppRoot tw-w-full tw-h-screen tw-max-w-6xl tw-mx-auto tw-p-4 tw-font-sans tw-flex tw-flex-col tw-overflow-hidden"
  >
    <!-- 顶部 Header -->
    <div
      class="cloneHeader tw-flex-none tw-mb-3 tw-flex tw-items-center tw-justify-between tw-border-b tw-border-slate-200 tw-pb-2.5"
    >
      <div class="tw-flex tw-items-center tw-gap-2">
        <div class="tw-w-2.5 tw-h-2.5 tw-rounded-full tw-bg-[#1a1a1e]"></div>
        <h3 class="tw-text-sm tw-font-semibold tw-text-slate-800 tw-m-0">
          应用克隆与预览面板
        </h3>
      </div>
      <span class="cloneHeaderMeta tw-text-[11px] tw-font-mono tw-text-slate-400"
        >TransWeb Engine Integrated</span
      >
    </div>

    <!-- 1. 操作区：模式切换 + 输入框与按钮组 -->
    <div class="tw-flex-none tw-space-y-2.5 tw-mb-3">
      <!-- 模式切换：在线 URL / 本地文件 -->
      <div class="tw-flex tw-items-center tw-gap-3">
        <div
          class="cloneModeTabs tw-inline-flex tw-p-0.5 tw-bg-slate-100 tw-rounded-none tw-border tw-border-slate-200"
        >
          <button
            type="button"
            class="cloneModeBtn"
            :class="{ 'is-active': cloneMode === 'url' }"
            :aria-pressed="cloneMode === 'url'"
            @click="switchCloneMode('url')"
          >
            <i class="el-icon-link"></i>在线 URL 克隆
          </button>
          <button
            type="button"
            class="cloneModeBtn"
            :class="{ 'is-active': cloneMode === 'local' }"
            :aria-pressed="cloneMode === 'local'"
            @click="switchCloneMode('local')"
          >
            <i class="el-icon-folder-opened"></i>本地文件克隆
          </button>
        </div>
      </div>

      <!-- 模式 A：在线 URL 解析 -->
      <div v-show="cloneMode === 'url'" class="cloneUrlRow tw-flex tw-gap-2">
        <el-input
          v-model.trim="manifestUrl"
          aria-label="manifest.json 的完整 URL"
          placeholder="请输入 manifest.json 的完整 URL..."
          clearable
          :disabled="loading || confirming"
          size="small"
          class="tw-flex-1"
          @keyup.enter="handleFetchManifest"
        >
          <template #prefix>
            <i class="el-icon-link tw-text-slate-400"></i>
          </template>
        </el-input>

        <el-button
          type="primary"
          size="small"
          :loading="loading"
          :disabled="!manifestUrl || confirming"
          class="!tw-px-5 !tw-font-medium manifestFetchBtn"
          @click="handleFetchManifest"
        >
          解析 Manifest
        </el-button>

        <el-button
          type="success"
          size="small"
          :loading="confirming"
          :disabled="!isValid || loading || isCloned"
          class="!tw-px-5 !tw-font-medium confirmCloneBtn"
          @click="handleConfirm"
        >
          {{ isCloned ? "已克隆" : "确认克隆" }}
        </el-button>
      </div>

      <!-- 模式 B：本地文件选择 + 一键克隆 -->
      <div v-show="cloneMode === 'local'" class="tw-space-y-2.5">
        <div class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-2">
          <!-- appCode.vue（必选） -->
          <div
            class="localFileCard tw-border tw-rounded-none tw-px-3 tw-py-2.5 tw-bg-white tw-transition-all tw-duration-150"
            :class="
              localCodeName
                ? 'tw-border-[#1a1a1e]/60 tw-ring-2 tw-ring-[#1a1a1e]/10'
                : 'tw-border-slate-200'
            "
          >
            <div class="tw-flex tw-items-center tw-justify-between tw-gap-2">
              <span
                class="tw-flex tw-items-center tw-gap-1.5 tw-text-xs tw-font-medium tw-text-slate-700"
              >
                <i class="el-icon-document tw-text-[#1a1a1e]"></i>
                appCode.vue
                <em
                  class="tw-not-italic tw-text-[10px] tw-text-rose-500 tw-font-semibold"
                  >必选</em
                >
              </span>
              <span
                v-if="localCodeName"
                class="tw-flex-1 tw-text-right tw-text-[11px] tw-font-mono tw-text-emerald-600 tw-truncate"
                :title="localCodeName"
              >
                {{ localCodeName }}
              </span>
            </div>
            <div
              class="tw-flex tw-items-center tw-justify-between tw-gap-2 tw-mt-1.5"
            >
              <span class="tw-text-[10px] tw-text-slate-400 tw-truncate">
                {{ localCodeName ? "已选择，可重新选择" : "请选择 Vue 组件文件" }}
              </span>
              <div class="tw-flex tw-items-center tw-gap-1 tw-shrink-0">
                <el-button
                  size="small"
                  plain
                  :disabled="localReading || confirming"
                  @click="triggerCodeFileSelect"
                >
                  {{ localCodeName ? "重新选择" : "选择文件" }}
                </el-button>
                <el-button
                  v-if="localCodeName"
                  size="small"
                  type="text"
                  class="!tw-text-slate-400 hover:!tw-text-rose-500"
                  title="清除"
                  @click="clearCodeFile"
                >
                  <i class="el-icon-close"></i>
                </el-button>
              </div>
            </div>
          </div>

          <!-- appPrompt.md（非必选） -->
          <div
            class="localFileCard tw-border tw-rounded-none tw-px-3 tw-py-2.5 tw-bg-white tw-transition-all tw-duration-150"
            :class="
              localPromptName
                ? 'tw-border-[#1a1a1e]/60 tw-ring-2 tw-ring-[#1a1a1e]/10'
                : 'tw-border-slate-200'
            "
          >
            <div class="tw-flex tw-items-center tw-justify-between tw-gap-2">
              <span
                class="tw-flex tw-items-center tw-gap-1.5 tw-text-xs tw-font-medium tw-text-slate-700"
              >
                <i class="el-icon-chat-square tw-text-[#1a1a1e]"></i>
                appPrompt.md
                <em
                  class="tw-not-italic tw-text-[10px] tw-text-slate-400 tw-font-semibold"
                  >可选</em
                >
              </span>
              <span
                v-if="localPromptName"
                class="tw-flex-1 tw-text-right tw-text-[11px] tw-font-mono tw-text-emerald-600 tw-truncate"
                :title="localPromptName"
              >
                {{ localPromptName }}
              </span>
            </div>
            <div
              class="tw-flex tw-items-center tw-justify-between tw-gap-2 tw-mt-1.5"
            >
              <span class="tw-text-[10px] tw-text-slate-400 tw-truncate">
                {{
                  localPromptName
                    ? "已选择，可重新选择"
                    : "可选，不选则克隆空 Prompt"
                }}
              </span>
              <div class="tw-flex tw-items-center tw-gap-1 tw-shrink-0">
                <el-button
                  size="small"
                  plain
                  :disabled="localReading || confirming"
                  @click="triggerPromptFileSelect"
                >
                  {{ localPromptName ? "重新选择" : "选择文件" }}
                </el-button>
                <el-button
                  v-if="localPromptName"
                  size="small"
                  type="text"
                  class="!tw-text-slate-400 hover:!tw-text-rose-500"
                  title="清除"
                  @click="clearPromptFile"
                >
                  <i class="el-icon-close"></i>
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 一键克隆按钮 -->
        <div class="localCloneBar tw-flex tw-items-center tw-justify-end tw-gap-2">
          <span class="tw-text-[11px] tw-text-slate-400">
            <i class="el-icon-info"></i>
            {{
              localCodeName
                ? "文件已就绪，可一键克隆"
                : "请先选择 appCode.vue 文件"
            }}
          </span>
          <el-button
            type="success"
            size="small"
            :loading="confirming"
            :disabled="!localCodeName || localReading || confirming || isCloned"
            class="!tw-px-6 !tw-font-medium confirmCloneBtn"
            @click="handleLocalClone"
          >
            {{ isCloned ? "已克隆" : "一键克隆" }}
          </el-button>
        </div>
      </div>

      <!-- 隐藏的文件选择 input -->
      <input
        ref="codeFileInput"
        type="file"
        accept=".vue,text/x-vue,text/plain"
        class="tw-hidden"
        @change="handleCodeFileChange"
      />
      <input
        ref="promptFileInput"
        type="file"
        accept=".md,text/markdown,text/plain"
        class="tw-hidden"
        @change="handlePromptFileChange"
      />

      <!-- 状态提示框 -->
      <div
        v-if="statusMessage && !isCloned"
        class="tw-px-3 tw-py-1.5 tw-rounded-none tw-text-xs tw-flex tw-items-center tw-gap-2 tw-transition-all"
        :role="statusType === 'error' ? 'alert' : 'status'"
        aria-live="polite"
        :class="{
          'tw-bg-emerald-50 tw-text-emerald-700 tw-border tw-border-emerald-200':
            statusType === 'success',
          'tw-bg-rose-50 tw-text-rose-700 tw-border tw-border-rose-200':
            statusType === 'error',
          'tw-bg-[#f8f8fa] tw-text-[#6e6e73] tw-border tw-border-[#e7e7eb]':
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
    </div>

    <!-- 2. 主内容展示区（占用剩余所有空间） -->
    <div class="tw-flex-1 tw-min-h-0 tw-flex tw-flex-col">
      <!-- 视图 A：克隆成功后 iframe 预览 + URL 显示栏 -->
      <div
        v-if="isCloned && currentAppUrl"
        class="tw-w-full tw-h-full tw-flex tw-flex-col tw-border tw-border-slate-300 tw-rounded-none tw-overflow-hidden tw-bg-white tw-shadow-sm"
      >
        <!-- 新增：模拟浏览器地址栏，展示并可一键复制 Iframe URL -->
        <div
          class="previewUrlBar tw-flex-none tw-bg-slate-100 tw-px-3 tw-py-2 tw-border-b tw-border-slate-200 tw-flex tw-items-center tw-gap-2"
        >
          <span
            class="tw-text-xs tw-font-semibold tw-text-slate-500 tw-whitespace-nowrap tw-flex tw-items-center tw-gap-1"
          >
            <i class="el-icon-view"></i> 预览地址:
          </span>

          <!-- 极简地址展示框 -->
          <div
            class="clonePreviewAddress tw-flex-1 tw-bg-white tw-border tw-border-slate-200 tw-rounded-none tw-px-2.5 tw-py-1 tw-text-xs tw-font-mono tw-text-slate-700 tw-truncate tw-select-all"
          >
            {{ currentAppUrl }}
          </div>

          <!-- 功能按钮：一键复制 & 新标签页打开 -->
          <div class="clonePreviewActions tw-flex tw-items-center tw-gap-1">
            <el-button
              size="small"
              type="text"
              class="!tw-text-slate-600 hover:!tw-text-[#1a1a1e] !tw-px-1.5"
              title="复制 URL"
              @click="handleCopyUrl"
            >
              <i class="el-icon-document-copy"></i> 复制
            </el-button>
            <a
              :href="currentAppUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="tw-text-xs tw-text-slate-600 hover:tw-text-[#1a1a1e] tw-no-underline tw-px-1.5 tw-py-1"
              title="新窗口打开"
            >
              <i class="el-icon-top-right"></i>
            </a>
          </div>
        </div>

        <!-- Iframe 实体容器 -->
        <div class="tw-flex-1 tw-relative tw-w-full tw-h-full tw-bg-[#fafafc]">
          <transition name="el-fade-in">
            <div
              v-if="iframeLoading"
              class="tw-absolute tw-inset-0 tw-z-10 tw-flex tw-flex-col tw-items-center tw-justify-center tw-bg-white/90 tw-backdrop-blur-sm tw-text-slate-600 tw-text-xs"
            >
              <i
                class="el-icon-loading tw-text-2xl tw-mb-2 tw-text-[#1a1a1e]"
              ></i>
              <span>应用正在加载中...</span>
            </div>
          </transition>

          <iframe
            :src="currentAppUrl"
            title="克隆应用预览"
            class="tw-w-full tw-h-full tw-border-none"
            @load="iframeLoading = false"
          ></iframe>
        </div>
      </div>

      <!-- 视图 B：IDE 沉浸式代码/Prompt 面板 -->
      <div
        v-else
        class="tw-w-full tw-h-full tw-flex tw-flex-col tw-border tw-border-slate-800 tw-rounded-none tw-overflow-hidden  tw-shadow-xl"
      >
        <!-- IDE Header / Tab 栏 -->
        <div
          class="cloneIdeHeader tw-flex-none tw-flex tw-items-center tw-justify-between tw-bg-[#1a1a1e] tw-px-3 tw-pt-2 tw-border-b tw-border-slate-800"
        >
          <div class="tw-flex tw-items-center tw-gap-1.5 tw-px-1 tw-pb-2">
            <span
              class="tw-w-2.5 tw-h-2.5 tw-rounded-full tw-bg-rose-500/80 tw-inline-block"
            ></span>
            <span
              class="tw-w-2.5 tw-h-2.5 tw-rounded-full tw-bg-amber-500/80 tw-inline-block"
            ></span>
            <span
              class="tw-w-2.5 tw-h-2.5 tw-rounded-full tw-bg-emerald-500/80 tw-inline-block"
            ></span>
          </div>

          <div class="tw-flex tw-gap-1" role="tablist" aria-label="克隆内容视图">
            <button
              type="button"
              role="tab"
              :aria-selected="activeTab === 'code'"
              class="tw-px-4 tw-py-1.5 tw-text-xs tw-font-mono tw-rounded-none tw-transition-all tw-duration-150 tw-border-t-2 tw-outline-none cursor-pointer"
              :class="
                activeTab === 'code'
                  ? 'tw-text-[#fafafc] tw-border-[#fafafc] tw-font-semibold'
                  : 'tw-bg-transparent tw-text-slate-400 tw-border-transparent hover:tw-text-slate-200 hover:tw-bg-slate-800/50'
              "
              @click="activeTab = 'code'"
            >
              <i class="el-icon-document tw-mr-1"></i>appCode.vue
            </button>
            <button
              type="button"
              role="tab"
              :aria-selected="activeTab === 'prompt'"
              class="tw-px-4 tw-py-1.5 tw-text-xs tw-font-mono tw-rounded-none tw-transition-all tw-duration-150 tw-border-t-2 tw-outline-none cursor-pointer"
              :class="
                activeTab === 'prompt'
                  ? 'tw-text-[#fafafc] tw-border-[#fafafc] tw-font-semibold'
                  : 'tw-bg-transparent tw-text-slate-400 tw-border-transparent hover:tw-text-slate-200 hover:tw-bg-slate-800/50'
              "
              @click="activeTab = 'prompt'"
            >
              <i class="el-icon-chat-square tw-mr-1"></i>appPrompt.md
            </button>
          </div>

          <div class="tw-w-12"></div>
        </div>

        <!-- 唯一内部滚动区：代码展示面板 -->
        <div
          class="tw-flex-1 tw-min-h-0 tw-overflow-y-auto tw-p-4 tw-bg-[#1a1a1e] custom-scrollbar"
        >
          <pre
            v-show="activeTab === 'code'"
            class="tw-m-0 tw-whitespace-pre-wrap tw-break-words tw-font-mono tw-text-xs tw-leading-relaxed tw-text-slate-200 tw-selection:bg-[#a5a5aa]/40"
          ><code>{{ codeContent || '// 暂无解析代码，请在上方输入 URL 并点击“解析 Manifest”' }}</code></pre>

          <pre
            v-show="activeTab === 'prompt'"
            class="tw-m-0 tw-whitespace-pre-wrap tw-break-words tw-font-mono tw-text-xs tw-leading-relaxed tw-text-emerald-300 tw-selection:bg-emerald-500/40"
          ><code>{{ promptContent || '（暂无 Prompt 内容）' }}</code></pre>
        </div>

        <!-- IDE 底部 Statusbar -->
        <div
          class="tw-flex-none tw-px-3 tw-py-1 tw-bg-[#1a1a1e] tw-border-t tw-border-slate-800 tw-flex tw-justify-between tw-items-center tw-text-[10px] tw-text-slate-400 tw-font-mono"
        >
          <span>UTF-8</span>
          <span>{{ activeTab === "code" ? "Vue / SFC" : "Markdown" }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "CloneAppPanel",

  emits: ["confirm"],

  data() {
    return {
      manifestUrl: "",
      cloneMode: "url",
      localCodeFile: null,
      localCodeName: "",
      localPromptFile: null,
      localPromptName: "",
      localReading: false,
      loading: false,
      confirming: false,
      isValid: false,
      isCloned: false,
      iframeLoading: false,
      statusMessage: "",
      statusType: "info",
      activeTab: "code",
      codeContent: "",
      promptContent: "",
      currentAppUrl: "",
    };
  },

  methods: {
    async handleFetchManifest() {
      if (!this.manifestUrl) {
        this.setStatus("请输入有效 URL", "error");
        return;
      }

      this.resetState();
      this.loading = true;
      this.setStatus("正在拉取 manifest.json 并校验文件组合...", "info");

      try {
        const response = await fetch(this.manifestUrl);
        if (!response.ok) {
          throw new Error(`网络响应错误，HTTP状态码: ${response.status}`);
        }
        const manifest = await response.json();

        const fileList = manifest.fileList || [];
        if (!fileList.includes("appCode.vue")) {
          this.setStatus(
            "无效克隆对象：manifest.json 的 fileList 中缺少 appCode.vue",
            "error"
          );
          return;
        }

        const baseUrl = this.manifestUrl.replace(/manifest\.json(\?.*)?$/i, "");
        const [codeText, promptText] = await Promise.all([
          fetch(`${baseUrl}appCode.vue`).then((res) => {
            if (!res.ok) throw new Error("无法读取 appCode.vue 文件");
            return res.text();
          }),
          fetch(`${baseUrl}appPrompt.md`).then(async (res) => {
            return res.ok ? await res.text() : "";
          }),
        ]);

        this.codeContent = codeText;
        this.promptContent = promptText;
        this.isValid = true;
        this.activeTab = "code";
        this.setStatus("解析成功，对应克隆文件已载入。", "success");
      } catch (err) {
        this.setStatus(`解析失败: ${err.message}`, "error");
      } finally {
        this.loading = false;
      }
    },
    handleConfirm() {
      if (!this.isValid || this.confirming) return;
      this.doClone();
    },

    handleLocalClone() {
      if (this.confirming) return;
      if (!this.localCodeName || !this.codeContent) {
        this.setStatus("请先选择 appCode.vue 文件", "error");
        return;
      }
      this.doClone();
    },

    doClone() {
      this.confirming = true;
      this.setStatus("正在提交克隆配置...", "info");
      try {
        aigcInterface.checkLogined(
          () => {
            WebTool.cloneAppItem(this.codeContent, this.promptContent, (id) => {
              this.currentAppUrl = `${location.origin}?id=${id}`;
              this.currentAppId = id;
              this.confirming = false;
              this.isCloned = true;
              this.iframeLoading = true;
              this.setStatus("克隆应用确认成功！", "success");
              this.$emit("confirm", { id, url: this.currentAppUrl });
            });
          },
          (e) => {}
        );
      } catch (err) {
        this.confirming = false;
        const errorMsg = typeof err === "string" ? err : err?.message;
        this.setStatus(`提交失败: ${errorMsg || "未知错误"}`, "error");
      }
    },

    switchCloneMode(mode) {
      if (this.cloneMode === mode) return;
      this.cloneMode = mode;
      this.clearLocalFiles();
      this.resetState();
    },

    triggerCodeFileSelect() {
      this.$refs.codeFileInput && this.$refs.codeFileInput.click();
    },

    triggerPromptFileSelect() {
      this.$refs.promptFileInput && this.$refs.promptFileInput.click();
    },

    async handleCodeFileChange(event) {
      const file = event.target.files && event.target.files[0];
      event.target.value = "";
      if (!file) return;

      if (!/\.vue$/i.test(file.name)) {
        this.setStatus("appCode.vue 必须是 .vue 后缀的文件", "error");
        return;
      }

      this.localReading = true;
      try {
        const text = await this.readFileAsText(file);
        if (!text || !text.trim()) {
          this.setStatus("appCode.vue 文件内容为空", "error");
          return;
        }
        this.localCodeFile = file;
        this.localCodeName = file.name;
        this.codeContent = text;
        this.activeTab = "code";
        this.setStatus(`已载入 ${file.name}，可一键克隆`, "success");
      } catch (err) {
        this.setStatus(`读取失败: ${err.message || "未知错误"}`, "error");
      } finally {
        this.localReading = false;
      }
    },

    async handlePromptFileChange(event) {
      const file = event.target.files && event.target.files[0];
      event.target.value = "";
      if (!file) return;

      if (!/\.md$/i.test(file.name)) {
        this.setStatus("appPrompt.md 必须是 .md 后缀的文件", "error");
        return;
      }

      this.localReading = true;
      try {
        const text = await this.readFileAsText(file);
        this.localPromptFile = file;
        this.localPromptName = file.name;
        this.promptContent = text || "";
        this.activeTab = "prompt";
        this.setStatus(`已载入 ${file.name}`, "success");
      } catch (err) {
        this.setStatus(`读取失败: ${err.message || "未知错误"}`, "error");
      } finally {
        this.localReading = false;
      }
    },

    clearCodeFile() {
      this.localCodeFile = null;
      this.localCodeName = "";
      this.codeContent = "";
      this.setStatus("已清除 appCode.vue 文件", "info");
    },

    clearPromptFile() {
      this.localPromptFile = null;
      this.localPromptName = "";
      this.promptContent = "";
      this.setStatus("已清除 appPrompt.md 文件", "info");
    },

    clearLocalFiles() {
      this.localCodeFile = null;
      this.localCodeName = "";
      this.localPromptFile = null;
      this.localPromptName = "";
      this.localReading = false;
    },

    readFileAsText(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("文件读取失败"));
        reader.readAsText(file);
      });
    },

    // 新增：复制 URL 到剪贴板
    async handleCopyUrl() {
      if (!this.currentAppUrl) return;
      try {
        await navigator.clipboard.writeText(this.currentAppUrl);
        this.$message?.success
          ? this.$message.success("预览 URL 已成功复制到剪贴板")
          : alert("预览 URL 已复制");
      } catch (e) {
        this.$message?.error
          ? this.$message.error("复制失败，请手动选择复制")
          : alert("复制失败");
      }
    },

    resetState() {
      this.isCloned = false;
      this.isValid = false;
      this.currentAppUrl = "";
      this.codeContent = "";
      this.promptContent = "";
      this.statusMessage = "";
      this.activeTab = "code";
    },

    setStatus(msg, type = "info") {
      this.statusMessage = msg;
      this.statusType = type;
    },
  },
  async mounted() {
    if(this.manifestUrl) {
      await this.handleFetchManifest();
      await this.handleConfirm();
      this.$message({
        type: "success",
        message: "已经克隆成功, 即将跳转!"
      });
      setTimeout(()=>{
        location.href = this.currentAppUrl + "&solo=true";
      }, 2000);
    }
  }
};
</script>

<style scoped>
/* ============================================
   DESIGN TOKENS — 白与空 · 原研哉设计规范
   ============================================ */
.cloneAppRoot {
  --muse-primary: #1a1a1e;
  --muse-primary-hover: #2b2b31;
  --muse-primary-active: #000000;
  --muse-primary-soft: rgba(26, 26, 30, 0.04);
  --muse-primary-ring: rgba(26, 26, 30, 0.16);

  --muse-bg: #fafafc;
  --muse-card: #f8f8fa;
  --muse-surface: #ffffff;

  --muse-text: #1a1a1e;
  --muse-text-secondary: #6e6e73;
  --muse-text-tertiary: #a5a5aa;

  --muse-border: #e7e7eb;
  --muse-border-strong: #9999a0;
  --muse-hover: rgba(26, 26, 30, 0.05);

  --glass-bg: #ffffff;
  --glass-shadow: 0 1px 2px rgba(20, 20, 30, 0.04),
    0 8px 24px rgba(20, 20, 30, 0.06);
  --glass-shadow-hover: 0 2px 4px rgba(20, 20, 30, 0.05),
    0 12px 32px rgba(20, 20, 30, 0.09);

  --radius-xs: 0px;
  --radius-sm: 0px;
  --radius-md: 0px;
  --radius-lg: 0px;
  --radius-xl: 0px;
  --radius-2xl: 0px;
  --radius-3xl: 0px;
  --radius-card: 0px;
  --radius-full: 2px;

  --duration-fast: 0.12s;
  --duration-base: 0.18s;
  --duration-slow: 0.28s;
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);

  --font-system: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
    "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
}

.cloneAppRoot[data-theme="dark"] {
  --muse-primary: #fafafc;
  --muse-primary-hover: #a5a5aa;
  --muse-primary-active: #000000;
  --muse-primary-soft: rgba(26, 26, 30, 0.10);
  --muse-primary-ring: rgba(26, 26, 30, 0.16);

  --muse-bg: #1a1a1e;
  --muse-card: #2b2b31;
  --muse-surface: #3a3a40;

  --muse-text: #fafafc;
  --muse-text-secondary: #a5a5aa;
  --muse-text-tertiary: #6e6e73;

  --muse-border: rgba(250, 250, 252, 0.10);
  --muse-border-strong: rgba(250, 250, 252, 0.20);
  --muse-hover: rgba(250, 250, 252, 0.12);

  --glass-bg: rgba(26, 26, 30, 0.72);
  --glass-shadow: 0 1px 2px rgba(0, 0, 0, 0.5), 0 8px 24px rgba(0, 0, 0, 0.5);
  --glass-shadow-hover: 0 2px 4px rgba(0, 0, 0, 0.55),
    0 12px 32px rgba(0, 0, 0, 0.55);
}

/* 页面背景 — 纸白 + 细点纹理 */
.cloneAppRoot {
  position: relative;
  font-family: var(--font-system);
  color: var(--muse-text);
  background-color: var(--muse-bg);
  background-image: radial-gradient(
      ellipse 70% 55% at 15% 0%,
      rgba(26, 26, 30, 0.03) 0%,
      transparent 55%
    ),
    radial-gradient(
      ellipse 55% 45% at 100% 100%,
      rgba(26, 26, 30, 0.02) 0%,
      transparent 55%
    ),
    radial-gradient(
      circle at 1px 1px,
      rgba(148, 163, 184, 0.22) 1px,
      transparent 0
    );
  background-size: auto, auto, 26px 26px;
}

/* 模式切换按钮 */
.cloneModeBtn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 14px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  color: #6e6e73;
  background: transparent;
  border: none;
  border-radius: 0px;
  cursor: pointer;
  transition: all var(--duration-base, 0.18s) var(--ease-out, ease);
  outline: none;
  white-space: nowrap;
}
.cloneModeBtn:hover {
  color: #1a1a1e;
}
.cloneModeBtn.is-active {
  background: #ffffff;
  color: var(--muse-primary, #1a1a1e);
  box-shadow: 0 1px 3px #9999a0;
}

/* 全局锁死页面外层滚动 */
:global(html),
:global(body) {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden !important;
}

/* 内部代码专属暗色滚动条 */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #1a1a1e;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #6e6e73;
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a5a5aa;
}

/* ==========================================================================
   GOV.UK 服务设计规范适配层
   - 16px 最小正文、19px 主要说明；GDS 绿按钮与黄色焦点
   - 直角卡片、1px 描边；代码面板保留深色但放大字号
   ========================================================================== */
.cloneAppRoot {
  --gds-black: #0b0c0c;
  --gds-blue: #1d70b8;
  --gds-green: #00703c;
  --gds-green-hover: #005a30;
  --gds-green-shadow: #002d18;
  --gds-red: #d4351c;
  --gds-yellow: #ffdd00;
  --gds-grey: #f3f2f1;
  --gds-border: #b1b4b6;
  --gds-secondary: #505a5f;
  --gds-font: "GDS Transport", Arial, "Noto Sans SC", "Source Han Sans SC",
    "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;

  --muse-primary: var(--gds-green);
  --muse-primary-hover: var(--gds-green-hover);
  --muse-primary-active: var(--gds-green-shadow);
  --muse-text: var(--gds-black);
  --muse-text-secondary: var(--gds-secondary);
  --muse-text-tertiary: #6f777b;
  --muse-border: var(--gds-border);
  --muse-border-strong: var(--gds-black);
  --muse-bg: #ffffff;
  --muse-surface: #ffffff;
  --muse-card: #ffffff;
  --font-system: var(--gds-font);

  max-width: 1020px;
  padding: 20px 15px;
  background: #ffffff;
  font-family: var(--gds-font);
  color: var(--gds-black);
  font-size: 1.1875rem;
  line-height: 1.5;

  --el-color-primary: var(--gds-green);
  --el-color-primary-light-3: var(--gds-green-hover);
  --el-color-success: var(--gds-green);
  --el-color-danger: var(--gds-red);
  --el-border-radius-base: 0;
  --el-border-color: var(--gds-border);
  --el-text-color-primary: var(--gds-black);
  --el-input-border-color: var(--gds-black);
  --el-input-focus-border-color: var(--gds-black);
  --el-dialog-border-radius: 0;
  --el-card-border-radius: 0;
  --el-font-size-base: 1.1875rem;
  --el-font-size-small: 1rem;
  --el-component-size-small: 44px;
  --el-component-size: 44px;
}

.cloneAppRoot h3,
.cloneAppRoot h3.tw-text-sm {
  font-family: var(--gds-font) !important;
  font-size: 1.5rem !important;
  font-weight: 700 !important;
  line-height: 1.25 !important;
  color: var(--gds-black) !important;
}

/* 顶部说明与状态信息：不低于 16px */
.cloneAppRoot [class*="tw-text-[10px]"],
.cloneAppRoot [class*="tw-text-[11px]"],
.cloneAppRoot .tw-text-xs,
.cloneAppRoot .tw-text-sm {
  font-size: 1rem !important;
  line-height: 1.5 !important;
}

.cloneAppRoot .cloneModeBtn {
  min-height: 44px;
  padding: 8px 15px;
  border: 1px solid transparent;
  border-radius: 0;
  background: #ffffff;
  color: var(--gds-black);
  font-family: var(--gds-font);
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.25;
  cursor: pointer;
}

.cloneAppRoot .cloneModeBtn + .cloneModeBtn {
  border-left: 1px solid var(--gds-border);
}

.cloneAppRoot .cloneModeBtn.is-active {
  background: var(--gds-black);
  color: #ffffff;
  font-weight: 700;
}

.cloneAppRoot .cloneModeBtn:focus-visible {
  outline: 3px solid transparent;
  outline-offset: 0;
  background: var(--gds-yellow);
  color: var(--gds-black);
  box-shadow: 0 2px 0 var(--gds-black);
}

.cloneAppRoot .localFileCard {
  border: 1px solid var(--gds-border) !important;
  border-radius: 0;
  background: #ffffff;
  padding: 15px !important;
}

.cloneAppRoot .localFileCard:hover {
  border-color: var(--gds-black) !important;
}

.cloneAppRoot .el-input {
  font-size: 1rem;
}

.cloneAppRoot .el-input:focus-within {
  outline: 3px solid var(--gds-yellow);
  outline-offset: 0;
}

.cloneAppRoot .el-input__wrapper {
  box-shadow: inset 0 0 0 2px var(--gds-black) !important;
}

.cloneAppRoot .el-input__wrapper {
  min-height: 44px;
  border-radius: 0 !important;
  box-shadow: inset 0 0 0 2px var(--gds-black) !important;
}

.cloneAppRoot .el-input__wrapper.is-focus {
  box-shadow: inset 0 0 0 2px var(--gds-black),
    0 0 0 3px var(--gds-yellow) !important;
}

.cloneAppRoot .el-button {
  min-height: 44px;
  padding: 8px 15px;
  border-radius: 0 !important;
  font-family: var(--gds-font);
  font-size: 1rem;
  font-weight: 400;
  letter-spacing: 0;
}

.cloneAppRoot .el-button:focus-visible {
  outline: 3px solid transparent;
  outline-offset: 0;
  background: var(--gds-yellow) !important;
  border-color: var(--gds-yellow) !important;
  color: var(--gds-black) !important;
  box-shadow: 0 2px 0 var(--gds-black) !important;
}

.cloneAppRoot .el-button--primary,
.cloneAppRoot .el-button--success {
  background: var(--gds-green) !important;
  border-color: var(--gds-green) !important;
  color: #ffffff !important;
  box-shadow: 0 2px 0 var(--gds-green-shadow) !important;
}

.cloneAppRoot .el-button--primary:hover,
.cloneAppRoot .el-button--success:hover {
  background: var(--gds-green-hover) !important;
  border-color: var(--gds-green-hover) !important;
}

.cloneAppRoot .el-button--primary.is-disabled,
.cloneAppRoot .el-button--success.is-disabled {
  background: var(--gds-grey) !important;
  border-color: var(--gds-grey) !important;
  color: var(--gds-secondary) !important;
  box-shadow: none !important;
  opacity: 1 !important;
}

.cloneAppRoot .tw-bg-slate-100,
.cloneAppRoot .tw-bg-white {
  background-color: #ffffff !important;
}

.cloneAppRoot [class*="tw-bg-[#1a1a1e]"] {
  background-color: var(--gds-black) !important;
}

.cloneAppRoot [class*="tw-bg-[#fafafc]"] {
  background-color: #ffffff !important;
}

/* IDE 代码面板：保留深色底，字号抬到 16px */
.cloneAppRoot pre,
.cloneAppRoot pre code {
  font-size: 1rem !important;
  line-height: 1.6 !important;
}

.cloneAppRoot [class*="tw-text-[10px]"].tw-font-mono {
  font-size: 1rem !important;
}

.cloneAppRoot .tw-text-slate-400 {
  color: #b1b4b6 !important;
}

.cloneAppRoot button[role="tab"] {
  min-height: 44px;
  padding: 8px 15px;
  color: #b1b4b6 !important;
  background: transparent !important;
  border: 0 !important;
  border-top: 3px solid transparent !important;
  font-family: var(--gds-font);
  font-size: 1rem !important;
  line-height: 1.25;
}

.cloneAppRoot button[role="tab"][aria-selected="true"] {
  color: #ffffff !important;
  border-top-color: #ffffff !important;
  font-weight: 700;
}

.cloneAppRoot button[role="tab"]:focus-visible {
  outline: 3px solid var(--gds-yellow);
  outline-offset: 0;
  color: var(--gds-black) !important;
  background: var(--gds-yellow) !important;
}

.cloneAppRoot h3.tw-text-sm {
  font-size: 1.5rem !important;
}

@media (max-width: 640px) {
  .cloneAppRoot {
    height: 100dvh !important;
    padding: 12px;
  }

  .cloneAppRoot > * {
    min-width: 0;
  }

  .cloneAppRoot h3 {
    font-size: 1.25rem !important;
  }

  /* 顶部标题条：隐藏装饰性英文，避免把标题挤到换行 */
  .cloneHeader {
    flex-wrap: wrap;
    gap: 4px 8px;
  }

  .cloneHeaderMeta {
    display: none !important;
  }

  /* 模式切换：等宽铺满 */
  .cloneModeTabs {
    width: 100%;
  }

  .cloneModeTabs .cloneModeBtn {
    flex: 1 1 0;
    justify-content: center;
    padding-left: 8px;
    padding-right: 8px;
    white-space: nowrap;
  }

  /* URL 克隆：输入框独占一行，两个按钮并排 */
  .cloneUrlRow {
    flex-wrap: wrap;
    row-gap: 8px;
  }

  .cloneUrlRow .el-input {
    flex: 1 1 100%;
    width: 100%;
  }

  .cloneUrlRow .el-button {
    flex: 1 1 0;
    margin-left: 0 !important;
    padding-left: 10px;
    padding-right: 10px;
  }

  /* 本地克隆操作条 */
  .localCloneBar {
    flex-wrap: wrap;
    row-gap: 8px;
  }

  .localCloneBar > span {
    flex: 1 1 140px;
    min-width: 0;
  }

  .localCloneBar .el-button {
    flex: 0 0 auto;
  }

  /* 克隆成功后的地址栏：地址独占一行 */
  .previewUrlBar {
    flex-wrap: wrap;
    row-gap: 8px;
  }

  .previewUrlBar > span:first-child {
    flex: 0 0 auto;
  }

  .clonePreviewAddress {
    flex: 1 1 100%;
    order: 2;
  }

  .clonePreviewActions {
    order: 3;
    margin-left: auto;
  }

  /* IDE 头部：隐藏右侧占位，Tab 可横向收缩 */
  .cloneIdeHeader {
    gap: 6px;
    padding-left: 10px;
    padding-right: 10px;
  }

  .cloneIdeHeader [role="tablist"] {
    flex: 1 1 auto;
    min-width: 0;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .cloneIdeHeader [role="tablist"]::-webkit-scrollbar {
    display: none;
  }

  .cloneIdeHeader [role="tab"] {
    padding: 8px 10px !important;
    font-size: 0.875rem !important;
    white-space: nowrap;
  }

  .cloneIdeHeader .tw-w-12 {
    display: none;
  }
}

@media (max-width: 640px) and (max-height: 620px) {
  /* 矮屏（如 iPhone SE）：允许整页纵向滚动，避免代码区被压到不可用 */
  .cloneAppRoot {
    overflow-x: hidden !important;
    overflow-y: auto !important;
  }

  .cloneAppRoot > .tw-flex-1 {
    min-height: 220px;
  }
}

@media (max-width: 360px) {
  /* 极窄屏让出装饰性红黄绿灯，保证两个 Tab 完整可见 */
  .cloneIdeHeader > div:first-child {
    display: none;
  }

  .cloneIdeHeader [role="tab"] {
    padding: 8px 8px !important;
    font-size: 0.8125rem !important;
  }
}
</style>