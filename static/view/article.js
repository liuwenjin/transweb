transweb_cn({
    border: "none",
    overflow: "auto",
    cardName: "transwebArticleViewer",
    task: {
        style: {
            "padding": "15px 30px",
            "max-width": "800px",
            "min-height": "100%"
        },
        template: '<div>Hello world!</div>',
        promise: {
            beforeRender: function (container, data, task) {},
            afterRender: function (container, data, task) {
                
            }
        },
        requestType: "get",
        dataType: "text"
    }
})