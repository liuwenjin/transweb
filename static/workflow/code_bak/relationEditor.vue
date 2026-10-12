<template>
  <div id="rootContainerItem" class="tw-relative tw-w-full tw-min-h-screen tw-bg-[#f8fafc] tw-py-10 tw-px-4 sm:tw-px-8 tw-font-sans tw-antialiased tw-text-slate-900">
    <!-- 背景柔和渐变光斑点缀 -->
    <div class="tw-pointer-events-none tw-absolute tw-top-0 tw-left-1/2 -tw-translate-x-1/2 tw-w-full tw-max-w-7xl tw-h-[500px] tw-bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] tw-from-indigo-100/50 tw-via-sky-50/30 tw-to-transparent tw-blur-3xl tw-opacity-80"></div>

    <el-card class="tw-relative tw-z-10 tw-max-w-6xl tw-mx-auto !tw-rounded-3xl !tw-border-slate-200/80 !tw-bg-white/80 tw-backdrop-blur-2xl !tw-shadow-[0_20px_50px_rgba(15,23,42,0.03)] tw-transition-all tw-duration-500 hover:!tw-shadow-[0_25px_60px_rgba(15,23,42,0.06)] !tw-overflow-visible">
      <!-- Card Header / Hero Area -->
      <div class="tw-mb-8 tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-center tw-justify-between tw-gap-4 tw-p-1">
        <div class="tw-flex tw-items-center tw-gap-4">
          <div class="tw-flex tw-h-12 tw-w-12 tw-items-center tw-justify-center tw-rounded-2xl tw-bg-slate-900 tw-text-white tw-shadow-lg tw-shadow-slate-900/15 tw-transition-transform tw-duration-300 hover:tw-scale-105">
            <i class="bi bi-diagram-3 tw-text-xl"></i>
          </div>
          <div>
            <h2 class="tw-text-2xl tw-font-bold tw-tracking-tight tw-text-slate-900">
              Skill 节点依赖关系编排器
            </h2>
            <p class="tw-text-xs sm:tw-text-sm tw-text-slate-500 tw-mt-0.5 tw-font-normal">
              定义并协同编排 Skill 节点间的数据流与控制链路
            </p>
          </div>
        </div>
        <el-button
          type="primary"
          size="large"
          class="custom-primary-btn !tw-rounded-xl !tw-px-5 !tw-py-2.5 !tw-font-medium !tw-shadow-sm tw-transition-all tw-duration-300 hover:!tw-shadow-md"
          @click="showAddLineDialog = true"
          :disabled="isAddLineDisabled"
        >
          <i class="bi bi-plus-lg tw-mr-2 tw-text-sm"></i>
          新增连线
        </el-button>
      </div>

      <!-- Canvas Area -->
      <div
        ref="canvasContainer"
        class="tw-relative tw-overflow-x-auto tw-bg-slate-50/50 tw-border tw-border-slate-200/70 tw-rounded-2xl tw-p-8 tw-pb-28 canvas-container tw-transition-all"
        style="min-height: 380px"
      >
        <svg
          ref="svgCanvas"
          class="tw-absolute tw-top-0 tw-left-0 tw-pointer-events-none tw-z-10 tw-w-full tw-h-full"
          :width="svgWidth"
          :height="svgHeight"
        >
          <line
            v-for="(line, idx) in serialLines"
            :key="`serial-${idx}`"
            :x1="line.x1"
            :y1="line.y1"
            :x2="line.x2"
            :y2="line.y2"
            class="tw-stroke-slate-300"
            style="stroke-width: 2px; stroke-dasharray: 5 4;"
            marker-end="url(#arrowblue)"
          />

          <path
            v-for="(line, idx) in extraLines"
            :key="`extra-${idx}`"
            :ref="
              (el) => {
                if (el) extraLineRefs[idx] = el;
              }
            "
            :d="line.path"
            stroke-dasharray="6,6"
            class="tw-stroke-indigo-400 tw-stroke-2 tw-fill-none tw-cursor-pointer tw-pointer-events-auto tw-transition-all tw-duration-300 extra-path-dashed"
            marker-end="url(#arrowpurple)"
            @click="selectExtraLine(idx)"
            @mouseenter="hoveredLineIdx = idx"
            @mouseleave="hoveredLineIdx = -1"
            :class="{
              'tw-stroke-amber-500 !tw-stroke-[2.5px]': selectedLineIdx === idx,
              'tw-stroke-indigo-600 !tw-stroke-[2.5px]':
                hoveredLineIdx === idx && selectedLineIdx !== idx,
            }"
          />

          <defs>
            <marker
              id="arrowblue"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="3.5"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,7 L7,3.5 z" fill="#cbd5e1" />
            </marker>
            <marker
              id="arrowpurple"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="3.5"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,7 L7,3.5 z" fill="#818cf8" />
            </marker>
          </defs>
        </svg>

        <!-- Nodes Display Area -->
        <div
          class="tw-relative tw-flex tw-gap-28 tw-justify-start tw-items-center tw-z-20"
          style="min-height: 200px; padding: 24px 0"
        >
          <div
            v-for="(node, idx) in nodes"
            :key="node.id"
            :ref="
              (el) => {
                if (el) nodeRefs[idx] = el;
              }
            "
            class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-flex-shrink-0"
          >
            <div
              class="node-card tw-rounded-2xl tw-border tw-border-slate-200/80 tw-bg-white tw-shadow-[0_4px_16px_rgba(15,23,42,0.04)] tw-p-5 tw-w-44 tw-text-center tw-transition-all tw-duration-300 hover:-tw-translate-y-1"
              :class="{
                '!tw-border-indigo-500 !tw-shadow-[0_12px_28px_rgba(99,102,241,0.15)] tw-ring-4 tw-ring-indigo-500/10': hoveredNodeIdx === idx,
              }"
              @mouseenter="hoveredNodeIdx = idx"
              @mouseleave="hoveredNodeIdx = -1"
            >
              <div
                class="tw-text-[11px] tw-font-bold tw-tracking-widest tw-uppercase tw-text-slate-400 tw-mb-1.5"
              >
                {{ node.id.slice(0, 5) }}#{{ idx }}
              </div>
              <div
                class="tw-text-base tw-font-semibold tw-leading-relaxed tw-text-slate-800"
              >
                {{ node.name }}
              </div>
            </div>
          </div>
        </div>

        <!-- Serial Line Button Menu -->
        <div
          v-for="(line, idx) in serialLines"
          :key="`serial-btn-${idx}`"
          class="tw-absolute tw-pointer-events-auto tw-z-30"
          :style="getSerialLineMenuPosition(idx)"
        >
          <el-button
            type="info"
            size="small"
            circle
            class="!tw-shadow-sm !tw-bg-white !tw-border-slate-200/90 !tw-text-slate-600 hover:!tw-text-slate-900 hover:!tw-bg-slate-50 hover:!tw-border-slate-300 !tw-w-7 !tw-h-7 tw-flex tw-items-center tw-justify-center tw-transition-all tw-duration-200 hover:tw-scale-110"
            @click.stop="editLineProperty(line.rawIndex)"
          >
            <i class="bi bi-pencil-square tw-text-xs"></i>
          </el-button>
        </div>

        <!-- Extra Line Button & Menu -->
        <div
          v-for="(line, idx) in extraLines"
          :key="`menu-${idx}`"
          class="tw-absolute tw-pointer-events-auto tw-flex tw-flex-col tw-items-center tw-transition-transform tw-duration-200"
          :style="getLineMenuPosition(idx)"
          @mouseenter="hoveredLineIdx = idx"
          @mouseleave="hoveredLineIdx = -1"
        >
          <el-button
            type="primary"
            size="small"
            v-if="nodes[line.from] && nodes[line.to]"
            circle
            @click.stop="toggleLineMenu(idx)"
            class="!tw-shadow-md tw-flex-shrink-0 !tw-border tw-transition-all tw-duration-300"
            :class="[
              selectedLineIdx === idx
                ? '!tw-border-amber-500 !tw-bg-amber-500 !tw-text-white'
                : hoveredLineIdx === idx
                ? '!tw-border-indigo-600 tw-scale-110 !tw-bg-indigo-50 !tw-text-indigo-600'
                : '!tw-border-slate-200 !tw-bg-white !tw-text-indigo-500 hover:!tw-border-indigo-300',
              'line-menu-btn',
            ]"
            :title="`连线 ${nodes[line.from].id}#${nodes[line.from].name} → ${
              nodes[line.to].id
            }#${nodes[line.to].name}`"
          >
            <span class="tw-text-[11px] tw-font-bold"
              >{{ line.from }}-{{ line.to }}</span
            >
          </el-button>

          <!-- Expanded Menu Popup -->
          <transition name="menu-fade">
            <div
              v-if="expandedLineMenuIdx === idx"
              class="tw-absolute tw-bottom-full tw-mb-3 tw-flex tw-flex-col tw-bg-white/95 tw-backdrop-blur-xl tw-rounded-2xl tw-shadow-[0_12px_32px_rgba(15,23,42,0.12)] tw-border tw-border-slate-100 tw-p-1.5 tw-z-40"
            >
              <button
                @click="editLineProperty(line.rawIndex)"
                class="tw-px-3.5 tw-py-2 tw-text-xs tw-font-medium tw-text-slate-700 hover:tw-bg-slate-100/70 hover:tw-text-slate-900 tw-rounded-xl tw-transition-colors tw-flex tw-items-center tw-gap-2.5 tw-whitespace-nowrap"
              >
                <i class="bi bi-pencil-square tw-text-slate-400"></i>
                编辑
              </button>
              <button
                @click="deleteExtraLine(line.rawIndex)"
                class="tw-px-3.5 tw-py-2 tw-text-xs tw-font-medium tw-text-rose-600 hover:tw-bg-rose-50 tw-rounded-xl tw-transition-colors tw-flex tw-items-center tw-gap-2.5 tw-whitespace-nowrap"
              >
                <i class="bi bi-trash tw-text-rose-500"></i>
                删除
              </button>
            </div>
          </transition>
        </div>
      </div>
    </el-card>

    <!-- Dialog: Add Line -->
    <el-dialog
      v-model="showAddLineDialog"
      title="新增连线"
      width="460px"
      class="premium-dialog"
      @close="resetLineForm"
      destroy-on-close
    >
      <div class="tw-space-y-4 tw-py-1">
        <div>
          <label class="tw-block tw-text-xs tw-font-semibold tw-text-slate-600 tw-mb-1.5">
            起点节点
          </label>
          <el-select
            v-model="lineForm.from"
            placeholder="选择起点"
            class="tw-w-full"
            size="large"
            @change="startNodeChange(lineForm.from)"
          >
            <el-option
              v-for="(node, idx) in nodes"
              :key="node.id"
              :label="`${node.id.slice(0, 5)}#${idx} - ${node.name.slice(0, 8)}`"
              :value="idx"
            />
          </el-select>
        </div>
        <div>
          <label class="tw-block tw-text-xs tw-font-semibold tw-text-slate-600 tw-mb-1.5">
            终点节点
          </label>
          <el-select
            v-model="lineForm.to"
            placeholder="选择终点"
            class="tw-w-full"
            size="large"
          >
            <el-option
              v-for="(node, idx) in nodes"
              :key="node.id"
              :label="`${node.id.slice(0, 5)}#${idx} - ${node.name.slice(0, 8)}`"
              :value="idx"
              :disabled="isNodeDisabled(idx)"
            />
          </el-select>
        </div>
        <div>
          <label class="tw-block tw-text-xs tw-font-semibold tw-text-slate-600 tw-mb-1.5">
            连线属性
          </label>
          <el-select
            v-model="lineForm.property"
            placeholder="选择属性"
            class="tw-w-full"
            size="large"
            multiple
            collapse-tags
            collapse-tags-tooltip
          >
            <el-option
              v-for="item in currentOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </div>
        <div>
          <label class="tw-block tw-text-xs tw-font-semibold tw-text-slate-600 tw-mb-1.5">
            备注
          </label>
          <el-input
            v-model="lineForm.remark"
            type="textarea"
            placeholder="添加备注信息..."
            :rows="3"
            resize="none"
          />
        </div>
      </div>
      <template #footer>
        <div class="tw-flex tw-gap-3 tw-justify-end tw-pt-3">
          <el-button size="large" class="!tw-rounded-xl" @click="showAddLineDialog = false">取消</el-button>
          <el-button size="large" type="primary" class="custom-primary-btn !tw-rounded-xl" @click="confirmAddLine">添加</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Dialog: Edit Line -->
    <el-dialog
      v-model="showEditLineDialog"
      title="编辑连线属性"
      width="460px"
      class="premium-dialog"
      @close="resetLineForm"
      destroy-on-close
    >
      <div class="tw-space-y-4 tw-py-1">
        <div v-if="lineForm.from !== null && lineForm.to !== null">
          <label class="tw-block tw-text-xs tw-font-semibold tw-text-slate-600 tw-mb-1.5">
            连线路径
          </label>
          <div
            class="tw-rounded-xl tw-bg-slate-100/80 tw-border tw-border-slate-200/80 tw-px-4 tw-py-3 tw-text-xs tw-font-medium tw-text-slate-700 tw-flex tw-items-center tw-justify-between"
          >
            <span>{{ nodes[lineForm.from].id.slice(0, 5) }}#{{ lineForm.from }} [{{ nodes[lineForm.from].name }}]</span>
            <i class="bi bi-arrow-right tw-text-slate-400"></i>
            <span>{{ nodes[lineForm.to].id.slice(0, 5) }}#{{ lineForm.to }} [{{ nodes[lineForm.to].name }}]</span>
          </div>
        </div>
        <div>
          <label class="tw-block tw-text-xs tw-font-semibold tw-text-slate-600 tw-mb-1.5">
            连线属性
          </label>
          <el-select
            v-model="lineForm.property"
            placeholder="选择属性"
            multiple
            size="large"
            @change="handlePropertyChange()"
            collapse-tags
            collapse-tags-tooltip
            class="tw-w-full"
          >
            <el-option
              v-for="item in currentOptions"
              :key="item"
              :label="item"
              :value="item"
            />
            <el-option
              v-if="Number(lineForm.to) - Number(lineForm.from) === 1 && nodes[lineForm.from] && nodes[lineForm.to]"
              label="(none)"
              value="(none)"
              key="(none)"
            ></el-option>
          </el-select>
          <span
            class="tw-text-[12px] tw-text-slate-400 tw-mt-1.5 tw-block"
            v-if="lineForm.property.indexOf('(none)') !== -1"
            >当前相邻节点不传递数据</span
          >
        </div>
        <div>
          <label class="tw-block tw-text-xs tw-font-semibold tw-text-slate-600 tw-mb-1.5">
            备注
          </label>
          <el-input
            v-model="lineForm.remark"
            type="textarea"
            placeholder="添加备注信息..."
            :rows="3"
            resize="none"
          />
        </div>
      </div>
      <template #footer>
        <div class="tw-flex tw-gap-3 tw-justify-end tw-pt-3">
          <el-button size="large" class="!tw-rounded-xl" @click="showEditLineDialog = false">取消</el-button>
          <el-button size="large" type="primary" class="custom-primary-btn !tw-rounded-xl" @click="confirmEditLine">更新</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "AgentWorkflowOrchestrator",
  data() {
    return {
      nodes: [
        { id: "agent-1", name: "题意理解" },
        { id: "agent-2", name: "作图规划" },
        { id: "agent-3", name: "绘图脚本" },
      ],
      allLines: [],
      showAddLineDialog: false,
      showEditLineDialog: false,
      currentOptions: [],
      lineForm: {
        from: null,
        to: null,
        property: [],
        remark: "",
      },
      editingLineRawIdx: -1,
      selectedLineIdx: -1,
      hoveredNodeIdx: -1,
      hoveredLineIdx: -1,
      expandedLineMenuIdx: -1,
      svgWidth: 0,
      svgHeight: 0,
      nodePositions: [],
      extraLineRefs: {},
      nodeRefs: {},
      resizeObserver: null,
    };
  },
  computed: {
    serialLines() {
      const lines = [];
      if (this.nodePositions.length < this.nodes.length) return lines;

      this.allLines.forEach((line, index) => {
        if (line.to - line.from === 1) {
          const pos1 = this.nodePositions[line.from];
          const pos2 = this.nodePositions[line.to];
          if (pos1 && pos2 && this.nodes[line.from] && this.nodes[line.to]) {
            lines.push({
              rawIndex: index,
              from: line.from,
              to: line.to,
              // 起点：前一节点卡片右侧边缘中点
              x1: pos1.x + pos1.width,
              y1: pos1.y + pos1.height / 2,
              // 终点：后一节点卡片左侧边缘中点，稍微往左留出 1px 紧贴边缘
              x2: pos2.x - 1,
              y2: pos2.y + pos2.height / 2,
            });
          }
        }
      });
      return lines;
    },
    extraLines() {
      const lines = [];
      this.allLines.forEach((line, index) => {
        if (line.to - line.from > 1 && this.nodes[line.from] && this.nodes[line.to]) {
          lines.push({
            ...line,
            rawIndex: index,
            path: this.getExtraLinePath(line),
          });
        }
      });
      return lines;
    },
    isAddLineDisabled() {
      const maxExtraLines =
        (this.nodes.length * (this.nodes.length - 1)) / 2 -
        (this.nodes.length - 1);
      return this.extraLines.length >= maxExtraLines;
    },
  },
  watch: {
    nodePositions: {
      handler() {
        this.updateSvgDimensions();
      },
      deep: true,
    },
  },
  methods: {
    toggleLineMenu(idx) {
      this.expandedLineMenuIdx = this.expandedLineMenuIdx === idx ? -1 : idx;
    },
    getLineOptions(nodeIdx, callback) {
      const node = this.nodes[nodeIdx] || this.nodes[0];
      if (typeof aigcInterface !== "undefined" && aigcInterface.getAppData) {
        aigcInterface.getAppData(
          node.id,
          (data) => {
            console.log("Fetched data for node:", node.id, data);
            let keys = Object.keys(data);
            if (typeof callback === "function") callback(keys);
          },
          () => {
            if (typeof callback === "function") callback([]);
          }
        );
      } else {
        if (typeof callback === "function")
          callback(["condition", "data-flow", "error-handler", "parallel"]);
      }
    },
    getSerialLineMenuPosition(idx) {
      const line = this.serialLines[idx];
      if (!line) return { display: "none" };

      const midX = (line.x1 + line.x2) / 2;
      const midY = (line.y1 + line.y2) / 2;

      return {
        left: `${midX}px`,
        top: `${midY}px`,
        transform: "translate(-50%, -50%)",
        zIndex: 35,
      };
    },
    getLineMenuPosition(idx) {
      const pathEl = this.extraLineRefs[idx];
      const line = this.extraLines[idx];
      if (!pathEl || !line) return { display: "none" };

      try {
        const totalLength = pathEl.getTotalLength();
        const step = line.to - line.from;
        const ratio = Math.min(0.12 + step * 0.03, 0.35);
        const offsetPoint = pathEl.getPointAtLength(totalLength * ratio);

        return {
          left: `${offsetPoint.x}px`,
          top: `${offsetPoint.y - 12}px`,
          transform: "translate(-50%, -50%)",
          zIndex:
            this.expandedLineMenuIdx === idx
              ? 45
              : this.hoveredLineIdx === idx
              ? 42
              : 30,
        };
      } catch (e) {
        return { display: "none" };
      }
    },
    isNodeDisabled(idx) {
      if (this.lineForm.from === null) return false;
      if (idx - this.lineForm.from === 1) return true;
      return (
        idx <= this.lineForm.from ||
        this.allLines.some(
          (line) => line.from === this.lineForm.from && line.to === idx
        )
      );
    },
    calculateNodePositions() {
      const action = () => {
        const container = this.$refs.canvasContainer;
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        const newPositions = [];
        let valid = true;

        for (let i = 0; i < this.nodes.length; i++) {
          const el = this.nodeRefs[i];
          if (el) {
            const rect = el.getBoundingClientRect();
            // 精确计算相对 container 绝对坐标
            newPositions.push({
              x: rect.left - containerRect.left + container.scrollLeft,
              y: rect.top - containerRect.top + container.scrollTop,
              width: rect.width,
              height: rect.height,
            });
          } else {
            valid = false;
          }
        }
        if (valid && newPositions.length === this.nodes.length) {
          this.nodePositions = newPositions;
        }
      };

      this.$nextTick(() => {
        action();
        requestAnimationFrame(action);
      });
    },
    updateSvgDimensions() {
      const container = this.$refs.canvasContainer;
      if (container) {
        this.svgWidth = container.scrollWidth;
        this.svgHeight = Math.max(360, container.scrollHeight);
      }
    },
    handlePropertyChange() {
      if (this.lineForm.property.indexOf("(none)") !== -1) {
        this.lineForm.property = ["(none)"];
      }
    },
    getExtraLinePath(line) {
      if (!this.nodePositions[line.from] || !this.nodePositions[line.to])
        return "";

      const from = this.nodePositions[line.from];
      const to = this.nodePositions[line.to];

      const x1 = from.x + from.width;
      const y1 = from.y + from.height / 2;
      const x2 = to.x - 1;
      const y2 = to.y + to.height / 2;

      const distance = Math.abs(x2 - x1);
      const controlOffset = Math.min(distance / 3, 80);
      const step = line.to - line.from;
      const curveHeight = 35 + step * 20;

      return `M ${x1} ${y1} C ${x1 + controlOffset} ${y1 + curveHeight}, ${
        x2 - controlOffset
      } ${y2 + curveHeight}, ${x2} ${y2}`;
    },
    editLineProperty(rawIndex) {
      const line = this.allLines[rawIndex];
      if (!line) return;

      this.lineForm = {
        from: line.from,
        to: line.to,
        property: Array.isArray(line.property)
          ? [...line.property]
          : line.property
          ? [line.property]
          : [],
        remark: line.remark || "",
      };

      this.editingLineRawIdx = rawIndex;
      this.showEditLineDialog = true;
      this.expandedLineMenuIdx = -1;

      this.getLineOptions(line.from, (arr) => {
        this.currentOptions = arr;
      });
    },
    confirmEditLine() {
      if (this.editingLineRawIdx !== -1) {
        const targetLine = this.allLines[this.editingLineRawIdx];
        this.allLines[this.editingLineRawIdx] = {
          ...targetLine,
          property: this.lineForm.property,
          remark: this.lineForm.remark,
        };
        this.showEditLineDialog = false;
        this.resetLineForm();
        this.calculateNodePositions();
        console.log("this.allLines: ", this.allLines);
        this.$message.success("关系更新成功。");
      }
    },
    selectExtraLine(idx) {
      this.selectedLineIdx = this.selectedLineIdx === idx ? -1 : idx;
    },
    deleteExtraLine(rawIndex) {
      this.$confirm("确定删除该连线？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.allLines.splice(rawIndex, 1);
          this.selectedLineIdx = -1;
          this.expandedLineMenuIdx = -1;
          this.extraLineRefs = {};
          this.calculateNodePositions();
          console.log("this.allLines (After Delete): ", this.allLines);
        })
        .catch(() => {});
    },
    startNodeChange(from) {
      this.getLineOptions(from, (arr) => {
        this.currentOptions = arr;
        this.lineForm.property = [];
      });
    },
    confirmAddLine() {
      if (
        this.lineForm.from === null ||
        this.lineForm.to === null ||
        this.lineForm.from >= this.lineForm.to
      ) {
        this.$message.error("请选择有效的连线路径");
        return;
      }

      const isExists = this.allLines.some(
        (line) =>
          line.from === this.lineForm.from && line.to === this.lineForm.to
      );
      if (isExists) {
        this.$message.error("该连线已存在");
        return;
      }

      this.allLines.push({
        from: this.lineForm.from,
        to: this.lineForm.to,
        property: this.lineForm.property,
        remark: this.lineForm.remark,
      });

      this.showAddLineDialog = false;
      this.resetLineForm();
      this.calculateNodePositions();
      console.log("this.allLines (After Add): ", this.allLines);
    },
    resetLineForm() {
      this.lineForm = {
        from: null,
        to: null,
        property: [],
        remark: "",
      };
      this.editingLineRawIdx = -1;
    },
  },
  mounted() {
    const baseLines = [];
    for (let i = 0; i < this.nodes.length - 1; i++) {
      baseLines.push({
        from: i,
        to: i + 1,
        property: [],
        remark: "",
      });
    }

    const existingLines = this.allLines || [];
    const mergedLines = [...existingLines];

    baseLines.forEach((baseLine) => {
      const isAlreadyExists = mergedLines.some(
        (line) => line.from === baseLine.from && line.to === baseLine.to
      );
      if (!isAlreadyExists) {
        mergedLines.push(baseLine);
      }
    });

    mergedLines.sort((a, b) => {
      if (a.from === b.from) return a.to - b.to;
      return a.from - b.from;
    });

    this.allLines = mergedLines;
    this.calculateNodePositions();

    // 监听窗口与容器尺寸变化，动态纠正坐标
    window.addEventListener("resize", this.calculateNodePositions);
    if (this.$refs.canvasContainer) {
      this.resizeObserver = new ResizeObserver(() => {
        this.calculateNodePositions();
      });
      this.resizeObserver.observe(this.$refs.canvasContainer);
    }
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.calculateNodePositions);
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },
};
</script>

