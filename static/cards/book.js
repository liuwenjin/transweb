transweb_book({
  cardName: "transwebBook",
  task: {
    option: {
      current: 0
    },
    data: [],
    generateCatalogCard: function (callback) {
      if (!this.data) {
        return false;
      }
      this.data.map(function (d) {
        d.title = d.name;
        d.action = function (e) {
          callback(e);
        }
        return d;
      });
      var card = {
        className: "ListMenu",
        style: {
          "max-width": "800",
          "width": "98%"
        },
        task: {
          data: this.data
        }
      }
      return card;
    },
    openCatalog: function (card) {
      var tCard = card || webCpu.cards[this.cardName];
      webCpu["CardItem"].renderCardDialog(tCard, this.catalogCard, {
        closeType: "right",
        title: "目录"
      });
    },
    promise: {
      beforeRender: function (container, data, task) {
        // task.data = webCpu.arrayToCataData(data, task.bookData.id);
       
        var appUrl = webCpu.cards[task.cardName].appUrl;
        task.tool = appUrl.replace("book.js", "ebook.js");

        task.catalogCard = task.generateCatalogCard(function (e) {
          var url = $(e.currentTarget).attr("url");
          webCpu.cards.transwebEbook.task.url = url;
          webCpu.CardItem.fresh(webCpu.cards.transwebEbook);
          webCpu.CardItem.dismissMask(task);
        });
      },
      afterRender: function (container, data, task) {
        webCpu.addCardItem(container, task.tool, {
          callback: function (c, d, t) {
            d.task.catalog.data = data;
            var current = task.option.current || 0;
            d.task.url = data[current].url + "?t=" + (new Date()).getTime();
          }
        });
        $(task.titleArea).find(".openFirstPageBtn").html(task.title || "电子书");
        $(task.titleArea).find(".openCatalogBtn").on("click", function () {
          task.openCatalog();
        });
        $(task.titleArea).find(".openFirstPageBtn").on("click", function () {
          webCpu.cards.transwebEbook.task.url = data[0].path;
          webCpu.CardItem.fresh(webCpu.cards.transwebEbook);
        })
      }
    },
    requestType: 'jsonp',
    dataType: 'json'
  }
})