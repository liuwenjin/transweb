golaxy_line({
  "className": 'BaiduChartItem',
  "task": {
    "style": {
      "padding": '5px'
    },
    "option": {
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: []
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        data: [],
        type: 'line',
        areaStyle: {}
      }]
    },
    data: [{
      name: "Mon",
      value: 820
    }, {
      name: "Tue",
      value: 932
    }, {
      name: "Wed",
      value: 901
    }, {
      name: "Thu",
      value: 934
    }, {
      name: "Fri",
      value: 1290
    }, {
      name: "Sat",
      value: 1330
    }, {
      name: "Sun",
      value: 1320
    }],
    "promise": {
      "beforeRender": function (container, data, task) {
        task.option.series[0].data = [];
        task.option.xAxis.data = [];
        data.map(function(item) {
          task.option.series[0].data.push(item.value);
          task.option.xAxis.data.push(item.name);
        });
      },
      "afterRender": function (container, data, task) {

      }
    },
    "url": '',
    "requestType": 'get',
    "dataType": 'json'
  }
});