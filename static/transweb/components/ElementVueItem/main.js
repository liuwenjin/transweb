webCpu.regComponent("ElementVueItem", {
  css: {
    elementui: "index.css",
    display: "display.css",
  },
  script: "script.js",
}, function (container, data, task) {
  webCpu.mitt = webCpu.mitt || new mitt();

  function updateTempData(selector, tempData) {
    tempData = tempData || [];
    selector.html(function (html, index) {
      return tempData[index] || html
    });
  }
  let _updateContent = function (task) {
    let elem = task.container;
    task.promise = task.promise || {};

    let obj = {};
    let tData = null;
    tData = webCpu.renderHTML(elem, task.html || task.template, "vuejs");

    webCpu.attachAttribute(tData, obj);

    if (typeof obj.data === "function") {
      task.vueData = obj.data() || {};
    } else {
      task.vueData = task.vueData || {}
    }

    tData.vueData = tData.vueData || {};

    if (task.data) {
      obj.data = function () {
        task.data = task.data || {};
        webCpu.attachAttribute(task.data, task.vueData);
        task.vueData.appMap = task.appMap || task.vueData.appMap;
        return task.vueData;
      }
    }

    webCpu.attachAttribute(task.promise, obj);

    obj.directive = obj.directive || {};
    obj.methods = obj.methods || {};
    obj.computed = obj.computed || {};
    obj.watch = obj.watch || {};
    let tMethods = task.methods || {};
    webCpu.attachAttribute(tMethods, obj.methods);

    let computed = task.computed || {};
    webCpu.attachAttribute(computed, obj.computed);

    let watch = task.watch || {};
    webCpu.attachAttribute(watch, obj.watch);
    console.log("webCpu.appData: ", webCpu.appData);

    if (typeof task.vueData.accountData !== "undefined" && webCpu.appData) {
      obj.watch = obj.watch || {};
      obj.methods = obj.methods || {};
      obj.methods.updateAccountData = function (newVal, callback) {
        console.log("cancel updateAccountData")
        return false;
        if (!localStorage.folderName || localStorage.docType !== "true") {
          return false;
        }
        if(location.origin === "file://") {
          console.warn("本地环境不支持更新accountData");
          return false;
        }
        let adapter = {
          url: "/user/setAppData",
          method: "post"
        };
        let type = adapter.type || adapter.requestType || adapter.method;
        let request = new WebRequest(adapter.url, type, adapter);

        request({
          appData: newVal
        }, (tData) => {
          if (tData.ret === 0) {
            console.log("accountData changed successful!", newVal);
          }
          else {
            console.log("accountData changed failed", newVal);
          }
          if (typeof callback === "function") {
            callback(tData);
          }
        });
      }
      obj.watch.accountData = {
        handler(newVal, oldVal) {
          this.updateAccountData(newVal);
        },
        deep: true
      }

      try {
        console.log("init accountData: ", webCpu.appData.accountData);
        if (typeof webCpu.appData.accountData === "string") {
          webCpu.appData.accountData = JSON.parse(webCpu.appData.accountData);
        }
        webCpu.attachAttribute(webCpu.appData.accountData, task.vueData.accountData);
      }
      catch (e) {
        console.log("err", e);
      }
    }


    var directive = task.directive || {};
    webCpu.attachAttribute(directive, obj.directive);
    if (obj._mountedCallback !== "inited") {
      obj.methods._mountedCallback = obj.mounted || function () { };
    }

    obj.mounted = function () {
      if (typeof this._mountedCallback === "function") {
        this._mountedCallback();
        this._mountedCallback = "inited";
        if (task.cardBody.parentNode && task.cardBody.parentNode.getAttribute("type") === "module") {
          return false;
        }
        if (typeof task.mountedCallback === "function") {
          this.$nextTick(() => {
            task.mountedCallback(this);
          });
        }
        let appMap = task.appMap || this.appMap || {};
        appMap = webCpu.attachAttribute(appMap, tData.appMap || {});
        updateTempData($(container).find("[editable='true']"), task.tempData);
        webCpu.renderAppMap(container, appMap, (results) => {
          console.log("app list rendered: ", results);
        });
        webCpu.excuteTasks(container, appMap, task.routeView);
      }
    }

    let lang = window.lang || 'zh';
    let messages = webCpu.messages || {};
    webCpu.i18n = webCpu.i18n || VueI18n.createI18n({
      locale: lang, // 设置默认语言
      fallbackLocale: 'zh', // 后备语言
      messages, // 语言包
    });

    obj.methods = obj.methods || {};

    obj.methods.changeLanguage = function (lang) {
      this.$i18n.locale = lang;
    }

    const app = Vue.createApp(obj);
    app.directive('dialog', {
      mounted(el, param) {
        const value = param.value || {};
        if (typeof value === "string") {
          try {
            value = JSON.parse(value);
          }
          catch (e) {
            value = {
              id: value
            };
          }
        }
        el.setAttribute("data-has-dialog", "true");
        el.setAttribute("data-dialog-options", JSON.stringify(value));

        console.log("v-dialog", value, this);
        if (!value.id) {
          console.error("no id params");
          return false;
        }
        const handler = (event) => {
          let isDisabled = el.getAttribute("dialogDisabled");
          if (isDisabled) {
            return false;
          }
          let id = value.id;
          webCpu.dialogMap.openDocumentApp(id);
        };

        el.__dlg_handler__ = handler;
        el.addEventListener('click', handler);

      },
      unmounted(el) {
        el.removeEventListener('click', el.__dlg_handler__);
        delete el.__dlg_handler__;
      }
    });

    app.use(ElementPlus, {
      locale: lang === 'en' ? ElementPlusLocaleEn : ElementPlusLocaleZhCn,
    });

    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
      app.component(key, component)
    }

    app.config.errorHandler = (err, instance, info) => {
      console.error('捕获到组件异常：', err, instance)
      console.error('异常发生位置：', info, instance) // 例如 "mounted hook"
    }


    app.use(webCpu.i18n);


    try {
      task.vueItem = app.mount(elem);
    }
    catch (e) {
      console.log("app.mount error: ", e);
    }

    task.currentApp = app;

    if (task.vueItem) {
      task.vueItem._parent = task;
      task.vueItem.mitt = webCpu.mitt;
    }
  }

  if (data && data.cardData) {
    task.cards = task.cards || {};
    data.cardData.map(function (item) {
      if (item.cardName) {
        task.cards[item.cardName] = item;
      }
      return item;
    });
  }
  task.template = task.template || "";

  if (task.template && task.template && -1 != task.template.search("<") || task.html) {
    //update content
    _updateContent(task);

  } else if (task.template) {
    if (task.promise && task.promise.afterRender) {
      task._afterRender = task.promise.afterRender;
      task.promise.afterRender = null;
    }

    // if (location.origin === 'file://' && task.template.search(/^http/) === -1) {
    //   let prefix = webCpu.componentPath.replace("transweb/components", "");
    //   task.template = prefix + task.template;
    // }

    let re = `^${location.origin}`;
    if (task.template && task.template.search(/^http/) !== -1 && task.tProxy === undefined && task.template.search(re) === -1) {
      task.tProxy = true;
    } else if (task.template.search(/^http/) === -1) {
      task.tProxy = false
    }
    // var htmlFetch = new WebRequest(task.template, "GET", "html/text", null, task.tProxy);
    var htmlFetch = new WebRequest(task.template, "GET", {
      proxy: task.tProxy,
      dataType: "html/text"
    });
    htmlFetch({}, function (str) {
      task.html = str;
      if (!container) {
        return false;
      }

      if (typeof (task._afterRender) === "function") {
        task.promise.afterRender = task._afterRender;
      }
      //update content
      _updateContent(task);
      // webCpu.excuteTasks(container, task.appMap || task.appData, task.routeView);
      if (typeof (task.promise.afterRender) === "function") {
        task.promise.afterRender(container, data, task);
      }

    });
  } else {

  }

});