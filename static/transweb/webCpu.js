/*! webCpu.js 2017-11-26 20:19:15 */
var WebAdapter = {};
WebAdapter.load = function (url, callback) {
  var script = document.createElement('script');
  script.setAttribute('src', url);
  script.setAttribute('charset', "utf-8");
  script.setAttribute("type", "text/javascript");
  if (script.readyState) {
    WebTool.bind(script, "readystatechange", function () {
      if (script.readyState === "loaded" || script.readyState === "complete") {
        if (typeof (callback) === "function") {
          callback();
        }
      }
    });
  } else {
    WebTool.bind(script, "load", function () {
      if (typeof (callback) === "function") {
        callback();
      }
    });
  }
  var _head = document.getElementsByTagName("head")[0];
  _head.appendChild(script);
  return script;
}

WebAdapter.jsonp = function (url, run) {
  var callBack = 'webAdapter_callBack_' + (new Date()).getTime();
  if (typeof (run) === "function") {
    window[callBack] = run;
  } else {
    window[callBack] = function (data) {}
  }

  if (url.indexOf("?") === -1) {
    url += "?callback=" + callBack;
  } else {
    url += "&callback=" + callBack;
  }

  var script = document.getElementById("webAdapterCallBackScript");
  if (script) {
    script.parentNode.removeChild(script);
  }
  script = document.createElement('script');
  script.id = "webAdapterCallBackScript";
  if (url.search(/\(function/) === 0) {
    script.innerHTML = url;
  } else {
    script.setAttribute('src', url);
  }
  script.setAttribute('charset', "utf-8");
  var _head = document.getElementsByTagName("head")[0];
  _head.appendChild(script);

  if (script) {
    script.parentNode.removeChild(script);
  }
}

WebAdapter.loadCSS = function (url) {
  if (url.search("{") === -1) {
    var cssLink = document.createElement('link');
    cssLink.setAttribute('type', 'text/css');
    cssLink.setAttribute('class', "TransWebCss");
    cssLink.setAttribute('rel', 'stylesheet');
    cssLink.setAttribute('href', url);
  } else {
    var cssLink = document.createElement("style");
    cssLink.innerHTML = url;
  }
  var _head = document.getElementsByTagName("head")[0];
  _head.appendChild(cssLink);
  return cssLink;
}

WebAdapter.report = function (url, params) {
  var url = WebTool.attachParams(url, params);
  var img = document.createElement("img");
  img.src = url;
}

WebAdapter.request = function (url, type, params, callback, dataType, dsl) {
  if (!url) {
    return false;
  }
  if (type !== "_jsonp") {
    var request = new WebRequest(url, type, dataType, dsl);
    request(params, function (data) {
      if (typeof (callback) === "function") {
        callback(data);
      }
    }, dsl);
  } else {
    this.loadCardData(url, params, callback);
  }
}

WebAdapter.loadCardData = function (url, key, myCallback) {
  window[key] = function (d) {
    d.appUrl = url.split("?")[0];
    myCallback(d);
  };
  var id = MurmurHash.rule(url);
  var elem = document.getElementById(id);
  if (elem) {
    elem.parentNode.removeChild(elem);
  }
  var s = document.createElement("script");
  s.id = id;
  s.src = WebTool.attachParams(url, {
    callback: key
  });
  document.head.appendChild(s);
}

var WebRequest = function (url, type, options) {
  var type = type || "jsonp";
  if (type === "jsonp" || type === "noEcho") {
    return (new CustomInterface(url, type, options));
  } else {
    return (new AjaxInterface(url, type, options));
  }
}

var CustomInterface = function (url, type, options) {
  this.options = {};
  this.type = type || "jsonp";
  for (var k in options) {
    if (options[k] === 1) {
      this.options[k] = 1;
    }
  }
  this.url = url;
  return this.extend();
}

CustomInterface.prototype.extend = function () {
  var _this = this;
  return (function (data, func) {
    if (_this.check(_this.options, data)) {
      var url = _this.url;
      if (_this.type === "jsonp") {
        url = WebTool.attachParams(url, data);
        WebAdapter.jsonp(url, func);
      } else {
        WebAdapter.report(url, data);
      }
    }
  })
}

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
}

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
        }
        return fn;
      })();
    };
    if (typeof (callback) === "function") {
      callback(_self);
    }
  }, "json");
}
BackInterface.prototype.init = function (data) {
  this.data = data;
  for (var k in data) {
    this[k] = (function () {
      var m = data[k].method;
      var url = data[k].url;
      var fn = function (param, callback, dataType) {
        WebAdapter.request(url, m, param, callback, dataType);
      }
      return fn;
    })();
  };
}


