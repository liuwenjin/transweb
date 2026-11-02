#!/usr/bin/env node
/**
 * validate.mjs — 通用自动化流程与产物的静态校验
 *
 * 用法：
 *   node validate.mjs <flow.json> [--inpage page.html] [--runner run.mjs]
 *                     [--console console.html] [--server serve.mjs]
 *                     [--json] [--no-runner-dry-run]
 *
 * 校验内容：
 *   - flow spec 的结构、模式约束、秘密/变量引用、明显脆弱点；
 *   - inpage 页面是否自包含、运行时/流程是否内联、iframe 是否配置；
 *   - Playwright runner 语法、dry-run、结果标记；
 *   - console / server 的关键标记与语法。
 *
 * 注意：这是静态校验，不等于浏览器实跑；跨站选择器、登录态、验证码等仍需人工验证。
 */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { readJsonFile, validateFlow } from "./lib/flow.mjs";

const LEFTOVER_TOKENS = [
  "TITLE_HTML", "DESCRIPTION_HTML", "SPEC_JSON", "RUNTIME_JS",
  "IFRAME_SRC", "INITIAL_VARS_JS", "RUN_CMD_HTML", "RUN_CMD_JS", "HAS_SERVER",
  "RUN_FILE", "CONSOLE_FILE", "FLOW_FILE",
];

function fatal(message) {
  console.error("\n✖ " + message + "\n");
  process.exit(1);
}

function help() {
  console.log(`
用法：node validate.mjs <flow.json> [options]

  --inpage <file>          校验生成的 inpage 承载页
  --runner <file>          校验 Playwright 执行器（含 node --check + dry-run）
  --console <file>         校验运行控制台
  --server <file>          校验本地运行服务
  --no-runner-dry-run      跳过 runner --dry-run
  --json                   JSON 输出
  -h, --help               显示帮助
`);
}

function parseArgs(argv) {
  const args = {
    flow: "",
    inpage: "",
    runner: "",
    console: "",
    server: "",
    runnerDryRun: true,
    json: false,
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const value = argv[i];
    if (value === "-h" || value === "--help") args.help = true;
    else if (value === "--inpage") args.inpage = argv[++i] || "";
    else if (value === "--runner") args.runner = argv[++i] || "";
    else if (value === "--console") args.console = argv[++i] || "";
    else if (value === "--server") args.server = argv[++i] || "";
    else if (value === "--no-runner-dry-run") args.runnerDryRun = false;
    else if (value === "--json") args.json = true;
    else if (value.startsWith("-")) fatal("未知参数：" + value);
    else if (!args.flow) args.flow = value;
    else fatal("只接受一个 flow.json，多余参数：" + value);
  }
  return args;
}

function display(file) {
  const rel = path.relative(process.cwd(), file);
  return rel && !rel.startsWith("..") ? rel : file;
}

function readText(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch (error) {
    return "";
  }
}

function checkLeftoverTokens(content, file, errors) {
  LEFTOVER_TOKENS.forEach((token) => {
    if (content.indexOf("{{" + token + "}}") !== -1) {
      errors.push(display(file) + " 残留模板占位符 {{" + token + "}}");
    }
  });
}

function extractBalanced(content, marker) {
  const at = content.indexOf(marker);
  if (at === -1) return null;
  const start = content.indexOf("{", at + marker.length);
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < content.length; i++) {
    const ch = content[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return content.slice(start, i + 1);
    }
  }
  return null;
}

function parseEmbeddedSpec(content, marker, file, errors) {
  const text = extractBalanced(content, marker);
  if (!text) {
    errors.push(display(file) + " 找不到内嵌流程（" + marker + "）");
    return null;
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    errors.push(display(file) + " 内嵌流程不是合法 JSON：" + error.message);
    return null;
  }
}

function checkSpecMatches(embedded, flow, file, errors) {
  if (!embedded) return;
  if (embedded.name !== flow.name) {
    errors.push(display(file) + " 内嵌流程 name=\"" + embedded.name + "\" 与 spec 不一致");
  }
  if (!Array.isArray(embedded.steps) || embedded.steps.length !== flow.steps.length) {
    errors.push(display(file) + " 内嵌流程步骤数与 spec 不一致");
  }
}

function validateInpage(file, flow, errors, warnings) {
  const content = readText(file);
  if (!content) {
    errors.push("读不到 inpage 页面：" + display(file));
    return;
  }
  if (!/<!DOCTYPE html>/i.test(content)) errors.push(display(file) + " 缺少 <!DOCTYPE html>");
  if (!/name="robots"[^>]*noindex/i.test(content)) warnings.push(display(file) + " 缺少 robots noindex");
  if (!/AutoFlow\.mount\s*\(/.test(content)) errors.push(display(file) + " 没有调用 AutoFlow.mount");
  if (!/id="af-frame"/.test(content)) errors.push(display(file) + " 缺少 #af-frame");
  if (!/var VERSION = "2\.0\.0"/.test(content)) warnings.push(display(file) + " 未发现内联 runtime 2.0.0");
  if (/<script[^>]+src=/.test(content)) warnings.push(display(file) + " 引用了外部脚本，inpage 页面不再自包含");

  checkLeftoverTokens(content, file, errors);
  const embedded = parseEmbeddedSpec(content, "var AUTOFLOW_SPEC =", file, errors);
  checkSpecMatches(embedded, flow, file, errors);

  const iframe = content.match(/<iframe[^>]+id="af-frame"[^>]*src="([^"]*)"/i) ||
    content.match(/<iframe[^>]+src="([^"]*)"[^>]*id="af-frame"/i);
  if (!iframe || !iframe[1] || iframe[1] === "about:blank") {
    errors.push(display(file) + " iframe 没有有效的初始 src");
  }
}

