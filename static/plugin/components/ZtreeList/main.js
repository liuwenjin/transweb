webCpu.regComponent("ZtreeList", {
    css: {
        self: "zTreeStyle.css",
        custom: "custom.css"
    },
    script: {
        all: "jquery.ztree.all.min.js"
    }
}, function (container, data, task) {
    $(container).html("");
    if(task.data && task.data.length !== 0) {
        var tree = $('<ul id="transwebTree" class="ztree"></ul>');
        tree.appendTo(container);
        task.tree = $.fn.zTree.init(tree, task.option, task.data);
    }
});