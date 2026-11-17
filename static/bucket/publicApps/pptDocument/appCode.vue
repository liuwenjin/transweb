<template data-edit-id="1">
  <div class="tw-relative tw-px-3 tw-pt-3 wizard-bg tw-flex tw-flex-col tw-items-center tw-w-full tw-h-full"
    ref="rootComponentContainer"
    data-edit-id="2">
    <div v-if="(isSolo || content.isSolo) && dataEditable"
      class="wizard-navbar tw-flex tw-items-center tw-justify-between tw-max-w-7xl tw-mx-auto tw-w-full"
      data-edit-id="100">
      <div :style="{ width: flag && step !== 0 ? '100%' : '' }"
        class="tw-flex tw-items-center tw-gap-3 logoInfoArea"
        data-edit-id="101">
        <h3 class="tw-text-2xl tw-text-gray-900 tw-tracking-tight tw-m-0 tw-font-medium logo-title tw-w-full"
          data-edit-id="102">
          <slot v-if="step === 0" data-edit-id="292">
            <div class="logo-badge tw-flex tw-items-center tw-justify-center"
              data-edit-id="409">
              <span class="logo-badge-icon" data-edit-id="410">{{
                icon || "∑"
              }}</span>
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
      <div class="navbar-actions" data-edit-id="103">
        <slot v-if="step === 0 && !flag">
          <el-button class="wizard-action-btn navbar-action-btn"
            @click="openFeedbackDialog()">
            问题反馈
          </el-button>
        </slot>
        <span class="navbar-divider" aria-hidden="true"></span>
        <div class="navbar-account">
          <div appName="loginRegItem"
            component="CardItem"
            :documentId="query ? query.documentId : ''"
            class="login-bar-card refined-user-card"
            data-edit-id="104"></div>
        </div>
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
  gap: 20px;
  padding: 10px 4px 18px;
  box-sizing: border-box;
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

/* 右侧操作区：按钮与账号区共用同一条垂直中心线 */
.navbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 0 0 auto;
}

.navbar-action-btn {
  height: 40px;
  padding: 0 16px;
}

.navbar-action-btn:focus-visible {
  outline: 2px solid var(--academic-primary-ring);
  outline-offset: 2px;
}

.navbar-divider {
  flex: 0 0 auto;
  width: 1px;
  height: 22px;
  background: var(--academic-border-strong);
  border-radius: 1px;
}

/* 登录 / 用户区：容纳 loginBar 44px 的切换按钮并垂直居中 */
.navbar-account {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 0 0 auto;
  width: 135px;
  height: 44px;
}

/* loginBar 由 CardItem 渲染，尺寸跟随账号区 */
.login-bar-card {
  width: 100%;
  height: 100%;
}

.logoInfoArea {
  flex: 1 1 auto;
  min-width: 0;
}

.logo-title {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  font-family: var(--font-system);
}

.logo-badge {
  flex: 0 0 auto;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--academic-accent) 0%, #fbbf24 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.26),
    inset 0 1px 0 rgba(255, 255, 255, 0.34);
}

.logo-badge-icon {
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
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
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  flex: 1 1 auto;
  min-width: 0;
  color: var(--academic-text);
  letter-spacing: -0.01em;
  line-height: 1.3;
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
  line-height: 1.35;
  color: var(--academic-text);
  letter-spacing: 0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.slogn-text {
  font-size: 12px;
  font-weight: 400;
  line-height: 1.4;
  color: var(--academic-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
@media (max-width: 640px) {
  .wizard-input-panel,
  .wizard-result-panel {
    border-radius: 16px;
  }

  .cast-spell-btn {
    font-size: 13.5px !important;
    padding: 9px 14px !important;
  }

  /* 窄屏：操作区换行，避免登录按钮被挤出可视区 */
  .wizard-navbar {
    flex-wrap: wrap;
    row-gap: 10px;
    padding: 10px 4px 14px;
  }

  .navbar-actions {
    margin-left: auto;
    gap: 8px;
  }

  .logo-title {
    gap: 10px;
  }

  .logo-badge {
    width: 36px;
    height: 36px;
    border-radius: 10px;
  }

  .logo-badge-icon {
    font-size: 18px;
  }

  .logo-text {
    font-size: 15px;
  }

  .navbar-divider {
    height: 18px;
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
										template: "data:text/plain;charset=utf-8;base64,PHRlbXBsYXRlPgogIDxkaXYgY2xhc3M9InB2LXJvb3QiPgogICAgPGRpdiBjbGFzcz0icHYtY29udGFpbmVyIiA6Y2xhc3M9InsgJ3B2LWNvbnRhaW5lci0tZm91cic6IHRvdGFsU2xpZGVzID09PSA0IH0iPgogICAgICA8IS0tID09PT09PT09PT09PSDmvJTnpLrmlofnqL/mtY/op4jlmaggPT09PT09PT09PT09IC0tPgogICAgICA8aGVhZGVyIGNsYXNzPSJwdi1oZWFkZXIiPgogICAgICAgIDxkaXYgY2xhc3M9InB2LWhlYWRlci1jb3B5Ij4KICAgICAgICAgIDxkaXYgY2xhc3M9InB2LWtpY2tlciI+CiAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJwdi1raWNrZXItbGluZSI+PC9zcGFuPgogICAgICAgICAgICA8c3Bhbj5QUkVTRU5UQVRJT04gREVDSzwvc3Bhbj4KICAgICAgICAgICAgPHNwYW4gY2xhc3M9InB2LWtpY2tlci1jb3VudCI+e3sgcGFkKHRvdGFsU2xpZGVzKSB9fSBQQUdFUzwvc3Bhbj4KICAgICAgICAgIDwvZGl2PgogICAgICAgICAgPGgxIGNsYXNzPSJwdi10aXRsZSI+e3sgYWNjb3VudERhdGEudGl0bGUgfX08L2gxPgogICAgICAgICAgPHAgY2xhc3M9InB2LXN1YnRpdGxlIj4KICAgICAgICAgICAgPHNwYW4+e3sgYWNjb3VudERhdGEucHJlc2VudGVyIH19PC9zcGFuPgogICAgICAgICAgICA8c3BhbiBjbGFzcz0icHYtbWV0YS1kb3QiPjwvc3Bhbj4KICAgICAgICAgICAgPHNwYW4+e3sgYWNjb3VudERhdGEuc3VidGl0bGUgfHwgdG90YWxTbGlkZXMgKyAnIOmhtea8lOekuuaWh+eovycgfX08L3NwYW4+CiAgICAgICAgICA8L3A+CiAgICAgICAgPC9kaXY+CgogICAgICAgIDxidXR0b24gY2xhc3M9InB2LXBsYXktYnRuIiB0eXBlPSJidXR0b24iIEBjbGljaz0iZW50ZXJQcmVzZW50YXRpb24oMCkiPgogICAgICAgICAgPHN2ZyBjbGFzcz0icHYtcGxheS1pY29uIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGFyaWEtaGlkZGVuPSJ0cnVlIj4KICAgICAgICAgICAgPHBhdGggZD0iTTggNS41djEzbDEwLjUtNi41TDggNS41eiIgZmlsbD0iY3VycmVudENvbG9yIj48L3BhdGg+CiAgICAgICAgICA8L3N2Zz4KICAgICAgICAgIDxzcGFuPuaUvuaYoOW5u+eBr+eJhzwvc3Bhbj4KICAgICAgICA8L2J1dHRvbj4KICAgICAgPC9oZWFkZXI+CgogICAgICA8IS0tID09PT09PT09PT09PSDlubvnga/niYfnvKnnlaXlm77nvZHmoLwgPT09PT09PT09PT09IC0tPgogICAgICA8bWFpbgogICAgICAgIGNsYXNzPSJwdi1ncmlkIgogICAgICAgIDpjbGFzcz0ieyAncHYtZ3JpZC0tZm91cic6IHRvdGFsU2xpZGVzID09PSA0IH0iCiAgICAgICAgYXJpYS1sYWJlbD0i5bm754Gv54mH5YiX6KGoIgogICAgICA+CiAgICAgICAgPGFydGljbGUKICAgICAgICAgIHYtZm9yPSIoc2xpZGUsIGlkeCkgaW4gYWNjb3VudERhdGEuc2xpZGVzIgogICAgICAgICAgOmtleT0ic2xpZGUuaWQiCiAgICAgICAgICBjbGFzcz0icHYtY2FyZCIKICAgICAgICAgIHJvbGU9ImJ1dHRvbiIKICAgICAgICAgIHRhYmluZGV4PSIwIgogICAgICAgICAgOmFyaWEtbGFiZWw9IifmiZPlvIDnrKwgJyArIChpZHggKyAxKSArICcg6aG177yaJyArIHNsaWRlLnRpdGxlIgogICAgICAgICAgQGNsaWNrPSJvcGVuU2xpZGVBdChpZHgpIgogICAgICAgICAgQGtleXVwLmVudGVyPSJvcGVuU2xpZGVBdChpZHgpIgogICAgICAgICAgQGtleXVwLnNwYWNlLnByZXZlbnQ9Im9wZW5TbGlkZUF0KGlkeCkiCiAgICAgICAgPgogICAgICAgICAgPGRpdgogICAgICAgICAgICBjbGFzcz0icHYtdGh1bWIiCiAgICAgICAgICAgIDpjbGFzcz0iWwogICAgICAgICAgICAgIHNsaWRlLnR5cGUgPT09ICd0aXRsZScgPyAncHYtdGh1bWItLWNvdmVyJyA6ICdwdi10aHVtYi0tY29udGVudCcsCiAgICAgICAgICAgICAgJ3B2LXRodW1iLS0nICsgZ2V0Qm9keUxheW91dChzbGlkZSksCiAgICAgICAgICAgIF0iCiAgICAgICAgICA+CiAgICAgICAgICAgIDwhLS0g5bCB6Z2i57yp55Wl5Zu+IC0tPgogICAgICAgICAgICA8ZGl2IHYtaWY9InNsaWRlLnR5cGUgPT09ICd0aXRsZSciIGNsYXNzPSJwdi10aHVtYi1jb3ZlciI+CiAgICAgICAgICAgICAgPGRpdiBjbGFzcz0icHYtdGh1bWItY292ZXItdG9wIj4KICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJwdi10aHVtYi1jb3Zlci1tYXJrIj4KICAgICAgICAgICAgICAgICAgPHNwYW4+PC9zcGFuPgogICAgICAgICAgICAgICAgICBQUkVTRU5UQVRJT04KICAgICAgICAgICAgICAgIDwvc3Bhbj4KICAgICAgICAgICAgICAgIDxzcGFuPnt7IHBhZChpZHggKyAxKSB9fTwvc3Bhbj4KICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJwdi10aHVtYi1jb3Zlci1tYWluIj4KICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJwdi10aHVtYi1jb3Zlci1raWNrZXIiPkVYRUNVVElWRSBCUklFRjwvc3Bhbj4KICAgICAgICAgICAgICAgIDxoMyBjbGFzcz0icHYtdGh1bWItY292ZXItdGl0bGUiPnt7IHNsaWRlLnRpdGxlIH19PC9oMz4KICAgICAgICAgICAgICAgIDxwIGNsYXNzPSJwdi10aHVtYi1jb3Zlci1zdWJ0aXRsZSI+e3sgZ2V0Q292ZXJTdWJ0aXRsZShzbGlkZSkgfX08L3A+CiAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgPGRpdiBjbGFzcz0icHYtdGh1bWItY292ZXItZm9vdCI+CiAgICAgICAgICAgICAgICA8c3Bhbj57eyBhY2NvdW50RGF0YS5wcmVzZW50ZXIgfX08L3NwYW4+CiAgICAgICAgICAgICAgICA8c3Bhbj57eyBwYWQodG90YWxTbGlkZXMpIH19IFBBR0VTPC9zcGFuPgogICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICA8L2Rpdj4KCiAgICAgICAgICAgIDwhLS0g5YaF5a656aG157yp55Wl5Zu+IC0tPgogICAgICAgICAgICA8dGVtcGxhdGUgdi1lbHNlPgogICAgICAgICAgICAgIDxkaXYgY2xhc3M9InB2LXRodW1iLWhlYWQiPgogICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9InB2LXRodW1iLWluZGV4Ij57eyBwYWQoaWR4ICsgMSkgfX08L3NwYW4+CiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0icHYtdGh1bWItbGFiZWwiPnt7IGdldFNsaWRlVHlwZUxhYmVsKHNsaWRlKSB9fTwvc3Bhbj4KICAgICAgICAgICAgICA8L2Rpdj4KCiAgICAgICAgICAgICAgPGgzIGNsYXNzPSJwdi10aHVtYi10aXRsZSI+e3sgc2xpZGUudGl0bGUgfX08L2gzPgoKICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJwdi10aHVtYi1ib2R5IiA6Y2xhc3M9Iidwdi10aHVtYi1ib2R5LS0nICsgZ2V0Qm9keUxheW91dChzbGlkZSkiPgogICAgICAgICAgICAgICAgPHRlbXBsYXRlIHYtZm9yPSIoZWxlbWVudCwgZUluZGV4KSBpbiAoc2xpZGUuZWxlbWVudHMgfHwgW10pIiA6a2V5PSJlSW5kZXgiPgogICAgICAgICAgICAgICAgICA8cCB2LWlmPSJlbGVtZW50LnR5cGUgPT09ICd0ZXh0JyIgY2xhc3M9InB2LXRodW1iLXRleHQiPgogICAgICAgICAgICAgICAgICAgIHt7IGVsZW1lbnQuY29udGVudCB9fQogICAgICAgICAgICAgICAgICA8L3A+CgogICAgICAgICAgICAgICAgICA8dWwgdi1lbHNlLWlmPSJlbGVtZW50LnR5cGUgPT09ICdsaXN0JyIgY2xhc3M9InB2LXRodW1iLWxpc3QiPgogICAgICAgICAgICAgICAgICAgIDxsaQogICAgICAgICAgICAgICAgICAgICAgdi1mb3I9IihpdGVtLCBsSW5kZXgpIGluIGVsZW1lbnQuY29udGVudC5zbGljZSgwLCAzKSIKICAgICAgICAgICAgICAgICAgICAgIDprZXk9ImxJbmRleCIKICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPSJwdi10aHVtYi1saXN0LWl0ZW0iCiAgICAgICAgICAgICAgICAgICAgPgogICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9InB2LXRodW1iLWxpc3QtaW5kZXgiPnt7IHBhZChsSW5kZXggKyAxKSB9fTwvc3Bhbj4KICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPnt7IGl0ZW0gfX08L3NwYW4+CiAgICAgICAgICAgICAgICAgICAgPC9saT4KICAgICAgICAgICAgICAgICAgPC91bD4KCiAgICAgICAgICAgICAgICAgIDxkaXYgdi1lbHNlLWlmPSJlbGVtZW50LnR5cGUgPT09ICdjaGFydCciIGNsYXNzPSJwdi10aHVtYi1jaGFydCI+CiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0icHYtdGh1bWItY2hhcnQtaGVhZCI+CiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0icHYtdGh1bWItZG90Ij48L3NwYW4+CiAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj57eyBlbGVtZW50LmNvbnRlbnQgfX08L3NwYW4+CiAgICAgICAgICAgICAgICAgICAgPC9kaXY+CgogICAgICAgICAgICAgICAgICAgIDxkaXYKICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPSJwdi10aHVtYi1jaGFydC1jYW52YXMiCiAgICAgICAgICAgICAgICAgICAgICA6Y2xhc3M9Iidwdi10aHVtYi1jaGFydC1jYW52YXMtLScgKyBnZXRDaGFydEtpbmQoZWxlbWVudCkiCiAgICAgICAgICAgICAgICAgICAgICBhcmlhLWhpZGRlbj0idHJ1ZSIKICAgICAgICAgICAgICAgICAgICA+CiAgICAgICAgICAgICAgICAgICAgICA8dGVtcGxhdGUgdi1pZj0iZ2V0Q2hhcnRLaW5kKGVsZW1lbnQpID09PSAnbGluZSciPgogICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIHZpZXdCb3g9IjAgMCAxMDAgNDQiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPgogICAgICAgICAgICAgICAgICAgICAgICAgIDxwb2x5Z29uIGNsYXNzPSJwdi10aHVtYi1hcmVhIiA6cG9pbnRzPSJnZXRDaGFydEFyZWFQb2ludHMoZWxlbWVudCkiPjwvcG9seWdvbj4KICAgICAgICAgICAgICAgICAgICAgICAgICA8cG9seWxpbmUgY2xhc3M9InB2LXRodW1iLWxpbmUiIDpwb2ludHM9ImdldENoYXJ0UG9pbnRzKGVsZW1lbnQpIj48L3BvbHlsaW5lPgogICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz4KICAgICAgICAgICAgICAgICAgICAgIDwvdGVtcGxhdGU+CgogICAgICAgICAgICAgICAgICAgICAgPGRpdiB2LWVsc2UtaWY9ImdldENoYXJ0S2luZChlbGVtZW50KSA9PT0gJ2JhciciIGNsYXNzPSJwdi10aHVtYi1iYXJzIj4KICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4KICAgICAgICAgICAgICAgICAgICAgICAgICB2LWZvcj0iKGJhciwgYmFySW5kZXgpIGluIGdldENoYXJ0QmFycyhlbGVtZW50KSIKICAgICAgICAgICAgICAgICAgICAgICAgICA6a2V5PSJiYXJJbmRleCIKICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz0icHYtdGh1bWItYmFyIgogICAgICAgICAgICAgICAgICAgICAgICAgIDpjbGFzcz0iewogICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3B2LXRodW1iLWJhci0tYWN0aXZlJzoKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIGVsZW1lbnQuaGlnaGxpZ2h0SW5kZXggPT09ICdudW1iZXInICYmCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhckluZGV4ID09PSBlbGVtZW50LmhpZ2hsaWdodEluZGV4LAogICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3B2LXRodW1iLWJhci0tbXV0ZWQnOgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgZWxlbWVudC5oaWdobGlnaHRJbmRleCA9PT0gJ251bWJlcicgJiYKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFySW5kZXggIT09IGVsZW1lbnQuaGlnaGxpZ2h0SW5kZXgsCiAgICAgICAgICAgICAgICAgICAgICAgICAgfSIKICAgICAgICAgICAgICAgICAgICAgICAgICA6c3R5bGU9InsgaGVpZ2h0OiBiYXIgKyAnJScgfSIKICAgICAgICAgICAgICAgICAgICAgICAgPjwvc3Bhbj4KICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PgoKICAgICAgICAgICAgICAgICAgICAgIDxzcGFuCiAgICAgICAgICAgICAgICAgICAgICAgIHYtZWxzZS1pZj0iZ2V0Q2hhcnRLaW5kKGVsZW1lbnQpID09PSAncGllJyIKICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9InB2LXRodW1iLWRvbnV0IgogICAgICAgICAgICAgICAgICAgICAgICA6c3R5bGU9InsgYmFja2dyb3VuZDogZ2V0UGllR3JhZGllbnQoZWxlbWVudCkgfSIKICAgICAgICAgICAgICAgICAgICAgID48L3NwYW4+CgogICAgICAgICAgICAgICAgICAgICAgPGRpdiB2LWVsc2UtaWY9ImdldENoYXJ0S2luZChlbGVtZW50KSA9PT0gJ2Zsb3cnIiBjbGFzcz0icHYtdGh1bWItZmxvdyI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuCiAgICAgICAgICAgICAgICAgICAgICAgICAgdi1mb3I9Iihub2RlLCBub2RlSW5kZXgpIGluIGdldEZsb3dOb2RlcyhlbGVtZW50KSIKICAgICAgICAgICAgICAgICAgICAgICAgICA6a2V5PSJub2RlSW5kZXgiCiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9InB2LXRodW1iLW5vZGUiCiAgICAgICAgICAgICAgICAgICAgICAgID57eyBub2RlIH19PC9zcGFuPgogICAgICAgICAgICAgICAgICAgICAgPC9kaXY+CgogICAgICAgICAgICAgICAgICAgICAgPGRpdiB2LWVsc2UgY2xhc3M9InB2LXRodW1iLW1vY2siPgogICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiB2LWZvcj0ibW9ja0luZGV4IGluIDMiIDprZXk9Im1vY2tJbmRleCI+PC9zcGFuPgogICAgICAgICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICAgIDwvZGl2PgoKICAgICAgICAgICAgICAgICAgPGRpdiB2LWVsc2UtaWY9ImVsZW1lbnQudHlwZSA9PT0gJ2ltYWdlJyIgY2xhc3M9InB2LXRodW1iLWltYWdlIj4KICAgICAgICAgICAgICAgICAgICA8aW1nIDpzcmM9ImVsZW1lbnQudXJsIiA6YWx0PSJlbGVtZW50LmFsdCB8fCAnJyIgLz4KICAgICAgICAgICAgICAgICAgPC9kaXY+CgogICAgICAgICAgICAgICAgICA8YmxvY2txdW90ZSB2LWVsc2UtaWY9ImVsZW1lbnQudHlwZSA9PT0gJ3F1b3RlJyIgY2xhc3M9InB2LXRodW1iLXF1b3RlIj4KICAgICAgICAgICAgICAgICAgICB7eyBlbGVtZW50LmNvbnRlbnQgfX0KICAgICAgICAgICAgICAgICAgPC9ibG9ja3F1b3RlPgoKICAgICAgICAgICAgICAgICAgPGRpdiB2LWVsc2UtaWY9ImVsZW1lbnQudHlwZSA9PT0gJ3RhYmxlJyIgY2xhc3M9InB2LXRodW1iLXRhYmxlIj4KICAgICAgICAgICAgICAgICAgICA8ZGl2CiAgICAgICAgICAgICAgICAgICAgICB2LWZvcj0iKHJvdywgckluZGV4KSBpbiAoZWxlbWVudC5kYXRhIHx8IFtdKS5zbGljZSgwLCAzKSIKICAgICAgICAgICAgICAgICAgICAgIDprZXk9InJJbmRleCIKICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPSJwdi10aHVtYi10YWJsZS1yb3ciCiAgICAgICAgICAgICAgICAgICAgPgogICAgICAgICAgICAgICAgICAgICAgPHNwYW4KICAgICAgICAgICAgICAgICAgICAgICAgdi1mb3I9IihjZWxsLCBjSW5kZXgpIGluIChyb3cgfHwgW10pLnNsaWNlKDAsIDMpIgogICAgICAgICAgICAgICAgICAgICAgICA6a2V5PSJjSW5kZXgiCiAgICAgICAgICAgICAgICAgICAgICA+e3sgY2VsbCB9fTwvc3Bhbj4KICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICA8L3RlbXBsYXRlPgogICAgICAgICAgICAgIDwvZGl2PgoKICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJwdi10aHVtYi1mb290Ij4KICAgICAgICAgICAgICAgIDxzcGFuPnt7IGFjY291bnREYXRhLnRpdGxlIH19PC9zcGFuPgogICAgICAgICAgICAgICAgPHNwYW4+e3sgcGFkKGlkeCArIDEpIH19PC9zcGFuPgogICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICA8L3RlbXBsYXRlPgogICAgICAgICAgPC9kaXY+CgogICAgICAgICAgPGRpdiBjbGFzcz0icHYtY2FyZC1tZXRhIj4KICAgICAgICAgICAgPHNwYW4gY2xhc3M9InB2LWNhcmQtaW5kZXgiPnt7IHBhZChpZHggKyAxKSB9fTwvc3Bhbj4KICAgICAgICAgICAgPHNwYW4gY2xhc3M9InB2LWNhcmQta2luZCI+e3sgZ2V0U2xpZGVUeXBlTGFiZWwoc2xpZGUpIH19PC9zcGFuPgogICAgICAgICAgICA8c3BhbiBjbGFzcz0icHYtY2FyZC1vcGVuIj4KICAgICAgICAgICAgICDmn6XnnIsKICAgICAgICAgICAgICA8c3ZnIHZpZXdCb3g9IjAgMCAyNCAyNCIgYXJpYS1oaWRkZW49InRydWUiPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTUgMTJoMTRNMTMgNmw2IDYtNiA2IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIxLjgiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PC9wYXRoPgogICAgICAgICAgICAgIDwvc3ZnPgogICAgICAgICAgICA8L3NwYW4+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICA8L2FydGljbGU+CiAgICAgIDwvbWFpbj4KCiAgICAgIDxmb290ZXIgY2xhc3M9InB2LWZvb3RlciI+CiAgICAgICAgPHNwYW4+CiAgICAgICAgICB7eyBhY2NvdW50RGF0YS5wcmVzZW50ZXIgfX0KICAgICAgICAgIDx0ZW1wbGF0ZSB2LWlmPSJhY2NvdW50RGF0YS5vY2Nhc2lvbiI+IMK3IHt7IGFjY291bnREYXRhLm9jY2FzaW9uIH19PC90ZW1wbGF0ZT4KICAgICAgICA8L3NwYW4+CiAgICAgICAgPHNwYW4+54K55Ye75Lu75oSP6aG16Z2i5byA5aeL5pS+5pigPC9zcGFuPgogICAgICA8L2Zvb3Rlcj4KICAgIDwvZGl2PgoKICAgIDwhLS0gPT09PT09PT09PT09IOWFqOWxj+aUvuaYoCA9PT09PT09PT09PT0gLS0+CiAgICA8ZGl2CiAgICAgIHYtaWY9ImlzUHJlc2VudGF0aW9uIgogICAgICBjbGFzcz0icHYtb3ZlcmxheSIKICAgICAgcm9sZT0iZGlhbG9nIgogICAgICBhcmlhLW1vZGFsPSJ0cnVlIgogICAgICBhcmlhLWxhYmVsPSLlubvnga/niYfmlL7mmKAiCiAgICA+CiAgICAgIDxkaXYgY2xhc3M9InB2LXRvb2xiYXIiIDpjbGFzcz0ieyAncHYtdG9vbGJhci0taWRsZSc6IHRvb2xiYXJJZGxlIH0iPgogICAgICAgIDxidXR0b24gY2xhc3M9InB2LXRvb2wtYnRuIiB0eXBlPSJidXR0b24iIGFyaWEtbGFiZWw9IuS4iuS4gOmhtSIgQGNsaWNrPSJwcmV2U2xpZGUiPgogICAgICAgICAgPHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIGFyaWEtaGlkZGVuPSJ0cnVlIj4KICAgICAgICAgICAgPHBhdGggZD0iTTE1IDE4bC02LTYgNi02IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIxLjgiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PC9wYXRoPgogICAgICAgICAgPC9zdmc+CiAgICAgICAgPC9idXR0b24+CgogICAgICAgIDxzcGFuIGNsYXNzPSJwdi1jb3VudGVyIiBhcmlhLWxpdmU9InBvbGl0ZSI+CiAgICAgICAgICA8c3Ryb25nPnt7IHBhZChjdXJyZW50U2xpZGVJbmRleCArIDEpIH19PC9zdHJvbmc+CiAgICAgICAgICA8c3Bhbj4vIHt7IHBhZCh0b3RhbFNsaWRlcykgfX08L3NwYW4+CiAgICAgICAgPC9zcGFuPgoKICAgICAgICA8YnV0dG9uIGNsYXNzPSJwdi10b29sLWJ0biIgdHlwZT0iYnV0dG9uIiBhcmlhLWxhYmVsPSLkuIvkuIDpobUiIEBjbGljaz0ibmV4dFNsaWRlIj4KICAgICAgICAgIDxzdmcgdmlld0JveD0iMCAwIDI0IDI0IiBhcmlhLWhpZGRlbj0idHJ1ZSI+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik05IDZsNiA2LTYgNiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMS44IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjwvcGF0aD4KICAgICAgICAgIDwvc3ZnPgogICAgICAgIDwvYnV0dG9uPgoKICAgICAgICA8YnV0dG9uCiAgICAgICAgICBjbGFzcz0icHYtdG9vbC1idG4gcHYtZXhwb3J0LWJ0biIKICAgICAgICAgIHR5cGU9ImJ1dHRvbiIKICAgICAgICAgIGFyaWEtbGFiZWw9IuWvvOWHuuW9k+WJjeW5u+eBr+eJh+S4uuWbvueJhyIKICAgICAgICAgIHRpdGxlPSLlr7zlh7rlvZPliY3pobXkuLogUE5HIOWbvueJhyIKICAgICAgICAgIDpkaXNhYmxlZD0iaXNFeHBvcnRpbmciCiAgICAgICAgICA6YXJpYS1idXN5PSJpc0V4cG9ydGluZyIKICAgICAgICAgIEBjbGljaz0iZXhwb3J0Q3VycmVudFNsaWRlIgogICAgICAgID4KICAgICAgICAgIDxzcGFuIHYtaWY9ImlzRXhwb3J0aW5nIiBjbGFzcz0icHYtZXhwb3J0LXNwaW5uZXIiIGFyaWEtaGlkZGVuPSJ0cnVlIj48L3NwYW4+CiAgICAgICAgICA8c3ZnIHYtZWxzZSB2aWV3Qm94PSIwIDAgMjQgMjQiIGFyaWEtaGlkZGVuPSJ0cnVlIj4KICAgICAgICAgICAgPHBhdGggZD0iTTEyIDN2MTFtMCAwbC00LTRtNCA0bDQtNE01IDE1djRhMiAyIDAgMCAwIDIgMmgxMGEyIDIgMCAwIDAgMi0ydi00IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIxLjgiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PC9wYXRoPgogICAgICAgICAgPC9zdmc+CiAgICAgICAgICA8c3BhbiBjbGFzcz0icHYtZXhwb3J0LWxhYmVsIj57eyBpc0V4cG9ydGluZyA/ICLlr7zlh7rkuK0iIDogIuWvvOWHuiIgfX08L3NwYW4+CiAgICAgICAgPC9idXR0b24+CgogICAgICAgIDxzcGFuIGNsYXNzPSJwdi10b29sYmFyLWRpdmlkZXIiPjwvc3Bhbj4KCiAgICAgICAgPGJ1dHRvbiBjbGFzcz0icHYtZXhpdC1idG4iIHR5cGU9ImJ1dHRvbiIgQGNsaWNrPSJleGl0UHJlc2VudGF0aW9uIj4KICAgICAgICAgIDxzcGFuPumAgOWHuuaUvuaYoDwvc3Bhbj4KICAgICAgICAgIDxrYmQ+RXNjPC9rYmQ+CiAgICAgICAgPC9idXR0b24+CiAgICAgIDwvZGl2PgoKICAgICAgPGRpdiBjbGFzcz0icHYtcm90YXRlLWhpbnQiIGFyaWEtaGlkZGVuPSJ0cnVlIj4KICAgICAgICDmqKrlsY/op4LnnIvmlYjmnpzmm7TkvbMKICAgICAgPC9kaXY+CgogICAgICA8ZGl2CiAgICAgICAgdi1pZj0iaXNFeHBvcnRpbmcgfHwgZXhwb3J0Tm90aWNlIgogICAgICAgIGNsYXNzPSJwdi1leHBvcnQtdG9hc3QiCiAgICAgICAgOmNsYXNzPSJ7ICdwdi1leHBvcnQtdG9hc3QtLWVycm9yJzogZXhwb3J0Tm90aWNlVHlwZSA9PT0gJ2Vycm9yJyB9IgogICAgICAgIGFyaWEtbGl2ZT0icG9saXRlIgogICAgICA+CiAgICAgICAgPHNwYW4gdi1pZj0iaXNFeHBvcnRpbmciIGNsYXNzPSJwdi1leHBvcnQtc3Bpbm5lciIgYXJpYS1oaWRkZW49InRydWUiPjwvc3Bhbj4KICAgICAgICA8c3Bhbj57eyBpc0V4cG9ydGluZyA/ICLmraPlnKjlr7zlh7rlvZPliY3pobXigKYiIDogZXhwb3J0Tm90aWNlIH19PC9zcGFuPgogICAgICA8L2Rpdj4KCiAgICAgIDxkaXYKICAgICAgICBjbGFzcz0icHYtc3RhZ2UiCiAgICAgICAgOnN0eWxlPSJ7ICctLXB2LXN0YWdlLXNjYWxlJzogc3RhZ2VTY2FsZSB9IgogICAgICA+CiAgICAgICAgPGRpdiBjbGFzcz0ic2xpZGVzIj4KICAgICAgICAgIDxzZWN0aW9uCiAgICAgICAgICAgIHYtZm9yPSIoc2xpZGUsIHNJZHgpIGluIGFjY291bnREYXRhLnNsaWRlcyIKICAgICAgICAgICAgOmtleT0iJ3JldmVhbC0nICsgc2xpZGUuaWQiCiAgICAgICAgICAgIGNsYXNzPSJycy1zbGlkZSIKICAgICAgICAgICAgOmNsYXNzPSJbCiAgICAgICAgICAgICAgJ3JzLWRlbnNpdHktJyArIGdldFNsaWRlRGVuc2l0eShzbGlkZSksCiAgICAgICAgICAgICAgc2xpZGUudHlwZSA9PT0gJ3RpdGxlJyA/ICdycy1zbGlkZS0tY292ZXInIDogJycsCiAgICAgICAgICAgICAgc2xpZGUudHlwZSA9PT0gJ3N1bW1hcnknID8gJ3JzLXNsaWRlLS1zdW1tYXJ5JyA6ICcnLAogICAgICAgICAgICAgIHsgJ2lzLWN1cnJlbnQnOiBzSWR4ID09PSBjdXJyZW50U2xpZGVJbmRleCB9LAogICAgICAgICAgICBdIgogICAgICAgICAgICA6ZGF0YS1zbGlkZS1pZD0ic2xpZGUuaWQiCiAgICAgICAgICAgIDphcmlhLWxhYmVsPSIn56ysICcgKyAoc0lkeCArIDEpICsgJyDpobXvvJonICsgc2xpZGUudGl0bGUiCiAgICAgICAgICAgIDphcmlhLWhpZGRlbj0ic0lkeCA9PT0gY3VycmVudFNsaWRlSW5kZXggPyAnZmFsc2UnIDogJ3RydWUnIgogICAgICAgICAgPgogICAgICAgICAgICA8IS0tID09PT09IOWwgemdoiA9PT09PSAtLT4KICAgICAgICAgICAgPHRlbXBsYXRlIHYtaWY9InNsaWRlLnR5cGUgPT09ICd0aXRsZSciPgogICAgICAgICAgICAgIDxkaXYgY2xhc3M9InJzLWNvdmVyLWJnIiBhcmlhLWhpZGRlbj0idHJ1ZSI+CiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0icnMtY292ZXItZ3JpZCI+PC9zcGFuPgogICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9InJzLWNvdmVyLWdsb3ciPjwvc3Bhbj4KICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJycy1jb3Zlci1heGlzIj48L3NwYW4+CiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0icnMtY292ZXItcmluZyBycy1jb3Zlci1yaW5nLS0xIj48L3NwYW4+CiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0icnMtY292ZXItcmluZyBycy1jb3Zlci1yaW5nLS0yIj48L3NwYW4+CiAgICAgICAgICAgICAgPC9kaXY+CgogICAgICAgICAgICAgIDxkaXYgY2xhc3M9InJzLWNvdmVyLWZyYW1lIj4KICAgICAgICAgICAgICAgIDxkaXYKICAgICAgICAgICAgICAgICAgY2xhc3M9InJzLWNvdmVyLXRvcCBycy1hbmltLXRhcmdldCBycy1hbmltLWZhZGUtaW4iCiAgICAgICAgICAgICAgICAgIDpzdHlsZT0ieyAnLS1hbmltLWRlbGF5JzogJzBtcycgfSIKICAgICAgICAgICAgICAgID4KICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9InJzLWNvdmVyLW1hcmsiPjxzcGFuPjwvc3Bhbj5QUkVTRU5UQVRJT048L3NwYW4+CiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJycy1jb3Zlci1kZWNrIj57eyBhY2NvdW50RGF0YS50aXRsZSB9fTwvc3Bhbj4KICAgICAgICAgICAgICAgIDwvZGl2PgoKICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9InJzLWNvdmVyLW1haW4iPgogICAgICAgICAgICAgICAgICA8ZGl2CiAgICAgICAgICAgICAgICAgICAgY2xhc3M9InJzLWNvdmVyLWtpY2tlciBycy1hbmltLXRhcmdldCBycy1hbmltLXNsaWRlLWRvd24iCiAgICAgICAgICAgICAgICAgICAgOnN0eWxlPSJ7ICctLWFuaW0tZGVsYXknOiAnNzBtcycgfSIKICAgICAgICAgICAgICAgICAgPgogICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJycy1jb3Zlci1raWNrZXItbGluZSI+PC9zcGFuPgogICAgICAgICAgICAgICAgICAgIDxzcGFuPkVYRUNVVElWRSBCUklFRjwvc3Bhbj4KICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0icnMtY292ZXIta2lja2VyLW5vIj4vIHt7IHBhZChzSWR4ICsgMSkgfX08L3NwYW4+CiAgICAgICAgICAgICAgICAgIDwvZGl2PgoKICAgICAgICAgICAgICAgICAgPGgxCiAgICAgICAgICAgICAgICAgICAgY2xhc3M9InJzLWNvdmVyLXRpdGxlIHJzLWFuaW0tdGFyZ2V0IHJzLWFuaW0tZmFkZS11cCIKICAgICAgICAgICAgICAgICAgICA6c3R5bGU9InsgJy0tYW5pbS1kZWxheSc6ICcxNTBtcycgfSIKICAgICAgICAgICAgICAgICAgPnt7IHNsaWRlLnRpdGxlIH19PC9oMT4KCiAgICAgICAgICAgICAgICAgIDxwCiAgICAgICAgICAgICAgICAgICAgdi1mb3I9IihlbGVtZW50LCBlbGVtZW50SW5kZXgpIGluIGdldENvdmVyVGV4dHMoc2xpZGUpIgogICAgICAgICAgICAgICAgICAgIDprZXk9Iidjb3Zlci10ZXh0LScgKyBlbGVtZW50SW5kZXgiCiAgICAgICAgICAgICAgICAgICAgY2xhc3M9InJzLWNvdmVyLXN1YnRpdGxlIHJzLWFuaW0tdGFyZ2V0IHJzLWFuaW0tZmFkZS11cCIKICAgICAgICAgICAgICAgICAgICA6c3R5bGU9InsgJy0tYW5pbS1kZWxheSc6IDI2MCArIGVsZW1lbnRJbmRleCAqIDEwMCArICdtcycgfSIKICAgICAgICAgICAgICAgICAgPnt7IGVsZW1lbnQuY29udGVudCB9fTwvcD4KICAgICAgICAgICAgICAgIDwvZGl2PgoKICAgICAgICAgICAgICAgIDxkaXYKICAgICAgICAgICAgICAgICAgY2xhc3M9InJzLWNvdmVyLWZvb3QgcnMtYW5pbS10YXJnZXQgcnMtYW5pbS1mYWRlLWluIgogICAgICAgICAgICAgICAgICA6c3R5bGU9InsgJy0tYW5pbS1kZWxheSc6ICc0ODBtcycgfSIKICAgICAgICAgICAgICAgID4KICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9InJzLWNvdmVyLXByZXNlbnRlciI+CiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9InJzLWNvdmVyLWF2YXRhciI+e3sgcHJlc2VudGVySW5pdGlhbCB9fTwvc3Bhbj4KICAgICAgICAgICAgICAgICAgICA8c3Bhbj57eyBhY2NvdW50RGF0YS5wcmVzZW50ZXIgfX08L3NwYW4+CiAgICAgICAgICAgICAgICAgIDwvc3Bhbj4KICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9InJzLWNvdmVyLXBhZ2UiPnt7IHBhZChzSWR4ICsgMSkgfX0gLyB7eyBwYWQodG90YWxTbGlkZXMpIH19PC9zcGFuPgogICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgIDwvdGVtcGxhdGU+CgogICAgICAgICAgICA8IS0tID09PT09IOWGheWuuemhtSA9PT09PSAtLT4KICAgICAgICAgICAgPHRlbXBsYXRlIHYtZWxzZT4KICAgICAgICAgICAgICA8aGVhZGVyIGNsYXNzPSJycy1oZWFkZXIiPgogICAgICAgICAgICAgICAgPGRpdgogICAgICAgICAgICAgICAgICBjbGFzcz0icnMtZXllYnJvdyBycy1hbmltLXRhcmdldCBycy1hbmltLWZhZGUtaW4iCiAgICAgICAgICAgICAgICAgIDpzdHlsZT0ieyAnLS1hbmltLWRlbGF5JzogJzBtcycgfSIKICAgICAgICAgICAgICAgID4KICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9InJzLWV5ZWJyb3ctaW5kZXgiPnt7IHBhZChzSWR4ICsgMSkgfX08L3NwYW4+CiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJycy1leWVicm93LXJ1bGUiPjwvc3Bhbj4KICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9InJzLWV5ZWJyb3ctbGFiZWwiPnt7IGdldFNsaWRlVHlwZUxhYmVsKHNsaWRlKSB9fTwvc3Bhbj4KICAgICAgICAgICAgICAgIDwvZGl2PgoKICAgICAgICAgICAgICAgIDxoMgogICAgICAgICAgICAgICAgICBjbGFzcz0icnMtaGVhZGVyLXRpdGxlIHJzLWFuaW0tdGFyZ2V0IHJzLWFuaW0tZmFkZS11cCIKICAgICAgICAgICAgICAgICAgOnN0eWxlPSJ7ICctLWFuaW0tZGVsYXknOiAnODBtcycgfSIKICAgICAgICAgICAgICAgID57eyBzbGlkZS50aXRsZSB9fTwvaDI+CiAgICAgICAgICAgICAgPC9oZWFkZXI+CgogICAgICAgICAgICAgIDxkaXYgY2xhc3M9InJzLWJvZHkiIDpjbGFzcz0iJ3JzLWJvZHktLScgKyBnZXRCb2R5TGF5b3V0KHNsaWRlKSI+CiAgICAgICAgICAgICAgICA8ZGl2CiAgICAgICAgICAgICAgICAgIHYtZm9yPSIoZWxlbWVudCwgZUluZGV4KSBpbiAoc2xpZGUuZWxlbWVudHMgfHwgW10pIgogICAgICAgICAgICAgICAgICA6a2V5PSInZWxlbWVudC0nICsgZUluZGV4IgogICAgICAgICAgICAgICAgICBjbGFzcz0icnMtYmxvY2siCiAgICAgICAgICAgICAgICAgIDpjbGFzcz0iWydycy1ibG9jay0tJyArIGVsZW1lbnQudHlwZSwgZ2V0QmxvY2tHcmlkU3BhbihzbGlkZSwgZWxlbWVudCwgZUluZGV4KV0iCiAgICAgICAgICAgICAgICA+CiAgICAgICAgICAgICAgICAgIDxwCiAgICAgICAgICAgICAgICAgICAgdi1pZj0iZWxlbWVudC50eXBlID09PSAndGV4dCciCiAgICAgICAgICAgICAgICAgICAgY2xhc3M9InJzLXRleHQgcnMtYW5pbS10YXJnZXQgcnMtYW5pbS1mYWRlLXVwIgogICAgICAgICAgICAgICAgICAgIDpjbGFzcz0ieyAncnMtdGV4dC0tc3RhdGVtZW50JzogZ2V0Qm9keUxheW91dChzbGlkZSkgPT09ICdzb2xvJyB9IgogICAgICAgICAgICAgICAgICAgIDpzdHlsZT0iYW5pbVRleHRTdHlsZShlbGVtZW50LCBzbGlkZSwgZUluZGV4KSIKICAgICAgICAgICAgICAgICAgPnt7IGVsZW1lbnQuY29udGVudCB9fTwvcD4KCiAgICAgICAgICAgICAgICAgIDx1bAogICAgICAgICAgICAgICAgICAgIHYtZWxzZS1pZj0iZWxlbWVudC50eXBlID09PSAnbGlzdCciCiAgICAgICAgICAgICAgICAgICAgY2xhc3M9InJzLWxpc3QiCiAgICAgICAgICAgICAgICAgID4KICAgICAgICAgICAgICAgICAgICA8bGkKICAgICAgICAgICAgICAgICAgICAgIHYtZm9yPSIoaXRlbSwgbEluZGV4KSBpbiBlbGVtZW50LmNvbnRlbnQiCiAgICAgICAgICAgICAgICAgICAgICA6a2V5PSInbGlzdC0nICsgbEluZGV4IgogICAgICAgICAgICAgICAgICAgICAgY2xhc3M9InJzLWxpc3QtaXRlbSBycy1hbmltLXRhcmdldCBycy1hbmltLWZhZGUtdXAiCiAgICAgICAgICAgICAgICAgICAgICA6c3R5bGU9InsgJy0tYW5pbS1kZWxheSc6IGFuaW1CbG9ja0RlbGF5KGVJbmRleCwgbEluZGV4KSArICdtcycgfSIKICAgICAgICAgICAgICAgICAgICA+CiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0icnMtbGlzdC1pbmRleCI+e3sgcGFkKGxJbmRleCArIDEpIH19PC9zcGFuPgogICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9InJzLWxpc3QtdGV4dCI+e3sgaXRlbSB9fTwvc3Bhbj4KICAgICAgICAgICAgICAgICAgICA8L2xpPgogICAgICAgICAgICAgICAgICA8L3VsPgoKICAgICAgICAgICAgICAgICAgPGRpdgogICAgICAgICAgICAgICAgICAgIHYtZWxzZS1pZj0iZWxlbWVudC50eXBlID09PSAnY2hhcnQnIgogICAgICAgICAgICAgICAgICAgIGNsYXNzPSJycy1jaGFydCBycy1hbmltLXRhcmdldCBycy1hbmltLWZhZGUtdXAiCiAgICAgICAgICAgICAgICAgICAgOmNsYXNzPSJ7ICdycy1jaGFydC0tZGlhZ3JhbSc6IGVsZW1lbnQuY2hhcnRUeXBlID09PSAnbWVybWFpZCcgfSIKICAgICAgICAgICAgICAgICAgICA6c3R5bGU9InsgJy0tYW5pbS1kZWxheSc6IGFuaW1CbG9ja0RlbGF5KGVJbmRleCwgMCkgKyAnbXMnIH0iCiAgICAgICAgICAgICAgICAgID4KICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJycy1jaGFydC1oZWFkIj4KICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9InJzLWNoYXJ0LWhlYWRpbmciPgogICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0icnMtY2hhcnQtbWFyayI+PC9zcGFuPgogICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0icnMtY2hhcnQtdGl0bGUiPnt7IGVsZW1lbnQuY29udGVudCB9fTwvc3Bhbj4KICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PgoKICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9InJzLWNoYXJ0LWhlYWQtcmlnaHQiPgogICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0icnMtY2hhcnQtZmlnIj5GSUcuIHt7IHBhZChlSW5kZXggKyAxKSB9fTwvc3Bhbj4KICAgICAgICAgICAgICAgICAgICAgICAgPGRpdgogICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPSJycy1jaGFydC16b29tLXRvb2xzIgogICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPSLmu5rova7nvKnmlL7vvIzmi5bliqjlubPnp7vvvIzlj4zlh7vlpI3kvY0iCiAgICAgICAgICAgICAgICAgICAgICAgICAgQHBvaW50ZXJkb3duLnN0b3AKICAgICAgICAgICAgICAgICAgICAgICAgICBAZGJsY2xpY2suc3RvcAogICAgICAgICAgICAgICAgICAgICAgICA+CiAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbgogICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9InJzLWNoYXJ0LXpvb20tYnRuIgogICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT0iYnV0dG9uIgogICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD0i57yp5bCP5Zu+6KGoIgogICAgICAgICAgICAgICAgICAgICAgICAgICAgOmRpc2FibGVkPSJnZXRDaGFydFpvb20oc2xpZGUsIGVJbmRleCkgPD0gMC41IgogICAgICAgICAgICAgICAgICAgICAgICAgICAgQGNsaWNrLnN0b3A9Inpvb21DaGFydChzbGlkZSwgZUluZGV4LCAtMC4xNSkiCiAgICAgICAgICAgICAgICAgICAgICAgICAgPuKIkjwvYnV0dG9uPgogICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24KICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPSJycy1jaGFydC16b29tLXZhbHVlIgogICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT0iYnV0dG9uIgogICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9IuaBouWkjSAxMDAlIgogICAgICAgICAgICAgICAgICAgICAgICAgICAgQGNsaWNrLnN0b3A9InJlc2V0Q2hhcnRab29tKHNsaWRlLCBlSW5kZXgpIgogICAgICAgICAgICAgICAgICAgICAgICAgID57eyBnZXRDaGFydFpvb21QZXJjZW50KHNsaWRlLCBlSW5kZXgpIH19PC9idXR0b24+CiAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbgogICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9InJzLWNoYXJ0LXpvb20tYnRuIgogICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT0iYnV0dG9uIgogICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD0i5pS+5aSn5Zu+6KGoIgogICAgICAgICAgICAgICAgICAgICAgICAgICAgOmRpc2FibGVkPSJnZXRDaGFydFpvb20oc2xpZGUsIGVJbmRleCkgPj0gMyIKICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBjbGljay5zdG9wPSJ6b29tQ2hhcnQoc2xpZGUsIGVJbmRleCwgMC4xNSkiCiAgICAgICAgICAgICAgICAgICAgICAgICAgPis8L2J1dHRvbj4KICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KCiAgICAgICAgICAgICAgICAgICAgPGRpdgogICAgICAgICAgICAgICAgICAgICAgY2xhc3M9InJzLWNoYXJ0LWlubmVyIgogICAgICAgICAgICAgICAgICAgICAgOmNsYXNzPSJ7ICdycy1jaGFydC1pbm5lci0tZGlhZ3JhbSc6IGVsZW1lbnQuY2hhcnRUeXBlID09PSAnbWVybWFpZCcgfSIKICAgICAgICAgICAgICAgICAgICAgIDpzdHlsZT0iCiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuY2hhcnRUeXBlID09PSAnbWVybWFpZCcKICAgICAgICAgICAgICAgICAgICAgICAgICA/IHsgYXNwZWN0UmF0aW86IFN0cmluZyhnZXREaWFncmFtQXNwZWN0KHNsaWRlLCBlSW5kZXgpKSB9CiAgICAgICAgICAgICAgICAgICAgICAgICAgOiBudWxsCiAgICAgICAgICAgICAgICAgICAgICAiCiAgICAgICAgICAgICAgICAgICAgICBAd2hlZWwucHJldmVudD0iaGFuZGxlQ2hhcnRXaGVlbCgkZXZlbnQsIHNsaWRlLCBlSW5kZXgpIgogICAgICAgICAgICAgICAgICAgICAgQGRibGNsaWNrPSJyZXNldENoYXJ0Wm9vbShzbGlkZSwgZUluZGV4KSIKICAgICAgICAgICAgICAgICAgICA+CiAgICAgICAgICAgICAgICAgICAgICA8ZGl2CiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPSJycy1jaGFydC16b29tIgogICAgICAgICAgICAgICAgICAgICAgICA6Y2xhc3M9InsgJ2lzLXBhbm5pbmcnOiBpc0NoYXJ0UGFubmluZyhzbGlkZSwgZUluZGV4KSB9IgogICAgICAgICAgICAgICAgICAgICAgICA6c3R5bGU9ImdldENoYXJ0Wm9vbVN0eWxlKHNsaWRlLCBlSW5kZXgpIgogICAgICAgICAgICAgICAgICAgICAgICA6ZGF0YS1jaGFydC1rZXk9ImNoYXJ0S2V5KHNsaWRlLCBlSW5kZXgpIgogICAgICAgICAgICAgICAgICAgICAgICBAcG9pbnRlcmRvd249InN0YXJ0Q2hhcnRQYW4oJGV2ZW50KSIKICAgICAgICAgICAgICAgICAgICAgID4KICAgICAgICAgICAgICAgICAgICAgICAgPGNhbnZhcwogICAgICAgICAgICAgICAgICAgICAgICAgIHYtaWY9ImVsZW1lbnQuY2hhcnRUeXBlID09PSAnY2hhcnRqcyciCiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9InJzLWNoYXJ0LWNhbnZhcyIKICAgICAgICAgICAgICAgICAgICAgICAgICByb2xlPSJpbWciCiAgICAgICAgICAgICAgICAgICAgICAgICAgOmFyaWEtbGFiZWw9ImVsZW1lbnQuY29udGVudCB8fCAn5pWw5o2u5Zu+6KGoJyIKICAgICAgICAgICAgICAgICAgICAgICAgICA6ZGF0YS1jaGFydC1rZXk9IidyZXZlYWwtJyArIHNsaWRlLmlkICsgJy0nICsgZUluZGV4IgogICAgICAgICAgICAgICAgICAgICAgICA+PC9jYW52YXM+CiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYKICAgICAgICAgICAgICAgICAgICAgICAgICB2LWVsc2UtaWY9ImVsZW1lbnQuY2hhcnRUeXBlID09PSAnbWVybWFpZCciCiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9InJzLW1lcm1haWQiCiAgICAgICAgICAgICAgICAgICAgICAgICAgcm9sZT0iaW1nIgogICAgICAgICAgICAgICAgICAgICAgICAgIDphcmlhLWxhYmVsPSJlbGVtZW50LmNvbnRlbnQgfHwgJ+a1geeoi+WbviciCiAgICAgICAgICAgICAgICAgICAgICAgICAgOmRhdGEtbWVybWFpZC1rZXk9IidyZXZlYWwtJyArIHNsaWRlLmlkICsgJy0nICsgZUluZGV4IgogICAgICAgICAgICAgICAgICAgICAgICA+PC9kaXY+CiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgdi1lbHNlIGNsYXNzPSJycy1jaGFydC1mYWxsYmFjayI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9InJzLWNoYXJ0LWZhbGxiYWNrLW1hcmsiPjwvc3Bhbj4KICAgICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj57eyBlbGVtZW50LmNvbnRlbnQgfX08L3NwYW4+CiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgICAgICAgPC9kaXY+CgogICAgICAgICAgICAgICAgICAgICAgPGRpdgogICAgICAgICAgICAgICAgICAgICAgICB2LWlmPSJpc0NoYXJ0VW5hdmFpbGFibGUoc2xpZGUsIGVJbmRleCwgZWxlbWVudCkiCiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPSJycy1jaGFydC1mYWxsYmFjayBycy1jaGFydC1mYWxsYmFjay0tb3ZlcmxheSIKICAgICAgICAgICAgICAgICAgICAgID4KICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9InJzLWNoYXJ0LWZhbGxiYWNrLW1hcmsiPjwvc3Bhbj4KICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+e3sgZWxlbWVudC5jb250ZW50IH19PC9zcGFuPgogICAgICAgICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgICAgICAgPC9kaXY+CgogICAgICAgICAgICAgICAgICAgIDxkaXYgdi1pZj0iZWxlbWVudC5zb3VyY2UiIGNsYXNzPSJycy1jaGFydC1zb3VyY2UiPgogICAgICAgICAgICAgICAgICAgICAg5pWw5o2u5p2l5rqQ77yae3sgZWxlbWVudC5zb3VyY2UgfX0KICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgICAgPC9kaXY+CgogICAgICAgICAgICAgICAgICA8ZmlndXJlCiAgICAgICAgICAgICAgICAgICAgdi1lbHNlLWlmPSJlbGVtZW50LnR5cGUgPT09ICdpbWFnZSciCiAgICAgICAgICAgICAgICAgICAgY2xhc3M9InJzLWZpZ3VyZSBycy1hbmltLXRhcmdldCBycy1hbmltLXNjYWxlLWluIgogICAgICAgICAgICAgICAgICAgIDpzdHlsZT0ieyAnLS1hbmltLWRlbGF5JzogYW5pbUJsb2NrRGVsYXkoZUluZGV4LCAwKSArICdtcycgfSIKICAgICAgICAgICAgICAgICAgPgogICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9InJzLWltYWdlLWJveCI+CiAgICAgICAgICAgICAgICAgICAgICA8aW1nCiAgICAgICAgICAgICAgICAgICAgICAgIDpzcmM9ImVsZW1lbnQudXJsIgogICAgICAgICAgICAgICAgICAgICAgICA6YWx0PSJlbGVtZW50LmFsdCB8fCAnJyIKICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9InJzLWltZyIKICAgICAgICAgICAgICAgICAgICAgICAgOnN0eWxlPSJ7CiAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0Rml0OiBlbGVtZW50LmZpdCB8fCAnY292ZXInLAogICAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdFBvc2l0aW9uOiBlbGVtZW50LnBvc2l0aW9uIHx8ICdjZW50ZXInLAogICAgICAgICAgICAgICAgICAgICAgICB9IgogICAgICAgICAgICAgICAgICAgICAgLz4KICAgICAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgICAgICA8ZmlnY2FwdGlvbiB2LWlmPSJlbGVtZW50LmFsdCIgY2xhc3M9InJzLWZpZ3VyZS1jYXB0aW9uIj4KICAgICAgICAgICAgICAgICAgICAgIHt7IGVsZW1lbnQuYWx0IH19CiAgICAgICAgICAgICAgICAgICAgPC9maWdjYXB0aW9uPgogICAgICAgICAgICAgICAgICA8L2ZpZ3VyZT4KCiAgICAgICAgICAgICAgICAgIDxibG9ja3F1b3RlCiAgICAgICAgICAgICAgICAgICAgdi1lbHNlLWlmPSJlbGVtZW50LnR5cGUgPT09ICdxdW90ZSciCiAgICAgICAgICAgICAgICAgICAgY2xhc3M9InJzLXF1b3RlIHJzLWFuaW0tdGFyZ2V0IHJzLWFuaW0tZmFkZS11cCIKICAgICAgICAgICAgICAgICAgICA6c3R5bGU9InsgJy0tYW5pbS1kZWxheSc6IGFuaW1CbG9ja0RlbGF5KGVJbmRleCwgMCkgKyAnbXMnIH0iCiAgICAgICAgICAgICAgICAgID4KICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0icnMtcXVvdGUtbWFyayIgYXJpYS1oaWRkZW49InRydWUiPuKAnDwvc3Bhbj4KICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz0icnMtcXVvdGUtdGV4dCI+e3sgZWxlbWVudC5jb250ZW50IH19PC9wPgogICAgICAgICAgICAgICAgICAgIDxjaXRlIHYtaWY9ImVsZW1lbnQuY2l0ZSIgY2xhc3M9InJzLXF1b3RlLWNpdGUiPnt7IGVsZW1lbnQuY2l0ZSB9fTwvY2l0ZT4KICAgICAgICAgICAgICAgICAgPC9ibG9ja3F1b3RlPgoKICAgICAgICAgICAgICAgICAgPGRpdgogICAgICAgICAgICAgICAgICAgIHYtZWxzZS1pZj0iZWxlbWVudC50eXBlID09PSAndGFibGUnIgogICAgICAgICAgICAgICAgICAgIGNsYXNzPSJycy10YWJsZS13cmFwIHJzLWFuaW0tdGFyZ2V0IHJzLWFuaW0tZmFkZS11cCIKICAgICAgICAgICAgICAgICAgICA6c3R5bGU9InsgJy0tYW5pbS1kZWxheSc6IGFuaW1CbG9ja0RlbGF5KGVJbmRleCwgMCkgKyAnbXMnIH0iCiAgICAgICAgICAgICAgICAgID4KICAgICAgICAgICAgICAgICAgICA8dGFibGUgY2xhc3M9InJzLXRhYmxlIj4KICAgICAgICAgICAgICAgICAgICAgIDx0aGVhZCB2LWlmPSJlbGVtZW50LmhlYWRlcnMiPgogICAgICAgICAgICAgICAgICAgICAgICA8dHI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoIHYtZm9yPSIoaGVhZGVyLCBoSW5kZXgpIGluIGVsZW1lbnQuaGVhZGVycyIgOmtleT0iJ3RoLScgKyBoSW5kZXgiPgogICAgICAgICAgICAgICAgICAgICAgICAgICAge3sgaGVhZGVyIH19CiAgICAgICAgICAgICAgICAgICAgICAgICAgPC90aD4KICAgICAgICAgICAgICAgICAgICAgICAgPC90cj4KICAgICAgICAgICAgICAgICAgICAgIDwvdGhlYWQ+CiAgICAgICAgICAgICAgICAgICAgICA8dGJvZHk+CiAgICAgICAgICAgICAgICAgICAgICAgIDx0ciB2LWZvcj0iKHJvdywgckluZGV4KSBpbiAoZWxlbWVudC5kYXRhIHx8IFtdKSIgOmtleT0iJ3RyLScgKyBySW5kZXgiPgogICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCB2LWZvcj0iKGNlbGwsIGNJbmRleCkgaW4gcm93IiA6a2V5PSIndGQtJyArIGNJbmRleCI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7eyBjZWxsIH19CiAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD4KICAgICAgICAgICAgICAgICAgICAgICAgPC90cj4KICAgICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+CiAgICAgICAgICAgICAgICAgICAgPC90YWJsZT4KICAgICAgICAgICAgICAgICAgICA8cCB2LWlmPSJlbGVtZW50LnNvdXJjZSIgY2xhc3M9InJzLXRhYmxlLXNvdXJjZSI+5pWw5o2u5p2l5rqQ77yae3sgZWxlbWVudC5zb3VyY2UgfX08L3A+CiAgICAgICAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgPC9kaXY+CgogICAgICAgICAgICAgIDxmb290ZXIgY2xhc3M9InJzLWZvb3RlciI+CiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0icnMtZm9vdGVyLWJyYW5kIj4KICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9InJzLWZvb3Rlci1tYXJrIj48L3NwYW4+CiAgICAgICAgICAgICAgICAgIHt7IGFjY291bnREYXRhLnRpdGxlIH19CiAgICAgICAgICAgICAgICA8L3NwYW4+CiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0icnMtZm9vdGVyLXBhZ2UiPgogICAgICAgICAgICAgICAgICA8Yj57eyBwYWQoc0lkeCArIDEpIH19PC9iPgogICAgICAgICAgICAgICAgICA8c3Bhbj4vIHt7IHBhZCh0b3RhbFNsaWRlcykgfX08L3NwYW4+CiAgICAgICAgICAgICAgICA8L3NwYW4+CiAgICAgICAgICAgICAgPC9mb290ZXI+CiAgICAgICAgICAgIDwvdGVtcGxhdGU+CiAgICAgICAgICA8L3NlY3Rpb24+CiAgICAgICAgPC9kaXY+CiAgICAgIDwvZGl2PgoKICAgICAgPGRpdiBjbGFzcz0icHYtcHJvZ3Jlc3MiIGFyaWEtaGlkZGVuPSJ0cnVlIj4KICAgICAgICA8c3BhbiA6c3R5bGU9Insgd2lkdGg6IHByb2dyZXNzUGVyY2VudCArICclJyB9Ij48L3NwYW4+CiAgICAgIDwvZGl2PgogICAgPC9kaXY+CiAgPC9kaXY+CjwvdGVtcGxhdGU+Cgo8c2NyaXB0PgogIGV4cG9ydCBkZWZhdWx0IHsKICAgIG5hbWU6ICJQcmVzZW50YXRpb25WaWV3ZXIiLAoKICAgIGRhdGEoKSB7CiAgICAgIHJldHVybiB7CiAgICAgICAgZm9udFN0YWNrOgogICAgICAgICAgJyJTRiBQcm8gRGlzcGxheSIsICJTRiBQcm8gVGV4dCIsIC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgIlBpbmdGYW5nIFNDIiwgIkhpcmFnaW5vIFNhbnMgR0IiLCAiTm90byBTYW5zIFNDIiwgIk1pY3Jvc29mdCBZYUhlaSIsIHNhbnMtc2VyaWYnLAogICAgICAgIGNoYXJ0UGFsZXR0ZTogWyIjMGI1Y2ZmIiwgIiMxMmE1OTQiLCAiI2Y1OWUwYiIsICIjN2MzYWVkIiwgIiM5NGEzYjgiXSwKCiAgICAgICAgaXNQcmVzZW50YXRpb246IGZhbHNlLAogICAgICAgIHRvb2xiYXJJZGxlOiBmYWxzZSwKICAgICAgICB0b29sYmFyVGltZXI6IG51bGwsCiAgICAgICAgc3RhZ2VTY2FsZTogMSwKICAgICAgICBjaGFydEpzTG9hZGVkOiBmYWxzZSwKICAgICAgICBtZXJtYWlkTG9hZGVkOiBmYWxzZSwKICAgICAgICBDaGFydDogbnVsbCwKICAgICAgICBtZXJtYWlkOiBudWxsLAogICAgICAgIGNoYXJ0SW5zdGFuY2VzOiB7fSwKICAgICAgICBjaGFydEZhaWx1cmVzOiB7fSwKICAgICAgICBpc0V4cG9ydGluZzogZmFsc2UsCiAgICAgICAgZXhwb3J0Tm90aWNlOiAiIiwKICAgICAgICBleHBvcnROb3RpY2VUeXBlOiAic3VjY2VzcyIsCiAgICAgICAgZXhwb3J0Tm90aWNlVGltZXI6IG51bGwsCiAgICAgICAgY2hhcnRab29tOiB7fSwKICAgICAgICBjaGFydFBhbjoge30sCiAgICAgICAgZGlhZ3JhbVJhdGlvczoge30sCiAgICAgICAgY2hhcnRQYW5TdGF0ZTogbnVsbCwKICAgICAgICBjdXJyZW50U2xpZGVJbmRleDogMCwKICAgICAgICBhbmltYXRpb25UaW1lcjogbnVsbCwKICAgICAgICB2aXNpYmlsaXR5VGltZXI6IG51bGwsCiAgICAgICAgcmVzaXplRnJhbWU6IG51bGwsCiAgICAgICAgc3RhZ2VSZXNpemVPYnNlcnZlcjogbnVsbCwKICAgICAgICBib2R5T3ZlcmZsb3c6ICIiLAogICAgICAgIGV2ZW50c0JvdW5kOiBmYWxzZSwKICAgICAgICB0b3VjaFN0YXJ0WDogMCwKICAgICAgICB0b3VjaFN0YXJ0WTogMCwKICAgICAgICB0b3VjaFN0YXJ0VGltZTogMCwKICAgICAgICB0b3VjaFN0YXJ0SW5ab29tZWRDaGFydDogZmFsc2UsCgogICAgICAgIGFjY291bnREYXRhOiB7CiAgICAgICAgICB0aXRsZTogIkFJIOaetuaehOWkmuerr+WNj+WQjOa8lOi/m+aKpeWRiiIsCiAgICAgICAgICBwcmVzZW50ZXI6ICLmioDmnK/mnrbmnoTpg6giLAogICAgICAgICAgc3VidGl0bGU6ICJBSSDpqbHliqjnmoTlpJrnq6/muLLmn5PmnrbmnoQiLAogICAgICAgICAgb2NjYXNpb246ICLlhoXpg6jmioDmnK/liIbkuqsiLAogICAgICAgICAgc2xpZGVzOiBbCiAgICAgICAgICAgIHsKICAgICAgICAgICAgICBpZDogImNvdmVyIiwKICAgICAgICAgICAgICB0eXBlOiAidGl0bGUiLAogICAgICAgICAgICAgIHRpdGxlOiAi5aSa56uv5aSa5oCB5riy5p+T5p625p6E5ryU6L+bIiwKICAgICAgICAgICAgICBlbGVtZW50czogWwogICAgICAgICAgICAgICAgewogICAgICAgICAgICAgICAgICB0eXBlOiAidGV4dCIsCiAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6CiAgICAgICAgICAgICAgICAgICAgIuS7pee7n+S4gOW6leW6p+WNj+iurui/nuaOpeWKqOaAgeWbvuihqOS4juWkmuaooeaAgeaVsOaNru+8jOaehOW7uumdouWQkeacquadpeeahOWkmuerr+a4suafk+W8leaTjuOAgiIsCiAgICAgICAgICAgICAgICB9LAogICAgICAgICAgICAgIF0sCiAgICAgICAgICAgIH0sCiAgICAgICAgICAgIHsKICAgICAgICAgICAgICBpZDogImNoYXJ0anMtZGVtbyIsCiAgICAgICAgICAgICAgdHlwZTogInNwbGl0IiwKICAgICAgICAgICAgICB0aXRsZTogIuWQnuWQkOmHj+S/neaMgemrmOmAn+WinumVvyIsCiAgICAgICAgICAgICAgZWxlbWVudHM6IFsKICAgICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgdHlwZTogInRleHQiLAogICAgICAgICAgICAgICAgICBjb250ZW50OgogICAgICAgICAgICAgICAgICAgICJDYW52YXMg6L276YeP5riy5p+T5Zyo56e75Yqo56uv5LiO5aSn5bGP5Zy65pmv5LiL5YW86aG+5oCn6IO95LiO5Lqk5LqS5L2T6aqM77yM5qC45b+D5ZCe5ZCQ6YeP6L+e57ut5Zub5Liq5a2j5bqm5L+d5oyB5aKe6ZW/44CCIiwKICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICB7CiAgICAgICAgICAgICAgICAgIHR5cGU6ICJjaGFydCIsCiAgICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogImNoYXJ0anMiLAogICAgICAgICAgICAgICAgICBjb250ZW50OiAi5a2j5bqm5ZCe5ZCQ6YeP77yIVFBT77yJIiwKICAgICAgICAgICAgICAgICAgc291cmNlOiAi5bmz5Y+w55uR5o6n5pWw5o2uIiwKICAgICAgICAgICAgICAgICAgY2hhcnREYXRhOiB7CiAgICAgICAgICAgICAgICAgICAgdHlwZTogImxpbmUiLAogICAgICAgICAgICAgICAgICAgIGRhdGE6IHsKICAgICAgICAgICAgICAgICAgICAgIGxhYmVsczogWyJRMSIsICJRMiIsICJRMyIsICJRNCJdLAogICAgICAgICAgICAgICAgICAgICAgZGF0YXNldHM6IFsKICAgICAgICAgICAgICAgICAgICAgICAgewogICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAi5ZCe5ZCQ6YeP77yIVFBT77yJIiwKICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBbMTIwMCwgMTkwMCwgMzIwMCwgNDUwMF0sCiAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsbDogdHJ1ZSwKICAgICAgICAgICAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICAgICAgICAgIF0sCiAgICAgICAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgXSwKICAgICAgICAgICAgfSwKICAgICAgICAgICAgewogICAgICAgICAgICAgIGlkOiAibWVybWFpZC1kZW1vIiwKICAgICAgICAgICAgICB0eXBlOiAiY29udGVudCIsCiAgICAgICAgICAgICAgdGl0bGU6ICLlpJrlvJXmk47ljY/lkIznmoTmuLLmn5Ppk77ot68iLAogICAgICAgICAgICAgIGVsZW1lbnRzOiBbCiAgICAgICAgICAgICAgICB7CiAgICAgICAgICAgICAgICAgIHR5cGU6ICJjaGFydCIsCiAgICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogIm1lcm1haWQiLAogICAgICAgICAgICAgICAgICBjb250ZW50OiAi5LuO5pWw5o2u5Yiw6KeG5Zu+55qE5rWB6L2s6ZO+6LevIiwKICAgICAgICAgICAgICAgICAgY2hhcnREYXRhOiB7CiAgICAgICAgICAgICAgICAgICAgY29kZToKICAgICAgICAgICAgICAgICAgICAgICJmbG93Y2hhcnQgTFJcbiAgQVtQcm9tcHQg5pWw5o2uXSAtLT4gQlvlpJrmgIHnvJbor5HlmahdXG4gIEIgLS0+IENbQ2hhcnQuanMg5byV5pOOXVxuICBCIC0tPiBEW01lcm1haWQg5byV5pOOXVxuICBDIC0tPiBFW+inhuWbvua4suafk11cbiAgRCAtLT4gRSIsCiAgICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICB9LAogICAgICAgICAgICAgIF0sCiAgICAgICAgICAgIH0sCiAgICAgICAgICAgIHsKICAgICAgICAgICAgICBpZDogImR1YWwtZGVtbyIsCiAgICAgICAgICAgICAgdHlwZTogImNvbnRlbnQiLAogICAgICAgICAgICAgIHRpdGxlOiAi5pu06L2755qE5riy5p+T77yM5pu05b+r55qE5ZON5bqUIiwKICAgICAgICAgICAgICBlbGVtZW50czogWwogICAgICAgICAgICAgICAgewogICAgICAgICAgICAgICAgICB0eXBlOiAidGV4dCIsCiAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6CiAgICAgICAgICAgICAgICAgICAgIuS7jiBQcm9tcHQg6Kej5p6Q5Yiw5Zu+6KGo6L6T5Ye677yM57uf5LiA5riy5p+T6ZO+6Lev5Zyo5L+d6K+B5pWw5o2u5YeG56Gu5oCn55qE5ZCM5pe277yM5oyB57ut6ZmN5L2O56uv5L6n5byA6ZSA44CCIiwKICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICB7CiAgICAgICAgICAgICAgICAgIHR5cGU6ICJsaXN0IiwKICAgICAgICAgICAgICAgICAgY29udGVudDogWwogICAgICAgICAgICAgICAgICAgICJDYW52YXMg5Y6f55Sf5riy5p+T77yM56e75Yqo56uv5L+d5oyB5rWB55WFIiwKICAgICAgICAgICAgICAgICAgICAiQ2hhcnQuanMg5LiOIE1lcm1haWQg5oyJ6ZyA5Yqg6L29IiwKICAgICAgICAgICAgICAgICAgICAi5aSa56uv5bC65a+46Ieq6YCC5bqU77yM54mI5byP6Ieq5Yqo6YeN5o6SIiwKICAgICAgICAgICAgICAgICAgICAi5pWw5o2u5LiO6KeG5Zu+6Kej6ICm77yM5pSv5oyB5a6e5pe25pu05pawIiwKICAgICAgICAgICAgICAgICAgXSwKICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgICB7CiAgICAgICAgICAgICAgICAgIHR5cGU6ICJjaGFydCIsCiAgICAgICAgICAgICAgICAgIGNoYXJ0VHlwZTogImNoYXJ0anMiLAogICAgICAgICAgICAgICAgICBjb250ZW50OiAi5riy5p+T6ICX5pe25a+55q+U77yI5q+r56eS77yJIiwKICAgICAgICAgICAgICAgICAgc291cmNlOiAi5Z+65YeG5rWL6K+VIMK3IOaVsOWAvOi2iuS9jui2iuWlvSIsCiAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodEluZGV4OiAxLAogICAgICAgICAgICAgICAgICBjaGFydERhdGE6IHsKICAgICAgICAgICAgICAgICAgICB0eXBlOiAiYmFyIiwKICAgICAgICAgICAgICAgICAgICBkYXRhOiB7CiAgICAgICAgICAgICAgICAgICAgICBsYWJlbHM6IFsi5Y6f55SfIENhbnZhcyIsICJDaGFydC5qcyIsICJEMy5qcyIsICJFQ2hhcnRzIl0sCiAgICAgICAgICAgICAgICAgICAgICBkYXRhc2V0czogWwogICAgICAgICAgICAgICAgICAgICAgICB7CiAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICLmuLLmn5PogJfml7bvvIhtc++8iSIsCiAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogWzEyLCAyOCwgNDUsIDM4XSwKICAgICAgICAgICAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICAgICAgICAgIF0sCiAgICAgICAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICAgIH0sCiAgICAgICAgICAgICAgXSwKICAgICAgICAgICAgfSwKICAgICAgICAgIF0sCiAgICAgICAgfSwKICAgICAgfTsKICAgIH0sCgogICAgY29tcHV0ZWQ6IHsKICAgICAgdG90YWxTbGlkZXMoKSB7CiAgICAgICAgcmV0dXJuICh0aGlzLmFjY291bnREYXRhLnNsaWRlcyB8fCBbXSkubGVuZ3RoOwogICAgICB9LAoKICAgICAgcHJvZ3Jlc3NQZXJjZW50KCkgewogICAgICAgIGlmICghdGhpcy50b3RhbFNsaWRlcykgcmV0dXJuIDA7CiAgICAgICAgY29uc3QgY3VycmVudCA9IE1hdGgubWluKHRoaXMuY3VycmVudFNsaWRlSW5kZXggKyAxLCB0aGlzLnRvdGFsU2xpZGVzKTsKICAgICAgICByZXR1cm4gKGN1cnJlbnQgLyB0aGlzLnRvdGFsU2xpZGVzKSAqIDEwMDsKICAgICAgfSwKCiAgICAgIHByZXNlbnRlckluaXRpYWwoKSB7CiAgICAgICAgY29uc3QgcHJlc2VudGVyID0gKHRoaXMuYWNjb3VudERhdGEgJiYgdGhpcy5hY2NvdW50RGF0YS5wcmVzZW50ZXIpIHx8ICIiOwogICAgICAgIHJldHVybiBwcmVzZW50ZXIudHJpbSgpLmNoYXJBdCgwKSB8fCAiwrciOwogICAgICB9LAogICAgfSwKCiAgICBtZXRob2RzOiB7CiAgICAgIC8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogICAgICAgICDln7rnoYDmoLzlvI/ljJYgJiDor63kuYnmoIfnrb4KICAgICAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovCiAgICAgIHBhZCh2YWx1ZSkgewogICAgICAgIHJldHVybiBTdHJpbmcodmFsdWUgPT0gbnVsbCA/IDAgOiB2YWx1ZSkucGFkU3RhcnQoMiwgIjAiKTsKICAgICAgfSwKCiAgICAgIGdldENvdmVyVGV4dHMoc2xpZGUpIHsKICAgICAgICBpZiAoIXNsaWRlIHx8ICFzbGlkZS5lbGVtZW50cykgcmV0dXJuIFtdOwogICAgICAgIHJldHVybiBzbGlkZS5lbGVtZW50cy5maWx0ZXIoKGVsZW1lbnQpID0+IGVsZW1lbnQudHlwZSA9PT0gInRleHQiKTsKICAgICAgfSwKCiAgICAgIGdldENvdmVyU3VidGl0bGUoc2xpZGUpIHsKICAgICAgICBjb25zdCB0ZXh0cyA9IHRoaXMuZ2V0Q292ZXJUZXh0cyhzbGlkZSk7CiAgICAgICAgcmV0dXJuIHRleHRzLmxlbmd0aCA/IHRleHRzWzBdLmNvbnRlbnQgOiAiIjsKICAgICAgfSwKCiAgICAgIGdldFNsaWRlVHlwZUxhYmVsKHNsaWRlKSB7CiAgICAgICAgaWYgKCFzbGlkZSkgcmV0dXJuICLlubvnga/niYciOwogICAgICAgIGlmIChzbGlkZS50eXBlID09PSAidGl0bGUiKSByZXR1cm4gIuWwgemdoiI7CiAgICAgICAgaWYgKHNsaWRlLnR5cGUgPT09ICJzdW1tYXJ5IikgcmV0dXJuICLmgLvnu5MiOwoKICAgICAgICBjb25zdCBlbGVtZW50cyA9IHNsaWRlLmVsZW1lbnRzIHx8IFtdOwogICAgICAgIGNvbnN0IGNoYXJ0RWxlbWVudCA9IGVsZW1lbnRzLmZpbmQoKGVsZW1lbnQpID0+IGVsZW1lbnQudHlwZSA9PT0gImNoYXJ0Iik7CgogICAgICAgIGlmIChjaGFydEVsZW1lbnQpIHsKICAgICAgICAgIGlmIChjaGFydEVsZW1lbnQuY2hhcnRUeXBlID09PSAibWVybWFpZCIpIHJldHVybiAi5p625p6E5rWB56iLIjsKICAgICAgICAgIGNvbnN0IGNoYXJ0VHlwZSA9CiAgICAgICAgICAgIGNoYXJ0RWxlbWVudC5jaGFydERhdGEgJiYgY2hhcnRFbGVtZW50LmNoYXJ0RGF0YS50eXBlCiAgICAgICAgICAgICAgPyBjaGFydEVsZW1lbnQuY2hhcnREYXRhLnR5cGUKICAgICAgICAgICAgICA6ICIiOwogICAgICAgICAgaWYgKGNoYXJ0VHlwZSA9PT0gImxpbmUiIHx8IGNoYXJ0VHlwZSA9PT0gImFyZWEiKSByZXR1cm4gIui2i+WKv+a0nuWvnyI7CiAgICAgICAgICBpZiAoY2hhcnRUeXBlID09PSAiYmFyIiB8fCBjaGFydFR5cGUgPT09ICJob3Jpem9udGFsQmFyIikgcmV0dXJuICLmlbDmja7lr7nmr5QiOwogICAgICAgICAgaWYgKAogICAgICAgICAgICBjaGFydFR5cGUgPT09ICJwaWUiIHx8CiAgICAgICAgICAgIGNoYXJ0VHlwZSA9PT0gImRvdWdobnV0IiB8fAogICAgICAgICAgICBjaGFydFR5cGUgPT09ICJwb2xhckFyZWEiCiAgICAgICAgICApIHsKICAgICAgICAgICAgcmV0dXJuICLnu5PmnoTljaDmr5QiOwogICAgICAgICAgfQogICAgICAgICAgaWYgKGNoYXJ0VHlwZSA9PT0gInJhZGFyIikgcmV0dXJuICLlpJrnu7Tor4TkvLAiOwogICAgICAgICAgaWYgKGNoYXJ0VHlwZSA9PT0gInNjYXR0ZXIiKSByZXR1cm4gIuebuOWFs+WIhuaekCI7CiAgICAgICAgICByZXR1cm4gIuaVsOaNrua0nuWvnyI7CiAgICAgICAgfQoKICAgICAgICBpZiAoc2xpZGUudHlwZSA9PT0gInNwbGl0IikgcmV0dXJuICLlm77mlofmt7fmjpIiOwogICAgICAgIHJldHVybiAi5qC45b+D5YaF5a65IjsKICAgICAgfSwKCiAgICAgIC8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogICAgICAgICDniYjlvI/or4bliKvvvJrlhYjnkIbop6PlhoXlrrnlhbPns7vvvIzlho3lhrPlrprnqbrpl7Tnu5PmnoQKICAgICAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovCiAgICAgIGdldEJvZHlMYXlvdXQoc2xpZGUpIHsKICAgICAgICBjb25zdCBlbGVtZW50cyA9IHNsaWRlICYmIHNsaWRlLmVsZW1lbnRzID8gc2xpZGUuZWxlbWVudHMgOiBbXTsKICAgICAgICBjb25zdCB0eXBlcyA9IGVsZW1lbnRzLm1hcCgoZWxlbWVudCkgPT4gZWxlbWVudC50eXBlKTsKICAgICAgICBjb25zdCBoYXNDaGFydCA9IHR5cGVzLmluZGV4T2YoImNoYXJ0IikgIT09IC0xOwogICAgICAgIGNvbnN0IGhhc0xpc3QgPSB0eXBlcy5pbmRleE9mKCJsaXN0IikgIT09IC0xOwogICAgICAgIGNvbnN0IGhhc1RleHQgPSB0eXBlcy5pbmRleE9mKCJ0ZXh0IikgIT09IC0xOwogICAgICAgIGNvbnN0IGhhc0ltYWdlID0gdHlwZXMuaW5kZXhPZigiaW1hZ2UiKSAhPT0gLTE7CiAgICAgICAgY29uc3QgaGFzVGFibGUgPSB0eXBlcy5pbmRleE9mKCJ0YWJsZSIpICE9PSAtMTsKCiAgICAgICAgaWYgKGVsZW1lbnRzLmxlbmd0aCA9PT0gMSkgewogICAgICAgICAgaWYgKGhhc0NoYXJ0KSByZXR1cm4gInNvbG8tY2hhcnQiOwogICAgICAgICAgaWYgKGhhc0ltYWdlKSByZXR1cm4gInNvbG8taW1hZ2UiOwogICAgICAgICAgaWYgKGhhc1RhYmxlKSByZXR1cm4gInNvbG8tdGFibGUiOwogICAgICAgICAgaWYgKGhhc0xpc3QpIHJldHVybiAic29sby1saXN0IjsKICAgICAgICAgIHJldHVybiAic29sbyI7CiAgICAgICAgfQoKICAgICAgICBpZiAoaGFzQ2hhcnQpIHsKICAgICAgICAgIGlmIChoYXNMaXN0KSByZXR1cm4gaGFzVGV4dCA/ICJsZWFkLWxpc3QtY2hhcnQiIDogImxpc3QtY2hhcnQiOwogICAgICAgICAgaWYgKGhhc0ltYWdlKSByZXR1cm4gImltYWdlLWNoYXJ0IjsKICAgICAgICAgIGlmIChoYXNUYWJsZSkgcmV0dXJuICJ0YWJsZS1jaGFydCI7CiAgICAgICAgICBpZiAoaGFzVGV4dCkgcmV0dXJuICJ0ZXh0LWNoYXJ0IjsKICAgICAgICAgIHJldHVybiAic3RhY2siOwogICAgICAgIH0KCiAgICAgICAgaWYgKGhhc0ltYWdlICYmIGhhc1RleHQpIHJldHVybiAiaW1hZ2UtdGV4dCI7CiAgICAgICAgcmV0dXJuICJzdGFjayI7CiAgICAgIH0sCgogICAgICBnZXRCbG9ja0dyaWRTcGFuKHNsaWRlLCBlbGVtZW50KSB7CiAgICAgICAgY29uc3QgbGF5b3V0ID0gdGhpcy5nZXRCb2R5TGF5b3V0KHNsaWRlKTsKCiAgICAgICAgaWYgKGxheW91dCA9PT0gImxpc3QtY2hhcnQiIHx8IGxheW91dCA9PT0gImxlYWQtbGlzdC1jaGFydCIpIHsKICAgICAgICAgIGlmIChlbGVtZW50LnR5cGUgPT09ICJsaXN0IikgcmV0dXJuICJycy1jb2wtNSI7CiAgICAgICAgICBpZiAoZWxlbWVudC50eXBlID09PSAiY2hhcnQiKSByZXR1cm4gInJzLWNvbC03IjsKICAgICAgICAgIHJldHVybiAicnMtY29sLTEyIjsKICAgICAgICB9CgogICAgICAgIGlmIChsYXlvdXQgPT09ICJ0ZXh0LWNoYXJ0IikgewogICAgICAgICAgaWYgKGVsZW1lbnQudHlwZSA9PT0gInRleHQiKSByZXR1cm4gInJzLWNvbC01IjsKICAgICAgICAgIGlmIChlbGVtZW50LnR5cGUgPT09ICJjaGFydCIpIHJldHVybiAicnMtY29sLTciOwogICAgICAgICAgcmV0dXJuICJycy1jb2wtMTIiOwogICAgICAgIH0KCiAgICAgICAgaWYgKGxheW91dCA9PT0gImltYWdlLWNoYXJ0IikgewogICAgICAgICAgaWYgKGVsZW1lbnQudHlwZSA9PT0gImltYWdlIikgcmV0dXJuICJycy1jb2wtNiI7CiAgICAgICAgICBpZiAoZWxlbWVudC50eXBlID09PSAiY2hhcnQiKSByZXR1cm4gInJzLWNvbC02IjsKICAgICAgICAgIHJldHVybiAicnMtY29sLTEyIjsKICAgICAgICB9CgogICAgICAgIGlmIChsYXlvdXQgPT09ICJ0YWJsZS1jaGFydCIpIHsKICAgICAgICAgIGlmIChlbGVtZW50LnR5cGUgPT09ICJ0YWJsZSIpIHJldHVybiAicnMtY29sLTciOwogICAgICAgICAgaWYgKGVsZW1lbnQudHlwZSA9PT0gImNoYXJ0IikgcmV0dXJuICJycy1jb2wtNSI7CiAgICAgICAgICByZXR1cm4gInJzLWNvbC0xMiI7CiAgICAgICAgfQoKICAgICAgICBpZiAobGF5b3V0ID09PSAiaW1hZ2UtdGV4dCIpIHsKICAgICAgICAgIGlmIChlbGVtZW50LnR5cGUgPT09ICJpbWFnZSIpIHJldHVybiAicnMtY29sLTciOwogICAgICAgICAgaWYgKGVsZW1lbnQudHlwZSA9PT0gInRleHQiKSByZXR1cm4gInJzLWNvbC01IjsKICAgICAgICAgIHJldHVybiAicnMtY29sLTEyIjsKICAgICAgICB9CgogICAgICAgIHJldHVybiAicnMtY29sLTEyIjsKICAgICAgfSwKCiAgICAgIGdldFNsaWRlRGVuc2l0eShzbGlkZSkgewogICAgICAgIGNvbnN0IGVsZW1lbnRzID0gc2xpZGUgJiYgc2xpZGUuZWxlbWVudHMgPyBzbGlkZS5lbGVtZW50cyA6IFtdOwogICAgICAgIGxldCB0b3RhbENoYXJzID0gMDsKICAgICAgICBsZXQgbGlzdEl0ZW1Db3VudCA9IDA7CiAgICAgICAgbGV0IGNoYXJ0Q291bnQgPSAwOwoKICAgICAgICBlbGVtZW50cy5mb3JFYWNoKChlbGVtZW50KSA9PiB7CiAgICAgICAgICBpZiAoZWxlbWVudC50eXBlID09PSAidGV4dCIgfHwgZWxlbWVudC50eXBlID09PSAicXVvdGUiKSB7CiAgICAgICAgICAgIHRvdGFsQ2hhcnMgKz0gKGVsZW1lbnQuY29udGVudCB8fCAiIikubGVuZ3RoOwogICAgICAgICAgfQogICAgICAgICAgaWYgKGVsZW1lbnQudHlwZSA9PT0gImxpc3QiKSB7CiAgICAgICAgICAgIGNvbnN0IGl0ZW1zID0gZWxlbWVudC5jb250ZW50IHx8IFtdOwogICAgICAgICAgICBsaXN0SXRlbUNvdW50ICs9IGl0ZW1zLmxlbmd0aDsKICAgICAgICAgICAgdG90YWxDaGFycyArPSBpdGVtcy5qb2luKCIiKS5sZW5ndGg7CiAgICAgICAgICB9CiAgICAgICAgICBpZiAoZWxlbWVudC50eXBlID09PSAiY2hhcnQiKSBjaGFydENvdW50ICs9IDE7CiAgICAgICAgfSk7CgogICAgICAgIGlmICgKICAgICAgICAgIHRvdGFsQ2hhcnMgPiAzNDAgfHwKICAgICAgICAgIGxpc3RJdGVtQ291bnQgPiA3IHx8CiAgICAgICAgICAoY2hhcnRDb3VudCA+PSAyICYmIHRvdGFsQ2hhcnMgPiAxODApCiAgICAgICAgKSB7CiAgICAgICAgICByZXR1cm4gImV4dHJlbWUiOwogICAgICAgIH0KICAgICAgICBpZiAoCiAgICAgICAgICB0b3RhbENoYXJzID4gMjMwIHx8CiAgICAgICAgICBsaXN0SXRlbUNvdW50ID4gNSB8fAogICAgICAgICAgZWxlbWVudHMubGVuZ3RoID49IDQKICAgICAgICApIHsKICAgICAgICAgIHJldHVybiAiaGVhdnkiOwogICAgICAgIH0KICAgICAgICBpZiAoCiAgICAgICAgICB0b3RhbENoYXJzID4gMTMwIHx8CiAgICAgICAgICBsaXN0SXRlbUNvdW50ID4gMyB8fAogICAgICAgICAgZWxlbWVudHMubGVuZ3RoID49IDMKICAgICAgICApIHsKICAgICAgICAgIHJldHVybiAibWVkaXVtIjsKICAgICAgICB9CiAgICAgICAgcmV0dXJuICJsaWdodCI7CiAgICAgIH0sCgogICAgICAvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KICAgICAgICAg5Yqo55S76IqC5aWPCiAgICAgICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqLwogICAgICBhbmltQmxvY2tEZWxheShibG9ja0luZGV4LCBpdGVtSW5kZXgpIHsKICAgICAgICByZXR1cm4gMTQwICsgYmxvY2tJbmRleCAqIDE1MCArIGl0ZW1JbmRleCAqIDcwOwogICAgICB9LAoKICAgICAgYW5pbUZvb3RlckRlbGF5KGVsZW1lbnRzKSB7CiAgICAgICAgbGV0IG1heERlbGF5ID0gMjYwOwogICAgICAgIGlmICghZWxlbWVudHMpIHJldHVybiBtYXhEZWxheTsKICAgICAgICBlbGVtZW50cy5mb3JFYWNoKChlbGVtZW50LCBpbmRleCkgPT4gewogICAgICAgICAgbGV0IGJsb2NrQmFzZSA9IDE0MCArIGluZGV4ICogMTUwOwogICAgICAgICAgaWYgKGVsZW1lbnQudHlwZSA9PT0gImxpc3QiICYmIGVsZW1lbnQuY29udGVudCkgewogICAgICAgICAgICBibG9ja0Jhc2UgKz0gKGVsZW1lbnQuY29udGVudC5sZW5ndGggLSAxKSAqIDcwOwogICAgICAgICAgfQogICAgICAgICAgaWYgKGVsZW1lbnQudHlwZSA9PT0gImNoYXJ0IikgYmxvY2tCYXNlICs9IDgwOwogICAgICAgICAgaWYgKGJsb2NrQmFzZSA+IG1heERlbGF5KSBtYXhEZWxheSA9IGJsb2NrQmFzZTsKICAgICAgICB9KTsKICAgICAgICByZXR1cm4gbWF4RGVsYXkgKyAxODA7CiAgICAgIH0sCgogICAgICBhbmltVGV4dFN0eWxlKGVsZW1lbnQsIHNsaWRlLCBibG9ja0luZGV4KSB7CiAgICAgICAgcmV0dXJuIHsKICAgICAgICAgICItLWFuaW0tZGVsYXkiOiAxNDAgKyBibG9ja0luZGV4ICogMTUwICsgIm1zIiwKICAgICAgICB9OwogICAgICB9LAoKICAgICAgLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CiAgICAgICAgIOe8qeeVpeWbvuaVsOaNru+8muiuqemihOiniOS5n+WDj+ecn+ato+eahOW5u+eBr+eJhwogICAgICAgICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi8KICAgICAgZ2V0Q2hhcnRLaW5kKGVsZW1lbnQpIHsKICAgICAgICBpZiAoIWVsZW1lbnQgfHwgZWxlbWVudC50eXBlICE9PSAiY2hhcnQiKSByZXR1cm4gIm90aGVyIjsKICAgICAgICBpZiAoZWxlbWVudC5jaGFydFR5cGUgPT09ICJtZXJtYWlkIikgcmV0dXJuICJmbG93IjsKICAgICAgICBjb25zdCB0eXBlID0KICAgICAgICAgIGVsZW1lbnQuY2hhcnREYXRhICYmIGVsZW1lbnQuY2hhcnREYXRhLnR5cGUKICAgICAgICAgICAgPyBlbGVtZW50LmNoYXJ0RGF0YS50eXBlCiAgICAgICAgICAgIDogIiI7CiAgICAgICAgaWYgKHR5cGUgPT09ICJsaW5lIiB8fCB0eXBlID09PSAiYXJlYSIpIHJldHVybiAibGluZSI7CiAgICAgICAgaWYgKHR5cGUgPT09ICJiYXIiIHx8IHR5cGUgPT09ICJob3Jpem9udGFsQmFyIikgcmV0dXJuICJiYXIiOwogICAgICAgIGlmICh0eXBlID09PSAicGllIiB8fCB0eXBlID09PSAiZG91Z2hudXQiIHx8IHR5cGUgPT09ICJwb2xhckFyZWEiKSB7CiAgICAgICAgICByZXR1cm4gInBpZSI7CiAgICAgICAgfQogICAgICAgIHJldHVybiAib3RoZXIiOwogICAgICB9LAoKICAgICAgZ2V0Q2hhcnRTZXJpZXMoZWxlbWVudCkgewogICAgICAgIGNvbnN0IGRhdGEgPQogICAgICAgICAgZWxlbWVudCAmJiBlbGVtZW50LmNoYXJ0RGF0YSAmJiBlbGVtZW50LmNoYXJ0RGF0YS5kYXRhCiAgICAgICAgICAgID8gZWxlbWVudC5jaGFydERhdGEuZGF0YQogICAgICAgICAgICA6IG51bGw7CiAgICAgICAgY29uc3QgZGF0YXNldHMgPSBkYXRhICYmIGRhdGEuZGF0YXNldHMgPyBkYXRhLmRhdGFzZXRzIDogW107CiAgICAgICAgaWYgKCFkYXRhc2V0cy5sZW5ndGgpIHJldHVybiBbXTsKICAgICAgICBjb25zdCB2YWx1ZXMgPSBkYXRhc2V0c1swXS5kYXRhIHx8IFtdOwogICAgICAgIHJldHVybiB2YWx1ZXMKICAgICAgICAgIC5tYXAoKHZhbHVlKSA9PiB7CiAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICJvYmplY3QiKSByZXR1cm4gTnVtYmVyKHZhbHVlLnkpOwogICAgICAgICAgICByZXR1cm4gTnVtYmVyKHZhbHVlKTsKICAgICAgICAgIH0pCiAgICAgICAgICAuZmlsdGVyKCh2YWx1ZSkgPT4gTnVtYmVyLmlzRmluaXRlKHZhbHVlKSk7CiAgICAgIH0sCgogICAgICBnZXRDaGFydEJhcnMoZWxlbWVudCkgewogICAgICAgIGNvbnN0IHZhbHVlcyA9IHRoaXMuZ2V0Q2hhcnRTZXJpZXMoZWxlbWVudCk7CiAgICAgICAgaWYgKCF2YWx1ZXMubGVuZ3RoKSByZXR1cm4gW107CiAgICAgICAgY29uc3QgbWF4ID0gTWF0aC5tYXguYXBwbHkobnVsbCwgdmFsdWVzLmNvbmNhdChbMF0pKTsKICAgICAgICBpZiAoIW1heCkgcmV0dXJuIFtdOwogICAgICAgIHJldHVybiB2YWx1ZXMubWFwKCh2YWx1ZSkgPT4gewogICAgICAgICAgY29uc3QgaGVpZ2h0ID0gTWF0aC5yb3VuZCgoTWF0aC5tYXgoMCwgdmFsdWUpIC8gbWF4KSAqIDEwMCk7CiAgICAgICAgICByZXR1cm4gTWF0aC5tYXgoOCwgTWF0aC5taW4oMTAwLCBoZWlnaHQpKTsKICAgICAgICB9KTsKICAgICAgfSwKCiAgICAgIGdldENoYXJ0UG9pbnRzKGVsZW1lbnQpIHsKICAgICAgICBjb25zdCB2YWx1ZXMgPSB0aGlzLmdldENoYXJ0U2VyaWVzKGVsZW1lbnQpOwogICAgICAgIGlmICghdmFsdWVzLmxlbmd0aCkgcmV0dXJuICIiOwogICAgICAgIGlmICh2YWx1ZXMubGVuZ3RoID09PSAxKSByZXR1cm4gIjAsMzIgMTAwLDMyIjsKCiAgICAgICAgY29uc3QgbWF4ID0gTWF0aC5tYXguYXBwbHkobnVsbCwgdmFsdWVzKTsKICAgICAgICBjb25zdCBtaW4gPSBNYXRoLm1pbi5hcHBseShudWxsLCB2YWx1ZXMpOwogICAgICAgIGNvbnN0IHJhbmdlID0gbWF4IC0gbWluIHx8IDE7CgogICAgICAgIHJldHVybiB2YWx1ZXMKICAgICAgICAgIC5tYXAoKHZhbHVlLCBpbmRleCkgPT4gewogICAgICAgICAgICBjb25zdCB4ID0gKGluZGV4IC8gKHZhbHVlcy5sZW5ndGggLSAxKSkgKiAxMDA7CiAgICAgICAgICAgIGNvbnN0IHkgPSAzOCAtICgodmFsdWUgLSBtaW4pIC8gcmFuZ2UpICogMzA7CiAgICAgICAgICAgIHJldHVybiB4LnRvRml4ZWQoMikgKyAiLCIgKyB5LnRvRml4ZWQoMik7CiAgICAgICAgICB9KQogICAgICAgICAgLmpvaW4oIiAiKTsKICAgICAgfSwKCiAgICAgIGdldENoYXJ0QXJlYVBvaW50cyhlbGVtZW50KSB7CiAgICAgICAgY29uc3QgcG9pbnRzID0gdGhpcy5nZXRDaGFydFBvaW50cyhlbGVtZW50KTsKICAgICAgICBpZiAoIXBvaW50cykgcmV0dXJuICIiOwogICAgICAgIHJldHVybiAiMCw0NCAiICsgcG9pbnRzICsgIiAxMDAsNDQiOwogICAgICB9LAoKICAgICAgZ2V0UGllR3JhZGllbnQoZWxlbWVudCkgewogICAgICAgIGNvbnN0IHZhbHVlcyA9IHRoaXMuZ2V0Q2hhcnRTZXJpZXMoZWxlbWVudCk7CiAgICAgICAgY29uc3QgdG90YWwgPSB2YWx1ZXMucmVkdWNlKChzdW0sIHZhbHVlKSA9PiBzdW0gKyB2YWx1ZSwgMCk7CiAgICAgICAgaWYgKCF0b3RhbCkgcmV0dXJuICJjb25pYy1ncmFkaWVudCgjZTdlY2Y0IDAgMTAwJSkiOwoKICAgICAgICBjb25zdCBwYWxldHRlID0gdGhpcy5jaGFydFBhbGV0dGU7CiAgICAgICAgbGV0IGFjY3VtdWxhdGVkID0gMDsKICAgICAgICBjb25zdCBzZWdtZW50cyA9IHZhbHVlcy5tYXAoKHZhbHVlLCBpbmRleCkgPT4gewogICAgICAgICAgY29uc3Qgc3RhcnQgPSAoYWNjdW11bGF0ZWQgLyB0b3RhbCkgKiAxMDA7CiAgICAgICAgICBhY2N1bXVsYXRlZCArPSB2YWx1ZTsKICAgICAgICAgIGNvbnN0IGVuZCA9IChhY2N1bXVsYXRlZCAvIHRvdGFsKSAqIDEwMDsKICAgICAgICAgIHJldHVybiAoCiAgICAgICAgICAgIHBhbGV0dGVbaW5kZXggJSBwYWxldHRlLmxlbmd0aF0gKwogICAgICAgICAgICAiICIgKwogICAgICAgICAgICBzdGFydC50b0ZpeGVkKDEpICsKICAgICAgICAgICAgIiUgIiArCiAgICAgICAgICAgIGVuZC50b0ZpeGVkKDEpICsKICAgICAgICAgICAgIiUiCiAgICAgICAgICApOwogICAgICAgIH0pOwogICAgICAgIHJldHVybiAiY29uaWMtZ3JhZGllbnQoIiArIHNlZ21lbnRzLmpvaW4oIiwgIikgKyAiKSI7CiAgICAgIH0sCgogICAgICBnZXRGbG93Tm9kZXMoZWxlbWVudCkgewogICAgICAgIGNvbnN0IGNvZGUgPQogICAgICAgICAgZWxlbWVudCAmJiBlbGVtZW50LmNoYXJ0RGF0YSAmJiBlbGVtZW50LmNoYXJ0RGF0YS5jb2RlCiAgICAgICAgICAgID8gZWxlbWVudC5jaGFydERhdGEuY29kZQogICAgICAgICAgICA6ICIiOwogICAgICAgIGlmICghY29kZSkgcmV0dXJuIFtdOwoKICAgICAgICBjb25zdCBub2RlcyA9IFtdOwogICAgICAgIGNvbnN0IHBhdHRlcm4gPSAvW0EtWmEtejAtOV9cdTRlMDAtXHU5ZmE1XStccypbXFtcKFx7XShbXlxdXClcfV0rKVtcXVwpXH1dL2c7CiAgICAgICAgbGV0IG1hdGNoID0gcGF0dGVybi5leGVjKGNvZGUpOwogICAgICAgIHdoaWxlIChtYXRjaCkgewogICAgICAgICAgY29uc3QgbGFiZWwgPSBTdHJpbmcobWF0Y2hbMV0gfHwgIiIpCiAgICAgICAgICAgIC5yZXBsYWNlKC9bIiddL2csICIiKQogICAgICAgICAgICAudHJpbSgpOwogICAgICAgICAgaWYgKGxhYmVsICYmIG5vZGVzLmluZGV4T2YobGFiZWwpID09PSAtMSkgbm9kZXMucHVzaChsYWJlbCk7CiAgICAgICAgICBtYXRjaCA9IHBhdHRlcm4uZXhlYyhjb2RlKTsKICAgICAgICB9CiAgICAgICAgcmV0dXJuIG5vZGVzLnNsaWNlKDAsIDQpOwogICAgICB9LAoKICAgICAgLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CiAgICAgICAgIENoYXJ0LmpzIOS4u+mimO+8mue7n+S4gOiJsuW9qeOAgeWtl+mYtuOAgee9keagvOWSjOWbvuS+iwogICAgICAgICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi8KICAgICAgY2hhcnRGb250RmFtaWx5KCkgewogICAgICAgIHJldHVybiB0aGlzLmZvbnRTdGFjazsKICAgICAgfSwKCiAgICAgIGdldENoYXJ0UGFsZXR0ZSgpIHsKICAgICAgICByZXR1cm4gdGhpcy5jaGFydFBhbGV0dGU7CiAgICAgIH0sCgogICAgICBub3JtYWxpemVDaGFydENvbG9yKGNvbG9yKSB7CiAgICAgICAgaWYgKHR5cGVvZiBjb2xvciAhPT0gInN0cmluZyIpIHJldHVybiBjb2xvcjsKICAgICAgICBjb25zdCBrZXkgPSBjb2xvci50cmltKCkudG9Mb3dlckNhc2UoKTsKICAgICAgICBjb25zdCBjb2xvck1hcCA9IHsKICAgICAgICAgICIjMDA3MWUzIjogIiMwYjVjZmYiLAogICAgICAgICAgIiMwMDc3ZWQiOiAiIzBiNWNmZiIsCiAgICAgICAgICAiIzAwNWFiNiI6ICIjMDY0N2M5IiwKICAgICAgICAgICIjOTRhM2I4IjogIiNjN2QyZTMiLAogICAgICAgICAgIiNjYmQ1ZTEiOiAiI2UxZTdmMSIsCiAgICAgICAgICAiI2UyZThmMCI6ICIjZThlZGY1IiwKICAgICAgICAgICIjNjQ3NDhiIjogIiM2NjcwODUiLAogICAgICAgICAgIiNmMWY1ZjkiOiAiI2VlZjJmNyIsCiAgICAgICAgfTsKICAgICAgICByZXR1cm4gY29sb3JNYXBba2V5XSB8fCBjb2xvcjsKICAgICAgfSwKCiAgICAgIHRvUmdiYShjb2xvciwgYWxwaGEpIHsKICAgICAgICBpZiAodHlwZW9mIGNvbG9yICE9PSAic3RyaW5nIikgcmV0dXJuIGNvbG9yOwogICAgICAgIGlmIChjb2xvci5pbmRleE9mKCJyZ2IiKSA9PT0gMCkgcmV0dXJuIGNvbG9yOwogICAgICAgIGlmIChjb2xvci5jaGFyQXQoMCkgIT09ICIjIikgcmV0dXJuIGNvbG9yOwoKICAgICAgICBsZXQgaGV4ID0gY29sb3Iuc2xpY2UoMSk7CiAgICAgICAgaWYgKGhleC5sZW5ndGggPT09IDMpIHsKICAgICAgICAgIGhleCA9IGhleAogICAgICAgICAgICAuc3BsaXQoIiIpCiAgICAgICAgICAgIC5tYXAoKGNoYXIpID0+IGNoYXIgKyBjaGFyKQogICAgICAgICAgICAuam9pbigiIik7CiAgICAgICAgfQogICAgICAgIGlmIChoZXgubGVuZ3RoICE9PSA2KSByZXR1cm4gY29sb3I7CgogICAgICAgIGNvbnN0IHJlZCA9IHBhcnNlSW50KGhleC5zbGljZSgwLCAyKSwgMTYpOwogICAgICAgIGNvbnN0IGdyZWVuID0gcGFyc2VJbnQoaGV4LnNsaWNlKDIsIDQpLCAxNik7CiAgICAgICAgY29uc3QgYmx1ZSA9IHBhcnNlSW50KGhleC5zbGljZSg0LCA2KSwgMTYpOwogICAgICAgIHJldHVybiAoCiAgICAgICAgICAicmdiYSgiICsKICAgICAgICAgIHJlZCArCiAgICAgICAgICAiLCAiICsKICAgICAgICAgIGdyZWVuICsKICAgICAgICAgICIsICIgKwogICAgICAgICAgYmx1ZSArCiAgICAgICAgICAiLCAiICsKICAgICAgICAgIGFscGhhICsKICAgICAgICAgICIpIgogICAgICAgICk7CiAgICAgIH0sCgogICAgICBidWlsZENoYXJ0Q29uZmlnKGVsZW1lbnQsIHNjb3BlKSB7CiAgICAgICAgY29uc3QgcmF3ID0KICAgICAgICAgIGVsZW1lbnQgJiYgZWxlbWVudC5jaGFydERhdGEgPyBlbGVtZW50LmNoYXJ0RGF0YSA6IHt9OwogICAgICAgIGxldCBjb25maWc7CgogICAgICAgIHRyeSB7CiAgICAgICAgICBjb25maWcgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHJhdykpOwogICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7CiAgICAgICAgICBjb25maWcgPSB7fTsKICAgICAgICB9CgogICAgICAgIGNvbmZpZy50eXBlID0gY29uZmlnLnR5cGUgfHwgImJhciI7CiAgICAgICAgY29uc3QgaXNBcmVhID0gY29uZmlnLnR5cGUgPT09ICJhcmVhIjsKICAgICAgICBpZiAoaXNBcmVhKSBjb25maWcudHlwZSA9ICJsaW5lIjsKICAgICAgICBpZiAoY29uZmlnLnR5cGUgPT09ICJob3Jpem9udGFsQmFyIikgewogICAgICAgICAgY29uZmlnLnR5cGUgPSAiYmFyIjsKICAgICAgICAgIGNvbmZpZy5vcHRpb25zID0gY29uZmlnLm9wdGlvbnMgfHwge307CiAgICAgICAgICBjb25maWcub3B0aW9ucy5pbmRleEF4aXMgPSAieSI7CiAgICAgICAgfQogICAgICAgIGNvbmZpZy5kYXRhID0gY29uZmlnLmRhdGEgfHwge307CiAgICAgICAgY29uZmlnLmRhdGEubGFiZWxzID0gY29uZmlnLmRhdGEubGFiZWxzIHx8IFtdOwoKICAgICAgICBjb25zdCBzb3VyY2VEYXRhc2V0cyA9IGNvbmZpZy5kYXRhLmRhdGFzZXRzIHx8IFtdOwogICAgICAgIGNvbnN0IHBhbGV0dGUgPSB0aGlzLmdldENoYXJ0UGFsZXR0ZSgpOwogICAgICAgIGNvbnN0IGZvbnQgPSB0aGlzLmNoYXJ0Rm9udEZhbWlseSgpOwogICAgICAgIGNvbnN0IGlzQ2FyZCA9IHNjb3BlID09PSAiY2FyZCI7CiAgICAgICAgY29uc3QgaXNSYWRpYWwgPQogICAgICAgICAgY29uZmlnLnR5cGUgPT09ICJwaWUiIHx8CiAgICAgICAgICBjb25maWcudHlwZSA9PT0gImRvdWdobnV0IiB8fAogICAgICAgICAgY29uZmlnLnR5cGUgPT09ICJwb2xhckFyZWEiOwoKICAgICAgICBjb25zdCBkYXRhc2V0cyA9IHNvdXJjZURhdGFzZXRzLm1hcCgoZGF0YXNldCwgZGF0YXNldEluZGV4KSA9PiB7CiAgICAgICAgICBjb25zdCBjdXJyZW50ID0gT2JqZWN0LmFzc2lnbih7fSwgZGF0YXNldCk7CiAgICAgICAgICBjb25zdCBmYWxsYmFjayA9IHBhbGV0dGVbZGF0YXNldEluZGV4ICUgcGFsZXR0ZS5sZW5ndGhdOwogICAgICAgICAgbGV0IGJhc2VDb2xvciA9CiAgICAgICAgICAgIGN1cnJlbnQuYm9yZGVyQ29sb3IgfHwKICAgICAgICAgICAgKHR5cGVvZiBjdXJyZW50LmJhY2tncm91bmRDb2xvciA9PT0gInN0cmluZyIKICAgICAgICAgICAgICA/IGN1cnJlbnQuYmFja2dyb3VuZENvbG9yCiAgICAgICAgICAgICAgOiAiIikgfHwKICAgICAgICAgICAgZmFsbGJhY2s7CiAgICAgICAgICBiYXNlQ29sb3IgPSB0aGlzLm5vcm1hbGl6ZUNoYXJ0Q29sb3IoYmFzZUNvbG9yKTsKCiAgICAgICAgICBpZiAoY29uZmlnLnR5cGUgPT09ICJsaW5lIiB8fCBjb25maWcudHlwZSA9PT0gImFyZWEiKSB7CiAgICAgICAgICAgIGN1cnJlbnQuYm9yZGVyQ29sb3IgPSBiYXNlQ29sb3I7CiAgICAgICAgICAgIGN1cnJlbnQuYmFja2dyb3VuZENvbG9yID0gdGhpcy50b1JnYmEoCiAgICAgICAgICAgICAgYmFzZUNvbG9yLAogICAgICAgICAgICAgIGN1cnJlbnQuZmlsbCA9PT0gZmFsc2UgPyAwIDogMC4xCiAgICAgICAgICAgICk7CiAgICAgICAgICAgIGlmIChjdXJyZW50LmZpbGwgPT09IHVuZGVmaW5lZCkgewogICAgICAgICAgICAgIGN1cnJlbnQuZmlsbCA9IGlzQXJlYSB8fCBzb3VyY2VEYXRhc2V0cy5sZW5ndGggPT09IDE7CiAgICAgICAgICAgIH0KICAgICAgICAgICAgY3VycmVudC5ib3JkZXJXaWR0aCA9IGN1cnJlbnQuYm9yZGVyV2lkdGggfHwgMzsKICAgICAgICAgICAgY3VycmVudC50ZW5zaW9uID0KICAgICAgICAgICAgICBjdXJyZW50LnRlbnNpb24gPT09IHVuZGVmaW5lZCA/IDAuMzYgOiBjdXJyZW50LnRlbnNpb247CiAgICAgICAgICAgIGN1cnJlbnQucG9pbnRSYWRpdXMgPQogICAgICAgICAgICAgIGN1cnJlbnQucG9pbnRSYWRpdXMgPT09IHVuZGVmaW5lZCA/IDAgOiBjdXJyZW50LnBvaW50UmFkaXVzOwogICAgICAgICAgICBjdXJyZW50LnBvaW50SG92ZXJSYWRpdXMgPSBjdXJyZW50LnBvaW50SG92ZXJSYWRpdXMgfHwgNTsKICAgICAgICAgICAgY3VycmVudC5wb2ludEhvdmVyQmFja2dyb3VuZENvbG9yID0gIiNmZmZmZmYiOwogICAgICAgICAgICBjdXJyZW50LnBvaW50SG92ZXJCb3JkZXJDb2xvciA9IGJhc2VDb2xvcjsKICAgICAgICAgICAgY3VycmVudC5wb2ludEhvdmVyQm9yZGVyV2lkdGggPSAyOwogICAgICAgICAgICBjdXJyZW50LnNwYW5HYXBzID0gdHJ1ZTsKICAgICAgICAgIH0gZWxzZSBpZiAoCiAgICAgICAgICAgIGNvbmZpZy50eXBlID09PSAiYmFyIiB8fAogICAgICAgICAgICBjb25maWcudHlwZSA9PT0gImhvcml6b250YWxCYXIiCiAgICAgICAgICApIHsKICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY3VycmVudC5iYWNrZ3JvdW5kQ29sb3IpKSB7CiAgICAgICAgICAgICAgY3VycmVudC5iYWNrZ3JvdW5kQ29sb3IgPSBjdXJyZW50LmJhY2tncm91bmRDb2xvci5tYXAoKGNvbG9yKSA9PgogICAgICAgICAgICAgICAgdGhpcy5ub3JtYWxpemVDaGFydENvbG9yKGNvbG9yKQogICAgICAgICAgICAgICk7CiAgICAgICAgICAgIH0gZWxzZSBpZiAoY3VycmVudC5iYWNrZ3JvdW5kQ29sb3IpIHsKICAgICAgICAgICAgICBjdXJyZW50LmJhY2tncm91bmRDb2xvciA9IHRoaXMubm9ybWFsaXplQ2hhcnRDb2xvcigKICAgICAgICAgICAgICAgIGN1cnJlbnQuYmFja2dyb3VuZENvbG9yCiAgICAgICAgICAgICAgKTsKICAgICAgICAgICAgfSBlbHNlIGlmICgKICAgICAgICAgICAgICBzb3VyY2VEYXRhc2V0cy5sZW5ndGggPT09IDEgJiYKICAgICAgICAgICAgICBlbGVtZW50ICYmCiAgICAgICAgICAgICAgdHlwZW9mIGVsZW1lbnQuaGlnaGxpZ2h0SW5kZXggPT09ICJudW1iZXIiICYmCiAgICAgICAgICAgICAgY29uZmlnLmRhdGEubGFiZWxzLmxlbmd0aAogICAgICAgICAgICApIHsKICAgICAgICAgICAgICBjdXJyZW50LmJhY2tncm91bmRDb2xvciA9IGNvbmZpZy5kYXRhLmxhYmVscy5tYXAoCiAgICAgICAgICAgICAgICAobGFiZWwsIGluZGV4KSA9PgogICAgICAgICAgICAgICAgICBpbmRleCA9PT0gZWxlbWVudC5oaWdobGlnaHRJbmRleCA/IHBhbGV0dGVbMF0gOiAiI2RmZTZmMSIKICAgICAgICAgICAgICApOwogICAgICAgICAgICB9IGVsc2UgewogICAgICAgICAgICAgIGN1cnJlbnQuYmFja2dyb3VuZENvbG9yID0gcGFsZXR0ZVtkYXRhc2V0SW5kZXggJSBwYWxldHRlLmxlbmd0aF07CiAgICAgICAgICAgIH0KICAgICAgICAgICAgY29uc3QgaXNIb3Jpem9udGFsQmFyID0KICAgICAgICAgICAgICBCb29sZWFuKGNvbmZpZy5vcHRpb25zKSAmJiBjb25maWcub3B0aW9ucy5pbmRleEF4aXMgPT09ICJ5IjsKICAgICAgICAgICAgY3VycmVudC5ib3JkZXJSYWRpdXMgPQogICAgICAgICAgICAgIGN1cnJlbnQuYm9yZGVyUmFkaXVzID09PSB1bmRlZmluZWQKICAgICAgICAgICAgICAgID8gaXNIb3Jpem9udGFsQmFyCiAgICAgICAgICAgICAgICAgID8geyB0b3BMZWZ0OiAwLCBib3R0b21MZWZ0OiAwLCB0b3BSaWdodDogOCwgYm90dG9tUmlnaHQ6IDggfQogICAgICAgICAgICAgICAgICA6IHsgdG9wTGVmdDogOCwgdG9wUmlnaHQ6IDgsIGJvdHRvbUxlZnQ6IDAsIGJvdHRvbVJpZ2h0OiAwIH0KICAgICAgICAgICAgICAgIDogY3VycmVudC5ib3JkZXJSYWRpdXM7CiAgICAgICAgICAgIGN1cnJlbnQubWF4QmFyVGhpY2tuZXNzID0gY3VycmVudC5tYXhCYXJUaGlja25lc3MgfHwgNzI7CiAgICAgICAgICAgIGN1cnJlbnQuYm9yZGVyU2tpcHBlZCA9IGZhbHNlOwogICAgICAgICAgICBjdXJyZW50LmNhdGVnb3J5UGVyY2VudGFnZSA9IGN1cnJlbnQuY2F0ZWdvcnlQZXJjZW50YWdlIHx8IDAuNjg7CiAgICAgICAgICAgIGN1cnJlbnQuYmFyUGVyY2VudGFnZSA9IGN1cnJlbnQuYmFyUGVyY2VudGFnZSB8fCAwLjc2OwogICAgICAgICAgfSBlbHNlIGlmIChpc1JhZGlhbCkgewogICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShjdXJyZW50LmJhY2tncm91bmRDb2xvcikpIHsKICAgICAgICAgICAgICBjdXJyZW50LmJhY2tncm91bmRDb2xvciA9IGN1cnJlbnQuYmFja2dyb3VuZENvbG9yLm1hcCgoY29sb3IpID0+CiAgICAgICAgICAgICAgICB0aGlzLm5vcm1hbGl6ZUNoYXJ0Q29sb3IoY29sb3IpCiAgICAgICAgICAgICAgKTsKICAgICAgICAgICAgfSBlbHNlIHsKICAgICAgICAgICAgICBjdXJyZW50LmJhY2tncm91bmRDb2xvciA9IHBhbGV0dGU7CiAgICAgICAgICAgIH0KICAgICAgICAgICAgY3VycmVudC5ib3JkZXJDb2xvciA9ICIjZmZmZmZmIjsKICAgICAgICAgICAgY3VycmVudC5ib3JkZXJXaWR0aCA9IDM7CiAgICAgICAgICAgIGN1cnJlbnQuaG92ZXJPZmZzZXQgPSA2OwogICAgICAgICAgfSBlbHNlIGlmIChjb25maWcudHlwZSA9PT0gInJhZGFyIikgewogICAgICAgICAgICBjdXJyZW50LmJvcmRlckNvbG9yID0gYmFzZUNvbG9yOwogICAgICAgICAgICBjdXJyZW50LmJhY2tncm91bmRDb2xvciA9IHRoaXMudG9SZ2JhKGJhc2VDb2xvciwgMC4xMik7CiAgICAgICAgICAgIGN1cnJlbnQuYm9yZGVyV2lkdGggPSAyOwogICAgICAgICAgICBjdXJyZW50LnBvaW50UmFkaXVzID0gY3VycmVudC5wb2ludFJhZGl1cyB8fCAzOwogICAgICAgICAgICBjdXJyZW50LnBvaW50QmFja2dyb3VuZENvbG9yID0gYmFzZUNvbG9yOwogICAgICAgICAgfSBlbHNlIGlmIChjb25maWcudHlwZSA9PT0gInNjYXR0ZXIiKSB7CiAgICAgICAgICAgIGN1cnJlbnQuYmFja2dyb3VuZENvbG9yID0gYmFzZUNvbG9yOwogICAgICAgICAgICBjdXJyZW50LmJvcmRlckNvbG9yID0gIiNmZmZmZmYiOwogICAgICAgICAgICBjdXJyZW50LmJvcmRlcldpZHRoID0gMjsKICAgICAgICAgICAgY3VycmVudC5wb2ludFJhZGl1cyA9IGN1cnJlbnQucG9pbnRSYWRpdXMgfHwgNTsKICAgICAgICAgICAgY3VycmVudC5wb2ludEhvdmVyUmFkaXVzID0gNzsKICAgICAgICAgIH0KCiAgICAgICAgICByZXR1cm4gY3VycmVudDsKICAgICAgICB9KTsKCiAgICAgICAgY29uZmlnLmRhdGEuZGF0YXNldHMgPSBkYXRhc2V0czsKCiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IGNvbmZpZy5vcHRpb25zID8gY29uZmlnLm9wdGlvbnMgOiB7fTsKICAgICAgICBjb25maWcub3B0aW9ucyA9IG9wdGlvbnM7CiAgICAgICAgY29uc3QgdGlja1NpemUgPSBpc0NhcmQgPyAxMCA6IDIyOwogICAgICAgIGNvbnN0IGxlZ2VuZFNpemUgPSBpc0NhcmQgPyAxMCA6IDE4OwoKICAgICAgICBvcHRpb25zLnJlc3BvbnNpdmUgPSAhaXNDYXJkOwogICAgICAgIGlmIChpc0NhcmQpIHsKICAgICAgICAgIG9wdGlvbnMubWFpbnRhaW5Bc3BlY3RSYXRpbyA9IGZhbHNlOwogICAgICAgIH0gZWxzZSBpZiAoaXNSYWRpYWwpIHsKICAgICAgICAgIG9wdGlvbnMubWFpbnRhaW5Bc3BlY3RSYXRpbyA9IHRydWU7CiAgICAgICAgICBvcHRpb25zLmFzcGVjdFJhdGlvID0gMTsKICAgICAgICB9IGVsc2UgewogICAgICAgICAgb3B0aW9ucy5tYWludGFpbkFzcGVjdFJhdGlvID0gZmFsc2U7CiAgICAgICAgfQoKICAgICAgICBvcHRpb25zLmFuaW1hdGlvbiA9IGlzQ2FyZAogICAgICAgICAgPyBmYWxzZQogICAgICAgICAgOiBPYmplY3QuYXNzaWduKAogICAgICAgICAgICAgIHsgZHVyYXRpb246IDcyMCwgZWFzaW5nOiAiZWFzZU91dFF1YXJ0IiB9LAogICAgICAgICAgICAgIG9wdGlvbnMuYW5pbWF0aW9uIHx8IHt9CiAgICAgICAgICAgICk7CiAgICAgICAgb3B0aW9ucy5mb250ID0geyBmYW1pbHk6IGZvbnQgfTsKICAgICAgICBvcHRpb25zLmNvbG9yID0gIiM2NjcwODUiOwogICAgICAgIG9wdGlvbnMubGF5b3V0ID0gT2JqZWN0LmFzc2lnbigKICAgICAgICAgIHsKICAgICAgICAgICAgcGFkZGluZzogeyB0b3A6IDgsIHJpZ2h0OiA4LCBib3R0b206IDAsIGxlZnQ6IDAgfSwKICAgICAgICAgIH0sCiAgICAgICAgICBvcHRpb25zLmxheW91dCB8fCB7fQogICAgICAgICk7CiAgICAgICAgb3B0aW9ucy5pbnRlcmFjdGlvbiA9IE9iamVjdC5hc3NpZ24oCiAgICAgICAgICB7IG1vZGU6ICJpbmRleCIsIGludGVyc2VjdDogZmFsc2UgfSwKICAgICAgICAgIG9wdGlvbnMuaW50ZXJhY3Rpb24gfHwge30KICAgICAgICApOwoKICAgICAgICBvcHRpb25zLnBsdWdpbnMgPSBvcHRpb25zLnBsdWdpbnMgfHwge307CiAgICAgICAgb3B0aW9ucy5wbHVnaW5zLnRpdGxlID0geyBkaXNwbGF5OiBmYWxzZSB9OwoKICAgICAgICBjb25zdCBsZWdlbmQgPQogICAgICAgICAgb3B0aW9ucy5wbHVnaW5zLmxlZ2VuZCA9PT0gZmFsc2UKICAgICAgICAgICAgPyB7IGRpc3BsYXk6IGZhbHNlIH0KICAgICAgICAgICAgOiBPYmplY3QuYXNzaWduKHt9LCBvcHRpb25zLnBsdWdpbnMubGVnZW5kIHx8IHt9KTsKICAgICAgICBsZWdlbmQuZGlzcGxheSA9CiAgICAgICAgICAhaXNDYXJkICYmCiAgICAgICAgICAoZGF0YXNldHMubGVuZ3RoID4gMSB8fAogICAgICAgICAgICAoaXNSYWRpYWwgJiYgY29uZmlnLmRhdGEubGFiZWxzLmxlbmd0aCA+IDApKTsKICAgICAgICBsZWdlbmQucG9zaXRpb24gPSBpc1JhZGlhbCA/ICJyaWdodCIgOiAidG9wIjsKICAgICAgICBsZWdlbmQuYWxpZ24gPSBpc1JhZGlhbCA/ICJjZW50ZXIiIDogImVuZCI7CiAgICAgICAgbGVnZW5kLmxhYmVscyA9IE9iamVjdC5hc3NpZ24oCiAgICAgICAgICB7CiAgICAgICAgICAgIHVzZVBvaW50U3R5bGU6IHRydWUsCiAgICAgICAgICAgIHBvaW50U3R5bGU6ICJjaXJjbGUiLAogICAgICAgICAgICBib3hXaWR0aDogNiwKICAgICAgICAgICAgYm94SGVpZ2h0OiA2LAogICAgICAgICAgICBwYWRkaW5nOiBpc0NhcmQgPyA4IDogMjIsCiAgICAgICAgICAgIGNvbG9yOiAiIzQ3NTQ2NyIsCiAgICAgICAgICAgIGZvbnQ6IHsKICAgICAgICAgICAgICBmYW1pbHk6IGZvbnQsCiAgICAgICAgICAgICAgc2l6ZTogbGVnZW5kU2l6ZSwKICAgICAgICAgICAgICB3ZWlnaHQ6ICI1MDAiLAogICAgICAgICAgICB9LAogICAgICAgICAgfSwKICAgICAgICAgIGxlZ2VuZC5sYWJlbHMgfHwge30KICAgICAgICApOwogICAgICAgIG9wdGlvbnMucGx1Z2lucy5sZWdlbmQgPSBsZWdlbmQ7CgogICAgICAgIGNvbnN0IHRvb2x0aXAgPQogICAgICAgICAgb3B0aW9ucy5wbHVnaW5zLnRvb2x0aXAgPT09IGZhbHNlCiAgICAgICAgICAgID8geyBlbmFibGVkOiBmYWxzZSB9CiAgICAgICAgICAgIDogT2JqZWN0LmFzc2lnbih7fSwgb3B0aW9ucy5wbHVnaW5zLnRvb2x0aXAgfHwge30pOwogICAgICAgIHRvb2x0aXAuZW5hYmxlZCA9ICFpc0NhcmQ7CiAgICAgICAgdG9vbHRpcC5iYWNrZ3JvdW5kQ29sb3IgPSAiIzEwMTgyOCI7CiAgICAgICAgdG9vbHRpcC50aXRsZUNvbG9yID0gIiNmZmZmZmYiOwogICAgICAgIHRvb2x0aXAuYm9keUNvbG9yID0gIiNlNGU3ZWMiOwogICAgICAgIHRvb2x0aXAuYm9yZGVyQ29sb3IgPSAicmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA4KSI7CiAgICAgICAgdG9vbHRpcC5ib3JkZXJXaWR0aCA9IDE7CiAgICAgICAgdG9vbHRpcC5wYWRkaW5nID0gMTI7CiAgICAgICAgdG9vbHRpcC5jb3JuZXJSYWRpdXMgPSAxMDsKICAgICAgICB0b29sdGlwLmRpc3BsYXlDb2xvcnMgPSB0cnVlOwogICAgICAgIHRvb2x0aXAuYm94V2lkdGggPSA3OwogICAgICAgIHRvb2x0aXAuYm94SGVpZ2h0ID0gNzsKICAgICAgICB0b29sdGlwLnVzZVBvaW50U3R5bGUgPSB0cnVlOwogICAgICAgIHRvb2x0aXAudGl0bGVGb250ID0gewogICAgICAgICAgZmFtaWx5OiBmb250LAogICAgICAgICAgc2l6ZTogMTMsCiAgICAgICAgICB3ZWlnaHQ6ICI2MDAiLAogICAgICAgIH07CiAgICAgICAgdG9vbHRpcC5ib2R5Rm9udCA9IHsKICAgICAgICAgIGZhbWlseTogZm9udCwKICAgICAgICAgIHNpemU6IDEzLAogICAgICAgICAgd2VpZ2h0OiAiNDAwIiwKICAgICAgICB9OwogICAgICAgIG9wdGlvbnMucGx1Z2lucy50b29sdGlwID0gdG9vbHRpcDsKCiAgICAgICAgb3B0aW9ucy5zY2FsZXMgPSBvcHRpb25zLnNjYWxlcyB8fCB7fTsKCiAgICAgICAgaWYgKGlzUmFkaWFsKSB7CiAgICAgICAgICBpZiAoY29uZmlnLnR5cGUgPT09ICJkb3VnaG51dCIpIHsKICAgICAgICAgICAgb3B0aW9ucy5jdXRvdXQgPSBvcHRpb25zLmN1dG91dCB8fCAiNjQlIjsKICAgICAgICAgIH0KICAgICAgICB9IGVsc2UgaWYgKGNvbmZpZy50eXBlID09PSAicmFkYXIiKSB7CiAgICAgICAgICBjb25zdCByYWRpYWwgPSBvcHRpb25zLnNjYWxlcy5yIHx8IHt9OwogICAgICAgICAgcmFkaWFsLmdyaWQgPSBPYmplY3QuYXNzaWduKHt9LCByYWRpYWwuZ3JpZCwgewogICAgICAgICAgICBjb2xvcjogInJnYmEoMTYsIDI0LCA0MCwgMC4wOCkiLAogICAgICAgICAgfSk7CiAgICAgICAgICByYWRpYWwuYW5nbGVMaW5lcyA9IE9iamVjdC5hc3NpZ24oe30sIHJhZGlhbC5hbmdsZUxpbmVzLCB7CiAgICAgICAgICAgIGNvbG9yOiAicmdiYSgxNiwgMjQsIDQwLCAwLjA4KSIsCiAgICAgICAgICB9KTsKICAgICAgICAgIHJhZGlhbC5wb2ludExhYmVscyA9IE9iamVjdC5hc3NpZ24oe30sIHJhZGlhbC5wb2ludExhYmVscywgewogICAgICAgICAgICBjb2xvcjogIiM0NzU0NjciLAogICAgICAgICAgICBmb250OiB7CiAgICAgICAgICAgICAgZmFtaWx5OiBmb250LAogICAgICAgICAgICAgIHNpemU6IDE2LAogICAgICAgICAgICAgIHdlaWdodDogIjUwMCIsCiAgICAgICAgICAgIH0sCiAgICAgICAgICB9KTsKICAgICAgICAgIHJhZGlhbC50aWNrcyA9IE9iamVjdC5hc3NpZ24oe30sIHJhZGlhbC50aWNrcywgewogICAgICAgICAgICBkaXNwbGF5OiBmYWxzZSwKICAgICAgICAgIH0pOwogICAgICAgICAgcmFkaWFsLnN1Z2dlc3RlZE1pbiA9IDA7CiAgICAgICAgICBvcHRpb25zLnNjYWxlcy5yID0gcmFkaWFsOwogICAgICAgIH0gZWxzZSB7CiAgICAgICAgICBjb25zdCBpc0hvcml6b250YWwgPQogICAgICAgICAgICBjb25maWcudHlwZSA9PT0gImhvcml6b250YWxCYXIiIHx8IG9wdGlvbnMuaW5kZXhBeGlzID09PSAieSI7CiAgICAgICAgICBjb25zdCBjYXRlZ29yeUF4aXMgPSBpc0hvcml6b250YWwgPyAieSIgOiAieCI7CiAgICAgICAgICBjb25zdCB2YWx1ZUF4aXMgPSBpc0hvcml6b250YWwgPyAieCIgOiAieSI7CgogICAgICAgICAgWyJ4IiwgInkiXS5mb3JFYWNoKChheGlzKSA9PiB7CiAgICAgICAgICAgIG9wdGlvbnMuc2NhbGVzW2F4aXNdID0gb3B0aW9ucy5zY2FsZXNbYXhpc10gfHwge307CiAgICAgICAgICB9KTsKCiAgICAgICAgICBjb25zdCBjYXRlZ29yeSA9IG9wdGlvbnMuc2NhbGVzW2NhdGVnb3J5QXhpc107CiAgICAgICAgICBjb25zdCB2YWx1ZSA9IG9wdGlvbnMuc2NhbGVzW3ZhbHVlQXhpc107CgogICAgICAgICAgY2F0ZWdvcnkuZ3JpZCA9IE9iamVjdC5hc3NpZ24oe30sIGNhdGVnb3J5LmdyaWQsIHsKICAgICAgICAgICAgZGlzcGxheTogZmFsc2UsCiAgICAgICAgICAgIGRyYXdCb3JkZXI6IGZhbHNlLAogICAgICAgICAgICBkcmF3VGlja3M6IGZhbHNlLAogICAgICAgICAgfSk7CiAgICAgICAgICBjYXRlZ29yeS5ib3JkZXIgPSBPYmplY3QuYXNzaWduKHt9LCBjYXRlZ29yeS5ib3JkZXIsIHsKICAgICAgICAgICAgZGlzcGxheTogZmFsc2UsCiAgICAgICAgICB9KTsKICAgICAgICAgIGNhdGVnb3J5LnRpY2tzID0gT2JqZWN0LmFzc2lnbih7fSwgY2F0ZWdvcnkudGlja3MsIHsKICAgICAgICAgICAgY29sb3I6ICIjNjY3MDg1IiwKICAgICAgICAgICAgcGFkZGluZzogMTIsCiAgICAgICAgICAgIG1heFJvdGF0aW9uOiAwLAogICAgICAgICAgICBhdXRvU2tpcDogdHJ1ZSwKICAgICAgICAgICAgZm9udDogewogICAgICAgICAgICAgIGZhbWlseTogZm9udCwKICAgICAgICAgICAgICBzaXplOiB0aWNrU2l6ZSwKICAgICAgICAgICAgICB3ZWlnaHQ6ICI1MDAiLAogICAgICAgICAgICB9LAogICAgICAgICAgfSk7CgogICAgICAgICAgdmFsdWUuZ3JpZCA9IE9iamVjdC5hc3NpZ24oe30sIHZhbHVlLmdyaWQsIHsKICAgICAgICAgICAgY29sb3I6ICJyZ2JhKDE2LCAyNCwgNDAsIDAuMDcpIiwKICAgICAgICAgICAgZHJhd1RpY2tzOiBmYWxzZSwKICAgICAgICAgICAgZHJhd0JvcmRlcjogZmFsc2UsCiAgICAgICAgICB9KTsKICAgICAgICAgIHZhbHVlLmJvcmRlciA9IE9iamVjdC5hc3NpZ24oe30sIHZhbHVlLmJvcmRlciwgewogICAgICAgICAgICBkaXNwbGF5OiBmYWxzZSwKICAgICAgICAgIH0pOwogICAgICAgICAgdmFsdWUudGlja3MgPSBPYmplY3QuYXNzaWduKHt9LCB2YWx1ZS50aWNrcywgewogICAgICAgICAgICBjb2xvcjogIiM5OGEyYjMiLAogICAgICAgICAgICBwYWRkaW5nOiAxMiwKICAgICAgICAgICAgbWF4VGlja3NMaW1pdDogNiwKICAgICAgICAgICAgZm9udDogewogICAgICAgICAgICAgIGZhbWlseTogZm9udCwKICAgICAgICAgICAgICBzaXplOiB0aWNrU2l6ZSwKICAgICAgICAgICAgICB3ZWlnaHQ6ICI1MDAiLAogICAgICAgICAgICB9LAogICAgICAgICAgfSk7CgogICAgICAgICAgaWYgKAogICAgICAgICAgICBjb25maWcudHlwZSA9PT0gImJhciIgfHwKICAgICAgICAgICAgY29uZmlnLnR5cGUgPT09ICJob3Jpem9udGFsQmFyIiB8fAogICAgICAgICAgICAoY29uZmlnLnR5cGUgPT09ICJsaW5lIiAmJgogICAgICAgICAgICAgIGRhdGFzZXRzLnNvbWUoKGRhdGFzZXQpID0+IGRhdGFzZXQuZmlsbCkpCiAgICAgICAgICApIHsKICAgICAgICAgICAgdmFsdWUuYmVnaW5BdFplcm8gPSB0cnVlOwogICAgICAgICAgfQogICAgICAgIH0KCiAgICAgICAgcmV0dXJuIGNvbmZpZzsKICAgICAgfSwKCiAgICAgIC8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogICAgICAgICDlpJbpg6jkvp3otZYKICAgICAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovCiAgICAgIGFzeW5jIGxvYWRDaGFydEpzKCkgewogICAgICAgIGNvbnN0IGV4aXN0aW5nU2NyaXB0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoInB2LWNoYXJ0anMtc2NyaXB0Iik7CiAgICAgICAgaWYgKAogICAgICAgICAgZXhpc3RpbmdTY3JpcHQgJiYKICAgICAgICAgIGV4aXN0aW5nU2NyaXB0LmRhdGFzZXQubG9hZGVkID09PSAidHJ1ZSIgJiYKICAgICAgICAgIHdpbmRvdy5DaGFydAogICAgICAgICkgewogICAgICAgICAgdGhpcy5DaGFydCA9IHdpbmRvdy5DaGFydDsKICAgICAgICAgIHRoaXMuY2hhcnRKc0xvYWRlZCA9IHRydWU7CiAgICAgICAgICByZXR1cm47CiAgICAgICAgfQoKICAgICAgICBpZiAodGhpcy5fY2hhcnRKc1Byb21pc2UpIHJldHVybiB0aGlzLl9jaGFydEpzUHJvbWlzZTsKCiAgICAgICAgdGhpcy5fY2hhcnRKc1Byb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7CiAgICAgICAgICBjb25zdCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCJzY3JpcHQiKTsKICAgICAgICAgIHNjcmlwdC5pZCA9ICJwdi1jaGFydGpzLXNjcmlwdCI7CiAgICAgICAgICBzY3JpcHQuc3JjID0gImh0dHBzOi8vdHJhbnN3ZWIuY24vY29tbW9uL2NoYXJ0LnVtZC5taW4uanMiOwogICAgICAgICAgc2NyaXB0LmFzeW5jID0gdHJ1ZTsKICAgICAgICAgIHNjcmlwdC5vbmxvYWQgPSAoKSA9PiB7CiAgICAgICAgICAgIGlmICghd2luZG93LkNoYXJ0KSB7CiAgICAgICAgICAgICAgdGhpcy5fY2hhcnRKc1Byb21pc2UgPSBudWxsOwogICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoIkNoYXJ0LmpzIOW3suWKoOi9ve+8jOS9huacquaMgui9vSB3aW5kb3cuQ2hhcnQiKSk7CiAgICAgICAgICAgICAgcmV0dXJuOwogICAgICAgICAgICB9CiAgICAgICAgICAgIHNjcmlwdC5kYXRhc2V0LmxvYWRlZCA9ICJ0cnVlIjsKICAgICAgICAgICAgdGhpcy5DaGFydCA9IHdpbmRvdy5DaGFydDsKICAgICAgICAgICAgdGhpcy5jaGFydEpzTG9hZGVkID0gdHJ1ZTsKICAgICAgICAgICAgcmVzb2x2ZSgpOwogICAgICAgICAgfTsKICAgICAgICAgIHNjcmlwdC5vbmVycm9yID0gKCkgPT4gewogICAgICAgICAgICB0aGlzLl9jaGFydEpzUHJvbWlzZSA9IG51bGw7CiAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoIkNoYXJ0LmpzIOi1hOa6kOWKoOi9veWksei0pSIpKTsKICAgICAgICAgIH07CiAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcmlwdCk7CiAgICAgICAgfSk7CgogICAgICAgIHJldHVybiB0aGlzLl9jaGFydEpzUHJvbWlzZTsKICAgICAgfSwKCiAgICAgIGluaXRNZXJtYWlkKCkgewogICAgICAgIGlmICghdGhpcy5tZXJtYWlkKSByZXR1cm47CiAgICAgICAgdGhpcy5tZXJtYWlkLmluaXRpYWxpemUoewogICAgICAgICAgc3RhcnRPbkxvYWQ6IGZhbHNlLAogICAgICAgICAgdGhlbWU6ICJiYXNlIiwKICAgICAgICAgIHNlY3VyaXR5TGV2ZWw6ICJsb29zZSIsCiAgICAgICAgICBmb250RmFtaWx5OiB0aGlzLmNoYXJ0Rm9udEZhbWlseSgpLAogICAgICAgICAgdGhlbWVWYXJpYWJsZXM6IHsKICAgICAgICAgICAgZm9udEZhbWlseTogdGhpcy5jaGFydEZvbnRGYW1pbHkoKSwKICAgICAgICAgICAgcHJpbWFyeUNvbG9yOiAiI2ZmZmZmZiIsCiAgICAgICAgICAgIHByaW1hcnlUZXh0Q29sb3I6ICIjMTAxODI4IiwKICAgICAgICAgICAgcHJpbWFyeUJvcmRlckNvbG9yOiAiI2MzZDBlMyIsCiAgICAgICAgICAgIGxpbmVDb2xvcjogIiM4ZDliYjAiLAogICAgICAgICAgICBzZWNvbmRhcnlDb2xvcjogIiNmNWY4ZmQiLAogICAgICAgICAgICB0ZXJ0aWFyeUNvbG9yOiAiI2ZmZmZmZiIsCiAgICAgICAgICAgIGNsdXN0ZXJCa2c6ICIjZjhmYWZjIiwKICAgICAgICAgICAgY2x1c3RlckJvcmRlcjogIiNlNGU3ZWMiLAogICAgICAgICAgICBlZGdlTGFiZWxCYWNrZ3JvdW5kOiAiI2ZmZmZmZiIsCiAgICAgICAgICAgIG5vZGVCb3JkZXI6ICIjYzNkMGUzIiwKICAgICAgICAgICAgbWFpbkJrZzogIiNmZmZmZmYiLAogICAgICAgICAgICB0ZXh0Q29sb3I6ICIjMTAxODI4IiwKICAgICAgICAgIH0sCiAgICAgICAgICBmbG93Y2hhcnQ6IHsKICAgICAgICAgICAgdXNlTWF4V2lkdGg6IHRydWUsCiAgICAgICAgICAgIGh0bWxMYWJlbHM6IHRydWUsCiAgICAgICAgICAgIGN1cnZlOiAiYmFzaXMiLAogICAgICAgICAgICBwYWRkaW5nOiAxNiwKICAgICAgICAgICAgbm9kZVNwYWNpbmc6IDM2LAogICAgICAgICAgICByYW5rU3BhY2luZzogNTYsCiAgICAgICAgICB9LAogICAgICAgICAgc2VxdWVuY2U6IHsKICAgICAgICAgICAgdXNlTWF4V2lkdGg6IHRydWUsCiAgICAgICAgICAgIG1pcnJvckFjdG9yczogZmFsc2UsCiAgICAgICAgICAgIG1lc3NhZ2VGb250U2l6ZTogMTQsCiAgICAgICAgICAgIGFjdG9yRm9udFNpemU6IDE0LAogICAgICAgICAgfSwKICAgICAgICB9KTsKICAgICAgICB0aGlzLm1lcm1haWRMb2FkZWQgPSB0cnVlOwogICAgICB9LAoKICAgICAgYXN5bmMgbG9hZE1lcm1haWQoKSB7CiAgICAgICAgaWYgKHdpbmRvdy5tZXJtYWlkKSB7CiAgICAgICAgICB0aGlzLm1lcm1haWQgPSB3aW5kb3cubWVybWFpZDsKICAgICAgICAgIHRoaXMuaW5pdE1lcm1haWQoKTsKICAgICAgICAgIHJldHVybjsKICAgICAgICB9CgogICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7CiAgICAgICAgICBjb25zdCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCJzY3JpcHQiKTsKICAgICAgICAgIHNjcmlwdC5zcmMgPQogICAgICAgICAgICAiaHR0cHM6Ly90cmFuc3dlYi5jbi9jb21tb24vbWVybWFpZC5taW4uanMiOwogICAgICAgICAgc2NyaXB0LmFzeW5jID0gdHJ1ZTsKICAgICAgICAgIHNjcmlwdC5vbmxvYWQgPSAoKSA9PiB7CiAgICAgICAgICAgIHRoaXMubWVybWFpZCA9IHdpbmRvdy5tZXJtYWlkOwogICAgICAgICAgICB0aGlzLmluaXRNZXJtYWlkKCk7CiAgICAgICAgICAgIHJlc29sdmUoKTsKICAgICAgICAgIH07CiAgICAgICAgICBzY3JpcHQub25lcnJvciA9ICgpID0+IHJlamVjdChuZXcgRXJyb3IoIk1lcm1haWQg6LWE5rqQ5Yqg6L295aSx6LSlIikpOwogICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzY3JpcHQpOwogICAgICAgIH0pOwogICAgICB9LAoKICAgICAgYXN5bmMgaW5pdFJlcXVpcmVkTGlicmFyaWVzKCkgewogICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFsKICAgICAgICAgIHRoaXMubG9hZENoYXJ0SnMoKS5jYXRjaCgoZXJyb3IpID0+IHsKICAgICAgICAgICAgY29uc29sZS5lcnJvcigiQ2hhcnQuanMg5L6d6LWW5Yqg6L295aSx6LSl77yM5Zu+6KGo5bCG6ZmN57qn5bGV56S6IiwgZXJyb3IpOwogICAgICAgICAgfSksCiAgICAgICAgICB0aGlzLmxvYWRNZXJtYWlkKCkuY2F0Y2goKGVycm9yKSA9PiB7CiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoIk1lcm1haWQg5L6d6LWW5Yqg6L295aSx6LSl77yM5Zu+6KGo5bCG6ZmN57qn5bGV56S6IiwgZXJyb3IpOwogICAgICAgICAgfSksCiAgICAgICAgXSk7CiAgICAgIH0sCgogICAgICAvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KICAgICAgICAg5riy5p+TCiAgICAgICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqLwogICAgICBhc3luYyByZW5kZXJFbGVtZW50cyhzY29wZSwgdGFyZ2V0U2xpZGVJZCkgewogICAgICAgIGlmICghc2NvcGUpIHNjb3BlID0gInJldmVhbCI7CiAgICAgICAgY29uc3Qgcm9vdCA9IHRoaXMuJGVsIHx8IGRvY3VtZW50OwogICAgICAgIGNvbnN0IHNsaWRlcyA9IHRoaXMuYWNjb3VudERhdGEuc2xpZGVzIHx8IFtdOwoKICAgICAgICBmb3IgKGxldCBzSW5kZXggPSAwOyBzSW5kZXggPCBzbGlkZXMubGVuZ3RoOyBzSW5kZXggKz0gMSkgewogICAgICAgICAgY29uc3Qgc2xpZGUgPSBzbGlkZXNbc0luZGV4XTsKICAgICAgICAgIGlmICh0YXJnZXRTbGlkZUlkICYmIHNsaWRlLmlkICE9PSB0YXJnZXRTbGlkZUlkKSBjb250aW51ZTsKICAgICAgICAgIGNvbnN0IGVsZW1lbnRzID0gc2xpZGUuZWxlbWVudHMgfHwgW107CgogICAgICAgICAgZm9yIChsZXQgZUluZGV4ID0gMDsgZUluZGV4IDwgZWxlbWVudHMubGVuZ3RoOyBlSW5kZXggKz0gMSkgewogICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZWxlbWVudHNbZUluZGV4XTsKICAgICAgICAgICAgaWYgKGVsZW1lbnQudHlwZSAhPT0gImNoYXJ0IikgY29udGludWU7CgogICAgICAgICAgICBjb25zdCBrZXkgPSBzY29wZSArICItIiArIHNsaWRlLmlkICsgIi0iICsgZUluZGV4OwoKICAgICAgICAgICAgaWYgKGVsZW1lbnQuY2hhcnRUeXBlID09PSAiY2hhcnRqcyIpIHsKICAgICAgICAgICAgICBpZiAoIXRoaXMuQ2hhcnQpIGNvbnRpbnVlOwogICAgICAgICAgICAgIGNvbnN0IGNhbnZhcyA9IHJvb3QucXVlcnlTZWxlY3RvcigKICAgICAgICAgICAgICAgICdjYW52YXNbZGF0YS1jaGFydC1rZXk9IicgKyBrZXkgKyAnIl0nCiAgICAgICAgICAgICAgKTsKICAgICAgICAgICAgICBpZiAoIWNhbnZhcykgY29udGludWU7CgogICAgICAgICAgICAgIHRyeSB7CiAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGFydEluc3RhbmNlc1trZXldKSB7CiAgICAgICAgICAgICAgICAgIHRoaXMuY2hhcnRJbnN0YW5jZXNba2V5XS5kZXN0cm95KCk7CiAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmNoYXJ0SW5zdGFuY2VzW2tleV07CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoIjJkIik7CiAgICAgICAgICAgICAgICBpZiAoIWNvbnRleHQpIHsKICAgICAgICAgICAgICAgICAgdGhpcy5jaGFydEZhaWx1cmVzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5jaGFydEZhaWx1cmVzLCB7CiAgICAgICAgICAgICAgICAgICAgW2tleV06IHRydWUsCiAgICAgICAgICAgICAgICAgIH0pOwogICAgICAgICAgICAgICAgICBjb250aW51ZTsKICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMuYnVpbGRDaGFydENvbmZpZyhlbGVtZW50LCBzY29wZSk7CiAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0SW5zdGFuY2VzW2tleV0gPSBuZXcgdGhpcy5DaGFydChjb250ZXh0LCBjb25maWcpOwogICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hhcnRGYWlsdXJlc1trZXldKSB7CiAgICAgICAgICAgICAgICAgIGNvbnN0IG5leHRGYWlsdXJlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuY2hhcnRGYWlsdXJlcyk7CiAgICAgICAgICAgICAgICAgIGRlbGV0ZSBuZXh0RmFpbHVyZXNba2V5XTsKICAgICAgICAgICAgICAgICAgdGhpcy5jaGFydEZhaWx1cmVzID0gbmV4dEZhaWx1cmVzOwogICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgaWYgKHNjb3BlID09PSAicmV2ZWFsIikgewogICAgICAgICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gewogICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoYXJ0ID0gdGhpcy5jaGFydEluc3RhbmNlc1trZXldOwogICAgICAgICAgICAgICAgICAgIGlmIChjaGFydCAmJiB0eXBlb2YgY2hhcnQucmVzaXplID09PSAiZnVuY3Rpb24iKSB7CiAgICAgICAgICAgICAgICAgICAgICBjaGFydC5yZXNpemUoKTsKICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgIH0pOwogICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7CiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCJDaGFydC5qcyDmuLLmn5PlpLHotKUiLCBlcnJvcik7CiAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0RmFpbHVyZXMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmNoYXJ0RmFpbHVyZXMsIHsKICAgICAgICAgICAgICAgICAgW2tleV06IHRydWUsCiAgICAgICAgICAgICAgICB9KTsKICAgICAgICAgICAgICB9CiAgICAgICAgICAgIH0gZWxzZSBpZiAoZWxlbWVudC5jaGFydFR5cGUgPT09ICJtZXJtYWlkIiAmJiB0aGlzLm1lcm1haWQpIHsKICAgICAgICAgICAgICBjb25zdCBjb250YWluZXIgPSByb290LnF1ZXJ5U2VsZWN0b3IoCiAgICAgICAgICAgICAgICAnZGl2W2RhdGEtbWVybWFpZC1rZXk9IicgKyBrZXkgKyAnIl0nCiAgICAgICAgICAgICAgKTsKICAgICAgICAgICAgICBpZiAoIWNvbnRhaW5lciB8fCAhZWxlbWVudC5jaGFydERhdGEgfHwgIWVsZW1lbnQuY2hhcnREYXRhLmNvZGUpIHsKICAgICAgICAgICAgICAgIGNvbnRpbnVlOwogICAgICAgICAgICAgIH0KCiAgICAgICAgICAgICAgdHJ5IHsKICAgICAgICAgICAgICAgIGNvbnN0IHNhZmVTbGlkZUlkID0gU3RyaW5nKHNsaWRlLmlkKS5yZXBsYWNlKAogICAgICAgICAgICAgICAgICAvW15hLXpBLVowLTlfLV0vZywKICAgICAgICAgICAgICAgICAgIi0iCiAgICAgICAgICAgICAgICApOwogICAgICAgICAgICAgICAgY29uc3QgdW5pcXVlSWQgPQogICAgICAgICAgICAgICAgICAicHYtbWVybWFpZC0iICsKICAgICAgICAgICAgICAgICAgc2FmZVNsaWRlSWQgKwogICAgICAgICAgICAgICAgICAiLSIgKwogICAgICAgICAgICAgICAgICBlSW5kZXggKwogICAgICAgICAgICAgICAgICAiLSIgKwogICAgICAgICAgICAgICAgICBEYXRlLm5vdygpOwogICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5tZXJtYWlkLnJlbmRlcigKICAgICAgICAgICAgICAgICAgdW5pcXVlSWQsCiAgICAgICAgICAgICAgICAgIGVsZW1lbnQuY2hhcnREYXRhLmNvZGUKICAgICAgICAgICAgICAgICk7CiAgICAgICAgICAgICAgICBjb250YWluZXIuaW5uZXJIVE1MID0gcmVzdWx0LnN2ZzsKCiAgICAgICAgICAgICAgICBjb25zdCByZW5kZXJlZFN2ZyA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCJzdmciKTsKICAgICAgICAgICAgICAgIGlmIChyZW5kZXJlZFN2ZykgewogICAgICAgICAgICAgICAgICAvLyDmmI7noa7orqkgU1ZHIOWcqOWbvuihqOWMuuWfn+WGheetieavlOWxheS4re+8jOmBv+WFjeS4jeWQjCBNZXJtYWlkIOeJiOacrAogICAgICAgICAgICAgICAgICAvLyDoh6rluKYgeE1pbllNaW4g562J5bGe5oCn5pe25oqK5YaF5a656aG25Yiw5LiK5Y2K6YOo5YiG44CCCiAgICAgICAgICAgICAgICAgIHJlbmRlcmVkU3ZnLnNldEF0dHJpYnV0ZSgicHJlc2VydmVBc3BlY3RSYXRpbyIsICJ4TWlkWU1pZCBtZWV0Iik7CiAgICAgICAgICAgICAgICAgIHJlbmRlcmVkU3ZnLnNldEF0dHJpYnV0ZSgid2lkdGgiLCAiMTAwJSIpOwogICAgICAgICAgICAgICAgICByZW5kZXJlZFN2Zy5zZXRBdHRyaWJ1dGUoImhlaWdodCIsICIxMDAlIik7CiAgICAgICAgICAgICAgICAgIHJlbmRlcmVkU3ZnLnN0eWxlLm1heFdpZHRoID0gIm5vbmUiOwogICAgICAgICAgICAgICAgfQoKICAgICAgICAgICAgICAgIGxldCB2aWV3Qm94V2lkdGggPSAwOwogICAgICAgICAgICAgICAgbGV0IHZpZXdCb3hIZWlnaHQgPSAwOwogICAgICAgICAgICAgICAgY29uc3Qgdmlld0JveE1hdGNoID0gcmVzdWx0LnN2Zy5tYXRjaCgKICAgICAgICAgICAgICAgICAgL3ZpZXdCb3hccyo9XHMqWyInXShbXiInXSspWyInXS9pCiAgICAgICAgICAgICAgICApOwogICAgICAgICAgICAgICAgaWYgKHZpZXdCb3hNYXRjaCkgewogICAgICAgICAgICAgICAgICBjb25zdCB2aWV3Qm94UGFydHMgPSB2aWV3Qm94TWF0Y2hbMV0KICAgICAgICAgICAgICAgICAgICAudHJpbSgpCiAgICAgICAgICAgICAgICAgICAgLnNwbGl0KC9bXHMsXSsvKQogICAgICAgICAgICAgICAgICAgIC5tYXAoTnVtYmVyKTsKICAgICAgICAgICAgICAgICAgdmlld0JveFdpZHRoID0gdmlld0JveFBhcnRzWzJdIHx8IDA7CiAgICAgICAgICAgICAgICAgIHZpZXdCb3hIZWlnaHQgPSB2aWV3Qm94UGFydHNbM10gfHwgMDsKICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIGlmICghdmlld0JveFdpZHRoIHx8ICF2aWV3Qm94SGVpZ2h0KSB7CiAgICAgICAgICAgICAgICAgIGNvbnN0IHN2ZyA9IHJlbmRlcmVkU3ZnIHx8IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCJzdmciKTsKICAgICAgICAgICAgICAgICAgaWYgKHN2ZyAmJiBzdmcudmlld0JveCAmJiBzdmcudmlld0JveC5iYXNlVmFsKSB7CiAgICAgICAgICAgICAgICAgICAgdmlld0JveFdpZHRoID0gc3ZnLnZpZXdCb3guYmFzZVZhbC53aWR0aDsKICAgICAgICAgICAgICAgICAgICB2aWV3Qm94SGVpZ2h0ID0gc3ZnLnZpZXdCb3guYmFzZVZhbC5oZWlnaHQ7CiAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIGlmICh2aWV3Qm94V2lkdGggPiAwICYmIHZpZXdCb3hIZWlnaHQgPiAwKSB7CiAgICAgICAgICAgICAgICAgIGNvbnN0IHJhdGlvID0gTWF0aC5tYXgoCiAgICAgICAgICAgICAgICAgICAgMS4yLAogICAgICAgICAgICAgICAgICAgIE1hdGgubWluKDYsIHZpZXdCb3hXaWR0aCAvIHZpZXdCb3hIZWlnaHQpCiAgICAgICAgICAgICAgICAgICk7CiAgICAgICAgICAgICAgICAgIHRoaXMuZGlhZ3JhbVJhdGlvcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZGlhZ3JhbVJhdGlvcywgewogICAgICAgICAgICAgICAgICAgIFtrZXldOiByYXRpbywKICAgICAgICAgICAgICAgICAgfSk7CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGFydEZhaWx1cmVzW2tleV0pIHsKICAgICAgICAgICAgICAgICAgY29uc3QgbmV4dEZhaWx1cmVzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5jaGFydEZhaWx1cmVzKTsKICAgICAgICAgICAgICAgICAgZGVsZXRlIG5leHRGYWlsdXJlc1trZXldOwogICAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0RmFpbHVyZXMgPSBuZXh0RmFpbHVyZXM7CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHsKICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoIk1lcm1haWQg6K+t5rOV6Kej5p6Q5aSx6LSlIiwgZXJyb3IpOwogICAgICAgICAgICAgICAgdGhpcy5jaGFydEZhaWx1cmVzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5jaGFydEZhaWx1cmVzLCB7CiAgICAgICAgICAgICAgICAgIFtrZXldOiB0cnVlLAogICAgICAgICAgICAgICAgfSk7CiAgICAgICAgICAgICAgICBjb250YWluZXIuaW5uZXJIVE1MID0KICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9InJzLW1lcm1haWQtZXJyb3IiPuWbvuihqOivreazleino+aekOWksei0pTwvZGl2Pic7CiAgICAgICAgICAgICAgICBpZiAoCiAgICAgICAgICAgICAgICAgIHRoaXMubWVybWFpZC5tZXJtYWlkQVBJICYmCiAgICAgICAgICAgICAgICAgIHR5cGVvZiB0aGlzLm1lcm1haWQubWVybWFpZEFQSS5yZXNldCA9PT0gImZ1bmN0aW9uIgogICAgICAgICAgICAgICAgKSB7CiAgICAgICAgICAgICAgICAgIHRoaXMubWVybWFpZC5tZXJtYWlkQVBJLnJlc2V0KCk7CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgfQogICAgICAgICAgICB9CiAgICAgICAgICB9CiAgICAgICAgfQogICAgICB9LAoKICAgICAgZ2V0U2xpZGVFbGVtZW50cygpIHsKICAgICAgICBpZiAoIXRoaXMuJGVsKSByZXR1cm4gW107CiAgICAgICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKAogICAgICAgICAgdGhpcy4kZWwucXVlcnlTZWxlY3RvckFsbCgiLnB2LXN0YWdlIC5zbGlkZXMgPiBzZWN0aW9uIikKICAgICAgICApOwogICAgICB9LAoKICAgICAgZ2V0Q3VycmVudFNsaWRlRWxlbWVudCgpIHsKICAgICAgICBjb25zdCBzbGlkZXMgPSB0aGlzLmdldFNsaWRlRWxlbWVudHMoKTsKICAgICAgICByZXR1cm4gc2xpZGVzW3RoaXMuY3VycmVudFNsaWRlSW5kZXhdIHx8IG51bGw7CiAgICAgIH0sCgogICAgICB1cGRhdGVTdGFnZVNjYWxlKCkgewogICAgICAgIGNvbnN0IHN0YWdlID0KICAgICAgICAgIHRoaXMuJGVsICYmIHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IKICAgICAgICAgICAgPyB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCIucHYtc3RhZ2UiKQogICAgICAgICAgICA6IG51bGw7CiAgICAgICAgY29uc3Qgdmlld3BvcnRXaWR0aCA9CiAgICAgICAgICAoc3RhZ2UgJiYgc3RhZ2UuY2xpZW50V2lkdGgpIHx8CiAgICAgICAgICB3aW5kb3cuaW5uZXJXaWR0aCB8fAogICAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoIHx8CiAgICAgICAgICAxOTIwOwogICAgICAgIGNvbnN0IHZpZXdwb3J0SGVpZ2h0ID0KICAgICAgICAgIChzdGFnZSAmJiBzdGFnZS5jbGllbnRIZWlnaHQpIHx8CiAgICAgICAgICB3aW5kb3cuaW5uZXJIZWlnaHQgfHwKICAgICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQgfHwKICAgICAgICAgIDEwODA7CgogICAgICAgIC8vIOeVmeWHuuWuieWFqOi+uei3ne+8jOaegeWuvS/mnoHpq5jnqpflj6PkuIvkuZ/kuI3kvJrorqnpobXpnaLotLTovrnmiJbooqvlrr/kuLsgVUkg6YGu5oyh44CCCiAgICAgICAgY29uc3Qgc2FmZUluc2V0ID0gMTI7CiAgICAgICAgY29uc3QgYXZhaWxhYmxlV2lkdGggPSBNYXRoLm1heCgxLCB2aWV3cG9ydFdpZHRoIC0gc2FmZUluc2V0ICogMik7CiAgICAgICAgY29uc3QgYXZhaWxhYmxlSGVpZ2h0ID0gTWF0aC5tYXgoMSwgdmlld3BvcnRIZWlnaHQgLSBzYWZlSW5zZXQgKiAyKTsKICAgICAgICB0aGlzLnN0YWdlU2NhbGUgPSBNYXRoLm1heCgKICAgICAgICAgIDAuMDEsCiAgICAgICAgICBNYXRoLm1pbihhdmFpbGFibGVXaWR0aCAvIDE5MjAsIGF2YWlsYWJsZUhlaWdodCAvIDEwODApCiAgICAgICAgKTsKICAgICAgfSwKCiAgICAgIHNob3dDdXJyZW50U2xpZGUoKSB7CiAgICAgICAgY29uc3Qgc2xpZGVzID0gdGhpcy5nZXRTbGlkZUVsZW1lbnRzKCk7CiAgICAgICAgc2xpZGVzLmZvckVhY2goKHNsaWRlLCBpbmRleCkgPT4gewogICAgICAgICAgY29uc3QgaXNDdXJyZW50ID0gaW5kZXggPT09IHRoaXMuY3VycmVudFNsaWRlSW5kZXg7CiAgICAgICAgICBzbGlkZS5jbGFzc0xpc3QudG9nZ2xlKCJpcy1jdXJyZW50IiwgaXNDdXJyZW50KTsKICAgICAgICAgIHNsaWRlLnNldEF0dHJpYnV0ZSgiYXJpYS1oaWRkZW4iLCBpc0N1cnJlbnQgPyAiZmFsc2UiIDogInRydWUiKTsKICAgICAgICB9KTsKICAgICAgICB0aGlzLmFuaW1hdGVDdXJyZW50U2xpZGUoKTsKICAgICAgfSwKCiAgICAgIGFuaW1hdGVDdXJyZW50U2xpZGUoKSB7CiAgICAgICAgY29uc3QgY3VycmVudFNsaWRlID0gdGhpcy5nZXRDdXJyZW50U2xpZGVFbGVtZW50KCk7CiAgICAgICAgaWYgKCFjdXJyZW50U2xpZGUpIHJldHVybjsKCiAgICAgICAgY29uc3Qgcm9vdCA9IHRoaXMuJGVsIHx8IGRvY3VtZW50OwogICAgICAgIHJvb3QucXVlcnlTZWxlY3RvckFsbCgiLnJzLXNsaWRlLnJzLWFuaW0tYWN0aXZlIikuZm9yRWFjaCgoc2xpZGUpID0+IHsKICAgICAgICAgIHNsaWRlLmNsYXNzTGlzdC5yZW1vdmUoInJzLWFuaW0tYWN0aXZlIik7CiAgICAgICAgfSk7CiAgICAgICAgY3VycmVudFNsaWRlLmNsYXNzTGlzdC5yZW1vdmUoInJzLWFuaW0tZmFsbGJhY2siKTsKCiAgICAgICAgdm9pZCBjdXJyZW50U2xpZGUub2Zmc2V0V2lkdGg7CiAgICAgICAgY3VycmVudFNsaWRlLmNsYXNzTGlzdC5hZGQoInJzLWFuaW0tYWN0aXZlIik7CgogICAgICAgIGlmICh0aGlzLmFuaW1hdGlvblRpbWVyKSB7CiAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5hbmltYXRpb25UaW1lcik7CiAgICAgICAgfQogICAgICAgIGNvbnN0IHNsaWRlSWQgPSBjdXJyZW50U2xpZGUuZ2V0QXR0cmlidXRlKCJkYXRhLXNsaWRlLWlkIik7CiAgICAgICAgdGhpcy5hbmltYXRpb25UaW1lciA9IHNldFRpbWVvdXQoKCkgPT4gewogICAgICAgICAgdGhpcy5yZW5kZXJFbGVtZW50cygicmV2ZWFsIiwgc2xpZGVJZCk7CiAgICAgICAgfSwgMTQwKTsKCiAgICAgICAgaWYgKHRoaXMudmlzaWJpbGl0eVRpbWVyKSB7CiAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy52aXNpYmlsaXR5VGltZXIpOwogICAgICAgIH0KICAgICAgICB0aGlzLnZpc2liaWxpdHlUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4gewogICAgICAgICAgY29uc3QgdGFyZ2V0cyA9IGN1cnJlbnRTbGlkZS5xdWVyeVNlbGVjdG9yQWxsKCIucnMtYW5pbS10YXJnZXQiKTsKICAgICAgICAgIGxldCBoaWRkZW5Db3VudCA9IDA7CiAgICAgICAgICB0YXJnZXRzLmZvckVhY2goKHRhcmdldCkgPT4gewogICAgICAgICAgICBpZiAocGFyc2VGbG9hdCh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0YXJnZXQpLm9wYWNpdHkpIDwgMC4wNSkgewogICAgICAgICAgICAgIGhpZGRlbkNvdW50ICs9IDE7CiAgICAgICAgICAgIH0KICAgICAgICAgIH0pOwogICAgICAgICAgaWYgKGhpZGRlbkNvdW50ID4gMCkgewogICAgICAgICAgICBjdXJyZW50U2xpZGUuY2xhc3NMaXN0LmFkZCgicnMtYW5pbS1mYWxsYmFjayIpOwogICAgICAgICAgfQogICAgICAgIH0sIDE4MDApOwogICAgICB9LAoKICAgICAgY2hhcnRLZXkoc2xpZGUsIGVsZW1lbnRJbmRleCkgewogICAgICAgIHJldHVybiAicmV2ZWFsLSIgKyAoc2xpZGUgPyBzbGlkZS5pZCA6ICJzbGlkZSIpICsgIi0iICsgZWxlbWVudEluZGV4OwogICAgICB9LAoKICAgICAgZ2V0RGlhZ3JhbUFzcGVjdChzbGlkZSwgZWxlbWVudEluZGV4KSB7CiAgICAgICAgY29uc3QgcmF0aW8gPSB0aGlzLmRpYWdyYW1SYXRpb3NbdGhpcy5jaGFydEtleShzbGlkZSwgZWxlbWVudEluZGV4KV07CiAgICAgICAgcmV0dXJuIHR5cGVvZiByYXRpbyA9PT0gIm51bWJlciIgJiYgTnVtYmVyLmlzRmluaXRlKHJhdGlvKQogICAgICAgICAgPyByYXRpbwogICAgICAgICAgOiAyLjQ7CiAgICAgIH0sCgogICAgICBnZXRDaGFydFpvb20oc2xpZGUsIGVsZW1lbnRJbmRleCkgewogICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5jaGFydFpvb21bdGhpcy5jaGFydEtleShzbGlkZSwgZWxlbWVudEluZGV4KV07CiAgICAgICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gIm51bWJlciIgJiYgTnVtYmVyLmlzRmluaXRlKHZhbHVlKQogICAgICAgICAgPyB2YWx1ZQogICAgICAgICAgOiAxOwogICAgICB9LAoKICAgICAgZ2V0Q2hhcnRab29tUGVyY2VudChzbGlkZSwgZWxlbWVudEluZGV4KSB7CiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQodGhpcy5nZXRDaGFydFpvb20oc2xpZGUsIGVsZW1lbnRJbmRleCkgKiAxMDApICsgIiUiOwogICAgICB9LAoKICAgICAgZ2V0Q2hhcnRQYW4oc2xpZGUsIGVsZW1lbnRJbmRleCkgewogICAgICAgIHJldHVybiAoCiAgICAgICAgICB0aGlzLmNoYXJ0UGFuW3RoaXMuY2hhcnRLZXkoc2xpZGUsIGVsZW1lbnRJbmRleCldIHx8IHsKICAgICAgICAgICAgeDogMCwKICAgICAgICAgICAgeTogMCwKICAgICAgICAgIH0KICAgICAgICApOwogICAgICB9LAoKICAgICAgaXNDaGFydFBhbm5pbmcoc2xpZGUsIGVsZW1lbnRJbmRleCkgewogICAgICAgIHJldHVybiBCb29sZWFuKAogICAgICAgICAgdGhpcy5jaGFydFBhblN0YXRlICYmCiAgICAgICAgICAgIHRoaXMuY2hhcnRQYW5TdGF0ZS5rZXkgPT09IHRoaXMuY2hhcnRLZXkoc2xpZGUsIGVsZW1lbnRJbmRleCkKICAgICAgICApOwogICAgICB9LAoKICAgICAgZ2V0Q2hhcnRab29tU3R5bGUoc2xpZGUsIGVsZW1lbnRJbmRleCkgewogICAgICAgIGNvbnN0IHpvb20gPSB0aGlzLmdldENoYXJ0Wm9vbShzbGlkZSwgZWxlbWVudEluZGV4KTsKICAgICAgICBjb25zdCBwYW4gPSB0aGlzLmdldENoYXJ0UGFuKHNsaWRlLCBlbGVtZW50SW5kZXgpOwogICAgICAgIGNvbnN0IHBhbm5pbmcgPSB0aGlzLmlzQ2hhcnRQYW5uaW5nKHNsaWRlLCBlbGVtZW50SW5kZXgpOwoKICAgICAgICBpZiAoem9vbSA9PT0gMSAmJiBwYW4ueCA9PT0gMCAmJiBwYW4ueSA9PT0gMCkgewogICAgICAgICAgcmV0dXJuIHsKICAgICAgICAgICAgY3Vyc29yOiAiZGVmYXVsdCIsCiAgICAgICAgICAgIHRvdWNoQWN0aW9uOiAicGFuLXkiLAogICAgICAgICAgfTsKICAgICAgICB9CgogICAgICAgIHJldHVybiB7CiAgICAgICAgICB0cmFuc2Zvcm06CiAgICAgICAgICAgICJ0cmFuc2xhdGUzZCgiICsKICAgICAgICAgICAgcGFuLnggKwogICAgICAgICAgICAicHgsICIgKwogICAgICAgICAgICBwYW4ueSArCiAgICAgICAgICAgICJweCwgMCkgc2NhbGUoIiArCiAgICAgICAgICAgIHpvb20gKwogICAgICAgICAgICAiKSIsCiAgICAgICAgICB0cmFuc2Zvcm1PcmlnaW46ICJjZW50ZXIgY2VudGVyIiwKICAgICAgICAgIGN1cnNvcjogem9vbSA+IDEgPyAocGFubmluZyA/ICJncmFiYmluZyIgOiAiZ3JhYiIpIDogImRlZmF1bHQiLAogICAgICAgICAgdG91Y2hBY3Rpb246IHpvb20gPiAxID8gIm5vbmUiIDogInBhbi15IiwKICAgICAgICB9OwogICAgICB9LAoKICAgICAgc2V0Q2hhcnRab29tKHNsaWRlLCBlbGVtZW50SW5kZXgsIG5leHRab29tKSB7CiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5jaGFydEtleShzbGlkZSwgZWxlbWVudEluZGV4KTsKICAgICAgICBjb25zdCB6b29tID0gTWF0aC5tYXgoCiAgICAgICAgICAwLjUsCiAgICAgICAgICBNYXRoLm1pbigzLCBNYXRoLnJvdW5kKG5leHRab29tICogMTAwKSAvIDEwMCkKICAgICAgICApOwogICAgICAgIHRoaXMuY2hhcnRab29tID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5jaGFydFpvb20sIHsKICAgICAgICAgIFtrZXldOiB6b29tLAogICAgICAgIH0pOwogICAgICAgIGlmICh6b29tIDw9IDEpIHsKICAgICAgICAgIHRoaXMuY2hhcnRQYW4gPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmNoYXJ0UGFuLCB7CiAgICAgICAgICAgIFtrZXldOiB7IHg6IDAsIHk6IDAgfSwKICAgICAgICAgIH0pOwogICAgICAgIH0KICAgICAgfSwKCiAgICAgIHpvb21DaGFydChzbGlkZSwgZWxlbWVudEluZGV4LCBkZWx0YSkgewogICAgICAgIHRoaXMuc2V0Q2hhcnRab29tKAogICAgICAgICAgc2xpZGUsCiAgICAgICAgICBlbGVtZW50SW5kZXgsCiAgICAgICAgICB0aGlzLmdldENoYXJ0Wm9vbShzbGlkZSwgZWxlbWVudEluZGV4KSArIGRlbHRhCiAgICAgICAgKTsKICAgICAgfSwKCiAgICAgIHJlc2V0Q2hhcnRab29tKHNsaWRlLCBlbGVtZW50SW5kZXgpIHsKICAgICAgICB0aGlzLnN0b3BDaGFydFBhbigpOwogICAgICAgIGNvbnN0IGtleSA9IHRoaXMuY2hhcnRLZXkoc2xpZGUsIGVsZW1lbnRJbmRleCk7CiAgICAgICAgdGhpcy5jaGFydFpvb20gPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmNoYXJ0Wm9vbSwgewogICAgICAgICAgW2tleV06IDEsCiAgICAgICAgfSk7CiAgICAgICAgdGhpcy5jaGFydFBhbiA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuY2hhcnRQYW4sIHsKICAgICAgICAgIFtrZXldOiB7IHg6IDAsIHk6IDAgfSwKICAgICAgICB9KTsKICAgICAgfSwKCiAgICAgIGhhbmRsZUNoYXJ0V2hlZWwoZXZlbnQsIHNsaWRlLCBlbGVtZW50SW5kZXgpIHsKICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTsKICAgICAgICBjb25zdCBkZWx0YSA9IGV2ZW50LmRlbHRhWSA8IDAgPyAwLjEyIDogLTAuMTI7CiAgICAgICAgdGhpcy56b29tQ2hhcnQoc2xpZGUsIGVsZW1lbnRJbmRleCwgZGVsdGEpOwogICAgICB9LAoKICAgICAgc3RhcnRDaGFydFBhbihldmVudCkgewogICAgICAgIGNvbnN0IHdyYXBwZXIgPQogICAgICAgICAgZXZlbnQuY3VycmVudFRhcmdldCB8fAogICAgICAgICAgKGV2ZW50LnRhcmdldCAmJgogICAgICAgICAgICB0eXBlb2YgZXZlbnQudGFyZ2V0LmNsb3Nlc3QgPT09ICJmdW5jdGlvbiIgJiYKICAgICAgICAgICAgZXZlbnQudGFyZ2V0LmNsb3Nlc3QoIi5ycy1jaGFydC16b29tIikpOwogICAgICAgIGNvbnN0IGtleSA9IHdyYXBwZXIgJiYgd3JhcHBlci5kYXRhc2V0LmNoYXJ0S2V5OwogICAgICAgIGlmICgha2V5KSByZXR1cm47CgogICAgICAgIGNvbnN0IHpvb20gPSB0aGlzLmNoYXJ0Wm9vbVtrZXldIHx8IDE7CiAgICAgICAgaWYgKHpvb20gPD0gMSB8fCBldmVudC5idXR0b24gIT09IDApIHJldHVybjsKCiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTsKICAgICAgICB0aGlzLnN0b3BDaGFydFBhbigpOwoKICAgICAgICBjb25zdCBwYW4gPSB0aGlzLmNoYXJ0UGFuW2tleV0gfHwgeyB4OiAwLCB5OiAwIH07CiAgICAgICAgdGhpcy5jaGFydFBhblN0YXRlID0gewogICAgICAgICAga2V5LAogICAgICAgICAgc3RhcnRYOiBldmVudC5jbGllbnRYLAogICAgICAgICAgc3RhcnRZOiBldmVudC5jbGllbnRZLAogICAgICAgICAgb3JpZ2luWDogcGFuLngsCiAgICAgICAgICBvcmlnaW5ZOiBwYW4ueSwKICAgICAgICB9OwoKICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigicG9pbnRlcm1vdmUiLCB0aGlzLmhhbmRsZUNoYXJ0UGFuTW92ZSk7CiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoInBvaW50ZXJ1cCIsIHRoaXMuc3RvcENoYXJ0UGFuKTsKICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigicG9pbnRlcmNhbmNlbCIsIHRoaXMuc3RvcENoYXJ0UGFuKTsKICAgICAgfSwKCiAgICAgIGhhbmRsZUNoYXJ0UGFuTW92ZShldmVudCkgewogICAgICAgIGNvbnN0IHN0YXRlID0gdGhpcy5jaGFydFBhblN0YXRlOwogICAgICAgIGlmICghc3RhdGUpIHJldHVybjsKICAgICAgICB0aGlzLmNoYXJ0UGFuID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5jaGFydFBhbiwgewogICAgICAgICAgW3N0YXRlLmtleV06IHsKICAgICAgICAgICAgeDogc3RhdGUub3JpZ2luWCArIGV2ZW50LmNsaWVudFggLSBzdGF0ZS5zdGFydFgsCiAgICAgICAgICAgIHk6IHN0YXRlLm9yaWdpblkgKyBldmVudC5jbGllbnRZIC0gc3RhdGUuc3RhcnRZLAogICAgICAgICAgfSwKICAgICAgICB9KTsKICAgICAgfSwKCiAgICAgIHN0b3BDaGFydFBhbigpIHsKICAgICAgICB0aGlzLmNoYXJ0UGFuU3RhdGUgPSBudWxsOwogICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCJwb2ludGVybW92ZSIsIHRoaXMuaGFuZGxlQ2hhcnRQYW5Nb3ZlKTsKICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigicG9pbnRlcnVwIiwgdGhpcy5zdG9wQ2hhcnRQYW4pOwogICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCJwb2ludGVyY2FuY2VsIiwgdGhpcy5zdG9wQ2hhcnRQYW4pOwogICAgICB9LAoKICAgICAgaXNDaGFydFVuYXZhaWxhYmxlKHNsaWRlLCBlbGVtZW50SW5kZXgsIGVsZW1lbnQpIHsKICAgICAgICBpZiAodGhpcy5pc0NoYXJ0TGlicmFyeVBlbmRpbmcoZWxlbWVudCkpIHJldHVybiB0cnVlOwogICAgICAgIHJldHVybiBCb29sZWFuKAogICAgICAgICAgdGhpcy5jaGFydEZhaWx1cmVzW3RoaXMuY2hhcnRLZXkoc2xpZGUsIGVsZW1lbnRJbmRleCldCiAgICAgICAgKTsKICAgICAgfSwKCiAgICAgIGlzQ2hhcnRMaWJyYXJ5UGVuZGluZyhlbGVtZW50KSB7CiAgICAgICAgaWYgKCFlbGVtZW50IHx8IGVsZW1lbnQudHlwZSAhPT0gImNoYXJ0IikgcmV0dXJuIGZhbHNlOwogICAgICAgIGlmIChlbGVtZW50LmNoYXJ0VHlwZSA9PT0gImNoYXJ0anMiKSByZXR1cm4gIXRoaXMuQ2hhcnQ7CiAgICAgICAgaWYgKGVsZW1lbnQuY2hhcnRUeXBlID09PSAibWVybWFpZCIpIHJldHVybiAhdGhpcy5tZXJtYWlkOwogICAgICAgIHJldHVybiBmYWxzZTsKICAgICAgfSwKCiAgICAgIHJlbmRlckN1cnJlbnRTbGlkZSgpIHsKICAgICAgICBjb25zdCBjdXJyZW50U2xpZGUgPSB0aGlzLmdldEN1cnJlbnRTbGlkZUVsZW1lbnQoKTsKICAgICAgICBpZiAoIWN1cnJlbnRTbGlkZSkgcmV0dXJuOwogICAgICAgIHRoaXMucmVuZGVyRWxlbWVudHMoCiAgICAgICAgICAicmV2ZWFsIiwKICAgICAgICAgIGN1cnJlbnRTbGlkZS5nZXRBdHRyaWJ1dGUoImRhdGEtc2xpZGUtaWQiKQogICAgICAgICk7CiAgICAgIH0sCgogICAgICBnb1RvU2xpZGUoaW5kZXgpIHsKICAgICAgICBpZiAoIXRoaXMuaXNQcmVzZW50YXRpb24gfHwgIXRoaXMudG90YWxTbGlkZXMpIHJldHVybjsKICAgICAgICBjb25zdCBuZXh0SW5kZXggPSBNYXRoLm1heCgKICAgICAgICAgIDAsCiAgICAgICAgICBNYXRoLm1pbih0aGlzLnRvdGFsU2xpZGVzIC0gMSwgaW5kZXgpCiAgICAgICAgKTsKICAgICAgICBpZiAobmV4dEluZGV4ID09PSB0aGlzLmN1cnJlbnRTbGlkZUluZGV4KSByZXR1cm47CiAgICAgICAgdGhpcy5jdXJyZW50U2xpZGVJbmRleCA9IG5leHRJbmRleDsKICAgICAgICB0aGlzLnNjaGVkdWxlVG9vbGJhckhpZGUoKTsKICAgICAgICB0aGlzLnNob3dDdXJyZW50U2xpZGUoKTsKICAgICAgfSwKCiAgICAgIC8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogICAgICAgICDmlL7mmKDmjqfliLYKICAgICAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovCiAgICAgIGxvY2tCb2R5U2Nyb2xsKCkgewogICAgICAgIHRoaXMuYm9keU92ZXJmbG93ID0gZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyB8fCAiIjsKICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gImhpZGRlbiI7CiAgICAgIH0sCgogICAgICB1bmxvY2tCb2R5U2Nyb2xsKCkgewogICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgPSB0aGlzLmJvZHlPdmVyZmxvdyB8fCAiIjsKICAgICAgICB0aGlzLmJvZHlPdmVyZmxvdyA9ICIiOwogICAgICB9LAoKICAgICAgYmluZEV2ZW50cygpIHsKICAgICAgICBpZiAodGhpcy5ldmVudHNCb3VuZCkgcmV0dXJuOwogICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCJrZXlkb3duIiwgdGhpcy5oYW5kbGVLZXlEb3duKTsKICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigicmVzaXplIiwgdGhpcy5oYW5kbGVDaGFydFJlc2l6ZSk7CiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoIm1vdXNlbW92ZSIsIHRoaXMuaGFuZGxlTW91c2VNb3ZlKTsKICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigibW91c2VvdXQiLCB0aGlzLmhhbmRsZVdpbmRvd01vdXNlT3V0KTsKICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigidG91Y2hzdGFydCIsIHRoaXMuaGFuZGxlVG91Y2hTdGFydCwgewogICAgICAgICAgcGFzc2l2ZTogdHJ1ZSwKICAgICAgICB9KTsKICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigidG91Y2hlbmQiLCB0aGlzLmhhbmRsZVRvdWNoRW5kLCB7CiAgICAgICAgICBwYXNzaXZlOiB0cnVlLAogICAgICAgIH0pOwogICAgICAgIHRoaXMuZXZlbnRzQm91bmQgPSB0cnVlOwogICAgICB9LAoKICAgICAgdW5iaW5kRXZlbnRzKCkgewogICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCJrZXlkb3duIiwgdGhpcy5oYW5kbGVLZXlEb3duKTsKICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigicmVzaXplIiwgdGhpcy5oYW5kbGVDaGFydFJlc2l6ZSk7CiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoIm1vdXNlbW92ZSIsIHRoaXMuaGFuZGxlTW91c2VNb3ZlKTsKICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigibW91c2VvdXQiLCB0aGlzLmhhbmRsZVdpbmRvd01vdXNlT3V0KTsKICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigidG91Y2hzdGFydCIsIHRoaXMuaGFuZGxlVG91Y2hTdGFydCk7CiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoInRvdWNoZW5kIiwgdGhpcy5oYW5kbGVUb3VjaEVuZCk7CiAgICAgICAgdGhpcy5ldmVudHNCb3VuZCA9IGZhbHNlOwogICAgICB9LAoKICAgICAgb3BlblNsaWRlQXQoaW5kZXgpIHsKICAgICAgICB0aGlzLmVudGVyUHJlc2VudGF0aW9uKGluZGV4KTsKICAgICAgfSwKCiAgICAgIGVudGVyUHJlc2VudGF0aW9uKHN0YXJ0SW5kZXgpIHsKICAgICAgICBpZiAodGhpcy5pc1ByZXNlbnRhdGlvbiB8fCAhdGhpcy50b3RhbFNsaWRlcykgcmV0dXJuOwoKICAgICAgICB0aGlzLnVwZGF0ZVN0YWdlU2NhbGUoKTsKICAgICAgICB0aGlzLmNoYXJ0RmFpbHVyZXMgPSB7fTsKICAgICAgICB0aGlzLnN0b3BDaGFydFBhbigpOwogICAgICAgIHRoaXMuY2hhcnRab29tID0ge307CiAgICAgICAgdGhpcy5jaGFydFBhbiA9IHt9OwogICAgICAgIHRoaXMuZGlhZ3JhbVJhdGlvcyA9IHt9OwogICAgICAgIHRoaXMuaXNQcmVzZW50YXRpb24gPSB0cnVlOwogICAgICAgIHRoaXMudG9vbGJhcklkbGUgPSB0cnVlOwogICAgICAgIHRoaXMuY3VycmVudFNsaWRlSW5kZXggPSBNYXRoLm1heCgKICAgICAgICAgIDAsCiAgICAgICAgICBNYXRoLm1pbigKICAgICAgICAgICAgdGhpcy50b3RhbFNsaWRlcyAtIDEsCiAgICAgICAgICAgIHR5cGVvZiBzdGFydEluZGV4ID09PSAibnVtYmVyIiA/IHN0YXJ0SW5kZXggOiAwCiAgICAgICAgICApCiAgICAgICAgKTsKCiAgICAgICAgdGhpcy5sb2NrQm9keVNjcm9sbCgpOwogICAgICAgIHRoaXMuYmluZEV2ZW50cygpOwoKICAgICAgICB0aGlzLiRuZXh0VGljaygoKSA9PiB7CiAgICAgICAgICBpZiAoIXRoaXMuaXNQcmVzZW50YXRpb24pIHJldHVybjsKICAgICAgICAgIHRoaXMudXBkYXRlU3RhZ2VTY2FsZSgpOwogICAgICAgICAgdGhpcy5zaG93Q3VycmVudFNsaWRlKCk7CgogICAgICAgICAgaWYgKHR5cGVvZiBSZXNpemVPYnNlcnZlciAhPT0gInVuZGVmaW5lZCIgJiYgdGhpcy4kZWwpIHsKICAgICAgICAgICAgaWYgKHRoaXMuc3RhZ2VSZXNpemVPYnNlcnZlcikgewogICAgICAgICAgICAgIHRoaXMuc3RhZ2VSZXNpemVPYnNlcnZlci5kaXNjb25uZWN0KCk7CiAgICAgICAgICAgIH0KICAgICAgICAgICAgY29uc3Qgc3RhZ2UgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCIucHYtc3RhZ2UiKTsKICAgICAgICAgICAgaWYgKHN0YWdlKSB7CiAgICAgICAgICAgICAgdGhpcy5zdGFnZVJlc2l6ZU9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKCgpID0+IHsKICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlU3RhZ2VTY2FsZSgpOwogICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVDaGFydFJlc2l6ZSgpOwogICAgICAgICAgICAgIH0pOwogICAgICAgICAgICAgIHRoaXMuc3RhZ2VSZXNpemVPYnNlcnZlci5vYnNlcnZlKHN0YWdlKTsKICAgICAgICAgICAgfQogICAgICAgICAgfQoKICAgICAgICAgIHRoaXMuaW5pdFJlcXVpcmVkTGlicmFyaWVzKCkudGhlbigoKSA9PiB7CiAgICAgICAgICAgIGlmICghdGhpcy5pc1ByZXNlbnRhdGlvbikgcmV0dXJuOwogICAgICAgICAgICB0aGlzLiRuZXh0VGljaygoKSA9PiB7CiAgICAgICAgICAgICAgaWYgKCF0aGlzLmlzUHJlc2VudGF0aW9uKSByZXR1cm47CiAgICAgICAgICAgICAgdGhpcy5yZW5kZXJDdXJyZW50U2xpZGUoKTsKICAgICAgICAgICAgfSk7CiAgICAgICAgICB9KTsKICAgICAgICB9KTsKICAgICAgfSwKCiAgICAgIGV4aXRQcmVzZW50YXRpb24oKSB7CiAgICAgICAgaWYgKCF0aGlzLmlzUHJlc2VudGF0aW9uKSByZXR1cm47CgogICAgICAgIHRoaXMuaXNQcmVzZW50YXRpb24gPSBmYWxzZTsKICAgICAgICB0aGlzLnRvb2xiYXJJZGxlID0gZmFsc2U7CiAgICAgICAgdGhpcy51bmJpbmRFdmVudHMoKTsKICAgICAgICB0aGlzLnVubG9ja0JvZHlTY3JvbGwoKTsKCiAgICAgICAgaWYgKHRoaXMudG9vbGJhclRpbWVyKSB7CiAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50b29sYmFyVGltZXIpOwogICAgICAgICAgdGhpcy50b29sYmFyVGltZXIgPSBudWxsOwogICAgICAgIH0KICAgICAgICBpZiAodGhpcy5hbmltYXRpb25UaW1lcikgewogICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuYW5pbWF0aW9uVGltZXIpOwogICAgICAgICAgdGhpcy5hbmltYXRpb25UaW1lciA9IG51bGw7CiAgICAgICAgfQogICAgICAgIGlmICh0aGlzLnZpc2liaWxpdHlUaW1lcikgewogICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudmlzaWJpbGl0eVRpbWVyKTsKICAgICAgICAgIHRoaXMudmlzaWJpbGl0eVRpbWVyID0gbnVsbDsKICAgICAgICB9CiAgICAgICAgaWYgKHRoaXMucmVzaXplRnJhbWUpIHsKICAgICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMucmVzaXplRnJhbWUpOwogICAgICAgICAgdGhpcy5yZXNpemVGcmFtZSA9IG51bGw7CiAgICAgICAgfQoKICAgICAgICBjb25zdCBzbGlkZXMgPSB0aGlzLmdldFNsaWRlRWxlbWVudHMoKTsKICAgICAgICBzbGlkZXMuZm9yRWFjaCgoc2xpZGUpID0+IHsKICAgICAgICAgIHNsaWRlLmNsYXNzTGlzdC5yZW1vdmUoCiAgICAgICAgICAgICJpcy1jdXJyZW50IiwKICAgICAgICAgICAgInJzLWFuaW0tYWN0aXZlIiwKICAgICAgICAgICAgInJzLWFuaW0tZmFsbGJhY2siCiAgICAgICAgICApOwogICAgICAgICAgc2xpZGUuc2V0QXR0cmlidXRlKCJhcmlhLWhpZGRlbiIsICJ0cnVlIik7CiAgICAgICAgfSk7CgogICAgICAgIHRoaXMuc3RvcENoYXJ0UGFuKCk7CiAgICAgICAgaWYgKHRoaXMuc3RhZ2VSZXNpemVPYnNlcnZlcikgewogICAgICAgICAgdGhpcy5zdGFnZVJlc2l6ZU9ic2VydmVyLmRpc2Nvbm5lY3QoKTsKICAgICAgICAgIHRoaXMuc3RhZ2VSZXNpemVPYnNlcnZlciA9IG51bGw7CiAgICAgICAgfQogICAgICAgIHRoaXMuY2xlYXJFeHBvcnROb3RpY2UoKTsKICAgICAgICB0aGlzLmRpc3Bvc2VBbGxDaGFydHMoKTsKICAgICAgICB0aGlzLmNoYXJ0RmFpbHVyZXMgPSB7fTsKICAgICAgICB0aGlzLmNoYXJ0Wm9vbSA9IHt9OwogICAgICAgIHRoaXMuY2hhcnRQYW4gPSB7fTsKICAgICAgICB0aGlzLmRpYWdyYW1SYXRpb3MgPSB7fTsKICAgICAgICB0aGlzLmN1cnJlbnRTbGlkZUluZGV4ID0gMDsKICAgICAgfSwKCiAgICAgIGhhbmRsZUNoYXJ0UmVzaXplKCkgewogICAgICAgIGlmICh0aGlzLnJlc2l6ZUZyYW1lKSBjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLnJlc2l6ZUZyYW1lKTsKICAgICAgICB0aGlzLnJlc2l6ZUZyYW1lID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHsKICAgICAgICAgIHRoaXMucmVzaXplRnJhbWUgPSBudWxsOwogICAgICAgICAgdGhpcy51cGRhdGVTdGFnZVNjYWxlKCk7CiAgICAgICAgICBPYmplY3Qua2V5cyh0aGlzLmNoYXJ0SW5zdGFuY2VzKS5mb3JFYWNoKChrZXkpID0+IHsKICAgICAgICAgICAgY29uc3QgY2hhcnQgPSB0aGlzLmNoYXJ0SW5zdGFuY2VzW2tleV07CiAgICAgICAgICAgIGlmIChjaGFydCAmJiB0eXBlb2YgY2hhcnQucmVzaXplID09PSAiZnVuY3Rpb24iKSB7CiAgICAgICAgICAgICAgY2hhcnQucmVzaXplKCk7CiAgICAgICAgICAgIH0KICAgICAgICAgIH0pOwogICAgICAgIH0pOwogICAgICB9LAoKICAgICAgaGFuZGxlS2V5RG93bihldmVudCkgewogICAgICAgIHRoaXMuc2NoZWR1bGVUb29sYmFySGlkZSgpOwogICAgICAgIGlmICghdGhpcy5pc1ByZXNlbnRhdGlvbikgcmV0dXJuOwoKICAgICAgICBjb25zdCBrZXkgPSBldmVudC5rZXk7CiAgICAgICAgaWYgKGtleSA9PT0gIkVzY2FwZSIpIHsKICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7CiAgICAgICAgICB0aGlzLmV4aXRQcmVzZW50YXRpb24oKTsKICAgICAgICAgIHJldHVybjsKICAgICAgICB9CiAgICAgICAgaWYgKAogICAgICAgICAga2V5ID09PSAiQXJyb3dSaWdodCIgfHwKICAgICAgICAgIGtleSA9PT0gIkFycm93RG93biIgfHwKICAgICAgICAgIGtleSA9PT0gIlBhZ2VEb3duIiB8fAogICAgICAgICAga2V5ID09PSAiICIgfHwKICAgICAgICAgIGtleSA9PT0gIlNwYWNlYmFyIgogICAgICAgICkgewogICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTsKICAgICAgICAgIHRoaXMubmV4dFNsaWRlKCk7CiAgICAgICAgICByZXR1cm47CiAgICAgICAgfQogICAgICAgIGlmICgKICAgICAgICAgIGtleSA9PT0gIkFycm93TGVmdCIgfHwKICAgICAgICAgIGtleSA9PT0gIkFycm93VXAiIHx8CiAgICAgICAgICBrZXkgPT09ICJQYWdlVXAiCiAgICAgICAgKSB7CiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpOwogICAgICAgICAgdGhpcy5wcmV2U2xpZGUoKTsKICAgICAgICAgIHJldHVybjsKICAgICAgICB9CiAgICAgICAgaWYgKGtleSA9PT0gIkhvbWUiKSB7CiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpOwogICAgICAgICAgdGhpcy5nb1RvU2xpZGUoMCk7CiAgICAgICAgICByZXR1cm47CiAgICAgICAgfQogICAgICAgIGlmIChrZXkgPT09ICJFbmQiKSB7CiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpOwogICAgICAgICAgdGhpcy5nb1RvU2xpZGUodGhpcy50b3RhbFNsaWRlcyAtIDEpOwogICAgICAgIH0KICAgICAgfSwKCiAgICAgIGhhbmRsZU1vdXNlTW92ZShldmVudCkgewogICAgICAgIGlmICghdGhpcy5pc1ByZXNlbnRhdGlvbikgcmV0dXJuOwoKICAgICAgICBjb25zdCB0YXJnZXQgPSBldmVudC50YXJnZXQ7CiAgICAgICAgY29uc3Qgb3ZlclRvb2xiYXIgPQogICAgICAgICAgdGFyZ2V0ICYmIHR5cGVvZiB0YXJnZXQuY2xvc2VzdCA9PT0gImZ1bmN0aW9uIgogICAgICAgICAgICA/IHRhcmdldC5jbG9zZXN0KCIucHYtdG9vbGJhciIpCiAgICAgICAgICAgIDogbnVsbDsKICAgICAgICBpZiAob3ZlclRvb2xiYXIpIHsKICAgICAgICAgIHRoaXMuc2hvd1Rvb2xiYXIoKTsKICAgICAgICAgIHJldHVybjsKICAgICAgICB9CgogICAgICAgIGNvbnN0IGN1cnJlbnRTbGlkZSA9IHRoaXMuZ2V0Q3VycmVudFNsaWRlRWxlbWVudCgpOwogICAgICAgIGlmICghY3VycmVudFNsaWRlKSB7CiAgICAgICAgICB0aGlzLmhpZGVUb29sYmFyKCk7CiAgICAgICAgICByZXR1cm47CiAgICAgICAgfQogICAgICAgIGNvbnN0IHJlY3QgPSBjdXJyZW50U2xpZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7CiAgICAgICAgY29uc3QgaW5zaWRlU2xpZGUgPQogICAgICAgICAgZXZlbnQuY2xpZW50WCA+PSByZWN0LmxlZnQgJiYKICAgICAgICAgIGV2ZW50LmNsaWVudFggPD0gcmVjdC5yaWdodCAmJgogICAgICAgICAgZXZlbnQuY2xpZW50WSA+PSByZWN0LnRvcCAmJgogICAgICAgICAgZXZlbnQuY2xpZW50WSA8PSByZWN0LmJvdHRvbTsKCiAgICAgICAgY29uc3QgdG9vbGJhciA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoIi5wdi10b29sYmFyIik7CiAgICAgICAgY29uc3QgdG9vbGJhclJlY3QgPSB0b29sYmFyID8gdG9vbGJhci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSA6IG51bGw7CiAgICAgICAgY29uc3QgdG9wWm9uZUJvdHRvbSA9IE1hdGgubWF4KAogICAgICAgICAgOTYsCiAgICAgICAgICB0b29sYmFyUmVjdCA/IHRvb2xiYXJSZWN0LmJvdHRvbSArIDE4IDogOTYKICAgICAgICApOwogICAgICAgIGNvbnN0IGluc2lkZVRvcFpvbmUgPQogICAgICAgICAgZXZlbnQuY2xpZW50WSA+PSAwICYmIGV2ZW50LmNsaWVudFkgPD0gdG9wWm9uZUJvdHRvbTsKCiAgICAgICAgaWYgKGluc2lkZVNsaWRlIHx8IGluc2lkZVRvcFpvbmUpIHsKICAgICAgICAgIHRoaXMuc2hvd1Rvb2xiYXIoKTsKICAgICAgICB9IGVsc2UgewogICAgICAgICAgdGhpcy5oaWRlVG9vbGJhcigpOwogICAgICAgIH0KICAgICAgfSwKCiAgICAgIGhhbmRsZVdpbmRvd01vdXNlT3V0KGV2ZW50KSB7CiAgICAgICAgaWYgKCFldmVudC5yZWxhdGVkVGFyZ2V0ICYmICFldmVudC50b0VsZW1lbnQpIHsKICAgICAgICAgIHRoaXMuaGlkZVRvb2xiYXIoKTsKICAgICAgICB9CiAgICAgIH0sCgogICAgICBoYW5kbGVUb3VjaFN0YXJ0KGV2ZW50KSB7CiAgICAgICAgdGhpcy5zY2hlZHVsZVRvb2xiYXJIaWRlKCk7CiAgICAgICAgaWYgKCF0aGlzLmlzUHJlc2VudGF0aW9uIHx8ICFldmVudC50b3VjaGVzIHx8ICFldmVudC50b3VjaGVzLmxlbmd0aCkgewogICAgICAgICAgcmV0dXJuOwogICAgICAgIH0KICAgICAgICBjb25zdCB0b3VjaCA9IGV2ZW50LnRvdWNoZXNbMF07CiAgICAgICAgdGhpcy50b3VjaFN0YXJ0WCA9IHRvdWNoLmNsaWVudFg7CiAgICAgICAgdGhpcy50b3VjaFN0YXJ0WSA9IHRvdWNoLmNsaWVudFk7CiAgICAgICAgdGhpcy50b3VjaFN0YXJ0VGltZSA9IERhdGUubm93KCk7CgogICAgICAgIHRoaXMudG91Y2hTdGFydEluWm9vbWVkQ2hhcnQgPSBmYWxzZTsKICAgICAgICBjb25zdCB0YXJnZXQgPSBldmVudC50YXJnZXQ7CiAgICAgICAgY29uc3Qgem9vbUVsZW1lbnQgPQogICAgICAgICAgdGFyZ2V0ICYmIHR5cGVvZiB0YXJnZXQuY2xvc2VzdCA9PT0gImZ1bmN0aW9uIgogICAgICAgICAgICA/IHRhcmdldC5jbG9zZXN0KCIucnMtY2hhcnQtem9vbSIpCiAgICAgICAgICAgIDogbnVsbDsKICAgICAgICBpZiAoem9vbUVsZW1lbnQgJiYgem9vbUVsZW1lbnQuZGF0YXNldC5jaGFydEtleSkgewogICAgICAgICAgdGhpcy50b3VjaFN0YXJ0SW5ab29tZWRDaGFydCA9CiAgICAgICAgICAgICh0aGlzLmNoYXJ0Wm9vbVt6b29tRWxlbWVudC5kYXRhc2V0LmNoYXJ0S2V5XSB8fCAxKSA+IDE7CiAgICAgICAgfQogICAgICB9LAoKICAgICAgaGFuZGxlVG91Y2hFbmQoZXZlbnQpIHsKICAgICAgICBpZiAoIXRoaXMuaXNQcmVzZW50YXRpb24pIHJldHVybjsKICAgICAgICBjb25zdCB3YXNQYW5uaW5nWm9vbWVkQ2hhcnQgPSB0aGlzLnRvdWNoU3RhcnRJblpvb21lZENoYXJ0OwogICAgICAgIHRoaXMudG91Y2hTdGFydEluWm9vbWVkQ2hhcnQgPSBmYWxzZTsKICAgICAgICBpZiAod2FzUGFubmluZ1pvb21lZENoYXJ0KSB7CiAgICAgICAgICB0aGlzLnNjaGVkdWxlVG9vbGJhckhpZGUoKTsKICAgICAgICAgIHJldHVybjsKICAgICAgICB9CiAgICAgICAgY29uc3QgdG91Y2ggPQogICAgICAgICAgZXZlbnQuY2hhbmdlZFRvdWNoZXMgJiYgZXZlbnQuY2hhbmdlZFRvdWNoZXMubGVuZ3RoCiAgICAgICAgICAgID8gZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0KICAgICAgICAgICAgOiBudWxsOwogICAgICAgIGlmICghdG91Y2gpIHJldHVybjsKCiAgICAgICAgY29uc3QgZGVsdGFYID0gdG91Y2guY2xpZW50WCAtIHRoaXMudG91Y2hTdGFydFg7CiAgICAgICAgY29uc3QgZGVsdGFZID0gdG91Y2guY2xpZW50WSAtIHRoaXMudG91Y2hTdGFydFk7CiAgICAgICAgY29uc3QgZWxhcHNlZCA9IERhdGUubm93KCkgLSB0aGlzLnRvdWNoU3RhcnRUaW1lOwogICAgICAgIGlmICgKICAgICAgICAgIGVsYXBzZWQgPCA5MDAgJiYKICAgICAgICAgIE1hdGguYWJzKGRlbHRhWCkgPiA0MiAmJgogICAgICAgICAgTWF0aC5hYnMoZGVsdGFYKSA+IE1hdGguYWJzKGRlbHRhWSkgKiAxLjIKICAgICAgICApIHsKICAgICAgICAgIGlmIChkZWx0YVggPCAwKSB0aGlzLm5leHRTbGlkZSgpOwogICAgICAgICAgZWxzZSB0aGlzLnByZXZTbGlkZSgpOwogICAgICAgIH0KICAgICAgICB0aGlzLnNjaGVkdWxlVG9vbGJhckhpZGUoKTsKICAgICAgfSwKCiAgICAgIHNob3dUb29sYmFyKCkgewogICAgICAgIGlmICh0aGlzLnRvb2xiYXJUaW1lcikgewogICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudG9vbGJhclRpbWVyKTsKICAgICAgICAgIHRoaXMudG9vbGJhclRpbWVyID0gbnVsbDsKICAgICAgICB9CiAgICAgICAgdGhpcy50b29sYmFySWRsZSA9IGZhbHNlOwogICAgICB9LAoKICAgICAgaGlkZVRvb2xiYXIoKSB7CiAgICAgICAgaWYgKHRoaXMudG9vbGJhclRpbWVyKSB7CiAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50b29sYmFyVGltZXIpOwogICAgICAgICAgdGhpcy50b29sYmFyVGltZXIgPSBudWxsOwogICAgICAgIH0KICAgICAgICB0aGlzLnRvb2xiYXJJZGxlID0gdHJ1ZTsKICAgICAgfSwKCiAgICAgIHNjaGVkdWxlVG9vbGJhckhpZGUoKSB7CiAgICAgICAgdGhpcy5zaG93VG9vbGJhcigpOwogICAgICAgIHRoaXMudG9vbGJhclRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7CiAgICAgICAgICB0aGlzLnRvb2xiYXJJZGxlID0gdHJ1ZTsKICAgICAgICAgIHRoaXMudG9vbGJhclRpbWVyID0gbnVsbDsKICAgICAgICB9LCAyNjAwKTsKICAgICAgfSwKCiAgICAgIHByZXZTbGlkZSgpIHsKICAgICAgICB0aGlzLnNob3dUb29sYmFyKCk7CiAgICAgICAgdGhpcy5nb1RvU2xpZGUodGhpcy5jdXJyZW50U2xpZGVJbmRleCAtIDEpOwogICAgICB9LAoKICAgICAgbmV4dFNsaWRlKCkgewogICAgICAgIHRoaXMuc2hvd1Rvb2xiYXIoKTsKICAgICAgICB0aGlzLmdvVG9TbGlkZSh0aGlzLmN1cnJlbnRTbGlkZUluZGV4ICsgMSk7CiAgICAgIH0sCgogICAgICBjcmVhdGVFeHBvcnRTbGlkZShzbGlkZSkgewogICAgICAgIGNvbnN0IGNsb25lID0gc2xpZGUuY2xvbmVOb2RlKHRydWUpOwogICAgICAgIGNsb25lLmNsYXNzTGlzdC5yZW1vdmUoCiAgICAgICAgICAiaXMtY3VycmVudCIsCiAgICAgICAgICAicnMtYW5pbS1hY3RpdmUiLAogICAgICAgICAgInJzLWFuaW0tZmFsbGJhY2siCiAgICAgICAgKTsKICAgICAgICBjbG9uZS5yZW1vdmVBdHRyaWJ1dGUoImFyaWEtaGlkZGVuIik7CiAgICAgICAgY2xvbmUucmVtb3ZlQXR0cmlidXRlKCJpZCIpOwoKICAgICAgICBjbG9uZS5zdHlsZS53aWR0aCA9ICIxOTIwcHgiOwogICAgICAgIGNsb25lLnN0eWxlLmhlaWdodCA9ICIxMDgwcHgiOwogICAgICAgIGNsb25lLnN0eWxlLnBvc2l0aW9uID0gInJlbGF0aXZlIjsKICAgICAgICBjbG9uZS5zdHlsZS50cmFuc2Zvcm0gPSAibm9uZSI7CiAgICAgICAgY2xvbmUuc3R5bGUubWFyZ2luID0gIjAiOwogICAgICAgIGNsb25lLnN0eWxlLmJvcmRlciA9ICIwIjsKICAgICAgICBjbG9uZS5zdHlsZS5ib3JkZXJSYWRpdXMgPSAiMCI7CiAgICAgICAgY2xvbmUuc3R5bGUub3BhY2l0eSA9ICIxIjsKICAgICAgICBjbG9uZS5zdHlsZS52aXNpYmlsaXR5ID0gInZpc2libGUiOwoKICAgICAgICBjbG9uZS5xdWVyeVNlbGVjdG9yQWxsKCIucnMtY2hhcnQtem9vbS10b29scyIpLmZvckVhY2goKG5vZGUpID0+IHsKICAgICAgICAgIG5vZGUucmVtb3ZlKCk7CiAgICAgICAgfSk7CiAgICAgICAgY2xvbmUucXVlcnlTZWxlY3RvckFsbCgiLnJzLWNoYXJ0LXpvb20iKS5mb3JFYWNoKChub2RlKSA9PiB7CiAgICAgICAgICBub2RlLmNsYXNzTGlzdC5yZW1vdmUoImlzLXBhbm5pbmciKTsKICAgICAgICAgIG5vZGUuc3R5bGUudHJhbnNmb3JtID0gIm5vbmUiOwogICAgICAgICAgbm9kZS5zdHlsZS5jdXJzb3IgPSAiZGVmYXVsdCI7CiAgICAgICAgICBub2RlLnN0eWxlLnRvdWNoQWN0aW9uID0gImF1dG8iOwogICAgICAgIH0pOwogICAgICAgIGNsb25lLnF1ZXJ5U2VsZWN0b3JBbGwoIi5ycy1hbmltLXRhcmdldCIpLmZvckVhY2goKG5vZGUpID0+IHsKICAgICAgICAgIG5vZGUuc3R5bGUuYW5pbWF0aW9uID0gIm5vbmUiOwogICAgICAgICAgbm9kZS5zdHlsZS5vcGFjaXR5ID0gIjEiOwogICAgICAgICAgbm9kZS5zdHlsZS50cmFuc2Zvcm0gPSAibm9uZSI7CiAgICAgICAgfSk7CgogICAgICAgIC8vIGNhbnZhcyDkuI3kvJrpmo8gY2xvbmVOb2RlIOWkjeWItuWDj+e0oO+8jOi9rOaNouS4uuWbvueJh+WQjuWGjeS6pOe7mSBXZWJUb29sLnRyYW5zZm9ybUltYWdl44CCCiAgICAgICAgY29uc3Qgc291cmNlQ2FudmFzZXMgPSBzbGlkZS5xdWVyeVNlbGVjdG9yQWxsKCJjYW52YXMiKTsKICAgICAgICBjb25zdCB0YXJnZXRDYW52YXNlcyA9IGNsb25lLnF1ZXJ5U2VsZWN0b3JBbGwoImNhbnZhcyIpOwogICAgICAgIHNvdXJjZUNhbnZhc2VzLmZvckVhY2goKHNvdXJjZUNhbnZhcywgaW5kZXgpID0+IHsKICAgICAgICAgIGNvbnN0IHRhcmdldENhbnZhcyA9IHRhcmdldENhbnZhc2VzW2luZGV4XTsKICAgICAgICAgIGlmICghdGFyZ2V0Q2FudmFzKSByZXR1cm47CiAgICAgICAgICB0cnkgewogICAgICAgICAgICBjb25zdCBkYXRhVXJsID0gc291cmNlQ2FudmFzLnRvRGF0YVVSTCgiaW1hZ2UvcG5nIik7CiAgICAgICAgICAgIGlmICghZGF0YVVybCB8fCBkYXRhVXJsID09PSAiZGF0YTosIikgcmV0dXJuOwogICAgICAgICAgICBjb25zdCBpbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoImltZyIpOwogICAgICAgICAgICBpbWFnZS5zcmMgPSBkYXRhVXJsOwogICAgICAgICAgICBpbWFnZS5hbHQgPSAiIjsKICAgICAgICAgICAgaW1hZ2UuY2xhc3NOYW1lID0gInJzLWNoYXJ0LWNhbnZhcyI7CiAgICAgICAgICAgIGltYWdlLnN0eWxlLmNzc1RleHQgPQogICAgICAgICAgICAgICJkaXNwbGF5OmJsb2NrO3dpZHRoOjEwMCU7aGVpZ2h0OjEwMCU7b2JqZWN0LWZpdDpjb250YWluOyI7CiAgICAgICAgICAgIHRhcmdldENhbnZhcy5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChpbWFnZSwgdGFyZ2V0Q2FudmFzKTsKICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7CiAgICAgICAgICAgIGNvbnNvbGUud2FybigiW215UFBUXSDlm77ooaggY2FudmFzIOWvvOWHuuWksei0pSIsIGVycm9yKTsKICAgICAgICAgIH0KICAgICAgICB9KTsKCiAgICAgICAgcmV0dXJuIGNsb25lOwogICAgICB9LAoKICAgICAgZ2V0RXhwb3J0RmlsZU5hbWUoc2xpZGVJbmRleCkgewogICAgICAgIGNvbnN0IGluZGV4ID0KICAgICAgICAgIHR5cGVvZiBzbGlkZUluZGV4ID09PSAibnVtYmVyIgogICAgICAgICAgICA/IHNsaWRlSW5kZXgKICAgICAgICAgICAgOiB0aGlzLmN1cnJlbnRTbGlkZUluZGV4OwogICAgICAgIGNvbnN0IHNsaWRlID0gKHRoaXMuYWNjb3VudERhdGEuc2xpZGVzIHx8IFtdKVtpbmRleF0gfHwge307CiAgICAgICAgY29uc3QgdGl0bGUgPSBTdHJpbmcoc2xpZGUudGl0bGUgfHwgInNsaWRlIikKICAgICAgICAgIC5yZXBsYWNlKC9bXFwvOio/Ijw+fFxyXG5dKy9nLCAiLSIpCiAgICAgICAgICAucmVwbGFjZSgvXHMrL2csICIgIikKICAgICAgICAgIC50cmltKCkKICAgICAgICAgIC5zbGljZSgwLCA1Nik7CiAgICAgICAgcmV0dXJuICgKICAgICAgICAgICJzbGlkZS0iICsKICAgICAgICAgIHRoaXMucGFkKGluZGV4ICsgMSkgKwogICAgICAgICAgIi0iICsKICAgICAgICAgICh0aXRsZSB8fCAidW50aXRsZWQiKSArCiAgICAgICAgICAiLnBuZyIKICAgICAgICApOwogICAgICB9LAoKICAgICAgc2hvd0V4cG9ydE5vdGljZShtZXNzYWdlLCB0eXBlKSB7CiAgICAgICAgaWYgKHRoaXMuZXhwb3J0Tm90aWNlVGltZXIpIHsKICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmV4cG9ydE5vdGljZVRpbWVyKTsKICAgICAgICAgIHRoaXMuZXhwb3J0Tm90aWNlVGltZXIgPSBudWxsOwogICAgICAgIH0KICAgICAgICB0aGlzLmV4cG9ydE5vdGljZSA9IG1lc3NhZ2U7CiAgICAgICAgdGhpcy5leHBvcnROb3RpY2VUeXBlID0gdHlwZSB8fCAic3VjY2VzcyI7CiAgICAgICAgdGhpcy5leHBvcnROb3RpY2VUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4gewogICAgICAgICAgdGhpcy5leHBvcnROb3RpY2UgPSAiIjsKICAgICAgICAgIHRoaXMuZXhwb3J0Tm90aWNlVGltZXIgPSBudWxsOwogICAgICAgIH0sIDI4MDApOwogICAgICB9LAoKICAgICAgY2xlYXJFeHBvcnROb3RpY2UoKSB7CiAgICAgICAgaWYgKHRoaXMuZXhwb3J0Tm90aWNlVGltZXIpIHsKICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmV4cG9ydE5vdGljZVRpbWVyKTsKICAgICAgICAgIHRoaXMuZXhwb3J0Tm90aWNlVGltZXIgPSBudWxsOwogICAgICAgIH0KICAgICAgICB0aGlzLmV4cG9ydE5vdGljZSA9ICIiOwogICAgICB9LAoKICAgICAgYXN5bmMgZXhwb3J0Q3VycmVudFNsaWRlKCkgewogICAgICAgIGlmICh0aGlzLmlzRXhwb3J0aW5nKSByZXR1cm47CiAgICAgICAgdGhpcy5zaG93VG9vbGJhcigpOwogICAgICAgIHRoaXMuaXNFeHBvcnRpbmcgPSB0cnVlOwogICAgICAgIHRoaXMuY2xlYXJFeHBvcnROb3RpY2UoKTsKCiAgICAgICAgbGV0IGV4cG9ydEhvbGRlciA9IG51bGw7CiAgICAgICAgY29uc3QgZXhwb3J0U2xpZGVJbmRleCA9IHRoaXMuY3VycmVudFNsaWRlSW5kZXg7CiAgICAgICAgdHJ5IHsKICAgICAgICAgIGNvbnN0IHNsaWRlID0gdGhpcy5nZXRDdXJyZW50U2xpZGVFbGVtZW50KCk7CiAgICAgICAgICBpZiAoIXNsaWRlKSB0aHJvdyBuZXcgRXJyb3IoIuW9k+WJjeW5u+eBr+eJh+S4jeWtmOWcqCIpOwoKICAgICAgICAgIGlmICgKICAgICAgICAgICAgIXdpbmRvdy5XZWJUb29sIHx8CiAgICAgICAgICAgIHR5cGVvZiB3aW5kb3cuV2ViVG9vbC50cmFuc2Zvcm1JbWFnZSAhPT0gImZ1bmN0aW9uIgogICAgICAgICAgKSB7CiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigiV2ViVG9vbC50cmFuc2Zvcm1JbWFnZSDkuI3lj6/nlKgiKTsKICAgICAgICAgIH0KICAgICAgICAgIGlmIChkb2N1bWVudC5mb250cyAmJiBkb2N1bWVudC5mb250cy5yZWFkeSkgewogICAgICAgICAgICBhd2FpdCBkb2N1bWVudC5mb250cy5yZWFkeTsKICAgICAgICAgIH0KCiAgICAgICAgICAvLyDkvb/nlKjlvZPliY3lt7Lnu4/nu5jliLblrozmiJDnmoTlm77ooajkvY3lm77vvIzpgb/lhY3ph43lu7ogQ2hhcnQuanMg5a6e5L6L5a+86Ie0CiAgICAgICAgICAvLyBjYW52YXMg5LiK5LiL5paH5bCa5pyq5bCx57uq5pe26KKr5oiq5oiQ56m655m944CCCiAgICAgICAgICBjb25zdCBoYXNDaGFydHMgPSBCb29sZWFuKHNsaWRlLnF1ZXJ5U2VsZWN0b3IoImNhbnZhcyIpKTsKICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PgogICAgICAgICAgICBzZXRUaW1lb3V0KHJlc29sdmUsIGhhc0NoYXJ0cyA/IDkwMCA6IDEyMCkKICAgICAgICAgICk7CgogICAgICAgICAgY29uc3QgY2xvbmUgPSB0aGlzLmNyZWF0ZUV4cG9ydFNsaWRlKHNsaWRlKTsKICAgICAgICAgIGV4cG9ydEhvbGRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoImRpdiIpOwogICAgICAgICAgZXhwb3J0SG9sZGVyLmNsYXNzTmFtZSA9ICJwdi1leHBvcnQtaG9sZGVyIjsKICAgICAgICAgIGV4cG9ydEhvbGRlci5zdHlsZS5jc3NUZXh0ID0KICAgICAgICAgICAgInBvc2l0aW9uOmZpeGVkO3RvcDowO2xlZnQ6MDt3aWR0aDoxOTIwcHg7aGVpZ2h0OjEwODBweDsiICsKICAgICAgICAgICAgIm92ZXJmbG93OmhpZGRlbjtiYWNrZ3JvdW5kOiNmZmZmZmY7ei1pbmRleDoxO3BvaW50ZXItZXZlbnRzOm5vbmU7IjsKICAgICAgICAgIGV4cG9ydEhvbGRlci5hcHBlbmRDaGlsZChjbG9uZSk7CiAgICAgICAgICB0aGlzLiRlbC5hcHBlbmRDaGlsZChleHBvcnRIb2xkZXIpOwoKICAgICAgICAgIGF3YWl0IHdpbmRvdy5XZWJUb29sLnRyYW5zZm9ybUltYWdlKAogICAgICAgICAgICBjbG9uZSwKICAgICAgICAgICAgdGhpcy5nZXRFeHBvcnRGaWxlTmFtZShleHBvcnRTbGlkZUluZGV4KSwKICAgICAgICAgICAgInBuZyIsCiAgICAgICAgICAgIHsgZG93bmxvYWQ6IHRydWUgfQogICAgICAgICAgKTsKICAgICAgICAgIHRoaXMuc2hvd0V4cG9ydE5vdGljZSgi5b2T5YmN6aG15bey5a+85Ye65Li6IFBORyDlm77niYciLCAic3VjY2VzcyIpOwogICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7CiAgICAgICAgICBjb25zb2xlLmVycm9yKCJbbXlQUFRdIOWvvOWHuuW9k+WJjeW5u+eBr+eJh+Wksei0pSIsIGVycm9yKTsKICAgICAgICAgIHRoaXMuc2hvd0V4cG9ydE5vdGljZSgi5a+85Ye65aSx6LSl77yM6K+36YeN6K+VIiwgImVycm9yIik7CiAgICAgICAgfSBmaW5hbGx5IHsKICAgICAgICAgIGlmIChleHBvcnRIb2xkZXIgJiYgZXhwb3J0SG9sZGVyLnBhcmVudE5vZGUpIHsKICAgICAgICAgICAgZXhwb3J0SG9sZGVyLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZXhwb3J0SG9sZGVyKTsKICAgICAgICAgIH0KICAgICAgICAgIHRoaXMuaXNFeHBvcnRpbmcgPSBmYWxzZTsKICAgICAgICB9CiAgICAgIH0sCgogICAgICBkaXNwb3NlQWxsQ2hhcnRzKCkgewogICAgICAgIE9iamVjdC5rZXlzKHRoaXMuY2hhcnRJbnN0YW5jZXMpLmZvckVhY2goKGtleSkgPT4gewogICAgICAgICAgdHJ5IHsKICAgICAgICAgICAgdGhpcy5jaGFydEluc3RhbmNlc1trZXldLmRlc3Ryb3koKTsKICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7CiAgICAgICAgICAgIC8qIG5vb3AgKi8KICAgICAgICAgIH0KICAgICAgICAgIGRlbGV0ZSB0aGlzLmNoYXJ0SW5zdGFuY2VzW2tleV07CiAgICAgICAgfSk7CiAgICAgICAgdGhpcy5jaGFydEluc3RhbmNlcyA9IHt9OwogICAgICB9LAoKICAgICAgY2xlYW51cFZpZXdlcigpIHsKICAgICAgICB0aGlzLnVuYmluZEV2ZW50cygpOwogICAgICAgIHRoaXMudW5sb2NrQm9keVNjcm9sbCgpOwoKICAgICAgICBpZiAodGhpcy50b29sYmFyVGltZXIpIHsKICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRvb2xiYXJUaW1lcik7CiAgICAgICAgICB0aGlzLnRvb2xiYXJUaW1lciA9IG51bGw7CiAgICAgICAgfQogICAgICAgIGlmICh0aGlzLmFuaW1hdGlvblRpbWVyKSB7CiAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5hbmltYXRpb25UaW1lcik7CiAgICAgICAgICB0aGlzLmFuaW1hdGlvblRpbWVyID0gbnVsbDsKICAgICAgICB9CiAgICAgICAgaWYgKHRoaXMudmlzaWJpbGl0eVRpbWVyKSB7CiAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy52aXNpYmlsaXR5VGltZXIpOwogICAgICAgICAgdGhpcy52aXNpYmlsaXR5VGltZXIgPSBudWxsOwogICAgICAgIH0KICAgICAgICBpZiAodGhpcy5yZXNpemVGcmFtZSkgewogICAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5yZXNpemVGcmFtZSk7CiAgICAgICAgICB0aGlzLnJlc2l6ZUZyYW1lID0gbnVsbDsKICAgICAgICB9CgogICAgICAgIHRoaXMuc3RvcENoYXJ0UGFuKCk7CiAgICAgICAgaWYgKHRoaXMuc3RhZ2VSZXNpemVPYnNlcnZlcikgewogICAgICAgICAgdGhpcy5zdGFnZVJlc2l6ZU9ic2VydmVyLmRpc2Nvbm5lY3QoKTsKICAgICAgICAgIHRoaXMuc3RhZ2VSZXNpemVPYnNlcnZlciA9IG51bGw7CiAgICAgICAgfQogICAgICAgIHRoaXMuY2xlYXJFeHBvcnROb3RpY2UoKTsKICAgICAgICB0aGlzLmRpc3Bvc2VBbGxDaGFydHMoKTsKICAgICAgICB0aGlzLmNoYXJ0Wm9vbSA9IHt9OwogICAgICAgIHRoaXMuY2hhcnRQYW4gPSB7fTsKICAgICAgICB0aGlzLmRpYWdyYW1SYXRpb3MgPSB7fTsKICAgICAgICB0aGlzLmlzUHJlc2VudGF0aW9uID0gZmFsc2U7CiAgICAgIH0sCiAgICB9LAoKICAgIGJlZm9yZVVubW91bnQoKSB7CiAgICAgIHRoaXMuY2xlYW51cFZpZXdlcigpOwogICAgfSwKCiAgICBiZWZvcmVEZXN0cm95KCkgewogICAgICB0aGlzLmNsZWFudXBWaWV3ZXIoKTsKICAgIH0sCiAgfTsKPC9zY3JpcHQ+Cgo8c3R5bGUgc2NvcGVkPgogIC8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogICAgIOiuvuiuoeS7pOeJjAogICAgIOS4gOWll+WFi+WItueahOKAnOe8lui+kemDqOenkeaKgOKAneinhuinie+8mue6uOaEn+W6leiJsuOAgeWiqOiJsuaWh+Wtl+OAgQogICAgIOeUteWFieiTneW8uuiwg+OAgee7hue6v+WIhumalOOAgeWFhei2s+eVmeeZveOAggogICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqLwogIC5wdi1yb290IHsKICAgIC0tcHYtZm9udC1zYW5zOiAiU0YgUHJvIERpc3BsYXkiLCAiU0YgUHJvIFRleHQiLCAtYXBwbGUtc3lzdGVtLAogICAgICBCbGlua01hY1N5c3RlbUZvbnQsICJQaW5nRmFuZyBTQyIsICJIaXJhZ2lubyBTYW5zIEdCIiwgIk5vdG8gU2FucyBTQyIsCiAgICAgICJNaWNyb3NvZnQgWWFIZWkiLCBzYW5zLXNlcmlmOwogICAgLS1wdi1mb250LW1vbm86ICJTRiBNb25vIiwgIkpldEJyYWlucyBNb25vIiwgIlJvYm90byBNb25vIiwgdWktbW9ub3NwYWNlLAogICAgICBTRk1vbm8tUmVndWxhciwgTWVubG8sIENvbnNvbGFzLCBtb25vc3BhY2U7CgogICAgLS1wdi1icmFuZDogIzBiNWNmZjsKICAgIC0tcHYtYnJhbmQtZGVlcDogIzA2NDdjOTsKICAgIC0tcHYtYnJhbmQtc29mdDogI2VkZjRmZjsKICAgIC0tcHYtaW5rOiAjMGMxMTFhOwogICAgLS1wdi10ZXh0LTE6ICMxNzFkMjc7CiAgICAtLXB2LXRleHQtMjogIzViNjQ3MjsKICAgIC0tcHYtdGV4dC0zOiAjOGI5NGEzOwogICAgLS1wdi1wYWdlOiAjZWVmMWY1OwogICAgLS1wdi1wYXBlcjogI2Y3ZjhmYTsKICAgIC0tcHYtc3VyZmFjZTogI2ZmZmZmZjsKICAgIC0tcHYtbGluZTogI2UyZTZlYzsKICAgIC0tcHYtbGluZS1zdHJvbmc6ICNjZmQ2ZTA7CiAgICAtLXB2LWRhcms6ICMwYTBkMTM7CgogICAgLS1wdi1yYWRpdXMtc206IDhweDsKICAgIC0tcHYtcmFkaXVzLW1kOiAxNHB4OwogICAgLS1wdi1yYWRpdXMtbGc6IDIwcHg7CiAgICAtLXB2LXJhZGl1cy14bDogMjZweDsKICAgIC0tcHYtZWFzZTogY3ViaWMtYmV6aWVyKDAuMjIsIDAuNjEsIDAuMzYsIDEpOwoKICAgIG1pbi1oZWlnaHQ6IDEwMHZoOwogICAgbWluLWhlaWdodDogMTAwZHZoOwogICAgcGFkZGluZzogY2xhbXAoMjBweCwgMy40dncsIDQ0cHgpIGNsYW1wKDE4cHgsIDR2dywgNTZweCkgMTZweDsKICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7CiAgICBvdmVyZmxvdy14OiBoaWRkZW47CiAgICBjb2xvcjogdmFyKC0tcHYtdGV4dC0xKTsKICAgIGZvbnQtZmFtaWx5OiB2YXIoLS1wdi1mb250LXNhbnMpOwogICAgLXdlYmtpdC1mb250LXNtb290aGluZzogYW50aWFsaWFzZWQ7CiAgICAtbW96LW9zeC1mb250LXNtb290aGluZzogZ3JheXNjYWxlOwogICAgdGV4dC1yZW5kZXJpbmc6IG9wdGltaXplTGVnaWJpbGl0eTsKICAgIGJhY2tncm91bmQ6CiAgICAgIHJhZGlhbC1ncmFkaWVudCgKICAgICAgICAxMjAwcHggNjIwcHggYXQgOTIlIC0xMiUsCiAgICAgICAgcmdiYSgxMSwgOTIsIDI1NSwgMC4wOCksCiAgICAgICAgdHJhbnNwYXJlbnQgNTglCiAgICAgICksCiAgICAgIGxpbmVhci1ncmFkaWVudCgxODBkZWcsICNmM2Y1ZjkgMCUsIHZhcigtLXB2LXBhZ2UpIDEwMCUpOwogIH0KCiAgLnB2LXJvb3QgKiwKICAucHYtcm9vdCAqOjpiZWZvcmUsCiAgLnB2LXJvb3QgKjo6YWZ0ZXIgewogICAgYm94LXNpemluZzogYm9yZGVyLWJveDsKICB9CgogIC5wdi1yb290IGJ1dHRvbiB7CiAgICBmb250OiBpbmhlcml0OwogIH0KCiAgLnB2LWNvbnRhaW5lciB7CiAgICB3aWR0aDogMTAwJTsKICAgIG1heC13aWR0aDogMTI0MHB4OwogICAgbWFyZ2luOiAwIGF1dG87CiAgfQoKICAvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KICAgICDmvJTnpLrmlofnqL/lpLTpg6gKICAgICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi8KICAucHYtaGVhZGVyIHsKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBhbGlnbi1pdGVtczogZmxleC1lbmQ7CiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47CiAgICBnYXA6IDMycHg7CiAgICBwYWRkaW5nOiA4cHggMCAzMHB4OwogIH0KCiAgLnB2LWhlYWRlci1jb3B5IHsKICAgIG1pbi13aWR0aDogMDsKICB9CgogIC5wdi1raWNrZXIgewogICAgZGlzcGxheTogZmxleDsKICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICBnYXA6IDEycHg7CiAgICBtYXJnaW4tYm90dG9tOiAyMHB4OwogICAgY29sb3I6IHZhcigtLXB2LXRleHQtMyk7CiAgICBmb250LWZhbWlseTogdmFyKC0tcHYtZm9udC1tb25vKTsKICAgIGZvbnQtc2l6ZTogMTBweDsKICAgIGZvbnQtd2VpZ2h0OiA1MDA7CiAgICBsZXR0ZXItc3BhY2luZzogMC4xNmVtOwogICAgbGluZS1oZWlnaHQ6IDE7CiAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOwogIH0KCiAgLnB2LWtpY2tlci1saW5lIHsKICAgIHdpZHRoOiAzMHB4OwogICAgaGVpZ2h0OiAxcHg7CiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1wdi1icmFuZCk7CiAgfQoKICAucHYta2lja2VyLWNvdW50IHsKICAgIHBhZGRpbmctbGVmdDogMTJweDsKICAgIGJvcmRlci1sZWZ0OiAxcHggc29saWQgdmFyKC0tcHYtbGluZS1zdHJvbmcpOwogICAgY29sb3I6IHZhcigtLXB2LXRleHQtMik7CiAgICBsZXR0ZXItc3BhY2luZzogMC4xZW07CiAgfQoKICAucHYtdGl0bGUgewogICAgbWF4LXdpZHRoOiA5MDBweDsKICAgIG1hcmdpbjogMDsKICAgIGNvbG9yOiB2YXIoLS1wdi1pbmspOwogICAgZm9udC1zaXplOiBjbGFtcCgzNHB4LCA0LjR2dywgNTZweCk7CiAgICBmb250LXdlaWdodDogNjUwOwogICAgbGV0dGVyLXNwYWNpbmc6IC0wLjA0ZW07CiAgICBsaW5lLWhlaWdodDogMS4wODsKICAgIHRleHQtd3JhcDogYmFsYW5jZTsKICAgIG92ZXJmbG93LXdyYXA6IGJyZWFrLXdvcmQ7CiAgfQoKICAucHYtc3VidGl0bGUgewogICAgZGlzcGxheTogZmxleDsKICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICBnYXA6IDEycHg7CiAgICBtYXJnaW46IDE4cHggMCAwOwogICAgY29sb3I6IHZhcigtLXB2LXRleHQtMik7CiAgICBmb250LXNpemU6IDEzcHg7CiAgICBmb250LXdlaWdodDogNDUwOwogICAgbGV0dGVyLXNwYWNpbmc6IDAuMDFlbTsKICB9CgogIC5wdi1tZXRhLWRvdCB7CiAgICB3aWR0aDogM3B4OwogICAgaGVpZ2h0OiAzcHg7CiAgICBib3JkZXItcmFkaXVzOiA1MCU7CiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1wdi10ZXh0LTMpOwogIH0KCiAgLnB2LXBsYXktYnRuIHsKICAgIGRpc3BsYXk6IGlubGluZS1mbGV4OwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOwogICAgZ2FwOiAxMHB4OwogICAgZmxleC1zaHJpbms6IDA7CiAgICBtaW4taGVpZ2h0OiA1MHB4OwogICAgcGFkZGluZzogMCAyMnB4OwogICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tcHYtaW5rKTsKICAgIGJvcmRlci1yYWRpdXM6IDk5OXB4OwogICAgYmFja2dyb3VuZDogdmFyKC0tcHYtaW5rKTsKICAgIGNvbG9yOiAjZmZmZmZmOwogICAgZm9udC1zaXplOiAxM3B4OwogICAgZm9udC13ZWlnaHQ6IDU1MDsKICAgIGxldHRlci1zcGFjaW5nOiAwLjAxZW07CiAgICBjdXJzb3I6IHBvaW50ZXI7CiAgICBib3gtc2hhZG93OiAwIDEycHggMzBweCAtMThweCByZ2JhKDEyLCAxNywgMjYsIDAuNjUpOwogICAgdHJhbnNpdGlvbjoKICAgICAgYmFja2dyb3VuZC1jb2xvciAwLjI1cyB2YXIoLS1wdi1lYXNlKSwKICAgICAgYm9yZGVyLWNvbG9yIDAuMjVzIHZhcigtLXB2LWVhc2UpLAogICAgICB0cmFuc2Zvcm0gMC4yNXMgdmFyKC0tcHYtZWFzZSksCiAgICAgIGJveC1zaGFkb3cgMC4yNXMgdmFyKC0tcHYtZWFzZSk7CiAgfQoKICAucHYtcGxheS1idG46aG92ZXIgewogICAgYm9yZGVyLWNvbG9yOiB2YXIoLS1wdi1icmFuZCk7CiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1wdi1icmFuZCk7CiAgICBib3gtc2hhZG93OiAwIDE0cHggMzRweCAtMTZweCByZ2JhKDExLCA5MiwgMjU1LCAwLjU1KTsKICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMXB4KTsKICB9CgogIC5wdi1wbGF5LWJ0bjpmb2N1cy12aXNpYmxlIHsKICAgIG91dGxpbmU6IDJweCBzb2xpZCB2YXIoLS1wdi1icmFuZCk7CiAgICBvdXRsaW5lLW9mZnNldDogM3B4OwogIH0KCiAgLnB2LXBsYXktaWNvbiB7CiAgICB3aWR0aDogMTdweDsKICAgIGhlaWdodDogMTdweDsKICB9CgogIC8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogICAgIOW5u+eBr+eJh+e8qeeVpeWbvue9keagvAogICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqLwogIC5wdi1ncmlkIHsKICAgIGRpc3BsYXk6IGdyaWQ7CiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgzLCBtaW5tYXgoMCwgMWZyKSk7CiAgICBnYXA6IDI2cHggMjRweDsKICB9CgogIC5wdi1jb250YWluZXItLWZvdXIgewogICAgbWF4LXdpZHRoOiAxMDAwcHg7CiAgfQoKICBAbWVkaWEgKG1pbi13aWR0aDogMTA4MXB4KSB7CiAgICAucHYtZ3JpZC0tZm91ciB7CiAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDIsIG1pbm1heCgwLCAxZnIpKTsKICAgIH0KICB9CgogIC5wdi1jYXJkIHsKICAgIG1pbi13aWR0aDogMDsKICAgIGN1cnNvcjogcG9pbnRlcjsKICAgIG91dGxpbmU6IG5vbmU7CiAgfQoKICAucHYtdGh1bWIgewogICAgcG9zaXRpb246IHJlbGF0aXZlOwogICAgZGlzcGxheTogZmxleDsKICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47CiAgICB3aWR0aDogMTAwJTsKICAgIGFzcGVjdC1yYXRpbzogMTYgLyA5OwogICAgcGFkZGluZzogMTdweCAxOXB4IDE0cHg7CiAgICBvdmVyZmxvdzogaGlkZGVuOwogICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tcHYtbGluZSk7CiAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1wdi1yYWRpdXMtbWQpOwogICAgYmFja2dyb3VuZDogdmFyKC0tcHYtc3VyZmFjZSk7CiAgICBib3gtc2hhZG93OgogICAgICAwIDFweCAycHggcmdiYSgxMiwgMTcsIDI2LCAwLjAzKSwKICAgICAgMCAxOHB4IDQwcHggLTMycHggcmdiYSgxMiwgMTcsIDI2LCAwLjI4KTsKICAgIHRyYW5zaXRpb246CiAgICAgIHRyYW5zZm9ybSAwLjM1cyB2YXIoLS1wdi1lYXNlKSwKICAgICAgYm94LXNoYWRvdyAwLjM1cyB2YXIoLS1wdi1lYXNlKSwKICAgICAgYm9yZGVyLWNvbG9yIDAuMzVzIHZhcigtLXB2LWVhc2UpOwogIH0KCiAgLnB2LWNhcmQ6aG92ZXIgLnB2LXRodW1iIHsKICAgIGJvcmRlci1jb2xvcjogdmFyKC0tcHYtbGluZS1zdHJvbmcpOwogICAgYm94LXNoYWRvdzoKICAgICAgMCAycHggNHB4IHJnYmEoMTIsIDE3LCAyNiwgMC4wNCksCiAgICAgIDAgMjZweCA1NHB4IC0zMHB4IHJnYmEoMTIsIDE3LCAyNiwgMC4zNik7CiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTRweCk7CiAgfQoKICAucHYtY2FyZDpmb2N1cy12aXNpYmxlIC5wdi10aHVtYiB7CiAgICBvdXRsaW5lOiAycHggc29saWQgdmFyKC0tcHYtYnJhbmQpOwogICAgb3V0bGluZS1vZmZzZXQ6IDNweDsKICB9CgogIC5wdi10aHVtYi0tY29udGVudCB7CiAgICBiYWNrZ3JvdW5kOgogICAgICBsaW5lYXItZ3JhZGllbnQoMTgwZGVnLCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuOTIpLCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuOTgpKSwKICAgICAgdmFyKC0tcHYtc3VyZmFjZSk7CiAgfQoKICAucHYtdGh1bWItaGVhZCB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsKICAgIGdhcDogMTJweDsKICAgIGZsZXgtc2hyaW5rOiAwOwogICAgY29sb3I6IHZhcigtLXB2LXRleHQtMyk7CiAgICBmb250LWZhbWlseTogdmFyKC0tcHYtZm9udC1tb25vKTsKICAgIGZvbnQtc2l6ZTogNy41cHg7CiAgICBmb250LXdlaWdodDogNTAwOwogICAgbGV0dGVyLXNwYWNpbmc6IDAuMTJlbTsKICAgIGxpbmUtaGVpZ2h0OiAxOwogICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTsKICB9CgogIC5wdi10aHVtYi1pbmRleCB7CiAgICBjb2xvcjogdmFyKC0tcHYtYnJhbmQpOwogICAgZm9udC13ZWlnaHQ6IDYwMDsKICB9CgogIC5wdi10aHVtYi1sYWJlbCB7CiAgICBvdmVyZmxvdzogaGlkZGVuOwogICAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7CiAgICB3aGl0ZS1zcGFjZTogbm93cmFwOwogIH0KCiAgLnB2LXRodW1iLXRpdGxlIHsKICAgIGRpc3BsYXk6IC13ZWJraXQtYm94OwogICAgbWF4LXdpZHRoOiA5NiU7CiAgICBtYXJnaW46IDlweCAwIDEwcHg7CiAgICBvdmVyZmxvdzogaGlkZGVuOwogICAgY29sb3I6IHZhcigtLXB2LWluayk7CiAgICBmb250LXNpemU6IDE3cHg7CiAgICBmb250LXdlaWdodDogNjAwOwogICAgbGV0dGVyLXNwYWNpbmc6IC0wLjAyNWVtOwogICAgbGluZS1oZWlnaHQ6IDEuMjQ7CiAgICAtd2Via2l0LWJveC1vcmllbnQ6IHZlcnRpY2FsOwogICAgLXdlYmtpdC1saW5lLWNsYW1wOiAyOwogIH0KCiAgLnB2LXRodW1iLWJvZHkgewogICAgcG9zaXRpb246IHJlbGF0aXZlOwogICAgZmxleDogMTsKICAgIG1pbi1oZWlnaHQ6IDA7CiAgICBvdmVyZmxvdzogaGlkZGVuOwogIH0KCiAgLnB2LXRodW1iLWZvb3QgewogICAgZGlzcGxheTogZmxleDsKICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47CiAgICBnYXA6IDEycHg7CiAgICBmbGV4LXNocmluazogMDsKICAgIG1hcmdpbi10b3A6IDhweDsKICAgIHBhZGRpbmctdG9wOiA3cHg7CiAgICBib3JkZXItdG9wOiAxcHggc29saWQgdmFyKC0tcHYtbGluZSk7CiAgICBjb2xvcjogdmFyKC0tcHYtdGV4dC0zKTsKICAgIGZvbnQtZmFtaWx5OiB2YXIoLS1wdi1mb250LW1vbm8pOwogICAgZm9udC1zaXplOiA2cHg7CiAgICBsZXR0ZXItc3BhY2luZzogMC4wNmVtOwogICAgbGluZS1oZWlnaHQ6IDE7CiAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOwogIH0KCiAgLyog57yp55Wl5Zu+IOKAlOKAlCDlsIHpnaIgKi8KICAucHYtdGh1bWItLWNvdmVyIHsKICAgIHBhZGRpbmc6IDA7CiAgICBib3JkZXItY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wOCk7CiAgICBiYWNrZ3JvdW5kOgogICAgICByYWRpYWwtZ3JhZGllbnQoCiAgICAgICAgNDYwcHggMzAwcHggYXQgODglIDYlLAogICAgICAgIHJnYmEoMTEsIDkyLCAyNTUsIDAuMzQpLAogICAgICAgIHRyYW5zcGFyZW50IDY4JQogICAgICApLAogICAgICBsaW5lYXItZ3JhZGllbnQoMTUwZGVnLCAjMGQxMjFiIDAlLCB2YXIoLS1wdi1kYXJrKSA1OCUsICMwODBiMTAgMTAwJSk7CiAgICBjb2xvcjogI2ZmZmZmZjsKICAgIGJveC1zaGFkb3c6CiAgICAgIDAgMXB4IDJweCByZ2JhKDEyLCAxNywgMjYsIDAuMTYpLAogICAgICAwIDI0cHggNTBweCAtMzJweCByZ2JhKDEyLCAxNywgMjYsIDAuNyk7CiAgfQoKICAucHYtdGh1bWItLWNvdmVyOjphZnRlciB7CiAgICBjb250ZW50OiAiIjsKICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTsKICAgIHRvcDogLTQyJTsKICAgIHJpZ2h0OiAtMTMlOwogICAgd2lkdGg6IDY0JTsKICAgIGFzcGVjdC1yYXRpbzogMTsKICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMTUwLCAxODAsIDI1NSwgMC4xNCk7CiAgICBib3JkZXItcmFkaXVzOiA1MCU7CiAgICBib3gtc2hhZG93OiAwIDAgMCAzNHB4IHJnYmEoMTUwLCAxODAsIDI1NSwgMC4wMzUpOwogICAgcG9pbnRlci1ldmVudHM6IG5vbmU7CiAgfQoKICAucHYtdGh1bWItY292ZXIgewogICAgcG9zaXRpb246IHJlbGF0aXZlOwogICAgei1pbmRleDogMTsKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOwogICAgaGVpZ2h0OiAxMDAlOwogICAgcGFkZGluZzogMThweCAyMHB4IDE0cHg7CiAgfQoKICAucHYtdGh1bWItY292ZXItdG9wIHsKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOwogICAgY29sb3I6ICM3ODg0OWE7CiAgICBmb250LWZhbWlseTogdmFyKC0tcHYtZm9udC1tb25vKTsKICAgIGZvbnQtc2l6ZTogNi41cHg7CiAgICBsZXR0ZXItc3BhY2luZzogMC4xNmVtOwogICAgbGluZS1oZWlnaHQ6IDE7CiAgfQoKICAucHYtdGh1bWItY292ZXItbWFyayB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGdhcDogN3B4OwogIH0KCiAgLnB2LXRodW1iLWNvdmVyLW1hcmsgc3BhbiB7CiAgICB3aWR0aDogNnB4OwogICAgaGVpZ2h0OiA2cHg7CiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1wdi1icmFuZCk7CiAgICBib3JkZXItcmFkaXVzOiAxcHg7CiAgfQoKICAucHYtdGh1bWItY292ZXItbWFpbiB7CiAgICBtYXJnaW46IGF1dG8gMDsKICB9CgogIC5wdi10aHVtYi1jb3Zlci1raWNrZXIgewogICAgY29sb3I6ICM4Nzk3YjA7CiAgICBmb250LWZhbWlseTogdmFyKC0tcHYtZm9udC1tb25vKTsKICAgIGZvbnQtc2l6ZTogNi41cHg7CiAgICBsZXR0ZXItc3BhY2luZzogMC4xNmVtOwogIH0KCiAgLnB2LXRodW1iLWNvdmVyLXRpdGxlIHsKICAgIG1heC13aWR0aDogODIlOwogICAgbWFyZ2luOiA5cHggMCA4cHg7CiAgICBjb2xvcjogI2Y3ZjlmZDsKICAgIGZvbnQtc2l6ZTogMjZweDsKICAgIGZvbnQtd2VpZ2h0OiA2MDA7CiAgICBsZXR0ZXItc3BhY2luZzogLTAuMDRlbTsKICAgIGxpbmUtaGVpZ2h0OiAxLjE7CiAgfQoKICAucHYtdGh1bWItY292ZXItc3VidGl0bGUgewogICAgZGlzcGxheTogLXdlYmtpdC1ib3g7CiAgICBtYXgtd2lkdGg6IDY2JTsKICAgIG1hcmdpbjogMDsKICAgIG92ZXJmbG93OiBoaWRkZW47CiAgICBjb2xvcjogIzk4YTViOTsKICAgIGZvbnQtc2l6ZTogOC41cHg7CiAgICBmb250LXdlaWdodDogNDAwOwogICAgbGluZS1oZWlnaHQ6IDEuNTU7CiAgICAtd2Via2l0LWJveC1vcmllbnQ6IHZlcnRpY2FsOwogICAgLXdlYmtpdC1saW5lLWNsYW1wOiAyOwogIH0KCiAgLnB2LXRodW1iLWNvdmVyLWZvb3QgewogICAgZGlzcGxheTogZmxleDsKICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47CiAgICBwYWRkaW5nLXRvcDogN3B4OwogICAgYm9yZGVyLXRvcDogMXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xMik7CiAgICBjb2xvcjogIzcxODA5NzsKICAgIGZvbnQtZmFtaWx5OiB2YXIoLS1wdi1mb250LW1vbm8pOwogICAgZm9udC1zaXplOiA2LjVweDsKICAgIGxldHRlci1zcGFjaW5nOiAwLjFlbTsKICB9CgogIC8qIOe8qeeVpeWbviDigJTigJQg5q2j5paHICovCiAgLnB2LXRodW1iLXRleHQgewogICAgZGlzcGxheTogLXdlYmtpdC1ib3g7CiAgICBtYXJnaW46IDA7CiAgICBvdmVyZmxvdzogaGlkZGVuOwogICAgY29sb3I6IHZhcigtLXB2LXRleHQtMik7CiAgICBmb250LXNpemU6IDlweDsKICAgIGxpbmUtaGVpZ2h0OiAxLjU1OwogICAgLXdlYmtpdC1ib3gtb3JpZW50OiB2ZXJ0aWNhbDsKICAgIC13ZWJraXQtbGluZS1jbGFtcDogMzsKICB9CgogIC5wdi10aHVtYi1ib2R5LS10ZXh0LWNoYXJ0IHsKICAgIGRpc3BsYXk6IGdyaWQ7CiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IDVmciA3ZnI7CiAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAgZ2FwOiAxMHB4OwogIH0KCiAgLnB2LXRodW1iLWJvZHktLWxpc3QtY2hhcnQgewogICAgZGlzcGxheTogZ3JpZDsKICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogNWZyIDdmcjsKICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICBnYXA6IDEwcHg7CiAgfQoKICAucHYtdGh1bWItYm9keS0tbGVhZC1saXN0LWNoYXJ0IHsKICAgIGRpc3BsYXk6IGdyaWQ7CiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IDVmciA3ZnI7CiAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAgZ2FwOiA4cHggMTBweDsKICB9CgogIC5wdi10aHVtYi1ib2R5LS1sZWFkLWxpc3QtY2hhcnQgPiAucHYtdGh1bWItdGV4dCB7CiAgICBkaXNwbGF5OiBub25lOwogIH0KCiAgLnB2LXRodW1iLWJvZHktLWxlYWQtbGlzdC1jaGFydCAucHYtdGh1bWItbGlzdCB7CiAgICBncmlkLWNvbHVtbjogMTsKICB9CgogIC5wdi10aHVtYi1ib2R5LS1sZWFkLWxpc3QtY2hhcnQgLnB2LXRodW1iLWNoYXJ0IHsKICAgIGdyaWQtY29sdW1uOiAyOwogIH0KCiAgLnB2LXRodW1iLWJvZHktLXNvbG8tY2hhcnQgLnB2LXRodW1iLWNoYXJ0IHsKICAgIGhlaWdodDogMTAwJTsKICB9CgogIC5wdi10aHVtYi1saXN0IHsKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOwogICAgZ2FwOiA0cHg7CiAgICBtYXJnaW46IDA7CiAgICBwYWRkaW5nOiAwOwogICAgbGlzdC1zdHlsZTogbm9uZTsKICB9CgogIC5wdi10aHVtYi1saXN0LWl0ZW0gewogICAgZGlzcGxheTogZ3JpZDsKICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogMTNweCAxZnI7CiAgICBnYXA6IDRweDsKICAgIGNvbG9yOiB2YXIoLS1wdi10ZXh0LTIpOwogICAgZm9udC1zaXplOiA3cHg7CiAgICBsaW5lLWhlaWdodDogMS4zNTsKICB9CgogIC5wdi10aHVtYi1saXN0LWluZGV4IHsKICAgIGNvbG9yOiB2YXIoLS1wdi1icmFuZCk7CiAgICBmb250LWZhbWlseTogdmFyKC0tcHYtZm9udC1tb25vKTsKICAgIGZvbnQtc2l6ZTogNS41cHg7CiAgICBsaW5lLWhlaWdodDogMS42OwogIH0KCiAgLnB2LXRodW1iLWNoYXJ0IHsKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOwogICAgaGVpZ2h0OiAxMDAlOwogICAgbWluLWhlaWdodDogMDsKICAgIHBhZGRpbmc6IDdweCA4cHggNnB4OwogICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tcHYtbGluZSk7CiAgICBib3JkZXItcmFkaXVzOiA3cHg7CiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1wdi1wYXBlcik7CiAgfQoKICAucHYtdGh1bWItY2hhcnQtaGVhZCB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGdhcDogNXB4OwogICAgZmxleC1zaHJpbms6IDA7CiAgICBwYWRkaW5nLWJvdHRvbTogNHB4OwogICAgY29sb3I6IHZhcigtLXB2LXRleHQtMik7CiAgICBmb250LXNpemU6IDZweDsKICAgIGZvbnQtd2VpZ2h0OiA1NTA7CiAgICBsaW5lLWhlaWdodDogMS4yOwogICAgd2hpdGUtc3BhY2U6IG5vd3JhcDsKICAgIG92ZXJmbG93OiBoaWRkZW47CiAgICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpczsKICB9CgogIC5wdi10aHVtYi1kb3QgewogICAgd2lkdGg6IDNweDsKICAgIGhlaWdodDogM3B4OwogICAgZmxleC1zaHJpbms6IDA7CiAgICBib3JkZXItcmFkaXVzOiAxcHg7CiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1wdi1icmFuZCk7CiAgfQoKICAucHYtdGh1bWItY2hhcnQtY2FudmFzIHsKICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsKICAgIGZsZXg6IDE7CiAgICBtaW4taGVpZ2h0OiAwOwogICAgb3ZlcmZsb3c6IGhpZGRlbjsKICB9CgogIC5wdi10aHVtYi1jaGFydC1jYW52YXMtLWxpbmUgc3ZnIHsKICAgIHdpZHRoOiAxMDAlOwogICAgaGVpZ2h0OiAxMDAlOwogICAgb3ZlcmZsb3c6IHZpc2libGU7CiAgfQoKICAucHYtdGh1bWItbGluZSB7CiAgICBmaWxsOiBub25lOwogICAgc3Ryb2tlOiB2YXIoLS1wdi1icmFuZCk7CiAgICBzdHJva2Utd2lkdGg6IDEuODsKICAgIHN0cm9rZS1saW5lY2FwOiByb3VuZDsKICAgIHN0cm9rZS1saW5lam9pbjogcm91bmQ7CiAgICB2ZWN0b3ItZWZmZWN0OiBub24tc2NhbGluZy1zdHJva2U7CiAgfQoKICAucHYtdGh1bWItYXJlYSB7CiAgICBmaWxsOiByZ2JhKDExLCA5MiwgMjU1LCAwLjA5KTsKICB9CgogIC5wdi10aHVtYi1iYXJzIHsKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBhbGlnbi1pdGVtczogZmxleC1lbmQ7CiAgICBnYXA6IDRweDsKICAgIHdpZHRoOiAxMDAlOwogICAgaGVpZ2h0OiAxMDAlOwogICAgcGFkZGluZy10b3A6IDRweDsKICB9CgogIC5wdi10aHVtYi1iYXIgewogICAgZmxleDogMTsKICAgIG1pbi1oZWlnaHQ6IDglOwogICAgYm9yZGVyLXJhZGl1czogMnB4IDJweCAwIDA7CiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1wdi1icmFuZCk7CiAgICBvcGFjaXR5OiAwLjg0OwogIH0KCiAgLnB2LXRodW1iLWJhci0tYWN0aXZlIHsKICAgIGJhY2tncm91bmQ6IHZhcigtLXB2LWJyYW5kKTsKICAgIG9wYWNpdHk6IDE7CiAgfQoKICAucHYtdGh1bWItYmFyLS1tdXRlZCB7CiAgICBiYWNrZ3JvdW5kOiAjZDllMmYwOwogICAgb3BhY2l0eTogMTsKICB9CgogIC5wdi10aHVtYi1kb251dCB7CiAgICBwb3NpdGlvbjogYWJzb2x1dGU7CiAgICB0b3A6IDUwJTsKICAgIGxlZnQ6IDUwJTsKICAgIHdpZHRoOiBtaW4oNjYlLCA1OHB4KTsKICAgIGFzcGVjdC1yYXRpbzogMTsKICAgIGJvcmRlci1yYWRpdXM6IDUwJTsKICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC01MCUpOwogIH0KCiAgLnB2LXRodW1iLWRvbnV0OjphZnRlciB7CiAgICBjb250ZW50OiAiIjsKICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTsKICAgIGluc2V0OiAyOSU7CiAgICBib3JkZXItcmFkaXVzOiA1MCU7CiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1wdi1wYXBlcik7CiAgfQoKICAucHYtdGh1bWItZmxvdyB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgZmxleC13cmFwOiB3cmFwOwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOwogICAgZ2FwOiAzcHg7CiAgICB3aWR0aDogMTAwJTsKICAgIGhlaWdodDogMTAwJTsKICB9CgogIC5wdi10aHVtYi1ub2RlIHsKICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsKICAgIHBhZGRpbmc6IDNweCA0cHg7CiAgICBib3JkZXI6IDFweCBzb2xpZCAjY2NkOGVhOwogICAgYm9yZGVyLXJhZGl1czogM3B4OwogICAgYmFja2dyb3VuZDogI2ZmZmZmZjsKICAgIGNvbG9yOiAjNTk2NTc5OwogICAgZm9udC1zaXplOiA1cHg7CiAgICBsaW5lLWhlaWdodDogMS4xOwogICAgd2hpdGUtc3BhY2U6IG5vd3JhcDsKICB9CgogIC5wdi10aHVtYi1ub2RlICsgLnB2LXRodW1iLW5vZGU6OmJlZm9yZSB7CiAgICBjb250ZW50OiAi4oC6IjsKICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTsKICAgIGxlZnQ6IC00cHg7CiAgICB0b3A6IDUwJTsKICAgIGNvbG9yOiAjOWFhOGJiOwogICAgZm9udC1zaXplOiA2cHg7CiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTUyJSk7CiAgfQoKICAucHYtdGh1bWItY2hhcnQtY2FudmFzLS1mbG93IHsKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBhbGlnbi1pdGVtczogY2VudGVyOwogIH0KCiAgLnB2LXRodW1iLW1vY2sgewogICAgZGlzcGxheTogZmxleDsKICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47CiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsKICAgIGdhcDogNHB4OwogICAgaGVpZ2h0OiAxMDAlOwogIH0KCiAgLnB2LXRodW1iLW1vY2sgc3BhbiB7CiAgICBkaXNwbGF5OiBibG9jazsKICAgIGhlaWdodDogMnB4OwogICAgYm9yZGVyLXJhZGl1czogMnB4OwogICAgYmFja2dyb3VuZDogI2RiZTNlZjsKICB9CgogIC5wdi10aHVtYi1tb2NrIHNwYW46bnRoLWNoaWxkKDIpIHsKICAgIHdpZHRoOiA3MiU7CiAgfQoKICAucHYtdGh1bWItbW9jayBzcGFuOm50aC1jaGlsZCgzKSB7CiAgICB3aWR0aDogNDglOwogIH0KCiAgLnB2LXRodW1iLWltYWdlIHsKICAgIHdpZHRoOiAxMDAlOwogICAgaGVpZ2h0OiAxMDAlOwogICAgb3ZlcmZsb3c6IGhpZGRlbjsKICAgIGJvcmRlci1yYWRpdXM6IDZweDsKICAgIGJhY2tncm91bmQ6IHZhcigtLXB2LXBhcGVyKTsKICB9CgogIC5wdi10aHVtYi1pbWFnZSBpbWcgewogICAgd2lkdGg6IDEwMCU7CiAgICBoZWlnaHQ6IDEwMCU7CiAgICBvYmplY3QtZml0OiBjb3ZlcjsKICB9CgogIC5wdi10aHVtYi1xdW90ZSB7CiAgICBtYXJnaW46IDA7CiAgICBwYWRkaW5nOiA4cHggMTBweDsKICAgIGJvcmRlci1sZWZ0OiAycHggc29saWQgdmFyKC0tcHYtYnJhbmQpOwogICAgY29sb3I6IHZhcigtLXB2LXRleHQtMSk7CiAgICBmb250LXNpemU6IDhweDsKICAgIGxpbmUtaGVpZ2h0OiAxLjU7CiAgfQoKICAucHYtdGh1bWItdGFibGUgewogICAgZGlzcGxheTogZmxleDsKICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47CiAgICBnYXA6IDNweDsKICAgIHdpZHRoOiAxMDAlOwogIH0KCiAgLnB2LXRodW1iLXRhYmxlLXJvdyB7CiAgICBkaXNwbGF5OiBncmlkOwogICAgZ3JpZC1hdXRvLWZsb3c6IGNvbHVtbjsKICAgIGdyaWQtYXV0by1jb2x1bW5zOiAxZnI7CiAgICBnYXA6IDRweDsKICAgIHBhZGRpbmctYm90dG9tOiAzcHg7CiAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tcHYtbGluZSk7CiAgICBjb2xvcjogdmFyKC0tcHYtdGV4dC0yKTsKICAgIGZvbnQtc2l6ZTogNXB4OwogICAgbGluZS1oZWlnaHQ6IDEuMjsKICB9CgogIC5wdi1jYXJkLW1ldGEgewogICAgZGlzcGxheTogZmxleDsKICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICBnYXA6IDlweDsKICAgIHBhZGRpbmc6IDEycHggMnB4IDA7CiAgICBjb2xvcjogdmFyKC0tcHYtdGV4dC0zKTsKICAgIGZvbnQtZmFtaWx5OiB2YXIoLS1wdi1mb250LW1vbm8pOwogICAgZm9udC1zaXplOiA5cHg7CiAgICBsZXR0ZXItc3BhY2luZzogMC4wOGVtOwogICAgbGluZS1oZWlnaHQ6IDE7CiAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOwogIH0KCiAgLnB2LWNhcmQtaW5kZXggewogICAgY29sb3I6IHZhcigtLXB2LWJyYW5kKTsKICAgIGZvbnQtd2VpZ2h0OiA2MDA7CiAgfQoKICAucHYtY2FyZC1raW5kIHsKICAgIGNvbG9yOiB2YXIoLS1wdi10ZXh0LTIpOwogICAgbGV0dGVyLXNwYWNpbmc6IDAuMDRlbTsKICB9CgogIC5wdi1jYXJkLW9wZW4gewogICAgZGlzcGxheTogaW5saW5lLWZsZXg7CiAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAgZ2FwOiA0cHg7CiAgICBtYXJnaW4tbGVmdDogYXV0bzsKICAgIG9wYWNpdHk6IDA7CiAgICBjb2xvcjogdmFyKC0tcHYtYnJhbmQpOwogICAgZm9udC1mYW1pbHk6IHZhcigtLXB2LWZvbnQtc2Fucyk7CiAgICBmb250LXNpemU6IDEwcHg7CiAgICBsZXR0ZXItc3BhY2luZzogMC4wMmVtOwogICAgdGV4dC10cmFuc2Zvcm06IG5vbmU7CiAgICB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuMjVzIHZhcigtLXB2LWVhc2UpOwogIH0KCiAgLnB2LWNhcmQtb3BlbiBzdmcgewogICAgd2lkdGg6IDEycHg7CiAgICBoZWlnaHQ6IDEycHg7CiAgfQoKICAucHYtY2FyZDpob3ZlciAucHYtY2FyZC1vcGVuLAogIC5wdi1jYXJkOmZvY3VzLXZpc2libGUgLnB2LWNhcmQtb3BlbiB7CiAgICBvcGFjaXR5OiAxOwogIH0KCiAgLnB2LWZvb3RlciB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOwogICAgZ2FwOiAyMHB4OwogICAgbWFyZ2luLXRvcDogMjRweDsKICAgIHBhZGRpbmctdG9wOiAxNHB4OwogICAgYm9yZGVyLXRvcDogMXB4IHNvbGlkIHZhcigtLXB2LWxpbmUpOwogICAgY29sb3I6IHZhcigtLXB2LXRleHQtMyk7CiAgICBmb250LWZhbWlseTogdmFyKC0tcHYtZm9udC1tb25vKTsKICAgIGZvbnQtc2l6ZTogOXB4OwogICAgbGV0dGVyLXNwYWNpbmc6IDAuMDhlbTsKICAgIGxpbmUtaGVpZ2h0OiAxLjU7CiAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOwogIH0KCiAgLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CiAgICAg5pS+5pig6KaG55uW5bGCICYg5o6n5Yi25p2hCiAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovCiAgLnB2LW92ZXJsYXkgewogICAgcG9zaXRpb246IGZpeGVkOwogICAgaW5zZXQ6IDA7CiAgICB6LWluZGV4OiA5OTk5OwogICAgZGlzcGxheTogZmxleDsKICAgIG92ZXJmbG93OiBoaWRkZW47CiAgICBiYWNrZ3JvdW5kOiAjMDgwYjEwOwogIH0KCiAgLnB2LXRvb2xiYXIgewogICAgcG9zaXRpb246IGFic29sdXRlOwogICAgdG9wOiAyMnB4OwogICAgbGVmdDogNTAlOwogICAgei1pbmRleDogMzA7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGdhcDogMnB4OwogICAgcGFkZGluZzogNXB4OwogICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpOwogICAgYm9yZGVyLXJhZGl1czogOTk5cHg7CiAgICBiYWNrZ3JvdW5kOiByZ2JhKDEyLCAxNiwgMjMsIDAuNzYpOwogICAgY29sb3I6ICNmZmZmZmY7CiAgICBib3gtc2hhZG93OiAwIDE4cHggNDBweCAtMjJweCByZ2JhKDAsIDAsIDAsIDAuOCk7CiAgICBiYWNrZHJvcC1maWx0ZXI6IHNhdHVyYXRlKDE2MCUpIGJsdXIoMThweCk7CiAgICAtd2Via2l0LWJhY2tkcm9wLWZpbHRlcjogc2F0dXJhdGUoMTYwJSkgYmx1cigxOHB4KTsKICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtNTAlKTsKICAgIHRyYW5zaXRpb246CiAgICAgIG9wYWNpdHkgMC4zNXMgdmFyKC0tcHYtZWFzZSksCiAgICAgIHRyYW5zZm9ybSAwLjM1cyB2YXIoLS1wdi1lYXNlKTsKICB9CgogIC5wdi10b29sYmFyLS1pZGxlIHsKICAgIHZpc2liaWxpdHk6IGhpZGRlbjsKICAgIG9wYWNpdHk6IDA7CiAgICBwb2ludGVyLWV2ZW50czogbm9uZTsKICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC0xMHB4KTsKICAgIHRyYW5zaXRpb246CiAgICAgIG9wYWNpdHkgMC4zNXMgdmFyKC0tcHYtZWFzZSksCiAgICAgIHRyYW5zZm9ybSAwLjM1cyB2YXIoLS1wdi1lYXNlKSwKICAgICAgdmlzaWJpbGl0eSAwcyAwLjM1czsKICB9CgogIC5wdi10b29sLWJ0biB7CiAgICBkaXNwbGF5OiBpbmxpbmUtZmxleDsKICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsKICAgIHdpZHRoOiAzNHB4OwogICAgaGVpZ2h0OiAzNHB4OwogICAgcGFkZGluZzogMDsKICAgIGJvcmRlcjogMDsKICAgIGJvcmRlci1yYWRpdXM6IDUwJTsKICAgIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50OwogICAgY29sb3I6ICNjN2QwZGQ7CiAgICBjdXJzb3I6IHBvaW50ZXI7CiAgICB0cmFuc2l0aW9uOgogICAgICBiYWNrZ3JvdW5kLWNvbG9yIDAuMnMgdmFyKC0tcHYtZWFzZSksCiAgICAgIGNvbG9yIDAuMnMgdmFyKC0tcHYtZWFzZSk7CiAgfQoKICAucHYtdG9vbC1idG4gc3ZnIHsKICAgIHdpZHRoOiAxN3B4OwogICAgaGVpZ2h0OiAxN3B4OwogIH0KCiAgLnB2LXRvb2wtYnRuOmhvdmVyOm5vdCg6ZGlzYWJsZWQpIHsKICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKTsKICAgIGNvbG9yOiAjZmZmZmZmOwogIH0KCiAgLnB2LXRvb2wtYnRuOmRpc2FibGVkIHsKICAgIG9wYWNpdHk6IDAuNTsKICAgIGN1cnNvcjogd2FpdDsKICB9CgogIC5wdi1leHBvcnQtYnRuIHsKICAgIHdpZHRoOiBhdXRvOwogICAgbWluLXdpZHRoOiAzNHB4OwogICAgcGFkZGluZzogMCAxMHB4OwogICAgZ2FwOiA2cHg7CiAgICBib3JkZXItcmFkaXVzOiA5OTlweDsKICB9CgogIC5wdi1leHBvcnQtbGFiZWwgewogICAgY29sb3I6IGluaGVyaXQ7CiAgICBmb250LXNpemU6IDEwcHg7CiAgICBmb250LXdlaWdodDogNTAwOwogICAgbGV0dGVyLXNwYWNpbmc6IDAuMDJlbTsKICAgIGxpbmUtaGVpZ2h0OiAxOwogIH0KCiAgLnB2LWV4cG9ydC1zcGlubmVyIHsKICAgIGRpc3BsYXk6IGlubGluZS1ibG9jazsKICAgIHdpZHRoOiAxNHB4OwogICAgaGVpZ2h0OiAxNHB4OwogICAgYm9yZGVyOiAycHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjIyKTsKICAgIGJvcmRlci10b3AtY29sb3I6ICNmZmZmZmY7CiAgICBib3JkZXItcmFkaXVzOiA1MCU7CiAgICBhbmltYXRpb246IHB2LXNwaW4gMC43NXMgbGluZWFyIGluZmluaXRlOwogIH0KCiAgQGtleWZyYW1lcyBwdi1zcGluIHsKICAgIHRvIHsKICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTsKICAgIH0KICB9CgogIC5wdi10b29sLWJ0bjpmb2N1cy12aXNpYmxlLAogIC5wdi1leGl0LWJ0bjpmb2N1cy12aXNpYmxlIHsKICAgIG91dGxpbmU6IDJweCBzb2xpZCAjN2VhN2ZmOwogICAgb3V0bGluZS1vZmZzZXQ6IDFweDsKICB9CgogIC5wdi1jb3VudGVyIHsKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBhbGlnbi1pdGVtczogYmFzZWxpbmU7CiAgICBnYXA6IDNweDsKICAgIG1pbi13aWR0aDogNTBweDsKICAgIHBhZGRpbmc6IDAgOHB4OwogICAgY29sb3I6ICM3NzgzOTY7CiAgICBmb250LWZhbWlseTogdmFyKC0tcHYtZm9udC1tb25vKTsKICAgIGZvbnQtc2l6ZTogMTBweDsKICAgIGxldHRlci1zcGFjaW5nOiAwLjA0ZW07CiAgICBsaW5lLWhlaWdodDogMTsKICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7CiAgfQoKICAucHYtY291bnRlciBzdHJvbmcgewogICAgY29sb3I6ICNmZmZmZmY7CiAgICBmb250LXdlaWdodDogNjAwOwogIH0KCiAgLnB2LXRvb2xiYXItZGl2aWRlciB7CiAgICB3aWR0aDogMXB4OwogICAgaGVpZ2h0OiAxNnB4OwogICAgbWFyZ2luOiAwIDRweDsKICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xNCk7CiAgfQoKICAucHYtZXhpdC1idG4gewogICAgZGlzcGxheTogaW5saW5lLWZsZXg7CiAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAgZ2FwOiA3cHg7CiAgICBoZWlnaHQ6IDM0cHg7CiAgICBwYWRkaW5nOiAwIDExcHggMCAxMnB4OwogICAgYm9yZGVyOiAwOwogICAgYm9yZGVyLXJhZGl1czogOTk5cHg7CiAgICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDsKICAgIGNvbG9yOiAjYzdkMGRkOwogICAgZm9udC1zaXplOiAxMHB4OwogICAgbGV0dGVyLXNwYWNpbmc6IDAuMDJlbTsKICAgIGN1cnNvcjogcG9pbnRlcjsKICAgIHRyYW5zaXRpb246CiAgICAgIGJhY2tncm91bmQtY29sb3IgMC4ycyB2YXIoLS1wdi1lYXNlKSwKICAgICAgY29sb3IgMC4ycyB2YXIoLS1wdi1lYXNlKTsKICB9CgogIC5wdi1leGl0LWJ0bjpob3ZlciB7CiAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSk7CiAgICBjb2xvcjogI2ZmZmZmZjsKICB9CgogIC5wdi1leGl0LWJ0biBrYmQgewogICAgcGFkZGluZzogMnB4IDVweDsKICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xNik7CiAgICBib3JkZXItcmFkaXVzOiA0cHg7CiAgICBjb2xvcjogIzhlOWFhYjsKICAgIGZvbnQtZmFtaWx5OiB2YXIoLS1wdi1mb250LW1vbm8pOwogICAgZm9udC1zaXplOiA4cHg7CiAgICBsaW5lLWhlaWdodDogMTsKICB9CgogIC5wdi1yb3RhdGUtaGludCB7CiAgICBkaXNwbGF5OiBub25lOwogIH0KCiAgLnB2LWV4cG9ydC10b2FzdCB7CiAgICBwb3NpdGlvbjogYWJzb2x1dGU7CiAgICBsZWZ0OiA1MCU7CiAgICBib3R0b206IDIycHg7CiAgICB6LWluZGV4OiAzMzsKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAgZ2FwOiA4cHg7CiAgICBwYWRkaW5nOiA5cHggMTRweDsKICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xMik7CiAgICBib3JkZXItcmFkaXVzOiA5OTlweDsKICAgIGJhY2tncm91bmQ6IHJnYmEoMTIsIDE2LCAyMywgMC44NCk7CiAgICBjb2xvcjogI2RmZTdmMzsKICAgIGZvbnQtZmFtaWx5OiB2YXIoLS1wdi1mb250LW1vbm8pOwogICAgZm9udC1zaXplOiAxMHB4OwogICAgbGV0dGVyLXNwYWNpbmc6IDAuMDRlbTsKICAgIGxpbmUtaGVpZ2h0OiAxOwogICAgcG9pbnRlci1ldmVudHM6IG5vbmU7CiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTUwJSk7CiAgICBib3gtc2hhZG93OiAwIDEycHggMzBweCAtMThweCByZ2JhKDAsIDAsIDAsIDAuOSk7CiAgICBiYWNrZHJvcC1maWx0ZXI6IHNhdHVyYXRlKDE2MCUpIGJsdXIoMTZweCk7CiAgICAtd2Via2l0LWJhY2tkcm9wLWZpbHRlcjogc2F0dXJhdGUoMTYwJSkgYmx1cigxNnB4KTsKICB9CgogIC5wdi1leHBvcnQtdG9hc3QtLWVycm9yIHsKICAgIGJvcmRlci1jb2xvcjogcmdiYSgyNTUsIDEyMCwgMTIwLCAwLjI4KTsKICAgIGNvbG9yOiAjZmZiNGI0OwogIH0KCiAgLnB2LWV4cG9ydC10b2FzdCAucHYtZXhwb3J0LXNwaW5uZXIgewogICAgYm9yZGVyLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMTYpOwogICAgYm9yZGVyLXRvcC1jb2xvcjogI2ZmZmZmZjsKICB9CgogIC5wdi1wcm9ncmVzcyB7CiAgICBwb3NpdGlvbjogYWJzb2x1dGU7CiAgICByaWdodDogMDsKICAgIGJvdHRvbTogMDsKICAgIGxlZnQ6IDA7CiAgICB6LWluZGV4OiAzMTsKICAgIGhlaWdodDogMnB4OwogICAgb3ZlcmZsb3c6IGhpZGRlbjsKICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wOCk7CiAgfQoKICAucHYtcHJvZ3Jlc3Mgc3BhbiB7CiAgICBkaXNwbGF5OiBibG9jazsKICAgIGhlaWdodDogMTAwJTsKICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCg5MGRlZywgdmFyKC0tcHYtYnJhbmQtZGVlcCksICM1Zjk1ZmYpOwogICAgdHJhbnNpdGlvbjogd2lkdGggMC40NXMgdmFyKC0tcHYtZWFzZSk7CiAgfQoKICAucHYtc3RhZ2UgewogICAgcG9zaXRpb246IGFic29sdXRlOwogICAgaW5zZXQ6IDA7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOwogICAgd2lkdGg6IDEwMCU7CiAgICBoZWlnaHQ6IDEwMCU7CiAgICBvdmVyZmxvdzogaGlkZGVuOwogICAgYmFja2dyb3VuZDogIzA4MGIxMDsKICAgIHRvdWNoLWFjdGlvbjogbm9uZTsKICB9CgogIC8qIOe7hOS7tuWGhee9rueahCAxOTIww5cxMDgwIOiInuWPsO+8muS4jeS+nei1liByZXZlYWwuanMg55qEIENTUyDmiJYgSlPjgIIgKi8KICAucHYtc3RhZ2UgLnNsaWRlcyB7CiAgICBwb3NpdGlvbjogYWJzb2x1dGU7CiAgICB0b3A6IDUwJTsKICAgIGxlZnQ6IDUwJTsKICAgIHdpZHRoOiAxOTIwcHg7CiAgICBoZWlnaHQ6IDEwODBweDsKICAgIG92ZXJmbG93OiBoaWRkZW47CiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtNTAlKSBzY2FsZSh2YXIoLS1wdi1zdGFnZS1zY2FsZSwgMSkpOwogICAgdHJhbnNmb3JtLW9yaWdpbjogY2VudGVyIGNlbnRlcjsKICAgIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50OwogIH0KCiAgLnB2LXN0YWdlIC5zbGlkZXMgPiBzZWN0aW9uIHsKICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTsKICAgIGluc2V0OiAwOwogICAgZGlzcGxheTogbm9uZSAhaW1wb3J0YW50OwogICAgd2lkdGg6IDEwMCU7CiAgICBoZWlnaHQ6IDEwMCU7CiAgICBvcGFjaXR5OiAxOwogICAgdmlzaWJpbGl0eTogdmlzaWJsZTsKICB9CgogIC5wdi1zdGFnZSAuc2xpZGVzID4gc2VjdGlvbi5pcy1jdXJyZW50IHsKICAgIHotaW5kZXg6IDI7CiAgICBkaXNwbGF5OiBmbGV4ICFpbXBvcnRhbnQ7CiAgfQoKICAvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KICAgICDlubvnga/niYfnlLvluIMKICAgICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi8KICAucnMtc2xpZGUgewogICAgLS1zbGlkZS1wYWQteDogOTZweDsKICAgIC0tc2xpZGUtZ2FwOiA1MnB4OwogICAgLS10aXRsZS1zaXplOiA1NnB4OwogICAgLS1sZWFkLXNpemU6IDM2cHg7CiAgICAtLWJvZHktc2l6ZTogMzBweDsKICAgIC0tbGlzdC1zaXplOiAzMHB4OwogICAgLS1xdW90ZS1zaXplOiA0MnB4OwogICAgLS10YWJsZS1zaXplOiAyNHB4OwogICAgLS1jaGFydC1taW4taDogNDIwcHg7CiAgICAtLWxpc3Qtcm93LXBhZDogMjRweDsKCiAgICBwb3NpdGlvbjogcmVsYXRpdmU7CiAgICBkaXNwbGF5OiBmbGV4ICFpbXBvcnRhbnQ7CiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uICFpbXBvcnRhbnQ7CiAgICBhbGlnbi1pdGVtczogc3RyZXRjaCAhaW1wb3J0YW50OwogICAganVzdGlmeS1jb250ZW50OiBmbGV4LXN0YXJ0ICFpbXBvcnRhbnQ7CiAgICB3aWR0aDogMTAwJTsKICAgIGhlaWdodDogMTAwJTsKICAgIG1hcmdpbjogMCAhaW1wb3J0YW50OwogICAgcGFkZGluZzogMCAhaW1wb3J0YW50OwogICAgb3ZlcmZsb3c6IGhpZGRlbiAhaW1wb3J0YW50OwogICAgYm9yZGVyOiAwICFpbXBvcnRhbnQ7CiAgICBib3JkZXItcmFkaXVzOiAwICFpbXBvcnRhbnQ7CiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1wdi1wYXBlcikgIWltcG9ydGFudDsKICAgIGNvbG9yOiB2YXIoLS1wdi10ZXh0LTEpOwogICAgdGV4dC1hbGlnbjogbGVmdCAhaW1wb3J0YW50OwogICAgYm94LXNpemluZzogYm9yZGVyLWJveDsKICB9CgogIC5ycy1kZW5zaXR5LW1lZGl1bSB7CiAgICAtLXRpdGxlLXNpemU6IDUwcHg7CiAgICAtLWxlYWQtc2l6ZTogMzRweDsKICAgIC0tYm9keS1zaXplOiAyOXB4OwogICAgLS1saXN0LXNpemU6IDI5cHg7CiAgICAtLXF1b3RlLXNpemU6IDM2cHg7CiAgICAtLXRhYmxlLXNpemU6IDIycHg7CiAgICAtLWNoYXJ0LW1pbi1oOiAzNjBweDsKICAgIC0tc2xpZGUtZ2FwOiA0NHB4OwogICAgLS1saXN0LXJvdy1wYWQ6IDIwcHg7CiAgfQoKICAucnMtZGVuc2l0eS1oZWF2eSB7CiAgICAtLXRpdGxlLXNpemU6IDQ2cHg7CiAgICAtLWxlYWQtc2l6ZTogMzFweDsKICAgIC0tYm9keS1zaXplOiAyN3B4OwogICAgLS1saXN0LXNpemU6IDI3cHg7CiAgICAtLXF1b3RlLXNpemU6IDMycHg7CiAgICAtLXRhYmxlLXNpemU6IDIxcHg7CiAgICAtLWNoYXJ0LW1pbi1oOiAzMjBweDsKICAgIC0tc2xpZGUtZ2FwOiAzOHB4OwogICAgLS1saXN0LXJvdy1wYWQ6IDE2cHg7CiAgfQoKICAucnMtZGVuc2l0eS1leHRyZW1lIHsKICAgIC0tdGl0bGUtc2l6ZTogNDFweDsKICAgIC0tbGVhZC1zaXplOiAyOHB4OwogICAgLS1ib2R5LXNpemU6IDI1cHg7CiAgICAtLWxpc3Qtc2l6ZTogMjVweDsKICAgIC0tcXVvdGUtc2l6ZTogMzBweDsKICAgIC0tdGFibGUtc2l6ZTogMjBweDsKICAgIC0tY2hhcnQtbWluLWg6IDMwMHB4OwogICAgLS1zbGlkZS1nYXA6IDMycHg7CiAgICAtLWxpc3Qtcm93LXBhZDogMTNweDsKICB9CgogIC8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogICAgIOWGheWuuemhtemhteeciQogICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqLwogIC5ycy1oZWFkZXIgewogICAgZGlzcGxheTogZmxleDsKICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47CiAgICBnYXA6IDE4cHg7CiAgICBmbGV4LXNocmluazogMDsKICAgIHdpZHRoOiAxMDAlOwogICAgcGFkZGluZzogNThweCB2YXIoLS1zbGlkZS1wYWQteCkgMDsKICAgIHRleHQtYWxpZ246IGxlZnQ7CiAgfQoKICAucnMtZXllYnJvdyB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGdhcDogMTRweDsKICAgIGNvbG9yOiB2YXIoLS1wdi10ZXh0LTMpOwogICAgZm9udC1mYW1pbHk6IHZhcigtLXB2LWZvbnQtbW9ubyk7CiAgICBmb250LXNpemU6IDEzcHg7CiAgICBmb250LXdlaWdodDogNTAwOwogICAgbGV0dGVyLXNwYWNpbmc6IDAuMTRlbTsKICAgIGxpbmUtaGVpZ2h0OiAxOwogICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTsKICB9CgogIC5ycy1leWVicm93LWluZGV4IHsKICAgIGNvbG9yOiB2YXIoLS1wdi1icmFuZCk7CiAgICBmb250LXdlaWdodDogNjAwOwogIH0KCiAgLnJzLWV5ZWJyb3ctcnVsZSB7CiAgICB3aWR0aDogMjhweDsKICAgIGhlaWdodDogMXB4OwogICAgYmFja2dyb3VuZDogdmFyKC0tcHYtbGluZS1zdHJvbmcpOwogIH0KCiAgLnJzLWhlYWRlci10aXRsZSB7CiAgICBtYXgtd2lkdGg6IDE1MDBweDsKICAgIG1hcmdpbjogMCAhaW1wb3J0YW50OwogICAgY29sb3I6IHZhcigtLXB2LWluaykgIWltcG9ydGFudDsKICAgIGZvbnQtc2l6ZTogdmFyKC0tdGl0bGUtc2l6ZSkgIWltcG9ydGFudDsKICAgIGZvbnQtd2VpZ2h0OiA2NTAgIWltcG9ydGFudDsKICAgIGxldHRlci1zcGFjaW5nOiAtMC4wMzhlbSAhaW1wb3J0YW50OwogICAgbGluZS1oZWlnaHQ6IDEuMTYgIWltcG9ydGFudDsKICAgIHRleHQtYWxpZ246IGxlZnQgIWltcG9ydGFudDsKICAgIHRleHQtd3JhcDogYmFsYW5jZTsKICAgIG92ZXJmbG93LXdyYXA6IGJyZWFrLXdvcmQ7CiAgfQoKICAvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KICAgICDlhoXlrrnpobXmraPmlocKICAgICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi8KICAucnMtYm9keSB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgZmxleDogMTsKICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47CiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsKICAgIGdhcDogdmFyKC0tc2xpZGUtZ2FwKTsKICAgIHdpZHRoOiAxMDAlOwogICAgbWluLWhlaWdodDogMDsKICAgIHBhZGRpbmc6IDM2cHggdmFyKC0tc2xpZGUtcGFkLXgpIDM4cHg7CiAgICBvdmVyZmxvdy15OiBhdXRvOwogICAgc2Nyb2xsYmFyLXdpZHRoOiBub25lOwogICAgdGV4dC1hbGlnbjogbGVmdDsKICB9CgogIC5ycy1ib2R5Ojotd2Via2l0LXNjcm9sbGJhciB7CiAgICB3aWR0aDogMDsKICAgIGhlaWdodDogMDsKICB9CgogIC5ycy1ibG9jayB7CiAgICBtaW4td2lkdGg6IDA7CiAgfQoKICAucnMtYm9keS0tbGlzdC1jaGFydCwKICAucnMtYm9keS0tbGVhZC1saXN0LWNoYXJ0LAogIC5ycy1ib2R5LS10ZXh0LWNoYXJ0LAogIC5ycy1ib2R5LS1pbWFnZS1jaGFydCwKICAucnMtYm9keS0tdGFibGUtY2hhcnQsCiAgLnJzLWJvZHktLWltYWdlLXRleHQgewogICAgZGlzcGxheTogZ3JpZDsKICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDEyLCBtaW5tYXgoMCwgMWZyKSk7CiAgICBhbGlnbi1pdGVtczogc3RyZXRjaDsKICAgIGFsaWduLWNvbnRlbnQ6IGNlbnRlcjsKICAgIGdhcDogdmFyKC0tc2xpZGUtZ2FwKTsKICB9CgogIC5ycy1ib2R5LS1saXN0LWNoYXJ0LAogIC5ycy1ib2R5LS10ZXh0LWNoYXJ0LAogIC5ycy1ib2R5LS1pbWFnZS1jaGFydCwKICAucnMtYm9keS0tdGFibGUtY2hhcnQgewogICAgZ3JpZC1hdXRvLXJvd3M6IG1pbm1heCgwLCAxZnIpOwogICAgYWxpZ24tY29udGVudDogc3RyZXRjaDsKICB9CgogIC5ycy1ib2R5LS1sZWFkLWxpc3QtY2hhcnQgewogICAgZ3JpZC10ZW1wbGF0ZS1yb3dzOiBhdXRvIG1pbm1heCgwLCAxZnIpOwogICAgYWxpZ24tY29udGVudDogc3RyZXRjaDsKICB9CgogIC5ycy1ib2R5LS1sZWFkLWxpc3QtY2hhcnQgPiAucnMtYmxvY2stLXRleHQgewogICAgZ3JpZC1jb2x1bW46IDEgLyAtMTsKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBhbGlnbi1pdGVtczogY2VudGVyOwogIH0KCiAgLnJzLWJvZHktLWxlYWQtbGlzdC1jaGFydCAucnMtYmxvY2stLWxpc3QsCiAgLnJzLWJvZHktLWxlYWQtbGlzdC1jaGFydCAucnMtYmxvY2stLWNoYXJ0IHsKICAgIG1pbi1oZWlnaHQ6IDA7CiAgfQoKICAucnMtYm9keS0tbGlzdC1jaGFydCAucnMtYmxvY2stLWxpc3QsCiAgLnJzLWJvZHktLWxpc3QtY2hhcnQgLnJzLWJsb2NrLS1jaGFydCwKICAucnMtYm9keS0tdGV4dC1jaGFydCAucnMtYmxvY2stLXRleHQsCiAgLnJzLWJvZHktLXRleHQtY2hhcnQgLnJzLWJsb2NrLS1jaGFydCwKICAucnMtYm9keS0taW1hZ2UtY2hhcnQgLnJzLWJsb2NrLS1pbWFnZSwKICAucnMtYm9keS0taW1hZ2UtY2hhcnQgLnJzLWJsb2NrLS1jaGFydCwKICAucnMtYm9keS0tdGFibGUtY2hhcnQgLnJzLWJsb2NrLS10YWJsZSwKICAucnMtYm9keS0tdGFibGUtY2hhcnQgLnJzLWJsb2NrLS1jaGFydCB7CiAgICBtaW4taGVpZ2h0OiAwOwogIH0KCiAgLnJzLWJvZHktLWxpc3QtY2hhcnQgLnJzLWJsb2NrLS1jaGFydCwKICAucnMtYm9keS0tbGVhZC1saXN0LWNoYXJ0IC5ycy1ibG9jay0tY2hhcnQsCiAgLnJzLWJvZHktLXRleHQtY2hhcnQgLnJzLWJsb2NrLS1jaGFydCwKICAucnMtYm9keS0taW1hZ2UtY2hhcnQgLnJzLWJsb2NrLS1jaGFydCwKICAucnMtYm9keS0tdGFibGUtY2hhcnQgLnJzLWJsb2NrLS1jaGFydCB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgaGVpZ2h0OiAxMDAlOwogIH0KCiAgLnJzLWJvZHktLWxpc3QtY2hhcnQgLnJzLWJsb2NrLS1saXN0LAogIC5ycy1ib2R5LS1sZWFkLWxpc3QtY2hhcnQgLnJzLWJsb2NrLS1saXN0LAogIC5ycy1ib2R5LS10ZXh0LWNoYXJ0IC5ycy1ibG9jay0tdGV4dCwKICAucnMtYm9keS0taW1hZ2UtdGV4dCAucnMtYmxvY2stLXRleHQgewogICAgZGlzcGxheTogZmxleDsKICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgfQoKICAucnMtYm9keS0tbGVhZC1saXN0LWNoYXJ0IC5ycy1ibG9jay0tbGlzdCB7CiAgICBhbGlnbi1pdGVtczogZmxleC1zdGFydDsKICAgIHBhZGRpbmctdG9wOiA0cHg7CiAgfQoKICAucnMtYm9keS0tc29sby1jaGFydCB7CiAgICBkaXNwbGF5OiBmbGV4OwogIH0KCiAgLnJzLWJvZHktLXNvbG8tY2hhcnQgLnJzLWJsb2NrLS1jaGFydCB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgZmxleDogMTsKICAgIG1pbi1oZWlnaHQ6IDA7CiAgfQoKICAucnMtYm9keS0tc29sby1jaGFydCAucnMtY2hhcnQgewogICAgZmxleDogMTsKICAgIGhlaWdodDogMTAwJTsKICB9CgogIC5ycy1ib2R5LS1zb2xvLWxpc3QgLnJzLWxpc3QsCiAgLnJzLWJvZHktLXN0YWNrIC5ycy1saXN0IHsKICAgIG1heC13aWR0aDogMTE4MHB4OwogIH0KCiAgLnJzLWJvZHktLXNvbG8tbGlzdCAucnMtYmxvY2ssCiAgLnJzLWJvZHktLXN0YWNrIC5ycy1ibG9jayB7CiAgICB3aWR0aDogMTAwJTsKICB9CgogIC5ycy1ib2R5LS1zb2xvLWltYWdlIC5ycy1ibG9jay0taW1hZ2UsCiAgLnJzLWJvZHktLXNvbG8tdGFibGUgLnJzLWJsb2NrLS10YWJsZSB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgZmxleDogMTsKICAgIG1pbi1oZWlnaHQ6IDA7CiAgfQoKICAucnMtYm9keS0tc29sby1pbWFnZSAucnMtZmlndXJlLAogIC5ycy1ib2R5LS1zb2xvLXRhYmxlIC5ycy10YWJsZS13cmFwIHsKICAgIHdpZHRoOiAxMDAlOwogICAgbWF4LWhlaWdodDogMTAwJTsKICB9CgogIC5ycy1jb2wtNCB7CiAgICBncmlkLWNvbHVtbjogc3BhbiA0OwogIH0KCiAgLnJzLWNvbC01IHsKICAgIGdyaWQtY29sdW1uOiBzcGFuIDU7CiAgfQoKICAucnMtY29sLTYgewogICAgZ3JpZC1jb2x1bW46IHNwYW4gNjsKICB9CgogIC5ycy1jb2wtNyB7CiAgICBncmlkLWNvbHVtbjogc3BhbiA3OwogIH0KCiAgLnJzLWNvbC04IHsKICAgIGdyaWQtY29sdW1uOiBzcGFuIDg7CiAgfQoKICAucnMtY29sLTEyIHsKICAgIGdyaWQtY29sdW1uOiBzcGFuIDEyOwogIH0KCiAgLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CiAgICAg5paH5pysCiAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovCiAgLnJzLXRleHQgewogICAgbWF4LXdpZHRoOiAzMWVtOwogICAgbWFyZ2luOiAwICFpbXBvcnRhbnQ7CiAgICBwYWRkaW5nOiAwIDAgMCAyOHB4ICFpbXBvcnRhbnQ7CiAgICBib3JkZXItbGVmdDogM3B4IHNvbGlkIHZhcigtLXB2LWJyYW5kKTsKICAgIGNvbG9yOiB2YXIoLS1wdi10ZXh0LTEpICFpbXBvcnRhbnQ7CiAgICBmb250LXNpemU6IHZhcigtLWxlYWQtc2l6ZSk7CiAgICBmb250LXdlaWdodDogNDAwOwogICAgbGV0dGVyLXNwYWNpbmc6IC0wLjAxNWVtOwogICAgbGluZS1oZWlnaHQ6IDEuNjI7CiAgICB0ZXh0LWFsaWduOiBsZWZ0ICFpbXBvcnRhbnQ7CiAgICB0ZXh0LXdyYXA6IHByZXR0eTsKICAgIG92ZXJmbG93LXdyYXA6IGJyZWFrLXdvcmQ7CiAgfQoKICAucnMtYm9keS0tbGVhZC1saXN0LWNoYXJ0IC5ycy10ZXh0IHsKICAgIG1heC13aWR0aDogNTRlbTsKICAgIHBhZGRpbmctbGVmdDogMjJweCAhaW1wb3J0YW50OwogICAgYm9yZGVyLWxlZnQtd2lkdGg6IDJweDsKICAgIGZvbnQtc2l6ZTogdmFyKC0tYm9keS1zaXplKTsKICAgIGxpbmUtaGVpZ2h0OiAxLjY7CiAgfQoKICAucnMtdGV4dC0tc3RhdGVtZW50IHsKICAgIG1heC13aWR0aDogMjZlbTsKICAgIHBhZGRpbmctbGVmdDogMCAhaW1wb3J0YW50OwogICAgYm9yZGVyLWxlZnQ6IDA7CiAgICBmb250LXNpemU6IGNhbGModmFyKC0tbGVhZC1zaXplKSAqIDEuMSk7CiAgICBmb250LXdlaWdodDogNTAwOwogICAgbGV0dGVyLXNwYWNpbmc6IC0wLjAyNWVtOwogICAgbGluZS1oZWlnaHQ6IDEuNTsKICB9CgogIC8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogICAgIOWIl+ihqO+8mue8luWPtyArIOe7hue6v++8jOW8seWMluKAnOavj+mhueS4gOW8oOWNoeKAneeahOaooeadv+aEnwogICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqLwogIC5ycy1saXN0IHsKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOwogICAgZ2FwOiAwOwogICAgd2lkdGg6IDEwMCU7CiAgICBtYXJnaW46IDAgIWltcG9ydGFudDsKICAgIHBhZGRpbmc6IDAgIWltcG9ydGFudDsKICAgIGxpc3Qtc3R5bGU6IG5vbmUgIWltcG9ydGFudDsKICAgIHRleHQtYWxpZ246IGxlZnQgIWltcG9ydGFudDsKICB9CgogIC5ycy1saXN0LWl0ZW0gewogICAgZGlzcGxheTogZ3JpZDsKICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogNTJweCBtaW5tYXgoMCwgMWZyKTsKICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICBnYXA6IDE4cHg7CiAgICBtYXJnaW46IDAgIWltcG9ydGFudDsKICAgIHBhZGRpbmc6IHZhcigtLWxpc3Qtcm93LXBhZCkgMCAhaW1wb3J0YW50OwogICAgYm9yZGVyLXRvcDogMXB4IHNvbGlkIHZhcigtLXB2LWxpbmUpOwogICAgY29sb3I6IHZhcigtLXB2LXRleHQtMSkgIWltcG9ydGFudDsKICAgIGZvbnQtc2l6ZTogdmFyKC0tbGlzdC1zaXplKTsKICAgIGxpbmUtaGVpZ2h0OiAxLjQ4OwogICAgdGV4dC1hbGlnbjogbGVmdCAhaW1wb3J0YW50OwogIH0KCiAgLnJzLWxpc3QtaXRlbTpmaXJzdC1jaGlsZCB7CiAgICBib3JkZXItdG9wLWNvbG9yOiB2YXIoLS1wdi1saW5lLXN0cm9uZyk7CiAgfQoKICAucnMtbGlzdC1pdGVtOmxhc3QtY2hpbGQgewogICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLXB2LWxpbmUtc3Ryb25nKTsKICB9CgogIC5ycy1saXN0LWluZGV4IHsKICAgIGFsaWduLXNlbGY6IGNlbnRlcjsKICAgIHBhZGRpbmctdG9wOiAwOwogICAgY29sb3I6IHZhcigtLXB2LWJyYW5kKTsKICAgIGZvbnQtZmFtaWx5OiB2YXIoLS1wdi1mb250LW1vbm8pOwogICAgZm9udC1zaXplOiAxNHB4OwogICAgZm9udC13ZWlnaHQ6IDYwMDsKICAgIGxldHRlci1zcGFjaW5nOiAwLjA0ZW07CiAgICBsaW5lLWhlaWdodDogMTsKICB9CgogIC5ycy1saXN0LXRleHQgewogICAgbWluLXdpZHRoOiAwOwogICAgb3ZlcmZsb3ctd3JhcDogYnJlYWstd29yZDsKICB9CgogIC8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogICAgIOWbvuihqO+8muWOu+aOieWOmumHjeWNoeeJh++8jOeUqOKAnOWbvueJiOKAneaJv+aJmOaVsOaNrgogICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqLwogIC5ycy1jaGFydCB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgZmxleDogMTsKICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47CiAgICB3aWR0aDogMTAwJTsKICAgIG1pbi1oZWlnaHQ6IHZhcigtLWNoYXJ0LW1pbi1oKTsKICAgIHBhZGRpbmc6IDMwcHggMzRweCAyNHB4OwogICAgb3ZlcmZsb3c6IGhpZGRlbjsKICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLXB2LWxpbmUpOwogICAgYm9yZGVyLXJhZGl1czogdmFyKC0tcHYtcmFkaXVzLWxnKTsKICAgIGJhY2tncm91bmQ6IHZhcigtLXB2LXN1cmZhY2UpOwogICAgYm94LXNoYWRvdzoKICAgICAgMCAxcHggMnB4IHJnYmEoMTIsIDE3LCAyNiwgMC4wMjUpLAogICAgICAwIDM0cHggNzBweCAtNThweCByZ2JhKDEyLCAxNywgMjYsIDAuMzgpOwogIH0KCiAgLnJzLWJvZHktLWxpc3QtY2hhcnQgLnJzLWNoYXJ0LAogIC5ycy1ib2R5LS1sZWFkLWxpc3QtY2hhcnQgLnJzLWNoYXJ0LAogIC5ycy1ib2R5LS10ZXh0LWNoYXJ0IC5ycy1jaGFydCwKICAucnMtYm9keS0taW1hZ2UtY2hhcnQgLnJzLWNoYXJ0LAogIC5ycy1ib2R5LS10YWJsZS1jaGFydCAucnMtY2hhcnQgewogICAgaGVpZ2h0OiAxMDAlOwogICAgbWluLWhlaWdodDogMDsKICB9CgogIC5ycy1jaGFydC1oZWFkIHsKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOwogICAgZ2FwOiAxOHB4OwogICAgZmxleC1zaHJpbms6IDA7CiAgICBwYWRkaW5nLWJvdHRvbTogMTZweDsKICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS1wdi1saW5lKTsKICB9CgogIC5ycy1jaGFydC1oZWFkaW5nIHsKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAgZ2FwOiAxMXB4OwogICAgbWluLXdpZHRoOiAwOwogIH0KCiAgLnJzLWNoYXJ0LW1hcmsgewogICAgd2lkdGg6IDdweDsKICAgIGhlaWdodDogN3B4OwogICAgZmxleC1zaHJpbms6IDA7CiAgICBib3JkZXItcmFkaXVzOiAycHg7CiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1wdi1icmFuZCk7CiAgfQoKICAucnMtY2hhcnQtdGl0bGUgewogICAgb3ZlcmZsb3c6IGhpZGRlbjsKICAgIGNvbG9yOiB2YXIoLS1wdi1pbmspOwogICAgZm9udC1zaXplOiAyMnB4OwogICAgZm9udC13ZWlnaHQ6IDYwMDsKICAgIGxldHRlci1zcGFjaW5nOiAtMC4wMThlbTsKICAgIGxpbmUtaGVpZ2h0OiAxLjM1OwogICAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7CiAgICB3aGl0ZS1zcGFjZTogbm93cmFwOwogIH0KCiAgLnJzLWNoYXJ0LWZpZyB7CiAgICBmbGV4LXNocmluazogMDsKICAgIGNvbG9yOiB2YXIoLS1wdi10ZXh0LTMpOwogICAgZm9udC1mYW1pbHk6IHZhcigtLXB2LWZvbnQtbW9ubyk7CiAgICBmb250LXNpemU6IDExcHg7CiAgICBmb250LXdlaWdodDogNTAwOwogICAgbGV0dGVyLXNwYWNpbmc6IDAuMTJlbTsKICAgIGxpbmUtaGVpZ2h0OiAxOwogIH0KCiAgLnJzLWNoYXJ0LWhlYWQtcmlnaHQgewogICAgZGlzcGxheTogZmxleDsKICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICBnYXA6IDEycHg7CiAgICBmbGV4LXNocmluazogMDsKICB9CgogIC5ycy1jaGFydC16b29tLXRvb2xzIHsKICAgIGRpc3BsYXk6IGlubGluZS1mbGV4OwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIHBhZGRpbmc6IDJweDsKICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLXB2LWxpbmUpOwogICAgYm9yZGVyLXJhZGl1czogOTk5cHg7CiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1wdi1wYXBlcik7CiAgICBmbGV4LXNocmluazogMDsKICB9CgogIC5ycy1jaGFydC16b29tLWJ0biB7CiAgICBkaXNwbGF5OiBpbmxpbmUtZmxleDsKICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsKICAgIHdpZHRoOiAyNHB4OwogICAgaGVpZ2h0OiAyNHB4OwogICAgcGFkZGluZzogMDsKICAgIGJvcmRlcjogMDsKICAgIGJvcmRlci1yYWRpdXM6IDUwJTsKICAgIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50OwogICAgY29sb3I6IHZhcigtLXB2LXRleHQtMik7CiAgICBmb250LXNpemU6IDE1cHg7CiAgICBsaW5lLWhlaWdodDogMTsKICAgIGN1cnNvcjogcG9pbnRlcjsKICAgIHRyYW5zaXRpb246CiAgICAgIGJhY2tncm91bmQtY29sb3IgMC4xOHMgdmFyKC0tcHYtZWFzZSksCiAgICAgIGNvbG9yIDAuMThzIHZhcigtLXB2LWVhc2UpOwogIH0KCiAgLnJzLWNoYXJ0LXpvb20tYnRuOmhvdmVyOm5vdCg6ZGlzYWJsZWQpIHsKICAgIGJhY2tncm91bmQ6ICNmZmZmZmY7CiAgICBjb2xvcjogdmFyKC0tcHYtYnJhbmQpOwogICAgYm94LXNoYWRvdzogMCAxcHggM3B4IHJnYmEoMTIsIDE3LCAyNiwgMC4wOCk7CiAgfQoKICAucnMtY2hhcnQtem9vbS1idG46ZGlzYWJsZWQgewogICAgb3BhY2l0eTogMC4yODsKICAgIGN1cnNvcjogbm90LWFsbG93ZWQ7CiAgfQoKICAucnMtY2hhcnQtem9vbS12YWx1ZSB7CiAgICBtaW4td2lkdGg6IDQ0cHg7CiAgICBoZWlnaHQ6IDI0cHg7CiAgICBwYWRkaW5nOiAwIDVweDsKICAgIGJvcmRlcjogMDsKICAgIGJvcmRlci1yYWRpdXM6IDk5OXB4OwogICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7CiAgICBjb2xvcjogdmFyKC0tcHYtdGV4dC0yKTsKICAgIGZvbnQtZmFtaWx5OiB2YXIoLS1wdi1mb250LW1vbm8pOwogICAgZm9udC1zaXplOiA5cHg7CiAgICBsZXR0ZXItc3BhY2luZzogMC4wMmVtOwogICAgbGluZS1oZWlnaHQ6IDE7CiAgICBjdXJzb3I6IHBvaW50ZXI7CiAgfQoKICAucnMtY2hhcnQtem9vbS12YWx1ZTpob3ZlciB7CiAgICBjb2xvcjogdmFyKC0tcHYtYnJhbmQpOwogIH0KCiAgLnJzLWNoYXJ0LXpvb20tdG9vbHM6Zm9jdXMtd2l0aGluIHsKICAgIGJvcmRlci1jb2xvcjogcmdiYSgxMSwgOTIsIDI1NSwgMC4zNSk7CiAgfQoKICAucnMtY2hhcnQtem9vbS1idG46Zm9jdXMtdmlzaWJsZSwKICAucnMtY2hhcnQtem9vbS12YWx1ZTpmb2N1cy12aXNpYmxlIHsKICAgIG91dGxpbmU6IDJweCBzb2xpZCByZ2JhKDExLCA5MiwgMjU1LCAwLjUpOwogICAgb3V0bGluZS1vZmZzZXQ6IDFweDsKICB9CgogIC5ycy1jaGFydC1pbm5lciB7CiAgICBwb3NpdGlvbjogcmVsYXRpdmU7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgZmxleDogMTsKICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsKICAgIG1pbi1oZWlnaHQ6IDA7CiAgICBwYWRkaW5nLXRvcDogMTZweDsKICAgIG92ZXJmbG93OiBoaWRkZW47CiAgfQoKICAucnMtY2hhcnQtaW5uZXItLWRpYWdyYW0gewogICAgZGlzcGxheTogZmxleDsKICAgIGZsZXg6IDAgMCBhdXRvOwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOwogICAgd2lkdGg6IDEwMCU7CiAgICBoZWlnaHQ6IGF1dG87CiAgICBtYXgtaGVpZ2h0OiA1NjBweDsKICAgIG1pbi1oZWlnaHQ6IDI2MHB4OwogICAgcGFkZGluZzogMDsKICB9CgogIC5ycy1jaGFydC0tZGlhZ3JhbSB7CiAgICBoZWlnaHQ6IGF1dG87CiAgICBwYWRkaW5nLXRvcDogMjRweDsKICB9CgogIC5ycy1jaGFydC0tZGlhZ3JhbSAucnMtY2hhcnQtaGVhZCB7CiAgICBwYWRkaW5nLWJvdHRvbTogMTJweDsKICB9CgogIC5ycy1ib2R5LS1zb2xvLWNoYXJ0IC5ycy1jaGFydC0tZGlhZ3JhbSB7CiAgICBhbGlnbi1zZWxmOiBjZW50ZXI7CiAgICBmbGV4OiAwIDAgYXV0bzsKICAgIGhlaWdodDogYXV0bzsKICB9CgogIC5ycy1jaGFydC16b29tIHsKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7CiAgICB3aWR0aDogMTAwJTsKICAgIGhlaWdodDogMTAwJTsKICAgIHVzZXItc2VsZWN0OiBub25lOwogICAgLXdlYmtpdC11c2VyLXNlbGVjdDogbm9uZTsKICAgIHRyYW5zZm9ybS1vcmlnaW46IGNlbnRlciBjZW50ZXI7CiAgICB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gMC4xOHMgdmFyKC0tcHYtZWFzZSk7CiAgICB3aWxsLWNoYW5nZTogdHJhbnNmb3JtOwogIH0KCiAgLnJzLWNoYXJ0LXpvb20uaXMtcGFubmluZyB7CiAgICB0cmFuc2l0aW9uOiBub25lOwogIH0KCiAgLnJzLWNoYXJ0LWNhbnZhcyB7CiAgICBkaXNwbGF5OiBibG9jazsKICAgIHdpZHRoOiAxMDAlICFpbXBvcnRhbnQ7CiAgICBoZWlnaHQ6IDEwMCUgIWltcG9ydGFudDsKICB9CgogIC5ycy1jaGFydC1zb3VyY2UgewogICAgZmxleC1zaHJpbms6IDA7CiAgICBtYXJnaW4tdG9wOiAxMnB4OwogICAgY29sb3I6IHZhcigtLXB2LXRleHQtMyk7CiAgICBmb250LXNpemU6IDEycHg7CiAgICBsZXR0ZXItc3BhY2luZzogMC4wMWVtOwogICAgbGluZS1oZWlnaHQ6IDEuNDsKICAgIHRleHQtYWxpZ246IGxlZnQ7CiAgfQoKICAucnMtY2hhcnQtZmFsbGJhY2sgewogICAgZGlzcGxheTogZmxleDsKICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICBnYXA6IDEycHg7CiAgICBjb2xvcjogdmFyKC0tcHYtdGV4dC0yKTsKICAgIGZvbnQtc2l6ZTogMjBweDsKICB9CgogIC5ycy1jaGFydC1mYWxsYmFjay0tb3ZlcmxheSB7CiAgICBwb3NpdGlvbjogYWJzb2x1dGU7CiAgICBpbnNldDogMDsKICAgIHotaW5kZXg6IDI7CiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsKICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC45Mik7CiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7CiAgfQoKICAucnMtY2hhcnQtZmFsbGJhY2stbWFyayB7CiAgICB3aWR0aDogOHB4OwogICAgaGVpZ2h0OiA4cHg7CiAgICBib3JkZXItcmFkaXVzOiAycHg7CiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1wdi1icmFuZCk7CiAgfQoKICAucnMtbWVybWFpZCB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOwogICAgd2lkdGg6IDEwMCU7CiAgICBoZWlnaHQ6IDEwMCU7CiAgICBtaW4taGVpZ2h0OiAwOwogICAgbWFyZ2luOiBhdXRvOwogICAgb3ZlcmZsb3c6IGhpZGRlbjsKICAgIHRleHQtYWxpZ246IGNlbnRlcjsKICB9CgogIC5ycy1tZXJtYWlkIDpkZWVwKHN2ZykgewogICAgZGlzcGxheTogYmxvY2s7CiAgICB3aWR0aDogMTAwJSAhaW1wb3J0YW50OwogICAgbWF4LXdpZHRoOiAxMDAlICFpbXBvcnRhbnQ7CiAgICBoZWlnaHQ6IDEwMCUgIWltcG9ydGFudDsKICAgIG1heC1oZWlnaHQ6IDEwMCUgIWltcG9ydGFudDsKICAgIG1hcmdpbjogYXV0byAhaW1wb3J0YW50OwogIH0KCiAgLnJzLW1lcm1haWQgOmRlZXAoLm5vZGVMYWJlbCksCiAgLnJzLW1lcm1haWQgOmRlZXAoLmVkZ2VMYWJlbCkgewogICAgZm9udC1mYW1pbHk6IHZhcigtLXB2LWZvbnQtc2FucykgIWltcG9ydGFudDsKICB9CgogIC5ycy1tZXJtYWlkIDpkZWVwKC5ub2RlIHJlY3QpLAogIC5ycy1tZXJtYWlkIDpkZWVwKC5ub2RlIGNpcmNsZSksCiAgLnJzLW1lcm1haWQgOmRlZXAoLm5vZGUgcG9seWdvbikgewogICAgc3Ryb2tlLXdpZHRoOiAxLjRweCAhaW1wb3J0YW50OwogIH0KCiAgLnJzLW1lcm1haWQgOmRlZXAoLm5vZGUgcmVjdCkgewogICAgcng6IDhweDsKICAgIHJ5OiA4cHg7CiAgfQoKICAucnMtbWVybWFpZCA6ZGVlcCguZWRnZVBhdGggcGF0aCkgewogICAgc3Ryb2tlOiAjYTZiMmM0ICFpbXBvcnRhbnQ7CiAgICBzdHJva2Utd2lkdGg6IDEuNXB4ICFpbXBvcnRhbnQ7CiAgfQoKICAucnMtbWVybWFpZC1lcnJvciB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOwogICAgd2lkdGg6IDEwMCU7CiAgICBoZWlnaHQ6IDEwMCU7CiAgICBjb2xvcjogdmFyKC0tcHYtdGV4dC0zKTsKICAgIGZvbnQtc2l6ZTogMTZweDsKICB9CgogIC8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogICAgIOWbvueJhwogICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqLwogIC5ycy1maWd1cmUgewogICAgZGlzcGxheTogZmxleDsKICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47CiAgICB3aWR0aDogMTAwJTsKICAgIGhlaWdodDogMTAwJTsKICAgIG1pbi1oZWlnaHQ6IDA7CiAgICBtYXJnaW46IDAgIWltcG9ydGFudDsKICB9CgogIC5ycy1pbWFnZS1ib3ggewogICAgZmxleDogMTsKICAgIG1pbi1oZWlnaHQ6IDA7CiAgICBvdmVyZmxvdzogaGlkZGVuOwogICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tcHYtbGluZSk7CiAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1wdi1yYWRpdXMtbGcpOwogICAgYmFja2dyb3VuZDogdmFyKC0tcHYtc3VyZmFjZSk7CiAgfQoKICAucnMtaW1nIHsKICAgIGRpc3BsYXk6IGJsb2NrOwogICAgd2lkdGg6IDEwMCU7CiAgICBoZWlnaHQ6IDEwMCU7CiAgfQoKICAucnMtZmlndXJlLWNhcHRpb24gewogICAgZmxleC1zaHJpbms6IDA7CiAgICBtYXJnaW4tdG9wOiAxMnB4OwogICAgY29sb3I6IHZhcigtLXB2LXRleHQtMyk7CiAgICBmb250LXNpemU6IDEycHg7CiAgICBsaW5lLWhlaWdodDogMS41OwogICAgdGV4dC1hbGlnbjogbGVmdDsKICB9CgogIC8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogICAgIOW8leeUqAogICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqLwogIC5ycy1xdW90ZSB7CiAgICBwb3NpdGlvbjogcmVsYXRpdmU7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsKICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOwogICAgbWF4LXdpZHRoOiAxMzIwcHg7CiAgICBtYXJnaW46IDAgIWltcG9ydGFudDsKICAgIHBhZGRpbmc6IDQycHggMCA0MnB4IDkycHg7CiAgICBib3JkZXItdG9wOiAxcHggc29saWQgdmFyKC0tcHYtbGluZS1zdHJvbmcpOwogICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLXB2LWxpbmUtc3Ryb25nKTsKICAgIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50OwogICAgdGV4dC1hbGlnbjogbGVmdDsKICB9CgogIC5ycy1xdW90ZS1tYXJrIHsKICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTsKICAgIHRvcDogMjBweDsKICAgIGxlZnQ6IDhweDsKICAgIGNvbG9yOiB2YXIoLS1wdi1icmFuZCk7CiAgICBmb250LWZhbWlseTogR2VvcmdpYSwgIlRpbWVzIE5ldyBSb21hbiIsIHNlcmlmOwogICAgZm9udC1zaXplOiAxMTZweDsKICAgIGxpbmUtaGVpZ2h0OiAxOwogICAgb3BhY2l0eTogMC4xNjsKICB9CgogIC5ycy1xdW90ZS10ZXh0IHsKICAgIG1hcmdpbjogMDsKICAgIGNvbG9yOiB2YXIoLS1wdi1pbmspOwogICAgZm9udC1zaXplOiB2YXIoLS1xdW90ZS1zaXplKTsKICAgIGZvbnQtd2VpZ2h0OiA1MDA7CiAgICBsZXR0ZXItc3BhY2luZzogLTAuMDI1ZW07CiAgICBsaW5lLWhlaWdodDogMS40NjsKICAgIHRleHQtd3JhcDogcHJldHR5OwogIH0KCiAgLnJzLXF1b3RlLWNpdGUgewogICAgbWFyZ2luLXRvcDogMjBweDsKICAgIGNvbG9yOiB2YXIoLS1wdi10ZXh0LTMpOwogICAgZm9udC1zaXplOiAxM3B4OwogICAgZm9udC1zdHlsZTogbm9ybWFsOwogICAgbGV0dGVyLXNwYWNpbmc6IDAuMDJlbTsKICB9CgogIC8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogICAgIOihqOagvAogICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqLwogIC5ycy10YWJsZS13cmFwIHsKICAgIHdpZHRoOiAxMDAlOwogICAgbWF4LWhlaWdodDogMTAwJTsKICAgIG92ZXJmbG93OiBhdXRvOwogICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tcHYtbGluZSk7CiAgICBib3JkZXItcmFkaXVzOiB2YXIoLS1wdi1yYWRpdXMtbGcpOwogICAgYmFja2dyb3VuZDogdmFyKC0tcHYtc3VyZmFjZSk7CiAgICBzY3JvbGxiYXItd2lkdGg6IHRoaW47CiAgfQoKICAucnMtdGFibGUgewogICAgd2lkdGg6IDEwMCU7CiAgICBib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOwogICAgY29sb3I6IHZhcigtLXB2LXRleHQtMSk7CiAgICBmb250LXNpemU6IHZhcigtLXRhYmxlLXNpemUpOwogICAgZm9udC12YXJpYW50LW51bWVyaWM6IHRhYnVsYXItbnVtczsKICAgIHRleHQtYWxpZ246IGxlZnQ7CiAgfQoKICAucnMtdGFibGUgdGggewogICAgcGFkZGluZzogMThweCAyNHB4OwogICAgYm9yZGVyLWJvdHRvbTogMnB4IHNvbGlkIHZhcigtLXB2LWluayk7CiAgICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDsKICAgIGNvbG9yOiB2YXIoLS1wdi10ZXh0LTMpOwogICAgZm9udC1zaXplOiAxM3B4OwogICAgZm9udC13ZWlnaHQ6IDYwMDsKICAgIGxldHRlci1zcGFjaW5nOiAwLjA2ZW07CiAgICBsaW5lLWhlaWdodDogMS4zOwogICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTsKICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7CiAgfQoKICAucnMtdGFibGUgdGQgewogICAgcGFkZGluZzogMTdweCAyNHB4OwogICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLXB2LWxpbmUpOwogICAgY29sb3I6IHZhcigtLXB2LXRleHQtMSk7CiAgICBsaW5lLWhlaWdodDogMS40OwogICAgdmVydGljYWwtYWxpZ246IHRvcDsKICB9CgogIC5ycy10YWJsZSB0Ym9keSB0cjpsYXN0LWNoaWxkIHRkIHsKICAgIGJvcmRlci1ib3R0b206IDA7CiAgfQoKICAucnMtdGFibGUgdGJvZHkgdHI6aG92ZXIgewogICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7CiAgfQoKICAucnMtdGFibGUtc291cmNlIHsKICAgIG1hcmdpbjogMDsKICAgIHBhZGRpbmc6IDEycHggMjRweCAxNHB4OwogICAgYm9yZGVyLXRvcDogMXB4IHNvbGlkIHZhcigtLXB2LWxpbmUpOwogICAgY29sb3I6IHZhcigtLXB2LXRleHQtMyk7CiAgICBmb250LXNpemU6IDExcHg7CiAgICBsaW5lLWhlaWdodDogMS40OwogIH0KCiAgLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CiAgICAg6aG16ISaCiAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovCiAgLnJzLWZvb3RlciB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsKICAgIGdhcDogMjBweDsKICAgIGZsZXgtc2hyaW5rOiAwOwogICAgaGVpZ2h0OiA2NHB4OwogICAgcGFkZGluZzogMCB2YXIoLS1zbGlkZS1wYWQteCk7CiAgICBib3JkZXItdG9wOiAxcHggc29saWQgdmFyKC0tcHYtbGluZSk7CiAgICBjb2xvcjogdmFyKC0tcHYtdGV4dC0zKTsKICAgIGZvbnQtc2l6ZTogMTNweDsKICAgIGxldHRlci1zcGFjaW5nOiAwLjAzZW07CiAgICBsaW5lLWhlaWdodDogMS40OwogICAgdGV4dC1hbGlnbjogbGVmdDsKICB9CgogIC5ycy1mb290ZXItYnJhbmQgewogICAgZGlzcGxheTogZmxleDsKICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICBnYXA6IDlweDsKICAgIG1pbi13aWR0aDogMDsKICAgIG92ZXJmbG93OiBoaWRkZW47CiAgICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpczsKICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7CiAgfQoKICAucnMtZm9vdGVyLW1hcmsgewogICAgd2lkdGg6IDVweDsKICAgIGhlaWdodDogNXB4OwogICAgZmxleC1zaHJpbms6IDA7CiAgICBib3JkZXItcmFkaXVzOiAxcHg7CiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1wdi1icmFuZCk7CiAgfQoKICAucnMtZm9vdGVyLXBhZ2UgewogICAgZmxleC1zaHJpbms6IDA7CiAgICBjb2xvcjogdmFyKC0tcHYtdGV4dC0zKTsKICAgIGZvbnQtZmFtaWx5OiB2YXIoLS1wdi1mb250LW1vbm8pOwogICAgZm9udC1zaXplOiAxMXB4OwogICAgbGV0dGVyLXNwYWNpbmc6IDAuMDhlbTsKICAgIGxpbmUtaGVpZ2h0OiAxOwogIH0KCiAgLnJzLWZvb3Rlci1wYWdlIGIgewogICAgY29sb3I6IHZhcigtLXB2LWluayk7CiAgICBmb250LXdlaWdodDogNjAwOwogIH0KCiAgLnJzLWZvb3Rlci1wYWdlIHNwYW4gewogICAgbWFyZ2luLWxlZnQ6IDRweDsKICAgIGNvbG9yOiB2YXIoLS1wdi10ZXh0LTMpOwogIH0KCiAgLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CiAgICAg5bCB6Z2iCiAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovCiAgLnJzLXNsaWRlLS1jb3ZlciB7CiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1wdi1kYXJrKSAhaW1wb3J0YW50OwogICAgY29sb3I6ICNmZmZmZmY7CiAgfQoKICAucnMtY292ZXItYmcgewogICAgcG9zaXRpb246IGFic29sdXRlOwogICAgaW5zZXQ6IDA7CiAgICBvdmVyZmxvdzogaGlkZGVuOwogICAgcG9pbnRlci1ldmVudHM6IG5vbmU7CiAgfQoKICAucnMtY292ZXItZ3JpZCB7CiAgICBwb3NpdGlvbjogYWJzb2x1dGU7CiAgICBpbnNldDogMDsKICAgIGJhY2tncm91bmQtaW1hZ2U6CiAgICAgIGxpbmVhci1ncmFkaWVudChyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDM1KSAxcHgsIHRyYW5zcGFyZW50IDFweCksCiAgICAgIGxpbmVhci1ncmFkaWVudCg5MGRlZywgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzNSkgMXB4LCB0cmFuc3BhcmVudCAxcHgpOwogICAgYmFja2dyb3VuZC1zaXplOiA4OHB4IDg4cHg7CiAgICAtd2Via2l0LW1hc2staW1hZ2U6IHJhZGlhbC1ncmFkaWVudCgKICAgICAgZWxsaXBzZSBhdCA3NCUgNDIlLAogICAgICAjMDAwIDAlLAogICAgICB0cmFuc3BhcmVudCA3NCUKICAgICk7CiAgICBtYXNrLWltYWdlOiByYWRpYWwtZ3JhZGllbnQoZWxsaXBzZSBhdCA3NCUgNDIlLCAjMDAwIDAlLCB0cmFuc3BhcmVudCA3NCUpOwogIH0KCiAgLnJzLWNvdmVyLWdsb3cgewogICAgcG9zaXRpb246IGFic29sdXRlOwogICAgdG9wOiAtMjgwcHg7CiAgICByaWdodDogLTE4MHB4OwogICAgd2lkdGg6IDkwMHB4OwogICAgaGVpZ2h0OiA5MDBweDsKICAgIGJvcmRlci1yYWRpdXM6IDUwJTsKICAgIGJhY2tncm91bmQ6IHJhZGlhbC1ncmFkaWVudCgKICAgICAgY2lyY2xlLAogICAgICByZ2JhKDExLCA5MiwgMjU1LCAwLjM0KSAwJSwKICAgICAgcmdiYSgxMSwgOTIsIDI1NSwgMC4wOCkgMzglLAogICAgICB0cmFuc3BhcmVudCA2OCUKICAgICk7CiAgICBmaWx0ZXI6IGJsdXIoMTRweCk7CiAgfQoKICAucnMtY292ZXItYXhpcyB7CiAgICBwb3NpdGlvbjogYWJzb2x1dGU7CiAgICB0b3A6IDA7CiAgICByaWdodDogMDsKICAgIGJvdHRvbTogMDsKICAgIHdpZHRoOiAzOCU7CiAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoOTBkZWcsIHRyYW5zcGFyZW50LCByZ2JhKDExLCA5MiwgMjU1LCAwLjAzNSkpOwogIH0KCiAgLnJzLWNvdmVyLXJpbmcgewogICAgcG9zaXRpb246IGFic29sdXRlOwogICAgdG9wOiA1MCU7CiAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDEzMywgMTY4LCAyNTUsIDAuMTQpOwogICAgYm9yZGVyLXJhZGl1czogNTAlOwogICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC01MCUpOwogIH0KCiAgLnJzLWNvdmVyLXJpbmctLTEgewogICAgcmlnaHQ6IC04MHB4OwogICAgd2lkdGg6IDcyMHB4OwogICAgaGVpZ2h0OiA3MjBweDsKICB9CgogIC5ycy1jb3Zlci1yaW5nLS0yIHsKICAgIHJpZ2h0OiAtMjEycHg7CiAgICB3aWR0aDogOTgwcHg7CiAgICBoZWlnaHQ6IDk4MHB4OwogICAgYm9yZGVyLWNvbG9yOiByZ2JhKDEzMywgMTY4LCAyNTUsIDAuMDc1KTsKICB9CgogIC5ycy1jb3Zlci1mcmFtZSB7CiAgICBwb3NpdGlvbjogcmVsYXRpdmU7CiAgICB6LWluZGV4OiAxOwogICAgZGlzcGxheTogZmxleDsKICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47CiAgICB3aWR0aDogMTAwJTsKICAgIGhlaWdodDogMTAwJTsKICAgIHBhZGRpbmc6IDYycHggOTZweCA1NHB4OwogICAgdGV4dC1hbGlnbjogbGVmdDsKICB9CgogIC5ycy1jb3Zlci10b3AgewogICAgZGlzcGxheTogZmxleDsKICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47CiAgICBnYXA6IDI0cHg7CiAgICBjb2xvcjogIzdkODlhMDsKICAgIGZvbnQtZmFtaWx5OiB2YXIoLS1wdi1mb250LW1vbm8pOwogICAgZm9udC1zaXplOiAxMXB4OwogICAgZm9udC13ZWlnaHQ6IDUwMDsKICAgIGxldHRlci1zcGFjaW5nOiAwLjE2ZW07CiAgICBsaW5lLWhlaWdodDogMTsKICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7CiAgfQoKICAucnMtY292ZXItbWFyayB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGdhcDogMTBweDsKICB9CgogIC5ycy1jb3Zlci1tYXJrIHNwYW4gewogICAgd2lkdGg6IDhweDsKICAgIGhlaWdodDogOHB4OwogICAgYmFja2dyb3VuZDogdmFyKC0tcHYtYnJhbmQpOwogICAgYm9yZGVyLXJhZGl1czogMXB4OwogIH0KCiAgLnJzLWNvdmVyLWRlY2sgewogICAgbWF4LXdpZHRoOiA1MiU7CiAgICBvdmVyZmxvdzogaGlkZGVuOwogICAgY29sb3I6ICM2ZjdjOTE7CiAgICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpczsKICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7CiAgfQoKICAucnMtY292ZXItbWFpbiB7CiAgICBtYXgtd2lkdGg6IDEyODBweDsKICAgIG1hcmdpbjogYXV0byAwOwogIH0KCiAgLnJzLWNvdmVyLWtpY2tlciB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGdhcDogMTVweDsKICAgIG1hcmdpbi1ib3R0b206IDMwcHg7CiAgICBjb2xvcjogIzhkOWNiNDsKICAgIGZvbnQtZmFtaWx5OiB2YXIoLS1wdi1mb250LW1vbm8pOwogICAgZm9udC1zaXplOiAxM3B4OwogICAgZm9udC13ZWlnaHQ6IDUwMDsKICAgIGxldHRlci1zcGFjaW5nOiAwLjE3ZW07CiAgICBsaW5lLWhlaWdodDogMTsKICB9CgogIC5ycy1jb3Zlci1raWNrZXItbGluZSB7CiAgICB3aWR0aDogNTRweDsKICAgIGhlaWdodDogMXB4OwogICAgYmFja2dyb3VuZDogdmFyKC0tcHYtYnJhbmQpOwogIH0KCiAgLnJzLWNvdmVyLWtpY2tlci1ubyB7CiAgICBjb2xvcjogIzVmNmQ4MjsKICB9CgogIC5ycy1jb3Zlci10aXRsZSB7CiAgICBtYXgtd2lkdGg6IDEyMDBweDsKICAgIG1hcmdpbjogMCAwIDMycHggIWltcG9ydGFudDsKICAgIGNvbG9yOiAjZjhmYWZjICFpbXBvcnRhbnQ7CiAgICBmb250LXNpemU6IDk2cHggIWltcG9ydGFudDsKICAgIGZvbnQtd2VpZ2h0OiA2NTAgIWltcG9ydGFudDsKICAgIGxldHRlci1zcGFjaW5nOiAtMC4wNTJlbSAhaW1wb3J0YW50OwogICAgbGluZS1oZWlnaHQ6IDEuMDQgIWltcG9ydGFudDsKICAgIHRleHQtYWxpZ246IGxlZnQgIWltcG9ydGFudDsKICAgIHRleHQtd3JhcDogYmFsYW5jZTsKICAgIG92ZXJmbG93LXdyYXA6IGJyZWFrLXdvcmQ7CiAgfQoKICAucnMtY292ZXItc3VidGl0bGUgKyAucnMtY292ZXItc3VidGl0bGUgewogICAgbWFyZ2luLXRvcDogMTBweDsKICB9CgogIC5ycy1jb3Zlci1zdWJ0aXRsZSB7CiAgICBtYXgtd2lkdGg6IDc4MHB4OwogICAgbWFyZ2luOiAwOwogICAgY29sb3I6ICNhNmIyYzQ7CiAgICBmb250LXNpemU6IDI5cHg7CiAgICBmb250LXdlaWdodDogNDAwOwogICAgbGV0dGVyLXNwYWNpbmc6IC0wLjAxMmVtOwogICAgbGluZS1oZWlnaHQ6IDEuNTg7CiAgICB0ZXh0LWFsaWduOiBsZWZ0OwogIH0KCiAgLnJzLWNvdmVyLWZvb3QgewogICAgZGlzcGxheTogZmxleDsKICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47CiAgICBnYXA6IDI0cHg7CiAgICBwYWRkaW5nLXRvcDogMjRweDsKICAgIGJvcmRlci10b3A6IDFweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMTIpOwogICAgY29sb3I6ICM3ZDg5YTA7CiAgICBmb250LXNpemU6IDEycHg7CiAgICBsZXR0ZXItc3BhY2luZzogMC4wNWVtOwogICAgbGluZS1oZWlnaHQ6IDE7CiAgfQoKICAucnMtY292ZXItcHJlc2VudGVyIHsKICAgIGRpc3BsYXk6IGZsZXg7CiAgICBhbGlnbi1pdGVtczogY2VudGVyOwogICAgZ2FwOiAxMnB4OwogIH0KCiAgLnJzLWNvdmVyLWF2YXRhciB7CiAgICBkaXNwbGF5OiBmbGV4OwogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOwogICAgd2lkdGg6IDMwcHg7CiAgICBoZWlnaHQ6IDMwcHg7CiAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMTQpOwogICAgYm9yZGVyLXJhZGl1czogNTAlOwogICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA3KTsKICAgIGNvbG9yOiAjZGJlNGYzOwogICAgZm9udC1zaXplOiAxMXB4OwogICAgbGV0dGVyLXNwYWNpbmc6IDA7CiAgfQoKICAucnMtY292ZXItcGFnZSB7CiAgICBjb2xvcjogIzZmN2M5MTsKICAgIGZvbnQtZmFtaWx5OiB2YXIoLS1wdi1mb250LW1vbm8pOwogICAgZm9udC1zaXplOiAxMXB4OwogICAgbGV0dGVyLXNwYWNpbmc6IDAuMDhlbTsKICB9CgogIC8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogICAgIOWFpeWcuuWKqOeUuwogICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqLwogIC5ycy1hbmltLXRhcmdldCB7CiAgICBvcGFjaXR5OiAxOwogICAgdHJhbnNmb3JtOiBub25lOwogICAgd2lsbC1jaGFuZ2U6IG9wYWNpdHksIHRyYW5zZm9ybTsKICB9CgogIC5ycy1zbGlkZS5ycy1hbmltLWZhbGxiYWNrIC5ycy1hbmltLXRhcmdldCB7CiAgICBvcGFjaXR5OiAxICFpbXBvcnRhbnQ7CiAgICB0cmFuc2Zvcm06IG5vbmUgIWltcG9ydGFudDsKICAgIGFuaW1hdGlvbjogbm9uZSAhaW1wb3J0YW50OwogIH0KCiAgLnJzLXNsaWRlLnJzLWFuaW0tYWN0aXZlIC5ycy1hbmltLXRhcmdldC5ycy1hbmltLWZhZGUtdXAgewogICAgYW5pbWF0aW9uOiBycy1mYWRlLXVwIDAuNjVzIHZhcigtLXB2LWVhc2UpIHZhcigtLWFuaW0tZGVsYXksIDBtcykgYm90aDsKICB9CgogIC5ycy1zbGlkZS5ycy1hbmltLWFjdGl2ZSAucnMtYW5pbS10YXJnZXQucnMtYW5pbS1zbGlkZS1kb3duIHsKICAgIGFuaW1hdGlvbjogcnMtc2xpZGUtZG93biAwLjU1cyB2YXIoLS1wdi1lYXNlKSB2YXIoLS1hbmltLWRlbGF5LCAwbXMpIGJvdGg7CiAgfQoKICAucnMtc2xpZGUucnMtYW5pbS1hY3RpdmUgLnJzLWFuaW0tdGFyZ2V0LnJzLWFuaW0tc2NhbGUtaW4gewogICAgYW5pbWF0aW9uOiBycy1zY2FsZS1pbiAwLjZzIHZhcigtLXB2LWVhc2UpIHZhcigtLWFuaW0tZGVsYXksIDBtcykgYm90aDsKICB9CgogIC5ycy1zbGlkZS5ycy1hbmltLWFjdGl2ZSAucnMtYW5pbS10YXJnZXQucnMtYW5pbS1mYWRlLWluIHsKICAgIGFuaW1hdGlvbjogcnMtZmFkZS1pbiAwLjVzIGVhc2UgdmFyKC0tYW5pbS1kZWxheSwgMG1zKSBib3RoOwogIH0KCiAgQGtleWZyYW1lcyBycy1mYWRlLXVwIHsKICAgIGZyb20gewogICAgICBvcGFjaXR5OiAwOwogICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMTRweCk7CiAgICB9CiAgICB0byB7CiAgICAgIG9wYWNpdHk6IDE7CiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTsKICAgIH0KICB9CgogIEBrZXlmcmFtZXMgcnMtc2xpZGUtZG93biB7CiAgICBmcm9tIHsKICAgICAgb3BhY2l0eTogMDsKICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0xMHB4KTsKICAgIH0KICAgIHRvIHsKICAgICAgb3BhY2l0eTogMTsKICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApOwogICAgfQogIH0KCiAgQGtleWZyYW1lcyBycy1zY2FsZS1pbiB7CiAgICBmcm9tIHsKICAgICAgb3BhY2l0eTogMDsKICAgICAgdHJhbnNmb3JtOiBzY2FsZSgwLjk3KTsKICAgIH0KICAgIHRvIHsKICAgICAgb3BhY2l0eTogMTsKICAgICAgdHJhbnNmb3JtOiBzY2FsZSgxKTsKICAgIH0KICB9CgogIEBrZXlmcmFtZXMgcnMtZmFkZS1pbiB7CiAgICBmcm9tIHsKICAgICAgb3BhY2l0eTogMDsKICAgIH0KICAgIHRvIHsKICAgICAgb3BhY2l0eTogMTsKICAgIH0KICB9CgogIC8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQogICAgIOWTjeW6lOW8jwogICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqLwogIEBtZWRpYSAobWF4LXdpZHRoOiAxMDgwcHgpIHsKICAgIC5wdi1ncmlkIHsKICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoMiwgbWlubWF4KDAsIDFmcikpOwogICAgfQogIH0KCiAgQG1lZGlhIChtYXgtd2lkdGg6IDcyMHB4KSB7CiAgICAucHYtcm9vdCB7CiAgICAgIHBhZGRpbmc6IDIwcHggMTZweCAyNnB4OwogICAgfQoKICAgIC5wdi1oZWFkZXIgewogICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOwogICAgICBhbGlnbi1pdGVtczogZmxleC1zdGFydDsKICAgICAgZ2FwOiAyNHB4OwogICAgICBwYWRkaW5nLWJvdHRvbTogMjhweDsKICAgIH0KCiAgICAucHYtdGl0bGUgewogICAgICBmb250LXNpemU6IGNsYW1wKDMwcHgsIDl2dywgNDJweCk7CiAgICB9CgogICAgLnB2LXN1YnRpdGxlIHsKICAgICAgZmxleC13cmFwOiB3cmFwOwogICAgICBnYXA6IDhweDsKICAgICAgZm9udC1zaXplOiAxMnB4OwogICAgfQoKICAgIC5wdi1wbGF5LWJ0biB7CiAgICAgIHdpZHRoOiAxMDAlOwogICAgfQoKICAgIC5wdi1ncmlkIHsKICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiBtaW5tYXgoMCwgMWZyKTsKICAgICAgZ2FwOiAyNHB4OwogICAgfQoKICAgIC5wdi10aHVtYiB7CiAgICAgIHBhZGRpbmc6IDE2cHggMTdweCAxM3B4OwogICAgfQoKICAgIC5wdi10aHVtYi1jb3ZlciB7CiAgICAgIHBhZGRpbmc6IDE3cHggMThweCAxM3B4OwogICAgfQoKICAgIC5wdi10aHVtYi1jb3Zlci10aXRsZSB7CiAgICAgIG1heC13aWR0aDogOTIlOwogICAgICBmb250LXNpemU6IDIycHg7CiAgICB9CgogICAgLnB2LXRodW1iLWNvdmVyLXN1YnRpdGxlIHsKICAgICAgbWF4LXdpZHRoOiA3OCU7CiAgICB9CgogICAgLnB2LWZvb3RlciB7CiAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47CiAgICAgIGdhcDogNXB4OwogICAgICBtYXJnaW4tdG9wOiAyNnB4OwogICAgfQoKICAgIC5wdi10b29sYmFyIHsKICAgICAgdG9wOiAxMnB4OwogICAgICBwYWRkaW5nOiA0cHg7CiAgICB9CgogICAgLnB2LXRvb2wtYnRuIHsKICAgICAgd2lkdGg6IDMycHg7CiAgICAgIGhlaWdodDogMzJweDsKICAgIH0KCiAgICAucHYtZXhpdC1idG4gewogICAgICBoZWlnaHQ6IDMycHg7CiAgICAgIHBhZGRpbmc6IDAgOXB4OwogICAgfQoKICAgIC5wdi1leGl0LWJ0biA+IHNwYW4gewogICAgICBkaXNwbGF5OiBub25lOwogICAgfQoKICAgIC5wdi1leHBvcnQtbGFiZWwgewogICAgICBkaXNwbGF5OiBub25lOwogICAgfQoKICAgIC5wdi1leHBvcnQtYnRuIHsKICAgICAgd2lkdGg6IDMycHg7CiAgICAgIHBhZGRpbmc6IDA7CiAgICB9CgogICAgLnB2LWNvdW50ZXIgewogICAgICBtaW4td2lkdGg6IDQ0cHg7CiAgICAgIHBhZGRpbmc6IDAgNXB4OwogICAgfQogIH0KCiAgQG1lZGlhIChtYXgtd2lkdGg6IDcyMHB4KSBhbmQgKG9yaWVudGF0aW9uOiBwb3J0cmFpdCkgewogICAgLnB2LXJvdGF0ZS1oaW50IHsKICAgICAgcG9zaXRpb246IGFic29sdXRlOwogICAgICByaWdodDogNTAlOwogICAgICBib3R0b206IDE4cHg7CiAgICAgIHotaW5kZXg6IDMyOwogICAgICBkaXNwbGF5OiBibG9jazsKICAgICAgcGFkZGluZzogN3B4IDEycHg7CiAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xMik7CiAgICAgIGJvcmRlci1yYWRpdXM6IDk5OXB4OwogICAgICBiYWNrZ3JvdW5kOiByZ2JhKDEyLCAxNiwgMjMsIDAuNyk7CiAgICAgIGNvbG9yOiAjYjljNGQ0OwogICAgICBmb250LWZhbWlseTogdmFyKC0tcHYtZm9udC1tb25vKTsKICAgICAgZm9udC1zaXplOiA5cHg7CiAgICAgIGxldHRlci1zcGFjaW5nOiAwLjA4ZW07CiAgICAgIGxpbmUtaGVpZ2h0OiAxOwogICAgICB3aGl0ZS1zcGFjZTogbm93cmFwOwogICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoNTAlKTsKICAgICAgYmFja2Ryb3AtZmlsdGVyOiBibHVyKDEycHgpOwogICAgICAtd2Via2l0LWJhY2tkcm9wLWZpbHRlcjogYmx1cigxMnB4KTsKICAgIH0KICB9CgogIEBtZWRpYSAocHJlZmVycy1yZWR1Y2VkLW1vdGlvbjogcmVkdWNlKSB7CiAgICAucnMtYW5pbS10YXJnZXQgewogICAgICBvcGFjaXR5OiAxICFpbXBvcnRhbnQ7CiAgICAgIHRyYW5zZm9ybTogbm9uZSAhaW1wb3J0YW50OwogICAgICBhbmltYXRpb246IG5vbmUgIWltcG9ydGFudDsKICAgIH0KCiAgICAucHYtdGh1bWIsCiAgICAucHYtcGxheS1idG4sCiAgICAucHYtdG9vbGJhciwKICAgIC5wdi1wcm9ncmVzcyBzcGFuIHsKICAgICAgdHJhbnNpdGlvbjogbm9uZSAhaW1wb3J0YW50OwogICAgfQoKICAgIC5wdi1jYXJkOmhvdmVyIC5wdi10aHVtYiB7CiAgICAgIHRyYW5zZm9ybTogbm9uZTsKICAgIH0KICB9Cjwvc3R5bGU+Cg=="
									}
								},
      exampleList: [{"name":"季度业务汇报","description":"输入季度工作要点，输出结构化的演示文稿 JSON。","icon":"📈"},{"name":"技术方案分享","description":"输入技术架构演进逻辑，输出技术演讲幻灯片结构。","icon":"💻"},{"name":"产品发布演示","description":"输入产品功能亮点与市场价值，输出发布会演示结构。","icon":"🚀"}],
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
          url: webCpu.documentPrefix + "/user/sendFeedback",
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
          template: webCpu.documentPrefix + "/transweb/diffCheckApp.vue",
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
      let ret =
        Object.keys(json || {}).sort().join(",") ===
        Object.keys(data || {}).sort().join(",");
      return ret;
    },"onFileSelected":async function (event) {
      const file = event.target.files[0];
      if (!file) return;
      this.readingFile = true;
      let arr = file.name.split(".");
      let subfix = arr[arr.length - 1];

      if (subfix !== "html" && subfix !== "txt" && subfix !== "md") {
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
      let url = location.origin + "/skill.html?solo=true&dataView=true&dataId=" + dataId + "&id=" + documentId;
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
      let name = params.name || params.title || "未命名内容";
      if (!/\.md$/i.test(name)) {
        name += ".md";
      }
      WebTool.downloadString(md, name);
    },"downloadHtmlItem":function (params) {
      let adapter = webCpu.initAdapter({
        getTemplate: {
          url: webCpu.documentPrefix + "/transweb/components/ElementVueItem/example.html",
          method: "get",
          dataType: "text",
        },
      });
      adapter.getTemplate({}, (html) => {
        let documentId =
          this.query.documentId ||
          webCpu.currentCard.task.vueItem.documentMeta.documentId;
        let name = params.name || params.title || "未命名应用";

        // example.html 会把数据直接拼进 <script> 里：
        //   template: `{{template}}`  → JS 模板字符串
        //   accountData: {{content}}  → JS 对象字面量
        // 内容中只要出现 script 结束标签或 HTML 注释起始符，HTML 解析器就会提前结束脚本块；
        // 出现反引号 / ${ 则会截断模板字符串。这里按上下文分别转义。
        let escapeHtmlText = function (value) {
          return String(value === undefined || value === null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        };
        let escapeHtmlAttr = function (value) {
          return escapeHtmlText(value).replace(/"/g, "&quot;");
        };

        let content = params.content;
        if (typeof content !== "string") {
          content = JSON.stringify(content === undefined ? {} : content);
        }
        // JSON 里的 < 统一转成 \u003c：脚本块不会被提前闭合，运行时解析后仍是原来的 <
        let safeContent = content
          .replace(/</g, "\\u003c")
          .replace(/\u2028/g, "\\u2028")
          .replace(/\u2029/g, "\\u2029");

        let template =
          typeof params.template === "string" ? params.template : "";
        // 先转义反斜杠，再处理反引号 / ${ / <，保证运行时拿到的模板与原始内容一致
        let safeTemplate = template
          .replace(/\\/g, "\\\\")
          .replace(/`/g, "\\`")
          .replace(/\$\{/g, "\\${")
          .replace(/</g, "\\u003c");

        let exportParams = Object.assign({}, params, {
          name: escapeHtmlText(name),
          content: safeContent,
          template: safeTemplate,
          agentName: escapeHtmlText(document.title),
          creator: escapeHtmlText(
            webCpu.currentCard.task.vueItem.currentSettings.creator ||
              "匿名用户"
          ),
          createTime: escapeHtmlText(new Date().toLocaleString()),
          userName: escapeHtmlText(localStorage.userName || "匿名用户"),
          agentUrl: escapeHtmlAttr(
            location.origin + "/skill.html?solo=true&id=" + documentId
          ),
        });

        html = html.bindData(exportParams);
        name = name + ".html";
        WebTool.downloadString(html, name, "text/html");
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
