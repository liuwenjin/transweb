function LayoutEngine(container, mode, options, data, callback) {
  this.container = container;
  this.data = data;
  this.options = options || {};
  this.callback = callback;
  this.mode = mode;
  this.cards = {};
  if(this.options.style) {
    this.switchStyle(this.options.style);
  }
  this.components = this.options.components || "components";
  for (var i = 0; i < data.length; i++) {
    var obj = data[i];
    if (obj.cardName) {
      this.cards[obj.cardName] = obj;
    }
  }

  this.cardEngine = new CardEngine(options.components, this);
  if (this.container && this.options) {
    this.initLayout(this.container, this.options);
  }
  this.current = {};
  
}

LayoutEngine.prototype.switchStyle = function (url) {
  var _head = document.getElementsByTagName("head")[0];
  var cssLink = document.getElementById("transwebAppStyle");
  if (cssLink) {
    _head.removeChild(cssLink);
  }
  cssLink = document.createElement('link');
  cssLink.setAttribute('type', 'text/css');
  cssLink.setAttribute('id', "transwebAppStyle");
  cssLink.setAttribute('rel', 'stylesheet');
  cssLink.setAttribute('href', url);
  _head.appendChild(cssLink);
}

LayoutEngine.prototype.addCard = function (base, pos, callback) {
  var obj = base;
  if (this.mode === "edit") {
    obj = WebTool.copyObject(base);
  }
  obj.pos = pos || obj.pos || [0, 0];
  obj.task.promise = obj.task.promise || {};
  var container = this.getCardContainer(obj.pos, this.table);
  this.cardEngine.addCardItem(container, obj, "add", this.unit, this.mode, callback);
}

LayoutEngine.prototype.switchLayout = function (area) {
  if (area) {
    this.recoverArea();
    this.options.area = area;
    this.initArea();
  }
}

LayoutEngine.prototype.recoverArea = function () {
  for (var i = 0; i < this.items.length; i++) {
    $(this.items[i]).html("");
    $(this.items[i]).css("width", this.unit[0]);
    $(this.items[i]).css("height", this.unit[1]);
  }
  this.options.area = [];
}

LayoutEngine.prototype.initArea = function () {
  this.items = [];
  var arr = this.options.area;
  if (typeof (arr) === "string" && this.options.modules) {
    arr = this.options.modules[arr].area || this.options.modules[arr];
  } else if (!arr || arr.length === 0) {
    return false;
  } else {}

  for (var i = 0; i < arr.length; i++) {
    var item = this.table.rows[arr[i].pos[1]].cells[arr[i].pos[0]];
    $(item).find(".TableLayout_container").css("width", arr[i].size[0] * this.unit[0]);
    $(item).find(".TableLayout_container").css("height", arr[i].size[1] * this.unit[1]);
    $(item).find(".TableLayout_container").attr("flag", "activeArea");
    var container = $(item).find(".TableLayout_container")[0];
    this.items.push(container);
    if (arr[i].cardName && this.cards[arr[i].cardName]) {
      this.cardEngine.addCardItem(container, this.cards[arr[i].cardName], "replace", this.unit, this.mode, this.callback);
    }
  }
}

LayoutEngine.prototype.switchCardItem = function (cardData) {
  if (cardData.body && this.currentGroup) {
    if (this.currentGroup && (cardData.data.groupName === this.currentGroup || "all" === this.currentGroup)) {
      cardData.inactive = false;
      $(cardData.body).show();
    } else if (cardData.data.groupName && cardData.data.groupName !== "null") {
      cardData.inactive = true;
      $(cardData.body).hide();
    } else {}
  }
}

LayoutEngine.prototype.getGroupCardItems = function (name) {
  var items = [];
  for (var k in this.cardEngine.cardItems) {
    for (var i = 0; i < this.cardEngine.cardItems[k].length; i++) {
      var cardData = this.cardEngine.cardItems[k][i];
      if (cardData.data.groupName === name) {
        items.push(cardData);
      }
    }
  }
  return items;
}

LayoutEngine.prototype.displayGroup = function (name) {
  this.currentGroup = name || "all";
  for (var k in this.cardEngine.cardItems) {
    for (var i = 0; i < this.cardEngine.cardItems[k].length; i++) {
      var cardData = this.cardEngine.cardItems[k][i];
      this.switchCardItem(cardData);
    }
  }

}

