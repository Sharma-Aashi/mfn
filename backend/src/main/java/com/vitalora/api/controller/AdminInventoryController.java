package com.vitalora.api.controller;

import com.vitalora.api.dto.common.PageResponse;
import com.vitalora.api.dto.inventory.InventoryResponse;
import com.vitalora.api.dto.inventory.StockUpdateRequest;
import com.vitalora.api.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/inventory")
@RequiredArgsConstructor
public class AdminInventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<PageResponse<InventoryResponse>> search(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "false") boolean lowStockOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(inventoryService.search(q, lowStockOnly, page, size));
    }

    @PatchMapping("/{productId}")
    public ResponseEntity<InventoryResponse> updateStock(@PathVariable Long productId,
                                                            @Valid @RequestBody StockUpdateRequest request) {
        return ResponseEntity.ok(inventoryService.updateStock(productId, request));
    }
}
