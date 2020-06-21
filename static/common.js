webCpu.startReadBook = function (name, bookId, card) {
  card = card || webCpu.cards["main"];
  let option = webCpu.plugin.bookIntroduce;
  option.callback = function (c, d, t) {
    d.task.query.key = bookId;
    d.task.query.current = webCpu.interface.bookManager.query.current;
    d.cardName = "transwebIntroduce";
    d.task.dataFilter = function (tData) {
      tData = tData.data || tData;
      tData.children.map(function (t) {
        t.url = webCpu.indexToPageUrl(t, "", bookId);
        return t;
      });
      return tData;
    }
    d.task.promise.clickCallback = function (n, data) {
      webCpu.openBookPage(data, n, card.task.childCard);
    }
    d.task.promise.addFavorite = function (n, data) {
      var t = WebTool.searchRecord("transwebFavorites", data, "url");
      if (t === -1) {
        WebTool.addRecord("transwebFavorites", data);
      } else {
        WebTool.removeRecord("transwebFavorites", data, "url");
      }
    }
  }
  webCpu["CardItem"].renderCardDialog(card, option, {
    title: name,
    closeType: "back"
  });
}

webCpu.openBookPage = function (bookData, n, card) {
  bookData = JSON.parse(JSON.stringify(bookData));
  card = card || webCpu.cards["main"];
  let tOption = webCpu.plugin.transwebBook;
  tOption.callback = function (c2, d2, t2) {
    d2.task.option.current = n || 0;
    d2.task.data = bookData.children;
    d2.task.bookData = bookData;
  };

  webCpu["CardItem"].renderCardDialog(card, tOption, {
    title: bookData.name,
    closeType: "back",
    menu: [{
      text: "目录",
      action: function () {
        webCpu.cards.transwebBook.task.openCatalog(webCpu.cards["transwebEbook"]);
      }
    }]
  });
}

webCpu.indexToPageUrl = function (data, index, bookId) {
  var user = "liuwenjin";
  if (webCpu.cards.transwebManageDataTable) {
    user = webCpu.cards.transwebManageDataTable.task.query.user || user;
  }
  var item = data;
  if (data && index && data[index]) {
    item = data[index];
  }
  var prefix = "https://transweb-1254183942.cos.ap-beijing.myqcloud.com/";
  var path = item.path;
  var url = prefix + "/book/" + user + "/" + bookId + "/" + path;
  return url;
}