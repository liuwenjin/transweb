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
          />
          <div class="text-danger" id="loginPhoneError" role="alert">{{ t("phoneErrorTips") }}</div>
        </div>

        <div class="loginRegInput integratedInput">
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
            spellcheck="false"
            required
          />
          <el-button round type="primary" class="getCodeBtn">{{
            t("getCodeTips")
          }}</el-button>
          <label class="gettingCodetips" aria-live="polite"
            ><span class="countTimerSpan"></span>s
            {{ t("waitCodeTips") }}</label
          >
          <div class="text-danger" id="loginCodeError" role="alert">{{ t("codeErrorTips") }}</div>
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
          <button
            type="button"
            class="btn btn-sm btn-link agreementLink"
          >
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
  components: {},
  data() {
    return {
      isLogining: false,
      isIframe: window.parent !== window,
      agreementChecked: false,
      // 当前语言：由父页面 creator.html 的 window.__APP_LANG__ / applangchange 驱动
      lang: window.__APP_LANG__ === "en" ? "en" : "zh",
      tips: `${webCpu.messages[lang].agreementTips} <button style="transform: scale(0.8); transform-origin: 0; vertical-align: middle;" type="button" class="btn btn-sm btn-link">${webCpu.messages[lang].agreementButton}</button>`,
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
   原研哉「白与空」设计系统（仅重写样式，未改动模板与交互逻辑）
   - 纸白 #fafafc / 墨色 #1a1a1e / 淡墨 #6e6e73 / 细线 #e7e7eb
   - 直角卡片，主按钮墨色水滴微光，点击 1px 下沉
   ========================================================================== */
.loginRegItemArea {
  --paper: #fafafc;
  --card: #ffffff;
  --field: #f8f8fa;
  --field-hover: #f4f4f6;
  --ink: #1a1a1e;
  --ash: #6e6e73;
  --ash-2: #a5a5aa;
  --line: #e7e7eb;
  --border: #ebebef;
  --border-strong: #9999a0;
  --red: #a0554a;
  --serif: "Source Han Serif SC", "Noto Serif SC", "Songti SC", "STSong", serif;
  --sans: Inter, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial,
    "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  --shadow-card: 0 20px 70px rgba(20, 20, 30, 0.055),
    0 2px 8px rgba(20, 20, 30, 0.025);
  --ease-out: cubic-bezier(0.2, 0.7, 0.2, 1);
}

/* ==========================================================================
   盒模型：仅作用于本组件树
   ========================================================================== */
.loginRegItemArea,
.loginRegItemArea *,
.loginRegItemArea *::before,
.loginRegItemArea *::after {
  box-sizing: border-box;
}

/* ==========================================================================
   根容器：纸白卡片，如平铺于桌面的一张纸
   ========================================================================== */
.loginRegItemArea {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 40px 36px !important;
  border-radius: 0px;
  background: var(--card);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-card);
  font-family: var(--sans);
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow: hidden;
}

/* 右上角极淡暖灰微光（替代原品牌蓝光晕） */
.loginRegItemArea::before {
  content: "";
  position: absolute;
  top: -80px;
  right: -80px;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(26, 26, 30, 0.03) 0%,
    rgba(26, 26, 30, 0) 70%
  );
  pointer-events: none;
}

/* ==========================================================================
   顶部标题
   ========================================================================== */
.loginHeader {
  display: flex;
  align-items: center;
  margin-bottom: 22px;
}

