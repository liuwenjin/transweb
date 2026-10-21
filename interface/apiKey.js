let WebTool = require("../custom/WebTool.js");
let ApiKeyTool = require("../custom/ApiKeyTool.js");

let data = {
  createApiKey: {
    method: "post",
    dbItem: "visualTool",
    callback: async function (req, res, dbInfo, db) {
      const sData = req.session.data || {};
      // 仅人类 Cookie 会话可创建，防止 API Key 自我提权
      if (!sData.logined || sData._apiKey) {
        return WebTool.requestTool.sendData(
          { ret: 1, message: "仅支持账号登录后创建 API Key。" },
          req,
          res
        );
      }

      const { name, scopes, expiresAt, allowedIps, rpm } = req.body || {};
      if (typeof name !== "string" || !name.trim()) {
        return WebTool.requestTool.sendData(
          { ret: 1, message: "缺少 name 参数。" },
          req,
          res
        );
      }
      const cleanName = name.trim();
      if (cleanName.length > 64) {
        return WebTool.requestTool.sendData(
          { ret: 1, message: "name 长度不能超过 64 个字符。" },
          req,
          res
        );
      }
      // 参数校验：expiresAt 必须是未来的时间戳
      if (expiresAt !== undefined && expiresAt !== null && expiresAt !== "") {
        const exp = Number(expiresAt);
        if (!Number.isFinite(exp) || exp <= Date.now()) {
          return WebTool.requestTool.sendData(
            { ret: 1, message: "expiresAt 必须是未来的时间戳。" },
            req,
            res
          );
        }
      }
      // 参数校验：rpm 必须是正整数
      if (rpm !== undefined && rpm !== null && rpm !== "" && !(Number(rpm) > 0)) {
        return WebTool.requestTool.sendData(
          { ret: 1, message: "rpm 必须是正整数。" },
          req,
          res
        );
      }

      const normalized = ApiKeyTool.normalizeScopes(scopes);
      const gen = ApiKeyTool.generateApiKey();
      const doc = {
        keyId: gen.keyId,
        keyPrefix: gen.keyPrefix,
        keyHash: gen.keyHash,
        account: sData.account,
        folderName: sData.folderName,
        name: cleanName,
        scopes: normalized,
        roles: [],
        allowedIps: Array.isArray(allowedIps) ? allowedIps : [],
        rateLimit: { rpm: Number(rpm) || 60 },
        quota: null,
        status: "active",
        expiresAt: expiresAt ? Number(expiresAt) : null,
        lastUsedAt: null,
        createdAt: Date.now(),
        createdBy: "user",
      };

      try {
        const col = db.db(dbInfo.database).collection("apiKey");
        await ApiKeyTool.ensureIndexes(col);
        await col.insertOne(doc);
        return WebTool.requestTool.sendData(
          {
            ret: 0,
            message: "创建成功，API Key 仅显示一次，请妥善保存。",
            data: {
              keyId: doc.keyId,
              apiKey: gen.payload,
              name: doc.name,
              scopes: doc.scopes,
              expiresAt: doc.expiresAt,
            },
          },
          req,
          res
        );
      } catch (e) {
        return WebTool.requestTool.sendData(
          { ret: 1, message: "创建失败: " + (e && e.message) },
          req,
          res
        );
      }
    },
  },

  listApiKeys: {
    method: "get",
    dbItem: "visualTool",
    callback: async function (req, res, dbInfo, db) {
      const sData = req.session.data || {};
      if (!sData.logined || sData._apiKey) {
        return WebTool.requestTool.sendData(
          { ret: 1, message: "仅支持账号登录后查看。" },
          req,
          res
        );
      }
      try {
        const col = db.db(dbInfo.database).collection("apiKey");
        // folderName 在账号库中可能是数字或字符串，做双类型匹配避免漏查
        const fn = sData.folderName;
        const list = await col
          .find(
            {
              folderName: { $in: [String(fn), Number(fn)] },
              status: "active",
            },
            { projection: { keyHash: 0 } }
          )
          .sort({ createdAt: -1 })
          .toArray();
        const result = list.map((k) => ({
          keyId: k.keyId,
          name: k.name,
          scopes: k.scopes || [],
          status: k.status,
          expiresAt: k.expiresAt,
          lastUsedAt: k.lastUsedAt,
          createdAt: k.createdAt,
          maskedKey: (k.keyPrefix || "") + "…****",
        }));
        return WebTool.requestTool.sendData({ ret: 0, data: result }, req, res);
      } catch (e) {
        return WebTool.requestTool.sendData(
          { ret: 1, message: "查询失败: " + (e && e.message) },
          req,
          res
        );
      }
    },
  },

  revokeApiKey: {
    method: "post",
    dbItem: "visualTool",
    callback: async function (req, res, dbInfo, db) {
      const sData = req.session.data || {};
      if (!sData.logined || sData._apiKey) {
        return WebTool.requestTool.sendData(
          { ret: 1, message: "仅支持账号登录后撤销。" },
          req,
          res
        );
      }
      const keyId = req.body.keyId;
      if (!keyId) {
        return WebTool.requestTool.sendData(
          { ret: 1, message: "缺少 keyId 参数。" },
          req,
          res
        );
      }
      try {
        const col = db.db(dbInfo.database).collection("apiKey");
        // folderName 双类型匹配，避免因数字/字符串不一致导致撤销失效
        const fn = sData.folderName;
        const r = await col.updateOne(
          { keyId, folderName: { $in: [String(fn), Number(fn)] } },
          { $set: { status: "revoked" } }
        );
        return WebTool.requestTool.sendData(
          {
            ret: 0,
            data: r.result,
            message: r.modifiedCount ? "撤销成功。" : "未找到可撤销的 Key。",
          },
          req,
          res
        );
      } catch (e) {
        return WebTool.requestTool.sendData(
          { ret: 1, message: "撤销失败: " + (e && e.message) },
          req,
          res
        );
      }
    },
  },

  rotateApiKey: {
    method: "post",
    dbItem: "visualTool",
    callback: async function (req, res, dbInfo, db) {
      const sData = req.session.data || {};
      if (!sData.logined || sData._apiKey) {
        return WebTool.requestTool.sendData(
          { ret: 1, message: "仅支持账号登录后轮换。" },
          req,
          res
        );
      }
      const keyId = req.body.keyId;
      if (!keyId) {
        return WebTool.requestTool.sendData(
          { ret: 1, message: "缺少 keyId 参数。" },
          req,
          res
        );
      }
      try {
        const col = db.db(dbInfo.database).collection("apiKey");
        const fn = sData.folderName;
        const old = await col.findOne({
          keyId,
          folderName: { $in: [String(fn), Number(fn)] },
        });
        if (!old) {
          return WebTool.requestTool.sendData(
            { ret: 1, message: "未找到该 Key。" },
            req,
            res
          );
        }
        const gen = ApiKeyTool.generateApiKey();
        await col.updateOne(
          { keyId: old.keyId },
          {
            $set: {
              keyHash: gen.keyHash,
              keyPrefix: gen.keyPrefix,
              createdAt: Date.now(),
              lastUsedAt: null,
            },
          }
        );
        return WebTool.requestTool.sendData(
          {
            ret: 0,
            message: "轮换成功，API Key 仅显示一次，请妥善保存。",
            data: { keyId: old.keyId, apiKey: gen.payload },
          },
          req,
          res
        );
      } catch (e) {
        return WebTool.requestTool.sendData(
          { ret: 1, message: "轮换失败: " + (e && e.message) },
          req,
          res
        );
      }
    },
  },
};

module.exports = data;
