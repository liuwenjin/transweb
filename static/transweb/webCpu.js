var WebAdapter = {};
WebAdapter.load = function (url, callback, shadowDom, type, tCallback) {
  var scriptId = MurmurHash.rule(url, 31);
  var script = document.getElementById(scriptId);
  if (script) {
    script.parentNode.removeChild(script);
  }
  script = document.createElement("script");
  script.setAttribute("src", url);
  script.setAttribute("charset", "utf-8");
  script.setAttribute("type", type || "application/javascript");
  // script.setAttribute("type", "module");
  if (script.readyState) {
    WebTool.bind(script, "readystatechange", function () {
      if (script.readyState === "loaded" || script.readyState === "complete") {
        if (typeof callback === "function") {
          callback();
        }
      }
    });
  } else {
    WebTool.bind(script, "load", function () {
      if (typeof callback === "function") {
        callback();
      }
    });
  }
  var _head = document.getElementsByTagName("head")[0];
  if (shadowDom && shadowDom.appendChild) {
    _head = shadowDom;
  }
  _head.appendChild(script);
  return script;
};

WebAdapter.jsonp = function (url, run) {
  var k = WebTool.urlQuery(url, "callback");
  var callBack = k || "webAdapter_callBack_" + new Date().getTime();
  if (typeof run === "function") {
    window[callBack] = run;
  } else {
    window[callBack] = function (data) { };
  }
  if (!k) {
    if (url.indexOf("?") === -1) {
      url += "?callback=" + callBack;
    } else {
      url += "&callback=" + callBack;
    }
  }

  if (url && url.search(/^data:/) !== -1) {
    url = url.split("?")[0];
  }

  var script = document.getElementById("webAdapterCallBackScript");
  if (script) {
    script.parentNode.removeChild(script);
  }
  script = document.createElement("script");
  script.id = "webAdapterCallBackScript";
  if (url && url.search(/\(function/) === 0) {
    script.innerHTML = url;
  } else {
    script.setAttribute("src", url);
  }
  script.setAttribute("charset", "utf-8");
  script.setAttribute("type", "application/javascript");
  var _head = document.getElementsByTagName("head")[0];
  _head.appendChild(script);

  if (script) {
    script.parentNode.removeChild(script);
  }
};

WebAdapter.loadCSS = function (url, shadowDom) {
  if (url && url.search("{") === -1) {
    var cssLink = document.createElement("link");
    cssLink.setAttribute("type", "text/css");
    cssLink.setAttribute("class", "TransWebCss");
    cssLink.setAttribute("rel", "stylesheet");
    cssLink.setAttribute("href", url);
  } else {
    var cssLink = document.createElement("style");
    cssLink.innerHTML = url;
  }
  var _head = document.getElementsByTagName("head")[0];
  if (shadowDom && shadowDom.appendChild) {
    _head = shadowDom;
  }
  _head.appendChild(cssLink);
  return cssLink;
};

WebAdapter.report = function (url, params) {
  var url = WebTool.attachParams(url, params);
  var img = document.createElement("img");
  img.src = url;
};

WebAdapter.request = function (url, type, query, callback, options, params) {
  if (!url) {
    return false;
  }
  options = options || {};
  options.params = params || options.params;
  if (options.params) {
    url = WebTool.bindData(url, options.params);
  }

  if (type !== "_jsonp") {
    if (typeof options === "string") {
      options = {
        dataType: options,
      };
    }
    var request = new WebRequest(url, type, options);
    request(
      query,
      function (data) {
        if (typeof callback === "function") {
          callback(data);
        }
      },
      params
    );
  } else {
    this.loadCardData(url, query, callback);
  }
};

WebAdapter.loadCardData = function (url, key, myCallback) {
  var t = url.split("?")[0];
  let id = MurmurHash.rule(t);
  let aItem = {
    id: id,
    url: url,
    key: key,
    callback: myCallback,
  };
  this.jsonpMap = this.jsonpMap || {};
  this.jsonpMap[key] = this.jsonpMap[key] || {};
  this.jsonpMap[key][id] = aItem;

  this.jsonpCallback = this.jsonpCallback || {};
  this.jsonpCallback[key + id] = this.jsonpCallback[key + id] || [];
  this.jsonpCallback[key + id].push(aItem);
  var _self = this;
  window[key] = function (d) {
    d.appUrl = url.split("?")[0];
    let item = _self.jsonpMap[key][id];
    if (
      item &&
      item.id === id &&
      _self.jsonpMap[key][id] &&
      typeof item.callback === "function"
    ) {
      item.callback(d);
    }
    let index1 = _self.jsonpCallback[key + id].indexOf(item);
    _self.jsonpCallback[key + id].splice(index1, 1);
    delete _self.jsonpMap[key][id];

    if (_self.jsonpCallback[key + id].length !== 0) {
      item = _self.jsonpCallback[key + id].pop();
      _self.loadCardData(item.url, item.key, item.callback);
    }
  };

  var elem = document.getElementById(id);
  if (elem) {
    elem.parentNode.removeChild(elem);
  }
  var s = document.createElement("script");
  s.id = id;
  if (url && url.search(/^data:/) !== -1) {
    s.src = url;
  } else {
    s.src = WebTool.attachParams(url, {
      callback: key,
    });
  }
  document.head.appendChild(s);
};

var WebRequest = function (url, type, options) {
  var type = type || "jsonp";
  options = options || {};
  if (typeof options === "string") {
    options = {
      dataType: options,
    };
  }

  if (
    type !== "jsonp" &&
    url &&
    url.search(location.origin) === -1 &&
    options.proxy === undefined
  ) {
    options.proxy = true;
  }
  // options.proxy = options.proxy  true : options.proxy;

  if (type === "jsonp" || type === "noEcho" || type === "_jsonp") {
    return new CustomInterface(url, type, options);
  } else {
    return new AjaxInterface(url, type, options);
  }
};

var CustomInterface = function (url, type, options) {
  this.options = {};
  this.type = type || "jsonp";
  this.header = options.header;
  this.query = options.query || {};
  for (var k in options) {
    if (options[k] === 1) {
      this.options[k] = 1;
    }
  }
  this.url = url;
  return this.extend();
};

CustomInterface.prototype.extend = function () {
  var _this = this;
  return function (data, func, params) {
    if (_this.check(_this.options, data)) {
      var url = _this.url;
      if (params) {
        url = WebTool.bindData(url, params);
      }
      if (typeof _this.query === "string") {
        url = WebTool.attachParams(url, {
          callback: _this.query,
        });
      }
      if (_this.type === "jsonp" || _this.type === "_jsonp") {
        url = WebTool.attachParams(url, data);
        WebAdapter.jsonp(url, func);
      } else {
        WebAdapter.report(url, data);
      }
    }
  };
};

CustomInterface.prototype.check = function (options, params) {
  var ret = true;
  for (var k in options) {
    if (!params || !params[k]) {
      ret = false;
      console.log("Failed, miss the param of '" + k + "'.");
      break;
    }
  }
  return ret;
};

var BackInterface = function (url, callback) {
  var _self = this;
  WebAdapter.request(url, "get", null, function (data) {
    _self.data = data;
    var data = data.data;
    for (var k in data) {
      _self[k] = (function () {
        var m = data[k].method;
        var url = data[k].url;
        var fn = function (param, callback, dataType) {
          $[m](url, param, callback, dataType);
        };
        return fn;
      })();
    }
    if (typeof callback === "function") {
      callback(_self);
    }
  });
};
BackInterface.prototype.init = function (data) {
  this.data = data;
  for (var k in data) {
    this[k] = (function () {
      var m = data[k].method;
      var url = data[k].url;
      var fn = function (param, callback, dataType) {
        WebAdapter.request(url, m, param, callback);
      };
      return fn;
    })();
  }
};

var AjaxInterface = function (url, type, options) {
  this.url = url;
  this.contentType = options.contentType;
  this.type = type;
  this.onTimeout = options.onTimeout;
  this.dataType = options.dataType;
  this.timeout = options.timeout;
  this.header = options.header;
  this.proxy = options.proxy;
  this.authorization = options.authorization;
  if (this.proxy === true) {
    let arr = this.url.match(/https?:\/\/([^/]+)\//i);
    if (arr && arr[0]) {
      this.proxy = arr[0] + "proxy.html";
      this.url = url.replace(arr[0], "");
    } else {
      this.proxy = false;
    }
  }
  return this.init(type, options.dataType);
};

AjaxInterface.prototype.sendData = function (
  query,
  callback,
  params,
  errCallback
) {
  let data = query;
  let url = this.url;

  // 1. 替换 URL 中的路径参数 (如 /api/user/:id)
  if (params && typeof WebTool.bindData === "function") {
    url = WebTool.bindData(url, params);
  }

  const type = (this.type || "GET").toUpperCase();
  const dType = this.dataType || "json";

  const cTypeMap = {
    json: "application/json; charset=UTF-8",
    "form-data": "multipart/form-data",
    "form-urlencoded": "application/x-www-form-urlencoded; charset=UTF-8",
    text: "text/plain; charset=UTF-8",
    raw: "text/plain; charset=UTF-8"
  };

  // 获取用户显式设置的 contentType（如果有的话）
  let cType = this.contentType ? (cTypeMap[this.contentType] || this.contentType) : null;

  // 判断是否为 FormData
  const isFormData = query instanceof FormData || (query && query.constructor && query.constructor.name === "FormData");
  if (isFormData) {
    cType = "multipart/form-data";
  }

  // 判断是否为原始数据类型（字符串、ArrayBuffer、Blob等）
  const isRawData = typeof query === "string" ||
    query instanceof ArrayBuffer ||
    (typeof Blob !== "undefined" && query instanceof Blob);

  // 🌟【方式二核心：智能推断 Content-Type】
  if (!cType) {
    if (typeof query === "string") {
      // 传入纯字符串且未指定 contentType 时，自动设为纯文本，防止被当作 form-urlencoded 解析
      cType = "text/plain; charset=UTF-8";
    } else {
      // 传入普通对象且未指定时，保持默认表单类型
      cType = "application/x-www-form-urlencoded; charset=UTF-8";
    }
  }

  // 2. GET / DELETE 请求处理
  if (type === "GET" || type === "DELETE") {
    if (query && typeof query === "object" && !isFormData) {
      var tData = {};
      Object.keys(query).forEach(function (k) {
        if (typeof query[k] !== "function") {
          tData[k] = typeof query[k] === "object" ? JSON.stringify(query[k]) : query[k];
        }
      });
      url = WebTool.attachParams(url, tData);
    }
    data = null; // GET/DELETE 请求体设为 null
  }
  // 3. POST / PUT 等有请求体的请求处理
  else {
    // 纯文本、原始数据或 FormData，直接原样发送，不进行对象遍历和转换
    if (isRawData || isFormData) {
      data = query;
    }
    // 只有传入的是普通 Object 时，才根据 cType 进行转换
    else if (query && typeof query === "object") {
      if (cType.indexOf("application/x-www-form-urlencoded") !== -1) {
        var formattedData = {};
        Object.keys(query).forEach(function (k) {
          if (typeof query[k] !== "function") {
            try {
              formattedData[k] = typeof query[k] === "object" ? JSON.stringify(query[k]) : query[k];
            } catch (e) {
              formattedData[k] = query[k];
            }
          }
        });

        if (typeof URLSearchParams !== "undefined") {
          var searchParams = new URLSearchParams();
          Object.keys(formattedData).forEach(function (key) {
            searchParams.append(key, formattedData[key]);
          });
          data = searchParams.toString();
        } else {
          var attached = WebTool.attachParams("", formattedData);
          data = attached.indexOf("?") !== -1 ? attached.split("?")[1] : attached;
        }
      } else if (cType.indexOf("application/json") !== -1) {
        data = JSON.stringify(query);
      } else if (cType.indexOf("multipart/form-data") !== -1) {
        data = new FormData();
        Object.keys(query).forEach(function (k) {
          if (typeof query[k] !== "function") {
            data.append(k, query[k]);
          }
        });
      }
    }
  }

  let _self = this;
  let xhr = this.getHttpObj();

  // 4. 超时处理
  let timeout = _self.timeout || 3 * 60000;
  let timer = setTimeout(function () {
    xhr.abort();
    console.warn("⏱ 请求超时: " + url);
    if (typeof _self.onTimeout === "function") {
      _self.onTimeout(url);
    }
    if (typeof errCallback === "function") {
      errCallback("⏱ 请求超时: " + url);
    }
  }, timeout);

  // 5. 响应处理
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 || xhr.readyState === "complete") {
      clearTimeout(timer);

      if (
        AjaxInterface.interceptor &&
        typeof AjaxInterface.interceptor.response === "function"
      ) {
        AjaxInterface.interceptor.response(xhr);
      }

      if (xhr.status > 399 || xhr.status === 0) {
        console.error("❌ 请求失败: " + xhr.status);
        if (typeof errCallback === "function") {
          errCallback("❌ 请求失败: " + xhr.status);
        }
        return;
      }

      if (typeof callback === "function") {
        var d = xhr.responseText;
        if (dType === "json") {
          try {
            d = JSON.parse(d);
          } catch (e) {
            console.warn("JSON parse error.");
          }
        }
        callback(d);
      }
    }
  };

  // 6. 网络错误
  xhr.onerror = function () {
    clearTimeout(timer);
    if (typeof errCallback === "function") {
      errCallback("❌ 网络连接错误");
    }
  };

  xhr.open(type, url, true);

  // multipart/form-data 不要手动设 Header
  if (cType.indexOf("multipart/form-data") === -1) {
    xhr.setRequestHeader("Content-Type", cType);
  }

  if (_self.authorization) {
    xhr.setRequestHeader("Authorization", _self.authorization);
  }

  _self.header = _self.header || {};
  if (location.pathname.indexOf("/proxy.html") === -1) {
    _self.header["transweb-token"] =
      webCpu.transwebToken || localStorage.getItem("transweb-token") || "t_" + new Date().getTime();
    webCpu.transwebToken = _self.header["transweb-token"];
  }

  if (_self.header) {
    Object.keys(_self.header).forEach(function (k) {
      xhr.setRequestHeader(k, _self.header[k]);
    });
  }

  if (
    AjaxInterface.interceptor &&
    typeof AjaxInterface.interceptor.request === "function"
  ) {
    AjaxInterface.interceptor.request(xhr);
  }

  // 7. 发送
  xhr.send(data);
};

AjaxInterface.prototype.init = function () {
  var _self = this;
  return function (query, callback, params, errCallback) {
    if (_self.proxy) {
      var proxy = _self.proxy;
      var key = MurmurHash.rule(proxy, 31);
      webCpu.crossItem = webCpu.crossItem || {};
      _self.header = _self.header || {};
      if (params) {
        _self.url = _self.url.bindData(params);
      }
      if (location.pathname.search("/proxy.html") === -1) {
        _self.header["transweb-token"] =
          webCpu.transwebToken || localStorage.getItem("transweb-token") || "t_" + new Date().getTime();

        webCpu.transwebToken = _self.header["transweb-token"];
      }
      if (!webCpu.crossItem[key]) {
        console.log("create crossDomainItem");
        webCpu.crossItem[key] = new CrossDomainService(proxy, function () {
          webCpu.crossItem[key].request(
            _self.url,
            query,
            _self.type,
            callback,
            _self.dataType,
            _self.contentType,
            _self.header
          );
        });
      } else if (webCpu.crossItem[key] && webCpu.crossItem[key].inited) {
        console.log("@@@send cross request");
        webCpu.crossItem[key].request(
          _self.url,
          query,
          _self.type,
          callback,
          _self.dataType,
          _self.contentType,
          _self.header
        );
      } else {
        console.log("waiting crossItem inited");
        setTimeout(function () {
          if (webCpu.crossItem[key].inited) {
            console.log("###send cross request after waiting");
            webCpu.crossItem[key].request(
              _self.url,
              query,
              _self.type,
              callback,
              _self.dataType,
              _self.contentType,
              _self.header
            );
          } else {
            setTimeout(() => {
              console.log("$$$send cross request after twice waiting");
              webCpu.crossItem[key].request(
                _self.url,
                query,
                _self.type,
                callback,
                _self.dataType,
                _self.contentType,
                _self.header
              );
            }, 3000);
          }
        }, 1000);
      }
    } else {
      _self.sendData(query, callback, params, errCallback);
    }
  };
};

