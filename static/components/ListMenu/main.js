webCpu.regComponent("ListMenu", {
	html: '<div class="panel-group" role="tablist" aria-multiselectable="true"></div>',
	css: "style.css"
}, function (container, data, task) {
	var accordionId = "accordion-" + (new Date()).getTime();
	$(container).find(".panel-group").attr("id", accordionId);
	for (var i = 0; i < data.length; i++) {
		var panelId = accordionId + i;
		var tTitle = data[i].title;

		if (data[i].tips) {
			tTitle += "( <span>" + data[i].tips + "</span> )";
		}

		if(data[i].icon) {
			tTitle = "<img src='"+data[i].icon+"' style='width: 25px; height: 25px;' />"
		}

		var flag = "child";
		if (data[i].content && data[i].content.constructor.name === "Array" && data[i].content.length !== 0) {
			tTitle += '<span class="caret"></span>';
			//flag = "parent";
		}
		else {
			//<span class="fa fa-chevron-right"></span>
			//tTitle += '<span style="display: inline-block; position: relative; margin-right: 5px; color: #999; float: right;" class="fa fa-angle-right"></span>';
		}

		var panelSelector = $('<div class="panel panel-default">\
                                    <div class="panel-heading" role="tab" id="heading-' + panelId + '">\
                                        <h3 class="panel-title">\
                                            <a role="button" data-toggle="collapse" data-parent="#' + accordionId + '" href="#collapse-' + panelId + '" aria-expanded="false"  title="' + data[i].title + '" aria-controls="collapse-' + panelId + '">' + tTitle + '</a>\
                                        </h3>\
                                    </div>\
                                    <div id="collapse-' + panelId + '" class="panel-collapse collapse out" role="tabpanel" aria-labelledby="heading-' + panelId + '">\
                                    </div>\
                              </div>');
		$(container).find(".panel-group").append(panelSelector);
		panelSelector.attr("path", data[i].path);
		panelSelector.attr("index", i);
		// panelSelector.find(".panel-title").attr("flag", flag);

		if (data[i].action || data[i].type) {
			(function () {
				var tAction = data[i].action;
				if (!tAction) {
					var type = data[i].type;
					var title = data[i].title
					tAction = webCpu.ListMenu.generateFunction(data[i].type, data[i].path, data[i].title);
				}
				panelSelector.on("click", function(e) {
					$(task.container).find(".panel").attr("active", 0);
					$(e.currentTarget).attr("active", 1);
					tAction(e);
				});
			})();
		} else if (data[i].path) {
			(function () {
				var url = Interface.transweb + "?state=app&flag=1&path=" + data[i].path;
				panelSelector.find(".panel-title").on("click", function () {
					location.href = url;
				});
			})();
		} else {

		}


		if (typeof (data[i].content) === "string") {
			$(container).find("#" + "collapse-" + panelId).html('<div class="panel-body">' + data[i].content + '</div>');

		} else if (data[i].content && data[i].content.constructor.name === "Array" && data[i].content.length !== 0) {
			var selector = $('<ul class="list-group"></ul>');
			for (var j = 0; j < data[i].content.length; j++) {
//				var tSelector = $('<li class="list-group-item" title="' + data[i].content[j].title + '"><a>' + data[i].content[j].title +
//					'<span style="display: inline-block; position: relative; margin-top: 2px; margin-right: 5px; color: #999; float: right;" class="fa fa-angle-right"></span>' + '</a></li>');
				var tSelector = $('<li class="list-group-item" title="' + data[i].content[j].title + '"><a>' + data[i].content[j].title + '</a></li>');
					
				tSelector.appendTo(selector);
				tSelector.attr("path", data[i].content[j].path);
				if (typeof (data[i].content[j].action) === "function" || data[i].content[j].type) {
					(function () {
						var tAction = data[i].content[j].action;
						if (!tAction) {
							var type = data[i].content[j].type;
							var title = data[i].content[j].title
							tAction = webCpu.ListMenu.generateFunction(data[i].content[j].type, data[i].content[j].path, data[i].content[j].title);
						}
						tSelector.on("click", function(e){
							$(task.container).find(".panel").attr("active", 0);
							$(e.currentTarget).attr("active", 1);
							tAction(e);
						});
					})();
				} else if (data[i].content[j].path) {
					(function () {
						var url = Interface.transweb + "?state=app&flag=1&path=" + data[i].content[j].path;
						tSelector.on("click", function () {
							location.href = url;
						});
					})();
				} else {}
			}
			$(container).find("#" + "collapse-" + panelId).html("");
			$(container).find("#" + "collapse-" + panelId).append(selector);
		} else {
			$(container).find("#" + "collapse-" + panelId).remove();
		}
	};
	
	for (var i = 0; task.open && i < task.open.length; i ++) {
		$(container).find(".panel-group .panel-collapse").eq(task.open[i]).removeClass("out");
		$(container).find(".panel-group .panel-collapse").eq(task.open[i]).addClass("in");
	}
});

webCpu.ListMenu.generateFunction = function (type, path, title) {
	var n = $(webCpu.cards.transweb.task.cardBody).attr("cardName");
	var n = "transwebView";
	if (type === "article") {
		var func = function (e) {
			webCpu.CardItem.dismissMask(webCpu.cards.transwebView);
			webCpu.CardItem.maskDialog(webCpu.cards[n], "webApps/article.js", title, null, function (c, d, t) {
				d.task.url = path;
			})
		}
	} else if (type === "case") {
		var func = function (e) {
			webCpu.CardItem.dismissMask(webCpu.cards.transwebView);
			webCpu.previewMicroService(path, title, "edit");
		}
	} else if (type === "card") {
		var func = function (e) {
			webCpu.CardItem.dismissMask(webCpu.cards.transwebView);
			webCpu.CardItem.maskDialog(webCpu.cards[n], path, title, null);
		}
	} else {}

	return func;
}