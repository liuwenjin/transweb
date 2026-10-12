<template>
  <!-- 主容器：严格锁定 100vh，隐藏外层所有溢出 -->
  <div
    class="cloneAppRoot tw-w-full tw-h-screen tw-max-w-6xl tw-mx-auto tw-p-4 tw-font-sans tw-flex tw-flex-col tw-overflow-hidden"
  >
    <!-- 顶部 Header -->
    <div
      class="tw-flex-none tw-mb-3 tw-flex tw-items-center tw-justify-between tw-border-b tw-border-slate-200 tw-pb-2.5"
    >
      <div class="tw-flex tw-items-center tw-gap-2">
        <div class="tw-w-2.5 tw-h-2.5 tw-rounded-full tw-bg-[#0066cc]"></div>
        <h3 class="tw-text-sm tw-font-semibold tw-text-slate-800 tw-m-0">
          应用克隆与预览面板
        </h3>
      </div>
      <span class="tw-text-[11px] tw-font-mono tw-text-slate-400"
        >TransWeb Engine Integrated</span
      >
    </div>

    <!-- 1. 操作区：输入框与按钮组 -->
    <div class="tw-flex-none tw-space-y-2.5 tw-mb-3">
      <div class="tw-flex tw-gap-2">
        <el-input
          v-model.trim="manifestUrl"
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

      <!-- 状态提示框 -->
      <div
        v-if="statusMessage && !isCloned"
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
    </div>

    <!-- 2. 主内容展示区（占用剩余所有空间） -->
    <div class="tw-flex-1 tw-min-h-0 tw-flex tw-flex-col">
      <!-- 视图 A：克隆成功后 iframe 预览 + URL 显示栏 -->
      <div
        v-if="isCloned && currentAppUrl"
        class="tw-w-full tw-h-full tw-flex tw-flex-col tw-border tw-border-slate-300 tw-rounded-lg tw-overflow-hidden tw-bg-white tw-shadow-sm"
      >
        <!-- 新增：模拟浏览器地址栏，展示并可一键复制 Iframe URL -->
        <div
          class="tw-flex-none tw-bg-slate-100 tw-px-3 tw-py-2 tw-border-b tw-border-slate-200 tw-flex tw-items-center tw-gap-2"
        >
          <span
            class="tw-text-xs tw-font-semibold tw-text-slate-500 tw-whitespace-nowrap tw-flex tw-items-center tw-gap-1"
          >
            <i class="el-icon-view"></i> 预览地址:
          </span>

          <!-- 极简地址展示框 -->
          <div
            class="tw-flex-1 tw-bg-white tw-border tw-border-slate-200 tw-rounded tw-px-2.5 tw-py-1 tw-text-xs tw-font-mono tw-text-slate-700 tw-truncate tw-select-all"
          >
            {{ currentAppUrl }}
          </div>

          <!-- 功能按钮：一键复制 & 新标签页打开 -->
          <div class="tw-flex tw-items-center tw-gap-1">
            <el-button
              size="small"
              type="text"
              class="!tw-text-slate-600 hover:!tw-text-[#0066cc] !tw-px-1.5"
              title="复制 URL"
              @click="handleCopyUrl"
            >
              <i class="el-icon-document-copy"></i> 复制
            </el-button>
            <a
              :href="currentAppUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="tw-text-xs tw-text-slate-600 hover:tw-text-[#0066cc] tw-no-underline tw-px-1.5 tw-py-1"
              title="新窗口打开"
            >
              <i class="el-icon-top-right"></i>
            </a>
          </div>
        </div>

        <!-- Iframe 实体容器 -->
        <div class="tw-flex-1 tw-relative tw-w-full tw-h-full tw-bg-[#eef3f0]">
          <transition name="el-fade-in">
            <div
              v-if="iframeLoading"
              class="tw-absolute tw-inset-0 tw-z-10 tw-flex tw-flex-col tw-items-center tw-justify-center tw-bg-white/90 tw-backdrop-blur-sm tw-text-slate-600 tw-text-xs"
            >
              <i
                class="el-icon-loading tw-text-2xl tw-mb-2 tw-text-[#0066cc]"
              ></i>
              <span>应用正在加载中...</span>
            </div>
          </transition>

          <iframe
            :src="currentAppUrl"
            class="tw-w-full tw-h-full tw-border-none"
            @load="iframeLoading = false"
          ></iframe>
        </div>
      </div>

      <!-- 视图 B：IDE 沉浸式代码/Prompt 面板 -->
      <div
        v-else
        class="tw-w-full tw-h-full tw-flex tw-flex-col tw-border tw-border-slate-800 tw-rounded-lg tw-overflow-hidden  tw-shadow-xl"
      >
        <!-- IDE Header / Tab 栏 -->
        <div
          class="tw-flex-none tw-flex tw-items-center tw-justify-between tw-bg-[#0b1220] tw-px-3 tw-pt-2 tw-border-b tw-border-slate-800"
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

          <div class="tw-flex tw-gap-1">
            <button
              type="button"
              class="tw-px-4 tw-py-1.5 tw-text-xs tw-font-mono tw-rounded-t-md tw-transition-all tw-duration-150 tw-border-t-2 tw-outline-none cursor-pointer"
              :class="
                activeTab === 'code'
                  ? 'tw-text-[#60a5fa] tw-border-[#3b82f6] tw-font-semibold'
                  : 'tw-bg-transparent tw-text-slate-400 tw-border-transparent hover:tw-text-slate-200 hover:tw-bg-slate-800/50'
              "
              @click="activeTab = 'code'"
            >
              <i class="el-icon-document tw-mr-1"></i>appCode.vue
            </button>
            <button
              type="button"
              class="tw-px-4 tw-py-1.5 tw-text-xs tw-font-mono tw-rounded-t-md tw-transition-all tw-duration-150 tw-border-t-2 tw-outline-none cursor-pointer"
              :class="
                activeTab === 'prompt'
                  ? 'tw-text-[#60a5fa] tw-border-[#3b82f6] tw-font-semibold'
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
          class="tw-flex-1 tw-min-h-0 tw-overflow-y-auto tw-p-4 tw-bg-[#0b1220] custom-scrollbar"
        >
          <pre
            v-show="activeTab === 'code'"
            class="tw-m-0 tw-whitespace-pre-wrap tw-break-words tw-font-mono tw-text-xs tw-leading-relaxed tw-text-slate-200 tw-selection:bg-[#0066cc]/40"
          ><code>{{ codeContent || '// 暂无解析代码，请在上方输入 URL 并点击“解析 Manifest”' }}</code></pre>

          <pre
            v-show="activeTab === 'prompt'"
            class="tw-m-0 tw-whitespace-pre-wrap tw-break-words tw-font-mono tw-text-xs tw-leading-relaxed tw-text-emerald-300 tw-selection:bg-emerald-500/40"
          ><code>{{ promptContent || '（暂无 Prompt 内容）' }}</code></pre>
        </div>

        <!-- IDE 底部 Statusbar -->
        <div
          class="tw-flex-none tw-px-3 tw-py-1 tw-bg-[#0b1220] tw-border-t tw-border-slate-800 tw-flex tw-justify-between tw-items-center tw-text-[10px] tw-text-slate-400 tw-font-mono"
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
    async handleConfirm() {
      if (!this.isValid || this.confirming) return;

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
   DESIGN TOKENS — Muse · 极简 · 精致（与 ChatBox 对齐）
   ============================================ */
.cloneAppRoot {
  --muse-primary: #0066cc;
  --muse-primary-hover: #0052a3;
  --muse-primary-active: #004c99;
  --muse-primary-soft: rgba(0, 102, 204, 0.08);
  --muse-primary-ring: rgba(0, 102, 204, 0.16);

  --muse-bg: #eef3f0;
  --muse-card: #f6f9f7;
  --muse-surface: #ffffff;

  --muse-text: #0f172a;
  --muse-text-secondary: #475569;
  --muse-text-tertiary: #94a3b8;

  --muse-border: rgba(15, 23, 42, 0.08);
  --muse-border-strong: rgba(15, 23, 42, 0.14);
  --muse-hover: rgba(15, 23, 42, 0.07);

  --glass-bg: rgba(255, 255, 255, 0.72);
  --glass-shadow: 0 1px 2px rgba(15, 23, 42, 0.04),
    0 8px 24px rgba(15, 23, 42, 0.06);
  --glass-shadow-hover: 0 2px 4px rgba(15, 23, 42, 0.05),
    0 12px 32px rgba(15, 23, 42, 0.09);

  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 10px;
  --radius-xl: 12px;
  --radius-2xl: 14px;
  --radius-3xl: 16px;
  --radius-card: 18px;
  --radius-full: 999px;

  --duration-fast: 0.12s;
  --duration-base: 0.18s;
  --duration-slow: 0.28s;
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);

  --font-system: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
    "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
}

.cloneAppRoot[data-theme="dark"] {
  --muse-primary: #3b82f6;
  --muse-primary-hover: #60a5fa;
  --muse-primary-active: #2563eb;
  --muse-primary-soft: rgba(59, 130, 246, 0.16);
  --muse-primary-ring: rgba(59, 130, 246, 0.28);

  --muse-bg: #0b1220;
  --muse-card: #111827;
  --muse-surface: #1e293b;

  --muse-text: #e2e8f0;
  --muse-text-secondary: #94a3b8;
  --muse-text-tertiary: #64748b;

  --muse-border: rgba(226, 232, 240, 0.08);
  --muse-border-strong: rgba(226, 232, 240, 0.16);
  --muse-hover: rgba(226, 232, 240, 0.1);

  --glass-bg: rgba(17, 24, 39, 0.72);
  --glass-shadow: 0 1px 2px rgba(0, 0, 0, 0.5), 0 8px 24px rgba(0, 0, 0, 0.5);
  --glass-shadow-hover: 0 2px 4px rgba(0, 0, 0, 0.55),
    0 12px 32px rgba(0, 0, 0, 0.55);
}

/* 页面背景 — 冰川灰 + 点阵纹理（对齐 ChatBox） */
.cloneAppRoot {
  position: relative;
  font-family: var(--font-system);
  color: var(--muse-text);
  background-color: var(--muse-bg);
  background-image: radial-gradient(
      ellipse 70% 55% at 15% 0%,
      rgba(0, 102, 204, 0.06) 0%,
      transparent 55%
    ),
    radial-gradient(
      ellipse 55% 45% at 100% 100%,
      rgba(0, 102, 204, 0.04) 0%,
      transparent 55%
    ),
    radial-gradient(
      circle at 1px 1px,
      rgba(148, 163, 184, 0.22) 1px,
      transparent 0
    );
  background-size: auto, auto, 26px 26px;
}

/* ============================================
   Muse 统一 · Element Plus 控件（对齐 ChatBox）
   ============================================ */
:deep(.el-button--primary) {
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

:deep(.el-button--primary:not(.is-disabled):hover) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 102, 204, 0.28);
}

:deep(.el-button--primary:not(.is-disabled):active) {
  transform: translateY(0) scale(0.98);
}

:deep(.el-button--success) {
  border-radius: 999px;
  font-weight: 600;
}

:deep(.el-input__wrapper) {
  border-radius: var(--radius-lg, 10px);
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--muse-primary, #0066cc) inset !important;
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
  background: #0b1220;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #475569;
}
</style>