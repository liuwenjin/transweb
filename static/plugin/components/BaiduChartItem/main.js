webCpu.regComponent("BaiduChartItem", {
    script: {
        echarts: "script.js",
        xls: "xlsx.full.min.js"
    }
}, function (container, data, task) {
    var s = document.getElementById("BaiduMapScript");
    if (s) {
        task.init = 1;
    }
    if (task.mapApi && !task.init) {
        var url = WebTool.attachParams(task.mapApi.url, task.mapApi.param);
        var _bMap = "components/BaiduChartItem/bmap.min.js";
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.id = "BaiduMapScript";
        script.src = url + "&callback=BaiduMapCallback";
        document.body.appendChild(script);
        window.BaiduMapCallback = function () {
            WebAdapter.load(_bMap, function () {
                task.chart = echarts.init(container);
                task.chart.setOption(task.option);
                task.init = 1;
                task.bMap = task.chart.getModel().getComponent("bmap").getBMap();
                if(task.promise && typeof(task.promise.afterMapLoaded) === "function") {
                    task.promise.afterMapLoaded(container, data, task);
                }
            });
        }
        
    } else {
        task.chart = echarts.init(container);
        task.chart.setOption(task.option);
        if(task.mapApi) {
            task.bMap = task.chart.getModel().getComponent("bmap").getBMap();
        }
        if(task.promise && typeof(task.promise.afterMapLoaded) === "function") {
            task.promise.afterMapLoaded(container, data, task);
        }
    }
});
