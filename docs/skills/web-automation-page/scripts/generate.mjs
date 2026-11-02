#!/usr/bin/env node
/**
 * generate.mjs — 由通用 flow spec 生成自动化页面 / 脚本
 *
 * 用法：
 *   node generate.mjs <flow.json> --out <dir> [options]
 *
 * 选项：
 *   --mode auto|inpage|playwright|both   覆盖 spec.mode
 *   --out <dir>                          输出目录（默认 autoflow-dist）
 *   --no-console                         不生成 Playwright 控制台
 *   --with-server                        额外生成本地运行服务（自动开启控制台）
 *   --port <n>                           本地服务端口（默认 4173）
 *   --force                              覆盖已有文件
 *   --dry-run                            只检查与打印
 *
 * 产物：
 *   <out>/<name>.flow.json               规范源
 *   inpage:     <out>/<name>.html        自包含承载页（类似 initAdmin.html）
 *   playwright: <out>/<name>.run.mjs     Node + Playwright 执行器
 *               <out>/<name>.console.html 运行控制台
 *               <out>/serve-<name>.mjs    本地运行服务（--with-server）
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  readJsonFile,
  resolveMode,
  validateFlow,
} from "./lib/flow.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = path.resolve(HERE, "..");
const ASSETS = path.join(SKILL_DIR, "assets");
const DEFAULT_OUT = path.resolve(process.cwd(), "autoflow-dist");

function fatal(message) {
  console.error("\n✖ " + message + "\n");
  process.exit(1);
}

function help() {
  console.log(`
用法：node generate.mjs <flow.json> [options]

  --mode auto|inpage|playwright|both
  --out <dir>           输出目录（默认 autoflow-dist）
  --no-console          不生成 Playwright 控制台
  --with-server         生成 serve-<name>.mjs（本地一键运行）
  --port <n>            本地服务端口（默认 4173）
  --force               覆盖已有文件
  --dry-run             只检查与打印
  -h, --help            显示帮助
`);
}

function parseArgs(argv) {
  const args = {
    flow: "",
    out: "",
    mode: "",
    console: true,
    server: false,
    port: 4173,
    force: false,
    dryRun: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const value = argv[i];
    if (value === "-h" || value === "--help") args.help = true;
    else if (value === "--mode") args.mode = argv[++i] || "";
    else if (value === "--out") args.out = argv[++i] || "";
    else if (value === "--no-console") args.console = false;
    else if (value === "--with-server") args.server = true;
    else if (value === "--port") args.port = Number(argv[++i]) || 4173;
    else if (value === "--force") args.force = true;
    else if (value === "--dry-run") args.dryRun = true;
    else if (value.startsWith("-")) fatal("未知参数：" + value);
    else if (!args.flow) args.flow = value;
    else fatal("只接受一个 flow.json，多余参数：" + value);
  }

  return args;
}

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function jsBody(value) {
  return JSON.stringify(String(value)).slice(1, -1).replace(/</g, "\\u003C");
}

function jsonForScript(value) {
  return JSON.stringify(value).replace(/</g, "\\u003C");
}

function readTemplate(name) {
  return fs.readFileSync(path.join(ASSETS, name), "utf8");
}

function renderTemplate(template, vars, name) {
  const missing = [];
  // 单次替换：只处理模板里的占位符，不扫描已插入的值（避免误伤 spec 里的 {{VAR}}）
  const out = template.replace(/\{\{([A-Z][A-Z0-9_]*)\}\}/g, (match, key) => {
    if (!Object.prototype.hasOwnProperty.call(vars, key)) {
      missing.push(key);
      return match;
    }
    return String(vars[key]);
  });
  if (missing.length) {
    throw new Error("模板 " + name + " 缺少变量：" + [...new Set(missing)].join(", "));
  }
  return out;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function display(file) {
  const rel = path.relative(process.cwd(), file);
  return rel && !rel.startsWith("..") ? rel : file;
}

function resolveOutput(outDir, name, suffix) {
  return path.join(outDir, name + suffix);
}

function titleOf(flow) {
  if (typeof flow.title === "string") return flow.title;
  if (flow.title && typeof flow.title === "object") {
    return flow.title.zh || flow.title.en || flow.name;
  }
  return flow.name;
}

function initialIframeUrl(flow) {
  const first = flow.steps[0];
  let candidate = first && first.action === "goto" && first.url
    ? first.url
    : (flow.pages[0] && flow.pages[0].url) || flow.baseUrl || "/";
  if (candidate === "/" && flow.baseUrl) candidate = flow.baseUrl;

  if (/^https?:\/\//i.test(candidate)) return candidate;
  if (flow.baseUrl && /^https?:\/\//i.test(flow.baseUrl)) {
    try { return new URL(candidate, flow.baseUrl).href; } catch (error) { return candidate; }
  }
  if (flow.baseUrl && flow.baseUrl !== "/" && !candidate.startsWith("/")) {
    try {
      const resolved = new URL(candidate, "http://localhost" + flow.baseUrl);
      return resolved.pathname + resolved.search + resolved.hash;
    } catch (error) {
      return candidate;
    }
  }
  return candidate;
}

function generateInpage(flow, outDir, files, options) {
  if (options.console === false && options.server) {
    fatal("--with-server 需要控制台，不能同时 --no-console");
  }
  const runtime = readTemplate("runtime.js");
  const template = readTemplate("inpage.tpl.html");
  const title = titleOf(flow);
  const description = flow.description || title + "（内部自动化页面）";
  const specForPage = {
    version: 2,
    name: flow.name,
    title: flow.title,
    description: flow.description || "",
    baseUrl: flow.baseUrl || "/",
    vars: flow.vars || {},
    secrets: flow.secrets || [],
    defaultTimeout: flow.defaultTimeout || 15000,
    pages: flow.pages,
    steps: flow.steps,
  };

  const content = renderTemplate(template, {
    NAME: flow.name,
    TITLE_HTML: escapeHtml(title),
    DESCRIPTION_HTML: escapeHtml(description),
    IFRAME_SRC: escapeHtml(initialIframeUrl(flow)),
    INITIAL_VARS_JS: jsonForScript(flow.vars || {}),
    RUNTIME_JS: runtime.replace(/<\/script/gi, "<\\/script"),
    SPEC_JSON: jsonForScript(specForPage),
  }, "inpage.tpl.html");

  const file = resolveOutput(outDir, flow.name, ".html");
  files.push({ file, content, label: "inpage 承载页" });
}

function generatePlaywright(flow, outDir, files, options) {
  const base = flow.baseUrl || (flow.pages[0] && flow.pages[0].url) || "";
  if (!/^https?:\/\//i.test(base)) {
    fatal("Playwright 模式需要绝对 baseUrl / pages[0].url（当前：" + (base || "空") + "）。\n" +
      "例：\"baseUrl\": \"https://example.com\"");
  }

  const specJson = jsonForScript(flow);
  const runnerTpl = readTemplate("runner.tpl.mjs");
  const runner = renderTemplate(runnerTpl, {
    NAME: flow.name,
    SPEC_JSON: specJson,
  }, "runner.tpl.mjs");
  files.push({ file: resolveOutput(outDir, flow.name + ".run", ".mjs"), content: runner, label: "Playwright 执行器" });

  if (!options.console) return;

  const consoleTpl = readTemplate("console.tpl.html");
  const installCmd = "npm i -D playwright && npx playwright install chromium";
  const runCmd = "node " + flow.name + ".run.mjs";
  const fullCmd = installCmd + "\n" + runCmd;
  const title = titleOf(flow);

  const consoleContent = renderTemplate(consoleTpl, {
    NAME: flow.name,
    TITLE_HTML: escapeHtml(title),
    SPEC_JSON: specJson,
    RUN_CMD_HTML: escapeHtml(fullCmd),
    RUN_CMD_JS: jsBody(fullCmd),
    HAS_SERVER: options.server ? "true" : "false",
  }, "console.tpl.html");
  const consoleFile = resolveOutput(outDir, flow.name, ".console.html");
  files.push({ file: consoleFile, content: consoleContent, label: "运行控制台" });

  if (options.server) {
    const serverTpl = readTemplate("server.tpl.mjs");
    const serverContent = renderTemplate(serverTpl, {
      NAME: flow.name,
      RUN_FILE: flow.name + ".run.mjs",
      CONSOLE_FILE: flow.name + ".console.html",
      FLOW_FILE: flow.name + ".flow.json",
      PORT: options.port,
    }, "server.tpl.mjs");
    files.push({
      file: resolveOutput(outDir, "serve-" + flow.name, ".mjs"),
      content: serverContent,
      label: "本地运行服务",
    });
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    help();
    return;
  }
  if (!args.flow) fatal("缺少 flow.json（--help 查看用法）");

  const flowFile = path.resolve(process.cwd(), args.flow);
  if (!fs.existsSync(flowFile)) fatal("找不到 flow 文件：" + flowFile);

  let raw;
  try {
    raw = readJsonFile(fs, flowFile);
  } catch (error) {
    fatal("flow.json 解析失败：" + error.message);
  }

  const validation = validateFlow(raw);
  validation.warnings.forEach((warning) => console.warn("⚠ " + warning));
  if (validation.errors.length) {
    console.error("\n✖ flow 校验失败：");
    validation.errors.forEach((error) => console.error("  - " + error));
    process.exit(1);
  }

  let flow = validation.flow;
  if (args.mode) {
    if (!["auto", "inpage", "playwright", "both"].includes(args.mode)) {
      fatal("--mode 只能是 auto / inpage / playwright / both");
    }
    flow.mode = args.mode;
    const recheck = validateFlow(flow);
    if (recheck.errors.length) {
      console.error("\n✖ 指定 --mode " + args.mode + " 后校验失败：");
      recheck.errors.forEach((error) => console.error("  - " + error));
      process.exit(1);
    }
    flow = recheck.flow;
  }

  const mode = flow.mode === "auto" ? resolveMode(flow) : flow.mode;
  const outDir = path.resolve(process.cwd(), args.out || DEFAULT_OUT);

  if (args.server && mode === "inpage") {
    fatal("inpage 模式不需要运行服务；--with-server 只用于 Playwright");
  }
  if (args.server) args.console = true;

  const files = [];
  const flowJsonFile = resolveOutput(outDir, flow.name, ".flow.json");
  files.push({
    file: flowJsonFile,
    content: JSON.stringify(flow, null, 2) + "\n",
    label: "规范源",
  });

  if (mode === "inpage" || mode === "both") generateInpage(flow, outDir, files, args);
  if (mode === "playwright" || mode === "both") generatePlaywright(flow, outDir, files, args);

  const conflicts = files.filter((item) => fs.existsSync(item.file));
  if (conflicts.length && !args.force && !args.dryRun) {
    fatal("以下文件已存在，确认覆盖请加 --force：\n  - " +
      conflicts.map((item) => display(item.file)).join("\n  - "));
  }

  if (args.dryRun) {
    if (conflicts.length) {
      console.log("\n[dry-run] 已存在（实际生成需 --force）：");
      conflicts.forEach((item) => console.log("  - " + display(item.file)));
    }
    console.log("\n[dry-run] 将生成（" + mode + "）：");
    files.forEach((item) => console.log("  - " + display(item.file) + "  [" + item.label + "]"));
    console.log("\n[dry-run] 未写入任何文件。\n");
    return;
  }

  ensureDir(outDir);
  files.forEach((item) => {
    ensureDir(path.dirname(item.file));
    fs.writeFileSync(item.file, item.content, "utf8");
  });

  console.log("\n✔ 生成完成（" + mode + "）");
  files.forEach((item) => console.log("  - " + display(item.file) + "  [" + item.label + "]"));

  console.log("\n下一步：");
  if (mode === "inpage" || mode === "both") {
    console.log("  · 同源部署后打开：" + display(resolveOutput(outDir, flow.name, ".html")));
    console.log("  · 如目标页要求登录，先用浏览器登录同一 origin。");
  }
  if (mode === "playwright" || mode === "both") {
    console.log("  · 安装：npm i -D playwright && npx playwright install chromium");
    console.log("  · 运行：" + display(resolveOutput(outDir, flow.name + ".run", ".mjs")) + " --headed");
    if (args.console) {
      console.log("  · 控制台：" + display(resolveOutput(outDir, flow.name, ".console.html")));
    }
    if (args.server) {
      console.log("  · 一键运行：node " + display(resolveOutput(outDir, "serve-" + flow.name, ".mjs")) +
        "  然后打开 http://127.0.0.1:" + args.port + "/");
    }
  }
  console.log("");
}

try {
  main();
} catch (error) {
  fatal(error && error.stack ? error.stack : String(error));
}
