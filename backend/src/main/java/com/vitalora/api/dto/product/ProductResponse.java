package com.vitalora.api.dto.product;

import com.vitalora.api.dto.category.CategoryResponse;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record ProductResponse(
        Long id,
        String name,
        String slug,
        String sku,
        String shortDescription,
        String description,
        String benefits,
        String ingredients,
        String nutritionalInfo,
        String usageInstructions,
        String warnings,
        BigDecimal price,
        BigDecimal salePrice,
        BigDecimal effectivePrice,
        String currency,
        boolean active,
        boolean featured,
        boolean bestSeller,
        boolean newArrival,
        BigDecimal avgRating,
        int reviewCount,
        String tags,
        int stockQuantity,
        int lowStockThreshold,
        boolean inStock,
        List<ProductImageResponse> images,
        List<CategoryResponse> categories,
        Instant createdAt,
        Instant updatedAt
) {
}
