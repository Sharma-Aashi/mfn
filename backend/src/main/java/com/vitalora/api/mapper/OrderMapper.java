package com.vitalora.api.mapper;

import com.vitalora.api.dto.order.OrderItemResponse;
import com.vitalora.api.dto.order.OrderResponse;
import com.vitalora.api.entity.Order;
import com.vitalora.api.entity.OrderItem;
import com.vitalora.api.entity.Payment;

public final class OrderMapper {

    private OrderMapper() {
    }

    public static OrderResponse toResponse(Order order) {
        Payment payment = order.getPayment();
        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getStatus().name(),
                order.getCustomerFullName(),
                order.getCustomerEmail(),
                order.getCustomerPhone(),
                order.getShippingAddressLine1(),
                order.getShippingAddressLine2(),
                order.getShippingCity(),
                order.getShippingState(),
                order.getShippingPostalCode(),
                order.getShippingCountry(),
                order.getItems().stream().map(OrderMapper::toItemResponse).toList(),
                order.getSubtotal(),
                order.getDiscountAmount(),
                order.getShippingAmount(),
                order.getTaxAmount(),
                order.getGrandTotal(),
                order.getPaymentMethod(),
                payment != null ? payment.getStatus().name() : "PENDING",
                order.getEstimatedDeliveryDate(),
                order.getCustomerNotes(),
                order.getCreatedAt()
        );
    }

    private static OrderItemResponse toItemResponse(OrderItem item) {
        return new OrderItemResponse(
                item.getProduct() != null ? item.getProduct().getId() : null,
                item.getProduct() != null ? item.getProduct().getSlug() : null,
                item.getProductName(),
                item.getBrandName(),
                item.getVariantLabel(),
                item.getProductImage(),
                item.getSku(),
                item.getUnitPrice(),
                item.getQuantity(),
                item.getLineTotal()
        );
    }
}
