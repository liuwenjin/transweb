// scripts/self-test-apiKey.js —— API Key 方案自测（改动代码验证）
const assert = require("assert");
const ApiKeyTool = require("../custom/ApiKeyTool.js");

let passed = 0;
let failed = 0;
function t(name, fn) {
  try {
    fn();
    passed++;
    console.log("  ✓ " + name);
  } catch (e) {
    failed++;
    console.log("  ✗ " + name + "  ->  " + e.message);
  }
}

console.log("\n[1] generateApiKey / hashKey");
t("payload 前缀为 ak_live_", () => {
  const g = ApiKeyTool.generateApiKey();
  assert.strictEqual(g.payload.slice(0, 8), "ak_live_");
});
t("keyId 前缀为 ak_", () => {
  const g = ApiKeyTool.generateApiKey();
  assert.strictEqual(g.keyId.slice(0, 3), "ak_");
});
t("keyHash 为 64 位 hex 且不等于明文", () => {
  const g = ApiKeyTool.generateApiKey();
  assert.match(g.keyHash, /^[0-9a-f]{64}$/);
  assert.notStrictEqual(g.keyHash, g.payload);
});
t("keyPrefix 长度 16", () => {
  const g = ApiKeyTool.generateApiKey();
  assert.strictEqual(g.keyPrefix.length, 16);
  assert.strictEqual(g.keyPrefix, g.payload.slice(0, 16));
});
t("hashKey 确定性（同输入同输出）", () => {
  const a = ApiKeyTool.hashKey("ak_live_x");
  const b = ApiKeyTool.hashKey("ak_live_x");
  assert.strictEqual(a, b);
});
t("两次生成的 key 不同", () => {
  const a = ApiKeyTool.generateApiKey();
  const b = ApiKeyTool.generateApiKey();
  assert.notStrictEqual(a.payload, b.payload);
  assert.notStrictEqual(a.keyId, b.keyId);
});

console.log("\n[2] safeEqual（常量时间比较）");
t("相等返回 true", () => {
  const h = ApiKeyTool.hashKey("abc");
  assert.strictEqual(ApiKeyTool.safeEqual(h, h), true);
});
t("不等返回 false", () => {
  assert.strictEqual(ApiKeyTool.safeEqual(ApiKeyTool.hashKey("a"), ApiKeyTool.hashKey("b")), false);
});
t("长度不同返回 false", () => {
  assert.strictEqual(ApiKeyTool.safeEqual("abc", "abcd"), false);
});

console.log("\n[3] normalizeScopes");
t("去重", () => {
  assert.deepStrictEqual(ApiKeyTool.normalizeScopes(["doc:read", "doc:read"]), ["doc:read"]);
});
t("过滤非白名单", () => {
  assert.deepStrictEqual(ApiKeyTool.normalizeScopes(["doc:read", "evil:x"]), ["doc:read"]);
});
t("admin:* 一律拒绝", () => {
  assert.deepStrictEqual(ApiKeyTool.normalizeScopes(["admin:*", "doc:read"]), ["doc:read"]);
});
t("非数组返回空数组", () => {
  assert.deepStrictEqual(ApiKeyTool.normalizeScopes("doc:read"), []);
});

console.log("\n[4] buildSessionSnapshot");
t("会话快照字段与 logined 标记", () => {
  const account = { account: "u1", folderName: "4140329349", tokenLimit: 100, tokenUsed: 30, subscription: 0 };
  const snap = ApiKeyTool.buildSessionSnapshot(account, { keyId: "ak_abc" });
  assert.strictEqual(snap.logined, true);
  assert.strictEqual(snap.account, "u1");
  assert.strictEqual(snap.folderName, "4140329349");
  assert.strictEqual(snap.tokenLimit, 100);
  assert.strictEqual(snap.tokenUsed, 30);
  assert.strictEqual(snap._apiKey, "ak_abc");
  assert.strictEqual(snap.vipTimeout, true); // subscription=0 => 过期
});
t("有订阅时 vipTimeout=false", () => {
  const future = Date.now() + 86400000;
  const snap = ApiKeyTool.buildSessionSnapshot({ account: "u", folderName: 1, subscription: future }, { keyId: "ak" });
  assert.strictEqual(snap.vipTimeout, false);
});

console.log("\n[5] authorize（权限判定）");
function mkReq(sessionData, apiKey) {
  return { session: { data: sessionData }, apiKey };
}
t("未登录 -> false", () => {
  assert.strictEqual(ApiKeyTool.authorize(mkReq({}), "doc:read"), false);
});
t("无 requiredScope -> true（人类/APIKey 均放行）", () => {
  assert.strictEqual(ApiKeyTool.authorize(mkReq({ logined: true }), undefined), true);
  assert.strictEqual(ApiKeyTool.authorize(mkReq({ logined: true, _apiKey: "ak" }, { scopes: [] }), undefined), true);
});
t("人类会话非 admin scope -> true", () => {
  assert.strictEqual(ApiKeyTool.authorize(mkReq({ logined: true }), "doc:read"), true);
});
t("人类会话 admin:* -> false", () => {
  assert.strictEqual(ApiKeyTool.authorize(mkReq({ logined: true }), "admin:anything"), false);
});
t("APIKey 含 scope -> true", () => {
  assert.strictEqual(
    ApiKeyTool.authorize(mkReq({ logined: true, _apiKey: "ak" }, { scopes: ["doc:read"] }), "doc:read"),
    true
  );
});
t("APIKey 不含 scope -> false", () => {
  assert.strictEqual(
    ApiKeyTool.authorize(mkReq({ logined: true, _apiKey: "ak" }, { scopes: ["doc:read"] }), "ai:chat"),
    false
  );
});
t("APIKey admin:* -> false", () => {
  assert.strictEqual(
    ApiKeyTool.authorize(mkReq({ logined: true, _apiKey: "ak" }, { scopes: ["doc:read"] }), "admin:anything"),
    false
  );
});
t("APIKey 缺 req.apiKey -> false", () => {
  assert.strictEqual(
    ApiKeyTool.authorize(mkReq({ logined: true, _apiKey: "ak" }, undefined), "doc:read"),
    false
  );
});

