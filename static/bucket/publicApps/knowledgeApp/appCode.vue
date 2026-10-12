<template data-edit-id="1">
  <div class="tw-relative tw-px-3 tw-pt-3 wizard-bg tw-flex tw-flex-col tw-items-center tw-w-full tw-h-full"
    ref="rootComponentContainer"
    data-edit-id="2">
    <div v-if="(isSolo || content.isSolo) && dataEditable"
      class="wizard-navbar tw-flex tw-pt-2 tw-px-1 tw-items-center tw-justify-between tw-max-w-7xl tw-mx-auto tw-pb-6 tw-w-full"
      data-edit-id="100">
      <div :style="{ width: flag && step !== 0 ? '100%' : '' }"
        class="tw-flex tw-items-center tw-gap-3 logoInfoArea"
        data-edit-id="101">
        <h3 class="tw-text-2xl tw-text-[#1A1A1E] tw-tracking-tight tw-m-0 tw-font-medium logo-title tw-w-full"
          data-edit-id="102">
          <slot v-if="step === 0" data-edit-id="292">
            <div style="background-color: var(--academic-accent)"
              class="tw-w-10 tw-h-10 tw-text-center tw-bg-academic-primary tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-transition-transform group-hover:tw-scale-110"
              data-edit-id="409">
              <span class="tw-text-white tw-font-bold tw-w-24"
                data-edit-id="410">{{ icon || "∑" }}</span
              >
            </div>
            <span class="logo-text" data-edit-id="242">
              <span class="title-text" data-edit-id="368">{{ title }}</span>
              <span class="slogn-text" data-edit-id="369">{{ introduce }}</span>
            </span>
          </slot>
          <slot v-else data-edit-id="308">
            <span title="返回"
              class="goBackBtn"
              @click="goBack()"
              data-edit-id="295">
              <el-icon data-edit-id="384">
                <arrow-left-bold data-edit-id="385" />
              </el-icon>
            </span>
            <slot v-if="
                accountData && Object.keys(accountData).length && !isStreaming
              "
              data-edit-id="357">
              <el-dropdown @command="handleContentCommand"
                style="vertical-align: middle"
                :teleported="false"
                append-to="parent"
                trigger="click"
                data-edit-id="400">
                <el-button text type="primary" data-edit-id="312">
                  操作
                  <el-icon class="el-icon--right" data-edit-id="402">
                    <arrow-down data-edit-id="403" />
                  </el-icon>
                </el-button>

                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="htmlDownload">
                      存档 HTML
                    </el-dropdown-item>

                    <el-dropdown-item command="markdownDownload">
                      存档 Markdown
                    </el-dropdown-item>

                    <el-dropdown-item command="imageDownload">
                      导出图片
                    </el-dropdown-item>

                    <el-dropdown-item command="editContent">
                      {{ viewMode ? "查看内容" : "手动修改" }}
                    </el-dropdown-item>

                    <el-dropdown-item command="copyLink">
                      复制链接
                    </el-dropdown-item>

                    <el-dropdown-item command="readLocal">
                      本地读档
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <slot v-if="viewMode">
                <el-tag class="versionIndexSpan">最近第 {{ currentVersionIndex + 1 }} 个版本
                </el-tag>
                <el-button class="startModifyBtn"
                  size="small"
                  text
                  type="primary"
                  @click="startModify">开始修改</el-button
                >
              </slot>
              <el-input :style="{ width: flag ? '300px' : '300px' }"
                v-model="modifyInfo"
                v-else
                placeholder="输入变更描述..."
                class="custom-input-group"
                clearable
                @keyup.enter="handleConfirm"
                data-edit-id="342">
                <template #append>
                  <el-button :loading="modifyLoading"
                    :disabled="modifyLoading"
                    style="color: #fff"
                    class="!tw-bg-[#1A1A1E] !tw-border-[#1A1A1E] !tw-text-white transition-all duration-300 wizard-action-btn wizard-action-btn--primary"
                    @click="handleConfirm">
                    <span class="font-medium px-2">
                      <i class="bi bi-magic"></i>
                    </span>
                  </el-button>
                </template>
              </el-input>
            </slot>
            <span v-else style="font-size: 14px"> {{ title }}</span>
            <span class="versionListArea"
              style="float: right; margin-right: 10px"
              v-if="versionList && versionList.length !== 0 && !isStreaming">
              <el-dropdown @command="handleVersionChange"
                trigger="click"
                :teleported="false"
                append-to="parent"
                style="vertical-align: middle"
                v-if="step === 1"
                data-edit-id="400">
                <el-button text type="primary" data-edit-id="312">
                  版本
                  <el-icon class="el-icon--right" data-edit-id="402">
                    <arrow-down data-edit-id="403" />
                  </el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <slot v-for="(item, index) in versionList">
                      <el-dropdown-item :style="{
                          fontWeight: index === currentVersionIndex ? 800 : 300,
                        }"
                        :command="index"
                        class="tw-justify-between">
                        <slot v-if="index === currentVersionIndex">
                          {{ getVersionLabel(item) }}
                        </slot>
                        <slot v-else>
                          {{ getVersionLabel(item) }}
                          <el-button style="margin-left: 5px"
                            @click.stop="checkDiff(index)"
                            size="small">对比</el-button
                          >
                        </slot>
                      </el-dropdown-item>
                    </slot>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <span v-if="!flag" class="versionLabel">{{
                getVersionLabel(versionList[currentVersionIndex])
              }}</span>
            </span>
          </slot>
        </h3>
      </div>
      <div class="tw-flex tw-items-center" data-edit-id="103">
        <slot v-if="step === 0 && !flag">
          <el-button class="wizard-action-btn" @click="openFeedbackDialog()">
            问题反馈
          </el-button>
        </slot>
        <div appName="loginRegItem"
          component="CardItem"
          :documentId="query ? query.documentId : ''"
          class="tw-opacity-100 refined-user-card"
          :style="{
            width: '135px',
            marginLeft: '15px',
            height: '30px',
            borderLeft: 'solid 1px #ddd',
          }"
          data-edit-id="104"></div>
      </div>
    </div>

    <div ref="loadingEffectArea"
      style="height: 100%; position: relative; z-index: 0"
      class="tw-max-w-7xl tw-y-full tw-mx-auto tw-w-full"
      data-edit-id="3">
      <!-- 输入控制面板 -->
      <div v-if="step === 0"
        class="wizard-input-panel tw-relative tw-bg-white tw-border tw-border-[#EBEBEF] tw-rounded-2xl tw-shadow-sm tw-p-5 tw-transition-all hover:tw-shadow-md"
        data-edit-id="4">
        <div class="tw-flex tw-flex-col md:tw-flex-row tw-gap-5 tw-items-stretch">
          <div class="tw-flex-1 tw-flex tw-flex-col tw-justify-between tw-min-w-0">
            <div class="input-spell-box tw-w-full" data-edit-id="122">
              <el-input :placeholder="inputPlaceholder"
                :rows="4"
                resize="none"
                v-model="content.inputText"
                type="textarea"
                class="feature-input tw-w-full"
                data-edit-id="131"></el-input>
            </div>

            <div class="tw-flex tw-items-center tw-flex-wrap tw-gap-2 tw-mt-4">
              <span v-if="!flag"
                class="tw-text-sm tw-text-[#86868B] tw-font-medium tw-whitespace-nowrap">
                试试看：
              </span>
              <button v-for="d in exampleList"
                :key="d.title || d.name"
                @click="inputExampleText(d)"
                class="example-chip tw-group tw-flex tw-items-center tw-gap-1.5 tw-px-3 tw-py-1.5 tw-text-[13px] tw-bg-[#F8F8FA] hover:tw-bg-[#F3F3F5] hover:tw-text-[#1A1A1E] tw-text-[#6E6E73] tw-rounded-lg tw-transition-colors tw-whitespace-nowrap active:tw-scale-95">
                <span class="chip-icon">{{ d.icon || "" }}</span>
                <span>{{ d.name }}</span>
              </button>
            </div>
          </div>

          <div class="tw-h-px md:tw-hidden tw-bg-[#F3F3F5] tw-w-full"></div>
          <div class="tw-hidden md:tw-block tw-w-px tw-bg-[#F3F3F5] tw-my-1 tw-self-stretch"></div>

          <div class="aigcOptionArea tw-flex tw-flex-row md:tw-flex-col tw-justify-between md:tw-justify-end tw-gap-3 tw-w-full md:tw-w-32 tw-shrink-0">
            <el-button :style="{ marginTop: flag ? '5px' : '' }"
              type="primary"
              :disabled="!content.inputText && !description"
              :loading="loading"
              @click="handleGenerate"
              class="cast-spell-btn tw-flex-1 md:tw-flex-none tw-mt-6 tw-h-10 tw-shadow-sm"
              data-edit-id="11">
              <i class="bi bi-lightning-charge-fill tw-mr-1.5"
                data-edit-id="12"></i>
              立即生成
            </el-button>

            <el-button v-if="!flag"
              text
              type="info"
              :loading="readingFile"
              :disabled="readingFile"
              @click="triggerFileInput"
              class="tw-flex-1 md:tw-flex-none tw-justify-center tw-h-10 hover:!tw-bg-[#F3F3F5] tw-text-[#6E6E73] tw-mt-8">
              <i class="bi bi-folder2-open tw-mr-1"></i>
              本地读档
            </el-button>
          </div>
        </div>
      </div>
      <span v-if="!(isSolo || content.isSolo) && step === 1 && dataEditable"
        style="
          float: right;
          position: relative;
          width: 100%;
          text-align: right;
          margin-top: 10px;
          margin-bottom: 3px;
          right: 0px;
          display: inline-block;
        "
        data-edit-id="357">
        <span title="返回"
          class="goBackBtn"
          @click="goBack()"
          data-edit-id="295">
          <el-icon data-edit-id="384">
            <arrow-left-bold data-edit-id="385" />
          </el-icon>
        </span>
        <span class="versionListArea"
          style="float: left"
          v-if="versionList && versionList.length !== 0 && !isStreaming">
          <el-dropdown @command="handleVersionChange"
            trigger="click"
            :teleported="false"
            append-to="parent"
            v-if="step === 1"
            data-edit-id="400">
            <el-button text type="primary" data-edit-id="312">
              版本
              <el-icon class="el-icon--right" data-edit-id="402">
                <arrow-down data-edit-id="403" />
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <slot v-for="(item, index) in versionList">
                  <el-dropdown-item class="tw-justify-between"
                    :command="index"
                    :style="{
                      fontWeight: index === currentVersionIndex ? 800 : 300,
                    }">
                    <slot v-if="index === currentVersionIndex">
                      {{ getVersionLabel(item) }}
                    </slot>
                    <slot v-else>
                      {{ getVersionLabel(item) }}
                      <el-button style="margin-left: 5px"
                        @click.stop="checkDiff(index)"
                        size="small">对比</el-button
                      >
                    </slot>
                  </el-dropdown-item>
                </slot>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <span v-if="!flag" class="versionLabel">{{
            getVersionLabel(versionList[currentVersionIndex])
          }}</span>
        </span>
        <slot v-if="step === 1 && !isStreaming">
          <el-dropdown @command="handleContentCommand"
            trigger="click"
            :teleported="false"
            append-to="parent"
            data-edit-id="400">
            <el-button text type="primary" data-edit-id="312">
              操作
              <el-icon class="el-icon--right" data-edit-id="402">
                <arrow-down data-edit-id="403" />
              </el-icon>
            </el-button>

            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="htmlDownload">
                  存档 HTML
                </el-dropdown-item>

                <el-dropdown-item command="markdownDownload">
                  存档 Markdown
                </el-dropdown-item>

                <el-dropdown-item command="imageDownload">
                  导出图片
                </el-dropdown-item>

                <el-dropdown-item command="editContent">
                  {{ viewMode ? "查看内容" : "手动修改" }}
                </el-dropdown-item>

                <el-dropdown-item command="copyLink">
                  复制链接
                </el-dropdown-item>

                <el-dropdown-item command="readLocal">
                  本地读档
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <slot v-if="viewMode">
            <el-tag class="versionIndexSpan">最近第 {{ currentVersionIndex + 1 }} 个版本
            </el-tag>
            <el-button class="startModifyBtn"
              text
              type="primary"
              size="small"
              @click="startModify">开始修改</el-button
            >
          </slot>
          <el-input v-else
            :style="{ width: flag ? '260px' : '400px' }"
            v-model="modifyInfo"
            placeholder="输入变更描述..."
            class="custom-input-group"
            clearable
            @keyup.enter="handleConfirm"
            data-edit-id="342">
            <template #append>
              <el-button :loading="modifyLoading"
                :disabled="modifyLoading"
                style="color: #fff"
                class="!tw-bg-[#1A1A1E] !tw-border-[#1A1A1E] !tw-text-white transition-all duration-300 wizard-action-btn wizard-action-btn--primary"
                @click="handleConfirm">
                <span class="font-medium px-2"><i class="bi bi-magic"></i
                ></span>
              </el-button>
            </template>
          </el-input>
        </slot>
      </span>
      <!-- 结果展示面板 -->
      <div class="wizard-result-panel tw-overflow-hidden"
        :style="{
          height: resultPanelHeight,
          'margin-top': '0px',
          zIndex: 0,
        }"
        data-edit-id="110">
        <div v-if="step === 1"
          data-edit-id="117"
          class="resultComponentArea tw-w-full tw-relative"
          ref="resultComponentItem"></div>
        <div v-else
          class="tw-flex-1 tw-w-full tw-text-center tw-py-20 tw-flex tw-flex-col tw-items-center"
          data-edit-id="112">
          <div class="waiting-rune tw-mb-4" data-edit-id="118">
            <!-- 外环 -->
            <div class="rune-ring rune-ring--outer" data-edit-id="276"></div>
            <!-- 内环 -->
            <div class="rune-ring rune-ring--inner" data-edit-id="277"></div>
            <!-- 中心图标 -->
            <el-icon :size="32" class="rune-icon" data-edit-id="119">
              <i class="bi bi-hourglass-split"></i>
            </el-icon>
          </div>
          <p class="waiting-tips" data-edit-id="121">{{ currentTips }}</p>
          <!-- 装饰性点 -->
          <div class="magic-dots" data-edit-id="281">
            <span data-edit-id="282"></span><span data-edit-id="283"></span
            ><span data-edit-id="284"></span>
          </div>
        </div>
      </div>
    </div>
    <el-dialog v-model="feedbackDialog.visible"
      title="反馈与建议"
      width="500"
      draggable>
      <el-input type="textarea"
        :placeholder="feedbackDialog.placeholder"
        v-model="feedbackDialog.message"
        resize="none"></el-input>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="feedbackDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="confirmSendFeedback()">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
    <input ref="hiddenFileInput"
      type="file"
      :accept="myAccept"
      class="tw-hidden"
      @change="onFileSelected($event)"
      data-edit-id="109" />
  </div>
