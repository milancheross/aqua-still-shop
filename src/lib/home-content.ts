export const HOME_SLUG = "pocetna";

export interface HeroSlideItem {
  id: string;
  badge: string;
  title: string;
  highlight: string;
  description: string;
  buttonLabel: string;
  buttonHref: string;
  category: string;
  imageUrl?: string;
  bgGradient?: string;
  accentColor?: string;
}

export const DEFAULT_HERO_SLIDES: HeroSlideItem[] = [
  {
    id: "alati",
    badge: "VRHUNSKI BRENDOVI · AKCIJSKE CENE",
    title: "Profesionalni alati za",
    highlight: "majstore i radionice",
    description: "Akumulatorske bušilice, ugaone brusilice i kompletni setovi ručnog alata. Makita, Bosch i DeWalt sa zvaničnom garancijom.",
    buttonLabel: "POGLEDAJ PONUDU",
    buttonHref: "/katalog/alati",
    category: "Alati i oprema",
    imageUrl: "/placeholder-tool.svg",
    bgGradient: "from-slate-950 via-slate-900 to-cyan-950",
    accentColor: "from-amber-400 to-cyan-400",
  },
  {
    id: "vodovod",
    badge: "SIGURNOST I TRAJNOST · NA STANJU",
    title: "Cevi, fiting i ventili za",
    highlight: "sve vrste instalacija",
    description: "Peštan 3P niskošumne cevi, PP-R sistemi za pijaću vodu i visokotlačni Valvex mesingani kugla ventili za objekte i kuće.",
    buttonLabel: "POGLEDAJ PONUDU",
    buttonHref: "/katalog/vodovod",
    category: "Vodovod i kanalizacija",
    imageUrl: "/placeholder-pipe.svg",
    bgGradient: "from-slate-950 via-slate-900 to-blue-950",
    accentColor: "from-cyan-400 to-blue-500",
  },
  {
    id: "kupatila",
    badge: "PREMIUM DIZAJN · NEMAČKI KVALITET",
    title: "Moderna kupatila po",
    highlight: "vašoj meri i želji",
    description: "Geberit ugradni vodokotlići, Grohe i Hansgrohe slavine i sanitarije koje spajaju estetiku i vrhunsku dugovečnost.",
    buttonLabel: "POGLEDAJ PONUDU",
    buttonHref: "/katalog/kupatila",
    category: "Kupatilska oprema",
    imageUrl: "/placeholder-faucet.svg",
    bgGradient: "from-slate-950 via-zinc-900 to-slate-900",
    accentColor: "from-emerald-300 to-cyan-400",
  },
  {
    id: "navodnjavanje",
    badge: "EFIKASNOST I UŠTEDA VODE",
    title: "Automatsko navodnjavanje i",
    highlight: "snažne Pedrollo pumpe",
    description: "Italijanske potapajuće i hidrofor pumpe, Rain Bird pop-up rasprskivači, creva i kap po kap sistemi za dvorišta i voćnjake.",
    buttonLabel: "POGLEDAJ PONUDU",
    buttonHref: "/katalog/navodnjavanje",
    category: "Navodnjavanje i bašta",
    imageUrl: "/placeholder-pump.svg",
    bgGradient: "from-slate-950 via-slate-900 to-emerald-950",
    accentColor: "from-lime-400 to-emerald-400",
  },
];

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
  heroSlides?: HeroSlideItem[];
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
  heroSlides: DEFAULT_HERO_SLIDES,
};

const STRING_KEYS: (keyof Omit<HomeContent, "heroSlides">)[] = [
  "eyebrow",
  "title",
  "titleAccent",
  "description",
  "primaryLabel",
  "primaryHref",
  "secondaryLabel",
  "secondaryHref",
  "featuredTitle",
  "exploreEyebrow",
  "exploreTitle",
  "exploreText",
  "brandsTitle",
  "popularTitle",
  "seoTitle",
  "seoDescription",
];

export function parseHomeContent(value: unknown): HomeContent {
  const source = value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
  const fields = source.kind === "home" ? source : source;
  const content: HomeContent = { ...DEFAULT_HOME };

  for (const key of STRING_KEYS) {
    if (typeof fields[key] === "string") {
      content[key] = fields[key] as string;
    }
  }

  if (Array.isArray(fields.heroSlides) && fields.heroSlides.length > 0) {
    content.heroSlides = fields.heroSlides.map((item, index) => {
      const obj = (item && typeof item === "object") ? item as Record<string, unknown> : {};
      const fallback = DEFAULT_HERO_SLIDES[index % DEFAULT_HERO_SLIDES.length];
      return {
        id: typeof obj.id === "string" && obj.id ? obj.id : fallback.id,
        badge: typeof obj.badge === "string" ? obj.badge : fallback.badge,
        title: typeof obj.title === "string" ? obj.title : fallback.title,
        highlight: typeof obj.highlight === "string" ? obj.highlight : fallback.highlight,
        description: typeof obj.description === "string" ? obj.description : fallback.description,
        buttonLabel: typeof obj.buttonLabel === "string" ? obj.buttonLabel : fallback.buttonLabel,
        buttonHref: typeof obj.buttonHref === "string" ? obj.buttonHref : fallback.buttonHref,
        category: typeof obj.category === "string" ? obj.category : fallback.category,
        imageUrl: typeof obj.imageUrl === "string" ? obj.imageUrl : fallback.imageUrl,
        bgGradient: typeof obj.bgGradient === "string" ? obj.bgGradient : fallback.bgGradient,
        accentColor: typeof obj.accentColor === "string" ? obj.accentColor : fallback.accentColor,
      };
    });
  } else {
    content.heroSlides = DEFAULT_HERO_SLIDES;
  }

  return content;
}
