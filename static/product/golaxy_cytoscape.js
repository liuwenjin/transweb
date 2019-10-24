golaxy_cytoscape({
  "className": 'Cytoscape',
  "cardName": "myRelationship",
  "task": {
    "style": {
      "padding": '5px'
    },
    "data": {
      "nodes": [{
        "data": {
          "id": 'cat'
        }
      }, {
        "data": {
          "id": 'bird'
        }
      }, {
        "data": {
          "id": 'ladybug'
        }
      }, {
        "data": {
          "id": 'aphid'
        }
      }, {
        "data": {
          "id": 'rose'
        }
      }, {
        "data": {
          "id": 'grasshopper'
        }
      }, {
        "data": {
          "id": 'plant'
        }
      }, {
        "data": {
          "id": 'wheat'
        }
      }],
      "edges": [{
        "data": {
          "source": 'cat',
          "target": 'bird'
        }
      }, {
        "data": {
          "source": 'bird',
          "target": 'ladybug'
        }
      }, {
        "data": {
          "source": 'bird',
          "target": 'grasshopper'
        }
      }, {
        "data": {
          "source": 'grasshopper',
          "target": 'plant'
        }
      }, {
        "data": {
          "source": 'grasshopper',
          "target": 'wheat'
        }
      }, {
        "data": {
          "source": 'ladybug',
          "target": 'aphid'
        }
      }, {
        "data": {
          "source": 'aphid',
          "target": 'rose'
        }
      }]
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
        "height": 80,
        "width": 80,
        "label": 'data(id)',
        "background-fit": 'cover',
        "border-color": '#000',
        "border-width": 3,
        "border-opacity": 0.5,
        "text-halign": 'center',
        "text-valign": 'bottom'
      },
      "edgeStyle": {
        "curve-style": 'bezier',
        "width": 6,
        "target-arrow-shape": 'triangle',
        "line-color": '#ffaaaa',
        "target-arrow-color": '#ffaaaa'
      },
      "classStyle": {
        "eating": {
          "border-color": 'red'
        },
        "eater": {
          "border-width": 9
        }
      },
      "idStyle": {
        "rose": {
          "background-image": 'https://live.staticflickr.com/5109/5817854163_eaccd688f5_b.jpg'
        },
        "grasshopper": {
          "background-image": 'https://live.staticflickr.com/6098/6224655456_f4c3c98589_b.jpg'
        },
        "plant": {
          "background-image": 'https://live.staticflickr.com/3866/14420309584_78bf471658_b.jpg'
        },
        "wheat": {
          "background-image": 'https://live.staticflickr.com/2660/3715569167_7e978e8319_b.jpg'
        },
        "bird": {
          "background-image": 'https://live.staticflickr.com/7272/7633179468_3e19e45a0c_b.jpg'
        },
        "cat": {
          "background-image": 'https://live.staticflickr.com/1261/1413379559_412a540d29_b.jpg'
        },
        "ladybug": {
          "background-image": 'https://live.staticflickr.com/3063/2751740612_af11fb090b_b.jpg'
        },
        "aphid": {
          "background-image": 'https://live.staticflickr.com/8316/8003798443_32d01257c8_b.jpg'
        }
      }
    },
    "promise": {
      "beforeRender": function(container, data, task) {},
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
    "url": '',
    "requestType": 'get',
    "dataType": 'json'
  },
  "appUrl": 'product/golaxy_cytoscape.js'
});