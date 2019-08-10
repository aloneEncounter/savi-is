/**
 * Copyright (c) 2011,赛维航电科技有限公司软件开发部
 * All rights reserved.
 *
 * @file BaseUserDao.java
 * @brief 用户信息
 * @author 刘文智    @version V1.0     @date 2019-07-15 16:50:11
 */
package com.savi.appauth.dao;

import com.savi.appauth.entity.BaseUser;
import org.apache.ibatis.annotations.Mapper;


/**
 * 用户信息
 * 
 * @author 刘文智
 * @date 2019-07-15 16:50:11
 */
@Mapper
public interface BaseUserDao {

    BaseUser queryUser(String userName);
}
