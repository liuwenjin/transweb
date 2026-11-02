#!/usr/bin/env node
/**
 * inspect.mjs — 目标页面结构探测（辅助写 flow spec）
 *
 * 用法：
 *   node inspect.mjs <url> [--out report.json] [--screenshot shot.png]
 *                       [--max 300] [--headed] [--timeout 30000] [--json]
 *
 * 优先使用 Playwright 打开真实页面，列出可交互元素与候选选择器、表单、标题、iframe。
 * 未安装 Playwright 时退化为 fetch + 正则解析（只看静态 HTML，JS 渲染的内容不可见）。
 *
 * 安全：只用于你有权访问/自动化的页面；不要对内网/第三方站点做未授权探测。
 */

import fs from "node:fs";
import path from "node:path";

function fatal(message) {
  console.error("\n✖ " + message + "\n");
  process.exit(1);
}

function help() {
  console.log(`
用法：node inspect.mjs <url> [options]

  --out <file>          报告输出（JSON）
  --screenshot <file>   截图（需要 Playwright）
  --max <n>             最多收集多少个元素（默认 300）
  --headed              有头模式
  --timeout <ms>        页面加载超时（默认 30000）
  --json                只输出 JSON
  -h, --help            显示帮助
`);
}

function parseArgs(argv) {
  const args = {
    url: "",
    out: "",
    screenshot: "",
    max: 300,
    headed: false,
    timeout: 30000,
    json: false,
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const value = argv[i];
    if (value === "-h" || value === "--help") args.help = true;
    else if (value === "--out") args.out = argv[++i] || "";
    else if (value === "--screenshot") args.screenshot = argv[++i] || "";
    else if (value === "--max") args.max = Number(argv[++i]) || 300;
    else if (value === "--headed") args.headed = true;
    else if (value === "--timeout") args.timeout = Number(argv[++i]) || 30000;
    else if (value === "--json") args.json = true;
    else if (value.startsWith("-")) fatal("未知参数：" + value);
    else if (!args.url) args.url = value;
    else fatal("只接受一个 URL，多余参数：" + value);
  }
  return args;
}