<style scoped>
/* 按钮基础定制 */
.custom-primary-btn {
  background-color: #0f172a !important;
  border-color: #0f172a !important;
  color: #ffffff !important;
}
.custom-primary-btn:hover {
  background-color: #1e293b !important;
  border-color: #1e293b !important;
}

.line-menu-btn {
  width: 32px !important;
  height: 32px !important;
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

.canvas-container {
  position: relative;
}

/* 虚线连线曲线过渡动画 */
.extra-path-dashed {
  transition: stroke 0.25s ease, stroke-width 0.25s ease;
}

/* 展开菜单微动画 */
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.95);
}

/* 弹窗圆角与阴影全局改写 */
:deep(.premium-dialog) {
  border-radius: 20px !important;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.18) !important;
}

:deep(.premium-dialog .el-dialog__header) {
  margin-right: 0;
  padding: 20px 24px 12px;
  border-bottom: 1px solid #f1f5f9;
}

:deep(.premium-dialog .el-dialog__title) {
  font-weight: 700;
  font-size: 1.125rem;
  color: #0f172a;
}

:deep(.premium-dialog .el-dialog__body) {
  padding: 20px 24px;
}

:deep(.premium-dialog .el-dialog__footer) {
  padding: 12px 24px 20px;
  border-top: 1px solid #f1f5f9;
}
</style>