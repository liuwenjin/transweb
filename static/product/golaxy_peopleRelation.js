golaxy_peopleRelation({
  "className": 'Cytoscape',
  "cardName": 'myRelationship',
  "task": {
    "data": {},
    "promise": {
      "beforeRender": function(container, data, task) {
        task.data = task.transData(data);
      },
      "afterRender": function(container, data, task) {
        task.cy.on('tap', 'node', function() {
          var nodes = this;
          var tapped = nodes;
          var food = [];

          nodes.addClass('eater');

          for (;;) {
            var connectedEdges = nodes.connectedEdges(function(el) {
              return !el.target().anySame(nodes);
            });

            var connectedNodes = connectedEdges.targets();

            Array.prototype.push.apply(food, connectedNodes);

            nodes = connectedNodes;

            if (nodes.empty()) {
              break;
            }
          }

          var delay = 0;
          var duration = 500;
          for (var i = food.length - 1; i >= 0; i--) {
            (function() {
              var thisFood = food[i];
              var eater = thisFood.connectedEdges(function(el) {
                return el.target().same(thisFood);
              }).source();

              thisFood.delay(delay, function() {
                eater.addClass('eating');
              }).animate({
                position: eater.position(),
                css: {
                  'width': 10,
                  'height': 10,
                  'border-width': 0,
                  'opacity': 0
                }
              }, {
                duration: duration,
                complete: function() {
                  thisFood.remove();
                }
              });

              delay += duration;
            })();
          } // for

        });
      }
    },
    "url": 'mockData/peoples/陳菊.json',
    "requestType": 'get',
    "dataType": 'json',
    "transData": function(tData) {
      var ret = {
        nodes: [{
          data: {
            id: tData.name,
            avater: "mockData/image/" + tData.name + ".png"
          }
        }],
        edges: []
      };
      for (var i in tData.relation_list) {
        var item = tData.relation_list[i];
        var node = {
          data: {
            id: item.object,
            avater: "mockData/image/" + item.object + ".png"
          }
        };
        ret.nodes.push(node);
        var edge = {
          data: {
            "source": tData.name,
            "target": item.object,
            "label": item.type + " (" + item.value + ")"
          }
        };
        ret.edges.push(edge);
      }
      return ret;
    },
    "option": {
      "extra": {
        "boxSelectionEnabled": false,
        "autounselectify": true
      },
      "layout": {
        "name": 'breadthfirst',
        "directed": true,
        "padding": 10
      },
      "nodeStyle": {
        "height": 60,
        "width": 60,
        "label": 'data(id)',
        "background-fit": 'cover',
        "background-image": 'data(avater)',
        "border-color": '#999',
        "border-width": 3,
        "border-opacity": 0.5,
        "color": '#fff',
        "text-background-color": '#888',
        "text-background-opacity": 0.8,
        "text-background-shape": 'roundrectangle',
        "text-border-color": '#999',
        "text-border-opacity": 1,
        "text-border-width": 1,
        "text-outline-width": 1,
        "text-valign": 'bottom',
        "font-size": 12,
        "text-margin-y": 3,
        "text-background-padding": 3
      },
      "edgeStyle": {
        "curve-style": 'bezier',
        "width": 2,
        "line-color": '#ffaaaa',
        "label": 'data(label)',
        "font-size": 12,
        "text-max-width": 10,
        "text-wrap": 'wrap',
        "text-overflow-wrap": 'whitespace',
        "edge-text-rotation": 'autorotate'
      },
      "classStyle": {
        "female": {
          "border-color": 'red'
        },
        "male": {
          "border-color": 'blue'
        }
      }
    }
  },
  "appUrl": 'product/golaxy_peopleRelation.js'
});