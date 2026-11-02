#!/usr/bin/env node
/**
 * selftest.mjs — 生成器 / 校验器 / inpage 运行时的自检
 *
 *   node docs/skills/web-automation-page/scripts/selftest.mjs
 *
 * 覆盖：
 *   1. 三个示例的生成 + 静态校验；
 *   2. inpage runtime 的 jsdom 单元测试（有 jsdom 时）；
 *   3. 生成页面可加载、内联运行时/变量正确；
 *   4. 本地控制台服务的 /api/status；
 *   5. 负例：跨域 inpage、Playwright 相对 baseUrl 必须被拒绝。
 *
 * 不修改仓库；所有产物在系统临时目录，结束后删除。
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = path.resolve(HERE, "..");
const REPO_ROOT = path.resolve(SKILL_DIR, "../../..");
const GENERATE = path.join(HERE, "generate.mjs");
const VALIDATE = path.join(HERE, "validate.mjs");
const EXAMPLES = path.join(SKILL_DIR, "examples");

const SERVER_PORT = 20000 + (process.pid % 10000);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "autoflow-selftest-"));
const out = path.join(tmp, "out");
fs.mkdirSync(out, { recursive: true });

let passed = 0;
let failed = 0;
const failures = [];
const notes = [];

function run(args, options = {}) {
  const result = spawnSync(process.execPath, args, {
    encoding: "utf8",
    timeout: options.timeout || 30000,
    cwd: options.cwd || REPO_ROOT,
  });
  return {
    status: typeof result.status === "number" ? result.status : 1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
  };
}

function check(name, result, expected = 0) {
  if (result.status === expected) {
    passed++;
    console.log("  ✔ " + name);
    return true;
  }
  failed++;
  failures.push(name);
  console.log("  ✖ " + name + "（期望 exit " + expected + "，实际 " + result.status + "）");
  const detail = (result.stderr || result.stdout || "").trim();
  if (detail) console.log(detail.split("\n").slice(-10).map((line) => "      " + line).join("\n"));
  return false;
}

function generate(example, args) {
  return run([GENERATE, path.join(EXAMPLES, example)].concat(args));
}

async function testRuntime() {
  let JSDOM;
  try {
    ({ JSDOM } = await import("jsdom"));
  } catch (error) {
    notes.push("未安装 jsdom：跳过 inpage runtime 单元测试");
    return;
  }

  const runtime = fs.readFileSync(path.join(SKILL_DIR, "assets/runtime.js"), "utf8");
  const dom = new JSDOM(`<!doctype html><html><body>
    <form id="f">
      <input id="q" name="q" value="">
      <select id="sel"><option value="a">A</option><option value="b">B</option></select>
      <input id="cb" type="checkbox">
      <button id="go" type="button">Go</button>
    </form>
    <div id="out"></div>
  </body></html>`, { runScripts: "dangerously", url: "http://localhost/app" });

  const w = dom.window;
  w.eval(runtime);
  w.document.getElementById("go").addEventListener("click", () => {
    const q = w.document.getElementById("q").value;
    w.document.getElementById("out").textContent = "result:" + q;
  });
  w.document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") w.document.getElementById("out").textContent += ":enter";
  });

  const steps = [
    { action: "fill", selector: "#{{field}}", value: "hello" },
    { action: "click", selector: "text=Go" },
    { action: "waitFor", selector: "#out", state: "attached" },
    { action: "assert", selector: "#out", contains: "result:hello" },
    { action: "extract", selector: "#out", as: "outText" },
    { action: "setVar", name: "msg", value: "{{outText}}!" },
    { action: "select", selector: "#sel", value: "b" },
    { action: "extract", selector: "#sel option", multiple: true, as: "opts" },
    { action: "setVar", name: "optCount", value: "{{opts.length}}" },
    { action: "check", selector: "#cb", checked: true },
    { action: "press", key: "Enter" },
    { action: "waitFor", text: "result:hello:enter" },
    { action: "assert", selector: "//div[@id='out']", contains: "result:hello" },
    { action: "eval", script: "ctx.setVar('evalVar', 'E'); return ctx.doc.querySelector('#q').value;", as: "evalResult" },
    {
      action: "eval",
      script: "if (!window.__attempts) { window.__attempts = 1; throw new Error('transient'); } return 'ok';",
      retry: { count: 1, interval: 10 },
      as: "retried",
    },
    { action: "click", selector: "#does-not-exist", onError: "continue" },
    { action: "assert", selector: "#out", contains: "result:hello" },
  ];

  const engine = w.AutoFlow.createEngine({
    steps,
    vars: { field: "q" },
    secrets: {},
    baseUrl: "http://localhost/app",
    getDoc: () => w.document,
    getWin: () => w,
    getUrl: () => w.location.href,
    navigate: async () => {},
    defaultTimeout: 3000,
    pollInterval: 30,
  });

  const result = await engine.run();
  if (!result.ok) throw new Error("runtime run failed: " + JSON.stringify(result));
  if (result.vars.msg !== "result:hello!") throw new Error("变量插值错误：" + result.vars.msg);
  if (result.vars.evalVar !== "E" || result.vars.evalResult !== "hello") throw new Error("eval 结果错误");
  if (result.vars.retried !== "ok") throw new Error("retry 未生效");
  if (result.vars.optCount !== "2") throw new Error("数组点路径插值错误：" + result.vars.optCount);
  const failedStep = result.results.find((item) => item.ok === false);
  if (!failedStep) throw new Error("onError=continue 没有记录失败步骤");
  w.close();
  passed++;
  console.log("  ✔ inpage runtime（jsdom）");
}

async function testHtml() {
  let JSDOM;
  try {
    ({ JSDOM } = await import("jsdom"));
  } catch (error) {
    return;
  }
  const html = fs.readFileSync(path.join(out, "loginDemo.html"), "utf8");
  const dom = new JSDOM(html, {
    runScripts: "dangerously",
    url: "http://localhost/autoflow/loginDemo.html",
    pretendToBeVisual: true,
  });
  await new Promise((resolve) => setTimeout(resolve, 300));
  const w = dom.window;
  if (!w.AutoFlow || typeof w.AutoFlow.createEngine !== "function") throw new Error("AutoFlow 未加载");
  if (!w.document.getElementById("af-bar")) throw new Error("承载页 UI 未挂载");
  if (w.AUTOFLOW_VARS.email !== "demo@example.com") throw new Error("vars 未内联");
  const frame = w.document.getElementById("af-frame");
  if (!frame || !/\/login$/.test(frame.getAttribute("src"))) throw new Error("iframe src 错误");
  w.close();
  passed++;
  console.log("  ✔ 生成页面（jsdom 加载）");
}

async function testMountNavigation() {
  let JSDOM;
  try {
    ({ JSDOM } = await import("jsdom"));
  } catch (error) {
    return;
  }

  const http = await import("node:http");
  const pages = {
    "/one.html": `<!doctype html><html><body><input id="q"><div id="one">one</div></body></html>`,
    "/two.html": `<!doctype html><html><body><h1 id="title">Two</h1></body></html>`,
  };
  const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(pages[req.url] || "<html><body>fallback</body></html>");
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;

  let dom = null;
  try {
    const runtime = fs.readFileSync(path.join(SKILL_DIR, "assets/runtime.js"), "utf8");
    dom = new JSDOM(`<!doctype html><html><head></head><body></body></html>`, {
      runScripts: "dangerously",
      url: "http://127.0.0.1:" + port + "/outer.html",
      pretendToBeVisual: true,
      resources: "usable",
    });
    const w = dom.window;
    w.eval(runtime);
    const iframe = w.document.createElement("iframe");
    iframe.id = "af-frame";
    iframe.src = "http://127.0.0.1:" + port + "/one.html";
    w.document.body.appendChild(iframe);
    await new Promise((resolve) => setTimeout(resolve, 500));

    w.AutoFlow.mount({
      spec: {
        name: "selftestNav",
        title: "Selftest Nav",
        baseUrl: "http://127.0.0.1:" + port,
        steps: [
          { action: "waitFor", selector: "#one", state: "attached" },
          { action: "goto", url: "/two.html" },
          { action: "waitFor", selector: "#title", state: "attached" },
          { action: "assert", selector: "#title", contains: "Two" },
          { action: "waitFor", url: "**/two.html" },
        ],
      },
      iframe,
    });

    let bar = null;
    for (let i = 0; i < 40; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      bar = w.document.getElementById("af-bar");
      if (bar && /af-ok|af-err/.test(bar.className)) break;
    }
    if (!bar || !/af-ok/.test(bar.className)) {
      throw new Error("mount/navigation 未成功：" + (bar ? bar.className + " " + bar.querySelector("#af-status")?.textContent : "no bar"));
    }
    if (!iframe.contentDocument || iframe.contentDocument.getElementById("title").textContent !== "Two") {
      throw new Error("iframe 未导航到 two.html");
    }
    passed++;
    console.log("  ✔ 承载页 + iframe 导航（jsdom）");
  } finally {
    if (dom) dom.window.close();
    server.close();
  }
}

