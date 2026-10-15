let WebTool = require("../custom/WebTool.js");
let ConfigObject = require("../custom/ConfigObject.js");
let mmh3 = require("murmurhash3js");
let path = require("path");
let Adapter = require("../custom/Adapter.js");
let t = path.resolve(__dirname, ".");
let tPath = t + "/config/" + "interface.js";
let loginedPath = t + "/config/" + "logined.js";
let cPath = t + "/config/" + "common.js";
let commonData = new ConfigObject(cPath).data;
let interface = new ConfigObject(tPath);
let adapter = new Adapter(interface.data);
const { encode } = require("gpt-tokenizer");

let awardPoints = function (
  folderName,
  amount,
  name,
  db,
  callback,
  documentId
) {
  console.log("奖励积分_: ", amount, folderName);
  WebTool.objectTool.dealIncome(
    db,
    {
      folderName: folderName + "",
      value: amount,
      documentId: documentId,
      name: name || "积分提成",
    },
    function (ret) {
      console.log("奖励积分: ", amount, folderName);
      if (typeof callback === "function") {
        callback(ret);
      }
    }
  );
};

let consumePoints = function (
  folderName,
  amount,
  name,
  db,
  callback,
  documentId
) {
  console.log("消费积分_: ", amount, folderName);
  WebTool.objectTool.dealExpenses(
    db,
    {
      folderName: folderName + "",
      value: amount,
      documentId: documentId,
      name: name || "算力消费",
    },
    function (ret) {
      console.log("消费积分: ", amount, folderName + "");
      if (typeof callback === "function") {
        callback(ret);
      }
    }
  );
};

let adjustQuery = function (req, db, callback) {
  let query = req.body;
  // SSRF 防护：客户端/文档指定的自定义模型地址仅允许公网 http(s)
  if (query && query.url) {
    try {
      WebTool.objectTool.assertSafePublicUrl(query.url);
    } catch (e) {
      return res.status(400).json({ ret: 1, message: e.message });
    }
  }
  let id = query.documentId;
  let hUrl = req.get("referer");
  id = id || WebTool.objectTool.urlQuery(hUrl, "id");
  if (id) {
    // 自定义接口，参数来源完全由前端传递，后端不做任何假设和补全
    WebTool.objectTool.dbQuery(
      db,
      "pptItem",
      { documentId: id },
      {},
      async (err, result) => {
        if (err) {
          console.error("查询文档时出错:", err);
          return res.status(500).send("Internal Server Error");
        }
        let doc = (result || [])[0] || {};
        let apiName = query.apiName || doc.apiName;
        if (apiName === "custom") {
          query.url = query.url || doc.platformUrl;
          try {
            WebTool.objectTool.assertSafePublicUrl(query.url);
          } catch (e) {
            return res.status(400).json({ ret: 1, message: e.message });
          }
          query.apiKey = query.apiKey || doc.apiKey;
          query.apiSecret = query.apiSecret || doc.apiSecret;
          query.inputPrice = doc.inputPrice;
          query.outputPrice = doc.outputPrice;
        }

        query.prompt = query.content =
          query.content || query.prompt || doc.prompt;

        query.knowledgeBase = query.knowledgeBase || "";
        //todo: get knowledge
        if (doc.knowledges) {
          try {
            let arr = doc.knowledges;
            if (typeof doc.knowledges === "string") {
              arr = JSON.parse(doc.knowledges);
            }
            let choice = await WebTool.objectTool.analyzeKnowledgeBase(query.context, arr);
            console.log("#choice: ", choice);
            if (choice !== "none") {
              for (let i = 0; i < arr.length; i++) {
                let item = arr[i];
                if (choice.search(item.name) !== -1) {
                  console.log("knowledge item: ", item);
                  let { list } = await WebTool.objectTool.fetchQuestionData({
                    db: db.db(),
                    table: "questionData",
                    condition: WebTool.mongoTool.normalizeQuery({ _id: item.id }),
                    sortField: { _id: 1 } // 可选：建议加上默认排序规范，避免 sortField 报错
                  });
                  console.log("knowledges results: ", list[0]);
                  if (list && list[0]) {
                    query.context = `严格以以下知识库内容作为第一事实来源回答问题；若问题超出知识库范围或无法从中获取答案，可在明确提醒用户超出当前知识库范围的前提下，给出具体且有参考价值的回答。
                    <<<KNOWLEDGE_BASE_FULL_CONTENT_START>>>${list[0].result}<<<KNOWLEDGE_BASE_FULL_CONTENT_END>>>
                    现在请回答：${query.context}
                    ` ;
                  }
                  break;
                }
              }
            }

          } catch (e) {
            console.log("知识库判断异常：", e);
          }
        }

        if (query.prompt) {
          query.prompt = query.prompt.bindData(query);
        }

        console.log("adjustQuery doc.documentId: ", doc.documentId);
        query.rootAccount = doc.rootAccount;
        query.apiName = apiName;
        query.model = query.model || doc.model;
        query.taxRate = doc.taxRate;
        query.documentId = doc.documentId;

        if (query.image) {
          query.image = query.image;
        }
        if (typeof callback) {
          callback(query);
        }
      }
    );
  } else {
    delete query.apiKey;
    delete query.url;
    if (typeof callback) {
      callback(query);
    }
  }
};

