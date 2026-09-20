package com.vitalora.api.dto.product;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProductSpecRequest(
        @NotBlank(message = "Spec label is required") @Size(max = 60) String label,
        @NotBlank(message = "Spec value is required") @Size(max = 120) String value,
        Integer displayOrder
) {
}
