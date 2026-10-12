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
            class="mobileInput"
            type="text"
            :placeholder="t('phonePlaceholder')"
            :aria-label="t('phonePlaceholder')"
            autocomplete="username"
            maxlength="30"
            spellcheck="false"
          />
          <div class="text-danger">{{ t("phoneErrorTips") }}</div>
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
            class="numberInput"
            type="text"
            :placeholder="t('codePlaceholder')"
            :aria-label="t('codePlaceholder')"
            inputmode="numeric"
            autocomplete="one-time-code"
            autocapitalize="off"
            spellcheck="false"
            required
          />
          <el-button round type="primary" class="getCodeBtn">{{
            t("getCodeTips")
          }}</el-button>
          <label class="gettingCodetips"
            ><span class="countTimerSpan"></span>s
            {{ t("waitCodeTips") }}</label
          >
          <div class="text-danger">{{ t("codeErrorTips") }}</div>
        </div>

        <p class="agreementArea">
          <el-checkbox
            v-model="agreementChecked"
            size="small"
            class="agreeCheckbox"
          >
            <span class="agreeLabel">{{ t("login.agree") }}</span>
          </el-checkbox>
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

:deep(.agreeCheckbox .el-checkbox__label) {
  color: var(--ash);
  font-size: 13px;
  padding-left: 6px;
}

:deep(.agreeCheckbox .el-checkbox__inner) {
  width: 17px !important;
  height: 17px !important;
  border-radius: 0px !important;
  border: 1px solid var(--border-strong) !important;
  background-color: var(--card) !important;
  box-shadow: none;
  transition: all 0.2s ease;
}

/* 关键修复：对钩使用 content-box */
:deep(.agreeCheckbox .el-checkbox__inner::after) {
  box-sizing: content-box !important;
  content: "";
  border: 1px solid #ffffff !important;
  border-top: 0 !important;
  border-left: 0 !important;
  width: 4px !important;
  height: 8px !important;
  left: 5px !important;
  top: 1px !important;
  position: absolute !important;
  transform: rotate(45deg) scaleY(0) !important;
  transform-origin: center !important;
  transition: transform 0.18s ease;
}

:deep(.agreeCheckbox .el-checkbox__input:hover .el-checkbox__inner) {
  border-color: var(--ink) !important;
}

:deep(.agreeCheckbox .el-checkbox__input.is-checked .el-checkbox__inner) {
  background: var(--ink) !important;
  border-color: var(--ink) !important;
  box-shadow: none;
}

:deep(.agreeCheckbox .el-checkbox__input.is-checked .el-checkbox__inner::after) {
  transform: rotate(45deg) scaleY(1) !important;
}

:deep(.agreeCheckbox .el-checkbox__input.is-focus .el-checkbox__inner) {
  box-shadow: 0 0 0 1px var(--ink);
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
:deep(.confirmBtnArea .el-button span) {
  position: relative;
  z-index: 2;
}

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

</style>