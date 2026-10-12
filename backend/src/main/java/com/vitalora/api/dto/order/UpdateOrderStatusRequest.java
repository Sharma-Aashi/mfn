package com.vitalora.api.dto.order;

import jakarta.validation.constraints.NotBlank;

/**
 * Body for PATCH /api/admin/orders/{id}/status. The value is checked against
 * {@code Order.OrderStatus} in the service, so an unknown status surfaces as
 * a 400 rather than a silent no-op.
 */
public record UpdateOrderStatusRequest(@NotBlank String status) {
}
