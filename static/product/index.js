transweb_cn({
    "className": 'ListMenu',
    cardName: "microIndex",
    task: {
        data: [{
            title: "Echarts可视化组件",
            content: [{
                title: "饼图",
                key: "golaxy_pie",
                url: ""
            }, {
                title: "折线图",
                key: "golaxy_line",
                url: ""
            }, {
                title: "柱形图",
                key: "golaxy_column",
                url: ""
            }, {
                title: "地图",
                key: "golaxy_map",
                url: ""
            }, {
                title: "散点图",
                key: "golaxy_scatter",
                url: ""
            }, {
                title: "树形图",
                key: "golaxy_tree",
                url: ""
            }, {
                title: "关系图",
                key: "golaxy_relationship",
                url: ""
            }, {
                title: "漏斗图",
                key: "golaxy_funnel",
                url: ""
            }, {
                title: "热力图",
                key: "golaxy_heatMap",
                url: ""
            }, {
                title: "雷达图",
                key: "golaxy_radar",
                url: ""
            }]
        }, {
            title: "D3可视化图表",
            content: [{
                title: "柱形图",
                key: "golaxy_column",
                url: ""
            }]
        }, {
            title: "Cesium可视化",
            content: [{
                title: "测试",
                key: "golaxy_column",
                url: ""
            }]
        }, {
            title: "ThreeJS可视化",
            content: [{
                title: "测试",
                key: "golaxy_3dMapBasic",
                url: ""
            }, {
                title: "测试1",
                key: "golaxy_test3d",
                url: ""
            }]
        }, {
            title: "布局组件",
            content: [{
                title: "带背景组件的布局",
                key: "golaxy_layout",
                url: ""
            }]
        }, {
            title: "其它",
            content: [{
                title: "可以调整的布局",
                key: "golaxy_gridLayout",
                url: ""
            }, {
                title: "PDF预览",
                key: "golaxy_pdf",
                url: ""
            }, {
                title: "表单输入",
                key: "golaxy_modelConfig",
                url: ""
            }, {
                title: "关系图表",
                key: "golaxy_cytoscape",
                url: ""
            }, {
                title: "卡片列表",
                key: "golaxy_cardList",
                url: ""
            }, {
                title: "人物关系图谱",
                key: "golaxy_peopleRelation",
                url: ""
            }, {
                title: "卡片列表1",
                key: "golaxy_listGroup",
                url: ""
            }, {
                title: "新闻标题列表",
                key: "golaxy_newsItems",
                url: ""
            }]
        }],
        clickCallback: function (e, d) {

        },
        prefix: "product/",
        updateAction: function (d) {
            var _self = this;
            var action = function (e, tData) {
                if (typeof (_self.clickCallback) === "function") {
                    _self.clickCallback(e, d);
                }
            };
            if (d && d.constructor.name === "Array") {
                for (var i = 0; i < d.length; i++) {
                    this.updateAction(d[i]);
                }
            } else {
                if (d.key) {
                    d.url = this.prefix + d.key + ".js";
                    d.action = function (e) {
                        action(e, d);
                    }
                }
            }
            if (d.content) {
                this.updateAction(d.content);
            }
        },
        promise: {
            beforeRender: function (container, data, task) {
                task.updateAction(data);
    
            }
        }
    }
});