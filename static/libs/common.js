webCpu.regComponent("BaiduChartItem", {}, function (container, data, task) {
	task.chart = echarts.init(container);
	task.chart.setOption(task.option);
});

function uploadDialog(card, str, callback, options) {
	webCpu.CardItem.switchMask(card, "html",
		'<div style="text-align: center; background-color: transparent; color: rgba(255,255,255,0.6); position: relative;" class="jumbotron confirmDialog">\
									<button title="关闭" type="button" class="close" ><span aria-hidden="true">×</span><span class="sr-only">Close</span></button>\
																	<h3>提示</h3>\<p class="tipsStringArea"></p>\
																	<p><button class="btn btn-primary form-control fileinput-button"><span>导入配置</span><input id="fileupload" type="file" name="files[]"></button><a href="' +
		options.url +
		'"><button class="btn btn-default form-control" role="button">导出模板</button></a></p>\
																	</div>'
	);
	var mask = $(card.task.container.parentNode.parentNode).children(".CardItem_mask");
	mask.find(".tipsStringArea").html(str);
	mask.find(".btn-primary").on("change", callback);
	mask.find(".close").on("click", function () {
		webCpu.CardItem.dismissMask(card);
	});
}

function uploadFile(fileId, url, param, callback) {
	var fd = new FormData();
	fd.append("file", $('#' + fileId)[0].files[0]);
	for (var k in param) {
		fd.append(k, param[k]);
	}

	$.ajax({
		url: url,
		type: 'post',
		processData: false,
		contentType: false,
		data: fd,
		success: function (data) {			
			if(typeof(callback) === "function") {
				callback(data);
			}				
			$('#' + fileId).val("");		
		},
		dataType: "json"
	})
}


function showTips(card, str, callback, options) {
	webCpu.CardItem.switchMask(card, "html",
		'<div style="text-align: center; background-color: transparent; color: rgba(255,255,255,0.6)" class="jumbotron confirmDialog">\
									<button title="关闭" type="button" class="close" ><span aria-hidden="true">×</span><span class="sr-only">Close</span></button>\
																	<h3>提示</h3>\<p class="tipsStringArea"></p>\
																	<p><button class="btn btn-primary form-control" role="button">确认</button><button class="btn btn-default form-control" role="button">取消</button></p>\
																	</div>'
	);
	var mask = $(card.task.container.parentNode.parentNode).children(".CardItem_mask");
	mask.find(".tipsStringArea").html(str);
	mask.find(".btn-primary").on("click", callback)
	mask.find(".btn-default").on("click", function () {
		webCpu.CardItem.dismissMask(card);
	});
	mask.find(".close").on("click", function () {
		webCpu.CardItem.dismissMask(card);
	});
	if (options) {
		if (options.confirm) {
			mask.find(".btn-primary").html(options.confirm);
		}
		if (options.default) {
			mask.find(".btn-default").html(options.default);
		} else {
			mask.find(".btn-default").hide();
		}
		if (options.defaultCallback) {
			mask.find(".btn-default").off("click");
			mask.find(".btn-default").on("click", options.defaultCallback);
		}
		if(typeof(options.callback) === "function") {
			options.callback(mask[0]);
		}
		if(options.tipsTitle) {
			mask.find(".confirmDialog h3").html(options.tipsTitle);
		}
	}
	mask.find(".tipsStringArea input:eq(0)").focus();

	return mask[0];
}


function modelConfigDialog(code) {
	webCpu.cards.modelItemConfig.task.currentModel = code;
	webCpu.CardItem.dialog(webCpu.cards.modelItemConfig, {
		title: "配置模型: " + code,
		height: "432px",
		size: "388px"
	});
}

function popupModelTips(cardData, elem, code) {
	var props = {
		width: "300px",
		height: "240px",
		top: "25px",
		left: "0px"
	}
	cardData.task.current = code;
	webCpu.render("PopupDialog", {
		props: props,
		container: elem.parentNode,
		renderType: "append",
		data: cardData,
		promise: {
			afterRender: function () {
				$("#tPopupDialog").css("position", "absolute");
			}
		}
	}, "components");
}

function findObjectFromArray (arr, key, value) {
	var ret = -1;
	for(var i = 0; i < arr.length; i++) {
		if(arr[i][key] === value) {
			ret = i;
			break;
		}
	}
	return ret;
}

function removeObjectFromArray (arr, key, value) {
	var index = findObjectFromArray (arr, key, value);
	arr.splice(index, 1);
	if(index !== -1) {
		removeObjectFromArray (arr, key, value)
	}
	return arr;
}

function getRecentDuration(n) {
	var t = new Date();
	var t0 = new Date(t - (n - 1) * 24 * 60 * 60 * 1000);
	return [moment(t0).format("YYYY-MM-DD"), moment(t).format("YYYY-MM-DD")];
};
var DataTool = {
	fillAxisData: function (from, to) {
		var data = [];
		var t = moment(from);
		var t1 = moment(to);
		for (var i = t; i < t1 + 1; i += 24 * 60 * 60000) {
			data.push(moment(i).format("YYYY-MM-DD"));
		}
		return data;
	},
	fillSeriesData: function (from, to) {
		var data = [];
		var t = moment(from);
		var t1 = moment(to);
		for (var i = t; i < t1 + 1; i += 24 * 60 * 60000) {
			data.push(0);
		}
		return data;
	}
};
var DURATION = getRecentDuration(7);

var RealTimeModel = ["MH002", "MC005", "MG001"];
var ModelForAll = ["MG001", "MC005", "MH002"];
var NoNeedRestdudy = ["MC003"];


var InputCheck = {
	checkNumber:function(card, str, name, max, min) {
		var ret = {
			code: 0,
			message: "验证通过"
		}
		var t = Number(str);
		var max = max || Infinity;
		var min = min || 0;
		if(t) {			
			if(t < min) {
				ret.code = 1;
				ret.message = name + "不可小于" + min;
			}
			else if(t > max) {
				ret.code = 1;
				ret.message = name + "不可大于" + max;
			}
			else {}
		}
		else {
			ret.code = 1;
			ret.message = name + "必须为数字";
		}
		return ret;
	},
	checkStringLength: function(str, name, max, min) {
		var ret = {
			code: 0,
			message: "验证通过"
		}
		var max = max || Infinity;
		var min = min || 0;
		var t = str.length;
		if(t) {			
			if(t < min) {
				ret.code = 1;
				ret.message = name + "长度不可小于" + min;
			}
			else if(t > max) {
				ret.code = 1;
				ret.message = name + "长度不可大于" + max;
			}
			else {}
		}
		return ret;
	},
	checkStringRule: function(str, rule, message) {
		 
	}
}
