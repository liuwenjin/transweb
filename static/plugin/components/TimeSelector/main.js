(function () {
    var config = {
        html: 'layout.html'
    }

    webCpu.regComponent("TimeSelector", config, function (container, data, task) {
        task.duration = task.duration || 30;
        var w = $(container).width() / task.duration - 2;
        var h = task.trickHeight || 2;
        task.month = task.month || (new Date()).getMonth() + 1;
        task.date = task.date || (new Date()).getDate();
        task.currentDate = new Date();
        task.moment = moment({
            year: task.currentDate.getFullYear(),
            month: task.currentDate.getMonth(),
            day: task.currentDate.getDate()
        })
        if (task.duration < 30) {
            var trickData = initScaleTrick(task.duration + 1, task.date, task.month);
        } else {
            var trickData = initScaleTrick(task.duration + 1, task.date, task.month);
        }
        task.trickData = trickData;

        var tipsArea = $(container).find(".TimeSelector_ScaleTipsArea");
        tipsArea.html("");
        for (var i = 0; i < trickData.length; i++) {
            var tLabel = document.createElement("label");
            for (var k in trickData[i]) {
                tLabel.setAttribute(k, trickData[i][k]);
            }
            tipsArea.append(tLabel);
        }

        var lastItem = tipsArea.find("label:last-child");
        if (lastItem.attr("trick") == dataMap[task.month - 1]) {
            tLabel.setAttribute("class", "endFirst");
            tLabel.setAttribute("extraTrick", 1);
            tipsArea.find("label:eq(-2)").attr("topTips", task.month - 1 + "月");
        }

        tipsArea.find("label").width(w);
        tipsArea.find("label").height(h);
        $(container).find(".TimeSelector_Block").attr("start", "");
        $(container).find(".TimeSelector_Block").attr("end", "");
        task.timeBlock = $(container).find(".TimeSelector_Block")[0];
        task.trickArea = $(container).find(".TimeSelector_ScaleTipsArea")[0];
        task.current = task.current || {
            base: $(container).find(".TimeSelector_Container")[0].getBoundingClientRect(),
            mouseDown: false,
            pos: [0, 0]
        }

        task.current.mouseDown = false;

        task.unit = task.current.base.width / task.duration;

        task.updateBlock = function (e) {
            var offsetX = e.clientX - this.current.pos[0];       
            var t = Math.min((this.current.margin + offsetX), this.current.margin + this.current.width - 40);
            var w = Math.max((this.current.width  -  offsetX), 40) ;
            
            if(this.current.flag === "leftAdjust") {    
                var left= Math.max(0, t);                         
                $(this.timeBlock).width(w);
                $(this.timeBlock).css("margin-left", left);
            }
            else if(this.current.flag === "rightAdjust") {
                var w = Math.max(this.current.width + offsetX, 40);
                var max = $(this.container).find(".TimeSelector_Container").width();
                w = Math.min(this.current.width + offsetX, max-this.current.margin);   
                w = Math.max(w, 40);             
                $(this.timeBlock).width(w);
            }
            else {
               var left = Math.min(t, $(task.trickArea).width() - $(this.timeBlock).width());
               left= Math.max(0, left); 
               $(this.timeBlock).css("margin-left", left);
            }   
            var m = Number($(this.timeBlock).css("margin-left").replace("px", ""));        

            var start = this.current.start;
            var end = this.current.end;

            var n1 = Math.floor(m / this.unit) + 1;
            var n2 = Math.ceil((m + $(this.timeBlock).width()) / this.unit) - 1;
            this.setTrickDuration(n1, n2);

            if (start != this.current.start || end != this.current.end) {
               this.changed = true;
            }
            else {
                this.changed = false;
            }

            if (this.current.flag !== "rightAdjust" && t < 0 && task.duration < 100) {
                task.duration =  1 + task.duration;
                //task._duration = n2 - n1 + Math.floor(-t / this.unit);
                var trick = task.trickData[1];
                if(trick.trick === 1) {
                    trick.month -= 1; 
                }
                task.from = trick.year+ "-" + trick.month + "-" + trick.trick;
                task.to = task.trickData[n2-1].year + "-" + task.trickData[n2-1].month + "-" + task.trickData[n2-1].extraTrick;                
                
                webCpu.render("TimeSelector", task);
            }
        }

        task.getDateDuration = function (formartor) {
            var date = {
                start: {
                    day: this.trickData[this.current.start + 1].trick - 1,
                    month: this.trickData[this.current.start + 1].month
                },
                end: {
                    day: this.trickData[this.current.end].trick + 1,
                    month: this.trickData[this.current.end].month
                }
            }
            
            if(date.start.day === 0) {
                date.start.month -= 1;
                if(date.start.month === 0) {
                    date.start.month = 12;
                }
                date.start.day = dataMap[date.start.month - 1];
            }
            if(date.end.day === 0) {
                date.end.month -= 1;
                if(date.end.month === 0) {
                    date.end.month = 12;
                }
                date.start.day = dataMap[date.end.month - 1];
            }

            
            date.end.year = (new Date()).getFullYear();
            if (date.start.month > date.end.month) {
                date.start.year = date.end.year - 1;
            } else {
                date.start.year = date.end.year;
            }

            if(date.start.month < 10) {
                date.start.month = "0" + date.start.month;
            }
            if(date.start.day < 10) {
                date.start.day = "0" + date.start.day;
            }

            if(date.end.month < 10) {
                date.end.month = "0" + date.end.month;
            }
            if(date.end.day < 10) {
                date.end.day = "0" + date.end.day;
            }

            var start = date.start.year + "-" + date.start.month + "-" + date.start.day;
            var end = date.end.year + "-" + date.end.month + "-" + date.end.day;
            return [start, end];
        }

        task.getDateIndex = function (month, day) {
            var ret = -1;
            for (var i = 0; i < this.trickData.length; i++) {
                if ((this.trickData[i].trick == day || this.trickData[i].extraTrick == day) && this.trickData[i].month == month) {
                    ret = i;
                    break;
                }
            }
            return ret;
        }

        task.setDateDuration = function (start, end) {
            if (typeof (start) === "string") {
                var t = start.split("-");
                if (t.length === 2) {
                    start = {
                        month: Number(t[0]),
                        day: Number(t[1])
                    }
                } else if (t.length === 3) {
                    start = {
                        month: Number(t[1]),
                        day: Number(t[2])
                    }
                } else {}

            }
            if (typeof (end) === "string") {
                var t = end.split("-");
                if (t.length === 2) {
                    end = {
                        month: Number(t[0]),
                        day: Number(t[1])
                    }
                } else if (t.length === 3) {
                    end = {
                        month: Number(t[1]),
                        day: Number(t[2])
                    }
                } else {}
            }
            var n1 = this.getDateIndex(start.month, start.day);
            if (n1 < 0) {
                n1 = 0;
            }
            var n2 = this.getDateIndex(end.month, end.day);
            if (n2 < 0) {
                n2 = this.trickData.length - 1;
            }

            this.setTrickDuration(n1, n2);
            var left = this.unit * (this.current.start - 1);
            $(this.timeBlock).css("margin-left", left);
            var max = $(this.container).find(".TimeSelector_Container").width();
            var width = this.unit * (this.current.end - this.current.start + 2);
            width = Math.min(max-left, width);
            $(this.timeBlock).width(width);
        }

        task.setTrickDuration = function (n1, n2) {
            if(n2 > this.trickData.length - 1) {
                n2 = this.trickData.length - 1;
            }
            var start = this.trickData[n1];
            var end = this.trickData[n2];
            this.current.start = n1;
            this.current.end = n2;
            $(this.timeBlock).attr("start", start.month + "-" + start.trick);
            $(this.timeBlock).attr("end", end.month + "-" + (end.trick + 1));
        }

        if(!task.from && task.to && task._duration) {
            var m = moment(task.to);
            task.from = m.subtract(task._duration, "days").format("YYYY-MM-DD");
        }
        if (task.from && task.to) {
            task.setDateDuration(task.from, task.to);
        } else {
            var t = new Date();
            var t0 = new Date(t - 6 * 24 * 60 * 60 * 1000);
            task.setDateDuration((t0.getMonth() + 1) + "-" + t0.getDate(), (t.getMonth() + 1) + "-" + t.getDate());
        }

        $(container).find(".TimeSelector_Block").off("mousedown");
        $(container).find(".TimeSelector_Block").on("mousedown", function (e) {
            task.current.mouseDown = true;
            task.current.width = $(task.timeBlock).width();
            task.current.margin = Number($(task.timeBlock).css("margin-left").replace("px", ""));
            task.current.pos = [
                e.clientX,
                e.clientY
            ];
            if ($(e.target).hasClass("TimeSelector_rightAjust")) {
                task.current.flag = "rightAdjust";
            } else if ($(e.target).hasClass("TimeSelector_leftAjust")) {
                task.current.flag = "leftAdjust";
            } else {
                task.current.flag = "whole";
            }

            task.olderStart = task.current.start;
            task.olderEnd = task.current.end;
        });

        $(container).find(".TimeSelector_Container").off("mousemove");
        $(container).find(".TimeSelector_Container").on("mousemove", function (e) {
            if (task.current.mouseDown) {                
                task.updateBlock(e);
            }
            return false;
        });

        $(document.body).off("mouseup");
        $(document.body).on("mouseup", function () {
            task.current.mouseDown = false;
            if (typeof (task.onchange) === "function" && (task.olderStart !== task.current.start || task.olderEnd !== task.current.end)) {
                var t = task.getDateDuration();
                task.onchange(t[0], t[1], task.current);
            }
        });

        $(document.body).off("mousemove");
        $(document.body).on("mousemove", function (e) {
            if (task.current.mouseDown) {
                task.updateBlock(e);
            }
        });

    });

    var initScaleTrick = function(duration, day, month, year) {
        var year = year || (new Date()).getFullYear();
        var date = moment({month: month, day: day, year: year});
        var tricks = [];        

        for(var i = 0; i < duration - 1; i++) {
            var d = {
                trick:0,
                extraTrick: date.date(),
                month: date.month(),
                year: date.year()
            };           
            date.subtract(1, "days");
            d.trick = date.date();
            d.month = date.month();
            if(d.trick > d.extraTrick || d.trick === 1) {
                d.topTips = date.month() + "月";
            }
            tricks.unshift(d);
        }

        return tricks;
    }

    var dataMap = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var febDate = (new Date()).setMonth(1);
    var marDate = (new Date()).setMonth(2);
    dataMap[1] = (marDate - febDate) / (1000 * 60 * 60 * 24);

})();