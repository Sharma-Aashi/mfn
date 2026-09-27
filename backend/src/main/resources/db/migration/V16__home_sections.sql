-- =====================================================================
-- The home page's running order, as data.
--
-- One JSON array in the CMS rather than a table of its own: the whole
-- thing is nine short rows the owner reorders and toggles, and the CMS
-- already gives that an endpoint, an admin screen and a save path. A
-- table would have added a migration, an entity, a repository and a
-- controller to store nine rows.
--
-- The array's order IS the page's order, so moving a block up is a swap
-- rather than renumbering a column. `key` binds each row to the markup
-- that renders it and is not editable; the heading is the words.
--
-- Banner images are picked from photographs shipped with the frontend
-- build, not uploaded: the API's upload folder is wiped on every
-- container restart, so an uploaded banner disappears on the next
-- deploy.
-- =====================================================================

INSERT INTO cms_content (page_key, section_key, content_json)
SELECT 'home', 'sections', $$[
  {"key": "hero",        "heading": "",                    "visible": true, "image": "assets/brand/banner-barbell.png"},
  {"key": "hot",         "heading": "Hot right now",       "visible": true},
  {"key": "categories",  "heading": "Shop by category",    "visible": true},
  {"key": "midBanner",   "heading": "",                    "visible": true, "image": "assets/brand/banner-dumbbells.png"},
  {"key": "bestSellers", "heading": "Best sellers",        "visible": true},
  {"key": "stacks",      "heading": "Stacks that work together", "visible": true},
  {"key": "goals",       "heading": "Shop by goal",        "visible": true},
  {"key": "brands",      "heading": "Brands we stock",     "visible": true},
  {"key": "story",       "heading": "",                    "visible": true}
]$$
WHERE NOT EXISTS (
    SELECT 1 FROM cms_content WHERE page_key = 'home' AND section_key = 'sections'
);
