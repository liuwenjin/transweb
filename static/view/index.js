transweb_cn({
  components: "transweb/components",
  dependency: {
    script: {
      common: "view/libs/js/common.js",
      config: "view/libs/js/config.js"
    },
    css: {
      index: "view/libs/css/index.css",
    },
    url: "",
    query: {
      
    },
    requestType: "get",
    dataType: "json",
  },
  main: {
    url: "view/test.js",
    callback: function (d) {
      //Todo
    }
  }
})