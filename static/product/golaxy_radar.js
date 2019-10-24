golaxy_radar({
  "className": 'BaiduChartItem',
  "cardName": "myTestChartItem",
  "task": {
    "style": {
      "padding": '5px'
    },
    "option": {
      "tooltip": {},
      "legend": {
        "data": []
      },
      "radar": {
        "name": {
          "textStyle": {
            "color": '#fff',
            "backgroundColor": '#999',
            "borderRadius": 3,
            "padding": [3, 5]
          }
        },
        "indicator": []
      },
      "series": [{
        "type": 'radar',
        "data": []
      }]
    },
    "data": [{
      "name": '实际开销（Actual Spending）',
      "items": [{
        "name": '管理（Administrator）',
        "value": 4300
      }, {
        "name": '销售（Marketing）',
        "value": 10000
      }, {
        "name": '信息技术（Information Techology）',
        "value": 28000
      }, {
        "name": '客服（Customer Support）',
        "value": 35000
      }, {
        "name": '研发（Development）',
        "value": 50000
      }, {
        "name": '市场（Marketing）',
        "value": 19000
      }]
    }, {
      "name": '预算分配（Allocated Budget）',
      "items": [{
        "name": '管理（Administrator）',
        "value": 5000
      }, {
        "name": '销售（Marketing）',
        "value": 14000
      }, {
        "name": '信息技术（Information Techology）',
        "value": 28000
      }, {
        "name": '客服（Customer Support）',
        "value": 31000
      }, {
        "name": '研发（Development）',
        "value": 42000
      }, {
        "name": '市场（Marketing）',
        "value": 21000
      }]
    }],
    "promise": {
      "beforeRender": function(container, data, task) {
        task.option.legend.data = [];
        task.option.series[0].data = [];
        task.option.radar.indicator = [];
        for(var k in data) {
          var item = data[k];
          task.option.legend.data.push(item.name);
          var d = {
            name: item.name,
            value: []
          };
          task.option.radar.indicator = task.option.radar.indicator || new Array(item.items.length);
          for (var i = 0; i < item.items.length; i++) {
            if (!task.option.radar.indicator[i]) {
              task.option.radar.indicator[i] = {
                name: item.items[i].name,
                max: item.items[i].value
              };
            } 
            if (task.option.radar.indicator[i] && task.option.radar.indicator[i].max < item.items[i].value) {
              task.option.radar.indicator[i].max = item.items[i].value;
            } else {}

            d.value.push(item.items[i].value);
          }
          task.option.series[0].data.push(d);
         }
      },
      "afterRender": function(container, data, task) {

      }
    },
    "url": '',
    "requestType": 'get',
    "dataType": 'json'
  },
  "appUrl": 'product/golaxy_radar.js'
});