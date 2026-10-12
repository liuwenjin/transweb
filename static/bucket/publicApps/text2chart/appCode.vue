<template data-edit-id="1">
  <div
    class="tw-relative tw-px-3 tw-pt-3 wizard-bg tw-flex tw-flex-col tw-items-center tw-w-full tw-h-full"
    ref="rootComponentContainer"
    data-edit-id="2"
  >
    <div
      v-if="(isSolo || content.isSolo) && dataEditable"
      class="wizard-navbar tw-flex tw-pt-2 tw-px-1 tw-items-center tw-justify-between tw-max-w-7xl tw-mx-auto tw-pb-6 tw-w-full"
      data-edit-id="100"
    >
      <div
        :style="{ width: flag && step !== 0 ? '100%' : '' }"
        class="tw-flex tw-items-center tw-gap-3 logoInfoArea"
        data-edit-id="101"
      >
        <h3
          class="tw-text-2xl tw-text-[#1A1A1E] tw-tracking-tight tw-m-0 tw-font-medium logo-title tw-w-full"
          data-edit-id="102"
        >
          <slot v-if="step === 0" data-edit-id="292">
            <div
              style="background-color: var(--academic-accent)"
              class="tw-w-10 tw-h-10 tw-text-center tw-bg-academic-primary tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-transition-transform group-hover:tw-scale-110"
              data-edit-id="409"
            >
              <span
                class="tw-text-white tw-font-bold tw-w-24"
                data-edit-id="410"
                >{{ icon || "∑" }}</span
              >
            </div>
            <span class="logo-text" data-edit-id="242">
              <span class="title-text" data-edit-id="368">{{ title }}</span>
              <span class="slogn-text" data-edit-id="369">{{ introduce }}</span>
            </span>
          </slot>
          <slot v-else data-edit-id="308">
            <span
              title="返回"
              class="goBackBtn"
              @click="goBack()"
              data-edit-id="295"
            >
              <el-icon data-edit-id="384">
                <arrow-left-bold data-edit-id="385" />
              </el-icon>
            </span>
            <slot
              v-if="
                accountData && Object.keys(accountData).length && !isStreaming
              "
              data-edit-id="357"
            >
              <el-dropdown
                @command="handleContentCommand"
                style="vertical-align: middle"
                :teleported="false"
                append-to="parent"
                trigger="click"
                data-edit-id="400"
              >
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
                <el-tag class="versionIndexSpan"
                  >最近第 {{ currentVersionIndex + 1 }} 个版本
                </el-tag>
                <el-button
                  class="startModifyBtn"
                  size="small"
                  text
                  type="primary"
                  @click="startModify"
                  >开始修改</el-button
                >
              </slot>
              <el-input
                :style="{ width: flag ? '300px' : '300px' }"
                v-model="modifyInfo"
                v-else
                placeholder="输入变更描述..."
                class="custom-input-group"
                clearable
                @keyup.enter="handleConfirm"
                data-edit-id="342"
              >
                <template #append>
                  <el-button
                    :loading="modifyLoading"
                    :disabled="modifyLoading"
                    style="color: #fff"
                    class="!tw-bg-[#1A1A1E] !tw-border-[#1A1A1E] !tw-text-white transition-all duration-300 wizard-action-btn wizard-action-btn--primary"
                    @click="handleConfirm"
                  >
                    <span class="font-medium px-2">
                      <i class="bi bi-magic"></i>
                    </span>
                  </el-button>
                </template>
              </el-input>
            </slot>
            <span v-else style="font-size: 14px"> {{ title }}</span>
            <span
              class="versionListArea"
              style="float: right; margin-right: 10px"
              v-if="versionList && versionList.length !== 0 && !isStreaming"
            >
              <el-dropdown
                @command="handleVersionChange"
                trigger="click"
                :teleported="false"
                append-to="parent"
                style="vertical-align: middle"
                v-if="step === 1"
                data-edit-id="400"
              >
                <el-button text type="primary" data-edit-id="312">
                  版本
                  <el-icon class="el-icon--right" data-edit-id="402">
                    <arrow-down data-edit-id="403" />
                  </el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <slot v-for="(item, index) in versionList">
                      <el-dropdown-item
                        :style="{
                          fontWeight: index === currentVersionIndex ? 800 : 300,
                        }"
                        :command="index"
                        class="tw-justify-between"
                      >
                        <slot v-if="index === currentVersionIndex">
                          {{ getVersionLabel(item) }}
                        </slot>
                        <slot v-else>
                          {{ getVersionLabel(item) }}
                          <el-button
                            style="margin-left: 5px"
                            @click.stop="checkDiff(index)"
                            size="small"
                            >对比</el-button
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
        <div
          appName="loginRegItem"
          component="CardItem"
          class="tw-opacity-100 refined-user-card"
          :style="{
            width: '135px',
            marginLeft: '15px',
            height: '30px',
            borderLeft: 'solid 1px #ddd',
          }"
          :documentId="query ? query.documentId : ''"
          data-edit-id="104"
        ></div>
      </div>
    </div>

    <div
      ref="loadingEffectArea"
      style="height: 100%; position: relative; z-index: 0"
      class="tw-max-w-7xl tw-y-full tw-mx-auto tw-w-full"
      data-edit-id="3"
    >
      <!-- 输入控制面板 -->
      <div
        v-if="step === 0"
        class="wizard-input-panel tw-relative tw-bg-white tw-border tw-border-[#EBEBEF] tw-rounded-2xl tw-shadow-sm tw-p-5 tw-transition-all hover:tw-shadow-md"
        data-edit-id="4"
      >
        <div
          class="tw-flex tw-flex-col md:tw-flex-row tw-gap-5 tw-items-stretch"
        >
          <div
            class="tw-flex-1 tw-flex tw-flex-col tw-justify-between tw-min-w-0"
          >
            <div class="input-spell-box tw-w-full" data-edit-id="122">
              <el-input
                :placeholder="inputPlaceholder"
                :rows="4"
                resize="none"
                v-model="content.inputText"
                type="textarea"
                class="feature-input tw-w-full"
                data-edit-id="131"
              ></el-input>
            </div>

            <div class="tw-flex tw-items-center tw-flex-wrap tw-gap-2 tw-mt-4">
              <span
                v-if="!flag"
                class="tw-text-sm tw-text-[#86868B] tw-font-medium tw-whitespace-nowrap"
              >
                试试看：
              </span>
              <button
                v-for="d in exampleList"
                :key="d.title || d.name"
                @click="inputExampleText(d)"
                class="example-chip tw-group tw-flex tw-items-center tw-gap-1.5 tw-px-3 tw-py-1.5 tw-text-[13px] tw-bg-[#F8F8FA] hover:tw-bg-[#F3F3F5] hover:tw-text-[#1A1A1E] tw-text-[#6E6E73] tw-rounded-lg tw-transition-colors tw-whitespace-nowrap active:tw-scale-95"
              >
                <span class="chip-icon">{{ d.icon || "" }}</span>
                <span>{{ d.name }}</span>
              </button>
            </div>
          </div>

          <div class="tw-h-px md:tw-hidden tw-bg-[#F3F3F5] tw-w-full"></div>
          <div
            class="tw-hidden md:tw-block tw-w-px tw-bg-[#F3F3F5] tw-my-1 tw-self-stretch"
          ></div>

          <div
            class="aigcOptionArea tw-flex tw-flex-row md:tw-flex-col tw-justify-between md:tw-justify-end tw-gap-3 tw-w-full md:tw-w-32 tw-shrink-0"
          >
            <el-button
              :style="{ marginTop: flag ? '5px' : '' }"
              type="primary"
              :disabled="!content.inputText && !description"
              :loading="loading"
              @click="handleGenerate"
              class="cast-spell-btn tw-flex-1 md:tw-flex-none tw-mt-6 tw-h-10 tw-shadow-sm"
              data-edit-id="11"
            >
              <i
                class="bi bi-lightning-charge-fill tw-mr-1.5"
                data-edit-id="12"
              ></i>
              立即生成
            </el-button>

            <el-button
              v-if="!flag"
              text
              type="info"
              :loading="readingFile"
              :disabled="readingFile"
              @click="triggerFileInput"
              class="tw-flex-1 md:tw-flex-none tw-justify-center tw-h-10 hover:!tw-bg-[#F3F3F5] tw-text-[#6E6E73] tw-mt-8"
            >
              <i class="bi bi-folder2-open tw-mr-1"></i>
              本地读档
            </el-button>
          </div>
        </div>
      </div>
      <span
        v-if="!(isSolo || content.isSolo) && step === 1 && dataEditable"
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
        data-edit-id="357"
      >
        <span
          title="返回"
          class="goBackBtn"
          @click="goBack()"
          data-edit-id="295"
        >
          <el-icon data-edit-id="384">
            <arrow-left-bold data-edit-id="385" />
          </el-icon>
        </span>
        <span
          class="versionListArea"
          style="float: left"
          v-if="versionList && versionList.length !== 0 && !isStreaming"
        >
          <el-dropdown
            @command="handleVersionChange"
            trigger="click"
            :teleported="false"
            append-to="parent"
            v-if="step === 1"
            data-edit-id="400"
          >
            <el-button text type="primary" data-edit-id="312">
              版本
              <el-icon class="el-icon--right" data-edit-id="402">
                <arrow-down data-edit-id="403" />
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <slot v-for="(item, index) in versionList">
                  <el-dropdown-item
                    class="tw-justify-between"
                    :command="index"
                    :style="{
                      fontWeight: index === currentVersionIndex ? 800 : 300,
                    }"
                  >
                    <slot v-if="index === currentVersionIndex">
                      {{ getVersionLabel(item) }}
                    </slot>
                    <slot v-else>
                      {{ getVersionLabel(item) }}
                      <el-button
                        style="margin-left: 5px"
                        @click.stop="checkDiff(index)"
                        size="small"
                        >对比</el-button
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
          <el-dropdown
            @command="handleContentCommand"
            trigger="click"
            :teleported="false"
            append-to="parent"
            data-edit-id="400"
          >
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
            <el-tag class="versionIndexSpan"
              >最近第 {{ currentVersionIndex + 1 }} 个版本
            </el-tag>
            <el-button
              class="startModifyBtn"
              text
              type="primary"
              size="small"
              @click="startModify"
              >开始修改</el-button
            >
          </slot>
          <el-input
            v-else
            :style="{ width: flag ? '260px' : '400px' }"
            v-model="modifyInfo"
            placeholder="输入变更描述..."
            class="custom-input-group"
            clearable
            @keyup.enter="handleConfirm"
            data-edit-id="342"
          >
            <template #append>
              <el-button
                :loading="modifyLoading"
                :disabled="modifyLoading"
                style="color: #fff"
                class="!tw-bg-[#1A1A1E] !tw-border-[#1A1A1E] !tw-text-white transition-all duration-300 wizard-action-btn wizard-action-btn--primary"
                @click="handleConfirm"
              >
                <span class="font-medium px-2"
                  ><i class="bi bi-magic"></i
                ></span>
              </el-button>
            </template>
          </el-input>
        </slot>
      </span>
      <!-- 结果展示面板 -->
      <div
        class="wizard-result-panel tw-overflow-hidden"
        :style="{
          height: resultPanelHeight,
          'margin-top': '0px',
          zIndex: 0,
        }"
        data-edit-id="110"
      >
        <div
          v-if="step === 1"
          data-edit-id="117"
          class="resultComponentArea tw-w-full tw-relative"
          ref="resultComponentItem"
        ></div>
        <div
          v-else
          class="tw-flex-1 tw-w-full tw-text-center tw-py-20 tw-flex tw-flex-col tw-items-center"
          data-edit-id="112"
        >
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
    <el-dialog
      v-model="feedbackDialog.visible"
      title="反馈与建议"
      width="500"
      draggable
    >
      <el-input
        type="textarea"
        :placeholder="feedbackDialog.placeholder"
        v-model="feedbackDialog.message"
        resize="none"
      ></el-input>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="feedbackDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="confirmSendFeedback()">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
    <input
      ref="hiddenFileInput"
      type="file"
      :accept="myAccept"
      class="tw-hidden"
      @change="onFileSelected($event)"
      data-edit-id="109"
    />
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
  --academic-text-tertiary: #a5a5aa;

  /* 强调：琥珀金 */
  --academic-accent: #6E6E73;
  --academic-accent-soft: rgba(110, 110, 115, 0.10);

  /* 辅助 */
  --academic-border: #e7e7eb;
  --academic-border-strong: #e7e7eb;

  /* 玻璃面板 */
  --glass-bg: rgba(255, 255, 255, 0.88);
  --glass-shadow: 0 1px 2px rgba(26, 26, 30, 0.02),
    0 24px 48px -24px rgba(26, 26, 30, 0.08);
  --glass-shadow-hover: 0 2px 4px rgba(26, 26, 30, 0.03),
    0 32px 64px -28px rgba(26, 26, 30, 0.12);

  /* 圆角 */
  --radius-card: 12px;
  --radius-control: 4px;

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
  border-radius: 12px;
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
  border-radius: 4px !important;
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
  font-weight: 400;
  font-family: "Source Han Serif SC", "Noto Serif SC", "Songti SC", "STSong", serif;
  display: block;
  color: var(--academic-text);
  letter-spacing: 0.04em;
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
  box-shadow: 0 2px 6px rgba(26, 26, 30, 0.16), 0 1px 2px rgba(26, 26, 30, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.18) !important;
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
  box-shadow: 0 6px 18px rgba(26, 26, 30, 0.2),
    0 2px 5px rgba(26, 26, 30, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
}

