export type CatalogTaxonomySubcategory = {
  id: string;
  name: string;
  slug: string;
};

export type CatalogTaxonomyCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  subcategories: CatalogTaxonomySubcategory[];
};

/**
 * Aqua Still Master Catalog Taxonomy v1.
 *
 * The structure follows the strongest recurring patterns found across
 * professional trade catalogues (Ferguson, Screwfix, Toolstation,
 * Reuter, Travis Perkins and City Plumbing), adapted to Aqua Still's
 * current assortment and Serbian market.
 *
 * Category = what the customer is buying.
 * Attributes/filters = technical properties used to narrow that category.
 */
export const AQUA_STILL_TAXONOMY: CatalogTaxonomyCategory[] = [
  {
    id: "cat-alati",
    name: "Alati i oprema",
    slug: "alati",
    description: "Profesionalni električni, akumulatorski i ručni alati, pribor, merni alati i oprema za radionicu.",
    iconName: "wrench",
    subcategories: [
      { id: "sub-aku-busilice", name: "Aku bušilice i odvijači", slug: "aku-busilice" },
      { id: "sub-brusilice", name: "Ugaone brusilice", slug: "brusilice" },
      { id: "sub-testere", name: "Testere i cirkulari", slug: "testere" },
      { id: "sub-rucni-alat", name: "Ručni alati i ključevi", slug: "rucni-alat" },
      { id: "sub-odvijaci", name: "Odvijači i bitovi", slug: "odvijaci-bitovi" },
      { id: "sub-klesta", name: "Klešta i sečice", slug: "klesta-secice" },
      { id: "sub-sekire-cekici", name: "Sekire i čekići", slug: "sekire-cekici" },
      { id: "sub-garniture-rucnog-alata", name: "Garniture ručnog alata", slug: "garniture-rucnog-alata" },
      { id: "sub-pribor-alati", name: "Pribor za električne alate", slug: "pribor-za-alate" },
      { id: "sub-merni-alat", name: "Merni i obeležavajući alat", slug: "merni-alat" },
      { id: "sub-tolsen-rucni", name: "Tolsen i ostali ručni alati", slug: "tolsen-rucni-alati" },
      { id: "sub-elektricne-busilice", name: "Električne bušilice i odvijači", slug: "elektricne-busilice-odvijaci" },
      { id: "sub-elektricne-brusilice", name: "Električne brusilice", slug: "elektricne-brusilice" },
      { id: "sub-burgije", name: "Burgije i pribor za bušenje", slug: "burgije-pribor-busenje" },
      { id: "sub-brusne-ploce", name: "Brusne i rezne ploče", slug: "brusne-rezne-ploce" },
      { id: "sub-elektro-pumpe", name: "Električne pumpe i ventilatori", slug: "elektricne-pumpe-ventilatori" },
    ],
  },
  {
    id: "cat-vodovod",
    name: "Vodovod i kanalizacija",
    slug: "vodovod",
    description: "Cevi, fiting, ventili, slavine, odvodnja, pumpe, vodomeri i montažni materijal za instalacije vode.",
    iconName: "droplet",
    subcategories: [
      { id: "sub-cevi", name: "Cevi", slug: "cevi" },
      { id: "sub-fiting", name: "Fiting i spojnice", slug: "fiting" },
      { id: "sub-ventili", name: "Ventili, zasuni i slavine", slug: "ventili" },
      { id: "sub-odvodnja", name: "Odvodnja, sifoni i slivnici", slug: "odvodnja-sifoni" },
      { id: "sub-pumpe-voda", name: "Pumpe za vodu i hidrofori", slug: "pumpe-za-vodu" },
      { id: "sub-zaptivni-materijal", name: "Zaptivni i montažni materijal", slug: "zaptivni-montazni-materijal" },
      { id: "sub-vodomeri", name: "Vodomer i regulacija", slug: "vodomeri-regulacija" },
      { id: "sub-vodovodni-alat", name: "Vodovodni alat", slug: "vodovodni-alat" },
      { id: "sub-cevna-izolacija", name: "Izolacija i nosači cevi", slug: "izolacija-nosaci-cevi" },
    ],
  },
  {
    id: "cat-kupatila",
    name: "Kupatilska oprema i sanitarije",
    slug: "kupatila",
    description: "Slavine, tuševi, sanitarije, ugradni sistemi, kupatilski nameštaj, oprema i galanterija.",
    iconName: "bath",
    subcategories: [
      { id: "sub-baterije", name: "Slavine i baterije", slug: "slavine-i-baterije" },
      { id: "sub-sanitarije", name: "WC šolje i sanitarije", slug: "sanitarije" },
      { id: "sub-ugradni-sistemi", name: "Ugradni sistemi i vodokotlići", slug: "ugradni-sistemi" },
      { id: "sub-tus-program", name: "Tuševi i tuš program", slug: "tus-program" },
      { id: "sub-tus-kabine", name: "Tuš kabine i paravani", slug: "tus-kabine" },
      { id: "sub-lavaboi", name: "Lavaboi", slug: "lavaboi" },
      { id: "sub-kade", name: "Kade i oprema za kade", slug: "kade" },
      { id: "sub-namestaj", name: "Kupatilski nameštaj", slug: "kupatilski-namestaj" },
      { id: "sub-kupatilski-pribor", name: "Kupatilski pribor i galanterija", slug: "kupatilski-pribor" },
      { id: "sub-ogledala", name: "Ogledala i ogledalni ormarići", slug: "ogledala" },
      { id: "sub-odvodi", name: "Kanalice, slivnici i odvodi", slug: "kupatilski-odvodi" },
    ],
  },
  {
    id: "cat-navodnjavanje",
    name: "Navodnjavanje i bašta",
    slug: "navodnjavanje",
    description: "Kap po kap sistemi, prskalice, pumpe, creva, spojnice i automatika za baštu, voćnjak i plastenik.",
    iconName: "sprout",
    subcategories: [
      { id: "sub-kap-po-kap", name: "Kap po kap sistemi", slug: "kap-po-kap" },
      { id: "sub-prskalice", name: "Rasprskivači i rotori", slug: "prskalice" },
      { id: "sub-creva", name: "Baštenska i tehnička creva", slug: "creva" },
      { id: "sub-automatika", name: "Elektroventili i tajmeri", slug: "automatika" },
      { id: "sub-navodnjavanje-fiting", name: "Spojnice i fiting za navodnjavanje", slug: "navodnjavanje-fiting" },
      { id: "sub-pumpe-navodnjavanje", name: "Pumpe za navodnjavanje", slug: "pumpe-navodnjavanje" },
      { id: "sub-filteri-navodnjavanje", name: "Filteri i regulacija pritiska", slug: "filteri-regulacija" },
      { id: "sub-basta-oprema", name: "Baštenska oprema i pribor", slug: "basta-oprema" },
    ],
  },
  {
    id: "cat-grejanje",
    name: "Grejanje",
    slug: "grejanje",
    description: "Radijatori, ventili, termostatska regulacija, cevi i pribor za sisteme grejanja.",
    iconName: "flame",
    subcategories: [
      { id: "sub-grejna-tela", name: "Radijatori i grejna tela", slug: "radijatori-grejna-tela" },
      { id: "sub-ventili-grejanje", name: "Ventili i termostatska regulacija", slug: "ventili-termostatska-regulacija" },
      { id: "sub-pribor-grejanje", name: "Pribor za grejanje", slug: "pribor-za-grejanje" },
      { id: "sub-cevi-grejanje", name: "Cevi i fiting za grejanje", slug: "cevi-fiting-grejanje" },
      { id: "sub-pumpe-grejanje", name: "Cirkulacione pumpe", slug: "cirkulacione-pumpe" },
    ],
  },
  {
    id: "cat-boje-hemija",
    name: "Boje, lakovi, lepkovi i hemija",
    slug: "boje-lakovi-hemija",
    description: "Boje, lakovi, impregnacije, silikoni, pur-pene, lepkovi, trake i hidroizolacioni materijali.",
    iconName: "paintbrush",
    subcategories: [
      { id: "sub-boje-zidne", name: "Boje za zidove", slug: "boje-za-zidove" },
      { id: "sub-lakovi-impregnacije", name: "Lakovi i impregnacije", slug: "lakovi-impregnacije" },
      { id: "sub-silikoni-pur-pene", name: "Silikoni i pur-pene", slug: "silikoni-pur-pene" },
      { id: "sub-lepkovi-trake", name: "Lepkovi i trake", slug: "lepkovi-krep-trake" },
      { id: "sub-hidroizolacija", name: "Hidroizolacioni materijali", slug: "hidroizolacija" },
      { id: "sub-zaptivne-mase", name: "Zaptivne mase i kitovi", slug: "zaptivne-mase" },
    ],
  },
  {
    id: "cat-rasveta-elektro",
    name: "Elektro-oprema i rasveta",
    slug: "rasveta-elektro-oprema",
    description: "LED rasveta, kablovi, produžni kablovi, sklopke, utičnice i elektro pribor.",
    iconName: "lightbulb",
    subcategories: [
      { id: "sub-led-rasveta", name: "LED rasveta", slug: "led-rasveta" },
      { id: "sub-kablovi", name: "Kablovi i produžni kablovi", slug: "kablovi-produzni" },
      { id: "sub-sklopke", name: "Sklopke, utičnice i elektro-pribor", slug: "sklopke-elektro-pribor" },
      { id: "sub-baterije-elektro", name: "Baterije i akumulatori", slug: "elektro-baterije" },
      { id: "sub-merenje-elektro", name: "Merni i ispitni uređaji", slug: "merni-ispitni-uredjaji" },
    ],
  },
  {
    id: "cat-vijcana-roba",
    name: "Vijčana roba i pričvrsni materijal",
    slug: "vijcana-roba",
    description: "Šrafovi, tiplovi, ekseri, matice, podloške i elementi za pričvršćivanje i montažu.",
    iconName: "nut",
    subcategories: [
      { id: "sub-srafovi-tiplovi", name: "Šrafovi i tiplovi", slug: "srafovi-tiplovi" },
      { id: "sub-ekseri", name: "Ekseri", slug: "ekseri" },
      { id: "sub-matice-podloske", name: "Matice i podloške", slug: "matice-podloske" },
      { id: "sub-metalni-elementi", name: "Metalni elementi za pričvršćivanje", slug: "metalni-elementi-pricvrscivanje" },
      { id: "sub-ankeri", name: "Ankeri i specijalno pričvršćivanje", slug: "ankeri-specijalno-pricvrscivanje" },
    ],
  },
  {
    id: "cat-gradjevinska-oprema",
    name: "Građevinska i zaštitna oprema",
    slug: "gradjevinska-zastitna-oprema",
    description: "Merdevine, građevinska kolica, mešalice, ručni građevinski alat i lična zaštitna oprema.",
    iconName: "hard-hat",
    subcategories: [
      { id: "sub-merdevine", name: "Merdevine i platforme", slug: "merdevine" },
      { id: "sub-kolica", name: "Građevinska kolica", slug: "gradjevinska-kolica" },
      { id: "sub-mesalice-beton", name: "Mešalice za beton", slug: "mesalice-za-beton" },
      { id: "sub-zastitna-oprema", name: "Radne rukavice i zaštitna oprema", slug: "radne-rukavice-zastitna-oprema" },
      { id: "sub-gradjevinski-alat", name: "Građevinski i zidarski alat", slug: "gradjevinski-alat" },
    ],
  },
  {
    id: "cat-kuca-dvoriste",
    name: "Kuća, dvorište i čišćenje",
    slug: "kuca-dvoriste-ciscenje",
    description: "Oprema za domaćinstvo, dvorište, čišćenje, skladištenje i baštenske potrebe.",
    iconName: "house",
    subcategories: [
      { id: "sub-ciscenje", name: "Četke i oprema za čišćenje", slug: "cetke-oprema-ciscenje" },
      { id: "sub-kante-kanisteri", name: "Kante i kanisteri", slug: "kante-kanisteri" },
      { id: "sub-uzad-kace-burad", name: "Užad, kace i burad", slug: "uzad-kace-burad" },
      { id: "sub-dvoriste", name: "Oprema za dvorište", slug: "oprema-za-dvoriste" },
      { id: "sub-skladistenje", name: "Kutije, posude i skladištenje", slug: "skladistenje" },
    ],
  },
];

export const AQUA_STILL_CATEGORY_ORDER = AQUA_STILL_TAXONOMY.map((category) => category.slug);
