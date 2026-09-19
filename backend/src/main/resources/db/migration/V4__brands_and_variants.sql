-- =====================================================================
-- Marketplace foundation: multiple brands, nested categories, and
-- per-variant (flavour x size) SKUs with their own price and stock.
--
-- Before this migration a product WAS the sellable unit: one SKU, one
-- price, one inventory row. Selling whey in 4 flavours x 3 sizes would
-- have meant 12 unrelated products. product_variants makes the variant
-- the sellable unit; the product becomes the thing a customer browses.
-- =====================================================================

-- ---------------------------------------------------------------------
-- brands
-- ---------------------------------------------------------------------
CREATE TABLE brands (
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name                    VARCHAR(120) NOT NULL,
    slug                    VARCHAR(150) NOT NULL UNIQUE,
    description             TEXT,
    logo_url                VARCHAR(500),
    banner_url              VARCHAR(500),
    country_of_origin       VARCHAR(100),
    website_url             VARCHAR(255),
    -- Our own label. Margins on resold brands are thin and on house
    -- products they are not, so the storefront needs to know which is
    -- which without hard-coding a name.
    is_house_brand          BOOLEAN NOT NULL DEFAULT FALSE,
    -- Reselling another company's brand requires documentation. Flag it
    -- per brand so the "100% Genuine" badge is never shown on a brand we
    -- cannot back up.
    is_authorized_reseller  BOOLEAN NOT NULL DEFAULT FALSE,
    is_active               BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured             BOOLEAN NOT NULL DEFAULT FALSE,
    display_order           INTEGER NOT NULL DEFAULT 0,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_brands_active ON brands(is_active);
CREATE INDEX idx_brands_featured ON brands(is_featured) WHERE is_featured = TRUE;

-- The house brand. Every other brand is added by an admin once the
-- reseller paperwork for it exists.
INSERT INTO brands (name, slug, description, country_of_origin, is_house_brand, is_authorized_reseller, is_active, is_featured, display_order)
VALUES (
    'Muscle Freak Nutrition',
    'muscle-freak-nutrition',
    $$Our own label: formulas we develop, test and stand behind directly.$$,
    'India',
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    0
);

-- ---------------------------------------------------------------------
-- products.brand_id
-- ---------------------------------------------------------------------
ALTER TABLE products ADD COLUMN brand_id BIGINT REFERENCES brands(id);

-- Everything that already exists was ours.
UPDATE products
SET brand_id = (SELECT id FROM brands WHERE slug = 'muscle-freak-nutrition');

ALTER TABLE products ALTER COLUMN brand_id SET NOT NULL;
CREATE INDEX idx_products_brand ON products(brand_id);

-- ---------------------------------------------------------------------
-- nested categories: Sports Nutrition > Proteins > Whey Isolate
-- ---------------------------------------------------------------------
ALTER TABLE categories ADD COLUMN parent_id BIGINT REFERENCES categories(id) ON DELETE SET NULL;
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- ---------------------------------------------------------------------
-- product_variants
-- ---------------------------------------------------------------------
CREATE TABLE product_variants (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id      BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku             VARCHAR(60) NOT NULL UNIQUE,
    flavour         VARCHAR(80),
    -- What the customer reads on the selector: "1 kg", "2 lb", "60 caps".
    size_label      VARCHAR(60),
    -- The same size as a number, so "sort by size" and range filters do
    -- not have to parse the label.
    size_value      NUMERIC(10,3),
    size_unit       VARCHAR(20),
    price           NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    sale_price      NUMERIC(10,2) CHECK (sale_price IS NULL OR sale_price >= 0),
    image_url       VARCHAR(500),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    display_order   INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (product_id, flavour, size_label)
);
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_product_variants_active ON product_variants(is_active);
CREATE INDEX idx_product_variants_flavour ON product_variants(lower(flavour));
CREATE INDEX idx_product_variants_size ON product_variants(size_unit, size_value);

-- At most one default per product.
CREATE UNIQUE INDEX idx_product_variants_one_default
    ON product_variants(product_id) WHERE is_default = TRUE;

-- Every existing product becomes a single-variant product carrying its
-- own SKU and price, so nothing that is already in a cart or an order
-- changes meaning.
INSERT INTO product_variants (product_id, sku, flavour, size_label, price, sale_price, is_active, is_default, display_order)
SELECT id, sku, NULL, 'Standard', price, sale_price, is_active, TRUE, 0
FROM products;

-- ---------------------------------------------------------------------
-- inventory moves from product level to variant level
-- ---------------------------------------------------------------------
ALTER TABLE inventory ADD COLUMN variant_id BIGINT REFERENCES product_variants(id) ON DELETE CASCADE;

UPDATE inventory i
SET variant_id = v.id
FROM product_variants v
WHERE v.product_id = i.product_id;

-- A product that somehow had no inventory row still needs one per variant.
INSERT INTO inventory (variant_id, stock_quantity, low_stock_threshold)
SELECT v.id, 0, 15
FROM product_variants v
WHERE NOT EXISTS (SELECT 1 FROM inventory i WHERE i.variant_id = v.id);

DELETE FROM inventory WHERE variant_id IS NULL;

ALTER TABLE inventory ALTER COLUMN variant_id SET NOT NULL;
-- Dropping the column takes its UNIQUE constraint with it.
ALTER TABLE inventory DROP COLUMN product_id;
ALTER TABLE inventory ADD CONSTRAINT inventory_variant_id_key UNIQUE (variant_id);

-- ---------------------------------------------------------------------
-- cart_items now hold a variant, not a product
-- ---------------------------------------------------------------------
ALTER TABLE cart_items ADD COLUMN variant_id BIGINT REFERENCES product_variants(id) ON DELETE CASCADE;

UPDATE cart_items c
SET variant_id = v.id
FROM product_variants v
WHERE v.product_id = c.product_id AND v.is_default = TRUE;

DELETE FROM cart_items WHERE variant_id IS NULL;

ALTER TABLE cart_items ALTER COLUMN variant_id SET NOT NULL;
ALTER TABLE cart_items DROP COLUMN product_id;
ALTER TABLE cart_items ADD CONSTRAINT cart_items_cart_id_variant_id_key UNIQUE (cart_id, variant_id);

-- ---------------------------------------------------------------------
-- order_items keep their product snapshot and gain a variant one
-- ---------------------------------------------------------------------
ALTER TABLE order_items ADD COLUMN variant_id BIGINT REFERENCES product_variants(id) ON DELETE SET NULL;
ALTER TABLE order_items ADD COLUMN variant_label VARCHAR(120);
ALTER TABLE order_items ADD COLUMN brand_name VARCHAR(120);

UPDATE order_items o
SET variant_id = v.id
FROM product_variants v
WHERE v.product_id = o.product_id AND v.is_default = TRUE;

UPDATE order_items o
SET brand_name = b.name
FROM products p
JOIN brands b ON b.id = p.brand_id
WHERE p.id = o.product_id AND o.brand_name IS NULL;
