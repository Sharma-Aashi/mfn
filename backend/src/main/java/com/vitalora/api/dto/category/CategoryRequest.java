package com.vitalora.api.dto.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
        @NotBlank(message = "Category name is required") @Size(max = 120) String name,
        @Size(max = 150) String slug,
        String description,
        String imageUrl,
        Boolean active,
        Integer displayOrder
) {
}
