 webCpu.regComponent("Cytoscape", {
   script: "cytoscape.min.js"
 }, function (container, data, task) {
   $(container).html("");
   task.option = task.option || {};
   var param = task.option.extra || {};
   param.container = container;

   var sSheet = cytoscape.stylesheet()
   if (task.option.nodeStyle || task.option.edgeStyle) {
     task.option.nodeStyle = task.option.nodeStyle || {};
     task.option.edgeStyle = task.option.edgeStyle || {};
     sSheet.selector('node')
       .css(task.option.nodeStyle)
       .selector('edge')
       .css(task.option.edgeStyle);
   }
   if (task.option.idStyle) {
     for (var k in task.option.idStyle) {
       sSheet.selector("#" + k)
         .css(task.option.idStyle[k]);
     }
   }
   if (task.option.classStyle) {
     for (var k in task.option.classStyle) {
       sSheet.selector("." + k)
         .css(task.option.classStyle[k]);
     }
   }
   param.layout = task.option.layout || {};
   param.style = sSheet;
   param.elements = data || {};
   task.cy = cytoscape(param);
   task.cy.on('tap', 'node', function () {
     webCpu.Cytoscape.switchChildren(this);
   });
 });

 webCpu.Cytoscape.addNodeData = function (task, d) {
   if (typeof (task.updateAvater) === "function") {
     task.updateAvater(d);
   }
   var elements = this.transData(task, d);
   task.cy.add(elements);
   this.updateLayout(task);
 }

 webCpu.Cytoscape.transData = function (task, d) {
   var tData = d || task.data;
   var masterKey = task.masterKey || "id";
   var objectKey = task.objectKey || "object";
   var ret = {
     nodes: [{
       data: {
         id: tData[masterKey],
         name: tData.name,
         avater: tData.avater
       }
     }],
     edges: []
   };
   for (var i in tData.relation_list) {
     var item = tData.relation_list[i];
     var node = {
       data: {
         id: item[objectKey],
         name: item.name || item[objectKey],
         avater: item.avater
       }
     };
     ret.nodes.push(node);
     var edge = {
       data: {
         "source": tData[masterKey],
         "target": item[objectKey],
         "label": item.type,
         "id": tData[masterKey] + "-" + item[objectKey]
       }
     };

     if (task.relationMap && task.relationMap[item.type] !== item.value) {
       var t = edge.data.source;
       edge.data.source = edge.data.target;
       edge.data.target = t;
     }

     ret.edges.push(edge);
   }
   return ret;
 }

 webCpu.Cytoscape.addNode = function (task, data, source) {
   var nodes = [];
   data = data || {};
   if (typeof (data) === "string") {
     data = {
       id: data
     }
   }
   nodes.push({
     group: 'nodes',
     data: data
   });

   if (source) {
     sourceId = source.id || source;
     nodes.push({
       group: 'edges',
       data: {
         id: sourceId + "_" + data.id,
         source: sourceId,
         target: data.id
       }
     });
   }
   task.cy.add(nodes);
   this.updateLayout(task);
 }

 webCpu.Cytoscape.switchChildren = function (node) {
   if (!node.hiddenItems) {
     this.hiddenChildren(node);
   } else {
     for (var k in node.hiddenItems) {
       node.hiddenItems[k].restore();
     }
     node.hiddenItems = null;
   }
 }


 webCpu.Cytoscape.hiddenChildren = function (node) {
   node.hiddenItems = [];
   var nodes = node;
   var food = [];
   nodes.addClass('eater');

   var connectedEdges = nodes.connectedEdges(function (el) {
     return !el.target().anySame(nodes);
   });
   var connectedNodes = connectedEdges.targets();
   Array.prototype.push.apply(food, connectedNodes);

   for (var i = food.length - 1; i >= 0; i--) {
     var tEdges = food[i].connectedEdges();
     if (tEdges.length === 1) {
       var t = food[i].remove();
       node.hiddenItems.push(t);
     }
   }
 }


 webCpu.Cytoscape.updateLayout = function (task) {
   var option = task.option.layout || {}
   var layout = task.cy.layout(option);
   layout.run();
 }

 webCpu.Cytoscape.removeById = function (task, id) {

 }