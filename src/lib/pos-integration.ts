export type PosProductRow = {
  externalId?: string;
  sku?: string;
  barcode?: string;
  name: string;
  price?: number;
  salePrice?: number;
  vatRate?: number;
  unit?: string;
  stockQuantity?: number;
  brand?: string;
  category?: string;
};

export type PosImportResult = {
  created: number;
  updated: number;
  unchanged: number;
  skipped: number;
  errors: string[];
};

function normalizeHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

const aliases: Record<string, keyof PosProductRow> = {
  sifra: "sku",
  artikalsifra: "sku",
  sku: "sku",
  barcode: "barcode",
  barkod: "barcode",
  ean: "barcode",
  naziv: "name",
  nazivartikla: "name",
  name: "name",
  cena: "price",
  prodajnaCena: "price",
  prodajnacena: "price",
  price: "price",
  maloprodajnacena: "price",
  akcijskacena: "salePrice",
  salecena: "salePrice",
  porez: "vatRate",
  pdv: "vatRate",
  pdvstopa: "vatRate",
  jedinica: "unit",
  jm: "unit",
  kolicina: "stockQuantity",
  stanje: "stockQuantity",
  zaliha: "stockQuantity",
  brand: "brand",
  brend: "brand",
  kategorija: "category",
  externalid: "externalId",
  eksternaid: "externalId",
};

function parseNumber(value: string | undefined) {
  if (!value?.trim()) return undefined;
  const normalized = value.trim().replace(/\s/g, "").replace(/\.(?=\d{3}(?:,|$))/g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : undefined;
}

function parseCsvLine(line: string) {
  const result: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') { current += '"'; i++; }
      else quoted = !quoted;
    } else if (char === "," && !quoted) {
      result.push(current); current = "";
    } else if (char === ";" && !quoted) {
      result.push(current); current = "";
    } else current += char;
  }
  result.push(current);
  return result.map((v) => v.trim());
}

export function parsePosCsv(csv: string): PosProductRow[] {
  const lines = csv.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const raw: Record<string, string> = {};
    headers.forEach((header, i) => { raw[header] = cells[i] ?? ""; });
    const get = (field: keyof PosProductRow) => {
      const key = Object.keys(aliases).find((alias) => aliases[alias] === field && raw[alias] !== undefined);
      return key ? raw[key] : undefined;
    };
    const name = get("name")?.trim() ?? "";
    return {
      externalId: get("externalId")?.trim() || undefined,
      sku: get("sku")?.trim() || undefined,
      barcode: get("barcode")?.trim() || undefined,
      name,
      price: parseNumber(get("price")),
      salePrice: parseNumber(get("salePrice")),
      vatRate: parseNumber(get("vatRate")),
      unit: get("unit")?.trim() || undefined,
      stockQuantity: parseNumber(get("stockQuantity")),
      brand: get("brand")?.trim() || undefined,
      category: get("category")?.trim() || undefined,
    };
  }).filter((row) => row.name);
}
