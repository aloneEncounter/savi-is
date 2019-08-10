/**
 * Created by wz on 2018/8/22.
 */
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