package com.savi.appauth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@EnableDiscoveryClient
@RestController
public class AppAuthApplication {

    public static void main(String[] args) {
        SpringApplication.run(AppAuthApplication.class, args);
    }

    @RequestMapping("/auth/hello/{id}")
    public String helloOath2(@PathVariable long id){
        System.out.println("请求ID编码为："+ id);
        return  "helloOath2";
    }
}
