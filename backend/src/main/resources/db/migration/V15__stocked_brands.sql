-- =====================================================================
-- The brands the shop actually stocks, so products can be filed under
-- them before their artwork arrives.
--
-- is_authorized_reseller is FALSE on all three, deliberately. That flag
-- drives the public "100% Genuine / authorised" badge, and it is a claim
-- about paperwork the shop holds, not something a migration can assert
-- on the owner's behalf. One tick per brand in the admin turns it on.
--
-- No logos and no descriptions: a brand's own artwork and copy come from
-- its distributor, with permission to use them. Empty is honest; made-up
-- marketing copy about somebody else's brand is not.
--
-- These appear on the storefront only once they have active products -
-- the same rule categories follow - so listing them here early costs a
-- shopper nothing.
-- =====================================================================

INSERT INTO brands (name, slug, country_of_origin, is_house_brand, is_authorized_reseller, is_active, is_featured, display_order)
SELECT b.name, b.slug, b.country, FALSE, FALSE, TRUE, TRUE, b.display_order
FROM (VALUES
    ('Optimum Nutrition',   'optimum-nutrition',   'USA', 2),
    ('Ultimate Nutrition',  'ultimate-nutrition',  'USA', 3),
    ('Rule One Proteins',   'rule-one-proteins',   'USA', 4)
) AS b(name, slug, country, display_order)
WHERE NOT EXISTS (SELECT 1 FROM brands x WHERE x.slug = b.slug);
