localStorage.clear();
let isLogined = false;
let agentScriptUrl = "/webApps/document/agentList/TransWeb.agentScript.js";
let nextStepUrl = "/initialize.html?aScript=assets/animationScripts/initTools.js";

transweb_events({
  timeEvents: [
    {
      offset: 3,
      callback: function (elem) {
        if (webCpu.cards.loginRegCard && webCpu.cards.loginRegCard.task) {
          webCpu.cards.loginRegCard.task.confirmCallback({
            account: "transweb",
            checkNumber: "transweb$harness",
          });
        }
        else {
          isLogined = true;
        }
      },
    },
    {
      offset: 4,
      callback: function (elem) {
        if (!isLogined) {
          location.reload();
        }
      },
    },
    {
      offset: 5,
      callback: function (elem) {
        webCpu.cards.personalInfoCard.task.loadAgentScript();
      },
    },
    {
      offset: 6,
      callback: function (elem) {
        webCpu.cards.loadScriptCard.task.vueItem.type = "webScript";
        webCpu.cards.loadScriptCard.task.vueItem.valueMap['webScript'] = agentScriptUrl;
      },
    },
    {
      offset: 7,
      event: {
        object: [".loadScriptBtn", 1],
        type: "click"
      }
    },
    {
      offset: 10,
      callback: function (elem) {
        webCpu.cards.loadScriptCard.task.vueItem._confirmLoadScript(()=>{
          webCpu.CardItem.dismissMask(webCpu.cards.personalInfoCard);
          let folderName = webCpu.cards.aboutInfoCard.task.vueItem.info.folderName;
          aigcInterface.adapter.setAppConfig({
            docName: "publishInfo.folderName",
            documentId: folderName + ""
          }, tData => {
            console.log("publish folderName: ", folderName);
            location.href = nextStepUrl;
          });
        });
      },
    },
  ],
});
