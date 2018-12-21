var r_resizable_panels = {
    model: [],
    start: null,
    init: function () {
        var groups = $(".r-resizable-group");
        this.model = [];
        for (var i = 0; i < groups.length; i++) {
            var element = groups.eq(i);
            element.find(".r-splitter").remove();
            var panels = element.children(".r-resizable-panel");
            var cols = element.attr("cols"), rows = element.attr("rows");
            var thickness = element.attr("data-splitter-thickness") || 5;
            var min = element.attr("data-panels-min") || 50;
            thickness = parseInt(thickness);
            if (cols !== undefined) {
                var dir = cols;
                var oriention = "horizontal";
                var size = element.width();
            }
            else if (rows !== undefined) {
                var dir = rows;
                var oriention = "vertical";
                var size = element.height();
            }
            var dimentions = dir.split(",");
            var nullCount = 0, usedWidth = (panels.length - 1) * thickness;
            for (var j = 0; j < panels.length; j++) {
                if (dimentions[j].indexOf("px") !== -1) {
                    var val = parseInt(dimentions[j])
                    dimentions[j] = val;
                    usedWidth += val;
                }
                else if (dimentions[j].indexOf("%") !== -1) {
                    var val = parseInt(dimentions[j]) * (size - ((panels.length - 1) * thickness)) / 100;
                    dimentions[j] = val;
                    usedWidth += val;
                }
                else {
                    dimentions[j] = null;
                    nullCount++;
                }
            }
            var avilable = size - usedWidth;
            for (var k = 0; k < panels.length; k++) {
                if (dimentions[k] === null) {
                    dimentions[k] = avilable / nullCount;
                }
            }
            this.model.push({ element: element, panels: panels, oriention: oriention, dimentions: dimentions, thickness: thickness,min:min });
        }
        this.update();
    },
    update: function () {
        for (var i = 0; i < r_resizable_panels.model.length; i++) {
            var model = r_resizable_panels.model[i];
            var thickness = model.thickness;
            var used = 0;
            for (var j = 0; j < model.panels.length; j++) {
                var panel = model.panels.eq(j);
                var dimention = model.dimentions[j];
                if (j < model.panels.length - 1) {
                    panel.after(this.Splitter({
                        oriention: model.oriention,
                        used: used,
                        dimention: dimention,
                        groupIndex: i,
                        panelIndex: j,
                        thickness: thickness,
                    }));
                }
                panel.css(this.getPanelStyle({ oriention: model.oriention, dimention: dimention, used: used }));
                used += dimention + thickness;
            }
        }
        $(".r-splitter").unbind("mousedown", r_resizable_panels.mouseDown).bind("mousedown", r_resizable_panels.mouseDown);
        
    },
    Splitter: function (obj) {
        function getStyle() {
            var str = 'position:absolute;background:#000;border:none;';
            if (obj.oriention === "horizontal") {
                str += 'height:100%;';
                str += 'width:' + obj.thickness + 'px;';
                str += 'top:0;';
                str += 'left:' + (obj.used + obj.dimention) + 'px;';
                str += 'cursor:col-resize';
            }
            else {
                str += 'width:100%;';
                str += 'height:' + obj.thickness + 'px;';
                str += 'left:0;';
                str += 'top:' + (obj.used + obj.dimention) + 'px;';
                str += 'cursor:row-resize';
            }
            return str;
        }
        var str = '';
        str += '<div ';
        str += 'ondragstart="return false;" ';
        str += 'class="r-splitter" ';
        str += 'data-direction="' + obj.oriention + '" ';
        str += 'data-index="' + (obj.groupIndex + ',' + obj.panelIndex) + '" ';
        str += 'style="' + getStyle() + '">';
        return str;
    },
    getPanelStyle(obj) {
        if (obj.oriention === "horizontal") {
            return { position: "absolute", width: obj.dimention + "px", height: "100%", left: obj.used + "px", top: "0px" };
        }
        else {
            return { position: "absolute", height: obj.dimention + "px", width: "100%", top: obj.used + "px", left: "0px" };
        }
    },
    mouseUp: function () {
        $(window).unbind("mousemove", r_resizable_panels.mouseMove);
        $(window).unbind("mouseup", r_resizable_panels.mouseUp);
    },
    mouseMove: function (e) {
        e.preventDefault();
        var splitter = r_resizable_panels.start.splitter;
        var beforePanel = r_resizable_panels.start.beforePanel;
        var afterPanel = r_resizable_panels.start.afterPanel;
        var min = r_resizable_panels.start.min;
        if (r_resizable_panels.start.oriention === "horizontal") {
            var offset = e.clientX - r_resizable_panels.start.x;
            var splitterLeft = splitter.left + offset;
            var beforePanelWidth = beforePanel.width + offset;
            if (beforePanelWidth < min) {
                return;
            }
            var afterPanelWidth = afterPanel.width - offset;
            if (afterPanelWidth < min) {
                return;
            }
            splitter.element.css({ left: splitterLeft });
            beforePanel.element.css({ width: beforePanelWidth });
            afterPanel.element.css({ width: afterPanelWidth, left: afterPanel.left + offset });
        }
        else {
            var offset = e.clientY - r_resizable_panels.start.y;
            var splitterLeft = splitter.left + offset;
            var beforePanelHeight = beforePanel.height + offset;
            if (beforePanelHeight < min) {
                return;
            }
            var afterPanelHeight = afterPanel.height - offset;
            if (afterPanelHeight < min) {
                return;
            }
            splitter.element.css({ top: splitter.top + offset });
            beforePanel.element.css({ height: beforePanel.height + offset });
            afterPanel.element.css({ height: afterPanel.height - offset, top: afterPanel.top + offset });
        }
    },
    clicked: null,
    mouseDown: function (e) {
        $(window).bind("mousemove", r_resizable_panels.mouseMove);
        $(window).bind("mouseup", r_resizable_panels.mouseUp);
        var element = $(e.target);
        var index = element.attr("data-index");
        index = index.split(",");
        var modelIndex = parseInt(index[0]);
        var splitterIndex = parseInt(index[1]);
        var model = r_resizable_panels.model[modelIndex];
        var beforePanel = model.panels.eq(splitterIndex);
        var afterPanel = model.panels.eq(splitterIndex + 1);
        r_resizable_panels.start = {
            splitter: { element: element, top: parseInt(element.css("top")), left: parseInt(element.css("left")) },
            beforePanel: { element: beforePanel, width: parseInt(beforePanel.css("width")), height: parseInt(beforePanel.css("height")), top: parseInt(beforePanel.css("top")), left: parseInt(beforePanel.css("left")) },
            afterPanel: {
                element: afterPanel,
                width: parseInt(afterPanel.css("width")),
                height: parseInt(afterPanel.css("height")),
                top: parseInt(afterPanel.css("top")),
                left: parseInt(afterPanel.css("left"))
            },
            oriention: element.attr("data-direction"),
            min:model.min,
            x: e.clientX,
            y: e.clientY
        };
    },
}
r_resizable_panels.init();