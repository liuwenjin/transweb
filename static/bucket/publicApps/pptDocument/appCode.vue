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
        <h3 class="tw-text-2xl tw-text-gray-900 tw-tracking-tight tw-m-0 tw-font-medium logo-title tw-w-full"
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
                    class="!bg-blue-500 !border-blue-500 !text-white hover:!bg-blue-600 transition-all duration-300 wizard-action-btn wizard-action-btn--primary"
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
      <div class="wizard-navbar__actions tw-flex tw-items-center" data-edit-id="103">
        <slot v-if="step === 0 && !flag">
          <el-button class="wizard-action-btn" @click="openFeedbackDialog()">
            问题反馈
          </el-button>
        </slot>
        <div appName="loginRegItem"
          component="CardItem"
          class="tw-opacity-100 refined-user-card wizard-user-card"
          data-edit-id="104"></div>
      </div>
    </div>

    <div ref="loadingEffectArea"
      style="height: 100%; position: relative; z-index: 0"
      class="tw-max-w-7xl tw-y-full tw-mx-auto tw-w-full"
      data-edit-id="3">
      <!-- 输入控制面板 -->
      <div v-if="step === 0"
        class="wizard-input-panel tw-relative tw-bg-white tw-border tw-border-slate-100 tw-rounded-2xl tw-shadow-sm tw-p-5 tw-transition-all hover:tw-shadow-md"
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
                class="tw-text-sm tw-text-slate-400 tw-font-medium tw-whitespace-nowrap">
                试试看：
              </span>
              <button v-for="d in exampleList"
                :key="d.title || d.name"
                @click="inputExampleText(d)"
                class="example-chip tw-group tw-flex tw-items-center tw-gap-1.5 tw-px-3 tw-py-1.5 tw-text-[13px] tw-bg-slate-50 hover:tw-bg-blue-50 hover:tw-text-blue-600 tw-text-slate-600 tw-rounded-lg tw-transition-colors tw-whitespace-nowrap active:tw-scale-95">
                <span class="chip-icon">{{ d.icon || "" }}</span>
                <span>{{ d.name }}</span>
              </button>
            </div>
          </div>

          <div class="tw-h-px md:tw-hidden tw-bg-slate-100 tw-w-full"></div>
          <div class="tw-hidden md:tw-block tw-w-px tw-bg-slate-100 tw-my-1 tw-self-stretch"></div>

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
              class="tw-flex-1 md:tw-flex-none tw-justify-center tw-h-10 hover:!tw-bg-slate-50 tw-text-slate-500 tw-mt-8">
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
                class="!bg-blue-500 !border-blue-500 !text-white hover:!bg-blue-600 transition-all duration-300 wizard-action-btn wizard-action-btn--primary"
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
   DESIGN TOKENS — 学术 · 精准 · 启发
   ============================================ */
* {
  /* 主色：活力蓝（学术蓝） */
  --academic-primary: #0066CC;
  --academic-primary-hover: #0052A3;
  --academic-primary-active: #004C99;
  --academic-primary-soft: rgba(0, 102, 204, 0.08);
  --academic-primary-ring: rgba(0, 102, 204, 0.16);

  /* 背景：冰川灰 */
  --academic-bg: #EEF3F0;
  --academic-bg-deep: #F6F9F7;

  /* 文字：深石板青 */
  --academic-text: #1e293b;
  --academic-text-secondary: #475569;
  --academic-text-tertiary: #94a3b8;

  /* 强调：琥珀金 */
  --academic-accent: #f59e0b;
  --academic-accent-soft: rgba(245, 158, 11, 0.12);

  /* 辅助 */
  --academic-border: rgba(30, 41, 59, 0.08);
  --academic-border-strong: rgba(30, 41, 59, 0.14);

  /* 玻璃面板 */
  --glass-bg: rgba(255, 255, 255, 0.72);
  --glass-shadow: 0 1px 2px rgba(30, 41, 59, 0.04),
    0 8px 24px rgba(30, 41, 59, 0.06);
  --glass-shadow-hover: 0 2px 4px rgba(30, 41, 59, 0.05),
    0 12px 32px rgba(30, 41, 59, 0.09);

  /* 圆角 */
  --radius-card: 16px;
  --radius-control: 10px;

  --font-system: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
    "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", "SF Mono", Menlo, "Cascadia Code",
    Consolas, monospace;
}

/* ============================================
   全局背景 — 冰川灰 + 学术点阵纹理
   ============================================ */
.wizard-bg {
  font-family: var(--font-system);
  color: var(--academic-text);
  background-color: var(--academic-bg);
  background-image: radial-gradient(
      ellipse 80% 60% at 20% 0%,
      rgba(0, 102, 204, 0.06) 0%,
      transparent 55%
    ),
    radial-gradient(
      ellipse 60% 50% at 100% 100%,
      rgba(245, 158, 11, 0.04) 0%,
      transparent 55%
    ),
    radial-gradient(
      circle at 1px 1px,
      rgba(30, 41, 59, 0.07) 1px,
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
      rgba(0, 102, 204, 0.035) 1px,
      transparent 1px
    ),
    linear-gradient(to bottom, rgba(0, 102, 204, 0.035) 1px, transparent 1px);
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
  font-weight: 900;
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
    rgba(0, 102, 204, 0.22) 30%,
    rgba(0, 102, 204, 0.22) 70%,
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
  box-shadow: 0 1px 2px rgba(30, 41, 59, 0.06),
    0 4px 12px rgba(0, 102, 204, 0.08);
  display: inline-block;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  overflow: hidden;
}

.refined-logo:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(30, 41, 59, 0.08),
    0 8px 20px rgba(0, 102, 204, 0.14);
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
  box-shadow: 0 3px 10px rgba(0, 102, 204, 0.14);
  transform: translateY(-1px);
}

.title-text {
  font-size: 16px;
  font-weight: 600;
  display: block;
  color: var(--academic-text);
  letter-spacing: 0.01em;
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
  font-weight: 800;
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
    rgba(0, 102, 204, 0.5) 25%,
    rgba(0, 102, 204, 0.55) 55%,
    rgba(245, 158, 11, 0.35) 80%,
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
  border: 1.5px dashed rgba(0, 102, 204, 0.35);
  border-radius: var(--radius-control);
  background: rgba(0, 102, 204, 0.04);
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
    rgba(0, 102, 204, 0.1),
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.2s ease;
}

.upload-zone:hover {
  border-color: var(--academic-primary);
  border-style: solid;
  background: rgba(0, 102, 204, 0.07);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(0, 102, 204, 0.16);
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
  box-shadow: 0 2px 8px rgba(30, 41, 59, 0.08), 0 1px 2px rgba(30, 41, 59, 0.04) !important;
  transition: all 0.2s ease;
}

.preview-thumbnail:hover {
  border-color: var(--academic-primary) !important;
  box-shadow: 0 4px 16px rgba(0, 102, 204, 0.18),
    0 1px 4px rgba(30, 41, 59, 0.06) !important;
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
  box-shadow: 0 2px 6px rgba(30, 41, 59, 0.12),
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
  box-shadow: 0 1px 2px rgba(30, 41, 59, 0.03) inset,
    0 1px 2px rgba(255, 255, 255, 0.8);
}

.input-spell-box:focus-within {
  border-color: var(--academic-primary);
  box-shadow: 0 0 0 3px var(--academic-primary-ring),
    0 1px 2px rgba(30, 41, 59, 0.03) inset;
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
  box-shadow: 0 2px 8px rgba(0, 102, 204, 0.14);
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
   生成按钮 — 学术蓝 CTA
   ============================================ */
.cast-spell-btn {
  position: relative;
  background: var(--academic-primary) !important;
  border: 1px solid var(--academic-primary) !important;
  border-radius: var(--radius-control) !important;
  font-weight: 600 !important;
  font-size: 14px !important;
  font-family: var(--font-system) !important;
  letter-spacing: 0.01em !important;
  color: #fff !important;
  padding: 10px 18px !important;
  box-shadow: 0 2px 6px rgba(0, 102, 204, 0.32), 0 1px 2px rgba(30, 41, 59, 0.1),
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
  box-shadow: 0 6px 18px rgba(0, 102, 204, 0.4),
    0 2px 5px rgba(30, 41, 59, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.22) !important;
}

.cast-spell-btn[active="true"] {
  background: var(--academic-primary-active) !important;
}

.cast-spell-btn:active {
  transform: translateY(0px) scale(0.99) !important;
  background: var(--academic-primary-active) !important;
  box-shadow: 0 1px 3px rgba(0, 102, 204, 0.3),
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
  background: rgba(0, 102, 204, 0.15);
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
  border-right-color: rgba(0, 102, 204, 0.2);
  border-bottom-color: rgba(245, 158, 11, 0.4);
  border-left-color: transparent;
  animation: spinRune 2s linear infinite;
  box-shadow: 0 0 14px rgba(0, 102, 204, 0.14);
}

.rune-ring--inner {
  inset: 14px;
  border-top-color: transparent;
  border-right-color: rgba(245, 158, 11, 0.7);
  border-bottom-color: transparent;
  border-left-color: rgba(0, 102, 204, 0.4);
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
  filter: drop-shadow(0 0 6px rgba(0, 102, 204, 0.45))
    drop-shadow(0 0 14px rgba(0, 102, 204, 0.18)) !important;
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
  background: rgba(248, 250, 252, 0.6);
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
  box-shadow: 0 1px 3px rgba(30, 41, 59, 0.05),
    0 0 0 0.5px rgba(255, 255, 255, 0.8) inset !important;
  transition: all 0.18s ease !important;
}

.wizard-action-btn:hover {
  background: #ffffff !important;
  border-color: var(--academic-primary) !important;
  color: var(--academic-primary) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 3px 10px rgba(0, 102, 204, 0.14),
    0 1px 3px rgba(30, 41, 59, 0.04) !important;
}

.wizard-action-btn:active {
  transform: translateY(0) scale(0.99) !important;
  box-shadow: 0 1px 2px rgba(30, 41, 59, 0.08) !important;
}

.wizard-action-btn--primary {
  background: var(--academic-primary-soft) !important;
  border-color: rgba(0, 102, 204, 0.3) !important;
  color: var(--academic-primary) !important;
}

.wizard-action-btn--primary:hover {
  background: rgba(0, 102, 204, 0.14) !important;
  border-color: rgba(0, 102, 204, 0.45) !important;
  color: var(--academic-primary-active) !important;
  box-shadow: 0 3px 12px rgba(0, 102, 204, 0.2) !important;
}

/* ============================================
   Loading 遮罩
   ============================================ */
.el-loading-mask {
  background: rgba(248, 250, 252, 0.82) !important;
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
  font-weight: 600 !important;
  margin: 0 !important;
  height: 100% !important;
  box-shadow: 0 1px 2px rgba(0, 102, 204, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.18) !important;
  transition: all 0.18s ease !important;
}

.custom-input-group .el-input-group__append .el-button:hover {
  background: var(--academic-primary-hover) !important;
  border-color: var(--academic-primary-hover) !important;
  box-shadow: 0 3px 8px rgba(0, 102, 204, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
}

/* ============================================
   Element Plus 覆盖 — 下拉弹层
   ============================================ */
.el-select-dropdown {
  background: rgba(255, 255, 255, 0.96) !important;
  border: 1px solid var(--academic-border) !important;
  border-radius: 14px !important;
  box-shadow: 0 10px 32px rgba(30, 41, 59, 0.12),
    0 2px 8px rgba(30, 41, 59, 0.06) !important;
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
  font-weight: 600 !important;
}

/* ============================================
   图片预览弹层
   ============================================ */
.el-image__inner {
  max-height: 80vh;
}

.el-image-viewer__wrapper {
  background: rgba(15, 23, 42, 0.85) !important;
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
  background: rgba(30, 41, 59, 0.18);
  border-radius: 6px;
  transition: background 0.2s ease;
}

.wizard-result-panel ::-webkit-scrollbar-thumb:hover {
  background: var(--academic-primary);
}

/* ============================================
   响应式微调
   ============================================ */

  /* ============================================
     顶栏垂直居中润色 · wizard-navbar
     ============================================ */
  .wizard-navbar {
    --user-card-offset: 4px;
    --wizard-control-height: 32px;
    /* 覆盖 tw-pt-2 / tw-pb-6 的不对称留白：总高度不变，内容回到几何中线 */
    padding-top: 16px !important;
    padding-bottom: 16px !important;
    display: flex;
    align-items: center;
  }

  .wizard-navbar__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    flex: 0 0 auto;
  }

  .wizard-navbar__actions > * {
    flex: 0 0 auto;
  }

  .wizard-action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .wizard-navbar__actions :focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--academic-accent, rgba(26, 26, 30, 0.25));
  }

  /* 宿主 CardItem 挂载点：外部回补下沉量，不触碰其内部排印 */
  .wizard-user-card {
    width: 135px;
    height: var(--wizard-control-height);
    margin-left: 15px;
    box-sizing: border-box;
    position: relative;
    display: flex;
    align-items: center;
    transform: translateY(calc(-1 * var(--user-card-offset)));
  }

  .wizard-user-card::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    width: 1px;
    height: var(--wizard-control-height);
    background: var(--academic-border, #e7e7eb);
    transform: translateY(calc(-50% + var(--user-card-offset)));
    pointer-events: none;
  }

  @media (max-width: 640px) {
    .wizard-user-card {
      width: 104px;
      margin-left: 8px;
    }
  }

@media (max-width: 640px) {
  .wizard-input-panel,
  .wizard-result-panel {
    border-radius: 16px;
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
  background-color: rgba(246, 249, 247, 0.6);
}

.tw-w-800 {
  max-width: 800px;
}

.tw-margin-auto {
  margin: auto;
}

/* Muse 风格统一：品牌蓝控件、弹窗与表单 */
:deep(.el-button--primary) {
  --el-button-bg-color: #0066CC;
  --el-button-border-color: #0066CC;
  --el-button-hover-bg-color: #0052A3;
  --el-button-hover-border-color: #0052A3;
  --el-button-active-bg-color: #004C99;
  --el-button-active-border-color: #004C99;
  border-radius: 999px;
}

:deep(.el-dialog) {
  border-radius: 16px !important;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.18) !important;
}

:deep(.el-dialog__header) {
  margin-right: 0;
  padding: 20px 24px 12px;
  border-bottom: 1px solid #EEF3F0;
}

:deep(.el-dialog__title) {
  font-weight: 700;
  font-size: 1.125rem;
  color: #0f172a;
}

:deep(.el-dialog__body) {
  padding: 20px 24px;
}

:deep(.el-dialog__footer) {
  padding: 12px 24px 20px;
  border-top: 1px solid #EEF3F0;
}

:deep(.el-select__wrapper),
:deep(.el-input__wrapper) {
  border-radius: 10px;
}

:deep(.el-tag) {
  --el-tag-bg-color: #f0f9ff;
  --el-tag-border-color: #BAE6FD;
  --el-tag-text-color: #0052A3;
}

.tw-text-blue-600,
.tw-text-blue-500 {
  color: #0066CC !important;
}

.tw-bg-blue-50 {
  background-color: #F0F9FF !important;
}

.tw-bg-blue-500,
.tw-bg-blue-600 {
  background-color: #0066CC !important;
}

.tw-border-blue-200 {
  border-color: #BAE6FD !important;
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
										template: "data:text/plain;charset=utf-8;base64,PHRlbXBsYXRlPgogIDxkaXYgY2xhc3M9InB2LXJvb3QiPgogICAgPGRpdiBjbGFzcz0icHYtY29udGFpbmVyIiA6Y2xhc3M9InsgJ3B2LWNvbnRhaW5lci0tZm91cic6IHRvdGFsU2xpZGVzID09PSA0IH0iPgogICAgICA8IS0tID09PT09PT09PT09PSDmvJTnpLrmlofnqL/mtY/op4jlmaggPT09PT09PT09PT09IC0tPgogICAgICA8aGVhZGVyIGNsYXNzPSJwdi1oZWFkZXIiPgogICAgICAgIDxkaXYgY2xhc3M9InB2LWhlYWRlci1jb3B5Ij4KICAgICAgICAgIDxkaXYgY2xhc3M9InB2LWtpY2tlciI+CiAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJwdi1raWNrZXItbGluZSI+PC9zcGFuPgogICAgICAgICAgICA8c3Bhbj5QUkVTRU5UQVRJT04gREVDSzwvc3Bhbj4KICAgICAgICAgICAgPHNwYW4gY2xhc3M9InB2LWtpY2tlci1jb3VudCI+e3sgcGFkKHRvdGFsU2xpZGVzKSB9fSBQQUdFUzwvc3Bhbj4KICAgICAgICAgIDwvZGl2PgogICAgICAgICAgPGgxIGNsYXNzPSJwdi10aXRsZSI+e3sgYWNjb3VudERhdGEudGl0bGUgfX08L2gxPgogICAgICAgICAgPHAgY2xhc3M9InB2LXN1YnRpdGxlIj4KICAgICAgICAgICAgPHNwYW4+e3sgYWNjb3VudERhdGEucHJlc2VudGVyIH19PC9zcGFuPgogICAgICAgICAgICA8c3BhbiBjbGFzcz0icHYtbWV0YS1kb3QiPjwvc3Bhbj4KICAgICAgICAgICAgPHNwYW4+e3sgYWNjb3VudERhdGEuc3VidGl0bGUgfHwgdG90YWxTbGlkZXMgKyAnIOmhtea8lOekuuaWh+eovycgfX08L3NwYW4+CiAgICAgICAgICA8L3A+CiAgICAgICAgPC9kaXY+CgogICAgICAgIDxidXR0b24gY2xhc3M9InB2LXBsYXktYnRuIiB0eXBlPSJidXR0b24iIEBjbGljaz0iZW50ZXJQcmVzZW50YXRpb24oMCkiPgogICAgICAgICAgPHN2ZyBjbGFzcz0icHYtcGxheS1pY29uIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGFyaWEtaGlkZGVuPSJ0cnVlIj4KICAgICAgICAgICAgPHBhdGggZD0iTTggNS41djEzbDEwLjUtNi41TDggNS41eiIgZmlsbD0iY3VycmVudENvbG9yIj48L3BhdGg+CiAgICAgICAgICA8L3N2Zz4KICAgICAgICAgIDxzcGFuPuaUvuaYoOW5u+eBr+eJhzwvc3Bhbj4KICAgICAgICA8L2J1dHRvbj4KICAgICAgPC9oZWFkZXI+CgogICAgICA8IS0tID09PT09PT09PT09PSDlubvnga/niYfnvKnnlaXlm77nvZHmoLwgPT09PT09PT09PT09IC0tPgogICAgICA8bWFpbgogICAgICAgIGNsYXNzPSJwdi1ncmlkIgogICAgICAgIDpjbGFzcz0ieyAncHYtZ3JpZC0tZm91cic6IHRvdGFsU2xpZGVzID09PSA0IH0iCiAgICAgICAgYXJpYS1sYWJlbD0i5bm754Gv54mH5YiX6KGoIgogICAgICA+CiAgICAgICAgPGFydGljbGUKICAgICAgICAgIHYtZm9yPSIoc2xpZGUsIGlkeCkgaW4gYWNjb3VudERhdGEuc2xpZGVzIgogICAgICAgICAgOmtleT0ic2xpZGUuaWQiCiAgICAgICAgICBjbGFzcz0icHYtY2FyZCIKICAgICAgICAgIHJvbGU9ImJ1dHRvbiIKICAgICAgICAgIHRhYmluZGV4PSIwIgogICAgICAgICAgOmFyaWEtbGFiZWw9IifmiZPlvIDnrKwgJyArIChpZHggKyAxKSArICcg6aG177yaJyArIHNsaWRlLnRpdGxlIgogICAgICAgICAgQGNsaWNrPSJvcGVuU2xpZGVBdChpZHgpIgogICAgICAgICAgQGtleXVwLmVudGVyPSJvcGVuU2xpZGVBdChpZHgpIgogICAgICAgICAgQGtleXVwLnNwYWNlLnByZXZlbnQ9Im9wZW5TbGlkZUF0KGlkeCkiCiAgICAgICAgPgogICAgICAgICAgPGRpdgogICAgICAgICAgICBjbGFzcz0icHYtdGh1bWIiCiAgICAgICAgICAgIDpjbGFzcz0iWwogICAgICAgICAgICAgIHNsaWRlLnR5cGUgPT09ICd0aXRsZScgPyAncHYtdGh1bWItLWNvdmVyJyA6ICdwdi10aHVtYi0tY29udGVudCcsCiAgICAgICAgICAgICAgJ3B2LXRodW1iLS0nICsgZ2V0Qm9keUxheW91dChzbGlkZSksCiAgICAgICAgICAgIF0iCiAgICAgICAgICA+CiAgICAgICAgICAgIDwhLS0g5bCB6Z2i57yp55Wl5Zu+IC0tPgogICAgICAgICAgICA8ZGl2IHYtaWY9InNsaWRlLnR5cGUgPT09ICd0aXRsZSciIGNsYXNzPSJwdi10aHVtYi1jb3ZlciI+CiAgICAgICAgICAgICAgPGRpdiBjbGFzcz0icHYtdGh1bWItY292ZXItdG9wIj4KICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJwdi10aHVtYi1jb3Zlci1tYXJrIj4KICAgICAgICAgICAgICAgICAgPHNwYW4+PC9zcGFuPgogICAgICAgICAgICAgICAgICBQUkVTRU5UQVRJT04KICAgICAgICAgICAgICAgIDwvc3Bhbj4KICAgICAgICAgICAgICAgIDxzcGFuPnt7IHBhZChpZHggKyAxKSB9fTwvc3Bhbj4KICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJwdi10aHVtYi1jb3Zlci1tYWluIj4KICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJwdi10aHVtYi1jb3Zlci1raWNrZXIiPkVYRUNVVElWRSBCUklFRjwvc3Bhbj4KICAgICAgICAgICAgICAgIDxoMyBjbGFzcz0icHYtdGh1bWItY292ZXItdGl0bGUiPnt7IHNsaWRlLnRpdGxlIH19PC9oMz4KICAgICAgICAgICAgICAgIDxwIGNsYXNzPSJwdi10aHVtYi1jb3Zlci1zdWJ0aXRsZSI+e3sgZ2V0Q292ZXJTdWJ0aXRsZShzbGlkZSkgfX08L3A+CiAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgPGRpdiBjbGFzcz0icHYtdGh1bWItY292ZXItZm9vdCI+CiAgICAgICAgICAgICAgICA8c3Bhbj57eyBhY2NvdW50RGF0YS5wcmVzZW50ZXIgfX08L3NwYW4+CiAgICAgICAgICAgICAgICA8c3Bhbj57eyBwYWQodG90YWxTbGlkZXMpIH19IFBBR0VTPC9zcGFuPgogICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICA8L2Rpdj4KCiAgICAgICAgICAgIDwhLS0g5YaF5a656aG157yp55Wl5Zu+IC0tPgogICAgICAgICAgICA8dGVtcGxhdGUgdi1lbHNlPgogICAgICAgICAgICAgIDxkaXYgY2xhc3M9InB2LXRodW1iLWhlYWQiPgogICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9InB2LXRodW1iLWluZGV4Ij57eyBwYWQoaWR4ICsgMSkgfX08L3NwYW4+CiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0icHYtdGh1bWItbGFiZWwiPnt7IGdldFNsaWRlVHlwZUxhYmVsKHNsaWRlKSB9fTwvc3Bhbj4KICAgICAgICAgICAgICA8L2Rpdj4KCiAgICAgICAgICAgICAgPGgzIGNsYXNzPSJwdi10aHVtYi10aXRsZSI+e3sgc2xpZGUudGl0bGUgfX08L2gzPgoKICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJwdi10aHVtYi1ib2R5IiA6Y2xhc3M9Iidwdi10aHVtYi1ib2R5LS0nICsgZ2V0Qm9keUxheW91dChzbGlkZSkiPgogICAgICAgICAgICAgICAgPHRlbXBsYXRlIHYtZm9yPSIoZWxlbWVudCwgZUluZGV4KSBpbiAoc2xpZGUuZWxlbWVudHMgfHwgW10pIiA6a2V5PSJlSW5kZXgiPgogICAgICAgICAgICAgICAgICA8cCB2LWlmPSJlbGVtZW50LnR5cGUgPT09ICd0ZXh0JyIgY2xhc3M9InB2LXRodW1iLXRleHQiPgogICAgICAgICAgICAgICAgICAgIHt7IGVsZW1lbnQuY29udGVudCB9fQogICAgICAgICAgICAgICAgICA8L3A+CgogICAgICAgICAgICAgICAgICA8dWwgdi1lbHNlLWlmPSJlbGVtZW50LnR5cGUgPT09ICdsaXN0JyIgY2xhc3M9InB2LXRodW1iLWxpc3QiPgogICAgICAgICAgICAgICAgICAgIDxsaQogICAgICAgICAgICAgICAgICAgICAgdi1mb3I9IihpdGVtLCBsSW5kZXgpIGluIGVsZW1lbnQuY29udGVudC5zbGljZSgwLCAzKSIKICAgICAgICAgICAgICAgICAgICAgIDprZXk9ImxJbmRleCIKICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPSJwdi10aHVtYi1saXN0LWl0ZW0iCiAgICAgICAgICAgICAgICAgICAgPgogICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9InB2LXRodW1iLWxpc3QtaW5kZXgiPnt7IHBhZChsSW5kZXggKyAxKSB9fTwvc3Bhbj4KICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPnt7IGl0ZW0gfX08L3NwYW4+CiAgICAgICAgICAgICAgICAgICAgPC9saT4KICAgICAgICAgICAgICAgICAgPC91bD4KCiAgICAgICAgICAgICAgICAgIDxkaXYgdi1lbHNlLWlmPSJlbGVtZW50LnR5cGUgPT09ICdjaGFydCciIGNsYXNzPSJwdi10aHVtYi1jaGFydCI+CiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0icHYtdGh1bWItY2hhcnQtaGVhZCI+CiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0icHYtdGh1bWItZG90Ij48L3NwYW4+CiAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj57eyBlbGVtZW50LmNvbnRlbnQgfX08L3NwYW4+CiAgICAgICAgICAgICAgICAgICAgPC9kaXY+CgogICAgICAgICAgICAgICAgICAgIDxkaXYKICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPSJwdi10aHVtYi1jaGFydC1jYW52YXMiCiAgICAgICAgICAgICAgICAgICAgICA6Y2xhc3M9Iidwdi10aHVtYi1jaGFydC1jYW52YXMtLScgKyBnZXRDaGFydEtpbmQoZWxlbWVudCkiCiAgICAgICAgICAgICAgICAgICAgICBhcmlhLWhpZGRlbj0idHJ1ZSIKICAgICAgICAgICAgICAgICAgICA+CiAgICAgICAgICAgICAgICAgICAgICA8dGVtcGxhdGUgdi1pZj0iZ2V0Q2hhcnRLaW5kKGVsZW1lbnQpID09PSAnbGluZSciPgogICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIHZpZXdCb3g9IjAgMCAxMDAgNDQiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPgogICAgICAgICAgICAgICAgICAgICAgICAgIDxwb2x5Z29uIGNsYXNzPSJwdi10aHVtYi1hcmVhIiA6cG9pbnRzPSJnZXRDaGFydEFyZWFQb2ludHMoZWxlbWVudCkiPjwvcG9seWdvbj4KICAgICAgICAgICAgICAgICAgICAgICAgICA8cG9seWxpbmUgY2xhc3M9InB2LXRodW1iLWxpbmUiIDpwb2ludHM9ImdldENoYXJ0UG9pbnRzKGVsZW1lbnQpIj48L3BvbHlsaW5lPgogICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz4KICAgICAgICAgICAgICAgICAgICAgIDwvdGVtcGxhdGU+CgogICAgICAgICAgICAgICAgICAgICAgPGRpdiB2LWVsc2UtaWY9ImdldENoYXJ0S2luZChlbGVtZW50KSA9PT0gJ2JhciciIGNsYXNzPSJwdi10aHVtYi1iYXJzIj4KICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4KICAgICAgICAgICAgICAgICAgICAgICAgICB2LWZvcj0iKGJhciwgYmFySW5kZXgpIGluIGdldENoYXJ0QmFycyhlbGVtZW50KSIKICAgICAgICAgICAgICAgICAgICAgICAgICA6a2V5PSJiYXJJbmRleCIKICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz0icHYtdGh1bWItYmFyIgogICAgICAgICAgICAgICAgICAgICAgICAgIDpjbGFzcz0iewogICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3B2LXRodW1iLWJhci0tYWN0aXZlJzoKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIGVsZW1lbnQuaGlnaGxpZ2h0SW5kZXggPT09ICdudW1iZXInICYmCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhckluZGV4ID09PSBlbGVtZW50LmhpZ2hsaWdodEluZGV4LAogICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3B2LXRodW1iLWJhci0tbXV0ZWQnOgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgZWxlbWVudC5oaWdobGlnaHRJbmRleCA9PT0gJ251bWJlcicgJiYKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFySW5kZXggIT09IGVsZW1lbnQuaGlnaGxpZ2h0SW5kZXgsCiAgICAgICAgICAgICAgICAgICAgICAgICAgfSIKICAgICAgICAgICAgICAgICAgICAgICAgICA6c3R5bGU9InsgaGVpZ2h0OiBiYXIgKyAnJScgfSIKICAgICAgICAgICAgICAgICAgICAgICAgPjwvc3Bhbj4KICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PgoKICAgICAgICAgICAgICAgICAgICAgIDxzcGFuCiAgICAgICAgICAgICAgICAgICAgICAgIHYtZWxzZS1pZj0iZ2V0Q2hhcnRLaW5kKGVsZW1lbnQpID09PSAncGllJyIKICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9InB2LXRodW1iLWRvbnV0IgogICAgICAgICAgICAgICAgICAgICAgICA6c3R5bGU9InsgYmFja2dyb3VuZDogZ2V0UGllR3JhZGllbnQoZWxlbWVudCkgfSIKICAgICAgICAgICAgICAgICAgICAgID48L3NwYW4+CgogICAgICAgICAgICAgICAgICAgICAgPGRpdiB2LWVsc2UtaWY9ImdldENoYXJ0S2luZChlbGVtZW50KSA9PT0gJ2Zsb3cnIiBjbGFzcz0icHYtdGh1bWItZmxvdyI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuCiAgICAgICAgICAgICAgICAgICAgICAgICAgdi1mb3I9Iihub2RlLCBub2RlSW5kZXgpIGluIGdldEZsb3dOb2RlcyhlbGVtZW50KSIKICAgICAgICAgICAgICAgICAgICAgICAgICA6a2V5PSJub2RlSW5kZXgiCiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9InB2LXRodW1iLW5vZGUiCiAgICAgICAgICAgICAgICAgICAgICAgID57eyBub2RlIH19PC9zcGFuPgogICAgICAgICAgICAgICAgICAgICAgPC9kaXY+CgogICAgICAgICAgICAgICAgICAgICAgPGRpdiB2LWVsc2UgY2xhc3M9InB2LXRodW1iLW1vY2siPgogICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiB2LWZvcj0ibW9ja0luZGV4IGluIDMiIDprZXk9Im1vY2tJbmRleCI+PC9zcGFuPgogICAgICAgICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICAgIDwvZGl2PgoKICAgICAgICAgICAgICAgICAgPGRpdiB2LWVsc2UtaWY9ImVsZW1lbnQudHlwZSA9PT0gJ2ltYWdlJyIgY2xhc3M9InB2LXRodW1iLWltYWdlIj4KICAgICAgICAgICAgICAgICAgICA8aW1nIDpzcmM9ImVsZW1lbnQudXJsIiA6YWx0PSJlbGVtZW50LmFsdCB8fCAnJyIgLz4KICAgICAgICAgICAgICAgICAgPC9kaXY+CgogICAgICAgICAgICAgICAgICA8YmxvY2txdW90ZSB2LWVsc2UtaWY9ImVsZW1lbnQudHlwZSA9PT0gJ3F1b3RlJyIgY2xhc3M9InB2LXRodW1iLXF1b3RlIj4KICAgICAgICAgICAgICAgICAgICB7eyBlbGVtZW50LmNvbnRlbnQgfX0KICAgICAgICAgICAgICAgICAgPC9ibG9ja3F1b3RlPgoKICAgICAgICAgICAgICAgICAgPGRpdiB2LWVsc2UtaWY9ImVsZW1lbnQudHlwZSA9PT0gJ3RhYmxlJyIgY2xhc3M9InB2LXRodW1iLXRhYmxlIj4KICAgICAgICAgICAgICAgICAgICA8ZGl2CiAgICAgICAgICAgICAgICAgICAgICB2LWZvcj0iKHJvdywgckluZGV4KSBpbiAoZWxlbWVudC5kYXRhIHx8IFtdKS5zbGljZSgwLCAzKSIKICAgICAgICAgICAgICAgICAgICAgIDprZXk9InJJbmRleCIKICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPSJwdi10aHVtYi10YWJsZS1yb3ciCiAgICAgICAgICAgICAgICAgICAgPgogICAgICAgICAgICAgICAgICAgICAgPHNwYW4KICAgICAgICAgICAgICAgICAgICAgICAgdi1mb3I9IihjZWxsLCBjSW5kZXgpIGluIChyb3cgfHwgW10pLnNsaWNlKDAsIDMpIgogICAgICAgICAgICAgICAgICAgICAgICA6a2V5PSJjSW5kZXgiCiAgICAgICAgICAgICAgICAgICAgICA+e3sgY2VsbCB9fTwvc3Bhbj4KICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICA8L3RlbXBsYXRlPgogICAgICAgICAgICAgIDwvZGl2PgoKICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJwdi10aHVtYi1mb290Ij4KICAgICAgICAgICAgICAgIDxzcGFuPnt7IGFjY291bnREYXRhLnRpdGxlIH19PC9zcGFuPgogICAgICAgICAgICAgICAgPHNwYW4+e3sgcGFkKGlkeCArIDEpIH19PC9zcGFuPgogICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICA8L3RlbXBsYXRlPgogICAgICAgICAgPC9kaXY+CgogICAgICAgICAgPGRpdiBjbGFzcz0icHYtY2FyZC1tZXRhIj4KICAgICAgICAgICAgPHNwYW4gY2xhc3M9InB2LWNhcmQtaW5kZXgiPnt7IHBhZChpZHggKyAxKSB9fTwvc3Bhbj4KICAgICAgICAgICAgPHNwYW4gY2xhc3M9InB2LWNhcmQta2luZCI+e3sgZ2V0U2xpZGVUeXBlTGFiZWwoc2xpZGUpIH19PC9zcGFuPgogICAgICAgICAgICA8c3BhbiBjbGFzcz0icHYtY2FyZC1vcGVuIj4KICAgICAgICAgICAgICDmn6XnnIsKICAgICAgICAgICAgICA8c3ZnIHZpZXdCb3g9IjAgMCAyNCAyNCIgYXJpYS1oaWRkZW49InRydWUiPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTUgMTJoMTRNMTMgNmw2IDYtNiA2IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIxLjgiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PC9wYXRoPgogICAgICAgICAgICAgIDwvc3ZnPgogICAgICAgICAgICA8L3NwYW4+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICA8L2FydGljbGU+CiAgICAgIDwvbWFpbj4KCiAgICAgIDxmb290ZXIgY2xhc3M9InB2LWZvb3RlciI+CiAgICAgICAgPHNwYW4+CiAgICAgICAgICB7eyBhY2NvdW50RGF0YS5wcmVzZW50ZXIgfX0KICAgICAgICAgIDx0ZW1wbGF0ZSB2LWlmPSJhY2NvdW50RGF0YS5vY2Nhc2lvbiI+IMK3IHt7IGFjY291bnREYXRhLm9jY2FzaW9uIH19PC90ZW1wbGF0ZT4KICAgICAgICA8L3NwYW4+CiAgICAgICAgPHNwYW4+54K55Ye75Lu75oSP6aG16Z2i5byA5aeL5pS+5pigPC9zcGFuPgogICAgICA8L2Zvb3Rlcj4KICAgIDwvZGl2PgoKICAgIDwhLS0gPT09PT09PT09PT09IOWFqOWxj+aUvuaYoCA9PT09PT09PT09PT0gLS0+CiAgICA8ZGl2CiAgICAgIHYtaWY9ImlzUHJlc2VudGF0aW9uIgogICAgICBjbGFzcz0icHYtb3ZlcmxheSIKICAgICAgcm9sZT0iZGlhbG9nIgogICAgICBhcmlhLW1vZGFsPSJ0cnVlIgogICAgICBhcmlhLWxhYmVsPSLlubvnga/niYfmlL7mmKAiCiAgICA+CiAgICAgIDxkaXYgY2xhc3M9InB2LXRvb2xiYXIiIDpjbGFzcz0ieyAncHYtdG9vbGJhci0taWRsZSc6IHRvb2xiYXJJZGxlIH0iPgogICAgICAgIDxidXR0b24gY2xhc3M9InB2LXRvb2wtYnRuIiB0eXBlPSJidXR0b24iIGFyaWEtbGFiZWw9IuS4iuS4gOmhtSIgQGNsaWNrPSJwcmV2U2xpZGUiPgogICAgICAgICAgPHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIGFyaWEtaGlkZGVuPSJ0cnVlIj4KICAgICAgICAgICAgPHBhdGggZD0iTTE1IDE4bC02LTYgNi02IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIxLjgiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PC9wYXRoPgogICAgICAgICAgPC9zdmc+CiAgICAgICAgPC9idXR0b24+CgogICAgICAgIDxzcGFuIGNsYXNzPSJwdi1jb3VudGVyIiBhcmlhLWxpdmU9InBvbGl0ZSI+CiAgICAgICAgICA8c3Ryb25nPnt7IHBhZChjdXJyZW50U2xpZGVJbmRleCArIDEpIH19PC9zdHJvbmc+CiAgICAgICAgICA8c3Bhbj4vIHt7IHBhZCh0b3RhbFNsaWRlcykgfX08L3NwYW4+CiAgICAgICAgPC9zcGFuPgoKICAgICAgICA8YnV0dG9uIGNsYXNzPSJwdi10b29sLWJ0biIgdHlwZT0iYnV0dG9uIiBhcmlhLWxhYmVsPSLkuIvkuIDpobUiIEBjbGljaz0ibmV4dFNsaWRlIj4KICAgICAgICAgIDxzdmcgdmlld0JveD0iMCAwIDI0IDI0IiBhcmlhLWhpZGRlbj0idHJ1ZSI+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik05IDZsNiA2LTYgNiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMS44IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjwvcGF0aD4KICAgICAgICAgIDwvc3ZnPgogICAgICAgIDwvYnV0dG9uPgoKICAgICAgICA8c3BhbiBjbGFzcz0icHYtdG9vbGJhci1kaXZpZGVyIj48L3NwYW4+CgogICAgICAgIDxidXR0b24gY2xhc3M9InB2LWV4aXQtYnRuIiB0eXBlPSJidXR0b24iIEBjbGljaz0iZXhpdFByZXNlbnRhdGlvbiI+CiAgICAgICAgICA8c3Bhbj7pgIDlh7rmlL7mmKA8L3NwYW4+CiAgICAgICAgICA8a2JkPkVzYzwva2JkPgogICAgICAgIDwvYnV0dG9uPgogICAgICA8L2Rpdj4KCiAgICAgIDxkaXYgY2xhc3M9InB2LXJvdGF0ZS1oaW50IiBhcmlhLWhpZGRlbj0idHJ1ZSI+CiAgICAgICAg5qiq5bGP6KeC55yL5pWI5p6c5pu05L2zCiAgICAgIDwvZGl2PgoKICAgICAgPGRpdgogICAgICAgIGNsYXNzPSJwdi1zdGFnZSIKICAgICAgICA6c3R5bGU9InsgJy0tcHYtc3RhZ2Utc2NhbGUnOiBzdGFnZVNjYWxlIH0iCiAgICAgID4KICAgICAgICA8ZGl2IGNsYXNzPSJzbGlkZXMiPgogICAgICAgICAgPHNlY3Rpb24KICAgICAgICAgICAgdi1mb3I9IihzbGlkZSwgc0lkeCkgaW4gYWNjb3VudERhdGEuc2xpZGVzIgogICAgICAgICAgICA6a2V5PSIncmV2ZWFsLScgKyBzbGlkZS5pZCIKICAgICAgICAgICAgY2xhc3M9InJzLXNsaWRlIgogICAgICAgICAgICA6Y2xhc3M9IlsKICAgICAgICAgICAgICAncnMtZGVuc2l0eS0nICsgZ2V0U2xpZGVEZW5zaXR5KHNsaWRlKSwKICAgICAgICAgICAgICBzbGlkZS50eXBlID09PSAndGl0bGUnID8gJ3JzLXNsaWRlLS1jb3ZlcicgOiAnJywKICAgICAgICAgICAgICBzbGlkZS50eXBlID09PSAnc3VtbWFyeScgPyAncnMtc2xpZGUtLXN1bW1hcnknIDogJycsCiAgICAgICAgICAgICAgeyAnaXMtY3VycmVudCc6IHNJZHggPT09IGN1cnJlbnRTbGlkZUluZGV4IH0sCiAgICAgICAgICAgIF0iCiAgICAgICAgICAgIDpkYXRhLXNsaWRlLWlkPSJzbGlkZS5pZCIKICAgICAgICAgICAgOmFyaWEtbGFiZWw9IifnrKwgJyArIChzSWR4ICsgMSkgKyAnIOmhte+8micgKyBzbGlkZS50aXRsZSIKICAgICAgICAgICAgOmFyaWEtaGlkZGVuPSJzSWR4ID09PSBjdXJyZW50U2xpZGVJbmRleCA/ICdmYWxzZScgOiAndHJ1ZSciCiAgICAgICAgICA+CiAgICAgICAgICAgIDwhLS0gPT09PT0g5bCB6Z2iID09PT09IC0tPgogICAgICAgICAgICA8dGVtcGxhdGUgdi1pZj0ic2xpZGUudHlwZSA9PT0gJ3RpdGxlJyI+CiAgICAgICAgICAgICAgPGRpdiBjbGFzcz0icnMtY292ZXItYmciIGFyaWEtaGlkZGVuPSJ0cnVlIj4KICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJycy1jb3Zlci1ncmlkIj48L3NwYW4+CiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0icnMtY292ZXItZ2xvdyI+PC9zcGFuPgogICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9InJzLWNvdmVyLWF4aXMiPjwvc3Bhbj4KICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJycy1jb3Zlci1yaW5nIHJzLWNvdmVyLXJpbmctLTEiPjwvc3Bhbj4KICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJycy1jb3Zlci1yaW5nIHJzLWNvdmVyLXJpbmctLTIiPjwvc3Bhbj4KICAgICAgICAgICAgICA8L2Rpdj4KCiAgICAgICAgICAgICAgPGRpdiBjbGFzcz0icnMtY292ZXItZnJhbWUiPgogICAgICAgICAgICAgICAgPGRpdgogICAgICAgICAgICAgICAgICBjbGFzcz0icnMtY292ZXItdG9wIHJzLWFuaW0tdGFyZ2V0IHJzLWFuaW0tZmFkZS1pbiIKICAgICAgICAgICAgICAgICAgOnN0eWxlPSJ7ICctLWFuaW0tZGVsYXknOiAnMG1zJyB9IgogICAgICAgICAgICAgICAgPgogICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0icnMtY292ZXItbWFyayI+PHNwYW4+PC9zcGFuPlBSRVNFTlRBVElPTjwvc3Bhbj4KICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9InJzLWNvdmVyLWRlY2siPnt7IGFjY291bnREYXRhLnRpdGxlIH19PC9zcGFuPgogICAgICAgICAgICAgICAgPC9kaXY+CgogICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0icnMtY292ZXItbWFpbiI+CiAgICAgICAgICAgICAgICAgIDxkaXYKICAgICAgICAgICAgICAgICAgICBjbGFzcz0icnMtY292ZXIta2lja2VyIHJzLWFuaW0tdGFyZ2V0IHJzLWFuaW0tc2xpZGUtZG93biIKICAgICAgICAgICAgICAgICAgICA6c3R5bGU9InsgJy0tYW5pbS1kZWxheSc6ICc3MG1zJyB9IgogICAgICAgICAgICAgICAgICA+CiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9InJzLWNvdmVyLWtpY2tlci1saW5lIj48L3NwYW4+CiAgICAgICAgICAgICAgICAgICAgPHNwYW4+RVhFQ1VUSVZFIEJSSUVGPC9zcGFuPgogICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJycy1jb3Zlci1raWNrZXItbm8iPi8ge3sgcGFkKHNJZHggKyAxKSB9fTwvc3Bhbj4KICAgICAgICAgICAgICAgICAgPC9kaXY+CgogICAgICAgICAgICAgICAgICA8aDEKICAgICAgICAgICAgICAgICAgICBjbGFzcz0icnMtY292ZXItdGl0bGUgcnMtYW5pbS10YXJnZXQgcnMtYW5pbS1mYWRlLXVwIgogICAgICAgICAgICAgICAgICAgIDpzdHlsZT0ieyAnLS1hbmltLWRlbGF5JzogJzE1MG1zJyB9IgogICAgICAgICAgICAgICAgICA+e3sgc2xpZGUudGl0bGUgfX08L2gxPgoKICAgICAgICAgICAgICAgICAgPHAKICAgICAgICAgICAgICAgICAgICB2LWZvcj0iKGVsZW1lbnQsIGVsZW1lbnRJbmRleCkgaW4gZ2V0Q292ZXJUZXh0cyhzbGlkZSkiCiAgICAgICAgICAgICAgICAgICAgOmtleT0iJ2NvdmVyLXRleHQtJyArIGVsZW1lbnRJbmRleCIKICAgICAgICAgICAgICAgICAgICBjbGFzcz0icnMtY292ZXItc3VidGl0bGUgcnMtYW5pbS10YXJnZXQgcnMtYW5pbS1mYWRlLXVwIgogICAgICAgICAgICAgICAgICAgIDpzdHlsZT0ieyAnLS1hbmltLWRlbGF5JzogMjYwICsgZWxlbWVudEluZGV4ICogMTAwICsgJ21zJyB9IgogICAgICAgICAgICAgICAgICA+e3sgZWxlbWVudC5jb250ZW50IH19PC9wPgogICAgICAgICAgICAgICAgPC9kaXY+CgogICAgICAgICAgICAgICAgPGRpdgogICAgICAgICAgICAgICAgICBjbGFzcz0icnMtY292ZXItZm9vdCBycy1hbmltLXRhcmdldCBycy1hbmltLWZhZGUtaW4iCiAgICAgICAgICAgICAgICAgIDpzdHlsZT0ieyAnLS1hbmltLWRlbGF5JzogJzQ4MG1zJyB9IgogICAgICAgICAgICAgICAgPgogICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0icnMtY292ZXItcHJlc2VudGVyIj4KICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0icnMtY292ZXItYXZhdGFyIj57eyBwcmVzZW50ZXJJbml0aWFsIH19PC9zcGFuPgogICAgICAgICAgICAgICAgICAgIDxzcGFuPnt7IGFjY291bnREYXRhLnByZXNlbnRlciB9fTwvc3Bhbj4KICAgICAgICAgICAgICAgICAgPC9zcGFuPgogICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0icnMtY292ZXItcGFnZSI+e3sgcGFkKHNJZHggKyAxKSB9fSAvIHt7IHBhZCh0b3RhbFNsaWRlcykgfX08L3NwYW4+CiAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgPC90ZW1wbGF0ZT4KCiAgICAgICAgICAgIDwhLS0gPT09PT0g5YaF5a656aG1ID09PT09IC0tPgogICAgICAgICAgICA8dGVtcGxhdGUgdi1lbHNlPgogICAgICAgICAgICAgIDxoZWFkZXIgY2xhc3M9InJzLWhlYWRlciI+CiAgICAgICAgICAgICAgICA8ZGl2CiAgICAgICAgICAgICAgICAgIGNsYXNzPSJycy1leWVicm93IHJzLWFuaW0tdGFyZ2V0IHJzLWFuaW0tZmFkZS1pbiIKICAgICAgICAgICAgICAgICAgOnN0eWxlPSJ7ICctLWFuaW0tZGVsYXknOiAnMG1zJyB9IgogICAgICAgICAgICAgICAgPgogICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0icnMtZXllYnJvdy1pbmRleCI+e3sgcGFkKHNJZHggKyAxKSB9fTwvc3Bhbj4KICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9InJzLWV5ZWJyb3ctcnVsZSI+PC9zcGFuPgogICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0icnMtZXllYnJvdy1sYWJlbCI+e3sgZ2V0U2xpZGVUeXBlTGFiZWwoc2xpZGUpIH19PC9zcGFuPgogICAgICAgICAgICAgICAgPC9kaXY+CgogICAgICAgICAgICAgICAgPGgyCiAgICAgICAgICAgICAgICAgIGNsYXNzPSJycy1oZWFkZXItdGl0bGUgcnMtYW5pbS10YXJnZXQgcnMtYW5pbS1mYWRlLXVwIgogICAgICAgICAgICAgICAgICA6c3R5bGU9InsgJy0tYW5pbS1kZWxheSc6ICc4MG1zJyB9IgogICAgICAgICAgICAgICAgPnt7IHNsaWRlLnRpdGxlIH19PC9oMj4KICAgICAgICAgICAgICA8L2hlYWRlcj4KCiAgICAgICAgICAgICAgPGRpdiBjbGFzcz0icnMtYm9keSIgOmNsYXNzPSIncnMtYm9keS0tJyArIGdldEJvZHlMYXlvdXQoc2xpZGUpIj4KICAgICAgICAgICAgICAgIDxkaXYKICAgICAgICAgICAgICAgICAgdi1mb3I9IihlbGVtZW50LCBlSW5kZXgpIGluIChzbGlkZS5lbGVtZW50cyB8fCBbXSkiCiAgICAgICAgICAgICAgICAgIDprZXk9IidlbGVtZW50LScgKyBlSW5kZXgiCiAgICAgICAgICAgICAgICAgIGNsYXNzPSJycy1ibG9jayIKICAgICAgICAgICAgICAgICAgOmNsYXNzPSJbJ3JzLWJsb2NrLS0nICsgZWxlbWVudC50eXBlLCBnZXRCbG9ja0dyaWRTcGFuKHNsaWRlLCBlbGVtZW50LCBlSW5kZXgpXSIKICAgICAgICAgICAgICAgID4KICAgICAgICAgICAgICAgICAgPHAKICAgICAgICAgICAgICAgICAgICB2LWlmPSJlbGVtZW50LnR5cGUgPT09ICd0ZXh0JyIKICAgICAgICAgICAgICAgICAgICBjbGFzcz0icnMtdGV4dCBycy1hbmltLXRhcmdldCBycy1hbmltLWZhZGUtdXAiCiAgICAgICAgICAgICAgICAgICAgOmNsYXNzPSJ7ICdycy10ZXh0LS1zdGF0ZW1lbnQnOiBnZXRCb2R5TGF5b3V0KHNsaWRlKSA9PT0gJ3NvbG8nIH0iCiAgICAgICAgICAgICAgICAgICAgOnN0eWxlPSJhbmltVGV4dFN0eWxlKGVsZW1lbnQsIHNsaWRlLCBlSW5kZXgpIgogICAgICAgICAgICAgICAgICA+e3sgZWxlbWVudC5jb250ZW50IH19PC9wPgoKICAgICAgICAgICAgICAgICAgPHVsCiAgICAgICAgICAgICAgICAgICAgdi1lbHNlLWlmPSJlbGVtZW50LnR5cGUgPT09ICdsaXN0JyIKICAgICAgICAgICAgICAgICAgICBjbGFzcz0icnMtbGlzdCIKICAgICAgICAgICAgICAgICAgPgogICAgICAgICAgICAgICAgICAgIDxsaQogICAgICAgICAgICAgICAgICAgICAgdi1mb3I9IihpdGVtLCBsSW5kZXgpIGluIGVsZW1lbnQuY29udGVudCIKICAgICAgICAgICAgICAgICAgICAgIDprZXk9IidsaXN0LScgKyBsSW5kZXgiCiAgICAgICAgICAgICAgICAgICAgICBjbGFzcz0icnMtbGlzdC1pdGVtIHJzLWFuaW0tdGFyZ2V0IHJzLWFuaW0tZmFkZS11cCIKICAgICAgICAgICAgICAgICAgICAgIDpzdHlsZT0ieyAnLS1hbmltLWRlbGF5JzogYW5pbUJsb2NrRGVsYXkoZUluZGV4LCBsSW5kZXgpICsgJ21zJyB9IgogICAgICAgICAgICAgICAgICAgID4KICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJycy1saXN0LWluZGV4Ij57eyBwYWQobEluZGV4ICsgMSkgfX08L3NwYW4+CiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0icnMtbGlzdC10ZXh0Ij57eyBpdGVtIH19PC9zcGFuPgogICAgICAgICAgICAgICAgICAgIDwvbGk+CiAgICAgICAgICAgICAgICAgIDwvdWw+CgogICAgICAgICAgICAgICAgICA8ZGl2CiAgICAgICAgICAgICAgICAgICAgdi1lbHNlLWlmPSJlbGVtZW50LnR5cGUgPT09ICdjaGFydCciCiAgICAgICAgICAgICAgICAgICAgY2xhc3M9InJzLWNoYXJ0IHJzLWFuaW0tdGFyZ2V0IHJzLWFuaW0tZmFkZS11cCIKICAgICAgICAgICAgICAgICAgICA6Y2xhc3M9InsgJ3JzLWNoYXJ0LS1kaWFncmFtJzogZWxlbWVudC5jaGFydFR5cGUgPT09ICdtZXJtYWlkJyB9IgogICAgICAgICAgICAgICAgICAgIDpzdHlsZT0ieyAnLS1hbmltLWRlbGF5JzogYW5pbUJsb2NrRGVsYXkoZUluZGV4LCAwKSArICdtcycgfSIKICAgICAgICAgICAgICAgICAgPgogICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9InJzLWNoYXJ0LWhlYWQiPgogICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0icnMtY2hhcnQtaGVhZGluZyI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJycy1jaGFydC1tYXJrIj48L3NwYW4+CiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJycy1jaGFydC10aXRsZSI+e3sgZWxlbWVudC5jb250ZW50IH19PC9zcGFuPgogICAgICAgICAgICAgICAgICAgICAgPC9kaXY+CgogICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0icnMtY2hhcnQtaGVhZC1yaWdodCI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJycy1jaGFydC1maWciPkZJRy4ge3sgcGFkKGVJbmRleCArIDEpIH19PC9zcGFuPgogICAgICAgICAgICAgICAgICAgICAgICA8ZGl2CiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9InJzLWNoYXJ0LXpvb20tdG9vbHMiCiAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9Iua7mui9rue8qeaUvu+8jOaLluWKqOW5s+enu++8jOWPjOWHu+WkjeS9jSIKICAgICAgICAgICAgICAgICAgICAgICAgICBAcG9pbnRlcmRvd24uc3RvcAogICAgICAgICAgICAgICAgICAgICAgICAgIEBkYmxjbGljay5zdG9wCiAgICAgICAgICAgICAgICAgICAgICAgID4KICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uCiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz0icnMtY2hhcnQtem9vbS1idG4iCiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPSJidXR0b24iCiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPSLnvKnlsI/lm77ooagiCiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ZGlzYWJsZWQ9ImdldENoYXJ0Wm9vbShzbGlkZSwgZUluZGV4KSA8PSAwLjUiCiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAY2xpY2suc3RvcD0iem9vbUNoYXJ0KHNsaWRlLCBlSW5kZXgsIC0wLjE1KSIKICAgICAgICAgICAgICAgICAgICAgICAgICA+4oiSPC9idXR0b24+CiAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbgogICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9InJzLWNoYXJ0LXpvb20tdmFsdWUiCiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPSJidXR0b24iCiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZT0i5oGi5aSNIDEwMCUiCiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAY2xpY2suc3RvcD0icmVzZXRDaGFydFpvb20oc2xpZGUsIGVJbmRleCkiCiAgICAgICAgICAgICAgICAgICAgICAgICAgPnt7IGdldENoYXJ0Wm9vbVBlcmNlbnQoc2xpZGUsIGVJbmRleCkgfX08L2J1dHRvbj4KICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uCiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz0icnMtY2hhcnQtem9vbS1idG4iCiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPSJidXR0b24iCiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPSLmlL7lpKflm77ooagiCiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ZGlzYWJsZWQ9ImdldENoYXJ0Wm9vbShzbGlkZSwgZUluZGV4KSA+PSAzIgogICAgICAgICAgICAgICAgICAgICAgICAgICAgQGNsaWNrLnN0b3A9Inpvb21DaGFydChzbGlkZSwgZUluZGV4LCAwLjE1KSIKICAgICAgICAgICAgICAgICAgICAgICAgICA+KzwvYnV0dG9uPgogICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgICAgIDwvZGl2PgoKICAgICAgICAgICAgICAgICAgICA8ZGl2CiAgICAgICAgICAgICAgICAgICAgICBjbGFzcz0icnMtY2hhcnQtaW5uZXIiCiAgICAgICAgICAgICAgICAgICAgICA6Y2xhc3M9InsgJ3JzLWNoYXJ0LWlubmVyLS1kaWFncmFtJzogZWxlbWVudC5jaGFydFR5cGUgPT09ICdtZXJtYWlkJyB9IgogICAgICAgICAgICAgICAgICAgICAgOnN0eWxlPSIKICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5jaGFydFR5cGUgPT09ICdtZXJtYWlkJwogICAgICAgICAgICAgICAgICAgICAgICAgID8geyBhc3BlY3RSYXRpbzogU3RyaW5nKGdldERpYWdyYW1Bc3BlY3Qoc2xpZGUsIGVJbmRleCkpIH0KICAgICAgICAgICAgICAgICAgICAgICAgICA6IG51bGwKICAgICAgICAgICAgICAgICAgICAgICIKICAgICAgICAgICAgICAgICAgICAgIEB3aGVlbC5wcmV2ZW50PSJoYW5kbGVDaGFydFdoZWVsKCRldmVudCwgc2xpZGUsIGVJbmRleCkiCiAgICAgICAgICAgICAgICAgICAgICBAZGJsY2xpY2s9InJlc2V0Q2hhcnRab29tKHNsaWRlLCBlSW5kZXgpIgogICAgICAgICAgICAgICAgICAgID4KICAgICAgICAgICAgICAgICAgICAgIDxkaXYKICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9InJzLWNoYXJ0LXpvb20iCiAgICAgICAgICAgICAgICAgICAgICAgIDpjbGFzcz0ieyAnaXMtcGFubmluZyc6IGlzQ2hhcnRQYW5uaW5nKHNsaWRlLCBlSW5kZXgpIH0iCiAgICAgICAgICAgICAgICAgICAgICAgIDpzdHlsZT0iZ2V0Q2hhcnRab29tU3R5bGUoc2xpZGUsIGVJbmRleCkiCiAgICAgICAgICAgICAgICAgICAgICAgIDpkYXRhLWNoYXJ0LWtleT0iY2hhcnRLZXkoc2xpZGUsIGVJbmRleCkiCiAgICAgICAgICAgICAgICAgICAgICAgIEBwb2ludGVyZG93bj0ic3RhcnRDaGFydFBhbigkZXZlbnQpIgogICAgICAgICAgICAgICAgICAgICAgPgogICAgICAgICAgICAgICAgICAgICAgICA8Y2FudmFzCiAgICAgICAgICAgICAgICAgICAgICAgICAgdi1pZj0iZWxlbWVudC5jaGFydFR5cGUgPT09ICdjaGFydGpzJyIKICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz0icnMtY2hhcnQtY2FudmFzIgogICAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU9ImltZyIKICAgICAgICAgICAgICAgICAgICAgICAgICA6YXJpYS1sYWJlbD0iZWxlbWVudC5jb250ZW50IHx8ICfmlbDmja7lm77ooagnIgogICAgICAgICAgICAgICAgICAgICAgICAgIDpkYXRhLWNoYXJ0LWtleT0iJ3JldmVhbC0nICsgc2xpZGUuaWQgKyAnLScgKyBlSW5kZXgiCiAgICAgICAgICAgICAgICAgICAgICAgID48L2NhbnZhcz4KICAgICAgICAgICAgICAgICAgICAgICAgPGRpdgogICAgICAgICAgICAgICAgICAgICAgICAgIHYtZWxzZS1pZj0iZWxlbWVudC5jaGFydFR5cGUgPT09ICdtZXJtYWlkJyIKICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz0icnMtbWVybWFpZCIKICAgICAgICAgICAgICAgICAgICAgICAgICByb2xlPSJpbWciCiAgICAgICAgICAgICAgICAgICAgICAgICAgOmFyaWEtbGFiZWw9ImVsZW1lbnQuY29udGVudCB8fCAn5rWB56iL5Zu+JyIKICAgICAgICAgICAgICAgICAgICAgICAgICA6ZGF0YS1tZXJtYWlkLWtleT0iJ3JldmVhbC0nICsgc2xpZGUuaWQgKyAnLScgKyBlSW5kZXgiCiAgICAgICAgICAgICAgICAgICAgICAgID48L2Rpdj4KICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiB2LWVsc2UgY2xhc3M9InJzLWNoYXJ0LWZhbGxiYWNrIj4KICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0icnMtY2hhcnQtZmFsbGJhY2stbWFyayI+PC9zcGFuPgogICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPnt7IGVsZW1lbnQuY29udGVudCB9fTwvc3Bhbj4KICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KCiAgICAgICAgICAgICAgICAgICAgICA8ZGl2CiAgICAgICAgICAgICAgICAgICAgICAgIHYtaWY9ImlzQ2hhcnRVbmF2YWlsYWJsZShzbGlkZSwgZUluZGV4LCBlbGVtZW50KSIKICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9InJzLWNoYXJ0LWZhbGxiYWNrIHJzLWNoYXJ0LWZhbGxiYWNrLS1vdmVybGF5IgogICAgICAgICAgICAgICAgICAgICAgPgogICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0icnMtY2hhcnQtZmFsbGJhY2stbWFyayI+PC9zcGFuPgogICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj57eyBlbGVtZW50LmNvbnRlbnQgfX08L3NwYW4+CiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KCiAgICAgICAgICAgICAgICAgICAgPGRpdiB2LWlmPSJlbGVtZW50LnNvdXJjZSIgY2xhc3M9InJzLWNoYXJ0LXNvdXJjZSI+CiAgICAgICAgICAgICAgICAgICAgICDmlbDmja7mnaXmupDvvJp7eyBlbGVtZW50LnNvdXJjZSB9fQogICAgICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgICA8L2Rpdj4KCiAgICAgICAgICAgICAgICAgIDxmaWd1cmUKICAgICAgICAgICAgICAgICAgICB2LWVsc2UtaWY9ImVsZW1lbnQudHlwZSA9PT0gJ2ltYWdlJyIKICAgICAgICAgICAgICAgICAgICBjbGFzcz0icnMtZmlndXJlIHJzLWFuaW0tdGFyZ2V0IHJzLWFuaW0tc2NhbGUtaW4iCiAgICAgICAgICAgICAgICAgICAgOnN0eWxlPSJ7ICctLWFuaW0tZGVsYXknOiBhbmltQmxvY2tEZWxheShlSW5kZXgsIDApICsgJ21zJyB9IgogICAgICAgICAgICAgICAgICA+CiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0icnMtaW1hZ2UtYm94Ij4KICAgICAgICAgICAgICAgICAgICAgIDxpbWcKICAgICAgICAgICAgICAgICAgICAgICAgOnNyYz0iZWxlbWVudC51cmwiCiAgICAgICAgICAgICAgICAgICAgICAgIDphbHQ9ImVsZW1lbnQuYWx0IHx8ICcnIgogICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz0icnMtaW1nIgogICAgICAgICAgICAgICAgICAgICAgICA6c3R5bGU9InsKICAgICAgICAgICAgICAgICAgICAgICAgICBvYmplY3RGaXQ6IGVsZW1lbnQuZml0IHx8ICdjb3ZlcicsCiAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0UG9zaXRpb246IGVsZW1lbnQucG9zaXRpb24gfHwgJ2NlbnRlcicsCiAgICAgICAgICAgICAgICAgICAgICAgIH0iCiAgICAgICAgICAgICAgICAgICAgICAvPgogICAgICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgICAgIDxmaWdjYXB0aW9uIHYtaWY9ImVsZW1lbnQuYWx0IiBjbGFzcz0icnMtZmlndXJlLWNhcHRpb24iPgogICAgICAgICAgICAgICAgICAgICAge3sgZWxlbWVudC5hbHQgfX0KICAgICAgICAgICAgICAgICAgICA8L2ZpZ2NhcHRpb24+CiAgICAgICAgICAgICAgICAgIDwvZmlndXJlPgoKICAgICAgICAgICAgICAgICAgPGJsb2NrcXVvdGUKICAgICAgICAgICAgICAgICAgICB2LWVsc2UtaWY9ImVsZW1lbnQudHlwZSA9PT0gJ3F1b3RlJyIKICAgICAgICAgICAgICAgICAgICBjbGFzcz0icnMtcXVvdGUgcnMtYW5pbS10YXJnZXQgcnMtYW5pbS1mYWRlLXVwIgogICAgICAgICAgICAgICAgICAgIDpzdHlsZT0ieyAnLS1hbmltLWRlbGF5JzogYW5pbUJsb2NrRGVsYXkoZUluZGV4LCAwKSArICdtcycgfSIKICAgICAgICAgICAgICAgICAgPgogICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJycy1xdW90ZS1tYXJrIiBhcmlhLWhpZGRlbj0idHJ1ZSI+4oCcPC9zcGFuPgogICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzPSJycy1xdW90ZS10ZXh0Ij57eyBlbGVtZW50LmNvbnRlbnQgfX08L3A+CiAgICAgICAgICAgICAgICAgICAgPGNpdGUgdi1pZj0iZWxlbWVudC5jaXRlIiBjbGFzcz0icnMtcXVvdGUtY2l0ZSI+e3sgZWxlbWVudC5jaXRlIH19PC9jaXRlPgogICAgICAgICAgICAgICAgICA8L2Jsb2NrcXVvdGU+CgogICAgICAgICAgICAgICAgICA8ZGl2CiAgICAgICAgICAgICAgICAgICAgdi1lbHNlLWlmPSJlbGVtZW50LnR5cGUgPT09ICd0YWJsZSciCiAgICAgICAgICAgICAgICAgICAgY2xhc3M9InJzLXRhYmxlLXdyYXAgcnMtYW5pbS10YXJnZXQgcnMtYW5pbS1mYWRlLXVwIgogICAgICAgICAgICAgICAgICAgIDpzdHlsZT0ieyAnLS1hbmltLWRlbGF5JzogYW5pbUJsb2NrRGVsYXkoZUluZGV4LCAwKSArICdtcycgfSIKICAgICAgICAgICAgICAgICAgPgogICAgICAgICAgICAgICAgICAgIDx0YWJsZSBjbGFzcz0icnMtdGFibGUiPgogICAgICAgICAgICAgICAgICAgICAgPHRoZWFkIHYtaWY9ImVsZW1lbnQuaGVhZGVycyI+CiAgICAgICAgICAgICAgICAgICAgICAgIDx0cj4KICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggdi1mb3I9IihoZWFkZXIsIGhJbmRleCkgaW4gZWxlbWVudC5oZWFkZXJzIiA6a2V5PSIndGgtJyArIGhJbmRleCI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7eyBoZWFkZXIgfX0KICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RoPgogICAgICAgICAgICAgICAgICAgICAgICA8L3RyPgogICAgICAgICAgICAgICAgICAgICAgPC90aGVhZD4KICAgICAgICAgICAgICAgICAgICAgIDx0Ym9keT4KICAgICAgICAgICAgICAgICAgICAgICAgPHRyIHYtZm9yPSIocm93LCBySW5kZXgpIGluIChlbGVtZW50LmRhdGEgfHwgW10pIiA6a2V5PSIndHItJyArIHJJbmRleCI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHYtZm9yPSIoY2VsbCwgY0luZGV4KSBpbiByb3ciIDprZXk9Iid0ZC0nICsgY0luZGV4Ij4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7IGNlbGwgfX0KICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPgogICAgICAgICAgICAgICAgICAgICAgICA8L3RyPgogICAgICAgICAgICAgICAgICAgICAgPC90Ym9keT4KICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPgogICAgICAgICAgICAgICAgICAgIDxwIHYtaWY9ImVsZW1lbnQuc291cmNlIiBjbGFzcz0icnMtdGFibGUtc291cmNlIj7mlbDmja7mnaXmupDvvJp7eyBlbGVtZW50LnNvdXJjZSB9fTwvcD4KICAgICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICA8L2Rpdj4KCiAgICAgICAgICAgICAgPGZvb3RlciBjbGFzcz0icnMtZm9vdGVyIj4KICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJycy1mb290ZXItYnJhbmQiPgogICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0icnMtZm9vdGVyLW1hcmsiPjwvc3Bhbj4KICAgICAgICAgICAgICAgICAge3sgYWNjb3VudERhdGEudGl0bGUgfX0KICAgICAgICAgICAgICAgIDwvc3Bhbj4KICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJycy1mb290ZXItcGFnZSI+CiAgICAgICAgICAgICAgICAgIDxiPnt7IHBhZChzSWR4ICsgMSkgfX08L2I+CiAgICAgICAgICAgICAgICAgIDxzcGFuPi8ge3sgcGFkKHRvdGFsU2xpZGVzKSB9fTwvc3Bhbj4KICAgICAgICAgICAgICAgIDwvc3Bhbj4KICAgICAgICAgICAgICA8L2Zvb3Rlcj4KICAgICAgICAgICAgPC90ZW1wbGF0ZT4KICAgICAgICAgIDwvc2VjdGlvbj4KICAgICAgICA8L2Rpdj4KICAgICAgPC9kaXY+CgogICAgICA8ZGl2IGNsYXNzPSJwdi1wcm9ncmVzcyIgYXJpYS1oaWRkZW49InRydWUiPgogICAgICAgIDxzcGFuIDpzdHlsZT0ieyB3aWR0aDogcHJvZ3Jlc3NQZXJjZW50ICsgJyUnIH0iPjwvc3Bhbj4KICAgICAgPC9kaXY+CiAgICA8L2Rpdj4KICA8L2Rpdj4KPC90ZW1wbGF0ZT4KCjxzY3JpcHQ+CiAgZXhwb3J0IGRlZmF1bHQgewogICAgbmFtZTogIlByZXNlbnRhdGlvblZpZXdlciIsCgogICAgZGF0YSgpIHsKICAgICAgcmV0dXJuIHsKICAgICAgICBmb250U3RhY2s6CiAgICAgICAgICAnIlNGIFBybyBEaXNwbGF5IiwgIlNGIFBybyBUZXh0IiwgLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAiUGluZ0ZhbmcgU0MiLCAiSGlyYWdpbm8gU2FucyBHQiIsICJOb3RvIFNhbnMgU0MiLCAiTWljcm9zb2Z0IFlhSGVpIiwgc2Fucy1zZXJpZicsCiAgICAgICAgY2hhcnRQYWxldHRlOiBbIiMwYjVjZmYiLCAiIzEyYTU5NCIsICIjZjU5ZTBiIiwgIiM3YzNhZWQiLCAiIzk0YTNiOCJdLAoKICAgICAgICBpc1ByZXNlbnRhdGlvbjogZmFsc2UsCiAgICAgICAgdG9vbGJhcklkbGU6IGZhbHNlLAogICAgICAgIHRvb2xiYXJUaW1lcjogbnVsbCwKICAgICAgICBzdGFnZVNjYWxlOiAxLAogICAgICAgIGNoYXJ0SnNMb2FkZWQ6IGZhbHNlLAogICAgICAgIG1lcm1haWRMb2FkZWQ6IGZhbHNlLAogICAgICAgIENoYXJ0OiBudWxsLAogICAgICAgIG1lcm1haWQ6IG51bGwsCiAgICAgICAgY2hhcnRJbnN0YW5jZXM6IHt9LAogICAgICAgIGNoYXJ0RmFpbHVyZXM6IHt9LAogICAgICAgIGNoYXJ0Wm9vbToge30sCiAgICAgICAgY2hhcnRQYW46IHt9LAogICAgICAgIGRpYWdyYW1SYXRpb3M6IHt9LAogICAgICAgIGNoYXJ0UGFuU3RhdGU6IG51bGwsCiAgICAgICAgY3VycmVudFNsaWRlSW5kZXg6IDAsCiAgICAgICAgYW5pbWF0aW9uVGltZXI6IG51bGwsCiAgICAgICAgdmlzaWJpbGl0eVRpbWVyOiBudWxsLAogICAgICAgIHJlc2l6ZUZyYW1lOiBudWxsLAogICAgICAgIHN0YWdlUmVzaXplT2JzZXJ2ZXI6IG51bGwsCiAgICAgICAgYm9keU92ZXJmbG93OiAiIiwKICAgICAgICBldmVudHNCb3VuZDogZmFsc2UsCiAgICAgICAgdG91Y2hTdGFydFg6IDAsCiAgICAgICAgdG91Y2hTdGFydFk6IDAsCiAgICAgICAgdG91Y2hTdGFydFRpbWU6IDAsCiAgICAgICAgdG91Y2hTdGFydEluWm9vbWVkQ2hhcnQ6IGZhbHNlLAoKICAgICAgICBhY2NvdW50RGF0YTogewogICAgICAgICAgdGl0bGU6ICJBSSDmnrbmnoTlpJrnq6/ljY/lkIzmvJTov5vmiqXlkYoiLAogICAgICAgICAgcHJlc2VudGVyOiAi5oqA5pyv5p625p6E6YOoIiwKICAgICAgICAgIHN1YnRpdGxlOiAiQUkg6amx5Yqo55qE5aSa56uv5riy5p+T5p625p6EIiwKICAgICAgICAgIG9jY2FzaW9uOiAi5YaF6YOo5oqA5pyv5YiG5LqrIiwKICAgICAgICAgIHNsaWRlczogWwogICAgICAgICAgICB7CiAgICAgICAgICAgICAgaWQ6ICJjb3ZlciIsCiAgICAgICAgICAgICAgdHlwZTogInRpdGxlIiwKICAgICAgICAgICAgICB0aXRsZTogIuWkmuerr+WkmuaAgea4suafk+aetuaehOa8lOi/myIsCiAgICAgICAgICAgICAgZWxlbWVudHM6IFsKICAgICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgdHlwZTogInRleHQiLAogICAgICAgICAgICAgICAgICBjb250ZW50OgogICAgICAgICAgICAgICAgICAgICLku6Xnu5/kuIDlupXluqfljY/orq7ov57mjqXliqjmgIHlm77ooajkuI7lpJrmqKHmgIHmlbDmja7vvIzmnoTlu7rpnaLlkJHmnKrmnaXnmoTlpJrnq6/muLLmn5PlvJXmk47jgIIiLAogICAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICBdLAogICAgICAgICAgICB9LAogICAgICAgICAgICB7CiAgICAgICAgICAgICAgaWQ6ICJjaGFydGpzLWRlbW8iLAogICAgICAgICAgICAgIHR5cGU6ICJzcGxpdCIsCiAgICAgICAgICAgICAgdGl0bGU6ICLlkJ7lkJDph4/kv53mjIHpq5jpgJ/lop7plb8iLAogICAgICAgICAgICAgIGVsZW1lbnRzOiBbCiAgICAgICAgICAgICAgICB7CiAgICAgICAgICAgICAgICAgIHR5cGU6ICJ0ZXh0IiwKICAgICAgICAgICAgICAgICAgY29udGVudDoKICAgICAgICAgICAgICAgICAgICAiQ2FudmFzIOi9u+mHj+a4suafk+WcqOenu+WKqOerr+S4juWkp+Wxj+WcuuaZr+S4i+WFvOmhvuaAp+iDveS4juS6pOS6kuS9k+mqjO+8jOaguOW/g+WQnuWQkOmHj+i/nue7reWbm+S4quWto+W6puS/neaMgeWinumVv+OAgiIsCiAgICAgICAgICAgICAgICB9LAogICAgICAgICAgICAgICAgewogICAgICAgICAgICAgICAgICB0eXBlOiAiY2hhcnQiLAogICAgICAgICAgICAgICAgICBjaGFydFR5cGU6ICJjaGFydGpzIiwKICAgICAgICAgICAgICAgICAgY29udGVudDogIuWto+W6puWQnuWQkOmHj++8iFRQU++8iSIsCiAgICAgICAgICAgICAgICAgIHNvdXJjZTogIuW5s+WPsOebkeaOp+aVsOaNriIsCiAgICAgICAgICAgICAgICAgIGNoYXJ0RGF0YTogewogICAgICAgICAgICAgICAgICAgIHR5cGU6ICJsaW5lIiwKICAgICAgICAgICAgICAgICAgICBkYXRhOiB7CiAgICAgICAgICAgICAgICAgICAgICBsYWJlbHM6IFsiUTEiLCAiUTIiLCAiUTMiLCAiUTQiXSwKICAgICAgICAgICAgICAgICAgICAgIGRhdGFzZXRzOiBbCiAgICAgICAgICAgICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogIuWQnuWQkOmHj++8iFRQU++8iSIsCiAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogWzEyMDAsIDE5MDAsIDMyMDAsIDQ1MDBdLAogICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGw6IHRydWUsCiAgICAgICAgICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAgICAgICBdLAogICAgICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICB9LAogICAgICAgICAgICAgIF0sCiAgICAgICAgICAgIH0sCiAgICAgICAgICAgIHsKICAgICAgICAgICAgICBpZDogIm1lcm1haWQtZGVtbyIsCiAgICAgICAgICAgICAgdHlwZTogImNvbnRlbnQiLAogICAgICAgICAgICAgIHRpdGxlOiAi5aSa5byV5pOO5Y2P5ZCM55qE5riy5p+T6ZO+6LevIiwKICAgICAgICAgICAgICBlbGVtZW50czogWwogICAgICAgICAgICAgICAgewogICAgICAgICAgICAgICAgICB0eXBlOiAiY2hhcnQiLAogICAgICAgICAgICAgICAgICBjaGFydFR5cGU6ICJtZXJtYWlkIiwKICAgICAgICAgICAgICAgICAgY29udGVudDogIuS7juaVsOaNruWIsOinhuWbvueahOa1gei9rOmTvui3ryIsCiAgICAgICAgICAgICAgICAgIGNoYXJ0RGF0YTogewogICAgICAgICAgICAgICAgICAgIGNvZGU6CiAgICAgICAgICAgICAgICAgICAgICAiZmxvd2NoYXJ0IExSXG4gIEFbUHJvbXB0IOaVsOaNrl0gLS0+IEJb5aSa5oCB57yW6K+R5ZmoXVxuICBCIC0tPiBDW0NoYXJ0LmpzIOW8leaTjl1cbiAgQiAtLT4gRFtNZXJtYWlkIOW8leaTjl1cbiAgQyAtLT4gRVvop4blm77muLLmn5NdXG4gIEQgLS0+IEUiLAogICAgICAgICAgICAgICAgICB9LAogICAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICBdLAogICAgICAgICAgICB9LAogICAgICAgICAgICB7CiAgICAgICAgICAgICAgaWQ6ICJkdWFsLWRlbW8iLAogICAgICAgICAgICAgIHR5cGU6ICJjb250ZW50IiwKICAgICAgICAgICAgICB0aXRsZTogIuabtOi9u+eahOa4suafk++8jOabtOW/q+eahOWTjeW6lCIsCiAgICAgICAgICAgICAgZWxlbWVudHM6IFsKICAgICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgdHlwZTogInRleHQiLAogICAgICAgICAgICAgICAgICBjb250ZW50OgogICAgICAgICAgICAgICAgICAgICLku44gUHJvbXB0IOino+aekOWIsOWbvuihqOi+k+WHuu+8jOe7n+S4gOa4suafk+mTvui3r+WcqOS/neivgeaVsOaNruWHhuehruaAp+eahOWQjOaXtu+8jOaMgee7remZjeS9juerr+S+p+W8gOmUgOOAgiIsCiAgICAgICAgICAgICAgICB9LAogICAgICAgICAgICAgICAgewogICAgICAgICAgICAgICAgICB0eXBlOiAibGlzdCIsCiAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IFsKICAgICAgICAgICAgICAgICAgICAiQ2FudmFzIOWOn+eUn+a4suafk++8jOenu+WKqOerr+S/neaMgea1geeVhSIsCiAgICAgICAgICAgICAgICAgICAgIkNoYXJ0LmpzIOS4jiBNZXJtYWlkIOaMiemcgOWKoOi9vSIsCiAgICAgICAgICAgICAgICAgICAgIuWkmuerr+WwuuWvuOiHqumAguW6lO+8jOeJiOW8j+iHquWKqOmHjeaOkiIsCiAgICAgICAgICAgICAgICAgICAgIuaVsOaNruS4juinhuWbvuino+iApu+8jOaUr+aMgeWunuaXtuabtOaWsCIsCiAgICAgICAgICAgICAgICAgIF0sCiAgICAgICAgICAgICAgICB9LAogICAgICAgICAgICAgICAgewogICAgICAgICAgICAgICAgICB0eXBlOiAiY2hhcnQiLAogICAgICAgICAgICAgICAgICBjaGFydFR5cGU6ICJjaGFydGpzIiwKICAgICAgICAgICAgICAgICAgY29udGVudDogIua4suafk+iAl+aXtuWvueavlO+8iOavq+enku+8iSIsCiAgICAgICAgICAgICAgICAgIHNvdXJjZTogIuWfuuWHhua1i+ivlSDCtyDmlbDlgLzotorkvY7otorlpb0iLAogICAgICAgICAgICAgICAgICBoaWdobGlnaHRJbmRleDogMSwKICAgICAgICAgICAgICAgICAgY2hhcnREYXRhOiB7CiAgICAgICAgICAgICAgICAgICAgdHlwZTogImJhciIsCiAgICAgICAgICAgICAgICAgICAgZGF0YTogewogICAgICAgICAgICAgICAgICAgICAgbGFiZWxzOiBbIuWOn+eUnyBDYW52YXMiLCAiQ2hhcnQuanMiLCAiRDMuanMiLCAiRUNoYXJ0cyJdLAogICAgICAgICAgICAgICAgICAgICAgZGF0YXNldHM6IFsKICAgICAgICAgICAgICAgICAgICAgICAgewogICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAi5riy5p+T6ICX5pe277yIbXPvvIkiLAogICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IFsxMiwgMjgsIDQ1LCAzOF0sCiAgICAgICAgICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAgICAgICBdLAogICAgICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICB9LAogICAgICAgICAgICAgIF0sCiAgICAgICAgICAgIH0sCiAgICAgICAgICBdLAogICAgICAgIH0sCiAgICAgIH07CiAgICB9LAoKICAgIGNvbXB1dGVkOiB7CiAgICAgIHRvdGFsU2xpZGVzKCkgewogICAgICAgIHJldHVybiAodGhpcy5hY2NvdW50RGF0YS5zbGlkZXMgfHwgW10pLmxlbmd0aDsKICAgICAgfSwKCiAgICAgIHByb2dyZXNzUGVyY2VudCgpIHsKICAgICAgICBpZiAoIXRoaXMudG90YWxTbGlkZXMpIHJldHVybiAwOwogICAgICAgIGNvbnN0IGN1cnJlbnQgPSBNYXRoLm1pbih0aGlzLmN1cnJlbnRTbGlkZUluZGV4ICsgMSwgdGhpcy50b3RhbFNsaWRlcyk7CiAgICAgICAgcmV0dXJuIChjdXJyZW50IC8gdGhpcy50b3RhbFNsaWRlcykgKiAxMDA7CiAgICAgIH0sCgogICAgICBwcmVzZW50ZXJJbml0aWFsKCkgewogICAgICAgIGNvbnN0IHByZXNlbnRlciA9ICh0aGlzLmFjY291bnREYXRhICYmIHRoaXMuYWNjb3VudERhdGEucHJlc2VudGVyKSB8fCAiIjsKICAgICAgICByZXR1cm4gcHJlc2VudGVyLnRyaW0oKS5jaGFyQXQoMCkgfHwgIsK3IjsKICAgICAgfSwKICAgIH0sCgogICAgbWV0aG9kczogewogICAgICAvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KICAgICAgICAg5Z+656GA5qC85byP5YyWICYg6K+t5LmJ5qCH562+CiAgICAgICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqLwogICAgICBwYWQodmFsdWUpIHsKICAgICAgICByZXR1cm4gU3RyaW5nKHZhbHVlID09IG51bGwgPyAwIDogdmFsdWUpLnBhZFN0YXJ0KDIsICIwIik7CiAgICAgIH0sCgogICAgICBnZXRDb3ZlclRleHRzKHNsaWRlKSB7CiAgICAgICAgaWYgKCFzbGlkZSB8fCAhc2xpZGUuZWxlbWVudHMpIHJldHVybiBbXTsKICAgICAgICByZXR1cm4gc2xpZGUuZWxlbWVudHMuZmlsdGVyKChlbGVtZW50KSA9PiBlbGVtZW50LnR5cGUgPT09ICJ0ZXh0Iik7CiAgICAgIH0sCgogICAgICBnZXRDb3ZlclN1YnRpdGxlKHNsaWRlKSB7CiAgICAgICAgY29uc3QgdGV4dHMgPSB0aGlzLmdldENvdmVyVGV4dHMoc2xpZGUpOwogICAgICAgIHJldHVybiB0ZXh0cy5sZW5ndGggPyB0ZXh0c1swXS5jb250ZW50IDogIiI7CiAgICAgIH0sCgogICAgICBnZXRTbGlkZVR5cGVMYWJlbChzbGlkZSkgewogICAgICAgIGlmICghc2xpZGUpIHJldHVybiAi5bm754Gv54mHIjsKICAgICAgICBpZiAoc2xpZGUudHlwZSA9PT0gInRpdGxlIikgcmV0dXJuICLlsIHpnaIiOwogICAgICAgIGlmIChzbGlkZS50eXBlID09PSAic3VtbWFyeSIpIHJldHVybiAi5oC757uTIjsKCiAgICAgICAgY29uc3QgZWxlbWVudHMgPSBzbGlkZS5lbGVtZW50cyB8fCBbXTsKICAgICAgICBjb25zdCBjaGFydEVsZW1lbnQgPSBlbGVtZW50cy5maW5kKChlbGVtZW50KSA9PiBlbGVtZW50LnR5cGUgPT09ICJjaGFydCIpOwoKICAgICAgICBpZiAoY2hhcnRFbGVtZW50KSB7CiAgICAgICAgICBpZiAoY2hhcnRFbGVtZW50LmNoYXJ0VHlwZSA9PT0gIm1lcm1haWQiKSByZXR1cm4gIuaetuaehOa1geeoiyI7CiAgICAgICAgICBjb25zdCBjaGFydFR5cGUgPQogICAgICAgICAgICBjaGFydEVsZW1lbnQuY2hhcnREYXRhICYmIGNoYXJ0RWxlbWVudC5jaGFydERhdGEudHlwZQogICAgICAgICAgICAgID8gY2hhcnRFbGVtZW50LmNoYXJ0RGF0YS50eXBlCiAgICAgICAgICAgICAgOiAiIjsKICAgICAgICAgIGlmIChjaGFydFR5cGUgPT09ICJsaW5lIiB8fCBjaGFydFR5cGUgPT09ICJhcmVhIikgcmV0dXJuICLotovlir/mtJ7lr58iOwogICAgICAgICAgaWYgKGNoYXJ0VHlwZSA9PT0gImJhciIgfHwgY2hhcnRUeXBlID09PSAiaG9yaXpvbnRhbEJhciIpIHJldHVybiAi5pWw5o2u5a+55q+UIjsKICAgICAgICAgIGlmICgKICAgICAgICAgICAgY2hhcnRUeXBlID09PSAicGllIiB8fAogICAgICAgICAgICBjaGFydFR5cGUgPT09ICJkb3VnaG51dCIgfHwKICAgICAgICAgICAgY2hhcnRUeXBlID09PSAicG9sYXJBcmVhIgogICAgICAgICAgKSB7CiAgICAgICAgICAgIHJldHVybiAi57uT5p6E5Y2g5q+UIjsKICAgICAgICAgIH0KICAgICAgICAgIGlmIChjaGFydFR5cGUgPT09ICJyYWRhciIpIHJldHVybiAi5aSa57u06K+E5LywIjsKICAgICAgICAgIGlmIChjaGFydFR5cGUgPT09ICJzY2F0dGVyIikgcmV0dXJuICLnm7jlhbPliIbmnpAiOwogICAgICAgICAgcmV0dXJuICLmlbDmja7mtJ7lr58iOwogICAgICAgIH0KCiAgICAgICAgaWYgKHNsaWRlLnR5cGUgPT09ICJzcGxpdCIpIHJldHVybiAi5Zu+5paH5re35o6SIjsKICAgICAgICByZXR1cm4gIuaguOW/g+WGheWuuSI7CiAgICAgIH0sCgogICAgICAvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KICAgICAgICAg54mI5byP6K+G5Yir77ya5YWI55CG6Kej5YaF5a655YWz57O777yM5YaN5Yaz5a6a56m66Ze057uT5p6ECiAgICAgICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqLwogICAgICBnZXRCb2R5TGF5b3V0KHNsaWRlKSB7CiAgICAgICAgY29uc3QgZWxlbWVudHMgPSBzbGlkZSAmJiBzbGlkZS5lbGVtZW50cyA/IHNsaWRlLmVsZW1lbnRzIDogW107CiAgICAgICAgY29uc3QgdHlwZXMgPSBlbGVtZW50cy5tYXAoKGVsZW1lbnQpID0+IGVsZW1lbnQudHlwZSk7CiAgICAgICAgY29uc3QgaGFzQ2hhcnQgPSB0eXBlcy5pbmRleE9mKCJjaGFydCIpICE9PSAtMTsKICAgICAgICBjb25zdCBoYXNMaXN0ID0gdHlwZXMuaW5kZXhPZigibGlzdCIpICE9PSAtMTsKICAgICAgICBjb25zdCBoYXNUZXh0ID0gdHlwZXMuaW5kZXhPZigidGV4dCIpICE9PSAtMTsKICAgICAgICBjb25zdCBoYXNJbWFnZSA9IHR5cGVzLmluZGV4T2YoImltYWdlIikgIT09IC0xOwogICAgICAgIGNvbnN0IGhhc1RhYmxlID0gdHlwZXMuaW5kZXhPZigidGFibGUiKSAhPT0gLTE7CgogICAgICAgIGlmIChlbGVtZW50cy5sZW5ndGggPT09IDEpIHsKICAgICAgICAgIGlmIChoYXNDaGFydCkgcmV0dXJuICJzb2xvLWNoYXJ0IjsKICAgICAgICAgIGlmIChoYXNJbWFnZSkgcmV0dXJuICJzb2xvLWltYWdlIjsKICAgICAgICAgIGlmIChoYXNUYWJsZSkgcmV0dXJuICJzb2xvLXRhYmxlIjsKICAgICAgICAgIGlmIChoYXNMaXN0KSByZXR1cm4gInNvbG8tbGlzdCI7CiAgICAgICAgICByZXR1cm4gInNvbG8iOwogICAgICAgIH0KCiAgICAgICAgaWYgKGhhc0NoYXJ0KSB7CiAgICAgICAgICBpZiAoaGFzTGlzdCkgcmV0dXJuIGhhc1RleHQgPyAibGVhZC1saXN0LWNoYXJ0IiA6ICJsaXN0LWNoYXJ0IjsKICAgICAgICAgIGlmIChoYXNJbWFnZSkgcmV0dXJuICJpbWFnZS1jaGFydCI7CiAgICAgICAgICBpZiAoaGFzVGFibGUpIHJldHVybiAidGFibGUtY2hhcnQiOwogICAgICAgICAgaWYgKGhhc1RleHQpIHJldHVybiAidGV4dC1jaGFydCI7CiAgICAgICAgICByZXR1cm4gInN0YWNrIjsKICAgICAgICB9CgogICAgICAgIGlmIChoYXNJbWFnZSAmJiBoYXNUZXh0KSByZXR1cm4gImltYWdlLXRleHQiOwogICAgICAgIHJldHVybiAic3RhY2siOwogICAgICB9LAoKICAgICAgZ2V0QmxvY2tHcmlkU3BhbihzbGlkZSwgZWxlbWVudCkgewogICAgICAgIGNvbnN0IGxheW91dCA9IHRoaXMuZ2V0Qm9keUxheW91dChzbGlkZSk7CgogICAgICAgIGlmIChsYXlvdXQgPT09ICJsaXN0LWNoYXJ0IiB8fCBsYXlvdXQgPT09ICJsZWFkLWxpc3QtY2hhcnQiKSB7CiAgICAgICAgICBpZiAoZWxlbWVudC50eXBlID09PSAibGlzdCIpIHJldHVybiAicnMtY29sLTUiOwogICAgICAgICAgaWYgKGVsZW1lbnQudHlwZSA9PT0gImNoYXJ0IikgcmV0dXJuICJycy1jb2wtNyI7CiAgICAgICAgICByZXR1cm4gInJzLWNvbC0xMiI7CiAgICAgICAgfQoKICAgICAgICBpZiAobGF5b3V0ID09PSAidGV4dC1jaGFydCIpIHsKICAgICAgICAgIGlmIChlbGVtZW50LnR5cGUgPT09ICJ0ZXh0IikgcmV0dXJuICJycy1jb2wtNSI7CiAgICAgICAgICBpZiAoZWxlbWVudC50eXBlID09PSAiY2hhcnQiKSByZXR1cm4gInJzLWNvbC03IjsKICAgICAgICAgIHJldHVybiAicnMtY29sLTEyIjsKICAgICAgICB9CgogICAgICAgIGlmIChsYXlvdXQgPT09ICJpbWFnZS1jaGFydCIpIHsKICAgICAgICAgIGlmIChlbGVtZW50LnR5cGUgPT09ICJpbWFnZSIpIHJldHVybiAicnMtY29sLTYiOwogICAgICAgICAgaWYgKGVsZW1lbnQudHlwZSA9PT0gImNoYXJ0IikgcmV0dXJuICJycy1jb2wtNiI7CiAgICAgICAgICByZXR1cm4gInJzLWNvbC0xMiI7CiAgICAgICAgfQoKICAgICAgICBpZiAobGF5b3V0ID09PSAidGFibGUtY2hhcnQiKSB7CiAgICAgICAgICBpZiAoZWxlbWVudC50eXBlID09PSAidGFibGUiKSByZXR1cm4gInJzLWNvbC03IjsKICAgICAgICAgIGlmIChlbGVtZW50LnR5cGUgPT09ICJjaGFydCIpIHJldHVybiAicnMtY29sLTUiOwogICAgICAgICAgcmV0dXJuICJycy1jb2wtMTIiOwogICAgICAgIH0KCiAgICAgICAgaWYgKGxheW91dCA9PT0gImltYWdlLXRleHQiKSB7CiAgICAgICAgICBpZiAoZWxlbWVudC50eXBlID09PSAiaW1hZ2UiKSByZXR1cm4gInJzLWNvbC03IjsKICAgICAgICAgIGlmIChlbGVtZW50LnR5cGUgPT09ICJ0ZXh0IikgcmV0dXJuICJycy1jb2wtNSI7CiAgICAgICAgICByZXR1cm4gInJzLWNvbC0xMiI7CiAgICAgICAgfQoKICAgICAgICByZXR1cm4gInJzLWNvbC0xMiI7CiAgICAgIH0sCgogICAgICBnZXRTbGlkZURlbnNpdHkoc2xpZGUpIHsKICAgICAgICBjb25zdCBlbGVtZW50cyA9IHNsaWRlICYmIHNsaWRlLmVsZW1lbnRzID8gc2xpZGUuZWxlbWVudHMgOiBbXTsKICAgICAgICBsZXQgdG90YWxDaGFycyA9IDA7CiAgICAgICAgbGV0IGxpc3RJdGVtQ291bnQgPSAwOwogICAgICAgIGxldCBjaGFydENvdW50ID0gMDsKCiAgICAgICAgZWxlbWVudHMuZm9yRWFjaCgoZWxlbWVudCkgPT4gewogICAgICAgICAgaWYgKGVsZW1lbnQudHlwZSA9PT0gInRleHQiIHx8IGVsZW1lbnQudHlwZSA9PT0gInF1b3RlIikgewogICAgICAgICAgICB0b3RhbENoYXJzICs9IChlbGVtZW50LmNvbnRlbnQgfHwgIiIpLmxlbmd0aDsKICAgICAgICAgIH0KICAgICAgICAgIGlmIChlbGVtZW50LnR5cGUgPT09ICJsaXN0IikgewogICAgICAgICAgICBjb25zdCBpdGVtcyA9IGVsZW1lbnQuY29udGVudCB8fCBbXTsKICAgICAgICAgICAgbGlzdEl0ZW1Db3VudCArPSBpdGVtcy5sZW5ndGg7CiAgICAgICAgICAgIHRvdGFsQ2hhcnMgKz0gaXRlbXMuam9pbigiIikubGVuZ3RoOwogICAgICAgICAgfQogICAgICAgICAgaWYgKGVsZW1lbnQudHlwZSA9PT0gImNoYXJ0IikgY2hhcnRDb3VudCArPSAxOwogICAgICAgIH0pOwoKICAgICAgICBpZiAoCiAgICAgICAgICB0b3RhbENoYXJzID4gMzQwIHx8CiAgICAgICAgICBsaXN0SXRlbUNvdW50ID4gNyB8fAogICAgICAgICAgKGNoYXJ0Q291bnQgPj0gMiAmJiB0b3RhbENoYXJzID4gMTgwKQogICAgICAgICkgewogICAgICAgICAgcmV0dXJuICJleHRyZW1lIjsKICAgICAgICB9CiAgICAgICAgaWYgKAogICAgICAgICAgdG90YWxDaGFycyA+IDIzMCB8fAogICAgICAgICAgbGlzdEl0ZW1Db3VudCA+IDUgfHwKICAgICAgICAgIGVsZW1lbnRzLmxlbmd0aCA+PSA0CiAgICAgICAgKSB7CiAgICAgICAgICByZXR1cm4gImhlYXZ5IjsKICAgICAgICB9CiAgICAgICAgaWYgKAogICAgICAgICAgdG90YWxDaGFycyA+IDEzMCB8fAogICAgICAgICAgbGlzdEl0ZW1Db3VudCA+IDMgfHwKICAgICAgICAgIGVsZW1lbnRzLmxlbmd0aCA+PSAzCiAgICAgICAgKSB7CiAgICAgICAgICByZXR1cm4gIm1lZGl1bSI7CiAgICAgICAgfQogICAgICAgIHJldHVybiAibGlnaHQiOwogICAgICB9LAoKICAgICAgLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CiAgICAgICAgIOWKqOeUu+iKguWljwogICAgICAgICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi8KICAgICAgYW5pbUJsb2NrRGVsYXkoYmxvY2tJbmRleCwgaXRlbUluZGV4KSB7CiAgICAgICAgcmV0dXJuIDE0MCArIGJsb2NrSW5kZXggKiAxNTAgKyBpdGVtSW5kZXggKiA3MDsKICAgICAgfSwKCiAgICAgIGFuaW1Gb290ZXJEZWxheShlbGVtZW50cykgewogICAgICAgIGxldCBtYXhEZWxheSA9IDI2MDsKICAgICAgICBpZiAoIWVsZW1lbnRzKSByZXR1cm4gbWF4RGVsYXk7CiAgICAgICAgZWxlbWVudHMuZm9yRWFjaCgoZWxlbWVudCwgaW5kZXgpID0+IHsKICAgICAgICAgIGxldCBibG9ja0Jhc2UgPSAxNDAgKyBpbmRleCAqIDE1MDsKICAgICAgICAgIGlmIChlbGVtZW50LnR5cGUgPT09ICJsaXN0IiAmJiBlbGVtZW50LmNvbnRlbnQpIHsKICAgICAgICAgICAgYmxvY2tCYXNlICs9IChlbGVtZW50LmNvbnRlbnQubGVuZ3RoIC0gMSkgKiA3MDsKICAgICAgICAgIH0KICAgICAgICAgIGlmIChlbGVtZW50LnR5cGUgPT09ICJjaGFydCIpIGJsb2NrQmFzZSArPSA4MDsKICAgICAgICAgIGlmIChibG9ja0Jhc2UgPiBtYXhEZWxheSkgbWF4RGVsYXkgPSBibG9ja0Jhc2U7CiAgICAgICAgfSk7CiAgICAgICAgcmV0dXJuIG1heERlbGF5ICsgMTgwOwogICAgICB9LAoKICAgICAgYW5pbVRleHRTdHlsZShlbGVtZW50LCBzbGlkZSwgYmxvY2tJbmRleCkgewogICAgICAgIHJldHVybiB7CiAgICAgICAgICAiLS1hbmltLWRlbGF5IjogMTQwICsgYmxvY2tJbmRleCAqIDE1MCArICJtcyIsCiAgICAgICAgfTsKICAgICAgfSwKCiAgICAgIC8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogICAgICAgICDnvKnnlaXlm77mlbDmja7vvJrorqnpooTop4jkuZ/lg4/nnJ/mraPnmoTlubvnga/niYcKICAgICAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovCiAgICAgIGdldENoYXJ0S2luZChlbGVtZW50KSB7CiAgICAgICAgaWYgKCFlbGVtZW50IHx8IGVsZW1lbnQudHlwZSAhPT0gImNoYXJ0IikgcmV0dXJuICJvdGhlciI7CiAgICAgICAgaWYgKGVsZW1lbnQuY2hhcnRUeXBlID09PSAibWVybWFpZCIpIHJldHVybiAiZmxvdyI7CiAgICAgICAgY29uc3QgdHlwZSA9CiAgICAgICAgICBlbGVtZW50LmNoYXJ0RGF0YSAmJiBlbGVtZW50LmNoYXJ0RGF0YS50eXBlCiAgICAgICAgICAgID8gZWxlbWVudC5jaGFydERhdGEudHlwZQogICAgICAgICAgICA6ICIiOwogICAgICAgIGlmICh0eXBlID09PSAibGluZSIgfHwgdHlwZSA9PT0gImFyZWEiKSByZXR1cm4gImxpbmUiOwogICAgICAgIGlmICh0eXBlID09PSAiYmFyIiB8fCB0eXBlID09PSAiaG9yaXpvbnRhbEJhciIpIHJldHVybiAiYmFyIjsKICAgICAgICBpZiAodHlwZSA9PT0gInBpZSIgfHwgdHlwZSA9PT0gImRvdWdobnV0IiB8fCB0eXBlID09PSAicG9sYXJBcmVhIikgewogICAgICAgICAgcmV0dXJuICJwaWUiOwogICAgICAgIH0KICAgICAgICByZXR1cm4gIm90aGVyIjsKICAgICAgfSwKCiAgICAgIGdldENoYXJ0U2VyaWVzKGVsZW1lbnQpIHsKICAgICAgICBjb25zdCBkYXRhID0KICAgICAgICAgIGVsZW1lbnQgJiYgZWxlbWVudC5jaGFydERhdGEgJiYgZWxlbWVudC5jaGFydERhdGEuZGF0YQogICAgICAgICAgICA/IGVsZW1lbnQuY2hhcnREYXRhLmRhdGEKICAgICAgICAgICAgOiBudWxsOwogICAgICAgIGNvbnN0IGRhdGFzZXRzID0gZGF0YSAmJiBkYXRhLmRhdGFzZXRzID8gZGF0YS5kYXRhc2V0cyA6IFtdOwogICAgICAgIGlmICghZGF0YXNldHMubGVuZ3RoKSByZXR1cm4gW107CiAgICAgICAgY29uc3QgdmFsdWVzID0gZGF0YXNldHNbMF0uZGF0YSB8fCBbXTsKICAgICAgICByZXR1cm4gdmFsdWVzCiAgICAgICAgICAubWFwKCh2YWx1ZSkgPT4gewogICAgICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAib2JqZWN0IikgcmV0dXJuIE51bWJlcih2YWx1ZS55KTsKICAgICAgICAgICAgcmV0dXJuIE51bWJlcih2YWx1ZSk7CiAgICAgICAgICB9KQogICAgICAgICAgLmZpbHRlcigodmFsdWUpID0+IE51bWJlci5pc0Zpbml0ZSh2YWx1ZSkpOwogICAgICB9LAoKICAgICAgZ2V0Q2hhcnRCYXJzKGVsZW1lbnQpIHsKICAgICAgICBjb25zdCB2YWx1ZXMgPSB0aGlzLmdldENoYXJ0U2VyaWVzKGVsZW1lbnQpOwogICAgICAgIGlmICghdmFsdWVzLmxlbmd0aCkgcmV0dXJuIFtdOwogICAgICAgIGNvbnN0IG1heCA9IE1hdGgubWF4LmFwcGx5KG51bGwsIHZhbHVlcy5jb25jYXQoWzBdKSk7CiAgICAgICAgaWYgKCFtYXgpIHJldHVybiBbXTsKICAgICAgICByZXR1cm4gdmFsdWVzLm1hcCgodmFsdWUpID0+IHsKICAgICAgICAgIGNvbnN0IGhlaWdodCA9IE1hdGgucm91bmQoKE1hdGgubWF4KDAsIHZhbHVlKSAvIG1heCkgKiAxMDApOwogICAgICAgICAgcmV0dXJuIE1hdGgubWF4KDgsIE1hdGgubWluKDEwMCwgaGVpZ2h0KSk7CiAgICAgICAgfSk7CiAgICAgIH0sCgogICAgICBnZXRDaGFydFBvaW50cyhlbGVtZW50KSB7CiAgICAgICAgY29uc3QgdmFsdWVzID0gdGhpcy5nZXRDaGFydFNlcmllcyhlbGVtZW50KTsKICAgICAgICBpZiAoIXZhbHVlcy5sZW5ndGgpIHJldHVybiAiIjsKICAgICAgICBpZiAodmFsdWVzLmxlbmd0aCA9PT0gMSkgcmV0dXJuICIwLDMyIDEwMCwzMiI7CgogICAgICAgIGNvbnN0IG1heCA9IE1hdGgubWF4LmFwcGx5KG51bGwsIHZhbHVlcyk7CiAgICAgICAgY29uc3QgbWluID0gTWF0aC5taW4uYXBwbHkobnVsbCwgdmFsdWVzKTsKICAgICAgICBjb25zdCByYW5nZSA9IG1heCAtIG1pbiB8fCAxOwoKICAgICAgICByZXR1cm4gdmFsdWVzCiAgICAgICAgICAubWFwKCh2YWx1ZSwgaW5kZXgpID0+IHsKICAgICAgICAgICAgY29uc3QgeCA9IChpbmRleCAvICh2YWx1ZXMubGVuZ3RoIC0gMSkpICogMTAwOwogICAgICAgICAgICBjb25zdCB5ID0gMzggLSAoKHZhbHVlIC0gbWluKSAvIHJhbmdlKSAqIDMwOwogICAgICAgICAgICByZXR1cm4geC50b0ZpeGVkKDIpICsgIiwiICsgeS50b0ZpeGVkKDIpOwogICAgICAgICAgfSkKICAgICAgICAgIC5qb2luKCIgIik7CiAgICAgIH0sCgogICAgICBnZXRDaGFydEFyZWFQb2ludHMoZWxlbWVudCkgewogICAgICAgIGNvbnN0IHBvaW50cyA9IHRoaXMuZ2V0Q2hhcnRQb2ludHMoZWxlbWVudCk7CiAgICAgICAgaWYgKCFwb2ludHMpIHJldHVybiAiIjsKICAgICAgICByZXR1cm4gIjAsNDQgIiArIHBvaW50cyArICIgMTAwLDQ0IjsKICAgICAgfSwKCiAgICAgIGdldFBpZUdyYWRpZW50KGVsZW1lbnQpIHsKICAgICAgICBjb25zdCB2YWx1ZXMgPSB0aGlzLmdldENoYXJ0U2VyaWVzKGVsZW1lbnQpOwogICAgICAgIGNvbnN0IHRvdGFsID0gdmFsdWVzLnJlZHVjZSgoc3VtLCB2YWx1ZSkgPT4gc3VtICsgdmFsdWUsIDApOwogICAgICAgIGlmICghdG90YWwpIHJldHVybiAiY29uaWMtZ3JhZGllbnQoI2U3ZWNmNCAwIDEwMCUpIjsKCiAgICAgICAgY29uc3QgcGFsZXR0ZSA9IHRoaXMuY2hhcnRQYWxldHRlOwogICAgICAgIGxldCBhY2N1bXVsYXRlZCA9IDA7CiAgICAgICAgY29uc3Qgc2VnbWVudHMgPSB2YWx1ZXMubWFwKCh2YWx1ZSwgaW5kZXgpID0+IHsKICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gKGFjY3VtdWxhdGVkIC8gdG90YWwpICogMTAwOwogICAgICAgICAgYWNjdW11bGF0ZWQgKz0gdmFsdWU7CiAgICAgICAgICBjb25zdCBlbmQgPSAoYWNjdW11bGF0ZWQgLyB0b3RhbCkgKiAxMDA7CiAgICAgICAgICByZXR1cm4gKAogICAgICAgICAgICBwYWxldHRlW2luZGV4ICUgcGFsZXR0ZS5sZW5ndGhdICsKICAgICAgICAgICAgIiAiICsKICAgICAgICAgICAgc3RhcnQudG9GaXhlZCgxKSArCiAgICAgICAgICAgICIlICIgKwogICAgICAgICAgICBlbmQudG9GaXhlZCgxKSArCiAgICAgICAgICAgICIlIgogICAgICAgICAgKTsKICAgICAgICB9KTsKICAgICAgICByZXR1cm4gImNvbmljLWdyYWRpZW50KCIgKyBzZWdtZW50cy5qb2luKCIsICIpICsgIikiOwogICAgICB9LAoKICAgICAgZ2V0Rmxvd05vZGVzKGVsZW1lbnQpIHsKICAgICAgICBjb25zdCBjb2RlID0KICAgICAgICAgIGVsZW1lbnQgJiYgZWxlbWVudC5jaGFydERhdGEgJiYgZWxlbWVudC5jaGFydERhdGEuY29kZQogICAgICAgICAgICA/IGVsZW1lbnQuY2hhcnREYXRhLmNvZGUKICAgICAgICAgICAgOiAiIjsKICAgICAgICBpZiAoIWNvZGUpIHJldHVybiBbXTsKCiAgICAgICAgY29uc3Qgbm9kZXMgPSBbXTsKICAgICAgICBjb25zdCBwYXR0ZXJuID0gL1tBLVphLXowLTlfXHU0ZTAwLVx1OWZhNV0rXHMqW1xbXChce10oW15cXVwpXH1dKylbXF1cKVx9XS9nOwogICAgICAgIGxldCBtYXRjaCA9IHBhdHRlcm4uZXhlYyhjb2RlKTsKICAgICAgICB3aGlsZSAobWF0Y2gpIHsKICAgICAgICAgIGNvbnN0IGxhYmVsID0gU3RyaW5nKG1hdGNoWzFdIHx8ICIiKQogICAgICAgICAgICAucmVwbGFjZSgvWyInXS9nLCAiIikKICAgICAgICAgICAgLnRyaW0oKTsKICAgICAgICAgIGlmIChsYWJlbCAmJiBub2Rlcy5pbmRleE9mKGxhYmVsKSA9PT0gLTEpIG5vZGVzLnB1c2gobGFiZWwpOwogICAgICAgICAgbWF0Y2ggPSBwYXR0ZXJuLmV4ZWMoY29kZSk7CiAgICAgICAgfQogICAgICAgIHJldHVybiBub2Rlcy5zbGljZSgwLCA0KTsKICAgICAgfSwKCiAgICAgIC8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogICAgICAgICBDaGFydC5qcyDkuLvpopjvvJrnu5/kuIDoibLlvanjgIHlrZfpmLbjgIHnvZHmoLzlkozlm77kvosKICAgICAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovCiAgICAgIGNoYXJ0Rm9udEZhbWlseSgpIHsKICAgICAgICByZXR1cm4gdGhpcy5mb250U3RhY2s7CiAgICAgIH0sCgogICAgICBnZXRDaGFydFBhbGV0dGUoKSB7CiAgICAgICAgcmV0dXJuIHRoaXMuY2hhcnRQYWxldHRlOwogICAgICB9LAoKICAgICAgbm9ybWFsaXplQ2hhcnRDb2xvcihjb2xvcikgewogICAgICAgIGlmICh0eXBlb2YgY29sb3IgIT09ICJzdHJpbmciKSByZXR1cm4gY29sb3I7CiAgICAgICAgY29uc3Qga2V5ID0gY29sb3IudHJpbSgpLnRvTG93ZXJDYXNlKCk7CiAgICAgICAgY29uc3QgY29sb3JNYXAgPSB7CiAgICAgICAgICAiIzAwNzFlMyI6ICIjMGI1Y2ZmIiwKICAgICAgICAgICIjMDA3N2VkIjogIiMwYjVjZmYiLAogICAgICAgICAgIiMwMDVhYjYiOiAiIzA2NDdjOSIsCiAgICAgICAgICAiIzk0YTNiOCI6ICIjYzdkMmUzIiwKICAgICAgICAgICIjY2JkNWUxIjogIiNlMWU3ZjEiLAogICAgICAgICAgIiNlMmU4ZjAiOiAiI2U4ZWRmNSIsCiAgICAgICAgICAiIzY0NzQ4YiI6ICIjNjY3MDg1IiwKICAgICAgICAgICIjZjFmNWY5IjogIiNlZWYyZjciLAogICAgICAgIH07CiAgICAgICAgcmV0dXJuIGNvbG9yTWFwW2tleV0gfHwgY29sb3I7CiAgICAgIH0sCgogICAgICB0b1JnYmEoY29sb3IsIGFscGhhKSB7CiAgICAgICAgaWYgKHR5cGVvZiBjb2xvciAhPT0gInN0cmluZyIpIHJldHVybiBjb2xvcjsKICAgICAgICBpZiAoY29sb3IuaW5kZXhPZigicmdiIikgPT09IDApIHJldHVybiBjb2xvcjsKICAgICAgICBpZiAoY29sb3IuY2hhckF0KDApICE9PSAiIyIpIHJldHVybiBjb2xvcjsKCiAgICAgICAgbGV0IGhleCA9IGNvbG9yLnNsaWNlKDEpOwogICAgICAgIGlmIChoZXgubGVuZ3RoID09PSAzKSB7CiAgICAgICAgICBoZXggPSBoZXgKICAgICAgICAgICAgLnNwbGl0KCIiKQogICAgICAgICAgICAubWFwKChjaGFyKSA9PiBjaGFyICsgY2hhcikKICAgICAgICAgICAgLmpvaW4oIiIpOwogICAgICAgIH0KICAgICAgICBpZiAoaGV4Lmxlbmd0aCAhPT0gNikgcmV0dXJuIGNvbG9yOwoKICAgICAgICBjb25zdCByZWQgPSBwYXJzZUludChoZXguc2xpY2UoMCwgMiksIDE2KTsKICAgICAgICBjb25zdCBncmVlbiA9IHBhcnNlSW50KGhleC5zbGljZSgyLCA0KSwgMTYpOwogICAgICAgIGNvbnN0IGJsdWUgPSBwYXJzZUludChoZXguc2xpY2UoNCwgNiksIDE2KTsKICAgICAgICByZXR1cm4gKAogICAgICAgICAgInJnYmEoIiArCiAgICAgICAgICByZWQgKwogICAgICAgICAgIiwgIiArCiAgICAgICAgICBncmVlbiArCiAgICAgICAgICAiLCAiICsKICAgICAgICAgIGJsdWUgKwogICAgICAgICAgIiwgIiArCiAgICAgICAgICBhbHBoYSArCiAgICAgICAgICAiKSIKICAgICAgICApOwogICAgICB9LAoKICAgICAgYnVpbGRDaGFydENvbmZpZyhlbGVtZW50LCBzY29wZSkgewogICAgICAgIGNvbnN0IHJhdyA9CiAgICAgICAgICBlbGVtZW50ICYmIGVsZW1lbnQuY2hhcnREYXRhID8gZWxlbWVudC5jaGFydERhdGEgOiB7fTsKICAgICAgICBsZXQgY29uZmlnOwoKICAgICAgICB0cnkgewogICAgICAgICAgY29uZmlnID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShyYXcpKTsKICAgICAgICB9IGNhdGNoIChlcnJvcikgewogICAgICAgICAgY29uZmlnID0ge307CiAgICAgICAgfQoKICAgICAgICBjb25maWcudHlwZSA9IGNvbmZpZy50eXBlIHx8ICJiYXIiOwogICAgICAgIGNvbnN0IGlzQXJlYSA9IGNvbmZpZy50eXBlID09PSAiYXJlYSI7CiAgICAgICAgaWYgKGlzQXJlYSkgY29uZmlnLnR5cGUgPSAibGluZSI7CiAgICAgICAgaWYgKGNvbmZpZy50eXBlID09PSAiaG9yaXpvbnRhbEJhciIpIHsKICAgICAgICAgIGNvbmZpZy50eXBlID0gImJhciI7CiAgICAgICAgICBjb25maWcub3B0aW9ucyA9IGNvbmZpZy5vcHRpb25zIHx8IHt9OwogICAgICAgICAgY29uZmlnLm9wdGlvbnMuaW5kZXhBeGlzID0gInkiOwogICAgICAgIH0KICAgICAgICBjb25maWcuZGF0YSA9IGNvbmZpZy5kYXRhIHx8IHt9OwogICAgICAgIGNvbmZpZy5kYXRhLmxhYmVscyA9IGNvbmZpZy5kYXRhLmxhYmVscyB8fCBbXTsKCiAgICAgICAgY29uc3Qgc291cmNlRGF0YXNldHMgPSBjb25maWcuZGF0YS5kYXRhc2V0cyB8fCBbXTsKICAgICAgICBjb25zdCBwYWxldHRlID0gdGhpcy5nZXRDaGFydFBhbGV0dGUoKTsKICAgICAgICBjb25zdCBmb250ID0gdGhpcy5jaGFydEZvbnRGYW1pbHkoKTsKICAgICAgICBjb25zdCBpc0NhcmQgPSBzY29wZSA9PT0gImNhcmQiOwogICAgICAgIGNvbnN0IGlzUmFkaWFsID0KICAgICAgICAgIGNvbmZpZy50eXBlID09PSAicGllIiB8fAogICAgICAgICAgY29uZmlnLnR5cGUgPT09ICJkb3VnaG51dCIgfHwKICAgICAgICAgIGNvbmZpZy50eXBlID09PSAicG9sYXJBcmVhIjsKCiAgICAgICAgY29uc3QgZGF0YXNldHMgPSBzb3VyY2VEYXRhc2V0cy5tYXAoKGRhdGFzZXQsIGRhdGFzZXRJbmRleCkgPT4gewogICAgICAgICAgY29uc3QgY3VycmVudCA9IE9iamVjdC5hc3NpZ24oe30sIGRhdGFzZXQpOwogICAgICAgICAgY29uc3QgZmFsbGJhY2sgPSBwYWxldHRlW2RhdGFzZXRJbmRleCAlIHBhbGV0dGUubGVuZ3RoXTsKICAgICAgICAgIGxldCBiYXNlQ29sb3IgPQogICAgICAgICAgICBjdXJyZW50LmJvcmRlckNvbG9yIHx8CiAgICAgICAgICAgICh0eXBlb2YgY3VycmVudC5iYWNrZ3JvdW5kQ29sb3IgPT09ICJzdHJpbmciCiAgICAgICAgICAgICAgPyBjdXJyZW50LmJhY2tncm91bmRDb2xvcgogICAgICAgICAgICAgIDogIiIpIHx8CiAgICAgICAgICAgIGZhbGxiYWNrOwogICAgICAgICAgYmFzZUNvbG9yID0gdGhpcy5ub3JtYWxpemVDaGFydENvbG9yKGJhc2VDb2xvcik7CgogICAgICAgICAgaWYgKGNvbmZpZy50eXBlID09PSAibGluZSIgfHwgY29uZmlnLnR5cGUgPT09ICJhcmVhIikgewogICAgICAgICAgICBjdXJyZW50LmJvcmRlckNvbG9yID0gYmFzZUNvbG9yOwogICAgICAgICAgICBjdXJyZW50LmJhY2tncm91bmRDb2xvciA9IHRoaXMudG9SZ2JhKAogICAgICAgICAgICAgIGJhc2VDb2xvciwKICAgICAgICAgICAgICBjdXJyZW50LmZpbGwgPT09IGZhbHNlID8gMCA6IDAuMQogICAgICAgICAgICApOwogICAgICAgICAgICBpZiAoY3VycmVudC5maWxsID09PSB1bmRlZmluZWQpIHsKICAgICAgICAgICAgICBjdXJyZW50LmZpbGwgPSBpc0FyZWEgfHwgc291cmNlRGF0YXNldHMubGVuZ3RoID09PSAxOwogICAgICAgICAgICB9CiAgICAgICAgICAgIGN1cnJlbnQuYm9yZGVyV2lkdGggPSBjdXJyZW50LmJvcmRlcldpZHRoIHx8IDM7CiAgICAgICAgICAgIGN1cnJlbnQudGVuc2lvbiA9CiAgICAgICAgICAgICAgY3VycmVudC50ZW5zaW9uID09PSB1bmRlZmluZWQgPyAwLjM2IDogY3VycmVudC50ZW5zaW9uOwogICAgICAgICAgICBjdXJyZW50LnBvaW50UmFkaXVzID0KICAgICAgICAgICAgICBjdXJyZW50LnBvaW50UmFkaXVzID09PSB1bmRlZmluZWQgPyAwIDogY3VycmVudC5wb2ludFJhZGl1czsKICAgICAgICAgICAgY3VycmVudC5wb2ludEhvdmVyUmFkaXVzID0gY3VycmVudC5wb2ludEhvdmVyUmFkaXVzIHx8IDU7CiAgICAgICAgICAgIGN1cnJlbnQucG9pbnRIb3ZlckJhY2tncm91bmRDb2xvciA9ICIjZmZmZmZmIjsKICAgICAgICAgICAgY3VycmVudC5wb2ludEhvdmVyQm9yZGVyQ29sb3IgPSBiYXNlQ29sb3I7CiAgICAgICAgICAgIGN1cnJlbnQucG9pbnRIb3ZlckJvcmRlcldpZHRoID0gMjsKICAgICAgICAgICAgY3VycmVudC5zcGFuR2FwcyA9IHRydWU7CiAgICAgICAgICB9IGVsc2UgaWYgKAogICAgICAgICAgICBjb25maWcudHlwZSA9PT0gImJhciIgfHwKICAgICAgICAgICAgY29uZmlnLnR5cGUgPT09ICJob3Jpem9udGFsQmFyIgogICAgICAgICAgKSB7CiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGN1cnJlbnQuYmFja2dyb3VuZENvbG9yKSkgewogICAgICAgICAgICAgIGN1cnJlbnQuYmFja2dyb3VuZENvbG9yID0gY3VycmVudC5iYWNrZ3JvdW5kQ29sb3IubWFwKChjb2xvcikgPT4KICAgICAgICAgICAgICAgIHRoaXMubm9ybWFsaXplQ2hhcnRDb2xvcihjb2xvcikKICAgICAgICAgICAgICApOwogICAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnQuYmFja2dyb3VuZENvbG9yKSB7CiAgICAgICAgICAgICAgY3VycmVudC5iYWNrZ3JvdW5kQ29sb3IgPSB0aGlzLm5vcm1hbGl6ZUNoYXJ0Q29sb3IoCiAgICAgICAgICAgICAgICBjdXJyZW50LmJhY2tncm91bmRDb2xvcgogICAgICAgICAgICAgICk7CiAgICAgICAgICAgIH0gZWxzZSBpZiAoCiAgICAgICAgICAgICAgc291cmNlRGF0YXNldHMubGVuZ3RoID09PSAxICYmCiAgICAgICAgICAgICAgZWxlbWVudCAmJgogICAgICAgICAgICAgIHR5cGVvZiBlbGVtZW50LmhpZ2hsaWdodEluZGV4ID09PSAibnVtYmVyIiAmJgogICAgICAgICAgICAgIGNvbmZpZy5kYXRhLmxhYmVscy5sZW5ndGgKICAgICAgICAgICAgKSB7CiAgICAgICAgICAgICAgY3VycmVudC5iYWNrZ3JvdW5kQ29sb3IgPSBjb25maWcuZGF0YS5sYWJlbHMubWFwKAogICAgICAgICAgICAgICAgKGxhYmVsLCBpbmRleCkgPT4KICAgICAgICAgICAgICAgICAgaW5kZXggPT09IGVsZW1lbnQuaGlnaGxpZ2h0SW5kZXggPyBwYWxldHRlWzBdIDogIiNkZmU2ZjEiCiAgICAgICAgICAgICAgKTsKICAgICAgICAgICAgfSBlbHNlIHsKICAgICAgICAgICAgICBjdXJyZW50LmJhY2tncm91bmRDb2xvciA9IHBhbGV0dGVbZGF0YXNldEluZGV4ICUgcGFsZXR0ZS5sZW5ndGhdOwogICAgICAgICAgICB9CiAgICAgICAgICAgIGNvbnN0IGlzSG9yaXpvbnRhbEJhciA9CiAgICAgICAgICAgICAgQm9vbGVhbihjb25maWcub3B0aW9ucykgJiYgY29uZmlnLm9wdGlvbnMuaW5kZXhBeGlzID09PSAieSI7CiAgICAgICAgICAgIGN1cnJlbnQuYm9yZGVyUmFkaXVzID0KICAgICAgICAgICAgICBjdXJyZW50LmJvcmRlclJhZGl1cyA9PT0gdW5kZWZpbmVkCiAgICAgICAgICAgICAgICA/IGlzSG9yaXpvbnRhbEJhcgogICAgICAgICAgICAgICAgICA/IHsgdG9wTGVmdDogMCwgYm90dG9tTGVmdDogMCwgdG9wUmlnaHQ6IDgsIGJvdHRvbVJpZ2h0OiA4IH0KICAgICAgICAgICAgICAgICAgOiB7IHRvcExlZnQ6IDgsIHRvcFJpZ2h0OiA4LCBib3R0b21MZWZ0OiAwLCBib3R0b21SaWdodDogMCB9CiAgICAgICAgICAgICAgICA6IGN1cnJlbnQuYm9yZGVyUmFkaXVzOwogICAgICAgICAgICBjdXJyZW50Lm1heEJhclRoaWNrbmVzcyA9IGN1cnJlbnQubWF4QmFyVGhpY2tuZXNzIHx8IDcyOwogICAgICAgICAgICBjdXJyZW50LmJvcmRlclNraXBwZWQgPSBmYWxzZTsKICAgICAgICAgICAgY3VycmVudC5jYXRlZ29yeVBlcmNlbnRhZ2UgPSBjdXJyZW50LmNhdGVnb3J5UGVyY2VudGFnZSB8fCAwLjY4OwogICAgICAgICAgICBjdXJyZW50LmJhclBlcmNlbnRhZ2UgPSBjdXJyZW50LmJhclBlcmNlbnRhZ2UgfHwgMC43NjsKICAgICAgICAgIH0gZWxzZSBpZiAoaXNSYWRpYWwpIHsKICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY3VycmVudC5iYWNrZ3JvdW5kQ29sb3IpKSB7CiAgICAgICAgICAgICAgY3VycmVudC5iYWNrZ3JvdW5kQ29sb3IgPSBjdXJyZW50LmJhY2tncm91bmRDb2xvci5tYXAoKGNvbG9yKSA9PgogICAgICAgICAgICAgICAgdGhpcy5ub3JtYWxpemVDaGFydENvbG9yKGNvbG9yKQogICAgICAgICAgICAgICk7CiAgICAgICAgICAgIH0gZWxzZSB7CiAgICAgICAgICAgICAgY3VycmVudC5iYWNrZ3JvdW5kQ29sb3IgPSBwYWxldHRlOwogICAgICAgICAgICB9CiAgICAgICAgICAgIGN1cnJlbnQuYm9yZGVyQ29sb3IgPSAiI2ZmZmZmZiI7CiAgICAgICAgICAgIGN1cnJlbnQuYm9yZGVyV2lkdGggPSAzOwogICAgICAgICAgICBjdXJyZW50LmhvdmVyT2Zmc2V0ID0gNjsKICAgICAgICAgIH0gZWxzZSBpZiAoY29uZmlnLnR5cGUgPT09ICJyYWRhciIpIHsKICAgICAgICAgICAgY3VycmVudC5ib3JkZXJDb2xvciA9IGJhc2VDb2xvcjsKICAgICAgICAgICAgY3VycmVudC5iYWNrZ3JvdW5kQ29sb3IgPSB0aGlzLnRvUmdiYShiYXNlQ29sb3IsIDAuMTIpOwogICAgICAgICAgICBjdXJyZW50LmJvcmRlcldpZHRoID0gMjsKICAgICAgICAgICAgY3VycmVudC5wb2ludFJhZGl1cyA9IGN1cnJlbnQucG9pbnRSYWRpdXMgfHwgMzsKICAgICAgICAgICAgY3VycmVudC5wb2ludEJhY2tncm91bmRDb2xvciA9IGJhc2VDb2xvcjsKICAgICAgICAgIH0gZWxzZSBpZiAoY29uZmlnLnR5cGUgPT09ICJzY2F0dGVyIikgewogICAgICAgICAgICBjdXJyZW50LmJhY2tncm91bmRDb2xvciA9IGJhc2VDb2xvcjsKICAgICAgICAgICAgY3VycmVudC5ib3JkZXJDb2xvciA9ICIjZmZmZmZmIjsKICAgICAgICAgICAgY3VycmVudC5ib3JkZXJXaWR0aCA9IDI7CiAgICAgICAgICAgIGN1cnJlbnQucG9pbnRSYWRpdXMgPSBjdXJyZW50LnBvaW50UmFkaXVzIHx8IDU7CiAgICAgICAgICAgIGN1cnJlbnQucG9pbnRIb3ZlclJhZGl1cyA9IDc7CiAgICAgICAgICB9CgogICAgICAgICAgcmV0dXJuIGN1cnJlbnQ7CiAgICAgICAgfSk7CgogICAgICAgIGNvbmZpZy5kYXRhLmRhdGFzZXRzID0gZGF0YXNldHM7CgogICAgICAgIGNvbnN0IG9wdGlvbnMgPSBjb25maWcub3B0aW9ucyA/IGNvbmZpZy5vcHRpb25zIDoge307CiAgICAgICAgY29uZmlnLm9wdGlvbnMgPSBvcHRpb25zOwogICAgICAgIGNvbnN0IHRpY2tTaXplID0gaXNDYXJkID8gMTAgOiAyMjsKICAgICAgICBjb25zdCBsZWdlbmRTaXplID0gaXNDYXJkID8gMTAgOiAxODsKCiAgICAgICAgb3B0aW9ucy5yZXNwb25zaXZlID0gIWlzQ2FyZDsKICAgICAgICBpZiAoaXNDYXJkKSB7CiAgICAgICAgICBvcHRpb25zLm1haW50YWluQXNwZWN0UmF0aW8gPSBmYWxzZTsKICAgICAgICB9IGVsc2UgaWYgKGlzUmFkaWFsKSB7CiAgICAgICAgICBvcHRpb25zLm1haW50YWluQXNwZWN0UmF0aW8gPSB0cnVlOwogICAgICAgICAgb3B0aW9ucy5hc3BlY3RSYXRpbyA9IDE7CiAgICAgICAgfSBlbHNlIHsKICAgICAgICAgIG9wdGlvbnMubWFpbnRhaW5Bc3BlY3RSYXRpbyA9IGZhbHNlOwogICAgICAgIH0KCiAgICAgICAgb3B0aW9ucy5hbmltYXRpb24gPSBpc0NhcmQKICAgICAgICAgID8gZmFsc2UKICAgICAgICAgIDogT2JqZWN0LmFzc2lnbigKICAgICAgICAgICAgICB7IGR1cmF0aW9uOiA3MjAsIGVhc2luZzogImVhc2VPdXRRdWFydCIgfSwKICAgICAgICAgICAgICBvcHRpb25zLmFuaW1hdGlvbiB8fCB7fQogICAgICAgICAgICApOwogICAgICAgIG9wdGlvbnMuZm9udCA9IHsgZmFtaWx5OiBmb250IH07CiAgICAgICAgb3B0aW9ucy5jb2xvciA9ICIjNjY3MDg1IjsKICAgICAgICBvcHRpb25zLmxheW91dCA9IE9iamVjdC5hc3NpZ24oCiAgICAgICAgICB7CiAgICAgICAgICAgIHBhZGRpbmc6IHsgdG9wOiA4LCByaWdodDogOCwgYm90dG9tOiAwLCBsZWZ0OiAwIH0sCiAgICAgICAgICB9LAogICAgICAgICAgb3B0aW9ucy5sYXlvdXQgfHwge30KICAgICAgICApOwogICAgICAgIG9wdGlvbnMuaW50ZXJhY3Rpb24gPSBPYmplY3QuYXNzaWduKAogICAgICAgICAgeyBtb2RlOiAiaW5kZXgiLCBpbnRlcnNlY3Q6IGZhbHNlIH0sCiAgICAgICAgICBvcHRpb25zLmludGVyYWN0aW9uIHx8IHt9CiAgICAgICAgKTsKCiAgICAgICAgb3B0aW9ucy5wbHVnaW5zID0gb3B0aW9ucy5wbHVnaW5zIHx8IHt9OwogICAgICAgIG9wdGlvbnMucGx1Z2lucy50aXRsZSA9IHsgZGlzcGxheTogZmFsc2UgfTsKCiAgICAgICAgY29uc3QgbGVnZW5kID0KICAgICAgICAgIG9wdGlvbnMucGx1Z2lucy5sZWdlbmQgPT09IGZhbHNlCiAgICAgICAgICAgID8geyBkaXNwbGF5OiBmYWxzZSB9CiAgICAgICAgICAgIDogT2JqZWN0LmFzc2lnbih7fSwgb3B0aW9ucy5wbHVnaW5zLmxlZ2VuZCB8fCB7fSk7CiAgICAgICAgbGVnZW5kLmRpc3BsYXkgPQogICAgICAgICAgIWlzQ2FyZCAmJgogICAgICAgICAgKGRhdGFzZXRzLmxlbmd0aCA+IDEgfHwKICAgICAgICAgICAgKGlzUmFkaWFsICYmIGNvbmZpZy5kYXRhLmxhYmVscy5sZW5ndGggPiAwKSk7CiAgICAgICAgbGVnZW5kLnBvc2l0aW9uID0gaXNSYWRpYWwgPyAicmlnaHQiIDogInRvcCI7CiAgICAgICAgbGVnZW5kLmFsaWduID0gaXNSYWRpYWwgPyAiY2VudGVyIiA6ICJlbmQiOwogICAgICAgIGxlZ2VuZC5sYWJlbHMgPSBPYmplY3QuYXNzaWduKAogICAgICAgICAgewogICAgICAgICAgICB1c2VQb2ludFN0eWxlOiB0cnVlLAogICAgICAgICAgICBwb2ludFN0eWxlOiAiY2lyY2xlIiwKICAgICAgICAgICAgYm94V2lkdGg6IDYsCiAgICAgICAgICAgIGJveEhlaWdodDogNiwKICAgICAgICAgICAgcGFkZGluZzogaXNDYXJkID8gOCA6IDIyLAogICAgICAgICAgICBjb2xvcjogIiM0NzU0NjciLAogICAgICAgICAgICBmb250OiB7CiAgICAgICAgICAgICAgZmFtaWx5OiBmb250LAogICAgICAgICAgICAgIHNpemU6IGxlZ2VuZFNpemUsCiAgICAgICAgICAgICAgd2VpZ2h0OiAiNTAwIiwKICAgICAgICAgICAgfSwKICAgICAgICAgIH0sCiAgICAgICAgICBsZWdlbmQubGFiZWxzIHx8IHt9CiAgICAgICAgKTsKICAgICAgICBvcHRpb25zLnBsdWdpbnMubGVnZW5kID0gbGVnZW5kOwoKICAgICAgICBjb25zdCB0b29sdGlwID0KICAgICAgICAgIG9wdGlvbnMucGx1Z2lucy50b29sdGlwID09PSBmYWxzZQogICAgICAgICAgICA/IHsgZW5hYmxlZDogZmFsc2UgfQogICAgICAgICAgICA6IE9iamVjdC5hc3NpZ24oe30sIG9wdGlvbnMucGx1Z2lucy50b29sdGlwIHx8IHt9KTsKICAgICAgICB0b29sdGlwLmVuYWJsZWQgPSAhaXNDYXJkOwogICAgICAgIHRvb2x0aXAuYmFja2dyb3VuZENvbG9yID0gIiMxMDE4MjgiOwogICAgICAgIHRvb2x0aXAudGl0bGVDb2xvciA9ICIjZmZmZmZmIjsKICAgICAgICB0b29sdGlwLmJvZHlDb2xvciA9ICIjZTRlN2VjIjsKICAgICAgICB0b29sdGlwLmJvcmRlckNvbG9yID0gInJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wOCkiOwogICAgICAgIHRvb2x0aXAuYm9yZGVyV2lkdGggPSAxOwogICAgICAgIHRvb2x0aXAucGFkZGluZyA9IDEyOwogICAgICAgIHRvb2x0aXAuY29ybmVyUmFkaXVzID0gMTA7CiAgICAgICAgdG9vbHRpcC5kaXNwbGF5Q29sb3JzID0gdHJ1ZTsKICAgICAgICB0b29sdGlwLmJveFdpZHRoID0gNzsKICAgICAgICB0b29sdGlwLmJveEhlaWdodCA9IDc7CiAgICAgICAgdG9vbHRpcC51c2VQb2ludFN0eWxlID0gdHJ1ZTsKICAgICAgICB0b29sdGlwLnRpdGxlRm9udCA9IHsKICAgICAgICAgIGZhbWlseTogZm9udCwKICAgICAgICAgIHNpemU6IDEzLAogICAgICAgICAgd2VpZ2h0OiAiNjAwIiwKICAgICAgICB9OwogICAgICAgIHRvb2x0aXAuYm9keUZvbnQgPSB7CiAgICAgICAgICBmYW1pbHk6IGZvbnQsCiAgICAgICAgICBzaXplOiAxMywKICAgICAgICAgIHdlaWdodDogIjQwMCIsCiAgICAgICAgfTsKICAgICAgICBvcHRpb25zLnBsdWdpbnMudG9vbHRpcCA9IHRvb2x0aXA7CgogICAgICAgIG9wdGlvbnMuc2NhbGVzID0gb3B0aW9ucy5zY2FsZXMgfHwge307CgogICAgICAgIGlmIChpc1JhZGlhbCkgewogICAgICAgICAgaWYgKGNvbmZpZy50eXBlID09PSAiZG91Z2hudXQiKSB7CiAgICAgICAgICAgIG9wdGlvbnMuY3V0b3V0ID0gb3B0aW9ucy5jdXRvdXQgfHwgIjY0JSI7CiAgICAgICAgICB9CiAgICAgICAgfSBlbHNlIGlmIChjb25maWcudHlwZSA9PT0gInJhZGFyIikgewogICAgICAgICAgY29uc3QgcmFkaWFsID0gb3B0aW9ucy5zY2FsZXMuciB8fCB7fTsKICAgICAgICAgIHJhZGlhbC5ncmlkID0gT2JqZWN0LmFzc2lnbih7fSwgcmFkaWFsLmdyaWQsIHsKICAgICAgICAgICAgY29sb3I6ICJyZ2JhKDE2LCAyNCwgNDAsIDAuMDgpIiwKICAgICAgICAgIH0pOwogICAgICAgICAgcmFkaWFsLmFuZ2xlTGluZXMgPSBPYmplY3QuYXNzaWduKHt9LCByYWRpYWwuYW5nbGVMaW5lcywgewogICAgICAgICAgICBjb2xvcjogInJnYmEoMTYsIDI0LCA0MCwgMC4wOCkiLAogICAgICAgICAgfSk7CiAgICAgICAgICByYWRpYWwucG9pbnRMYWJlbHMgPSBPYmplY3QuYXNzaWduKHt9LCByYWRpYWwucG9pbnRMYWJlbHMsIHsKICAgICAgICAgICAgY29sb3I6ICIjNDc1NDY3IiwKICAgICAgICAgICAgZm9udDogewogICAgICAgICAgICAgIGZhbWlseTogZm9udCwKICAgICAgICAgICAgICBzaXplOiAxNiwKICAgICAgICAgICAgICB3ZWlnaHQ6ICI1MDAiLAogICAgICAgICAgICB9LAogICAgICAgICAgfSk7CiAgICAgICAgICByYWRpYWwudGlja3MgPSBPYmplY3QuYXNzaWduKHt9LCByYWRpYWwudGlja3MsIHsKICAgICAgICAgICAgZGlzcGxheTogZmFsc2UsCiAgICAgICAgICB9KTsKICAgICAgICAgIHJhZGlhbC5zdWdnZXN0ZWRNaW4gPSAwOwogICAgICAgICAgb3B0aW9ucy5zY2FsZXMuciA9IHJhZGlhbDsKICAgICAgICB9IGVsc2UgewogICAgICAgICAgY29uc3QgaXNIb3Jpem9udGFsID0KICAgICAgICAgICAgY29uZmlnLnR5cGUgPT09ICJob3Jpem9udGFsQmFyIiB8fCBvcHRpb25zLmluZGV4QXhpcyA9PT0gInkiOwogICAgICAgICAgY29uc3QgY2F0ZWdvcnlBeGlzID0gaXNIb3Jpem9udGFsID8gInkiIDogIngiOwogICAgICAgICAgY29uc3QgdmFsdWVBeGlzID0gaXNIb3Jpem9udGFsID8gIngiIDogInkiOwoKICAgICAgICAgIFsieCIsICJ5Il0uZm9yRWFjaCgoYXhpcykgPT4gewogICAgICAgICAgICBvcHRpb25zLnNjYWxlc1theGlzXSA9IG9wdGlvbnMuc2NhbGVzW2F4aXNdIHx8IHt9OwogICAgICAgICAgfSk7CgogICAgICAgICAgY29uc3QgY2F0ZWdvcnkgPSBvcHRpb25zLnNjYWxlc1tjYXRlZ29yeUF4aXNdOwogICAgICAgICAgY29uc3QgdmFsdWUgPSBvcHRpb25zLnNjYWxlc1t2YWx1ZUF4aXNdOwoKICAgICAgICAgIGNhdGVnb3J5LmdyaWQgPSBPYmplY3QuYXNzaWduKHt9LCBjYXRlZ29yeS5ncmlkLCB7CiAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlLAogICAgICAgICAgICBkcmF3Qm9yZGVyOiBmYWxzZSwKICAgICAgICAgICAgZHJhd1RpY2tzOiBmYWxzZSwKICAgICAgICAgIH0pOwogICAgICAgICAgY2F0ZWdvcnkuYm9yZGVyID0gT2JqZWN0LmFzc2lnbih7fSwgY2F0ZWdvcnkuYm9yZGVyLCB7CiAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlLAogICAgICAgICAgfSk7CiAgICAgICAgICBjYXRlZ29yeS50aWNrcyA9IE9iamVjdC5hc3NpZ24oe30sIGNhdGVnb3J5LnRpY2tzLCB7CiAgICAgICAgICAgIGNvbG9yOiAiIzY2NzA4NSIsCiAgICAgICAgICAgIHBhZGRpbmc6IDEyLAogICAgICAgICAgICBtYXhSb3RhdGlvbjogMCwKICAgICAgICAgICAgYXV0b1NraXA6IHRydWUsCiAgICAgICAgICAgIGZvbnQ6IHsKICAgICAgICAgICAgICBmYW1pbHk6IGZvbnQsCiAgICAgICAgICAgICAgc2l6ZTogdGlja1NpemUsCiAgICAgICAgICAgICAgd2VpZ2h0OiAiNTAwIiwKICAgICAgICAgICAgfSwKICAgICAgICAgIH0pOwoKICAgICAgICAgIHZhbHVlLmdyaWQgPSBPYmplY3QuYXNzaWduKHt9LCB2YWx1ZS5ncmlkLCB7CiAgICAgICAgICAgIGNvbG9yOiAicmdiYSgxNiwgMjQsIDQwLCAwLjA3KSIsCiAgICAgICAgICAgIGRyYXdUaWNrczogZmFsc2UsCiAgICAgICAgICAgIGRyYXdCb3JkZXI6IGZhbHNlLAogICAgICAgICAgfSk7CiAgICAgICAgICB2YWx1ZS5ib3JkZXIgPSBPYmplY3QuYXNzaWduKHt9LCB2YWx1ZS5ib3JkZXIsIHsKICAgICAgICAgICAgZGlzcGxheTogZmFsc2UsCiAgICAgICAgICB9KTsKICAgICAgICAgIHZhbHVlLnRpY2tzID0gT2JqZWN0LmFzc2lnbih7fSwgdmFsdWUudGlja3MsIHsKICAgICAgICAgICAgY29sb3I6ICIjOThhMmIzIiwKICAgICAgICAgICAgcGFkZGluZzogMTIsCiAgICAgICAgICAgIG1heFRpY2tzTGltaXQ6IDYsCiAgICAgICAgICAgIGZvbnQ6IHsKICAgICAgICAgICAgICBmYW1pbHk6IGZvbnQsCiAgICAgICAgICAgICAgc2l6ZTogdGlja1NpemUsCiAgICAgICAgICAgICAgd2VpZ2h0OiAiNTAwIiwKICAgICAgICAgICAgfSwKICAgICAgICAgIH0pOwoKICAgICAgICAgIGlmICgKICAgICAgICAgICAgY29uZmlnLnR5cGUgPT09ICJiYXIiIHx8CiAgICAgICAgICAgIGNvbmZpZy50eXBlID09PSAiaG9yaXpvbnRhbEJhciIgfHwKICAgICAgICAgICAgKGNvbmZpZy50eXBlID09PSAibGluZSIgJiYKICAgICAgICAgICAgICBkYXRhc2V0cy5zb21lKChkYXRhc2V0KSA9PiBkYXRhc2V0LmZpbGwpKQogICAgICAgICAgKSB7CiAgICAgICAgICAgIHZhbHVlLmJlZ2luQXRaZXJvID0gdHJ1ZTsKICAgICAgICAgIH0KICAgICAgICB9CgogICAgICAgIHJldHVybiBjb25maWc7CiAgICAgIH0sCgogICAgICAvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KICAgICAgICAg5aSW6YOo5L6d6LWWCiAgICAgICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqLwogICAgICBhc3luYyBsb2FkQ2hhcnRKcygpIHsKICAgICAgICBjb25zdCBleGlzdGluZ1NjcmlwdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCJwdi1jaGFydGpzLXNjcmlwdCIpOwogICAgICAgIGlmICgKICAgICAgICAgIGV4aXN0aW5nU2NyaXB0ICYmCiAgICAgICAgICBleGlzdGluZ1NjcmlwdC5kYXRhc2V0LmxvYWRlZCA9PT0gInRydWUiICYmCiAgICAgICAgICB3aW5kb3cuQ2hhcnQKICAgICAgICApIHsKICAgICAgICAgIHRoaXMuQ2hhcnQgPSB3aW5kb3cuQ2hhcnQ7CiAgICAgICAgICB0aGlzLmNoYXJ0SnNMb2FkZWQgPSB0cnVlOwogICAgICAgICAgcmV0dXJuOwogICAgICAgIH0KCiAgICAgICAgaWYgKHRoaXMuX2NoYXJ0SnNQcm9taXNlKSByZXR1cm4gdGhpcy5fY2hhcnRKc1Byb21pc2U7CgogICAgICAgIHRoaXMuX2NoYXJ0SnNQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4gewogICAgICAgICAgY29uc3Qgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgic2NyaXB0Iik7CiAgICAgICAgICBzY3JpcHQuaWQgPSAicHYtY2hhcnRqcy1zY3JpcHQiOwogICAgICAgICAgc2NyaXB0LnNyYyA9ICJodHRwczovL3RyYW5zd2ViLmNuL2NvbW1vbi9jaGFydC51bWQubWluLmpzIjsKICAgICAgICAgIHNjcmlwdC5hc3luYyA9IHRydWU7CiAgICAgICAgICBzY3JpcHQub25sb2FkID0gKCkgPT4gewogICAgICAgICAgICBpZiAoIXdpbmRvdy5DaGFydCkgewogICAgICAgICAgICAgIHRoaXMuX2NoYXJ0SnNQcm9taXNlID0gbnVsbDsKICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCJDaGFydC5qcyDlt7LliqDovb3vvIzkvYbmnKrmjILovb0gd2luZG93LkNoYXJ0IikpOwogICAgICAgICAgICAgIHJldHVybjsKICAgICAgICAgICAgfQogICAgICAgICAgICBzY3JpcHQuZGF0YXNldC5sb2FkZWQgPSAidHJ1ZSI7CiAgICAgICAgICAgIHRoaXMuQ2hhcnQgPSB3aW5kb3cuQ2hhcnQ7CiAgICAgICAgICAgIHRoaXMuY2hhcnRKc0xvYWRlZCA9IHRydWU7CiAgICAgICAgICAgIHJlc29sdmUoKTsKICAgICAgICAgIH07CiAgICAgICAgICBzY3JpcHQub25lcnJvciA9ICgpID0+IHsKICAgICAgICAgICAgdGhpcy5fY2hhcnRKc1Byb21pc2UgPSBudWxsOwogICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCJDaGFydC5qcyDotYTmupDliqDovb3lpLHotKUiKSk7CiAgICAgICAgICB9OwogICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzY3JpcHQpOwogICAgICAgIH0pOwoKICAgICAgICByZXR1cm4gdGhpcy5fY2hhcnRKc1Byb21pc2U7CiAgICAgIH0sCgogICAgICBpbml0TWVybWFpZCgpIHsKICAgICAgICBpZiAoIXRoaXMubWVybWFpZCkgcmV0dXJuOwogICAgICAgIHRoaXMubWVybWFpZC5pbml0aWFsaXplKHsKICAgICAgICAgIHN0YXJ0T25Mb2FkOiBmYWxzZSwKICAgICAgICAgIHRoZW1lOiAiYmFzZSIsCiAgICAgICAgICBzZWN1cml0eUxldmVsOiAibG9vc2UiLAogICAgICAgICAgZm9udEZhbWlseTogdGhpcy5jaGFydEZvbnRGYW1pbHkoKSwKICAgICAgICAgIHRoZW1lVmFyaWFibGVzOiB7CiAgICAgICAgICAgIGZvbnRGYW1pbHk6IHRoaXMuY2hhcnRGb250RmFtaWx5KCksCiAgICAgICAgICAgIHByaW1hcnlDb2xvcjogIiNmZmZmZmYiLAogICAgICAgICAgICBwcmltYXJ5VGV4dENvbG9yOiAiIzEwMTgyOCIsCiAgICAgICAgICAgIHByaW1hcnlCb3JkZXJDb2xvcjogIiNjM2QwZTMiLAogICAgICAgICAgICBsaW5lQ29sb3I6ICIjOGQ5YmIwIiwKICAgICAgICAgICAgc2Vjb25kYXJ5Q29sb3I6ICIjZjVmOGZkIiwKICAgICAgICAgICAgdGVydGlhcnlDb2xvcjogIiNmZmZmZmYiLAogICAgICAgICAgICBjbHVzdGVyQmtnOiAiI2Y4ZmFmYyIsCiAgICAgICAgICAgIGNsdXN0ZXJCb3JkZXI6ICIjZTRlN2VjIiwKICAgICAgICAgICAgZWRnZUxhYmVsQmFja2dyb3VuZDogIiNmZmZmZmYiLAogICAgICAgICAgICBub2RlQm9yZGVyOiAiI2MzZDBlMyIsCiAgICAgICAgICAgIG1haW5Ca2c6ICIjZmZmZmZmIiwKICAgICAgICAgICAgdGV4dENvbG9yOiAiIzEwMTgyOCIsCiAgICAgICAgICB9LAogICAgICAgICAgZmxvd2NoYXJ0OiB7CiAgICAgICAgICAgIHVzZU1heFdpZHRoOiB0cnVlLAogICAgICAgICAgICBodG1sTGFiZWxzOiB0cnVlLAogICAgICAgICAgICBjdXJ2ZTogImJhc2lzIiwKICAgICAgICAgICAgcGFkZGluZzogMTYsCiAgICAgICAgICAgIG5vZGVTcGFjaW5nOiAzNiwKICAgICAgICAgICAgcmFua1NwYWNpbmc6IDU2LAogICAgICAgICAgfSwKICAgICAgICAgIHNlcXVlbmNlOiB7CiAgICAgICAgICAgIHVzZU1heFdpZHRoOiB0cnVlLAogICAgICAgICAgICBtaXJyb3JBY3RvcnM6IGZhbHNlLAogICAgICAgICAgICBtZXNzYWdlRm9udFNpemU6IDE0LAogICAgICAgICAgICBhY3RvckZvbnRTaXplOiAxNCwKICAgICAgICAgIH0sCiAgICAgICAgfSk7CiAgICAgICAgdGhpcy5tZXJtYWlkTG9hZGVkID0gdHJ1ZTsKICAgICAgfSwKCiAgICAgIGFzeW5jIGxvYWRNZXJtYWlkKCkgewogICAgICAgIGlmICh3aW5kb3cubWVybWFpZCkgewogICAgICAgICAgdGhpcy5tZXJtYWlkID0gd2luZG93Lm1lcm1haWQ7CiAgICAgICAgICB0aGlzLmluaXRNZXJtYWlkKCk7CiAgICAgICAgICByZXR1cm47CiAgICAgICAgfQoKICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4gewogICAgICAgICAgY29uc3Qgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgic2NyaXB0Iik7CiAgICAgICAgICBzY3JpcHQuc3JjID0KICAgICAgICAgICAgImh0dHBzOi8vdHJhbnN3ZWIuY24vY29tbW9uL21lcm1haWQubWluLmpzIjsKICAgICAgICAgIHNjcmlwdC5hc3luYyA9IHRydWU7CiAgICAgICAgICBzY3JpcHQub25sb2FkID0gKCkgPT4gewogICAgICAgICAgICB0aGlzLm1lcm1haWQgPSB3aW5kb3cubWVybWFpZDsKICAgICAgICAgICAgdGhpcy5pbml0TWVybWFpZCgpOwogICAgICAgICAgICByZXNvbHZlKCk7CiAgICAgICAgICB9OwogICAgICAgICAgc2NyaXB0Lm9uZXJyb3IgPSAoKSA9PiByZWplY3QobmV3IEVycm9yKCJNZXJtYWlkIOi1hOa6kOWKoOi9veWksei0pSIpKTsKICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2NyaXB0KTsKICAgICAgICB9KTsKICAgICAgfSwKCiAgICAgIGFzeW5jIGluaXRSZXF1aXJlZExpYnJhcmllcygpIHsKICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbCiAgICAgICAgICB0aGlzLmxvYWRDaGFydEpzKCkuY2F0Y2goKGVycm9yKSA9PiB7CiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoIkNoYXJ0LmpzIOS+nei1luWKoOi9veWksei0pe+8jOWbvuihqOWwhumZjee6p+WxleekuiIsIGVycm9yKTsKICAgICAgICAgIH0pLAogICAgICAgICAgdGhpcy5sb2FkTWVybWFpZCgpLmNhdGNoKChlcnJvcikgPT4gewogICAgICAgICAgICBjb25zb2xlLmVycm9yKCJNZXJtYWlkIOS+nei1luWKoOi9veWksei0pe+8jOWbvuihqOWwhumZjee6p+WxleekuiIsIGVycm9yKTsKICAgICAgICAgIH0pLAogICAgICAgIF0pOwogICAgICB9LAoKICAgICAgLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CiAgICAgICAgIOa4suafkwogICAgICAgICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi8KICAgICAgYXN5bmMgcmVuZGVyRWxlbWVudHMoc2NvcGUsIHRhcmdldFNsaWRlSWQpIHsKICAgICAgICBpZiAoIXNjb3BlKSBzY29wZSA9ICJyZXZlYWwiOwogICAgICAgIGNvbnN0IHJvb3QgPSB0aGlzLiRlbCB8fCBkb2N1bWVudDsKICAgICAgICBjb25zdCBzbGlkZXMgPSB0aGlzLmFjY291bnREYXRhLnNsaWRlcyB8fCBbXTsKCiAgICAgICAgZm9yIChsZXQgc0luZGV4ID0gMDsgc0luZGV4IDwgc2xpZGVzLmxlbmd0aDsgc0luZGV4ICs9IDEpIHsKICAgICAgICAgIGNvbnN0IHNsaWRlID0gc2xpZGVzW3NJbmRleF07CiAgICAgICAgICBpZiAodGFyZ2V0U2xpZGVJZCAmJiBzbGlkZS5pZCAhPT0gdGFyZ2V0U2xpZGVJZCkgY29udGludWU7CiAgICAgICAgICBjb25zdCBlbGVtZW50cyA9IHNsaWRlLmVsZW1lbnRzIHx8IFtdOwoKICAgICAgICAgIGZvciAobGV0IGVJbmRleCA9IDA7IGVJbmRleCA8IGVsZW1lbnRzLmxlbmd0aDsgZUluZGV4ICs9IDEpIHsKICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IGVsZW1lbnRzW2VJbmRleF07CiAgICAgICAgICAgIGlmIChlbGVtZW50LnR5cGUgIT09ICJjaGFydCIpIGNvbnRpbnVlOwoKICAgICAgICAgICAgY29uc3Qga2V5ID0gc2NvcGUgKyAiLSIgKyBzbGlkZS5pZCArICItIiArIGVJbmRleDsKCiAgICAgICAgICAgIGlmIChlbGVtZW50LmNoYXJ0VHlwZSA9PT0gImNoYXJ0anMiKSB7CiAgICAgICAgICAgICAgaWYgKCF0aGlzLkNoYXJ0KSBjb250aW51ZTsKICAgICAgICAgICAgICBjb25zdCBjYW52YXMgPSByb290LnF1ZXJ5U2VsZWN0b3IoCiAgICAgICAgICAgICAgICAnY2FudmFzW2RhdGEtY2hhcnQta2V5PSInICsga2V5ICsgJyJdJwogICAgICAgICAgICAgICk7CiAgICAgICAgICAgICAgaWYgKCFjYW52YXMpIGNvbnRpbnVlOwoKICAgICAgICAgICAgICB0cnkgewogICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hhcnRJbnN0YW5jZXNba2V5XSkgewogICAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0SW5zdGFuY2VzW2tleV0uZGVzdHJveSgpOwogICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5jaGFydEluc3RhbmNlc1trZXldOwogICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCIyZCIpOwogICAgICAgICAgICAgICAgaWYgKCFjb250ZXh0KSB7CiAgICAgICAgICAgICAgICAgIHRoaXMuY2hhcnRGYWlsdXJlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuY2hhcnRGYWlsdXJlcywgewogICAgICAgICAgICAgICAgICAgIFtrZXldOiB0cnVlLAogICAgICAgICAgICAgICAgICB9KTsKICAgICAgICAgICAgICAgICAgY29udGludWU7CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICBjb25zdCBjb25maWcgPSB0aGlzLmJ1aWxkQ2hhcnRDb25maWcoZWxlbWVudCwgc2NvcGUpOwogICAgICAgICAgICAgICAgdGhpcy5jaGFydEluc3RhbmNlc1trZXldID0gbmV3IHRoaXMuQ2hhcnQoY29udGV4dCwgY29uZmlnKTsKICAgICAgICAgICAgICAgIGlmICh0aGlzLmNoYXJ0RmFpbHVyZXNba2V5XSkgewogICAgICAgICAgICAgICAgICBjb25zdCBuZXh0RmFpbHVyZXMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmNoYXJ0RmFpbHVyZXMpOwogICAgICAgICAgICAgICAgICBkZWxldGUgbmV4dEZhaWx1cmVzW2tleV07CiAgICAgICAgICAgICAgICAgIHRoaXMuY2hhcnRGYWlsdXJlcyA9IG5leHRGYWlsdXJlczsKICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIGlmIChzY29wZSA9PT0gInJldmVhbCIpIHsKICAgICAgICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHsKICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGFydCA9IHRoaXMuY2hhcnRJbnN0YW5jZXNba2V5XTsKICAgICAgICAgICAgICAgICAgICBpZiAoY2hhcnQgJiYgdHlwZW9mIGNoYXJ0LnJlc2l6ZSA9PT0gImZ1bmN0aW9uIikgewogICAgICAgICAgICAgICAgICAgICAgY2hhcnQucmVzaXplKCk7CiAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICB9KTsKICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikgewogICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcigiQ2hhcnQuanMg5riy5p+T5aSx6LSlIiwgZXJyb3IpOwogICAgICAgICAgICAgICAgdGhpcy5jaGFydEZhaWx1cmVzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5jaGFydEZhaWx1cmVzLCB7CiAgICAgICAgICAgICAgICAgIFtrZXldOiB0cnVlLAogICAgICAgICAgICAgICAgfSk7CiAgICAgICAgICAgICAgfQogICAgICAgICAgICB9IGVsc2UgaWYgKGVsZW1lbnQuY2hhcnRUeXBlID09PSAibWVybWFpZCIgJiYgdGhpcy5tZXJtYWlkKSB7CiAgICAgICAgICAgICAgY29uc3QgY29udGFpbmVyID0gcm9vdC5xdWVyeVNlbGVjdG9yKAogICAgICAgICAgICAgICAgJ2RpdltkYXRhLW1lcm1haWQta2V5PSInICsga2V5ICsgJyJdJwogICAgICAgICAgICAgICk7CiAgICAgICAgICAgICAgaWYgKCFjb250YWluZXIgfHwgIWVsZW1lbnQuY2hhcnREYXRhIHx8ICFlbGVtZW50LmNoYXJ0RGF0YS5jb2RlKSB7CiAgICAgICAgICAgICAgICBjb250aW51ZTsKICAgICAgICAgICAgICB9CgogICAgICAgICAgICAgIHRyeSB7CiAgICAgICAgICAgICAgICBjb25zdCBzYWZlU2xpZGVJZCA9IFN0cmluZyhzbGlkZS5pZCkucmVwbGFjZSgKICAgICAgICAgICAgICAgICAgL1teYS16QS1aMC05Xy1dL2csCiAgICAgICAgICAgICAgICAgICItIgogICAgICAgICAgICAgICAgKTsKICAgICAgICAgICAgICAgIGNvbnN0IHVuaXF1ZUlkID0KICAgICAgICAgICAgICAgICAgInB2LW1lcm1haWQtIiArCiAgICAgICAgICAgICAgICAgIHNhZmVTbGlkZUlkICsKICAgICAgICAgICAgICAgICAgIi0iICsKICAgICAgICAgICAgICAgICAgZUluZGV4ICsKICAgICAgICAgICAgICAgICAgIi0iICsKICAgICAgICAgICAgICAgICAgRGF0ZS5ub3coKTsKICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMubWVybWFpZC5yZW5kZXIoCiAgICAgICAgICAgICAgICAgIHVuaXF1ZUlkLAogICAgICAgICAgICAgICAgICBlbGVtZW50LmNoYXJ0RGF0YS5jb2RlCiAgICAgICAgICAgICAgICApOwogICAgICAgICAgICAgICAgY29udGFpbmVyLmlubmVySFRNTCA9IHJlc3VsdC5zdmc7CgogICAgICAgICAgICAgICAgY29uc3QgcmVuZGVyZWRTdmcgPSBjb250YWluZXIucXVlcnlTZWxlY3Rvcigic3ZnIik7CiAgICAgICAgICAgICAgICBpZiAocmVuZGVyZWRTdmcpIHsKICAgICAgICAgICAgICAgICAgLy8g5piO56Gu6K6pIFNWRyDlnKjlm77ooajljLrln5/lhoXnrYnmr5TlsYXkuK3vvIzpgb/lhY3kuI3lkIwgTWVybWFpZCDniYjmnKwKICAgICAgICAgICAgICAgICAgLy8g6Ieq5bimIHhNaW5ZTWluIOetieWxnuaAp+aXtuaKiuWGheWuuemhtuWIsOS4iuWNiumDqOWIhuOAggogICAgICAgICAgICAgICAgICByZW5kZXJlZFN2Zy5zZXRBdHRyaWJ1dGUoInByZXNlcnZlQXNwZWN0UmF0aW8iLCAieE1pZFlNaWQgbWVldCIpOwogICAgICAgICAgICAgICAgICByZW5kZXJlZFN2Zy5zZXRBdHRyaWJ1dGUoIndpZHRoIiwgIjEwMCUiKTsKICAgICAgICAgICAgICAgICAgcmVuZGVyZWRTdmcuc2V0QXR0cmlidXRlKCJoZWlnaHQiLCAiMTAwJSIpOwogICAgICAgICAgICAgICAgICByZW5kZXJlZFN2Zy5zdHlsZS5tYXhXaWR0aCA9ICJub25lIjsKICAgICAgICAgICAgICAgIH0KCiAgICAgICAgICAgICAgICBsZXQgdmlld0JveFdpZHRoID0gMDsKICAgICAgICAgICAgICAgIGxldCB2aWV3Qm94SGVpZ2h0ID0gMDsKICAgICAgICAgICAgICAgIGNvbnN0IHZpZXdCb3hNYXRjaCA9IHJlc3VsdC5zdmcubWF0Y2goCiAgICAgICAgICAgICAgICAgIC92aWV3Qm94XHMqPVxzKlsiJ10oW14iJ10rKVsiJ10vaQogICAgICAgICAgICAgICAgKTsKICAgICAgICAgICAgICAgIGlmICh2aWV3Qm94TWF0Y2gpIHsKICAgICAgICAgICAgICAgICAgY29uc3Qgdmlld0JveFBhcnRzID0gdmlld0JveE1hdGNoWzFdCiAgICAgICAgICAgICAgICAgICAgLnRyaW0oKQogICAgICAgICAgICAgICAgICAgIC5zcGxpdCgvW1xzLF0rLykKICAgICAgICAgICAgICAgICAgICAubWFwKE51bWJlcik7CiAgICAgICAgICAgICAgICAgIHZpZXdCb3hXaWR0aCA9IHZpZXdCb3hQYXJ0c1syXSB8fCAwOwogICAgICAgICAgICAgICAgICB2aWV3Qm94SGVpZ2h0ID0gdmlld0JveFBhcnRzWzNdIHx8IDA7CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICBpZiAoIXZpZXdCb3hXaWR0aCB8fCAhdmlld0JveEhlaWdodCkgewogICAgICAgICAgICAgICAgICBjb25zdCBzdmcgPSByZW5kZXJlZFN2ZyB8fCBjb250YWluZXIucXVlcnlTZWxlY3Rvcigic3ZnIik7CiAgICAgICAgICAgICAgICAgIGlmIChzdmcgJiYgc3ZnLnZpZXdCb3ggJiYgc3ZnLnZpZXdCb3guYmFzZVZhbCkgewogICAgICAgICAgICAgICAgICAgIHZpZXdCb3hXaWR0aCA9IHN2Zy52aWV3Qm94LmJhc2VWYWwud2lkdGg7CiAgICAgICAgICAgICAgICAgICAgdmlld0JveEhlaWdodCA9IHN2Zy52aWV3Qm94LmJhc2VWYWwuaGVpZ2h0OwogICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICBpZiAodmlld0JveFdpZHRoID4gMCAmJiB2aWV3Qm94SGVpZ2h0ID4gMCkgewogICAgICAgICAgICAgICAgICBjb25zdCByYXRpbyA9IE1hdGgubWF4KAogICAgICAgICAgICAgICAgICAgIDEuMiwKICAgICAgICAgICAgICAgICAgICBNYXRoLm1pbig2LCB2aWV3Qm94V2lkdGggLyB2aWV3Qm94SGVpZ2h0KQogICAgICAgICAgICAgICAgICApOwogICAgICAgICAgICAgICAgICB0aGlzLmRpYWdyYW1SYXRpb3MgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmRpYWdyYW1SYXRpb3MsIHsKICAgICAgICAgICAgICAgICAgICBba2V5XTogcmF0aW8sCiAgICAgICAgICAgICAgICAgIH0pOwogICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hhcnRGYWlsdXJlc1trZXldKSB7CiAgICAgICAgICAgICAgICAgIGNvbnN0IG5leHRGYWlsdXJlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuY2hhcnRGYWlsdXJlcyk7CiAgICAgICAgICAgICAgICAgIGRlbGV0ZSBuZXh0RmFpbHVyZXNba2V5XTsKICAgICAgICAgICAgICAgICAgdGhpcy5jaGFydEZhaWx1cmVzID0gbmV4dEZhaWx1cmVzOwogICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7CiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCJNZXJtYWlkIOivreazleino+aekOWksei0pSIsIGVycm9yKTsKICAgICAgICAgICAgICAgIHRoaXMuY2hhcnRGYWlsdXJlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuY2hhcnRGYWlsdXJlcywgewogICAgICAgICAgICAgICAgICBba2V5XTogdHJ1ZSwKICAgICAgICAgICAgICAgIH0pOwogICAgICAgICAgICAgICAgY29udGFpbmVyLmlubmVySFRNTCA9CiAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPSJycy1tZXJtYWlkLWVycm9yIj7lm77ooajor63ms5Xop6PmnpDlpLHotKU8L2Rpdj4nOwogICAgICAgICAgICAgICAgaWYgKAogICAgICAgICAgICAgICAgICB0aGlzLm1lcm1haWQubWVybWFpZEFQSSAmJgogICAgICAgICAgICAgICAgICB0eXBlb2YgdGhpcy5tZXJtYWlkLm1lcm1haWRBUEkucmVzZXQgPT09ICJmdW5jdGlvbiIKICAgICAgICAgICAgICAgICkgewogICAgICAgICAgICAgICAgICB0aGlzLm1lcm1haWQubWVybWFpZEFQSS5yZXNldCgpOwogICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgIH0KICAgICAgICAgICAgfQogICAgICAgICAgfQogICAgICAgIH0KICAgICAgfSwKCiAgICAgIGdldFNsaWRlRWxlbWVudHMoKSB7CiAgICAgICAgaWYgKCF0aGlzLiRlbCkgcmV0dXJuIFtdOwogICAgICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCgKICAgICAgICAgIHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3JBbGwoIi5wdi1zdGFnZSAuc2xpZGVzID4gc2VjdGlvbiIpCiAgICAgICAgKTsKICAgICAgfSwKCiAgICAgIGdldEN1cnJlbnRTbGlkZUVsZW1lbnQoKSB7CiAgICAgICAgY29uc3Qgc2xpZGVzID0gdGhpcy5nZXRTbGlkZUVsZW1lbnRzKCk7CiAgICAgICAgcmV0dXJuIHNsaWRlc1t0aGlzLmN1cnJlbnRTbGlkZUluZGV4XSB8fCBudWxsOwogICAgICB9LAoKICAgICAgdXBkYXRlU3RhZ2VTY2FsZSgpIHsKICAgICAgICBjb25zdCBzdGFnZSA9CiAgICAgICAgICB0aGlzLiRlbCAmJiB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yCiAgICAgICAgICAgID8gdGhpcy4kZWwucXVlcnlTZWxlY3RvcigiLnB2LXN0YWdlIikKICAgICAgICAgICAgOiBudWxsOwogICAgICAgIGNvbnN0IHZpZXdwb3J0V2lkdGggPQogICAgICAgICAgKHN0YWdlICYmIHN0YWdlLmNsaWVudFdpZHRoKSB8fAogICAgICAgICAgd2luZG93LmlubmVyV2lkdGggfHwKICAgICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCB8fAogICAgICAgICAgMTkyMDsKICAgICAgICBjb25zdCB2aWV3cG9ydEhlaWdodCA9CiAgICAgICAgICAoc3RhZ2UgJiYgc3RhZ2UuY2xpZW50SGVpZ2h0KSB8fAogICAgICAgICAgd2luZG93LmlubmVySGVpZ2h0IHx8CiAgICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0IHx8CiAgICAgICAgICAxMDgwOwoKICAgICAgICAvLyDnlZnlh7rlronlhajovrnot53vvIzmnoHlrr0v5p6B6auY56qX5Y+j5LiL5Lmf5LiN5Lya6K6p6aG16Z2i6LS06L655oiW6KKr5a6/5Li7IFVJIOmBruaMoeOAggogICAgICAgIGNvbnN0IHNhZmVJbnNldCA9IDEyOwogICAgICAgIGNvbnN0IGF2YWlsYWJsZVdpZHRoID0gTWF0aC5tYXgoMSwgdmlld3BvcnRXaWR0aCAtIHNhZmVJbnNldCAqIDIpOwogICAgICAgIGNvbnN0IGF2YWlsYWJsZUhlaWdodCA9IE1hdGgubWF4KDEsIHZpZXdwb3J0SGVpZ2h0IC0gc2FmZUluc2V0ICogMik7CiAgICAgICAgdGhpcy5zdGFnZVNjYWxlID0gTWF0aC5tYXgoCiAgICAgICAgICAwLjAxLAogICAgICAgICAgTWF0aC5taW4oYXZhaWxhYmxlV2lkdGggLyAxOTIwLCBhdmFpbGFibGVIZWlnaHQgLyAxMDgwKQogICAgICAgICk7CiAgICAgIH0sCgogICAgICBzaG93Q3VycmVudFNsaWRlKCkgewogICAgICAgIGNvbnN0IHNsaWRlcyA9IHRoaXMuZ2V0U2xpZGVFbGVtZW50cygpOwogICAgICAgIHNsaWRlcy5mb3JFYWNoKChzbGlkZSwgaW5kZXgpID0+IHsKICAgICAgICAgIGNvbnN0IGlzQ3VycmVudCA9IGluZGV4ID09PSB0aGlzLmN1cnJlbnRTbGlkZUluZGV4OwogICAgICAgICAgc2xpZGUuY2xhc3NMaXN0LnRvZ2dsZSgiaXMtY3VycmVudCIsIGlzQ3VycmVudCk7CiAgICAgICAgICBzbGlkZS5zZXRBdHRyaWJ1dGUoImFyaWEtaGlkZGVuIiwgaXNDdXJyZW50ID8gImZhbHNlIiA6ICJ0cnVlIik7CiAgICAgICAgfSk7CiAgICAgICAgdGhpcy5hbmltYXRlQ3VycmVudFNsaWRlKCk7CiAgICAgIH0sCgogICAgICBhbmltYXRlQ3VycmVudFNsaWRlKCkgewogICAgICAgIGNvbnN0IGN1cnJlbnRTbGlkZSA9IHRoaXMuZ2V0Q3VycmVudFNsaWRlRWxlbWVudCgpOwogICAgICAgIGlmICghY3VycmVudFNsaWRlKSByZXR1cm47CgogICAgICAgIGNvbnN0IHJvb3QgPSB0aGlzLiRlbCB8fCBkb2N1bWVudDsKICAgICAgICByb290LnF1ZXJ5U2VsZWN0b3JBbGwoIi5ycy1zbGlkZS5ycy1hbmltLWFjdGl2ZSIpLmZvckVhY2goKHNsaWRlKSA9PiB7CiAgICAgICAgICBzbGlkZS5jbGFzc0xpc3QucmVtb3ZlKCJycy1hbmltLWFjdGl2ZSIpOwogICAgICAgIH0pOwogICAgICAgIGN1cnJlbnRTbGlkZS5jbGFzc0xpc3QucmVtb3ZlKCJycy1hbmltLWZhbGxiYWNrIik7CgogICAgICAgIHZvaWQgY3VycmVudFNsaWRlLm9mZnNldFdpZHRoOwogICAgICAgIGN1cnJlbnRTbGlkZS5jbGFzc0xpc3QuYWRkKCJycy1hbmltLWFjdGl2ZSIpOwoKICAgICAgICBpZiAodGhpcy5hbmltYXRpb25UaW1lcikgewogICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuYW5pbWF0aW9uVGltZXIpOwogICAgICAgIH0KICAgICAgICBjb25zdCBzbGlkZUlkID0gY3VycmVudFNsaWRlLmdldEF0dHJpYnV0ZSgiZGF0YS1zbGlkZS1pZCIpOwogICAgICAgIHRoaXMuYW5pbWF0aW9uVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHsKICAgICAgICAgIHRoaXMucmVuZGVyRWxlbWVudHMoInJldmVhbCIsIHNsaWRlSWQpOwogICAgICAgIH0sIDE0MCk7CgogICAgICAgIGlmICh0aGlzLnZpc2liaWxpdHlUaW1lcikgewogICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudmlzaWJpbGl0eVRpbWVyKTsKICAgICAgICB9CiAgICAgICAgdGhpcy52aXNpYmlsaXR5VGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHsKICAgICAgICAgIGNvbnN0IHRhcmdldHMgPSBjdXJyZW50U2xpZGUucXVlcnlTZWxlY3RvckFsbCgiLnJzLWFuaW0tdGFyZ2V0Iik7CiAgICAgICAgICBsZXQgaGlkZGVuQ291bnQgPSAwOwogICAgICAgICAgdGFyZ2V0cy5mb3JFYWNoKCh0YXJnZXQpID0+IHsKICAgICAgICAgICAgaWYgKHBhcnNlRmxvYXQod2luZG93LmdldENvbXB1dGVkU3R5bGUodGFyZ2V0KS5vcGFjaXR5KSA8IDAuMDUpIHsKICAgICAgICAgICAgICBoaWRkZW5Db3VudCArPSAxOwogICAgICAgICAgICB9CiAgICAgICAgICB9KTsKICAgICAgICAgIGlmIChoaWRkZW5Db3VudCA+IDApIHsKICAgICAgICAgICAgY3VycmVudFNsaWRlLmNsYXNzTGlzdC5hZGQoInJzLWFuaW0tZmFsbGJhY2siKTsKICAgICAgICAgIH0KICAgICAgICB9LCAxODAwKTsKICAgICAgfSwKCiAgICAgIGNoYXJ0S2V5KHNsaWRlLCBlbGVtZW50SW5kZXgpIHsKICAgICAgICByZXR1cm4gInJldmVhbC0iICsgKHNsaWRlID8gc2xpZGUuaWQgOiAic2xpZGUiKSArICItIiArIGVsZW1lbnRJbmRleDsKICAgICAgfSwKCiAgICAgIGdldERpYWdyYW1Bc3BlY3Qoc2xpZGUsIGVsZW1lbnRJbmRleCkgewogICAgICAgIGNvbnN0IHJhdGlvID0gdGhpcy5kaWFncmFtUmF0aW9zW3RoaXMuY2hhcnRLZXkoc2xpZGUsIGVsZW1lbnRJbmRleCldOwogICAgICAgIHJldHVybiB0eXBlb2YgcmF0aW8gPT09ICJudW1iZXIiICYmIE51bWJlci5pc0Zpbml0ZShyYXRpbykKICAgICAgICAgID8gcmF0aW8KICAgICAgICAgIDogMi40OwogICAgICB9LAoKICAgICAgZ2V0Q2hhcnRab29tKHNsaWRlLCBlbGVtZW50SW5kZXgpIHsKICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuY2hhcnRab29tW3RoaXMuY2hhcnRLZXkoc2xpZGUsIGVsZW1lbnRJbmRleCldOwogICAgICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICJudW1iZXIiICYmIE51bWJlci5pc0Zpbml0ZSh2YWx1ZSkKICAgICAgICAgID8gdmFsdWUKICAgICAgICAgIDogMTsKICAgICAgfSwKCiAgICAgIGdldENoYXJ0Wm9vbVBlcmNlbnQoc2xpZGUsIGVsZW1lbnRJbmRleCkgewogICAgICAgIHJldHVybiBNYXRoLnJvdW5kKHRoaXMuZ2V0Q2hhcnRab29tKHNsaWRlLCBlbGVtZW50SW5kZXgpICogMTAwKSArICIlIjsKICAgICAgfSwKCiAgICAgIGdldENoYXJ0UGFuKHNsaWRlLCBlbGVtZW50SW5kZXgpIHsKICAgICAgICByZXR1cm4gKAogICAgICAgICAgdGhpcy5jaGFydFBhblt0aGlzLmNoYXJ0S2V5KHNsaWRlLCBlbGVtZW50SW5kZXgpXSB8fCB7CiAgICAgICAgICAgIHg6IDAsCiAgICAgICAgICAgIHk6IDAsCiAgICAgICAgICB9CiAgICAgICAgKTsKICAgICAgfSwKCiAgICAgIGlzQ2hhcnRQYW5uaW5nKHNsaWRlLCBlbGVtZW50SW5kZXgpIHsKICAgICAgICByZXR1cm4gQm9vbGVhbigKICAgICAgICAgIHRoaXMuY2hhcnRQYW5TdGF0ZSAmJgogICAgICAgICAgICB0aGlzLmNoYXJ0UGFuU3RhdGUua2V5ID09PSB0aGlzLmNoYXJ0S2V5KHNsaWRlLCBlbGVtZW50SW5kZXgpCiAgICAgICAgKTsKICAgICAgfSwKCiAgICAgIGdldENoYXJ0Wm9vbVN0eWxlKHNsaWRlLCBlbGVtZW50SW5kZXgpIHsKICAgICAgICBjb25zdCB6b29tID0gdGhpcy5nZXRDaGFydFpvb20oc2xpZGUsIGVsZW1lbnRJbmRleCk7CiAgICAgICAgY29uc3QgcGFuID0gdGhpcy5nZXRDaGFydFBhbihzbGlkZSwgZWxlbWVudEluZGV4KTsKICAgICAgICBjb25zdCBwYW5uaW5nID0gdGhpcy5pc0NoYXJ0UGFubmluZyhzbGlkZSwgZWxlbWVudEluZGV4KTsKCiAgICAgICAgaWYgKHpvb20gPT09IDEgJiYgcGFuLnggPT09IDAgJiYgcGFuLnkgPT09IDApIHsKICAgICAgICAgIHJldHVybiB7CiAgICAgICAgICAgIGN1cnNvcjogImRlZmF1bHQiLAogICAgICAgICAgICB0b3VjaEFjdGlvbjogInBhbi15IiwKICAgICAgICAgIH07CiAgICAgICAgfQoKICAgICAgICByZXR1cm4gewogICAgICAgICAgdHJhbnNmb3JtOgogICAgICAgICAgICAidHJhbnNsYXRlM2QoIiArCiAgICAgICAgICAgIHBhbi54ICsKICAgICAgICAgICAgInB4LCAiICsKICAgICAgICAgICAgcGFuLnkgKwogICAgICAgICAgICAicHgsIDApIHNjYWxlKCIgKwogICAgICAgICAgICB6b29tICsKICAgICAgICAgICAgIikiLAogICAgICAgICAgdHJhbnNmb3JtT3JpZ2luOiAiY2VudGVyIGNlbnRlciIsCiAgICAgICAgICBjdXJzb3I6IHpvb20gPiAxID8gKHBhbm5pbmcgPyAiZ3JhYmJpbmciIDogImdyYWIiKSA6ICJkZWZhdWx0IiwKICAgICAgICAgIHRvdWNoQWN0aW9uOiB6b29tID4gMSA/ICJub25lIiA6ICJwYW4teSIsCiAgICAgICAgfTsKICAgICAgfSwKCiAgICAgIHNldENoYXJ0Wm9vbShzbGlkZSwgZWxlbWVudEluZGV4LCBuZXh0Wm9vbSkgewogICAgICAgIGNvbnN0IGtleSA9IHRoaXMuY2hhcnRLZXkoc2xpZGUsIGVsZW1lbnRJbmRleCk7CiAgICAgICAgY29uc3Qgem9vbSA9IE1hdGgubWF4KAogICAgICAgICAgMC41LAogICAgICAgICAgTWF0aC5taW4oMywgTWF0aC5yb3VuZChuZXh0Wm9vbSAqIDEwMCkgLyAxMDApCiAgICAgICAgKTsKICAgICAgICB0aGlzLmNoYXJ0Wm9vbSA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuY2hhcnRab29tLCB7CiAgICAgICAgICBba2V5XTogem9vbSwKICAgICAgICB9KTsKICAgICAgICBpZiAoem9vbSA8PSAxKSB7CiAgICAgICAgICB0aGlzLmNoYXJ0UGFuID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5jaGFydFBhbiwgewogICAgICAgICAgICBba2V5XTogeyB4OiAwLCB5OiAwIH0sCiAgICAgICAgICB9KTsKICAgICAgICB9CiAgICAgIH0sCgogICAgICB6b29tQ2hhcnQoc2xpZGUsIGVsZW1lbnRJbmRleCwgZGVsdGEpIHsKICAgICAgICB0aGlzLnNldENoYXJ0Wm9vbSgKICAgICAgICAgIHNsaWRlLAogICAgICAgICAgZWxlbWVudEluZGV4LAogICAgICAgICAgdGhpcy5nZXRDaGFydFpvb20oc2xpZGUsIGVsZW1lbnRJbmRleCkgKyBkZWx0YQogICAgICAgICk7CiAgICAgIH0sCgogICAgICByZXNldENoYXJ0Wm9vbShzbGlkZSwgZWxlbWVudEluZGV4KSB7CiAgICAgICAgdGhpcy5zdG9wQ2hhcnRQYW4oKTsKICAgICAgICBjb25zdCBrZXkgPSB0aGlzLmNoYXJ0S2V5KHNsaWRlLCBlbGVtZW50SW5kZXgpOwogICAgICAgIHRoaXMuY2hhcnRab29tID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5jaGFydFpvb20sIHsKICAgICAgICAgIFtrZXldOiAxLAogICAgICAgIH0pOwogICAgICAgIHRoaXMuY2hhcnRQYW4gPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmNoYXJ0UGFuLCB7CiAgICAgICAgICBba2V5XTogeyB4OiAwLCB5OiAwIH0sCiAgICAgICAgfSk7CiAgICAgIH0sCgogICAgICBoYW5kbGVDaGFydFdoZWVsKGV2ZW50LCBzbGlkZSwgZWxlbWVudEluZGV4KSB7CiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7CiAgICAgICAgY29uc3QgZGVsdGEgPSBldmVudC5kZWx0YVkgPCAwID8gMC4xMiA6IC0wLjEyOwogICAgICAgIHRoaXMuem9vbUNoYXJ0KHNsaWRlLCBlbGVtZW50SW5kZXgsIGRlbHRhKTsKICAgICAgfSwKCiAgICAgIHN0YXJ0Q2hhcnRQYW4oZXZlbnQpIHsKICAgICAgICBjb25zdCB3cmFwcGVyID0KICAgICAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQgfHwKICAgICAgICAgIChldmVudC50YXJnZXQgJiYKICAgICAgICAgICAgdHlwZW9mIGV2ZW50LnRhcmdldC5jbG9zZXN0ID09PSAiZnVuY3Rpb24iICYmCiAgICAgICAgICAgIGV2ZW50LnRhcmdldC5jbG9zZXN0KCIucnMtY2hhcnQtem9vbSIpKTsKICAgICAgICBjb25zdCBrZXkgPSB3cmFwcGVyICYmIHdyYXBwZXIuZGF0YXNldC5jaGFydEtleTsKICAgICAgICBpZiAoIWtleSkgcmV0dXJuOwoKICAgICAgICBjb25zdCB6b29tID0gdGhpcy5jaGFydFpvb21ba2V5XSB8fCAxOwogICAgICAgIGlmICh6b29tIDw9IDEgfHwgZXZlbnQuYnV0dG9uICE9PSAwKSByZXR1cm47CgogICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7CiAgICAgICAgdGhpcy5zdG9wQ2hhcnRQYW4oKTsKCiAgICAgICAgY29uc3QgcGFuID0gdGhpcy5jaGFydFBhbltrZXldIHx8IHsgeDogMCwgeTogMCB9OwogICAgICAgIHRoaXMuY2hhcnRQYW5TdGF0ZSA9IHsKICAgICAgICAgIGtleSwKICAgICAgICAgIHN0YXJ0WDogZXZlbnQuY2xpZW50WCwKICAgICAgICAgIHN0YXJ0WTogZXZlbnQuY2xpZW50WSwKICAgICAgICAgIG9yaWdpblg6IHBhbi54LAogICAgICAgICAgb3JpZ2luWTogcGFuLnksCiAgICAgICAgfTsKCiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoInBvaW50ZXJtb3ZlIiwgdGhpcy5oYW5kbGVDaGFydFBhbk1vdmUpOwogICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCJwb2ludGVydXAiLCB0aGlzLnN0b3BDaGFydFBhbik7CiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoInBvaW50ZXJjYW5jZWwiLCB0aGlzLnN0b3BDaGFydFBhbik7CiAgICAgIH0sCgogICAgICBoYW5kbGVDaGFydFBhbk1vdmUoZXZlbnQpIHsKICAgICAgICBjb25zdCBzdGF0ZSA9IHRoaXMuY2hhcnRQYW5TdGF0ZTsKICAgICAgICBpZiAoIXN0YXRlKSByZXR1cm47CiAgICAgICAgdGhpcy5jaGFydFBhbiA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuY2hhcnRQYW4sIHsKICAgICAgICAgIFtzdGF0ZS5rZXldOiB7CiAgICAgICAgICAgIHg6IHN0YXRlLm9yaWdpblggKyBldmVudC5jbGllbnRYIC0gc3RhdGUuc3RhcnRYLAogICAgICAgICAgICB5OiBzdGF0ZS5vcmlnaW5ZICsgZXZlbnQuY2xpZW50WSAtIHN0YXRlLnN0YXJ0WSwKICAgICAgICAgIH0sCiAgICAgICAgfSk7CiAgICAgIH0sCgogICAgICBzdG9wQ2hhcnRQYW4oKSB7CiAgICAgICAgdGhpcy5jaGFydFBhblN0YXRlID0gbnVsbDsKICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigicG9pbnRlcm1vdmUiLCB0aGlzLmhhbmRsZUNoYXJ0UGFuTW92ZSk7CiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoInBvaW50ZXJ1cCIsIHRoaXMuc3RvcENoYXJ0UGFuKTsKICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigicG9pbnRlcmNhbmNlbCIsIHRoaXMuc3RvcENoYXJ0UGFuKTsKICAgICAgfSwKCiAgICAgIGlzQ2hhcnRVbmF2YWlsYWJsZShzbGlkZSwgZWxlbWVudEluZGV4LCBlbGVtZW50KSB7CiAgICAgICAgaWYgKHRoaXMuaXNDaGFydExpYnJhcnlQZW5kaW5nKGVsZW1lbnQpKSByZXR1cm4gdHJ1ZTsKICAgICAgICByZXR1cm4gQm9vbGVhbigKICAgICAgICAgIHRoaXMuY2hhcnRGYWlsdXJlc1t0aGlzLmNoYXJ0S2V5KHNsaWRlLCBlbGVtZW50SW5kZXgpXQogICAgICAgICk7CiAgICAgIH0sCgogICAgICBpc0NoYXJ0TGlicmFyeVBlbmRpbmcoZWxlbWVudCkgewogICAgICAgIGlmICghZWxlbWVudCB8fCBlbGVtZW50LnR5cGUgIT09ICJjaGFydCIpIHJldHVybiBmYWxzZTsKICAgICAgICBpZiAoZWxlbWVudC5jaGFydFR5cGUgPT09ICJjaGFydGpzIikgcmV0dXJuICF0aGlzLkNoYXJ0OwogICAgICAgIGlmIChlbGVtZW50LmNoYXJ0VHlwZSA9PT0gIm1lcm1haWQiKSByZXR1cm4gIXRoaXMubWVybWFpZDsKICAgICAgICByZXR1cm4gZmFsc2U7CiAgICAgIH0sCgogICAgICByZW5kZXJDdXJyZW50U2xpZGUoKSB7CiAgICAgICAgY29uc3QgY3VycmVudFNsaWRlID0gdGhpcy5nZXRDdXJyZW50U2xpZGVFbGVtZW50KCk7CiAgICAgICAgaWYgKCFjdXJyZW50U2xpZGUpIHJldHVybjsKICAgICAgICB0aGlzLnJlbmRlckVsZW1lbnRzKAogICAgICAgICAgInJldmVhbCIsCiAgICAgICAgICBjdXJyZW50U2xpZGUuZ2V0QXR0cmlidXRlKCJkYXRhLXNsaWRlLWlkIikKICAgICAgICApOwogICAgICB9LAoKICAgICAgZ29Ub1NsaWRlKGluZGV4KSB7CiAgICAgICAgaWYgKCF0aGlzLmlzUHJlc2VudGF0aW9uIHx8ICF0aGlzLnRvdGFsU2xpZGVzKSByZXR1cm47CiAgICAgICAgY29uc3QgbmV4dEluZGV4ID0gTWF0aC5tYXgoCiAgICAgICAgICAwLAogICAgICAgICAgTWF0aC5taW4odGhpcy50b3RhbFNsaWRlcyAtIDEsIGluZGV4KQogICAgICAgICk7CiAgICAgICAgaWYgKG5leHRJbmRleCA9PT0gdGhpcy5jdXJyZW50U2xpZGVJbmRleCkgcmV0dXJuOwogICAgICAgIHRoaXMuY3VycmVudFNsaWRlSW5kZXggPSBuZXh0SW5kZXg7CiAgICAgICAgdGhpcy5zY2hlZHVsZVRvb2xiYXJIaWRlKCk7CiAgICAgICAgdGhpcy5zaG93Q3VycmVudFNsaWRlKCk7CiAgICAgIH0sCgogICAgICAvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KICAgICAgICAg5pS+5pig5o6n5Yi2CiAgICAgICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqLwogICAgICBsb2NrQm9keVNjcm9sbCgpIHsKICAgICAgICB0aGlzLmJvZHlPdmVyZmxvdyA9IGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgfHwgIiI7CiAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICJoaWRkZW4iOwogICAgICB9LAoKICAgICAgdW5sb2NrQm9keVNjcm9sbCgpIHsKICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gdGhpcy5ib2R5T3ZlcmZsb3cgfHwgIiI7CiAgICAgICAgdGhpcy5ib2R5T3ZlcmZsb3cgPSAiIjsKICAgICAgfSwKCiAgICAgIGJpbmRFdmVudHMoKSB7CiAgICAgICAgaWYgKHRoaXMuZXZlbnRzQm91bmQpIHJldHVybjsKICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigia2V5ZG93biIsIHRoaXMuaGFuZGxlS2V5RG93bik7CiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoInJlc2l6ZSIsIHRoaXMuaGFuZGxlQ2hhcnRSZXNpemUpOwogICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCJtb3VzZW1vdmUiLCB0aGlzLmhhbmRsZU1vdXNlTW92ZSk7CiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoIm1vdXNlb3V0IiwgdGhpcy5oYW5kbGVXaW5kb3dNb3VzZU91dCk7CiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoInRvdWNoc3RhcnQiLCB0aGlzLmhhbmRsZVRvdWNoU3RhcnQsIHsKICAgICAgICAgIHBhc3NpdmU6IHRydWUsCiAgICAgICAgfSk7CiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoInRvdWNoZW5kIiwgdGhpcy5oYW5kbGVUb3VjaEVuZCwgewogICAgICAgICAgcGFzc2l2ZTogdHJ1ZSwKICAgICAgICB9KTsKICAgICAgICB0aGlzLmV2ZW50c0JvdW5kID0gdHJ1ZTsKICAgICAgfSwKCiAgICAgIHVuYmluZEV2ZW50cygpIHsKICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigia2V5ZG93biIsIHRoaXMuaGFuZGxlS2V5RG93bik7CiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoInJlc2l6ZSIsIHRoaXMuaGFuZGxlQ2hhcnRSZXNpemUpOwogICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCJtb3VzZW1vdmUiLCB0aGlzLmhhbmRsZU1vdXNlTW92ZSk7CiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoIm1vdXNlb3V0IiwgdGhpcy5oYW5kbGVXaW5kb3dNb3VzZU91dCk7CiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoInRvdWNoc3RhcnQiLCB0aGlzLmhhbmRsZVRvdWNoU3RhcnQpOwogICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCJ0b3VjaGVuZCIsIHRoaXMuaGFuZGxlVG91Y2hFbmQpOwogICAgICAgIHRoaXMuZXZlbnRzQm91bmQgPSBmYWxzZTsKICAgICAgfSwKCiAgICAgIG9wZW5TbGlkZUF0KGluZGV4KSB7CiAgICAgICAgdGhpcy5lbnRlclByZXNlbnRhdGlvbihpbmRleCk7CiAgICAgIH0sCgogICAgICBlbnRlclByZXNlbnRhdGlvbihzdGFydEluZGV4KSB7CiAgICAgICAgaWYgKHRoaXMuaXNQcmVzZW50YXRpb24gfHwgIXRoaXMudG90YWxTbGlkZXMpIHJldHVybjsKCiAgICAgICAgdGhpcy51cGRhdGVTdGFnZVNjYWxlKCk7CiAgICAgICAgdGhpcy5jaGFydEZhaWx1cmVzID0ge307CiAgICAgICAgdGhpcy5zdG9wQ2hhcnRQYW4oKTsKICAgICAgICB0aGlzLmNoYXJ0Wm9vbSA9IHt9OwogICAgICAgIHRoaXMuY2hhcnRQYW4gPSB7fTsKICAgICAgICB0aGlzLmRpYWdyYW1SYXRpb3MgPSB7fTsKICAgICAgICB0aGlzLmlzUHJlc2VudGF0aW9uID0gdHJ1ZTsKICAgICAgICB0aGlzLnRvb2xiYXJJZGxlID0gdHJ1ZTsKICAgICAgICB0aGlzLmN1cnJlbnRTbGlkZUluZGV4ID0gTWF0aC5tYXgoCiAgICAgICAgICAwLAogICAgICAgICAgTWF0aC5taW4oCiAgICAgICAgICAgIHRoaXMudG90YWxTbGlkZXMgLSAxLAogICAgICAgICAgICB0eXBlb2Ygc3RhcnRJbmRleCA9PT0gIm51bWJlciIgPyBzdGFydEluZGV4IDogMAogICAgICAgICAgKQogICAgICAgICk7CgogICAgICAgIHRoaXMubG9ja0JvZHlTY3JvbGwoKTsKICAgICAgICB0aGlzLmJpbmRFdmVudHMoKTsKCiAgICAgICAgdGhpcy4kbmV4dFRpY2soKCkgPT4gewogICAgICAgICAgaWYgKCF0aGlzLmlzUHJlc2VudGF0aW9uKSByZXR1cm47CiAgICAgICAgICB0aGlzLnVwZGF0ZVN0YWdlU2NhbGUoKTsKICAgICAgICAgIHRoaXMuc2hvd0N1cnJlbnRTbGlkZSgpOwoKICAgICAgICAgIGlmICh0eXBlb2YgUmVzaXplT2JzZXJ2ZXIgIT09ICJ1bmRlZmluZWQiICYmIHRoaXMuJGVsKSB7CiAgICAgICAgICAgIGlmICh0aGlzLnN0YWdlUmVzaXplT2JzZXJ2ZXIpIHsKICAgICAgICAgICAgICB0aGlzLnN0YWdlUmVzaXplT2JzZXJ2ZXIuZGlzY29ubmVjdCgpOwogICAgICAgICAgICB9CiAgICAgICAgICAgIGNvbnN0IHN0YWdlID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcigiLnB2LXN0YWdlIik7CiAgICAgICAgICAgIGlmIChzdGFnZSkgewogICAgICAgICAgICAgIHRoaXMuc3RhZ2VSZXNpemVPYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcigoKSA9PiB7CiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVN0YWdlU2NhbGUoKTsKICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlQ2hhcnRSZXNpemUoKTsKICAgICAgICAgICAgICB9KTsKICAgICAgICAgICAgICB0aGlzLnN0YWdlUmVzaXplT2JzZXJ2ZXIub2JzZXJ2ZShzdGFnZSk7CiAgICAgICAgICAgIH0KICAgICAgICAgIH0KCiAgICAgICAgICB0aGlzLmluaXRSZXF1aXJlZExpYnJhcmllcygpLnRoZW4oKCkgPT4gewogICAgICAgICAgICBpZiAoIXRoaXMuaXNQcmVzZW50YXRpb24pIHJldHVybjsKICAgICAgICAgICAgdGhpcy4kbmV4dFRpY2soKCkgPT4gewogICAgICAgICAgICAgIGlmICghdGhpcy5pc1ByZXNlbnRhdGlvbikgcmV0dXJuOwogICAgICAgICAgICAgIHRoaXMucmVuZGVyQ3VycmVudFNsaWRlKCk7CiAgICAgICAgICAgIH0pOwogICAgICAgICAgfSk7CiAgICAgICAgfSk7CiAgICAgIH0sCgogICAgICBleGl0UHJlc2VudGF0aW9uKCkgewogICAgICAgIGlmICghdGhpcy5pc1ByZXNlbnRhdGlvbikgcmV0dXJuOwoKICAgICAgICB0aGlzLmlzUHJlc2VudGF0aW9uID0gZmFsc2U7CiAgICAgICAgdGhpcy50b29sYmFySWRsZSA9IGZhbHNlOwogICAgICAgIHRoaXMudW5iaW5kRXZlbnRzKCk7CiAgICAgICAgdGhpcy51bmxvY2tCb2R5U2Nyb2xsKCk7CgogICAgICAgIGlmICh0aGlzLnRvb2xiYXJUaW1lcikgewogICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudG9vbGJhclRpbWVyKTsKICAgICAgICAgIHRoaXMudG9vbGJhclRpbWVyID0gbnVsbDsKICAgICAgICB9CiAgICAgICAgaWYgKHRoaXMuYW5pbWF0aW9uVGltZXIpIHsKICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmFuaW1hdGlvblRpbWVyKTsKICAgICAgICAgIHRoaXMuYW5pbWF0aW9uVGltZXIgPSBudWxsOwogICAgICAgIH0KICAgICAgICBpZiAodGhpcy52aXNpYmlsaXR5VGltZXIpIHsKICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnZpc2liaWxpdHlUaW1lcik7CiAgICAgICAgICB0aGlzLnZpc2liaWxpdHlUaW1lciA9IG51bGw7CiAgICAgICAgfQogICAgICAgIGlmICh0aGlzLnJlc2l6ZUZyYW1lKSB7CiAgICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLnJlc2l6ZUZyYW1lKTsKICAgICAgICAgIHRoaXMucmVzaXplRnJhbWUgPSBudWxsOwogICAgICAgIH0KCiAgICAgICAgY29uc3Qgc2xpZGVzID0gdGhpcy5nZXRTbGlkZUVsZW1lbnRzKCk7CiAgICAgICAgc2xpZGVzLmZvckVhY2goKHNsaWRlKSA9PiB7CiAgICAgICAgICBzbGlkZS5jbGFzc0xpc3QucmVtb3ZlKAogICAgICAgICAgICAiaXMtY3VycmVudCIsCiAgICAgICAgICAgICJycy1hbmltLWFjdGl2ZSIsCiAgICAgICAgICAgICJycy1hbmltLWZhbGxiYWNrIgogICAgICAgICAgKTsKICAgICAgICAgIHNsaWRlLnNldEF0dHJpYnV0ZSgiYXJpYS1oaWRkZW4iLCAidHJ1ZSIpOwogICAgICAgIH0pOwoKICAgICAgICB0aGlzLnN0b3BDaGFydFBhbigpOwogICAgICAgIGlmICh0aGlzLnN0YWdlUmVzaXplT2JzZXJ2ZXIpIHsKICAgICAgICAgIHRoaXMuc3RhZ2VSZXNpemVPYnNlcnZlci5kaXNjb25uZWN0KCk7CiAgICAgICAgICB0aGlzLnN0YWdlUmVzaXplT2JzZXJ2ZXIgPSBudWxsOwogICAgICAgIH0KICAgICAgICB0aGlzLmRpc3Bvc2VBbGxDaGFydHMoKTsKICAgICAgICB0aGlzLmNoYXJ0RmFpbHVyZXMgPSB7fTsKICAgICAgICB0aGlzLmNoYXJ0Wm9vbSA9IHt9OwogICAgICAgIHRoaXMuY2hhcnRQYW4gPSB7fTsKICAgICAgICB0aGlzLmRpYWdyYW1SYXRpb3MgPSB7fTsKICAgICAgICB0aGlzLmN1cnJlbnRTbGlkZUluZGV4ID0gMDsKICAgICAgfSwKCiAgICAgIGhhbmRsZUNoYXJ0UmVzaXplKCkgewogICAgICAgIGlmICh0aGlzLnJlc2l6ZUZyYW1lKSBjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLnJlc2l6ZUZyYW1lKTsKICAgICAgICB0aGlzLnJlc2l6ZUZyYW1lID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHsKICAgICAgICAgIHRoaXMucmVzaXplRnJhbWUgPSBudWxsOwogICAgICAgICAgdGhpcy51cGRhdGVTdGFnZVNjYWxlKCk7CiAgICAgICAgICBPYmplY3Qua2V5cyh0aGlzLmNoYXJ0SW5zdGFuY2VzKS5mb3JFYWNoKChrZXkpID0+IHsKICAgICAgICAgICAgY29uc3QgY2hhcnQgPSB0aGlzLmNoYXJ0SW5zdGFuY2VzW2tleV07CiAgICAgICAgICAgIGlmIChjaGFydCAmJiB0eXBlb2YgY2hhcnQucmVzaXplID09PSAiZnVuY3Rpb24iKSB7CiAgICAgICAgICAgICAgY2hhcnQucmVzaXplKCk7CiAgICAgICAgICAgIH0KICAgICAgICAgIH0pOwogICAgICAgIH0pOwogICAgICB9LAoKICAgICAgaGFuZGxlS2V5RG93bihldmVudCkgewogICAgICAgIHRoaXMuc2NoZWR1bGVUb29sYmFySGlkZSgpOwogICAgICAgIGlmICghdGhpcy5pc1ByZXNlbnRhdGlvbikgcmV0dXJuOwoKICAgICAgICBjb25zdCBrZXkgPSBldmVudC5rZXk7CiAgICAgICAgaWYgKGtleSA9PT0gIkVzY2FwZSIpIHsKICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7CiAgICAgICAgICB0aGlzLmV4aXRQcmVzZW50YXRpb24oKTsKICAgICAgICAgIHJldHVybjsKICAgICAgICB9CiAgICAgICAgaWYgKAogICAgICAgICAga2V5ID09PSAiQXJyb3dSaWdodCIgfHwKICAgICAgICAgIGtleSA9PT0gIkFycm93RG93biIgfHwKICAgICAgICAgIGtleSA9PT0gIlBhZ2VEb3duIiB8fAogICAgICAgICAga2V5ID09PSAiICIgfHwKICAgICAgICAgIGtleSA9PT0gIlNwYWNlYmFyIgogICAgICAgICkgewogICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTsKICAgICAgICAgIHRoaXMubmV4dFNsaWRlKCk7CiAgICAgICAgICByZXR1cm47CiAgICAgICAgfQogICAgICAgIGlmICgKICAgICAgICAgIGtleSA9PT0gIkFycm93TGVmdCIgfHwKICAgICAgICAgIGtleSA9PT0gIkFycm93VXAiIHx8CiAgICAgICAgICBrZXkgPT09ICJQYWdlVXAiCiAgICAgICAgKSB7CiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpOwogICAgICAgICAgdGhpcy5wcmV2U2xpZGUoKTsKICAgICAgICAgIHJldHVybjsKICAgICAgICB9CiAgICAgICAgaWYgKGtleSA9PT0gIkhvbWUiKSB7CiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpOwogICAgICAgICAgdGhpcy5nb1RvU2xpZGUoMCk7CiAgICAgICAgICByZXR1cm47CiAgICAgICAgfQogICAgICAgIGlmIChrZXkgPT09ICJFbmQiKSB7CiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpOwogICAgICAgICAgdGhpcy5nb1RvU2xpZGUodGhpcy50b3RhbFNsaWRlcyAtIDEpOwogICAgICAgIH0KICAgICAgfSwKCiAgICAgIGhhbmRsZU1vdXNlTW92ZShldmVudCkgewogICAgICAgIGlmICghdGhpcy5pc1ByZXNlbnRhdGlvbikgcmV0dXJuOwoKICAgICAgICBjb25zdCB0YXJnZXQgPSBldmVudC50YXJnZXQ7CiAgICAgICAgY29uc3Qgb3ZlclRvb2xiYXIgPQogICAgICAgICAgdGFyZ2V0ICYmIHR5cGVvZiB0YXJnZXQuY2xvc2VzdCA9PT0gImZ1bmN0aW9uIgogICAgICAgICAgICA/IHRhcmdldC5jbG9zZXN0KCIucHYtdG9vbGJhciIpCiAgICAgICAgICAgIDogbnVsbDsKICAgICAgICBpZiAob3ZlclRvb2xiYXIpIHsKICAgICAgICAgIHRoaXMuc2hvd1Rvb2xiYXIoKTsKICAgICAgICAgIHJldHVybjsKICAgICAgICB9CgogICAgICAgIGNvbnN0IGN1cnJlbnRTbGlkZSA9IHRoaXMuZ2V0Q3VycmVudFNsaWRlRWxlbWVudCgpOwogICAgICAgIGlmICghY3VycmVudFNsaWRlKSB7CiAgICAgICAgICB0aGlzLmhpZGVUb29sYmFyKCk7CiAgICAgICAgICByZXR1cm47CiAgICAgICAgfQogICAgICAgIGNvbnN0IHJlY3QgPSBjdXJyZW50U2xpZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7CiAgICAgICAgY29uc3QgaW5zaWRlU2xpZGUgPQogICAgICAgICAgZXZlbnQuY2xpZW50WCA+PSByZWN0LmxlZnQgJiYKICAgICAgICAgIGV2ZW50LmNsaWVudFggPD0gcmVjdC5yaWdodCAmJgogICAgICAgICAgZXZlbnQuY2xpZW50WSA+PSByZWN0LnRvcCAmJgogICAgICAgICAgZXZlbnQuY2xpZW50WSA8PSByZWN0LmJvdHRvbTsKCiAgICAgICAgY29uc3QgdG9vbGJhciA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoIi5wdi10b29sYmFyIik7CiAgICAgICAgY29uc3QgdG9vbGJhclJlY3QgPSB0b29sYmFyID8gdG9vbGJhci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSA6IG51bGw7CiAgICAgICAgY29uc3QgdG9wWm9uZUJvdHRvbSA9IE1hdGgubWF4KAogICAgICAgICAgOTYsCiAgICAgICAgICB0b29sYmFyUmVjdCA/IHRvb2xiYXJSZWN0LmJvdHRvbSArIDE4IDogOTYKICAgICAgICApOwogICAgICAgIGNvbnN0IGluc2lkZVRvcFpvbmUgPQogICAgICAgICAgZXZlbnQuY2xpZW50WSA+PSAwICYmIGV2ZW50LmNsaWVudFkgPD0gdG9wWm9uZUJvdHRvbTsKCiAgICAgICAgaWYgKGluc2lkZVNsaWRlIHx8IGluc2lkZVRvcFpvbmUpIHsKICAgICAgICAgIHRoaXMuc2hvd1Rvb2xiYXIoKTsKICAgICAgICB9IGVsc2UgewogICAgICAgICAgdGhpcy5oaWRlVG9vbGJhcigpOwogICAgICAgIH0KICAgICAgfSwKCiAgICAgIGhhbmRsZVdpbmRvd01vdXNlT3V0KGV2ZW50KSB7CiAgICAgICAgaWYgKCFldmVudC5yZWxhdGVkVGFyZ2V0ICYmICFldmVudC50b0VsZW1lbnQpIHsKICAgICAgICAgIHRoaXMuaGlkZVRvb2xiYXIoKTsKICAgICAgICB9CiAgICAgIH0sCgogICAgICBoYW5kbGVUb3VjaFN0YXJ0KGV2ZW50KSB7CiAgICAgICAgdGhpcy5zY2hlZHVsZVRvb2xiYXJIaWRlKCk7CiAgICAgICAgaWYgKCF0aGlzLmlzUHJlc2VudGF0aW9uIHx8ICFldmVudC50b3VjaGVzIHx8ICFldmVudC50b3VjaGVzLmxlbmd0aCkgewogICAgICAgICAgcmV0dXJuOwogICAgICAgIH0KICAgICAgICBjb25zdCB0b3VjaCA9IGV2ZW50LnRvdWNoZXNbMF07CiAgICAgICAgdGhpcy50b3VjaFN0YXJ0WCA9IHRvdWNoLmNsaWVudFg7CiAgICAgICAgdGhpcy50b3VjaFN0YXJ0WSA9IHRvdWNoLmNsaWVudFk7CiAgICAgICAgdGhpcy50b3VjaFN0YXJ0VGltZSA9IERhdGUubm93KCk7CgogICAgICAgIHRoaXMudG91Y2hTdGFydEluWm9vbWVkQ2hhcnQgPSBmYWxzZTsKICAgICAgICBjb25zdCB0YXJnZXQgPSBldmVudC50YXJnZXQ7CiAgICAgICAgY29uc3Qgem9vbUVsZW1lbnQgPQogICAgICAgICAgdGFyZ2V0ICYmIHR5cGVvZiB0YXJnZXQuY2xvc2VzdCA9PT0gImZ1bmN0aW9uIgogICAgICAgICAgICA/IHRhcmdldC5jbG9zZXN0KCIucnMtY2hhcnQtem9vbSIpCiAgICAgICAgICAgIDogbnVsbDsKICAgICAgICBpZiAoem9vbUVsZW1lbnQgJiYgem9vbUVsZW1lbnQuZGF0YXNldC5jaGFydEtleSkgewogICAgICAgICAgdGhpcy50b3VjaFN0YXJ0SW5ab29tZWRDaGFydCA9CiAgICAgICAgICAgICh0aGlzLmNoYXJ0Wm9vbVt6b29tRWxlbWVudC5kYXRhc2V0LmNoYXJ0S2V5XSB8fCAxKSA+IDE7CiAgICAgICAgfQogICAgICB9LAoKICAgICAgaGFuZGxlVG91Y2hFbmQoZXZlbnQpIHsKICAgICAgICBpZiAoIXRoaXMuaXNQcmVzZW50YXRpb24pIHJldHVybjsKICAgICAgICBjb25zdCB3YXNQYW5uaW5nWm9vbWVkQ2hhcnQgPSB0aGlzLnRvdWNoU3RhcnRJblpvb21lZENoYXJ0OwogICAgICAgIHRoaXMudG91Y2hTdGFydEluWm9vbWVkQ2hhcnQgPSBmYWxzZTsKICAgICAgICBpZiAod2FzUGFubmluZ1pvb21lZENoYXJ0KSB7CiAgICAgICAgICB0aGlzLnNjaGVkdWxlVG9vbGJhckhpZGUoKTsKICAgICAgICAgIHJldHVybjsKICAgICAgICB9CiAgICAgICAgY29uc3QgdG91Y2ggPQogICAgICAgICAgZXZlbnQuY2hhbmdlZFRvdWNoZXMgJiYgZXZlbnQuY2hhbmdlZFRvdWNoZXMubGVuZ3RoCiAgICAgICAgICAgID8gZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0KICAgICAgICAgICAgOiBudWxsOwogICAgICAgIGlmICghdG91Y2gpIHJldHVybjsKCiAgICAgICAgY29uc3QgZGVsdGFYID0gdG91Y2guY2xpZW50WCAtIHRoaXMudG91Y2hTdGFydFg7CiAgICAgICAgY29uc3QgZGVsdGFZID0gdG91Y2guY2xpZW50WSAtIHRoaXMudG91Y2hTdGFydFk7CiAgICAgICAgY29uc3QgZWxhcHNlZCA9IERhdGUubm93KCkgLSB0aGlzLnRvdWNoU3RhcnRUaW1lOwogICAgICAgIGlmICgKICAgICAgICAgIGVsYXBzZWQgPCA5MDAgJiYKICAgICAgICAgIE1hdGguYWJzKGRlbHRhWCkgPiA0MiAmJgogICAgICAgICAgTWF0aC5hYnMoZGVsdGFYKSA+IE1hdGguYWJzKGRlbHRhWSkgKiAxLjIKICAgICAgICApIHsKICAgICAgICAgIGlmIChkZWx0YVggPCAwKSB0aGlzLm5leHRTbGlkZSgpOwogICAgICAgICAgZWxzZSB0aGlzLnByZXZTbGlkZSgpOwogICAgICAgIH0KICAgICAgICB0aGlzLnNjaGVkdWxlVG9vbGJhckhpZGUoKTsKICAgICAgfSwKCiAgICAgIHNob3dUb29sYmFyKCkgewogICAgICAgIGlmICh0aGlzLnRvb2xiYXJUaW1lcikgewogICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudG9vbGJhclRpbWVyKTsKICAgICAgICAgIHRoaXMudG9vbGJhclRpbWVyID0gbnVsbDsKICAgICAgICB9CiAgICAgICAgdGhpcy50b29sYmFySWRsZSA9IGZhbHNlOwogICAgICB9LAoKICAgICAgaGlkZVRvb2xiYXIoKSB7CiAgICAgICAgaWYgKHRoaXMudG9vbGJhclRpbWVyKSB7CiAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50b29sYmFyVGltZXIpOwogICAgICAgICAgdGhpcy50b29sYmFyVGltZXIgPSBudWxsOwogICAgICAgIH0KICAgICAgICB0aGlzLnRvb2xiYXJJZGxlID0gdHJ1ZTsKICAgICAgfSwKCiAgICAgIHNjaGVkdWxlVG9vbGJhckhpZGUoKSB7CiAgICAgICAgdGhpcy5zaG93VG9vbGJhcigpOwogICAgICAgIHRoaXMudG9vbGJhclRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7CiAgICAgICAgICB0aGlzLnRvb2xiYXJJZGxlID0gdHJ1ZTsKICAgICAgICAgIHRoaXMudG9vbGJhclRpbWVyID0gbnVsbDsKICAgICAgICB9LCAyNjAwKTsKICAgICAgfSwKCiAgICAgIHByZXZTbGlkZSgpIHsKICAgICAgICB0aGlzLnNob3dUb29sYmFyKCk7CiAgICAgICAgdGhpcy5nb1RvU2xpZGUodGhpcy5jdXJyZW50U2xpZGVJbmRleCAtIDEpOwogICAgICB9LAoKICAgICAgbmV4dFNsaWRlKCkgewogICAgICAgIHRoaXMuc2hvd1Rvb2xiYXIoKTsKICAgICAgICB0aGlzLmdvVG9TbGlkZSh0aGlzLmN1cnJlbnRTbGlkZUluZGV4ICsgMSk7CiAgICAgIH0sCgogICAgICBkaXNwb3NlQWxsQ2hhcnRzKCkgewogICAgICAgIE9iamVjdC5rZXlzKHRoaXMuY2hhcnRJbnN0YW5jZXMpLmZvckVhY2goKGtleSkgPT4gewogICAgICAgICAgdHJ5IHsKICAgICAgICAgICAgdGhpcy5jaGFydEluc3RhbmNlc1trZXldLmRlc3Ryb3koKTsKICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7CiAgICAgICAgICAgIC8qIG5vb3AgKi8KICAgICAgICAgIH0KICAgICAgICAgIGRlbGV0ZSB0aGlzLmNoYXJ0SW5zdGFuY2VzW2tleV07CiAgICAgICAgfSk7CiAgICAgICAgdGhpcy5jaGFydEluc3RhbmNlcyA9IHt9OwogICAgICB9LAoKICAgICAgY2xlYW51cFZpZXdlcigpIHsKICAgICAgICB0aGlzLnVuYmluZEV2ZW50cygpOwogICAgICAgIHRoaXMudW5sb2NrQm9keVNjcm9sbCgpOwoKICAgICAgICBpZiAodGhpcy50b29sYmFyVGltZXIpIHsKICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRvb2xiYXJUaW1lcik7CiAgICAgICAgICB0aGlzLnRvb2xiYXJUaW1lciA9IG51bGw7CiAgICAgICAgfQogICAgICAgIGlmICh0aGlzLmFuaW1hdGlvblRpbWVyKSB7CiAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5hbmltYXRpb25UaW1lcik7CiAgICAgICAgICB0aGlzLmFuaW1hdGlvblRpbWVyID0gbnVsbDsKICAgICAgICB9CiAgICAgICAgaWYgKHRoaXMudmlzaWJpbGl0eVRpbWVyKSB7CiAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy52aXNpYmlsaXR5VGltZXIpOwogICAgICAgICAgdGhpcy52aXNpYmlsaXR5VGltZXIgPSBudWxsOwogICAgICAgIH0KICAgICAgICBpZiAodGhpcy5yZXNpemVGcmFtZSkgewogICAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5yZXNpemVGcmFtZSk7CiAgICAgICAgICB0aGlzLnJlc2l6ZUZyYW1lID0gbnVsbDsKICAgICAgICB9CgogICAgICAgIHRoaXMuc3RvcENoYXJ0UGFuKCk7CiAgICAgICAgaWYgKHRoaXMuc3RhZ2VSZXNpemVPYnNlcnZlcikgewogICAgICAgICAgdGhpcy5zdGFnZVJlc2l6ZU9ic2VydmVyLmRpc2Nvbm5lY3QoKTsKICAgICAgICAgIHRoaXMuc3RhZ2VSZXNpemVPYnNlcnZlciA9IG51bGw7CiAgICAgICAgfQogICAgICAgIHRoaXMuZGlzcG9zZUFsbENoYXJ0cygpOwogICAgICAgIHRoaXMuY2hhcnRab29tID0ge307CiAgICAgICAgdGhpcy5jaGFydFBhbiA9IHt9OwogICAgICAgIHRoaXMuZGlhZ3JhbVJhdGlvcyA9IHt9OwogICAgICAgIHRoaXMuaXNQcmVzZW50YXRpb24gPSBmYWxzZTsKICAgICAgfSwKICAgIH0sCgogICAgYmVmb3JlVW5tb3VudCgpIHsKICAgICAgdGhpcy5jbGVhbnVwVmlld2VyKCk7CiAgICB9LAoKICAgIGJlZm9yZURlc3Ryb3koKSB7CiAgICAgIHRoaXMuY2xlYW51cFZpZXdlcigpOwogICAgfSwKICB9Owo8L3NjcmlwdD4KCjxzdHlsZSBzY29wZWQ+CiAgLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CiAgICAg6K6+6K6h5Luk54mMCiAgICAg5LiA5aWX5YWL5Yi255qE4oCc57yW6L6R6YOo56eR5oqA4oCd6KeG6KeJ77ya57q45oSf5bqV6Imy44CB5aKo6Imy5paH5a2X44CBCiAgICAg55S15YWJ6JOd5by66LCD44CB57uG57q/5YiG6ZqU44CB5YWF6Laz55WZ55m944CCCiAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovCiAgLnB2LXJvb3QgewogICAgLS1wdi1mb250LXNhbnM6ICJTRiBQcm8gRGlzcGxheSIsICJTRiBQcm8gVGV4dCIsIC1hcHBsZS1zeXN0ZW0sCiAgICAgIEJsaW5rTWFjU3lzdGVtRm9udCwgIlBpbmdGYW5nIFNDIiwgIkhpcmFnaW5vIFNhbnMgR0IiLCAiTm90byBTYW5zIFNDIiwKICAgICAgIk1pY3Jvc29mdCBZYUhlaSIsIHNhbnMtc2VyaWY7CiAgICAtLXB2LWZvbnQtbW9ubzogIlNGIE1vbm8iLCAiSmV0QnJhaW5zIE1vbm8iLCAiUm9ib3RvIE1vbm8iLCB1aS1tb25vc3BhY2UsCiAgICAgIFNGTW9uby1SZWd1bGFyLCBNZW5sbywgQ29uc29sYXMsIG1vbm9zcGFjZTsKCiAgICAtLXB2LWJyYW5kOiAjMGI1Y2ZmOwogICAgLS1wdi1icmFuZC1kZWVwOiAjMDY0N2M5OwogICAgLS1wdi1icmFuZC1zb2Z0OiAjZWRmNGZmOwogICAgLS1wdi1pbms6ICMwYzExMWE7CiAgICAtLXB2LXRleHQtMTogIzE3MWQyNzsKICAgIC0tcHYtdGV4dC0yOiAjNWI2NDcyOwogICAgLS1wdi10ZXh0LTM6ICM4Yjk0YTM7CiAgICAtLXB2LXBhZ2U6ICNlZWYxZjU7CiAgICAtLXB2LXBhcGVyOiAjZjdmOGZhOwogICAgLS1wdi1zdXJmYWNlOiAjZmZmZmZmOwogICAgLS1wdi1saW5lOiAjZTJlNmVjOwogICAgLS1wdi1saW5lLXN0cm9uZzogI2NmZDZlMDsKICAgIC0tcHYtZGFyazogIzBhMGQxMzsKCiAgICAtLXB2LXJhZGl1cy1zbTogOHB4OwogICAgLS1wdi1yYWRpdXMtbWQ6IDE0cHg7CiAgICAtLXB2LXJhZGl1cy1sZzogMjBweDsKICAgIC0tcHYtcmFkaXVzLXhsOiAyNnB4OwogICAgLS1wdi1lYXNlOiBjdWJpYy1iZXppZXIoMC4yMiwgMC42MSwgMC4zNiwgMSk7CgogICAgbWluLWhlaWdodDogMTAwdmg7CiAgICBtaW4taGVpZ2h0OiAxMDBkdmg7CiAgICBwYWRkaW5nOiBjbGFtcCgyMHB4LCAzLjR2dywgNDRweCkgY2xhbXAoMThweCwgNHZ3LCA1NnB4KSAxNnB4OwogICAgYm94LXNpemluZzogYm9yZGVyLWJveDsKICAgIG92ZXJmbG93LXg6IGhpZGRlbjsKICAgIGNvbG9yOiB2YXIoLS1wdi10ZXh0LTEpOwogICAgZm9udC1mYW1pbHk6IHZhcigtLXB2LWZvbnQtc2Fucyk7CiAgICAtd2Via2l0LWZvbnQtc21vb3RoaW5nOiBhbnRpYWxpYXNlZDsKICAgIC1tb3otb3N4LWZvbnQtc21vb3RoaW5nOiBncmF5c2NhbGU7CiAgICB0ZXh0LXJlbmRlcmluZzogb3B0aW1pemVMZWdpYmlsaXR5OwogICAgYmFja2dyb3VuZDoKICAgICAgcmFkaWFsLWdyYWRpZW50KAogICAgICAgIDEyMDBweCA2MjBweCBhdCA5MiUgLTEyJSwKICAgICAgICByZ2JhKDExLCA5MiwgMjU1LCAwLjA4KSwKICAgICAgICB0cmFuc3BhcmVudCA1OCUKICAgICAgKSwKICAgICAgbGluZWFyLWdyYWRpZW50KDE4MGRlZywgI2YzZjVmOSAwJSwgdmFyKC0tcHYtcGFnZSkgMTAwJSk7CiAgfQoKICAucHYtcm9vdCAqLAogIC5wdi1yb290ICo6OmJlZm9yZSwKICAucHYtcm9vdCAqOjphZnRlciB7CiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94OwogIH0KCiAgLnB2LXJvb3QgYnV0dG9uIHsKICAgIGZvbnQ6IGluaGVyaXQ7CiAgfQoKICAucHYtY29udGFpbmVyIHsKICAgIHdpZHRoOiAxMDAlOwogICAgbWF4LXdpZHRoOiAxMjQwcHg7CiAgICBtYXJnaW46IDAgYXV0bzsKICB9CgogIC8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogICAgIOa8lOekuuaWh+eov+WktOmDqAogICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqLwogIC5wdi1oZWFkZXIgewogICAgZGlzcGxheTogZmxleDsKICAgIGFsaWduLWl0ZW1zOiBmbGV4LWVuZDsKICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsKICAgIGdhcDogMzJweDsKICAgIHBhZGRpbmc6IDhweCAwIDMwcHg7CiAgfQoKICAucHYtaGVhZGVyLWNvcHkgewogICAgbWluLXdpZHRoOiAwOwogIH0KCiAgLnB2LWtpY2tlciB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGdhcDogMTJweDsKICAgIG1hcmdpbi1ib3R0b206IDIwcHg7CiAgICBjb2xvcjogdmFyKC0tcHYtdGV4dC0zKTsKICAgIGZvbnQtZmFtaWx5OiB2YXIoLS1wdi1mb250LW1vbm8pOwogICAgZm9udC1zaXplOiAxMHB4OwogICAgZm9udC13ZWlnaHQ6IDUwMDsKICAgIGxldHRlci1zcGFjaW5nOiAwLjE2ZW07CiAgICBsaW5lLWhlaWdodDogMTsKICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7CiAgfQoKICAucHYta2lja2VyLWxpbmUgewogICAgd2lkdGg6IDMwcHg7CiAgICBoZWlnaHQ6IDFweDsKICAgIGJhY2tncm91bmQ6IHZhcigtLXB2LWJyYW5kKTsKICB9CgogIC5wdi1raWNrZXItY291bnQgewogICAgcGFkZGluZy1sZWZ0OiAxMnB4OwogICAgYm9yZGVyLWxlZnQ6IDFweCBzb2xpZCB2YXIoLS1wdi1saW5lLXN0cm9uZyk7CiAgICBjb2xvcjogdmFyKC0tcHYtdGV4dC0yKTsKICAgIGxldHRlci1zcGFjaW5nOiAwLjFlbTsKICB9CgogIC5wdi10aXRsZSB7CiAgICBtYXgtd2lkdGg6IDkwMHB4OwogICAgbWFyZ2luOiAwOwogICAgY29sb3I6IHZhcigtLXB2LWluayk7CiAgICBmb250LXNpemU6IGNsYW1wKDM0cHgsIDQuNHZ3LCA1NnB4KTsKICAgIGZvbnQtd2VpZ2h0OiA2NTA7CiAgICBsZXR0ZXItc3BhY2luZzogLTAuMDRlbTsKICAgIGxpbmUtaGVpZ2h0OiAxLjA4OwogICAgdGV4dC13cmFwOiBiYWxhbmNlOwogICAgb3ZlcmZsb3ctd3JhcDogYnJlYWstd29yZDsKICB9CgogIC5wdi1zdWJ0aXRsZSB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGdhcDogMTJweDsKICAgIG1hcmdpbjogMThweCAwIDA7CiAgICBjb2xvcjogdmFyKC0tcHYtdGV4dC0yKTsKICAgIGZvbnQtc2l6ZTogMTNweDsKICAgIGZvbnQtd2VpZ2h0OiA0NTA7CiAgICBsZXR0ZXItc3BhY2luZzogMC4wMWVtOwogIH0KCiAgLnB2LW1ldGEtZG90IHsKICAgIHdpZHRoOiAzcHg7CiAgICBoZWlnaHQ6IDNweDsKICAgIGJvcmRlci1yYWRpdXM6IDUwJTsKICAgIGJhY2tncm91bmQ6IHZhcigtLXB2LXRleHQtMyk7CiAgfQoKICAucHYtcGxheS1idG4gewogICAgZGlzcGxheTogaW5saW5lLWZsZXg7CiAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7CiAgICBnYXA6IDEwcHg7CiAgICBmbGV4LXNocmluazogMDsKICAgIG1pbi1oZWlnaHQ6IDUwcHg7CiAgICBwYWRkaW5nOiAwIDIycHg7CiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1wdi1pbmspOwogICAgYm9yZGVyLXJhZGl1czogOTk5cHg7CiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1wdi1pbmspOwogICAgY29sb3I6ICNmZmZmZmY7CiAgICBmb250LXNpemU6IDEzcHg7CiAgICBmb250LXdlaWdodDogNTUwOwogICAgbGV0dGVyLXNwYWNpbmc6IDAuMDFlbTsKICAgIGN1cnNvcjogcG9pbnRlcjsKICAgIGJveC1zaGFkb3c6IDAgMTJweCAzMHB4IC0xOHB4IHJnYmEoMTIsIDE3LCAyNiwgMC42NSk7CiAgICB0cmFuc2l0aW9uOgogICAgICBiYWNrZ3JvdW5kLWNvbG9yIDAuMjVzIHZhcigtLXB2LWVhc2UpLAogICAgICBib3JkZXItY29sb3IgMC4yNXMgdmFyKC0tcHYtZWFzZSksCiAgICAgIHRyYW5zZm9ybSAwLjI1cyB2YXIoLS1wdi1lYXNlKSwKICAgICAgYm94LXNoYWRvdyAwLjI1cyB2YXIoLS1wdi1lYXNlKTsKICB9CgogIC5wdi1wbGF5LWJ0bjpob3ZlciB7CiAgICBib3JkZXItY29sb3I6IHZhcigtLXB2LWJyYW5kKTsKICAgIGJhY2tncm91bmQ6IHZhcigtLXB2LWJyYW5kKTsKICAgIGJveC1zaGFkb3c6IDAgMTRweCAzNHB4IC0xNnB4IHJnYmEoMTEsIDkyLCAyNTUsIDAuNTUpOwogICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0xcHgpOwogIH0KCiAgLnB2LXBsYXktYnRuOmZvY3VzLXZpc2libGUgewogICAgb3V0bGluZTogMnB4IHNvbGlkIHZhcigtLXB2LWJyYW5kKTsKICAgIG91dGxpbmUtb2Zmc2V0OiAzcHg7CiAgfQoKICAucHYtcGxheS1pY29uIHsKICAgIHdpZHRoOiAxN3B4OwogICAgaGVpZ2h0OiAxN3B4OwogIH0KCiAgLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CiAgICAg5bm754Gv54mH57yp55Wl5Zu+572R5qC8CiAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovCiAgLnB2LWdyaWQgewogICAgZGlzcGxheTogZ3JpZDsKICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDMsIG1pbm1heCgwLCAxZnIpKTsKICAgIGdhcDogMjZweCAyNHB4OwogIH0KCiAgLnB2LWNvbnRhaW5lci0tZm91ciB7CiAgICBtYXgtd2lkdGg6IDEwMDBweDsKICB9CgogIEBtZWRpYSAobWluLXdpZHRoOiAxMDgxcHgpIHsKICAgIC5wdi1ncmlkLS1mb3VyIHsKICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoMiwgbWlubWF4KDAsIDFmcikpOwogICAgfQogIH0KCiAgLnB2LWNhcmQgewogICAgbWluLXdpZHRoOiAwOwogICAgY3Vyc29yOiBwb2ludGVyOwogICAgb3V0bGluZTogbm9uZTsKICB9CgogIC5wdi10aHVtYiB7CiAgICBwb3NpdGlvbjogcmVsYXRpdmU7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsKICAgIHdpZHRoOiAxMDAlOwogICAgYXNwZWN0LXJhdGlvOiAxNiAvIDk7CiAgICBwYWRkaW5nOiAxN3B4IDE5cHggMTRweDsKICAgIG92ZXJmbG93OiBoaWRkZW47CiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1wdi1saW5lKTsKICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLXB2LXJhZGl1cy1tZCk7CiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1wdi1zdXJmYWNlKTsKICAgIGJveC1zaGFkb3c6CiAgICAgIDAgMXB4IDJweCByZ2JhKDEyLCAxNywgMjYsIDAuMDMpLAogICAgICAwIDE4cHggNDBweCAtMzJweCByZ2JhKDEyLCAxNywgMjYsIDAuMjgpOwogICAgdHJhbnNpdGlvbjoKICAgICAgdHJhbnNmb3JtIDAuMzVzIHZhcigtLXB2LWVhc2UpLAogICAgICBib3gtc2hhZG93IDAuMzVzIHZhcigtLXB2LWVhc2UpLAogICAgICBib3JkZXItY29sb3IgMC4zNXMgdmFyKC0tcHYtZWFzZSk7CiAgfQoKICAucHYtY2FyZDpob3ZlciAucHYtdGh1bWIgewogICAgYm9yZGVyLWNvbG9yOiB2YXIoLS1wdi1saW5lLXN0cm9uZyk7CiAgICBib3gtc2hhZG93OgogICAgICAwIDJweCA0cHggcmdiYSgxMiwgMTcsIDI2LCAwLjA0KSwKICAgICAgMCAyNnB4IDU0cHggLTMwcHggcmdiYSgxMiwgMTcsIDI2LCAwLjM2KTsKICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtNHB4KTsKICB9CgogIC5wdi1jYXJkOmZvY3VzLXZpc2libGUgLnB2LXRodW1iIHsKICAgIG91dGxpbmU6IDJweCBzb2xpZCB2YXIoLS1wdi1icmFuZCk7CiAgICBvdXRsaW5lLW9mZnNldDogM3B4OwogIH0KCiAgLnB2LXRodW1iLS1jb250ZW50IHsKICAgIGJhY2tncm91bmQ6CiAgICAgIGxpbmVhci1ncmFkaWVudCgxODBkZWcsIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC45MiksIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC45OCkpLAogICAgICB2YXIoLS1wdi1zdXJmYWNlKTsKICB9CgogIC5wdi10aHVtYi1oZWFkIHsKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOwogICAgZ2FwOiAxMnB4OwogICAgZmxleC1zaHJpbms6IDA7CiAgICBjb2xvcjogdmFyKC0tcHYtdGV4dC0zKTsKICAgIGZvbnQtZmFtaWx5OiB2YXIoLS1wdi1mb250LW1vbm8pOwogICAgZm9udC1zaXplOiA3LjVweDsKICAgIGZvbnQtd2VpZ2h0OiA1MDA7CiAgICBsZXR0ZXItc3BhY2luZzogMC4xMmVtOwogICAgbGluZS1oZWlnaHQ6IDE7CiAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOwogIH0KCiAgLnB2LXRodW1iLWluZGV4IHsKICAgIGNvbG9yOiB2YXIoLS1wdi1icmFuZCk7CiAgICBmb250LXdlaWdodDogNjAwOwogIH0KCiAgLnB2LXRodW1iLWxhYmVsIHsKICAgIG92ZXJmbG93OiBoaWRkZW47CiAgICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpczsKICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7CiAgfQoKICAucHYtdGh1bWItdGl0bGUgewogICAgZGlzcGxheTogLXdlYmtpdC1ib3g7CiAgICBtYXgtd2lkdGg6IDk2JTsKICAgIG1hcmdpbjogOXB4IDAgMTBweDsKICAgIG92ZXJmbG93OiBoaWRkZW47CiAgICBjb2xvcjogdmFyKC0tcHYtaW5rKTsKICAgIGZvbnQtc2l6ZTogMTdweDsKICAgIGZvbnQtd2VpZ2h0OiA2MDA7CiAgICBsZXR0ZXItc3BhY2luZzogLTAuMDI1ZW07CiAgICBsaW5lLWhlaWdodDogMS4yNDsKICAgIC13ZWJraXQtYm94LW9yaWVudDogdmVydGljYWw7CiAgICAtd2Via2l0LWxpbmUtY2xhbXA6IDI7CiAgfQoKICAucHYtdGh1bWItYm9keSB7CiAgICBwb3NpdGlvbjogcmVsYXRpdmU7CiAgICBmbGV4OiAxOwogICAgbWluLWhlaWdodDogMDsKICAgIG92ZXJmbG93OiBoaWRkZW47CiAgfQoKICAucHYtdGh1bWItZm9vdCB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsKICAgIGdhcDogMTJweDsKICAgIGZsZXgtc2hyaW5rOiAwOwogICAgbWFyZ2luLXRvcDogOHB4OwogICAgcGFkZGluZy10b3A6IDdweDsKICAgIGJvcmRlci10b3A6IDFweCBzb2xpZCB2YXIoLS1wdi1saW5lKTsKICAgIGNvbG9yOiB2YXIoLS1wdi10ZXh0LTMpOwogICAgZm9udC1mYW1pbHk6IHZhcigtLXB2LWZvbnQtbW9ubyk7CiAgICBmb250LXNpemU6IDZweDsKICAgIGxldHRlci1zcGFjaW5nOiAwLjA2ZW07CiAgICBsaW5lLWhlaWdodDogMTsKICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7CiAgfQoKICAvKiDnvKnnlaXlm74g4oCU4oCUIOWwgemdoiAqLwogIC5wdi10aHVtYi0tY292ZXIgewogICAgcGFkZGluZzogMDsKICAgIGJvcmRlci1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA4KTsKICAgIGJhY2tncm91bmQ6CiAgICAgIHJhZGlhbC1ncmFkaWVudCgKICAgICAgICA0NjBweCAzMDBweCBhdCA4OCUgNiUsCiAgICAgICAgcmdiYSgxMSwgOTIsIDI1NSwgMC4zNCksCiAgICAgICAgdHJhbnNwYXJlbnQgNjglCiAgICAgICksCiAgICAgIGxpbmVhci1ncmFkaWVudCgxNTBkZWcsICMwZDEyMWIgMCUsIHZhcigtLXB2LWRhcmspIDU4JSwgIzA4MGIxMCAxMDAlKTsKICAgIGNvbG9yOiAjZmZmZmZmOwogICAgYm94LXNoYWRvdzoKICAgICAgMCAxcHggMnB4IHJnYmEoMTIsIDE3LCAyNiwgMC4xNiksCiAgICAgIDAgMjRweCA1MHB4IC0zMnB4IHJnYmEoMTIsIDE3LCAyNiwgMC43KTsKICB9CgogIC5wdi10aHVtYi0tY292ZXI6OmFmdGVyIHsKICAgIGNvbnRlbnQ6ICIiOwogICAgcG9zaXRpb246IGFic29sdXRlOwogICAgdG9wOiAtNDIlOwogICAgcmlnaHQ6IC0xMyU7CiAgICB3aWR0aDogNjQlOwogICAgYXNwZWN0LXJhdGlvOiAxOwogICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgxNTAsIDE4MCwgMjU1LCAwLjE0KTsKICAgIGJvcmRlci1yYWRpdXM6IDUwJTsKICAgIGJveC1zaGFkb3c6IDAgMCAwIDM0cHggcmdiYSgxNTAsIDE4MCwgMjU1LCAwLjAzNSk7CiAgICBwb2ludGVyLWV2ZW50czogbm9uZTsKICB9CgogIC5wdi10aHVtYi1jb3ZlciB7CiAgICBwb3NpdGlvbjogcmVsYXRpdmU7CiAgICB6LWluZGV4OiAxOwogICAgZGlzcGxheTogZmxleDsKICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47CiAgICBoZWlnaHQ6IDEwMCU7CiAgICBwYWRkaW5nOiAxOHB4IDIwcHggMTRweDsKICB9CgogIC5wdi10aHVtYi1jb3Zlci10b3AgewogICAgZGlzcGxheTogZmxleDsKICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47CiAgICBjb2xvcjogIzc4ODQ5YTsKICAgIGZvbnQtZmFtaWx5OiB2YXIoLS1wdi1mb250LW1vbm8pOwogICAgZm9udC1zaXplOiA2LjVweDsKICAgIGxldHRlci1zcGFjaW5nOiAwLjE2ZW07CiAgICBsaW5lLWhlaWdodDogMTsKICB9CgogIC5wdi10aHVtYi1jb3Zlci1tYXJrIHsKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAgZ2FwOiA3cHg7CiAgfQoKICAucHYtdGh1bWItY292ZXItbWFyayBzcGFuIHsKICAgIHdpZHRoOiA2cHg7CiAgICBoZWlnaHQ6IDZweDsKICAgIGJhY2tncm91bmQ6IHZhcigtLXB2LWJyYW5kKTsKICAgIGJvcmRlci1yYWRpdXM6IDFweDsKICB9CgogIC5wdi10aHVtYi1jb3Zlci1tYWluIHsKICAgIG1hcmdpbjogYXV0byAwOwogIH0KCiAgLnB2LXRodW1iLWNvdmVyLWtpY2tlciB7CiAgICBjb2xvcjogIzg3OTdiMDsKICAgIGZvbnQtZmFtaWx5OiB2YXIoLS1wdi1mb250LW1vbm8pOwogICAgZm9udC1zaXplOiA2LjVweDsKICAgIGxldHRlci1zcGFjaW5nOiAwLjE2ZW07CiAgfQoKICAucHYtdGh1bWItY292ZXItdGl0bGUgewogICAgbWF4LXdpZHRoOiA4MiU7CiAgICBtYXJnaW46IDlweCAwIDhweDsKICAgIGNvbG9yOiAjZjdmOWZkOwogICAgZm9udC1zaXplOiAyNnB4OwogICAgZm9udC13ZWlnaHQ6IDYwMDsKICAgIGxldHRlci1zcGFjaW5nOiAtMC4wNGVtOwogICAgbGluZS1oZWlnaHQ6IDEuMTsKICB9CgogIC5wdi10aHVtYi1jb3Zlci1zdWJ0aXRsZSB7CiAgICBkaXNwbGF5OiAtd2Via2l0LWJveDsKICAgIG1heC13aWR0aDogNjYlOwogICAgbWFyZ2luOiAwOwogICAgb3ZlcmZsb3c6IGhpZGRlbjsKICAgIGNvbG9yOiAjOThhNWI5OwogICAgZm9udC1zaXplOiA4LjVweDsKICAgIGZvbnQtd2VpZ2h0OiA0MDA7CiAgICBsaW5lLWhlaWdodDogMS41NTsKICAgIC13ZWJraXQtYm94LW9yaWVudDogdmVydGljYWw7CiAgICAtd2Via2l0LWxpbmUtY2xhbXA6IDI7CiAgfQoKICAucHYtdGh1bWItY292ZXItZm9vdCB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsKICAgIHBhZGRpbmctdG9wOiA3cHg7CiAgICBib3JkZXItdG9wOiAxcHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEyKTsKICAgIGNvbG9yOiAjNzE4MDk3OwogICAgZm9udC1mYW1pbHk6IHZhcigtLXB2LWZvbnQtbW9ubyk7CiAgICBmb250LXNpemU6IDYuNXB4OwogICAgbGV0dGVyLXNwYWNpbmc6IDAuMWVtOwogIH0KCiAgLyog57yp55Wl5Zu+IOKAlOKAlCDmraPmlocgKi8KICAucHYtdGh1bWItdGV4dCB7CiAgICBkaXNwbGF5OiAtd2Via2l0LWJveDsKICAgIG1hcmdpbjogMDsKICAgIG92ZXJmbG93OiBoaWRkZW47CiAgICBjb2xvcjogdmFyKC0tcHYtdGV4dC0yKTsKICAgIGZvbnQtc2l6ZTogOXB4OwogICAgbGluZS1oZWlnaHQ6IDEuNTU7CiAgICAtd2Via2l0LWJveC1vcmllbnQ6IHZlcnRpY2FsOwogICAgLXdlYmtpdC1saW5lLWNsYW1wOiAzOwogIH0KCiAgLnB2LXRodW1iLWJvZHktLXRleHQtY2hhcnQgewogICAgZGlzcGxheTogZ3JpZDsKICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogNWZyIDdmcjsKICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICBnYXA6IDEwcHg7CiAgfQoKICAucHYtdGh1bWItYm9keS0tbGlzdC1jaGFydCB7CiAgICBkaXNwbGF5OiBncmlkOwogICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiA1ZnIgN2ZyOwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGdhcDogMTBweDsKICB9CgogIC5wdi10aHVtYi1ib2R5LS1sZWFkLWxpc3QtY2hhcnQgewogICAgZGlzcGxheTogZ3JpZDsKICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogNWZyIDdmcjsKICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICBnYXA6IDhweCAxMHB4OwogIH0KCiAgLnB2LXRodW1iLWJvZHktLWxlYWQtbGlzdC1jaGFydCA+IC5wdi10aHVtYi10ZXh0IHsKICAgIGRpc3BsYXk6IG5vbmU7CiAgfQoKICAucHYtdGh1bWItYm9keS0tbGVhZC1saXN0LWNoYXJ0IC5wdi10aHVtYi1saXN0IHsKICAgIGdyaWQtY29sdW1uOiAxOwogIH0KCiAgLnB2LXRodW1iLWJvZHktLWxlYWQtbGlzdC1jaGFydCAucHYtdGh1bWItY2hhcnQgewogICAgZ3JpZC1jb2x1bW46IDI7CiAgfQoKICAucHYtdGh1bWItYm9keS0tc29sby1jaGFydCAucHYtdGh1bWItY2hhcnQgewogICAgaGVpZ2h0OiAxMDAlOwogIH0KCiAgLnB2LXRodW1iLWxpc3QgewogICAgZGlzcGxheTogZmxleDsKICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47CiAgICBnYXA6IDRweDsKICAgIG1hcmdpbjogMDsKICAgIHBhZGRpbmc6IDA7CiAgICBsaXN0LXN0eWxlOiBub25lOwogIH0KCiAgLnB2LXRodW1iLWxpc3QtaXRlbSB7CiAgICBkaXNwbGF5OiBncmlkOwogICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAxM3B4IDFmcjsKICAgIGdhcDogNHB4OwogICAgY29sb3I6IHZhcigtLXB2LXRleHQtMik7CiAgICBmb250LXNpemU6IDdweDsKICAgIGxpbmUtaGVpZ2h0OiAxLjM1OwogIH0KCiAgLnB2LXRodW1iLWxpc3QtaW5kZXggewogICAgY29sb3I6IHZhcigtLXB2LWJyYW5kKTsKICAgIGZvbnQtZmFtaWx5OiB2YXIoLS1wdi1mb250LW1vbm8pOwogICAgZm9udC1zaXplOiA1LjVweDsKICAgIGxpbmUtaGVpZ2h0OiAxLjY7CiAgfQoKICAucHYtdGh1bWItY2hhcnQgewogICAgZGlzcGxheTogZmxleDsKICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47CiAgICBoZWlnaHQ6IDEwMCU7CiAgICBtaW4taGVpZ2h0OiAwOwogICAgcGFkZGluZzogN3B4IDhweCA2cHg7CiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1wdi1saW5lKTsKICAgIGJvcmRlci1yYWRpdXM6IDdweDsKICAgIGJhY2tncm91bmQ6IHZhcigtLXB2LXBhcGVyKTsKICB9CgogIC5wdi10aHVtYi1jaGFydC1oZWFkIHsKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAgZ2FwOiA1cHg7CiAgICBmbGV4LXNocmluazogMDsKICAgIHBhZGRpbmctYm90dG9tOiA0cHg7CiAgICBjb2xvcjogdmFyKC0tcHYtdGV4dC0yKTsKICAgIGZvbnQtc2l6ZTogNnB4OwogICAgZm9udC13ZWlnaHQ6IDU1MDsKICAgIGxpbmUtaGVpZ2h0OiAxLjI7CiAgICB3aGl0ZS1zcGFjZTogbm93cmFwOwogICAgb3ZlcmZsb3c6IGhpZGRlbjsKICAgIHRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzOwogIH0KCiAgLnB2LXRodW1iLWRvdCB7CiAgICB3aWR0aDogM3B4OwogICAgaGVpZ2h0OiAzcHg7CiAgICBmbGV4LXNocmluazogMDsKICAgIGJvcmRlci1yYWRpdXM6IDFweDsKICAgIGJhY2tncm91bmQ6IHZhcigtLXB2LWJyYW5kKTsKICB9CgogIC5wdi10aHVtYi1jaGFydC1jYW52YXMgewogICAgcG9zaXRpb246IHJlbGF0aXZlOwogICAgZmxleDogMTsKICAgIG1pbi1oZWlnaHQ6IDA7CiAgICBvdmVyZmxvdzogaGlkZGVuOwogIH0KCiAgLnB2LXRodW1iLWNoYXJ0LWNhbnZhcy0tbGluZSBzdmcgewogICAgd2lkdGg6IDEwMCU7CiAgICBoZWlnaHQ6IDEwMCU7CiAgICBvdmVyZmxvdzogdmlzaWJsZTsKICB9CgogIC5wdi10aHVtYi1saW5lIHsKICAgIGZpbGw6IG5vbmU7CiAgICBzdHJva2U6IHZhcigtLXB2LWJyYW5kKTsKICAgIHN0cm9rZS13aWR0aDogMS44OwogICAgc3Ryb2tlLWxpbmVjYXA6IHJvdW5kOwogICAgc3Ryb2tlLWxpbmVqb2luOiByb3VuZDsKICAgIHZlY3Rvci1lZmZlY3Q6IG5vbi1zY2FsaW5nLXN0cm9rZTsKICB9CgogIC5wdi10aHVtYi1hcmVhIHsKICAgIGZpbGw6IHJnYmEoMTEsIDkyLCAyNTUsIDAuMDkpOwogIH0KCiAgLnB2LXRodW1iLWJhcnMgewogICAgZGlzcGxheTogZmxleDsKICAgIGFsaWduLWl0ZW1zOiBmbGV4LWVuZDsKICAgIGdhcDogNHB4OwogICAgd2lkdGg6IDEwMCU7CiAgICBoZWlnaHQ6IDEwMCU7CiAgICBwYWRkaW5nLXRvcDogNHB4OwogIH0KCiAgLnB2LXRodW1iLWJhciB7CiAgICBmbGV4OiAxOwogICAgbWluLWhlaWdodDogOCU7CiAgICBib3JkZXItcmFkaXVzOiAycHggMnB4IDAgMDsKICAgIGJhY2tncm91bmQ6IHZhcigtLXB2LWJyYW5kKTsKICAgIG9wYWNpdHk6IDAuODQ7CiAgfQoKICAucHYtdGh1bWItYmFyLS1hY3RpdmUgewogICAgYmFja2dyb3VuZDogdmFyKC0tcHYtYnJhbmQpOwogICAgb3BhY2l0eTogMTsKICB9CgogIC5wdi10aHVtYi1iYXItLW11dGVkIHsKICAgIGJhY2tncm91bmQ6ICNkOWUyZjA7CiAgICBvcGFjaXR5OiAxOwogIH0KCiAgLnB2LXRodW1iLWRvbnV0IHsKICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTsKICAgIHRvcDogNTAlOwogICAgbGVmdDogNTAlOwogICAgd2lkdGg6IG1pbig2NiUsIDU4cHgpOwogICAgYXNwZWN0LXJhdGlvOiAxOwogICAgYm9yZGVyLXJhZGl1czogNTAlOwogICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSk7CiAgfQoKICAucHYtdGh1bWItZG9udXQ6OmFmdGVyIHsKICAgIGNvbnRlbnQ6ICIiOwogICAgcG9zaXRpb246IGFic29sdXRlOwogICAgaW5zZXQ6IDI5JTsKICAgIGJvcmRlci1yYWRpdXM6IDUwJTsKICAgIGJhY2tncm91bmQ6IHZhcigtLXB2LXBhcGVyKTsKICB9CgogIC5wdi10aHVtYi1mbG93IHsKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBmbGV4LXdyYXA6IHdyYXA7CiAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7CiAgICBnYXA6IDNweDsKICAgIHdpZHRoOiAxMDAlOwogICAgaGVpZ2h0OiAxMDAlOwogIH0KCiAgLnB2LXRodW1iLW5vZGUgewogICAgcG9zaXRpb246IHJlbGF0aXZlOwogICAgcGFkZGluZzogM3B4IDRweDsKICAgIGJvcmRlcjogMXB4IHNvbGlkICNjY2Q4ZWE7CiAgICBib3JkZXItcmFkaXVzOiAzcHg7CiAgICBiYWNrZ3JvdW5kOiAjZmZmZmZmOwogICAgY29sb3I6ICM1OTY1Nzk7CiAgICBmb250LXNpemU6IDVweDsKICAgIGxpbmUtaGVpZ2h0OiAxLjE7CiAgICB3aGl0ZS1zcGFjZTogbm93cmFwOwogIH0KCiAgLnB2LXRodW1iLW5vZGUgKyAucHYtdGh1bWItbm9kZTo6YmVmb3JlIHsKICAgIGNvbnRlbnQ6ICLigLoiOwogICAgcG9zaXRpb246IGFic29sdXRlOwogICAgbGVmdDogLTRweDsKICAgIHRvcDogNTAlOwogICAgY29sb3I6ICM5YWE4YmI7CiAgICBmb250LXNpemU6IDZweDsKICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtNTIlKTsKICB9CgogIC5wdi10aHVtYi1jaGFydC1jYW52YXMtLWZsb3cgewogICAgZGlzcGxheTogZmxleDsKICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgfQoKICAucHYtdGh1bWItbW9jayB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsKICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOwogICAgZ2FwOiA0cHg7CiAgICBoZWlnaHQ6IDEwMCU7CiAgfQoKICAucHYtdGh1bWItbW9jayBzcGFuIHsKICAgIGRpc3BsYXk6IGJsb2NrOwogICAgaGVpZ2h0OiAycHg7CiAgICBib3JkZXItcmFkaXVzOiAycHg7CiAgICBiYWNrZ3JvdW5kOiAjZGJlM2VmOwogIH0KCiAgLnB2LXRodW1iLW1vY2sgc3BhbjpudGgtY2hpbGQoMikgewogICAgd2lkdGg6IDcyJTsKICB9CgogIC5wdi10aHVtYi1tb2NrIHNwYW46bnRoLWNoaWxkKDMpIHsKICAgIHdpZHRoOiA0OCU7CiAgfQoKICAucHYtdGh1bWItaW1hZ2UgewogICAgd2lkdGg6IDEwMCU7CiAgICBoZWlnaHQ6IDEwMCU7CiAgICBvdmVyZmxvdzogaGlkZGVuOwogICAgYm9yZGVyLXJhZGl1czogNnB4OwogICAgYmFja2dyb3VuZDogdmFyKC0tcHYtcGFwZXIpOwogIH0KCiAgLnB2LXRodW1iLWltYWdlIGltZyB7CiAgICB3aWR0aDogMTAwJTsKICAgIGhlaWdodDogMTAwJTsKICAgIG9iamVjdC1maXQ6IGNvdmVyOwogIH0KCiAgLnB2LXRodW1iLXF1b3RlIHsKICAgIG1hcmdpbjogMDsKICAgIHBhZGRpbmc6IDhweCAxMHB4OwogICAgYm9yZGVyLWxlZnQ6IDJweCBzb2xpZCB2YXIoLS1wdi1icmFuZCk7CiAgICBjb2xvcjogdmFyKC0tcHYtdGV4dC0xKTsKICAgIGZvbnQtc2l6ZTogOHB4OwogICAgbGluZS1oZWlnaHQ6IDEuNTsKICB9CgogIC5wdi10aHVtYi10YWJsZSB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsKICAgIGdhcDogM3B4OwogICAgd2lkdGg6IDEwMCU7CiAgfQoKICAucHYtdGh1bWItdGFibGUtcm93IHsKICAgIGRpc3BsYXk6IGdyaWQ7CiAgICBncmlkLWF1dG8tZmxvdzogY29sdW1uOwogICAgZ3JpZC1hdXRvLWNvbHVtbnM6IDFmcjsKICAgIGdhcDogNHB4OwogICAgcGFkZGluZy1ib3R0b206IDNweDsKICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS1wdi1saW5lKTsKICAgIGNvbG9yOiB2YXIoLS1wdi10ZXh0LTIpOwogICAgZm9udC1zaXplOiA1cHg7CiAgICBsaW5lLWhlaWdodDogMS4yOwogIH0KCiAgLnB2LWNhcmQtbWV0YSB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGdhcDogOXB4OwogICAgcGFkZGluZzogMTJweCAycHggMDsKICAgIGNvbG9yOiB2YXIoLS1wdi10ZXh0LTMpOwogICAgZm9udC1mYW1pbHk6IHZhcigtLXB2LWZvbnQtbW9ubyk7CiAgICBmb250LXNpemU6IDlweDsKICAgIGxldHRlci1zcGFjaW5nOiAwLjA4ZW07CiAgICBsaW5lLWhlaWdodDogMTsKICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7CiAgfQoKICAucHYtY2FyZC1pbmRleCB7CiAgICBjb2xvcjogdmFyKC0tcHYtYnJhbmQpOwogICAgZm9udC13ZWlnaHQ6IDYwMDsKICB9CgogIC5wdi1jYXJkLWtpbmQgewogICAgY29sb3I6IHZhcigtLXB2LXRleHQtMik7CiAgICBsZXR0ZXItc3BhY2luZzogMC4wNGVtOwogIH0KCiAgLnB2LWNhcmQtb3BlbiB7CiAgICBkaXNwbGF5OiBpbmxpbmUtZmxleDsKICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICBnYXA6IDRweDsKICAgIG1hcmdpbi1sZWZ0OiBhdXRvOwogICAgb3BhY2l0eTogMDsKICAgIGNvbG9yOiB2YXIoLS1wdi1icmFuZCk7CiAgICBmb250LWZhbWlseTogdmFyKC0tcHYtZm9udC1zYW5zKTsKICAgIGZvbnQtc2l6ZTogMTBweDsKICAgIGxldHRlci1zcGFjaW5nOiAwLjAyZW07CiAgICB0ZXh0LXRyYW5zZm9ybTogbm9uZTsKICAgIHRyYW5zaXRpb246IG9wYWNpdHkgMC4yNXMgdmFyKC0tcHYtZWFzZSk7CiAgfQoKICAucHYtY2FyZC1vcGVuIHN2ZyB7CiAgICB3aWR0aDogMTJweDsKICAgIGhlaWdodDogMTJweDsKICB9CgogIC5wdi1jYXJkOmhvdmVyIC5wdi1jYXJkLW9wZW4sCiAgLnB2LWNhcmQ6Zm9jdXMtdmlzaWJsZSAucHYtY2FyZC1vcGVuIHsKICAgIG9wYWNpdHk6IDE7CiAgfQoKICAucHYtZm9vdGVyIHsKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47CiAgICBnYXA6IDIwcHg7CiAgICBtYXJnaW4tdG9wOiAyNHB4OwogICAgcGFkZGluZy10b3A6IDE0cHg7CiAgICBib3JkZXItdG9wOiAxcHggc29saWQgdmFyKC0tcHYtbGluZSk7CiAgICBjb2xvcjogdmFyKC0tcHYtdGV4dC0zKTsKICAgIGZvbnQtZmFtaWx5OiB2YXIoLS1wdi1mb250LW1vbm8pOwogICAgZm9udC1zaXplOiA5cHg7CiAgICBsZXR0ZXItc3BhY2luZzogMC4wOGVtOwogICAgbGluZS1oZWlnaHQ6IDEuNTsKICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7CiAgfQoKICAvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KICAgICDmlL7mmKDopobnm5blsYIgJiDmjqfliLbmnaEKICAgICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi8KICAucHYtb3ZlcmxheSB7CiAgICBwb3NpdGlvbjogZml4ZWQ7CiAgICBpbnNldDogMDsKICAgIHotaW5kZXg6IDk5OTk7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgb3ZlcmZsb3c6IGhpZGRlbjsKICAgIGJhY2tncm91bmQ6ICMwODBiMTA7CiAgfQoKICAucHYtdG9vbGJhciB7CiAgICBwb3NpdGlvbjogYWJzb2x1dGU7CiAgICB0b3A6IDIycHg7CiAgICBsZWZ0OiA1MCU7CiAgICB6LWluZGV4OiAzMDsKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAgZ2FwOiAycHg7CiAgICBwYWRkaW5nOiA1cHg7CiAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSk7CiAgICBib3JkZXItcmFkaXVzOiA5OTlweDsKICAgIGJhY2tncm91bmQ6IHJnYmEoMTIsIDE2LCAyMywgMC43Nik7CiAgICBjb2xvcjogI2ZmZmZmZjsKICAgIGJveC1zaGFkb3c6IDAgMThweCA0MHB4IC0yMnB4IHJnYmEoMCwgMCwgMCwgMC44KTsKICAgIGJhY2tkcm9wLWZpbHRlcjogc2F0dXJhdGUoMTYwJSkgYmx1cigxOHB4KTsKICAgIC13ZWJraXQtYmFja2Ryb3AtZmlsdGVyOiBzYXR1cmF0ZSgxNjAlKSBibHVyKDE4cHgpOwogICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC01MCUpOwogICAgdHJhbnNpdGlvbjoKICAgICAgb3BhY2l0eSAwLjM1cyB2YXIoLS1wdi1lYXNlKSwKICAgICAgdHJhbnNmb3JtIDAuMzVzIHZhcigtLXB2LWVhc2UpOwogIH0KCiAgLnB2LXRvb2xiYXItLWlkbGUgewogICAgdmlzaWJpbGl0eTogaGlkZGVuOwogICAgb3BhY2l0eTogMDsKICAgIHBvaW50ZXItZXZlbnRzOiBub25lOwogICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTEwcHgpOwogICAgdHJhbnNpdGlvbjoKICAgICAgb3BhY2l0eSAwLjM1cyB2YXIoLS1wdi1lYXNlKSwKICAgICAgdHJhbnNmb3JtIDAuMzVzIHZhcigtLXB2LWVhc2UpLAogICAgICB2aXNpYmlsaXR5IDBzIDAuMzVzOwogIH0KCiAgLnB2LXRvb2wtYnRuIHsKICAgIGRpc3BsYXk6IGlubGluZS1mbGV4OwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOwogICAgd2lkdGg6IDM0cHg7CiAgICBoZWlnaHQ6IDM0cHg7CiAgICBwYWRkaW5nOiAwOwogICAgYm9yZGVyOiAwOwogICAgYm9yZGVyLXJhZGl1czogNTAlOwogICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7CiAgICBjb2xvcjogI2M3ZDBkZDsKICAgIGN1cnNvcjogcG9pbnRlcjsKICAgIHRyYW5zaXRpb246CiAgICAgIGJhY2tncm91bmQtY29sb3IgMC4ycyB2YXIoLS1wdi1lYXNlKSwKICAgICAgY29sb3IgMC4ycyB2YXIoLS1wdi1lYXNlKTsKICB9CgogIC5wdi10b29sLWJ0biBzdmcgewogICAgd2lkdGg6IDE3cHg7CiAgICBoZWlnaHQ6IDE3cHg7CiAgfQoKICAucHYtdG9vbC1idG46aG92ZXIgewogICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpOwogICAgY29sb3I6ICNmZmZmZmY7CiAgfQoKICAucHYtdG9vbC1idG46Zm9jdXMtdmlzaWJsZSwKICAucHYtZXhpdC1idG46Zm9jdXMtdmlzaWJsZSB7CiAgICBvdXRsaW5lOiAycHggc29saWQgIzdlYTdmZjsKICAgIG91dGxpbmUtb2Zmc2V0OiAxcHg7CiAgfQoKICAucHYtY291bnRlciB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgYWxpZ24taXRlbXM6IGJhc2VsaW5lOwogICAgZ2FwOiAzcHg7CiAgICBtaW4td2lkdGg6IDUwcHg7CiAgICBwYWRkaW5nOiAwIDhweDsKICAgIGNvbG9yOiAjNzc4Mzk2OwogICAgZm9udC1mYW1pbHk6IHZhcigtLXB2LWZvbnQtbW9ubyk7CiAgICBmb250LXNpemU6IDEwcHg7CiAgICBsZXR0ZXItc3BhY2luZzogMC4wNGVtOwogICAgbGluZS1oZWlnaHQ6IDE7CiAgICB3aGl0ZS1zcGFjZTogbm93cmFwOwogIH0KCiAgLnB2LWNvdW50ZXIgc3Ryb25nIHsKICAgIGNvbG9yOiAjZmZmZmZmOwogICAgZm9udC13ZWlnaHQ6IDYwMDsKICB9CgogIC5wdi10b29sYmFyLWRpdmlkZXIgewogICAgd2lkdGg6IDFweDsKICAgIGhlaWdodDogMTZweDsKICAgIG1hcmdpbjogMCA0cHg7CiAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMTQpOwogIH0KCiAgLnB2LWV4aXQtYnRuIHsKICAgIGRpc3BsYXk6IGlubGluZS1mbGV4OwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGdhcDogN3B4OwogICAgaGVpZ2h0OiAzNHB4OwogICAgcGFkZGluZzogMCAxMXB4IDAgMTJweDsKICAgIGJvcmRlcjogMDsKICAgIGJvcmRlci1yYWRpdXM6IDk5OXB4OwogICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7CiAgICBjb2xvcjogI2M3ZDBkZDsKICAgIGZvbnQtc2l6ZTogMTBweDsKICAgIGxldHRlci1zcGFjaW5nOiAwLjAyZW07CiAgICBjdXJzb3I6IHBvaW50ZXI7CiAgICB0cmFuc2l0aW9uOgogICAgICBiYWNrZ3JvdW5kLWNvbG9yIDAuMnMgdmFyKC0tcHYtZWFzZSksCiAgICAgIGNvbG9yIDAuMnMgdmFyKC0tcHYtZWFzZSk7CiAgfQoKICAucHYtZXhpdC1idG46aG92ZXIgewogICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpOwogICAgY29sb3I6ICNmZmZmZmY7CiAgfQoKICAucHYtZXhpdC1idG4ga2JkIHsKICAgIHBhZGRpbmc6IDJweCA1cHg7CiAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMTYpOwogICAgYm9yZGVyLXJhZGl1czogNHB4OwogICAgY29sb3I6ICM4ZTlhYWI7CiAgICBmb250LWZhbWlseTogdmFyKC0tcHYtZm9udC1tb25vKTsKICAgIGZvbnQtc2l6ZTogOHB4OwogICAgbGluZS1oZWlnaHQ6IDE7CiAgfQoKICAucHYtcm90YXRlLWhpbnQgewogICAgZGlzcGxheTogbm9uZTsKICB9CgogIC5wdi1wcm9ncmVzcyB7CiAgICBwb3NpdGlvbjogYWJzb2x1dGU7CiAgICByaWdodDogMDsKICAgIGJvdHRvbTogMDsKICAgIGxlZnQ6IDA7CiAgICB6LWluZGV4OiAzMTsKICAgIGhlaWdodDogMnB4OwogICAgb3ZlcmZsb3c6IGhpZGRlbjsKICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wOCk7CiAgfQoKICAucHYtcHJvZ3Jlc3Mgc3BhbiB7CiAgICBkaXNwbGF5OiBibG9jazsKICAgIGhlaWdodDogMTAwJTsKICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCg5MGRlZywgdmFyKC0tcHYtYnJhbmQtZGVlcCksICM1Zjk1ZmYpOwogICAgdHJhbnNpdGlvbjogd2lkdGggMC40NXMgdmFyKC0tcHYtZWFzZSk7CiAgfQoKICAucHYtc3RhZ2UgewogICAgcG9zaXRpb246IGFic29sdXRlOwogICAgaW5zZXQ6IDA7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOwogICAgd2lkdGg6IDEwMCU7CiAgICBoZWlnaHQ6IDEwMCU7CiAgICBvdmVyZmxvdzogaGlkZGVuOwogICAgYmFja2dyb3VuZDogIzA4MGIxMDsKICAgIHRvdWNoLWFjdGlvbjogbm9uZTsKICB9CgogIC8qIOe7hOS7tuWGhee9rueahCAxOTIww5cxMDgwIOiInuWPsO+8muS4jeS+nei1liByZXZlYWwuanMg55qEIENTUyDmiJYgSlPjgIIgKi8KICAucHYtc3RhZ2UgLnNsaWRlcyB7CiAgICBwb3NpdGlvbjogYWJzb2x1dGU7CiAgICB0b3A6IDUwJTsKICAgIGxlZnQ6IDUwJTsKICAgIHdpZHRoOiAxOTIwcHg7CiAgICBoZWlnaHQ6IDEwODBweDsKICAgIG92ZXJmbG93OiBoaWRkZW47CiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtNTAlKSBzY2FsZSh2YXIoLS1wdi1zdGFnZS1zY2FsZSwgMSkpOwogICAgdHJhbnNmb3JtLW9yaWdpbjogY2VudGVyIGNlbnRlcjsKICAgIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50OwogIH0KCiAgLnB2LXN0YWdlIC5zbGlkZXMgPiBzZWN0aW9uIHsKICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTsKICAgIGluc2V0OiAwOwogICAgZGlzcGxheTogbm9uZSAhaW1wb3J0YW50OwogICAgd2lkdGg6IDEwMCU7CiAgICBoZWlnaHQ6IDEwMCU7CiAgICBvcGFjaXR5OiAxOwogICAgdmlzaWJpbGl0eTogdmlzaWJsZTsKICB9CgogIC5wdi1zdGFnZSAuc2xpZGVzID4gc2VjdGlvbi5pcy1jdXJyZW50IHsKICAgIHotaW5kZXg6IDI7CiAgICBkaXNwbGF5OiBmbGV4ICFpbXBvcnRhbnQ7CiAgfQoKICAvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KICAgICDlubvnga/niYfnlLvluIMKICAgICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi8KICAucnMtc2xpZGUgewogICAgLS1zbGlkZS1wYWQteDogOTZweDsKICAgIC0tc2xpZGUtZ2FwOiA1MnB4OwogICAgLS10aXRsZS1zaXplOiA1NnB4OwogICAgLS1sZWFkLXNpemU6IDM2cHg7CiAgICAtLWJvZHktc2l6ZTogMzBweDsKICAgIC0tbGlzdC1zaXplOiAzMHB4OwogICAgLS1xdW90ZS1zaXplOiA0MnB4OwogICAgLS10YWJsZS1zaXplOiAyNHB4OwogICAgLS1jaGFydC1taW4taDogNDIwcHg7CiAgICAtLWxpc3Qtcm93LXBhZDogMjRweDsKCiAgICBwb3NpdGlvbjogcmVsYXRpdmU7CiAgICBkaXNwbGF5OiBmbGV4ICFpbXBvcnRhbnQ7CiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uICFpbXBvcnRhbnQ7CiAgICBhbGlnbi1pdGVtczogc3RyZXRjaCAhaW1wb3J0YW50OwogICAganVzdGlmeS1jb250ZW50OiBmbGV4LXN0YXJ0ICFpbXBvcnRhbnQ7CiAgICB3aWR0aDogMTAwJTsKICAgIGhlaWdodDogMTAwJTsKICAgIG1hcmdpbjogMCAhaW1wb3J0YW50OwogICAgcGFkZGluZzogMCAhaW1wb3J0YW50OwogICAgb3ZlcmZsb3c6IGhpZGRlbiAhaW1wb3J0YW50OwogICAgYm9yZGVyOiAwICFpbXBvcnRhbnQ7CiAgICBib3JkZXItcmFkaXVzOiAwICFpbXBvcnRhbnQ7CiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1wdi1wYXBlcikgIWltcG9ydGFudDsKICAgIGNvbG9yOiB2YXIoLS1wdi10ZXh0LTEpOwogICAgdGV4dC1hbGlnbjogbGVmdCAhaW1wb3J0YW50OwogICAgYm94LXNpemluZzogYm9yZGVyLWJveDsKICB9CgogIC5ycy1kZW5zaXR5LW1lZGl1bSB7CiAgICAtLXRpdGxlLXNpemU6IDUwcHg7CiAgICAtLWxlYWQtc2l6ZTogMzRweDsKICAgIC0tYm9keS1zaXplOiAyOXB4OwogICAgLS1saXN0LXNpemU6IDI5cHg7CiAgICAtLXF1b3RlLXNpemU6IDM2cHg7CiAgICAtLXRhYmxlLXNpemU6IDIycHg7CiAgICAtLWNoYXJ0LW1pbi1oOiAzNjBweDsKICAgIC0tc2xpZGUtZ2FwOiA0NHB4OwogICAgLS1saXN0LXJvdy1wYWQ6IDIwcHg7CiAgfQoKICAucnMtZGVuc2l0eS1oZWF2eSB7CiAgICAtLXRpdGxlLXNpemU6IDQ2cHg7CiAgICAtLWxlYWQtc2l6ZTogMzFweDsKICAgIC0tYm9keS1zaXplOiAyN3B4OwogICAgLS1saXN0LXNpemU6IDI3cHg7CiAgICAtLXF1b3RlLXNpemU6IDMycHg7CiAgICAtLXRhYmxlLXNpemU6IDIxcHg7CiAgICAtLWNoYXJ0LW1pbi1oOiAzMjBweDsKICAgIC0tc2xpZGUtZ2FwOiAzOHB4OwogICAgLS1saXN0LXJvdy1wYWQ6IDE2cHg7CiAgfQoKICAucnMtZGVuc2l0eS1leHRyZW1lIHsKICAgIC0tdGl0bGUtc2l6ZTogNDFweDsKICAgIC0tbGVhZC1zaXplOiAyOHB4OwogICAgLS1ib2R5LXNpemU6IDI1cHg7CiAgICAtLWxpc3Qtc2l6ZTogMjVweDsKICAgIC0tcXVvdGUtc2l6ZTogMzBweDsKICAgIC0tdGFibGUtc2l6ZTogMjBweDsKICAgIC0tY2hhcnQtbWluLWg6IDMwMHB4OwogICAgLS1zbGlkZS1nYXA6IDMycHg7CiAgICAtLWxpc3Qtcm93LXBhZDogMTNweDsKICB9CgogIC8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogICAgIOWGheWuuemhtemhteeciQogICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqLwogIC5ycy1oZWFkZXIgewogICAgZGlzcGxheTogZmxleDsKICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47CiAgICBnYXA6IDE4cHg7CiAgICBmbGV4LXNocmluazogMDsKICAgIHdpZHRoOiAxMDAlOwogICAgcGFkZGluZzogNThweCB2YXIoLS1zbGlkZS1wYWQteCkgMDsKICAgIHRleHQtYWxpZ246IGxlZnQ7CiAgfQoKICAucnMtZXllYnJvdyB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGdhcDogMTRweDsKICAgIGNvbG9yOiB2YXIoLS1wdi10ZXh0LTMpOwogICAgZm9udC1mYW1pbHk6IHZhcigtLXB2LWZvbnQtbW9ubyk7CiAgICBmb250LXNpemU6IDEzcHg7CiAgICBmb250LXdlaWdodDogNTAwOwogICAgbGV0dGVyLXNwYWNpbmc6IDAuMTRlbTsKICAgIGxpbmUtaGVpZ2h0OiAxOwogICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTsKICB9CgogIC5ycy1leWVicm93LWluZGV4IHsKICAgIGNvbG9yOiB2YXIoLS1wdi1icmFuZCk7CiAgICBmb250LXdlaWdodDogNjAwOwogIH0KCiAgLnJzLWV5ZWJyb3ctcnVsZSB7CiAgICB3aWR0aDogMjhweDsKICAgIGhlaWdodDogMXB4OwogICAgYmFja2dyb3VuZDogdmFyKC0tcHYtbGluZS1zdHJvbmcpOwogIH0KCiAgLnJzLWhlYWRlci10aXRsZSB7CiAgICBtYXgtd2lkdGg6IDE1MDBweDsKICAgIG1hcmdpbjogMCAhaW1wb3J0YW50OwogICAgY29sb3I6IHZhcigtLXB2LWluaykgIWltcG9ydGFudDsKICAgIGZvbnQtc2l6ZTogdmFyKC0tdGl0bGUtc2l6ZSkgIWltcG9ydGFudDsKICAgIGZvbnQtd2VpZ2h0OiA2NTAgIWltcG9ydGFudDsKICAgIGxldHRlci1zcGFjaW5nOiAtMC4wMzhlbSAhaW1wb3J0YW50OwogICAgbGluZS1oZWlnaHQ6IDEuMTYgIWltcG9ydGFudDsKICAgIHRleHQtYWxpZ246IGxlZnQgIWltcG9ydGFudDsKICAgIHRleHQtd3JhcDogYmFsYW5jZTsKICAgIG92ZXJmbG93LXdyYXA6IGJyZWFrLXdvcmQ7CiAgfQoKICAvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KICAgICDlhoXlrrnpobXmraPmlocKICAgICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi8KICAucnMtYm9keSB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgZmxleDogMTsKICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47CiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsKICAgIGdhcDogdmFyKC0tc2xpZGUtZ2FwKTsKICAgIHdpZHRoOiAxMDAlOwogICAgbWluLWhlaWdodDogMDsKICAgIHBhZGRpbmc6IDM2cHggdmFyKC0tc2xpZGUtcGFkLXgpIDM4cHg7CiAgICBvdmVyZmxvdy15OiBhdXRvOwogICAgc2Nyb2xsYmFyLXdpZHRoOiBub25lOwogICAgdGV4dC1hbGlnbjogbGVmdDsKICB9CgogIC5ycy1ib2R5Ojotd2Via2l0LXNjcm9sbGJhciB7CiAgICB3aWR0aDogMDsKICAgIGhlaWdodDogMDsKICB9CgogIC5ycy1ibG9jayB7CiAgICBtaW4td2lkdGg6IDA7CiAgfQoKICAucnMtYm9keS0tbGlzdC1jaGFydCwKICAucnMtYm9keS0tbGVhZC1saXN0LWNoYXJ0LAogIC5ycy1ib2R5LS10ZXh0LWNoYXJ0LAogIC5ycy1ib2R5LS1pbWFnZS1jaGFydCwKICAucnMtYm9keS0tdGFibGUtY2hhcnQsCiAgLnJzLWJvZHktLWltYWdlLXRleHQgewogICAgZGlzcGxheTogZ3JpZDsKICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDEyLCBtaW5tYXgoMCwgMWZyKSk7CiAgICBhbGlnbi1pdGVtczogc3RyZXRjaDsKICAgIGFsaWduLWNvbnRlbnQ6IGNlbnRlcjsKICAgIGdhcDogdmFyKC0tc2xpZGUtZ2FwKTsKICB9CgogIC5ycy1ib2R5LS1saXN0LWNoYXJ0LAogIC5ycy1ib2R5LS10ZXh0LWNoYXJ0LAogIC5ycy1ib2R5LS1pbWFnZS1jaGFydCwKICAucnMtYm9keS0tdGFibGUtY2hhcnQgewogICAgZ3JpZC1hdXRvLXJvd3M6IG1pbm1heCgwLCAxZnIpOwogICAgYWxpZ24tY29udGVudDogc3RyZXRjaDsKICB9CgogIC5ycy1ib2R5LS1sZWFkLWxpc3QtY2hhcnQgewogICAgZ3JpZC10ZW1wbGF0ZS1yb3dzOiBhdXRvIG1pbm1heCgwLCAxZnIpOwogICAgYWxpZ24tY29udGVudDogc3RyZXRjaDsKICB9CgogIC5ycy1ib2R5LS1sZWFkLWxpc3QtY2hhcnQgPiAucnMtYmxvY2stLXRleHQgewogICAgZ3JpZC1jb2x1bW46IDEgLyAtMTsKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBhbGlnbi1pdGVtczogY2VudGVyOwogIH0KCiAgLnJzLWJvZHktLWxlYWQtbGlzdC1jaGFydCAucnMtYmxvY2stLWxpc3QsCiAgLnJzLWJvZHktLWxlYWQtbGlzdC1jaGFydCAucnMtYmxvY2stLWNoYXJ0IHsKICAgIG1pbi1oZWlnaHQ6IDA7CiAgfQoKICAucnMtYm9keS0tbGlzdC1jaGFydCAucnMtYmxvY2stLWxpc3QsCiAgLnJzLWJvZHktLWxpc3QtY2hhcnQgLnJzLWJsb2NrLS1jaGFydCwKICAucnMtYm9keS0tdGV4dC1jaGFydCAucnMtYmxvY2stLXRleHQsCiAgLnJzLWJvZHktLXRleHQtY2hhcnQgLnJzLWJsb2NrLS1jaGFydCwKICAucnMtYm9keS0taW1hZ2UtY2hhcnQgLnJzLWJsb2NrLS1pbWFnZSwKICAucnMtYm9keS0taW1hZ2UtY2hhcnQgLnJzLWJsb2NrLS1jaGFydCwKICAucnMtYm9keS0tdGFibGUtY2hhcnQgLnJzLWJsb2NrLS10YWJsZSwKICAucnMtYm9keS0tdGFibGUtY2hhcnQgLnJzLWJsb2NrLS1jaGFydCB7CiAgICBtaW4taGVpZ2h0OiAwOwogIH0KCiAgLnJzLWJvZHktLWxpc3QtY2hhcnQgLnJzLWJsb2NrLS1jaGFydCwKICAucnMtYm9keS0tbGVhZC1saXN0LWNoYXJ0IC5ycy1ibG9jay0tY2hhcnQsCiAgLnJzLWJvZHktLXRleHQtY2hhcnQgLnJzLWJsb2NrLS1jaGFydCwKICAucnMtYm9keS0taW1hZ2UtY2hhcnQgLnJzLWJsb2NrLS1jaGFydCwKICAucnMtYm9keS0tdGFibGUtY2hhcnQgLnJzLWJsb2NrLS1jaGFydCB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgaGVpZ2h0OiAxMDAlOwogIH0KCiAgLnJzLWJvZHktLWxpc3QtY2hhcnQgLnJzLWJsb2NrLS1saXN0LAogIC5ycy1ib2R5LS1sZWFkLWxpc3QtY2hhcnQgLnJzLWJsb2NrLS1saXN0LAogIC5ycy1ib2R5LS10ZXh0LWNoYXJ0IC5ycy1ibG9jay0tdGV4dCwKICAucnMtYm9keS0taW1hZ2UtdGV4dCAucnMtYmxvY2stLXRleHQgewogICAgZGlzcGxheTogZmxleDsKICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgfQoKICAucnMtYm9keS0tbGVhZC1saXN0LWNoYXJ0IC5ycy1ibG9jay0tbGlzdCB7CiAgICBhbGlnbi1pdGVtczogZmxleC1zdGFydDsKICAgIHBhZGRpbmctdG9wOiA0cHg7CiAgfQoKICAucnMtYm9keS0tc29sby1jaGFydCB7CiAgICBkaXNwbGF5OiBmbGV4OwogIH0KCiAgLnJzLWJvZHktLXNvbG8tY2hhcnQgLnJzLWJsb2NrLS1jaGFydCB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgZmxleDogMTsKICAgIG1pbi1oZWlnaHQ6IDA7CiAgfQoKICAucnMtYm9keS0tc29sby1jaGFydCAucnMtY2hhcnQgewogICAgZmxleDogMTsKICAgIGhlaWdodDogMTAwJTsKICB9CgogIC5ycy1ib2R5LS1zb2xvLWxpc3QgLnJzLWxpc3QsCiAgLnJzLWJvZHktLXN0YWNrIC5ycy1saXN0IHsKICAgIG1heC13aWR0aDogMTE4MHB4OwogIH0KCiAgLnJzLWJvZHktLXNvbG8tbGlzdCAucnMtYmxvY2ssCiAgLnJzLWJvZHktLXN0YWNrIC5ycy1ibG9jayB7CiAgICB3aWR0aDogMTAwJTsKICB9CgogIC5ycy1ib2R5LS1zb2xvLWltYWdlIC5ycy1ibG9jay0taW1hZ2UsCiAgLnJzLWJvZHktLXNvbG8tdGFibGUgLnJzLWJsb2NrLS10YWJsZSB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgZmxleDogMTsKICAgIG1pbi1oZWlnaHQ6IDA7CiAgfQoKICAucnMtYm9keS0tc29sby1pbWFnZSAucnMtZmlndXJlLAogIC5ycy1ib2R5LS1zb2xvLXRhYmxlIC5ycy10YWJsZS13cmFwIHsKICAgIHdpZHRoOiAxMDAlOwogICAgbWF4LWhlaWdodDogMTAwJTsKICB9CgogIC5ycy1jb2wtNCB7CiAgICBncmlkLWNvbHVtbjogc3BhbiA0OwogIH0KCiAgLnJzLWNvbC01IHsKICAgIGdyaWQtY29sdW1uOiBzcGFuIDU7CiAgfQoKICAucnMtY29sLTYgewogICAgZ3JpZC1jb2x1bW46IHNwYW4gNjsKICB9CgogIC5ycy1jb2wtNyB7CiAgICBncmlkLWNvbHVtbjogc3BhbiA3OwogIH0KCiAgLnJzLWNvbC04IHsKICAgIGdyaWQtY29sdW1uOiBzcGFuIDg7CiAgfQoKICAucnMtY29sLTEyIHsKICAgIGdyaWQtY29sdW1uOiBzcGFuIDEyOwogIH0KCiAgLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CiAgICAg5paH5pysCiAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovCiAgLnJzLXRleHQgewogICAgbWF4LXdpZHRoOiAzMWVtOwogICAgbWFyZ2luOiAwICFpbXBvcnRhbnQ7CiAgICBwYWRkaW5nOiAwIDAgMCAyOHB4ICFpbXBvcnRhbnQ7CiAgICBib3JkZXItbGVmdDogM3B4IHNvbGlkIHZhcigtLXB2LWJyYW5kKTsKICAgIGNvbG9yOiB2YXIoLS1wdi10ZXh0LTEpICFpbXBvcnRhbnQ7CiAgICBmb250LXNpemU6IHZhcigtLWxlYWQtc2l6ZSk7CiAgICBmb250LXdlaWdodDogNDAwOwogICAgbGV0dGVyLXNwYWNpbmc6IC0wLjAxNWVtOwogICAgbGluZS1oZWlnaHQ6IDEuNjI7CiAgICB0ZXh0LWFsaWduOiBsZWZ0ICFpbXBvcnRhbnQ7CiAgICB0ZXh0LXdyYXA6IHByZXR0eTsKICAgIG92ZXJmbG93LXdyYXA6IGJyZWFrLXdvcmQ7CiAgfQoKICAucnMtYm9keS0tbGVhZC1saXN0LWNoYXJ0IC5ycy10ZXh0IHsKICAgIG1heC13aWR0aDogNTRlbTsKICAgIHBhZGRpbmctbGVmdDogMjJweCAhaW1wb3J0YW50OwogICAgYm9yZGVyLWxlZnQtd2lkdGg6IDJweDsKICAgIGZvbnQtc2l6ZTogdmFyKC0tYm9keS1zaXplKTsKICAgIGxpbmUtaGVpZ2h0OiAxLjY7CiAgfQoKICAucnMtdGV4dC0tc3RhdGVtZW50IHsKICAgIG1heC13aWR0aDogMjZlbTsKICAgIHBhZGRpbmctbGVmdDogMCAhaW1wb3J0YW50OwogICAgYm9yZGVyLWxlZnQ6IDA7CiAgICBmb250LXNpemU6IGNhbGModmFyKC0tbGVhZC1zaXplKSAqIDEuMSk7CiAgICBmb250LXdlaWdodDogNTAwOwogICAgbGV0dGVyLXNwYWNpbmc6IC0wLjAyNWVtOwogICAgbGluZS1oZWlnaHQ6IDEuNTsKICB9CgogIC8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogICAgIOWIl+ihqO+8mue8luWPtyArIOe7hue6v++8jOW8seWMluKAnOavj+mhueS4gOW8oOWNoeKAneeahOaooeadv+aEnwogICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqLwogIC5ycy1saXN0IHsKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOwogICAgZ2FwOiAwOwogICAgd2lkdGg6IDEwMCU7CiAgICBtYXJnaW46IDAgIWltcG9ydGFudDsKICAgIHBhZGRpbmc6IDAgIWltcG9ydGFudDsKICAgIGxpc3Qtc3R5bGU6IG5vbmUgIWltcG9ydGFudDsKICAgIHRleHQtYWxpZ246IGxlZnQgIWltcG9ydGFudDsKICB9CgogIC5ycy1saXN0LWl0ZW0gewogICAgZGlzcGxheTogZ3JpZDsKICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogNTJweCBtaW5tYXgoMCwgMWZyKTsKICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICBnYXA6IDE4cHg7CiAgICBtYXJnaW46IDAgIWltcG9ydGFudDsKICAgIHBhZGRpbmc6IHZhcigtLWxpc3Qtcm93LXBhZCkgMCAhaW1wb3J0YW50OwogICAgYm9yZGVyLXRvcDogMXB4IHNvbGlkIHZhcigtLXB2LWxpbmUpOwogICAgY29sb3I6IHZhcigtLXB2LXRleHQtMSkgIWltcG9ydGFudDsKICAgIGZvbnQtc2l6ZTogdmFyKC0tbGlzdC1zaXplKTsKICAgIGxpbmUtaGVpZ2h0OiAxLjQ4OwogICAgdGV4dC1hbGlnbjogbGVmdCAhaW1wb3J0YW50OwogIH0KCiAgLnJzLWxpc3QtaXRlbTpmaXJzdC1jaGlsZCB7CiAgICBib3JkZXItdG9wLWNvbG9yOiB2YXIoLS1wdi1saW5lLXN0cm9uZyk7CiAgfQoKICAucnMtbGlzdC1pdGVtOmxhc3QtY2hpbGQgewogICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLXB2LWxpbmUtc3Ryb25nKTsKICB9CgogIC5ycy1saXN0LWluZGV4IHsKICAgIGFsaWduLXNlbGY6IGNlbnRlcjsKICAgIHBhZGRpbmctdG9wOiAwOwogICAgY29sb3I6IHZhcigtLXB2LWJyYW5kKTsKICAgIGZvbnQtZmFtaWx5OiB2YXIoLS1wdi1mb250LW1vbm8pOwogICAgZm9udC1zaXplOiAxNHB4OwogICAgZm9udC13ZWlnaHQ6IDYwMDsKICAgIGxldHRlci1zcGFjaW5nOiAwLjA0ZW07CiAgICBsaW5lLWhlaWdodDogMTsKICB9CgogIC5ycy1saXN0LXRleHQgewogICAgbWluLXdpZHRoOiAwOwogICAgb3ZlcmZsb3ctd3JhcDogYnJlYWstd29yZDsKICB9CgogIC8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogICAgIOWbvuihqO+8muWOu+aOieWOmumHjeWNoeeJh++8jOeUqOKAnOWbvueJiOKAneaJv+aJmOaVsOaNrgogICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqLwogIC5ycy1jaGFydCB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgZmxleDogMTsKICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47CiAgICB3aWR0aDogMTAwJTsKICAgIG1pbi1oZWlnaHQ6IHZhcigtLWNoYXJ0LW1pbi1oKTsKICAgIHBhZGRpbmc6IDMwcHggMzRweCAyNHB4OwogICAgb3ZlcmZsb3c6IGhpZGRlbjsKICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLXB2LWxpbmUpOwogICAgYm9yZGVyLXJhZGl1czogdmFyKC0tcHYtcmFkaXVzLWxnKTsKICAgIGJhY2tncm91bmQ6IHZhcigtLXB2LXN1cmZhY2UpOwogICAgYm94LXNoYWRvdzoKICAgICAgMCAxcHggMnB4IHJnYmEoMTIsIDE3LCAyNiwgMC4wMjUpLAogICAgICAwIDM0cHggNzBweCAtNThweCByZ2JhKDEyLCAxNywgMjYsIDAuMzgpOwogIH0KCiAgLnJzLWJvZHktLWxpc3QtY2hhcnQgLnJzLWNoYXJ0LAogIC5ycy1ib2R5LS1sZWFkLWxpc3QtY2hhcnQgLnJzLWNoYXJ0LAogIC5ycy1ib2R5LS10ZXh0LWNoYXJ0IC5ycy1jaGFydCwKICAucnMtYm9keS0taW1hZ2UtY2hhcnQgLnJzLWNoYXJ0LAogIC5ycy1ib2R5LS10YWJsZS1jaGFydCAucnMtY2hhcnQgewogICAgaGVpZ2h0OiAxMDAlOwogICAgbWluLWhlaWdodDogMDsKICB9CgogIC5ycy1jaGFydC1oZWFkIHsKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOwogICAgZ2FwOiAxOHB4OwogICAgZmxleC1zaHJpbms6IDA7CiAgICBwYWRkaW5nLWJvdHRvbTogMTZweDsKICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS1wdi1saW5lKTsKICB9CgogIC5ycy1jaGFydC1oZWFkaW5nIHsKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAgZ2FwOiAxMXB4OwogICAgbWluLXdpZHRoOiAwOwogIH0KCiAgLnJzLWNoYXJ0LW1hcmsgewogICAgd2lkdGg6IDdweDsKICAgIGhlaWdodDogN3B4OwogICAgZmxleC1zaHJpbms6IDA7CiAgICBib3JkZXItcmFkaXVzOiAycHg7CiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1wdi1icmFuZCk7CiAgfQoKICAucnMtY2hhcnQtdGl0bGUgewogICAgb3ZlcmZsb3c6IGhpZGRlbjsKICAgIGNvbG9yOiB2YXIoLS1wdi1pbmspOwogICAgZm9udC1zaXplOiAyMnB4OwogICAgZm9udC13ZWlnaHQ6IDYwMDsKICAgIGxldHRlci1zcGFjaW5nOiAtMC4wMThlbTsKICAgIGxpbmUtaGVpZ2h0OiAxLjM1OwogICAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7CiAgICB3aGl0ZS1zcGFjZTogbm93cmFwOwogIH0KCiAgLnJzLWNoYXJ0LWZpZyB7CiAgICBmbGV4LXNocmluazogMDsKICAgIGNvbG9yOiB2YXIoLS1wdi10ZXh0LTMpOwogICAgZm9udC1mYW1pbHk6IHZhcigtLXB2LWZvbnQtbW9ubyk7CiAgICBmb250LXNpemU6IDExcHg7CiAgICBmb250LXdlaWdodDogNTAwOwogICAgbGV0dGVyLXNwYWNpbmc6IDAuMTJlbTsKICAgIGxpbmUtaGVpZ2h0OiAxOwogIH0KCiAgLnJzLWNoYXJ0LWhlYWQtcmlnaHQgewogICAgZGlzcGxheTogZmxleDsKICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICBnYXA6IDEycHg7CiAgICBmbGV4LXNocmluazogMDsKICB9CgogIC5ycy1jaGFydC16b29tLXRvb2xzIHsKICAgIGRpc3BsYXk6IGlubGluZS1mbGV4OwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIHBhZGRpbmc6IDJweDsKICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLXB2LWxpbmUpOwogICAgYm9yZGVyLXJhZGl1czogOTk5cHg7CiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1wdi1wYXBlcik7CiAgICBmbGV4LXNocmluazogMDsKICB9CgogIC5ycy1jaGFydC16b29tLWJ0biB7CiAgICBkaXNwbGF5OiBpbmxpbmUtZmxleDsKICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsKICAgIHdpZHRoOiAyNHB4OwogICAgaGVpZ2h0OiAyNHB4OwogICAgcGFkZGluZzogMDsKICAgIGJvcmRlcjogMDsKICAgIGJvcmRlci1yYWRpdXM6IDUwJTsKICAgIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50OwogICAgY29sb3I6IHZhcigtLXB2LXRleHQtMik7CiAgICBmb250LXNpemU6IDE1cHg7CiAgICBsaW5lLWhlaWdodDogMTsKICAgIGN1cnNvcjogcG9pbnRlcjsKICAgIHRyYW5zaXRpb246CiAgICAgIGJhY2tncm91bmQtY29sb3IgMC4xOHMgdmFyKC0tcHYtZWFzZSksCiAgICAgIGNvbG9yIDAuMThzIHZhcigtLXB2LWVhc2UpOwogIH0KCiAgLnJzLWNoYXJ0LXpvb20tYnRuOmhvdmVyOm5vdCg6ZGlzYWJsZWQpIHsKICAgIGJhY2tncm91bmQ6ICNmZmZmZmY7CiAgICBjb2xvcjogdmFyKC0tcHYtYnJhbmQpOwogICAgYm94LXNoYWRvdzogMCAxcHggM3B4IHJnYmEoMTIsIDE3LCAyNiwgMC4wOCk7CiAgfQoKICAucnMtY2hhcnQtem9vbS1idG46ZGlzYWJsZWQgewogICAgb3BhY2l0eTogMC4yODsKICAgIGN1cnNvcjogbm90LWFsbG93ZWQ7CiAgfQoKICAucnMtY2hhcnQtem9vbS12YWx1ZSB7CiAgICBtaW4td2lkdGg6IDQ0cHg7CiAgICBoZWlnaHQ6IDI0cHg7CiAgICBwYWRkaW5nOiAwIDVweDsKICAgIGJvcmRlcjogMDsKICAgIGJvcmRlci1yYWRpdXM6IDk5OXB4OwogICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7CiAgICBjb2xvcjogdmFyKC0tcHYtdGV4dC0yKTsKICAgIGZvbnQtZmFtaWx5OiB2YXIoLS1wdi1mb250LW1vbm8pOwogICAgZm9udC1zaXplOiA5cHg7CiAgICBsZXR0ZXItc3BhY2luZzogMC4wMmVtOwogICAgbGluZS1oZWlnaHQ6IDE7CiAgICBjdXJzb3I6IHBvaW50ZXI7CiAgfQoKICAucnMtY2hhcnQtem9vbS12YWx1ZTpob3ZlciB7CiAgICBjb2xvcjogdmFyKC0tcHYtYnJhbmQpOwogIH0KCiAgLnJzLWNoYXJ0LXpvb20tdG9vbHM6Zm9jdXMtd2l0aGluIHsKICAgIGJvcmRlci1jb2xvcjogcmdiYSgxMSwgOTIsIDI1NSwgMC4zNSk7CiAgfQoKICAucnMtY2hhcnQtem9vbS1idG46Zm9jdXMtdmlzaWJsZSwKICAucnMtY2hhcnQtem9vbS12YWx1ZTpmb2N1cy12aXNpYmxlIHsKICAgIG91dGxpbmU6IDJweCBzb2xpZCByZ2JhKDExLCA5MiwgMjU1LCAwLjUpOwogICAgb3V0bGluZS1vZmZzZXQ6IDFweDsKICB9CgogIC5ycy1jaGFydC1pbm5lciB7CiAgICBwb3NpdGlvbjogcmVsYXRpdmU7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgZmxleDogMTsKICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsKICAgIG1pbi1oZWlnaHQ6IDA7CiAgICBwYWRkaW5nLXRvcDogMTZweDsKICAgIG92ZXJmbG93OiBoaWRkZW47CiAgfQoKICAucnMtY2hhcnQtaW5uZXItLWRpYWdyYW0gewogICAgZGlzcGxheTogZmxleDsKICAgIGZsZXg6IDAgMCBhdXRvOwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOwogICAgd2lkdGg6IDEwMCU7CiAgICBoZWlnaHQ6IGF1dG87CiAgICBtYXgtaGVpZ2h0OiA1NjBweDsKICAgIG1pbi1oZWlnaHQ6IDI2MHB4OwogICAgcGFkZGluZzogMDsKICB9CgogIC5ycy1jaGFydC0tZGlhZ3JhbSB7CiAgICBoZWlnaHQ6IGF1dG87CiAgICBwYWRkaW5nLXRvcDogMjRweDsKICB9CgogIC5ycy1jaGFydC0tZGlhZ3JhbSAucnMtY2hhcnQtaGVhZCB7CiAgICBwYWRkaW5nLWJvdHRvbTogMTJweDsKICB9CgogIC5ycy1ib2R5LS1zb2xvLWNoYXJ0IC5ycy1jaGFydC0tZGlhZ3JhbSB7CiAgICBhbGlnbi1zZWxmOiBjZW50ZXI7CiAgICBmbGV4OiAwIDAgYXV0bzsKICAgIGhlaWdodDogYXV0bzsKICB9CgogIC5ycy1jaGFydC16b29tIHsKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7CiAgICB3aWR0aDogMTAwJTsKICAgIGhlaWdodDogMTAwJTsKICAgIHVzZXItc2VsZWN0OiBub25lOwogICAgLXdlYmtpdC11c2VyLXNlbGVjdDogbm9uZTsKICAgIHRyYW5zZm9ybS1vcmlnaW46IGNlbnRlciBjZW50ZXI7CiAgICB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gMC4xOHMgdmFyKC0tcHYtZWFzZSk7CiAgICB3aWxsLWNoYW5nZTogdHJhbnNmb3JtOwogIH0KCiAgLnJzLWNoYXJ0LXpvb20uaXMtcGFubmluZyB7CiAgICB0cmFuc2l0aW9uOiBub25lOwogIH0KCiAgLnJzLWNoYXJ0LWNhbnZhcyB7CiAgICBkaXNwbGF5OiBibG9jazsKICAgIHdpZHRoOiAxMDAlICFpbXBvcnRhbnQ7CiAgICBoZWlnaHQ6IDEwMCUgIWltcG9ydGFudDsKICB9CgogIC5ycy1jaGFydC1zb3VyY2UgewogICAgZmxleC1zaHJpbms6IDA7CiAgICBtYXJnaW4tdG9wOiAxMnB4OwogICAgY29sb3I6IHZhcigtLXB2LXRleHQtMyk7CiAgICBmb250LXNpemU6IDEycHg7CiAgICBsZXR0ZXItc3BhY2luZzogMC4wMWVtOwogICAgbGluZS1oZWlnaHQ6IDEuNDsKICAgIHRleHQtYWxpZ246IGxlZnQ7CiAgfQoKICAucnMtY2hhcnQtZmFsbGJhY2sgewogICAgZGlzcGxheTogZmxleDsKICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICBnYXA6IDEycHg7CiAgICBjb2xvcjogdmFyKC0tcHYtdGV4dC0yKTsKICAgIGZvbnQtc2l6ZTogMjBweDsKICB9CgogIC5ycy1jaGFydC1mYWxsYmFjay0tb3ZlcmxheSB7CiAgICBwb3NpdGlvbjogYWJzb2x1dGU7CiAgICBpbnNldDogMDsKICAgIHotaW5kZXg6IDI7CiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsKICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC45Mik7CiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7CiAgfQoKICAucnMtY2hhcnQtZmFsbGJhY2stbWFyayB7CiAgICB3aWR0aDogOHB4OwogICAgaGVpZ2h0OiA4cHg7CiAgICBib3JkZXItcmFkaXVzOiAycHg7CiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1wdi1icmFuZCk7CiAgfQoKICAucnMtbWVybWFpZCB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOwogICAgd2lkdGg6IDEwMCU7CiAgICBoZWlnaHQ6IDEwMCU7CiAgICBtaW4taGVpZ2h0OiAwOwogICAgbWFyZ2luOiBhdXRvOwogICAgb3ZlcmZsb3c6IGhpZGRlbjsKICAgIHRleHQtYWxpZ246IGNlbnRlcjsKICB9CgogIC5ycy1tZXJtYWlkIDpkZWVwKHN2ZykgewogICAgZGlzcGxheTogYmxvY2s7CiAgICB3aWR0aDogMTAwJSAhaW1wb3J0YW50OwogICAgbWF4LXdpZHRoOiAxMDAlICFpbXBvcnRhbnQ7CiAgICBoZWlnaHQ6IDEwMCUgIWltcG9ydGFudDsKICAgIG1heC1oZWlnaHQ6IDEwMCUgIWltcG9ydGFudDsKICAgIG1hcmdpbjogYXV0byAhaW1wb3J0YW50OwogIH0KCiAgLnJzLW1lcm1haWQgOmRlZXAoLm5vZGVMYWJlbCksCiAgLnJzLW1lcm1haWQgOmRlZXAoLmVkZ2VMYWJlbCkgewogICAgZm9udC1mYW1pbHk6IHZhcigtLXB2LWZvbnQtc2FucykgIWltcG9ydGFudDsKICB9CgogIC5ycy1tZXJtYWlkIDpkZWVwKC5ub2RlIHJlY3QpLAogIC5ycy1tZXJtYWlkIDpkZWVwKC5ub2RlIGNpcmNsZSksCiAgLnJzLW1lcm1haWQgOmRlZXAoLm5vZGUgcG9seWdvbikgewogICAgc3Ryb2tlLXdpZHRoOiAxLjRweCAhaW1wb3J0YW50OwogIH0KCiAgLnJzLW1lcm1haWQgOmRlZXAoLm5vZGUgcmVjdCkgewogICAgcng6IDhweDsKICAgIHJ5OiA4cHg7CiAgfQoKICAucnMtbWVybWFpZCA6ZGVlcCguZWRnZVBhdGggcGF0aCkgewogICAgc3Ryb2tlOiAjYTZiMmM0ICFpbXBvcnRhbnQ7CiAgICBzdHJva2Utd2lkdGg6IDEuNXB4ICFpbXBvcnRhbnQ7CiAgfQoKICAucnMtbWVybWFpZC1lcnJvciB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOwogICAgd2lkdGg6IDEwMCU7CiAgICBoZWlnaHQ6IDEwMCU7CiAgICBjb2xvcjogdmFyKC0tcHYtdGV4dC0zKTsKICAgIGZvbnQtc2l6ZTogMTZweDsKICB9CgogIC8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogICAgIOWbvueJhwogICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqLwogIC5ycy1maWd1cmUgewogICAgZGlzcGxheTogZmxleDsKICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47CiAgICB3aWR0aDogMTAwJTsKICAgIGhlaWdodDogMTAwJTsKICAgIG1pbi1oZWlnaHQ6IDA7CiAgICBtYXJnaW46IDAgIWltcG9ydGFudDsKICB9CgogIC5ycy1pbWFnZS1ib3ggewogICAgZmxleDogMTsKICAgIG1pbi1oZWlnaHQ6IDA7CiAgICBvdmVyZmxvdzogaGlkZGVuOwogICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tcHYtbGluZSk7CiAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1wdi1yYWRpdXMtbGcpOwogICAgYmFja2dyb3VuZDogdmFyKC0tcHYtc3VyZmFjZSk7CiAgfQoKICAucnMtaW1nIHsKICAgIGRpc3BsYXk6IGJsb2NrOwogICAgd2lkdGg6IDEwMCU7CiAgICBoZWlnaHQ6IDEwMCU7CiAgfQoKICAucnMtZmlndXJlLWNhcHRpb24gewogICAgZmxleC1zaHJpbms6IDA7CiAgICBtYXJnaW4tdG9wOiAxMnB4OwogICAgY29sb3I6IHZhcigtLXB2LXRleHQtMyk7CiAgICBmb250LXNpemU6IDEycHg7CiAgICBsaW5lLWhlaWdodDogMS41OwogICAgdGV4dC1hbGlnbjogbGVmdDsKICB9CgogIC8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogICAgIOW8leeUqAogICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqLwogIC5ycy1xdW90ZSB7CiAgICBwb3NpdGlvbjogcmVsYXRpdmU7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsKICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOwogICAgbWF4LXdpZHRoOiAxMzIwcHg7CiAgICBtYXJnaW46IDAgIWltcG9ydGFudDsKICAgIHBhZGRpbmc6IDQycHggMCA0MnB4IDkycHg7CiAgICBib3JkZXItdG9wOiAxcHggc29saWQgdmFyKC0tcHYtbGluZS1zdHJvbmcpOwogICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLXB2LWxpbmUtc3Ryb25nKTsKICAgIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50OwogICAgdGV4dC1hbGlnbjogbGVmdDsKICB9CgogIC5ycy1xdW90ZS1tYXJrIHsKICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTsKICAgIHRvcDogMjBweDsKICAgIGxlZnQ6IDhweDsKICAgIGNvbG9yOiB2YXIoLS1wdi1icmFuZCk7CiAgICBmb250LWZhbWlseTogR2VvcmdpYSwgIlRpbWVzIE5ldyBSb21hbiIsIHNlcmlmOwogICAgZm9udC1zaXplOiAxMTZweDsKICAgIGxpbmUtaGVpZ2h0OiAxOwogICAgb3BhY2l0eTogMC4xNjsKICB9CgogIC5ycy1xdW90ZS10ZXh0IHsKICAgIG1hcmdpbjogMDsKICAgIGNvbG9yOiB2YXIoLS1wdi1pbmspOwogICAgZm9udC1zaXplOiB2YXIoLS1xdW90ZS1zaXplKTsKICAgIGZvbnQtd2VpZ2h0OiA1MDA7CiAgICBsZXR0ZXItc3BhY2luZzogLTAuMDI1ZW07CiAgICBsaW5lLWhlaWdodDogMS40NjsKICAgIHRleHQtd3JhcDogcHJldHR5OwogIH0KCiAgLnJzLXF1b3RlLWNpdGUgewogICAgbWFyZ2luLXRvcDogMjBweDsKICAgIGNvbG9yOiB2YXIoLS1wdi10ZXh0LTMpOwogICAgZm9udC1zaXplOiAxM3B4OwogICAgZm9udC1zdHlsZTogbm9ybWFsOwogICAgbGV0dGVyLXNwYWNpbmc6IDAuMDJlbTsKICB9CgogIC8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogICAgIOihqOagvAogICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqLwogIC5ycy10YWJsZS13cmFwIHsKICAgIHdpZHRoOiAxMDAlOwogICAgbWF4LWhlaWdodDogMTAwJTsKICAgIG92ZXJmbG93OiBhdXRvOwogICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tcHYtbGluZSk7CiAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1wdi1yYWRpdXMtbGcpOwogICAgYmFja2dyb3VuZDogdmFyKC0tcHYtc3VyZmFjZSk7CiAgICBzY3JvbGxiYXItd2lkdGg6IHRoaW47CiAgfQoKICAucnMtdGFibGUgewogICAgd2lkdGg6IDEwMCU7CiAgICBib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOwogICAgY29sb3I6IHZhcigtLXB2LXRleHQtMSk7CiAgICBmb250LXNpemU6IHZhcigtLXRhYmxlLXNpemUpOwogICAgZm9udC12YXJpYW50LW51bWVyaWM6IHRhYnVsYXItbnVtczsKICAgIHRleHQtYWxpZ246IGxlZnQ7CiAgfQoKICAucnMtdGFibGUgdGggewogICAgcGFkZGluZzogMThweCAyNHB4OwogICAgYm9yZGVyLWJvdHRvbTogMnB4IHNvbGlkIHZhcigtLXB2LWluayk7CiAgICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDsKICAgIGNvbG9yOiB2YXIoLS1wdi10ZXh0LTMpOwogICAgZm9udC1zaXplOiAxM3B4OwogICAgZm9udC13ZWlnaHQ6IDYwMDsKICAgIGxldHRlci1zcGFjaW5nOiAwLjA2ZW07CiAgICBsaW5lLWhlaWdodDogMS4zOwogICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTsKICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7CiAgfQoKICAucnMtdGFibGUgdGQgewogICAgcGFkZGluZzogMTdweCAyNHB4OwogICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLXB2LWxpbmUpOwogICAgY29sb3I6IHZhcigtLXB2LXRleHQtMSk7CiAgICBsaW5lLWhlaWdodDogMS40OwogICAgdmVydGljYWwtYWxpZ246IHRvcDsKICB9CgogIC5ycy10YWJsZSB0Ym9keSB0cjpsYXN0LWNoaWxkIHRkIHsKICAgIGJvcmRlci1ib3R0b206IDA7CiAgfQoKICAucnMtdGFibGUgdGJvZHkgdHI6aG92ZXIgewogICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7CiAgfQoKICAucnMtdGFibGUtc291cmNlIHsKICAgIG1hcmdpbjogMDsKICAgIHBhZGRpbmc6IDEycHggMjRweCAxNHB4OwogICAgYm9yZGVyLXRvcDogMXB4IHNvbGlkIHZhcigtLXB2LWxpbmUpOwogICAgY29sb3I6IHZhcigtLXB2LXRleHQtMyk7CiAgICBmb250LXNpemU6IDExcHg7CiAgICBsaW5lLWhlaWdodDogMS40OwogIH0KCiAgLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CiAgICAg6aG16ISaCiAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovCiAgLnJzLWZvb3RlciB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsKICAgIGdhcDogMjBweDsKICAgIGZsZXgtc2hyaW5rOiAwOwogICAgaGVpZ2h0OiA2NHB4OwogICAgcGFkZGluZzogMCB2YXIoLS1zbGlkZS1wYWQteCk7CiAgICBib3JkZXItdG9wOiAxcHggc29saWQgdmFyKC0tcHYtbGluZSk7CiAgICBjb2xvcjogdmFyKC0tcHYtdGV4dC0zKTsKICAgIGZvbnQtc2l6ZTogMTNweDsKICAgIGxldHRlci1zcGFjaW5nOiAwLjAzZW07CiAgICBsaW5lLWhlaWdodDogMS40OwogICAgdGV4dC1hbGlnbjogbGVmdDsKICB9CgogIC5ycy1mb290ZXItYnJhbmQgewogICAgZGlzcGxheTogZmxleDsKICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICBnYXA6IDlweDsKICAgIG1pbi13aWR0aDogMDsKICAgIG92ZXJmbG93OiBoaWRkZW47CiAgICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpczsKICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7CiAgfQoKICAucnMtZm9vdGVyLW1hcmsgewogICAgd2lkdGg6IDVweDsKICAgIGhlaWdodDogNXB4OwogICAgZmxleC1zaHJpbms6IDA7CiAgICBib3JkZXItcmFkaXVzOiAxcHg7CiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1wdi1icmFuZCk7CiAgfQoKICAucnMtZm9vdGVyLXBhZ2UgewogICAgZmxleC1zaHJpbms6IDA7CiAgICBjb2xvcjogdmFyKC0tcHYtdGV4dC0zKTsKICAgIGZvbnQtZmFtaWx5OiB2YXIoLS1wdi1mb250LW1vbm8pOwogICAgZm9udC1zaXplOiAxMXB4OwogICAgbGV0dGVyLXNwYWNpbmc6IDAuMDhlbTsKICAgIGxpbmUtaGVpZ2h0OiAxOwogIH0KCiAgLnJzLWZvb3Rlci1wYWdlIGIgewogICAgY29sb3I6IHZhcigtLXB2LWluayk7CiAgICBmb250LXdlaWdodDogNjAwOwogIH0KCiAgLnJzLWZvb3Rlci1wYWdlIHNwYW4gewogICAgbWFyZ2luLWxlZnQ6IDRweDsKICAgIGNvbG9yOiB2YXIoLS1wdi10ZXh0LTMpOwogIH0KCiAgLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CiAgICAg5bCB6Z2iCiAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovCiAgLnJzLXNsaWRlLS1jb3ZlciB7CiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1wdi1kYXJrKSAhaW1wb3J0YW50OwogICAgY29sb3I6ICNmZmZmZmY7CiAgfQoKICAucnMtY292ZXItYmcgewogICAgcG9zaXRpb246IGFic29sdXRlOwogICAgaW5zZXQ6IDA7CiAgICBvdmVyZmxvdzogaGlkZGVuOwogICAgcG9pbnRlci1ldmVudHM6IG5vbmU7CiAgfQoKICAucnMtY292ZXItZ3JpZCB7CiAgICBwb3NpdGlvbjogYWJzb2x1dGU7CiAgICBpbnNldDogMDsKICAgIGJhY2tncm91bmQtaW1hZ2U6CiAgICAgIGxpbmVhci1ncmFkaWVudChyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDM1KSAxcHgsIHRyYW5zcGFyZW50IDFweCksCiAgICAgIGxpbmVhci1ncmFkaWVudCg5MGRlZywgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzNSkgMXB4LCB0cmFuc3BhcmVudCAxcHgpOwogICAgYmFja2dyb3VuZC1zaXplOiA4OHB4IDg4cHg7CiAgICAtd2Via2l0LW1hc2staW1hZ2U6IHJhZGlhbC1ncmFkaWVudCgKICAgICAgZWxsaXBzZSBhdCA3NCUgNDIlLAogICAgICAjMDAwIDAlLAogICAgICB0cmFuc3BhcmVudCA3NCUKICAgICk7CiAgICBtYXNrLWltYWdlOiByYWRpYWwtZ3JhZGllbnQoZWxsaXBzZSBhdCA3NCUgNDIlLCAjMDAwIDAlLCB0cmFuc3BhcmVudCA3NCUpOwogIH0KCiAgLnJzLWNvdmVyLWdsb3cgewogICAgcG9zaXRpb246IGFic29sdXRlOwogICAgdG9wOiAtMjgwcHg7CiAgICByaWdodDogLTE4MHB4OwogICAgd2lkdGg6IDkwMHB4OwogICAgaGVpZ2h0OiA5MDBweDsKICAgIGJvcmRlci1yYWRpdXM6IDUwJTsKICAgIGJhY2tncm91bmQ6IHJhZGlhbC1ncmFkaWVudCgKICAgICAgY2lyY2xlLAogICAgICByZ2JhKDExLCA5MiwgMjU1LCAwLjM0KSAwJSwKICAgICAgcmdiYSgxMSwgOTIsIDI1NSwgMC4wOCkgMzglLAogICAgICB0cmFuc3BhcmVudCA2OCUKICAgICk7CiAgICBmaWx0ZXI6IGJsdXIoMTRweCk7CiAgfQoKICAucnMtY292ZXItYXhpcyB7CiAgICBwb3NpdGlvbjogYWJzb2x1dGU7CiAgICB0b3A6IDA7CiAgICByaWdodDogMDsKICAgIGJvdHRvbTogMDsKICAgIHdpZHRoOiAzOCU7CiAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoOTBkZWcsIHRyYW5zcGFyZW50LCByZ2JhKDExLCA5MiwgMjU1LCAwLjAzNSkpOwogIH0KCiAgLnJzLWNvdmVyLXJpbmcgewogICAgcG9zaXRpb246IGFic29sdXRlOwogICAgdG9wOiA1MCU7CiAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDEzMywgMTY4LCAyNTUsIDAuMTQpOwogICAgYm9yZGVyLXJhZGl1czogNTAlOwogICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC01MCUpOwogIH0KCiAgLnJzLWNvdmVyLXJpbmctLTEgewogICAgcmlnaHQ6IC04MHB4OwogICAgd2lkdGg6IDcyMHB4OwogICAgaGVpZ2h0OiA3MjBweDsKICB9CgogIC5ycy1jb3Zlci1yaW5nLS0yIHsKICAgIHJpZ2h0OiAtMjEycHg7CiAgICB3aWR0aDogOTgwcHg7CiAgICBoZWlnaHQ6IDk4MHB4OwogICAgYm9yZGVyLWNvbG9yOiByZ2JhKDEzMywgMTY4LCAyNTUsIDAuMDc1KTsKICB9CgogIC5ycy1jb3Zlci1mcmFtZSB7CiAgICBwb3NpdGlvbjogcmVsYXRpdmU7CiAgICB6LWluZGV4OiAxOwogICAgZGlzcGxheTogZmxleDsKICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47CiAgICB3aWR0aDogMTAwJTsKICAgIGhlaWdodDogMTAwJTsKICAgIHBhZGRpbmc6IDYycHggOTZweCA1NHB4OwogICAgdGV4dC1hbGlnbjogbGVmdDsKICB9CgogIC5ycy1jb3Zlci10b3AgewogICAgZGlzcGxheTogZmxleDsKICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47CiAgICBnYXA6IDI0cHg7CiAgICBjb2xvcjogIzdkODlhMDsKICAgIGZvbnQtZmFtaWx5OiB2YXIoLS1wdi1mb250LW1vbm8pOwogICAgZm9udC1zaXplOiAxMXB4OwogICAgZm9udC13ZWlnaHQ6IDUwMDsKICAgIGxldHRlci1zcGFjaW5nOiAwLjE2ZW07CiAgICBsaW5lLWhlaWdodDogMTsKICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7CiAgfQoKICAucnMtY292ZXItbWFyayB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGdhcDogMTBweDsKICB9CgogIC5ycy1jb3Zlci1tYXJrIHNwYW4gewogICAgd2lkdGg6IDhweDsKICAgIGhlaWdodDogOHB4OwogICAgYmFja2dyb3VuZDogdmFyKC0tcHYtYnJhbmQpOwogICAgYm9yZGVyLXJhZGl1czogMXB4OwogIH0KCiAgLnJzLWNvdmVyLWRlY2sgewogICAgbWF4LXdpZHRoOiA1MiU7CiAgICBvdmVyZmxvdzogaGlkZGVuOwogICAgY29sb3I6ICM2ZjdjOTE7CiAgICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpczsKICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7CiAgfQoKICAucnMtY292ZXItbWFpbiB7CiAgICBtYXgtd2lkdGg6IDEyODBweDsKICAgIG1hcmdpbjogYXV0byAwOwogIH0KCiAgLnJzLWNvdmVyLWtpY2tlciB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGdhcDogMTVweDsKICAgIG1hcmdpbi1ib3R0b206IDMwcHg7CiAgICBjb2xvcjogIzhkOWNiNDsKICAgIGZvbnQtZmFtaWx5OiB2YXIoLS1wdi1mb250LW1vbm8pOwogICAgZm9udC1zaXplOiAxM3B4OwogICAgZm9udC13ZWlnaHQ6IDUwMDsKICAgIGxldHRlci1zcGFjaW5nOiAwLjE3ZW07CiAgICBsaW5lLWhlaWdodDogMTsKICB9CgogIC5ycy1jb3Zlci1raWNrZXItbGluZSB7CiAgICB3aWR0aDogNTRweDsKICAgIGhlaWdodDogMXB4OwogICAgYmFja2dyb3VuZDogdmFyKC0tcHYtYnJhbmQpOwogIH0KCiAgLnJzLWNvdmVyLWtpY2tlci1ubyB7CiAgICBjb2xvcjogIzVmNmQ4MjsKICB9CgogIC5ycy1jb3Zlci10aXRsZSB7CiAgICBtYXgtd2lkdGg6IDEyMDBweDsKICAgIG1hcmdpbjogMCAwIDMycHggIWltcG9ydGFudDsKICAgIGNvbG9yOiAjZjhmYWZjICFpbXBvcnRhbnQ7CiAgICBmb250LXNpemU6IDk2cHggIWltcG9ydGFudDsKICAgIGZvbnQtd2VpZ2h0OiA2NTAgIWltcG9ydGFudDsKICAgIGxldHRlci1zcGFjaW5nOiAtMC4wNTJlbSAhaW1wb3J0YW50OwogICAgbGluZS1oZWlnaHQ6IDEuMDQgIWltcG9ydGFudDsKICAgIHRleHQtYWxpZ246IGxlZnQgIWltcG9ydGFudDsKICAgIHRleHQtd3JhcDogYmFsYW5jZTsKICAgIG92ZXJmbG93LXdyYXA6IGJyZWFrLXdvcmQ7CiAgfQoKICAucnMtY292ZXItc3VidGl0bGUgKyAucnMtY292ZXItc3VidGl0bGUgewogICAgbWFyZ2luLXRvcDogMTBweDsKICB9CgogIC5ycy1jb3Zlci1zdWJ0aXRsZSB7CiAgICBtYXgtd2lkdGg6IDc4MHB4OwogICAgbWFyZ2luOiAwOwogICAgY29sb3I6ICNhNmIyYzQ7CiAgICBmb250LXNpemU6IDI5cHg7CiAgICBmb250LXdlaWdodDogNDAwOwogICAgbGV0dGVyLXNwYWNpbmc6IC0wLjAxMmVtOwogICAgbGluZS1oZWlnaHQ6IDEuNTg7CiAgICB0ZXh0LWFsaWduOiBsZWZ0OwogIH0KCiAgLnJzLWNvdmVyLWZvb3QgewogICAgZGlzcGxheTogZmxleDsKICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47CiAgICBnYXA6IDI0cHg7CiAgICBwYWRkaW5nLXRvcDogMjRweDsKICAgIGJvcmRlci10b3A6IDFweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMTIpOwogICAgY29sb3I6ICM3ZDg5YTA7CiAgICBmb250LXNpemU6IDEycHg7CiAgICBsZXR0ZXItc3BhY2luZzogMC4wNWVtOwogICAgbGluZS1oZWlnaHQ6IDE7CiAgfQoKICAucnMtY292ZXItcHJlc2VudGVyIHsKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAgZ2FwOiAxMnB4OwogIH0KCiAgLnJzLWNvdmVyLWF2YXRhciB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOwogICAgd2lkdGg6IDMwcHg7CiAgICBoZWlnaHQ6IDMwcHg7CiAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMTQpOwogICAgYm9yZGVyLXJhZGl1czogNTAlOwogICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA3KTsKICAgIGNvbG9yOiAjZGJlNGYzOwogICAgZm9udC1zaXplOiAxMXB4OwogICAgbGV0dGVyLXNwYWNpbmc6IDA7CiAgfQoKICAucnMtY292ZXItcGFnZSB7CiAgICBjb2xvcjogIzZmN2M5MTsKICAgIGZvbnQtZmFtaWx5OiB2YXIoLS1wdi1mb250LW1vbm8pOwogICAgZm9udC1zaXplOiAxMXB4OwogICAgbGV0dGVyLXNwYWNpbmc6IDAuMDhlbTsKICB9CgogIC8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogICAgIOWFpeWcuuWKqOeUuwogICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqLwogIC5ycy1hbmltLXRhcmdldCB7CiAgICBvcGFjaXR5OiAxOwogICAgdHJhbnNmb3JtOiBub25lOwogICAgd2lsbC1jaGFuZ2U6IG9wYWNpdHksIHRyYW5zZm9ybTsKICB9CgogIC5ycy1zbGlkZS5ycy1hbmltLWZhbGxiYWNrIC5ycy1hbmltLXRhcmdldCB7CiAgICBvcGFjaXR5OiAxICFpbXBvcnRhbnQ7CiAgICB0cmFuc2Zvcm06IG5vbmUgIWltcG9ydGFudDsKICAgIGFuaW1hdGlvbjogbm9uZSAhaW1wb3J0YW50OwogIH0KCiAgLnJzLXNsaWRlLnJzLWFuaW0tYWN0aXZlIC5ycy1hbmltLXRhcmdldC5ycy1hbmltLWZhZGUtdXAgewogICAgYW5pbWF0aW9uOiBycy1mYWRlLXVwIDAuNjVzIHZhcigtLXB2LWVhc2UpIHZhcigtLWFuaW0tZGVsYXksIDBtcykgYm90aDsKICB9CgogIC5ycy1zbGlkZS5ycy1hbmltLWFjdGl2ZSAucnMtYW5pbS10YXJnZXQucnMtYW5pbS1zbGlkZS1kb3duIHsKICAgIGFuaW1hdGlvbjogcnMtc2xpZGUtZG93biAwLjU1cyB2YXIoLS1wdi1lYXNlKSB2YXIoLS1hbmltLWRlbGF5LCAwbXMpIGJvdGg7CiAgfQoKICAucnMtc2xpZGUucnMtYW5pbS1hY3RpdmUgLnJzLWFuaW0tdGFyZ2V0LnJzLWFuaW0tc2NhbGUtaW4gewogICAgYW5pbWF0aW9uOiBycy1zY2FsZS1pbiAwLjZzIHZhcigtLXB2LWVhc2UpIHZhcigtLWFuaW0tZGVsYXksIDBtcykgYm90aDsKICB9CgogIC5ycy1zbGlkZS5ycy1hbmltLWFjdGl2ZSAucnMtYW5pbS10YXJnZXQucnMtYW5pbS1mYWRlLWluIHsKICAgIGFuaW1hdGlvbjogcnMtZmFkZS1pbiAwLjVzIGVhc2UgdmFyKC0tYW5pbS1kZWxheSwgMG1zKSBib3RoOwogIH0KCiAgQGtleWZyYW1lcyBycy1mYWRlLXVwIHsKICAgIGZyb20gewogICAgICBvcGFjaXR5OiAwOwogICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMTRweCk7CiAgICB9CiAgICB0byB7CiAgICAgIG9wYWNpdHk6IDE7CiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTsKICAgIH0KICB9CgogIEBrZXlmcmFtZXMgcnMtc2xpZGUtZG93biB7CiAgICBmcm9tIHsKICAgICAgb3BhY2l0eTogMDsKICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0xMHB4KTsKICAgIH0KICAgIHRvIHsKICAgICAgb3BhY2l0eTogMTsKICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApOwogICAgfQogIH0KCiAgQGtleWZyYW1lcyBycy1zY2FsZS1pbiB7CiAgICBmcm9tIHsKICAgICAgb3BhY2l0eTogMDsKICAgICAgdHJhbnNmb3JtOiBzY2FsZSgwLjk3KTsKICAgIH0KICAgIHRvIHsKICAgICAgb3BhY2l0eTogMTsKICAgICAgdHJhbnNmb3JtOiBzY2FsZSgxKTsKICAgIH0KICB9CgogIEBrZXlmcmFtZXMgcnMtZmFkZS1pbiB7CiAgICBmcm9tIHsKICAgICAgb3BhY2l0eTogMDsKICAgIH0KICAgIHRvIHsKICAgICAgb3BhY2l0eTogMTsKICAgIH0KICB9CgogIC8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogICAgIOWTjeW6lOW8jwogICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqLwogIEBtZWRpYSAobWF4LXdpZHRoOiAxMDgwcHgpIHsKICAgIC5wdi1ncmlkIHsKICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoMiwgbWlubWF4KDAsIDFmcikpOwogICAgfQogIH0KCiAgQG1lZGlhIChtYXgtd2lkdGg6IDcyMHB4KSB7CiAgICAucHYtcm9vdCB7CiAgICAgIHBhZGRpbmc6IDIwcHggMTZweCAyNnB4OwogICAgfQoKICAgIC5wdi1oZWFkZXIgewogICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOwogICAgICBhbGlnbi1pdGVtczogZmxleC1zdGFydDsKICAgICAgZ2FwOiAyNHB4OwogICAgICBwYWRkaW5nLWJvdHRvbTogMjhweDsKICAgIH0KCiAgICAucHYtdGl0bGUgewogICAgICBmb250LXNpemU6IGNsYW1wKDMwcHgsIDl2dywgNDJweCk7CiAgICB9CgogICAgLnB2LXN1YnRpdGxlIHsKICAgICAgZmxleC13cmFwOiB3cmFwOwogICAgICBnYXA6IDhweDsKICAgICAgZm9udC1zaXplOiAxMnB4OwogICAgfQoKICAgIC5wdi1wbGF5LWJ0biB7CiAgICAgIHdpZHRoOiAxMDAlOwogICAgfQoKICAgIC5wdi1ncmlkIHsKICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiBtaW5tYXgoMCwgMWZyKTsKICAgICAgZ2FwOiAyNHB4OwogICAgfQoKICAgIC5wdi10aHVtYiB7CiAgICAgIHBhZGRpbmc6IDE2cHggMTdweCAxM3B4OwogICAgfQoKICAgIC5wdi10aHVtYi1jb3ZlciB7CiAgICAgIHBhZGRpbmc6IDE3cHggMThweCAxM3B4OwogICAgfQoKICAgIC5wdi10aHVtYi1jb3Zlci10aXRsZSB7CiAgICAgIG1heC13aWR0aDogOTIlOwogICAgICBmb250LXNpemU6IDIycHg7CiAgICB9CgogICAgLnB2LXRodW1iLWNvdmVyLXN1YnRpdGxlIHsKICAgICAgbWF4LXdpZHRoOiA3OCU7CiAgICB9CgogICAgLnB2LWZvb3RlciB7CiAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47CiAgICAgIGdhcDogNXB4OwogICAgICBtYXJnaW4tdG9wOiAyNnB4OwogICAgfQoKICAgIC5wdi10b29sYmFyIHsKICAgICAgdG9wOiAxMnB4OwogICAgICBwYWRkaW5nOiA0cHg7CiAgICB9CgogICAgLnB2LXRvb2wtYnRuIHsKICAgICAgd2lkdGg6IDMycHg7CiAgICAgIGhlaWdodDogMzJweDsKICAgIH0KCiAgICAucHYtZXhpdC1idG4gewogICAgICBoZWlnaHQ6IDMycHg7CiAgICAgIHBhZGRpbmc6IDAgOXB4OwogICAgfQoKICAgIC5wdi1leGl0LWJ0biA+IHNwYW4gewogICAgICBkaXNwbGF5OiBub25lOwogICAgfQoKICAgIC5wdi1jb3VudGVyIHsKICAgICAgbWluLXdpZHRoOiA0NHB4OwogICAgICBwYWRkaW5nOiAwIDVweDsKICAgIH0KICB9CgogIEBtZWRpYSAobWF4LXdpZHRoOiA3MjBweCkgYW5kIChvcmllbnRhdGlvbjogcG9ydHJhaXQpIHsKICAgIC5wdi1yb3RhdGUtaGludCB7CiAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTsKICAgICAgcmlnaHQ6IDUwJTsKICAgICAgYm90dG9tOiAxOHB4OwogICAgICB6LWluZGV4OiAzMjsKICAgICAgZGlzcGxheTogYmxvY2s7CiAgICAgIHBhZGRpbmc6IDdweCAxMnB4OwogICAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMTIpOwogICAgICBib3JkZXItcmFkaXVzOiA5OTlweDsKICAgICAgYmFja2dyb3VuZDogcmdiYSgxMiwgMTYsIDIzLCAwLjcpOwogICAgICBjb2xvcjogI2I5YzRkNDsKICAgICAgZm9udC1mYW1pbHk6IHZhcigtLXB2LWZvbnQtbW9ubyk7CiAgICAgIGZvbnQtc2l6ZTogOXB4OwogICAgICBsZXR0ZXItc3BhY2luZzogMC4wOGVtOwogICAgICBsaW5lLWhlaWdodDogMTsKICAgICAgd2hpdGUtc3BhY2U6IG5vd3JhcDsKICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDUwJSk7CiAgICAgIGJhY2tkcm9wLWZpbHRlcjogYmx1cigxMnB4KTsKICAgICAgLXdlYmtpdC1iYWNrZHJvcC1maWx0ZXI6IGJsdXIoMTJweCk7CiAgICB9CiAgfQoKICBAbWVkaWEgKHByZWZlcnMtcmVkdWNlZC1tb3Rpb246IHJlZHVjZSkgewogICAgLnJzLWFuaW0tdGFyZ2V0IHsKICAgICAgb3BhY2l0eTogMSAhaW1wb3J0YW50OwogICAgICB0cmFuc2Zvcm06IG5vbmUgIWltcG9ydGFudDsKICAgICAgYW5pbWF0aW9uOiBub25lICFpbXBvcnRhbnQ7CiAgICB9CgogICAgLnB2LXRodW1iLAogICAgLnB2LXBsYXktYnRuLAogICAgLnB2LXRvb2xiYXIsCiAgICAucHYtcHJvZ3Jlc3Mgc3BhbiB7CiAgICAgIHRyYW5zaXRpb246IG5vbmUgIWltcG9ydGFudDsKICAgIH0KCiAgICAucHYtY2FyZDpob3ZlciAucHYtdGh1bWIgewogICAgICB0cmFuc2Zvcm06IG5vbmU7CiAgICB9CiAgfQo8L3N0eWxlPgo="
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
