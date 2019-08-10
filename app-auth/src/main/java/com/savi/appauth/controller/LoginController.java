package com.savi.appauth.controller;

import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.security.Principal;

@Controller
public class LoginController {


    //@RequestMapping(value = "/login.html")
    @RequestMapping("/login")
    public String login(Model model, HttpServletRequest request) {
        model.addAttribute("sysName","赛维航电科技有限公司");
        String url = request.getParameter("returnUrl");
        if (StringUtils.isBlank(url)){ url = ""; }
        model.addAttribute("returnUrl", url);
        return "login";
    }

    @GetMapping("/index")
    public String index() {
        return "index";
    }



    @ResponseBody
    @RequestMapping("/auth/user")
    public Principal user(Principal principal) {
        System.out.println(principal);
        return principal;
    }
}
