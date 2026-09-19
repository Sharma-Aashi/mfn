package com.vitalora.api.dto.brand;

import java.time.Instant;

public record BrandResponse(
        Long id,
        String name,
        String slug,
        String description,
        String logoUrl,
        String bannerUrl,
        String countryOfOrigin,
        String websiteUrl,
        boolean houseBrand,
        boolean authorizedReseller,
        boolean active,
        boolean featured,
        int displayOrder,
        long productCount,
        Instant createdAt,
        Instant updatedAt
) {
}
