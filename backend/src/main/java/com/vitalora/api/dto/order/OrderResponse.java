package com.vitalora.api.dto.order;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record OrderResponse(
        Long id,
        String orderNumber,
        String status,
        String customerFullName,
        String customerEmail,
        String customerPhone,
        String shippingAddressLine1,
        String shippingAddressLine2,
        String shippingCity,
        String shippingState,
        String shippingPostalCode,
        String shippingCountry,
        List<OrderItemResponse> items,
        BigDecimal subtotal,
        BigDecimal discountAmount,
        BigDecimal shippingAmount,
        BigDecimal taxAmount,
        BigDecimal grandTotal,
        String paymentMethod,
        String paymentStatus,
        LocalDate estimatedDeliveryDate,
        String customerNotes,
        Instant createdAt
) {
}
