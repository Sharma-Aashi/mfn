package com.vitalora.api.util;

import java.text.Normalizer;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public final class SlugUtil {

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]+");
    private static final Pattern MULTI_DASH = Pattern.compile("-{2,}");

    private SlugUtil() {
    }

    public static String slugify(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }
        String noWhitespace = WHITESPACE.matcher(input.trim()).replaceAll("-");
        String normalized = Normalizer.normalize(noWhitespace, Normalizer.Form.NFD);
        String slug = NON_LATIN.matcher(normalized).replaceAll("");
        slug = MULTI_DASH.matcher(slug).replaceAll("-");
        return slug.toLowerCase().replaceAll("^-|-$", "");
    }

    /**
     * Appends -2, -3, ... until {@code existsCheck} reports the candidate is free.
     */
    public static String uniqueSlug(String base, Predicate<String> existsCheck) {
        String slug = slugify(base);
        if (slug.isBlank()) {
            slug = "item";
        }
        String candidate = slug;
        int counter = 2;
        while (existsCheck.test(candidate)) {
            candidate = slug + "-" + counter;
            counter++;
        }
        return candidate;
    }
}
