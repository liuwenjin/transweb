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

    if (data.records && Object.keys(data.records).length > 0) {
      for (var i = 0; i < data.header.length; i++) {
        var tr = document.createElement("tr");
        var td = document.createElement("td");
        tr.appendChild(td);
        td.innerHTML = "<p class='InfoTable_itemName'>" + data.header[i].name + "</p>";
        if (data.header[i].key || data.header[i].render) {
          var td = document.createElement("td");
          tr.appendChild(td);
		  if(typeof(data.header[i].render) === "function") {
			  var info = data.header[i].render(data.records[data.header[i].key], data);  
		  }
		  else {
			  var info = data.records[data.header[i].key];  
      }  
      if(info === undefined || info === null) {
        info = "-";
      }
		  td.innerHTML = "<p class='InfoTable_itemInfo'>" + info + "</p>";
        }
		else{
		  td.setAttribute("colspan", 2);
		}
        tbody.appendChild(tr);
      }
    } else {
      var tr = document.createElement("tr");
      tr.innerHTML = "<td colspan=2><p class='DataTable_emptyTip'>当前列表为空</p></td>";
      tbody.appendChild(tr);
    }
  });

})();
