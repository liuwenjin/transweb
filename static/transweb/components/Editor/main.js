webCpu.regComponent("Editor", {
  css: "style.css"
}, function (container, data, task) {
  container.innerHTML = "";
  var param = webCpu.Editor.transNodes(task.option);
  webCpu.Editor.createDom(container, param, data);
  $(container).find(".Editor_inputItem [mode=input]").on("change", function () {
    task.data = webCpu.Editor.getInputValue(task);
  });
  task.data = webCpu.Editor.getInputValue(task);
});

webCpu.Editor.getInputValue = function (c) {
  c = c.container || c;
  var ret = {};
  var selector = $(c).find(".Editor_inputItem");
  for (var i = 0; i < selector.length; i++) {
    var key = selector.eq(i).attr("key");
    ret[key] = selector.find("[name=" + key + "]").val();
  }
  return ret;
}

webCpu.Editor.transNodes = function (d, map) {
  var ret = {
    children: []
  }
  for (var i in d) {
    var t = d[i];
    var item = {
      label: t.label,
      labelStyle: d[i].labelStyle,
      props: d[i].props || {},
      style: d[i].style || {},
      children: []
    };
    item.props.key = d[i].key || i;
    item.props.class = "Editor_inputItem";
    var editor = t.editor;
    if (editor.constructor.name === "Object") {
      editor = [editor];
    }
    for (var j = 0; j < editor.length; j++) {
      editor.name = t.key;
      editor[j].mode = "input";
      var tItem = {
        tag: "input",
        props: editor[j]
      };
      tItem.props.name = item.props.key;
      var type = editor[j].type;
      if(type === "textarea") {
        tItem.tag = "textarea"
      }
      if (map && map[type]) {
        if(map[type] === "function") {
          tItem = map[type](editor[j]);
        }
        else {
          tItem = JSON.stringify(map[type]);
          tItem = JSON.parse(tItem);
        }
        tItem.props = editor[j];
      }
      item.children.push(tItem);
    }
    ret.children.push(item);
  }
  return ret;
}

var a = [{
  "name": "密码明文",
  "editor": {
    "type": 'text',
    "width": '120px',
    "value": ''
  }
}]

var t = {
  className: "Editor",
  task: {
    option: {
      label: "主标题",
      children: [{
        label: "测试标题",
        style: {
          display: "inline-block",
          width: "320px"
        },
        labelStyle: {
          display: "inline-block",
          width: "100px"
        },
        children: {
          tag: "input",
          style: {
            display: "inline-block",
            width: "50%"
          },
          labelStyle: {
            display: "inline-block"
          },
          props: {
            type: "text",
            value: "test"
          }
        }
      }, {
        label: "测试标题1",
        style: {
          display: "inline-block",
          width: "320px"
        },
        labelStyle: {
          display: "inline-block"
        },
        children: [{
          tag: "input",
          label: "abc",
          style: {
            display: "inline-block"
          },
          labelStyle: {
            display: "inline-block"
          },
          props: {
            type: "checkbox",
            value: "test3"
          }
        }, {
          tag: "input",
          label: "abc",
          style: {
            display: "inline-block"
          },
          labelStyle: {
            display: "inline-block"
          },
          props: {
            type: "checkbox",
            style: {
              display: "inline-block"
            },
            labelStyle: {
              display: "inline-block"
            },
            value: "test4"
          }
        }]
      }, {
        label: "测试标题2",
        style: {
          display: "inline-block",
          width: "320px"
        },
        labelStyle: {
          display: "inline-block"
        },
        children: [{
          tag: "input",
          label: "abc",
          style: {
            display: "inline-block"
          },
          labelStyle: {
            display: "inline-block"
          },
          props: {
            type: "radio",
            value: "test1"
          }
        }, {
          tag: "input",
          label: "abc",
          style: {
            display: "inline-block"
          },
          labelStyle: {
            display: "inline-block"
          },
          props: {
            type: "radio",
            value: "test2"
          }
        }]
      }]
    }
  }
}


webCpu["Editor"].checkValue = function (cTask) {
  cTask = cTask.task || cTask;
  var container = cTask.container;
  var fItems = $(container).find(".Editor");
  var ret = {
    result: true
  }
  for (var i = 0; i < fItems.length; i++) {
    var fContainer = $(fItems[i]).find(".Editor_inputItem")[0];
    var type = $(fContainer).attr('type');
    if (type === "text" || type === "textarea" || type === "password") {
      var value = $(fItems[i]).find("input").val() || $(fItems[i]).find("textarea").val() || $(fItems[i]).attr('value');
      var checkItems = cTask.data[i].checkItems;
      if (checkItems && checkItems.length > 0) {
        for (var j = 0; j < checkItems.length; j++) {
          if (checkItems[j].rule) {
            if (typeof (checkItems[j].rule) === "function") {
              ret.result = checkItems[j].rule(value);
            } else if (typeof (checkItems[j].rule.test) === "function") {
              ret.result = checkItems[j].rule.test(value);
            } else {}
            $(fContainer).find("span").remove();
            if (!ret.result) {
              ret.message = checkItems[j].message;
              var w = $(fContainer).width();
              $("<span style='color: #f00; display: inline-block; text-align: left; width: " + w + "px;'>" + ret.message + "</span>").appendTo($(fContainer));
              break;
            }

          }
        }
      }
      if (!ret.result) {
        break;
      }

    }
  }
  return ret;
}