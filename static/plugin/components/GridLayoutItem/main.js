webCpu.regComponent("GridLayoutItem", {
	script: {
		muuri: "muuri.min.js"
	},
	css: "style.css"
}, function (container, data, task) {
	$(container).html("");
	var gridItem = $('<div class="grid"></div>');
	task.gridBox = gridItem[0];
	for (let k in data) {
		var d = data[k];
		// var str = d;
		// if (typeof (d) !== "string" && d) {
		// 	str = d.text || "";
		// }
		// var iSelector = $('<div class="item"><div class="item-content">' + str + '</div></div>');
		// if (d && d.style) {
		// 	iSelector.css(d.style);
		// }
		// iSelector.appendTo(gridItem);
		webCpu.GridLayoutItem.addItem(d, task);
	}
	gridItem.appendTo($(container));

	
	var elem = $(container).find(".grid")[0];
	var option = task.option || {
		item: ".item"
	}
	task.grid = new Muuri(elem, option);
});

webCpu.GridLayoutItem.addItem = function (d, task) {
	gridBox = task.gridBox;
	var str = d;
	if (typeof (d) !== "string" && d) {
		str = d.text || "";
	}
	var len = $(gridBox).children(".item").length;
	var iSelector = $('<div index='+ len +' class="item"><div class="item-content"><div class="grid-card">' + str + '</div><span class="close-card fa fa-times" title="删除"></span></div></div>');
	if (d && d.style) {
		iSelector.css(d.style);
	}
	iSelector.appendTo($(gridBox));

	iSelector.find(".close-card").on("click", function() {
		task.grid.hide(iSelector[0]);
	});
}

webCpu.GridLayoutItem.getSortedData = function(task, flag) {
	var arr = task.grid.getItems();
	var d = [];
	var myItems = arr.sort(function(a, b) {
		var transformA = a._element.style.transform;
		var transformB = b._element.style.transform;
		if(flag === "x") {
			re = /translateX\(([0-9]+)px\)/i;
		}
		else {
			re = /translateY\(([0-9]+)px\)/i;
		}
		var ret = Number(transformA.match(re)[1]) - Number(transformB.match(re)[1]);
		return ret;
	}); 
	for(var i = 0; i < myItems.length; i++) {
		var elem = myItems[i]._element;
		if(!$(elem).is(":hidden")) {
			var index = $(elem).attr("index");
			d.push(task.data[index]);
		}
	}
	return d;
}