var AjaxInterface = function (url, type, dType) {
  this.url = url;
  return this.init(type, dType);
}
AjaxInterface.prototype.init = function (type, dType) {
  this.httpObj = this.getHttpObj();
  if (this.httpObj) {
    var _this = this;

    return (function (query, callback, dsl) {
      var data = dsl;
      var url = _this.url;
      if (type.toLocaleUpperCase() === "GET") {
        url = WebTool.attachParams(url, query);
      } else {
        var data = WebTool.attachParams("", query).split("?")[1] || dsl;
      }
      _this.httpObj.onreadystatechange = function () {
        if (_this.httpObj.readyState == 4 || _this.httpObj.readyState == "complete") {
          if (typeof (callback) === "function") {
            var d = _this.httpObj.responseText;
            tData = d;
            if (dType === "json") {
              try {
                d = JSON.parse(d);
              } catch (e) {
                if (window["$"] && $.xml2json) {
                  d = $.xml2json(tData);
                }
              }
            }
            callback(d);
          }
        }
      };
      _this.httpObj.open(type, url, true);
      _this.httpObj.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
      _this.httpObj.send(data);
    });
  }
}

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
}
var ViewControl = function (config, callback, mission) {
  this.config = config;
  if (typeof (callback) === "function") {
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
}

ViewControl.prototype.initTask = function (task) {
  if (typeof (task) === "string") {
    task = {
      container: document.getElementById(task)
    };
  } else if (typeof (task) === "function") {
    task = {
      promise: {
        afterRender: task
      }
    };
  } else if (!!task && task.nodeName) {
    task = {
      container: task
    };
  } else if (!!task && typeof (task.container) === "string") {
    task.container = document.getElementById(task.container);
  } else {}

  task.className = this.config.name;
  return task;
}

ViewControl.prototype.initConfig = function () {
  if (this.config) {
    //init component elements;
    this.html = "";
    this.css = {};
    this.script = {};
    //Set script status
    this.sStatus = 0;
    if (typeof (this.config.script) === "string") {
      if (this.config.name !== "main") {
        this.config.script = this.getPath(this.config.script);
      }
      this.sStatus = 1;
    } else if (typeof (this.config.script) === "object") {
      for (var i in this.config.script) {
        this.sStatus++;
        if (this.config.name !== "main") {
          this.config.script[i] = this.getPath(this.config.script[i]);
        }
      }
    }
    //set html status
    this.hStatus = 0;
    if (typeof (this.config.html) === "string" && (this.config.html.search('<') === -1)) {
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
}

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
}

ViewControl.prototype.render = function (task) {
  //update the task state
  var task = this.initTask(task);
  if (task && task.url && typeof (task.url) === "string") {
    this.updateFromRemote(task);
  } else {
    this.update(task);
  }
}

ViewControl.prototype.updateFromRemote = function (task) {
  var _self = this;
  task.query = task.query || {};
  task.query._t = (new Date()).getTime();
  WebAdapter.request(task.url, task.requestType || "jsonp", task.query, function (data) {
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
  }, task.dsl);

}

ViewControl.prototype.update = function (task) {
  if (this.isReady()) {
    var t = task.container;
    // if (task.cardName && webCpu.CardItem && webCpu.CardItem.checkData) {
    //   var checkData = webCpu.CardItem.checkData;
    //   if (task.promise && typeof (task.promise.checkData) === "function") {
    //     checkData = task.promise.checkData;
    //   }
    //   if (typeof (checkData) === "function" && webCpu.cards[task.cardName] && webCpu.cards[task.cardName].task.url) {
    //     var ret = checkData(task.data)
    //     if (!ret && webCpu && webCpu.cards && webCpu.cards[task.cardName]) {
    //       webCpu["CardItem"].switchState(webCpu.cards[task.cardName], "empty");
    //       if (!webCpu.layout || (webCpu.layout && webCpu.layout.mode !== "edit")) {
    //         webCpu["CardItem"].dismissMask(webCpu.cards[task.cardName]);
    //       }
    //       return false;
    //     }
    //   }
    // }

    // try {
    if (task.promise && typeof (task.promise.beforeRender) === "function") {
      if (task.cardName) {
        console.log("start beforeRender of task[%1]".replace("%1", task.cardName));
      }
      task.promise.beforeRender(t, task.data, task);
    }
    var tData = null;
    if (task.option && task.option.filter && task.option.filter.key && task.data.constructor.name === "Array") {
      tData = [];
      var key = task.option.filter.key;
      var value = task.option.filter.value;
      for (var i = 0; i < task.data.length; i++) {
        if (task.data[i][key] === value || value === "_all") {
          tData.push(task.data[i]);
        }
      }
    }
    this.updateView(task, tData);


    // } catch (e) {
    //   if (task.cardName) {
    //     console.log("error of task[%1]: ".replace("%1", task.cardName) + e.message);
    //     if (webCpu && webCpu.CardItem && webCpu.cards && webCpu.cards[task.cardName]) {
    //       webCpu.CardItem.switchMask(webCpu.cards[task.cardName], "error", e.message);
    //     }
    //   } else {
    //     console.log("error: " + e);
    //     webCpu.CardItem.switchMask(webCpu.cards["transweb"], "html", e.message);
    //   }
    // }

    if (window.webCpu && webCpu.CardItem && task.cardName) {
      for (var k in task.busOut) {
        webCpu.CardItem.message = webCpu.CardItem.message || {};
        webCpu.CardItem.message[k] = webCpu.CardItem.message[k] || {};

        webCpu.CardItem.message[k][task.cardName] = task.busOut[k](task.container, task.data, task);
        if (webCpu.cards[k]) {
          webCpu["CardItem"].fresh(webCpu.cards[k]);
        }
      }
      webCpu.CardItem.message[task.cardName] = {};
    }


    delete task.outerData;
  } else {
    this.mission.push(task);
  }
}


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
      width: json.labelWidth || "100%"
    }
    for (var k in style) {
      label.style[k] = style[k];
    }

    if (arr.indexOf(tag) === -1) {
      elem.appendChild(label);
    } else {
      container.prepend(label);
      label.prepend(elem);
      if(tag === "textarea" && json.props) {
        elem.innerHTML = json.props.value || ""
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
}

ViewControl.prototype.updateView = function (task, tData) {
  var t = task.container;
  tData = tData || task.data;
  if (t) {
    if (task.cardName && task.cardName !== "anonymous") {
      console.log("start main callback of task[%1]".replace("%1", task.cardName));
      if (task.cardName && webCpu["CardItem"]) {
        if (!webCpu.layout || (webCpu.layout && webCpu.layout.mode !== "edit")) {
          webCpu["CardItem"].dismissMask(task);
        }
      }
    }
    if (!task.renderType || task.renderType === "replace") {
      t.innerHTML = "";
    }

    if (!!tData && tData.constructor.name === "Array" && task.taskType === "multi") {
      for (var i = 0; i < tData.length; i++) {
        var temp = this.initDom(tData[i], t, task);
        if (typeof (this.callback) === "function") {
          this.callback(temp, tData[i], task);
        }
      }
    } else {
      var temp = this.initDom(tData, t, task);
      if (typeof (this.callback) === "function") {
        this.callback(temp, tData, task);
      }
    }
  } else {

    if (typeof (this.callback) === "function") {
      this.callback(t, tData, task);
    }
  }

  if (task.option && task.footArea && webCpu.CardItem && webCpu.CardItem.Pagination && task.option.page) {
    var page = task.option.page;
    if (typeof (task.option.pageFilter) === "function") {
      page = task.option.pageFilter(page);
    }

    task.pageCallback = task.pageCallback || function (n, size) {
      this.query = this.query || {};
      this.query.currentPage = n - 1;
      this.query.pageSize = size || 10;
      webCpu.render("DataTable", this);
    }

    if (page && page.total) {
      task.pagination = new webCpu.CardItem.Pagination(task.footArea, page.total, page.size, page.current, function (n, size) {
        task.pageCallback(n, size);
      });
    }
  }


  if (task.promise && typeof (task.promise.afterRender) === "function") {
    if (task.cardName) {
      console.log("start afterRender of task[%1]".replace("%1", task.cardName || "anonymous"));
    }

    task.promise.afterRender(task.container, tData, task);
  }

  if (task.promise && typeof (task.promise.afterRenderCard) === "function") {
    task.promise.afterRenderCard(task.container, tData, task);
    delete task.promise.afterRenderCard;
  }

}

ViewControl.prototype.execute = function () {
  if (this.isReady()) {
    for (var key in this.mission) {
      this.mission[key] = this.initTask(this.mission[key]);
      this.mission[key] && this.render(this.mission[key]);
    }
  }
}

ViewControl.prototype.initDom = function (obj, container, task) {
  var t = document.createElement("div");
  task.style = task.style || {};
  task.style.width = task.style.width || "100%";
  task.style.height = task.style.height || "100%";
  task.style.relative = task.style.relative || "relative";
  try {
    for (var k in task.style) {
      $(t).css(k, task.style[k]);
      if (k === "maxWidth" || k === "maxHeight") {
        $(t).css(k.split("-")[1], "100%");
      }
    }
  } catch (e) {
    var style = "width: 1%; height: 2%; position: 3%;";
    style = style.replace("1%", task.style.width);
    style = style.replace("2%", task.style.height);
    style = style.replace("3%", task.style.relative);
    t.setAttribute("style", style);
  }

  t.setAttribute("class", this.config.name + " " + "_task_container");
  t.innerHTML = this.html.innerHTML.bindData(obj, task.filter);
  if (container && typeof (container.appendChild) === "function") {
    container.appendChild(t);
  }
  return t;
}

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
}

ViewControl.prototype.prepareScript = function () {
  if (typeof (this.config.script) === "string" && !this.script[0]) {
    this.script[0] = this.loadScript(this.config.script);
  } else if (typeof (this.config.script) === "object") {
    for (var k in this.config.script) {
      this.script[k] = this.script[k] || this.loadScript(this.config.script[k]);
    }
  }
}

ViewControl.prototype.prepareCss = function () {
  if (typeof (this.config.css) === "string" && !this.css[0]) {
    if (this.config.css.search("{") === -1) {
      if (this.config.name !== "main") {
        this.config.css = this.getPath(this.config.css);
      }
    }
    this.css[0] = this.loadCSS(this.config.css);
  } else if (typeof (this.config.css) === "object") {
    for (var k in this.config.css) {
      if (this.config.css[k].search("{") === -1 && this.config.path) {
        if (this.config.name !== "main") {
          this.config.css[k] = this.getPath(this.config.css[k]);
        }
      }
      this.css[k] = this.css[k] || this.loadCSS(this.config.css[k]);
    }
  }
}

ViewControl.prototype.getPath = function (str) {
  if (this.config && this.config.path && this.config.name) {
    return this.config.path + '/' + this.config.name + '/' + str;
  } else if (this.config && this.config.name) {
    return this.config.name + '/' + str;
  } else {
    return str;
  }
}

ViewControl.prototype.prepareHtml = function () {
  var _this = this;
  this.htmlFetch({}, function (str) {
    _this.hStatus--;
    _this.html = document.createElement("div");
    _this.html.innerHTML = str;
    _this.execute();
  });
  console.log("loading html[" + this.config.html + "]...");
}

ViewControl.prototype.loadScript = function (url) {
  var _self = this;
  //判断URL是否为script code
  var tUrl = url.replace(/\s+/g, "");
  if (tUrl.search(/\(function/) === 0) {
    setTimeout(function () {
      (new Function("return " + url))();
      _self.sStatus--;
      _self.execute();
    }, 200);
    var script = tUrl;
  } else {
    var scriptId = MurmurHash.rule(url, 31);
    var script = document.getElementById(scriptId);
    if (script) {
      script.parentNode.removeChild(script);
    }
    script = WebAdapter.load(url, function () {
      _self.sStatus--;
      _self.execute();
    });
    script.setAttribute('id', scriptId);
  }
  console.log("loading script[" + url + "]...");
  return script;
}

ViewControl.prototype.loadCSS = function (url) {
  var cssId = MurmurHash.rule(url, 31);
  var cssLink = document.getElementById(cssId);
  if (!cssLink) {
    cssLink = WebAdapter.loadCSS(url);
  }
  cssLink.setAttribute('id', cssId);
  return cssLink;
}

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
    o[0] += (m[0] * n[3]) + (m[1] * n[2]) + (m[2] * n[1]) + (m[3] * n[0]);
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
      return [(m[0] << n) | (m[1] >>> (32 - n)), (m[1] << n) | (m[0] >>> (32 - n))];
    } else {
      n -= 32;
      return [(m[1] << n) | (m[0] >>> (32 - n)), (m[0] << n) | (m[1] >>> (32 - n))];
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
      k1 = [((key.charCodeAt(i + 4) & 0xff)) | ((key.charCodeAt(i + 5) & 0xff) << 8) | ((key.charCodeAt(i + 6) & 0xff) << 16) | ((key.charCodeAt(i + 7) & 0xff) << 24), ((key.charCodeAt(i) & 0xff)) | ((key.charCodeAt(i + 1) & 0xff) << 8) | ((key.charCodeAt(i + 2) & 0xff) << 16) | ((key.charCodeAt(i + 3) & 0xff) << 24)];
      k2 = [((key.charCodeAt(i + 12) & 0xff)) | ((key.charCodeAt(i + 13) & 0xff) << 8) | ((key.charCodeAt(i + 14) & 0xff) << 16) | ((key.charCodeAt(i + 15) & 0xff) << 24), ((key.charCodeAt(i + 8) & 0xff)) | ((key.charCodeAt(i + 9) & 0xff) << 8) | ((key.charCodeAt(i + 10) & 0xff) << 16) | ((key.charCodeAt(i + 11) & 0xff) << 24)];
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
        k2 = this.x64Xor(k2, this.x64LeftShift([0, key.charCodeAt(i + 14)], 48));
      case 14:
        k2 = this.x64Xor(k2, this.x64LeftShift([0, key.charCodeAt(i + 13)], 40));
      case 13:
        k2 = this.x64Xor(k2, this.x64LeftShift([0, key.charCodeAt(i + 12)], 32));
      case 12:
        k2 = this.x64Xor(k2, this.x64LeftShift([0, key.charCodeAt(i + 11)], 24));
      case 11:
        k2 = this.x64Xor(k2, this.x64LeftShift([0, key.charCodeAt(i + 10)], 16));
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
    return ("00000000" + (h1[0] >>> 0).toString(16)).slice(-8) + ("00000000" + (h1[1] >>> 0).toString(16)).slice(-8) + ("00000000" + (h2[0] >>> 0).toString(16)).slice(-8) + ("00000000" + (h2[1] >>> 0).toString(16)).slice(-8);
  }
}

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
          community: _self.community
        });
      }
      if (typeof (callback) === "function") {
        callback(_self.id);
      }
      //ID有效期100年（第一方cookie）
      WebTool.cookie(_self.community, _self.id, 365 * 100);

      //收集传播路径
      _self.trackIdentity();

    });
  } else {
    if (typeof (callback) === "function") {
      callback(this.id);
    }
    //ID有效期100年
    WebTool.cookie(this.community, this.id, 365 * 100);

    this.setCacheParams(this.url, {
      id: this.id,
      community: this.community
    });

    //收集传播路径
    this.trackIdentity();

  }
}
NetIdentity.track = 0;

