(function () {
  var config = {
    script: "pdf.js"
  }
  function calcScale(container, view) {
    var rect = container.getBoundingClientRect();
    var w = view[2] - view[0];
    var h = view[3] - view[1];
    var scale = Math.min(1, rect.width/w);
    scale = Math.min(scale, rect.height/h);
    return scale;
  }
  webCpu.regComponent("PdfViewer", config, function (container, data, task) {
    container.innerHTML = "";
    var canvas = document.createElement("canvas");
    container.appendChild(canvas);
    
    var url = webCpu.PdfViewer.getPath('demo.pdf');
    pdfjsLib.workerSrc = webCpu.PdfViewer.getPath('pdf.worker.js');
    pdfjsLib.getDocument(url).then(function getPdfHelloWorld(pdf) {
      pdf.getPage(1).then(function getPageHelloWorld(page) {
        var scale = calcScale(container, page.view);
        var viewport = page.getViewport(scale);
        var context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        var renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        page.render(renderContext);
      });
    });

  });

})();