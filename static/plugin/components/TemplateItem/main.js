webCpu.regComponent("TemplateItem", {}, function (container, data, task) {
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
  try {
    task.template = unescape(task.template);
  } catch (e) {

  }

  if ((task.template && -1 != task.template.search("<")) || !task.template || !task.remote) {
    container.innerHTML = task.template.bindData(data);
    webCpu.excuteTasks(container, task.cards, webCpu.TemplateItem.config.path);
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
      container.innerHTML = str.bindData(data);
      webCpu.excuteTasks(container, task.cards, webCpu.TemplateItem.config.path);
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

});