NetIdentity.prototype.trackIdentity = function () {
  try {
    this.fp = MurmurHash.rule(this.getCanvasFp() + navigator.userAgent);
  } catch (e) {
    this.fp = "";
  }
  var _self = this;
  if (typeof (this.track) === "string" && NetIdentity.track === 0) {
    var hash = location.hash;
    var id = decodeURIComponent(this.urlQuery(hash, this.community));
    var tParam = {
      infector: id,
      hash: WebTool.pageHash(location.href),
      refer: document.referrer,
      fp: _self.fp
    };
    // tParam[this.community] = this.id;

    if (id && id !== "null") {
      WebAdapter.report(WebTool.attachParams(this.track, tParam));
      if (this.id != id) {
        location.hash = hash.replace(encodeURIComponent(id), encodeURIComponent(this.id));
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
}

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
  result.push("canvas winding:" + ((ctx.isPointInPath(5, 5, "evenodd") === false) ? "yes" : "no"));

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
}

NetIdentity.prototype.urlQuery = function (url, key) {
  if (url) {
    var re = new RegExp(key + "=([^\&]*)", "i");
    var a = re.exec(url);
    if (a == null) {
      return null;
    }
    return a[1];
  } else {
    return null;
  }
}

NetIdentity.prototype.rand = function (x) {
  var s = "";
  while (s.length < x && x > 0) {
    var r = Math.random();
    s += String.fromCharCode(Math.floor(r * 26) + (r > 0.5 ? 97 : 65));
  }
  return s;
}

NetIdentity.prototype.getCacheParams = function (url, callback) {
  if (!!window.postMessage) {
    this.getCacheParamsByMessage(url, callback);
  } else {
    this.getCacheParamsByName(url, callback);
  }
}

NetIdentity.prototype.getCacheParamsByMessage = function (url, callback) {
  var _self = this;
  if (window.addEventListener) {
    window.addEventListener('message', function (e) {
      if (typeof (callback) === "function") {
        _self.id = e.data["id"];
        _self.crossData = e.data;
        callback(e.data);
      }
    }, false)
  } else {
    window.attachEvent('onmessage', function (e) {
      if (typeof (callback) === "function") {
        _self.id = e.data["id"];
        _self.crossData = e.data;
        callback(e.data);
      }
    })
  }

  this.iframe = this.getBridgeIframe("_bridge_iframe");
  this.iframe.src = url;
}

NetIdentity.prototype.setCacheParams = function (url, params) {
  if (this.iframeSet) {
    this.iframeSet.parentNode.removeChild(this.iframeSet);
  }
  this.iframeSet = this.getBridgeIframe("_bridge_iframe_set");
  //使用hash值向跨域iframe传递参数
  this.iframeSet.src = WebTool.attachParams(url, params);
}

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
      if (typeof (callback) === "function") {
        callback(params);
      }
    } else if (state === 0) {
      state = 1;
      this.contentWindow.location = 'about:blank';
    }
  }
}

