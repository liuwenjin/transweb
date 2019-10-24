golaxy_3dMapBasic({
  "className": 'Map3D',
  "cardName": 'Map3dTask',
  "task": {
    option: {
      style: {
        area: {
          color: 0x207884,
          hoverColor: "#999999",
          texture: '/images/temp/area.png'
        },
        border: {
          width: 2,
          color: "#666600",
          highlightColor: "#000066",
        },
        innerBall: {
          texture: '/images/temp/test.png',
          opacity: ""
        },
        text: {
          color: "#666600"
        }
      },
      selected: []
    },
    "addObject": function (data, color) {
      if (typeof (this.initData) === "function") {
        data = this.transformData(data);
        this.initData(data, 200);
      }
    },
    "count": 1,
    "colors": [16768256, 14548736, 14483711, 65501, 56831, 16711901],
    "eventObject": {
      "objectType": 'Sprite',
      "material": 'SpriteMaterial',
      "materialParam": {
        "shader": {
          "color": "#ff0000"
        },
        "texture": '/images/temp/sprite.png'
      },
      "animate": function () {
        var v = this.options.count;
          this.options.scale = {
            x: v % 15 + 1,
            y: v % 15 + 1,
            z: v % 15 + 1
          };
      }
    },
    "eventPromise": {
      "mousemove": {
        "callback": function (e, objects, task) {
          if (objects[0].distance > 600) {
            this.miss(e, task);
            return;
          }

          if (task.currentObject !== objects[0].object) {
            if (task.currentObject) {
              task.currentObject.material.color.set(task.option.style.area.color);
            }
            objects[0].object.material.color.set(task.option.style.area.hoverColor);
            task.currentObject = objects[0].object;
          }
          return false;
        },
        "groups": ['mapArea'],
        "miss": function (e, task) {
          document.body.style.cursor = "default";
          if (task.currentObject) {
            task.currentObject.material.color.set(task.option.style.area.color);
          }
          task.currentObject = null;

        }
      },
      "click": {
        "callback": function (e, objects, task) {},
        "groups": ['masterRole', 'client'],
        "miss": function (e, task) {}
      },
      "mouseleave": {
        "callback": function (e, objects, task) {},
        "groups": ['masterRole'],
        "miss": function (e, task) {}
      }
    },
    "transformData": function (data) {
      var ret = [];
      var circle = WebTool.copyObject(this.eventObject);
      circle.from = typeof (data) === "string" ? data : {
        lat: data.latitude,
        lon: data.longitude
      }
      ret = [circle];
      this.count++;
      if (this.count === Number.MAX_VALUE) {
        this.count = 0;
      }
      return ret;
    },
    "extraInit": function () {
      this.trackball = new THREE.TrackballControls(this.render.camera, this.render.renderer.domElement);
      //add the begining effects of the scene
      var controls = this.trackball;
      var camera = this.render.camera;
      var pos = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z
      }
      camera.position.z = camera.position.z + 2480;
      var t = new TWEEN.Tween(camera.position).to(pos, 2000).start();
      t.onComplete(function () {
        //controls.reset();
        //camera.position.z = camera.position.z - 480;
      });

      this.position0 = {
        x: this.trackball.position0.x,
        y: this.trackball.position0.y,
        z: this.trackball.position0.z
      };

    },
    "senceAnimate": function () {
      this.trackball.update();
      if (!this.stopMove) {
        // this.render.scene.rotation.y += 0.01;
        // this.render.scene.rotation.y += 0.01;
      }

    },
    "data": [],
    "promise": {
      "beforeRender": function (container, data, task) {
        task.hlMaterial = new THREE.MeshBasicMaterial({
          color: 0x253230
        });
        task.control = [];
      },
      "afterRender": function (container, data, task) {
        $(container).find("canvas").on("dblclick", function () {
          var controls = task.trackball;
          var position0 = task.trackball.position0;
          position0.x = task.position0.x;
          position0.y = task.position0.y;
          position0.z = task.position0.z;

          var camera = task.render.camera;
          controls.object.up.copy(controls.up0);
          var t = new TWEEN.Tween(camera.position).to(position0, 1000).start();
          t.onComplete(function () {
            controls.reset();
          });
        });

        $(container).find("canvas").on("mouseover", function () {
          task.stopMove = true;
        });
        $(container).find("canvas").on("mouseout", function () {
          task.stopMove = false;
        });

      }
    },
    "dataType": 'json'
  },
  "appUrl": 'product/golaxy_3dMapBasic.js'
});