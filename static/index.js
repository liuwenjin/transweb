transweb_cn({
  routerOption: {
    "index": {
      "url": "modules/index.js",
      "children": {
        "testA": webCpu.plugin.bookList
      },
      "callback": function (c, d, t) {
        d.titleData.title = webCpu.initData.title;
        d.titleData.menu = [];
        var _index = [];
        for(var k in this.menuData) {
          if(k === "_index") {
            _index = this.menuData[k];
            continue;
          }
          var item = {
            name: k,
            children: []
          }
          var children = this.menuData[k];
          if(children && children.length > 0) {
            for(var i = 0; i < children.length; i++) {
              var tItem = {
                name: children[i].name,
                key: children[i].key,
                callback: function(d) {
                  console.log(d);
                  var key = this.key;
                  var card = webCpu.cards.testA;
                  card.breadcrumb = [d.name, this.name];
                  card.task.query.current = key;
                  webCpu.CardItem.fresh(card);
                }
              }
              item.children.push(tItem);
            }
          }
          d.titleData.menu.push(item);
          
        }
        d.titleData.menu.sort(function(a, b) {
          var v1 = _index.indexOf(a.name);
          var v2 = _index.indexOf(b.name);
          return v2 - v1;
        });
        var mData = d.titleData.menu;
        if(mData[0] && mData[0].children && mData[0].children[0]) {
          webCpu.initData.breadcrumb = [mData[0].name];
          if(mData[0].children.length > 0) {
            webCpu.initData.breadcrumb.push(mData[0].children[0].name);
            webCpu.interface.bookManager.query.current = mData[0].children[0].key;
          }
        }
        else {

        }
      }
    },
    "moduleA": {
      "url": "modules/moduleA.js",
      "callback": function (c, d, t) {
        
      }
    },
    "moduleB": {
      "url": "modules/moduleB.js",
      "callback": function (c, d, t) {
        
      }
    }
  }
});