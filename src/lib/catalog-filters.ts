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
];

export const CATEGORY_FILTERS: Record<string, CatalogFilterDefinition[]> = {
  alati: [
    { key: "napon", label: "Napon baterije", type: "select" },
    { key: "snaga", label: "Snaga motora", type: "select" },
    { key: "motor", label: "Tip motora", type: "select" },
    { key: "prihvat", label: "Prihvat alata", type: "select" },
  ],
  "elektricni-alat": [
    { key: "napon", label: "Napon", type: "select" },
    { key: "snaga", label: "Snaga", type: "select" },
    { key: "prihvat", label: "Prihvat", type: "select" },
    { key: "motor", label: "Motor", type: "select" },
    { key: "materijal", label: "Materijal", type: "select" },
  ],
  vodovod: [
    { key: "precnik", label: "Prečnik / Dimenzija", type: "select" },
    { key: "materijal", label: "Materijal", type: "select" },
    { key: "pritisak", label: "Radni pritisak", type: "select" },
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
    { key: "materijal", label: "Materijal", type: "select" },
    { key: "napon", label: "Napon", type: "select" },
  ],
  grejanje: [
    { key: "materijal", label: "Materijal", type: "select" },
    { key: "precnik", label: "Prečnik", type: "select" },
    { key: "pritisak", label: "Pritisak", type: "select" },
  ],
  "boje-lakovi-hemija": [
    { key: "materijal", label: "Materijal", type: "select" },
    { key: "pakovanje", label: "Pakovanje", type: "select" },
  ],
  "rasveta-elektro-oprema": [
    { key: "napon", label: "Napon", type: "select" },
    { key: "snaga", label: "Snaga", type: "select" },
  ],
  "vijcana-roba": [
    { key: "materijal", label: "Materijal", type: "select" },
    { key: "precnik", label: "Prečnik", type: "select" },
    { key: "duzina", label: "Dužina", type: "select" },
  ],
  "gradjevinska-zastitna-oprema": [
    { key: "materijal", label: "Materijal", type: "select" },
    { key: "duzina", label: "Dužina", type: "select" },
  ],
  "kuca-dvoriste-ciscenje": [
    { key: "materijal", label: "Materijal", type: "select" },
    { key: "duzina", label: "Dužina", type: "select" },
  ],
};

export function getCategoryFilterDefinitions(categorySlug?: string): CatalogFilterDefinition[] {
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
