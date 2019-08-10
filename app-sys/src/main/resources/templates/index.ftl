<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <title>${SysName}</title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge" >
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" >
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=10, user-scalable=yes">
    <script type="text/javascript" src="/ext/include-ext.js${SysDebug}"></script>
</head>
<body>
<script type="text/javascript" th:inline="text">
    //<![CDATA[
    Ext.namespace('App');

    Ext.QuickTips.init();


    Ext.onReady(function () {


        App.myViewport = Ext.create("Ext.container.Viewport", {
            layout: 'fit',
            items: [
                {
                    xtype: 'panel',
                    items:[
                        {xtype: 'button', text:'保存',width:80,
                            handler: function (){

                            }
                        },
                        {xtype: 'button', text:'加载',width:80,
                            handler: function (){
                            }
                        },
                        {xtype: 'button', text:'只读',width:80,
                            handler: function (){
                            }
                        },
                        {xtype: 'button', text:'可写',width:80,
                            handler: function (){
                            }
                        }
                    ]
                }

            ]
        });

    });

    //]]>
    /*权限初始化*/
</script>
</body>

</html>