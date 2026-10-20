# API Key 自动登录 + 共享 Session Data 权限控制方案

> 目标：允许第三方客户端 / SDK / 自动化脚本使用 **API Key** 免密码自动登录，复用现有
> `req.session.data` 会话体系与全部现有权限判断，做到「一套会话数据、两套凭据（密码 / API Key）」。
>
> 适用范围：`transweb` 项目（Express + express-session + MongoDB）。

---

## 1. 背景与目标

当前系统只有「账号 + 密码 / 验证码」一种登录方式，登录成功后把用户快照写入
`req.session.data`，后续接口都依赖它做租户隔离与权限控制。要让程序化调用（Agent、脚本、
第三方平台、CI）也能安全地获得同等会话能力，需要一个：

- **可撤销、可限权、可过期、可审计** 的 API Key 凭据；
- 凭据校验通过后 **自动构造与登录完全一致的 `session.data`**（共享会话数据）；
- 在不改动每个接口内部 `if (!data.folderName)` 这类判断的前提下，提供 **分级权限控制（Scope）**。

---

## 2. 现状分析（代码依据）

| 环节 | 位置 | 说明 |
| --- | --- | --- |
| 会话 | `webServer.js:230-240` | `express-session`，`req.session.data` 存用户快照 |
| 登录 | `interface/test.js` `check`（`3315-3547`） | 账号+密码 / 账号+验证码，成功后写 `req.session.data` |
| 登录令牌 | `interface/test.js` `upateTokenData`（`117-140`） | 生成 `t_<hash>` 写入 `interface/config/logined.js`，24h 过期 |
| 令牌恢复 | `webServer.js` `checkRequestToken`（`324-341`） | 读 `transweb-token` 头，命中且未过期则 `req.session.data = tData[token]` |
| 租户/桶鉴权 | `webServer.js:348-381` | 中间件：`folderName` 决定 `/bucket/personal/`、`/visualTool/` 访问 |
| 接口注册 | `custom/RestFulConfig.js:84-103` | 每个接口 `{method, dbItem, callback}` 由配置自动生成路由 |
| 令牌存储 | `custom/ConfigObject.js` | `logined.js` 是**文件型** KV，`save()` 全量重写文件 |

**现有 `session.data` 权限相关字段**（各接口散落使用）：

```js
{
  folderName,    // 租户标识（核心隔离键）
  account,       // 账号
  logined,       // 布尔登录态
  role,          // 数组，如 ['partner']
  tokenLimit,    // 积分上限
  tokenUsed,     // 已用积分
  subscription,  // 订阅到期时间戳
  vipTimeout,    // 是否已过订阅期
}
```

权限判断常见形态：
- `if (!data || !data.folderName)` → 未登录
- `data.account === commonData.adminAccount` → 管理员
- `admin === commonData.powerAdmin && commonData.adminSwitch` → 超级管理员
- `data.role && data.role.indexOf("partner") !== -1` → 合伙人

---

## 3. 总体设计思路

1. **复用会话形状**：API Key 校验成功后，构造与 `upateTokenData` 输出完全一致的
   `sessionData` 快照，写入 `req.session.data`，让现有所有接口的权限判断零改动生效。
2. **API Key 与登录令牌分离**：
   - 登录令牌 `t_*`：短生命周期（24h），随密码登录产生，存 `logined.js`。
   - API Key `ak_*`：长生命周期、用户可管理，**存 MongoDB**（支持查询/审计/撤销），
     只在服务端存哈希。
3. **鉴权前置**：扩展 `checkRequestToken`（或在其前增加 `resolveApiKeyAuth`），在进入
   桶/租户中间件之前就完成「API Key → session.data」的自动登录。
4. **分级权限**：引入 Scope（接口级权限标注），API Key 声明 Scope，Cookie 会话保持原有
   全量权限（可选逐步收紧）。

---

## 4. 数据模型：`apiKey` 集合

新建 MongoDB 集合 `apiKey`（通过 `ConnectDB` / `WebTool.objectTool` 读写）：