const Billing = {
  checkBalance: async (data, cost, db) => {
    try {
      const config = {
        projection: { tokenUsed: 1, tokenLimit: 1 },
      };

      // 假设将 WebTool 封装为返回 Promise 的版本
      const result = await WebTool.objectTool.findItems(
        db,
        "account",
        { folderName: Number(data.folderName) },
        config
      );

      console.log("查询账户信息 result: ", result);

      if (!result || result.length === 0) {
        return false;
      }

      const { tokenLimit = 0, tokenUsed = 0 } = result[0];

      console.log("账户信息: ", { tokenLimit, tokenUsed, cost });

      // 核心逻辑判断
      return tokenLimit - tokenUsed >= cost;
    } catch (err) {
      console.error("查询账户信息时出错:", err);
      return false;
    }
  },
  recordUsage: async (data, params, status, db) => {
    /* 写入数据库记录 */
    let rateMap = commonData.tokenRateMap[params.model] || {
      input: 0.1,
      output: 0.1,
    };
    let pointCost = Math.floor(
      data.prompt_tokens * (rateMap.input || 0.1) +
      data.completion_tokens * (rateMap.output || 0.1)
    );

    pointCost = Math.max(pointCost, commonData.minCost || 10);

    params.margin = Math.floor((params.marginRate || 0.1) * pointCost || 0);

    console.log(
      "recordUsage pointCost: ",
      pointCost,
      "margin: ",
      params.margin
    );

    consumePoints(
      params.folderName,
      pointCost + params.margin,
      `算力消费`,
      db,
      async (ret) => {
        try {
          let defaultId = "1714628260";
          Object.assign(params, data);
          console.log("recordUsage params: ", params);
          params.pointsCost = pointCost + params.margin;
          params.type = "aigcText";
          recordRequestItem(params, "questionData", db, () => {
            params.root = params.root || defaultId;
            if (params.root) {
              console.log("_奖励发布者: ", params.root);
              let rate = params.publishRate || commonData.defaultPublishRate || 0.9;
              awardPoints(
                params.root,
                Math.ceil(params.margin * rate),
                "发布者-奖励提成",
                db,
                () => {
                  params.agentId = params.agentId || defaultId;
                  console.log("_奖励开发商: ", params.agentId);
                  awardPoints(
                    params.agentId,
                    Math.ceil(params.margin * (params.develeperRate || commonData.defaultDeveloperRate || 0.1)),
                    "开发者-奖励提成",
                    db,
                    () => {
                      params.from = params.from || defaultId;
                      if (
                        params.from === params.root ||
                        params.from === params.folderName
                      ) {
                        params.from = defaultId;
                      }
                      console.log("_奖励传播者: ", params.from);
                      awardPoints(
                        params.from,
                        Math.ceil(params.margin * (params.transferRate || commonData.defaultTransferRate || 0.01)),
                        "传播者-奖励提成",
                        db,
                        () => {
                          db.close();
                        },
                        params.documentId
                      );
                    },
                    params.documentId
                  );
                },
                params.documentId
              );
            }
          });
        } catch (e) {
          console.log("recordRequestItem err: ", e);
        }
      },
      params.documentId
    );
  },
};

let aiRequestConfirm = function (req, res, db) {
  adjustQuery(req, db, (query) => {
    _aiRequestConfirm(query, req, res, db);
  });
};

