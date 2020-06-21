transweb_articleEditor({
  className: "Simditor",
  cardName: "transwebArticleEditor",
  task: {
    data: "",
    empty: 1,
    promise: {
      beforeRender: function (container, data, task) {

      },
      afterRender: function (container, data, task) {
        setTimeout(function () {
          var w = $(container).width();
          if (w < 700) {
            $(container.parentNode).find(".simditor-body").css({
              "paddingTop": "90px"
            });
          } else {
            $(container.parentNode).find(".simditor-body").css({
              "paddingTop": "45px"
            });
          }
        }, 200)

      }
    }
  }
})