</template>

<style scoped>
/* ============================================
   RESET
   ============================================ */
.el-card {
  border: none;
  box-shadow: none;
}

/* ============================================
   DESIGN TOKENS — 白与空 · 留白 · 重设计
   ============================================ */
* {
  /* 主色：活力蓝（学术蓝） */
  --academic-primary: #1A1A1E;
  --academic-primary-hover: #2E2E33;
  --academic-primary-active: #0E0E11;
  --academic-primary-soft: rgba(26, 26, 30, 0.05);
  --academic-primary-ring: rgba(26, 26, 30, 0.10);

  /* 背景：冰川灰 */
  --academic-bg: #FAFAFC;
  --academic-bg-deep: #F3F3F5;

  /* 文字：深石板青 */
  --academic-text: #1A1A1E;
  --academic-text-secondary: #6E6E73;
  --academic-text-tertiary: #86868B;

  /* 强调：琥珀金 */
  --academic-accent: #6E6E73;
  --academic-accent-soft: rgba(110, 110, 115, 0.10);

  /* 辅助 */
  --academic-border: rgba(26, 26, 30, 0.08);
  --academic-border-strong: rgba(26, 26, 30, 0.14);

  /* 玻璃面板 */
  --glass-bg: rgba(255, 255, 255, 0.88);
  --glass-shadow: 0 1px 2px rgba(26, 26, 30, 0.02),
    0 24px 48px -24px rgba(26, 26, 30, 0.08);
  --glass-shadow-hover: 0 2px 4px rgba(26, 26, 30, 0.03),
    0 32px 64px -28px rgba(26, 26, 30, 0.12);

  /* 圆角 */
  --radius-card: 16px;
  --radius-control: 10px;

  --font-system: "Inter", "Source Han Serif SC", "Songti SC", "Noto Serif SC",
    "SimSun", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", "SF Mono", Menlo, "Cascadia Code",
    Consolas, monospace;
}

/* ============================================
   全局背景 — 柔和纸白 + 极细网格秩序
   ============================================ */
.wizard-bg {
  font-family: var(--font-system);
  color: var(--academic-text);
  background-color: var(--academic-bg);
  background-image: radial-gradient(
      ellipse 80% 60% at 20% 0%,
      rgba(26, 26, 30, 0.06) 0%,
      transparent 55%
    ),
    radial-gradient(
      ellipse 60% 50% at 100% 100%,
      rgba(110, 110, 115, 0.04) 0%,
      transparent 55%
    ),
    radial-gradient(
      circle at 1px 1px,
      rgba(26, 26, 30, 0.07) 1px,
      transparent 0
    );
  background-size: auto, auto, 22px 22px;
  background-position: 0 0, 0 0, 0 0;
  position: relative;
  overflow: hidden;
}

.wizard-bg::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: linear-gradient(
      to right,
      rgba(26, 26, 30, 0.035) 1px,
      transparent 1px
    ),
    linear-gradient(to bottom, rgba(26, 26, 30, 0.035) 1px, transparent 1px);
  background-size: 88px 88px;
  pointer-events: none;
  z-index: 0;
}

/* ============================================
   导航栏
   ============================================ */
.wizard-navbar {
  position: relative;
  z-index: 1000;
}

.versionIndexSpan {
  font-size: 14px;
  font-weight: 500;
}

.wizard-navbar::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(26, 26, 30, 0.22) 30%,
    rgba(26, 26, 30, 0.22) 70%,
    transparent 100%
  );
}

.logoInfoArea {
  width: calc(100% - 160px);
}

.logo-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-system);
}

.refined-logo {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  border: 1px solid var(--academic-border);
  background: #fff;
  box-shadow: 0 1px 2px rgba(26, 26, 30, 0.06),
    0 4px 12px rgba(26, 26, 30, 0.08);
  display: inline-block;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  overflow: hidden;
}

.refined-logo:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(26, 26, 30, 0.08),
    0 8px 20px rgba(26, 26, 30, 0.14);
}

.logo-text {
  color: var(--academic-text);
  letter-spacing: -0.01em;
  display: inline-block;
  width: calc(100% - 160px);
  line-height: 18px;
}

.upload-btn {
  background: #fff !important;
  border: 1px solid var(--academic-border-strong) !important;
  color: var(--academic-text) !important;
  border-radius: 10px !important;
  font-size: 13px !important;
  transition: all 0.18s ease;
}

.upload-btn:hover {
  border-color: var(--academic-primary) !important;
  color: var(--academic-primary) !important;
  box-shadow: 0 3px 10px rgba(26, 26, 30, 0.14);
  transform: translateY(-1px);
}

.title-text {
  font-size: 16px;
  font-weight: 500;
  display: block;
  color: var(--academic-text);
  letter-spacing: 0.06em;
}

.slogn-text {
  font-size: 12px;
  display: block;
  font-weight: 400;
  color: var(--academic-text-secondary);
  margin-top: 2px;
}

.refined-user-card {
  opacity: 1 !important;
}

.el-dropdown-menu__item {
  font-weight: 500;
}

/* ============================================
   面板 — 卡片式架构（2xl 圆角 + 磨砂玻璃）
   ============================================ */
.wizard-input-panel {
  margin-top: -5px;
  margin-bottom: 5px;
}

.wizard-input-panel,
.wizard-result-panel {
  position: relative;
  background: var(--glass-bg);
  border: 1px solid var(--academic-border);
  border-radius: var(--radius-card);
  box-shadow: var(--glass-shadow);
  backdrop-filter: saturate(160%) blur(18px);
  -webkit-backdrop-filter: saturate(160%) blur(18px);
  overflow: hidden;
  transition: box-shadow 0.25s ease, border-color 0.25s ease;
  z-index: 1;
}

.wizard-result-panel {
  position: relative;
  width: 100%;
  border-radius: var(--radius-card);
  overflow: hidden;
  transition: box-shadow 0.25s ease, border-color 0.25s ease;
  z-index: 1;
}

.wizard-input-panel:hover {
  box-shadow: var(--glass-shadow-hover);
}

/* 面板顶部细线强调 —— 学术精准感 */
.wizard-input-panel::before {
  content: "";
  position: absolute;
  top: 0;
  left: 24px;
  right: 24px;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--academic-primary) 20%,
    var(--academic-primary) 80%,
    transparent 100%
  );
  opacity: 0.55;
  border-radius: 2px;
}

.panel-glow-strip--result {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(26, 26, 30, 0.5) 25%,
    rgba(26, 26, 30, 0.55) 55%,
    rgba(110, 110, 115, 0.35) 80%,
    transparent 100%
  );
  background-size: 200% 100%;
}

@keyframes shimmerStrip {
  0% {
    background-position: 0% 0;
  }

  100% {
    background-position: 200% 0;
  }
}

/* ============================================
   上传区域（保留样式）
   ============================================ */
.upload-zone {
  width: 80px;
  height: 80px;
  border: 1.5px dashed rgba(26, 26, 30, 0.35);
  border-radius: var(--radius-control);
  background: rgba(26, 26, 30, 0.04);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.3, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.upload-zone::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 50% 0%,
    rgba(26, 26, 30, 0.1),
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.2s ease;
}

.upload-zone:hover {
  border-color: var(--academic-primary);
  border-style: solid;
  background: rgba(26, 26, 30, 0.07);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(26, 26, 30, 0.16);
}

.upload-zone:hover::before {
  opacity: 1;
}

.upload-zone__icon {
  color: var(--academic-primary) !important;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.upload-zone:hover .upload-zone__icon {
  transform: scale(1.15) rotate(90deg);
}

.upload-zone__label {
  font-size: 11px;
  margin-top: 6px;
  color: var(--academic-primary);
  font-weight: 500;
  letter-spacing: 0.01em;
  font-family: var(--font-system);
}

.selected-image-wrap {
  display: inline-block;
}

.preview-thumbnail {
  width: 80px !important;
  height: 80px !important;
  border-radius: var(--radius-control) !important;
  border: 1px solid var(--academic-border) !important;
  box-shadow: 0 2px 8px rgba(26, 26, 30, 0.08), 0 1px 2px rgba(26, 26, 30, 0.04) !important;
  transition: all 0.2s ease;
}

.preview-thumbnail:hover {
  border-color: var(--academic-primary) !important;
  box-shadow: 0 4px 16px rgba(26, 26, 30, 0.18),
    0 1px 4px rgba(26, 26, 30, 0.06) !important;
  transform: translateY(-1px);
}

.removePictureBtn {
  position: absolute;
  background: #ffffff !important;
  border: 1px solid var(--academic-border-strong) !important;
  color: #dc2626 !important;
  right: -9px;
  top: -9px;
  z-index: 3;
  display: inline-block;
  box-shadow: 0 2px 6px rgba(26, 26, 30, 0.12),
    0 0 0 0.5px rgba(255, 255, 255, 0.8) inset !important;
  transition: all 0.18s ease !important;
}

.removePictureBtn:hover {
  background: #fee2e2 !important;
  border-color: rgba(220, 38, 38, 0.4) !important;
  box-shadow: 0 3px 10px rgba(220, 38, 38, 0.22) !important;
  transform: scale(1.08);
}

.el-popper {
  z-index: 10000 !important;
}

.versionLabel {
  font-size: 12px;
  color: #999;
  vertical-align: middle;
}

.startModifyBtn {
  margin-left: 12px;
}

/* ============================================
   文本输入区 — 对话驱动
   ============================================ */
.input-spell-box {
  background: #ffffff;
  border: 1px solid var(--academic-border-strong);
  border-radius: var(--radius-control);
  padding: 2px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(26, 26, 30, 0.03) inset,
    0 1px 2px rgba(255, 255, 255, 0.8);
}

.input-spell-box:focus-within {
  border-color: var(--academic-primary);
  box-shadow: 0 0 0 3px var(--academic-primary-ring),
    0 1px 2px rgba(26, 26, 30, 0.03) inset;
}

.feature-input .el-textarea__inner {
  height: 70px;
  padding: 12px 14px;
  background: transparent !important;
  color: var(--academic-text) !important;
  box-shadow: none !important;
  font-size: 14px !important;
  font-family: var(--font-system) !important;
  line-height: 1.6 !important;
  border: none !important;
  resize: none !important;
  letter-spacing: 0 !important;
}

.feature-input .el-textarea__inner::placeholder {
  color: var(--academic-text-tertiary);
  font-family: var(--font-system);
}

/* ============================================
   示例芯片
   ============================================ */
.example-hint {
  color: var(--academic-text-tertiary);
  font-weight: 500;
}

.example-chip {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid var(--academic-border);
  color: var(--academic-text-secondary);
  border-radius: 999px;
  font-family: var(--font-system);
  font-weight: 500;
  backdrop-filter: blur(8px);
  transition: all 0.18s ease;
  cursor: pointer;
}

.example-chip:hover {
  background: #ffffff;
  border-color: var(--academic-primary);
  color: var(--academic-primary);
  box-shadow: 0 2px 8px rgba(26, 26, 30, 0.14);
  transform: translateY(-1px);
}

.example-chip .chip-icon {
  filter: grayscale(40%);
  transition: filter 0.2s ease;
}

.example-chip:hover .chip-icon {
  filter: grayscale(0%);
}

/* ============================================
   生成按钮 — 松烟墨 CTA
   ============================================ */
.cast-spell-btn {
  position: relative;
  background: var(--academic-primary) !important;
  border: 1px solid var(--academic-primary) !important;
  border-radius: var(--radius-control) !important;
  font-weight: 500 !important;
  font-size: 14px !important;
  font-family: var(--font-system) !important;
  letter-spacing: 0.01em !important;
  color: #fff !important;
  padding: 10px 18px !important;
  box-shadow: 0 2px 6px rgba(26, 26, 30, 0.32), 0 1px 2px rgba(26, 26, 30, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
  transition: all 0.2s cubic-bezier(0.34, 1.2, 0.64, 1) !important;
  overflow: hidden;
}

.cast-spell-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 55%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.18),
    transparent
  );
  transition: left 0.6s ease;
}

.cast-spell-btn:hover::before {
  left: 160%;
}

.cast-spell-btn:hover {
  background: var(--academic-primary-hover) !important;
  border-color: var(--academic-primary-hover) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 18px rgba(26, 26, 30, 0.4),
    0 2px 5px rgba(26, 26, 30, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.22) !important;
}

