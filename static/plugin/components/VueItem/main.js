webCpu.regComponent("VueItem", {
  script: "vue.min.js"
}, function (container, data, task) {
  if (data && data.cardData) {
    webCpu.cards = webCpu.cards || {};
    var cards = {};
    data.cardData.map(function (item) {
      if (item.cardName) {
        webCpu.cards[item.cardName] = item;
        cards[item.cardName] = item;
      }
      return item;
    });
  }
  task.template = task.template || "";
  try {
    task.template = unescape(task.template);
  } catch (e) {

  }

  if ((task.template && -1 != task.template.search("<")) || !task.template || !task.remote) {
    container.innerHTML = task.template;
    webCpu.excuteTasks(container, webCpu.TemplateItem.config.path);
    initModel(task);
    if(task.currentModel && task.promise && typeof(task.promise.model[task.currentModel]) ==="function") {
      task.promise.model[task.currentModel](container, data, task);
    }
  } else if (task.template) {
    if (task.promise && task.promise.afterRender) {
      var afterRender = task.promise.afterRender;
      task.promise.afterRender = null;
    }

    

    var htmlFetch = new WebRequest(task.template, "GET");
    htmlFetch({}, function (str) {
      container.innerHTML = str;
      webCpu.excuteTasks(container, webCpu.TemplateItem.config.path, cards);
      initModel(task);
      if (typeof (afterRender) === "function") {
        afterRender(container, data, task);
        task.promise.afterRender = afterRender;
      }
      if(task.currentModel && task.promise && typeof(task.promise.model[task.currentModel]) ==="function") {
        task.promise.model[task.currentModel](container, data, task);
      }

    });
  } else {

  }

  function initModel(task) {
    if(task.currentModel) {
      $(container).children("div").hide();
      $(container).children("div[model=" + task.currentModel + "]").show();
    }    
  }
  



});