package com.vitalora.api.util;

import java.security.SecureRandom;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.function.Predicate;

public final class OrderNumberGenerator {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyyMMdd").withZone(ZoneOffset.UTC);
    private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private OrderNumberGenerator() {
    }

    public static String generate(Predicate<String> existsCheck) {
        String prefix = "VIT-" + DATE_FMT.format(java.time.Instant.now()) + "-";
        String candidate;
        do {
            candidate = prefix + randomSuffix(6);
        } while (existsCheck.test(candidate));
        return candidate;
    }

    private static String randomSuffix(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(ALPHABET.charAt(RANDOM.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }
}
