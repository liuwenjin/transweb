let express = require("express");
let path = require('path');
let axios = require('axios');
let env = require("./custom/env.js");
const rateLimit = require('express-rate-limit');
const bodyParser = require("body-parser");
require("body-parser-xml")(bodyParser);
const findRemoveSync = require('find-remove');
let WebTool = require("./custom/WebTool.js");
let crypto = require('crypto');
let https = require('https');
let request = require("request");
let xml2js = require('xml2js');

let compression = require('compression');
let fs = require("fs");
let session = require('express-session');
let ConfigObject = require("./custom/ConfigObject.js");
let WebService = require("./custom/WebService.js");
let RestFulConfig = require("./custom/RestFulConfig.js");
let BucketDealer = require("./custom/BucketDealer.js");
let multer = require('multer');
let Adapter = require("./custom/Adapter.js");
let ConnectDB = require("./custom/ConnectDB.js");
let ApiKeyTool = require("./custom/ApiKeyTool.js");
let PaymentOrder = require("./custom/PaymentOrder.js");


let t = path.resolve(__dirname, '.');
let prefix = {
  root: t + "/",
  product: t + '/product/',
  static: t + "/static/",
  configData: t + '/interface/',
  wxPayLog: t + "/wxPayLog/",
  interface: t + "/interface/config/",
  ca: t + "/ca/"
}

let wxPayInfo = {
  appId: env.opt("WX_PAY_APP_ID"),
  mchId: env.opt("WX_PAY_MCH_ID"),
  key: env.get("WX_PAY_APP_KEY"),
  notify: env.opt("WX_PAY_NOTIFY"),
  signType: "MD5",
  payOrderUrl: env.opt("WX_PAY_ORDER_URL"),
  queryOrderUrl: env.opt("WX_PAY_QUERY_URL")
}

// 微信配置（建议从环境变量读取）
const WECHAT_CONFIG = {
  wxApp: {
    appId: env.opt("WX_PAY_APP_ID001") || env.opt("WX_PAY_APP_ID01"),
    appSecret: env.opt("WX_PAY_APP_SECRET001") || env.opt("WX_PAY_APP_SECRET01"),
  },
  wxService: {
    appId: env.opt("WX_PAY_APP_ID"),
    appSecret: env.opt("WX_PAY_APP_SECRET"),
  }
};


// 缓存对象（生产环境建议使用Redis）
let cache = {
  access_token: {}, // 按 type 分键缓存，避免 wxApp/wxService 互相覆盖
  jsapi_ticket: {
    value: null,
    expires_at: 0,
  },
};

// 通用微信API请求函数
async function wechatRequest(url) {
  try {
    const response = await axios.get(url);
    if (response.data.errcode) {
      throw new Error(`微信API错误: ${response.data.errmsg} (code: ${response.data.errcode})`);
    }
    return response.data;
  } catch (error) {
    console.error('微信API请求失败:', error.message);
    throw error;
  }
}

// 获取access_token（自动处理缓存）
async function getAccessToken(type) {
  type = type || "wxService"
  const now = Date.now();
  const entry = cache.access_token[type] || { value: null, expires_at: 0 };
  // 检查缓存是否有效（提前5分钟刷新）
  if (entry.value && entry.expires_at > now + 5 * 60 * 1000) {
    return entry.value;
  }

  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WECHAT_CONFIG[type].appId}&secret=${WECHAT_CONFIG[type].appSecret}`;
  const data = await wechatRequest(url);

  cache.access_token[type] = {
    value: data.access_token,
    expires_at: now + data.expires_in * 1000,
  };
  return data.access_token;
}

// 获取jsapi_ticket（自动处理缓存）
async function getJsapiTicket() {
  const now = Date.now();
  if (cache.jsapi_ticket.value && cache.jsapi_ticket.expires_at > now + 5 * 60 * 1000) {
    return cache.jsapi_ticket.value;
  }

  const accessToken = await getAccessToken();
  const url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`;
  const data = await wechatRequest(url);

  cache.jsapi_ticket = {
    value: data.ticket,
    expires_at: now + data.expires_in * 1000,
  };
  return data.ticket;
}

