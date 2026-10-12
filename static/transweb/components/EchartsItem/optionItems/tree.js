transweb_echart_tree({
  option: {
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove'
    },
    xAxis: {
      show: false
    },
    yAxis: {
      show: false
    },
    series: {
      type: 'tree',
      roam: true,
      left: 180,
      right: 400,
      zoom: 1,
      top: '10px',
      bottom: '10px',
      roam: true,
      symbol: function (value, param) {
        // 如果节点有子节点，则为实心圆，否则为圆圈
        if (param.data.children && param.data.children.length > 0) {
          return 'circle'; // 实心圆
        } else {
          return 'emptyCircle'; // 圆圈
        }
      },
      symbolSize: function (value, param) {
        var ret = 25;
        if (param.treeAncestors.length > 3) {
          ret = 15;
        }
        return ret;
      },
      expandAndCollapse: false, // 关闭节点的展开和折叠行为
      initialTreeDepth: Number.MAX_VALUE, // 设置一个足够大的数值确保所有节点默认展开
      itemStyle: {
        color: "#2f2a76"
      },
      label: {
        position: 'top',
        distance: 10,
        verticalAlign: 'middle',
        align: 'center',
        fontSize: 30,
        fontWeight: 900,
        color: "#2f2a76",
        width: 300,
        overflow: "truncate",
      },
      lineStyle: {
        width: 1,
        color: '#aaa'
      },
      leaves: {
        label: {
          position: 'right',
          verticalAlign: 'middle',
          align: 'left',
          fontSize: 25,
          fontWeight: 500,
          distance: 5,
          width: 400,
          show: true
        },
        lineStyle: {
          width: 1,
          color: '#aaa'
        },
      },
      animationDurationUpdate: 100,
      data: [],
    }
  },
  data: [{
    name: 'Grandpa',
    children: [{
      name: 'Uncle Leo',
      value: 15,
      children: [{
        name: 'Cousin Jack',
        value: 2
      }, {
        name: 'Cousin Mary',
        value: 5,
        children: [{
          name: 'Jackson',
          value: 2
        }]
      }, {
        name: 'Cousin Ben',
        value: 4
      }]
    }, {
      name: 'Father',
      value: 10,
      children: [{
        name: 'Me',
        value: 5
      }, {
        name: 'Brother Peter',
        value: 1
      }]
    }]
  }, {
    name: 'Nancy',
    children: [{
      name: 'Uncle Nike',
      children: [{
        name: 'Cousin Betty',
        value: 1
      }, {
        name: 'Cousin Jenny',
        value: 2
      }]
    }]
  }],
  callback: function (d, name) {
    var serise = this.option.series[0] || this.option.series;
    if (!d || d.length === 0) {
      d = this.data;
    }
    
    if (d && d.constructor.name !== "Array") {
      d = [d];
    }

    this.contextStyle = this.contextStyle || {};
    serise.itemStyle.color = this.contextStyle.color || serise.itemStyle.color;
    serise.label.color = this.contextStyle.color || serise.itemStyle.color;
    serise.data = d;
    serise.name = name || serise.name;
  }
})