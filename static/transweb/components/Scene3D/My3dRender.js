var My3dRender = function (container, options, cOptions) {
    this.container = container;
    this.width = container.clientWidth;
    this.height = container.clientHeight;
    this.options = options;
    this.cOptions = cOptions;
    this.init();
    this.mesh = {};
    this.texture = {};
}
My3dRender.prototype.init = function () {
    this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    this.renderer.setSize(this.width, this.height);
    this.container.innerHTML = "";
    this.container.appendChild(this.renderer.domElement);
    this.renderer.setClearColor(this.options.bgColor, 0.01);
    this.camera = new THREE.PerspectiveCamera(this.options.viewAngle || 90, this.width / this.height, this.options.near || 1, this.options.far || 10000);
    this.camera.position.x = this.cOptions.position.x || 0;
    this.camera.position.y = this.cOptions.position.y || 0;
    this.camera.position.z = this.cOptions.position.z || 0;
    if (this.cOptions && this.cOptions.up) {
        this.camera.up.x = this.cOptions.up.x;
        this.camera.up.y = this.cOptions.up.y;
        this.camera.up.z = this.cOptions.up.z;
    }

    if (this.cOptions.lookAt) {
        this.camera.lookAt(this.cOptions.lookAt);
    }

    this.scene = new THREE.Scene();
}

My3dRender.prototype.addLight = function (options) {
    var light = new THREE[options.type](options.color[0] || options.color, options.color[1], options.color[2]);
    if (options.position) {
        light.position.set(options.position.x, options.position.y, options.position.z).normalize();
    }
    if (options.type === "DirectionalLight") {
        // light.normalize();
        this.camera.add(light);
        this.camera.add(light.target);
    }
    this.scene.add(light);
    this.light = light;
}

My3dRender.prototype.initPosition = function (control) {
    if (control.from && control.from.constructor.name === "Array" && control.from.length === 3) {
        control.base = [control.from[0], control.from[1], control.from[2]];
        control.pos = [control.from[0], control.from[1], control.from[2]];
    } else {
        control.loc = control.loc || {
            lon: control.from.lon,
            lat: control.from.lat
        };
        control.base = this.toVector3(control.loc, 1);
        control.pos = control.pos || this.toVector3(control.loc, 1);
    }

    if (control.to && control.from.constructor.name === "Array" && control.from.length === 3) {
        control.target = [control.to[0], control.to[1], control.to[2]];
    } else if (control.to) {
        control.target = control.target || this.toVector3({
            lon: control.to.lon,
            lat: control.to.lat
        }, 1);
    } else {}
    control = null;
}

My3dRender.prototype.initMaterial = function (control) {
    if (control.materialParam && control.materialParam.constructor.name === "Array") {
        control.material = [];
        for (var i = 0; i < control.materialParam.length; i++) {
            var type = control.materialParam[i].type || control.material;
            var m = this.initMaterialParam(type, control.materialParam[i], control.options);
            control.material.push(m);
        }
    } else if (typeof (control.material) === "string") {
        var type = control.material;
        control.material = this.initMaterialParam(type, control.materialParam, control.options);
    } else {}
    control = null;
}

My3dRender.prototype.initMaterialParam = function (type, param, options) {

    if (type === "MeshFaceMaterial" && param.skins && param.skins.constructor.name === "Array") {
        var materialArray = [];
        var colors = [0x009e60, 0x0051ba, 0xffd500, 0xff5800, 0xffffff, 0xc41e3a]
        for (var i = 0; i < 6; i++) {
            // (function(i) {
            var texture = new THREE.TextureLoader().load(param.skins[i]);
            // materialArray.push(new THREE.MeshBasicMaterial({
            //     color: colors[i],
            //     side: THREE.BackSide
            // }));
            materialArray.push(new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.BackSide
            }));
            // })(i);
        }
        return materialArray;
    }

    param.shader = param.shader || {};
    if (typeof (param.texture) === "string") {
        if (!this.texture[param.texture]) {
            this.texture[param.texture] = new THREE.TextureLoader().load(param.texture);
        }
        param.texture = this.texture[param.texture];

    } else if (typeof (param.texture) === "function") {
        options.canvas = document.createElement('canvas');
        options.canvas.width = options.width || 50;
        options.canvas.height = options.height || 50;
        options.context = options.canvas.getContext('2d');
        param.texture(options.context, options.canvas, options);
        param.texture = new THREE.Texture(options.canvas);
        canvas = null;
    } else {};

    if (param.textureParam) {
        for (var k in param.textureParam) {
            if (k === "repeat") {
                param.texture.repeat.set(param.textureParam[k][0], param.textureParam[k][1]);
            } else {
                param.texture[k] = param.textureParam[k];
            }
        }
    }

    if (param.texture) {
        if (type === "ShaderMaterial") {
            param.shader.uniforms.tMatCap.value = param.texture;
        } else {
            param.shader.map = param.texture;
        }
    }

    if (THREE[type]) {
        var m = new THREE[type](param.shader);
    } else {
        var m = null;
        console.log("not support the material: " + type);
    }
    type = null;
    param = null;
    options = null;
    return m;
}

