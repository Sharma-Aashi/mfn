-- =====================================================================
-- At-a-glance product facts.
--
-- Deliberately label/value pairs rather than fixed columns. A whey needs
-- "Protein per serve: 25 g", a multivitamin needs "Capsules: 60", an
-- ashwagandha needs "Extract: 600 mg KSM-66". Columns that suit one
-- category are dead weight on the others, and every new category would
-- otherwise mean another migration.
--
-- No rows are seeded: the existing catalogue records this as free text
-- in nutritional_info, and parsing numbers out of prose would invent
-- facts. An admin fills these in, and the strip only renders once they
-- exist.
-- =====================================================================

CREATE TABLE product_specs (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id      BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    label           VARCHAR(60) NOT NULL,
    value           VARCHAR(120) NOT NULL,
    display_order   INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_specs_product ON product_specs(product_id, display_order);
