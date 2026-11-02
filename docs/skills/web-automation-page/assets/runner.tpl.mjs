#!/usr/bin/env node
/**
 * {{NAME}}.run.mjs — AutoFlow Playwright 执行器
 * ------------------------------------------------------------------
 * 由 web-automation-page skill 生成；流程定义内联在 SPEC 中。
 *
 * 安装：
 *   npm i -D playwright
 *   npx playwright install chromium
 *
 * 运行：
 *   node {{NAME}}.run.mjs --headed --slowmo 200
 *   node {{NAME}}.run.mjs --var email=me@example.com
 *
 * 参数：
 *   --headed                 有头模式
 *   --slowmo <ms>            每步放慢
 *   --timeout <ms>           全局默认超时
 *   --var key=value          覆盖变量（可多次）
 *   --out <dir>              截图/视频输出目录（默认 autoflow-output）
 *   --video                  录制视频
 *   --trace                  记录 trace
 *   --ignore-https-errors    忽略证书错误（仅内网/自签环境）
 *   --dry-run                只打印步骤，不启动浏览器
 *   --list                   列出步骤
 */

const SPEC = {{SPEC_JSON}};

function titleOf(spec) {
  if (!spec) return "AutoFlow";
  if (typeof spec.title === "string") return spec.title;
  if (spec.title && typeof spec.title === "object") return spec.title.zh || spec.title.en || spec.name;
  return spec.name || "AutoFlow";
}

function parseArgs(argv) {
  const args = {
    headed: false,
    slowmo: 0,
    timeout: 0,
    vars: {},
    out: "autoflow-output",
    video: false,
    trace: false,
    ignoreHttpsErrors: false,
    dryRun: false,
    list: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const value = argv[i];
    if (value === "--headed") args.headed = true;
    else if (value === "--slowmo") args.slowmo = Number(argv[++i]) || 0;
    else if (value === "--timeout") args.timeout = Number(argv[++i]) || 0;
    else if (value === "--out") args.out = argv[++i] || args.out;
    else if (value === "--video") args.video = true;
    else if (value === "--trace") args.trace = true;
    else if (value === "--ignore-https-errors") args.ignoreHttpsErrors = true;
    else if (value === "--dry-run") args.dryRun = true;
    else if (value === "--list") args.list = true;
    else if (value === "--help" || value === "-h") args.help = true;
    else if (value === "--var") {
      const pair = argv[++i] || "";
      const at = pair.indexOf("=");
      if (at === -1) {
        console.error("--var 需要 key=value：" + pair);
        process.exit(2);
      }
      args.vars[pair.slice(0, at)] = pair.slice(at + 1);
    } else if (value.startsWith("-")) {
      console.error("未知参数：" + value);
      process.exit(2);
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));

function printHelp() {
  console.log(`
{{NAME}}.run.mjs

用法：
  node {{NAME}}.run.mjs [--headed] [--slowmo 200] [--var k=v] [--out dir]
                        [--video] [--trace] [--timeout 20000] [--dry-run] [--list]

流程：${titleOf(SPEC)} 共 ${SPEC.steps.length} 步
`);
}

function stepLabel(step) {
  return step.description || step.action + (step.selector ? " " + step.selector : "") + (step.url ? " " + step.url : "");
}

if (args.help) {
  printHelp();
  process.exit(0);
}

if (args.list || args.dryRun) {
  console.log("流程：" + titleOf(SPEC));
  SPEC.steps.forEach((step, index) => {
    console.log(
      String(index + 1).padStart(2, " ") + ". [" + step.action + "]" +
      (step.page ? " @" + step.page : "") +
      (step.selector ? " " + step.selector : "") +
      (step.url ? " " + step.url : "") +
      (step.description ? "  # " + step.description : "")
    );
  });
  if (args.dryRun) console.log("\n[dry-run] 未启动浏览器。");
  process.exit(0);
}

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch (error) {
  try {
    ({ chromium } = await import("playwright-core"));
  } catch (error2) {
    console.error("找不到 playwright。请先安装：\n  npm i -D playwright\n  npx playwright install chromium");
    process.exit(1);
  }
}

/* ------------------------------------------------------------------ */
/* 变量与 URL                                                          */
/* ------------------------------------------------------------------ */

const vars = Object.assign({}, SPEC.vars || {}, args.vars);
const secrets = {};
const missingSecrets = [];
(SPEC.secrets || []).forEach((name) => {
  const value = process.env[name];
  if (value === undefined || value === "") missingSecrets.push(name);
  else secrets[name] = value;
});
if (missingSecrets.length) {
  console.error("缺少环境变量（secrets）：" + missingSecrets.join(", "));
  console.error("示例：PASSWORD=xxx node {{NAME}}.run.mjs");
  process.exit(1);
}

const BASE_URL = SPEC.baseUrl || "";
if (BASE_URL && !/^https?:\/\//i.test(BASE_URL) && !(SPEC.pages && SPEC.pages[0] && /^https?:\/\//i.test(SPEC.pages[0].url || ""))) {
  console.error("Playwright 模式需要绝对 baseUrl（当前：" + BASE_URL + "）");
  process.exit(1);
}
const DEFAULT_TIMEOUT = args.timeout || SPEC.defaultTimeout || 15000;
const OUT_DIR = args.out;

function resolveUrl(url) {
  try {
    return new URL(String(url), BASE_URL || "http://localhost/").href;
  } catch (error) {
    return String(url);
  }
}

function normalizeText(value) {
  return String(value == null ? "" : value).replace(/\s+/g, " ").trim();
}

function globToRegExp(pattern) {
  const escaped = String(pattern)
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "\u0000")
    .replace(/\*/g, "[^/]*")
    .replace(/\u0000/g, ".*");
  return new RegExp("^" + escaped + "$");
}

