#!/usr/bin/env node
// TransWeb 初始化脚本：创建运行所需的目录与运行时数据文件。
// 这些目录/文件均被 .gitignore 排除，不会随仓库分发，需在首次部署时生成。
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

// 运行时目录（服务启动/登录/上传/支付日志会向其中写入）
const dirs = [
  "ca",                       // HTTPS 证书与私钥（需自行放入自己的证书）
  "personal/appData",         // 用户应用数据
  "personal/permission",      // 用户权限数据
  "wxPayLog",                 // 微信支付流水日志
  "static/bucket/personal",   // 用户个人空间（文档/应用等）
  "temp_uploads",             // 上传临时目录
  "temp",
  "tmp",
];

// 运行时数据文件（会话/访客状态，缺失会导致启动或鉴权报错）
const sessionFiles = {
  "interface/config/logined.js": "var data={}\n module.exports = data;",
  "interface/config/guest.js": "var data={}\n module.exports = data;",
};

function mkdirp(p) {
  fs.mkdirSync(p, { recursive: true });
}

console.log("== TransWeb 初始化 ==");

for (const d of dirs) {
  const full = path.join(root, d);
  if (!fs.existsSync(full)) {
    mkdirp(full);
    console.log("  [目录] " + d + "/");
  }
}

for (const [rel, content] of Object.entries(sessionFiles)) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    mkdirp(path.dirname(full));
    fs.writeFileSync(full, content);
    console.log("  [文件] " + rel);
  }
}

const envSrc = path.join(root, ".env.example");
const envDst = path.join(root, ".env");
if (!fs.existsSync(envDst)) {
  if (fs.existsSync(envSrc)) {
    fs.copyFileSync(envSrc, envDst);
    console.log("  [文件] .env（已从 .env.example 复制，请填写必填项）");
  } else {
    console.log("  [提示] 未找到 .env.example，请手动创建 .env");
  }
}

console.log("\n完成。下一步：编辑 .env 填写必填项，然后运行 `node webServer.js`。");
