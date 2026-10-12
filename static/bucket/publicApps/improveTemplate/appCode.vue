<template data-edit-id="1">
  <div class="tw-min-h-screen tw-bg-app tw-text-body" data-edit-id="2">
    <div class="tw-mx-auto tw-px-3 md:tw-px-4 tw-py-8 md:tw-py-10 main-app-area" data-edit-id="3">
      <!-- 顶部说明 -->
      <div class="tw-mb-6" data-edit-id="4">
        <div class="tw-text-xs tw-text-muted" data-edit-id="5">
          AppItem · 页面模板润色 · Step 1 / 5
        </div>
      </div>
      <!-- 输入区 -->
      <div class="tw-bg-card tw-border-default tw-radius-card tw-shadow-card tw-p-4 tw-mb-8" data-edit-id="7">
        <div class="tw-text-sm tw-font-bold tw-mb-2" data-edit-id="8">
          页面模板代码 + 润色说明
        </div>
        <el-input v-model="content.inputText" type="textarea" :rows="5" placeholder="内容结构说明" data-edit-id="9" />
        <div class="tw-flex tw-justify-end tw-mt-3" data-edit-id="10">
          <el-button type="primary" :loading="isGenerating" @click="handleGenerate" data-edit-id="11">
            {{ isGenerating ? "正在生成" : "开始生成" }}
          </el-button>
        </div>
      </div>

      <!-- 结果区 -->
      <div v-if="accountData.content" class="tw-flex tw-flex-col tw-gap-8" data-edit-id="12" v-html="accountData.content"></div>
    </div>
  </div>
</template>

<script>export default 
          {"name":"IntentSpecFromExperienceAppItem","data":function(
) {
return {
      content: {
          inputText: "",
          outputText: ""
        },
      defaultTemplate: "-",
      isGenerating: false,
      jsonDialogVisible: false,
      accountData: {
          content: ""
        },
      spec: {
          appGoal: "",
          successOutput: "",
          aiInputs: [],
          aiOutput: "",
          constraints: []
        },
      query: {"apiName":"通义千问","model":"qwen3-omni-flash","documentId":"2876132771f0a38db3240290705ac934"},
      title: "模板润色",
      icon: "#",
      introduce: "应用生成步骤：润色生成页面模板"
    };
},"methods":{"handleGenerate":function() {
        if (!this.content.inputText.trim()) return;
        this.isGenerating = true;
        debugger
        this.query.documentId = webCpu.currentCard.task.vueItem.documentMeta.documentId || WebTool.urlQuery(location.href, "id");
        let query = {
          context: this.content.inputText,
          documentId: this.query.documentId
        }
        aigcRequest(query,
          res => {
            this.isGenerating = false;
            try {

              this.content.outputText = res?.usage?.result;
              this.accountData.content = WebTool.transMarkdown(this.content.outputText);

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
      }}};</script>

<style scoped>
  .tw-bg-app {
    background: #fafafc;
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Helvetica Neue",
      Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .tw-bg-card {
    background: #ffffff;
  }

  .tw-border-default {
    border: 1px solid #e7e7eb;
  }

  .tw-shadow-card {
    box-shadow: 0 20px 70px rgba(20, 20, 30, 0.055),
      0 2px 8px rgba(20, 20, 30, 0.025);
  }

  .tw-radius-card {
    border-radius: 12px;
  }

  .main-app-area {
    max-width: 720px;
  }

  .tw-landing-card {
    width: 100%;
    overflow: hidden;
  }

  .tw-card-header {
    padding: 56px 40px 32px;
  }

  .tw-card-body {
    padding: 40px;
  }

  .tw-title {
    font-size: 32px;
    font-weight: 400;
    font-family: "Source Han Serif SC", "Noto Serif SC", "Songti SC", "STSong",
      serif;
    letter-spacing: 0.04em;
    line-height: 1.3;
    margin-bottom: 20px;
  }

  .tw-subtitle {
    font-size: 16px;
    line-height: 1.8;
    opacity: 0.9;
  }

  .tw-section-title {
    font-size: 22px;
    font-weight: 400;
    font-family: "Source Han Serif SC", "Noto Serif SC", "Songti SC", "STSong",
      serif;
    letter-spacing: 0.04em;
    margin-bottom: 12px;
  }

  .tw-section-sub {
    font-size: 15px;
    margin-bottom: 16px;
  }

  .tw-grid-3 {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .tw-box {
    border-radius: 10px;
    padding: 24px;
    background: #f3f3f5;
    border: 1px solid #e7e7eb;
  }

  .tw-box-title {
    font-weight: 500;
    margin-bottom: 6px;
  }

  .tw-box-desc {
    font-size: 14px;
    opacity: 0.85;
  }

  .tw-card-footer {
    padding: 28px;
    text-align: center;
    font-size: 11px;
    color: #a5a5aa;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .tw-list {
    padding-left: 20px;
    font-size: 14px;
    line-height: 1.8;
  }

  /* —— 白与空 · 增补规范 —— */
  .tw-eyebrow {
    font-size: 11px;
    color: #a5a5aa;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  ::selection {
    background: #1a1a1e;
    color: #fafafc;
  }

  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-thumb {
    background: #e7e7eb;
    border-radius: 99px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  :deep(.el-button--primary) {
    background: #1a1a1e !important;
    border-color: #1a1a1e !important;
    border-radius: 3px !important;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  :deep(.el-button--primary:hover) {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }

  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner) {
    border-radius: 4px !important;
    border: 1px solid #e7e7eb !important;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }

  :deep(.el-input__wrapper:hover),
  :deep(.el-textarea__inner:hover) {
    border-color: #c9c9cf !important;
  }

  :deep(.el-input__wrapper.is-focus),
  :deep(.el-textarea__inner:focus) {
    border-color: #1a1a1e !important;
  }

  :deep(.el-table th) {
    background: rgba(250, 250, 252, 0.5) !important;
    color: #6e6e73 !important;
    font-weight: 500 !important;
  }

  :deep(.el-pagination.is-background .el-pager li.is-active) {
    background: #1a1a1e !important;
    border-radius: 8px !important;
    color: #fafafc !important;
  }

  :deep(.el-card) {
    border-radius: 12px !important;
  }
</style>