function lookup(path) {
  const key = String(path).trim();
  if (key.indexOf("secret.") === 0) return secrets[key.slice(7)];
  if (Object.prototype.hasOwnProperty.call(vars, key)) return vars[key];
  const parts = key.split(".");
  let current = vars;
  for (const part of parts) {
    if (current == null || !Object.prototype.hasOwnProperty.call(current, part)) return undefined;
    current = current[part];
  }
  return current;
}

function tpl(value) {
  if (typeof value !== "string") return value;
  return value.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (match, expr) => {
    const resolved = lookup(expr);
    if (resolved === undefined) {
      throw new Error("变量未提供：{{" + expr + "}}");
    }
    return String(resolved);
  });
}

function selectorOf(step) {
  return String(tpl(step.selector || "")).replace(/>>>/g, ">>");
}

function locatorIn(root, step, required = true) {
  const selector = selectorOf(step);
  let locator = root.locator(selector);
  if (step.index !== undefined) {
    locator = locator.nth(Number(step.index) - 1);
  } else if (required) {
    locator = locator.first();
  }
  return locator;
}

/* ------------------------------------------------------------------ */
/* 浏览器与会话                                                        */
/* ------------------------------------------------------------------ */

const browser = await chromium.launch({
  headless: !args.headed,
  slowMo: args.slowmo,
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  ignoreHTTPSErrors: args.ignoreHttpsErrors,
  recordVideo: args.video ? { dir: OUT_DIR + "/" + SPEC.name } : undefined,
});
if (args.trace) {
  await context.tracing.start({ screenshots: true, snapshots: true });
}

const pages = {};
const framePaths = {};
const startedAt = Date.now();
let activePage = null;

async function pageFor(id, options = {}) {
  const pageId = id || "main";
  let page = pages[pageId];
  if (!page) {
    page = await context.newPage();
    page.setDefaultTimeout(DEFAULT_TIMEOUT);
    pages[pageId] = page;
    framePaths[pageId] = [];

    const config = (SPEC.pages || []).find((item) => item.id === pageId);
    if (!options.skipGoto && config && config.url) {
      await page.goto(resolveUrl(tpl(config.url)), { waitUntil: "domcontentloaded", timeout: DEFAULT_TIMEOUT });
    }
  }
  activePage = page;
  return page;
}

function rootFor(page, pageId) {
  let root = page;
  for (const selector of framePaths[pageId] || []) {
    root = root.frameLocator(selector);
  }
  return root;
}

function pageIdFor(step) {
  return step.page || "main";
}

async function currentPage(step) {
  const page = await pageFor(pageIdFor(step), { skipGoto: step.action === "goto" });
  return page;
}

/* ------------------------------------------------------------------ */
/* 动作                                                               */
/* ------------------------------------------------------------------ */

