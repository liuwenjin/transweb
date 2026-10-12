let axios = require('axios');
let qs = require('qs');
const crypto = require('crypto');
const https = require('https');
const env = require('./env.js');

// 创建自定义的https.Agent：默认校验证书；如需对接自签名/内部端点，可设置 NODE_TLS_REJECT_UNAUTHORIZED=0
const httpsAgent = new https.Agent({
  rejectUnauthorized: env.opt("NODE_TLS_REJECT_UNAUTHORIZED") !== "0"
});

let hashTool = {
  md5: function (string) {
    // 创建一个md5 hash对象
    const hash = crypto.createHash('md5');

    // 更新hash对象，将字符串转换为utf8编码
    hash.update(string, 'utf8');

    // 获取计算后的哈希值，使用hex编码
    const md5 = hash.digest('hex');
    return md5;
  }
}


let AxiosRequest = function (config) {
  const service1 = axios.create({
    timeout: config.timeout || 60000 * 5, // request timeout  5分钟超时
    httpsAgent: httpsAgent
  });
  this.url = config.url;
  this.method = config.method;
  this.contentType = config.contentType || config.bodyType;
  this.config = config;
  var _self = this;
  return function (query, callback, param, errorCallback) {
    var method = _self.method;
    var url = _self.url;

    var cTypeHeader = {
      'Content-Type': _self.contentType || 'application/x-www-form-urlencoded; charset=utf-8',
    };

    if(query.constructor.name === "FormData") {
      cTypeHeader["Content-Type"] = "multipart/form-data";
    }

    if (typeof config.beforeRequest === "function") {


      config.beforeRequest(hashTool, query);
    }

    cTypeHeader.Authorization = _self.config.authorization || _self.config.Authorization;

    if (!cTypeHeader.Authorization) {
      delete cTypeHeader.Authorization;
    }

    for (let k in config.headers) {
      cTypeHeader[k] = config.headers[k];
    }

    var options = {
      headers: cTypeHeader,
      responseType: config.responseType || "json"
    };

    if (query && query._path) {
      url += '/' + query._path;
      delete query._path;
    }

    if (param) {
      url = url.bindData(param);
    }

    if (method === 'get' && query && !query._path) {
      let t = qs.stringify(query);
      if (url.search(/\?/) === -1) {
        url += '?' + t;
      } else {
        url += '&' + t;
      }
      query = {
        headers: cTypeHeader,
        responseType: config.responseType || "json"
      };
      options = null;
    } else if (method === 'delete' && query) {
      query = {
        data: query,
        headers: cTypeHeader,
        responseType: config.responseType || "json"
      };
      options = null;
    } else {
      if (
        cTypeHeader['Content-Type'].search(
          'application/x-www-form-urlencoded'
        ) !== -1
      ) {
        query = qs.stringify(query);
      }
    }

    console.log("request header:", options);
    service1[method](url, query, options).then(function (data) {
      if (data.data && typeof data.data.status === "number" && data.data.status < 0) {
        console.warn("adapter response status < 0:", data.data.status);
      }
      if (typeof callback === 'function') {
        try {
          
          callback(data);

        } catch (e) {
          if (typeof errorCallback === "function") {
            errorCallback(e);
          }
        }
      }
    }).catch(error => {
      console.log("error", error.response);
      if (typeof errorCallback === "function") {
        errorCallback(error);
      }
    });
  };
};


//模板HTML字符串与JSON对象绑定
String.prototype.bindData = function (obj, filter) {
  if (!obj || typeof obj !== "object") return this.toString();

  // 优化点 1: 正则表达式修改，通过 \s* 匹配并忽略括号内头尾空格
  // 优化点 2: 使用非贪婪匹配 [^}]+?
  const re = /{{\s*([^} \t\n\r]+)\s*}}/g;
  const _filters = filter || {};

  return this.replace(re, (match, path) => {
    // path 已经是去掉头尾空格后的键路径（如 "user.name"）
    const keys = path.split(".");
    let value = obj;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      value = value[key];

      // 如果路径中断，返回原始占位符以方便调试
      if (value === undefined || value === null) {
        return match; 
      }
    }

    // 优化点 3: 检查过滤器是否存在并执行
    const lastKey = keys[keys.length - 1];
    if (typeof _filters[lastKey] === "function") {
      return _filters[lastKey](value);
    }

    return value;
  });
};

var Adapter = function (config) {
  this.config = config;
  for (let k in config) {
    var item = config[k];
    if (item.url && item.method) {
      this[k] = new AxiosRequest(item);
    }
  }
};

module.exports = Adapter;