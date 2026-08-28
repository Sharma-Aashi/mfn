package com.vitalora.api.service;

import com.vitalora.api.dto.common.PageResponse;
import com.vitalora.api.dto.inventory.InventoryResponse;
import com.vitalora.api.dto.inventory.StockUpdateRequest;

public interface InventoryService {
    PageResponse<InventoryResponse> search(String q, boolean lowStockOnly, int page, int size);

    InventoryResponse updateStock(Long productId, StockUpdateRequest request);
}
