transweb_cn({
    className: "MarkDownArticle",
    border: "none",
    overflow: "auto",
    cardName: "transwebEbook",
    task: {
        type: "ppt",
        style: {
            "padding": "25px 40px",
            "max-width": "800px",
            "height": "auto",
            "min-height": "100%",
            "background-color": "#fff",
            "border-top-left-radius": "6px",
            "border-top-right-radius": "6px"
        },
        catalog: {
            data: [],
            current: 0
        },
        data: '# 测试',
        switchArticle: function (n) {
            n = n || 0;
            if (!this.catalog.data) {
                return false;
            }
            if (n < 0) {
                n = this.catalog.data.length - 1;
            }
            if (n > this.catalog.data.length - 1) {
                n = 0;
            }
            var t = (new Date()).getTime();
            var tPath = "";
            if(this.catalog.data[n].path) {
                tPath = WebTool.attachParams(this.catalog.data[n].url, {
                    t: t
                })
            }
            this.url = tPath || this.url;
            webCpu.CardItem.fresh(webCpu.cards.transwebEbook);
            this.catalog.current = n;
            if(typeof(this.switchCallback) === "function") {
                this.switchCallback(this.catalog.current);
            }
            this.updateLinks();
        },
        switchNextLink: function() {
            var ret = false;
            if(this.links.length !== 0) {
                this.currentMask = this.currentMask || 0;
                if(this.currentMask < this.links.length) {
                    this.links.eq(this.currentMask).click();
                    ret = true;
                    this.currentMask++;
                }
            }
            return ret;
        },
        updateLinks: function() {
            webCpu.CardItem.dismissMask(this);
            this.links = $(this.container).find("a");
            this.currentMask = null;
        },
        rightStroke: function() {
            this.switchArticle(Number(this.catalog.current) + 1);
        },
        leftStroke: function() {
            this.switchArticle(Number(this.catalog.current) - 1);
        },
        setShortcutKey: function(elem, key, callback) {
            try {
                $(elem).on("keydown", function (e) {
                    if ((typeof (key) === "string" || typeof (key) === "number") && e.keyCode == key) {
                        callback(e);
                        return false;
                    } else if (key && key.constructor.name === "Array" && e.keyCode == key[1] && e[key[0]]) {
                        callback(e);
                        return false;
                    } else {}
                    // console.log(e.keyCode);
        
                });
            } catch (e) {
        
            }
        },
        promise: {
            beforeRender: function (container, data, task) {
                
            },
            afterRender: function (container, data, task) {
                if(task.type !== "ppt") {
                    $("<hr />").appendTo(container.children[0]);
                }
                task.updateLinks();
                task.setShortcutKey(window, 33, function (e) {
                    if (typeof (task.rightStroke) === "function" && task.state) {
                        task.state = 0;
                        task.leftStroke();
                    }
                    e.preventDefault();
                });

                task.setShortcutKey(window, 37, function (e) {
                    if (typeof (task.rightStroke) === "function" && task.state) {
                        task.state = 0;
                        task.leftStroke();
                    }
                    e.preventDefault();
                });

                task.setShortcutKey(window, 38, function (e) {
                    if (typeof (task.rightStroke) === "function" && task.state) {
                        task.state = 0;
                        task.leftStroke();
                    }
                    e.preventDefault();
                });

                task.setShortcutKey(window, 34, function (e) {
                    if (typeof (task.rightStroke) === "function" && task.state) {
                        task.state = 0;
                        task.rightStroke();
                    }
                    e.preventDefault();
                });

                task.setShortcutKey(window, 39, function (e) {
                    if (typeof (task.rightStroke) === "function" && task.state) {
                        task.state = 0;
                        task.rightStroke();
                    }
                    e.preventDefault();
                });

                task.setShortcutKey(window, 40, function (e) {
                    if (typeof (task.rightStroke) === "function" && task.state) {
                        task.state = 0;
                        task.rightStroke();
                    }
                    e.preventDefault();
                });
                
                // if(isMobile) {
                //     var tipsLine = $("<p style='color: #999; font-size: 12px;'>温馨提示：向左滑动，可观看下一章节<p/>");
                //     tipsLine.appendTo(container.children[0]);
                //     tipsLine.css("text-indent", "0px");
                // }
                
                $(container).on("touchstart", function (e) {
                    // e.preventDefault();
                    task.startX = e.originalEvent.changedTouches[0].pageX;
                    task.startY = e.originalEvent.changedTouches[0].pageY;
                });
                task.state = 1;
            
                $(container).on("touchmove", function (e) {
                    task.moveEndX = e.originalEvent.changedTouches[0].pageX,
                        task.moveEndY = e.originalEvent.changedTouches[0].pageY,
                        task.X = task.moveEndX - task.startX,
                        task.Y = task.moveEndY - task.startY;

                    if (Math.abs(task.X) > Math.abs(task.Y) && task.X > 10) {
                        // alert("left 2 right");
                        if (typeof (task.leftStroke) === "function"  && task.state) {
                            task.state = 0;
                            task.leftStroke();
                        }
                        e.preventDefault();
                    } else if (Math.abs(task.X) > Math.abs(task.Y) && task.X < -10) {
                        // alert("right 2 left");
                        if (typeof (task.rightStroke) === "function" && task.state) {
                            task.state = 0;
                            task.rightStroke();
                        }
                        e.preventDefault();
                    } 
                    else {}
                });
            }
        },
        url: "webApps/article.txt",
        requestType: "get",
        dataType: "text"
    }
})