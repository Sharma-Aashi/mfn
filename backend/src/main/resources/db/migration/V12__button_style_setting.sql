-- =====================================================================
-- Which look every primary button wears: black, green or white.
--
-- It rides along in the existing site/theme row rather than getting a
-- row of its own, because the admin saves the whole theme section in one
-- PUT and a second row would just be another thing to keep in step.
--
-- Deliberately separate from the theme's accent colour. The accent is
-- the trust colour - genuine ticks, links, in-stock labels - and stays
-- green whichever button style is chosen. Making one control both is
-- what produced a storefront that read like a chemist.
--
-- Black is the default: on a white card with a white-background pack, a
-- green button competes with the product photography.
-- =====================================================================

UPDATE cms_content
SET content_json = ('{"buttonStyle": "black"}'::jsonb || content_json::jsonb)::text,
    updated_at = now()
WHERE page_key = 'site'
  AND section_key = 'theme'
  AND content_json::jsonb ->> 'buttonStyle' IS NULL;

-- A database that somehow has no theme row at all still needs one.
INSERT INTO cms_content (page_key, section_key, content_json)
SELECT 'site', 'theme', $${"key": "emerald", "buttonStyle": "black"}$$
WHERE NOT EXISTS (
    SELECT 1 FROM cms_content WHERE page_key = 'site' AND section_key = 'theme'
);
