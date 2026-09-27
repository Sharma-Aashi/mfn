-- =====================================================================
-- Copy for the rebuilt home page.
--
-- The new layout reads four CMS fields the old one did not use the same
-- way: the hero eyebrow is a badge over the photograph, the promo
-- banner's subtitle is now a short kicker rather than a sentence, and
-- the "why" section gained a body paragraph - the founder's note, which
-- is the one block on the page a competitor cannot copy.
--
-- Every statement matches on the exact text it is replacing, so a line
-- already rewritten through the admin is left alone and a re-run is a
-- no-op.
-- =====================================================================

-- ---------------------------------------------------------------------
-- hero
-- ---------------------------------------------------------------------
UPDATE cms_content
SET content_json = jsonb_set(content_json::jsonb, '{eyebrow}', '"Train hard. Fuel right."'::jsonb, true)::text,
    updated_at = now()
WHERE page_key = 'home' AND section_key = 'hero'
  AND content_json::jsonb ->> 'eyebrow' = 'Science-Backed Wellness';

UPDATE cms_content
SET content_json = jsonb_set(content_json::jsonb, '{title}', '"Built for the last rep."'::jsonb, true)::text,
    updated_at = now()
WHERE page_key = 'home' AND section_key = 'hero'
  AND content_json::jsonb ->> 'title' IN (
        'Fuel Every Session.',
        'Fuel Your Health. Elevate Your.',
        -- the seed's own wording, which earlier migrations missed by a space
        'Fuel Your Health. Elevate Your Everyday.',
        'Fuel Your Health. Elevate Your Every Day.'
  );

UPDATE cms_content
SET content_json = jsonb_set(
        content_json::jsonb, '{subtitle}',
        '"Protein, pre-workout and creatine from brands we can vouch for - delivered across India, cash on delivery."'::jsonb, true
    )::text,
    updated_at = now()
WHERE page_key = 'home' AND section_key = 'hero'
  AND content_json::jsonb ->> 'subtitle' =
      'Premium, thoughtfully formulated supplements designed to support your energy, immunity, wellness and active lifestyle.';

UPDATE cms_content
SET content_json = jsonb_set(content_json::jsonb, '{primaryCtaText}', '"Shop the range"'::jsonb, true)::text,
    updated_at = now()
WHERE page_key = 'home' AND section_key = 'hero'
  AND content_json::jsonb ->> 'primaryCtaText' = 'Shop Supplements';

-- ---------------------------------------------------------------------
-- promo banner: the subtitle is now a badge, so it has to be short
-- ---------------------------------------------------------------------
UPDATE cms_content
SET content_json = jsonb_set(
        jsonb_set(content_json::jsonb, '{subtitle}', '"Launch offer"'::jsonb, true),
        '{title}', '"Fresh stock, straight from the distributor."'::jsonb, true
    )::text,
    updated_at = now()
WHERE page_key = 'home' AND section_key = 'promoBanner'
  AND content_json::jsonb ->> 'title' = 'Start Your Wellness Journey';

-- ---------------------------------------------------------------------
-- the story band
-- ---------------------------------------------------------------------
UPDATE cms_content
SET content_json = jsonb_set(content_json::jsonb, '{heading}', '"We only stock what we can vouch for."'::jsonb, true)::text,
    updated_at = now()
WHERE page_key = 'home' AND section_key = 'whyVitalora'
  AND content_json::jsonb ->> 'heading' IN ('Why MUSCLE FREAK NUTRITION?', 'Why VITALORA?');

-- The founder's note. Seeded so the band is not empty on first load; the
-- owner is expected to rewrite it in their own words, and once they do
-- this migration will not touch it again.
UPDATE cms_content
SET content_json = jsonb_set(
        content_json::jsonb, '{body}',
        to_jsonb('Fake supplements are easy to buy and hard to spot - and you usually find out only once the tub is finished. '
              || 'We built Muscle Freak Nutrition so that stops being your problem. Every brand here comes through an '
              || 'authorised channel, every label is printed in full, and if you want to know where a tub came from, '
              || 'ask us: we keep the paperwork.'::text),
        true
    )::text,
    updated_at = now()
WHERE page_key = 'home' AND section_key = 'whyVitalora'
  AND COALESCE(content_json::jsonb ->> 'body', '') = '';