NetIdentity.prototype.getBridgeIframe = function (id, callback) {
  var iframe = this.iframe || document.getElementById("_bridge_iframe");
  if (iframe) {
    iframe.parentNode.removeChild(iframe);
  }
  iframe = document.createElement('iframe');
  iframe.setAttribute('allowTransparency', 'true');
  iframe.setAttribute('id', id);
  iframe.setAttribute('frameBorder', '0');
  iframe.setAttribute('scrolling', 'no');
  iframe.style.cssText = 'height:0px;width:0px;float:none;position:absolute;overflow:hidden;z-index:333333;margin:0;padding:0;border:0 none;background:none;';
  document.body.appendChild(iframe);
  iframe.onload = function () {
    if (typeof (callback) === "function") {
      callback();
    }
  }
  return iframe;
}

NetIdentity.prototype.generateId = function () {
  var href = location.href;
  var referrer = document.referrer;
  var random = this.rand(32);
  return MurmurHash.rule(this.fp + random + href + referrer + (new Date()).getTime(), 31);
}

function strToJson(str) {
  return (new Function("return " + str))();
}

var WebCpu = function (container, url, config) {
  if (container && url) {
    this.exec(container, url, config);
  }
}

WebCpu.prototype.exec = function (container, app, config) {
  this.cards = {};
  if (config) {
    config.path = config.path || this.componentPath;
    this.initModule(config, "main");
    var task = config;
    if (config.interface) {
      for (var k in config.interface) {
        task[k] = config.interface[k];
      }
    }
    task.app = app;
    var myCard = {
      className: "main",
      cardName: "_main",
      task: task
    }
    // task.container = container;
    // this.main.render(task);
    webCpu.addCardItem(container, myCard);
  } else {
    this.initWebApp(container, app);
  }
}

