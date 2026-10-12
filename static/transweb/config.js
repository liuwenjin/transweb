webCpu.appConfig = webCpu.appConfig || {
  pointsBillApp: "965bb15761bd695903376e8a41dbc111",
  aigcHistory: "cd9749a782b310cab9a073c8c4a19f3a",
  vueCodeEditor: "d746c3aecbba72c91543199610295aaa",
  promptEditor: "a7581907d4df2d663d29124e22db6f02",
  adminPoints: "4b4039289a2a5f72309635c98d8fb7f0",
  agentExample: "7572ab23b32a33aaf57bdd1efdc0f287",
  pptDocument: "76f7de9504bad022a8978e9fe084df0f",
  text2chart: "ec2bdd5d40cfaab61884c5edb170aeb9",
  knowledgeApp: "a973392a7f997cf42cf5b9a760e7fb3f",
  characterProfile: "12a7e2f81834ac69c7bda11219570c26",
  aigcAppFlow: {
    requirement: "d9337acc3fb525b3d2583ca18440fda0",
    contentQuality: "e8ebeb2cc5c46549c3d30222afc2dd07",
    pageTemplate: "91658778302410101ec9b8fc3c2ad41c",
    improveTemplate: "dc6286ffb169f8b8f156ab5f87e9bf8d",
  },
  publishInfo: {
    folderName: "4140329349",
    appName: "appGenerator",
    user: "创博",
    avatar: "https://transweb.cn/webApps/document/logo.png",
  },
  defaultModel: { apiName: "深度求索", model: "deepseek-v4-flash" },
  defaultImageModel: { apiName: "modelRouter", model: "gemini-3.5-flash-lite" },
}

webCpu.appConfigCallback = function(config) {
  config = config || {};
  this.attachAttribute(config, webCpu.appConfig);
};

