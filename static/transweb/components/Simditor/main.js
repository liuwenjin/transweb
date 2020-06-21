webCpu.regComponent("Simditor", {
  script: "script.js",
  css: "simditor.css"
}, function (container, data, task) {
  $(container).html("");
  task.option = task.option || {
    toolbar: [
      'title',
      'bold',
      'italic',
      'underline',
      'strikethrough',
      'fontScale',
      'color',
      'ol',
      'ul',
      'blockquote',
      'code',
      'link',
      'hr',
      'alignment'
    ]
  }; 
  task.option.textarea = $(container);
  task.editor = new Simditor(task.option);
  
  $(container).remove();
  task.editor.setValue(data || "#请输入#");
  task.editor.on('valuechanged', (e, src) => {
    task.data = task.editor.getValue();
    if(task.promise && typeof(task.promise.valueChange) === "function") {
      task.promise.valueChange(task.data);
    }
  })
});