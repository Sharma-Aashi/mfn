package com.vitalora.api.controller;

import com.vitalora.api.dto.common.PageResponse;
import com.vitalora.api.dto.order.CreateOrderRequest;
import com.vitalora.api.dto.order.OrderResponse;
import com.vitalora.api.security.SecurityUserDetails;
import com.vitalora.api.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<PageResponse<OrderResponse>> getOrders(
            @AuthenticationPrincipal SecurityUserDetails principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.getOrders(principal.getId(), page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrder(@AuthenticationPrincipal SecurityUserDetails principal,
                                                    @PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrder(principal.getId(), id));
    }

    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<OrderResponse> getOrderByNumber(@AuthenticationPrincipal SecurityUserDetails principal,
                                                             @PathVariable String orderNumber) {
        return ResponseEntity.ok(orderService.getOrderByNumber(principal.getId(), orderNumber));
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@AuthenticationPrincipal SecurityUserDetails principal,
                                                        @Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(principal.getId(), request));
    }
}
