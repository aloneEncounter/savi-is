package com.savi.base.dao;

import java.util.List;
import java.util.Map;

/**
 * 基础Dao(还需在XML文件里，有对应的SQL语句)
 * Created by zzp on 2018/2/27.
 */
public interface BaseDao<T> {

    /** 创建 */
    int insert(T t);

    /** 定制创建 */
    int insert(Map<String, Object> map);

    /** 更新 */
    int update(T t);

    /** 定制更新 */
    int update(Map<String, Object> map);

    /** 删除 */
    int delete(Object id);

    /** 定制删除 */
    int delete(Map<String, Object> map);

    /** 批量删除 */
    int deleteBatch(Object[] id);

    /** 查询实体 */
    T queryObject(Object id);

    /** 定制查询 */
    List<T> queryList(Map<String, Object> map);

    /** 查询所有 */
    List<T> queryAllList();

    /** 查询数量 */
    int queryTotal(Map<String, Object> map);

}
