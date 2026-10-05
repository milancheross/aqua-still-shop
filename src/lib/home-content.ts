export const HOME_SLUG = "pocetna";

export interface HomeContent {
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  featuredTitle: string;
  exploreEyebrow: string;
  exploreTitle: string;
  exploreText: string;
  brandsTitle: string;
  popularTitle: string;
  seoTitle: string;
  seoDescription: string;
}

export const DEFAULT_HOME: HomeContent = {
  eyebrow: "Profesionalni alati & oprema",
  title: "Snaga za svaki projekat",
  titleAccent: "svaki projekat",
  description: "Veliki izbor električnih i aku alata, vodovodnog materijala i opreme za dom i baštu. Pouzdanost, kvalitet i stručna podrška — sve na jednom mestu.",
  primaryLabel: "Pogledaj ponudu",
  primaryHref: "/katalog",
  secondaryLabel: "Katalog alata",
  secondaryHref: "/katalog/alati",
  featuredTitle: "Izdvajamo iz ponude",
  exploreEyebrow: "Istražite ponudu",
  exploreTitle: "Oprema za svaki projekat",
  exploreText: "Izaberite kategoriju i pronađite opremu za dom, radionicu i baštu.",
  brandsTitle: "Naši brendovi",
  popularTitle: "Najpopularnije kategorije",
  seoTitle: "",
  seoDescription: "",
};

const KEYS = Object.keys(DEFAULT_HOME) as (keyof HomeContent)[];

export function parseHomeContent(value: unknown): HomeContent {
  const source = value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
  const fields = source.kind === "home" ? source : source;
  const content = { ...DEFAULT_HOME };
  for (const key of KEYS) {
    if (typeof fields[key] === "string") content[key] = fields[key];
  }
  return content;
}
