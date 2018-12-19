function RTree(config) {
    var a = {
        state: { row_height: 20, direction: "ltr", checkMode: "none", offset: 16, flatData: [], nestedData: [], checkIds: true, collapseIconWidth:24,iconWidth:24 },
        update: function (config) {
            var s = this.state;
            for (var prop in config) { s[prop] = config[prop]; }
            this.setMinWidth();
            $(this.state.container).css({ direction: s.direction });
            this.nodeIds = [];
            s.flatData = [];
            s.nestedData = [];
            s.dataType = "";
            if (s.model[0].parentId !== undefined && s.model[0].childs === undefined) {
                s.dataType = "flat";
                this.convertToNested(s.nestedData, "#");
                s.model = s.nestedData;
            }
            for (var i = 0; i < s.model.length; i++) { this.convertToFlatData(s.model[i], "#", 0, i + ""); }
            this.render();
        },
        setMinWidth: function () {
            var s = this.state;
            s.minWidth = 0;
            if (s.collapseIcons) { s.minWidth += s.collapseIconWidth; }
            else { this.getCollapseIcon = function () { return "" }; }
            if (s.icons) { s.minWidth += s.iconWidth; }
            else { this.getIcon = function () { return "" }; }
            if (s.checkable === true) { s.minWidth += 16; }
            else { this.getCheckbox = function () { return "" }; }
        },
        CheckIds: function (node, index) {
            if (this.nodeIds.indexOf(node.id) !== -1) { alert("duplicate id(" + node.id + ")!!!"); return false; }
            this.nodeIds.push(node.id);
        },
        convertToFlatData: function (node, parentId, level, index) {
            if (this.state.checkIds === true) { this.CheckIds(node, index); }
            node.childs = node.childs || [];
            node.className = this.getClassName(node);
            node.dataIndex = index;
            node.isLeaf = node.childs.length === 0;
            node.parentId = parentId;
            node.level = level;
            node.selected = node.selected || false;
            node.checked = node.checked || false;
            node.opened = node.opened || false;
            this.state.flatData.push(node);
            for (var i = 0; i < node.childs.length; i++) { this.convertToFlatData(node.childs[i], node.id, level + 1, index + "," + i); }
        },
        convertToNested: function (model, parentId) {
            var s = this.state, l = s.model.length;
            for (var i = 0; i < l; i++) {
                var node = s.model[i];
                if (node.parentId === parentId) {
                    if (parentId === "#") { model.push(node); }
                    else {
                        model.childs = model.childs || [];
                        model.childs.push(node);
                    }
                    this.convertToNested(node, node.id);
                }
            }
        },
        render: function () {
            var s = this.state, container = $(s.container);
            var str = '';
            for (var i = 0; i < s.flatData.length; i++) {if (s.flatData[i].parentId === "#") { str += this.RTreeNode(s.flatData[i]); }}
            container.html(str);
            container.find(".r-tree-node .r-tree-node").css("padding-" + (s.direction === "rtl" ? 'right' : 'left'), s.offset + "px");
            this.setEvents();
        },
        getClassName: function (node) {
            var className = "r-tree-node";
            if (node.checked === true) { className += " checked"; }
            if (node.selected === true) { className += " selected"; }
            return className;
        },
        RTreeNode: function (node) {
            var s = this.state;
            var str = '';
            str += '<div class="' + node.className + '" data-index="' + node.dataIndex + '" data-id="' + node.id + '" data-level="' + (node.dataIndex.split(",").length - 1) + '">';
            str += '<div class="r-tree-row" style="min-width:' + s.minWidth + 'px;white-space:nowrap;cursor: pointer;">';
            str += this.getCollapseIcon(node);
            str += this.getCheckbox(node);
            str += this.getIcon(node);
            str += RTreeTemplate({ template: node.template, row_height: s.row_height, minWidth: s.minWidth });
            str += '</div>';
            if (node.opened) {
                for (var i = 0; i < node.childs.length; i++) { str += this.RTreeNode(node.childs[i]); }
            }
            str += '</div>';
            return str;
        },
        getCollapseIcon: function (node) {
            var s = this.state;
            if (node.isLeaf) { return RTreeCollapseIcon({ collapseIcon: "", row_height: s.row_height, direction: s.direction, width: s.collapseIconWidth }); }
            if (node.opened) { return RTreeCollapseIcon({ collapseIcon: s.collapseIcons.open, row_height: s.row_height, direction: s.direction, width: s.collapseIconWidth }); }
            else {return RTreeCollapseIcon({ collapseIcon: s.collapseIcons.close, row_height: s.row_height, direction: s.direction,width:s.collapseIconWidth });}
        },
        getIcon: function (node) {
            var s = this.state;
            return RTreeIcon({ icon: s.icons[node.iconType] || '', row_height: s.row_height, direction: s.direction,width:s.iconWidth });
        },
        getCheckbox: function (node) {
            var s = this.state;
            return RTreeCheckbox({ row_height: s.row_height, direction: s.direction }); 
        },
        filter: function (char) {
            this.update();
            if (!char) { return; }
            var leafs = $(this.state.container).find(".r-tree-node.leaf");
            for (var i = 0; i < leafs.length; i++) {
                var leaf = leafs.eq(i);
                var value = leaf.find("> .r-tree-row .r-tree-template").html();
                if (value.indexOf(char) !== -1) {
                    leaf.addClass("show");
                    var parent = leaf.parent(".r-tree-node");
                    while (parent.length !== 0) {
                        parent.addClass("show");
                        parent = parent.parent(".r-tree-node");
                    }
                }
            }
            $(this.state.container).find(".r-tree-node").not(".show").remove();
        },
        //////////////////collapse//////////////////////////////////////////////
        collapse: function (e) {
            var collapseIcon = $(e.currentTarget);
            var node = collapseIcon.parent().parent();
            var id = node.attr("data-id");
            var data = this.getNodes({ id: id })[0];
            if (data.opened) {
                this.close(id,data,node,collapseIcon);
                if (this.state.onclose) {
                    this.state.onclose(data);
                }
            }
            else {
                this.openOne(id, data, node, collapseIcon);
                if (this.state.onopen) { this.state.onopen(data); }
            }
        },
        close: function (id,data,node,collapseIcon) {
            data = data || this.getNodes({ id: id })[0];
            if (data.isLeaf) { return; }
            if (this.state.collapseIcons === undefined) { return false; }
            node = node || this.getElement(id);
            collapseIcon = collapseIcon || node.find(">.r-tree-row .r-tree-collapse-icon");
            collapseIcon.html(this.state.collapseIcons.close);
            node.find(">.r-tree-node").remove();
            data.opened = false;
        },
        
        openOne: function (id, data, node, collapseIcon) {
            var s = this.state;
            data = data || this.getNodes({ id: id })[0];
            if (data.isLeaf) { return; }
            if (this.state.collapseIcons === undefined || id === "#") { return false; }
            node = node || this.getElement(id);
            collapseIcon = collapseIcon || node.find(">.r-tree-row .r-tree-collapse-icon");
            collapseIcon.html(this.state.collapseIcons.open);
            for (var i = 0; i < data.childs.length; i++) {
                node.append(this.RTreeNode(data.childs[i]));
            }
            $(this.state.container).find(".r-tree-node .r-tree-node").css("padding-" + (s.direction === "rtl" ? 'right' : 'left'), s.offset + "px");
            this.setEvents();
            data.opened = true;
        },
        open: function (id) {
            var parents = this.getParents(id);
            parents = parents.reverse();
            for(var i = 0; i < parents.length; i++){
                this.openOne(parents[i].id);
            }
        },
        
        isOpen: function (id) {
            var node = this.getNodes({ id: id })[0];
            if (!node) { return false; }
            var parent = this.getParent(id);
            if (!parent && node.opened) { return true; }
            while (parent) {
                if (!parent.opened) { return false; }
                parent = this.getParent(parent.id);
            }
            return true;
        },
        /////////////////checking///////////////////////////////////////////////
        checking: function (e) {
            var node = $(e.currentTarget).parent().parent();
            var id = node.attr("data-id");
            var data = this.getNodes({ id: id })[0];
            if (node.hasClass("checked")) {
                this.uncheck(id);
                if (this.state.onuncheck) { this.state.onuncheck(data); }
            }
            else {
                this.check(id);
                if (this.state.oncheck) { this.state.oncheck(data); }
            }
        },
        uncheck: function (id) {
            var node = this.getElement(id);
            node.removeClass("checked");
            var data = this.getNodes({ id: id })[0];
            data.checked = false;
            data.className = this.getClassName(data);
        },
        uncheckAll: function () {
            for (var i = 0; i < this.state.flatData.length; i++) {
                var fd = this.state.flatData[i];
                if (!fd.checked) { continue; }
                this.uncheck(fd.id);
            }
        },
        check: function (id) {
            var node = this.getElement(id);
            node.addClass("checked");
            var data = this.getNodes({ id: id })[0];
            data.checked = true;
            data.className = this.getClassName(data);
        },
        checkAll: function () {
            for (var i = 0; i < this.state.flatData.length; i++) {
                var fd = this.state.flatData[i];
                if (fd.checked) { continue; }
                this.check(fd.id);
            }
        },
        hasCheckedChild: function (id) { return !this.getElement(id).find(".r-tree-node.checked").length === 0 },
        /////////////////selecting//////////////////////////////////////////////
        selecting: function (e) {
            var node = $(e.currentTarget).parent().parent();
            var id = node.attr("data-id");
            this.select(id);
        },
        select: function (id) {
            this.deselectAll();
            var nodeElement = this.getElement(id);
            var data = this.getNodes({ id: id })[0];
            if (!data) { return false; }
            nodeElement.addClass("selected");
            data.selected = true;
            this.state.selected = { object: data, id: id };
            if (this.state.onselect) { this.state.onselect(data); }
        },
        deselectAll: function () {
            $(this.state.container).find(".r-tree-node").removeClass("selected");
            for (var i = 0; i < this.state.flatData.length; i++) {
                this.state.flatData[i].selected = false;
            }
        },
        /////////////////removing////////////////////////////////////////////////
        remove: function (id) {
            var node = this.getNodes({id:id})[0];
            if(!node){return false;}
            if(node.parentId === "#"){var model = this.state.model;}
            else{var model =this.getParent(id).childs; }
            for (var i = 0; i < model.length; i++) {if (model[i].id === id) {model.splice(i, 1); break;}}
            this.update();
        },
        add: function (obj, parentId) {
            if(parentId === "#"){var model = this.state.model;}
            else{
                var node = this.getNodes({ id: parentId })[0];
                if (!node) { alert("a node by id=" + parentId + " as parent not found!!!"); return false; }
                var model = this.getModelByIndex(node.dataIndex).childs;
            }
            model.push(obj);
            this.update();
        },
        ////////////////////////////get//////////////////////////////////////////////
        getElement: function (id) {
            var element = $(this.state.container).find(".r-tree-node[data-id=" + id + "]");
            return element.length > 0 ? element : false;
        },
        getParent: function (id) {
            var node = this.getNodes({ id: id })[0];
            if (!node) { return false; }
            var parent = this.getNodes({ id: node.parentId })[0];
            if (!node) { return false; }
            return parent;
        },
        getParents: function (id) {
            var list = [];
            var parent = this.getParent(id);
            while (parent) {
                list.push(parent);
                parent = this.getParent(parent.id);
            }
            return list;
        },
        getNodes: function (obj) {
            var list = [];
            obj = obj || {};
            var data = this.state.flatData;
            for (var i = 0; i < data.length; i++) {
                var d = data[i];
                var success = true;
                for (var prop in obj) { if (d[prop] !== obj[prop]) { success = false; break; } }
                if (success === false) { continue; }
                list.push(d);
            }
            return list;
        },
        getAllChilds: function (id) {
            var list = [], data = this.state.flatData;
            var node = this.getNodes({ id: id })[0];
            if (!node) { return false; }
            for (var i = 0; i < data.length; i++) {
                var d = data[i];
                if (d.id !== id && d.dataIndex.indexOf(node.dataIndex) === 0) { list.push(d); }
            }
            return list;
        },
        getChilds:function(id){return this.getNodes({parentId :id});},
        getData: function (type){
            if(type === "flat"){return this.state.flatData;}
            else if(type === "nested" || this.state.dataType !== "flat"){
                this.state.nestedData = [];
                this.convertToNested(this.state.nestedData,"#");
                return this.state.nestedData
            }
            else{return this.state.flatData;}
        },
        getModelByIndex:function(index){
            index = index.split(",");
            var model = this.state.model[index[0]];
            for (var i = 1; i < index.length; i++) {model = model.childs[index[i]];}
            return model;
        },
        ////////////////////////////////////////////////////////////////////////////////////
        keypress: function (e) {
            //e.preventDefault();
            var container = $(this.state.container);
            var key = e.keyCode || e.witch;
            if (key === 38 || key === 40) {
                e.preventDefault();
                var nodes = container.find(".r-tree-node");
                var selectedIndex = nodes.index($(".selected"));
                var nextIndex = selectedIndex + (key === 38 ? -1 : 1);
                if (nextIndex < 0) { return false; }
                var next = nodes.eq(nextIndex);
                while (next && next.length > 0 && !this.isOpen(next.attr("data-id"))) {
                    nextIndex = nextIndex + (key === 38 ? -1 : 1);
                    next = nodes.eq(nextIndex);
                }
                if (!next || next.length === 0) { return false; }
                var id = next.attr("data-id");
                this.select(id);
                this.isInScreen(id);
            }
            else if (key === 37 || key === 39) {
                var selected = this.getNodes({selected:true})[0];
                var id = selected.id;
                if (selected.opened && key === 37) {
                    this.close(id);
                    if (this.state.onclose) { this.state.onclose(selected); }
                }
                else if (!selected.isLeaf && !selected.opened && key === 39) {
                    this.openOne(id);
                    if (this.state.onopen) { this.state.onopen(selected); }
                }
            }
            else if (key === 13) {
                var selected = container.find(".r-tree-node.selected");
                if (selected.length === 0) { return; }
                var id = selected.attr("data-id");
                var data = this.getNodes({ id: id })[0];
                if (selected.hasClass("checked")) {
                    this.uncheck(id);
                    if (this.state.onuncheck) { this.state.onuncheck(data); }
                }
                else {
                    this.check(id);
                    if (this.state.oncheck) { this.state.oncheck(data); }
                }
            }
        },
        setEvents: function () {
            var s = this.state, container = $(s.container);
            container.find('.r-tree-collapse-icon').unbind('mousedown', $.proxy(this.collapse, this)).bind('mousedown', $.proxy(this.collapse, this));
            container.find('.r-tree-checkbox').unbind('mousedown', $.proxy(this.checking, this)).bind('mousedown', $.proxy(this.checking, this));
            container.find('.r-tree-icon,.r-tree-template').unbind('mousedown', $.proxy(this.selecting, this)).bind('mousedown', $.proxy(this.selecting, this));
            container.find('.r-tree-icon,.r-tree-template').unbind('dblclick', $.proxy(this.ondblclick, this)).bind('dblclick', $.proxy(this.ondblclick, this));
            $(window).unbind("keydown", $.proxy(this.keypress, this)).bind("keydown", $.proxy(this.keypress, this))
        },
        ondblclick: function (e) { if (this.state.ondblclick) { this.state.ondblclick(this.getNode({ id: $(e.currentTarget).parent().parent().attr("data-id") })); } },
        isInScreen: function (id) {
            var container = $(this.state.container), nodeElement = this.getElement(id), height = container.height();
            var up = container.offset().top, down = up + height, position = nodeElement.offset().top;
            if (position > down || position < up) { container.animate({ scrollTop: nodeElement.offset().top }, 20); }
        },
    }
    a.update(config);
    //return a;
    return {
        update: a.update.bind(a),getNodes: a.getNodes.bind(a),check: a.check.bind(a),uncheck: a.uncheck.bind(a),checkAll: a.checkAll.bind(a),
        uncheckAll: a.uncheckAll.bind(a),open: a.open.bind(a),isOpen: a.isOpen.bind(a),close: a.close.bind(a),remove: a.remove.bind(a),
        filter: a.filter.bind(a),add: a.add.bind(a),getData:a.getData.bind(a),getChilds:a.getChilds.bind(a),getAllChilds:a.getAllChilds.bind(a),
        getParent:a.getParent.bind(a),getParents:a.getParents.bind(a),getElement:a.getElement.bind(a),select:a.select.bind(a)
    };
}

