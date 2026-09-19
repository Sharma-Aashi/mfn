package com.vitalora.api.dto.category;

import java.util.List;

public record CategoryResponse(
        Long id,
        String name,
        String slug,
        String description,
        String imageUrl,
        boolean active,
        int displayOrder,
        long productCount,
        Long parentId,
        String parentName,
        List<CategoryResponse> children
) {
}
