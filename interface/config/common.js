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