let _aiRequestConfirm = function (query, req, res, db) {
  let sData = req.session.data;
  let tQuery = JSON.parse(JSON.stringify(query));
  let config = interface.data[tQuery.apiName] || {};
  if (typeof config.qCallback === "function") {
    query = config.qCallback(tQuery);
  }
  delete query.apiName;
  delete query.apiKey;
  delete query.apiSecret;
  delete query.from;
  delete query.fromAccount;
  delete query.agentId;
  delete query.rootAccount;
  delete query.root;
  delete query.context;
  delete query.content;
  delete query.url;
  try {
    let start = new Date().getTime();
    adapter[tQuery.apiName](
      query,
      (tData) => {
        // ---------- 1. 基础兜底 ----------
        tData = tData || {};

        // 明确 raw 数据来源
        let raw = Object.prototype.hasOwnProperty.call(tData, "data")
          ? tData.data
          : tData;

        let rData;
        let usage = {};

        // ---------- 2. Binary 判定（最关键） ----------
        const isBinary =
          (typeof Buffer !== "undefined" && Buffer.isBuffer(raw)) ||
          raw instanceof ArrayBuffer ||
          raw instanceof Uint8Array;

        // ---------- 3. Binary 管线 ----------
        if (isBinary) {
          rData = {
            ret: 0,
            result: raw, // 直接透传 binary
            usage: {},
          };
        }
        // ---------- 4. String（JSON / base64 / dataUrl） ----------
        else if (typeof raw === "string") {
          rData = {
            ret: 0,
            result: raw,
            usage: {},
          };
        }
        // ---------- 5. Object（标准 JSON 管线） ----------
        else if (typeof raw === "object" && raw !== null) {
          rData = raw;
          // 统一约定字段（不覆盖已有值）
          rData.ret = typeof rData.ret === "number" ? rData.ret : 0;
          rData.usage = rData.usage || {};
        } else {
        }

        if (typeof config.rCallback === "function") {
          rData.apiName = tQuery.apiName;
          usage = config.rCallback(rData);
          if (usage) rData.usage = usage;
        }

        rData.apiName = tQuery.apiName;
        let gap = Number(new Date().getTime() - start);
        console.log(
          "请求耗时 gap: ",
          gap,
          usage.prompt_tokens,
          usage.completion_tokens
        );
        if (gap < 5 * 60 * 1000 + 300) {
          // 超过 300 秒，算为请求失败
          let tokenCount = 0;
          let agentId = req.body.agentId || "1714628260";
          let from =
            req.body.fromAccount || req.body.from || agentId || "1714628260";
          let root = req.body.rootAccount || agentId || "1714628260";

          usage.tokenRateMap = usage.tokenRateMap || {};
          rData.model = tQuery.model || "api";
          rData.model = tQuery.model.toLocaleLowerCase();
          let exRate =
            usage.tokenRateMap[rData.model] ||
            commonData.tokenRateMap[rData.model] ||
            commonData.exchangeRate ||
            1;

          delete usage.tokenRateMap;
          if (typeof exRate === "number") {
            exRate = {
              input: exRate,
              output: exRate,
            };
          }

          if (tQuery.apiName === "custom") {
            exRate.input = tQuery.inputPrice / 1000000 || 0.1;
            exRate.output = tQuery.outputPrice / 1000000 || 0.4;
          } else {
            exRate.input = exRate.input || 1;
            exRate.output = exRate.output || 1;
          }

          usage.tokenRate = exRate;
          usage.prompt_tokens =
            usage.prompt_tokens === undefined ? 100 : usage.prompt_tokens;
          usage.completion_tokens =
            usage.completion_tokens === undefined
              ? 100
              : usage.completion_tokens;
          tokenCount = Math.floor(
            usage.prompt_tokens * exRate.input +
            usage.completion_tokens * exRate.output
          );

          tokenCount =
            Math.max(commonData.minCost, tokenCount) *
            (commonData.discount || 1);
          tokenCount = Math.floor(tokenCount);

          let hUrl = req.get("referer");
          let documentId =
            query.documentId ||
            WebTool.objectTool.urlQuery(hUrl, "id") ||
            hUrl ||
            tQuery.documentId;

          let tRate = undefined;
          if (documentId) {
            tRate = commonData.marginMap[documentId];
          }

          let taxRate =
            tRate !== undefined
              ? tRate
              : commonData.taxRateMap[tQuery.apiName] || commonData.marginRate;

          console.log("tQuery.taxRate: ", tQuery.taxRate);

          if (tQuery.taxRate) {
            taxRate = tQuery.taxRate;
          }

          let margin = tokenCount * taxRate;
          if (
            tQuery.apiName === "custom" &&
            ((!documentId && !root) || root === sData.folderName + "")
          ) {
            margin = 100;
          }

          tokenCount += margin;
          tokenCount = Math.floor(tokenCount);

          console.log("consumePoints", tokenCount, margin);

          sData.tokenUsed += tokenCount;
          rData.usage = rData.usage || {};
          rData.usage.pointsCost = tokenCount;
          rData.usage.model = query.model;
          rData.usage.taxRate = Number(taxRate);
          rData.usage.margin = margin;

          WebTool.requestTool.sendData(rData, req, res);

          consumePoints(
            sData.folderName,
            tokenCount,
            `算力消费`,
            db,
            async (ret) => {
              rData.usage = usage || {};
              let logined = new ConfigObject(loginedPath);
              logined.data = logined.data || {};
              delete rData.choices;
              let d = rData.usage || {};
              d.context = req.body.context;
              d.apiName = rData.apiName;
              //记录本次请求
              d.documentId = tQuery.documentId || documentId;
              d.folderName = sData.folderName;
              d.apiName = rData.apiName;
              d.model = rData.model;
              d.root = root;
              d.created = rData.created || new Date().getTime();
              rData.data = rData.data || "";
              d.data = rData.data || d.result || "";
              if (d.type === "aigcImage") {
                const result = (await WebTool.objectTool.compressImageNode(
                  d.data,
                  {
                    maxWidth: 900, // 可选，默认 800
                    targetSizeKb: 150, // 可选，默认 200
                  }
                )) || {
                  base64: "",
                };
                d.data = result.base64;
              } else if (typeof rData.data !== "string") {
                d.data = JSON.stringify(d.data);
              }

              d.baseId = tQuery.baseContent
                ? mmh3.x64.hash128(tQuery.baseContent, 31)
                : "default";

              try {
                recordRequestItem(d, "questionData", db, () => {
                  if (root) {
                    console.log("_奖励发布者: ", root);
                    commonData.commissionRate = commonData.commissionRate || {};
                    let rate =
                      commonData.commissionRate.contentPublisher || 0.7;
                    awardPoints(
                      root,
                      Math.ceil(margin * rate),
                      "发布者-奖励提成",
                      db,
                      () => {
                        console.log("_奖励开发商: ", agentId);
                        awardPoints(
                          agentId,
                          Math.ceil(
                            margin * commonData.commissionRate.toolDeveloper
                          ),
                          "开发者-奖励提成",
                          db,
                          () => {
                            if (from === root || from === sData.folderName) {
                              from = "1714628260";
                            }
                            console.log("_奖励传播者: ", from);
                            awardPoints(
                              from,
                              Math.ceil(
                                margin *
                                commonData.commissionRate.contentTransfer
                              ),
                              "传播者-奖励提成",
                              db,
                              () => {
                                db.close();
                              },
                              documentId
                            );
                          },
                          documentId
                        );
                      },
                      documentId
                    );
                  }
                });
              } catch (e) {
                console.log("recordRequestItem err: ", e);
              }
            },
            documentId
          );
        } else {
          console.log("超过 300 秒:", gap);
          WebTool.requestTool.sendData(rData, req, res);
        }
      },
      tQuery,
      (err) => {
        console.error("请求出错: ", err);
        res
          .status(err.status || 500)
          .json({
            ret: 1,
            message: err.message || "请求失败",
            data: err.data || null,
          });
      }
    );
  } catch (e) {
    WebTool.requestTool.sendData(
      {
        ret: 1,
        error: e.toString(),
        message: "当前接口调用失败, 请稍后再试。",
      },
      req,
      res
    );
  }
};

