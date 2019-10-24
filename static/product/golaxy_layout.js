golaxy_layout({
  "task": {
    "style": {
      "padding": '5px'
    },
    "option": {
      "appMap": {
        "centerArea": {
          "url": 'product/golaxy_3dMapBasic.js',
          "key": 'golaxy_3dMapBasic'
        },
        "topArea": '',
        "leftArea": {
          "url": 'product/golaxy_gridLayout.js',
          "key": 'golaxy_gridLayout'
        },
        "rightArea": {
          "url": 'product/golaxy_gridLayout.js',
          "key": 'golaxy_gridLayout'
        }
      },
      "appCallback": {
        "centerArea": function(state) {

        },
        "topArea": function(state) {

        },
        "leftArea": function(state) {

        },
        "rightArea": function(state) {

        }
      }
    },
    "initArea": function(areaName, afterRender) {
      var app = this.option.appMap[areaName];
      var elem = this[areaName];
      var callback = this.option.appCallback[areaName];
      if (app && app.url && app.key && elem) {
        webCpu.addCardItem(elem, app.url, {
          key: app.key,
          callback: callback
        }, function(c, d, t) {
          if (typeof(afterRender) === "function") {
            afterRender(c, d, t);
          }
        });
      }

    },
    "template": '<div style="position: relative; width: 100%; height: 100%"><div style="width: 100%; height: 100%; position: absolute"><div class="layoutCenterArea" style="width: 100%; height: 100%; background-color: #f2f2f2; ">{{test}}</div></div><div class="layoutTopArea" style="z-index: 999; background-color: rgba(255, 244, 244, 0.8); width: 100%; height: 60px; position: relative; box-shadow: 0px -1px 0px inset #999;"></div><div class="layoutLeftArea" style="overflow: auto; z-index: 999; background-color: rgba(244, 255, 244, 0.8); width: 200px; height: calc( 100% - 60px ); position: relative; float: left;">left area</div><div class="layoutRightArea" style="z-index: 999; overflow: auto; background-color: rgba(244, 244, 255, 0.8);  width: 200px; height: calc( 100% - 60px ); position: relative; float: right;"></div></div>',
    "data": {
      "test": 'Hello world'
    },
    "promise": {
      "beforeRender": function(container, data, task) {},
      "afterRender": function(container, data, task) {
        task.centerArea = $(container).find(".layoutCenterArea")[0];
        task.topArea = $(container).find(".layoutTopArea")[0];
        task.leftArea = $(container).find(".layoutLeftArea")[0];
        task.rightArea = $(container).find(".layoutRightArea")[0];
        task.initArea("leftArea", function() {
          task.initArea("rightArea");
        });

      }
    },
    "url": '',
    "requestType": 'get',
    "dataType": 'json'
  },
  "appUrl": 'product/golaxy_layout.js'
});