package com.vitalora.api.dto.cms;

public record BannerResponse(
        Long id,
        String title,
        String subtitle,
        String imageUrl,
        String ctaText,
        String ctaLink,
        int displayOrder,
        boolean active
) {
}
