/**
 * Created by wz on 2018/3/20.
 * 对loader标签页加载动态页面封装。
 */
Ext.define('Sv.ComponentLoader', {
    override : 'Ext.ComponentLoader',
    autoLoad: true,
    removeD: false,
    constructor: function(config) {
        config = config || {};
        var autoLoad = config.autoLoad;
        config.autoLoad = false;
        this.superclass.constructor.call(this, config);
        if (autoLoad !== false) {
            this.autoLoad = true;
        }
        if (this.renderer == "frame") {
            var target = this.getTarget();
            if (!target.isContainer) {
                throw 'IFrame can only be loader to a container';
            }
            target.layout = "fit";
        }
        var loadConfig = { delay: 10, single: true },
            triggerControl = this.triggerControl || this.getTarget(),
            triggerEvent = this.triggerEvent,
            defaultTriggerEvent = triggerControl instanceof Ext.container.Container ? "afterlayout": "afterrender";
        loadConfig.single = !(this.reloadOnEvent || false);
        if (this.autoLoad) {
            triggerControl.on(defaultTriggerEvent,
                function() {
                    this.load({});
                }, //渲染后加载
                this, loadConfig);
            if(triggerEvent){
                triggerControl.on(triggerEvent,
                    function() {
                        this.load({});
                    }, //渲染后加载
                    this, loadConfig);
            }
        }
    },
    load: function(options) {
        if (Ext.isString(options)) {
            this.url=options;
            options = { url: options };
        } else {
            options = Ext.apply({}, options);
        }
        this.lastOptions = options;
        if (this.renderer == "frame") {
            this.loadFrame(options);
            return;
        }
    },
    loadFrame: function(options) {
        options = Ext.apply({}, options);
        var me = this,
            target = me.getTarget(),
            mask = Ext.isDefined(options.loadMask) ? options.loadMask: me.loadMask,
            disableCaching = Ext.isDefined(options.disableCaching) ? options.disableCaching: me.disableCaching,
            disableCachingParam = options.disableCachingParam || "_dc",
            params = Ext.apply({}, options.params);
        Ext.applyIf(params, me.params);
        Ext.apply(params, me.baseParams);
        Ext.applyIf(options, { url: me.url });
        Ext.apply(options, {
            mask: mask,
            disableCaching: disableCaching,
            params: params
        });
        this.lastOptions = options;
        if (!options.url) {
            throw 'No URL specified';
        }
        // if (me.fireEvent('beforeload', me, options) === false) {
        //     return;
        // }
        var url = options.url;
        if (disableCaching !== false) {
            url = url + ((url.indexOf("?") > -1) ? "&": "?") + disableCachingParam + "=" + new Date().getTime();
        }
        if (!Ext.Object.isEmpty(params)) {
            var p = {};
            for (var key in params) {
                var ov = params[key];
                if (typeof ov == "function") {
                    p[key] = ov.call(target);
                } else {
                    p[key] = ov;
                }
            }
            p = Ext.urlEncode(p);
            url = url + ((url.indexOf("?") > -1) ? "&": "?") + p;
        }
        if (Ext.isEmpty(target.iframe)) {
            target.iframe= new Ext.ux.IFrame({
                id: target.id + "_IFrame",
                loadMask: Ext.isString(mask)? mask:((mask.msg)? mask.msg:'加载中......'),
                listeners: {
                    destroy: function() {
                        var iframe = this.getFrame();
                        if (iframe && iframe.parentNode) {
                            iframe.src = 'about:blank';
                            iframe.parentNode.removeChild(iframe);
                        }
                    },
                    load: function () {
                        var cw = this.getWin();
                        if(cw){ cw.target = target; }
                    }
                }
            });
            target.add(target.iframe);
            target.iframe.load(url);
        } else {
            target.iframe.load(url);
            // if (Ext.isIE && Ext.ieVersion <= 9)
        }
    }
});