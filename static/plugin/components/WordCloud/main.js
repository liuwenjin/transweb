webCpu.regComponent("WordCloud", {
  script: {
    // echartWordcloud: "echarts-wordcloud.min.js",
    // simple: "echarts.simple.js",
    wordcloud2: "wordcloud2.js"
  }
}, function (container, data, task) {
  WordCloud(container, { list: data } );
});