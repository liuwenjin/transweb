/**
 * TransWeb i18n bootstrap (admin / init / initialize pages)
 * ------------------------------------------------------------------
 * 自动检测语言（URL ?lang= → localStorage appLang → 浏览器语言 → 中文），
 * 并从 ./i18n/zh.json 与 ./i18n/en.json 加载对应语言文案。
 *
 * 依赖（按顺序加载）：
 *   - /index.js        → 提供 webCpu / webCpu.messages（含 en、zh 的内置词表，作为同步兜底）
 *   - /i18n/loader.js  → 本文件
 *
 * 暴露的全局接口：
 *   window.lang / window.__APP_LANG__   当前语言（"zh" | "en"）
 *   window.__I18N__                     { zh: {...}, en: {...} }
 *   window.__t__(key)                   取文案（含 webCpu.messages 兜底）
 *   window.__setAppLang__(lang)         切换语言并持久化
 *   window.__i18nReady(cb?)             Promise / 回调，词表加载完成时触发
 *   window.__PAGE_TITLE__ = { zh, en }  可选，页面标题本地化
 *
 * 事件：
 *   window "applangchange"              detail.lang
 *   webCpu.mitt "langChanged"           lang
 */
(function () {
  "use strict";

  var LS_KEY = "appLang";

  function i18nDir() {
    var cs = document.currentScript;
    if (cs && cs.src) {
      var base = cs.src.substring(0, cs.src.lastIndexOf("/") + 1);
      if (base) return base;
    }
    return "./i18n/";
  }

  function urlParam(name) {
    try {
      var m = new RegExp("[?&]" + name + "=([^&]*)").exec(location.search);
      return m ? decodeURIComponent(m[1]) : null;
    } catch (e) {
      return null;
    }
  }

  function readLang() {
    var q = urlParam("lang");
    if (q === "en" || q === "zh") return q;

    try {
      var saved = localStorage.getItem(LS_KEY);
      if (saved === "en" || saved === "zh") return saved;
    } catch (e) { }

    try {
      var nl = String(navigator.language || navigator.userLanguage || "").toLowerCase();
      if (nl.indexOf("zh") === 0) return "zh";
      if (nl.indexOf("en") === 0) return "en";
    } catch (e) { }

    return "zh";
  }

  var lang = readLang();

  // 同步设置语言，保证 webCpu.updateView 渲染时即使用正确语言
  window.lang = lang;
  window.__APP_LANG__ = lang;

  function setHtmlLang(l) {
    document.documentElement.lang = l === "en" ? "en" : "zh-CN";
  }

  function applyPageTitle(l) {
    var titleObj = window.__PAGE_TITLE__;
    if (titleObj && titleObj[l]) {
      document.title = titleObj[l];
    }
  }

  setHtmlLang(lang);
  applyPageTitle(lang);

  // 记录解析后的语言，便于同源 iframe（initAdmin → admin）共享
  try { localStorage.setItem(LS_KEY, lang); } catch (e) { }

  // 用 index.js 内置的 webCpu.messages 作为同步兜底，
  // 加载 JSON 后以 i18n 文件为准覆盖同名键。
  var seed = (window.webCpu && window.webCpu.messages) ? window.webCpu.messages : {};
  var I18N = {
    zh: seed.zh || {},
    en: seed.en || {}
  };
  window.__I18N__ = I18N;

  function dictFor(l) {
    return I18N[l] || I18N.zh || {};
  }

  window.__t__ = function (key) {
    var l = window.__APP_LANG__ || lang;
    var d = I18N[l];
    if (d && d[key] !== undefined) return d[key];
    if (I18N.zh && I18N.zh[key] !== undefined) return I18N.zh[key];
    return key;
  };

  function applyDataI18n(l) {
    var dict = dictFor(l);

    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      var k = nodes[i].getAttribute("data-i18n");
      if (dict[k] !== undefined) nodes[i].textContent = dict[k];
    }

    var ariaNodes = document.querySelectorAll("[data-i18n-aria]");
    for (var j = 0; j < ariaNodes.length; j++) {
      var ak = ariaNodes[j].getAttribute("data-i18n-aria");
      if (dict[ak] !== undefined) ariaNodes[j].setAttribute("aria-label", dict[ak]);
    }
  }

  function notify(l) {
    try {
      window.dispatchEvent(new CustomEvent("applangchange", { detail: { lang: l } }));
    } catch (e) { }
    try {
      if (window.webCpu && window.webCpu.mitt) window.webCpu.mitt.emit("langChanged", l);
    } catch (e) { }
  }

  function commit(l) {
    if (l !== "en" && l !== "zh") l = "zh";
    lang = l;
    window.lang = l;
    window.__APP_LANG__ = l;
    try { localStorage.setItem(LS_KEY, l); } catch (e) { }
    setHtmlLang(l);
    applyPageTitle(l);
    applyDataI18n(l);
    notify(l);
  }

  window.__setAppLang__ = commit;

  var BASE = i18nDir();
  var pending = 2;
  var readyHandlers = [];
  var ready = false;

  function markReady() {
    if (ready) return;
    ready = true;
    window.__i18nReady__ = true;
    applyPageTitle(lang);
    applyDataI18n(lang);
    notify(lang);
    var h;
    while ((h = readyHandlers.shift())) {
      try { h(); } catch (e) { }
    }
  }

  function loadDict(name) {
    fetch(BASE + name + ".json")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        I18N[name] = Object.assign({}, I18N[name] || {}, data);
      })
      .catch(function () { /* 加载失败时继续使用内置兜底词表 */ })
      .then(function () {
        pending--;
        if (pending === 0) markReady();
      });
  }

  window.__i18nReady = function (cb) {
    if (window.__i18nReady__) {
      if (typeof cb === "function") cb();
      return Promise.resolve();
    }
    return new Promise(function (resolve) {
      readyHandlers.push(function () {
        if (typeof cb === "function") cb();
        resolve();
      });
      setTimeout(function () { if (!window.__i18nReady__) markReady(); }, 3000);
    });
  };

  loadDict("zh");
  loadDict("en");
})();
