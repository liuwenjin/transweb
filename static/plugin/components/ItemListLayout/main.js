webCpu.regComponent("ItemListLayout", {
  css: "style.css"
}, function (container, data, task) {
  if (data) {
    task.containers = [];
    if (task.minWidth) {
      var max = Math.floor($(container).width() / task.minWidth) || 1;
      task.column = Math.min(max, task.column);
    }
    if(task.ratio) {
      var w = 100 / (task.column || 1);
      var h = w * (task.ratio || 1);
    }
    else {
      var w = task.width || 50;
      var h = task.height || 50;
      var t = Math.floor($(container).width() / ( w + 10 ));
      task.column = Math.min(t, task.column);
    }
    
    for (var i = 0; i < data.length; i++) {
      var div = document.createElement("div");
      div.setAttribute("class", "ItemListLayout_item");
      container.appendChild(div);
      if(task.ratio) {
        $(div).css("width", w + "%");
        $(div).css("padding-bottom", h + "%");
      }
      else {
        $(div).css("width",  w);
        $(div).css("padding-bottom", h);
      }
      
      var area = document.createElement("div");
      area.setAttribute("class", "ItemListLayout_container");
      area.setAttribute("index", i);
      div.appendChild(area);
      task.containers.push(area);
      if (data[i] && data[i].task) {
        var cTask = webCpu.transferCardData(area, data[i], task.options, task.promise.initCard);
        webCpu.render("CardItem", cTask, data[i].path || (webCpu["ItemListLayout"].config && webCpu["ItemListLayout"].config.path));
        $(area).parent().find(".ItemListLayout_container>.CardItem").attr("index", i);
      } else if (data[i] && typeof (data[i]) === "object") {
        var template = data[i].template || task.template;
        area.innerHTML = template.bindData(data[i]);
      } else {
        area.innerHTML = data[i];
      }
    }
  }
});