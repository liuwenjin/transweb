webCpu.regComponent("MarkdownArticle", {
  css: "data:text/css;base64,Lk1hcmtkb3duQXJ0aWNsZSB7DQoJcGFkZGluZy1ib3R0b206IDMwcHggIWltcG9ydGFudDsNCn0NCg0KLk1hcmtkb3duQXJ0aWNsZSBoMSwNCi5NYXJrZG93bkFydGljbGUgaDIsDQouTWFya2Rvd25BcnRpY2xlIGgzIHsNCgltYXJnaW4tYm90dG9tOiAxNXB4Ow0KCW1hcmdpbi10b3A6IDIwcHg7DQp9DQoNCi5NYXJrZG93bkFydGljbGUgaDMgew0KCW1hcmdpbi10b3A6IDIwcHg7DQp9DQoNCi5NYXJrZG93bkFydGljbGUgdWwsDQouTWFya2Rvd25BcnRpY2xlIG9sIHsNCgltYXJnaW4tbGVmdDogMHB4Ow0KCW1hcmdpbi10b3A6IDEwcHg7DQoJbWFyZ2luLWJvdHRvbTogMTBweDsNCglwYWRkaW5nLWlubGluZS1zdGFydDogMjBweDsNCn0NCg0KLk1hcmtkb3duQXJ0aWNsZSB1bD5saSB7DQoJZm9udC13ZWlnaHQ6IDYwMDsNCn0NCg0KLk1hcmtkb3duQXJ0aWNsZT5wcmUsDQouTWFya2Rvd25BcnRpY2xlPnByZT5jb2RlIHsNCglmbG9hdDogbGVmdDsNCgl3aWR0aDogMTAwJTsNCgloZWlnaHQ6IGF1dG87DQoJcG9zaXRpb246IHJlbGF0aXZlOw0KfQ0KDQouTWFya2Rvd25BcnRpY2xlPnByZSB7DQoJbWFyZ2luLWJvdHRvbTogMzBweDsNCgliYWNrZ3JvdW5kLWNvbG9yOiAjZjhmOGY4Ow0KCW92ZXJmbG93OiBoaWRkZW47DQp9DQoNCi5NYXJrZG93bkFydGljbGUgYmxvY2txdW90ZSB7DQogIGJhY2tncm91bmQtY29sb3I6ICNmNWYyZjA7DQogIGJvcmRlci1sZWZ0OiA4cHggc29saWQgI2I0ZDVmZjsNCiAgZGlzcGxheTogYmxvY2s7DQogIGZvbnQtc2l6ZTogMTAwJTsNCiAgbGluZS1oZWlnaHQ6IDEuNTsNCiAgbWFyZ2luOiAxMHB4IDA7DQogIHBhZGRpbmc6IDEwcHgNCn0NCg0KLk1hcmtkb3duQXJ0aWNsZT5wcmU+Lm1pY3JvLWZyb250IHsNCgloZWlnaHQ6IDQwMHB4Ow0KfQ0KDQouTWFya2Rvd25BcnRpY2xlIC50aXRsZUl0ZW1BcmVhIHsNCgloZWlnaHQ6IDQwcHg7DQoJbGluZS1oZWlnaHQ6IDQwcHg7DQoJZGlzcGxheTogaW5saW5lLWJsb2NrOw0KCXdpZHRoOiAxMDAlOw0KCXBhZGRpbmc6IDBweCAxMHB4Ow0KfQ0KDQouTWFya2Rvd25BcnRpY2xlIC5jb2RlVHlwZVNwYW4gew0KCWNvbG9yOiAjODg4Ow0KfQ0KDQouTWFya2Rvd25BcnRpY2xlIC5jb3B5QnRuQXJlYSB7DQoJZmxvYXQ6IHJpZ2h0Ow0KfQ0KDQouTWFya2Rvd25BcnRpY2xlIC5jb3B5QnRuIHsNCgl0cmFuc2Zvcm06IHNjYWxlKDAuNyk7DQoJbWFyZ2luLXRvcDogNHB4Ow0KCW1hcmdpbi1yaWdodDogLTNweDsNCn0NCi5NYXJrZG93bkFydGljbGUgLmNvcHlUaXBzIHsNCglkaXNwbGF5OiBub25lOw0KCWZvbnQtc2l6ZTogMTJweDsNCn0NCg0KDQouTWFya2Rvd25BcnRpY2xlIHAgew0KCXdpZHRoOiAxMDAlOw0KCXdoaXRlLXNwYWNlOiBub3JtYWw7DQoJd29yZC1icmVhazogYnJlYWstYWxsOw0KfQ0KDQoNCi5NYXJrZG93bkFydGljbGUgaDQgew0KCW1hcmdpbi10b3A6IDMwcHg7DQoJbWFyZ2luLWJvdHRvbTogMTBweDsNCn0NCg0KLk1hcmtkb3duQXJ0aWNsZSBwcmU+Y29kZSAuQ2FyZEl0ZW1fY29tcG9uZW50QXJlYVttb3VsZG5hbWU9Q29kZUVkaXRvcl0gew0KCW1hcmdpbi10b3A6IC00MHB4Ow0KfQ=="
}, function (container, data, task) {
  function transMarkdown(mArea, data, option) {
    var option = option || {
      parseImgDimensions: true,
      tables: true,
      smoothLivePreview: true,
      tablesHeaderId: true,
      ghCodeBlocks: true,
      tasklists: true
    }
    var converter = new showdown.Converter(option);
    $(mArea).html(converter.makeHtml(data));
    var codes = $(mArea).find("pre");

    for (let i = 0; i < codes.length; i++) {
      let elem = codes.eq(i).children("code")[0];
      let code = elem.innerText;
      let arr = elem.classList;
      if (code.search(/^\</) !== -1 || arr.length === 0) {
        arr = ["html"];
      }

      viewCode(elem, code, arr);
    }

    $(mArea).find("table").addClass("table table-bordered table-hover");

    $(mArea).find("img").css("max-width", "100%");
    $(mArea).find("img").css("max-height", "100%");

    $(mArea).find("img").parent().css("text-indent", "0px");

    var links = $(mArea).find("a");
    for (var i = 0; i < links.length; i++) {
      var tLink = links.eq(i);
      if (tLink.attr("target") === "_mask") {
        tLink.on("click", function () {
          var url = $(this).attr("href");
          var backup = url;
          if (url.match(/.txt$/) || url.match(/.md$/)) {
            url = Interface.article;
          }
          var title = $(this).attr("title") || "链接内容";
          var param = $(this).attr("param") || "";

          var pCard = getRightMaskCard();

          cardDialog(pCard, url, title, {
            width: "98%",
            "max-width": 800,
            height: "98%",
            padding: "20px 10px 0px 10px"
          }, function (c, d, t) {
            if (backup != url) {
              d.task.url = backup;
            }
            d.task._param = param;
          });

          return false;
        })
      } else if (tLink.attr("target") === "_switch") {
        tLink.on("click", function () {
          var body = $(mArea).parent().parent().parent().parent().attr("cardname");
          var cardName = $(mArea).parent().parent().parent().parent().attr("cardname") || "";
          if (cardName && webCpu.cards[cardName] && webCpu.cards[cardName].task) {
            var url = $(this).attr("href");
            webCpu.cards[cardName].task.url = url;
            webCpu.CardItem.fresh(webCpu.cards[cardName]);
          }
          return false;
        });
      } else if (tLink.attr("download") !== undefined) {
        tLink.on("click", function (e) {
          e.preventDefault();
          var url = $(this).attr("href");
          if (!url) {
            return true;
          }
          var t = url.split(".");
          var subfix = t[t.length - 1] || "js";
          if (subfix === "js") {
            var name = $(this).attr("download") || "Transweb文档";
          } else {
            var name = $(this).attr("download") || "Transweb程序";
          }

          WebTool.downLoadByUrl(url, name);
          return false;
        });
      } else {
        tLink.attr("target", "_blank");
      }
    }

    $(mArea).find("a[indent=ignore]").parent().css("text-indent", "0px");
    $(mArea).find("span[indent=ignore]").parent().css("text-indent", "0px");
  }
  transMarkdown(container, data);

  container.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth",
  })

  function viewCode(elem, code, arr) {
    let codeType = arr[0] || "code";
    let tArr = codeType.split("-");
    if(tArr.length > 1) {
      codeType = tArr[tArr.length - 1];
    }
    let modeMap = {
      "java": "text/x-java",
      "c": "text/x-csrc",
      "c++": "text/c++src",
      "objectivec": "text/x-objectivec",
      "scala": "text/x-scala",
      "kotlin": "text/x-kotlin",
      "ceylon": "text/x-ceylon"
    }
    let mode = modeMap[codeType] || codeType;
    let radio = task.transformRadio || 1;
    $(elem.parentNode).css({
      height: $(elem.parentNode).height() /radio + 80 + "px"
    });
    
    setTimeout(function () {
      let app = {
        className: "CodeEditor",
        title: `<div class="titleItemArea"><span class="codeTypeSpan">${codeType || "javascript"}</span><span class='copyBtnArea'><span class='copyTips text-success'>已复制</span><button type="button" class="copyBtn btn btn-outline-info btn-sm">复制</button></span></div>`,
        dsl: {
          data: code,
          optionMode: "replace",
          codeNative: true,
          options: {
            mode: mode,
            gutters: ["CodeMirror-linenumbers",
              "CodeMirror-foldgutter"
            ],
            readOnly: true,
            autofocus: false
          },
          promise: {
            afterRender: function (c, d, t) {
              $(t.titleArea).find(".copyBtn").on("click", function () {
                WebTool.copyString(t.data);
                $(t.titleArea).find(".copyTips").show();
                $(t.titleArea).find(".copyBtn").hide();
                setTimeout(function () {
                  $(t.titleArea).find(".copyTips").hide();
                  $(t.titleArea).find(".copyBtn").show();
                }, 3000);
              })
            }
          }
        }
      };
      let tApp = {
        className: "TemplateItem",
        task: {
          promise: {
            afterRender: function (cc, dd, tt) {
              app.dsl.style = {
                height: $(elem.parentNode).height() * radio + "px",
                position: "absolute",
                transform: `scale(${1 / radio})`,
                transformOrigin: "0 0",
                width: `${100 * radio}%`
              };
              webCpu.updateView(cc, app, app.dsl, "DSL");
            },
          },
        },
      };
      webCpu.updateView(elem, tApp);
    }, 200);
  }


  var selector = $(container).find(".micro-front");
  selector.parent().css("overflow", "hidden");
  try {
    for (let i = 0; i < selector.length; i++) {
      let elem = selector[i];
      let temp = $(elem).text();
      let app = eval(`(${temp})`);
      webCpu.updateView(elem, app, app.dsl, "DSL");
    }

  } catch (e) {
    console.log(e);
  }
});