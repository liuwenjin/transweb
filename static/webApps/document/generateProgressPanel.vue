<template>
  <div
    class="progress-panel tw-w-full tw-h-full tw-bg-white tw-rounded-none tw-border tw-border-[#ebebef] tw-relative tw-overflow-hidden"
  >
    <!-- 背景动态光晕 -->
    <div
      class="bg-glow"
      :class="{ 'bg-glow--active': content.status === 'loading' }"
    ></div>

    <!-- Header -->
    <div
      class="tw-flex tw-items-center tw-justify-between tw-px-5 tw-py-4 tw-border-b tw-border-[#e7e7eb] tw-relative tw-z-10"
    >
      <div class="header-left tw-flex tw-items-center tw-gap-3">
        <!-- 状态图标 -->
        <div class="status-icon" :class="statusIconClass">
          <span v-if="content.status === 'loading'" class="icon-pulse">⚡</span>
          <span v-else-if="content.status === 'done'">✨</span>
          <span v-else-if="content.status === 'error'">⚠️</span>
          <span v-else>🤖</span>
        </div>

        <div class="title-col tw-flex tw-flex-col">
          <span
            v-html="content.title"
            class="tw-text-sm tw-font-semibold tw-text-gray-700 progressTitleItem"
          ></span>
          <!-- inline percent when collapsed -->
          <span
            v-if="
              collapsed &&
              content.showPercentInline &&
              content.status === 'loading'
            "
            class="tw-text-xs tw-text-[#a5a5aa] tw-font-medium tw-mt-0.5"
          >
            {{ progress }}% · {{ formattedElapsed }}
          </span>
        </div>
      </div>

      <!-- Hint 动态提示 -->
      <div
        v-if="content.hint && content.status === 'loading'"
        style="display: inline-block; float: right; text-align: right"
        class="hint-area tw-relative tw-z-10"
      >
        <div class="hint-bubble" style="margin-right: 12px">
          <span class="hint-dot"></span>
          <span class="tw-text-xs tw-text-[#6e6e73] tw-font-medium hint-text">
            {{ displayHint }}
          </span>
        </div>

        <button
          class="cancel-btn tw-text-xs tw-text-gray-400 hover:tw-text-gray-600 tw-px-2 tw-py-1 tw-rounded-none tw-transition-all"
          @click="goBack"
        >
          {{ t("progressPanel.cancel") }}
        </button>
      </div>
    </div>

    <!-- Progress bar -->
    <div class="tw-px-5 tw-pt-2 tw-pb-2 tw-relative tw-z-10">
      <el-progress
        :percentage="progress"
        :status="progressStatus"
        :stroke-width="6"
        :color="progressColors"
      />
    </div>

    <!-- Steps -->
    <div
      v-if="!collapsed && content.steps.length"
      class="tw-px-5 tw-pt-2 tw-pb-2 tw-relative tw-z-10"
    >
      <ul class="tw-space-y-2.5">
        <li
          v-for="(step, index) in content.steps"
          :key="index"
          class="step-item tw-flex tw-items-center tw-text-sm tw-rounded-none tw-px-2 tw-py-2 tw-transition-all tw-duration-500"
          :class="getStepItemClass(index)"
        >
          <!-- 完成 -->
          <span
            v-if="index < displayStage"
            class="step-icon step-icon--done tw-mr-2.5"
          >
            ✓
          </span>

          <!-- 进行中 -->
          <span
            v-else-if="index === currentStage && content.status === 'loading'"
            class="step-icon step-icon--active tw-mr-2.5"
          >
            <span class="spinner">◐</span>
          </span>

          <!-- 错误 -->
          <span
            v-else-if="index === currentStage && content.status === 'error'"
            class="step-icon step-icon--error tw-mr-2.5"
          >
            ✕
          </span>

          <!-- 未开始 -->
          <span v-else class="step-icon step-icon--pending tw-mr-2.5"> · </span>

          <span class="step-text tw-flex-1" :class="getStepTextClass(index)">
            {{ step }}
          </span>

          <!-- 完成打钩动效标签 -->
          <span v-if="index < displayStage" class="step-badge-done tw-text-xs">
            {{ t("progressPanel.done") }}
          </span>
          <span
            v-else-if="index === currentStage && content.status === 'loading'"
            class="step-badge-active tw-text-xs"
          >
            {{ t("progressPanel.active") }}
          </span>
        </li>
      </ul>
    </div>

    <!-- 趣味等待语句 -->
    <div
      v-if="content.status === 'loading'"
      class="fun-tip tw-px-5 tw-pt-0 tw-pb-1 tw-relative tw-z-10"
    >
      <p
        class="tw-text-xs tw-text-gray-400 tw-italic tw-transition-all tw-duration-700"
      >
        {{ currentFunTip }}
      </p>
    </div>

    <!-- Error -->
    <div
      v-if="content.status === 'error'"
      class="tw-mx-5 tw-my-3 tw-p-3 tw-rounded-none tw-bg-[#f8f3f2] tw-border tw-border-[#a0554a]/30 tw-text-sm tw-text-[#a0554a] tw-flex tw-items-center tw-gap-2 tw-relative tw-z-10"
    >
      <span class="tw-text-base">😕</span>
      <span>{{ content.errorMessage || t("progressPanel.error") }}</span>
    </div>

    <!-- Done 完成提示 -->
    <div
      v-if="content.status === 'done'"
      class="tw-mx-5 tw-my-3 tw-p-2 tw-rounded-none tw-bg-[#f8f8fa] tw-border tw-border-[#e7e7eb] tw-text-sm tw-text-[#1a1a1e] tw-flex tw-items-center tw-gap-2 tw-relative tw-z-10"
    >
      <span class="tw-text-base">🎉</span>
      <span>{{ t("progressPanel.ready") }}</span>
    </div>

    <!-- 底部：耗时 -->
    <div
      v-if="content.status === 'loading' || content.status === 'done'"
      class="tw-absolute tw-right-5 tw-bottom-3 tw-flex tw-items-center tw-gap-1.5 tw-text-xs tw-text-gray-400 tw-z-10"
    >
      <span
        class="tw-inline-block tw-w-1.5 tw-h-1.5 tw-rounded-full tw-bg-gray-300"
        :class="{ 'pulse-dot': content.status === 'loading' }"
      >
      </span>
      <span>{{ formattedElapsed }}</span>
    </div>
  </div>
