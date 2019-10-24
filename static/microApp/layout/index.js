transweb_cn({
    "style": {
        "padding": '5px 15px'
    },
    title: "福音图书馆",
    task: {
        option: {
            listName: "类别",
            listData: ["传记", "小说", "教义"],
            buttonList: ["搜索", "收藏夹", "阅读历史"],
            buttonMap: {
                "搜索": "search",
                "收藏夹": "favorites",
                "阅读历史": "history"
            } 
        },

        template: '<div style="padding: 10px 0px;"><div style="display: inline-block;" class="leftBtnArea dropdown btn-group">\
                        <button type="button" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span class="listName">类别</span><span class="caret"></span></button>\
                        <ul class="dropdown-menu" aria-labelledby="dLabel"><li><a href="#">Action</a></li></ul></div>\
                        <div style="display: inline-block; float: right;" class="btn-group rightBtnArea" role="group" aria-label="..."></div></div>\
                    <div component="CardItem" cardName="testA" style="width: 100%; height: calc( 100% - 50px ); position: relative; text-align: center;"></div>',
        promise: {
            beforeRender: function (container, data, task) {
                
            },
            afterRender: function (container, data, task) {
                task.updateLeftBtnArea();
                task.updateRightBtnArea();
                $(container).find(".rightBtnArea button").on("click", function(){
                    var name = $(this).attr("title");
                    var title = name;
                    if(name === "搜索") {
                        title = '<div class="input-group"> \
                                    <input type="text" class="form-control" placeholder="Search for..."> \
                                    <span class="input-group-btn"> \
                                    <button class="btn btn-default" type="button"><i class="glyphicon glyphicon-search" /></button>\
                                    </span> \
                                </div>'
                    }
                    var value = task.option.buttonMap[name];
                    webCpu["CardItem"].moduleDialog(webCpu.cards.main, value, {
                        title: title,
                        closeType: "back"
                    });
                });
            }
        },
        updateRightBtnArea: function(arr) {
            arr = arr || this.option.buttonList;
            var aSelector = $(this.container).find(".rightBtnArea");
            aSelector.html("");
            for(var i = 0; i < arr.length; i++) {
                $('<button type="button" title="'+arr[i]+'" style="width: 100px;" class="btn btn-sm btn-default">'+arr[i]+'</button>').appendTo(aSelector);
            }
        },
        updateLeftBtnArea: function(name, arr) {
            name = name || this.option.listName;
            arr = arr || this.option.listData;
            $(this.container).find(".leftBtnArea>button>.listName").html(name);
            var listSelector = $(this.container).find(".leftBtnArea>.dropdown-menu");
            listSelector.html("");
            for(var i = 0; i < arr.length; i++) {
                $('<li style="cursor: pointer;"><a>'+arr[i]+'</a></li>').appendTo(listSelector);
            }
        }

    }
});