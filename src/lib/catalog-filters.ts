export type CatalogFilterType = "select" | "range" | "boolean";

export interface CatalogFilterDefinition {
  key: string;
  label: string;
  type: CatalogFilterType;
  unit?: string;
  options?: string[];
}

const commonFilters: CatalogFilterDefinition[] = [
  { key: "materijal", label: "Materijal", type: "select" },
  { key: "tip", label: "Tip / Namena", type: "select" },
];

export const CATEGORY_FILTERS: Record<string, CatalogFilterDefinition[]> = {
  alati: [
    { key: "napon", label: "Napon", type: "select" },
    { key: "snaga", label: "Snaga", type: "select" },
    { key: "motor", label: "Tip motora", type: "select" },
    { key: "prihvat", label: "Prihvat", type: "select" },
    { key: "materijal", label: "Materijal", type: "select" },
  ],
  vodovod: [
    { key: "precnik", label: "Prečnik / Dimenzija", type: "select" },
    { key: "materijal", label: "Materijal", type: "select" },
    { key: "pritisak", label: "Radni pritisak", type: "select" },
    { key: "prikljucak", label: "Priključak", type: "select" },
  ],
  kupatila: [
    { key: "zavrsna_obrada", label: "Završna obrada", type: "select" },
    { key: "montaza", label: "Vrsta montaže", type: "select" },
    { key: "kartusa", label: "Tip mešača", type: "select" },
    { key: "materijal", label: "Materijal", type: "select" },
  ],
  navodnjavanje: [
    { key: "prikljucak", label: "Navoj / Priključak", type: "select" },
    { key: "domet", label: "Domet rasprskivanja", type: "select" },
    { key: "protok", label: "Protok vode", type: "select" },
    { key: "pritisak", label: "Radni pritisak", type: "select" },
    { key: "materijal", label: "Materijal", type: "select" },
    { key: "napon", label: "Napon", type: "select" },
  ],
  grejanje: [
    { key: "tip", label: "Tip grejnog sistema", type: "select" },
    { key: "materijal", label: "Materijal", type: "select" },
    { key: "precnik", label: "Prečnik", type: "select" },
    { key: "pritisak", label: "Pritisak", type: "select" },
  ],
  "boje-lakovi-hemija": [
    { key: "tip", label: "Tip proizvoda", type: "select" },
    { key: "materijal", label: "Materijal / Podloga", type: "select" },
    { key: "pakovanje", label: "Pakovanje", type: "select" },
  ],
  "rasveta-elektro-oprema": [
    { key: "napon", label: "Napon", type: "select" },
    { key: "snaga", label: "Snaga", type: "select" },
    { key: "tip", label: "Tip proizvoda", type: "select" },
  ],
  "vijcana-roba": [
    { key: "tip", label: "Tip pričvršćivača", type: "select" },
    { key: "materijal", label: "Materijal", type: "select" },
    { key: "precnik", label: "Prečnik", type: "select" },
    { key: "duzina", label: "Dužina", type: "select" },
  ],
  "gradjevinska-zastitna-oprema": [
    { key: "tip", label: "Tip opreme", type: "select" },
    { key: "materijal", label: "Materijal", type: "select" },
    { key: "duzina", label: "Dužina / Visina", type: "select" },
  ],
  "kuca-dvoriste-ciscenje": [
    { key: "tip", label: "Tip proizvoda", type: "select" },
    { key: "materijal", label: "Materijal", type: "select" },
    { key: "duzina", label: "Dužina", type: "select" },
  ],
};

