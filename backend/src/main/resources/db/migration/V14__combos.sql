-- =====================================================================
-- Stacks: two or three products sold together at one price.
--
-- A combo is a PRODUCT, not a new sellable concept. It gets its own
-- variant, its own price and its own stock, so the cart, checkout, order
-- and inventory code all work on it unchanged - none of which would be
-- true of a separate combos table that the cart then had to learn about.
--
-- combo_items only records what is inside, for two reasons: the card can
-- show the component packs, and the "was" price can be summed from the
-- components instead of being typed in a second time. A struck-through
-- price that is stored separately from the products it refers to drifts
-- the first time somebody re-prices one of them.
-- =====================================================================

ALTER TABLE products ADD COLUMN is_combo BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX idx_products_combo ON products(is_combo) WHERE is_combo = TRUE;

CREATE TABLE combo_items (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    -- the combo product itself
    product_id      BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    -- one of the things inside it
    variant_id      BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity        INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    display_order   INTEGER NOT NULL DEFAULT 0,
    UNIQUE (product_id, variant_id)
);
CREATE INDEX idx_combo_items_product ON combo_items(product_id, display_order);

-- RESTRICT on variant_id, not CASCADE: deleting a variant that a live
-- combo still advertises should fail loudly rather than quietly leaving
-- a stack that no longer contains what its picture shows.
