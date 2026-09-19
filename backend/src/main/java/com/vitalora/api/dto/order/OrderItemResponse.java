package com.vitalora.api.dto.order;

import java.math.BigDecimal;

public record OrderItemResponse(
        Long productId,
        String productSlug,
        String productName,
        /** Snapshot taken at order time, so a later rename cannot rewrite history. */
        String brandName,
        /** Which option was bought, e.g. "Chocolate . 1 kg". Null for a single-SKU product. */
        String variantLabel,
        String productImage,
        String sku,
        BigDecimal unitPrice,
        int quantity,
        BigDecimal lineTotal
) {
}
