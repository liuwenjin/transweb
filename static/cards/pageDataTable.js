pageDataTable({
  "className": 'DataTable',
  "cardName": "transwebBookPageList",
  "titleHeight": 50,
  style: {
    "background": "#fff"
  },
  "titleData": {
    menu: [{
      name: "删除",
      key: "removePage",
      callback: function () {

      }
    }],
    rightMenu: [{
      name: "新增",
      key: "addPage",
      callback: function () {

      }
    }]
  },
  "footHeight": 60,
  "task": {
    "option": {
      "backupGap": 1000 * 5,
      "headerOption": [],
      "attributeMap": {
        id: {
          name: "选择",
          render: function (v, d) {
            var str = "<input type='checkbox' />";
            return str;
          }
        },
        name: "名称",
        _op: {
          name: "操作",
          render: function (v, d) {
            var tHtml = "<button class='btn btn-default btn-xs editorBtn'>编辑</button><button style='margin-left: 10px;' class='btn btn-default btn-xs renameBtn'>重命名</button>"
            return tHtml;
          }
        },
        _sort: {
          name: "排序",
          render: function (v, d) {
            var tHtml = "<button class='btn btn-default btn-xs upBtn'>上移</button><button style='margin-left: 10px;' class='btn btn-default btn-xs downBtn'>下移</button>"
            return tHtml;
          }
        }
      },
      "page": {
        "total": 1,
        "size": 10,
        "current": 1
      },
      defaultItem: [{
        "type": 'text',
        "width": '120px',
        "value": ''
      }]
    },
    "header": [],
    "data": [],
    "itemMap": {

    },
    switchPageItem: function (a, b) {
      var temp = this.data[a];
      this.data[a] = this.data[b];
      this.data[b] = temp;
      var _self = this;
      webCpu.cards.transwebManageDataTable.task.configBook(this.bookData.id, {
        "children": this.data,
        "current": webCpu.interface.bookManager.query.current
      }, "", function (d) {
        _self.updatePageList();
      });
    },
    updatePageList: function () {
      webCpu.DataTable.render(this);
    },
    configPage: function (folder, file, key, value, callback) {
      webCpu.adapter.configPage({
        folder: folder,
        file: file,
        current: webCpu.interface.bookManager.query.current,
        key: key,
        value: value
      }, function (d) {
        if (typeof (callback) === "function") {
          callback(d);
        }
      });
    },
    getCheckIndex: function (key) {
      key = key || "id";
      var ret = [];
      var selector = $(this.container).find(".DataTable_tdContent[key=" + key + "] input:checked");
      for (var i = 0; i < selector.length; i++) {
        var index = selector.eq(i).parent().parent().parent().attr("index");
        var path = this.data[index].path;
        ret.push(path);
      }
      return ret;
    },
    uploadCurrentPage: function (path, callback) {
      var _self = this;
      var text = webCpu.cards.transwebArticleEditor.task.data;
      _self.uploading = true;
      _self.uploadTime = (new Date()).getTime();
      webCpu.adapter.uploadFile({
        file: path,
        folder: this.query.folder,
        current: webCpu.interface.bookManager.query.current,
        body: text
      }, function (d) {
        _self.uploading = false;
        if (typeof (callback) === "function") {
          callback(d);
        }
      });
    },
    updateArticle: function (text) {
      var _self = this;
      var time = (new Date()).getTime();
      if (!_self.uploading) {
        if ((!_self.uploadTime || (time - _self.uploadTime) > _self.option.backupGap)) {
          _self.uploadCurrentPage(_self.currentPath);
        } else if (!_self.timer) {
          _self.timer = setTimeout(function () {
            _self.uploadCurrentPage(_self.currentPath);
            _self.timer = null;
          }, _self.option.backupGap)
        } else {
          console.log("还没到备份时机.")
        }
      }
    },
    "promise": {
      "beforeRender": function (container, data, task) {
        var tData = data.data;
        tData.id = task.query.folder;
        tData.children.map(function (t) {
          t.url = webCpu.indexToPageUrl(t, "", tData.id);
          return t;
        });
        task.data = tData.children;
        task.bookData = tData;
        if (typeof (task.dataFilter) === "function") {
          task.data = data = task.dataFilter(data);
        }
        if (tData.pager) {
          task.option.page = {
            total: tData.pager.total,
            current: tData.pager.start,
            size: tData.pager.limit
          };
        }

        task.header = [];
        let tMap = task.option.attributeMap;
        for (let k in tMap) {
          var tItem = {
            key: k,
            editor: tMap[k].editor
          };
          if (typeof (tMap[k]) === "string") {
            tItem.name = tMap[k];
          } else {
            tItem.name = tMap[k].name;
            tItem.render = tMap[k].render;
          }
          task.header.push(tItem);
        }
      },
      "afterRender": function (container, data, task) {
        $(container).find(".DataTable_tdContent[key=_op] .editorBtn").on("click", function () {
          var index = $(this).parent().parent().parent().attr("index");
          var pCard = webCpu.cards.main.task.childCard;
          var cName = "transwebManagerContainer";
          var pCard = webCpu.cards._main;
          webCpu.interface.temp.url = data[index].url;
          if (task.timer) {
            clearTimeout(task.timer);
          }
          task.currentPath = data[index].path;
          webCpu.plugin.articleEditor.interface = webCpu.interface.temp;
          webCpu.plugin.articleEditor.callback = function (c, d, t) {
            d.task.promise.valueChange = function (text) {
              task.updateArticle(text);
            }
          }
          var tCard = webCpu["CardItem"].configDialog(pCard, data[index].name, webCpu.plugin.articleEditor, function () {
            task.uploadCurrentPage(task.currentPath);
          }, webCpu.style.editor);

        });

        $(container).find(".DataTable_tdContent[key=name]").on("click", function () {
          var index = $(this).parent().parent().attr("index");
          webCpu.openBookPage(task.bookData, index, webCpu.cards.main.task.childCard);
        });

        $(container).find(".DataTable_tdContent[key=_op] .renameBtn").on("click", function () {
          var index = $(this).parent().parent().parent().attr("index");
          var arr = [{
            "key": "name",
            "editor": {
              "type": 'text',
              "placeholder": "输入文章名称",
              "value": data[index].name
            }
          }];
          var cName = "transwebBookPageList";
          var ret = webCpu.CardItem.configDialog(webCpu.cards[cName], "修改名字", arr, function () {
            task.configPage(task.bookData.id, data[index].path, "name", ret.task.data.name, function (d) {
              task.updatePageList();
            });
          }, webCpu.style.dialog);
        });

        $(container).find(".DataTable_tdContent[key=_sort] .upBtn").on("click", function () {
          var index = $(this).parent().parent().parent().attr("index");
          var n = Number(index);
          if (n - 1 > -1) {
            task.switchPageItem(n, n - 1);
          }
        });
        $(container).find(".DataTable_tdContent[key=_sort] .downBtn").on("click", function () {
          var index = $(this).parent().parent().parent().attr("index");
          var n = Number(index);
          if (n + 1 < data.length) {
            task.switchPageItem(n, n + 1);
          }
        });

        $(task.titleArea).find("li[key=removePage]").on("click", function () {
          var tData = task.bookData;
          var cName = "transwebBookPageList";
          var file = task.getCheckIndex();
          var query = {
            folder: task.bookData.id,
            current: webCpu.interface.bookManager.query.current,
            file: JSON.stringify(file)
          };
          webCpu.CardItem.confirmDialog(webCpu.cards[cName], "确认删除所选中的页面[共" + file.length + "个]吗？", function () {
            if (query.folder && query.file && query.file.length > 0) {
              webCpu.adapter.removeFile(query, function (ret) {
                task.updatePageList();
              });
            }
          }, webCpu.style.dialog);
        });

        $(task.titleArea).find("li[key=addPage]").on("click", function () {
          var arr = [{
            "key": "name",
            "editor": {
              "type": 'text',
              "placeholder": "输入文章名称",
              "value": ''
            }
          }];
          var cName = "transwebBookPageList";
          var ret = webCpu.CardItem.configDialog(webCpu.cards[cName], "新增文章", arr, function () {
            console.log(ret);
            webCpu.adapter.uploadFile({
              name: ret.task.data.name,
              folder: task.query.folder,
              current: webCpu.interface.bookManager.query.current,
              body: ""
            }, function (d) {
              task.currentPath = d.data.path;
              delete webCpu.plugin.articleEditor.interface;
              webCpu.plugin.articleEditor.callback = function (c, d, t) {
                d.task.promise.valueChange = function (text) {
                  task.updateArticle(text);
                }
              }
              var pCard = webCpu.cards._main;
              var tCard = webCpu["CardItem"].configDialog(pCard, ret.task.data.name, webCpu.plugin.articleEditor, function () {
                var text = webCpu.cards.transwebArticleEditor.task.data;
                task.updatePageList();
              }, webCpu.style.editor);
            });
          });
        });

      }
    },
    "pageCallback": function (n, size) {
      this.query = this.query || {};
      this.query.start = n;
      this.query.limit = size || 10;
      webCpu.render("DataTable", this);
    },
    "url": '',
    query: {
      start: 1,
      limit: 10,
      sort: '{"dob": -1}'
    },
    "requestType": 'get',
    "dataType": 'json'
  }
});