<template>
  <div
    ref="containerRef"
    class="tw-relative tw-w-full tw-h-full tw-overflow-hidden aigc-loader"
  >
    <canvas
      ref="canvasRef"
      class="tw-absolute tw-inset-0 tw-w-full tw-h-full aigc-canvas"
    ></canvas>

    <div class="tw-absolute tw-inset-0 tw-pointer-events-none aigc-grid"></div>
    <div
      class="tw-absolute tw-inset-0 tw-pointer-events-none aigc-spotlight"
    ></div>
    <div
      class="tw-absolute tw-top-0 tw-left-0 tw-right-0 aigc-topline"
    ></div>

    <transition name="aigcvis-fade">
      <div
        v-if="!result"
        class="tw-absolute tw-inset-0 tw-z-[5] tw-flex tw-items-center tw-justify-center tw-pointer-events-none aigcvis-stage"
      >
        <svg
          class="aigcvis-svg"
          viewBox="0 0 600 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line
            v-for="(ln, i) in inputHiddenLines"
            :key="'ih' + i"
            :x1="ln.x1"
            :y1="ln.y1"
            :x2="ln.x2"
            :y2="ln.y2"
            class="aigcvis-synapse"
            :style="{ animationDelay: ln.delay + 's' }"
          />

          <line
            v-for="(ln, i) in hiddenOutputLines"
            :key="'ho' + i"
            :x1="ln.x1"
            :y1="ln.y1"
            :x2="ln.x2"
            :y2="ln.y2"
            class="aigcvis-synapse aigcvis-synapse--out"
            :style="{ animationDelay: ln.delay + 's' }"
          />

          <circle
            v-for="(n, i) in inputNodes"
            :key="'in' + i"
            :cx="n.x"
            :cy="n.y"
            :r="6"
            class="aigcvis-node aigcvis-node--input"
            :style="{ animationDelay: i * 0.15 + 's' }"
          />

          <circle
            v-for="(n, i) in hiddenNodes"
            :key="'hn' + i"
            :cx="n.x"
            :cy="n.y"
            :r="hiddenRadius(i)"
            class="aigcvis-node aigcvis-node--hidden"
            :style="{ animationDelay: i * 0.12 + 's' }"
          />

          <circle
            v-for="(n, i) in outputNodes"
            :key="'on' + i"
            :cx="n.x"
            :cy="n.y"
            :r="7"
            class="aigcvis-node aigcvis-node--output"
            :style="{ animationDelay: i * 0.18 + 's' }"
          />

          <circle cx="300" cy="200" :r="coreRadius" class="aigcvis-core" />
          <circle
            cx="300"
            cy="200"
            :r="coreRadius * 0.55"
            class="aigcvis-core-inner"
          />

          <path :d="waveformPath" class="aigcvis-waveform" />
          <path :d="distributionPath" class="aigcvis-distribution" />

          <circle
            :cx="dataParticle.x"
            :cy="dataParticle.y"
            r="4"
            class="aigcvis-particle"
          />

          <line
            :x1="attentionRay.x1"
            :y1="attentionRay.y1"
            :x2="attentionRay.x2"
            :y2="attentionRay.y2"
            class="aigcvis-attention"
          />
          <circle
            :cx="attentionRay.x2"
            :cy="attentionRay.y2"
            r="3"
            class="aigcvis-attention-dot"
          />

          <circle
            cx="300"
            cy="200"
            r="50"
            class="aigcvis-progress-track"
          />
          <path :d="progressArcPath" class="aigcvis-progress" />

          <circle
            v-for="(pt, i) in floatingTokens"
            :key="'tk' + i"
            :cx="pt.x"
            :cy="pt.y"
            :r="pt.r"
            class="aigcvis-token"
            :style="{ animationDelay: pt.delay + 's' }"
          />

          <text
            v-for="(f, i) in floatingPrompts"
            :key="'fp' + i"
            :x="f.x"
            :y="f.y"
            class="aigcvis-prompt"
            :style="{
              animationDelay: f.delay + 's',
              animationDuration: f.duration + 's',
            }"
          >
            {{ f.text }}
          </text>

          <line
            v-for="(ln, i) in mappingLines"
            :key="'ml' + i"
            :x1="ln.x1"
            :y1="ln.y1"
            :x2="ln.x2"
            :y2="ln.y2"
            class="aigcvis-mapping"
            :style="{ animationDelay: ln.delay + 's' }"
          />

          <text x="300" y="206" class="aigcvis-core-percent">
            {{ Math.floor(progress) }}%
          </text>
        </svg>

        <div class="aigcvis-hint">
          <span class="aigcvis-hint-icon">⟨ ✨ 🧠 ⚡ ⟩</span>
          <span class="aigcvis-hint-phase">{{ currentPhase.prefix }}</span>
          <transition name="hint-swap" mode="out-in">
            <span class="aigcvis-hint-text" :key="currentHintText">
              {{ currentHintText }}
            </span>
          </transition>
          <span class="aigcvis-hint-percent"
            >{{ Math.floor(progress) }}%</span
          >
          <span class="aigcvis-hint-dots"><i></i><i></i><i></i></span>
        </div>
      </div>
    </transition>

    <div
      v-if="result"
      ref="scrollContainer"
      class="tw-relative tw-z-10 tw-h-full tw-w-full tw-p-8 tw-overflow-y-auto tw-scrollbar-hide"
    >
      <div class="tw-max-w-3xl tw-mx-auto">
        <div
          v-if="index === 0"
          class="tw-flex tw-items-center tw-gap-3 tw-mb-6 aigc-step-header"
        >
          <div class="aigc-step-dot"></div>
          <span class="aigc-step-label">
            <span class="aigc-step-prefix"
              >STEP {{ index + 1 }} / {{ steps.length }}</span
            >
            <span class="aigc-step-text">{{ steps[index] }}</span>
          </span>
          <div class="aigc-step-progress">
            <span :class="{ active: index >= 0 }"></span>
            <span :class="{ active: index >= 1 }"></span>
            <span :class="{ active: index >= 2 }"></span>
          </div>
        </div>

        <div class="aigc-console">
          <div class="aigc-console-header">
            <span class="console-tag">✦</span>
            <span class="console-title">Generation Stream</span>
          </div>
          <div
            class="aigc-console-body tw-whitespace-pre-wrap tw-break-words"
          >
            {{ displayedResult }}<span v-if="isPrinting" class="aigc-cursor"></span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!result" class="aigcvis-progressbar">
      <div
        class="aigcvis-progressbar-fill"
        :style="{ width: progress + '%' }"
      ></div>
      <div
        class="aigcvis-progressbar-shimmer"
        :style="{ left: progress + '%' }"
      ></div>
    </div>
  </div>
