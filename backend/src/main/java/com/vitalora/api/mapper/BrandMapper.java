package com.vitalora.api.mapper;

import com.vitalora.api.dto.brand.BrandResponse;
import com.vitalora.api.dto.brand.BrandSummaryResponse;
import com.vitalora.api.entity.Brand;

public final class BrandMapper {

    private BrandMapper() {
    }

    public static BrandSummaryResponse toSummary(Brand brand) {
        if (brand == null) {
            return null;
        }
        return new BrandSummaryResponse(
                brand.getId(),
                brand.getName(),
                brand.getSlug(),
                brand.getLogoUrl(),
                brand.isHouseBrand(),
                brand.isAuthorizedReseller()
        );
    }

    public static BrandResponse toResponse(Brand brand, long productCount) {
        return new BrandResponse(
                brand.getId(),
                brand.getName(),
                brand.getSlug(),
                brand.getDescription(),
                brand.getLogoUrl(),
                brand.getBannerUrl(),
                brand.getCountryOfOrigin(),
                brand.getWebsiteUrl(),
                brand.isHouseBrand(),
                brand.isAuthorizedReseller(),
                brand.isActive(),
                brand.isFeatured(),
                brand.getDisplayOrder(),
                productCount,
                brand.getCreatedAt(),
                brand.getUpdatedAt()
        );
    }
}
