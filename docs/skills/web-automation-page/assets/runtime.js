/*!
 * AutoFlow inpage runtime
 * ------------------------------------------------------------------
 * 零依赖的“同源页面”自动化执行器 + 承载页 UI。
 *
 * 用法（由 generate.mjs 生成，一般不需要手写）：
 *   AutoFlow.mount({
 *     spec: { name, title, baseUrl, vars, secrets, steps, defaultTimeout },
 *     iframeId: "af-frame",
 *     vars: window.AUTOFLOW_VARS || {},
 *     secrets: window.AUTOFLOW_SECRETS || {}
 *   });
 *
 * 也可以只使用引擎：
 *   const engine = AutoFlow.createEngine({
 *     steps, vars, secrets, baseUrl,
 *     getDoc: () => doc, getWin: () => win, getUrl: () => url,
 *     navigate: async (url) => { ... }
 *   });
 *   await engine.run();
 *
 * 重要边界：inpage 只能访问同源文档。跨域页面请用 Playwright 后端。
 */
(function (global) {
  "use strict";

  var VERSION = "2.0.0";
  var STOP = { __autoflowStop: true };

  function isStop(value) {
    return value === STOP || (value && value.__autoflowStop === true);
  }

  function FlowError(message, stepIndex, cause) {
    this.name = "AutoFlowError";
    this.message = message;
    this.stepIndex = stepIndex;
    this.cause = cause;
    this.stack = (new Error(message)).stack;
  }
  FlowError.prototype = Object.create(Error.prototype);
  FlowError.prototype.constructor = FlowError;

  function isPlainObject(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
  }

  function normalizeText(value) {
    return String(value == null ? "" : value).replace(/\s+/g, " ").trim();
  }

  function globToRegExp(pattern) {
    var escaped = String(pattern)
      .replace(/[.+^${}()|[\]\\]/g, "\\$&")
      .replace(/\*\*/g, "\u0000")
      .replace(/\*/g, "[^/]*")
      .replace(/\u0000/g, ".*");
    return new RegExp("^" + escaped + "$");
  }

  function resolveUrl(url, base) {
    try {
      return new URL(String(url), base || global.location.href).href;
    } catch (e) {
      return String(url);
    }
  }

  function nowMs() {
    return typeof performance !== "undefined" && performance.now
      ? performance.now()
      : Date.now();
  }

  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  /* ------------------------------------------------------------------ */
  /* 选择器                                                              */
  /* ------------------------------------------------------------------ */

  function queryCss(doc, selector) {
    try {
      return Array.prototype.slice.call(doc.querySelectorAll(selector));
    } catch (e) {
      throw new FlowError("选择器语法错误：" + selector + "（" + e.message + "）");
    }
  }

  function queryXPath(doc, expression) {
    var result;
    try {
      result = doc.evaluate(
        expression,
        doc,
        null,
        global.XPathResult ? global.XPathResult.ORDERED_NODE_SNAPSHOT_TYPE : 7,
        null
      );
    } catch (e) {
      throw new FlowError("XPath 执行失败：" + expression + "（" + e.message + "）");
    }
    var list = [];
    for (var i = 0; i < result.snapshotLength; i++) {
      list.push(result.snapshotItem(i));
    }
    return list;
  }

  function textOf(el) {
    if (!el) return "";
    return normalizeText(el.innerText != null ? el.innerText : el.textContent);
  }

  function findByText(doc, text) {
    var needle = normalizeText(text);
    var all = doc.querySelectorAll("body *");
    var exactLeaves = [];
    var exact = [];
    var contains = [];

    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      var tag = (el.tagName || "").toLowerCase();
      if (tag === "script" || tag === "style" || tag === "noscript" || tag === "template") continue;

      var value = textOf(el);
      if (!value) continue;
      if (value === needle) {
        if (el.children.length === 0) exactLeaves.push(el);
        else exact.push(el);
      } else if (value.indexOf(needle) !== -1 && contains.length < 50) {
        contains.push(el);
      }
    }
    return exactLeaves.length ? exactLeaves : exact.length ? exact : contains;
  }

  function queryDeep(doc, selector) {
    var parts = String(selector).split(">>>").map(function (part) {
      return part.trim();
    }).filter(Boolean);
    if (!parts.length) return [];

    var current = queryCss(doc, parts[0]);

    for (var i = 1; i < parts.length; i++) {
      var next = [];
      for (var j = 0; j < current.length; j++) {
        var shadow = current[j].shadowRoot;
        if (shadow) {
          next = next.concat(queryCss(shadow, parts[i]));
        }
      }
      current = next;
    }
    return current.length ? current : [];
  }

  function queryAll(doc, selector) {
    var value = String(selector == null ? "" : selector).trim();
    if (!value) throw new FlowError("selector 不能为空");
    if (value.indexOf("xpath=") === 0) return queryXPath(doc, value.slice(6));
    if (value.indexOf("//") === 0) return queryXPath(doc, value);
    if (value.indexOf("text=") === 0) return findByText(doc, value.slice(5));
    if (value.indexOf(">>>") !== -1) return queryDeep(doc, value);
    return queryCss(doc, value);
  }

  function pickElement(doc, selector, index) {
    var list = queryAll(doc, selector);
    var position = (index == null ? 1 : Number(index)) - 1;
    if (!list.length) {
      throw new FlowError("找不到元素：" + selector);
    }
    if (!list[position]) {
      throw new FlowError("元素数量不足：" + selector + " 需要第 " + (position + 1) + " 个，实际 " + list.length + " 个");
    }
    return list[position];
  }

  /* ------------------------------------------------------------------ */
  /* DOM 操作                                                            */
  /* ------------------------------------------------------------------ */

  function isVisible(el) {
    if (!el || !el.ownerDocument) return false;
    if (el.hidden) return false;
    var win = el.ownerDocument.defaultView || global;
    var style;
    try {
      style = win.getComputedStyle(el);
    } catch (e) {
      return true;
    }
    if (!style) return true;
    if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse") return false;
    if (Number(style.opacity) === 0) return false;
    if (el.getClientRects && el.getClientRects().length === 0 && style.position !== "fixed") {
      return false;
    }
    return true;
  }

  function scrollIntoView(el) {
    try {
      el.scrollIntoView({ block: "center", inline: "center" });
    } catch (e) {
      try { el.scrollIntoView(); } catch (e2) { /* 忽略 */ }
    }
  }

  function eventCtor(win, type) {
    if (/^key/.test(type) && win.KeyboardEvent) return win.KeyboardEvent;
    if (/^(mouse|click|pointer)/.test(type) && win.MouseEvent) return win.MouseEvent;
    return win.Event;
  }

  function dispatch(el, type, init) {
    var win = el.ownerDocument.defaultView || global;
    var options = Object.assign({
      bubbles: true,
      cancelable: true,
      composed: true,
      view: win,
    }, init || {});
    var event;
    try {
      event = new (eventCtor(win, type))(type, options);
    } catch (e) {
      event = el.ownerDocument.createEvent("Event");
      event.initEvent(type, true, true);
    }
    el.dispatchEvent(event);
  }

  function setNativeValue(el, value) {
    if (!el) return;
    if (el.isContentEditable) {
      el.textContent = String(value);
      return;
    }
    var win = el.ownerDocument.defaultView || global;
    var proto = null;
    var tag = (el.tagName || "").toUpperCase();
    if (tag === "TEXTAREA" && win.HTMLTextAreaElement) proto = win.HTMLTextAreaElement.prototype;
    else if (tag === "SELECT" && win.HTMLSelectElement) proto = win.HTMLSelectElement.prototype;
    else if (win.HTMLInputElement) proto = win.HTMLInputElement.prototype;

    var descriptor = proto ? Object.getOwnPropertyDescriptor(proto, "value") : null;
    if (descriptor && descriptor.set) descriptor.set.call(el, String(value));
    else el.value = String(value);
  }

  function readValue(el) {
    if (!el) return "";
    if (el.isContentEditable) return el.textContent || "";
    if ("value" in el) return el.value;
    return el.textContent || "";
  }

  function keyCodeFor(key) {
    var map = {
      Enter: 13,
      Tab: 9,
      Escape: 27,
      Backspace: 8,
      Delete: 46,
      ArrowUp: 38,
      ArrowDown: 40,
      ArrowLeft: 37,
      ArrowRight: 39,
      " ": 32,
    };
    return map[key] || (key && key.length === 1 ? key.toUpperCase().charCodeAt(0) : 0);
  }

  function keyboardInit(key) {
    var code = keyCodeFor(key);
    return {
      key: key,
      code: key,
      keyCode: code,
      which: code,
      charCode: 0,
    };
  }

  async function clickElement(el, step) {
    scrollIntoView(el);
    var init = {
      button: step.button === "right" ? 2 : 0,
      buttons: 1,
      clientX: 1,
      clientY: 1,
      detail: step.clickCount || 1,
    };
    dispatch(el, "pointerover", init);
    dispatch(el, "pointerdown", init);
    dispatch(el, "mousedown", init);
    dispatch(el, "pointerup", init);
    dispatch(el, "mouseup", init);

    if (typeof el.click === "function") {
      el.click();
    } else {
      dispatch(el, "click", init);
    }
    if (step.clickCount && step.clickCount > 1) {
      for (var i = 1; i < step.clickCount; i++) {
        if (typeof el.click === "function") el.click();
        else dispatch(el, "click", init);
      }
    }
  }

  async function fillElement(el, value, step) {
    var text = String(value);
    scrollIntoView(el);
    if (typeof el.focus === "function") el.focus();

    if (step.clear !== false) {
      setNativeValue(el, "");
      dispatch(el, "input", {});
    }

    if (step.typingDelay && step.typingDelay > 0) {
      for (var i = 0; i < text.length; i++) {
        setNativeValue(el, text.slice(0, i + 1));
        var init = keyboardInit(text[i]);
        dispatch(el, "keydown", init);
        dispatch(el, "input", { data: text[i], inputType: "insertText" });
        dispatch(el, "keyup", init);
        await sleep(step.typingDelay);
      }
    } else {
      setNativeValue(el, text);
      dispatch(el, "input", {});
    }

    dispatch(el, "change", {});
    if (step.blur && typeof el.blur === "function") el.blur();
  }

  /* ------------------------------------------------------------------ */
  /* 引擎                                                                */
  /* ------------------------------------------------------------------ */

  function createEngine(options) {
    var opts = options || {};
    var steps = Array.isArray(opts.steps) ? opts.steps : [];
    var vars = Object.assign({}, opts.vars || {});
    var secrets = Object.assign({}, opts.secrets || {});
    var defaultTimeout = Number(opts.defaultTimeout) || 15000;
    var pollInterval = Number(opts.pollInterval) || 200;
    var emit = typeof opts.onEvent === "function" ? opts.onEvent : function () {};
    var getDoc = opts.getDoc;
    var getWin = opts.getWin;
    var getUrl = opts.getUrl || function () {
      try { return getWin().location.href; } catch (e) { return ""; }
    };
    var navigate = opts.navigate || function () {
      throw new FlowError("当前上下文不支持 goto");
    };

    var state = {
      index: 0,
      running: false,
      paused: false,
      stopped: false,
      results: [],
      startedAt: 0,
      error: null,
    };
    var framePath = [];

    function pause() {
      if (!state.running) return;
      state.paused = true;
      emit("pause", { index: state.index });
    }

    function resume() {
      state.paused = false;
      emit("resume", { index: state.index });
    }

    function stop() {
      state.stopped = true;
      state.paused = false;
      emit("stop", { index: state.index });
    }

    function isPaused() {
      return state.paused;
    }

    async function wait(ms) {
      var deadline = nowMs() + Math.max(0, Number(ms) || 0);
      while (nowMs() < deadline) {
        if (state.stopped) throw STOP;
        if (state.paused) {
          await sleep(50);
          deadline += 50;
          continue;
        }
        await sleep(Math.min(50, Math.max(1, deadline - nowMs())));
      }
      if (state.stopped) throw STOP;
    }

    function topDoc() {
      var doc;
      try {
        doc = getDoc();
      } catch (e) {
        throw new FlowError("无法访问目标页面（可能跨域）：" + e.message, state.index);
      }
      if (!doc) {
        throw new FlowError("无法访问目标页面（可能跨域或尚未加载）", state.index);
      }
      return doc;
    }

    function topWin() {
      try {
        return getWin();
      } catch (e) {
        throw new FlowError("无法访问目标窗口（可能跨域）：" + e.message, state.index);
      }
    }

    function currentDoc() {
      var doc = topDoc();
      for (var i = 0; i < framePath.length; i++) {
        var frame = doc.querySelector(framePath[i]);
        if (!frame) throw new FlowError("找不到 frame：" + framePath[i], state.index);
        doc = frame.contentDocument;
        if (!doc) throw new FlowError("frame 不可访问（可能跨域）：" + framePath[i], state.index);
      }
      return doc;
    }

    function currentWin() {
      var win = topWin();
      for (var i = 0; i < framePath.length; i++) {
        var doc = win.document;
        var frame = doc.querySelector(framePath[i]);
        if (!frame) throw new FlowError("找不到 frame：" + framePath[i], state.index);
        win = frame.contentWindow;
        if (!win) throw new FlowError("frame 不可访问（可能跨域）：" + framePath[i], state.index);
      }
      return win;
    }

    function currentUrl() {
      try {
        var win = currentWin();
        return win.location.href;
      } catch (e) {
        return "";
      }
    }

    function lookup(path) {
      var key = String(path).trim();
      if (!key) return undefined;
      if (key.indexOf("secret.") === 0) {
        return secrets[key.slice(7)];
      }
      if (Object.prototype.hasOwnProperty.call(vars, key)) return vars[key];

      var parts = key.split(".");
      var current = vars;
      for (var i = 0; i < parts.length; i++) {
        if (current == null || !Object.prototype.hasOwnProperty.call(current, parts[i])) {
          return undefined;
        }
        current = current[parts[i]];
      }
      return current;
    }

    function interpolate(value) {
      if (typeof value !== "string") return value;
      return value.replace(/\{\{\s*([^}]+?)\s*\}\}/g, function (match, expr) {
        var resolved = lookup(expr);
        if (resolved === undefined) {
          throw new FlowError("变量未提供：{{" + expr + "}}", state.index);
        }
        return String(resolved);
      });
    }

    function resolveTargetUrl(url) {
      return resolveUrl(interpolate(url), opts.baseUrl || currentUrl() || global.location.href);
    }

    function resolveSelector(step) {
      return interpolate(step.selector);
    }

    async function waitUntil(fn, timeout, label) {
      var deadline = nowMs() + (Number(timeout) || defaultTimeout);
      var lastError = null;
      while (nowMs() < deadline) {
        if (state.stopped) throw STOP;
        if (state.paused) {
          await sleep(50);
          continue;
        }
        try {
          if (await fn()) return true;
          lastError = null;
        } catch (e) {
          if (isStop(e)) throw e;
          lastError = e;
        }
        await sleep(pollInterval);
      }
      throw new FlowError(
        (label || "等待超时") + "（" + (Number(timeout) || defaultTimeout) + "ms）" +
        (lastError ? "：" + lastError.message : ""),
        state.index
      );
    }

    async function actionGoto(step) {
      var url = resolveTargetUrl(step.url);
      framePath = [];
      emit("log", { message: "导航到 " + url });
      if (typeof navigate !== "function") {
        throw new FlowError("当前上下文不支持 goto", state.index);
      }
      await navigate(url, Number(step.timeout) || defaultTimeout);
    }

    async function actionClick(step) {
      var el = pickElement(currentDoc(), resolveSelector(step), step.index);
      await clickElement(el, step);
    }

    async function actionFill(step) {
      var el = pickElement(currentDoc(), resolveSelector(step), step.index);
      await fillElement(el, interpolate(step.value), step);
    }

    async function actionPress(step) {
      var doc = currentDoc();
      var el = step.selector
        ? pickElement(doc, resolveSelector(step), step.index)
        : doc.activeElement || doc.body;
      if (el && typeof el.focus === "function") el.focus();
      var init = keyboardInit(step.key);
      dispatch(el, "keydown", init);
      dispatch(el, "keypress", init);
      dispatch(el, "keyup", init);
      if (step.submit && step.key === "Enter" && el && el.form) {
        if (typeof el.form.requestSubmit === "function") el.form.requestSubmit();
        else if (typeof el.form.submit === "function") el.form.submit();
      }
    }

    async function actionSelect(step) {
      var el = pickElement(currentDoc(), resolveSelector(step), step.index);
      var values = step.values !== undefined ? step.values : step.value;
      if (Array.isArray(values)) {
        var wanted = values.map(function (v) { return String(interpolate(v)); });
        Array.prototype.forEach.call(el.options, function (option) {
          option.selected = wanted.indexOf(option.value) !== -1;
        });
      } else {
        el.value = String(interpolate(values));
      }
      dispatch(el, "input", {});
      dispatch(el, "change", {});
    }

    async function actionCheck(step) {
      var el = pickElement(currentDoc(), resolveSelector(step), step.index);
      var want = step.checked !== false;
      if (!!el.checked !== want) {
        if (typeof el.click === "function") el.click();
        else {
          el.checked = want;
          dispatch(el, "change", {});
        }
      }
      if (!!el.checked !== want) {
        el.checked = want;
        dispatch(el, "input", {});
        dispatch(el, "change", {});
      }
    }

    async function actionHover(step) {
      var el = pickElement(currentDoc(), resolveSelector(step), step.index);
      scrollIntoView(el);
      dispatch(el, "pointerover", {});
      dispatch(el, "mouseover", {});
      dispatch(el, "mousemove", { clientX: 1, clientY: 1 });
      dispatch(el, "mouseenter", { bubbles: false });
    }

    async function actionScroll(step) {
      if (step.selector) {
        var el = pickElement(currentDoc(), resolveSelector(step), step.index);
        el.scrollIntoView({ block: step.block || "center", behavior: step.behavior || "auto" });
        return;
      }
      var win = currentWin();
      var x = Number(step.x) || 0;
      var y = Number(step.y) || 0;
      if (win.scrollTo) win.scrollTo({ left: x, top: y, behavior: step.behavior || "auto" });
    }

    async function actionWait(step) {
      await wait(Number(step.ms) || 0);
    }

    async function actionWaitFor(step) {
      var timeout = Number(step.timeout) || defaultTimeout;
      var desired = step.state || "visible";

      await waitUntil(function () {
        if (step.url) {
          var url = currentUrl();
          return !!url && globToRegExp(interpolate(step.url)).test(url);
        }
        if (step.text) {
          var doc = currentDoc();
          var body = doc.body || doc.documentElement;
          var text = normalizeText(body && (body.innerText != null ? body.innerText : body.textContent));
          return text.indexOf(normalizeText(interpolate(step.text))) !== -1;
        }
        if (step.selector) {
          var list = queryAll(currentDoc(), resolveSelector(step));
          if (desired === "detached") return list.length === 0;
          if (desired === "attached") return list.length > 0;
          if (desired === "hidden") {
            if (list.length === 0) return true;
            return !list.some(isVisible);
          }
          return list.some(isVisible);
        }
        throw new FlowError("waitFor 需要 selector / text / url 之一", state.index);
      }, timeout, "等待条件未满足");
    }

    function readAssertValue(step) {
      if (step.selector) {
        var el = pickElement(currentDoc(), resolveSelector(step), step.index);
        if (step.attr) return el.getAttribute(step.attr);
        if (step.value) return readValue(el);
        return el.innerText != null ? el.innerText : el.textContent;
      }
      if (step.url) return currentUrl();
      if (step.text) {
        var doc = currentDoc();
        var body = doc.body || doc.documentElement;
        return body ? (body.innerText != null ? body.innerText : body.textContent) : "";
      }
      throw new FlowError("assert 需要 selector / text / url 之一", state.index);
    }

    async function actionAssert(step) {
      var timeout = Number(step.timeout) || defaultTimeout;
      if (step.selector) {
        await waitUntil(function () {
          var list = queryAll(currentDoc(), resolveSelector(step));
          return list.some(isVisible) || list.length > 0;
        }, timeout, "断言目标未出现");
      }

      var actual = normalizeText(readAssertValue(step));
      var matched = true;
      var expected = null;

      if (step.equals !== undefined) {
        expected = normalizeText(interpolate(step.equals));
        matched = actual === expected;
      } else if (step.contains !== undefined) {
        expected = normalizeText(interpolate(step.contains));
        matched = actual.indexOf(expected) !== -1;
      } else if (step.matches !== undefined) {
        expected = interpolate(step.matches);
        matched = new RegExp(expected).test(actual);
      }

      if (step.not) matched = !matched;

      if (!matched) {
        throw new FlowError(
          "断言失败：实际为 \"" + actual.slice(0, 200) + "\"，期望" +
          (step.equals !== undefined ? "等于" : step.contains !== undefined ? "包含" : "匹配") +
          " \"" + expected + "\"" + (step.not ? "（取反）" : ""),
          state.index
        );
      }
    }

    async function actionExtract(step) {
      var list = queryAll(currentDoc(), resolveSelector(step));
      if (!list.length) throw new FlowError("extract 找不到元素：" + step.selector, state.index);

      function read(el) {
        if (step.attr) return el.getAttribute(step.attr);
        if (step.prop) return el[step.prop];
        if (step.html) return el.innerHTML;
        if (step.value) return readValue(el);
        return el.innerText != null ? el.innerText : el.textContent;
      }

      function output(el) {
        var value = read(el);
        return step.html ? String(value == null ? "" : value) : normalizeText(value);
      }

      if (step.multiple) {
        vars[step.as] = list.map(output);
      } else {
        var position = (step.index == null ? 1 : Number(step.index)) - 1;
        if (!list[position]) throw new FlowError("extract 目标数量不足：" + step.selector, state.index);
        vars[step.as] = output(list[position]);
      }
    }

    async function actionEval(step) {
      var script = String(step.script || "");
      var AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
      var fn = new AsyncFunction("ctx", script);
      var result = await fn({
        doc: currentDoc(),
        win: currentWin(),
        vars: vars,
        secrets: secrets,
        setVar: function (name, value) { vars[name] = value; },
        step: step,
      });
      if (step.as && result !== undefined) vars[step.as] = result;
    }

    async function actionFrame(step) {
      if (step.selector == null) {
        framePath = [];
      } else {
        // 连续 frame 动作表示逐层进入；回到顶层用 { action: "frame", selector: null }
        framePath.push(interpolate(step.selector));
      }
    }

    async function actionLog(step) {
      emit("log", { message: interpolate(step.message) });
    }

    async function actionSetVar(step) {
      vars[step.name] = interpolate(step.value);
    }

    async function actionUnsupported(step) {
      throw new FlowError(
        "inpage 模式不支持 " + step.action + "；请改用 playwright 模式",
        state.index
      );
    }

    var handlers = {
      goto: actionGoto,
      click: actionClick,
      fill: actionFill,
      press: actionPress,
      select: actionSelect,
      check: actionCheck,
      hover: actionHover,
      scroll: actionScroll,
      wait: actionWait,
      waitFor: actionWaitFor,
      assert: actionAssert,
      extract: actionExtract,
      eval: actionEval,
      frame: actionFrame,
      log: actionLog,
      setVar: actionSetVar,
      screenshot: actionUnsupported,
      upload: actionUnsupported,
    };

    async function execute(step) {
      var handler = handlers[step.action];
      if (!handler) throw new FlowError("不支持的动作：" + step.action, state.index);
      await handler(step);
    }

    function runWithTimeout(promise, timeout, label) {
      var timerId = null;
      var timeoutPromise = new Promise(function (resolve, reject) {
        timerId = setTimeout(function () {
          reject(new FlowError("步骤超时（" + timeout + "ms）：" + label, state.index));
        }, timeout);
      });
      return Promise.race([promise, timeoutPromise]).finally(function () {
        if (timerId) clearTimeout(timerId);
      });
    }

    function stepLabel(step) {
      return step.description || step.action + (step.selector ? " " + step.selector : "") + (step.url ? " " + step.url : "");
    }

    async function run() {
      if (state.running) return { ok: false, error: "正在运行中" };
      state.running = true;
      state.stopped = false;
      state.startedAt = nowMs();
      state.results = [];
      emit("start", { total: steps.length, name: opts.name || "autoflow" });

      try {
        for (state.index = 0; state.index < steps.length; state.index++) {
          if (state.stopped) throw STOP;

          var step = steps[state.index] || {};
          state.current = step;
          emit("step", {
            index: state.index,
            total: steps.length,
            step: step,
            label: stepLabel(step),
          });

          var timeout = Number(step.timeout) || defaultTimeout;
          var retry = isPlainObject(step.retry) ? step.retry : {};
          var maxRetries = Math.max(0, Number(retry.count) || 0);
          var retryInterval = Math.max(0, Number(retry.interval) || 1000);
          var attempt = 0;

          while (true) {
            try {
              await runWithTimeout(execute(step), timeout, stepLabel(step));
              emit("stepDone", { index: state.index, total: steps.length });
              state.results.push({ index: state.index, action: step.action, ok: true });
              break;
            } catch (error) {
              if (isStop(error)) throw error;

              if (attempt < maxRetries) {
                attempt++;
                emit("retry", {
                  index: state.index,
                  attempt: attempt,
                  message: error.message,
                });
                await wait(retryInterval);
                continue;
              }

              if (step.onError === "continue") {
                emit("stepError", {
                  index: state.index,
                  message: error.message,
                  continued: true,
                });
                state.results.push({ index: state.index, action: step.action, ok: false, error: error.message });
                break;
              }

              throw new FlowError(
                "步骤 " + (state.index + 1) + " 失败（" + stepLabel(step) + "）：" + error.message,
                state.index,
                error
              );
            }
          }
        }

        state.running = false;
        var summary = {
          ok: true,
          total: steps.length,
          durationMs: Math.round(nowMs() - state.startedAt),
          vars: vars,
          results: state.results,
        };
        emit("complete", summary);
        return summary;
      } catch (error) {
        state.running = false;
        state.error = error;

        if (isStop(error)) {
          emit("stopped", { index: state.index });
          return { ok: false, stopped: true, results: state.results };
        }

        var failure = {
          ok: false,
          index: state.index,
          message: error.message,
          step: steps[state.index],
          results: state.results,
        };
        emit("error", failure);
        return failure;
      }
    }

    return {
      run: run,
      pause: pause,
      resume: resume,
      stop: stop,
      isPaused: isPaused,
      getState: function () {
        return {
          index: state.index,
          total: steps.length,
          running: state.running,
          paused: state.paused,
          stopped: state.stopped,
        };
      },
      getVars: function () { return vars; },
      setVars: function (next) { Object.assign(vars, next || {}); },
    };
  }

  /* ------------------------------------------------------------------ */
  /* 承载页 UI                                                           */
  /* ------------------------------------------------------------------ */

  function formatDuration(ms) {
    var total = Math.max(0, Math.round(ms / 1000));
    var minutes = Math.floor(total / 60);
    var seconds = total % 60;
    return (minutes ? minutes + "m " : "") + seconds + "s";
  }

  function injectStyles() {
    if (document.getElementById("af-style")) return;
    var style = document.createElement("style");
    style.id = "af-style";
    style.textContent = [
      "html.af-mounted, html.af-mounted body{height:100%;margin:0;}",
      "html.af-mounted body{padding-top:52px;box-sizing:border-box;overflow:hidden;background:#f7f8fc;}",
      "#af-frame{display:block;width:100%;height:100%;border:0;}",
      "#af-bar{position:fixed;top:0;left:0;right:0;height:52px;z-index:2147483646;display:flex;align-items:center;gap:12px;padding:0 14px;box-sizing:border-box;background:#0f172a;color:#e2e8f0;font:13px/1.2 -apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif;box-shadow:0 2px 10px rgba(0,0,0,.18);}",
      "#af-bar.af-ok{background:#065f46;}",
      "#af-bar.af-err{background:#7f1d1d;}",
      "#af-bar.af-stopped{background:#334155;}",
      "#af-bar .af-dot{width:9px;height:9px;border-radius:50%;background:#38bdf8;flex:0 0 auto;}",
      "#af-bar.af-running .af-dot{animation:af-pulse 1.4s infinite;}",
      "#af-bar.af-paused .af-dot{background:#f59e0b;animation:none;}",
      "#af-bar.af-ok .af-dot{background:#34d399;animation:none;}",
      "#af-bar.af-err .af-dot{background:#f87171;animation:none;}",
      "#af-bar.af-stopped .af-dot{background:#94a3b8;animation:none;}",
      "@keyframes af-pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.35;transform:scale(.8);}}",
      "#af-title{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:38vw;}",
      "#af-status{color:#94a3b8;white-space:nowrap;}",
      "#af-spacer{flex:1 1 auto;}",
      "#af-bar button{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);color:#e2e8f0;border-radius:6px;padding:5px 10px;font:12px/1 inherit;cursor:pointer;}",
      "#af-bar button:hover{background:rgba(255,255,255,.16);}",
      "#af-bar button.af-danger{background:#dc2626;border-color:#dc2626;}",
      "#af-log{position:fixed;right:12px;bottom:12px;width:min(520px,calc(100vw - 24px));max-height:36vh;z-index:2147483647;display:none;flex-direction:column;background:#020617;color:#cbd5e1;border:1px solid #1e293b;border-radius:10px;box-shadow:0 12px 40px rgba(0,0,0,.35);overflow:hidden;}",
      "#af-log.af-open{display:flex;}",
      "#af-log header{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:#0f172a;font:12px/1 -apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif;color:#e2e8f0;}",
      "#af-log pre{margin:0;padding:10px;overflow:auto;font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap;word-break:break-word;}",
      "#af-secrets{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,.55);backdrop-filter:blur(2px);font:13px/1.5 -apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif;}",
      "#af-secrets .af-card{width:min(420px,calc(100vw - 32px));background:#fff;border-radius:14px;padding:20px;box-shadow:0 24px 60px rgba(0,0,0,.28);color:#0f172a;}",
      "#af-secrets h2{margin:0 0 6px;font-size:16px;}",
      "#af-secrets p{margin:0 0 14px;color:#64748b;font-size:12px;}",
      "#af-secrets label{display:block;margin:10px 0 4px;font-size:12px;color:#334155;}",
      "#af-secrets input{width:100%;box-sizing:border-box;padding:8px 10px;border:1px solid #cbd5e1;border-radius:8px;font:13px/1.2 inherit;}",
      "#af-secrets .af-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px;}",
      "#af-secrets button{border:1px solid #cbd5e1;background:#f8fafc;border-radius:8px;padding:8px 14px;font:13px/1 inherit;cursor:pointer;}",
      "#af-secrets button.af-primary{background:#2563eb;border-color:#2563eb;color:#fff;}",
      "#af-secrets .af-error{color:#b91c1c;font-size:12px;margin-top:8px;display:none;}",
    ].join("\n");
    document.head.appendChild(style);
  }

  function mount(options) {
    var opts = options || {};
    var spec = opts.spec || {};
    var iframe = opts.iframe || document.getElementById(opts.iframeId || "af-frame");
    if (!iframe) throw new Error("AutoFlow.mount: 找不到 iframe");

    injectStyles();
    document.documentElement.classList.add("af-mounted");

    var title = typeof spec.title === "string"
      ? spec.title
      : (spec.title && (spec.title.zh || spec.title.en)) || spec.name || "自动化流程";
    var steps = Array.isArray(spec.steps) ? spec.steps : [];
    var vars = Object.assign({}, spec.vars || {}, opts.vars || global.AUTOFLOW_VARS || {});
    var secrets = Object.assign({}, opts.secrets || global.AUTOFLOW_SECRETS || {});
    var baseUrl = spec.baseUrl
      ? resolveUrl(spec.baseUrl, global.location.href)
      : resolveUrl("/", global.location.href);
    var startedAt = 0;
    var timer = null;
    var engine = null;
    var ui = null;
    var started = false;

    function el(tag, attrs, text) {
      var node = document.createElement(tag);
      Object.keys(attrs || {}).forEach(function (key) {
        if (key === "className") node.className = attrs[key];
        else if (key === "id") node.id = attrs[key];
        else node.setAttribute(key, attrs[key]);
      });
      if (text != null) node.textContent = text;
      return node;
    }

    function createUI() {
      var bar = el("div", { id: "af-bar", className: "af-running" });
      var dot = el("span", { className: "af-dot" });
      var titleNode = el("span", { id: "af-title" }, title);
      var status = el("span", { id: "af-status" }, "准备中…");
      var spacer = el("span", { id: "af-spacer" });
      var logBtn = el("button", { type: "button" }, "日志");
      var pauseBtn = el("button", { type: "button" }, "暂停");
      var stopBtn = el("button", { type: "button", className: "af-danger" }, "终止");
      var restartBtn = el("button", { type: "button" }, "重试");

      bar.appendChild(dot);
      bar.appendChild(titleNode);
      bar.appendChild(status);
      bar.appendChild(spacer);
      bar.appendChild(logBtn);
      bar.appendChild(pauseBtn);
      bar.appendChild(stopBtn);
      bar.appendChild(restartBtn);
      document.body.appendChild(bar);

      var logPanel = el("div", { id: "af-log" });
      var logHeader = el("header");
      logHeader.appendChild(el("span", {}, "运行日志"));
      var closeLog = el("button", { type: "button" }, "关闭");
      logHeader.appendChild(closeLog);
      var logPre = el("pre", {});
      logPanel.appendChild(logHeader);
      logPanel.appendChild(logPre);
      document.body.appendChild(logPanel);

      function appendLog(message) {
        var line = "[" + new Date().toLocaleTimeString() + "] " + message;
        logPre.textContent += (logPre.textContent ? "\n" : "") + line;
        logPre.scrollTop = logPre.scrollHeight;
        if (global.console && console.log) console.log("[autoflow] " + message);
      }

      logBtn.addEventListener("click", function () {
        logPanel.classList.toggle("af-open");
      });
      closeLog.addEventListener("click", function () {
        logPanel.classList.remove("af-open");
      });
      pauseBtn.addEventListener("click", function () {
        if (!engine) return;
        if (engine.isPaused()) {
          engine.resume();
          pauseBtn.textContent = "暂停";
          bar.className = "af-running";
          status.textContent = "继续执行…";
        } else {
          engine.pause();
          pauseBtn.textContent = "继续";
          bar.className = "af-paused";
          status.textContent = "已暂停";
        }
      });
      stopBtn.addEventListener("click", function () {
        if (engine) engine.stop();
        bar.className = "af-stopped";
        status.textContent = "已终止";
        pauseBtn.disabled = true;
        stopBtn.disabled = true;
        if (timer) clearInterval(timer);
      });
      restartBtn.addEventListener("click", function () {
        global.location.reload();
      });

      return {
        setRunning: function () {
          bar.className = "af-running";
          pauseBtn.disabled = false;
          stopBtn.disabled = false;
          pauseBtn.textContent = "暂停";
        },
        setStatus: function (text) {
          status.textContent = text;
        },
        setTitle: function (text) {
          titleNode.textContent = text;
        },
        setError: function (message) {
          bar.className = "af-err";
          status.textContent = message;
          logPanel.classList.add("af-open");
          pauseBtn.disabled = true;
        },
        setComplete: function (text) {
          bar.className = "af-ok";
          status.textContent = text;
          pauseBtn.disabled = true;
          stopBtn.disabled = true;
          restartBtn.textContent = "重新运行";
        },
        setStopped: function (text) {
          bar.className = "af-stopped";
          status.textContent = text;
        },
        log: appendLog,
        openLog: function () { logPanel.classList.add("af-open"); },
        tick: function (index, total) {
          status.textContent = "步骤 " + Math.min(index + 1, total) + " / " + total +
            " · " + formatDuration(nowMs() - startedAt);
        },
      };
    }

    function onEvent(type, payload) {
      if (type === "start") {
        startedAt = nowMs();
        ui.setRunning();
        ui.setStatus("共 " + payload.total + " 步");
        timer = setInterval(function () {
          if (engine) {
            var state = engine.getState();
            if (state.running) ui.tick(state.index, state.total);
          }
        }, 500);
        return;
      }
      if (type === "step") {
        ui.tick(payload.index, payload.total);
        ui.log("步骤 " + (payload.index + 1) + "/" + payload.total + "：" + payload.label);
        return;
      }
      if (type === "stepError") {
        ui.log("步骤 " + (payload.index + 1) + " 失败：" + payload.message + (payload.continued ? "（已继续）" : ""));
        return;
      }
      if (type === "retry") {
        ui.log("步骤 " + (payload.index + 1) + " 重试 " + payload.attempt + "：" + payload.message);
        return;
      }
      if (type === "log") {
        ui.log(payload.message);
        return;
      }
      if (type === "pause") {
        ui.log("已暂停");
        return;
      }
      if (type === "resume") {
        ui.log("继续执行");
        return;
      }
      if (type === "complete") {
        if (timer) clearInterval(timer);
        ui.setComplete("完成 " + payload.total + " 步 · 用时 " + formatDuration(payload.durationMs));
        var keys = Object.keys(payload.vars || {});
        if (keys.length) {
          ui.log("变量：" + keys.map(function (key) {
            return key + "=" + JSON.stringify(payload.vars[key]);
          }).join(", "));
        }
        return;
      }
      if (type === "error") {
        if (timer) clearInterval(timer);
        ui.setError("失败：" + payload.message);
        ui.log("失败于步骤 " + (payload.index + 1) + "：" + payload.message);
        return;
      }
      if (type === "stopped") {
        if (timer) clearInterval(timer);
        ui.setStopped("已终止（第 " + (payload.index + 1) + " 步）");
      }
    }

    function currentUrl() {
      try {
        return iframe.contentWindow.location.href;
      } catch (e) {
        return iframe.src || "";
      }
    }

    function navigate(url, timeout) {
      return new Promise(function (resolve, reject) {
        var done = false;
        var timerId = null;

        function cleanup() {
          if (timerId) clearTimeout(timerId);
          iframe.removeEventListener("load", onLoad);
        }

        function finish(error) {
          if (done) return;
          done = true;
          cleanup();
          if (error) reject(error);
          else resolve();
        }

        function onLoad() {
          try {
            if (!iframe.contentDocument) {
              finish(new FlowError("目标页跨域，inpage 模式无法访问。请改用 playwright 模式。"));
              return;
            }
          } catch (e) {
            finish(new FlowError("目标页跨域，inpage 模式无法访问。请改用 playwright 模式。"));
            return;
          }
          finish();
        }

        if (currentUrl() === url) {
          finish();
          return;
        }

        timerId = setTimeout(function () {
          finish(new FlowError("页面加载超时：" + url));
        }, Number(timeout) || 15000);

        iframe.addEventListener("load", onLoad);
        iframe.src = url;
      });
    }

    function start() {
      if (started) return;
      started = true;
      ui.setRunning();
      engine = createEngine({
        name: spec.name,
        steps: steps,
        vars: vars,
        secrets: secrets,
        baseUrl: baseUrl,
        getDoc: function () { return iframe.contentDocument; },
        getWin: function () { return iframe.contentWindow; },
        getUrl: currentUrl,
        navigate: navigate,
        defaultTimeout: spec.defaultTimeout || 15000,
        onEvent: onEvent,
      });
      engine.run();
    }

    function showCrossOrigin() {
      ui.setError("无法访问跨域页面，inpage 模式不可用");
      ui.openLog();
      ui.log("浏览器同源策略禁止脚本读取跨域 iframe 的 DOM。请改用 Playwright 模式（可自动化任意站点与多标签页）。");
    }

    function askSecrets(names, callback) {
      var missing = names.filter(function (name) {
        return secrets[name] == null || secrets[name] === "";
      });
      if (!missing.length) {
        callback();
        return;
      }

      var host = document.getElementById("af-secrets");
      if (host) host.remove();
      host = el("div", { id: "af-secrets" });
      var card = el("div", { className: "af-card" });
      card.appendChild(el("h2", {}, "需要运行参数"));
      card.appendChild(el("p", {}, "这些值只保存在当前页面内存中，不会写入流程文件。"));
      var inputs = {};
      missing.forEach(function (name) {
        card.appendChild(el("label", { for: "af-secret-" + name }, name));
        var input = el("input", { id: "af-secret-" + name, type: "password", autocomplete: "off" });
        input.value = secrets[name] || "";
        inputs[name] = input;
        card.appendChild(input);
      });
      var error = el("div", { className: "af-error" });
      card.appendChild(error);
      var actions = el("div", { className: "af-actions" });
      var cancel = el("button", { type: "button" }, "取消");
      var submit = el("button", { type: "button", className: "af-primary" }, "开始执行");
      actions.appendChild(cancel);
      actions.appendChild(submit);
      card.appendChild(actions);
      host.appendChild(card);
      document.body.appendChild(host);

      setTimeout(function () {
        var first = inputs[missing[0]];
        if (first) first.focus();
      }, 50);

      cancel.addEventListener("click", function () {
        host.remove();
        ui.setStopped("已取消");
      });

      submit.addEventListener("click", function () {
        var empty = missing.filter(function (name) {
          return !inputs[name].value;
        });
        if (empty.length) {
          error.style.display = "block";
          error.textContent = "请填写：" + empty.join("、");
          return;
        }
        missing.forEach(function (name) {
          secrets[name] = inputs[name].value;
        });
        host.remove();
        callback();
      });
    }

    function boot() {
      ui = createUI();
      ui.setStatus("等待目标页加载…");

      var attempts = 0;
      var timerId = setInterval(function () {
        attempts++;
        var ready = false;
        try {
          ready = !!(iframe.contentDocument &&
            iframe.contentDocument.readyState === "complete" &&
            iframe.contentWindow.location.href !== "about:blank");
        } catch (e) {
          ready = true;
        }

        if (ready || attempts >= 100) {
          clearInterval(timerId);
          try {
            if (!iframe.contentDocument) {
              showCrossOrigin();
              return;
            }
          } catch (e) {
            showCrossOrigin();
            return;
          }
          askSecrets(Array.isArray(spec.secrets) ? spec.secrets : [], start);
        }
      }, 100);
    }

    boot();

    return {
      start: start,
      getEngine: function () { return engine; },
    };
  }

  global.AutoFlow = {
    version: VERSION,
    createEngine: createEngine,
    mount: mount,
    helpers: {
      queryAll: queryAll,
      globToRegExp: globToRegExp,
      resolveUrl: resolveUrl,
    },
  };
})(typeof window !== "undefined" ? window : this);