let recordRequestItem = async function (
  qItem,
  tName = "questionData",
  db,
  callback,
  uniqueFields = ["versionId", "folderName", "documentId"] // 指定哪些字段组合唯一
) {
  const dbItem = db.db();
  const tObject = dbItem.collection(tName);

  let temp = qItem.result;

  try {
    if (qItem.result) {
      const json = WebTool.objectTool.extractJSON(qItem.result);
      temp = JSON.stringify(json);
    }
  } catch (e) { }

  // 基于内容生成稳定版本 ID
  qItem.versionId = mmh3.x64.hash128(temp || "", 31);

  let tData = Array.isArray(qItem) ? qItem : [qItem];

  tData = tData.map((item) => {
    const newItem = {
      ...item,
      _time: Date.now(),
    };

    delete newItem._id;

    return newItem;
  });

  try {
    // 构建去重查询条件
    const orConditions = tData.map((item) => {
      const condition = {};

      uniqueFields.forEach((field) => {
        condition[field] = item[field];
      });

      return condition;
    });

    // 查询已存在的数据
    const existsList = await tObject
      .find({
        $or: orConditions,
      })
      .toArray();

    // 构建已存在 key 集合
    const existsSet = new Set(
      existsList.map((item) =>
        uniqueFields.map((field) => item[field]).join("::")
      )
    );

    // 过滤重复数据
    const insertList = tData.filter((item) => {
      const key = uniqueFields.map((field) => item[field]).join("::");

      return !existsSet.has(key);
    });

    // 没有需要插入的数据
    if (insertList.length === 0) {
      if (typeof callback === "function") {
        callback({
          insertedCount: 0,
          message: "No new data inserted",
        });
      }

      return;
    }

    // 批量插入
    const result = await tObject.insertMany(insertList);

    if (typeof callback === "function") {
      callback(result);
    }

    return result;
  } catch (err) {
    console.error("recordRequestItem error:", err);
    throw err;
  }
};

// ============================================================
// 协议适配器：把各家原生流统一成 { content, reasoning, usage, done }
// ============================================================
const ProtocolAdapters = {
  /**
   * OpenAI 兼容系：GPT / DeepSeek / Kimi / 通义 / 智谱 / Grok / OpenRouter...
   */
  openai: {
    // 是否使用 JSON Array 流（Gemini 专用，openai 固定 false）
    isJsonArrayStream: false,
    parse(eventName, json) {
      const choice = json.choices?.[0];
      if (!choice) {
        // 某些平台只在最后一条返回 usage，没有 choices
        if (json.usage) return { usage: normalizeUsage(json.usage, "openai") };
        return {};
      }
      const delta = choice.delta || {};
      return {
        content: delta.content || "",
        reasoning: delta.reasoning_content || delta.reasoning || "",
        usage: json.usage ? normalizeUsage(json.usage, "openai") : undefined,
        done: choice.finish_reason != null,
      };
    },
  },

  /**
   * Anthropic Claude 原生 /v1/messages
   */
  claude: {
    isJsonArrayStream: false,
    parse(eventName, json) {
      switch (eventName || json.type) {
        case "message_start":
          return {
            usage: json.message?.usage
              ? normalizeUsage(json.message.usage, "claude")
              : undefined,
          };
        case "content_block_delta": {
          const d = json.delta || {};
          if (d.type === "text_delta") return { content: d.text || "" };
          if (d.type === "thinking_delta")
            return { reasoning: d.thinking || "" };
          if (d.type === "input_json_delta") {
            // 工具调用增量（如需支持 function calling 可在此扩展）
            return {};
          }
          return {};
        }
        case "message_delta":
          return {
            usage: json.usage
              ? normalizeUsage(json.usage, "claude")
              : undefined,
          };
        case "message_stop":
          return { done: true };
        case "ping":
        case "content_block_start":
        case "content_block_stop":
        default:
          return {};
      }
    },
  },

  /**
   * Google Gemini —— SSE 模式（推荐，URL 加 ?alt=sse）
   */
  gemini: {
    isJsonArrayStream: false,
    parse(eventName, json) {
      const cand = json.candidates?.[0];
      let content = "";
      if (cand?.content?.parts) {
        content = cand.content.parts.map((p) => p.text || "").join("");
      }
      return {
        content,
        usage: json.usageMetadata
          ? normalizeUsage(json.usageMetadata, "gemini")
          : undefined,
        done: cand?.finishReason != null,
      };
    },
  },

  /**
   * Google Gemini —— JSON Array 流模式（官方默认 streamGenerateContent）
   * 需要增量 JSON 解析，复用 gemini 的 parse
   */
  "gemini-json": {
    isJsonArrayStream: true,
    parse(eventName, json) {
      return ProtocolAdapters.gemini.parse(eventName, json);
    },
  },
};

