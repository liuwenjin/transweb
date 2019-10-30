(function () {
  var config = {
    css : "style.css"
  } 
  
  webCpu.regComponent("JsonEditor", config, function (container, data, task) {
    container.innerHTML = "";
    var table = document.createElement("table");
    table.setAttribute("class", "table");
	if(task.title) {
		var caption = document.createElement("caption");
		caption.innerHTML = "<span class='JsonEditor_tilte'>" + task.title + "</span>";
		table.appendChild(caption);
	}
	var tbody = document.createElement("tbody");
    table.appendChild(tbody);
	container.appendChild(table);
	
    if (data && Object.keys(data).length > 0) {      
      for (var k in data) {
        var tr = document.createElement("tr");
		var td = document.createElement("td");
		tr.appendChild(td);
		var title = k ;
		if(task.map && task.map[k]) {
			title = task.map[k];
		}
		if(task.dataMode && task.dataMode[k] && task.dataMode[k].title) {
			title = task.dataMode[k].title;
		}		
		td.innerHTML = "<span class='JsonEditor_name'>" + title + "</span>";
		var td = document.createElement("td");
		tr.appendChild(td);
		var tData = {};
		if(task.dataMode && task.dataMode[k]) {
			tData = task.dataMode[k]
		}
		var inputContainer = initEditItem(tData, k, data[k]);
		td.appendChild(inputContainer);
        tbody.appendChild(tr);
      }     
	}
	else {
		var tr = document.createElement("tr");
		tr.innerHTML = "<td colspan=2><p class='JsonEditor_emptyTip'>当前列表为空</p></td>";
		tbody.appendChild(tr);
	}
	
	task.getJsonData = function() {
		var selector = $(task.container).find(".JsonEditor_container");
		for(var i = 0; i < selector.length; i++) {
			var key = selector.eq(i).attr("key");
			var type = selector.eq(i).attr("type");
			if(type === "radio") {
				task.data[key] = selector.eq(i).find(".JsonEditor_input:checked").val();
			}
			else if(type === "checkbox") {
				task.data[key] = [];
				var t = selector.eq(i).find(".JsonEditor_input:checked");
				for(var k = 0; k < t.length; k++) {
					task.data[key].push(t.eq(k).val());
				}
			}
			else if(type === "content") {
				task.data[key] = selector.eq(i).html() ;
			}
			else {
				task.data[key] = selector.eq(i).find(".JsonEditor_input").val();
			}	
		}
		return task.data;		
	}
	
  });
  
  function initEditItem(data, name, value) {
	var container = document.createElement("div");  
	container.setAttribute("class", "JsonEditor_container");
	container.setAttribute("unit", data.unit);
	container.setAttribute("key", name);
	container.setAttribute("type", data.type);
	if(data.type === "select") {
		var label = document.createElement("label");
		label.setAttribute("class", "JsonEditor_inputItem");
		var selectItem = document.createElement("select");		
		selectItem.setAttribute("name", "JsonEditor_input_" + name);
		selectItem.setAttribute("class", "JsonEditor_input");
		label.appendChild(selectItem);
		for(var k in data.options) {
			var optionItem = document.createElement("option");			
			if(typeof(data.options[k]) === "string") {
				optionItem.innerHTML = data.options[k];
				optionItem.setAttribute("value", data.options[k]);
			}
			else {
				optionItem.innerHTML = data.options[k].name;
				optionItem.setAttribute("value", data.options[k].value);
			}
			selectItem.appendChild(optionItem);
		}	
		$(selectItem).val(value);
		container.appendChild(label);
	}
	else if(data.type === "radio" || data.type === "checkbox") {		
		for(var k in data.options) {
			var label = document.createElement("label");
			label.setAttribute("class", "JsonEditor_inputItem");
			if(typeof(data.options[k]) === "string") {
				label.innerHTML = "<input name='JsonEditor_input_"+name+"' type='"+data.type+"' value='"+data.options[k]+"' /><span>"+data.options[k]+"</span>";
			}
			else {
				label.innerHTML = "<input name='JsonEditor_input_"+name+"' type='"+data.type+"' value='"+data.options[k].value+"' /><span>"+data.options[k].name+"</span>";				
			}
			container.appendChild(label);
		}
		if(typeof(value) === "string") {
			$(container).find("input[value="+value+"]").attr("checked", true);
		}
		else {
			for(var i in value) {
			  $(container).find("input[value="+value[i]+"]").attr("checked", true);	
			}
		}
		$(container).find("input").attr("class", "JsonEditor_input");
	}
	else if(data.type === "content")  {
		container.innerHTML = value
	}
	else {
		var label = document.createElement("label");
		label.setAttribute("class", "JsonEditor_inputItem");
		// label.innerHTML = "<input name='JsonEditor_input_"+name+"' type='"+data.type+"' />"
		label.innerHTML = "<input name='JsonEditor_input_"+name+"' type='text' />"
		container.appendChild(label);
		$(container).find("input").val(value);
		$(container).find("input").attr("class", "JsonEditor_input");
	}
	
	return container;
  }
  

})();
