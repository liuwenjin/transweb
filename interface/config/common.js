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
  marginMap: {
    "475953914e5b6c9111435976544b8f15": 0,
    "83f54aa47a99510912a69cabc1d8ca13": 0
  },
  gatewayCost: 100,
  pointsSwitch: false,
  adminSwitch: true,
  powerAdmin: env.get("POWER_ADMIN"),
  adminAccount: env.get("ADMIN_ACCOUNT"),
  apiConfig: {
    "智能体@文心一言": {
      url: "https://agentapi.baidu.com/assistant/getAnswer?appId={{appId}}&secretKey={{secretKey}}",
    },
    "火山引擎-图片生成": {
      url: "https://ark.cn-beijing.volces.com/api/v3/images/generations",
      authorization: "Bearer " + env.opt("API_KEY_HUOSHAN_IMAGE"),
    },
    "抖音豆包": {
      url: "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
      authorization: "Bearer " + env.opt("API_KEY_DOUBAO"),
    },
    "腾讯混元": {
      url: "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
      authorization: "Bearer " + env.opt("API_KEY_TENCENT_HUNYUAN")
    },
    "pixmiller抠图": {
      url: "https://api.pixmiller.com/v1/remove-background",
      authorization: "Bearer " + env.opt("API_KEY_PIXMILLER")
    },
    "novitaAi": {
      url: "https://api.novita.ai/v1/generate",
      authorization: "Bearer " + env.opt("API_KEY_NOVITA")
    },
    "novitaSeedream": {
      url: "https://api.novita.ai/v3/seedream-5.0-lite",
      authorization: "Bearer " + env.opt("API_KEY_NOVITA")
    },
    "阿里-图片生成": {
      url: "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
      authorization: "Bearer " + env.opt("API_KEY_ALIYUN_IMAGE")
    },
    "imageEdits302ai": {
      url: "https://api.302.ai/v1/images/edits",
      authorization: "Bearer " + env.opt("API_KEY_302AI_IMAGE")
    },
    "七牛云-Anthropic": {
      url: "https://api.qnaigc.com",
      authorization: "Bearer " + env.opt("API_KEY_QINIU_ANTHROPIC")
    },
    "七牛云-OpenAI": {
      url: "https://api.qnaigc.com/v1/chat/completions",
      authorization: "Bearer " + env.opt("API_KEY_QINIU_OPENAI")
    },
    "白山云": {
      url: "https://api.edgefn.net/v1/chat/completions",
      authorization: "Bearer " + env.opt("API_KEY_BAISHAN")
    },
    "阿里云百炼": {
      url: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      authorization: "Bearer " + env.opt("API_KEY_ALIYUN_BAILIAN")
    },
    "通义千问": {
      url: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
      authorization: "Bearer " + env.opt("API_KEY_TONGYI")
    },
    "智谱-文本生成": {
      url: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
      authorization: "Bearer " + env.opt("API_KEY_ZHIPU_TEXT")
    },
    "智谱-图片分析": {
      url: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
      authorization: "Bearer " + env.opt("API_KEY_ZHIPU_IMAGE_ANALYSIS")
    },
    "图片分析": {
      url: "https://api.302.ai/v1/chat/completions",
      authorization: "Bearer " + env.opt("API_KEY_302AI_IMAGE_ANALYSIS")
    },
    "腾讯-代码生成": {
      url: "https://copilot.tencent.com/openapi/v1/completions",
      authorization: "Bearer " + env.opt("API_KEY_TENCENT_CODE")
    },
    "智谱-图片生成": {
      url: "https://open.bigmodel.cn/api/paas/v4/images/generation",
      authorization: "Bearer " + env.opt("API_KEY_ZHIPU_IMAGE")
    },
    "月之暗面": {
      url: "https://api.moonshot.cn/v1/chat/completions",
      authorization: "Bearer " + env.opt("API_KEY_MOONSHOT")
    },
    "gptsapi": {
      url: "https://api.gptsapi.com/v1/chat/completions",
      authorization: "Bearer " + env.opt("API_KEY_GPTSAPI")
    },
    "openrouter": {
      url: "https://openrouter.ai/api/v1/chat/completions",
      authorization: "Bearer " + env.opt("API_KEY_OPENROUTER")
    },
    "vectrustRouter": {
      url: "https://api.openai-next.com/v1/chat/completions",
      authorization: "Bearer " + env.opt("API_KEY_VECTRUST"),
    },
    "modelRouter": {
      url: "https://api.302ai.cn/v1/chat/completions",
      authorization: "Bearer " + env.opt("API_KEY_MODELROUTER")
    },
    "dmxapi": {
      url: "https://www.dmxapi.com/v1/chat/completions",
      authorization: "Bearer " + env.opt("API_KEY_DMXAPI")
    },
    "深度求索": {
      url: "https://api.deepseek.com/chat/completions",
      authorization: "Bearer " + env.opt("API_KEY_DEEPSEEK"),
    }
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
    "claude-fable-5": {
      "input": 0.05,
      "output": 0.25,
      "context": 200000,
      "apiName": "dmxapi",
      "from": "国外"
    },
    "gemini-3.5-flash": {
      "input": 0.0075,
      "output": 0.045,
      "context": 128000,
      "apiName": "dmxapi",
      "from": "国外"
    },
    "grok-4.6": {
      "input": 0.01,
      "output": 0.03,
      "context": 200000,
      "apiName": "dmxapi",
      "from": "国外"
    },
    "qwen3.7-flash": {
      "input": 0.0012,
      "output": 0.008,
      "context": 128000,
      "apiName": "通义千问",
      "from": "国内"
    },
    "qwen3.7-plus": {
      "input": 0.0048,
      "output": 0.0192,
      "context": 128000,
      "apiName": "通义千问",
      "from": "国内"
    },
    "kimi-k3": {
      "input": 0.02,
      "output": 0.1,
      "context": 128000,
      "apiName": "月之暗面",
      "from": "国内"
    },
    "deepseek-v4-pro": {
      "input": 0.009,
      "output": 0.027,
      "context": 128000,
      "apiName": "深度求索",
      "from": "国内"
    },
    "deepseek-v4-flash": {
      "input": 0.003,
      "output": 0.009,
      "context": 128000,
      "apiName": "深度求索",
      "from": "国内"
    }
  },
  modelList: [{
    apiName: "深度求索",
    model: "",
  }]
}

module.exports = data;