.loginTitle {
  font-family: var(--serif);
  font-size: 22px;
  font-weight: 400;
  letter-spacing: 0.04em;
  color: var(--ink) !important;
  line-height: 1.25 !important;
  width: calc(100% - 90px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.loginTitle::before {
  content: "";
  display: inline-block;
  width: 4px;
  height: 18px;
  background: var(--ink);
  margin-right: 10px;
  vertical-align: -2px;
}

/* ==========================================================================
   登录方式锚点：仅保留单个隐藏标签
   ========================================================================== */
.loginModeTabs {
  display: none !important;
}

/* ==========================================================================
   面板显隐（带轻量入场动效）
   ========================================================================== */
.loginRegItemArea .tab-pane {
  display: none;
}

.loginRegItemArea .tab-pane.show.active {
  display: block;
  animation: loginPaneIn 0.5s var(--ease-out);
}

@keyframes loginPaneIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* ==========================================================================
   输入框外层容器
   ========================================================================== */
.loginRegInput {
  position: relative;
  float: none;
  width: 100%;
  margin: 0 !important;
  transition: all 0.3s var(--ease-out);
}

/* 相邻输入框间距 */
.loginRegInput + .loginRegInput {
  margin-top: 16px !important;
}

/* 输入框内嵌图标 */
.loginRegInput .fieldIcon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: var(--ash-2);
  pointer-events: none;
  z-index: 1;
  transition: color 0.3s ease;
}

.loginRegInput input {
  width: 100%;
  height: 48px;
  padding: 0 16px 0 44px;
  background-color: var(--field) !important;
  color: var(--ink) !important;
  font-size: 14px !important;
  letter-spacing: 0.02em;
  border: 1px solid var(--line);
  border-radius: 0px !important;
  box-shadow: inset 0 1px 3px rgba(20, 20, 30, 0.03);
  outline: none;
  transition: all 0.3s ease;
}

.loginRegInput input::placeholder {
  color: var(--ash-2);
  font-size: 14px;
}

.loginRegInput input:focus {
  border-color: var(--ink);
  background-color: var(--card) !important;
  box-shadow: 0 0 0 1px var(--ink);
}

.loginRegInput:focus-within .fieldIcon {
  color: var(--ink);
}

/* 校验反馈 */
.loginRegInput input.is-valid {
  border-color: var(--ink) !important;
  box-shadow: 0 0 0 1px var(--ink) !important;
}

.loginRegInput input.is-invalid {
  border-color: var(--red) !important;
  box-shadow: 0 0 0 1px var(--red) !important;
}

/* 错误提示 */
.loginRegInput .text-danger {
  display: none;
  position: absolute;
  left: 14px;
  bottom: -24px;
  font-size: 12px;
  color: var(--red) !important;
  white-space: nowrap;
  z-index: 2;
}

/* ==========================================================================
   验证码整块：一体式容器
   ========================================================================== */
.integratedInput {
  background-color: var(--field) !important;
  overflow: hidden;
  border-radius: 0px !important;
  padding: 0 !important;
  border: 1px solid var(--line);
  box-shadow: inset 0 1px 3px rgba(20, 20, 30, 0.03);
  display: flex;
  align-items: center;
  min-height: 48px;
  transition: all 0.3s ease;
}

.integratedInput:focus-within {
  border-color: var(--ink);
  background-color: var(--card) !important;
  box-shadow: 0 0 0 1px var(--ink);
}

.integratedInput input.numberInput {
  flex: 1;
  min-width: 0;
  height: 46px;
  padding: 0 126px 0 44px;
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  color: var(--ink) !important;
}

.integratedInput input.numberInput:focus {
  box-shadow: none !important;
}

/* 获取验证码按钮：墨色内嵌胶囊 */
.getCodeBtn {
  cursor: pointer;
  z-index: 3;
  position: absolute !important;
  right: 6px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  height: 36px !important;
  line-height: 36px !important;
  padding: 0 14px !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  letter-spacing: 0.08em;
  color: #ffffff !important;
  background: var(--ink) !important;
  border: 1px solid var(--ink) !important;
  border-radius: 0px !important;
  margin: 0 !important;
  box-shadow: none !important;
  transition: all 0.3s var(--ease-out) !important;
}

.getCodeBtn:hover {
  background: #2b2b31 !important;
  border-color: #2b2b31 !important;
  transform: translateY(-50%) !important;
  box-shadow: 0 6px 18px rgba(20, 20, 30, 0.18) !important;
}

.getCodeBtn:active {
  transform: translateY(-50%) translateY(1px) !important;
}

/* 倒计时提示 */
.gettingCodetips {
  display: none;
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  letter-spacing: 0.02em;
  color: var(--ash-2);
  margin: 0;
  z-index: 2;
  white-space: nowrap;
}

/* ==========================================================================
   协议区
   ========================================================================== */
.agreementArea {
  position: relative;
  float: none;
  width: 100%;
  margin: 18px 0 24px !important;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px 6px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--ash);
}

