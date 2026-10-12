webCpu.regComponent("ExcelDataViewer", {
  css: {
    x_spreadsheet: "xspreadsheet.css",
  },
  script: {
    x_spreadsheet: "xspreadsheet.js",
    zh_cn: "zh-cn.js"
  },
}, function (container, data, task) {
  task.xSpreadItem = x_spreadsheet(container);
  if(task.xSpreadItem && task.xSpreadItem.loadData && data) {
    task.xSpreadItem.loadData(data);
  }
});