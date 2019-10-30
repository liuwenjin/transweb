(function () {
    var config = {
        // css: "style.css",
        script: {
            Map3dData: "map3dData.js",
            chinaCityData: "location.js",
            script: "script.js"
        }
    }
    webCpu.regComponent("Map3D", config, function (container, data, task) {
        
        $(container).empty();
        task.option = task.option || {};
        task.option.style = task.option.style || {};
        
		task.grouping = function(data) {
			if(data.groupName) {
				task.group = task.group || {};
				if(!task.group[data.groupName]) {
					task.group[data.groupName] = [];					
				}				
				task.group[data.groupName].push(data.object);			
			}
		}
		task.mouseDealer = function (e, objects, callback) {
			e.preventDefault();
			var x = (e.offsetX / task.container.clientWidth) * 2 - 1;
			var y =  - (e.offsetY / task.container.clientHeight) * 2 + 1;
			
			var vector = new THREE.Vector3(x, y, 1).unproject(task.render.camera);

			var raycaster = new THREE.Raycaster(task.render.camera.position, vector.sub(task.render.camera.position).normalize());            
			var intersects = raycaster.intersectObjects(objects);
			return intersects;
		}
		
        window.mapLoction = {};
        for (var i = 0; i < chinaCityLocation.length; i++) {
            mapLoction[chinaCityLocation[i].name] = chinaCityLocation[i].cp;
        }
		
		task.addObjectToSence = function(object, control){
			_self.render.scene.add(object);					
			object.position.set(control.base.x, control.base.y, control.base.z);
		}

        task.initData = function (d, n) {
			
            this.data = d || this.data || [];            
            this.control = this.control || [];
            var _self = this;			
			for(var i = 0; i < this.data.length; i++) {
				if(this.control.length > n) {
					var item = this.control.pop();
					item.exit = true;
					if(item.dismiss) {
						item.dismiss();						
					}
					item = null;
				}
				if (!this.data[i].loc) {
                    if (typeof(this.data[i].from) === "string" && mapLoction[this.data[i].from]) {
                        this.data[i].from = {
                            lon: mapLoction[this.data[i].from][0],
                            lat: mapLoction[this.data[i].from][1]
                        }
                    }
                    if (typeof(this.data[i].to) === "string" && mapLoction[this.data[i].to]) {
                        this.data[i].to = {
                            lon: mapLoction[this.data[i].to][0],
                            lat: mapLoction[this.data[i].to][1]
                        }
                    }                    
                }					
                this.render.initObject(this.data[i], this.addObjectToSence);				
				this.control.push(this.data[i]);
				//this.data[i] = null;
			}
			d = null;
			this.data = null;			
        }
		
		var _self = task;

        task.render = new My3dRender(container, {
                bgColor: 0x111111,
                near: 1,
                far: 2000,
                viewAngle: 65
            }, {
                position: {
                    x: 0,
                    y: 0,
                    z: 450
                },
                lookAt: {
                    x: 0,
                    y: 0,
                    z: 0
                }
            });

        task.render.start(function (renderObj) {
           
            renderObj.addLight({
                type: "HemisphereLight",
                color: [0x111111, 0xffffff, 1],
                position: {
                    x: 110,
                    y: 400,
                    z: -200
                }
            });

            renderObj.areas = {};
            renderObj.borders = {};
            renderObj.textItems = {};
            renderObj.glob = new THREE.Object3D();
            renderObj.glob.scale.set(250, 250, 250);
            renderObj.scene.add(renderObj.glob);
	
            // renderObj.scene.scale.multiplyScalar(1);
            renderObj.scene.rotation.x = Math.PI * 0.18;
            renderObj.scene.rotation.y = Math.PI * 0.4;
	
            //add the sphere
            var bOption = task.option.style.innerBall || {}
            var control = {
                from: [0, 0, 0],
                material: "MeshLambertMaterial",
                materialParam: {
                    shader: {
                        side: THREE.DoubleSide,
                        // color: 0xFFFFFF,
                        wireframe: false,
                        transparent: true,
                        opacity: bOption.opacity || 1,
                    },
                    texture: bOption.texture || webCpu.Map3D.getPath("pattern.png"),
                    textureParam: {
                        wrapS: THREE.RepeatWrapping,
                        wrapT: THREE.RepeatWrapping,
                        repeat: [400, 400]
                    },
                },
                geometry: "SphereGeometry",
                geometryParam: [1, 50, 50],
				options: {
					
				},
				animate: function() {
					console.log(this.options);
				}
            }

            renderObj.initObject(control, function (mesh, control) {               
                renderObj.glob.add(mesh);
                mesh.scale.multiplyScalar(0.9876);
				mesh = null;			
				control = null;
            });

            //add the map
            var aOption = task.option.style.area || {};
            var tData = Map3dData;
            for (var name in tData) {
                control = {
                    from: [0, 0, 0],
                    material: "MeshBasicMaterial",
                    materialParam: {
                        shader: {
                            color: aOption.color || "#999999"
                        } 
                    },
                    geometry: "Map3DGeometry",
                    geometryParam: [tData[name], 1],
					groupName: "mapArea",
					options: {
						cityName: name
					}
                }					
	
                renderObj.initObject(control, function (mesh, control) {
                    renderObj.glob.add(mesh); 
					_self.grouping(control);
					control = null;			
					mesh = null;
                });

                var vertices = tData[name].vertices;
                var polygons = tData[name].polygons;
                for (var i = 0, len = polygons.length; i < len; i++) {
                    var polyWithHoles = polygons[i];
                    var polygonOrHole = polyWithHoles[0];
                    var pl = polygonOrHole.length;
                    for (var j = 0, jl = pl; j < jl; j++) {
                        var start = polygonOrHole[0];
                        i === 0 ? polygonOrHole.push(polygonOrHole[j] + pl)
                         : (j === 0 ? polygonOrHole[j] *= 2 : polygonOrHole[j] += start / 2, polygonOrHole.push(polygonOrHole[j] + pl));
                    }
                }
				
				
                //display borders
                var borderOption = task.option.style.border || {};
                for (var i = 0, len = polygons.length; i < len; i++) {
                    control = {
                        from: [0, 0, 0],
                        material: "LineBasicMaterial",
                        materialParam: {
                            shader: {
                                color: borderOption.highlightColor || 0xaaaaaa,
                                transparent: true
                            }
                        },
                        geometry: "Geometry",
                        geometryParam: [],
                        objectType: "Line"
                    }
                    if (tData[name].code !== "cn") {
                        control.materialParam.shader.color = borderOption.color || 0x666666;
                    }

                    var polyWithHoles = polygons[i];
                    var polygonOrHole = polyWithHoles[0];
                    var cps;
                    for (var k = 0; k < polygonOrHole.length; k += 2) {
                        var d = polygonOrHole[k];
                        var e = polygonOrHole[k + 1];
                        var lon = vertices[d];
                        var lat = vertices[e];
                        var vec3 = renderObj.toVector3({
                                lon: lon,
                                lat: lat
                            });
                        if (k === 0) {
                            cps = renderObj.toVector3({
                                    lon: lon,
                                    lat: lat
                                });
                        }
                        control.geometryParam.push(vec3);
                    }
                    control.geometryParam.push(cps); //添加起始点，关闭路径

                    renderObj.initObject(control, function (mesh, control) {
                        renderObj.glob.add(mesh);   
						mesh = null
						control = null;
						
                    });

                    var textOption = task.option.style.text;
                    if (mapLoction[name] && !renderObj.textItems[name]) {
                        control = {
                            from: [0, 0, 0],
                            material: "SpriteMaterial",
                            materialParam: {
                                shader: {},
                                texture: function (context, canvas, options) {
                                    context.font = textOption.font || "normal 12 Arial";                        
                                    var ctxHeight = 12;
                                    var textList = [];
                                    var metrics = context.measureText(options.text);
                                    canvas.width = metrics.width;
                                    canvas.height = ctxHeight + 10;
                                    context.fillStyle = textOption.color || "#aaa";
                                    context.fillText(options.text, 0, 12 * i + 12);
									
									options.width = canvas.width;
									options.height = canvas.height;
                                },
								textureParam: {
									minFilter: THREE.NearestFilter,
									needsUpdate: true
								}
                            },
                            // geometry: "Geometry",
                            // geometryParam: [],
                            objectType: "Sprite",
                            options: {
                                text: name,
                                loc: mapLoction[name]
                            }
                        }
                        renderObj.initObject(control, function (mesh, control) {
                            renderObj.scene.add(mesh);
							mesh.scale.set(control.options.width/4, control.options.height/4,1);
                            var pos = renderObj.toVector3({
                                    lon: control.options.loc[0],
                                    lat: control.options.loc[1]
                                }, 1);
								
							renderObj.textItems[name] = mesh;
                            mesh.position.set(pos.x, pos.y, pos.z - 1);
							pos = null;
							control = null;
							mesh = null;
                        });
                    }

                }

            }
			//display text 
			for(var k in task.eventPromise) {	
				if(k === "mousemove" || k === "mouseleave") { 
					var elem = task.render.renderer.domElement;
				}
				else {
					var elem = task.render.renderer.domElement.parentNode;
				}
				$(elem).on(k, function(e) {	
					e.preventDefault();
					var temp = [];									
					for(var m in task.eventPromise[e.type].groups) {
						var name = task.eventPromise[e.type].groups[m];
						if(task.group[name] && task.group[name].length > 0) {
							var intersects = task.mouseDealer(e, task.group[name]);
							if(intersects.length > 0) {
								temp = temp.concat(intersects);							
							}
						}						
					}
					if(temp.length > 0) {
						if(task.eventPromise && task.eventPromise[e.type] && typeof(task.eventPromise[e.type].callback) === "function") {
							task.eventPromise[e.type].callback(e, temp, task);
						}						
					}
					else {
						if(typeof(task.eventPromise[e.type].miss) === "function") {
							task.eventPromise[e.type].miss(e, task);
						}
					}
					
					return true;
				});				
			}
            
            task.initData();
             
            //extraInit
            if(typeof(task.extraInit) === "function") {
                task.extraInit();
            }
            
        }, function (m) {
            if (typeof(task.senceAnimate) === "function") {
                task.senceAnimate();
            }

            for (var i = 0; i < task.control.length; i++) {
				if (task.control[i].exit) {
					task.control[i].dismiss();
					var t = task.control.splice(i, 1);					
					i -= 1;
					t = null;
				} else {
					if(typeof(task.control[i].update) === "function") {
						task.control[i].update();						
					}					
				}
            }
             
        });

    });

})();
