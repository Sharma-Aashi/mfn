package com.vitalora.api.dto.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ProductVariantRequest(
        /** Null for a new variant; set when editing an existing one. */
        Long id,
        @NotBlank(message = "Variant SKU is required") @Size(max = 60) String sku,
        @Size(max = 80) String flavour,
        @Size(max = 60) String sizeLabel,
        BigDecimal sizeValue,
        @Size(max = 20) String sizeUnit,
        @NotNull(message = "Variant price is required") @DecimalMin(value = "0.0", message = "Price must be positive") BigDecimal price,
        @DecimalMin(value = "0.0", message = "Sale price must be positive") BigDecimal salePrice,
        @Size(max = 500) String imageUrl,
        Boolean active,
        Boolean defaultVariant,
        Integer displayOrder,
        @NotNull(message = "Stock quantity is required") @Min(value = 0, message = "Stock cannot be negative") Integer stockQuantity,
        @Min(value = 0, message = "Threshold cannot be negative") Integer lowStockThreshold
) {
}
