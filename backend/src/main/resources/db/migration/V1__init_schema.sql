-- =====================================================================
-- VITALORA - Initial normalized schema
-- =====================================================================

-- ---------------------------------------------------------------------
-- roles / users
-- ---------------------------------------------------------------------
CREATE TABLE roles (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        VARCHAR(30) NOT NULL UNIQUE CHECK (name IN ('ADMIN', 'CUSTOMER'))
);

CREATE TABLE users (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name       VARCHAR(150) NOT NULL,
    email           VARCHAR(180) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    phone           VARCHAR(20),
    role_id         BIGINT NOT NULL REFERENCES roles(id),
    is_enabled      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_users_role ON users(role_id);

CREATE TABLE password_reset_tokens (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(255) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    used        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_password_reset_user ON password_reset_tokens(user_id);

-- ---------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------
CREATE TABLE categories (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name            VARCHAR(120) NOT NULL,
    slug            VARCHAR(150) NOT NULL UNIQUE,
    description     TEXT,
    image_url       VARCHAR(500),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    display_order   INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------
CREATE TABLE products (
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name                    VARCHAR(200) NOT NULL,
    slug                    VARCHAR(220) NOT NULL UNIQUE,
    sku                     VARCHAR(60) NOT NULL UNIQUE,
    short_description       VARCHAR(500),
    description             TEXT,
    benefits                TEXT,
    ingredients             TEXT,
    nutritional_info        TEXT,
    usage_instructions      TEXT,
    warnings                TEXT,
    price                   NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    sale_price              NUMERIC(10,2) CHECK (sale_price IS NULL OR sale_price >= 0),
    currency                VARCHAR(3) NOT NULL DEFAULT 'INR',
    is_active               BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured             BOOLEAN NOT NULL DEFAULT FALSE,
    is_best_seller          BOOLEAN NOT NULL DEFAULT FALSE,
    is_new_arrival          BOOLEAN NOT NULL DEFAULT FALSE,
    avg_rating              NUMERIC(3,2) NOT NULL DEFAULT 0,
    review_count            INTEGER NOT NULL DEFAULT 0,
    tags                    VARCHAR(500),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_best_seller ON products(is_best_seller) WHERE is_best_seller = TRUE;
CREATE INDEX idx_products_new_arrival ON products(is_new_arrival) WHERE is_new_arrival = TRUE;
CREATE INDEX idx_products_name_trgm ON products USING btree (lower(name));

CREATE TABLE product_images (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id      BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url       VARCHAR(500) NOT NULL,
    alt_text        VARCHAR(200),
    display_order   INTEGER NOT NULL DEFAULT 0,
    is_primary      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_product_images_product ON product_images(product_id);

CREATE TABLE product_categories (
    product_id      BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    category_id     BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);
CREATE INDEX idx_product_categories_category ON product_categories(category_id);

CREATE TABLE inventory (
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id              BIGINT NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
    stock_quantity          INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    low_stock_threshold     INTEGER NOT NULL DEFAULT 15,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- addresses
-- ---------------------------------------------------------------------
CREATE TABLE addresses (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name       VARCHAR(150) NOT NULL,
    phone           VARCHAR(20) NOT NULL,
    address_line1   VARCHAR(255) NOT NULL,
    address_line2   VARCHAR(255),
    city            VARCHAR(100) NOT NULL,
    state           VARCHAR(100) NOT NULL,
    postal_code     VARCHAR(20) NOT NULL,
    country         VARCHAR(100) NOT NULL DEFAULT 'India',
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_addresses_user ON addresses(user_id);

-- ---------------------------------------------------------------------
-- cart / cart_items
-- ---------------------------------------------------------------------
CREATE TABLE carts (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cart_items (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cart_id         BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id      BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (cart_id, product_id)
);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);

-- ---------------------------------------------------------------------
-- wishlist / wishlist_items
-- ---------------------------------------------------------------------
CREATE TABLE wishlists (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE wishlist_items (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    wishlist_id     BIGINT NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
    product_id      BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (wishlist_id, product_id)
);
CREATE INDEX idx_wishlist_items_wishlist ON wishlist_items(wishlist_id);

-- ---------------------------------------------------------------------
-- orders / order_items / payments
-- ---------------------------------------------------------------------
CREATE TABLE orders (
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_number            VARCHAR(40) NOT NULL UNIQUE,
    user_id                 BIGINT NOT NULL REFERENCES users(id),
    status                  VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                                CHECK (status IN ('PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED')),
    customer_full_name      VARCHAR(150) NOT NULL,
    customer_email          VARCHAR(180) NOT NULL,
    customer_phone          VARCHAR(20) NOT NULL,
    shipping_address_line1  VARCHAR(255) NOT NULL,
    shipping_address_line2  VARCHAR(255),
    shipping_city           VARCHAR(100) NOT NULL,
    shipping_state          VARCHAR(100) NOT NULL,
    shipping_postal_code    VARCHAR(20) NOT NULL,
    shipping_country        VARCHAR(100) NOT NULL DEFAULT 'India',
    subtotal                NUMERIC(10,2) NOT NULL,
    discount_amount         NUMERIC(10,2) NOT NULL DEFAULT 0,
    shipping_amount         NUMERIC(10,2) NOT NULL DEFAULT 0,
    tax_amount              NUMERIC(10,2) NOT NULL DEFAULT 0,
    grand_total             NUMERIC(10,2) NOT NULL,
    payment_method          VARCHAR(20) NOT NULL DEFAULT 'COD' CHECK (payment_method IN ('COD')),
    estimated_delivery_date DATE,
    customer_notes          VARCHAR(500),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

CREATE TABLE order_items (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id        BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id      BIGINT REFERENCES products(id) ON DELETE SET NULL,
    product_name    VARCHAR(200) NOT NULL,
    product_image   VARCHAR(500),
    sku             VARCHAR(60),
    unit_price      NUMERIC(10,2) NOT NULL,
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    line_total      NUMERIC(10,2) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_order_items_order ON order_items(order_id);

CREATE TABLE payments (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id        BIGINT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    method          VARCHAR(20) NOT NULL DEFAULT 'COD' CHECK (method IN ('COD')),
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','COLLECTED','FAILED')),
    amount          NUMERIC(10,2) NOT NULL,
    transaction_ref VARCHAR(100),
    paid_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------
CREATE TABLE reviews (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id      BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating          INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title           VARCHAR(150),
    comment         TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED')),
    is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (product_id, user_id)
);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_status ON reviews(status);

-- ---------------------------------------------------------------------
-- faqs
-- ---------------------------------------------------------------------
CREATE TABLE faqs (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    question        VARCHAR(300) NOT NULL,
    answer          TEXT NOT NULL,
    category        VARCHAR(40) NOT NULL DEFAULT 'GENERAL'
                        CHECK (category IN ('PRODUCTS','ORDERS','SHIPPING','RETURNS','PAYMENTS','USAGE','GENERAL')),
    display_order   INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_faqs_category ON faqs(category);

-- ---------------------------------------------------------------------
-- cms_content (section-keyed lightweight CMS) / banners
-- ---------------------------------------------------------------------
CREATE TABLE cms_content (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    page_key        VARCHAR(40) NOT NULL,
    section_key     VARCHAR(80) NOT NULL,
    content_json    TEXT NOT NULL,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (page_key, section_key)
);
CREATE INDEX idx_cms_content_page ON cms_content(page_key);

CREATE TABLE banners (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title           VARCHAR(200) NOT NULL,
    subtitle        VARCHAR(300),
    image_url       VARCHAR(500),
    cta_text        VARCHAR(60),
    cta_link        VARCHAR(255),
    display_order   INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    starts_at       TIMESTAMPTZ,
    ends_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- contact_messages
-- ---------------------------------------------------------------------
CREATE TABLE contact_messages (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    email           VARCHAR(180) NOT NULL,
    phone           VARCHAR(20),
    subject         VARCHAR(200) NOT NULL,
    message         TEXT NOT NULL,
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
