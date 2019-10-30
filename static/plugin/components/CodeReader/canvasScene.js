var canvasScene = function (cxt, objArray, defaultInfo) {
    if (typeof (cxt) === "string") {
        var elem = document.getElementById(cxt);
        this.context = elem.getContext("2d");
    } else if (cxt.nodeName === "CANVAS") {
        this.context = cxt.getContext("2d");
    } else {
        this.context = cxt;
    }

    this.defaultInfo = defaultInfo;
    this.canvas = this.context.canvas;
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    this.objects = objArray || [];
}

canvasScene.prototype.initEvent = function () {
    var eList = {};
    window.onkeydown = "";
    window.onkeypress = "";
    window.onkeyup = "";
    for (var k in this.objects) {
        if (this.objects[k].dna.events) {
            for (var i in this.objects[k].dna.events) {
                eList[i] = eList[i] || [];
                eList[i].push(this.objects[k].dna.id);
            }
        }
    }

    var _self = this;
    for (var k in eList) {
        var t = eList[k].join(",");
        window[k] = function (e) {
            var arr = t.split(",");
            var type = "on" + e.type;
            for (var j = 0; j < arr.length; j++) {
                var role = _self.getObjectById(arr[j]);
                var func = role.dna.events[type];
                if (typeof (func) === "function") {
                    role.dna.events[type](e, role, _self);
                }
            }
        }
    }
}

canvasScene.prototype.switchScene = function (objArray) {
    this.objects = [];
    for (var k in objArray) {
        this.addObject(objArray[k], objArray[k].name, objArray[k].id);
    }
    this.active();
    this.initEvent();
    this.frame = 0;
    this.startTime = (new Date()).getTime();
}

canvasScene.prototype.getObjectById = function (id) {
    var objs = this.getObjects("id", id);
    return objs[0];
}

canvasScene.prototype.getObjectsByName = function (name) {
    var objs = this.getObjects("name", name);
    return objs;
}

canvasScene.prototype.getObjects = function (a, b) {
    var ret = [];
    var param = {};
    if (typeof (a) === "string") {
        param[a] = b;
    } else {
        param = a;
    }
    for (var k in this.objects) {
        if (this.match(this.objects[k], param)) {
            ret.push(this.objects[k]);
        }
    }
    return ret;
}

canvasScene.prototype.match = function (item, param) {
    var ret = true;
    for (var k in param) {
        if (item.dna[k] != param[k]) {
            ret = false;
            break;
        }
    }
    return ret;
}


canvasScene.prototype.removeByIndex = function (n) {
    this.objects.splice(n, 1);
}

canvasScene.prototype.removeByName = function (name) {
    var count = 0;
    for (var k in this.objects) {
        if (name === this.objects[k].dna.name) {
            this.objects.splice(k, 1);
            count++
        }
    }
    return count;
}

canvasScene.prototype.addObject = function (dna) {
    var roleItem = new RoleItem(this, dna);
    this.objects.push(roleItem);
    roleItem.scene = this;
}

canvasScene.prototype.active = function () {
    var _self = this;

    function animate(callback) {
        if (_self.canvas.getAttribute("animate") !== "stop") {
            _self.updateFrame();
            var t = requestAnimationFrame(animate);
        } else {
            cancelAnimationFrame(t);
        }
        return t;
    }
    var t = animate();
    // this.resize(500, 500);
}


canvasScene.prototype.resize = function (w, h) {
    var ctx = this.context;
    ctx.scale(0.5, 0.5);
    // ctx.transform(0.3, 0, 0, 0.3, 0, 0);
}

canvasScene.prototype._resize = function (w, h) {
    var _w = this.canvas.width;
    var _h = this.canvas.height;
    var imgUrl = this.canvas.toDataURL();
    var shape = [];
    var x = 0,
        y = 0;
    var t = _w * h / w;
    if (t < h) {
        shape = [_w, t];
        x = 0;
        y = (_h - t) / 2;
    } else {
        t = _h * w / h;
        shape = [t, _h];
        x = (_w - t) / 2;
        y = 0;
    }
    this.clearFrame();
    var _self = this;
    var img = new Image();
    img.src = imgUrl;
    img.onload = function () {
        _self.context.drawImage(img, x, y, shape[0], shape[1]);
    }

}

