// custom/env.js —— 集中读取环境变量，避免敏感信息散落在源码中。
const fs = require("fs");
const path = require("path");

const ENV_PATH = path.resolve(__dirname, "../.env");

// 极简 .env 加载器（避免引入额外依赖）：仅当同名变量尚未在 process.env 中时才写入，
// 保证系统环境变量优先级高于 .env 文件。
(function loadDotEnv() {
  if (!fs.existsSync(ENV_PATH)) return;
  const lines = fs.readFileSync(ENV_PATH, "utf8").split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
})();

// 必填项：缺失即抛错（fail-closed），拒绝以默认值静默启动。
function get(key) {
  const v = process.env[key];
  if (v === undefined || v === "") {
    throw new Error(
      `缺少必需的环境变量: ${key}，请在 transweb/.env 中配置（参考 .env.example）。`
    );
  }
  return v;
}

// 可选项：缺失返回空字符串，由上层决定是否降级。
function opt(key) {
  const v = process.env[key];
  return v === undefined ? "" : v;
}

module.exports = { get, opt };