WebCpu.prototype.startApp = function (elem, config) {
  webCpu.componentPath = config.components || "transweb/components";
  webCpu.exec(elem, config.main, config.dependency);
}

WebCpu.prototype.initModule = function (config, name, path) {
  var _self = this;
  var callback = function (container, data, task) {
    _self.adapter = {};
    for (var k in webCpu.interface) {
      var adapter = webCpu.interface[k];
      if (adapter.flag) {
        var type = adapter.type || adapter.requestType;
        _self.adapter[k] = new WebRequest(adapter.url, type, adapter.dataType);
      }
    }
    if (typeof (config.callback) === "function") {
      config.callback(container, data, task);
    }
    if (_self.iframeProxy) {
      _self.initWithProxy(container, task.app);
    } else {
      _self.initWebApp(container, task.app);
    }
    console.log("Execed successfully");
  }
  config.path = path || config.path;
  this[name] = null;
  this.regComponent(name, config, callback);
}

WebCpu.prototype.loadPageData = function (container, url, flag, callback) {
  var _self = this;
  WebAdapter.loadCardData(url, "transweb_cn", function (data) {
    _self.renderPageData(container, data, flag, callback);
  })
}

WebCpu.prototype.renderRemoteCard = function (container, url, cardName, options, callback) {
  this.cards = this.cards || {};
  this.componentPath = options.components;
  var _self = this;
  WebAdapter.loadCardData(url, "transweb_cn", function (data) {
    _self._renderPageData(container, data.cardData, cardName, callback);
  });
}

WebCpu.prototype._renderPageData = function (container, cardData, cardName, callback) {
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
}

WebCpu.prototype.renderPageData = function (container, data, flag, callback) {
  if (data.options && data.options.width && data.options.height) {
    this.layout = new LayoutEngine(container, flag, data.options, data.cardData, callback);
  } else if (data.options) {
    var enter = data.options || "main";
    if (typeof (enter) !== "string") {
      enter = "main";
    }
    this._renderPageData(container, data.cardData, enter, callback);
  } else {
    this.addCardItem(container, data, "replace", callback);
  }
}

WebCpu.prototype.excuteSingleTask = function (elem, path, cards) {
  var component = elem.getAttribute("component");
  var taskName = elem.getAttribute("task");
  var cardName = elem.getAttribute("cardName");
  var taskPath = elem.getAttribute("path") || path;
  if (!component) {
    return false;
  }
  if (component === "CardItem" && cardName) {
    cards = cards || this.cards;
    var cItem = cards[cardName] || this.cards[cardName] || {};
    if (cItem.url) {
      this.addCardItem(elem, cItem.url, {
        key: cItem.key,
        interface: cItem.interface,
        callback: function (c, d, t) {
          d.cardName = cardName;
          if (typeof (cItem.callback) === "function") {
            cItem.callback(c, d, t);
          }
        }
      });
    } else if (cItem.task) {
      cItem.cardName = cardName;
      this.addCardItem(elem, cItem);
    } else {}
  } else if (this.tasks && this.tasks[component] && this.tasks[component][taskName]) {
    var task = this.tasks[component][taskName];
    task.container = elem;
    this.render(component, task, taskPath);
  } else {

  }
}

WebCpu.prototype.addCardItem = function (container, cardData, options, callback) {
  var options = options || {};
  if (typeof (options) === "string") {
    options = {
      key: options
    };
  } else if (typeof (options) === "function") {
    options = {
      callback: options
    };
  } else {}
  var task = this.transferCardData(container, cardData, options, callback);
  if (task) {
    this.render("CardItem", task, cardData.path || options.components || webCpu.componentPath);
  }
}

WebCpu.prototype.updateView = function (elem, option, data, flag) {
  option = option || {};
  if (typeof (option) === "string") {
    option = {
      url: option
    }
  }
  var callback = null;
  if (typeof (data) === "function") {
    callback = data;
  } else if (flag) {
    callback = function (c, d, t) {
      if (typeof (data) === "string") {
        data = {
          url: data
        };
        if (_self.interface && _self.interface[data]) {
          data = _self.interface[data];
        }
      }
      for (var k in data) {
        d.task[k] = data[k];
      }
    };
  } else if (data) {
    callback = function (c, d, t) {
      d.task.data = data || d.task.data;
      d.task.url = "";
    }
  } else {}
  if (option.url) {
    this.addCardItem(elem, option.url, {
      key: option.key,
      interface: option.interface,
      callback: function (c, d, t) {
        if (typeof (option.callback) === "function") {
          option.callback(c, d, t);
        }
        if (typeof (callback) === "function") {
          callback(c, d, t);
        }
      }
    });
  } else {
    this.addCardItem(elem, option, {
      callback: function (c, d, t) {
        if (typeof (callback) === "function") {
          callback(c, d, t);
        }
      }
    });
  }

};

WebCpu.prototype.transferCardData = function (container, cardData, options, callback) {
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
        if (options.interface && _self.CardItem && webCpu.CardItem.updateConfig) {
          webCpu.CardItem.updateConfig(data, options.interface);
        }
        if (typeof (task.initData) === "function") {
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
      afterRender: function (container, data, task) {
        if (typeof (task.initView) === "function") {
          task.initView(container, data, task);
        }
      }
    }
  }
  if (typeof (cardData) === "string") {
    task.url = cardData;
    task.requestType = "_jsonp";
    task.query = options.key || "transweb_cn";
    task.cardName = options.cardName;
  } else {
    task.data = cardData;
    task.url = "";
  }
  return task;
}

WebCpu.prototype.excuteTasks = function (elem, cards, path) {
  try {
    this.componentPath = this.componentPath || path;
    var containers = elem.querySelectorAll("[component]");
    for (var i = 0; i < containers.length; i++) {
      this.excuteSingleTask(containers[i], path, cards);
    }
  } catch (e) {
    console.log("Tasks excute error:");
    console.log(e);
  }
}