/**
 * 将各家 usage 字段映射成 OpenAI 风格
 */
function normalizeUsage(u, from) {
  if (!u) return undefined;
  if (from === "claude") {
    const p = u.input_tokens ?? 0;
    const c = u.output_tokens ?? 0;
    return {
      prompt_tokens: p,
      completion_tokens: c,
      total_tokens: p + c,
      _source: "upstream",
    };
  }
  if (from === "gemini") {
    return {
      prompt_tokens: u.promptTokenCount ?? 0,
      completion_tokens: u.candidatesTokenCount ?? 0,
      total_tokens:
        u.totalTokenCount ??
        (u.promptTokenCount ?? 0) + (u.candidatesTokenCount ?? 0),
      _source: "upstream",
    };
  }
  // openai
  return {
    prompt_tokens: u.prompt_tokens ?? 0,
    completion_tokens: u.completion_tokens ?? 0,
    total_tokens:
      u.total_tokens ?? (u.prompt_tokens ?? 0) + (u.completion_tokens ?? 0),
    _source: "upstream",
  };
}

// ============================================================
// SSE 行解析器（流式，处理跨 chunk 边界）
// ============================================================
function createSSELineParser(onEvent) {
  let buffer = "";
  let currentEvent = "";
  let currentData = [];

  const dispatch = () => {
    if (currentData.length === 0 && !currentEvent) return;
    const data = currentData.join("\n");
    const evt = currentEvent;
    currentEvent = "";
    currentData = [];
    onEvent(evt, data);
  };

  return {
    feed(text) {
      buffer += text;
      let idx;
      while ((idx = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);

        if (line === "") {
          dispatch();
          continue;
        } // 空行 = 事件结束
        if (line.startsWith(":")) continue; // 注释（心跳）
        if (line.startsWith("event:")) {
          currentEvent = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          currentData.push(line.slice(5).replace(/^ /, ""));
        }
        // id:/retry: 忽略
      }
    },
    flush() {
      if (buffer) {
        const tail = buffer;
        buffer = "";
        if (tail.startsWith("data:")) currentData.push(tail.slice(5).trim());
      }
      dispatch();
    },
  };
}

// ============================================================
// JSON Array 流解析器（Gemini 原生默认格式）
// 流格式示例：[ {...} ,\r\n {...} ,\r\n {...} ]
// 用轻量状态机做括号深度追踪，兼顾字符串/转义
// ============================================================
function createJsonArrayParser(onObject) {
  let buf = "";
  let depth = 0;
  let inStr = false;
  let esc = false;
  let started = false;
  let objStart = -1;

  return {
    feed(text) {
      buf += text;
      for (let i = buf.length - text.length; i < buf.length; i++) {
        const ch = buf[i];
        if (!started) {
          if (ch === "[") started = true;
          continue;
        }
        if (inStr) {
          if (esc) {
            esc = false;
            continue;
          }
          if (ch === "\\") {
            esc = true;
            continue;
          }
          if (ch === '"') {
            inStr = false;
          }
          continue;
        }
        if (ch === '"') {
          inStr = true;
          continue;
        }
        if (ch === "{") {
          if (depth === 0) objStart = i;
          depth++;
        } else if (ch === "}") {
          depth--;
          if (depth === 0 && objStart !== -1) {
            const slice = buf.slice(objStart, i + 1);
            objStart = -1;
            try {
              onObject(JSON.parse(slice));
            } catch (_) { }
          }
        }
      }
      // 保留尚未闭合的尾部，避免内存无限增长
      if (depth === 0 && objStart === -1) {
        buf = "";
      } else if (objStart > 0) {
        buf = buf.slice(objStart);
        objStart = 0;
      }
    },
    flush() {
      /* JSON array 模式不需要 flush 尾部 */
    },
  };
}

