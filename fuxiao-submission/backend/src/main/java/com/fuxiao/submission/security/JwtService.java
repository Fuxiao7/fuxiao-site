package com.fuxiao.submission.security;

import com.fuxiao.submission.entity.AdminUser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expireHours;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.expire-hours}") long expireHours) {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("app.jwt.secret 至少需要 32 个字节");
        }
        this.key = Keys.hmacShaKeyFor(bytes);
        this.expireHours = expireHours;
    }

    public String issue(AdminUser user) {
        Date now = new Date();
        return Jwts.builder()
                .subject(user.getUsername())
                .claim("uid", user.getId())
                .claim("role", user.getRole())
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expireHours * 3_600_000L))
                .signWith(key)
                .compact();
    }

    public String username(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }
}
