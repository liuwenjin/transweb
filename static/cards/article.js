transweb_cn({
    className: "MarkDownArticle",
    border: "none",
    overflow: "auto",
    cardName: "transwebArticleViewer",
    task: {
        style: {
            "padding": "15px 30px",
            "max-width": "800px",
            "min-height": "100%"
        },
        data: '# 测试',
        promise: {
            beforeRender: function (container, data, task) {},
            afterRender: function (container, data, task) {
                $("<hr />").appendTo(container.children[0]);
            }
        },
        // url: "articles/introduce.txt",
        requestType: "get",
        dataType: "text"
    }
})