console.log("\n[6] verifyApiKey（mock 集合）");
function mockCol(candidates) {
  return {
    createIndex: async () => "idx",
    find: async (q) => ({
      toArray: async () =>
        candidates.filter((c) => c.keyPrefix === q.keyPrefix && c.status === q.status),
    }),
  };
}
t("命中返回文档", async () => {
  const g = ApiKeyTool.generateApiKey();
  const col = mockCol([{ keyPrefix: g.keyPrefix, keyHash: g.keyHash, status: "active", keyId: g.keyId }]);
  const r = await ApiKeyTool.verifyApiKey(g.payload, col);
  assert.strictEqual(r.keyId, g.keyId);
});
t("错误 key 返回 null", async () => {
  const g = ApiKeyTool.generateApiKey();
  const col = mockCol([{ keyPrefix: g.keyPrefix, keyHash: g.keyHash, status: "active", keyId: g.keyId }]);
  const r = await ApiKeyTool.verifyApiKey("ak_live_" + "f".repeat(48), col);
  assert.strictEqual(r, null);
});
t("非 ak_live_ 形态返回 null（不查库）", async () => {
  let called = false;
  const col = { createIndex: async () => {}, find: async () => { called = true; return { toArray: async () => [] }; } };
  const r = await ApiKeyTool.verifyApiKey("Bearer token", col);
  assert.strictEqual(r, null);
  assert.strictEqual(called, false);
});
t("过短返回 null", async () => {
  const r = await ApiKeyTool.verifyApiKey("ak_live_short", { createIndex: async () => {}, find: async () => ({ toArray: async () => [] }) });
  assert.strictEqual(r, null);
});

console.log("\n[7] ipAllowed / rateLimitOk");
t("IP 白名单为空 -> 放行", () => {
  assert.strictEqual(ApiKeyTool.ipAllowed({ allowedIps: [] }, "1.2.3.4"), true);
});
t("IP 匹配 -> 放行，不匹配 -> 拒绝", () => {
  const key = { allowedIps: ["1.2.3.4"] };
  assert.strictEqual(ApiKeyTool.ipAllowed(key, "1.2.3.4"), true);
  assert.strictEqual(ApiKeyTool.ipAllowed(key, "9.9.9.9"), false);
});
t("限流：rpm 内放行，超出拒绝", () => {
  const key = { keyId: "ak_rl", rateLimit: { rpm: 3 } };
  const now = 1000 * 60 * 5; // 固定窗口
  assert.strictEqual(ApiKeyTool.rateLimitOk(key, now), true);
  assert.strictEqual(ApiKeyTool.rateLimitOk(key, now + 1), true);
  assert.strictEqual(ApiKeyTool.rateLimitOk(key, now + 2), true);
  assert.strictEqual(ApiKeyTool.rateLimitOk(key, now + 3), false);
});

console.log("\n[8] 模块加载与接口结构");
t("ConnectDB.getClient 已导出", () => {
  const c = require("../custom/ConnectDB.js");
  assert.strictEqual(typeof c.getClient, "function");
});
t("interface/apiKey.js 可加载且含 4 个管理接口", () => {
  const m = require("../interface/apiKey.js");
  ["createApiKey", "listApiKeys", "revokeApiKey", "rotateApiKey"].forEach((k) => {
    assert.ok(m[k], "缺 " + k);
    assert.strictEqual(m[k].method, k === "listApiKeys" ? "get" : "post");
    assert.strictEqual(m[k].dbItem, "visualTool");
    assert.strictEqual(typeof m[k].callback, "function");
  });
});
t("RestFulConfig 可加载", () => {
  const r = require("../custom/RestFulConfig.js");
  assert.strictEqual(typeof r, "function");
});

console.log("\n[9] requiredScope 标注合法性");
t("标注的 scope 都在白名单内", () => {
  const fs = require("fs");
  const files = ["../interface/test.js", "../interface/gpt.js"];
  const allowed = new Set(ApiKeyTool.SCOPES);
  for (const f of files) {
    const src = fs.readFileSync(require("path").resolve(__dirname, f), "utf8");
    const re = /requiredScope:\s*"([^"]+)"/g;
    let m;
    while ((m = re.exec(src)) !== null) {
      assert.ok(allowed.has(m[1]), `${f} 中非法 scope: ${m[1]}`);
    }
  }
});

console.log("\n================ 结果 ================");
console.log(`通过: ${passed}，失败: ${failed}`);
process.exit(failed ? 1 : 0);