WebCpu.prototype.transService = function (data) {
  if (data.cardData) {
    return data;
  }
  data.cardName = data.cardName || "microCard";
  data.className = data.className || "TemplateItem";
  var d = {
    card: WebTool.copyObject(data),
    cardData: [data],
    options: {
      width: 1,
      height: 1,
      type: "fixed",
      components: "components",
      area: [{
        pos: [0, 0],
        size: [1, 1],
        cardName: data.cardName
      }]
    }
  };
  return d;
}

WebCpu.prototype.microServiceTask = function (str, flag, interfaceUrl, callback) {
  var _self = this;
  var task = {
    option: {
      url: interfaceUrl,
      param: {
        state: "app",
        flag: flag
      }
    },
    switchService: function (data) {
      if (typeof (data) !== "string") {
        data = WebTool.objectToString(data);
      }
      this.iframe.contentWindow.postMessage(data, "*");
    },
    promise: {
      beforeRender: function (container, data, task) {
        // task.data = _self.transService(data);
        if (typeof (callback) === "function") {
          callback(container, data, task);
        }

      }
    }
  }
  if (typeof (str) === "string") {
    if (str.search("\{") === -1) {
      task.data = str;
    } else {
      task.data = WebTool.stringToObject(str);
    }
  } else {
    task.data = str;
  }
  return task;
}


WebCpu.prototype.microService = function (container, str, flag, interfaceUrl, callback) {
  var url = interfaceUrl || "https://transweb.cn";
  var task = this.microServiceTask(str, flag, url, callback);
  task.container = container;
  this.render("WebApp", task, task.option.url + "/components");
  return task;
}


WebCpu.prototype.render = function (param, task, path) {
  if (typeof (param) === "string" && task) {
    this._render(param, task, path);
  } else if (param.className && param.task) {
    this._render(param.className, param.task, param.componentPath);
  } else {
    console.log("Invalid component[%1]".replace("%1", (param.className || param)));
  }
}

WebCpu.prototype._render = function (name, task, path) {
  if (!this[name]) {
    var mission = []
    if (typeof (task) === "object" && task.constructor.name === "Array") {
      mission = task;
    } else if (!!task) {
      mission = [task];
    } else {
      mission = [];
    }
    var path = path || this.componentPath;
    this.link(path, name, mission);
  } else if (this[name].state !== 1) {
    this[name].mission.push(task);
  } else {
    this[name].render(task);
  }
}

WebCpu.prototype.link = function (path, name, mission) {
  if (!this[name]) {
    var control = {
      path: path,
      mission: mission
    }
    if (path) {
      WebAdapter.load(path + '/' + name + "/main.js");
    } else {
      WebAdapter.load(name + "/main.js");
    }
    this[name] = control;
  }
}

WebCpu.prototype.regComponent = function (name, config, callback) {
  try {
    config = config || {};
    var _self = this;
    if (this[name] && this[name].path) {
      var control = this[name];
      config.path = control.path;
    }
    config.name = name;
    var mission = (control && control.mission) || [];
    this[name] = new ViewControl(config, function (container, data, t) {
      //initial component
      callback(container, data, t);
      console.log("execed successfully: Component " + name);
    }, mission);
  } catch (e) {
    console.log("Reg failed: component[" + name + "], " + e);
  }
}

WebCpu.prototype.renderCard = function (elem, option, callback) {
  if (option.url) {
    this.addCardItem(elem, option.url, {
      key: option.key,
      interface: option.interface,
      callback: function (c, d, t) {
        if (typeof (callback) === "function") {
          callback(c, d, t);
        }
        if (typeof (option.callback) === "function") {
          option.callback(c, d, t);
        }
      }
    });
  } else {
    this.addCardItem(elem, option, function (c, d, t) {
      callback(c, d, t);
    });
  }
}


WebCpu.prototype.renderModule = function (elem, name, callback) {
  var option = this.cards.main.task.option.router[name];
  if (!option) {
    option = this.cards.main.task.option.router["index"] || {};
  }
  this.updateModuleStyle(option.css);
  var tCallback = function (c, d, t) {
    d.task.cards = option.children;
    if (typeof (callback) === "function") {
      callback(c, d, t);
    }
  }
  this.renderCard(elem, option, tCallback);
}

WebCpu.prototype.updateModuleStyle = function (cssUrl) {
  var styleDom = document.getElementById("webCpuModuleStyle");
  if (styleDom) {
    document.head.removeChild(styleDom);
  }
  if (cssUrl) {
    styleDom = document.createElement("link");
    styleDom.setAttribute("type", "text/css");
    styleDom.setAttribute("rel", "stylesheet");
    styleDom.setAttribute("href", cssUrl);
    styleDom.setAttribute("id", "webCpuModuleStyle");
    document.head.appendChild(styleDom);
  }
}

WebCpu.prototype.initWebApp = function (elem, app, flag) {
  if (!app) {
    return false;
  }
  var key = app.key || "transweb_cn";
  var url = app.url || app;
  flag = flag || app.flag || 0;
  var _self = this;
  WebAdapter.loadCardData(url, key, function (data) {
    if (typeof (app.callback) === "function") {
      app.callback(data);
    }
    _self.initProject(elem, data.routerOption, data.titleData, flag);
  });
}

