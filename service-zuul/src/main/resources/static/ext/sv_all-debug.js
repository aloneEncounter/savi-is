var Sv = {
    /**
     * ajax Post异步调用
     * @param url  地址
     * @param params  参数
     * @param jsonData  json参数
     * @param svsuccessok 成功后回调函数
     */
    requestPost: function (url, params, jsonData, ismsg, svsuccessok) {
        Ext.Ajax.request({
            url: Ext.actualUrl(url),
            method: 'POST',
            params: params,
            jsonData: jsonData,
            success:function(response) {
                var obj = Ext.decode(response.responseText);
                if (obj.success){
                    if(Ext.isFunction(svsuccessok))
                    {
                        svsuccessok(obj);
                    }
                }
                else{
                    if(ismsg) { Ext.MessageBox.alert("提示信息",obj.message); }
                    Ext.log.warn(obj.message);
                }
            },
            failure : function(response) {
                if(ismsg) { Ext.MessageBox.alert("提示信息","提示信息","请求失败!"); }
                Ext.log.error("提示信息",url+"请求失败!");
            }
        });
    },
    requestPostParams: function(url, params, svsuccessok){
        this.requestPost(url, params, null, true, svsuccessok);
    },
    requestPostJsonData: function(url, jsonData, svsuccessok){
        this.requestPost(url, null, jsonData, true, svsuccessok);
    },
    /**
     * ajax Post同步调用
     * @param url  地址
     * @param params  参数
     * @param jsonData  json参数
     * @param svsuccessok 成功后回调函数
     */
    requestPostNoAsync: function(url, params, jsonData, ismsg) {
        var rvalue=null;
        if(ismsg == undefined){ ismsg = true; }
        Ext.Ajax.request({
            url: Ext.actualUrl(url),
            method: 'POST',
            params: params,
            jsonData: jsonData,
            async: false,
            success:function(response) {
                var obj = Ext.decode(response.responseText);
                if (obj.success){
                    rvalue = obj;
                }
                else{
                    if(ismsg) { Ext.MessageBox.alert("提示信息",obj.message); }
                    Ext.log.warn(obj.message);
                }
            },
            failure : function(response) {
                if(ismsg) { Ext.MessageBox.alert("提示信息","提示信息","请求失败!"); }
                Ext.log.error("提示信息",url+"请求失败!");
            }
        });
        return rvalue;
    },
    requestPostNoAsyncParams: function(url, params){
        return this.requestPostNoAsync(url, params, null, true);
    },
    requestPostNoAsyncJsonData: function(url, jsonData){
        return this.requestPostNoAsync(url, null, jsonData, true);
    }
};
Ext.QuickTips.init();
/**日期区间清除*/
Ext.form.field.Date.override({
    reset: function(){
        var me = this;
        me.callParent();
        me.setMaxValue();
        me.setMinValue();
    }
});
/** 获取数据扩充 */
Ext.data.Store.override({
    getRecordsValues : function () {
        var records = this.getRange() || [],
            values = [],
            i;

        for (i = 0; i < records.length; i++) {
            var obj = {}, dataR;

            dataR = Ext.apply(obj, records[i].data);
            if (Ext.isObject(dataR)) {
                values.push(dataR);
            }
        }
        return values;
    }
});
/** 显示子项 */
Ext.grid.column.Column.override({
    bindFormatter: function (format) {
        var me = this;

        return function (v) {
            if(Ext.isObject(v) && me.dataChild){
                return format(v[me.dataChild], me.rendererScope || me.resolveListenerScope());
            }
            else{
                return format(v, me.rendererScope || me.resolveListenerScope());
            }
        };
    },
});

Ext.define('Sv.Ext.grid.Panel', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.svgrid',
    isFormField: true,
    initComponent: function () {
        var me = this;
        me.callParent(arguments);
    },
    setValue:function (values) {
        if(this.store){
            this.store.setData(values);
            this.store.save();
        }
    },
    getValue:function(){
        return getSubmitData();
    },
    getSubmitData:function () {
        var me = this,
            data = null,
            val = me.getSubmitValue();
        if (!me.disabled && val) {
            data = {};
            data[me.getName()] = val;
        }
        return data;
    },
    getName:function () {
        return this.name;
    },
    getSubmitValue:function () {
        if(this.store){
            return this.store.getRecordsValues();
        }
    },
    isValid:function () {
        return true;
    },
    validate:function () {
        return this.isValid();
    },
    isDirty : function () {
        return this.store.getNewRecords().length > 0 || this.store.getUpdatedRecords().length > 0 || this.store.getRemovedRecords().length > 0;
    },
    save:function () {
        if(this.store){
            return this.store.save();
        }
    },
    setReadOnly:function (readOnly) {
        //关闭表格编辑状态
        var cols = this.getColumns();
        for (var i = 0, ilen = cols.length; i < ilen; i++) {
            if (cols[i].dataIndex && cols[i].dataIndex != "" && cols[i].getEditor) {
                var edit = cols[i].getEditor();
                if (edit && edit.setReadOnly) edit.setReadOnly(readOnly);
            }
        }
        var di = this.query("*[readOnlyHide=true]")
        if(Ext.isIterable(di)){
            for(var i=0; i< di.length; ++i){
                if(readOnly){di[i].hide();}
                else {di[i].show();}
            }
        }
    },
    reset:function () {
        if(this.store){
            this.store.removeAll();
        }
    }
});

// grid表数据填充模板
Ext.define('Sv.util.Format', {
    override: 'Ext.util.Format',
    chMoney: function(v) {
        var vt = this.number(v, ',0.00');
        if(v == 0){
            return "<span style='color:#bababa'>" + vt + "</span>";
        }else if(v < 0){
            return "<span style='color:#cf4c35'>" + vt + "</span>";
        }else {
            return "<span style='color:#000000'>" + vt + "</span>";
        }
    },
    formState: function (v) {
        switch(v){
            case 0: return '草稿';
            case 1: return '提交';
            case 2: return '审核中';
            case 3: return '确认中';
            case 4: return '办理中';
            case 8: return '结束';
            case 9: return '作废';
            default: return '未知';
        }
    }
});

Ext.define('Sv.WinView', {
    extend: 'Ext.window.Window',
    modal:true, closeAction: 'hide',
    on_hide: null,
    loader: {
        renderer: "frame",url: "about:blank", loadMask: '加载中......'
    },
    open:function (title, url, on_hide) {
        this.setTitle(title);
        this.show();
        this.loader.url = url;
        this.loader.load();
        this.on_hide = on_hide;
    },
    listeners: {
        hide: function(){
            this.loader.url = "about:blank";
            this.loader.load();
            if(this.on_hide && Ext.isFunction(this.on_hide)){
                this.on_hide();
            }
            this.on_hide=null;
        }
    }
});

Ext.getWinView = function () {
    var win=null;
    if (window.top.Bil){
        win = window.top.Bil.getAppWin();
    }
    if(!win){
        win = Ext.create("Sv.WinView",{resizable: false,maximized: true});
    }
    return win;
}

Ext.grid.column.Check.override({
    listeners: {
        beforecheckchange: function() {
            if(this.stopSelection) {return false;}
            return true; // HERE
        }
    }
});
/**
 * 中文排序
 * @param sorters
 * @returns {Function}
 */
