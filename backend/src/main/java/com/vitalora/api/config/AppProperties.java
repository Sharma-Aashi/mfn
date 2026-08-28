package com.vitalora.api.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private final Jwt jwt = new Jwt();
    private final Cors cors = new Cors();
    private final Upload upload = new Upload();
    private final Admin admin = new Admin();
    private final Frontend frontend = new Frontend();
    private final Inventory inventory = new Inventory();

    @Getter
    @Setter
    public static class Jwt {
        private String secret;
        private long expirationMs;
    }

    @Getter
    @Setter
    public static class Cors {
        private String allowedOrigins;
    }

    @Getter
    @Setter
    public static class Upload {
        private String dir;
        private String publicPath;
    }

    @Getter
    @Setter
    public static class Admin {
        private String seedEmail;
        private String seedPassword;
    }

    @Getter
    @Setter
    public static class Frontend {
        private String baseUrl;
    }

    @Getter
    @Setter
    public static class Inventory {
        private int defaultLowStockThreshold;
    }
}
