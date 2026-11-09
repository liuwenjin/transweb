<template>
  <div class="loginRegItemArea">
    <!-- 顶部标题 -->
    <div class="loginHeader">
      <span class="loginTitle">{{
        isIframe ? t("login.titleVerify") : t("login.titleLogin")
      }}</span>
    </div>

    <!-- 登录方式锚点：保留单一面板供外部逻辑读取 .nav-link.active / #numberLogin（始终隐藏，
         移除后验证码登录逻辑将失效，故不可删除） -->
    <ul class="nav nav-tabs loginModeTabs" id="pills-tab" role="tablist">
      <li class="nav-item" role="presentation">
        <a
          class="nav-link active"
          id="numberLogin-tab"
          data-toggle="pill"
          href="#numberLogin"
          role="tab"
          aria-controls="numberLogin"
          aria-selected="true"
          >{{ t("codeLogin") }}</a
        >
      </li>
    </ul>

    <div class="tab-content" id="pills-tabContent">
      <!-- ───────── 验证码登录 ───────── -->
      <div
        class="tab-pane fade show active"
        id="numberLogin"
        role="tabpanel"
        aria-labelledby="numberLogin-tab"
      >
        <div class="loginRegInput">
          <div class="fieldControl">
            <svg
              class="fieldIcon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path
                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
              />
            </svg>
            <input
              id="loginPhone"
              class="mobileInput"
              type="tel"
              :placeholder="t('phonePlaceholder')"
              :aria-label="t('phonePlaceholder')"
              aria-describedby="loginPhoneError"
              autocomplete="tel"
              inputmode="tel"
              maxlength="30"
              spellcheck="false"
              enterkeyhint="next"
              required
            />
          </div>
          <div class="text-danger" id="loginPhoneError" role="alert">
            {{ t("phoneErrorTips") }}
          </div>
        </div>

        <div class="loginRegInput integratedInput">
          <div class="fieldControl">
            <svg
              class="fieldIcon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              />
            </svg>
            <input
              id="loginCode"
              class="numberInput"
              type="text"
              :placeholder="t('codePlaceholder')"
              :aria-label="t('codePlaceholder')"
              aria-describedby="loginCodeError"
              inputmode="numeric"
              autocomplete="one-time-code"
              autocapitalize="off"
              maxlength="6"
              spellcheck="false"
              enterkeyhint="done"
              required
            />
            <el-button round type="primary" class="getCodeBtn">{{
              t("getCodeTips")
            }}</el-button>
            <label class="gettingCodetips" aria-live="polite"
              ><span class="countTimerSpan"></span>s
              {{ t("waitCodeTips") }}</label
            >
          </div>
          <div class="text-danger" id="loginCodeError" role="alert">
            {{ t("codeErrorTips") }}
          </div>
        </div>

        <p class="agreementArea">
          <span class="agreeCheck">
            <input
              id="loginAgree"
              v-model="agreementChecked"
              type="checkbox"
              class="agreeInput"
            />
            <label class="agreeLabel" for="loginAgree">{{ t("login.agree") }}</label>
          </span>
          <button type="button" class="btn btn-sm btn-link agreementLink">
            {{ t("agreementButton") }}
          </button>
          <span v-if="!agreementChecked" class="agreeHint"
            >{{ t("login.agreeHint") }}</span
          >
        </p>

        <div class="confirmBtnArea">
          <el-button
            type="success"
            round
            :loading="isLogining"
            :disabled="isLogining"
            class="confirmBtn"
          >
            {{ isIframe ? t("login.confirm") : t("confirmBtn") }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isLogining: false,
      isIframe: window.parent !== window,
      agreementChecked: false,
      // 当前语言：由父页面 creator.html 的 window.__APP_LANG__ / applangchange 驱动
      lang: window.__APP_LANG__ === "en" ? "en" : "zh",
    };
  },
  mounted() {
    window.addEventListener("applangchange", this.onLangChange);
  },
  beforeUnmount() {
    window.removeEventListener("applangchange", this.onLangChange);
  },
  methods: {
    // 文案翻译：优先读取父页面 creator.html 注入的全局词表（单一数据源）
    t(key, vars) {
      const i18n = window.__I18N__ || {};
      const dict = i18n[this.lang] || i18n.zh || {};
      let str = dict[key] !== undefined ? dict[key] : key;
      if (vars) {
        Object.keys(vars).forEach((k) => {
          str = str.replace(new RegExp("\\{" + k + "\\}", "g"), String(vars[k]));
        });
      }
      return str;
    },
    onLangChange(e) {
      this.lang = e && e.detail && e.detail.lang === "en" ? "en" : "zh";
    },
  },
};
</script>

