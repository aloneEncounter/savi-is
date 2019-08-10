/**
 * Created by zss on 2018/3/29.
 */

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
