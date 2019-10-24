golaxy_modelConfig({
  "cardName": 'myModelConfig',
  "style": {
    "padding": '5px 15px',
    "border": '1px solid #617e9e',
    "border-radius": '5px',
    "box-shadow": '0 0 1px rgba(0, 0, 0, 0.3), 0 3px 7px rgba(0, 0, 0, 0.3), inset 0 1px rgba(255, 255, 255, 1), inset 0 -3px 2px rgba(0, 0, 0, 0.25)',
    "background": '#f5f5f5'
  },
  "task": {
    "data": {
      "name": '同类选举政党势力模型',
      "description": '利用线性回归模型，分析政党势力与选举类型之间的关系。',
      "query": [{
        "title": '选举年份',
        "name": 'elecYear',
        "value": '2018年',
        "dataItem": 'yearList'
      }, {
        "title": '市县名称',
        "name": 'elecState',
        "value": '台北市',
        "dataItem": 'cityList'
      }],
      "params": [{
        "title": '移动平均模型窗口大小',
        "name": 'MA_k'
      }, {
        "title": '指数移动平均模型窗口大小',
        "name": 'EMA_k'
      }, {
        "title": '指数移动平均模型窗衰减因子',
        "name": 'EMA_decay'
      }]
    },
    "dataset": {
      "yearList": ['2019年', '2018年', '2017年'],
      "elecType": ['市长选举', '总统选举', '县长选举'],
      "cityList": ['台北市', '台北县', '新竹县']
    },
    "template": '<div style="height: 110px; "><h3 style="text-align: center;">{{name}}</h3><p>{{description}}</p></div>                 <div class="modelConfigArea" style="height: calc( 100% - 140px ); padding-top: 15px;"><div style="width: 50%; height: 100%; float: left; padding-right: 100px;" class="modelConfigLeftArea"></div><div style="width: 50%; height: 100%; float: left; padding-right: 40px;" class="modelConfigRightArea"></div></div>',
    "promise": {
      "beforeRender": function(container, data, task) {
        var taiwan = "台北市，新北市，台中市，台南市，高雄市，宜兰县，桃园市，新竹县，苗栗县，彰化县，南投县，云林县，嘉义县，屏东县，台东县，花莲县，澎湖县，基隆市，新竹市，嘉义市，金门县，连江县，桃园市";
        task.dataset.cityList = taiwan.split("，");
      },
      "afterRender": function(container, data, task) {
        //task.addSelectItem(container, ["中国", "美国"], "请输入");
        var cArea = $(container).find(".modelConfigArea>.modelConfigLeftArea")[0];
        var iData = task.configData(task.data.query);
        var iCard = {
          className: "FormItem",
          task: {
            data: iData,
            taskType: "multi"
          }
        };
        webCpu.addCardItem(cArea, iCard);

        cArea = $(container).find(".modelConfigArea>.modelConfigRightArea")[0];
        var iData1 = task.configData(task.data.params);
        var iCard1 = {
          className: "FormItem",
          task: {
            data: iData1,
            taskType: "multi"
          }
        };
        webCpu.addCardItem(cArea, iCard1);
        $(task.footArea).find(".btn-primary").on("click", function() {
          var iParam = webCpu.FormItem.getValue(iCard);
          var iParam1 = webCpu.FormItem.getValue(iCard1);
          console.log(iParam);
          webCpu.CardItem.maskDialog(task, "product/golaxy_pie.js", "计算结果", {
            key: "golaxy_pie"
          }, {
          	"border-radius": "5px",
           "overflow": "hidden"
          });
        });
      }
    },
    "configData": function(d) {
      var cData = [];
      for (var i in d) {
        var item = {
          title: d[i].title,
          name: d[i].name,
          value: d[i].value,
          items: [{
            type: "text"
          }]
        };
        if (d[i].dataItem && this.dataset[d[i].dataItem]) {
          item.items[0].type = "select";
          item.items[0].options = this.dataset[d[i].dataItem];
        }
        cData.push(item);
      }
      return cData;
    },
    "url": '',
    "requestType": 'get',
    "dataType": 'json'
  },
  "footMenu": [{
    "data": {
      "name": '计算'
    },
    "text": "<button class='form-control btn btn-primary' style='width: 120px;'>{{name}}</button>"
  }],
  "appUrl": 'product/golaxy_modelConfig.js'
});