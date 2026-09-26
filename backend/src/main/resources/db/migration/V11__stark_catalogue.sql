-- =====================================================================
-- The Stark catalogue: four products, twelve sellable variants.
--
-- Every product is created INACTIVE and priced at 0. Prices are not
-- printed on the packs, so setting one here would be guessing at
-- somebody else's margins; the owner fills price and stock in the admin
-- and flips the Active switch, and nothing reaches the storefront until
-- they do.
--
-- Copy and per-serving figures are transcribed from the pack labels.
-- Where a panel could not be read with confidence the field is left
-- empty rather than approximated - an invented supplement fact is worse
-- than a missing one.
--
-- Images ship with the frontend under /assets/products/ rather than the
-- API's upload folder, which is wiped whenever the container restarts.
--
-- Re-runnable: every insert is guarded on its natural key.
-- =====================================================================

-- ---------------------------------------------------------------------
-- brand
-- ---------------------------------------------------------------------
-- is_authorized_reseller stays FALSE. It drives the public "100% Genuine"
-- badge, and that claim is the owner's to make, not this migration's.
INSERT INTO brands (name, slug, description, is_house_brand, is_authorized_reseller, is_active, is_featured, display_order)
VALUES (
    'Stark',
    'stark',
    $$Stark Athlete Series: protein, pre-workout and performance formulas with fully disclosed labels.$$,
    FALSE, FALSE, TRUE, TRUE, 1
)
ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------
INSERT INTO products (name, slug, sku, short_description, description, benefits, price, is_active, brand_id)
SELECT p.name, p.slug, p.sku, p.short_desc, p.descr, p.benefits, 0, FALSE, b.id
FROM (VALUES
    (
        'Stark Athlete Isolate Protein Peptides',
        'stark-athlete-isolate-protein-peptides',
        'STK-ISO-5LB',
        'Whey isolate peptides with 25 g protein per scoop and 73 servings per 5 lb tub, in seven flavours.',
        $$Stark Athlete Series Isolate delivers 25 g of protein per scoop from whey protein isolate and hydrolysed peptides, with 73 servings in a 5 lb (2.27 kg) tub. Available in seven flavours.$$,
        $$25 g protein per scoop
73 servings per container
Whey isolate and hydrolysed peptides$$
    ),
    (
        'Stark C-LEAN Prime Pre-Workout',
        'stark-c-lean-prime-pre-workout',
        'STK-CLP-390',
        'Fully disclosed pre-workout: 4 g citrulline, 3 g beta-alanine and 200 mg natural caffeine per 13 g scoop.',
        $$C-LEAN Prime is a clean pre-workout designed to support energy, endurance and mental focus during demanding training sessions. Every ingredient is disclosed on the label, with no proprietary blends. 390 g tub, 13 g per serving.$$,
        $$Citrulline DL-Malate supports nitric oxide production and blood flow during training
Beta-alanine helps support muscular endurance and delay fatigue
Natural caffeine from green tea with tyrosine for energy, alertness and focus$$
    ),
    (
        'Stark Dual Creatine + Betaine',
        'stark-dual-creatine-betaine',
        'STK-DCB-122',
        'Two forms of creatine plus betaine, in a 122 g lemon lime tub.',
        $$Stark Dual Creatine pairs two forms of creatine with betaine to support strength and training performance. 122 g (4.30 oz) tub.$$,
        NULL
    ),
    (
        'Stark L-Carnitine Liquid',
        'stark-l-carnitine-liquid',
        'STK-LCR-450',
        'Liquid L-carnitine, 3000 mg per serving with CoQ10, B5, B12 and chromium. 450 ml, 30 servings.',
        $$Stark Athlete Series L-Carnitine is a liquid performance formula delivering 3000 mg of L-carnitine per serving, alongside coenzyme Q10, vitamin B5, chromium picolinate and vitamin B12. 450 ml bottle, 30 servings.$$,
        NULL
    )
) AS p(name, slug, sku, short_desc, descr, benefits)
CROSS JOIN brands b
WHERE b.slug = 'stark'
  AND NOT EXISTS (SELECT 1 FROM products x WHERE x.slug = p.slug);

-- ---------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM (VALUES
    ('stark-athlete-isolate-protein-peptides', 'whey-isolate'),
    ('stark-c-lean-prime-pre-workout',         'pre-workout'),
    ('stark-dual-creatine-betaine',            'creatine'),
    ('stark-l-carnitine-liquid',               'l-carnitine')
) AS m(product_slug, category_slug)
JOIN products p ON p.slug = m.product_slug
JOIN categories c ON c.slug = m.category_slug
ON CONFLICT (product_id, category_id) DO NOTHING;

