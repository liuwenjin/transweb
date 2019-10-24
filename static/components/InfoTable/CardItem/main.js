(function () {
  var config = {
    html: "layout.html",
    css: "style.css"
  }
  webCpu.regComponent("CardItem", config, function (container, data, task) {
    if (!data.title) {
      $(container).find(".CardItem_titleArea").hide();
      $(container).find(".CardItem_componentArea").css("top", "0px");
    }
    if (data.border && (webCpu.cards && webCpu.cards.transweb && webCpu.cards.transweb.task.current === "preview")) {
      $(container).css("border", data.border);
    }
    if (data.padding && (webCpu.cards && webCpu.cards.transweb && webCpu.cards.transweb.task.current === "preview")) {
      $(container).children(".CardItem_contentArea").children(".CardItem_content").children(".CardItem_componentArea").css("padding", data.padding);
    }
    if(data.background) {
      $(container).children(".CardItem_contentArea").css("background", data.background);
    }
    
    if ((!$(container.parentNode).hasClass("TableLayout_container")) || !task.unit || ($(container.parentNode).attr("flag")==="activeArea")) {
      $(container).css("width", "100%");
      $(container).css("height", "100%");
    }
    else  {
      if(!data.size) {
        data.size = [Math.ceil(webCpu.layout.options.width/3), Math.ceil(webCpu.layout.options.height/3)];
      }
      
      var tWidth = data.size[0] * task.unit[0];
      var tHeight = data.size[1] * task.unit[1];
      if(webCpu.cards.transweb.task.current !== "preview") {
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
    data.task.container = $(container).find(".CardItem_componentArea")[0];
    data.task.cardName = data.cardName || "anonymous";
    if (data.task.busIn && data.cardName) {
      webCpu["CardItem"].message = webCpu["CardItem"].message || {};
      webCpu["CardItem"].message[data.cardName] = webCpu["CardItem"].message[data.cardName] || {}
    }

    webCpu["CardItem"].fresh(data);

    if (data.style) {
      for (var k in data.style) {
        $(data.task.container.parentNode).css(k, data.style[k]);
      }
    }


    if (data.cardName) {
      $(container).attr("cardName", data.cardName);
    }
    task.body = container;

    if (task.mode === "edit") {
      $(container).find(".CardItem_modifyArea").show();
      $(container).find(".CardItem_mask").hide();
    } else if (task.mode === "freeze") {
      $(container).find(".CardItem_modifyArea").hide();
      $(container).find(".CardItem_mask").show();
    } else {}
  });

  webCpu["CardItem"].message = {};
  webCpu["CardItem"].tips = {
    empty: "暂无数据",
    loading: "正在加载",
    error: "出现异常"
  }

  webCpu["CardItem"].switchMask = function (data, state, n) {
    webCpu["CardItem"].switchMaskStyle(data, {
      width: "100%",
      height: "100%",
      top: "0px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    });
    webCpu["CardItem"]._switchMask(data, state, n);
  }

  webCpu["CardItem"]._switchMask = function (data, state, n) {
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
    var tipsArea = $(task.cardBody).children(".CardItem_contentArea").children(".CardItem_mask");
    tipsArea.html(str);
    tipsArea.show();
    tipsArea.find(".CardItem_stateTips").html(tips);
    if (typeof (n) === "number") {
      setTimeout(function () {
        tipsArea.hide();
      }, n * 1000);
    } else if (typeof (n) === "object" && n.task) {
      n.container = $(task.container).parent().parent().children(".CardItem_mask")[0];
      webCpu.render(n.className || "TemplateItem", n.task);
    } else if (typeof (n) === "object" && !n.task) {
      if (n.type === "message") {
        tipsArea.find(".btn-default").hide();
      }
      if (n.rightBtnName) {
        tipsArea.find(".btn-default").html(n.rightBtnName);
      }
      if (n.leftBtnName) {
        tipsArea.find(".btn-primary").html(n.leftBtnName);
      }
      if (n.message) {
        $(task.container).parent().parent().children(".CardItem_mask .CardItem_stateTips").html(n);
      }
    } else if (n !== undefined) {
      $(task.container).parent().parent().children(".CardItem_mask").html(n);
    } else {}
    return tipsArea[0];
  }

  webCpu["CardItem"].switchMaskStyle = function (data, style) {
    var task = data.task || data;
    if (task.cardBody) {
      var mask = $(task.cardBody).children(".CardItem_contentArea").children(".CardItem_mask");
      for (var k in style) {
        mask.css(k, style[k]);
      }
    }

  }

  webCpu["CardItem"].setForbidArea = function (data, tips, style) {
    webCpu["CardItem"].switchMaskStyle(data, style);
    webCpu["CardItem"]._switchMask(data, "html", "");
    var task = data.task || data;
    if (task.cardBody) {
      var mask = $(task.cardBody).children(".CardItem_contentArea").children(".CardItem_mask");
      mask.attr("title", tips);
    }
  }

  webCpu["CardItem"].cancelForbidArea = function (data) {
    webCpu["CardItem"].dismissMask(data);
    var task = data.task || data;
    if (task.cardBody) {
      var mask = $(task.cardBody).children(".CardItem_contentArea").children(".CardItem_mask");
      mask.attr("title", "");
    }
  }

  webCpu["CardItem"].dismissMask = function (data) {
    var task = data.task || data;
    if (task.cardBody) {
      var tipsArea = $(task.cardBody).children(".CardItem_contentArea").children(".CardItem_mask");
      tipsArea.hide();
    }
  }

  webCpu["CardItem"].checkData = function (data) {
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


  webCpu["CardItem"].switchState = function (data, state) {
    if (!data.task.container) {
      return false;
    }
    var t = $(data.task.container).parent().parent().parent().find(".CardItem_stateTemplate");
    var c = ".CardItem_template_" + state;
    var tips = this.tips[state];
    if (data.tips && data.tips[state]) {
      tips = data.tips[state];
    }
    var str = t.find(c).val();
    var tipsArea = $(data.task.container);
    tipsArea.html(str);
    tipsArea.find(".CardItem_stateTips").html(tips);
  }

  webCpu["CardItem"].waiting = function (data) {
    var str = $(data.task.container).parent().parent().parent().find(".CardItem_loading").html();
    $(data.task.container).html(str);
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

  webCpu["CardItem"].maskDialog = function (card, objectCard, title, h) {
    var h = h || 30;
    var htmlString = "<div style='position: relative; width: 100%; height: 100%;'>\
                        <div style='position:relative; display: inline-block;  background-color: #fff; overflow:auto; width: 100%; height:" + h + "px; text-align: center;'>\
                          <span style='position: absolute; left: 0px; top: 50%; margin-top: -11px; display: inline-block; width: 30px; padding: 2px; vertical-align: middle; text-align: center; cursor: pointer;' class='glyphicon glyphicon-chevron-left'></span>\
                          <span style='position: absolute; left: 25%; top: 50%; margin-top: -11px; width: 50%; display: inline-block; padding: 2px; vertical-align: middle; text-align: center; '>" + title + "</span>\
                        </div>\
                        <div style='float: left; position:absolute; overflow:auto; width: 100%; top: "+ h +"px; bottom:0px;' class='maskContentArea'></div>\
                      </div>";
    var task = card.task || card;
    if (!task.cardBody) {
      return false;
    }
    var maskSelector = $(task.cardBody).children(".CardItem_contentArea").children(".CardItem_mask");
    maskSelector.html(htmlString);
    maskSelector.show();
    var _self = this;
    maskSelector.find(".glyphicon-chevron-left").on("click", function () {
      _self.dismissMask(card);
    });
    if (objectCard) {
      var mArea = maskSelector.find(".maskContentArea")[0];
      webCpu.addCardItem(mArea, objectCard);
    }
  }
  webCpu["CardItem"].previewCard = function(container, card, size) {
    if(!webCpu.cards.previewTool) {
      return false;
    }
    webCpu.cards.previewTool.task.size = size;
    webCpu.cards.previewTool.task.card = card;
    webCpu.addCardItem(container, webCpu.cards.previewTool);
  } 


  webCpu["CardItem"].fresh = function (data) {
    webCpu["CardItem"].updateCardLayout(data);
    if (!data.inactive || $("#tModalDialog").attr("state") === "previewCardItem") {
      webCpu["CardItem"]._fresh(data);
    } else if (data.sketch) {
      $(data.task.container).html('<div class="CardItem_sketch"><img src="#" /></div>');
      $(data.task.container).find(".CardItem_sketch>img").attr("src", data.sketch);
      $(data.task.container).find(".CardItem_sketch>img").attr("alt", data.title || data.cardName);
    } else {}
  }

  webCpu["CardItem"]._fresh = function (data) {
    if (data.task._url) {
      data.task.url = data.task._url;
    }
    if (data.task.container) {
      var flag = $(data.task.container.parentElement.parentElement.parentElement.parentElement).hasClass("TableLayout_container");
    } else {
      return false;
    }
    if (checkCardItem(data) || !flag) {
      for (var k in data.task.busIn) {
        var msg = webCpu.CardItem.message[data.cardName][k];
        data.task.outerData = data.task.outerData || {};
        for (var m in msg) {
          data.task.outerData[m] = msg[m];
        }
      }
      data.task.cardBody = data.task.container.parentNode.parentNode.parentNode;
      webCpu.render(data.className || "TemplateItem", data.task, data.componentPath || this.config.path);
    }
  }

  webCpu["CardItem"].updateCardLayout = function(data) {
    if (data.cardName === "cardWarehouse" || !data.task.container || !data.task.container.parentNode) {
      return false;
    }
    var container = data.task.container.parentNode;
    if(!data.title) {
      $(container).children(".CardItem_titleArea").hide();
      $(container).children(".CardItem_componentArea").css("padding-top", "0px");
    }
    else {
      var h = data.titleHeight || 23;
      $(container).children(".CardItem_componentArea").css("padding-top", h);
      $(container).children(".CardItem_titleArea").css("height", h);
      $(container).children(".CardItem_titleArea").show();
    }

    if(!data.foot) {
      $(container).children(".CardItem_footArea").hide();
      $(container).children(".CardItem_componentArea").css("padding-bottom", "0px");
    }
    else {
      var h = data.footHeight || 23;
      $(container).children(".CardItem_footArea").css("height", h);
      $(container).children(".CardItem_componentArea").css("padding-bottom", h);
      $(container).children(".CardItem_footArea").show();
    }
  }

  webCpu["CardItem"].updateTitle = function (data) {
    if (data.cardName === "cardWarehouse" || !data.task.container || !data.task.container.parentNode) {
      return false;
    }
    var container = data.task.container.parentNode;
    if (!data.title) {
      $(container).children(".CardItem_titleArea").hide();
      $(container).children(".CardItem_componentArea").css("top", "0px");
    } else {
      $(container).children(".CardItem_titleArea").show();
      var h = $(container).children(".CardItem_titleArea").height();
      $(container).children(".CardItem_componentArea").css("top", h);
      $(container).children(".CardItem_titleArea").html(data.title);
      $(container).children(".CardItem_titleArea").attr("title", data.title);
    }
  }

  webCpu["CardItem"].recoverCard = function (data) {
    if (data.task._data) {
      data.task.data = WebTool.copyObject(data.task._data);
    }
    data.task._url = data.task.url;
    delete data.task.url;
    data.inactive = false;
    // task.data.task.container.innerHTML = "";
    webCpu.render(data.className || "TemplateItem", data.task, data.componentPath || this.config.path);
    data.task.url = data.task._url;
  }


  webCpu["CardItem"].dialog = function (data, options, closePromise) {
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
      webCpu["ModalDialog"].displayComponent(options.title || "预览卡片", "CardItem", task, options);
      task.data.task.container = t.container;
      task = null;
    });
  }

  webCpu["CardItem"].updateByRemoteData = function (data, url, query) {
    if (url) {
      data.task.url = url;
    }
    data.inactive = false;
    data.task.container.innerHTML = "";
    data.task.query = query || data.task.query;
    webCpu.render(data.className || "TemplateItem", data.task, data.componentPath || this.config.path);
  }


})();