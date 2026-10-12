package com.vitalora.api.controller;

import com.vitalora.api.dto.common.PageResponse;
import com.vitalora.api.dto.order.AdminOrderSummaryResponse;
import com.vitalora.api.dto.order.OrderResponse;
import com.vitalora.api.dto.order.UpdateOrderStatusRequest;
import com.vitalora.api.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Admin orders — list, inspect, change status. The customer-facing
 * {@link OrderController} stays scoped to the signed-in user; this one has no
 * user filter and is routed under {@code /api/admin/**}, which the
 * {@code SecurityConfig} catch-all restricts to ROLE_ADMIN.
 */
@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<PageResponse<AdminOrderSummaryResponse>> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(orderService.listForAdmin(q, status, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getForAdmin(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateStatus(@PathVariable Long id,
                                                     @Valid @RequestBody UpdateOrderStatusRequest body) {
        return ResponseEntity.ok(orderService.updateStatus(id, body.status()));
    }
}
