<template>
  <!-- 主容器：严格锁定 100vh，隐藏外层所有溢出 -->
  <div class="agentCreatorRoot appleRoot" data-edit-id="1">
    <div class="appleShell" data-edit-id="72">
      <!-- 1. 状态提示框（跨状态复用） -->
      <div
        v-if="statusMessage && step !== 'result'"
        class="appleNotice"
        :class="{
          'appleNotice--success': statusType === 'success',
          'appleNotice--error': statusType === 'error',
          'appleNotice--info': statusType === 'info',
        }"
        data-edit-id="7"
      >
        <i
          :class="{
            'el-icon-circle-check': statusType === 'success',
            'el-icon-warning': statusType === 'error',
            'el-icon-info': statusType === 'info',
          }"
          class="appleNotice__icon"
          data-edit-id="8"
        ></i>
        <span data-edit-id="9">{{ statusMessage }}</span>
      </div>

      <!-- 2. 主内容展示区（占用剩余所有空间） -->
      <main class="appleBody" data-edit-id="10">
        <!-- 视图 A：初始化状态 -->
        <div v-if="step === 'init'" class="appleStage" data-edit-id="11">
          <div class="appleCard" data-edit-id="12">
            <!-- 文档选择区 -->
            <div class="appleField" data-edit-id="16">
              <div
                class="appleDropzone"
                :class="{
                  'appleDropzone--active': !!selectedDoc,
                  'appleDropzone--dragging': dragDepth > 0,
                }"
                role="button"
                tabindex="0"
                :aria-label="dropzoneAriaLabel"
                @click="triggerFilePicker"
                @keydown.enter.prevent="triggerFilePicker"
                @keydown.space.prevent="triggerFilePicker"
                @dragenter.prevent="onDragEnter"
                @dragover.prevent
                @dragleave.prevent="onDragLeave"
                @drop.prevent="onDrop"
                data-edit-id="17"
              >
                <div class="appleDropzone__glyph" data-edit-id="18">
                  <i
                    class="el-icon-upload2"
                    :class="selectedDoc ? 'is-active' : ''"
                    data-edit-id="92"
                  ></i>
                </div>

                <!-- 文件解析中：加载提示 -->
                <div
                  v-if="parsingFile"
                  class="appleDropzone__parsing"
                  data-edit-id="118"
                >
                  <div
                    class="appleSpinner appleSpinner--sm"
                    data-edit-id="119"
                  ></div>
                  <p class="appleDropzone__action" data-edit-id="120">
                    {{ t("drop.parsing") }}
                  </p>
                  <p class="appleDropzone__hint" data-edit-id="121">
                    {{ t("drop.parsingHint") }}
                  </p>
                </div>

                <div
                  v-else-if="!selectedDoc"
                  class="appleDropzone__empty"
                  data-edit-id="19"
                >
                  <p class="appleDropzone__action" data-edit-id="94">
                    <span class="appleDropzone__link" data-edit-id="20">{{
                      t("drop.click")
                    }}</span>
                    {{ t("drop.or") }}
                  </p>
                  <p class="appleDropzone__hint" data-edit-id="21">
                    {{ t("drop.hint") }}
                  </p>
                </div>

                <div v-else class="appleDropzone__file" data-edit-id="22">
                  <div class="appleDropzone__row" data-edit-id="23">
                    <i
                      class="el-icon-document appleDropzone__fileIcon"
                      data-edit-id="24"
                    ></i>
                    <span class="appleDropzone__name" data-edit-id="25">{{
                      selectedDoc.name
                    }}</span>
                    <span class="appleDropzone__size" data-edit-id="26">
                      ({{ formatSize(selectedDoc.size) }})
                    </span>
                  </div>
                  <p class="appleDropzone__hint" data-edit-id="27">
                    {{ t("drop.repick") }}
                  </p>
                </div>
              </div>

              <!-- 隐藏的原生文件输入 -->
              <input
                ref="fileInput"
                type="file"
                class="appleHiddenInput"
                accept=".md,.txt,.pdf,.docx"
                @change="handleFileChange"
                data-edit-id="28"
              />
            </div>

            <!-- 确认创建按钮 + 信任计费微文案 -->
            <el-button
              type="primary"
              class="appleBtn appleBtn--primary appleBtn--block"
              :disabled="!selectedDoc || parsingFile"
              @click="handleCreate"
              data-edit-id="29"
            >
              <i class="el-icon-magic-stick" data-edit-id="30"></i>
              {{ t("cta.generate") }}
            </el-button>

            <p class="appleTrustNote" data-edit-id="115">
              {{ t("trust.note") }}
            </p>
          </div>
        </div>

        <!-- 视图 B：等待状态 -->
        <div
          v-else-if="step === 'waiting'"
          class="appleStage"
          data-edit-id="31"
        >
          <div class="appleWait" data-edit-id="32">
            <!-- generateProgressApp 挂载容器：始终存在，供 webCpu.updateView 注入 -->
            <div
              ref="waitingStepArea"
              class="appleWait__app"
              data-edit-id="116"
            ></div>

            <!-- 加载等待提示：generateProgressApp 加载渲染前与过程中显示 -->
            <transition name="appleWaitFade">
              <div
                v-if="!progressAppReady"
                class="appleWait__loading"
                data-edit-id="117"
              >
                <div class="appleSpinner" data-edit-id="33"></div>
                <h3 class="appleWait__title" data-edit-id="35">
                  {{ t("wait.title") }}
                </h3>
                <p class="appleWait__desc" data-edit-id="36">
                  {{ t("wait.desc") }}
                </p>

                <!-- 进度提示条 -->
                <div class="appleProgress" data-edit-id="37">
                  <el-progress
                    :percentage="progress"
                    :stroke-width="4"
                    :show-text="false"
                    data-edit-id="38"
                  ></el-progress>
                  <p class="appleProgress__text" data-edit-id="39">
                    {{ progressText }}
                  </p>
                </div>
              </div>
            </transition>
          </div>
        </div>

        <!-- 视图 C：结果显示 -->
        <div v-else class="appleStage" data-edit-id="40">
          <div class="appleCard appleCard--result" data-edit-id="41">
            <!-- 成功标识 + Agent 名称 / 一句话描述 -->
            <div
              class="appleCard__intro appleCard__intro--center"
              data-edit-id="42"
            >
              <div class="appleBadge appleBadge--success" data-edit-id="43">
                <i
                  class="bi bi-check-lg"
                  data-edit-id="44"
                  aria-hidden="true"
                ></i>
              </div>
              <h2 class="appleTitle appleTitle--sm" data-edit-id="45">
                {{ agentName || t("result.created") }}
              </h2>
              <p class="appleSubtitle" data-edit-id="46">
                {{ agentIdentity || t("result.ready") }}
              </p>
            </div>

            <!-- URL + 二维码 双栏 -->
            <div class="appleResult" data-edit-id="47">
              <!-- 左：URL 展示与操作 -->
              <div class="appleResult__main" data-edit-id="48">
                <span class="appleLabel" data-edit-id="49">{{
                  t("result.urlLabel")
                }}</span>
                <div class="appleUrl" data-edit-id="50">{{ shareUrl }}</div>

                <div class="appleBtnRow" data-edit-id="51">
                  <el-button
                    class="appleBtn appleBtn--secondary"
                    @click="handleCopyUrl"
                    data-edit-id="52"
                  >
                    <i class="el-icon-document-copy" data-edit-id="53"></i>
                    {{ t("result.copy") }}
                  </el-button>
                  <a
                    :href="shareUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="appleBtn appleBtn--link"
                    data-edit-id="54"
                  >
                    <i class="el-icon-top-right" data-edit-id="55"></i>
                    {{ t("result.open") }}
                  </a>
                </div>
              </div>

              <!-- 右：二维码 -->
              <div class="appleResult__side" data-edit-id="56">
                <span class="appleLabel" data-edit-id="57">{{
                  t("result.qrLabel")
                }}</span>
                <div class="appleQr" data-edit-id="58">
                  <div
                    v-if="qrCodeDataUrl"
                    class="appleQr__img"
                    data-edit-id="59"
                  >
                    <img
                      :src="qrCodeDataUrl"
                      alt="Agent QR Code"
                      data-edit-id="60"
                    />
                  </div>
                  <div v-else class="appleQr__empty" data-edit-id="61">
                    <i class="el-icon-picture-outline" data-edit-id="62"></i>
                  </div>
                </div>
                <span class="appleQr__hint" data-edit-id="63">{{
                  t("result.qrHint")
                }}</span>
              </div>
            </div>

            <!-- 本次生成消耗：点击唤起气泡浮窗 -->
            <div class="appleUsageWrap" ref="usageWrap" data-edit-id="95">
              <button
                class="appleUsageTrigger"
                type="button"
                :aria-expanded="showUsage ? 'true' : 'false'"
                aria-controls="usagePopover"
                @click="toggleUsage"
                data-edit-id="96"
              >
                <i class="el-icon-info" data-edit-id="97"></i>
                <span data-edit-id="98">{{ t("usage.trigger") }}</span>
              </button>

              <transition name="appleFade">
                <div
                  v-show="showUsage"
                  ref="usagePopover"
                  id="usagePopover"
                  class="appleUsagePopover"
                  :class="{ 'appleUsagePopover--up': popoverUp }"
                  role="dialog"
                  :aria-label="t('usage.title')"
                  data-edit-id="99"
                >
                  <div class="appleUsagePopover__head" data-edit-id="100">
                    <span data-edit-id="101">{{ t("usage.title") }}</span>
                    <button
                      class="appleUsagePopover__close"
                      type="button"
                      :aria-label="t('usage.close')"
                      @click="closeUsage"
                      data-edit-id="102"
                    >
                      <span data-edit-id="103"></span>
                      <span data-edit-id="104"></span>
                    </button>
                  </div>

                  <div class="appleUsagePopover__list" data-edit-id="105">
                    <div class="appleUsagePopover__row" data-edit-id="106">
                      <span class="appleUsagePopover__label" data-edit-id="107"
                        >{{ t("usage.points")
                        }}<small>{{ t("usage.pointsUnit") }}</small></span
                      >
                      <strong
                        class="appleUsagePopover__value"
                        data-edit-id="108"
                        >{{ formatNumber(pointsCost) }}</strong
                      >
                    </div>

                    <div class="appleUsagePopover__row" data-edit-id="109">
                      <span class="appleUsagePopover__label" data-edit-id="110"
                        >{{ t("usage.output")
                        }}<small>{{ t("usage.outputUnit") }}</small></span
                      >
                      <strong
                        class="appleUsagePopover__value"
                        data-edit-id="111"
                        >{{ formatNumber(completion_tokens) }}</strong
                      >
                    </div>

                    <div class="appleUsagePopover__row" data-edit-id="112">
                      <span class="appleUsagePopover__label" data-edit-id="113"
                        >{{ t("usage.input")
                        }}<small>{{ t("usage.inputUnit") }}</small></span
                      >
                      <strong
                        class="appleUsagePopover__value"
                        data-edit-id="114"
                        >{{ formatNumber(prompt_tokens) }}</strong
                      >
                    </div>
                  </div>
                </div>
              </transition>
            </div>

            <!-- 底部操作 -->
            <div class="appleBtnRow appleBtnRow--footer" data-edit-id="64">
              <el-button
                class="appleBtn appleBtn--secondary"
                :disabled="!qrCodeDataUrl"
                @click="handleDownloadQrCode"
                data-edit-id="65"
              >
                <i class="el-icon-picture-outline" data-edit-id="66"></i>
                {{ t("result.downloadQr") }}
              </el-button>
              <el-button
                class="appleBtn appleBtn--secondary"
                :loading="downloadingAgent"
                @click="handleDownloadAgentPage"
                data-edit-id="67"
              >
                <i class="el-icon-download" data-edit-id="68"></i>
                {{ t("result.downloadPage") }}
              </el-button>
              <el-button
                type="primary"
                class="appleBtn appleBtn--primary"
                @click="handleBack"
                data-edit-id="69"
              >
                <i class="el-icon-refresh-left" data-edit-id="70"></i>
                {{ t("result.back") }}
              </el-button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: "AgentCreator",
  data: function () {
    return {
      // 流程状态机：init -> waiting -> result
      step: "init",
      // 当前语言：zh / en（由父页面 creator.html 通过 window.__APP_LANG__ 与 applangchange 事件驱动）
      lang: "zh",
      COPY: {
        zh: {
          "drop.click": "点击选择文档",
          "drop.or": "或将文件拖拽到此处",
          "drop.hint": "支持 .md / .txt / .pdf / .docx，单个文件不超过 20MB",
          "drop.repick": "点击可重新选择文档",
          "drop.parsing": "正在解析文档…",
          "drop.parsingHint": "正在读取并解析文档内容，请稍候…",
          "drop.ariaEmpty": "选择或拖拽文档到此处",
          "drop.ariaSelected": "已选择文档：{name}，点击重新选择",
          "cta.generate": "立即一键生成 AI 助教",
          "trust.note":
            "按实际用量计费 · 闲置零成本 · 生成后展示积分与用量明细",
          "wait.title": "Agent 正在创建中",
          "wait.desc":
            "正在解析文档并生成智能体，请稍候，完成后将自动展示结果…",
          "result.created": "Agent 创建成功",
          "result.ready": "智能体已就绪，可通过以下方式访问与分发",
          "result.urlLabel": "Agent 访问地址",
          "result.copy": "复制链接",
          "result.open": "打开预览",
          "result.qrLabel": "扫码访问",
          "result.qrHint": "手机扫码即可体验",
          "usage.trigger": "查看本次消耗",
          "usage.title": "本次生成消耗",
          "usage.close": "关闭",
          "usage.points": "消费积分",
          "usage.pointsUnit": "POINTS",
          "usage.output": "输出 Token",
          "usage.outputUnit": "COMPLETION",
          "usage.input": "输入 Token",
          "usage.inputUnit": "PROMPT",
          "result.downloadQr": "下载二维码",
          "result.downloadPage": "下载 Agent 网页",
          "result.back": "返回重新创建",
          "status.unsupported": "不支持的文件类型：{ext}",
          "status.tooLarge": "文件超过 20MB 大小限制",
          "status.selected": "已选择文档：{name}",
          "status.needDoc": "请先选择一份文档",
          "status.parseFail": "文档解析失败，请重试",
          "progress.parsing": "解析文档...",
          "progress.done": "创建完成",
          "copy.ok": "Agent URL 已成功复制到剪贴板",
          "copy.okShort": "Agent URL 已复制",
          "copy.fail": "复制失败，请手动选择复制",
          "copy.failShort": "复制失败",
          "download.fail": "下载失败，请重试",
          "step.title": "正在构建你的Agent…",
          "step.s1": "构建知识库",
          "step.s2": "生成基础信息",
          "step.s3": "生成人设信息",
          "step.s4": "加载Agent模板",
          "step.s5": "合成Agent应用",
        },
        en: {
          "drop.click": "Choose a document",
          "drop.or": "or drag a file here",
          "drop.hint":
            "Supports .md / .txt / .pdf / .docx, up to 20 MB per file",
          "drop.repick": "Click to choose another document",
          "drop.parsing": "Parsing document…",
          "drop.parsingHint": "Reading and parsing the document, please wait…",
          "drop.ariaEmpty": "Choose or drag a document here",
          "drop.ariaSelected": "Selected: {name}. Click to choose again",
          "cta.generate": "Generate your AI assistant now",
          "trust.note":
            "Pay only for actual usage · Zero cost when idle · Usage breakdown shown after creation",
          "wait.title": "Creating your agent…",
          "wait.desc":
            "Parsing your document and building the agent. This only takes a moment — results appear automatically.",
          "result.created": "Agent created",
          "result.ready": "Your agent is ready. Access and share it below.",
          "result.urlLabel": "Agent URL",
          "result.copy": "Copy link",
          "result.open": "Open preview",
          "result.qrLabel": "Scan to access",
          "result.qrHint": "Scan with your phone to try it",
          "usage.trigger": "View usage",
          "usage.title": "Usage for this build",
          "usage.close": "Close",
          "usage.points": "Points",
          "usage.pointsUnit": "POINTS",
          "usage.output": "Output tokens",
          "usage.outputUnit": "COMPLETION",
          "usage.input": "Input tokens",
          "usage.inputUnit": "PROMPT",
          "result.downloadQr": "Download QR code",
          "result.downloadPage": "Download agent page",
          "result.back": "Create another",
          "status.unsupported": "Unsupported file type: {ext}",
          "status.tooLarge": "File exceeds the 20 MB limit",
          "status.selected": "Selected: {name}",
          "status.needDoc": "Please choose a document first",
          "status.parseFail": "Failed to parse the document — please try again",
          "progress.parsing": "Parsing document…",
          "progress.done": "Done",
          "copy.ok": "Agent URL copied to clipboard",
          "copy.okShort": "Agent URL copied",
          "copy.fail": "Copy failed — please copy manually",
          "copy.failShort": "Copy failed",
          "download.fail": "Download failed — please try again",
          "step.title": "Building your agent…",
          "step.s1": "Building knowledge base",
          "step.s2": "Generating profile",
          "step.s3": "Creating persona",
          "step.s4": "Loading agent template",
          "step.s5": "Assembling agent app",
        },
      },
      selectedDoc: null,
      // { name, size, rawFile, content }
      // 文件是否正在解析（true 时显示加载提示并禁用生成按钮）
      parsingFile: false,
      agentUrl: "",
      agentId: "",
      // Agent 名称与一句话描述（来自 roleProfile）
      agentName: "",
      agentIdentity: "",
      qrCodeDataUrl: "",
      downloadingAgent: false,
      statusMessage: "",
      // 消耗明细气泡浮窗的展开状态与朝向（下方空间不足时上翻）
      showUsage: false,
      popoverUp: false,
      pointsCost: 0,
      completion_tokens: 0,
      prompt_tokens: 0,
      statusType: "info",
      // 等待状态模拟进度
      progress: 0,
      progressText: "解析文档...",
      // generateProgressApp 是否已完成加载渲染（false 时显示加载等待提示）
      progressAppReady: false,
      // 拖拽悬停深度（用于高亮拖放区）
      dragDepth: 0,
      title: "Agent Creator",
      icon: "聊",
      introduce: "输入文档，生成相应的 Agent。",
      query: { documentId: "9fa4dfa60f9844cfe3d1d78a89b6028f" },
      defaultTemplate: "",
    };
  },
  computed: {
    dropzoneAriaLabel: function () {
      return this.selectedDoc
        ? this.t("drop.ariaSelected", { name: this.selectedDoc.name })
        : this.t("drop.ariaEmpty");
    },
    // 分享地址单一数据源：展示、复制链接、打开预览、二维码、下载网页均读取该值，保证完全一致
    shareUrl: function () {
      return (this.agentUrl || "").trim();
    },
  },
  watch: {
    // 地址变化时重新生成二维码，确保二维码始终与展示地址一致
    agentUrl: function (val) {
      if (val) {
        this.generateQrCode(this.shareUrl);
      } else {
        this.qrCodeDataUrl = "";
      }
    },
  },
  beforeUnmount: function () {
    document.removeEventListener("mousedown", this.handleGlobalClick);
    document.removeEventListener("keydown", this.handleGlobalKey);
    window.removeEventListener("resize", this.onWindowResize);
    window.removeEventListener("applangchange", this.onLangChange);
  },
  mounted: function () {
    // 与父页面 creator.html 的语言状态保持一致（默认中文）
    this.lang = window.__APP_LANG__ === "en" ? "en" : "zh";
    this.progressText = this.t("progress.parsing");
    window.addEventListener("applangchange", this.onLangChange);

    webCpu.mitt.on("generatePanelClosed", () => {
      this.resetState();
    });
    // 气泡浮窗：点击外部 / 按 ESC 关闭，窗口变化时重算朝向
    document.addEventListener("mousedown", this.handleGlobalClick);
    document.addEventListener("keydown", this.handleGlobalKey);
    window.addEventListener("resize", this.onWindowResize);
  },
  methods: {
    t: function (key, vars) {
      // 优先读取父页面 creator.html 注入的全局词表（单一数据源，含中英文），
      // 未注入时回退到组件内置 this.COPY，保证脱离 creator.html 也能独立渲染。
      var i18n = window.__I18N__ || {};
      var dict = i18n[this.lang] || this.COPY[this.lang] || this.COPY.zh;
      var str =
        dict[key] !== undefined
          ? dict[key]
          : this.COPY[this.lang] && this.COPY[this.lang][key] !== undefined
          ? this.COPY[this.lang][key]
          : this.COPY.zh[key] !== undefined
          ? this.COPY.zh[key]
          : key;
      if (vars) {
        Object.keys(vars).forEach(function (k) {
          str = str.replace(
            new RegExp("\\{" + k + "\\}", "g"),
            String(vars[k])
          );
        });
      }
      return str;
    },
    onLangChange: function (e) {
      this.lang = e && e.detail && e.detail.lang === "en" ? "en" : "zh";
      this.progressText = this.t("progress.parsing");
    },
    triggerFilePicker: function () {
      this.$refs.fileInput && this.$refs.fileInput.click();
    },
    handleFileChange: function (e) {
      const file = e.target.files && e.target.files[0];
      if (file) this.validateAndSelect(file);
      // 允许重复选择同一文件
      e.target.value = "";
    },
    handleDrop: function (e) {
      const file = e.dataTransfer && e.dataTransfer.files[0];
      if (file) this.validateAndSelect(file);
    },
    onDragEnter: function () {
      this.dragDepth += 1;
    },
    onDragLeave: function () {
      this.dragDepth = Math.max(0, this.dragDepth - 1);
    },
    onDrop: function (e) {
      this.dragDepth = 0;
      this.handleDrop(e);
    },
    validateAndSelect: async function (file) {
      const allowed = [".md", ".txt", ".pdf", ".docx", ".doc"];
      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      if (!allowed.includes(ext)) {
        this.setStatus(this.t("status.unsupported", { ext: ext }), "error");
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        this.setStatus(this.t("status.tooLarge"), "error");
        return;
      }

      this.parsingFile = true;
      this.setStatus(this.t("drop.parsing"), "info");

      const arr = file.name.split(".");
      const subfix = arr[arr.length - 1];

      try {
        let content = "";
        if (subfix !== "html" && subfix !== "txt" && subfix !== "md") {
          content = await WebTool.extractTextFromFile(file);
        } else {
          // 文本类文件：按 UTF-8 读取
          content = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
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
        this.setStatus(this.t("status.selected", { name: file.name }), "success");
      } catch (e) {
        this.setStatus(this.t("status.parseFail"), "error");
      } finally {
        this.parsingFile = false;
      }
    },
    formatSize: function (bytes) {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    },
    formatNumber: function (value) {
      const num = Number(value);
      if (!isFinite(num)) return "0";
      return num.toLocaleString("zh-CN");
    },
    toggleUsage: function () {
      this.showUsage = !this.showUsage;
      if (this.showUsage) {
        this.$nextTick(() => this.positionUsage());
      }
    },
    closeUsage: function () {
      this.showUsage = false;
    },
    positionUsage: function () {
      const pop = this.$refs.usagePopover;
      const wrap = this.$refs.usageWrap;
      if (!pop || !wrap) return;

      const popRect = pop.getBoundingClientRect();
      const wrapRect = wrap.getBoundingClientRect();
      const margin = 8;

      const fitsBelow = popRect.bottom <= window.innerHeight - margin;
      const roomAbove = wrapRect.top >= popRect.height + 10 + margin;

      // 下方放不下、且上方更宽裕时，改为向上弹出
      this.popoverUp = !fitsBelow && roomAbove;
    },
    onWindowResize: function () {
      if (this.showUsage) this.positionUsage();
    },
    handleGlobalClick: function (e) {
      if (!this.showUsage) return;
      const wrap = this.$refs.usageWrap;
      if (wrap && !wrap.contains(e.target)) this.showUsage = false;
    },
    handleGlobalKey: function (e) {
      if (e.key === "Escape" && this.showUsage) this.showUsage = false;
    },
    handleCreate: function () {
      if (!this.selectedDoc) {
        this.setStatus(this.t("status.needDoc"), "error");
        return;
      }
      this.step = "waiting";
      this.progressAppReady = false;
      this.setStatus("", "info");
      this.$nextTick(() => {
        this.startWaiting();
        aigcInterface.createAgentItem(this.selectedDoc.content, (params) => {
          this.finishCreating(params);
        }, ()=>{
          this.finishStepLoading();
          this.handleBack();
        });
      });
    },
    startWaiting: function () {
      this.startStepLoading();
    },
    finishCreating: async function (params) {
      this.agentId = params.documentId;
      this.agentUrl = params.agent;

      // 汇总两份 rawData 的用量（原写法受运算符优先级影响，`a || 0 + b || 0` 实为 `a || (0 + b) || 0`，无法真正求和）
      const usageA = params.rawData?.[0] || {};
      const usageB = params.rawData?.[1] || {};
      this.pointsCost = (usageA.pointsCost || 0) + (usageB.pointsCost || 0);
      this.completion_tokens =
        (usageA.completion_tokens || 0) + (usageB.completion_tokens || 0);
      this.prompt_tokens =
        (usageA.prompt_tokens || 0) + (usageB.prompt_tokens || 0);

      // 读取 Agent 名称与一句话描述
      const profile = params.roleProfile || {};
      this.agentName = profile.name || "";
      this.agentIdentity = profile.identity || "";

      this.progress = 100;
      this.progressText = this.t("progress.done");

      // 使用 jquery.qrcode 插件生成二维码（统一使用 shareUrl，与展示地址保持一致）
      this.generateQrCode(this.shareUrl);

      this.step = "result";
      this.$emit("created", {
        id: this.agentId,
        url: this.shareUrl,
      });
    },
    generateQrCode: function (text) {
      if (!text || typeof $ === "undefined" || !$.fn || !$.fn.qrcode) {
        this.qrCodeDataUrl = "";
        return;
      }
      try {
        // 渲染到离屏容器，随后从 canvas 提取 dataURL
        const offscreen = document.createElement("div");
        $(offscreen).qrcode({
          width: 256,
          height: 256,
          text: text,
          // 纠错级别，保证扫码成功率
          correctLevel: QRErrorCorrectLevel.M,
        });
        const canvas = offscreen.querySelector("canvas");
        this.qrCodeDataUrl = canvas ? canvas.toDataURL("image/png") : "";
      } catch (e) {
        this.qrCodeDataUrl = "";
      }
    },
    handleCopyUrl: function () {
      const url = this.shareUrl;
      if (!url) return;
      const done = () => {
        this.$message?.success
          ? this.$message.success(this.t("copy.ok"))
          : alert(this.t("copy.okShort"));
      };
      const fail = () => {
        this.$message?.error
          ? this.$message.error(this.t("copy.fail"))
          : alert(this.t("copy.failShort"));
      };
      // 优先使用 WebTool.copyString（兼容非安全上下文），其次 Clipboard API，最后 execCommand 兜底
      if (WebTool && typeof WebTool.copyString === "function") {
        try {
          WebTool.copyString(url);
          done();
          return;
        } catch (e) {}
      }
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        navigator.clipboard.writeText(url).then(done).catch(fail);
        return;
      }
      try {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.top = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, url.length);
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        ok ? done() : fail();
      } catch (e) {
        fail();
      }
    },
    handleDownloadQrCode: function () {
      if (!this.qrCodeDataUrl) return;
      const link = document.createElement("a");
      link.href = this.qrCodeDataUrl;
      link.download = `agent-qr-${this.agentId || "code"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    handleDownloadAgentPage: function () {
      if (!this.shareUrl || this.downloadingAgent) return;
      this.downloadingAgent = true;
      try {
        // 生成包裹 iframe 的独立网页文件，src 指向 Agent 访问地址
        const html = this.buildAgentPageHtml(this.shareUrl, this.agentName);
        const blob = new Blob([html], {
          type: "text/html;charset=utf-8",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `agent-${this.agentId || "page"}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      } catch (e) {
        this.$message?.error
          ? this.$message.error(this.t("download.fail"))
          : alert(this.t("download.fail"));
      } finally {
        this.downloadingAgent = false;
      }
    },
    buildAgentPageHtml: function (url, name) {
      const title = (name || "Agent")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      const safeUrl = (url || "").replace(/"/g, "&quot;");
      return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }
    .agent-frame { display: block; width: 100%; height: 100%; border: none; }
  </style>
</head>
<body>
  <iframe class="agent-frame" src="${safeUrl}" allow="clipboard-read; clipboard-write" allowfullscreen></iframe>
</body>
</html>`;
    },
    finishStepLoading: function (callback) {
      let app = webCpu.appConfig.generateProgressApp;
      if (app.card && app.card.task && app.card.task.vueItem) {
        app.card.task.vueItem.done(callback);
      }
    },
    startStepLoading: function () {
      let tData = {
        title: this.t("step.title"),
        expectedDuration: 60 * 1000,
        enabled: true,
        showPercentInline: true,
        steps: [
          this.t("step.s1"),
          this.t("step.s2"),
          this.t("step.s3"),
          this.t("step.s4"),
          this.t("step.s5"),
        ],
      };
      let stepData = {};
      stepData = webCpu.attachAttribute(stepData, tData);
      let elem = this.$refs.waitingStepArea;
      let app = webCpu.appConfig.generateProgressApp;
      app.cardName = "generateProgressPanelCard";
      app.dsl = app.dsl || {};
      app.dsl.data = app.dsl.data || {};
      app.dsl.data.content = stepData || {};
      webCpu.updateView(elem, app, () => {
        // generateProgressApp 加载渲染完成，隐藏加载等待提示
        this.progressAppReady = true;
      });
    },
    handleBack: function () {
      this.resetState();
      this.step = "init";
      this.$emit("back");
    },
    resetState: function () {
      this.agentUrl = "";
      this.step = "init";
      this.agentId = "";
      this.agentName = "";
      this.agentIdentity = "";
      this.qrCodeDataUrl = "";
      this.downloadingAgent = false;
      this.statusMessage = "";
      this.statusType = "info";
      this.showUsage = false;
      this.popoverUp = false;
      this.progressAppReady = false;
    },
    setStatus: function (msg, type = "info") {
      this.statusMessage = msg;
      this.statusType = type;
    },
  },
};
</script>

<style scoped>
/* ============================================================
     原研哉「白与空」设计系统（仅重写样式，未改动模板与交互逻辑）
     ------------------------------------------------------------
     类名沿用 apple* 以保持模板 / :class 绑定 / 编辑锚点不变，
     此处仅替换视觉语言：
     - 纸白 #fafafc / 墨色 #1a1a1e / 淡墨 #6e6e73 / 细线 #e7e7eb
     - 标题思源宋体 + 宽字距；正文 Inter / 无衬线
     - 直角特种纸卡片；主按钮墨色水滴微光；点击 1px 下沉
     ============================================================ */
.appleRoot {
  /* 色彩令牌 */
  --apple-bg: #fafafc;
  --apple-card: #ffffff;
  --apple-text: #1a1a1e;
  --apple-text-2: #6e6e73;
  --apple-text-3: #a5a5aa;

  --apple-blue: #1a1a1e; /* 主色：松烟墨 */
  --apple-blue-hover: #2b2b31;
  --apple-blue-active: #000000;
  --apple-blue-soft: rgba(26, 26, 30, 0.04);
  --apple-blue-ring: rgba(26, 26, 30, 0.16);

  --apple-green: #1a1a1e; /* 成功态收敛为墨色 */
  --apple-green-soft: #f3f3f5;
  --apple-red: #a0554a; /* 印章朱砂，仅用于错误 */
  --apple-red-soft: #f8f3f2;

  --apple-border: #d9d9de;
  --apple-separator: #e7e7eb;
  --apple-field: #f8f8fa;
  --apple-card-border: #ebebef; /* 卡片外框（设计稿 1px solid #EBEBEF） */
  --apple-border-strong: #9999a0; /* 交互悬停时更深的描边 */
  --apple-field-hover: #f4f4f6; /* 悬停 / 选中态的纸面 */
  --apple-line-soft: #c9c9cf; /* 链接下划线等软线条 */

  --apple-shadow-card: 0 20px 70px rgba(20, 20, 30, 0.055),
    0 2px 8px rgba(20, 20, 30, 0.025);
  --apple-shadow-hover: 0 10px 30px rgba(0, 0, 0, 0.13);

  /* 圆角：直角印刷感 */
  --radius-card: 0px;
  --radius-field: 0px;
  --radius-pill: 2px;
  --radius-icon: 0px;

  /* 动效 */
  --dur-fast: 0.2s;
  --dur-base: 0.3s;
  --ease-out: cubic-bezier(0.2, 0.7, 0.2, 1);

  /* 字体 */
  --font-apple: Inter, -apple-system, BlinkMacSystemFont, "Helvetica Neue",
    Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  --font-serif: "Source Han Serif SC", "Noto Serif SC", "Songti SC", "STSong",
    serif;
}

/* ============ 根容器 & 背景（纸白画布） ============ */
.appleRoot {
  position: relative;
  width: 100%;
  min-height: 100%;
  margin: 0 auto;
  padding: 20px 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  font-family: var(--font-apple);
  color: var(--apple-text);
  background-color: var(--apple-bg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 重磅特种纸卡片：如平铺于桌面的一张纸 */
.appleShell {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  background: var(--apple-card);
  border: 1px solid var(--apple-card-border);
  box-shadow: var(--apple-shadow-card);
  padding: 32px 38px 38px;
  box-sizing: border-box;
}

/* ============ 状态提示 ============ */
.appleNotice {
  flex: none;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: 1px solid var(--apple-separator);
  background: var(--apple-field);
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0.02em;
  color: var(--apple-text-2);
}

.appleNotice__icon {
  font-size: 15px;
  flex: none;
  color: var(--apple-text-2);
}

.appleNotice--success {
  color: var(--apple-text);
}
.appleNotice--success .appleNotice__icon {
  color: var(--apple-text);
}

.appleNotice--error {
  border-color: rgba(160, 85, 74, 0.22);
  background: var(--apple-red-soft);
  color: var(--apple-red);
}
.appleNotice--error .appleNotice__icon {
  color: var(--apple-red);
}

.appleNotice--info {
  color: var(--apple-text-2);
}

/* ============ 主内容区 ============ */
.appleBody {
  display: flex;
  flex-direction: column;
}

.appleStage {
  width: 100%;
  min-height: 560px; /* 三态内容区最小高度：内容少时上下居中，内容多时自然增高，顶部不被裁切 */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
  box-sizing: border-box;
}

/* ============ 卡片（内层容器：不再重复描边） ============ */
.appleCard {
  width: 100%;
}

.appleCard--result {
  width: 100%;
}

.appleCard__intro {
  margin-bottom: 26px;
}

.appleCard__intro--center {
  text-align: center;
}

/* 标题（宋体，宽字距） */
.appleTitle {
  margin: 0 0 10px;
  font-family: var(--font-serif);
  font-size: 28px;
  font-weight: 400;
  letter-spacing: 0.05em;
  line-height: 1.3;
  color: var(--apple-text);
}

.appleTitle--sm {
  font-size: 24px;
}

.appleSubtitle {
  margin: 0;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.9;
  letter-spacing: 0.02em;
  color: var(--apple-text-2);
}

/* ============ 文档选择区 ============ */
.appleField {
  margin-bottom: 26px;
}

.appleDropzone {
  position: relative;
  min-height: 250px;
  padding: 34px 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    rgba(245, 245, 248, 0.7),
    rgba(250, 250, 252, 0.4)
  );
  border: 1px dashed var(--apple-border);
  /* 微凹陷质感（设计稿：内阴影） */
  box-shadow: inset 0 1px 3px rgba(20, 20, 30, 0.03);
  cursor: pointer;
  text-align: center;
  transition: border-color 0.35s ease, background 0.35s ease,
    transform 0.35s ease, box-shadow 0.35s ease;
}

.appleDropzone:hover {
  border-color: var(--apple-border-strong);
  background: var(--apple-field-hover);
}

.appleDropzone--active {
  border-style: solid;
  border-color: var(--apple-border-strong);
  background: var(--apple-field-hover);
}

/* 点击按压：1px 下沉（触觉反馈） */
.appleDropzone:active {
  transform: translateY(1px);
}

/* 拖拽悬停：描边转实线并加深 */
.appleDropzone--dragging {
  border-style: solid;
  border-color: var(--apple-text-2);
  background: var(--apple-field-hover);
}

.appleDropzone:focus-visible {
  outline: 1px solid var(--apple-text);
  outline-offset: 3px;
}

/* 纸张图标（拟物折角 + 内文线） */
.appleDropzone__glyph {
  width: 44px;
  height: 56px;
  margin-bottom: 20px;
  border: 1px solid #cfcfd4;
  background: #ffffff;
  position: relative;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.035);
}

.appleDropzone__glyph::before {
  content: "";
  position: absolute;
  right: -1px;
  top: -1px;
  width: 14px;
  height: 14px;
  border-left: 1px solid #cfcfd4;
  border-bottom: 1px solid #cfcfd4;
  background: #f6f6f8;
}

.appleDropzone__glyph::after {
  content: "";
  position: absolute;
  left: 10px;
  right: 10px;
  top: 27px;
  height: 1px;
  background: #d7d7db;
  box-shadow: 0 6px #dedee2, 0 12px #e5e5e8;
}

.appleDropzone__glyph i {
  display: none;
}

.appleDropzone__empty,
.appleDropzone__file,
.appleDropzone__parsing {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.appleDropzone__action {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 18px;
  letter-spacing: 0.05em;
  color: var(--apple-text);
}

.appleDropzone__link {
  color: var(--apple-text);
  text-decoration: underline;
  text-underline-offset: 4px;
  text-decoration-color: var(--apple-line-soft);
  text-decoration-thickness: 1px;
}

.appleDropzone__hint {
  margin: 9px 0 0;
  font-size: 12px;
  letter-spacing: 0.02em;
  color: var(--apple-text-3);
}

.appleDropzone__row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 15px;
  color: var(--apple-text);
}

.appleDropzone__fileIcon {
  font-size: 18px;
  color: var(--apple-text-2);
}

.appleDropzone__name {
  font-weight: 500;
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.appleDropzone__size {
  font-size: 13px;
  color: var(--apple-text-3);
}

.appleHiddenInput {
  display: none;
}

/* ============ 按钮 ============ */
.appleBtn.el-button {
  border-radius: var(--radius-pill);
  font-family: var(--font-apple);
  font-weight: 500;
  letter-spacing: 0.1em;
  padding: 0 20px;
  height: 42px;
  font-size: 13px;
  line-height: 1;
  border-width: 1px;
  transition: background-color 0.3s ease, border-color 0.3s ease,
    color 0.3s ease, box-shadow 0.3s ease, transform 0.25s ease;
}

.appleBtn.el-button i {
  margin-right: 6px;
}

.appleBtn.el-button + .appleBtn.el-button {
  margin-left: 0;
}

/* 主按钮（墨色，水滴微光） */
.appleBtn--primary.el-button--primary {
  --el-button-bg-color: var(--apple-blue);
  --el-button-border-color: var(--apple-blue);
  --el-button-hover-bg-color: var(--apple-blue-hover);
  --el-button-hover-border-color: var(--apple-blue-hover);
  --el-button-active-bg-color: var(--apple-blue-active);
  --el-button-active-border-color: var(--apple-blue-active);
  --el-button-text-color: #ffffff;
  position: relative;
  overflow: hidden;
  height: 52px;
  letter-spacing: 0.14em;
}

.appleBtn--primary.el-button--primary::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 0;
  height: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.13);
  transform: translate(-50%, -50%);
  transition: width 0.7s ease, height 0.7s ease;
  pointer-events: none;
}

.appleBtn--primary.el-button--primary:hover::after {
  width: 420px;
  height: 420px;
}

.appleBtn--primary.el-button--primary:hover {
  background: var(--apple-blue-hover);
  border-color: var(--apple-blue-hover);
  color: #ffffff;
  box-shadow: var(--apple-shadow-hover);
}

.appleBtn--primary.el-button--primary:not(.is-disabled):active {
  background: var(--apple-blue-active);
  border-color: var(--apple-blue-active);
  transform: translateY(1px);
}

.appleBtn--primary.el-button--primary ::v-deep span {
  position: relative;
  z-index: 2;
}

.appleBtn--primary.el-button--primary.is-disabled,
.appleBtn--primary.el-button--primary.is-disabled:hover {
  background: var(--apple-blue);
  border-color: var(--apple-blue);
  color: #ffffff;
  opacity: 0.4;
  box-shadow: none;
}

/* 次级按钮（白底细线） */
.appleBtn--secondary.el-button {
  --el-button-bg-color: transparent;
  --el-button-border-color: var(--apple-border);
  --el-button-hover-bg-color: var(--apple-field);
  --el-button-hover-border-color: var(--apple-text-3);
  --el-button-active-bg-color: var(--apple-field);
  --el-button-active-border-color: var(--apple-text-3);
  --el-button-text-color: var(--apple-text);
  background: transparent;
  color: var(--apple-text);
  border-color: var(--apple-border);
  height: 40px;
}

.appleBtn--secondary.el-button:hover {
  background: var(--apple-field);
  border-color: var(--apple-text-3);
  color: var(--apple-text);
}

.appleBtn--secondary.el-button:not(.is-disabled):active {
  transform: translateY(1px);
}

/* 链接态按钮（墨色下划线） */
.appleBtn--link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 4px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-decoration: none;
  color: var(--apple-text);
  border-bottom: 1px solid var(--apple-line-soft);
  transition: border-color 0.3s ease, transform 0.2s ease;
}

.appleBtn--link i {
  margin-right: 6px;
}

.appleBtn--link:hover {
  color: var(--apple-text);
  border-color: var(--apple-text);
}

.appleBtn--link:active {
  transform: translateY(1px);
}

/* 块级按钮（居中） */
.appleBtn--block.el-button {
  width: min(330px, 100%);
  margin: 0 auto;
  display: flex;
  justify-content: center;
}

/* 信任计费微文案（按钮正下方，淡灰小字） */
.appleTrustNote {
  margin: 14px 0 0;
  text-align: center;
  font-size: 12px;
  letter-spacing: 0.02em;
  color: var(--apple-text-3);
}

/* ============ 等待状态 ============ */
.appleWait {
  position: relative;
  width: 100%;
  height: 450px;
}

/* generateProgressApp 挂载容器：铺满等待区，供进度面板以 100% 高度渲染 */
.appleWait__app {
  width: 100%;
  height: 100%;
}

/* 加载等待提示：generateProgressApp 加载渲染前与过程中覆盖显示 */
.appleWait__loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: var(--apple-card);
  z-index: 5;
}

/* 加载等待提示淡出过渡 */
.appleWaitFade-enter-active,
.appleWaitFade-leave-active {
  transition: opacity 0.25s var(--ease-out);
}
.appleWaitFade-enter,
.appleWaitFade-leave-to {
  opacity: 0;
}

.appleSpinner {
  width: 40px;
  height: 40px;
  margin-bottom: 24px;
  border-radius: 50%;
  border: 1px solid var(--apple-border);
  border-top-color: var(--apple-text);
  animation: appleSpin 1s linear infinite;
}

/* 小号 spinner：用于文档解析等内嵌加载态 */
.appleSpinner--sm {
  width: 32px;
  height: 32px;
  margin-bottom: 16px;
}

@keyframes appleSpin {
  to {
    transform: rotate(360deg);
  }
}

.appleWait__title {
  margin: 0 0 8px;
  font-family: var(--font-serif);
  font-size: 22px;
  font-weight: 400;
  letter-spacing: 0.04em;
  color: var(--apple-text);
}

.appleWait__desc {
  margin: 0 0 28px;
  font-size: 13px;
  line-height: 1.8;
  letter-spacing: 0.02em;
  color: var(--apple-text-2);
}

.appleProgress {
  width: 320px;
  max-width: 100%;
}

.appleProgress ::v-deep .el-progress-bar__outer {
  background-color: var(--apple-separator);
}

.appleProgress ::v-deep .el-progress-bar__inner {
  background-color: var(--apple-text) !important;
  transition: width 0.3s var(--ease-out);
}

.appleProgress__text {
  margin: 10px 0 0;
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--apple-text-3);
}

/* ============ 结果视图 ============ */
.appleBadge {
  width: 52px;
  height: 52px;
  margin: 0 auto 16px;
  background: var(--apple-text);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.appleBadge--success i {
  font-size: 26px;
}

.appleResult {
  display: flex;
  align-items: stretch;
  gap: 28px;
  margin: 32px 0;
  padding-top: 32px;
  border-top: 1px solid var(--apple-separator);
}

.appleResult__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.appleResult__side {
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.appleLabel {
  display: block;
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.14em;
  color: var(--apple-text-3);
  text-transform: uppercase;
}

.appleUrl {
  background: var(--apple-field);
  border: 1px solid var(--apple-separator);
  padding: 14px 16px;
  font-size: 13px;
  font-family: ui-monospace, "SF Mono", "Menlo", "Monaco", monospace;
  color: var(--apple-text);
  word-break: break-all;
  user-select: all;
  margin-bottom: 16px;
  min-height: 20px;
}

.appleBtnRow {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.appleBtnRow--footer {
  padding-top: 24px;
  border-top: 1px solid var(--apple-separator);
  justify-content: flex-end;
}

/* ============ 二维码 ============ */
.appleQr {
  width: 128px;
  height: 128px;
  border: 1px solid var(--apple-separator);
  padding: 8px;
  background: var(--apple-card);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.appleQr__img,
.appleQr__img img {
  width: 100%;
  height: 100%;
  display: block;
}

.appleQr__empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.appleQr__empty i {
  font-size: 20px;
  color: var(--apple-text-3);
}

.appleQr__hint {
  margin-top: 10px;
  font-size: 11px;
  letter-spacing: 0.02em;
  color: var(--apple-text-3);
}

/* ============ 消耗明细：点击唤起气泡浮窗 ============ */
.appleUsageWrap {
  position: relative;
  display: flex;
  justify-content: center;
  margin: 28px 0 0;
  padding-top: 22px;
  border-top: 1px solid var(--apple-separator);
}

/* 触发入口：低调的文字链接，hover 时墨色加深 */
.appleUsageTrigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 2px 3px;
  border: 0;
  border-bottom: 1px solid transparent;
  background: transparent;
  color: var(--apple-text-2);
  font-family: var(--font-apple);
  font-size: 12px;
  letter-spacing: 0.04em;
  line-height: 1;
  cursor: pointer;
  transition: color 0.3s ease, border-color 0.3s ease;
}

.appleUsageTrigger i {
  font-size: 14px;
  line-height: 1;
}

.appleUsageTrigger:hover {
  color: var(--apple-text);
  border-bottom-color: var(--apple-text-3);
}

.appleUsageTrigger:focus-visible {
  outline: 1px solid var(--apple-text);
  outline-offset: 3px;
}

/* 气泡浮窗：锚定于触发按钮下方，纸白卡片 + 指向箭头 */
.appleUsagePopover {
  position: absolute;
  z-index: 20;
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  width: 264px;
  max-width: calc(100vw - 24px);
  background: var(--apple-card);
  border: 1px solid var(--apple-separator);
  box-shadow: 0 18px 48px rgba(20, 20, 30, 0.14),
    0 2px 8px rgba(20, 20, 30, 0.06);
}

.appleUsagePopover::before {
  content: "";
  position: absolute;
  top: -6px;
  left: 50%;
  width: 12px;
  height: 12px;
  transform: translateX(-50%) rotate(45deg);
  background: var(--apple-card);
  border-left: 1px solid var(--apple-separator);
  border-top: 1px solid var(--apple-separator);
}

/* 下方空间不足时上翻：浮窗置于触发按钮上方，箭头指向下 */
.appleUsagePopover--up {
  top: auto;
  bottom: calc(100% + 10px);
}

.appleUsagePopover--up::before {
  top: auto;
  bottom: -6px;
  border-left: 0;
  border-top: 0;
  border-right: 1px solid var(--apple-separator);
  border-bottom: 1px solid var(--apple-separator);
}

.appleUsagePopover__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px 10px;
  border-bottom: 1px solid var(--apple-separator);
  font-size: 12px;
  letter-spacing: 0.08em;
  color: var(--apple-text);
}

.appleUsagePopover__close {
  position: relative;
  width: 20px;
  height: 20px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.appleUsagePopover__close span {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 1px;
  background: var(--apple-text-3);
  transition: background 0.3s ease;
}

.appleUsagePopover__close span:first-child {
  transform: translate(-50%, -50%) rotate(45deg);
}

.appleUsagePopover__close span:last-child {
  transform: translate(-50%, -50%) rotate(-45deg);
}

.appleUsagePopover__close:hover span {
  background: var(--apple-text);
}

.appleUsagePopover__close:focus-visible {
  outline: 1px solid var(--apple-text);
  outline-offset: 2px;
}

.appleUsagePopover__list {
  padding: 6px 0;
}

.appleUsagePopover__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 16px;
}

.appleUsagePopover__label {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--apple-text-2);
}

.appleUsagePopover__label small {
  font-size: 9px;
  letter-spacing: 0.16em;
  color: var(--apple-text-3);
}

/* 数值：宋体 + 等宽数字，多位数纵向对齐 */
.appleUsagePopover__value {
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 400;
  line-height: 1.2;
  color: var(--apple-text);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* 浮窗淡入淡出（叠加 translateX 保持居中不抖） */
.appleFade-enter-active,
.appleFade-leave-active {
  transition: opacity 0.2s var(--ease-out), transform 0.2s var(--ease-out);
}

.appleFade-enter,
.appleFade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-6px);
}

/* ============ 视图切换过渡（纸画轴舒展） ============ */
.appleStage {
  animation: appleStageIn 0.5s var(--ease-out);
}

@keyframes appleStageIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ============ 响应式 / 移动端适配 ============ */
@media (max-width: 640px) {
  .appleRoot {
    padding: 12px;
    -webkit-tap-highlight-color: transparent;
  }
  .appleShell {
    padding: 22px 18px 24px;
  }
  /* 移动端改为自然流式布局，取消桌面端的固定内容区高度 */
  .appleStage {
    height: auto; /* 覆盖桌面端固定 560px，避免结果态内容溢出重叠 */
    min-height: 0;
    padding: 0;
  }
  .appleTitle {
    font-size: 23px;
  }
  .appleTitle--sm {
    font-size: 21px;
  }
  .appleDropzone {
    min-height: 200px;
    padding: 26px 16px;
  }
  .appleDropzone__action {
    font-size: 16px;
  }
  .appleDropzone__row {
    flex-wrap: wrap;
    justify-content: center;
  }
  .appleDropzone__name {
    max-width: 180px;
  }
  /* 结果视图：上下堆叠，二维码居中并加分隔线 */
  .appleResult {
    flex-direction: column;
    gap: 24px;
    margin: 24px 0;
    padding-top: 24px;
  }
  .appleResult__side {
    width: 100%;
    padding-top: 24px;
    border-top: 1px solid var(--apple-separator);
  }
  .appleResult__main .appleBtnRow .appleBtn {
    flex: 1 1 auto;
    justify-content: center;
  }
  .appleBadge {
    width: 48px;
    height: 48px;
  }
  .appleQr {
    width: 136px;
    height: 136px;
  }
  /* 消耗明细入口：移动端上边距略收紧 */
  .appleUsageWrap {
    margin-top: 20px;
    padding-top: 18px;
  }
  .appleUsagePopover {
    width: 240px;
  }
  /* 底部操作按钮：纵向铺满，触控友好 */
  .appleBtnRow--footer {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  .appleBtnRow--footer .appleBtn {
    width: 100%;
    justify-content: center;
  }
}

/* ============ 无障碍 ============ */
.appleBtn:focus-visible {
  outline: 1px solid var(--apple-text);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .appleRoot *,
  .appleRoot *::before,
  .appleRoot *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  .appleSpinner {
    animation: none;
  }
}
</style>
