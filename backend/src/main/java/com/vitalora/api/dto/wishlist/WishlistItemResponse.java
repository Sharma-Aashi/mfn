package com.vitalora.api.dto.wishlist;

import java.math.BigDecimal;

public record WishlistItemResponse(
        Long productId,
        String productName,
        String productSlug,
        String productImage,
        BigDecimal price,
        BigDecimal salePrice,
        BigDecimal effectivePrice,
        boolean inStock,
        java.time.Instant addedAt
) {
}