function RTreeCollapseIcon(obj) {//opened-direction-row_height-collapseIcons
    function getStyle() {
        var str = '';
        str += 'position:relative;text-align: center;';
        str += 'float:' + (obj.direction === "ltr" ? 'left' : 'right') + ';'
        str += 'height:' + obj.row_height + 'px;';
        str += 'line-height:' + obj.row_height + 'px;';
        str += 'width:'+obj.width+'px;';
        return str;
    }
    return '<div class="r-tree-collapse-icon" style="' + getStyle() + '">' + obj.collapseIcon + '</div>';
}
function RTreeCheckbox(obj) {
    function getStyle() {
        var str = '';
        str += 'position:relative;text-align:center;';
        str += 'float:' + (obj.direction === "ltr" ? 'left' : 'right') + ';'
        str += 'height:14px;';
        str += 'line-height:14px;';
        str += 'border:1px solid;';
        str += 'width:14px;';
        str += 'border-width:1px;';
        str += 'margin:' + ((obj.row_height - 14 - 2) / 2) + 'px 0px;';
        return str;
    }
    return '<div class="r-tree-checkbox" style="' + getStyle() + '"></div>';
}
function RTreeTemplate(obj) {
    function getStyle() {
        var str = '';
        str += 'display: inline-block;';
        str += 'height:' + obj.row_height + 'px;';
        str += 'line-height:' + obj.row_height + 'px;';
        str += 'width:calc(100% - ' + obj.minWidth + 'px);';
        return str;
    }
    var str = '';
    str += '<div class="r-tree-template" style="' + getStyle() + '">';
    str += obj.template || '';
    str += '</div>';
    return str;
}
function RTreeIcon(obj) {
    function getStyle() {
        var str = '';
        str += 'position:relative;text-align: center;width:'+obj.width+'px;';
        str += 'float:' + (obj.direction === "ltr" ? 'left' : 'right') + ';'
        str += 'height:' + obj.row_height + 'px;';
        str += 'line-height:' + obj.row_height + 'px;';
        return str;
    }
    var str = '';
    str += '<div class="r-tree-icon" style="' + getStyle() + '">';
    str += obj.icon || '';
    str += '</div>';
    return str;
}