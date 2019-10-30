webCpu.regComponent("CodeBlock", {
	css: "style.css"
}, function (container, data, task) {
	webCpu.CodeBlock.initRadios(task);
	$(container).html("<div class='blocksHead'><label stye='float: left;' class='fileNameArea'>" + (task.option.fileName || "项目文件") + "</label><label class='CodeBlock_openFilesTree openTreeBtn'>查看项目文件结构</label></div>\
					  <div class='blocksArea'></div>");

	task.blocksArea = $(container).find(".blocksArea")[0];
	task.blocksHead = $(container).find(".blocksHead")[0];

	webCpu.CodeBlock.displayFileBlock(task, task.option.initStart || 0);

	webCpu.CodeBlock.initBlockTips(task);

	webCpu.CodeBlock.initFilesArea(task);
});

webCpu.CodeBlock.displayFileBlock = function (task, index) {
	if(!task.option.block) {
		return false;
	}
	if (!task.option.block[index] && index < task.option.block.length) {
		webCpu.CodeBlock.shuffleBlocks(task, index);
	} else {
		webCpu.CodeBlock.shuffleBlocks(task, 0);
	}
	for (var j = 0; j < task.option.block.length; j++) {
		webCpu.CodeBlock.initBlock(task, j);
	}
}

webCpu.CodeBlock.initBlock = function (task, index) {
	var elemSelector = $("<div index='" + index + "'></div>");
	var tElem = $(task.container).find(".blocksArea");
	elemSelector.appendTo(tElem);
	elemSelector.css({
		float: "left",
		position: "relative",
		width: "100%",
		display: "block"
	});
	var block = task.option.block[index];
	var textArea = webCpu.CodeBlock.produceBlock(task, index);
	textArea[0].value = textArea.val().replace(/\n$/, "");
	textArea.appendTo(elemSelector);
	webCpu.CodeBlock.resizeTextArea(textArea);
	if(block.comments) {
		var comments = $("<textarea class='commentsTextarea'></textarea>");
		comments.css({
			color: "#666",
			margin: "0px",
			padding: "0px",
			width: "100%", 
			resize: "none", 
			border: "none",
			marginBottom: "-8px"
		});
		comments.attr("rows", 1);
		comments.attr("readonly", "readonly");
		comments.val(block.comments);
		comments.prependTo(elemSelector);
		webCpu.CodeBlock.resizeTextArea(comments, 1);
	}
}

