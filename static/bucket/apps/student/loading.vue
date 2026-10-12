<template>
  <div
    ref="containerRef"
    class="tw-relative tw-w-full tw-h-full tw-overflow-hidden academic-loader"
  >
    <canvas
      ref="canvasRef"
      class="tw-absolute tw-inset-0 tw-w-full tw-h-full academic-canvas"
    ></canvas>

    <div
      class="tw-absolute tw-inset-0 tw-pointer-events-none academic-grid"
    ></div>
    <div
      class="tw-absolute tw-inset-0 tw-pointer-events-none academic-spotlight"
    ></div>
    <div
      class="tw-absolute tw-top-0 tw-left-0 tw-right-0 academic-topline"
    ></div>

    <!-- 数形结合实验演示动画（result 为空时显示） -->
    <transition name="mathgeo-fade">
      <div
        v-if="!result"
        class="tw-absolute tw-inset-0 tw-z-[5] tw-flex tw-items-center tw-justify-center tw-pointer-events-none mathgeo-stage"
      >
        <svg
          class="mathgeo-svg"
          viewBox="0 0 600 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="80" y1="340" x2="520" y2="340" class="mathgeo-axis" />
          <line x1="80" y1="340" x2="80" y2="40" class="mathgeo-axis" />
          <polygon
            points="520,340 510,335 510,345"
            class="mathgeo-axis-arrow"
          />
          <polygon points="80,40 75,50 85,50" class="mathgeo-axis-arrow" />
          <text x="530" y="345" class="mathgeo-label">x</text>
          <text x="70" y="32" class="mathgeo-label">y</text>
          <text x="72" y="355" class="mathgeo-label">O</text>

          <g class="mathgeo-ticks">
            <line
              v-for="i in 8"
              :key="'tx' + i"
              :x1="80 + i * 50"
              y1="337"
              :x2="80 + i * 50"
              y2="343"
            />
            <line
              v-for="i in 5"
              :key="'ty' + i"
              x1="77"
              :y1="340 - i * 55"
              x2="83"
              :y2="340 - i * 55"
            />
          </g>

          <path :d="sinePath" class="mathgeo-sine" />
          <path :d="parabolaPath" class="mathgeo-parabola" />
          <circle cx="300" cy="200" :r="circleRadius" class="mathgeo-circle" />
          <polygon :points="trianglePoints" class="mathgeo-triangle" />
          <line
            :x1="tangentLine.x1"
            :y1="tangentLine.y1"
            :x2="tangentLine.x2"
            :y2="tangentLine.y2"
            class="mathgeo-tangent"
          />
          <circle
            :cx="tangentPoint.x"
            :cy="tangentPoint.y"
            r="4"
            class="mathgeo-tangent-dot"
          />
          <path :d="areaPath" class="mathgeo-area" />

          <circle
            v-for="(pt, i) in scatterDots"
            :key="'dot' + i"
            :cx="pt.x"
            :cy="pt.y"
            :r="pt.r"
            class="mathgeo-scatter"
            :style="{ animationDelay: pt.delay + 's' }"
          />

          <text
            v-for="(f, i) in floatingFormulas"
            :key="'f' + i"
            :x="f.x"
            :y="f.y"
            class="mathgeo-formula"
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
            class="mathgeo-mapping"
            :style="{ animationDelay: ln.delay + 's' }"
          />
        </svg>

        <div class="mathgeo-hint">
          <span class="mathgeo-hint-icon">⟨ f(x) ↔ 📐 ⟩</span>
          <span class="mathgeo-hint-text">数形结合实验准备中</span>
          <span class="mathgeo-hint-dots"><i></i><i></i><i></i></span>
        </div>
      </div>
    </transition>

    <!-- 内容层 -->
    <div
      v-if="result"
      ref="scrollContainer"
      class="tw-relative tw-z-10 tw-h-full tw-w-full tw-p-8 tw-overflow-y-auto tw-scrollbar-hide"
    >
      <div class="tw-max-w-3xl tw-mx-auto">
        <div
          class="tw-flex tw-items-center tw-gap-3 tw-mb-6 academic-step-header"
        >
          <div class="academic-step-dot"></div>
          <span class="academic-step-label">
            <span class="academic-step-prefix">STEP {{ index + 1 }} / 3</span>
            <span class="academic-step-text">{{ steps[index] }}</span>
          </span>
          <div class="academic-step-progress">
            <span :class="{ active: index >= 0 }"></span>
            <span :class="{ active: index >= 1 }"></span>
            <span :class="{ active: index >= 2 }"></span>
          </div>
        </div>

        <div class="academic-console">
          <div class="academic-console-header">
            <span class="console-tag">∑</span>
            <span class="console-title">Computation Stream</span>
          </div>
          <div
            class="academic-console-body tw-whitespace-pre-wrap tw-break-words"
          >
            {{ displayedResult
            }}<span v-if="isPrinting" class="academic-cursor"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AcademicLoadingWizard",

  data() {
    return {
      ctx: null,
      animationFrame: null,
      resizeObserver: null,
      dpr: window.devicePixelRatio || 1,
      printIndex: 0,
      timer: null,
      columns: [],
      fontSize: 15,
      streamingFinished: false,
      targetText: "", // 存放从流中获取的最新的全量文本
      currentPos: 0, // 当前打字机已经打印到的位置
      isPrinting: false,
      result: "",
      magicSymbols: [
        "π",
        "Σ",
        "∫",
        "∞",
        "Δ",
        "θ",
        "λ",
        "√",
        "≈",
        "⊥",
        "∥",
        "∈",
        "∀",
        "∃",
        "∇",
        "α",
        "β",
        "γ",
        "φ",
        "Ψ",
        "ℝ",
        "ℕ",
        "∂",
        "≤",
        "≥",
        "±",
        "⊕",
        "⊗",
      ].join(""),
      energyLevel: 0,
      index: 0,
      steps: [
        "正在分析数形实验需求…",
        "正在构建数形结合实验台…",
        "正在生成实验指令集…",
      ],
      displayedResult: "",
      isPrinting: false,
      typingTimer: null,
      geoTick: 0,
      geoAnimFrame: null,
    };
  },

  computed: {
    sinePath() {
      const t = this.geoTick;
      const points = [];
      const maxX = Math.min(440, (t * 3) % 520);
      for (let x = 0; x <= maxX; x += 2) {
        const y = 200 - Math.sin(x / 50 + t * 0.03) * 70;
        points.push(`${x === 0 ? "M" : "L"}${80 + x},${y}`);
      }
      return points.join(" ") || "M80,200";
    },
    parabolaPath() {
      const t = this.geoTick;
      const phase = (t * 0.02) % (Math.PI * 2);
      const points = [];
      const spread = 60 + Math.sin(phase) * 20;
      const maxI = Math.min(200, t * 2);
      for (let i = -maxI; i <= maxI; i += 3) {
        const x = 300 + i;
        const y = 340 - (i * i) / (spread * 3);
        if (y < 40) continue;
        points.push(`${points.length === 0 ? "M" : "L"}${x},${y}`);
      }
      return points.join(" ") || "M300,340";
    },
    circleRadius() {
      return 40 + Math.sin(this.geoTick * 0.04) * 20;
    },
    trianglePoints() {
      const t = this.geoTick;
      const cx = 420,
        cy = 140;
      const r = 35 + Math.sin(t * 0.03) * 10;
      const angle = t * 0.02;
      return Array.from({ length: 3 }, (_, i) => {
        const a = angle + (i * Math.PI * 2) / 3;
        return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
      }).join(" ");
    },
    tangentPoint() {
      const t = this.geoTick;
      const px = (t * 2) % 440;
      return {
        x: 80 + px,
        y: 200 - Math.sin(px / 50 + t * 0.03) * 70,
      };
    },
    tangentLine() {
      const t = this.geoTick;
      const px = (t * 2) % 440;
      const slope = -(70 / 50) * Math.cos(px / 50 + t * 0.03);
      const { x: cx, y: cy } = this.tangentPoint;
      return {
        x1: cx - 40,
        y1: cy - slope * 40,
        x2: cx + 40,
        y2: cy + slope * 40,
      };
    },
    areaPath() {
      const t = this.geoTick;
      const startX = 120;
      const endX = startX + Math.min(160, (t * 1.5) % 240);
      let d = `M${startX},340 `;
      for (let x = startX; x <= endX; x += 3) {
        const y = 200 - Math.sin((x - 80) / 50 + t * 0.03) * 70;
        d += `L${x},${y} `;
      }
      return d + `L${endX},340 Z`;
    },
    scatterDots() {
      const seed = 42;
      return Array.from({ length: 12 }, (_, i) => {
        const s = Math.sin(seed + i * 127.1) * 43758.5453;
        const s2 = Math.sin(seed + i * 269.5) * 43758.5453;
        return {
          x: 100 + (s - Math.floor(s)) * 400,
          y: 60 + (s2 - Math.floor(s2)) * 260,
          r: 2.5 + (i % 3) * 1.2,
          delay: i * 0.18,
        };
      });
    },
    floatingFormulas() {
      return [
        { text: "y = sin(x)", x: 140, y: 80, delay: 0, duration: 4 },
        { text: "S = ∫f(x)dx", x: 360, y: 300, delay: 0.8, duration: 4.5 },
        { text: "x² + y² = r²", x: 240, y: 120, delay: 1.6, duration: 5 },
        { text: "dy/dx = f'(x)", x: 430, y: 230, delay: 2.2, duration: 4.2 },
        { text: "Δy ≈ f'(x₀)Δx", x: 110, y: 270, delay: 3, duration: 4.8 },
        { text: "πr²", x: 290, y: 195, delay: 1.2, duration: 3.8 },
      ];
    },
    mappingLines() {
      return [
        { x1: 140, y1: 85, x2: 180, y2: 155, delay: 0.5 },
        { x1: 290, y1: 200, x2: 300, y2: 200, delay: 1.0 },
        { x1: 430, y1: 235, x2: 400, y2: 260, delay: 1.8 },
        { x1: 240, y1: 125, x2: 270, y2: 170, delay: 2.5 },
      ];
    },
  },

  watch: {
    result(newVal) {
      // 1. 更新目标文本（生产者）
      this.targetText = newVal;

      // 2. 根据内容决定步骤索引
      this.index = newVal.includes("script") ? 2 : 1;

      // 3. 启动唯一的打印循环（如果还没启动的话）
      if (!this.isPrinting) {
        this.isPrinting = true;
        this.runTypewriter();
      }

      this.onResultUpdate();
    },
  },

  mounted() {
    this.initCanvas();
    this.initResizeObserver();
    this.animate();
    this.reset();
    if (!this.result) {
      this.startGeoAnimation();
    }
  },

  beforeUnmount() {
    this.reset();
  },

  methods: {
    reset() {
      this.isPrinting = false;
      cancelAnimationFrame(this.runTypewriter);
      if (this.typingTimer) clearInterval(this.typingTimer);
      this.resizeObserver?.disconnect();
      this.stopTyping();
      this.stopGeoAnimation();
      this.targetText = "";
      this.displayedResult = "";
      this.currentPos = 0;
      this.result = "";
      console.log("AcademicLoadingWizard reset");
    },
    runTypewriter() {
      // 检查是否还有字没打完
      if (this.currentPos < this.targetText.length) {
        // 核心逻辑：直接基于 targetText 的截取，而不是用 += 累加
        // 这样即便数据流更新极快，显示内容也永远是 targetText 的前缀，绝不会乱码
        this.displayedResult = this.targetText.substring(
          0,
          this.currentPos + 1
        );
        this.currentPos++;

        console.log("###this.displayedResult", this.displayedResult.slice(0, 30));
        console.log("###this.targetText", this.targetText.slice(0, 30));
        console.log("###this.result", this.result.slice(0, 30));

        console.log(
          `Typing... currentPos: ${this.currentPos}, targetLength: ${this.targetText.length}`
        );

        this.scrollToBottom();

        // 使用 requestAnimationFrame 或受控的 setTimeout
        // 这样能保证每秒约 60 次检查，或者你可以根据需要降频
        requestAnimationFrame(this.runTypewriter);
      } else {
        // 暂时打完了，等待新数据
        this.isPrinting = false;
      }
    },

    stopTyping() {
      if (this.typingTimer) {
        clearInterval(this.typingTimer);
        this.typingTimer = null;
      }
      this.isPrinting = false;
    },

    // ── 几何动画 ────────────────────────────────────
    startGeoAnimation() {
      if (this.geoAnimFrame) return;
      const tick = () => {
        this.geoTick++;
        this.geoAnimFrame = requestAnimationFrame(tick);
      };
      this.geoAnimFrame = requestAnimationFrame(tick);
    },

    stopGeoAnimation() {
      if (this.geoAnimFrame) {
        cancelAnimationFrame(this.geoAnimFrame);
        this.geoAnimFrame = null;
      }
    },

    // ── 滚动到底部 ──────────────────────────────────
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.scrollContainer;
        if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      });
    },

    // ── Canvas 初始化 ───────────────────────────────
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
      canvas.width = rect.width * this.dpr;
      canvas.height = rect.height * this.dpr;
      this.ctx.scale(this.dpr, this.dpr);
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
            ? "amber"
            : Math.random() > 0.5
            ? "primary"
            : "deep",
      }));
    },

    onResultUpdate() {
      this.energyLevel = 1.0;
      this.columns.forEach((col) => {
        if (Math.random() > 0.8) {
          col.speed += 1.5;
          col.y = -20;
        }
      });
    },

    animate() {
      const { ctx, fontSize, columns } = this;
      const canvas = ctx.canvas;
      const w = canvas.width / this.dpr;
      const h = canvas.height / this.dpr;

      ctx.fillStyle = "rgba(248, 250, 252, 0.22)";
      ctx.fillRect(0, 0, w, h);

      ctx.font = `${fontSize}px 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace`;
      ctx.textBaseline = "top";

      columns.forEach((col, i) => {
        col.x = i * (fontSize * 1.4);

        const a = col.opacity + this.energyLevel * 0.15;
        if (col.hue === "amber") {
          ctx.fillStyle = `rgba(245, 158, 11, ${a})`;
        } else if (col.hue === "deep") {
          ctx.fillStyle = `rgba(29, 78, 216, ${
            col.opacity + this.energyLevel * 0.12
          })`;
        } else {
          ctx.fillStyle = `rgba(37, 99, 235, ${a})`;
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
      });

      if (this.energyLevel > 0) this.energyLevel *= 0.98;
      this.animationFrame = requestAnimationFrame(this.animate);
    },

    initResizeObserver() {
      this.resizeObserver = new ResizeObserver(() => this.resizeCanvas());
      this.resizeObserver.observe(this.$refs.containerRef);
    },
  },
};
</script>