.cast-spell-btn[active="true"] {
  background: var(--academic-primary-active) !important;
}

.cast-spell-btn:active {
  transform: translateY(0px) scale(0.99) !important;
  background: var(--academic-primary-active) !important;
  box-shadow: 0 1px 3px rgba(26, 26, 30, 0.16),
    inset 0 1px 2px rgba(0, 0, 0, 0.08) !important;
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
  filter: drop-shadow(0 0 6px rgba(26, 26, 30, 0.22))
    drop-shadow(0 0 14px rgba(26, 26, 30, 0.1)) !important;
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
  border-radius: 4px !important;
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
  border-radius: 4px 0 0 4px !important;
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
  border-radius: 0 4px 4px 0 !important;
  box-shadow: none !important;
  border: none !important;
}

.custom-input-group .el-input-group__append .el-button {
  border-radius: 0 4px 4px 0 !important;
  background: var(--academic-primary) !important;
  border: 1px solid var(--academic-primary) !important;
  color: #fff !important;
  font-family: var(--font-system) !important;
  font-weight: 500 !important;
  margin: 0 !important;
  height: 100% !important;
  box-shadow: 0 1px 2px rgba(26, 26, 30, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.16) !important;
  transition: all 0.18s ease !important;
}

.custom-input-group .el-input-group__append .el-button:hover {
  background: var(--academic-primary-hover) !important;
  border-color: var(--academic-primary-hover) !important;
  box-shadow: 0 3px 8px rgba(26, 26, 30, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.18) !important;
}

