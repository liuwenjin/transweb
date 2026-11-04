let env = require("../../custom/env.js");
let data = {
  servicePrice: {
    publishDocument: 2000,
    publishApp: 500,
    publishLayout: 500,
    generateSubtitle: 100
  },
  transferAward: 0.1,
  initPoints: 1000,
  basicCost: 20,
  minCost: 10,
  costRate: 0.1,
  discount: 1,
  exchangeRate: 1,
  miningRatio: 1,
  marginRate: 0.1,
  defaultPublishRate: 0.9,
  defaultTransferRate: 0.01,
  defaultDeveloperRate: 0.1,
  marginMap: {
    "475953914e5b6c9111435976544b8f15": 0,
    "83f54aa47a99510912a69cabc1d8ca13": 0
  },
  gatewayCost: 100,
  pointsSwitch: true,
  adminSwitch: true,
  powerAdmin: env.get("POWER_ADMIN"),
  adminAccount: env.get("ADMIN_ACCOUNT"),
  // 文档读取访问权限（getDocumentData 接口使用）
  // level 取值：
  //   "public" — 免登陆获取：任何访问者均可读取（敏感字段对非发布者自动隐藏）
  //   "login"  — 所有人登录获取：仅登录用户可读取
  //   "owner"  — 发布者登录获取：仅文档发布者本人可读取
  // tables 可按集合名覆盖默认级别，例如：{ document: "owner", pptItem: "login" }
  documentAccess: {
    level: "public",
    tables: {}
  },
  apiConfig: {
    
  },
  commissionRate: {
    contentPublisher: 0.7,
    contentTransfer: 0.1,
    toolDeveloper: 0.2
  },
  taxRateMap: {
    modelRouter: 0.1,
    "白山云": 0.1
  },
  tokenRateMap: {
    
  }
}

module.exports = data;