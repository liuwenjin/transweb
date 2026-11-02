// 模型费率（tokenRateMap）合并读取：
//   common.js 提供默认条目；
//   appConfig.js 中由 `transweb model` 维护的条目作为覆盖层，值为 null 表示删除默认条目。
const path = require("path");
const ConfigObject = require("./ConfigObject.js");

const commonPath = path.resolve(__dirname, "../interface/config/common.js");
const appConfigPath = path.resolve(__dirname, "../interface/config/appConfig.js");

function readAppTokenRateMap() {
  try {
    delete require.cache[require.resolve(appConfigPath)];
    const appConfig = require(appConfigPath) || {};
    return appConfig.tokenRateMap || {};
  } catch (e) {
    return {};
  }
}

function getTokenRateMap() {
  let commonMap = {};
  try {
    const commonData = new ConfigObject(commonPath).data || {};
    commonMap = commonData.tokenRateMap || {};
  } catch (e) {
    commonMap = {};
  }

  const merged = Object.assign({}, commonMap);
  const appMap = readAppTokenRateMap();
  for (const model in appMap) {
    if (appMap[model] === null) {
      delete merged[model];
      continue;
    }
    merged[model] = Object.assign({}, merged[model] || {}, appMap[model]);
  }
  return merged;
}

module.exports = { getTokenRateMap, readAppTokenRateMap };
