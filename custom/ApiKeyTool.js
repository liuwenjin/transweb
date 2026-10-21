// custom/ApiKeyTool.js —— API Key 生成 / 校验 / Scope 权限控制 / 会话快照
let crypto = require("crypto");
let env = require("./env.js");

const KEY_PREFIX = "ak_live_";
const KEY_ID_PREFIX = "ak_";
const KEY_PREFIX_LEN = 16; // 用于快速索引查找的前缀长度

// ---------- 基础工具 ----------

function randomToken(bytes) {
  return crypto.randomBytes(bytes).toString("hex");
}

// 服务端只存哈希，绝不存明文 Key
function hashKey(rawKey) {
  const salt = env.opt("API_KEY_SALT");
  return crypto
    .createHash("sha256")
    .update(String(salt) + String(rawKey))
    .digest("hex");
}

// 常量时间比较，防时序侧信道
function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

// ---------- Key 生成 ----------

function generateApiKey() {
  const payload = KEY_PREFIX + randomToken(24); // ak_live_ + 48 hex
  return {
    payload, // 明文，仅返回一次
    keyId: KEY_ID_PREFIX + randomToken(8), // 公开标识
    keyHash: hashKey(payload),
    keyPrefix: payload.slice(0, KEY_PREFIX_LEN),
  };
}

// ---------- Scope 词汇表 ----------

const SCOPES = [
  "account:read",
  "account:write",
  "doc:read",
  "doc:write",
  "ai:chat",
  "points:read",
  "points:transfer",
];

// 只允许白名单内的 scope；admin:* 永远不允许
function normalizeScopes(scopes) {
  if (!Array.isArray(scopes)) return [];
  return [...new Set(scopes)].filter((s) => SCOPES.indexOf(s) !== -1);
}

// ---------- 会话快照（与 upateTokenData 输出对齐，共享 session.data） ----------

function buildSessionSnapshot(account, key) {
  const now = Date.now();
  return {
    account: account.account,
    folderName: account.folderName,
    tokenLimit: account.tokenLimit,
    tokenUsed: account.tokenUsed,
    subscription: account.subscription || 0,
    vipTimeout: now > (account.subscription || 0),
    logined: true,
    _apiKey: key.keyId, // 标记会话来源为 API Key
  };
}

// ---------- 权限判定 ----------

function authorize(req, requiredScope) {
  if (!requiredScope) return true; // 未标注 scope 的接口不拦截
  const s = (req.session && req.session.data) || {};
  if (!s.logined) return false;

  // 人类 Cookie 会话：非 admin:* 全量放行
  if (!s._apiKey) return requiredScope.indexOf("admin:") !== 0;

  // API Key 会话：必须有对应 scope；admin:* 拒绝
  const key = req.apiKey;
  return (
    requiredScope.indexOf("admin:") !== 0 &&
    !!key &&
    Array.isArray(key.scopes) &&
    key.scopes.indexOf(requiredScope) !== -1
  );
}

// ---------- 校验（需要传入 apiKey 集合） ----------

let indexesEnsured = false;
async function ensureIndexes(apiKeyCol) {
  if (indexesEnsured) return;
  try {
    await apiKeyCol.createIndex({ keyId: 1 }, { unique: true });
    await apiKeyCol.createIndex({ keyPrefix: 1 });
    await apiKeyCol.createIndex({ account: 1, status: 1 });
    await apiKeyCol.createIndex({ folderName: 1, status: 1 });
    indexesEnsured = true;
  } catch (e) {
    console.warn("apiKey 索引创建失败:", e && e.message);
  }
}

async function verifyApiKey(rawKey, apiKeyCol) {
  if (typeof rawKey !== "string" || rawKey.indexOf(KEY_PREFIX) !== 0) {
    return null;
  }
  if (rawKey.length < 24) return null;

  await ensureIndexes(apiKeyCol);

  const prefix = rawKey.slice(0, KEY_PREFIX_LEN);
  const hash = hashKey(rawKey);
  const candidates = await apiKeyCol
    .find({ keyPrefix: prefix, status: "active" })
    .toArray();

  for (const c of candidates) {
    if (safeEqual(c.keyHash, hash)) return c;
  }
  return null;
}

// ---------- 轻量 IP 白名单 + 内存级限流（生产可替换为 Redis） ----------

function ipAllowed(key, ip) {
  const list = key.allowedIps;
  if (!Array.isArray(list) || list.length === 0) return true;
  return list.indexOf(ip) !== -1;
}

const rateStore = new Map();
const RATE_STORE_MAX = 10000;

// 固定窗口（分钟）限流，返回是否放行
function rateLimitOk(key, now) {
  const rpm = (key.rateLimit && key.rateLimit.rpm) || 60;
  const id = key.keyId;
  const window = Math.floor(now / 60000);
  let entry = rateStore.get(id);

  if (!entry || entry.window !== window) {
    entry = { window, count: 0 };
  }
  entry.count += 1;
  rateStore.set(id, entry);

  // 简单淘汰，防止内存无限增长
  if (rateStore.size > RATE_STORE_MAX) {
    const first = rateStore.keys().next().value;
    rateStore.delete(first);
  }
  return entry.count <= rpm;
}

module.exports = {
  KEY_PREFIX,
  SCOPES,
  generateApiKey,
  hashKey,
  safeEqual,
  normalizeScopes,
  buildSessionSnapshot,
  authorize,
  ensureIndexes,
  verifyApiKey,
  ipAllowed,
  rateLimitOk,
};
