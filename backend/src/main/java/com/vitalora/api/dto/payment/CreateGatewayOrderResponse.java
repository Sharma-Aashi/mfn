package com.vitalora.api.dto.payment;

import java.math.BigDecimal;

/**
 * Everything the Razorpay checkout widget needs to open: the publishable key,
 * the gateway order id we just reserved, and the amount in paise. The browser
 * posts this back along with a signature once the user pays.
 */
public record CreateGatewayOrderResponse(
        String keyId,
        String gatewayOrderId,
        long amount,          // paise (INR * 100), what the widget expects
        String currency,
        String orderNumber,   // our local order number — for display + logging
        BigDecimal grandTotal // rupees — for the "You will pay ₹X" line
) {
}
