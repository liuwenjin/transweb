transweb_bookManager({
    border: "none",
    background: "#fff",
    overflow: "auto",
    className: "DataTable",
    cardName: "transwebBookManager",
    titleHeight: 50,
    titleData: {
        menu: [{
            name: "全选",
            callback: function() {

            }
        }, {
            name: "反选",
            callback: function() {
                
            }
        }, {
            name: "取消",
            callback: function() {
                
            }
        }],
        rightMenu: [{
            name: "上架",
            callback: function() {

            }
        },{
            name: "下架",
            callback: function() {

            }
        }, {
            name: "删除",
            callback: function() {
                
            }
        }]
    },
    task: {
        style: {
            padding: "0px 15px"
        },
        dataMap: {
            back: "返回",
            open: "打开",
            preview: "预览"
        },
        header: [{
            name: "选择",
            key: "id",
            render: function(v, d) {
                var str = "<input type='checkbox' />";
                return str;
            }
        },{
            name: "名称",
            key: "name"
        },{
            name: "状态",
            key: "state"
        }, {
            name: "操作",
            render: function (v, d) {
                var tHtml = "<div><button class='btn btn-default btn-xs'>预览</button><button style='margin-left: 10px;' class='btn btn-default btn-xs'>重命名</button><button style='margin-left: 10px;' class='btn btn-default btn-xs'>删除</button></div>"
                return tHtml;
            }
        }],
        setPageAbstract: function (callback, params) {
            var cms = webCpu.cards.transwebCms.task;
            var mCard = getRightMaskCard();
            cardDialog(mCard, cms.items["shareTool"], "设置摘要&&二维码", {
                width: "98%",
                height: "95%",
                padding: CommonStyle.Dialog.padding
            }, function (c, d, t) {
                if (typeof (callback) === "function") {
                    callback(c, d, t);
                }
            });
        },
        saveFileData: function (str, callback) {
            var cms = webCpu.cards.transwebCms.task;
            if (cms.current.type === "js") {
                str = webCpu.cards.transwebEdit.task.dealCodeString(str);
                str = "transweb_cn(" + str + ")";
                str = js_beautify(str, CodeOptions.js);
            }
            localStorage.transwebType = cms.current.type
            localStorage.transwebFolder = cms.current.folder;
            webCpu.cards.transweb.task.saveAs(cms.current.type, str, callback, {
                folder: localStorage.transwebFolder,
                name: localStorage.transwebName
            });
        },
        data: [{
            id: "132423",
            name: "新约综览",
            state: "已上架"
        }, {
            id: "132423",
            name: "新约综览1",
            state: "未上架"
        }, {
            id: "132423",
            name: "新约综览2",
            state: "未上架"
        }, {
            id: "132423",
            name: "新约综览3",
            state: "已下架"
        }],
        catalog: [],
        promise: {
            beforeRender: function (container, data, task) {
               
            },
            afterRender: function (container, data, task) {
                var w = $(container).width();
              
                $(container).find("tr>td:nth-child(2)").css("text-align", "center");
                $(container).find("tr>th:nth-child(2)").css("text-align", "center");
                
                
                

                $(container).find(".bookBtn").on("click", function () {
                    var url = $(this).attr("data");
                    task.previewFolder(url);
                });


                $(container).find(".editFileBtn").on("click", function () {
                    var path = $(this).attr("data");
                    var cmsTask = webCpu.cards.transwebCms.task;
            
                    localStorage.transwebWhere = "transwebCms";
                    webCpu.editFileData(path, 1, cmsTask.current.type);
                });

                $(container).find(".fileNameInfoArea").on("click", function () {
                    var url = $(this).attr("data");
                    var cmsTask = webCpu.cards.transwebCms.task;
                    var name = $(this).attr("fileName").replace(/\/$/, "");
                    var opType = $(this).attr("opType");
                    if (opType === "preview" && name) {
                        if(cmsTask.current.type === "js" || cmsTask.current.type === "markdown") {
                            var cmsTask = webCpu.cards.transwebCms.task;
                            localStorage.transwebName = $(this).attr("fileName");
                            localStorage.transwebFolder = cmsTask.current.folder;
                            localStorage.transwebWhere = "transwebCms";
                            webCpu.editFileData(url, 0, cmsTask.current.type);
                        }
                        else {
                            task.previewItem(url);
                        }
                        
                    } else if (opType === "back") {
                        cmsTask.updateFilesList(cmsTask.current.type, "");
                    } else {
                        cmsTask.updateFilesList(cmsTask.current.type, name);
                    }
                });

                $(container).find(".downloadFileBtn").on("click", function () {
                    var url = $(this).attr("data");
                    var name = $(this).attr("fileName").replace(/\/$/, "");
                    downloadFile(url);
                });

                $(container).find(".delFileBtn").on("click", function () {
                    var cmsTask = webCpu.cards.transwebCms.task;
                    var name = $(this).attr("fileName");
                    var key = cmsTask.prefix + name;
                    var tips = "确认删除吗？";
                    if (name.match(/\//)) {
                        cmsTask.cloudItem.getBucketItems(function (e, d) {
                            if (d && d.Contents && d.Contents.length < 2) {
                                showTips(task, tips, function () {
                                    cmsTask.cloudItem.deleteObject(key, function (err, d) {
                                        cmsTask.updateFilesList();
                                    });
                                    webCpu.CardItem.dismissMask(task);
                                }, {
                                    confirm: "确认",
                                    default: "取消"
                                });
                            } else {
                                showTips(task, "暂不可删除，需要先删除该目录下的所有文件。", function () {
                                    webCpu.CardItem.dismissMask(task);
                                }, {
                                    confirm: "确定"
                                });
                            }
                        }, key);
                    } else {
                        showTips(task, tips, function () {
                            cmsTask.cloudItem.deleteObject(key, function (err, d) {
                                cmsTask.updateFilesList(cmsTask.current.type, cmsTask.current.folder);
                                cmsTask.countFilesList(function (d) {
                                    $(cmsTask.titleArea).find(".usedSize").html(transBytes(d.size))
                                });
                            })
                            webCpu.CardItem.dismissMask(task);
                        }, {
                            confirm: "确认",
                            default: "取消"
                        });
                    }

                });

            }
        },
        previewFolder: function (url) {
            var cmsTask = webCpu.cards.transwebCms.task;
            if (cmsTask.current.type !== "markdown") {
                return false;
            }
            var t = url.split("/");
            var fileName = t[t.length - 2];
            var _self = this;
            var title = "<span class='abstractBtn' title='" + fileName + "' style='vertical-align: middle; overflow:hidden; white-space: nowrap; text-overflow:ellipsis; display: inline-block;'>" + fileName + "</span>"
            cardDialog(webCpu.cards.transwebView, "webApps/book.js", title, null, {
                callback: function (c, d, t) {
                    d.task.query = {
                        key: url.replace(cmsTask.location, "")
                    };
                    d.task.folderUrl = url;
                    $(t.maskTitle).find(".abstractBtn").on("click", function () {
                        _self.setPageAbstract(function (c, d, t) {
                            var cmsTask = webCpu.cards.transwebCms.task;
                            var mCard = getRightMaskCard();
                            var tUrl = mCard.task.folderUrl;
                            d.task.url = webCpu.cards.transweb.task.getAbstractByUrl(tUrl);
                            d.task.page = tUrl;
                            d.task.type = "book";
                            d.task.params = {
                                query: {
                                    key: url.replace(cmsTask.location, "")
                                },
                                url: "eBookList"
                            }
                        });
                    });
                },
                closeCallback: function () {
                    localStorage.transwebState = "";
                    localStorage.transwebName = "";
                    localStorage.transwebData = "";
                }
            }, "<span class='abstractBtn' style='cursor: pointer'>摘要</span>");

        },
        previewItem: function (url) {
            var t = url.split("/");
            var fileName = t[t.length - 1];
            var cmsTask = webCpu.cards.transwebCms.task;
            // localStorage.transwebName = fileName || "";
            // localStorage.transwebFolder = cmsTask.current.folder || "";
            // localStorage.transwebType = cmsTask.current.type;
            
            var currentType = cmsTask.current.type;
            var t = (new Date()).getTime();
            var title = "<span title='" + fileName + "' style='vertical-align: middle; overflow:hidden; white-space: nowrap; text-overflow:ellipsis; display: inline-block;'>" + fileName + "</span>"
            var dealArea = "<span class='abstractBtn' style='cursor: pointer;'>摘要</span>";
            if (currentType === "image") {
                this.previewCard.task.images.content = WebTool.attachParams(url, {
                    _t: t
                });
                dealArea = "";
            } else if (currentType === "js") {
                this.previewCard = WebTool.attachParams(url, {
                    _t: t
                });
                this.currentUrl = url;
            } else if (currentType === "markdown") {
                this.previewCard.task.url = url;
            } else {
                showMessage("暂不支持该类文件的预览。");
                return false;
            }
            var _self = this;

            cardDialog(webCpu.cards.transwebView, this.previewCard, title, null, {
                callback: function (c, d, t) {
                    webCpu.cards.transwebCms.task.tData = WebTool.copyObject(d);
                    $(t.maskTitle).find(".abstractBtn").on("click", function () {
                        _self.setPageAbstract(function (c, d, t) {
                            var mCard = getRightMaskCard();
                            if (currentType !== "js") {
                                var tUrl = mCard.task.url;
                                tUrl = tUrl.split("?")[0];
                                d.task.url = webCpu.cards.transweb.task.getAbstractByUrl(tUrl);
                                d.task.page = tUrl;
                            } else {
                                d.task.url = webCpu.cards.transweb.task.getAbstractByUrl(_self.previewCard);
                                if(typeof(_self.previewCard) === "string") {
                                    d.task.page = _self.previewCard;
                                }
                            }
                            d.task.type = currentType;
                        });
                    });
                },
                closeCallback: function () {
                    localStorage.transwebState = "";
                    localStorage.transwebName = "";
                    localStorage.transwebData = "";
                }
            }, dealArea);
        }
    }
})