// 生成随机字符串
function generateNonceStr(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 生成签名
function generateSignature(ticket, nonceStr, timestamp, url) {
  const stringToSign = `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
  const hash = crypto.createHash('sha1');
  hash.update(stringToSign);
  return hash.digest('hex');
}

let app = express();

// 反向代理后需开启，否则 req.ip 全部变成代理地址（限流/支付取 IP 会失真）
app.set("trust proxy", /^(1|true|yes)$/i.test(process.env.TRUST_PROXY || "") ? 1 : false);

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1500,
  message: '请求过于频繁，请稍后再试',
  // 显式禁用 keyGenerator 中针对 IP 回退的安全校验
  validate: {
    keyGeneratorIpFallback: false
  },
  keyGenerator: (req) => {
    return req.user?.id ? `user:${req.user.id}` : req.ip;
  }
});
app.use(limiter);


app.use((req, res, next) => {
  const redirectMap = {
    '/0': '/?agent=4140329349&appName=appGenerator',
    '/1': '/?id=28e55cff1a46d1d7cf66c4aa6a898460&solo=true',
    "/ggb": "https://transweb.cn/workflow/docs/examples/ggb-skill.html",
    '/2': '/?agent=4140329349&appName=exam',
    '/mathLabs': '/bucket/apps/mathLabs/index.html',
    '/mathlabs': '/bucket/apps/mathLabs/index.html',
    '/math': '/workflow/mathFlow.html',
    '/mathVisual': 'https://transweb.cn/workflow/docs/examples/math-visual.html',
    "demo": "https://transweb.cn/skill.html?id=580dd5317774579b532c19ae36011774&solo=true",
    "skill": "https://transweb.cn/skill.html",
    "agent": "https://transweb.cn/index.html",
    "creator": "https://transweb.cn/creator.html",
    "workflow": "https://transweb.cn/workflow.html",
    "skills": "https://transweb.cn/skillHub.html",
    "math": "https://transweb.cn/workflow/math.html",
    "simulation": "https://transweb.cn/workflow/docs/examples/physics-simulation.html",
    "ggb": "https://transweb.cn/workflow/docs/examples/ggb-agent.html",
    "canvas": "https://transweb.cn/workflow/docs/examples/canvas-skill.html",
    'noaifeel': 'https://transweb.cn/skill.html?id=e508059dd3be1f3055b81105200beba8&solo=true',
    'chart': "https://transweb.cn/skill.html?id=916d7e5e4d50cc14621878d9f98dbd93&solo=true",
    'ppt': "https://transweb.cn/skill.html?id=76f7de9504bad022a8978e9fe084df0f&solo=true"
  };
  const target = redirectMap[req.path] || "";
  const host = req.hostname || "";
  let prefixed = host.split(".")[0];
  console.log("host & prefixed", host, prefixed);
  console.log("req.path", req.path, target);
  if (!!target) {
    res.redirect(target);
    console.log(`Redirecting ${req.path} to ${target}`);
  }
  else {
    console.log("@@@@prefixed: ", prefixed, redirectMap[prefixed]);
    if (redirectMap[prefixed]) {
      res.redirect(redirectMap[prefixed]);
    }
    else {
      next();
    }
  }
});



// 基础安全响应头
// 基础安全响应头（防御点击劫持、MIME 嗅探、Referrer 泄露）
app.disable("x-powered-by");
app.use(function (req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  // 默认不发送 X-Frame-Options / frame-ancestors，从而允许任意来源（含本地 file://）通过 iframe 嵌入本服务。
  // 说明：frame-ancestors 的 '*' 只匹配 http/https/ws/wss 等网络协议，无法匹配 file:// 的 null 源，
  // 因此要放行本地 file:// 页面，必须完全不发送该限制头。
  // 如需收紧，可设置环境变量 FRAME_ANCESTORS，例如：FRAME_ANCESTORS="'self' https://example.com"
  if (process.env.FRAME_ANCESTORS) {
    res.setHeader("Content-Security-Policy", "frame-ancestors " + process.env.FRAME_ANCESTORS);
  }
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});


app.use(express.json({ limit: '3mb' }));
app.use(express.urlencoded({ limit: '3mb', extended: true }));

app.use(compression({
  filter: (req, res) =>
    !req.path.startsWith('/gpt/aiStreamRequest') && compression.filter(req, res)
}));

// SEO：将 /index.html 规范化 301 到 /，避免与首页产生重复内容（保留查询参数以支持深链）
app.use(function (req, res, next) {
  if (req.path === "/index.html") {
    var qs = (req.originalUrl || "").split("?")[1] || "";
    return res.redirect(301, "/" + (qs ? "?" + qs : ""));
  }
  next();
});

app.use(session({
  secret: env.get("SESSION_SECRET"), // 从环境变量读取（见 .env）
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 60 * 1000 * 60 * 24,
    httpOnly: true,
    sameSite: "lax",
    secure: "auto" // 依连接是否 HTTPS 自动决定，避免 HTTP 下 cookie 被拒
  } // 过期时间（毫秒）
}));

// 个人空间文件存放在 static/bucket/personal 下，必须先于 express.static 鉴权，
// 否则静态中间件会绕过 folderName 校验，造成越权下载。
// 这里同时校验「已登录」与「目录归属」，杜绝跨用户读取（IDOR）。
app.use(function (req, res, next) {
  if (req.path.indexOf("/bucket/personal/") !== 0) return next();
  checkRequestToken(req);
  const sData = (req.session && req.session.data) || {};
  if (sData.logined !== true) {
    res.status(403).json({ ret: 1, message: "请先登录后再访问个人空间。" });
    return;
  }
  const owner = String(sData.folderName || "");
  const sub = req.path.slice("/bucket/personal/".length);
  const reqFolder = sub.split("/")[0];
  if (!owner || reqFolder !== owner) {
    res.status(403).json({ ret: 1, message: "无权访问该资源。" });
    return;
  }
  next();
});

// 后台/初始化页面闸门（规则见 custom/AdminGate.js）：
//   未初始化 → 放行（首次部署必须能打开初始化页面）
//   已初始化 → 默认 404；TRANSWEB_DISABLE_ADMIN=0/false/no 可显式放行
// 每个请求现算，初始化完成后无需重启即自动关闭。
const adminGate = require("./custom/AdminGate.js");
app.use(function (req, res, next) {
  if (!adminGate.isAdminPage(req.path) || adminGate.enabled()) {
    next();
    return;
  }
  res.status(404).end();
});

app.use(express.static("static", {}));


// 2. 配置 Multer 存储引擎
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'temp_uploads');
    // 如果目录不存在则创建
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // 使用 sessionID 作为文件名，确保每个 session 只有一个有效临时文件
    // 获取后缀名
    const ext = path.extname(file.originalname);
    const sessionFileName = `temp_${req.sessionID}${ext}`;
    cb(null, sessionFileName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 允许 10MB
  },
  fileFilter: (req, file, cb) => {
    // 拦截可在服务端/客户端被执行的危险文件类型（本平台仅需文档/图片/网页/代码等）。
    // .html/.js 等因「无代码导出网页」的核心能力而保留。
    const ext = (path.extname(file.originalname) || "").toLowerCase();
    const banned = [
      ".php", ".jsp", ".asp", ".aspx", ".cgi", ".pl", ".py",
      ".exe", ".dll", ".so", ".sh", ".bat", ".cmd", ".msi", ".scr",
    ];
    if (banned.indexOf(ext) !== -1) {
      return cb(new Error("不支持的文件类型: " + ext));
    }
    cb(null, true);
  }
});

app.use(upload.single('file'));


setInterval(() => {
  try {
    const options = {
      age: { seconds: 1800 },
      files: '*.*', // 显式匹配所有带后缀的文件
      dir: '*',     // 如果你也想删除过期的空文件夹，加上这一行
      ignore: '.gitignore' // 可选：忽略某些特定文件
    };
    // 执行清理（仅保留实际使用的 temp_uploads）
    const result = findRemoveSync(path.join(__dirname, 'temp_uploads'), options);
    console.log('清理任务执行完毕:', {
      temp_uploads: result,
      time: new Date().toLocaleString()
    });
  } catch (err) {
    console.error('清理临时文件发生异常:', err);
  }
}, 3600000);




function checkRight(path, limit, prefix) {
  prefix = prefix || "/bucket/personal/";
  let ret = -1;
  limit = limit || [];
  if (path.indexOf(prefix) === 0) {
    let t = path.replace(prefix, "");
    let arr = t.split("/");
    let fName = arr[0];
    ret = 0;
    if (limit.indexOf(fName) !== -1) {
      ret = 1;
    }
  }
  return ret
}

function checkPrefix(path, arr) {
  let ret = -1;
  for (let i = 0; i < arr.length; i++) {
    if (path.indexOf(arr[i]) === 0) {
      ret = 0;
      break;
    }
  }
  return ret;
}

function checkRequestToken(req) {
  req.headers = req.headers || {};
  let token = req.headers['transweb-token'];
  if (token) {
    let logined = new ConfigObject(prefix.interface + "logined.js");
    let tData = logined.data;

    if (tData[token]) {
      let time = new Date().getTime();
      if (time < tData[token].timeout) {
        req.session.data = tData[token] || {};
      } else {
        delete tData[token];
        logined.save();
      }
    }
  }
}


// ---- API Key 自动登录：复用 session.data 体系 ----
let visualToolDbConfig = null;
function getVisualToolDb() {
  if (visualToolDbConfig) return visualToolDbConfig;
  visualToolDbConfig = require("./interface/index.js").dbConfig.visualTool;
  return visualToolDbConfig;
}

async function resolveApiKeyAuth(req) {
  // 已有 Cookie 会话（人类用户）优先，不覆盖
  if (req.session && req.session.data && req.session.data.logined) return;

  let raw = "";
  const auth = req.headers["authorization"] || "";
  if (/^Bearer\s+/i.test(auth)) {
    raw = auth.replace(/^Bearer\s+/i, "").trim();
  } else {
    raw = (req.headers["x-api-key"] || "").trim();
  }
  // 非 API Key 形态直接跳过，避免无谓的 DB 查询
  if (!raw || raw.indexOf("ak_live_") !== 0) return;

  try {
    const dbCfg = getVisualToolDb();
    if (!dbCfg || !dbCfg.database) return;

    const client = await ConnectDB.getClient(dbCfg);
    const apiKeyCol = client.db(dbCfg.database).collection("apiKey");

    const key = await ApiKeyTool.verifyApiKey(raw, apiKeyCol);
    if (!key) return;

    const now = Date.now();
    if (key.expiresAt && now > Number(key.expiresAt)) return;

    const ip = WebTool.requestTool.getClientIp(req) || "";
    if (!ApiKeyTool.ipAllowed(key, ip)) return;
    if (!ApiKeyTool.rateLimitOk(key, now)) return;

    // 容忍历史 folderName 类型不一致：同时按字符串/数字匹配
    const fn = key.folderName;
    const accountCol = client.db(dbCfg.database).collection("account");
    const account = await accountCol.findOne(
      { folderName: { $in: [String(fn), Number(fn)] } },
      {
        projection: {
          account: 1,
          folderName: 1,
          tokenLimit: 1,
          tokenUsed: 1,
          subscription: 1,
        },
      }
    );
    if (!account) return;

    req.session = req.session || {};
    req.session.data = ApiKeyTool.buildSessionSnapshot(account, key);
    req.apiKey = {
      keyId: key.keyId,
      name: key.name,
      scopes: key.scopes,
    };

    // 异步更新 lastUsedAt，不阻塞请求
    apiKeyCol
      .updateOne({ keyId: key.keyId }, { $set: { lastUsedAt: now } })
      .catch(function () {});
  } catch (e) {
    console.warn("resolveApiKeyAuth error:", e && e.message);
  }
}

// 在进入桶/租户中间件之前完成自动登录
app.use(async function (req, res, next) {
  await resolveApiKeyAuth(req);
  next();
});

// CSRF 防护：对非安全方法校验同源（浏览器场景）。
// API Key 调用（非浏览器/无 Cookie）不受同源策略约束，跳过。
app.use(function (req, res, next) {
  if (["POST", "PUT", "PATCH", "DELETE"].indexOf(req.method) === -1) return next();
  const auth = String(req.headers["authorization"] || "") + String(req.headers["x-api-key"] || "");
  if (auth.indexOf("ak_live_") !== -1) return next();
  const origin = req.get("origin") || req.get("referer");
  if (origin) {
    try {
      const o = new URL(origin);
      if (o.host !== req.hostname) {
        return res.status(403).json({ ret: 1, message: "跨站请求被拒绝（CSRF）" });
      }
    } catch (e) {
      return res.status(403).json({ ret: 1, message: "非法的来源地址" });
    }
  }
  next();
});

let dbLimit = ["document", "account", "pluginList"];
// let dbLimit = [];
let extraArray = ["/bucket/example/", "/bucket/sys/"]
//Bucket操作接口，操作static/bucket静态目录下的文件
app.use(function (req, res, next) {
  let path = req.path;
  checkRequestToken(req);

  let session = req.session;
  let sData = session.data || {};
  let ret = 1;
  let folderName = sData.folderName + "";
  // 个人目录归属校验必须无条件执行，不得被 query 参数（如 bucketExtra）绕过
  ret = checkRight(path, [folderName], "/bucket/personal/");

  let ret1 = checkRight(path, dbLimit, "/visualTool/");
  let ret3 = checkPrefix(path, extraArray);

  let time = new Date();
  if (time.format) {
    time = time.format("yyyy-MM-dd hh:mm:ss");
  }

  let method = req.method.toLocaleLowerCase();
  if (ret === 1 || ret3 === 0) {
    if (typeof (BucketDealer[method]) === "function") {
      BucketDealer[method](req, res);
    }
  } else if (ret1 === 0 || (ret1 === 1 && sData.logined !== true && method !== "get")) {
    res.json({
      ret: 1,
      message: "异常操作。"
    })
  } else {
    next();
  }
})

app.post('/api/jev/decide', async (req, res) => {

  const { state, questions, model } = req.body;

  // 参数验证：Jev 必须包含输入状态与提问集合
  if (!state || !questions) {
    return res.status(400).json({
      error: 'Invalid Request',
      message: '`state` and `questions` (array) are required.'
    });
  }

  let result = null;

  try {

    result = await WebTool.objectTool.jevDecide(state, questions, model);

    if (result.code === -1 && result.error) {
      return res.status(ret.status).json({
        error: 'Jev Proxy Gateway Error',
        details: result.details
      });
    }
    else {
      console.log("result: ", result);
      return res.json(result);
    }
   
  } catch (error) {
    
    // 错误状态透传
    const status = error.response ? error.response.status : 500;
    const errorData = error.response ? error.response.data : { message: error.message };

    return res.status(status).json({
      error: 'Jev Proxy Gateway Error',
      details: errorData
    });
  }
});

//初始化Web服务
const port = Number(process.env.PORT || 80);
let urlPrefix = `http://localhost:${port}`;
let server = app.listen(port, function (a, b, c) {
  const host = "localhost";
});

// 加载多个证书
const certificates = {};
function loadCertificate(dir, keyFile, certFile) {
  try {
    return {
      key: fs.readFileSync(dir + "/" + keyFile),
      cert: fs.readFileSync(dir + "/" + certFile)
    };
  } catch (err) {
    return null;
  }
}
[
  ["transweb.cn", "cn", "key.pem", "cert.pem"],
  ["transweb.com.cn", "com.cn", "ca.key", "ca.crt"]
].forEach(function (item) {
  const loaded = loadCertificate(prefix.ca + "/" + item[1], item[2], item[3]);
  if (loaded) certificates[item[0]] = loaded;
});

let SSLPORT = env.opt("SSLPORT");
let httpsServer = null;

// 证书是部署者私有的，不随安装包分发；缺失时只跳过 HTTPS，不影响 HTTP 启动
if (certificates["transweb.cn"]) {
  // SNI 回调：根据客户端请求的域名选择证书
  httpsServer = https.createServer({
    SNICallback: (domain, cb) => {
      console.log("current domain: ", domain);
      const cert = certificates[domain] || certificates["transweb.cn"];
      if (cert) {
        cb(null, require('tls').createSecureContext(cert));
      } else {
        cb(new Error('No certificate for domain: ' + domain));
      }
    },
    // 默认证书（必须提供）
    ...certificates['transweb.cn']
  }, app);

  httpsServer.listen(SSLPORT);

  httpsServer.on('error', function () {
    console.log("https error")
  });
  httpsServer.on('listening', function (socket) {
    console.log("listening:" + SSLPORT);
  });

  let currentConnections = 0;

  httpsServer.on('connection', (socket) => {
    currentConnections++;
    console.log('连接增加，当前连接数:', currentConnections);

    socket.on('close', () => {
      currentConnections--;
      console.log('连接断开，当前连接数:', currentConnections);
    });
  });
} else {
  console.log("未检测到 HTTPS 证书（app/ca/cn/key.pem），已跳过 HTTPS 端口 " + SSLPORT);
}

let interface = new ConfigObject(prefix.interface + "interface.js");
let adapter = new Adapter(interface.data);

let cPath = prefix.configData + "index.js";
let config = new ConfigObject(cPath);

let apiFiles = config.data.apiFiles;
for (let k in apiFiles) {
  apiFiles[k] = prefix.configData + apiFiles[k];
}

let restfulConfig = new RestFulConfig(config.data.dbConfig, apiFiles, config.data.prefix, config.data.limitConfig);

let webService = new WebService(app, restfulConfig, {
  prefix: prefix
});
console.log(urlPrefix + "/" + webService.id);

// 启动对账：延迟数秒等待 DB 就绪后，恢复未完成的支付订单
setTimeout(function () {
  reconcilePayments();
}, 5000);

// 周期性重试「已支付但入账失败」的订单（自愈，无需重启）
setInterval(function () {
  PaymentOrder.getUncreditedOrders().then(function (orders) {
    (orders || []).forEach(function (o) {
      if (o.status === "paid") handleDeal(o.out_trade_no);
    });
  }).catch(function () {});
}, 5 * 60 * 1000);

let routes = app._router.stack;

let tArr = [];
for (let i = 0; i < routes.length; i++) {
  if (routes[i].route && routes[i].route.path) {
    tArr.push(routes[i].route.path);
  }
}



function generateOrderString(params) {
  let arr = Object.keys(params);
  if (arr.length === 0) {
    return "";
  }
  arr.sort(function (a, b) {
    let t = 0;
    if (a > b) {
      t = 1
    } else if (a < b) {
      t = -1
    } else {
      t = 0;
    }
    return t;
  });
  let str = arr[0] + "=" + params[arr[0]];
  for (let i = 1; i < arr.length; i++) {
    str += "&" + arr[i] + "=" + params[arr[i]];
  }
  return str;
}

function generateXmlString(params, rootName) {
  let str = "<" + rootName + ">\n";
  for (let k in params) {
    str += "<" + k + ">" + params[k] + "</" + k + ">\n";
  }
  str += "</" + rootName + ">";
  return str;
}

// 校验微信支付 APIv2 回调签名：剔除 sign 后按字典序拼串 + key，MD5 大写比对
function verifyWxSign(p) {
  if (!p || typeof p.sign !== "string") return false;
  const sign = p.sign;
  const copy = {};
  for (const k in p) {
    if (k !== "sign" && p[k] !== undefined && p[k] !== "") {
      copy[k] = p[k];
    }
  }
  const stringA = generateOrderString(copy);
  const stringSignTemp = stringA + "&key=" + wxPayInfo.key;
  const calc = crypto.createHash("md5").update(stringSignTemp).digest("hex").toUpperCase();
  return calc === sign;
}

function wxPayReply(ok, msg) {
  return "<xml><return_code><![CDATA[" + (ok ? "SUCCESS" : "FAIL") +
    "]]></return_code><return_msg><![CDATA[" + (msg || (ok ? "OK" : "FAIL")) +
    "]]></return_msg></xml>";
}

// 积分入账：直接操作 account 集合（$inc tokenLimit）并写 pointsBill 流水。
// 不再经 adapter.updateCollectionInfo 做 HTTP 自调用（其相对 URL 在 Node 下无法解析），
// 入账更可靠，且与 admin.js updateCollectionInfo 的落库语义保持一致。
function creditTokens(order) {
  return new Promise(function (resolve, reject) {
    const dbCfg = getVisualToolDb();
    ConnectDB.getClient(dbCfg).then(function (client) {
      const db = client.db(dbCfg.database);
      const tokens = Number(order.tokens) || 0;
      const folderName = String(order.folderName || "");
      db.collection("account").updateOne(
        { folderName: { $in: [folderName, Number(folderName)] } },
        { $inc: { tokenLimit: tokens } },
        function (err) {
          if (err) return reject(err);
          db.collection("pointsBill").insertOne({
            name: "积分充值",
            value: tokens,
            type: "income",
            folderName: folderName,
            time: new Date().getTime(),
          }, function (err2) {
            if (err2) return reject(err2);
            resolve();
          });
        }
      );
    }).catch(reject);
  });
}

// 幂等记账：认领（claimForCredit 原子翻转 tradeFlag）→ 入账 → 标记完成；失败回退供对账重试
async function handleDeal(tradeNo) {
  try {
    const order = await PaymentOrder.getOrder(tradeNo);
    if (!order || order.tradeFlag) return;
    const claimed = await PaymentOrder.claimForCredit(tradeNo);
    if (!claimed) return; // 已被其他通道认领
    try {
      await creditTokens(claimed);
      await PaymentOrder.markCredited(tradeNo);
    } catch (err) {
      console.error("积分入账失败，订单将进入对账重试:", tradeNo, err && err.message);
      await PaymentOrder.markCreditFailed(tradeNo).catch(function () {});
    }
  } catch (err) {
    console.error("handleDeal 异常:", tradeNo, err && err.message);
  }
}

// 订单查询轮询（回调的兜底通道），状态全部落库，跨重启不丢
function updateOrderStatus(tradeNo, s, n, appId) {
  let count = 0;
  const poll = function () {
    PaymentOrder.getOrder(tradeNo).then(async function (order) {
      if (!order || order.status === "cancelled" || order.status === "credited") return;
      if (count >= n) {
        await PaymentOrder.markTimeout(tradeNo).catch(function () {});
        return;
      }
      count++;
      queryOrder(tradeNo, async function (tData) {
        const data = (tData && tData.data) || {};
        const state = data.trade_state || "";
        if (state) {
          await PaymentOrder.updateTradeState(tradeNo, state).catch(function () {});
        }
        if (tData && tData.code === 0 && state === "SUCCESS") {
          await handleDeal(tradeNo);
        } else if (["CLOSED", "PAYERROR", "REVOKED", "REFUND"].indexOf(state) !== -1) {
          // 终态，无需继续轮询
        } else {
          setTimeout(poll, s);
        }
      }, appId);
    }).catch(function (err) {
      console.error("updateOrderStatus 查询订单失败:", tradeNo, err && err.message);
    });
  };
  poll();
}

// 启动对账：恢复尚未入账的订单（回调缺失/进程重启后的兜底）
async function reconcilePayments() {
  try {
    const orders = await PaymentOrder.getUncreditedOrders();
    for (const o of orders) {
      if (o.status === "paid") {
        handleDeal(o.out_trade_no);
      } else if (o.status === "pending") {
        const age = Date.now() - (o.createdAt || 0);
        if (age < 15 * 60 * 1000) {
          updateOrderStatus(o.out_trade_no, 5000, 12 * 15, o.appId);
        }
      }
    }
  } catch (err) {
    console.error("支付对账失败:", err && err.message);
  }
}


app.get('/wxSignature', async (req, res) => {
  try {
    // 获取前端传过来的url（必须）
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: '缺少参数 url' });
    }
    const type = req.query.type || "wxService";

    // 获取jsapi_ticket
    const ticket = await getJsapiTicket();
    const timestamp = Math.floor(Date.now() / 1000); // 10位时间戳
    const nonceStr = generateNonceStr();

    // 生成签名
    const signature = generateSignature(ticket, nonceStr, timestamp, url);
    let sData = {
      appId: WECHAT_CONFIG[type].appId,
      timestamp,
      nonceStr,
      signature,
    }
    // 返回签名所需参数
    res.json(sData);
  } catch (error) {
    console.error('签名接口错误:', error.message);
    res.status(500).json({ error: '获取签名失败，请稍后重试' });
  }
});