My3dRender.prototype.initObject = function (control, callback) {
    var control = WebTool.copyObject(control);
    this.initMaterial(control);
    this.initPosition(control);
    if (typeof (control.geometry) === "string") {
        var type = control.geometry;
        if (THREE[control.geometry]) {
            if (control.geometry !== "Geometry") {
                control.geometry = new THREE[type](control.geometryParam[0], control.geometryParam[1], control.geometryParam[2], control.geometryParam[3], control.geometryParam[4]);
            } else {
                control.geometry = new THREE[type]();
                control.geometry.vertices = control.geometryParam;
            }
        } else {
            control.geometry = new window[type](control.geometryParam[0], control.geometryParam[1], control.geometryParam[2], control.geometryParam[3], control.geometryParam[4]);
        }
        this.createObject(control, callback);

    } else if (control.geometryLoader && THREE[control.geometryLoader]) {
        var _self = this;
        var callback = callback;
        var loader = new THREE[control.geometryLoader]();
        loader.load(control.geometry, function (e) {
            geometry = e;
            geometry.center();
            geometry.computeVertexNormals(control.geometryParam[0], control.geometryParam[1], control.geometryParam[2]);
            _self.createObject(control, callback);
        });

    } else {
        this.createObject(control, callback);
    }
    control = null;
}

My3dRender.prototype.createObject = function (control, callback) {
    control.objectType = control.objectType || "Mesh";
    // if (control.material.constructor.name === "Array" && control.geometry && control.material) {
    if (false) {
        control.object = control.object || THREE.SceneUtils.createMultiMaterialObject(control.geometry, control.material);
    } else if (control.objectType === "Sprite" && control.material) {
        control.object = new THREE.Sprite(control.material);
        control.texture && control.texture.dispose && control.texture.dispose();
    } else if (control.geometry && control.material) {
        control.object = control.object || new THREE[control.objectType](control.geometry, control.material);
        control.geometry && control.geometry.dispose();
        control.texture && control.texture.dispose && control.texture.dispose();

    } else {
        console.log("Some params is not complete");
    }
    if (typeof (callback) === "function") {
        callback(control.object, control);
    }
    control.object.userData = control.options;

    var _self = this;
    control.dismiss = function () {
        var t = this.parent || _self.scene;
        t.remove(this.object);
        if (this.object) {
            this.object.geometry && this.object.geometry.dispose();
            this.texture && this.texture.dispose && this.texture.dispose();
            this.object.material.dispose();
            this.object.geometry = null;
            this.object.texture = null;
        }
        this.material = null;
        this.geometry = null;
        this.texture = null;
        this.options = null;
        delete this.object;
    }
    control.options = control.options || {};
    control.options.time = (new Date()).getTime();
    control.options.count = 0;
    if (control.options.duration) {
        control.options.step = 1 / control.options.duration;
        control.options.t = 1 / control.options.duration;
    }
    control.options.pos = control.base || control.options.pos || {
        x: 0,
        y: 0,
        z: 0
    };
    control.object.position.set(control.options.pos.x || control.options.pos[0] || 0, control.options.pos.y || control.options.pos[1] || 0, control.options.pos.z || control.options.pos[2] || 0);
    control.options.scale = control.options.scale || {
        x: 5,
        y: 5,
        z: 5
    };
    if (typeof (control.options.scale) === "number") {
        control.options.scale = [control.options.scale, control.options.scale, control.options.scale];
    }
    control.object.scale.set(control.options.scale.x || control.options.scale[0] || 5, control.options.scale.y || control.options.scale[1] || 5, control.options.scale.z || control.options.scale[2] || 5);
    control.options.rotation = control.options.rotation || {
        x: 0,
        y: 0,
        z: 0
    };
    control.object.rotation.set(control.options.rotation.x || control.options.rotation[0] || 0, control.options.rotation.y || control.options.rotation[1] || 0, control.options.rotation.z || control.options.rotation[2] || 0);

    var _self = this;


    if (typeof (control.animate)) {
        control.update = function () {
            if (typeof (this.animate) === "function") {
                this.animate();
            }

            _self.updateObject(this);

            if (this.options.scale) {
                this.object.scale.set(this.options.scale.x, this.options.scale.y, this.options.scale.z);
            }

            if (this.objectType !== "Line") {
                this.object.position.set(this.pos.x, this.pos.y, this.pos.z);
            }

            if (this.options.t && this.options.step) {
                this.options.t += this.options.step;
            }

            this.options.count++;
        }
    }

    control.geometry && control.geometry.dispose();
    control.geometry = null;
    // control.material.dispose();
    // control.material = null;
    control = null;
}

