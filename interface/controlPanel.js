'use strict';

// 控制面板后端：配置/API/模型/默认模型/管理员账号/站点初始化都集中在这里。
// 只允许本机访问，或已登录管理员会话。
//
// 注意：CLI 的 lib/ 与 app/ 在安装包里是兄弟目录；在仓库源码里直接运行时
// 没有 lib/，因此 CLI 模块必须懒加载，不能让 Web 服务因缺少控制面板而启动失败。

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const { configFile } = require('../custom/configFile.js');

function homeDir() {
  return (
    process.env.TRANSWEB_HOME ||
    path.join(os.homedir(), '.transweb-service')
  );
}

function cliLibs() {
  try {
    return {
      api: require('../../lib/api'),
      model: require('../../lib/model'),
      defaults: require('../../lib/defaults'),
      adminpages: require('../../lib/adminpages'),
      paths: require('../../lib/paths')
    };
  } catch (err) {
    throw new Error('控制面板的编辑功能只在安装包环境中可用（缺少 lib/ 目录）');
  }
}

function readCommon() {
  const file = configFile('common.js');
  delete require.cache[require.resolve(file)];
  const data = require(file);
  return data && typeof data === 'object' ? data : {};
}

function readAppConfig() {
  const file = configFile('appConfig.js');
  delete require.cache[require.resolve(file)];
  const data = require(file);
  return data && typeof data === 'object' ? data : {};
}

function parseEnvFile() {
  const file = path.join(homeDir(), 'config', '.env');
  const map = {};
  let text = '';
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch (err) {
    return map;
  }
  text.split(/\r?\n/).forEach((raw) => {
    const line = raw.trim();
    if (!line || line.startsWith('#')) return;
    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) return;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    map[match[1]] = value;
  });
  return map;
}

function readEnv(key) {
  const fileValue = parseEnvFile()[key];
  if (fileValue !== undefined && fileValue !== '') return fileValue;
  return process.env[key] || '';
}

function cliRoot() {
  try {
    return require('../../lib/paths').PKG_ROOT;
  } catch (err) {
    return path.resolve(__dirname, '..', '..');
  }
}

function cliFile() {
  return path.join(cliRoot(), 'bin', 'transweb.js');
}

