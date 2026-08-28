package com.vitalora.api.dto.review;

import java.time.Instant;

public record ReviewResponse(
        Long id,
        Long productId,
        String productName,
        String productSlug,
        Long userId,
        String customerName,
        int rating,
        String title,
        String comment,
        String status,
        boolean featured,
        Instant createdAt
) {
}
