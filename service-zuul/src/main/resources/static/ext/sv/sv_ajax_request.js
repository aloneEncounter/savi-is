/**
 * Created by wz on 2018/4/21.
 */
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