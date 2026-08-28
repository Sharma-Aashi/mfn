package com.vitalora.api.service.impl;

import com.vitalora.api.dto.common.PageResponse;
import com.vitalora.api.dto.inventory.InventoryResponse;
import com.vitalora.api.dto.inventory.StockUpdateRequest;
import com.vitalora.api.entity.Inventory;
import com.vitalora.api.entity.Product;
import com.vitalora.api.exception.ResourceNotFoundException;
import com.vitalora.api.mapper.ProductMapper;
import com.vitalora.api.repository.InventoryRepository;
import com.vitalora.api.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<InventoryResponse> search(String q, boolean lowStockOnly, int page, int size) {
        String query = (q == null || q.isBlank()) ? "" : q.trim();
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "stockQuantity"));
        return PageResponse.of(inventoryRepository.search(query, lowStockOnly, pageable), this::toResponse);
    }

    @Override
    @Transactional
    public InventoryResponse updateStock(Long productId, StockUpdateRequest request) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> ResourceNotFoundException.of("Inventory for product", productId));

        inventory.setStockQuantity(request.stockQuantity());
        if (request.lowStockThreshold() != null) {
            inventory.setLowStockThreshold(request.lowStockThreshold());
        }
        return toResponse(inventoryRepository.save(inventory));
    }

    private InventoryResponse toResponse(Inventory inventory) {
        Product product = inventory.getProduct();
        return new InventoryResponse(
                product.getId(),
                product.getName(),
                product.getSku(),
                ProductMapper.primaryImageUrl(product),
                inventory.getStockQuantity(),
                inventory.getLowStockThreshold(),
                inventory.isLowStock(),
                inventory.isOutOfStock(),
                product.isActive()
        );
    }
}