AjaxInterface.prototype.getHttpObj = function () {
  var xmlHttp = null;
  try {
    // Firefox, Opera 8.0+, Safari
    xmlHttp = new XMLHttpRequest();
  } catch (e) {
    //Internet Explorer
    try {
      xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {
      xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
  }
  return xmlHttp;
};

var ViewControl = function (config, callback, mission) {
  this.config = config;
  if (typeof callback === "function") {
    this.callback = callback;
  }
  this.initConfig();
  this.mission = mission;
  var _self = this;
  if (this.isReady()) {
    setTimeout(function () {
      _self.execute();
    }, 100);
  }
};

ViewControl.prototype.initTask = function (task) {
  if (typeof task === "string") {
    task = {
      container: document.getElementById(task),
    };
  } else if (typeof task === "function") {
    task = {
      promise: {
        afterRender: task,
      },
    };
  } else if (!!task && task.nodeName) {
    task = {
      container: task,
    };
  } else if (!!task && typeof task.container === "string") {
    task.container = document.getElementById(task.container);
  } else {
  }

  task.className = this.config.name;
  return task;
};

ViewControl.prototype.initConfig = function () {
  if (this.config) {
    //init component elements;
    this.html = "";
    this.css = {};
    this.script = {};
    //Set script status
    this.sStatus = 0;
    if (typeof this.config.script === "string") {
      if (this.config.name !== "main" && this.config.name.search("m_") !== 0) {
        this.config.script = this.getPath(this.config.script);
      }
      this.sStatus = 1;
    } else if (typeof this.config.script === "object") {
      for (var i in this.config.script) {
        this.sStatus++;
        if (
          this.config.name !== "main" &&
          this.config.name.search("m_") !== 0
        ) {
          this.config.script[i] = this.getPath(this.config.script[i]);
        }
      }
    }
    //set html status
    this.hStatus = 0;
    if (
      typeof this.config.html === "string" &&
      this.config.html.search("<") === -1
    ) {
      this.config.html = this.getPath(this.config.html);
      this.htmlFetch = new WebRequest(this.config.html, "GET");
      this.hStatus = 1;
    } else {
      this.html = document.createElement("div");
      this.html.innerHTML = this.config.html || "";
    }
    //load css style
    this.prepareCss();
    //load html and script
    this.state = -1;
    this.load();
  }
};

ViewControl.prototype.load = function () {
  if (this.state === -1) {
    if (this.hStatus > 0) {
      this.prepareHtml();
    }
    if (this.sStatus > 0) {
      this.prepareScript();
    }
    this.state = 0;
  }
};

ViewControl.prototype.render = function (task) {
  //update the task state
  var task = this.initTask(task);
  task.defaultData = task.data;
  if (task && task.url && typeof task.url === "string") {
    this.updateFromRemote(task);
  } else {
    this.update(task);
  }
};

ViewControl.prototype.updateFromRemote = function (task) {
  var _self = this;
  task.query = task.query || {};
  // task.query._t = (new Date()).getTime();
  var callback = function (data) {
    if (task.dataType === "json") {
      var tData = data;
      try {
        data = WebTool.stringToObject(data);
      } catch (e) {
        if (window["$"] && $.xml2json) {
          data = $.xml2json(tData);
        }
      }
    } else if (task.dataType === "xml") {
      var t = document.createElement("div");
      t.innerHTML = data;
      data = t.childNodes[0];
    }

    task.data = data;
    _self.update(task);
  };
  var rType = task.requestType || task.method || "jsonp";
  // var url = WebTool.attachParams(task.url, task.query);
  let url = task.url;

  let re = `^${location.origin}`;
  if (
    task.url &&
    task.url.search(/^http/) !== -1 &&
    task.proxy === undefined &&
    task.url.search(re) === -1
  ) {
    task.proxy = true;
  } else if (
    task.proxy === undefined &&
    task.url &&
    task.url.search(/^http/) !== -1
  ) {
    task.proxy = false;
  }

  WebAdapter.request(url, rType, task.query, callback, {
    contentType: task.contentType,
    dataType: task.dataType,
    header: task.header,
    proxy: task.proxy,
    params: task.params,
  });
};

ViewControl.prototype._update = function (task) {
  var t = task.container;
  //Todo: adjust the content area
  if (
    task.style &&
    typeof task.style.width === "number" &&
    typeof task.style.height === "number"
  ) {
    var width = task.style.width;
    var height = task.style.height;
    var size = {
      width: task.container.scrollWidth,
      height: task.container.scrollHeight,
    };
    task.style.width = width + "px";
    task.style.height = height + "px";
    var radio = Math.min(size.height / height, size.width / width);
    radio = Math.min(1, radio);

    var offset = {
      x: Math.max((size.width - width * radio) / 2, 0),
      y: Math.max((size.height - height * radio) / 2, 0),
    };

    task.style.marginLeft = `${offset.x}px`;
    task.style.marginTop = `${offset.y}px`;
    task.transformRadio = radio;
    task.transform = {
      transform: `scale(${radio}, ${radio})`,
      transformOrigin: "0 0",
    };
  }

  if (task.promise && typeof task.promise.beforeRender === "function") {
    if (task.cardName) {
      console.log(
        "start beforeRender of task[%1]".replace("%1", task.cardName)
      );
    }
    task.promise.beforeRender(t, task.data, task);
  }
  var tData = null;
  if (
    task.option &&
    task.option.filter &&
    task.option.filter.key &&
    task.data.constructor.name === "Array"
  ) {
    tData = [];
    var key = task.option.filter.key;
    var value = task.option.filter.value;
    for (var i = 0; i < task.data.length; i++) {
      if (task.data[i][key] === value || value === "_all") {
        tData.push(task.data[i]);
      }
    }
  }
  task._data = task._data || tData || task.data;

  if (
    task.option &&
    task.footArea &&
    webCpu &&
    webCpu.CardItem &&
    webCpu.CardItem.Pagination &&
    task.option.page
  ) {
    var page = task.option.page;
    if (typeof task.option.pageFilter === "function") {
      page = task.option.pageFilter(page);
    }

    if (page.front) {
      if (page.dataKey && task._data[page.dataKey]) {
        page.total = task._data[page.dataKey].length;
        task._data = WebTool.copyObject(task.data);
      } else {
        page.total = task._data.length;
      }
      task.pageCallback =
        task.pageCallback ||
        function (n, size, flag) {
          if (n < 1) {
            n = 1;
          }
          flag = flag || 0;
          var start = 0;
          if (!flag) {
            start = n - 1;
          }

          size = this.pagination.size;

          var _data = [];

          if (page.dataKey && this._data[page.dataKey]) {
            _data = WebTool.copyObject(this._data[page.dataKey]);
            this.data[page.dataKey] = _data.slice(start * size, n * size);
          } else {
            _data = this._data || [];
            this.data = _data.slice(start * size, n * size);
          }
          try {
            var name = this.className || "DataTable";
            webCpu[name].updateView(this);
          } catch (e) {
            console.log(e);
          }
        };
    } else {
      task.pageCallback = function (n, size) {
        task.query = task.query || {};
        task.query.current = n;
        task.query.size = size;
        webCpu.fresh(task.card);
      };
    }

    if (page && !!page.total) {
      task.pagination = new webCpu.CardItem.Pagination(
        task.footArea,
        page.total,
        page.size,
        page.current,
        function (n, size) {
          webCpu.CardItem.switchState(task, "loading");
          if (typeof task.pageCallback === "function") {
            task.pageCallback(n, size);
          }
        },
        page.flag
      );
    } else {
      task.footArea.innerHTML = "";
    }
  }
  if (
    task.pageCallback &&
    task.option &&
    task.option.page &&
    task.option.page.front
  ) {
    var page = task.option.page;
    task.pageCallback(page.current, page.size);
  } else {
    this.updateView(task, tData);
  }
  if (task.card && task.card.foot) {
    const footAreas = task.cardBody.querySelectorAll(".CardItem_footArea");
    footAreas.forEach((el) => {
      el.style.display = "";
      // 如果之前是 display:none，可强制为块级元素显示
      if (getComputedStyle(el).display === "none") {
        el.style.display = "block";
      }
    });
  }
};

ViewControl.prototype.update = function (task) {
  if (this.isReady()) {
    if (typeof task.dataFilter === "function") {
      try {
        task.data = task.dataFilter(task.data);
      } catch (e) {
        console.log(e);
      }
    }

    var _self = this;
    // setTimeout(function () {
    _self._update(task);
    // });
  } else {
    this.mission.push(task);
  }
};

ViewControl.prototype.createDom = function (container, json, data) {
  var arr = ["br", "input", "img", "hr", "link", "meta", "span", "textarea"];
  var tag = json.tag || "div";
  var elem = document.createElement(tag);
  if (json.props) {
    for (var k in json.props) {
      elem.setAttribute(k, json.props[k]);
    }
  }
  if (arr.indexOf(tag) !== -1 && json.label === undefined) {
    json.label = "";
  }
  if (json.label !== undefined) {
    var label = document.createElement("label");
    label.innerHTML = json.label;
    var style = json.labelStyle || {
      width: json.labelWidth || "100%",
    };
    for (var k in style) {
      label.style[k] = style[k];
    }

    if (arr.indexOf(tag) === -1) {
      elem.appendChild(label);
    } else {
      container.prepend(label);
      label.prepend(elem);
      if (tag === "textarea" && json.props) {
        elem.innerHTML = json.props.value || "";
      }
    }
  }

  if (json.style) {
    for (var k in json.style) {
      elem.style[k] = json.style[k];
    }
  }

  if (json.children && arr.indexOf(tag) === -1) {
    if (json.children.constructor.name !== "Array") {
      json.children = [json.children];
    }
    var tElem = document.createElement("div");
    for (var i in json.children) {
      this.createDom(tElem, json.children[i], data);
    }
    elem.appendChild(tElem);
  }
  if (json.children && arr.indexOf(tag) === -1) {
    container.appendChild(elem);
  }
};

ViewControl.prototype.updateView = function (task, tData) {
  var t = task.container;
  task.data = tData = tData || task.data;

  if (t) {
    if (task.cardName && task.cardName !== "anonymous") {
      console.log(
        "start main callback of task[%1]".replace("%1", task.cardName)
      );
      if (task.cardName && webCpu["CardItem"]) {
        // if (!webCpu.layout || (webCpu.layout && webCpu.layout.mode !== "edit")) {
        //   debugger;
        //   webCpu["CardItem"].dismissMask(task);
        // }
      }
    }
    if (!task.renderType || task.renderType === "replace") {
      t.innerHTML = "";
    }

    var temp = this.initDom(tData, t, task);
    task.container = temp;

    if (typeof this.callback === "function") {
      this.callback(temp, tData, task);
    }
  } else {
    if (typeof this.callback === "function") {
      this.callback(t, tData, task);
    }
  }

  if (task.promise && typeof task.promise.afterRender === "function") {
    if (task.cardName) {
      console.log(
        "start afterRender of task[%1]".replace(
          "%1",
          task.cardName || "anonymous"
        )
      );
    }

    task.promise.afterRender(task.container, tData, task);
  }

  if (task.container && task.transform && typeof task.transform === "object") {
    Object.keys(task.transform).forEach((key) => {
      task.container.style[key] = task.transform[key];
    });
  }

  if (typeof task._initView === "function") {
    task._initView(task.container, tData, task);
  }
};

ViewControl.prototype.initDom = function (obj, container, task) {
  if (
    container.parentNode &&
    container.className.search("_task_container") !== -1 &&
    this.config.name !== "CardItem"
  ) {
    var temp = container;
    container = container.parentNode;
    container.removeChild(temp);
    task.container = container;
  }
  t = document.createElement("div");
  task.style = task.style || {};
  task.style.width = task.style.width || "100%";
  task.style.height = task.style.height || "100%";
  task.style.relative = task.style.relative || "relative";
  t.setAttribute("class", this.config.name + " _task_container");

  if (typeof task.animateStyle === "string") {
    task.animateStyle = {
      type: task.animateStyle,
      duration: "animate__fast",
    };
  }
  if (typeof webCpu.CardItem.removeAnimationClass === "function") {
    webCpu.CardItem.removeAnimationClass(container);
  }

  if (task.animateStyle && task.animateStyle.type) {
    container.setAttribute(
      "class",
      `${container.getAttribute("class")} animate__animated ${task.animateStyle.type
      } ${task.animateStyle.duration}`
    );
  }

  container.innerHTML = "";
  if (container && typeof container.appendChild === "function") {
    container.appendChild(t);
    try {
      for (var k in task.style) {
        t.style[k] = task.style[k];
      }
    } catch (e) {
      var style = "width: 1%; height: 2%; position: 3%;";
      style = style.replace("1%", task.style.width);
      style = style.replace("2%", task.style.height);
      style = style.replace("3%", task.style.relative);
      t.setAttribute("style", style);
    }

    t.innerHTML = WebTool.bindData(this.html.innerHTML, obj, task.filter);
  }
  return t;
};

ViewControl.prototype.isReady = function () {
  var ret = false;
  if ((this.hStatus <= 0 && this.sStatus <= 0) || !this.config) {
    ret = true;
    this.state = 1;
  } else if (!this.html) {
    console.log("waiting html...");
  } else {
    console.log("waiting script...");
  }
  return ret;
};

ViewControl.prototype.execute = function () {
  if (this.isReady()) {
    for (var key in this.mission) {
      this.mission[key] = this.initTask(this.mission[key]);
      this.mission[key] && this.render(this.mission[key]);
    }
  }
};

ViewControl.prototype.prepareScript = function () {
  if (typeof this.config.script === "string" && !this.script[0]) {
    this.script[0] = this.loadScript(this.config.script);
  } else if (typeof this.config.script === "object") {
    for (var k in this.config.script) {
      if (typeof this.config.script[k] === "string") {
        this.script[k] =
          this.script[k] || this.loadScript(this.config.script[k]);
      } else if (this.config.script[k] && this.config.script[k].url) {
        this.script[k] =
          this.script[k] ||
          this.loadScript(
            this.config.script[k].url,
            this.config.script[k].type,
            this.config.script[k].callback
          );
      } else {
      }
    }
  }
};

ViewControl.prototype.prepareCss = function () {
  if (typeof this.config.css === "string" && !this.css[0]) {
    if (this.config.css.search("{") === -1) {
      if (this.config.name !== "main") {
        this.config.css = this.getPath(this.config.css);
      }
    }
    this.css[0] = this.loadCSS(this.config.css);
  } else if (typeof this.config.css === "object") {
    for (var k in this.config.css) {
      if (this.config.css[k].search("{") === -1 && this.config.path) {
        if (this.config.name !== "main") {
          this.config.css[k] = this.getPath(this.config.css[k]);
        }
      }
      this.css[k] = this.css[k] || this.loadCSS(this.config.css[k]);
    }
  }
};

ViewControl.prototype.getPath = function (str, folderName) {
  let _str = str;
  if (!str) {
    return "";
  } else {
    str = str.url || str;
  }
  var ret = str || "";
  this.config.path = this.config.path || webCpu.componentPath;
  if (str.search("data:text") === 0) {
    //为data url时 ret不用转换
  } else if (this.config && this.config.path && this.config.name) {
    ret = this.config.path + "/" + this.config.name + "/" + str;
    if (folderName) {
      ret =
        this.config.path +
        "/" +
        this.config.name +
        "/" +
        folderName +
        "/" +
        str;
    }
  } else if (this.config && this.config.name) {
    ret = this.config.name + "/" + str;
    if (folderName) {
      ret = this.config.name + "/" + folderName + "/" + str;
    }
  }
  if (_str.type) {
    ret = {
      url: ret,
      type: _str.type,
    };
  }
  return ret;
};

ViewControl.prototype.prepareHtml = function () {
  var _this = this;
  this.htmlFetch({}, function (str) {
    _this.hStatus--;
    _this.html = document.createElement("div");
    _this.html.innerHTML = str;
    _this.execute();
  });
};

ViewControl.prototype.loadScript = function (url, type) {
  var _self = this;
  //判断URL是否为script code
  var tUrl = url.replace(/\s+/g, "");
  if (tUrl.search(/\(function/) === 0) {
    setTimeout(function () {
      new Function("return " + url)();
      _self.sStatus--;
      _self.execute();
    }, 200);
    var script = tUrl;
  } else {
    script = WebAdapter.load(
      url,
      function () {
        _self.sStatus--;
        _self.execute();
      },
      _self.config.shadowDom,
      type
    );
    //script.setAttribute('id', scriptId);
  }
  return script;
};

ViewControl.prototype.loadCSS = function (url) {
  var cssId = MurmurHash.rule(url, 31);
  var cssLink = document.getElementById(cssId);
  if (!cssLink) {
    cssLink = WebAdapter.loadCSS(url, this.config.shadowDom);
  }
  cssLink.setAttribute("id", cssId);
  return cssLink;
};

var MurmurHash = {
  // MurmurHash3 related functions
  //
  // Given two 64bit ints (as an array of two 32bit ints) returns the two
  // added together as a 64bit int (as an array of two 32bit ints).
  //
  x64Add: function (m, n) {
    m = [m[0] >>> 16, m[0] & 0xffff, m[1] >>> 16, m[1] & 0xffff];
    n = [n[0] >>> 16, n[0] & 0xffff, n[1] >>> 16, n[1] & 0xffff];
    var o = [0, 0, 0, 0];
    o[3] += m[3] + n[3];
    o[2] += o[3] >>> 16;
    o[3] &= 0xffff;
    o[2] += m[2] + n[2];
    o[1] += o[2] >>> 16;
    o[2] &= 0xffff;
    o[1] += m[1] + n[1];
    o[0] += o[1] >>> 16;
    o[1] &= 0xffff;
    o[0] += m[0] + n[0];
    o[0] &= 0xffff;
    return [(o[0] << 16) | o[1], (o[2] << 16) | o[3]];
  },
  //
  // Given two 64bit ints (as an array of two 32bit ints) returns the two
  // multiplied together as a 64bit int (as an array of two 32bit ints).
  //
  x64Multiply: function (m, n) {
    m = [m[0] >>> 16, m[0] & 0xffff, m[1] >>> 16, m[1] & 0xffff];
    n = [n[0] >>> 16, n[0] & 0xffff, n[1] >>> 16, n[1] & 0xffff];
    var o = [0, 0, 0, 0];
    o[3] += m[3] * n[3];
    o[2] += o[3] >>> 16;
    o[3] &= 0xffff;
    o[2] += m[2] * n[3];
    o[1] += o[2] >>> 16;
    o[2] &= 0xffff;
    o[2] += m[3] * n[2];
    o[1] += o[2] >>> 16;
    o[2] &= 0xffff;
    o[1] += m[1] * n[3];
    o[0] += o[1] >>> 16;
    o[1] &= 0xffff;
    o[1] += m[2] * n[2];
    o[0] += o[1] >>> 16;
    o[1] &= 0xffff;
    o[1] += m[3] * n[1];
    o[0] += o[1] >>> 16;
    o[1] &= 0xffff;
    o[0] += m[0] * n[3] + m[1] * n[2] + m[2] * n[1] + m[3] * n[0];
    o[0] &= 0xffff;
    return [(o[0] << 16) | o[1], (o[2] << 16) | o[3]];
  },
  //
  // Given a 64bit int (as an array of two 32bit ints) and an int
  // representing a number of bit positions, returns the 64bit int (as an
  // array of two 32bit ints) rotated left by that number of positions.
  //
  x64Rotl: function (m, n) {
    n %= 64;
    if (n === 32) {
      return [m[1], m[0]];
    } else if (n < 32) {
      return [
        (m[0] << n) | (m[1] >>> (32 - n)),
        (m[1] << n) | (m[0] >>> (32 - n)),
      ];
    } else {
      n -= 32;
      return [
        (m[1] << n) | (m[0] >>> (32 - n)),
        (m[0] << n) | (m[1] >>> (32 - n)),
      ];
    }
  },
  //
  // Given a 64bit int (as an array of two 32bit ints) and an int
  // representing a number of bit positions, returns the 64bit int (as an
  // array of two 32bit ints) shifted left by that number of positions.
  //
  x64LeftShift: function (m, n) {
    n %= 64;
    if (n === 0) {
      return m;
    } else if (n < 32) {
      return [(m[0] << n) | (m[1] >>> (32 - n)), m[1] << n];
    } else {
      return [m[1] << (n - 32), 0];
    }
  },
  //
  // Given two 64bit ints (as an array of two 32bit ints) returns the two
  // xored together as a 64bit int (as an array of two 32bit ints).
  //
  x64Xor: function (m, n) {
    return [m[0] ^ n[0], m[1] ^ n[1]];
  },
  //
  // Given a block, returns murmurHash3's final x64 mix of that block.
  // (`[0, h[0] >>> 1]` is a 33 bit unsigned right shift. This is the
  // only place where we need to right shift 64bit ints.)
  //
  x64Fmix: function (h) {
    h = this.x64Xor(h, [0, h[0] >>> 1]);
    h = this.x64Multiply(h, [0xff51afd7, 0xed558ccd]);
    h = this.x64Xor(h, [0, h[0] >>> 1]);
    h = this.x64Multiply(h, [0xc4ceb9fe, 0x1a85ec53]);
    h = this.x64Xor(h, [0, h[0] >>> 1]);
    return h;
  },

  //
  // Given a string and an optional seed as an int, returns a 128 bit
  // hash using the x64 flavor of MurmurHash3, as an unsigned hex.
  //
  rule: function (key, seed) {
    key = key || "";
    seed = seed || 0;
    var remainder = key.length % 16;
    var bytes = key.length - remainder;
    var h1 = [0, seed];
    var h2 = [0, seed];
    var k1 = [0, 0];
    var k2 = [0, 0];
    var c1 = [0x87c37b91, 0x114253d5];
    var c2 = [0x4cf5ad43, 0x2745937f];
    for (var i = 0; i < bytes; i = i + 16) {
      k1 = [
        (key.charCodeAt(i + 4) & 0xff) |
        ((key.charCodeAt(i + 5) & 0xff) << 8) |
        ((key.charCodeAt(i + 6) & 0xff) << 16) |
        ((key.charCodeAt(i + 7) & 0xff) << 24),
        (key.charCodeAt(i) & 0xff) |
        ((key.charCodeAt(i + 1) & 0xff) << 8) |
        ((key.charCodeAt(i + 2) & 0xff) << 16) |
        ((key.charCodeAt(i + 3) & 0xff) << 24),
      ];
      k2 = [
        (key.charCodeAt(i + 12) & 0xff) |
        ((key.charCodeAt(i + 13) & 0xff) << 8) |
        ((key.charCodeAt(i + 14) & 0xff) << 16) |
        ((key.charCodeAt(i + 15) & 0xff) << 24),
        (key.charCodeAt(i + 8) & 0xff) |
        ((key.charCodeAt(i + 9) & 0xff) << 8) |
        ((key.charCodeAt(i + 10) & 0xff) << 16) |
        ((key.charCodeAt(i + 11) & 0xff) << 24),
      ];
      k1 = this.x64Multiply(k1, c1);
      k1 = this.x64Rotl(k1, 31);
      k1 = this.x64Multiply(k1, c2);
      h1 = this.x64Xor(h1, k1);
      h1 = this.x64Rotl(h1, 27);
      h1 = this.x64Add(h1, h2);
      h1 = this.x64Add(this.x64Multiply(h1, [0, 5]), [0, 0x52dce729]);
      k2 = this.x64Multiply(k2, c2);
      k2 = this.x64Rotl(k2, 33);
      k2 = this.x64Multiply(k2, c1);
      h2 = this.x64Xor(h2, k2);
      h2 = this.x64Rotl(h2, 31);
      h2 = this.x64Add(h2, h1);
      h2 = this.x64Add(this.x64Multiply(h2, [0, 5]), [0, 0x38495ab5]);
    }
    k1 = [0, 0];
    k2 = [0, 0];
    switch (remainder) {
      case 15:
        k2 = this.x64Xor(
          k2,
          this.x64LeftShift([0, key.charCodeAt(i + 14)], 48)
        );
      case 14:
        k2 = this.x64Xor(
          k2,
          this.x64LeftShift([0, key.charCodeAt(i + 13)], 40)
        );
      case 13:
        k2 = this.x64Xor(
          k2,
          this.x64LeftShift([0, key.charCodeAt(i + 12)], 32)
        );
      case 12:
        k2 = this.x64Xor(
          k2,
          this.x64LeftShift([0, key.charCodeAt(i + 11)], 24)
        );
      case 11:
        k2 = this.x64Xor(
          k2,
          this.x64LeftShift([0, key.charCodeAt(i + 10)], 16)
        );
      case 10:
        k2 = this.x64Xor(k2, this.x64LeftShift([0, key.charCodeAt(i + 9)], 8));
      case 9:
        k2 = this.x64Xor(k2, [0, key.charCodeAt(i + 8)]);
        k2 = this.x64Multiply(k2, c2);
        k2 = this.x64Rotl(k2, 33);
        k2 = this.x64Multiply(k2, c1);
        h2 = this.x64Xor(h2, k2);
      case 8:
        k1 = this.x64Xor(k1, this.x64LeftShift([0, key.charCodeAt(i + 7)], 56));
      case 7:
        k1 = this.x64Xor(k1, this.x64LeftShift([0, key.charCodeAt(i + 6)], 48));
      case 6:
        k1 = this.x64Xor(k1, this.x64LeftShift([0, key.charCodeAt(i + 5)], 40));
      case 5:
        k1 = this.x64Xor(k1, this.x64LeftShift([0, key.charCodeAt(i + 4)], 32));
      case 4:
        k1 = this.x64Xor(k1, this.x64LeftShift([0, key.charCodeAt(i + 3)], 24));
      case 3:
        k1 = this.x64Xor(k1, this.x64LeftShift([0, key.charCodeAt(i + 2)], 16));
      case 2:
        k1 = this.x64Xor(k1, this.x64LeftShift([0, key.charCodeAt(i + 1)], 8));
      case 1:
        k1 = this.x64Xor(k1, [0, key.charCodeAt(i)]);
        k1 = this.x64Multiply(k1, c1);
        k1 = this.x64Rotl(k1, 31);
        k1 = this.x64Multiply(k1, c2);
        h1 = this.x64Xor(h1, k1);
    }
    h1 = this.x64Xor(h1, [0, key.length]);
    h2 = this.x64Xor(h2, [0, key.length]);
    h1 = this.x64Add(h1, h2);
    h2 = this.x64Add(h2, h1);
    h1 = this.x64Fmix(h1);
    h2 = this.x64Fmix(h2);
    h1 = this.x64Add(h1, h2);
    h2 = this.x64Add(h2, h1);
    return (
      ("00000000" + (h1[0] >>> 0).toString(16)).slice(-8) +
      ("00000000" + (h1[1] >>> 0).toString(16)).slice(-8) +
      ("00000000" + (h2[0] >>> 0).toString(16)).slice(-8) +
      ("00000000" + (h2[1] >>> 0).toString(16)).slice(-8)
    );
  },
};

// var MurmurHashRule = MurmurHash.rule;

var NetIdentity = function (config, callback) {
  for (var k in config) {
    this[k] = config[k];
  }
  this.id = WebTool.cookie(this.community);
  if (!this.id) {
    var _self = this;
    this.getCacheParams(this.url, function (data) {
      if (data && data["id"]) {
        _self.id = data["id"];
        // _self.community = data["id"];
      } else {
        _self.id = _self.generateId();
        _self.setCacheParams(_self.url, {
          id: _self.id,
          community: _self.community,
        });
      }
      if (typeof callback === "function") {
        callback(_self.id);
      }
      //ID有效期100年（第一方cookie）
      WebTool.cookie(_self.community, _self.id, 365 * 100);

      //收集传播路径
      _self.trackIdentity();
    });
  } else {
    if (typeof callback === "function") {
      callback(this.id);
    }
    //ID有效期100年
    WebTool.cookie(this.community, this.id, 365 * 100);

    this.setCacheParams(this.url, {
      id: this.id,
      community: this.community,
    });

    //收集传播路径
    this.trackIdentity();
  }
};
NetIdentity.track = 0;

NetIdentity.prototype.trackIdentity = function () {
  try {
    this.fp = MurmurHash.rule(this.getCanvasFp() + navigator.userAgent);
  } catch (e) {
    this.fp = "";
  }
  var _self = this;
  if (typeof this.track === "string" && NetIdentity.track === 0) {
    var hash = location.hash;
    var id = decodeURIComponent(this.urlQuery(hash, this.community));
    var tParam = {
      infector: id,
      hash: WebTool.pageHash(location.href),
      refer: document.referrer,
      fp: _self.fp,
    };
    // tParam[this.community] = this.id;

    if (id && id !== "null") {
      WebAdapter.report(WebTool.attachParams(this.track, tParam));
      if (this.id != id) {
        location.hash = hash.replace(
          encodeURIComponent(id),
          encodeURIComponent(this.id)
        );
      }
    } else {
      WebAdapter.report(WebTool.attachParams(this.track, tParam));
      var param = {};
      param[this.community] = this.id;
      location.hash = WebTool.attachParams(hash, param);
    }
    //每个页面只执行一次
    NetIdentity.track = 1;
  }
};

NetIdentity.prototype.getCanvasFp = function () {
  var result = [];
  // Very simple now, need to make it more complex (geo shapes etc)
  var canvas = document.createElement("canvas");
  canvas.width = 2000;
  canvas.height = 200;
  canvas.style.display = "inline";
  var ctx = canvas.getContext("2d");
  // detect browser support of canvas winding
  // http://blogs.adobe.com/webplatform/2013/01/30/winding-rules-in-canvas/
  // https://github.com/Modernizr/Modernizr/blob/master/feature-detects/canvas/winding.js
  ctx.rect(0, 0, 10, 10);
  ctx.rect(2, 2, 6, 6);
  result.push(
    "canvas winding:" +
    (ctx.isPointInPath(5, 5, "evenodd") === false ? "yes" : "no")
  );

  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#f60";
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = "#069";
  ctx.fillText("Cwm fjordbank glyphs vext quiz, \ud83d\ude03", 2, 15);
  ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
  ctx.font = "18pt Arial";
  ctx.fillText("Cwm fjordbank glyphs vext quiz, \ud83d\ude03", 4, 45);

  // canvas blending
  // http://blogs.adobe.com/webplatform/2013/01/28/blending-features-in-canvas/
  // http://jsfiddle.net/NDYV8/16/
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = "rgb(255,0,255)";
  ctx.beginPath();
  ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgb(0,255,255)";
  ctx.beginPath();
  ctx.arc(100, 50, 50, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgb(255,255,0)";
  ctx.beginPath();
  ctx.arc(75, 100, 50, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgb(255,0,255)";
  // canvas winding
  // http://blogs.adobe.com/webplatform/2013/01/30/winding-rules-in-canvas/
  // http://jsfiddle.net/NDYV8/19/
  ctx.arc(75, 75, 75, 0, Math.PI * 2, true);
  ctx.arc(75, 75, 25, 0, Math.PI * 2, true);
  ctx.fill("evenodd");

  result.push("canvas fp:" + canvas.toDataURL());
  return result.join("~");
};

NetIdentity.prototype.urlQuery = function (url, key) {
  if (url) {
    var re = new RegExp(key + "=([^&]*)", "i");
    var a = re.exec(url);
    if (a == null) {
      return null;
    }
    return a[1];
  } else {
    return null;
  }
};

NetIdentity.prototype.rand = function (x) {
  var s = "";
  while (s.length < x && x > 0) {
    var r = Math.random();
    s += String.fromCharCode(Math.floor(r * 26) + (r > 0.5 ? 97 : 65));
  }
  return s;
};

NetIdentity.prototype.getCacheParams = function (url, callback) {
  if (!!window.postMessage) {
    this.getCacheParamsByMessage(url, callback);
  } else {
    this.getCacheParamsByName(url, callback);
  }
};

NetIdentity.prototype.getCacheParamsByMessage = function (url, callback) {
  var _self = this;
  // 校验消息来源：仅接受目标 iframe 同源（或相对 URL 视为本站）发来的消息
  var expectedOrigin = null;
  try {
    expectedOrigin = new URL(url, window.location.origin).origin;
  } catch (e) {
    expectedOrigin = window.location.origin;
  }
  if (window.addEventListener) {
    window.addEventListener(
      "message",
      function (e) {
        if (expectedOrigin && e.origin !== expectedOrigin) {
          return;
        }
        if (typeof callback === "function") {
          _self.id = e.data["id"];
          _self.crossData = e.data;
          callback(e.data);
        }
      },
      false
    );
  } else {
    window.attachEvent("onmessage", function (e) {
      if (typeof callback === "function") {
        _self.id = e.data["id"];
        _self.crossData = e.data;
        callback(e.data);
      }
    });
  }

  this.iframe = this.getBridgeIframe("_bridge_iframe");
  this.iframe.src = url;
};

NetIdentity.prototype.setCacheParams = function (url, params) {
  if (this.iframeSet) {
    this.iframeSet.parentNode.removeChild(this.iframeSet);
  }
  this.iframeSet = this.getBridgeIframe("_bridge_iframe_set");
  //使用hash值向跨域iframe传递参数
  this.iframeSet.src = WebTool.attachParams(url, params);
};

NetIdentity.prototype.getCacheParamsByName = function (url, callback) {
  if (this.iframeGet) {
    this.iframeGet.parentNode.removeChild(this.iframeGet);
  }
  this.iframeGet = this.getBridgeIframe("_bridge_iframe_get");
  this.iframeGet.src = url;
  var state = 0;
  this.iframeGet.onload = function () {
    if (state === 1) {
      //使用iframe通过window.name跨域传递的参数
      var params = strToJson(this.contentWindow.name);
      if (typeof callback === "function") {
        callback(params);
      }
    } else if (state === 0) {
      state = 1;
      this.contentWindow.location = "about:blank";
    }
  };
};

NetIdentity.prototype.getBridgeIframe = function (id, callback) {
  var iframe = this.iframe || document.getElementById("_bridge_iframe");
  if (iframe) {
    iframe.parentNode.removeChild(iframe);
  }
  iframe = document.createElement("iframe");
  iframe.setAttribute("allowTransparency", "true");
  iframe.setAttribute("id", id);
  iframe.setAttribute("frameBorder", "0");
  iframe.setAttribute("scrolling", "no");
  iframe.style.cssText =
    "height:0px;width:0px;float:none;position:absolute;overflow:hidden;z-index:333333;margin:0;padding:0;border:0 none;background:none;";
  document.body.appendChild(iframe);
  iframe.onload = function () {
    if (typeof callback === "function") {
      callback();
    }
  };
  return iframe;
};

NetIdentity.prototype.generateId = function () {
  var href = location.href;
  var referrer = document.referrer;
  var random = this.rand(32);
  return MurmurHash.rule(
    this.fp + random + href + referrer + new Date().getTime(),
    31
  );
};

function strToJson(str) {
  // 安全解析：用 JSON.parse 替代 new Function，避免执行 window.name 中的任意代码
  if (typeof str !== "string") return str;
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
}

var WebCpu = function (container, url, config) {
  if (container && url) {
    this.exec(container, url, config);
  }
  this.adapter = {};
  this.appMap = {};
  this.componentPath = location.origin + "/transweb/components";
};

WebCpu.prototype.runWebApp = function (container, app, config, style) {
  if (!app || !app.url || !app.key) {
    console.log("invalid app.");
    return false;
  }
  var _self = this;
  WebAdapter.loadCardData(app.url, app.key, function (data) {
    if (typeof app.callback === "function") {
      app.callback(data);
    }
    localStorage.setItem("transwebWebApp", WebTool.objectToString(data));

    _self.initProject(container, data);
  });
};

WebCpu.prototype.exec = function (container, app, config, style) {
  this.cards = {};
  if (config) {
    var _self = this;
    this.initModule(config, "main", function (c, d, t) {
      _self.initWebApp(c, t.app);
    });

    config.path = config.path || this.componentPath;
    var task = config;
    task.app = app;
    task.style = style || {};

    if (typeof config.interface === "string") {
      config.interface = webCpu.interface[config.interface];
    }
    if (config.interface) {
      for (var k in config.interface) {
        task[k] = config.interface[k];
      }
    }

    var myCard = {
      className: "main",
      cardName: "main",
      task: task,
    };
    // task.container = container;
    // this.main.render(task);
    this.addCardItem(container, myCard);
  } else {
    this.initWebApp(container, app);
  }
};

WebCpu.prototype.initAdapter = function (config) {
  this.adapter = this.adapter || {};
  for (var k in config) {
    var adapter = config[k];
    var type = adapter.type || adapter.requestType || adapter.method;
    this.adapter[k] = new WebRequest(adapter.url, type, adapter);
  }
  return this.adapter;
};

WebCpu.prototype.startApp = function (elem, config, style) {
  this.componentPath = config.components || this.componentPath;
  this.exec(elem, config.main, config.dependency, style);
};

WebCpu.prototype.initModule = function (config, name, _callback) {
  var _self = this;
  var callback = function (container, data, task) {
    if (typeof config.callback === "function") {
      config.callback(container, data, task);
    }

    if (typeof _callback === "function") {
      _callback(container, data, task);
    }
    // else {
    //   _self.initWebApp(container, task.app);
    // }

    console.log("execed successfully");
  };
  config.path = config.path;
  this[name] = null;
  this.regComponent(name, config, callback);
};

WebCpu.prototype.loadPageData = function (container, url, flag, callback) {
  var _self = this;
  WebAdapter.loadCardData(url, "transweb_cn", function (data) {
    _self.renderPageData(container, data, flag, callback);
  });
};

WebCpu.prototype.renderRemoteCard = function (
  container,
  url,
  cardName,
  options,
  callback
) {
  this.cards = this.cards || {};
  this.componentPath = options.components;
  var _self = this;
  WebAdapter.loadCardData(url, "transweb_cn", function (data) {
    _self._renderPageData(container, data.cardData, cardName, callback);
  });
};

WebCpu.prototype._renderPageData = function (
  container,
  cardData,
  cardName,
  callback
) {
  var myCard = null;
  for (var i in cardData) {
    if (cardData[i].cardName) {
      this.cards[cardData[i].cardName] = cardData[i];
    }
    if (cardData[i].cardName === cardName) {
      myCard = cardData[i];
    }
  }
  if (myCard) {
    callback(this.cards);
    this.addCardItem(container, myCard);
  }
};

WebCpu.prototype.renderPageData = function (container, data, flag, callback) {
  if (data.options && data.options.width && data.options.height) {
    this.layout = new LayoutEngine(
      container,
      flag,
      data.options,
      data.cardData,
      callback
    );
  } else if (data.options) {
    var enter = data.options || "main";
    if (typeof enter !== "string") {
      enter = "main";
    }
    this._renderPageData(container, data.cardData, enter, callback);
  } else {
    this.addCardItem(container, data, "replace", callback);
  }
};

WebCpu.prototype.excuteSingleTask = function (elem, appMap, index) {
  let appName = elem.getAttribute("appName") || elem.getAttribute("cardName");
  appMap = appMap || {};
  index = elem.getAttribute("index") || index || 0;

  let documentId = elem.getAttribute("documentId");

  if (appMap.constructor.name === "Array") {
    appName = index;
  }

  if (!appMap[appName]) {
    console.log("excuteSingleTask: appName ", appName, "不存在于：", appMap);
    return false;
  }

  var cItem = appMap[appName] || {};
  if (cItem.url || cItem.dsl) {
    if (documentId) {
      cItem.dsl = cItem.dsl || {};
      cItem.dsl.documentId = documentId;
    }
    this.updateView(elem, cItem);
  } else if (cItem.task) {
    cItem.task.documentId = documentId;
    this.addCardItem(elem, cItem);
  } else {
    console.log(elem, "组件渲染失败，appName无效: ", appName);
  }
};

WebCpu.prototype.addCardItem = function (
  container,
  cardData,
  options,
  callback
) {
  var options = options || {};
  if (typeof options === "string") {
    options = {
      key: options,
    };
  } else if (typeof options === "function") {
    options = {
      callback: options,
    };
  } else {
  }
  var task = this.transferCardData(container, cardData, options, callback);
  if (task) {
    this.render(
      "CardItem",
      task,
      cardData.path || options.components || this.componentPath
    );
  }
};

WebCpu.prototype.fresh = function (task, data, flag) {
  task = task.task || task;
  var cName = task.className || "TemplateItem";
  var _self = this;
  setTimeout(function () {
    if (data) {
      task.query = task.query || {};
      task.query._time_ = new Date().getTime();
      task._data = null;
      _self[cName].render(task, data);
    } else {
      _self[cName].updateFromRemote(task);
    }
  }, 10);
};

WebCpu.prototype.attachAttribute = function (obj, subObj) {
  // 如果源数据未定义，直接返回目标数据
  if (typeof obj === "undefined" || obj === null) {
    return subObj || {};
  }

  // 如果目标数据未定义，初始化为一个空对象
  subObj = subObj || {};

  for (let k in obj) {
    // 跳过危险键，防止原型链污染（__proto__/constructor/prototype）
    if (k === "__proto__" || k === "constructor" || k === "prototype") {
      continue;
    }
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      const sourceVal = obj[k];

      // 严格判断是否为纯对象 (Plain Object)，排除 null、数组等
      if (sourceVal && Object.prototype.toString.call(sourceVal) === "[object Object]") {
        subObj[k] = (subObj[k] && typeof subObj[k] === "object") ? subObj[k] : {};
        // 递归调用自身，不再依赖 this
        this.attachAttribute(sourceVal, subObj[k]);
      } else {
        // 基本类型或数组，直接覆盖
        subObj[k] = sourceVal;
      }
    }
  }
  return subObj;
};

WebCpu.prototype._attachAttribute = function (source, target, cache = new WeakMap()) {
  if (source === null || typeof source !== "object") {
    return target;
  }

  // 处理循环引用
  if (cache.has(source)) {
    return cache.get(source);
  }

  // 初始化 target
  target = target || (Array.isArray(source) ? [] : {});
  cache.set(source, target);

  for (const key in source) {
    if (!Object.prototype.hasOwnProperty.call(source, key)) continue;

    const value = source[key];

    if (value && typeof value === "object") {
      // 保持原有结构（数组 / 对象）
      const base = Array.isArray(value) ? [] : {};
      target[key] = this.attachAttribute(
        value,
        target[key] || base,
        cache
      );
    } else {
      target[key] = value;
    }
  }

  return target;
};

WebCpu.prototype.updateView = function (elem, option, data, flag) {
  option = option || {};
  data = data || option.dsl || option.data;
  if (option.dsl) {
    flag = "DSL";
  }
  if (typeof option === "string") {
    option = {
      url: option,
    };
  }
  var scene = option;
  var _self = this;
  var callback = null;
  if (typeof data === "function") {
    callback = data;
  } else if (flag && option.key) {
    callback = function (c, d, t) {
      if (typeof data === "string") {
        data = {
          url: data,
        };
        if (_self.interface && _self.interface[data]) {
          data = _self.interface[data];
        }
      }
      if (d && d.task) {
        _self.attachAttribute(data, d.task);
      }
    };
  } else if (data && option.key) {
    callback = function (c, d, t) {
      d.task.data = data || d.task.data;
      d.task.url = "";
    };
  } else {
  }

  if (option.url && option.key) {
    if (option.limited) {
      var iframe = document.createElement("iframe");
      iframe.setAttribute("style", "width: 100%; height: 100%;");
      elem.appendChild(iframe);
      this.settings = this.settings || {};
      this.settings.appContainer =
        this.settings.appContainer || "https://transweb.cn";
      iframe.src = WebTool.attachParams(this.settings.appContainer, {
        url: option.url,
        key: option.key,
      });
    } else {
      this.addCardItem(
        elem,
        option.url,
        {
          key: option.key,
          interface: option.interface,
          callback: function (c, d, t) {
            d.style = option.style || d.style;
            scene.card = d;
            d.title = option.title || d.title;
            d.foot = option.foot || d.foot;
            d.titleStyle = option.titleStyle || d.titleStyle;
            d.footStyle = option.footStyle || d.footStyle;

            if (option.dsl) {
              _self.attachAttribute(option.dsl, d.task);
            }

            if (typeof option.callback === "function") {
              option.callback(c, d, t);
            }
            // if (typeof (callback) === "function") {
            //   callback(c, d, t);
            // }
          },
        },
        callback
      );
    }
  } else {
    var tCard = option;
    if ((option.url && !option.key) || option.className) {
      tCard = {
        task: tCard.task || {},
      };
      tCard.className =
        option.className ||
        (option.url.search(/\.vue$/i) === -1
          ? "TemplateItem"
          : "ElementVueItem");
      tCard.cardName = option.cardName;
      tCard.task.remote =
        tCard.task.remote === undefined ? true : tCard.task.remote;
      tCard.foot = option.foot;
      tCard.footStyle = option.footStyle;
      tCard.footHeight = option.footHeight;
      tCard.title = option.title;
      tCard.titleStyle = option.titleStyle;
      if (option.style) {
        tCard.style = WebTool.copyObject(option.style);
      }

      tCard.task.template = option.url || tCard.task.template;

      // if(tCard.task.template) {
      //   tCard.task.template = WebTool.attachParams(tCard.task.template, {
      //     _time: new Date().getTime()
      //   })
      // }

      tCard.task.data = tCard.task.data || option.data;
      tCard.task.appMap = option.appMap;
      tCard.task.appData = option.appData;
      tCard.task.tempData = option.tempData;
      tCard.task.routeView = option.routeView;
      tCard.task.url = "";
      tCard.task.tProxy = option.tProxy;

      if (option.dsl) {
        _self.attachAttribute(option.dsl, tCard.task);
      }

      tCard.task.promise = tCard.task.promise || {};

      if (flag === "initData") {
        tCard.task.promise.beforeRender = function (c, d, t) {
          callback(c, d, t);
        };
      }

      var tCallback = null;
      if (tCard.task.promise.afterRender) {
        tCallback = tCard.task.promise.afterRender;
      }

      tCard.task.promise.afterRender = function (c, d, t) {
        if (typeof tCallback === "function") {
          tCallback(c, d, t);
        }
        if (typeof option.callback === "function") {
          option.callback(c, d, t);
        }
        if (flag !== "initData" && typeof callback === "function") {
          callback(c, d, t);
        }
      };
    }

    // if (typeof data !== "function") {
    //   tCard.task.data = data;
    // }

    this.addCardItem(elem, tCard);
    scene.card = tCard;
  }
  return scene;
};

WebCpu.prototype.transferCardData = function (
  container,
  cardData,
  options,
  callback
) {
  var _self = this;
  var task = {
    mode: options.mode,
    renderType: options.renderType || "replace",
    container: container,
    unit: options.unit,
    initData: options.callback,
    initView: callback,
    promise: {
      beforeRender: function (container, data, task) {
        if (
          options.interface &&
          _self.CardItem &&
          webCpu.CardItem.updateConfig
        ) {
          webCpu.CardItem.updateConfig(data, options.interface);
        }
        if (typeof task.initView === "function" && data.task) {
          // task.initView(container, data, task);
          data.task._initView = task.initView;
        }
        if (typeof task.initData === "function") {
          task.initData(container, data, task);
        }
        if (options.clone) {
          task.data = WebTool.copyObject(data);
        }
        task.data.className = task.data.className || "TemplateItem";
        _self.cards = _self.cards || {};
        if (task.data.cardName) {
          if (!_self.layout) {
            _self.cards[task.data.cardName] = task.data;
          } else {
            _self.layout.cards[task.data.cardName] = task.data;
          }
        }
      },
      afterRender: function (container, data, task) { },
    },
  };
  if (typeof cardData === "string") {
    task.url = cardData;
    task.requestType = "_jsonp";
    task.query = options.key || "transweb_cn";
    task.cardName = options.cardName;
  } else {
    task.data = cardData;
    task.url = "";
  }
  return task;
};

WebCpu.prototype.excuteTasks = function (elem, appMap, routerIndex) {
  try {
    var containers = elem.querySelectorAll("[component=CardItem]");
    if (!containers || containers.length === 0) {
      console.log("excute render tasks: 未找到 [component=CardItem] 的元素");
      return;
    }
    for (var i = 0; i < containers.length; i++) {
      if (routerIndex === i) {
        continue;
      }
      // containers[i].innerHTML = "<div class='renderingTips'>rendering...</div>";
      this.excuteSingleTask(containers[i], appMap, i);
    }
  } catch (e) {
    console.log("Tasks excute error:");
    console.log(e);
  }
};

WebCpu.prototype.getAccountData = function (flag) {
  let id = WebTool.urlQuery(location.href, "id");
  let ret = null;
  if (id) {
    if (
      webCpu.currentCard &&
      webCpu.currentCard.task.vueItem &&
      webCpu.currentCard.task.vueItem.currentItem
    ) {
      let task = webCpu.currentCard.task.vueItem.currentItem.task;
      ret = task.vueItem.accountData;
      if (flag) {
        WebTool.downloadString(JSON.stringify(ret), id + ".json");
      }
    } else {
      console.log("getAccountData failed: no currentItem");
    }
  } else {
    console.log("getAccountData failed: no id param");
  }
  return ret;
};

WebCpu.prototype.updateAccountData = function (accountData, callback) {
  let id = WebTool.urlQuery(location.href, "id");
  if (id) {
    if (
      webCpu.currentCard &&
      webCpu.currentCard.task.vueItem &&
      webCpu.currentCard.task.vueItem.currentItem
    ) {
      let task = webCpu.currentCard.task.vueItem.currentItem.task;
      task.vueItem.updateAccountData(accountData, callback);
    } else {
      console.log("updateAccountData failed: no currentItem");
    }
  } else {
    console.log("updateAccountData failed: no id param");
  }
};

WebCpu.prototype.renderAppMap = function (elem, appMap, callback) {
  try {
    const containers = elem.querySelectorAll("[component=AppItem]");
    if (!containers || containers.length === 0) {
      console.log("renderAppMap: 未找到 [component=AppItem] 的元素");
      return;
    }

    const taskList = [];
    appMap = appMap || {};
    // 构建任务队列
    for (let i = 0; i < containers.length; i++) {
      // if (routerIndex === i) continue; // 跳过当前 router 视图

      const container = containers[i];
      const compName = container.getAttribute("appName");
      const appType = container.getAttribute("appType");
      const appId = container.getAttribute("appId");
      const documentId = container.getAttribute("documentId");
      let appInfo = appMap[compName] || appMap[appId] || {};
      appInfo.dsl = appInfo.dsl || {};
      appInfo.dsl.documentId = documentId;

      if (!compName || !appInfo || !appInfo.id) {
        taskList.push({
          id: appId || compName,
          elem: container,
          dsl: appInfo.dsl,
          type: appType,
        });
        // console.warn(`excuteTasks: appMap 中缺少 ${compName} 的定义`);
        continue;
      } else {
        taskList.push({
          id: appInfo.id,
          elem: container,
          dsl: appInfo.dsl,
          type: appType || appInfo.type || "contentApp",
        });
      }
    }

    // 调用 renderAppList 顺序渲染
    if (taskList.length > 0) {
      this.renderAppList(taskList, function (results) {
        console.log("excuteTasks: 所有任务已完成渲染。", results);
        if (typeof callback === "function") {
          callback(results);
        }
      });
    }
  } catch (e) {
    console.error("Tasks excute error:", e);
  }
};

WebCpu.prototype.render = function (param, task, path, shadowDom) {
  if (typeof param === "string" && task) {
    this._render(param, task, path, shadowDom);
  } else if (param.className && param.task) {
    this._render(param.className, param.task, param.componentPath, shadowDom);
  } else {
    console.log(
      "Invalid component[%1]".replace("%1", param.className || param)
    );
  }
};

WebCpu.prototype._render = function (name, task, path, shadowDom) {
  if (!this[name]) {
    var mission = [];
    if (typeof task === "object" && task.constructor.name === "Array") {
      mission = task;
    } else if (!!task) {
      mission = [task];
    } else {
      mission = [];
    }
    var path = path || this.componentPath;
    this.link(path, name, mission, shadowDom);
  } else if (this[name].state !== 1) {
    this[name].mission.push(task);
  } else {
    this[name].render(task);
  }
};

WebCpu.prototype.link = function (path, name, mission, shadowDom) {
  if (!this[name]) {
    var control = {
      path: path,
      mission: mission,
      shadowDom: shadowDom,
    };
    if (path) {
      WebAdapter.load(path + "/" + name + "/main.js");
    } else {
      WebAdapter.load(name + "/main.js");
    }
    this[name] = control;
  }
};

WebCpu.prototype.regComponent = function (name, config, callback) {
  try {
    config = config || {};
    var _self = this;
    if (this[name] && this[name].path) {
      var control = this[name];
      config.path = control.path;
      config.shadowDom = control.shadowDom;
    }
    config.name = name;
    var mission = (control && control.mission) || [];
    this[name] = new ViewControl(
      config,
      function (container, data, t) {
        //initial component
        callback(container, data, t);
        console.log("execed successfully: Component " + name);
      },
      mission
    );
  } catch (e) {
    console.log("Reg failed: component[" + name + "], " + e);
  }
};

WebCpu.prototype.request = function (interface, query, callback, param) {
  var url = interface.url || interface.path;
  var type = interface.requestType || interface.method;
  var options = {
    dataType: interface.dataType || "json",
    contentType: interface.contentType,
    proxy: interface.proxy,
  };
  query = query || interface.query;
  WebAdapter.request(url, type, query, callback, options, param);
};

WebCpu.prototype.getDslCode = function (option, cardName, callback) {
  let ret = {};
  let current = 0;
  WebAdapter.loadCardData(option.url, option.key, function (cData) {
    if (typeof cardName === "number") {
      current = cardName;
    } else if (typeof cardName === "string") {
      current = WebTool.searchArray(cData, "cardName", cardName);
      if (current === -1) {
        current = 0;
      }
    } else {
    }
    let d = WebTool.copyObject(cData[current]);
    ret = d.dsl || {};
    if (typeof callback === "function") {
      callback(ret, d);
    }
  });
};

WebCpu.prototype.renderCard = function (elem, option, cardName, dsl, callback) {
  let _self = this;
  this.getDslCode(
    option,
    cardName,
    function (tDsl, card) {
      card.dsl = card.dsl || {};
      dsl = dsl || {};
      if (elem) {
        this.attachAttribute(dsl, card.dsl);
        this.updateView(elem, card, callback);
      } else if (_self.CardItem) {
        _self.renderCardDialog(null, card, dsl);
        if (typeof callback === "function") {
          callback(card);
        }
      } else {
        _self.link();
      }
    }.bind(this)
  );
};

WebCpu.prototype.renderCardDialog = function (
  mCard,
  option,
  params,
  style,
  tStyle
) {
  var task = mCard;
  params = params || {};
  if (mCard && !mCard.querySelector) {
    task = mCard.task || mCard;
    if (params) {
      params.parentCard = mCard;
    }

    if (this.CardItem) {
      this.CardItem.switchMask(mCard, "html", "");
    }
  } else {
    mCard = mCard || document.body;
    if (params) {
      params.parentCard = mCard;
    }
    task = {
      mask: document.createElement("div"),
    };
    task.mask.setAttribute("class", "cardItemMask");
    task.mask.style.zIndex = 2000;
    task.mask.style.width = "100%";
    task.mask.style.height = "100%";
    task.mask.style.position = "absolute";
    task.mask.style.background = "rgba(255, 255, 255, 1)";
    task.mask.style.display = "flex";
    task.mask.style.left = 0;
    task.mask.style.top = 0;
    if (mCard.querySelector(".cardItemMask")) {
      mCard.querySelector(".cardItemMask").remove();
    }
    mCard.prepend(task.mask);
  }

  if (params.style && task.mask) {
    const styleObj = params.style;
    Object.keys(styleObj).forEach((key) => {
      task.mask.style[key] = styleObj[key];
    });
  }

  if (params.fullScreen) {
    WebTool.fullscreenDisplay(task.mask);
  }
  let _self = this;
  var tempCard = {
    title: params.title,
    titleStyle: params.titleStyle,
    titleHeight: 30,
    dialogData: params,
    foot: params.foot,
    cardName: params.dialogName,
    style: style,
    task: {
      style: tStyle || {
        padding: "0px",
      },
      promise: {
        afterRender: function (c1, d1, t1) {
          if (option.pluginUrl && option.pluginKey) {
            option.url = option.url || option.pluginUrl;
            option.key = option.key || option.pluginKey;
            _self.renderCard(
              c1,
              option,
              option.cardName,
              option.dsl,
              params.callback
            );
          } else {
            _self.updateView(c1, option, params.callback);
            if (option.card && option.card.task) {
              option.card.task._parent = t1.card;
            }
          }
        },
      },
    },
  };
  if (params.fullScreen) {
    setTimeout(function () {
      this.updateView(task.mask, tempCard);
    }, 200);
  } else {
    this.updateView(task.mask, tempCard);
  }

  task.childCard = tempCard;
  return tempCard;
};

WebCpu.prototype.attachWebPage = function (
  selector,
  page,
  title,
  style,
  delay,
  flag
) {
  let app = {
    className: "TemplateItem",
    dsl: {
      template: `<iframe src='${page}' frameborder="0" width='100%' height='100%'></iframe>`,
    },
  };
  this.attachPlugin(selector, app, title, style, delay, flag);
};

WebCpu.prototype.attachPlugin = function (
  selector,
  plugin,
  title,
  style,
  delay,
  flag
) {
  let _self = this;
  if (delay) {
    setTimeout(function () {
      _self.attachPlugin(selector, plugin, title, style);
    }, delay);
    return;
  }
  let elem = document.querySelector(selector);
  let pluginId =
    "p" + MurmurHash.rule(Math.random() + title + new Date().getTime(), 31);
  style = style || {
    width: "70px",
    fontSize: "12px",
    border: "solid 1px #ddd",
    textAlign: "center",
    cursor: "pointer",
    position: "relative",
    borderRadius: "3px",
    padding: "3px 0px",
  };

  style.width = style.width || "70px";
  style.height = style.height || "30px";
  style.lineHeight = style.lineHeight || "30px";
  style.textAlign = style.textAlign || "center";
  style.border = style.border || "solid 1px #ddd";
  style.cursor = style.cursor || "pointer";
  style.position = "relative";

  webCpu.attachLabel(
    elem,
    `<span pluginId='${pluginId}' class='pluginBtn'>${title}</span>`,
    style,
    "",
    null,
    flag
  );
  document.querySelector(`.pluginBtn[pluginId=${pluginId}]`).onclick =
    function () {
      webCpu.renderCardDialog(null, plugin, {
        title: "问问 AI",
        closeType: "back",
      });
    };
};

WebCpu.prototype.attachLabel = function (elem, html, style, _params, flag) {
  elem = elem || document.querySelector(".CardItem") || document.body;
  _params = _params || {};

  let rElem = _params.parent || document.body;
  if (flag) {
    rElem = elem;
    let p = window.getComputedStyle(rElem)["position"];
    if (p === "static") {
      rElem.style.position = "relative";
    }
  }

  style = style || {
    height: "30px",
    lineHeight: "30px",
    display: "inline-block",
    minWidth: "40px",
  };

  if (elem !== rElem) {
    let root = rElem.getBoundingClientRect();
    let tBox = root;
    if (elem) {
      tBox = elem.getBoundingClientRect();
    }
    let gapX = tBox.x - root.x;
    let gapY = tBox.y - root.y;
    style.marginLeft = gapX + "px";
    style.marginTop = gapY + "px";
  }

  var box = document.createElement("div");
  box.setAttribute("class", "_label_box");
  box.style.width = "0px";
  box.style.height = "0px";
  box.style.top = "0px";
  box.style.left = "0px";
  rElem.prepend(box);

  var content = document.createElement("div");
  // content.innerHTML = ;
  let tContent = document.createElement("div");
  tContent.innerHTML = html;
  content.appendChild(tContent);
  // tContent.style.backgroundColor = "rgba(245, 245, 245, 0.8)";
  style = style || {};
  webCpu.attachAttribute(style, tContent.style);
  if (_params && _params.animation) {
    tContent.setAttribute(
      "class",
      `animate__animated animate__${_params.animation} animate__infinite`
    );
  }

  box.appendChild(content);

  box.style.position = "absolute";
  box.style.zIndex = style.zIndex || 999;
  content.style.position = "relative";
  box.style.display = "inline-block";
  content.style.display = "inline-block";
  content.style.top = 0;
  content.style.left = 0;

  if (elem !== rElem) {
    let x = Math.max(
      rElem.getBoundingClientRect().left - content.getBoundingClientRect().left,
      0
    );
    box.style.left = x + "px";
    let y = Math.max(
      rElem.getBoundingClientRect().top - content.getBoundingClientRect().top,
      0
    );
    box.style.top = y + "px";
  }

  if (_params.duration) {
    setTimeout(function () {
      rElem.removeChild(box);
    }, _params.duration * 1000);
  }

  return content;
};

WebCpu.prototype.listRequest = function (arr, adapter, callback, tCallback) {
  if (!adapter.result || adapter.result.length === 0) {
    adapter.input = arr;
    arr = JSON.parse(JSON.stringify(arr));
    adapter.result = [];
  }
  let _self = this;
  if (arr && arr.length !== 0) {
    let params = arr.pop();
    this.adapterRequest(params, adapter, function (d) {
      adapter.result.unshift(d);
      if (typeof tCallback === "function") {
        tCallback(adapter.result, adapter.input);
      }
      _self.listRequest(arr, adapter, callback);
    });
  } else {
    callback(adapter.result);
  }
};

WebCpu.prototype.adapterRequest = function (params, adapter, callback) {
  if (typeof params === "string") {
    params = {
      content: params,
    };
  }
  params = params || {};
  let request = new WebRequest(
    adapter.url,
    adapter.method || adapter.requestType,
    adapter
  );
  request(params, function (tData) {
    if (adapter && adapter.callback) {
      tData = adapter.callback(tData);
    }
    if (typeof callback === "function") {
      callback(tData);
    }
  });
};

WebCpu.prototype.initWebApp = function (elem, app) {
  if (!app) {
    return false;
  }
  var tCard = app;
  var key = app.key;
  var url = app.url || app;
  var _self = this;
  if (key && url) {
    WebAdapter.loadCardData(url, key, function (data) {
      tCard = data;
      if (typeof app.callback === "function") {
        app.callback(data);
      }
      if (data.style) {
        var style = document.querySelector("style.commonStyle");
        if (style) {
          style.parentNode.removeChild(style);
        }
        style = document.createElement("style");
        style.innerHTML = data.style;
        style.setAttribute("class", "commonStyle");
        document.head.appendChild(style);
      }

      if (data.moduleMap && data.routeData) {
        _self.initProject(elem, data);
      } else {
        _self.addCardItem(elem, data);
      }
    });
  } else {
    tCard = {
      task: {},
    };
    for (var k in app) {
      tCard.task[k] = app[k];
    }
    tCard.task.remote = true;
    tCard.task.template = app.url;
    tCard.task.url = "";
    tCard.task.promise = {
      afterRender: function (c, d, t) {
        if (typeof app.callback === "function") {
          app.callback(c, d, t);
        }
      },
    };
    webCpu.addCardItem(elem, tCard);
  }
  return tCard;
};

WebCpu.prototype.getDslData = function (htmlStr) {
  var div = document.createElement("div");
  div.innerHTML = htmlStr;
  var ret = {};
  var script = div.querySelector("script");
  if (script) {
    var tStr = script.innerHTML.trim();
    var tArr = tStr.split("{");
    tArr.shift();

    tStr = "{" + tArr.join("{");

    if (tStr) {
      tStr = tStr.trim();
      tStr = tStr.replace(/\;$/, "");
      try {
        ret = eval("(" + tStr + ")");
      } catch (e) {
        console.log(e, htmlStr);
      }
    }
    div.removeChild(script);
  }
  return ret;
};

WebCpu.prototype.getDslObj = function (htmlStr) {
  let scriptTagRegex = /<script>([\s\S]*?)<\/script>/;
  let match = htmlStr.match(scriptTagRegex);
  let scriptContent = "";
  if (match) {
    scriptContent = match[1].trim();
  }

  var ret = {};
  if (scriptContent) {
    var tStr = scriptContent.trim();
    var tArr = tStr.split("{");
    tArr.shift();

    tStr = "{" + tArr.join("{");

    if (tStr) {
      tStr = tStr.trim();
      tStr = tStr.replace(/\;$/, "");
      try {
        ret = eval("(" + tStr + ")");
      } catch (e) {
        console.log(e, htmlStr);
      }
    }
  }
  return ret;
};

WebCpu.prototype.expandCustomSelfClosingTags = function (htmlStr) {
  if (!htmlStr || typeof htmlStr !== "string") return htmlStr;

  let fixed = htmlStr;

  // 1️⃣ 修复非法 <bi bi-xxx> 标签（误生成图标标签）
  fixed = fixed
    .replace(/<bi\s+bi-([a-zA-Z0-9-]+)\s*\/>/g, '<i class="bi bi-$1"></i>')
    .replace(/<bi\s+bi-([a-zA-Z0-9-]+)>/g, '<i class="bi bi-$1">')
    .replace(/<\/bi\s+bi-([a-zA-Z0-9-]+)>/g, "</i>");

  // 2️⃣ 修复转义字符
  fixed = fixed
    .replace(/\\x3C/g, "<")
    .replace(/\\x3E/g, ">")
    .replace(/\\u003C/g, "<")
    .replace(/\\u003E/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

  // 3️⃣ 保留标准 HTML 自闭合标签（不展开）
  const voidTags = [
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
  ];

  // 4️⃣ 展开自定义组件（<el-dialog /> → <el-dialog></el-dialog>）
  fixed = fixed.replace(
    /<([a-zA-Z0-9\u4e00-\u9fa5:-]+)([^<>]*?)\/>/g,
    (m, tag, attrs) => {
      const lower = tag.toLowerCase();
      if (voidTags.includes(lower)) return m;
      if (lower === "i") return m; // 避免误展开 <i />
      return `<${tag}${attrs}></${tag}>`;
    }
  );

  // 5️⃣ 🔧 自动修复 <el-button icon="bi bi-xxx"> → 注入 <i class="bi bi-xxx"></i>
  //    同时保留其他属性
  fixed = fixed.replace(
    /<el-button([^>]*?)\sicon="bi\s+bi-([a-zA-Z0-9-]+)"([^>]*)>([\s\S]*?)<\/el-button>/g,
    (m, before, iconName, after, inner) => {
      // 去除 icon 属性
      const newAttrs = (before + " " + after)
        .replace(/\sicon="[^"]*"/, "")
        .trim();
      // 在按钮内容前插入 <i>
      const newInner = `<i class="bi bi-${iconName}"></i>${inner}`;
      return `<el-button ${newAttrs}>${newInner}</el-button>`;
    }
  );

  // 6️⃣ 去除多余空行
  fixed = fixed.replace(/\n\s*\n/g, "\n").trim();

  return fixed;
};

WebCpu.prototype.renderHTML = function (elem, htmlStr, type) {
  let ret = {};
  try {
    var div = document.createElement("div");
    div.innerHTML = this.expandCustomSelfClosingTags(htmlStr);
    var style = div.querySelector("style");
    var id = MurmurHash.rule(Math.random() + "", 31);
    if (style) {
      div.removeChild(style);
      var str = style.innerHTML;
      str = WebTool.json2css(WebTool.css2json(str), id);
      style.innerHTML = str;
      if (elem.parentNode) {
        elem.parentNode.appendChild(style);
      } else {
        document.head.appendChild(style);
      }
    }
    ret = this.getDslObj(htmlStr);

    if (type === "vuejs") {
      var template = div.querySelector("template") || div;
      elem.innerHTML = template.innerHTML;
    } else {
      elem.innerHTML = div.innerHTML;
    }

    var arr = elem.querySelectorAll("[component='CardItem']");
    for (var i = 0; i < arr.length; i++) {
      arr[i].setAttribute("itemType", "layoutCardItem");
    }
    elem.setAttribute("transweb-id", id);
  } catch (e) {
    console.log(e, htmlStr, type);
  }
  return ret;
};

WebCpu.prototype.previewAppData = function (elem, data, type, url) {
  if (
    typeof data !== "string" &&
    !data.className &&
    data.className !== "TemplateItem" &&
    data.className !== "ElementVueItem"
  ) {
    data = WebTool.objectToString(data);
  }
  if (!elem) {
    return false;
  }
  elem.innerHTML = "";
  if (elem) {
    const items = elem.querySelectorAll(".appDataPreviewItem");
    items.forEach((item) => item.remove());
  }
  var iframe = document.createElement("iframe");
  var time = new Date().getTime() + "";
  var iFrameId = MurmurHash.rule(time, 31);
  iframe.src = url || "preview.html" + "?iFrameId=" + iFrameId;
  var iframeOrigin = "*";
  try { iframeOrigin = new URL(iframe.src, window.location.origin).origin; } catch (e) {}
  iframe.width = "100%";
  iframe.height = "100%";
  iframe.frameborder = "0px";
  iframe.style = "border: none;";
  elem.appendChild(iframe);
  WebTool.listenMessage(function (tData) {
    var d = tData.data || {};
    if (
      iframe.contentWindow &&
      d.iFrameId === iFrameId &&
      d.type === "inited" &&
      d.value === "previewIframe"
    ) {
      iframe.contentWindow.postMessage(
        {
          type: "viewAppData",
          appType: type,
          data: data,
          iFrameId: iFrameId,
        },
        iframeOrigin
      );
    }
  }, iframeOrigin);
};

WebCpu.prototype.attachAiService = function (
  elem,
  url,
  btnText,
  callback,
  style
) {
  webCpu.attachLabel(
    elem,
    `<button style="padding: 3px 10px;"> ${btnText || "Transweb"} </button>`,
    {
      minWidth: "80px",
    },
    {
      parent: document.body,
    },
    true
  );
  let btnItem = elem.querySelector("._label_box");
  this.attachAttribute(style, btnItem.style);
  let iframe = document.createElement("iframe");
  iframe.src = url; // 替换为你要显示的 URL
  let iframeOrigin = "*";
  try { iframeOrigin = new URL(url, window.location.origin).origin; } catch (e) {}
  iframe.__serviceOrigin = iframeOrigin;
  iframe.style.width = "100%"; // 设置宽度
  iframe.style.height = "100%"; // 设置高度
  iframe.style.border = "none"; // 去掉边框
  iframe.style.position = "absolute";
  iframe.style.left = "0px";
  iframe.style.top = "0px";
  iframe.style.zIndex = -1;
  // 将 iframe 添加到 body
  document.body.appendChild(iframe);

  let _self = this;
  elem.querySelector("._label_box button").onclick = function () {
    let d = {};
    if (typeof callback) {
      d = callback();
    }
    _self.activateTask(iframe, d);
  };

  WebTool.listenMessage((tData) => {
    if (tData.data.value === "dismissCurrentService") {
      _self.dismissAiService(iframe);
    }
  }, iframeOrigin);

  return iframe;
};

WebCpu.prototype.activateTask = function (iframe, obj) {
  iframe.style.zIndex = 9999;
  iframe.contentWindow.postMessage(obj, iframe.__serviceOrigin || "*");
};

WebCpu.prototype.dismissAiService = function (iframe) {
  iframe.style.zIndex = -1;
};

WebCpu.prototype.initAppItem = function (elem, app, webApp, callback) {
  webApp = webApp || {};
  if (webApp.interface) {
    this.initAdapter(webApp.interface);
  }
  if (webApp.appMap) {
    this.attachAttribute(webApp.appMap, this.appMap);
  }
  this.params = webApp.params || {};
  this.data = webApp.data || {};

  if (webApp.interceptor) {
    AjaxInterface.interceptor = webApp.interceptor;
  }
  config = webApp.dependency || {};
  config.path = config.path || this.componentPath;
  let _self = this;
  this.initModule(config, "main", function (c, d, t) {
    _self.updateView(c, app, function (cc, dd, tt) {
      if (typeof callback === "function") {
        callback(cc, dd, tt);
      }
    });
  });
  var task = config;
  if (typeof config.interface === "string") {
    config.interface = this.interface[config.interface];
  }
  if (config.interface) {
    for (var k in config.interface) {
      task[k] = config.interface[k];
    }
  }

  var myCard = {
    className: "main",
    cardName: "main",
    task: task,
  };
  this.addCardItem(elem, myCard);
};

WebCpu.prototype.initProject = function (elem, webApp) {
  if (webApp.interface) {
    this.initAdapter(webApp.interface);
  }
  if (webApp.appMap) {
    this.attachAttribute(webApp.appMap, this.appMap);
  }
  this.params = webApp.params || {};
  this.data = webApp.data || {};

  if (webApp.interceptor) {
    AjaxInterface.interceptor = webApp.interceptor;
  }
  config = webApp.dependency || {};
  config.path = config.path || this.componentPath;
  this.initModule(config, "main", function (c, d, t) {
    webCpu.router = new TranswebRouter(
      c,
      webApp.moduleMap,
      webApp.routeData,
      webApp.breadcrumb,
      webApp.breadMap
    );
  });

  var task = config;
  if (typeof config.interface === "string") {
    config.interface = webCpu.interface[config.interface];
  }
  if (config.interface) {
    for (var k in config.interface) {
      task[k] = config.interface[k];
    }
  }
  // if(config.dsl) {
  //   this.attachAttribute(config.dsl, task);
  // }
  style = webApp.style || {};
  if (style.contentStyle) {
    var sItem = document.querySelector(".contentStyleItem");
    if (sItem && sItem.parentNode) {
      sItem.parentNode.removeChild(sItem);
    }
    sItem = document.createElement("style");
    sItem.innerHTML = decodeURIComponent(style.contentStyle);
    document.head.appendChild(sItem);
  }
  task.style = style.renderStyle || {};
  if (webApp.size && webApp.mode !== "mobile") {
    task.style.width = webApp.size.width;
    task.style.height = webApp.size.height;
  }
  var myCard = {
    className: "main",
    cardName: "main",
    style: style.containerStyle || {},
    task: task,
  };
  this.addCardItem(elem, myCard);
};

WebCpu.prototype.getDocumentApp = function (id, callback, type) {
  let time = new Date().getTime();
  let url =
    `${this.documentPrefix}/user/getDocumentFile?documentId=${id}&_time=${time}`;

  // type = type || "contentApp";
  let tCallback = (rData) => {
    rData = WebTool.copyObject(rData, true);
    let content = rData.content[0] || rData.content || {};
    content = content.content || content || {};
    let code = content.code || "";
    let app = {
      className: "ElementVueItem",
      dsl: {
        template: code,
      },
    };
    if ((rData.app && rData.app[type]) || type === "contentApp") {
      if (typeof rData.app[type] === "string" || "contentApp") {
        app = {
          className: "ElementVueItem",
          url: rData.app[type] || rData.app.url,
        };
      } else {
        app = rData.app[type];
      }
      app.dsl = app.dsl || {};
      app.dsl.data = app.dsl.data || {};
      app.dsl.data.content = content;
    }

    if (typeof callback === "function") {
      callback(app, content, rData);
    }
  };
  let request = null;
  if (location.hostname !== "") {
    request = new WebRequest(url, "get", "text");
    request({}, (str) => {
      const inner = eval(
                    `(${WebTool.extractContentInBrackets(str)})`);
      let rData = WebTool.copyObject(inner, true);
      tCallback(rData);
    });
  } else {
    request = new WebRequest(url, "jsonp", "text");
    request(
      {
        callback: `transweb_${id}`,
        _time: new Date().getTime(),
      },
      tCallback
    );
  }
};

WebCpu.prototype.renderAppItem = function (elem, id, dsl, type) {
  dsl = dsl || {};
  this.getDocumentApp(
    id,
    (app) => {
      this.attachAttribute(dsl, app.dsl);
      this.appMap = this.appMap || {};
      this.appMap[id] = app;
      this.updateView(elem, app);
    },
    type
  );
};

WebCpu.prototype.renderAppList = function (appList, callback) {
  if (!Array.isArray(appList) || appList.length === 0) {
    console.warn("renderAppList: appList 为空或无效");
    return;
  }

  const _self = this;
  const results = [];

  // 内部递归函数
  function renderNext(index) {
    if (index >= appList.length) {
      if (typeof callback === "function") {
        callback(results);
      }
      return;
    }

    const { id, elem, dsl = {}, type } = appList[index];
    if (!id || !elem) {
      console.warn(`renderAppList: 第 ${index} 项缺少 id 或 elem`);
      renderNext(index + 1);
      return;
    }

    // 同步顺序加载
    _self.getDocumentApp(
      id,
      function (app) {
        _self.attachAttribute(dsl, app.dsl);
        _self.updateView(elem, app);
        _self.appMap = _self.appMap || {};
        _self.appMap[id] = app;
        results.push({ id, elem, app });
        // 渲染下一个
        renderNext(index + 1);
      },
      type
    );
  }

  // 启动第一个渲染
  renderNext(0);
};

WebCpu.prototype.playScript = function (
  script,
  key
) {
  let app = {
    className: "TemplateItem",
    dsl: {
      url: script,
      query: {
        callback: key,
      },
      requestType: "jsonp",
      promise: {
        beforeRender: function (c, d, t) {
          arr = d.timeEvents || [];
          if (
            arr &&
            arr.length !== 0 &&
            typeof webCpu.CardItem.initTimeEvent === "function"
          ) {
            webCpu.CardItem.initTimeEvent(document.body, arr, window, () => {
              if (window.parent !== window) {
                window.parent.postMessage({
                  type: 'IFRAME_URL_CHANGE',
                  data: webCpu.accountData,
                  url: location.href
                }, '*');
              }
              webCpu.renderTaskResult();
            });
          }
        },
      },
    },
  };
  if (!key) {
    delete app.dsl.url;
    delete app.dsl.query;
    delete app.dsl.requestType;
    localStorage.transwebScript = localStorage.transwebScript || "{}";
    app.dsl.data = JSON.parse(localStorage.transwebScript);
  }
  let elem = document.createElement("div");
  elem.classList.add("scriptPlayerMask");

  // 批量设置样式
  Object.assign(elem.style, {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: "9000",
    overflow: "hidden",
    backgroundColor: "rgba(0, 0, 0, 0.001)",
  });

  document.body.appendChild(elem);
  this.updateView(elem, app);
};

WebCpu.prototype.renderTaskResult = function (options = {}) {
  // 1. 参数与数据提取
  const {
    data = (typeof webCpu !== 'undefined' ? webCpu?.accountData : {}) || {},
    selector = ".scriptPlayerMask .TemplateItem._task_container",
    title = "执行完成"
  } = options;

  const $container = $(selector);
  if (!$container.length) {
    console.warn(`[renderTaskResult] 未找到目标容器: ${selector}`);
    return;
  }

  const formattedJson = JSON.stringify(data, null, 2);

  // HTML 转义函数（防 XSS）
  const escapeHtml = (str) =>
    str.replace(/[&<>"']/g, match => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[match]));

  // 2. 构造 HTML 结构
  const htmlContent = `
    <div class="task-result-card">
      <div class="task-result-header">
        <div class="task-result-status">
          <span class="task-result-badge">✓</span>
          <span class="task-result-title">${escapeHtml(title)}</span>
        </div>
        <button class="task-copy-btn" type="button">
          <svg class="copy-icon" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span class="copy-btn-text">复制结果</span>
        </button>
      </div>
      <div class="task-result-body">
        <pre class="task-result-code"><code>${escapeHtml(formattedJson)}</code></pre>
      </div>
    </div>
  `;

  // 3. 渲染 HTML 并应用自适应/堆叠 CSS 样式
  $container.html(htmlContent).css({
    "background-color": "rgba(255, 255, 255, 0.15)",
    "backdrop-filter": "blur(8px)",
    "-webkit-backdrop-filter": "blur(8px)",
    "border-radius": "12px",
    "padding": "16px",
    "box-shadow": "0 8px 32px 0 rgba(0, 0, 0, 0.2)",
    "border": "1px solid rgba(255, 255, 255, 0.18)",
    "margin-bottom": "16px",
    "color": "#fff",
    "font-family": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  });

  // 4. 动态注入 CSS（仅注入一次）
  if (!$("#task-result-styles").length) {
    $("head").append(`
      <style id="task-result-styles">
        .task-result-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          box-sizing: border-box;
        }
        .task-result-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .task-result-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 15px;
          color: #4ade80;
        }
        .task-result-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          background: rgba(74, 222, 128, 0.2);
          border-radius: 50%;
          font-size: 12px;
        }
        .task-copy-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          font-size: 12px;
          color: #333;
          background: rgba(255, 255, 255, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          outline: none;
        }
        .task-copy-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.4);
        }
        .task-copy-btn.copied {
          background: rgba(74, 222, 128, 0.6);
          border-color: #4ade80;
          color: #333;
        }
        .task-result-body {
          max-height: 280px;
          overflow-y: auto;
          border-radius: 6px;
          background: rgba(0, 0, 0, 0.4);
        }
        .task-result-code {
          margin: 0;
          padding: 12px;
          font-family: 'Fira Code', Consolas, Monaco, monospace;
          font-size: 12px;
          line-height: 1.5;
          color: #e2e8f0;
          white-space: pre-wrap;
          word-break: break-all;
        }
        .task-result-body::-webkit-scrollbar {
          width: 6px;
        }
        .task-result-body::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
      </style>
    `);
  }

  // 5. 复制点击事件绑定
  $container.off("click", ".task-copy-btn").on("click", ".task-copy-btn", function () {
    const $btn = $(this);
    const $text = $btn.find(".copy-btn-text");

    const copyText = (text) => {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
      } else {
        return new Promise((resolve, reject) => {
          const $textarea = $("<textarea>")
            .val(text)
            .css({ position: "fixed", left: "-9999px", top: "0" })
            .appendTo("body");
          $textarea[0].select();
          const successful = document.execCommand("copy");
          $textarea.remove();
          successful ? resolve() : reject();
        });
      }
    };

    copyText(formattedJson)
      .then(() => {
        $btn.addClass("copied");
        $text.text("已复制!");
        setTimeout(() => {
          $btn.removeClass("copied");
          $text.text("复制结果");
        }, 2000);
      })
      .catch(() => {
        $text.text("复制失败");
      });
  });
}

TranswebRouter = function (elem, moduleMap, routeData, breadcrumb, breadMap) {
  this.routeData = routeData || [];
  this.breadcrumb = breadcrumb || {};
  this.moduleMap = moduleMap;
  //面包屑点击跳转地址映射map对象(在CardItem组件中实现跳转)
  this.breadMap = breadMap || {};
  this.elem = elem || document.body;
  this.query = {};
  this.path = "/";
  this.home = routeData[0];
  for (var i = 0; i < routeData.length; i++) {
    var module = routeData[i].module;
    if (this.moduleMap[module] && this.moduleMap[module].isHome) {
      this.home = routeData[i];
      break;
    }
  }

  var _self = this;
  window.window.onhashchange = function (d) {
    _self.switchPage(d);
  };
  this.routeMap = this.initData(this.routeData);
  this.switchPage();
};

TranswebRouter.prototype.initData = function (arr) {
  var ret = {};
  arr = arr || [];
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].path) {
      ret[arr[i].path] = arr[i];
      if (arr[i].children && arr[i].children.constructor.name === "Array") {
        ret[arr[i].path].children = this.initData(arr[i].children);
      }
    }
  }
  return ret;
};

TranswebRouter.prototype.renderPage = function (elem, arr, rMap) {
  if (!this.routeData || this.routeData === 0) {
    return false;
  }
  var key = "home";
  this.moduleMap = this.moduleMap || {};
  if (!this.routeData || !this.routeData[0]) {
    return false;
  }

  var temp = this.moduleMap[this.home.module] || this.moduleMap[key];
  if (!arr || arr.length === 0) {
    var app = temp;
    webCpu.updateView(elem, app);
  } else {
    var path = arr.shift();
    var rData = rMap[path] || rMap[this.home.path] || rMap["/" + key];
    if (!rData) {
      return false;
    }

    var mName = rData.module;
    var app = this.moduleMap[mName] || {};
    app.routeView = rData.routeView;
    var _self = this;
    elem.setAttribute("name", mName);
    webCpu.updateView(elem, app, function (cc, d, t) {
      if (rData.children && arr.length !== 0) {
        var elemArr = cc.querySelectorAll("div[component='CardItem']");
        var rIndex = rData.routeView;
        var view = elemArr[rIndex];
        if (rIndex || view) {
          _self.renderPage(view, arr, rData.children);
        }
      }
    });
  }
};

TranswebRouter.prototype.switchPage = function (d) {
  this.initRouter();
  var arr = this.path.match(/\/\w*/g);
  this.renderPage(this.elem, arr, this.routeMap);
};

TranswebRouter.prototype.push = function (d) {
  d = d || {};
  if (typeof d === "string") {
    d = {
      path: d,
    };
  }
  var hash = "#" + (d.path || "/");
  if (d.query) {
    hash = WebTool.attachParams(hash, d.query);
  }
  this.params = d.params || {};
  location.hash = hash;
};

TranswebRouter.prototype.initRouter = function () {
  var hash = location.hash || "";
  if (!hash) {
    return false;
  }
  var t = hash.match(/\#\S*\?/) || [""];
  this.path = t[0].replace(/[\#\?]/g, "") || hash.replace(/^\#/g, "");
  t = hash.match(/\?\S*/) || [""];
  var qStr = t[0].replace(/^\?/, "");
  arr = qStr.match(/\w+\=/g) || [];
  arr = arr.map(function (item) {
    return item.replace("=", "");
  });
  var vArr = qStr.match(/\=\w*/g) || [];
  vArr = vArr.map(function (item) {
    return item.replace("=", "");
  });
  for (var i = 0; i < arr.length; i++) {
    this.query[arr[i]] = vArr[i] || "";
  }
};

var CrossDomainService = function (interfaceData, callback) {
  // this.cardList = cardList;
  this.interfaceData = interfaceData;
  this.messageCallback = {};
  if (!this.interfaceData) {
    return;
  }

  this.iframeOrigin = "*";
  if (this.interfaceData.constructor.name !== "Array") {
    var iUrl = this.interfaceData.src || this.interfaceData;
    this.iframe = this.getBridgeIframe(iUrl);
    try {
      this.iframeOrigin = new URL(this.iframe.src, window.location.origin).origin;
    } catch (e) {
      this.iframeOrigin = "*";
    }
  }

  var _self = this;
  WebTool.listenMessage(function (e) {
    var data = e.data;
    if (
      typeof data === "string" &&
      data.search("{") !== -1 &&
      data.search("}") !== -1
    ) {
      data = JSON.parse(data);
    }
    if (data.inited) {
      var proxy = data.url;
      var key = MurmurHash.rule(proxy, 31);
      if (webCpu.crossItem[key]) {
        webCpu.crossItem[key].inited = data.inited;
      }
      if (typeof callback === "function") {
        data = data || {};
        callback(_self, data.data);
      }
    }
    if (
      data.messageId &&
      typeof _self.messageCallback[data.messageId] === "function"
    ) {
      _self.messageCallback[data.messageId](data.data);
      delete _self.messageCallback[data.messageId];
    } else {
    }
  }, this.iframeOrigin);
};

CrossDomainService.prototype.request = function (
  url,
  query,
  requestType,
  callback,
  type,
  contentType,
  header
) {
  var key = MurmurHash.rule(url + JSON.stringify(query), 31);
  var messageId = "_" + Math.random() + new Date().getTime() + key;
  if (query.constructor.name === "FormData") {
    query = query.params || {};
  }
  var requestData = {
    query: query,
    requestType: requestType,
    url: url,
    dataType: type,
    contentType: contentType,
    messageId: messageId,
    header: header,
  };
  requestData = JSON.parse(JSON.stringify(requestData));
  this.iframe.contentWindow.postMessage(requestData, this.iframeOrigin || "*");
  this.messageCallback[messageId] = function (data) {
    if (typeof callback === "function") {
      callback(data);
    }
  };
};

CrossDomainService.prototype.getBridgeIframe = function (url) {
  var id = MurmurHash.rule(url);
  var iframe = document.getElementById(id);
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.setAttribute("allowTransparency", "true");
    iframe.setAttribute("id", MurmurHash.rule(url));
    iframe.setAttribute("frameBorder", "0");
    iframe.setAttribute("scrolling", "no");
    iframe.style.cssText =
      "height:0px;width:0px;float:none;position:absolute;overflow:hidden;z-index:333333;margin:0;padding:0;border:0 none;background:none;";
    document.body.appendChild(iframe);
  }
  iframe.src = url;

  return iframe;
};

var WebTool = {};

WebTool.listenMessage = function (callback, origin) {
  this.tMessageCallback = function (message) {
    if (!origin || origin === message.origin || origin === "*") {
      callback(message);
    }
  };
  if (window.addEventListener) {
    window.removeEventListener("message", this.tMessageCallback);
    window.addEventListener("message", this.tMessageCallback, false);
  } else {
    window.detachEvent("onmessage", this.tMessageCallback);
    window.attachEvent("onmessage", this.tMessageCallback);
  }
};

WebTool.detectOS = function () {
  const platform = navigator.platform.toLowerCase();
  const userAgent = navigator.userAgent.toLowerCase();

  if (platform.includes("mac")) {
    return "macOS";
  } else if (platform.includes("win")) {
    return "Windows";
  } else if (/iphone|ipad|ipod/.test(userAgent)) {
    return "iOS";
  } else if (/android/.test(userAgent)) {
    return "Android";
  } else if (/linux/.test(platform)) {
    return "Linux";
  } else {
    return "Unknown";
  }
};

WebTool.exportWorkflow = function (config, callback, name) {
  let adapter = webCpu.initAdapter({
    getTempApp: {
      url: webCpu.documentPrefix + "/workflow/index.html",
      method: "get",
      dataType: "text",
    },
  });
  adapter.getTempApp({}, async (htmlText) => {
    let time = new Date().toLocaleString().replace(/\//g, "-").replace(/:\s*/g, "-");
    name = name || `${config.title || "workflow"}-${time}.html`;
    // 5. 正则匹配：通过 template 右边界锚点精准全量平替 app.task.data（具备完全幂等性，防重复执行异常）
    const dataRegex = /(data:\s*)([\s\S]*?)(,\s*\n?\s*template:)/;
    if (!dataRegex.test(htmlText)) {
      console.error('❌ [Error] 在 index.html 中未匹配到 app.task.data 特征结构！');
      return;
    }
    if (typeof config !== "string") {
      config = JSON.stringify(config);
    }
    htmlText = htmlText.replace(dataRegex, `$1${config}$3`);

    WebTool.downloadString(htmlText, name, "text/html");
    if (typeof callback === "function") {
      callback(name);
    }
  });
}

WebTool.instrumentTemplate = function (raw) {
  const len = raw.length;
  let i = 0;

  // ============================================================
  // 预扫描已有 data-edit-id，避免重复
  // ============================================================
  let maxId = 0;
  raw.replace(/data-edit-id\s*=\s*"(\d+)"/g, (_, n) => {
    const v = parseInt(n, 10);
    if (!isNaN(v) && v > maxId) maxId = v;
  });
  let id = maxId + 1;

  const nodeMap = {};
  const out = [];

  // ============================================================
  // ⭐ 安全标签构建器（唯一输出入口）
  // ============================================================
  function buildTag({
    tagName,
    rawAttrs = "",
    selfClose = false,
    editId = null,
  }) {
    let attrs = rawAttrs.trim();

    if (attrs) {
      attrs = attrs.startsWith(" ") ? attrs : " " + attrs;
    }

    if (editId != null && !/data-edit-id\s*=/.test(attrs)) {
      attrs += ` data-edit-id="${editId}"`;
    }

    if (selfClose) {
      return `<${tagName}${attrs} />`;
    }

    return `<${tagName}${attrs}>`;
  }

  while (i < len) {
    const ch = raw[i];

    if (ch !== "<") {
      out.push(ch);
      i++;
      continue;
    }

    let j = i + 1;

    // ================= 注释 =================
    if (raw.startsWith("!--", j)) {
      const end = raw.indexOf("-->", j + 3);
      if (end !== -1) {
        out.push(raw.slice(i, end + 3));
        i = end + 3;
        continue;
      }
      out.push("<");
      i++;
      continue;
    }

    // ================= 闭合标签 </xxx> =================
    if (raw[j] === "/") {
      j++;
      while (j < len && raw[j] !== ">") j++;
      if (j < len) {
        out.push(raw.slice(i, j + 1));
        i = j + 1;
        continue;
      }
      out.push("<");
      i++;
      continue;
    }

    // 跳过 < 后空白
    while (j < len && /\s/.test(raw[j])) j++;

    // ================= 读取 tagName =================
    const nameStart = j;
    while (j < len && /[A-Za-z0-9\-_]/.test(raw[j])) j++;
    const tagName = raw.slice(nameStart, j);
    if (!tagName) {
      out.push("<");
      i++;
      continue;
    }

    const lower = tagName.toLowerCase();

    // ================= script / style 整块跳过 =================
    if (lower === "script" || lower === "style") {
      let close = j;
      while (close < len && raw[close] !== ">") close++;
      if (close >= len) {
        out.push(raw.slice(i));
        break;
      }
      const endTag = `</${lower}>`;
      const endIndex = raw.indexOf(endTag, close);
      if (endIndex !== -1) {
        out.push(raw.slice(i, endIndex + endTag.length));
        i = endIndex + endTag.length;
        continue;
      }
      out.push(raw.slice(i));
      break;
    }

    // 跳过 tagName 后空白
    while (j < len && /\s/.test(raw[j])) j++;

    // ================= 属性扫描状态机 =================
    const attrStart = j;
    let k = j;
    let inSingle = false;
    let inDouble = false;
    let braceDepth = 0;

    while (k < len) {
      const c = raw[k];

      if (inSingle) {
        if (c === "'") inSingle = false;
        k++;
        continue;
      }
      if (inDouble) {
        if (c === '"') inDouble = false;
        k++;
        continue;
      }

      if (c === "'") {
        inSingle = true;
        k++;
        continue;
      }
      if (c === '"') {
        inDouble = true;
        k++;
        continue;
      }

      if (raw.startsWith("{{", k)) {
        braceDepth++;
        k += 2;
        continue;
      }
      if (raw.startsWith("}}", k)) {
        braceDepth = Math.max(0, braceDepth - 1);
        k += 2;
        continue;
      }

      if (!inSingle && !inDouble && braceDepth === 0) {
        if (c === ">") break;
        if (c === "/" && raw[k + 1] === ">") break;
      }

      k++;
    }

    const isSelfClose = raw[k] === "/" && raw[k + 1] === ">";
    const rawAttrs = raw.slice(attrStart, k);
    const hasEdit = /data-edit-id\s*=/.test(rawAttrs);

    // ================= 输出（唯一出口） =================
    if (isSelfClose) {
      if (!hasEdit) {
        const editId = id++;
        nodeMap[editId] = {
          tag: tagName,
        };

        out.push(
          buildTag({
            tagName,
            rawAttrs,
            selfClose: true,
            editId,
          })
        );
      } else {
        out.push(
          buildTag({
            tagName,
            rawAttrs,
            selfClose: true,
          })
        );
      }

      i = k + 2;
      continue;
    }

    if (!hasEdit) {
      const editId = id++;
      nodeMap[editId] = {
        tag: tagName,
      };

      out.push(
        buildTag({
          tagName,
          rawAttrs,
          selfClose: false,
          editId,
        })
      );
    } else {
      out.push(
        buildTag({
          tagName,
          rawAttrs,
          selfClose: false,
        })
      );
    }

    i = k + 1;
  }

  return {
    template: out.join(""),
    nodeMap,
  };
};

WebTool.copyWebApp = function (baseItem, appData, name, callback) {
  if (!baseItem || typeof baseItem.saveContentData !== "function") {
    console.warn("copyWebApp: baseItem 无效，无法获取应用数据");
    return;
  }
  let spec = appData.documentMeta.spec || {};
  spec["需求分析"] = spec["需求分析"] || {};
  spec["需求分析"].appName = name || spec["需求分析"].appName || "";
  this.exportWebApp(
    baseItem,
    appData.content || "",
    spec || {},
    appData.documentMeta || {},
    callback
  );
};
WebTool.buildPromptBySpec = function (spec) {
  if (!spec || typeof spec !== "object") {
    throw new Error("Invalid Spec: Spec must be a JSON object.");
  }

  let {
    "需求分析": exp = {},
    "结构设计": schema = {},
    "语义绑定": bindings = [],
  } = spec;

  schema = schema.aigcSchema || schema;

  schema = schema.items || schema;

  if (!schema || !schema.properties) {
    throw new Error("Invalid Spec: schema.properties is missing.");
    return "";
  }

  /* --- 1. 递归解析字段定义与语义绑定 --- */
  function parseFieldDefinitions(props, parentPath = "") {
    let descArray = [];
    for (const key in props) {
      const currentPath = parentPath ? `${parentPath}.${key}` : key;
      const prop = props[key];
      const binding = bindings.find((b) => b.field === currentPath);
      const intent = binding ? ` [Intent: ${binding.displayIntent}]` : "";

      descArray.push(
        `- ${currentPath}: ${prop.description || ""}${intent}`
      );

      if (prop.type === "object" && prop.properties) {
        descArray = descArray.concat(
          parseFieldDefinitions(prop.properties, currentPath)
        );
      } else if (
        prop.type === "array" &&
        prop.items &&
        prop.items.properties
      ) {
        descArray = descArray.concat(
          parseFieldDefinitions(prop.items.properties, currentPath)
        );
      }
    }
    return descArray;
  }

  /* --- 2. 递归生成符合 Schema 的示例数据 --- */
  function generateJsonExample(properties) {
    const example = {};
    for (const key in properties) {
      const prop = properties[key];
      if (prop.type === "array") {
        if (prop.items && prop.items.properties) {
          // 处理对象数组（如 topics）
          example[key] = [generateJsonExample(prop.items.properties)];
        } else {
          // 处理简单数组（如 tags）
          example[key] = ["example_value_1", "example_value_2"];
        }
      } else if (prop.type === "object" && prop.properties) {
        example[key] = generateJsonExample(prop.properties);
      } else {
        // 基础类型占位符
        example[key] = `[${prop.description || key}]`;
      }
    }
    return example;
  }

  const fieldDefinitions = parseFieldDefinitions(schema.properties).join(
    "\n"
  );
  const jsonExample = JSON.stringify(
    generateJsonExample(schema.properties),
    null,
    2
  );

  /* --- 3. 组装 Prompt 模板 --- */
  const promptLines = [
    `# Role`,
    `${exp.role || exp.appName || "AI Content Generator"}`,

    exp.introduce ? `## About\n${exp.introduce}` : "",

    `## Objective\n${exp.appGoal}`,

    exp.successOutput ? `## Success Criteria\n${exp.successOutput}` : "",

    `## Data Schema`,
    fieldDefinitions,

    `## Output Format`,
    `You must return only a valid JSON object. The JSON must strictly adhere to the defined schema. Do not include any explanatory text, markdown formatting, or conversational language outside of the JSON. The JSON should be well-formed and parsable.`,
    `### JSON Example`,
    `\`\`\`json\n${jsonExample}\n\`\`\``,

    `## Constraints`,
    Array.isArray(exp.constraints) ?
      exp.constraints.map((c) => `- ${c}`).join("\n") :
      "",
    `- No conversational filler. No markdown wrapper outside the JSON.`,
    `- Ensure all keys match the schema exactly.`
  ];

  return promptLines.filter((line) => line.trim() !== "").join("\n\n");
}

WebTool.buildAgentPageHtml = function (url, name) {
  const title = (name || "Agent").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const safeUrl = (url || "").replace(/"/g, "&quot;");
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }
    .agent-frame { display: block; width: 100%; height: 100%; border: none; }
  </style>
</head>
<body>
  <iframe class="agent-frame" src="${safeUrl}" allow="clipboard-read; clipboard-write" allowfullscreen></iframe>
</body>
</html>`;
}

WebTool.backupWebApp = function (documentId, appItem, params, callback) {
  let tCallback = async (htmlText, prompt, callback) => {
    let str = htmlText.bindData({
      documentId: documentId,
      name: appItem.name || appItem.title,
      description: appItem.description,
    });

    let name = appItem.title;
    const session = this.createExportSession();
    if (params && params.spec) {
      let temp = new Blob([params.spec], {
        type: "text/plain;charset=utf-8",
      });
      session.addFile(`appSpec.json`, temp);
    }

    if (documentId) {
      temp = new Blob([str], {
        type: "text/plain;charset=utf-8",
      });
      session.addFile(`appPage.html`, temp);
    }

    prompt = prompt || params.prompt;
    if (prompt) {
      temp = new Blob([prompt], {
        type: "text/plain;charset=utf-8",
      });
      session.addFile(`appPrompt.md`, temp);
    }
    temp = new Blob([appItem.code], {
      type: "text/plain;charset=utf-8",
    });
    session.addFile(`appCode.vue`, temp);
    await session.finalize(`${name}.zip`);

    if (typeof callback === "function") {
      callback(documentId);
    }
  }
  let htmlText = this.buildAgentPageHtml(`${location.origin}?id=${documentId}&solo=true`, appItem.name || appItem.title);
  if (window.aigcInterface && typeof window.aigcInterface.getAgentPrompt === "function") {
    aigcInterface.getAgentPrompt(documentId).then((prompt) => {
      tCallback(htmlText, prompt, callback);
    }).catch((err) => {
      console.log("获取 Agent Prompt 失败，继续执行备份", err);
    });
  } else {
    tCallback(htmlText, "", callback);
  }

};

WebTool.attachAigcCode = function (code, spec) {
  let prompt = this.buildPromptBySpec(spec);
  let opList = {
    ops: [{
      op: "js.data.update",
      path: "defaultTemplate",
      value: prompt,
    },
    {
      op: "js.methods.update",
      name: "handleGenerate",
      body: `
      let query = this.query || {};
      query.content = this.defaultTemplate || "";
      query.context = this.content.inputText || "";
      if(!query.context) {
        console.warn('缺少输入内容，无法生成！');
        return;
      }
      this.loading = true;
      let count = 0;
      let tRequest = (query) => {
        count++;
        aigcRequest(
          query,
          (tData) => {
            try {
              let parsed = WebTool.extractJSON(tData.usage.result);
              this.accountData = this.accountData || {};
              Object.assign(this.accountData, parsed);
              this.content.outputText = JSON.stringify(parsed);
              let auto = WebTool.urlQuery(location.href, "auto");
              if(auto) {
                WebTool.copyString(this.content.outputText);
                this.exportMarkdownItem();
              }
              this.loading = false;
            } catch (e) {
              console.log(e, '请求结果有误，正在重试');
              if (count < 5) {
                aigcRequest(query);
              } else {
                console.log('生成失败，已经重试了'+ count + '次！');
                this.loading = false;
              }
            }
          },
          (err)=> {
            console.log("aigc 请求出现异常", err)
            this.loading = false;
            }
        );
      };
      tRequest(query);
    `,
    },
    {
      op: "js.root.update",
      path: "mounted",
      body: `this.content = this.content || {};
			let input = WebTool.urlQuery(location.href, "input");
      let auto = WebTool.urlQuery(location.href, "auto");
			if(input) {
				this.content.inputText = input;
        if(auto) {
          this.handleGenerate();
        }
			}
      `
    },
    {
      op: "js.methods.update",
      name: "exportImageItem",
      body: `let el = this.$refs.previewArea;
      el = el.$el || el;
      if (el) {
        let title = webCpu.currentCard.task.vueItem.content.title;
        const name = title + "_" + Date.now() + '_result.png';
        WebTool.transformImage(el, name, "png", { download: true });
      }
      `,
    },
    {
      op: "js.methods.update",
      name: "exportMarkdownItem",
      body: `let el = this.$refs.previewArea;
      el = el.$el || el;
      if (el) {
        let title = webCpu.currentCard.task.vueItem.content.title;
        let name = title + '_' + Date.now() + '_result.md';
				WebTool.convertHtmlToMd(el, { download: true, name: name });
      }
      `
    },
    ],
  };
  const result = VueSfcEditorPlugin.applyWithResult(code, opList);
  return result.code;
}

WebTool.attachLoginItem = function (code, title) {
  if (code.search('appName="loginRegItem"') === -1) {
    let tempPlugin = {
      ops: [
        {
          op: "tpl.insert",
          id: 2,
          position: "inside-start",
          html: '<div v-if="isSolo || content.isSolo" class="tw-flex tw-relative tw-px-0 tw-items-center tw-w-full tw-gap-2 tw-justify-between" data-edit-id="100">\n  <div class="tw-flex tw-items-center tw-gap-4" data-edit-id="101">\n    <h1 class="tw-font-bold tw-text-xl tw-text-gray-900 tw-whitespace-nowrap tw-m-0" data-edit-id="102">{{appName}}</h1>\n  </div>\n  <div class="tw-flex tw-items-center" :style="{ width: \'180px\', height: \'50px\' }" data-edit-id="103">\n    <div appName="loginRegItem" component="CardItem" :style="{ width: \'180px\', height: \'35px\' }" data-edit-id="104"></div>\n  </div>\n</div>',
        },
        {
          op: "js.root.update",
          path: "appMap",
          raw: true,
          value: {
            loginRegItem: {
              url: webCpu.documentPrefix + "/mainApp/app/loginRegItem.js",
              key: "transweb_loginRegItem",
              cardName: "loginRegCard",
              dsl: {
                data: {
                  position: "top",
                  loginedMenu: [],
                },
              },
            },
          },
        },
        {
          op: "js.data.add",
          path: "isSolo",
          raw: true,
          value: "WebTool.urlQuery(location.href, 'solo')",
        },
      ],
    };
    let opList = JSON.parse(JSON.stringify(tempPlugin));
    opList.ops[0].html = tempPlugin.ops[0].html.bindData({
      appName: title,
    });
    let tCode = this.instrumentTemplate(code);
    const result = VueSfcEditorPlugin.applyWithResult(tCode.template, opList);
    if (result.changed) {
      console.log("加载成功", result.summary);
      code = result.code;
    }
  }
  return code;
}

WebTool.downloadApp = function (documentId, callback) {
  webCpu.getDocumentApp(documentId, (app, content, rData) => {
    this.backupWebApp(documentId, content, {}, callback);
  });
}

WebTool.cloneAppItem = function (code, prompt, callback) {
  let baseItem = aigcInterface;
  let dslData = webCpu.getDslData(code);
  let params = dslData.data();
  params.prompt = prompt;
  dslData.computed = dslData.computed || {};
  params.type = "text";
  if (typeof dslData.computed.currentImage === "function") {
    params.type = "image";
  }
  if (params.type === "image" && typeof params.currentFile !== "undefined") {
    params.type = "textImage";
  }

  if (params.type === "textImage" || params.type === "image") {
    params.apiName = webCpu.appConfig.defaultImageModel.apiName;
    params.model = webCpu.appConfig.defaultImageModel.model;
  }
  else {
    params.apiName = webCpu.appConfig.defaultModel.apiName;
    params.model = webCpu.appConfig.defaultModel.model;
  }

  this.exportWebApp(baseItem, code, params, {}, (documentId) => {
    if (typeof callback === "function") {
      callback(documentId);
    }
  });
}


WebTool.exportWebApp = function (baseItem, content, params, meta, callback) {
  if (!baseItem || typeof baseItem.saveContentData !== "function") {
    console.warn("exportWebApp: baseItem 无效，无法保存应用数据");
    return;
  }
  meta = JSON.parse(JSON.stringify(meta || {}));
  let appItem = content;
  if (typeof content === "string") {
    appItem = {
      code: content,
    };
  }

  meta.folderName = localStorage.folderName;

  appItem.title = params.title || "未命名";
  appItem.description = params.description || "";

  let appData = {
    content: appItem,
    app: baseItem.currentApp,
    prompt: params.prompt,
    documentMeta: {
      root: meta.root || WebTool.urlQuery(location.href, "id") || "",
      rootAccount: meta.rootAccount || localStorage.folderName || "",
      folderName: meta.folderName || localStorage.folderName || "",
      userName: meta.userName || localStorage.userName,
      spec: params.spec || "",
      type: params.type,
      name: params.name,
      category: params.category,
      grades: params.grades,
      description: params.description,
      introduce: params.introduce,
      title: params.title,
      tags: params.tags,
      icon: params.icon || "#",
      rootFlag: 1,
    },
  };

  if (params.apiName) {
    appData.documentMeta.apiName = params.apiName;
    appData.documentMeta.model = params.model;
  }

  let id = MurmurHash.rule(JSON.stringify(appItem) + new Date().getTime() + Math.random(), 31);
  appData.documentMeta.documentId = id;
  baseItem.saveContentData(appData, id, async (rData) => {
    if (typeof callback === "function") {
      callback(rData.documentId);
    }
    else {
      this.backupWebApp(rData.documentId, appItem, params);
    }
  });
};

WebTool.generateWorkflowApp = function (baseItem, params, appList, callback, template) {
  let adapter = webCpu.initAdapter({
    getTempApp: {
      url: template || webCpu.documentPrefix + "/webApps/document/workflow.vue",
      method: "get",
      dataType: "text",
    },
  });
  adapter.getTempApp({}, (code) => {
    let opList = {
      ops: [
        {
          op: "js.data.update",
          path: "workflowName",
          value: params.title,
        },
        {
          op: "js.data.update",
          path: "defaultData",
          raw: true,
          value: JSON.stringify({
            apps: appList
          }),
        },
      ],
    };

    let tCode = this.instrumentTemplate(code);
    const result = VueSfcEditorPlugin.applyWithResult(tCode.template, opList);
    if (result.changed) {
      console.log("加载成功", result.summary);
      code = result.code;
    }
    params.code = code;
    this.exportWebApp(baseItem, params, {}, {}, callback);
  });
}

WebTool.extractAppTaskData = function (html) {
  const doc = new DOMParser().parseFromString(html, "text/html");

  const scriptTags = [...doc.querySelectorAll("script")];

  for (const script of scriptTags) {
    const text = script.textContent || "";

    if (text.includes("let app")) {
      const match = text.match(/let\s+app\s*=\s*({[\s\S]*?})\s*;/);
      if (match) {
        try {
          const app = JSON.parse(match[1]);
          return {
            ret: 0,
            data: app?.task?.data,
            app,
          };
        } catch (e) {
          return {
            ret: 1,
            message: "DOM解析失败",
          };
        }
      }
    }
  }

  return {
    ret: 1,
    message: "未找到 app script",
  };
}

WebTool.fetchHtmlDataSmart = async function (
  targetUrl,
  proxyUrl = "/user/htmlProxy") {
  if (!targetUrl) {
    throw new Error("缺少 targetUrl 参数");
  }

  /**
   * 判断是否跨域
   */
  function isCrossOrigin(url) {
    try {
      const target = new URL(url, window.location.href);
      return target.origin !== window.location.origin;
    } catch (e) {
      return true; // 解析失败默认走代理更安全
    }
  }

  /**
   * 获取 HTML（直连 or 代理）
   */
  async function getHtml() {
    // ✅ 同源：直接 fetch
    if (!isCrossOrigin(targetUrl)) {
      const res = await fetch(targetUrl, {
        credentials: "include",
      });
      return await res.text();
    }

    // ❌ 跨域：走代理
    const res = await fetch(
      `${proxyUrl}?url=${encodeURIComponent(targetUrl)}`
    );

    const result = await res.json();

    if (!result || result.ret !== 0) {
      throw new Error(result?.message || "代理请求失败");
    }

    return result.data;
  }

  try {
    const html = await getHtml();
    let dataObj = null;
    try {
      dataObj = this.extractAppTaskData(html);
    } catch (e) {
      return {
        ret: 1,
        message: "data 解析失败",
        raw: html,
      };
    }

    return {
      ret: 0,
      data: dataObj.data,
      raw: html,
    };
  } catch (error) {
    return {
      ret: 1,
      message: error.message || "请求失败",
      data: null,
    };
  }
}

WebTool.urlQuery = function (url, key) {
  var t = url.split("#");
  var ret = 0;
  for (var i = 0; i < t.length; i++) {
    ret = ret || this._urlQuery(t[i], key);
  }
  return ret;
};

WebTool.downLoadByUrl = function (url, name, method, param, header) {
  if (!url) {
    return false;
  }
  var arr = url.split("/");
  if (arr.length < 2) {
    arr = url.split("\\");
  }
  name = name || arr[arr.length - 1];

  var xhr = new XMLHttpRequest();
  //GET请求,请求路径url,async(是否异步)
  method = method || "GET";
  xhr.open(method, url, true);
  //设置请求头参数的方式,如果没有可忽略此行代码
  if (header) {
    for (var k in header) {
      xhr.setRequestHeader(k, header[k]);
    }
  }
  //设置响应类型为 blob
  xhr.responseType = "blob";

  var _self = this;
  //关键部分
  xhr.onload = function (e) {
    //如果请求执行成功
    if (this.status == 200) {
      var blob = this.response;
      _self.downloadString(blob, name);
    }
  };
  //发送请求
  if (header && header["Content-Type"].search("application/json") !== -1) {
    param = JSON.stringify(param);
  }
  xhr.send(param);
};

WebTool.jsonToExcel = function (data, head, name = "test") {
  let str = head ? head + "\n" : "";
  data.forEach((item) => {
    // 拼接json数据, 增加 \t 为了不让表格显示科学计数法或者其他格式
    for (let key in item) {
      str = `${str + item[key] + "\t"},`;
    }
    str += "\n";
  });
  // encodeURIComponent解决中文乱码
  const uri = "data:text/csv;charset=utf-8,\ufeff" + encodeURIComponent(str);
  // 通过创建a标签实现
  const link = document.createElement("a");
  link.href = uri;
  // 对下载的文件命名
  link.download = `${name + ".csv"}`;
  link.click();
};

WebTool.urlToBase64 = function (url, callback, type) {
  let proxy = false;
  let re = `^${location.origin}`;
  if (url && url.search(/^http/) !== -1 && url.search(re) === -1) {
    proxy = true;
  }
  var request = new WebRequest(url, "get", "text", "", proxy);
  request({}, function (data) {
    WebTool.stringToBase64(data, callback, type);
  });
};

WebTool.stringToBase64 = function (blob, callback, type) {
  if (typeof blob === "string") {
    type = type || "text/plain";
    blob = new Blob([blob], {
      type: type,
    });
  }
  blob.type = "application/octet-stream";
  const fileReader = new FileReader();
  fileReader.onload = (e) => {
    // resolve(e.target.result);
    if (typeof callback === "function") {
      callback(e.target.result);
    }
  };
  // readAsDataURL
  fileReader.readAsDataURL(blob);
  fileReader.onerror = () => {
    console.error("blobToBase64 error");
    if (typeof callback === "function") {
      callback(null);
    }
  };
};

WebTool.stringToDataURL = function (str, type = "text/plain") {
  try {
    // 1. UTF-8 编码
    const encoder = new TextEncoder();
    const uint8 = encoder.encode(str);

    // 2. 转 base64
    let binary = "";
    for (let i = 0; i < uint8.length; i++) {
      binary += String.fromCharCode(uint8[i]);
    }
    const base64 = btoa(binary);

    // 3. 拼接 DataURL（关键：charset=utf-8）
    const dataURL = `data:${type};charset=utf-8;base64,${base64}`;

    return dataURL;
  } catch (err) {
    throw err;
  }
};

WebTool.parseDataUrl = function (dataUrl) {
  try {
    // 1. 提取 Base64 部分
    // DataURL 格式通常为: data:[<mediatype>][;base64],<data>
    const base64String = dataUrl.split(',')[1];
    if (!base64String) {
      throw new Error("无效的 DataURL 格式");
    }

    // 2. 将 Base64 字符串解码为二进制字符串
    const binaryString = atob(base64String);

    // 3. 将二进制字符串转为 Uint8Array
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // 4. 使用 TextDecoder 按 UTF-8 解码回文本
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(bytes);
  } catch (err) {
    console.error("解析 DataURL 失败:", err);
    throw err;
  }
};

WebTool.downloadString = function (blob, name, type) {
  if (window.parent !== window) {
    window.parent.postMessage({
      action: 'CROSS_DOMAIN_DOWNLOAD',
      blob: blob,
      name: name,
      mimeType: type || "text/plain",
    }, "*");
    return false;
  }
  if (typeof blob === "string") {
    type = type || "text/plain";
    blob = new Blob([blob], {
      type: type,
    });
  }
  var filename = name || "匿名文件"; //如123.xls
  var a = document.createElement("a");

  blob.type = "application/octet-stream";
  //创键临时url对象
  var url = URL.createObjectURL(blob);
  a.href = url;
  a.download = filename;
  a.click();
  // 关键改动：延迟 1-2 秒再释放 URL，确保浏览器已经开始下载流
  setTimeout(function () {
    window.URL.revokeObjectURL(url);
  }, 2000);
};

WebTool.getQueryParams = function (url) {
  url = url || window.location.search;
  let arr = url.split("?");
  if (arr.length < 2) {
    return {};
  }
  url = arr[arr.length - 1];
  const params = url
    .substring(0)
    .split("&")
    .reduce((acc, param) => {
      let [key, value] = param.split("=");
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});
  return params;
};

WebTool._urlQuery = function (url, key) {
  let ret = this.getQueryParams(url);
  if (key) {
    ret = ret[key];
  }
  return ret;
};

WebTool.extractContentInBrackets = function (str) {
  // 使用正则匹配：\( 表示左括号，([^)]*) 表示捕获非右括号的任意字符，\) 表示右括号
  const match = str.match(/\(([^)]*)\)/);

  // 如果匹配成功，match[1] 即为第一个分组（括号内）的内容
  return match ? match[1] : null;
};

// HTML 消毒：用于 v-html 渲染用户/Agent 可控内容前的 XSS 防护。
// 优先使用 DOMPurify，未加载时做 script 标签与事件属性的兜底移除。
WebTool.sanitizeHtml = function (html) {
  if (html == null) return "";
  const str = String(html);
  if (typeof window !== "undefined" && window.DOMPurify && typeof window.DOMPurify.sanitize === "function") {
    return window.DOMPurify.sanitize(str);
  }
  return str
    .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, "")
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
};

WebTool.getRandomInt = function (min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

WebTool.cookieQuery = function (cookie, name) {
  if (cookie.search(name + "=") === 0) {
    var value = cookie.split(name + "=")[1].split("; ")[0];
  } else if (cookie.search("; " + name + "=") !== -1) {
    var value = cookie.split("; " + name + "=")[1].split("; ")[0];
  } else {
    var value = null;
  }
  return value;
};

WebTool.pageHash = function (url) {
  var tArr = url.split("#");
  if (tArr.length > 1) {
    return tArr[1].split("?")[0];
  } else {
    return "";
  }
};

WebTool.loadScript = function (src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();

    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}
WebTool.loadFontAsBase64 = async function (url) {
  const res = await fetch(url);
  const blob = await res.blob();

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.readAsDataURL(blob);
  });
}

WebTool.mdToPdfAI = async function (mdString, fileName = "doc.pdf") {
  await WebTool.loadScript("https://cdn.jsdelivr.net/npm/markdown-it/dist/markdown-it.min.js");
  await WebTool.loadScript("https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js");

  const { jsPDF } = window.jspdf;

  // 1. 加载中文字体（关键）
  const fontBase64 = await WebTool.loadFontAsBase64(
    "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-400-normal.woff"
  );

  // 2. 注册字体到 jsPDF
  const pdf = new jsPDF("p", "mm", "a4");

  pdf.addFileToVFS("NotoSansSC.ttf", fontBase64);
  pdf.addFont("NotoSansSC.ttf", "NotoSansSC", "normal");
  pdf.setFont("NotoSansSC");

  // 3. Markdown 解析
  const md = window.markdownit({
    html: true,
    linkify: true,
    typographer: true,
  });

  const tokens = md.parse(mdString, {});

  // 4. 页面参数
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;

  const maxWidth = pageWidth - margin * 2;
  const lineHeight = 7;

  let x = margin;
  let y = margin;

  function newPageIfNeeded(extra = lineHeight) {
    if (y + extra > pageHeight - margin) {
      pdf.addPage();
      y = margin;
      pdf.setFont("NotoSansSC");
    }
  }

  function write(text, size = 12, bold = false) {
    pdf.setFontSize(size);
    pdf.setFont("NotoSansSC", bold ? "bold" : "normal");

    const lines = pdf.splitTextToSize(text, maxWidth);

    lines.forEach(line => {
      newPageIfNeeded();
      pdf.text(line, x, y);
      y += lineHeight;
    });
  }

  // 5. AST 渲染
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];

    if (t.type === "heading_open") {
      const level = parseInt(t.tag.replace("h", ""));
      const next = tokens[i + 1];

      write(next.content || "", level === 1 ? 18 : 14, true);
      y += 2;
    }

    if (t.type === "paragraph_open") {
      const next = tokens[i + 1];
      if (next.type === "inline") {
        write(next.content, 11);
      }
      y += 2;
    }

    if (t.type === "fence") {
      pdf.setFont("NotoSansSC");
      pdf.setFontSize(10);

      t.content.split("\n").forEach(line => {
        newPageIfNeeded();
        pdf.text(line, x, y);
        y += lineHeight;
      });

      y += 3;
    }
  }

  pdf.save(fileName);
}

WebTool.handleJsMindEvent = function (id, eventType) {
  let span = document.querySelector(`span[nodeid='${id}']`);
  jm.enable_edit();
  jm.update_node(id, span.outerHTML);
  jm.disable_edit();
};

WebTool.setFavicon = function (url) {
  let link =
    document.querySelector("link[rel*='icon']") ||
    document.createElement("link");
  link.type = "image/png";
  link.rel = "icon";
  link.href = url;
  document.getElementsByTagName("head")[0].appendChild(link);
};

WebTool.jsonToJsMind = function (jsonData, result, prefix, subfix) {
  let nodeId = "";
  // 定义根节点
  result = result || {
    label: "root",
    topic: `<span nodeType="root" nodeId='root'>${prefix || ""}root</span>`,
    id: "root",
    type: "root",
    children: [],
  };

  let topic = "";
  let temp = "";
  let tStr = "";

  // 如果数据是基本类型（字符串、数字、布尔值等），直接返回该值作为节点
  if (typeof jsonData !== "object" || jsonData === null) {
    nodeId = `node_${Math.random() * 1000}`;
    temp = jsonData + "";
    topic = `${prefix || ""
      }<span nodeType='value' contenteditable=true nodeId='${nodeId}'>${temp}</span>${subfix || ""
      }`;
    if (!prefix || this.isBase64(temp)) {
      if (this.isBase64(temp)) {
        tStr = temp.slice(temp.length - 8, temp.length);
        temp = `<span class='changeFileBtn'>(base64: ${tStr} ...)</span>`;
      }
      topic = `<span nodeType='value' nodeId='${nodeId}'>${temp}</span>`;
    }

    result.children = [
      {
        label: jsonData + "",
        topic: topic,
        dataType: typeof jsonData,
        type: "value",
        id: nodeId,
        children: [],
      },
    ];
  } else if (Array.isArray(jsonData)) {
    result.type = "array";
    result.topic = `<span nodeType="array" nodeId='${result.id}'>${prefix || ""
      }${result.label}</span>`;
    jsonData.forEach((item, index) => {
      nodeId = `node_${Math.random() * 1000}`;
      let rItem = {
        label: `NO.${index + 1}`,
        topic: `<span nodeType="array_item"  nodeId='${nodeId}'>${prefix || ""
          }NO.${index + 1}</span>`,
        key: index,
        type: "array_item",
        id: nodeId,
        children: [],
      };
      result.children.push(rItem);
      if (jsonData[index] && typeof jsonData[index] !== "object") {
        nodeId = `node_${Math.random() * 1000}`;
        temp = jsonData[index] + "";
        topic = `${prefix || ""
          }<span nodeType='value' nodeId='${nodeId}' contenteditable=true>${temp}</span>${subfix || ""
          }`;
        if (!prefix || this.isBase64(temp)) {
          if (this.isBase64(temp)) {
            tStr = temp.slice(temp.length - 8, temp.length);
            temp = `<span class='changeFileBtn'>(base64: ${tStr} ...)</span>`;
          }
          topic = `<span nodeType='value' nodeId='${nodeId}'>${temp}</span>`;
        }
        rItem.children = [
          {
            label: jsonData[index] + "",
            topic: topic,
            dataType: typeof jsonData[index],
            type: "value",
            id: nodeId,
            children: [],
          },
        ];
      } else {
        for (let k in jsonData[index]) {
          nodeId = `node_${Math.random() * 1000}`;
          let tChild = {
            label: k,
            topic: `<span nodeType="key" nodeId='${nodeId}'>${prefix || ""
              }${k}</span>`, // 将 key 名称作为 topic
            type: "key",
            id: nodeId,
            children: [],
          };
          // 将子节点加入当前节点的 children
          rItem.children.push(tChild);
          this.jsonToJsMind(jsonData[index][k], tChild, prefix, subfix);
        }
      }
    });
  }
  // 如果数据是对象
  else {
    for (let key in jsonData) {
      nodeId = `node_${Math.random() * 1000}`;
      let child = {
        label: key,
        topic: `<span nodeType="key" nodeId='${nodeId}'>${prefix || ""
          }${key}</span>`, // 将 key 名称作为 topic
        type: "key",
        id: nodeId,
        children: [],
      };
      // 将子节点加入当前节点的 children
      result.children.push(child);
      let tItem = jsonData[key];
      this.jsonToJsMind(tItem, child, prefix, subfix);
    }
  }
  return [result];
};

WebTool.reverseJsMind = function (jsMindData, result) {
  result = result || {};
  if (jsMindData.type === "value") {
    result = jsMindData.label;
  } else if (jsMindData.type === "array") {
    result = [];
    jsMindData.children = jsMindData.children || [];
    jsMindData.children.map((item) => {
      let d = this.reverseJsMind(item);
      result.push(d);
    });
  } else {
    jsMindData.children = jsMindData.children || [];
    for (let i = 0; i < jsMindData.children.length; i++) {
      child = jsMindData.children[i];
      if (child.type === "value") {
        result = child.label;
      } else {
        result[child.label] = this.reverseJsMind(child);
      }
    }
  }
  return result;
};

WebTool._reverseJsMind = function (jsMindData, result) {
  result = result || {};
  if (
    jsMindData.type === "root" ||
    jsMindData.type === "key" ||
    jsMindData.type === "array_item"
  ) {
    if (jsMindData.children && jsMindData.children.length !== 0) {
      jsMindData.children.map((child) => {
        if (child.type === "key") {
          if (
            child.children &&
            child.children[0] &&
            child.children[0].type === "value"
          ) {
            result[child.topic] = child.children[0].topic;
          } else {
            result[child.topic] = this.reverseJsMind(child);
          }
        } else if (
          child.children &&
          child.children.length !== 0 &&
          child.type === "array"
        ) {
          result[child.topic] = [];
          child.children.map((tItem) => {
            if (
              tItem.children &&
              tItem.children[0] &&
              tItem.children[0].type === "value"
            ) {
              result[child.topic].push(tItem.children[0].topic);
            } else {
              result[child.topic].push(this.reverseJsMind(tItem));
            }
          });
        } else if (child.type === "value") {
          result[jsMindData.topic] = child.topic;
        }
      });
    }
  } else if (jsMindData.type === "value") {
    return jsMindData.topic;
  }

  // 默认返回空对象，防止其他类型
  return result;
};

WebTool.attachParams = function (url, params) {
  if (typeof url !== "string") {
    return url;
  }
  let flag = 0;
  if (url.indexOf && url.indexOf("?") === -1) {
    flag = 0;
  } else {
    flag = 1;
  }
  for (var k in params) {
    var v = params[k];
    if (typeof v != "string") {
      v = JSON.stringify(v);
    }
    if (flag == 0) {
      url += "?" + k + "=" + encodeURIComponent(v);
      flag = 1;
    } else {
      url += "&" + k + "=" + encodeURIComponent(v);
    }
  }
  return url;
};

WebTool.objectToString = function (obj, flag, params) {
  const seen = new WeakSet();

  const serialize = (item) => {
    // 1. 基础类型处理
    if (item === null) return "null";
    if (item === undefined) return "undefined";
    const type = typeof item;

    if (type === "number" || type === "boolean") return String(item);

    // 2. 字符串处理
    if (type === "string") {
      let s = item;
      if (params) {
        if (typeof params === "boolean") {
          s = s.replace(/\\/g, "\\\\");
        } else if (typeof params === "object") {
          for (let k in params) {
            // 避免正则元字符干扰，简单处理建议用 split/join 或转义后的正则
            s = s.split(k).join(params[k]);
          }
        }
      }
      if (flag) s = escape(s);

      // 严格转义，防止 eval 解析失败
      return `"${s
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")}"`;
    }

    // 3. 函数处理 (核心优化部分)
    if (type === "function") {
      let fnStr = item.toString().trim();

      // 检测是否已经是标准匿名函数或箭头函数
      const isArrow = /^\(?[^)]*\)?\s*=>/.test(fnStr);
      const isStandardExpr = /^(async\s+)?function\s*\(/.test(fnStr);

      if (!isArrow && !isStandardExpr) {
        // 处理 Method Shorthand: name() {...} 或 async name() {...}
        // 处理 Generator: *name() {...} 或 async *name() {...}
        // 处理 Getter/Setter: get name() {...}
        fnStr = fnStr.replace(
          /^(?:(async)\s+)?(?:(get|set)\s+)?(\*)?\s*[a-zA-Z0-9_$]+\s*\(/,
          (match, asyncKey, getSet, isGen) => {
            const parts = [];
            if (asyncKey) parts.push("async");
            parts.push("function" + (isGen ? "*" : ""));
            // 如果是 get/set，通常序列化后丢失其特性，这里转为普通命名函数后缀以保逻辑
            return parts.join(" ") + "(";
          }
        );
      }

      // 如果函数是有名的 function name()，强制转为匿名 function()
      // 匹配 "function name (" 或 "function * name ("
      fnStr = fnStr.replace(
        /^(async\s+)?function(\*)?\s+[a-zA-Z0-9_$]+\s*\(/,
        "$1function$2("
      );

      return fnStr;
    }

    // 4. 对象与数组处理
    if (type === "object") {
      if (seen.has(item)) return '"[Circular]"';
      seen.add(item);

      if (Array.isArray(item)) {
        return "[" + item.map(serialize).join(",") + "]";
      }

      if (item instanceof Date) return `new Date(${item.getTime()})`;
      if (item instanceof RegExp) return item.toString();

      const entries = Object.keys(item).map((key) => {
        return `"${key}":${serialize(item[key])}`;
      });

      return "{" + entries.join(",") + "}";
    }

    return '""';
  };

  return serialize(obj);
};

WebTool._objectToString = function (obj, flag, params) {
  if (obj && obj.constructor.name === "Object") {
    var str = "{";
    for (var k in obj) {
      if (typeof obj[k] === "string") {
        let tStr = obj[k];
        if (params) {
          if (typeof params === "boolean") {
            tStr = tStr.replace(/\\/g, "\\\\");
          } else {
            for (let k in params) {
              const target = params[k];
              const regex = new RegExp(k, "g");
              tStr = tStr.replace(regex, target);
            }
          }
        }
        if (flag) {
          tStr = escape(tStr);
        }
        if (obj[k].search("'") !== -1) {
          str += '"' + k + '":`' + tStr + "`,";
        } else {
          str += '"' + k + '":`' + tStr + "`,";
        }
      } else {
        str += '"' + k + '":' + this.objectToString(obj[k], flag, params) + ",";
      }
    }
    if (str.length === 1) {
      str = "{}";
    } else {
      str = str.slice(0, str.length - 1) + "}";
    }
  } else if (obj && obj.constructor.name === "Array") {
    if (obj.length > 0) {
      var str = "[ " + this.objectToString(obj[0], flag, params);
      for (var i = 1; i < obj.length; i++) {
        str += "," + this.objectToString(obj[i], flag, params);
      }
      str += "]";
    } else {
      var str = "[]";
    }
  } else if (obj && obj.constructor.name === "Function") {
    var str = obj.toString();
  } else if (obj && typeof obj === "string") {
    if (params) {
      if (typeof params === "boolean") {
        obj = obj.replace(/\\/g, "\\\\");
      } else {
        for (let k in params) {
          const target = params[k];
          const regex = new RegExp(k, "g");
          obj = obj.replace(regex, target);
        }
      }
    }
    if (flag) {
      var str = "`" + escape(obj) + "`";
    } else {
      var str = "`" + obj.replace(/\"/g, '\\"') + "`";
    }
  } else if (typeof obj === "number" || typeof obj === "boolean") {
    var str = obj;
  } else {
    var str = '""';
  }
  return str;
};

WebTool.stringToObject = function (str, flag, params) {
  if (flag && typeof str === "string") {
    try {
      var temp = unescape(str);
      str = temp;
    } catch (e) {
      console.log(e);
    }
  }
  if (params && typeof str === "string") {
    if (typeof params === "boolean") {
      str = str.replace(/\\/g, "\\\\");
    } else {
      for (let k in params) {
        const target = params[k];
        const regex = new RegExp(k, "g");
        str = str.replace(regex, target);
      }
    }
  }
  // 安全解析：用 JSON.parse 替代 eval，避免任意代码执行；非 JSON 时原样返回字符串
  if (typeof str !== "string") {
    return str;
  }
  try {
    return JSON.parse(str);
  } catch (e) {
    console.warn("stringToObject: input is not valid JSON, returning raw string");
    return str;
  }
};

WebTool.copyString = function (val) {
  var input = document.createElement("textarea");
  input.value = val;
  input.readOnly = true;
  input.style.position = "fixed";
  input.style.left = "-999px";
  input.style.top = "10px";
  document.body.appendChild(input);
  input.select();
  input.setSelectionRange(0, input.value.length);
  document.execCommand("copy");
  document.body.removeChild(input);
};

WebTool.deepCopy = function (data, hash = new WeakMap()) {
  if (typeof data !== "object" || data === null) {
    throw new TypeError("传入参数不是对象");
  }
  // 判断传入的待拷贝对象的引用是否存在于hash中
  if (hash.has(data)) {
    return hash.get(data);
  }
  let newData = {};
  const dataKeys = Object.keys(data);
  dataKeys.forEach((value) => {
    const currentDataValue = data[value];
    // 基本数据类型的值和函数直接赋值拷贝
    if (typeof currentDataValue !== "object" || currentDataValue === null) {
      newData[value] = currentDataValue;
    } else if (Array.isArray(currentDataValue)) {
      // 实现数组的深拷贝
      newData[value] = [...currentDataValue];
    } else if (currentDataValue instanceof Set) {
      // 实现set数据的深拷贝
      newData[value] = new Set([...currentDataValue]);
    } else if (currentDataValue instanceof Map) {
      // 实现map数据的深拷贝
      newData[value] = new Map([...currentDataValue]);
    } else {
      // 将这个待拷贝对象的引用存于hash中
      hash.set(data, newData);
      // 普通对象则递归赋值
      newData[value] = WebTool.deepCopy(currentDataValue, hash);
    }
  });
  return newData;
};

WebTool.copyObject = function (obj, flag, params) {
  let result = obj;
  if (typeof obj !== "object" || obj === null) {
    if (typeof obj === "string" && flag) {
      obj = unescape(obj);
    }
    if (typeof obj === "string" && params) {
      if (params) {
        if (typeof params === "boolean") {
          obj = obj.replace(/\\/g, "\\\\");
        } else {
          for (let k in params) {
            const target = params[k];
            const regex = new RegExp(k, "g");
            obj = obj.replace(regex, target);
          }
        }
      }
    }
    result = obj;
  } else if (Array.isArray(obj)) {
    result = [];
    for (let i = 0; i < obj.length; i++) {
      result.push(this.copyObject(obj[i], flag, params));
    }
  } else {
    result = {};
    for (let k in obj) {
      result[k] = this.copyObject(obj[k], flag, params);
    }
  }

  return result;
};

WebTool._markdownToObject = function (md) {
  if (!md || typeof md !== 'string') return {};

  // 1. 兼容换行符并清理尾部残留括号
  let cleanMd = md.trim();
  if (cleanMd.endsWith(')')) {
    cleanMd = cleanMd.slice(0, -1).trim();
  }
  const lines = cleanMd.split(/\r?\n/);
  const result = {};

  // 栈结构：存放当前层级的容器对象
  const stack = [{ level: 0, key: null, obj: result }];

  let currentWriteTarget = null; // { parentObj, key }
  let currentBuffer = [];

  // ─── 工具：清洗缓冲区并写入 ──────────────────────────────────────────────
  const flushBuffer = () => {
    if (!currentWriteTarget) {
      currentBuffer = [];
      return;
    }

    const { parentObj, key } = currentWriteTarget;
    const trimmedLines = currentBuffer
      .map(l => l.replace(/\\`\\`\\`/g, '').trim())
      .filter(l => l !== '');

    currentBuffer = [];
    currentWriteTarget = null;

    if (trimmedLines.length === 0) return;

    // 检查是否全为列表项
    const isList = trimmedLines.every(l => l.startsWith('- '));

    if (isList) {
      const items = trimmedLines.map(l => {
        const raw = l.replace(/^-\s+/, '');
        const inline = tryParseInlineObject(raw);
        return inline !== null ? inline : raw;
      });
      parentObj[key] = items;
    } else {
      // 核心提纯：直接写入纯文本，绝不额外包裹任何 "Content" 字段
      parentObj[key] = trimmedLines.join('\n');
    }
  };

  // ─── 工具：严格解析内联对象 ──────────────────────────────────────────────
  const tryParseInlineObject = (raw) => {
    const segments = raw.split(/\s*,\s*/);
    const obj = {};
    const KEY_RE = /^([A-Za-z_\u4e00-\u9fa5][^\s:,]*)\s*:\s*(.+)$/;

    for (const seg of segments) {
      const m = seg.match(KEY_RE);
      if (!m) return null;
      obj[m[1].trim()] = m[2].trim();
    }
    return Object.keys(obj).length > 0 ? obj : null;
  };

  // ─── 逻辑 2: 逐行扫描 ────────────────────────────────────────────────────
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headerMatch = line.match(/^(#{1,6})\s+(.*)/);

    if (headerMatch) {
      flushBuffer(); // 刷入上一层内容

      const level = headerMatch[1].length;
      const key = headerMatch[2].trim();

      // 弹栈：回溯到正确的父层级
      while (stack.length > 1 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      const parentEntry = stack[stack.length - 1];
      let parentObj = parentEntry.obj;

      // 【核心改动】如果父容器此时还不是一个对象（说明原本是纯文本，现在由于有了子标题，需要升级为对象）
      if (parentEntry.key && typeof stack[stack.length - 2].obj[parentEntry.key] !== 'object') {
        const grandParent = stack[stack.length - 2].obj;
        const prevText = grandParent[parentEntry.key];

        // 升级为对象
        parentObj = {};
        grandParent[parentEntry.key] = parentObj;
        parentEntry.obj = parentObj; // 更新栈内引用

        // 仅在既有文本、又有子标题的极端冲突情况下，才使用 "Content" 容错
        if (typeof prevText === 'string' && prevText !== '') {
          parentObj.Content = prevText;
        }
      }

      // 预备当前 key 的写入目标
      currentWriteTarget = { parentObj, key };

      // 压栈：将当前 key 作为潜在的父容器压入栈中
      stack.push({ level, key, obj: parentObj[key] || {} });
    } else {
      currentBuffer.push(line);
    }
  }

  flushBuffer();

  // ─── 逻辑 3: 深度递归折叠 (Item 1, Item 2 -> Array) ─────────────────────
  const foldData = (data) => {
    if (!data || typeof data !== 'object') return data;
    if (Array.isArray(data)) return data.map(foldData);

    const keys = Object.keys(data);
    if (keys.length === 0) return '';

    const isArrayPattern = keys.every(k => /^[Ii]tem\s+\d+$/.test(k));

    if (isArrayPattern) {
      return keys
        .sort((a, b) => {
          const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
          const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
          return numA - numB;
        })
        .map(k => foldData(data[k]));
    }

    const out = {};
    for (const k of keys) {
      out[k] = foldData(data[k]);
    }
    return out;
  };

  return foldData(result);
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. Markdown 转换为 Object
// ─────────────────────────────────────────────────────────────────────────────
WebTool.markdownToObject = function (md) {
  if (md === undefined || md === null || typeof md !== 'string') return {};

  let cleanMd = md;
  if (cleanMd.endsWith(')')) {
    cleanMd = cleanMd.slice(0, -1);
  }

  const lines = cleanMd.split(/\r?\n/);
  const result = {};

  // 栈结构：存放当前层级的容器对象
  const stack = [{ level: 0, key: null, obj: result }];

  let currentWriteTarget = null; // { parentObj, key, targetObj }
  let currentBuffer = [];

  // ─── 工具：清洗缓冲区并写入 ──────────────────────────────────────────
  const flushBuffer = () => {
    if (!currentWriteTarget) {
      currentBuffer = [];
      return;
    }

    const { parentObj, key, targetObj } = currentWriteTarget;

    // 仅清除代码块标记，保留内容的原始换行和空格
    const processedLines = currentBuffer.map(l => l.replace(/\\`\\`\\`/g, ''));
    currentBuffer = [];
    currentWriteTarget = null;

    // 1. 如果缓冲区没有任何行（没有承接文本）
    if (processedLines.length === 0) {
      if (Object.keys(targetObj).length === 0) {
        parentObj[key] = '';
      }
      return;
    }

    // 检查是否全为列表项
    const effectiveLines = processedLines.filter(l => l.trim() !== '');
    const isList = effectiveLines.length > 0 && effectiveLines.every(l => {
      const trimmed = l.trim();
      return trimmed.startsWith('- ') || trimmed.startsWith('  ');
    });

    if (isList) {
      const items = [];
      let currentItemLines = [];

      processedLines.forEach(l => {
        const trimmed = l.trim();
        if (trimmed.startsWith('- ')) {
          if (currentItemLines.length > 0) {
            items.push(parseListItem(currentItemLines.join('\n')));
          }
          currentItemLines = [l.replace(/^\s*-\s+/, '')];
        } else if (trimmed !== '') {
          currentItemLines.push(l.replace(/^\s{2}/, ''));
        }
      });
      if (currentItemLines.length > 0) {
        items.push(parseListItem(currentItemLines.join('\n')));
      }

      parentObj[key] = items;
    } else {
      // 普通文本内容拼接
      let content = processedLines.join('\n');

      // 【核心修复】：忽略段落内容前后的所有纯换行符
      content = content.replace(/^\n+|\n+$/g, '');

      // 如果该节点已经是因压栈创建的对象，说明这段文本是它的直接 Content
      if (Object.keys(targetObj).length > 0 || typeof targetObj === 'object') {
        if (content !== '') {
          targetObj.Content = content;
        }
      } else {
        parentObj[key] = content;
      }
    }
  };

  const parseListItem = (raw) => {
    const inline = tryParseInlineObject(raw);
    return inline !== null ? inline : raw;
  };

  const tryParseInlineObject = (raw) => {
    if (!raw.includes(':')) return null;
    const segments = raw.split(/\s*,\s*/);
    const obj = {};
    const KEY_RE = /^([A-Za-z_\u4e00-\u9fa5][^\s:,]*)\s*:\s*(.*)$/;

    for (const seg of segments) {
      const m = seg.match(KEY_RE);
      if (!m) return null;
      obj[m[1].trim()] = m[2];
    }
    return Object.keys(obj).length > 0 ? obj : null;
  };

  // 逐行扫描
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headerMatch = line.match(/^(#{1,6})\s+(.*)/);

    if (headerMatch) {
      flushBuffer();

      const level = headerMatch[1].length;
      const key = headerMatch[2].trim();

      if (key === '') {
        currentBuffer.push(line);
        continue;
      }

      while (stack.length > 1 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      const parentEntry = stack[stack.length - 1];
      let parentObj = parentEntry.obj;

      if (parentEntry.key && typeof stack[stack.length - 2].obj[parentEntry.key] !== 'object') {
        const grandParent = stack[stack.length - 2].obj;
        const prevText = grandParent[parentEntry.key];

        parentObj = {};
        grandParent[parentEntry.key] = parentObj;
        parentEntry.obj = parentObj;

        if (typeof prevText === 'string' && prevText !== '') {
          parentObj.Content = prevText;
        }
      }

      parentObj[key] = parentObj[key] || {};
      currentWriteTarget = { parentObj, key, targetObj: parentObj[key] };

      stack.push({ level, key, obj: parentObj[key] });
    } else {
      currentBuffer.push(line);
    }
  }

  flushBuffer();

  // 深度递归折叠
  const foldData = (data) => {
    if (!data || typeof data !== 'object') return data;
    if (Array.isArray(data)) return data.map(foldData);

    const keys = Object.keys(data);
    if (keys.length === 0) return '';

    const isArrayPattern = keys.length > 0 && keys.every(k => /^[Ii]tem\s+\d+$/.test(k.trim()));

    if (isArrayPattern) {
      return keys
        .sort((a, b) => {
          const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
          const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
          return numA - numB;
        })
        .map(k => foldData(data[k]));
    }

    if (keys.length === 1 && keys[0] === 'Content') {
      return foldData(data['Content']);
    }

    const out = {};
    for (const k of keys) {
      const cleanKey = k.trim();
      const val = data[k];

      if (val && typeof val === 'object' && !Array.isArray(val)) {
        const subKeys = Object.keys(val);
        if (subKeys.length === 1 && subKeys[0] === 'Content') {
          out[cleanKey] = foldData(val['Content']);
          continue;
        }
      }

      out[cleanKey] = foldData(val);
    }
    return out;
  };

  return foldData(result);
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Object 转换为 Markdown（已采用 方案 A 修复）
// ─────────────────────────────────────────────────────────────────────────────
WebTool.objectToMarkdown = function (obj, level = 2) {
  if (obj === null || typeof obj !== 'object') {
    return obj !== undefined && obj !== null ? String(obj) : '';
  }

  const safeLevel = Math.min(Math.max(level, 1), 6);
  const headerPrefix = '#'.repeat(safeLevel);

  return Object.entries(obj)
    .map(([rawKey, value]) => {
      const key = String(rawKey).trim();

      if (key === '') return null;
      if (value === null || value === undefined) return null;

      const isContentKey = key === 'Content';

      // 【显式换行】：只要不是 Content 键，就在标题前强制加上换行符以撑开段落
      const header = isContentKey ? '' : `\n${headerPrefix} ${key}`;

      const nextLevel = isContentKey ? safeLevel : Math.min(safeLevel + 1, 6);

      // 2. 处理对象（非数组）
      if (typeof value === 'object' && !Array.isArray(value)) {
        const subContent = WebTool.objectToMarkdown(value, nextLevel);
        if (subContent === null || subContent === '') return isContentKey ? '' : header;

        return header ? `${header}\n${subContent}` : subContent;
      }

      // 3. 处理数组
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return isContentKey ? '' : header;
        }

        const hasObject = value.some(item => typeof item === 'object' && item !== null);

        if (hasObject) {
          // 【方案 A 核心修改点】：
          // 当数组元素是对象时，不再直接将其属性打平平铺，
          // 而是为其显式包裹一层 `### Item X` 的索引标题，引导其属性向后缩进一级。
          const arrayContent = value
            .map((item, index) => {
              const itemKey = `Item ${index + 1}`;
              const itemHeader = `\n${'#'.repeat(nextLevel)} ${itemKey}`;

              // 1. 如果元素本就是对象，正常将其内容提高一个标题级数传入 (nextLevel + 1)
              // 2. 如果混入了基本类型，将其包成对象：{ "Item X": item }
              const processedItem = (typeof item === 'object' && item !== null)
                ? item
                : { [`Item ${index + 1}`]: item };

              const subLevel = (typeof item === 'object' && item !== null)
                ? Math.min(nextLevel + 1, 6)
                : nextLevel;

              const subContent = WebTool.objectToMarkdown(processedItem, subLevel);
              return `${itemHeader}\n${subContent}`;
            })
            .filter(item => item !== null && item !== '')
            .join('\n');

          return header ? `${header}\n${arrayContent}` : arrayContent;
        } else {
          // 普通纯文本列表（保持原样，使用 Markdown `- ` 无序列表）
          const listItems = value
            .filter(item => item !== null && item !== undefined)
            .map(item => {
              const itemStr = String(item);
              return itemStr.includes('\n')
                ? `- ${itemStr.replace(/\n/g, '\n  ')}`
                : `- ${itemStr}`;
            })
            .join('\n');

          return header ? `${header}\n${listItems}` : listItems;
        }
      }

      // 4. 处理基本类型
      const strValue = String(value);
      return header ? `${header}\n${strValue}` : strValue;
    })
    .filter(item => item !== null)
    .join('\n');
};

WebTool.renderDSLToMarkdown = function (dsl) {
  if (!dsl || typeof dsl !== 'object') return '';

  let mdParts = [];

  // =====================
  // 1️⃣ meta 区块
  // =====================
  if (dsl.meta && Object.keys(dsl.meta).length) {
    let metaStr = '---\n';
    Object.entries(dsl.meta).forEach(([k, v]) => {
      metaStr += `${k}: ${v}\n`;
    });
    metaStr += '---\n';
    mdParts.push(metaStr);
  }

  // =====================
  // 2️⃣ blocks
  // =====================
  (dsl.blocks || []).forEach(block => {
    if (!block || !block.key) return;

    const { key, type = 'text', ...rest } = block;

    // 👉 构建 header
    let attrStr = '';

    Object.entries(rest).forEach(([k, v]) => {
      // 跳过内容字段
      if (['value', 'items', 'content'].includes(k)) return;
      if (v !== undefined && v !== null && v !== '') {
        attrStr += ` ${k}=${v}`;
      }
    });

    const header = `## ${key} [${type}${attrStr}]`;
    mdParts.push(header);

    // 👉 内容
    let content = '';

    switch (type) {
      case 'text':
        content = block.value || '';
        break;

      case 'list':
        content = (block.items || [])
          .map(item => `- ${item}`)
          .join('\n');
        break;

      case 'code':
        const lang = block.lang || '';
        const code = block.content || '';

        content =
          '```' + lang + '\n' +
          code.replace(/\n$/, '') + '\n' +
          '```';
        break;

      default:
        // 🔥 关键：未知类型 fallback
        if (block.content) {
          content = block.content;
        } else if (block.value) {
          content = block.value;
        } else {
          content = JSON.stringify(block, null, 2);
        }
    }

    mdParts.push(content);
  });

  // =====================
  // 3️⃣ 拼接（严格控制空行）
  // =====================
  return mdParts
    .map(part => part.trim())
    .filter(Boolean)
    .join('\n\n');
};

WebTool.parseMarkdownToDSL = function (mdString) {
  const result = {
    meta: {},
    blocks: []
  };

  const container = document.createElement('div');
  const converter = new showdown.Converter();
  container.innerHTML = converter.makeHtml(mdString);

  const headers = container.querySelectorAll('h1,h2,h3,h4,h5,h6');

  headers.forEach(header => {
    const raw = header.textContent.trim();

    // 👉 解析 key + type
    const match = raw.match(/^(.+?)\s*\[(.+?)\]$/);

    let key = raw;
    let type = 'text';
    let attrs = {};

    if (match) {
      key = match[1].trim();

      const typePart = match[2];
      const parts = typePart.split(' ');

      type = parts[0];

      parts.slice(1).forEach(p => {
        const [k, v] = p.split('=');
        attrs[k] = v;
      });
    }

    // 👉 收集内容
    let next = header.nextElementSibling;
    let nodes = [];

    while (next && !next.tagName.match(/^H[1-6]$/)) {
      nodes.push(next);
      next = next.nextElementSibling;
    }

    // 👉 构建 block
    let block = { type, key };

    if (type === 'list') {
      block.items = [];
      nodes.forEach(n => {
        n.querySelectorAll('li').forEach(li => {
          block.items.push(li.textContent.trim());
        });
      });
    }

    else if (type === 'code') {
      block.lang = attrs.lang || '';
      block.content = nodes.map(n => n.textContent).join('\n').trim();
    }

    else {
      block.value = nodes.map(n => n.textContent.trim()).join('\n');
    }

    result.blocks.push(block);
  });

  return result;
};

WebTool.updateMarkdownBlock = function (mdString, key, updater) {
  if (!mdString || !key) return mdString;

  if (typeof updater === "string") {
    updater = {
      value: updater
    };
  }

  // 1️⃣ 解析成 DSL
  const dsl = WebTool.parseMarkdownToDSL(mdString);

  if (!dsl || !Array.isArray(dsl.blocks)) return mdString;

  // 2️⃣ 找到目标 block
  const index = dsl.blocks.findIndex(b => b.key === key);

  if (index === -1) {
    console.warn(`Block "${key}" not found`);
    return mdString;
  }

  const oldBlock = dsl.blocks[index];

  // 3️⃣ 更新 block（支持函数式更新）
  let newBlock;

  if (typeof updater === 'function') {
    newBlock = updater({ ...oldBlock });
  } else if (typeof updater === 'object') {
    newBlock = { ...oldBlock, ...updater };
  } else {
    console.warn('Invalid updater');
    return mdString;
  }

  // 👉 防御：必须保留 key
  newBlock.key = key;

  // 👉 防御：必须有 type
  if (!newBlock.type) {
    newBlock.type = oldBlock.type || 'text';
  }

  // 4️⃣ 替换 block
  dsl.blocks[index] = newBlock;

  // 5️⃣ 渲染回 Markdown
  return WebTool.renderDSLToMarkdown(dsl);
};

WebTool.getMarkdownBlock = function (mdString, key, options = {}) {
  if (!mdString) return null;

  const { format = 'auto' } = options;
  // format: auto | raw | text | block

  const dsl = WebTool.parseMarkdownToDSL(mdString);

  if (!dsl || !Array.isArray(dsl.blocks)) return null;

  if (!key) {
    return dsl;
  }

  const block = dsl.blocks.find(b => b.key === key);

  if (!block) return null;

  // =====================
  // 返回不同格式
  // =====================

  // 👉 1️⃣ 返回原始 block（最强）
  if (format === 'block') {
    return block;
  }

  // 👉 2️⃣ 返回 markdown 片段（可直接插回）
  if (format === 'raw') {
    return WebTool.renderDSLToMarkdown({
      meta: null,
      blocks: [block]
    });
  }

  // 👉 3️⃣ 返回纯内容
  if (format === 'text') {
    switch (block.type) {
      case 'text':
        return block.value || '';

      case 'list':
        return (block.items || []).join('\n');

      case 'code':
        return block.content || '';

      default:
        return block.value || block.content || '';
    }
  }

  // 👉 4️⃣ 默认智能返回（推荐）
  if (format === 'auto') {
    if (block.type === 'text') return block.value;
    if (block.type === 'list') return block.items;
    if (block.type === 'code') return block.content;
    return block;
  }

  return block;
};

WebTool.compressAndResizeBase64 = function (
  input, // 支持 Base64 字符串、远程 URL 或 File/Blob 对象
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.7
) {
  return new Promise((resolve) => {
    const img = new Image();
    // 跨域防护（如果涉及远程图片绘制到 Canvas）
    img.crossOrigin = "Anonymous";

    const callback = function () {
      let { width, height } = img;

      // 按比例缩放到最大宽高范围内
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      // 1. 判断是否包含透明度
      const isTransparent = checkHasAlpha(ctx, img, width, height);

      // 2. 根据透明度选择图片格式：
      // - 有透明通道：优先导出为 image/webp (支持压缩且支持透明)，不支持则退化为 image/png
      // - 无透明通道：按原逻辑导出为 image/jpeg
      let mimeType = "image/jpeg";
      if (isTransparent) {
        // 部分浏览器（如 Chrome/Edge）支持 webp 压缩且保留透明度
        mimeType = "image/webp";
      }

      ctx.drawImage(img, 0, 0, width, height);

      // 生成压缩后的 base64
      let newBase64 = canvas.toDataURL(mimeType, quality);

      // 兜底：如果浏览器不支持 webp 导出而退化成了 png，quality 参数会失效
      // 但保证了透明通道不会丢失

      // 释放 ObjectURL 内存
      if (img.src.startsWith("blob:")) {
        URL.revokeObjectURL(img.src);
      }

      resolve(newBase64);
    };

    // 检测 Image 是否包含 Alpha 透明通道
    function checkHasAlpha(ctx, img, width, height) {
      // 预先绘制到临时 Canvas 进行像素检测
      ctx.drawImage(img, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height).data;

      // 遍历 Alpha 通道 (每 4 个值中的第 4 个: index 3, 7, 11...)
      for (let i = 3; i < imageData.length; i += 4) {
        if (imageData[i] < 255) {
          ctx.clearRect(0, 0, width, height); // 检测完清空画布准备重新绘制
          return true; // 发现透明像素
        }
      }
      ctx.clearRect(0, 0, width, height);
      return false;
    }

    img.onload = callback;
    img.onerror = () => resolve(input); // 失败时返回原值

    // --- 分情况处理输入源 ---
    if (input instanceof File || input instanceof Blob) {
      img.src = URL.createObjectURL(input);
    } else if (typeof input === "string" && input.startsWith("data:image")) {
      img.src = input;
    } else if (typeof input === "string") {
      let url = "/user/imageToBase64?url=" + encodeURIComponent(input);
      let request = new WebRequest(url, "get", "json", "", false);
      request({}, function (tData) {
        if (tData && tData.data) {
          img.src = tData.data;
        } else {
          resolve(input);
        }
      });
    } else {
      resolve(input);
    }
  });
};

WebTool.bind = function (node, type, listener, flag) {
  if (node.attachEvent) {
    node.attachEvent("on" + type, listener);
  } else if (node.addEventListener) {
    node.addEventListener(type, listener, flag);
  } else {
  }
};

WebTool.transMarkdown = function (str, option) {
  option = option || {
    parseImgDimensions: true,
    tables: true,
    smoothLivePreview: true,
    tablesHeaderId: true,
    ghCodeBlocks: true,
    tasklists: true,
  };
  if (showdown) {
    let converter = new showdown.Converter(option);
    str = converter.makeHtml(str);
  }
  return str;
};

WebTool.showMask = function (text, time) {
  let mask = document.querySelector(".__export-mask");
  if (!mask) {
    mask = document.createElement("div");
    mask.className = "__export-mask";
    mask.style.cssText = `
        position:fixed;inset:0;
        background:rgba(0,0,0,.35);
        z-index:2147483646;
        display:flex;align-items:center;justify-content:center;
      `;
    mask.innerHTML = `
        <div style="
          background:#111;
          color:#fff;
          padding:18px 22px;
          border-radius:12px;
          font-size:14px;
        ">${text || "正在生成图片…"}</div>
      `;
    document.body.appendChild(mask);
  } else {
    mask.querySelector("div").textContent = text || "正在生成图片…";
    mask.style.display = "flex";
  }
  if (time) {
    setTimeout(() => {
      mask.style.display = "none";
    }, time);
  }
}

WebTool.transformImage = function (
  elem,
  name,
  type = "png",
  options = {},
  callback
) {
  /* =================================================
   * 环境 & 参数
   * ================================================= */

  const ua = navigator.userAgent || "";
  const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
  const isWeChat = /MicroMessenger/i.test(ua);
  const filename = name || `export.${type}`;

  // 👇 新增：资源模式 / zip 模式
  const isZipMode = options && options.zip === true;

  /* =================================================
   * UI 工具（zip 模式下静默）
   * ================================================= */

  let _self = this;

  function showMask(text, time) {
    if (isZipMode) return;
    _self.showMask(text, time);
  }

  function hideMask() {
    if (isZipMode) return;
    const mask = document.querySelector(".__export-mask");
    if (mask) mask.style.display = "none";
  }

  function showFailToast(msg) {
    if (isZipMode) return;

    const t = document.createElement("div");
    t.style.cssText = `
      position:fixed;
      bottom:24px;
      left:50%;
      transform:translateX(-50%);
      background:rgba(0,0,0,.8);
      color:#fff;
      padding:10px 16px;
      border-radius:10px;
      font-size:13px;
      z-index:2147483647;
    `;
    t.textContent = msg || "图片生成失败，请重试";
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2600);
  }

  /* =================================================
   * dataURL → Blob
   * ================================================= */

  function dataURLToBlob(dataUrl) {
    const [meta, base64] = dataUrl.split(",");
    const mime = meta.match(/:(.*?);/)[1];
    const binary = atob(base64);
    const len = binary.length;
    const buf = new Uint8Array(len);
    for (let i = 0; i < len; i++) buf[i] = binary.charCodeAt(i);
    return new Blob([buf], { type: mime });
  }

  /* =================================================
   * 下载（仅普通模式）
   * ================================================= */

  function downloadImageNow(dataUrl) {
    // 微信：提示，不自动下载
    if (isWeChat) {
      showFailToast("微信中请长按图片保存到相册");
      return;
    }

    const blob = dataURLToBlob(dataUrl);
    WebTool.downloadString(blob, filename);

  }

  /* =================================================
   * 移动端预览（仅普通模式）
   * ================================================= */

  function openImagePreview(dataUrl) {
    let overlay = document.querySelector(".__export-preview");
    if (overlay) overlay.remove();

    overlay = document.createElement("div");
    overlay.className = "__export-preview";
    overlay.style.cssText = `
      position:fixed;
      inset:0;
      background:#000;
      z-index:2147483647;
      display:flex;
      flex-direction:column;
    `;

    overlay.innerHTML = `
      <div style="
        height:48px;
        display:flex;
        align-items:center;
        padding:0 12px;
        color:#fff;
        background:rgba(0,0,0,.9);
      ">
        <button class="__preview-back" style="
          background:none;
          border:none;
          color:#fff;
          font-size:16px;
          padding:6px 10px;
        ">返回</button>
        <div style="flex:1;text-align:center;font-size:14px;opacity:.85;">
          图片预览
        </div>
        <div style="width:48px;"></div>
      </div>

      <div style="
        flex:1;
        display:flex;
        align-items:center;
        justify-content:center;
        overflow:auto;
        padding:12px;
      ">
        <img src="${dataUrl}" style="
          max-width:100%;
          max-height:100%;
          background:#fff;
          box-shadow:0 6px 24px rgba(0,0,0,.35);
        "/>
      </div>

      <div style="
        padding:12px;
        display:flex;
        justify-content:center;
        background:rgba(0,0,0,.95);
      ">
        <button class="__preview-download" style="
          padding:10px 22px;
          border-radius:20px;
          font-size:14px;
          background:#07c160;
          color:#fff;
          border:none;
        ">下载图片</button>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector(".__preview-back").onclick = () => {
      overlay.remove();
    };

    overlay.querySelector(".__preview-download").onclick = () => {
      downloadImageNow(dataUrl);
    };
  }

  /* =================================================
   * 主流程
   * ================================================= */

  showMask("正在生成图片…");

  const task = () => WebTool._transformEngine(elem, type, options);

  return WebTool._exportQueue(task)
    .then((out) => {
      hideMask();

      const dataUrl = out && out.src ? out.src : out;

      // ===== zip / 资源模式：只返回结果 =====
      if (isZipMode) {
        return {
          blob: dataURLToBlob(dataUrl),
          filename,
        };
      }

      // ===== 原有行为 =====
      if (isMobile) {
        openImagePreview(dataUrl);
      } else {
        downloadImageNow(dataUrl);
        if (typeof callback === "function") callback(out);
      }

      return out;
    })
    .catch((e) => {
      hideMask();
      showFailToast(e?.message || String(e));
      throw e;
    });
};

WebTool.createExportSession = function (options = {}) {
  if (typeof JSZip !== "function") {
    throw new Error("JSZip 未加载");
  }

  const zip = new JSZip();
  const files = [];
  const meta = {
    createdAt: Date.now(),
    source: options.source || location.href || "unknown",
    fileList: [],
  };

  return {
    addFile(name, blob) {
      meta.fileList.push(name);
      files.push({ name, blob });
    },

    addJSON(name, json) {
      files.push({
        name,
        blob: new Blob([JSON.stringify(json, null, 2)], {
          type: "application/json",
        }),
      });
    },

    async finalize(zipName = "export.zip") {
      files.forEach((item) => {
        zip.file(item.name, item.blob);
      });

      // 可选：统一元信息
      zip.file("manifest.json", JSON.stringify(meta, null, 2));

      const zipBlob = await zip.generateAsync({ type: "blob" });

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = zipName;
      a.click();

      setTimeout(() => URL.revokeObjectURL(url), 1000);

      return zipBlob;
    },
  };
};

WebTool.exportZipFromElements = async function (elements, options = {}) {
  if (!Array.isArray(elements) || elements.length === 0) {
    throw new Error("exportZipFromElements: elements 不能为空");
  }

  const zipName = options.zipName || "export.zip";
  const type = options.type || "png";
  const folderName = options.folder || "";
  const onProgress =
    typeof options.onProgress === "function" ? options.onProgress : null;

  if (typeof JSZip !== "function") {
    throw new Error("JSZip 未加载，请先引入 JSZip");
  }

  const zip = new JSZip();
  const folder = folderName ? zip.folder(folderName) : zip;

  for (let i = 0; i < elements.length; i++) {
    const item = elements[i];
    if (!item) continue;

    let el = item.el;
    const filename = item.name || `image-${i + 1}.${type}`;

    // selector → element
    if (typeof el === "string") {
      el = document.querySelector(el);
    }
    if (!el) continue;

    // 🔥 关键：走 transformImage 的 zip 模式
    const result = await WebTool.transformImage(el, filename, type, {
      zip: true,
    });

    if (result && result.blob) {
      folder.file(filename, result.blob);
    }

    if (onProgress) {
      onProgress(i + 1, elements.length);
    }

    // 给浏览器喘息时间（canvas / 内存）
    await new Promise((r) => requestAnimationFrame(r));
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });

  // 原生下载
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = zipName;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 1000);

  return zipBlob;
};

WebTool._exportQueue = (() => {
  let chain = Promise.resolve();

  return function enqueue(task) {
    const next = chain.then(() => task());
    chain = next.catch(() => { }); // 不阻断队列
    return next;
  };
})();

/* ============================
 * ExportShield Manager
 * ============================ */
WebTool.createExportShield = function () {
  const cleanups = [];
  let active = false;

  function addCleanup(fn) {
    if (typeof fn === "function") cleanups.push(fn);
  }

  function addStyleShield(id, cssText) {
    const style = document.createElement("style");
    style.setAttribute("data-export-shield", id);
    style.textContent = cssText;
    document.head.appendChild(style);
    addCleanup(() => {
      try {
        style.remove();
      } catch { }
    });
  }

  function addClassShield(target, className) {
    if (!target) return;
    target.classList.add(className);
    addCleanup(() => {
      try {
        target.classList.remove(className);
      } catch { }
    });
  }

  function addInlineShield(el, props) {
    if (!el || !props) return;
    const prev = {};
    Object.keys(props).forEach((k) => {
      prev[k] = el.style[k];
      el.style[k] = props[k];
    });
    addCleanup(() => {
      Object.keys(props).forEach((k) => {
        el.style[k] = prev[k] || "";
      });
    });
  }

  return {
    activate(elem, opts = {}) {
      if (active) return;
      active = true;

      const exportClass = opts.exportClass || "__exporting__";

      // 1️⃣ 导出态 class
      addClassShield(document.documentElement, exportClass);
      addClassShield(document.body, exportClass);
      if (elem) addClassShield(elem, exportClass);

      // 2️⃣ body / html scale 覆盖（不改原值）
      addStyleShield(
        "body-scale",
        `
        html, body {
          transform: none !important;
          transform-origin: 0 0 !important;
        }
      `
      );

      // 3️⃣ 冻结动画
      addStyleShield(
        "freeze-animation",
        `
        .${exportClass} *,
        .${exportClass} *::before,
        .${exportClass} *::after {
          animation: none !important;
          transition: none !important;
          caret-color: transparent !important;
        }
      `
      );

      // 4️⃣ 锁滚动
      addInlineShield(document.documentElement, { overflow: "hidden" });
      addInlineShield(document.body, { overflow: "hidden" });
    },

    cleanup() {
      while (cleanups.length) {
        try {
          cleanups.pop()();
        } catch { }
      }
      active = false;
    },
  };
};

/* ============================
 * _transformEngine
 * ============================ */
WebTool._transformEngine = async function (elem, type = "png", options = {}) {
  if (typeof elem === "string") elem = document.querySelector(elem);
  if (!elem) throw new Error("_transformEngine: element not found");
  if (typeof window.snapdom !== "function")
    throw new Error("_transformEngine: snapdom not found");

  const ua = navigator.userAgent || "";
  const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);

  const typeMap = { png: "toPng", jpg: "toJpg", jpeg: "toJpg", webp: "toWebp" };
  const exportFn = typeMap[String(type).toLowerCase()];
  if (!exportFn) throw new Error("_transformEngine: unsupported type");

  const raf = () => new Promise((r) => requestAnimationFrame(r));
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ===== ExportShield ===== */
  const shield = WebTool.createExportShield();
  shield.activate(elem);

  /* ===== 禁用祖先 transform（仅内容容器）===== */
  const ancestorRecords = [];
  let cur = elem;
  while (cur && cur.nodeType === 1) {
    const cs = getComputedStyle(cur);
    if (cs.transform && cs.transform !== "none") {
      ancestorRecords.push({
        el: cur,
        t: cur.style.transform,
        w: cur.style.willChange,
      });
      cur.style.transform = "none";
      cur.style.willChange = "auto";
    }
    cur = cur.parentElement;
  }

  const restoreAncestors = () => {
    ancestorRecords.forEach((r) => {
      r.el.style.transform = r.t || "";
      r.el.style.willChange = r.w || "";
    });
  };

  /* ===== canvas → img ===== */
  function replaceCanvas(root) {
    const records = [];
    root.querySelectorAll("canvas").forEach((cv) => {
      try {
        const dataURL = cv.toDataURL("image/png");
        const img = new Image();
        img.src = dataURL;
        img.style.cssText = cv.style.cssText;
        records.push({ cv, img, parent: cv.parentNode, next: cv.nextSibling });
        cv.parentNode.replaceChild(img, cv);
      } catch { }
    });
    return records;
  }
  const restoreCanvas = (rs) =>
    rs.forEach((r) => r.parent.insertBefore(r.cv, r.next));

  /* ===== iframe → img ===== */
  async function replaceIframe(root) {
    const records = [];
    for (const iframe of root.querySelectorAll("iframe")) {
      const parent = iframe.parentNode;
      try {
        const doc = iframe.contentDocument;
        await Promise.race([
          new Promise((r) => (iframe.onload = r)),
          delay(2000),
        ]);
        const snap = await snapdom(doc.body, { scale: 1 });
        const res = await snap.toPng();
        const img = new Image();
        img.src = res.src;
        img.style.cssText = iframe.style.cssText;
        parent.replaceChild(img, iframe);
        records.push({ iframe, img, parent });
      } catch {
        const ph = document.createElement("div");
        ph.textContent = "iframe 无法导出";
        ph.style.cssText = `background:#eee;color:#666;display:flex;align-items:center;justify-content:center;`;
        parent.replaceChild(ph, iframe);
        records.push({ iframe, img: ph, parent });
      }
    }
    return records;
  }
  const restoreIframe = (rs) =>
    rs.forEach((r) => r.parent.replaceChild(r.iframe, r.img));

  /* ===== 清晰度计算（scale × dpr）===== */
  const rect = elem.getBoundingClientRect();
  const baseW = Math.ceil(rect.width);
  const baseH = Math.ceil(rect.height);

  const MAX_PIXELS = isMobile ? 4_500_000 : 16_000_000;
  let dpr = Math.min(window.devicePixelRatio || 1, isIOS ? 2 : 2.5);
  let scale = isMobile ? 1.15 : 2;

  while (baseW * baseH * scale * scale * dpr * dpr > MAX_PIXELS) {
    if (dpr > 1) dpr -= 0.25;
    else scale -= 0.05;
  }

  const config = {
    backgroundColor: "transparent",
    useComputedStyle: true,
    useCORS: true,
    allowTaint: false,
    width: baseW,
    height: baseH,
    outerTransforms: false,
    scale,
    dpr,
    quality: isMobile ? 0.9 : 0.92,
  };

  let canvasRecords = [];
  let iframeRecords = [];

  try {
    iframeRecords = await replaceIframe(elem);
    canvasRecords = replaceCanvas(elem);

    elem.offsetHeight;
    await raf();
    await raf();

    if (document.fonts?.ready)
      await Promise.race([document.fonts.ready, delay(1500)]);

    const capture = await snapdom(elem, config);
    const out = await capture[exportFn]({
      quality: config.quality,
      backgroundColor: config.backgroundColor,
    });

    await delay(isMobile ? 120 : 60);
    await raf();

    return out;
  } finally {
    restoreIframe(iframeRecords);
    restoreCanvas(canvasRecords);
    restoreAncestors();
    shield.cleanup();
  }
};

WebTool.toBase64 = function (str) {
  return btoa(unescape(encodeURIComponent(str)));
};

WebTool.isBase64 = function (dataUrl) {
  dataUrl = dataUrl || "";
  const match = dataUrl.match(/^data:([^;]+);base64,(.*)$/);
  return match;
};

WebTool.fromBase64 = function (base64) {
  // 将 Base64 转为 UTF-8 编码，再转回中文字符串
  return this.isBase64(base64)
    ? decodeURIComponent(escape(atob(base64)))
    : base64;
};

WebTool.base64ToUtf8 = function (input) {
  if (typeof input !== "string") return "";

  let str = input.trim();

  // DataURL
  if (str.startsWith("data:")) {
    const idx = str.indexOf(",");
    if (idx !== -1) str = str.slice(idx + 1);
  }

  // URL Decode
  try {
    str = decodeURIComponent(str);
  } catch (_) { }

  // Base64URL -> Base64
  str = str
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .replace(/\s+/g, "");

  // 判断是否像 Base64，不是则直接返回原值
  if (
    str.length % 4 === 1 ||
    !/^[A-Za-z0-9+/]*={0,2}$/.test(str)
  ) {
    return input;
  }

  while (str.length % 4 !== 0) {
    str += "=";
  }

  try {
    const binary = atob(str);
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch (e) {
    console.error("Base64 解码失败：", e, input);
    return input;
  }
};

WebTool._base64ToUtf8 = function (b64) {
  if (!b64 || typeof b64 !== 'string') return '';

  try {
    // 1. 兼容 URL 安全的 Base64 字符
    let normalizedB64 = b64.replace(/-/g, '+').replace(/_/g, '/');

    // 2. 自动补齐 Base64 末尾缺失的 '=' 占位符
    const pad = normalizedB64.length % 4;
    if (pad === 2) normalizedB64 += '==';
    else if (pad === 3) normalizedB64 += '=';

    // 3. 浏览器原生解码为二进制字符串
    const bin = atob(normalizedB64);

    // 4. 转换为 Uint8Array（用 for 循环替代 from 以提升大文件性能）
    const len = bin.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = bin.charCodeAt(i);
    }

    // 5. 完美的 UTF-8 解码，原生支持中文、Emoji 及特殊字符
    return new TextDecoder('utf-8').decode(bytes);
  } catch (error) {
    console.error('Base64 解码失败:', error);
    return ''; // 或者根据业务需求 throw error
  }
};

WebTool.srcToDataUrl = function (imageUrl, callback) {
  if (imageUrl) {
    // 创建一个图片元素
    var image = new Image();
    image.crossOrigin = "anonymous";
    // 设置图片的源
    image.src = imageUrl + "?v=" + Math.random();

    // 当图片加载完成时
    image.onload = function () {
      // 创建一个Canvas元素
      var canvas = document.createElement("canvas");
      var context = canvas.getContext("2d");

      // 设置Canvas的大小为图片的大小
      canvas.width = image.width;
      canvas.height = image.height;

      // 在Canvas上绘制图片
      context.drawImage(image, 0, 0);

      // 获取 Data URL
      var dataUrl = canvas.toDataURL("image/png"); // 可以根据需要调整图片格式
      if (typeof callback === "function") {
        callback(dataUrl);
      }
    };
  }
};

WebTool.fullscreenDisplay = function (fullscreenElement) {
  // 为元素添加点击事件，点击时进入全屏模式
  if (fullscreenElement.requestFullscreen) {
    fullscreenElement.requestFullscreen();
  } else if (fullscreenElement.mozRequestFullScreen) {
    // Firefox
    fullscreenElement.mozRequestFullScreen();
  } else if (fullscreenElement.webkitRequestFullscreen) {
    // Chrome, Safari and Opera
    fullscreenElement.webkitRequestFullscreen();
  } else if (fullscreenElement.msRequestFullscreen) {
    // IE/Edge
    fullscreenElement.msRequestFullscreen();
  }
};

WebTool.exitFullscreen = function () {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    // Firefox
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    // Chrome, Safari and Opera
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    // IE/Edge
    document.msExitFullscreen();
  }
};

