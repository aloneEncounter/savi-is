/**
 * Copyright (c) 2011,赛维航电科技有限公司软件开发部
 * All rights reserved.
 *
 * @file DeviceConfig.java
 * @brief 开窗文本字段
 * @author 刘鼎一    @version V1.0     @date 2019-01-29 15:26:29
 */
package com.savi.base.entity;

import java.io.Serializable;

/**
 * 开窗文本字段
 *
 * @author 刘鼎一    @version V1.0     @date 2019-01-29 15:26:29
 */
public class TextField implements Serializable {
    private static final long serialVersionUID = 1L;

    /** 显示字段 */
    private String display;

    /** 值 */
    private String value;

    public TextField(){

    }

    public TextField(String display, String value){
        this.display = display;
        this.value = value;
    }

    public boolean equals(Object o) {
        if (o instanceof TextField) {
            TextField u = (TextField) o;
            return value.equals(u.getValue());
        } else {
            return false;
        }
    }

    /** 显示字段 */
    public String getDisplay() {
        return display;
    }

    /** 显示字段 */
    public void setDisplay(String display) {
        this.display = display;
    }

    /** 值 */
    public String getValue() {
        return value;
    }

    /** 值 */
    public void setValue(String value) {
        this.value = value;
    }
}
