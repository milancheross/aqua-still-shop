-- Consolidate the former "Mašine i radionica" top-level category into
-- the professional trade "Alati i oprema" hierarchy.
--
-- Existing products are preserved. Their subcategory records are moved first,
-- then products are pointed at the tools category before the obsolete category
-- is removed.

UPDATE "subcategories"
SET "category_id" = 'cat-alati'
WHERE "category_id" = 'cat-elektricni-alati';

UPDATE "products"
SET
  "category_slug" = 'alati',
  "category_name" = 'Alati i oprema'
WHERE "category_slug" = 'elektricni-alat';

DELETE FROM "categories"
WHERE "id" = 'cat-elektricni-alati'
   OR "slug" = 'elektricni-alat';