LayoutEngine.prototype.saveGroup = function () {
  if (this.currentGroup && this.table) {
    var selector = $(this.table).find(".CardItem:visible");
    selector.attr("groupName", name);
    for (var i = 0; i < selector.length; i++) {
      var index = selector.eq(i).attr("index");
      var className = selector.eq(i).attr("className");
      var cardData = this.cardEngine.cardItems[className][index];
      if (cardData.data.groupName && cardData.data.groupName !== "null") {
        this.cardEngine.cardItems[className][index].data.groupName = this.crruentGroup;
      }
    }
  }
}

LayoutEngine.prototype.removeCard = function (className, index) {
  // this.deleteBusItemsByIndex(className, index);
  this.switchBusItemsByIndex(className, index, false);
  this.cardEngine.removeCard(className, index);
}


LayoutEngine.prototype.removeCardItems = function () {
  for (var k in this.cardEngine.cardItems) {
    for (var i in this.cardEngine.cardItems[k]) {
      var body = this.cardEngine.cardItems[k][i].body;
      body.parentNode.removeChild(body);
    }
    this.cardEngine.cardItems[k] = [];
  }
}

LayoutEngine.prototype.initPageSize = function (resolution, data) {
  var size = [80, 45];
  var data = data || this.data;
  for (var i = 0; i < data.length; i++) {
    data[i].pos = data[i].pos || [0, 0];
    data[i].size = data[i].size || [1, 1];
    var maxX = (data[i].pos[0] || 0) + (data[i].size[0] || 0);
    var maxY = (data[i].pos[1] || 0) + (data[i].size[1] || 0);
    if (maxX > size[0]) {
      size[0] = maxX;
    }
    if (maxY > size[1]) {
      size[1] = maxY;
    }
  }

  if (resolution && resolution[0] && resolution[1]) {
    size[1] = Math.floor(size[0] * resolution[1] / resolution[0]);
  }

  this.size = size;
}

LayoutEngine.prototype.initLayout = function (container, options) {
  container.innerHTML = "";
  var div = document.createElement("div");
  div.setAttribute("class", "layoutTableArea");

  var resolution = null;
  if (this.options.resolution) {
    var tSize = this.options.resolution.split("*");
    if (Number(tSize[0]) && Number(tSize[1])) {
      resolution = tSize;
    }
  }


  this.size = [this.options.width, this.options.height];

  // var u = ($(container).width() / this.size[0]).toFixed(1);
  var u = Math.floor(($(container).width() / this.size[0]) * 100) / 100;

  // var w = u * this.size[0];
  // $(div).width(w);

  this.unit = [u, u];


  // this.unit[1] = Math.floor($(container).height() / this.size[1]);
  this.unit[1] = Math.floor(($(container).height() / this.size[1]) * 10000) / 10000;

  // $(div).height(this.unit[1] * this.size[1]);

  $(div).css("position", "relative");
  $(div).css("margin", "auto");
  $(div).css("float", "none");
  $(div).css("width", "100%");
  $(div).css("height", "100%");
  container.appendChild(div);

  var _self = this;
  webCpu.render("TableLayout", {
    container: div,
    unit: this.unit,
    state: this.mode,
    column: this.size[0],
    row: this.size[1],
    promise: {
      afterRender: function (container, data, task) {
        _self.table = task.table;
        _self.unit = task.unit;
        if (_self.mode !== "edit" && _self.options && _self.options.area) {
          _self.initArea();
        } else {
          _self.initCardItems(_self.table, _self.unit, _self.mode);
        }


      }
    }
  }, this.components);
}

LayoutEngine.prototype.initCardItems = function (table) {
  if (this.data && this.data.length > 0) {
    this.displayGroup(this.currentGroup);
    for (var k in this.data) {
      var cardData = this.data[k];
      var _self = this;
      this.addCard(cardData, null, function (container, data, task) {
        if (typeof (_self.callback) === "function") {
          _self.callback(container, data, task);
        }
      });
    }
  }
}

LayoutEngine.prototype.getCardContainer = function (pos, table) {
  var pos = pos || [0, 0];
  var cell = table.rows[pos[1]].cells[pos[0]];
  return cell.getElementsByClassName("TableLayout_container")[0];
}

LayoutEngine.prototype._calcCellsNumber = function () {
  var options = this.options;
  var min = Math.min(options.width, options.height);
  var t = Math.floor((options.base || 50) / min);
  return [options.width * t, options.height * t]
}

LayoutEngine.prototype.calcCellsNumber = function () {
  var arr = [Math.floor(this.options.width / this.options.base), Math.floor(this.options.height / this.options.base)];
  return arr;
}