/* ============================================
   Element Plus 覆盖 — 下拉弹层
   ============================================ */
.el-select-dropdown {
  background: rgba(255, 255, 255, 0.96) !important;
  border: 1px solid var(--academic-border) !important;
  border-radius: 12px !important;
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
  background: #e7e7eb;
  border-radius: 99px;
  transition: background 0.2s ease;
}

.wizard-result-panel ::-webkit-scrollbar-thumb:hover {
  background: #c9c9cf;
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

/* ============================================
   白与空 · 规范增补（:deep 穿透 / selection / 过渡）
   ============================================ */
.wizard-bg ::selection {
  background: #1a1a1e;
  color: #fafafc;
}

:deep(.el-button--primary:not(.is-text):not(.is-link):not(.is-plain)) {
  background: #1a1a1e !important;
  border-color: #1a1a1e !important;
  border-radius: 3px !important;
  color: #fff !important;
  transition: transform 0.3s cubic-bezier(0.2, 0.7, 0.2, 1),
    box-shadow 0.3s ease !important;
}

:deep(.el-button--primary:not(.is-text):not(.is-link):not(.is-plain):hover) {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  border-radius: 4px !important;
  box-shadow: 0 0 0 1px #e7e7eb inset !important;
  transition: box-shadow 0.3s cubic-bezier(0.2, 0.7, 0.2, 1) !important;
}

:deep(.el-input__wrapper:hover),
:deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px #c9c9cf inset !important;
}

:deep(.el-input__wrapper.is-focus),
:deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #1a1a1e inset !important;
}
</style>

