golaxy_funnel({
  "className": 'BaiduChartItem',
  "task": {
    "style": {
      "padding": '5px'
    },
    "option": {
      "title": {
        "text": '漏斗图',
        "subtext": '纯属虚构'
      },
      "tooltip": {
        "trigger": 'item',
        "formatter": '{a} <br/>{b} : {c}%'
      },
      "toolbox": {
        "feature": {
          "dataView": {
            "readOnly": false
          },
          "restore": {},
          "saveAsImage": {}
        }
      },
      "legend": {
        "data": []
      },
      "calculable": true,
      "series": [{
        "name": '漏斗图',
        "type": 'funnel',
        "left": '10%',
        "top": 60,
        "bottom": 60,
        "width": '80%',
        "min": 0,
        "max": 100,
        "minSize": '0%',
        "maxSize": '100%',
        "sort": 'descending',
        "gap": 2,
        "label": {
          "show": true,
          "position": 'inside'
        },
        "labelLine": {
          "length": 10,
          "lineStyle": {
            "width": 1,
            "type": 'solid'
          }
        },
        "itemStyle": {
          "borderColor": '#fff',
          "borderWidth": 1
        },
        "emphasis": {
          "label": {
            "fontSize": 20
          }
        },
        "data": []
      }]
    },
    "data": [{
      "value": 60,
      "name": '访问'
    }, {
      "value": 40,
      "name": '咨询'
    }, {
      "value": 20,
      "name": '订单'
    }, {
      "value": 80,
      "name": '点击'
    }, {
      "value": 100,
      "name": '展现'
    }],
    "promise": {
      "beforeRender": function(container, data, task) {
        data = data.sort(function(a, b){
        	return b.value - a.value;
        });
        task.option.series[0].data = data;
        task.option.legend.data = [];
        data.map(function(item) {
          task.option.legend.data.push(item.name);
        });
      },
      "afterRender": function(container, data, task) {

      }
    },
    "url": '',
    "requestType": 'get',
    "dataType": 'json'
  },
  "appUrl": 'product/golaxy_funnel.js'
});