WebTool.setElemScale = function (elem) {
  if (!elem || !elem.parentNode) {
    return false;
  }

  // 获取父容器高度与元素内容高度
  const parentHeight = elem.parentNode.clientHeight;
  const scrollHeight = elem.scrollHeight;

  let ratio = parentHeight / scrollHeight;
  ratio = Math.min(Number(ratio), 1);

  // 设置 transform 缩放
  elem.style.transform = `scale(${ratio})`;
  elem.style.transformOrigin = "0 0";
  elem.style.width = `${100 / ratio}%`;
  elem.style.height = `${100 / ratio}%`;

  // 隐藏超出部分
  elem.parentNode.style.overflow = "hidden";

  return ratio;
};

WebTool.searchArray = function (arr, k, v) {
  if (!arr || arr.constructor.name !== "Array") {
    return -1;
  }
  var ret = -1;
  for (var i = 0; i < arr.length; i++) {
    if (arr[i][k] === v) {
      ret = i;
      break;
    }
  }
  return ret;
};

WebTool.cookie = function () {
  if (arguments.length === 0) {
    return document.cookie;
  } else if (arguments.length === 1) {
    var name = arguments[0];
    var cookie = document.cookie;
    value = WebTool.cookieQuery(cookie, name);
    return value;
  } else if (arguments.length === 2) {
    var name = arguments[0];
    var value = arguments[1];
    document.cookie = name + "=" + value;
  } else if (arguments.length === 3) {
    var name = arguments[0];
    var value = arguments[1];
    var expires = arguments[2];
    var tData = new Date();
    tData.setDate(tData.getDate() + expires);
    document.cookie = name + "=" + value + ";expires=" + tData + ";path=/;";
  } else if (arguments.length === 4) {
    var name = arguments[0];
    var value = arguments[1];
    var expires = arguments[2];
    var domain = arguments[3];
    var tData = new Date();
    tData.setDate(tData.getDate() + expires);
    document.cookie =
      name +
      "=" +
      value +
      ";expires=" +
      tData +
      ";path=/;" +
      "domain=" +
      domain;
  } else {
  }
};