app.get('/wxGetOpenid', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).json({ error: '缺少code' });
  }
  let type = req.query.type || "wxService";
  let url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${WECHAT_CONFIG[type].appId}&secret=${WECHAT_CONFIG[type].appSecret}&code=${code}&grant_type=authorization_code`;
  if (type === "wxApp") {
    url = `https://api.weixin.qq.com/sns/jscode2session?appid=${WECHAT_CONFIG[type].appId}&secret=${WECHAT_CONFIG[type].appSecret}&js_code=${code}&grant_type=authorization_code`;
  }

  try {
    const response = await axios.get(url);
    const { openid } = response.data;
    res.json({ openid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取openid失败' });
  }
});

app.get("/cancleOrder", function (req, res) {
  if (!req.query.tradeNo) {
    WebTool.requestTool.sendData({
      code: 1,
      msg: "缺少tradeNo参数"
    }, req, res);
    return;
  }
  const tradeNo = req.query.tradeNo;
  const sData = (req.session && req.session.data) || {};
  const owner = String(sData.folderName || "");
  PaymentOrder.getOrder(tradeNo).then(function (order) {
    if (!order) {
      return WebTool.requestTool.sendData({ code: 1, msg: "订单不存在" }, req, res);
    }
    // 只允许取消自己的订单，防止 CSRF/越权取消他人订单
    if (owner && order.folderName !== owner) {
      return WebTool.requestTool.sendData({ code: 1, msg: "无权取消该订单" }, req, res);
    }
    return PaymentOrder.markCancelled(tradeNo).then(function () {
      WebTool.requestTool.sendData({ code: 0, msg: "取消订单成功！" }, req, res);
    });
  }).catch(function () {
    WebTool.requestTool.sendData({ code: 1, msg: "取消订单失败" }, req, res);
  });
});

