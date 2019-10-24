(function() {
    var config = {
        css: "style.css"
    }

    webCpu.regComponent("DataTable", config, function(container, data, task) {
        container.innerHTML = "";
        var table = document.createElement("table");
        table.setAttribute("class", "table table-striped");
        if (typeof(task.caption) !== "undefined") {
            var caption = document.createElement("caption");
            caption.innerHTML = task.caption;
            table.appendChild(caption);
        }
        if (task.header && task.header.length > 0 && data) {

            var tbody = document.createElement("tbody");
            var thead = document.createElement("thead");
            table.appendChild(tbody);
            table.appendChild(thead);
            var tr = document.createElement("tr");
            if (task.numbered) {
                var th = document.createElement("th");
                th.innerHTML = "<div style='display: flex; justify-content:center; align-items:center; width: 100%; height: 100%; background: #fafafa'>" + (task.numbered.name || "序号") + "</div>";
                tr.appendChild(th);
            }

            for (var i = 0; i < task.header.length; i++) {
                if (task.header[i].hidden) {
                    continue;
                }
                var th = document.createElement("th");
                th.innerHTML = "<div style='display: flex; justify-content:center; align-items:center; width: 100%; height: 100%; background: #fafafa'>" + task.header[i].name + "</div>";
                tr.appendChild(th);
            }

            thead.appendChild(tr);
            var count = i;
            for (var i = 0; i < data.length; i++) {
                var tr = document.createElement("tr");
                tr.setAttribute("index", i);
                if (task.numbered) {
                    var td = document.createElement("td");
                    td.align = "center";
                    td.innerHTML = (i + 1);
                    td.align = "center";
                    tr.appendChild(td);
                }
                for (var j = 0; j < task.header.length; j++) {
                    if (task.header[j].hidden) {
                        continue;
                    }
                    var td = document.createElement("td");
                    if (typeof(task.header[j].render) === "function") {
                        var v = i;
                        if (task.header[j].key) {
                            v = data[i][task.header[j].key] || "-";
                        }
                        td.innerHTML = task.header[j].render(v, data[i]);
                    } else if (typeof(task.header[j].key) === "string") {
                        if (data[i][task.header[j].key] === undefined) {
                            td.innerHTML = "-";
                            td.align = "center";
                        } else {
                            td.innerHTML = data[i][task.header[j].key];
                        }
                    } else {
                        td.innerHTML = "-";
                        td.align = "center";
                    }
                    tr.appendChild(td);
                }

                tbody.appendChild(tr);
            }

            if (i === 0) {
                var tr = document.createElement("tr");
                tr.innerHTML = "<td style='color: #999;' colspan='" + count + "'><p class='DataTable_emptyTip'>当前列表为空</p></td>";
                tbody.appendChild(tr);
            }

            if (task.page && task.page.total) {
                var tFoot = table.createTFoot();
                var tr = document.createElement("tr");
                tr.innerHTML = "<td class='DataTable_page' colspan='" + count + "'></td>";
                tFoot.appendChild(tr);
                task.pagination = new Pagination($(tFoot).find("td")[0], task.page.total, task.page.size, task.page.current, function(n, size) {
                    task.query = task.query || {};
                    task.query.currentPage = n - 1;
                    task.query.pageSize = size || 10;
                    webCpu.render("DataTable", task);
                });
            }
            container.appendChild(table);
            setTimeout(function() {
                $(container).find("tbody>tr").css("transform", "translateX(0)");
            }, 1500);
        }
        $(container).css("overflow", "auto");

        function scrollHandle(e) {
            var scrollTop = this.scrollTop;
            this.querySelector('thead').style.transform = 'translateY(' + scrollTop + 'px)';
        }
        container.addEventListener('scroll', scrollHandle);

    });

    var Pagination = function(container, total, number, current, callback) {
        this.container = container;
        this.total = total;
        this.size = number || 10;
        this.count = Math.ceil(total / (this.size));
        this.current = current || 1;
        this.container.innerHTML = "";
        this.callback = callback;
        var nav = document.createElement("nav");
        this.container.appendChild(nav);
        this.ul = document.createElement("ul");
        this.ul.setAttribute("class", "pagination");
        var label = document.createElement("div");
        label.innerHTML = '<label style="float: left;"><span>前往</span>\
    <select value=' + current + ' class="pageNumber form-control" style="width: auto;display: inline-block; color: #999; padding: 0px 5px;"></select>页</label> \
    <span>每页</span><select value=' + current + ' class="pageSize form-control" style="width: auto;display: inline-block; color: #999; padding: 0px 5px;"></select>条</label> \
    <label> 总条数: <span class="countValue">' + total + '</span>条</label>'
        label.setAttribute("class", "DataTable_goBtnArea");
        nav.appendChild(label);
        nav.appendChild(this.ul);
        this.goBtnArea = label;
        if (this.current > this.count) {
            this.current = this.count;
        }
        var select = $(label).find("select.pageNumber");
        for (var i = 0; i < this.count; i++) {
            // $("<option value=" + (i + 1) + ">" + (i + 1) + "</option>").appendTo(select);
            $("<option>" + (i + 1) + "</option>").appendTo(select);
        }
        var select = $(label).find("select.pageSize");
        var sizes = [10, 20, 50, 100]
        for (var i = 0; i < sizes.length; i++) {
            $("<option>" + sizes[i] + "</option>").appendTo(select);
        }
        this.updatePages(this.current, this.size);
    }

    Pagination.prototype.updatePages = function(n, size) {
        if (n < this.count + 1 && n > 0) {
            this.ul.innerHTML = "";
            this.current = n;
            $(this.ul).append("<li  class='active'><a>" + (this.current) + "</a></li>");

            if (this.current < 5) {
                for (var i = 1; i < this.current; i++) {
                    $(this.ul).prepend("<li><a>" + (this.current - i) + "</a></li>");
                }
                if (this.current !== 1) {
                    $(this.ul).prepend("<li><a>上一页</a></li>");
                }
            } else {
                $(this.ul).prepend("<li><a>" + (this.current - 1) + "</a></li>");
                $(this.ul).prepend("<li><a>" + (this.current - 2) + "</a></li>");

                $(this.ul).prepend("<li><a>...</a></li>");

                $(this.ul).prepend("<li><a>1</a></li>");
                $(this.ul).prepend("<li><a>上一页</a></li>");
            }

            if (this.count - this.current < 4) {
                for (var i = 1; i < this.count - this.current + 1; i++) {
                    $(this.ul).append("<li><a>" + (this.current + i) + "</a></li>");
                }
                if (this.current !== this.count) {
                    $(this.ul).append("<li><a>下一页</a></li>");
                }
            } else {
                $(this.ul).append("<li><a>" + (this.current + 1) + "</a></li>");
                $(this.ul).append("<li><a>" + (this.current + 2) + "</a></li>");
                $(this.ul).append("<li><a>...</a></li>");
                $(this.ul).append("<li><a>" + this.count + "</a></li>");
                $(this.ul).append("<li><a>下一页</a></li>");
            }

            var _self = this;
            $(this.container).find("li>a").click(function() {
                var p = Number(this.innerHTML);
                if (this.innerHTML == "下一页") {
                    p = _self.current + 1;
                } else if (this.innerHTML == "上一页") {
                    p = _self.current - 1;
                } else if (this.innerHTML == "...") {
                    p = (Number(this.parentNode.previousSibling.innerText) || 0) + 1;
                } else {}

                if (typeof(_self.callback) === "function") {
                    var size = Number($(_self.container).find("select.pageSize").val()) || 10;
                    _self.callback(p, size);
                }

            });

            $(this.container).find("select.pageNumber").val(n + "");

            $(this.container).find("select.pageNumber").on("change", function() {
                var value = Number($(this).val());
                var size = Number($(_self.container).find("select.pageSize").val()) || 10;
                if (value !== NaN && value < _self.count + 1 && value > 0) {
                    _self.callback(value, size);
                }
            });

            $(this.container).find("select.pageSize").val(size + "");
            $(this.container).find("select.pageSize").on("change", function() {
                var value = Number($(this).val());
                _self.callback(1, value);
            });


        }
    }

})();