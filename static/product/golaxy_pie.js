golaxy_pie({
  "className": 'BaiduChartItem',
  "task": {
    "style": {
      "padding": '5px'
    },
    "option": {
      "tooltip": {
        "trigger": 'item',
        "formatter": '{a} <br/>{b} : {c} ({d}%)'
      },
      "legend": {
        "bottom": 10,
        "left": 'center',
        "data": []
      },
      "series": [{
        "type": 'pie',
        "radius": '65%',
        "center": ['50%', '50%'],
        "selectedMode": 'single',
        "data": [],
        "itemStyle": {
          "emphasis": {
            "shadowBlur": 10,
            "shadowOffsetX": 0,
            "shadowColor": 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    },
    "data": [{
      "value": 535,
      "name": '荆州'
    }, {
      "value": 510,
      "name": '兖州'
    }, {
      "value": 634,
      "name": '益州'
    }, {
      "value": 735,
      "name": '西凉'
    }],
    "promise": {
      "beforeRender": function(container, data, task) {
        task.option.legend.data = [];
        for (var i = 0; i < data.length; i++) {
          task.option.legend.data.push(data[i].name);
        }
        task.option.series[0].data = data;
      },
      "afterRender": function(container, data, task) {

      }
    },
    "url": '',
    "requestType": 'get',
    "dataType": 'json'
  },
  "appUrl": 'product/golaxy_pie.js'
});