</template>

<script>
// 趣味等待语句兜底词表（中英双语）：优先使用 creator.html 注入的 window.__I18N__，
// 未注入时回退到此处，保证组件脱离 creator.html 也能独立渲染中英文。

export default {
  name: "GenerateProgressPanel",

  data() {
    return {
      collapsed: false,
      // 当前语言：由父页面 creator.html 的 window.__APP_LANG__ / applangchange 驱动
      lang: window.__APP_LANG__ === "en" ? "en" : "zh",
      startTimestamp: null,
      progressTimer: null,
      finishTimer: null,
      funTipTimer: null,
      showBackBtn: false,
      progress: 0,
      elapsed: 0,
      isRunning: false,
      isFinishing: false,
      currentFunTipIndex: 0,
      displayHint: "",
      hintAnimating: false,
      FUN_TIPS_FALLBACK: {
        zh: [
          "AI 正在认真思考，比我上班还努力…",
          "正在召唤神经元，请稍候片刻 ☕",
          "模型齿轮高速运转中，别眨眼！",
          "每一行提示词都是精心雕琢的艺术品 🎨",
          "Agent 正在规划它的第一步棋 ♟️",
          "连接知识图谱，织入思维网络中…",
          "比泡一杯咖啡还快，我们赌一下？ ☕",
          "正在为你定制专属智能体，独一无二 ✨",
          "神经网络正在发光发热，字面意思 💡",
          "好的 Agent 值得等待，就像一道好菜 🍜",
        ],
        en: [
          "AI is thinking hard — harder than I work…",
          "Summoning neurons, hold on a moment ☕",
          "Model gears spinning at full speed — don't blink!",
          "Every prompt is a carefully crafted work of art 🎨",
          "The agent is planning its first move ♟️",
          "Connecting the knowledge graph, weaving it into the neural net…",
          "Faster than brewing a coffee — care to bet? ☕",
          "Crafting your one-of-a-kind agent ✨",
          "The neural network is literally lighting up 💡",
          "A good agent is worth the wait — like a good dish 🍜",
        ],
      },
      // 渐变进度条颜色（白与空：淡墨 → 松烟墨）
      progressColors: [
        { color: "#c9c9cf", percentage: 30 },
        { color: "#a5a5aa", percentage: 60 },
        { color: "#6e6e73", percentage: 85 },
        { color: "#1a1a1e", percentage: 100 },
      ],

      content: {
        title:
          (window.__t__ && window.__t__("progressPanel.title")) ||
          "正在构建你的应用…",
        status: "idle", // idle | loading | done | error
        steps: [],
        expectedDuration: 60000,
        enabled: false,
        hint: "",
        errorMessage: "",
        showPercentInline: true,
      },
    };
  },

  computed: {
    progressStatus() {
      if (this.content.status === "error") return "exception";
      if (this.content.status === "done") return "success";
      return "";
    },

    formattedElapsed() {
      const total = Math.floor(this.elapsed / 1000);
      const m = String(Math.floor(total / 60)).padStart(2, "0");
      const s = String(total % 60).padStart(2, "0");
      return `${m}:${s}`;
    },

    currentStage() {
      const stepsCount = this.content.steps.length;
      if (!stepsCount || !this.content.expectedDuration) return 0;
      const ratio = this.elapsed / this.content.expectedDuration;
      const effectiveRatio = Math.min(Math.max(ratio, 0), 0.95);
      const segmentSize = 0.95 / stepsCount;
      return Math.min(Math.floor(effectiveRatio / segmentSize), stepsCount - 1);
    },

    displayStage() {
      const stepsCount = this.content.steps.length;
      if (!stepsCount) return 0;
      if (this.content.status === "done") return stepsCount;
      return this.currentStage;
    },

    statusIconClass() {
      return {
        "status-icon--loading": this.content.status === "loading",
        "status-icon--done": this.content.status === "done",
        "status-icon--error": this.content.status === "error",
      };
    },

    // 趣味等待语句：随语言实时切换，优先读取 creator.html 的 window.__I18N__，回退到内置词表
    FUN_TIPS() {
      const dict = (window.__I18N__ && window.__I18N__[this.lang]) || {};
      const fallback =
        this.FUN_TIPS_FALLBACK[this.lang] || this.FUN_TIPS_FALLBACK.zh;
      const tips = [];
      for (let i = 1; i <= 10; i++) {
        const key = "progressPanel.tip" + i;
        tips.push(dict[key] !== undefined ? dict[key] : fallback[i - 1]);
      }
      return tips;
    },

    currentFunTip() {
      return this.FUN_TIPS[this.currentFunTipIndex % this.FUN_TIPS.length];
    },
  },

  mounted() {
    // 与父页面 creator.html 的语言状态保持一致
    this.lang = window.__APP_LANG__ === "en" ? "en" : "zh";
    window.addEventListener("applangchange", this.onLangChange);
    if (this.content.enabled) this.startDemo();
  },

  watch: {
    "content.enabled"(val) {
      if (val) this.startDemo();
    },
    "content.hint"(newHint) {
      this.animateHint(newHint);
    },
  },

  beforeUnmount() {
    window.removeEventListener("applangchange", this.onLangChange);
    this.stopDemo();
    this.stopFinish();
    this.stopFunTip();
  },

  methods: {
    // 文案翻译：优先读取父页面 creator.html 注入的全局词表（单一数据源）
    t(key, vars) {
      const i18n = window.__I18N__ || {};
      const dict = i18n[this.lang] || i18n.zh || {};
      let str = dict[key] !== undefined ? dict[key] : key;
      if (vars) {
        Object.keys(vars).forEach((k) => {
          str = str.replace(
            new RegExp("\\{" + k + "\\}", "g"),
            String(vars[k])
          );
        });
      }
      return str;
    },

    onLangChange(e) {
      this.lang = e && e.detail && e.detail.lang === "en" ? "en" : "zh";
    },

    open(cfg = {}) {
      Object.assign(this.content, cfg);
      if (this.content.enabled) this.startDemo();
    },

    startDemo() {
      if (this.isRunning || !this.content.steps.length) return;
      this.stopFinish();
      this.stopDemo();
      this.isRunning = true;
      this.content.status = "loading";
      this.startTimestamp = Date.now();
      this.elapsed = 0;
      this.progress = 0;
      this.currentFunTipIndex = Math.floor(
        Math.random() * this.FUN_TIPS.length
      );
      this.$nextTick(() => {
        this.startProgressTimer();
        this.startFunTipRotation();
      });
    },

    startProgressTimer() {
      const expected = this.content.expectedDuration;
      this.progressTimer = setInterval(() => {
        this.elapsed = Date.now() - this.startTimestamp;
        if (this.elapsed >= expected) {
          this.progress = 95;
        } else {
          const raw = Math.floor((this.elapsed / expected) * 100) - 5;
          this.progress = Math.max(0, Math.min(raw, 95));
        }
        if (this.content.status === "loading") {
          const stage = this.currentStage;
          const hint =
            this.content.steps[Math.min(stage, this.content.steps.length - 1)];
          if (hint && this.content.hint !== hint) {
            this.content.hint = hint;
          }
        }
      }, 300);
    },

    /** 趣味提示轮换 */
    startFunTipRotation() {
      this.funTipTimer = setInterval(() => {
        this.currentFunTipIndex =
          (this.currentFunTipIndex + 1) % this.FUN_TIPS.length;
      }, 4000);
    },

    stopFunTip() {
      if (this.funTipTimer) {
        clearInterval(this.funTipTimer);
        this.funTipTimer = null;
      }
    },

    /** Hint 文字动画切换 */
    animateHint(newHint) {
      if (this.hintAnimating) {
        this.displayHint = newHint;
        return;
      }
      this.hintAnimating = true;
      this.displayHint = "";
      setTimeout(() => {
        this.displayHint = newHint;
        this.hintAnimating = false;
      }, 200);
    },

    stopDemo() {
      if (this.progressTimer) {
        clearInterval(this.progressTimer);
        this.progressTimer = null;
      }
      this.isRunning = false;
    },

    finishSmoothly(duration = 1000, callback) {
      if (this.isFinishing || this.content.status === "done") return;
      this.stopDemo();
      this.stopFunTip();
      this.isFinishing = true;
      const startProgress = this.progress;
      const startTime = Date.now();
      this.finishTimer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const ratio = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - ratio, 2);
        this.progress = Math.floor(
          startProgress + (100 - startProgress) * eased
        );
        if (ratio >= 1) {
          this.stopFinish();
          this.progress = 100;
          this.elapsed = this.content.expectedDuration;
          this.content.status = "done";
          if (callback) setTimeout(callback, 200);
        }
      }, 16);
    },

    stopFinish() {
      if (this.finishTimer) {
        clearInterval(this.finishTimer);
        this.finishTimer = null;
      }
      this.isFinishing = false;
    },

    done(callback) {
      this.finishSmoothly(1000, () => {
        this.goBack(callback);
      });
    },

    goBack(callback) {
      this.stopDemo();
      this.stopFinish();
      this.stopFunTip();
      this.content.status = "idle";
      this.content.hint = "";
      if (typeof callback === "function") {
        callback();
      } else if (this._parent._parent && this._parent._parent.dialogData) {
        webCpu.CardItem.dismissMask(this._parent._parent.dialogData.parentCard);
      }
      webCpu.mitt.emit("generatePanelClosed");
    },

    error(message) {
      this.stopDemo();
      this.stopFinish();
      this.stopFunTip();
      this.content.status = "error";
      this.content.errorMessage = message || "";
    },

    getStepItemClass(index) {
      if (index < this.displayStage) return "step-item--done";
      if (index === this.currentStage && this.content.status === "loading")
        return "step-item--active";
      if (index === this.currentStage && this.content.status === "error")
        return "step-item--error";
      return "step-item--pending";
    },

    getStepTextClass(index) {
      if (index < this.displayStage) return "tw-text-gray-600";
      if (index === this.currentStage && this.content.status === "loading")
        return "tw-text-[#1a1a1e] tw-font-medium";
      if (index === this.currentStage && this.content.status === "error")
        return "tw-text-red-500 tw-font-medium";
      return "tw-text-gray-400";
    },
  },
};
</script>

