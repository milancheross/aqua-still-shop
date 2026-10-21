import Papa from "papaparse";
import type { CsvProductRow, CsvInvalidRow, CsvParseResult } from "./product-csv-types";

/**
 * Pomoćna funkcija za čišćenje i konverziju cena unetih u CSV (podržava i zarez i tačku kao decimalni separator).
 */
function parsePrice(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const str = String(value).trim().replace(/\s+/g, "").replace(",", ".");
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

/**
 * Pomoćna funkcija za normalizaciju zaglavlja (case-insensitive i trim).
 */
function findHeaderValue(row: Record<string, unknown>, possibleKeys: string[]): string {
  const rowKeys = Object.keys(row);
  for (const expected of possibleKeys) {
    const matchedKey = rowKeys.find(
      (k) => k.trim().toLowerCase() === expected.trim().toLowerCase()
    );
    if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null) {
      return String(row[matchedKey]).trim();
    }
  }
  return "";
}

/**
 * Parsira uneti CSV fajl na strani klijenta i vraća strukturisani rezultat sa validnim i nevalidnim redovima.
 */
export function parseProductCsv(file: File): Promise<CsvParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        const detectedHeaders = results.meta.fields || [];
        const validRows: CsvProductRow[] = [];
        const invalidRows: CsvInvalidRow[] = [];

        results.data.forEach((row, index) => {
          const rowNumber = index + 2; // +2 jer je red 1 zaglavlje, a indeks je 0-baziran
          const reasons: string[] = [];

          const sku = findHeaderValue(row, ["SKU", "sku", "Šifra", "Sifra", "Sifra artikla", "Kataloški broj", "Kataloski broj"]);
          const name = findHeaderValue(row, ["Naziv", "naziv", "Name", "Artikal", "Naslov", "Naziv proizvoda"]);
          const rawPrice = findHeaderValue(row, ["Cena", "cena", "Price", "Prodajna cena", "Redovna cena"]);
          const rawSalePrice = findHeaderValue(row, ["Stara Cena", "stara_cena", "Stara cena", "Akcijska cena", "Sale Price", "Popust cena"]);
          const rawStock = findHeaderValue(row, ["Zaliha", "zaliha", "Količina", "Kolicina", "Stanje", "Stock", "Količina na stanju"]);
          const category = findHeaderValue(row, ["Kategorija", "kategorija", "Category", "Grupa", "Robna grupa"]) || "Alati i oprema";
          const brand = findHeaderValue(row, ["Brend", "brend", "Brand", "Proizvođač", "Proizvodjac", "Marka"]) || "Aqua Still";
          const unit = findHeaderValue(row, ["Jedinica", "jedinica", "Unit", "JM", "Jm", "Jedinica mere"]) || "kom";
          const barcode = findHeaderValue(row, ["Barkod", "barkod", "Barcode", "EAN", "EAN kod"]) || undefined;
          const description = findHeaderValue(row, ["Opis", "opis", "Description", "Detaljan opis"]) || undefined;
          const imageUrl = findHeaderValue(row, ["Slika", "slika", "Image", "Slika URL", "Fotografija"]) || undefined;

          // Provera obaveznih polja
          if (!sku) {
            reasons.push("Nedostaje šifra (SKU).");
          }

          if (!name) {
            reasons.push("Nedostaje naziv artikla.");
          }

          const price = parsePrice(rawPrice);
          if (price === null || price < 0) {
            reasons.push("Cena mora biti ispravan pozitivan broj.");
          }

          const salePrice = parsePrice(rawSalePrice);
          if (salePrice !== null && salePrice < 0) {
            reasons.push("Akcijska cena ne može biti negativna.");
          }

          // Precizno rukovanje količinom zaliha
          let stockQuantity: number | null = null;
          if (rawStock !== "") {
            const stockNum = parsePrice(rawStock);
            if (stockNum === null || stockNum < 0) {
              reasons.push("Zaliha mora biti ceo nenegativan broj (ili ostavite prazno ako se ne menja).");
            } else {
              stockQuantity = Math.floor(stockNum);
            }
          }

          if (reasons.length > 0) {
            invalidRows.push({
              rowNumber,
              sku: sku || undefined,
              name: name || undefined,
              raw: row as Record<string, string>,
              reasons,
            });
          } else {
            validRows.push({
              sku,
              name,
              price: price as number,
              salePrice,
              stockQuantity,
              category,
              brand,
              unit,
              barcode,
              description,
              imageUrl,
            });
          }
        });

        resolve({
          validRows,
          invalidRows,
          totalRows: results.data.length,
          detectedHeaders,
        });
      },
      error: (error) => {
        reject(new Error(`Greška pri čitanju CSV fajla: ${error.message}`));
      },
    });
  });
}

/**
 * Generiše i automatski preuzima preporučeni CSV šablon sa UTF-8 BOM enkripcijom za Excel.
 */
export function downloadCsvTemplate(): void {
  const headers = [
    "SKU",
    "Naziv",
    "Cena",
    "Stara Cena",
    "Zaliha",
    "Kategorija",
    "Brend",
    "Jedinica",
    "Barkod",
    "Opis",
  ];

  const sampleRows = [
    [
      "PPR-20-4M",
      "PPR Cev fi 20mm 4m Peštan",
      "420",
      "490",
      "150",
      "Vodovod i kanalizacija",
      "Peštan",
      "kom",
      "8601234567890",
      "Visokokvalitetna PPR cev za instalaciju hladne i tople vode.",
    ],
    [
      "KLESTA-VOD-250",
      "Klešta vodoinstalaterska papagaj 250mm",
      "1890",
      "",
      "25",
      "Alati i oprema",
      "Unior",
      "kom",
      "3831234567891",
      "Hrom-vanadijum čelik, ergonomski rukohvat otporan na klizanje.",
    ],
    [
      "BAT-SUD-ECO",
      "Baterija za sudoperu stojeća jednoručna",
      "4500",
      "5200",
      "12",
      "Kupatilska oprema",
      "Rosan",
      "kom",
      "8605556667778",
      "Kvalitetan mesingani korpus sa keramičkim mešačem fi 35mm.",
    ],
    [
      "KAP-PO-KAP-100",
      "Crevo za navodnjavanje kap po kap 100m",
      "2300",
      "",
      "40",
      "Navodnjavanje",
      "Aqua Still",
      "kom",
      "8609998887776",
      "Standardni razmak kapaljki 20cm, protok 2 l/h.",
    ],
  ];

  const csvContent =
    headers.join(",") +
    "\n" +
    sampleRows.map((row) => row.map((val) => `"${val.replace(/"/g, '""')}"`).join(",")).join("\n");

  // UTF-8 BOM (\uFEFF) obezbeđuje da Microsoft Excel na Windows-u automatski prikaže srpska slova
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "aqua-still-sablon-proizvodi.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