WebCpu.prototype.initProject = function (elem, routerOption, titleData, flag) {
  var _self = this;
  if (titleData && titleData.title) {
    document.title = titleData.title || "#Demo";
  }

  var main = {
    cardName: "main",
    titleData: titleData,
    task: {
      closeRouter: flag,
      "current": "index",
      "option": {
        "default": "index",
        "router": routerOption
      },
      promise: {
        beforeRender: function (container, data, task) {
          task.current = location.pathname.replace(/^\//, "");
          _self.router = task.option.router;
        },
        afterRender: function (container, data, task) {
          task.switchModule();
        }
      },
      updateStyle: function (name) {
        var mOption = this.option.router[name];
        if (mOption && mOption.css) {
          _self.updateModuleStyle(mOption.css);
        }
      },
      getRouterOption: function (name) {
        var arr = name.split("/");
        if (arr.length < 1) {
          return this.option.router["index"];
        }
        // var mOption = WebTool.copyObject(this.option.router[arr[0]]);
        mOption = this.option.router[arr[0]];
        if (arr.length > 1 && mOption && mOption.secondRouter && mOption.secondRouter[arr[1]]) {
          var sOption = mOption.secondRouter[arr[1]];
          mOption.breadcrumb = sOption.breadcrumb || mOption.breadcrumb;
          mOption.callback = sOption.callback;
          mOption.beforeRender = sOption.beforeRender || [];
          if (sOption.beforeRender.constructor.name !== "Array") {
            sOption.beforeRender = [sOption.beforeRender];
          }
          for (var i = 0; i < sOption.beforeRender.length; i++) {
            var tOption = sOption.beforeRender[i];
            if (tOption.cardName && tOption.callback && mOption.children && mOption.children[tOption.cardName]) {
              var cardOption = mOption.children[tOption.cardName];
              cardOption.callback = tOption.callback;
            }
          }
        }
        if (!mOption) {
          name = this.option.default || "index";
          mOption = this.option.router["index"];
        }
        return mOption;
      },
      "switchModule": function (path) {
        var name = path || this.current || "index";
        var mOption = this.getRouterOption(name);
        var arr = name.split("/");
        this.current = name;
        name = arr[0];
        //render the card
        var tCard = _self.cards[name];
        if (typeof (tCard) === "undefined") {
          _self.addCardItem(this.container, mOption.url, {
            key: mOption.key,
            interface: mOption.interface,
            callback: function (c, d, t) {
              d.cardName = name;
              d.breadcrumb = mOption.breadcrumb;
              d.task.cards = mOption.children;
              if (typeof (mOption.callback) === "function") {
                mOption.callback(c, d, t);
              }
            }
          });

        } else {
          tCard.cardName = name;
          tCard.breadcrumb = mOption.breadcrumb;
          tCard.task.cards = mOption.children;
          if (typeof (mOption.callback) === "function") {
            mOption.callback(tCard.task.container, tCard);
          }
          _self.addCardItem(this.container, tCard);
        }
        this.updateStyle(name);

        if (history.pushState && !this.closeRouter && path) {
          var t = location.href.split("?");
          var url = path;
          if (t.length > 1) {
            url += "?" + t[1]
          }
          history.pushState({}, "关于", url);
        }
      }
    }
  }
  webCpu.addCardItem(elem, main);
  return main;
}

window.webCpu = new WebCpu();
webCpu.componentPath = "components";


var CrossDomainService = function (interfaceData, callback, cardList, dataAdapter) {
  this.cardList = cardList;
  this.interfaceData = interfaceData;
  this.dataAdapter = dataAdapter;
  this.messageCallback = {};
  if (!this.interfaceData) {
    return;
  };
  if (this.interfaceData.constructor.name !== "Array") {
    var iUrl = this.interfaceData.src || this.interfaceData
    this.iframe = this.getBridgeIframe(iUrl);
    if (this.interfaceData.url) {
      this.iframe.contentWindow.name = this.interfaceData.url;
    }
  }

  var _self = this;
  WebTool.listenMessage(function (e) {
    var data = e.data;
    if (typeof (data) === "string" && data.search('{') !== -1 && data.search('}') !== -1) {
      data = JSON.parse(data);
    }
    if (data.messageId && typeof (_self.messageCallback[data.messageId]) === "function") {
      _self.messageCallback[data.messageId](data.data);
      delete _self.messageCallback[data.messageId];
    } else if (data.type === "tServiceInit") {
      if (typeof (callback) === "function") {
        data = data || {};
        callback(_self, data.data);
      }
    } else {}
  });
}

CrossDomainService.prototype.render = function (container, cardName, dataAdapter) {
  //postMessage携带id
  var messageId = cardName + (new Date()).getTime();
  var adapter = dataAdapter || this.dataAdapter[cardName] || {};
  query = dataAdapter.query || {};
  query.messageId = messageId;
  var requestData = {
    key: adapter.key,
    query: query,
    requestType: adapter.requestType,
    url: adapter.url,
    dataType: adapter.dataType
  }
  var iframe = this.iframe;

  iframe.contentWindow.postMessage(requestData, "*");
  //定义回调函数
  var _self = this;
  this.messageCallback[messageId] = function (data) {
    _self._render(data, container, cardName, dataAdapter);
  }
}

CrossDomainService.prototype.request = function (url, query, requestType, callback, type) {
  var messageId = "_" + (new Date()).getTime();
  var requestData = {
    query: query,
    requestType: requestType,
    url: url,
    dataType: type,
    messageId: messageId
  }
  this.iframe.contentWindow.postMessage(requestData, "*");
  this.messageCallback[messageId] = function (data) {
    callback(data);
  }
}

CrossDomainService.prototype._render = function (data, container, cardName, dataAdapter) {
  var key = this.cardList[cardName].key;
  var url = this.cardList[cardName].url;
  dataAdapter = dataAdapter || this.dataAdapter[cardName] || {};
  var transCallback = dataAdapter.callback;
  webCpu.addCardItem(container, url, {
    key: key,
    callback: function (c, d, t) {
      d.task.url = "";
      if (typeof (transCallback) === "function") {
        data = transCallback(data);
      }
      d.task.data = data;
      if (typeof (dataAdapter.beforeMount) === "function") {
        dataAdapter.beforeMount(d.task.container, d.task.data, d.task);
      }
    }
  });
}

CrossDomainService.prototype.getBridgeIframe = function (url) {
  var id = MurmurHash.rule(url);
  var iframe = document.getElementById(id);
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.setAttribute('allowTransparency', 'true');
    iframe.setAttribute('id', MurmurHash.rule(url));
    iframe.setAttribute('frameBorder', '0');
    iframe.setAttribute('scrolling', 'no');
    iframe.style.cssText = 'height:0px;width:0px;float:none;position:absolute;overflow:hidden;z-index:333333;margin:0;padding:0;border:0 none;background:none;';
    document.body.appendChild(iframe);
  }
  iframe.src = url;

  return iframe;
}

var WebTool = {};

