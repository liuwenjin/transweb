transweb_bookItems({
  "className": 'ListGroup',
  task: {
    style: {
      "padding-top": "10px"
    },
    option: {
      max: 120,
      min: 150,
      template: "<div style='position: relative; width: 100%; height: 100%;'><div style='float: left; width: 60px; height: 100%; border: solid 1px #f2f2f2;'></div>\
                  <div style='float: left; padding-left: 10px; display: block; position: relative; align-items: flex-start; width: calc( 100% - 60px );  overflow: hidden; height: 100%;'>\
                    <h3 style='width: 100%; margin: 0px; font-size: 14px;'>{{title}}</h3><p style='margin: 0px;'>作者:<span>{{author}}</span></p><p style='margin: 0px;'>{{description}}</p>\
                  </div></div>",
      style: {
        display: "inline-block",
        "vertical-align": "top",
        width: "33.3%",
        height: "100px",
        border: "solid 1px #f2f2f2",
        "border-radius": "5px"
      }
    },
    data: [{
      title: "信徒圣经注释（旧约）",
      author: "",
      description: "那节经文是什么意思？我该如何解释这段经文？关于一部圣经书卷的作者、历史背景和主要特点的资料如何帮助我解释这本书？"
    }, {
      title: "生命宝训注释系列——马可福音",
      author: "D•爱德蒙•希伯特",
      description: "D•爱德蒙•希伯特（D. Edmond Hiebert）在本书中对马可福音的本文作了细致的研究，同时也关注希腊原文的意义，所使用的写作方式使不熟悉原文的学生都可以明白。"
    }, {
      title: "活泉新约希腊文解经",
      description: "罗伯逊博士（Dr. A. T. Robertson）著作的《活泉新约希腊文解经》全十册是一套卓越的参考资料，使那些想要更深入明白新约圣经原文的人受益匪浅。"
    }, {
      title: "斯特朗经文汇编",
      description: "一个人即使没有对原文的知识，仍然可以使用本书的数字系统在原文中搜索词汇索引，从而找到选定词汇在希腊文或希伯来原文中所在的所有经节。"
    }, {
      title: "新约精览",
      description: "这本颇有助益的新约综览书包含了大量有用的图表和地图，可以帮助读者作个人性的第一手研究，因而必会打开你认知新约的眼界。"
    }, {
      title: "圣经研读大纲",
      description: "这套详尽的资料将圣经的每一节经文以大纲形式展现，易读易记，非常适合教师、牧者，以及那些希望以轻松易记的方式讲解圣经的人。"
    }, {
      title: "生命宝训注释系列——罗马书（全四册）",
      description: "“博爱思的注释系列堪称教会和牧者的珍宝，对于任何一位释经式讲道者来说，都是不可或缺的。”——R.C.斯普劳尔（R. C. Sproul）"
    }, {
      title: "圣经串珠宝库",
      description: "本参考著作包括超过50万参考经节和平行经文，容纳了最详尽的圣经串珠资料，对牧者理解和阐释经文大有裨益。"
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