Ext.define('Ext.my.util.Sorter', {
    override: 'Ext.util.Sorter',
    sortFn: function(item1, item2) {
        var me = this,
            transform = me._transform,
            root = me._root,
            property = me._property,
            lhs, rhs;
        if (root) {
            item1 = item1[root];
            item2 = item2[root];
        }
        lhs = item1[property];
        rhs = item2[property];
        if (transform) {
            lhs = transform(lhs);
            rhs = transform(rhs);
        }
        if(typeof(lhs) == "string"){
            return lhs.localeCompare(rhs);
            /*if(s.direction == 'DESC'){
             result *= -1;
             }*/
        }else{
            return (lhs > rhs) ? 1 : (lhs < rhs ? -1 : 0);
        }
    }
});
Ext.define('Sv.ComponentLoader', {
    override : 'Ext.ComponentLoader',
    autoLoad: true,
    removeD: false,
    constructor: function(config) {
        config = config || {};
        var autoLoad = config.autoLoad;
        config.autoLoad = false;
        this.superclass.constructor.call(this, config);
        if (autoLoad !== false) {
            this.autoLoad = true;
        }
        if (this.renderer == "frame") {
            var target = this.getTarget();
            if (!target.isContainer) {
                throw 'IFrame can only be loader to a container';
            }
            target.layout = "fit";
        }
        var loadConfig = { delay: 10, single: true },
            triggerControl = this.triggerControl || this.getTarget(),
            triggerEvent = this.triggerEvent,
            defaultTriggerEvent = triggerControl instanceof Ext.container.Container ? "afterlayout": "afterrender";
        loadConfig.single = !(this.reloadOnEvent || false);
        if (this.autoLoad) {
            triggerControl.on(defaultTriggerEvent,
                function() {
                    this.load({});
                }, //渲染后加载
                this, loadConfig);
            if(triggerEvent){
                triggerControl.on(triggerEvent,
                    function() {
                        this.load({});
                    }, //渲染后加载
                    this, loadConfig);
            }
        }
    },
    load: function(options) {
        if (Ext.isString(options)) {
            this.url=options;
            options = { url: options };
        } else {
            options = Ext.apply({}, options);
        }
        this.lastOptions = options;
        if (this.renderer == "frame") {
            this.loadFrame(options);
            return;
        }
    },
    loadFrame: function(options) {
        options = Ext.apply({}, options);
        var me = this,
            target = me.getTarget(),
            mask = Ext.isDefined(options.loadMask) ? options.loadMask: me.loadMask,
            disableCaching = Ext.isDefined(options.disableCaching) ? options.disableCaching: me.disableCaching,
            disableCachingParam = options.disableCachingParam || "_dc",
            params = Ext.apply({}, options.params);
        Ext.applyIf(params, me.params);
        Ext.apply(params, me.baseParams);
        Ext.applyIf(options, { url: me.url });
        Ext.apply(options, {
            mask: mask,
            disableCaching: disableCaching,
            params: params
        });
        this.lastOptions = options;
        if (!options.url) {
            throw 'No URL specified';
        }
        // if (me.fireEvent('beforeload', me, options) === false) {
        //     return;
        // }
        var url = options.url;
        if (disableCaching !== false) {
            url = url + ((url.indexOf("?") > -1) ? "&": "?") + disableCachingParam + "=" + new Date().getTime();
        }
        if (!Ext.Object.isEmpty(params)) {
            var p = {};
            for (var key in params) {
                var ov = params[key];
                if (typeof ov == "function") {
                    p[key] = ov.call(target);
                } else {
                    p[key] = ov;
                }
            }
            p = Ext.urlEncode(p);
            url = url + ((url.indexOf("?") > -1) ? "&": "?") + p;
        }
        if (Ext.isEmpty(target.iframe)) {
            target.iframe= new Ext.ux.IFrame({
                id: target.id + "_IFrame",
                loadMask: Ext.isString(mask)? mask:((mask.msg)? mask.msg:'加载中......'),
                listeners: {
                    destroy: function() {
                        var iframe = this.getFrame();
                        if (iframe && iframe.parentNode) {
                            iframe.src = 'about:blank';
                            iframe.parentNode.removeChild(iframe);
                        }
                    },
                    load: function () {
                        var cw = this.getWin();
                        if(cw){ cw.target = target; }
                    }
                }
            });
            target.add(target.iframe);
            target.iframe.load(url);
        } else {
            target.iframe.load(url);
            // if (Ext.isIE && Ext.ieVersion <= 9)
        }
    }
});
Ext.define('Sv.view.SearchTrigger', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.searchtrigger',
    setFilter: function(filterId, value){
        var store = this.up('grid').getStore();
        if(value){
            store.removeFilter(filterId, false);
            var filter = {id: filterId, property: filterId, value: value};
            if(this.anyMatch) filter.anyMatch = this.anyMatch;
            if(this.caseSensitive) filter.caseSensitive = this.caseSensitive;
            if(this.exactMatch) filter.exactMatch = this.exactMatch;
            if(this.operator) filter.operator = this.operator;
            //console.log(this.anyMatch, filter)
            store.addFilter(filter);
        } else {
            store.filters.removeAtKey(filterId);
            store.reload();
        }
    },
    listeners: {
        render: function(){
            var me = this;
            me.ownerCt.on('resize', function(){
                me.setWidth(this.getEl().getWidth());
            })
        },
        change: function() {
            this.setFilter(this.up().dataIndex, this.getValue());
        }
    }
});

