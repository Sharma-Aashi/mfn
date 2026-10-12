package com.vitalora.api.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String method = "COD";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "transaction_ref", length = 100)
    private String transactionRef;

    /** Razorpay order id ("order_…"), handed to the widget to open a session. */
    @Column(name = "gateway_order_id", length = 100)
    private String gatewayOrderId;

    /** Razorpay payment id ("pay_…") the widget returns on a successful capture. */
    @Column(name = "gateway_payment_id", length = 100)
    private String gatewayPaymentId;

    /** HMAC Razorpay signs {gatewayOrderId}|{gatewayPaymentId} with. We re-sign
     *  server-side to prove the client isn't lying. */
    @Column(name = "gateway_signature", length = 255)
    private String gatewaySignature;

    @Column(name = "paid_at")
    private Instant paidAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public enum PaymentStatus {
        PENDING, COLLECTED, FAILED
    }
}