WebTool.removeRecord = function (key, n, kName) {
  if (kName) {
    n = this.searchRecord(key, n, kName);
  }
  var data = this.getItem(key);
  if (!data) {
    data = [];
    this.setItem(key, data);
  }
  data.splice(n, 1);
  this.setItem(key, data);
  return data;
};

WebTool.searchRecord = function (key, item, kName) {
  var data = this.getItem(key);
  if (!data) {
    data = [];
    this.setItem(key, data);
  }
  var ret = -1;
  for (var i = 0; i < data.length; i++) {
    if (data[i][kName] === item[kName]) {
      ret = i;
      break;
    }
  }
  return ret;
};

WebTool.addRecord = function (key, item, kName) {
  var data = this.getItem(key);
  if (!data) {
    data = [];
    this.setItem(key, data);
  }
  kName = kName || "$$$";
  var t = this.searchRecord(key, item, kName);
  if (t === -1) {
    data.push(item);
  } else {
    data[t] = item;
  }
  this.setItem(key, data);
  return data;
};
WebTool.setItem = function (key, d) {
  localStorage.setItem(key, JSON.stringify(d));
  return d;
};
WebTool.getItem = function (key) {
  return JSON.parse(localStorage.getItem(key));
};

WebTool.readXPath = function (element, root) {
  root = root || document.body;
  if (element.id !== "") {
    //判断id属性，如果这个元素有id，则显 示//*[@id="xPath"]  形式内容
    return '//*[@id="' + element.id + '"]';
  }
  //这里需要需要主要字符串转译问题，可参考js 动态生成html时字符串和变量转译（注意引号的作用）
  if (element == root) {
    //递归到body处，结束递归
    return element.tagName.toLowerCase();
  }
  var ix = 1, //在nodelist中的位置，且每次点击初始化
    siblings = element.parentNode.childNodes; //同级的子元素

  for (var i = 0, l = siblings.length; i < l; i++) {
    var sibling = siblings[i];
    //如果这个元素是siblings数组中的元素，则执行递归操作
    if (sibling == element) {
      return (
        arguments.callee(element.parentNode, root) +
        "/" +
        element.tagName.toLowerCase() +
        "[" +
        ix +
        "]"
      );
      //如果不符合，判断是否是element元素，并且是否是相同元素，如果是相同的就开始累加
    } else if (sibling.nodeType == 1 && sibling.tagName == element.tagName) {
      ix++;
    }
  }
};

