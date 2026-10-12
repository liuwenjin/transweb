webCpu.config = webCpu.config || {};
webCpu.config.maskStyle = {
  background: "rgba(200, 200, 200, 0.3)",
  border: "solid 1px #f8f8f8",
  cursor: "pointer",
  boxShadow: "1px 1px 1px #333"
}

webCpu.callbackMap = {
  openAiApp: function(cardName) {
    let aiApp = {
      pluginUrl: storeOption.url,
      pluginKey: storeOption.key,
      cardName: "aiQuetionCard"
    }
    webCpu.CardItem.renderCardDialog(webCpu.cards[cardName], aiApp, {
      title: "问问 AI"
    }, {
      width: "800",
      height: "640",
      boxShadow: "1px 1px 1px #888"
    });
  }
}

webCpu.config.loginStyle = {
  width: "400px",
  height: "380px",
  border: "solid 1px #ddd"
}


webCpu.config.mobileSize = [{
    label: "iPhone SE(375 x 667)",
    value: "375 x 667",
  },
  {
    label: "iPhone XR(414 x 896)",
    value: "414 x 896",
  },
  {
    label: "iPhone 12Pro(390 x 844)",
    value: "390 x 844",
  },
  {
    label: "Pixel(393 x 851)",
    value: "393 x 851",
  },
  {
    label: "Samsung Galaxy S8+(360 x 740)",
    value: "360 x 740",
  },
  {
    label: "Samsung Galaxy S20(412 x 915)",
    value: "412 x 915",
  },
  {
    label: "Surface Duo(540 x 720)",
    value: "540 x 720",
  },
  {
    label: "Galaxy Fold(280 x 653)",
    value: "280 x 653",
  },
]

webCpu.config.previewMap = {
  default: {
    width: 800,
    radio: 0.55
  },
  ElementVueItem: {
    width: 400,
    radio: 0.55
  }
}


webCpu.config.pluginLib = {
  defaultCollection: {
    url: "bucket/personal/{{folderName}}/app/{{name}}",
    requestType: "jsonp",
    query: {
      callback: "transweb_app_collection"
    },
    params: {
      folderName: "1714628260",
      name: "default.js"
    }
  },
  custom: {
    url: "bucket/personal/{{folderName}}/app/{{name}}",
    requestType: "jsonp",
    query: {
      callback: "transweb_app_collection"
    },
    params: {
      folderName: "1714628260",
      name: "default.js"
    }
  },
};
webCpu.config.layoutLib = {
  defaultCollection: {
    url: "bucket/personal/{{folderName}}/app/{{name}}",
    requestType: "jsonp",
    query: {
      callback: "transweb_app_collection"
    },
    params: {
      folderName: "1714628260",
      name: "module.js"
    }
  },
  custom: {
    url: "bucket/personal/{{folderName}}/app/{{name}}",
    requestType: "jsonp",
    query: {
      callback: "transweb_app_collection"
    },
    params: {
      folderName: "1714628260",
      name: "module.js"
    }
  },
};