Ext.define('Ext.app.Portlet', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.portlet',
    layout: 'fit',
    anchor: '100%',
    frame: true,
    closable: true,
    collapsible: true,
    animCollapse: true,
    draggable: {
        moveOnDrag: false
    },
    resizeHandles: 's',
    resizable: true,
    cls: 'x-portlet',
    doClose: function() {
        if (!this.closing) {
            this.closing = true;
            this.el.animate({
                opacity: 0,
                scope: this,
                callback: function() {
                    var closeAction = this.closeAction;
                    this.closing = false;
                    this.fireEvent('close', this);
                    this[closeAction]();
                    if (closeAction == 'hide') {
                        this.el.setOpacity(1);
                    }
                }
            });
        }
    }
});
Ext.define('Ext.app.PortalColumn', {
    extend: 'Ext.container.Container',
    alias: 'widget.portalcolumn',
    layout: 'anchor',
    defaultType: 'portlet',
    cls: 'x-portal-column'
});
Ext.define('Ext.app.PortalPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.portalpanel',
    cls: 'x-portal',
    bodyCls: 'x-portal-body',
    defaultType: 'portalcolumn',
    autoScroll: true,
    initComponent: function() {
        var me = this;
        this.layout = { type: 'column' };
        this.callParent();
        this.on('drop', this.updateLayout, this);
    },
    beforeLayout: function() {
        var items = this.layout.getLayoutItems(),
        len = items.length,
        i = 0,
        cw = 1,
        cwCount = len,
        item;
        for (i = 0; i < len; i++) {
            item = items[i];
            if (item.columnWidth) {
                cw -= item.columnWidth || 0;
                cwCount--;
            }
        }
        for (i = 0; i < len; i++) {
            item = items[i];
            if (!item.columnWidth) {
                item.columnWidth = cw / cwCount;
            }
            item.removeCls(['x-portal-column-first', 'x-portal-column-last']);
        }
        if (items.length > 0) {
            items[0].addCls('x-portal-column-first');
            items[len - 1].addCls('x-portal-column-last');
        }
        return this.callParent(arguments);
    },
    initEvents: function() {
        this.callParent();
        this.dd = Ext.create('Ext.app.PortalDropZone', this, this.dropConfig);
    },
    beforeDestroy: function() {
        if (this.dd) {
            this.dd.unreg();
        }
        this.callParent();
    }
});
Ext.define('Ext.app.PortalDropZone', {
    extend: 'Ext.dd.DropTarget',
    constructor: function(portal, cfg) {
        this.portal = portal;
        Ext.dd.ScrollManager.register(portal.body);
        Ext.app.PortalDropZone.superclass.constructor.call(this, portal.body, cfg);
        portal.body.ddScrollConfig = this.ddScrollConfig;
    },
    ddScrollConfig: {
        vthresh: 50,
        hthresh: -1,
        animate: true,
        increment: 200
    },
    createEvent: function(dd, e, data, col, c, pos) {
        return {
            portal: this.portal,
            panel: data.panel,
            columnIndex: col,
            column: c,
            position: pos,
            data: data,
            source: dd,
            rawEvent: e,
            status: this.dropAllowed
        };
    },
    notifyOver: function(dd, e, data) {
        var xy = e.getXY(),
        portal = this.portal,
        proxy = dd.proxy;
        if (!this.grid) {
            this.grid = this.getGrid();
        }
        var cw = portal.body.dom.clientWidth;
        if (!this.lastCW) {
            this.lastCW = cw;
        } else if (this.lastCW != cw) {
            this.lastCW = cw;
            this.grid = this.getGrid();
        }
        var colIndex = 0,
        colRight = 0,
        cols = this.grid.columnX,
        len = cols.length,
        cmatch = false;
        for (len; colIndex < len; colIndex++) {
            colRight = cols[colIndex].x + cols[colIndex].w;
            if (xy[0] < colRight) {
                cmatch = true;
                break;
            }
        }
        if (!cmatch) {
            colIndex--;
        }
        var overPortlet, pos = 0,
        h = 0,
        match = false,
        overColumn = portal.items.getAt(colIndex),
        portlets = overColumn.items.items,
        overSelf = false;
        len = portlets.length;
        for (len; pos < len; pos++) {
            overPortlet = portlets[pos];
            h = overPortlet.el.getHeight();
            if (h === 0) {
                overSelf = true;
            } else if ((overPortlet.el.getY() + (h / 2)) > xy[1]) {
                match = true;
                break;
            }
        }
        pos = (match && overPortlet ? pos: overColumn.items.getCount()) + (overSelf ? -1 : 0);
        var overEvent = this.createEvent(dd, e, data, colIndex, overColumn, pos);
        if (portal.fireEvent('validatedrop', overEvent) !== false && portal.fireEvent('beforedragover', overEvent) !== false) {
            proxy.getProxy().setWidth('auto');
            if (overPortlet) {
                dd.panelProxy.moveProxy(overPortlet.el.dom.parentNode, match ? overPortlet.el.dom: null);
            } else {
                dd.panelProxy.moveProxy(overColumn.el.dom, null);
            }
            this.lastPos = {
                c: overColumn,
                col: colIndex,
                p: overSelf || (match && overPortlet) ? pos: false
            };
            this.scrollPos = portal.body.getScroll();
            portal.fireEvent('dragover', overEvent);
            return overEvent.status;
        } else {
            return overEvent.status;
        }
    },
    notifyOut: function() {
        delete this.grid;
    },
    notifyDrop: function(dd, e, data) {
        delete this.grid;
        if (!this.lastPos) {
            return;
        }
        var c = this.lastPos.c,
        col = this.lastPos.col,
        pos = this.lastPos.p,
        panel = dd.panel,
        dropEvent = this.createEvent(dd, e, data, col, c, pos !== false ? pos: c.items.getCount());
        Ext.suspendLayouts();
        if (this.portal.fireEvent('validatedrop', dropEvent) !== false && this.portal.fireEvent('beforedrop', dropEvent) !== false) {
            panel.el.dom.style.display = '';
            if (pos !== false) {
                c.insert(pos, panel);
            } else {
                c.add(panel);
            }
            dd.proxy.hide();
            this.portal.fireEvent('drop', dropEvent);
            var st = this.scrollPos.top;
            if (st) {
                var d = this.portal.body.dom;
                setTimeout(function() {
                    d.scrollTop = st;
                },
                10);
            }
        }
        Ext.resumeLayouts(true);
        delete this.lastPos;
        return true;
    },
    getGrid: function() {
        var box = this.portal.body.getBox();
        box.columnX = [];
        this.portal.items.each(function(c) {
            box.columnX.push({
                x: c.el.getX(),
                w: c.el.getWidth()
            });
        });
        return box;
    },
    unreg: function() {
        Ext.dd.ScrollManager.unregister(this.portal.body);
        Ext.app.PortalDropZone.superclass.unreg.call(this);
        delete this.portal.afterLayout;
    }
});
Ext.define('KitchenSink.AdvancedVType', {
    override: 'Ext.form.field.VTypes',

    daterange: function(val, field) {
        var date = field.parseDate(val);

        if (!date) {
            return false;
        }
        if (field.startDateField && (!this.dateRangeMax || (date.getTime() != this.dateRangeMax.getTime()))) {
            var start = field.up('form').down('#' + field.startDateField);
            start.setMaxValue(date);
            this.dateRangeMax = date;
        }
        else if (field.endDateField && (!this.dateRangeMin || (date.getTime() != this.dateRangeMin.getTime()))) {
            var end = field.up('form').down('#' + field.endDateField);
            end.setMinValue(date);
            this.dateRangeMin = date;
        }
        /*
         * Always return true since we're only using this vtype to set the
         * min/max allowed values (these are tested for after the vtype test)
         */
        return true;
    },

    daterangeText: '开始日期必须小于结束日期',

    monthrange: function(val, field) {
        var date = field.getValue();

        if (!date) {
            return false;
        }
        if (field.startDateField) {
            var start = field.up('form').down('#' + field.startDateField);
            var date1 = start.getValue();
            if (date < date1){
                return false;
            }
        }
        else if (field.endDateField) {
            var end = field.up('form').down('#' + field.endDateField);
            var date1 = end.getValue();
            if (date > date1){
                return false;
            }
        }
        return true;
    },
    monthrangeText: '开始日期必须小于结束日期',

    password: function(val, field) {
        if (field.initialPassField) {
            var pwd = field.up('form').down('#' + field.initialPassField);
            return (val == pwd.getValue());
        }
        return true;
    },

    passwordText: '密码不匹配'
});
Ext.define('Sv.form.combobox', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.svcombobox',
    emptyText:"--请选择--",
    editable:false,
    displayField:"propName",
    valueField:"propCode",
    queryMode:"local",
    isAll: false,
    isNull:false,
    svurl:Ext.actualUrl('/sys/propitem.json'),
    initComponent: function () {
        var me = this;
        me.callParent(arguments);

        var store = Ext.create('Ext.data.Store', {
            proxy: {
                type: 'ajax',
                url: me.svurl,
                extraParams:{propertiesCode:me.svkey},
                reader: { type: 'json' }
            },
            listeners:{
                load: function(mes, records, successful, operation, eOpts ) {
                    if(me.isAll && mes.getCount() >0){
                        var item = mes.getAt(0);
                        if(item && item.data.propName !== '全部'){
                            mes.insert(0,{propName:'全部', propCode:''});
                        }
                        if (me.isNull){
                            mes.insert(0,{propName:'', propCode:''});
                        }else{
                            me.setValue(item.data.propName)
                        }
                    }
                }
            }
        });

        me.setStore(store);
        store.load();
    }
});

