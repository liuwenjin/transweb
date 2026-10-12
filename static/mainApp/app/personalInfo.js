transweb_personalInfo({
  style: {
    padding: "20px 30px",
    backgroundColor: "#f2f2f2"
  },
  cardName: "personalInfoCard",
  task: {
    data: {
      id: "",
      name: '',
      introduce: ''
    },
    countLimit: 10,
    url: "user/getUserData",
    requestType: "get",
    handlePassClick: function () {
      var _parent = this;
      this.modifyPass.dsl.methods.handleClickButton = function (d) {
        var _self = this;
        _parent.updateInfo({
          password: MurmurHash.rule(d.password, 32)
        }, function (d) {
          console.log(d);
          _self.$message({
            type: "success",
            message: webCpu.messages[lang].modifyPassTips
          })
          webCpu.CardItem.dismissMask(_parent.card);
        })
      };
      webCpu.CardItem.renderCardDialog(this.card, this.modifyPass, {
        title: webCpu.messages[lang].modifyPass,
        closeType: "back",
        dialogName: "editInfoDialog",
        titleStyle: {
          background: "var(--el-color-primary-light-9)",
          color: "var(--el-color-primary)",
        },
      }, {
        width: "300px",
        height: "160px",
        border: "solid 1px #ddd"
      });
    },
    selectAgentTemplate(callback, title) {
      let tCard = document.body;

      let selectorApp = {
        url: "/webApps/document/agentSelector.vue",
        className: "ElementVueItem",
        dsl: {
          url: "/webApps/document/agentList/agentTemplate.js",
          requestType: "jsonp",
          query: {
            callback: "transweb_agents"
          },
          data: {
            currentList: [],
            supoportCustom: false
          },
          dataFilter: function (tData) {
            this.defaultData.currentList = tData.agentList;
            return this.defaultData;
          },
          style: {
            padding: "20px 30px"
          },
          methods: {}
        }
      }

      let userInfo = JSON.parse(localStorage.userInfo || "{}");
      if (userInfo && userInfo.role && userInfo.role.indexOf("partner") !== -1) {
        selectorApp.dsl.data.supoportCustom = true;
      }

      let _self = this;
      let switchNextStep = function () {
        let vueItem = selectorApp.card.task.vueItem;
        let script = vueItem.getCurrentSelected();
        _self.editAgentScript(script, callback, title, "new");
      }

      webCpu.CardItem.renderCardDialog(tCard, selectorApp, {
        title: webCpu.messages[lang].newAgentItem + " - " + webCpu.messages[lang].selectAgentTemplate,
        closeType: "back",
        dialogName: "editInfoDialog",
        renderMode: "stack",
        titleStyle: {
          background: "var(--el-color-primary-light-9)",
          color: "var(--el-color-primary)",
        },
        menu: [
          {
            label: `<span style='padding: 0px 10px; font-size: 14px;'>${webCpu.messages[lang].nextStep}<i class="bi bi-chevron-right" style="margin-right: 5px;"></i></span>`,
            callback: switchNextStep,
          },
        ],
      });
    },
    editAgentScript(script, tCallback, title, type) {
      let editor = {
        url: "/plugins/elementVueItem/pageCard.vue",
        className: "ElementVueItem",
        dsl: {
          data: {
            mode: "edit",
            info: {
              content: typeof script === "string" ? WebTool.stringToObject(script, true) : script,
            },
            optionMap: {
              content: {
                style: {
                  width: "100%",
                  height: "100%",
                }
              },
            },
            config: [
              {
                prop: "content",
                type: "mindmap",
              },
            ],
          },
        },
      };

      let tCard = document.body;

      let _self = this;
      let saveContent = function () {
        setTimeout(() => {
          let jm = editor.card.task.vueItem.jm || window.jm;
          let tData = jm.get_data("node_tree");
          let content = WebTool.reverseJsMind(tData.data);
          let vueItem = _self.about.card.task.vueItem;
          let arr = vueItem.info.agentList;
          let flag = true;
          if (type !== "edit") {
            for (let i = 0; i < arr.length; i++) {
              if (content.name === arr[i].name) {
                flag = false;
                break;
              }
            }
            if (!flag) {
              vueItem.$message({
                type: "warning",
                message: webCpu.messages[lang].saveAgentFailed
              })
              return false;
            }
          }
          // content = webCpu.attachAttribute(content, script);
          let t = WebTool.objectToString(content, true);
          // webCpu.CardItem.dismissMask(tCard);
          if (typeof tCallback === "function") {
            tCallback(t);
          }
        }, 200);
      };
      webCpu.CardItem.dismissMask(tCard);
      webCpu.CardItem.renderCardDialog(
        tCard,
        editor,
        {
          title: title,
          closeType: "back",
          dialogName: "editInfoDialog",
          renderMode: "stack",
          titleStyle: {
            background: "var(--el-color-primary-light-9)",
            color: "var(--el-color-primary)",
          },
          menu: [
            {
              label: `<span style='padding: 0px 10px; font-size: 14px;'><i class="bi bi-cloud-upload" style="margin-right: 5px;"></i>${webCpu.messages[lang].save}</span>`,
              callback: saveContent,
            },
          ],
        }
      );
    },
    exampleScript: {
      "name": 'smartFlash',
      "resolution": [1200, 1200],
      "meta": {
        "label": '抽认卡',
        "description": '用 AI 生成抽认卡！',
        "slogan": 'AI 生成抽认卡，帮你学懂每个知识点！',
        "slogan1": '自动生成抽认卡，让学习更高效、更扎实！',
        "buttonText": '开始生成抽认卡',
        "confirmTips": 'AI 智能生成，预计 30 秒内完成',
        // "scanQrTips": '扫一扫，查看和使用所有卡片！',
        "inputPlaceholder": '请输入书籍/年级科目名称 + 具体知识点范围描述(可选)'
      },
      "appPrompts": `# 任务目标：
      你是一名擅长内容分析理解的老师，需要按要求生成抽认卡内容。
      ## 核心技能：
      ### 技能 1：内容解析
      - 请分析提炼给定内容的主题，并提炼内容包含的知识要点或推理主题的下一级主题知识要点。
      - 为每个知识要点生成抽认卡内容，至少包含5张抽认卡内容。
      - 以 JSON 数据格式呈现所生成的抽认卡内容。
  
      #### JSON结构如下：
        - 'name': 表示内容的主题;
        - 'children': 一个数组，列出所涉及的知识点，每个知识点的字段包括：
           - 'name': 知识点名称；
           - 'cards': 一个数组，包含抽认卡内容，每张抽认卡的字段包括：
              - 'question': 抽认卡的问题描述。
              - 'answer': 抽认卡的问题答案。
      
    ### 答案输出约束
      - 仅输出 JSON  不包含任何额外说明或文字。
      - 回答内容需要是中文(对非中文内容，请翻译成中文)。
      - 确保输出结果，严格遵循JSON格式规范。如果发现错误，请自行修正，确保返回的数据完整且符合 JSON 标准。
      - 请确保每一个键值对之间都有','分开。
      - 请生成完整的 JSON 内容，从 '{' 开始到 '}' 结束，并确保包含所有字段。
      - 请生成 JSON 内容并检查内容完整性，确保每一个键值对和结构符号（如 '{' 和 '}'）都包括在内。
      - 生成 JSON 内容，其中至少包含 10 个字段，以保证结构完整。
  `,
      "url": '/bucket/personal/1714628260/layout/flashcards.vue',
      "className": 'ElementVueItem'
    },
    _editAgentScript: function (script, tCallback, title) {
      let tCard = this.card;

      let codeEditor = {
        className: "CodeEditor",
        dsl: {
          data: script,
          options: {
            mode: "jsObj"
          }
        }
      }
      let callback = function () {
        if (typeof tCallback === "function") {
          try {
            let obj = codeEditor.card.task.data;
            if (typeof codeEditor.card.task.data === "string") {
              obj = WebTool.stringToObject(codeEditor.card.task.data);
            }
            tCallback(obj);
          } catch (e) {
            tCard.task.vueItem.$message({
              type: "warning",
              message: webCpu.messages[lang].contentFormatError
            })
            console.log(e);
          }
        }
      }
      webCpu.CardItem.renderCardDialog(tCard, codeEditor, {
        title: title,
        closeType: "back",
        dialogName: "editInfoDialog",
        renderMode: "stack",
        titleStyle: {
          background: "var(--el-color-primary-light-9)",
          color: "var(--el-color-primary)",
        },
        menu: [{
          label: webCpu.messages[lang].save,
          action: callback
        }]
      });
    },
    saveAgentList: function (info) {

      let tVueItem = this.about.card.task.vueItem;
      let t = info.agentList;
      try {
        if (typeof t === "string") {
          t = WebTool.stringToObject(t, true);
        }
        let nameMap = {};
        if (t.length > this.countLimit) {
          tVueItem.$message({
            type: "warning",
            message: webCpu.messages[lang].agentCountLimit,
          })
          return false;
        }
        t = t.map(item => {
          nameMap[item.name] = nameMap[item.name] || 0;
          nameMap[item.name]++;
          //避免重名的情况
          if (nameMap[item.name] > 1) {
            item.name += nameMap[item.name];
          }

          if (item.posterApp && item.posterApp.card) {
            delete item.posterApp.card;
          }

          return item;
        });
        t = WebTool.objectToString(t, true);
      } catch (e) {
        tVueItem.$message({
          type: "warning",
          message: webCpu.messages[lang].agentCodeError,
        });
        return false;
      }


      webCpu.CardItem.switchState(webCpu.cards.editInfoDialog, "loading");


      if (lang === "zh") {
        info.agentList_zh = t;
        info.name_zh = info.name;
        info.slogan_zh = info.slogan;
        info.slogan1_zh = info.slogan1;
        info.introduce_zh = info.introduce;
      } else {
        info.agentList_en = t;
        info.name_en = info.name;
        info.slogan_en = info.slogan;
        info.slogan1_en = info.slogan1;
        info.introduce_en = info.introduce;
      }
      info.agentList = t;
      if (info.image.length > 1024 * 1024) {
        WebTool.compressAndResizeBase64(info.image, 600, 600, 1).then((newBase64) => {
          info.image = newBase64;
          this.updateInfo(info, function (tData) {
            webCpu.CardItem.dismissMask(webCpu.cards.editInfoDialog.dialogData.parentCard);
            if (webCpu.cards.documentEditor && webCpu.cards.documentEditor.task && webCpu.cards.documentEditor.task.vueItem) {
              webCpu.cards.documentEditor.task.vueItem.openPersonDialog();
            }
            else {
              location.reload();
            }
          })
        });
      }
      else {
        this.updateInfo(info, function (tData) {
          webCpu.CardItem.dismissMask(webCpu.cards.editInfoDialog.dialogData.parentCard);
          if (webCpu.cards.documentEditor && webCpu.cards.documentEditor.task && webCpu.cards.documentEditor.task.vueItem) {
            webCpu.cards.documentEditor.task.vueItem.openPersonDialog();
          }
          else {
            location.reload();
          }

        })
      }

    },
    handleEditClick: function () {
      let _self = this;
      // delete this.about.card;
      var app = this.about.dsl.data.optionMap.basicInfo;
      app.dsl.data.mode = "edit";
      app.dsl.methods = app.dsl.methods || {};
      app.dsl.methods.dealChangeEvent = function (d, config) {
        console.log("dealChangeEvent", d, config);
        if (_self.about.card.task.vueItem) {
          _self.about.card.task.vueItem.info[config.prop] = d[config.prop];
        }
      }
      this.about.dsl.style = this.about.dsl.style || {
        padding: "20px 30px"
      };
      this.about.dsl.style.padding = "20px 30px";
      this.about.dsl.data.optionMap.agentHandler.hidden = true;


      this.about.dsl.data.optionMap.agentList.dsl.data.optionMap.buttonItem.style.width = "120px";
      this.about.dsl.data.optionMap.agentList.dsl.data.optionMap.buttonItem.style.right = lang === 'zh' ? "-20px" : "-12px";

      this.about.dsl.data.optionMap.agentList.dsl.data.optionMap.buttonItem.content[0].hidden = false;
      this.about.dsl.data.optionMap.agentList.dsl.data.optionMap.buttonItem.content[1].hidden = false;
      this.about.dsl.data.optionMap.agentList.dsl.data.optionMap.buttonItem.content[2].hidden = true;
      this.about.dsl.data.optionMap.agentList.dsl.methods.handleClickButton = function (d, config, i) {
        let userInfo = JSON.parse(localStorage.userInfo || "{}");
        if (true || userInfo && userInfo.role && userInfo.role.indexOf("partner") !== -1) {
          if (config.label === webCpu.messages[lang].removeTips) {
            var param = _self.about.card.task.vueItem.info;
            this
              .$confirm(
                webCpu.messages[lang].confirmRemoveTips,
                webCpu.messages[lang].confirmDialogTitle, {
                confirmButtonText: webCpu.messages[lang].confirmYes,
                cancelButtonText: webCpu.messages[lang].confirmNo,
                type: "warning",
              }
              )
              .then(() => {
                if (param.agentList && typeof param.agentList.splice === "function") {
                  param.agentList.splice(i, 1);
                  _self.saveAgentList(param);
                }
              });
          } else if (config.label === webCpu.messages[lang].editTips) {
            var param = _self.about.card.task.vueItem.info;
            let obj = param.agentList[i];
            _self.editAgentScript(obj, (agent) => {
              param.agentList[i] = typeof agent === "string" ? WebTool.stringToObject(agent) : agent;
              param.agentList = WebTool.copyObject(param.agentList, true);
              _self.saveAgentList(param);
            }, webCpu.messages[lang].editTips, "edit");
          }
        } else {
          this.$message({
            type: "warning",
            message: webCpu.messages[lang].addAgentTips
          });
          setTimeout(() => {
            _self.displayArticleDialog("contact");
          }, 500);
        }
      }

      let tCard = this.card;
      if (webCpu.cards.documentEditor) {
        tCard = webCpu.cards.documentEditor;
      }
      this.about.dsl.data.optionMap.agentHandler.style.width = "100px";
      this.about.dsl.data.optionMap.agentHandler.style.top = "125px";

      this.about.dsl.methods.handleClickButton = function (d, config) {
        if (config.label === webCpu.messages[lang].newAgentItem) {
          _self.selectAgentTemplate(_self.exampleScript, (agent) => {
            let info = this.info;
            agent = typeof agent === "string" ? WebTool.stringToObject(agent) : agent;
            info.agentList.unshift(agent);
            info.agentList = WebTool.copyObject(info.agentList, true);
            _self.saveAgentList(info);
          }, webCpu.messages[lang].newAgentItem + " - " + webCpu.messages[lang].editAgentScript);
        }
      }
      var info = this.about.card.task.data.info || {};
      app.dsl.data.editorMap = {
        image: {
          type: "plugin",
          url: "/plugins/elementVueItem/imageSelector.vue",
          className: "ElementVueItem",
          dsl: {
            data: {
              type: "avatar",
              dataUrl: info.image || {}
            },
            methods: {
              changeCallback: function (v) {

              }
            }
          },
          "paramName": "dataUrl",
        },
        name: {
          type: "input",
          placeholder: webCpu.messages[lang].inputName,
          valueStyle: "width: 100%; display: inline-block; float: right;"
        },
        introduce: {
          type: "input",
          placeholder: webCpu.messages[lang].inputIntroduce,
          valueStyle: "width: 100%; display: inline-block; float: right;"
        },
        slogan: {
          type: "input",
          placeholder: webCpu.messages[lang].inputSlogan,
          valueStyle: "width: 100%; display: inline-block; float: left;"
        },
        slogan1: {
          type: "input",
          placeholder: webCpu.messages[lang].inputSlogan1,
          valueStyle: "width: 100%; display: inline-block; float: left;"
        },
      }
      this.about.dsl.data.optionMap.buttonGroup.hidden = true;

      delete this.about.dsl.data.optionMap.agentList.dsl.methods.handleClickCard;
      this.about.dsl.data.optionMap.agentList.style.height = "calc( 100% - 140px )";

      app.dsl.data.editorMap.image.dsl.methods.changeCallback = function (d) {
        if (!_self.about.card || !_self.about.card.task || !_self.about.card.task.vueItem) {
          return false;
        }
        if (_self.about.card.task.vueItem) {
          _self.about.card.task.vueItem.info.image = d;
        }
      }

      webCpu.CardItem.renderCardDialog(tCard, this.about, {
        title: webCpu.messages[lang].editPersonalInfo,
        closeType: "back",
        renderMode: "stack",
        dialogName: "editInfoDialog",

        titleStyle: {
          background: "var(--el-color-primary-light-9)",
          color: "var(--el-color-primary)",
        },
        menu: [{
          label: webCpu.messages[lang].save,
          action: function () {
            if (!_self.about.card || !_self.about.card.task || !_self.about.card.task.vueItem) {
              return false;
            }
            var param = _self.about.card.task.vueItem.info;
            _self.saveAgentList(param);
          }
        }]
      }, {
        width: "100%",
        height: "100%",
        background: "#fff",
        borderRadius: "5px",
      });
    },
    loadAgentScript: function () {
      let app = {
        url: "/webApps/document/loadAgentScript.vue",
        className: "ElementVueItem",
        cardName: "loadScriptCard",
        dsl: {
          data: {
            supoportCustom: false,
          }
        },
        style: {
          padding: "20px 30px"
        }
      }


      let tCard = this.card;
      if (webCpu.cards.documentEditor) {
        tCard = webCpu.cards.documentEditor;
      }
      webCpu.CardItem.renderCardDialog(tCard, app, {
        title: webCpu.messages[lang].scriptLoaderLabel,
        closeType: "back",
        renderMode: "stack",
        dialogName: "editInfoDialog",
        titleStyle: {
          background: "var(--el-color-primary-light-9)",
          color: "var(--el-color-primary)",
        },
      }, {
        width: "100%",
        height: "100%",
        background: "#fff",
        borderRadius: "5px",
      });
    },
    exportAgentScript: function () {
      let info = this.about.card.task.vueItem.info;
      let list = info.agentList || [];
      let str = `transweb_agents({ agentList: ${WebTool.objectToString(list)}})`;
      let name = (info.name || "未命名") + ".agentScript.js";
      WebTool.downloadString(str, name, "text/plain");
    },
    about: {
      "url": "/plugins/elementVueItem/pageCard.vue",
      cardName: "aboutInfoCard",
      "dsl": {
        style: {
          width: "100%",
          height: "100%",
          background: "#f2f2f2"
        },
        methods: {
          handleClickCard(d, config, i) {

          },
          processFiles: async function () {
            let prefix = "/bucket/example/transwebPlugin/";
            WebTool.downloadPluginFiles(prefix, this.files, this.info);
          },
        },
        "data": {
          "files": [
            "images/icon16.png",
            "images/icon48.png",
            "images/icon128.png",
            "images/logo.png",
            "aiPluginTool.js",
            "background.js",
            "content.js",
            "html2canvas.js",
            "manifest.json",
            "popup.html",
            "popup.js",
          ],
          "cardStyle": {
            backgroundColor: "#f2f2f2"
          },
          "optionMap": {
            "buttonGroup": {
              "style": {
                "display": "inline-block",
                "width": "50%",
                "float": "left",
                "marginBottom": "20px"
              },
              "content": [{
                label: webCpu.messages[lang].edit,
                type: "primary",
                style: {
                  width: "100px"
                }
              }, {
                label: webCpu.messages[lang].modifyPass,
                style: {
                  width: "100px"
                }
              }]
            },
            "folderName": {
              "label": "应用集群 ID:",
              "style": {
                "display": "inline-block",
                "width": "200px",
                "float": "right",
                "marginBottom": "20px",
                "cursor": "pointer",
                "textAlign": "right"
              },
            },
            "copyBtn": {
              "style": {
                "display": "inline-block",
                "width": "40px",
                "float": "right",
                "marginBottom": "20px",
                "margin-left": "5px"
              },
              "content": [{
                label: webCpu.messages[lang].copyBtn,
                type: "primary",
                iconClass: "bi bi-clipboard",
                text: true,
                style: {
                  width: "100%"
                }
              }]
            },
            "basicInfo": {
              "url": "/plugins/elementVueItem/pageCard.vue",
              cardName: "basicInfoCard",
              style: {
                width: "100%",
                height: "135px",
                position: "relative",
                display: "inline-block",
                borderRadius: "8px",
                background: "#fff"
              },
              paramName: "info",
              "dsl": {
                "data": {
                  cardStyle: {
                    padding: "25px 20px 10px 20px"
                  },
                  optionMap: {
                    "image": {
                      "style": "display: inline-block; width: 90px; height: 90px; float: left; margin-right: 25px; border-radius: 100%;"
                    },
                    "name": {
                      "valueClass": "ellipsis",
                      "style": "font-weight: 700; width: 120px; margin-left: 0px; margin-right: 20px; font-size: 20px; float: left; display: inline-block; margin-bottom: 25px;",
                      // "icon": "bi bi-star"
                    },
                    "introduce": {
                      "valueClass": "ellipsis",
                      "style": "font-weight: 700; width: calc( 100% - 255px ); line-height: 30px;  float: left; display: inline-block;  margin-bottom: 30px;",
                      // "icon": "bi bi-star"
                    },
                    "slogan": {
                      "valueClass": "ellipsis",
                      "labelStyle": "font-size: 12px; margin-top: 1px; display: inline-block; float: left; padding-right: 10px;",
                      "style": "width: calc( 50% - 80px ); margin-left: 0px;  float: left; display: inline-block;  margin-bottom: 30px;",
                      "valueStyle": "100%; font-size: 14px; float: left;"
                    },
                    "slogan1": {
                      "valueClass": "ellipsis",
                      "labelStyle": "font-size: 12px; margin-top: 1px; display: inline-block; float: left; padding-right: 10px;",
                      "style": "width: calc( 50% - 80px ); margin-left: 10px;  float: right; display: inline-block;  margin-bottom: 30px;",
                      "valueStyle": "width: 100%;font-size: 14px; float: left;"
                    },
                  },
                  config: [
                    {
                      "type": "avatar",
                      "prop": "image"
                    },
                    {
                      "type": "text",
                      "prop": "name"
                    },
                    {
                      "type": "text",
                      "prop": "introduce"
                    },
                    {
                      "type": "text",
                      "prop": "slogan"
                    },
                    {
                      "type": "text",
                      "prop": "slogan1"
                    },
                  ]
                }
              }
            },
            "agentHandler": {
              "style": {
                "display": "inline-block",
                "width": "300px",
                "position": "absolute",
                "top": "193px",
                "right": "-2px",
                "text-align": "right"
              },
              "content": [{
                label: webCpu.messages[lang].newAgentItem,
                type: "success",
                style: {
                  width: "100px"
                }
              }, {
                label: webCpu.messages[lang].scriptLoaderLabel,
                type: "info",
                style: {
                  width: "100px"
                }
              },
              {
                label: webCpu.messages[lang].scriptDownload,
                style: {
                  width: "100px"
                }
              }]
            },
            "agentList": {
              "label": webCpu.messages[lang].agentList,
              "url": "/plugins/elementVueItem/infoCardList.vue",
              "className": "ElementVueItem",
              paramName: "info",
              "dsl": {
                dataFilter: function (tData) {
                  let ret = this.defaultData;
                  if (this.data.mode === "edit" && typeof ret.info !== "string") {
                    ret.info = WebTool.objectToString(ret.info);
                  } else if (this.data.mode !== "edit" && typeof ret.info === "string") {
                    ret.info = WebTool.stringToObject(ret.info);
                  } else { }
                  if (this.data.mode !== "edit" && ret.info && ret.info.constructor.name === "Array") {
                    ret.info = ret.info.map(item => {
                      let meta = item.meta || {};
                      return {
                        name: item.name,
                        label: meta.label,
                        description: meta.description
                      }
                    })
                  }
                  return ret;
                },
                data: {
                  info: [],
                  gutter: 10,
                  span: WebTool.adjustSize([false, false, true]) ? 24 : 12,
                  cardStyle: {
                    border: "solid 1px #f3f3f3",
                    background: "#fff",
                    padding: "15px 20px",
                    borderRadius: "8px",
                    marginBottom: "5px",
                    cursor: "pointer",
                  },
                  style: {
                    padding: "0px 10px"
                  },
                  optionMap: {
                    name: {
                      before: "-",
                      style: {
                        display: "inline-block",
                        fontWeight: 900
                      }
                    },
                    label: {
                      style: {
                        display: "inline-block",
                        fontWeight: 900
                      }
                    },
                    description: {
                      class: "ellipsis_2",
                      style: {
                        display: "block",
                        height: "40px"
                      }
                    },
                    buttonItem: {
                      hidden: false,
                      size: "small",
                      style: {
                        display: "inline-block",
                        position: "absolute",
                        right: "-10px",
                        bottom: "-5px",
                        width: "35px"
                      },
                      content: [{
                        type: "warning",
                        size: "small",
                        hidden: true,
                        label: webCpu.messages[lang].removeTips
                      }, {
                        size: "small",
                        hidden: true,
                        label: webCpu.messages[lang].editTips
                      }, {
                        size: "small",
                        hidden: false,
                        textFlag: true,
                        iconClass: "bi bi-qr-code"
                      }]
                    }
                  },
                  config: [{
                    type: "text",
                    prop: "label"
                  }, {
                    type: "text",
                    prop: "name"
                  }, {
                    type: "text",
                    prop: "description"
                  }, {
                    type: "button",
                    prop: "buttonItem"
                  }]
                },
                methods: {
                  handleClickCard: function (d, config) {
                    let url = location.origin + "?agent=" + localStorage.folderName + "&appName=" + d.name;
                    window.open(url, "_blank");
                  }
                }
              },
              "labelStyle": "width: 100%; font-size: 14px; font-weight: 900; display: inline-block; float: left; margin: 10px 0px 5px 0px;",
              style: {
                width: "100%",
                height: "calc( 100% - 180px )",
                float: "left",
                display: "inline-block",
                color: "#999"
              },
              valueStyle: {
                width: "calc( 100% + 18px )",
                float: "left",
                marginLeft: "-10px",
                height: "calc( 100% - 70px )",
                overflow: "auto"
              }
            }
          },
          "config": [
            {
              "type": "button",
              "prop": "buttonGroup"
            },
            {
              "type": "button",
              "prop": "copyBtn"
            },
            {
              "type": "text",
              "prop": "folderName"
            },
            {
              "type": "plugin",
              "prop": "basicInfo"
            },
            {
              "type": "button",
              "prop": "agentHandler"
            },
            {
              "type": "plugin",
              "prop": "agentList"
            }
          ],
          "info": {}
        }
      }
    },
    modifyPass: {
      url: "plugins/elementVueItem/infoCardList.vue",
      className: "ElementVueItem",
      dsl: {
        style: {
          padding: "25px 30px 10px 30px"
        },
        methods: {
          handleClickButton: function (d) {

          },
        },
        data: {
          mode: "edit",
          editorMap: {
            password: {
              type: "input",
              placeholder: webCpu.messages[lang].inputNewPass,
              size: "default"
            }
          },
          optionMap: {
            password: {
              style: {
                marginTop: "20px"
              },
            },
            buttonGroup: {
              style: {
                width: "100%",
                marginTop: "20px"
              },
              content: [{
                label: webCpu.messages[lang].confirmYes,
                type: "primary",
                size: "default",
                style: {
                  width: "100%"
                }
              }]
            }
          },
          config: [{
            type: "text",
            prop: "password"
          }, {
            type: "button",
            prop: "buttonGroup"
          }],
          info: {
            passowrd: ""
          },
          cardStyle: {
            "background-color": "transparent"
          }
        }
      }
    },
    updateInfo: function (param, callback) {
      aigcInterface.adapter.updateLoginInfo({
        condition: {
          _id: this.data._id
        },
        set: param
      }, function (d) {
        if (typeof (callback) === "function") {
          callback(d);
        }
      })
    },
    defaultAvatar: webCpu.documentPrefix + "/assets/images/logo.png",
    configAboutApp(app) {
      app.dsl.data = this.about.dsl.data;
      let info = app.dsl.data.info;
      let str = info.agentList;
      try {
        if (typeof str === "string") {
          let arr = WebTool.stringToObject(str);
          app.dsl.data.info.agentList = arr.map(item => {
            delete item.publishInfo;
            return item;
          }) || [];
        }
      } catch (e) {
        console.log("agents code parse error: ", e);
        app.dsl.data.info.agentList = [];
      }
    },
    mdMap: {
      about: "/assets/about.md",
      privacy: "/assets/privacy.md",
      terms: "/assets/terms.md",
      contact: "/assets/contact.md",
      about_en: "/assets/about_en.md",
      privacy_en: "/assets/privacy_en.md",
      terms_en: "/assets/terms_en.md",
      contact_en: "/assets/contact_en.md",
    },
    displayArticleDialog(name) {
      let key = name;
      if (lang === "en") {
        name = name + "_en";
      }
      let path = this.mdMap[name];
      let app = {
        className: "MarkdownArticle",
        dsl: {
          url: path,
          requestType: "get",
          dataType: "text",
          style: {
            padding: "30px 20px 10px 20px",
            overflow: "auto",
            background: "#fff",
          },
        },
      };
      let card = webCpu.cards.documentEditor;
      webCpu.CardItem.renderCardDialog(
        card,
        app, {
        dialogName: "articleViewDialog",
        closeType: "back",
        title: webCpu.messages[lang][key],
        renderMode: "stack",
        titleStyle: {
          background: "var(--el-color-primary-light-9)",
          color: "var(--el-color-primary)",
        },
      }, {
        width: "100%",
        height: "100%",
      }
      );
    },
    promise: {
      beforeRender: function (c, d, t) {
        t.data = d.data || {};
        if (!d.data) {
          if (!webCpu.cards.loginRegItem) {
            aigcInterface.openLoginDialog();
          }
          else {
            webCpu.cards.loginRegItem.task.vueItem.$message({
              type: "warning",
              message: webCpu.messages[lang].loginTips
            });
          }
          return false;
        }

        t.about.dsl.data.info.name = d.data['name_' + lang] || d.data.name || webCpu.messages[lang].anonymous;
        t.about.dsl.data.info.introduce = d.data['introduce_' + lang] || d.data.introduce || webCpu.messages[lang].noBioLeft;
        t.about.dsl.data.info.slogan = d.data['slogan_' + lang] || d.data.slogan || webCpu.messages[lang].sloganEmpty;;
        t.about.dsl.data.info.slogan1 = d.data['slogan1_' + lang] || d.data.slogan1 || webCpu.messages[lang].sloganEmpty1;
        t.about.dsl.data.info.image = d.data.image || t.defaultAvatar;
        t.about.dsl.data.info.agentList = t.about.dsl.data.info.agentList || [];
        t.about.dsl.data.info.folderName = d.data.folderName;

        let str = d.data.agentList;
        if (lang !== "zh") {
          str = d.data.agentList_en || d.data.agentList || d.data.agentList_zh;
        } else {
          str = d.data.agentList_zh || d.data.agentList || d.data.agentList_en;
        }
        try {
          if (typeof str === "string") {
            let arr = WebTool.stringToObject(str);
            arr = WebTool.copyObject(arr, true);
            t.about.dsl.data.info.agentList = arr.map(item => {
              delete item.publishInfo;
              item = WebTool.copyObject(item, true);
              return item;
            }) || [];
          }
        } catch (e) {
          console.log("agents code parse error: ", e);
          t.about.dsl.data.info.agentList = [];
        }

        if (t.about.dsl.data.info.agentList.length === 0) {
          t.about.dsl.data.optionMap['agentHandler'].content[2].hidden = true;
          // t.about.dsl.data.optionMap['agentHandler'].content[3].hidden = true;
          t.about.dsl.data.optionMap['agentHandler'].content[0].style.width = "50%"
          t.about.dsl.data.optionMap['agentHandler'].content[1].style.width = "50%"
          t.about.dsl.data.optionMap['agentHandler']["style"].width = lang === 'zh' ? "220px" : '280px';
        }
        else {
          t.about.dsl.data.info.agentList = t.about.dsl.data.info.agentList.sort((a, b) => {
            return Number(a.index) - Number(b.index);
          })
        }

        t.about.dsl.data.info.basicInfo = {
          name: t.about.dsl.data.info.name,
          introduce: t.about.dsl.data.info.introduce,
          slogan: t.about.dsl.data.info.slogan,
          slogan1: t.about.dsl.data.info.slogan1,
          image: t.about.dsl.data.info.image
        }
      },
      afterRender: function (c, d, t) {
        t.about.dsl.methods.handleClickCard = function (d, config) {
          if (config.prop === "folderName") {
            this.$message({
              type: "success",
              message: "复制 ID 成功！"
            })
            WebTool.copyString(d.folderName);
          }
        }
        t.about.dsl.methods.handleClickButton = function (d, config) {
          if (config.label === webCpu.messages[lang].edit) {
            t.handleEditClick();
          } else if (config.label === webCpu.messages[lang].pluginDownload) {
            this.processFiles();
          } else if (config.label === webCpu.messages[lang].scriptLoaderLabel) {
            t.loadAgentScript();
          } else if (config.label === webCpu.messages[lang].scriptDownload) {
            t.exportAgentScript();
          } else if (config.label === webCpu.messages[lang].newAgentItem) {
            if (this.info.agentList.length > t.countLimit) {
              tVueItem.$message({
                type: "warning",
                message: webCpu.messages[lang].agentCountLimit,
              });
              return false;
            }
            else {
              t.selectAgentTemplate((agent) => {
                let info = this.info;
                agent = typeof agent === "string" ? WebTool.stringToObject(agent) : agent;
                info.agentList.unshift(agent);
                t.saveAgentList(info);
              }, webCpu.messages[lang].newAgentItem + " - " + webCpu.messages[lang].editAgentScript);
            }

          } else if (config.label === webCpu.messages[lang].copyBtn) {
            this.$message({
              type: "success",
              message: "复制 ID 成功！"
            })
            WebTool.copyString(d.folderName);
          } else {
            t.handlePassClick();
          }
        }
        t.about.dsl.data.optionMap.agentList.dsl.methods.handleClickButton = function (d, config, i) {
          var param = t.about.card.task.vueItem.info;
          let obj = param.agentList[i];
          obj.posterApp = obj.posterApp || {};
          let pApp = {
            url: obj.posterApp.url || "/webApps/document/appPosterItem.vue",
            className: obj.posterApp.className || "ElementVueItem",
            dsl: {
              data: {
                contentTitle: obj.meta.description,
                appName: (param.name || webCpu.messages[lang].anonymous) + " - " + obj.meta.label,
                url: `${location.origin}?agent=${localStorage.folderName}&appName=${obj.name}`
              }
            }
          }
          if (pApp) {
            pApp.dsl.style = {
              width: 900,
              height: 900
            }
            let exportImage = function () {
              if (pApp.card && pApp.card.task && pApp.card.task.vueItem) {
                let vueItem = pApp.card.task.vueItem;
                if (typeof vueItem.exportImage === "function") {
                  vueItem.exportImage();
                }
              }
            }
            let menu = [{
              label: "导出海报",
              action: exportImage
            }]
            let tCard = webCpu.cards.documentEditor;
            webCpu.CardItem.renderCardDialog(tCard, pApp, {
              title: webCpu.messages[lang].qrCodePoster,
              closeType: "back",
              renderMode: "stack",
              dialogName: "editInfoDialog",
              titleStyle: {
                background: "var(--el-color-primary-light-9)",
                color: "var(--el-color-primary)",
              },
              menu: menu
            }, {
              width: "100%",
              height: "100%",
              background: "#fff",
              borderRadius: "5px",
            });
          }
          else {
            this.$message({
              type: "warning",
              message: webCpu.messages[lang].noPosterApp
            })
          }
        }
        let userInfo = JSON.parse(localStorage.userInfo || "{}");

        if (userInfo && ((userInfo.role && userInfo.role.indexOf("partner") === -1) || !userInfo.role)) {
          t.about.dsl.data.optionMap.agentHandler.style.width = "280px";
          t.about.dsl.data.optionMap.agentHandler.content = [{
            label: webCpu.messages[lang].newAgentItem,
            type: "success",
            style: {
              width: "50%"
            }
          }, {
            label: webCpu.messages[lang].scriptLoaderLabel,
            type: "info",
            style: {
              width: "50%"
            }
          }];
        }
        webCpu.updateView(c, t.about);

      }
    }
  }
})