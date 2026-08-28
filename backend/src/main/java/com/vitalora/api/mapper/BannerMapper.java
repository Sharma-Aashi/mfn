package com.vitalora.api.mapper;

import com.vitalora.api.dto.cms.BannerResponse;
import com.vitalora.api.entity.Banner;

public final class BannerMapper {

    private BannerMapper() {
    }

    public static BannerResponse toResponse(Banner banner) {
        return new BannerResponse(
                banner.getId(),
                banner.getTitle(),
                banner.getSubtitle(),
                banner.getImageUrl(),
                banner.getCtaText(),
                banner.getCtaLink(),
                banner.getDisplayOrder(),
                banner.isActive()
        );
    }
}
