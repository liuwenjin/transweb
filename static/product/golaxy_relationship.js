golaxy_relationship({
  "className": 'BaiduChartItem',
  "task": {
    "style": {
      "padding": '5px'
    },
    "option": {
      "legend": {
        "data": []
      },
      "series": [{
        "type": 'graph',
        "layout": 'force',
        "animation": false,
        "label": {
          "normal": {
            "position": 'right',
            "formatter": '{b}'
          }
        },
        "draggable": true,
        "data": [],
        "categories": [],
        "force": {
          "edgeLength": 5,
          "repulsion": 20,
          "gravity": 0.2
        },
        "edges": []
      }]
    },
    "data": [],
    "promise": {
      "beforeRender": function(container, data, task) {
        task.option.series[0].data = data.nodes.map(function(node, idx) {
          node.id = idx;
          return node;
        });
        task.option.series[0].edges = data.links;
        task.option.series[0].categories = data.categories;
        task.option.legend.data = [];
        data.categories.map(function(node) {
          task.option.legend.data.push(node.name);
        });
      },
      "afterRender": function(container, data, task) {

      }
    },
    "url": 'mockData/webkit-dep.json',
    "requestType": 'get',
    "dataType": 'json'
  },
  "appUrl": 'product/golaxy_relationship.js'
});