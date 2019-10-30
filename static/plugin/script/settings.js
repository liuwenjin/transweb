searchSettings({
  "className": 'FormItem',
  "overflow": "auto",
  "footMenu": [{
    text: '<button type="button" style="width: 200px;" class="btn btn-primary">搜索</button>'
  }],
  "task": {
    "style": {
      "width": "calc( 50% - 30px )",
          "margin": "auto",
          "margin-top": "10px"
      // "width": "calc( 50% - 30px )",
      // "float": "left",
      // "margin-right": "15px",
      // "margin-top": "10px"
    },
    "data": [{
      title: "名称",
      name: "name",
      "value": "",
      "items": [{
        "type": 'text',
        "width": '120px',
        "value": ""
      }]
    },
    {
      title: "类型",
      name: "type",
      value: "",
      "items": [{
        "type": 'select',
        "width": '120px',
        options: ["飞行器", "运输机"]
      }]
    },
    {
      title: "所属国",
      name: "country",
      "items": [{
        "type": 'text',
        "width": '120px',
        "value": ''
      }]
    },
    {
      title: "相关武器",
      name: "relation",
      "items": [{
        "type": 'text',
        "width": '120px',
        "value": ''
      }]
    }
  ],
    "promise": {
      "beforeRender": function(container, data, task) {
        
      },
      "afterRender": function(container, data, task) {
        $(task.footArea).find(".btn-primary").on("click", function(){
          var d = webCpu.FormItem.getValue(task);
          if(typeof(task.promise.confirm) === "function") {
            task.promise.confirm(d);
            console.log(d);
          }
        });
      }
    },
    "url": '',
    "requestType": 'get',
    "dataType": 'json',
    taskType: "multi"
  },
  "appUrl": 'product/golaxy_column.js'
});