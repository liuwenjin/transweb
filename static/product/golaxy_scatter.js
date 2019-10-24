golaxy_scatter({
  "className": 'BaiduChartItem',
  "task": {
    "style": {
      "padding": '5px'
    },
    "option": {
    xAxis: {},
    yAxis: {},
    series: [{
        symbolSize: 20,
        data: [
            
        ],
        type: 'scatter'
    }]
},
    "data":[[10.0, 8.04],
            [8.0, 6.95],
            [13.0, 7.58],
            [9.0, 8.81],
            [11.0, 8.33],
            [14.0, 9.96],
            [6.0, 7.24],
            [4.0, 4.26],
            [12.0, 10.84],
            [7.0, 4.82],
            [5.0, 5.68]],
    "promise": {
      "beforeRender": function(container, data, task) {
        task.option.series[0].data = data;
        
      },
      "afterRender": function(container, data, task) {

      }
    },
    "url": '',
    "requestType": 'get',
    "dataType": 'json'
  },
  "appUrl": 'product/golaxy_scatter.js'
});