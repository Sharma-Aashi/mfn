package com.vitalora.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class VitaloraApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(VitaloraApiApplication.class, args);
    }
}