LayoutEngine.prototype.getLayoutParams = function (name) {
  var params = WebTool.copyObject(this.options);
  params.name = name;
  return params;
}
LayoutEngine.prototype.getCardListData = function () {
  var cards = [];
  for (var k in this.cardEngine.cardItems) {
    for (var i in this.cardEngine.cardItems[k]) {
      this.cardEngine.cardItems[k][i].data.typeName = this.options.name;
      var cardData = this.cardEngine.cardItems[k][i].data;
      if (cardData.className === "TemplateItem") {
        var temp = cardData.task.template;
        cardData.task.template = "";
        var data = WebTool.copyObject(cardData);
        data.task.template = escape(temp);
        cardData.task.template = temp;
      } else {
        var data = WebTool.copyObject(cardData);
      }

      cards.push(data);
    }
  }
  return cards;
}

LayoutEngine.prototype.getCardListString = function () {
  var cards = this.getCardListData();
  return WebTool.objectToString(cards);
}

LayoutEngine.prototype.outputPageData = function (name) {
  var data = {
    cardData: this.getCardListData(),
    options: this.options
  }
  return data;
}

LayoutEngine.prototype.loadPageData = function (url, key, callback) {
  var _self = this;
  WebAdapter.loadCardData(url, key, function (data) {
    _self.removeCardItems();
    _self.transferData(data.cardData);
    _self.options = data.options;
    _self.initLayout(_self.container, data.options);
    if (typeof (callback) === "function") {
      callback(data);
    }
  })
}

LayoutEngine.prototype.getViewString = function (name) {
  var data = this.outputPageData(name);
  var str = WebTool.objectToString(data);
  var jKey = WebAdapter.getDataAccessKey(name);
  return jKey + "(" + str + ")";
}

LayoutEngine.prototype.getPageParams = function (name) {
  var params = this.getLayoutParams(name);
  params.cardData = this.getCardListString();
  return params;
}

LayoutEngine.prototype.previewPage = function (name, callback) {
  var data = this.outputPageData(name);
  data.type = "page";
  var str = WebTool.objectToString(data);
  $("._layoutTableArea iframe")[0].contentWindow.postMessage(str, "*");
  $(".layoutTableArea").hide();
  $("._layoutTableArea").show();
}

LayoutEngine.prototype.generatePage = function (name) {
  var _self = this;
  $.get("template.html", function (data) {
    var params = _self.getLayoutParams(name);
    params.cardData = _self.getCardListString();
    var pageString = data.bindData(params);
    $.post("../saveHtml", {
      name: name,
      page: pageString
    }, function (data) {
      console.log(data);
      window.open(data.path);
    })
  }, "text");
}

LayoutEngine.prototype.savePageData = function (name, callback) {
  var dataString = this.getViewString(name);
  $.post("../saveData", {
    name: name,
    data: dataString
  }, function (data) {
    console.log(data);
    if (typeof (callback) === "function") {
      callback(data);
    }
  })
}

LayoutEngine.prototype.getOverlapCells = function (carItem) {
  // var offsetX = cardItem.data.target
  var pos = carItem.data.pos;
  var size = carItem.data.size;
  var cells = [];
  for (var i = 0; i < size[0]; i++) {
    for (var j = 0; j < size[1]; j++) {
      var cell = this.table.rows[j + pos[1]].cells[i + pos[0]];
      cells.push(cell);
    }
  }
  return cells;
}
LayoutEngine.prototype.flagOverlapCells = function (className, index, flag) {
  var items = this.getOverlapCells(this.cardEngine.cardItems[className][index]);
  for (var i in items) {
    items[i].setAttribute("flag", flag);
  }
}

function CardEngine(path, layout) {
  this.path = path;
  this.cardItems = {};
  this.layout = layout;
  this.current = {};
  this.state = {};
  this.group = {};
}

CardEngine.prototype.addCardItem = function (container, data, renderType, unit, mode, callback) {
  this.cardItems[data.className] = this.cardItems[data.className] || [];
  var options = {
    renderType: renderType,
    mode: mode,
    unit: unit
  }

  var _self = this;
  var task = webCpu.transferCardData(container, data, options, function (container, data, task) {
    var className = data.className || "TemplateItem";
    task.body.setAttribute("index", _self.cardItems[className].length);
    task.body.setAttribute("className", className);
    if (task.mode === "edit") {
      _self.initEvent(task);
    }
    //task.data.task.cardBody = task.body;
    _self.cardItems[className].push(task);
    if (typeof (task.callback) === "function") {
      task.callback(container, data, task);
    }
  });
  task.callback = callback;
  webCpu.render("CardItem", task, this.path);
}

