package com.savi.appauth.config;

import com.savi.appauth.service.MyUserDetailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.config.annotation.configurers.ClientDetailsServiceConfigurer;
import org.springframework.security.oauth2.config.annotation.web.configuration.AuthorizationServerConfigurerAdapter;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableAuthorizationServer;
import org.springframework.security.oauth2.config.annotation.web.configurers.AuthorizationServerEndpointsConfigurer;
import org.springframework.security.oauth2.config.annotation.web.configurers.AuthorizationServerSecurityConfigurer;
import org.springframework.security.oauth2.provider.endpoint.AuthorizationEndpoint;
import org.springframework.security.oauth2.provider.endpoint.RedirectResolver;
import org.springframework.security.oauth2.provider.token.DefaultTokenServices;
import org.springframework.security.oauth2.provider.token.TokenStore;
import org.springframework.security.oauth2.provider.token.store.redis.RedisTokenStore;

/**
 * OAuth2配置类
 * @author wz  @version V1.0     @date 2019-7-8
 */
@Configuration
@EnableAuthorizationServer
public class AuthorizationServerConfig extends AuthorizationServerConfigurerAdapter {

    @Autowired
    private AuthenticationManager authenticationManager;

//    @Autowired
//    private PasswordEncoder passwordEncoder;

    @Autowired
    private MyUserDetailService userDetailService;

    @Autowired
    private RedisConnectionFactory redisConnectionFactory;

    @Bean
    public TokenStore tokenStore(){
        return new RedisTokenStore(redisConnectionFactory);
    }

    @Override
    public void configure(AuthorizationServerSecurityConfigurer security) throws Exception {
        security.tokenKeyAccess("permitAll()").checkTokenAccess("isAuthenticated()")
                .allowFormAuthenticationForClients();

    }

    /** 配置授权（authorization）以及令牌（token）的访问端点和令牌服务（token services） */
    @Override
    public void configure(AuthorizationServerEndpointsConfigurer endpoints) throws Exception {
        // 需要使用refresh_token,需要额外配置userDetailsService
        endpoints.tokenStore(tokenStore())
                .userDetailsService(userDetailService)
                .authenticationManager(authenticationManager);
        endpoints.tokenServices(defaultTokenServices());
        endpoints.redirectResolver(redirectResolver()); //重写客户端地址验证
    }

    @Bean
    public RedirectResolver redirectResolver(){
        //return new BCryptPasswordEncoder();
        return new MyRedirectResolver();
    }

    /** 配置客户端详情服务（），客户端详情服务在这里进行初始化，能够把客户端详情信息写死在这或者通过数据库来存储详情信息 */

    @Override
    public void configure(ClientDetailsServiceConfigurer clients) throws Exception {
        // 配置oauth2的 client信息
        // authorizedGrantTypes 有4种，这里只开启2种
        // secret密码配置从 Spring Security 5.0开始必须以 {bcrypt}+加密后的密码 这种格式填写

        clients.inMemory().withClient("saviApp").secret("{noop}savi_Secret")
                .authorizedGrantTypes("password", "authorization_code", "refresh_token")
                .scopes("all")//.redirectUris("http://localhost:8080/sys/login","http://192.192.0.243:8080/login","http://localhost:8081/login","http://localhost:8083/login","http://192.192.0.243:8083/login", "http://localhost:8801/login")
                .redirectUris("http://localhost:8080")
                .autoApprove(true);

//        clients.inMemory()
//                .withClient("saviApp").secret("{noop}savi_Secret")
//                .authorizedGrantTypes("password", "client_credentials", "refresh_token", "authorization_code")
//                .scopes("all").redirectUris("http://localhost:8081/login");
    }

    @Bean
    public DefaultTokenServices defaultTokenServices(){
        DefaultTokenServices tokenServices = new DefaultTokenServices();
        tokenServices.setTokenStore(tokenStore());
        tokenServices.setSupportRefreshToken(true);
        //tokenServices.setClientDetailsService(clientDetails());
//        //token有效期12小时
//        tokenServices.setAccessTokenValiditySeconds(60*60*12);
//        //refresh_token默认7天
//        tokenServices.setRefreshTokenValiditySeconds(60*60*24*7);


        tokenServices.setAccessTokenValiditySeconds(60*1);
        //refresh_token默认7天
        tokenServices.setRefreshTokenValiditySeconds(60*2);

        return tokenServices;
    }





//
//    @Autowired
//    private DataSource dataSource;
//
//
//    @Autowired
//    private RedisConnectionFactory redisConnectionFactory;
//
//    @Bean
//    public TokenStore tokenStore(){
//        return  new RedisTokenStore(redisConnectionFactory);
//    }
//
//    /** 配置令牌端点（Token Endpoint）的安全约束 */
//    @Override
//    public void configure(AuthorizationServerSecurityConfigurer security) throws Exception {
//        security.allowFormAuthenticationForClients()
//                .tokenKeyAccess("permitAll()")    //开启/oauth/token_key验证短裤无权限访问
//                .checkTokenAccess("isAuthenticated()");  //开启/oauth/check_token验证端口认证权限访问
//    }
//
//    /** 配置客户端详情服务（），客户端详情服务在这里进行初始化，能够把客户端详情信息写死在这或者通过数据库来存储详情信息 */
//    @Override
//    public void configure(ClientDetailsServiceConfigurer clients) throws Exception {
//        clients.withClientDetails(clientDetails());
////        clients.inMemory()
////                .withClient("webapp")
////                .scopes("read")
////                .authorizedGrantTypes("password","authorization_code", "refresh_token");
//    }
//
//    @Bean
//    public ClientDetailsService clientDetails() {
//        return new JdbcClientDetailsService(dataSource);
//    }
//
//    /** 配置授权（authorization）以及令牌（token）的访问端点和令牌服务（token services） */
//    @Override
//    public void configure(AuthorizationServerEndpointsConfigurer endpoints) throws Exception {
//        endpoints.tokenStore(tokenStore())  //保存到Redis中
//                .userDetailsService(userDetailService)
//                .authenticationManager(authenticationManager);
//        endpoints.tokenServices(defaultTokenServices());
//    }
//
//    @Bean
//    public DefaultTokenServices defaultTokenServices(){
//        DefaultTokenServices tokenServices = new DefaultTokenServices();
//        tokenServices.setTokenStore(tokenStore());
//        tokenServices.setSupportRefreshToken(true);
//        //token有效期，默认12小时
//        tokenServices.setAccessTokenValiditySeconds(60*60*12);
//        //refresh_token默认30天
//        tokenServices.setRefreshTokenValiditySeconds(60*60*24*7);
//        return tokenServices;
//    }
}
