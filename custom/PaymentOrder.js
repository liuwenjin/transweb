// custom/PaymentOrder.js —— 支付订单持久化 + 幂等记账
// 用于替换原先每次启动新建 .js 文件、重启即丢失订单的 payLog 机制。
// 所有订单状态写入 MongoDB，回调与轮询共享同一份状态，保证跨重启可对账、记账幂等。

const ConnectDB = require("./ConnectDB.js");

// 充值套餐价目表（服务端权威；前端只能传 product_id，price/tokens 由这里决定）
// price 单位为「分」（微信支付 total_fee 约定）
const PRODUCTS = {
  "tokens_500000": { price: 499, tokens: 500000 },
  "tokens_3000000": { price: 2850, tokens: 3000000 },
  "tokens_9000000": { price: 8100, tokens: 9000000 },
  "tokens_99": { price: 24000, tokens: 300000000 },
};

// 套餐目录：供前端下单前拉取，确保前端使用的 product_id 与后端价目表完全一致。
// 只暴露展示与校验所需的字段，价格与积分始终以本文件的 PRODUCTS 为准。
function getProducts() {
  return Object.keys(PRODUCTS)
    .map(function (id) {
      return { id: id, price: PRODUCTS[id].price, tokens: PRODUCTS[id].tokens };
    })
    .sort(function (a, b) {
      return a.price - b.price;
    });
}

let _dbCfg = null;
function getDbConfig() {
  if (_dbCfg) return _dbCfg;
  _dbCfg = require("../interface/index.js").dbConfig.visualTool;
  return _dbCfg;
}

async function getCollection() {
  const dbCfg = getDbConfig();
  const client = await ConnectDB.getClient(dbCfg);
  return client.db(dbCfg.database).collection("paymentOrder");
}

async function ensureIndexes(col) {
  try {
    await col.createIndex({ out_trade_no: 1 }, { unique: true });
    await col.createIndex({ status: 1, createdAt: 1 });
  } catch (e) {
    console.warn("paymentOrder 索引创建失败:", e && e.message);
  }
}

// 创建订单（status=pending）
async function createOrder(order) {
  const col = await getCollection();
  await ensureIndexes(col);
  await col.insertOne({
    out_trade_no: order.out_trade_no,
    folderName: order.folderName != null ? String(order.folderName) : "",
    productId: order.productId || "",
    appId: order.appId || "",
    price: Number(order.price) || 0, // 分
    tokens: Number(order.tokens) || 0,
    status: "pending",
    tradeFlag: false,
    tradeState: "",
    timeout: false,
    createdAt: Date.now(),
  });
}

async function getOrder(out_trade_no) {
  const col = await getCollection();
  return col.findOne({ out_trade_no });
}

// 原子认领：只有把 tradeFlag 从 false 翻成 true 的那次返回该订单，其余并发请求返回 null。
// 使用 updateOne + 检查 modifiedCount，兼容 mongodb 3.x 驱动（避免 returnDocument 版本差异）。
// 认领即意味着支付已确认，因此同步写入 tradeState=SUCCESS 供前端 /checkPay 展示。
async function claimForCredit(out_trade_no) {
  const col = await getCollection();
  const res = await col.updateOne(
    { out_trade_no, tradeFlag: { $ne: true } },
    { $set: { tradeFlag: true, status: "crediting", tradeState: "SUCCESS" } }
  );
  if (!res || res.modifiedCount !== 1) return null;
  return col.findOne({ out_trade_no });
}

async function markCredited(out_trade_no) {
  const col = await getCollection();
  return col.updateOne(
    { out_trade_no },
    { $set: { status: "credited", tradeFlag: true, creditedAt: Date.now() } }
  );
}

// 入账失败：回退为 paid，供对账重试
async function markCreditFailed(out_trade_no) {
  const col = await getCollection();
  return col.updateOne(
    { out_trade_no },
    { $set: { tradeFlag: false, status: "paid" } }
  );
}

async function markTimeout(out_trade_no) {
  const col = await getCollection();
  return col.updateOne(
    { out_trade_no },
    { $set: { status: "timeout", timeout: true } }
  );
}

async function markCancelled(out_trade_no) {
  const col = await getCollection();
  return col.updateOne(
    { out_trade_no },
    { $set: { status: "cancelled" } }
  );
}

async function updateTradeState(out_trade_no, tradeState) {
  const col = await getCollection();
  return col.updateOne(
    { out_trade_no },
    { $set: { tradeState: tradeState || "" } }
  );
}

// 尚未入账、可能仍需处理的订单（用于启动对账）
async function getUncreditedOrders() {
  const col = await getCollection();
  return col
    .find({ tradeFlag: { $ne: true }, status: { $in: ["pending", "paid"] } })
    .toArray();
}

module.exports = {
  PRODUCTS,
  getProducts,
  createOrder,
  getOrder,
  claimForCredit,
  markCredited,
  markCreditFailed,
  markTimeout,
  markCancelled,
  updateTradeState,
  getUncreditedOrders,
};
