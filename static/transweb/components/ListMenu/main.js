webCpu.regComponent("ListMenu", {
  html: '<div class="panel-group" role="tablist" aria-multiselectable="true"></div>',
  css: "style.css"
}, function (container, data, task) {
  var accordionId = "accordion-" + (new Date()).getTime();
  $(container).find(".panel-group").attr("id", accordionId);
  for (let i = 0; i < data.length; i++) {
    var panelId = accordionId + i;
    var title = data[i].title;
    var tTitle = data[i].template || task.template || title;

    var tData = data[i].data || {};
    tData.title = tData.title || title || "";
    tData.description = tData.description || data[i].description;
    tTitle = tTitle.bindData(tData);

    if (data[i].tips) {
      tTitle += "( <span>" + data[i].tips + "</span> )";
    }

    if (data[i].icon) {
      tTitle = "<img src='" + data[i].icon + "' style='width: 25px; height: 25px;' />"
    }

    if (data[i].content && data[i].content.constructor.name === "Array" && data[i].content.length !== 0) {
      tTitle += '<span class="caret"></span>';
    }

    var panelSelector = $('<div class="panel panel-default">\
                      <div class="panel-heading" role="tab" id="heading-' + panelId + '">\
                          <h3 class="panel-title" index="' + i + '">\
                              <a role="button" data-toggle="collapse" data-parent="#' + accordionId + '" data-target="#collapse-' + panelId + '" aria-expanded="true"  title="' + tData.title + '" aria-controls="collapse-' + panelId + '">' + tTitle + '</a>\
                          </h3>\
                      </div>\
                      <div id="collapse-' + panelId + '" class="panel-collapse collapse out" role="tabpanel" aria-labelledby="heading-' + panelId + '">\
                      </div>\
                </div>');
    $(container).find(".panel-group").append(panelSelector);
    panelSelector.attr("path", data[i].path);
    panelSelector.attr("url", data[i].url);
    panelSelector.attr("index", i);
    // panelSelector.find(".panel-title").attr("flag", flag);
    if (!task.toggle) {
      panelSelector.find(".panel-title>a").attr("href", "");
    }

    if (data[i].style) {
      panelSelector.find(".panel-title").css(data[i].style);
    }

    panelSelector.on("click", function (e) {
      if((data[i].content && data[i].content.constructor.name !== "Array") || !data[i].content || data[i].content.length === 0) {
        $(task.container).find(".panel").attr("active", 0);
        $(task.container).find(".list-group-item").attr("active", 0);
        $(e.currentTarget).attr("active", 1);
      }

      if(typeof task.clickCallback === "function") {
        task.clickCallback(data[i]);
      }
    });
    
    if (typeof (data[i].content) === "string") {
      $(container).find("#" + "collapse-" + panelId).html('<div class="panel-body">' + data[i].content + '</div>');

    } else if (data[i].content && data[i].content.constructor.name === "Array" && data[i].content.length !== 0) {
      var selector = $('<ul class="list-group"></ul>');
      for (let j = 0; j < data[i].content.length; j++) {
        var tItem = data[i].content[j];
        var title = tItem.title;
        var str = tItem.template || task.template || title;
        var tData = tItem.data || {};
        tData.title = tData.title || tItem.title || "";
        tData.description = tData.description || tItem.description;
        str = str.bindData(tData);

        var tSelector = $('<li index="' + (i + "-" + j) + '" class="list-group-item" title="' + tData.title + '"><a>' + str + '</a></li>');

        if (tItem.style) {
          tSelector.css(tItem.style);
        }

        tSelector.appendTo(selector);
        tSelector.attr("path", data[i].content[j].path);
        tSelector.attr("url", data[i].content[j].url);
            tSelector.on("click", function (e) {
              $(task.container).find(".panel").attr("active", 0);
              $(task.container).find(".list-group-item").attr("active", 0);
              $(e.currentTarget).attr("active", 1);
              $(e.currentTarget).parent().parent().parent().attr("active", 1);
              if(typeof task.clickCallback === "function") {
                task.clickCallback(data[i].content[j], data[i]);
                return false;
              }
            });
         
        
      }
      $(container).find("#" + "collapse-" + panelId).html("");
      $(container).find("#" + "collapse-" + panelId).append(selector);
    } else {
      $(container).find("#" + "collapse-" + panelId).remove();
    }
  };
  if (task.open === true) {
    $(container).find(".panel-group .panel-collapse").removeClass("out");
    $(container).find(".panel-group .panel-collapse").addClass("in");
  }
  for (var i = 0; task.open && i < task.open.length; i++) {
    $(container).find(".panel-group .panel-collapse").eq(task.open[i]).removeClass("out");
    $(container).find(".panel-group .panel-collapse").eq(task.open[i]).addClass("in");
  }
});

