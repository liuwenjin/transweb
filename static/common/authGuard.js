/*!
 * authGuard.js —— 监测到 403（登录态失效）时自动弹出登录框
 *
 * 适用范围：skill.html / agent.html 这类「静态页面 + webCpu 渲染」的落地页。
 *
 * 背景：同源接口（如 /bucket/personal/... 个人空间、/user/... 等）在会话或
 *       transweb-token 失效时会返回 403，页面本身对此只会静默失败（白屏、
 *       掉图、脚本卡在加载中、按钮无响应）。这里统一监测页面请求的 403
 *       （XHR / fetch / <script>·<link> 资源加载失败），调用页面已有的
 *       window.openLoginDialog 弹出登录框；登录成功后刷新页面，恢复正常流程。
 *
 * 可选配置（在本文件之前声明即可）：
 *   window.__AUTH_GUARD_CONFIG__ = {
 *     statuses: [403],           // 需要拦截的 HTTP 状态码
 *     reloadAfterLogin: true,    // 登录成功后是否刷新页面
 *     cooldown: 2000             // 两次自动弹框的最小间隔（毫秒）
 *   };
 */
(function (window, document) {
  "use strict";

  if (window.__authGuardInstalled) {
    return;
  }
  window.__authGuardInstalled = true;

  var CONFIG = window.__AUTH_GUARD_CONFIG__ || {};
  var STATUSES = Array.isArray(CONFIG.statuses) ? CONFIG.statuses : [403];
  var RELOAD_AFTER_LOGIN = CONFIG.reloadAfterLogin !== false;
  var COOLDOWN = typeof CONFIG.cooldown === "number" ? CONFIG.cooldown : 2000;

  var DIALOG_WAIT_LIMIT = 15000; // 等待登录框就绪的最长时间
  var DIALOG_WAIT_STEP = 200;    // 轮询间隔
  var LOOP_WINDOW = 60000;       // 登录后同一请求再次 403 时的抑制窗口

  // 登录流程自身的请求：这些接口返回 403 并不代表登录态失效，不应再次弹框
  var IGNORE_URL = /\/user\/(check|sendSMS|login)\b/i;

  var activeMask = null;   // 由本脚本打开的登录框遮罩，用于判断登录框是否仍然存在
  var pendingUrl = "";     // 触发本次登录框的请求地址
  var opening = false;     // 正在等待登录框就绪
  var lastOpenAt = 0;      // 上次自动弹框时间
  var nativeFetch = null;  // 原生 fetch，供资源探测复用（避免拦截逻辑递归）

  function isAttached(el) {
    if (!el) return false;
    return el.isConnected === true || document.documentElement.contains(el);
  }

  function isLoginDialogOpen() {
    if (isAttached(activeMask)) return true;
    // 兼容用户通过页面按钮手动打开的登录框
    return !!document.querySelector(".loginRegItemArea");
  }

  function sameOrigin(url) {
    try {
      return new URL(url, location.href).origin === location.origin;
    } catch (e) {
      // 相对路径解析失败时按同源处理
      return true;
    }
  }

  // 登录成功并刷新后，若同一请求依旧 403（例如访问的是他人空间），
  // 说明登录并不能解决问题，短时间内不再重复弹框，避免「弹框-刷新」死循环。
  function isRecentLoginLoop(url) {
    try {
      var record = JSON.parse(
        window.sessionStorage.getItem("__authGuardLogin__") || "null"
      );
      if (!record) return false;
      return record.url === url && Date.now() - record.time < LOOP_WINDOW;
    } catch (e) {
      return false;
    }
  }

  function markLoginDone(url) {
    try {
      window.sessionStorage.setItem(
        "__authGuardLogin__",
        JSON.stringify({ url: url || "", time: Date.now() })
      );
    } catch (e) { }
  }

  function shouldIgnore(url) {
    if (!url) return true;
    if (!sameOrigin(url)) return true;
    if (IGNORE_URL.test(url)) return true;
    if (isLoginDialogOpen()) return true;
    if (isRecentLoginLoop(url)) return true;
    return false;
  }

  function body() {
    return document.body || document.documentElement;
  }

  // 记录本次调用新建的遮罩：登录框关闭（遮罩被移除）后才能再次弹框
  function trackMask() {
    var masks = document.querySelectorAll("body > .cardItemMask");
    activeMask = masks.length ? masks[masks.length - 1] : null;
  }

  function waitForDialog(startAt) {
    if (typeof window.openLoginDialog !== "function") {
      if (Date.now() - startAt < DIALOG_WAIT_LIMIT) {
        window.setTimeout(function () {
          waitForDialog(startAt);
        }, DIALOG_WAIT_STEP);
        return;
      }
      opening = false;
      console.warn("[authGuard] 登录框未就绪，已跳过自动登录：", pendingUrl);
      return;
    }

    opening = false;
    try {
      window.openLoginDialog(body(), function () {
        markLoginDone(pendingUrl);
        if (RELOAD_AFTER_LOGIN) {
          // 登录成功后刷新页面，让此前因 403 中断的加载/操作重新执行
          window.setTimeout(function () {
            location.reload();
          }, 300);
        }
      });
      trackMask();
    } catch (e) {
      activeMask = null;
      console.warn("[authGuard] 打开登录框失败：", e);
    }
  }

  function report(url) {
    if (shouldIgnore(url)) return;

    var now = Date.now();
    if (opening || now - lastOpenAt < COOLDOWN) return;

    lastOpenAt = now;
    opening = true;
    pendingUrl = url;

    console.warn("[authGuard] 检测到 403，自动弹出登录框：", url);
    waitForDialog(Date.now());
  }

  function matchStatus(status) {
    var code = Number(status);
    return STATUSES.indexOf(code) !== -1;
  }

  // 1) XMLHttpRequest：webCpu / AjaxInterface / jQuery.ajax 都走这条链路
  function instrumentXHR() {
    var XHR = window.XMLHttpRequest;
    if (!XHR || !XHR.prototype) return;

    var rawOpen = XHR.prototype.open;
    var rawSend = XHR.prototype.send;

    XHR.prototype.open = function (method, url) {
      try {
        this.__authGuardUrl = String(url || "");
      } catch (e) { }
      return rawOpen.apply(this, arguments);
    };

    XHR.prototype.send = function () {
      var xhr = this;
      var onDone = function () {
        try {
          if (matchStatus(xhr.status)) {
            report(xhr.__authGuardUrl || xhr.responseURL || "");
          }
        } catch (e) { }
      };
      if (xhr.addEventListener) {
        xhr.addEventListener("loadend", onDone);
      } else {
        var rawStateChange = xhr.onreadystatechange;
        xhr.onreadystatechange = function () {
          if (typeof rawStateChange === "function") {
            rawStateChange.apply(this, arguments);
          }
          if (xhr.readyState === 4) onDone();
        };
      }
      return rawSend.apply(this, arguments);
    };
  }

  // 2) fetch：/gpt/aiStreamRequest 等流式接口、js 内部直接 fetch 的场景
  function instrumentFetch() {
    if (typeof window.fetch !== "function") return;

    var rawFetch = window.fetch;
    nativeFetch = rawFetch;

    window.fetch = function (input) {
      var url = "";
      try {
        url =
          typeof input === "string"
            ? input
            : (input && input.url) || "";
      } catch (e) { }

      return rawFetch.apply(this, arguments).then(function (response) {
        try {
          if (response && matchStatus(response.status)) {
            report(url || response.url || "");
          }
        } catch (e) { }
        return response;
      });
    };
  }

  // 3) <script> / <link> 这类标签请求拿不到状态码，加载失败时做一次轻量 HEAD 探测：
  //    只有确认是 403（登录态失效）才弹框，404 等其它失败不会误触发。
  //    个人空间里的应用 JS/CSS 一旦 403，页面会一直卡在加载中，需要这里兜底。
  function probeResource(url) {
    if (!url || !sameOrigin(url)) return;
    if (shouldIgnore(url)) return;
    if (typeof nativeFetch !== "function") return;

    nativeFetch(url, { method: "HEAD", credentials: "include" })
      .then(function (response) {
        if (response && matchStatus(response.status)) {
          console.warn("[authGuard] 资源加载被拒绝（HEAD 探测 403）：", url);
          report(url);
        }
      })
      .catch(function () { });
  }

  function instrumentResources() {
    if (!window.addEventListener) return;

    // 资源加载错误只在捕获阶段抛到 window，且 target 是具体元素
    window.addEventListener(
      "error",
      function (event) {
        var el = event.target;
        if (!el || el === window) return;
        var tag = (el.tagName || "").toLowerCase();
        if (tag !== "script" && tag !== "link") return;
        probeResource(el.src || el.href || "");
      },
      true
    );
  }

  instrumentXHR();
  instrumentFetch();
  instrumentResources();

  // 便于调试或在特殊场景手动触发：window.__authGuard.report(403, url)
  window.__authGuard = {
    report: function (status, url) {
      if (matchStatus(status)) report(url || "");
    },
    isLoginDialogOpen: isLoginDialogOpen,
  };
})(window, document);
