-- Add missing catalog groups from the store's supplied assortment.
-- Existing categories and subcategories are preserved; inserts are idempotent.

INSERT INTO categories (id, name, slug, description, item_count, icon_name, created_at)
VALUES
  ('cat-elektricni-alati', 'Električni alat i mašine', 'elektricni-alat', 'Električne i akumulatorske bušilice, brusilice, mešalice i mašine za radionicu.', 0, 'drill', NOW()),
  ('cat-boje-hemija', 'Boje, lakovi i hemija', 'boje-lakovi-hemija', 'Boje, lakovi, impregnacije, lepkovi, zaptivne mase i materijali za hidroizolaciju.', 0, 'paintbrush', NOW()),
  ('cat-rasveta-elektro', 'Rasveta i elektro-oprema', 'rasveta-elektro-oprema', 'LED rasveta, kablovi, produžni kablovi, sklopke i baterije.', 0, 'lightbulb', NOW()),
  ('cat-vijcana-roba', 'Vijčana roba i metalni delovi', 'vijcana-roba', 'Šrafovi, tiplovi, ekseri i elementi za pričvršćivanje i montažu.', 0, 'nut', NOW()),
  ('cat-gradjevinska-oprema', 'Građevinska i zaštitna oprema', 'gradjevinska-zastitna-oprema', 'Merdevine, građevinska kolica, mešalice za beton, rukavice i lična zaštitna oprema.', 0, 'hard-hat', NOW()),
  ('cat-kuca-dvoriste', 'Oprema za kuću, dvorište i čišćenje', 'kuca-dvoriste-ciscenje', 'Četke, kante, baštenska creva, kanisteri, užad, kace i burad.', 0, 'house', NOW())
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (id, category_id, name, slug, item_count, created_at)
VALUES
  ('sub-sekire-cekici', 'cat-alati', 'Sekire i čekići', 'sekire-cekici', 0, NOW()),
  ('sub-odvijaci-bitovi-rucni', 'cat-alati', 'Odvijači i garniture bitova', 'odvijaci-garniture-bitova', 0, NOW()),
  ('sub-garniture-rucnog-alata', 'cat-alati', 'Garniture ručnog alata', 'garniture-rucnog-alata', 0, NOW()),
  ('sub-burgije', 'cat-elektricni-alati', 'Burgije i pribor za bušenje', 'burgije-pribor-busenje', 0, NOW()),
  ('sub-brusne-ploce', 'cat-elektricni-alati', 'Brusne i rezne ploče', 'brusne-rezne-ploce', 0, NOW()),
  ('sub-mesalice', 'cat-elektricni-alati', 'Mešalice za boju i malter', 'mesalice-boju-malter', 0, NOW()),
  ('sub-elektro-pumpe', 'cat-elektricni-alati', 'Električne pumpe i ventilatori', 'elektricne-pumpe-ventilatori', 0, NOW()),
  ('sub-boje-zidne', 'cat-boje-hemija', 'Boje za zidove', 'boje-za-zidove', 0, NOW()),
  ('sub-lakovi-impregnacije', 'cat-boje-hemija', 'Lakovi i impregnacije', 'lakovi-impregnacije', 0, NOW()),
  ('sub-silikoni-pur-pene', 'cat-boje-hemija', 'Silikoni i pur-pene', 'silikoni-pur-pene', 0, NOW()),
  ('sub-lepkovi-trake', 'cat-boje-hemija', 'Lepkovi i krep trake', 'lepkovi-krep-trake', 0, NOW()),
  ('sub-hidroizolacija', 'cat-boje-hemija', 'Hidroizolacioni materijali', 'hidroizolacija', 0, NOW()),
  ('sub-led-rasveta', 'cat-rasveta-elektro', 'LED rasveta', 'led-rasveta', 0, NOW()),
  ('sub-kablovi', 'cat-rasveta-elektro', 'Kablovi i produžni kablovi', 'kablovi-produzni', 0, NOW()),
  ('sub-sklopke', 'cat-rasveta-elektro', 'Sklopke i elektro-pribor', 'sklopke-elektro-pribor', 0, NOW()),
  ('sub-baterije-elektro', 'cat-rasveta-elektro', 'Baterije', 'elektro-baterije', 0, NOW()),
  ('sub-srafovi-tiplovi', 'cat-vijcana-roba', 'Šrafovi i tiplovi', 'srafovi-tiplovi', 0, NOW()),
  ('sub-ekseri', 'cat-vijcana-roba', 'Ekseri', 'ekseri', 0, NOW()),
  ('sub-metalni-elementi', 'cat-vijcana-roba', 'Metalni elementi za pričvršćivanje', 'metalni-elementi-pricvrscivanje', 0, NOW()),
  ('sub-merdevine', 'cat-gradjevinska-oprema', 'Drvene i aluminijumske merdevine', 'merdevine', 0, NOW()),
  ('sub-kolica', 'cat-gradjevinska-oprema', 'Građevinska kolica', 'gradjevinska-kolica', 0, NOW()),
  ('sub-mesalice-beton', 'cat-gradjevinska-oprema', 'Mešalice za beton', 'mesalice-za-beton', 0, NOW()),
  ('sub-zastitna-oprema', 'cat-gradjevinska-oprema', 'Radne rukavice i zaštitna oprema', 'radne-rukavice-zastitna-oprema', 0, NOW()),
  ('sub-ciscenje', 'cat-kuca-dvoriste', 'Četke i oprema za čišćenje', 'cetke-oprema-ciscenje', 0, NOW()),
  ('sub-kante-kanisteri', 'cat-kuca-dvoriste', 'Kante i kanisteri', 'kante-kanisteri', 0, NOW()),
  ('sub-uzad-kace-burad', 'cat-kuca-dvoriste', 'Užad, kace i burad', 'uzad-kace-burad', 0, NOW())
ON CONFLICT (slug) DO NOTHING;
