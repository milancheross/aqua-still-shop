import { AQUA_STILL_TAXONOMY } from "./catalog-taxonomy";
import { getAttributeDefinitions, getMissingRequiredAttributes } from "./catalog-attribute-schema";

export type ExternalProductRecord = {
  sku: string;
  barcode?: string | null;
  name: string;
  brand?: string | null;
  price: string | number;
  salePrice?: string | number | null;
  vatRate?: string | number | null;
  unit?: string | null;
  stockQuantity?: string | number | null;
  inStock?: boolean | null;
  category?: string | null;
  subcategory?: string | null;
  attributes?: Record<string, unknown> | null;
};

export type MappedProductRecord = {
  sku: string;
  barcode?: string;
  name: string;
  brand: string;
  price: number;
  salePrice?: number | null;
  vatRate: number;
  unit: string;
  stockQuantity: number;
  inStock: boolean;
  categorySlug: string;
  categoryName: string;
  subcategorySlug?: string;
  subcategoryName?: string;
  attributes: Record<string, string>;
};

export type ProductImportIssue = { field: string; message: string };
export type ProductImportResult =
  | { ok: true; product: MappedProductRecord; warnings: string[] }
  | { ok: false; errors: ProductImportIssue[]; warnings: string[] };

const CATEGORY_ALIASES: Record<string, string> = {
  alati: "alati",
  alat: "alati",
  "alati i oprema": "alati",
  tools: "alati",
  vodovod: "vodovod",
  kanalizacija: "vodovod",
  "vodovod i kanalizacija": "vodovod",
  kupatila: "kupatila",
  "kupatilska oprema": "kupatila",
  "kupatilska oprema i sanitarije": "kupatila",
  navodnjavanje: "navodnjavanje",
  "navodnjavanje i basta": "navodnjavanje",
  grejanje: "grejanje",
  "boje lakovi hemija": "boje-lakovi-hemija",
  "boje lakovi lepkovi i hemija": "boje-lakovi-hemija",
  "rasveta elektro oprema": "rasveta-elektro-oprema",
  "elektro oprema i rasveta": "rasveta-elektro-oprema",
  "vijcana roba": "vijcana-roba",
  "vijcana roba i pricvrsni materijal": "vijcana-roba",
  "gradjevinska zastitna oprema": "gradjevinska-zastitna-oprema",
  "kuca dvoriste ciscenje": "kuca-dvoriste-ciscenje",
};

const SUBCATEGORY_ALIASES: Record<string, string> = {
  "aku busilice": "aku-busilice",
  "aku busilice i odvijaci": "aku-busilice",
  "ugaone brusilice": "brusilice",
  brusilice: "brusilice",
  "rucni alat": "rucni-alat",
  "rucni alati i kljucevi": "rucni-alat",
  "cevi i kanali": "cevi",
  cevi: "cevi",
  "kugla ventili i zasuni": "ventili",
  "ventili zasuni i slavine": "ventili",
  ventili: "ventili",
  "pumpe za vodu": "pumpe-za-vodu",
  "pumpe za vodu i hidrofori": "pumpe-za-vodu",
  "slavine i baterije": "slavine-i-baterije",
  baterije: "slavine-i-baterije",
  "ugradni sistemi": "ugradni-sistemi",
  "ugradni sistemi i vodokotlici": "ugradni-sistemi",
  "rasprskivaci i rotori": "prskalice",
  prskalice: "prskalice",
  "bastenska i tehnicka creva": "creva",
  creva: "creva",
  "elektroventili i tajmeri": "automatika",
  automatika: "automatika",
  "mesalice za boju i malter": "mesalice-boju-malter",
};

const ATTRIBUTE_KEY_ALIASES: Record<string, string> = {
  napon: "napon",
  voltage: "napon",
  snaga: "snaga",
  power: "snaga",
  motor: "motor",
  "tip motora": "motor",
  prihvat: "prihvat",
  "obrtni moment": "obrtni_moment",
  obrtni_moment: "obrtni_moment",
  precnik: "precnik",
  materijal: "materijal",
  material: "materijal",
  pritisak: "pritisak",
  pressure: "pritisak",
  duzina: "duzina",
  prikljucak: "prikljucak",
  domet: "domet",
  protok: "protok",
  "zavrsna obrada": "zavrsna_obrada",
  montaza: "montaza",
  kartusa: "kartusa",
  "broj delova": "broj_delova",
  broj_delova: "broj_delova",
  tip: "tip",
};

