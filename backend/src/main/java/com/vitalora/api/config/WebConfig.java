package com.vitalora.api.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final AppProperties appProperties;

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        String uploadDir = new File(appProperties.getUpload().getDir()).getAbsolutePath();
        registry.addResourceHandler(appProperties.getUpload().getPublicPath() + "/**")
                .addResourceLocations("file:" + uploadDir + File.separator);
    }
}
