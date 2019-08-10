package com.savi.appauth.config;

import org.springframework.security.oauth2.common.exceptions.InvalidGrantException;
import org.springframework.security.oauth2.common.exceptions.InvalidRequestException;
import org.springframework.security.oauth2.common.exceptions.OAuth2Exception;
import org.springframework.security.oauth2.common.exceptions.RedirectMismatchException;
import org.springframework.security.oauth2.provider.ClientDetails;
import org.springframework.security.oauth2.provider.endpoint.RedirectResolver;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.*;

/** 客户端授权地址验证重写 */
public class MyRedirectResolver implements RedirectResolver {
    private Collection<String> redirectGrantTypes = Arrays.asList("implicit", "authorization_code");
    private boolean matchSubdomains = true;
    private boolean matchPorts = true;

    public MyRedirectResolver() {
    }

//    public void setMatchSubdomains(boolean matchSubdomains) {
//        this.matchSubdomains = matchSubdomains;
//    }
//
//    public void setMatchPorts(boolean matchPorts) {
//        this.matchPorts = matchPorts;
//    }
//
//    public void setRedirectGrantTypes(Collection<String> redirectGrantTypes) {
//        this.redirectGrantTypes = new HashSet(redirectGrantTypes);
//    }

    public String resolveRedirect(String requestedRedirect, ClientDetails client) throws OAuth2Exception {
        Set<String> authorizedGrantTypes = client.getAuthorizedGrantTypes();
        if (authorizedGrantTypes.isEmpty()) {
            throw new InvalidGrantException("A client must have at least one authorized grant type.");
        } else if (!this.containsRedirectGrantType(authorizedGrantTypes)) {
            throw new InvalidGrantException("A redirect_uri can only be used by implicit or authorization_code grant types.");
        } else {
            Set<String> registeredRedirectUris = client.getRegisteredRedirectUri();
            if (registeredRedirectUris != null && !registeredRedirectUris.isEmpty()) {
                return this.obtainMatchingRedirect(registeredRedirectUris, requestedRedirect);
            } else {
                throw new InvalidRequestException("At least one redirect_uri must be registered with the client.");
            }
        }
    }

    private boolean containsRedirectGrantType(Set<String> grantTypes) {
        Iterator var2 = grantTypes.iterator();

        String type;
        do {
            if (!var2.hasNext()) {
                return false;
            }

            type = (String)var2.next();
        } while(!this.redirectGrantTypes.contains(type));

        return true;
    }

    protected boolean redirectMatches(String requestedRedirect, String redirectUri) {
        UriComponents requestedRedirectUri = UriComponentsBuilder.fromUriString(requestedRedirect).build();
        String requestedRedirectUriScheme = requestedRedirectUri.getScheme() != null ? requestedRedirectUri.getScheme() : "";
        String requestedRedirectUriHost = requestedRedirectUri.getHost() != null ? requestedRedirectUri.getHost() : "";
        String requestedRedirectUriPath = requestedRedirectUri.getPath() != null ? requestedRedirectUri.getPath() : "";
        UriComponents registeredRedirectUri = UriComponentsBuilder.fromUriString(redirectUri).build();
        String registeredRedirectUriScheme = registeredRedirectUri.getScheme() != null ? registeredRedirectUri.getScheme() : "";
        String registeredRedirectUriHost = registeredRedirectUri.getHost() != null ? registeredRedirectUri.getHost() : "";
        String registeredRedirectUriPath = registeredRedirectUri.getPath() != null ? registeredRedirectUri.getPath() : "";
        boolean portsMatch = this.matchPorts ? registeredRedirectUri.getPort() == requestedRedirectUri.getPort() : true;
        return registeredRedirectUriScheme.equals(requestedRedirectUriScheme) && this.hostMatches(registeredRedirectUriHost, requestedRedirectUriHost) && portsMatch;
        // && registeredRedirectUriPath.equals(StringUtils.cleanPath(requestedRedirectUriPath));  定制redirect 只验证域名和端口
    }

    protected boolean hostMatches(String registered, String requested) {
        if (!this.matchSubdomains) {
            return registered.equals(requested);
        } else {
            return registered.equals(requested) || requested.endsWith("." + registered);
        }
    }

    private String obtainMatchingRedirect(Set<String> redirectUris, String requestedRedirect) {
        Assert.notEmpty(redirectUris, "Redirect URIs cannot be empty");
        if (redirectUris.size() == 1 && requestedRedirect == null) {
            return (String)redirectUris.iterator().next();
        } else {
            Iterator var3 = redirectUris.iterator();

            String redirectUri;
            do {
                if (!var3.hasNext()) {
                    throw new RedirectMismatchException("Invalid redirect: " + requestedRedirect + " does not match one of the registered values.");
                }

                redirectUri = (String)var3.next();
            } while(requestedRedirect == null || !this.redirectMatches(requestedRedirect, redirectUri));

            return requestedRedirect;
        }
    }
}