My3dRender.prototype.updateObject = function (control) {
    if (control.objectType === "Line") {
        control.object.geometry.dispose();
        control.geometry = new THREE["Geometry"]();
        control.geometry.vertices = control.geometryParam;
        var p = control.object.parent || this.sence;
        p.remove(control.object);
        delete control.object;
        control.object = new THREE[control.objectType](control.geometry, control.material);
        p.add(control.object);
    } else {
        if (control.material && typeof (control.material.dispose) === "function") {
            control.material.dispose();
        }
        control.material = null;
    }
    control.geometry = null;
    control.texture = null;
    control = null;
}

My3dRender.prototype.start = function (callback, variety) {
    if (typeof (callback) === "function") {
        callback(this);
    }
    this.variety = variety;
    var _self = this;

    function animate() {
        // console.log("rendering(" + (new Date()).getTime() + ")" );
        if (!_self.state) {
            var tDate = (new Date()).getTime();
            _self.renderGap = tDate - _self.updateTime;

            _self.variety(_self.scene);

            _self.renderer.render(_self.scene, _self.camera);
            var t = requestAnimationFrame(animate);
            _self.updateTime = tDate;

        } else {
            cancelAnimationFrame(t);
        }

        TWEEN.update();

        return t;
    }
    var t = animate();

}

My3dRender.prototype.resize = function () {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
}

My3dRender.prototype.startHelper = function () {
    var helper = new THREE.GridHelper(1000, 50, 0xf0f0f0, 0xffffff);
    this.scene.add(helper);
    this.helper = helper;
}

My3dRender.prototype.addControl = function (options) {
    var control = new THREE.Object3D();
    if (options.rotation) {
        control.rotation.set(options.rotation.x, options.rotation.y, options.rotation.z);
    }
    this.scene.add(control);
    this.control = control;
}
My3dRender.prototype.toVector3 = function (country, r) {
    var rad = r > 1 ? r : 255;
    var lon = country.lon;
    var lat = country.lat;
    var phi = +(90 - lat) * 0.01745329252;
    var the = +(180 - lon) * 0.01745329252;
    var center = new THREE.Vector3();
    center.x = Math.sin(the) * Math.sin(phi) * -1;
    center.y = Math.cos(phi);
    center.z = Math.cos(the) * Math.sin(phi);
    if (r >= 1)
        center.multiplyScalar(rad);
    return center;
}

