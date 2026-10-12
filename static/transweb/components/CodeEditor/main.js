webCpu.regComponent("CodeEditor", {
  css: {
    temp: "codemirror.css",
    style: "style.css",
    "show-hint": "CodeMirror/addon/hint/show-hint.css",
    "lint": "CodeMirror/addon/lint/lint.css",
    "foldgutter": "CodeMirror/addon/fold/foldgutter.css",
  },
  script: {
    codeEditor: "script.js",
    jsBeautifier: "beautifier.min.js"
  },
}, function (container, data, task) {



  // console.log("CodeEditor container", container);
  // 自定义错误检查函数 
  window.jslint = window.JSHINT;

  function customLinter(text) {
    var found = [];


    // ====== 原来逻辑：JS 对象 / 普通 HTML / JS 检测 ======
    window.jslint = window.JSHINT;

    if (task.codeType === "jsObj") {
      text = "test(" + text + ");";
    } else if (task.codeType === "vue") {
      // 这一段不再需要，因为上面已经单独处理 vue
    } else { }

    var errArray = [];

    // Vue SFC 专用分支：直接用字符串检测，不再走 HTMLHint / JSHint
    if (task.codeType === "vue") {
      errArray = vueSfcLinter(text);
      console.log("errArray", errArray);
      // return errArray;
    }
    if (task.options.mode !== "javascript") {
      errArray = errArray.concat(HTMLHint.verify(text));
    } else {
      JSHINT(text);
      errArray = JSHINT.errors;
    }

    var ignoreArr = task.ignoreErrors || [
      "W030",
      "W033",
      "W104",
      "W119",
      "W061",
      "W025",
      "spec-char-escape",
      "doctype-first",
      "attr-lowercase",
      "attr-value-double-quotes"
    ];

    console.log("errArray---: ", errArray);

    errArray = errArray.filter(item => item.severity !== "warning");
      

    for (var i = 0; i < errArray.length; ++i) {
      var error = errArray[i];
      if (!error) continue;

      if (!error.code && error.rule && error.rule.id) {
        error.code = error.rule.id;
      }

      if (ignoreArr.indexOf(error.code) !== -1) {
        continue; // 忽略特定错误
      }

      let tItem = {
        from: error.from || CodeMirror.Pos(error.line - 1, (error.character || error.col) - 1) || { ch: 0, line: 0},
        to: error.to || CodeMirror.Pos(error.line - 1, (error.character || error.col)) || { ch: 0, line: 0},
        message: error.message || error.reason,
        severity: error.severity || "error"
      };
      found.push(tItem);
    }

    console.log("found: ", found);

    return found;
  }

  /**
   * Vue SFC 检测入口
   * text: 整个 .vue 文件的字符串
   */
  function vueSfcLinter(text) {
    var found = [];

    // 1) 粗暴解析出 <template> / <script> 块（不依赖 compiler-sfc，完全浏览器安全）
    var blocks = parseSfcBlocks(text);
    var templateBlock = blocks.template;
    var scriptBlocks = blocks.scripts;

    // 2) Template 语法检测（依赖 Vue.compile）
    if (templateBlock && templateBlock.content.trim()) {
      try {
        // 如果用的是 vue.global.js（带 compiler），这里会存在 Vue.compile
        Vue.compile(templateBlock.content);
      } catch (e) {
        found.push({
          from: offsetToPos(text, templateBlock.startOffset),
          to: offsetToPos(text, templateBlock.endOffset),
          message: e.message || "Template compile error",
          severity: "error"
        });
      }
    }

    // 3) Script 语法检测（用 Babel 解析，不执行代码）
    var allScriptCode = "";
    scriptBlocks.forEach(function (b) {
      allScriptCode += b.content + "\n";
      if (b.content.trim()) {
        try {
          Babel.transform(b.content, { presets: ["env"] });
        } catch (e) {
          // 直接把整个 script 块标红即可，精确行号可以后面再升级
          found.push({
            from: offsetToPos(text, b.startOffset),
            to: offsetToPos(text, b.endOffset),
            message: e.message || "Script syntax error",
            severity: "error"
          });
        }
      }
    });

    // 4) Template 中使用的变量是否在 Script 中定义（简单版变量分析）
    if (templateBlock && allScriptCode.trim()) {
      var jsVars = collectJsVars(allScriptCode);
      var tplVars = collectTemplateVars(templateBlock.content);

      tplVars.forEach(function (v) {
        if (!jsVars.has(v)) {
          found.push({
            from: offsetToPos(text, templateBlock.startOffset),
            to: offsetToPos(text, templateBlock.endOffset),
            message: "模板变量未定义: " + v,
            severity: "warning"
          });
        }
      });
    }

    return found;
  }

  /**
   * 轻量级 SFC 解析器：只关心 template / script，不处理 style
   */
  function parseSfcBlocks(text) {
    var result = {
      template: null,
      scripts: []
    };

    // 匹配 <template> ... </template>
    var tplRe = /<template[^>]*>([\s\S]*?)<\/template>/i;
    var tplMatch = tplRe.exec(text);
    if (tplMatch) {
      var inner = tplMatch[1];
      var full = tplMatch[0];
      var fullIndex = tplMatch.index;
      var innerIndex = fullIndex + full.indexOf(inner);
      result.template = {
        content: inner,
        startOffset: innerIndex,
        endOffset: innerIndex + inner.length
      };
    }

    // 匹配所有 <script ...> ... </script>
    var scrRe = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
    var m;
    while ((m = scrRe.exec(text)) !== null) {
      var attrs = m[1] || "";
      var content = m[2] || "";
      var full2 = m[0];
      var fullIndex2 = m.index;
      var innerIndex2 = fullIndex2 + full2.indexOf(content);

      result.scripts.push({
        attrs: attrs,
        content: content,
        startOffset: innerIndex2,
        endOffset: innerIndex2 + content.length
      });
    }

    return result;
  }

  /**
   * 把 offset 转成 CodeMirror.Pos(line, ch)
   */
  function offsetToPos(text, offset) {
    var line = 0;
    var lastNL = -1;
    for (var i = 0; i < offset && i < text.length; i++) {
      if (text.charAt(i) === "\n") {
        line++;
        lastNL = i;
      }
    }
    var ch = offset - lastNL - 1;
    if (ch < 0) ch = 0;
    return CodeMirror.Pos(line, ch);
  }

  /**
   * 从 JS 代码中收集「声明的变量名」
   * 这里只处理最常见的 const/let/var 和 function
   */
  function collectJsVars(jsCode) {
    var vars = new Set();
    try {
      var ast = Babel.transform(jsCode, { ast: true, code: false }).ast;
      ast.program.body.forEach(function (n) {
        if (n.type === "VariableDeclaration") {
          n.declarations.forEach(function (d) {
            if (d.id && d.id.name) {
              vars.add(d.id.name);
            }
          });
        }
        if (n.type === "FunctionDeclaration" && n.id && n.id.name) {
          vars.add(n.id.name);
        }
      });
    } catch (e) {
      // 解析失败就不做变量收集了，保持静默
    }
    return vars;
  }

  /**
   * 从 template 中收集 {{ xxx }} 里的变量（简单版）
   * 只做基础变量名提取，复杂表达式后面可以再升级
   */
  function collectTemplateVars(tpl) {
    var vars = [];
    if (!tpl) return vars;

    // {{ xxx }} 表达式
    var re = /\{\{\s*([^\}]+?)\s*\}\}/g;
    var m;
    while ((m = re.exec(tpl)) !== null) {
      var expr = m[1];
      expr
        .split(/[\+\-\*\/\|\&\?\:\(\)\[\]\.\s]+/)
        .forEach(function (name) {
          if (name && /^[a-zA-Z_$]/.test(name)) {
            vars.push(name.trim());
          }
        });
    }

    return vars;
  }

  // var display = $(container.parentNode.parentNode).css("display");
  if (container) {
    $(container.parentNode.parentNode).css("display", "block");
    container.innerHTML = "";
    var options = task.options;
    if (task.optionMode !== "replace") {
      task.options = {
        indentUnit: 2,
        smartIndent: false,
        tabSize: 2,
        indentWithTabs: true,
        electricChars: true,
        styleActiveLine: true,
        supportCSSTransform: true,
        lineWrapping: true,
        foldGutter: {
          rangeFinder: new CodeMirror.fold.combine(CodeMirror.fold.indent, CodeMirror.fold.comment)
        },
        gutters: [
          "CodeMirror-linenumbers",
          "CodeMirror-foldgutter",
          'CodeMirror-lint-markers'
        ],
        highlightNonStandardPropertyKeywords: true,
        matchBrackets: true,
        lint: {
          lintOnChange: true, // Enable auto-lint.
          esversion: 6,
          getAnnotations: customLinter,
          options: {
            bitwise: true
          }
        },
        hintOptions: {
          completeSingle: false,
          // closeOnUnfocus: true, // 失去焦点时关闭提示
        },
        readOnly: false,
        extraKeys: {
          "Ctrl-Q": "autocomplete"
        },
        autofocus: false,
        dragDrop: true,
        allowDropFileTypes: ['text/html'],
        foldGutter: true,
        autoCloseBrackets: true,
        autoCloseTags: true,
        matchTags: {
          bothTags: true
        },

        matchBrackets: true,
        styleActiveLine: true,
        autoRefresh: true,
        highlightSelectionMatches: {
          minChars: 2,
          style: "matchhighlight",
          showToken: true
        },
        styleSelectedText: true,
      };
      webCpu.attachAttribute(options, task.options);
    }


    var modeMap = {
      html: "htmlmixed",
      jsObj: "javascript",
      vue: "htmlmixed",
      typescript: "text/typescript"
    }
    task.codeType = task.options.mode;
    var mode = (modeMap[task.options.mode] || task.options.mode);

    if (typeof data === "object") {
      task.codeType = "jsObj";
      // data = '(' + WebTool.objectToString(data) + ')';
      data = WebTool.objectToString(data);
      data = beautifier.js(data, opts);
      // data = data.replace(/\n/g, "");
    } else if (task.options.mode === 'jsObj') {
      task.codeType = "jsObj";
      // data = '(' + data + ')';
    }

    var opts = {
      indent_size: 2
    }

    if (!task.codeNative) {
      if (mode === "javascript") {
        data = beautifier.js(data, opts);
      } else if (mode === "html" || mode === "htmlmixed") {
        data = beautifier.html(data, opts);
      } else if (mode === "css") {
        data = beautifier.css(data, opts);
      } else if (mode === "vue") {
        data = beautifier.html(data, opts);
      }
    }

    task.options.lineNumbers = task.options.lineNumbers || true;
    task.options.mode = mode || "javascript";
    let elem = container
    if (task.typingOutput) {
      task.options.value = "";
      task.editor = new CodeMirror(elem, task.options);
      webCpu.CodeEditor.typingStyleOutput(task, data, task.typingSpeed);
    } else {
      task.options.value = data;
      task.editor = new CodeMirror(elem, task.options);
    }

    task.editor.on('keydown', function (instance, event) {
      // 检查是否是你想要阻止冒泡的特定按键
      // 例如，这里我们检查是否是Ctrl+S键的组合
      let code = event.keyCode;
      let arr = [33, 34, 37, 38, 39, 40];
      if ((event.ctrlKey && event.key === 's') || arr.indexOf(code) !== -1) {
        // 使用event的stopPropagation方法来阻止事件冒泡
        event.stopPropagation();
      }
      if (event.ctrlKey && event.key === 's') {
        // 执行你想要的操作，比如保存文件等
        console.log('Ctrl+S pressed, but event propagation is stopped.');

        // 阻止默认行为，如果需要的话
        event.preventDefault();
      }

    })

    task.editor.on("change", function (e) {
      var v = e.getValue();
      if (task.codeType === 'jsObj') {
        v = v.replace(/^\(/, '');
        v = v.replace(/\;$/, '');
        v = v.replace(/\)$/, '');
      }
      if (v === task.data) {
        return false;
      } else {
        task.data = v;
      }
      if (task.promise && typeof (task.promise.changeCallback) === "function") {
        task.promise.changeCallback(task.data, task);
      }

      if (typeof task.changeCallback === "function") {
        task.changeCallback(task.data, task);
      }
    });
    if (task.options.lint && task.options.lint.lintOnChange) {
      task.editor.on('shown', (cm, hint) => {
        // 过滤出错误类型的提示
        const errorHints = hint.list.filter((item) => item.type === 'error');

        // 显示错误提示
        hint.list.length = 0; // 清空原始提示
        hint.list.push(...errorHints);
      });
    }
    task.editor.on("cursorActivity", function () {
      //获取用户当前的编辑器中的编写的代码
      // var words = task.editor.getValue() + "";
      // //利用正则取出用户输入的所有的英文的字母
      // words = words.replace(/[a-z]+[\-|\']+[a-z]+/ig, '').match(/([a-z]+)/ig);
      // //将获取到的用户的单词传入CodeMirror,并在javascript-hint中做匹配
      // CodeMirror.ukeys = words;
      //调用显示提示
      // task.editor.showHint();
    });

    task.editor.setOption("extraKeys", {
      'Ctrl-Space': 'autocomplete',
      "F11": function (cm) {
        cm.setOption("fullScreen", !cm.getOption("fullScreen"));
      },
      "Esc": function (cm) {
        if (cm.getOption("fullScreen")) {
          cm.setOption("fullScreen", false);
        }
      }
    });

    window.tEditor = task.editor;
    if (task.promise && typeof (task.promise.changeCallback) === "function") {
      task.promise.changeCallback(task.data, task);
    }

    if (typeof task.changeCallback === "function") {
      task.changeCallback(task.data, task);
    }

    if (task && task.highlighted && task.highlighted.length !== 0) {
      webCpu.CodeEditor.highlight(task, null, true);
    }

  }
});

