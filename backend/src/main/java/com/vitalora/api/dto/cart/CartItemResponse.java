package com.vitalora.api.dto.cart;

import java.math.BigDecimal;

public record CartItemResponse(
        Long id,
        Long variantId,
        Long productId,
        String productName,
        String productSlug,
        String productImage,
        String brandName,
        String variantLabel,
        String sku,
        BigDecimal unitPrice,
        /** List price before any discount, so the cart can show what was saved. */
        BigDecimal unitMrp,
        int quantity,
        BigDecimal lineTotal,
        boolean inStock,
        int availableStock
) {
}
