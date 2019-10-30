(function () {
  var config = {
    css: "style.css"
  }
  webCpu.regComponent("TableLayout", config, function (container, data, task) {
    container.innerHTML = "";
    var table = document.createElement("table");
    table.setAttribute("class", "TableLayout_Table");
    table.setAttribute("border", "0");
    table.setAttribute("cellspacing", "0");
    table.setAttribute("cellpadding", "0");
    table.setAttribute("state", task.state|| "");
    table.setAttribute("borderspacing", "0");
    table.setAttribute("state", task.state||"");
    table.width = task.unit[0] * task.column;
    table.height = task.unit[1] * task.row;

    container.appendChild(table);
    for (var i = 0; i < task.row; i++) {
      var row = table.insertRow(0);
      // row.style = "height:" + task.unit[1] + "px;";
      row.setAttribute("height", task.unit[1] + "px");
      for (var j = 0; j < task.column; j++) {
        var cell = row.insertCell(0);
        cell.style = "position: relative; width:" + task.unit[0] + "px; height: " + task.unit[1] + "px; display: table-cell;";
        cell.setAttribute("width", task.unit[0] + "px");
        cell.setAttribute("height", task.unit[1] + "px");
        var area = document.createElement("div");
        area.setAttribute("class", "TableLayout_container");
        area.style = "height: " + task.unit[1] + "px; width: " + task.unit[0] + "px";
        cell.appendChild(area);
      }
    }
    task.table = table;
  });

  webCpu["TableLayout"].getItemInfo = function (table, pos) {
    var temp = table.rows[pos[0]].cells[pos[1]];
    var container = temp.getElementsByClassName("TableLayout_container")[0];
    var myItem = container.querySelector("[component]");
    if (!myItem) {
      var itemInfo = {
        type: "html",
        value: container.childNodes
      }
    } else {
      var itemInfo = {
        type: "component",
        name: myItem.getAttribute("component"),
        task: myItem.getAttribute("task")
      }
    }
    return itemInfo;
  }
})();