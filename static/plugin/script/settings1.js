searchSettings1({
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
        },
        "data": [{
            title: "包含以下全部的关键词",
            name: "containAll",
            "value": "",
            "items": [{
              "type": 'text',
              "width": '120px',
              "value": ""
            }]
          },
          {
            title: "包含以下的完整关键词",
            name: "containWhole",
            "items": [{
              "type": 'text',
              "width": '120px',
              "value": ''
            }]
          },
          {
            title: "包含以下任意一个关键词",
            name: "containOne",
            "items": [{
              "type": 'text',
              "width": '120px',
              "value": ''
            }]
          },
          // {
          //   title: "不包括以下关键词",
          //   name: "notContain",
          //   "items": [{
          //       "type": 'text',
          //       "width": '120px',
          //       "value": ''
          //     }],
          //   },
          //   {
          //     title: "搜索数据格式",
          //     name: "format",
          //     "items": [{
          //       "type": 'text',
          //       "width": '120px',
          //       "value": ''
          //     }]
          //   },
          //   {
          //     title: "限定要搜索的数据入库时间",
          //     name: "time",
          //     "items": [{
          //       "type": 'text',
          //       "width": '120px',
          //       "value": ''
          //     }]
          //   },
          //   {
          //     title: "查询关键词位于",
          //     name: "where",
          //     "items": [{
          //       "type": 'text',
          //       "width": '120px',
          //       "value": ''
          //     }]
          //   }
          ],
          "promise": {
            "beforeRender": function (container, data, task) {

            },
            "afterRender": function (container, data, task) {
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
