(function () {
  var config = {
    css : "style.css"
  }
  webCpu.regComponent("NavPanel", config, function (container, data, task) {
	if (!task.cards && task.requestType === "_jsonp") {
      task.cards = {};
      if (data && data.cardData) {
        data.cardData.map(function (item) {
          if (item.cardName) {
            task.cards[item.cardName] = item;
          }
        });
      }
	  task.data = data.cardData;
	  data = data.cardData;
    }  
    if(task.mode) {
      container.setAttribute("mode", task.mode);
    }
    var nav = document.createElement("ul");
    nav.setAttribute("class", "NavIndex");
    container.appendChild(nav);
    var sheet = document.createElement("div");
    sheet.setAttribute("class", "NavSheetArea");
	if(task.flag) {
		sheet.setAttribute("flag", task.flag);
		nav.setAttribute("flag", task.flag);
	}
    container.appendChild(sheet);
    task.sheets = {};
    task.navItems = {};
    for (var i = 0; i < data.length; i++) {
      var li = document.createElement("li");
      if (typeof(data[i]) === "string") {
        var nvName = data[i]
      } else {
        var nvName = data[i].cardName;
      }	  
      if (nvName) {
        li.innerHTML = (task.dataMap && task.dataMap[nvName]) || nvName;
        li.setAttribute("flag", nvName);
        nav.appendChild(li);
        var sheetItem = document.createElement("div");
        sheetItem.setAttribute("class", "NavSheet");
        sheet.appendChild(sheetItem);
        var _sheetItem = document.createElement("div");
        _sheetItem.setAttribute("class", "_NavSheet");
        sheetItem.appendChild(_sheetItem);
        task.sheets[nvName] = _sheetItem;
        task.navItems[nvName] = li;
      }

      if (data[i].task) {
		webCpu.addCardItem(_sheetItem, data[i], webCpu["NavPanel"].config && webCpu["NavPanel"].config.path);        
      } else if (typeof(data[i].template) === "string") {
        _sheetItem.innerHTML = data[i].template.bindData(data[i].data);
      } else {}
    }

    
	if(task.flag) {
		var navSheet = $(container).find(".NavSheetArea[flag="+task.flag+"]>.NavSheet");
		var navIndex = $(container).find(".NavIndex[flag="+task.flag+"]>li");
	}
	else {
		var navSheet = $(container).find(".NavSheet");
		var navIndex = $(container).find(".NavIndex li");
	}
    
    navIndex.on("click", function () {
      navIndex.removeClass("active");
      $(this).addClass("active");
      var index = $(this).index();
	  
      navSheet.hide();
      navSheet.eq(index).show();
      if (typeof(task.promise.switchPanel) === "function") {
        task.promise.switchPanel(navSheet.eq(index)[0], $(this).attr("flag"), task);
      }
	  // var data =  task.data[index];
	  // if (data.className) {
		// webCpu.addCardItem(_sheetItem, data, webCpu["NavPanel"].config && webCpu["NavPanel"].config.path);        
      // }
    })
    navIndex.eq(0).click();
  });

  webCpu["NavPanel"].switchNavPanel = function (container, n) {
    var navIndex = $(container).find(".NavIndex li");
    navIndex.eq(n - 1).click();
  }

})();