webCpu.CodeEditor.typingStyleOutput = function (card, fullCode, n) {
  let t = card.task || card;
  fullCode = fullCode || t.editor.getValue();
  n = n || 20;
  var i = 0;
  clearInterval(webCpu.CodeEditor.typingInterval);
  webCpu.CodeEditor.typingInterval = setInterval(function () {
    t.editor.setValue(fullCode.substring(0, i));
    let count = t.editor.lineCount() - 1;
    // 获取最后一行的内容
    var lastLineContent = t.editor.getLine(count);

    // 获取最后一行内容的长度，即最后一行结束位置的列号
    var lastColumnNumber = lastLineContent.length === 0 ? 1 : lastLineContent.length;

    t.editor.setCursor({
      line: count,
      ch: lastColumnNumber
    });
    t.editor.scrollIntoView({
      line: count,
      ch: lastColumnNumber
    });
    i++;
    if (i > fullCode.length) {
      clearInterval(webCpu.CodeEditor.typingInterval);
    }
  }, n); // 每500毫秒添加一行
}

webCpu.CodeEditor.highlight = function (card, arr, flag) {
  if (!card) {
    return false;
  }
  let task = card.task || card;
  editor = task.editor;

  if (!editor) {
    return false;
  }
  // editor.refresh();
  arr = arr || task.highlighted || [];
  for (let i = 0; i < arr.length; i++) {
    var lineHighlightClass = "highlight-line animate__animated animate__bounceIn";
    let n = arr[i] - 1;
    // 确保行号在文档的范围内
    if (n < editor.firstLine() || n > editor.lastLine()) {
      console.error("行号不在当前文档的范围内。");
      continue;
    }

    let count = editor.lineCount() - 1;
    let t = Math.min(count, n + 10);

    if (!flag) {
      editor.scrollIntoView({
        line: t,
        ch: 0
      });
    }


    // 高亮目标行
    editor.addLineClass(n, "wrap", lineHighlightClass);
  }

}