/**
 * Tipovi i interfejsi za masovni CSV uvoz proizvoda (Aqua Still Shop Zlatibor).
 */

/**
 * Režim ažuriranja zaliha u magacinu:
 * - "set": Apsolutno postavljanje zaliha na vrednost iz CSV-a (popis/inventar).
 * - "increment": Uvećavanje postojećih zaliha za vrednost iz CSV-a (prijem robe).
 * - "ignore": Zalihe ostaju netaknute, ažuriraju se samo cene, nazivi i ostali podaci.
 */
export type StockUpdateMode = "set" | "increment" | "ignore";

export interface CsvProductRow {
  sku: string;
  name: string;
  price: number;
  salePrice: number | null;
  stockQuantity: number | null; // null označava da kolona nije uneta u CSV
  category: string;
  brand: string;
  unit?: string;
  barcode?: string;
  description?: string;
  subcategory?: string;
  imageUrl?: string;
}

export interface CsvInvalidRow {
  rowNumber: number;
  sku?: string;
  name?: string;
  raw: Record<string, string>;
  reasons: string[];
}

export interface CsvParseResult {
  validRows: CsvProductRow[];
  invalidRows: CsvInvalidRow[];
  totalRows: number;
  detectedHeaders: string[];
}

export interface ImportBatchResult {
  success: boolean;
  batchSize: number;
  createdCount: number;
  updatedCount: number;
  stockMovementsCount: number;
  errors: { sku: string; error: string }[];
}
