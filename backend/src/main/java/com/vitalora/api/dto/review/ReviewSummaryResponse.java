package com.vitalora.api.dto.review;

import java.math.BigDecimal;
import java.util.Map;

public record ReviewSummaryResponse(
        BigDecimal avgRating,
        int totalReviews,
        Map<Integer, Long> breakdown
) {
}
