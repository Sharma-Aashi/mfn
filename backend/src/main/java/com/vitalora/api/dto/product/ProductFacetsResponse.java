package com.vitalora.api.dto.product;

import com.vitalora.api.dto.brand.BrandSummaryResponse;

import java.math.BigDecimal;
import java.util.List;

/** The choices the listing sidebar can offer, derived from what is actually on sale. */
public record ProductFacetsResponse(
        List<BrandSummaryResponse> brands,
        List<String> flavours,
        List<String> sizes,
        BigDecimal minPrice,
        BigDecimal maxPrice
) {
}