<style scoped>
.academic-loader {
  position: relative;
  border-radius: 20px;
  background: radial-gradient(
      ellipse 80% 60% at 50% 0%,
      rgba(37, 99, 235, 0.05) 0%,
      transparent 60%
    ),
    linear-gradient(180deg, #fbfcfe 0%, #f1f5f9 100%);
  border: 1px solid rgba(37, 99, 235, 0.12);
  box-shadow: 0 1px 2px rgba(30, 41, 59, 0.04),
    0 12px 32px rgba(30, 41, 59, 0.06);
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "PingFang SC",
    "Microsoft YaHei", sans-serif;
  color: #1e293b;
}

.academic-canvas {
  opacity: 0.65;
  mix-blend-mode: multiply;
}

.academic-grid {
  background-image: linear-gradient(
      to right,
      rgba(37, 99, 235, 0.06) 1px,
      transparent 1px
    ),
    linear-gradient(to bottom, rgba(37, 99, 235, 0.06) 1px, transparent 1px),
    radial-gradient(
      circle at 1px 1px,
      rgba(30, 41, 59, 0.08) 1px,
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

/* 柔光聚焦 —— 强调中心内容 */
.academic-spotlight {
  background: radial-gradient(
    ellipse 60% 50% at 50% 40%,
    rgba(255, 255, 255, 0.5) 0%,
    transparent 70%
  );
}

/* 顶部精准细线 —— 呼应"手术刀"意象 */
.academic-topline {
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(37, 99, 235, 0.5) 20%,
    rgba(245, 158, 11, 0.4) 50%,
    rgba(37, 99, 235, 0.5) 80%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: topLineFlow 3.6s linear infinite;
  border-radius: 2px;
}

@keyframes topLineFlow {
  0% {
    background-position: 0% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* ============================================
   步骤指示器
   ============================================ */
.academic-step-header {
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(37, 99, 235, 0.14);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(30, 41, 59, 0.04);
  animation: stepFadeIn 0.5s ease-out;
}

.academic-step-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.18), 0 0 8px rgba(37, 99, 235, 0.4);
  animation: academicPulse 1.6s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes academicPulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.18),
      0 0 8px rgba(37, 99, 235, 0.4);
  }
  50% {
    transform: scale(1.15);
    box-shadow: 0 0 0 5px rgba(37, 99, 235, 0.1),
      0 0 14px rgba(37, 99, 235, 0.55);
  }
}

.academic-step-label {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  line-height: 1.4;
  text-align: left;
}

.academic-step-prefix {
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 10.5px;
  font-weight: 600;
  color: #f59e0b;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.academic-step-text {
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
  letter-spacing: 0.01em;
  margin-top: 1px;
}

/* 进度小条 */
.academic-step-progress {
  display: flex;
  gap: 4px;
  align-items: center;
  flex-shrink: 0;
}

.academic-step-progress span {
  width: 18px;
  height: 3px;
  border-radius: 2px;
  background: rgba(37, 99, 235, 0.15);
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

.academic-step-progress span.active {
  background: #2563eb;
  box-shadow: 0 0 6px rgba(37, 99, 235, 0.5);
}

/* ============================================
   控制台样式输出框
   ============================================ */
.academic-console {
  position: relative;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(37, 99, 235, 0.14);
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(30, 41, 59, 0.04),
    0 8px 24px rgba(30, 41, 59, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  overflow: hidden;
  animation: consoleFadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.academic-console::before {
  content: "";
  position: absolute;
  top: 0;
  left: 12px;
  right: 12px;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(37, 99, 235, 0.35) 50%,
    transparent 100%
  );
}

.academic-console-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(37, 99, 235, 0.05);
  border-bottom: 1px solid rgba(37, 99, 235, 0.1);
}

.console-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #fff;
  font-family: "Times New Roman", serif;
  font-size: 14px;
  font-weight: 700;
  font-style: italic;
  box-shadow: 0 1px 3px rgba(37, 99, 235, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.console-title {
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 11px;
  font-weight: 600;
  color: #475569;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.academic-console-body {
  padding: 18px 20px;
  font-family: "JetBrains Mono", "Fira Code", "SF Mono", monospace;
  font-size: 13px;
  line-height: 1.75;
  color: #1e293b;
  letter-spacing: 0.005em;
  min-height: 60px;
  text-align: left;
  text-shadow: 0 0 12px rgba(37, 99, 235, 0.04);
}

/* 打字机光标 —— 学术蓝闪烁 */
.academic-cursor {
  display: inline-block;
  width: 2px;
  height: 15px;
  background: #2563eb;
  margin-left: 3px;
  vertical-align: text-bottom;
  animation: cursorBlink 0.95s ease-in-out infinite;
  box-shadow: 0 0 6px rgba(37, 99, 235, 0.6);
  border-radius: 1px;
}

@keyframes cursorBlink {
  0%,
  49% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
}

/* ============================================
   滚动条隐藏
   ============================================ */
.tw-scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.tw-scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* ============================================
   动画
   ============================================ */
@keyframes stepFadeIn {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes consoleFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ============================================
   ★ 数形结合实验演示动画样式
   ============================================ */

/* 过渡动画 */
.mathgeo-fade-enter-active {
  transition: opacity 0.5s ease;
}
.mathgeo-fade-leave-active {
  transition: opacity 0.8s ease;
}
.mathgeo-fade-enter-from,
.mathgeo-fade-leave-to {
  opacity: 0;
}

/* 舞台容器 */
.mathgeo-stage {
  flex-direction: column;
  gap: 20px;
}

/* 主 SVG */
.mathgeo-svg {
  width: 70%;
  max-width: 560px;
  height: auto;
  filter: drop-shadow(0 4px 24px rgba(37, 99, 235, 0.08));
}

/* 坐标轴 */
.mathgeo-axis {
  stroke: #334155;
  stroke-width: 1.5;
  stroke-linecap: round;
}
.mathgeo-axis-arrow {
  fill: #334155;
}

/* 轴标签 */
.mathgeo-label {
  font-family: "Times New Roman", "STIX Two Math", serif;
  font-size: 16px;
  font-style: italic;
  fill: #475569;
}

/* 刻度线 */
.mathgeo-ticks line {
  stroke: #94a3b8;
  stroke-width: 1;
}

/* 正弦曲线 */
.mathgeo-sine {
  stroke: #2563eb;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
  filter: drop-shadow(0 0 6px rgba(37, 99, 235, 0.35));
  animation: sineGlow 2s ease-in-out infinite alternate;
}

@keyframes sineGlow {
  0% {
    filter: drop-shadow(0 0 4px rgba(37, 99, 235, 0.25));
    stroke-width: 2.5;
  }
  100% {
    filter: drop-shadow(0 0 10px rgba(37, 99, 235, 0.5));
    stroke-width: 3;
  }
}

/* 抛物线 */
.mathgeo-parabola {
  stroke: #7c3aed;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
  stroke-dasharray: 6 4;
  opacity: 0.7;
  animation: parabolaPulse 3s ease-in-out infinite alternate;
}

@keyframes parabolaPulse {
  0% {
    opacity: 0.5;
    stroke-dashoffset: 0;
  }
  100% {
    opacity: 0.85;
    stroke-dashoffset: 20;
  }
}

/* 动态圆 */
.mathgeo-circle {
  stroke: #f59e0b;
  stroke-width: 2;
  fill: rgba(245, 158, 11, 0.06);
  animation: circleBreath 3s ease-in-out infinite;
}

@keyframes circleBreath {
  0%,
  100% {
    stroke-opacity: 0.7;
    filter: drop-shadow(0 0 4px rgba(245, 158, 11, 0.2));
  }
  50% {
    stroke-opacity: 1;
    filter: drop-shadow(0 0 12px rgba(245, 158, 11, 0.45));
  }
}

/* 旋转三角形 */
.mathgeo-triangle {
  stroke: #059669;
  stroke-width: 1.8;
  stroke-linejoin: round;
  fill: rgba(5, 150, 105, 0.06);
  animation: triFade 4s ease-in-out infinite alternate;
}

@keyframes triFade {
  0% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}

/* 切线 */
.mathgeo-tangent {
  stroke: #dc2626;
  stroke-width: 1.5;
  stroke-dasharray: 5 3;
  opacity: 0.65;
}

/* 切点 */
.mathgeo-tangent-dot {
  fill: #dc2626;
  animation: dotPing 1.2s ease-in-out infinite;
}

@keyframes dotPing {
  0%,
  100% {
    r: 4;
    opacity: 1;
  }
  50% {
    r: 6;
    opacity: 0.7;
  }
}

/* 面积填充 */
.mathgeo-area {
  fill: rgba(37, 99, 235, 0.08);
  stroke: none;
  animation: areaFade 2.5s ease-in-out infinite alternate;
}

@keyframes areaFade {
  0% {
    fill: rgba(37, 99, 235, 0.05);
  }
  100% {
    fill: rgba(37, 99, 235, 0.14);
  }
}

/* 散点 */
.mathgeo-scatter {
  fill: #2563eb;
  opacity: 0;
  animation: scatterIn 0.6s ease-out forwards;
}

@keyframes scatterIn {
  0% {
    opacity: 0;
    r: 0;
  }
  60% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.5;
  }
}

/* 浮动公式 */
.mathgeo-formula {
  font-family: "Times New Roman", "STIX Two Math", "Latin Modern Math", serif;
  font-size: 13px;
  font-style: italic;
  fill: #475569;
  opacity: 0;
  animation: formulaFloat 4s ease-in-out infinite;
}

@keyframes formulaFloat {
  0% {
    opacity: 0;
    transform: translateY(8px);
  }
  15% {
    opacity: 0.75;
    transform: translateY(0);
  }
  85% {
    opacity: 0.75;
    transform: translateY(-4px);
  }
  100% {
    opacity: 0;
    transform: translateY(-12px);
  }
}

/* 映射连接虚线 */
.mathgeo-mapping {
  stroke: #94a3b8;
  stroke-width: 1;
  stroke-dasharray: 3 3;
  opacity: 0;
  animation: mappingDraw 3s ease-in-out infinite;
}

@keyframes mappingDraw {
  0% {
    opacity: 0;
    stroke-dashoffset: 20;
  }
  30% {
    opacity: 0.6;
    stroke-dashoffset: 0;
  }
  70% {
    opacity: 0.6;
    stroke-dashoffset: 0;
  }
  100% {
    opacity: 0;
    stroke-dashoffset: -20;
  }
}

/* 底部提示 */
.mathgeo-hint {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(37, 99, 235, 0.12);
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(30, 41, 59, 0.06);
  animation: hintPulse 3s ease-in-out infinite;
}

@keyframes hintPulse {
  0%,
  100% {
    box-shadow: 0 2px 12px rgba(30, 41, 59, 0.06);
  }
  50% {
    box-shadow: 0 2px 20px rgba(37, 99, 235, 0.12);
  }
}

.mathgeo-hint-icon {
  font-family: "JetBrains Mono", monospace;
  font-size: 14px;
  color: #2563eb;
  letter-spacing: 0.05em;
}

.mathgeo-hint-text {
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  letter-spacing: 0.02em;
}

.mathgeo-hint-dots {
  display: flex;
  gap: 4px;
  align-items: center;
}

.mathgeo-hint-dots i {
  display: block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #2563eb;
  animation: hintDotBounce 1.4s ease-in-out infinite;
}

.mathgeo-hint-dots i:nth-child(2) {
  animation-delay: 0.2s;
}

.mathgeo-hint-dots i:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes hintDotBounce {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-6px);
    opacity: 1;
  }
}
</style>

