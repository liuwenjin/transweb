webCpu.regComponent("ExcelReader", {
  script: {
    xlsx: "xlsx.full.min.js",
    shim: "shim.js"
  },
  html: "layout.html"
}, function (container, data, task) {
  var fileInputSelector = $(container).find(".custom-file-input");
  fileInputSelector.on("change", function (evt) {
    var files = evt.target.files;
    if (files == null || files.length == 0) {
      // task.exportJson = null;
      return;
    }
    var f = files[0];
    let name = f.name;
    let suffixArr = name.split("."),
      suffix = suffixArr[suffixArr.length - 1];
    if (suffix != "xlsx") {
      console.log("Currently only supports the import of xlsx files");
      $(container).find(".custom-file-label").html("选择本地的Excel文件");
      return;
    }
    else {
      $(container).find(".custom-file-label").html(name);
    }
    let reader = new FileReader();
    reader.onload = function (e) {
      let data = e.target.result;
      data = XLSX.read(data, {
        type: 'array'
      });
      let out = [];
      data.SheetNames.forEach(function (name) {
        var o = {
          name: name,
          rows: {}
        };
        var ws = data.Sheets[name];
        var aoa = XLSX.utils.sheet_to_json(ws, {
          raw: false,
          header: 1
        });
        aoa.forEach(function (r, i) {
          var cells = {};
          r.forEach(function (c, j) {
            cells[j] = ({
              text: c
            });
          });
          o.rows[i] = {
            cells: cells
          };
        })
        out.push(o);
      });
      task.exportJson = out || task.exportJson;
      if(typeof task.changeCallback === "function") {
        task.changeCallback(task.exportJson);
      }
    };
    reader.readAsArrayBuffer(f);

  });
});