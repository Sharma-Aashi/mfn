package com.vitalora.api.dto.cart;

import java.math.BigDecimal;

public record CartItemResponse(
        Long id,
        Long productId,
        String productName,
        String productSlug,
        String productImage,
        BigDecimal unitPrice,
        int quantity,
        BigDecimal lineTotal,
        boolean inStock,
        int availableStock
) {
}