-- ---------------------------------------------------------------------
-- variants - the sellable unit. Price stays 0 until the owner sets it.
-- ---------------------------------------------------------------------
INSERT INTO product_variants (product_id, sku, flavour, size_label, size_value, size_unit, price, image_url, is_default, display_order)
SELECT p.id, v.sku, v.flavour, v.size_label, v.size_value, v.size_unit, 0, v.image_url, v.display_order = 1, v.display_order
FROM (VALUES
    ('stark-athlete-isolate-protein-peptides', 'STK-ISO-5LB-BB',  'Brownie Batter',      '5 lb',     2.270, 'kg', '/assets/products/stark-isolate-brownie-batter.jpg',      1),
    ('stark-athlete-isolate-protein-peptides', 'STK-ISO-5LB-SC',  'Salted Caramel',      '5 lb',     2.270, 'kg', '/assets/products/stark-isolate-salted-caramel.jpg',      2),
    ('stark-athlete-isolate-protein-peptides', 'STK-ISO-5LB-CC',  'Cookies and Cream',   '5 lb',     2.270, 'kg', '/assets/products/stark-isolate-cookies-and-cream.jpg',   3),
    ('stark-athlete-isolate-protein-peptides', 'STK-ISO-5LB-HZ',  'Hazelnut',            '5 lb',     2.270, 'kg', '/assets/products/stark-isolate-hazelnut.jpg',            4),
    ('stark-athlete-isolate-protein-peptides', 'STK-ISO-5LB-RV',  'Red Velvet',          '5 lb',     2.270, 'kg', '/assets/products/stark-isolate-red-velvet.jpg',          5),
    ('stark-athlete-isolate-protein-peptides', 'STK-ISO-5LB-CCH', 'Coconut Chocolate',   '5 lb',     2.270, 'kg', '/assets/products/stark-isolate-coconut-chocolate.jpg',   6),
    ('stark-athlete-isolate-protein-peptides', 'STK-ISO-5LB-CCF', 'Cherry Cocoa Fusion', '5 lb',     2.270, 'kg', '/assets/products/stark-isolate-cherry-cocoa-fusion.jpg', 7),

    ('stark-c-lean-prime-pre-workout',         'STK-CLP-390-FL',  'Frosted Litchi',      '390 g',  390.000, 'g',  '/assets/products/stark-c-lean-prime-frosted-litchi.jpg', 1),
    ('stark-c-lean-prime-pre-workout',         'STK-CLP-390-SM',  'Solar Mango',         '390 g',  390.000, 'g',  '/assets/products/stark-c-lean-prime-solar-mango.jpg',    2),

    ('stark-dual-creatine-betaine',            'STK-DCB-122-LL',  'Lemon Lime',          '122 g',  122.000, 'g',  '/assets/products/stark-dual-creatine-betaine-lemon-lime.jpg', 1),

    -- Both carnitine flavours were photographed in one shot, so neither
    -- has a picture of its own; the product image covers the pair.
    ('stark-l-carnitine-liquid',               'STK-LCR-450-OR',  'Orange Rush',         '450 ml', 450.000, 'ml', NULL, 1),
    ('stark-l-carnitine-liquid',               'STK-LCR-450-MPN', 'Mango Peach Nectar',  '450 ml', 450.000, 'ml', NULL, 2)
) AS v(product_slug, sku, flavour, size_label, size_value, size_unit, image_url, display_order)
JOIN products p ON p.slug = v.product_slug
WHERE NOT EXISTS (SELECT 1 FROM product_variants x WHERE x.sku = v.sku);

-- Every variant carries its own stock, starting at zero.
INSERT INTO inventory (variant_id, stock_quantity, low_stock_threshold)
SELECT v.id, 0, 15
FROM product_variants v
JOIN products p ON p.id = v.product_id
WHERE p.slug LIKE 'stark-%'
  AND NOT EXISTS (SELECT 1 FROM inventory i WHERE i.variant_id = v.id);

