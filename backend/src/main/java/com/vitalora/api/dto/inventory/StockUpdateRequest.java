package com.vitalora.api.dto.inventory;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record StockUpdateRequest(
        @NotNull(message = "Stock quantity is required") @Min(value = 0, message = "Stock cannot be negative") Integer stockQuantity,
        @Min(value = 0, message = "Threshold cannot be negative") Integer lowStockThreshold
) {
}