export const SUBCATEGORY_FILTERS: Record<string, CatalogFilterDefinition[]> = {
  "aku-busilice": [
    { key: "napon", label: "Napon", type: "select" },
    { key: "motor", label: "Tip motora", type: "select" },
    { key: "prihvat", label: "Prihvat", type: "select" },
    { key: "obrtni_moment", label: "Obrtni moment", type: "select" },
  ],
  brusilice: [
    { key: "napon", label: "Napon", type: "select" },
    { key: "snaga", label: "Snaga", type: "select" },
    { key: "precnik", label: "Prečnik diska", type: "select" },
    { key: "prihvat", label: "Prihvat", type: "select" },
  ],
  testere: [
    { key: "napon", label: "Napon", type: "select" },
    { key: "snaga", label: "Snaga", type: "select" },
    { key: "precnik", label: "Prečnik lista", type: "select" },
  ],
  "rucni-alat": [
    { key: "materijal", label: "Materijal", type: "select" },
    { key: "tip", label: "Tip alata", type: "select" },
    { key: "broj_delova", label: "Broj delova", type: "select" },
  ],
  "odvijaci-bitovi": [
    { key: "tip", label: "Tip", type: "select" },
    { key: "prihvat", label: "Prihvat", type: "select" },
    { key: "broj_delova", label: "Broj delova", type: "select" },
  ],
  cevi: [
    { key: "precnik", label: "Prečnik / Dimenzija", type: "select" },
    { key: "materijal", label: "Materijal", type: "select" },
    { key: "pritisak", label: "Radni pritisak", type: "select" },
    { key: "duzina", label: "Dužina", type: "select" },
  ],
  fiting: [
    { key: "tip", label: "Tip fitinga", type: "select" },
    { key: "precnik", label: "Prečnik / Dimenzija", type: "select" },
    { key: "materijal", label: "Materijal", type: "select" },
    { key: "pritisak", label: "Radni pritisak", type: "select" },
  ],
  ventili: [
    { key: "tip", label: "Tip ventila", type: "select" },
    { key: "precnik", label: "Prečnik", type: "select" },
    { key: "materijal", label: "Materijal", type: "select" },
    { key: "pritisak", label: "Radni pritisak", type: "select" },
    { key: "prikljucak", label: "Priključak", type: "select" },
  ],
  "odvodnja-sifoni": [
    { key: "tip", label: "Tip odvoda", type: "select" },
    { key: "precnik", label: "Prečnik", type: "select" },
    { key: "materijal", label: "Materijal", type: "select" },
  ],
  "pumpe-za-vodu": [
    { key: "snaga", label: "Snaga", type: "select" },
    { key: "protok", label: "Protok", type: "select" },
    { key: "napon", label: "Napon", type: "select" },
    { key: "materijal", label: "Materijal", type: "select" },
  ],
  "slavine-i-baterije": [
    { key: "montaza", label: "Montaža", type: "select" },
    { key: "zavrsna_obrada", label: "Završna obrada", type: "select" },
    { key: "kartusa", label: "Tip mešača", type: "select" },
  ],
  sanitarije: [
    { key: "tip", label: "Tip sanitarije", type: "select" },
    { key: "montaza", label: "Montaža", type: "select" },
    { key: "materijal", label: "Materijal", type: "select" },
  ],
  "ugradni-sistemi": [
    { key: "montaza", label: "Montaža", type: "select" },
    { key: "materijal", label: "Materijal", type: "select" },
    { key: "tip", label: "Tip sistema", type: "select" },
  ],
  "tus-program": [
    { key: "tip", label: "Tip tuša", type: "select" },
    { key: "montaza", label: "Montaža", type: "select" },
    { key: "zavrsna_obrada", label: "Završna obrada", type: "select" },
  ],
  "tus-kabine": [
    { key: "tip", label: "Tip kabine", type: "select" },
    { key: "zavrsna_obrada", label: "Završna obrada", type: "select" },
    { key: "materijal", label: "Materijal", type: "select" },
  ],
  "lavaboi": [
    { key: "tip", label: "Tip lavaboa", type: "select" },
    { key: "montaza", label: "Montaža", type: "select" },
    { key: "materijal", label: "Materijal", type: "select" },
  ],
  "kap-po-kap": [
    { key: "precnik", label: "Prečnik", type: "select" },
    { key: "protok", label: "Protok", type: "select" },
    { key: "pritisak", label: "Pritisak", type: "select" },
  ],
  prskalice: [
    { key: "prikljucak", label: "Priključak", type: "select" },
    { key: "domet", label: "Domet", type: "select" },
    { key: "protok", label: "Protok", type: "select" },
  ],
  creva: [
    { key: "precnik", label: "Prečnik", type: "select" },
    { key: "duzina", label: "Dužina", type: "select" },
    { key: "pritisak", label: "Radni pritisak", type: "select" },
    { key: "materijal", label: "Materijal", type: "select" },
  ],
  automatika: [
    { key: "prikljucak", label: "Priključak", type: "select" },
    { key: "napon", label: "Napon", type: "select" },
    { key: "protok", label: "Protok", type: "select" },
  ],
  "radijatori-grejna-tela": [
    { key: "materijal", label: "Materijal", type: "select" },
    { key: "snaga", label: "Toplotna snaga", type: "select" },
    { key: "visina", label: "Visina", type: "select" },
  ],
  "ventili-termostatska-regulacija": [
    { key: "tip", label: "Tip ventila", type: "select" },
    { key: "precnik", label: "Prečnik", type: "select" },
    { key: "materijal", label: "Materijal", type: "select" },
  ],
};

export function getCategoryFilterDefinitions(categorySlug?: string, subcategorySlug?: string): CatalogFilterDefinition[] {
  if (subcategorySlug && SUBCATEGORY_FILTERS[subcategorySlug]) {
    return SUBCATEGORY_FILTERS[subcategorySlug];
  }
  return categorySlug ? CATEGORY_FILTERS[categorySlug] ?? commonFilters : [];
}

export function getFilterValues(
  products: Array<{ attributes: Record<string, string | number | boolean> }>,
  key: string,
): string[] {
  return [...new Set(
    products
      .map((product) => product.attributes[key])
      .filter((value): value is string | number | boolean => value !== undefined && value !== null && value !== "")
      .map(String),
  )].sort((a, b) => a.localeCompare(b, "sr"));
}
