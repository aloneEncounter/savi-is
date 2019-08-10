/**
 * Created by wz on 2018/3/27. 自定义VTypes
 */
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