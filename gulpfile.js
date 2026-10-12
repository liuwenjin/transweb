const {
  src,
  dest,
  task
} = require('gulp');
const concat = require('gulp-concat');
const terser = require('gulp-terser');
// const sourcemaps = require('gulp-sourcemaps');
// var cssUglify = require('gulp-minify-css');
var comPath = "./static/transweb/components/";
var customPath = "./static/";
var taskList = [{
  name: "CardItem",
  files: [
    "snapdom.js",
    "jszip.min.js",
    "html2canvas.min.js",
    "jquery-3.6.0.min.js",
    "bootstrap/bootstrap.min.js",
    "jquery.qrcode.js",
    "markdown.min.js",
    "gsap.min.js",
    "ztext.min.js",
    "jsmind.js",
    "utf.js"
  ]
}, {
  name: "WebCpu",
  prefix: customPath,
  outputName: "webCpu.min.js",
  outputPath: customPath + "transweb/",
  files: [
    "transweb/webCpu.js",
  ]
}, {
  name: "ElementVueItem",
  files: [
    "vue.global.js",
    "index.full.js",
    "vue-i18n.global.js",
    "icons-vue.js",
    'iconify-icon.min.js',
    "mitt.umd.js",
    "zh-cn.js",
    "en.js"
  ]
}, {
  name: "MathBox",
  files: [
    "three.min.js",
    "OrbitControls.js",
    "mathbox-bundle.min.js"
  ]
}, {
  name: "EchartsItem",
  files: [
    "echarts.min.js",
    "echarts-wordcloud.min.js",
  ]
}, {
  name: "transweb",
  prefix: customPath,
  outputName: "index.js",
  outputPath: customPath,
  files: [
    "transweb/webCpu.js",
    "transweb/config.js",
    "transweb/vueSfcEditor.js",
    "transweb/aigcPlugin.js",
    "common/language.js",
    "common/math.js"
  ]
}, {
  name: "localBook",
  prefix: customPath,
  outputName: "localBook.js",
  outputPath: customPath + "webApps/document/",
  files: [
    "transweb/webCpu.js",
    "common/html2canvas.min.js",
    "transweb/components/CardItem/_main.js",
    "transweb/components/ElementVueItem/_main.js",
    "transweb/components/TemplateItem/_main.js",
    "transweb/components/ArticleEditor/_main.js",
    "transweb/components/MarkdownArticle/_main.js",
    "transweb/components/CodeEditor/_main.js",
    "transweb/components/EchartsItem/_main.js",
    "transweb/components/PhaserItem/_main.js"
  ]
}, {
  name: "CodeEditor",
  files: [
    "codemirror.min.js",
    // "CodeMirror/lib/codemirror.js",
    "CodeMirror/mode/css/css.js",
    "CodeMirror/mode/javascript/javascript.js",
    "CodeMirror/mode/xml/xml.js",
    "CodeMirror/mode/htmlmixed/htmlmixed.js",
    "CodeMirror/mode/vue/vue.js",
    "CodeMirror/mode/clike/clike.js",
    "CodeMirror/mode/sql/sql.js",
    "CodeMirror/mode/jsx/jsx.js",
    "CodeMirror/mode/go/go.js",
    "CodeMirror/mode/shell/shell.js",
    "CodeMirror/mode/nginx/nginx.js",
    "CodeMirror/mode/python/python.js",
    "CodeMirror/mode/markdown/markdown.js",
    "CodeMirror/addon/selection/active-line.js",
    "CodeMirror/addon/fold/foldcode.js",
    "CodeMirror/addon/fold/indent-fold.js",
    "CodeMirror/addon/fold/foldgutter.js",
    "CodeMirror/addon/fold/xml-fold.js",
    "CodeMirror/addon/fold/brace-fold.js",
    "CodeMirror/addon/fold/comment-fold.js",
    "CodeMirror/addon/hint/show-hint.js",
    "CodeMirror/addon/hint/javascript-hint.js",
    "CodeMirror/addon/hint/css-hint.js",
    "htmlhint.js",
    "CodeMirror/addon/hint/xml-hint.js",
    "CodeMirror/addon/lint/lint.js",
    "CodeMirror/addon/lint/javascript-lint.js",
    "CodeMirror/addon/lint/html-lint.js",
    "CodeMirror/addon/mode/overlay.js",
    "jshint.js",
    "csslint.js",
    "babel.min.js",
  ]
}]

for (let i = 0; i < taskList.length; i++) {
  let d = taskList[i];
  let name = d.name;
  let arr = d.files.map(item => {
    let path = comPath + name + "/" + item;
    if (d.prefix) {
      path = d.prefix + item;
    }
    console.log("task file:", path)
    return path;
  });
  task(name, function () {
    let outputName = d.outputName || 'script.js';
    let outputPath = d.outputPath || comPath + name + "/";
    return src(arr)
      .pipe(terser())
      .pipe(concat(outputName))
      .pipe(dest(outputPath));
  });
}