package com.vitalora.api.dto.product;

public record ProductImageResponse(
        Long id,
        String imageUrl,
        String altText,
        int displayOrder,
        boolean primary
) {
}