```js
{
  _id: ObjectId,
  keyId: "ak_xxxxxxxx",          // 公开标识（列表/撤销用）
  keyPrefix: "ak_live_ab12",     // 前 N 位，用于快速索引查找
  keyHash: "sha256 hex",         // 只存哈希，绝不存明文
  account: "xxx",                // 归属账号
  folderName: "4140329349",      // 租户标识（冗余，便于直接构造 session）
  name: "my-bot",                // 备注名
  scopes: ["ai:chat", "doc:read"], // 权限范围
  roles: [],                     // 可选角色（必须 ⊆ 账号自身角色）
  allowedIps: [],                // 可选 IP 白名单
  rateLimit: { rpm: 60 },        // 可选每 key 速率
  quota: { tokenLimit: null },   // 可选独立预算（null=跟随账号）
  status: "active",              // active | revoked | expired
  expiresAt: null,               // 可选过期时间
  lastUsedAt: Date,
  createdAt: Date,
  createdBy: "admin" | "user",
}
```

**索引建议**：
- `{ keyPrefix: 1 }`（唯一，鉴权查找）
- `{ account: 1, status: 1 }`（用户列出自有 Key）
- `{ expiresAt: 1, status: 1 }`（过期清理任务）

---

## 5. Key 生成、存储与校验

### 5.1 生成

```
payload = "ak_live_" + base62(crypto.randomBytes(24))   // 明文只返回一次
keyId   = "ak_" + base62(crypto.randomBytes(8))          // 公开 ID
keyHash = sha256(payload)                                 // 入库
keyPrefix = payload.slice(0, 12)                          // 入库，用于查找
```

### 5.2 校验（常量时间比较）

```js
async function verifyApiKey(rawKey) {
  if (!/^ak_live_[A-Za-z0-9]{32,}$/.test(rawKey)) return null;
  const prefix = rawKey.slice(0, 12);
  const candidates = await apiKeyCol.find({ keyPrefix: prefix, status: "active" }).toArray();
  const hash = sha256(rawKey);
  for (const c of candidates) {
    if (crypto.timingSafeEqual(Buffer.from(c.keyHash), Buffer.from(hash))) return c;
  }
  return null;
}
```

要点：
- `keyHash` 用 **SHA-256**（不可逆）；比较用 `crypto.timingSafeEqual` 防时序侧信道。
- 明文 Key 只返回一次；之后任何日志/响应都只展示 `keyId` + 尾 4 位掩码 `ak_...****`。

---

## 6. 自动登录流程（中间件）

在 `webServer.js` 增加 `resolveApiKeyAuth(req)`，并在 `checkRequestToken` 之前调用：

```js
async function resolveApiKeyAuth(req) {
  if (req.session.data && req.session.data.logined) return; // 已有 Cookie 会话，优先

  const raw = (req.headers.authorization || "")
      .replace(/^Bearer\s+/i, "").trim()
    || req.headers["x-api-key"];

  if (!raw) return;

  const key = await verifyApiKey(raw);
  if (!key) return;                    // 无效：交给后续接口自己判「未登录」

  if (key.expiresAt && Date.now() > key.expiresAt) return;
  if (key.allowedIps?.length && !key.allowedIps.includes(clientIp(req))) return;
  if (!rateLimitOk(key)) return;       // 超限：429

  // 读账号最新资料构造会话快照（带短 TTL 缓存，避免每请求查库）
  const account = await loadAccountByFolderName(key.folderName); // projection 取权限字段
  if (!account) return;

  req.session.data = buildSessionSnapshot(account, key);
  req.apiKey = { keyId: key.keyId, name: key.name, scopes: key.scopes };
  touchLastUsed(key.keyId);            // 异步批量写，不阻塞请求
}
```

`buildSessionSnapshot(account, key)` 必须与 `upateTokenData` 输出对齐：

```js
{
  account: account.account,
  folderName: account.folderName,
  tokenLimit: account.tokenLimit,
  tokenUsed: account.tokenUsed,
  subscription: account.subscription || 0,
  vipTimeout: Date.now() > (account.subscription || 0),
  logined: true,
  _apiKey: key.keyId,       // 附加标识（可审计、可追溯）
}
```

