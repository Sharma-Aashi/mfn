package com.vitalora.api.dto.category;

public record CategoryResponse(
        Long id,
        String name,
        String slug,
        String description,
        String imageUrl,
        boolean active,
        int displayOrder,
        long productCount
) {
}
