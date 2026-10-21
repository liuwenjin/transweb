(function () {
  webCpu.documentPrefix = webCpu.documentPrefix || location.origin;
  window.lang =
    WebTool.urlQuery(location.href, "lang") || webCpu.language || "zh";
  let flag = WebTool.adjustSize([false, false, true]);

  webCpu.appConfig = webCpu.appConfig || {};

  let opts = {
    templateMap: {
      text: "/transweb/appTemplate.vue",
      image: "/transweb/imageTemplate.vue",
      textImage: "/transweb/textImageTemplate.vue",
      agent: "/transweb/agentTemplate.vue",
    },
    priceMap: {},
    modelMap: {},
    workflowTemplate: webCpu.documentPrefix + "/webApps/document/workflow.vue",
    generateProgressApp: {
      url:
        webCpu.documentPrefix + "/webApps/document/generateProgressPanel.vue",
      className: "ElementVueItem",
    },
    constraintMap: {
      "asd-ste100": "参考 ASD-STE100 标准，只做到80%的准确率，避免过度优化",
    },
    agentListApp: {
      url: webCpu.documentPrefix + "/plugins/elementVueItem/infoCardList.vue",
      className: "ElementVueItem",
      dsl: {
        url: webCpu.documentPrefix + "/user/getLoginedData",
        requestType: "post",
        query: {
          table: "pptItem",
          condition: {},
          pageSize: 10,
          pageNo: 1,
          sort: {},
        },
        dataFilter: function (d) {
          let ret = this.defaultData;
          d.data = d.data || [];
          ret.info = d.data.map((item) => {
            const date = new Date(item.time);
            const options = {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
            };

            const formatter = new Intl.DateTimeFormat("zh-CN", options);
            console.log(formatter.format(date));
            item.time = formatter.format(date);
            if (item.publishInfo) {
              let pInfo = JSON.parse(item.publishInfo || "{}");
              item.appOwner = pInfo.user;
            }
            item.appOwner = item.appOwner;
            item._appLabel = item.appOwner
              ? item.appOwner + " - " + (item.appLabel || item.appName)
              : item.appLabel || item.appName;
            ret.page = ret.page || {};
            let pagination = d.pagination || d;
            ret.page.currentPage = pagination.pageNo;
            ret.page.pageSize = pagination.pageSize;
            ret.page.total = pagination.total;
            return item;
          });
          let _self = this;
          this.methods.confirmSearchResult = function () {
            let value = this.filterOption.value;
            _self.query.pageNo = 1;
            _self.query.condition = JSON.stringify({
              name: { $regex: value, $options: "i" },
            });
            webCpu.fresh(_self);
          };
          return ret;
        },
        style: {
          padding: "25px 40px",
        },
        data: {
          filterOption: {
            label: "名称",
            value: "",
            status: true,
            buttonText: "搜索",
            placeholder: "请输入名称进行搜索",
            style: {
              maxWidth: "300px",
            },
          },
          info: [],
          gutter: 20,
          span: WebTool.adjustSize([false, false, true]) ? 24 : 12,
          cardStyle: {
            border: "solid 1px #f3f3f3",
            background: "#ffffff",
            padding: "15px 20px 35px 20px",
            marginBottom: "10px",
          },
          optionMap: {
            _appLabel: {
              class: "ellipsis",
              style: {
                position: "absolute",
                display: "inline-block",
                fontSize: "10px",
                textAlign: "right",
                color: "#999",
                width: "125px",
                right: "-10px",
                bottom: "-25px",
                cursor: "pointer",
              },
            },
            time: {
              style: {
                position: "absolute",
                display: "inline-block",
                fontSize: "10px",
                color: "#999",
                width: "135px",
                left: "0px",
                bottom: "-25px",
              },
            },
            name: {
              class: "ellipsis",
              style: {
                position: "relative",
                display: "inline-block",
                paddingRight: "150px",
                width: "100%",
                cursor: "pointer",
              },
            },
            buttonItem: {
              style: {
                position: "absolute",
                width: "40px",
                right: "-7px",
              },
              content: [
                {
                  label: "删除",
                  textFlag: true,
                  type: "warning",
                },
              ],
            },
          },
          config: [
            {
              prop: "name",
              type: "text",
            },
            {
              prop: "time",
              type: "text",
            },
            {
              prop: "_appLabel",
              type: "text",
            },
            {
              prop: "buttonItem",
              type: "button",
            },
          ],
        },
        methods: {
          handleCurrentChange(v) {
            this._parent.query.pageNo = Number(v);
            webCpu.fresh(this._parent);
          },
          handleClickButton: function (d, config) { },
        },
      },
    },
    workflowVueCode: webCpu.documentPrefix + "/webApps/document/workflow.vue",
    feedback: webCpu.documentPrefix + "/webApps/document/workflow.vue",
    workflowPrompt: `# AIGC Prompt Pipeline Builder

你是 AIGC Prompt Pipeline Builder，一个植入了赫伯特·西蒙（Herbert A. Simon）决策科学内核的流水线架构师。

## 理论根基（Simon Decision Framework）

你的所有拆解行为，必须遵循西蒙的四大核心理论作为底层方法论：

1. **有限理性（Bounded Rationality）**：承认单次推理的认知容量上限（工作记忆 7±2 单元），每个步骤的决策维度不超过 5 个，禁止在单步内追求"全局最优"。
2. **满意解原则（Satisficing）**：每个步骤以"达到 aspiration level（期望水平阈值）"为终止条件，而非"穷尽所有可能"，用可验证阈值替代完美主义。
3. **决策三阶段模型（Intelligence-Design-Choice）**：流水线必须显式包含——情报活动（识别问题）→ 设计活动（构造备选方案）→ 选择活动（按准则筛选）→ 执行反馈（验证修正）四类环节。
4. **过程理性（Procedural Rationality）**：决策质量由**过程结构**而非结果直觉保证，每步必须暴露推理路径与判断准则。

---

## 你的核心任务

将用户的复杂内容生成需求，依据西蒙四阶段决策模型，拆解为**推理负载均衡、执行时长可控、决策路径可追溯**的连续生成环节。每个环节输出「下一步可直接使用的结构化 Prompt」，且**每个中间环节仅生成单条明确数据**，作为下一环节的唯一请求输入内容。

---

## 负载均衡原则（基于有限理性约束）

1. **认知复杂度均衡（7±2 法则）**：每个步骤的决策变量数 ≤5，推理深度、生成长度差异控制在同一量级。
2. **时间块均等化**：预估每个步骤的执行时长差异不超过 30%。
3. **无累积依赖陷阱**：避免"头轻脚重"——前序步骤的认知负载不得低于后续步骤的 70%。
4. **并行可能性识别**：依据决策依赖图识别可独立执行的子任务，标注 'parallel: true/false'。
5. **单数据流原则**：每个环节必须输出且仅输出**单条结构化数据**（单个 JSON 对象或单条字符串），禁止批量输出或数组形式。
6. **满意解终止**：每步以可验证的 aspiration level 为终点，禁止开放式"持续优化"。

---

## 决策阶段映射规范（必须显式标注）

流水线必须覆盖西蒙四阶段，每个步骤须在 'output' 中标注其所属阶段：

| 阶段 | 标识 | 职能 | 典型动作 |
|------|------|------|----------|
| 情报活动 | 'intelligence' | 识别问题、扫描环境、提取约束 | 解析需求、识别受众、提取约束 |
| 设计活动 | 'design' | 构造备选方案、生成结构骨架 | 生成大纲、设计模块、构造模板 |
| 选择活动 | 'choice' | 按准则评估、确定优先级与序列 | 排序、筛选、确定关键路径 |
| 执行反馈 | 'execution_feedback' | 落地生成、对照阈值验收 | 生成内容、评分验收、判定终止 |

> 完整流水线至少包含 1 个 intelligence、1 个 design、1 个 choice、1 个 execution_feedback 环节。

---

## 步骤设计规范

每一步必须包含：

- 'output'：JSON 字符串，定义该步骤的生成任务，必须包含以下字段：
  - 'decision_phase'：所属决策阶段（intelligence / design / choice / execution_feedback）
  - 'task'：具体动作描述（动词开头，可量化）
  - 'instructions'：执行清单（3-5 条，无歧义，明确说明"接收 X 作为输入"和"输出 Y"）
  - 'decision_criteria'：本步骤所采用的判断准则（2-4 条，如"按 priority 降序"、"按字数偏差 ≤10% 接受"）
  - 'aspiration_level'：满意解阈值（数值/布尔条件，明确何时停止推理）
  - 'estimated_load'：预估推理负载（low / medium / high）
  - 'output_format'：输出格式规范（必须明确为"单条 JSON 对象"或"单条字符串"）
  - 'quality_gate'：验收标准（必须可验证，使用数值/布尔判断，禁止主观描述）
- 'label'：步骤名称（动词+名词，≤6 字）
- 'facts'：依赖声明（如需多步骤输入，用逗号分隔步骤名）

---

## 禁止事项

- **禁止模糊词**："合适的"、"高质量"、"优化"、"完善"、"确保"、"提升"、"增强"
- **禁止不可验证要求**："提升可读性"、"增强吸引力"、"逻辑清晰"
- **禁止跨步骤累积负载**：步骤间认知负载比 ≤1.4
- **禁止中间环节输出批量数据**：数组、列表、多对象集合
- **禁止跳过决策阶段**：不得缺失 intelligence 或 execution_feedback 环节
- **禁止追求最优解**：所有验收以 aspiration_level 满意阈值为准，禁用"最佳"、"最优"等表述

---

## 输出格式

仅输出 JSON，不要 markdown 代码块：

{
  "pipeline": {
    "goal": "<用户的最终目标，简洁描述>",
    "title": "<基于目标设计的流水线标题，吸引人且具象>",
    "introduce": "<基于目标设计的流水线介绍，含西蒙决策理论的应用说明>",
    "role": "<基于目标设计的流水线角色设定，吸引人且具象>",
    "theoretical_basis": "Simon Bounded Rationality & Intelligence-Design-Choice Model",
    "estimated_total_steps": <步骤总数>,
    "load_distribution": "uniform",
    "phase_coverage": ["intelligence", "design", "choice", "execution_feedback"],
    "steps": [
      {
        "output": "<单条 JSON 对象或单条字符串，必须包含 decision_phase、task、instructions、decision_criteria、aspiration_level、estimated_load、output_format、quality_gate 字段>",
        "label": "<步骤名称，动词+名词，≤6 字>",
        "facts": "<依赖声明，多步骤用逗号分隔>"
      }
    ]
  }
}

---

## 自检清单（生成流水线前必须内部验证）

在输出最终 JSON 前，你必须依次自检：

1. ✅ 是否覆盖了 intelligence / design / choice / execution_feedback 四个阶段？
2. ✅ 每个步骤的 'decision_criteria' 是否为可执行的判断规则（而非主观描述）？
3. ✅ 每个步骤的 'aspiration_level' 是否为可验证的数值或布尔条件？
4. ✅ 相邻步骤的 'estimated_load' 是否相同或相差不超过一档？
5. ✅ 是否所有中间环节都输出单条数据（非数组）？
6. ✅ 是否避免了所有禁用模糊词？

任一项未通过，重新拆解，直到全部通过后再输出。
    `,
  };

  Object.assign(webCpu.appConfig, opts);

  window.aigcInterface = {
    interface: {
      getUserInfo: {
        url: webCpu.documentPrefix + "/user/getLoginInfo",
        method: "get",
        dataType: "json",
      },
      login: {
        url: webCpu.documentPrefix + "/user/check",
        method: "get",
        dataType: "json",
      },
      updateLoginInfo: {
        url: "/user/updateLoginInfo",
        method: "post",
        dataType: "json",
      },
      deleteDocumentData: {
        url: "/user/deleteDocumentData",
        method: "post",
        dataType: "json",
      },
      setAppConfig: {
        url: "/admin/setAppConfig",
        method: "get",
        dataType: "json",
      },
      getAgentData: {
        url: "/user/getAgentData",
        method: "get",
        dataType: "json",
      },
      updateAccountInfo: {
        url: "/admin/updateCollectionInfo",
        method: "post",
        dataType: "json",
      },
      resetFeedback: {
        url: webCpu.documentPrefix + "/user/resetFeedback",
        method: "post",
      },
      setDocumentAttribute: {
        url: webCpu.documentPrefix + "/user/setDocumentStatus",
        method: "post",
        dataType: "json",
      },
      getAgentData: {
        url: webCpu.documentPrefix + "/user/getAgentData",
        method: "get",
      },
      getDataItem: {
        url: webCpu.documentPrefix + "/user/queryQuestionData",
        method: "get",
      },
      getModelList: {
        url: webCpu.documentPrefix + "/user/getModelList",
        method: "get",
      },
      getDocumentData: {
        url: webCpu.documentPrefix + "/user/getDocumentData",
        method: "get",
      },
      getDocumentItem: {
        url: "{{url}}",
        method: "jsonp",
        dataType: "text",
      },
      saveDocumentData: {
        url:
          webCpu.documentPrefix +
          "/bucket/personal/{{folderName}}/document/{{name}}",
        method: "put",
        dataType: "json",
      },
      publishPptItem: {
        url: webCpu.documentPrefix + "/user/publishPptItem",
        method: "post",
        dataType: "json",
      },
      getAppTemplate: {
        url: "{{url}}",
        method: "get",
        dataType: "text",
      },
      traceVersions: {
        url: webCpu.documentPrefix + "/user/traceVersions",
        method: "post",
      },
      recordVersion: {
        url: webCpu.documentPrefix + "/user/putQuestionData",
        method: "post",
      },
      aigcGateway: {
        url: webCpu.documentPrefix + "/gpt/aiGatewayRequest",
        method: "post",
        query: {
          apiName: webCpu.appConfig.defaultModel.apiName,
          model: webCpu.appConfig.defaultModel.model,
        },
        timeout: 5 * 60 * 1000,
      },
    },
    init: function () {
      webCpu.appConfig.aigcWorkflow = [
        {
          label: "需求分析",
          id: webCpu.appConfig.aigcAppFlow.requirement,
          query: {
            apiName: webCpu.appConfig.defaultModel.apiName,
            model: webCpu.appConfig.defaultModel.model,
          },
          checkJSON: true,
        },
        {
          label: "质量约束",
          id: webCpu.appConfig.aigcAppFlow.contentQuality,
          query: {
            apiName: webCpu.appConfig.defaultModel.apiName,
            model: webCpu.appConfig.defaultModel.model,
          },
          relations: ["需求分析"],
          checkJSON: true,
        },
        {
          label: "模板生成",
          id: webCpu.appConfig.aigcAppFlow.pageTemplate,
          query: {
            apiName: webCpu.appConfig.defaultModel.apiName,
            model: webCpu.appConfig.defaultModel.model,
          },
          checkInput: function (inputText) {
            try {
              let json = WebTool.extractJSON(inputText);
              if (json && json["需求分析"]) {
                json = WebTool.extractJSON(json["需求分析"]);
                inputText = json.example;
                if (typeof json.example === "object") {
                  inputText = JSON.stringify(json.example);
                }
              }
            } catch (e) { }
            return inputText;
          },
          relations: ["需求分析"],
        },
        {
          label: "模板润色",
          id: webCpu.appConfig.aigcAppFlow.improveTemplate,
          query: {
            apiName: webCpu.appConfig.defaultModel.apiName,
            model: webCpu.appConfig.defaultModel.model,
          },
          relations: ["模板生成", "质量约束"],
          checkJSON: true,
        },
      ];
      this.adapter = webCpu.initAdapter(this.interface);
    },
    getHistoryVersion: function (versionId, callback) {
      this.adapter.traceVersions({ versionId: versionId }, function (tData) {
        if (typeof callback === "function") {
          callback(tData);
        }
      });
    },
    updateModelList(callback) {
      this.adapter.getModelList({}, (tData) => {
        if (tData.ret === 0) {
          tData.data = tData.data || {};
          let modelInfo = this.transformModels(tData.data);
          webCpu.appConfig.priceMap = modelInfo.priceMap || {};
          webCpu.appConfig.modelMap = modelInfo.modelMap || {};
          console.log("modelList info: ", modelInfo);
          if (typeof callback === "function") {
            callback(modelInfo);
          }
        }
      });
    },
    updateLoginBar(elem) {
      let lang = window.lang || "zh";
      let app = {
        url: "/mainApp/app/loginRegItem.js",
        key: "transweb_loginRegItem",
        cardName: "loginRegCard",
        dsl: {
          data: {
            position: "top",
            loginedMenu: [
              {
                label: webCpu.messages[lang].myPpt,
                action: function (d, callback) {
                  aigcInterface.openAgentListDialog();
                  d.loading = false;
                }
              },
              {
                label: webCpu.messages[lang].historyRecord,
                action: function (d, callback) {
                  dialogMap.openDocumentApp(
                    webCpu.appConfig.aigcHistory,
                    {
                      data: {
                        content: {
                          isSolo: true,
                        },
                        query: {
                          documentId: d.documentId || "",
                        },
                      },
                    },
                    {
                      title: webCpu.messages[lang].historyRecord,
                      callback: callback,
                    },
                    {
                      width: "100%",
                      height: "100%",
                    }
                  );
                },
              },
            ],
          },
        },
      }
      webCpu.updateView(elem, app);
    },
    getResultByVersion: function (versionId, callback) {
      this.adapter.traceVersions({ versionId: versionId }, function (tData) {
        let ret = null;
        if (tData && tData.ret === 0) {
          tData.data = tData.data || [];
          if (tData.data.length > 0) {
            for (let i = 0; i < tData.data.length; i++) {
              let item = tData.data[i];
              item.result = item.result || "";
              let temp = item.result;
              try {
                temp = WebTool.extractJSON(item.result);
                temp = JSON.stringify(temp);
              } catch (e) { }
              if (typeof versionId !== "string") {
                versionId = JSON.stringify(temp);
              }
              if (versionId === item.versionId || temp === versionId) {
                ret = item;
                break;
              }
            }
          }
        }
        if (typeof callback === "function") {
          callback(ret);
        }
      });
    },
    removeAgentItem(d) {
      let query = {
        _id: d._id,
        key: "_id",
        table: "pptItem",
      };
      let _self = this;
      this.adapter.deleteDocumentData(query, function (rData) {
        if (_self.currentListApp.card) {
          webCpu.fresh(_self.currentListApp.card.task);
        }
      });
      if (d.document) {
        let arr = d.document.split("/");
        this.adapter.removeDocumentItem(
          {},
          function (tData) {
            if (tData.code === 0) {
              _self.$message({
                type: "success",
                message: webCpu.messages[lang].removeSuccessTips,
              });
            }
          },
          {
            folderName: localStorage.folderName,
            name: arr[arr.length - 1],
          }
        );
      }
    },
    openAgentListDialog: function (app) {
      app = app || webCpu.appConfig.agentListApp;
      this.currentListApp = app;
      let _self = this;
      app.dsl = app.dsl || {};
      app.dsl.methods = app.dsl.methods || {};
      app.dsl.methods.handleClickButton = function (d, config) {
        if (config.label === "删除") {
          this
            .$confirm("确认删除吗？", "确认提示", {
              confirmButtonText: "确认",
              cancelButtonText: "取消",
              type: "warning",
            })
            .then(() => {
              _self.removeAgentItem(d);
            });
        } else if (config.label === "编辑") {
          let params = WebTool.getQueryParams(location.href);
          let _id = params.id;
          params.id = d.documentId;
          params.mode = "edit";
          let from = WebTool.urlQuery(location.href, "from");
          if (flag) {
            params.from = from;
          }
          let url = WebTool.attachParams(
            location.origin + location.pathname,
            params
          );
          if ((window.parent === window && _id) || _self.api) {
            location.href = url;
          } else {
            window.open(url, "_blank");
          }
        } else {
        }
      };
      app.dsl.methods.handleClickItem = function (d, config) {
        let from = WebTool.urlQuery(location.href, "from");
        if (config.prop === "documentId") {
          WebTool.copyString(d.documentId);
          this.$message({
            type: "success",
            message: "文档 ID 已复制到剪贴板",
          });
        } else {
          let url = `${location.origin}?id=${d.documentId}`;
          if (from) {
            url += "&fromAccount=" + from;
          }

          if (_self.api) {
            location.href = url;
          } else {
            window.open(url, "_blank");
          }
        }
      };
      window.dialogMap.openAppDialog(app, webCpu.messages[lang]["myPpt"]);
    },
    openLoginDialog: function (card, callback, style) {
      style = style || {
        width: "95%",
        height: "95%",
        maxWidth: WebTool.adjustSize(["500px", "500px", "800px"]),
        maxHeight: "400px",
        position: "relative",
        margin: "auto",
        background: "linear-gradient(to bottom right, #6951FF, #10EDC5)",
        "border-radius": "5px",
        overflow: "hidden",
        border: "solid 1px #ddd",
      };
      let app = {
        style: {
          paddingTop: "10px",
        },
        url: webCpu.documentPrefix + "/mainApp/app/loginReg.js",
        key: "transweb_loginReg",
      };
      app.callback = function (cc, dd, tt) {
        dd.task.confirmCallback = function (query) {
          let _that = this;
          _that.vueItem.isLogining = true;
          aigcInterface.adapter.login(
            query,
            (dd) => {
              _that.vueItem.isLogining = false;
              let _self = _that.vueItem;
              if (dd.data && (dd.data.folderName || dd.data.account)) {
                localStorage.logined = true;
                localStorage.folderName = dd.data.folderName;
                localStorage.setItem(
                  "userName",
                  dd.data["name_" + lang] || dd.data.name || ""
                );
                webCpu.transwebToken = dd.data.token;
                localStorage.setItem("transweb-token", dd.data.token);
                webCpu.CardItem.dismissMask(card);
                if (typeof callback === "function") {
                  callback(dd.data);
                }
                if (webCpu.cards.loginRegItem) {
                  webCpu.fresh(webCpu.cards.loginRegItem);
                }
              } else {
                _self.$message({
                  type: "warning",
                  message: dd.message,
                });
              }
            },
            "json"
          );
        };
      };

      let title = "👤 登录 / 注册";

      webCpu.renderCardDialog(
        card,
        app,
        {
          dialogName: "regLoginDialog",
          title: title,
          closeType: "back",
          headerHidden: true,
          titleStyle: {
            background: "var(--el-color-primary-light-9)",
            color: "var(--el-color-primary)",
          },
        },
        style,
        {
          padding: "0px",
        }
      );
    },
    updateLoginStatus() {
      let card = webCpu.cards.loginRegCard;
      if (card && card.task && card.task.vueItem) {
        webCpu.fresh(card);
      }
    },
    renderRechargeDialog(card, app, style) {
      style = style || {
        width: "95%",
        height: "95%",
        background: "linear-gradient(to bottom right, #6951FF, #10EDC5)",
        "border-radius": "5px",
        overflow: "hidden",
        border: "solid 1px #ddd",
      };
      card = card || document.body;
      app = app || {
        url: webCpu.documentPrefix + "/mainApp/app/recharge.vue",
        className: "ElementVueItem",
        dsl: {
          data: {
            productList: [
              {
                price: 500,
                tokens: 5000,
                id: "tokens_70000",
              },
              {
                price: 1000,
                tokens: 10000,
                id: "tokens_10000",
              },
              {
                price: 2000,
                tokens: 21000,
                id: "tokens_70000",
              },
              {
                price: 5000,
                tokens: 60000,
                id: "tokens_70000",
              },
              {
                price: 30000,
                tokens: 350000,
                id: "tokens_350000",
              },
              {
                price: 95000,
                tokens: 1000000,
                id: "tokens_1000000",
              },
            ],
          },
        },
      };
      let _self = this;
      app.dsl = app.dsl || {};
      app.dsl.methods = {
        successCallback: function () {
          this.$message({
            type: "success",
            message: "充值成功",
          });
          let vItem = app.card.task.vueItem;
          clearTimeout(vItem.timer);
          webCpu.CardItem.dismissMask(card);
          _self.updateLoginStatus();
        },
      };
      webCpu.CardItem.renderCardDialog(
        card,
        app,
        {
          title: "💰 充值",
          titleStyle: {
            background: "var(--el-color-primary-light-9)",
            color: "var(--el-color-primary)",
          },
          renderMode: "stack",
          closeType: "back",
          headerHidden: true,
          dialogName: "rechargeDialog",
          closeCallback: function () {
            if (app.card && app.card.task && app.card.task.vueItem) {
              clearTimeout(app.card.task.vueItem.timer);
              _self.updateLoginStatus();
              if (app.card.task.vueItem.orderState !== "SUCCESS") {
                app.card.task.vueItem.cancleOrder();
              }
              webCpu.CardItem.dismissMask(card);
            }
          },
        },
        style
      );
    },
    getUserInfo(callback) {
      this.adapter.getUserInfo({}, function (tData) {
        if (tData.ret === 0) {
          let appData = tData.data.appData;
          if (appData) {
            delete tData.data.appData;
          }
        }
        if (typeof callback === "function") {
          callback(tData);
        }
      });
    },
    checkLogined(callback, eCallback) {
      // 如果已有登录检查 Promise，复用它
      if (this.checkLoginPromise) {
        this.checkLoginPromise.then(callback).catch(eCallback);
        return;
      }

      let _self = this;
      // 创建唯一的登录检查 Promise
      this.checkLoginPromise = new Promise((resolve, reject) => {
        this.getUserInfo((tData) => {
          if (tData.ret === 0) {
            localStorage.logined = true;
            localStorage.folderName = tData.data.folderName;
            resolve(tData);
          } else {
            // 登录失败逻辑（保持你的原样）
            console.log("用户未登录，需弹出登录框");

            _self.openLoginDialog(document.body, (userData) => {
              if (typeof callback === "function") {
                resolve(userData);
              }
            });
            let currentCard = webCpu.currentCard;
            if (currentCard && currentCard.task && currentCard.task.vueItem) {
              let vueItem = currentCard.task.vueItem;
              if (typeof vueItem.dismissLoadingTips === "function") {
                vueItem.dismissLoadingTips();
              }
            }
            reject(tData);
          }
        });
      }).finally(() => {
        // 无论成功或失败，都释放锁
        this.checkLoginPromise = null;
      });
      // 让调用方继续执行之前的逻辑
      this.checkLoginPromise.then(callback).catch(eCallback);
    },
    cancelStepLoading() {
      let app = webCpu.appConfig.generateProgressApp;
      if (app.parentItem) {
        if (app.parentItem.querySelector(".cardItemMask")) {
          app.parentItem.querySelector(".cardItemMask").remove();
        } else {
          if (webCpu.CardItem && webCpu.CardItem.dismissMask) {
            webCpu.CardItem.dismissMask(app.parentItem);
          }
        }
      }
    },
    finishStepLoading(callback) {
      let app = webCpu.appConfig.generateProgressApp;
      if (app.card && app.card.task && app.card.task.vueItem) {
        app.card.task.vueItem.done(callback);
      }
    },
    startStepLoading(elem, stepData) {
      let tData = {
        title: `正在构建你的应用…`,
        expectedDuration: 60 * 1000,
        enabled: true,
        showPercentInline: true,
        steps: webCpu.appConfig.aigcWorkflow.map((item) => {
          return item.label;
        }),
      };
      stepData = stepData || {};
      stepData = webCpu.attachAttribute(stepData, tData);
      elem = elem || document.body;
      let app = webCpu.appConfig.generateProgressApp;
      app.cardName = "generateProgressPanelCard";
      app.dsl = app.dsl || {};
      app.dsl.data = app.dsl.data || {};
      app.dsl.data.content = stepData || {};
      app.parentItem = elem;
      webCpu.renderCardDialog(elem, app, {
        dialogName: "progressDialog",
        headerHidden: true,
      });
    },
    recordDataVersion: function (content, baseId, callback, documentId) {
      documentId = documentId || WebTool.urlQuery(location.href, "id");

      let params = {
        questionItem: {
          type: "uploadText",
          result: content,
          baseId: baseId,
          documentId: documentId,
        },
      };
      this.adapter.recordVersion(params, function (tData) {
        if (typeof callback === "function") {
          callback(tData);
        }
      });
    },
    setDocumentAttribute(attr, callback, errCallback) {
      attr = attr || {};
      attr.table = "pptItem";
      attr.cKey = "documentId";
      attr.documentId = attr.documentId || WebTool.urlQuery(location.href, "id") || this.documentMeta.documentId;
      this.adapter.setDocumentAttribute(attr, function (tData) {
        if (tData.ret === 0) {
          if (typeof callback === "function") {
            callback(tData);
          }
        } else {
          if (typeof errCallback === "function") {
            errCallback(tData);
          }
        }
      });
    },
    createAgentItem: function (inputText, callback, errCallback) {
      this.adapter.getAppTemplate(
        {},
        (code) => {
          this.requestPrompt(
            inputText,
            webCpu.appConfig.knowledgeApp,
            {},
            (kData, kUsage) => {
              if (typeof kData === "string") {
                kData = JSON.parse(kData);
              }

              this.requestPrompt(
                kData,
                webCpu.appConfig.characterProfile,
                {},
                (cData, cUsage) => {
                  let tKnowledge = kData;

                  if (typeof cData === "string") {
                    cData = JSON.parse(cData);
                  }
                  let exampleList = kData.faq.map(item => {
                    return {
                      title: item.name || (item.tags.join(",") + "方面问题"),
                      desc: item.question
                    }
                  })
                  let opList = {
                    ops: [{
                      op: "js.data.update",
                      path: "title",
                      value: cData.roleProfile.name,
                    }, {
                      op: "js.data.update",
                      path: "subtitle",
                      value: cData.roleProfile.identity,
                    }, {
                      op: "js.data.update",
                      path: "introduce",
                      value: cData.roleProfile.mission,
                    }, {
                      op: "js.data.update",
                      path: "exampleList",
                      raw: true,
                      value: `${JSON.stringify(exampleList)}`,
                    }]
                  }
                  console.log("cData.roleProfile: ", cData.roleProfile);
                  const result = VueSfcEditorPlugin.applyWithResult(code, opList);
                  if (result && result.code) {
                    code = result.code;
                  }

                  this.getHistoryVersion(tKnowledge, (tData) => {
                    tData = tData.data || tData || [];
                    let knowledge = tData[0] || {};
                    let prompt = WebTool.objectToMarkdown(cData.roleProfile.soulMd);
                    WebTool.cloneAppItem(
                      code,
                      prompt + "\n" + webCpu.appConfig.constraintMap["asd-ste100"],
                      (id) => {
                        if (knowledge._id) {
                          this.setDocumentAttribute({
                            key: "knowledges",
                            value: [{
                              id: knowledge._id,
                              name: kData.title
                            }],
                            documentId: id
                          },
                            (tData) => {
                              let params = {
                                knowledge: `${location.origin}?id=${webCpu.appConfig.knowledgeApp}&dataId=${knowledge._id}&solo=true`,
                                agent: `${location.origin}?id=${id}&solo=true`,
                                documentId: id,
                                roleProfile: cData.roleProfile,
                                rawData: [kUsage, cUsage]
                              }
                              if (typeof callback === "function") {
                                callback(params);
                              }
                              console.log("result: ", params);
                            });
                        }
                        else {
                          if (typeof callback === "function") {
                            let params = {
                              agent: `${location.origin}?id=${id}&solo=true`,
                              documentId: id,
                              roleProfile: cData.roleProfile,
                              rawData: [kUsage, cUsage]
                            }
                            console.log(params)
                            callback(params);
                            console.log("result: ", params);
                          }
                        }
                      }
                    );
                  },
                    (e) => {
                      if (typeof errCallback === "function") {
                        errCallback();
                      }
                    }
                  );
                }
              );
            },
            errCallback
          );

        }, {
        url: webCpu.appConfig.templateMap.agent
      })

    },
    createAigcApp: function (inputText, callback, stepLoading, errCallback) {
      if (stepLoading) {
        let elem = stepLoading.elem || document.body;
        this.startStepLoading(elem, stepLoading.data);
      }
      this.lineRequest(
        inputText,
        webCpu.appConfig.aigcWorkflow,
        (tData) => {
          console.log("workflow result: ", tData);
          let json0 = WebTool.extractJSON(tData[0].outputText);
          let json1 = WebTool.extractJSON(tData[1].outputText);
          let json2 = WebTool.extractJSON(tData[3].outputText);
          webCpu.appConfig = webCpu.appConfig || {};
          webCpu.appConfig.currentAppType =
            webCpu.appConfig.currentAppType || json0.inputType;

          this.adapter.getAppTemplate(
            {},
            (code) => {
              let params = {
                prompt: `# Role
${json1.role}

# Objective
${json0.description}

# JSON Output Enforcement（JSON输出强约束）

请严格按照以下要求生成输出：

你必须只输出一个合法的 JSON 对象，不得包含任何额外内容。

1. 输出唯一性要求
仅允许输出 一个 JSON 对象
禁止输出任何解释、说明、思考过程或多余文本
禁止使用 Markdown、代码块标记（如 \`\`\`）
2. JSON 格式强约束
输出必须为标准 JSON，可被 JSON.parse() 直接解析
所有 key 必须使用 双引号
所有 string 类型 value 必须使用 双引号
禁止使用单引号
3. 语法零容忍规则（必须满足）

以下情况一律禁止：

❌ 尾随逗号（trailing comma）
❌ 注释（// 或 /* */）
❌ 多余非 JSON 文本
❌ 未闭合的括号或引号
❌ 换行中夹杂非 JSON 字符
4. 输出结构要求
必须是一个完整 JSON 对象 { ... }
不能是数组、字符串或其他数据类型
所有字段必须合法 JSON 类型（string / number / boolean / object / array / null）
5. 强制约束（关键）

如果无法生成合法 JSON：
→ 仍必须输出一个最小合法 JSON，例如：{}

在生成 JSON 前，请在内部验证其可解析性，但不要输出验证过程。

# Constraints
${JSON.stringify(json1.constraints)}  

# Requirements
${JSON.stringify(json1.requirements)}  

# Output Schema
${typeof json0.struct === "object" ? JSON.stringify(json0.struct) : json0.struct
                  }

# Output Example
${typeof json0.example === "object"
                    ? JSON.stringify(json0.example)
                    : json0.example
                  }

`,
              };

              if (typeof json0.example === "object") {
                json0.example = JSON.stringify(json0.example);
              }

              let base64 = WebTool.stringToDataURL(`<template>
              <div class="rootContainerItem tw-w-full tw-h-full tw-p-4 tw-overflow-auto">
              ${json2.html}
              </div>
            </template>
            <script>
               export default {
                "name": "-",
                "data": function() {
                  return {
                    accountData: ${json0.example}
                  } 
                }
               }
            </script>
            <style>
              ${json2.css}
            </style>
            `);
              params.content = base64;
              code = code.bindData(params);

              params = Object.assign(params, {
                title: json0.title,
                introduce: json0.introduce,
                description: json0.description,
                type: json0.type,
                category: json0.category,
                grades: json0.grades,
                tags: json0.tags,
                icon: json0.icon,
                role: json1.role,
              });

              if (json0.inputType !== "text") {
                params.apiName = webCpu.appConfig.defaultImageModel.apiName;
                params.model = webCpu.appConfig.defaultImageModel.model;
              } else {
                params.apiName = webCpu.appConfig.defaultModel.apiName;
                params.model = webCpu.appConfig.defaultModel.model;
              }

              let opList = {
                ops: [
                  {
                    op: "js.data.update",
                    path: "title",
                    value: params.title,
                  },
                  {
                    op: "js.data.update",
                    path: "introduce",
                    value: params.introduce,
                  },
                  {
                    op: "js.data.update",
                    path: "defaultTemplate",
                    value: encodeURIComponent(params.prompt),
                  },
                  {
                    op: "js.data.update",
                    path: "inputPlaceholder",
                    value: `${json1.input}`,
                  },
                  {
                    op: "js.data.update",
                    path: "icon",
                    value: `${json1.icon}`,
                  },
                  {
                    op: "js.data.update",
                    path: "exampleList",
                    raw: true,
                    value: JSON.stringify(json1.inputExamples),
                  },
                ],
              };

              const result = VueSfcEditorPlugin.applyWithResult(code, opList);

              WebTool.exportWebApp(this, result.code, params, null, (d) => {
                if (stepLoading) {
                  this.finishStepLoading(() => {
                    if (typeof callback === "function") {
                      callback(d);
                    }
                  });
                } else {
                  if (typeof callback === "function") {
                    callback(d);
                  }
                }
              });
            },
            {
              url: webCpu.appConfig.templateMap[
                webCpu.appConfig.currentAppType || "text"
              ],
            }
          );
        },
        (e) => {
          console.log("createAigcApp error: ", e);
          if (typeof errCallback === "function") {
            errCallback();
          }
        }
      );
    },
    createWorkflow: function (inputText, callback, stepLoading) {
      let query = {
        content: webCpu.appConfig.workflowPrompt,
        context: inputText,
      };

      let count = 0;

      let tRequest = (query) => {
        this.request(
          query,
          (tData) => {
            let planData = null;
            try {
              planData = WebTool.extractJSON(tData.usage.result);
              if (!planData) {
                if (count < 5) {
                  count++;
                  console.log(
                    `AI 生成 workflow 内容格式不正确(第 ${count} 次)，正在重试。`
                  );
                  tRequest(query);
                  return false;
                } else {
                  console.log("5 次请求 workflow 内容格式有误");
                  return false;
                }
              }
              planData = planData.pipeline || planData;
            } catch (e) {
              if (count < 5) {
                count++;
                console.log(
                  `AI 生成 workflow 内容格式不正确(第 ${count} 次)，正在重试。`
                );
                tRequest(query);
                return false;
              } else {
                console.log("5 次请求 workflow 内容格式有误");
                return false;
              }
            }
            let arr = planData.steps || [];
            let i = 0;
            const requestNext = () => {
              let index = i;
              if (index < arr.length) {
                let item = arr[index];
                let currentInputText =
                  index === 0 ? inputText : arr[index - 1].output;
                let requirementStr = `输入:${currentInputText}，输出:${item.output}`;
                stepLoading = stepLoading || {};
                stepLoading.data = stepLoading.data || {};
                let title = `正在生成第 ${index + 1} / ${arr.length
                  } 步的应用：${item.label}`;
                stepLoading.data.title = title;
                this.createAigcApp(
                  requirementStr,
                  (documentId) => {
                    item.value = documentId;
                    i++;
                    requestNext(); // 启动请求链
                  },
                  stepLoading
                );
              } else {
                WebTool.generateWorkflowApp(
                  this,
                  {
                    title: planData.title,
                    name: planData.name,
                    role: planData.role,
                    description: planData.goal,
                    introduce: planData.introduce,
                  },
                  arr,
                  callback,
                  webCpu.appConfig.workflowTemplate
                );
                if (stepLoading) {
                  this.finishStepLoading();
                }
              }
            };
            requestNext(); // 启动请求链
          },
          (e) => {
            console.log("create workflow error: ", e);
          }
        );
      };

      tRequest(query);
    },
    lineRequest: function (inputText, arr, callback, errorCallback) {
      arr = arr || [];
      if (!inputText) {
        console.warn("the inputText of lineRequest is empty");
        return false;
      }

      // 清理历史输入输出数据
      arr = arr.map((item) => {
        delete item.inputText;
        delete item.outputText;
        delete item.retryCount; // 初始化重试次数
        return item;
      });

      // 提取依赖关联项的输出，拼接为上下文 JSON
      let getInputText = function (list, index) {
        let ret = {};
        for (let i = 0; i < index; i++) {
          let label = list[i].label;
          let relations = list[index].relations || [];
          if (relations.indexOf(label) !== -1) {
            ret[label] = list[i].outputText;
          }
        }
        return JSON.stringify(ret);
      };

      let i = 0;
      const MAX_NODE_RETRY = 3; // 单个节点的最大重试次数

      const requestNext = () => {
        let index = i;
        if (index < arr.length) {
          let item = arr[index];
          item.retryCount = item.retryCount || 0;

          // 安全获取上一节点的输出，修复负索引 (-1) 的缺陷
          let previousOutputText = "";
          if (index > 0 && arr[index - 1]) {
            previousOutputText = arr[index - 1].outputText || "";
          }

          // 根据是否有 relations 构建 inputText
          if (item.label && item.relations && item.relations.length) {
            item.inputText = getInputText(arr, index);
          } else {
            item.inputText = index === 0 ? inputText : previousOutputText;
          }

          // 校验/处理输入内容
          if (item.checkInput && typeof item.checkInput === "function") {
            try {
              item.inputText = item.checkInput(item.inputText);
            } catch (e) {
              console.error(`检查输入内容失败: `, e);
              if (typeof errorCallback === "function") {
                errorCallback(e);
              }
              return false; // 终止整个流程
            }
          }

          // 统一处理重试/报错中断逻辑
          const handleErrorRetry = (err) => {
            err = err || {};
            // 致命错误直接终端
            if (
              err.ret === 1 ||
              err.ret === 2 ||
              item.retryCount >= MAX_NODE_RETRY
            ) {
              console.error(
                `节点 [${item.label || index}] 失败，停止重试:`,
                err
              );
              if (typeof errorCallback === "function") {
                errorCallback(err);
              }
              return false;
            }

            // 非致命错误且未超限，增加计数并重试当前节点
            item.retryCount++;
            console.warn(
              `节点 [${item.label || index}] 请求失败，正在进行第 ${item.retryCount
              } 次重试...`
            );
            requestNext();
          };

          // 发起单个 prompt 请求
          this.requestPrompt(
            item.inputText,
            item.id,
            item.query || {},
            (response) => {
              try {
                item.outputText = response; // 更新当前项的 outputText
                if (item.checkJSON && typeof WebTool !== "undefined") {
                  WebTool.extractJSON(item.outputText);
                }
                if (typeof item.callback === "function") {
                  item.callback(index, item, arr);
                }
                i++; // 成功后移动至下一个节点
                requestNext(); // 处理下一个请求
              } catch (err) {
                console.error(
                  `解析或回调处理 ${item.label || index} 失败: `,
                  err
                );
                handleErrorRetry(err);
              }
            },
            (e) => {
              handleErrorRetry(e);
            }
          );
        } else {
          // 队列全部处理完毕
          if (typeof callback === "function") {
            callback(arr); // 返回处理完毕的数组
          }
        }
      };

      requestNext(); // 启动请求链
    },

    /**
     * 单个 Prompt 请求封装（含自动自动重试 5 次逻辑）
     */
    requestPrompt: function (
      inputText,
      id,
      params = {},
      callback,
      errorCallback
    ) {
      let query = {
        documentId: id,
        context: inputText,
      };
      Object.assign(query, params);

      let count = 0;
      const MAX_PROMPT_RETRY = 5;

      let tRequest = (reqQuery) => {
        count++;
        this.request(
          reqQuery,
          (dd) => {
            if (dd.ret !== 0) {
              if (dd.ret === 2) {
                console.error(`请求失败，token 不足，请充值`);
                this.renderRechargeDialog();
                if (typeof errorCallback === "function") errorCallback(dd);
                return false;
              }
              else if (dd.ret === 1) {
                console.error(`请求失败，账号异常，请重新登录`);
                this.openLoginDialog();
                if (typeof errorCallback === "function") errorCallback(dd);
                return false;
              }
              else {
                console.error(`请求失败，未知错误: ${dd.message || "无错误信息"}`);
                if (typeof errorCallback === "function") errorCallback(dd);
                return false;
              }
            }
            try {
              dd = dd || {};
              dd.usage = dd.usage || {};
              let temp = dd.usage.result || "";
              if (typeof callback === "function") {
                callback(temp, dd.usage);
              }
            } catch (e) {
              console.warn(
                e,
                `请求结果解析有误，准备重试 (已尝试 ${count} 次)`
              );
              e = e || {};
              if (e.ret === 1 || e.ret === 2) {
                if (typeof errorCallback === "function") errorCallback(e);
                return false;
              }

              if (count < MAX_PROMPT_RETRY) {
                tRequest(reqQuery); // 重试，避免多余的 count++
              } else {
                console.error(`多次请求内容失败，已达上限`);
                if (typeof errorCallback === "function") {
                  errorCallback(e);
                }
              }
            }
          },
          (err) => {
            err = err || {};
            if (err.ret === 1 || err.ret === 2 || count >= MAX_PROMPT_RETRY) {
              if (typeof errorCallback === "function") {
                errorCallback(err);
              }
            } else {
              console.warn(`网络/接口层异常，准备重试 (已尝试 ${count} 次)`);
              tRequest(reqQuery);
            }
          }
        );
      };

      tRequest(query);
    },

    /**
     * 底层网络 API 发送
     */
    request: function (query, callback, errorCallback) {
      query = query || {};
      if (typeof query === "string") {
        query = {
          content: "你是一个 AI 助手，专注于帮助用户完成各种任务。",
          context: query,
        };
      }

      // 获取全局 documentEditor 账号状态
      if (
        typeof webCpu !== "undefined" &&
        webCpu.cards &&
        webCpu.cards.documentEditor &&
        webCpu.cards.documentEditor.task
      ) {
        let vueItem = webCpu.cards.documentEditor.task.vueItem || {};
        let meta = vueItem.documentMeta || {};
        query.rootAccount = meta.rootAccount || "";
      }

      // 从 URL 提取环境配置
      if (typeof WebTool !== "undefined") {
        let apiName = WebTool.urlQuery(location.href, "apiName");
        let model = WebTool.urlQuery(location.href, "model");
        if (apiName) query.apiName = apiName;
        if (model) query.model = model;
      }

      if (!query.documentId && this.interface && this.interface.aigcGateway) {
        Object.assign(query, this.interface.aigcGateway.query || {});
      }

      // 登录鉴权后调用网关接口
      if (typeof this.checkLogined === "function") {
        this.checkLogined((tData) => {
          if (tData && tData.ret === 0) {
            if (tData.data.tokenLimit < 0) {
              this.renderRechargeDialog();
              return false;
            }
            if (
              this.adapter &&
              typeof this.adapter.aigcGateway === "function"
            ) {
              this.adapter.aigcGateway(
                query,
                (dd) => {
                  dd = dd || {};
                  if (typeof callback === "function") {
                    callback(dd);
                  }
                  // 事件广播
                  if (typeof webCpu !== "undefined" && webCpu.mitt) {
                    dd.usage = dd.usage || {};
                    let temp = dd.usage.result || "";
                    webCpu.mitt.emit("taskDone", {
                      inputText: query.context,
                      outputText: temp,
                    });
                  }
                },
                "json",
                errorCallback
              );
            } else {
              console.error("adapter.aigcGateway 适配器不存在");
              if (typeof errorCallback === "function") errorCallback();
            }
          } else {
            console.error("用户登录状态校验失败");
            if (typeof errorCallback === "function") errorCallback(tData);
          }
        }, errorCallback);
      } else {
        console.error("checkLogined 方法不存在");
        if (typeof errorCallback === "function") errorCallback();
      }
    },
    /**
     * 流式请求并带有打字机渲染效果
     * @param {Object} query 请求参数
     * @param {Object} options 配置与回调
     */
    streamRequest: async (
      query,
      {
        immediateFinish = false,
        maxQueueThreshold = 100,
        onMessage = () => { },
        onStreamFinished = () => { },
        onTypingFinished = () => { },
        onError = () => { },
        onAction = () => { },
      } = {}
    ) => {
      // ---------- 局部状态（每次调用独立） ----------
      let isStreamFinished = false;
      let isTypingFinished = false; // 防止重复触发结束回调
      let responseText = "";
      let fullContent = "";
      let typewriterTimer = null; // 改为局部变量，避免实例冲突
      const typewriterQueue = [];
      let typingStart = false;
      const abortController = new AbortController();

      // ---------- 核心控制：强制结束打字（输出所有剩余字符） ----------
      const forceFinishTyping = () => {
        if (typewriterTimer) {
          clearInterval(typewriterTimer);
          typewriterTimer = null;
        }
        if (typewriterQueue.length > 0) {
          const remaining = typewriterQueue.join("");
          responseText += remaining;
          typewriterQueue.length = 0;
          onMessage(responseText, remaining);
        }
        if (!isTypingFinished) {
          isTypingFinished = true;
          onTypingFinished(responseText);
        }
        typingStart = false; // 允许下次重新启动（如有必要）
      };

      // ---------- 进阶：自适应打字机 ----------
      const startTypewriter = () => {
        if (typingStart) return;
        typingStart = true;

        if (typewriterTimer) {
          clearInterval(typewriterTimer);
          typewriterTimer = null;
        }

        typewriterTimer = setInterval(() => {
          const queueLen = typewriterQueue.length;
          if (queueLen > 0) {
            let step = 1;
            if (queueLen > maxQueueThreshold) {
              step = Math.min(Math.ceil(queueLen / 10), 20);
            }
            const chars = typewriterQueue.splice(0, step).join("");
            responseText += chars;
            onMessage(responseText, chars);
          } else {
            if (isStreamFinished) {
              clearInterval(typewriterTimer);
              typewriterTimer = null;
              if (!isTypingFinished) {
                isTypingFinished = true;
                onTypingFinished(responseText);
              }
              typingStart = false;
            }
          }
        }, 25);
      };

      // ---------- 网络请求逻辑 ----------
      (async () => {
        try {
          const url = webCpu.documentPrefix + "/gpt/aiStreamRequest";
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "transweb-token": localStorage["transweb-token"],
            },
            body: JSON.stringify(query),
            signal: abortController.signal,
          });

          if (!response.ok || !response.body) {
            throw new Error(`HTTP ${response.status}`);
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let chunkBuffer = "";

          // 处理单行数据（包括 ret 检测）
          const processLine = (line) => {
            const trimmed = line.trim();
            if (!trimmed || trimmed === "data: [DONE]") return false;

            if (trimmed.startsWith("data: ")) {
              try {
                const data = JSON.parse(trimmed.replace(/^data:\s*/, ""));
                if (data.content) {
                  fullContent += data.content;
                  typewriterQueue.push(...data.content.split(""));
                  startTypewriter();
                }
                // reasoning_content 已移除（未使用）
              } catch (e) {
                // 忽略解析错误
              }
            } else {
              // 处理纯 JSON（如 ret 状态）
              try {
                const data = JSON.parse(trimmed);
                if (data.ret === 1) {
                  onAction("LOGIN");
                  abortController.abort();
                  isStreamFinished = true;
                  onStreamFinished(fullContent);
                  forceFinishTyping();
                  return true; // 通知需要终止循环
                } else if (data.ret === 2) {
                  onAction("RECHARGE");
                  abortController.abort();
                  isStreamFinished = true;
                  onStreamFinished(fullContent);
                  forceFinishTyping();
                  return true;
                }
              } catch (e) {
                // 非 JSON 忽略
              }
            }
            return false;
          };

          while (true) {
            const { value, done } = await reader.read();

            if (done) {
              isStreamFinished = true;
              onStreamFinished(fullContent); // 即使内容为空也调用
              webCpu.mitt.emit("taskDone", {
                inputText: query.context,
                outputText: fullContent,
              });

              if (immediateFinish) {
                forceFinishTyping();
              } else if (typewriterQueue.length === 0) {
                // 队列已空，直接结束打字
                if (!isTypingFinished) {
                  isTypingFinished = true;
                  onTypingFinished(responseText);
                }
              } else {
                // 队列非空，确保打字机正在运行
                if (!typingStart) {
                  startTypewriter();
                }
                // 等待定时器自行清空队列并结束
              }
              break;
            }

            chunkBuffer += decoder.decode(value, { stream: true });

            const lines = chunkBuffer.split("\n");
            chunkBuffer = lines.pop() || ""; // 保留未完成行
            // 逐行处理
            for (const line of lines) {
              const shouldBreak = processLine(line);
              if (shouldBreak) {
                // 已调用 forceFinishTyping 和 onStreamFinished，需要跳出 while
                // 通过抛出特殊错误退出循环，由外层 catch 捕获并忽略
                throw new Error("STREAM_ABORTED_BY_RET");
              }
            }
            if (lines.length === 0 && chunkBuffer) {
              processLine(chunkBuffer);
            }
          }
        } catch (err) {
          // 如果是主动中止（ret 触发），则无需额外处理，直接返回
          if (err.message === "STREAM_ABORTED_BY_RET") {
            return;
          }

          // 其他错误：先输出剩余内容，再通知错误
          forceFinishTyping();
          if (!isStreamFinished) {
            isStreamFinished = true;
            onStreamFinished(fullContent);
          }
          onError(err);
        } finally {
          // 最终清理，确保定时器被清除且结束回调被调用（以防万一）
          if (typewriterTimer) {
            clearInterval(typewriterTimer);
            typewriterTimer = null;
          }
          if (!isTypingFinished) {
            // 若队列仍有残留，强制输出
            if (typewriterQueue.length > 0) {
              const remaining = typewriterQueue.join("");
              responseText += remaining;
              typewriterQueue.length = 0;
              onMessage(responseText, remaining);
            }
            isTypingFinished = true;
            onTypingFinished(responseText);
          }
          typingStart = false;
        }
      })();

      return abortController;
    },
    saveContentData(data, id, callback, errCallback) {
      if (!data.content) {
        return false;
      }
      if (data.app) {
        this._saveContentData(data, id, callback, errCallback);
      } else {
        this.adapter.getAgentData(
          {
            agent: webCpu.appConfig.publishInfo.folderName
          },
          (tData) => {
            tData = tData.data || tData;
            let agentMap = {};
            tData.agentList = tData.agentList_zh || tData.agentList || [];
            tData.appList = WebTool.stringToObject(tData.agentList);
            tData.appList = WebTool.copyObject(tData.appList, true);
            tData.appList.map((item) => {
              agentMap[item.name] = item;
              return item;
            });
            data.app = agentMap[webCpu.appConfig.publishInfo.appName];
            this._saveContentData(data, id, callback, errCallback);
          }
        );
      }
    },
    getAgentPrompt(id, callback, errCallback) {
      const execute = (resolve, reject) => {
        this.adapter.getDocumentData(
          {
            table: "pptItem",
            key: "documentId",
            documentId: id,
          },
          (tData) => {
            if (tData.ret === 0 && tData.data && tData.data.length !== 0) {
              tData.data = tData.data[0] || {};
              const prompt = tData.data.prompt || "";
              resolve(prompt);
            } else {
              reject(new Error("Data not found or invalid"));
            }
          },
          {},
          (e) => reject(e)
        );
      };

      // 兼容逻辑：处理 Callback 或返回 Promise
      return this._handleCompatibility(execute, callback, errCallback);
    },
    getPromptBlock(id, key, callback, errCallback) {
      const execute = (resolve, reject) => {
        this.getAgentPrompt(
          id,
          (prompt) => {
            if (prompt) {
              let block = WebTool.getMarkdownBlock(prompt, key);
              if (block) {
                resolve(block);
              } else {
                reject(new Error("Block not found"));
              }
            } else {
              reject(new Error("Prompt is empty"));
            }
          },
          () => resolve(),
          (e) => reject(e)
        );
      };

      return this._handleCompatibility(execute, callback, errCallback);
    },
    updatePromptBlock(id, key, value, callback, errCallback) {
      const execute = (resolve, reject) => {
        this.getAgentPrompt(
          id,
          (prompt) => {
            if (prompt) {
              // resolve();
              let md = WebTool.updateMarkdownBlock(prompt, key, value);
              if (md) {
                this.updateAgentPrompt(id, md, resolve, reject);
              } else {
                reject(new Error("Prompt is empty"));
              }
            } else {
              reject(new Error("Prompt is empty"));
            }
          },
          () => resolve(),
          (e) => reject(e)
        );
      };

      return this._handleCompatibility(execute, callback, errCallback);
    },
    updateAgentPrompt(id, prompt, callback, errCallback) {
      const execute = (resolve, reject) => {
        const attr = {
          value: prompt,
          key: "prompt",
          table: "pptItem",
          cKey: "documentId",
          documentId: id,
        };

        this.adapter.setDocumentAttribute(
          attr,
          (tData) => {
            tData.ret === 0 ? resolve(tData) : reject(tData);
          },
          {},
          (e) => reject(e)
        );
      };

      return this._handleCompatibility(execute, callback, errCallback);
    },
    async analyzeKnowledgeBase(question, knowledgeBases = []) {
      // 1. 边界校验与强转：确保 question 为非空字符串，knowledgeBases 为非空数组
      const safeQuestion = String(question ?? "").trim();

      if (
        !safeQuestion ||
        !Array.isArray(knowledgeBases) ||
        knowledgeBases.length === 0
      ) {
        return "";
      }

      // 2. 规范化构建数据，确保每一个字段都是合法的数据类型
      let tMap = {};
      knowledgeBases.map((kb) => {
        // 兜底对象属性，防止 kb 不是标准对象
        const name = String(kb?.name ?? "未命名知识库").trim();
        const desc = String(kb?.desc ?? kb?.description ?? `${name}知识库`);
        tMap[name] = `${name}:${desc}`;
      });
      tMap["none"] = "没有匹配的知识库";
      const payload = {
        state: `用户正在提问，需要从候选知识库中选出最相关的一个作为上下文。用户问题：${safeQuestion}`,
        questions: {
          knowledgeSelection: {
            type: "choice",
            instructions:
              "根据上述用户问题，以下哪个知识库提供的上下文最为匹配？",
            criteria: tMap,
          },
        },
      };

      try {
        // 3. 发送网络请求，严格带上 Content-Type
        const response = await fetch("/api/jev/decide", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });

        // 4. HTTP 状态码检查
        if (!response.ok) {
          console.warn(
            `System One API 响应异常: \({response.status}\){response.statusText}`
          );
          return {};
        }

        // 5. 安全解析 JSON
        const result = await response.json();

        // 6. 校验返回结构是否满足预期（必须是 Dictionary / Object）
        const choice = result.answers.knowledgeSelection.choice;

        return choice;
      } catch (error) {
        console.error("分析知识库匹配度失败:", error);
        // 静默降级返回空字典，保障上层业务不崩溃
        return "";
      }
    },
    getDataItem(dataId, callback, errCallback, type) {
      const isArray = Array.isArray(dataId);

      // 生成查询条件
      const condition = isArray
        ? {
          _id: {
            $in: dataId,
          },
        }
        : {
          _id: dataId,
        };

      const query = {
        sortField: "result",
        pageNo: 1,
        pageSize: isArray ? dataId.length : 1,
        table: "questionData",
        condition: JSON.stringify(condition),
      };

      this.adapter.getDataItem(query, (tData) => {
        // 未登录
        if (tData.ret === 1) {
          console.log("用户未登录，需弹出登录框");
          this.openLoginDialog(document.body, () => {
            this.getDataItem(dataId, callback, errCallback, type);
          });
          return;
        }

        // 查询失败
        if (
          tData.ret !== 0 ||
          !Array.isArray(tData.data) ||
          tData.data.length === 0
        ) {
          if (typeof errCallback === "function") {
            errCallback(new Error("Data not found"));
          }
          return;
        }

        // 统一解析 result
        const list = tData.data.map((item) => {
          let result = item.result;

          if (type !== "text") {
            try {
              result = WebTool.extractJSON(result) || result;
            } catch (e) { }
          }

          return {
            result,
            ...item,
          };
        });

        if (typeof callback === "function") {
          // 单个 id 返回对象
          if (!isArray) {
            callback(list[0].result, list[0]);
          }
          // 多个 id 返回数组
          else {
            callback(
              list.map((item) => item.result),
              list
            );
          }
        }
      });
    },
    updateResultView(json, app, elem) {
      if (!app || !elem) {
        console.log("updateResultView: app or elem is missing");
        return;
      }
      app = app || {};
      app.dsl = app.dsl || {};
      app.dsl.data = {
        accountData: json,
      };
      elem.innerHTML = "";
      webCpu.updateView(elem, app);
      webCpu.mitt.emit("accountDataModified", json);
    },
    renderAgentApp(id, content, params, style, tStyle) {
      params = params || {};
      if (typeof params === "function") {
        params = {
          callback: params,
          type: "dialog",
        };
      }
      this.getAgentCode(id, (dd) => {
        let app = {
          className: "ElementVueItem",
          task: {
            template: dd.code,
            style: tStyle || {},
            data: {
              content: {
                isSolo: true,
                inputText: params.inputText,
              },
              accountData: content || {},
            },
          },
        };
        let elem = params.elem || document.body;
        if (params.type !== "dialog") {
          webCpu.updateView(elem, app);
        } else {
          webCpu.CardItem.renderCardDialog(
            elem,
            app,
            {
              title: params.title || dd.title || "编辑中",
              titleStyle: {
                background: "var(--el-color-primary-light-9)",
                color: "var(--el-color-primary)",
              },
              closeType: "back",
              dialogName: "agentEditorDialog",
              menu: [
                {
                  label: "确认",
                  action: () => {
                    let accountData = app.card.task.vueItem.accountData;
                    if (typeof params.callback === "function") {
                      params.callback(accountData);
                    }
                  },
                },
              ],
            },
            style || {
              width: "100%",
              height: "100%",
            }
          );
        }
      });
    },
    handleAgentInput(url, callback, errCallback) {
      const reportError = (err) => {
        if (typeof errCallback === "function") {
          errCallback(err);
        } else {
          console.error("[handleAgentInput]", err);
        }
      };

      // 父窗口通过 postMessage 传递输入（URL / 跨域 skill 场景）。
      // settled 保证「URL 参数 / localStorage / postMessage」三者只触发一次回调。
      let settled = false;
      const finish = (value, fromMessage) => {
        if (settled) return;
        settled = true;
        window.removeEventListener("message", onMessage);
        if (typeof callback === "function") {
          callback(value, fromMessage);
        }
      };

      const onMessage = (event) => {
        // 仅接受同源（或显式配置的可信源）消息，防止跨域注入
        const trustedOrigins = [
          window.location.origin,
          ...(webCpu && Array.isArray(webCpu.config && webCpu.config.trustedOrigins)
            ? webCpu.config.trustedOrigins
            : []),
        ];
        if (event && trustedOrigins.indexOf(event.origin) === -1) {
          return;
        }
        const data = event && event.data;
        if (data && data.type === "AGENT_INPUT") {
          finish(data.input != null ? data.input : "", true);
        }
      };
      window.addEventListener("message", onMessage);

      let params;
      try {
        params = WebTool.urlQuery(url || location.href) || {};
      } catch (e) {
        reportError(e);
        params = {};
      }

      const input = params.input;
      const inputItem = params.inputItem;

      if (inputItem) {
        aigcInterface.getDataItem(inputItem, (result, tData) => {
          try {
            const t = WebTool.extractJSON(tData && tData.result);
            finish(JSON.stringify(t));
          } catch (e) {
            reportError(e);
          }
        });
      } else if (params.inputData) {
        try {
          const json = JSON.parse(params.inputData);
          const arr = [];
          for (const k in json) {
            arr.push(json[k]);
          }
          const idArray = arr.map((item) => item.dataId);
          aigcInterface.getDataItem(idArray, (results, items) => {
            try {
              const t = [];
              results.forEach((item, index) => {
                const property = arr[index].property || [];
                let tRet = item;
                if (property.length !== 0 && typeof item !== "string") {
                  tRet = {};
                  for (let i = 0; i < property.length; i++) {
                    const key = property[i];
                    tRet[key] = item[key];
                  }
                }
                if (property.indexOf("(none)") === -1) {
                  tRet = {
                    data: tRet,
                    label: arr[index].label || "",
                  };
                  t.push(tRet);
                }
              });
              if (t && t.length !== 0) {
                finish(JSON.stringify(t));
              }
            } catch (e) {
              reportError(e);
            }
          });
        } catch (e) {
          reportError(e);
        }
      } else if (input) {
        finish(input);
      } else {
        const agentInput = localStorage.agentInput;
        if (agentInput) {
          localStorage.agentInput = "";
          finish(agentInput, true);
        }
        // 否则保持监听，等待父窗口 postMessage 送达
      }
    },
    getCurrentApp() {
      this.adapter.getAgentData({
        agent: webCpu.appConfig.publishInfo.folderName
      }, (tData) => {
        tData = tData.data || tData;
        let agentMap = {};
        tData.agentList = tData.agentList_zh || tData.agentList || [];
        tData.appList = WebTool.stringToObject(tData.agentList);
        tData.appList = WebTool.copyObject(tData.appList, true);
        tData.appList.map((item) => {
          agentMap[item.name] = item;
          return item;
        });
        let app = agentMap[webCpu.appConfig.publishInfo.appName];
        if (typeof webCpu !== "undefined" && webCpu.mitt) {
          webCpu.mitt.emit("currentApp", app);
        }
      })
    },
    getAppData(id, callback, errCallback) {
      this.getAgentCode(
        id,
        (content) => {
          let dslData = webCpu.getDslData(content.code);
          if (typeof callback === "function") {
            let tData = dslData.data();
            let base64 = tData.currentAppItem.task.template;
            let code = WebTool.base64ToUtf8(base64);
            dslData = webCpu.getDslData(code);
            tData = dslData.data();
            tData.accountData = tData.accountData || tData.content || {};
            callback(tData.accountData, content);
          }
        },
        errCallback
      );
    },
    getAgentCode(id, callback, errCallback) {
      this.adapter.getDocumentData(
        {
          table: "pptItem",
          key: "documentId",
          documentId: id,
        },
        (tData) => {
          if (!tData.data || !tData.data[0]) {
            console.log("no document item.");
            if (typeof errCallback === "function") {
              errCallback();
            }
            return false;
          }
          let doc = tData.data[0];
          let param = {
            url: webCpu.documentPrefix + doc.document,
          };
          this.adapter.getDocumentItem(
            { callback: "transweb_" + id },
            (rData) => {
              try {
                if (typeof rData === "string") {
                  rData = eval(
                    `(${WebTool.extractContentInBrackets(rData)})`
                  );
                }
                rData = WebTool.copyObject(rData, true);

                let content = rData.content;
                content =
                  content.constructor.name === "Array"
                    ? content[0].content
                    : content;
                if (typeof callback === "function") {
                  callback(content);
                }
              } catch (e) {
                if (typeof errCallback === "function") {
                  errCallback();
                }
              }
            },
            param
          );
        }
      );
    },
    setAgentConfig(id, attr, callback, errCallback) {
      id = id || WebTool.urlQuery(location.href, "id");
      this.adapter.getDocumentData(
        {
          table: "pptItem",
          key: "documentId",
          documentId: id,
        },
        (tData) => {
          if (!tData.data || !tData.data[0]) {
            console.log("no document item.");
            if (typeof errCallback === "function") {
              errCallback();
            }
            return false;
          }
          let doc = tData.data[0];
          let param = {
            url: webCpu.documentPrefix + doc.document,
          };
          this.adapter.getDocumentItem(
            { callback: "transweb_" + id },
            (rData) => {
              try {
                if (typeof rData === "string") {
                  const inner = WebTool.extractContentInBrackets(rData);
                  rData = inner ? JSON.parse(inner) : null;
                }
                rData = WebTool.copyObject(rData, true);
                let app = rData.app;
                webCpu.attachAttribute(attr, app);
                this.saveContentData(rData, id, callback, errCallback);
              } catch (e) {
                if (typeof errCallback === "function") {
                  errCallback(e);
                }
              }
            },
            param
          );
        }
      );
    },
    transformModels(rawConfig, modelKey) {
      const priceMap = {};
      const modelMap = {};

      // 辅助函数：根据 key 生成美化后的 label 显示名称
      const formatLabel = (key) => {
        return key
          .replace(/^moonshotai\//, "") // 移除前缀
          .replace(/-(preview|chat-latest)$/, "") // 合并正则匹配后缀
          .split("-")
          .map((part) => {
            // 保留版本号或特定大小写格式
            if (/^\d+(\.\d+)*$/.test(part)) return part;
            if (
              [
                "pro",
                "flash",
                "mini",
                "nano",
                "plus",
                "max",
                "omni",
                "instruct",
              ].includes(part.toLowerCase())
            ) {
              return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
            }
            return part.charAt(0).toUpperCase() + part.slice(1);
          })
          .join("-");
      };

      Object.entries(rawConfig || {}).forEach(([key, item]) => {
        item = item || {};

        // 优先从 item 中提取 modelKey 字段，若外部未指定 modelKey 参数，则降级使用配置项自身的 modelKey/model，最后回退至遍历的原始 key
        const actualModel =
          typeof modelKey === "string" && modelKey
            ? item[modelKey] ?? key
            : item.modelKey ?? item.model ?? key;

        // 兼容 input/in 以及 output/out 两种键名
        const rawIn = item.input ?? item.in ?? 0;
        const rawOut = item.output ?? item.out ?? 0;

        // 默认补齐 from 和 apiName 字段
        const region = item.from || "国外";
        const apiName = item.apiName || "modelRouter";

        // 1. 构建 priceMap（以 actualModel 为键）
        priceMap[actualModel] = {
          in: Math.round(rawIn * 1000000),
          out: Math.round(rawOut * 1000000),
          apiName,
          from: region,
        };

        // 2. 构建 modelMap（以 actualModel 判定与插入）
        if (!modelMap[region]) {
          modelMap[region] = [];
        }

        // 避免重复加入相同实际模型的选项
        const exists = modelMap[region].some((m) => m.value === actualModel);
        if (!exists) {
          modelMap[region].push({
            label: formatLabel(actualModel),
            value: actualModel,
          });
        }
      });

      return { priceMap, modelMap };
    },
    /**
     * 内部辅助方法：统一处理回调与Promise的分发
     */
    _handleCompatibility(executeFunc, callback, errCallback) {
      if (typeof callback === "function") {
        // 传统的 Callback 模式
        executeFunc(
          (data) => callback(data),
          (err) => typeof errCallback === "function" && errCallback(err)
        );
      } else {
        // 现代的 Promise/链式 模式
        return new Promise((resolve, reject) => {
          executeFunc(resolve, reject);
        });
      }
    },
    _saveContentData(data, id, callback, errCallback) {
      data.documentMeta = data.documentMeta || {};
      data.content = data.content || {};
      let content = data.content[0] ? data.content[0].content : data.content;
      let fingerprint = MurmurHash.rule(JSON.stringify(content), 31);
      data.documentMeta.versionArray = data.documentMeta.versionArray || [];

      if (data.documentMeta.versionArray.indexOf(fingerprint) === -1) {
        data.documentMeta.versionArray.push(fingerprint);
      }

      if (!id && !data.documentMeta.localDocFlag) {
        data.documentMeta.folderName = localStorage.folderName;
        data.documentMeta.userName = localStorage.userName;
      } else {
        data.documentMeta.rootFlag = 0;
      }

      data.app = data.app || {};

      if (
        data.app.contentApp &&
        data.app.contentApp.dsl &&
        data.app.contentApp.dsl.data
      ) {
        delete data.app.contentApp.dsl.data.accountData;
      }

      let t = {
        content: content,
        app: data.app,
        documentMeta: data.documentMeta || {},
        appName: data.app.name,
      };
      let str = WebTool.objectToString(t) + "_" + new Date().getTime();

      id = id || MurmurHash.rule(str, 32);
      let params = {
        folderName: localStorage.folderName,
        name: id,
        appName: data.app.name,
      };

      let sParams = {
        prompt: "",
        platformUrl: "",
        apiKey: "",
        apiSecret: "",
        apiName: "",
      };

      let code = content.code;

      if (code) {
        let tQuery = {};
        let dsl = webCpu.getDslObj(code);
        if (dsl && typeof dsl.data === "function") {
          try {
            dsl.data = dsl.data();
            sParams.prompt =
              decodeURIComponent(dsl.data.defaultTemplate) ||
              webCpu.currentPrompt ||
              "";
            tQuery = dsl.data.query || {};
            sParams.platformUrl = tQuery.url || "";
            sParams.apiKey = tQuery.apiKey || "";
            sParams.model = tQuery.model || "";
            sParams.apiSecret = tQuery.apiSecret || "";
            sParams.apiName = tQuery.apiName || "";
            sParams.inputPrice = tQuery.inputPrice;
            sParams.outputPrice = tQuery.outputPrice;
          } catch (e) {
            console.log("执行content code中的dsl.data函数时出错：", e);
          }
        }
        let opList = {
          ops: [
            {
              op: "js.data.update",
              path: "defaultTemplate",
              value: "",
            },
            {
              op: "js.data.update",
              path: "query",
              raw: true,
              value: `{
                documentId: "${id}"
              }`,
            },
          ],
        };
        if (tQuery.apiName !== "custom") {
          tQuery.documentId = id;
          opList.ops[1].value = `${JSON.stringify(tQuery)}`;
        }
        const result = VueSfcEditorPlugin.applyWithResult(code, opList);
        if (result && result.code) {
          content.code = result.code;
        }
      }

      data.app.publishInfo = webCpu.appConfig.publishInfo || {};
      data.app.meta = data.app.meta || {};
      let url = this.interface.saveDocumentData.url.bindData(params);
      let options = {
        id: id,
        name: content.name || t.documentMeta.name || content.title,
        document: url.replace(webCpu.documentPrefix, ""),
        from: data.documentMeta.from || "",
        fromAccount:
          WebTool.urlQuery(location.href, "from") ||
          data.documentMeta.fromAccount ||
          "",
        rootFlag: data.documentMeta.rootFlag || 0,
        rootAccount: data.documentMeta.rootAccount || "",
        root: data.documentMeta.root,
        rootUser: data.documentMeta.rootUser,
        appName: data.app.name,
        appLabel: data.app.meta.label || "(none)",
        appAgent: data.app.publishInfo.folderName,
        appOwner: data.app.publishInfo.user,
        folderName: localStorage.folderName,
        creator: localStorage.userName,
        avatar: "",
        type: data.type || t.documentMeta.type || content.type || "",
        category:
          data.category || t.documentMeta.category || content.category || "",
        grades: data.grades || t.documentMeta.grades || content.grades || "",
        icon: data.icon || t.documentMeta.icon || content.icon || "#",
        tags: data.tags || t.documentMeta.tags || content.tags || "",
        description:
          data.description ||
          t.documentMeta.description ||
          content.description ||
          "",
        introduce:
          data.introduce || t.documentMeta.introduce || content.introduce || "",
        title: data.title || t.documentMeta.title || content.title || "",
        prompt: data.prompt || sParams.prompt,
        platformUrl: sParams.platformUrl,
        apiName: t.documentMeta.apiName || sParams.apiName,
        model: t.documentMeta.model || sParams.model,
        apiKey: sParams.apiKey,
        apiSecret: sParams.apiSecret,
        inputPrice: sParams.inputPrice,
        outputPrice: sParams.outputPrice,
      };

      this.adapter.publishPptItem(options, (tData) => {
        console.log("tData of publishPptItem: ", tData);
        if (tData.ret === 0 || tData.code === 0) {
          this.saveDocumentData(t, id, (rData) => {
            if (rData.code === 0) {
              rData.documentId = id;
              if (typeof callback === "function") {
                callback(rData);
              }
            } else {
              if (typeof errCallback === "function") {
                errCallback();
              }
            }
          });
        } else {
          if (typeof errCallback === "function") {
            errCallback();
          }
        }
      });
    },
    saveDocumentData(tData, name, callback) {
      if (typeof tData !== "object") {
        tData = {};
      }
      let tMeta = tData.documentMeta || {};
      let folderName = tMeta.folderName || localStorage.folderName;
      if (typeof tData !== "string") {
        tData = WebTool.objectToString(tData, true);
      }
      tData = `transweb_${name}(${tData});`;
      let file = new File([tData], name, {
        type: "text/plain;charsst=utf8",
      });
      let formData = new FormData();
      formData.append("file", file);
      if (location.hostname === "") {
        formData = {
          _file: tData,
          _name: name,
        };
      }
      this.adapter.saveDocumentData(
        formData,
        function (dd) {
          if (typeof callback === "function") {
            callback(dd);
          }
        },
        {
          folderName: folderName,
          name: name,
        }
      );
    },
  };

  window.dialogMap = {
    openLoginDialog: window.aigcInterface.openLoginDialog,
    openAppDialog: function (app, params, style) {
      let card = document.body;
      style = style || {
        background: "#fff",
        maxWidth: "1000px",
        width: flag ? "100%" : "90%",
        maxHeight: "85%",
        boxShadow: "2px 2px 2px #999",
        borderRadius: "5px",
        borderTop: "solid 1px #ddd",
        borderLeft: "solid 1px #ddd",
        overflow: "hidden",
      };
      if (typeof params === "string") {
        params = {
          title: params,
        };
      }
      style.background = "#fff";

      let tStyle = {};
      if (
        params.title === webCpu.messages[lang]["myPpt"] ||
        params.title === webCpu.messages[lang]["mySubscriptions"] ||
        params.title === webCpu.messages[lang]["newAgentItem"]
      ) {
        style.maxWidth = "1200px";
        style.width = "100%";
      } else if (params.title === webCpu.messages[lang]["myModule"]) {
        style.width = "100%";
        style.height = "100%";
        style.maxWidth = "100%";
        style.maxHeight = "100%";
        style.borderRadius = "0px";
      }

      if (flag && params.title !== webCpu.messages[lang]["myModule"]) {
        tStyle.width = 600;
        tStyle.height =
          (tStyle.width * (document.body.clientHeight - 0)) /
          document.body.clientWidth;
        tStyle.maxWidth = "";
        tStyle.maxHeight = "";
        style.height = "100%";
        style.maxHeight = "";
      }

      webCpu.renderCardDialog(
        card,
        app,
        {
          dialogName: "menuItemDialog",
          title: params.title,
          titleStyle: {
            background: "var(--el-color-primary-light-9)",
            color: "var(--el-color-primary)",
          },
          closeType: params.closeType || "back",
          closeCallback: params.closeCallback,
          renderMode: params.mode,
          menu: params.menu,
          headerHidden: params.headerHidden,
        },
        style,
        tStyle
      );
    },
    openDocumentApp: function (id, dsl, params, style, type) {
      dsl = dsl || {};
      params = params || {};
      webCpu.getDocumentApp(
        id,
        (app, content) => {
          dsl.style = dsl.style || {};
          dsl.style.overflow = "auto";
          webCpu.attachAttribute(dsl, app.dsl);
          content = content || {};
          params.title =
            params.title ||
            dsl.dialogTitle ||
            content.title ||
            dsl.dialogTitle ||
            "test";
          webCpu.appMap = webCpu.appMap || {};
          webCpu.appMap[id] = app;
          this.openAppDialog(app, params, style);
          if (params.callback && typeof params.callback === "function") {
            params.callback(app);
          }
        },
        type
      );
    },
  };
  window.aigcRequest = aigcInterface.request;
})();
