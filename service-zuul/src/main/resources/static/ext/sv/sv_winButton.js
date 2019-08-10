/**
 * Created by zzp on 2018/4/18.
 */
Ext.define('Sv.Ext.approveButton', {
    extend: 'Ext.button.Button',
    alias: 'widget.svwindow',
    queryKey: "", //开窗查询Key值
    isAutoQuery: 2,//是否自动查询数据, 0不自动，2，显示时查询，3加载时查询
    isSearchtrigger: true,//是否启用刷选功能
    isMultiselect: true,//是否多选
    isPaging: false,//是否启用分页
    pagingSize: 30,//分页每页大小
    queryParams: {}, //默认查询参数
    editable:false,
    queryWin: {},
    handlerdata : function (data) { },
    initComponent: function () {
        var me = this;
        me.callParent(arguments);

        me.queryWin = Ext.create("Ext.window.Window", {
            autoShow: false, closeAction: 'hide', defaultButton: 'okButton',
            width: 600, height: 500, modal: true, layout: 'fit',
            trigger: me, id: me.id + "queryWin",
            buttons: [
                { text: "查询", handler: function (item, e) {
                    var grid = this.up('window').child('grid');
                    grid.store.load();
                } },
                {
                    reference: 'okButton', text: '确认',
                    handler: function() {
                        var grid = this.up('window').child('grid');
                        var rows = grid.getSelection();
                        var trigger = this.up('window').trigger;
                        var datas=[];
                        for(var i=0; i<rows.length; i++){
                            datas.push(rows[i].data);
                        }
                        trigger.handlerdata(datas);
                        this.up('window').hide();
                    }
                },
                { text: "取消", handler: function (item, e) { this.up('window').hide(); } }
            ],
            items: [ ],
            listeners:{}
        });
        if(me.isAutoQuery == 2){
            me.queryWin.on({
                show: function (me, eOpts) {
                    var grid = me.child('grid');
                    grid.store.load();
                }
            });
        }


        Ext.Ajax.request({
            url: Ext.actualUrl('/sys/query_info.json'),
            params: {key: me.queryKey},
            method: 'POST',
            async: false,
            parent: me,
            success: function (response, me) {
                var obj = Ext.decode(response.responseText);
                if (obj.success) {
                    me.parent.queryWin.setTitle(obj.query.sqName);
                    me.parent.displayField=obj.query.sqDisplayField;
                    me.parent.valueField=obj.query.sqValueField;

                    var column = Ext.decode(obj.query.sqColumns);

                    var store = {
                        autoLoad: me.parent.isAutoQuery == 3,
                        proxy: {
                            url: Ext.actualUrl(obj.query.sqDataRul),
                            type: 'ajax',
                            extraParams: me.parent.queryParams,
                            reader: { type: 'json' }
                        }
                    };
                    var pt;
                    if(me.parent.isPaging){
                        pt = { xtype: "pagingtoolbar", displayInfo: true };
                        store.pageSize=me.parent.pagingSize;
                    }
                    if(me.parent.isSearchtrigger){
                        for(var i=0; i< column.length; i++){
                            column[i].items = { xtype: 'searchtrigger', flex : 1, margin: 2 };
                        }
                    }
                    var sm;
                    if(me.parent.isMultiselect){
                        sm = { type: 'checkboxmodel', checkOnly: true }
                    }

                    var grid = new Ext.grid.Panel({
                        store:store,
                        columns:column,
                        bbar: pt,
                        selModel: sm,
                        listeners: {
                            celldblclick: function(me, td, cellIndex, record, tr, rowIndex, e, eOpts ){
                                var grid = me;
                                var rows = grid.getSelection();
                                var trigger = this.up('window').trigger;
                                var datas=[];
                                for(var i=0; i<rows.length; i++){
                                    datas.push(rows[i].data);
                                }
                                //trigger.setValue(datas);
                                //this.up('window').hide();
                            }
                        }
                    });

                    me.parent.queryWin.add(grid);
                }
            }
        });
    },
    handler: function () {
                var grid = this.queryWin.child('grid');
                if(grid) { this.queryWin.show(); }

    }
});