let queryOrder = function (tradeNo, callback, appId) {
  if (!tradeNo) {
    return false;
  }
  let params = {
    appid: appId || wxPayInfo.appId,
    mch_id: wxPayInfo.mchId,
    sign_type: wxPayInfo.signType,
    out_trade_no: tradeNo,
    nonce_str: ""
  }
  params.nonce_str = crypto.randomBytes(16).toString('hex');
  let stringA = generateOrderString(params);
  let stringSignTemp = stringA + "&key=" + wxPayInfo.key;
  let md5 = crypto.createHash('md5');
  params.sign = md5.update(stringSignTemp).digest('hex').toUpperCase();


  let jsonxml = generateXmlString(params, "xml");
  let options = {
    url: wxPayInfo.queryOrderUrl,
    timeout: 10000,
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml'
    },
    body: jsonxml
  };
  request(options, function (err, response, body) {
    if (err || response.statusCode !== 200) {
      console.error(err, response);
      if (typeof callback === "function") {
        callback({
          code: 2,
          msg: "请求支付结果失败"
        });
      }

    } else {
      let xmlParser = new xml2js.Parser({
        explicitArray: false,
        ignoreAttrs: true
      });
      xmlParser.parseString(body, function (err, data) {
        if (err) {
          if (typeof callback === "function") {
            callback({
              code: 3,
              msg: "获取订单信息失败，解析错误"
            });
          }
          return false;
        }
        data = data.xml || {};
        if (!data || data.return_code !== "SUCCESS") {
          if (typeof callback === "function") {
            callback({
              code: 1,
              data: data,
              msg: "请求订单信息失败"
            })
          }
        } else {
          if (typeof callback === "function") {
            callback({
              code: 0,
              data: data,
              msg: "success"
            })
          }
        }
      });
    }
  })

}

