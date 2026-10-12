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
  border-radius: 12px;
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
  --academic-text-tertiary: #A5A5AA;

  /* 强调：琥珀金 */
  --academic-accent: #6E6E73;
  --academic-accent-soft: rgba(110, 110, 115, 0.10);

  /* 辅助 */
  --academic-border: #e7e7eb;
  --academic-border-strong: #d4d4d8;

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
  color: #a5a5aa;
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
  border-radius: 4px;
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
  box-shadow: 0 4px 14px rgba(26, 26, 30, 0.16), 0 1px 2px rgba(26, 26, 30, 0.08),
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
  box-shadow: 0 8px 20px rgba(26, 26, 30, 0.22),
    0 2px 5px rgba(26, 26, 30, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
}

.cast-spell-btn[active="true"] {
  background: var(--academic-primary-active) !important;
}

.cast-spell-btn:active {
  transform: translateY(0px) scale(0.99) !important;
  background: var(--academic-primary-active) !important;
  box-shadow: 0 1px 3px rgba(26, 26, 30, 0.18),
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
  box-shadow: 0 1px 2px rgba(26, 26, 30, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.18) !important;
  transition: all 0.18s ease !important;
}

.custom-input-group .el-input-group__append .el-button:hover {
  background: var(--academic-primary-hover) !important;
  border-color: var(--academic-primary-hover) !important;
  box-shadow: 0 3px 8px rgba(26, 26, 30, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
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
  border-radius: 3px;
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
  font-weight: 500;
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
  border-radius: 4px;
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

/* ============================================
   白与空 · 规范补充：选中态 / 细滚动条 / eyebrow
   ============================================ */
::selection {
  background: #1a1a1e;
  color: #fafafc;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #e7e7eb;
  border-radius: 99px;
}

::-webkit-scrollbar-thumb:hover {
  background: #c9c9cf;
}

.eyebrow {
  font-size: 11px;
  color: #a5a5aa;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 500;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Helvetica Neue",
    Arial, sans-serif;
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
										template: "data:text/plain;charset=utf-8;base64,PHRlbXBsYXRlPgogIDxkaXYgY2xhc3M9InB2LXJvb3QiPgogICAgPGRpdiBjbGFzcz0icHYtY29udGFpbmVyIj4KICAgICAgPGVsLWNhcmQgY2xhc3M9InB2LW1haW4tY2FyZCI+CiAgICAgICAgPCEtLSA9PT09PT09PT09PT0g6aG26YOo5qCH6aKY5qCP77yI5Zu65a6a5qih5Z2X77yJID09PT09PT09PT09PSAtLT4KICAgICAgICA8ZGl2IGNsYXNzPSJwdi1oZWFkZXIiPgogICAgICAgICAgPGRpdiBjbGFzcz0icHYtaGVhZGVyLXN0YXJ0Ij4KICAgICAgICAgICAgPGgxIGNsYXNzPSJwdi10aXRsZSI+e3sgYWNjb3VudERhdGEudGl0bGUgfX08L2gxPgogICAgICAgICAgICA8cCBjbGFzcz0icHYtYmFkZ2UiPnt7IGFjY291bnREYXRhLnByZXNlbnRlciB9fTwvcD4KICAgICAgICAgIDwvZGl2PgogICAgICAgICAgPGVsLWJ1dHRvbiB0eXBlPSJwcmltYXJ5IiBzaXplPSJsYXJnZSIgY2xhc3M9InB2LXBsYXktYnRuIiBAY2xpY2s9ImVudGVyUHJlc2VudGF0aW9uIj4KICAgICAgICAgICAgPGkgY2xhc3M9ImJpIGJpLXBsYXktZmlsbCBwdi1wbGF5LWljb24iIGFyaWEtaGlkZGVuPSJ0cnVlIj48L2k+CiAgICAgICAgICAgIOaUvuaYoOW5u+eBr+eJhwogICAgICAgICAgPC9lbC1idXR0b24+CiAgICAgICAgPC9kaXY+CgogICAgICAgIDwhLS0gPT09PT09PT09PT09IOW5u+eBr+eJh+mihOiniOe9keagvO+8iDEyIOagj+WTjeW6lOW8j++8iSA9PT09PT09PT09PT0gLS0+CiAgICAgICAgPGRpdiBjbGFzcz0icHYtZ3JpZCI+CiAgICAgICAgICA8ZWwtY2FyZCB2LWZvcj0iKHNsaWRlLCBpZHgpIGluIGFjY291bnREYXRhLnNsaWRlcyIgOmtleT0ic2xpZGUuaWQiIGNsYXNzPSJwdi1zbGlkZS1jYXJkIiByb2xlPSJidXR0b24iIHRhYmluZGV4PSIwIiBAY2xpY2s9Im9wZW5TbGlkZUF0KGlkeCkiIEBrZXl1cC5lbnRlcj0ib3BlblNsaWRlQXQoaWR4KSI+CiAgICAgICAgICAgIDwhLS0g5Y2h54mH5aS06YOo77ya5bqP5Y+3ICsg5qCH6aKYICsg57G75Z6L5qCH562+IC0tPgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJwdi1zbGlkZS1jYXJkLWhlYWQiPgogICAgICAgICAgICAgIDxkaXYgY2xhc3M9InB2LXNsaWRlLWNhcmQtaGVhZC1sZWZ0Ij4KICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJwdi1zbGlkZS1jYXJkLWluZGV4Ij57eyBpZHggKyAxIH19PC9zcGFuPgogICAgICAgICAgICAgICAgPGgzIGNsYXNzPSJwdi1zbGlkZS1jYXJkLXRpdGxlIj57eyBzbGlkZS50aXRsZSB9fTwvaDM+CiAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9InB2LXNsaWRlLWNhcmQtYmFkZ2UiPnt7IHNsaWRlLnR5cGUgfX08L3NwYW4+CiAgICAgICAgICAgIDwvZGl2PgoKICAgICAgICAgICAgPCEtLSDljaHniYfmraPmlocgLS0+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9InB2LXNsaWRlLWNhcmQtYm9keSIgOmNsYXNzPSJ7CiAgICAgICAgICAgICAgICAncHYtc2xpZGUtY2FyZC1ib2R5LS1kdWFsJzogaGFzRHVhbExheW91dChzbGlkZSksCiAgICAgICAgICAgICAgICAncHYtc2xpZGUtY2FyZC1ib2R5LS1taXhlZCc6IGhhc01peGVkTGF5b3V0KHNsaWRlKSwKICAgICAgICAgICAgICB9Ij4KICAgICAgICAgICAgICA8ZGl2IHYtZm9yPSIoZWxlbWVudCwgZUluZGV4KSBpbiBzbGlkZS5lbGVtZW50cyIgOmtleT0iZUluZGV4IiBjbGFzcz0icHYtc2xpZGUtY2FyZC1lbCIgOmNsYXNzPSIncHYtc2xpZGUtY2FyZC1lbC0tJyArIGVsZW1lbnQudHlwZSI+CiAgICAgICAgICAgICAgICA8cCB2LWlmPSJlbGVtZW50LnR5cGUgPT09ICd0ZXh0JyIgY2xhc3M9InB2LWNhcmQtdGV4dCI+CiAgICAgICAgICAgICAgICAgIHt7IGVsZW1lbnQuY29udGVudCB9fQogICAgICAgICAgICAgICAgPC9wPgoKICAgICAgICAgICAgICAgIDx1bCB2LWVsc2UtaWY9ImVsZW1lbnQudHlwZSA9PT0gJ2xpc3QnIiBjbGFzcz0icHYtY2FyZC1saXN0Ij4KICAgICAgICAgICAgICAgICAgPGxpIHYtZm9yPSIoaXRlbSwgbEluZGV4KSBpbiBlbGVtZW50LmNvbnRlbnQiIDprZXk9ImxJbmRleCIgY2xhc3M9InB2LWNhcmQtbGlzdC1pdGVtIj4KICAgICAgICAgICAgICAgICAgICA8aSBjbGFzcz0iYmkgYmktY2hlY2stY2lyY2xlLWZpbGwgcHYtY2FyZC1saXN0LWNoZWNrIj48L2k+CiAgICAgICAgICAgICAgICAgICAgPHNwYW4+e3sgaXRlbSB9fTwvc3Bhbj4KICAgICAgICAgICAgICAgICAgPC9saT4KICAgICAgICAgICAgICAgIDwvdWw+CgogICAgICAgICAgICAgICAgPGRpdiB2LWVsc2UtaWY9ImVsZW1lbnQudHlwZSA9PT0gJ2NoYXJ0JyIgY2xhc3M9InB2LWNhcmQtY2hhcnQiPgogICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJwdi1jYXJkLWNoYXJ0LWhlYWRlciI+CiAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9ImJpIGJpLWJhci1jaGFydC1maWxsIHB2LWNhcmQtY2hhcnQtaWNvbi1zbSI+PC9pPgogICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJwdi1jYXJkLWNoYXJ0LWxhYmVsLXNtIj57ewogICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5jb250ZW50CiAgICAgICAgICAgICAgICAgICAgfX08L3NwYW4+CiAgICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgICA8Y2FudmFzIHYtaWY9ImVsZW1lbnQuY2hhcnRUeXBlID09PSAnY2hhcnRqcyciIGNsYXNzPSJwdi1jYXJkLWNoYXJ0LWNhbnZhcyIgOmRhdGEtY2hhcnQta2V5PSInY2FyZC0nICsgc2xpZGUuaWQgKyAnLScgKyBlSW5kZXgiPjwvY2FudmFzPgogICAgICAgICAgICAgICAgICA8ZGl2IHYtZWxzZS1pZj0iZWxlbWVudC5jaGFydFR5cGUgPT09ICdtZXJtYWlkJyIgY2xhc3M9InB2LWNhcmQtbWVybWFpZC1jb250YWluZXIiIDpkYXRhLW1lcm1haWQta2V5PSInY2FyZC0nICsgc2xpZGUuaWQgKyAnLScgKyBlSW5kZXgiPjwvZGl2PgogICAgICAgICAgICAgICAgICA8ZWwtZW1wdHkgdi1lbHNlIDpkZXNjcmlwdGlvbj0iZWxlbWVudC5jb250ZW50IiA6aW1hZ2Utc2l6ZT0iNDAiPjwvZWwtZW1wdHk+CiAgICAgICAgICAgICAgICA8L2Rpdj4KCiAgICAgICAgICAgICAgICA8ZGl2IHYtZWxzZS1pZj0iZWxlbWVudC50eXBlID09PSAnaW1hZ2UnIiBjbGFzcz0icHYtY2FyZC1pbWFnZS1ib3giPgogICAgICAgICAgICAgICAgICA8aW1nIDpzcmM9ImVsZW1lbnQudXJsIiA6YWx0PSJlbGVtZW50LmFsdCB8fCAn5Zu+54mHJyIgY2xhc3M9InB2LWNhcmQtaW1nIiAvPgogICAgICAgICAgICAgICAgPC9kaXY+CgogICAgICAgICAgICAgICAgPGJsb2NrcXVvdGUgdi1lbHNlLWlmPSJlbGVtZW50LnR5cGUgPT09ICdxdW90ZSciIGNsYXNzPSJwdi1jYXJkLXF1b3RlIj4KICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9ImJpIGJpLXF1b3RlIHB2LWNhcmQtcXVvdGUtaWNvbiI+PC9pPgogICAgICAgICAgICAgICAgICA8c3Bhbj57eyBlbGVtZW50LmNvbnRlbnQgfX08L3NwYW4+CiAgICAgICAgICAgICAgICA8L2Jsb2NrcXVvdGU+CgogICAgICAgICAgICAgICAgPGRpdiB2LWVsc2UtaWY9ImVsZW1lbnQudHlwZSA9PT0gJ3RhYmxlJyIgY2xhc3M9InB2LWNhcmQtdGFibGUtYm94Ij4KICAgICAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzPSJwdi1jYXJkLXRhYmxlIj4KICAgICAgICAgICAgICAgICAgICA8dGhlYWQgdi1pZj0iZWxlbWVudC5oZWFkZXJzIj4KICAgICAgICAgICAgICAgICAgICAgIDx0cj4KICAgICAgICAgICAgICAgICAgICAgICAgPHRoIHYtZm9yPSIoaCwgaElkeCkgaW4gZWxlbWVudC5oZWFkZXJzIiA6a2V5PSJoSWR4Ij4KICAgICAgICAgICAgICAgICAgICAgICAgICB7eyBoIH19CiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGg+CiAgICAgICAgICAgICAgICAgICAgICA8L3RyPgogICAgICAgICAgICAgICAgICAgIDwvdGhlYWQ+CiAgICAgICAgICAgICAgICAgICAgPHRib2R5PgogICAgICAgICAgICAgICAgICAgICAgPHRyIHYtZm9yPSIocm93LCBySW5kZXgpIGluIGVsZW1lbnQuZGF0YSIgOmtleT0ickluZGV4Ij4KICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHYtZm9yPSIoY2VsbCwgY0luZGV4KSBpbiByb3ciIDprZXk9ImNJbmRleCI+CiAgICAgICAgICAgICAgICAgICAgICAgICAge3sgY2VsbCB9fQogICAgICAgICAgICAgICAgICAgICAgICA8L3RkPgogICAgICAgICAgICAgICAgICAgICAgPC90cj4KICAgICAgICAgICAgICAgICAgICA8L3Rib2R5PgogICAgICAgICAgICAgICAgICA8L3RhYmxlPgogICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgPC9lbC1jYXJkPgogICAgICAgIDwvZGl2PgogICAgICA8L2VsLWNhcmQ+CiAgICA8L2Rpdj4KCiAgICA8IS0tID09PT09PT09PT09PSDlhajlsY/mlL7mmKDopobnm5blsYIgPT09PT09PT09PT09IC0tPgogICAgPGRpdiB2LWlmPSJpc1ByZXNlbnRhdGlvbiIgY2xhc3M9InB2LXJldmVhbC1vdmVybGF5IiA6Y2xhc3M9InsgJ3B2LXJldmVhbC1vdmVybGF5LS1pZGxlJzogdG9vbGJhcklkbGUgfSI+CiAgICAgIDwhLS0g5bel5YW35qCPIC0tPgogICAgICA8ZGl2IGNsYXNzPSJwdi1yZXZlYWwtdG9vbGJhciI+CiAgICAgICAgPGRpdiBjbGFzcz0icHYtcmV2ZWFsLXRvb2xiYXItcmlnaHQiPgogICAgICAgICAgPGVsLWJ1dHRvbiBAY2xpY2s9InByZXZTbGlkZSIgY2xhc3M9InB2LXJldmVhbC1uYXYtYnRuIiBhcmlhLWxhYmVsPSLkuIrkuIDpobUiPgogICAgICAgICAgICA8aSBjbGFzcz0iYmkgYmktY2hldnJvbi1sZWZ0IiBhcmlhLWhpZGRlbj0idHJ1ZSI+PC9pPgogICAgICAgICAgPC9lbC1idXR0b24+CiAgICAgICAgICA8ZWwtYnV0dG9uIEBjbGljaz0ibmV4dFNsaWRlIiBjbGFzcz0icHYtcmV2ZWFsLW5hdi1idG4iIGFyaWEtbGFiZWw9IuS4i+S4gOmhtSI+CiAgICAgICAgICAgIDxpIGNsYXNzPSJiaSBiaS1jaGV2cm9uLXJpZ2h0IiBhcmlhLWhpZGRlbj0idHJ1ZSI+PC9pPgogICAgICAgICAgPC9lbC1idXR0b24+CiAgICAgICAgICA8ZWwtYnV0dG9uIEBjbGljaz0iZXhpdFByZXNlbnRhdGlvbiIgY2xhc3M9InB2LXJldmVhbC1leGl0LWJ0biIgYXJpYS1sYWJlbD0i6YCA5Ye65pS+5pigIj4KICAgICAgICAgICAgPGkgY2xhc3M9ImJpIGJpLXgtbGcgcHYtcmV2ZWFsLWV4aXQtYnRuLWljb24iIGFyaWEtaGlkZGVuPSJ0cnVlIj48L2k+CiAgICAgICAgICAgIOmAgOWHuuaUvuaYoCAoRXNjKQogICAgICAgICAgPC9lbC1idXR0b24+CiAgICAgICAgPC9kaXY+CiAgICAgIDwvZGl2PgoKICAgICAgPCEtLSBSZXZlYWwg6Iie5Y+wIC0tPgogICAgICA8ZGl2IGNsYXNzPSJyZXZlYWwgcHYtcmV2ZWFsLXN0YWdlIj4KICAgICAgICA8ZGl2IGNsYXNzPSJzbGlkZXMiPgogICAgICAgICAgPHNlY3Rpb24gdi1mb3I9IihzbGlkZSwgc0lkeCkgaW4gYWNjb3VudERhdGEuc2xpZGVzIiA6a2V5PSIncmV2ZWFsLScgKyBzbGlkZS5pZCIgY2xhc3M9InJzLXNsaWRlIiA6Y2xhc3M9IlsKICAgICAgICAgICAgICAncnMtZGVuc2l0eS0nICsgZ2V0U2xpZGVEZW5zaXR5KHNsaWRlKSwKICAgICAgICAgICAgICAncnMtbGF5b3V0LScgKyBzbGlkZS50eXBlLAogICAgICAgICAgICAgIHsgJ3JzLXNsaWRlLS1jb3Zlcic6IHNsaWRlLnR5cGUgPT09ICd0aXRsZScgfSwKICAgICAgICAgICAgXSIgOmRhdGEtc2xpZGUtaWQ9InNsaWRlLmlkIj4KICAgICAgICAgICAgPCEtLSA9PT09PSDpobbpg6jmoIfpopjmoI/mqKHlnZfvvIjlm7rlrprpq5jluqYgfjEwJe+8iSA9PT09PSAtLT4KICAgICAgICAgICAgPGRpdiBjbGFzcz0icnMtaGVhZGVyIj4KICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0icnMtaGVhZGVyLWJhZGdlIHJzLWFuaW0tdGFyZ2V0IHJzLWFuaW0tc2xpZGUtZG93biIgOnN0eWxlPSJ7ICctLWFuaW0tZGVsYXknOiAnMG1zJyB9Ij57eyBzbGlkZS50eXBlIH19PC9zcGFuPgogICAgICAgICAgICAgIDxoMiBjbGFzcz0icnMtaGVhZGVyLXRpdGxlIHJzLWFuaW0tdGFyZ2V0IHJzLWFuaW0tZmFkZS11cCIgOnN0eWxlPSJ7ICctLWFuaW0tZGVsYXknOiAnODBtcycgfSI+CiAgICAgICAgICAgICAgICB7eyBzbGlkZS50aXRsZSB9fQogICAgICAgICAgICAgIDwvaDI+CiAgICAgICAgICAgIDwvZGl2PgoKICAgICAgICAgICAgPCEtLSA9PT09PSDmraPmloflnZfvvIgxMiDmoI/nvZHmoLwgKyA2JSDlronlhajovrnot53vvIkgPT09PT0gLS0+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9InJzLWJvZHkiIDpjbGFzcz0iewogICAgICAgICAgICAgICAgJ3JzLWJvZHktLWR1YWwnOiBoYXNEdWFsTGF5b3V0KHNsaWRlKSwKICAgICAgICAgICAgICAgICdycy1ib2R5LS1taXhlZCc6IGhhc01peGVkTGF5b3V0KHNsaWRlKSwKICAgICAgICAgICAgICAgICdycy1ib2R5LS1zaW5nbGUtY2hhcnQnOiBoYXNTaW5nbGVDaGFydExheW91dChzbGlkZSksCiAgICAgICAgICAgICAgfSI+CiAgICAgICAgICAgICAgPGRpdiB2LWZvcj0iKGVsZW1lbnQsIGVJbmRleCkgaW4gc2xpZGUuZWxlbWVudHMiIDprZXk9IidlbC0nICsgZUluZGV4IiBjbGFzcz0icnMtYm9keS1ibG9jayIgOmNsYXNzPSJbCiAgICAgICAgICAgICAgICAgICdycy1ib2R5LWJsb2NrLS0nICsgZWxlbWVudC50eXBlLAogICAgICAgICAgICAgICAgICBnZXRCbG9ja0dyaWRTcGFuKHNsaWRlLCBlbGVtZW50LCBlSW5kZXgpLAogICAgICAgICAgICAgICAgXSI+CiAgICAgICAgICAgICAgICA8cCB2LWlmPSJlbGVtZW50LnR5cGUgPT09ICd0ZXh0JyIgOnN0eWxlPSJhbmltVGV4dFN0eWxlKGVsZW1lbnQsIHNsaWRlLCBlSW5kZXgpIiBjbGFzcz0icnMtdGV4dCBycy1hbmltLXRhcmdldCBycy1hbmltLWZhZGUtdXAiPgogICAgICAgICAgICAgICAgICB7eyBlbGVtZW50LmNvbnRlbnQgfX0KICAgICAgICAgICAgICAgIDwvcD4KCiAgICAgICAgICAgICAgICA8dWwgdi1lbHNlLWlmPSJlbGVtZW50LnR5cGUgPT09ICdsaXN0JyIgOnN0eWxlPSJjb21wdXRlTGlzdFN0eWxlKGVsZW1lbnQsIHNsaWRlKSIgY2xhc3M9InJzLWxpc3QiPgogICAgICAgICAgICAgICAgICA8bGkgdi1mb3I9IihpdGVtLCBsSW5kZXgpIGluIGVsZW1lbnQuY29udGVudCIgOmtleT0iJ2xpLScgKyBsSW5kZXgiIGNsYXNzPSJycy1saXN0LWl0ZW0gcnMtYW5pbS10YXJnZXQgcnMtYW5pbS1mYWRlLXVwIiA6c3R5bGU9InsKICAgICAgICAgICAgICAgICAgICAgICctLWFuaW0tZGVsYXknOiBhbmltQmxvY2tEZWxheShlSW5kZXgsIGxJbmRleCkgKyAnbXMnLAogICAgICAgICAgICAgICAgICAgIH0iPgogICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPSJiaSBiaS1jaGVjay1jaXJjbGUtZmlsbCBycy1saXN0LWNoZWNrIj48L2k+CiAgICAgICAgICAgICAgICAgICAgPHNwYW4+e3sgaXRlbSB9fTwvc3Bhbj4KICAgICAgICAgICAgICAgICAgPC9saT4KICAgICAgICAgICAgICAgIDwvdWw+CgogICAgICAgICAgICAgICAgPGRpdiB2LWVsc2UtaWY9ImVsZW1lbnQudHlwZSA9PT0gJ2NoYXJ0JyIgY2xhc3M9InJzLWNoYXJ0IHJzLWFuaW0tdGFyZ2V0IHJzLWFuaW0tZmFkZS11cCIgOmNsYXNzPSJnZXRDaGFydFR5cGVDbGFzcyhlbGVtZW50KSIgOnN0eWxlPSJ7ICctLWFuaW0tZGVsYXknOiBhbmltQmxvY2tEZWxheShlSW5kZXgsIDApICsgJ21zJyB9Ij4KICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0icnMtY2hhcnQtbGFiZWwtYmFyIj4KICAgICAgICAgICAgICAgICAgICA8aSBjbGFzcz0iYmkgYmktYmFyLWNoYXJ0LWZpbGwgcnMtY2hhcnQtbGFiZWwtaWNvbiI+PC9pPgogICAgICAgICAgICAgICAgICAgIDxzcGFuPnt7IGVsZW1lbnQuY29udGVudCB9fTwvc3Bhbj4KICAgICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9InJzLWNoYXJ0LWlubmVyIj4KICAgICAgICAgICAgICAgICAgICA8Y2FudmFzIHYtaWY9ImVsZW1lbnQuY2hhcnRUeXBlID09PSAnY2hhcnRqcyciIGNsYXNzPSJycy1jaGFydC1jYW52YXMiIDpkYXRhLWNoYXJ0LWtleT0iJ3JldmVhbC0nICsgc2xpZGUuaWQgKyAnLScgKyBlSW5kZXgiPjwvY2FudmFzPgogICAgICAgICAgICAgICAgICAgIDxkaXYgdi1lbHNlLWlmPSJlbGVtZW50LmNoYXJ0VHlwZSA9PT0gJ21lcm1haWQnIiBjbGFzcz0icnMtbWVybWFpZC1jYW52YXMiIDpkYXRhLW1lcm1haWQta2V5PSIncmV2ZWFsLScgKyBzbGlkZS5pZCArICctJyArIGVJbmRleCI+PC9kaXY+CiAgICAgICAgICAgICAgICAgICAgPHRlbXBsYXRlIHYtZWxzZT4KICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPSJiaSBiaS1iYXItY2hhcnQtZmlsbCBycy1jaGFydC1pY29uIj48L2k+CiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0icnMtY2hhcnQtZmFsbGJhY2siPnt7IGVsZW1lbnQuY29udGVudCB9fTwvc3Bhbj4KICAgICAgICAgICAgICAgICAgICA8L3RlbXBsYXRlPgogICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgIDwvZGl2PgoKICAgICAgICAgICAgICAgIDxkaXYgdi1lbHNlLWlmPSJlbGVtZW50LnR5cGUgPT09ICdpbWFnZSciIGNsYXNzPSJycy1pbWFnZS1jb250YWluZXIgcnMtYW5pbS10YXJnZXQgcnMtYW5pbS1zY2FsZS1pbiIgOnN0eWxlPSJ7ICctLWFuaW0tZGVsYXknOiBhbmltQmxvY2tEZWxheShlSW5kZXgsIDApICsgJ21zJyB9Ij4KICAgICAgICAgICAgICAgICAgPGltZyA6c3JjPSJlbGVtZW50LnVybCIgOmFsdD0iZWxlbWVudC5hbHQiIGNsYXNzPSJycy1pbWciIC8+CiAgICAgICAgICAgICAgICA8L2Rpdj4KCiAgICAgICAgICAgICAgICA8YmxvY2txdW90ZSB2LWVsc2UtaWY9ImVsZW1lbnQudHlwZSA9PT0gJ3F1b3RlJyIgY2xhc3M9InJzLXF1b3RlIHJzLWFuaW0tdGFyZ2V0IHJzLWFuaW0tZmFkZS11cCIgOnN0eWxlPSJ7ICctLWFuaW0tZGVsYXknOiBhbmltQmxvY2tEZWxheShlSW5kZXgsIDApICsgJ21zJyB9Ij4KICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9ImJpIGJpLXF1b3RlIHJzLXF1b3RlLWljb24iPjwvaT4KICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9InJzLXF1b3RlLWNvbnRlbnQiPnt7IGVsZW1lbnQuY29udGVudCB9fTwvcD4KICAgICAgICAgICAgICAgIDwvYmxvY2txdW90ZT4KCiAgICAgICAgICAgICAgICA8ZGl2IHYtZWxzZS1pZj0iZWxlbWVudC50eXBlID09PSAndGFibGUnIiBjbGFzcz0icnMtdGFibGUtY29udGFpbmVyIHJzLWFuaW0tdGFyZ2V0IHJzLWFuaW0tZmFkZS11cCIgOnN0eWxlPSJ7ICctLWFuaW0tZGVsYXknOiBhbmltQmxvY2tEZWxheShlSW5kZXgsIDApICsgJ21zJyB9Ij4KICAgICAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzPSJycy10YWJsZSI+CiAgICAgICAgICAgICAgICAgICAgPHRoZWFkPgogICAgICAgICAgICAgICAgICAgICAgPHRyIHYtaWY9ImVsZW1lbnQuaGVhZGVycyI+CiAgICAgICAgICAgICAgICAgICAgICAgIDx0aCB2LWZvcj0iKGgsIGhJZHgpIGluIGVsZW1lbnQuaGVhZGVycyIgOmtleT0iaElkeCI+CiAgICAgICAgICAgICAgICAgICAgICAgICAge3sgaCB9fQogICAgICAgICAgICAgICAgICAgICAgICA8L3RoPgogICAgICAgICAgICAgICAgICAgICAgPC90cj4KICAgICAgICAgICAgICAgICAgICA8L3RoZWFkPgogICAgICAgICAgICAgICAgICAgIDx0Ym9keT4KICAgICAgICAgICAgICAgICAgICAgIDx0ciB2LWZvcj0iKHJvdywgcklkeCkgaW4gZWxlbWVudC5kYXRhIiA6a2V5PSJySWR4Ij4KICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHYtZm9yPSIoY2VsbCwgY0lkeCkgaW4gcm93IiA6a2V5PSJjSWR4Ij4KICAgICAgICAgICAgICAgICAgICAgICAgICB7eyBjZWxsIH19CiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+CiAgICAgICAgICAgICAgICAgICAgICA8L3RyPgogICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+CiAgICAgICAgICAgICAgICAgIDwvdGFibGU+CiAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgPC9kaXY+CgogICAgICAgICAgICA8IS0tID09PT09IOW6lemDqOmhteiEmuaooeWdl++8iOWbuuWumumrmOW6pu+8iSA9PT09PSAtLT4KICAgICAgICAgICAgPGRpdiBjbGFzcz0icnMtZm9vdGVyIj4KICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0icnMtZm9vdGVyLXRpdGxlIHJzLWFuaW0tdGFyZ2V0IHJzLWFuaW0tZmFkZS1pbiIgOnN0eWxlPSJ7CiAgICAgICAgICAgICAgICAgICctLWFuaW0tZGVsYXknOiBhbmltRm9vdGVyRGVsYXkoc2xpZGUuZWxlbWVudHMpICsgJ21zJywKICAgICAgICAgICAgICAgIH0iPnt7IGFjY291bnREYXRhLnRpdGxlIH19PC9zcGFuPgogICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJycy1mb290ZXItcGFnZSBycy1hbmltLXRhcmdldCBycy1hbmltLWZhZGUtaW4iIDpzdHlsZT0iewogICAgICAgICAgICAgICAgICAnLS1hbmltLWRlbGF5JzogYW5pbUZvb3RlckRlbGF5KHNsaWRlLmVsZW1lbnRzKSArIDYwICsgJ21zJywKICAgICAgICAgICAgICAgIH0iPnt7IHNJZHggKyAxIH19IC8ge3sgYWNjb3VudERhdGEuc2xpZGVzLmxlbmd0aCB9fTwvc3Bhbj4KICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICA8L3NlY3Rpb24+CiAgICAgICAgPC9kaXY+CiAgICAgIDwvZGl2PgogICAgPC9kaXY+CiAgPC9kaXY+CjwvdGVtcGxhdGU+Cgo8c2NyaXB0PgogIGV4cG9ydCBkZWZhdWx0IHsKICAgIG5hbWU6ICJQcmVzZW50YXRpb25WaWV3ZXIiLAogICAgZGF0YSgpIHsKICAgICAgcmV0dXJuIHsKICAgICAgICBpc1ByZXNlbnRhdGlvbjogZmFsc2UsCiAgICAgICAgdG9vbGJhcklkbGU6IGZhbHNlLAogICAgICAgIHRvb2xiYXJUaW1lcjogbnVsbCwKICAgICAgICB0YXJnZXRTbGlkZUluZGV4OiBudWxsLAogICAgICAgIHJldmVhbEluc3RhbmNlOiBudWxsLAogICAgICAgIHNjcmlwdHNMb2FkZWQ6IGZhbHNlLAogICAgICAgIGNoYXJ0SnNMb2FkZWQ6IGZhbHNlLAogICAgICAgIG1lcm1haWRMb2FkZWQ6IGZhbHNlLAogICAgICAgIENoYXJ0OiBudWxsLAogICAgICAgIG1lcm1haWQ6IG51bGwsCiAgICAgICAgY2hhcnRJbnN0YW5jZXM6IHt9LAogICAgICAgIGFjY291bnREYXRhOiB7CiAgICAgICAgICB0aXRsZTogIkFJIOaetuaehOWkmuerr+WNj+WQjOa8lOi/m+aKpeWRiiIsCiAgICAgICAgICBwcmVzZW50ZXI6ICLmioDmnK/mnrbmnoTpg6giLAogICAgICAgICAgc2xpZGVzOiBbewogICAgICAgICAgICAgIGlkOiAiY292ZXIiLAogICAgICAgICAgICAgIHR5cGU6ICJ0aXRsZSIsCiAgICAgICAgICAgICAgdGl0bGU6ICLlpJrnq6/lpJrmgIHmuLLmn5PmnrbmnoTmvJTov5siLAogICAgICAgICAgICAgIGVsZW1lbnRzOiBbewogICAgICAgICAgICAgICAgdHlwZTogInRleHQiLAogICAgICAgICAgICAgICAgY29udGVudDogIue7n+S4gOW6leW6p+WNj+iuru+8jOmdouWQkeacquadpeeahOWKqOaAgeWkmuaAgeWbvuihqOWPiuWkmuaooeaAgeaVsOaNrua4suafk+W8leaTjuOAgiIsCiAgICAgICAgICAgICAgfSwgXSwKICAgICAgICAgICAgfSwKICAgICAgICAgICAgewogICAgICAgICAgICAgIGlkOiAiY2hhcnRqcy1kZW1vIiwKICAgICAgICAgICAgICB0eXBlOiAic3BsaXQiLAogICAgICAgICAgICAgIHRpdGxlOiAi5pWw5o2u5Y+v6KeG5YyWIChDaGFydC5qcykiLAogICAgICAgICAgICAgIGVsZW1lbnRzOiBbewogICAgICAgICAgICAgICAgICB0eXBlOiAidGV4dCIsCiAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6ICLpgJrov4cgQ2FudmFzIOi9u+mHj+WMlua4suafk+aguOW/g+S4muWKoeaMh+agh++8jOWujOe+juino+WGs+enu+WKqOerr+S4juWkp+Wxj+aAp+iDveaegemZkOOAgiIsCiAgICAgICAgICAgICAgICB9LAogICAgICAgICAgICAgICAgewogICAgICAgICAgICAgICAgICB0eXBlOiAiY2hhcnQiLAogICAgICAgICAgICAgICAgICBjaGFydFR5cGU6ICJjaGFydGpzIiwKICAgICAgICAgICAgICAgICAgY29udGVudDogIuaguOW/g+WQnuWQkOmHj+WPmOWMliIsCiAgICAgICAgICAgICAgICAgIGNoYXJ0RGF0YTogewogICAgICAgICAgICAgICAgICAgIHR5cGU6ICJsaW5lIiwKICAgICAgICAgICAgICAgICAgICBkYXRhOiB7CiAgICAgICAgICAgICAgICAgICAgICBsYWJlbHM6IFsiUTEiLCAiUTIiLCAiUTMiLCAiUTQiXSwKICAgICAgICAgICAgICAgICAgICAgIGRhdGFzZXRzOiBbewogICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogIuWQnuWQkOmHjyAoVFBTKSIsCiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IFsxMjAwLCAxOTAwLCAzMjAwLCA0NTAwXSwKICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICIjMDA3MWUzIiwKICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAicmdiYSgwLCAxMTMsIDIyNywgMC4xMikiLAogICAgICAgICAgICAgICAgICAgICAgICB0ZW5zaW9uOiAwLjQsCiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGw6IHRydWUsCiAgICAgICAgICAgICAgICAgICAgICB9LCBdLAogICAgICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogewogICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2l2ZTogdHJ1ZSwKICAgICAgICAgICAgICAgICAgICAgIG1haW50YWluQXNwZWN0UmF0aW86IGZhbHNlLAogICAgICAgICAgICAgICAgICAgICAgcGx1Z2luczogewogICAgICAgICAgICAgICAgICAgICAgICBsZWdlbmQ6IHsKICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbHM6IHsKICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAiIzZlNmU3MyIsCiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250OiB7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6IDE2CiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAgICAgICBzY2FsZXM6IHsKICAgICAgICAgICAgICAgICAgICAgICAgeDogewogICAgICAgICAgICAgICAgICAgICAgICAgIHRpY2tzOiB7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogIiM2NDc0OGIiLAogICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udDogewogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaXplOiAxNAogICAgICAgICAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZDogewogICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICJyZ2JhKDIyNiwyMzIsMjQwLDAuNSkiCiAgICAgICAgICAgICAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICAgICAgICAgICAgeTogewogICAgICAgICAgICAgICAgICAgICAgICAgIHRpY2tzOiB7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogIiM2NDc0OGIiLAogICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udDogewogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaXplOiAxNAogICAgICAgICAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZDogewogICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICJyZ2JhKDIyNiwyMzIsMjQwLDAuNSkiCiAgICAgICAgICAgICAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgXSwKICAgICAgICAgICAgfSwKICAgICAgICAgICAgewogICAgICAgICAgICAgIGlkOiAibWVybWFpZC1kZW1vIiwKICAgICAgICAgICAgICB0eXBlOiAiY29udGVudCIsCiAgICAgICAgICAgICAgdGl0bGU6ICLmuLLmn5PnrqHpgZPmtYHovawgKE1lcm1haWQpIiwKICAgICAgICAgICAgICBlbGVtZW50czogW3sKICAgICAgICAgICAgICAgIHR5cGU6ICJjaGFydCIsCiAgICAgICAgICAgICAgICBjaGFydFR5cGU6ICJtZXJtYWlkIiwKICAgICAgICAgICAgICAgIGNvbnRlbnQ6ICLmtYHovazpk77mnaEiLAogICAgICAgICAgICAgICAgY2hhcnREYXRhOiB7CiAgICAgICAgICAgICAgICAgIGNvZGU6ICJncmFwaCBMUlxuICBBSVtQcm9tcHTmlbDmja5dIC0tPiBQYXJzZXJb5aSa5oCB57yW6K+R5ZmoXVxuICBQYXJzZXIgLS0+IENoYXJ0SlNbQ2hhcnQuanMg5byV5pOOXVxuICBQYXJzZXIgLS0+IE1lcm1haWRbTWVybWFpZCDlvJXmk45dIiwKICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgfSwgXSwKICAgICAgICAgICAgfSwKICAgICAgICAgICAgewogICAgICAgICAgICAgIGlkOiAiZHVhbC1kZW1vIiwKICAgICAgICAgICAgICB0eXBlOiAiY29udGVudCIsCiAgICAgICAgICAgICAgdGl0bGU6ICLlj4zliJfluIPlsYDvvJrliJfooaggKyDlm77ooagiLAogICAgICAgICAgICAgIGVsZW1lbnRzOiBbewogICAgICAgICAgICAgICAgICB0eXBlOiAidGV4dCIsCiAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6ICLlvZPljZXlvKDlubvnga/niYflkIzml7bljIXlkKvliJfooajkuI7lm77ooajml7bvvIzns7vnu5/oh6rliqjor4bliKvlubblkK/nlKjlj4zliJflubbmjpLluIPlsYDvvIzlt6bkvqflkYjnjrDnu5PmnoTljJbopoHngrnvvIzlj7Pkvqfmib/ovb3mlbDmja7lj6/op4bljJbjgIIiLAogICAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgdHlwZTogImxpc3QiLAogICAgICAgICAgICAgICAgICBjb250ZW50OiBbCiAgICAgICAgICAgICAgICAgICAgIkNoYXJ0LmpzIOi9u+mHj+WMliBDYW52YXMg5riy5p+T77yM5oCn6IO95p6B6Ie0IiwKICAgICAgICAgICAgICAgICAgICAiTWVybWFpZCDmtYHnqIvlm77ljbPml7bnvJbor5HvvIzpm7bphY3nva4iLAogICAgICAgICAgICAgICAgICAgICLnp7vliqjnq6/kuI7lpKflsY/oh6rpgILlupTpgILphY0iLAogICAgICAgICAgICAgICAgICAgICLliqjmgIHmlbDmja7lrp7ml7bnu5HlrprkuI7mm7TmlrAiLAogICAgICAgICAgICAgICAgICBdLAogICAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgdHlwZTogImNoYXJ0IiwKICAgICAgICAgICAgICAgICAgY2hhcnRUeXBlOiAiY2hhcnRqcyIsCiAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6ICLmuLLmn5PmgKfog73lr7nmr5QiLAogICAgICAgICAgICAgICAgICBjaGFydERhdGE6IHsKICAgICAgICAgICAgICAgICAgICB0eXBlOiAiYmFyIiwKICAgICAgICAgICAgICAgICAgICBkYXRhOiB7CiAgICAgICAgICAgICAgICAgICAgICBsYWJlbHM6IFsi5Y6f55SfIENhbnZhcyIsICJDaGFydC5qcyIsICJEMy5qcyIsICJFQ2hhcnRzIl0sCiAgICAgICAgICAgICAgICAgICAgICBkYXRhc2V0czogW3sKICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICLmuLLmn5PogJfml7YgKG1zKSIsCiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IFsxMiwgMjgsIDQ1LCAzOF0sCiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogWwogICAgICAgICAgICAgICAgICAgICAgICAgICIjOTRhM2I4IiwKICAgICAgICAgICAgICAgICAgICAgICAgICAiIzAwNzFlMyIsCiAgICAgICAgICAgICAgICAgICAgICAgICAgIiNjYmQ1ZTEiLAogICAgICAgICAgICAgICAgICAgICAgICAgICIjY2JkNWUxIiwKICAgICAgICAgICAgICAgICAgICAgICAgXSwKICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiA2LAogICAgICAgICAgICAgICAgICAgICAgfSwgXSwKICAgICAgICAgICAgICAgICAgICB9LAogICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IHsKICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNpdmU6IHRydWUsCiAgICAgICAgICAgICAgICAgICAgICBtYWludGFpbkFzcGVjdFJhdGlvOiBmYWxzZSwKICAgICAgICAgICAgICAgICAgICAgIHBsdWdpbnM6IHsKICAgICAgICAgICAgICAgICAgICAgICAgbGVnZW5kOiB7CiAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogZmFsc2UsCiAgICAgICAgICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAgICAgICB9LAogICAgICAgICAgICAgICAgICAgICAgc2NhbGVzOiB7CiAgICAgICAgICAgICAgICAgICAgICAgIHg6IHsKICAgICAgICAgICAgICAgICAgICAgICAgICB0aWNrczogewogICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICIjNjQ3NDhiIiwKICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnQ6IHsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZTogMTQKICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgICAgICAgICAgICB9LAogICAgICAgICAgICAgICAgICAgICAgICAgIGdyaWQ6IHsKICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlCiAgICAgICAgICAgICAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICAgICAgICAgICAgeTogewogICAgICAgICAgICAgICAgICAgICAgICAgIHRpY2tzOiB7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogIiM2NDc0OGIiLAogICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udDogewogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaXplOiAxNAogICAgICAgICAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZDogewogICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICJyZ2JhKDIyNiwyMzIsMjQwLDAuNSkiCiAgICAgICAgICAgICAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgXSwKICAgICAgICAgICAgfSwKICAgICAgICAgIF0sCiAgICAgICAgfSwKICAgICAgfTsKICAgIH0sCiAgICBtb3VudGVkKCkgewogICAgICB0aGlzLmluaXRSZXF1aXJlZExpYnJhcmllcygpLnRoZW4oKCkgPT4gewogICAgICAgIHRoaXMucmVuZGVyRWxlbWVudHMoImNhcmQiKTsKICAgICAgfSk7CiAgICB9LAogICAgbWV0aG9kczogewogICAgICAvKiA9PT09PT09PT09IOW4g+WxgOivhuWIqyA9PT09PT09PT09ICovCiAgICAgIGhhc0R1YWxMYXlvdXQoc2xpZGUpIHsKICAgICAgICBpZiAoIXNsaWRlLmVsZW1lbnRzIHx8IHNsaWRlLmVsZW1lbnRzLmxlbmd0aCA8IDIpIHJldHVybiBmYWxzZTsKICAgICAgICBjb25zdCB0eXBlcyA9IHNsaWRlLmVsZW1lbnRzLm1hcCgoZSkgPT4gZS50eXBlKTsKICAgICAgICByZXR1cm4gdHlwZXMuaW5jbHVkZXMoImxpc3QiKSAmJiB0eXBlcy5pbmNsdWRlcygiY2hhcnQiKTsKICAgICAgfSwKCiAgICAgIGhhc01peGVkTGF5b3V0KHNsaWRlKSB7CiAgICAgICAgaWYgKCFzbGlkZS5lbGVtZW50cyB8fCBzbGlkZS5lbGVtZW50cy5sZW5ndGggPCAyKSByZXR1cm4gZmFsc2U7CiAgICAgICAgY29uc3QgdHlwZXMgPSBzbGlkZS5lbGVtZW50cy5tYXAoKGUpID0+IGUudHlwZSk7CiAgICAgICAgLy8g5ZCM5pe25YyF5ZCrIGxpc3QgKyBjaGFydCDml7blsZ7kuo7lj4zliJfluIPlsYDvvIzkuI3otbDmt7flkIjluIPlsYAKICAgICAgICBpZiAodHlwZXMuaW5jbHVkZXMoImxpc3QiKSAmJiB0eXBlcy5pbmNsdWRlcygiY2hhcnQiKSkgcmV0dXJuIGZhbHNlOwogICAgICAgIHJldHVybiB0eXBlcy5pbmNsdWRlcygidGV4dCIpICYmIHR5cGVzLmluY2x1ZGVzKCJjaGFydCIpOwogICAgICB9LAoKICAgICAgaGFzU2luZ2xlQ2hhcnRMYXlvdXQoc2xpZGUpIHsKICAgICAgICBpZiAoIXNsaWRlLmVsZW1lbnRzIHx8IHNsaWRlLmVsZW1lbnRzLmxlbmd0aCAhPT0gMSkgcmV0dXJuIGZhbHNlOwogICAgICAgIHJldHVybiBzbGlkZS5lbGVtZW50c1swXS50eXBlID09PSAiY2hhcnQiOwogICAgICB9LAoKICAgICAgLyogPT09PT09PT09PSDlm77ooajnsbvlnovnsbvlkI3vvIjnlKjkuo4gQ1NTIOWuvemrmOavlOaOp+WItu+8iSA9PT09PT09PT09ICovCiAgICAgIGdldENoYXJ0VHlwZUNsYXNzKGVsZW1lbnQpIHsKICAgICAgICBpZiAoIWVsZW1lbnQgfHwgZWxlbWVudC50eXBlICE9PSAiY2hhcnQiIHx8ICFlbGVtZW50LmNoYXJ0RGF0YSkgcmV0dXJuICIiOwogICAgICAgIGNvbnN0IHR5cGUgPSBlbGVtZW50LmNoYXJ0RGF0YS50eXBlIHx8ICJ1bmtub3duIjsKICAgICAgICByZXR1cm4gInJzLWNoYXJ0LS0iICsgdHlwZTsKICAgICAgfSwKCiAgICAgIC8qID09PT09PT09PT0gMTIg5qCP572R5qC86Leo5bqm5YiG6YWNID09PT09PT09PT0gKi8KICAgICAgZ2V0QmxvY2tHcmlkU3BhbihzbGlkZSwgZWxlbWVudCwgZUluZGV4KSB7CiAgICAgICAgLy8g5Y+M5YiX5biD5bGA77yabGlzdCDljaAgNSDmoI/vvIxjaGFydCDljaAgNyDmoI/vvIjlt6YgMS8zICsg5Y+zIDIvMyDmr5TkvovmhJ/vvIkKICAgICAgICBpZiAodGhpcy5oYXNEdWFsTGF5b3V0KHNsaWRlKSkgewogICAgICAgICAgaWYgKGVsZW1lbnQudHlwZSA9PT0gImxpc3QiKSByZXR1cm4gInJzLWNvbC01IjsKICAgICAgICAgIGlmIChlbGVtZW50LnR5cGUgPT09ICJjaGFydCIpIHJldHVybiAicnMtY29sLTciOwogICAgICAgIH0KICAgICAgICAvLyDmt7flkIjluIPlsYDvvJp0ZXh0IOWNoCA0IOagj++8jGNoYXJ0IOWNoCA4IOagjwogICAgICAgIGlmICh0aGlzLmhhc01peGVkTGF5b3V0KHNsaWRlKSkgewogICAgICAgICAgaWYgKGVsZW1lbnQudHlwZSA9PT0gInRleHQiKSByZXR1cm4gInJzLWNvbC00IjsKICAgICAgICAgIGlmIChlbGVtZW50LnR5cGUgPT09ICJjaGFydCIpIHJldHVybiAicnMtY29sLTgiOwogICAgICAgIH0KICAgICAgICAvLyDpu5jorqTljaDmu6EgMTIg5qCPCiAgICAgICAgcmV0dXJuICJycy1jb2wtMTIiOwogICAgICB9LAoKICAgICAgLyogPT09PT09PT09PSDlhoXlrrnlr4bluqbor4TkvLAgPT09PT09PT09PSAqLwogICAgICBnZXRTbGlkZURlbnNpdHkoc2xpZGUpIHsKICAgICAgICBpZiAoIXNsaWRlLmVsZW1lbnRzKSByZXR1cm4gImxpZ2h0IjsKICAgICAgICBsZXQgdG90YWxDaGFycyA9IDA7CiAgICAgICAgbGV0IGxpc3RJdGVtQ291bnQgPSAwOwogICAgICAgIGxldCBlbGVtZW50Q291bnQgPSBzbGlkZS5lbGVtZW50cy5sZW5ndGg7CgogICAgICAgIHNsaWRlLmVsZW1lbnRzLmZvckVhY2goKGVsKSA9PiB7CiAgICAgICAgICBpZiAoZWwudHlwZSA9PT0gInRleHQiIHx8IGVsLnR5cGUgPT09ICJxdW90ZSIpIHsKICAgICAgICAgICAgdG90YWxDaGFycyArPSAoZWwuY29udGVudCB8fCAiIikubGVuZ3RoOwogICAgICAgICAgfQogICAgICAgICAgaWYgKGVsLnR5cGUgPT09ICJsaXN0IikgewogICAgICAgICAgICBjb25zdCBpdGVtcyA9IGVsLmNvbnRlbnQgfHwgW107CiAgICAgICAgICAgIGxpc3RJdGVtQ291bnQgKz0gaXRlbXMubGVuZ3RoOwogICAgICAgICAgICB0b3RhbENoYXJzICs9IGl0ZW1zLmpvaW4oIiIpLmxlbmd0aDsKICAgICAgICAgIH0KICAgICAgICB9KTsKCiAgICAgICAgaWYgKAogICAgICAgICAgdG90YWxDaGFycyA+IDM1MCB8fAogICAgICAgICAgbGlzdEl0ZW1Db3VudCA+IDggfHwKICAgICAgICAgIChlbGVtZW50Q291bnQgPj0gNCAmJiB0b3RhbENoYXJzID4gMjAwKQogICAgICAgICkKICAgICAgICAgIHJldHVybiAiZXh0cmVtZSI7CiAgICAgICAgaWYgKHRvdGFsQ2hhcnMgPiAyMDAgfHwgbGlzdEl0ZW1Db3VudCA+IDUgfHwgZWxlbWVudENvdW50ID49IDQpCiAgICAgICAgICByZXR1cm4gImhlYXZ5IjsKICAgICAgICBpZiAodG90YWxDaGFycyA+IDEwMCB8fCBsaXN0SXRlbUNvdW50ID4gMyB8fCBlbGVtZW50Q291bnQgPj0gMykKICAgICAgICAgIHJldHVybiAibWVkaXVtIjsKICAgICAgICByZXR1cm4gImxpZ2h0IjsKICAgICAgfSwKCiAgICAgIGdldERlbnNpdHlCYXNlKHNsaWRlKSB7CiAgICAgICAgY29uc3QgZCA9IHRoaXMuZ2V0U2xpZGVEZW5zaXR5KHNsaWRlKTsKICAgICAgICBjb25zdCBtYXAgPSB7CiAgICAgICAgICBsaWdodDogewogICAgICAgICAgICB0aXRsZVNpemU6IDU0LAogICAgICAgICAgICB0ZXh0U2l6ZTogNDIsCiAgICAgICAgICAgIGxpc3RTaXplOiAzOCwKICAgICAgICAgICAgbGlzdEdhcDogMjAsCiAgICAgICAgICAgIGJvZHlQYWRZOiAzMiwKICAgICAgICAgICAgYmxvY2tHYXA6IDI0LAogICAgICAgICAgICBpdGVtUGFkWTogMjAsCiAgICAgICAgICAgIGl0ZW1QYWRYOiAyOCwKICAgICAgICAgICAgY2hhcnRNaW5IOiA0MjAsCiAgICAgICAgICAgIGNoYXJ0SW5uZXJNaW5IOiA0MDAsCiAgICAgICAgICAgIHF1b3RlU2l6ZTogMzAsCiAgICAgICAgICAgIHRhYmxlU2l6ZTogMjQsCiAgICAgICAgICAgIGltZ01heEg6IDUyMCwKICAgICAgICAgICAgZm9vdGVyU2l6ZTogMTgsCiAgICAgICAgICAgIGhlYWRlclBhZDogMzIsCiAgICAgICAgICB9LAogICAgICAgICAgbWVkaXVtOiB7CiAgICAgICAgICAgIHRpdGxlU2l6ZTogNDYsCiAgICAgICAgICAgIHRleHRTaXplOiAzNCwKICAgICAgICAgICAgbGlzdFNpemU6IDMyLAogICAgICAgICAgICBsaXN0R2FwOiAxNCwKICAgICAgICAgICAgYm9keVBhZFk6IDI0LAogICAgICAgICAgICBibG9ja0dhcDogMTgsCiAgICAgICAgICAgIGl0ZW1QYWRZOiAxNiwKICAgICAgICAgICAgaXRlbVBhZFg6IDI0LAogICAgICAgICAgICBjaGFydE1pbkg6IDM2MCwKICAgICAgICAgICAgY2hhcnRJbm5lck1pbkg6IDM0MCwKICAgICAgICAgICAgcXVvdGVTaXplOiAyNiwKICAgICAgICAgICAgdGFibGVTaXplOiAyMCwKICAgICAgICAgICAgaW1nTWF4SDogNDIwLAogICAgICAgICAgICBmb290ZXJTaXplOiAxNiwKICAgICAgICAgICAgaGVhZGVyUGFkOiAyOCwKICAgICAgICAgIH0sCiAgICAgICAgICBoZWF2eTogewogICAgICAgICAgICB0aXRsZVNpemU6IDM4LAogICAgICAgICAgICB0ZXh0U2l6ZTogMjQsCiAgICAgICAgICAgIGxpc3RTaXplOiAyMiwKICAgICAgICAgICAgbGlzdEdhcDogMTAsCiAgICAgICAgICAgIGJvZHlQYWRZOiAyMCwKICAgICAgICAgICAgYmxvY2tHYXA6IDE0LAogICAgICAgICAgICBpdGVtUGFkWTogMTQsCiAgICAgICAgICAgIGl0ZW1QYWRYOiAyMCwKICAgICAgICAgICAgY2hhcnRNaW5IOiAzMDAsCiAgICAgICAgICAgIGNoYXJ0SW5uZXJNaW5IOiAyODAsCiAgICAgICAgICAgIHF1b3RlU2l6ZTogMjIsCiAgICAgICAgICAgIHRhYmxlU2l6ZTogMTgsCiAgICAgICAgICAgIGltZ01heEg6IDMyMCwKICAgICAgICAgICAgZm9vdGVyU2l6ZTogMTQsCiAgICAgICAgICAgIGhlYWRlclBhZDogMjQsCiAgICAgICAgICB9LAogICAgICAgICAgZXh0cmVtZTogewogICAgICAgICAgICB0aXRsZVNpemU6IDMyLAogICAgICAgICAgICB0ZXh0U2l6ZTogMTgsCiAgICAgICAgICAgIGxpc3RTaXplOiAxOCwKICAgICAgICAgICAgbGlzdEdhcDogNiwKICAgICAgICAgICAgYm9keVBhZFk6IDE2LAogICAgICAgICAgICBibG9ja0dhcDogMTAsCiAgICAgICAgICAgIGl0ZW1QYWRZOiAxMCwKICAgICAgICAgICAgaXRlbVBhZFg6IDE2LAogICAgICAgICAgICBjaGFydE1pbkg6IDI0MCwKICAgICAgICAgICAgY2hhcnRJbm5lck1pbkg6IDIyMCwKICAgICAgICAgICAgcXVvdGVTaXplOiAxOCwKICAgICAgICAgICAgdGFibGVTaXplOiAxNiwKICAgICAgICAgICAgaW1nTWF4SDogMjYwLAogICAgICAgICAgICBmb290ZXJTaXplOiAxMiwKICAgICAgICAgICAgaGVhZGVyUGFkOiAyMCwKICAgICAgICAgIH0sCiAgICAgICAgfTsKICAgICAgICByZXR1cm4gbWFwW2RdIHx8IG1hcC5saWdodDsKICAgICAgfSwKCiAgICAgIC8qID09PT09PT09PT0g5L6d6LWW5Yqg6L29ID09PT09PT09PT0gKi8KICAgICAgYXN5bmMgbG9hZENoYXJ0SnMoKSB7CiAgICAgICAgaWYgKHdpbmRvdy5DaGFydCkgewogICAgICAgICAgdGhpcy5DaGFydCA9IHdpbmRvdy5DaGFydDsKICAgICAgICAgIHRoaXMuY2hhcnRKc0xvYWRlZCA9IHRydWU7CiAgICAgICAgICByZXR1cm47CiAgICAgICAgfQogICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7CiAgICAgICAgICBjb25zdCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCJzY3JpcHQiKTsKICAgICAgICAgIHNjcmlwdC5zcmMgPSAiaHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L25wbS9jaGFydC5qcyI7CiAgICAgICAgICBzY3JpcHQuYXN5bmMgPSB0cnVlOwogICAgICAgICAgc2NyaXB0Lm9ubG9hZCA9ICgpID0+IHsKICAgICAgICAgICAgdGhpcy5DaGFydCA9IHdpbmRvdy5DaGFydDsKICAgICAgICAgICAgdGhpcy5jaGFydEpzTG9hZGVkID0gdHJ1ZTsKICAgICAgICAgICAgcmVzb2x2ZSgpOwogICAgICAgICAgfTsKICAgICAgICAgIHNjcmlwdC5vbmVycm9yID0gcmVqZWN0OwogICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzY3JpcHQpOwogICAgICAgIH0pOwogICAgICB9LAoKICAgICAgYXN5bmMgbG9hZE1lcm1haWQoKSB7CiAgICAgICAgaWYgKHdpbmRvdy5tZXJtYWlkKSB7CiAgICAgICAgICB0aGlzLm1lcm1haWQgPSB3aW5kb3cubWVybWFpZDsKICAgICAgICAgIHRoaXMubWVybWFpZExvYWRlZCA9IHRydWU7CiAgICAgICAgICByZXR1cm47CiAgICAgICAgfQogICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7CiAgICAgICAgICBjb25zdCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCJzY3JpcHQiKTsKICAgICAgICAgIHNjcmlwdC5zcmMgPSAiaHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L25wbS9tZXJtYWlkL2Rpc3QvbWVybWFpZC5taW4uanMiOwogICAgICAgICAgc2NyaXB0LmFzeW5jID0gdHJ1ZTsKICAgICAgICAgIHNjcmlwdC5vbmxvYWQgPSAoKSA9PiB7CiAgICAgICAgICAgIHRoaXMubWVybWFpZCA9IHdpbmRvdy5tZXJtYWlkOwogICAgICAgICAgICB0aGlzLm1lcm1haWQuaW5pdGlhbGl6ZSh7CiAgICAgICAgICAgICAgc3RhcnRPbkxvYWQ6IGZhbHNlLAogICAgICAgICAgICAgIHRoZW1lOiAiZGVmYXVsdCIsCiAgICAgICAgICAgICAgc2VjdXJpdHlMZXZlbDogImxvb3NlIiwKICAgICAgICAgICAgfSk7CiAgICAgICAgICAgIHRoaXMubWVybWFpZExvYWRlZCA9IHRydWU7CiAgICAgICAgICAgIHJlc29sdmUoKTsKICAgICAgICAgIH07CiAgICAgICAgICBzY3JpcHQub25lcnJvciA9IHJlamVjdDsKICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2NyaXB0KTsKICAgICAgICB9KTsKICAgICAgfSwKCiAgICAgIGFzeW5jIGluaXRSZXF1aXJlZExpYnJhcmllcygpIHsKICAgICAgICB0cnkgewogICAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW3RoaXMubG9hZENoYXJ0SnMoKSwgdGhpcy5sb2FkTWVybWFpZCgpXSk7CiAgICAgICAgfSBjYXRjaCAoZSkgewogICAgICAgICAgY29uc29sZS5lcnJvcigi5Zu+6KGo5L6d6LWW5bqT5Yqg6L295aSx6LSl77yM6K+35qOA5p+l572R57ucIiwgZSk7CiAgICAgICAgfQogICAgICB9LAoKICAgICAgLyogPT09PT09PT09PSDmuLLmn5PlvJXmk44gPT09PT09PT09PSAqLwogICAgICBhc3luYyByZW5kZXJFbGVtZW50cyhzY29wZSA9ICJjYXJkIiwgdGFyZ2V0U2xpZGVJZCA9IG51bGwpIHsKICAgICAgICBjb25zdCBzZWxmID0gdGhpczsKICAgICAgICBmb3IgKGNvbnN0IHNsaWRlIG9mIHRoaXMuYWNjb3VudERhdGEuc2xpZGVzKSB7CiAgICAgICAgICBpZiAodGFyZ2V0U2xpZGVJZCAmJiBzbGlkZS5pZCAhPT0gdGFyZ2V0U2xpZGVJZCkgY29udGludWU7CiAgICAgICAgICBmb3IgKGxldCBlSW5kZXggPSAwOyBlSW5kZXggPCBzbGlkZS5lbGVtZW50cy5sZW5ndGg7IGVJbmRleCsrKSB7CiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBzbGlkZS5lbGVtZW50c1tlSW5kZXhdOwogICAgICAgICAgICBpZiAoZWxlbWVudC50eXBlICE9PSAiY2hhcnQiKSBjb250aW51ZTsKICAgICAgICAgICAgY29uc3Qga2V5ID0gYCR7c2NvcGV9LSR7c2xpZGUuaWR9LSR7ZUluZGV4fWA7CiAgICAgICAgICAgIGlmIChlbGVtZW50LmNoYXJ0VHlwZSA9PT0gImNoYXJ0anMiKSB7CiAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0b3IgPSBgY2FudmFzW2RhdGEtY2hhcnQta2V5PSIke2tleX0iXWA7CiAgICAgICAgICAgICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7CiAgICAgICAgICAgICAgaWYgKGNvbnRhaW5lcikgewogICAgICAgICAgICAgICAgaWYgKHNlbGYuY2hhcnRJbnN0YW5jZXNba2V5XSkgewogICAgICAgICAgICAgICAgICBzZWxmLmNoYXJ0SW5zdGFuY2VzW2tleV0uZGVzdHJveSgpOwogICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgY29uc3QgY3R4ID0gY29udGFpbmVyLmdldENvbnRleHQoIjJkIik7CiAgICAgICAgICAgICAgICAvLyDmt7Hmi7fotJ3pgb/lhY3msaHmn5Pljp/lp4vphY3nva7vvJvmlL7mmKDmqKHlvI/nu5/kuIDlk43lupTlvI/vvIzppbzlm74v546v5b2i5Zu+L+aegeWMuuWbvuW8uuWItuato+WchumYsuatouakreWchuWPmOW9ogogICAgICAgICAgICAgICAgY29uc3QgbmVlZHNDbG9uZSA9IHNjb3BlID09PSAiY2FyZCIgfHwgc2NvcGUgPT09ICJyZXZlYWwiOwogICAgICAgICAgICAgICAgY29uc3QgY2hhcnREYXRhID0gbmVlZHNDbG9uZSA/CiAgICAgICAgICAgICAgICAgIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZWxlbWVudC5jaGFydERhdGEpKSA6CiAgICAgICAgICAgICAgICAgIGVsZW1lbnQuY2hhcnREYXRhOwogICAgICAgICAgICAgICAgY2hhcnREYXRhLm9wdGlvbnMgPSBjaGFydERhdGEub3B0aW9ucyB8fCB7fTsKICAgICAgICAgICAgICAgIGNvbnN0IGNoYXJ0VHlwZSA9IGNoYXJ0RGF0YS50eXBlOwogICAgICAgICAgICAgICAgaWYgKHNjb3BlID09PSAiY2FyZCIpIHsKICAgICAgICAgICAgICAgICAgY2hhcnREYXRhLm9wdGlvbnMucmVzcG9uc2l2ZSA9IGZhbHNlOwogICAgICAgICAgICAgICAgICBjaGFydERhdGEub3B0aW9ucy5tYWludGFpbkFzcGVjdFJhdGlvID0gZmFsc2U7CiAgICAgICAgICAgICAgICB9IGVsc2UgewogICAgICAgICAgICAgICAgICBjaGFydERhdGEub3B0aW9ucy5yZXNwb25zaXZlID0gdHJ1ZTsKICAgICAgICAgICAgICAgICAgaWYgKAogICAgICAgICAgICAgICAgICAgIGNoYXJ0VHlwZSA9PT0gInBpZSIgfHwKICAgICAgICAgICAgICAgICAgICBjaGFydFR5cGUgPT09ICJkb3VnaG51dCIgfHwKICAgICAgICAgICAgICAgICAgICBjaGFydFR5cGUgPT09ICJwb2xhckFyZWEiCiAgICAgICAgICAgICAgICAgICkgewogICAgICAgICAgICAgICAgICAgIGNoYXJ0RGF0YS5vcHRpb25zLm1haW50YWluQXNwZWN0UmF0aW8gPSB0cnVlOwogICAgICAgICAgICAgICAgICAgIGNoYXJ0RGF0YS5vcHRpb25zLmFzcGVjdFJhdGlvID0gMTsKICAgICAgICAgICAgICAgICAgfSBlbHNlIHsKICAgICAgICAgICAgICAgICAgICBjaGFydERhdGEub3B0aW9ucy5tYWludGFpbkFzcGVjdFJhdGlvID0gZmFsc2U7CiAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIHNlbGYuY2hhcnRJbnN0YW5jZXNba2V5XSA9IG5ldyBzZWxmLkNoYXJ0KGN0eCwgY2hhcnREYXRhKTsKICAgICAgICAgICAgICAgIGlmIChzY29wZSA9PT0gInJldmVhbCIpIHsKICAgICAgICAgICAgICAgICAgLy8gUmV2ZWFsIOi/h+a4oeacn+mXtOWuueWZqOWwuuWvuOWPr+iDveWwmuacqueos+Wumu+8jOS4i+S4gOW4p+agoeato+S4gOasoQogICAgICAgICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gewogICAgICAgICAgICAgICAgICAgIGlmICgKICAgICAgICAgICAgICAgICAgICAgIHNlbGYuY2hhcnRJbnN0YW5jZXNba2V5XSAmJgogICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIHNlbGYuY2hhcnRJbnN0YW5jZXNba2V5XS5yZXNpemUgPT09ICJmdW5jdGlvbiIKICAgICAgICAgICAgICAgICAgICApIHsKICAgICAgICAgICAgICAgICAgICAgIHNlbGYuY2hhcnRJbnN0YW5jZXNba2V5XS5yZXNpemUoKTsKICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgIH0pOwogICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgIH0KICAgICAgICAgICAgfSBlbHNlIGlmIChlbGVtZW50LmNoYXJ0VHlwZSA9PT0gIm1lcm1haWQiICYmIHNlbGYubWVybWFpZCkgewogICAgICAgICAgICAgIGNvbnN0IHNlbGVjdG9yID0gYGRpdltkYXRhLW1lcm1haWQta2V5PSIke2tleX0iXWA7CiAgICAgICAgICAgICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7CiAgICAgICAgICAgICAgaWYgKGNvbnRhaW5lciAmJiBlbGVtZW50LmNoYXJ0RGF0YSAmJiBlbGVtZW50LmNoYXJ0RGF0YS5jb2RlKSB7CiAgICAgICAgICAgICAgICB0cnkgewogICAgICAgICAgICAgICAgICBjb25zdCB1bmlxdWVJZCA9IGBtZXJtYWlkLXN2Zy0ke3Njb3BlfS0kewogICAgICAgICAgICAgICAgICBzbGlkZS5pZAogICAgICAgICAgICAgICAgfS0ke2VJbmRleH0tJHtEYXRlLm5vdygpfWA7CiAgICAgICAgICAgICAgICAgIGNvbnN0IHsKICAgICAgICAgICAgICAgICAgICBzdmcKICAgICAgICAgICAgICAgICAgfSA9IGF3YWl0IHNlbGYubWVybWFpZC5yZW5kZXIoCiAgICAgICAgICAgICAgICAgICAgdW5pcXVlSWQsCiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5jaGFydERhdGEuY29kZQogICAgICAgICAgICAgICAgICApOwogICAgICAgICAgICAgICAgICBjb250YWluZXIuaW5uZXJIVE1MID0gc3ZnOwogICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7CiAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoIk1lcm1haWQg5qC45b+D57yW6K+R5Zmo6K+t5rOV6Kej5p6Q5aSx6LSlOiIsIGVycik7CiAgICAgICAgICAgICAgICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSBgPHNwYW4gc3R5bGU9ImNvbG9yOiNlZjQ0NDQ7Zm9udC1zaXplOjEycHg7Ij5NZXJtYWlkIOivreazlemUmeivrzwvc3Bhbj5gOwogICAgICAgICAgICAgICAgICBpZiAoc2VsZi5tZXJtYWlkLm1lcm1haWRBUEkgJiYgc2VsZi5tZXJtYWlkLm1lcm1haWRBUEkucmVzZXQpIHsKICAgICAgICAgICAgICAgICAgICBzZWxmLm1lcm1haWQubWVybWFpZEFQSS5yZXNldCgpOwogICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgfQogICAgICAgICAgICB9CiAgICAgICAgICB9CiAgICAgICAgfQogICAgICB9LAoKICAgICAgLyogPT09PT09PT09PSDliqjnlLvorqHnrpcgPT09PT09PT09PSAqLwogICAgICBhbmltQmxvY2tEZWxheShibG9ja0luZGV4LCBpdGVtSW5kZXgpIHsKICAgICAgICByZXR1cm4gMzAwICsgYmxvY2tJbmRleCAqIDIwMCArIGl0ZW1JbmRleCAqIDEwMDsKICAgICAgfSwKCiAgICAgIGFuaW1Gb290ZXJEZWxheShlbGVtZW50cykgewogICAgICAgIGxldCBtYXhEZWxheSA9IDMwMDsKICAgICAgICBpZiAoIWVsZW1lbnRzKSByZXR1cm4gbWF4RGVsYXk7CiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykgewogICAgICAgICAgY29uc3QgZWwgPSBlbGVtZW50c1tpXTsKICAgICAgICAgIGxldCBibG9ja0Jhc2UgPSAzMDAgKyBpICogMjAwOwogICAgICAgICAgaWYgKGVsLnR5cGUgPT09ICJsaXN0IiAmJiBlbC5jb250ZW50KSB7CiAgICAgICAgICAgIGJsb2NrQmFzZSArPSAoZWwuY29udGVudC5sZW5ndGggLSAxKSAqIDEwMDsKICAgICAgICAgIH0KICAgICAgICAgIGlmIChlbC50eXBlID09PSAiY2hhcnQiKSB7CiAgICAgICAgICAgIGJsb2NrQmFzZSArPSAxMDA7CiAgICAgICAgICB9CiAgICAgICAgICBpZiAoYmxvY2tCYXNlID4gbWF4RGVsYXkpIG1heERlbGF5ID0gYmxvY2tCYXNlOwogICAgICAgIH0KICAgICAgICByZXR1cm4gbWF4RGVsYXkgKyAyMDA7CiAgICAgIH0sCgogICAgICBhbmltVGV4dFN0eWxlKGVsZW1lbnQsIHNsaWRlLCBibG9ja0luZGV4KSB7CiAgICAgICAgY29uc3QgYmFzZSA9IHRoaXMuZ2V0RGVuc2l0eUJhc2Uoc2xpZGUpOwogICAgICAgIGNvbnN0IGxlbmd0aCA9IChlbGVtZW50LmNvbnRlbnQgfHwgIiIpLmxlbmd0aDsKICAgICAgICBsZXQgZm9udFNpemUgPSBiYXNlLnRleHRTaXplOwogICAgICAgIGxldCBsaW5lSGVpZ2h0ID0gMS42OwoKICAgICAgICBpZiAobGVuZ3RoID4gMjUwKSB7CiAgICAgICAgICBmb250U2l6ZSA9IE1hdGgubWF4KDE2LCBmb250U2l6ZSAtIDgpOwogICAgICAgICAgbGluZUhlaWdodCA9IDEuMzsKICAgICAgICB9IGVsc2UgaWYgKGxlbmd0aCA+IDEyMCkgewogICAgICAgICAgZm9udFNpemUgPSBNYXRoLm1heCgxNiwgZm9udFNpemUgLSA0KTsKICAgICAgICAgIGxpbmVIZWlnaHQgPSAxLjQ7CiAgICAgICAgfSBlbHNlIGlmIChsZW5ndGggPiA2MCkgewogICAgICAgICAgZm9udFNpemUgPSBNYXRoLm1heCgxNiwgZm9udFNpemUgLSAyKTsKICAgICAgICAgIGxpbmVIZWlnaHQgPSAxLjU7CiAgICAgICAgfQoKICAgICAgICBjb25zdCBlbENvdW50ID0gc2xpZGUuZWxlbWVudHMgPyBzbGlkZS5lbGVtZW50cy5sZW5ndGggOiAwOwogICAgICAgIGlmIChlbENvdW50ID4gMikgewogICAgICAgICAgZm9udFNpemUgPSBNYXRoLm1heCgxNiwgZm9udFNpemUgLSAyKTsKICAgICAgICB9CgogICAgICAgIHJldHVybiB7CiAgICAgICAgICBmb250U2l6ZTogZm9udFNpemUgKyAicHgiLAogICAgICAgICAgbGluZUhlaWdodDogbGluZUhlaWdodCwKICAgICAgICAgICItLWFuaW0tZGVsYXkiOiAzMDAgKyBibG9ja0luZGV4ICogMjAwICsgIm1zIiwKICAgICAgICB9OwogICAgICB9LAoKICAgICAgY29tcHV0ZUxpc3RTdHlsZShlbGVtZW50LCBzbGlkZSkgewogICAgICAgIGNvbnN0IGJhc2UgPSB0aGlzLmdldERlbnNpdHlCYXNlKHNsaWRlKTsKICAgICAgICBjb25zdCBpdGVtcyA9IGVsZW1lbnQuY29udGVudCB8fCBbXTsKICAgICAgICBjb25zdCBpdGVtQ291bnQgPSBpdGVtcy5sZW5ndGg7CiAgICAgICAgY29uc3QgdG90YWxMZW5ndGggPSBpdGVtcy5qb2luKCIiKS5sZW5ndGg7CgogICAgICAgIGxldCBmb250U2l6ZSA9IGJhc2UubGlzdFNpemU7CiAgICAgICAgbGV0IGl0ZW1HYXAgPSBiYXNlLmxpc3RHYXA7CgogICAgICAgIGlmIChpdGVtQ291bnQgPiA2IHx8IHRvdGFsTGVuZ3RoID4gMjAwKSB7CiAgICAgICAgICBmb250U2l6ZSA9IE1hdGgubWF4KDE2LCBmb250U2l6ZSAtIDQpOwogICAgICAgICAgaXRlbUdhcCA9IE1hdGgubWF4KDQsIGl0ZW1HYXAgLSA0KTsKICAgICAgICB9IGVsc2UgaWYgKGl0ZW1Db3VudCA+IDQgfHwgdG90YWxMZW5ndGggPiAxMDApIHsKICAgICAgICAgIGZvbnRTaXplID0gTWF0aC5tYXgoMTYsIGZvbnRTaXplIC0gMik7CiAgICAgICAgICBpdGVtR2FwID0gTWF0aC5tYXgoNCwgaXRlbUdhcCAtIDIpOwogICAgICAgIH0KCiAgICAgICAgaWYgKHNsaWRlLmVsZW1lbnRzICYmIHNsaWRlLmVsZW1lbnRzLmxlbmd0aCA+IDIpIHsKICAgICAgICAgIGZvbnRTaXplID0gTWF0aC5tYXgoMTYsIGZvbnRTaXplIC0gMik7CiAgICAgICAgICBpdGVtR2FwID0gTWF0aC5tYXgoNCwgaXRlbUdhcCAtIDIpOwogICAgICAgIH0KCiAgICAgICAgcmV0dXJuIHsKICAgICAgICAgIGZvbnRTaXplOiBmb250U2l6ZSArICJweCIsCiAgICAgICAgICAiLS1ycy1saXN0LWdhcCI6IGl0ZW1HYXAgKyAicHgiLAogICAgICAgICAgIi0tcnMtaXRlbS1wYWQteSI6IChiYXNlLml0ZW1QYWRZIHx8IDIwKSArICJweCIsCiAgICAgICAgICAiLS1ycy1pdGVtLXBhZC14IjogKGJhc2UuaXRlbVBhZFggfHwgMjgpICsgInB4IiwKICAgICAgICB9OwogICAgICB9LAoKICAgICAgLyogPT09PT09PT09PSDmlL7mmKDmjqfliLYgPT09PT09PT09PSAqLwogICAgICBhbmltYXRlQ3VycmVudFNsaWRlKCkgewogICAgICAgIGlmICghdGhpcy5yZXZlYWxJbnN0YW5jZSkgcmV0dXJuOwogICAgICAgIGNvbnN0IGN1cnJlbnRTbGlkZSA9IHRoaXMucmV2ZWFsSW5zdGFuY2UuZ2V0Q3VycmVudFNsaWRlKCk7CiAgICAgICAgaWYgKCFjdXJyZW50U2xpZGUpIHJldHVybjsKCiAgICAgICAgY29uc3QgYWN0aXZlU2xpZGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgKICAgICAgICAgICIucnMtc2xpZGUucnMtYW5pbS1hY3RpdmUiCiAgICAgICAgKTsKICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFjdGl2ZVNsaWRlcy5sZW5ndGg7IGkrKykgewogICAgICAgICAgYWN0aXZlU2xpZGVzW2ldLmNsYXNzTGlzdC5yZW1vdmUoInJzLWFuaW0tYWN0aXZlIik7CiAgICAgICAgfQoKICAgICAgICB2b2lkIGN1cnJlbnRTbGlkZS5vZmZzZXRXaWR0aDsKICAgICAgICBjdXJyZW50U2xpZGUuY2xhc3NMaXN0LmFkZCgicnMtYW5pbS1hY3RpdmUiKTsKCiAgICAgICAgY29uc3QgdGFyZ2V0U2xpZGVJZCA9IGN1cnJlbnRTbGlkZS5nZXRBdHRyaWJ1dGUoImRhdGEtc2xpZGUtaWQiKTsKICAgICAgICBjb25zdCBzZWxmID0gdGhpczsKICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHsKICAgICAgICAgIHNlbGYucmVuZGVyRWxlbWVudHMoInJldmVhbCIsIHRhcmdldFNsaWRlSWQpOwogICAgICAgIH0sIDEyMCk7CiAgICAgIH0sCgogICAgICBhc3luYyBsb2FkUmV2ZWFsUmVzb3VyY2VzKCkgewogICAgICAgIGlmICh0aGlzLnNjcmlwdHNMb2FkZWQgfHwgd2luZG93LlJldmVhbCkgcmV0dXJuIHdpbmRvdy5SZXZlYWw7CiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHsKICAgICAgICAgIGNvbnN0IGNvcmVDc3MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCJsaW5rIik7CiAgICAgICAgICBjb3JlQ3NzLnJlbCA9ICJzdHlsZXNoZWV0IjsKICAgICAgICAgIGNvcmVDc3MuaHJlZiA9CiAgICAgICAgICAgICJodHRwczovL2Nkbi5qc2RlbGl2ci5uZXQvbnBtL3JldmVhbC5qc0A0LjUuMC9kaXN0L3JldmVhbC5taW4uY3NzIjsKICAgICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoY29yZUNzcyk7CgogICAgICAgICAgY29uc3QgdGhlbWVDc3MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCJsaW5rIik7CiAgICAgICAgICB0aGVtZUNzcy5yZWwgPSAic3R5bGVzaGVldCI7CiAgICAgICAgICB0aGVtZUNzcy5ocmVmID0KICAgICAgICAgICAgImh0dHBzOi8vY2RuLmpzZGVsaXZyLm5ldC9ucG0vcmV2ZWFsLmpzQDQuNS4wL2Rpc3QvdGhlbWUvd2hpdGUubWluLmNzcyI7CiAgICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHRoZW1lQ3NzKTsKCiAgICAgICAgICBjb25zdCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCJzY3JpcHQiKTsKICAgICAgICAgIHNjcmlwdC5zcmMgPQogICAgICAgICAgICAiaHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L25wbS9yZXZlYWwuanNANC41LjAvZGlzdC9yZXZlYWwubWluLmpzIjsKICAgICAgICAgIHNjcmlwdC5hc3luYyA9IHRydWU7CiAgICAgICAgICBzY3JpcHQub25sb2FkID0gKCkgPT4gewogICAgICAgICAgICB0aGlzLnNjcmlwdHNMb2FkZWQgPSB0cnVlOwogICAgICAgICAgICByZXNvbHZlKHdpbmRvdy5SZXZlYWwpOwogICAgICAgICAgfTsKICAgICAgICAgIHNjcmlwdC5vbmVycm9yID0gKCkgPT4gcmVqZWN0KG5ldyBFcnJvcigiUmV2ZWFsLmpzIOaguOW/g+i1hOS6p+WKoOi9veWksei0pSIpKTsKICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2NyaXB0KTsKICAgICAgICB9KTsKICAgICAgfSwKCiAgICAgIG9wZW5TbGlkZUF0KGlkeCkgewogICAgICAgIHRoaXMudGFyZ2V0U2xpZGVJbmRleCA9IGlkeDsKICAgICAgICB0aGlzLmVudGVyUHJlc2VudGF0aW9uKCk7CiAgICAgIH0sCgogICAgICBhc3luYyBlbnRlclByZXNlbnRhdGlvbigpIHsKICAgICAgICB0aGlzLmlzUHJlc2VudGF0aW9uID0gdHJ1ZTsKICAgICAgICB0aGlzLnRvb2xiYXJJZGxlID0gZmFsc2U7CiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoImtleWRvd24iLCB0aGlzLmhhbmRsZUtleURvd24pOwogICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCJyZXNpemUiLCB0aGlzLmhhbmRsZUNoYXJ0UmVzaXplKTsKICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigibW91c2Vtb3ZlIiwgdGhpcy5oYW5kbGVNb3VzZU1vdmUpOwogICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCJ0b3VjaHN0YXJ0IiwgdGhpcy5oYW5kbGVNb3VzZU1vdmUpOwogICAgICAgIHRoaXMuc2NoZWR1bGVUb29sYmFySGlkZSgpOwoKICAgICAgICB0cnkgewogICAgICAgICAgY29uc3QgUmV2ZWFsID0gYXdhaXQgdGhpcy5sb2FkUmV2ZWFsUmVzb3VyY2VzKCk7CiAgICAgICAgICBhd2FpdCB0aGlzLmluaXRSZXF1aXJlZExpYnJhcmllcygpOwogICAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7CgogICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7CiAgICAgICAgICAgIGlmIChzZWxmLnJldmVhbEluc3RhbmNlKSBzZWxmLnJldmVhbEluc3RhbmNlID0gbnVsbDsKICAgICAgICAgICAgY29uc3QgcmV2ZWFsVGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcigiLnJldmVhbCIpOwogICAgICAgICAgICBpZiAoIXJldmVhbFRhcmdldCkgcmV0dXJuOwoKICAgICAgICAgICAgc2VsZi5yZXZlYWxJbnN0YW5jZSA9IG5ldyBSZXZlYWwocmV2ZWFsVGFyZ2V0LCB7CiAgICAgICAgICAgICAgZW1iZWRkZWQ6IHRydWUsCiAgICAgICAgICAgICAga2V5Ym9hcmQ6IHRydWUsCiAgICAgICAgICAgICAgY29udHJvbHM6IGZhbHNlLAogICAgICAgICAgICAgIHByb2dyZXNzOiBmYWxzZSwKICAgICAgICAgICAgICBjZW50ZXI6IHRydWUsCiAgICAgICAgICAgICAgd2lkdGg6IDE5MjAsCiAgICAgICAgICAgICAgaGVpZ2h0OiAxMDgwLAogICAgICAgICAgICAgIG1hcmdpbjogMC4wMiwKICAgICAgICAgICAgICBtaW5TY2FsZTogMC4yLAogICAgICAgICAgICAgIG1heFNjYWxlOiAyLjAsCiAgICAgICAgICAgIH0pOwoKICAgICAgICAgICAgc2VsZi5yZXZlYWxJbnN0YW5jZS5vbigic2xpZGVjaGFuZ2VkIiwgKCkgPT4gewogICAgICAgICAgICAgIHNlbGYuYW5pbWF0ZUN1cnJlbnRTbGlkZSgpOwogICAgICAgICAgICB9KTsKCiAgICAgICAgICAgIHNlbGYucmV2ZWFsSW5zdGFuY2UuaW5pdGlhbGl6ZSgpLnRoZW4oKCkgPT4gewogICAgICAgICAgICAgIGlmIChzZWxmLnJldmVhbEluc3RhbmNlKSB7CiAgICAgICAgICAgICAgICBzZWxmLnJldmVhbEluc3RhbmNlLmxheW91dCgpOwogICAgICAgICAgICAgICAgaWYgKHNlbGYudGFyZ2V0U2xpZGVJbmRleCAhPSBudWxsKSB7CiAgICAgICAgICAgICAgICAgIHNlbGYucmV2ZWFsSW5zdGFuY2Uuc2xpZGUoc2VsZi50YXJnZXRTbGlkZUluZGV4LCAwKTsKICAgICAgICAgICAgICAgICAgc2VsZi50YXJnZXRTbGlkZUluZGV4ID0gbnVsbDsKICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gewogICAgICAgICAgICAgICAgICBzZWxmLmFuaW1hdGVDdXJyZW50U2xpZGUoKTsKICAgICAgICAgICAgICAgIH0sIDE1MCk7CiAgICAgICAgICAgICAgfQogICAgICAgICAgICB9KTsKICAgICAgICAgIH0sIDEwMCk7CiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHsKICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpOwogICAgICAgICAgdGhpcy5pc1ByZXNlbnRhdGlvbiA9IGZhbHNlOwogICAgICAgIH0KICAgICAgfSwKCiAgICAgIGV4aXRQcmVzZW50YXRpb24oKSB7CiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoImtleWRvd24iLCB0aGlzLmhhbmRsZUtleURvd24pOwogICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCJyZXNpemUiLCB0aGlzLmhhbmRsZUNoYXJ0UmVzaXplKTsKICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigibW91c2Vtb3ZlIiwgdGhpcy5oYW5kbGVNb3VzZU1vdmUpOwogICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCJ0b3VjaHN0YXJ0IiwgdGhpcy5oYW5kbGVNb3VzZU1vdmUpOwogICAgICAgIGlmICh0aGlzLnRvb2xiYXJUaW1lcikgewogICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudG9vbGJhclRpbWVyKTsKICAgICAgICAgIHRoaXMudG9vbGJhclRpbWVyID0gbnVsbDsKICAgICAgICB9CgogICAgICAgIGlmICh0aGlzLnJldmVhbEluc3RhbmNlKSB7CiAgICAgICAgICB0cnkgewogICAgICAgICAgICB0aGlzLnJldmVhbEluc3RhbmNlLmRlc3Ryb3koKTsKICAgICAgICAgIH0gY2F0Y2ggKGUpIHsKICAgICAgICAgICAgY29uc29sZS53YXJuKGUpOwogICAgICAgICAgfQogICAgICAgICAgdGhpcy5yZXZlYWxJbnN0YW5jZSA9IG51bGw7CiAgICAgICAgfQoKICAgICAgICBjb25zdCBzZWxmID0gdGhpczsKICAgICAgICBjb25zdCByZXZlYWxLZXlzID0gT2JqZWN0LmtleXModGhpcy5jaGFydEluc3RhbmNlcykuZmlsdGVyKChrKSA9PgogICAgICAgICAgay5zdGFydHNXaXRoKCJyZXZlYWwtIikKICAgICAgICApOwogICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmV2ZWFsS2V5cy5sZW5ndGg7IGkrKykgewogICAgICAgICAgdHJ5IHsKICAgICAgICAgICAgc2VsZi5jaGFydEluc3RhbmNlc1tyZXZlYWxLZXlzW2ldXS5kZXN0cm95KCk7CiAgICAgICAgICB9IGNhdGNoIChlKSB7CiAgICAgICAgICAgIC8qIG5vb3AgKi8KICAgICAgICAgIH0KICAgICAgICAgIGRlbGV0ZSBzZWxmLmNoYXJ0SW5zdGFuY2VzW3JldmVhbEtleXNbaV1dOwogICAgICAgIH0KICAgICAgICB0aGlzLmlzUHJlc2VudGF0aW9uID0gZmFsc2U7CiAgICAgIH0sCgogICAgICBoYW5kbGVDaGFydFJlc2l6ZSgpIHsKICAgICAgICBjb25zdCBzZWxmID0gdGhpczsKICAgICAgICBPYmplY3Qua2V5cyh0aGlzLmNoYXJ0SW5zdGFuY2VzKS5mb3JFYWNoKChrZXkpID0+IHsKICAgICAgICAgIGlmICgKICAgICAgICAgICAgc2VsZi5jaGFydEluc3RhbmNlc1trZXldICYmCiAgICAgICAgICAgIHR5cGVvZiBzZWxmLmNoYXJ0SW5zdGFuY2VzW2tleV0ucmVzaXplID09PSAiZnVuY3Rpb24iCiAgICAgICAgICApIHsKICAgICAgICAgICAgc2VsZi5jaGFydEluc3RhbmNlc1trZXldLnJlc2l6ZSgpOwogICAgICAgICAgfQogICAgICAgIH0pOwogICAgICB9LAoKICAgICAgaGFuZGxlS2V5RG93bihlKSB7CiAgICAgICAgdGhpcy5zY2hlZHVsZVRvb2xiYXJIaWRlKCk7CiAgICAgICAgaWYgKGUua2V5ID09PSAiRXNjYXBlIikgdGhpcy5leGl0UHJlc2VudGF0aW9uKCk7CiAgICAgIH0sCgogICAgICBoYW5kbGVNb3VzZU1vdmUoKSB7CiAgICAgICAgdGhpcy5zY2hlZHVsZVRvb2xiYXJIaWRlKCk7CiAgICAgIH0sCgogICAgICBzY2hlZHVsZVRvb2xiYXJIaWRlKCkgewogICAgICAgIGlmICh0aGlzLnRvb2xiYXJUaW1lcikgY2xlYXJUaW1lb3V0KHRoaXMudG9vbGJhclRpbWVyKTsKICAgICAgICB0aGlzLnRvb2xiYXJJZGxlID0gZmFsc2U7CiAgICAgICAgdGhpcy50b29sYmFyVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHsKICAgICAgICAgIHRoaXMudG9vbGJhcklkbGUgPSB0cnVlOwogICAgICAgIH0sIDI1MDApOwogICAgICB9LAoKICAgICAgcHJldlNsaWRlKCkgewogICAgICAgIHRoaXMuc2NoZWR1bGVUb29sYmFySGlkZSgpOwogICAgICAgIGlmICgKICAgICAgICAgIHRoaXMucmV2ZWFsSW5zdGFuY2UgJiYKICAgICAgICAgIHR5cGVvZiB0aGlzLnJldmVhbEluc3RhbmNlLnByZXYgPT09ICJmdW5jdGlvbiIKICAgICAgICApIHsKICAgICAgICAgIHRoaXMucmV2ZWFsSW5zdGFuY2UucHJldigpOwogICAgICAgIH0KICAgICAgfSwKCiAgICAgIG5leHRTbGlkZSgpIHsKICAgICAgICB0aGlzLnNjaGVkdWxlVG9vbGJhckhpZGUoKTsKICAgICAgICBpZiAoCiAgICAgICAgICB0aGlzLnJldmVhbEluc3RhbmNlICYmCiAgICAgICAgICB0eXBlb2YgdGhpcy5yZXZlYWxJbnN0YW5jZS5uZXh0ID09PSAiZnVuY3Rpb24iCiAgICAgICAgKSB7CiAgICAgICAgICB0aGlzLnJldmVhbEluc3RhbmNlLm5leHQoKTsKICAgICAgICB9CiAgICAgIH0sCgogICAgICBkaXNwb3NlQWxsQ2hhcnRzKCkgewogICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzOwogICAgICAgIE9iamVjdC5rZXlzKHRoaXMuY2hhcnRJbnN0YW5jZXMpLmZvckVhY2goKGtleSkgPT4gewogICAgICAgICAgdHJ5IHsKICAgICAgICAgICAgc2VsZi5jaGFydEluc3RhbmNlc1trZXldLmRlc3Ryb3koKTsKICAgICAgICAgIH0gY2F0Y2ggKGUpIHt9CiAgICAgICAgfSk7CiAgICAgICAgdGhpcy5jaGFydEluc3RhbmNlcyA9IHt9OwogICAgICB9LAogICAgfSwKICAgIGJlZm9yZURlc3Ryb3koKSB7CiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCJrZXlkb3duIiwgdGhpcy5oYW5kbGVLZXlEb3duKTsKICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoInJlc2l6ZSIsIHRoaXMuaGFuZGxlQ2hhcnRSZXNpemUpOwogICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigibW91c2Vtb3ZlIiwgdGhpcy5oYW5kbGVNb3VzZU1vdmUpOwogICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigidG91Y2hzdGFydCIsIHRoaXMuaGFuZGxlTW91c2VNb3ZlKTsKICAgICAgaWYgKHRoaXMudG9vbGJhclRpbWVyKSB7CiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudG9vbGJhclRpbWVyKTsKICAgICAgICB0aGlzLnRvb2xiYXJUaW1lciA9IG51bGw7CiAgICAgIH0KICAgICAgdGhpcy5kaXNwb3NlQWxsQ2hhcnRzKCk7CiAgICAgIGlmICh0aGlzLnJldmVhbEluc3RhbmNlKSB7CiAgICAgICAgdHJ5IHsKICAgICAgICAgIHRoaXMucmV2ZWFsSW5zdGFuY2UuZGVzdHJveSgpOwogICAgICAgIH0gY2F0Y2ggKGUpIHt9CiAgICAgIH0KICAgIH0sCiAgfTsKPC9zY3JpcHQ+Cgo8c3R5bGUgc2NvcGVkPgogIC8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogICAgIOiuvuiuoeS7pOeJjO+8iERlc2lnbiBUb2tlbnPvvInigJTigJQg5a+56b2QIG11c2UtbW9kZWxpbmcuY29tIOS6ruiJsuezuwogICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqLwogIC5wdi1yb290IHsKICAgIC0tcHYtZm9udC1zeXN0ZW06IC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgIlNGIFBybyBEaXNwbGF5IiwKICAgICAgIlNGIFBybyBUZXh0IiwgIkhlbHZldGljYSBOZXVlIiwgIlBpbmdGYW5nIFNDIiwgIkhpcmFnaW5vIFNhbnMgR0IiLAogICAgICAiTWljcm9zb2Z0IFlhSGVpIiwgc2Fucy1zZXJpZjsKCiAgICAtLXB2LWFjY2VudDogIzAwNzFlMzsKICAgIC0tcHYtYWNjZW50LWhvdmVyOiAjMDA3N2VkOwogICAgLS1wdi1hY2NlbnQtc29mdDogI2YwZjlmZjsKICAgIC0tcHYtYWNjZW50LWdsb3c6IHJnYmEoMCwgMTEzLCAyMjcsIDAuMTQpOwogICAgLS1wdi1iZzogI2Y1ZjVmNzsKICAgIC0tcHYtc3VyZmFjZTogI2ZmZmZmZjsKICAgIC0tcHYtc3VyZmFjZS0yOiAjZmFmYWZjOwogICAgLS1wdi1ib3JkZXI6ICNlOGU4ZWQ7CiAgICAtLXB2LWJvcmRlci1ob3ZlcjogcmdiYSgwLCAxMTMsIDIyNywgMC4zNSk7CiAgICAtLXB2LXRleHQtMTogIzFkMWQxZjsKICAgIC0tcHYtdGV4dC0yOiAjNmU2ZTczOwogICAgLS1wdi10ZXh0LTM6ICM4Njg2OGI7CgogICAgLyog6K6pIEVsZW1lbnQgUGx1cyDkuLvoibLot5/pmo/oi7nmnpzok50gKi8KICAgIC0tZWwtY29sb3ItcHJpbWFyeTogIzAwNzFlMzsKICAgIC0tZWwtY29sb3ItcHJpbWFyeS1saWdodC0zOiAjNGM5Y2ViOwogICAgLS1lbC1jb2xvci1wcmltYXJ5LWxpZ2h0LTU6ICM4MGI4ZjE7CiAgICAtLWVsLWNvbG9yLXByaW1hcnktbGlnaHQtNzogI2IzZDRmNjsKICAgIC0tZWwtY29sb3ItcHJpbWFyeS1saWdodC04OiAjY2NlMmY5OwogICAgLS1lbC1jb2xvci1wcmltYXJ5LWxpZ2h0LTk6ICNlNmYxZmM7CiAgICAtLWVsLWNvbG9yLXByaW1hcnktZGFyay0yOiAjMDA1YWI2OwoKICAgIC8qIDEyIOagj+e9keagvOezu+e7n+S7pOeJjCAqLwogICAgLS1wdi1ncmlkLWNvbHM6IDEyOwogICAgLS1wdi1ncmlkLWd1dHRlcjogMjRweDsKICAgIC0tcHYtZ3JpZC1tYXJnaW46IDYlOwogICAgLyog5a6J5YWo6L656LedIDUlfjglIOWMuumXtCAqLwoKICAgIC8qIOWchuinkuS9k+ezuyAqLwogICAgLS1wdi1yYWRpdXMtc206IDhweDsKICAgIC0tcHYtcmFkaXVzLW1kOiAxNHB4OwogICAgLS1wdi1yYWRpdXMtbGc6IDE4cHg7CiAgICAtLXB2LXJhZGl1cy14bDogMjRweDsKICAgIC0tcHYtcmFkaXVzLTJ4bDogMjhweDsKICAgIC0tcHYtcmFkaXVzLXBpbGw6IDk4MHB4OwoKICAgIC8qIOmYtOW9seS9k+ezuyAqLwogICAgLS1wdi1zaGFkb3ctc206IDAgMXB4IDJweCByZ2JhKDE1LCAyMywgNDIsIDAuMDQpOwogICAgLS1wdi1zaGFkb3ctbWQ6IDAgMnB4IDhweCByZ2JhKDE1LCAyMywgNDIsIDAuMDYpLAogICAgICAwIDRweCAxNnB4IHJnYmEoMTUsIDIzLCA0MiwgMC4wNCk7CiAgICAtLXB2LXNoYWRvdy1sZzogMCA4cHggMjRweCByZ2JhKDE1LCAyMywgNDIsIDAuMDgpLAogICAgICAwIDEycHggNDBweCByZ2JhKDE1LCAyMywgNDIsIDAuMDYpOwogICAgLS1wdi1zaGFkb3cteGw6IDAgMTZweCA0OHB4IHJnYmEoMTUsIDIzLCA0MiwgMC4xMiksCiAgICAgIDAgMjRweCA2NHB4IHJnYmEoMTUsIDIzLCA0MiwgMC4wOCk7CgogICAgLyog6L+H5rihICovCiAgICAtLXB2LWVhc2U6IGN1YmljLWJlemllcigwLjQsIDAsIDAuMiwgMSk7CiAgICAtLXB2LWR1cjogMC4zczsKICB9CgogIC8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogICAgIOagueWuueWZqCAmIOS4u+mdouadvwogICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqLwogIC5wdi1yb290IHsKICAgIG1pbi1oZWlnaHQ6IDEwMGR2aDsKICAgIGZvbnQtZmFtaWx5OiB2YXIoLS1wdi1mb250LXN5c3RlbSk7CiAgICAtd2Via2l0LWZvbnQtc21vb3RoaW5nOiBhbnRpYWxpYXNlZDsKICAgIC1tb3otb3N4LWZvbnQtc21vb3RoaW5nOiBncmF5c2NhbGU7CiAgICB0ZXh0LXJlbmRlcmluZzogb3B0aW1pemVMZWdpYmlsaXR5OwogICAgYmFja2dyb3VuZDogdmFyKC0tcHYtc3VyZmFjZSk7CiAgICBwYWRkaW5nOiAyNHB4OwogIH0KCiAgLnB2LWNvbnRhaW5lciB7CiAgICBtYXgtd2lkdGg6IDEyMDBweDsKICAgIG1hcmdpbjogMCBhdXRvOwogIH0KCiAgLnB2LW1haW4tY2FyZCB7CiAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1wdi1yYWRpdXMteGwpOwogICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tcHYtYm9yZGVyKTsKICAgIGJhY2tncm91bmQ6IHZhcigtLXB2LWJnKTsKICAgIG92ZXJmbG93OiBoaWRkZW47CiAgfQoKICAucHYtbWFpbi1jYXJkIDpkZWVwKC5lbC1jYXJkX19ib2R5KSB7CiAgICBwYWRkaW5nOiAwOwogIH0KCiAgLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CiAgICAg6aG26YOo5qCH6aKY5qCP5qih5Z2X77yI5Zu65a6a6auY5bqm77yJCiAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovCiAgLnB2LWhlYWRlciB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsKICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsKICAgIGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0OwogICAgZ2FwOiAxNnB4OwogICAgcGFkZGluZzogMzZweCA0MHB4IDI4cHg7CiAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tcHYtYm9yZGVyKTsKICAgIGJhY2tncm91bmQ6IHZhcigtLXB2LXN1cmZhY2UpOwogIH0KCiAgQG1lZGlhIChtaW4td2lkdGg6IDY0MHB4KSB7CiAgICAucHYtaGVhZGVyIHsKICAgICAgZmxleC1kaXJlY3Rpb246IHJvdzsKICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIH0KICB9CgogIC5wdi1oZWFkZXItc3RhcnQgewogICAgZGlzcGxheTogZmxleDsKICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47CiAgICBnYXA6IDEwcHg7CiAgfQoKICAucHYtdGl0bGUgewogICAgZm9udC1zaXplOiAyLjI1cmVtOwogICAgZm9udC13ZWlnaHQ6IDYwMDsKICAgIGNvbG9yOiB2YXIoLS1wdi10ZXh0LTEpOwogICAgbGV0dGVyLXNwYWNpbmc6IC0wLjAyNWVtOwogICAgbGluZS1oZWlnaHQ6IDEuMTU7CiAgICBtYXJnaW46IDA7CiAgfQoKICAucHYtYmFkZ2UgewogICAgZGlzcGxheTogaW5saW5lLWJsb2NrOwogICAgd2lkdGg6IGZpdC1jb250ZW50OwogICAgZm9udC1zaXplOiAwLjgxMjVyZW07CiAgICBmb250LXdlaWdodDogNjAwOwogICAgY29sb3I6IHZhcigtLXB2LWFjY2VudCk7CiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1wdi1hY2NlbnQtc29mdCk7CiAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDAsIDExMywgMjI3LCAwLjE4KTsKICAgIGJvcmRlci1yYWRpdXM6IDk5OXB4OwogICAgcGFkZGluZzogNXB4IDE2cHg7CiAgICBtYXJnaW46IDA7CiAgfQoKICAucHYtcGxheS1idG4gewogICAgYm9yZGVyLXJhZGl1czogdmFyKC0tcHYtcmFkaXVzLXBpbGwpOwogICAgbWluLWhlaWdodDogNDRweDsKICAgIHBhZGRpbmc6IDAgMjRweDsKICAgIGZvbnQtd2VpZ2h0OiA2MDA7CiAgICBmbGV4LXNocmluazogMDsKICB9CgogIC5wdi1wbGF5LWljb24gewogICAgZm9udC1zaXplOiAxLjI1cmVtOwogICAgbWFyZ2luLXJpZ2h0OiA0cHg7CiAgfQoKICAvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KICAgICDlubvnga/niYfpooTop4jnvZHmoLzljLoKICAgICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi8KICAucHYtZ3JpZCB7CiAgICBkaXNwbGF5OiBncmlkOwogICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoYXV0by1maWxsLCBtaW5tYXgoMzQwcHgsIDFmcikpOwogICAgZ2FwOiAyNHB4OwogICAgcGFkZGluZzogMjRweCA0MHB4IDQwcHg7CiAgfQoKICAucHYtc2xpZGUtY2FyZCB7CiAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1wdi1yYWRpdXMtbGcpOwogICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tcHYtYm9yZGVyKTsKICAgIHRyYW5zaXRpb246IGFsbCB2YXIoLS1wdi1kdXIpIHZhcigtLXB2LWVhc2UpOwogICAgb3ZlcmZsb3c6IGhpZGRlbjsKICAgIGN1cnNvcjogcG9pbnRlcjsKICB9CgogIC5wdi1zbGlkZS1jYXJkOmZvY3VzLXZpc2libGUgewogICAgb3V0bGluZTogMnB4IHNvbGlkIHZhcigtLXB2LWFjY2VudCk7CiAgICBvdXRsaW5lLW9mZnNldDogMnB4OwogIH0KCiAgLnB2LXNsaWRlLWNhcmQ6aG92ZXIgewogICAgYm9yZGVyLWNvbG9yOiB2YXIoLS1wdi1ib3JkZXItaG92ZXIpOwogIH0KCiAgLnB2LXNsaWRlLWNhcmQgOmRlZXAoLmVsLWNhcmRfX2JvZHkpIHsKICAgIHBhZGRpbmc6IDA7CiAgfQoKICAvKiDpooTop4jljaHniYflpLTpg6ggKi8KICAucHYtc2xpZGUtY2FyZC1oZWFkIHsKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47CiAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAgcGFkZGluZzogMTZweCAyMHB4OwogICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLXB2LWJvcmRlcik7CiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1wdi1zdXJmYWNlLTIpOwogIH0KCiAgLnB2LXNsaWRlLWNhcmQtaGVhZC1sZWZ0IHsKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAgZ2FwOiAxMnB4OwogICAgbWluLXdpZHRoOiAwOwogIH0KCiAgLnB2LXNsaWRlLWNhcmQtaW5kZXggewogICAgZmxleC1zaHJpbms6IDA7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOwogICAgd2lkdGg6IDI4cHg7CiAgICBoZWlnaHQ6IDI4cHg7CiAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1wdi1yYWRpdXMtc20pOwogICAgYmFja2dyb3VuZDogdmFyKC0tcHYtYWNjZW50LXNvZnQpOwogICAgY29sb3I6IHZhcigtLXB2LWFjY2VudCk7CiAgICBmb250LXNpemU6IDAuODEyNXJlbTsKICAgIGZvbnQtd2VpZ2h0OiA2MDA7CiAgfQoKICAucHYtc2xpZGUtY2FyZC10aXRsZSB7CiAgICBmb250LXNpemU6IDFyZW07CiAgICBmb250LXdlaWdodDogNjAwOwogICAgY29sb3I6IHZhcigtLXB2LXRleHQtMSk7CiAgICBsZXR0ZXItc3BhY2luZzogLTAuMDFlbTsKICAgIGxpbmUtaGVpZ2h0OiAxLjQ7CiAgICBtYXJnaW46IDA7CiAgICB3aGl0ZS1zcGFjZTogbm93cmFwOwogICAgb3ZlcmZsb3c6IGhpZGRlbjsKICAgIHRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzOwogIH0KCiAgLnB2LXNsaWRlLWNhcmQtYmFkZ2UgewogICAgZmxleC1zaHJpbms6IDA7CiAgICBmb250LXNpemU6IDAuNzVyZW07CiAgICBmb250LXdlaWdodDogNjAwOwogICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTsKICAgIGxldHRlci1zcGFjaW5nOiAwLjA0ZW07CiAgICBjb2xvcjogdmFyKC0tcHYtdGV4dC0yKTsKICAgIGJhY2tncm91bmQ6IHZhcigtLXB2LXN1cmZhY2UpOwogICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tcHYtYm9yZGVyKTsKICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLXB2LXJhZGl1cy1zbSk7CiAgICBwYWRkaW5nOiAzcHggMTBweDsKICB9CgogIC8qIOmihOiniOWNoeeJh+ato+aWhyAqLwogIC5wdi1zbGlkZS1jYXJkLWJvZHkgewogICAgcGFkZGluZzogMjBweDsKICAgIG1heC1oZWlnaHQ6IDM0MHB4OwogICAgb3ZlcmZsb3cteTogYXV0bzsKICB9CgogIC5wdi1zbGlkZS1jYXJkLWJvZHk6Oi13ZWJraXQtc2Nyb2xsYmFyIHsKICAgIHdpZHRoOiA0cHg7CiAgfQoKICAucHYtc2xpZGUtY2FyZC1ib2R5Ojotd2Via2l0LXNjcm9sbGJhci10cmFjayB7CiAgICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDsKICB9CgogIC5wdi1zbGlkZS1jYXJkLWJvZHk6Oi13ZWJraXQtc2Nyb2xsYmFyLXRodW1iIHsKICAgIGJhY2tncm91bmQ6IHZhcigtLXB2LWJvcmRlcik7CiAgICBib3JkZXItcmFkaXVzOiAycHg7CiAgfQoKICAvKiDpooTop4jljaHniYcg4oCU4oCUIOWPjOWIl+W4g+WxgCAqLwogIC5wdi1zbGlkZS1jYXJkLWJvZHktLWR1YWwgewogICAgZGlzcGxheTogZ3JpZDsKICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogNWZyIDdmcjsKICAgIGdhcDogMTZweDsKICAgIG1heC1oZWlnaHQ6IDM4MHB4OwogICAgbWluLWhlaWdodDogMjYwcHg7CiAgICBvdmVyZmxvdy15OiBhdXRvOwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGFsaWduLWNvbnRlbnQ6IGNlbnRlcjsKICB9CgogIC5wdi1zbGlkZS1jYXJkLWJvZHktLWR1YWwgLnB2LXNsaWRlLWNhcmQtZWwgewogICAgbWluLXdpZHRoOiAwOwogIH0KCiAgLnB2LXNsaWRlLWNhcmQtYm9keS0tZHVhbCAucHYtc2xpZGUtY2FyZC1lbC0tdGV4dCwKICAucHYtc2xpZGUtY2FyZC1ib2R5LS1kdWFsIC5wdi1zbGlkZS1jYXJkLWVsLS1xdW90ZSwKICAucHYtc2xpZGUtY2FyZC1ib2R5LS1kdWFsIC5wdi1zbGlkZS1jYXJkLWVsLS1pbWFnZSwKICAucHYtc2xpZGUtY2FyZC1ib2R5LS1kdWFsIC5wdi1zbGlkZS1jYXJkLWVsLS10YWJsZSB7CiAgICBncmlkLWNvbHVtbjogMSAvIC0xOwogICAgb3JkZXI6IDA7CiAgfQoKICAucHYtc2xpZGUtY2FyZC1ib2R5LS1kdWFsIC5wdi1zbGlkZS1jYXJkLWVsLS1saXN0IHsKICAgIGdyaWQtY29sdW1uOiAxOwogICAgb3JkZXI6IDE7CiAgfQoKICAucHYtc2xpZGUtY2FyZC1ib2R5LS1kdWFsIC5wdi1zbGlkZS1jYXJkLWVsLS1jaGFydCB7CiAgICBncmlkLWNvbHVtbjogMjsKICAgIG9yZGVyOiAyOwogIH0KCiAgLyog6aKE6KeI5Y2h54mHIOKAlOKAlCDmt7flkIjluIPlsYAgKi8KICAucHYtc2xpZGUtY2FyZC1ib2R5LS1taXhlZCB7CiAgICBkaXNwbGF5OiBncmlkOwogICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiA0ZnIgOGZyOwogICAgZ2FwOiAxNnB4OwogICAgbWF4LWhlaWdodDogMzAwcHg7CiAgICBtaW4taGVpZ2h0OiAyMDBweDsKICAgIG92ZXJmbG93LXk6IGF1dG87CiAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAgYWxpZ24tY29udGVudDogY2VudGVyOwogIH0KCiAgLnB2LXNsaWRlLWNhcmQtYm9keS0tbWl4ZWQgLnB2LXNsaWRlLWNhcmQtZWwtLXRleHQgewogICAgZ3JpZC1jb2x1bW46IDE7CiAgICBvcmRlcjogMTsKICB9CgogIC5wdi1zbGlkZS1jYXJkLWJvZHktLW1peGVkIC5wdi1zbGlkZS1jYXJkLWVsLS1jaGFydCB7CiAgICBncmlkLWNvbHVtbjogMjsKICAgIG9yZGVyOiAyOwogIH0KCiAgLyog6aKE6KeI5Y2h54mH5YaF5a655YWD57SgICovCiAgLnB2LXNsaWRlLWNhcmQtZWwgewogICAgbWFyZ2luLWJvdHRvbTogMTZweDsKICB9CgogIC5wdi1zbGlkZS1jYXJkLWVsOmxhc3QtY2hpbGQgewogICAgbWFyZ2luLWJvdHRvbTogMDsKICB9CgogIC5wdi1jYXJkLXRleHQgewogICAgZm9udC1zaXplOiAwLjgxMjVyZW07CiAgICBjb2xvcjogdmFyKC0tcHYtdGV4dC0yKTsKICAgIGxpbmUtaGVpZ2h0OiAxLjc7CiAgICBtYXJnaW46IDA7CiAgfQoKICAucHYtY2FyZC1saXN0IHsKICAgIGxpc3Qtc3R5bGU6IG5vbmU7CiAgICBwYWRkaW5nOiAwOwogICAgbWFyZ2luOiAwOwogICAgZGlzcGxheTogZmxleDsKICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47CiAgICBnYXA6IDhweDsKICB9CgogIC5wdi1jYXJkLWxpc3QtaXRlbSB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7CiAgICBnYXA6IDhweDsKICAgIGZvbnQtc2l6ZTogMC44MTI1cmVtOwogICAgY29sb3I6IHZhcigtLXB2LXRleHQtMik7CiAgICBsaW5lLWhlaWdodDogMS41OwogIH0KCiAgLnB2LWNhcmQtbGlzdC1jaGVjayB7CiAgICBjb2xvcjogdmFyKC0tcHYtYWNjZW50KTsKICAgIGZsZXgtc2hyaW5rOiAwOwogICAgbWFyZ2luLXRvcDogMC4xNWVtOwogICAgZm9udC1zaXplOiAwLjg3NXJlbTsKICB9CgogIC5wdi1jYXJkLWNoYXJ0IHsKICAgIGJhY2tncm91bmQ6IHZhcigtLXB2LXN1cmZhY2UtMik7CiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1wdi1ib3JkZXIpOwogICAgYm9yZGVyLXJhZGl1czogdmFyKC0tcHYtcmFkaXVzLW1kKTsKICAgIHBhZGRpbmc6IDEycHg7CiAgICBtaW4taGVpZ2h0OiAxNDBweDsKICAgIG1heC1oZWlnaHQ6IDIwMHB4OwogICAgZGlzcGxheTogZmxleDsKICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47CiAgICBvdmVyZmxvdzogaGlkZGVuOwogIH0KCiAgLnB2LWNhcmQtY2hhcnQtaGVhZGVyIHsKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAgZ2FwOiA2cHg7CiAgICBtYXJnaW4tYm90dG9tOiA4cHg7CiAgfQoKICAucHYtY2FyZC1jaGFydC1pY29uLXNtIHsKICAgIGNvbG9yOiB2YXIoLS1wdi1hY2NlbnQpOwogICAgZm9udC1zaXplOiAwLjg3NXJlbTsKICB9CgogIC5wdi1jYXJkLWNoYXJ0LWxhYmVsLXNtIHsKICAgIGZvbnQtc2l6ZTogMC43NXJlbTsKICAgIGZvbnQtd2VpZ2h0OiA2MDA7CiAgICBjb2xvcjogdmFyKC0tcHYtdGV4dC0yKTsKICB9CgogIC5wdi1jYXJkLWNoYXJ0LWNhbnZhcyB7CiAgICB3aWR0aDogMTAwJTsKICAgIGhlaWdodDogMTMwcHg7CiAgICBtYXgtaGVpZ2h0OiAxNTBweDsKICAgIGZsZXgtc2hyaW5rOiAwOwogIH0KCiAgLnB2LWNhcmQtbWVybWFpZC1jb250YWluZXIgewogICAgd2lkdGg6IDEwMCU7CiAgICBmbGV4OiAxOwogICAgbWluLWhlaWdodDogMTIwcHg7CiAgICBtYXgtaGVpZ2h0OiAxODBweDsKICAgIG92ZXJmbG93OiBoaWRkZW47CiAgICBkaXNwbGF5OiBmbGV4OwogICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7CiAgICBhbGlnbi1pdGVtczogY2VudGVyOwogIH0KCiAgLnB2LWNhcmQtbWVybWFpZC1jb250YWluZXIgOmRlZXAoc3ZnKSB7CiAgICBtYXgtd2lkdGg6IDEwMCU7CiAgICBoZWlnaHQ6IGF1dG87CiAgfQoKICAucHYtY2FyZC1pbWFnZS1ib3ggewogICAgYm9yZGVyLXJhZGl1czogdmFyKC0tcHYtcmFkaXVzLXNtKTsKICAgIG92ZXJmbG93OiBoaWRkZW47CiAgICBtYXgtaGVpZ2h0OiAxNDBweDsKICB9CgogIC5wdi1jYXJkLWltZyB7CiAgICB3aWR0aDogMTAwJTsKICAgIGhlaWdodDogMTAwJTsKICAgIG9iamVjdC1maXQ6IGNvdmVyOwogIH0KCiAgLnB2LWNhcmQtcXVvdGUgewogICAgbWFyZ2luOiAwOwogICAgcGFkZGluZzogMTJweCAxNnB4OwogICAgYmFja2dyb3VuZDogdmFyKC0tcHYtYWNjZW50LXNvZnQpOwogICAgYm9yZGVyLWxlZnQ6IDRweCBzb2xpZCB2YXIoLS1wdi1hY2NlbnQpOwogICAgYm9yZGVyLXJhZGl1czogMCB2YXIoLS1wdi1yYWRpdXMtc20pIHZhcigtLXB2LXJhZGl1cy1zbSkgMDsKICAgIGNvbG9yOiB2YXIoLS1wdi10ZXh0LTIpOwogICAgZm9udC1zdHlsZTogaXRhbGljOwogICAgZm9udC1zaXplOiAwLjgxMjVyZW07CiAgICBkaXNwbGF5OiBmbGV4OwogICAgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7CiAgICBnYXA6IDZweDsKICB9CgogIC5wdi1jYXJkLXF1b3RlLWljb24gewogICAgY29sb3I6IHJnYmEoMCwgMTEzLCAyMjcsIDAuMyk7CiAgICBmb250LXNpemU6IDEuNXJlbTsKICAgIGxpbmUtaGVpZ2h0OiAxOwogIH0KCiAgLnB2LWNhcmQtdGFibGUtYm94IHsKICAgIHdpZHRoOiAxMDAlOwogICAgb3ZlcmZsb3cteDogYXV0bzsKICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLXB2LWJvcmRlcik7CiAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1wdi1yYWRpdXMtc20pOwogIH0KCiAgLnB2LWNhcmQtdGFibGUgewogICAgd2lkdGg6IDEwMCU7CiAgICBib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOwogICAgZm9udC1zaXplOiAwLjc1cmVtOwogICAgdGV4dC1hbGlnbjogbGVmdDsKICB9CgogIC5wdi1jYXJkLXRhYmxlIHRoZWFkIHsKICAgIGJhY2tncm91bmQ6IHZhcigtLXB2LXN1cmZhY2UtMik7CiAgfQoKICAucHYtY2FyZC10YWJsZSB0aCB7CiAgICBwYWRkaW5nOiA4cHggMTBweDsKICAgIGZvbnQtd2VpZ2h0OiA2MDA7CiAgICBjb2xvcjogdmFyKC0tcHYtdGV4dC0xKTsKICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS1wdi1ib3JkZXIpOwogICAgd2hpdGUtc3BhY2U6IG5vd3JhcDsKICB9CgogIC5wdi1jYXJkLXRhYmxlIHRkIHsKICAgIHBhZGRpbmc6IDdweCAxMHB4OwogICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLXB2LWJvcmRlcik7CiAgICBjb2xvcjogdmFyKC0tcHYtdGV4dC0yKTsKICB9CgogIC5wdi1jYXJkLXRhYmxlIHRyOmxhc3QtY2hpbGQgdGQgewogICAgYm9yZGVyLWJvdHRvbTogbm9uZTsKICB9CgogIC8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogICAgIOWFqOWxj+aUvuaYoOimhuebluWxggogICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqLwogIC5wdi1yZXZlYWwtb3ZlcmxheSB7CiAgICBwb3NpdGlvbjogZml4ZWQ7CiAgICBpbnNldDogMDsKICAgIHotaW5kZXg6IDUwOwogICAgYmFja2dyb3VuZDogdmFyKC0tcHYtc3VyZmFjZSk7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsKICB9CgogIC5wdi1yZXZlYWwtdG9vbGJhciB7CiAgICBwb3NpdGlvbjogYWJzb2x1dGU7CiAgICB0b3A6IDA7CiAgICBsZWZ0OiAwOwogICAgcmlnaHQ6IDA7CiAgICBkaXNwbGF5OiBmbGV4OwogICAganVzdGlmeS1jb250ZW50OiByaWdodDsKICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICBwYWRkaW5nOiAwIDEwcHg7CiAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNzIpOwogICAgYmFja2Ryb3AtZmlsdGVyOiBzYXR1cmF0ZSgxODAlKSBibHVyKDIwcHgpOwogICAgLXdlYmtpdC1iYWNrZHJvcC1maWx0ZXI6IHNhdHVyYXRlKDE4MCUpIGJsdXIoMjBweCk7CiAgICB6LWluZGV4OiAxMDsKICAgIGhlaWdodDogMzZweDsKICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7CiAgICB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuNHMgdmFyKC0tcHYtZWFzZSksIHRyYW5zZm9ybSAwLjRzIHZhcigtLXB2LWVhc2UpOwogIH0KCiAgLnB2LXJldmVhbC1vdmVybGF5LS1pZGxlIC5wdi1yZXZlYWwtdG9vbGJhciB7CiAgICBvcGFjaXR5OiAwOwogICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0xMDAlKTsKICAgIHBvaW50ZXItZXZlbnRzOiBub25lOwogIH0KCiAgLnB2LXJldmVhbC10b29sYmFyLWljb24gewogICAgZm9udC1zaXplOiAwLjkzNzVyZW07CiAgICBjb2xvcjogdmFyKC0tcHYtdGV4dC0zKTsKICB9CgogIC5wdi1yZXZlYWwtdG9vbGJhci10aXRsZSB7CiAgICBmb250LXNpemU6IDAuODEyNXJlbTsKICAgIGZvbnQtd2VpZ2h0OiA2MDA7CiAgICBjb2xvcjogdmFyKC0tcHYtdGV4dC0xKTsKICB9CgogIC5wdi1yZXZlYWwtdG9vbGJhci1yaWdodCB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGZsb2F0OiByaWdodDsKICAgIGdhcDogM3B4OwogIH0KCiAgLnB2LXJldmVhbC1uYXYtYnRuIHsKICAgIC0tZWwtYnV0dG9uLWJnLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuMDQpOwogICAgLS1lbC1idXR0b24tYm9yZGVyLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuMDQpOwogICAgLS1lbC1idXR0b24tdGV4dC1jb2xvcjogdmFyKC0tcHYtdGV4dC0xKTsKICAgIC0tZWwtYnV0dG9uLWhvdmVyLWJnLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuMDgpOwogICAgLS1lbC1idXR0b24taG92ZXItYm9yZGVyLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuMDgpOwogICAgLS1lbC1idXR0b24taG92ZXItdGV4dC1jb2xvcjogdmFyKC0tcHYtdGV4dC0xKTsKICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLXB2LXJhZGl1cy1waWxsKTsKICAgIHdpZHRoOiAyOHB4OwogICAgaGVpZ2h0OiAyOHB4OwogICAgcGFkZGluZzogMDsKICAgIGZvbnQtc2l6ZTogMC44NzVyZW07CiAgfQoKICAucHYtcmV2ZWFsLWV4aXQtYnRuIHsKICAgIC0tZWwtYnV0dG9uLWJnLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuMDQpOwogICAgLS1lbC1idXR0b24tYm9yZGVyLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuMDQpOwogICAgLS1lbC1idXR0b24tdGV4dC1jb2xvcjogdmFyKC0tcHYtdGV4dC0xKTsKICAgIC0tZWwtYnV0dG9uLWhvdmVyLWJnLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuMDgpOwogICAgLS1lbC1idXR0b24taG92ZXItYm9yZGVyLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuMDgpOwogICAgLS1lbC1idXR0b24taG92ZXItdGV4dC1jb2xvcjogdmFyKC0tcHYtdGV4dC0xKTsKICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLXB2LXJhZGl1cy1waWxsKTsKICAgIGZvbnQtd2VpZ2h0OiA1MDA7CiAgICBmb250LXNpemU6IDAuNzVyZW07CiAgICBoZWlnaHQ6IDI4cHg7CiAgICBwYWRkaW5nOiAwIDE0cHg7CiAgfQoKICAucHYtcmV2ZWFsLXN0YWdlIHsKICAgIGZsZXg6IDE7CiAgICB3aWR0aDogMTAwJTsKICAgIG1pbi1oZWlnaHQ6IDA7CiAgICBvdmVyZmxvdzogaGlkZGVuOwogICAgYmFja2dyb3VuZDogdmFyKC0tcHYtc3VyZmFjZSk7CiAgfQoKICAvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KICAgICDmlL7mmKDoiJ7lj7Ag4oCU4oCUIOaooeWdl+WMluW4g+WxgCAoSGVhZGVyIC8gQm9keSAvIEZvb3RlcikKICAgICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi8KICAucnMtc2xpZGUgewogICAgLS1ycy10aXRsZS1zaXplOiA1NHB4OwogICAgLS1ycy10ZXh0LXNpemU6IDQycHg7CiAgICAtLXJzLWxpc3Qtc2l6ZTogMzhweDsKICAgIC0tcnMtbGlzdC1nYXA6IDIwcHg7CiAgICAtLXJzLWJvZHktcGFkLXk6IDMycHg7CiAgICAtLXJzLWJsb2NrLWdhcDogMjRweDsKICAgIC0tcnMtaXRlbS1wYWQteTogMjBweDsKICAgIC0tcnMtaXRlbS1wYWQteDogMjhweDsKICAgIC0tcnMtY2hhcnQtbWluLWg6IDQyMHB4OwogICAgLS1ycy1jaGFydC1pbm5lci1taW4taDogNDAwcHg7CiAgICAtLXJzLXF1b3RlLXNpemU6IDMwcHg7CiAgICAtLXJzLXRhYmxlLXNpemU6IDI0cHg7CiAgICAtLXJzLWltZy1tYXgtaDogNTIwcHg7CiAgICAtLXJzLWZvb3Rlci1zaXplOiAxOHB4OwogICAgLS1ycy1oZWFkZXItcGFkOiAyMHB4OwogICAgLS1ycy1zYWZldHktbWFyZ2luOiA2JTsKCiAgICB0ZXh0LWFsaWduOiBjZW50ZXIgIWltcG9ydGFudDsKICAgIGRpc3BsYXk6IGZsZXggIWltcG9ydGFudDsKICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW4gIWltcG9ydGFudDsKICAgIGFsaWduLWl0ZW1zOiBjZW50ZXIgIWltcG9ydGFudDsKICAgIGp1c3RpZnktY29udGVudDogZmxleC1zdGFydCAhaW1wb3J0YW50OwogICAgcGFkZGluZzogMCAhaW1wb3J0YW50OwogICAgaGVpZ2h0OiAxMDAlICFpbXBvcnRhbnQ7CiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94ICFpbXBvcnRhbnQ7CiAgICBvdmVyZmxvdzogaGlkZGVuICFpbXBvcnRhbnQ7CiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1wdi1zdXJmYWNlKSAhaW1wb3J0YW50OwogICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tcHYtYm9yZGVyKSAhaW1wb3J0YW50OwogICAgYm9yZGVyLXJhZGl1czogdmFyKC0tcHYtcmFkaXVzLXhsKSAhaW1wb3J0YW50OwogIH0KCiAgLyogPT09PT0g5a+G5bqm57O757ufID09PT09ICovCiAgLnJzLWRlbnNpdHktbWVkaXVtIHsKICAgIC0tcnMtdGl0bGUtc2l6ZTogNDZweDsKICAgIC0tcnMtdGV4dC1zaXplOiAzNHB4OwogICAgLS1ycy1saXN0LXNpemU6IDMycHg7CiAgICAtLXJzLWxpc3QtZ2FwOiAxNHB4OwogICAgLS1ycy1ib2R5LXBhZC15OiAyNHB4OwogICAgLS1ycy1ibG9jay1nYXA6IDE4cHg7CiAgICAtLXJzLWl0ZW0tcGFkLXk6IDE2cHg7CiAgICAtLXJzLWl0ZW0tcGFkLXg6IDI0cHg7CiAgICAtLXJzLWNoYXJ0LW1pbi1oOiAzNjBweDsKICAgIC0tcnMtY2hhcnQtaW5uZXItbWluLWg6IDM0MHB4OwogICAgLS1ycy1xdW90ZS1zaXplOiAyNnB4OwogICAgLS1ycy10YWJsZS1zaXplOiAyMHB4OwogICAgLS1ycy1pbWctbWF4LWg6IDQyMHB4OwogICAgLS1ycy1mb290ZXItc2l6ZTogMTZweDsKICAgIC0tcnMtaGVhZGVyLXBhZDogMThweDsKICB9CgogIC5ycy1kZW5zaXR5LWhlYXZ5IHsKICAgIC0tcnMtdGl0bGUtc2l6ZTogMzhweDsKICAgIC0tcnMtdGV4dC1zaXplOiAyNHB4OwogICAgLS1ycy1saXN0LXNpemU6IDIycHg7CiAgICAtLXJzLWxpc3QtZ2FwOiAxMHB4OwogICAgLS1ycy1ib2R5LXBhZC15OiAyMHB4OwogICAgLS1ycy1ibG9jay1nYXA6IDE0cHg7CiAgICAtLXJzLWl0ZW0tcGFkLXk6IDE0cHg7CiAgICAtLXJzLWl0ZW0tcGFkLXg6IDIwcHg7CiAgICAtLXJzLWNoYXJ0LW1pbi1oOiAzMDBweDsKICAgIC0tcnMtY2hhcnQtaW5uZXItbWluLWg6IDI4MHB4OwogICAgLS1ycy1xdW90ZS1zaXplOiAyMnB4OwogICAgLS1ycy10YWJsZS1zaXplOiAxOHB4OwogICAgLS1ycy1pbWctbWF4LWg6IDMyMHB4OwogICAgLS1ycy1mb290ZXItc2l6ZTogMTRweDsKICAgIC0tcnMtaGVhZGVyLXBhZDogMTZweDsKICB9CgogIC5ycy1kZW5zaXR5LWV4dHJlbWUgewogICAgLS1ycy10aXRsZS1zaXplOiAzMnB4OwogICAgLS1ycy10ZXh0LXNpemU6IDE4cHg7CiAgICAtLXJzLWxpc3Qtc2l6ZTogMThweDsKICAgIC0tcnMtbGlzdC1nYXA6IDZweDsKICAgIC0tcnMtYm9keS1wYWQteTogMTZweDsKICAgIC0tcnMtYmxvY2stZ2FwOiAxMHB4OwogICAgLS1ycy1pdGVtLXBhZC15OiAxMHB4OwogICAgLS1ycy1pdGVtLXBhZC14OiAxNnB4OwogICAgLS1ycy1jaGFydC1taW4taDogMjQwcHg7CiAgICAtLXJzLWNoYXJ0LWlubmVyLW1pbi1oOiAyMjBweDsKICAgIC0tcnMtcXVvdGUtc2l6ZTogMThweDsKICAgIC0tcnMtdGFibGUtc2l6ZTogMTZweDsKICAgIC0tcnMtaW1nLW1heC1oOiAyNjBweDsKICAgIC0tcnMtZm9vdGVyLXNpemU6IDEycHg7CiAgICAtLXJzLWhlYWRlci1wYWQ6IDE0cHg7CiAgfQoKICAvKiA9PT09PSDpobbpg6jmoIfpopjmoI/mqKHlnZcgPT09PT0gKi8KICAucnMtaGVhZGVyIHsKICAgIHdpZHRoOiAxMDAlOwogICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7CiAgICBwYWRkaW5nOiB2YXIoLS1ycy1oZWFkZXItcGFkKSB2YXIoLS1ycy1zYWZldHktbWFyZ2luKTsKICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsKICAgIGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0OwogICAgZ2FwOiA4cHg7CiAgICBmbGV4LXNocmluazogMDsKICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS1wdi1ib3JkZXIpOwogICAgcG9zaXRpb246IHJlbGF0aXZlOwogIH0KCiAgLnJzLWhlYWRlci1iYWRnZSB7CiAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7CiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1wdi1hY2NlbnQtc29mdCk7CiAgICBjb2xvcjogdmFyKC0tcHYtYWNjZW50KTsKICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMCwgMTEzLCAyMjcsIDAuMTgpOwogICAgYm9yZGVyLXJhZGl1czogdmFyKC0tcHYtcmFkaXVzLXBpbGwpOwogICAgcGFkZGluZzogNHB4IDE0cHg7CiAgICBmb250LXNpemU6IDEzcHg7CiAgICBmb250LXdlaWdodDogNjAwOwogICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTsKICAgIGxldHRlci1zcGFjaW5nOiAwLjA2ZW07CiAgfQoKICAucnMtaGVhZGVyLXRpdGxlIHsKICAgIGNvbG9yOiB2YXIoLS1wdi10ZXh0LTEpICFpbXBvcnRhbnQ7CiAgICBmb250LXNpemU6IHZhcigtLXJzLXRpdGxlLXNpemUpICFpbXBvcnRhbnQ7CiAgICBmb250LXdlaWdodDogNjAwICFpbXBvcnRhbnQ7CiAgICBsZXR0ZXItc3BhY2luZzogLTAuMDJlbSAhaW1wb3J0YW50OwogICAgbGluZS1oZWlnaHQ6IDEuMiAhaW1wb3J0YW50OwogICAgbWFyZ2luOiAwICFpbXBvcnRhbnQ7CiAgICB0ZXh0LWFsaWduOiBsZWZ0ICFpbXBvcnRhbnQ7CiAgICB0ZXh0LXNoYWRvdzogbm9uZSAhaW1wb3J0YW50OwogIH0KCiAgLyogPT09PT0g5q2j5paH5Z2X77yIMTIg5qCP572R5qC8ICsg5a6J5YWo6L656Led77yJID09PT09ICovCiAgLnJzLWJvZHkgewogICAgZmxleDogMTsKICAgIHdpZHRoOiAxMDAlOwogICAgb3ZlcmZsb3cteTogYXV0bzsKICAgIHBhZGRpbmc6IHZhcigtLXJzLWJvZHktcGFkLXkpIHZhcigtLXJzLXNhZmV0eS1tYXJnaW4pOwogICAgYm94LXNpemluZzogYm9yZGVyLWJveDsKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOwogICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7CiAgICBnYXA6IHZhcigtLXJzLWJsb2NrLWdhcCk7CiAgfQoKICAucnMtYm9keTo6LXdlYmtpdC1zY3JvbGxiYXIgewogICAgd2lkdGg6IDVweDsKICB9CgogIC5ycy1ib2R5Ojotd2Via2l0LXNjcm9sbGJhci10cmFjayB7CiAgICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDsKICB9CgogIC5ycy1ib2R5Ojotd2Via2l0LXNjcm9sbGJhci10aHVtYiB7CiAgICBiYWNrZ3JvdW5kOiByZ2JhKDE0OCwgMTYzLCAxODQsIDAuMyk7CiAgICBib3JkZXItcmFkaXVzOiAzcHg7CiAgfQoKICAvKiA9PT09PSDlj4zliJfluIPlsYDvvJoxMiDmoI/nvZHmoLzvvIw1Lzcg5YiG5qCPID09PT09ICovCiAgLnJzLWJvZHktLWR1YWwgewogICAgZGlzcGxheTogZ3JpZDsKICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDEyLCAxZnIpOwogICAgZ2FwOiB2YXIoLS1ycy1ibG9jay1nYXApOwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGp1c3RpZnktY29udGVudDogaW5pdGlhbDsKICAgIG1pbi1oZWlnaHQ6IDA7CiAgICBoZWlnaHQ6IDEwMCU7CiAgfQoKICAucnMtYm9keS0tZHVhbCAucnMtYm9keS1ibG9jayB7CiAgICBtYXJnaW46IDA7CiAgICB3aWR0aDogMTAwJTsKICAgIG1pbi1oZWlnaHQ6IDA7CiAgICBoZWlnaHQ6IDEwMCU7CiAgICBtYXgtaGVpZ2h0OiAxMDAlOwogICAgZGlzcGxheTogZmxleDsKICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47CiAgfQoKICAucnMtYm9keS0tZHVhbCAucnMtYm9keS1ibG9jay0tdGV4dCwKICAucnMtYm9keS0tZHVhbCAucnMtYm9keS1ibG9jay0tcXVvdGUsCiAgLnJzLWJvZHktLWR1YWwgLnJzLWJvZHktYmxvY2stLWltYWdlLAogIC5ycy1ib2R5LS1kdWFsIC5ycy1ib2R5LWJsb2NrLS10YWJsZSB7CiAgICBncmlkLWNvbHVtbjogMSAvIC0xOwogICAgaGVpZ2h0OiBhdXRvOwogICAgbWF4LWhlaWdodDogbm9uZTsKICB9CgogIC5ycy1ib2R5LS1kdWFsIC5ycy1ib2R5LWJsb2NrLS1saXN0IHsKICAgIG92ZXJmbG93LXk6IGF1dG87CiAgICBtYXgtaGVpZ2h0OiAxMDAlOwogIH0KCiAgLnJzLWJvZHktLWR1YWwgLnJzLWxpc3QgewogICAgbWF4LWhlaWdodDogMTAwJTsKICAgIG92ZXJmbG93LXk6IGF1dG87CiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsKICB9CgogIC5ycy1ib2R5LS1kdWFsIC5ycy1ib2R5LWJsb2NrLS1jaGFydCB7CiAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7CiAgICBvdmVyZmxvdzogaGlkZGVuOwogIH0KCiAgLnJzLWJvZHktLWR1YWwgLnJzLWNoYXJ0IHsKCiAgICBoZWlnaHQ6IDEwMCU7CiAgICB3aWR0aDogMTAwJTsKCiAgICBmbGV4OiAwIDAgYXV0bzsKICB9CgogIC5ycy1ib2R5LS1kdWFsIC5ycy1jaGFydC1pbm5lciB7CiAgICBtaW4taGVpZ2h0OiAwOwogICAgaGVpZ2h0OiAxMDAlOwogICAgd2lkdGg6IDEwMCU7CiAgICBmbGV4OiAxOwogIH0KCiAgLnJzLWJvZHktLWR1YWwgLnJzLWNoYXJ0LWNhbnZhcyB7CiAgICB3aWR0aDogMTAwJTsKICAgIGhlaWdodDogMTAwJTsKICAgIG1pbi1oZWlnaHQ6IDA7CiAgfQoKICAvKiAxMiDmoI/ot6jluqblt6XlhbfnsbsgKi8KICAucnMtY29sLTQgewogICAgZ3JpZC1jb2x1bW46IHNwYW4gNDsKICB9CgogIC5ycy1jb2wtNSB7CiAgICBncmlkLWNvbHVtbjogc3BhbiA1OwogIH0KCiAgLnJzLWNvbC03IHsKICAgIGdyaWQtY29sdW1uOiBzcGFuIDc7CiAgfQoKICAucnMtY29sLTggewogICAgZ3JpZC1jb2x1bW46IHNwYW4gODsKICB9CgogIC5ycy1jb2wtMTIgewogICAgZ3JpZC1jb2x1bW46IHNwYW4gMTI7CiAgfQoKICAvKiA9PT09PSDmt7flkIjluIPlsYDvvJrmlofmnKwgNCDmoI8gKyDlm77ooaggOCDmoI8gPT09PT0gKi8KICAucnMtYm9keS0tbWl4ZWQgewogICAgZGlzcGxheTogZ3JpZDsKICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDEyLCAxZnIpOwogICAgZ2FwOiB2YXIoLS1ycy1ibG9jay1nYXApOwogICAganVzdGlmeS1jb250ZW50OiBpbml0aWFsOwogICAgYWxpZ24taXRlbXM6IHN0cmV0Y2g7CiAgICBvdmVyZmxvdy15OiBoaWRkZW47CiAgfQoKICAucnMtYm9keS0tbWl4ZWQgLnJzLWJvZHktYmxvY2stLXRleHQgewogICAgZ3JpZC1jb2x1bW46IHNwYW4gNDsKICAgIG1pbi1oZWlnaHQ6IDA7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsKICB9CgogIC5ycy1ib2R5LS1taXhlZCAucnMtdGV4dCB7CiAgICBmbGV4OiAxOwogICAgb3ZlcmZsb3cteTogYXV0bzsKICB9CgogIC5ycy1ib2R5LS1taXhlZCAucnMtYm9keS1ibG9jay0tY2hhcnQgewogICAgZ3JpZC1jb2x1bW46IHNwYW4gODsKICAgIG1pbi1oZWlnaHQ6IDA7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsKICB9CgogIC5ycy1ib2R5LS1taXhlZCAucnMtY2hhcnQgewogICAgbWluLWhlaWdodDogMDsKICAgIGZsZXg6IDE7CiAgICBoZWlnaHQ6IDEwMCU7CiAgfQoKICAucnMtYm9keS0tbWl4ZWQgLnJzLWNoYXJ0LWlubmVyIHsKICAgIG1pbi1oZWlnaHQ6IDA7CiAgICBmbGV4OiAxOwogIH0KCiAgLnJzLWJvZHktLW1peGVkIC5ycy1jaGFydC1jYW52YXMgewogICAgbWluLWhlaWdodDogMDsKICB9CgogIC8qID09PT09IOWNleWbvuihqOW4g+WxgO+8mumZkOWItumrmOW6puW5tuWxheS4re+8jOmYsuatouaSkeegtOaUvuaYoOWMuiA9PT09PSAqLwogIC5ycy1ib2R5LS1zaW5nbGUtY2hhcnQgewogICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7CiAgICBhbGlnbi1pdGVtczogY2VudGVyOwogIH0KCiAgLnJzLWJvZHktLXNpbmdsZS1jaGFydCAucnMtYm9keS1ibG9jay0tY2hhcnQgewogICAgd2lkdGg6IDEwMCU7CiAgICBoZWlnaHQ6IDEwMCU7CiAgICBtaW4taGVpZ2h0OiAwOwogICAgZGlzcGxheTogZmxleDsKICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsKICB9CgogIC5ycy1ib2R5LS1zaW5nbGUtY2hhcnQgLnJzLWNoYXJ0IHsKICAgIHdpZHRoOiAxMDAlOwogICAgaGVpZ2h0OiA5NSU7CiAgICBtaW4taGVpZ2h0OiAwOwogIH0KCiAgLnJzLWJvZHktLXNpbmdsZS1jaGFydCAucnMtY2hhcnQtaW5uZXIgewogICAgZmxleDogMSAxIGF1dG87CiAgICBtaW4taGVpZ2h0OiAwOwogICAgaGVpZ2h0OiBhdXRvOwogIH0KCiAgLnJzLWJvZHktLXNpbmdsZS1jaGFydCAucnMtY2hhcnQtY2FudmFzLAogIC5ycy1ib2R5LS1zaW5nbGUtY2hhcnQgLnJzLW1lcm1haWQtY2FudmFzIHsKICAgIG1pbi1oZWlnaHQ6IDA7CiAgICBtYXgtaGVpZ2h0OiAxMDAlICFpbXBvcnRhbnQ7CiAgfQoKICAucnMtYm9keS1ibG9jayB7CiAgICB3aWR0aDogMTAwJTsKICB9CgogIC8qID09PT09IOaWh+acrOWNoeeJhyA9PT09PSAqLwogIC5ycy10ZXh0IHsKICAgIGNvbG9yOiB2YXIoLS1wdi10ZXh0LTEpICFpbXBvcnRhbnQ7CiAgICB0ZXh0LWFsaWduOiBsZWZ0ICFpbXBvcnRhbnQ7CiAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjZmZmZmZmIDAlLCAjZjVmNWY3IDEwMCUpOwogICAgYm9yZGVyLWxlZnQ6IDRweCBzb2xpZCB2YXIoLS1wdi1hY2NlbnQsICMwMDcxZTMpOwogICAgYm9yZGVyLXJhZGl1czogdmFyKC0tcHYtcmFkaXVzLW1kKTsKICAgIHBhZGRpbmc6IDI2cHggMzZweCAhaW1wb3J0YW50OwogICAgbWFyZ2luOiAwICFpbXBvcnRhbnQ7CiAgICBmb250LXdlaWdodDogNDAwOwogICAgYm94LXNpemluZzogYm9yZGVyLWJveDsKICAgIG92ZXJmbG93LXdyYXA6IGJyZWFrLXdvcmQ7CiAgICB3b3JkLWJyZWFrOiBicmVhay13b3JkOwogIH0KCiAgLyogPT09PT0g5YiX6KGo5Y2h54mHID09PT09ICovCiAgLnJzLWxpc3QgewogICAgbGlzdC1zdHlsZTogbm9uZSAhaW1wb3J0YW50OwogICAgcGFkZGluZzogMCAhaW1wb3J0YW50OwogICAgbWFyZ2luOiAwICFpbXBvcnRhbnQ7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsKICAgIGdhcDogdmFyKC0tcnMtbGlzdC1nYXAsIDIwcHgpOwogICAgdGV4dC1hbGlnbjogbGVmdCAhaW1wb3J0YW50OwogICAgaGVpZ2h0OiBhdXRvOwogICAganVzdGlmeS1jb250ZW50OiBmbGV4LXN0YXJ0OwogIH0KCiAgLnJzLWxpc3QtaXRlbSB7CiAgICBkaXNwbGF5OiBmbGV4ICFpbXBvcnRhbnQ7CiAgICBhbGlnbi1pdGVtczogZmxleC1zdGFydCAhaW1wb3J0YW50OwogICAgZ2FwOiAxNnB4ICFpbXBvcnRhbnQ7CiAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjZmZmZmZmIDAlLCAjZjVmNWY3IDEwMCUpOwogICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tcHYtYm9yZGVyKTsKICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLXB2LXJhZGl1cy1tZCk7CiAgICBwYWRkaW5nOiB2YXIoLS1ycy1pdGVtLXBhZC15LCAyMHB4KSB2YXIoLS1ycy1pdGVtLXBhZC14LCAyOHB4KSAhaW1wb3J0YW50OwogICAgY29sb3I6IHZhcigtLXB2LXRleHQtMSkgIWltcG9ydGFudDsKICAgIG1hcmdpbjogMCAhaW1wb3J0YW50OwogIH0KCiAgLnJzLWxpc3QtaXRlbSBzcGFuIHsKICAgIG1pbi13aWR0aDogMDsKICAgIG92ZXJmbG93LXdyYXA6IGJyZWFrLXdvcmQ7CiAgICB3b3JkLWJyZWFrOiBicmVhay13b3JkOwogIH0KCiAgLnJzLWxpc3QtY2hlY2sgewogICAgY29sb3I6IHZhcigtLXB2LWFjY2VudCwgIzAwNzFlMyk7CiAgICBmbGV4LXNocmluazogMDsKICAgIGZvbnQtc2l6ZTogMS4yZW07CiAgICBtYXJnaW4tdG9wOiAwLjA1ZW07CiAgfQoKICAvKiA9PT09PSDlm77ooajljaHniYcgPT09PT0gKi8KICAucnMtY2hhcnQgewogICAgYmFja2dyb3VuZDogI2ZmZmZmZjsKICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLXB2LWJvcmRlcik7CiAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1wdi1yYWRpdXMtbGcpOwogICAgcGFkZGluZzogMjBweCAyNHB4IDI0cHg7CiAgICBtaW4taGVpZ2h0OiB2YXIoLS1ycy1jaGFydC1taW4taCwgNDIwcHgpOwogICAgZGlzcGxheTogZmxleDsKICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47CiAgICB3aWR0aDogMTAwJTsKICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7CiAgfQoKICAucnMtYm9keS0tZHVhbCAucnMtY2hhcnQgewogICAgbWluLWhlaWdodDogMDsKICAgIGhlaWdodDogMTAwJTsKICAgIGZsZXg6IDE7CiAgfQoKICAucnMtY2hhcnQtbGFiZWwtYmFyIHsKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAgZ2FwOiA4cHg7CiAgICBwYWRkaW5nLWJvdHRvbTogMTJweDsKICAgIG1hcmdpbi1ib3R0b206IDEycHg7CiAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2YxZjVmOTsKICAgIGZsZXgtc2hyaW5rOiAwOwogIH0KCiAgLnJzLWNoYXJ0LWxhYmVsLWljb24gewogICAgY29sb3I6IHZhcigtLXB2LWFjY2VudCwgIzAwNzFlMyk7CiAgICBmb250LXNpemU6IDE4cHg7CiAgfQoKICAucnMtY2hhcnQtbGFiZWwtYmFyIHNwYW4gewogICAgZm9udC1zaXplOiAxNnB4OwogICAgZm9udC13ZWlnaHQ6IDYwMDsKICAgIGNvbG9yOiB2YXIoLS1wdi10ZXh0LTIpOwogIH0KCiAgLnJzLWNoYXJ0LWlubmVyIHsKICAgIHdpZHRoOiAxMDAlOwogICAgZmxleDogMTsKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsKICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOwogICAgbWluLWhlaWdodDogdmFyKC0tcnMtY2hhcnQtaW5uZXItbWluLWgsIDQwMHB4KTsKICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsKICB9CgogIC5ycy1ib2R5LS1kdWFsIC5ycy1jaGFydC1pbm5lciB7CiAgICBtaW4taGVpZ2h0OiAwOwogIH0KCiAgLnJzLWNoYXJ0LWNhbnZhcyB7CiAgICB3aWR0aDogMTAwJTsKICAgIGhlaWdodDogMTAwJTsKICAgIG1pbi1oZWlnaHQ6IDA7CiAgfQoKICAucnMtbWVybWFpZC1jYW52YXMgewogICAgd2lkdGg6IDEwMCU7CiAgICBoZWlnaHQ6IDEwMCU7CiAgICBvdmVyZmxvdzogYXV0bzsKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsKICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgfQoKICAucnMtbWVybWFpZC1jYW52YXMgOmRlZXAoc3ZnKSB7CiAgICBtYXgtd2lkdGg6IDEwMCU7CiAgICBoZWlnaHQ6IGF1dG87CiAgfQoKICAucnMtY2hhcnQtaWNvbiB7CiAgICBmb250LXNpemU6IDcycHg7CiAgICBjb2xvcjogdmFyKC0tcHYtYWNjZW50LCAjMDA3MWUzKTsKICB9CgogIC5ycy1jaGFydC1mYWxsYmFjayB7CiAgICBmb250LXNpemU6IDI4cHg7CiAgICBmb250LXdlaWdodDogNjAwOwogICAgY29sb3I6IHZhcigtLXB2LWFjY2VudCk7CiAgICBtYXJnaW4tdG9wOiAxNnB4OwogIH0KCiAgLyogPT09PT0g5Zu+54mH5Y2h54mHID09PT09ICovCiAgLnJzLWltYWdlLWNvbnRhaW5lciB7CiAgICB3aWR0aDogMTAwJTsKICAgIG1heC1oZWlnaHQ6IHZhcigtLXJzLWltZy1tYXgtaCwgNTIwcHgpOwogICAgYm9yZGVyLXJhZGl1czogdmFyKC0tcHYtcmFkaXVzLWxnKTsKICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLXB2LWJvcmRlcik7CiAgICBvdmVyZmxvdzogaGlkZGVuOwogIH0KCiAgLnJzLWltZyB7CiAgICB3aWR0aDogMTAwJTsKICAgIGhlaWdodDogMTAwJTsKICAgIG9iamVjdC1maXQ6IGNvbnRhaW47CiAgfQoKICAvKiA9PT09PSDlvJXnlKjljaHniYcgPT09PT0gKi8KICAucnMtcXVvdGUgewogICAgbWFyZ2luOiAwOwogICAgcGFkZGluZzogMzJweCA0MHB4OwogICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgI2YwZjlmZiAwJSwgI2Y1ZjVmNyAxMDAlKTsKICAgIGJvcmRlci1sZWZ0OiA0cHggc29saWQgdmFyKC0tcHYtYWNjZW50LCAjMDA3MWUzKTsKICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLXB2LXJhZGl1cy1tZCk7CiAgICBwb3NpdGlvbjogcmVsYXRpdmU7CiAgICB0ZXh0LWFsaWduOiBsZWZ0OwogIH0KCiAgLnJzLXF1b3RlLWljb24gewogICAgcG9zaXRpb246IGFic29sdXRlOwogICAgdG9wOiAxMnB4OwogICAgbGVmdDogMTZweDsKICAgIGZvbnQtc2l6ZTogNDhweDsKICAgIGNvbG9yOiByZ2JhKDAsIDExMywgMjI3LCAwLjE0KTsKICB9CgogIC5ycy1xdW90ZS1jb250ZW50IHsKICAgIGZvbnQtc2l6ZTogdmFyKC0tcnMtcXVvdGUtc2l6ZSwgMzBweCk7CiAgICBmb250LXdlaWdodDogNTAwOwogICAgZm9udC1zdHlsZTogaXRhbGljOwogICAgY29sb3I6IHZhcigtLXB2LXRleHQtMik7CiAgICBtYXJnaW46IDA7CiAgICBsaW5lLWhlaWdodDogMS42OwogIH0KCiAgLyogPT09PT0g6KGo5qC85Y2h54mHID09PT09ICovCiAgLnJzLXRhYmxlLWNvbnRhaW5lciB7CiAgICB3aWR0aDogMTAwJTsKICAgIG92ZXJmbG93LXg6IGF1dG87CiAgICBiYWNrZ3JvdW5kOiAjZmZmOwogICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tcHYtYm9yZGVyKTsKICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLXB2LXJhZGl1cy1tZCk7CiAgfQoKICAucnMtdGFibGUgewogICAgd2lkdGg6IDEwMCU7CiAgICBib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOwogICAgdGV4dC1hbGlnbjogbGVmdDsKICAgIGZvbnQtc2l6ZTogdmFyKC0tcnMtdGFibGUtc2l6ZSwgMjRweCk7CiAgfQoKICAucnMtdGFibGUgdGggewogICAgYmFja2dyb3VuZDogdmFyKC0tcHYtYWNjZW50LXNvZnQpOwogICAgY29sb3I6IHZhcigtLXB2LXRleHQtMSk7CiAgICBwYWRkaW5nOiAxOHB4IDI2cHg7CiAgICBmb250LXdlaWdodDogNjAwOwogICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLXB2LWJvcmRlcik7CiAgfQoKICAucnMtdGFibGUgdGQgewogICAgcGFkZGluZzogMThweCAyNnB4OwogICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLXB2LWJvcmRlcik7CiAgICBjb2xvcjogdmFyKC0tcHYtdGV4dC0yKTsKICB9CgogIC5ycy10YWJsZSB0cjpsYXN0LWNoaWxkIHRkIHsKICAgIGJvcmRlci1ib3R0b206IG5vbmU7CiAgfQoKICAucnMtdGFibGUgdGJvZHkgdHI6aG92ZXIgewogICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tcHYtYmcpOwogIH0KCiAgLyogPT09PT0g5bqV6YOo6aG16ISa5qih5Z2XID09PT09ICovCiAgLnJzLWZvb3RlciB7CiAgICB3aWR0aDogMTAwJTsKICAgIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50OwogICAgYm9yZGVyLXRvcDogMXB4IHNvbGlkIHZhcigtLXB2LWJvcmRlcik7CiAgICBwYWRkaW5nOiAwIHZhcigtLXJzLXNhZmV0eS1tYXJnaW4pOwogICAgYm94LXNpemluZzogYm9yZGVyLWJveDsKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47CiAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAgZmxleC1zaHJpbms6IDA7CiAgICBoZWlnaHQ6IDUycHg7CiAgfQoKICAucnMtZm9vdGVyLXRpdGxlIHsKICAgIGZvbnQtc2l6ZTogdmFyKC0tcnMtZm9vdGVyLXNpemUsIDE4cHgpOwogICAgY29sb3I6IHZhcigtLXB2LXRleHQtMik7CiAgICBmb250LXdlaWdodDogNjAwOwogIH0KCiAgLnJzLWZvb3Rlci1wYWdlIHsKICAgIGZvbnQtc2l6ZTogdmFyKC0tcnMtZm9vdGVyLXNpemUsIDE4cHgpOwogICAgY29sb3I6IHZhcigtLXB2LXRleHQtMyk7CiAgICBmb250LXdlaWdodDogNTAwOwogICAgZm9udC12YXJpYW50LW51bWVyaWM6IHRhYnVsYXItbnVtczsKICB9CgogIC8qID09PT09IOWwgemdoumhte+8iOaXoOWjs++8jOagh+mimCvlia/moIfpopjlsYXkuK3vvIkgPT09PT0gKi8KICAucnMtc2xpZGUtLWNvdmVyIC5ycy1oZWFkZXIgewogICAgZmxleDogMTsKICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGdhcDogMjhweDsKICAgIGJvcmRlci1ib3R0b206IG5vbmU7CiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1wdi1zdXJmYWNlKTsKICB9CgogIC5ycy1zbGlkZS0tY292ZXIgLnJzLWhlYWRlci1iYWRnZSwKICAucnMtc2xpZGUtLWNvdmVyIC5ycy1mb290ZXIgewogICAgZGlzcGxheTogbm9uZTsKICB9CgogIC5ycy1zbGlkZS0tY292ZXIgLnJzLWhlYWRlci10aXRsZSB7CiAgICB0ZXh0LWFsaWduOiBjZW50ZXIgIWltcG9ydGFudDsKICAgIGZvbnQtc2l6ZTogY2FsYyh2YXIoLS1ycy10aXRsZS1zaXplKSAqIDEuMjUpICFpbXBvcnRhbnQ7CiAgICBsZXR0ZXItc3BhY2luZzogLTAuMDNlbSAhaW1wb3J0YW50OwogIH0KCiAgLnJzLXNsaWRlLS1jb3ZlciAucnMtYm9keSB7CiAgICBmbGV4OiAwIDEgYXV0bzsKICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIHBhZGRpbmctdG9wOiAwOwogICAgcGFkZGluZy1ib3R0b206IHZhcigtLXJzLWJvZHktcGFkLXkpOwogIH0KCiAgLnJzLXNsaWRlLS1jb3ZlciAucnMtdGV4dCB7CiAgICB0ZXh0LWFsaWduOiBjZW50ZXIgIWltcG9ydGFudDsKICAgIGJvcmRlci1sZWZ0OiBub25lOwogICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7CiAgICBib3gtc2hhZG93OiBub25lOwogICAgY29sb3I6IHZhcigtLXB2LXRleHQtMikgIWltcG9ydGFudDsKICAgIGZvbnQtd2VpZ2h0OiA0MDA7CiAgICBtYXgtd2lkdGg6IDY4JTsKICAgIG1hcmdpbjogMCBhdXRvICFpbXBvcnRhbnQ7CiAgICBwYWRkaW5nOiAwICFpbXBvcnRhbnQ7CiAgfQoKICAvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KICAgICDlhaXlnLrliqjnlLvns7vnu58KICAgICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi8KICAucnMtYW5pbS10YXJnZXQgewogICAgb3BhY2l0eTogMDsKICB9CgogIC5ycy1hbmltLXRhcmdldC5ycy1hbmltLWZhZGUtdXAgewogICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDE2cHgpOwogIH0KCiAgLnJzLWFuaW0tdGFyZ2V0LnJzLWFuaW0tc2xpZGUtZG93biB7CiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTE2cHgpOwogIH0KCiAgLnJzLWFuaW0tdGFyZ2V0LnJzLWFuaW0tc2NhbGUtaW4gewogICAgdHJhbnNmb3JtOiBzY2FsZSgwLjk2KTsKICB9CgogIC5ycy1zbGlkZS5ycy1hbmltLWFjdGl2ZSAucnMtYW5pbS10YXJnZXQucnMtYW5pbS1mYWRlLXVwIHsKICAgIGFuaW1hdGlvbjogcnMta2YtZmFkZS11cCAwLjZzIGN1YmljLWJlemllcigwLjIyLCAwLjYxLCAwLjM2LCAxKSB2YXIoLS1hbmltLWRlbGF5LCAwbXMpIGZvcndhcmRzOwogIH0KCiAgLnJzLXNsaWRlLnJzLWFuaW0tYWN0aXZlIC5ycy1hbmltLXRhcmdldC5ycy1hbmltLXNsaWRlLWRvd24gewogICAgYW5pbWF0aW9uOiBycy1rZi1zbGlkZS1kb3duIDAuNXMgY3ViaWMtYmV6aWVyKDAuMjIsIDAuNjEsIDAuMzYsIDEpIHZhcigtLWFuaW0tZGVsYXksIDBtcykgZm9yd2FyZHM7CiAgfQoKICAucnMtc2xpZGUucnMtYW5pbS1hY3RpdmUgLnJzLWFuaW0tdGFyZ2V0LnJzLWFuaW0tc2NhbGUtaW4gewogICAgYW5pbWF0aW9uOiBycy1rZi1zY2FsZS1pbiAwLjU1cyBjdWJpYy1iZXppZXIoMC4zNCwgMS41NiwgMC42NCwgMSkgdmFyKC0tYW5pbS1kZWxheSwgMG1zKSBmb3J3YXJkczsKICB9CgogIC5ycy1zbGlkZS5ycy1hbmltLWFjdGl2ZSAucnMtYW5pbS10YXJnZXQucnMtYW5pbS1mYWRlLWluIHsKICAgIGFuaW1hdGlvbjogcnMta2YtZmFkZS1pbiAwLjVzIGVhc2UgdmFyKC0tYW5pbS1kZWxheSwgMG1zKSBmb3J3YXJkczsKICB9CgogIEBrZXlmcmFtZXMgcnMta2YtZmFkZS11cCB7CiAgICBmcm9tIHsKICAgICAgb3BhY2l0eTogMDsKICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDE2cHgpOwogICAgfQoKICAgIHRvIHsKICAgICAgb3BhY2l0eTogMTsKICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApOwogICAgfQogIH0KCiAgQGtleWZyYW1lcyBycy1rZi1zbGlkZS1kb3duIHsKICAgIGZyb20gewogICAgICBvcGFjaXR5OiAwOwogICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTE2cHgpOwogICAgfQoKICAgIHRvIHsKICAgICAgb3BhY2l0eTogMTsKICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApOwogICAgfQogIH0KCiAgQGtleWZyYW1lcyBycy1rZi1zY2FsZS1pbiB7CiAgICBmcm9tIHsKICAgICAgb3BhY2l0eTogMDsKICAgICAgdHJhbnNmb3JtOiBzY2FsZSgwLjk2KTsKICAgIH0KCiAgICB0byB7CiAgICAgIG9wYWNpdHk6IDE7CiAgICAgIHRyYW5zZm9ybTogc2NhbGUoMSk7CiAgICB9CiAgfQoKICBAa2V5ZnJhbWVzIHJzLWtmLWZhZGUtaW4gewogICAgZnJvbSB7CiAgICAgIG9wYWNpdHk6IDA7CiAgICB9CgogICAgdG8gewogICAgICBvcGFjaXR5OiAxOwogICAgfQogIH0KCiAgQG1lZGlhIChwcmVmZXJzLXJlZHVjZWQtbW90aW9uOiByZWR1Y2UpIHsKICAgIC5ycy1hbmltLXRhcmdldCB7CiAgICAgIG9wYWNpdHk6IDEgIWltcG9ydGFudDsKICAgICAgdHJhbnNmb3JtOiBub25lICFpbXBvcnRhbnQ7CiAgICB9CgogICAgLnJzLWFuaW0tdGFyZ2V0LnJzLWFuaW0tZmFkZS11cCwKICAgIC5ycy1hbmltLXRhcmdldC5ycy1hbmltLXNsaWRlLWRvd24sCiAgICAucnMtYW5pbS10YXJnZXQucnMtYW5pbS1zY2FsZS1pbiwKICAgIC5ycy1hbmltLXRhcmdldC5ycy1hbmltLWZhZGUtaW4gewogICAgICBhbmltYXRpb246IG5vbmUgIWltcG9ydGFudDsKICAgIH0KICB9Cjwvc3R5bGU+"
									}
								},
      exampleList: [{"name":"季度业务汇报","description":"输入季度工作要点，输出结构化的演示文稿 JSON。","icon":"📈"},{"name":"技术方案分享","description":"输入技术架构演进逻辑，输出技术演讲幻灯片结构。","icon":"💻"},{"name":"产品发布演示","description":"输入产品功能亮点与市场价值，输出发布会演示结构。","icon":"🚀"}],
      loadingProgressApp: {
        className: "ElementVueItem",
        task: {
          template: "https://transweb.cn/webApps/document/aigcLoading.vue",
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
      inputPlaceholder: "提供一份线性的大纲内容（或主题、核心观点、数据要点），AI 将其解析并重构为 JSON 结构化数据。",
      description: "",
      query: {"documentId":"76f7de9504bad022a8978e9fe084df0f"},
      accountData: {},
      flag: WebTool.adjustSize([false, false, true]),
      isSolo: WebTool.urlQuery(location.href, "solo"),
      defaultTemplate: "",
      dataEditable: true,
      title: "演示文稿",
      introduce: "根据用户输入内容或需求描述，生成HTML版本的幻灯片",
      icon: "P"
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
    }},"methods":{"startModify":function() {
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
    },"checkDiff":function(index) {
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
    },"handleConfirm":function() {
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
      let url = location.origin + "?solo=true&dataView=true&dataId=" + dataId + "&id=" + documentId;
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
      aigcInterface.updateResultView(json, app, elem);
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
          message: "需要输入数形实验描述。",
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
    }},"appMap":{"loginRegItem":{"url":"https://transweb.cn/mainApp/app/loginRegItem.js","key":"transweb_loginRegItem","cardName":"loginRegCard","dsl":{"data":{"position":"top","loginedMenu":[{"label":"⏱️ 历史记录","action":function (d, callback) {
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
      aigcInterface.getDataItem(dataId, (result, tData) => {
        this.isStreaming = true;
        this.currentVersion = tData.versionId;
        this.dataEditable =
          tData.folderName + "" === localStorage.folderName &&
          !WebTool.urlQuery(location.href, "dataView");
        this.switchResultStatus(result);
      }, (err)=> {
        this.$message({
          type: "warning",
          message: "获取数据失败，暂时没有权限访问。",
        });
      });
    } else {
      aigcInterface.handleAgentInput(location.href, (str) => {
        this.content.inputText = str;
        if (auto) {
          this.handleGenerate();
        }
      });
    }
  }};</script>
