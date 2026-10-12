-- Payment gateway support. The old payments row only had the COD-era
-- transaction_ref string; a gateway flow needs three distinct columns:
--  * gateway_order_id   — the "rzp_order_..." we hand to the client widget
--  * gateway_payment_id — the "rzp_pay_..." the widget sends back on success
--  * gateway_signature  — the HMAC Razorpay signs that trio with, which we
--    re-compute server-side to prove the client isn't lying about either.

ALTER TABLE payments
    ADD COLUMN gateway_order_id   VARCHAR(100),
    ADD COLUMN gateway_payment_id VARCHAR(100),
    ADD COLUMN gateway_signature  VARCHAR(255);

CREATE INDEX idx_payments_gateway_order_id ON payments(gateway_order_id);
