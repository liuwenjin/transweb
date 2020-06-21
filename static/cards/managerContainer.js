transweb_managerContainer({
  border: "none",
  background: "#fff",
  cardName: "transwebManagerContainer",
  titleHeight: 50,
  titleData: {
    menu: [{
      name: "新增",
      key: 'addShelf',
      callback: function () {

      }
    }],
    rightMenu: [{
      name: "新增书籍",
      key: 'addBook',
      callback: function () {

      }
    }]
  },
  style: {
    "max-width": 1200
  },
  task: {
    template:'<div class="configMenuArea" style="width: 300px; height: 100%; float:left; position: absolute; z-index: 999;"></div>\
              <div class="configShelfArea" style="width: calc( 100% - 320px ); height: 100%;  float:right;"></div>',
    data: [],
    configBook: function (folder, key, value, callback) {
      var param = {
        folder: folder,
        key: key,
        value: value
      }
      if (typeof (key) !== "string") {
        param = {
          folder: folder,
          current: webCpu.interface.bookManager.query.current,
          param: JSON.stringify(key)
        }
      }
      webCpu.adapter.configBook(param, function (d) {
        if (typeof (callback) === "function") {
          callback(d);
        }
      });
    },
    promise: {
      beforeRender: function (container, data, task) {
        console.log(data);
      },
      afterRender: function (container, data, task) {
        if(webCpu.cards.testA.breadcrumb.length === 2) {
          var shelfArea = $(container).find(".configShelfArea")[0];
          webCpu.updateView(shelfArea, webCpu.plugin.bookManager);
        }
        var menuArea = $(container).find(".configMenuArea")[0];
        webCpu.updateView(menuArea, webCpu.plugin.shelfConfig);
        $(task.titleArea).find("li[key=upperShelf]").on("click", function () {
          var t = webCpu.cards.transwebManageDataTable.task;
          if (t.selected.length !== 0) {
            task.configBook(t.selected, "status", "0", function (d) {
              webCpu.updateView(container, webCpu.plugin.bookManager);
            });
          }
        });
        $(task.titleArea).find("li[key=lowerShelf]").on("click", function () {
          var t = webCpu.cards.transwebManageDataTable.task;
          if (t.selected.length !== 0) {
            task.configBook(t.selected, "status", "1", function (d) {
              webCpu.updateView(container, webCpu.plugin.bookManager);
            });
          }
        });
        $(task.titleArea).find("li[key=addShelf]").on("click", function () {
          var arr = [{
            "key": "name",
            "editor": {
              "type": 'text',
              "placeholder": "输入书柜名称",
              "value": ''
            }
          }];
          var cName = "transwebManagerContainer";
          var ret = webCpu.CardItem.configDialog(webCpu.cards[cName], "新增书柜", arr, function () {
            var name = ret.task.data.name;
            webCpu.adapter.addClassItem({
              name: name
            }, function(d){
              webCpu.updateView(menuArea, webCpu.plugin.shelfConfig);
            });
          }, webCpu.style.dialog);
        });
        $(task.titleArea).find("li[key=addBook]").on("click", function () {
          if(webCpu.cards.testA.breadcrumb.length < 2) {
            return false;
          }
          var arr = [{
            "key": "name",
            "editor": {
              "type": 'text',
              "placeholder": "输入书籍名称",
              "value": ''
            }
          }];
          var cName = "transwebManagerContainer";
          var ret = webCpu.CardItem.configDialog(webCpu.cards[cName], "新增书籍", arr, function () {
            ret.task.data.current = webCpu.interface.bookManager.query.current;
            if(ret.task.data.current) {
              webCpu.adapter.createFolder(ret.task.data, function (d) {
                var t = webCpu.cards.transwebManageDataTable.task;
                webCpu.DataTable.render(t);
              });
            }
            
          }, webCpu.style.dialog);
        });
      }
    }
  }
})