WebTool.queryXPath = function (xpath, element) {
  var tElem = element.parentNode || document;
  var elem = document.evaluate(xpath, tElem).iterateNext();
  return elem;
};

WebTool.getBgColor = function (ctx) {
  let w = ctx.canvas.width;
  let h = ctx.canvas.height;
  let t = 30;
  let arr = [
    {
      x: t,
      y: t,
    },
  ];
  let color = this.getColor(ctx, arr[0].x, arr[0].y);

  return color;
};

WebTool.getColor = function (ctx, x, y) {
  var imageData = ctx.getImageData(x, y, 1, 1);
  var pixel = imageData.data;
  var r = pixel[0];
  var g = pixel[1];
  var b = pixel[2];
  var a = pixel[3] / 255;
  a = Math.round(a * 100) / 100;
  var rHex = r.toString(16);
  r < 16 && (rHex = "0" + rHex);
  var gHex = g.toString(16);
  g < 16 && (gHex = "0" + gHex);
  var bHex = b.toString(16);
  b < 16 && (bHex = "0" + bHex);
  var rgbaColor = "rgba(" + r + "," + g + "," + b + "," + a + ")";
  var rgbColor = "rgb(" + r + "," + g + "," + b + ")";
  var hexColor = "#" + rHex + gHex + bHex;
  return {
    rgba: rgbaColor,
    rgb: rgbColor,
    hex: hexColor,
    r: r,
    g: g,
    b: b,
    a: a,
  };
};