async function runStep(step, index) {
  const timeout = Number(step.timeout) || DEFAULT_TIMEOUT;
  const page = await currentPage(step);
  const pageId = pageIdFor(step);
  const root = rootFor(page, pageId);

  switch (step.action) {
    case "goto": {
      framePaths[pageId] = [];
      await page.goto(resolveUrl(tpl(step.url)), { waitUntil: "domcontentloaded", timeout });
      return;
    }

    case "click": {
      const locator = locatorIn(root, step);
      await locator.click({
        timeout,
        button: step.button || "left",
        clickCount: step.clickCount || 1,
        modifiers: step.modifiers || [],
        force: !!step.force,
      });
      return;
    }

    case "fill": {
      const locator = locatorIn(root, step);
      const value = String(tpl(step.value));
      if (step.typingDelay) {
        if (typeof locator.pressSequentially === "function") {
          await locator.pressSequentially(value, { delay: step.typingDelay, timeout });
        } else {
          await locator.type(value, { delay: step.typingDelay, timeout });
        }
      } else {
        await locator.fill(value, { timeout });
      }
      if (step.blur) await locator.evaluate((el) => { if (el.blur) el.blur(); });
      return;
    }

    case "press": {
      if (step.selector) {
        await locatorIn(root, step).press(tpl(step.key), { timeout });
      } else {
        await page.keyboard.press(tpl(step.key));
      }
      return;
    }

    case "select": {
      const locator = locatorIn(root, step);
      const value = step.values !== undefined ? step.values : step.value;
      await locator.selectOption(Array.isArray(value) ? value.map(tpl) : String(tpl(value)), { timeout });
      return;
    }

    case "check": {
      const locator = locatorIn(root, step);
      await locator.setChecked(step.checked !== false, { timeout });
      return;
    }

    case "hover": {
      await locatorIn(root, step).hover({ timeout });
      return;
    }

    case "scroll": {
      if (step.selector) {
        await locatorIn(root, step).scrollIntoViewIfNeeded({ timeout });
      } else {
        await page.mouse.wheel(Number(step.x) || 0, Number(step.y) || 0);
      }
      return;
    }

    case "wait": {
      await page.waitForTimeout(Number(step.ms) || 0);
      return;
    }

    case "waitFor": {
      if (step.selector) {
        const state = ["attached", "detached", "hidden", "visible"].includes(step.state)
          ? step.state
          : "visible";
        await locatorIn(root, step, true).waitFor({ state, timeout });
        return;
      }
      if (step.text) {
        const text = tpl(step.text);
        await page.waitForFunction(
          (needle) => document.body && document.body.innerText.indexOf(needle) !== -1,
          text,
          { timeout }
        );
        return;
      }
      if (step.url) {
        const regex = globToRegExp(tpl(step.url));
        await page.waitForFunction(
          ({ source, flags }) => new RegExp(source, flags).test(location.href),
          { source: regex.source, flags: regex.flags },
          { timeout }
        );
        return;
      }
      throw new Error("waitFor 需要 selector / text / url 之一");
    }

    case "assert": {
      let actual = "";
      if (step.selector) {
        const locator = locatorIn(root, step);
        await locator.waitFor({ state: "attached", timeout });
        if (step.attr) actual = await locator.getAttribute(step.attr, { timeout });
        else if (step.value) actual = await locator.evaluate((el) => el.value);
        else actual = await locator.innerText({ timeout });
      } else if (step.url) {
        actual = page.url();
      } else if (step.text) {
        actual = await page.evaluate(() => document.body ? document.body.innerText : "");
      } else {
        throw new Error("assert 需要 selector / text / url 之一");
      }

      actual = normalizeText(actual);
      let expected = null;
      let matched = true;
      if (step.equals !== undefined) {
        expected = normalizeText(tpl(step.equals));
        matched = actual === expected;
      } else if (step.contains !== undefined) {
        expected = normalizeText(tpl(step.contains));
        matched = actual.indexOf(expected) !== -1;
      } else if (step.matches !== undefined) {
        expected = tpl(step.matches);
        matched = new RegExp(expected).test(actual);
      }
      if (step.not) matched = !matched;
      if (!matched) {
        throw new Error("断言失败：实际 \"" + actual.slice(0, 300) + "\"，期望 \"" + expected + "\"");
      }
      return;
    }

    case "extract": {
      const locator = locatorIn(root, step);
      const read = async (item) => {
        if (step.attr) return await item.getAttribute(step.attr, { timeout });
        if (step.prop) return await item.evaluate((node, prop) => node[prop], step.prop);
        if (step.html) return await item.innerHTML({ timeout });
        if (step.value) return await item.evaluate((el) => el.value);
        return await item.innerText({ timeout });
      };
      if (step.multiple) {
        const count = await locatorIn(root, { ...step, index: undefined }, false).count();
        const values = [];
        for (let i = 0; i < count; i++) {
          const value = await read(locatorIn(root, { ...step, index: i + 1 }, false));
          values.push(step.html ? String(value == null ? "" : value) : normalizeText(value));
        }
        vars[step.as] = values;
      } else {
        const value = await read(locator);
        vars[step.as] = step.html ? String(value == null ? "" : value) : normalizeText(value);
      }
      return;
    }

    case "eval": {
      const result = await page.evaluate(async ({ script, vars }) => {
        const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
        const fn = new AsyncFunction("vars", script);
        return await fn(vars);
      }, { script: step.script, vars });
      if (step.as && result !== undefined) vars[step.as] = result;
      return;
    }

    case "screenshot": {
      const dir = step.path ? null : (OUT_DIR + "/" + SPEC.name);
      if (dir) {
        const fs = await import("node:fs");
        fs.mkdirSync(dir, { recursive: true });
      }
      const path = step.path ? tpl(step.path) : (dir + "/shot-" + Date.now() + ".png");
      await page.screenshot({ path, fullPage: !!step.fullPage, timeout });
      console.log("[autoflow] 截图：" + path);
      return;
    }

    case "upload": {
      await locatorIn(root, step).setInputFiles(tpl(step.path), { timeout });
      return;
    }

    case "frame": {
      if (step.selector == null) framePaths[pageId] = [];
      else framePaths[pageId].push(tpl(step.selector));
      return;
    }

    case "log": {
      console.log("[autoflow] " + tpl(step.message));
      return;
    }

    case "setVar": {
      vars[step.name] = tpl(step.value);
      return;
    }

    default:
      throw new Error("不支持的动作：" + step.action);
  }
}

