<template data-edit-id="1">
  <div class="tw-min-h-screen tw-bg-app tw-text-body" data-edit-id="2">
    <div
      class="tw-mx-auto tw-px-3 md:tw-px-4 tw-py-8 md:tw-py-10 main-app-area"
      data-edit-id="3"
    >
      <!-- 顶部说明 -->
      <div class="tw-mb-6" data-edit-id="4">
        <div class="tw-text-xs tw-text-muted" data-edit-id="5">
          AppItem · 内容质量保障器 · Step 1 / 5
        </div>
      </div>
      <!-- 输入区 -->
      <div
        class="tw-bg-card tw-border-default tw-radius-card tw-shadow-card tw-p-4 tw-mb-8"
        data-edit-id="7"
      >
        <div class="tw-text-sm tw-font-bold tw-mb-2" data-edit-id="8">
          内容需求分析结果
        </div>
        <el-input
          v-model="content.inputText"
          type="textarea"
          :rows="5"
          placeholder="输入内容需求分析结果"
          data-edit-id="9"
        />
        <div class="tw-flex tw-justify-end tw-mt-3" data-edit-id="10">
          <el-button
            type="primary"
            :loading="isGenerating"
            @click="handleGenerate"
            data-edit-id="11"
          >
            {{ isGenerating ? "正在生成" : "开始分析" }}
          </el-button>
        </div>
      </div>

      <!-- 结果区 -->
      <div
        v-if="accountData.content"
        class="tw-flex tw-flex-col tw-gap-8"
        data-edit-id="12"
        v-html="accountData.content"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "IntentSpecFromExperienceAppItem",
  data: function () {
    return {
      content: {
        inputText: "",
        outputText: "",
      },
      defaultTemplate: "-",
      isGenerating: false,
      jsonDialogVisible: false,
      accountData: {
        content: "",
      },
      spec: {
        appGoal: "",
        successOutput: "",
        aiInputs: [],
        aiOutput: "",
        constraints: [],
      },
      query: {
        apiName: "深度求索",
        model: "deepseek-v4-flash",
        documentId: "f72b1f4bc40a26159c6621da394b68a6",
      },
      title: "内容质量",
      icon: "#",
      introduce: "应用生成步骤：润色页面文案",
    };
  },
  methods: {
    handleGenerate: function () {
      if (!this.content.inputText.trim()) return;
      this.isGenerating = true;
      this.query.documentId = WebTool.urlQuery(location.href, "id");
      let query = {
        context: this.content.inputText,
        documentId: this.query.documentId,
      };
      aigcRequest(
        query,
        (res) => {
          this.isGenerating = false;
          try {
            this.content.outputText = res?.usage?.result;
            debugger;
            this.accountData.content = WebTool.transMarkdown(
              this.content.outputText
            );
          } catch (e) {
            this.count = this.count || 1;
            if (this.count < 5) {
              this.count++;
              this.handleGenerate();
              console.log(`生成失败， 第${this.count}次重试...`);
            } else {
              console.log("5 次生成内容结构有误");
            }
          }
        },
        () => {
          this.isGenerating = false;
        }
      );
    },
  },
};
</script>

<style scoped>
/* ===== TransWeb · 白与空 设计令牌（对齐 static/index.html） =====
   色板：paper #fafafc / card #f3f3f5 / white #fff
         ink #1a1a1e / gray #6e6e73 / light #a5a5aa / line #e7e7eb
   字体：标题思源宋体(serif, 字重400) / 正文 Inter(sans)
   语言：1px 细线、三级灰阶、克制圆角、柔和阴影、慢速过渡
================================================================= */

.tw-bg-app {
  background: #fafafc;
  color: #1a1a1e;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.tw-bg-card {
  background: #ffffff;
}

.tw-border-default {
  border: 1px solid #ebebef;
}

/* 柔和双层阴影，如一张微微浮起的纸 */
.tw-shadow-card {
  box-shadow:
    0 20px 70px rgba(20, 20, 30, 0.055),
    0 2px 8px rgba(20, 20, 30, 0.025);
}

/* 克制圆角：卡片 12px，保留纸感而不显臃肿 */
.tw-radius-card {
  border-radius: 12px;
}

.main-app-area {
  max-width: 720px;
}

/* 卡片骨架 */
.tw-landing-card {
  width: 100%;
  overflow: hidden;
}

.tw-card-header {
  padding: 48px 40px 28px;
}

.tw-card-body {
  padding: 40px;
}

/* 标题：思源宋体，字重 400，贴合 index.html 的克制 */
.tw-title {
  font-family: "Source Han Serif SC", "Noto Serif SC", "Songti SC", "STSong", serif;
  font-size: 30px;
  font-weight: 400;
  line-height: 1.4;
  letter-spacing: 0.04em;
  margin-bottom: 18px;
}

.tw-subtitle {
  font-size: 15px;
  line-height: 1.9;
  color: #6e6e73;
  letter-spacing: 0.02em;
}

.tw-section-title {
  font-family: "Source Han Serif SC", "Noto Serif SC", "Songti SC", "STSong", serif;
  font-size: 20px;
  font-weight: 400;
  letter-spacing: 0.04em;
  margin-bottom: 10px;
}

/* eyebrow 小标签：小号、大字距、浅灰 */
.tw-section-sub {
  font-size: 11px;
  color: #a5a5aa;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  margin-bottom: 18px;
}

.tw-grid-3 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 子区块：灰纸感，细边框 */
.tw-box {
  border-radius: 10px;
  padding: 22px 24px;
  background: #f3f3f5;
  border: 1px solid #ebebef;
}

.tw-box-title {
  font-weight: 500;
  margin-bottom: 6px;
  color: #1a1a1e;
}

.tw-box-desc {
  font-size: 13px;
  color: #6e6e73;
  line-height: 1.8;
}

.tw-card-footer {
  padding: 24px;
  text-align: center;
  font-size: 11px;
  color: #a5a5aa;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.tw-list {
  padding-left: 18px;
  font-size: 13px;
  line-height: 1.9;
  color: #6e6e73;
}

/* ===== Element Plus 穿透：输入 / 按钮贴合墨色主调 ===== */
.tw-bg-app :deep(.el-input__wrapper),
.tw-bg-app :deep(.el-textarea__inner) {
  border-radius: 4px;
  box-shadow: 0 0 0 1px #e7e7eb;
  transition: box-shadow 0.3s ease;
}

.tw-bg-app :deep(.el-input__wrapper:hover),
.tw-bg-app :deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px #c9c9cf;
}

.tw-bg-app :deep(.el-input__wrapper.is-focus),
.tw-bg-app :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #1a1a1e;
}

.tw-bg-app :deep(.el-button--primary) {
  background: #1a1a1e;
  border-color: #1a1a1e;
  border-radius: 3px;
  letter-spacing: 0.06em;
  transition: box-shadow 0.3s ease, transform 0.2s ease;
}

.tw-bg-app :deep(.el-button--primary:hover) {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

.tw-bg-app :deep(.el-button--primary:active) {
  transform: translateY(0);
}
</style>
