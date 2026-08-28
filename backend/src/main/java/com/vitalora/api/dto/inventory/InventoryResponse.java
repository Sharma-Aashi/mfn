package com.vitalora.api.dto.inventory;

public record InventoryResponse(
        Long productId,
        String productName,
        String sku,
        String primaryImageUrl,
        int stockQuantity,
        int lowStockThreshold,
        boolean lowStock,
        boolean outOfStock,
        boolean productActive
) {
}
