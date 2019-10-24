golaxy_gridLayout({
  "className": 'GridLayoutItem',
  "cardName": 'testGridItem',
  "task": {
    "style": {
      "padding": '5px'
    },
    "option": {
      "dragEnabled": true
    },
    "data": [{
      "text": 'Mon',
      style: {
      	height: "160px"
      }
    }, {
      "text": 'Tue'
    }, {
      "text": 'Wed'
    }, {
      "text": 'Thu'
    }, {
      "text": 'Fri'
    }, {
      "text": 'Sat'
    }, {
      "text": 'Sun'
    }],
    "promise": {
      "beforeRender": function(container, data, task) {

      },
      "afterRender": function(container, data, task) {

      }
    },
    "url": '',
    "requestType": 'get',
    "dataType": 'json'
  },
  "appUrl": 'product/golaxy_gridLayout.js'
});