/* ------------------------------------------------------------------ */
/* 执行                                                               */
/* ------------------------------------------------------------------ */

function withTimeout(promise, timeout, label) {
  let timer = null;
  const guard = new Promise((resolve, reject) => {
    timer = setTimeout(() => reject(new Error("步骤超时（" + timeout + "ms）：" + label)), timeout);
  });
  return Promise.race([promise, guard]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

async function main() {
  const results = [];
  const total = SPEC.steps.length;
  console.log("[autoflow] 开始：" + titleOf(SPEC) + "（" + total + " 步）");

  for (let index = 0; index < total; index++) {
    const step = SPEC.steps[index];
    const label = stepLabel(step);
    console.log("[autoflow] [" + (index + 1) + "/" + total + "] " + label);

    const retry = step.retry && typeof step.retry === "object" ? step.retry : {};
    const maxRetries = Math.max(0, Number(retry.count) || 0);
    const retryInterval = Math.max(0, Number(retry.interval) || 1000);
    let attempt = 0;

    while (true) {
      try {
        await withTimeout(runStep(step, index), Number(step.timeout) || DEFAULT_TIMEOUT, label);
        results.push({ index, action: step.action, ok: true });
        break;
      } catch (error) {
        if (attempt < maxRetries) {
          attempt++;
          console.log("[autoflow] 重试 " + attempt + "/" + maxRetries + "：" + error.message);
          await new Promise((resolve) => setTimeout(resolve, retryInterval));
          continue;
        }

        if (step.onError === "continue") {
          console.log("[autoflow] 步骤失败但继续：" + error.message);
          results.push({ index, action: step.action, ok: false, error: error.message });
          break;
        }

        try {
          const page = activePage || pages.main;
          if (page) {
            const fs = await import("node:fs");
            const dir = OUT_DIR + "/" + SPEC.name;
            fs.mkdirSync(dir, { recursive: true });
            const file = dir + "/failure-step-" + (index + 1) + ".png";
            await page.screenshot({ path: file });
            console.log("[autoflow] 失败截图：" + file);
          }
        } catch (shotError) {
          // 忽略截图失败
        }

        throw new Error("步骤 " + (index + 1) + " 失败（" + label + "）：" + error.message);
      }
    }
  }

  const summary = {
    ok: true,
    total,
    durationMs: Date.now() - startedAt,
    vars,
    results,
  };
  return summary;
}

let exitCode = 0;
let summary = null;
try {
  summary = await main();
  try {
    const fs = await import("node:fs");
    const dir = OUT_DIR + "/" + SPEC.name;
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(dir + "/result.json", JSON.stringify(summary, null, 2));
  } catch (error) {
    // 忽略结果文件写入失败
  }
  console.log("[autoflow] 完成：共 " + summary.total + " 步，用时 " + summary.durationMs + "ms");
} catch (error) {
  exitCode = 1;
  summary = {
    ok: false,
    total: SPEC.steps.length,
    durationMs: Date.now() - startedAt,
    vars,
    error: error.message,
    results: [],
  };
  console.error("[autoflow] 失败：" + error.message);
} finally {
  if (args.trace) {
    try {
      const dir = OUT_DIR + "/" + SPEC.name;
      const fs = await import("node:fs");
      fs.mkdirSync(dir, { recursive: true });
      await context.tracing.stop({ path: dir + "/trace.zip" });
    } catch (error) {
      // 忽略 trace 失败
    }
  }
  await browser.close();
}

console.log("AUTOFLOW_RESULT " + JSON.stringify(summary));
process.exitCode = exitCode;