.cast-spell-btn[active="true"] {
  background: var(--academic-primary-active) !important;
}

.cast-spell-btn:active {
  transform: translateY(0px) scale(0.99) !important;
  background: var(--academic-primary-active) !important;
  box-shadow: 0 1px 3px rgba(26, 26, 30, 0.3),
    inset 0 1px 2px rgba(0, 0, 0, 0.1) !important;
}

/* ============================================
   等待状态 — 精密坐标圆环 + 十字准星
   ============================================ */
.waiting-rune {
  position: relative;
  width: 112px;
  height: 112px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.waiting-rune::before,
.waiting-rune::after {
  content: "";
  position: absolute;
  background: rgba(26, 26, 30, 0.15);
}

.waiting-rune::before {
  width: 100%;
  height: 1px;
  top: 50%;
}

.waiting-rune::after {
  width: 1px;
  height: 100%;
  left: 50%;
}

.rune-ring {
  position: absolute;
  border-radius: 50%;
  border: 1.5px solid transparent;
}

.rune-ring--outer {
  inset: 0;
  border-top-color: var(--academic-primary);
  border-right-color: rgba(26, 26, 30, 0.2);
  border-bottom-color: rgba(110, 110, 115, 0.4);
  border-left-color: transparent;
  animation: spinRune 2s linear infinite;
  box-shadow: 0 0 14px rgba(26, 26, 30, 0.14);
}

.rune-ring--inner {
  inset: 14px;
  border-top-color: transparent;
  border-right-color: rgba(110, 110, 115, 0.7);
  border-bottom-color: transparent;
  border-left-color: rgba(26, 26, 30, 0.4);
  animation: spinRune 1.4s linear infinite reverse;
}

@keyframes spinRune {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.rune-icon {
  color: var(--academic-primary) !important;
  filter: drop-shadow(0 0 6px rgba(26, 26, 30, 0.45))
    drop-shadow(0 0 14px rgba(26, 26, 30, 0.18)) !important;
  animation: runeBreath 2.2s ease-in-out infinite;
  z-index: 1;
}

@keyframes runeBreath {
  0%,
  100% {
    transform: scale(0.95);
    opacity: 0.82;
  }

  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}

.goBackBtn {
  cursor: pointer;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 32px;
  height: 32px;
  width: 30px;
  text-align: center;
  float: left;
  vertical-align: middle;
  margin-right: 10px;
}

.waiting-tips {
  color: var(--academic-text-secondary);
  font-size: 14px;
  font-weight: 400;
  font-family: var(--font-system);
  letter-spacing: 0.01em;
  margin: 0 0 14px;
}

.magic-dots {
  display: flex;
  gap: 6px;
  align-items: center;
}

.magic-dots span {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--academic-primary);
  animation: dotBounce 1.2s ease-in-out infinite;
  opacity: 0.5;
}

.magic-dots span:nth-child(2) {
  animation-delay: 0.18s;
  background: var(--academic-accent);
}

.magic-dots span:nth-child(3) {
  animation-delay: 0.36s;
}

@keyframes dotBounce {
  0%,
  80%,
  100% {
    transform: translateY(0);
    opacity: 0.35;
  }

  40% {
    transform: translateY(-8px);
    opacity: 1;
  }
}

/* ============================================
   结果区域
   ============================================ */
.resultComponentArea {
  position: relative;
  float: left;
  display: inline-block;
  width: 100%;
  height: 100%;
}

/* ============================================
   操作按钮组
   ============================================ */
.action-bar {
  border-top: 1px solid var(--academic-border);
  background: rgba(250, 250, 252, 0.6);
  gap: 8px;
}

.wizard-action-btn {
  background: #ffffff !important;
  border: 1px solid var(--academic-border-strong) !important;
  color: var(--academic-text) !important;
  border-radius: 10px !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  font-family: var(--font-system) !important;
  letter-spacing: 0.01em !important;
  box-shadow: 0 1px 3px rgba(26, 26, 30, 0.05),
    0 0 0 0.5px rgba(255, 255, 255, 0.8) inset !important;
  transition: all 0.18s ease !important;
}

.wizard-action-btn:hover {
  background: #ffffff !important;
  border-color: var(--academic-primary) !important;
  color: var(--academic-primary) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 3px 10px rgba(26, 26, 30, 0.14),
    0 1px 3px rgba(26, 26, 30, 0.04) !important;
}

.wizard-action-btn:active {
  transform: translateY(0) scale(0.99) !important;
  box-shadow: 0 1px 2px rgba(26, 26, 30, 0.08) !important;
}

.wizard-action-btn--primary {
  background: var(--academic-primary-soft) !important;
  border-color: rgba(26, 26, 30, 0.3) !important;
  color: var(--academic-primary) !important;
}

.wizard-action-btn--primary:hover {
  background: rgba(26, 26, 30, 0.14) !important;
  border-color: rgba(26, 26, 30, 0.45) !important;
  color: var(--academic-primary-active) !important;
  box-shadow: 0 3px 12px rgba(26, 26, 30, 0.2) !important;
}

/* ============================================
   Loading 遮罩
   ============================================ */
.el-loading-mask {
  background: rgba(250, 250, 252, 0.82) !important;
  backdrop-filter: saturate(160%) blur(12px) !important;
  -webkit-backdrop-filter: saturate(160%) blur(12px) !important;
  border-radius: var(--radius-card) !important;
}

.el-loading-spinner .el-loading-text {
  color: var(--academic-text-secondary) !important;
  font-size: 12.5px !important;
  font-weight: 500 !important;
  font-family: var(--font-system) !important;
  letter-spacing: 0.01em !important;
  margin-top: 10px !important;
}

.el-loading-spinner .circular {
  width: 36px !important;
  height: 36px !important;
}

.el-loading-spinner .path {
  stroke: var(--academic-primary) !important;
  stroke-width: 2.5 !important;
}

/* ============================================
   布局辅助
   ============================================ */
.topHeaderArea {
  position: relative;
  width: 100%;
}

.aigcOptionArea {
  position: relative;
  display: inline-block;
}

.designInfoArea {
  position: relative;
  display: inline-block;
}

/* ============================================
   Element Plus 覆盖 — 输入框 append
   ============================================ */
.custom-input-group .el-input__wrapper {
  border-radius: 10px 0 0 10px !important;
  background: #ffffff !important;
  box-shadow: 0 0 0 1px var(--academic-border-strong) inset !important;
  transition: box-shadow 0.2s ease !important;
}

.custom-input-group .el-input__wrapper:hover {
  box-shadow: 0 0 0 1px var(--academic-primary) inset !important;
}

.custom-input-group .el-input__wrapper.is-focus {
  box-shadow: 0 0 0 1px var(--academic-primary) inset,
    0 0 0 3px var(--academic-primary-ring) !important;
}

.custom-input-group .el-input__inner {
  color: var(--academic-text) !important;
  font-family: var(--font-system) !important;
  font-size: 13.5px !important;
}

.custom-input-group .el-input__inner::placeholder {
  color: var(--academic-text-tertiary) !important;
}

.custom-input-group .el-input-group__append {
  background: transparent !important;
  padding: 0 !important;
  border-radius: 0 10px 10px 0 !important;
  box-shadow: none !important;
  border: none !important;
}

.custom-input-group .el-input-group__append .el-button {
  border-radius: 0 10px 10px 0 !important;
  background: var(--academic-primary) !important;
  border: 1px solid var(--academic-primary) !important;
  color: #fff !important;
  font-family: var(--font-system) !important;
  font-weight: 500 !important;
  margin: 0 !important;
  height: 100% !important;
  box-shadow: 0 1px 2px rgba(26, 26, 30, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.18) !important;
  transition: all 0.18s ease !important;
}

.custom-input-group .el-input-group__append .el-button:hover {
  background: var(--academic-primary-hover) !important;
  border-color: var(--academic-primary-hover) !important;
  box-shadow: 0 3px 8px rgba(26, 26, 30, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
}

/* ============================================
   Element Plus 覆盖 — 下拉弹层
   ============================================ */
.el-select-dropdown {
  background: rgba(255, 255, 255, 0.96) !important;
  border: 1px solid var(--academic-border) !important;
  border-radius: 14px !important;
  box-shadow: 0 10px 32px rgba(26, 26, 30, 0.12),
    0 2px 8px rgba(26, 26, 30, 0.06) !important;
  backdrop-filter: saturate(160%) blur(18px) !important;
  -webkit-backdrop-filter: saturate(160%) blur(18px) !important;
  overflow: hidden !important;
}

.el-select-dropdown__item {
  color: var(--academic-text) !important;
  font-size: 13.5px !important;
  font-family: var(--font-system) !important;
  border-radius: 8px !important;
  margin: 2px 5px !important;
  padding: 8px 12px !important;
  transition: all 0.14s ease !important;
  letter-spacing: 0.01em !important;
}

.el-select-dropdown__item:hover,
.el-select-dropdown__item.hover {
  background: var(--academic-primary-soft) !important;
  color: var(--academic-primary) !important;
}

.el-select-dropdown__item.selected {
  background: var(--academic-primary-soft) !important;
  color: var(--academic-primary) !important;
  font-weight: 500 !important;
}

/* ============================================
   图片预览弹层
   ============================================ */
.el-image__inner {
  max-height: 80vh;
}

.el-image-viewer__wrapper {
  background: rgba(26, 26, 30, 0.85) !important;
  backdrop-filter: blur(12px) !important;
}

/* ============================================
   滚动条美化
   ============================================ */
.wizard-result-panel ::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.wizard-result-panel ::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 6px;
}

.wizard-result-panel ::-webkit-scrollbar-thumb {
  background: rgba(26, 26, 30, 0.18);
  border-radius: 6px;
  transition: background 0.2s ease;
}

.wizard-result-panel ::-webkit-scrollbar-thumb:hover {
  background: var(--academic-primary);
}

/* ============================================
   响应式微调
   ============================================ */
@media (max-width: 640px) {
  .wizard-input-panel,
  .wizard-result-panel {
    border-radius: 12px;
  }

  .cast-spell-btn {
    font-size: 13.5px !important;
    padding: 9px 14px !important;
  }

  .logo-text {
    font-size: 15px;
    width: auto;
  }

  .refined-logo {
    width: 36px;
    height: 36px;
    border-radius: 10px;
  }

  .wizard-bg {
    background-size: auto, auto, 18px 18px;
  }
}

/* ============================================
   工具类补充
   ============================================ */
.tw-bg-gray-50\/50 {
  background-color: rgba(250, 250, 252, 0.6);
}

.tw-w-800 {
  max-width: 800px;
}

.tw-margin-auto {
  margin: auto;
}

/* Muse 风格统一：品牌蓝控件、弹窗与表单 */
:deep(.el-button--primary) {
  --el-button-bg-color: #1A1A1E;
  --el-button-border-color: #1A1A1E;
  --el-button-hover-bg-color: #2E2E33;
  --el-button-hover-border-color: #2E2E33;
  --el-button-active-bg-color: #0E0E11;
  --el-button-active-border-color: #0E0E11;
  border-radius: 999px;
}

:deep(.el-dialog) {
  border-radius: 12px !important;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(26, 26, 30, 0.18) !important;
}

:deep(.el-dialog__header) {
  margin-right: 0;
  padding: 20px 24px 12px;
  border-bottom: 1px solid #FAFAFC;
}

:deep(.el-dialog__title) {
  font-weight: 400;
  font-size: 1.125rem;
  color: #1A1A1E;
}

:deep(.el-dialog__body) {
  padding: 20px 24px;
}

:deep(.el-dialog__footer) {
  padding: 12px 24px 20px;
  border-top: 1px solid #FAFAFC;
}

:deep(.el-select__wrapper),
:deep(.el-input__wrapper) {
  border-radius: 10px;
}

:deep(.el-tag) {
  --el-tag-bg-color: #F3F3F5;
  --el-tag-border-color: #EBEBEF;
  --el-tag-text-color: #2E2E33;
}

.tw-text-blue-600,
.tw-text-blue-500 {
  color: #1A1A1E !important;
}

.tw-bg-blue-50 {
  background-color: #F3F3F5 !important;
}

.tw-bg-blue-500,
.tw-bg-blue-600 {
  background-color: #1A1A1E !important;
}

.tw-border-blue-200 {
  border-color: #EBEBEF !important;
}
</style>

<script>export default 
          {"name":"","data":function(
) {
return {
      loading: false,
      loadingText: "已收指令...",
      waitingText: "等待输入描述...",
      gettedTips: "已输入描述，待点击 “立即生成” 确认...",
      modifyInfo: "",
      modifyLoading: false,
      modifyEnabled: false,
      readingFile: false,
      isStreaming: false,
      versionList: [],
      currentVersionIndex: 0,
      step: 0,
      currentAppItem: {
									className: "ElementVueItem",
									task: {
										style: {
											overflow: "auto",
										},
										template: "data:text/plain;charset=utf-8;base64,YGBgdnVlCjx0ZW1wbGF0ZT4KICA8ZGl2IGlkPSJyb290Q29udGFpbmVySXRlbSIgcmVmPSJyb290Q29udGFpbmVySXRlbSIgY2xhc3M9InR3LXJlbGF0aXZlIHR3LXAtNCBzbTp0dy1wLTYgdHctYmctc2xhdGUtNTAiPgogICAgPGVsLWNhcmQgY2xhc3M9Im1pbmkta25vd2xlZGdlLWJhc2UtcmVzdWx0IHR3LXJvdW5kZWQtMnhsIHR3LXNoYWRvdy1sZyB0dy1ib3JkZXItMCB0dy1iZy13aGl0ZSI+CiAgICAgIDwhLS0g57uT5p6c5qCH6aKY5LiO5YWD5L+h5oGvIC0tPgogICAgICA8ZGl2IGNsYXNzPSJ0dy1mbGV4IHR3LWZsZXgtY29sIGxnOnR3LWZsZXgtcm93IGxnOnR3LWl0ZW1zLWNlbnRlciB0dy1qdXN0aWZ5LWJldHdlZW4gdHctcGItNCB0dy1tYi01IHR3LWJvcmRlci1iIHR3LWJvcmRlci1zbGF0ZS0xMDAgdHctZ2FwLTMiPgogICAgICAgIDxkaXYgY2xhc3M9InR3LWZsZXggdHctaXRlbXMtY2VudGVyIHR3LWdhcC0zIj4KICAgICAgICAgIDxkaXYgY2xhc3M9InR3LWZsZXggdHctaC0xMCB0dy13LTEwIHR3LWl0ZW1zLWNlbnRlciB0dy1qdXN0aWZ5LWNlbnRlciB0dy1yb3VuZGVkLXhsIHR3LWJnLWluZGlnby01MCB0dy10ZXh0LWluZGlnby02MDAiPgogICAgICAgICAgICA8aSBjbGFzcz0iYmkgYmktZmlsZS1lYXJtYXJrLXppcCB0dy10ZXh0LXhsIj48L2k+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICAgIDxkaXY+CiAgICAgICAgICAgIDxoMyBjbGFzcz0idHctdGV4dC1sZyBzbTp0dy10ZXh0LXhsIHR3LWZvbnQtc2VtaWJvbGQgdHctbGVhZGluZy1yZWxheGVkIHR3LXRleHQtc2xhdGUtOTAwIj4KICAgICAgICAgICAgICB7eyBhY2NvdW50RGF0YS50aXRsZSB9fQogICAgICAgICAgICA8L2gzPgogICAgICAgICAgICA8cCBjbGFzcz0idHctdGV4dC14cyB0dy1sZWFkaW5nLXJlbGF4ZWQgdHctdGV4dC1zbGF0ZS01MDAgdHctbXQtMC41Ij4KICAgICAgICAgICAgICDor63kuYnnlZnlrZjor4TkvLDlj6PlvoTvvJok5L+h5oGv55WZ5a2Y546HID0gXGZyYWN75pyJ5pWI6K+t5LmJ5p2h55uufXvljp/lp4vkuovlrp7ooajovr59IFx0aW1lcyAxMDBcJSQKICAgICAgICAgICAgPC9wPgogICAgICAgICAgPC9kaXY+CiAgICAgICAgPC9kaXY+CgogICAgICAgIDwhLS0g5YWD5L+h5oGvIC0tPgogICAgICAgIDxkaXYgY2xhc3M9InR3LWZsZXggdHctZmxleC13cmFwIHR3LWl0ZW1zLWNlbnRlciB0dy1nYXAtMiI+CiAgICAgICAgICA8c3BhbiBjbGFzcz0idHctaW5saW5lLWZsZXggdHctaXRlbXMtY2VudGVyIHR3LXB4LTIuNSB0dy1weS0xIHR3LXJvdW5kZWQtZnVsbCB0dy10ZXh0LXhzIHR3LWZvbnQtbWVkaXVtIHR3LWJnLWluZGlnby01MCB0dy10ZXh0LWluZGlnby03MDAiPgogICAgICAgICAgICA8aSBjbGFzcz0iYmkgYmktaGFzaCB0dy1tci0xIj48L2k+e3sgYWNjb3VudERhdGEubWV0YS5rYklkIH19CiAgICAgICAgICA8L3NwYW4+CiAgICAgICAgICA8c3BhbiBjbGFzcz0idHctaW5saW5lLWZsZXggdHctaXRlbXMtY2VudGVyIHR3LXB4LTIuNSB0dy1weS0xIHR3LXJvdW5kZWQtZnVsbCB0dy10ZXh0LXhzIHR3LWZvbnQtbWVkaXVtIHR3LWJnLXNsYXRlLTEwMCB0dy10ZXh0LXNsYXRlLTYwMCI+CiAgICAgICAgICAgIDxpIGNsYXNzPSJiaSBiaS10YWctZmlsbCB0dy1tci0xIj48L2k+e3sgYWNjb3VudERhdGEubWV0YS52ZXJzaW9uIH19CiAgICAgICAgICA8L3NwYW4+CiAgICAgICAgICA8c3BhbiBjbGFzcz0idHctaW5saW5lLWZsZXggdHctaXRlbXMtY2VudGVyIHR3LXB4LTIuNSB0dy1weS0xIHR3LXJvdW5kZWQtZnVsbCB0dy10ZXh0LXhzIHR3LWZvbnQtbWVkaXVtIHR3LWJnLXNsYXRlLTEwMCB0dy10ZXh0LXNsYXRlLTYwMCI+CiAgICAgICAgICAgIDxpIGNsYXNzPSJiaSBiaS1maWxlLWVhcm1hcmstdGV4dCB0dy1tci0xIj48L2k+e3sgYWNjb3VudERhdGEubWV0YS5zb3VyY2UgfX0KICAgICAgICAgIDwvc3Bhbj4KICAgICAgICAgIDxzcGFuIGNsYXNzPSJ0dy1pbmxpbmUtZmxleCB0dy1pdGVtcy1jZW50ZXIgdHctcHgtMi41IHR3LXB5LTEgdHctcm91bmRlZC1mdWxsIHR3LXRleHQteHMgdHctZm9udC1tZWRpdW0gdHctYmctc2xhdGUtMTAwIHR3LXRleHQtc2xhdGUtNjAwIj4KICAgICAgICAgICAgPGkgY2xhc3M9ImJpIGJpLWNwdSB0dy1tci0xIj48L2k+e3sgYWNjb3VudERhdGEubWV0YS5jb252ZXJ0TW9kZSB9fQogICAgICAgICAgPC9zcGFuPgogICAgICAgICAgPHNwYW4gY2xhc3M9InR3LWlubGluZS1mbGV4IHR3LWl0ZW1zLWNlbnRlciB0dy1weC0yLjUgdHctcHktMSB0dy1yb3VuZGVkLWZ1bGwgdHctdGV4dC14cyB0dy1mb250LW1lZGl1bSB0dy1iZy1zbGF0ZS0xMDAgdHctdGV4dC1zbGF0ZS02MDAiPgogICAgICAgICAgICA8aSBjbGFzcz0iYmkgYmktdHJhbnNsYXRlIHR3LW1yLTEiPjwvaT57eyBhY2NvdW50RGF0YS5tZXRhLmxhbmd1YWdlIH19CiAgICAgICAgICA8L3NwYW4+CiAgICAgICAgPC9kaXY+CiAgICAgIDwvZGl2PgoKICAgICAgPCEtLSDovazmjaLmpoLov7AgKFN1bW1hcnkpIC0tPgogICAgICA8ZGl2IGNsYXNzPSJ0dy1tYi02IHR3LXAtNCB0dy1yb3VuZGVkLXhsIHR3LWJnLXNsYXRlLTUwIHR3LWJvcmRlciB0dy1ib3JkZXItc2xhdGUtMTAwIj4KICAgICAgICA8ZGl2IGNsYXNzPSJ0dy1mbGV4IHR3LWl0ZW1zLXN0YXJ0IHR3LWdhcC0yLjUiPgogICAgICAgICAgPGkgY2xhc3M9ImJpIGJpLWluZm8tY2lyY2xlIHR3LXRleHQtaW5kaWdvLTUwMCB0dy10ZXh0LWJhc2UgdHctbXQtMC41Ij48L2k+CiAgICAgICAgICA8ZGl2PgogICAgICAgICAgICA8aDQgY2xhc3M9InR3LXRleHQteHMgdHctZm9udC1zZW1pYm9sZCB0dy10ZXh0LXNsYXRlLTcwMCB0dy1tYi0xIj7ovazmjaLmpoLov7A8L2g0PgogICAgICAgICAgICA8cCBjbGFzcz0idHctdGV4dC14cyBzbTp0dy10ZXh0LXNtIHR3LWxlYWRpbmctcmVsYXhlZCB0dy10ZXh0LXNsYXRlLTYwMCI+CiAgICAgICAgICAgICAge3sgYWNjb3VudERhdGEuc3VtbWFyeSB9fQogICAgICAgICAgICA8L3A+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICA8L2Rpdj4KICAgICAgPC9kaXY+CgogICAgICA8IS0tIOacr+ivreihqCAoR2xvc3NhcnkpIC0tPgogICAgICA8ZGl2IHYtaWY9ImFjY291bnREYXRhLmdsb3NzYXJ5ICYmIGFjY291bnREYXRhLmdsb3NzYXJ5Lmxlbmd0aCIgY2xhc3M9InR3LW1iLTYiPgogICAgICAgIDxkaXYgY2xhc3M9InR3LWZsZXggdHctaXRlbXMtY2VudGVyIHR3LWdhcC0yIHR3LW1iLTMiPgogICAgICAgICAgPGkgY2xhc3M9ImJpIGJpLWJvb2staGFsZiB0dy10ZXh0LWluZGlnby01MDAgdHctdGV4dC1iYXNlIj48L2k+CiAgICAgICAgICA8aDQgY2xhc3M9InR3LXRleHQtc20gc206dHctdGV4dC1iYXNlIHR3LWZvbnQtc2VtaWJvbGQgdHctbGVhZGluZy1yZWxheGVkIHR3LXRleHQtc2xhdGUtODAwIj7mnK/or63ooag8L2g0PgogICAgICAgIDwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9InR3LWdyaWQgdHctZ3JpZC1jb2xzLTEgdHctZ2FwLTMiPgogICAgICAgICAgPGRpdgogICAgICAgICAgICB2LWZvcj0iKGcsIGlkeCkgaW4gYWNjb3VudERhdGEuZ2xvc3NhcnkiCiAgICAgICAgICAgIDprZXk9ImlkeCIKICAgICAgICAgICAgY2xhc3M9InR3LXAtMyB0dy1iZy13aGl0ZSB0dy1yb3VuZGVkLXhsIHR3LWJvcmRlciB0dy1ib3JkZXItc2xhdGUtMTAwIHR3LWZsZXggdHctZ2FwLTQgdHctaXRlbXMtc3RhcnQiCiAgICAgICAgICA+CiAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJ0dy1mb250LXNlbWlib2xkIHR3LXRleHQteHMgc206dHctdGV4dC1zbSB0dy10ZXh0LWluZGlnby02MDAgdHctYmctaW5kaWdvLTUwIHR3LXB4LTIgdHctcHktMC41IHR3LXJvdW5kZWQgdHctaC1maXQgdHctd2hpdGVzcGFjZS1ub3dyYXAiPgogICAgICAgICAgICAgIHt7IGcudGVybSB9fQogICAgICAgICAgICA8L3NwYW4+CiAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJ0dy10ZXh0LXhzIHNtOnR3LXRleHQtc20gdHctbGVhZGluZy1yZWxheGVkIHR3LXRleHQtc2xhdGUtNjAwIj4KICAgICAgICAgICAgICB7eyBnLmRlZmluaXRpb24gfX0KICAgICAgICAgICAgPC9zcGFuPgogICAgICAgICAgPC9kaXY+CiAgICAgICAgPC9kaXY+CiAgICAgIDwvZGl2PgoKICAgICAgPCEtLSDmoLjlv4Pkuovlrp4gLS0+CiAgICAgIDxkaXYgY2xhc3M9InR3LW1iLTYiPgogICAgICAgIDxkaXYgY2xhc3M9InR3LWZsZXggdHctaXRlbXMtY2VudGVyIHR3LWdhcC0yIHR3LW1iLTMiPgogICAgICAgICAgPGkgY2xhc3M9ImJpIGJpLWNoZWNrLWNpcmNsZS1maWxsIHR3LXRleHQtaW5kaWdvLTUwMCB0dy10ZXh0LWJhc2UiPjwvaT4KICAgICAgICAgIDxoNCBjbGFzcz0idHctdGV4dC1zbSBzbTp0dy10ZXh0LWJhc2UgdHctZm9udC1zZW1pYm9sZCB0dy1sZWFkaW5nLXJlbGF4ZWQgdHctdGV4dC1zbGF0ZS04MDAiPuaguOW/g+S6i+WunjwvaDQ+CiAgICAgICAgPC9kaXY+CiAgICAgICAgPGVsLXRhYmxlIDpkYXRhPSJhY2NvdW50RGF0YS5jb3JlRmFjdHMiIHNpemU9InNtYWxsIiBjbGFzcz0idHctdy1mdWxsIj4KICAgICAgICAgIDxlbC10YWJsZS1jb2x1bW4gcHJvcD0iaWQiIGxhYmVsPSJJRCIgd2lkdGg9IjcwIiAvPgogICAgICAgICAgPGVsLXRhYmxlLWNvbHVtbiBwcm9wPSJjb25kaXRpb24iIGxhYmVsPSLmnaHku7YiIG1pbi13aWR0aD0iMTQwIiAvPgogICAgICAgICAgPGVsLXRhYmxlLWNvbHVtbiBwcm9wPSJyZXN1bHQiIGxhYmVsPSLnu5PmnpwiIG1pbi13aWR0aD0iMjAwIiAvPgogICAgICAgICAgPGVsLXRhYmxlLWNvbHVtbiBwcm9wPSJzb3VyY2UiIGxhYmVsPSLmnaXmupAiIHdpZHRoPSIxMDAiIC8+CiAgICAgICAgICA8ZWwtdGFibGUtY29sdW1uIGxhYmVsPSLmoIfnrb4iIG1pbi13aWR0aD0iMTIwIj4KICAgICAgICAgICAgPHRlbXBsYXRlICNkZWZhdWx0PSJzY29wZSI+CiAgICAgICAgICAgICAgPGRpdiBjbGFzcz0idHctZmxleCB0dy1mbGV4LXdyYXAgdHctZ2FwLTEiPgogICAgICAgICAgICAgICAgPHNwYW4KICAgICAgICAgICAgICAgICAgdi1mb3I9InRhZyBpbiBzY29wZS5yb3cudGFncyIKICAgICAgICAgICAgICAgICAgOmtleT0idGFnIgogICAgICAgICAgICAgICAgICBjbGFzcz0idHctaW5saW5lLWJsb2NrIHR3LXRleHQteHhzIHR3LXB4LTEuNSB0dy1weS0wLjUgdHctYmctc2xhdGUtMTAwIHR3LXRleHQtc2xhdGUtNjAwIHR3LXJvdW5kZWQiCiAgICAgICAgICAgICAgICA+CiAgICAgICAgICAgICAgICAgIHt7IHRhZyB9fQogICAgICAgICAgICAgICAgPC9zcGFuPgogICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICA8L3RlbXBsYXRlPgogICAgICAgICAgPC9lbC10YWJsZS1jb2x1bW4+CiAgICAgICAgPC9lbC10YWJsZT4KICAgICAgPC9kaXY+CgogICAgICA8IS0tIOinhOWImeWIl+ihqCAtLT4KICAgICAgPGRpdiBjbGFzcz0idHctbWItNiI+CiAgICAgICAgPGRpdiBjbGFzcz0idHctZmxleCB0dy1pdGVtcy1jZW50ZXIgdHctZ2FwLTIgdHctbWItMyI+CiAgICAgICAgICA8aSBjbGFzcz0iYmkgYmktc2hpZWxkLWNoZWNrIHR3LXRleHQtaW5kaWdvLTUwMCB0dy10ZXh0LWJhc2UiPjwvaT4KICAgICAgICAgIDxoNCBjbGFzcz0idHctdGV4dC1zbSBzbTp0dy10ZXh0LWJhc2UgdHctZm9udC1zZW1pYm9sZCB0dy1sZWFkaW5nLXJlbGF4ZWQgdHctdGV4dC1zbGF0ZS04MDAiPuinhOWImTwvaDQ+CiAgICAgICAgPC9kaXY+CiAgICAgICAgPGVsLXRhYmxlIDpkYXRhPSJhY2NvdW50RGF0YS5ydWxlcyIgc2l6ZT0ic21hbGwiIGNsYXNzPSJ0dy13LWZ1bGwiPgogICAgICAgICAgPGVsLXRhYmxlLWNvbHVtbiBwcm9wPSJpZCIgbGFiZWw9IklEIiB3aWR0aD0iNzAiIC8+CiAgICAgICAgICA8ZWwtdGFibGUtY29sdW1uIHByb3A9InJ1bGUiIGxhYmVsPSLop4TliJkiIG1pbi13aWR0aD0iMjAwIiAvPgogICAgICAgICAgPGVsLXRhYmxlLWNvbHVtbiBwcm9wPSJleGNlcHRpb24iIGxhYmVsPSLkvovlpJYiIHdpZHRoPSIxMDAiIC8+CiAgICAgICAgICA8ZWwtdGFibGUtY29sdW1uIHByb3A9InNvdXJjZSIgbGFiZWw9Iuadpea6kCIgd2lkdGg9IjEyMCIgLz4KICAgICAgICA8L2VsLXRhYmxlPgogICAgICA8L2Rpdj4KCiAgICAgIDwhLS0g5bi46KeB6Zeu6aKYIC0tPgogICAgICA8ZGl2IGNsYXNzPSJ0dy1tYi02Ij4KICAgICAgICA8ZGl2IGNsYXNzPSJ0dy1mbGV4IHR3LWl0ZW1zLWNlbnRlciB0dy1nYXAtMiB0dy1tYi0zIj4KICAgICAgICAgIDxpIGNsYXNzPSJiaSBiaS1xdWVzdGlvbi1jaXJjbGUtZmlsbCB0dy10ZXh0LWluZGlnby01MDAgdHctdGV4dC1iYXNlIj48L2k+CiAgICAgICAgICA8aDQgY2xhc3M9InR3LXRleHQtc20gc206dHctdGV4dC1iYXNlIHR3LWZvbnQtc2VtaWJvbGQgdHctbGVhZGluZy1yZWxheGVkIHR3LXRleHQtc2xhdGUtODAwIj7luLjop4Hpl67popg8L2g0PgogICAgICAgIDwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9InR3LWdyaWQgdHctZ3JpZC1jb2xzLTEgc206dHctZ3JpZC1jb2xzLTIgdHctZ2FwLTMiPgogICAgICAgICAgPGRpdgogICAgICAgICAgICB2LWZvcj0iKGZhcUl0ZW0sIGluZGV4KSBpbiBhY2NvdW50RGF0YS5mYXEiCiAgICAgICAgICAgIDprZXk9ImluZGV4IgogICAgICAgICAgICBjbGFzcz0idHctcm91bmRlZC14bCB0dy1iZy1zbGF0ZS01MCB0dy1wLTMuNSB0dy1ib3JkZXIgdHctYm9yZGVyLXNsYXRlLTEwMCB0dy10cmFuc2l0aW9uLWFsbCB0dy1kdXJhdGlvbi0yMDAgaG92ZXI6dHctYmctd2hpdGUgaG92ZXI6dHctc2hhZG93LXNtIgogICAgICAgICAgPgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJ0dy1mbGV4IHR3LWl0ZW1zLWNlbnRlciB0dy1nYXAtMiB0dy1tYi0xLjUiPgogICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJ0dy10ZXh0LXh4cyB0dy1mb250LWJvbGQgdHctdGV4dC1pbmRpZ28tNjAwIHR3LWJnLWluZGlnby01MCB0dy1weC0xLjUgdHctcHktMC41IHR3LXJvdW5kZWQiPgogICAgICAgICAgICAgICAge3sgZmFxSXRlbS5pZCB9fQogICAgICAgICAgICAgIDwvc3Bhbj4KICAgICAgICAgICAgICA8cCBjbGFzcz0idHctdGV4dC14cyBzbTp0dy10ZXh0LXNtIHR3LWZvbnQtc2VtaWJvbGQgdHctbGVhZGluZy1yZWxheGVkIHR3LXRleHQtc2xhdGUtOTAwIj4KICAgICAgICAgICAgICAgIHt7IGZhcUl0ZW0ucXVlc3Rpb24gfX0KICAgICAgICAgICAgICA8L3A+CiAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICA8cCBjbGFzcz0idHctdGV4dC14cyBzbTp0dy10ZXh0LXNtIHR3LWxlYWRpbmctcmVsYXhlZCB0dy10ZXh0LXNsYXRlLTYwMCB0dy1wbC03IHR3LW1iLTIiPgogICAgICAgICAgICAgIHt7IGZhcUl0ZW0uYW5zd2VyIH19CiAgICAgICAgICAgIDwvcD4KICAgICAgICAgICAgPGRpdiBjbGFzcz0idHctcGwtNyB0dy1mbGV4IHR3LWZsZXgtd3JhcCB0dy1nYXAtMSI+CiAgICAgICAgICAgICAgPHNwYW4KICAgICAgICAgICAgICAgIHYtZm9yPSJ0YWcgaW4gZmFxSXRlbS50YWdzIgogICAgICAgICAgICAgICAgOmtleT0idGFnIgogICAgICAgICAgICAgICAgY2xhc3M9InR3LWlubGluZS1ibG9jayB0dy10ZXh0LXh4cyB0dy1weC0xLjUgdHctcHktMC41IHR3LWJnLXNsYXRlLTIwMC1jdXN0b20gdHctdGV4dC1zbGF0ZS02MDAgdHctcm91bmRlZCIKICAgICAgICAgICAgICA+CiAgICAgICAgICAgICAgICB7eyB0YWcgfX0KICAgICAgICAgICAgICA8L3NwYW4+CiAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgPC9kaXY+CiAgICAgICAgPC9kaXY+CiAgICAgIDwvZGl2PgoKICAgICAgPCEtLSDlhrLnqoHorrDlvZUgLS0+CiAgICAgIDxkaXYgY2xhc3M9InR3LW1iLTYiPgogICAgICAgIDxkaXYgY2xhc3M9InR3LWZsZXggdHctaXRlbXMtY2VudGVyIHR3LWdhcC0yIHR3LW1iLTMiPgogICAgICAgICAgPGkgY2xhc3M9ImJpIGJpLWV4Y2xhbWF0aW9uLXRyaWFuZ2xlLWZpbGwgdHctdGV4dC1hbWJlci01MDAgdHctdGV4dC1iYXNlIj48L2k+CiAgICAgICAgICA8aDQgY2xhc3M9InR3LXRleHQtc20gc206dHctdGV4dC1iYXNlIHR3LWZvbnQtc2VtaWJvbGQgdHctbGVhZGluZy1yZWxheGVkIHR3LXRleHQtc2xhdGUtODAwIj7lhrLnqoHorrDlvZU8L2g0PgogICAgICAgIDwvZGl2PgogICAgICAgIDxlbC10YWJsZSA6ZGF0YT0iYWNjb3VudERhdGEuY29uZmxpY3RzIiBzaXplPSJzbWFsbCIgY2xhc3M9InR3LXctZnVsbCI+CiAgICAgICAgICA8ZWwtdGFibGUtY29sdW1uIHByb3A9ImlkIiBsYWJlbD0iSUQiIHdpZHRoPSI3MCIgLz4KICAgICAgICAgIDxlbC10YWJsZS1jb2x1bW4gcHJvcD0idG9waWMiIGxhYmVsPSLkuLvpopgiIHdpZHRoPSIxMjAiIC8+CiAgICAgICAgICA8ZWwtdGFibGUtY29sdW1uIHByb3A9ImV4aXN0aW5nIiBsYWJlbD0i5bey5pyJ55+l6K+G5bqT6KGo6L+wIiBtaW4td2lkdGg9IjE2MCIgLz4KICAgICAgICAgIDxlbC10YWJsZS1jb2x1bW4gcHJvcD0iaW5jb21pbmciIGxhYmVsPSLljp/mlofooajov7AiIG1pbi13aWR0aD0iMTYwIiAvPgogICAgICAgICAgPGVsLXRhYmxlLWNvbHVtbiBwcm9wPSJyZXNvbHV0aW9uIiBsYWJlbD0i5aSE55CG5pa55byPIiBtaW4td2lkdGg9IjE2MCIgLz4KICAgICAgICAgIDxlbC10YWJsZS1jb2x1bW4gcHJvcD0iYmFzaXMiIGxhYmVsPSLkvp3mja4iIHdpZHRoPSIxNjAiIC8+CiAgICAgICAgPC9lbC10YWJsZT4KICAgICAgPC9kaXY+CgogICAgICA8IS0tIOW+heehruiupOmhuSAtLT4KICAgICAgPGRpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJ0dy1mbGV4IHR3LWl0ZW1zLWNlbnRlciB0dy1nYXAtMiB0dy1tYi0zIj4KICAgICAgICAgIDxpIGNsYXNzPSJiaSBiaS1ob3VyZ2xhc3Mtc3BsaXQgdHctdGV4dC1hbWJlci01MDAgdHctdGV4dC1iYXNlIj48L2k+CiAgICAgICAgICA8aDQgY2xhc3M9InR3LXRleHQtc20gc206dHctdGV4dC1iYXNlIHR3LWZvbnQtc2VtaWJvbGQgdHctbGVhZGluZy1yZWxheGVkIHR3LXRleHQtc2xhdGUtODAwIj7lvoXnoa7orqTpobk8L2g0PgogICAgICAgIDwvZGl2PgogICAgICAgIDxlbC10YWJsZSA6ZGF0YT0iYWNjb3VudERhdGEudG9Db25maXJtIiBzaXplPSJzbWFsbCIgY2xhc3M9InR3LXctZnVsbCI+CiAgICAgICAgICA8ZWwtdGFibGUtY29sdW1uIHByb3A9ImlkIiBsYWJlbD0iSUQiIHdpZHRoPSI3MCIgLz4KICAgICAgICAgIDxlbC10YWJsZS1jb2x1bW4gcHJvcD0iaXRlbSIgbGFiZWw9IuadoeebriIgd2lkdGg9IjE4MCIgLz4KICAgICAgICAgIDxlbC10YWJsZS1jb2x1bW4gcHJvcD0icmVhc29uIiBsYWJlbD0i5Y6f5ZugIiBtaW4td2lkdGg9IjIwMCIgLz4KICAgICAgICAgIDxlbC10YWJsZS1jb2x1bW4gcHJvcD0icHJpb3JpdHkiIGxhYmVsPSLkvJjlhYjnuqciIHdpZHRoPSIxMDAiPgogICAgICAgICAgICA8dGVtcGxhdGUgI2RlZmF1bHQ9InNjb3BlIj4KICAgICAgICAgICAgICA8c3BhbgogICAgICAgICAgICAgICAgOmNsYXNzPSJzY29wZS5yb3cucHJpb3JpdHkgPT09ICfpq5gnID8gJ3R3LXRleHQtcm9zZS02MDAgdHctYmctcm9zZS01MCcgOiAndHctdGV4dC1hbWJlci02MDAgdHctYmctYW1iZXItNTAnIgogICAgICAgICAgICAgICAgY2xhc3M9InR3LXB4LTIgdHctcHktMC41IHR3LXJvdW5kZWQgdHctdGV4dC14cyB0dy1mb250LW1lZGl1bSIKICAgICAgICAgICAgICA+CiAgICAgICAgICAgICAgICB7eyBzY29wZS5yb3cucHJpb3JpdHkgfX0KICAgICAgICAgICAgICA8L3NwYW4+CiAgICAgICAgICAgIDwvdGVtcGxhdGU+CiAgICAgICAgICA8L2VsLXRhYmxlLWNvbHVtbj4KICAgICAgICA8L2VsLXRhYmxlPgogICAgICA8L2Rpdj4KICAgIDwvZWwtY2FyZD4KICA8L2Rpdj4KPC90ZW1wbGF0ZT4KCjxzY3JpcHQ+CmV4cG9ydCBkZWZhdWx0IHsKICAibmFtZSI6ICJNaW5pS25vd2xlZGdlQmFzZVJlc3VsdCIsCiAgImRhdGEiOiBmdW5jdGlvbigpIHsKICAgIHJldHVybiB7CiAgICAgIGFjY291bnREYXRhOiB7CiAgICAgICAgInRpdGxlIjogIuaWh+aho+efpeivhuW6k+WOi+e8qei9rOaNoue7k+aenCIsCiAgICAgICAgIm1ldGEiOiB7CiAgICAgICAgICAia2JJZCI6ICJrYi1kb2MtMDAxIiwKICAgICAgICAgICJ2ZXJzaW9uIjogInYxLjAiLAogICAgICAgICAgInNvdXJjZSI6ICLljp/lp4vmlofmoaMiLAogICAgICAgICAgImNvbnZlcnRNb2RlIjogIuagvOW8j+WMluWOi+e8qSIsCiAgICAgICAgICAibGFuZ3VhZ2UiOiAiemgiLAogICAgICAgICAgImJ1ZGdldCI6ICJO5a2X5Lul5YaFIiwKICAgICAgICAgICJ1cGRhdGVkQXQiOiAi5b6F56Gu6K6kIgogICAgICAgIH0sCiAgICAgICAgInN1bW1hcnkiOiAi5pys55+l6K+G5bqT55Sx5Y+Z6L+w5oCn5pmu6YCa5paH5qGj57uP5Y675Zmq44CB5Y676YeN44CB57uT5p6E5YyW6YeN57uE5LiO6K+t5LmJ5Y6L57yp55Sf5oiQ77yM5p2h55uu6Ieq5YyF5ZCr5bm25bim57yW5Y+35LiO5qCH562+77yM5Y+v55u05o6l5rOo5YWl5aSn6K+t6KiA5qih5Z6L5LiK5LiL5paH5oiW5ZCR6YeP55+l6K+G5bqT44CCIiwKICAgICAgICAiZ2xvc3NhcnkiOiBbCiAgICAgICAgICB7InRlcm0iOiAi6K+t5LmJ5Y6L57ypIiwgImRlZmluaXRpb24iOiAi5LuF5Yig5YeP5YaX5L2Z6KGo6L6+44CB5LiN5Yig5YeP6K+t5LmJ5L+h5oGv55qE5YaF5a6557K+566A5pa55byPIn0KICAgICAgICBdLAogICAgICAgICJjb3JlRmFjdHMiOiBbCiAgICAgICAgICB7ImlkIjogIkYxIiwgImNvbmRpdGlvbiI6ICLovpPlhaXkuLrlj5nov7DmgKfmma7pgJrmlofmoaMiLCAicmVzdWx0IjogIuWOu+WZquOAgeWOu+mHjeW5tui9rOWMluS4uuadoeebruWMluefreWPpeeahOefpeivhuW6k+WGheWuuSIsICJzb3VyY2UiOiAi5Lu75Yqh6K+05piOIiwgInRhZ3MiOiBbIui9rOaNoua1geeoiyJdfSwKICAgICAgICAgIHsiaWQiOiAiRjIiLCAiY29uZGl0aW9uIjogIuaWh+aho+WMheWQq+aVsOWtl+OAgeaXpeacn+OAgeeJiOacrOOAgeS+i+WkluOAgeWQpuWumuivjSIsICJyZXN1bHQiOiAi5Y6f5qC35L+d55WZ77yM5LiN5b6X56+h5pS55oiW5qih57OK5YyWIiwgInNvdXJjZSI6ICLku7vliqHor7TmmI4iLCAidGFncyI6IFsi5L+h5oGv5L+d55yfIl19CiAgICAgICAgXSwKICAgICAgICAicnVsZXMiOiBbCiAgICAgICAgICB7ImlkIjogIlIxIiwgInJ1bGUiOiAi5Y6L57yp5LuF5Yig5YeP5YaX5L2Z6KGo6L6+77yM5LiN5Yig5YeP6K+t5LmJ5L+h5oGvIiwgImV4Y2VwdGlvbiI6ICLml6AiLCAic291cmNlIjogIuS7u+WKoeivtOaYjiJ9LAogICAgICAgICAgeyJpZCI6ICJSMiIsICJydWxlIjogIuS/neeVmeaVsOWtl+OAgeaXpeacn+OAgeeJiOacrOOAgeS+i+WkluOAgeWQpuWumuivjSIsICJleGNlcHRpb24iOiAi5pegIiwgInNvdXJjZSI6ICLku7vliqHor7TmmI4ifSwKICAgICAgICAgIHsiaWQiOiAiUjMiLCAicnVsZSI6ICLljrvph43lubblkIjlubblkIzkuYnmnaHnm64iLCAiZXhjZXB0aW9uIjogIuaXoCIsICJzb3VyY2UiOiAi5Lu75Yqh6K+05piOIn0sCiAgICAgICAgICB7ImlkIjogIlI0IiwgInJ1bGUiOiAi5q+P5Liq5p2h55uu6K+t5LmJ6Ieq5YyF5ZCr44CB5Y675oyH5LujIiwgImV4Y2VwdGlvbiI6ICLml6AiLCAic291cmNlIjogIuS7u+WKoeivtOaYjiJ9LAogICAgICAgICAgeyJpZCI6ICJSNSIsICJydWxlIjogIuS4jee8lumAoO+8jOS4jeehruWumuS/oeaBr+agh+WFpeW+heehruiupCIsICJleGNlcHRpb24iOiAi5pegIiwgInNvdXJjZSI6ICLku7vliqHor7TmmI4ifQogICAgICAgIF0sCiAgICAgICAgImZhcSI6IFsKICAgICAgICAgIHsiaWQiOiAiUTEiLCAicXVlc3Rpb24iOiAi5pmu6YCa5paH5qGj5aaC5L2V6L2s5o2i5Li655+l6K+G5bqT5YaF5a6577yfIiwgImFuc3dlciI6ICLnu4/ljrvlmarjgIHljrvph43jgIHnu5PmnoTljJbph43nu4TkuI7or63kuYnljovnvKnlkI7vvIzmjInmoIflh4bnn6Xor4blupPmqKHlnZfovpPlh7rluKbnvJblj7fkuI7moIfnrb7nmoTmnaHnm67ljJbnn63lj6XjgIIiLCAidGFncyI6IFsi6L2s5o2i5rWB56iLIl19LAogICAgICAgICAgeyJpZCI6ICJRMiIsICJxdWVzdGlvbiI6ICLmlofmoaPlhoXpg6jooajov7Dnn5vnm77ml7blpoLkvZXlpITnkIbvvJ8iLCAiYW5zd2VyIjogIuS7peabtOaYjuehruOAgeabtOaZmuWHuueOsOaIluabtOadg+WogeeahOihqOi/sOS4uuWHhu+8jOW5tuWcqCBjb25mbGljdHMg5Lit6K6w5b2V5Y+W6IiN5L6d5o2u44CCIiwgInRhZ3MiOiBbIuefm+ebvuWkhOeQhiJdfQogICAgICAgIF0sCiAgICAgICAgImNvbmZsaWN0cyI6IFsKICAgICAgICAgIHsiaWQiOiAiQzEiLCAidG9waWMiOiAi56S65L6L55+b55u+5Li76aKYIiwgImV4aXN0aW5nIjogIuaWh+aho+WJjeaWh+ihqOi/sCIsICJpbmNvbWluZyI6ICLmlofmoaPlkI7mlofooajov7AiLCAicmVzb2x1dGlvbiI6ICLku6XmlofmoaPlkI7mlofooajov7DkuLrlh4bvvIzlubbkv53nlZnnn5vnm77orrDlvZUiLCAiYmFzaXMiOiAi5pu05piO56Gu44CB5pu05pma5Ye6546w5oiW5pu05p2D5aiBIn0KICAgICAgICBdLAogICAgICAgICJ0b0NvbmZpcm0iOiBbCiAgICAgICAgICB7ImlkIjogIlQxIiwgIml0ZW0iOiAi6aKE566XIE4g55qE5YW35L2T5pWw5YC8IiwgInJlYXNvbiI6ICLovpPlhaXmnKrmj5DkvpsiLCAicHJpb3JpdHkiOiAi6auYIn0KICAgICAgICBdLAogICAgICAgICJidWRnZXQiOiAiTuWtl+S7peWGhSIKICAgICAgfSwKICAgICAgY29udGVudDoge30KICAgIH0gCiAgfSwKICBtb3VudGVkKCkgewogICAgaWYgKHR5cGVvZiBNYXRoSmF4ICE9PSAidW5kZWZpbmVkIiAmJiBNYXRoSmF4LnR5cGVzZXQpIHsKICAgICAgdGhpcy4kbmV4dFRpY2soKCkgPT4gewogICAgICAgIGxldCBlbGVtID0gdGhpcy4kcmVmcy5yb290Q29udGFpbmVySXRlbTsKICAgICAgICBpZiAoZWxlbSkgewogICAgICAgICAgTWF0aEpheC50eXBlc2V0KFtlbGVtXSk7CiAgICAgICAgfQogICAgICB9KTsKICAgIH0KICB9Cn0KPC9zY3JpcHQ+Cgo8c3R5bGUgc2NvcGVkPgoubWluaS1rbm93bGVkZ2UtYmFzZS1yZXN1bHQgOmRlZXAoLmVsLWNhcmRfX2JvZHkpIHsKICBwYWRkaW5nOiAyMHB4Owp9CgpAbWVkaWEgKG1pbi13aWR0aDogNzY4cHgpIHsKICAubWluaS1rbm93bGVkZ2UtYmFzZS1yZXN1bHQgOmRlZXAoLmVsLWNhcmRfX2JvZHkpIHsKICAgIHBhZGRpbmc6IDI0cHggMjhweDsKICB9Cn0KCi8qID09PT09IOihqOagvOe7n+S4gOmjjuagvCA9PT09PSAqLwoubWluaS1rbm93bGVkZ2UtYmFzZS1yZXN1bHQgOmRlZXAoLmVsLXRhYmxlKSB7CiAgLS1lbC10YWJsZS1ib3JkZXItY29sb3I6IHRyYW5zcGFyZW50OwogIC0tZWwtdGFibGUtaGVhZGVyLWJnLWNvbG9yOiAjZjhmYWZjOwogIC0tZWwtdGFibGUtaGVhZGVyLXRleHQtY29sb3I6ICM2NDc0OGI7CiAgLS1lbC10YWJsZS10ZXh0LWNvbG9yOiAjMzM0MTU1OwogIC0tZWwtdGFibGUtcm93LWhvdmVyLWJnLWNvbG9yOiAjZjFmNWY5OwogIGZvbnQtc2l6ZTogMTNweDsKICBib3JkZXI6IDFweCBzb2xpZCAjZjFmNWY5OwogIGJvcmRlci1yYWRpdXM6IDEycHg7CiAgb3ZlcmZsb3c6IGhpZGRlbjsKfQoKLm1pbmkta25vd2xlZGdlLWJhc2UtcmVzdWx0IDpkZWVwKC5lbC10YWJsZSB0aC5lbC10YWJsZV9fY2VsbCkgewogIGJhY2tncm91bmQtY29sb3I6ICNmOGZhZmM7CiAgZm9udC1zaXplOiAxMnB4OwogIGZvbnQtd2VpZ2h0OiA2MDA7CiAgbGV0dGVyLXNwYWNpbmc6IDAuMDJlbTsKICBjb2xvcjogIzY0NzQ4YjsKICBwYWRkaW5nOiAxMHB4IDA7Cn0KCi5taW5pLWtub3dsZWRnZS1iYXNlLXJlc3VsdCA6ZGVlcCguZWwtdGFibGUgdGQuZWwtdGFibGVfX2NlbGwpIHsKICBwYWRkaW5nOiAxMHB4IDA7CiAgY29sb3I6ICMzMzQxNTU7CiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNmMWY1Zjk7Cn0KCi5taW5pLWtub3dsZWRnZS1iYXNlLXJlc3VsdCA6ZGVlcCguZWwtdGFibGUgdGguZWwtdGFibGVfX2NlbGwgPiAuY2VsbCksCi5taW5pLWtub3dsZWRnZS1iYXNlLXJlc3VsdCA6ZGVlcCguZWwtdGFibGUgdGQuZWwtdGFibGVfX2NlbGwgPiAuY2VsbCkgewogIHBhZGRpbmctbGVmdDogMTRweDsKICBwYWRkaW5nLXJpZ2h0OiAxNHB4OwogIGxpbmUtaGVpZ2h0OiAxLjY7Cn0KCi5taW5pLWtub3dsZWRnZS1iYXNlLXJlc3VsdCA6ZGVlcCguZWwtdGFibGUgdHI6bGFzdC1jaGlsZCB0ZC5lbC10YWJsZV9fY2VsbCkgewogIGJvcmRlci1ib3R0b206IG5vbmU7Cn0KCi5taW5pLWtub3dsZWRnZS1iYXNlLXJlc3VsdCA6ZGVlcCguZWwtdGFibGU6OmJlZm9yZSksCi5taW5pLWtub3dsZWRnZS1iYXNlLXJlc3VsdCA6ZGVlcCguZWwtdGFibGVfX2lubmVyLXdyYXBwZXI6OmJlZm9yZSkgewogIGRpc3BsYXk6IG5vbmU7Cn0KCi5taW5pLWtub3dsZWRnZS1iYXNlLXJlc3VsdCA6ZGVlcCguZWwtdGFibGVfX2VtcHR5LXRleHQpIHsKICBjb2xvcjogIzljYTNhZjsKICBmb250LXNpemU6IDEzcHg7Cn0KCi8qID09PT09IOiHquWumuS5iei+heWKqeagt+W8jyA9PT09PSAqLwoudHctdGV4dC14eHMgewogIGZvbnQtc2l6ZTogMTBweDsKICBsaW5lLWhlaWdodDogMTRweDsKfQoudHctYmctc2xhdGUtMjAwLWN1c3RvbSB7CiAgYmFja2dyb3VuZC1jb2xvcjogI2UyZThmMDsKfQo8L3N0eWxlPgpgYGA="
									}
								},
      exampleList: [
        {
          name: "新建知识库",
          description:
            "无已有知识库时，从原文提取核心事实、规则和 FAQ，生成迷你知识库。",
          icon: "🆕",
        },
        {
          name: "增量合并",
          description:
            "将新原文与已有迷你知识库合并，输出版本更新后的 Markdown 知识库。",
          icon: "🔄",
        },
        {
          name: "冲突记录",
          description:
            "原文与已有知识库冲突时，以原文为准并保留冲突主题、双方表述与解决方式。",
          icon: "⚠️",
        },
        {
          name: "预算控制",
          description:
            "在不超过 N 字的预算内合并知识库，优先保留高价值事实与规则。",
          icon: "📏",
        },
        {
          name: "待确认项",
          description:
            "识别原文缺失、不确定或需人工确认的信息，集中列入待确认模块。",
          icon: "❓",
        },
        {
          name: "问答去重",
          description: "合并同义 FAQ，去重后输出通用问题和答案。",
          icon: "🧹",
        },
      ],
      loadingProgressApp: {
        className: "ElementVueItem",
        task: {
          template: "/webApps/document/aigcLoading.vue",
        },
      },
      feedbackDialog: {
        visible: false,
        placeholder: "输入问题描述或建议内容。",
        message: "",
      },
      interface: {
        sendFeedback: {
          url: "https://transweb.cn/user/sendFeedback",
          method: "post",
        },
      },
      styleIndex: "",
      content: {
        inputText: "",
        outputText: "",
      },
      inputPlaceholder: "必填：原文文本。可选/建议：已有迷你知识库、预算 N 字、版本号、更新方式、来源标注要求、冲突处理偏好。已有知识库为空则从原文生成；非空则默认增量合并；预算 N 未提供时在 toConfirm 中标注。",
      description: "",
      query: {"documentId":"e1cc02d291dc495858e1bd6eb1d0269c"},
      accountData: {},
      flag: WebTool.adjustSize([false, false, true]),
      isSolo: WebTool.urlQuery(location.href, "solo"),
      defaultTemplate: "",
      dataEditable: true,
      title: "迷你知识库增量合并内容结构",
      introduce: "定义将原文增量合并进已有迷你知识库后交付的 Markdown 内容结构。",
      icon: "📚"
    };
},"computed":{"myAccept":function () {
      return `.html, .md, .txt, .doc, .docx, .pdf, .ppt, .pptx, .xlsx, .xls, .csv`;
    },"viewMode":function () {
      return !this.modifyEnabled && !!this.currentVersionIndex;
    },"resultPanelHeight":function () {
      let ret = "";
      if (this.isSolo || this.content.isSolo) {
        if (this.step === 1) {
          ret = "100%";
        } else {
          ret = "calc( 100% - 165px )";
        }
      } else {
        if (this.step === 1) {
          ret = "calc( 100% - 50px )";
        } else {
          ret = "calc( 100% - 170px )";
        }
      }

      return ret;
    },"documentId":function () {
      let documentId = this.query.documentId;
      if (
        !documentId &&
        webCpu.currentCard.task &&
        webCpu.currentCard.task.vueItem &&
        webCpu.currentCard.task.vueItem.documentMeta
      ) {
        documentId = webCpu.currentCard.task.vueItem.documentMeta.documentId;
      }
      return documentId;
    },"currentTips":function () {
      let ret = this.waitingText;
      if (this.loading) {
        ret = this.loadingText;
      } else if (this.description || this.content.inputText) {
        ret = this.gettedTips;
      } else {
      }

      return ret;
    }},"methods":{"startModify":function () {
      this.$confirm(
        "当前版本为历史版本，是否基于当前版本进行修改？",
        webCpu.messages[lang].confirmDialogTitle,
        {
          confirmButtonText: webCpu.messages[lang].confirmYes,
          cancelButtonText: webCpu.messages[lang].confirmNo,
          type: "warning",
        }
      )
        .then(() => {
          this.modifyEnabled = true;
          // let tJson = WebTool.extractJSON(
          //   this.versionList[this.currentVersionIndex].result
          // );
          // this.updateResult(tJson);
        })
        .catch(() => {
          // 取消操作
        });
    },"checkDiff":function (index) {
      let e = window.event;
      e.stopPropagation();
      e.preventDefault();
      let style = {
        width: "100%",
        height: "100%",
      };
      let versionA = this.versionList[this.currentVersionIndex].result;
      let versionB = this.versionList[index].result;
      let baseContent = JSON.stringify(this.accountData);
      let elem = this.$refs.loadingEffectArea;
      let confirmCallback = () => {
        let content = diffCheckApp.card.task.vueItem.generateNewVersion();
        let currentId = MurmurHash.rule(baseContent, 31);
        let tId = MurmurHash.rule(JSON.stringify(content), 31);
        if (tId !== currentId) {
          this.confirmContent(content);
        } else {
          this.$message({
            type: "info",
            message: "内容没有变更。",
          });
        }
        webCpu.CardItem.dismissMask(elem);
      };
      let closeCallback = () => {
        let content = diffCheckApp.card.task.vueItem.generateNewVersion();
        let currentId = MurmurHash.rule(baseContent, 31);
        let tId = MurmurHash.rule(JSON.stringify(content), 31);
        if (tId !== currentId) {
          this.$confirm(
            "检测到有内容变更，是否生成新版本？",
            webCpu.messages[lang].confirmDialogTitle,
            {
              confirmButtonText: webCpu.messages[lang].confirmYes,
              cancelButtonText: webCpu.messages[lang].confirmNo,
              type: "warning",
            }
          ).then(() => {
            this.confirmContent(content);
          });
        }
        webCpu.CardItem.dismissMask(elem);
      };
      let diffCheckApp = {
        className: "ElementVueItem",
        task: {
          template: "https://transweb.cn/transweb/diffCheckApp.vue",
          data: {
            versionA: WebTool.extractJSON(versionA),
            versionB: WebTool.extractJSON(versionB),
          },
          style: {
            width: "100%",
            height: "100%",
            overflow: "auto",
          },
        },
      };

      webCpu.renderCardDialog(
        elem,
        diffCheckApp,
        {
          dialogName: "checkDiffDialog",
          title: "版本差异检查",
          closeType: "back",
          titleStyle: {
            background: "var(--el-color-primary-light-9)",
            color: "var(--el-color-primary)",
          },
          menu: [
            {
              label: "确认",
              action: confirmCallback,
            },
          ],
          closeCallback: closeCallback,
        },
        style,
        {
          padding: "20px 30px 20px 30px",
        }
      );
    },"updateVersionList":function (versionId, callback) {
      versionId = versionId || JSON.stringify(this.accountData);
      aigcInterface.getHistoryVersion(versionId, (tData) => {
        if (tData && tData.ret === 0) {
          tData.data = tData.data || [];
          if (tData.data.length > 0) {
            this.versionList = tData.data.sort((a, b) => {
              return b._time - a._time;
            });
            for (let i = 0; i < this.versionList.length; i++) {
              let item = this.versionList[i];
              let jsonStr = JSON.stringify(WebTool.extractJSON(item.result));
              let temp = JSON.stringify(this.accountData);
              if (this.currentVersion === item.versionId || jsonStr === temp) {
                this.currentVersionIndex = i;
                this.currentVersion = "";
                break;
              }
            }
            if (typeof callback === "function") {
              callback();
            }
          } else {
            this.accountData = this.accountData || {};
            aigcInterface.recordDataVersion(this.accountData, "", (tData) => {
              console.log(tData);
              let content = JSON.stringify(this.accountData);
              this.updateVersionList(content);
              this.currentVersionIndex = 0;
              if (typeof callback === "function") {
                callback();
              }
            });
          }
        }
      });
    },"getVersionLabel":function (item) {
      if (!item || !item.versionId) {
        return false;
      }
      let str = item.versionId.slice(0, 5);
      str = `${str}@${new Date(item._time).toLocaleString()}`;
      return str;
    },"handleVersionChange":function (index) {
      this.versionList = this.versionList || [];
      console.log(index, this.versionList[index]);
      if (this.versionList[index] && this.versionList[index].result) {
        this.isStreaming = true;
        this.switchResultStatus(this.versionList[index].result, true);
        this.currentVersionIndex = index;
        this.modifyEnabled = false;
      }
    },"handleConfirm":function () {
      // 1. 获取并清理输入，防止纯空格绕过校验
      const requirement = this.modifyInfo?.trim();

      if (!requirement) {
        this.$message({
          type: "warning",
          message: "需要输入变更描述。",
        });
        return false;
      }

      // 2. 结构化 Prompt 模板，加入强制约束
      const promptContext = `
你是一个严谨的数据处理助手。请根据【修改需求】修改【原始数据】，并严格遵守【输出要求】。

【修改需求】
${requirement}

【原始数据】
${JSON.stringify(this.accountData)}

【输出要求】
1. 必须输出修改后的完整内容，保持原有的格式和层级结构完全一致。
2. 绝对不允许删减、折叠或省略【原始数据】中未要求修改的任何字段和细节。
3. 仅输出最终结果，不要包含任何开场白、解释性废话，也不要输出 Markdown 代码块标记（如 \`\`\` 等）。
`.trim();

      // 3. 执行生成
      this.modifyGenerate({
        documentId: this.query.documentId,
        context: promptContext,
      });
    },"triggerFileInput":function (e) {
      e = e || window.event;
      e.stopPropagation();
      e.preventDefault();
      this.$refs.hiddenFileInput.click();
    },"confirmTransfer":function (text) {
      this.$confirm(
        "文件中内容结构 Agent 所支持不一致，是否生成相应结构化内容？",
        webCpu.messages[lang].confirmDialogTitle,
        {
          confirmButtonText: webCpu.messages[lang].confirmYes,
          cancelButtonText: webCpu.messages[lang].confirmNo,
          type: "warning",
        }
      ).then(() => {
        this.content.inputText = text;
        this.handleGenerate();
      });
    },"checkDataStruct":function (json, template) {
      template = WebTool.base64ToUtf8(template);
      let obj = webCpu.getDslObj(template) || {};
      let data = typeof obj.data === "function" ? obj.data().accountData : {};
      let ret = Object.keys(json) === Object.keys(data);
      return ret;
    },"onFileSelected":async function (event) {
      const file = event.target.files[0];
      if (!file) return;
      this.readingFile = true;
      let arr = file.name.split(".");
      let subfix = arr[arr.length - 1];

      if (subfix !== "html" && subfix !== "text" && subfix !== "md") {
        let temp = await WebTool.extractTextFromFile(file);
        this.confirmTransfer(temp);
        this.readingFile = false;
        event.target.value = "";
        return true;
      }

      const reader = new FileReader();
      // 读取为文本
      reader.onload = (e) => {
        let text = e.target.result;

        if (subfix === "html") {
          let d = WebTool.extractAppTaskData(text);
          if (d && d.data && d.data.accountData) {
            this.isStreaming = true;
            let tData = d.data.accountData || d.data;
            this.switchResultStatus(tData);
          } else {
            this.confirmTransfer(text);
          }
        } else {
          let json = WebTool.markdownToObject(text);
          let ret = this.checkDataStruct(
            json,
            this.currentAppItem.task.template
          );
          if (json && ret) {
            this.isStreaming = true;
            this.switchResultStatus(json);
          } else {
            this.confirmTransfer(text);
          }
        }

        this.readingFile = false;
      };
      // ⚠️ 关键：按文本读取
      reader.readAsText(file, "utf-8");
      event.target.value = "";
    },"openFeedbackDialog":function () {
      this.feedbackDialog.visible = true;
    },"confirmSendFeedback":function () {
      let tempData = JSON.parse(JSON.stringify(this.accountData));
      if (!this.feedbackDialog.message.trim()) {
        this.$message({
          type: "warning",
          message: "需要输入有效问题描述。",
        });
        return false;
      }
      tempData.feedback = this.feedbackDialog.message;
      tempData.documentId = this.query.documentId;
      this.feedbackDialog.visible = false;
      this.adapter.sendFeedback(tempData, (tData) => {
        this.$message({
          type: "success",
          message: "感谢反馈！",
        });
      });
    },"handleContentCommand":function (type) {
      let params = this.accountData;
      if (type === "htmlDownload") {
        this.downloadHtmlItem({
          content: JSON.stringify(params),
          name: params.name || params.title,
          template: this.currentAppItem.task.template,
        });
      } else if (type === "markdownDownload") {
        this.downloadMarkdown(params);
      } else if (type === "readLocal") {
        this.triggerFileInput();
      } else if (type == "imageDownload") {
        this.downloadImageItem();
      } else if (type === "copyLink") {
        this.copyLink();
      } else {
        this.openContentEditor();
      }
    },"copyLink":function () {
      let documentId = this.documentId;
      let dataId = this.versionList[this.currentVersionIndex]._id;
      let url =
        location.origin +
        "?solo=true&dataView=true&dataId=" +
        dataId +
        "&id=" +
        documentId;
      WebTool.copyString(url);
      this.$message({
        type: "success",
        message: "链接已复制到剪贴板。",
      });
    },"downloadImageItem":function () {
      let elem = $(this.$refs.resultComponentItem).find(
        ".ElementVueItem._task_container>div>div"
      )[0];
      if (!elem) {
        this.$message({
          type: "warning",
          message: "当前结果不支持导出图片。",
        });
        return false;
      } else {
        let name = this.accountData.name || this.accountData.title || "result";
        WebTool.transformImage(elem, name, "png", {
          download: true,
        });
      }
    },"searchContent":function (str) {
      let index = -1;
      if (typeof str === "object") {
        str = JSON.stringify(str);
      }
      for (let i = 0; i < this.versionList.length; i++) {
        let item = this.versionList[i];
        let result = JSON.stringify(WebTool.extractJSON(item.result));
        if (result === str) {
          index = i;
          break;
        }
      }
      return index;
    },"confirmContent":function (content) {
      let index = this.searchContent(content);
      let tContent = JSON.stringify(this.accountData);
      this.accountData = content;
      if (index === -1) {
        aigcInterface.recordDataVersion(content, tContent, (tData) => {
          console.log(tData);
          this.$message({
            type: "success",
            message: "已生成新版本。",
          });
          this.updateResult(content);
          this.updateVersionList(content);
          this.currentVersionIndex = 0;
        });
      } else {
        this.$message({
          type: "warning",
          message: "修改后与一个历史版本内容一致。",
        });
        this.$confirm(
          "修改后与一个历史版本内容一致，是否切换到该版本？",
          webCpu.messages[lang].confirmDialogTitle,
          {
            confirmButtonText: webCpu.messages[lang].confirmYes,
            cancelButtonText: webCpu.messages[lang].confirmNo,
            type: "warning",
          }
        ).then(() => {
          let tJson = WebTool.extractJSON(this.versionList[index].result);
          this.updateResult(tJson);
          this.accountData = content;
          this.currentVersionIndex = index;
        });
      }
    },"openContentEditor":function () {
      let elem = this.$refs.loadingEffectArea;
      let mdString = WebTool.objectToMarkdown(this.accountData);
      let app = {
        className: "CodeEditor",
        dsl: {
          changeCallback: function (dd) {},
          data: mdString,
          options: {
            lineNumbers: true,
            value: "",
            mode: "markdown",
          },
        },
      };

      let baseContent = JSON.stringify(this.accountData);
      let confirmCallback = () => {
        let content = WebTool.markdownToObject(app.card.task.data);
        let currentId = MurmurHash.rule(baseContent, 31);
        let tId = MurmurHash.rule(content, 31);
        if (tId !== currentId) {
          this.confirmContent(content);
        } else {
          this.$message({
            type: "info",
            message: "内容没有变更。",
          });
        }
        webCpu.CardItem.dismissMask(elem);
      };
      let copyScript = () => {
        let script = app.card.task.data;
        WebTool.copyString(script);
        this.$message({
          type: "success",
          message: "复制成功",
        });
      };
      let menu = [
        {
          label: "复制",
          action: copyScript,
        },
        {
          label: "确认",
          action: confirmCallback,
        },
      ];
      if (this.viewMode) {
        menu.length = 1;
      }
      webCpu.CardItem.renderCardDialog(
        elem,
        app,
        {
          title: "编辑内容",
          titleStyle: {
            background: "var(--el-color-primary-light-9)",
            color: "var(--el-color-primary)",
          },
          closeType: "back",
          dialogName: "codeEditorDialog",
          menu: menu,
        },
        {
          width: "100%",
          height: "100%",
        }
      );
    },"downloadMarkdown":function (params) {
      let md = WebTool.objectToMarkdown(params);
      let name = params.name || params.title + ".md";
      WebTool.downloadString(md, name);
    },"downloadHtmlItem":function (params) {
      let adapter = webCpu.initAdapter({
        getTemplate: {
          url: "https://transweb.cn/transweb/components/ElementVueItem/example.html",
          method: "get",
          dataType: "text",
        },
      });
      adapter.getTemplate({}, (html) => {
        let documentId =
          this.query.documentId ||
          webCpu.currentCard.task.vueItem.documentMeta.documentId;
        let name = params.name || params.title;
        params.agentName = document.title;
        params.creator =
          webCpu.currentCard.task.vueItem.currentSettings.creator || "匿名用户";
        params.createTime = new Date().toLocaleString();
        params.userName = localStorage.userName || "匿名用户";
        params.agentUrl = location.origin + "?solo=true&id=" + documentId;
        html = html.bindData(params);
        name = name + ".html";
        WebTool.downloadString(html, name);
      });
    },"dismissLoadingStatus":function () {
      this.loading = false;
      let elem = this.$refs.loadingEffectArea;
      if (!this.isSolo && !this.content.isSolo) {
        elem = this.$refs.resultComponentItem;
      }
      webCpu.CardItem.dismissMask(elem);
    },"switchLoadingStatus":function (str) {
      this.step = 1;
      this.loading = true;
      this.$nextTick(() => {
        let elem = this.$refs.loadingEffectArea;
        if (!this.isSolo && !this.content.isSolo) {
          elem = this.$refs.resultComponentItem;
        }
        let app = JSON.parse(JSON.stringify(this.loadingProgressApp));
        webCpu.CardItem.renderCardDialog(
          elem,
          app,
          {
            dialogName: "progressDialog",
            headerHidden: true,
            style: {
              background: "transparent",
            },
          },
          {
            background: "transparent",
            marginTop: "-5px",
          }
        );
        this.currentTipsItem = app;
      });
    },"switchResultStatus":function (fullContent, flag) {
      if (!this.isStreaming) {
        return false;
      }
      this.dismissLoadingStatus();
      this.loading = false;
      this.step = 1;
      this.abortController = null;
      this.isStreaming = false;
      this.$nextTick(() => {
        let count = 0;
        try {
          let parsed = fullContent;
          if (typeof fullContent === "string") {
            parsed = WebTool.extractJSON(fullContent);
          }
          this.accountData = parsed;
          this.content.outputText = JSON.stringify(parsed);
          this.$nextTick(() => {
            if (!flag && this.dataEditable) {
              this.updateVersionList(this.content.outputText, () => {
                this.updateResult(parsed);
              });
            } else {
              this.updateResult(parsed);
            }
          });
        } catch (e) {
          this.goBack(true);
          if (count < 5) {
            this.handleGenerate();
            this.$message({
              type: "warning",
              message: "生成的内容格式不正确，正在重试...",
            });
            count++;
          } else {
            this.$message({
              type: "warning",
              message: "生成的内容格式不正确，请稍后再试",
            });
          }
        }
      });
    },"goBack":function (flag) {
      if (flag) {
        this._goBack();
      } else {
        this.$confirm(
          "退出后无法恢复，确定退出吗？",
          webCpu.messages[lang].confirmDialogTitle,
          {
            confirmButtonText: webCpu.messages[lang].confirmYes,
            cancelButtonText: webCpu.messages[lang].confirmNo,
            type: "warning",
          }
        ).then(() => {
          this._goBack();
        });
      }
    },"_goBack":function () {
      if (
        this.abortController &&
        typeof this.abortController.abort === "function"
      ) {
        this.abortController.abort();
      }
      this.step = 0;
      this.accountData = {};
      this.isStreaming = false;
      this.dismissLoadingStatus();
    },"updateResult":function (json) {
      let app = JSON.parse(JSON.stringify(this.currentAppItem));
      delete app.card;
      let elem = this.$refs.resultComponentItem;
      aigcInterface.updateResultView(json, app, elem, this.content);
    },"updateLoadingTips":function (result) {
      if (
        this.currentTipsItem &&
        this.currentTipsItem.card &&
        this.currentTipsItem.card.task
      ) {
        this.currentTipsItem.card.task.vueItem =
          this.currentTipsItem.card.task.vueItem || {};
        this.currentTipsItem.card.task.vueItem.result = result;
      }
    },"inputExampleText":function (item) {
      this.content.inputText = item.name || "";
      if (item.description) {
        this.content.inputText = item.name + ": " + item.description;
      }
    },"confirmGenerate":async function (query) {
      this.responseText = "";
      this.switchLoadingStatus();
      this.isStreaming = true;
      this.versionList = [];
      this.abortController = await aigcInterface.streamRequest(query, {
        immediateFinish: true,
        onMessage: (message) => {
          this.responseText = message;
          this.updateLoadingTips(message);
        },
        onStreamFinished: (result) => {
          this.switchResultStatus(result);
          this.content.outputText = result;
          this.versionList = [];
        },
        onError: (e) => {
          this.handleErrorCase();
        },
        onAction: (action) => {
          if (action === "stop") {
            this._goBack();
          } else if (action === "LOGIN") {
            aigcInterface.openLoginDialog(document.body, () => {
              this.confirmGenerate(query);
            });
            this.goBack(true);
          } else if (action === "RECHARGE") {
            aigcInterface.renderRechargeDialog(document.body);
            this.goBack(true);
          } else {
          }
        },
      });
    },"handleErrorCase":function () {
      this.$message({
        type: "warning",
        message: "请求出现异常，请重新尝试。",
      });
      this.goBack(true);
    },"handleGenerate":function () {
      if (!this.currentFile && !this.content.inputText) {
        this.$message({
          type: "warning",
          message: "需要输入具体需求描述。",
        });
        return false;
      }

      let query = this.query || {};
      query.context = this.content.inputText;
      query.documentId =
        query.documentId ||
        webCpu.currentCard.task.vueItem.documentMeta.documentId;
      if (this.currentFile) {
        WebTool.compressAndResizeBase64(
          this.currentFile,
          this.size,
          this.size,
          1
        ).then((base64) => {
          query.image = base64 || "";
          this.aigcRequest(query);
        });
      } else {
        if (location.host.includes("transweb.cn")) {
          this.confirmGenerate(query);
        } else {
          this.aigcRequest(query);
        }
      }
    },"aigcRequest":function (query, flag) {
      this.switchLoadingStatus();
      this.isStreaming = true;
      this.versionList = [];
      aigcInterface.requestPrompt(
        query.context,
        query.documentId,
        query,
        (content) => {
          this.responseText = content || "";
          this.content.outputText = this.responseText;
          this.switchResultStatus(this.responseText);
          this.versionList = [];
        },
        (e) => {
          this._goBack();
        }
      );
    },"modifyGenerate":function (query) {
      this.modifyLoading = true;
      query.documentId =
        query.documentId ||
        webCpu.currentCard.task.vueItem.documentMeta.documentId;
      query.baseContent = JSON.stringify(this.accountData);
      aigcInterface.requestPrompt(
        query.context,
        query.documentId,
        query,
        (content) => {
          this.modifyLoading = false;
          this.responseText = content || "";
          this.content.outputText = this.responseText;
          this.isStreaming = true;
          this.switchResultStatus(this.responseText);
        },
        (e) => {
          this.$message({
            type: "warning",
            message: "请求出现异常，请重新尝试。",
          });
          this.modifyLoading = false;
          this._goBack();
        }
      );
    }},"appMap":{"loginRegItem":{"url":"/mainApp/app/loginRegItem.js","key":"transweb_loginRegItem","cardName":"loginRegCard","dsl":{"data":{"position":"top","loginedMenu":[{"label":"⏱️ 历史记录","action":function (d, callback) {
                dialogMap.openDocumentApp(
                  webCpu.appConfig.aigcHistory,
                  {
                    data: {
                      content: {
                        isSolo: true,
                      },
                      query: {
                        documentId: webCpu.currentVueItem.query.documentId,
                      },
                    },
                  },
                  {
                    title: "⏱️ 历史记录",
                    callback: callback,
                  },
                  {
                    width: "100%",
                    height: "100%",
                  }
                );
              }}]}}}},"mounted":async function () {
    this.content = this.content || {};
    this.adapter = webCpu.initAdapter(this.interface);
    let auto = WebTool.urlQuery(location.href, "auto");
    let caseUrl = WebTool.urlQuery(location.href, "caseUrl");
    let dataId = WebTool.urlQuery(location.href, "dataId");

    if (this.accountData && Object.keys(this.accountData).length !== 0) {
      this.isStreaming = true;
      this.switchResultStatus(this.accountData);
    } else if (caseUrl) {
      this.isStreaming = true;
      let d = await WebTool.fetchHtmlDataSmart(caseUrl);
      this.switchResultStatus(d.data);
    } else if (dataId) {
      aigcInterface.getDataItem(
        dataId,
        (result, tData) => {
          this.isStreaming = true;
          this.currentVersion = tData.versionId;
          this.dataEditable =
            tData.folderName + "" === localStorage.folderName &&
            !WebTool.urlQuery(location.href, "dataView");
          this.switchResultStatus(result);
        },
        (err) => {
          this.$message({
            type: "warning",
            message: "获取数据失败，暂时没有权限访问。",
          });
        }
      );
    } else {
      aigcInterface.handleAgentInput(location.href, (str) => {
        this.content.inputText = str;
        if (auto) {
          this.handleGenerate();
        }
      });
    }
  }};</script>
