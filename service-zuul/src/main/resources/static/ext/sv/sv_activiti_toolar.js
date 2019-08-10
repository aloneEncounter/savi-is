/**
 * 工作流工具栏及提交相关事件
 * Created by wz on 2018/4/25.
 */
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