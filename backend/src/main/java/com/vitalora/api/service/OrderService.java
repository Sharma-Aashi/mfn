package com.vitalora.api.service;

import com.vitalora.api.dto.common.PageResponse;
import com.vitalora.api.dto.order.AdminOrderSummaryResponse;
import com.vitalora.api.dto.order.CreateOrderRequest;
import com.vitalora.api.dto.order.OrderResponse;

public interface OrderService {
    PageResponse<OrderResponse> getOrders(Long userId, int page, int size);

    OrderResponse getOrder(Long userId, Long id);

    OrderResponse getOrderByNumber(Long userId, String orderNumber);

    OrderResponse createOrder(Long userId, CreateOrderRequest request);

    // ---- Admin ----
    PageResponse<AdminOrderSummaryResponse> listForAdmin(String q, String status, int page, int size);

    OrderResponse getForAdmin(Long id);

    OrderResponse updateStatus(Long id, String newStatus);
}
