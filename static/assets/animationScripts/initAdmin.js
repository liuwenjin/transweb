localStorage.clear();
let isLogined = false;
let agentScriptUrl = "/webApps/document/agentList/TransWeb.agentScript.js";
let nextStepUrl = "/clone.html?aScript=assets/animationScripts/initTools.js";

// 控制面板保存的管理员账号/万能验证码；本机同步读取，失败时回退默认值。
let adminLogin = { account: "transweb", checkNumber: "transweb$harness" };
try {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "/controlPanel/bootstrap", false);
  xhr.send();
  if (xhr.status === 200) {
    const ret = JSON.parse(xhr.responseText || "{}");
    if (ret && ret.ret === 0 && ret.data) {
      adminLogin = {
        account: ret.data.account || adminLogin.account,
        checkNumber: ret.data.powerAdmin || adminLogin.checkNumber
      };
    }
  }
} catch (e) {
  // 控制面板不可用时继续使用默认值
}

transweb_events({
  timeEvents: [
    {
      offset: 3,
      callback: function (elem) {
        if (webCpu.cards.loginRegCard && webCpu.cards.loginRegCard.task) {
          webCpu.cards.loginRegCard.task.confirmCallback({
            account: adminLogin.account,
            checkNumber: adminLogin.checkNumber,
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
          let folderName = localStorage.folderName;
          if(webCpu.cards.aboutInfoCard && webCpu.cards.aboutInfoCard.task && webCpu.cards.aboutInfoCard.task.vueItem && webCpu.cards.aboutInfoCard.task.vueItem.info){
            folderName = webCpu.cards.aboutInfoCard.task.vueItem.info.folderName;
          }
          
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
