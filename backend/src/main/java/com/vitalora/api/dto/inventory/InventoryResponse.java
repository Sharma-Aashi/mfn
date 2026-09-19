package com.vitalora.api.dto.inventory;

public record InventoryResponse(
        Long variantId,
        Long productId,
        String productName,
        String brandName,
        String variantLabel,
        String sku,
        String primaryImageUrl,
        int stockQuantity,
        int lowStockThreshold,
        boolean lowStock,
        boolean outOfStock,
        boolean productActive
) {
}