async function testServer(port) {
  const server = path.join(out, "serve-multiPageAudit.mjs");
  if (!fs.existsSync(server)) throw new Error("缺少生成的 server");
  const child = spawn(process.execPath, [server], {
    cwd: out,
    env: Object.assign({}, process.env, { AUTOFLOW_PORT: String(port) }),
    stdio: ["ignore", "pipe", "pipe"],
  });

  let output = "";
  child.stdout.on("data", (chunk) => { output += chunk.toString("utf8"); });
  child.stderr.on("data", (chunk) => { output += chunk.toString("utf8"); });

  try {
    let data = null;
    for (let i = 0; i < 40; i++) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      try {
        const response = await fetch("http://127.0.0.1:" + port + "/api/status");
        if (response.ok) {
          data = await response.json();
          break;
        }
      } catch (error) {
        // 继续等
      }
    }
    if (!data || data.ok !== true) throw new Error("server 未就绪：" + output.slice(-500));
    passed++;
    console.log("  ✔ 本地控制台 /api/status（端口 " + port + "）");
  } finally {
    child.kill("SIGTERM");
    await new Promise((resolve) => setTimeout(resolve, 200));
    try { child.kill("SIGKILL"); } catch (error) { /* 忽略 */ }
  }
}

async function main() {
  console.log("AutoFlow Skill 自检");
  console.log("临时目录：" + tmp + "\n");

  console.log("1) 生成示例");
  const loginOk = check("generate loginDemo (inpage)", generate("login-demo.flow.json", ["--out", out, "--mode", "inpage", "--force"]));
  check("generate multiPageAudit (playwright+server)", generate("multi-page.flow.json", ["--out", out, "--mode", "playwright", "--with-server", "--port", String(SERVER_PORT), "--force"]));
  const caseOk = check("generate transwebInit (case)", generate("transweb-init.flow.json", ["--out", out, "--mode", "inpage", "--force"]));

  console.log("\n2) 静态校验");
  if (loginOk) check("validate loginDemo", run([VALIDATE, path.join(EXAMPLES, "login-demo.flow.json"), "--inpage", path.join(out, "loginDemo.html")]));
  check("validate multiPageAudit", run([
    VALIDATE,
    path.join(EXAMPLES, "multi-page.flow.json"),
    "--runner", path.join(out, "multiPageAudit.run.mjs"),
    "--console", path.join(out, "multiPageAudit.console.html"),
    "--server", path.join(out, "serve-multiPageAudit.mjs"),
  ]));
  if (caseOk) check("validate transwebInit", run([VALIDATE, path.join(EXAMPLES, "transweb-init.flow.json"), "--inpage", path.join(out, "transwebInitCase.html")]));

  console.log("\n3) 负例");
  const badInpage = path.join(tmp, "bad-inpage.json");
  fs.writeFileSync(badInpage, JSON.stringify({
    version: 2,
    name: "badInpage",
    title: "bad",
    mode: "inpage",
    baseUrl: "https://a.example.com",
    pages: [{ id: "main", url: "https://b.example.com/" }],
    steps: [{ action: "goto", url: "https://b.example.com/" }],
  }, null, 2));
  check("跨域 inpage 被拒绝", run([VALIDATE, badInpage]), 1);

  const badPlaywright = path.join(tmp, "bad-playwright.json");
  fs.writeFileSync(badPlaywright, JSON.stringify({
    version: 2,
    name: "badPlaywright",
    title: "bad",
    mode: "playwright",
    baseUrl: "/",
    steps: [{ action: "goto", url: "/x" }],
  }, null, 2));
  check("Playwright 相对 baseUrl 被拒绝", run([VALIDATE, badPlaywright]), 1);

  console.log("\n4) 运行时");
  try {
    await testRuntime();
  } catch (error) {
    failed++;
    failures.push("inpage runtime");
    console.log("  ✖ inpage runtime：" + error.message);
  }
  try {
    await testHtml();
  } catch (error) {
    failed++;
    failures.push("生成页面加载");
    console.log("  ✖ 生成页面加载：" + error.message);
  }
  try {
    await testMountNavigation();
  } catch (error) {
    failed++;
    failures.push("承载页导航");
    console.log("  ✖ 承载页导航：" + error.message);
  }
  try {
    await testServer(SERVER_PORT);
  } catch (error) {
    failed++;
    failures.push("本地控制台服务");
    console.log("  ✖ 本地控制台服务：" + error.message);
  }

  console.log("\n结果：" + passed + " 通过，" + failed + " 失败");
  if (notes.length) notes.forEach((note) => console.log("提示：" + note));
  if (failed) {
    console.log("失败项：\n  - " + failures.join("\n  - "));
    process.exitCode = 1;
  }
}

try {
  await main();
} finally {
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (error) { /* 忽略 */ }
}
