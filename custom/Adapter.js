import config from './config';
import axios from 'axios';
import {
  Message
} from 'element-ui'
let qs = require('qs');



let AxiosRequest = function (url, method, bodyType) {
  this.url = url;
  this.method = method;
  this.bodyType = bodyType;
  var _self = this;
  return function (query, callback) {
    var method = _self.method;
    var url = _self.url;
    var cTypeHeader = {
      'Content-Type': bodyType || "application/x-www-form-urlencoded; charset=utf-8"
    }

    if (query._path) {
      url += "/" + query._path;
      delete query._path;
      let t = qs.stringify(query);
      url += "?" + t;
    } else {}

    if (method !== "get" && cTypeHeader['Content-Type'].search("application/x-www-form-urlencoded") !== -1) {
      query = qs.stringify(query);
    }

    var options = {
      headers: cTypeHeader,
    }

    var token = localStorage.getItem("token");
    if (token) {
      options.headers.Authorization = token;
    }

    if (method === "get") {
      axios.get(url, {
        params: query,
        headers: options.headers
      }).then(function (data) {
        if (typeof (callback) === "function") {
          callback(data);
        }
      });
    } else {
      axios[method](url, query, options).then(function (data) {
        if (typeof (callback) === "function") {
          callback(data);
        }
      });
    }

  }
}

const adapter = {}
for (let k in config) {
  var item = config[k];
  if (item.url && item.method) {
    adapter[k] = new AxiosRequest(item.url, item.method, item.bodyType);
  }
}
adapter.config = config;


export default adapter