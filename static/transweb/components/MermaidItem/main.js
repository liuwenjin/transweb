webCpu.regComponent("MermaidItem", {
  script: "mermaid.js",
  style: "style.css",
  html: "<pre class='mermaid'></pre>"
}, function (container, data, task) {
  let removeInvisibleUnicode = function (str) {
    let doc = document.createElement("div");
    doc.innerHTML = str;
    return doc.textContent;
  }
  data.script = data.script || "";
  data.script = removeInvisibleUnicode(data.script);
  $(container).find("pre").text(data.script);
  data.params = data.params || {
    theme: 'neutral',
  }
  setTimeout(async () => {
    mermaid.initialize({ startOnLoad: true });
    await mermaid.run({
      querySelector: '.mermaid',
    });
  }, 200);

});