package com.vitalora.api.service;

import com.vitalora.api.dto.payment.CreateGatewayOrderResponse;
import com.vitalora.api.dto.payment.VerifyPaymentRequest;
import com.vitalora.api.dto.order.OrderResponse;

public interface PaymentService {

    /**
     * Reserve a Razorpay order for the given {@link com.vitalora.api.entity.Order}
     * and return everything the browser widget needs to open. The order must
     * belong to {@code userId} and still be awaiting payment (COD orders are
     * rejected — nothing to collect online).
     */
    CreateGatewayOrderResponse createGatewayOrder(Long userId, Long orderId);

    /**
     * Verify the HMAC the widget hands back and mark the order CONFIRMED on a
     * match. On mismatch the payment is marked FAILED and the method throws
     * so the caller returns 400 instead of silently finishing a bad order.
     */
    OrderResponse verifyAndCapture(Long userId, Long orderId, VerifyPaymentRequest request);
}