CardEngine.prototype.initEvent = function (cardItem) {
  var _self = this;
  $(document.body).on("click", function () {
    if (_self.current.item) {
      _self.placeCardItem();
      _self.dismissSelected();
    }
  });

  $(cardItem.body).find(".CardItem_eventArea").on("click", function () {
    var tNode = this.parentNode.parentNode;
    if (!_self.current.item || _self.current.item.body !== tNode) {
      var name = tNode.getAttribute("className");
      var index = tNode.getAttribute("index");
      $(_self.layout.table).find(".CardItem[state=selected]").attr("state", "");
      _self.selectCardItem(name, index);
    } else {
      _self.placeCardItem();
      _self.dismissSelected();
    }
    return false;
  });

  $(cardItem.body).find(".CardItem_eventArea").on("mousedown", function (e) {
    var tNode = this.parentNode.parentNode;
    if (_self.current.item && _self.current.item.body === tNode) {
      _self.current.mouseDown = true;
      _self.current.pos = [
        e.clientX,
        e.clientY
      ];
      if ($(e.target).hasClass("CardItem_adjust")) {
        _self.current.flag = $(e.target).attr("type");
      } else {
        _self.current.flag = "move";
      }
    }
  });

  $(document.body).on("mouseup", function () {
    _self.current.mouseDown = false;
    _self.placeCardItem();
    // _self.dismissSelected();
  });


  $(document.body).on("mousemove", function (e) {
    if (_self.current.mouseDown && _self.current.item) {
      var cardItem = _self.current.item;
      var pos = [e.clientX, e.clientY];
      if (_self.current.flag === "move") {
        _self.changePosition(cardItem, pos);
      } else {
        _self.changeSize(cardItem, _self.current.flag, pos);
      }
    }
  });
}

CardEngine.prototype.checkPosition = function (cardItem, margin) {
  var ret = true;
  var pos = cardItem.data.pos;
  var size = cardItem.data.size;
  var mPos = [this.layout.size[0], this.layout.size[1]];
  var unit = this.layout.unit;
  var minLeft = -pos[0] * unit[0];
  var maxLeft = (mPos[0] - pos[0] - size[0]) * unit[0];
  var minTop = -pos[1] * unit[1];
  var maxTop = (mPos[1] - pos[1] - size[1]) * unit[1];
  if (margin.marginLeft < minLeft || margin.marginLeft > maxLeft) {
    margin.marginLeft = Math.min(margin.marginLeft, maxLeft);
    margin.marginLeft = Math.max(margin.marginLeft, minLeft);
  }
  if (margin.marginTop < minTop || margin.marginTop > maxTop) {
    margin.marginTop = Math.min(margin.marginTop, maxTop);
    margin.marginTop = Math.max(margin.marginTop, minTop);
  }
  return ret;
}

CardEngine.prototype.changePosition = function (cardItem, pos) {
  var t = cardItem.body.parentNode.getBoundingClientRect();
  var target = {
    marginLeft: pos[0] - this.current.pos[0],
    marginTop: pos[1] - this.current.pos[1]
  }
  if (this.checkPosition(cardItem, target)) {
    $(cardItem.body).css("margin-left", target.marginLeft);
    $(cardItem.body).css("margin-top", target.marginTop);
    cardItem.data.target = target;
  }
}

CardEngine.prototype.changeSize = function (cardItem, direction, pos) {
  var t = $(cardItem.body).find(".CardItem_eventArea");
  var mWidth = Math.ceil(60 / this.layout.unit[0]) * this.layout.unit[0];
  var mHeight = Math.ceil(60 / this.layout.unit[1]) * this.layout.unit[1];
  var rect = t[0].getBoundingClientRect();
  if (direction === "top") {
    var s = pos[1] - rect.top;
    s = t.height() - Math.max(t.height() - s, mHeight)
    t.css("height", t.height() - s);
    var marginTop = Number(t.css("margin-top").replace("px", ""));
    t.css("margin-top", marginTop + s);
  } else if (direction === "bottom") {
    var s = pos[1] - rect.bottom;
    s = Math.max(t.height() + s, mHeight) - t.height()
    t.css("height", t.height() + s);
  } else if (direction === "left") {
    var s = pos[0] - rect.left;
    s = t.width() - Math.max(t.width() - s, mWidth);
    t.css("width", t.width() - s);
    var marginLeft = Number(t.css("margin-left").replace("px", ""));
    t.css("margin-left", marginLeft + s);
  } else if (direction === "right") {
    var s = pos[0] - rect.right;
    s = Math.max(t.width() + s, mWidth) - t.width();
    t.css("width", t.width() + s);
  } else {}
}

