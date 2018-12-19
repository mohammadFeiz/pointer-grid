function RTreeGrid(config) {
    var a = {
        state: {
            border_color:"#ddd",
            border_width:1,
        },
        update: function (config) {
            for (var prop in config) { this.state[prop] = config[prop]; }
            $(this.state.container).css({
                background:this.state.border_color,
                display:"grid",
                gridGap:this.state.border_width+"px",
                gridTemplateColumns:this.getWidths(this.state.columns),
            });
            this.render();
        },
        getWidths:function(columns){
            var str = "300px"
            for(var i = 0; i < columns.length; i++){
                str+=" " + columns[i].width + "px";
            }
            return str;
        },
        render: function () {
            var str = '';
            str += '<div class="r-tree-column tree"></div>';
            for (var i = 0; i < this.state.columns.length; i++) {
                var column = this.state.columns[i];
                if (typeof column.field === "string") { column.field = [column.field];}
                str += '<div class="r-tree-column column' + (column.className ? ' ' + column.className : '') + '"></div>';
            }
            var container = $(this.state.container);
            container.html(str);
            var treeState = JSON.parse(JSON.stringify(this.state));
            treeState.container = this.state.container + " .tree";
            treeState.onclose = this.onclose;
            treeState.onopen = this.onopen;
            this.tree = new RTree(treeState);
            this.nodes = this.tree.getNodes();
            container.find(".r-tree-row").css({borderBottom: this.state.border_width + 'px solid '+ this.state.border_color});
            for (var i = 0; i < this.nodes.length; i++) {
                var node = this.nodes[i];
                for (var j = 0; j < this.state.columns.length; j++) {
                    var column = this.state.columns[j];
                    var template = '<div class="r-tree-cell' + (column.rowsClassName ? ' ' + column.rowsClassName : '') + '" ';
                    template += 'data-id="' + node.id + '" ';
                    template += 'style="height: ' + this.state.row_height + 'px;line-height: ' + this.state.row_height + 'px;border-bottom: '+this.state.border_width+'px solid '+this.state.border_color+';"';
                    template += '>';
                    template += '</div>';
                    var columnElement = container.find("." + column.className);
                    columnElement.append(template);
                    var cellElement = columnElement.find("[data-id="+node.id+"]");
                    this.state.templates[column.type](this.getValue(node,column.field),cellElement);
                }
            }
        },
        getNodes:function(){
            return this.nodes;
        },
        getValue:function(node,field){
            var value = node[field[0]];
            for (var k = 1; k < field.length; k++) { value = value[field[k]]; }
            return value;        
        },
        onclose: function (obj) {
            var id = obj.id;
            var childs = a.tree.getAllChilds(id);
            for (var i = 0; i < childs.length; i++) {
                for (var j = 0; j < a.state.columns.length; j++) {
                    var column = a.state.columns[j];
                    $(".r-tree-cell[data-id=" + childs[i].id + "]").hide();
                }
            }
        },
        onopen: function (obj) {
            var id = obj.id;
            var childs = a.tree.getChilds(id);
            for (var i = 0; i < childs.length; i++) {
                for (var j = 0; j < a.state.columns.length; j++) {
                    var column = a.state.columns[j];
                    $(".r-tree-cell[data-id=" + childs[i].id + "]").show();
                }
                if (childs[i].opened === false && childs[i].isLeaf === false) { continue; }
                a.onopen(childs[i]);
            }
            $(a.state.container).find(".r-tree-row").css({borderBottom: a.state.border_width + 'px solid '+ a.state.border_color});
        }
    };
    a.update(config);
    return a;
}


