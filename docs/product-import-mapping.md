# Aqua Still product import mapping

This layer is the boundary between the client's POS/ERP export and the webshop catalog.

## Input

The mapper accepts:

- SKU
- barcode/EAN
- product name
- brand
- price and optional sale price
- VAT rate
- unit
- stock quantity
- in-stock flag
- source category and subcategory labels
- optional technical attributes

## Mapping rules

1. Category and subcategory are resolved against the master taxonomy.
2. Known legacy/source labels are mapped to canonical slugs.
3. Subcategories are only accepted when they belong to the selected category.
4. Technical attribute keys are normalized to the webshop schema.
5. Prices and quantities accept numeric values or strings using a decimal comma.
6. Units such as komad, pcs, paket, metar and kilogram are normalized.
7. Required technical attributes are validated using the subcategory contract.
8. Missing or unknown data produces an explicit error/warning; the mapper never invents technical specifications.
9. Unknown brands are preserved as provided instead of silently changing them.
10. The mapper does not write to the database. A later import service can use its validated output for Prisma upsert operations.

## Example source row

SKU: VAL-KV12-LEP
EAN: 5901234567891
Naziv: Valvex Kugla ventil sa leptir ručkom 1/2" PN30 Ž-Ž
Brend: Valvex
Kategorija: Vodovod i kanalizacija
Podkategorija: Kugla ventili i zasuni
Cena: 680
Akcijska cena: 590
Stanje: 85
Atributi:
  Prečnik: 1/2"
  Materijal: Mesing
  Pritisak: PN 30

The mapper resolves this to:

- category: vodovod
- subcategory: ventili
- normalized attributes: precnik, materijal, pritisak

## Important boundary

The actual POS/ERP column names and export format are still unknown until access to the client's existing cash-register/store program is available. This mapper therefore accepts a normalized external record rather than pretending to know the client's proprietary export format.

Once the POS export is obtained, add a small adapter from its real columns to ExternalProductRecord. Do not change the master taxonomy to fit inconsistent source labels.
