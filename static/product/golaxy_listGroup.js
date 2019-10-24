golaxy_listGroup({
  "className": 'ListGroup',
  "cardName": 'microIndex',
  "title": '测试',
  "task": {
    "option": {
      "style": {
        "border": 'solid 1px #f2f2f2',
        "border-radius": '5px',
        "display": 'inline-block',
        "margin": '5px',
        "width": 'calc( 50% - 10px )'
      }
    },
    "data": [{
      "title": 'Echarts可视化组件',
      "badge": 32
    }, {
      "title": 'D3可视化图表'
    }, {
      "title": 'Cesium可视化',
      "description": '虽然不总是必须，但是某些时候你可能需要将某些 DOM 内容放到一个盒子里',
      "image": 'https://live.staticflickr.com/3866/14420309584_78bf471658_b.jpg'
    }, {
      "title": 'ThreeJS可视化'
    }, {
      "title": '布局组件'
    }, {
      "title": '其它'
    }],
    "promise": {
      "beforeRender": function(container, data, task) {


      }
    }
  },
  "appUrl": 'product/golaxy_listGroup.js'
});