function checkNodeSyntax(file, errors, warnings) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8", timeout: 15000 });
  if (result.status !== 0) {
    errors.push(display(file) + " 语法检查失败：" + (result.stderr || result.stdout || "").trim().split("\n").slice(-3).join(" "));
    return false;
  }
  return true;
}

function validateRunner(file, flow, errors, warnings, dryRun) {
  const content = readText(file);
  if (!content) {
    errors.push("读不到 runner：" + display(file));
    return;
  }
  checkLeftoverTokens(content, file, errors);
  if (!/AUTOFLOW_RESULT/.test(content)) warnings.push(display(file) + " 没有 AUTOFLOW_RESULT 结果标记，控制台无法解析结果");
  if (!/chromium\.launch/.test(content)) errors.push(display(file) + " 没有 chromium.launch");

  const embedded = parseEmbeddedSpec(content, "const SPEC =", file, errors);
  checkSpecMatches(embedded, flow, file, errors);

  if (!checkNodeSyntax(file, errors, warnings)) return;

  if (dryRun) {
    const result = spawnSync(process.execPath, [file, "--dry-run"], {
      encoding: "utf8",
      timeout: 15000,
    });
    if (result.status !== 0) {
      errors.push(display(file) + " --dry-run 失败：" + (result.stderr || result.stdout || "").trim());
    } else if (!/\[dry-run\]/.test(result.stdout || "")) {
      errors.push(display(file) + " --dry-run 没有输出预期内容");
    }
  }

  if (flow.mode === "inpage") {
    warnings.push(display(file) + " 是 Playwright 产物，但 spec.mode=inpage");
  }
}

function validateConsole(file, flow, errors, warnings) {
  const content = readText(file);
  if (!content) {
    errors.push("读不到控制台：" + display(file));
    return;
  }
  checkLeftoverTokens(content, file, errors);
  if (!/id="runBtn"/.test(content)) errors.push(display(file) + " 缺少运行按钮 #runBtn");
  if (!/api\/run/.test(content)) errors.push(display(file) + " 没有调用 /api/run");
  const embedded = parseEmbeddedSpec(content, "var SPEC =", file, errors);
  checkSpecMatches(embedded, flow, file, errors);
}

function validateServer(file, errors, warnings) {
  const content = readText(file);
  if (!content) {
    errors.push("读不到服务脚本：" + display(file));
    return;
  }
  if (!/127\.0\.0\.1/.test(content)) errors.push(display(file) + " 没有绑定 127.0.0.1");
  if (!/spawn\s*\(/.test(content)) errors.push(display(file) + " 没有 spawn runner");
  if (!/\/api\/run/.test(content)) errors.push(display(file) + " 没有 /api/run");
  checkNodeSyntax(file, errors, warnings);
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

  const result = validateFlow(raw);
  const errors = result.errors.slice();
  const warnings = result.warnings.slice();
  const flow = result.flow;

  if (args.inpage) validateInpage(path.resolve(process.cwd(), args.inpage), flow, errors, warnings);
  if (args.runner) validateRunner(path.resolve(process.cwd(), args.runner), flow, errors, warnings, args.runnerDryRun);
  if (args.console) validateConsole(path.resolve(process.cwd(), args.console), flow, errors, warnings);
  if (args.server) validateServer(path.resolve(process.cwd(), args.server), errors, warnings);

  const ok = errors.length === 0;
  const summary = {
    ok,
    flow: display(flowFile),
    mode: result.mode,
    steps: flow.steps.length,
    errors,
    warnings,
    artifacts: {
      inpage: args.inpage || null,
      runner: args.runner || null,
      console: args.console || null,
      server: args.server || null,
    },
  };

  if (args.json) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(ok ? 0 : 1);
  }

  console.log("\n检查：" + display(flowFile));
  console.log("模式：" + result.mode + " · 步骤：" + flow.steps.length);

  if (warnings.length) {
    console.log("\n⚠ 警告 " + warnings.length + " 条：");
    [...new Set(warnings)].forEach((warning) => console.log("  - " + warning));
  }
  if (errors.length) {
    console.log("\n✖ 错误 " + errors.length + " 条：");
    errors.forEach((error) => console.log("  - " + error));
    console.log("\n结果：未通过\n");
    process.exit(1);
  }
  console.log("\n✔ 结果：通过（静态校验；浏览器实跑仍需人工自测）\n");
}

try {
  main();
} catch (error) {
  fatal(error && error.stack ? error.stack : String(error));
}
