myItemsEditor({
  "className": 'ListMenu',
  "cardName": "myItemsEditor",
  "task": {
    open: true,
    toggle: false,
    "option": {
      "style": {
        "display": "inline-block",
        "vertical-align": "top",
        "width": "100px",
        "height": "140px",
        "position": "relative",
        "border": "solid 0px #f2f2f2",
        "border-radius": "5px",
        "background": "#f0f0f0",
        "margin-right": "5px",
        "margin-bottom": "5px",
        "overflow": "hidden"
      },
    },
    getDataItemByIndex: function (index) {
      if (typeof (index) === "string") {
        index = index.split("-");
      }
      var d = null;
      if (typeof (index[0])) {
        d = this.data[index[0]];
      }
      if (d.content && index[1]) {
        d = d.content[index[1]];
      }
      d.parentNode = this.data[index[0]];
      return d;
    },
    renameShelfItem: function (clasName, value, olderValue) {
      webCpu.adapter.renameShelfItem({
        className: clasName,
        newName: value,
        name: olderValue
      }, function (d) {
        webCpu.CardItem.fresh(webCpu.cards.myItemsEditor);
      });
    },
    renameClassItem: function (value, olderValue) {
      webCpu.adapter.renameClassItem({
        newName: value,
        name: olderValue
      }, function (d) {
        webCpu.CardItem.fresh(webCpu.cards.myItemsEditor);
      });
    },
    addShelfItem: function (className, value) {
      webCpu.adapter.addShelfItem({
        className: className,
        name: value
      }, function (d) {
        webCpu.CardItem.fresh(webCpu.cards.myItemsEditor);
      });
    },
    removeShelfItem: function (className, name) {
      webCpu.adapter.removeShelfItem({
        className: className,
        name: name
      }, function (d) {
        webCpu.CardItem.fresh(webCpu.cards.myItemsEditor);
        var shelfCard = webCpu.cards.transwebManageDataTable;
        if(shelfCard.breadcrumb[0] === className && shelfCard.breadcrumb[1] === name) {
          shelfCard.breadcrumb = [];
          webCpu.cards.testA.breadcrumb = [];
          $(shelfCard.task.cardBody).html("");
        }
      });
    },
    removeClassItem: function (name) {
      webCpu.adapter.removeClassItem({
        name: name
      }, function (d) {
        webCpu.CardItem.fresh(webCpu.cards.myItemsEditor);
      });
    },
    template: '<div class="menuItemArea" style="display: inline-block; position: relative; width: 100%;">{{title}}\
                    <button tabindex="0"  style="position: absolute; right: 5px;" type="button" class="btn editItemBtn btn-default btn-xs" data-container="body" data-toggle="popover" value={{title}} data-placement="left" >编辑</button>\
                    <button tabindex="0"  style="position: absolute; right: 55px;" type="button" class="btn deleteItemBtn btn-default btn-xs" data-container="body" data-toggle="popover" data-placement="left" >删除</button>\
                </div>',
    editDialog: '<div style="width: 200px;" class="input-group">\
                    <input type="text" class="form-control" placeholder="输入名词">\
                    <span class="input-group-btn">\
                    <button class="btn btn-default submitEditBtn" type="button">确认</button></span></div>',
    addItemTemplate: '<div style="display: inline-block; position: relative; width: 100%;">\
                        <label tabindex="0" class="addItemBtn" style="display: inline-block; width: auto; padding: 0px 20px;" data-container="body" data-toggle="popover" data-placement="left" >新增</label>\
                    </div>',
    deleteConfirm: '<div style="width: 200px; position: relative; float: left; padding: 10px 5px 15px 5px;"><p>确定要删除吗？</p>\
                    <div style="float: right;"><button tabindex="0"  style="position: relative; margin-right: 5px;" type="button" class="btn cancelDeleteBtn btn-default btn-xs" >取消</button>\
                    <button tabindex="0"  style="position: relative;" type="button" class="btn confirmDeleteBtn btn-primary btn-xs" >确定</button>\</div></div>',
    data: [],
    promise: {
      beforeRender: function (container, data, task) {
        if (typeof (task.dataFilter) === "function") {
          task.data = data = task.dataFilter(data);
        }
        for (var i = 0; i < data.length; i++) {
          data[i].content = data[i].content || [];
          if (!data[i].exist) {
            data[i].content.push({
              template: task.addItemTemplate
            });
            data[i].exist = true;
          }
        }
      },
      afterRender: function (container, data, task) {
        var editItemSelector = $(container).find('.editItemBtn[data-toggle="popover"]');
        editItemSelector.popover({
          content: task.editDialog,
          container: container,
          placement: "right",
          html: true,
          trigger: "click"
        });
        var editItemSelector = $(container).find('.deleteItemBtn[data-toggle="popover"]');
        editItemSelector.popover({
          content: task.deleteConfirm,
          container: container,
          placement: "right",
          html: true,
          trigger: "click"
        });
        var addItemSelector = $(container).find('.addItemBtn[data-toggle="popover"]');
        addItemSelector.popover({
          content: task.editDialog,
          container: container,
          placement: "right",
          html: true,
          trigger: "click"
        });
        $(container).find('[data-toggle="popover"]').on("shown.bs.popover", function (tEvent) {
          var value = $(this).attr("value") || "";
          $(container).find(".panel-title").removeClass("activeItem");
          $(container).find(".list-group-item").removeClass("activeItem");
          var itemSelector = $(this).parent().parent().parent();
          itemSelector.addClass("activeItem");
          var index = itemSelector.attr("index");

          $(container).find(".popover").find("input").val(value);
          $(container).find(".popover").find(".submitEditBtn").attr("olderValue", value);
          $(container).find(".popover").on("click", function (e) {
            if (e && e.stopPropagation) {
              e.stopPropagation();
            } else {
              window.event.cancelBubble = true;
            }
          });

          $(container).find(".popover").find(".confirmDeleteBtn").on("click", function () {
            $(tEvent.target).popover("hide");
            var d = task.getDataItemByIndex(index);
            if (!d.content) {
              task.removeShelfItem(d.parentNode.title, d.title);
            } else {
              task.removeClassItem(d.title);
            }
          })

          $(container).find(".popover").find(".cancelDeleteBtn").on("click", function () {
            $(tEvent.target).popover("hide");
            var d = task.getDataItemByIndex(index);
            console.log(d);

          })

          $(container).find(".popover").find(".submitEditBtn").on("click", function () {
            $(tEvent.target).popover("hide");
            var d = task.getDataItemByIndex(index);
            var olderValue = $(this).attr("olderValue");
            var value = $(this).parent().parent().find("input").val();
            if (olderValue) {
              if (d.content) {
                task.renameClassItem(value, olderValue);
              } else {
                task.renameShelfItem(d.parentNode.title, value, olderValue);
              }
            } else {
              webCpu.adapter.addShelfItem({
                className: d.parentNode.title,
                name: value
              }, function (d) {
                webCpu.CardItem.fresh(webCpu.cards.myItemsEditor);
              });
            }
            console.log(d);
          })


        });
        $(container).find('[data-toggle="popover"]').on("click", function () {
          // $(container).find('[data-toggle="popover"]').popover('hide');
          var selector = $(container).find('[data-toggle="popover"]');
          for (var i = 0; i < selector.length; i++) {
            if (selector.index(this) !== i) {
              selector.eq(i).popover('hide');
            } else {
              $(this).popover('toggle');
            }
          }
        });
        $(window).on("click", function () {
          var srcSelector = $(event.srcElement);
          if (srcSelector.attr("data-toggle") !== "popover") {
            var selector = $(container).find('[data-toggle="popover"]').popover("hide");
            $(container).find(".panel-title").removeClass("activeItem");
            $(container).find(".list-group-item").removeClass("activeItem");
          }
        });

        $(container).find(".list-group-item").on("click", function () {
          var index = $(this).attr("index");
          var d = task.getDataItemByIndex(index);
          if (d.title && d.parentNode && d.parentNode.title) {
            var tCard = webCpu.cards.transwebManagerContainer;
            webCpu.plugin.bookManager.breadcrumb = [d.parentNode.title, d.title];
            webCpu.cards.testA.breadcrumb = [d.parentNode.title, d.title];
            webCpu.interface.bookManager.query.current = d.key;
            var shelfArea = $(tCard.task.container).find(".configShelfArea")[0];
            webCpu.updateView(shelfArea, webCpu.plugin.bookManager);
          }
        });
      }
    },
    url: "",
    requestType: "get",
    dataType: "json"
  }
});