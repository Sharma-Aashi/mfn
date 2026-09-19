package com.vitalora.api.dto.wishlist;

import java.math.BigDecimal;

public record WishlistItemResponse(
        Long productId,
        String productName,
        String productSlug,
        String productImage,
        String brandName,
        BigDecimal price,
        BigDecimal salePrice,
        BigDecimal effectivePrice,
        /** Null when nothing is buyable; lets a single-variant item be added straight to the cart. */
        Long defaultVariantId,
        boolean multipleVariants,
        boolean inStock,
        java.time.Instant addedAt
) {
}