.agreementArea label {
  margin-bottom: 0px;
}

.agreeCheckbox {
  display: inline-flex;
  align-items: center;
  margin-right: 2px;
}














/* 协议链接按钮 */
.agreementLink {
  font-size: 13px !important;
  color: var(--ink) !important;
  text-decoration: none !important;
  padding: 0 !important;
  margin: 0 !important;
  line-height: 1.5 !important;
  border: none !important;
  border-bottom: 1px solid var(--border-strong) !important;
  background: transparent !important;
  box-shadow: none !important;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.agreementLink:hover {
  color: var(--ink) !important;
  border-bottom-color: var(--ink) !important;
  text-decoration: none !important;
}

.agreeHint {
  color: var(--ash-2);
  margin-left: 2px;
}

/* ==========================================================================
   主提交按钮：墨色水滴微光
   ========================================================================== */
.confirmBtnArea {
  position: relative !important;
  float: none !important;
  width: 100% !important;
}

.confirmBtnArea .el-button,
.confirmBtn.btn {
  width: 100% !important;
  height: 48px !important;
  border-radius: 0px !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  letter-spacing: 0.12em !important;
  background: var(--ink) !important;
  border: 1px solid var(--ink) !important;
  color: #ffffff !important;
  box-shadow: none !important;
  position: relative;
  overflow: hidden;
  transition: all 0.3s var(--ease-out) !important;
}

/* 水滴微光：悬停时从中心散发极淡白光 */
.confirmBtnArea .el-button::after,
.confirmBtn.btn::after {
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

.confirmBtnArea .el-button:hover::after,
.confirmBtn.btn:hover::after {
  width: 420px;
  height: 420px;
}

/* 按钮文字置于微光之上 */


.confirmBtnArea .el-button:hover,
.confirmBtn.btn:hover {
  background: #2b2b31 !important;
  border-color: #2b2b31 !important;
  color: #ffffff !important;
  transform: translateY(0) !important;
  box-shadow: 0 10px 30px rgba(20, 20, 30, 0.16) !important;
}

.confirmBtnArea .el-button:active,
.confirmBtn.btn:active {
  transform: translateY(1px) !important;
  box-shadow: none !important;
}

.confirmBtnArea .el-button.is-disabled,
.confirmBtnArea .el-button.is-loading {
  opacity: 0.4 !important;
  filter: none;
  box-shadow: none !important;
}

/* ==========================================================================
   无障碍：键盘焦点可见
   ========================================================================== */
.loginRegItemArea .el-button:focus-visible,
.loginRegItemArea .el-checkbox:focus-visible,
.loginRegItemArea .agreementLink:focus-visible {
  outline: 1px solid var(--ink);
  outline-offset: 3px;
}

/* ==========================================================================
   无障碍：动效敏感用户降级
   ========================================================================== */
@media (prefers-reduced-motion: reduce) {
  .loginRegItemArea .tab-pane.show.active {
    animation: none !important;
  }
  .loginRegInput,
  .loginRegInput input,
  .loginRegInput .fieldIcon,
  .getCodeBtn,
  .confirmBtnArea .el-button,
  .agreementLink {
    transition-duration: 0.01ms !important;
  }
}


/* ==========================================================================
   GOV.UK 服务设计规范适配层
   - 19px 正文、44px 表单控件、绿色主按钮、黄色键盘焦点
   - 直角、白色输入底、2px 墨色描边
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

  --paper: #ffffff;
  --card: #ffffff;
  --field: #ffffff;
  --field-hover: var(--gds-grey);
  --ink: var(--gds-black);
  --ash: var(--gds-secondary);
  --ash-2: #6f777b;
  --line: var(--gds-border);
  --border: var(--gds-border);
  --border-strong: var(--gds-black);
  --red: var(--gds-red);
  --serif: var(--gds-font);
  --sans: var(--gds-font);

  padding: 30px 24px !important;
  border: 0;
  background: #ffffff;
  box-shadow: none;
  font-family: var(--gds-font);
  font-size: 1.1875rem;
  line-height: 1.5;
  color: var(--gds-black);

  --el-color-primary: var(--gds-green);
  --el-color-primary-light-3: var(--gds-green-hover);
  --el-color-primary-dark-2: var(--gds-green-shadow);
  --el-border-radius-base: 0;
  --el-border-color: var(--gds-border);
  --el-text-color-primary: var(--gds-black);
  --el-font-size-base: 1.1875rem;
  --el-component-size: 44px;
  --el-checkbox-font-size: 1rem;
  --el-checkbox-input-width: 24px;
  --el-checkbox-input-height: 24px;
  --el-checkbox-checked-bg-color: var(--gds-black);
  --el-checkbox-checked-input-border-color: var(--gds-black);
  --el-checkbox-input-border-color-hover: var(--gds-black);
}

.loginRegItemArea::before {
  display: none;
}

.loginRegItemArea .loginHeader {
  margin-bottom: 25px;
}

.loginRegItemArea .loginTitle {
  width: 100%;
  font-family: var(--gds-font);
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.09;
  letter-spacing: 0;
  color: var(--gds-black) !important;
}

.loginRegItemArea .loginTitle::before {
  display: none;
}

.loginRegItemArea .loginRegInput input {
  height: 44px;
  padding: 0 16px 0 44px;
  border: 2px solid var(--gds-black);
  border-radius: 0;
  background-color: #ffffff !important;
  color: var(--gds-black) !important;
  font-family: var(--gds-font);
  font-size: 1.1875rem !important;
  line-height: 1.25;
  letter-spacing: 0;
  box-shadow: none;
}

.loginRegItemArea .loginRegInput input::placeholder {
  color: var(--gds-secondary);
  font-size: 1.1875rem;
  opacity: 1;
}

.loginRegItemArea .loginRegInput input:focus,
.loginRegItemArea .loginRegInput input:focus-visible {
  border-color: var(--gds-black);
  outline: 3px solid var(--gds-yellow);
  outline-offset: 0;
  background-color: #ffffff !important;
  box-shadow: inset 0 0 0 2px var(--gds-black);
}

.loginRegItemArea .integratedInput {
  min-height: 44px;
  padding: 0;
  border: 2px solid var(--gds-black);
  border-radius: 0;
  background-color: #ffffff !important;
  box-shadow: none;
}

.loginRegItemArea .integratedInput:focus-within {
  border-color: var(--gds-black);
  background-color: #ffffff !important;
  outline: 3px solid var(--gds-yellow);
  outline-offset: 0;
  box-shadow: inset 0 0 0 2px var(--gds-black);
}

.loginRegItemArea .integratedInput input.numberInput {
  height: 40px;
  padding: 0 132px 0 44px;
  border: 0 !important;
  background: transparent !important;
}

.loginRegItemArea .loginRegInput .fieldIcon {
  left: 14px;
  color: var(--gds-secondary);
}

.loginRegItemArea .getCodeBtn.el-button {
  position: absolute !important;
  right: 4px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  min-width: 44px;
  height: 40px !important;
  padding: 0 12px !important;
  border: 2px solid transparent !important;
  border-radius: 0 !important;
  background: var(--gds-green) !important;
  color: #ffffff !important;
  font-family: var(--gds-font);
  font-size: 1rem !important;
  font-weight: 400 !important;
  letter-spacing: 0 !important;
  box-shadow: 0 2px 0 var(--gds-green-shadow) !important;
}

.loginRegItemArea .getCodeBtn.el-button:hover {
  background: var(--gds-green-hover) !important;
  border-color: var(--gds-green-hover) !important;
  transform: translateY(-50%) !important;
  box-shadow: 0 2px 0 var(--gds-green-shadow) !important;
}

.loginRegItemArea .getCodeBtn.el-button:focus-visible {
  background: var(--gds-yellow) !important;
  border-color: var(--gds-yellow) !important;
  color: var(--gds-black) !important;
  outline: 3px solid transparent;
  outline-offset: 0;
  box-shadow: 0 2px 0 var(--gds-black) !important;
}

.loginRegItemArea .loginRegInput .text-danger {
  position: static;
  margin-top: 5px;
  color: var(--gds-red) !important;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.25;
}

.loginRegItemArea .agreementArea {
  margin: 20px 0 25px !important;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--gds-secondary);
}

.loginRegItemArea .agreementLink {
  min-height: 24px;
  color: var(--gds-blue) !important;
  font-size: 1rem !important;
  text-decoration: underline !important;
  border-bottom: 0 !important;
  text-underline-offset: 0.1578em;
}

.loginRegItemArea .agreementLink:hover {
  color: var(--gds-blue) !important;
  text-decoration-thickness: 3px !important;
}

.loginRegItemArea .agreementLink:focus-visible {
  color: var(--gds-black) !important;
  background: var(--gds-yellow);
  outline: 3px solid transparent;
  outline-offset: 0;
  box-shadow: 0 -2px var(--gds-yellow), 0 4px var(--gds-black);
  text-decoration: none !important;
}

.loginRegItemArea .agreeHint {
  color: var(--gds-secondary);
  font-size: 1rem;
}

.loginRegItemArea .confirmBtnArea .el-button {
  width: 100% !important;
  height: 44px !important;
  padding: 8px 10px 7px !important;
  border: 2px solid transparent !important;
  border-radius: 0 !important;
  background: var(--gds-green) !important;
  color: #ffffff !important;
  font-family: var(--gds-font);
  font-size: 1.1875rem !important;
  font-weight: 400 !important;
  letter-spacing: 0 !important;
  box-shadow: 0 2px 0 var(--gds-green-shadow) !important;
}

.loginRegItemArea .confirmBtnArea .el-button::after {
  display: none !important;
}

.loginRegItemArea .confirmBtnArea .el-button:hover {
  background: var(--gds-green-hover) !important;
  border-color: var(--gds-green-hover) !important;
  color: #ffffff !important;
  box-shadow: 0 2px 0 var(--gds-green-shadow) !important;
}

.loginRegItemArea .confirmBtnArea .el-button:focus-visible {
  background: var(--gds-yellow) !important;
  border-color: var(--gds-yellow) !important;
  color: var(--gds-black) !important;
  outline: 3px solid transparent;
  outline-offset: 0;
  box-shadow: 0 2px 0 var(--gds-black) !important;
}

.loginRegItemArea .confirmBtnArea .el-button.is-disabled,
.loginRegItemArea .confirmBtnArea .el-button.is-loading {
  background: var(--gds-grey) !important;
  border-color: var(--gds-grey) !important;
  color: var(--gds-secondary) !important;
  box-shadow: none !important;
  opacity: 1 !important;
}

.loginRegItemArea .el-button:focus-visible {
  outline: 3px solid transparent;
  outline-offset: 0;
  background: var(--gds-yellow);
  color: var(--gds-black);
  box-shadow: 0 2px 0 var(--gds-black);
}

.loginRegItemArea .gettingCodetips {
  color: var(--gds-secondary);
  font-size: 1rem;
}

.loginRegItemArea .agreeCheck {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
}

.loginRegItemArea .agreeInput {
  appearance: none;
  -webkit-appearance: none;
  width: 24px;
  height: 24px;
  margin: 0;
  flex: none;
  border: 2px solid var(--gds-black);
  border-radius: 0;
  background: #ffffff;
  position: relative;
  cursor: pointer;
}

.loginRegItemArea .agreeInput:checked {
  background: var(--gds-black);
}

.loginRegItemArea .agreeInput:checked::after {
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

.loginRegItemArea .agreeInput:focus-visible {
  outline: 3px solid var(--gds-yellow);
  outline-offset: 0;
  box-shadow: 0 0 0 2px var(--gds-black);
}

.loginRegItemArea .agreeLabel {
  color: var(--gds-secondary);
  font-size: 1rem;
  line-height: 1.5;
  cursor: pointer;
}

@media (max-width: 420px) {
  .loginRegItemArea {
    padding: 24px 18px !important;
    border: 0;
  }

  .loginRegItemArea .loginTitle {
    font-size: 1.75rem;
  }
}
</style>