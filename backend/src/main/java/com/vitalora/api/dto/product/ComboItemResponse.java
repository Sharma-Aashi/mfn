package com.vitalora.api.dto.product;

import java.math.BigDecimal;

/**
 * One pack inside a stack, flattened for display.
 *
 * <p>It carries the component's own name, flavour and picture so a stack card
 * can show what is in the box without the client fetching each product.
 */
public record ComboItemResponse(
        Long variantId,
        Long productId,
        String productSlug,
        String productName,
        String flavour,
        String sizeLabel,
        String imageUrl,
        int quantity,
        /** What this component alone sells for, before the stack's discount. */
        BigDecimal unitPrice
) {
}
