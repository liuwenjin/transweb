searchDetails({
  "className": 'InfoTable',
  "title": "战斗机",
  "titleHeight": 48,
  "titleStyle" : {
    "padding-left": "10px"
  },
  "task": {
    "style": {
      "overflow": "auto"
    },
    "option": {
      "template": {
        "image": "<img width='100%' src='{{value}}'>"
      },
      "attributeMap": {
        "image": "",
        "name": "名称",
        "org": "研发单位",
        "country": "所属国家",
        "personNumber": "乘员",
        "motoName": "发动机",
        "motoNumber": "发动机数量",
        "maxStation": "最大航程",
        "maxWeight": "最大起飞重量",
        "maxVelocity": "最大飞行速度",
        "layout": "气动布局",
        "firstFlay": "首飞时间",
        "startTime": "服役时间",
        "endTime": "退役时间",
        "planeLength": "机长",
        "planeWidth": "翼展",
        "planeHeight": "机高",
        "relation": "相关武器",
        "serviceArea": "服务区域",
        "pPrecision": "定位精度",
        "sPrecision": "测速精度",
        "tPrecision": "授时精度",
        "usability": "服务可用性",
        "carrierRocket": "运载火箭",
        "satelliteType": "卫星类型",
        "launchSite": "发射地点"
      }
    },
    "header": [{
      "name": '-',
      "key": 'image'
    },{
      "name": '名称',
      "key": 'name'
    }, {
      "name": '类型',
      "key": 'type'
    },  {
      "name": '研发单位',
      "key": 'org'
    },  {
      "name": '所属国',
      "key": 'country'
    }, {
      "name": '首飞时间',
      "key": 'firstFly'
    }, {
      "name": '服役时间',
      "key": 'startTime'
    }, {
      "name": '退役时间',
      "key": 'endTime'
    },{
      "name": '气动布局',
      "key": 'layout'
    }, {
      "name": '发动机数量',
      "key": 'motoNumber'
    }, {
      "name": '飞行速度',
      "key": 'velocity'
    }],
    
    "data": {
      "image": "/static/plugin/images/plane.jpg",
      "name": "*",
      "type": "*",
      "org": "*",
      "country": "*",
      "firstFly": "*",
      "startTime": "*",
      "endTime": "*",
      "layout": "*",
      "motoNumber": "*",
      "velocity": "*"
    },
    "promise": {
      "beforeRender": function(container, data, task) {
        task.header = [];
        let tMap = task.option.attributeMap;
        for(let k in data) {
          if(tMap[k] || tMap[k] === "") {
            task.header.push({
              name: tMap[k],
              key: k
            });
          }
        }
      },
      "afterRender": function(container, data, task) {

      }
    },
    "url": '',
    "requestType": 'get',
    "dataType": 'json'
  },
  "appUrl": 'product/golaxy_column.js'
});