function decodeEntities(value) {
  return String(value)
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function collectWithPlaywright(url, options) {
  return (async () => {
    let chromium;
    try {
      ({ chromium } = await import("playwright"));
    } catch (error) {
      try {
        ({ chromium } = await import("playwright-core"));
      } catch (error2) {
        return null;
      }
    }

    const browser = await chromium.launch({ headless: !options.headed });
    try {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();
      const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: options.timeout });
      await page.waitForTimeout(800);

      const data = await page.evaluate((max) => {
        function normalize(value) {
          return String(value == null ? "" : value).replace(/\s+/g, " ").trim();
        }
        function escapeCss(value) {
          if (window.CSS && CSS.escape) return CSS.escape(value);
          return String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
        }
        function isDynamic(value) {
          if (!value) return true;
          return /(:r[0-9a-z]+:|^[0-9a-f]{8}-|[\-_][0-9a-f]{8,}$|^(el|ant|react|vue|n)-|[\-_]\d+[\-_]\d+|^\d+$|\d{4,})/i.test(value);
        }
        function stableClasses(el) {
          return Array.prototype.slice.call(el.classList || [])
            .filter((name) => name && !/^(animate__|js-|is-|has-)/.test(name))
            .filter((name) => !/[_]{2,}|[a-z0-9]{8,}/i.test(name))
            .slice(0, 3);
        }
        function cssPath(el) {
          if (!(el instanceof Element)) return "";
          const parts = [];
          let node = el;
          let depth = 0;
          while (node && node.nodeType === 1 && depth < 5) {
            if (node === document.body || node === document.documentElement) {
              parts.unshift(node.tagName.toLowerCase());
              break;
            }
            let part = node.tagName.toLowerCase();
            const classes = stableClasses(node);
            if (classes.length) part += "." + classes.join(".");
            const parent = node.parentElement;
            if (parent) {
              const siblings = Array.prototype.filter.call(parent.children, (child) => child.tagName === node.tagName);
              if (siblings.length > 1) part += ":nth-of-type(" + (siblings.indexOf(node) + 1) + ")";
            }
            parts.unshift(part);
            node = node.parentElement;
            depth++;
          }
          return parts.join(" > ");
        }
        function selectorsFor(el) {
          const out = [];
          const attrs = ["data-testid", "data-test-id", "data-test", "data-qa", "data-id", "name", "aria-label"];
          attrs.forEach((attr) => {
            const value = el.getAttribute(attr);
            if (value && !isDynamic(value) && out.length < 4) {
              out.push("[" + attr + "=\"" + value.replace(/"/g, '\\"') + "\"]");
            }
          });
          const id = el.id;
          if (id && !isDynamic(id)) out.push("#" + escapeCss(id));
          const tag = el.tagName.toLowerCase();
          const classes = stableClasses(el);
          if (classes.length) out.push(tag + "." + classes.join("."));
          const text = normalize(el.innerText || el.textContent);
          if (text && text.length <= 40 && ["a", "button"].includes(tag)) {
            out.push("text=" + text);
          }
          const css = cssPath(el);
          if (css) out.push(css);
          return out.filter((item, index, list) => item && list.indexOf(item) === index).slice(0, 6);
        }

        const result = {
          title: document.title,
          url: location.href,
          headings: [],
          forms: [],
          elements: [],
          frames: [],
          counts: {},
        };

        Array.prototype.forEach.call(document.querySelectorAll("h1,h2,h3"), (el) => {
          result.headings.push({ tag: el.tagName.toLowerCase(), text: normalize(el.innerText || el.textContent) });
        });

        Array.prototype.forEach.call(document.querySelectorAll("form"), (form, formIndex) => {
          const fields = Array.prototype.map.call(form.querySelectorAll("input,select,textarea"), (field) => ({
            tag: field.tagName.toLowerCase(),
            type: field.getAttribute("type") || "",
            name: field.getAttribute("name") || "",
            id: field.id || "",
            placeholder: field.getAttribute("placeholder") || "",
            required: !!field.required,
            selectors: selectorsFor(field),
          }));
          result.forms.push({
            index: formIndex + 1,
            action: form.getAttribute("action") || "",
            method: (form.getAttribute("method") || "get").toLowerCase(),
            fields,
            selectors: selectorsFor(form),
          });
        });

        const candidates = document.querySelectorAll(
          "a[href],button,input,select,textarea,[role=button],[contenteditable=true]"
        );
        Array.prototype.forEach.call(candidates, (el) => {
          if (result.elements.length >= max) return;
          const tag = el.tagName.toLowerCase();
          const type = (el.getAttribute("type") || "").toLowerCase();
          if (tag === "input" && ["hidden"].includes(type)) return;
          const rect = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          const visible = rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
          if (!visible) return;
          result.elements.push({
            tag,
            type,
            role: el.getAttribute("role") || "",
            text: normalize(el.innerText || el.textContent || el.value || el.getAttribute("aria-label")),
            href: el.getAttribute("href") || "",
            disabled: !!el.disabled,
            selectors: selectorsFor(el),
          });
        });

        Array.prototype.forEach.call(document.querySelectorAll("iframe"), (frame) => {
          result.frames.push({
            src: frame.getAttribute("src") || "",
            title: frame.getAttribute("title") || "",
            selectors: selectorsFor(frame),
          });
        });

        result.counts = {
          headings: result.headings.length,
          forms: result.forms.length,
          elements: result.elements.length,
          frames: result.frames.length,
        };
        result.hasPassword = !!document.querySelector("input[type=password]");
        result.hasCaptcha = !!document.querySelector("[class*=captcha],[id*=captcha],iframe[src*=captcha]");
        return result;
      }, options.max);

      let status = null;
      try { status = response ? response.status() : null; } catch (error) { /* 忽略 */ }
      data.status = status;
      data.engine = "playwright";

      if (options.screenshot) {
        const target = path.resolve(process.cwd(), options.screenshot);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        await page.screenshot({ path: target, fullPage: true });
        data.screenshot = target;
      }
      return data;
    } finally {
      await browser.close();
    }
  })().catch((error) => {
    return { error: error.message };
  });
}

async function collectWithFetch(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeout || 30000);
  let response;
  let html;
  try {
    response = await fetch(url, {
      headers: {
        "User-Agent": "AutoFlow-Inspect/1.0 (+authorized use only)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: controller.signal,
    });
    html = await response.text();
  } finally {
    clearTimeout(timer);
  }
  const result = {
    engine: "fetch",
    warning: "未安装 Playwright 或浏览器启动失败；只解析了静态 HTML，JS 渲染内容与真实可见性不可见。",
    status: response.status,
    url: response.url,
    title: decodeEntities((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || ""),
    headings: [],
    forms: [],
    elements: [],
    frames: [],
    counts: {},
  };

  const headingRe = /<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match;
  while ((match = headingRe.exec(html)) && result.headings.length < 50) {
    result.headings.push({ tag: "h" + match[1], text: decodeEntities(match[2].replace(/<[^>]+>/g, "")) });
  }

  const formRe = /<form\b([^>]*)>([\s\S]*?)<\/form>/gi;
  while ((match = formRe.exec(html)) && result.forms.length < 20) {
    const attrs = match[1];
    const body = match[2];
    const get = (name) => {
      const found = attrs.match(new RegExp(name + "\\s*=\\s*(\"([^\"]*)\"|'([^']*)'|([^\\s>]+))", "i"));
      return found ? decodeEntities(found[2] || found[3] || found[4] || "") : "";
    };
    const fields = [];
    const fieldRe = /<(input|select|textarea)\b([^>]*)>/gi;
    let fieldMatch;
    while ((fieldMatch = fieldRe.exec(body)) && fields.length < 30) {
      const fieldAttrs = fieldMatch[2];
      const attr = (name) => {
        const found = fieldAttrs.match(new RegExp(name + "\\s*=\\s*(\"([^\"]*)\"|'([^']*)'|([^\\s>]+))", "i"));
        return found ? decodeEntities(found[2] || found[3] || found[4] || "") : "";
      };
      const type = attr("type").toLowerCase();
      if (fieldMatch[1].toLowerCase() === "input" && type === "hidden") continue;
      const selectors = [];
      ["data-testid", "data-test-id", "name", "id", "aria-label"].forEach((name) => {
        const value = attr(name);
        if (value) selectors.push("[" + name + "=\"" + value.replace(/"/g, '\\"') + "\"]");
      });
      fields.push({
        tag: fieldMatch[1].toLowerCase(),
        type,
        name: attr("name"),
        id: attr("id"),
        placeholder: attr("placeholder"),
        required: /\brequired\b/i.test(fieldAttrs),
        selectors,
      });
    }
    result.forms.push({
      index: result.forms.length + 1,
      action: get("action"),
      method: (get("method") || "get").toLowerCase(),
      fields,
      selectors: [],
    });
  }

  const fieldRe = /<(input|button|select|textarea|a)\b([^>]*)>/gi;
  while ((match = fieldRe.exec(html)) && result.elements.length < options.max) {
    const tag = match[1].toLowerCase();
    const attrs = match[2];
    const get = (name) => {
      const found = attrs.match(new RegExp(name + "\\s*=\\s*(\"([^\"]*)\"|'([^']*)'|([^\\s>]+))", "i"));
      return found ? decodeEntities(found[2] || found[3] || found[4] || "") : "";
    };
    const type = get("type").toLowerCase();
    if (tag === "input" && type === "hidden") continue;
    const text = decodeEntities((attrs.match(/value\s*=\s*("([^"]*)"|'([^']*)')/i) || [])[2] || "");
    const selectors = [];
    ["data-testid", "data-test-id", "name", "id", "aria-label"].forEach((attr) => {
      const value = get(attr);
      if (value) selectors.push("[" + attr + "=\"" + value.replace(/"/g, '\\"') + "\"]");
    });
    if (tag === "a" && get("href")) selectors.push("a[href=\"" + get("href").replace(/"/g, '\\"') + "\"]");
    result.elements.push({ tag, type, text, selectors });
  }

  const frameRe = /<iframe\b([^>]*)>/gi;
  while ((match = frameRe.exec(html)) && result.frames.length < 20) {
    const attrs = match[1];
    const get = (name) => {
      const found = attrs.match(new RegExp(name + "\\s*=\\s*(\"([^\"]*)\"|'([^']*)'|([^\\s>]+))", "i"));
      return found ? decodeEntities(found[2] || found[3] || found[4] || "") : "";
    };
    result.frames.push({ src: get("src"), title: get("title"), selectors: [] });
  }

  result.hasPassword = /type\s*=\s*["']?password/i.test(html);
  result.hasCaptcha = /captcha/i.test(html);
  result.counts = {
    headings: result.headings.length,
    forms: result.forms.length,
    elements: result.elements.length,
    frames: result.frames.length,
  };
  return result;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    help();
    return;
  }
  if (!args.url) fatal("缺少 URL（--help 查看用法）");

  const url = /^https?:\/\//i.test(args.url) ? args.url : "https://" + args.url;
  let report;
  try {
    report = await collectWithPlaywright(url, args);
  } catch (error) {
    report = { error: error.message };
  }

  if (!report || report.error) {
    if (!report || (report.error && /找不到|Cannot find|playwright/i.test(report.error))) {
      try {
        report = await collectWithFetch(url, args);
      } catch (fetchError) {
        fatal("探测失败：" + (report && report.error ? report.error : "") + "\n  fetch 也失败：" + fetchError.message);
      }
    } else {
      fatal("探测失败：" + report.error);
    }
  }

  if (args.out) {
    const out = path.resolve(process.cwd(), args.out);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(report, null, 2) + "\n", "utf8");
    report.report = out;
  }

  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log("\n目标：" + report.url);
  console.log("引擎：" + report.engine + (report.status ? " · HTTP " + report.status : ""));
  if (report.title) console.log("标题：" + report.title);
  if (report.warning) console.log("⚠ " + report.warning);
  console.log("统计：" + JSON.stringify(report.counts));

  if (report.headings.length) {
    console.log("\n标题结构：");
    report.headings.slice(0, 12).forEach((item) => console.log("  " + item.tag + " " + item.text));
  }

  if (report.forms.length) {
    console.log("\n表单：");
    report.forms.slice(0, 10).forEach((form) => {
      console.log("  #" + form.index + " " + form.method.toUpperCase() + " " + (form.action || "(无 action)"));
      form.fields.slice(0, 12).forEach((field) => {
        console.log("    - " + field.tag + (field.type ? "[" + field.type + "]" : "") +
          (field.name ? " name=" + field.name : "") +
          " → " + (field.selectors[0] || "(需要手写选择器)"));
      });
    });
  }

  console.log("\n可交互元素（前 25 个）：");
  report.elements.slice(0, 25).forEach((el, index) => {
    console.log("  " + String(index + 1).padStart(2, " ") + ". <" + el.tag + "> " +
      (el.text ? JSON.stringify(el.text.slice(0, 40)) + " " : "") +
      "→ " + (el.selectors[0] || "(需要手写选择器)"));
  });

  if (report.frames.length) {
    console.log("\niframe：" + report.frames.length + " 个（跨域 iframe 需要 Playwright 模式）");
  }
  if (report.hasPassword) console.log("\n⚠ 页面包含密码输入框：登录流程请用 secrets + {{secret.NAME}}，不要把密码写进 spec。");
  if (report.hasCaptcha) console.log("⚠ 疑似验证码：自动化前确认合规与人工兜底。");

  if (report.screenshot) console.log("\n截图：" + report.screenshot);
  if (report.report) console.log("报告：" + report.report);
  console.log("");
}

main().catch((error) => fatal(error && error.stack ? error.stack : String(error)));
