golaxy_map({
  className: "BaiduChartItem",
  type: "normalBorder",
  cardName: "clientsHeatMap",
  title: "源端分布",
  task: {
    data: [],
    option: {
      tooltip:  {
        show: true,
        formatter: function(a, b, c) {
          var ret = "地域: " + a.name;
          ret += "<br/>告警量: " + a.value[2]
          return ret;
        }
      },
      grid: {
        show: false,
        width: "100%",
        height: "100%",
        top: "0px",
        left: "0px"
      },
      visualMap: {
        min: 0,
        splitNumber: 5,
        pieces: [
          {min: 9, label: "10+"}, 
          {min: 7, max: 9, label: "8~9"},
          {min: 4, max: 7, label: "5~7"},
          {min: 1, max: 4, label: "1~4"}						
        ],
        color: ['#d94e5d','#eac736','#50a3ba'],
        textStyle: {
          color: '#fff'
        }
      },
      geo: {
        map: "china",
        show: true,
        left: "center",
        label: {
          normal: {
            show: false,
            textStyle: {
              color: '#999',
              fontStyle: 'normal',
              fontSize: 12
            }
          },
          emphasis: {
            show: true,
            textStyle: {
              color: '#bbb',
              fontStyle: 'normal',
              fontSize: 12
            }
          }
        },
        roam: false,
        itemStyle: {
          normal: {
            areaColor: '#323c48',
            borderColor: '#111',
            //borderWidth:0
          },
          emphasis: {
            //areaColor: 'transparent',
            areaColor: '#2a333d'
          }
        }
      },
      series: [{
        name: 'pm2.5',
        type: 'scatter',
        coordinateSystem: 'geo',
        data:[],
        symbolSize: 12,
        label: {
          normal: {
            show: false
          },
          emphasis: {
            show: false
          }
        },
        itemStyle: {
          emphasis: {
            borderColor: '#fff',
            borderWidth: 1
          }
        }
      }],
    },
    promise: {
      beforeRender: function (container, data, task) {
       
        
      },
      afterRender: function(container, data, task) {
        
      }
    },
    data: [],
    url: "",
    requestType: "get",
    dataType: "json"
  }
});