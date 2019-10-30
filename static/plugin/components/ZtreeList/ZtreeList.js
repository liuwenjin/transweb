webCpu.regComponent("ZtreeList", {
    css: "zTreeStyle.css",
    script: {
        all: "jquery.ztree.all.min.js"
    }
}, function (container, data, task) {
    task.tree = $.fn.zTree.init($(container), task.option, task.data);
});