-- ---------------------------------------------------------------------
-- product images
-- ---------------------------------------------------------------------
INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
SELECT p.id, i.image_url, i.alt_text, i.display_order, i.display_order = 0
FROM (VALUES
    ('stark-athlete-isolate-protein-peptides', '/assets/products/stark-isolate-brownie-batter.jpg',      'Stark Athlete Isolate Protein Peptides - Brownie Batter',      0),
    ('stark-athlete-isolate-protein-peptides', '/assets/products/stark-isolate-salted-caramel.jpg',      'Stark Athlete Isolate Protein Peptides - Salted Caramel',      1),
    ('stark-athlete-isolate-protein-peptides', '/assets/products/stark-isolate-cookies-and-cream.jpg',   'Stark Athlete Isolate Protein Peptides - Cookies and Cream',   2),
    ('stark-athlete-isolate-protein-peptides', '/assets/products/stark-isolate-hazelnut.jpg',            'Stark Athlete Isolate Protein Peptides - Hazelnut',            3),
    ('stark-athlete-isolate-protein-peptides', '/assets/products/stark-isolate-red-velvet.jpg',          'Stark Athlete Isolate Protein Peptides - Red Velvet',          4),
    ('stark-athlete-isolate-protein-peptides', '/assets/products/stark-isolate-coconut-chocolate.jpg',   'Stark Athlete Isolate Protein Peptides - Coconut Chocolate',   5),
    ('stark-athlete-isolate-protein-peptides', '/assets/products/stark-isolate-cherry-cocoa-fusion.jpg', 'Stark Athlete Isolate Protein Peptides - Cherry Cocoa Fusion', 6),

    ('stark-c-lean-prime-pre-workout', '/assets/products/stark-c-lean-prime-frosted-litchi.jpg',   'Stark C-LEAN Prime Pre-Workout - Frosted Litchi',   0),
    ('stark-c-lean-prime-pre-workout', '/assets/products/stark-c-lean-prime-solar-mango.jpg',      'Stark C-LEAN Prime Pre-Workout - Solar Mango',      1),
    ('stark-c-lean-prime-pre-workout', '/assets/products/stark-c-lean-prime-frosted-litchi-2.jpg', 'Stark C-LEAN Prime Pre-Workout - Frosted Litchi tub', 2),

    ('stark-dual-creatine-betaine', '/assets/products/stark-dual-creatine-betaine-lemon-lime.jpg', 'Stark Dual Creatine + Betaine - Lemon Lime', 0),

    ('stark-l-carnitine-liquid', '/assets/products/stark-l-carnitine-orange-and-mango.jpg', 'Stark L-Carnitine Liquid - Orange Rush and Mango Peach Nectar', 0)
) AS i(product_slug, image_url, alt_text, display_order)
JOIN products p ON p.slug = i.product_slug
WHERE NOT EXISTS (
    SELECT 1 FROM product_images x WHERE x.product_id = p.id AND x.image_url = i.image_url
);

-- ---------------------------------------------------------------------
-- at-a-glance specs: only figures printed clearly on the pack
-- ---------------------------------------------------------------------
INSERT INTO product_specs (product_id, label, value, display_order)
SELECT p.id, s.label, s.value, s.display_order
FROM (VALUES
    ('stark-athlete-isolate-protein-peptides', 'Protein per scoop',   '25 g',            1),
    ('stark-athlete-isolate-protein-peptides', 'Servings',            '73',              2),
    ('stark-athlete-isolate-protein-peptides', 'Size',                '5 lb (2.27 kg)',  3),
    ('stark-athlete-isolate-protein-peptides', 'Flavours',            '7',               4),

    ('stark-c-lean-prime-pre-workout', 'Serving size',         '13 g',    1),
    ('stark-c-lean-prime-pre-workout', 'Citrulline DL-Malate', '4000 mg', 2),
    ('stark-c-lean-prime-pre-workout', 'Beta-Alanine',         '3000 mg', 3),
    ('stark-c-lean-prime-pre-workout', 'Betaine Anhydrous',    '1500 mg', 4),
    ('stark-c-lean-prime-pre-workout', 'Taurine',              '1000 mg', 5),
    ('stark-c-lean-prime-pre-workout', 'Tyrosine',             '1000 mg', 6),
    ('stark-c-lean-prime-pre-workout', 'Natural Caffeine',     '200 mg',  7),
    ('stark-c-lean-prime-pre-workout', 'Size',                 '390 g',   8),

    ('stark-dual-creatine-betaine', 'Size', '122 g (4.30 oz)', 1),

    ('stark-l-carnitine-liquid', 'L-Carnitine',         '3000 mg', 1),
    ('stark-l-carnitine-liquid', 'Coenzyme Q10',        '75 mg',   2),
    ('stark-l-carnitine-liquid', 'Vitamin B5',          '5 mg',    3),
    ('stark-l-carnitine-liquid', 'Chromium Picolinate', '150 mcg', 4),
    ('stark-l-carnitine-liquid', 'Vitamin B12',         '2.2 mcg', 5),
    ('stark-l-carnitine-liquid', 'Servings',            '30',      6),
    ('stark-l-carnitine-liquid', 'Size',                '450 ml',  7)
) AS s(product_slug, label, value, display_order)
JOIN products p ON p.slug = s.product_slug
WHERE NOT EXISTS (
    SELECT 1 FROM product_specs x WHERE x.product_id = p.id AND x.label = s.label
);
