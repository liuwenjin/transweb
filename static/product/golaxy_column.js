golaxy_column({
  "className": 'BaiduChartItem',
  "task": {
    "style": {
      "padding": '15px',
      "max-width": '800px',
      "max-height": '600px'
    },
    "option": {
      "color": ['#3398DB'],
      "tooltip": {
        "trigger": 'axis',
        "axisPointer": {
          "type": 'shadow'
        }
      },
      "grid": {
        "left": '3%',
        "right": '4%',
        "bottom": '3%',
        "containLabel": true
      },
      "xAxis": [{
        "type": 'category',
        "data": [],
        "axisTick": {
          "alignWithLabel": true
        }
      }],
      "yAxis": [{
        "type": 'value'
      }],
      "series": [{
        "name": '直接访问',
        "type": 'bar',
        "barWidth": '60%',
        "data": []
      }]
    },
    "data": [{
    	name: "Mon",
     value: "10"
    }, {
    	name: "Tue",
     value: "20"
    }, {
    	name: "Wed",
     value: "5"
    }, {
    	name: "Thu",
     value: "60"
    }, {
    	name: "Fri",
     value: "30"
    }, {
    	name: "Sat",
     value: "80"
    }, {
    	name: "Sun",
     value: "10"
    }],
    "promise": {
      "beforeRender": function(container, data, task) {
        task.option.series[0].data = [];
        task.option.xAxis[0].data = [];
        data.map(function(item) {
        	task.option.series[0].data.push(item.value);
         task.option.xAxis[0].data.push(item.value);
        });
      },
      "afterRender": function(container, data, task) {

      }
    },
    "url": '',
    "requestType": 'get',
    "dataType": 'json'
  },
  "appUrl": 'product/golaxy_column.js'
});