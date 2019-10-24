golaxy_tree({
  "className": 'BaiduChartItem',
  "task": {
    "style": {
      "padding": '5px'
    },
    "option": {
      
        tooltip: {
            trigger: 'item',
            triggerOn: 'mousemove'
        },
        series: [
            {
                type: 'tree',

                data: [],

                top: '1%',
                left: '7%',
                bottom: '1%',
                right: '20%',

                symbolSize: 7,

                label: {
                    normal: {
                        position: 'left',
                        verticalAlign: 'middle',
                        align: 'right',
                        fontSize: 9
                    }
                },

                leaves: {
                    label: {
                        normal: {
                            position: 'right',
                            verticalAlign: 'middle',
                            align: 'left'
                        }
                    }
                },

                expandAndCollapse: true,
                animationDuration: 550,
                animationDurationUpdate: 750
            }
        ]
    },
    "data": [{
      "name": 'Mon',
      "value": 820
    }, {
      "name": 'Tue',
      "value": 932
    }, {
      "name": 'Wed',
      "value": 901
    }, {
      "name": 'Thu',
      "value": 934
    }, {
      "name": 'Fri',
      "value": 1290
    }, {
      "name": 'Sat',
      "value": 1330
    }, {
      "name": 'Sun',
      "value": 1320
    }],
    "promise": {
      "beforeRender": function(container, data, task) {
        task.option.series[0].data = [data];
        
      },
      "afterRender": function(container, data, task) {

      }
    },
    "url": 'mockData/flare.json',
    "requestType": 'get',
    "dataType": 'json'
  },
  "appUrl": 'product/golaxy_tree.js'
});