<style scoped>
/* ==========================================================================
   GOV.UK 服务设计规范（GDS）登录面板
   - 19px 正文、44px 表单控件、2px 墨色描边、黄色键盘焦点
   - 错误提示始终位于输入框下方，不参与输入框内部布局
   ========================================================================== */
.loginRegItemArea {
  --gds-black: #0b0c0c;
  --gds-blue: #1d70b8;
  --gds-green: #00703c;
  --gds-green-hover: #005a30;
  --gds-green-shadow: #002d18;
  --gds-red: #d4351c;
  --gds-yellow: #ffdd00;
  --gds-grey: #f3f2f1;
  --gds-border: #b1b4b6;
  --gds-secondary: #505a5f;
  --gds-font: "GDS Transport", Arial, "Noto Sans SC", "Source Han Sans SC",
    "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  --gds-ease: cubic-bezier(0.2, 0.7, 0.2, 1);

  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 24px 24px 20px;
  border: 0;
  background: #ffffff;
  color: var(--gds-black);
  font-family: var(--gds-font);
  font-size: 1.1875rem;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;

  --el-color-primary: var(--gds-green);
  --el-color-primary-light-3: var(--gds-green-hover);
  --el-color-primary-dark-2: var(--gds-green-shadow);
  --el-border-radius-base: 0;
  --el-border-color: var(--gds-border);
  --el-text-color-primary: var(--gds-black);
  --el-font-size-base: 1.1875rem;
  --el-component-size: 44px;
}

.loginRegItemArea,
.loginRegItemArea *,
.loginRegItemArea *::before,
.loginRegItemArea *::after {
  box-sizing: border-box;
}

.loginRegItemArea::-webkit-scrollbar {
  width: 4px;
}

.loginRegItemArea::-webkit-scrollbar-thumb {
  background: var(--gds-border);
}

.loginRegItemArea::-webkit-scrollbar-track {
  background: transparent;
}

/* ==========================================================================
   标题
   ========================================================================== */
.loginHeader {
  display: flex;
  flex: none;
  align-items: center;
  width: 100%;
  max-width: 480px;
  margin: 0 0 18px;
}

/* 宽屏对话框中把表单限制在更易读的宽度内 */
.loginRegItemArea .tab-content {
  flex: none;
  width: 100%;
  max-width: 480px;
}

.loginTitle {
  display: block;
  width: 100%;
  margin: 0;
  color: var(--gds-black) !important;
  font-family: var(--gds-font);
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: 0;
  white-space: normal;
}

/* 登录方式锚点：保留单一面板供外部逻辑读取 .nav-link.active / #numberLogin */
.loginModeTabs {
  display: none !important;
}

/* ==========================================================================
   面板显隐
   ========================================================================== */
.loginRegItemArea .tab-pane {
  display: none;
}

.loginRegItemArea .tab-pane.show.active {
  display: block;
  animation: loginPaneIn 0.35s var(--gds-ease);
}

@keyframes loginPaneIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* ==========================================================================
   输入框：外层只负责纵向排列，描边与焦点统一交给 .fieldControl
   ========================================================================== */
.loginRegInput {
  position: relative;
  width: 100%;
  margin: 0;
  padding: 0;
}

.loginRegInput + .loginRegInput {
  margin-top: 14px;
}

