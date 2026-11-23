'use strict';

// 配置/会话文件的统一位置。
//
// 开发模式（直接 node webServer.js）：沿用 app/interface/config 与 app/.env。
// 安装模式（CLI 设置 TRANSWEB_HOME 后启动）：读写 <服务目录>/config。
//
// Windows 上不再依赖“把包内配置文件软链到服务目录”的做法（普通用户没有
// 创建文件符号链接的权限），因此所有配置读写都必须经过这里。

const path = require('path');

const LOCAL_CONFIG_DIR = path.resolve(__dirname, '..', 'interface', 'config');
const LOCAL_ENV_FILE = path.resolve(__dirname, '..', '.env');

function isServiceMode() {
  return Boolean(process.env.TRANSWEB_HOME);
}

function configDir() {
  return isServiceMode()
    ? path.join(process.env.TRANSWEB_HOME, 'config')
    : LOCAL_CONFIG_DIR;
}

function configFile(name) {
  return path.join(configDir(), name);
}

function envFile() {
  return isServiceMode() ? configFile('.env') : LOCAL_ENV_FILE;
}

module.exports = {
  LOCAL_CONFIG_DIR,
  LOCAL_ENV_FILE,
  isServiceMode,
  configDir,
  configFile,
  envFile
};