**集成点**：把 `resolveApiKeyAuth` 塞进现有 `checkRequestToken`（或作为前置中间件），
让 `transweb-token`（老）与 `Authorization: Bearer ak_...`（新）共用一条恢复路径。

> 注意：CORS 允许头在 `custom/WebService.js:8` 目前只写了 `Content-Type, Authorization`，
> 若前端走 `X-Api-Key`，需补 `X-Api-Key`；建议统一用 `Authorization: Bearer` 省去改动。

---

## 7. Session Data 共享语义

- **共享**：API Key 登录后写入的 `req.session.data` 与密码登录完全同构 → 所有
  `if (!data.folderName)`、`data.account === adminAccount`、`role.indexOf('partner')`
  判断无需改动即生效。
- **差异**：`req.session.data._apiKey` 标记当前会话来源是 API Key，供审计/Scope 校验使用；
  密码登录的会话无此字段。
- **会话 Cookie 与 API Key 优先级**：
  1. 已有有效 Cookie 会话 → 用 Cookie（人类用户）。
  2. 无 Cookie 会话 → 尝试 `transweb-token` → 再尝试 API Key。
  3. 都失败 → 接口按「未登录」处理。

---

## 8. 权限控制模型（Scope）

### 8.1 Scope 词汇表（最小可用集，可扩展）

| Scope | 覆盖接口 |
| --- | --- |
| `account:read` | `getUserData`、`getLoginInfo`、`getAgentData`、`getPartnerData` |
| `account:write` | `updateLoginInfo`、`setAppData` |
| `doc:read` | `getLoginedData`、`getPublishedList`、`getDocumentData`、`getDocumentFile/Image`、`getSubscriptionsData` |
| `doc:write` | `publishPptItem`、`publishDocument`、`setDocumentStatus`、`deleteDocumentData`、`putQuestionData` |
| `ai:chat` | `aiStreamRequest`、`aiGatewayRequest`、`mongoQuery`（受限表） |
| `points:read` | `checkPay`、账户余额查询 |
| `points:transfer` | `transferPoints`、`confirmSubscriptionOrder`、`cutPoints`（限管理员） |
| `admin:*` | `setPartnerRole`、`switchRoleItem` 等（**默认 API Key 一律禁止**） |

### 8.2 接口标注

在接口配置里加一个可选字段 `requiredScope`（与 `method`/`dbItem`/`callback` 平级）：

```js
getLoginedData: {
  method: "post",
  dbItem: "visualTool",
  requiredScope: "doc:read",
  callback: async function (req, res, dbInfo, db) { ... }
}
```

### 8.3 执行点（不改接口内部）

在 `custom/RestFulConfig.js` 的 `addCardData` 回调入口做统一校验：

```js
callback: function (req, res, task) {
  // ...现有 check 逻辑...
  const required = d.requiredScope;
  if (required && !authorize(req, required)) {
    return WebTool.requestTool.sendData({ ret: 3, message: "无权限（缺少 scope）" }, req, res);
  }
  // ...原有 dbQuery 分发...
}
```

`authorize(req, scope)` 规则：

```js
function authorize(req, scope) {
  const s = req.session.data || {};
  // 人类 Cookie 会话（非 API Key）默认拥有全部非 admin:* scope
  if (s.logined && !s._apiKey) return !scope.startsWith("admin:");
  // API Key 会话：必须有对应 scope；admin:* 永远拒绝
  const key = req.apiKey;
  return !scope.startsWith("admin:") && key && key.scopes.includes(scope);
}
```

> 关键点：把「人类登录 = 全量、API Key = 按 Scope」的差异集中在这一个 `authorize`，
> 而不是散落到几十个接口里。

---