/** 3DMap  ***/
function Map3DGeometry(data, innerRadius) {
    if ((arguments.length < 2) || isNaN(parseFloat(innerRadius)) || !isFinite(innerRadius) || (innerRadius < 0)) {
        // if no valid inner radius is given, do not extrude
        innerRadius = 42;
    }

    THREE.Geometry.call(this);
    // data.vertices = [lat, lon, ...]
    // data.polygons = [[poly indices, hole i-s, ...], ...]
    // data.triangles = [tri i-s, ...]
    var i,
        uvs = [];
    for (i = 0; i < data.vertices.length; i += 2) {
        var lon = data.vertices[i];
        var lat = data.vertices[i + 1];
        // colatitude
        var phi = +(90 - lat) * 0.01745329252;
        // azimuthal angle
        var the = +(180 - lon) * 0.01745329252;
        // translate into XYZ coordinates
        var wx = Math.sin(the) * Math.sin(phi) * -1;
        var wz = Math.cos(the) * Math.sin(phi);
        var wy = Math.cos(phi);
        // equirectangular projection
        var wu = 0.25 + lon / 360.0;
        var wv = 0.5 + lat / 180.0;

        this.vertices.push(new THREE.Vector3(wx, wy, wz));

        uvs.push(new THREE.Vector2(wu, wv));
    }

    var n = this.vertices.length;

    if (innerRadius <= 1) {
        for (i = 0; i < n; i++) {
            var v = this.vertices[i];
            this.vertices.push(v.clone().multiplyScalar(innerRadius));
        }
    }

    for (i = 0; i < data.triangles.length; i += 3) {
        var a = data.triangles[i];
        var b = data.triangles[i + 1];
        var c = data.triangles[i + 2];

        this.faces.push(new THREE.Face3(a, b, c, [this.vertices[a], this.vertices[b], this.vertices[c]]));
        this.faceVertexUvs[0].push([uvs[a], uvs[b], uvs[c]]);

        if ((0 < innerRadius) && (innerRadius <= 1)) {
            this.faces.push(new THREE.Face3(n + b, n + a, n + c, [
                this.vertices[b].clone().multiplyScalar(-1),
                this.vertices[a].clone().multiplyScalar(-1),
                this.vertices[c].clone().multiplyScalar(-1)
            ]));
            this.faceVertexUvs[0].push([uvs[b], uvs[a], uvs[c]]); // shitty uvs to make 3js exporter happy
        }
    }

    // extrude
    if (innerRadius < 1) {
        for (i = 0; i < data.polygons.length; i++) {
            var polyWithHoles = data.polygons[i];
            for (var j = 0; j < polyWithHoles.length; j++) {
                var polygonOrHole = polyWithHoles[j];
                for (var k = 0; k < polygonOrHole.length; k++) {
                    var a = polygonOrHole[k],
                        b = polygonOrHole[(k + 1) % polygonOrHole.length];
                    var va1 = this.vertices[a],
                        vb1 = this.vertices[b];
                    var va2 = this.vertices[n + a],
                        vb2 = this.vertices[n + b];
                    var normal;
                    if (j < 1) {
                        // polygon
                        normal = vb1.clone().sub(va1).cross(va2.clone().sub(va1)).normalize();
                        this.faces.push(new THREE.Face3(a, b, n + a, [normal, normal, normal]));
                        this.faceVertexUvs[0].push([uvs[a], uvs[b], uvs[a]]); // shitty uvs to make 3js exporter happy
                        if (innerRadius > 0) {
                            this.faces.push(new THREE.Face3(b, n + b, n + a, [normal, normal, normal]));
                            this.faceVertexUvs[0].push([uvs[b], uvs[b], uvs[a]]); // shitty uvs to make 3js exporter happy
                        }
                    } else {
                        // hole
                        normal = va2.clone().sub(va1).cross(vb1.clone().sub(va1)).normalize();
                        this.faces.push(new THREE.Face3(b, a, n + a, [normal, normal, normal]));
                        this.faceVertexUvs[0].push([uvs[b], uvs[a], uvs[a]]); // shitty uvs to make 3js exporter happy
                        if (innerRadius > 0) {
                            this.faces.push(new THREE.Face3(b, n + a, n + b, [normal, normal, normal]));
                            this.faceVertexUvs[0].push([uvs[b], uvs[a], uvs[b]]); // shitty uvs to make 3js exporter happy
                        }
                    }
                }
            }
        }
    }

    this.computeFaceNormals();

    this.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1);
}

Map3DGeometry.prototype = Object.create(THREE.Geometry.prototype);