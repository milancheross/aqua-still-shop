-- Store-video assortment taxonomy.
-- Product-specific SKUs, prices and stock are not fabricated from footage
-- where labels are not legible. This migration adds categories only.
INSERT INTO "categories" ("id", "name", "slug", "description", "item_count", "icon_name")
VALUES ('cat-grejanje', 'Grejanje', 'grejanje', 'Oprema i instalacioni materijal za sisteme grejanja.', 0, 'flame')
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description";

INSERT INTO "subcategories" ("id", "category_id", "name", "slug", "item_count")
VALUES
  ('sub-tolsen-rucni', 'cat-alati', 'Tolsen i ostali ručni alati', 'tolsen-rucni-alati', 0),
  ('sub-pribor-alati', 'cat-alati', 'Pribor za električne alate', 'pribor-za-alate', 0),
  ('sub-odvijaci', 'cat-alati', 'Odvijači i bitovi', 'odvijaci-bitovi', 0),
  ('sub-klesta', 'cat-alati', 'Klešta i sečice', 'klesta-secice', 0),
  ('sub-merni-alat', 'cat-alati', 'Merni i obeležavajući alat', 'merni-alat', 0),
  ('sub-zaptivni-materijal', 'cat-vodovod', 'Zaptivni i montažni materijal', 'zaptivni-montazni-materijal', 0),
  ('sub-odvodnja', 'cat-vodovod', 'Odvodnja i sifoni', 'odvodnja-sifoni', 0),
  ('sub-grejna-tela', 'cat-grejanje', 'Radijatori i grejna tela', 'radijatori-grejna-tela', 0),
  ('sub-ventili-grejanje', 'cat-grejanje', 'Ventili i termostatska regulacija', 'ventili-termostatska-regulacija', 0),
  ('sub-pribor-grejanje', 'cat-grejanje', 'Pribor za grejanje', 'pribor-za-grejanje', 0),
  ('sub-kupatilski-pribor', 'cat-kupatila', 'Kupatilski pribor i galanterija', 'kupatilski-pribor', 0)
ON CONFLICT ("slug") DO UPDATE SET "name" = EXCLUDED."name";

INSERT INTO "brands" ("id", "name", "slug")
VALUES ('brand-tolsen', 'Tolsen', 'tolsen')
ON CONFLICT ("name") DO UPDATE SET "slug" = EXCLUDED."slug";
