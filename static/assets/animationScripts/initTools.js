

let tools = ["adminPoints", "characterProfile", "agentCreator", "agentExample", "knowledgeApp", "aigcHistory", "contentQuality", "improveTemplate", "pageTemplate", "pointsBillApp", "pptDocument", "promptEditor", "requirement", "text2chart", "vueCodeEditor"];
let index = Number(WebTool.urlQuery(location.href, "index")) || 0;
let toolName = tools[index] || "adminPoints";
let jsonPath = `/bucket/publicApps/${tools[index]}/manifest.json`;

let keyMap = {
  requirement: "aigcAppFlow.requirement",
  contentQuality: "aigcAppFlow.contentQuality",
  pageTemplate: "aigcAppFlow.pageTemplate",
  improveTemplate: "aigcAppFlow.improveTemplate"
}

transweb_events({
  timeEvents: [
    {
      offset: 1,
      callback: function (elem) {
        if (webCpu.cards.cloneAppItem && webCpu.cards.cloneAppItem.task) {
          webCpu.cards.cloneAppItem.task.vueItem.manifestUrl = jsonPath;
        }
      },
    },
    {
      offset: 2,
      event: {
        object: [".manifestFetchBtn", 1],
        type: "click"
      }
    },
    {
      offset: 4,
      event: {
        object: [".confirmCloneBtn", 1],
        type: "click"
      },
    },
    {
      offset: 8,
      callback: function (elem) {
        if (webCpu.cards.cloneAppItem && webCpu.cards.cloneAppItem.task) {
          let url = webCpu.cards.cloneAppItem.task.vueItem.currentAppUrl;
          let id = WebTool.urlQuery(url, "id");
          console.log("当前clone 工具：", toolName, id);
          let name = keyMap[toolName] || toolName;
          aigcInterface.adapter.setAppConfig({
            docName: name,
            documentId: id
          }, tData => {
            let script = WebTool.urlQuery(location.href, "aScript");
            if (index + 1 < tools.length) {
              let next = `${location.origin + location.pathname}?aScript=${script}&index=${index+1}`;
              location.href = next;
            }
            else {
              webCpu.cards.cloneAppItem.task.vueItem.$message({
                type: "success",
                message: `${tools.length} 个工具已初始化完成！`
              });
            }
          });
        }
      },
    },
  ],
});