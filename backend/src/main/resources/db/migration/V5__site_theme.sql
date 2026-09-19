-- =====================================================================
-- The active storefront theme, chosen in the admin panel.
--
-- Only the key is stored: the colours themselves live in the frontend's
-- generated theme stylesheet, so a theme can be retuned without a data
-- migration, and an unknown key simply falls back to the default.
-- =====================================================================

INSERT INTO cms_content (page_key, section_key, content_json)
VALUES ('site', 'theme', $${"key": "emerald"}$$)
ON CONFLICT (page_key, section_key) DO NOTHING;
