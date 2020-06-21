transweb_bookIntroduce({
  style: {
    overflow: "auto",
    "align-items": "flex-start"
  },
  task: {
    style: {
      "padding": "25px 40px",
      "max-width": "800px",
      "min-height": "100%",
      "background-color": "#fff",
      "border-top-left-radius": "6px",
      "border-top-right-radius": "6px",
      height: "auto"
    },
    template: "<div style='position: relative; width: 100%; height: 160px; float: left;'><div style='float: left; width: 135px; height: 100%; border: solid 1px #f2f2f2;'><img src='{{image}}' width='100%' height='100%' /></div>\
                  <div style='position: relative; float: left; display: inline-block; width: calc( 100% - 135px );text-align: left; padding-left: 15px;'> \
                      <p title='{{title}}' style='text-align: left; width: 100%; overflow: hidden;text-overflow:ellipsis; white-space: nowrap; height: 20px; font-weight: 600'>{{title}}</p>\
                      <p title='{{author}}' style='text-align: left; width: 100%; overflow: hidden; height: 18px; margin-top: 0px; font-weight: 200'>作者:{{author}}</p>\
                      <p title='{{description}}' style='text-align: left; width: 100%; overflow: hidden; height: 57px; margin-top: 0px; font-weight: 300'>简介: {{description}}</p>\
                      <p style='text-align: left; width: 100%; overflow: hidden; margin-top: 0px; font-weight: 300'><button class='btn btn-primary startReadBtn'>开始阅读</button></p></div></div>\
              <div class='catalogArea' style='position: relative; float: left; padding-top: 20px; width: 100%;'><p style='margin-bottom: 5px; padding-bottom: 10px; color: #999; box-shadow: 0px 1px 0px #ddd;'>目录</p></div>",
    data: [],
    promise: {
      clickCallback: function () {

      },
      beforeRender: function (container, data, task) {
        if (typeof (task.dataFilter) === "function") {
          task.data = data = task.dataFilter(data);
        }
        task.data.id = task.query.key;
        task.data.title = data.name || "(未命名)";
        task.data.image = data.image || "/images/book.png";
        task.data.author = data.author || "(佚名)";
        task.data.description = data.abstract || "(暂无简介)";
      },
      afterRender: function (container, data, task) {
        var t = task.data.children;
        var catalogItem = $('<ul class="list-group" style="position: relative; width: 100%;"></ul>');
        for (let i = 0; i < t.length; i++) {
          var iSelector = $('<li class="list-group-item" style="cursor: pointer; border: none; border-bottom: 1px solid #ddd; border-radius: 0px; width: 50%; float: left;" index=' + i + '>' + t[i].name + '</li>');
          iSelector.appendTo(catalogItem);
        }
        catalogItem.appendTo($(container).find(".catalogArea"));
        var style = {
          border: "none",
          "border-radius": "0px",
          "margin-bottom": "2px",
          "box-shadow": "0px 1px 0px #ddd",
          "padding-left": "0px",
          "width": "calc( 50% - 15px )",
          "overflow": "hidden",
          "text-overflow": "ellipsis",
          "white-space": "nowrap"
        };
        if($(container).width() > 500) {
          catalogItem.find(".list-group-item:nth-child(2n)").css({
            "margin-left": "20px"
          });
        }
        else {
          style.width = "100%";
        }
        catalogItem.find(".list-group-item").css(style);

        $(container).find(".startReadBtn").on("click", function () {
          if (typeof (task.promise.clickCallback) === "function") {
            task.promise.clickCallback(0, task.data);
          }
        });

        $(container).find(".addFavoriteBtn").on("click", function () {
          var t = WebTool.searchRecord("transwebFavorites", task.option, "url");
          if (t === -1) {
            $(container).find(".addFavoriteBtn>span").attr("title", "取消收藏");
            $(container).find(".addFavoriteBtn>span").removeClass("glyphicon-heart-empty");
            $(container).find(".addFavoriteBtn>span").addClass("glyphicon-heart");
          } else {
            $(container).find(".addFavoriteBtn>span").attr("title", "加入收藏");
            $(container).find(".addFavoriteBtn>span").removeClass("glyphicon-heart");
            $(container).find(".addFavoriteBtn>span").addClass("glyphicon-heart-empty");
          }
          if (typeof (task.promise.addFavorite) === "function") {
            task.promise.addFavorite();
          }
        });

        $(container).find(".list-group-item").on("click", function () {
          var index = $(this).attr('index');
          if (typeof (task.promise.clickCallback) === "function") {
            task.promise.clickCallback(index, task.data);
          }
        })

      }
    }
  }
});