</template>

<script>
// ============================================================
// 性能优化要点：
// 1. geoTick 改为非响应式 _geoTick，避免每帧触发大量 computed 重算
// 2. 三路 rAF（animate / startLoadingAnimation / startProgress）合并为唯一主循环
// 3. Canvas 绘制降频：等待期间每 3 帧绘制一次
// 4. 所有清理逻辑加 try-catch 防护，避免重复挂载残留
// ============================================================


export default {
  name: "AigcLoadingWizard",

  props: {
    estimatedDuration: {
      type: Number,
      default: 30000,
    },
  },

  data() {
    return {
      dpr: window.devicePixelRatio || 1,
      fontSize: 15,
      targetText: "",
      currentPos: 0,
      isPrinting: false,
      result: "",
      magicSymbols: [
        "0", "1", "{", "}", "<", ">", "/", "*", "+", "=", "?", "!", "✦", "✧", "✺", "◆", "◇", "▲", "△", "●", "○", "◉", "⚡", "⟡", "⟢", "∞", "Σ", "Δ", "λ", "α", "β", "AI", "ML", "GPT"
      ].join(""),
      energyLevel: 0,
      index: 0,
      steps: [
        "正在唤醒 AI 模型...",
        "正在理解你的创意意图...",
        "正在生成专属内容...",
      ],
      displayedResult: "",

      // ---- 进度模拟 ----
      progress: 0,
      progressStartTime: 0,

      // ---- 动态文案 ----
      dynamicHintIndex: 0,

      // 分阶段文案池
      hintPool: [
        {
          range: [0, 25],
          step: 0,
          prefix: "初始化",
          messages: [
            "正在唤醒 AI 模型...",
            "正在加载知识图谱...",
            "正在建立神经连接...",
            "正在准备创作环境...",
          ],
        },
        {
          range: [25, 55],
          step: 1,
          prefix: "理解中",
          messages: [
            "正在理解你的创意意图...",
            "正在解析关键语义...",
            "正在检索相关灵感...",
            "正在构建上下文...",
          ],
        },
        {
          range: [55, 85],
          step: 2,
          prefix: "生成中",
          messages: [
            "正在生成专属内容...",
            "正在润色每一个细节...",
            "AI 正在挥洒创意...",
            "正在编织文字魔法...",
          ],
        },
        {
          range: [85, 101],
          step: 2,
          prefix: "收尾",
          messages: [
            "即将完成，正在精修...",
            "正在做最后的优化...",
            "马上就好，请稍候...",
          ],
        },
      ],

      // 超长等待降级文案
      patientMessages: [
        "AI 正在深度思考，请耐心等待...",
        "复杂的创作需要更多时间...",
        "正在为你打磨更好的结果...",
      ],
    };
  },

  computed: {
    inputNodes() {
      return Array.from({ length: 5 }, (_, i) => ({
        x: 110,
        y: 90 + i * 55,
      }));
    },
    hiddenNodes() {
      const cx = 300,
        cy = 200,
        r = 110;
      const tick = this._geoTick;
      return Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + tick * 0.005;
        return {
          x: cx + Math.cos(a) * r,
          y: cy + Math.sin(a) * r,
        };
      });
    },
    outputNodes() {
      return Array.from({ length: 4 }, (_, i) => ({
        x: 500,
        y: 110 + i * 60,
      }));
    },
    inputHiddenLines() {
      const lines = [];
      this.inputNodes.forEach((a, i) => {
        this.hiddenNodes.forEach((b, j) => {
          if ((i + j) % 2 === 0) {
            lines.push({
              x1: a.x,
              y1: a.y,
              x2: b.x,
              y2: b.y,
              delay: ((i + j) % 5) * 0.2,
            });
          }
        });
      });
      return lines;
    },
    hiddenOutputLines() {
      const lines = [];
      this.hiddenNodes.forEach((a, i) => {
        this.outputNodes.forEach((b, j) => {
          if ((i + j) % 2 === 1) {
            lines.push({
              x1: a.x,
              y1: a.y,
              x2: b.x,
              y2: b.y,
              delay: ((i + j) % 5) * 0.18 + 0.5,
            });
          }
        });
      });
      return lines;
    },
    coreRadius() {
      return 22 + Math.sin(this._geoTick * 0.05) * 6;
    },
    waveformPath() {
      const t = this._geoTick;
      const points = [];
      const maxX = Math.min(440, (t * 4) % 520);
      for (let x = 0; x <= maxX; x += 2) {
        const y =
          340 -
          Math.sin(x / 30 + t * 0.05) * 14 -
          Math.sin(x / 12 + t * 0.08) * 6;
        points.push(`${x === 0 ? "M" : "L"}${80 + x},${y}`);
      }
      return points.join(" ") || "M80,340";
    },
    distributionPath() {
      const t = this._geoTick;
      const phase = (t * 0.02) % (Math.PI * 2);
      const points = [];
      const sigma = 50 + Math.sin(phase) * 12;
      for (let i = -120; i <= 120; i += 3) {
        const x = 300 + i;
        const y = 75 - Math.exp(-(i * i) / (2 * sigma * sigma)) * 50;
        points.push(`${points.length === 0 ? "M" : "L"}${x},${y}`);
      }
      return points.join(" ");
    },
    dataParticle() {
      const t = this._geoTick;
      const a = t * 0.04;
      const r = 75 + Math.sin(t * 0.03) * 8;
      return {
        x: 300 + Math.cos(a) * r,
        y: 200 + Math.sin(a) * r,
      };
    },
    attentionRay() {
      const t = this._geoTick;
      const a = t * 0.03;
      const len = 95 + Math.sin(t * 0.05) * 10;
      return {
        x1: 300,
        y1: 200,
        x2: 300 + Math.cos(a) * len,
        y2: 200 + Math.sin(a) * len,
      };
    },
    progressArcPath() {
      const cx = 300,
        cy = 200,
        r = 50;
      const ratio = Math.min(1, this.progress / 100);
      if (ratio < 0.001) return "";
      const end = ratio * Math.PI * 2;
      const x1 = cx;
      const y1 = cy - r;
      const x2 = cx + Math.cos(end - Math.PI / 2) * r;
      const y2 = cy + Math.sin(end - Math.PI / 2) * r;
      const large = end > Math.PI ? 1 : 0;
      if (ratio >= 0.9999) {
        return `M${cx},${cy - r} A${r},${r} 0 1 1 ${cx - 0.01},${cy - r}`;
      }
      return `M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2}`;
    },
    floatingTokens() {
      const seed = 42;
      return Array.from({ length: 14 }, (_, i) => {
        const s = Math.sin(seed + i * 127.1) * 43758.5453;
        const s2 = Math.sin(seed + i * 269.5) * 43758.5453;
        return {
          x: 100 + (s - Math.floor(s)) * 400,
          y: 60 + (s2 - Math.floor(s2)) * 280,
          r: 2 + (i % 3) * 1.2,
          delay: i * 0.16,
        };
      });
    },
    floatingPrompts() {
      return [
        { text: "prompt →", x: 140, y: 70, delay: 0, duration: 4 },
        { text: "tokenize", x: 220, y: 320, delay: 0.8, duration: 4.5 },
        { text: "embedding", x: 380, y: 90, delay: 1.6, duration: 5 },
        { text: "attention", x: 430, y: 260, delay: 2.2, duration: 4.2 },
        { text: "decode →", x: 480, y: 320, delay: 3, duration: 4.8 },
        { text: "✦ generate", x: 270, y: 195, delay: 1.2, duration: 3.8 },
      ];
    },
    mappingLines() {
      return [
        { x1: 140, y1: 78, x2: 180, y2: 130, delay: 0.5 },
        { x1: 290, y1: 200, x2: 310, y2: 200, delay: 1.0 },
        { x1: 430, y1: 265, x2: 460, y2: 240, delay: 1.8 },
        { x1: 380, y1: 95, x2: 410, y2: 150, delay: 2.5 },
      ];
    },
    currentPhase() {
      return (
        this.hintPool.find(
          (p) => this.progress >= p.range[0] && this.progress < p.range[1]
        ) || this.hintPool[this.hintPool.length - 1]
      );
    },
    currentHintText() {
      const elapsed = Date.now() - this.progressStartTime;
      if (
        this.progressStartTime &&
        elapsed > this.estimatedDuration * 2 &&
        this.progress < 90
      ) {
        return this.patientMessages[
          this.dynamicHintIndex % this.patientMessages.length
        ];
      }
      const msgs = this.currentPhase.messages;
      return msgs[this.dynamicHintIndex % msgs.length];
    },
  },

  watch: {
    result(newVal, oldVal) {
      this.targetText = newVal;

      if (newVal && !oldVal) {
        this.finishProgress();
      }

      if (newVal) {
        this.index = newVal.includes("script") ? 2 : 1;
      }

      if (!this.isPrinting) {
        this.isPrinting = true;
        this.runTypewriter();
      }

      this.onResultUpdate();
    },
  },

  created() {
    // ===== 非响应式内部状态 =====
    this.ctx = null;
    this.columns = [];
    this.resizeObserver = null;

    // ---- 合并后的唯一主循环句柄 ----
    this._mainLoopId = null;

    // ---- 打字机句柄 ----
    this._typewriterId = null;

    // ---- hint 文案轮播定时器 ----
    this._hintTimerId = null;

    // ---- 进度冲刺句柄 ----
    this._progressSprintId = null;

    // ---- 低频进度更新定时器 ----
    this._progressTimerId = null;

    // ---- 非响应式 geoTick，只在此处维护 ----
    this._geoTick = 0;

    // ---- Canvas 绘制降频计数器 ----
    this._drawSkipCounter = 0;

    // ---- 标记组件是否已销毁 ----
    this._destroyed = false;

    // V2 生命周期资源管理
    this._started = false;
    this._resources = {
      frameId: null,
      progressTimer: null,
      hintTimer: null,
      typewriterId: null,
      resizeObserver: null,
    };
  },

  mounted() {
    if (this._started) return;

    this._destroyed = false;
    this._started = true;

    this.initCanvas();
    this.initResizeObserver();
    this._startMainLoop();

    if (!this.result) {
      this._startProgress();
    }
  },

  beforeUnmount() {
    this.reset();
    this._started = false;
  },

  methods: {
    // =========================================================
    //  统一主循环（合并原 animate + startLoadingAnimation）
    // =========================================================
    _startMainLoop() {
      if (this._mainLoopId || this._started === false) return;

      const loop = () => {
        if (this._destroyed) return;

        // 动画内部计数，不进入 Vue 响应式系统
        // 避免 geoTick 变化触发 computed -> SVG 重渲染
        this._geoTick++;

        // --- Canvas 降频绘制 ---
        this._drawSkipCounter++;
        if (this._drawSkipCounter >= 3) {
          this._drawSkipCounter = 0;
          this._drawCanvas();
        }

        this._mainLoopId = requestAnimationFrame(loop);
      };

      this._mainLoopId = requestAnimationFrame(loop);
    },

    _stopMainLoop() {
      if (this._mainLoopId) {
        cancelAnimationFrame(this._mainLoopId);
        this._mainLoopId = null;
      }
    },

    // =========================================================
    //  Canvas 绘制（从原 animate 独立出来）
    // =========================================================
    _drawCanvas() {
      if (!this.ctx) return;
      const { ctx, fontSize, columns } = this;
      const canvas = ctx.canvas;
      const w = canvas.width / this.dpr;
      const h = canvas.height / this.dpr;

      ctx.fillStyle = "rgba(248, 250, 252, 0.22)";
      ctx.fillRect(0, 0, w, h);

      ctx.font = `${fontSize}px 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace`;
      ctx.textBaseline = "top";

      const len = columns.length;
      for (let i = 0; i < len; i++) {
        const col = columns[i];
        col.x = i * (fontSize * 1.4);

        const a = col.opacity + this.energyLevel * 0.15;
        if (col.hue === "magenta") {
          ctx.fillStyle = `rgba(217, 70, 239, ${a})`;
        } else if (col.hue === "cyan") {
          ctx.fillStyle = `rgba(6, 182, 212, ${
            col.opacity + this.energyLevel * 0.12
          })`;
        } else {
          ctx.fillStyle = `rgba(124, 58, 237, ${a})`;
        }

        ctx.fillText(col.char, col.x, col.y);
        col.y += col.speed;

        if (Math.random() > 0.985) {
          col.char =
            this.magicSymbols[
              Math.floor(Math.random() * this.magicSymbols.length)
            ];
        }
        if (col.y > h) {
          col.y = -fontSize;
          col.speed = 0.4 + Math.random() * 1.1;
          col.opacity = 0.15 + Math.random() * 0.35;
        }
      }

      if (this.energyLevel > 0) this.energyLevel *= 0.98;
    },

    // =========================================================
    //  进度模拟（独立 rAF，仅在等待期运行）
    // =========================================================
    _startProgress() {
      this.progress = 0;
      this.progressStartTime = Date.now();

      this._stopProgress();

      // 进度不是动画，不应该使用 requestAnimationFrame
      // 原逻辑 60 次/s 修改 Vue 状态，等待 API 时间越长 CPU 越高
      this._progressTimerId = setInterval(() => {
        if (this._destroyed) return;

        const elapsed = Date.now() - this.progressStartTime;
        const tau = this.estimatedDuration / 3;
        const target = 90 * (1 - Math.exp(-elapsed / tau));

        this.progress = Math.min(90, target);
        this.index = this.currentPhase.step;

      }, 1000);

      if (this._hintTimerId) clearInterval(this._hintTimerId);
      this._hintTimerId = setInterval(() => {
        this.dynamicHintIndex++;
      }, 2500);
    },

    finishProgress() {
      if (this._progressSprintId) {
        cancelAnimationFrame(this._progressSprintId);
        this._progressSprintId = null;
      }
      const start = this.progress;
      const startTime = Date.now();
      const duration = 600;

      const sprint = () => {
        if (this._destroyed) return;
        const t = Math.min(1, (Date.now() - startTime) / duration);
        this.progress = start + (100 - start) * (1 - Math.pow(1 - t, 3));
        if (t < 1) {
          this._progressSprintId = requestAnimationFrame(sprint);
        } else {
          this.progress = 100;
          this._stopProgress();
        }
      };
      this._progressSprintId = requestAnimationFrame(sprint);
    },

    _stopProgress() {
      if (this._progressSprintId) {
        cancelAnimationFrame(this._progressSprintId);
        this._progressSprintId = null;
      }

      if (this._progressTimerId) {
        clearInterval(this._progressTimerId);
        this._progressTimerId = null;
      }

      if (this._hintTimerId) {
        clearInterval(this._hintTimerId);
        this._hintTimerId = null;
      }
    },

    // =========================================================
    //  打字机
    // =========================================================
    runTypewriter() {
      if (this._typewriterId) {
        cancelAnimationFrame(this._typewriterId);
      }

      const step = () => {
        if (this._destroyed) return;
        if (this.currentPos < this.targetText.length) {
          this.displayedResult = this.targetText.substring(
            0,
            this.currentPos + 1
          );
          this.currentPos++;
          this.scrollToBottom();
          this._typewriterId = requestAnimationFrame(step);
        } else {
          this.isPrinting = false;
          this._typewriterId = null;
        }
      };

      this._typewriterId = requestAnimationFrame(step);
    },

    // =========================================================
    //  清理（增强健壮性）
    // =========================================================
    reset() {
      this._destroyed = true;
      this.isPrinting = false;

      // 统一主循环
      this._stopMainLoop();

      // 进度 & hint 定时器
      this._stopProgress();

      // 打字机
      if (this._typewriterId) {
        cancelAnimationFrame(this._typewriterId);
        this._typewriterId = null;
      }

      // ResizeObserver
      try {
        if (this.resizeObserver) {
          if (this.$refs.containerRef) {
            this.resizeObserver.unobserve(this.$refs.containerRef);
          }
          this.resizeObserver.disconnect();
          this.resizeObserver = null;
        }
      } catch (_) {
        this.resizeObserver = null;
      }

      // 重置状态
      this.targetText = "";
      this.displayedResult = "";
      this.currentPos = 0;
      this.result = "";
      this.progress = 0;
      this.dynamicHintIndex = 0;
      this._geoTick = 0;
      this._geoTick = 0;
      this._drawSkipCounter = 0;
    },

    // =========================================================
    //  工具方法
    // =========================================================
    hiddenRadius(i) {
      return 5 + Math.sin(this._geoTick * 0.06 + i * 0.8) * 2.5;
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.scrollContainer;
        if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      });
    },

    initCanvas() {
      const canvas = this.$refs.canvasRef;
      if (!canvas) return;
      this.ctx = canvas.getContext("2d");
      this.resizeCanvas();
    },

    resizeCanvas() {
      const container = this.$refs.containerRef;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const canvas = this.$refs.canvasRef;
      if (!canvas) return;
      canvas.width = rect.width * this.dpr;
      canvas.height = rect.height * this.dpr;
      // 用 setTransform 重置变换，避免多次 resize 后 scale 叠加导致画布被逐级放大
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.initColumns(rect.width);
    },

    initColumns(width) {
      const colCount = Math.floor(width / (this.fontSize * 1.4));
      this.columns = Array.from({ length: colCount }, () => ({
        y: Math.random() * -500,
        speed: 0.4 + Math.random() * 1.1,
        char: this.magicSymbols[
          Math.floor(Math.random() * this.magicSymbols.length)
        ],
        opacity: 0.15 + Math.random() * 0.35,
        hue:
          Math.random() > 0.88
            ? "magenta"
            : Math.random() > 0.5
            ? "primary"
            : "cyan",
      }));
    },

    onResultUpdate() {
      this.energyLevel = 1.0;
      if (this.columns && this.columns.length) {
        this.columns.forEach((col) => {
          if (Math.random() > 0.8) {
            col.speed += 1.5;
            col.y = -20;
          }
        });
      }
    },

    initResizeObserver() {

      if (this.resizeObserver) {
        return;
      }

      this.resizeObserver = new ResizeObserver(() => {
        if (!this._destroyed) {
          this.resizeCanvas();
        }
      });

      if (this.$refs.containerRef) {
        this.resizeObserver.observe(this.$refs.containerRef);
      }
    },
  },
};
</script>

