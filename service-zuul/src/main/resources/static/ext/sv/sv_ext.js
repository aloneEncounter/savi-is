/**
 * 针对一些ext常规扩展
 * Created by wz on 2018/5/11.
 */
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