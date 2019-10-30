(function () {
  var config = {
    html: "layout.html"
  }
  webCpu.regComponent("Carousel", config, function (container, data, task) {
    var randomId = "carousel-" + (new Date()).getTime();
    var carouselSelector = $(container).find(".carousel");
    carouselSelector.attr("id", randomId);
    var innerSelector = carouselSelector.children(".carousel-inner");
    innerSelector.html("");
    var indicators = $(container).find(".carousel-indicators");
    indicators.html("");
    for (var i = 0; i < data.length; i++) {
      var itemSelector = $('<div class="item"><img src="' + data[i].image + '" alt="..."><div class="carousel-caption"></div></div>');
      itemSelector.appendTo(innerSelector);
      $('<li data-target="#' + randomId + '" data-slide-to="' + i + '"></li>').appendTo(indicators);
      if (data[i].title) {
        $("<h3>" + data[i].title + "</h3>").appendTo(itemSelector.find(".carousel-caption"));
      }
      if (data[i].text) {
        $("<p>" + data[i].text + "</p>").appendTo(itemSelector.find(".carousel-caption"));
      }
    }

    itemSelector.find("li:eq(0)").addClass("active");
    innerSelector.find(".item:eq(0)").addClass("active");

    $(container).find(".carousel-control").attr("href", "#" + randomId);
    $(container).find('.carousel').carousel({
      interval: task.interval * 1000
    });
  });

})();