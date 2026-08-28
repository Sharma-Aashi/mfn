package com.vitalora.api.dto.product;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record ProductImageOrderRequest(
        @NotEmpty(message = "Image order list cannot be empty") List<Long> imageIds
) {
}
