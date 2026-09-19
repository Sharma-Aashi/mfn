package com.vitalora.api.dto.brand;

/** The brand as it appears on a product card or in a filter list. */
public record BrandSummaryResponse(
        Long id,
        String name,
        String slug,
        String logoUrl,
        boolean houseBrand,
        boolean authorizedReseller
) {
}
