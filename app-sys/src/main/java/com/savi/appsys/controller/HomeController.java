package com.savi.appsys.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.Enumeration;

@Controller
public class HomeController {

    @GetMapping("/")
    public String index(Model model){
        model.addAttribute("SysName", "赛维");
        model.addAttribute("SysDebug", "?debug");
        return "index";
    }

    @ResponseBody
    @RequestMapping("/test")
    public String test(HttpServletRequest request){
        System.out.println("----------------------header-------------------------");
        Enumeration headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()){
            String key = (String) headerNames.nextElement();
            System.out.println(key + ":"+request.getHeader(key));
        }
        System.out.println("-----------------------header------------------------");
        return "helloooooooooooooooooooooooooooo!";
    }

}
