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
let murmurHash3 = require('murmurhash3js');
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
  notify: "https://transweb.cn/receiveWxNotify",
  signType: "MD5",
  payOrderUrl: "https://api.mch.weixin.qq.com/pay/unifiedorder",
  queryOrderUrl: "https://api.mch.weixin.qq.com/pay/orderquery"
}

// 微信配置（建议从环境变量读取）
const WECHAT_CONFIG = {
  wxApp: {
    appId: env.opt("WX_PAY_APP_ID001"),
    appSecret: env.opt("WX_PAY_APP_SECRET001"),
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
    console.log("微信API data: ", response.data)
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
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});


app.use(express.json({ limit: '3mb' }));
app.use(express.urlencoded({ limit: '3mb', extended: true }));

app.use(compression({
  filter: (req, res) =>
    !req.path.startsWith('/gpt/aiStreamRequest') && compression.filter(req, res)
}));

app.use(express.static("static", {}));
app.use(session({
  secret: env.get("SESSION_SECRET"), // 从环境变量读取（见 .env）
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 60 * 1000 * 60 * 24,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  } // 过期时间（毫秒）
}));


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
  if (path.search(prefix) === 0) {
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
    if (path.search(arr[i]) === 0) {
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
  if (!req.query.bucketExtra) {
    ret = checkRight(path, [folderName], "/bucket/personal/");
  }

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
const certificates = {
  'transweb.cn': {
    key: fs.readFileSync(prefix.ca + "/cn/key.pem"),
    cert: fs.readFileSync(prefix.ca + "/cn/cert.pem"),
  },
  'transweb.com.cn': {
    key: fs.readFileSync(prefix.ca + "/com.cn/ca.key"),
    cert: fs.readFileSync(prefix.ca + "/com.cn/ca.crt")
  }
};



let SSLPORT = env.opt("SSLPORT");

// SNI 回调：根据客户端请求的域名选择证书
const httpsServer = https.createServer({
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

let routes = app._router.stack;

let tArr = [];
for (let i = 0; i < routes.length; i++) {
  if (routes[i].route && routes[i].route.path) {
    tArr.push(routes[i].route.path);
  }
}



let _time = WebTool.objectTool.getTime();
let payLog = new ConfigObject(prefix.wxPayLog + _time + ".js", {}, 1);


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

function handleDeal(tradeNo) {
  let tOrder = payLog.data[tradeNo] || {};
  console.log("handleDeal: ", tradeNo, "tOrder.tradeFlag: ", tOrder.tradeFlag);
  if (!tOrder.tradeFlag) {
    tOrder.tokens = Number(tOrder.tokens) || 0;
    tOrder.tradeFlag = true;
    payLog.save();
    adapter.updateCollectionInfo({
      folderName: tOrder.folderName,
      value: tOrder.tokens,
      adminKey: env.opt("ADMIN_KEY")
    }, function (tData) {
      tOrder.tradeCompleted = true;
      payLog.save();
    })
  }
}

function updateOrderStatus(tradeNo, s, n, appId) {
  let timer = null;
  let count = 0;
  let tOrder = payLog.data[tradeNo] || {};
  let getOrderInfo = function (tNo, s) {
    clearTimeout(timer);
    count++
    if (count < n && !tOrder.cancle) {
      queryOrder(tNo, function (tData) {
        console.log("tData: ", tData, tData.data);
        tData.data = tData.data || {};
        tOrder.tradeState = tData.data.trade_state;
        payLog.save();
        if (tData.code === 0 && tData.data.trade_state === 'SUCCESS') {
          handleDeal(tData.data.out_trade_no);
          clearTimeout(timer);
        } else {
          console.log("###waiting", tData.data.out_trade_no)
          timer = setTimeout(() => {
            getOrderInfo(tNo, s)
          }, s)
        }
      }, appId);
    } else {
      clearTimeout(timer);
      tOrder.timeout = true;
    }
  }
  getOrderInfo(tradeNo, s);
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
    console.log("response.data: ", response.data);
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
  }
  if (payLog.data[req.query.tradeNo]) {
    payLog.data[req.query.tradeNo].cancle = true;
    payLog.save();
  }
  WebTool.requestTool.sendData({
    code: 0,
    msg: "取消订单成功！"
  }, req, res);

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
  params.nonce_str = Math.random().toString(36).substr(2);
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
  req.session.data.lastTrade = req.session.data.tradeNo || "";

  let type = req.body.trade_type || "NATIVE";
  let price = Number(req.body.price) || 29000;
  let product = req.body.product || "token";
  let id = req.body.product_id || "001";

  // 获取客户端真实 IP（自动处理 X-Forwarded-For）
  let clientIp = req.ip;

  // 若 req.ip 返回的是 IPv6 格式或内网地址，可手动提取
  // 手动方式：取 X-Forwarded-For 的第一个非内网 IP
  if (!clientIp || clientIp === '::1' || clientIp.startsWith('127.')) {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      const ips = forwarded.split(',').map(ip => ip.trim());
      clientIp = ips.find(ip => !ip.startsWith('192.168.') && !ip.startsWith('10.') && !ip.startsWith('172.') && ip !== '127.0.0.1') || ips[0];
    }
  }

  // 确保是 IPv4 格式
  clientIp = clientIp.replace(/^::ffff:/, '');
  console.log("clientIp: ", clientIp);

  let aType = req.body.type || "wxService";

  let appid = WECHAT_CONFIG[aType].appId;

  console.log("current appid: ", appid);

  let notify = wxPayInfo.notify;
  let params = {
    appid: appid,
    body: product,
    device_info: "WEB",
    mch_id: wxPayInfo.mchId,
    nonce_str: "",
    notify_url: notify,
    out_trade_no: "",
    product_id: id,
    sign_type: "MD5",
    spbill_create_ip: clientIp,
    total_fee: price,
    trade_type: type
  }
  if (req.body.openid) {
    params.openid = req.body.openid;
  }
  if (params.trade_type === "MWEB") {
    params.scene_info = JSON.stringify({ "h5_info": { "type": "Wap", "wap_url": "transweb.cn", "wap_name": "北京津度科技有限责任公司" } });
  }

  params.nonce_str = Math.random().toString(36).substr(2);
  params.out_trade_no = murmurHash3.x86.hash32(params.nonce_str + "_" + (new Date()).getTime());

  console.log("params: ", params);

  let md5 = crypto.createHash('md5');

  let stringA = generateOrderString(params);

  let stringSignTemp = stringA + "&key=" + wxPayInfo.key;

  params.sign = md5.update(stringSignTemp).digest('hex').toUpperCase();


  let jsonxml = generateXmlString(params, "xml");

  let options = {
    url: wxPayInfo.payOrderUrl,
    timeout: 10000,
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml'
    },
    body: jsonxml
  };

  request(options, function (err, response, body) {
    if (err) {
      console.error(err);
      WebTool.requestTool.sendData({
        code: 2,
        msg: "请求支付链接失败"
      }, req, res);
    } else if (response.statusCode == 200) {
      let name = "";
      if (req.session.data && req.session.data.folderName) {
        name = req.session.data.folderName;
      }
      req.session.data.tradeNo = params.out_trade_no;
      if (req.session.data.lastTrade && payLog.data[req.session.data.lastTrade]) {
        payLog.data[req.session.data.lastTrade].cancle = true;
      }

      payLog.data[params.out_trade_no] = {
        folderName: name || req.body.folderName,
        product_id: params.product_id,
        price: req.body.price,
        tokens: req.body.tokens,
        time: (new Date()).getTime()
      }
      payLog.save();

      let xmlParser = new xml2js.Parser({
        explicitArray: false,
        ignoreAttrs: true
      });

      console.log('原始 XML 响应:', body);
      xmlParser.parseString(body, function (err, data) {
        data = data.xml || {};

        console.log("data.return_code", data.return_code);
        console.log("data.prepay_id", data.prepay_id);
        // 构建基础返回数据
        let responseData = {
          code: data.return_code,
          message: data.return_msg,
          payUrl: data.code_url,
          out_trade_no: params.out_trade_no,
          prepay_id: data.prepay_id,
          mweb_url: data.mweb_url,
          trade_type: data.trade_type
        };

        // 如果是 JSAPI 支付，额外生成前端调起支付所需参数
        if (type === "JSAPI" && data.prepay_id) {
          const timeStamp = Math.floor(Date.now() / 1000).toString();
          const nonceStr = Math.random().toString(36).substr(2, 15);
          const packageStr = `prepay_id=${data.prepay_id}`;
          const signType = "MD5";

          // 生成 paySign（签名规则：appId、timeStamp、nonceStr、package、signType 按字典序排序后拼接，加 key 后 MD5 大写）
          const signParams = {
            appId: appid,
            timeStamp,
            nonceStr,
            package: packageStr,
            signType
          };
          const stringA = Object.keys(signParams).sort().map(k => `${k}=${signParams[k]}`).join('&');
          const stringSignTemp = stringA + "&key=" + wxPayInfo.key; // 使用与统一下单相同的密钥
          const paySign = crypto.createHash('md5').update(stringSignTemp).digest('hex').toUpperCase();

          console.log("packageStr: ", packageStr);

          Object.assign(responseData, {
            appId: appid,
            timeStamp,
            nonceStr,
            package: packageStr,
            signType,
            paySign
          });
        }

        // 返回给前端
        WebTool.requestTool.sendData(responseData, req, res);
      })
      //订单有效时间为15分钟
      updateOrderStatus(params.out_trade_no, 5000, 12 * 15, appid);
    } else {
      WebTool.requestTool.sendData({
        code: 1,
        msg: "请求中"
      }, req, res);
    }
  });
});

app.post("/receiveWxNotify", function (req, res) {
  // let body = req.rawBody || req.body;
  // console.log("receiveWxNotify_body", body, req.headers);

  let feedback = generateXmlString({
    return_code: "SUCCESS",
    return_msg: "OK"
  }, "xml");
  res.end(feedback);
});

app.get("/checkPay", function (req, res) {
  let out_trade_no = req.query.out_trade_no;
  if (!out_trade_no) {
    WebTool.requestTool.sendData({
      ret: 3,
      data: "获取支付情况失败，缺少订单编号"
    }, req, res);
    return false;
  }
  let tOrder = payLog.data[out_trade_no] || {};
  WebTool.requestTool.sendData(tOrder, req, res);
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