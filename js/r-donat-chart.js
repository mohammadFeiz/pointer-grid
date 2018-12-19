//r-donat-chart.js////
function rDonatChart(config) {
    var a = {
        state: { start: 0, end: 100, emptyColor: "#eee", fillColor: "#000", thickness: 5, unit:""},
        clear: function () { 
            this.ctx.clearRect(0, 0, this.state.size, this.state.size); 
        },
        drawArc: function (obj) {
            this.ctx.save();
            this.ctx.beginPath();
            if (obj.dashed) { this.ctx.setLineDash(obj.dashed); }
            this.ctx.arc(obj.x, obj.y, obj.r, obj.start, obj.end);
            this.ctx.lineWidth = obj.thickness;
            this.ctx.strokeStyle = obj.color;
            this.ctx.stroke();
            this.ctx.closePath();
            this.ctx.restore();
        },
        drawEmpty: function () {
            var s = this.state,r = s.size / 2;
            this.drawArc({ x: r, y: r, r: r - s.thickness / 2, start: 0, end: 360, thickness: s.thickness, color: s.emptyColor, dashed: this.state.dashed });
        },
        drawFill: function () { 
            var s = this.state, r = s.size / 2, angle = this.getAngle(s.value); 
            this.drawArc({ x: r, y: r, r: r - s.thickness / 2, start: angle, end: 0, thickness: s.thickness, color: s.fillColor }); 
        },
        getAngle: function (value) { 
            var s = this.state; 
            if (value === s.start) { value = s.end; } 
            else if (value === s.end) { value = s.start; } 
            var angle = 360 * (value - s.start) / (s.end - s.start); 
            return (360 - angle) * Math.PI / 180; 
        },
        getContainer:function(){
            return typeof this.state.container === "string"?$(this.state.container):this.state.container;
        },
        CanvasChart:function(props) {
            function getStyle() { 
                return 'overflow:hidden;position:absolute;width:'+props.size+'px;height:'+props.size+'px;left:0;top:0;text-align:center;line-height:' + props.size + 'px;'; 
            }
            return '<canvas width="' + props.size + '" height="' + props.size + '" style="' + getStyle() + '"></canvas><div style="' + getStyle() + '"></div>';
        },
        updateState: function (obj) {
            var s = this.state;
            for (var prop in obj) {s[prop] = obj[prop];}
            if (s.value === undefined || s.value < s.start) { s.value = s.start; }
            else if (s.value > s.end) { s.value = s.end; }s.speed = Math.pow((s.end - s.start) / 1600, -1);
            var container = this.getContainer();
            s.size = Math.min(container.width(), container.height());
            var position = container.css("position"); if (position === "static") { container.css("position", "relative"); }
        },
        update: function (obj) {
            this.updateState(obj);
            var s = this.state;
            var container = this.getContainer();
            container.html(this.CanvasChart({ size: s.size }));
            this.ctx = container.find("canvas")[0].getContext("2d");
            this.clear(); 
            this.drawEmpty(); 
            this.drawFill();
            container.find("div").html(s.text || s.value + s.unit);
        },
    };
    a.update(config);
    return {update: a.update.bind(a)};
}