WebTool.listenMessage = function (callback) {
  if (window.addEventListener) {
    window.removeEventListener('message', callback);
    window.addEventListener('message', callback, false)
  } else {
    window.detachEvent("onmessage", callback);
    window.attachEvent('onmessage', callback);
  }
}

WebTool.urlQuery = function (url, key) {
  var t = url.split("#");
  var ret = 0;
  for (var i = 0; i < t.length; i++) {
    ret = ret || this._urlQuery(t[i], key);
  }
  return ret;
}

WebTool._urlQuery = function (url, key) {
  if (url) {
    var re = new RegExp(key + "=([^\&]*)", "i");
    var a = re.exec(url);
    if (a == null) {
      return null;
    }
    return a[1];
  } else {
    return null;
  }
}

WebTool.cookieQuery = function (cookie, name) {
  if (cookie.search(name + "=") === 0) {
    var value = cookie.split(name + "=")[1].split("; ")[0];
  } else if (cookie.search("; " + name + "=") !== -1) {
    var value = cookie.split("; " + name + "=")[1].split("; ")[0];
  } else {
    var value = null;
  }
  return value;
}

WebTool.pageHash = function (url) {
  var tArr = url.split("#");
  if (tArr.length > 1) {
    return tArr[1].split("?")[0];
  } else {
    return "";
  }
}

WebTool.attachParams = function (url, params) {
  if (url.indexOf("?") === -1) {
    flag = 0;
  } else {
    flag = 1;
  }
  for (var k in params) {
    if (flag == 0) {
      url += "?" + k + "=" + encodeURIComponent(params[k]);
      flag = 1;
    } else {
      url += "&" + k + "=" + encodeURIComponent(params[k]);
    }
  }
  return url;
}

WebTool.objectToString = function (obj, flag) {
  if (obj && obj.constructor.name === "Object") {
    var str = "{";
    for (var k in obj) {
      if (typeof (obj[k]) === "string") {
        if (obj[k].search("'") !== -1) {
          str += "\"" + k + '\":"' + obj[k] + '",';
        } else {
          str += "\"" + k + "\":'" + obj[k] + "',";
        }

      } else {
        str += "\"" + k + "\":" + this.objectToString(obj[k]) + ","
      }
    }
    if (str.length === 1) {
      str = "{}"
    } else {
      str = str.slice(0, str.length - 1) + "}";
    }
  } else if (obj && (obj.constructor.name === "Array")) {
    if (obj.length > 0) {
      var str = "[ " + this.objectToString(obj[0]);
      for (var i = 1; i < obj.length; i++) {
        str += "," + this.objectToString(obj[i]);
      }
      str += "]"
    } else {
      var str = "[]";
    }
  } else if (obj && (obj.constructor.name === "Function")) {
    var str = obj.toString();
  } else if (obj && (typeof (obj) === "string")) {
    if (flag) {
      var str = "\'" + escape(obj) + "\'";
    } else {
      var str = "\'" + obj.replace(/\'/g, "\\'") + "\'";
    };
  } else if ((typeof (obj) === "number") || (typeof (obj) === "boolean")) {
    var str = obj;
  } else {
    var str = "''";
  }
  return str;
}

WebTool.stringToObject = function (str, flag) {
  function getObj(data) {
    return data;
  }
  if (flag) {
    try {
      var temp = unescape(str);
      str = temp;
    } catch (e) {
      console.log(e);
    }

  }

  var data = eval("(\n" + str + "\n)");

  return data;
}



WebTool.copyObject = function (obj, dna) {
  var ret = {};
  if (dna) {
    for (var k in dna) {
      var arr = dna[k].split("/");
      var t = ret;
      var s = obj;
      for (var i = 0; i < arr.length - 1; i++) {
        t[arr[i]] = t[arr[i]] || {};
        t = t[arr[i]];
        if (s) {
          s = s[arr[i]];
        } else {
          break;
        }
      }
      if (s) {
        s = s[arr[arr.length - 1]];
      }
      t[arr[arr.length - 1]] = s
    }
  } else {
    if (typeof (obj) !== "string") {
      var str = WebTool.objectToString(obj, 1);
      ret = this.stringToObject(str);
    } else {
      ret = str;
    }
  }
  return ret;
}

WebTool.bind = function (node, type, listener, flag) {
  if (node.attachEvent) {
    node.attachEvent('on' + type, listener);
  } else if (node.addEventListener) {
    node.addEventListener(type, listener, flag);
  } else {}
}
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
    document.cookie = name + '=' + value;
  } else if (arguments.length === 3) {
    var name = arguments[0];
    var value = arguments[1];
    var expires = arguments[2];
    var tData = new Date();
    tData.setDate(tData.getDate() + expires);
    document.cookie = name + '=' + value + ';expires=' + tData + ';path=/;';
  } else if (arguments.length === 4) {
    var name = arguments[0];
    var value = arguments[1];
    var expires = arguments[2];
    var domain = arguments[3];
    var tData = new Date();
    tData.setDate(tData.getDate() + expires);
    document.cookie = name + '=' + value + ';expires=' + tData + ';path=/;' + 'domain=' + domain;
  } else {}
}

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
}

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
}


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
}
WebTool.setItem = function (key, d) {
  localStorage.setItem(key, JSON.stringify(d));
  return d;
}
WebTool.getItem = function (key) {
  return JSON.parse(localStorage.getItem(key));
}


/****************************************************************************/
//模板HTML字符串与JSON对象绑定
String.prototype.bindData = function (obj, filter) {
  var ret = this;
  if (obj && typeof (obj) === "object") {
    var re = /{{([^}}]+)?}}/g;
    this.filter = filter;
    var _self = this;
    var ret = this.replace(re, function (m, t) {
      var temp = obj;
      var ret = (function () {
        var o = temp;
        var keys = t.split(".");
        for (var i = 0; i < keys.length; i++) {
          o = o[keys[i]];
          if (o === undefined || o === null) {
            o = "{{" + keys[i] + "}}";
          }
        }
        var m = !(_self.filter && typeof (_self.filter[keys[i - 1]]) === "function") ? o : _self.filter[keys[i - 1]](o);
        return m;
      })();
      return ret;
    });
  }
  return ret;
}