package com.vitalora.api.dto.product;

import java.math.BigDecimal;

public record ProductSummaryResponse(
        Long id,
        String name,
        String slug,
        String sku,
        String shortDescription,
        BigDecimal price,
        BigDecimal salePrice,
        BigDecimal effectivePrice,
        String currency,
        String primaryImageUrl,
        BigDecimal avgRating,
        int reviewCount,
        boolean active,
        boolean featured,
        boolean bestSeller,
        boolean newArrival,
        boolean inStock
) {
}