app.post("/wxOrder", function (req, res) {
  req.session.data = req.session.data || {};

  // P0-2：价格与积分由服务端价目表决定，客户端只允许指定 product_id
  const productId = req.body.product_id || "";
  const product = PaymentOrder.PRODUCTS[productId];
  if (!product) {
    return WebTool.requestTool.sendData({ code: 1, msg: "无效的充值套餐" }, req, res);
  }
  const price = product.price;   // 分
  const tokens = product.tokens;
  const tradeType = req.body.trade_type || "NATIVE";

  // 获取客户端真实 IP（自动处理 X-Forwarded-For）
  let clientIp = req.ip;
  if (!clientIp || clientIp === '::1' || clientIp.startsWith('127.')) {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      const ips = forwarded.split(',').map(ip => ip.trim());
      clientIp = ips.find(ip => !ip.startsWith('192.168.') && !ip.startsWith('10.') && !ip.startsWith('172.') && ip !== '127.0.0.1') || ips[0];
    }
  }
  clientIp = clientIp.replace(/^::ffff:/, '');

  const aType = req.body.type || "wxService";
  const appid = WECHAT_CONFIG[aType].appId;

  // P0-5：用加密安全随机数生成 nonce 与唯一订单号
  const nonceStr = crypto.randomBytes(16).toString('hex');
  const outTradeNo = "tw" + Date.now().toString(36) + crypto.randomBytes(8).toString('hex');

  let notify = wxPayInfo.notify;
  let params = {
    appid: appid,
    body: "TransWeb 积分充值",
    device_info: "WEB",
    mch_id: wxPayInfo.mchId,
    nonce_str: nonceStr,
    notify_url: notify,
    out_trade_no: outTradeNo,
    product_id: productId,
    sign_type: "MD5",
    spbill_create_ip: clientIp,
    total_fee: price,
    trade_type: tradeType
  };
  if (req.body.openid) {
    params.openid = req.body.openid;
  }
  if (params.trade_type === "MWEB") {
    params.scene_info = JSON.stringify({ "h5_info": { "type": "Wap", "wap_url": "transweb.cn", "wap_name": "北京津度科技有限责任公司" } });
  }

  let stringA = generateOrderString(params);
  let stringSignTemp = stringA + "&key=" + wxPayInfo.key;
  params.sign = crypto.createHash('md5').update(stringSignTemp).digest('hex').toUpperCase();

  // 先落库（pending），避免下单成功但进程崩溃导致无记录
  const folderName = (req.session.data && req.session.data.folderName) ? req.session.data.folderName : (req.body.folderName || "");
  PaymentOrder.createOrder({
    out_trade_no: outTradeNo,
    folderName: folderName,
    productId: productId,
    appId: appid,
    price: price,
    tokens: tokens,
  }).then(function () {
    // 取消上一个未完成订单，避免重复下单堆积
    const lastTrade = req.session.data.tradeNo;
    if (lastTrade) {
      PaymentOrder.markCancelled(lastTrade).catch(function () {});
    }
    req.session.data.tradeNo = outTradeNo;

    let jsonxml = generateXmlString(params, "xml");
    let options = {
      url: wxPayInfo.payOrderUrl,
      timeout: 10000,
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: jsonxml
    };

    request(options, function (err, response, body) {
      if (err) {
        console.error(err);
        WebTool.requestTool.sendData({ code: 2, msg: "请求支付链接失败" }, req, res);
      } else if (response.statusCode == 200) {
        let xmlParser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: true });
        xmlParser.parseString(body, function (err, data) {
          data = (data && data.xml) || {};
          let responseData = {
            code: data.return_code,
            message: data.return_msg,
            payUrl: data.code_url,
            out_trade_no: outTradeNo,
            prepay_id: data.prepay_id,
            mweb_url: data.mweb_url,
            trade_type: data.trade_type
          };
          if (tradeType === "JSAPI" && data.prepay_id) {
            const timeStamp = Math.floor(Date.now() / 1000).toString();
            const nonceStr2 = crypto.randomBytes(16).toString('hex');
            const packageStr = `prepay_id=${data.prepay_id}`;
            const signType = "MD5";
            const signParams = { appId: appid, timeStamp, nonceStr: nonceStr2, package: packageStr, signType };
            const stringA = Object.keys(signParams).sort().map(k => `${k}=${signParams[k]}`).join('&');
            const paySign = crypto.createHash('md5').update(stringA + "&key=" + wxPayInfo.key).digest('hex').toUpperCase();
            Object.assign(responseData, { appId: appid, timeStamp, nonceStr: nonceStr2, package: packageStr, signType, paySign });
          }
          WebTool.requestTool.sendData(responseData, req, res);
        });
        // 订单有效时间为15分钟，轮询作为回调兜底
        updateOrderStatus(outTradeNo, 5000, 12 * 15, appid);
      } else {
        WebTool.requestTool.sendData({ code: 1, msg: "请求中" }, req, res);
      }
    });
  }).catch(function (err) {
    console.error("创建支付订单失败:", err && err.message);
    WebTool.requestTool.sendData({ code: 2, msg: "创建订单失败" }, req, res);
  });
});

