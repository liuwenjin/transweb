searchResults({
  "className": 'DataTable',
  "cardName": "searchResultsTable",
  "foot": "-",
  "footHeight": 60,
  "task": {
    "option": {
      page: {
        total: 1,
        size: 10,
        current: 1
      },
      
    },
    "header": [{
      "name": '名称',
      "key": 'name'
    }, {
      "name": '类型',
      "key": 'type'
    }, {
      "name": '研发单位',
      "key": 'org'
    }, {
      "name": '所属国',
      "key": 'country'
    }, {
      "name": '操作',
      "render": function (v, d) {
        return "<div style='color: #fff;'><a style='color: #fff;' target='_blank' href=" + d.url + ">链接</a>\
                <label class='updateDetailBtn' style='margin: 0px; padding: 0px; cursor: pointer; margin-left: 10px;'>详情</label>\
                <label class='analysisBtn' style='margin: 0px; padding: 0px; cursor: pointer; margin-left: 10px;'>分析</label></div>";
      }
    }],
    "data": [{
      name: "运-20",
      type: "飞行器",
      org: "中航工业西安飞机公司",
      country: "中国",
      "firstFly": "*",
      "startTime": "*",
      "endTime": "*",
      "layout": "*",
      "motoNumber": "*",
      "velocity": "*",
      "image": "/static/plugin/images/plane.jpg"
    }, {
      name: "运-20",
      type: "飞行器",
      org: "中航工业西安飞机公司",
      country: "中国",
      "firstFly": "*",
      "startTime": "*",
      "endTime": "*",
      "layout": "*",
      "motoNumber": "*",
      "velocity": "*",
      "image": "/static/plugin/images/plane.jpg"
    }, {
      name: "运-20",
      type: "飞行器",
      org: "中航工业西安飞机公司",
      country: "中国",
      "firstFly": "*",
      "startTime": "*",
      "endTime": "*",
      "layout": "*",
      "motoNumber": "*",
      "velocity": "*",
      "image": "/static/plugin/images/plane.jpg"
    }, {
      name: "运-20",
      type: "飞行器",
      org: "中航工业西安飞机公司",
      country: "中国",
      "firstFly": "*",
      "startTime": "*",
      "endTime": "*",
      "layout": "*",
      "motoNumber": "*",
      "velocity": "*",
      "image": "/static/plugin/images/plane.jpg"
    }, {
      name: "运-20",
      type: "飞行器",
      org: "中航工业西安飞机公司",
      country: "中国",
      "firstFly": "*",
      "startTime": "*",
      "endTime": "*",
      "layout": "*",
      "motoNumber": "*",
      "velocity": "*",
      "image": "/static/plugin/images/plane.jpg"
    }, {
      name: "运-20",
      type: "飞行器",
      org: "中航工业西安飞机公司",
      country: "中国",
      "firstFly": "*",
      "startTime": "*",
      "endTime": "*",
      "layout": "*",
      "motoNumber": "*",
      "velocity": "*",
      "image": "/static/plugin/images/plane.jpg"
    }, {
      name: "运-20",
      type: "飞行器",
      org: "中航工业西安飞机公司",
      country: "中国",
      "firstFly": "*",
      "startTime": "*",
      "endTime": "*",
      "layout": "*",
      "motoNumber": "*",
      "velocity": "*",
      "image": "/static/plugin/images/plane.jpg"
    }, {
      name: "运-20",
      type: "飞行器",
      org: "中航工业西安飞机公司",
      country: "中国",
      "firstFly": "*",
      "startTime": "*",
      "endTime": "*",
      "layout": "*",
      "motoNumber": "*",
      "velocity": "*",
      "image": "/static/plugin/images/plane.jpg"
    }],
    "promise": {
      "beforeRender": function (container, data, task) {
        
      },
      "afterRender": function (container, data, task) {
        $(container).find(".updateDetailBtn").on("click", function(){
          let index = $(this).parent().parent().parent().attr("index");
          let d = data[index];
          if(typeof(task.promise.updateDetails) === "function") {
            task.promise.updateDetails(d);
          }
        });
        $(container).find(".analysisBtn").on("click", function(){
          let index = $(this).parent().parent().parent().attr("index");
          let d = data[index];
          if(typeof(task.promise.entityAnalysis) === "function") {
            task.promise.entityAnalysis(d);
          }
        })
      }
    },
    "url": '',
    "requestType": 'get',
    "dataType": 'json'
  },
  "appUrl": 'product/golaxy_column.js'
});
