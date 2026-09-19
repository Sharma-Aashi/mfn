package com.vitalora.api.dto.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
        @NotBlank(message = "Category name is required") @Size(max = 120) String name,
        @Size(max = 150) String slug,
        String description,
        String imageUrl,
        /** Null keeps the category top-level. */
        Long parentId,
        Boolean active,
        Integer displayOrder
) {
}
