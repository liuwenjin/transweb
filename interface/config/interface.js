const ffmpeg = require("fluent-ffmpeg");
const { Readable } = require("stream");
let ConfigObject = require("../../custom/ConfigObject.js");
let path = require("path");
let t = path.resolve(__dirname, ".");
let cPath = t + "/common.js";
let commonData = new ConfigObject(cPath).data;
let env = require("../../custom/env.js");
// 将 base64 字符串转为 Buffer（去掉前缀）
function base64ToBuffer(base64Str) {
  const matches = base64Str.match(/^data:audio\/\w+;base64,(.+)$/);
  const data = matches ? matches[1] : base64Str;
  return Buffer.from(data, "base64");
}

let qCallback = function (query, _self) {
  query = query || {};
  let image = query.image || "";
  if (image) {
    try {
      query.image = JSON.parse(query.image);
    }
    catch (e) {
      query.image = image;
    }

    if (typeof query.image === "string") {
      query.image = [query.image];
    }
  }

  let tQuery = JSON.parse(JSON.stringify(_self.query));

  if (query.image && query.image.length > 0 && tQuery.messages.length > 1) {
    tQuery.messages.shift(); //移除系统角色
    tQuery.messages[0].content = [];
    for (let i = 0; i < query.image.length; i++) {
      tQuery.messages[0].content.push({
        "type": "image_url",
        "image_url": {
          "url": query.image[i]
        }
      });
    }

    tQuery.messages[0].content.unshift({
      "type": "text",
      "text": query.text || query.prompt || "请描述图片内容"
    });
  }
  else {
    tQuery.messages[0].content = query.content || query.text || query.prompt || "";
    tQuery.messages[0].content = tQuery.messages[0].content.bindData(query);
    tQuery.messages[0].role = "system";
    tQuery.messages[0].role = "system";
    if (query.context) {
      tQuery.messages[1].content = query.context || "";
      tQuery.messages[1].role = "user";
    }
    else {
      tQuery.messages[0].role = "user";
      tQuery.messages.pop();
    }
  }

  if (query.model) {
    tQuery.model = query.model;
  }

  if (query.apiKey) {
    _self.authorization = "Bearer " + query.apiKey;
  }
  if (query.authorization) {
    _self.authorization = query.authorization;
  }
  return tQuery;
}

function base64ToFile(base64, filename) {
  // 提取文件类型
  const [header, data] = base64.split(',');
  const mimeType = header.match(/:(.*?);/)[1];

  // 解码base64
  const binary = atob(data);
  const len = binary.length;
  const buffer = new ArrayBuffer(len);
  const view = new Uint8Array(buffer);

  for (let i = 0; i < len; i++) {
    view[i] = binary.charCodeAt(i);
  }

  // 创建 Blob 对象
  const blob = new Blob([view], { type: mimeType });

  // 创建 File 对象
  const file = new File([blob], filename, { type: mimeType });

  return file;
}

// 将 Buffer 转为可读流
function bufferToStream(buffer) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

// 将 WebM Buffer 转为 WAV Buffer（通过 ffmpeg）
function convertWebMBufferToWAVBuffer(webmBuffer) {
  const { PassThrough } = require("stream");
  const stream = bufferToStream(webmBuffer);
  return new Promise((resolve, reject) => {
    const chunks = [];
    const out = new PassThrough();
    out.on("data", (chunk) => chunks.push(chunk));
    out.on("end", () => resolve(Buffer.concat(chunks)));
    out.on("error", (err) => reject(err));
    ffmpeg(stream)
      .inputFormat("webm")
      .audioCodec("pcm_s16le")
      .audioFrequency(16000)
      .audioChannels(1)
      .format("wav")
      .on("error", (err) => reject(err))
      .pipe(out, { end: true });
  });
}

// 将 WAV Buffer 转为 base64（带前缀）
function bufferToBase64WAV(buffer) {
  return buffer.toString("base64");
}

// 封装为完整函数
async function convertWebMBase64ToWAVBase64(webmBase64) {
  const webmBuffer = base64ToBuffer(webmBase64);
  const wavBuffer = await convertWebMBufferToWAVBuffer(webmBuffer);
  console.log("wavBuffer.length", wavBuffer.length);
  return bufferToBase64WAV(wavBuffer);
}



