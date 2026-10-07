export type CatalogAttributeDefinition = {
  key: string;
  label: string;
  unit?: string;
  required?: boolean;
};

/**
 * Attribute contract for product data.
 *
 * Required means "required for a complete product record in this subcategory".
 * Existing seed products are validated against this contract; attributes that
 * cannot be established from the current product data remain optional until
 * the source ERP/POS supplies them.
 */
export const SUBCATEGORY_ATTRIBUTES: Record<string, CatalogAttributeDefinition[]> = {
  "aku-busilice": [
    { key: "napon", label: "Napon", required: true },
    { key: "motor", label: "Tip motora", required: true },
    { key: "prihvat", label: "Prihvat", required: true },
    { key: "obrtni_moment", label: "Obrtni moment" },
  ],
  brusilice: [
    { key: "napon", label: "Napon", required: true },
    { key: "snaga", label: "Snaga", required: true },
    { key: "prihvat", label: "Prihvat", required: true },
    { key: "precnik", label: "Prečnik diska" },
  ],
  "rucni-alat": [
    { key: "materijal", label: "Materijal", required: true },
    { key: "broj_delova", label: "Broj delova" },
    { key: "tip", label: "Tip alata" },
  ],
  cevi: [
    { key: "precnik", label: "Prečnik / Dimenzija", required: true },
    { key: "materijal", label: "Materijal", required: true },
    { key: "pritisak", label: "Radni pritisak" },
    { key: "duzina", label: "Dužina" },
  ],
  ventili: [
    { key: "precnik", label: "Prečnik", required: true },
    { key: "materijal", label: "Materijal", required: true },
    { key: "pritisak", label: "Radni pritisak", required: true },
    { key: "tip", label: "Tip ventila" },
    { key: "prikljucak", label: "Priključak" },
  ],
  "pumpe-za-vodu": [
    { key: "snaga", label: "Snaga", required: true },
    { key: "protok", label: "Protok", required: true },
    { key: "materijal", label: "Materijal", required: true },
    { key: "napon", label: "Napon" },
  ],
  "slavine-i-baterije": [
    { key: "zavrsna_obrada", label: "Završna obrada", required: true },
    { key: "montaza", label: "Montaža", required: true },
    { key: "kartusa", label: "Tip mešača / kartuše", required: true },
    { key: "materijal", label: "Materijal" },
  ],
  "ugradni-sistemi": [
    { key: "montaza", label: "Montaža", required: true },
    { key: "materijal", label: "Materijal", required: true },
    { key: "tip", label: "Tip sistema" },
  ],
  prskalice: [
    { key: "prikljucak", label: "Priključak", required: true },
    { key: "domet", label: "Domet", required: true },
    { key: "materijal", label: "Materijal", required: true },
    { key: "protok", label: "Protok" },
  ],
  creva: [
    { key: "prikljucak", label: "Priključak", required: true },
    { key: "pritisak", label: "Radni pritisak", required: true },
    { key: "duzina", label: "Dužina", required: true },
    { key: "precnik", label: "Prečnik" },
    { key: "materijal", label: "Materijal" },
  ],
  automatika: [
    { key: "prikljucak", label: "Priključak", required: true },
    { key: "napon", label: "Napon", required: true },
    { key: "protok", label: "Protok" },
  ],
};

export function getAttributeDefinitions(subcategorySlug?: string | null) {
  return subcategorySlug ? SUBCATEGORY_ATTRIBUTES[subcategorySlug] ?? [] : [];
}

export function getMissingRequiredAttributes(
  subcategorySlug: string | null | undefined,
  attributes: Record<string, unknown>,
): string[] {
  return getAttributeDefinitions(subcategorySlug)
    .filter((definition) => definition.required)
    .filter((definition) => {
      const value = attributes[definition.key];
      return value === undefined || value === null || value === "";
    })
    .map((definition) => definition.key);
}
