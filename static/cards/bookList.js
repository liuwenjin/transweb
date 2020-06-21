transweb_bookList({
  "className": 'ListGroup',
  "cardName": "transwebBookList",
  "task": {
    "style": {
      "padding-top": "10px"
    },
    "option": {
      "prefix": "userData/book/文章/",
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
      "template": "<div url='{{url}}' style='position: relative; width: 100%; height: 100%;'><div style='width: 100%; height: calc( 100% - 40px ); border: solid 1px #f2f2f2;'><img src='{{image}}' width='100%' height='100%' /></div>\
                      <span title='{{title}}' class='bookName' style='display: inline-block; text-align: center; width: 100%; overflow: hidden;text-overflow:ellipsis; white-space: nowrap; height: 15px; font-size: 10px; margin-top: 5px; font-weight: 600'>{{title}}</span>\
                      <span title='{{author}}' class='bookName' style='display: inline-block; text-align: center; width: 100%; overflow: hidden; height: 15px; font-size: 10px; margin-top: 0px; font-weight: 200'>作者:{{author}}</span></div>",
    },
    data: [],
    promise: {
      beforeRender: function (container, data, task) {
        if (typeof (task.dataFilter) === "function") {
          task.data = data = task.dataFilter(data);
        }
        task.data = data.map(function (item) {
          var url = task.option.prefix + item.title + "/";
          var t = {
            title: item.name || "(未命名)",
            image: item.image || "/images/book.png",
            author: item.author || "佚名",
            description: item.description || "(暂无简介)",
            url: item.url
          }
          for (var k in t) {
            item[k] = t[k];
          }
          return item;
        })
        var w = $(container).width() - 15;
        var count = Math.floor(w / 100);
        var wholeGap = w % 100;
        var gap = wholeGap / (count - 1);
        if (gap < 2) {
          gap = (wholeGap + 100) / (count - 1);
          count -= 1;
        }
        task.count = count;
        task.option.style["margin-right"] = gap + "px";
      },
      afterRender: function (container, data, task) {
        $(container).find(".list-group>.list-group-item:nth-child(" + task.count + "n)").css({
          "margin-right": "0px"
        });

        $(container).find(".list-group-item").on("click", function () {
          let index = $(this).attr("index");
          let key = $(this).children().attr("url");
          //webCpu.startReadBook(key, data[index]);
          if (typeof (task.promise.clickCallback) === "function") {
            var tData = data[index];
            task.promise.clickCallback(tData.name, tData.id, webCpu.cards.main);
          }
        });
      }
    },
    url: "/mockData/bookData.json",
    requestType: "get",
    dataType: "json"
  }
});