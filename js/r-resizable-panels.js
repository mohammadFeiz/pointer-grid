var r_resizable_panels = {
    start: null,
    splitterBackground: "orange",
    init: function () {
        var groups = $(".r-resizable-group");
        groups.css({ display: "flex", flexWrap: "nowrap" });
        for (var i = 0; i < groups.length; i++) {
            var group = groups.eq(i);
            var thickness = group.attr("data-splitter-size") || 8; thickness = parseInt(thickness);
            var min = group.attr("data-min-width") || 50; min = parseInt(min);
            var cols = group.attr("data-cols");
            var rows = group.attr("data-rows");
            var dimentions = cols || rows;
            dimentions = dimentions.split(",");
            var panels = group.find(".r-resizable-panel");
            for (var j = 0; j < panels.length; j++) {
                var panel = panels.eq(j);
                dimentions[j] = dimentions[j] || "*";
                if (dimentions[j] !== "*") {
                    panel.css({ width: dimentions[j] });
                }
                else {
                    panel.css({ width: "100%" });
                }
                if (j < panels.length - 1) { panel.after(this.Splitter({ thickness: thickness, })); }
            }
        }
        $(".r-splitter").unbind("mousedown", r_resizable_panels.mouseDown).bind("mousedown", r_resizable_panels.mouseDown);
    },
    Splitter: function (obj) {
        return '<div class="r-splitter" style="width:' + obj.thickness + 'px;">';
    },
    mouseDown: function (e) {
        $(window).bind("mousemove", r_resizable_panels.mouseMove);
        $(window).bind("mouseup", r_resizable_panels.mouseUp);
        var element = $(e.target);
        var prev = element.prev(".r-resizable-panel");
        var next = element.next(".r-resizable-panel");
        r_resizable_panels.start = {
            prev: {
                element: prev,
                width: prev.width(),
                height: prev.height(),
            },
            next: {
                element: next,
                width: next.width(),
                height: next.height(),
            },
            x: e.clientX,
            y: e.clientY
        };
    },
    mouseUp: function () {
        $(window).unbind("mousemove", r_resizable_panels.mouseMove);
        $(window).unbind("mouseup", r_resizable_panels.mouseUp);
    },
    mouseMove: function (e) {
        e.preventDefault();
        var prev = r_resizable_panels.start.prev.element;
        var next = r_resizable_panels.start.next.element;
        var offset = e.clientX - r_resizable_panels.start.x;
        prev.css({ width: r_resizable_panels.start.prev.width + offset });
        next.css({ width: r_resizable_panels.start.next.width - offset });
    },

}
r_resizable_panels.init();