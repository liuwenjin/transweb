(function () {
    var config = {
        css: "style.css"
    }

    webCpu.regComponent("FormItem", config, function (container, data, task) {
        container.innerHTML = "";
        var elem = $(container);
        if (data.title) {
            var tSelector = $('<p class="FormItem_title">' + data.title + '</p>');
            tSelector.appendTo(elem);
        }
        var t = document.createElement("div");
        t.setAttribute("class", data.name);
        $(t).addClass("FormItem_content")
        container.appendChild(t);
        for (var i = 0; data.items && i < data.items.length; i++) {
            var iWidth = data.items[i].width || "120px";
            elem.attr("type", data.items[i].type);
            if (data.items[i].type === "select") {
                var temp = $('<label type="select" class="FormItem_inputItem"></label>');
                webCpu["FormItem"].addSelectItem(temp, data.items[i].options, data.value);

            } else if (data.items[i].type === "textarea") {
                var temp = $('<label type="' + data.items[i].type + '" class="FormItem_inputItem"><textarea value="' + data.items[i].value + '" name="' + data.name + '" type="' + data.items[i].type + '" ></textarea>' + (data.items[i].tips || '') + '</label>');
            } else {
                var temp = $('<label unit="' + (data.items[i].unit || '') + '" type="' + data.items[i].type + '" class="FormItem_inputItem"><input  name="' + data.name + '" type="' + data.items[i].type + '"   placeholder="' + (data.items[i].value || "") + '" /><span style="vertical-align: middle;">' + (data.items[i].tips || '') + '</span></label>');
            }
            temp.appendTo($(t));
            if (data.items[i].disabled) {
                temp.children().attr("disabled", "disabled");
            }
        }

        var type = elem.attr("type");
        //upate form data value
        if (type === "radio") {
            // elem.find("input[type='text']").attr("class", "form-control");
            elem.find("input[type='text']").change(function () {
                $(this).parent().find("input[type='radio']").val($(this).val() || '-');
            });
            if (elem.find("input[type='text']") && !elem.find("input[value='" + data.value + "']")) {
                elem.find("input[type='text']").val(data.value);
            }
            elem.find("input[value='" + data.value + "']").attr("checked", true);
        } else if (type === "select") {
            elem.find("select").attr("class", "form-control");
            elem.find("select").val(data.value || "");
            elem.find("select").attr("selected", true);
        } else if (type === "checkbox") {
            // elem.find("input[type='text']").attr("class", "form-control");
            elem.find("input[type='text']").change(function () {
                $(this).parent().find("input[type='checkbox']").val($(this).val() || '-');
            });

            if (data.value && typeof (data.value) === "string") {
                elem.find("input[value='" + data.value + "']").attr("checked", true);
            } else {
                for (var k in data.value) {
                    elem.find("input[value='" + data.value[k] + "']").attr("checked", true);
                }
            }
        } else {
            if (data.value !== undefined) {
                elem.find("input").val(data.value);
                elem.find("textarea").html(data.value);
            } else {
                elem.find("input").val("");
                elem.find("textarea").html("");
            }
        }
        elem.find("input").attr("class", "form-control");
        elem.find("input").css("display", "inline-block");
        elem.find("input").css("margin", "0px");
        elem.find("input").css("vertical-align", "middle");

        // elem.appendTo($(container));
    });

    webCpu["FormItem"].getValue = function (cTask) {
        cTask = cTask.task || cTask;
        var cData = cTask.data;
        if (cData.constructor.name === "Object") {
            cData = [cData];
        }
        var container = cTask.container;
        cTask.result = [];
        var fItems = $(container).find(".FormItem");
        for (var i = 0; i < fItems.length; i++) {
            var type = $(fItems[i]).find(".FormItem_inputItem").attr('type');
            if (type === "select") {
                var value = $(fItems[i]).find("input").attr("data");
            } else if (type === "radio") {
                var value = $(fItems[i]).find("input:checked").val();
            } else if (type === "checkbox") {
                var value = [];
                var cBoxs = $(fItems[i]).find("input:checked");
                for (var j = 0; j < cBoxs.length; j++) {
                    value.push(cBoxs[j].value);
                }
            } else {
                var value = $(fItems[i]).find("input").val() || $(fItems[i]).find("textarea").val() || $(fItems[i]).attr('value');
            }
            cTask.result.push({
                name: cData[i]["name"],
                value: value
            });
            cData[i]["value"] = value;
        }
        return cTask.result;
    }

    webCpu["FormItem"].checkItem = function (fContainer, data) {
        var ret = {
            result: true
        };
        var type = $(fContainer).attr('type');
        if (type === "text" || type === "textarea" || type === "password") {
            var value = $(fContainer).find("input").val() || $(fContainer).find("textarea").val() || $(fContainer).attr('value');
            var checkItems = data.checkItems;
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
        }
    }

    webCpu["FormItem"].checkValue = function (cTask) {
        cTask = cTask.task || cTask;
        var container = cTask.container;
        var fItems = $(container).find(".FormItem");
        var ret = {
            result: true
        }
        for (var i = 0; i < fItems.length; i++) {
            var fContainer = $(fItems[i]).find(".FormItem_inputItem")[0];
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

    webCpu["FormItem"].addSelectItem = function (elem, data, tips) {
        var temp = '<div class="input-group-btn" style="border:none; background: transparent;">\
          <a><input disabled style="cursor: pointer; background: #fff;" type="text" class="form-control" aria-label="..." data="' + tips + '" value="' + tips + '"></a>\
            <label  style="margin-left: -30px; top: -12px; width: 0px; height: 0px; border:none; background: transparent; box-shadow: none;" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span class="caret"></span></label>\
            <ul class="dropdown-menu" style="width: 100%; max-height: 180px; overflow: auto;">\
              <li><a href="#">Action</a></li>\
              <li><a href="#">Another action</a></li></ul></div>';
        $(elem).html(temp);

        if (data && data.length) {
            var mSelector = $(elem).find(".dropdown-menu");
            mSelector.html('');
            for (var i = 0; i < data.length; i++) {
                var li = '<li><a data="' + data[i] + '" href="#">' + data[i] + '</a></li>';
                if (data[i] && data[i].name && data[i].value) {
                    li = '<li data="' + data[i].value + '"><a href="#">' + data[i].name + '</a></li>';
                }
                $(li).appendTo(mSelector);
            }
        }

        $(elem).find(".dropdown-menu li").on("click", function () {
            var text = $(this).children("a").html();
            var v = $(this).children("a").attr("data");
            if(!v) {
                text = "";
            }
            $(elem).children("div").find("input").val(text);
            $(elem).children("div").find("input").attr("data", v);
        });
        $(elem).children(".input-group-btn").children("a").on("click", function () {
            var open = $(elem).find(".input-group-btn").hasClass("open");
            if (open) {
                $(elem).find(".input-group-btn").removeClass("open");
            } else {
                window.testElem = $(elem).find(".input-group-btn");
                setTimeout(function () {
                    testElem.addClass("open");
                }, 50);
            }
        });
    }

})();