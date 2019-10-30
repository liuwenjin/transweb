
webCpu.regComponent("WebApp", {}, function (container, data, task) {
    var iframe = container.getElementsByTagName("iframe")[0];
    if(!iframe) {
        iframe = document.createElement("iframe");
        iframe.setAttribute('frameBorder', '0');
        iframe.setAttribute('scrolling', 'no');
        iframe.style.cssText = 'height:100%;width:100%;float:none;position:absolute;overflow:hidden;z-index:0;margin:0;padding:0;border:0 none;background:none;';
        container.appendChild(iframe);
        task.iframe = iframe;
        container.style.position = "relative";
    }
    var url = task.option.url;

    if(typeof(data) === "string" && task.option.param) {
        task.option.param.path = data;
    }
    else {
        iframe.contentWindow.name = WebTool.objectToString(data);;
        task.option.windowName = "";
    }

    if(task.option.param) {
       url = WebTool.attachParams(url, task.option.param); 
    }

    iframe.src = url;
    
    // setTimeout(function(){ iframe.contentWindow.onclick = function(){ alert("click iframe!"); }; }, 3000)
    //iframe.contentWindow.onclick = function(){ alert("click iframe!"); };
    task.iframe = iframe;

    task.switchService = function(d) {
        this.iframe.contentWindow.postMessage(d, "*");
    }
    
});
  