webCpu.util = {
  loopScollElement(el, gap, n) {
    var current = el.scrollTop;
    var max = el.scrollHeight - el.clientHeight;
    if (current < max) {
      el.scroll(0, current + gap);
    } else {
      el.scroll(0, 0);
    }
    var _self = this;
    setTimeout(function () {
      _self.loopScollElement(el, gap, n);
    }, n);
  },
  downLoadByUrl(url, name, method, param, header) {
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
    xhr.responseType = 'blob';

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
    if (header && header['Content-Type'].search("application/json") !== -1) {
      param = JSON.stringify(param);
    }
    xhr.send(param);
  },
  jsonToExcel: function (data, head, name = 'test') {
    let str = head ? head + '\n' : '';
    data.forEach(item => {
      // 拼接json数据, 增加 \t 为了不让表格显示科学计数法或者其他格式
      for (let key in item) {
        str = `${str + item[key] + '\t'},`
      }
      str += '\n'
    });
    console.log(str)
    // encodeURIComponent解决中文乱码
    const uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str);
    // 通过创建a标签实现
    const link = document.createElement("a");
    link.href = uri;
    // 对下载的文件命名
    link.download = `${name + '.csv'}`;
    link.click();
  },
  downloadString(blob, name, type) {
    if (typeof blob === "string") {
      type = type || "text/plain";
      blob = new Blob([blob], {
        type: type
      });
    }
    var filename = name || '匿名文件'; //如123.xls
    var a = document.createElement('a');

    blob.type = "application/octet-stream";
    //创键临时url对象
    var url = URL.createObjectURL(blob);

    a.href = url;
    a.download = filename;
    a.click();
    //释放之前创建的URL对象
    window.URL.revokeObjectURL(url);
  },
  transformImage: function (elem, name, type, color, callback) {
    var h = elem.scrollHeight;
    var w = elem.scrollWidth;
    var _h = elem.offsetHeight;
    var _w = elem.offsetWidth;
    var child = elem.children[0];
    child.style.width = _w + "px";
    child.style.height = _h + "px";
    child.style.overflow = "visible";
    // var t = elem.parentNode;
    elem.style.height = h + "px";
    elem.style.width = w + "px";
    // elem.style.overflow = "visible";
    var _self = this;
    setTimeout(function () {
      html2canvas(
        elem, {
          allowTaint: true,
          useCORS: true,
          backgroundColor: color || "transparent"
        }
      ).then(htmlCanvas => {
        var dataurl = htmlCanvas.toDataURL(type || 'image/jpeg');
        var bin = atob(dataurl.split(',')[1]);
        //创建空的Uint8Array
        var buffer = new Uint8Array(bin.length);
        //将图像数据逐字节放入Uint8Array中
        for (var i = 0; i < bin.length; i++) {
          buffer[i] = bin.charCodeAt(i);
        }

        //利用Uint8Array创建Blob对象
        var blob = new Blob([buffer.buffer], {
          type: type
        });

        if (typeof (callback) === "function") {
          callback(dataurl, blob);
        } else {
          _self.downloadString(blob, name)
        }

        child.style.width = "100%";
        child.style.height = "100%";
        child.style.overflow = "visible";
        elem.style.height = _h + "px";
        elem.style.width = _w + "px";

      });
    }, 200);
  },
  transformAppText(text) {
    text = $.trim(text);
    var key = text.match(/^[A-Za-z][A-Za-z0-9_-]+/g);
    key = key[0] || key;
    var ret = false;
    var temp = text.replace(key, "");
    try {
      var card = eval(temp);
      temp = temp.replace(/^\(/, "");
      temp = temp.replace(/\)$/, "");
      ret = {
        key: key,
        card: card,
        data: temp
      }
    } catch (e) {
      console.log(e);
    }
    return ret;
  },
  copyString(val) { //val 是要复制的字符串
    WebTool.copyString(val);
  },
  
  requestOpenAi(content) {

    let url = "/gpt/chatQuestion_";
    let d = JSON.stringify({
      content: content
    });
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': d.length
    };
    fetch(url, {
        method: 'POST',
        headers: headers,
        body: d
      })
      .then(res => {
        // 创建一个文本解码器
        const decoder = new TextDecoder('utf-8');

        // 通过流读取数据
        const reader = res.body.getReader();

        // 读取并处理流数据
        function read() {
          reader.read().then(({
            done,
            value
          }) => {
            if (done) {
              console.log('流数据读取完毕');
              return;
            }

            // 解码并处理数据
            const decodedData = decoder.decode(value, {
              stream: true
            });
            console.log(decodedData);

            // 继续读取下一块数据
            read();
          });
        }

        // 开始读取流数据
        read();
      })
      .catch(error => console.error('发生错误:', error));
  },
  downloadWebApp(name, app, callback) {
    var param = {
      origin: location.origin,
      data: WebTool.objectToString(app),
      developer: localStorage.userName || "匿名",
      folderName: localStorage.folderName,
      time: new Date().toLocaleString(),
    };
    name = name || app.cardName || "tempApp";
    name += ".html";
    var _self = this;
    WebAdapter.request(
      "template.html",
      "get", {},
      function (d) {
        var str = d.bindData(param);
        if (typeof callback !== "function") {
          _self.downloadString(str, name);
        } else {
          callback(str, name);
        }
      },
      "text"
    );
  },
  checkAppFileKey: function (url, callback) {
    var _self = this;
    $.get(url, function (text) {
      var tData = _self.transformAppText(text);
      if (tData && tData.card && tData.key && typeof (callback) === "function") {
        callback(tData.card, url, tData.key);
      }
    }, "text");
  },
  renderAppFile: function (elem, url, style, callback1, callback2) {
    this.checkAppFileKey(url, function (data, url, key) {
      if (typeof (callback1) === "function") {
        callback1(data, url, key);
      }
      data.task.style = style || data.task.style || {
        width: 500,
        height: 300
      }
      webCpu.addCardItem(elem, data);
      if (typeof (callback2) === "function") {
        callback2(data, url, key);
      }
    })
  },
  recoverWebApp: function (appData) {
    var map = appData.moduleMap;
    for (var k in map) {
      map[k].dsl = map[k].dsl || {};
      var arr = map[k].dsl.appData || [];
      for (var i = 0; i < arr.length; i++) {
        if (arr[i]) {
          arr[i].dsl = arr[i].dsl || {};
          delete arr[i].dsl._initView;
        }
      }
    }
    return appData;
  },
  getItemsByApp: function (appData) {
    appData = appData || {};
    var ret = {
      appItems: [],
      moduleItems: [],
      pageItems: [],
      routeData: appData.routeData
    }
    for (var k in appData.appMap) {
      if (appData.appMap[k].dsl) {
        delete appData.appMap[k].dsl._initView;
      }
      ret.appItems.push(appData.appMap[k]);
    }

    for (var k in appData.moduleMap) {
      var page = appData.moduleMap[k];
      page.cardName = k;
      page.dsl = page.dsl || {};
      page.dsl.promise = page.dsl.promise || {};
      // page.dsl.promise.beforeRender = function (cc, dd, tt) {
      //   $(cc).attr("itemType", "page");
      // }
      ret.pageItems.push(page);
      // var dsl = page.dsl || {};
      // var items = dsl.appData || [];
      // ret.appItems = ret.appItems.concat(items);
      ret.moduleItems.push({
        url: page.url,
        className: page.className || 'TemplateItem',
        cardName: page.cardName,
        dsl: page.dsl || {},
        tempData: page.tempData || [],
        callback: page.callback
      });
    }

    return ret;
  },
  updateWebApp: function (cardName, appData) {
    if (cardName && appData.appMap && appData.appMap[cardName]) {
      var app = appData.appMap[cardName];
      delete app.card;
      for (var k in appData.moduleMap) {
        var page = appData.moduleMap[k];
        page.dsl = page.dsl || {};
        var arr = page.dsl.appData || [];
        for (var i = 0; i < arr.length; i++) {
          if (arr[i].cardName === cardName) {
            arr[i].dsl = WebTool.copyObject(app.dsl);
          }
        }
      }
    }
    return appData;
  },
  updateRouteData: function (appData) {
    var map = appData.moduleMap;
    appData.routeData = [];
    for (var k in map) {
      appData.routeData.push({
        path: "/" + k,
        module: k
      })
    }
    return appData;
  },
  addAppMask: function (appData) {
    var map = appData.moduleMap;
    for (var k in map) {
      map[k].dsl = map[k].dsl || {};
      var arr = map[k].dsl.appData || [];
      for (var i = 0; i < arr.length; i++) {
        if (arr[i]) {
          arr[i].dsl = arr[i].dsl || {};
          arr[i].dsl._initView = function (cc, dd, tt) {
            if (tt.card && webCpu.config) {
              webCpu.CardItem.setForbidArea(tt.card, "", webCpu.config.maskStyle);
            }
          };
        }
      }
    }
    return appData;
  },
  upateCardContainer: function (cc, dd, tt) {
    $(cc).css({
      padding: "5px"
    });
    $(tt.titleArea).css({
      "font-weight": 900,
      "color": "#333",
      "padding-left": "5px"
    });
    $(cc).find("[component=CardItem]").html("<div class='emptyCardContainer'>插件区域</div>");
  },
  testInterface: function (d, query, callback, params) {
    WebAdapter.request(
      d.url,
      d.method || "get", query || {},
      function (testData) {
        if (typeof callback === "function") {
          callback(testData);
        }
      }, {
        contentType: d.contentType || "",
        dataType: d.dataType || "json",
        proxy: true,
        params: params || {}
      }
    );
  },
  checkProxy: function (url, callback, tCallback) {
    let arr = url.match(/https?:\/\/([^/]+)\//i);
    if (arr && arr[0]) {
      url = arr[0] + "proxy.html";
    } else {
      url += "/proxy.html";
    }
    let flag = true;
    setTimeout(function () {
      if (flag && typeof tCallback === "function") {
        tCallback();
      }
    }, 2000);
    WebAdapter.request(
      url,
      "get", {},
      function (testData) {
        flag = false;
        if (typeof callback === "function") {
          callback(testData);
        }
      }, {
        contentType: "",
        dataType: "text",
        proxy: true,
      }
    );
  },
  displayToastItem: function () {
    var selector = $(`<div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="toast-header">
            <img src="..." class="rounded mr-2" alt="...">
            <strong class="mr-auto">Bootstrap</strong>
            <small class="text-muted">2 seconds ago</small>
            <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="toast-body">
            Heads up, toasts will stack automatically
          </div>
        </div>`);
    selector.appendTo($(document.body));
  },
  transformAppText: function (text) {
    text = $.trim(text);
    var key = text.match(/^[A-Za-z][A-Za-z0-9_-]+/g);
    key = key[0] || key;
    var ret = false;
    var temp = text.replace(key, "");
    try {
      var card = eval(temp);
      temp = temp.replace(/^\(/, "");
      temp = temp.replace(/\)$/, "");
      ret = {
        key: key,
        card: card,
        data: temp
      }
    } catch (e) {
      console.log(e);
    }
    return ret;
  },
  removeAppItem: function (cardName, webApp) {
    if (webApp && webApp.appMap && webApp.appMap[cardName]) {
      delete webApp.appMap[cardName];
      for (var k in webApp.moduleMap) {
        webApp.moduleMap[k].dsl = webApp.moduleMap[k].dsl || {
          appData: []
        }
        webApp.moduleMap[k].dsl.appData = webApp.moduleMap[k].dsl.appData || [];
        var arr = webApp.moduleMap[k].dsl.appData;
        for (var i = 0; i < arr.length; i++) {
          if (arr[i].cardName === cardName) {
            arr[i] = "";
          }
        }
      }
    }
    return webApp;
  },
  syncWebApp: function (callback, callback1) {
    var key = localStorage.getItem("currentAppKey");
    var name = localStorage.getItem("currentAppName");
    var folderName = localStorage.getItem("folderName");
    var str = WebTool.objectToString(webCpu.currentWebApp);
    if (name.search(/\.js$/) === -1) {
      name += ".js";
    }
    localStorage.setItem("currentWebApp", WebTool.objectToString(webCpu.currentWebApp));
    this.saveWebApp(str, folderName, name, key, callback, callback1);
  },
  saveWebApp: function (str, folderName, name, key, callback, callback1) {
    if (!key) {
      var random = Math.random().toString().slice(2);
      var id = MurmurHash.rule(random + '(' + folderName + '_' + name + ')', 32);
      key = "transweb_cn_" + id;
    }
    str = `${key}(${str})`;
    var file = new File([str], name, {
      type: "text/plain;charsst=utf8"
    });
    var formData = new FormData();
    formData.append("file", file);
    webCpu.adapter.submitAppData(formData, function (tData) {
      if (tData.code === 0) {
        if (typeof (callback) === "function") {
          callback();
        }
      } else {
        if (typeof (callback1) === "function") {
          callback1();
        }
      }
    }, {
      folderName: folderName,
      name: name
    });
    return key;
  },
  loadLoginDialog: function() {
    webCpu.router.push({
      path: "/home"
    });
    webCpu.util.openLoginDialog(function (dd) {
      webCpu.fresh(webCpu.cards.loginRegItem);
    }, function () {
      webCpu.cards.loginRegItem.task.vueItem.$message({
        type: "warning",
        message: dd.message
      })
    });
  },
  openLoginDialog: function(callback, tCallback) {
    webCpu.appMap.loginReg.callback = function (cc, dd, tt) {
      dd.task.confirmCallback = function (query) {
        webCpu.adapter.login(query, function (dd) {
          if (dd.data && (dd.data.folderName || dd.data.account)) {
            localStorage.setItem("account", dd.data.account);
            localStorage.setItem("userName", dd.data.name || '');
            localStorage.setItem("folderName", dd.data.folderName);
            localStorage.setItem("userInfo", JSON.stringify(dd.data));
            webCpu.CardItem.dismissMask(webCpu.cards.main);
            if(typeof callback === "function") {
              callback(dd.data);
            }
            if (webCpu.router.redirect && webCpu.router.redirect.path) {
              webCpu.router.push({
                path: webCpu.router.redirect.path,
                query: webCpu.router.redirect.query
              });
            } else {
              webCpu.router.push({
                path: "/home"
              });
            }
          } else {
            if(typeof tCallback === "function") {
              tCallback();
            }
          }
        }, "json");
      }
    }
    webCpu.CardItem.renderCardDialog(webCpu.cards.main, webCpu.appMap.loginReg, {
      title: "登录 transweb.cn",
      dialogName: "regLoginDialog"
    }, webCpu.config.loginStyle, {
      padding: "10px 30px"
    });
  },
  verifyFileExist: function (url, account, name, callback, callback1) {
    var url = url.bindData({
      account: account,
      name: name
    });
    $.get(url, function (d, a, b) {
      var flag = false;
      try {
        ret = JSON.parse(d);
        if (ret.meta && ret.meta.code && (ret.meta.code === "0" || ret.meta.code === 0)) {
          flag = true;
        }
      } catch (e) {
        if (d) {
          flag = true;
        }

        console.log(e)
      }
      if (typeof callback === "function" && !flag) {
        callback(d);
      } else if (typeof callback1 === "function") {
        callback1(d);
      } else {}
    }, "text");
  },
  callbackMap: {
    module: function (c, d, t) {
      $(c).attr("flag", "module");
      webCpu.util.upateCardContainer(c, d, t);
      $(c).find("[editable=true]").attr("contentIndex", function (index) {
        $(this).attr("title", $(this).html());
        return index;
      })
    },
    page: function (c, d, t) {
      if (window.parent.location.pathname === "/preview.html") {
        return false;
      }
      var appData = t.appData || [];
      var arr = $(c).find("[itemType=layoutCardItem]");
      for (let i = 0; i < arr.length; i++) {
        $(arr[i]).attr("cardIndex", i);
        var app = appData[i];

        if (!app) {
          webCpu.updateView(arr[i], {
            url: "toolApp/app/emptyCard.js",
            key: "transweb_emptyCard"
          }, function (c1, d1, t1) {
            webCpu.CardItem.setForbidArea(t1.card, "", webCpu.config.maskStyle);
          })
        } else {
          app.dsl = app.dsl || {};
          if (app.card) {
            webCpu.CardItem.setForbidArea(app.card, app.card.cardName, webCpu.config.maskStyle);
          } else {
            app.dsl._initView = function (c1, d1, t1) {
              webCpu.CardItem.setForbidArea(t1.card, "", webCpu.config.maskStyle);
            }
          }

        }
      }
      arr.on("click", function (e) {
        var index = $(this).attr("cardIndex");
        window.parent.postMessage({
          type: "event",
          name: "click",
          object: "pageCardItem",
          pos: {
            x: e.clientX,
            y: e.clientY
          },
          data: index
        }, '*');
        e.stopPropagation();
        arr.attr("pageCardSelected", false);
        $(this).attr("pageCardSelected", true);
      });
    },
    pageForStyle: function (c, d, t) {
      var style = document.querySelector("style.commonStyle");
      if (style) {
        style.parentNode.removeChild(style);
      }
      style = document.createElement("style");
      style.innerHTML = d._style;
      style.setAttribute("class", "commonStyle");
      document.head.appendChild(style);
    }
  },
  freshAppCard: function (el, size) {
    var url = el.getAttribute("url");
    var dsl = el.getAttribute("dsl");
    dsl = JSON.parse(dsl) || {};
    var type = "";
    var arr = url.split(".");
    type = arr[arr.length - 1];
    size = size || [];

    el.style.background = "#f8f8f8";
    el.style.padding = "3px 10px 3px 10px";

    if (type === "js") {
      webCpu.util.renderAppFile(el, url, null, function (data, url, key) {
        console.log("app key", key);
        webCpu.attachAttribute(dsl, data.task);
        var style = dsl.style || {};
        data.task.style = data.task.style || {};
        data.task.style.width = size[0] || style.width || $(el).width();
        data.task.style.height = size[1] || style.height || $(el).height();
        el.setAttribute("key", key);
      });
    } else if (type === "html") {

      dsl.style = {
        width: size[0] || 1920,
        height: size[1] || 1080,
        background: "#fff",
        overflow: "auto",
      };
      webCpu.updateView(
        el, {
          url: url,
          className: "TemplateItem",
          dsl: dsl,
        },
        function (c, d, t) {
          webCpu.util.callbackMap.module(c, d, t);
        }
      );
      el.setAttribute("className", "TemplateItem");
    } else if (type === "vue") {
      dsl.style = dsl.style || {};
      dsl.style.width = size[0] || dsl.style.width || $(el).width();
      dsl.style.height = size[1] || dsl.style.height || $(el).height();
      webCpu.updateView(el, {
        url: url,
        className: "ElementVueItem",
        dsl: dsl,
      });
      el.setAttribute("className", "ElementVueItem");
    } else {}
  },
  setLoginFirst: function () {
    if (webCpu.cards.loginRegItem && webCpu.cards.loginRegItem.task && webCpu.cards.loginRegItem.task.vueItem) {
      webCpu.cards.loginRegItem.task.vueItem.$message({
        type: "warning",
        message: "需要先登录。"
      })
    }
    webCpu.router.redirect = {
      path: webCpu.router.path,
      query: webCpu.router.query
    }
    webCpu.appMap.loginReg.flag = true;
    webCpu.router.push({
      path: "/home"
    })
  }

}