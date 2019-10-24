### {{componentName}}组件说明文档

#### 1. 组件所需数据结构
```
{{componentData}}
```

#### 2. 组件配置参数结构
```
{{componentOption}}
```

#### 3. 组件调用方法

- 无参调用

```
var elem = $(selector)[0];
var url = '{{componentUrl}}';
webCpu.addCardItem(elem, url, '{{componentKey}}');

```

- 设置组件数据接口

```
var elem = $(selector)[0];
var url = '{{componentUrl}}';
webCpu.addCardItem(elem, url, {
  key: '{{componentKey}}',
  callback: function(container, data, task) {
    //直接修改组件对象的task中的url数据接口地址
    //data.task.url = ""
  }
});
```

- 传入参数

```
var elem = $(selector)[0];
var url = '{{componentUrl}}';
webCpu.addCardItem(elem, url, {
  key: '{{componentKey}}',
  callback: function(container, data, task) {
    //data.task.option获取组件对象的option进行修改
    //如：data.task.option.title.text="中科天玑员工住址分布图"
  }
});
```


- 数据结构转换

```
var elem = $(selector)[0];
var url = '{{componentUrl}}';
webCpu.addCardItem(elem, url, {
  key: '{{componentKey}}',
  callback: function(container, data, task) {
    //重写data.task.promise.beforeRender函数
  }
});

```