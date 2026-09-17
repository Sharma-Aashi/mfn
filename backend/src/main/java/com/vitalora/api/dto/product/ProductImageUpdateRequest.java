package com.vitalora.api.dto.product;

import jakarta.validation.constraints.Size;

/** Partial update for one product image; null fields are left unchanged. */
public record ProductImageUpdateRequest(
        @Size(max = 200) String altText,
        Boolean primary
) {
}