Ext.define('Sv.Ext.QueryTree', {
    extend: 'Ext.tree.Panel',
    alias: 'widget.svquerytree',
    queryKey: "", //开窗查询Key值
    isAutoQuery: 2,//是否自动查询数据, 0不自动，2，显示时查询，3加载时查询
    isSearchtrigger: true,//是否启用刷选功能
    isMultiselect: false,//是否多选
    queryParams: {}, //默认查询参数
    sysQuery: null,  //查询信息
    rootVisible: false,
    checkPropagation: 'both',
    animate: false,useArrows: true,
    defaultChecked: false,
    initComponent: function () {
        var me = this;
        if(!me.sysQuery){
            var obj = Sv.requestPostNoAsync('/sys/query_info.json', {key: me.queryKey}, null, false);
            if(obj){ me.sysQuery = obj.query; }
        }
        if(!me.sysQuery){
            Ext.log.error(queryKey+"查询表格初始化失败！");
            return;
        }
        var columns = Ext.decode(me.sysQuery.sqColumns);
        me.columns = columns;
        me.callParent(arguments);

        me.setStore({
            autoLoad: me.isAutoQuery == 3,
            proxy: {
                url: Ext.actualUrl(me.sysQuery.sqDataRul),
                type: 'ajax',
                extraParams: me.queryParams
            },
            listeners:{
                load:function (store, records, successful, operation, node, eOpts) {
                    if(me.isMultiselect) {
                        node.cascade(function (node) {
                            node.set('checked', me.defaultChecked);
                        });
                    }
                    me.expandAll();
                }
            }
        });
    },
    listeners:{
        afterrender:function(me) {
            if (me.isAutoQuery == 2 && me.store.getCount() <= 1){
                //me.store.load();
                me.expandAll();
            }
        }
    },
    loadData:function (params) {
        var me = this;
        if(params){
            me.queryParams = params;
            me.store.proxy.extraParams = me.queryParams;
        }
        me.store.load();
    },
    clearSelections:function () {
        if(this.isMultiselect){
            var rootNode = this.getRootNode();
            if(rootNode){
                this.getView().setChecked(rootNode, this.defaultChecked, null);
            }
        }
        else{
            var selModel = this.getSelectionModel();
            if(selModel){
                selModel.deselectAll();
            }
        }
        this.expandAll();
    }
});

Ext.define('Sv.Ext.QueryGrid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.svquerygrid',
    queryKey: "", //开窗查询Key值
    isAutoQuery: 2,//是否自动查询数据, 0不自动，2，显示时查询，3加载时查询
    isSearchtrigger: true,//是否启用刷选功能
    isMultiselect: false,//是否多选
    queryParams: {}, //默认查询参数
    sysQuery: null,  //查询信息
    initComponent: function () {
        var me = this;
        if(me.isMultiselect){
            me.selModel = { type: 'checkboxmodel', checkOnly: true }
        }

        me.callParent(arguments);

        if(!me.sysQuery){
            var obj = Sv.requestPostNoAsync('/sys/query_info.json', {key: me.queryKey}, null, false);
            if(obj){ me.sysQuery = obj.query; }
        }
        if(!me.sysQuery){
            Ext.log.error(queryKey+"查询表格初始化失败！");
            return;
        }


        var columns = Ext.decode(me.sysQuery.sqColumns);
        if(me.isSearchtrigger){
            for(var i=0; i< columns.length; i++){
                columns[i].items = { xtype: 'searchtrigger', flex : 1, margin: 2 };
            }
        }
        me.setColumns(columns);

        me.setStore({
            autoLoad: me.isAutoQuery == 3,
            proxy: {
                url: Ext.actualUrl(me.sysQuery.sqDataRul),
                type: 'ajax',
                extraParams: me.queryParams,
                reader: { type: 'json' }
            }
        });
    },
    listeners:{
        afterrender:function(me) {
            if (me.isAutoQuery == 2 && me.store.getCount() <= 0){
                me.store.load();
            }
        }
    },
    loadData:function (params) {
        var me = this;
        if(params){
            me.queryParams = params;
            me.store.proxy.extraParams = me.queryParams;
        }
        me.store.load();
    },
    clearSelections:function () {
        var selModel = this.getSelectionModel();
        if(selModel){
            selModel.deselectAll();
        }
    }
});

Ext.define('Sv.Ext.QueryWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.svquerywin',
    autoShow: false, closeAction: 'hide', defaultButton: 'okButton',
    width: 600, height: 500, modal: true, layout: 'fit',
    queryKey: "", //开窗查询Key值
    isAutoQuery: 2,//是否自动查询数据, 0不自动，2，显示时查询，3加载时查询
    isSearchtrigger: true,//是否启用刷选功能
    isMultiselect: false,//是否多选
    checkPropagation: 'both', //树状多选方式
    queryParams: {}, //默认查询参数
    sysQuery: null,  //查询信息
    items: [ ],
    mygrid: null,
    initComponent: function () {
        var me = this;
        me.callParent(arguments);

        if(!me.sysQuery){
            var obj = Sv.requestPostNoAsync('/sys/query_info.json', {key: me.queryKey}, null, false);
            if(obj){ me.sysQuery = obj.query; }
        }
        if(!me.sysQuery){
            Ext.log.error(queryKey+"查询表格初始化失败！");
            return;
        }

        if(!me.getTitle()){
            me.setTitle(me.sysQuery.sqName);
        }
        var createQuery = "Sv.Ext.QueryGrid";
        if(me.sysQuery.sqIsTree){
            createQuery = "Sv.Ext.QueryTree";
        }

        me.mygrid = Ext.create(createQuery, {
            sysQuery: me.sysQuery,
            isAutoQuery: me.isAutoQuery,
            isSearchtrigger: me.isSearchtrigger,
            isMultiselect: me.isMultiselect,
            checkPropagation: me.checkPropagation,
            queryParams: me.queryParams,
            listeners: {
                celldblclick: function(me, td, cellIndex, record, tr, rowIndex, e, eOpts ){
                    var datas=[record.data];
                    var win = me.up('window');
                    if(win){
                        win.fireEvent('selectok', win, me, datas);
                        win.hide();
                    }
                }
            }
        });

        me.add(me.mygrid);

    },
    buttons: [
        {
            text: "刷新", handler: function (item, e) {
                var me = this.up('window');
                if(me.mygrid){
                    me.mygrid.loadData(me.queryParams);
                }
            }
        },
        {
            reference: 'okButton', text: '确认',
            handler: function() {
                var me = this.up('window');
                if(me.mygrid) {
                    var rows = [];
                    if(me.sysQuery.sqIsTree && me.isMultiselect){
                        rows = me.mygrid.getChecked();
                    }
                    else{
                        rows = me.mygrid.getSelection();
                    }
                    var datas=[];
                    for(var i=0; i<rows.length; i++){
                        if(me.sysQuery.sqIsTree){
                            if(rows[i].isRoot()){
                                continue;
                            }
                        }
                        datas.push(rows[i].data);
                    }
                    me.fireEvent('selectok', me, me.mygrid, datas);
                    me.mygrid.loadData(me.queryParams);
                    me.hide();
                }
            }
        },
        { text: "取消", handler: function (item, e) {
            var me = this.up('window');
            if(me.mygrid){
                me.mygrid.loadData(me.queryParams);
            }
            this.up('window').hide(); } }
    ],
    loadData:function (params) {
        var me = this;
        if(me.mygrid){
            me.mygrid.loadData(params);
        }
    },
    clearSelections:function () {
        var me = this;
        if(me.mygrid){
            me.mygrid.clearSelections();
        }
    }
});

