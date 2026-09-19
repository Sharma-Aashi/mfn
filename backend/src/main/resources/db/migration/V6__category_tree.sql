-- =====================================================================
-- A two-level category tree for the marketplace.
--
-- The catalogue was organised by goal (Immunity, Energy, Sleep...), which
-- answers "why would I buy this" but not "what is it". Shoppers arriving
-- for whey protein need the second question answered, so product-type
-- groups become the primary navigation and the original goals move under
-- a "Shop by Goal" parent, where they still work as a second axis.
--
-- Two levels only, deliberately. The big Indian marketplaces run three,
-- but they carry tens of thousands of SKUs; a third level here would be
-- mostly empty categories, and an empty category is a dead end.
--
-- The header shows the first five top-level categories by display_order
-- and folds the rest into a "More" menu, so re-ordering here is what
-- promotes a category into the main navigation.
-- =====================================================================

-- ---------------------------------------------------------------------
-- top-level groups
-- ---------------------------------------------------------------------
INSERT INTO categories (name, slug, description, display_order) VALUES
('Proteins',             'proteins',            $$Whey, isolate and plant proteins to cover your daily protein target.$$, 1),
('Gainers',              'gainers',             $$High-calorie formulas for putting on size when food alone is not enough.$$, 2),
('Pre/Post Workout',     'pre-post-workout',    $$Everything taken around a session: pre-workout, creatine, aminos and electrolytes.$$, 3),
('Vitamins & Supplements','vitamins-supplements',$$Daily micronutrient support, from multivitamins to single-nutrient formulas.$$, 4),
('Ayurveda & Herbs',     'ayurveda-herbs',      $$Traditional herbs and adaptogens, standardised and third-party tested.$$, 5),
('Workout Essentials',   'workout-essentials',  $$Fat burners, carnitine and performance support for a training block.$$, 6),
('Protein Foods',        'protein-foods',       $$Everyday food with the protein built in: bars, spreads and breakfast.$$, 7),
('Wellness',             'wellness',            $$Targeted support for sleep, digestion, joints, skin and hair.$$, 8),
('Shop by Goal',         'shop-by-goal',        $$Browse by what you want to achieve rather than by product type.$$, 9);

-- ---------------------------------------------------------------------
-- children
-- ---------------------------------------------------------------------
INSERT INTO categories (name, slug, parent_id, display_order)
SELECT c.name, c.slug, p.id, c.display_order
FROM (VALUES
    ('Whey Protein',          'whey-protein',          'proteins',             1),
    ('Whey Isolate',          'whey-isolate',          'proteins',             2),
    ('Plant Protein',         'plant-protein',         'proteins',             3),
    ('Casein & Blends',       'casein-blends',         'proteins',             4),

    ('Mass Gainer',           'mass-gainer',           'gainers',              1),
    ('Weight Gainer',         'weight-gainer',         'gainers',              2),

    ('Pre-Workout',           'pre-workout',           'pre-post-workout',     1),
    ('Creatine',              'creatine',              'pre-post-workout',     2),
    ('BCAA & EAA',            'bcaa-eaa',              'pre-post-workout',     3),
    ('Electrolytes',          'electrolytes',          'pre-post-workout',     4),

    ('Multivitamins',         'multivitamins',         'vitamins-supplements', 1),
    ('Omega 3 & Fish Oil',    'omega-3-fish-oil',      'vitamins-supplements', 2),
    ('Vitamin D',             'vitamin-d',             'vitamins-supplements', 3),
    ('Minerals',              'minerals',              'vitamins-supplements', 4),
    ('Biotin & Hair',         'biotin-hair',           'vitamins-supplements', 5),

    ('Ashwagandha',           'ashwagandha',           'ayurveda-herbs',       1),
    ('Shilajit',              'shilajit',              'ayurveda-herbs',       2),
    ('Giloy & Immunity',      'giloy-immunity',        'ayurveda-herbs',       3),

    ('Fat Burners',           'fat-burners',           'workout-essentials',   1),
    ('L-Carnitine',           'l-carnitine',           'workout-essentials',   2),
    ('Testosterone Boosters', 'testosterone-boosters', 'workout-essentials',   3),

    ('Protein Bars',          'protein-bars',          'protein-foods',        1),
    ('Peanut Butter',         'peanut-butter',         'protein-foods',        2),
    ('Muesli & Oats',         'muesli-oats',           'protein-foods',        3),

    ('Sleep Support',         'sleep-support',         'wellness',             1),
    ('Digestion Support',     'digestion-support',     'wellness',             2),
    ('Joint Support',         'joint-support',         'wellness',             3),
    ('Skin & Hair',           'skin-hair',             'wellness',             4)
) AS c(name, slug, parent_slug, display_order)
JOIN categories p ON p.slug = c.parent_slug;

-- ---------------------------------------------------------------------
-- The original goal categories keep working, one level down.
-- ---------------------------------------------------------------------
UPDATE categories
SET parent_id = (SELECT id FROM categories WHERE slug = 'shop-by-goal')
WHERE slug IN ('immunity', 'energy', 'sleep-relaxation', 'digestion', 'fitness-recovery', 'daily-wellness');

-- ---------------------------------------------------------------------
-- Place the existing catalogue in the new tree. Goal assignments are left
-- alone, so every product now sits on both axes.
-- ---------------------------------------------------------------------
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM (VALUES
    ('vitalora-daily-multivitamin', 'multivitamins'),
    ('vitalora-omega-3',            'omega-3-fish-oil'),
    ('vitalora-vitamin-d3',         'vitamin-d'),
    ('vitalora-magnesium-complex',  'minerals'),
    ('vitalora-probiotic-balance',  'digestion-support'),
    ('vitalora-plant-protein',      'plant-protein'),
    ('vitalora-immunity-plus',      'giloy-immunity'),
    ('vitalora-sleep-relax',        'sleep-support'),
    ('biozyme-performance-whey',    'whey-protein')
) AS m(product_slug, category_slug)
JOIN products p ON p.slug = m.product_slug
JOIN categories c ON c.slug = m.category_slug
ON CONFLICT (product_id, category_id) DO NOTHING;
