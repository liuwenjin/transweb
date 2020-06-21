manageDataTable({
  "className": 'DataTable',
  "cardName": "transwebManageDataTable",
  "titleHeight": 37,
  "titleStyle": {
    "border-top": "solid 1px #f2f2f2"
  },
  "footHeight": 60,
  "task": {
    "option": {
      "headerOption": [],
      "attributeMap": {
        // id: {
        //   name: "选择",
        //   render: function (v, d) {
        //     var str = "<input data='" + d.id + "' type='checkbox' />";
        //     return str;
        //   }
        // },
        name: "名称",
        author: "作者",
        _sort: {
          name: "排序",
          render: function (v, d) {
            var tHtml = "<button class='btn btn-default btn-xs upBtn'>上移</button><button style='margin-left: 10px;' class='btn btn-default btn-xs downBtn'>下移</button>"
            return tHtml;
          }
        },
        // status: {
        //   name: "状态",
        //   render: function (v, d) {
        //     v = v || "1";
        //     return webCpu.dict.common.status[v] || "";
        //   }
        // },
        _op: {
          name: "操作",
          render: function (v, d) {
            var tHtml = "<button class='btn btn-default btn-xs previewBtn'>预览</button><button style='margin-left: 10px;' class='btn btn-default btn-xs configBtn'>配置</button><button style='margin-left: 10px;' class='btn btn-default btn-xs removeBtn'>删除</button>"
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
    "selected": [],
    "addRecord": function () {
      var _self = this;
      this.editDialog("添加记录", null, function (d, i) {
        _self.data.unshift(d);
        webCpu.DataTable.update(_self);
        webCpu.saveAppData(_self.cardName);
      });
    },
    "editDialog": function (title, index, callback) {
      var d = index || {};
      if (typeof (index) === "number" || typeof (index) === "string") {
        d = this.data[index];
      }
      var header = this.header;
      var configData = this.configData(d);
      var _self = this;
      webCpu.CardItem.configDialog(_self, title, configData, function () {
        var inputItem = webCpu.FormItem.getValue(_self.inputTask);
        var _d = {};
        for (var j = 0; j < inputItem.length; j++) {
          _d[inputItem[j].name] = inputItem[j].value;
        }
        if (typeof (callback) === "function") {
          callback(_d, index);
        }
      }, "300px");
    },
    switchPageItem: function (a, b) {
      var temp = this.data[a];
      this.data[a] = this.data[b];
      this.data[b] = temp;
      webCpu.DataTable.updateView(this);
      var indexData = this.data.map(function(item) {
        return item.id;
      });
      console.log(indexData);
      console.log(this.data);
      webCpu.adapter.bookIndex({
        current: webCpu.interface.bookManager.query.current,
        data: JSON.stringify(indexData)
      }, function(d) {
        console.log(d);
      })
      // var _self = this;
      // webCpu.cards.transwebManageDataTable.task.configBook(this.bookData.id, {
      //   "children": this.data
      // }, "", function (d) {
        
      // });
    },
    "promise": {
      "beforeRender": function (container, data, task) {
        if (typeof (task.dataFilter) === "function") {
          task.data = data = task.dataFilter(data);
        }
        
        var tData = data;
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
        task.configBook = webCpu.cards.transwebManagerContainer.task.configBook;
        task.selected = [];
        var inputSelector = $(container).find(".DataTable_tdContent[key=id]");
        inputSelector.find("input").on("change", function () {
          var tSelector = inputSelector.find("input:checked");
          for (var i = 0; i < tSelector.length; i++) {
            var value = tSelector.eq(i).attr("data");
            task.selected.push(value);
          }
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

        $(container).find(".DataTable_tdContent[key=name]").on("click", function () {
          var cName = "transwebManagerContainer";
          var index = $(this).parent().parent().attr("index");
          var tData = task.data[index];
          webCpu.interface.pageManager.query = {
            folder: tData.id,
            current: webCpu.interface.bookManager.query.current
          };
          webCpu["CardItem"].renderCardDialog(webCpu.cards[cName], webCpu.plugin.pageManager, {
            title: $(this).attr("title"),
            style: {
              background: "#fff"
            },
            closeType: "close"
          });
        });
        $(container).find(".DataTable_tdContent[key=_op] .previewBtn").on("click", function () {
          var index = $(this).parent().parent().parent().attr("index");
          var tData = task.data[index];
          webCpu.startReadBook(tData.name, tData.id, webCpu.cards.main.task.childCard);
        });

        $(container).find(".DataTable_tdContent[key=_op] .configBtn").on("click", function(){
          var index = $(this).parent().parent().parent().attr("index");
          var tData = task.data[index];
          var v = tData.name;
          var id = tData.id;
          var arr = [{
            "key": "name",
            "label": "书名",
            "editor": {
              "type": 'text',
              "placeholder": "输入书籍名称",
              "value": v
            }
          },{
            "key": "author",
            "label": "作者",
            "editor": {
              "type": 'text',
              "placeholder": "输入作者名称",
              "value": tData.author || ""
            }
          }, {
            "key": "abstract",
            "label": "摘要",
            "editor": {
              "type": 'textarea',
              "placeholder": "输入书籍摘要",
              "value": tData.abstract || ""
            }
          }];
          var cName = "transwebManagerContainer";
          var ret = webCpu.CardItem.configDialog(webCpu.cards[cName], "编辑", arr, function () {
            var param = ret.task.data;
            param.current = webCpu.interface.bookManager.query.current;
          
            task.configBook(id, param, null, function(d) {
              var t = webCpu.cards.transwebManageDataTable.task;
              webCpu.DataTable.render(t);
            });
          }, webCpu.style.configBookDialog);
        });

        $(container).find(".DataTable_tdContent[key=_op] .removeBtn").on("click", function () {
          var index = $(this).parent().parent().parent().attr("index");
          var tData = task.data[index];
          var cName = "transwebManagerContainer";
          webCpu.CardItem.confirmDialog(webCpu.cards[cName], "确认删除[" + tData.name + "]吗？", function () {
            var query = {};
            if (tData) {
              query.folder = tData.id;
              query.current= webCpu.interface.bookManager.query.current;
            }
            webCpu.adapter.removeFolder(query, function (ret) {
              webCpu.DataTable.render(task);
            })
          }, webCpu.style.dialog);

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