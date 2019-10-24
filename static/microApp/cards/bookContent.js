transweb_bookContent({
  "className": 'ListMenu',
  title: "<span style='font-size: 12px; padding-left: 15px; color: #313945'>Book Content</span>",
  titleStyle: {
	  "box-shadow": "0px -1px 0px inset #f2f2f2"
  },
  "style": {
	  // "background": "linear-gradient(to bottom, rgb(219, 231, 237),rgb(166, 188, 225))"
  },
  task: {
    style: {
      "padding-top": "10px"
    },
    data: [{
      title: "同类选举政党势力模型",
    }, {
      title: "民调机构倾向性分析模型",
    }, {
      title: "几率分派模型",
    }, {
      title: "选区惯性模型",
      
    }, {
      title: "异类选举政党势力模型",
      
    }, {
      title: "机构效应系数动向分析模型",
     
    }],
    clickCallback: function (d) {

    },
    prefix: "product/",
    highLight: function (i) {
      $(this.container).find(".panel").attr("active", false);
      $(this.container).find(".panel").eq(i).attr("active", true);
    },
    updateAction: function (d) {
      var _self = this;
      var action = function (e, tData) {
        var index = $(e.currentTarget).attr("index");
        _self.highLight(index);
        var tData = _self.data[index];
        if (typeof (_self.clickCallback) === "function") {
          _self.clickCallback(index, tData);
        }
      };
      if (d && d.constructor.name === "Array") {
        for (var i = 0; i < d.length; i++) {
          this.updateAction(d[i]);
        }
      } else {
        d.action = function (e) {
          action(e, d);
        }
      }
      if (d.content) {
        this.updateAction(d.content);
      }
    },
    promise: {
      beforeRender: function (container, data, task) {
        task.updateAction(data);
      },
      afterRender: function (container, data, task) {
        task.highLight(0);
        // $(container).on("click", function(){
        //   webCpu.CardItem.dialog(webCpu.cards[task.cardName]);
        // });
      }
    }
  }
});