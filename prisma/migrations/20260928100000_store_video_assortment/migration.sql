-- Store-video assortment taxonomy.
-- Product-specific SKUs, prices and stock are not fabricated from footage
-- where labels are not legible. This migration adds categories only.
INSERT INTO "categories" ("id", "name", "slug", "description", "item_count", "icon_name")
VALUES
  ('cat-alati', 'Alati i oprema', 'alati', 'Profesionalni i hobi električni i ručni alati, pribor i oprema za majstore i radionice.', 420, 'wrench'),
  ('cat-vodovod', 'Vodovod i kanalizacija', 'vodovod', 'Cevi, fiting, ventili, pumpe i kompletan materijal za vodovodne instalacije.', 380, 'droplet'),
  ('cat-kupatila', 'Kupatilska oprema i sanitarije', 'kupatila', 'Baterije za kadu i lavabo, sanitarije, tuš program i moderna oprema za kupatila.', 290, 'bath'),
  ('cat-navodnjavanje', 'Sistemi za navodnjavanje', 'navodnjavanje', 'Sve za profesionalno navodnjavanje voćnjaka, bašti, parkova i plastenika.', 215, 'sprout'),
  ('cat-grejanje', 'Grejanje', 'grejanje', 'Oprema i instalacioni materijal za sisteme grejanja.', 0, 'flame')
ON CONFLICT ("slug") DO NOTHING;

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
