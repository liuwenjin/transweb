webCpu.regComponent("CodeEditor", {
  css: ".CodeEditor .CodeMirror { height: 100%; }"
}, function (container, data, task) {
  var display = $(container.parentNode.parentNode).css("display");
  if (container) {
    $(container.parentNode.parentNode).css("display", "block");
    container.innerHTML = "";
    task.options = task.options || {};
    task.options.value = data;
    task.options.lineNumbers = task.options.lineNumbers || true;
    task.options.mode = task.options.mode || "javascript";
    task.editor = new CodeMirror(container, task.options);
    task.editor.on("change", function (e) {
      task.data = e.getValue();
      if(task.promise && typeof(task.promise.contentChange) === "function") {
        task.promise.contentChange(task.data, task);
      }
    });

    task.editor.setOption("extraKeys", {
      "F11": function(cm) {
        cm.setOption("fullScreen", !cm.getOption("fullScreen"));
      },
      "Esc": function(cm) {
        if(cm.getOption("fullScreen")) {
          cm.setOption("fullScreen", false);
        }
      }
    });
    
    if(task.promise && typeof(task.promise.contentChange) === "function") {
      task.promise.contentChange(task.data, task);
    }
    $(container.parentNode.parentNode).css("display", display);
  }
});