<style scoped>
.aigc-loader {
  position: relative;
  border-radius: 20px;
  background: radial-gradient(
      ellipse 80% 60% at 50% 0%,
      rgba(124, 58, 237, 0.06) 0%,
      transparent 60%
    ),
    radial-gradient(
      ellipse 60% 50% at 100% 100%,
      rgba(217, 70, 239, 0.05) 0%,
      transparent 60%
    ),
    linear-gradient(180deg, #fbfafe 0%, #f3f0fa 100%);
  border: 1px solid rgba(124, 58, 237, 0.14);
  box-shadow: 0 1px 2px rgba(30, 41, 59, 0.04),
    0 12px 32px rgba(124, 58, 237, 0.08);
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "PingFang SC",
    "Microsoft YaHei", sans-serif;
  color: #1e1b3a;
}

.aigc-canvas {
  opacity: 0.65;
  mix-blend-mode: multiply;
}

.aigc-grid {
  background-image: linear-gradient(
      to right,
      rgba(124, 58, 237, 0.07) 1px,
      transparent 1px
    ),
    linear-gradient(to bottom, rgba(124, 58, 237, 0.07) 1px, transparent 1px),
    radial-gradient(
      circle at 1px 1px,
      rgba(217, 70, 239, 0.1) 1px,
      transparent 0
    );
  background-size: 64px 64px, 64px 64px, 16px 16px;
  background-position: 0 0, 0 0, 0 0;
  mask-image: radial-gradient(
    ellipse 100% 80% at 50% 50%,
    #000 40%,
    transparent 90%
  );
  -webkit-mask-image: radial-gradient(
    ellipse 100% 80% at 50% 50%,
    #000 40%,
    transparent 90%
  );
}

.aigc-spotlight {
  background: radial-gradient(
    ellipse 60% 50% at 50% 40%,
    rgba(255, 255, 255, 0.55) 0%,
    transparent 70%
  );
}

.aigc-topline {
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(124, 58, 237, 0.5) 20%,
    rgba(217, 70, 239, 0.55) 50%,
    rgba(6, 182, 212, 0.5) 80%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: topLineFlow 3.6s linear infinite;
  border-radius: 2px;
}

@keyframes topLineFlow {
  0% { background-position: 0% 0; }
  100% { background-position: 200% 0; }
}

.aigc-step-header {
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(124, 58, 237, 0.16);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(124, 58, 237, 0.06);
  animation: stepFadeIn 0.5s ease-out;
}

.aigc-step-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.18),
    0 0 8px rgba(217, 70, 239, 0.5);
  animation: aigcPulse 1.6s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes aigcPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.18),
      0 0 8px rgba(217, 70, 239, 0.5);
  }
  50% {
    transform: scale(1.18);
    box-shadow: 0 0 0 5px rgba(217, 70, 239, 0.12),
      0 0 16px rgba(124, 58, 237, 0.6);
  }
}

