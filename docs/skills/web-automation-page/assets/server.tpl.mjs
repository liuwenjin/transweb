#!/usr/bin/env node
/**
 * serve-{{NAME}}.mjs — AutoFlow 本地运行服务
 * ------------------------------------------------------------------
 * 仅监听 127.0.0.1，用 Playwright 子进程运行 {{RUN_FILE}}。
 *
 *   node serve-{{NAME}}.mjs
 *   打开 http://127.0.0.1:{{PORT}}/
 *
 * 安全：只绑定本机；不要改写为 0.0.0.0。本服务没有鉴权，等同于本机执行权限。
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const RUNNER = path.join(ROOT, "{{RUN_FILE}}");
const CONSOLE = path.join(ROOT, "{{CONSOLE_FILE}}");
const FLOW = path.join(ROOT, "{{FLOW_FILE}}");
const OUTPUT = path.join(ROOT, "autoflow-output");
const PORT = Number(process.env.AUTOFLOW_PORT) || {{PORT}};
const HOST = "127.0.0.1";

let current = null;
let lastResult = null;
let exitCode = null;
let startedAt = 0;
const logs = [];
const clients = new Set();
const MAX_LOGS = 500;

function broadcast(payload) {
  const line = "data: " + JSON.stringify(payload) + "\n\n";
  for (const res of clients) {
    try { res.write(line); } catch (error) { clients.delete(res); }
  }
}

function pushLog(line) {
  const text = String(line).replace(/\r?\n$/, "");
  if (!text) return;
  logs.push(text);
  if (logs.length > MAX_LOGS) logs.shift();
  console.log(text);
  broadcast({ type: "log", line: text });
}

function statusPayload() {
  return {
    running: !!current,
    pid: current ? current.pid : null,
    startedAt,
    exitCode,
    lastResult,
  };
}

function startRun() {
  if (current) return { ok: false, code: 409, message: "已有任务在运行" };
  if (!fs.existsSync(RUNNER)) return { ok: false, code: 500, message: "找不到运行脚本：" + RUNNER };

  startedAt = Date.now();
  exitCode = null;
  lastResult = null;
  logs.length = 0;
  pushLog("[server] 启动 " + path.basename(RUNNER));
  broadcast({ type: "start", at: startedAt });

  const child = spawn(process.execPath, [RUNNER], {
    cwd: ROOT,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  current = child;

  function onLine(line) {
    const match = String(line).match(/^AUTOFLOW_RESULT\s+(\{.*\})\s*$/);
    if (match) {
      try { lastResult = JSON.parse(match[1]); } catch (error) { /* 忽略 */ }
    }
    pushLog(line);
  }

  let stdoutBuffer = "";
  child.stdout.on("data", (chunk) => {
    stdoutBuffer += chunk.toString("utf8");
    const lines = stdoutBuffer.split("\n");
    stdoutBuffer = lines.pop() || "";
    lines.forEach(onLine);
  });

  let stderrBuffer = "";
  child.stderr.on("data", (chunk) => {
    stderrBuffer += chunk.toString("utf8");
    const lines = stderrBuffer.split("\n");
    stderrBuffer = lines.pop() || "";
    lines.forEach(onLine);
  });

  child.on("error", (error) => {
    pushLog("[server] 启动失败：" + error.message);
  });

  child.on("close", (code) => {
    if (stdoutBuffer.trim()) onLine(stdoutBuffer);
    if (stderrBuffer.trim()) onLine(stderrBuffer);
    exitCode = code;
    current = null;
    pushLog("[server] 结束，退出码 " + code);
    broadcast({ type: "done", exitCode: code, result: lastResult });
  });

  return { ok: true };
}

function stopRun() {
  if (!current) return { ok: false, code: 409, message: "没有正在运行的任务" };
  const child = current;
  pushLog("[server] 收到停止请求，发送 SIGTERM");
  try { child.kill("SIGTERM"); } catch (error) { /* 忽略 */ }
  setTimeout(() => {
    if (current === child) {
      pushLog("[server] 仍未退出，发送 SIGKILL");
      try { child.kill("SIGKILL"); } catch (error) { /* 忽略 */ }
    }
  }, 2000).unref();
  return { ok: true };
}

function isLocal(req) {
  const address = req.socket.remoteAddress || "";
  return address === "127.0.0.1" || address === "::1" || address === "::ffff:127.0.0.1";
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(body);
}

function serveFile(res, file, type) {
  if (!fs.existsSync(file)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }
  res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" });
  fs.createReadStream(file).pipe(res);
}

function safeShotPath(urlPath) {
  const rel = decodeURIComponent(urlPath.replace(/^\/shots\//, ""));
  const abs = path.resolve(OUTPUT, rel);
  const root = path.resolve(OUTPUT);
  if (!abs.startsWith(root + path.sep)) return "";
  return abs;
}

const server = http.createServer(async (req, res) => {
  if (!isLocal(req)) {
    sendJson(res, 403, { ok: false, message: "只允许本机访问" });
    return;
  }

  const url = new URL(req.url, "http://" + HOST + ":" + PORT);

  if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
    serveFile(res, CONSOLE, "text/html; charset=utf-8");
    return;
  }
  if (req.method === "GET" && url.pathname === "/flow.json") {
    serveFile(res, FLOW, "application/json; charset=utf-8");
    return;
  }
  if (req.method === "GET" && url.pathname === "/api/status") {
    sendJson(res, 200, Object.assign({ ok: true }, statusPayload()));
    return;
  }
  if (req.method === "POST" && url.pathname === "/api/run") {
    const result = startRun();
    sendJson(res, result.ok ? 200 : result.code, result);
    return;
  }
  if (req.method === "POST" && url.pathname === "/api/stop") {
    const result = stopRun();
    sendJson(res, result.ok ? 200 : result.code, result);
    return;
  }
  if (req.method === "GET" && url.pathname === "/api/events") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    });
    res.write("retry: 2000\n\n");
    res.write("data: " + JSON.stringify({ type: "snapshot", logs: logs, status: statusPayload() }) + "\n\n");
    clients.add(res);
    const heartbeat = setInterval(() => {
      try { res.write(": ping\n\n"); } catch (error) { /* 忽略 */ }
    }, 15000);
    req.on("close", () => {
      clearInterval(heartbeat);
      clients.delete(res);
    });
    return;
  }
  if (req.method === "GET" && url.pathname.startsWith("/shots/")) {
    const file = safeShotPath(url.pathname);
    if (!file) {
      res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Bad path");
      return;
    }
    const ext = path.extname(file).toLowerCase();
    const type = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : ext === ".webp" ? "image/webp" : "image/png";
    serveFile(res, file, type);
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Not found");
});

server.listen(PORT, HOST, () => {
  console.log("[autoflow] 控制台：http://" + HOST + ":" + PORT + "/");
  console.log("[autoflow] 只监听本机；关闭窗口/Ctrl+C 结束。");
});

server.on("error", (error) => {
  console.error("[autoflow] 服务启动失败：" + error.message);
  process.exitCode = 1;
});

function shutdown() {
  if (current) {
    try { current.kill("SIGTERM"); } catch (error) { /* 忽略 */ }
  }
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 1000).unref();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