webCpu.CodeBlock.switchInputMode = function (task, index, callback) {
	var elemSelector = $(task.container).find(".blocksArea").children("div[index=" + index + "]");
	elemSelector.html("");
	var block = task.option.block[index];
	var textArea = $("<textarea class='codeInputTextarea' style='width: 100%; resize: none;'></textarea>");
	textArea[0].value = textArea.val().replace(/\n$/, "");
	textArea.appendTo(elemSelector);
	textArea.attr("rows", block.end - block.start + 1);
	if(block.comments) {
		var comments = $("<textarea class='commentsTextarea'></textarea>");
		comments.css({
			color: "#666",
			margin: "0px",
			padding: "0px",
			width: "100%", 
			resize: "none", 
			border: "none",
			marginBottom: "-8px"
		});
		comments.attr("rows", 1);
		comments.attr("readonly", "readonly");
		comments.val(block.comments);
		comments.prependTo(elemSelector);
		webCpu.CodeBlock.resizeTextArea(comments, 1);
	}
	var submitArea = $("<div style='width: 100%; text-align: right;'><label class='confirmErrorTips' style='padding-top: 6px; display: inline-block; width: calc( 100% - 70px ); color: #f3abaa; margin-right: 10px;'></label>\
								<label class='confirmSuccessTips' style='display: none; font-size: 12px; width: 35px; height: 35px; border-radius: 100%; padding-top: 10px; text-align: center; display: none; color: #fff; background-color: #59dd00; margin: 0px;'>正确</label>\
								<button index='" + index + "' class='btn btn-primary confirmBtn'>确认</buttoon></div>").appendTo(elemSelector);
	submitArea.find(".confirmBtn").on("click", function () {
		var j = $(this).attr("index");
		var tBlock = task.option.block[j];
		var str = submitArea.parent().find("textarea.codeInputTextarea").val();
		var ret = webCpu.CodeBlock.check(task, j);
		var inputSelector = submitArea.parent().find("textarea.codeInputTextarea");
		if (ret) {
			tBlock.input = str;
			submitArea.find(".confirmErrorTips").html("");
			submitArea.find(".confirmSuccessTips").show();
			submitArea.find(".confirmBtn").hide();
			task.tipsDiv.hide();
			setTimeout(function () {
				submitArea.find(".confirmSuccessTips").hide();
				submitArea.find(".confirmErrorTips").hide();
				submitArea.find(".confirmBtn").hide();
				submitArea.parent().attr("state", "active");
				
				webCpu.CodeBlock.resizeTextArea(inputSelector);
				inputSelector.on("change", function() {
					webCpu.CodeBlock.resizeTextArea(inputSelector);
				});
				submitArea.parent().find("textarea").attr("readonly", "readonly");
				tBlock.inputed = true;
				if (typeof (callback) === "function") {
					if(tBlock.played) {
						callback();
					}
				}
			}, 300);
		} else {
			//tool tips showing
			submitArea.find(".confirmErrorTips").html("错误, 请仔细对比左侧代码提示。");
			submitArea.find(".confirmSuccessTips").hide();
			submitArea.find(".confirmBtn").show();
		}

	});

	var inputSelector = submitArea.parent().find("textarea.codeInputTextarea");

	if (!isMobile && !task.hideTips && task.option.mode !== "exam") {
		webCpu.CodeBlock.switchBlockTips(task, index);
	} else {
		task.tipsDiv.hide();
		webCpu.CodeBlock.selectBlock(task, index, function () {
			submitArea.find(".confirmSuccessTips").hide();
			submitArea.find(".confirmErrorTips").hide();
			submitArea.find(".confirmBtn").hide();
			submitArea.parent().find("textarea").attr("readonly", true);
			var tBlock = task.option.block[index];
			var blockSelectArea = $(task.cardBody).find(".CardItem_mask").find(".blockSelectArea");
			tBlock.input = blockSelectArea.find("textarea[index=" + index + "]").val();
			inputSelector.val(tBlock.input); 
			submitArea.parent().attr("state", "active");
			tBlock.inputed = true;
			webCpu.CodeBlock.resizeTextArea(inputSelector);
			inputSelector.on("change", function(){
				webCpu.CodeBlock.resizeTextArea(inputSelector);
			});
			if (typeof (callback) === "function") {
				if(tBlock.played) {
					callback();
				}
			}
		});
	}
}

webCpu.CodeBlock.selectBlock = function (task, index, callback, count) {
	webCpu["CardItem"].switchMask(task, "html", "<div style='float: left; color: #000;  background-color: #fff; border-radius: 5px;   padding: 5px 15px; display: block; position: relative; width: calc( 100% - 10px ); max-width: 500px;'><h3 style='position: relative; float: left; margin: 5px 0px; text-align: left; width: 100%; font-size: 16px;'><label class='selectTitle'>请选择</label><label style='float: right; font-size: 16px; display: none;' class='selectResult'>正确</label></h3>\
													 <div class='blockSelectArea' correct='" + index + "' style='float: left; width: 100%; height: auto; max-height: 400px; overflow: auto; position: relative;'></div></div>");

	var selectArea = $(task.cardBody).find(".CardItem_mask").find(".blockSelectArea");
	selectArea.html("");
	count = count || 2;
	var arr = [];
	var textArea = webCpu.CodeBlock.produceBlock(task, index);
	textArea[0].value = textArea.val().replace(/\n$/, "");
	arr.push(textArea);
	var m = task.option.block.length - 1;
	for (var i = 0; i < count - 1; i++) {
		var n = ((Math.random() * m) >> 0);
		if (n === index) {
			n = ((Math.random() * m) >> 0);
		}
		textArea = webCpu.CodeBlock.produceBlock(task, n);
		textArea[0].value = textArea.val().replace(/\n$/, "");
		if (n % 2 === 0) {
			arr.push(textArea);
		} else {
			arr.unshift(textArea);
		}
	}

	for (let j = 0; j < arr.length; j++) {
		let blockItem = $("<p flag='" + j + "' class='blockItem'></p>");
		blockItem.css({
			border: "1px solid #ddd",
			padding: "5px",
			borderRadius: "5px",
			boxShadow: "-1px -1px 1px inset #000"
		});
		arr[j].appendTo(blockItem);
		blockItem.appendTo(selectArea);
		webCpu.CodeBlock.resizeTextArea(arr[j]);
	}

	$(task.cardBody).find(".CardItem_mask").find(".blockSelectArea>.blockItem").on("click", function () {
		var correct = $(this).parent().attr("correct");
		let index = $(this).children("textarea").attr("index");
		if (correct === index) {
			$(task.cardBody).find(".CardItem_mask").find(".selectResult").css({
				display: "inline-block",
				color: "green"
			});
			$(task.cardBody).find(".CardItem_mask").find(".selectResult").html("正确");
			setTimeout(function () {
				webCpu["CardItem"].dismissMask(task);
				if (typeof (callback) === "function") {
					callback(task, index);
				}
			}, 300);
		} else {
			$(task.cardBody).find(".CardItem_mask").find(".selectResult").html("错误, 请重试");
			$(task.cardBody).find(".CardItem_mask").find(".selectResult").css({
				display: "inline-block",
				color: "red"
			});
		}
	})

}