let data = {
  updateCollectionInfo: {
    url: "/admin/updateCollectionInfo",
    method: "post",
  },
  queryOrder: {
    url: "/queryOrder",
    method: "get",
  },
  putQuestionData: {
    url: "/user/putQuestionData",
    method: "post",
    contentType: "application/json",
    dataType: "json",
  },
  "火山引擎-音频生成": {
    url: "https://openspeech.bytedance.com/api/v1/tts",
    method: "post",
    contentType: "application/json",
    dataType: "json",
    qCallback: function (query) {
      this.query.request.text = query.content;
      this.query.audio.voice_type =
        query.voiceType || this.query.audio.voice_type;
      this.query.audio.emotion = query.emotion || this.query.audio.emotion;
      this.query.audio.language = query.language || "cn";
      return this.query;
    },
    rCallback: function (rData) {
      let usage = rData.usage || {
        total_tokens: 600,
        prompt_tokens: 300,
        completion_tokens: 300,
      };
      usage.type = "aigcAudio";
      usage.total_tokens = usage.total_tokens || 0;
      return usage;
    },
    query: {
      app: {
        appid: "5992480103",
        token: env.opt("API_KEY_VOLCANO_TTS"),
        cluster: "volcano_tts",
      },
      user: {
        uid: "transweb-tts",
      },
      audio: {
        voice_type: "BV002_streaming",
        encoding: "mp3",
        compression_rate: 1,
        rate: 24000,
        speed_ratio: 1.0,
        volume_ratio: 1.0,
        pitch_ratio: 1.0,
        emotion: "happy",
        language: "cn",
      },
      request: {
        reqid: "uuid",
        text: "字节跳动语音合成",
        text_type: "plain",
        operation: "query",
        silence_duration: "125",
        with_frontend: "1",
        frontend_type: "unitTson",
        pure_english_opt: "1",
      },
    },
    headers: {
      Authorization: "Bearer;" + env.opt("API_KEY_VOLCANO_TTS"),
    },
  },
  "智能体@文心一言": {
    url: "https://agentapi.baidu.com/assistant/getAnswer?appId={{appId}}&secretKey={{secretKey}}",
    method: "post",
    contentType: "application/json",
    dataType: "json",
    qCallback: function (param) {
      let temp =
        "你会为用户提供安全，有帮助，准确的回答。同时，你会拒绝一切涉及恐怖主义，种族歧视，黄色暴力等问题的回答。";
      let content = !param.context
        ? `${temp}, 请回答[${param.content}] `
        : `${temp} 基于内容[${param.context}]内容范围或需求，按接下来具体要求回答问题 [${param.content}]`;
      this.query.message.content.value.showText = content;
      this.query.appId = param.appId || "";
      this.query.source = param.appId || "";
      this.query.secretKey = param.secretKey || "";
      return this.query;
    },
    rCallback: function (rData) {
      let usage = rData.usage || {
        total_tokens: 600,
        prompt_tokens: 300,
        completion_tokens: 300,
      };
      usage.type = "aigcText";
      usage.total_tokens = usage.total_tokens || 0;
      usage.result = rData.data.content[0].data;
      delete rData.data.content;
      return usage;
    },
    query: {
      source: "xxx",
      from: "openapi",
      openId: "liuwenjin",
      max_tokens: 8096,
      message: {
        content: {
          type: "text",
          value: {
            showText: "请介绍下 http 协议", // type 为 text 时必传字段，
          },
        },
      },
    },
  },
  "智能体@Coze": {
    url: "https://api.coze.cn/v3/chat",
    method: "post",
    contentType: "application/json",
    dataType: "json",
    qCallback: function (param) {
      let temp =
        "你会为用户提供安全，有帮助，准确的回答。同时，你会拒绝一切涉及恐怖主义，种族歧视，黄色暴力等问题的回答。";
      let content = !param.context
        ? `${temp}, 请回答[${param.content}] `
        : `${temp} 基于内容[${param.context}]内容范围或需求，按接下来具体要求回答问题 [${param.content}]`;
      this.query.message.content.value.showText = content;
      this.query.source = param.source || env.opt("COZE_SOURCE");
      this.query.secretKey = param.secretKey || env.opt("API_KEY_COZE_PAT");

      return this.query;
    },
    rCallback: function (rData) {
      let usage = rData.usage || {
        total_tokens: 600,
        prompt_tokens: 300,
        completion_tokens: 300,
      };
      usage.type = "aigcText";
      usage.total_tokens = usage.total_tokens || 0;
      usage.result = rData.data.content[0].data;
      delete rData.data.content;
      return usage;
    },
    query: {
      source: env.opt("COZE_SOURCE"),
      from: "openapi",
      openId: "liuwenjin",
      message: {
        content: {
          type: "text",
          value: {
            showText: "请介绍下 http 协议", // type 为 text 时必传字段，
          },
        },
      },
    },
  },
  "火山引擎-图片生成": {
    url: "https://ark.cn-beijing.volces.com/api/v3/images/generations",
    method: "post",
    contentType: "application/json",
    dataType: "json",
    qCallback: function (query) {
      query = query || {};
      query.prompt = query.content || query.prompt || query.text || "";
      this.query.prompt = query.prompt;
      this.query.image = query.image;
      if (typeof query.image === "string") {
        try {
          this.query.image = JSON.parse(query.image);
        }
        catch (e) {
          this.query.image = [query.image];
        }
      }
      this.query.size = query.size || this.query.size;
      if (query.apiKey) {
        // 支持调用方透传 apiKey
        this.authorization = "Bearer " + query.apiKey;
      }
      if (query.authorization) {
        this.authorization = query.authorization;
      }
      return this.query;
    },
    query: {
      model: "ep-20260224095639-6tbrk",
      prompt: "",
      image: "",
      size: "2k",
      watermark: false,
    },
    rCallback: function (rData) {
      rData.usage = rData.usage || {};
      let usage = {
        total_tokens: 1000,
        prompt_tokens: 0,
        completion_tokens: 1000,
      };
      usage.type = "aigcImage";
      usage.total_tokens = usage.total_tokens || 0;

      usage.result = rData.data[0].url;
      return usage;
    },
    authorization: "Bearer " + env.opt("API_KEY_VOLCANO_IMAGE"),
  },
  抖音豆包: {
    url: "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
    method: "post",
    contentType: "application/json",
    dataType: "json",
    qCallback: function (query) {
      query = query || {};
      query.content =
        query.content ||
        "按二级思维导图的结构，提炼system的内容，要求提炼出的要点简洁生动";
      query.context = query.context || "";
      this.query.messages[1].content = query.context; //用户输入
      this.query.messages[0].content = query.content; //提示词模板
      this.query.model = query.model || this.query.model; //ep-20240712003216-zwrjm
      if (query.apiKey) {
        // 支持调用方透传 apiKey
        this.authorization = "Bearer " + query.apiKey;
      }
      if (query.authorization) {
        this.authorization = query.authorization;
      }
      return this.query;
    },
    query: {
      model: "ep-20240712003216-zwrjm",
      messages: [
        {
          role: "system",
          content: "",
        },
        {
          role: "user",
          content: "",
        },
      ],
      stream: false,
    },
    rCallback: function (rData) {
      rData.usage = rData.usage || {};
      let content = rData.choices[0].message.content;
      let usage = rData.usage || {
        total_tokens: 0,
        prompt_tokens: 0,
        completion_tokens: 0,
      };
      usage.type = "aigcText";
      usage.total_tokens = usage.total_tokens || 0;
      usage.result = content;
      delete rData.choices;
      return usage;
    },
    authorization: "Bearer " + "xxx",
  },
  腾讯混元: {
    url: "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
    method: "post",
    contentType: "application/json",
    dataType: "json",
    qCallback: function (query) {
      let temp =
        "你会为用户提供安全，有帮助，准确的回答。同时，你会拒绝一切涉及恐怖主义，种族歧视，黄色暴力等问题的回答。";
      query.context = !query.context
        ? temp
        : `${temp} 基于内容[${query.context}]，回答 user 的问题`;
      this.query.input.messages[0].content = query.content; //提示词模板
      this.query.input.messages[1].content = query.context; //用户输入
      this.query.model = query.model || this.query.model;
      if (query.apiKey) {
        // 若 query.apiKey 存在则优先使用调用方传入的 key
        this.authorization = "Bearer " + query.apiKey;
      }
      if (query.authorization) {
        this.authorization = query.authorization;
      }
      return this.query;
    },
    query: {
      model: "",
      input: {
        messages: [
          {
            role: "system",
            content: "",
          },
          {
            role: "user",
            content: "",
          },
        ],
        parameters: {},
      },
    },
    rCallback: function (rData) {
      rData.usage = rData.usage || {};
      let content = rData.output.text;
      let usage = rData.usage || {
        total_tokens: 400,
        prompt_tokens: 200,
        completion_tokens: 200,
      };
      usage.type = "aigcText";
      usage.total_tokens = usage.total_tokens || 0;
      usage.result = content;
      delete rData.output;
      return usage;
    },
    authorization: "Bearer " + "xxx",
  },
  pixmiller抠图: {
    url: "https://api.pixmiller.com/v1/remove",
    method: "post",
    contentType: "multipart/form-data",
    dataType: "json",
    qCallback: function (query) {
      if (query.image.search("http") === -1) {
        this.query.image_file_b64 = query.image;
        delete this.query.image_url;
      } else {
        delete this.query.image_file_b64;
        this.query.image_url = query.image;
      }
      this.query.size = query.size || "auto";
      return this.query;
    },
    query: {
      image_file_b64: "",
      size: "auto",
      format: "png",
      type: "auto",
    },
    rCallback: function (rData) {
      let usage = rData.usage || {
        total_tokens: 1200,
        prompt_tokens: 200,
        completion_tokens: 1000,
      };
      usage.total_tokens = usage.total_tokens || 0;
      return usage;
    },
    headers: {
      "X-Api-Key": env.opt("API_KEY_PIXMILLER"),
    },
  },
  novitaAi: {
    url: "https://api.novita.ai/v3/remove-background",
    method: "post",
    contentType: "application/json",
    dataType: "json",
    qCallback: function (query) {
      if (query.image.search("http") === -1) {
        this.query.image_file = query.image;
      } else {
        this.query.image_file = query.image;
      }
      return this.query;
    },
    query: {
      image_file: "",
      extra: {
        response_image_type: "png",
      },
    },
    rCallback: function (rData) {
      let usage = rData.usage || {
        total_tokens: 1200,
        prompt_tokens: 200,
        completion_tokens: 1000,
      };
      rData.url = "data:image/jpeg;base64," + rData.image_file;
      usage.total_tokens = usage.total_tokens || 0;
      return usage;
    },
    headers: {
      Authorization: "Bearer " + env.opt("API_KEY_NOVITA"),
    },
  },
  novitaSeedream: {
    url: "https://api.novita.ai/v3/seedream-5.0-lite",
    method: "post",
    contentType: "application/json",
    dataType: "json",
    qCallback: function (query) {
      query = query || {};
      query.prompt = query.prompt || query.text || "";
      this.query.prompt = query.prompt;
      this.query.image = query.image;
      if (typeof query.image === "string") {
        this.query.image = [query.image];
      }
      this.query.size = query.size || this.query.size;
      // this.query.model = query.model || this.query.model; //ep-20240712003216-zwrjm
      if (query.apiKey) {
        this.authorization = "Bearer " + query.apiKey;
      }
      if (query.authorization) {
        this.authorization = query.authorization;
      }
      return this.query;
    },
    query: {
      prompt: "",
      image: "",
      size: "2k",
      watermark: false,
    },
    rCallback: function (rData) {
      let usage = {
        total_tokens: 1200,
        prompt_tokens: 200,
        completion_tokens: 1000,
      };
      usage.type = "aigcImage";
      usage.result = rData.images || [];
      usage.total_tokens = usage.total_tokens || 0;
      return usage;
    },
    headers: {
      Authorization: "Bearer " + env.opt("API_KEY_NOVITA"),
    },
  },
  "阿里-图片生成": {
    url: "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
    method: "post",
    contentType: "application/json",
    dataType: "json",
    qCallback: function (query) {
      query = query || {};
      query.prompt = query.prompt || query.text || "";

      let image = query.image || "";
      if (image) {
        try {
          query.image = JSON.parse(query.image);
        }
        catch (e) {
          console.log("query.image is not a valid JSON string, using it as is.");
          query.image = image;
        }

        if (typeof query.image === "string") {
          query.image = [query.image];
        }
      }
      this.query.input.messages[0].content = [];

      this.query.input.messages[0].content.push({
        type: "text",
        text: query.prompt,
      });

      for (let i = 0; i < query.image.length; i++) {
        this.query.input.messages[0].content.push({
          type: "image",
          image: query.image[i],
        });
      }

      this.query.model = query.model || this.query.model; //ep-20240712003216-zwrjm

      if (query.apiKey) {
        this.authorization = "Bearer " + query.apiKey;
      }
      if (query.authorization) {
        this.authorization = query.authorization;
      }
      return this.query;
    },
    rCallback: function (rData) {
      rData.usage = rData.usage || {};
      let content = rData.output.choices[0].message.content[0].image;
      let usage = {
        total_tokens: 800,
        prompt_tokens: 800,
        completion_tokens: 0,
      };
      usage.type = "aigcImage";
      usage.total_tokens = usage.total_tokens || 0;

      usage.result = content;
      usage.data = content;
      return usage;
    },
    query: {
      model: "wan2.7-image",
      input: {
        messages: [{
          role: "user",
          content: []
        }]
      },
      parameters: {
        strength: 0.6,
        image_size: "2K",
        n: 1
      }
    },
    headers: {
      Authorization: "Bearer " + env.opt("API_KEY_ALIYUN_IMAGE"),
    },
  },
  imageEdits302ai: {
    url: "https://api.302.ai/v1/images/edits",
    method: "post",
    contentType: "application/json",
    dataType: "json",
    qCallback: function (query) {
      query = query || {};
      query.prompt = query.prompt || query.text || "";
      this.query.prompt = query.prompt;
      this.query.image = query.image;
      if (query.apiKey) {
        this.authorization = "Bearer " + query.apiKey;
      }
      if (query.authorization) {
        this.authorization = query.authorization;
      }

      if (query.size && ["1024x1024", "1536x1024", "1024x1536"].indexOf(query.size) !== -1) {
        this.query.size = query.size;
      }

      // 使用本地副本构建 FormData，避免把 File/Number/Boolean 持久化到共享模板 this.query 中
      const q = Object.assign({}, this.query);
      let formdata = new FormData();
      for (let k in q) {
        if (k === "image" || k === "mask") {
          q[k] = base64ToFile(q[k], "image.png");
        }
        if (k === "n") {
          q[k] = Number(q[k]);
        }
        if (k === "stream") {
          q[k] = Boolean(q[k]);
        }
        formdata.append(k, q[k]);
      }

      return formdata;
    },
    rCallback: function (rData) {
      rData.usage = rData.usage || {};
      let usage = {
        total_tokens: 1000,
        prompt_tokens: 0,
        completion_tokens: 1000,
      };
      usage.type = "aigcImage";
      usage.total_tokens = usage.total_tokens || 0;
      usage.result = rData.data[0].url;
      rData.data = rData.data[0].url;
      return usage;
    },
    query: {
      prompt: "",
      image: "",
      model: "gpt-image-1-mini",
      background: "auto",
      output_format: "png",
      partial_images: 0,
      quality: "auto",
      stream: false,
      size: "1024x1536",
      n: 1,
    },
    headers: {
      Authorization: "Bearer " + env.opt("API_KEY_302AI_IMAGE"),
    },
  },
  "智谱-文本生成": {
    url: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
    method: "post",
    contentType: "application/json",
    dataType: "json",
    qCallback: function (query) {
      return qCallback(query, this);
    },
    query: {
      model: "glm-4.5",
      max_tokens: 49152,
      messages: [
        {
          role: "system",
          content: "",
        },
        {
          role: "user",
          content: "",
        },
      ],
    },
    rCallback: function (rData) {
      rData.usage = rData.usage || {};
      let content = rData.choices[0].message.content;
      let usage = rData.usage || {
        total_tokens: 400,
        prompt_tokens: 200,
        completion_tokens: 200,
      };
      usage.type = "aigcText";
      usage.result = content;
      delete rData.choices;
      usage.total_tokens = usage.total_tokens || 0;
      return usage;
    },
    authorization: "Bearer " + env.opt("API_KEY_ZHIPU_TEXT"),
  },
  "图片分析": {
    url: "https://api.302.ai/v1/chat/completions",
    method: "post",
    contentType: "application/json",
    dataType: "json",
    qCallback: function (query) {
      query = query || {};
      let image = query.image || "";
      try {
        query.image = JSON.parse(query.image);
      }
      catch (e) {
        query.image = image;
      }

      if (typeof query.image === "string") {
        query.image = [query.image];
      }

      this.query.messages[0].content = [];
      for (let i = 0; i < query.image.length; i++) {
        this.query.messages[0].content.push({
          "type": "image_url",
          "image_url": {
            "url": query.image[i]
          }
        });
      }

      this.query.messages[0].content.unshift({
        "type": "text",
        "text": query.text || query.prompt || "请描述图片内容"
      });

      if (query.model) {
        this.query.model = query.model;
      }

      if (query.apiKey) {
        this.authorization = "Bearer " + query.apiKey;
      }
      if (query.authorization) {
        this.authorization = query.authorization;
      }
      return this.query;
    },
    query: {
      "model": "grok-4-1-fast-non-reasoning",
      stream: false,
      thinking: {
        type: "disabled"
      },
      response_format: { type: "json_object" },
      messages: [
        {
          "role": "user",
          "content": [
            {
              "type": "image_url",
              "image_url": {
                "url": "https://cdn.bigmodel.cn/agent-demos/lark/113123.mov"
              }
            },
            {
              "type": "text",
              "text": "What are the image show about?"
            }
          ]
        },
        {
          role: "system",
          content: "你是一个只输出 JSON 的分析机器人。严禁输出任何 Markdown 标签或自然语言解释。"
        },
      ],
    },
    rCallback: function (rData) {
      rData.usage = rData.usage || {};
      let content = rData.choices[0].message.content;
      let usage = rData.usage || {
        total_tokens: 500,
        prompt_tokens: 0,
        completion_tokens: 500,
      };
      usage.type = "aigcText";
      usage.result = content;
      usage.model = this.query.model;
      delete rData.choices;
      usage.total_tokens = usage.total_tokens || 0;
      return usage;
    },
    authorization:
      "Bearer " + env.opt("API_KEY_ZHIPU_IMAGE_ANALYSIS"),
  },
  "智谱-图片生成": {
    url: "https://open.bigmodel.cn/api/paas/v4/images/generations",
    method: "post",
    contentType: "application/json",
    dataType: "json",
    qCallback: function (query) {
      //query.context = `请为这段音频字幕内容, 配上插画。字幕内容是: ${query.context}`;
      // query.content = query.content.slice(0, 150);
      this.query.prompt = `${query.prompt || query.content || query.context}`;
      // this.query.prompt = this.query.prompt.slice(0, 150);
      this.query.model = query.model || this.query.model;
      this.query.size = query.size || "1024x1024";
      let sizeMap = {
        小红书: "1024x1024",
        抖音: "768x1344",
        Bilibili: "1344x768",
        视频号: "768x1344",
      };
      if (query.platform) {
        this.query.size = sizeMap[query.platform];
      }
      if (query.apiKey) {
        this.authorization = "Bearer " + query.apiKey;
      }
      if (query.authorization) {
        this.authorization = query.authorization;
      }
      return this.query;
    },
    query: {
      model: "cogview-4-250304",
      prompt: "",
      size: "1024x1024",
    },
    rCallback: function (rData) {
      let usage = rData.usage || {
        total_tokens: 1200,
        prompt_tokens: 200,
        completion_tokens: 1000,
      };
      usage.type = "aigcImage";
      usage.total_tokens = usage.total_tokens || 0;
      return usage;
    },
    authorization: "Bearer " + env.opt("API_KEY_ZHIPU_IMAGE"),
  },
  "智能体@腾讯": {
    url: "https://open.hunyuan.tencent.com/openapi/v1/agent/chat/completions",
    method: "post",
    contentType: "application/json",
    dataType: "json",
    qCallback: function (query) {
      query = query || {};
      query.content =
        query.content ||
        "按二级思维导图的结构，提炼system的内容，要求提炼出的要点简洁生动";
      query.context = query.context || "";
      this.query.messages[0].content[0].text =
        query.context + "用户输入为" + query.content;
      if (query.token || query.apiKey) {
        this.authorization = "Bearer " + (query.token || query.apiKey);
      }
      if (query.authorization) {
        this.authorization = query.authorization;
      }
      this.query.assistant_id = query.assistant_id;
      this.query.user_id = query.user_id || new Date().getTime() + "";
      return this.query;
    },
    query: {
      stream: false,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "",
            },
          ],
        },
      ],
    },
    rCallback: function (rData) {
      rData.usage = rData.usage || {};
      let content = rData.choices[0].message.content;
      delete rData.choices;
      let usage = rData.usage;
      usage.result = content;
      usage.total_tokens = usage.total_tokens || 0;
      return usage;
    },
    authorization: "Bearer" + " sk-xxx",
  },
  custom: {
    url: "{{url}}",
    method: "post",
    contentType: "application/json",
    dataType: "json",
    qCallback: function (query) {
      query = query || {};
      query.content =
        query.content ||
        "按二级思维导图的结构，提炼system的内容，要求提炼出的要点简洁生动";
      query.context = query.context || "";
      this.query.messages[0].content = query.content;
      this.query.messages[1].content = query.context;
      for (let k in query) {
        if (k !== "context" && k !== "content") {
          this.query[k] = query[k];
        }
      }
      if (query.apiKey) {
        this.authorization = "Bearer " + query.apiKey;
      }
      return this.query;
    },
    query: {
      model: "",
      stream: false,
      messages: [
        {
          role: "system",
          content: "",
        },
        {
          role: "user",
          content: "",
        },
      ],
    },
    rCallback: function (rData) {
      rData.usage = rData.usage || {};
      let content = rData.choices[0].message.content;
      let usage = rData.usage || {
        total_tokens: 0,
        prompt_tokens: 0,
        completion_tokens: 0,
        result: content,
      };
      usage.result = content;
      usage.total_tokens = usage.total_tokens || 0;
      usage.apiName = rData.apiName || "";
      return usage;
    },
    authorization: "Bearer" + " sk-xxx",
  },
  ollama: {
    url: "{{url}}",
    method: "post",
    contentType: "application/json",
    dataType: "json",
    qCallback: function (query) {
      query = query || {};
      query.content =
        query.content ||
        "按二级思维导图的结构，提炼system的内容，要求提炼出的要点简洁生动";
      query.context = query.context || "";
      this.query.prompt = query.context;
      this.query.prompt += "\n\n\n用户输入内容为：" + query.content;
      this.query.model = query.model || this.query.model;
      this.query.url = query.url || "http://localhost:11434/api/generate";
      if (query.apiKey) {
        this.authorization = "Bearer " + query.apiKey;
      }
      if (query.authorization) {
        this.authorization = query.authorization;
      }
      return this.query;
    },
    query: {
      model: "deepseek-r1:1.5b",
      stream: false,
      prompt: "",
    },
    rCallback: function (rData) {
      rData.usage = rData.usage || {};
      let usage = {
        total_tokens: 0,
        prompt_tokens: 0,
        completion_tokens: 0,
        result: rData.response,
      };
      usage.total_tokens = usage.total_tokens || 0;
      return usage;
    },
  },
  test: {
    url: "http://119.96.198.70:8000/v1/completions",
    method: "post",
    contentType: "application/json",
    dataType: "json",
    qCallback: function (query) {
      query = query || {};
      this.query.prompt = query.context + "\n 用户输入: " + query.content;
      return this.query;
    },
    query: {
      model: "/data/qwen/Qwen3-14B-AWQ",
      max_tokens: 2048,
      prompt: "",
    },
    rCallback: function (rData) {
      rData = rData || {};
      rData.usage = rData.usage || {};
      let content = rData.choices[0].text;
      let usage = rData.usage || {
        total_tokens: 400,
        prompt_tokens: 200,
        completion_tokens: 200,
        result: content,
      };
      usage.tokenRateMap = this.tokenRateMap || {};
      usage.result = content;
      usage.total_tokens = usage.total_tokens || 0;
      return usage;
    }
  },
  "serpapiSearch": {
    url: "https://serpapi.com/search",
    method: "get",
    contentType: "application/x-www-form-urlencoded",
    dataType: "json",
    qCallback: function (query) {
      query = query || {};

      // 统一输入：query.q 是搜索关键词
      // 兼容你现有习惯：query.context / query.content 也可以用来传关键词
      let q =
        (query.q || "").trim() ||
        (query.content || "").trim() ||
        (query.context || "").trim() ||
        "TransWeb";

      // SerpApi 必填：api_key
      // 兼容两种传法：query.apiKey 或 query.api_key
      let apiKey = query.apiKey || query.api_key || env.opt("API_KEY_SERPAPI");
      if (!apiKey) {
        // 不在这里 throw（避免你们框架崩），只把缺失信息塞回 query，便于上层处理
        this.query = this.query || {};
        this.query.__error = "Missing serpapi api_key";
      }

      // engine: 默认 google
      let engine = query.engine || "google";

      // 基础 query 参数（GET query string）
      // 你们框架如果是 this.query 直接拼到 url 参数，就保持这个对象即可
      this.query = {
        engine: engine,
        q: q,
        api_key: apiKey,
        // 常用可选参数
        location: query.location || "",        // e.g. "Austin, Texas, United States"
        hl: query.hl || "zh-cn",               // language
        gl: query.gl || "cn",                  // country
        num: typeof query.num === "number" ? query.num : 10, // results per page
        start: typeof query.start === "number" ? query.start : 0,
        safe: query.safe || "active",          // safe search
        // 需要限制时间可以用：tbs / as_qdr（按 SerpApi/Google 参数）
        tbs: query.tbs || "",

        // 允许用户透传额外参数（不覆盖已设置的）
        ...(query.params && typeof query.params === "object" ? query.params : {}),
      };
      return this.query;
    },

    // 默认 query（可被 qCallback 覆盖）
    query: {
      engine: "google",
      q: "",
      api_key: "",
      hl: "zh-cn",
      gl: "cn",
      num: 10,
      start: 0,
      safe: "active",
      tbs: ""
    },

    tokenRateMap: {},

    rCallback: function (rData) {
      let content = JSON.stringify(rData);
      // 你原来是把 usage 伪装成 token usage，这里保持一致
      let usage = {
        total_tokens: 100,
        prompt_tokens: 0,
        completion_tokens: 100,
        result: content,
      };

      usage.tokenRateMap = this.tokenRateMap || {};
      return usage;
    },
  },
  "gpt-audio2text": {
    url: "https://api.openxs.top/v1/audio/transcriptions",
    method: "post",
    contentType: "multipart/form-data",
    dataType: "json",
    qCallback: async function (query) {
      query = query || {};
      const base64Str = query.content;
      const matches = base64Str.match(/^data:(.*);base64,(.*)$/);

      if (!matches) throw new Error("Invalid base64 string");

      const mimeType = matches[1]; //
      let base64 = matches[2]; // base64纯数据
      console.log("mimeType", mimeType);
      console.log("base64.length", base64.length);
      // let arr = mimeType.split("/");
      let tMap = {
        "audio/wav": "wav",
        "audio/mpeg": "mp3",
        "audio/mp4": "mp4",
        "audio/x-m4a": "mp4",
        "audio/webm": "webm",
      };

      if (mimeType === "audio/webm") {
        base64 = await convertWebMBase64ToWAVBase64(base64);
      }

      const binaryData = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const file = new File(
        [binaryData],
        "audio." + (tMap[mimeType] || "wav"),
        { type: mimeType }
      );

      const formData = new FormData();
      formData.append("file", file);
      formData.append("model", "whisper-1");
      formData.append("response_format", query.format || "srt");
      formData.append("language", query.language || "zh");
      this.query = formData;
      return this.query;
    },
    query: {
      model: "whisper-1",
    },
    rCallback: function (rData) {
      rData.usage = rData.usage || {};
      rData.usage.result = rData.data;
      const usage = rData.usage || {};
      usage.total_tokens = usage.total_tokens || 3000;
      return usage;
    },
    authorization:
      "Bearer " + env.opt("API_KEY_AUDIO2TEXT"),
  },
  "gpt-text2audio": {
    url: "https://api.gptsapi.net/v1/audio/speech",
    method: "post",
    contentType: "application/json",
    responseType: "arraybuffer",
    qCallback: function (query) {
      query = query || {};
      this.query.input = query.content;
      this.query.voice = query.voice;
      this.query.model = query.model || this.query.model;
      return this.query;
    },
    query: {
      model: "tts-1",
      input: "",
      voice: "alloy",
    },
    rCallback: function (rData) {
      const base64 = Buffer.from(rData.result).toString("base64");
      //const base64 = rData.result.toString('base64');
      const dataUrl = `data:audio/mpeg;base64,${base64}`;
      rData.result = dataUrl;
      const usage = rData.usage || {};
      usage.total_tokens = usage.total_tokens || 3000;
      return usage;
    },
    authorization:
      "Bearer " + env.opt("API_KEY_TEXT2AUDIO"),
  },
  "azure-text2audio": {
    url: "https://eastus2.tts.speech.microsoft.com/cognitiveservices/v1",
    method: "post",
    contentType: "application/ssml+xml",
    responseType: "arraybuffer",
    qCallback: function (query) {
      query = query || {};
      const text = query.content || "";
      const voice = query.voice || "zh-CN-XiaoxiaoNeural";
      const rate = query.rate || "0%";
      const pitch = query.pitch || "0%";

      // 构造 SSML
      this.query = `
<speak version="1.0" xml:lang="zh-CN">
  <voice name="${voice}">
    <prosody rate="${rate}" pitch="${pitch}">
      ${text}
    </prosody>
  </voice>
</speak>
    `.trim();

      return this.query;
    },
    query: "",
    rCallback: function (rData) {
      /**
       * Azure Speech TTS
       * rData.result: Buffer | ArrayBuffer | Uint8Array
       */

      let buf = rData.result;

      // ---------- 1. 严格转为 Node Buffer（Azure 实际是 binary） ----------
      if (typeof Buffer !== "undefined") {
        if (Buffer.isBuffer(buf)) {
          // ok
        } else if (buf instanceof ArrayBuffer) {
          buf = Buffer.from(new Uint8Array(buf));
        } else if (buf instanceof Uint8Array) {
          buf = Buffer.from(buf);
        } else {
          throw new Error("Azure TTS rCallback: invalid binary response");
        }
      }

      const byteLength = buf.length;

      // ---------- 2. Azure 输出格式判断（基于真实音频头） ----------
      // MP3: ID3 / 0xFFFB
      // WAV: RIFF
      let mime = "audio/mpeg";
      const head4 = buf.slice(0, 4).toString("ascii");

      if (head4 === "RIFF") {
        mime = "audio/wav";
      }

      // ---------- 3. Binary → base64 data URL ----------
      const base64 = buf.toString("base64");
      rData.result = `data:${mime};base64,${base64}`;

      // ---------- 4. Azure 语义下的 usage（真实、保守、不虚构） ----------
      /**
       * Azure 不返回 token
       * usage 仅用于你系统内部对齐
       */
      const usage = {
        provider: "azure-speech",
        audio_bytes: byteLength,
        output_format: mime,
      };

      return usage;
    },
    headers: {
      "Ocp-Apim-Subscription-Key": env.opt("API_KEY_AZURE_SPEECH"),
      "X-Microsoft-OutputFormat": "audio-24khz-160kbitrate-mono-mp3",
      "User-Agent": "TransWeb-TTS",
    },
  }
};

let tConfig = commonData.apiConfig || {};
for (let k in tConfig) {
  let commonConfig = {
    url: "",
    method: "post",
    contentType: "application/json",
    dataType: "json",
    qCallback: function (query) {
      return qCallback(query, this);
    },
    query: {
      model: "",
      messages: [
        {
          role: "system",
          content: "",
        },
        {
          role: "user",
          content: "",
        },
      ],
      max_tokens: 32000,
      parameters: {},
      stream: false,
    },
    rCallback: function (rData) {
      rData.usage = rData.usage || {};
      let content = rData.choices[0].message.content;

      let usage = rData.usage || {
        total_tokens: 1000,
        prompt_tokens: 0,
        completion_tokens: 0,
      };
      usage.total_tokens = usage.total_tokens || 0;
      delete rData.choices;
      usage.result = content;
      return usage;
    }
  }
  data[k] = data[k] || commonConfig || {};
  data[k] = Object.assign({}, data[k], tConfig[k]);
}

module.exports = data;