WebTool.extractJSON = function (text, safeMode = false) {
  if (!text) return null;
  if (typeof text !== "string") {
    return text;
  }

  /** 🔹 安全解析 JSON，带基础清理 */
  const tryParse = (s) => {
    const cleaned = s
      .replace(/^\uFEFF/, "") // 去掉 BOM
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]+/g, ""); // 去掉控制字符
    return JSON.parse(cleaned);
  };

  /** 🔹 去掉 Markdown 围栏与包裹引号 */
  const stripFencesAndQuotes = (s) => {
    let r = s.trim();

    // 去掉多行 ```json ... ``` 围栏
    r = r
      .replace(/^\s*```(?:json)?\s*/i, "")
      .replace(/```+$/i, "")
      .trim();

    // 若整体被引号包裹且中间包含 JSON 结构
    if (
      (r.startsWith("'") && r.endsWith("'")) ||
      (r.startsWith('"') && r.endsWith('"'))
    ) {
      const inner = r.slice(1, -1);
      if (/[{\[]/.test(inner) && /[}\]]/.test(inner)) r = inner;
    }
    return r;
  };

  /** 🔹 从文本中找到最可能的 JSON 片段（{...} 或 [...]） */
  const findBalancedJSON = (s) => {
    const start = Math.min(
      s.indexOf("{") === -1 ? Infinity : s.indexOf("{"),
      s.indexOf("[") === -1 ? Infinity : s.indexOf("[")
    );
    if (start === Infinity) return null;

    let inStr = false,
      esc = false,
      depth = 0;
    const open = s[start];
    const close = open === "{" ? "}" : "]";
    for (let i = start; i < s.length; i++) {
      const ch = s[i];
      if (esc) {
        esc = false;
        continue;
      }
      if (ch === "\\") {
        esc = true;
        continue;
      }
      if (ch === '"') {
        inStr = !inStr;
        continue;
      }

      if (!inStr) {
        if (ch === open) depth++;
        else if (ch === close) {
          depth--;
          if (depth === 0) return s.slice(start, i + 1);
        }
      }
    }
    const last = s.lastIndexOf(close);
    return last > start ? s.slice(start, last + 1) : null;
  };

  try {
    // 1️⃣ 初步清理
    let cleanText = stripFencesAndQuotes(text);

    // 2️⃣ 尝试直接解析（若 AI 输出就是纯 JSON）
    try {
      const parsed = tryParse(cleanText);
      if (parsed && typeof parsed === "object") return parsed;
    } catch (_) {
      /* 进入提取逻辑 */
    }

    // 3️⃣ 从文本中提取 JSON 片段
    const balanced = findBalancedJSON(cleanText);
    if (!balanced) throw new Error("未检测到 JSON 结构");

    // 4️⃣ 尝试解析提取片段
    try {
      const parsed = tryParse(balanced);
      if (parsed && typeof parsed === "object") return parsed;
    } catch (e) {
      // 5️⃣ 再清理一次尾部残留符号
      const trimmed = balanced
        .replace(/```[\s\S]*$/g, "")
        .replace(/['",\s]+$/g, "")
        .trim();
      const parsed = tryParse(trimmed);
      if (parsed && typeof parsed === "object") return parsed;
      throw e;
    }

    throw new Error("JSON 解析失败");
  } catch (err) {
    if (safeMode) {
      console.warn("⚠️ extractJSON 失败（安全模式）:", err.message);
      return null;
    }
    throw new Error("❌ JSON 提取失败：" + err.message);
  }
};

/**
 * 将 AI 返回的 JSON 内容映射为模板结构
 * @param {Object} aiResult - AI 返回的 JSON 对象
 * @param {Object} templateData - 模板中定义的结构（如 this.accountData）
 * @param {Object} customMap - 可选字段映射规则，如 { desc: "description" }
 * @returns {Object} - 转换后的结果对象
 */
WebTool.mapAIResultToTemplate = function (
  aiResult,
  templateData = {},
  customMap = {}
) {
  if (typeof aiResult !== "object" || aiResult === null) {
    console.warn("❌ AI 结果非对象格式，自动重置为空结构");
    return JSON.parse(JSON.stringify(templateData));
  }

  const result = {};

  for (let key in templateData) {
    let mappedKey =
      Object.keys(customMap).find((k) => customMap[k] === key) || key;
    let value = aiResult[mappedKey];

    // 🧩 自动类型修正
    if (Array.isArray(templateData[key]) && !Array.isArray(value)) {
      if (typeof value === "string") {
        value = value.split(/[,，]/).map((v) => v.trim());
      } else if (value == null) {
        value = [];
      }
    } else if (
      typeof templateData[key] === "string" &&
      typeof value !== "string"
    ) {
      value = value != null ? String(value) : "";
    } else if (
      typeof templateData[key] === "object" &&
      !Array.isArray(templateData[key])
    ) {
      value = this.mapAIResultToTemplate(
        value || {},
        templateData[key],
        customMap
      );
    }

    result[key] = value ?? templateData[key];
  }

  // 🧠 调试：保留未知字段（AI 新增但模板未定义的）
  const extraKeys = Object.keys(aiResult).filter(
    (k) => !Object.keys(templateData).includes(k)
  );
  if (extraKeys.length > 0) {
    result._extra = {};
    extraKeys.forEach((k) => (result._extra[k] = aiResult[k]));
  }

  return result._extra || result;
};

WebTool.adjustStyle = function (sm, lg) {
  var minWidth = sm || 400;
  let maxWidth = lg || 700;
  var w = document.body.clientWidth;
  var h = document.body.clientHeight;
  window.transformRadio = 1;
  // if(w === 0) {
  //   return false;
  // }
  if (w < minWidth && w !== 0) {
    window.transformRadio = w / minWidth;
    document.body.setAttribute("scaleFlag", "true");
    document.body.style.width = minWidth + "px";
    document.body.style.height = (100 * minWidth) / w + "%";
    document.body.style.transform = "scale(" + w / minWidth + ")";
    document.body.style.transformOrigin = "0 0";
  } else if (w < maxWidth && w !== 0) {
    window.transformRadio = maxWidth / w;
    document.body.setAttribute("scaleFlag", "true");
    document.body.style.width = maxWidth + "px";
    document.body.style.height = (100 * maxWidth) / w + "%";
    document.body.style.transform = "scale(" + w / maxWidth + ")";
    document.body.style.transformOrigin = "0 0";
  }
};

WebTool.getOutlineByText = function (text) {
  let options = {
    parseImgDimensions: true,
    tables: true,
    smoothLivePreview: true,
    tablesHeaderId: true,
    ghCodeBlocks: false,
    tasklists: true,
  };
  var converter = new showdown.Converter(options);
  this.markdown = text;
  let html = converter.makeHtml(text);
  return html;
};

WebTool.getCodeItem = function (str) {
  if (str.search(/\`\`\`/) !== -1) {
    let t = this.getOutlineByText(str);
    let elem = document.createElement("div");
    elem.innerHTML = t;
    let codeItem = elem.querySelector("code");
    str = codeItem.innerText;
  }
  return str;
};

WebTool.getSpanText = function (str) {
  let elem = document.createElement("div");
  elem.innerHTML = str;
  return elem.innerText;
};

WebTool.transformContent = function (str, flag, isLaTeX) {
  str = str.trim();
  str = this.getCodeItem(str);
  str = str.trim();
  str = str.replace(/^\`\`\`/g, "");
  str = str.replace(/\`\`\`$/g, "");
  str = str.replace(/^json/i, "");

  function fixJSON(jsonString) {
    // 1. 移除注释（简单处理，可能不适用于所有情况）
    let fixed = jsonString
      .replace(/\/\*[\s\S]*?\*\//g, "") // 删除/*...*/注释
      .replace(/\/\/.*/g, ""); // 删除//注释

    // 2. 替换单引号为双引号（仅处理不在双引号中的单引号）
    fixed = fixed.replace(/'([^"]*)'/g, '"$1"');

    // 3. 修复键名缺少双引号的问题
    fixed = fixed.replace(
      /([{,]\s*)(['"]?)([a-zA-Z_$][\w$]*)\2(?=\s*:)/g,
      '$1"$3"'
    );

    // 4. 删除尾随逗号
    fixed = fixed.replace(/,\s*([}\]])/g, "$1");

    try {
      return fixed;
    } catch (e) {
      // 进一步处理或抛出错误
      throw new Error("修复失败，可能存在复杂错误");
    }
  }
  let ret = str;
  try {
    ret = WebTool.stringToObject(str, flag, isLaTeX);
  } catch (e) {
    str = fixJSON(str);
    ret = WebTool.stringToObject(str, flag, isLaTeX);
  }

  return ret;
};

/**
 * 将 JSON 对象转换为 CSS 字符串（支持 @keyframes/@media/@supports）
 *
 * @param {Object} json - 样式规则 JSON 对象
 * @param {string} id - 作用域 ID
 * @returns {string} - CSS 字符串
 */

WebTool.json2css = function (json, id) {
  const scope = `div[transweb-id="${id}"]`;

  function build(obj, parentIsKeyframes = false) {
    let css = "";
    for (const key in obj) {
      const value = obj[key];

      if (key.startsWith("@media") || key.startsWith("@supports")) {
        // 响应式外壳保持不变，递归处理内部
        css += `${key} {\n${build(value)}\n}\n`;
      } else if (key.startsWith("@keyframes")) {
        // 动画外壳保持不变
        css += `${key} {\n${build(value, true)}\n}\n`;
      } else {
        // 处理选择器：如果是 keyframes 内部则不加 scope，否则加上 scope
        const selector = parentIsKeyframes
          ? key
          : key
            .split(",")
            .map((s) => `${scope} ${s.trim()}`)
            .join(", ");

        const decls = Object.entries(value)
          .map(([k, v]) => `  ${k}: ${v};`)
          .join("\n");

        css += `${selector} {\n${decls}\n}\n`;
      }
    }
    return css;
  }

  return build(json);
};

/**
 * 将 CSS 字符串转换为 JSON 对象（支持 @keyframes/@media/@supports）
 *
 * @param {string} css - CSS 字符串
 * @returns {Object} - 样式规则 JSON 对象
 */
WebTool.css2json = function (css) {
  // 移除注释并格式化空格
  css = css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .trim();

  function parse(blockCss) {
    const json = {};
    // 该正则可以匹配：选择器 { 内部内容（允许包含一层嵌套的大括号） }
    const regex = /([^{]+)\{((?:[^{}]|\{[^{}]*\})*)\}/g;
    let match;

    while ((match = regex.exec(blockCss)) !== null) {
      const header = match[1].trim();
      const body = match[2].trim();

      if (
        header.startsWith("@media") ||
        header.startsWith("@supports") ||
        header.startsWith("@keyframes")
      ) {
        // 遇到响应式或动画，递归解析内部主体
        json[header] = parse(body);
      } else {
        // 普通样式声明处理
        const declarations = {};
        body.split(";").forEach((decl) => {
          const splitIdx = decl.indexOf(":");
          if (splitIdx > -1) {
            const prop = decl.substring(0, splitIdx).trim();
            const val = decl.substring(splitIdx + 1).trim();
            if (prop) declarations[prop] = val;
          }
        });

        // 支持多选择器并列
        header.split(",").forEach((sel) => {
          const s = sel.trim();
          if (s) {
            json[s] = Object.assign(json[s] || {}, declarations);
          }
        });
      }
    }
    return json;
  }

  return parse(css);
};

WebTool.normalizeStyleOps = function (styleOps) {
  function parseDeclBody(body) {
    const o = {};
    String(body || "")
      .split(";")
      .forEach((d) => {
        const i = d.indexOf(":");
        if (i > -1) o[d.slice(0, i).trim()] = d.slice(i + 1).trim();
      });
    return o;
  }
  if (!styleOps || !Array.isArray(styleOps.ops)) return styleOps;
  const next = [];
  for (const op of styleOps.ops) {
    if (!op || !op.op) {
      continue;
    }
    if (op.op === "css.add" || op.op === "css.update") {
      next.push({
        op: "css.rule.set",
        selector: op.selector,
        body: parseDeclBody(op.body),
        at: op.at,
      });
      continue;
    }
    if (op.op === "css.remove") {
      next.push({ op: "css.rule.remove", selector: op.selector, at: op.at });
      continue;
    }
    next.push(op);
  }
  return Object.assign({}, styleOps, { ops: next });
};

WebTool.adjustSize = function (arr, _arr) {
  var v = document.body.clientWidth;
  var ret = arr[0];
  _arr = _arr || [768, 1200];
  if (v < _arr[1] && v > _arr[0]) {
    ret = arr[1] === undefined ? arr[0] : arr[1];
  } else if (v > _arr[1] + 0.00001) {
    ret = arr[0];
  } else if (v < _arr[0] - 0.00001) {
    ret = arr[2] === undefined ? arr[1] : arr[2];
  }

  return ret;
};

WebTool.setShortcutKey = function (elem, key, callback) {
  try {
    if (!elem || typeof callback !== "function") return;

    elem.addEventListener("keydown", function (e) {
      // 单键（字符串或数字）
      if (
        (typeof key === "string" || typeof key === "number") &&
        e.keyCode == key
      ) {
        callback(e);
        e.preventDefault();
        return false;
      }

      // 组合键（如 ["ctrlKey", 83] 表示 Ctrl + S）
      if (Array.isArray(key) && e.keyCode == key[1] && e[key[0]]) {
        callback(e);
        e.preventDefault();
        return false;
      }

      // 其他情况（未匹配）
      // console.log(e.keyCode);
    });
  } catch (err) {
    console.error("setShortcutKey error:", err);
  }
};

WebTool.bindData = function (str, obj, filter, arr) {
  var ret = str;
  if (obj && typeof obj === "object") {
    var re = /{{([^}}]+)?}}/g;
    if (arr) {
      re = /\[([^\]]+)?\]/g;
    }
    str.filter = filter;
    var _self = str;
    var ret = _self.replace(re, function (m, t) {
      var temp = obj;
      var ret = (function () {
        var o = temp;
        var keys = t.split(".");
        for (var i = 0; i < keys.length; i++) {
          o = o[keys[i]];
          if (o === undefined || o === null) {
            o = "{{" + keys[i] + "}}";
            if (arr) {
              o = "[" + keys[i] + "]";
            }
          }
        }
        var m = !(
          _self.filter && typeof _self.filter[keys[i - 1]] === "function"
        )
          ? o
          : _self.filter[keys[i - 1]](o);
        return m;
      })();
      return ret;
    });
  }
  return ret;
};

WebTool.fetchFileContent = async function (prefix, filePath) {
  const response = await fetch(`${prefix}${filePath}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${filePath}`);
  }
  let ret = null;
  if (filePath.search(/.json$/) !== -1) {
    ret = await response.text();
  } else {
    ret = await response.blob();
  }
  return ret; // 或 `response.text()` 根据文件类型
};
WebTool.downloadAllFiles = async function (prefix, fileList) {
  const files = {};
  for (const filePath of fileList) {
    files[filePath] = await this.fetchFileContent(prefix, filePath);
  }
  return files;
};
WebTool.modifyFileContent = function (content, info) {
  // 假设 `modifications` 是一个替换对象 { search: replace }
  let json = JSON.parse(content);
  json.name = info.name;
  json.description = info.description;
  let params = json.options_ui.customParams;
  params.agentId = localStorage.folderName;
  params.lang = window.lang || params.lang;
  params.origin = location.origin;
  params.agentList = info.agentList.map((item) => {
    return {
      name: item.name,
      buttonLabel: item.meta.buttonText,
    };
  });
  let jsonString = JSON.stringify(json);
  content = new Blob([jsonString], { type: "application/json" });
  return content;
};

WebTool.createZip = async function (files) {
  const zip = new JSZip();

  for (const [filePath, content] of Object.entries(files)) {
    zip.file(filePath, content); // 自动保留文件夹结构
  }

  return zip.generateAsync({
    type: "blob",
  });
};
WebTool.downloadBlob = function (blob, filename) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
WebTool.downloadPluginFiles = async function (prefix, tFiles, info) {
  try {
    const files = await this.downloadAllFiles(prefix, tFiles);
    //修改指定文件内容
    const modifiedFiles = {};
    for (const [filePath, content] of Object.entries(files)) {
      modifiedFiles[filePath] = filePath.includes("manifest.json")
        ? this.modifyFileContent(content, info)
        : content;
    }

    // 创建 ZIP 并下载
    const zipBlob = await this.createZip(modifiedFiles);
    this.downloadBlob(zipBlob, info.name + "_agentPlugin.zip");
  } catch (error) {
    console.error("Error processing files:", error);
  }
};

WebTool.generateMiniProgramZip = async function (url, info = {}) {
  const appName = info.name || "WebAppMini";
  const title = info.title || "WebView";

  // 自动生成的小程序文件集合（key: 路径, value: 文本内容）
  const files = {};

  // -------------------------
  // 1. app.json
  // -------------------------
  files["app.json"] = JSON.stringify(
    {
      pages: ["pages/webview/webview"],
      window: {
        navigationBarTitleText: title,
        navigationStyle: "default",
      },
    },
    null,
    2
  );

  // -------------------------
  // 2. app.js
  // -------------------------
  files["app.js"] = `App({
  onLaunch() {
    console.log("Mini program launched");
  }
});`;

  // -------------------------
  // 3. app.wxss
  // -------------------------
  files["app.wxss"] = ``;

  // -------------------------
  // 4. project.config.json
  // -------------------------
  files["project.config.json"] = JSON.stringify(
    {
      miniprogramRoot: "./",
      projectname: appName,
      appid: "touristappid",
    },
    null,
    2
  );

  // -------------------------
  // 5. 页面 webview.wxml
  // -------------------------
  files["pages/webview/webview.wxml"] = `
<web-view src="{{targetUrl}}"></web-view>
`;

  // -------------------------
  // 6. webview.js
  // -------------------------
  files["pages/webview/webview.js"] = `
Page({
  data: {
    targetUrl: ""
  },
  onLoad(query) {
    this.setData({
      targetUrl: decodeURIComponent(query.url)
    });
  }
});
`;

  // -------------------------
  // 7. webview.json
  // -------------------------
  files["pages/webview/webview.json"] = JSON.stringify(
    {
      navigationBarTitleText: title,
      navigationStyle: "default",
    },
    null,
    2
  );

  // -------------------------
  // 8. webview.wxss
  // -------------------------
  files["pages/webview/webview.wxss"] = ``;

  // -------------------------
  // 9. 生成入口跳转文件 (optional)
  // -------------------------
  files["pages/index/index.wxml"] = `<view>Loading...</view>`;
  files["pages/index/index.js"] = `
Page({
  onLoad() {
    wx.redirectTo({
      url: '/pages/webview/webview?url=' + encodeURIComponent('${url}')
    });
  }
});
`;
  files["pages/index/index.json"] = `{"navigationBarTitleText": "${title}"}`;
  files["pages/index/index.wxss"] = ``;

  // 修改 app.json，增加 index 页面
  files["app.json"] = JSON.stringify(
    {
      pages: ["pages/index/index", "pages/webview/webview"],
      window: {
        navigationBarTitleText: title,
        navigationStyle: "default",
      },
    },
    null,
    2
  );

  // -------------------------
  // 10. 生成并下载 ZIP（使用你的已有工具）
  // -------------------------
  const zipBlob = await WebTool.createZip(files);
  WebTool.downloadBlob(zipBlob, appName + "_miniProgram.zip");

  return true;
};

WebTool.extractTextFromFile = (function () {
  // 缓存 CDN 动态加载的 Promise，防止高并发调用时重复插入 script 标签
  const scriptMap = new Map();

  function loadScript(url) {
    if (scriptMap.has(url)) return scriptMap.get(url);

    const promise = new Promise((resolve, reject) => {
      const existedScript = document.querySelector(`script[src="${url}"]`);
      if (existedScript) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = url;
      script.onload = resolve;
      script.onerror = () => {
        scriptMap.delete(url); // 加载失败时清除缓存以允许重试
        reject(new Error(`脚本加载失败: ${url}`));
      };
      document.head.appendChild(script);
    });

    scriptMap.set(url, promise);
    return promise;
  }

  /**
   * 1. 解析 PDF (.pdf)
   */
  async function parsePdfBrowser(arrayBuffer) {
    await loadScript('https://transweb.cn/common/pdf.min.js');
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://transweb.cn/common/pdf.worker.min.js';

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const pagePromises = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      pagePromises.push(
        pdf.getPage(i).then(async (page) => {
          const textContent = await page.getTextContent();
          return textContent.items.map((item) => item.str).join(' ');
        })
      );
    }
    const pagesText = await Promise.all(pagePromises);
    return pagesText.join('\n');
  }

  /**
   * 2. 解析 Word (.docx)
   */
  async function parseDocxBrowser(arrayBuffer) {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js');
    const result = await window.mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  /**
   * 3. 解析 PPT (.pptx)
   */
  async function parsePptxBrowser(arrayBuffer) {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
    const zip = await window.JSZip.loadAsync(arrayBuffer);

    const slideRegex = /^ppt\/slides\/slide\d+\.xml$/;
    const files = Object.keys(zip.files)
      .filter((name) => slideRegex.test(name))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)[0], 10);
        const numB = parseInt(b.match(/\d+/)[0], 10);
        return numA - numB;
      });

    const slideTexts = await Promise.all(
      files.map(async (filePath) => {
        const xmlText = await zip.file(filePath).async('text');
        const matches = xmlText.match(/<a:t>([\s\S]*?)<\/a:t>/g) || [];
        return matches.map((match) => match.replace(/<\/?a:t>/g, '')).join(' ');
      })
    );

    return slideTexts.join('\n');
  }

  /**
   * 4. 解析 Excel/CSV (.xlsx, .xls, .csv) [新增]
   */
  async function parseExcelBrowser(arrayBuffer) {
    // 动态加载 SheetJS (xlsx)
    await loadScript('https://transweb.cn/common/xlsx.full.min.js');
    const XLSX = window.XLSX;

    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetTexts = [];

    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      // 将表格转换为带格式的纯文本（每行格式为 CSV 格式）
      const csvText = XLSX.utils.sheet_to_csv(worksheet);
      if (csvText.trim()) {
        sheetTexts.push(`--- 工作表: ${sheetName} ---\n${csvText}`);
      }
    });

    return sheetTexts.join('\n\n');
  }

  // 主导出 API
  return async function extractTextFromFile(file) {
    if (!file) return '';

    const extension = file.name.split('.').pop().toLowerCase();
    const arrayBuffer = await file.arrayBuffer();

    switch (extension) {
      case 'pdf':
        return await parsePdfBrowser(arrayBuffer);
      case 'docx':
        return await parseDocxBrowser(arrayBuffer);
      case 'pptx':
        return await parsePptxBrowser(arrayBuffer);
      case 'xlsx':
      case 'xls':
      case 'csv':
        return await parseExcelBrowser(arrayBuffer);
      default:
        throw new Error(`暂不支持 .${extension} 格式的文件读取`);
    }
  };
})();

/**
 * 启动屏幕录制
 * @param {Object} options - 录制配置
 *   options.duration: 自动停止录制的时长（ms，可选）
 *   options.mimeType: 视频类型，默认 'video/webm; codecs=vp9'
 *   options.bitsPerSecond: 码率，默认 2Mbps
 * @param {Function} onReady - 用户允许录制后执行的回调，参数 (recorder, stream)
 * @param {Function} onComplete - 录制完成后执行的回调，参数 (videoBlob)
 */
WebTool.startScreenRecording = async function (
  options = {},
  onCountdownEnd,
  onComplete
) {
  const countdown = options.countdown || 3;
  let recorder,
    chunks = [];
  let countdownTimerId, stopCheckInterval;
  let recordingStartTime = null;

  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { cursor: "always" },
      audio: true,
    });

    // 创建浮窗
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.8); color: white;
      padding: 30px 40px; border-radius: 12px;
      text-align: center; font-family: sans-serif;
      z-index: 9999; display: flex; flex-direction: column;
      align-items: center; gap: 20px;
    `;

    const countEl = document.createElement("div");
    countEl.style.cssText = "font-size:48px; font-weight:bold;";

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "取消";
    cancelBtn.style.cssText = `
      background: red; color: white; border: none;
      border-radius: 6px; padding: 8px 16px; cursor: pointer;
      font-size: 16px;
    `;

    overlay.appendChild(countEl);
    overlay.appendChild(cancelBtn);
    document.body.appendChild(overlay);

    let remaining = countdown;
    countEl.textContent = remaining;

    // 取消按钮只取消倒计时
    let countdownCancelled = false;
    cancelBtn.onclick = () => {
      countdownCancelled = true;
      clearInterval(countdownTimerId);
      overlay.remove(); // 倒计时浮窗消失
    };

    // 倒计时逻辑
    countdownTimerId = setInterval(() => {
      if (countdownCancelled) return;

      if (remaining > 0) {
        countEl.textContent = remaining;
        remaining--;
      } else {
        clearInterval(countdownTimerId);
        overlay.remove();
        startRecording();
      }
    }, 1000);

    // stopRecord 检测，独立于倒计时
    stopCheckInterval = setInterval(() => {
      if (
        recorder &&
        recorder.state !== "inactive" &&
        sessionStorage.getItem("stopRecord") === "true"
      ) {
        sessionStorage.removeItem("stopRecord");
        recorder.stop();
      }

      // 如果在录制中，显示录制时长（可选）
      if (recordingStartTime) {
        // 可以在 console 或其他控件显示时长
        const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
        console.log(`录制时长: ${elapsed}s`);
      }
    }, 500);

    function startRecording() {
      recorder = new MediaRecorder(stream, {
        mimeType: options.mimeType || "video/webm; codecs=vp9",
        bitsPerSecond: options.bitsPerSecond || 2_000_000,
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType });
        if (typeof onComplete === "function") onComplete(blob);

        // 自动生成下载
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = "recording.webm";
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
          window.URL.revokeObjectURL(blobUrl);
          a.remove();
        }, 2000);

        if (stopCheckInterval) clearInterval(stopCheckInterval);
      };

      if (typeof onCountdownEnd === "function")
        onCountdownEnd(recorder, stream);

      recorder.start();
      recordingStartTime = Date.now();

      if (options.duration) setTimeout(() => recorder.stop(), options.duration);
    }
  } catch (err) {
    console.error("屏幕录制权限被拒绝或出错：", err);
  }
};

