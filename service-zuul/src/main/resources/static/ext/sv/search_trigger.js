/**
 * Created by wz on 2018/3/13. guid 数据过滤控件
 */
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