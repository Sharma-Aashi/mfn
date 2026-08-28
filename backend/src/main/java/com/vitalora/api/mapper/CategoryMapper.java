package com.vitalora.api.mapper;

import com.vitalora.api.dto.category.CategoryResponse;
import com.vitalora.api.entity.Category;

public final class CategoryMapper {

    private CategoryMapper() {
    }

    public static CategoryResponse toResponse(Category category, long productCount) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getImageUrl(),
                category.isActive(),
                category.getDisplayOrder(),
                productCount
        );
    }
}