webCpu.CodeBlock.resizeTextArea = function (textArea, flag) {
	var rows = (textArea[0].scrollHeight - textArea[0].scrollTop - Number(textArea.css("padding-top").replace("px", "")) - Number(textArea.css("padding-bottom").replace("px", ""))) / Number(textArea.css("line-height").replace("px", ""));
	rows = Math.ceil(rows);
	if(BrowserName === "WeixinBrowser" && !flag) {
		rows += 1;
	}
	textArea.attr("rows", rows);
	textArea.css("height", "auto");
}

webCpu.CodeBlock.produceBlock = function (task, k, flag) {
	var block = task.option.block[k];
	var code = task.data[block.start];
	if (flag) {
		var ts = "";
		for (var index = 0; code[index] === " "; index++) {
			ts += code[index];
		}
		code = code.replace(ts, "");
	}

	for (var i = block.start + 1; i < task.data.length && i < block.end + 1; i++) {
		var tStr = task.data[i];
		if (flag) {
			tStr = tStr.replace(ts, "");
		}
		code += "\n" + tStr;
	}
	var textArea = $("<textarea class='codeContentTextarea' index='" + k + "' style='width: 100%; resize: none; color: #000;'></textarea>");
	textArea.attr("rows", block.end - block.start);
	code = code.replace(/\n$/, "");
	textArea.val(code);
	textArea[0].value = textArea.val().replace(/\n$/, "");
	textArea.css({
		border: "none",
		backgroundColor: "transparent"
	});
	textArea.attr("disabled", true);
	return textArea;
}


webCpu.CodeBlock.getBlocksHight = function (task, index) {
	var height = 0;
	if (index === undefined) {
		index = task.option.block.length;
	}
	var selector = $(task.container).find(".blocksArea").children("div");
	for (var i = 0; i < selector.length - 1 && i < index; i++) {
		height += selector.eq(i).height();
	}
	return height;
}

webCpu.CodeBlock.getTipsPos = function (task, index) {
	var pos = 20;
	//var maxHeight = $(task.blocksArea).height();
	// var bottomPos = this.getBlocksHight(task, index);
	// var scrollTop = task.blocksArea.scrollTop;
	// pos = bottomPos - scrollTop - 20;
	// var tHeight = $(task.tipsDiv).height();
	// if (bottomPos + tHeight > maxHeight) {
	// 	pos = maxHeight - tHeight - 100;
	// } else {
	// 	pos = bottomPos + 30;
	// }
	return pos;
}

webCpu.CodeBlock.initBlockTips = function (task) {
	task.tipsDiv = $("<div class='CodeBlock_tipsArea'><div class='CodeBlock_tipsContent'></div><span class='CodeBlock_tipsArrow'></span></div>");
	task.tipsDiv.prependTo($(task.container));
	task.tipsDiv.hide();
}