.fieldControl {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 44px;
  padding: 0;
  background: #ffffff;
  border: 2px solid var(--gds-black);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.fieldControl:focus-within {
  border-color: var(--gds-black);
  outline: 3px solid var(--gds-yellow);
  outline-offset: 0;
  box-shadow: inset 0 0 0 2px var(--gds-black);
}

.loginRegInput.is-invalid-field .fieldControl {
  border-color: var(--gds-red);
  box-shadow: inset 0 0 0 1px var(--gds-red);
}

.loginRegInput.is-invalid-field .fieldControl:focus-within {
  outline-color: var(--gds-yellow);
  box-shadow: inset 0 0 0 2px var(--gds-black);
}

/* 输入框内嵌图标 */
.fieldIcon {
  position: absolute;
  left: 14px;
  top: 50%;
  z-index: 1;
  width: 18px;
  height: 18px;
  color: var(--gds-secondary);
  pointer-events: none;
  transform: translateY(-50%);
  transition: color 0.2s ease;
}

.fieldControl:focus-within .fieldIcon {
  color: var(--gds-black);
}

.loginRegInput input {
  width: 100%;
  height: 40px;
  margin: 0;
  padding: 0 16px 0 44px;
  color: var(--gds-black) !important;
  font-family: var(--gds-font);
  font-size: 1.1875rem !important;
  line-height: 1.25;
  letter-spacing: 0;
  background: transparent !important;
  border: 0;
  border-radius: 0;
  outline: none;
  box-shadow: none;
}

.loginRegInput input::placeholder {
  color: var(--gds-secondary);
  font-size: 1.1875rem;
  opacity: 1;
}

.loginRegInput input:focus,
.loginRegInput input:focus-visible {
  outline: none;
  box-shadow: none;
}

/* ==========================================================================
   验证码输入：按钮回到文档流，输入框宽度随按钮文本自适应
   ========================================================================== */
.integratedInput .fieldControl {
  padding-right: 4px;
}

.integratedInput input.numberInput {
  flex: 1;
  min-width: 0;
  padding: 0 8px 0 44px;
}

.getCodeBtn.el-button {
  position: static !important;
  flex: none;
  min-width: 44px;
  height: 34px !important;
  margin: 0 0 0 4px !important;
  padding: 0 12px !important;
  color: #ffffff !important;
  font-family: var(--gds-font);
  font-size: 1rem !important;
  font-weight: 400 !important;
  line-height: 1 !important;
  letter-spacing: 0 !important;
  background: var(--gds-green) !important;
  border: 2px solid transparent !important;
  border-radius: 0 !important;
  box-shadow: 0 2px 0 var(--gds-green-shadow) !important;
  cursor: pointer;
  transition: background-color 0.2s ease, box-shadow 0.2s ease !important;
}

.getCodeBtn.el-button:hover {
  background: var(--gds-green-hover) !important;
  border-color: var(--gds-green-hover) !important;
  box-shadow: 0 2px 0 var(--gds-green-shadow) !important;
}

.getCodeBtn.el-button:active {
  transform: translateY(1px) !important;
  box-shadow: none !important;
}

.getCodeBtn.el-button:focus-visible {
  color: var(--gds-black) !important;
  background: var(--gds-yellow) !important;
  border-color: var(--gds-yellow) !important;
  outline: 3px solid transparent;
  outline-offset: 0;
  box-shadow: 0 2px 0 var(--gds-black) !important;
}

/* 倒计时提示 */
.gettingCodetips {
  position: absolute;
  right: 12px;
  top: 50%;
  display: none;
  margin: 0;
  color: var(--gds-secondary);
  font-size: 0.875rem;
  line-height: 1.25;
  letter-spacing: 0;
  white-space: nowrap;
  transform: translateY(-50%);
  pointer-events: none;
}

/* ==========================================================================
   错误提示：位于输入框下方，独立成行，不挤压输入框
   ========================================================================== */
.text-danger {
  display: none;
  width: 100%;
  margin: 6px 0 0;
  color: var(--gds-red) !important;
  font-size: 1.1875rem;
  font-weight: 700;
  line-height: 1.35;
  white-space: normal;
  overflow-wrap: anywhere;
}

/* ==========================================================================
   协议区
   ========================================================================== */
.agreementArea {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 10px;
  width: 100%;
  margin: 16px 0 20px !important;
  padding: 0;
  color: var(--gds-secondary);
  font-size: 1rem;
  line-height: 1.5;
}

.agreementArea label {
  margin-bottom: 0;
}

.agreeCheck {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 32px;
  cursor: pointer;
}

.agreeInput {
  position: relative;
  appearance: none;
  -webkit-appearance: none;
  flex: none;
  width: 24px;
  height: 24px;
  margin: 0;
  background: #ffffff;
  border: 2px solid var(--gds-black);
  border-radius: 0;
  cursor: pointer;
}

.agreeInput:checked {
  background: var(--gds-black);
}

.agreeInput:checked::after {
  content: "";
  position: absolute;
  left: 7px;
  top: 2px;
  width: 6px;
  height: 12px;
  border: solid #ffffff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.agreeInput:focus-visible {
  outline: 3px solid var(--gds-yellow);
  outline-offset: 0;
  box-shadow: 0 0 0 2px var(--gds-black);
}

.agreeLabel {
  color: var(--gds-secondary);
  font-size: 1rem;
  line-height: 1.5;
  cursor: pointer;
}

.agreementLink {
  min-height: 24px;
  margin: 0 !important;
  padding: 0 !important;
  color: var(--gds-blue) !important;
  font-family: var(--gds-font);
  font-size: 1rem !important;
  line-height: 1.5 !important;
  text-decoration: underline !important;
  text-underline-offset: 0.1578em;
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  cursor: pointer;
}

.agreementLink:hover {
  color: var(--gds-blue) !important;
  text-decoration-thickness: 3px !important;
}

.agreementLink:focus-visible {
  color: var(--gds-black) !important;
  background: var(--gds-yellow) !important;
  outline: 3px solid transparent;
  outline-offset: 0;
  box-shadow: 0 -2px var(--gds-yellow), 0 4px var(--gds-black);
  text-decoration: none !important;
}

.agreeHint {
  color: var(--gds-secondary);
  font-size: 1rem;
  line-height: 1.5;
}

/* ==========================================================================
   主提交按钮
   ========================================================================== */
.confirmBtnArea {
  position: relative;
  width: 100%;
}

.confirmBtnArea .el-button {
  width: 100% !important;
  height: 44px !important;
  padding: 8px 10px 7px !important;
  color: #ffffff !important;
  font-family: var(--gds-font);
  font-size: 1.1875rem !important;
  font-weight: 400 !important;
  line-height: 1.2 !important;
  letter-spacing: 0 !important;
  background: var(--gds-green) !important;
  border: 2px solid transparent !important;
  border-radius: 0 !important;
  box-shadow: 0 2px 0 var(--gds-green-shadow) !important;
  transition: background-color 0.2s ease, box-shadow 0.2s ease !important;
}

.confirmBtnArea .el-button:hover {
  color: #ffffff !important;
  background: var(--gds-green-hover) !important;
  border-color: var(--gds-green-hover) !important;
  box-shadow: 0 2px 0 var(--gds-green-shadow) !important;
}

.confirmBtnArea .el-button:active {
  transform: translateY(1px) !important;
  box-shadow: none !important;
}

.confirmBtnArea .el-button:focus-visible {
  color: var(--gds-black) !important;
  background: var(--gds-yellow) !important;
  border-color: var(--gds-yellow) !important;
  outline: 3px solid transparent;
  outline-offset: 0;
  box-shadow: 0 2px 0 var(--gds-black) !important;
}

.confirmBtnArea .el-button.is-disabled,
.confirmBtnArea .el-button.is-loading {
  color: var(--gds-secondary) !important;
  background: var(--gds-grey) !important;
  border-color: var(--gds-grey) !important;
  box-shadow: none !important;
  opacity: 1 !important;
}

/* ==========================================================================
   键盘焦点
   ========================================================================== */
.loginRegItemArea .el-button:focus-visible,
.loginRegItemArea .agreementLink:focus-visible,
.agreeInput:focus-visible {
  outline: 3px solid var(--gds-yellow);
  outline-offset: 0;
}

/* ==========================================================================
   窄屏适配
   ========================================================================== */
@media (max-width: 420px) {
  .loginRegItemArea {
    padding: 22px 18px 18px;
  }

  .loginTitle {
    font-size: 1.75rem;
  }

  .agreementArea {
    gap: 6px 8px;
  }

  .gettingCodetips {
    right: 8px;
  }
}

/* ==========================================================================
   动效敏感用户降级
   ========================================================================== */
@media (prefers-reduced-motion: reduce) {
  .loginRegItemArea .tab-pane.show.active {
    animation: none !important;
  }

  .loginRegItemArea *,
  .loginRegItemArea *::before,
  .loginRegItemArea *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
</style>