CardEngine.prototype.selectCardItem = function (className, index) {
  this.current = {
    item: this.cardItems[className][index],
    state: "selected"
  }
  this.current.item.body.setAttribute("state", this.current.state);
  return this.current;
}

CardEngine.prototype.dismissSelected = function () {
  if (this.current && this.current.item) {
    this.current.item.body.setAttribute("state", "");
    this.current = {};
  }
}

CardEngine.prototype.placeCardItem = function () {
  if (this.current.item) {
    var target = this.current.item.data.target;
    if (target && (target.marginLeft || target.marginTop)) {
      var offsetX = Math.floor(target.marginLeft / this.layout.unit[0]);
      var offsetY = Math.floor(target.marginTop / this.layout.unit[1]);
      var pos = this.current.item.data.pos;
      var pos1 = [pos[0] + offsetX, pos[1] + offsetY];
      var ret = this.transferCardItem(pos, pos1);
      if (ret) {
        this.current.item.data.pos = pos1;
      }
      this.current.item.data.target = {
        marginLeft: 0,
        marginTop: 0
      };
      $(this.current.item.body).css("marginLeft", 0);
      $(this.current.item.body).css("marginTop", 0);

    }
    var t = $(this.current.item.body).find(".CardItem_eventArea");
    var rect1 = t[0].getBoundingClientRect();
    var rect2 = this.current.item.body.getBoundingClientRect();
    var offsetX = Math.floor((rect1.left - rect2.left) / this.layout.unit[0]);
    var offsetY = Math.floor((rect1.top - rect2.top) / this.layout.unit[1]);
    var pos = this.current.item.data.pos;
    var pos1 = [pos[0] + offsetX, pos[1] + offsetY];
    var ret = this.transferCardItem(pos, pos1);
    var w = Math.ceil(rect1.width / this.layout.unit[0]);
    var h = Math.ceil(rect1.height / this.layout.unit[1]);
    t.css("marginLeft", 0);
    t.css("marginTop", 0);
    // if (ret && w !== this.current.item.data.size[0] || h !== this.current.item.data.size[1]) {
    //   this.current.item.data.pos = pos1;
    //   this.current.item.data.size = [w, h];
    // }
    this.current.item.data.pos = pos1;
    this.current.item.data.size = [w, h];
    this.freshCardItem(this.current.item);
  }
}

CardEngine.prototype.freshCardItem = function (item) {
  var w = item.data.size[0];
  var h = item.data.size[1];
  var tWidth = w * this.layout.unit[0];
  var tHeight = h * this.layout.unit[1];
  if (webCpu.cards.transweb.task.current !== "preview") {
    tWidth -= 2;
    tHeight -= 2;
  }
  $(item.body).width(tWidth);
  $(item.body).height(tHeight);
  var t = $(item.body).find(".CardItem_eventArea");
  t.width(tWidth);
  t.height(tHeight);
  webCpu["CardItem"].fresh(item.data);
}

CardEngine.prototype.checkPos = function (cardItem, pos) {
  var ret = true;
  if (!this.layout.table.rows[pos[1]] || !this.layout.table.rows[pos[1]].cells[pos[0]]) {
    ret = false;
  }

  if (pos[1] - this.layout.table.rows.length > 0 || pos[0] - this.layout.table.rows[0].cells.length > 0) {
    ret = false;
  }
  return ret;
}

CardEngine.prototype.transferCardItem = function (pos1, pos2) {
  if (this.checkPos(this.current.item, pos2)) {
    var e1 = this.layout.table.rows[pos1[1]].cells[pos1[0]].getElementsByClassName("TableLayout_container")[0];
    var e2 = this.layout.table.rows[pos2[1]].cells[pos2[0]].getElementsByClassName("TableLayout_container")[0];
    e1.removeChild(this.current.item.body);
    e2.appendChild(this.current.item.body);
    this.current.item.container = e2;
    return true;
  } else {
    return false;
  }
}

CardEngine.prototype.removeCard = function (className, index) {
  if (this.cardItems[className] && this.cardItems[className].length > index) {
    var body = this.cardItems[className][index].body;
    var gName = body.getAttribute("groupName");
    this.cardItems[className].splice(index, 1);
    this.updateCardIndex(className);
    body.parentNode.removeChild(body);
  }
}

CardEngine.prototype.updateCardIndex = function (className) {
  for (var i in this.cardItems[className]) {
    this.cardItems[className][i].body.setAttribute("index", i);
  }
}
