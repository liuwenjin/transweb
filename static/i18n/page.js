/**
 * TransWeb 静态页中英切换引擎（skillHub.html / workflow.html 共用）
 * ------------------------------------------------------------------
 * 与 index.html 的切换逻辑保持一致：URL ?lang=en 优先，其次 localStorage appLang，
 * 默认中文；切换时同步地址栏与本地记忆，中文/英文都从词典渲染。
 *
 * 词典来源（都在 ./i18n/ 下）：
 *   en.json            全站共用英文词条（导航、页脚、隐私政策 / 服务条款 / 无障碍声明等）
 *   <page>.en.json     页面自身英文词条，覆盖同名共用词条
 *   <page>.zh.json     页面自身中文词条（与页面里的中文一一对应，可用 scripts/i18n-extract.js 重新抽取）
 *   页面内联 __PAGE_I18N__.zh  仅用于 JS 动态生成的文案（页面里没有对应 DOM 节点）
 *
 * 页面用法：
 *   <script>window.__PAGE_I18N__ = { page: "skillHub", version: 1, zh: { ... } };</script>
 *   <script src="i18n/page.js"></script>
 *
 * 标注属性：
 *   data-i18n              替换 textContent
 *   data-i18n-html         替换 innerHTML（词条里需要保留 <span>/<b> 等行内标签时使用）
 *   data-i18n-aria         替换 aria-label
 *   data-i18n-alt          替换 alt
 *   data-i18n-title        替换 title
 *   data-i18n-placeholder  替换 placeholder
 *
 * 全局接口：
 *   window.lang / window.__APP_LANG__   当前语言（"zh" | "en"）
 *   window.__I18N__                     { zh: {...}, en: {...} }
 *   window.__t__(key[, fallback])       取文案
 *   window.__tf__(key, vars)            取文案并替换 {name} 占位符
 *   window.__setAppLang__(lang)         切换语言并持久化
 *   window.__i18nReady(cb)              Promise / 回调，词典加载完成时触发
 *
 * 事件：window "applangchange"（detail.lang）、webCpu.mitt "langChanged"
 */
