(function () {
    var config = {
        css: "style.css",
        html: "layout.html"
    }
    webCpu.regComponent("ModalDialog", config, function (elem, data, task) {
        //initial component
        var div = document.getElementById("tModalDialog");
        if (!div) {
            div = document.createElement("div");
            div.id = "tModalDialog";
            div.setAttribute("class", "modal fade");
            div.setAttribute("tabindex", "-1");
            div.setAttribute("role", "dialog");
            div.innerHTML = webCpu["ModalDialog"].html.innerHTML;
            var container = document.body;
            container.appendChild(div);
        }
        webCpu["ModalDialog"].switchSize();
    });
    //define component api
    webCpu["ModalDialog"].renderComponent = function (component, task, param) {
        //render dialog view
        task = webCpu["ModalDialog"].initTask(task) || {};
        task.container = $("#tModalDialog .modal-body")[0];
        if (typeof(param) !== "string") {
            for (var k in param) {
                task.container.setAttribute(k, param[k]);
            }
        }
        if (typeof(component) === "string") {
            webCpu.render(component, task);
        } else if (typeof(webCpu[component]) === "object" && typeof(component.render) === "function") {
            component.render(task);
        } else {}
    }
    webCpu["ModalDialog"].setTitle = function (str) {
        $("#tModalDialog .modal-title").html(str);
    }
    webCpu["ModalDialog"].hide = function () {
        $('#tModalDialog').modal("hide");
    }
    webCpu["ModalDialog"].show = function () {
        $('#tModalDialog').modal("show");
    }
    webCpu["ModalDialog"].displayComponent = function (title, component, task, param) {
        task.state = false;
        $('#tModalDialog').off('shown.bs.modal');
        $('#tModalDialog').on('shown.bs.modal', function (e) {
            webCpu["ModalDialog"].renderComponent(component, task);
        })
        $('#tModalDialog').off('hidden.bs.modal');
        $('#tModalDialog').on('hidden.bs.modal', function (e) {
            $("#tModalDialog .modal-title").html("");
            $("#tModalDialog .modal-body").html("");
            $("#tModalDialog").attr("state", "");
            if (task.data && task.data && task.data.task && task.data.task.container) {
                $(task.data.task.container).html("");
                task.data.task.container = null;
            }
            if (task.promise && typeof(task.promise.closeDialog) === "function") {
                task.promise.closeDialog(task);
            }
            if (task.container) {
                $(task.container).html("");
                task.container = null;
            }
        })
        $("#tModalDialog .modal-title").html(title);
        var param = param || {
            show: true,
            height: 500
        };
        param.show = true;
        param.height = param.height || 300;
        $('#tModalDialog').modal(param);
        if (param && typeof(param) === "string") {
            webCpu["ModalDialog"].switchSize(param);
        } else if (param && param.size) {
            webCpu["ModalDialog"].switchSize(param.size);
        } else {}
        if (param && param.height) {
            $("#tModalDialog .modal-body").height(param.height);
        } else {
            $("#tModalDialog .modal-body").height("auto");
        }

    }

    webCpu["ModalDialog"].displayHTML = function (title, html, callback) {
        $("#tModalDialog .modal-body").html(html);
        if (typeof(callback) === "function") {
            callback($("#tModalDialog .modal-body")[0]);
        }
        $("#tModalDialog .modal-title").html(title);
        $('#tModalDialog').modal("show");
    }

    webCpu["ModalDialog"].switchSize = function (flag) {
        if (flag === "lg" || flag === "sm") {
            $("#tModalDialog").removeClass("bs-example-modal-lg");
            $("#tModalDialog").removeClass("bs-example-modal-sm");
            $("#tModalDialog .modal-dialog").removeClass("modal-lg");
            $("#tModalDialog .modal-dialog").removeClass("modal-sm");

            if (flag) {
                $("#tModalDialog").addClass("bs-example-modal-" + flag);
                $("#tModalDialog .modal-dialog").addClass("modal-" + flag);
            }
			$("#tModalDialog .modal-dialog").css("width", "");
        }
		else {
			$("#tModalDialog .modal-dialog").css("width", flag);
		}
    }
})();