<script>
export default {
  name: "",
  data: function () {
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
          template:
            "data:text/plain;charset=utf-8;base64,PHRlbXBsYXRlPgogIDxkaXYgaWQ9InJvb3RDb250YWluZXJJdGVtIiByZWY9InJvb3RDb250YWluZXJJdGVtIiBjbGFzcz0idHctcmVsYXRpdmUgdHctcC02IHR3LWJnLXNsYXRlLTUwIHR3LWgtZnVsbCB0dy1mbGV4IHR3LWZsZXgtY29sIj4KICAgIDwhLS0g5aS06YOo5bel5YW35qCPIC0tPgogICAgPGRpdiBjbGFzcz0idHctZmxleCB0dy1mbGV4LWNvbCBzbTp0dy1mbGV4LXJvdyBzbTp0dy1pdGVtcy1jZW50ZXIgdHctanVzdGlmeS1iZXR3ZWVuIHR3LWdhcC00Ij4KICAgICAgPGRpdiBjbGFzcz0idHctZmxleCB0dy1pdGVtcy1jZW50ZXIgdHctZ2FwLTMiPgogICAgICAgIDxkaXYgY2xhc3M9InR3LWZsZXggdHctaXRlbXMtY2VudGVyIHR3LWdhcC0yIj4KICAgICAgICAgIDxoMiBjbGFzcz0idHctdGV4dC14bCB0dy1mb250LWJvbGQgdHctbGVhZGluZy1yZWxheGVkIHR3LXRleHQtc2xhdGUtOTAwIj4KICAgICAgICAgICAge3sgYWNjb3VudERhdGEudGl0bGUgfX0KICAgICAgICAgIDwvaDI+CiAgICAgICAgICA8c3BhbiBjbGFzcz0idHctcHgtMi41IHR3LXB5LTAuNSB0dy1iZy1pbmRpZ28tNTAgdHctdGV4dC1pbmRpZ28tNjAwIHR3LXRleHQteHMgdHctcm91bmRlZC1mdWxsIHR3LWZvbnQtbW9ubyB0dy1sZWFkaW5nLXJlbGF4ZWQiPgogICAgICAgICAgICB7eyBhY2NvdW50RGF0YS50eXBlIH19CiAgICAgICAgICA8L3NwYW4+CiAgICAgICAgPC9kaXY+CiAgICAgIDwvZGl2PgoKICAgICAgPCEtLSDlj7PkuIrop5LmjqfliLbkuI7lr7zlh7rmjInpkq7nu4QgLS0+CiAgICAgIDxkaXYgY2xhc3M9InR3LWZsZXggdHctaXRlbXMtY2VudGVyIHR3LWdhcC0yIj4KICAgICAgICA8IS0tIOe8qeaUvuS4jumHjee9ruaOp+WItiAtLT4KICAgICAgICA8ZGl2IGNsYXNzPSJ0dy1mbGV4IHR3LWl0ZW1zLWNlbnRlciB0dy1iZy13aGl0ZSB0dy1ib3JkZXIgdHctYm9yZGVyLXNsYXRlLTIwMCB0dy1yb3VuZGVkLWxnIHR3LXAtMSB0dy1zaGFkb3ctc20iPgogICAgICAgICAgPGJ1dHRvbiBAY2xpY2s9Inpvb21PdXQiIGNsYXNzPSJ0dy1weC0yIHR3LXB5LTEgdHctdGV4dC1zbGF0ZS02MDAgaG92ZXI6dHctYmctc2xhdGUtMTAwIHR3LXJvdW5kZWQgdHctdGV4dC14cyIgdGl0bGU9Iue8qeWwjyI+LTwvYnV0dG9uPgogICAgICAgICAgPHNwYW4gY2xhc3M9InR3LXB4LTIgdHctdGV4dC14cyB0dy10ZXh0LXNsYXRlLTUwMCB0dy1mb250LW1vbm8iPnt7IE1hdGgucm91bmQoem9vbUxldmVsICogMTAwKSB9fSU8L3NwYW4+CiAgICAgICAgICA8YnV0dG9uIEBjbGljaz0iem9vbUluIiBjbGFzcz0idHctcHgtMiB0dy1weS0xIHR3LXRleHQtc2xhdGUtNjAwIGhvdmVyOnR3LWJnLXNsYXRlLTEwMCB0dy1yb3VuZGVkIHR3LXRleHQteHMiIHRpdGxlPSLmlL7lpKciPis8L2J1dHRvbj4KICAgICAgICAgIDxidXR0b24gQGNsaWNrPSJyZXNldFZpZXciIGNsYXNzPSJ0dy1weC0yIHR3LXB5LTEgdHctdGV4dC1zbGF0ZS01MDAgaG92ZXI6dHctYmctc2xhdGUtMTAwIHR3LXJvdW5kZWQgdHctdGV4dC14cyB0dy1tbC0xIiB0aXRsZT0i6YeN572u5L2N572u5LiO57yp5pS+Ij7ph43nva48L2J1dHRvbj4KICAgICAgICA8L2Rpdj4KCiAgICAgICAgPCEtLSDlr7zlh7rmjInpkq4gLS0+CiAgICAgICAgPGJ1dHRvbiBAY2xpY2s9ImV4cG9ydFN2ZyIgY2xhc3M9InR3LXB4LTMgdHctcHktMS41IHR3LWJnLXdoaXRlIHR3LWJvcmRlciB0dy1ib3JkZXItc2xhdGUtMjAwIHR3LXRleHQtc2xhdGUtNzAwIGhvdmVyOnR3LWJnLXNsYXRlLTUwIHR3LXRleHQteHMgdHctZm9udC1tZWRpdW0gdHctcm91bmRlZC1sZyB0dy1zaGFkb3ctc20iPgogICAgICAgICAg5a+85Ye6IFNWRwogICAgICAgIDwvYnV0dG9uPgogICAgICAgIDxidXR0b24gQGNsaWNrPSJleHBvcnRQbmciIGNsYXNzPSJ0dy1weC0zIHR3LXB5LTEuNSB0dy1iZy1pbmRpZ28tNjAwIHR3LXRleHQtd2hpdGUgaG92ZXI6dHctYmctaW5kaWdvLTcwMCB0dy10ZXh0LXhzIHR3LWZvbnQtbWVkaXVtIHR3LXJvdW5kZWQtbGcgdHctc2hhZG93LXNtIj4KICAgICAgICAgIOWvvOWHuiBQTkcKICAgICAgICA8L2J1dHRvbj4KICAgICAgPC9kaXY+CiAgICA8L2Rpdj4KCiAgICA8IS0tIOWbvuihqOeUu+W4g+WMuuWfn++8iOaUr+aMgem8oOagh+aLluaLveW5s+enu+S4jua7mui9rue8qeaUvu+8iSAtLT4KICAgIDxkaXYgY2xhc3M9InR3LWZsZXgtMSB0dy1tdC0zIHR3LXJlbGF0aXZlIHR3LW92ZXJmbG93LWhpZGRlbiB0dy1yb3VuZGVkLWxnIHR3LWJnLXdoaXRlIHR3LWN1cnNvci1ncmFiIGFjdGl2ZTp0dy1jdXJzb3ItZ3JhYmJpbmciIEBtb3VzZWRvd249InN0YXJ0RHJhZyIgQG1vdXNlbW92ZT0ib25EcmFnIiBAbW91c2V1cD0ic3RvcERyYWciIEBtb3VzZWxlYXZlPSJzdG9wRHJhZyIgQHdoZWVsLnByZXZlbnQ9ImhhbmRsZVdoZWVsIj4KICAgICAgPGRpdiByZWY9InN2Z1dyYXBwZXIiIHYtaHRtbD0iY3VycmVudFN2ZyIgY2xhc3M9InR3LXctZnVsbCB0dy1oLWZ1bGwgdHctZmxleCB0dy1pdGVtcy1jZW50ZXIgdHctanVzdGlmeS1jZW50ZXIiIDpzdHlsZT0ieyAKICAgICAgICAgIHRyYW5zZm9ybTogYHRyYW5zbGF0ZSgke3RyYW5zbGF0ZVh9cHgsICR7dHJhbnNsYXRlWX1weCkgc2NhbGUoJHt6b29tTGV2ZWx9KWAsCiAgICAgICAgICB0cmFuc2Zvcm1PcmlnaW46ICdjZW50ZXIgY2VudGVyJywKICAgICAgICAgIHRyYW5zaXRpb246IGlzRHJhZ2dpbmcgPyAnbm9uZScgOiAndHJhbnNmb3JtIDAuMXMgZWFzZS1vdXQnCiAgICAgICAgfSI+PC9kaXY+CiAgICA8L2Rpdj4KICA8L2Rpdj4KPC90ZW1wbGF0ZT4KCjxzY3JpcHQ+CiAgZXhwb3J0IGRlZmF1bHQgewogICAgbmFtZTogIlByb2Nlc3NWaXN1YWxpemF0aW9uRGFzaGJvYXJkIiwKICAgIGRhdGEoKSB7CiAgICAgIHJldHVybiB7CiAgICAgICAgYWNjb3VudERhdGE6IHsKICAgICAgICAgIHR5cGU6ICJtZXJtYWlkIiwKICAgICAgICAgIHRpdGxlOiAi5bGV56S66K+35YGH5a6h5om55rWB56iLIiwKICAgICAgICAgIGNvZGU6ICJmbG93Y2hhcnQgVERcbiAgQVvmj5DkuqTnlLPor7ddIC0tPiBCe+S4u+euoeWuoeaJuX1cbiAgQiAtLT585ZCM5oSPfCBDW0hS5aSH5qGIXVxuICBCIC0tPnzpqbPlm558IERb5L+u5pS56YeN5aGrXVxuICBDIC0tPiBFW+a1geeoi+e7k+adn10iCiAgICAgICAgfSwKICAgICAgICBjdXJyZW50U3ZnOiAiIiwKICAgICAgICB6b29tTGV2ZWw6IDEsCiAgICAgICAgLy8g5ouW5Yqo5bmz56e75Z2Q5qCHCiAgICAgICAgdHJhbnNsYXRlWDogMCwKICAgICAgICB0cmFuc2xhdGVZOiAwLAogICAgICAgIGlzRHJhZ2dpbmc6IGZhbHNlLAogICAgICAgIHN0YXJ0WDogMCwKICAgICAgICBzdGFydFk6IDAKICAgICAgfTsKICAgIH0sCiAgICBtb3VudGVkKCkgewogICAgICB0aGlzLiRuZXh0VGljaygoKSA9PiB7CiAgICAgICAgaWYgKHR5cGVvZiBNYXRoSmF4ICE9PSAidW5kZWZpbmVkIiAmJiBNYXRoSmF4LnR5cGVzZXQpIHsKICAgICAgICAgIE1hdGhKYXgudHlwZXNldChbdGhpcy4kcmVmcy5yb290Q29udGFpbmVySXRlbV0pOwogICAgICAgIH0KICAgICAgICB0aGlzLnVwZGF0ZUNoYXJ0SXRlbSgpOwogICAgICB9KTsKICAgIH0sCiAgICBtZXRob2RzOiB7CiAgICAgIGFzeW5jIHVwZGF0ZUNoYXJ0SXRlbSgpIHsKICAgICAgICBjb25zdCBjb2RlID0gdGhpcy5hY2NvdW50RGF0YT8uY29kZT8udHJpbSgpOwogICAgICAgIGNvbnN0IHR5cGUgPSB0aGlzLmFjY291bnREYXRhPy50eXBlIHx8ICdtZXJtYWlkJzsKCiAgICAgICAgLy8gMS4g6Ziy56m65qCh6aqMCiAgICAgICAgaWYgKCFjb2RlKSB7CiAgICAgICAgICB0aGlzLmN1cnJlbnRTdmcgPSAnJzsKICAgICAgICAgIHJldHVybjsKICAgICAgICB9CgogICAgICAgIHRoaXMuaXNMb2FkaW5nID0gdHJ1ZTsKICAgICAgICB0cnkgewogICAgICAgICAgLy8g5aSN55So5a6i5oi356uv5a6e5L6L77yM5bm26YWN572u5ZCO56uv5Luj55CG6Lev5b6ECiAgICAgICAgICB0aGlzLmtyb2tpQ2xpZW50ID0gdGhpcy5rcm9raUNsaWVudCB8fCBuZXcgS3Jva2lDbGllbnQoewogICAgICAgICAgICBiYXNlVXJsOiAnaHR0cHM6Ly90cmFuc3dlYi5jbi91c2VyL2tyb2tpUGlwZVByb3h5JwogICAgICAgICAgfSk7CgogICAgICAgICAgLy8gMi4g6Kem5Y+R6I635Y+W77ya5a6e6ZmF5Y+R5Ye6IFBPU1QgL3VzZXIva3Jva2lQaXBlUHJveHk/dHlwZT1tZXJtYWlkJmZvcm1hdD1zdmcKICAgICAgICAgIHRoaXMuY3VycmVudFN2ZyA9IGF3YWl0IHRoaXMua3Jva2lDbGllbnQuZmV0Y2hTdmdDb2RlKGNvZGUsIHR5cGUpOwogICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7CiAgICAgICAgICBjb25zb2xlLmVycm9yKCdbS3Jva2ldIOWbvuihqOa4suafk+Wksei0pTonLCBlcnJvcik7CiAgICAgICAgICB0aGlzLmN1cnJlbnRTdmcgPSAnJzsgLy8g5Y+v5Zyo5q2k5aSE5pu/5o2i5Li66buY6K6k6ZSZ6K+v5Y2g5L2NIFNWRwogICAgICAgIH0gZmluYWxseSB7CiAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlOwogICAgICAgIH0KICAgICAgfSwKCiAgICAgIC8vIOe8qeaUvumAu+i+kQogICAgICB6b29tSW4oKSB7CiAgICAgICAgaWYgKHRoaXMuem9vbUxldmVsIDwgMykgdGhpcy56b29tTGV2ZWwgKz0gMC4xNTsKICAgICAgfSwKICAgICAgem9vbU91dCgpIHsKICAgICAgICBpZiAodGhpcy56b29tTGV2ZWwgPiAwLjMpIHRoaXMuem9vbUxldmVsIC09IDAuMTU7CiAgICAgIH0sCiAgICAgIGhhbmRsZVdoZWVsKGUpIHsKICAgICAgICBpZiAoZS5kZWx0YVkgPCAwKSB7CiAgICAgICAgICB0aGlzLnpvb21JbigpOwogICAgICAgIH0gZWxzZSB7CiAgICAgICAgICB0aGlzLnpvb21PdXQoKTsKICAgICAgICB9CiAgICAgIH0sCiAgICAgIHJlc2V0VmlldygpIHsKICAgICAgICB0aGlzLnpvb21MZXZlbCA9IDE7CiAgICAgICAgdGhpcy50cmFuc2xhdGVYID0gMDsKICAgICAgICB0aGlzLnRyYW5zbGF0ZVkgPSAwOwogICAgICB9LAoKICAgICAgLy8g5ouW5ou95bmz56e76YC76L6RCiAgICAgIHN0YXJ0RHJhZyhlKSB7CiAgICAgICAgdGhpcy5pc0RyYWdnaW5nID0gdHJ1ZTsKICAgICAgICB0aGlzLnN0YXJ0WCA9IGUuY2xpZW50WCAtIHRoaXMudHJhbnNsYXRlWDsKICAgICAgICB0aGlzLnN0YXJ0WSA9IGUuY2xpZW50WSAtIHRoaXMudHJhbnNsYXRlWTsKICAgICAgfSwKICAgICAgb25EcmFnKGUpIHsKICAgICAgICBpZiAoIXRoaXMuaXNEcmFnZ2luZykgcmV0dXJuOwogICAgICAgIHRoaXMudHJhbnNsYXRlWCA9IGUuY2xpZW50WCAtIHRoaXMuc3RhcnRYOwogICAgICAgIHRoaXMudHJhbnNsYXRlWSA9IGUuY2xpZW50WSAtIHRoaXMuc3RhcnRZOwogICAgICB9LAogICAgICBzdG9wRHJhZygpIHsKICAgICAgICB0aGlzLmlzRHJhZ2dpbmcgPSBmYWxzZTsKICAgICAgfSwKCiAgICAgIC8vIOWvvOWHuiBTVkcg6YC76L6RCiAgICAgIGV4cG9ydFN2ZygpIHsKICAgICAgICBpZiAoIXRoaXMuY3VycmVudFN2ZykgcmV0dXJuOwogICAgICAgIGNvbnN0IGZvcm1hdHRlZFN2ZyA9IHRoaXMuZm9ybWF0U3ZnU3RyaW5nKHRoaXMuY3VycmVudFN2Zyk7CiAgICAgICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtmb3JtYXR0ZWRTdmddLCB7CiAgICAgICAgICB0eXBlOiAiaW1hZ2Uvc3ZnK3htbDtjaGFyc2V0PXV0Zi04IgogICAgICAgIH0pOwogICAgICAgIHRoaXMudHJpZ2dlckRvd25sb2FkKGJsb2IsIGAke3RoaXMuYWNjb3VudERhdGEudGl0bGV9LnN2Z2ApOwogICAgICB9LAoKICAgICAgLy8g6Kej5YazIFBORyDlr7zlh7rlpLHotKXnmoTovazmjaLpgLvovpEKICAgICAgZXhwb3J0UG5nKCkgewogICAgICAgIGlmICghdGhpcy5jdXJyZW50U3ZnKSByZXR1cm47CgogICAgICAgIGNvbnN0IHN2Z0VsZW1lbnQgPSB0aGlzLiRyZWZzLnN2Z1dyYXBwZXIucXVlcnlTZWxlY3Rvcigic3ZnIik7CiAgICAgICAgaWYgKCFzdmdFbGVtZW50KSByZXR1cm47CgogICAgICAgIC8vIDEuIOiOt+WPliBTVkcg55qE5Y6f5aeL5bC65a+45oiW6L6555WM5bC65a+4CiAgICAgICAgY29uc3QgYmJveCA9IHN2Z0VsZW1lbnQuZ2V0QkJveCA/IHN2Z0VsZW1lbnQuZ2V0QkJveCgpIDogewogICAgICAgICAgd2lkdGg6IDgwMCwKICAgICAgICAgIGhlaWdodDogNjAwCiAgICAgICAgfTsKICAgICAgICBjb25zdCB3aWR0aCA9IHN2Z0VsZW1lbnQuY2xpZW50V2lkdGggfHwgYmJveC53aWR0aCB8fCA4MDA7CiAgICAgICAgY29uc3QgaGVpZ2h0ID0gc3ZnRWxlbWVudC5jbGllbnRIZWlnaHQgfHwgYmJveC5oZWlnaHQgfHwgNjAwOwoKICAgICAgICAvLyAyLiDnoa7kv53lr7zlh7rlrZfnrKbkuLLlhbflpIflrozmlbTnmoTlkb3lkI3nqbrpl7TkuI7lrr3pq5jkv6Hmga/vvIjop6PlhrPliqDovb3lpLHotKXnmoTkuLvopoHljp/lm6DvvIkKICAgICAgICBjb25zdCBzdmdTdHJpbmcgPSB0aGlzLmZvcm1hdFN2Z1N0cmluZyh0aGlzLmN1cnJlbnRTdmcsIHdpZHRoLCBoZWlnaHQpOwoKICAgICAgICAvLyAzLiDlsIYgU1ZHIOi9rOWMluS4uiBCYXNlNjQgRGF0YSBVUkzvvIjmr5QgQmxvYiBVUkwg5ZyoIEltYWdlIOWKoOi9veS4reWFvOWuueaAp+abtOW8uu+8iQogICAgICAgIGNvbnN0IGVuY29kZWRTdmcgPSBlbmNvZGVVUklDb21wb25lbnQoc3ZnU3RyaW5nKQogICAgICAgICAgLnJlcGxhY2UoLycvZywgIiUyNyIpCiAgICAgICAgICAucmVwbGFjZSgvIi9nLCAiJTIyIik7CiAgICAgICAgY29uc3QgZGF0YVVybCA9IGBkYXRhOmltYWdlL3N2Zyt4bWw7Y2hhcnNldD11dGYtOCwke2VuY29kZWRTdmd9YDsKCiAgICAgICAgY29uc3QgaW1nID0gbmV3IEltYWdlKCk7CiAgICAgICAgaW1nLmNyb3NzT3JpZ2luID0gImFub255bW91cyI7CgogICAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7CiAgICAgICAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCJjYW52YXMiKTsKICAgICAgICAgIGNvbnN0IHNjYWxlID0gMjsgLy8g5o+Q6auY5a+85Ye65YiG6L6o546H77yM6YG/5YWN5qih57OKCiAgICAgICAgICBjYW52YXMud2lkdGggPSB3aWR0aCAqIHNjYWxlOwogICAgICAgICAgY2FudmFzLmhlaWdodCA9IGhlaWdodCAqIHNjYWxlOwoKICAgICAgICAgIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCIyZCIpOwogICAgICAgICAgY3R4LnNjYWxlKHNjYWxlLCBzY2FsZSk7CgogICAgICAgICAgLy8g6K6+572u5bqV6Imy77yM6Ziy5q2i6IOM5pmv5Y+Y5Li66buR6Imy5oiW6YCP5piOCiAgICAgICAgICBjdHguZmlsbFN0eWxlID0gIiNmZmZmZmYiOwogICAgICAgICAgY3R4LmZpbGxSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpOwoKICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoaW1nLCAwLCAwLCB3aWR0aCwgaGVpZ2h0KTsKCiAgICAgICAgICBjYW52YXMudG9CbG9iKChwbmdCbG9iKSA9PiB7CiAgICAgICAgICAgIGlmIChwbmdCbG9iKSB7CiAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyRG93bmxvYWQocG5nQmxvYiwgYCR7dGhpcy5hY2NvdW50RGF0YS50aXRsZX0ucG5nYCk7CiAgICAgICAgICAgIH0KICAgICAgICAgIH0sICJpbWFnZS9wbmciKTsKICAgICAgICB9OwoKICAgICAgICBpbWcub25lcnJvciA9IChlKSA9PiB7CiAgICAgICAgICBjb25zb2xlLmVycm9yKCJTVkcg6L2sIFBORyDlpLHotKU6IiwgZSk7CiAgICAgICAgfTsKCiAgICAgICAgaW1nLnNyYyA9IGRhdGFVcmw7CiAgICAgIH0sCgogICAgICAvLyDooaXlhYUgU1ZHIOe8uuWkseeahOWRveWQjeepuumXtOWSjOWwuuWvuO+8jOmYsuatoiBJbWFnZSDmuLLmn5PlpLHotKUKICAgICAgZm9ybWF0U3ZnU3RyaW5nKHJhd1N2Zywgd2lkdGgsIGhlaWdodCkgewogICAgICAgIGxldCB4bWwgPSByYXdTdmc7CiAgICAgICAgaWYgKCF4bWwuaW5jbHVkZXMoInhtbG5zPSIpKSB7CiAgICAgICAgICB4bWwgPSB4bWwucmVwbGFjZSgiPHN2ZyIsICc8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyInKTsKICAgICAgICB9CiAgICAgICAgaWYgKHdpZHRoICYmIGhlaWdodCAmJiAheG1sLmluY2x1ZGVzKCJ3aWR0aD0iKSkgewogICAgICAgICAgeG1sID0geG1sLnJlcGxhY2UoIjxzdmciLCBgPHN2ZyB3aWR0aD0iJHt3aWR0aH0iIGhlaWdodD0iJHtoZWlnaHR9ImApOwogICAgICAgIH0KICAgICAgICByZXR1cm4geG1sOwogICAgICB9LAoKICAgICAgdHJpZ2dlckRvd25sb2FkKGJsb2IsIGZpbGVuYW1lKSB7CiAgICAgICAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoImEiKTsKICAgICAgICBsaW5rLmhyZWYgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpOwogICAgICAgIGxpbmsuZG93bmxvYWQgPSBmaWxlbmFtZTsKICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGxpbmspOwogICAgICAgIGxpbmsuY2xpY2soKTsKICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGxpbmspOwogICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwobGluay5ocmVmKTsKICAgICAgfQogICAgfQogIH07Cjwvc2NyaXB0PgoKPHN0eWxlIHNjb3BlZD4KICAuY3VzdG9tLWNhcmQgewogICAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDAuMnMgZWFzZSwgYm94LXNoYWRvdyAwLjJzIGVhc2U7CiAgfQo8L3N0eWxlPg==",
        },
      },
      exampleList: [
        {
          name: "用户登录流程",
          description: "描述用户登录的校验与分支逻辑",
          icon: "🔐",
        },
        {
          name: "订单状态机",
          description: "定义订单从创建到完成的状态流转",
          icon: "🔄",
        },
        {
          name: "API调用时序",
          description: "展示前后端交互的请求与响应顺序",
          icon: "⚡",
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
      inputPlaceholder:
        "需要可视化的具体流程步骤、状态列表、决策条件或系统交互逻辑。",
      description: "",
      query: { documentId: "9caf7e511633a6ebeb56a8456e896ec0" },
      accountData: {},
      flag: WebTool.adjustSize([false, false, true]),
      isSolo: WebTool.urlQuery(location.href, "solo"),
      defaultTemplate: "-",
      dataEditable: true,
      title: "文本转图表助理",
      introduce: "根据用户输入的文本内容，生成相应的图表，支持19种可视化图表",
      icon: "#",
    };
  },
  computed: {
    myAccept: function () {
      return `.html, .md, .txt, .doc, .docx, .pdf, .ppt, .pptx, .xlsx, .xls, .csv`;
    },
    viewMode: function () {
      return !this.modifyEnabled && !!this.currentVersionIndex;
    },
    resultPanelHeight: function () {
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
    },
    documentId: function () {
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
    },
    currentTips: function () {
      let ret = this.waitingText;
      if (this.loading) {
        ret = this.loadingText;
      } else if (this.description || this.content.inputText) {
        ret = this.gettedTips;
      } else {
      }

      return ret;
    },
  },
  methods: {
    startModify: function () {
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
    },
    checkDiff: function (index) {
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
    },
    updateVersionList: function (versionId, callback) {
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
    },
    getVersionLabel: function (item) {
      if (!item || !item.versionId) {
        return false;
      }
      let str = item.versionId.slice(0, 5);
      str = `${str}@${new Date(item._time).toLocaleString()}`;
      return str;
    },
    handleVersionChange: function (index) {
      this.versionList = this.versionList || [];
      console.log(index, this.versionList[index]);
      if (this.versionList[index] && this.versionList[index].result) {
        this.isStreaming = true;
        this.switchResultStatus(this.versionList[index].result, true);
        this.currentVersionIndex = index;
        this.modifyEnabled = false;
      }
    },
    handleConfirm: function () {
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
    },
    triggerFileInput: function (e) {
      e = e || window.event;
      e.stopPropagation();
      e.preventDefault();
      this.$refs.hiddenFileInput.click();
    },
    confirmTransfer: function (text) {
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
    },
    checkDataStruct: function (json, template) {
      template = WebTool.base64ToUtf8(template);
      let obj = webCpu.getDslObj(template) || {};
      let data = typeof obj.data === "function" ? obj.data().accountData : {};
      let ret = Object.keys(json) === Object.keys(data);
      return ret;
    },
    onFileSelected: async function (event) {
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
    },
    openFeedbackDialog: function () {
      this.feedbackDialog.visible = true;
    },
    confirmSendFeedback: function () {
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
    },
    handleContentCommand: function (type) {
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
    },
    copyLink: function () {
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
    },
    downloadImageItem: function () {
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
    },
    searchContent: function (str) {
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
    },
    confirmContent: function (content) {
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
    },
    openContentEditor: function () {
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
    },
    downloadMarkdown: function (params) {
      let md = WebTool.objectToMarkdown(params);
      let name = params.name || params.title + ".md";
      WebTool.downloadString(md, name);
    },
    downloadHtmlItem: function (params) {
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
    },
    dismissLoadingStatus: function () {
      this.loading = false;
      let elem = this.$refs.loadingEffectArea;
      if (!this.isSolo && !this.content.isSolo) {
        elem = this.$refs.resultComponentItem;
      }
      webCpu.CardItem.dismissMask(elem);
    },
    switchLoadingStatus: function (str) {
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
    },
    switchResultStatus: function (fullContent, flag) {
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
    },
    goBack: function (flag) {
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
    },
    _goBack: function () {
      if (
        this.abortController &&
        typeof this.abortController.abort === "function"
      ) {
        this.abortController.abort();
      }
      this.step = 0;
      this.accountData = {};
      this.isStreaming = false;
      this.modifyInfo = "";
      this.dismissLoadingStatus();
    },
    updateResult: function (json) {
      let app = JSON.parse(JSON.stringify(this.currentAppItem));
      delete app.card;
      let elem = this.$refs.resultComponentItem;
      aigcInterface.updateResultView(json, app, elem);
    },
    updateLoadingTips: function (result) {
      if (
        this.currentTipsItem &&
        this.currentTipsItem.card &&
        this.currentTipsItem.card.task
      ) {
        this.currentTipsItem.card.task.vueItem =
          this.currentTipsItem.card.task.vueItem || {};
        this.currentTipsItem.card.task.vueItem.result = result;
      }
    },
    inputExampleText: function (item) {
      this.content.inputText = item.name || "";
      if (item.description) {
        this.content.inputText = item.name + ": " + item.description;
      }
    },
    confirmGenerate: async function (query) {
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
    },
    handleErrorCase: function () {
      this.$message({
        type: "warning",
        message: "请求出现异常，请重新尝试。",
      });
      this.goBack(true);
    },
    handleGenerate: function () {
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
    },
    aigcRequest: function (query, flag) {
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
    },
    modifyGenerate: function (query) {
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
    },
  },
  appMap: {
    loginRegItem: {
      url: "/mainApp/app/loginRegItem.js",
      key: "transweb_loginRegItem",
      cardName: "loginRegCard",
      dsl: {
        data: {
          position: "top",
          loginedMenu: [
            {
              label: "⏱️ 历史记录",
              action: function (d, callback) {
                dialogMap.openDocumentApp(
                  webCpu.appConfig.aigcHistory,
                  {
                    data: {
                      content: {
                        isSolo: true,
                      },
                      query: {
                        documentId: d.documentId || webCpu.currentVueItem.query.documentId,
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
              },
            },
          ],
        },
      },
    },
  },
  mounted: async function () {
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
  },
};
</script>