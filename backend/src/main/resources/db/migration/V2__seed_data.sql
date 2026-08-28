-- =====================================================================
-- VITALORA - Seed data: roles, categories, products, FAQs, CMS, banners,
-- and a handful of demo customer accounts + approved reviews so the
-- storefront has real, queryable content out of the box.
-- (The ADMIN account itself is seeded in Java by AdminUserSeeder so its
-- password is hashed with the live BCrypt bean.)
-- =====================================================================

INSERT INTO roles (name) VALUES ('ADMIN'), ('CUSTOMER');

-- ---------------------------------------------------------------------
-- categories ("Shop By Goal")
-- ---------------------------------------------------------------------
INSERT INTO categories (name, slug, description, image_url, display_order) VALUES
('Immunity', 'immunity', $$Formulas that help support your body's natural defences year-round.$$, '/assets/categories/immunity.svg', 1),
('Energy', 'energy', $$Clean-label formulas designed to support steady, sustained energy.$$, '/assets/categories/energy.svg', 2),
('Sleep & Relaxation', 'sleep-relaxation', $$Calming formulas to help you unwind and support restful sleep.$$, '/assets/categories/sleep-relaxation.svg', 3),
('Digestion', 'digestion', $$Formulas that support gut health and everyday digestive comfort.$$, '/assets/categories/digestion.svg', 4),
('Fitness & Recovery', 'fitness-recovery', $$Support for active lifestyles, muscle recovery and performance.$$, '/assets/categories/fitness-recovery.svg', 5),
('Daily Wellness', 'daily-wellness', $$Everyday essentials that form the foundation of a healthy routine.$$, '/assets/categories/daily-wellness.svg', 6);

-- ---------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------
INSERT INTO products (name, slug, sku, short_description, description, benefits, ingredients, nutritional_info, usage_instructions, warnings, price, sale_price, is_active, is_featured, is_best_seller, is_new_arrival, tags) VALUES
(
  'VITALORA Daily Multivitamin', 'vitalora-daily-multivitamin', 'VIT-MULTI-060',
  $$A complete daily multivitamin with 23 essential nutrients to support energy, immunity and overall wellness.$$,
  $$VITALORA Daily Multivitamin is formulated to help close common nutrient gaps left by modern diets. Each capsule delivers a broad spectrum of essential vitamins and minerals in carefully measured doses, so you get meaningful support without unnecessary megadosing. It is a simple, foundational addition to any wellness routine.$$,
  $$Supports daily energy production
Strengthens immune defence
Supports bone, skin and eye health
Helps fill common nutrient gaps in modern diets$$,
  $$Vitamin A, Vitamin C, Vitamin D3, Vitamin E, Vitamin K, Vitamin B1, B2, B3, B6, B12, Folate, Biotin, Calcium, Magnesium, Zinc, Selenium, Iodine. Capsule shell: HPMC (vegetarian).$$,
  $$Serving size: 1 capsule daily. 60 capsules per bottle (60-day supply). See product label for full %RDA breakdown per nutrient.$$,
  $$Take 1 capsule daily with a meal and a full glass of water, or as directed by your healthcare professional.$$,
  $$Food supplements should not be used as a substitute for a varied and balanced diet. Consult your doctor before use if pregnant, nursing, or taking medication. Keep out of reach of children. Store in a cool, dry place away from direct sunlight.$$,
  899.00, 749.00, true, true, true, false, 'multivitamin,daily,immunity,energy'
),
(
  'VITALORA Omega-3', 'vitalora-omega-3', 'VIT-OMEGA-090',
  $$High-strength fish oil softgels delivering EPA and DHA to support heart, brain and joint health.$$,
  $$Sourced from deep-sea fish and molecularly distilled for purity, VITALORA Omega-3 delivers a clinically meaningful dose of EPA and DHA in an easy-to-swallow softgel with a light lemon flavour and no fishy aftertaste.$$,
  $$Supports cardiovascular health
Supports cognitive function and focus
Helps maintain healthy joints
Supports healthy skin$$,
  $$Fish oil concentrate (1000mg) providing EPA 400mg and DHA 300mg, softgel shell (fish gelatin, glycerin), natural lemon flavour, Vitamin E (antioxidant).$$,
  $$Serving size: 2 softgels daily. 90 softgels per bottle (45-day supply).$$,
  $$Take 2 softgels daily with food, or as directed by your healthcare professional.$$,
  $$Contains fish (anchovy, sardine). Consult your doctor if on blood-thinning medication. Not a substitute for a balanced diet. Keep out of reach of children.$$,
  1099.00, NULL, true, true, false, false, 'omega-3,fish-oil,heart,recovery'
),
(
  'VITALORA Vitamin D3', 'vitalora-vitamin-d3', 'VIT-D3-2000-060',
  $$2000 IU Vitamin D3 capsules to support bone strength, immune function and mood.$$,
  $$Vitamin D is one of the most common nutrient gaps, especially for indoor lifestyles. VITALORA Vitamin D3 delivers a well-studied 2000 IU dose in an MCT oil base for enhanced absorption.$$,
  $$Supports strong bones and teeth
Strengthens immune response
Supports mood and normal muscle function$$,
  $$Cholecalciferol (Vitamin D3) 2000 IU, MCT oil base, capsule shell: HPMC (vegetarian).$$,
  $$Serving size: 1 capsule daily. 60 capsules per bottle (60-day supply).$$,
  $$Take 1 capsule daily with a meal, or as directed by your healthcare professional.$$,
  $$Do not exceed the stated dose. Consult your doctor if you have a pre-existing medical condition. Keep out of reach of children.$$,
  599.00, NULL, true, false, true, false, 'vitamin-d,immunity,bone-health'
),
(
  'VITALORA Magnesium Complex', 'vitalora-magnesium-complex', 'VIT-MAG-090',
  $$A blend of three bioavailable magnesium forms to support muscle recovery, relaxation and restful sleep.$$,
  $$This tri-magnesium formula combines glycinate, citrate and malate for well-rounded absorption and gentle digestibility, supporting both active recovery and evening wind-down.$$,
  $$Supports muscle recovery after exercise
Promotes relaxation and restful sleep
Supports normal nerve function
Helps reduce tiredness and fatigue$$,
  $$Magnesium Glycinate, Magnesium Citrate, Magnesium Malate (providing 300mg elemental magnesium per serving), capsule shell: HPMC (vegetarian).$$,
  $$Serving size: 3 capsules daily. 90 capsules per bottle (30-day supply).$$,
  $$Take 3 capsules in the evening with water, or as directed by your healthcare professional.$$,
  $$High doses may have a mild laxative effect. Consult your doctor if you have kidney issues. Keep out of reach of children.$$,
  799.00, NULL, true, false, false, false, 'magnesium,sleep,recovery,relaxation'
),
(
  'VITALORA Probiotic Balance', 'vitalora-probiotic-balance', 'VIT-PROB-030',
  $$A 10-strain, 20 billion CFU probiotic formula to support gut health and digestive balance.$$,
  $$VITALORA Probiotic Balance combines ten clinically studied bacterial strains with a prebiotic fibre base in a delayed-release capsule, so more live cultures survive the journey to your gut.$$,
  $$Supports healthy gut flora balance
Aids digestion and nutrient absorption
Supports immune health via the gut
Helps reduce occasional bloating$$,
  $$Probiotic blend 20 Billion CFU (Lactobacillus and Bifidobacterium strains), prebiotic fibre (inulin), delayed-release capsule shell (vegetarian).$$,
  $$Serving size: 1 capsule daily. 30 capsules per bottle (30-day supply).$$,
  $$Take 1 capsule daily on an empty stomach, preferably in the morning, or as directed by your healthcare professional.$$,
  $$Consult your doctor if immunocompromised or currently on antibiotics. Store in a cool, dry place. Keep out of reach of children.$$,
  999.00, 849.00, true, false, false, true, 'probiotic,digestion,gut-health'
),
(
  'VITALORA Plant Protein', 'vitalora-plant-protein', 'VIT-PPRO-900',
  $$A smooth 24g plant-based protein blend from pea and brown rice, with zero added sugar.$$,
  $$Combining pea protein isolate and brown rice protein gives VITALORA Plant Protein a complete amino acid profile in a smooth, easy-to-mix formula, sweetened naturally with zero added sugar.$$,
  $$Supports muscle recovery and growth
Delivers a complete amino acid profile
Easy to digest
No added sugar, soy or dairy$$,
  $$Pea protein isolate, brown rice protein, natural cocoa flavour, stevia leaf extract, sunflower lecithin. 900g pouch (approx. 30 servings).$$,
  $$Per serving (30g): Energy 112 kcal, Protein 24g, Carbohydrate 2.1g, Fat 1.2g, Sugar 0g.$$,
  $$Mix 1 scoop (30g) with 200-250ml water or plant milk and shake well. Consume post-workout or between meals.$$,
  $$Manufactured in a facility that also processes tree nuts and soy. Not intended for children. Consult your doctor if pregnant or nursing.$$,
  1999.00, 1799.00, true, false, true, false, 'protein,plant-based,fitness,recovery'
),
(
  'VITALORA Immunity Plus', 'vitalora-immunity-plus', 'VIT-IMM-060',
  $$A targeted blend of Vitamin C, Zinc and Elderberry to support your body's natural defences.$$,
  $$VITALORA Immunity Plus combines four well-studied immune-supportive ingredients into a single daily capsule, designed to be taken year-round or ramped up during seasonal transitions.$$,
  $$Supports immune system function
Provides antioxidant support
Supports the body's normal defence against seasonal stress
Supports skin health via Vitamin C$$,
  $$Vitamin C 500mg, Zinc 15mg, Elderberry extract 100mg, Vitamin D3 1000 IU, capsule shell: HPMC (vegetarian).$$,
  $$Serving size: 1 capsule daily. 60 capsules per bottle (60-day supply).$$,
  $$Take 1 capsule daily with food, or as directed by your healthcare professional.$$,
  $$Do not exceed the stated dose. Consult your doctor if on medication. Keep out of reach of children.$$,
  749.00, NULL, true, false, false, true, 'immunity,vitamin-c,zinc,elderberry'
),
(
  'VITALORA Sleep & Relax', 'vitalora-sleep-relax', 'VIT-SLEEP-060',
  $$A calming blend of Magnesium, L-Theanine and Chamomile to help you unwind and fall asleep naturally.$$,
  $$Formulated for the modern wind-down routine, VITALORA Sleep & Relax pairs a low, non-habit-forming dose of melatonin with magnesium, L-theanine and chamomile to support a calm mind and easier sleep onset.$$,
  $$Supports relaxation before bedtime
Helps reduce time to fall asleep
Non-habit forming
Supports a calm, settled mind$$,
  $$Magnesium Glycinate 200mg, L-Theanine 100mg, Chamomile extract 50mg, Melatonin 1mg, capsule shell: HPMC (vegetarian).$$,
  $$Serving size: 2 capsules daily. 60 capsules per bottle (30-day supply).$$,
  $$Take 2 capsules 30-45 minutes before bedtime, or as directed by your healthcare professional.$$,
  $$May cause drowsiness. Do not drive or operate machinery after use. Not recommended for children. Consult your doctor if pregnant or nursing.$$,
  849.00, NULL, true, true, false, true, 'sleep,relaxation,melatonin,magnesium'
);

-- ---------------------------------------------------------------------
-- product images (one hero image per seed product)
-- ---------------------------------------------------------------------
INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
SELECT id, '/assets/products/daily-multivitamin.svg', name, 0, true FROM products WHERE slug = 'vitalora-daily-multivitamin';
INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
SELECT id, '/assets/products/omega-3.svg', name, 0, true FROM products WHERE slug = 'vitalora-omega-3';
INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
SELECT id, '/assets/products/vitamin-d3.svg', name, 0, true FROM products WHERE slug = 'vitalora-vitamin-d3';
INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
SELECT id, '/assets/products/magnesium-complex.svg', name, 0, true FROM products WHERE slug = 'vitalora-magnesium-complex';
INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
SELECT id, '/assets/products/probiotic-balance.svg', name, 0, true FROM products WHERE slug = 'vitalora-probiotic-balance';
INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
SELECT id, '/assets/products/plant-protein.svg', name, 0, true FROM products WHERE slug = 'vitalora-plant-protein';
INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
SELECT id, '/assets/products/immunity-plus.svg', name, 0, true FROM products WHERE slug = 'vitalora-immunity-plus';
INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
SELECT id, '/assets/products/sleep-relax.svg', name, 0, true FROM products WHERE slug = 'vitalora-sleep-relax';

-- ---------------------------------------------------------------------
-- inventory (Vitamin D3 and Immunity Plus seeded low, to demo the
-- admin low-stock highlight)
-- ---------------------------------------------------------------------
INSERT INTO inventory (product_id, stock_quantity, low_stock_threshold)
SELECT id, 240, 20 FROM products WHERE slug = 'vitalora-daily-multivitamin';
INSERT INTO inventory (product_id, stock_quantity, low_stock_threshold)
SELECT id, 180, 20 FROM products WHERE slug = 'vitalora-omega-3';
INSERT INTO inventory (product_id, stock_quantity, low_stock_threshold)
SELECT id, 12, 20 FROM products WHERE slug = 'vitalora-vitamin-d3';
INSERT INTO inventory (product_id, stock_quantity, low_stock_threshold)
SELECT id, 95, 20 FROM products WHERE slug = 'vitalora-magnesium-complex';
INSERT INTO inventory (product_id, stock_quantity, low_stock_threshold)
SELECT id, 130, 20 FROM products WHERE slug = 'vitalora-probiotic-balance';
INSERT INTO inventory (product_id, stock_quantity, low_stock_threshold)
SELECT id, 60, 20 FROM products WHERE slug = 'vitalora-plant-protein';
INSERT INTO inventory (product_id, stock_quantity, low_stock_threshold)
SELECT id, 8, 20 FROM products WHERE slug = 'vitalora-immunity-plus';
INSERT INTO inventory (product_id, stock_quantity, low_stock_threshold)
SELECT id, 70, 20 FROM products WHERE slug = 'vitalora-sleep-relax';

-- ---------------------------------------------------------------------
-- product_categories
-- ---------------------------------------------------------------------
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'vitalora-daily-multivitamin' AND c.slug = 'daily-wellness';
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'vitalora-omega-3' AND c.slug = 'fitness-recovery';
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'vitalora-omega-3' AND c.slug = 'daily-wellness';
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'vitalora-vitamin-d3' AND c.slug = 'immunity';
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'vitalora-vitamin-d3' AND c.slug = 'daily-wellness';
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'vitalora-magnesium-complex' AND c.slug = 'sleep-relaxation';
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'vitalora-magnesium-complex' AND c.slug = 'fitness-recovery';
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'vitalora-probiotic-balance' AND c.slug = 'digestion';
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'vitalora-plant-protein' AND c.slug = 'fitness-recovery';
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'vitalora-immunity-plus' AND c.slug = 'immunity';
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c WHERE p.slug = 'vitalora-sleep-relax' AND c.slug = 'sleep-relaxation';

-- ---------------------------------------------------------------------
-- demo customer accounts (not intended to be logged into; they simply
-- own the seeded reviews below so ratings/testimonials are real data)
-- ---------------------------------------------------------------------
INSERT INTO users (full_name, email, password_hash, role_id)
SELECT 'Ananya Sharma', 'ananya.demo@vitalora.local', '$2a$10$DemoSeedAccountNotLoginableXXXXXXXXXXXXXXXXXXXXXXXXXX', id FROM roles WHERE name = 'CUSTOMER';
INSERT INTO users (full_name, email, password_hash, role_id)
SELECT 'Rohan Verma', 'rohan.demo@vitalora.local', '$2a$10$DemoSeedAccountNotLoginableXXXXXXXXXXXXXXXXXXXXXXXXXX', id FROM roles WHERE name = 'CUSTOMER';
INSERT INTO users (full_name, email, password_hash, role_id)
SELECT 'Priya Nair', 'priya.demo@vitalora.local', '$2a$10$DemoSeedAccountNotLoginableXXXXXXXXXXXXXXXXXXXXXXXXXX', id FROM roles WHERE name = 'CUSTOMER';
INSERT INTO users (full_name, email, password_hash, role_id)
SELECT 'Karan Mehta', 'karan.demo@vitalora.local', '$2a$10$DemoSeedAccountNotLoginableXXXXXXXXXXXXXXXXXXXXXXXXXX', id FROM roles WHERE name = 'CUSTOMER';
INSERT INTO users (full_name, email, password_hash, role_id)
SELECT 'Simran Kaur', 'simran.demo@vitalora.local', '$2a$10$DemoSeedAccountNotLoginableXXXXXXXXXXXXXXXXXXXXXXXXXX', id FROM roles WHERE name = 'CUSTOMER';
INSERT INTO users (full_name, email, password_hash, role_id)
SELECT 'Arjun Rao', 'arjun.demo@vitalora.local', '$2a$10$DemoSeedAccountNotLoginableXXXXXXXXXXXXXXXXXXXXXXXXXX', id FROM roles WHERE name = 'CUSTOMER';

-- ---------------------------------------------------------------------
-- reviews (approved, so they are publicly visible immediately)
-- ---------------------------------------------------------------------
INSERT INTO reviews (product_id, user_id, rating, title, comment, status, is_featured)
SELECT p.id, u.id, 5, 'Great daily habit', $$I have been taking this for two months and genuinely feel more energetic through the afternoon slump. Easy to swallow too.$$, 'APPROVED', true
FROM products p, users u WHERE p.slug = 'vitalora-daily-multivitamin' AND u.email = 'ananya.demo@vitalora.local';
INSERT INTO reviews (product_id, user_id, rating, title, comment, status, is_featured)
SELECT p.id, u.id, 4, 'Solid multivitamin', $$Does what it says on the label. Wish the bottle was a bit bigger for the price, but quality feels premium.$$, 'APPROVED', false
FROM products p, users u WHERE p.slug = 'vitalora-daily-multivitamin' AND u.email = 'rohan.demo@vitalora.local';

INSERT INTO reviews (product_id, user_id, rating, title, comment, status, is_featured)
SELECT p.id, u.id, 5, 'No fishy aftertaste', $$Finally an omega-3 that does not repeat on me. My joints feel noticeably better after a month.$$, 'APPROVED', true
FROM products p, users u WHERE p.slug = 'vitalora-omega-3' AND u.email = 'priya.demo@vitalora.local';
INSERT INTO reviews (product_id, user_id, rating, title, comment, status, is_featured)
SELECT p.id, u.id, 5, 'Will repurchase', $$Went with this after comparing a few brands. Good dosage per serving and easy to swallow softgels.$$, 'APPROVED', false
FROM products p, users u WHERE p.slug = 'vitalora-omega-3' AND u.email = 'karan.demo@vitalora.local';

INSERT INTO reviews (product_id, user_id, rating, title, comment, status, is_featured)
SELECT p.id, u.id, 4, 'Works well', $$My last blood test showed improved D levels after using this for three months alongside more sunlight exposure.$$, 'APPROVED', false
FROM products p, users u WHERE p.slug = 'vitalora-vitamin-d3' AND u.email = 'simran.demo@vitalora.local';
INSERT INTO reviews (product_id, user_id, rating, title, comment, status, is_featured)
SELECT p.id, u.id, 5, 'Simple and effective', $$One capsule a day, no aftertaste, and delivery was quick.$$, 'APPROVED', false
FROM products p, users u WHERE p.slug = 'vitalora-vitamin-d3' AND u.email = 'arjun.demo@vitalora.local';

INSERT INTO reviews (product_id, user_id, rating, title, comment, status, is_featured)
SELECT p.id, u.id, 5, 'Sleep improved', $$Started taking this in the evenings and my sleep quality has genuinely improved within two weeks.$$, 'APPROVED', true
FROM products p, users u WHERE p.slug = 'vitalora-magnesium-complex' AND u.email = 'ananya.demo@vitalora.local';
INSERT INTO reviews (product_id, user_id, rating, title, comment, status, is_featured)
SELECT p.id, u.id, 4, 'Good for recovery', $$Helps with muscle soreness after gym days. Slight smell but it does not affect the capsules.$$, 'APPROVED', false
FROM products p, users u WHERE p.slug = 'vitalora-magnesium-complex' AND u.email = 'rohan.demo@vitalora.local';

INSERT INTO reviews (product_id, user_id, rating, title, comment, status, is_featured)
SELECT p.id, u.id, 4, 'Noticeable difference', $$Less bloating since I started this a month ago. I take it first thing in the morning as suggested.$$, 'APPROVED', false
FROM products p, users u WHERE p.slug = 'vitalora-probiotic-balance' AND u.email = 'priya.demo@vitalora.local';
INSERT INTO reviews (product_id, user_id, rating, title, comment, status, is_featured)
SELECT p.id, u.id, 5, 'Gut health has improved', $$Genuinely surprised by how much better my digestion feels. Packaging is also premium.$$, 'APPROVED', false
FROM products p, users u WHERE p.slug = 'vitalora-probiotic-balance' AND u.email = 'karan.demo@vitalora.local';

INSERT INTO reviews (product_id, user_id, rating, title, comment, status, is_featured)
SELECT p.id, u.id, 5, 'Best plant protein I have tried', $$Mixes smoothly with no chalky texture, and the chocolate flavour is not overly sweet.$$, 'APPROVED', true
FROM products p, users u WHERE p.slug = 'vitalora-plant-protein' AND u.email = 'simran.demo@vitalora.local';
INSERT INTO reviews (product_id, user_id, rating, title, comment, status, is_featured)
SELECT p.id, u.id, 4, 'Good macros', $$Solid protein content per scoop. Would love a few more flavour options.$$, 'APPROVED', false
FROM products p, users u WHERE p.slug = 'vitalora-plant-protein' AND u.email = 'arjun.demo@vitalora.local';

INSERT INTO reviews (product_id, user_id, rating, title, comment, status, is_featured)
SELECT p.id, u.id, 5, 'Great through flu season', $$Started taking this before the seasonal change and felt like I bounced back quicker than usual.$$, 'APPROVED', false
FROM products p, users u WHERE p.slug = 'vitalora-immunity-plus' AND u.email = 'ananya.demo@vitalora.local';
INSERT INTO reviews (product_id, user_id, rating, title, comment, status, is_featured)
SELECT p.id, u.id, 3, 'Decent', $$Works fine, though I did not notice a dramatic difference. Still continuing it as a precaution.$$, 'APPROVED', false
FROM products p, users u WHERE p.slug = 'vitalora-immunity-plus' AND u.email = 'rohan.demo@vitalora.local';

INSERT INTO reviews (product_id, user_id, rating, title, comment, status, is_featured)
SELECT p.id, u.id, 5, 'Falling asleep faster', $$No groggy feeling the next morning, unlike other sleep aids I have tried.$$, 'APPROVED', true
FROM products p, users u WHERE p.slug = 'vitalora-sleep-relax' AND u.email = 'priya.demo@vitalora.local';
INSERT INTO reviews (product_id, user_id, rating, title, comment, status, is_featured)
SELECT p.id, u.id, 4, 'Helps me wind down', $$I take it 30 minutes before bed as instructed and it works well most nights.$$, 'APPROVED', false
FROM products p, users u WHERE p.slug = 'vitalora-sleep-relax' AND u.email = 'karan.demo@vitalora.local';

-- Keep the denormalized rating summary on products in sync with the seeded reviews above.
UPDATE products SET avg_rating = 4.50, review_count = 2 WHERE slug = 'vitalora-daily-multivitamin';
UPDATE products SET avg_rating = 5.00, review_count = 2 WHERE slug = 'vitalora-omega-3';
UPDATE products SET avg_rating = 4.50, review_count = 2 WHERE slug = 'vitalora-vitamin-d3';
UPDATE products SET avg_rating = 4.50, review_count = 2 WHERE slug = 'vitalora-magnesium-complex';
UPDATE products SET avg_rating = 4.50, review_count = 2 WHERE slug = 'vitalora-probiotic-balance';
UPDATE products SET avg_rating = 4.50, review_count = 2 WHERE slug = 'vitalora-plant-protein';
UPDATE products SET avg_rating = 4.00, review_count = 2 WHERE slug = 'vitalora-immunity-plus';
UPDATE products SET avg_rating = 4.50, review_count = 2 WHERE slug = 'vitalora-sleep-relax';

-- ---------------------------------------------------------------------
-- FAQs
-- ---------------------------------------------------------------------
INSERT INTO faqs (question, answer, category, display_order) VALUES
($$Are VITALORA supplements third-party tested?$$, $$Yes. Every batch of VITALORA supplements is tested by independent, accredited laboratories for purity, potency and safety before it reaches you.$$, 'PRODUCTS', 1),
($$Are your products vegetarian friendly?$$, $$Most VITALORA capsules use a plant-based HPMC shell and are suitable for vegetarians. Please check the ingredients list on each product page, as a small number of formulas (such as our Omega-3 softgels) use fish-based ingredients.$$, 'PRODUCTS', 2),
($$How do I track my order?$$, $$Once your order is placed, you can track its status anytime from the My Orders section of your account using your order number.$$, 'ORDERS', 1),
($$Can I modify or cancel my order after placing it?$$, $$Please contact our support team as soon as possible. We can usually accommodate changes if the order has not yet been processed for shipping.$$, 'ORDERS', 2),
($$What are your shipping charges?$$, $$We offer free shipping on all orders above Rs. 999. Orders below this amount incur a flat shipping fee of Rs. 79.$$, 'SHIPPING', 1),
($$How long does delivery take?$$, $$Most orders are delivered within 5-7 business days, depending on your location.$$, 'SHIPPING', 2),
($$What is your return policy?$$, $$We accept returns of unopened, unused products within 7 days of delivery. Please visit our Returns and Refunds page for full details.$$, 'RETURNS', 1),
($$How do I request a refund?$$, $$Reach out to our support team with your order number, and we will guide you through the return and refund process.$$, 'RETURNS', 2),
($$What payment methods do you accept?$$, $$At this time, VITALORA supports Cash on Delivery (COD) for all orders. Online payment options will be introduced soon.$$, 'PAYMENTS', 1),
($$Is there any extra charge for Cash on Delivery?$$, $$No, we do not charge any additional fee for Cash on Delivery orders.$$, 'PAYMENTS', 2),
($$When is the best time to take my supplements?$$, $$This varies by product. Please check the "How to Use" section on each product page for specific guidance on timing and dosage.$$, 'USAGE', 1),
($$Can I take multiple VITALORA products together?$$, $$Most of our products can be safely combined. If you are pregnant, nursing, or on medication, we recommend consulting your healthcare provider before combining supplements.$$, 'USAGE', 2),
($$Where is VITALORA based?$$, $$VITALORA Wellness Pvt. Ltd. is based in Gurugram, Haryana, India, and we currently ship across India.$$, 'GENERAL', 1),
($$How can I contact customer support?$$, $$You can reach us at hello@vitalora.com or call +91 1800 123 4567, Monday to Friday, 9:00 AM to 6:00 PM.$$, 'GENERAL', 2);

-- ---------------------------------------------------------------------
-- CMS content
-- ---------------------------------------------------------------------
INSERT INTO cms_content (page_key, section_key, content_json) VALUES
('home', 'hero', $${"title": "Fuel Your Health. Elevate Your Everyday.", "subtitle": "Premium, thoughtfully formulated supplements designed to support your energy, immunity, wellness and active lifestyle.", "primaryCtaText": "Shop Supplements", "primaryCtaLink": "/products", "secondaryCtaText": "Explore Wellness", "secondaryCtaLink": "/products", "image": "/assets/brand/hero.svg"}$$),
('home', 'usp', $${"items": [{"icon": "shield-check", "title": "Quality Tested", "description": "Every batch is third-party tested for purity and potency."}, {"icon": "leaf", "title": "Clean Ingredients", "description": "Thoughtfully sourced, transparently labelled formulas."}, {"icon": "flask", "title": "Science-Inspired Formulas", "description": "Backed by nutrition research, not trends."}, {"icon": "ban", "title": "No Unnecessary Additives", "description": "No artificial fillers, colours or unnecessary additives."}]}$$),
('home', 'whyVitalora', $${"heading": "Why VITALORA?", "items": [{"title": "Carefully Selected Ingredients", "description": "We choose every ingredient for proven quality, not just cost."}, {"title": "Transparent Formulations", "description": "Full ingredient and dosage transparency on every label."}, {"title": "Quality-First Manufacturing", "description": "Produced in certified facilities under strict quality control."}, {"title": "Everyday Wellness Approach", "description": "Practical formulas designed to fit real, modern lifestyles."}]}$$),
('home', 'promoBanner', $${"title": "Start Your Wellness Journey", "subtitle": "Get 15% off your first order", "ctaText": "Shop Now", "ctaLink": "/products"}$$),
('home', 'newsletter', $${"heading": "Join the VITALORA Circle", "subtitle": "Get wellness tips, product updates and exclusive offers."}$$),
('about', 'hero', $${"heading": "Our Story", "subtitle": "Better health, made simple and honest."}$$),
('about', 'story', $${"heading": "Our Story", "body": "VITALORA began with a simple frustration: supplement labels that were hard to trust. Too many products hid behind vague claims and unnecessary fillers. We set out to build a wellness brand rooted in transparency, where every ingredient, every dose and every claim could stand up to scrutiny."}$$),
('about', 'mission', $${"heading": "Our Mission", "body": "To make science-backed, clean-label supplements a simple and trustworthy part of everyday life."}$$),
('about', 'vision', $${"heading": "Our Vision", "body": "A world where taking care of your health does not require guesswork, just clear information and formulas you can rely on."}$$),
('about', 'quality', $${"heading": "Quality Philosophy", "body": "Every VITALORA formula is developed with measured, effective doses of well-researched ingredients, manufactured in certified facilities and verified by independent laboratories before it reaches your door."}$$),
('about', 'ingredients', $${"heading": "Ingredient Philosophy", "body": "We select ingredients for their evidence and bioavailability, not just their marketing appeal. No unnecessary additives, no proprietary blends hiding weak doses, just clear, honest labels."}$$),
('about', 'founder', $${"heading": "From Our Founder", "body": "Wellness should not be complicated. VITALORA is the brand we wished existed when we started our own health journeys: honest, simple and genuinely effective.", "name": "The VITALORA Founding Team"}$$),
('contact', 'info', $${"companyName": "VITALORA Wellness Pvt. Ltd.", "email": "hello@vitalora.com", "phone": "+91 1800 123 4567", "address": "21 Wellness Avenue, Gurugram, Haryana, India", "businessHours": "Monday-Friday: 9:00 AM - 6:00 PM"}$$),
('policy', 'privacy', $${"title": "Privacy Policy", "body": "VITALORA Wellness Pvt. Ltd. respects your privacy. We collect only the information needed to process your orders and improve your experience, such as your name, contact details and shipping address. We never sell your personal data to third parties. Payment processing (Cash on Delivery) does not require us to store any card or banking details. You may request access to, correction of, or deletion of your personal data at any time by contacting hello@vitalora.com."}$$),
('policy', 'terms', $${"title": "Terms & Conditions", "body": "By using the VITALORA website and placing an order, you agree to provide accurate information, use the site lawfully, and accept that product availability and pricing may change without notice. All content, branding and product formulations are the property of VITALORA Wellness Pvt. Ltd. Orders are currently fulfilled via Cash on Delivery only. Continued use of this site constitutes acceptance of these terms."}$$),
('policy', 'shipping', $${"title": "Shipping Policy", "body": "We currently ship across India. Orders above Rs. 999 qualify for free shipping; orders below this amount incur a flat fee of Rs. 79. Most orders are delivered within 5-7 business days of confirmation, though remote locations may take longer. You will be able to track your order status from the My Orders section of your account."}$$),
('policy', 'refund', $${"title": "Returns & Refunds", "body": "We accept returns of unopened, unused products within 7 days of delivery. To initiate a return, contact our support team with your order number and reason for return. Once the returned product is inspected and approved, your refund will be processed to your original payment method (or as store credit, where applicable) within 7-10 business days."}$$);

-- ---------------------------------------------------------------------
-- banners
-- ---------------------------------------------------------------------
INSERT INTO banners (title, subtitle, image_url, cta_text, cta_link, display_order, is_active) VALUES
($$Start Your Wellness Journey$$, $$Get 15% off your first order$$, '/assets/brand/banner-promo.svg', 'Shop Now', '/products', 1, true),
($$New: VITALORA Sleep & Relax$$, $$Wind down naturally, wake up refreshed.$$, '/assets/brand/banner-sleep.svg', 'Shop Now', '/products/vitalora-sleep-relax', 2, true);
