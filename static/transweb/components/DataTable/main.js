webCpu.regComponent("DataTable", {
  css: "style.css"
}, function (container, data, task) {
  container.innerHTML = "";
  var table = document.createElement("table");
  table.setAttribute("class", "table table-striped");
  if (typeof (task.caption) !== "undefined") {
    var caption = document.createElement("caption");
    caption.innerHTML = task.caption;
    table.appendChild(caption);
  }
  task.option = task.option || {};
  task.header = task.option.header || task.header;
  task.headerArea = {};
  var tbody = document.createElement("tbody");
  var thead = document.createElement("thead");
  table.appendChild(tbody);
  table.appendChild(thead);
  if (task.header && task.header.length > 0 && data) {
    var tr = document.createElement("tr");
    if (task.numbered !== undefined) {
      var th = document.createElement("th");
      th.innerHTML = "<div  class='DataTable_tdContent' >" + (task.numbered.name || "序号") + "</div>";
      tr.appendChild(th);
    }

    for (var i = 0; i < task.header.length; i++) {
      if (task.header[i].hidden) {
        continue;
      }
      var th = document.createElement("th");
      th.innerHTML = "<div  class='DataTable_tdContent'  key='" + task.header[i].key + "'>" + task.header[i].name + "</div>";
      tr.appendChild(th);
      if (task.header[i].style) {
        $(th).children("div").css(task.header[i].style);
      }
    }

    thead.appendChild(tr);

    var count = i;
    for (var i = 0; i < data.length; i++) {
      var tr = document.createElement("tr");
      tr.setAttribute("index", i);
      if (task.numbered) {
        var td = document.createElement("td");
        td.innerHTML = (i + 1);
        tr.appendChild(td);
      }
      for (var j = 0; j < task.header.length; j++) {
        if (task.header[j].hidden) {
          continue;
        }
        var td = document.createElement("td");
        var str = "";
        var w = task.header[j].width;
        if (typeof (task.header[j].render) === "function") {
          var v = "";
          var k = task.header[j].key;
          if(k && data[i][k]) {
            v = data[i][k];
          }
          str = task.header[j].render(v, data[i], task.header[j].key);
        } else if (typeof (task.header[j].key) === "string") {
          if (data[i][task.header[j].key] !== undefined) {
            var str = data[i][task.header[j].key];
            v = data[i][task.header[j].key];
          }
        }
        td.innerHTML = "<div key='" + task.header[j].key + "' class='DataTable_tdContent' style='width: " + w + ";' title='" + v + "'>" + str + "</div>";
        if (task.header[j].style) {
          $(td).children("div").css(task.header[j].style);
        }
        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    }


    if (i === 0) {
      var tr = document.createElement("tr");
      tr.innerHTML = "<td style='color: #999;' colspan='" + count + "'><p class='DataTable_emptyTip'>当前列表为空</p></td>";
      tbody.appendChild(tr);
    }
    container.appendChild(table);

    setTimeout(function () {
      $(container).find("tbody>tr").css("transform", "translateX(0)");
    }, 1500);
  }

  if (!data) {
    var tr = document.createElement("tr");
    tr.innerHTML = "<td style='color: #999;' colspan='" + count + "'><p class='DataTable_emptyTip'>当前列表为空</p></td>";
    tbody.appendChild(tr);
  }
  $(container).css("overflow", "auto");
  function scrollHandle(e) {
    var scrollTop = this.scrollTop;
    this.querySelector('thead').style.transform = 'translateY(' + scrollTop + 'px)';
  }
  container.addEventListener('scroll', scrollHandle);

});