function normalizeText(value: string): string {
  return value.trim().toLocaleLowerCase("sr-Latn-RS").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[’']/g, "").replace(/[–—]/g, "-").replace(/\s+/g, " ");
}

function parseNumber(value: string | number | null | undefined): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (value == null || value.trim() === "") return null;
  const parsed = Number(value.trim().replace(/\s/g, "").replace(/(rsd|din)$/i, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeUnit(value: string | null | undefined): string {
  const normalized = normalizeText(value ?? "");
  if (!normalized || ["kom", "komad", "komada", "pcs", "piece"].includes(normalized)) return "kom";
  if (["pak", "paket", "set", "garnitura"].includes(normalized)) return "pak";
  if (["m", "metar", "metra"].includes(normalized)) return "m";
  if (["kg", "kilogram"].includes(normalized)) return "kg";
  if (["l", "lit", "litar"].includes(normalized)) return "l";
  return value!.trim();
}

function resolveCategory(value: string | null | undefined) {
  if (!value) return undefined;
  const slug = CATEGORY_ALIASES[normalizeText(value)] ?? value.trim();
  return AQUA_STILL_TAXONOMY.find((category) => category.slug === slug);
}

function resolveSubcategory(categorySlug: string, value: string | null | undefined) {
  if (!value) return undefined;
  const slug = SUBCATEGORY_ALIASES[normalizeText(value)] ?? value.trim();
  return AQUA_STILL_TAXONOMY.find((category) => category.slug === categorySlug)?.subcategories.find((item) => item.slug === slug);
}

function normalizeAttributes(attributes: Record<string, unknown> | null | undefined): Record<string, string> {
  if (!attributes) return {};
  const result: Record<string, string> = {};
  for (const [rawKey, rawValue] of Object.entries(attributes)) {
    if (rawValue == null || String(rawValue).trim() === "") continue;
    const key = ATTRIBUTE_KEY_ALIASES[normalizeText(rawKey)] ?? rawKey.trim();
    result[key] = String(rawValue).trim();
  }
  return result;
}

export function mapExternalProduct(input: ExternalProductRecord): ProductImportResult {
  const errors: ProductImportIssue[] = [];
  const warnings: string[] = [];
  const sku = input.sku?.trim();
  const name = input.name?.trim();

  if (!sku) errors.push({ field: "sku", message: "SKU je obavezan." });
  if (!name) errors.push({ field: "name", message: "Naziv proizvoda je obavezan." });

  const category = resolveCategory(input.category);
  if (!category) errors.push({ field: "category", message: "Kategorija nije prepoznata." });

  const subcategory = category ? resolveSubcategory(category.slug, input.subcategory) : undefined;
  if (input.subcategory && !subcategory) {
    errors.push({ field: "subcategory", message: "Podkategorija nije prepoznata ili ne pripada izabranoj kategoriji." });
  }

  const price = parseNumber(input.price);
  if (price == null || price < 0) errors.push({ field: "price", message: "Cena mora biti validan broj >= 0." });

  const salePrice = parseNumber(input.salePrice);
  if (input.salePrice != null && salePrice == null) {
    errors.push({ field: "salePrice", message: "Akcijska cena nije validan broj." });
  }

  const stockQuantity = parseNumber(input.stockQuantity);
  if (input.stockQuantity != null && (stockQuantity == null || stockQuantity < 0)) {
    errors.push({ field: "stockQuantity", message: "Stanje mora biti validan broj >= 0." });
  }

  const vatRate = parseNumber(input.vatRate ?? 0.2);
  if (vatRate == null || vatRate < 0 || vatRate > 1) {
    errors.push({ field: "vatRate", message: "PDV stopa mora biti decimalna vrednost od 0 do 1." });
  }

  const attributes = normalizeAttributes(input.attributes);
  const missing = getMissingRequiredAttributes(subcategory?.slug, attributes);
  for (const key of missing) {
    const definition = getAttributeDefinitions(subcategory?.slug).find((item) => item.key === key);
    errors.push({
      field: "attributes." + key,
      message: "Nedostaje obavezni atribut: " + (definition?.label ?? key) + ".",
    });
  }

  if (errors.length > 0) return { ok: false, errors, warnings };

  const stock = stockQuantity ?? 0;
  return {
    ok: true,
    warnings,
    product: {
      sku: sku!,
      ...(input.barcode?.trim() ? { barcode: input.barcode.trim() } : {}),
      name: name!,
      brand: input.brand?.trim() || "Bez brenda",
      price: price!,
      salePrice,
      vatRate: vatRate!,
      unit: normalizeUnit(input.unit),
      stockQuantity: stock,
      inStock: input.inStock ?? stock > 0,
      categorySlug: category!.slug,
      categoryName: category!.name,
      ...(subcategory ? { subcategorySlug: subcategory.slug, subcategoryName: subcategory.name } : {}),
      attributes,
    },
  };
}
