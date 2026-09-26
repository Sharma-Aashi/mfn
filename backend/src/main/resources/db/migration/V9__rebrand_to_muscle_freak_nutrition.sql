-- =====================================================================
-- Rebrand: VITALORA -> MUSCLE FREAK NUTRITION.
--
-- The storefront reads its brand name, footer and page copy out of
-- cms_content, so the name in the header and footer lives in the
-- database, not in the build. Changing the frontend defaults alone
-- would leave production untouched: a saved row always wins over them.
--
-- Everything below is a targeted replacement rather than a rewrite, so
-- copy an admin has already edited keeps those edits, and the whole
-- migration is a no-op on a database that is already renamed.
-- =====================================================================

-- ---------------------------------------------------------------------
-- cms_content: brand, footer, home ("Why VITALORA?"), about, policies
-- ---------------------------------------------------------------------

-- The old legal entity goes first, so the general replacement below
-- cannot turn it into "MUSCLE FREAK NUTRITION Wellness Pvt. Ltd.".
UPDATE cms_content
SET content_json = REPLACE(content_json, 'VITALORA Wellness Pvt. Ltd.', 'MUSCLE FREAK NUTRITION'),
    updated_at = now()
WHERE content_json LIKE '%VITALORA Wellness Pvt. Ltd.%';

UPDATE cms_content
SET content_json = REPLACE(content_json, 'VITALORA', 'MUSCLE FREAK NUTRITION'),
    updated_at = now()
WHERE content_json LIKE '%VITALORA%';

-- ---------------------------------------------------------------------
-- faqs
-- ---------------------------------------------------------------------
UPDATE faqs
SET question   = REPLACE(question, 'VITALORA Wellness Pvt. Ltd.', 'MUSCLE FREAK NUTRITION'),
    answer     = REPLACE(answer,   'VITALORA Wellness Pvt. Ltd.', 'MUSCLE FREAK NUTRITION'),
    updated_at = now()
WHERE question LIKE '%VITALORA Wellness Pvt. Ltd.%' OR answer LIKE '%VITALORA Wellness Pvt. Ltd.%';

UPDATE faqs
SET question   = REPLACE(question, 'VITALORA', 'MUSCLE FREAK NUTRITION'),
    answer     = REPLACE(answer,   'VITALORA', 'MUSCLE FREAK NUTRITION'),
    updated_at = now()
WHERE question LIKE '%VITALORA%' OR answer LIKE '%VITALORA%';

-- ---------------------------------------------------------------------
-- The template's placeholder mailbox and toll-free number were copied
-- into the support FAQ and the privacy policy as literal text, so
-- editing the contact page never reached them. Push the real details
-- out from the contact page instead of hardcoding them a second time.
--
-- Guarded rather than unconditional: on a database where nobody has
-- filled the contact page in yet there is nothing truthful to copy, and
-- inventing an address is worse than leaving the seed placeholder.
-- ---------------------------------------------------------------------
DO $rebrand$
DECLARE
    real_email   TEXT;
    real_phone   TEXT;
    real_address TEXT;
BEGIN
    SELECT content_json::jsonb ->> 'email',
           content_json::jsonb ->> 'phone',
           content_json::jsonb ->> 'address'
      INTO real_email, real_phone, real_address
      FROM cms_content
     WHERE page_key = 'contact' AND section_key = 'info';

    IF COALESCE(real_email, '') <> '' AND real_email NOT LIKE '%vitalora.com' THEN
        UPDATE cms_content
        SET content_json = REPLACE(content_json, 'hello@vitalora.com', real_email), updated_at = now()
        WHERE content_json LIKE '%hello@vitalora.com%';

        UPDATE faqs
        SET answer = REPLACE(answer, 'hello@vitalora.com', real_email), updated_at = now()
        WHERE answer LIKE '%hello@vitalora.com%';
    END IF;

    IF COALESCE(real_phone, '') <> '' AND real_phone <> '+91 1800 123 4567' THEN
        UPDATE cms_content
        SET content_json = REPLACE(content_json, '+91 1800 123 4567', real_phone), updated_at = now()
        WHERE content_json LIKE '%+91 1800 123 4567%';

        UPDATE faqs
        SET answer = REPLACE(answer, '+91 1800 123 4567', real_phone), updated_at = now()
        WHERE answer LIKE '%+91 1800 123 4567%';
    END IF;

    -- The seed placed the company at a Gurugram address. Only correct the
    -- FAQ once the contact page says somewhere else, so the two pages can
    -- never disagree about where the business actually is.
    IF COALESCE(real_address, '') <> '' AND real_address NOT LIKE '%Gurugram%' THEN
        UPDATE faqs
        SET answer = 'MUSCLE FREAK NUTRITION is based in Samalkha, Haryana, India, and we currently ship across India.',
            updated_at = now()
        WHERE answer LIKE '%based in Gurugram, Haryana%';
    END IF;
END
$rebrand$;

-- ---------------------------------------------------------------------
-- products: several were still carrying the old brand in their name,
-- slug and body copy. The two already renamed through the admin use the
-- short "MFN" prefix, so these follow that convention.
-- ---------------------------------------------------------------------
UPDATE products
SET name               = REPLACE(name, 'VITALORA ', 'MFN '),
    short_description  = REPLACE(COALESCE(short_description, ''), 'VITALORA', 'MFN'),
    description        = REPLACE(COALESCE(description, ''), 'VITALORA', 'MFN'),
    benefits           = REPLACE(COALESCE(benefits, ''), 'VITALORA', 'MFN'),
    ingredients        = REPLACE(COALESCE(ingredients, ''), 'VITALORA', 'MFN'),
    usage_instructions = REPLACE(COALESCE(usage_instructions, ''), 'VITALORA', 'MFN'),
    warnings           = REPLACE(COALESCE(warnings, ''), 'VITALORA', 'MFN'),
    updated_at = now()
WHERE name LIKE '%VITALORA%'
   OR COALESCE(short_description, '') || COALESCE(description, '') || COALESCE(benefits, '')
      || COALESCE(ingredients, '') || COALESCE(usage_instructions, '') || COALESCE(warnings, '') LIKE '%VITALORA%';

-- Slugs are URLs and unique, so this is a separate, guarded statement: a
-- product whose mfn- slug is somehow already taken keeps its old one
-- rather than failing the whole migration and the deploy with it.
UPDATE products p
SET slug = REPLACE(p.slug, 'vitalora-', 'mfn-'),
    updated_at = now()
WHERE p.slug LIKE 'vitalora-%'
  AND NOT EXISTS (
        SELECT 1 FROM products x
        WHERE x.slug = REPLACE(p.slug, 'vitalora-', 'mfn-') AND x.id <> p.id
  );

UPDATE product_images
SET alt_text = REPLACE(alt_text, 'VITALORA ', 'MFN ')
WHERE alt_text LIKE '%VITALORA %';
