/**
 * Created by zzp on 2018/7/16.
 */
Ext.grid.Panel.override({
    /**
     *
     * @param url 导出Excel后台地址 必填
     * @param query 查询条件 没有查询条件可为null
     * @param title 文件名称 可为null
     * @param format 文件格式 可为null
     * @returns {boolean}
     */
    expData: function (url,query,title,format) {
        var grid = this;
        if (!title) title = "导出Excel";
        var fileName = title;
        var expd = {
            title: title || '',
            format: format || "xls",
            fileName: fileName || '',
            dataCount: (grid.store.getCount() > grid.store.getTotalCount()) ? grid.store.getCount() : grid.store.getTotalCount(),
            columnsBasisInfos: [],
            datas: [],
            totalCount: grid.store.getTotalCount()
        };
        //var columnsaaa = grid.columnManager.getHeaderColumns(grid.columnManager.headerCt);
        //var columnsaaa1 = grid.columnManager.getHeaderColumns(grid.columnManager.secondHeaderCt);
        var columns = grid.columnManager.getColumns(); //this.getColumns(grid); //
        for (col in columns) {
            if (columns[col].dataIndex && columns[col].dataIndex != '') {

                //if (fields) rFT = fields.get(columns[col].dataIndex).type.type;

                //将最终表头添加到集合中c
                expd.columnsBasisInfos.push({
                    DataIndex: columns[col].dataIndex || '', //对应数据ID
                    Header: columns[col].text || '',  //标题
                    //RecordFieldType: rFT || 'auto', //数据类型Auto = 0,String = 1,Int = 2,Float = 3,Boolean = 4,Date = 5,
                    IsHidden: columns[col].isHidden(), //是否显示字段
                    Align: columns[col].align || '', //显示对齐方式Right = 0,Left = 1,Center = 2,  可取值: 'left', 'center', and 'right'。
                    Width: columns[col].getWidth() || 80,  //宽度
                    DateFormat: columns[col].dateFormat || ''
                    //BGroup: groupField == this.columns[col].dataIndex
                });
            }
        }

        expd.datas = grid.store.getRecordsValues();

        if (!expd.datas || expd.datas.length === 0) {
            return false;
        }
        if (!Ext.fly('mainForm')) {
            var mainForm = document.createElement("form");
            mainForm.id = 'mainForm';
            mainForm.name = 'mainForm';  //该表单的name属性为downForm
            mainForm.className = 'x-hidden'; //该表单为隐藏的
            mainForm.action = Ext.actualUrl(url); //表单的提交地址
            mainForm.method = 'post';  //表单的提交方法
            //form.data = Ext.encode(expd);

            var data = document.createElement('input');  //创建一个input节点
            data.name = "data";
            data.value = Ext.JSON.encode(expd);   //参数值
            data.type = 'hidden';　　//隐藏域
            mainForm.appendChild(data); //将input节点追加到form表单里面
            document.body.appendChild(mainForm);
        }

        //Ext.fly('mainForm').dom.submit(); //调用form表单的submit方法，提交表单，从而开始下载文件

        Ext.Ajax.request({
            disableCaching: true,
            url: Ext.actualUrl(url),
            method: 'POST',
            isUpload: true,
            form: Ext.fly('mainForm'),
            params: {
                query: query
            }
        });
        if (Ext.fly('mainForm')) {
            document.body.removeChild(mainForm);
        }
    }
});