function stripAnsi(text) {
  return String(text || '').replace(/\x1b\[[0-9;]*m/g, '');
}

function splitArgs(text) {
  const args = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let match;
  while ((match = re.exec(String(text || '')))) {
    args.push(match[1] || match[2] || match[3]);
  }
  return args;
}

function runCli(args, timeoutMs) {
  const cli = cliFile();
  if (!fs.existsSync(cli)) throw new Error('未找到 transweb CLI');
  const result = spawnSync(process.execPath, [cli].concat(args), {
    encoding: 'utf8',
    timeout: timeoutMs || 120000,
    windowsHide: true,
    env: Object.assign({}, process.env, {
      TRANSWEB_HOME: process.env.TRANSWEB_HOME || homeDir()
    })
  });
  return {
    code: result.status === null ? -1 : result.status,
    stdout: stripAnsi(result.stdout),
    stderr: stripAnsi(result.stderr),
    error: result.error ? result.error.message : ''
  };
}

const LIFECYCLE = new Set(['init', 'stop', 'restart', 'uninstall']);
const BACKGROUND = new Set(['sync', 'mongodb-install']);

function currentAdminAccount() {
  try {
    return String(readCommon().adminAccount || readEnv('ADMIN_ACCOUNT') || '');
  } catch (err) {
    return String(readEnv('ADMIN_ACCOUNT') || '');
  }
}

function remoteAddress(req) {
  let addr =
    (req.socket && req.socket.remoteAddress) ||
    req.ip ||
    (req.connection && req.connection.remoteAddress) ||
    '';
  addr = String(addr);
  if (addr === '::ffff:127.0.0.1') return '127.0.0.1';
  return addr;
}

function isLocalRequest(req) {
  const addr = remoteAddress(req);
  return addr === '127.0.0.1' || addr === '::1';
}

function isAdminSession(req) {
  const data = (req.session && req.session.data) || {};
  const admin = currentAdminAccount();
  return Boolean(data.logined && data.account && admin && data.account === admin);
}

function allowed(req) {
  return isLocalRequest(req) || isAdminSession(req);
}

function send(res, data) {
  res.json(data);
}

function fail(res, message) {
  send(res, { ret: -1, message: String(message || '操作失败') });
}

function body(req) {
  return Object.assign({}, req.query || {}, req.body || {});
}

function adminPageStatus() {
  const appStatic = path.resolve(__dirname, '..', 'static');
  const hiddenDir = path.join(homeDir(), 'admin-pages');
  const visible = [];
  const hidden = [];
  ['admin.html', 'initAdmin.html'].forEach((name) => {
    if (fs.existsSync(path.join(appStatic, name))) visible.push(name);
    else if (fs.existsSync(path.join(hiddenDir, name))) hidden.push(name);
  });
  return { visible, hidden };
}

function apiEnvKey(name, entry) {
  if (entry && entry.envKey) return String(entry.envKey);
  try {
    return require('../../lib/commonconfig').getApiEnvKey(name) || '';
  } catch (err) {
    // 源码开发模式没有 lib/ 时，从 common.js 源码里解析 env.opt("KEY")
  }
  try {
    const source = fs.readFileSync(configFile('common.js'), 'utf8');
    const start = source.indexOf(`"${name}"`);
    if (start === -1) return '';
    const open = source.indexOf('{', start);
    if (open === -1) return '';
    let depth = 0;
    let end = open;
    for (let i = open; i < source.length; i += 1) {
      if (source[i] === '{') depth += 1;
      else if (source[i] === '}') {
        depth -= 1;
        if (depth === 0) { end = i + 1; break; }
      }
    }
    const block = source.slice(start, end);
    const match = /env\.opt\(\s*["']([^"']+)["']/.exec(block);
    return match ? match[1] : '';
  } catch (err) {
    return '';
  }
}

function buildState() {
  const common = readCommon();
  const app = readAppConfig();
  const apiConfig = common.apiConfig || {};
  const apis = Object.keys(apiConfig).map((name) => {
    const envKey = apiEnvKey(name, apiConfig[name]);
    return {
      name,
      url: apiConfig[name].url || '',
      envKey,
      keySet: envKey ? Boolean(readEnv(envKey)) : false
    };
  });

  const modelMap = common.tokenRateMap || {};
  const models = Object.keys(modelMap).map((name) => {
    const item = modelMap[name] || {};
    return {
      name,
      apiName: item.apiName || '',
      input: item.input,
      output: item.output,
      context: item.context,
      from: item.from || ''
    };
  });

  const publishInfo = app.publishInfo || {};
  let version = '';
  try {
    version = require(path.join(cliRoot(), 'package.json')).version;
  } catch (err) {
    version = '';
  }
  let localInstall = false;
  try {
    localInstall = require('../../lib/binlink').isLocalInstall(
      require('../../lib/paths').PKG_ROOT
    );
  } catch (err) {
    localInstall = false;
  }
  return {
    version,
    localInstall,
    initialized: Boolean(String(publishInfo.folderName || '').trim()),
    folderName: String(publishInfo.folderName || ''),
    account: readEnv('ADMIN_ACCOUNT') || currentAdminAccount(),
    powerAdminSet: Boolean(readEnv('POWER_ADMIN')),
    ports: {
      http: Number(process.env.PORT || readEnv('PORT') || 80),
      https: Number(process.env.SSLPORT || readEnv('SSLPORT') || 0),
      mongo: Number(process.env.MONGO_PORT || readEnv('MONGO_PORT') || 27017)
    },
    apis,
    models,
    defaults: {
      model: app.defaultModel || null,
      image: app.defaultImageModel || null,
      imageInput: app.defaultImageInputModel || null
    },
    adminPages: adminPageStatus(),
    access: common.documentAccess || {},
    cors: common.crossOrigin || {},
    paths: {
      home: homeDir(),
      config: path.join(homeDir(), 'config', '.env'),
      logs: path.join(homeDir(), 'logs')
    }
  };
}

async function actionApiSave(req, res) {
  const { api } = cliLibs();
  const data = body(req);
  const name = String(data.name || '').trim();
  const url = String(data.url || '').trim();
  const key = data.key === undefined ? '' : String(data.key);
  const envKey = String(data.envKey || '').trim();
  if (!name) throw new Error('请填写 API 名称');
  if (!url) throw new Error('请填写 API URL');

  const exists = Boolean(readCommon().apiConfig && readCommon().apiConfig[name]);
  if (key) {
    await api.run({
      _: ['api', exists ? 'update' : 'add', name],
      url,
      key,
      envKey: envKey || undefined,
      force: true,
      noRestart: true
    });
  } else if (exists) {
    await api.run({
      _: ['api', 'update', name],
      url,
      envKey: envKey || undefined,
      noRestart: true
    });
  } else {
    throw new Error('新增 API 时必须填写 API Key');
  }
  send(res, { ret: 0, message: 'API 配置已保存（重启 Web 服务后生效）', data: buildState() });
}

async function actionApiRemove(req, res) {
  const { api } = cliLibs();
  const name = String(body(req).name || '').trim();
  if (!name) throw new Error('缺少 API 名称');
  await api.run({ _: ['api', 'remove', name], removeEnv: true, noRestart: true });
  send(res, { ret: 0, message: 'API 配置已删除（重启 Web 服务后生效）', data: buildState() });
}

async function actionModelSave(req, res) {
  const { model } = cliLibs();
  const data = body(req);
  const name = String(data.name || '').trim();
  const apiName = String(data.apiName || '').trim();
  if (!name) throw new Error('请填写模型名称');
  if (!apiName) throw new Error('请填写所属 API');
  const exists = Boolean(readCommon().tokenRateMap && readCommon().tokenRateMap[name]);
  await model.run({
    _: ['model', exists ? 'update' : 'add', name],
    apiName,
    input: data.input,
    output: data.output,
    context: data.context,
    from: String(data.from || '国外'),
    force: true,
    noRestart: true
  });
  send(res, { ret: 0, message: '模型配置已保存（重启 Web 服务后生效）', data: buildState() });
}

async function actionModelRemove(req, res) {
  const { model } = cliLibs();
  const name = String(body(req).name || '').trim();
  if (!name) throw new Error('缺少模型名称');
  await model.run({ _: ['model', 'remove', name], noRestart: true });
  send(res, { ret: 0, message: '模型配置已删除（重启 Web 服务后生效）', data: buildState() });
}

async function actionDefaultsSave(req, res) {
  const { defaults } = cliLibs();
  const data = body(req);
  const entries = [
    { kind: 'model', field: 'defaultModel', value: String(data.model || '').trim() },
    { kind: 'image', field: 'defaultImageModel', value: String(data.image || '').trim() },
    {
      kind: 'image-input',
      field: 'defaultImageInputModel',
      value: String(data.imageInput || '').trim()
    }
  ];

  for (const item of entries) {
    if (!item.value) continue;
    await defaults.run({
      _: ['default', item.kind],
      model: item.value,
      fallbackApiName: String(data.apiName || '').trim() || undefined,
      noRestart: true
    });
  }

  const emptyFields = entries.filter((item) => !item.value).map((item) => item.field);
  if (emptyFields.length) {
    const latest = readAppConfig();
    for (const field of emptyFields) delete latest[field];
    const file = configFile('appConfig.js');
    fs.writeFileSync(
      file,
      'var data=' + JSON.stringify(latest, null, 2) + ';\nmodule.exports = data;\n',
      { mode: 0o644 }
    );
  }

  send(res, { ret: 0, message: '默认模型已保存（重启 Web 服务后生效）', data: buildState() });
}

async function actionAdminSave(req, res) {
  const { api } = cliLibs();
  const data = body(req);
  const account = String(data.account || '').trim();
  const powerAdmin = String(data.powerAdmin || '');
  if (!account) throw new Error('管理员账号不能为空');
  if (/[\r\n]/.test(account)) throw new Error('管理员账号不能包含换行');

  api.setEnvValue('ADMIN_ACCOUNT', account);
  if (powerAdmin) {
    if (powerAdmin.length < 6) throw new Error('万能验证码至少 6 个字符');
    if (/[\r\n]/.test(powerAdmin)) throw new Error('万能验证码不能包含换行');
    api.setEnvValue('POWER_ADMIN', powerAdmin);
  }

  send(res, {
    ret: 0,
    message: '管理员账号已保存；重启 Web 服务后生效',
    data: buildState(),
    restartRequired: true
  });
}

async function actionHideAdmin(req, res) {
  const { adminpages } = cliLibs();
  const moved = adminpages.hide();
  send(res, {
    ret: 0,
    message: moved.length ? `已隐藏：${moved.join('、')}` : '后台页面已经是隐藏状态',
    data: buildState()
  });
}

async function actionShowAdmin(req, res) {
  const { adminpages } = cliLibs();
  const moved = adminpages.show();
  send(res, {
    ret: 0,
    message: moved.length ? `已恢复：${moved.join('、')}` : '后台页面已经可见',
    data: buildState()
  });
}

function actionRestart(req, res) {
  let root;
  try {
    root = require('../../lib/paths').PKG_ROOT;
  } catch (err) {
    root = path.resolve(__dirname, '..', '..');
  }
  const cli = path.join(root, 'bin', 'transweb.js');
  if (!fs.existsSync(cli)) {
    throw new Error('未找到 transweb CLI，无法自动重启');
  }
  const child = spawn(process.execPath, [cli, 'restart', '--no-open'], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
    env: Object.assign({}, process.env, {
      TRANSWEB_HOME: process.env.TRANSWEB_HOME || ''
    })
  });
  child.unref();
  send(res, {
    ret: 0,
    message: '已触发重启，Web 服务恢复后刷新页面即可',
    restarting: true
  });
}

const NO_RESTART_MODULES = new Set([
  'api',
  'model',
  'default',
  'config',
  'env',
  'access',
  'cors',
  'wxpay',
  'admin'
]);

function commandArgs(data) {
  if (Array.isArray(data.args)) return data.args.map((item) => String(item));
  return splitArgs(data.command);
}

async function actionRun(req, res) {
  const data = body(req);
  const argv = commandArgs(data);
  if (!argv.length) throw new Error('请输入要执行的命令，例如：status');
  const top = argv[0];

  if (LIFECYCLE.has(top)) {
    throw new Error('init/stop/restart/uninstall 请在“服务”页执行');
  }
  if (top === 'sync') {
    throw new Error('sync 请在“服务”页执行（会在后台运行）');
  }
  if (top === 'mongodb' && argv[1] === 'install') {
    throw new Error('mongodb install 请在“服务”页执行（会在后台下载）');
  }
  if ((top === 'config' || top === 'env') && argv[1] === 'edit') {
    throw new Error('config edit / env edit 请使用“配置/环境”页的文本编辑器');
  }
  if (!['status', 'logs', 'start', 'api', 'model', 'default', 'config', 'access', 'cors', 'env', 'root', 'wxpay', 'admin', 'mongodb', 'version', 'help'].includes(top)) {
    throw new Error(`不支持的命令：${top}`);
  }

  const readOnlySub = ['list', 'get', 'status', 'check', 'help', 'version'];
  const sub = argv[1] || '';
  const readOnly =
    readOnlySub.includes(sub) ||
    top === 'root' ||
    top === 'version' ||
    top === 'help' ||
    top === 'logs' ||
    top === 'status' ||
    top === 'mongodb' ||
    (top === 'cors' && !sub);

  if (NO_RESTART_MODULES.has(top) && !argv.includes('--no-restart')) {
    argv.push('--no-restart');
  }

  const timeout = Math.min(Math.max(Number(data.timeoutMs) || 120000, 5000), 600000);
  const result = runCli(argv, timeout);
  send(res, {
    ret: 0,
    data: Object.assign(result, {
      argv,
      restartRequired: NO_RESTART_MODULES.has(top) && !readOnly
    })
  });
}

function backgroundArgs(data) {
  const op = String(data.op || '');
  if (op === 'sync') {
    const mode = String(data.mode || '');
    if (!['static', 'bucket', 'code', 'all'].includes(mode)) {
      throw new Error('sync 模式必须是 static/bucket/code/all');
    }
    const args = ['sync', mode, '--yes', '--no-restart'];
    if (data.source) args.push('--source', String(data.source));
    if (data.includeAdmin) args.push('--include-admin');
    if (data.dryRun) args.push('--dry-run');
    return args;
  }
  if (op === 'mongodb-install') return ['mongodb', 'install'];
  return null;
}

function spawnBackground(args, logFile) {
  fs.mkdirSync(path.dirname(logFile), { recursive: true });
  const fd = fs.openSync(logFile, 'a');
  fs.writeSync(fd, `\n===== ${new Date().toISOString()} ${args.join(' ')} =====\n`);
  const child = spawn(process.execPath, [cliFile()].concat(args), {
    detached: true,
    stdio: ['ignore', fd, fd],
    windowsHide: true,
    env: Object.assign({}, process.env, {
      TRANSWEB_HOME: process.env.TRANSWEB_HOME || homeDir()
    })
  });
  child.unref();
  fs.closeSync(fd);
}

async function actionService(req, res) {
  const data = body(req);
  const op = String(data.op || '');

  if (op === 'status') {
    const result = runCli(['status'], 60000);
    return send(res, {
      ret: 0,
      message: '状态已刷新',
      data: result
    });
  }

  if (op === 'sync' || op === 'mongodb-install') {
    const args = backgroundArgs(data);
    const logFile = path.join(homeDir(), 'logs', `control-panel-${op}.log`);
    spawnBackground(args, logFile);
    return send(res, {
      ret: 0,
      message: op === 'sync' ? '同步已在后台开始' : 'MongoDB 下载已在后台开始',
      data: { background: true, log: logFile }
    });
  }

  let args = null;
  let message = '';
  if (op === 'init') {
    if (data.confirm !== 'INIT') throw new Error('初始化需要输入 INIT 确认');
    args = ['init', '--yes', '--no-open'];
    if (data.port) args.push('--port', String(data.port));
    if (data.sslPort) args.push('--ssl-port', String(data.sslPort));
    if (data.mongoPort) args.push('--mongo-port', String(data.mongoPort));
    if (data.preinit) args.push('--preinit-script', String(data.preinit));
    message = '已触发初始化；Web 会重启，完成后请重新打开控制面板';
  } else if (op === 'uninstall') {
    if (data.confirm !== 'UNINSTALL') throw new Error('卸载需要输入 UNINSTALL 确认');
    args = ['uninstall', '--yes'];
    if (data.purge) args.push('--purge');
    message = '已触发卸载；控制面板与 Web 将停止';
  } else if (op === 'stop') {
    args = ['stop'];
    message = '已触发停止；控制面板将断开';
  } else if (op === 'restart') {
    args = ['restart', '--no-open'];
    message = '已触发重启；Web 恢复后刷新页面';
  } else if (op === 'start') {
    args = ['start'];
    message = '已触发启动';
  } else {
    throw new Error(`未知服务操作：${op}`);
  }

  send(res, { ret: 0, message, disconnect: op !== 'start' });
  // 先让响应返回，再执行会停止当前 Web 的 CLI
  setTimeout(() => {
    const child = spawn(process.execPath, [cliFile()].concat(args), {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
      env: Object.assign({}, process.env, {
        TRANSWEB_HOME: process.env.TRANSWEB_HOME || homeDir()
      })
    });
    child.unref();
  }, 400);
}

function fileTarget(name) {
  if (name === 'env') return path.join(homeDir(), 'config', '.env');
  if (name === 'common') return configFile('common.js');
  if (name === 'app') return configFile('appConfig.js');
  throw new Error('未知文件：' + name);
}

async function actionFileGet(req, res) {
  const name = String((req.query && req.query.name) || '');
  const file = fileTarget(name);
  let content = '';
  try {
    content = fs.readFileSync(file, 'utf8');
  } catch (err) {
    content = '';
  }
  send(res, { ret: 0, data: { name, file, content } });
}

async function actionFileSave(req, res) {
  const data = body(req);
  const name = String(data.name || '');
  const file = fileTarget(name);
  const content = String(data.content === undefined ? '' : data.content);
  if (content.length > 2 * 1024 * 1024) throw new Error('文件内容过大（上限 2MB）');

  if (name === 'common' || name === 'app') {
    const objpath = require('../../lib/objpath');
    objpath.validate(content, file);
  }

  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, {
    mode: name === 'env' ? 0o600 : 0o644
  });
  send(res, { ret: 0, message: '文件已保存（重启 Web 服务后生效）', data: { file } });
}

