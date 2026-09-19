package com.vitalora.api.mapper;

import com.vitalora.api.dto.category.CategoryResponse;
import com.vitalora.api.entity.Category;

import java.util.List;

public final class CategoryMapper {

    private CategoryMapper() {
    }

    public static CategoryResponse toResponse(Category category, long productCount) {
        return toResponse(category, productCount, List.of());
    }

    public static CategoryResponse toResponse(Category category, long productCount, List<CategoryResponse> children) {
        Category parent = category.getParent();
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getImageUrl(),
                category.isActive(),
                category.getDisplayOrder(),
                productCount,
                parent != null ? parent.getId() : null,
                parent != null ? parent.getName() : null,
                children
        );
    }
}