// ============================================================
// Token 节流累计器
// ============================================================
function createTokenCounter(
  encode,
  { charThreshold = 50, timeThreshold = 300 } = {}
) {
  let pending = "";
  let total = 0;
  let lastTime = Date.now();

  return {
    add(text) {
      if (text) pending += text;
    },
    get() {
      return total + (pending ? estimate(pending) : 0);
    },
    flush(force = false) {
      const now = Date.now();
      if (
        !force &&
        pending.length < charThreshold &&
        now - lastTime < timeThreshold
      )
        return total;
      if (pending) {
        total += encode(pending).length;
        pending = "";
        lastTime = now;
      }
      return total;
    },
    // 尚未 encode 前的估算值（用于实时展示，最终 flush 后会被真实值替代）
  };
  // 粗略估算：中文 ~1 token/字，英文 ~0.25 token/字。这里简化为 chars 即可
  function estimate(s) {
    return Math.ceil(s.length);
  }
}

function extractPromptText(query, protocol) {
  try {
    if (protocol === "claude") {
      const sys =
        typeof query.system === "string"
          ? query.system
          : Array.isArray(query.system)
            ? query.system.map((s) => s.text || "").join("")
            : "";
      const msgs = (query.messages || [])
        .map((m) => {
          if (typeof m.content === "string") return m.content;
          if (Array.isArray(m.content)) {
            return m.content.map((c) => c.text || "").join("");
          }
          return "";
        })
        .join("");
      return sys + msgs;
    }
    if (protocol.startsWith("gemini")) {
      const contents = query.contents || [];
      return contents
        .map((c) => (c.parts || []).map((p) => p.text || "").join(""))
        .join("");
    }
    // openai
    return (query.messages || [])
      .map((m) =>
        typeof m.content === "object"
          ? JSON.stringify(m.content)
          : m.content || ""
      )
      .join("");
  } catch {
    return "";
  }
}

