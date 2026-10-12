package com.vitalora.api.service.impl;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.vitalora.api.config.RazorpayProperties;
import com.vitalora.api.dto.order.OrderResponse;
import com.vitalora.api.dto.payment.CreateGatewayOrderResponse;
import com.vitalora.api.dto.payment.VerifyPaymentRequest;
import com.vitalora.api.entity.Order;
import com.vitalora.api.entity.Payment;
import com.vitalora.api.exception.BadRequestException;
import com.vitalora.api.exception.ResourceNotFoundException;
import com.vitalora.api.mapper.OrderMapper;
import com.vitalora.api.repository.OrderRepository;
import com.vitalora.api.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentServiceImpl.class);

    private final OrderRepository orderRepository;
    private final RazorpayProperties razorpay;

    @Override
    @Transactional
    public CreateGatewayOrderResponse createGatewayOrder(Long userId, Long orderId) {
        if (!razorpay.isConfigured()) {
            throw new BadRequestException("Online payments are not configured. Please choose Cash on Delivery.");
        }
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> ResourceNotFoundException.of("Order", orderId));
        Payment payment = order.getPayment();
        if (payment == null) {
            throw new BadRequestException("Order has no payment record.");
        }
        if (payment.getStatus() == Payment.PaymentStatus.COLLECTED) {
            throw new BadRequestException("This order has already been paid.");
        }
        if (!"ONLINE".equalsIgnoreCase(payment.getMethod()) && !"ONLINE".equalsIgnoreCase(order.getPaymentMethod())) {
            throw new BadRequestException("This order is marked COD. Nothing to pay online.");
        }

        // Razorpay expects an integer amount in paise.
        long amountPaise = order.getGrandTotal()
                .setScale(2, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .longValueExact();

        try {
            RazorpayClient client = new RazorpayClient(razorpay.getKeyId(), razorpay.getKeySecret());
            JSONObject req = new JSONObject();
            req.put("amount", amountPaise);
            req.put("currency", "INR");
            req.put("receipt", order.getOrderNumber());
            // Reference back to our order id and number so webhook handling can
            // find the row by either field.
            JSONObject notes = new JSONObject();
            notes.put("orderId", String.valueOf(order.getId()));
            notes.put("orderNumber", order.getOrderNumber());
            req.put("notes", notes);

            com.razorpay.Order gatewayOrder = client.orders.create(req);
            String gatewayOrderId = gatewayOrder.get("id");

            payment.setGatewayOrderId(gatewayOrderId);
            payment.setMethod("ONLINE");
            orderRepository.save(order);

            return new CreateGatewayOrderResponse(
                    razorpay.getKeyId(),
                    gatewayOrderId,
                    amountPaise,
                    "INR",
                    order.getOrderNumber(),
                    order.getGrandTotal()
            );
        } catch (RazorpayException e) {
            log.error("Razorpay order creation failed for {}", order.getOrderNumber(), e);
            throw new BadRequestException("Could not start the payment: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public OrderResponse verifyAndCapture(Long userId, Long orderId, VerifyPaymentRequest request) {
        if (!razorpay.isConfigured()) {
            throw new BadRequestException("Online payments are not configured.");
        }
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> ResourceNotFoundException.of("Order", orderId));
        Payment payment = order.getPayment();
        if (payment == null) {
            throw new BadRequestException("Order has no payment record.");
        }
        if (payment.getStatus() == Payment.PaymentStatus.COLLECTED) {
            // Idempotent: a double-tap of the Verify button on a flaky network
            // doesn't need to re-check anything.
            return OrderMapper.toResponse(order);
        }
        // The signed payload is {gatewayOrderId}|{gatewayPaymentId}, both of
        // which must match what we reserved. If the client swaps order id,
        // the HMAC won't match the signature it also sends.
        if (payment.getGatewayOrderId() == null
                || !payment.getGatewayOrderId().equals(request.gatewayOrderId())) {
            throw new BadRequestException("Payment session mismatch.");
        }

        JSONObject verifyPayload = new JSONObject();
        verifyPayload.put("razorpay_order_id", request.gatewayOrderId());
        verifyPayload.put("razorpay_payment_id", request.gatewayPaymentId());
        verifyPayload.put("razorpay_signature", request.gatewaySignature());

        boolean ok;
        try {
            ok = Utils.verifyPaymentSignature(verifyPayload, razorpay.getKeySecret());
        } catch (RazorpayException e) {
            log.error("Razorpay verify threw for {}", order.getOrderNumber(), e);
            ok = false;
        }

        if (!ok) {
            payment.setStatus(Payment.PaymentStatus.FAILED);
            payment.setGatewayPaymentId(request.gatewayPaymentId());
            payment.setGatewaySignature(request.gatewaySignature());
            orderRepository.save(order);
            throw new BadRequestException("Payment signature could not be verified.");
        }

        payment.setStatus(Payment.PaymentStatus.COLLECTED);
        payment.setGatewayPaymentId(request.gatewayPaymentId());
        payment.setGatewaySignature(request.gatewaySignature());
        payment.setTransactionRef(request.gatewayPaymentId());
        payment.setPaidAt(Instant.now());
        order.setStatus(Order.OrderStatus.CONFIRMED);
        orderRepository.save(order);

        return OrderMapper.toResponse(order);
    }
}
