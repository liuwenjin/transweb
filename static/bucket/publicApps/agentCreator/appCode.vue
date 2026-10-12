<template>
  <!-- 主容器：严格锁定 100vh，隐藏外层所有溢出 -->
  <div class="agentCreatorRoot appleRoot" data-edit-id="1">
    <div class="appleShell" data-edit-id="72">
      <!-- 顶部 Header（Apple 风格顶栏） -->
      <header class="appleHeader" data-edit-id="2">
        <div class="appleHeader__left" data-edit-id="3">
          <span class="appleHeader__dot" data-edit-id="4"></span>
          <h3 class="appleHeader__title" data-edit-id="5">智能体创建面板</h3>
        </div>
        <span class="appleHeader__meta" data-edit-id="6">TransWeb Engine Integrated</span>
      </header>

      <!-- 1. 状态提示框（跨状态复用） -->
      <div v-if="statusMessage && step !== 'result'"
        class="appleNotice"
        :class="{
          'appleNotice--success': statusType === 'success',
          'appleNotice--error': statusType === 'error',
          'appleNotice--info': statusType === 'info',
        }"
        data-edit-id="7">
        <i :class="{
            'el-icon-circle-check': statusType === 'success',
            'el-icon-warning': statusType === 'error',
            'el-icon-info': statusType === 'info',
          }"
          class="appleNotice__icon"
          data-edit-id="8"></i>
        <span data-edit-id="9">{{ statusMessage }}</span>
      </div>

      <!-- 2. 主内容展示区（占用剩余所有空间） -->
      <main class="appleBody" data-edit-id="10">
        <!-- 视图 A：初始化状态 -->
        <div v-if="step === 'init'" class="appleStage" data-edit-id="11">
          <div class="appleCard" data-edit-id="12">
            <!-- 标题区 -->
            <div class="appleCard__intro" data-edit-id="13">
              <h2 class="appleTitle" data-edit-id="14">创建你的专属 Agent</h2>
              <p class="appleSubtitle" data-edit-id="15">
                上传一份文档，即刻生成可对话、可分发的智能体应用
              </p>
            </div>

            <!-- 文档选择区 -->
            <div class="appleField" data-edit-id="16">
              <div class="appleDropzone"
                :class="{ 'appleDropzone--active': !!selectedDoc }"
                @click="triggerFilePicker"
                @dragover.prevent
                @drop.prevent="handleDrop"
                data-edit-id="17">
                <div class="appleDropzone__glyph" data-edit-id="18">
                  <i class="el-icon-upload2" :class="selectedDoc ? 'is-active' : ''" data-edit-id="92"></i>
                </div>

                <div v-if="!selectedDoc" class="appleDropzone__empty" data-edit-id="19">
                  <p class="appleDropzone__action" data-edit-id="94">
                    <span class="appleDropzone__link" data-edit-id="20">点击选择文档</span>
                    或将文件拖拽到此处
                  </p>
                  <p class="appleDropzone__hint" data-edit-id="21">
                    支持 .md / .txt / .pdf / .docx，单个文件不超过 20MB
                  </p>
                </div>

                <div v-else class="appleDropzone__file" data-edit-id="22">
                  <div class="appleDropzone__row" data-edit-id="23">
                    <i class="el-icon-document appleDropzone__fileIcon" data-edit-id="24"></i>
                    <span class="appleDropzone__name" data-edit-id="25">{{ selectedDoc.name }}</span>
                    <span class="appleDropzone__size" data-edit-id="26">
                      ({{ formatSize(selectedDoc.size) }})
                    </span>
                  </div>
                  <p class="appleDropzone__hint" data-edit-id="27">点击可重新选择文档</p>
                </div>
              </div>

              <!-- 隐藏的原生文件输入 -->
              <input ref="fileInput"
                type="file"
                class="appleHiddenInput"
                accept=".md,.txt,.pdf,.docx"
                @change="handleFileChange"
                data-edit-id="28" />
            </div>

            <!-- 确认创建按钮 -->
            <el-button type="primary"
              class="appleBtn appleBtn--primary appleBtn--block"
              :disabled="!selectedDoc"
              @click="handleCreate"
              data-edit-id="29">
              <i class="el-icon-magic-stick" data-edit-id="30"></i>
              确认创建
            </el-button>
          </div>
        </div>

        <!-- 视图 B：等待状态 -->
        <div v-else-if="step === 'waiting'" class="appleStage" data-edit-id="31">
          <div class="appleWait" ref="waitingStepArea" data-edit-id="32">
            <div class="appleSpinner" data-edit-id="33"></div>
            <h3 class="appleWait__title" data-edit-id="35">Agent 正在创建中</h3>
            <p class="appleWait__desc" data-edit-id="36">
              正在解析文档并生成智能体，请稍候，完成后将自动展示结果…
            </p>

            <!-- 进度提示条 -->
            <div class="appleProgress" data-edit-id="37">
              <el-progress :percentage="progress"
                :stroke-width="4"
                :show-text="false"
                color="#1A1A1E"
                data-edit-id="38"></el-progress>
              <p class="appleProgress__text" data-edit-id="39">{{ progressText }}</p>
            </div>
          </div>
        </div>

        <!-- 视图 C：结果显示 -->
        <div v-else class="appleStage" data-edit-id="40">
          <div class="appleCard appleCard--result" data-edit-id="41">
            <!-- 成功标识 + Agent 名称 / 一句话描述 -->
            <div class="appleCard__intro appleCard__intro--center" data-edit-id="42">
              <div class="appleBadge appleBadge--success" data-edit-id="43">
                <i class="el-icon-check" data-edit-id="44"></i>
              </div>
              <h2 class="appleTitle appleTitle--sm" data-edit-id="45">
                {{ agentName || 'Agent 创建成功' }}
              </h2>
              <p class="appleSubtitle" data-edit-id="46">
                {{ agentIdentity || '智能体已就绪，可通过以下方式访问与分发' }}
              </p>
            </div>

            <!-- URL + 二维码 双栏 -->
            <div class="appleResult" data-edit-id="47">
              <!-- 左：URL 展示与操作 -->
              <div class="appleResult__main" data-edit-id="48">
                <span class="appleLabel" data-edit-id="49">Agent 访问地址</span>
                <div class="appleUrl" data-edit-id="50">{{ agentUrl }}</div>

                <div class="appleBtnRow" data-edit-id="51">
                  <el-button class="appleBtn appleBtn--secondary" @click="handleCopyUrl" data-edit-id="52">
                    <i class="el-icon-document-copy" data-edit-id="53"></i> 复制链接
                  </el-button>
                  <a :href="agentUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="appleBtn appleBtn--link"
                    data-edit-id="54">
                    <i class="el-icon-top-right" data-edit-id="55"></i> 打开预览
                  </a>
                </div>
              </div>

              <!-- 右：二维码 -->
              <div class="appleResult__side" data-edit-id="56">
                <span class="appleLabel" data-edit-id="57">扫码访问</span>
                <div class="appleQr" data-edit-id="58">
                  <div v-if="qrCodeDataUrl" class="appleQr__img" data-edit-id="59">
                    <img :src="qrCodeDataUrl" alt="Agent QR Code" data-edit-id="60" />
                  </div>
                  <div v-else class="appleQr__empty" data-edit-id="61">
                    <i class="el-icon-loading" data-edit-id="62"></i>
                  </div>
                </div>
                <span class="appleQr__hint" data-edit-id="63">手机扫码即可体验</span>
              </div>
            </div>

            <!-- 底部操作 -->
            <div class="appleBtnRow appleBtnRow--footer" data-edit-id="64">
              <el-button class="appleBtn appleBtn--secondary"
                :disabled="!qrCodeDataUrl"
                @click="handleDownloadQrCode"
                data-edit-id="65">
                <i class="el-icon-picture-outline" data-edit-id="66"></i> 下载二维码
              </el-button>
              <el-button class="appleBtn appleBtn--secondary"
                :loading="downloadingAgent"
                @click="handleDownloadAgentPage"
                data-edit-id="67">
                <i class="el-icon-download" data-edit-id="68"></i> 下载 Agent 网页
              </el-button>
              <el-button type="primary" class="appleBtn appleBtn--primary" @click="handleBack" data-edit-id="69">
                <i class="el-icon-refresh-left" data-edit-id="70"></i> 返回重新创建
              </el-button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>export default 
          {"name":"AgentCreator","data":function(
) {
return {
      // 流程状态机：init -> waiting -> result
        step: "init",
      selectedDoc: null,
      // { name, size, rawFile, content }
        agentUrl: "",
      agentId: "",
      // Agent 名称与一句话描述（来自 roleProfile）
        agentName: "",
      agentIdentity: "",
      qrCodeDataUrl: "",
      downloadingAgent: false,
      statusMessage: "",
      statusType: "info",
      // 等待状态模拟进度
        progress: 0,
      progressText: "解析文档...",
      timer: null,
      title: "Agent Creator",
      icon: "聊",
      introduce: "输入文档，生成相应的 Agent。",
      query: {"documentId":"43a17486f2615e82298996fe246eb9da"},
      defaultTemplate: ""
    };
},"beforeDestroy":function() {
      this.clearTimer();
    },"mounted":function() {
      webCpu.mitt.on("generatePanelClosed", () => {
        this.resetState();
      });
    },"methods":{"triggerFilePicker":function() {
        this.$refs.fileInput && this.$refs.fileInput.click();
      },"handleFileChange":function(e) {
        const file = e.target.files && e.target.files[0];
        if (file) this.validateAndSelect(file);
        // 允许重复选择同一文件
        e.target.value = "";
      },"handleDrop":function(e) {
        const file = e.dataTransfer && e.dataTransfer.files[0];
        if (file) this.validateAndSelect(file);
      },"validateAndSelect":async function(file) {
        const allowed = [".md", ".txt", ".pdf", ".docx", ".doc"];
        const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
        if (!allowed.includes(ext)) {
          this.setStatus(`不支持的文件类型：${ext}`, "error");
          return;
        }
        if (file.size > 20 * 1024 * 1024) {
          this.setStatus("文件超过 20MB 大小限制", "error");
          return;
        }

        this.setStatus(`已选择文档：${file.name}`, "success");
        let arr = file.name.split(".");
        let subfix = arr[arr.length - 1];

        let content = "";
        if (subfix !== "html" && subfix !== "text" && subfix !== "md") {
          content = await WebTool.extractTextFromFile(file);
          this.selectedDoc = {
            name: file.name,
            size: file.size,
            rawFile: file,
            content: content
          };
        } else {
          const reader = new FileReader();
          // 读取为文本
          reader.onload = (e) => {
            let text = e.target.result;
            content = WebTool.extractAppTaskData(text);
            this.selectedDoc = {
              name: file.name,
              size: file.size,
              rawFile: file,
              content: content
            };
          }
          // ⚠️ 关键：按文本读取
          reader.readAsText(file, "utf-8");
        }
      },"formatSize":function(bytes) {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
      },"handleCreate":function() {
        if (!this.selectedDoc) {
          this.setStatus("请先选择一份文档", "error");
          return;
        }
        this.step = "waiting";
        this.setStatus("", "info");
        this.$nextTick(() => {
          this.startWaiting();
          aigcInterface.createAgentItem(this.selectedDoc.content, (params) => {
            this.finishCreating(params)
          });
        });
      },"startWaiting":function() {
        this.startStepLoading();
      },"finishCreating":async function(params) {
        this.agentId = params.documentId;
        this.agentUrl = params.agent;

        // 读取 Agent 名称与一句话描述
        const profile = params.roleProfile || {};
        this.agentName = profile.name || "";
        this.agentIdentity = profile.identity || "";

        this.progress = 100;
        this.progressText = "创建完成";

        // 使用 jquery.qrcode 插件生成二维码
        this.generateQrCode(this.agentUrl);

        this.step = "result";
        this.$emit("created", {
          id: this.agentId,
          url: this.agentUrl
        });
      },"generateQrCode":function(text) {
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
            correctLevel: QRErrorCorrectLevel.M
          });
          const canvas = offscreen.querySelector("canvas");
          this.qrCodeDataUrl = canvas ? canvas.toDataURL("image/png") : "";
        } catch (e) {
          this.qrCodeDataUrl = "";
        }
      },"handleCopyUrl":async function() {
        if (!this.agentUrl) return;
        try {
          await navigator.clipboard.writeText(this.agentUrl);
          this.$message?.success ?
            this.$message.success("Agent URL 已成功复制到剪贴板") :
            alert("Agent URL 已复制");
        } catch (e) {
          this.$message?.error ?
            this.$message.error("复制失败，请手动选择复制") :
            alert("复制失败");
        }
      },"handleDownloadQrCode":function() {
        if (!this.qrCodeDataUrl) return;
        const link = document.createElement("a");
        link.href = this.qrCodeDataUrl;
        link.download = `agent-qr-${this.agentId || "code"}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },"handleDownloadAgentPage":function() {
        if (!this.agentUrl || this.downloadingAgent) return;
        this.downloadingAgent = true;
        try {
          // 生成包裹 iframe 的独立网页文件，src 指向 Agent 访问地址
          const html = this.buildAgentPageHtml(this.agentUrl, this.agentName);
          const blob = new Blob([html], {
            type: "text/html;charset=utf-8"
          });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `agent-${this.agentId || "page"}.html`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
        } catch (e) {
          this.$message?.error ?
            this.$message.error("下载失败，请重试") :
            alert("下载失败，请重试");
        } finally {
          this.downloadingAgent = false;
        }
      },"buildAgentPageHtml":function(url, name) {
        const title = (name || "Agent").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
      },"finishStepLoading":function(callback) {
        let app = webCpu.appConfig.generateProgressApp;
        if (app.card && app.card.task && app.card.task.vueItem) {
          app.card.task.vueItem.done(callback);
        }
      },"startStepLoading":function() {
        let tData = {
          title: `正在构建你的Agent…`,
          expectedDuration: 60 * 1000,
          enabled: true,
          showPercentInline: true,
          steps: ["构建知识库", "生成基础信息", "生成人设信息", "加载Agent模板", "合成Agent应用"],
        };
        let stepData = {};
        stepData = webCpu.attachAttribute(stepData, tData);
        let elem = this.$refs.waitingStepArea;
        let app = webCpu.appConfig.generateProgressApp;
        app.cardName = "generateProgressPanelCard";
        app.dsl = app.dsl || {};
        app.dsl.data = app.dsl.data || {};
        app.dsl.data.content = stepData || {};
        webCpu.updateView(elem, app);
      },"handleBack":function() {
        this.resetState();
        this.step = "init";
        this.$emit("back");
      },"resetState":function() {
        this.agentUrl = "";
        this.step = "init";
        this.agentId = "";
        this.agentName = "";
        this.agentIdentity = "";
        this.qrCodeDataUrl = "";
        this.downloadingAgent = false;
        this.statusMessage = "";
        this.statusType = "info";
      },"setStatus":function(msg, type = "info") {
        this.statusMessage = msg;
        this.statusType = type;
      }}};</script>

<style scoped>
  /* ============================================================
   白与空 DESIGN SYSTEM — 原研哉「白 · 空 · RE-DESIGN」
   ------------------------------------------------------------
   色彩矩阵：
   - 松烟墨 #1A1A1E  /  淡墨灰 #6e6e73  /  三级灰 #86868b
   - 主按钮·墨色 #1A1A1E  /  悬停 #2E2E33  /  按压 #0E0E11
   - 纸白背景 #FAFAFC  /  卡片白 #ffffff
   - 极细线条 #EBEBEF  /  微光 rgba(230,232,236,0.6)
   - 状态绿 #34c759  /  状态红 #ff3b30
   字体：思源宋体 / 宋体前置，标题 letter-spacing 放宽至 0.04em
   ============================================================ */
  .appleRoot {
    /* 色彩令牌 */
    --apple-bg: #FAFAFC;
    --apple-card: #ffffff;
    --apple-text: #1A1A1E;
    --apple-text-2: #6e6e73;
    --apple-text-3: #86868b;

    --apple-blue: #1A1A1E;
    --apple-blue-hover: #2E2E33;
    --apple-blue-active: #0E0E11;
    --apple-blue-soft: rgba(26, 26, 30, 0.08);
    --apple-blue-ring: rgba(26, 26, 30, 0.28);

    --apple-green: #34c759;
    --apple-green-soft: rgba(52, 199, 89, 0.12);
    --apple-red: #ff3b30;
    --apple-red-soft: rgba(255, 59, 48, 0.1);

    --apple-border: #EBEBEF;
    --apple-separator: rgba(0, 0, 0, 0.08);
    --apple-field: #FAFAFC;

    --apple-shadow-card: 0 1px 2px rgba(0, 0, 0, 0.03),
      0 12px 32px rgba(0, 0, 0, 0.06);
    --apple-shadow-hover: 0 2px 4px rgba(0, 0, 0, 0.04),
      0 20px 48px rgba(0, 0, 0, 0.1);

    /* 圆角 */
    --radius-card: 18px;
    --radius-field: 12px;
    --radius-pill: 980px;
    --radius-icon: 12px;

    /* 动效 */
    --dur-fast: 0.2s;
    --dur-base: 0.28s;
    --ease-out: cubic-bezier(0.22, 1, 0.36, 1);

    /* 字体 */
    --font-apple: "Source Han Serif SC", "Songti SC", "Noto Serif SC",
      "SimSun", -apple-system, BlinkMacSystemFont, "SF Pro Display",
      "SF Pro Text", "Helvetica Neue", "Helvetica", "PingFang SC",
      "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
  }

  .appleRoot[data-theme="dark"] {
    --apple-bg: #000000;
    --apple-card: #1A1A1E;
    --apple-text: #FAFAFC;
    --apple-text-2: #a1a1a6;
    --apple-text-3: #86868b;
    --apple-border: #424245;
    --apple-separator: rgba(255, 255, 255, 0.12);
    --apple-field: #1c1c1e;
    --apple-blue: #E6E8EC;
    --apple-blue-hover: #F3F3F5;
    --apple-blue-active: #C7CAD0;
    --apple-blue-soft: rgba(230, 232, 236, 0.16);
    --apple-blue-ring: rgba(230, 232, 236, 0.36);
    --apple-green: #30d158;
    --apple-green-soft: rgba(48, 209, 88, 0.16);
    --apple-red: #ff453a;
    --apple-red-soft: rgba(255, 69, 58, 0.16);
    --apple-shadow-card: 0 1px 2px rgba(0, 0, 0, 0.6),
      0 12px 32px rgba(0, 0, 0, 0.5);
    --apple-shadow-hover: 0 2px 4px rgba(0, 0, 0, 0.65),
      0 20px 48px rgba(0, 0, 0, 0.6);
  }

  /* ============ 根容器 & 背景（Apple 冰川灰） ============ */
  .appleRoot {
    position: relative;
    width: 100%;
    height: 100%;
    margin: 0 auto;
    padding: 20px 24px;
    box-sizing: border-box;
    font-family: var(--font-apple);
    color: var(--apple-text);
    background-color: var(--apple-bg);
    background-image: radial-gradient(
        ellipse 70% 55% at 12% -6%,
        rgba(26, 26, 30, 0.05) 0%,
        transparent 55%
      ),
      radial-gradient(ellipse 55% 45% at 100% 104%, rgba(26, 26, 30, 0.04) 0%, transparent 55%);
    background-repeat: no-repeat;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow: hidden;
  }

  .appleShell {
    width: 100%;
    height: 100%;
    margin: 0 auto;
    max-width: 720px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* ============ 顶栏（Apple 全局导航质感） ============ */
  .appleHeader {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--apple-separator);
  }

  .appleHeader__left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .appleHeader__dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--apple-blue);
    box-shadow: 0 0 0 3px var(--apple-blue-soft);
  }

  .appleHeader__title {
    margin: 0;
    font-size: 15px;
    font-weight: 500;
    letter-spacing: 0.04em;
    color: var(--apple-text);
  }

  .appleHeader__meta {
    font-size: 11px;
    font-weight: 400;
    letter-spacing: 0.01em;
    color: var(--apple-text-3);
  }

  /* ============ 状态提示 ============ */
  .appleNotice {
    flex: none;
    margin-top: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: var(--radius-field);
    font-size: 13px;
    font-weight: 400;
    line-height: 1.4;
    color: var(--apple-text);
    transition: opacity var(--dur-base) var(--ease-out),
      transform var(--dur-base) var(--ease-out);
  }

  .appleNotice__icon {
    font-size: 16px;
    flex: none;
  }

  .appleNotice--success {
    background: var(--apple-green-soft);
  }
  .appleNotice--success .appleNotice__icon {
    color: var(--apple-green);
  }

  .appleNotice--error {
    background: var(--apple-red-soft);
  }
  .appleNotice--error .appleNotice__icon {
    color: var(--apple-red);
  }

  .appleNotice--info {
    background: var(--apple-blue-soft);
  }
  .appleNotice--info .appleNotice__icon {
    color: var(--apple-blue);
  }

  /* ============ 主内容区 ============ */
  .appleBody {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .appleStage {
    flex: 1;
    min-height: 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow-y: auto;
    padding: 16px 0;
  }

  /* ============ 卡片 ============ */
  .appleCard {
    width: 100%;
    background: var(--apple-card);
    border-radius: var(--radius-card);
    box-shadow: var(--apple-shadow-card);
    padding: 40px 44px;
    box-sizing: border-box;
  }

  .appleCard--result {
    max-width: 620px;
  }

  .appleCard__intro {
    margin-bottom: 28px;
  }

  .appleCard__intro--center {
    text-align: center;
  }

  /* 标题（Apple 大标题质感：600 权重 + 负字距） */
  .appleTitle {
    margin: 0 0 8px;
    font-size: 30px;
    font-weight: 500;
    letter-spacing: 0.04em;
    line-height: 1.1;
    color: var(--apple-text);
  }

  .appleTitle--sm {
    font-size: 24px;
    letter-spacing: 0.04em;
  }

  .appleSubtitle {
    margin: 0;
    font-size: 15px;
    font-weight: 400;
    line-height: 1.45;
    color: var(--apple-text-2);
  }

  /* ============ 文档选择区 ============ */
  .appleField {
    margin-bottom: 24px;
  }

  .appleDropzone {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 168px;
    padding: 28px 24px;
    box-sizing: border-box;
    background: var(--apple-field);
    border: 1px dashed var(--apple-border);
    border-radius: var(--radius-field);
    cursor: pointer;
    text-align: center;
    transition: border-color var(--dur-fast) var(--ease-out),
      background-color var(--dur-fast) var(--ease-out),
      box-shadow var(--dur-fast) var(--ease-out);
  }

  .appleDropzone:hover {
    border-color: var(--apple-blue);
    background: var(--apple-blue-soft);
  }

  .appleDropzone--active {
    border-style: solid;
    border-color: var(--apple-blue);
    background: var(--apple-blue-soft);
  }

  .appleDropzone__glyph {
    width: 48px;
    height: 48px;
    margin-bottom: 14px;
    border-radius: var(--radius-icon);
    background: var(--apple-card);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .appleDropzone__glyph i {
    font-size: 24px;
    color: var(--apple-text-2);
    transition: color var(--dur-fast) var(--ease-out);
  }

  .appleDropzone__glyph i.is-active {
    color: var(--apple-blue);
  }

  .appleDropzone__empty,
  .appleDropzone__file {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .appleDropzone__action {
    margin: 0;
    font-size: 15px;
    font-weight: 400;
    color: var(--apple-text);
  }

  .appleDropzone__link {
    color: var(--apple-blue);
    font-weight: 500;
    text-decoration: none;
  }

  .appleDropzone__hint {
    margin: 8px 0 0;
    font-size: 12px;
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
    color: var(--apple-blue);
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

  /* ============ 按钮（Apple 胶囊按钮） ============ */
  .appleBtn.el-button {
    border-radius: var(--radius-pill);
    font-family: var(--font-apple);
    font-weight: 500;
    letter-spacing: 0;
    padding: 10px 22px;
    height: auto;
    font-size: 15px;
    line-height: 1.2;
    border-width: 1px;
    transition: background-color var(--dur-fast) var(--ease-out),
      border-color var(--dur-fast) var(--ease-out),
      color var(--dur-fast) var(--ease-out),
      box-shadow var(--dur-fast) var(--ease-out);
  }

  .appleBtn.el-button i {
    margin-right: 6px;
  }

  .appleBtn.el-button + .appleBtn.el-button {
    margin-left: 0;
  }

  /* 主按钮（Apple 蓝） */
  .appleBtn--primary.el-button--primary {
    --el-button-bg-color: var(--apple-blue);
    --el-button-border-color: var(--apple-blue);
    --el-button-hover-bg-color: var(--apple-blue-hover);
    --el-button-hover-border-color: var(--apple-blue-hover);
    --el-button-active-bg-color: var(--apple-blue-active);
    --el-button-active-border-color: var(--apple-blue-active);
    --el-button-text-color: #ffffff;
  }

  .appleBtn--primary.el-button--primary:hover {
    background: var(--apple-blue-hover);
    border-color: var(--apple-blue-hover);
    color: #ffffff;
  }

  .appleBtn--primary.el-button--primary:not(.is-disabled):active {
    background: var(--apple-blue-active);
    border-color: var(--apple-blue-active);
  }

  .appleBtn--primary.el-button--primary.is-disabled,
  .appleBtn--primary.el-button--primary.is-disabled:hover {
    background: var(--apple-blue);
    border-color: var(--apple-blue);
    color: #ffffff;
    opacity: 0.4;
  }

  /* 次级按钮（白底灰边） */
  .appleBtn--secondary.el-button {
    --el-button-bg-color: var(--apple-card);
    --el-button-border-color: var(--apple-border);
    --el-button-hover-bg-color: var(--apple-field);
    --el-button-hover-border-color: var(--apple-text-3);
    --el-button-active-bg-color: var(--apple-field);
    --el-button-active-border-color: var(--apple-text-3);
    --el-button-text-color: var(--apple-text);
    background: var(--apple-card);
    color: var(--apple-text);
    border-color: var(--apple-border);
  }

  .appleBtn--secondary.el-button:hover {
    background: var(--apple-field);
    border-color: var(--apple-text-3);
    color: var(--apple-text);
  }

  /* 链接态按钮（蓝字、Apple "了解更多" 质感） */
  .appleBtn--link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 20px;
    border-radius: var(--radius-pill);
    font-size: 15px;
    font-weight: 500;
    text-decoration: none;
    color: var(--apple-blue);
    transition: background-color var(--dur-fast) var(--ease-out);
  }

  .appleBtn--link i {
    margin-right: 6px;
  }

  .appleBtn--link:hover {
    background: var(--apple-blue-soft);
    color: var(--apple-blue);
  }

  /* 块级按钮 */
  .appleBtn--block.el-button {
    width: 100%;
    padding-top: 13px;
    padding-bottom: 13px;
  }

  /* ============ 等待状态 ============ */
  .appleWait {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    width: 560px;
    max-width: 100%;
    height: 100%;
  }

  .appleSpinner {
    width: 44px;
    height: 44px;
    margin-bottom: 24px;
    border-radius: 50%;
    border: 2px solid var(--apple-separator);
    border-top-color: var(--apple-blue);
    animation: appleSpin 0.8s linear infinite;
  }

  @keyframes appleSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .appleWait__title {
    margin: 0 0 8px;
    font-size: 20px;
    font-weight: 500;
    letter-spacing: 0.04em;
    color: var(--apple-text);
  }

  .appleWait__desc {
    margin: 0 0 28px;
    font-size: 14px;
    line-height: 1.5;
    color: var(--apple-text-2);
  }

  .appleProgress {
    width: 288px;
    max-width: 100%;
  }

  .appleProgress ::v-deep .el-progress-bar__outer {
    background-color: var(--apple-separator);
  }

  .appleProgress ::v-deep .el-progress-bar__inner {
    transition: width 0.3s var(--ease-out);
  }

  .appleProgress__text {
    margin: 10px 0 0;
    font-size: 12px;
    color: var(--apple-text-3);
  }

  /* ============ 结果视图 ============ */
  .appleBadge {
    width: 56px;
    height: 56px;
    margin: 0 auto 16px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .appleBadge--success {
    background: var(--apple-green);
    color: #ffffff;
  }

  .appleBadge--success i {
    font-size: 28px;
  }

  .appleResult {
    display: flex;
    align-items: stretch;
    gap: 28px;
    margin-bottom: 28px;
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
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0;
    color: var(--apple-text-2);
  }

  .appleUrl {
    background: var(--apple-field);
    border: 1px solid var(--apple-separator);
    border-radius: var(--radius-field);
    padding: 12px 14px;
    font-size: 13px;
    font-family: "SF Mono", ui-monospace, "Menlo", "Monaco", monospace;
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
    border: 1px solid var(--apple-border);
    border-radius: var(--radius-field);
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
    font-size: 22px;
    color: var(--apple-text-3);
  }

  .appleQr__hint {
    margin-top: 10px;
    font-size: 11px;
    color: var(--apple-text-3);
  }

  /* ============ 全局滚动锁 ============ */
  :global(html),
  :global(body) {
    margin: 0;
    padding: 0;
    height: 100%;
    overflow: hidden !important;
  }

  /* 响应式 */
  @media (max-width: 640px) {
    .appleRoot {
      padding: 16px;
    }
    .appleCard {
      padding: 28px 24px;
    }
    .appleTitle {
      font-size: 26px;
    }
    .appleResult {
      flex-direction: column;
    }
    .appleBtnRow--footer {
      justify-content: center;
    }
  }
</style>