app.post("/receiveWxNotify", express.raw({ type: ["text/xml", "application/xml"], limit: "1mb" }), function (req, res) {
  const raw = req.body;
  if (!raw || !raw.length) {
    return res.type("application/xml").send(wxPayReply(false, "缺少报文"));
  }
  const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: true, trim: true });
  parser.parseString(raw.toString("utf8"), function (err, data) {
    if (err || !data || !data.xml) {
      return res.type("application/xml").send(wxPayReply(false, "解析失败"));
    }
    const p = data.xml;
    // 业务未成功：回 SUCCESS 避免微信无意义重试
    if (p.return_code !== "SUCCESS" || p.result_code !== "SUCCESS") {
      return res.type("application/xml").send(wxPayReply(true, "OK"));
    }
    if (!verifyWxSign(p)) {
      console.error("微信支付回调验签失败:", p.out_trade_no);
      return res.type("application/xml").send(wxPayReply(false, "验签失败"));
    }
    const orderNo = p.out_trade_no;
    PaymentOrder.getOrder(orderNo).then(function (order) {
      if (!order) {
        return res.type("application/xml").send(wxPayReply(false, "订单不存在"));
      }
      if (String(p.total_fee) !== String(order.price)) {
        console.error("微信支付回调金额不一致:", orderNo, p.total_fee, order.price);
        return res.type("application/xml").send(wxPayReply(false, "金额不一致"));
      }
      return handleDeal(orderNo).then(function () {
        res.type("application/xml").send(wxPayReply(true, "OK"));
      }).catch(function () {
        res.type("application/xml").send(wxPayReply(false, "入账失败"));
      });
    }).catch(function () {
      res.type("application/xml").send(wxPayReply(false, "服务异常"));
    });
  });
});

app.get("/checkPay", function (req, res) {
  let out_trade_no = req.query.out_trade_no;
  if (!out_trade_no) {
    WebTool.requestTool.sendData({
      ret: 3,
      data: "获取支付情况失败，缺少订单编号"
    }, req, res);
    return;
  }
  PaymentOrder.getOrder(out_trade_no).then(function (order) {
    WebTool.requestTool.sendData(order || {}, req, res);
  }).catch(function () {
    WebTool.requestTool.sendData({}, req, res);
  });
});

/*
  Paddle pay callback
*/
app.get("/paddleOrderInfo", function (req, res) {
});

app.post("/successOrder", function (req, res) {
});


Date.prototype.format = function (fmt) {
  let o = {
    "M+": this.getMonth() + 1, //月份 
    "d+": this.getDate(), //日 
    "h+": this.getHours(), //小时 
    "m+": this.getMinutes(), //分 
    "s+": this.getSeconds(), //秒 
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
    "S": this.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  for (let k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
  }
  return fmt;
}