// custom/AdminGate.js —— 后台 / 初始化页面（admin.html、initAdmin.html、initialize.html）的访问闸门
//
// 规则由环境变量 TRANSWEB_DISABLE_ADMIN 决定：
//   1 / true / yes  → 始终 404（即使页面文件还在 static 目录，用于公网部署）
//   0 / false / no  → 始终放行（页面文件不存在时仍由静态中间件返回 404）
//   未设置 / 空值   → 仅在实例「尚未完成初始化」时放行
//
// 未初始化时放行的原因：首次部署必须能打开初始化页面。
// transweb init 会写入一个不含 publishInfo 的空 appConfig.js，因此判断依据是
// appConfig.js 里的 publishInfo.folderName 是否已写入（初始化最后一步才写）。
// 初始化完成后自动回到 404，既不用改环境变量，也不用重启服务。

const fs = require("fs");
const path = require("path");

const ADMIN_PAGE_RE = /^\/(?:admin|initAdmin|initialize)\.html$/i;
const DEFAULT_APP_CONFIG_PATH = path.resolve(__dirname, "../interface/config/appConfig.js");

function isAdminPage(urlPath) {
  return ADMIN_PAGE_RE.test(String(urlPath || ""));
}

// 是否已完成应用初始化：appConfig.js 中存在非空的 publishInfo.folderName
function isInitialized(appConfigPath) {
  let src = "";
  try {
    src = fs.readFileSync(appConfigPath || DEFAULT_APP_CONFIG_PATH, "utf8");
  } catch (e) {
    return false;
  }
  const block = src.match(/["']?publishInfo["']?\s*:\s*\{([\s\S]*?)\}/);
  if (!block) return false;
  const folder = block[1].match(/["']?folderName["']?\s*:\s*["']([^"']*)["']/);
  return Boolean(folder && folder[1].trim());
}

// flag / initialized 参数仅用于测试；不传时读取环境变量与本地 appConfig.js
function enabled(flag, initialized) {
  const value = String(
    flag === undefined || flag === null ? process.env.TRANSWEB_DISABLE_ADMIN || "" : flag
  ).trim();
  if (/^(1|true|yes)$/i.test(value)) return false;
  if (/^(0|false|no)$/i.test(value)) return true;
  return !(initialized === undefined ? isInitialized() : initialized);
}

module.exports = { isAdminPage, isInitialized, enabled };
