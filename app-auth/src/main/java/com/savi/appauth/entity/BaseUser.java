package com.savi.appauth.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.savi.base.entity.TextField;
import lombok.Data;
import org.apache.commons.lang.time.DateUtils;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.Serializable;
import java.util.*;

/** 用户账户基本信息 */
@Data
public class BaseUser implements UserDetails {

    /** 用户真实姓名 */
    private String userName;

    /** 用户名 */
    private String userCode;

    /** 密码 */
    @JsonIgnore
    private String pass;

    /** 第一部门编码 */
    private String orgCode;

    /** 第一部门名称 */
    private String orgName;

    /** 用户所属机构 */
    private List<TextField> orgs;

    /** 最后密码更改时间 */
    private Date lastPassChangedDate;

    /** 最后一次锁帐号的时间 */
    @JsonIgnore
    private Date lastLockoutDate;

    /** 密码失败尝试次数 */
    @JsonIgnore
    private Integer failedPassCount;

    /** 是否锁住（false=未锁住，true=锁住） */
    @JsonIgnore
    private Boolean lockedOut;

    /** 是否可用（false=不可用，true=可用） */
    @JsonIgnore
    private Boolean suEnabled;

    /** 左边菜单是否折叠 */
    private Boolean menuCollapsed = false;

    /** 用户分页数量 */
    private Integer pageSize;

    /** 用户首页模块配置 */
    private String userPortals;

    /** 最后访问程序 */
    private String lastAppCode;

    /*** 默认打开应用地址 */
    private String defaultAppUrl;

    /** 密码更改周期(天) */
    private Integer susPassChangeCycle;

    /** 密码最小长度 */
    private Integer susPassMinLen;

    /** 密码复杂度 */
    private Integer susPassComplexity;

    /** 用户拥有权限 */
    private Set<GrantedAuthority> authorities;

    /** 用户拥有权限 */
    @Override
    public Set<GrantedAuthority> getAuthorities() {
        return authorities;
    }
    public void setAuthorities(Set<GrantedAuthority> authorities) {
        this.authorities = authorities;
    }

    /** 用户名 */
    @Override
    public String getUsername() {
        return userCode;
    }

    /** 密码 */
    @Override
    public String getPassword() {
        return pass;
    }

    /** 用户账号是否非过期 */
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    /** 用户账号是否非锁定 */
    @Override
    public boolean isAccountNonLocked() {
        return !lockedOut;
    }

    /** 用户密码是否非过期 */
    @Override
    public boolean isCredentialsNonExpired() {
        if (susPassChangeCycle>0){
            Date date = DateUtils.addDays(lastPassChangedDate, susPassChangeCycle);
            return new Date().before(date);
        }
        return true;
    }

    /** 用户是否可用 */
    @Override
    public boolean isEnabled() {
        return suEnabled;
    }
}
