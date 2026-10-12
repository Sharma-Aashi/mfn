package com.vitalora.api.dto.payment;

import jakarta.validation.constraints.NotBlank;

/**
 * The three values Razorpay's widget hands back to the browser on a successful
 * capture. The server re-signs {@code gatewayOrderId|gatewayPaymentId} with the
 * secret key and checks it matches {@code gatewaySignature}, which proves the
 * values came from Razorpay rather than a tampered client.
 */
public record VerifyPaymentRequest(
        @NotBlank String gatewayOrderId,
        @NotBlank String gatewayPaymentId,
        @NotBlank String gatewaySignature
) {
}