.aigc-step-label {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  line-height: 1.4;
  text-align: left;
}

.aigc-step-prefix {
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 10.5px;
  font-weight: 600;
  color: #d946ef;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.aigc-step-text {
  font-size: 13px;
  font-weight: 500;
  color: #1e1b3a;
  letter-spacing: 0.01em;
  margin-top: 1px;
}

.aigc-step-progress {
  display: flex;
  gap: 4px;
  align-items: center;
  flex-shrink: 0;
}

.aigc-step-progress span {
  width: 18px;
  height: 3px;
  border-radius: 2px;
  background: rgba(124, 58, 237, 0.16);
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

.aigc-step-progress span.active {
  background: linear-gradient(90deg, #7c3aed, #d946ef);
  box-shadow: 0 0 8px rgba(217, 70, 239, 0.55);
}

.aigc-console {
  position: relative;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(124, 58, 237, 0.16);
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(30, 41, 59, 0.04),
    0 8px 24px rgba(124, 58, 237, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  overflow: hidden;
  animation: consoleFadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.aigc-console::before {
  content: "";
  position: absolute;
  top: 0;
  left: 12px;
  right: 12px;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(124, 58, 237, 0.4) 30%,
    rgba(217, 70, 239, 0.4) 70%,
    transparent 100%
  );
}

.aigc-console-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: linear-gradient(
    90deg,
    rgba(124, 58, 237, 0.06) 0%,
    rgba(217, 70, 239, 0.05) 100%
  );
  border-bottom: 1px solid rgba(124, 58, 237, 0.1);
}

.console-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: linear-gradient(135deg, #7c3aed 0%, #d946ef 100%);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 1px 3px rgba(124, 58, 237, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.console-title {
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 11px;
  font-weight: 600;
  color: #5b4b8a;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.aigc-console-body {
  padding: 18px 20px;
  font-family: "JetBrains Mono", "Fira Code", "SF Mono", monospace;
  font-size: 13px;
  line-height: 1.75;
  color: #1e1b3a;
  letter-spacing: 0.005em;
  min-height: 60px;
  text-align: left;
  text-shadow: 0 0 12px rgba(124, 58, 237, 0.05);
}

.aigc-cursor {
  display: inline-block;
  width: 2px;
  height: 15px;
  background: linear-gradient(180deg, #7c3aed, #d946ef);
  margin-left: 3px;
  vertical-align: text-bottom;
  animation: cursorBlink 0.95s ease-in-out infinite;
  box-shadow: 0 0 8px rgba(217, 70, 239, 0.65);
  border-radius: 1px;
}

@keyframes cursorBlink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

.tw-scrollbar-hide::-webkit-scrollbar { display: none; }
.tw-scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@keyframes stepFadeIn {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes consoleFadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.aigcvis-fade-enter-active { transition: opacity 0.5s ease; }
.aigcvis-fade-leave-active { transition: opacity 0.8s ease; }
.aigcvis-fade-enter-from,
.aigcvis-fade-leave-to { opacity: 0; }

.aigcvis-stage {
  flex-direction: column;
  gap: 20px;
}

.aigcvis-svg {
  width: 72%;
  max-width: 580px;
  height: auto;
  filter: drop-shadow(0 4px 28px rgba(124, 58, 237, 0.12));
}

.aigcvis-synapse {
  stroke: rgba(124, 58, 237, 0.35);
  stroke-width: 1;
  stroke-linecap: round;
  opacity: 0;
  animation: synapseFlow 3.2s ease-in-out infinite;
}

.aigcvis-synapse--out {
  stroke: rgba(217, 70, 239, 0.38);
  animation-duration: 3.6s;
}

@keyframes synapseFlow {
  0%, 100% { opacity: 0.15; stroke-width: 0.8; }
  50% { opacity: 0.7; stroke-width: 1.4; }
}

.aigcvis-node {
  animation: nodePulse 2.4s ease-in-out infinite;
}

.aigcvis-node--input {
  fill: #06b6d4;
  filter: drop-shadow(0 0 6px rgba(6, 182, 212, 0.5));
}

.aigcvis-node--hidden {
  fill: #7c3aed;
  filter: drop-shadow(0 0 8px rgba(124, 58, 237, 0.55));
}

.aigcvis-node--output {
  fill: #d946ef;
  filter: drop-shadow(0 0 8px rgba(217, 70, 239, 0.6));
}

@keyframes nodePulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

.aigcvis-core {
  fill: rgba(124, 58, 237, 0.1);
  stroke: #7c3aed;
  stroke-width: 2;
  filter: drop-shadow(0 0 16px rgba(124, 58, 237, 0.5));
  animation: coreGlow 2.4s ease-in-out infinite;
}

.aigcvis-core-inner {
  fill: rgba(217, 70, 239, 0.85);
  filter: drop-shadow(0 0 10px rgba(217, 70, 239, 0.7));
  animation: coreInnerSpin 2s ease-in-out infinite alternate;
}

@keyframes coreGlow {
  0%, 100% { filter: drop-shadow(0 0 12px rgba(124, 58, 237, 0.4)); }
  50% { filter: drop-shadow(0 0 24px rgba(217, 70, 239, 0.7)); }
}

@keyframes coreInnerSpin {
  0% { opacity: 0.7; }
  100% { opacity: 1; }
}

.aigcvis-core-percent {
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 14px;
  font-weight: 700;
  fill: #fff;
  text-anchor: middle;
  letter-spacing: 0.02em;
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.3);
  font-variant-numeric: tabular-nums;
}

.aigcvis-waveform {
  stroke: #06b6d4;
  stroke-width: 2;
  stroke-linecap: round;
  fill: none;
  filter: drop-shadow(0 0 6px rgba(6, 182, 212, 0.45));
  animation: waveGlow 2s ease-in-out infinite alternate;
}

@keyframes waveGlow {
  0% { filter: drop-shadow(0 0 4px rgba(6, 182, 212, 0.3)); }
  100% { filter: drop-shadow(0 0 12px rgba(6, 182, 212, 0.6)); }
}

.aigcvis-distribution {
  stroke: #d946ef;
  stroke-width: 1.8;
  stroke-linecap: round;
  fill: none;
  stroke-dasharray: 6 4;
  opacity: 0.7;
  animation: distFlow 3s linear infinite;
}

@keyframes distFlow {
  0% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -20; }
}

.aigcvis-particle {
  fill: #f0abfc;
  filter: drop-shadow(0 0 6px rgba(217, 70, 239, 0.85));
  animation: particlePing 1.4s ease-in-out infinite;
}

@keyframes particlePing {
  0%, 100% { r: 4; opacity: 1; }
  50% { r: 6; opacity: 0.7; }
}

.aigcvis-attention {
  stroke: #fbbf24;
  stroke-width: 1.2;
  stroke-dasharray: 4 3;
  opacity: 0.7;
  filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.6));
}