webCpu.CodeBlock.switchBlockTips = function (task, index) {
	task.tipsDiv.find(".CodeBlock_tipsContent").html("");
	var textArea = webCpu.CodeBlock.produceBlock(task, index, 1);
	textArea[0].value = textArea.val().replace(/\n$/, "");
	textArea.appendTo(task.tipsDiv.find(".CodeBlock_tipsContent"));
	var pos = webCpu.CodeBlock.getTipsPos(task, index);
	task.tipsDiv.css({
		display: "inline-block",
		top: pos + "px"
	});
	webCpu.CodeBlock.resizeTextArea(textArea);
	return textArea;
}


webCpu.CodeBlock.initFilesArea = function (task) {
	if (task.option.files && (!isMobile && !task.hideFileTree)) {
		if (task.filesArea) {
			task.filesArea.remove();
		}
		task.filesArea = $("<div class='CodeBlock_filesArea'><div style='padding-left: 20px; width: 100%; height: 28px; display: flex; justify-content:left; align-items:center;'>项目文件结构</div>\
		<div class='filesTree' style='padding: 8px; width: 100%; box-shadow: 0px 1px 0px inset #e2e2e2; height: calc( 100% - 30px ); overflow: auto;'></div></div>");
		task.filesArea.appendTo($(task.container));
		$(task.container).find(".openTreeBtn").hide();
	} else if(task.option.mode !== "exam") {
		$(task.container).find(".openTreeBtn").show();
	}
	else {
		$(task.container).find(".openTreeBtn").hide();
	}
}



webCpu.CodeBlock.shuffleBlocks = function (task, start) {
	if (!task.option || !task.option.block) {
		return false;
	}
	for (var i = 0; i < task.option.block.length; i++) {
		task.option.block[i].type = "visible";
	}
	task.option.currentSteps = [];
	var k = start || 0;
	while (k < task.option.block.length) {
		var n = ((Math.random() * 3) >> 0) + 3;
		k += n;
		if (task.option.block[k]) {
			task.option.block[k].type = "input";
			task.option.currentSteps.push(k);
		}
	}

}


webCpu.CodeBlock.initRadios = function (task) {
	if (!task.option || !task.option.block) {
		return false;
	}
	webCpu._audioArr = webCpu._audioArr || [];
	for (var i in webCpu._audioArr) {
		webCpu._audioArr[i].pause();
	}
	webCpu._audioArr = [];
	task.audio = new Audio();
	webCpu._audioArr.push(task.audio);
}

webCpu.CodeBlock.dealCodeBlock = function (data, flag) {
	if (typeof (data) === "string") {
		data = data.split("\n");
	}

	var code = $.trim(data[0]);

	if (!code) {
		return "";
	}

	if (flag) {
		var ts = "";
		for (var index = 0; code[index] === " "; index++) {
			ts += code[index];
		}
		code = code.replace(ts, "");
	}

	for (var i = 1; i < data.length && i < data.length; i++) {
		var tStr = data[i];
		if (flag) {
			tStr = tStr.replace(ts, "");
		}
		if (tStr && tStr != " " && tStr != "\n")
			code += "\n" + $.trim(tStr);
	}
	return js_beautify(code);
}

webCpu.CodeBlock.check = function (task, index) {
	var ret = true;
	var str = $(task.container).find("div[index=" + index + "]>textarea.codeInputTextarea").val();
	str = this.dealCodeBlock(str, flag);
	//check
	var d = [];
	var block = task.option.block[index];
	for (var i = block.start; i < block.end + 1; i++) {
		d.push(task.data[i]);
	}
	var cStr = this.dealCodeBlock(d);

	ret = (str === cStr);

	return ret;
}


webCpu.CodeBlock.play = function (task, index, callback) {
	var ret = false;
	var block = task.option.block[index];
	if(block.audioSrc && task.audio) {
		task.audio.pause();
		task.audio.src = block.audioSrc;
		task.audio.play();
		task.audio.onended = function() {
			block.played = true;
			if(block.type !== "input" || (block.type === "input" && block.inputed === true)) {
				callback();
			}
		};
		ret = true;
	}
	else {
		block.played = true;
	}	
	return ret;
}