//模板HTML字符串与JSON对象绑定
String.prototype.bindData = function (obj, filter, arr) {
  // 在原型方法中，this 指向当前字符串
  var str = this.toString();
  if (!obj || typeof obj !== "object") return str;

  // 1. 正则匹配：支持 {{key}} 或 [key]
  var re = arr ? /\[([^\]]+)\]/g : /{{([^}]+)}}/g;

  // 2. 使用 replace 进行替换
  return str.replace(re, function (match, path) {
    var keys = path.trim().split(".");
    var value = obj;

    // 3. 深度遍历对象路径 (如 user.name)
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (value !== null && typeof value === "object" && key in value) {
        value = value[key];
      } else {
        // 路径不存在则保留原样
        return match;
      }
    }

    // 4. 过滤器处理
    var lastKey = keys[keys.length - 1];
    if (filter && typeof filter[lastKey] === "function") {
      value = filter[lastKey](value);
    }

    // 5. 返回最终值，确保空值(0/false)能显示，null/undefined 保持原样
    return (value !== undefined && value !== null) ? value : match;
  });
};


/**
 * Kroki.io API 浏览器端客户端工具类
 */
class KrokiClient {
  /**
   * @param {Object} options
   * @param {string} [options.baseUrl='/user/krokiPipeProxy'] - 代理服务 API 地址
   */
  constructor(options = {}) {
    // 自动清洗末尾斜杠
    this.baseUrl = (options.baseUrl || '/user/krokiPipeProxy').replace(/\/+$/, '');
  }

  /**
   * [内部方法] 使用浏览器原生 CompressionStream (Deflate) 进行 zlib 压缩并转为 URL-Safe Base64
   * @private
   */
  async _encodeDiagramText(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    // 1. 使用浏览器原生 zlib deflate 压缩 API
    const cs = new CompressionStream('deflate');
    const writer = cs.writable.getWriter();
    writer.write(data);
    writer.close();

    const compressedBuffer = await new Response(cs.readable).arrayBuffer();
    const compressedBytes = new Uint8Array(compressedBuffer);

    // 2. 转为二进制字符串
    let binary = '';
    const len = compressedBytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(compressedBytes[i]);
    }

    // 3. 转换为 URL-safe Base64 格式
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  /**
   * 生成静态图片 URL（仅在特殊需要 img 标签 src 引用且代理支持该 Query 模式时使用）
   * @param {string} text - 图表源码
   * @param {string} [type='mermaid'] - 图表类型
   * @returns {Promise<string>}
   */
  async getSvgUrl(text, type = 'mermaid') {
    if (!text || typeof text !== 'string') {
      throw new Error('[KrokiClient] 图表文本内容不能为空');
    }
    const encoded = await this._encodeDiagramText(text.trim());
    return `${this.baseUrl}?type=${encodeURIComponent(type)}&format=svg&encoded=${encodeURIComponent(encoded)}`;
  }

  /**
   * 统一使用 POST 方式，以 baseUrl + Query 参数形式请求代理获取 SVG 代码
   * 请求路径示例：POST /api/krokiProxy?type=mermaid&format=svg
   *
   * @param {string} text - 图表源码（如 Mermaid、PlantUML 文本）
   * @param {string} [type='mermaid'] - 图表类型 (mermaid, plantuml, graphviz 等)
   * @param {Object} [fetchOptions] - 自定义 fetch 配置项
   * @returns {Promise<string>} 返回 SVG XML 源代码
   */
  async fetchSvgCode(text, type = 'mermaid', fetchOptions = {}) {
    if (!text || typeof text !== 'string') {
      throw new Error('[KrokiClient] 图表文本内容不能为空');
    }

    // 1. 构造 Query 参数
    const params = new URLSearchParams({
      type: type || 'mermaid',
      format: 'svg'
    });

    // 2. 拼接完整的代理 URL
    const targetUrl = `${this.baseUrl}?${params.toString()}`;

    let adapter = webCpu.initAdapter({
      fetchChart: {
        url: targetUrl,
        method: "post"
      }
    });

    // 3. 将基于回调的异步操作包装为 Promise，并使用 await 等待其返回
    const result = await new Promise((resolve, reject) => {
      try {
        adapter.fetchChart(text, (res) => {
          // 在回调函数中将结果通过 resolve 传出
          resolve(res);
        });
      } catch (err) {
        reject(err);
      }
    });

    // 4. 返回回调函数传出的数据
    return result;
  }
}

// 导出单例或类供使用
window.KrokiClient = KrokiClient;


window.webCpu = new WebCpu();
webCpu.documentPrefix = location.origin;
webCpu.componentPath = webCpu.documentPrefix + "/transweb/components";

// 1. 辅助函数：简化 URL 参数获取
const _getQuery = (key) => WebTool.urlQuery(location.href, key);

// 2. 集中解析并管理配置，提供默认值
const _config = {
  aScript: _getQuery("aScript"),
  scriptKey: _getQuery("scriptKey") || "transweb_events",
  scriptDelay: Number(_getQuery("scriptDelay")) || 0,
  recordVideo: _getQuery("recordVideo"),
  recordScript: _getQuery("recordScript"),
  maxDuration: Number(_getQuery("recordDuration")) || 30 * 60 * 1000,
  countdown: Number(_getQuery("countdown")) || 3,
};

// 3. 核心逻辑：封装脚本执行函数，方便复用
webCpu.executeScript = (script, key, recordFlag, delay = 0) => {
  if (!script) return;

  const play = () => webCpu.playScript(script, key, recordFlag);

  if (delay > 0) {
    setTimeout(play, delay * 1000);
  } else {
    play();
  }
};

