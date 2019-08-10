package com.savi.appauth.service;

import com.savi.appauth.dao.BaseUserDao;
import com.savi.appauth.entity.BaseUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class MyUserDetailService implements UserDetailsService {
    protected Logger logger = LoggerFactory.getLogger(getClass());

    @Autowired
    private BaseUserDao baseUserDao;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        BaseUser baseUser = baseUserDao.queryUser(username);
        if(baseUser == null){
            throw new UsernameNotFoundException("用户名不存在或密码错误！");
        }
        return baseUser;

    }
}
