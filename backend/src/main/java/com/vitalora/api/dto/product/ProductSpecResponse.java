package com.vitalora.api.dto.product;

public record ProductSpecResponse(
        Long id,
        String label,
        String value,
        int displayOrder
) {
}