Ext.define('Sv.Ext.QueryText', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.svtrigger',
    myTitle: null, //自定义标题
    queryKey: "", //开窗查询Key值
    isAutoQuery: 2,//是否自动查询数据, 0不自动，2，显示时查询，3加载时查询
    isSearchtrigger: true,//是否启用刷选功能
    isMultiselect: false,//是否多选
    checkPropagation: 'both', //树状多选方式
    queryParams: {}, //默认查询参数
    sysQuery: null,  //查询信息
    winWidth: 600, winHeight: 500,
    editable:false,
    queryWin: {},
    initComponent: function () {
        var me = this;

        if(!me.sysQuery){
            var obj = Sv.requestPostNoAsync('/sys/query_info.json', {key: me.queryKey}, null, false);
            if(obj){ me.sysQuery = obj.query; }
        }

        me.displayField=me.sysQuery.sqDisplayField;
        me.valueField=me.sysQuery.sqValueField;
        me.callParent(arguments);

        if(!me.sysQuery){
            Ext.log.error(queryKey+"查询表格初始化失败！");
            return;
        }


        me.queryWin = Ext.create("Sv.Ext.QueryWindow", {
            title: me.myTitle,
            queryKey: me.queryKey,
            isAutoQuery: me.isAutoQuery,
            isSearchtrigger: me.isSearchtrigger,
            isMultiselect: me.isMultiselect,
            checkPropagation: me.checkPropagation,
            queryParams: me.queryParams,
            sysQuery: me.sysQuery,
            width: me.winWidth, height: me.winHeight,
            listeners: {
                selectok: function (win, grid, datas) {
                    me.setValue(datas);
                    me.fireEvent('selectok', win, grid, datas);
                }
            }
        });
    },
    triggers: {
        clear:{
            cls: Ext.baseCSSPrefix + 'form-clear-trigger',
            handler: function() {
                this.setValue();
            }
        },
        picker: {
            cls: Ext.baseCSSPrefix + 'form-search-trigger',
            handler: function() {
                this.queryWin.clearSelections();
                this.queryWin.show();
            }
        }
    },
    getSubmitValue: function() {
        this.callParent();
        var me = this;
        if(me.isMultiselect){
            var value = [];
            if(Ext.isIterable(me.myvalue)){
                for(var i=0; i< me.myvalue.length; i++){
                    value.push(me.myvalue[i]);//{value: me.myvalue[i][me.valueField], display:me.myvalue[i][me.displayField]});
                }
            }
            return value;
        }
        else{
            if(Ext.isIterable(me.myvalue) && me.myvalue.length > 0){
                return me.myvalue[0]; //{value: me.myvalue[0][me.valueField], display:me.myvalue[0][me.displayField]};
            }
            else if(Ext.isObject(me.myvalue)){
                return me.myvalue;
            }
        }
        return null;
    },
    setValue: function (value) {
        var me = this;
        me.myvalue = null;
        if(Ext.isString(value) && value.length > 0){
            //通过valueField查找
            Ext.Ajax.request({
                url: Ext.actualUrl(me.sysQuery.sqDataRul),
                method: 'POST',
                params: {valueField : value} ,
                async: false,
                success:function(response) {
                    var obj = Ext.decode(response.responseText);
                    if (Ext.isIterable(obj)){

                        me.myvalue = obj;
                    }
                }
            });
        }
        else{
            me.myvalue = value;
        }
        var text='';
        if(Ext.isIterable(me.myvalue)){
            for(var i=0; i< me.myvalue.length; i++) {
                if(i!=0){
                    text += ',';
                }
                text += me.myvalue[i][me.displayField];
            }
        }
        this.callParent([text]);
        return me.myvalue;
    },
    getValue: function () {
        var me = this,
            valStr="";
        if(Ext.isIterable(me.myvalue)){
            for (var i = 0; i < me.myvalue.length; i++) {
                if(i>0){valStr += ",";}
                valStr += me.myvalue[i][me.valueField];//{value: me.myvalue[i][me.valueField], display:me.myvalue[i][me.displayField]});
            }
        }
        else if(Ext.isObject(me.myvalue)){
            valStr = me.myvalue[me.valueField];
        }
        me.value = valStr;
        return valStr;
    }
});

/** 获取单值 */
Ext.define('Sv.Ext.QueryTextValue', {
    extend: 'Sv.Ext.QueryText',
    alias: 'widget.svtriggervalue',
    getSubmitValue: function () {
        this.callParent();
        var me = this;
        if (me.isMultiselect) {
            var value = "";
            if (Ext.isIterable(me.myvalue)) {
                for (var i = 0; i < me.myvalue.length; i++) {
                    if (i > 0) { value += ","; }
                    value += me.myvalue[i][me.valueField];//{value: me.myvalue[i][me.valueField], display:me.myvalue[i][me.displayField]});
                }
            }
            return value;
        }
        else {
            if (Ext.isIterable(me.myvalue) && me.myvalue.length > 0) {
                return me.myvalue[0][me.valueField]; //{value: me.myvalue[0][me.valueField], display:me.myvalue[0][me.displayField]};
            }
        }
        return null;
    }
});