## 9. 新增管理接口（`interface/admin.js` 或 `test.js`）

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/user/createApiKey` | post | 入参 `{name, scopes[], expiresAt?, allowedIps?, quota?}`；返回**明文 Key 仅此一次** |
| `/user/listApiKeys` | get | 返回本账号 Key（掩码） |
| `/user/revokeApiKey` | post | 撤销（`status=revoked`） |
| `/user/rotateApiKey` | post | 撤销旧 Key + 生成新 Key |

安全约束：
- 创建/撤销只允许作用于 `session.data.folderName` 自己的 `apiKey`（防越权）。
- `scopes` 必须是词汇表白名单，且**不允许 `admin:*`**。
- 返回前用掩码 `ak_…****` 展示，明文不落日志。

---

## 10. 安全加固清单

- [ ] 明文 Key 只返回一次；DB 只存 SHA-256；日志只打印 `keyId`。
- [ ] `timingSafeEqual` 常量时间比较。
- [ ] `admin:*` scope 对 API Key 一律拒绝。
- [ ] 每 Key 独立速率限制（复用 `express-rate-limit`，`keyGenerator` 用 `keyId`）。
- [ ] IP 白名单（可选）。
- [ ] 强制 HTTPS（`secure: production` 已具备；API Key 端点额外校验 `req.secure`）。
- [ ] 撤销即时生效（鉴权每次查库 / 短 TTL 缓存，缓存需支持主动失效）。
- [ ] 审计：记录 `keyId + action + ip + ts`（失败也记，用于检测爆破）。
- [ ] 账号被删/冻结时级联吊销其所有 Key。

---

## 11. 兼容性与迁移

- **老登录令牌 `transweb-token` / `logined.js` 完全保留**，API Key 为增量能力。
- `logined.js` 是文件型存储，存在并发写与体积膨胀风险（`ConfigObject.save()` 全量重写）。
  建议后续把登录令牌与 API Key 统一迁到 MongoDB / Redis；本期 API Key 直接进 Mongo，不新增文件依赖。
- `folderName` 在代码里时而 `String()` 时而 `Number()`（见 `mongoQuery`/`getAgentData`），
  API Key 构造 session 时沿用 `account.folderName` 原值，避免引入新的类型不一致。

---

## 12. 实施路线（Phase）

| 阶段 | 内容 | 交付 |
| --- | --- | --- |
| P0 | 数据模型 + 生成/校验工具 + `apiKey` 集合与索引 | `custom/ApiKeyTool.js` |
| P1 | `resolveApiKeyAuth` 中间件 + 接入 `checkRequestToken` | 自动登录打通 |
| P2 | Scope 词汇表 + `requiredScope` 标注 + `authorize` 执行点 | 分级权限生效 |
| P3 | 管理接口（创建/列表/撤销/轮换）+ 审计 + 速率限制 | 可运营 |
| P4 | IP 白名单、独立配额、账号级联吊销、Redis 缓存、Key 轮换策略 | 生产加固 |

---

## 13. 风险与待决问题

1. **是否也要限制人类 Cookie 会话的 Scope**（当前设计：人类=全量、API Key=按 Scope）。
   若想统一，可把 `role`/`requiredScope` 一起纳入，需回归全部前端调用。
2. **`folderName` 类型不一致** 是历史债，API Key 方案会复用 `account.folderName`，建议单独清理。
3. **`logined.js` 文件型令牌** 并发写入风险，建议与 P4 的 Redis 迁移一起解决。
4. **Scope 颗粒度**：是否需要到「字段级/资源级」（如某 Key 只能访问某个 `documentId`）。
   本期先做到「接口级」，预留 `permissions` 字段后续扩展。
5. **Key 在 URL/日志泄漏**：现有代码大量 `console.log(query)`，需统一日志脱敏。

---

## 附：关键改动文件清单

- `webServer.js`：新增 `resolveApiKeyAuth`、接入 `checkRequestToken`、CORS 头补充。
- `custom/ApiKeyTool.js`（新增）：生成/哈希/校验/Scope 工具。
- `custom/RestFulConfig.js`：`addCardData` 入口注入 `authorize` 校验。
- `interface/admin.js` / `interface/test.js`：新增 Key 管理接口。
- `interface/index.js`：如 `admin` 路由前缀/文件有变化则同步 `apiFiles`。
- `.env.example`：新增 `API_KEY_SALT`（可选，用于哈希加盐）。
