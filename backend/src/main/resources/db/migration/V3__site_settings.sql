-- =====================================================================
-- Site-wide settings so brand identity, navigation, footer, social links
-- and commerce rules become admin-editable instead of hardcoded in the
-- frontend build.
-- =====================================================================

INSERT INTO cms_content (page_key, section_key, content_json) VALUES
('site', 'brand', $${"name": "VITALORA", "tagline": "Better Health. Better Every Day.", "logoUrl": ""}$$),
('site', 'footer', $${"about": "Better Health. Better Every Day. Premium, science-backed supplements for modern wellness routines.", "copyrightName": "VITALORA Wellness Pvt. Ltd."}$$),
('site', 'social', $${"instagram": "", "facebook": "", "twitter": "", "youtube": ""}$$),
('site', 'nav', $${"links": [{"label": "Home", "path": "/"}, {"label": "Shop", "path": "/products"}, {"label": "About", "path": "/about"}, {"label": "Contact", "path": "/contact"}, {"label": "FAQ", "path": "/faq"}]}$$),
('site', 'commerce', $${"freeShippingThreshold": 999, "shippingFee": 79, "estimatedDeliveryDays": 5}$$);

-- The hero badge text was hardcoded in the template. Merge it into the existing
-- hero JSON so any hero edits already made in production are preserved.
UPDATE cms_content
SET content_json = ('{"eyebrow": "Science-Backed Wellness"}'::jsonb || content_json::jsonb)::text
WHERE page_key = 'home' AND section_key = 'hero';

-- About page hero image was hardcoded in the template; make it content.
INSERT INTO cms_content (page_key, section_key, content_json) VALUES
('about', 'storyImage', $${"url": "/assets/brand/about-story.svg"}$$);

-- Give the contact page an optional Google Maps embed URL. Existing keys win
-- (right side of ||), so contact details already edited in production survive.
UPDATE cms_content
SET content_json = ('{"mapEmbedUrl": ""}'::jsonb || content_json::jsonb)::text
WHERE page_key = 'contact' AND section_key = 'info';
