-- Complete the electric tools category with dedicated drill and grinder groups.
INSERT INTO subcategories (id, category_id, name, slug, item_count, created_at)
VALUES
  ('sub-elektricne-busilice', 'cat-elektricni-alati', 'Električne bušilice i odvijači', 'elektricne-busilice-odvijaci', 0, NOW()),
  ('sub-elektricne-brusilice', 'cat-elektricni-alati', 'Električne brusilice', 'elektricne-brusilice', 0, NOW())
ON CONFLICT (slug) DO NOTHING;
