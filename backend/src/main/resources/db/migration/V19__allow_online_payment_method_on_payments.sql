-- Mirror of V18 on the sibling `payments` table. V1 locked payments.method to
-- a single-value CHECK, so an ONLINE payment row fails the insert even though
-- V18 already relaxed the parent orders row.

ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_method_check;

ALTER TABLE payments
    ADD CONSTRAINT payments_method_check CHECK (method IN ('COD', 'ONLINE'));