.aigcvis-attention-dot {
  fill: #fbbf24;
  filter: drop-shadow(0 0 6px rgba(251, 191, 36, 0.8));
  animation: attentionPing 1.2s ease-in-out infinite;
}

@keyframes attentionPing {
  0%, 100% { r: 3; opacity: 1; }
  50% { r: 5; opacity: 0.6; }
}

.aigcvis-progress-track {
  fill: none;
  stroke: rgba(124, 58, 237, 0.12);
  stroke-width: 3;
}

.aigcvis-progress {
  stroke: #d946ef;
  stroke-width: 3;
  stroke-linecap: round;
  fill: none;
  filter: drop-shadow(0 0 6px rgba(217, 70, 239, 0.6));
  transition: all 0.3s ease;
}

.aigcvis-token {
  fill: #7c3aed;
  opacity: 0;
  animation: tokenIn 0.6s ease-out forwards,
    tokenTwinkle 2.4s ease-in-out infinite;
}

@keyframes tokenIn {
  0% { opacity: 0; r: 0; }
  60% { opacity: 0.8; }
  100% { opacity: 0.55; }
}

@keyframes tokenTwinkle {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.85; }
}

.aigcvis-prompt {
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 12px;
  font-weight: 500;
  fill: #5b4b8a;
  opacity: 0;
  letter-spacing: 0.03em;
  animation: promptFloat 4s ease-in-out infinite;
}

