(function () {
  var config = {
    css : "style.css"
  }
  webCpu.regComponent("PopupDialog", config, function (elem, data, task) {
	$(elem.parentNode).find(".PopupDialog").addClass("PopupDialog_olderContainer"); 
	$(elem).removeClass("PopupDialog_olderContainer");
	$(elem.parentNode).find(".PopupDialog_olderContainer").remove();
    var container = document.getElementById("tPopupDialog");
	if(container) {
		container.parentNode.removeChild(container);
	}
	
	container = document.createElement("div");
	container.id = "tPopupDialog";
	document.body.appendChild(container);	
	var myDialog = document.createElement("div");
	myDialog.setAttribute("class", "PopupDialog_container");
	container.appendChild(myDialog);
	elem.appendChild(container);
	
	initDialog(myDialog);
	
	task.props = task.props || {};
		
	var w = task.props.width || 300;
	var h = task.props.height || 50;
	
	for(var k in task.props) {
		if(k === "width" || k === "height") {
			$(container.parentNode).css(k, task.props[k]);
		}
		else {
			$(container).css(k, task.props[k]);
		}
		
	}

	$(container).width(w);
	$(container).height(h);	
	
	if(task.title) {
		$(container).find(".PopupDialog_title").html(task.title);
	}
	else {
		$(container).find(".PopupDialog_header").hide();
	}
	
	var _h = $(container).find(".PopupDialog_content") - $(container).find(".PopupDialog_header")[0].clientHeight;
	$(container).find(".PopupDialog_content").height(_h);
	
	if(task.data && task.data.className) {
		task.data.task.container = $(container).find(".PopupDialog_content")[0];
		webCpu.render(task.data.className, task.data.task, task.data.components || webCpu.componentPath || "/components");
	}

	$(container.parentNode).width(0);
	$(container.parentNode).height(0);
	$(container.parentNode).css("position", "absolute");
	
  });
  
  function initDialog(container) {
	container.innerHTML = "";
	
	var header = document.createElement("label");		
	header.setAttribute("class", "PopupDialog_header");
	container.appendChild(header);
	
	var content = document.createElement("div");
	content.setAttribute("class", "PopupDialog_content");
	container.appendChild(content);
	
	var closeBtn = document.createElement("span");
	closeBtn.innerHTML = "X";
	closeBtn.setAttribute("class", "PopupDialog_closeBtn");
	
	header.appendChild(closeBtn);
	
	var title = document.createElement("span");
	title.innerHTML = "标题...";
	title.setAttribute("class", "PopupDialog_title");
	
	header.appendChild(title);  
	
	$(closeBtn).on("click", function() {
		$("#tPopupDialog").hide();
	});
	
  }
  
  
})();