canvasScene.prototype.updateFrame = function () {
    this.clearFrame();
    this.objects.sort(function (a, b) {
        var z1 = a.z || 0;
        var z2 = b.z || 0;
        return z1 - z2;
    })
    var count = 0;
    for (var k in this.objects) {
        var object = this.objects[k];
        object.index = count;
        if (typeof (object.callback) === "function" && !object.exit) {
            object.callback(this.context, object.params, object);
        }
        count++;
    }
    this.frame++;
}

canvasScene.prototype.clearFrame = function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
}

var RoleItem = function (scene, dna) {
    this.pos = dna.pos || [0, 0, 0];
    this.dna = dna;
    this.scene = scene
    this.context = scene.context;
    this.control = {
        count: 0,
        draw: dna.draw
    }
    info = dna.info || {};
    this.info = info;
    this.shape = info.shape;
    this.params = info.params || {
        colors: ["#FF0000", "#00FF00", "#0000FF"],
        closePath: false,
        stroke: true,
        clockwise: true
    }
    this.x = this.pos[0] || this.pos.x || 0;
    this.y = this.pos[1] || this.pos.y || 0;
    this.z = this.pos[2] || this.pos.z || 0;

    this.enterTime = (new Date()).getTime();
    this.count = 0;

    this.style = {
        fillStyle: "",
        strokeStyle: "#000",
        shadowColor: "",
        shadowBlur: "",
        shadowOffsetX: "",
        shadowOffsetY: "",
        lineCap: "square",
        lineJoin: "round",
        lineWidth: "1",
        miterLimit: "",
        font: "",
        textAlign: "",
        textBaseline: ""
    }

    for (var k in this.info.style) {
        this.style[k] = this.info.style[k];
    }

    this.promise = dna.promise;
}

RoleItem.prototype.switchStyle = function (a, b) {
    if (typeof (a) === "striing") {
        this.style[a] = b;
    } else if (typeof (a) === "object") {
        for (var i in a) {
            this.style[i] = a[i];
        }
    } else {}
}

RoleItem.prototype.step = function (len, angle) {
    angle = angle || 0;
    var rad = (angle % 360) / 180 * Math.PI;
    var x = len * Math.cos(rad);
    var y = len * Math.sin(rad);
    this.x += x;
    this.y += y;
}

RoleItem.prototype.switchStage = function (name, interval) {
    this.currentStage = {
        "start": this.count,
        "name": name,
        "interval": interval || 10,
        "repeat": 2
    }
}

RoleItem.prototype.recover = function() {
    this.currentStage = {};
    this.control = {
        count: this.count,
        draw: this.dna.draw
    }
}



RoleItem.prototype.callback = function () {
    if (this.control.state === "stop")
        return false;

    this.currentStage = this.currentStage || this.dna.currentStage;

    if (this.currentStage && this.currentStage.name && this.dna && this.dna.keyStages[this.currentStage.name]) {
        var stages = this.dna.keyStages[this.currentStage.name];
        this.currentStage.start = this.currentStage.start || 0;
        this.currentStage.interval = this.currentStage.interval || 10;
        var num = Math.floor(Math.abs(this.count - this.currentStage.start) / this.currentStage.interval);
        var index = num % stages.length;
        this.control = stages[index];
    }
    var draw = this.control.draw;

    if (typeof (this.control.draw) === "function") {
        this.updateStyle();
        this.control.draw(this.context, this.params, this);
        this.update();
        this.endStyle();
    } else if (typeof (draw) === "string" && typeof (this["__" + draw]) === "function") {
        this["__" + draw](this.control);
    } else {}

    this.count++;
    if (this.count === Infinity) {
        this.count = 0;
    }

    if (this.last && this.last < this.count) {
        this.exit = true;
    }
}

RoleItem.prototype.endStyle = function (style) {
    if (this.currentStage && !style) {
        return false;
    }
    var myStyle = style || this.style;
    if (myStyle.strokeStyle) {
        this.context.stroke();
    }
    if (myStyle.fillStyle) {
        this.context.closePath();
    }
    if (myStyle.fillStyle) {
        this.context.fill();
    }
}

RoleItem.prototype.updateStyle = function (style) {
    if (this.currentStage && !style) {
        return false;
    }
    var myStyle = style || this.style;
    for (var k in myStyle) {
        if (myStyle[k]) {
            this.context[k] = myStyle[k];
        }
    }
}
RoleItem.prototype.update = function (promise) {
    if (this.currentStage && !promise) {
        return false;
    }
    var myPromise = promise || this.promise;
    for (var k in myPromise) {
        if (typeof (myPromise[k]) === "function") {
            myPromise[k](this.context, this.params, this);
        }
    }
}

