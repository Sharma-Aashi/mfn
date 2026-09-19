package com.vitalora.api.dto.product;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

public record ProductRequest(
        @NotBlank(message = "Product name is required") @Size(max = 200) String name,
        @Size(max = 220) String slug,
        @NotBlank(message = "SKU is required") @Size(max = 60) String sku,
        @NotNull(message = "Brand is required") Long brandId,
        @Size(max = 500) String shortDescription,
        String description,
        String benefits,
        String ingredients,
        String nutritionalInfo,
        String usageInstructions,
        String warnings,
        @NotNull(message = "Price is required") @DecimalMin(value = "0.0", message = "Price must be positive") BigDecimal price,
        @DecimalMin(value = "0.0", message = "Sale price must be positive") BigDecimal salePrice,
        Boolean active,
        Boolean featured,
        Boolean bestSeller,
        Boolean newArrival,
        @Size(max = 500) String tags,
        Set<Long> categoryIds,
        /**
         * Leave empty for a single-SKU product: the service then keeps one
         * default variant in step with the product's own price and stock.
         */
        @Valid List<ProductVariantRequest> variants,
        @NotNull(message = "Stock quantity is required") @Min(value = 0, message = "Stock cannot be negative") Integer stockQuantity,
        @Min(value = 0, message = "Threshold cannot be negative") Integer lowStockThreshold
) {
}