(function () {
  "use strict";

  var cfg = window.__PAGE_I18N__ || {};
  var LS_KEY = "appLang";
  var PAGE = String(cfg.page || "").replace(/[^\w.-]/g, "");
  var VERSION = cfg.version ? "?v=" + cfg.version : "";

  function dirOf(src) {
    var path = String(src || "").split("?")[0];
    var cut = path.lastIndexOf("/");
    return cut > -1 ? path.slice(0, cut + 1) : "";
  }

  var BASE = cfg.base || dirOf(document.currentScript && document.currentScript.src) || "./i18n/";

  function urlLang() {
    try {
      var m = /[?&]lang=([a-zA-Z-]+)/.exec(window.location.search);
      return m ? m[1] : null;
    } catch (e) {
      return null;
    }
  }

  function storedLang() {
    try {
      return localStorage.getItem(LS_KEY);
    } catch (e) {
      return null;
    }
  }

  function normalize(value) {
    return value === "en" ? "en" : "zh";
  }

  var lang = normalize(urlLang() || storedLang());

  // 页面内联的 JS 文案（中文）；en 由 <page>.en.json 提供
  var extras = cfg.zh || {};

  var I18N = { zh: {}, en: {} };

  window.__I18N__ = I18N;
  window.__APP_LANG__ = lang;
  window.lang = lang;

  function dict(l) {
    return I18N[l] || I18N.zh || {};
  }

  window.__t__ = function (key, fallback) {
    var current = dict(window.__APP_LANG__ || lang);
    if (current[key] !== undefined) return current[key];
    if (I18N.zh[key] !== undefined) return I18N.zh[key];
    return fallback !== undefined ? fallback : key;
  };

  window.__tf__ = function (key, vars) {
    var text = window.__t__(key, key);
    if (!vars) return text;
    return String(text).replace(/\{(\w+)\}/g, function (whole, name) {
      return vars[name] !== undefined ? vars[name] : whole;
    });
  };

  function setMeta(kind, name, content) {
    if (!content) return;
    var el = document.querySelector('meta[' + kind + '="' + name + '"]');
    if (el) el.setAttribute("content", content);
  }

  function each(selector, fn) {
    var nodes = document.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i++) fn(nodes[i]);
  }

  function apply(l) {
    var en = l === "en";
    var current = dict(l);
    var zh = I18N.zh || {};

    // 当前语言没有的词条回退到中文，避免切到英文后出现空白或 key
    function t(key) {
      if (current[key] !== undefined) return current[key];
      if (zh[key] !== undefined) return zh[key];
      return undefined;
    }

    document.documentElement.lang = en ? "en" : "zh-CN";
    document.documentElement.setAttribute("data-lang", en ? "en" : "zh");

    // 解析早期 <head> 可能还没读到 <title>，此时先跳过，DOMContentLoaded 会再补一次
    var title = t("title");
    if (title && document.head && document.head.querySelector("title")) document.title = title;

    setMeta("name", "description", t("description"));
    setMeta("property", "og:title", t("ogTitle"));
    setMeta("name", "twitter:title", t("ogTitle"));
    setMeta("property", "og:description", t("ogDescription"));
    setMeta("name", "twitter:description", t("ogDescription"));
    setMeta("property", "og:locale", en ? "en_US" : "zh_CN");

    each("[data-i18n]", function (el) {
      var value = t(el.getAttribute("data-i18n"));
      if (value !== undefined) el.textContent = value;
    });

    each("[data-i18n-html]", function (el) {
      var value = t(el.getAttribute("data-i18n-html"));
      if (value !== undefined) el.innerHTML = value;
    });

    each("[data-i18n-aria]", function (el) {
      var value = t(el.getAttribute("data-i18n-aria"));
      if (value !== undefined) el.setAttribute("aria-label", value);
    });

    each("[data-i18n-alt]", function (el) {
      var value = t(el.getAttribute("data-i18n-alt"));
      if (value !== undefined) el.setAttribute("alt", value);
    });

    each("[data-i18n-title]", function (el) {
      var value = t(el.getAttribute("data-i18n-title"));
      if (value !== undefined) el.setAttribute("title", value);
    });

    each("[data-i18n-placeholder]", function (el) {
      var value = t(el.getAttribute("data-i18n-placeholder"));
      if (value !== undefined) el.setAttribute("placeholder", value);
    });

    var toggle = document.getElementById("langToggle");
    if (toggle) {
      toggle.textContent = en ? "中文" : "EN";
      toggle.setAttribute("aria-label", en ? "Switch to Chinese" : "切换到英文");
      // 按钮文案本身就是另一种语言，标注 lang 让读屏正确发音
      toggle.setAttribute("lang", en ? "zh-CN" : "en");
    }
  }

  function notify(l) {
    try {
      window.dispatchEvent(new CustomEvent("applangchange", { detail: { lang: l } }));
    } catch (e) { }
    try {
      if (window.webCpu && webCpu.mitt) webCpu.mitt.emit("langChanged", l);
    } catch (e) { }
  }

  function persist(l) {
    try {
      localStorage.setItem(LS_KEY, l);
    } catch (e) { }

    // 刷新时 URL 参数优先于 localStorage；切换语言时同步地址栏，
    // 避免上次残留的 ?lang=en 把中文刷新回英文。
    try {
      var url = new URL(window.location.href);
      if (l === "en") url.searchParams.set("lang", "en");
      else url.searchParams.delete("lang");

      var nextUrl = url.pathname + url.search + url.hash;
      var currentUrl = window.location.pathname + window.location.search + window.location.hash;
      if (nextUrl !== currentUrl) window.history.replaceState(null, "", nextUrl);
    } catch (e) { }
  }

  function commit(next) {
    lang = normalize(next);
    window.lang = lang;
    window.__APP_LANG__ = lang;
    persist(lang);
    // 词典还没到齐时先记下语言，加载完成后 tryApply 会按新语言渲染
    tryApply();
  }

  window.__setAppLang__ = commit;

  // ---------- 词典加载 ----------

  var dictsReady = false;
  var waiting = [];

  function getJson(url) {
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    });
  }

  function markReady() {
    dictsReady = true;
    window.__i18nReady__ = true;
    tryApply();
    var cbs = waiting;
    waiting = [];
    for (var i = 0; i < cbs.length; i++) {
      try { cbs[i](); } catch (e) { }
    }
  }

  // 词典到齐就立刻渲染：不必等 DOMContentLoaded——
  // 首页要等 tailwind / gtag 等外部脚本，DOMContentLoaded 可能晚好几秒，
  // 提前渲染能明显减少英文版闪中文的时间。解析完成后会再补一次。
  function tryApply() {
    if (!dictsReady || !document.body) return;
    apply(lang);
    notify(lang);
  }

  window.__i18nReady = function (cb) {
    if (window.__i18nReady__) {
      if (typeof cb === "function") cb();
      return Promise.resolve();
    }
    return new Promise(function (resolve) {
      waiting.push(function () {
        if (typeof cb === "function") cb();
        resolve();
      });
    });
  };

  function bindToggle() {
    var toggle = document.getElementById("langToggle");
    if (!toggle || toggle.getAttribute("data-i18n-bound") === "1") return;

    toggle.setAttribute("data-i18n-bound", "1");
    toggle.addEventListener("click", function () {
      commit(lang === "en" ? "zh" : "en");
    });
  }

  function onDomReady() {
    bindToggle();
    tryApply();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onDomReady);
  } else {
    onDomReady();
  }

  var tasks = [getJson(BASE + "en.json").catch(function () { return {}; })];

  if (PAGE) {
    tasks.push(getJson(BASE + PAGE + ".en.json" + VERSION).catch(function () { return {}; }));
    tasks.push(getJson(BASE + PAGE + ".zh.json" + VERSION).catch(function () { return {}; }));
  } else {
    tasks.push(Promise.resolve({}));
    tasks.push(Promise.resolve({}));
  }

  Promise.all(tasks).then(function (res) {
    // 共用词条在前，页面词条在后，页面同名 key 覆盖共用 key
    I18N.en = Object.assign({}, res[0], res[1]);
    I18N.zh = Object.assign({}, res[2], extras);
    markReady();
  });
})();