let data = {
  aiStreamRequest: {
    method: "post",
    dbItem: "visualTool",
    CORS: true,
    callback: async function (req, res, dbInfo, db) {
      // ─────────────────────────────────────────────
      // 0. 基础校验
      // ─────────────────────────────────────────────
      const sessionData = req.session.data || {};
      if (!sessionData || sessionData.folderName === undefined) {
        return WebTool.requestTool.sendData(
          { ret: 1, message: "请先登录账号。" },
          req,
          res
        );
      }

      // ─────────────────────────────────────────────
      // 1. 预校验余额（100 积分保证金）
      // ─────────────────────────────────────────────
      if (commonData.pointsSwitch) {
        const balanceOk = await Billing.checkBalance(sessionData, 100, db);
        if (!balanceOk) {
          return WebTool.requestTool.sendData(
            { ret: 2, message: "积分余额不足，请充值。" },
            req,
            res
          );
        }
      }

      // ─────────────────────────────────────────────
      // 2. SSE 响应头
      // ─────────────────────────────────────────────
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");
      if (typeof res.flushHeaders === "function") res.flushHeaders();

      // ─────────────────────────────────────────────
      // 3. 生命周期管理
      // ─────────────────────────────────────────────
      const abortController = new AbortController();
      let clientClosed = false;
      let finished = false;
      let heartbeatTimer;

      const cleanup = () => {
        if (finished) return;
        finished = true;
        clearInterval(heartbeatTimer);
        if (!res.writableEnded) {
          try {
            res.end();
          } catch (_) {
            /* ignore */
          }
        }
      };

      req.on("close", () => {
        clientClosed = true;
        abortController.abort();
        cleanup();
      });

      // ─────────────────────────────────────────────
      // 4. 带背压的 SSE 写入工具
      // ─────────────────────────────────────────────
      const safeWrite = (chunk) => {
        if (clientClosed || res.writableEnded) return false;
        const ok = res.write(chunk);
        if (typeof res.flush === "function") res.flush();
        return ok;
      };

      /**
       * 发送 SSE 事件，遇到背压时等待 drain
       * @param {object} payload - 事件数据（自动 JSON 序列化）
       */
      const writeEvent = async (payload) => {
        const ok = safeWrite(`data: ${JSON.stringify(payload)}\n\n`);
        if (!ok && !clientClosed) {
          await new Promise((resolve) => {
            const onDrain = () => {
              res.off("close", onAbort);
              resolve();
            };
            const onAbort = () => {
              res.off("drain", onDrain);
              resolve();
            };
            res.once("drain", onDrain);
            res.once("close", onAbort);
          });
        }
      };

      // ─────────────────────────────────────────────
      // 5. 心跳（防止代理层超时断连）
      // ─────────────────────────────────────────────
      heartbeatTimer = setInterval(() => {
        if (!clientClosed && !res.writableEnded) {
          safeWrite(`: ping ${Date.now()}\n\n`);
        }
      }, 15_000);

      // ─────────────────────────────────────────────
      // 6. Token 节流计数器
      // ─────────────────────────────────────────────
      const completionCounter = createTokenCounter(encode, {
        charThreshold: 50,
        timeThreshold: 300,
      });

      // ─────────────────────────────────────────────
      // 7. 主流程（将回调式 adjustQuery 包装为 Promise）
      // ─────────────────────────────────────────────

      // 提升到 try/catch 外层，确保 catch 和最终计费均可访问
      let promptTokensLocal = 0;
      let fullContent = "";
      let upstreamUsage = null;
      let tQueryRef = null; // 持有 adjustQuery 注入后的 query 引用

      try {
        // 将 callback-based adjustQuery 转为 Promise
        const tQuery = await new Promise((resolve, reject) => {
          adjustQuery(req, db, (q) => {
            try {
              resolve(q);
            } catch (e) {
              reject(e);
            }
          });
        });

        tQueryRef = tQuery;
        // apiConfig = interface.data[tQuery.apiName];

        const apiName = tQuery.apiName || "深度求索";
        let apiConfig = interface.data[apiName]; // 避免使用保留字 `interface`

        if (!apiConfig) {
          return WebTool.requestTool.sendData(
            { ret: 1, message: "暂不支持该 AI 模型。" },
            req,
            res
          );
        }

        const protocol = apiConfig.protocol || "openai";
        const adapter = ProtocolAdapters[protocol];
        if (!adapter) {
          return WebTool.requestTool.sendData(
            { ret: 1, message: `未知协议: ${protocol}` },
            req,
            res
          );
        }

        // ── 7.1 组装请求 ──────────────────────────
        const query = apiConfig.qCallback
          ? apiConfig.qCallback(tQuery)
          : tQuery;
        query.stream = true;

        // query.max_tokens = 2048;
        delete query.max_tokens; // 由调用方控制，避免被上游强行截断

        // 从 referer 解析文档 ID / agent 信息
        const hUrl = req.get("referer") || "";
        tQuery.documentId =

          WebTool.objectTool.urlQuery(hUrl, "id") || hUrl;

        tQuery.taxRate = tQuery.taxRate || 0.1;

        // ── 7.2 组装请求头（按协议差异化）──────────
        const upstreamUrl =
          typeof apiConfig.url === "function"
            ? apiConfig.url(req.body)
            : apiConfig.url;

        const headers = {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          ...(apiConfig.headers || {}),
        };

        if (protocol === "claude") {
          headers["x-api-key"] = apiConfig.authorization;
          headers["anthropic-version"] =
            apiConfig.anthropicVersion || "2023-06-01";
        } else if (protocol.startsWith("gemini")) {
          if (apiConfig.authorization)
            headers["x-goog-api-key"] = apiConfig.authorization;
        } else {
          headers["Authorization"] = apiConfig.authorization;
        }

        // ── 7.3 本地 Prompt token 估算 ───────────
        const promptContent = extractPromptText(query, protocol);
        promptTokensLocal = promptContent ? encode(promptContent).length : 0;

        // ── 7.4 发起上游请求（带超时保护）────────
        const UPSTREAM_TIMEOUT_MS = 60_000;
        const timeoutId = setTimeout(
          () => abortController.abort(),
          UPSTREAM_TIMEOUT_MS
        );

        console.log(
          "Upstream request to:",
          upstreamUrl,
          "with headers:",
          headers,
          "and body:",
          query
        );

        let response;
        try {
          response = await fetch(upstreamUrl, {
            method: "POST",
            headers,
            body: JSON.stringify(query),
            signal: abortController.signal,
          });
        } finally {
          clearTimeout(timeoutId);
        }

        // ── 7.5 上游错误处理 ─────────────────────
        if (!response.ok) {
          const errText = await response.text().catch(() => "");
          await writeEvent({
            error: "Upstream Error",
            status: response.status,
            details: errText.slice(0, 2_000),
          });
          return cleanup();
        }
        if (!response.body) {
          await writeEvent({ error: "Empty upstream body" });
          return cleanup();
        }

        // ─────────────────────────────────────────
        // 8. 统一 delta 处理器
        // ─────────────────────────────────────────
        /** 余额不足时中断流的已触发标记 */
        let balanceExhausted = false;
        /** 下次做余额检查时的 token 阈值 */
        let nextBalanceCheckAt = 100;

        const handleDelta = async (delta) => {
          if (!delta || balanceExhausted) return;

          // 收到上游 usage，优先使用
          if (delta.usage) upstreamUsage = delta.usage;

          // 累积 completion token
          const piece = (delta.content || "") + (delta.reasoning || "");
          if (piece) {
            fullContent += delta.content || ""; // 只累积实际内容，用于计费记录
            completionCounter.add(piece);
            completionCounter.flush(false);
          }

          // 推送增量内容给客户端
          if (delta.content || delta.reasoning) {
            const currentCompletion = completionCounter.get();
            const currentTotal = promptTokensLocal + currentCompletion;

            const usageSnapshot = upstreamUsage || {
              prompt_tokens: promptTokensLocal,
              completion_tokens: currentCompletion,
              total_tokens: currentTotal,
              _source: "local",
            };

            await writeEvent({
              content: delta.content || "",
              reasoning_content: delta.reasoning || undefined,
              usage: usageSnapshot,
            });

            // 动态余额检查：超过阈值时检查一次，并指数退避减少 DB 压力
            if (currentTotal >= nextBalanceCheckAt) {
              nextBalanceCheckAt = currentTotal + Math.min(currentTotal, 500); // 退避增长
              const stillOk = await Billing.checkBalance(
                sessionData,
                currentTotal,
                db
              );
              if (!stillOk) {
                if (commonData.pointsSwitch) {
                  balanceExhausted = true;
                  await writeEvent({
                    ret: 2,
                    error: "余额不足",
                    code: "BALANCE_EXHAUSTED",
                  });
                  abortController.abort(); // 中断上游连接
                }
              }
            }
          }

          // 上游发送最终 usage
          if (delta.done && upstreamUsage) {
            await writeEvent({ usage: upstreamUsage, final: true });
          }
        };

        // ─────────────────────────────────────────
        // 9. 按协议选择流解析器
        // ─────────────────────────────────────────
        const decoder = new TextDecoder("utf-8");

        if (adapter.isJsonArrayStream) {
          // Gemini JSON Array 流
          const parser = createJsonArrayParser(async (obj) => {
            await handleDelta(adapter.parse(null, obj));
          });
          for await (const chunk of response.body) {
            if (clientClosed || balanceExhausted) break;
            parser.feed(decoder.decode(chunk, { stream: true }));
          }
          parser.feed(decoder.decode()); // flush 剩余字节
        } else {
          // SSE 流（OpenAI / Claude / Gemini-SSE 通用）
          const sse = createSSELineParser(async (eventName, dataStr) => {
            if (!dataStr) return;

            if (dataStr === "[DONE]") {
              await handleDelta({ done: true });
              return;
            }

            let json;
            try {
              json = JSON.parse(dataStr);
            } catch {
              return;
            }

            await handleDelta(adapter.parse(eventName, json));
          });

          for await (const chunk of response.body) {
            if (clientClosed || balanceExhausted) break;
            sse.feed(decoder.decode(chunk, { stream: true }));
          }
          sse.feed(decoder.decode()); // flush 剩余字节
          sse.flush();
        }

        // ─────────────────────────────────────────
        // 10. 收尾：发送 final usage + 记录计费
        // ─────────────────────────────────────────
        completionCounter.flush(true);

        if (!clientClosed && !balanceExhausted) {
          const finalUsage = upstreamUsage || {
            prompt_tokens: promptTokensLocal,
            completion_tokens: completionCounter.get(),
            total_tokens: promptTokensLocal + completionCounter.get(),
            _source: "local",
          };

          await writeEvent({ usage: finalUsage, final: true });
          safeWrite("data: [DONE]\n\n");

          let baseId = tQuery.baseContent
            ? mmh3.x64.hash128(tQuery.baseContent, 31)
            : "default";

          await Billing.recordUsage(
            { ...finalUsage, result: fullContent },
            {
              model: tQuery.model,
              root: tQuery.root,
              baseId: baseId,
              folderName: sessionData.folderName,
              agentId: tQuery.agentId,
              documentId: tQuery.documentId,
              from: tQuery.from,
              marginRate: tQuery.taxRate || 0.1,
            },
            "success",
            db
          );
        }
      } catch (error) {
        const isAbort = error.name === "AbortError" || clientClosed;

        if (!isAbort) {
          console.error("[aiStreamRequest] Error:", error);
          if (!res.writableEnded) {
            safeWrite(
              `data: ${JSON.stringify({
                error: "Stream failed",
                message: error?.message || String(error),
              })}\n\n`
            );
          }
        }

        // 中断/失败时按实际消耗计费
        const consumed = completionCounter?.get() ?? 0;
        if (consumed > 0 && tQueryRef) {
          let baseId = tQueryRef.baseContent
            ? mmh3.x64.hash128(tQueryRef.baseContent, 31)
            : "default";

          await Billing.recordUsage(
            {
              prompt_tokens: promptTokensLocal,
              completion_tokens: consumed,
              total_tokens: promptTokensLocal + consumed,
              result: fullContent,
            },
            {
              model: tQueryRef.model,
              root: tQueryRef.rootAccount,
              baseId: baseId,
              agentId: tQueryRef.agentId,
              folderName: sessionData.folderName,
              from: tQueryRef.from,
              documentId: tQueryRef.documentId,
              marginRate: tQueryRef.taxRate || 0.1,
            },
            isAbort ? "interrupted" : "error",
            db
          );
        }
      } finally {
        cleanup();
      }
    },
  },
  aiGatewayRequest: {
    method: "post",
    dbItem: "visualTool",
    callback: async function (req, res, dbInfo, db) {
      let data = req.session.data || {};
      let tData = req.body;
      tData.folderName = data.folderName;
      try {
        if (data.folderName) {
          if (commonData.pointsSwitch) {
            const balanceOk = await Billing.checkBalance(data, 100,  db);
            if (!balanceOk) {
              return WebTool.requestTool.sendData(
                { ret: 2, message: "积分余额不足，请充值。" },
                req,
                res
              );
            }
          }

          try {
            aiRequestConfirm(req, res, db);
          } catch (e) {
            console.log("error", e);
            WebTool.requestTool.sendData(
              {
                ret: 1,
                message: "AI接口异常",
              },
              req,
              res
            );
          }
        } else {
          WebTool.requestTool.sendData(
            {
              ret: 1,
              message: "需要登录后使用。",
            },
            req,
            res
          );
        }
      } catch (e) {
        console.log("recordRequest err: ", e);
      }
    },
  },
};

module.exports = data;
