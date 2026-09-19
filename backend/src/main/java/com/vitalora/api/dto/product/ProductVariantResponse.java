package com.vitalora.api.dto.product;

import java.math.BigDecimal;

public record ProductVariantResponse(
        Long id,
        String sku,
        String flavour,
        String sizeLabel,
        BigDecimal sizeValue,
        String sizeUnit,
        /** "Chocolate · 1 kg" — what the selector button reads. */
        String label,
        BigDecimal price,
        BigDecimal salePrice,
        BigDecimal effectivePrice,
        String imageUrl,
        boolean active,
        boolean defaultVariant,
        int displayOrder,
        int stockQuantity,
        int lowStockThreshold,
        boolean inStock
) {
}
