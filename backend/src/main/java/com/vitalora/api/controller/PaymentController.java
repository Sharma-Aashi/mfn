package com.vitalora.api.controller;

import com.vitalora.api.dto.order.OrderResponse;
import com.vitalora.api.dto.payment.CreateGatewayOrderResponse;
import com.vitalora.api.dto.payment.VerifyPaymentRequest;
import com.vitalora.api.security.SecurityUserDetails;
import com.vitalora.api.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Two steps, one per endpoint:
 *  1) POST /api/payments/orders/{id}/create — reserve a Razorpay order and
 *     send back everything the browser widget needs.
 *  2) POST /api/payments/orders/{id}/verify — HMAC-verify the widget's
 *     callback payload and move the order to CONFIRMED on a match.
 * Both are scoped to the signed-in customer who owns the order.
 */
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/orders/{id}/create")
    public ResponseEntity<CreateGatewayOrderResponse> createGatewayOrder(
            @AuthenticationPrincipal SecurityUserDetails principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(paymentService.createGatewayOrder(principal.getId(), id));
    }

    @PostMapping("/orders/{id}/verify")
    public ResponseEntity<OrderResponse> verify(
            @AuthenticationPrincipal SecurityUserDetails principal,
            @PathVariable Long id,
            @Valid @RequestBody VerifyPaymentRequest request) {
        return ResponseEntity.ok(paymentService.verifyAndCapture(principal.getId(), id, request));
    }
}