@keyframes promptFloat {
  0% { opacity: 0; transform: translateY(8px); }
  15% { opacity: 0.8; transform: translateY(0); }
  85% { opacity: 0.8; transform: translateY(-4px); }
  100% { opacity: 0; transform: translateY(-12px); }
}

.aigcvis-mapping {
  stroke: #d946ef;
  stroke-width: 1;
  stroke-dasharray: 3 3;
  opacity: 0;
  animation: mappingDraw 3s ease-in-out infinite;
}

@keyframes mappingDraw {
  0% { opacity: 0; stroke-dashoffset: 20; }
  30% { opacity: 0.6; stroke-dashoffset: 0; }
  70% { opacity: 0.6; stroke-dashoffset: 0; }
  100% { opacity: 0; stroke-dashoffset: -20; }
}

.aigcvis-hint {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 18px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(124, 58, 237, 0.16);
  border-radius: 22px;
  box-shadow: 0 2px 12px rgba(124, 58, 237, 0.1);
  animation: hintPulse 3s ease-in-out infinite;
}

@keyframes hintPulse {
  0%, 100% { box-shadow: 0 2px 12px rgba(124, 58, 237, 0.1); }
  50% { box-shadow: 0 2px 22px rgba(217, 70, 239, 0.22); }
}

.aigcvis-hint-icon {
  font-family: "JetBrains Mono", monospace;
  font-size: 14px;
  background: linear-gradient(90deg, #7c3aed, #d946ef);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 0.05em;
}

.aigcvis-hint-phase {
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #7c3aed, #d946ef);
  padding: 3px 10px;
  border-radius: 10px;
  letter-spacing: 0.05em;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(124, 58, 237, 0.3);
}

.aigcvis-hint-text {
  font-size: 13px;
  font-weight: 500;
  color: #5b4b8a;
  letter-spacing: 0.02em;
  display: inline-block;
  min-width: 180px;
}

.aigcvis-hint-percent {
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 12px;
  font-weight: 700;
  color: #7c3aed;
  min-width: 38px;
  text-align: right;
  font-variant-numeric: tabular-nums;
  background: linear-gradient(90deg, #7c3aed, #d946ef);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.aigcvis-hint-dots {
  display: flex;
  gap: 4px;
  align-items: center;
}

.aigcvis-hint-dots i {
  display: block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed, #d946ef);
  animation: hintDotBounce 1.4s ease-in-out infinite;
}

.aigcvis-hint-dots i:nth-child(2) { animation-delay: 0.2s; }
.aigcvis-hint-dots i:nth-child(3) { animation-delay: 0.4s; }

@keyframes hintDotBounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-6px); opacity: 1; }
}

.hint-swap-enter-active,
.hint-swap-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.hint-swap-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.hint-swap-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
.hint-swap-leave-active {
  position: absolute;
}

.aigcvis-progressbar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(124, 58, 237, 0.08);
  overflow: hidden;
  z-index: 6;
  border-radius: 0 0 20px 20px;
}

.aigcvis-progressbar-fill {
  position: relative;
  height: 100%;
  background: linear-gradient(
    90deg,
    #06b6d4 0%,
    #7c3aed 50%,
    #d946ef 100%
  );
  background-size: 200% 100%;
  border-radius: 0 2px 2px 0;
  box-shadow: 0 0 12px rgba(217, 70, 239, 0.6),
    0 0 4px rgba(124, 58, 237, 0.5);
  transition: width 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  animation: barFlow 2s linear infinite;
}

@keyframes barFlow {
  0% { background-position: 0% 0; }
  100% { background-position: 200% 0; }
}

.aigcvis-progressbar-shimmer {
  position: absolute;
  top: 0;
  width: 80px;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.85),
    transparent
  );
  transform: translateX(-50%);
  transition: left 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
  filter: blur(0.5px);
}
</style>