async function runAction(req, res) {
  const action = String(body(req).action || '');
  switch (action) {
    case 'api-save':
      return actionApiSave(req, res);
    case 'api-remove':
      return actionApiRemove(req, res);
    case 'model-save':
      return actionModelSave(req, res);
    case 'model-remove':
      return actionModelRemove(req, res);
    case 'defaults-save':
      return actionDefaultsSave(req, res);
    case 'admin-save':
      return actionAdminSave(req, res);
    case 'hide-admin':
      return actionHideAdmin(req, res);
    case 'show-admin':
      return actionShowAdmin(req, res);
    case 'restart':
      return actionRestart(req, res);
    default:
      throw new Error(`未知操作：${action}`);
  }
}

const data = {
  state: {
    method: 'get',
    callback: function (req, res) {
      if (!allowed(req)) {
        return send(res, {
          ret: -2,
          message: '控制面板仅允许本机访问；远程请使用 SSH 隧道，或让管理员在 admin.html 登录后操作。'
        });
      }
      try {
        send(res, { ret: 0, data: buildState() });
      } catch (err) {
        fail(res, err.message);
      }
    }
  },
  bootstrap: {
    method: 'get',
    callback: function (req, res) {
      if (!isLocalRequest(req)) {
        return send(res, { ret: -2, message: '仅允许本机访问' });
      }
      send(res, {
        ret: 0,
        data: {
          account: readEnv('ADMIN_ACCOUNT') || 'transweb',
          powerAdmin: readEnv('POWER_ADMIN') || ''
        }
      });
    }
  },
  action: {
    method: 'post',
    callback: function (req, res) {
      if (!allowed(req)) {
        return send(res, {
          ret: -2,
          message: '控制面板仅允许本机访问；远程请使用 SSH 隧道，或让管理员在 admin.html 登录后操作。'
        });
      }
      runAction(req, res).catch((err) => fail(res, err.message));
    }
  },
  run: {
    method: 'post',
    callback: function (req, res) {
      if (!allowed(req)) {
        return send(res, { ret: -2, message: '仅允许本机或已登录管理员执行命令' });
      }
      actionRun(req, res).catch((err) => fail(res, err.message));
    }
  },
  service: {
    method: 'post',
    callback: function (req, res) {
      if (!allowed(req)) {
        return send(res, { ret: -2, message: '仅允许本机或已登录管理员执行服务操作' });
      }
      actionService(req, res).catch((err) => fail(res, err.message));
    }
  },
  file: {
    method: 'get',
    callback: function (req, res) {
      if (!allowed(req)) {
        return send(res, { ret: -2, message: '仅允许本机或已登录管理员读取配置' });
      }
      actionFileGet(req, res).catch((err) => fail(res, err.message));
    }
  },
  fileSave: {
    method: 'post',
    callback: function (req, res) {
      if (!allowed(req)) {
        return send(res, { ret: -2, message: '仅允许本机或已登录管理员保存配置' });
      }
      actionFileSave(req, res).catch((err) => fail(res, err.message));
    }
  }
};

module.exports = data;
