package com.vitalora.api.dto.product;

import java.math.BigDecimal;
import java.util.List;

/**
 * Everything the listing page can narrow by. Grouped into one record because a
 * marketplace keeps growing facets, and a twelve-argument search method does not
 * survive that.
 */
public record ProductFilter(
        String q,
        String category,
        List<String> brands,
        List<String> flavours,
        List<String> sizes,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        Double minRating,
        Boolean inStockOnly,
        String sort
) {
    public static ProductFilter empty() {
        return new ProductFilter(null, null, null, null, null, null, null, null, null, null);
    }
}
