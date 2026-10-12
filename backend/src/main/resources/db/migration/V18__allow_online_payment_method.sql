-- V1 locked payment_method to a single value ('COD') via a CHECK constraint,
-- made when COD was the only option on the roadmap. Online payments through
-- Razorpay now add 'ONLINE' to the vocabulary. Drop the old check and
-- replace it with one that admits both.

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;

ALTER TABLE orders
    ADD CONSTRAINT orders_payment_method_check CHECK (payment_method IN ('COD', 'ONLINE'));