webCpu.createScriptRecorder = function (container = document.body, options = {}) {
  const config = Object.assign({
    autoAnimation: true,      // 是否自动插入 animation 指令
    animationType: 'tada',    // 动画类型
    animationLeadTime: 1,     // 动画提前量（秒）
    minIntervalForAnim: 1,    // 产生动画所需的最小事件间隔（秒）
    hoverDelay: 800           // Hover 认定触发时长(ms)
  }, options);

  let isRecording = false;
  let isPaused = false;          // 暂停状态标识
  let startTime = 0;
  let pausedTime = 0;            // 本次暂停开始时刻
  let totalPausedDuration = 0;   // 累计暂停总时长（秒）
  let lastEventOffset = -1;
  let scriptTasks = [];
  let hoverTimer = null;

  // UI 元素引用（Shadow DOM 宿主元素）
  let bannerElement = null;
  const BANNER_HEIGHT = 42;  // 顶部工具栏高度(px)

  // 记录被我们覆盖前的根元素内联样式，用于停止录制时精确还原
  let prevRootTransform = '';
  let prevRootHeight = '';

  // 记录文本框输入法的拼音合成状态 (支持中文/日文/韩文输入法)
  let isComposing = false;
  // 记录每个输入框上一次提交的文本，避免重复记录
  const lastRecordedValues = new WeakMap();

  // 1. 获取 Selector 与 Index 结构 [selector, index]
  function getElementObject(elem) {
    if (!elem || elem === document.body) return ["body", 1];

    // 校验 ID 是否属于“前端动态/随机生成”
    function isDynamicId(id) {
      if (!id || typeof id !== 'string') return true;

      // 匹配所有常见的动态/自动生成 ID 模式
      const dynamicPatterns = [
        // 1. React 18 / SSR / 特殊字符标记
        /:\w+:/,                                    // React 18+ style, 例如 :r0:, :r1a:

        // 2. 标准 UUID / GUID (8-4-4-4-12 及其变体)
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,

        // 3. 带 Hash 的 UUID/随机串 (8位及以上 hex/alpha)
        /^[a-z0-9]+[\-_][0-9a-f]{8,}/i,             // 例如 element-3f2a1b0c, my-btn-a1b2c3d4
        /[\-_][0-9a-f]{8,}$/i,                      // 结尾带 8位+ 哈希, 例如 nav_9f8a7b6c

        // 4. 主流框架及 UI 组件库的前缀 (React/Vue/Angular/Element/AntD/NaiveUI 等)
        /^(ng|react|vue|ember|j_id|el|ant|n|headlessui|radix)[\-_]/i, // 例如 el-id-..., ant-select-..., n-input-...

        // 5. 多段自增 / 级联生成的数字组合
        /[\-_]\d+[\-_]\d+/,                         // 例如 el-id-8098-21, form-1-2
        /[\-_]\d+$/,                                // 结尾带数字序列, 例如 input-1002, modal_15

        // 6. 长数字序列 / 纯数字 ID
        /^\d+$/,                                    // 纯数字 ID
        /\d{4,}/                                    // 包含 4 位及以上连续数字
      ];

      return dynamicPatterns.some(pattern => pattern.test(id));
    }

    // 清洗 Class 列表（排除框架动态生成 Class 和动画 Class）
    function cleanClasses(className) {
      if (!className || typeof className !== 'string') return [];
      return className.trim().split(/\s+/).filter(c => {
        if (!c) return false;
        if (c.startsWith('animate__')) return false;                  // 过滤 animate.css
        if (/_+[a-zA-Z0-9]{5,}/.test(c) || /[a-z0-9]{8,}/i.test(c)) return false; // 过滤动态/哈希类名
        return true;
      });
    }

    // 转义属性值，避免值中含引号/反斜杠时破坏选择器
    function escapeAttrValue(val) {
      return String(val).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    }

    // 优先尝试使用具有稳定业务含义的自定义属性
    const stableAttrs = ['data-test-id', 'data-testid', 'data-id', 'data-qa', 'name'];
    for (const attr of stableAttrs) {
      const val = elem.getAttribute(attr);
      if (val) {
        // 修复：原代码此处模板串拼接有误，会产生非法的 \(tag[\)attr=...] 选择器
        const attrSelector = `${elem.tagName.toLowerCase()}[${attr}="${escapeAttrValue(val)}"]`;
        const matches = $(container).find(attrSelector);
        if (matches.length === 1) return [attrSelector, 1];
      }
    }

    // 如果 ID 不是动态生成的，则保留使用 ID
    if (elem.id && !isDynamicId(elem.id)) {
      return [`#${CSS.escape ? CSS.escape(elem.id) : elem.id}`, 1];
    }

    // 构建标签 + 稳定类名的组合选择器
    let selector = elem.tagName.toLowerCase();
    const classes = cleanClasses(elem.className);
    if (classes.length > 0) {
      selector += `.${classes.slice(0, 3).join('.')}`; // 取前几个最具表达力的类名
    }

    // 辅助定位：如果是 input/button 且有 type 属性，拼接 type
    if (['input', 'button'].includes(elem.tagName.toLowerCase()) && elem.type) {
      selector += `[type="${elem.type}"]`;
    }

    // 计算多节点索引
    const matches = $(container).find(selector);
    let index = 1;
    for (let i = 0; i < matches.length; i++) {
      if (matches[i] === elem) {
        index = i + 1;
        break;
      }
    }

    return [selector, index];
  }

  // 2. 计算相对起始时刻的时间偏移量 (扣除暂停时长，单位：秒，保留一位小数)
  function getOffset() {
    const now = new Date().getTime();
    let currentPaused = 0;
    if (isPaused) {
      currentPaused = (now - pausedTime) / 1000;
    }
    const offset = (now - startTime) / 1000 - totalPausedDuration - currentPaused;
    return Number(Math.max(0, offset).toFixed(1));
  }

  // 检查事件源是否属于录制 UI 控件（过滤 UI 操作）
  function isRecorderUI(target) {
    return bannerElement && bannerElement.contains(target);
  }

  // 3. 压入事件指令（含时间间隔与动画判定）
  function pushEventTask(eventType, elem, extraData = {}) {
    if (!isRecording || isPaused) return;

    const objectRef = getElementObject(elem);
    const eventOffset = getOffset();

    const timeSinceLastEvent = lastEventOffset < 0 ? Infinity : Number((eventOffset - lastEventOffset).toFixed(1));

    // 只有与上一个事件间隔 >= 1 秒时，才提前 1s 插入 animation
    if (config.autoAnimation && timeSinceLastEvent >= config.minIntervalForAnim) {
      let animOffset = Math.max(0, Number((eventOffset - config.animationLeadTime).toFixed(1)));

      if (lastEventOffset >= 0 && animOffset < lastEventOffset) {
        animOffset = lastEventOffset;
      }

      scriptTasks.push({
        offset: animOffset,
        animation: {
          object: objectRef,
          type: config.animationType
        }
      });
    }

    // 压入主 event 指令
    scriptTasks.push({
      offset: eventOffset,
      event: Object.assign({
        object: objectRef,
        type: eventType
      }, extraData)
    });

    lastEventOffset = eventOffset;
  }

  function downloadScriptPlayer(data) {
    let title = `${document.title}-脚本播放`;
    let temp = `<!DOCTYPE html>
<html lang="zh">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html,
    body {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    iframe {
      display: block;
      width: 100%;
      height: 100%;
      border: none;
    }
  </style>
</head>

<body>
  <iframe id="targetFrame" src="{{pageUrl}}"></iframe>

  <script>
    (function () {
      const iframe = document.getElementById('targetFrame');

      // 需要发送的指定数据，按需修改
      const dataToSend = {{scriptData}};

      let wholeData = {
        action: "EXECUTE_SCRIPT",
        scriptData: {
          timeEvents: dataToSend
        }
      }

      // 目标源：iframe 的 src 为 data URL 时用 '*'；
      // 若为真实 URL，请替换为精确的 origin，如 'https://example.com'
      const TARGET_ORIGIN = '*';

      let sent = false;

      function sendMessage() {
        if (sent || !iframe.contentWindow) return;
        iframe.contentWindow.postMessage(wholeData, TARGET_ORIGIN);
        sent = true;
      }
      // iframe 加载完成后发送
      iframe.addEventListener('load', sendMessage);
      // 若 iframe 在脚本执行前已加载完成，立即发送
      if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
         setTimeout(sendMessage, 200);
      }
    })();
  </script>
</body>
</html>`;
    let query = WebTool.urlQuery(location.href);
    delete query.recordScript;
    let pageUrl = WebTool.attachParams(location.origin, query);
    temp = temp.bindData({
      pageUrl: pageUrl,
      scriptData: JSON.stringify(data),
      title: title
    });
    const blob = new Blob([temp], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}_${new Date().getTime()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

  }

  // --- 导出 JSON 数据到本地下载 ---
  function downloadScript(data, filename = 'recorded_script.json') {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // --- 创建顶部工具栏（Shadow DOM 样式隔离）---
  function createRecorderUI(onTogglePause, onStop) {
    // 宿主元素：真正挂载到页面的节点（isRecorderUI 依赖它做事件过滤）
    const host = document.createElement('div');
    host.id = 'webcpu-script-recorder-banner';
    // 固定于视口顶部；用 -42px 反向抵消 <html> 的 translateY(42px)，
    // 使工具栏不被“整体下移”带走，始终钉在最顶部
    host.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: ${BANNER_HEIGHT}px;
      z-index: 2147483647;
      transform: translateY(-${BANNER_HEIGHT}px);
      pointer-events: auto;
    `;

    // 挂载 Shadow DOM：Banner 的样式与宿主页面完全隔离，互不干涉
    const shadow = host.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        /* 阻断宿主页面可继承样式（color/font 等）穿透进 Shadow DOM */
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 13px;
        line-height: 1;
        color: #f8fafc;
      }
      .banner {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
        box-sizing: border-box;
        background-color: #1e293b;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        user-select: none;
      }
      .info { display: flex; align-items: center; gap: 8px; min-width: 0; }
      .text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: #ef4444;
        flex: 0 0 auto;
        animation: pulse 1.5s infinite;
      }
      .btns { display: flex; align-items: center; gap: 8px; flex: 0 0 auto; }
      .btn {
        padding: 4px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        line-height: 1;
        color: #fff;
        transition: filter 0.2s;
      }
      .btn:hover { filter: brightness(1.15); }
      .btn.pause { background: #334155; border: 1px solid #475569; }
      .btn.stop { background: #dc2626; border: none; font-weight: bold; }
      @keyframes pulse {
        0% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.4; transform: scale(0.9); }
        100% { opacity: 1; transform: scale(1); }
      }
    `;

    const banner = document.createElement('div');
    banner.className = 'banner';

    const info = document.createElement('div');
    info.className = 'info';

    const dot = document.createElement('span');
    dot.className = 'dot';

    const text = document.createElement('span');
    text.className = 'text';
    text.textContent = '脚本录制中 · 每步操作都将被记录';

    info.appendChild(dot);
    info.appendChild(text);

    const btnBox = document.createElement('div');
    btnBox.className = 'btns';

    const pauseBtn = document.createElement('button');
    pauseBtn.type = 'button';
    pauseBtn.className = 'btn pause';
    pauseBtn.textContent = '暂停录制';
    pauseBtn.onclick = (e) => {
      e.stopPropagation();
      onTogglePause(pauseBtn, dot, text);
    };

    const stopBtn = document.createElement('button');
    stopBtn.type = 'button';
    stopBtn.className = 'btn stop';
    stopBtn.textContent = '结束并下载';
    stopBtn.onclick = (e) => {
      e.stopPropagation();
      onStop();
    };

    btnBox.appendChild(pauseBtn);
    btnBox.appendChild(stopBtn);

    banner.appendChild(info);
    banner.appendChild(btnBox);

    shadow.appendChild(style);
    shadow.appendChild(banner);

    document.body.appendChild(host);
    return host;
  }

  // 移除 UI，并还原视口平移与根元素高度
  function removeRecorderUI() {
    if (bannerElement) {
      bannerElement.remove();
      bannerElement = null;
    }
    document.documentElement.style.transform = prevRootTransform;
    document.documentElement.style.height = prevRootHeight;
    prevRootTransform = '';
    prevRootHeight = '';
  }

  // --- 核心输入捕获逻辑 ---

  function commitInputValue(elem) {
    if (!elem || isRecorderUI(elem)) return;
    const currentText = elem.value;
    const lastText = lastRecordedValues.get(elem);

    if (currentText === undefined || currentText === lastText) {
      return;
    }

    lastRecordedValues.set(elem, currentText);
    pushEventTask('inputText', elem, { text: currentText });
  }

  function handleCompositionStart(e) {
    if (isRecorderUI(e.target)) return;
    isComposing = true;
  }

  function handleCompositionEnd(e) {
    if (isRecorderUI(e.target)) return;
    isComposing = false;
    commitInputValue(e.target);
  }

  function handleChange(e) {
    if (!isRecording || isPaused || isRecorderUI(e.target)) return;
    const target = e.target;
    if (['INPUT', 'TEXTAREA'].includes(target.tagName)) {
      commitInputValue(target);
    }
  }

  function handleBlur(e) {
    if (!isRecording || isPaused || isRecorderUI(e.target)) return;
    const target = e.target;
    if (['INPUT', 'TEXTAREA'].includes(target.tagName)) {
      commitInputValue(target);
    }
  }

  // --- 鼠标/点击事件监听 ---

  function handleClick(e) {
    if (!isRecording || isPaused || isRecorderUI(e.target)) return;
    const target = e.target;

    if (['INPUT', 'TEXTAREA'].includes(target.tagName)) {
      return;
    }

    pushEventTask('click', target);
  }

  function handleMouseOver(e) {
    if (!isRecording || isPaused || isRecorderUI(e.target)) return;
    const target = e.target;
    if (target === container || target === document.body) return;

    if (hoverTimer) clearTimeout(hoverTimer);

    hoverTimer = setTimeout(() => {
      pushEventTask('hover', target);
    }, config.hoverDelay);
  }

  function handleMouseOut(e) {
    if (isRecorderUI(e.target)) return;
    if (hoverTimer) clearTimeout(hoverTimer);
  }

  // 供内部 stop 回调使用的稳定引用（避免 this 绑定歧义）
  const api = {
    start() {
      if (isRecording) return;
      isRecording = true;
      isPaused = false;
      scriptTasks = [];
      startTime = new Date().getTime();
      pausedTime = 0;
      totalPausedDuration = 0;
      lastEventOffset = -1;

      // 1. 视口平移：将整个网页（含 fixed/sticky 贴顶元素）整体下移 42px，避免被工具栏遮挡。
      //    注意是作用在 <html> 根元素上，而不是 <body>：
      //    根元素的盒模型本身不随滚动移动，因此 fixed 元素会“下移但仍保持固定”；
      //    若作用在 body 上，fixed 元素会退化为 absolute 并随滚动滚走。
      const root = document.documentElement;
      prevRootTransform = root.style.transform;
      prevRootHeight = root.style.height;
      root.style.transform = `translateY(${BANNER_HEIGHT}px)`;
      // 2. 通过 calc(100vh - 42px) 压缩根元素可用高度，抵消下移造成的多余滚动，保持滚动条正常
      root.style.height = `calc(100vh - ${BANNER_HEIGHT}px)`;

      // 3. 创建 Shadow DOM 顶部工具栏及控件绑定
      bannerElement = createRecorderUI(
        // 切换暂停回调
        (btn, dot, text) => {
          if (isPaused) {
            // 恢复录制
            totalPausedDuration += (new Date().getTime() - pausedTime) / 1000;
            isPaused = false;
            btn.textContent = '暂停录制';
            btn.style.background = '#334155';
            dot.style.backgroundColor = '#ef4444';
            dot.style.animation = 'pulse 1.5s infinite';
            text.textContent = '脚本录制中 · 每步操作都将被记录';
          } else {
            // 触发暂停
            isPaused = true;
            pausedTime = new Date().getTime();
            btn.textContent = '继续录制';
            btn.style.background = '#059669';
            dot.style.backgroundColor = '#f59e0b';
            dot.style.animation = 'none';
            text.textContent = '脚本录制已暂停 · 当前操作不会被记录';
          }
        },
        // 停止录制回调
        () => api.stop()
      );

      // 4. 绑定点击与 hover
      container.addEventListener('click', handleClick, true);
      container.addEventListener('mouseover', handleMouseOver, true);
      container.addEventListener('mouseout', handleMouseOut, true);

      // 5. 绑定输入框专用的全套事件监听
      container.addEventListener('compositionstart', handleCompositionStart, true);
      container.addEventListener('compositionend', handleCompositionEnd, true);
      container.addEventListener('change', handleChange, true);
      container.addEventListener('blur', handleBlur, true);

      console.log("%c[Recorder] 开始录制操作（视口已下移，Shadow DOM 工具栏已挂载）...", "color: #4caf50; font-weight: bold;");
    },

    /**
     * 手动插入逻辑回调函数 (callback)
     */
    recordCallback(cbFunc) {
      if (!isRecording || isPaused) return;
      const cbOffset = getOffset();
      scriptTasks.push({
        offset: cbOffset,
        callback: cbFunc
      });
      lastEventOffset = cbOffset;
    },

    stop() {
      if (!isRecording) return scriptTasks;

      // 扫描当前页面上处于焦点的输入框，记录最终未提交的文本
      if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        commitInputValue(document.activeElement);
      }

      isRecording = false;
      isPaused = false;

      if (hoverTimer) clearTimeout(hoverTimer);

      // 解绑所有事件
      container.removeEventListener('click', handleClick, true);
      container.removeEventListener('mouseover', handleMouseOver, true);
      container.removeEventListener('mouseout', handleMouseOut, true);

      container.removeEventListener('compositionstart', handleCompositionStart, true);
      container.removeEventListener('compositionend', handleCompositionEnd, true);
      container.removeEventListener('change', handleChange, true);
      container.removeEventListener('blur', handleBlur, true);

      // 清除 UI、还原视口平移与根元素高度
      removeRecorderUI();

      // 最终指令按时间升序排列
      scriptTasks.sort((a, b) => a.offset - b.offset);

      console.log("%c[Recorder] 录制完成：", "color: #2196f3; font-weight: bold;", scriptTasks);

      // 导出并下载 JSON 文件
      downloadScriptPlayer(scriptTasks, `script_task_${new Date().getTime()}.json`);

      return scriptTasks;
    },

    getScript() {
      return scriptTasks.sort((a, b) => a.offset - b.offset);
    }
  };

  return api;
};

webCpu.createToolbar = function (container = document.body, menuData = [], options = {}) {

  // =====================================================
  // 1. 参数校验
  // =====================================================

  if (!(container instanceof HTMLElement)) {
    throw new Error('[Toolbar] container 必须是 HTMLElement');
  }

  if (!Array.isArray(menuData)) {
    throw new Error('[Toolbar] menuData 必须是 Array');
  }

  // 最多 3 个一级菜单
  const menus = menuData.slice(0, 3);

  const config = Object.assign({

    // Toolbar 高度
    height: 42,

    // z-index
    zIndex: 2147483647,

    // 默认位置
    position: 'top',

    // 是否自动隐藏
    autoHide: false,

    // Toolbar 是否占据容器布局空间
    overlay: true,

    // 自定义 class，仅作用于 host
    className: '',

    // Toolbar 标题
    title: '',

    /**
     * 所有业务事件统一从这里出去
     *
     * action：
     *
     * {
     *   type: 'click',
     *   key: 'save',
     *   value: undefined,
     *   item: {...}
     * }
     */
    onAction: null

  }, options);

  // =====================================================
  // 2. 内部状态
  // =====================================================

  let host = null;
  let shadow = null;

  // 保存 input
  const inputMap = new Map();

  // 保存一级菜单 DOM
  const menuElementMap = new Map();

  // =====================================================
  // 3. 创建 Shadow DOM Host
  // =====================================================

  host = document.createElement('div');

  host.className = config.className || '';

  host.setAttribute(
    'data-toolbar',
    'true'
  );

  host.style.cssText = `
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: ${config.height}px;
    z-index: ${config.zIndex};
    pointer-events: auto;
    box-sizing: border-box;
  `;

  if (config.position === 'bottom') {
    host.style.top = 'auto';
    host.style.bottom = '0';
  }

  shadow = host.attachShadow({
    mode: 'open'
  });

  // =====================================================
  // 4. Shadow DOM CSS
  // =====================================================

  const style = document.createElement('style');

  style.textContent = `
    :host {
      display: block;

      width: 100%;
      height: 100%;

      font-family:
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        Roboto,
        "Helvetica Neue",
        Arial,
        sans-serif;

      font-size: 13px;
      line-height: 1;

      color: #334155;

      box-sizing: border-box;
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    button,
    input {
      font-family: inherit;
    }

    /* ===================================================
       Toolbar
       =================================================== */

    .toolbar {
      width: 100%;
      height: 100%;

      display: flex;
      align-items: center;

      padding: 0 10px;

      background: rgba(255, 255, 255, 0.96);

      border-bottom: 1px solid #e2e8f0;

      box-shadow:
        0 2px 8px rgba(15, 23, 42, 0.08);

      backdrop-filter: blur(10px);

      user-select: none;
    }

    .toolbar-items {
      height: 100%;

      display: flex;
      align-items: center;

      gap: 6px;
    }

    /* ===================================================
       普通按钮
       =================================================== */

    .toolbar-button {
      height: 30px;
      min-width: 34px;

      display: inline-flex;
      align-items: center;
      justify-content: center;

      gap: 5px;

      padding: 0 10px;

      border: 1px solid transparent;

      border-radius: 5px;

      background: transparent;

      color: #334155;

      font-size: 13px;
      line-height: 1;

      cursor: pointer;

      outline: none;

      transition:
        background 0.15s ease,
        border-color 0.15s ease,
        color 0.15s ease;
    }

    .toolbar-button:hover {
      background: #f1f5f9;
      border-color: #e2e8f0;
    }

    .toolbar-button:active {
      background: #e2e8f0;
    }

    .toolbar-button.active {
      background: #e2e8f0;
      border-color: #cbd5e1;
    }

    .toolbar-button.disabled {
      opacity: 0.45;
      pointer-events: none;
      cursor: default;
    }

    /* ===================================================
       Icon
       =================================================== */

    .toolbar-icon {
      width: 16px;
      height: 16px;

      display: inline-flex;
      align-items: center;
      justify-content: center;

      flex: 0 0 auto;

      font-size: 14px;

      line-height: 1;
    }

    .toolbar-label {
      white-space: nowrap;
    }

    /* ===================================================
       Dropdown
       =================================================== */

    .dropdown {
      position: relative;

      height: 100%;

      display: flex;
      align-items: center;
    }

    .dropdown-trigger {
      height: 30px;
    }

    .dropdown-arrow {
      margin-left: 2px;

      font-size: 9px;

      opacity: 0.55;

      transition:
        transform 0.15s ease;
    }

    .dropdown.open .dropdown-arrow {
      transform: rotate(180deg);
    }

    .dropdown-menu {
      position: absolute;

      left: 0;
      top: calc(100% - 3px);

      min-width: 150px;

      max-height: 320px;

      overflow-y: auto;

      padding: 5px;

      background: #ffffff;

      border: 1px solid #e2e8f0;

      border-radius: 7px;

      box-shadow:
        0 8px 24px rgba(15, 23, 42, 0.14);

      display: none;

      z-index: 999999;

      animation:
        toolbarDropdownIn
        0.12s ease;
    }

    .dropdown.open .dropdown-menu {
      display: block;
    }

    .dropdown-menu::-webkit-scrollbar {
      width: 5px;
    }

    .dropdown-menu::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 10px;
    }

    @keyframes toolbarDropdownIn {

      from {
        opacity: 0;
        transform: translateY(-3px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }

    }

    /* ===================================================
       Dropdown Item
       =================================================== */

    .dropdown-item {
      width: 100%;
      height: 32px;

      display: flex;
      align-items: center;

      padding: 0 9px;

      border: none;

      border-radius: 5px;

      background: transparent;

      color: #334155;

      font-size: 13px;

      text-align: left;

      cursor: pointer;

      outline: none;
    }

    .dropdown-item:hover {
      background: #f1f5f9;
    }

    .dropdown-item:active {
      background: #e2e8f0;
    }

    .dropdown-item.disabled {
      opacity: 0.45;
      pointer-events: none;
    }

    .dropdown-item-icon {
      width: 22px;

      height: 100%;

      display: inline-flex;

      align-items: center;

      justify-content: center;

      margin-right: 4px;

      flex: 0 0 auto;
    }

    .dropdown-item-label {
      flex: 1;

      min-width: 0;

      overflow: hidden;

      white-space: nowrap;

      text-overflow: ellipsis;
    }

    /* ===================================================
       Divider
       =================================================== */

    .toolbar-divider {
      width: 1px;

      height: 20px;

      margin: 0 3px;

      background: #e2e8f0;

      flex: 0 0 auto;
    }

    /* ===================================================
       Input + Button
       =================================================== */

    .input-button {
      height: 30px;

      display: flex;

      align-items: stretch;

      border: 1px solid #cbd5e1;

      border-radius: 5px;

      background: #ffffff;

      overflow: hidden;

      transition:
        border-color 0.15s ease,
        box-shadow 0.15s ease;
    }

    .input-button:focus-within {
      border-color: #94a3b8;

      box-shadow:
        0 0 0 2px
        rgba(148, 163, 184, 0.12);
    }

    .input-button input {
      width: 140px;

      min-width: 80px;

      height: 28px;

      padding: 0 9px;

      border: none;

      outline: none;

      background: transparent;

      color: #334155;

      font-size: 13px;

      line-height: 28px;
    }

    .input-button input::placeholder {
      color: #94a3b8;
    }

    .input-button input:disabled {
      opacity: 0.45;
    }

    .input-button-button {
      height: 28px;

      padding: 0 11px;

      border: none;

      border-left: 1px solid #e2e8f0;

      background: #f8fafc;

      color: #334155;

      font-size: 12px;

      line-height: 28px;

      white-space: nowrap;

      cursor: pointer;

      outline: none;

      transition:
        background 0.15s ease;
    }

    .input-button-button:hover {
      background: #f1f5f9;
    }

    .input-button-button:active {
      background: #e2e8f0;
    }

    .input-button-button.disabled {
      opacity: 0.45;

      pointer-events: none;
    }

    /* ===================================================
       Tooltip
       =================================================== */

    .toolbar-button[data-tooltip],
    .input-button-button[data-tooltip] {
      position: relative;
    }
  `;

  shadow.appendChild(style);

  // =====================================================
  // 5. Toolbar DOM
  // =====================================================

  const toolbar = document.createElement('div');

  toolbar.className = 'toolbar';

  if (config.title) {
    toolbar.title = config.title;
  }

  const toolbarItems = document.createElement('div');

  toolbarItems.className = 'toolbar-items';

  toolbar.appendChild(toolbarItems);

  shadow.appendChild(toolbar);

  // =====================================================
  // 6. 统一事件派发
  // =====================================================

  function emitAction(action) {

    if (typeof config.onAction === 'function') {
      config.onAction(action);
    }

  }

  // =====================================================
  // 7. 创建 Icon
  // =====================================================

  function createIcon(icon) {

    if (
      icon === undefined ||
      icon === null ||
      icon === ''
    ) {
      return null;
    }

    const element = document.createElement('span');

    element.className = 'toolbar-icon';

    element.textContent = String(icon);

    return element;
  }

  // =====================================================
  // 8. 设置 disabled
  // =====================================================

  function setElementDisabled(element, disabled) {

    if (!element) {
      return;
    }

    if (disabled) {

      element.classList.add('disabled');

      element.setAttribute(
        'aria-disabled',
        'true'
      );

    } else {

      element.classList.remove('disabled');

      element.removeAttribute(
        'aria-disabled'
      );

    }

  }

  // =====================================================
  // 9. 普通按钮
  // =====================================================

  function createButton(item) {

    const button = document.createElement('button');

    button.type = 'button';

    button.className = 'toolbar-button';

    button.dataset.key = item.key || '';

    if (item.tooltip) {
      button.dataset.tooltip = item.tooltip;
      button.title = item.tooltip;
    }

    const icon = createIcon(item.icon);

    if (icon) {
      button.appendChild(icon);
    }

    const label = document.createElement('span');

    label.className = 'toolbar-label';

    label.textContent =
      item.label === undefined
        ? ''
        : String(item.label);

    button.appendChild(label);

    if (item.disabled) {
      setElementDisabled(button, true);
    }

    if (item.active) {
      button.classList.add('active');
    }

    button.addEventListener('click', function (event) {

      event.stopPropagation();

      if (item.disabled) {
        return;
      }

      emitAction({

        type: 'click',

        key: item.key,

        value:
          item.value !== undefined
            ? item.value
            : undefined,

        item: item,

        event: event,

        element: button

      });

    });

    return button;
  }

  // =====================================================
  // 10. Dropdown
  // =====================================================

  function createDropdown(item) {

    const wrapper = document.createElement('div');

    wrapper.className = 'dropdown';

    wrapper.dataset.key = item.key || '';

    const trigger = document.createElement('button');

    trigger.type = 'button';

    trigger.className =
      'toolbar-button dropdown-trigger';

    if (item.tooltip) {
      trigger.title = item.tooltip;
    }

    const icon = createIcon(item.icon);

    if (icon) {
      trigger.appendChild(icon);
    }

    const label = document.createElement('span');

    label.className = 'toolbar-label';

    label.textContent =
      item.label === undefined
        ? ''
        : String(item.label);

    trigger.appendChild(label);

    const arrow = document.createElement('span');

    arrow.className = 'dropdown-arrow';

    arrow.textContent = '▼';

    trigger.appendChild(arrow);

    const dropdownMenu = document.createElement('div');

    dropdownMenu.className = 'dropdown-menu';

    const children = Array.isArray(item.children)
      ? item.children
      : [];

    children.forEach(function (child) {

      const childElement =
        createDropdownItem(item, child);

      if (childElement) {
        dropdownMenu.appendChild(childElement);
      }

    });

    // ---------------------------------------------------
    // 点击一级菜单
    // ---------------------------------------------------

    trigger.addEventListener(
      'click',
      function (event) {

        event.stopPropagation();

        if (item.disabled) {
          return;
        }

        // 关闭其它 Dropdown
        shadow
          .querySelectorAll('.dropdown.open')
          .forEach(function (dropdown) {

            if (dropdown !== wrapper) {
              dropdown.classList.remove('open');
            }

          });

        const isOpen =
          wrapper.classList.toggle('open');

        emitAction({

          type: isOpen
            ? 'open'
            : 'close',

          key: item.key,

          item: item,

          event: event,

          element: wrapper

        });

      }
    );

    wrapper.appendChild(trigger);

    wrapper.appendChild(dropdownMenu);

    if (item.disabled) {
      setElementDisabled(trigger, true);
    }

    return wrapper;
  }

  // =====================================================
  // 11. Dropdown 子菜单
  // =====================================================

  function createDropdownItem(parent, child) {

    if (!child || typeof child !== 'object') {
      return null;
    }

    const button = document.createElement('button');

    button.type = 'button';

    button.className = 'dropdown-item';

    button.dataset.key =
      child.key || '';

    if (child.tooltip) {
      button.title = child.tooltip;
    }

    const icon = createIcon(child.icon);

    if (icon) {

      icon.className =
        'dropdown-item-icon';

      button.appendChild(icon);

    }

    const label = document.createElement('span');

    label.className =
      'dropdown-item-label';

    label.textContent =
      child.label === undefined
        ? ''
        : String(child.label);

    button.appendChild(label);

    if (child.disabled) {
      setElementDisabled(button, true);
    }

    button.addEventListener(
      'click',
      function (event) {

        event.stopPropagation();

        if (child.disabled) {
          return;
        }

        // 关闭父菜单
        const dropdown =
          button.closest('.dropdown');

        if (dropdown) {
          dropdown.classList.remove('open');
        }

        emitAction({

          type: 'select',

          key: child.key,

          parentKey: parent.key,

          value:
            child.value !== undefined
              ? child.value
              : undefined,

          item: child,

          parent: parent,

          event: event,

          element: button

        });

      }
    );

    return button;
  }

  // =====================================================
  // 12. 组合输入框 + 按钮
  // =====================================================

  function createInputButton(item) {

    const wrapper = document.createElement('div');

    wrapper.className = 'input-button';

    wrapper.dataset.key =
      item.key || '';

    const input = document.createElement('input');

    input.type =
      item.inputType || 'text';

    input.placeholder =
      item.placeholder || '';

    input.value =
      item.value === undefined ||
        item.value === null
        ? ''
        : String(item.value);

    if (item.maxLength) {
      input.maxLength =
        Number(item.maxLength);
    }

    if (item.disabled) {
      input.disabled = true;
    }

    const button =
      document.createElement('button');

    button.type = 'button';

    button.className =
      'input-button-button';

    button.textContent =
      item.buttonText || '确定';

    if (item.tooltip) {
      button.title = item.tooltip;
    }

    if (item.disabled) {
      setElementDisabled(
        button,
        true
      );
    }

    // 保存 input 引用
    inputMap.set(
      item.key,
      input
    );

    // ---------------------------------------------------
    // 输入事件
    // ---------------------------------------------------

    input.addEventListener(
      'input',
      function (event) {

        emitAction({

          type: 'input',

          key: item.key,

          value: input.value,

          item: item,

          event: event,

          element: input

        });

      }
    );

    // ---------------------------------------------------
    // Enter
    // ---------------------------------------------------

    input.addEventListener(
      'keydown',
      function (event) {

        if (event.key !== 'Enter') {
          return;
        }

        event.preventDefault();

        if (item.disabled) {
          return;
        }

        emitAction({

          type: 'submit',

          key: item.key,

          value: input.value,

          item: item,

          event: event,

          input: input,

          button: button,

          element: wrapper

        });

      }
    );

    // ---------------------------------------------------
    // 按钮
    // ---------------------------------------------------

    button.addEventListener(
      'click',
      function (event) {

        event.stopPropagation();

        if (item.disabled) {
          return;
        }

        emitAction({

          type: 'submit',

          key: item.key,

          value: input.value,

          item: item,

          event: event,

          input: input,

          button: button,

          element: wrapper

        });

      }
    );

    wrapper.appendChild(input);

    wrapper.appendChild(button);

    return wrapper;
  }

  // =====================================================
  // 13. 创建一级菜单
  // =====================================================

  function createMenuItem(item, index) {

    if (!item || typeof item !== 'object') {
      return null;
    }

    let element = null;

    switch (item.type) {

      case 'button':

        element =
          createButton(item);

        break;

      case 'dropdown':

        element =
          createDropdown(item);

        break;

      case 'input-button':
      case 'inputButton':
      case 'input':

        element =
          createInputButton(item);

        break;

      case 'divider':

        element =
          document.createElement('div');

        element.className =
          'toolbar-divider';

        break;

      default:

        // 默认作为 button
        element =
          createButton(item);

        break;

    }

    if (element && item.key) {

      menuElementMap.set(
        item.key,
        element
      );

    }

    return element;
  }

  // =====================================================
  // 14. 渲染一级菜单
  // =====================================================

  menus.forEach(function (item, index) {

    const element =
      createMenuItem(item, index);

    if (!element) {
      return;
    }

    toolbarItems.appendChild(
      element
    );

  });

  // =====================================================
  // 15. 点击 Toolbar 外部关闭菜单
  // =====================================================

  function handleDocumentClick(event) {

    if (!host) {
      return;
    }

    // Shadow DOM 内部点击不处理
    if (event.composedPath) {

      const path =
        event.composedPath();

      if (path.includes(host)) {
        return;
      }

    }

    shadow
      .querySelectorAll('.dropdown.open')
      .forEach(function (dropdown) {

        dropdown.classList.remove(
          'open'
        );

      });

  }

  document.addEventListener(
    'click',
    handleDocumentClick,
    true
  );

  // =====================================================
  // 16. 确保 container 可以定位
  // =====================================================

  const computedStyle =
    window.getComputedStyle(container);

  const originalPosition =
    container.style.position;

  if (
    computedStyle.position === 'static'
  ) {

    container.style.position =
      'relative';

  }

  // =====================================================
  // 17. overlay 模式
  // =====================================================

  if (!config.overlay) {

    if (
      config.position === 'top'
    ) {

      container.style.paddingTop =
        `${config.height}px`;

    } else {

      container.style.paddingBottom =
        `${config.height}px`;

    }

  }

  // =====================================================
  // 18. 挂载
  // =====================================================

  container.appendChild(host);

  // =====================================================
  // 19. Toolbar API
  // =====================================================

  const api = {

    /**
     * Toolbar DOM
     */
    element: host,

    /**
     * Shadow DOM
     */
    shadow: shadow,

    /**
     * 显示 Toolbar
     */
    show() {

      if (host) {
        host.style.display =
          'block';
      }

    },

    /**
     * 隐藏 Toolbar
     */
    hide() {

      if (host) {
        host.style.display =
          'none';
      }

    },

    /**
     * 获取 input 值
     */
    getValue(key) {

      const input =
        inputMap.get(key);

      return input
        ? input.value
        : undefined;

    },

    /**
     * 设置 input 值
     */
    setValue(key, value) {

      const input =
        inputMap.get(key);

      if (!input) {
        return;
      }

      input.value =
        value === undefined ||
          value === null
          ? ''
          : String(value);

    },

    /**
     * 设置菜单 disabled
     */
    setDisabled(key, disabled) {

      const element =
        menuElementMap.get(key);

      if (!element) {
        return;
      }

      if (
        element.classList.contains(
          'input-button'
        )
      ) {

        const input =
          element.querySelector(
            'input'
          );

        const button =
          element.querySelector(
            'button'
          );

        if (input) {
          input.disabled =
            !!disabled;
        }

        setElementDisabled(
          button,
          !!disabled
        );

      } else {

        const button =
          element.querySelector(
            'button'
          ) || element;

        setElementDisabled(
          button,
          !!disabled
        );

      }

    },

    /**
     * 设置普通按钮 active
     */
    setActive(key, active) {

      const element =
        menuElementMap.get(key);

      if (!element) {
        return;
      }

      const button =
        element.classList.contains(
          'toolbar-button'
        )
          ? element
          : element.querySelector(
            '.toolbar-button'
          );

      if (!button) {
        return;
      }

      if (active) {
        button.classList.add(
          'active'
        );
      } else {
        button.classList.remove(
          'active'
        );
      }

    },

    /**
     * 打开指定下拉菜单
     */
    open(key) {

      const element =
        menuElementMap.get(key);

      if (!element) {
        return;
      }

      shadow
        .querySelectorAll(
          '.dropdown.open'
        )
        .forEach(function (dropdown) {

          dropdown.classList.remove(
            'open'
          );

        });

      if (
        element.classList.contains(
          'dropdown'
        )
      ) {

        element.classList.add(
          'open'
        );

      }

    },

    /**
     * 关闭所有下拉菜单
     */
    closeAll() {

      shadow
        .querySelectorAll(
          '.dropdown.open'
        )
        .forEach(function (dropdown) {

          dropdown.classList.remove(
            'open'
          );

        });

    },

    /**
     * 销毁 Toolbar
     */
    destroy() {

      document.removeEventListener(
        'click',
        handleDocumentClick,
        true
      );

      if (!config.overlay) {

        if (
          config.position === 'top'
        ) {

          container.style.paddingTop =
            '';

        } else {

          container.style.paddingBottom =
            '';

        }

      }

      if (
        container.style.position ===
        'relative' &&
        originalPosition === ''
      ) {

        container.style.position =
          '';

      }

      inputMap.clear();
      menuElementMap.clear();

      if (host) {
        host.remove();
      }

      host = null;
      shadow = null;

    }

  };

  return api;
}

// 4. 初始加载逻辑：URL 包含脚本则执行，否则根据 record 状态启动录制
if (_config.aScript) {
  webCpu.executeScript(_config.aScript, _config.scriptKey);
} else if (_config.recordScript === "true") {
  // 初始化录制器
  webCpu.scriptRecorder = webCpu.createScriptRecorder(document.body, {
    autoAttention: true,      // 自动在操作前添加高亮效果
    attentionType: 'showAttention', // 可选 'showAttention' 或 'addAnimation'
    hoverDelay: 1000          // 悬停 1 秒才判定为 hover
  });
  webCpu.scriptRecorder.start();
}


if (_config.recordVideo === "true") {
  WebTool.startScreenRecording(
    {
      duration: _config.maxDuration,
      countdown: _config.countdown,
    },
    (recorder, stream) => {
      console.log("倒计时结束，录制即将开始！");
      // this.updateView(elem, app); // 注意：箭头函数没有自己的 this，如需使用外部 this 请确认上下文
      // 这里可以播放提示音、闪烁UI等
    },
    (videoBlob) => {
      console.log("录制结束，可以处理 videoBlob");
      // 结束处理...
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "recorded-video.webm";
      a.click();
      setTimeout(function () {
        window.URL.revokeObjectURL(url);
        a.remove();
      }, 2000);
    }
  );
}

// 5. 新增功能：监听 iframe 外部发来的 message 数据并执行
window.addEventListener("message", (event) => {
  // 安全校验：仅接受同源（或显式配置的可信源）发来的消息，防止跨域脚本注入
  const trustedOrigins = [
    window.location.origin,
    ...(webCpu && Array.isArray(webCpu.config && webCpu.config.trustedOrigins)
      ? webCpu.config.trustedOrigins
      : []),
  ];
  if (trustedOrigins.indexOf(event.origin) === -1) {
    return;
  }

  const data = event.data || {};

  // 约定通过 action 字段来识别执行脚本的消息
  if (data.action === "EXECUTE_SCRIPT" && data.scriptData) {
    console.log("Iframe received script from parent, executing...");
    localStorage.transwebScript = JSON.stringify(data.scriptData);
    webCpu.executeScript(data.scriptData, "");
  }
});
