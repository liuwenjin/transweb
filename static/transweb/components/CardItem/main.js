(function () {
  var config = {
    html: "layout.html",
    css: "style.css"
  }
  webCpu.regComponent("CardItem", config, function (container, data, task) {
    if (!data.title) {
      $(container).find(".CardItem_titleArea").hide();
      $(container).find(".__CardItem_componentArea").css("top", "0px");
    }
    if (data.border && (webCpu.cards && webCpu.cards.transweb && webCpu.cards.transweb.task.current === "preview")) {
      $(container).css("border", data.border);
    }
    if (data.padding && (webCpu.cards && webCpu.cards.transweb && webCpu.cards.transweb.task.current === "preview")) {
      $(container).children(".CardItem_contentArea").css("padding", data.padding);
    }
    if (data.background) {
      $(container).children(".CardItem_contentArea").css("background", data.background);
    }

    if (data.position) {
      $(container).css("position", data.position);
    }

    if (data.overflow) {
      $(container).children(".CardItem_contentArea").children(".CardItem_content").children(".__CardItem_componentArea").children(".CardItem_componentArea").css("overflow", data.overflow);
    }

    if (!task.unit || ($(container.parentNode).attr("flag") === "activeArea")) {
      $(container).css("width", "100%");
      $(container).css("height", "100%");
    } else {
      if (!data.size) {
        data.size = [Math.ceil(webCpu.layout.options.width / 3), Math.ceil(webCpu.layout.options.height / 3)];
      }

      var tWidth = data.size[0] * task.unit[0];
      var tHeight = data.size[1] * task.unit[1];
      if (webCpu.cards.transweb.task.current !== "preview") {
        tWidth -= 2;
        tHeight -= 2;
      }
      $(container).css("width", tWidth);
      $(container).css("height", tHeight);
      if (data.target) {
        for (var k in data.target) {
          if (data.target[k] === "center" && (k === "left" || k === "right")) {
            data.target[k] = $(container.parentNode).width() / 2 - $(container).width() / 2;
          }
          if (data.target[k] === "center" && (k === "top" || k === "bottom")) {
            data.target[k] = $(container.parentNode).height() / 2 - $(container).height() / 2;
          }
          if (k === "left" || k === "marginLeft") {
            $(container).css(k, data.target[k] * task.unit[0]);
          }

          if (k === "top" || k === "marginTop") {
            $(container).css(k, data.target[k] * task.unit[1]);
          }
        }
      }
    }
    data.task = data.task || {};
    data.className = data.className || "TemplateItem";
    $(container).find(".CardItem_componentArea").attr("mouldName", data.className);
    data.task.container = $(container).find(".CardItem_componentArea")[0];
    data.task.cardName = data.cardName || "anonymous";
    if (data.task.busIn && data.cardName) {
      webCpu.CardItem.message = webCpu.CardItem.message || {};
      webCpu.CardItem.message[data.cardName] = webCpu.CardItem.message[data.cardName] || {}
    }


    data.task.cardBody = container;

    webCpu.CardItem.fresh(data);

    if (data.style) {
      $(container).css(data.style);
    }


    if (data.cardName) {
      $(container).attr("cardName", data.cardName);
    }

    data.task.mask = $(container).children(".CardItem_contentArea").children(".CardItem_mask")[0];
    if (task.mode === "edit") {
      $(container).find(".CardItem_modifyArea").show();
      $(data.task.mask).hide();
    } else if (task.mode === "freeze") {
      $(container).find(".CardItem_modifyArea").hide();
      $(data.task.mask).show();
    } else {}
  });

  webCpu.CardItem.message = {};
  webCpu.CardItem.tips = {
    empty: "暂无数据",
    loading: "正在加载",
    error: "出现异常"
  }

  webCpu.CardItem.switchMask = function (data, state, n) {
    webCpu.CardItem.switchMaskStyle(data, {
      width: "100%",
      height: "100%",
      top: "0px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    });
    webCpu.CardItem._switchMask(data, state, n);
  }
  webCpu.CardItem._switchMask = function (data, state, n) {
    var task = data.task || data;
    if (!task.cardBody) {
      return false;
    }
    var t = $(task.cardBody).children(".CardItem_stateTemplate");
    var c = ".CardItem_template_" + state;
    var tips = this.tips[state];
    if (data.tips && data.tips[state]) {
      tips = data.tips[state];
    }
    var str = t.find(c).val();
    var mask = $(task.mask);

    mask.html(str);

    mask.find(".CardItem_stateTips").html(tips);
    if (typeof (n) === "number") {
      setTimeout(function () {
        mask.hide();
      }, n * 1000);
    } else if (typeof (n) === "object" && n.task) {
      n.container = mask[0];
      webCpu.render(n.className || "TemplateItem", n.task);
    } else if (typeof (n) === "object" && !n.task) {
      if (n.type === "message") {
        mask.find(".btn-default").hide();
      }
      if (n.rightBtnName) {
        mask.find(".btn-default").html(n.rightBtnName);
      }
      if (n.leftBtnName) {
        mask.find(".btn-primary").html(n.leftBtnName);
      }
      if (n.message) {
        if (state !== "loading") {
          mask.html(n.message);
        } else {
          mask.children().children(".CardItem_stateTips").html(n.message);
        }

      }
    } else if (n !== undefined) {
      if (state !== "loading") {
        mask.html(n);
      } else {
        mask.children().children(".CardItem_stateTips").html(n);
      }
    } else {}
    mask.show();
    return mask[0];
  }

  webCpu.CardItem.switchMaskStyle = function (data, style) {
    var task = data.task || data;
    if (task.cardBody) {
      var mask = $(task.mask);
      for (var k in style) {
        mask.css(k, style[k]);
      }
    }
  }

  webCpu.CardItem.setForbidArea = function (data, tips, style) {
    webCpu.CardItem.switchMaskStyle(data, style);
    webCpu.CardItem._switchMask(data, "html", "");
    var task = data.task || data;
    if (task.cardBody) {
      var mask = $(task.mask);
      mask.attr("title", tips);
    }
  }

  webCpu.CardItem.cancelForbidArea = function (data) {
    if (!data) {
      return false;
    }
    webCpu.CardItem.dismissMask(data);
    var task = data.task || data;
    if (task.cardBody) {
      var mask = $(task.mask);
      mask.attr("title", "");
    }
  }

  webCpu.CardItem.dismissMask = function (data) {
    if (!data) {
      return false;
    }
    var task = data.task || data;
    if (task.cardBody) {
      var tipsArea = $(task.mask);
      tipsArea.hide();
    }
  }

  webCpu.CardItem.checkData = function (data) {
    var ret = true;
    if (!data) {
      ret = false;
    } else if (data.constructor.name === "Array" && data.length === 0) {
      ret = false;
    } else if (data.data && data.data.length === 0) {
      ret = false;
    } else if (data.records && data.records.length === 0) {
      ret = false;
    } else {}
    return ret;
  }


  webCpu.CardItem.switchState = function (data, state) {
    if (!data) {
      return false;
    }
    var t = data.task || data;
    if (!t.container) {
      return false;
    }
    var elem = $(t.cardBody).parent().parent().parent().find(".CardItem_stateTemplate");
    var c = ".CardItem_template_" + state;
    var tips = this.tips[state];
    if (data.tips && data.tips[state]) {
      tips = data.tips[state];
    }
    var str = elem.find(c).val();
    var tipsArea = $(t.container);
    tipsArea.html(str);
    tipsArea.find(".CardItem_stateTips").html(tips);
  }


  //check the card can be executed.
  function checkCardItem(cardData) {
    var ret = true;
    for (var k in cardData.task.busIn) {
      if (cardData.task.busIn[k]) {
        ret = webCpu.CardItem.message[cardData.cardName][k];
      }
    }
    return ret;
  }

  webCpu.CardItem.leftCardDialog = function (card, objectCard, title, w, style, callback1, callback2) {
    var task = card.task || card;
    var w = w || 200;
    if (!task.cardBody) {
      return false;
    }
    var tParam = callback1;
    if (typeof (tParam) === "function") {
      tParam = {
        callback: callback1
      }
    }

    var maskSelector = $(task.mask);
    var htmlString = "<div class='cardDialogArea' style='position: relative; width: 100%; height: 100%;'>\
                        <div style='float: left; position:relative; height: 100%; overflow:auto; top: 0px; bottom:0px;' class='maskContentArea'></div>\
                        <div class='dialogBlankArea' style='float; left; position:relative; height: 100%; top: 0px; bottom: 0px; margin-left:0px; margin-right: 0px;'></div>\
                      </div>";
    maskSelector.html(htmlString);
    style = style || {
      "float": "left",
      "width": w
    };
    style.position = "relative";
    style.float = style.float || "right";
    style.width = style.width || w;
    var _self = this;
    var cSelector = maskSelector.find(".maskContentArea");
    for (var k in style) {
      cSelector.css(k, style[k]);
    }
    maskSelector.find(".dialogBlankArea").css("width", "calc( 100% - " + w + "px )");

    maskSelector.show();
    maskSelector.find(".dialogBlankArea").on("click", function () {
      _self.dismissMask(card);
      if (typeof (tParam.closeCallback) === "function") {
        tParam.closeCallback();
      }
    });
    if (objectCard) {

      var mArea = cSelector[0];
      webCpu.addCardItem(mArea, objectCard, function (c0, d0, c0) {
        if (typeof (callback1) === "function") {
          tParam.callback(c0, d0, c0);
        }
        d0.title = objectCard.title || title;
        d0.titleHeight = 40;
      }, function (c, d, t) {
        if (typeof (callback2) === "function") {
          callback2(c, d, t);
        }
        var tSlector = $(d.task.titleArea);
        tSlector.css("padding-top", "8px");
        tSlector.on("click", function () {
          _self.dismissMask(card);
        });
      });

    }
  }

  webCpu.CardItem.updateConfig = function (data, interface) {
    var config = interface;
    if (typeof (interface) === "string" && webCpu.interface && webCpu.interface[interface]) {
      config = webCpu.interface[interface];
    }
    this._updateConfig(data, config);
  }

  webCpu.CardItem._updateConfig = function (data, config, params) {
    var t = data.task || data;
    if (config && config.data && !config.url) {
      t.url = "";
    }
    //update the render task params
    params = params || ["url", "data", "requestType", "dataType", "query", "option", "dsl"];
    for (var k in config) {
      if (params.indexOf(k) !== -1) {
        if (k === "option") {
          t.option = t.option || {};
          for (var j in config.option) {
            t.option[j] = config.option[j];
          }
        } else {
          t[k] = config[k];
        }
      }
    }
  }


  webCpu.CardItem.maskDialog = function (card, objectCard, title, option, style) {
    var pCardName = card.cardName;
    // var task = card.task || card;
    var maskCard = {
      cardName: "transwebMaskCard",
      task: {
        option: option,
        promise: {
          afterRender: function (mc, md, mt) {
            webCpu.addCardItem(mc, objectCard, {
              key: mt.option.key || mt.option || "transweb",
              interface: option.interface,
              callback: function (c, d, t) {
                if (typeof (option.callback) === "function") {
                  option.callback(c, d, t);
                }
                card.maskDialogCard = d;
                var storage = window.localStorage;
                if (webCpu.cards.transwebCms && webCpu.cards.transwebCms.task.logined) {
                  storage.transwebLogined = webCpu.cards.transwebCms.task.logined;
                }
                if (d.cardName === "transwebSignIn" || d.cardName === "transwebCms") {
                  return false;
                }

                if (d.cardName === "transwebArticleViewer" && pCardName === "transwebView") {
                  storage.transwebType = "markdown";
                  storage.transwebData = d.task.data;
                } else if (d.cardName !== "output" && pCardName === "transwebView") {
                  storage.transwebType = "js";
                  storage.transwebData = WebTool.objectToString(d);
                } else {

                }

              }
            }, function (c1, d1, t1) {
              d1.task.maskCard = maskCard;
            });
          }
        }
      }
    }
    this._maskDialog(card, maskCard, title, style);
  }

  webCpu.CardItem._maskDialog = function (card, objectCard, title, style) {
    var h = h || 40;
    var htmlString = "<div class='dialogContent' style='position: relative;  width: 100%; height: 100%; display: inline-block;'>\
                        <div style='position:relative; display: inline-block;  background-color: #fff; overflow:auto; width: 100%; height:" + h + "px; text-align: center;'>\
                          <span style='position: absolute; left: 0px; top: 50%; margin-top: -11px; display: inline-block; width: 50px; padding: 2px; vertical-align: middle; text-align: center; cursor: pointer;' class='glyphicon glyphicon-chevron-left'></span>\
                          <span style='position: absolute; left: 60px; top: 50%; margin-top: -11px; width: calc( 100% - 120px ); display: inline-block; padding: 2px; vertical-align: middle; text-align: center; '>" + title + "</span>\
                        </div>\
                        <div style='float: left; position:absolute; overflow:auto; width: 100%; top: " + h + "px; bottom:0px;' class='tipsStringArea'></div>\
                      </div>";
    var task = card.task || card;
    if (!task.cardBody) {
      return false;
    }
    var maskSelector = $(task.mask);
    maskSelector.html(htmlString);

    if (style) {
      maskSelector.find(".dialogContent").css(style);
    }

    var supports = ["js", "txt", "md"];

    maskSelector.show();

    var _self = this;
    maskSelector.find(".glyphicon-chevron-left").on("click", function () {
      _self.dismissMask(card);
    });
    if (objectCard) {
      var mArea = maskSelector.find(".tipsStringArea")[0];
      card.maskDialogCard = objectCard;
      if (typeof (objectCard) === "string") {
        var sub = getSubfix(objectCard);
        if (supports.indexOf(sub) === -1 && webCpu.cards.previewTool) {
          var _objectCard = WebTool.copyObject(webCpu.cards.previewTool);
          _objectCard.task.option.url = objectCard;
          objectCard = _objectCard;
        }
      }
      webCpu.addCardItem(mArea, objectCard, null, function (c, d, t) {
        card.maskDialogCard = d;
      });
    }
  }
  webCpu.CardItem.previewCard = function (container, card, size) {
    if (!webCpu.cards.previewTool) {
      return false;
    }
    webCpu.cards.previewTool.task.size = size;
    webCpu.cards.previewTool.task.card = card;
    webCpu.addCardItem(container, webCpu.cards.previewTool);
  }


  webCpu.CardItem.fresh = function (data, interface) {
    webCpu.CardItem.updateCardLayout(data);
    if (!data.inactive || $("#tModalDialog").attr("state") === "previewCardItem") {
      webCpu.CardItem._fresh(data, interface);
    } else if (data.sketch) {
      $(data.task.container).html('<div class="CardItem_sketch"><img src="#" /></div>');
      $(data.task.container).find(".CardItem_sketch>img").attr("src", data.sketch);
      $(data.task.container).find(".CardItem_sketch>img").attr("alt", data.title || data.cardName);
    } else {}
  }

  webCpu.CardItem._fresh = function (data, interface) {
    var t = data.task || data;

    webCpu.CardItem.updateConfig(data, interface);

    webCpu.CardItem.switchState(t, "loading");

    if (checkCardItem(data) || !flag) {
      for (var k in t.busIn) {
        var msg = webCpu.CardItem.message[data.cardName][k];
        t.outerData = t.outerData || {};
        for (var m in msg) {
          t.outerData[m] = msg[m];
        }
      }

      webCpu.render(data.className || "TemplateItem", t, data.componentPath || this.config.path);
    }
  }


  webCpu.CardItem.updateMenuItems = function (elem, data) {
    for (var i = 0; i < data.length; i++) {
      var menuItem = data[i];
      var value = menuItem.text || menuItem;
      if (menuItem.data) {
        value = value.bindData(menuItem.data);
      }
      var item = $('<div style="float: left; height: 100%; width: ' + 100 / data.length + '%; display: flex; flex-wrap: wrap; justify-content:center; align-items:center;">' + value + '</div>')
      item.appendTo($(elem));
      if (typeof (menuItem.action) === "function") {
        item.on("click", menuItem.action);
      }
    }
  }

  webCpu.CardItem.createMenuItem = function (menu, type) {
    var nav = $('<ul class="nav navbar-nav" style="margin: 0px;"></ul>');
    for (let k in menu) {
      var name = menu[k].name || menu[k];
      var item = $('<li index=' + k + ' key="' + menu[k].key + '"  ><a index=' + k + ' path="' + menu[k].path + '" href="#">' + name + '</a></li>');
      if (!menu[k].path) {
        item = $('<li index=' + k + '  key="' + menu[k].key + '"  ><a index=' + k + ' href="#">' + name + '</a></li>');
      }
      if (menu[k].children) {
        item = $('<li index=' + k + ' index=' + k + ' key="' + menu[k].key + '"  class="dropdown"><a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button" \
                            aria-haspopup="true" aria-expanded="false">' + name + '<span class="caret"></span> </a> \
                            <ul class="dropdown-menu ' + (type || "dropdown-menu-left") + '"></ul> \
                        </li>');
        var tList = item.children(".dropdown-menu")
        for (let i in menu[k].children) {
          var tItem = menu[k].children[i];
          var mItem = $('<li value="' + tItem.value + '" title="' + tItem.name + '" ><a index="' + i + '" path="' + tItem.path + '" href="#">' + tItem.name + '</a></li>');
          if (!tItem.path) {
            mItem = $('<li value="' + tItem.value + '" title="' + tItem.name + '" ><a index="' + i + '" href="#">' + tItem.name + '</a></li>');
          }
          mItem.appendTo(tList);
        }
        tList.appendTo(item);
      }
      item.appendTo(nav);
    }
    return nav;
  }

  webCpu.CardItem.updateCardLayout = function (data) {
    var container = data.task.container.parentNode.parentNode;
    if (!data.title && !data.titleMenu && !data.titleMenu && !data.titleData && !data.breadcrumb && !data.dialogData) {
      $(container).children(".CardItem_titleArea").hide();
      $(container).children(".__CardItem_componentArea").css("padding-top", "0px");
    } else {
      if (typeof (data.titleHeight) === "number" || typeof (data.titleHeight) === "string") {
        var h = data.titleHeight;
      } else {
        h = 40;
      }

      $(container).children(".__CardItem_componentArea").css("padding-top", h);
      $(container).children(".CardItem_titleArea").css("height", h);
      $(container).children(".CardItem_titleArea").show();
      var titleSelector = $(container).children(".CardItem_titleArea").children(".CardItem_title");
      data.task.titleArea = titleSelector[0];
      if (data.titleMenu && data.titleMenu.constructor.name === "Array") {
        titleSelector.html("");
        webCpu.CardItem.updateMenuItems(data.task.titleArea, data.titleMenu);

      } else if (data.titleData) {
        titleSelector.html("");
        if (data.titleData.title) {
          var t = $('<div class="navbar-header"><a class="navbar-brand" href="#">' + data.titleData.title + '</a></div>');
          t.appendTo(titleSelector)
        }
        if (data.titleData.menu || data.titleData.leftMenu) {
          var lMenu = data.titleData.menu || data.titleData.leftMenu;
          var nav = webCpu.CardItem.createMenuItem(lMenu);
          var clickCallback = function (e, mData) {
            var elem = e.target;
            var path = $(elem).attr("path");
            if (!path) {
              path = $(elem.parentNode).attr("path");
            }
            if (path && webCpu.cards && webCpu.cards.main) {
              webCpu.cards.main.task.switchModule(path);
            } else {
              var index = $(elem).attr("index");
              var pIndex = -1;
              var pSelector = $(elem).parent().parent();
              if (pSelector.hasClass("dropdown-menu")) {
                pIndex = pSelector.parent().attr("index");
              }
              var tItem = lMenu[index];
              var rItem = lMenu[index];
              if (pIndex !== -1) {
                tItem = lMenu[pIndex].children[index];
                rItem = lMenu[pIndex];
              }
              if (tItem && typeof (tItem.callback) === "function") {
                tItem.callback(rItem);
              }
            }
          }
          nav.appendTo(titleSelector);
          nav.find("li>a").on("click", function (e) {
            clickCallback(e, lMenu);
          });
        }
        if (data.titleData.rightMenu) {
          var rMenu = data.titleData.rightMenu;
          var nav = webCpu.CardItem.createMenuItem(rMenu, "dropdown-menu-right");
          nav.appendTo(titleSelector);
          nav.find("li>a").on("click", function (e) {
            var elem = e.target;
            var index = $(elem).attr("index");
            var pIndex = -1;
            var pSelector = $(elem).parent().parent();
            if (pSelector.hasClass("dropdown-menu")) {
              pIndex = pSelector.parent().attr("index");
            }
            var tItem = rMenu[index];
            var rItem = rMenu[index];
            if (pIndex !== -1) {
              tItem = rMenu[pIndex].children[index];
              rItem = rMenu[pIndex];
            }
            if (tItem && typeof (tItem.callback) === "function") {
              tItem.callback(rItem);
            }
          });
          nav.css({
            position: "absolute",
            right: "0px"
          });
        }
        if (data.titleData.style) {
          titleSelector.css(data.titleData.style);
        }

      } else if (data.breadcrumb) {
        titleSelector.html("");
        var bSelector = $('<ol class="breadcrumb" style="background: none; padding-left: 0px; margin: 0px;"></ol>');
        for (var k = 0; k < data.breadcrumb.length; k++) {
          var text = data.breadcrumb[k].text || data.breadcrumb[k];
          var item = $('<li>' + text + '</li>');
          if (data.breadcrumb[k].href) {
            var target = data.breadcrumb[k].target || "_blank";
            item = $('<li><a target="' + target + '" href="' + data.breadcrumb[k].href + '">' + text + '</a></li>')
          }
          item.appendTo(bSelector);
          if (data.breadcrumbStyle) {
            item.css(data.breadcrumbStyle);
          }
        }
        bSelector.appendTo(titleSelector);
      } else if (data.dialogData) {
        var temp = ("<div style='width: 100%; height: 100%; position: relative;'>\
                              <div class='leftEmptyArea' style='cursor: pointer; display: flex; height: 100%; width: 50px; align-items: center; justify-content: flex-end;'></div>\
                              <div class='titleInfoArea' style='height: 100%;  width: calc( 100% - 100px ); display: flex; align-items: center; justify-content: center;'></div>\
                              <div class='rightEmptyArea' style='cursor: pointer; height: 100%; right: 0px; top: 0px; display: flex; position: absolute;  width: 40px; align-items: center; justify-content: flex-end;'></div></div>");
        if (data.dialogData.titlePosition && data.dialogData.titlePosition === "left") {
          temp = ("<div style='width: 100%; height: 100%; position: relative;'>\
          <div class='titleInfoArea'  style='height: 100%;  width: calc( 100% - 60px ); display: flex; align-items: center; justify-content: flex-start;'></div>\
          <div class='rightEmptyArea' style='cursor: pointer; height: 100%; right: 0px;  top: 0px; display: flex; position: absolute;  width: 40px; align-items: center; justify-content: flex-end;'></div></div>");
        }
        titleSelector.html(temp);
        titleSelector.find(".titleInfoArea").html(data.dialogData.title);
        data.dialogData.closeType = data.dialogData.closeType || "";

        var leftSelector = titleSelector.find(".leftEmptyArea");
        var rightSelector = titleSelector.find(".rightEmptyArea");
        rightSelector.css({
          "float": "right",
          "justify-content": "center"
        });
        leftSelector.css({
          float: "left",
          "justify-content": "center"
        });
        var closeSelector = leftSelector;
        var menuSelector = rightSelector;
        if (data.dialogData.closeType === "left") {
          closeSelector.html("<i style='margin-left: 5px;' class='maskCloseBtn glyphicon glyphicon-remove' />");
        } else if (data.dialogData.closeType === "right") {
          closeSelector = rightSelector;
          menuSelector = leftSelector;
          closeSelector.html("<i style='margin-right: 5px;' class='maskCloseBtn glyphicon glyphicon-remove' />");
        } else if (data.dialogData.closeType === "back") {
          closeSelector.html("<i style='margin-left: 5px;' class='maskCloseBtn glyphicon glyphicon-chevron-left' />");
        } else {
          closeSelector = rightSelector;
          menuSelector = leftSelector;
          closeSelector.html("<i style='margin-right: 5px;' class='maskCloseBtn glyphicon glyphicon-remove' />");
        }

        if (data.dialogData.menu) {
          webCpu.CardItem.updateMenuItems(menuSelector[0], data.dialogData.menu);
        }

        closeSelector.on("click", function () {
          if (data.dialogData.parentCard) {
            if (typeof (data.dialogData.closeCallback) === "function") {
              data.dialogData.closeCallback()
            }
            webCpu.CardItem.dismissMask(data.dialogData.parentCard);
            // delete data.dialogData.parentCard;
          }

        });

      } else {}

      if (data.titleStyle) {
        titleSelector.css(data.titleStyle);
      }
      titleSelector.parent().css("overflow", "visible")
    }

    if (!data.foot && !data.footMenu) {
      $(container).children(".CardItem_footArea").hide();
      $(container).children(".__CardItem_componentArea").css("padding-bottom", "0px");
    } else {
      var h = data.footHeight || 40;
      $(container).children(".CardItem_footArea").css("height", h);
      $(container).children(".__CardItem_componentArea").css("padding-bottom", h);
      data.task.footArea = $(container).children(".CardItem_footArea")[0];
      if (data.footMenu && data.footMenu.constructor.name === "Array") {
        $(container).children(".CardItem_footArea").html("");
        for (var i = 0; i < data.footMenu.length; i++) {
          var menuItem = data.footMenu[i];
          var value = menuItem.text || menuItem;
          if (menuItem.data) {
            value = value.bindData(menuItem.data);
          }
          var item = $('<div style="float: left; height: 100%; width: ' + 100 / data.footMenu.length + '%; display: flex; flex-wrap: wrap; justify-content:center; align-items:center;">' + value + '</div>')
          item.appendTo($(container).children(".CardItem_footArea"));
          if (typeof (menuItem.action) === "function") {
            item.on("click", menuItem.action);
          }
        }
      }

      $(container).children(".CardItem_footArea").show();
    }


    if (data.footStyle) {
      $(container).children(".CardItem_footArea").css(data.footStyle);
    }
  }

  webCpu.CardItem.configDialog = function (mCard, title, data, param, style) {
    param = param || {}
    if (typeof (param) === "function") {
      param = {
        callback: param
      }
    }
    if (data && data.constructor.name === "Array") {
      var editorCard = {
        className: "Editor",
        task: {
          option: data
        }
      }
    } else {
      var editorCard = data;
    }

    var str = "<div class='CardMask_configArea' style='float: left; position: relative; width: 100%; height: calc( 100% - 50px ); margin-top: 5px;'>**</div>\
               <div style='float: left; position: absolute; bottom: 10px; padding-right: 10px; text-align: right; margin-top: 10px; width: 100%;'>\
                <button style='margin-right: 10px;' class='btn btn-default btn-sm'>取消</button>\
                <button class='btn btn-primary btn-sm'>确认</button></div>"
    var _self = this;
    var ret = editorCard;
    webCpu.CardItem.htmlDialog(mCard, title, str, {
      callback: function (c) {
        var configArea = $(c).find(".CardMask_configArea")[0];
        webCpu.updateView(configArea, editorCard);
        $(c).find(".btn-primary").on("click", function () {
          if (typeof (param.callback) === "function") {
            param.callback();
          }
          _self.dismissMask(mCard);
        });
        $(c).find(".btn-default").on("click", function () {
          _self.dismissMask(mCard);
        });
      },
      closeCallback: param.closeCallback
    }, style);
    return ret;
  }

  webCpu.CardItem.confirmDialog = function (mCard, tips, param, style) {
    param = param || {}
    if (typeof (param) === "function") {
      param = {
        callback: param
      }
    }
    var str = "<div style='float: left; position: relative; width: 100%; margin-top: 10px;'>" + tips + "</div>\
               <div style='float: left; position: absolute; bottom: 10px; padding-right: 10px; text-align: right; margin-top: 10px; width: 100%;'>\
                <button style='margin-right: 10px;' class='btn btn-default btn-sm'>取消</button>\
                <button class='btn btn-primary btn-sm'>确认</button></div>"
    var _self = this;
    webCpu.CardItem.htmlDialog(mCard, "提示", str, {
      callback: function (c) {
        $(c).find(".btn-primary").on("click", function () {
          if (typeof (param.callback) === "function") {
            param.callback();
          }
          _self.dismissMask(mCard);
        });
        $(c).find(".btn-default").on("click", function () {
          _self.dismissMask(mCard);
        });
      },
      closeCallback: param.closeCallback
    }, style);
  }

  webCpu.CardItem.tipsDialog = function (mCard, tips, param, style) {
    param = param || {}
    var str = "<div style='float: left; position: relative; width: 100%; margin-top: 10px;'>" + tips + "</div>\
               <div style='float: left; position: absolute; bottom: 10px; padding-right: 10px; text-align: right; margin-top: 10px; width: 100%;'>\
               <button class='btn btn-primary btn-sm'>确认</button></div>"
    var _self = this;
    if (typeof (param) === "function") {
      param = {
        callback: param
      }
    }

    webCpu.CardItem.htmlDialog(mCard, "提示", str, {
      callback: function (c) {
        $(c).find(".btn-primary").on("click", function () {
          if (typeof (param.callback) === "function") {
            param.callback();
          }
          _self.dismissMask(mCard);
        });
      },
      closeCallback: param.closeCallback
    }, style);
  }

  webCpu.CardItem.htmlDialog = function (mCard, title, html, param, style) {
    style = style || {
      width: "300",
      height: "200",
      background: "rgba(200, 200, 200, 0.6)",
      "border-radius": "5px",
      padding: "10px"
    };
    param = param || {}
    if (typeof (param) === "function") {
      param = {
        callback: param
      }
    }

    var card = {
      task: {
        template: html,
        promise: {
          afterRender: function (c, d, t) {
            if (typeof (param.callback) === "function") {
              param.callback(c);
            }
          }
        }
      }
    }
    this.renderCardDialog(mCard, card, {
      title: title,
      closeType: "right",
      titlePosition: "left",
      closeCallback: param.closeCallback
    }, style);
  }


  webCpu.CardItem.renderCardDialog = function (mCard, option, params, style) {
    var task = mCard.task || mCard;
    this.switchMask(mCard, "html", "");
    params = params || {};
    if (params) {
      params.parentCard = mCard;
    }
    if (params.style) {
      $(task.mask).css(params.style);
    }
    webCpu.renderCard(task.mask, option, function (c, d, t) {
      var tempCard = {
        // titleStyle: {
        //   "box-shadow": "0px -1px 0px inset #fff"
        // },
        titleHeight: 50,
        dialogData: params,
        style: style,
        task: {
          data: d,
          promise: {
            afterRender: function (c1, d1, t1) {
              webCpu.addCardItem(c1, d1);
            }
          }
        }
      }
      t.data = tempCard;
      mCard.task.childCard = tempCard;
    });

  }

  webCpu.CardItem.moduleDialog = function (mCard, name, params) {
    var task = mCard.task || mCard;
    this.switchMask(mCard, "html", "");
    if (params) {
      params.parentCard = mCard;
    }
    webCpu.renderModule(task.mask, name, function (c, d, t) {
      var tempCard = {
        titleStyle: {
          "box-shadow": "0px -1px 0px inset #fff"
        },
        titleHeight: 50,
        dialogData: params,
        task: {
          data: d,
          promise: {
            afterRender: function (c1, d1, t1) {
              webCpu.addCardItem(c1, d1);
            }
          }
        }
      }
      t.data = tempCard;
      mCard.task.childCard = tempCard;
    });
  }

  webCpu.CardItem.dialog = function (data, options, closePromise) {
    var options = options || {};
    webCpu.render("ModalDialog", function () {
      var task = {
        data: data
      }

      if (typeof (closePromise) === "function") {
        task.promise = {
          closeDialog: closePromise
        }
      }

      var t = {
        container: data.task.container
      };
      $("#tModalDialog").attr("state", "previewCardItem");
      webCpu["ModalDialog"].displayComponent(options.title || "", "CardItem", task, options);
      task.data.task.container = t.container;
      task = null;
    });
  }

  webCpu.CardItem.updateByRemoteData = function (data, url, query) {
    if (url) {
      data.task.url = url;
    }
    data.inactive = false;
    data.task.container.innerHTML = "";
    data.task.query = query || data.task.query;
    webCpu.render(data.className || "TemplateItem", data.task, data.componentPath || this.config.path);
  }

})();