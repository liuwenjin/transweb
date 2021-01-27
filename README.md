# transweb

## 介绍

一个JS小程序引擎。

这个引擎主要有3个目的。

1. 帮助开发人员直接用javascript语言(简称JS)编写能运行在浏览器上的小程序。

2. 让这样的小程序可以自由组合成为新复合程序。

3. 为这些小程序快速生成数据持久化层的数据接口。

为了这三个目的，该小程序引擎具备两类功能： 

1) JS程序控制器功能，负责渲染JS小程序和组合JS小程序；

2) 数据接口生成器功能，可以生成数据库操作接口和自定义数据接口。

## 引擎环境部署和运行

1. 下载并安装nodejs。

2. 下载或clone项目代码。

下载地址: https://github.com/liuwenjin/transweb/archive/master.zip (下载后需解压)

或使用clone地址: https://github.com/liuwenjin/transweb.git

3. 在控制台打开代码目录，运行node webServer.js 命令。

## JS小程序入门

1. 打开项目中static/view目录。

2. 创建一个空白的js文件helloword.js。(将一个空白的text文件后缀名改为js)

3. 在js文件中便在如下代码并保存, 这样就编写了一个js小程序。

```
transweb_cn({
    task: {
        template: '<div>Hello world!</div>',
    }
})
```
这个小程序可以在浏览器地址栏输入localhost:8686?url=view/helloword.js，再按回车运行。

## JS小程序开发说明目录

1. [JS小程序的代码结构](https://github.com/liuwenjin/transweb/wiki/JS%E5%B0%8F%E7%A8%8B%E5%BA%8F%E7%9A%84%E4%BB%A3%E7%A0%81%E7%BB%93%E6%9E%84)

2. [JS小程序的组合方式](https://github.com/liuwenjin/transweb/wiki/JS%E5%B0%8F%E7%A8%8B%E5%BA%8F%E7%9A%84%E7%BB%84%E5%90%88%E6%96%B9%E5%BC%8F)

3. [JS小程序的数据接口](https://github.com/liuwenjin/transweb/wiki/JS%E5%B0%8F%E7%A8%8B%E5%BA%8F%E7%9A%84%E6%8E%A5%E5%8F%A3%E8%B0%83%E7%94%A8)

4. [JS小程序的接口调用](https://github.com/liuwenjin/transweb/wiki/JS%E5%B0%8F%E7%A8%8B%E5%BA%8F%E7%9A%84%E6%95%B0%E6%8D%AE%E6%8E%A5%E5%8F%A3)

5. [JS小程序的注意事项](https://github.com/liuwenjin/transweb/wiki/JS%E5%B0%8F%E7%A8%8B%E5%BA%8F%E7%9A%84%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A1%B9)

6. [JS小程序的公用api](https://github.com/liuwenjin/transweb/wiki/JS%E5%B0%8F%E7%A8%8B%E5%BA%8F%E7%9A%84%E5%85%AC%E7%94%A8api)




