-- =====================================================================
-- Brand voice: replace the wellness-template copy the storefront
-- inherited with wording that fits what the shop actually sells.
--
-- Separate from V9 on purpose. V9 is a mechanical rename that is always
-- safe to run; this one is editorial, and the owner will rewrite it. A
-- later hand edit through the admin must not be reverted by a re-run, so
-- every statement matches on the exact seed text and touches nothing
-- else.
-- =====================================================================

-- Tagline. Shown next to the logo, in <title> and in link previews.
UPDATE cms_content
SET content_json = jsonb_set(
        content_json::jsonb, '{tagline}', '"Train Hard. Fuel Right."'::jsonb, false
    )::text,
    updated_at = now()
WHERE page_key = 'site' AND section_key = 'brand'
  AND content_json::jsonb ->> 'tagline' = 'Better Health. Better Every Day.';

-- Footer blurb: it opened by repeating the old tagline word for word.
UPDATE cms_content
SET content_json = jsonb_set(
        content_json::jsonb, '{about}',
        '"Genuine sports nutrition, sourced through authorised channels. Protein, pre-workout and daily essentials for people who train seriously."'::jsonb,
        false
    )::text,
    updated_at = now()
WHERE page_key = 'site' AND section_key = 'footer'
  AND content_json::jsonb ->> 'about' =
      'Better Health. Better Every Day. Premium, science-backed supplements for modern wellness routines.';

-- The homepage headline was left mid-sentence ("Elevate Your.") by an
-- edit that was never finished, and it is the first thing a visitor
-- reads.
UPDATE cms_content
SET content_json = jsonb_set(
        content_json::jsonb, '{title}', '"Fuel Every Session."'::jsonb, false
    )::text,
    updated_at = now()
WHERE page_key = 'home' AND section_key = 'hero'
  AND content_json::jsonb ->> 'title' IN (
        'Fuel Your Health. Elevate Your.',
        'Fuel Your Health. Elevate Your Every Day.'
  );
