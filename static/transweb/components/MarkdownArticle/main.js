webCpu.regComponent("MarkDownArticle", {
	script: "markdown.min.js"
}, function (container, data, task) {
	function transMarkdown(mArea, data, option) {
		var option = option || {
			parseImgDimensions: true,
			tables: true,
			smoothLivePreview: true,
			tablesHeaderId: true,
			ghCodeBlocks: true,
			tasklists: true
		}
		var converter = new showdown.Converter(option);
		$(mArea).html(converter.makeHtml(data));
		
		$(mArea).find("table").addClass("table table-bordered table-hover");
		var images = $(mArea).find("img").parent().css("text-align", "center");
		$(mArea).find("img").css("width", "auto");
		$(mArea).find("img").css("height", "auto");
		$(mArea).find("img").css("max-width", "100%");
		$(mArea).find("img").css("max-height", "100%");
	
		$(mArea).find("img").parent().css("text-indent", "0px");
	
		var links = $(mArea).find("a");
		for (var i = 0; i < links.length; i++) {
			var tLink = links.eq(i);
			if (tLink.attr("target") === "_mask") {
				tLink.on("click", function () {
					var url = $(this).attr("href");
					var backup = url;
					if (url.match(/.txt$/) || url.match(/.md$/)) {
						url = Interface.article;
					}
					var title = $(this).attr("title") || "链接内容";
					var param = $(this).attr("param") || "";
	
					var pCard = getRightMaskCard();
	
					cardDialog(pCard, url, title, null, function (c, d, t) {
						if (backup != url) {
							d.task.url = backup;
						}
						d.task._param = param;
					});
	
					return false;
				})
			} else if (tLink.attr("target") === "_switch") {
				tLink.on("click", function () {
					var body = $(mArea).parent().parent().parent().parent().attr("cardname");
					var cardName = $(mArea).parent().parent().parent().parent().attr("cardname") || "";
					if (cardName && webCpu.cards[cardName] && webCpu.cards[cardName].task) {
						var url = $(this).attr("href");
						webCpu.cards[cardName].task.url = url;
						webCpu.CardItem.fresh(webCpu.cards[cardName]);
					}
					return false;
				});
			} else if (tLink.attr("download") !== undefined) {
				tLink.on("click", function () {
					if (isMobile) {
						showTips(card, "需要在电脑端浏览器中使用下载功能。", null, {});
						return false;
					}
	
					var url = $(this).attr("href");
	
					if (!url) {
						return true;
					}
					var t = url.split(".");
					var subfix = t[t.length - 1] || "js";
					if (subfix === "js") {
						var name = $(this).attr("download") || "Transweb文档";
					} else {
						var name = $(this).attr("download") || "Transweb程序";
					}
	
					downloadFile(url, name);
	
					return false;
				});
			} else {
				tLink.attr("target", "_blank");
			}
		}
	
		$(mArea).find("a[indent=ignore]").parent().css("text-indent", "0px");
		$(mArea).find("span[indent=ignore]").parent().css("text-indent", "0px");
	}
    transMarkdown(container, data);
});