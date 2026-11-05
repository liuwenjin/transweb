/**
 * 轻量 Vue SFC 加载器（演示用）
 * ------------------------------------------------------------------
 * 直接 fetch .vue 文件，拆出 <template> / <script> / <style>，借助 Vue 全局构建
 * 的运行时模板编译器挂载组件。无需 Webpack / Vite，便于在内网直接演示。
 *
 * 约定：
 *   - 组件使用 Options API，`export default { ... }`；
 *   - 不使用 `<script setup>`、`import`、嵌套 `<template>`；
 *   - <style> 为普通 CSS（不使用 scoped / @apply），加载时注入一次。
 */
(function () {
  const cache = new Map();

  function extract(text, tag) {
    const re = new RegExp("<" + tag + ">([\\s\\S]*?)<\\/" + tag + ">", "i");
    const m = text.match(re);
    return m ? m[1] : "";
  }

  function injectStyle(css, url) {
    const id = "oa-sfc-style-" + url.replace(/[^a-z0-9]/gi, "-");
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.setAttribute("data-source", url);
    style.textContent = css;
    document.head.appendChild(style);
  }

  async function load(url) {
    if (cache.has(url)) return cache.get(url);

    const res = await fetch(url, { credentials: "same-origin" });
    if (!res.ok) throw new Error("组件加载失败：" + url + "（HTTP " + res.status + "）");
    const text = await res.text();

    const template = extract(text, "template");
    const script = extract(text, "script");
    const style = extract(text, "style");

    if (!template) throw new Error("组件缺少 <template>：" + url);
    if (!script) throw new Error("组件缺少 <script>：" + url);

    let options;
    try {
      const body = script.replace(/export\s+default\s+/, "return ");
      options = new Function("Vue", body)(window.Vue);
    } catch (err) {
      throw new Error("组件脚本解析失败：" + url + " → " + err.message);
    }

    if (!options || typeof options !== "object") {
      throw new Error("组件脚本未导出对象：" + url);
    }

    options.template = template;
    if (style) injectStyle(style, url);

    cache.set(url, options);
    return options;
  }

  window.OaDemo = window.OaDemo || {};
  window.OaDemo.load = load;
})();