RoleItem.prototype.__qrCode = function (info) {
    var myInfo = info || this.info;
    var ctx = this.context;
    var options = myInfo.options || this.dna.info.options;
    var text = myInfo.text || this.dna.info.text;
    var qrcode = new QRCode(options.typeNumber || -1, options.correctLevel || 2);
    qrcode.addData(text || "http://www.transweb.cn");
    qrcode.make();
    myShape = info.shape || this.shape;
    var tileW = (myShape[0] || 200) / qrcode.getModuleCount();
    var tileH = (myShape[1] || 200) / qrcode.getModuleCount();
    for (var row = 0; row < qrcode.getModuleCount(); row++) {
        for (var col = 0; col < qrcode.getModuleCount(); col++) {
            ctx.fillStyle = qrcode.isDark(row, col) ? options.foreground : options.background;
            var w = (Math.ceil((col + 1) * tileW) - Math.floor(col * tileW));
            var h = (Math.ceil((row + 1) * tileH) - Math.floor(row * tileH));
            ctx.fillRect((this.pos[0] || this.pos.x || 0) + Math.round(col * tileW), (this.pos[1] || this.pos.y || 0) + Math.round(row * tileH), w, h);
        }
    }
}

RoleItem.prototype.__image = function (info) {
    var imageName = this.dna.image;
    var myInfo = info || this.info;
    if (info && info.image) {
        imageName = info.image;
    }
    else {
        myInfo = this.info;
    }
    var myShape = myInfo.shape;
    if (info && info.shape) {
        myShape = info.shape;
    }
    var ctx = this.context;
    if (!imageName) {
        return false;
    }
    var image = this.scene.images[imageName];
    var w = image.naturalWidth;
    var h = image.naturalHeight;
    if (!myShape && !this.info.sourceSize) {
        this.sourceSize = [w, h];
        if (ctx.canvas.width < w || ctx.canvas.height < h) {
            var t = ctx.canvas.width * h / w;
            if (t < h) {
                myShape = [ctx.canvas.width, t];
                this.x = 0;
                this.y = (ctx.canvas.height - t) / 2;
            } else {
                t = ctx.canvas.height * w / h;
                myShape = [t, ctx.canvas.height];
                this.x = (ctx.canvas.width - t) / 2;
                this.y = 0;
            }
        } else {
            myShape = [w, h];
            this.x = (ctx.canvas.width - w) / 2;
            this.y = (ctx.canvas.height - h) / 2;
        }

    } else {
        myShape = myShape || myInfo.sourceSize;
    }

    if (myShape && myInfo.sourcePos && myInfo.sourceSize) {
        ctx.drawImage(image, myInfo.sourcePos[0], myInfo.sourcePos[1], myInfo.sourceSize[0], myInfo.sourceSize[1], this.x, this.y, myShape[0], myShape[1]);
    } else if (myShape) {
        ctx.drawImage(image, this.x, this.y, myShape[0], myShape[1]);
    } else {
        ctx.drawImage(image, this.x, this.y);
    }
}

RoleItem.prototype.__text = function (info) {
    var myInfo = info || this.info;
    var text = myInfo.text || this.dna.info.text;
    this.context.fillText(myInfo.text, this.x, this.y);
}

RoleItem.prototype.__rect = function (info) {
    var info = info || this.info;
    var myShape = info.shape || this.dna.shape;
    this.context.beginPath();
    this.shape = this.shape || [50, 50];
    this.context.rect(this.x, this.y, myShape[0], myShape[1]);
}
RoleItem.prototype.__arc = function (info) {
    var info = info || this.info;
    var myShape = info.shape || this.dna.shape;
    var myParams = info.params || this.dna.params;
    this.context.beginPath();
    this.context.arc(this.x, this.y, myShape[0], myShape[1], myShape[2], myParams.clockwise);
}
RoleItem.prototype.__line = function (info) {
    var info = info || this.info;
    var myShape = info.shape || this.dna.shape;
    this.context.beginPath();
    this.context.moveTo(this.x, this.y);
    for (var i = 0; i < myShape.length; i++) {
        if (myShape[i].type === "quadratic") {
            this.context.quadraticCurveTo(myShape[i].cx, myShape[i].cy, myShape[i].x, myShape[i].y);
        } else {
            this.context.lineTo(myShape[i].x, myShape[i].y);
        }
    }
    this.context.stroke();
}
RoleItem.prototype.dismiss = function () {
    this.scene.removeByIndex(this.index);
}