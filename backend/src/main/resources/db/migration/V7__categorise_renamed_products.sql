-- =====================================================================
-- V6 placed products in the new tree by matching slugs taken from the
-- seed data. Products renamed through the admin since then have a
-- different slug, so they came through uncategorised.
--
-- This re-runs the placement against the slugs those products actually
-- carry now, alongside the originals, so it is correct on a production
-- database and a no-op on a freshly seeded one.
-- =====================================================================

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM (VALUES
    -- renamed in production
    ('mfn-daily-multivitamin',      'multivitamins'),
    ('mfn-vitamin-d3k2',            'vitamin-d'),
    -- originals, already handled by V6 where they still exist
    ('vitalora-daily-multivitamin', 'multivitamins'),
    ('vitalora-vitamin-d3',         'vitamin-d')
) AS m(product_slug, category_slug)
JOIN products p ON p.slug = m.product_slug
JOIN categories c ON c.slug = m.category_slug
ON CONFLICT (product_id, category_id) DO NOTHING;

-- Anything still outside the product-type tree is easier to spot than to
-- guess at, so it is left for an admin rather than matched on a keyword.
