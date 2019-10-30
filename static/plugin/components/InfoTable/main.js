(function () {
  var config = {
    css: "style.css"
  }

  webCpu.regComponent("InfoTable", config, function (container, data, task) {
    container.innerHTML = "";
    var table = document.createElement("table");
    table.setAttribute("class", "table");
    var tbody = document.createElement("tbody");
    table.appendChild(tbody);
    container.appendChild(table);
    task.option = task.option || {};
    task.header = task.option.header || task.header;
    if (task.data && Object.keys(task.data).length > 0) {
      for (var i = 0; i < task.header.length; i++) {
        var tr = document.createElement("tr");
        var td = document.createElement("td");
        tr.appendChild(td);
        td.innerHTML = "<p class='InfoTable_itemName'>" + task.header[i].name + "</p>";
        var tValue = task.data[task.header[i].key];
          if(task.option.template && task.option.template[task.header[i].key]) {
            tValue = task.option.template[task.header[i].key];
          }
          var d = {
            value: task.data[task.header[i].key],
            name: task.header[i].name
          }
          if(tValue) {
            tValue = tValue.bindData(d);
          }
         
        if (task.header[i].key && !task.header[i].name) {
          var tStr = "<td colspan=2>" + tValue + "</td>";
          tr.innerHTML = tStr;
        } else if (task.header[i].key || task.header[i].render) {
          var td = document.createElement("td");
          tr.appendChild(td);
          if (typeof (task.header[i].render) === "function") {
            tValue= task.header[i].render(task.data[task.header[i].key], data);
          }

          if (tValue === undefined || tValue === null) {
            tValue = "-";
          }
          td.innerHTML = "<p class='InfoTable_itemInfo'>" + tValue + "</p>";
        } else {
          td.setAttribute("colspan", 2);
        }
        tbody.appendChild(tr);
      }
    } else {
      var tr = document.createElement("tr");
      tr.innerHTML = "<td colspan=2><p class='InfoTable_emptyTip'>当前列表为空</p></td>";
      tbody.appendChild(tr);
    }
  });

})();
