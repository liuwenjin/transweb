(function () {
  let config = {
    script: {
      script: "script.js"
    },
    css: {
      style: "style.css",
      bootstrap: "bootstrap/bootstrap.min.css",
      bootstrapIcons: "bootstrap/bootstrap-icons.css",
      animation: "animate.min.css",
      tailwind: "tailwind.css",
      jsMind: "jsmind.css"
    },
    html: `<div class="CardItem_contentArea">
    <div class="CardItem_content">
      <div class="CardItem_titleArea">
        <div class="CardItem_title">{{title}}</div>
      </div>
      <div class="__CardItem_componentArea">
        <div class="CardItem_componentArea"></div>
      </div>
      <div class="CardItem_footArea">
        {{foot}}
      </div>
    </div>
    <div class="CardItem_mask" style="text-align: center;"></div>
  </div>
  <div class="CardItem_loading" style="display: none">
    <div style="width: 100%; display: inline-block; text-align:center;">
      <div class="box">
        <div class="loader-16"></div>
        <span class="loadingTips" style="position: absolute; font-size: 12px; margin-top: 70px;">请稍后...</span>
      </div>
    </div>
  </div>
  <div class="CardItem_stateTemplate" style="display: none">
    <textarea name="CardItem_template_loading1" class="CardItem_template_loading">
      <div style="width: 100%; height: 100%; display: flex; justify-content:center; align-items:center;">
        <span class="CardItem_loadingTips CardItem_stateTips"></span>
      </div>
    </textarea>
    <textarea name="CardItem_template_error1" class="CardItem_template_error">
      <div style="color: #600; width: 100%; height: 100%; display: flex; justify-content:center; align-items:center;">
        <span class="CardItem_stateTips"></span>
      </div>
    </textarea>
    <textarea name="CardItem_template_empty1" class="CardItem_template_empty">
      <div style="width: 100%; height: 100%; display: flex; justify-content:center; align-items:center;">
        <span class="CardItem_stateTips"></span>
      </div>
    </textarea>
    <textarea name="CardItem_template_notice1" class="CardItem_template_notice">
      <div style="width: 100%; height: 100%; display: flex; justify-content:center; align-items:center;">
        <span class="CardItem_stateTips"></span>
      </div>
    </textarea>
    <textarea name="CardItem_template_html1" class="CardItem_template_html">
      <div style="width: 100%; height: 100%; display: flex; flex-wrap: wrap; justify-content:center; align-items:center;">
        <span class="CardItem_stateTips">HTML片段区域</span>
      </div>
    </textarea>
  </div>`
  }

  if (window.tailwind && window.tailwind.config) {
    delete config.css.tailwind;
  }

  webCpu.regComponent("CardItem", config, function (container, data, task) {
    // console.log("debuglog", task.template, task.url, container.parentNode);
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

    if (task.config) {
      task.adapter = webCpu.initAdapter(task.config);
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
    if (data.style) {
      $(container).css(data.style);
    }
    data.task = data.task || {};
    data.className = data.className || "TemplateItem";
    $(container).find(".CardItem_componentArea").attr("mouldName", data.className);
    data.task.container = $(container).find(".CardItem_componentArea")[0];
    data.task.cardName = data.cardName || "anonymous";

    data.task.cardBody = container;

    data.task.card = data;

    data.task.mask = $(container).children(".CardItem_contentArea").children(".CardItem_mask")[0];

    webCpu.CardItem.fresh(data);

    if (data.cardName) {
      $(container).attr("cardName", data.cardName);
    }

    $.toText = function (v) {
      let str = "<span>" + v + "</span>";
      let text = $(str).text();
      return text;
    }

  });


  webCpu.CardItem.message = {};
  webCpu.CardItem.tips = {
    empty: "暂无数据",
    loading: '<span style="position: absolute; text-align: center; display: inline-block;left: 0px;width: 100%;" class="loadingTipsItem"></span><div style="margin-top: 30px;" class="spinner-border text-primary" role="status"><span class="sr-only">Loading...</span></div>',
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
    } else if (typeof n == "string") {
      if (state !== "loading") {
        mask.html(n);
      } else {
        mask.children().find(".CardItem_stateTips .loadingTipsItem").html(n);
      }
    } else if (typeof n === "function") {
      n(mask[0]);
    }
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
    let str = "";
    if (tips) {
      str = "<span class='forbidTips'>" + tips + "</span>"
    }
    webCpu.CardItem._switchMask(data, "html", str);
    var task = data.task || data;
    if (task.cardBody) {
      var mask = $(task.mask);
      // mask.attr("title", tips);
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
    if (!data || data.querySelector) {
      data = data || document.body;

      $(data).children(".cardItemMask").remove();
      return false;
    }
    var task = data.task || data;
    if (task.mask) {
      var tipsArea = $(task.mask);
      if (task.childCard && task.childCard.task.childCard && task.childCard.task.childCard.task.currentApp && task.childCard.task.childCard.task.currentApp) {
        task.childCard.task.childCard.task.currentApp.unmount();
      }
      tipsArea.children().remove();
      tipsArea.hide();
      delete task.childCard;
    }
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
                        <div class='dialogBlankArea' style='float: left; position:relative; height: 100%; top: 0px; bottom: 0px; margin-left:0px; margin-right: 0px;'></div>\
                      </div>";
    maskSelector.html(htmlString);
    style = style || {
      "float": "left",
      "width": w
    };
    style.position = "relative";
    style.float = style.float || "left";
    style.width = style.width || w;
    var _self = this;
    var cSelector = maskSelector.find(".maskContentArea");
    for (var k in style) {
      cSelector.css(k, style[k]);
    }
    maskSelector.find(".dialogBlankArea").css("width", "calc( 100% - " + w + " )");
    if (style.float === "left") {
      maskSelector.find(".dialogBlankArea").css("float", "right");
    } else {
      maskSelector.find(".dialogBlankArea").css("float", "left");
    }
    maskSelector.show();
    maskSelector.find(".dialogBlankArea").on("click", function (e) {
      if (!tParam || typeof tParam.closeCallback !== "function") {
        _self.dismissMask(card);
      }

      if (tParam && typeof (tParam.closeCallback) === "function") {
        tParam.closeCallback();
      }
      e.stopPropagation();
    });
    if (objectCard) {
      let mArea = cSelector[0];
      objectCard.title = title;
      webCpu.updateView(mArea, objectCard, function (c0, d0, t0) {
        if (tParam && typeof (tParam.callback) === "function") {
          tParam.callback(c0, d0, t0);
        }
      });
    }
  }

  webCpu.CardItem.rightCardDialog = function (card, objectCard, title, w, style, callback1, callback2) {
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
                        <div class='dialogBlankArea' style='float: left; position:relative; height: 100%; top: 0px; bottom: 0px; margin-left:0px; margin-right: 0px;'></div>\
                        <div style='float: right; position:relative; height: 100%; overflow:auto; top: 0px; bottom:0px;' class='maskContentArea'></div>\
                      </div>";
    maskSelector.html(htmlString);
    style = style || {
      "float": "right",
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
    maskSelector.find(".dialogBlankArea").css("width", "calc( 100% - " + w + " )");
    if (style.float === "left") {
      maskSelector.find(".dialogBlankArea").css("float", "right");
    } else {
      maskSelector.find(".dialogBlankArea").css("float", "left");
    }
    maskSelector.show();
    maskSelector.find(".dialogBlankArea").on("click", function (e) {
      if (!tParam || typeof (tParam.closeCallback) !== "function") {
        _self.dismissMask(card);
      }

      if (tParam && typeof (tParam.closeCallback) === "function") {
        tParam.closeCallback();
      }
      e.stopPropagation();
    });
    maskSelector.css({
      backgroundColor: "rgba(250, 250, 250, 0.2)"
    })
    if (objectCard) {
      let mArea = cSelector[0];
      objectCard.title = title;
      webCpu.updateView(mArea, objectCard, function (c0, d0, t0) {
        if (tParam && typeof (tParam.callback) === "function") {
          tParam.callback(c0, d0, t0);
        }
      });
    }
  }

  webCpu.CardItem.updateConfig = function (data, _interface) {
    var config = _interface;
    if (typeof (_interface) === "string" && webCpu._interface && webCpu._interface[_interface]) {
      config = webCpu._interface[_interface];
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
    title = title || "";
    option = option || {};
    style = style || {};

    var maskCard = {
      cardName: "transwebMaskCard",
      task: {
        option: option,
        promise: {
          afterRender: function (mc, md, mt) {
            webCpu.addCardItem(mc, objectCard, {
              key: mt.option.key || mt.option || "transweb",
              _interface: option._interface,
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
                          <span style='position: absolute; left: 0px; top: 50%; margin-top: -11px; display: inline-block; width: 30px; padding: 2px; vertical-align: middle; text-align: center; cursor: pointer;' class='bi bi-backspace closeBtn'></span>\
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
    maskSelector.find(".closeBtn").on("click", function () {
      _self.dismissMask(card);
    });
    if (objectCard) {
      let mArea = maskSelector.find(".tipsStringArea")[0];
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


  webCpu.CardItem.fresh = function (data, _interface) {
    webCpu.CardItem.updateCardLayout(data);
    if (!data.inactive || $("#tModalDialog").attr("state") === "previewCardItem") {
      webCpu.CardItem._fresh(data, _interface);
    } else if (data.sketch) {
      $(data.task.container).html('<div class="CardItem_sketch"><img src="#" alt="" /></div>');
      $(data.task.container).find(".CardItem_sketch>img").attr("src", data.sketch);
      $(data.task.container).find(".CardItem_sketch>img").attr("alt", data.title || data.cardName);
    } else { }
  }

  webCpu.CardItem._fresh = function (data, _interface) {
    var t = data.task || data;

    webCpu.CardItem.updateConfig(data, _interface);
    if (!t.withoutLoadingTip) {
      webCpu.CardItem.switchState(t, "loading");
    }

    var className = data.className || "TemplateItem";
    t.shadowDom = null;
    // if ($(t.container).hasClass("_task_container")) {
    //   var elem = t.container;
    //   t.container = t.container.parentNode;
    //   t.container.removeChild(elem);
    // }


    if (webCpu.settings && webCpu.settings.limitedItems && webCpu.settings.limitedItems.indexOf(className) !== -1) {
      delete webCpu[className];
      t.shadowDom = t.container.attachShadow({
        mode: "closed"
      });
      t.container = document.createElement("div");
      t.shadowDom.appendChild(t.container);
      t.container.setAttribute("style", "width: 100%; height: 100%; position: relative;");
    }
    webCpu.render(className, t, data.componentPath || this.config.path, t.shadowDom);
  }


  webCpu.CardItem.updateMenuItems = function (elem, data) {
    for (var i = 0; i < data.length; i++) {
      var menuItem = data[i];
      var value = menuItem.name || menuItem.text || menuItem.label || menuItem;
      if (menuItem.data) {
        value = value.bindData(menuItem.data);
      }
      var item = $('<div class="menuItem" style="float: left; height: 100%; width: auto; font-size: 14px; padding-left: 15px; padding-right: 15px; display: flex; flex-wrap: wrap; justify-content:center; align-items:center; border-left: solid 1px rgba(10, 10, 10, 0.1);">' + value + '</div>')
      item.appendTo($(elem));
      let callback = menuItem.action || menuItem.callback;
      if (typeof (callback) === "function") {
        item.on("click", function (e) {
          e.stopPropagation();
          e.preventDefault();
          callback(e)
        });
      }
    }
  }

  webCpu.CardItem.createMenuItem = function (menu, type) {
    var nav = $('<ul class="nav navbar-nav" style="margin: 0px;"></ul>');
    for (let k in menu) {
      var name = menu[k].name || menu[k].label || menu[k];
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
    if (!(data && data.task && data.task.container)) {
      return false;
    }
    var container = data.task.container.parentNode.parentNode;
    if (!$(container).hasClass("CardItem_content")) {
      container = container.parentNode;
    }
    if (!data.title && !data.titleMenu && !data.titleMenu && !data.titleData && !data.breadcrumb && !data.dialogData) {
      $(container).children(".CardItem_titleArea").hide();
      $(container).children(".__CardItem_componentArea").css("padding-top", "0px");
    } else {
      if (typeof (data.titleHeight) === "number" || typeof (data.titleHeight) === "string") {
        var h = data.titleHeight;
      } else {
        h = 40;
      }
      $(container).children(".__CardItem_componentArea").css({
        "padding-top": h,
        "box-sizing": "border-box"
        // "height": "calc( 100% - " + h + "px )"
      });

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
        var tSelector = $('<nav aria-label="breadcrumb"></nav>');
        var bSelector = $('<ol class="breadcrumb" style="background: none; padding-left: 0px; margin: 0px;"></ol>');
        for (var k = 0; k < data.breadcrumb.length; k++) {
          var text = data.breadcrumb[k].text || data.breadcrumb[k];
          var item = $('<li class="breadcrumb-item">' + text + '</li>');
          if (data.breadcrumb[k].href) {
            var target = data.breadcrumb[k].target || "_blank";
            item = $('<li class="breadcrumb-item"><a target="' + target + '" href="' + data.breadcrumb[k].href + '">' + text + '</a></li>')
          }
          item.appendTo(bSelector);
          if (data.breadcrumbStyle) {
            item.css(data.breadcrumbStyle);
          }
        }
        bSelector.appendTo(tSelector);
        tSelector.appendTo(titleSelector);
      } else if (data.dialogData) {
        var temp = ("<div style='width: 100%; height: 100%; position: relative;'>\
                              <div class='titleInfoArea ellipsis' style=''></div>\
                              <div class='leftEmptyArea' style=''></div>\
                              <div class='rightEmptyArea' style=''></div></div>");
        if (data.dialogData.titlePosition && data.dialogData.titlePosition === "left") {
          temp = ("<div style='width: 100%; height: 100%; position: relative;'>\
          <div class='titleInfoArea ellipsis'  style=''></div>\
          <div class='rightEmptyArea' ></div></div>");
        }
        titleSelector.html(temp);
        titleSelector.find(".titleInfoArea").html(`<span class="ellipsis">${data.dialogData.title}</span>`);
        if (data.dialogData.titleStyle) {
          titleSelector.find(".titleInfoArea").css(data.dialogData.titleStyle);
        }

        data.dialogData.closeType = data.dialogData.closeType || "";

        var leftSelector = titleSelector.find(".leftEmptyArea");
        var rightSelector = titleSelector.find(".rightEmptyArea");


        var closeSelector = leftSelector;
        var menuSelector = rightSelector;
        if (data.dialogData.closeType === "left") {
          // closeSelector.html("<i style='margin-left: 5px;' class='maskCloseBtn bi bi-x-circle' />");
          closeSelector.html(`<svg class="maskCloseBtn" title="关闭" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
</svg>`);
        } else if (data.dialogData.closeType === "right") {
          closeSelector = rightSelector;
          menuSelector = leftSelector;
          closeSelector.html(`<svg class="maskCloseBtn" title="关闭" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
</svg>`);
        } else if (data.dialogData.closeType === "back") {
          closeSelector.html(`<svg title='返回' class='maskCloseBtn' xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-left" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
</svg>`);
        } else {
          closeSelector = rightSelector;
          menuSelector = leftSelector;
          closeSelector.html(`<svg class="maskCloseBtn" title="关闭" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
</svg>`);
        }
        if (data.dialogData.disClosed) {
          closeSelector.hide();
        }
        if (data.dialogData.fullScreen || data.dialogData.headerHidden) {
          titleSelector.parent().hide();
          $(container).children(".__CardItem_componentArea").css("padding-top", "0px");
        } else if (data.dialogData.titleStyle) {
          titleSelector.parent().css(data.dialogData.titleStyle);
        } else {

        }

        if (data.dialogData.headerHidden) {
          $(container).parent().parent().parent().off("click");
          $(container).parent().parent().parent().on("click", (e) => {
            let elem = e.target;
            console.log("mask container", elem);
            if (typeof data.dialogData.closeCallback !== "function") {
              webCpu.CardItem.dismissMask(data.dialogData.parentCard);
            }
            if (data.dialogData.parentCard) {
              if (typeof (data.dialogData.closeCallback) === "function") {
                data.dialogData.closeCallback()
              }
            }
          });

          $(container).off("click");
          $(container).on("click", (e) => {
            // e.preventDefault();
            e.stopPropagation();
          })
        }
        else {
          $(container).parent().parent().parent().off("click");
          $(container).off("click");
        }

        if (data.dialogData.menu) {
          webCpu.CardItem.updateMenuItems(menuSelector[0], data.dialogData.menu);
        } else {
          menuSelector.hide();
        }

        closeSelector.on("click", function (e) {
          e.stopPropagation();
          e.preventDefault();
          if (typeof data.dialogData.closeCallback !== "function") {
            webCpu.CardItem.dismissMask(data.dialogData.parentCard);
          }

          if (data.dialogData.parentCard) {
            if (typeof (data.dialogData.closeCallback) === "function") {
              data.dialogData.closeCallback()
            }
          }
        });

      } else { }

      if (data.titleStyle) {
        titleSelector.css(data.titleStyle);
      }
      titleSelector.parent().css("overflow", "visible")
    }

    if (!data.foot && !data.footMenu) {
      $(container).children(".CardItem_footArea").hide();
      $(container).children(".__CardItem_componentArea").css("padding-bottom", "0px");
    } else {
      var h = data.footHeight || "40px";
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
            item.on("click", function (e) {
              e.stopPropagation();
              e.preventDefault();
              menuItem.action(e);
            });
          }
        }
      }
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
        titleStyle: {
          "padding-left": "30px",
          "font-weight": 900,
          "color": "#000",
          "box-shadow": "0px 1px 0px #ddd",
          "background": "#f0f0f0"
        },
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
    style = style || webCpu.config.confirmDialog || {
      width: "300px",
      height: "100px",
      paddingLeft: "20px",
      border: "solid 1px #aaa",
      borderRadius: "10px",
      float: "left",
      display: "inline-block",
      background: "rgba(250, 250, 250, 0.7)"
    }
    if (typeof (param) === "function") {
      param = {
        callback: param
      }
    }
    var str = "<div class='confirmDialogContainer' style='float: left; position: relative; width: 100%; margin-top: 10px;'>" + tips + "</div>\
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

  webCpu.CardItem.iframeDialog = function (mCard, title, url, params, style) {
    var html = "<iframe style='border-radius: 3px;' frameborder=0 width='100%' height='100%' src='" + url + "' allowfullscreen></iframe>";
    let tParams = {
      closeType: "back",
      renderMode: "stack",
    };
    webCpu.attachAttribute(params, tParams);
    this.htmlDialog(mCard, title, html, tParams, style);
  }

  webCpu.CardItem.htmlDialog = function (mCard, title, html, param, style, tStyle) {
    style = style || {
      width: "100%",
      height: "100%",
      background: "rgba(255, 255, 255, 0.9)",
      border: "solid 1px #f8f8f8",
      boxShadow: "1px 1px 2px #000",
      color: "#ddd"
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
              param.callback(c, d, t);
            }
          }
        }
      }
    }
    param.title = title;
    this.renderCardDialog(mCard, card, param, style, tStyle);
  }


  webCpu.CardItem.renderCardDialog = function (mCard, option, params, style, tStyle) {
    var task = mCard;
    params = params || {};
    if (mCard && !mCard.querySelector) {
      task = mCard.task || mCard;
      if (params) {
        params.parentCard = mCard;
      }

      if (task.childCard && params.renderMode === 'stack') {
        webCpu.CardItem.renderCardDialog(task.childCard, option, params, style, tStyle);
        return;
      }
      this.switchMask(mCard, "html", "");
    } else {
      mCard = mCard || document.body;
      if (params) {
        params.parentCard = mCard;
      }
      task = {
        mask: document.createElement("div")
      }
      task.mask.setAttribute("class", "cardItemMask");
      task.mask.style.zIndex = 2000;
      task.mask.style.width = "100%";
      task.mask.style.height = "100%";
      task.mask.style.position = "absolute";
      task.mask.style.background = "rgba(255, 255, 255, 0.95)";
      task.mask.style.display = "flex";
      task.mask.style.left = 0;
      task.mask.style.top = 0;
      if (mCard.querySelector(".cardItemMask")) {
        mCard.querySelector(".cardItemMask").remove();
      }
      mCard.prepend(task.mask);
    }
    if (params.style) {
      $(task.mask).css(params.style);
    }
    if (params.fullScreen) {
      WebTool.fullscreenDisplay(task.mask);
    }
    var tempCard = {
      title: params.title,
      titleStyle: params.titleStyle,
      titleHeight: params.titleHeight || 30,
      dialogData: params,
      foot: params.foot,
      cardName: params.dialogName,
      style: style,
      task: {
        style: tStyle || {
          padding: "0px"
        },
        promise: {
          afterRender: function (c1, d1, t1) {
            if (option.pluginUrl && option.pluginKey) {
              option.url = option.url || option.pluginUrl;
              option.key = option.key || option.pluginKey;
              webCpu.renderCard(c1, option, option.cardName, option.dsl, params.callback);
            } else {
              webCpu.updateView(c1, option, params.callback);
              if (option.card && option.card.task) {
                option.card.task._parent = t1.card;
                t1.childCard = option.card;
              }
            }

          }
        }
      }
    }
    if (params.fullScreen) {
      setTimeout(function () {
        webCpu.updateView(task.mask, tempCard);
      }, 200);
    } else {
      webCpu.updateView(task.mask, tempCard);
    }

    task.childCard = tempCard;
    return tempCard;
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

  webCpu.CardItem.confirmRequest = function (adapterItem, query, card, tips, callback) {
    webCpu.CardItem.htmlDialog(card, "提示", "<div style='padding: 20px; font-size: 20px;'>" + tips + "</div>", {
      foot: '<div><input class="btn btn-primary btn-sm" type="button" value="确认">\
                  <input class="btn btn-default btn-sm" type="button" value="取消"></div>',
      callback: function (c, d, t) {
        $(t.footArea).find(".btn-primary").on("click", function () {
          adapterItem(query, function (ret) {
            callback(ret);
          });
        });
        $(t.footArea).find(".btn").on("click", function () {
          webCpu.CardItem.dismissMask(card);
        });
      },
      titlePosition: "left",
      titleStyle: {
        "padding-left": "20px"
      }
    }, {
      border: "solid 1px #ddd",
      "border-radius": "5px",
      "background-color": "#fefefe",
      width: "450px",
      height: "200px"
    });
  }

  webCpu.CardItem.dialog = function (data, options, closePromise) {
    var options = options || {};
    webCpu.render("ModalDialog", function (c, d, t) {
      var task = {
        data: data
      }

      if (typeof (closePromise) === "function") {
        task.promise = {
          closeDialog: closePromise
        }
      }

      $("#tModalDialog").attr("state", "previewCardItem");
      webCpu["ModalDialog"].displayComponent(options.title || "", "CardItem", task, options);
      // task.data.task.container = t.container;
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


  /**
 * webCpu.CardItem 自动化脚本「播放执行器」（润色版）
 * …（文件内附完整头注释）…
 */
  webCpu.CardItem.keyArray = ["keydown", "keyup", "keypress"];

  webCpu.CardItem.mouseArray = ["mouseleave", "mouseenter", "mousedown", "mouseup"];

  webCpu.CardItem.tipsStyle = {
    padding: "10px",
    borderRadius: "3px",
    backgroundColor: "rgba(15, 15, 15, 0.8)",
    border: "solid 1px #666",
    color: "#f2f2f2",
    fontSize: "30px",
    minWidth: "100px",
    maxWidth: "500px",
    height: "auto"
  };

  /* 单调时钟 */
  function webCpuCardItemNow() {
    return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  }

  /* 归一化容器 */
  function webCpuCardItemContainer(container) {
    const task = (container && container.task) ? container.task : container;
    if (task && task.container) return task.container;
    return container || document.body;
  }

  /* 安全滚动 */
  function webCpuCardItemScrollIntoView(el) {
    try {
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ block: 'center', inline: 'center' });
      }
    } catch (e) { /* 忽略 */ }
  }

  webCpu.CardItem.getLabelWidth = function (str, fontSize, fontFamily) {
    let width = 0;
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.font = `${fontSize} ${fontFamily}`;
        width = ctx.measureText(str == null ? '' : String(str)).width;
      }
    } catch (e) { width = 0; }
    return width;
  };

  /* 元素解析：原生优先，兼容 body/window/number/string */
  webCpu.CardItem.resolveElement = function (ref, container) {
    container = webCpuCardItemContainer(container);

    let sel = null;
    let idx = 0;

    if (Array.isArray(ref)) {
      sel = ref[0];
      idx = Math.max(0, (Number(ref[1]) || 1) - 1);
    } else if (typeof ref === 'number') {
      sel = '.el-card';
      idx = Math.max(0, ref - 1);
    } else if (typeof ref === 'string') {
      sel = ref;
      idx = 0;
    }

    if (sel == null) return null;

    const s = String(sel).toLowerCase();
    if (s === 'body' || s === 'document' || s === 'html') return document.body;
    if (s === 'window') return window;

    let list = [];
    try {
      if (container && container.querySelectorAll) list = container.querySelectorAll(sel);
    } catch (e) { list = []; }

    if ((!list || !list.length) && container !== document) {
      try { list = document.querySelectorAll(sel); } catch (e) { list = []; }
    }

    if (list && list.length) return list[idx] || list[0] || null;
    return null;
  };

  webCpu.CardItem.getAnimateElement = function (item, container) {
    if (!item || item.object === undefined) return null;
    return webCpu.CardItem.resolveElement(item.object, container);
  };

  webCpu.CardItem.removeAnimationClass = function (elem) {
    if (!elem) return;
    if (typeof $ === 'function') {
      $(elem).removeClass(function (index, className) {
        return (className.match(/\banimate__\S*/g) || []).join(' ');
      });
    } else {
      const cls = (elem.getAttribute('class') || '')
        .split(/\s+/)
        .filter((c) => c && c.indexOf('animate__') !== 0)
        .join(' ');
      elem.setAttribute('class', cls);
    }
  };

  webCpu.CardItem.addAnimation = function (elem, animation, duration) {
    if (!elem) return false;
    this.removeAnimationClass(elem);

    const $el = (typeof $ === 'function') ? $(elem) : null;
    if ($el) {
      $el.addClass('animate__animated');
      if (animation) $el.addClass('animate__' + animation);
    }

    if (duration === 'infinite') {
      if ($el) $el.addClass('animate__infinite');
    } else {
      const sec = Number(duration) || 3;
      const _self = this;
      setTimeout(function () { _self.removeAnimationClass(elem); }, sec * 1000);
    }
  };

  webCpu.CardItem.setAnimateStyle = function (item, container, repeat) {
    const elem = this.getAnimateElement(item, container);
    if (!elem) return false;

    this.removeAnimationClass(elem);

    const $el = (typeof $ === 'function') ? $(elem) : null;
    if ($el) $el.css({ visibility: 'visible' });

    const text = elem.getAttribute && elem.getAttribute('textInfo');
    if (text && $el) $el.html(text);

    if ($el) {
      $el.addClass('animate__animated');
      if (item.type) $el.addClass('animate__' + item.type);
      if (item.duration) {
        $el.addClass('animate__' + (typeof item.duration === 'number' ? item.duration + 's' : item.duration));
      }
      if (repeat === 'infinite') {
        $el.addClass('animate__infinite');
      } else {
        const r = Number(repeat) || 1;
        $el.addClass('animate__repeat-' + r);
      }
    }
  };

  /* 原生 value setter（兼容 React/Vue 受控输入） */
  webCpu.CardItem.setNativeValue = function (elem, value) {
    if (!elem) return;
    const proto = elem.tagName === 'TEXTAREA'
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, 'value');
    if (desc && desc.set) desc.set.call(elem, value);
    else elem.value = value;
    elem.dispatchEvent(new Event('input', { bubbles: true }));
  };

  webCpu.CardItem.typingInput = function (elem, text, callback, duration) {
    duration = Number(duration) || 3;
    clearInterval(webCpu.CardItem.typingInterval);

    text = text == null ? '' : String(text);

    if (!elem) {
      if (typeof callback === 'function') callback(text);
      return;
    }

    if (text.length === 0) {
      webCpu.CardItem.setNativeValue(elem, '');
      elem.dispatchEvent(new Event('change', { bubbles: true }));
      if (typeof callback === 'function') callback(text);
      return;
    }

    const gap = Math.max(1, Math.round(Math.max(0.1, duration) * 1000 / text.length));
    let i = 1;
    webCpu.CardItem.typingInterval = setInterval(function () {
      webCpu.CardItem.setNativeValue(elem, text.substring(0, i));
      i++;
      if (i > text.length) {
        clearInterval(webCpu.CardItem.typingInterval);
        elem.dispatchEvent(new Event('change', { bubbles: true }));
        if (typeof callback === 'function') callback(text);
      }
    }, gap);
  };

  webCpu.CardItem.typingOutput = function (item, container) {
    const elem = this.getAnimateElement(item, container);
    if (!elem) {
      console.warn('[typingOutput] 选择器无效', item.object);
      return false;
    }
    const $el = (typeof $ === 'function') ? $(elem) : null;
    if (!$el) return false;

    const text = $el.attr('textInfo') || $el.html() || '';
    clearInterval(webCpu.CardItem.typingInterval);
    $el.css({ visibility: 'visible' });

    if (text && text.length !== 0) {
      const gap = Math.max(1, Math.round(Math.max(0.1, Number(item.duration) || 3) * 1000 / text.length));
      let i = 1;
      webCpu.CardItem.typingInterval = setInterval(function () {
        $el.html(text.substring(0, i));
        i++;
        if (i > text.length) clearInterval(webCpu.CardItem.typingInterval);
      }, gap);
    }
  };

  webCpu.CardItem.showTip = function (item, container) {
    container = webCpuCardItemContainer(container);
    const elem = webCpu.CardItem.resolveElement(item.object, container);
    const isAttention = String(item.type).toLowerCase() === 'showattention';

    const tStyle = (window.WebTool && typeof WebTool.copyObject === 'function')
      ? WebTool.copyObject(webCpu.CardItem.tipsStyle)
      : Object.assign({}, webCpu.CardItem.tipsStyle);

    const root = container.getBoundingClientRect();
    let tBox = root;
    if (elem && typeof elem.getBoundingClientRect === 'function') {
      tBox = elem.getBoundingClientRect();
    }

    let gapX = tBox.x - root.x;
    let gapY = tBox.y - root.y;

    let radio = 1;
    const transform = window.getComputedStyle(container).transform;
    const match = /\(([^)]+)\)/.exec(transform);
    if (match && match[1]) {
      const args = match[1].split(',');
      radio = Number(args[0].trim()) || 1;
    }
    gapX = gapX / radio;
    gapY = gapY / radio;

    tStyle['margin-left'] = (item.xPos || 0) + gapX + 'px';
    tStyle['margin-top'] = (item.yPos || 0) + gapY + 'px';

    if (isAttention) {
      item.tips = '';
      if (window.webCpu && typeof webCpu.attachAttribute === 'function') {
        webCpu.attachAttribute({
          width: '34px',
          height: '34px',
          padding: '2px',
          background: 'radial-gradient(circle at 50% 50%, #ff00ff, #000000)',
          borderRadius: '100%',
          mixBlendMode: 'difference',
          zIndex: 100000
        }, tStyle);
      }
      tStyle.minWidth = '';
      tStyle.maxHeight = '';
    } else {
      const fontFamily = window.getComputedStyle(document.body).fontFamily;
      tStyle.width = this.getLabelWidth(item.tips || '', tStyle.fontSize || '30px', fontFamily) + 30 + 'px';
    }

    item.parent = container;
    if (window.webCpu && typeof webCpu.attachLabel === 'function') {
      return webCpu.attachLabel(container, item.tips || '', tStyle, item);
    }
    return null;
  };

  webCpu.CardItem.triggerTimeEvent = function (item, elem) {
    const task = (elem && elem.task) ? elem.task : elem;
    if (task && task.container) elem = task.container;
    elem = elem || document.body;

    if (typeof item.callback === 'function') {
      try {
        item.callback(task, task && task.vueItem);
      } catch (e) {
        console.error('[triggerTimeEvent] callback 执行出错', e);
      }
      console.log(`#timeEvent_${item.offset}_callback`, item);
    } else if (item.animation) {
      const anim = item.animation;
      if (anim.type && typeof this[anim.type] === 'function') {
        this[anim.type](anim, elem, item.repeat);
      } else {
        this.setAnimateStyle(anim, elem, item.repeat);
      }
      console.log(`#timeEvent_${item.offset}_animation`, item);
    } else if (item.event) {
      this.triggerEvent(item, elem);
      console.log(`#timeEvent_${item.offset}_event`, item);
    }

    if (item.timer !== undefined) {
      item.gap = webCpuCardItemNow() - item.start;
      clearTimeout(item.timer);
      item.timer = null;
    }
  };

  webCpu.CardItem.triggerEvent = function (obj, container) {
    const item = obj && obj.event ? obj.event : obj;
    if (!item || !item.type) return false;

    const type = String(item.type);
    const typeLower = type.toLowerCase();
    container = webCpuCardItemContainer(container);

    const keyArray = webCpu.CardItem.keyArray || [];
    const mouseArray = webCpu.CardItem.mouseArray || [];

    try {
      // 1) 滚动
      if (typeLower === 'scroll') {
        const x = Number(item.x) || 0;
        const y = Number(item.y) || 0;
        window.scrollTo(x, y);
        if (container && container !== document.body && typeof container.scrollTo === 'function') {
          container.scrollTo(x, y);
        }
        return true;
      }

      // 2) 键盘事件
      if (keyArray.indexOf(typeLower) !== -1) {
        const opts = (item.object && typeof item.object === 'object' && !Array.isArray(item.object))
          ? item.object
          : {};
        const ev = new KeyboardEvent(typeLower, {
          bubbles: opts.bubbles !== false,
          cancelable: opts.cancelable !== false,
          view: window,
          char: opts.char || '',
          code: opts.code || '',
          key: opts.key || '',
          location: typeof opts.location === 'number' ? opts.location : KeyboardEvent.DOM_KEY_LOCATION_STANDARD
        });
        (document.activeElement || document.body).dispatchEvent(ev);
        return true;
      }

      // 3) 提示 / 强调
      if (typeLower === 'showtips' || typeLower === 'showattention') {
        this.showTip(item, container);
        return true;
      }

      const elem = webCpu.CardItem.resolveElement(item.object, container);

      // 4) 动画类
      if (typeLower === 'addanimation') {
        this.addAnimation(elem, item.animation, item.duration);
        return true;
      }

      // 5) 鼠标事件
      if (mouseArray.indexOf(typeLower) !== -1) {
        const el = (elem && elem.nodeType === 1) ? elem : container;
        el.dispatchEvent(new MouseEvent(typeLower, {
          bubbles: true, cancelable: true, view: window, clientX: 2, clientY: 2
        }));
        return true;
      }

      // 6) 点击
      if (typeLower === 'click') {
        if (elem && elem.nodeType === 1) {
          webCpuCardItemScrollIntoView(elem);
          elem.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
          if (typeof elem.click === 'function') elem.click();
        } else {
          console.warn('[triggerEvent] click 目标元素无效', item.object);
        }
        return true;
      }

      // 7) 悬停
      if (typeLower === 'hover' || typeLower === 'mouseover' || typeLower === 'mouseenter') {
        if (elem && elem.nodeType === 1) {
          webCpuCardItemScrollIntoView(elem);
          elem.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true, view: window }));
          elem.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false, cancelable: false, view: window }));
        } else {
          console.warn('[triggerEvent] hover 目标元素无效', item.object);
        }
        return true;
      }

      // 8) 文本输入
      if (typeLower === 'inputtext' || typeLower === 'typinginput') {
        if (elem && (elem.tagName === 'INPUT' || elem.tagName === 'TEXTAREA')) {
          webCpuCardItemScrollIntoView(elem);
          elem.focus();
          this.typingInput(elem, item.text, null, item.duration);
        } else {
          console.warn('[triggerEvent] inputText 目标非输入框', item.object);
        }
        return true;
      }

      // 9) 复选 / 单选
      if (typeLower === 'check') {
        if (elem && elem.tagName === 'INPUT' && (elem.type === 'checkbox' || elem.type === 'radio')) {
          webCpuCardItemScrollIntoView(elem);
          elem.checked = !!item.checked;
          elem.dispatchEvent(new Event('input', { bubbles: true }));
          elem.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          console.warn('[triggerEvent] check 目标非复选/单选框', item.object);
        }
        return true;
      }

      // 10) 下拉选择（支持多选）
      if (typeLower === 'select') {
        if (elem && elem.tagName === 'SELECT') {
          webCpuCardItemScrollIntoView(elem);
          elem.focus();
          if (Array.isArray(item.value)) {
            Array.prototype.forEach.call(elem.options, function (o) {
              o.selected = item.value.indexOf(o.value) !== -1;
            });
          } else {
            elem.value = item.value;
          }
          elem.dispatchEvent(new Event('input', { bubbles: true }));
          elem.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          console.warn('[triggerEvent] select 目标非下拉框', item.object);
        }
        return true;
      }

      // 11) 打字输出（旧编辑器类型）
      if (typeLower === 'typingoutput') {
        this.typingOutput(item, container);
        return true;
      }

      // 12) 兜底
      if (elem) {
        if (typeof $ === 'function' && typeof $(elem)[type] === 'function') {
          $(elem)[type]();
          return true;
        }
        if (typeof elem[type] === 'function') {
          elem[type]();
          return true;
        }
      }

      console.warn('[triggerEvent] 未识别的事件类型', type, item);
      return false;
    } catch (e) {
      console.error('[triggerEvent] 执行失败', type, e);
      return false;
    }
  };

  webCpu.CardItem.triggerTimeEventAsync = function (item, elem, done) {
    const task = (elem && elem.task) ? elem.task : elem;
    if (task && task.container) elem = task.container;
    elem = elem || document.body;

    if (item.event && String(item.event.type).toLowerCase() === 'inputtext') {
      const target = webCpu.CardItem.resolveElement(item.event.object, elem);
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        this.typingInput(target, item.event.text, done, item.event.duration);
        return;
      }
      if (typeof done === 'function') done();
      return;
    }

    this.triggerTimeEvent(item, elem);
    if (typeof done === 'function') done();
  };

  webCpu.CardItem.initTimeEvent = function (elem, arr, _parent, onComplete) {
    _parent = _parent || this;

    if (typeof _parent === 'function') {
      onComplete = _parent;
      _parent = this;
    }
    onComplete = onComplete || _parent.onComplete;

    const BANNER_HEIGHT = 42;
    const DEFAULT_RETRY_INTERVAL = 0.5;
    const _self = this;

    if (!Array.isArray(arr)) arr = [];
    arr = arr.slice().sort(function (a, b) { return (Number(a && a.offset) || 0) - (Number(b && b.offset) || 0); });

    let flow = _parent._timeFlow;
    if (!flow) {
      flow = {
        arr: [], elem: null, onComplete: null, runId: 0, index: 0, lastOffset: 0,
        isPaused: false, isFinished: false, status: 'running', pendingSchedule: false,
        startedAt: 0, pausedAt: 0, totalPaused: 0, finalElapsedMs: 0,
        timer: null, timerDeadline: 0, timerRemaining: 0, onTimerFire: null,
        phase: 'delay', currentItem: null, ui: null
      };
      _parent._timeFlow = flow;
    }

    flow.arr = arr;
    flow.elem = elem;
    flow.onComplete = onComplete;
    _parent.timeEvents = arr;

    function formatMs(ms) {
      const totalSec = Math.max(0, Math.floor(ms / 1000));
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function getElapsedMs() {
      const now = webCpuCardItemNow();
      const paused = flow.isPaused ? (now - flow.pausedAt) : 0;
      return now - flow.startedAt - flow.totalPaused - paused;
    }

    function clearFlowTimer() {
      if (flow.timer) { clearTimeout(flow.timer); flow.timer = null; }
      flow.timerDeadline = 0;
    }

    function resetTimerState() {
      clearFlowTimer();
      flow.timerRemaining = 0;
      flow.onTimerFire = null;
    }

    function setFlowTimer(delayMs, fn) {
      clearFlowTimer();
      flow.timerDeadline = webCpuCardItemNow() + delayMs;
      flow.timerRemaining = 0;
      flow.onTimerFire = fn;
      flow.timer = setTimeout(function () {
        flow.timer = null;
        flow.timerDeadline = 0;
        const cb = flow.onTimerFire;
        flow.onTimerFire = null;
        if (flow.isFinished) return;
        if (typeof cb === 'function') cb();
      }, delayMs);
    }

    function resetDomState(steps, container) {
      if (!Array.isArray(steps)) return;
      container = webCpuCardItemContainer(container);

      steps.forEach(function (step) {
        const conf = (step && (step.animation || step.event)) || step;
        if (!conf || !conf.object) return;

        const el = webCpu.CardItem.resolveElement(conf.object, container);
        if (!el || el === window) return;

        if (typeof _self.removeAnimationClass === 'function') {
          try { _self.removeAnimationClass(el); } catch (e) { /* 忽略 */ }
        }

        const type = conf.type ? String(conf.type).toLowerCase() : '';
        const tag = el.tagName ? String(el.tagName).toLowerCase() : '';

        if (type === 'typingoutput' && typeof $ === 'function') {
          const $el = $(el);
          const original = $el.attr('textInfo');
          if (original !== undefined && original !== null) $el.html(original);
          $el.css({ visibility: '' });
        }

        if (type === 'inputtext' || type === 'typinginput' || tag === 'input' || tag === 'textarea') {
          try { el.value = ''; } catch (e) { /* 忽略 */ }
        }

        if (type === 'check') {
          try { el.checked = false; } catch (e) { /* 忽略 */ }
        }
      });
    }

    function clearAllInputs(scope) {
      const root = (scope && scope.querySelectorAll) ? scope : document;
      const SKIP_TYPES = { button: 1, submit: 1, reset: 1, hidden: 1, checkbox: 1, radio: 1, file: 1, image: 1 };
      const fields = root.querySelectorAll('input, textarea, [contenteditable]');
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        const tag = (field.tagName || '').toLowerCase();
        if (tag === 'input') {
          const type = (field.type || 'text').toLowerCase();
          if (SKIP_TYPES[type]) continue;
          field.value = '';
        } else if (tag === 'textarea') {
          field.value = '';
        } else if (field.isContentEditable) {
          field.textContent = '';
        }
      }
    }

    function createFlowUI(callbacks) {
      const root = document.documentElement;
      const prevTransform = root.style.transform;
      const prevHeight = root.style.height;

      root.style.transform = `translateY(${BANNER_HEIGHT}px)`;
      root.style.height = `calc(100vh - ${BANNER_HEIGHT}px)`;

      const host = document.createElement('div');
      host.id = 'webcpu-timeevent-banner';
      host.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: ${BANNER_HEIGHT}px;
      z-index: 2147483647; transform: translateY(-${BANNER_HEIGHT}px); pointer-events: auto;
    `;

      const shadow = host.attachShadow({ mode: 'open' });
      const style = document.createElement('style');
      style.textContent = `
      :host {
        display: block; width: 100%; height: 100%;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 13px; line-height: 1; color: #f8fafc;
      }
      .banner {
        width: 100%; height: 100%;
        display: flex; align-items: center; justify-content: space-between;
        padding: 0 16px; box-sizing: border-box;
        background: #1e293b; box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        user-select: none;
      }
      .info { display: flex; align-items: center; gap: 8px; min-width: 0; }
      .dot { width: 10px; height: 10px; border-radius: 50%; background: #ef4444; flex: 0 0 auto; animation: pulse 1.5s infinite; }
      .text { white-space: nowrap; }
      .progress { color: #94a3b8; font-size: 12px; white-space: nowrap; }
      .btns { display: flex; align-items: center; gap: 8px; flex: 0 0 auto; }
      .btn { padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; line-height: 1; color: #fff; transition: filter 0.2s; }
      .btn:hover { filter: brightness(1.15); }
      .btn.pause { background: #334155; border: 1px solid #475569; }
      .btn.stop { background: #dc2626; border: none; font-weight: bold; }
      .btn.restart { background: #2563eb; border: none; font-weight: bold; }
      .btn.close { background: #334155; border: 1px solid #475569; }
      @keyframes pulse {
        0% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.4; transform: scale(0.9); }
        100% { opacity: 1; transform: scale(1); }
      }
    `;

      const banner = document.createElement('div');
      banner.className = 'banner';

      const info = document.createElement('div');
      info.className = 'info';
      const dot = document.createElement('span');
      dot.className = 'dot';
      const text = document.createElement('span');
      text.className = 'text';
      text.textContent = '正在执行自动化步骤';
      const progress = document.createElement('span');
      progress.className = 'progress';
      info.appendChild(dot);
      info.appendChild(text);
      info.appendChild(progress);

      const btnBox = document.createElement('div');
      btnBox.className = 'btns';

      const pauseBtn = document.createElement('button');
      pauseBtn.type = 'button';
      pauseBtn.className = 'btn pause';
      pauseBtn.textContent = '暂停';

      const stopBtn = document.createElement('button');
      stopBtn.type = 'button';
      stopBtn.className = 'btn stop';
      stopBtn.textContent = '终止';

      const restartBtn = document.createElement('button');
      restartBtn.type = 'button';
      restartBtn.className = 'btn restart';
      restartBtn.textContent = '重新开始';
      restartBtn.style.display = 'none';

      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'btn close';
      closeBtn.textContent = '关闭';
      closeBtn.style.display = 'none';

      pauseBtn.onclick = (e) => { e.stopPropagation(); callbacks.onTogglePause(); };
      stopBtn.onclick = (e) => { e.stopPropagation(); callbacks.onStop(); };
      restartBtn.onclick = (e) => { e.stopPropagation(); callbacks.onRestart(); };
      closeBtn.onclick = (e) => { e.stopPropagation(); callbacks.onClose(); };

      btnBox.appendChild(pauseBtn);
      btnBox.appendChild(stopBtn);
      btnBox.appendChild(restartBtn);
      btnBox.appendChild(closeBtn);

      banner.appendChild(info);
      banner.appendChild(btnBox);
      shadow.appendChild(style);
      shadow.appendChild(banner);
      document.body.appendChild(host);

      let destroyed = false;

      return {
        host,
        update(state) {
          if (destroyed) return;
          const runningLike = state.status === 'running' || state.status === 'paused';
          pauseBtn.style.display = runningLike ? '' : 'none';
          stopBtn.style.display = runningLike ? '' : 'none';
          restartBtn.style.display = runningLike ? 'none' : '';
          closeBtn.style.display = runningLike ? 'none' : '';

          if (state.status === 'paused') {
            text.textContent = '自动化执行已暂停';
            pauseBtn.textContent = '继续';
            pauseBtn.style.background = '#059669';
            dot.style.backgroundColor = '#f59e0b';
            dot.style.animation = 'none';
            progress.textContent = `步骤 ${Math.min(state.step + 1, state.total)} / ${state.total} · 用时 ${formatMs(state.elapsedMs)}`;
          } else if (state.status === 'running') {
            text.textContent = '正在执行自动化步骤';
            pauseBtn.textContent = '暂停';
            pauseBtn.style.background = '#334155';
            dot.style.backgroundColor = '#ef4444';
            dot.style.animation = 'pulse 1.5s infinite';
            progress.textContent = `步骤 ${Math.min(state.step + 1, state.total)} / ${state.total} · 用时 ${formatMs(state.elapsedMs)}`;
          } else if (state.status === 'success') {
            text.textContent = '自动化执行完成';
            dot.style.backgroundColor = '#10b981';
            dot.style.animation = 'none';
            progress.textContent = `共 ${state.total} 步 · 总用时 ${formatMs(state.elapsedMs)}`;
          } else if (state.status === 'stopped') {
            text.textContent = '自动化已终止';
            dot.style.backgroundColor = '#94a3b8';
            dot.style.animation = 'none';
            progress.textContent = `已完成 ${state.step} / ${state.total} 步 · 用时 ${formatMs(state.elapsedMs)}`;
          }
        },
        destroy() {
          if (destroyed) return;
          destroyed = true;
          host.remove();
          root.style.transform = prevTransform;
          root.style.height = prevHeight;
        }
      };
    }

    function ensureUI() {
      if (flow.ui) return flow.ui;
      flow.ui = createFlowUI({
        onTogglePause: onTogglePause,
        onStop: onStop,
        onRestart: onRestart,
        onClose: onClose
      });
      return flow.ui;
    }

    function updateUI() {
      if (!flow.ui) return;
      flow.ui.update({
        status: flow.status,
        step: flow.index,
        total: flow.arr.length,
        elapsedMs: flow.isFinished ? flow.finalElapsedMs : getElapsedMs()
      });
    }

    function pauseFlow() {
      if (flow.isPaused || flow.isFinished) return;
      flow.isPaused = true;
      flow.status = 'paused';
      flow.pausedAt = webCpuCardItemNow();
      if (flow.timer) {
        flow.timerRemaining = Math.max(0, flow.timerDeadline - webCpuCardItemNow());
        clearTimeout(flow.timer);
        flow.timer = null;
        flow.timerDeadline = 0;
      }
      updateUI();
    }

    function resumeFlow() {
      if (!flow.isPaused || flow.isFinished) return;
      flow.isPaused = false;
      flow.status = 'running';
      flow.totalPaused += webCpuCardItemNow() - flow.pausedAt;
      flow.pausedAt = 0;

      if (flow.timerRemaining > 0 && flow.onTimerFire) {
        const fn = flow.onTimerFire;
        const remaining = flow.timerRemaining;
        flow.timerRemaining = 0;
        setFlowTimer(remaining, fn);
      } else if (flow.pendingSchedule) {
        flow.pendingSchedule = false;
        executeNext(flow.runId);
      }
      updateUI();
    }

    function onTogglePause() {
      if (flow.isFinished) return;
      if (flow.isPaused) resumeFlow(); else pauseFlow();
    }

    function onStop() {
      if (flow.isFinished) return;
      finishFlow('stopped');
      clearResult();
    }

    function onRestart() {
      location.reload();
    }

    function onClose() {
      if (flow.ui) { flow.ui.destroy(); flow.ui = null; }
      flow.isFinished = true;
      flow.isPaused = false;
      clearResult();
      resetTimerState();
      recover();
    }

    function clearResult() {
      if (typeof $ !== 'function') return;
      const selector = '.scriptPlayerMask .TemplateItem._task_container';
      const $container = $(selector);
      if (!$container.length) {
        console.warn(`[clearResult] 未找到目标容器: ${selector}`);
        return;
      }
      $container.html('');
      $container.css({
        'background-color': 'rgba(0, 0, 0, 0)',
        'backdrop-filter': 'blur(0px)',
        '-webkit-backdrop-filter': 'blur(0px)',
        'border-radius': '12px',
        'padding': '16px',
        'box-shadow': '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
        'border': '1px solid rgba(255, 255, 255, 0.18)',
        'margin-bottom': '16px',
        'color': '#fff'
      });
    }

    function recover() {
      if (typeof $ === 'function') $('.scriptPlayerMask').remove();
    }

    function finishFlow(status) {
      if (flow.isFinished) return;
      flow.isPaused = false;
      flow.isFinished = true;
      flow.status = status;
      flow.finalElapsedMs = getElapsedMs();
      resetTimerState();
      updateUI();

      const result = {
        status: status,
        totalTime: flow.finalElapsedMs,
        tasks: flow.arr,
        elem: flow.elem,
        completedSteps: flow.index
      };

      if (status === 'success') {
        console.log(`所有自动化步骤执行完毕，总耗时: ${result.totalTime}ms`);
      }

      if (typeof flow.onComplete === 'function') {
        try {
          flow.onComplete(result);
        } catch (e) {
          console.error('执行完成回调函数时出错:', e);
        }
      }
    }

    function resetRunState() {
      resetTimerState();
      flow.isPaused = false;
      flow.isFinished = false;
      flow.status = 'running';
      flow.index = 0;
      flow.lastOffset = 0;
      flow.currentItem = null;
      flow.pendingSchedule = false;
      flow.startedAt = webCpuCardItemNow();
      flow.pausedAt = 0;
      flow.totalPaused = 0;
      flow.finalElapsedMs = 0;
      flow.phase = 'delay';
    }

    function executeNext(runId) {
      if (runId !== flow.runId || flow.isFinished) return;

      if (flow.isPaused) {
        flow.pendingSchedule = true;
        return;
      }
      flow.pendingSchedule = false;

      if (flow.index >= flow.arr.length) {
        finishFlow('success');
        return;
      }

      const item = flow.arr[flow.index];
      flow.currentItem = item;
      flow.phase = 'delay';

      const absOffset = Math.max(0, Number(item.offset) || 0);
      const delayMs = Math.max(0, (absOffset - flow.lastOffset) * 1000);
      flow.lastOffset = absOffset;

      updateUI();

      setFlowTimer(delayMs, function () {
        if (runId !== flow.runId) return;
        item.start = webCpuCardItemNow();
        flow.phase = 'poll';
        checkAndExecute(runId, item);
      });
    }

    function checkAndExecute(runId, item) {
      if (runId !== flow.runId || flow.isFinished) return;

      let isConditionMet = true;
      if (typeof item.condition === 'function') {
        try {
          isConditionMet = !!item.condition(flow.elem);
        } catch (e) {
          console.error('条件判断出错:', e);
          isConditionMet = false;
        }
      } else if (item.condition !== undefined) {
        isConditionMet = !!item.condition;
      }

      if (isConditionMet) {
        flow.phase = 'execute';
        if (typeof _self.triggerTimeEventAsync === 'function') {
          _self.triggerTimeEventAsync(item, flow.elem, makeStepComplete(runId));
        } else {
          console.warn('[initTimeEvent] 未找到 triggerTimeEventAsync，直接跳到下一步');
          makeStepComplete(runId)();
        }
      } else {
        const retryMs = Math.max(0, Number(item.retryInterval || DEFAULT_RETRY_INTERVAL)) * 1000;
        console.warn(`步骤 ${flow.index + 1} 条件不满足，${retryMs / 1000}s 后重试...`, item);
        flow.phase = 'poll';
        setFlowTimer(retryMs, function () {
          if (runId !== flow.runId) return;
          checkAndExecute(runId, item);
        });
      }
    }

    function makeStepComplete(runId) {
      return function () {
        if (runId !== flow.runId || flow.isFinished) return;
        resetTimerState();
        flow.index++;
        flow.currentItem = null;
        executeNext(runId);
      };
    }

    function startRun() {
      if (flow.runId > 0) {
        resetDomState(flow.arr, flow.elem);
        clearAllInputs(flow.elem);
      }

      resetRunState();
      const runId = ++flow.runId;

      if (flow.arr.length === 0) {
        console.warn('[initTimeEvent] 任务列表为空，直接结束');
        finishFlow('success');
        return;
      }

      ensureUI();
      updateUI();
      executeNext(runId);
    }

    flow.pause = pauseFlow;
    flow.resume = resumeFlow;
    flow.stop = onStop;
    flow.restart = onRestart;
    flow.close = onClose;

    startRun();

    return flow;
  };


  webCpu.CardItem.Pagination = function (container, total, number, current, callback, flag) {
    this.container = container;
    this.total = total || 0;
    if (flag) {
      this.total = 100000000;
    }
    this.size = number || 10;
    this.flag = flag;
    this.count = Math.ceil(this.total / (this.size));
    this.current = current || 1;
    this.container.innerHTML = "";
    this.callback = callback;
    var nav = document.createElement("nav");
    this.container.appendChild(nav);
    this.nav = nav;
    $(nav).css({
      "line-height": "40px",
      "padding-left": "0px"
    })
    this.ul = document.createElement("ul");
    this.ul.setAttribute("class", "pagination pagination-sm");
    var label = document.createElement("div");

    label.innerHTML = '<label class="totalItemInfo" > ' + webCpu.messages[lang].totalTips + ': <span class="countValue">' + total + '</span>' + webCpu.messages[lang].dataUnit + '</label>\
                        <span style="margin-left: 5px; display: inline-block; vertical-align: middle;" class="pageNumberArea"></span>\
                        <label class="goToPageItem" style="margin-right: 5px;"><span>前往</span>\
                        <input value=' + (this.current) + ' class="pageNumber form-control form-control-sm" style="transform: scale(0.8); text-align: center; font-size: 14px; display: inline-block; color: #999; width: 70px;"/>页 \
                        <label><span>每页</span><select value=' + number + ' class="pageSize form-control form-control-sm" style="transform: scale(0.8); text-align: center; font-size: 14px; width: 70px; display: inline-block; color: #999;"></select>' + webCpu.messages[lang].dataUnit + '</label>'


    label.setAttribute("class", "DataTable_goBtnArea");
    label.style.display = "inline-block";
    label.style.verticalAlign = "middle";
    label.style.float = "left";
    this.ul.style.display = "inline-block";
    this.ul.style.margin = "0px";
    this.ul.style.verticalAlign = "middle";
    this.ul.style.float = "left";
    // nav.appendChild(this.ul);
    nav.appendChild(label);
    label.querySelector(".pageNumberArea").appendChild(this.ul);

    this.goBtnArea = label;
    var select = $(label).find("select.pageSize");
    var sizes = [10, 20, 50, 100];
    for (var i = 0; i < sizes.length; i++) {
      $("<option value=" + Number(sizes[i]) + ">" + sizes[i] + "</option>").appendTo(select);
    }
    if (!this.flag) {
      if (this.current > this.count) {
        this.current = this.count;
      }
      if (this.count < 1000) {
        this.initPageSelect();
      }
    } else {
      $(label).find(".goToPageItem").hide();
      $(label).find(".totalItemInfo").hide();
    }

    this.updatePages(this.current, this.size, this.flag);
  }
  webCpu.CardItem.Pagination.prototype.initPageSelect = function () {
    var select = $(this.nav).find("select.pageNumber");
    select.html("");
    for (var i = 0; i < this.count; i++) {
      $("<option>" + (i + 1) + "</option>").appendTo(select);
    }
  }

  webCpu.CardItem.Pagination.prototype.switchNextPage = function (flag) {
    var p = this.current + 1;
    if (p > Math.ceil(this.total / this.size) - 1) {
      if (typeof (this.callback) === "function") {
        var size = this.size || 10;
        this.callback(p, size, flag);
        this.updatePages(p, size, this.flag);
      }
    }
  }

  webCpu.CardItem.Pagination.prototype.updatePages = function (n, size, flag) {
    n = Number(n) || 0;
    this.size = size || this.size;
    this.count = Math.ceil(this.total / (this.size));
    this.initPageSelect();
    if (n < this.count + 1) {
      this.ul.innerHTML = "";
      this.current = n;

      if (!flag) {
        if (this.current < 5) {
          $(this.ul).append("<li  class='page-item active'><a class='page-link'>" + (this.current) + "</a></li>");
          for (var i = 1; i < this.current; i++) {
            $(this.ul).prepend("<li class='page-item'><a class='page-link'>" + (this.current - i) + "</a></li>");
          }
          if (this.current !== 1) {
            $(this.ul).prepend("<li class='page-item lastPageBtn'><a class='page-link'><i class='bi bi-chevron-left'></i></a></li>");
          } else {
            $(this.ul).prepend("<li class='page-item lastPageBtn disabled'><a class='page-link'><i class='bi bi-chevron-left'></i></a></li>");
          }
        } else {
          $(this.ul).prepend("<li class='page-item'><a class='page-link'>" + (this.current - 1) + "</a></li>");
          $(this.ul).prepend("<li class='page-item'><a class='page-link'>" + (this.current - 2) + "</a></li>");

          $(this.ul).prepend("<li class='page-item'><a class='page-link'>...</a></li>");

          $(this.ul).prepend("<li class='page-item'><a class='page-link'>1</a></li>");
          $(this.ul).prepend("<li class='lastPageBtn'><a class='page-link'><i class='bi bi-chevron-left'></i></a></li>");
        }

        if (this.count - this.current < 4) {
          for (var i = 1; i < this.count - this.current + 1; i++) {
            $(this.ul).append("<li class='page-item'><a class='page-link'>" + (this.current + i) + "</a></li>");
          }
          if (this.current !== this.count) {
            $(this.ul).append("<li class='page-item nextPageBtn'><a class='page-link'><i class='bi bi-chevron-right'></i></a></li>");
          } else {
            $(this.ul).append("<li class='page-item nextPageBtn disabled'><a class='page-link'><i class='bi bi-chevron-right'></i></a></li>");
          }
        } else {
          $(this.ul).append("<li class='page-item'><a class='page-link'>" + (this.current + 1) + "</a></li>");
          $(this.ul).append("<li class='page-item'><a class='page-link'>" + (this.current + 2) + "</a></li>");
          $(this.ul).append("<li class='page-item'><a class='page-link'>...</a></li>");
          $(this.ul).append("<li class='page-item'><a class='page-link'>" + this.count + "</a></li>");
          $(this.ul).append("<li class='page-item nextPageBtn'><a class='page-link'><i class='bi bi-chevron-right'></i></a></li>");
        }
      } else {
        $(this.ul).prepend("<li class='page-item lastPageBtn'><a class='page-link'><i class='bi bi-chevron-left'></i></a></li>");
        $(this.ul).append("<li class='page-item nextPageBtn'><a class='page-link'><i class='bi bi-chevron-right'></i></a></li>");
      }


      var _self = this;
      $(this.container).find("li>a").click(function () {
        var p = Number(this.innerHTML);
        if ($(this.parentElement).hasClass("nextPageBtn")) {
          p = _self.current + 1;
        } else if ($(this.parentElement).hasClass("lastPageBtn")) {
          p = _self.current - 1;
        } else if (this.innerHTML == "...") {
          p = (Number(this.parentNode.previousSibling.innerText) || 0) + 1;
        } else { }

        if (typeof (_self.callback) === "function") {
          var size = _self.size || 10;
          _self.callback(p, size);
          _self.updatePages(p, size, _self.flag);
        }

      });

      $(this.container).find(".pageNumber").val(n + "");

      $(this.container).find("select.pageNumber").on("change", function () {
        var value = Number($(this).val());
        var size = Number($(_self.container).find("select.pageSize").val()) || 10;
        _self.size = size;
        if (value !== NaN && value < _self.count + 1 && value > 0) {
          _self.callback(value, size);
          _self.updatePages(value, size, _self.flag);
        }
      });

      $(this.container).find("input.pageNumber").on("change", function () {
        var value = Number($(this).val());
        if (!value) {
          $(this).val(_self.current);
          return false;
        }
        var size = Number($(_self.container).find("select.pageSize").val()) || 10;
        if (value !== NaN && value < _self.count + 1 && value > 0) {
          _self.callback(value, size);
          _self.updatePages(value, size, _self.flag);
        }
      });

      $(this.container).find("select.pageSize").val(Number(size));
      $(this.container).find("select.pageSize").on("change", function () {
        var value = Number($(this).val());
        _self.callback(1, value);
        _self.updatePages(1, value, _self.flag);
      });
    }
  }



})();