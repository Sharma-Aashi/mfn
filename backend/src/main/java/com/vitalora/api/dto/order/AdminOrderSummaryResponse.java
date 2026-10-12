package com.vitalora.api.dto.order;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Flat shape for the admin orders list. The full {@link OrderResponse} carries
 * items and address lines that are not needed to decide which row to open; a
 * compact summary keeps the table responsive at a hundred rows a page.
 */
public record AdminOrderSummaryResponse(
        Long id,
        String orderNumber,
        String status,
        String customerFullName,
        String customerEmail,
        String customerPhone,
        BigDecimal grandTotal,
        int itemCount,
        String paymentMethod,
        String paymentStatus,
        Instant createdAt
) {
}
