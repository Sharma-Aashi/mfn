package com.vitalora.api.dto.cms;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BannerRequest(
        @NotBlank(message = "Title is required") @Size(max = 200) String title,
        @Size(max = 300) String subtitle,
        String imageUrl,
        @Size(max = 60) String ctaText,
        @Size(max = 255) String ctaLink,
        Integer displayOrder,
        Boolean active
) {
}
