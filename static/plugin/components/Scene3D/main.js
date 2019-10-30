(function () {
    var config = {
        script: {
            Map3dData: "map3dData.js",
            chinaCityData: "location.js",
            script: "script.js"
        }
    }
    webCpu.regComponent("Scene3D", config, function (container, data, task) {
        task.grouping = function (data) {
            if (data.groupName) {
                task.group = task.group || {};
                if (!task.group[data.groupName]) {
                    task.group[data.groupName] = [];
                }
                task.group[data.groupName].push(data.object);
            }
        }
        task.mouseDealer = function (e, objects, callback) {
            e.preventDefault();
            var x = (e.offsetX / task.container.clientWidth) * 2 - 1;
            var y = -(e.offsetY / task.container.clientHeight) * 2 + 1;

            var vector = new THREE.Vector3(x, y, 1).unproject(task.render.camera);

            var raycaster = new THREE.Raycaster(task.render.camera.position, vector.sub(task.render.camera.position).normalize());
            var intersects = raycaster.intersectObjects(objects);
            vector = null;
            raycaster = null;
            e = null;
            objects = null;
            return intersects;
        }

        var sceneConfig = task.sConfig || {
            bgColor: 0xFFFFFF,
            near: 1,
            far: 5000,
            viewAngle: 45
        }
        var cameraConfig = task.cConfig || {
            position: {
                x: 0,
                y: 50,
                z: 100
            },
            lookAt: {
                x: 0,
                y: 0,
                z: 0
            }
        }

        task.render = new My3dRender(container, sceneConfig, cameraConfig);

        task.render.start(function (renderObj) {

            for (var k in task.lights) {
                renderObj.addLight(task.lights[k]);
            }

            webCpu["Scene3D"].initPreData(task);

            webCpu["Scene3D"].switchScene(task);

            //extraInit
            if(typeof(task.extraInit) === "function") {
                task.extraInit();
            }

        }, function (m) {
            if (typeof (task.senceAnimate) === "function") {
                task.senceAnimate();
            }

            for (var i = 0; i < task.control.length; i++) {
                if (task.control[i].exit) {
                    task.control[i].dismiss();
                    var t = task.control.splice(i, 1);
                    i -= 1;
                    t = null;
                } else {
                    if (typeof (task.control[i].update) === "function") {
                        task.control[i].update();
                    }
                }
            }
            m = null;
        });
    });

    webCpu["Scene3D"].removeObject = function (card, name) {
        var t = card.task || card;
        for (var k in t.data) {
            if (name === this.data[k].name) {
               this._remove(card, this.data[k]);
            }
        }
    }

    webCpu["Scene3D"]._remove = function (card, obj) {
        var t = card.task || card;
        if (obj.object) {
            if (obj.object.parent) {
                obj.object.parent.remove(obj.object);
            } else {
                t.render.scene.remove(obj.object);
            }
        }
        var index = t.data.indexOf(obj);
        t.data.splice(index, 1);
        index = t.control.indexOf(obj);
        t.control.splice(index, 1);
    }

    webCpu["Scene3D"].emptyScene = function(card) {
        var t = card.task || card;
        if (t.render && t.render.scene) {
            var objects = t.render.scene.children;
            for (var i = 0; i < objects.length; i++) {
                t.render.scene.remove(objects[i]);
            }
        }
    }


    webCpu["Scene3D"].switchScene = function (card, data) {
        var t = card.task || card;
        var data = data || t.data;
        if (t.render && t.render.scene && data) {
            for (var i = 0; i < data.length; i++) {
                webCpu["Scene3D"]._remove(card, data[i]);
            }
        }
       
        t.data = [];
        t.control = [];
        for (var k in data) {
            webCpu["Scene3D"].addObject(card, data[k], null, function(control){
                if (control.update && t.control.indexOf(control) === -1) {
                    t.control.push(control);
                }
                if(t.data.indexOf(control) === -1) {
                    t.data.push(control);
                }
            });
        }
    }

    webCpu["Scene3D"].initPreData = function (card) {
        var t = card.task || card;
        for (var k in t.preData) {
            webCpu["Scene3D"].addObject(card, t.preData[k], null, function(control) {
                if (control.update && t.control.indexOf(control) === -1) {
                    t.control.push(control);
                }
            });
        }
    }

    webCpu["Scene3D"].addObject = function (card, object, parentObject, callback) {
        var t = card.task || card;
        t.render.initObject(object, function (obj, control) {
            if (!parentObject) {
                t.render.scene.add(obj);
            } else {
                parentObject.add(obj);
            }
            obj.position.set(control.base.x || 0, control.base.y || 0, control.base.z || 0);
            callback(control);
        });
    }

})();