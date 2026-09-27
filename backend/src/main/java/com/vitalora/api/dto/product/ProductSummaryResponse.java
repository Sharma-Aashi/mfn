package com.vitalora.api.dto.product;

import com.vitalora.api.dto.brand.BrandSummaryResponse;

import java.math.BigDecimal;
import java.util.List;

public record ProductSummaryResponse(
        Long id,
        String name,
        String slug,
        String sku,
        String shortDescription,
        BigDecimal price,
        BigDecimal salePrice,
        BigDecimal effectivePrice,
        /** Cheapest active variant — what a card shows when variants differ in price. */
        BigDecimal fromPrice,
        boolean multipleVariants,
        int variantCount,
        /** Lets a card add a single-variant product straight to the cart. */
        Long defaultVariantId,
        String currency,
        String primaryImageUrl,
        BrandSummaryResponse brand,
        BigDecimal avgRating,
        int reviewCount,
        boolean active,
        boolean featured,
        boolean bestSeller,
        boolean newArrival,
        boolean inStock,
        /** True when this product is a stack of several others. */
        boolean combo,
        /**
         * What the stack's contents cost bought separately. Summed from the
         * components, so it can never disagree with them; zero for anything
         * that is not a stack, which is also the signal to show no saving.
         */
        BigDecimal componentsTotal,
        /** The packs inside, so a stack card can picture them. */
        List<ComboItemResponse> comboItems
) {
}
