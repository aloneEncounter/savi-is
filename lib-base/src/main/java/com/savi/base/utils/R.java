package com.savi.base.utils;

import org.springframework.http.HttpStatus;

import java.util.HashMap;
import java.util.Map;

/**
 * 返回结果数据
 * Created by WZ on 2018/6/22.
 */
public class R extends HashMap<String, Object> {

    private static final long serialVersionUID = 1L;

    public R() {
        put("code", HttpStatus.OK.value());
        put("msg", "success");
        put("success", true);
    }

    /**
     * 返回未知异常
     * @return
     */
    public static R error() {
        return error(HttpStatus.INTERNAL_SERVER_ERROR.value(), "未知异常，请联系管理员");
    }

    /**
     * 返回异常
     * @param msg 异常消息
     * @return
     */
    public static R error(String msg) {
        return error(HttpStatus.INTERNAL_SERVER_ERROR.value(), msg);
    }

    /**
     * 返回异常
     * @param code 异常码
     * @param msg  异常消息
     * @return
     */
    public static R error(int code, String msg) {
        R r = new R();
        r.put("code", code);
        r.put("msg", msg);
        r.put("success", false);
        return r;
    }

    /**
     * 成功返回
     * @param msg 成功返回消息
     * @return
     */
    public static R ok(String msg) {
        R r = new R();
        r.put("msg", msg);
        return r;
    }

    /**
     * 成功返回
     * @param map 返回其他多组参数
     * @return
     */
    public static R ok(Map<String, Object> map) {
        R r = new R();
        r.putAll(map);
        return r;
    }

    /**
     * 成功返回
     * @param key     其他参数Key
     * @param value   其他参数值
     * @return
     */
    public static R ok(String key, Object value) {
        R r = new R();
        r.put(key, value);
        return r;
    }

    /**
     * 成功返回
     * @return
     */
    public static R ok() {
        return new R();
    }

    /**
     * 分页数据返回
     * @param data        数据项集合
     * @param totalCount  数据总数量
     * @return
     */
    public static R okPage(Object data, long totalCount){
        R r = new R();
        r.put("data", data);
        r.put("totalCount", totalCount);
        return r;
    }

    /**
     * 添加其他参数
     * @param key    其他参数Key
     * @param value  其他参数值
     * @return
     */
    public R put(String key, Object value) {
        super.put(key, value);
        return this;
    }
}
