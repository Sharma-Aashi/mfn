package com.vitalora.api.dto.brand;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BrandRequest(
        @NotBlank(message = "Brand name is required") @Size(max = 120) String name,
        @Size(max = 150) String slug,
        String description,
        @Size(max = 500) String logoUrl,
        @Size(max = 500) String bannerUrl,
        @Size(max = 100) String countryOfOrigin,
        @Size(max = 255) String websiteUrl,
        Boolean houseBrand,
        Boolean authorizedReseller,
        Boolean active,
        Boolean featured,
        Integer displayOrder
) {
}
