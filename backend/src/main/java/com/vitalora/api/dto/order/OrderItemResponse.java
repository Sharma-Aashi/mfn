package com.vitalora.api.dto.order;

import java.math.BigDecimal;

public record OrderItemResponse(
        Long productId,
        String productSlug,
        String productName,
        String productImage,
        String sku,
        BigDecimal unitPrice,
        int quantity,
        BigDecimal lineTotal
) {
}