<style scoped>
/* ─── 面板整体 ─── */
.progress-panel {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

/* ─── 背景光晕 ─── */
.bg-glow {
  position: absolute;
  top: -60px;
  right: -60px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(26, 26, 30, 0.04) 0%,
    transparent 70%
  );
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.8s ease;
}
.bg-glow--active {
  opacity: 1;
  animation: glowPulse 3s ease-in-out infinite;
}
@keyframes glowPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.15);
    opacity: 1;
  }
}

/* ─── 状态图标 ─── */
.status-icon {
  width: 30px;
  height: 30px;
  border-radius: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
  transition: all 0.4s ease;
}
.status-icon--loading {
  background: linear-gradient(135deg, #f3f3f5, #e7e7eb);
}
.status-icon--done {
  background: linear-gradient(135deg, #f3f3f5, #e7e7eb);
}
.status-icon--error {
  background: linear-gradient(135deg, #f8f3f2, #f0e0dd);
}

/* ⚡ 图标脉冲 */
.icon-pulse {
  display: inline-block;
  animation: iconBounce 1.2s ease-in-out infinite;
}
@keyframes iconBounce {
  0%,
  100% {
    transform: scale(1) rotate(-5deg);
  }
  50% {
    transform: scale(1.2) rotate(5deg);
  }
}

/* ─── 取消按钮 ─── */
.cancel-btn {
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}
.cancel-btn:hover {
  border-color: #e5e7eb;
  background: #f8f8fa;
}

/* ─── Hint 气泡 ─── */
.hint-bubble {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  /* background: linear-gradient(135deg, #f8f8fa, #f3f3f5);
  border: 1px solid #e7e7eb; 
  border-radius: 20px; */
  padding: 4px 12px;
}
.hint-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
  background: #1a1a1e;
  flex-shrink: 0;
  animation: dotBlink 1s ease-in-out infinite;
}
@keyframes dotBlink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}
.hint-text {
  transition: opacity 0.2s ease;
}

/* ─── Step 条目 ─── */
.step-item {
  transition: background 0.4s ease, transform 0.3s ease;
}
.step-item--done {
  background: #f3f3f5;
}
.step-item--active {
  background: linear-gradient(135deg, #f8f8fa, #f3f3f5);
  transform: translateX(2px);
  box-shadow: 0 1px 4px rgba(26, 26, 30, 0.08);
}
.step-item--error {
  background: #f8f3f2;
}
.step-item--pending {
  background: transparent;
}

/* ─── Step 图标 ─── */
.step-icon {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
  flex-shrink: 0;
}
.step-icon--done {
  background: #f3f3f5;
  color: #1a1a1e;
}
.step-icon--active {
  background: #1a1a1e;
  color: #ffffff;
}
.step-icon--error {
  background: #f8f3f2;
  color: #a0554a;
}
.step-icon--pending {
  background: #f3f3f5;
  color: #a5a5aa;
  font-size: 16px;
  line-height: 1;
}

/* 旋转动画 */
.spinner {
  display: inline-block;
  animation: spinStep 0.8s linear infinite;
}
@keyframes spinStep {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ─── Step 徽章 ─── */
.step-badge-done {
  color: #1a1a1e;
  background: #f3f3f5;
  border-radius: 0px;
  padding: 1px 7px;
  font-size: 10px;
  font-weight: 500;
}
.step-badge-active {
  color: #ffffff;
  background: #1a1a1e;
  border-radius: 0px;
  padding: 1px 7px;
  font-size: 10px;
  font-weight: 500;
  animation: badgePulse 1.5s ease-in-out infinite;
}
@keyframes badgePulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* ─── 趣味提示 ─── */
.fun-tip p {
  animation: tipFadeIn 0.7s ease;
}
@keyframes tipFadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ─── 底部计时点 ─── */
.pulse-dot {
  animation: pulseDot 1.2s ease-in-out infinite;
}
@keyframes pulseDot {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(0.6);
  }
}

/* ─── Element Plus 进度条覆写 ─── */
.el-progress__text {
  font-size: 12px !important;
  color: #1a1a1e;
  text-align: right;
  font-weight: 600;
}
.el-progress-bar__outer {
  border-radius: 0px;
  background: #e7e7eb;
}
.el-progress-bar__inner {
  border-radius: 0px;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.progressTitleItem {
  color: #6e6e73;
  letter-spacing: 0.01em;
}

/* ─── 移动端适配：防止折行 ─── */
.progressTitleItem,
.hint-text,
.step-text,
.step-badge-done,
.step-badge-active,
.cancel-btn {
  white-space: nowrap;
}

.header-left {
  min-width: 0;
  flex: 1;
}

.title-col {
  min-width: 0;
  flex: 1;
}

.progressTitleItem {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hint-area {
  flex-shrink: 0;
}

.hint-text {
  min-width: 0;
  max-width: 128px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.step-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cancel-btn,
.step-badge-done,
.step-badge-active,
.hint-dot,
.step-icon {
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .hint-text {
    max-width: 84px;
  }
  .hint-bubble {
    gap: 4px;
    padding: 4px 8px;
  }
}
</style>
