webCpu.regComponent("CanvasItem", {
	script: {
		scene: "canvasScene.js",
		qrcode: "qrcode.js"
	}
}, function (container, data, task) {
	container.innerHTML = "";
	var canvas = document.createElement("canvas");
	container.appendChild(canvas);
	var rect = container.getBoundingClientRect();
	canvas.width = rect.width;
	canvas.height = rect.height;

	task.scene = new canvasScene(canvas);
	webCpu["CanvasItem"].initScene(task);
});

webCpu["CanvasItem"].switchScene = function (task, data) {
	task = task.task || task;
	if (task.ready === 0) {
		webCpu.CardItem.dismissMask(task);
		task.scene.switchScene(data || task.data);
		if(task && task.promise && typeof(task.promise.afterLoaded) === "function") {
			task.promise.afterLoaded(task.container, task.data, task);
		}
	} else if (data) {
		task.data = data;
	} else {
	}
	var mSelector = $(task.cardBody).children().children(".CardItem_mask");
	mSelector.find(".CardItem_loadedValue").html(task.scene.count - task.ready);
}

webCpu["CanvasItem"].addObject = function (task, obj) {
	task = task.task || task;
	task.scene.addObject(obj);
}

webCpu["CanvasItem"].removeObject = function (task, name) {
	task = task.task || task;
	task.scene.removeByName(name);
}


webCpu["CanvasItem"].initScene = function (task) {
	task.ready = 0;
	webCpu.CardItem.switchMask(task, "html", "<label>加载进度<span class='CardItem_loadedValue'>0</span>/<span class='CardItem_countValue'>*</span></label>")
	this.loadImages(task);
	var mSelector = $(task.cardBody).children().children(".CardItem_mask");
	mSelector.find(".CardItem_countValue").html(task.ready);
	this.switchScene(task);
}

webCpu["CanvasItem"].loadImages = function (task) {
	task.scene.images = {};
	for (var k in task.images) {
		task.ready++;
		var img = new Image();
		img.setAttribute("crossOrigin",'anonymous');
		var url = task.images[k].split("?")[0];
		// img.src = "imageGateway?key=" + url;
		img.src = url;
		img.onload = function () {
			task.ready--;
			webCpu["CanvasItem"].switchScene(task);
		}
		task.scene.images[k] = img;
	}
	task.scene.count = task.ready;
	task.scene.audios = {};
	webCpu._audioArr = webCpu._audioArr || [];
	for(var i in webCpu._audioArr) {
		webCpu._audioArr[i].pause();
	}
	webCpu._audioArr = [];
	for(var j in task.audios) {
		var url = task.audios[j].split("?")[0];
		var audio = new Audio(url);
		// audio.preload = true;
		// audio.autoplay = true;
		// audio.isLoadedmetadata = false;
		// audio.touchstart = true;
		// audio.audio = true;
		task.scene.audios[j] = audio;
		webCpu._audioArr.push(audio);
	}
}