Ext.define('Sv.Ext.QueryButton', {
    extend: 'Ext.button.Button',
    alias: 'widget.svquerybutton',
    myTitle: null, //自定义标题
    queryKey: "", //开窗查询Key值
    isAutoQuery: 2,//是否自动查询数据, 0不自动，2，显示时查询，3加载时查询
    isSearchtrigger: true,//是否启用刷选功能
    isMultiselect: false,//是否多选
    checkPropagation: 'both', //树状多选方式
    queryParams: {}, //默认查询参数editable:false,
    sysQuery: null,  //查询信息
    winWidth: 600, winHeight: 500,
    queryWin: null,
    initComponent: function () {
        var me = this;
        me.callParent(arguments);

        if(!me.sysQuery){
            var obj = Sv.requestPostNoAsync('/sys/query_info.json', {key: me.queryKey}, null, false);
            if(obj){ me.sysQuery = obj.query; }
        }
        if(!me.sysQuery){
            Ext.log.error(queryKey+"查询表格初始化失败！");
            return;
        }

        me.displayField=me.sysQuery.sqDisplayField;
        me.valueField=me.sysQuery.sqValueField;

        me.queryWin = Ext.create("Sv.Ext.QueryWindow", {
            queryKey: me.queryKey,
            title: me.myTitle,
            isAutoQuery: me.isAutoQuery,
            isSearchtrigger: me.isSearchtrigger,
            isMultiselect: me.isMultiselect,
            checkPropagation: me.checkPropagation,
            queryParams: me.queryParams,
            sysQuery: me.sysQuery,
            width: me.winWidth,
            height: me.winHeight,
            listeners: {
                selectok: function (win, grid, datas) {
                    me.fireEvent('selectok', me, win, grid, datas);
                }
            }
        });
    },
    handler: function () {
        this.queryWin.clearSelections();
        this.queryWin.show();
    },
    loadData:function (params) {
        if(this.queryWin){
            this.queryWin.loadData(params);
        }
    }
});
Ext.define('Sv.Ext.form.field.Month', {
    extend: 'Ext.form.field.Date',
    alias: 'widget.monthfield',
    requires: ['Ext.picker.Month'],
    alternateClassName: ['Ext.form.MonthField', 'Ext.form.Month'],
    selectMonth: null,
    format: "Y-m",
    createPicker: function () {
        var me = this,
            format = Ext.String.format,
            pickerConfig;
        pickerConfig = {
            pickerField: me,
            ownerCmp: me,
            renderTo: document.body,
            floating: true,
            hidden: true,
            focusOnShow: true,
            minDate: me.minValue,
            maxDate: me.maxValue,
            disabledDatesRE: me.disabledDatesRE,
            disabledDatesText: me.disabledDatesText,
            disabledDays: me.disabledDays,
            disabledDaysText: me.disabledDaysText,
            format: me.format,
            showToday: me.showToday,
            startDay: me.startDay,
            minText: format(me.minText, me.formatDate(me.minValue)),
            maxText: format(me.maxText, me.formatDate(me.maxValue)),
            listeners: {
                select: { scope: me, fn: me.onSelect },
                monthdblclick: { scope: me, fn: me.onOKClick },
                yeardblclick: { scope: me, fn: me.onOKClick },
                OkClick: { scope: me, fn: me.onOKClick },
                CancelClick: { scope: me, fn: me.onCancelClick }
            },
            keyNavConfig: {
                esc: function () {
                    me.collapse();
                }
            }
        };
        if (Ext.isChrome) {
            me.originalCollapse = me.collapse;
            pickerConfig.listeners.boxready = {
                fn: function () {
                    this.picker.el.on({
                        mousedown: function () {
                            this.collapse = Ext.emptyFn;
                        },
                        mouseup: function () {
                            this.collapse = this.originalCollapse;
                        },
                        scope: this
                    });
                },
                scope: me,
                single: true
            }
        }
        return Ext.create('Ext.picker.Month', pickerConfig);
    },
    onCancelClick: function () {
        var me = this;
        me.selectMonth = null;
        me.collapse();
    },
    onOKClick: function () {
        var me = this;
        if (me.selectMonth) {
            me.setValue(me.selectMonth);
            me.fireEvent('select', me, me.selectMonth);
        }
        else if(me.getPicker()){
            me.onSelect(me.getPicker(), me.getPicker().getValue());
            me.setValue(me.selectMonth);
            me.fireEvent('select', me, me.selectMonth);
        }
        me.collapse();
    },
    onSelect: function (m, d) {
        var me = this;
        me.selectMonth = new Date((d[0] + 1) + '/1/' + d[1]);
    }
});
Ext.define('Sv.activiti.Toolbar', {
    extend: 'Ext.toolbar.Toolbar',
    alias: 'widget.toolbarActiviti',
    formSave: function () { return ''; }, //保存函数重写,需要返回业务ID值。
    formClose: function () { return false; }, //关闭函数重写
    formIsValid: function () { return true; }, //完成时验证是否有效
    formCode: '', //表单ID
    workformRun: null, //流程信息
    queryWin: null,
    imgWin: null,
    parentLoadMask: null,
    opinions: [], //常用意见
    init: function (form) {
        if(!form) return;
        var me = this;
        var formValue = form.getValues();
        var buttons=[];
        var isSave = false;
        me.parentLoadMask = me.up().up();
        if(formValue && formValue.procInstId && me.workformRun) {
            //工作流相关权限
            isSave = me.setFieldsReadOnly(form, Ext.decode(me.workformRun.permission)); //允许
            if(Ext.isObject(me.workformRun.permission) && me.workformRun.permission.hasOwnProperty('all')){
                if(me.workformRun.permission["all"] === 0){
                    isSave = true;
                }
            }

            if(formValue.state && (formValue.state == 8 || formValue.state ==9)){
                //最终状态
                me.setFieldsReadOnly(form, 2); //只读
                isSave = false;
            }

            if(!me.imgWin){
                me.imgWin = Ext.create("Ext.window.Window", {
                    autoShow: false, closeAction: 'hide', title: '流程跟踪',
                    tbar: [{
                        text: "关闭", iconCls:'icon-cross',
                        handler: function(me) { var imgwin = me.up("window"); if(imgwin != null){ imgwin.hide(); } }
                    }],
                    resizable: false, maximized: true,modal: true, scrollable: true, bodyPadding:10,
                    items: [
                        {
                            xtype: 'label',
                            html: '<div style="font-size:25px;">流程图:<br /></div>',
                            margin: '0 0 0 10'
                        },
                        {xtype: 'image', src: Ext.actualUrl('/activiti/' + formValue.procInstId + '/processTracking.png')},
                        {
                            xtype: 'label',
                            html: '<div style="font-size:25px;"><br />意见:<br /></div>',
                            margin: '0 5 5 10'
                        },
                        {xtype: 'grid', width: 1000, animate: false, margin:'5 5 5 10', frame: true, store: {
                            type: 'store', autoLoad: true,
                            proxy: {type: 'ajax', url: Ext.actualUrl('/activiti/task_opinion.json'), autoLoad: true,
                                extraParams: {procInstId: formValue.procInstId}}},
                            columns: [
                                {text: '流程节点', width: 100, dataIndex: 'name', menuDisabled: true, sortable:false},
                                {text: '姓名', width: 100, dataIndex: 'userDisplayName', menuDisabled: true, sortable:false},
                                {text: '时间', width: 160, dataIndex: 'createTime',menuDisabled: true,sortable:false
                                    /*renderer: Ext.util.Format.dateRenderer('Y-m-d H:i:s')*/},
                                {text: '意见', flex: 1, dataIndex: 'text', menuDisabled: true, sortable:false}]}
                    ]
                });
            }

            if(Ext.isIterable(me.workformRun.branchesList)) {
                //获取个人常用意见
                var value = Sv.requestPostNoAsyncParams('/activiti/opinion/values.data',null);
                if(value && value.data){
                    for(var i=0; i< value.data.length; ++i){
                        me.opinions.push({ text: value.data[i]});
                    }
                }

                me.queryWin = Ext.create("Ext.window.Window", {
                    autoShow: false, closeAction: 'hide', defaultButton: 'okButton', title: '任务提交处理',
                    width: 600, height: 600, modal: true,  layout: { type: 'vbox', align: 'stretch' },
                    //trigger: me, id: me.id + "queryWin",
                    taskId: me.workformRun.taskId, bodyPadding: 5,
                    items: [
                        {
                            xtype: 'fieldset', itemId: 'fdseluser',
                            baseCls:'x-fieldset{background-color: transparent; }',
                            title: '审批', flex: 1, padding: 5,layout: 'fit',
                            items: [
                                {
                                    xtype: 'treepanel', selModel: { type: 'checkboxmodel' },
                                    rootVisible: false,
                                    checkPropagation: 'both',
                                    store: {
                                        storeId: "TSStore",autoLoad: false,
                                        proxy: {
                                            type: 'ajax',
                                            url: Ext.actualUrl('/activiti/task_users.json')
                                        }
                                    },
                                    columns: [
                                        { text: '名称',dataIndex: 'name',flex: 1, xtype: 'treecolumn', sortable: true },
                                        { text: '账号 ',dataIndex: 'userName',flex: 1}
                                    ]
                                }
                            ]

                        },
                        {
                            xtype: 'fieldset',
                            baseCls:'x-fieldset{background-color: transparent; }',
                            title: '意见', height: 160, padding: 5,layout: 'fit',
                            items: [
                                {
                                    xtype: 'form', layout: 'fit', flex: 1, padding: "0 5 0 5",
                                    items: [ { itemId: 'tafOpinion', xtype: 'textareafield', name: 'opinion' } ],
                                    tbar: {
                                        reference: 'tbar', padding: "0 0 3 0",
                                        items:[
                                            {
                                                itemId:'cyyj', xtype: 'splitbutton', text: '常用意见',
                                                menu: {
                                                    items: me.opinions,
                                                    listeners: {
                                                        click: function (menu, item, e, eOpts) {
                                                            var form = this.up('form');
                                                            var tafOpinion = form.down('#tafOpinion');
                                                            // this == the button, as we are in the local scope
                                                            tafOpinion.setValue(item.text);
                                                        }
                                                    }
                                                }
                                            },
                                            {
                                                xtype: 'button', text: '保存为常用意见',
                                                handler: function() {
                                                    var form = this.up('form');
                                                    var tafOpinion = form.down('#tafOpinion');
                                                    if(tafOpinion.getValue().length > 1){
                                                        var value = Sv.requestPostNoAsyncParams('/activiti/opinion/add.data',{opinion:tafOpinion.getValue()});
                                                        if(value && value.status===2){
                                                            var cyyj = form.down('#cyyj');
                                                            cyyj.menu.add({text: tafOpinion.getValue()});
                                                        }
                                                        Ext.toast({  html: '保存成功!', slideInDuration: 400, minWidth: 400 });
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                }
                            ]

                        }
                    ],
                    buttons: [
                        {
                            reference: 'okButton', text: '确认',
                            handler: function() {
                                var me = this.up('window');
                                if(me.data.inputDataItem || me.data.assignee){
                                    //选择审批人
                                    var grid = me.down('treepanel');
                                    var datas = grid.getSelection();
                                    if(!datas || datas.length <= 0){
                                        var fdseluser = me.down('#fdseluser');
                                        Ext.MessageBox.alert("提示信息", "请选择"+fdseluser.title);
                                        return;
                                    }
                                    me.data.assigneeList = [];
                                    for(var i=0; i< datas.length; i++){
                                        if(datas[i].data.type == 1){
                                            me.data.assigneeList.push(datas[i].data.userName);
                                        }
                                    }
                                    if(me.data.assigneeList.length <= 0){
                                        var fdseluser = me.down('#fdseluser');
                                        Ext.MessageBox.alert("提示信息", "请选择"+fdseluser.title);
                                        return;
                                    }
                                }
                                var tafOpinion = me.down('#tafOpinion');
                                me.data.opinion = tafOpinion.getValue();
                                if(!me.data.opinion || me.data.opinion.length < 2){
                                    Ext.MessageBox.alert("提示信息", "意见必须大于等于2个字。");
                                    return;
                                }
                                var rvalue = Sv.requestPostNoAsync('/activiti/apply/completeTask.data',
                                    {taskId: me.taskId}, me.data);
                                if(rvalue){
                                    //刷新当前页面
                                    location.reload();
                                }
                                me.hide();
                            }
                        },
                        { text: "取消", handler: function (item, e) { this.up('window').hide(); } }
                    ]
                });

                for(var i=0; i< me.workformRun.branchesList.length; i++){
                    buttons.push({
                        text: me.workformRun.branchesList[i].name,
                        data: me.workformRun.branchesList[i],
                        iconCls: 'icon-bullet_go',
                        queryWin : me.queryWin,
                        save: isSave,
                        handler: function(me) {
                            var tb = me.up("toolbarActiviti");
                            if(!tb) return;
                            if (!tb.formIsValid()){ return; }
                            if(me.save){
                                var businessKey = tb.formSave();
                                if(!businessKey){
                                    return;
                                }
                                if(Ext.isObject(businessKey)){
                                    me.config.data.remark = businessKey.remark;
                                }
                            }
                            var queryWin = me.config.queryWin;
                            var fdseluser = queryWin.down('#fdseluser');

                            queryWin.data = me.config.data;
                            queryWin.setTitle('提交"'+me.config.data.name+'"处理')
                            fdseluser.setTitle(me.config.data.name + '-人员');

                            if(me.config.data.inputDataItem || me.config.data.assignee){
                                //弹出选人框
                                fdseluser.show();
                                var grid = queryWin.down('treepanel');
                                if(!me.config.data.inputDataItem){
                                    //单选
                                    grid.getSelectionModel().setSelectionMode("SINGLE");
                                }
                                else {
                                    grid.getSelectionModel().setSelectionMode("MULTI");
                                }
                                grid.store.proxy.setExtraParams({candidateGroups: Ext.encode(me.config.data.candidateGroups)});
                                grid.store.load();
                                grid.expandAll();
                                me.config.queryWin.setHeight(600);
                            }
                            else{
                                fdseluser.hide();
                                me.config.queryWin.setHeight(270);
                            }
                            queryWin.show();

                        }
                    });
                }
            }
        }
        if(!formValue || !formValue.state || formValue.state == 0){
            buttons.push({
                itemId: 'saveSubmit',
                text: '保存并启动流程',
                iconCls: 'icon-disk_submit',
                loadingState: "启动中...",
                handler: function(me) {
                    var tb = me.up("toolbarActiviti");
                    if(tb != null){
                        if(tb.parentLoadMask) { tb.parentLoadMask.setLoading("保存并启动流程中......", true); }
                        Ext.defer(function () {
                            //保存表单
                            var businessKey = tb.formSave();
                            if(!businessKey){
                                if(tb.parentLoadMask) { tb.parentLoadMask.setLoading(false);}
                                return;
                            }
                            var value={};
                            if(Ext.isString(businessKey)){
                                value.fguid = businessKey;
                                value.remark='';
                            }
                            else if(Ext.isObject(businessKey)){
                                value = businessKey;
                            }
                            //启动工作流
                            var rvalue = Sv.requestPostNoAsyncParams('/activiti/apply/start.data',
                                {formCode: tb.formCode, businessKey: value.fguid, remark: value.remark});
                            if(rvalue){
                                //刷新当前页面
                                var url = location.pathname + '?mode=edit&fguid=' + value.fguid;
                                location = url;
                            }
                            if(tb.parentLoadMask) { tb.parentLoadMask.setLoading(false);}
                        },1, this);

                    }
                }
            });
            me.setFieldsReadOnly(form, 0); //允许
            isSave = true;
        }
        if(isSave){

            buttons.push({
                text: '保存', iconCls:'icon-disk',
                handler: function(me) {
                    var tb = me.up("toolbarActiviti");
                    if(tb != null){
                        if(tb.parentLoadMask) { tb.parentLoadMask.setLoading("保存中......", true); }
                        Ext.defer(function () {
                            if(tb.formSave()){
                                Ext.toast({  html: '保存成功!', slideInDuration: 400, minWidth: 400 });
                            }
                            if(tb.parentLoadMask) { tb.parentLoadMask.setLoading(false);}
                        },1, this);
                    }
                }
            });
        }
        if(formValue && formValue.procInstId){
            buttons.push({
                text: '查看流程', iconCls:'icon-zoom',
                handler: function(me) {
                    var tb = me.up("toolbarActiviti");
                    tb.imgWin.show();
                }
            });
        }
        buttons.push({
            text: "关闭", iconCls:'icon-cross',
            handler: function(me) {
                var tb = me.up("toolbarActiviti");
                if(tb != null){
                    if(!tb.formClose()){
                        if(window.target && window.target.hide){
                            window.target.hide();
                        }
                        else{
                            window.location.href="about:blank";
                            window.close();
                        }
                    }
                }
            }
        });
        me.removeAll();
        me.add(buttons);
    },
    /** 设置表单权限 */
    setFieldsReadOnly : function (form, readOnly) {
        var fields = form.getFields().items;
        var fLen = fields.length;
        if(!readOnly) return;
        var roMap = null;
        var isRun = false;
        if(Ext.isObject(readOnly) && !readOnly.hasOwnProperty('all')) {
            for (f = 0; f < fLen; f++) {
                field = fields[f];
                if(field instanceof  Ext.form.field.Hidden) { continue; }
                if(readOnly.hasOwnProperty(field.name)){
                    if(readOnly[field.name] == 0) { //允许
                        field.show();
                        field.setReadOnly(false);
                        field.setDisabled(false);
                        isRun = true;
                    }
                    else if(readOnly[field.name] == 1) { //隐藏
                        field.hide();
                    }
                    else if(readOnly[field.name] == 2) { //只读
                        field.show();
                        field.setReadOnly(true);
                        field.setDisabled(false);
                    }
                    else if(readOnly[field.name] == 3) { //禁用
                        field.show();
                        field.setDisabled(true);
                    }
                }
            };
        }
        else{
            var ro=readOnly;
            if(Ext.isObject(readOnly) && readOnly.hasOwnProperty('all')){
                ro = readOnly['all']
            }
            for (f = 0; f < fLen; f++) {
                field = fields[f];
                if(field instanceof  Ext.form.field.Hidden) { continue; }
                if(ro == 0) { //允许
                    field.show();
                    field.setReadOnly(false);
                    field.setDisabled(false);
                    isRun = true;
                }
                else if(ro == 1) { //隐藏
                    field.hide();
                }
                else if(ro == 2) { //只读
                    field.show();
                    field.setReadOnly(true);
                    field.setDisabled(false);
                }
                else if(ro == 3) { //禁用
                    field.show();
                    field.setDisabled(true);
                }
            }
        }
        return isRun;
    }
});
Ext.define('Sv.fileUpload', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.svfileUpload',
    frame: true,
    bodyPadding: 5,
    parentTableId: '', //表名称
    attachType:'', //附件自定义类型,
    readOnly: false,
    tableGuid:'',
    items:[],
    delGuids:[],
    newInsert:[],
    initComponent: function () {
        var me = this;
        me.callParent(arguments);
        me.setReadOnly(me.readOnly);
    },
    tbar: {
        readOnlyHide: true,
        items: [
            {
                xtype:'fileuploadfield',
                buttonOnly: true,
                hideLabel: true,
                buttonText: '添加附件',
                width: 80,
                listeners:{
                    change: function (me) {
                        var file = me.fileInputEl.dom.files[0];
                        var panel = this.up('panel');

                        var fileUpdate = {
                            xtype: 'container', layout: 'hbox', margin: '0 0 5 0',
                            bodyPadding: 5, height: 32, style: "background-color: #f1f1f1;",

                            items:[
                                {xtype: 'hiddenfield', name: 'saGuid'},
                                {xtype: 'label', flex:1, margin: '5 5 0 5', text: file.name},
                                {xtype: 'progressbar', text: '...', width:150, height: 24, margin: '4 5 0 0', file: file,
                                    listeners:{
                                        afterrender: function (mep) {
                                            var xhr = new XMLHttpRequest();
                                            var delButton = mep.nextSibling('button');
                                            var saGuid = mep.previousSibling('[name=saGuid]');
                                            var label = mep.previousSibling('label');
                                            //监听事件
                                            xhr.upload.addEventListener("progress",
                                                function(evt){
                                                    var percentComplete = Math.round((evt.loaded) * 100 / evt.total);
                                                    mep.updateProgress(percentComplete/100, percentComplete + "%");
                                                },
                                                false);
                                            //xhr.upload.addEventListener("load", function(evt){ console.log("成功！"); }, false);
                                            xhr.upload.addEventListener("error", function(evt){ console.log("错误！"); mep.hide(); delButton.show(); }, false);
                                            xhr.upload.addEventListener("abort", function(evt){ console.log("中断！"); mep.hide(); delButton.show(); }, false);
                                            //发送文件和表单自定义参数
                                            xhr.open("POST", Ext.actualUrl('/sys/upload_attachment.data'),true);
                                            var fd =new FormData();
                                            fd.append('file', mep.file);
                                            fd.append('parentTableId', panel.parentTableId);
                                            fd.append('attachType', panel.attachType);
                                            fd.append('tableGuid', panel.tableGuid);
                                            xhr.onreadystatechange = function(e) {
                                                if (this.readyState == 4 && this.status == 200) {
                                                    var obj = Ext.decode(this.responseText);
                                                    if(obj){
                                                        saGuid.setValue(obj.saGuid);
                                                        if(panel.tableGuid.length < 1){
                                                            panel.newInsert.push(obj.saGuid);
                                                        }
                                                        var alink = "<a href='" + Ext.actualUrl('/sys/attachment_down.html?id='+ obj.saGuid ) + "'>" + mep.file.name + "</a>";
                                                        label.setHtml(alink);
                                                    }
                                                    mep.hide(); delButton.show();
                                                }
                                            };
                                            xhr.send(fd);
                                        }
                                    }
                                },
                                {xtype: 'button', icon: Ext.actualUrl('/ico/drop-no.png'),width:40, hidden: true, readOnlyHide: true,tooltip: '删除',
                                    style: "border-color: transparent !important;background: transparent !important;",
                                    handler: function (){
                                        var saGuid = this.previousSibling('[name=saGuid]');
                                        var meCont = this.up('container');
                                        panel.delGuids.push(saGuid.getValue());
                                        var index = panel.newInsert.indexOf(saGuid.getValue());
                                        if (index > -1) {
                                            panel.newInsert.splice(index, 1);
                                        }
                                        panel.remove(meCont);
                                    }
                                }
                            ]
                        };

                        panel.add(fileUpdate);
                    }
                }
            }
        ]
    },
    setValue:function (tableGuid){
        loadFiles(tableGuid);
    },
    setReadOnly:function (readOnly) {
        //关闭表格编辑状态
        var di = this.query("*[readOnlyHide=true]")
        if(Ext.isIterable(di)){
            for(var i=0; i< di.length; ++i){
                if(readOnly){di[i].hide();}
                else {di[i].show();}
            }
        }
    },
    saveFiles:function (tableGuid) {
        this.tableGuid = tableGuid;
        //处理删除
        if(Ext.isIterable(this.delGuids) && this.delGuids.length > 0){
            var obj = Sv.requestPostNoAsyncJsonData('/sys/attachment_delete.data', this.delGuids);
        }
        //处理新插入
        if(Ext.isIterable(this.newInsert) && this.newInsert.length > 0) {
            var sysAttachments = [];
            for (var i = 0; i < this.newInsert.length; ++i) {
                sysAttachments.push({saGuid: this.newInsert[i], parentTableGuid: tableGuid});
            }
            var obj = Sv.requestPostNoAsyncJsonData('/sys/attachment_update.data', sysAttachments);
            this.newInsert=[];
        }
    },
    loadFiles:function (tableGuid) {
        var panel = this;
        panel.tableGuid = tableGuid;
        var obj = Sv.requestPostNoAsyncParams('/sys/attachment.json', {parentTableId: panel.parentTableId, parentTableGuid: tableGuid, attachType: panel.attachType});
        if(obj){
            this.newInsert=[];
            this.delGuids=[];
            if(Ext.isIterable(obj.data)) {
                panel.removeAll();
                for(var i=0; i< obj.data.length; ++i){
                    var alink = "<a href='" + Ext.actualUrl('/sys/attachment_down.html?id='+ obj.data[i].saGuid ) + "'>" + obj.data[i].attachName + "</a>";
                    var fileUpdate = {
                        xtype: 'container', layout: 'hbox', margin: '0 0 5 0',
                        bodyPadding: 5, height: 32, style: "background-color: #f1f1f1;",
                        items:[
                            {xtype: 'hiddenfield', name: 'saGuid', value: obj.data[i].saGuid },
                            {xtype: 'label', flex:1, margin: '5 5 0 5', html: alink },
                            {xtype: 'button', icon: Ext.actualUrl('/ico/drop-no.png'),width:40,readOnlyHide: true, tooltip: '删除', hidden: panel.readOnly,
                                style: "border-color: transparent !important;background: transparent !important;",
                                handler: function (){
                                    var saGuid = this.previousSibling('[name=saGuid]');
                                    var meCont = this.up('container');
                                    panel.delGuids.push(saGuid.getValue());
                                    var index = panel.newInsert.indexOf(saGuid.getValue());
                                    if (index > -1) {
                                        panel.newInsert.splice(index, 1);
                                    }
                                    panel.remove(meCont);
                                }
                            }
                        ]
                    };

                    panel.add(fileUpdate);
                }
            }
        }
    }
});