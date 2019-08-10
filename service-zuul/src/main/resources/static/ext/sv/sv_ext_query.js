/**
 * Created by wz on 2018/3/29.
 */

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