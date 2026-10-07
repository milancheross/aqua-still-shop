import { ProductCategory, Product } from "@/types";
import { AQUA_STILL_TAXONOMY } from "@/lib/catalog-taxonomy";
import { getCategoryFilterDefinitions } from "@/lib/catalog-filters";

export const CATEGORIES: ProductCategory[] = AQUA_STILL_TAXONOMY.map((category) => ({
  id: category.id,
  name: category.name,
  slug: category.slug,
  description: category.description,
  imageUrl: undefined,
  featured: false,
  sortOrder: 0,
  itemCount: 0,
  iconName: category.iconName as ProductCategory["iconName"],
  subcategories: category.subcategories.map((subcategory) => ({
    id: subcategory.id,
    name: subcategory.name,
    slug: subcategory.slug,
    itemCount: 0,
  })),
  attributes: getCategoryFilterDefinitions(category.slug).map((filter) => ({
    key: filter.key,
    label: filter.label,
    type: filter.type,
    options: filter.options,
    unit: filter.unit,
  })),
}));

export const PRODUCTS: Product[] = [
  // --- ALATI ---
  {
    id: "prod-1",
    sku: "MAK-DHP485Z",
    barcode: "0088381866385",
    name: "Makita DHP485Z Aku udarna bušilica-odvijač 18V (bez baterije i punjača)",
    slug: "makita-dhp485z-aku-udarna-busilica-18v",
    brand: "Makita",
    categorySlug: "alati",
    categoryName: "Alati i oprema",
    subcategorySlug: "aku-busilice",
    subcategoryName: "Aku bušilice i odvijači",
    price: 13990,
    salePrice: 11990,
    vatRate: 0.2,
    unit: "kom",
    inStock: true,
    stockQuantity: 18,
    wmsLocation: "A-03-02-04",
    shortDescription: "Snažna udarna bušilica sa motorom bez četkica (Brushless), 50 Nm obrtnog momenta.",
    description: "Makita DHP485Z je kompaktna i izuzetno izdržljiva akumulatorska udarna bušilica. Opremljena je motorom bez četkica koji omogućava veću autonomiju rada i duži vek trajanja. Poseduje metalnu brzosteznu glavu 13mm i dvobrzinski prenosnik.",
    images: ["/placeholder-tool.svg"],
    attributes: {
      napon: "18V",
      motor: "Brushless (bez četkica)",
      prihvat: "13 mm",
      obrtni_moment: "50 Nm",
      broj_obrtaja: "0-500 / 0-1.900 min-1",
    },
    isFeatured: true,
    isPromo: true,
  },
  {
    id: "prod-2",
    sku: "BOS-GSB18V50",
    barcode: "3165140982900",
    name: "Bosch Professional GSB 18V-50 Akumulatorska udarna bušilica",
    slug: "bosch-professional-gsb-18v-50-aku-busilica",
    brand: "Bosch",
    categorySlug: "alati",
    categoryName: "Alati i oprema",
    subcategorySlug: "aku-busilice",
    subcategoryName: "Aku bušilice i odvijači",
    price: 17490,
    vatRate: 0.2,
    unit: "kom",
    inStock: true,
    stockQuantity: 12,
    wmsLocation: "A-03-02-05",
    shortDescription: "Robustan motor bez četkica za teške poslove bušenja u zidu, drvetu i metalu.",
    description: "Inteligentni Brushless motor direktno komunicira sa elektronikom alata za optimalan rad i zaštitu od preopterećenja. Metalni futer 13 mm pruža maksimalan prenos snage.",
    images: ["/placeholder-tool.svg"],
    attributes: {
      napon: "18V",
      motor: "Brushless (bez četkica)",
      prihvat: "13 mm",
      obrtni_moment: "50 Nm",
    },
    isFeatured: true,
  },
  {
    id: "prod-3",
    sku: "DEW-DWE4206",
    barcode: "5035048538203",
    name: "DeWalt DWE4206 Ugaona električna brusilica 115mm 1010W",
    slug: "dewalt-dwe4206-ugaona-brusilica-115mm-1010w",
    brand: "DeWalt",
    categorySlug: "alati",
    categoryName: "Alati i oprema",
    subcategorySlug: "brusilice",
    subcategoryName: "Ugaone brusilice",
    price: 10490,
    salePrice: 9190,
    vatRate: 0.2,
    unit: "kom",
    inStock: true,
    stockQuantity: 24,
    wmsLocation: "A-01-04-02",
    shortDescription: "Kompaktna ugaona brusilica visoke efikasnosti sa No-Volt Release zaštitom.",
    description: "Sistem za izbacivanje prašine uklanja većinu čestica iz vazduha koji prolazi kroz motor, sprečavajući oštećenja i habanje. Meki start smanjuje trzaj pri pokretanju.",
    images: ["/placeholder-tool.svg"],
    attributes: {
      snaga: "850W - 1200W",
      napon: "230V",
      prihvat: "M14",
    },
    isFeatured: false,
    isPromo: true,
  },
  {
    id: "prod-4",
    sku: "UNI-1201CB",
    barcode: "3838909120150",
    name: "Unior Garnitura viljuškasto-okastih ključeva u kartonu 6-22mm (17 kom)",
    slug: "unior-garnitura-viljuskasto-okastih-kljuceva-6-22mm",
    brand: "Unior",
    categorySlug: "alati",
    categoryName: "Alati i oprema",
    subcategorySlug: "rucni-alat",
    subcategoryName: "Ručni alati i ključevi",
    price: 15890,
    vatRate: 0.2,
    unit: "pak",
    inStock: true,
    stockQuantity: 9,
    wmsLocation: "A-02-01-08",
    shortDescription: "Hrom-vanadijumski kovani ključevi krunisani po DIN 3113 standardu.",
    description: "Unior profesionalni ključevi izradjeni od vrhunskog hrom-vanadijum čelika, kovani i u celosti ojačani. Dugovečan i pouzdan radionički komplet.",
    images: ["/placeholder-tool.svg"],
    attributes: {
      materijal: "Hrom-vanadijum",
      broj_delova: "17 komada (6-22 mm)",
    },
    isFeatured: false,
  },

  // --- VODOVOD ---
  {
    id: "prod-5",
    sku: "PES-3SK110-1000",
    barcode: "8605012304912",
    name: "Peštan 3P Niskošumna kanalizaciona cev fi 110 x 1000 mm",
    slug: "pestan-3p-niskosumna-kanalizaciona-cev-110-1000",
    brand: "Peštan",
    categorySlug: "vodovod",
    categoryName: "Vodovod i kanalizacija",
    subcategorySlug: "cevi",
    subcategoryName: "Cevi i kanali",
    price: 940,
    vatRate: 0.2,
    unit: "kom",
    inStock: true,
    stockQuantity: 140,
    wmsLocation: "B-01-01-01",
    shortDescription: "Troslojna bešumna cev za unutrašnju kanalizaciju sa integrisanom zaptivkom.",
    description: "Peštan 3P cevi izrađene su od mineralno ojačanog polipropilena. Pružaju znatno smanjenje buke protoka otpadnih voda i visoku otpornost na hemikalije i toplotu.",
    images: ["/placeholder-pipe.svg"],
    attributes: {
      precnik: "fi 110",
      materijal: "PP mineralno ojačan",
      duzina: "1000 mm",
    },
    isFeatured: true,
  },
  {
    id: "prod-6",
    sku: "PES-PPR25-PN20",
    barcode: "8605012308821",
    name: "Peštan PP-R Cev za toplu i hladnu vodu fi 25 mm PN20 (4m)",
    slug: "pestan-ppr-cev-fi-25mm-pn20-4m",
    brand: "Peštan",
    categorySlug: "vodovod",
    categoryName: "Vodovod i kanalizacija",
    subcategorySlug: "cevi",
    subcategoryName: "Cevi i kanali",
    price: 490,
    vatRate: 0.2,
    unit: "kom",
    inStock: true,
    stockQuantity: 220,
    wmsLocation: "B-01-02-03",
    shortDescription: "Polipropilenska cev za vodovodne instalacije, pritisak PN20.",
    description: "Ekološki materijal otporan na kamenac i koroziju. Koristi se za instalaciju pijaće tople i hladne vode u stambenim i industrijskim objektima.",
    images: ["/placeholder-pipe.svg"],
    attributes: {
      precnik: "fi 25",
      materijal: "PP-R",
      pritisak: "PN 20",
    },
    isFeatured: false,
  },
  {
    id: "prod-7",
    sku: "VAL-KV12-LEP",
    barcode: "5901234567891",
    name: "Valvex Kugla ventil sa leptir ručkom 1/2\" PN30 Ž-Ž",
    slug: "valvex-kugla-ventil-leptir-rucka-1-2-pn30",
    brand: "Valvex",
    categorySlug: "vodovod",
    categoryName: "Vodovod i kanalizacija",
    subcategorySlug: "ventili",
    subcategoryName: "Kugla ventili i zasuni",
    price: 680,
    salePrice: 590,
    vatRate: 0.2,
    unit: "kom",
    inStock: true,
    stockQuantity: 85,
    wmsLocation: "B-03-01-14",
    shortDescription: "Mesingani kuglasti ventil sa punim protokom i crvenom leptir ručkom.",
    description: "Visokokvalitetni ventil za vodu i grejanje, testiran na radni pritisak do 30 bara. Telo od kovanog niklovanog mesinga.",
    images: ["/placeholder-valve.svg"],
    attributes: {
      precnik: "1/2\"",
      materijal: "Mesing",
      pritisak: "PN 30",
    },
    isFeatured: false,
    isPromo: true,
  },
  {
    id: "prod-8",
    sku: "PED-TOP2",
    barcode: "8056789012345",
    name: "Pedrollo TOP 2 Potapajuća drenažna pumpa za čistu vodu",
    slug: "pedrollo-top-2-potapajuca-pumpa",
    brand: "Pedrollo",
    categorySlug: "vodovod",
    categoryName: "Vodovod i kanalizacija",
    subcategorySlug: "pumpe-za-vodu",
    subcategoryName: "Pumpe za vodu i hidrofori",
    price: 18990,
    vatRate: 0.2,
    unit: "kom",
    inStock: true,
    stockQuantity: 7,
    wmsLocation: "B-04-03-01",
    shortDescription: "Italijanska potapajuća pumpa kapaciteta do 220 l/min (13.2 m³/h).",
    description: "Pedrollo TOP 2 je pogodna za drenažu bistre vode bez abrazivnih čestica. Odlična za pražnjenje poplavljenih podruma, rezervoara i bazena.",
    images: ["/placeholder-pump.svg"],
    attributes: {
      snaga: "370W",
      protok: "2000+ l/h",
      materijal: "Tehopolimer / Inox",
    },
    isFeatured: true,
  },

  // --- KUPATILA ---
  {
    id: "prod-9",
    sku: "GRO-32815000",
    barcode: "4005176883204",
    name: "Grohe BauLoop Jednoručna stojeća slavina za lavabo",
    slug: "grohe-bauloop-jednorucna-slavina-za-lavabo",
    brand: "Grohe",
    categorySlug: "kupatila",
    categoryName: "Kupatilska oprema i sanitarije",
    subcategorySlug: "slavine-i-baterije",
    subcategoryName: "Slavine i baterije",
    price: 7990,
    salePrice: 6690,
    vatRate: 0.2,
    unit: "kom",
    inStock: true,
    stockQuantity: 32,
    wmsLocation: "C-01-02-03",
    shortDescription: "Elegantna baterija sa Grohe Long-Life hromiranom obradom i EcoJoy perlatorom.",
    description: "Grohe BauLoop kombinuje moderan minimalistički dizajn sa vrhunskom tehnologijom. Opremljena je keramičkim mešačem 28 mm i perlatorom koji štedi do 50% vode.",
    images: ["/placeholder-faucet.svg"],
    attributes: {
      zavrsna_obrada: "Hrom sjaj",
      montaza: "Stojeća (na lavabo)",
      kartusa: "Keramički 28mm",
    },
    isFeatured: true,
    isPromo: true,
  },
  {
    id: "prod-10",
    sku: "HAN-71400000",
    barcode: "4011097738246",
    name: "Hansgrohe Logis Jednoručna zidna baterija za kadu i tuš",
    slug: "hansgrohe-logis-zidna-baterija-za-kadu",
    brand: "Hansgrohe",
    categorySlug: "kupatila",
    categoryName: "Kupatilska oprema i sanitarije",
    subcategorySlug: "slavine-i-baterije",
    subcategoryName: "Slavine i baterije",
    price: 11990,
    vatRate: 0.2,
    unit: "kom",
    inStock: true,
    stockQuantity: 15,
    wmsLocation: "C-01-02-06",
    shortDescription: "Pouzdana nemačka baterija sa AirPower tehnologijom i keramičkim mešačem.",
    description: "Hansgrohe Logis nudi vrhunsku ergonomiju i dugovečnost. Zidna montaža na standardni razmak 150 mm sa S-priključcima i integrisanim prebacivačem kada/tuš.",
    images: ["/placeholder-faucet.svg"],
    attributes: {
      zavrsna_obrada: "Hrom sjaj",
      montaza: "Zidna",
      kartusa: "Keramički 35mm",
    },
    isFeatured: false,
  },
  {
    id: "prod-11",
    sku: "GEB-111300005",
    barcode: "4025416301294",
    name: "Geberit Duofix Delta Ugradni vodokotlić za suvu gradnju 112cm",
    slug: "geberit-duofix-delta-ugradni-vodokotlic",
    brand: "Geberit",
    categorySlug: "kupatila",
    categoryName: "Kupatilska oprema i sanitarije",
    subcategorySlug: "ugradni-sistemi",
    subcategoryName: "Ugradni sistemi i vodokotlići",
    price: 24900,
    salePrice: 21990,
    vatRate: 0.2,
    unit: "kom",
    inStock: true,
    stockQuantity: 11,
    wmsLocation: "C-03-01-01",
    shortDescription: "Samonoseći čelični ugradni element sa Delta rezervoarom za konzolnu WC šolju.",
    description: "Švajcarski standard pouzdanosti. Geberit Duofix element je potpuno zaštićen od kondenzacije i podržava dvokoličinsko ispiranje (3/6L) sa Delta aktivacionim tipkama.",
    images: ["/placeholder-toilet.svg"],
    attributes: {
      montaza: "Ugradna (skrivena)",
      materijal: "Plastificirani čelik / PE",
    },
    isFeatured: true,
    isPromo: true,
  },

  // --- NAVODNJAVANJE ---
  {
    id: "prod-12",
    sku: "RNB-5004PL-PC",
    barcode: "0779850123490",
    name: "Rain Bird 5004-Plus Rotor rasprskivač 3/4\" sa diznama (40-360°)",
    slug: "rain-bird-5004-plus-rotor-rasprskivac",
    brand: "Rain Bird",
    categorySlug: "navodnjavanje",
    categoryName: "Sistemi za navodnjavanje",
    subcategorySlug: "prskalice",
    subcategoryName: "Rasprskivači i rotori",
    price: 2190,
    vatRate: 0.2,
    unit: "kom",
    inStock: true,
    stockQuantity: 65,
    wmsLocation: "D-02-01-04",
    shortDescription: "Vodeći svetski rotor za travnjake sa tehnologijom Rain Curtain zavese kapi.",
    description: "Podesivi sektor navodnjavanja od 40° do 360°. Poseduje Flow Shut-off mehanizam koji omogućava isključivanje pojedinačnog rotora bez zaustavljanja cele zone.",
    images: ["/placeholder-sprinkler.svg"],
    attributes: {
      prikljucak: "3/4\"",
      domet: "5 - 10 m",
      materijal: "UV otporna plastika",
    },
    isFeatured: true,
  },
  {
    id: "prod-13",
    sku: "GAR-18036",
    barcode: "4078500012356",
    name: "Gardena Baštensko armirano crevo Comfort FLEX 1/2\" 25m",
    slug: "gardena-bastensko-crevo-comfort-flex-1-2-25m",
    brand: "Gardena",
    categorySlug: "navodnjavanje",
    categoryName: "Sistemi za navodnjavanje",
    subcategorySlug: "creva",
    subcategoryName: "Baštenska i tehnička creva",
    price: 3690,
    vatRate: 0.2,
    unit: "kom",
    inStock: true,
    stockQuantity: 40,
    wmsLocation: "D-01-03-02",
    shortDescription: "Crevo sa Power Grip profilom, otporno na pritisak do 25 bara i uvijanje.",
    description: "Kvalitetno spiralno pletivo osigurava optimalnu fleksibilnost bez prelamanja i gužvanja creva. Ne sadrži ftalate i teške metale.",
    images: ["/placeholder-hose.svg"],
    attributes: {
      prikljucak: "1/2\"",
      pritisak: "PN 25",
      duzina: "25 m",
    },
    isFeatured: false,
  },
  {
    id: "prod-14",
    sku: "HNT-PGV101",
    barcode: "0886543210987",
    name: "Hunter PGV-101 Elektromagnetni ventil 1\" Ž-Ž sa kontrolom protoka (24VAC)",
    slug: "hunter-pgv-101-elektromagnetni-ventil-1",
    brand: "Hunter",
    categorySlug: "navodnjavanje",
    categoryName: "Sistemi za navodnjavanje",
    subcategorySlug: "automatika",
    subcategoryName: "Elektroventili i tajmeri",
    price: 3290,
    vatRate: 0.2,
    unit: "kom",
    inStock: true,
    stockQuantity: 30,
    wmsLocation: "D-03-02-01",
    shortDescription: "Robusni 24V elektromagnetni ventil za automatsko navodnjavanje sa regulatorom protoka.",
    description: "Industrijski standard za pouzdano upravljanje zonama navodnjavanja. Visokokvalitetna membrana sa dvostrukom ivicom za rad bez curenja.",
    images: ["/placeholder-valve.svg"],
    attributes: {
      prikljucak: "1\"",
      napon: "24V AC",
      protok: "500 - 1500 l/h",
    },
    isFeatured: false,
  },
];

// Keep the development catalogue counts consistent with the actual mock products.
for (const category of CATEGORIES) {
  category.itemCount = PRODUCTS.filter((product) => product.categorySlug === category.slug).length;
  for (const subcategory of category.subcategories) {
    subcategory.itemCount = PRODUCTS.filter((product) => product.subcategorySlug === subcategory.slug).length;
  }
}

export const BRANDS = Array.from(new Set(PRODUCTS.map((p) => p.brand))).sort();

export function getCategories(): ProductCategory[] {
  return CATEGORIES;
}

export function getCategoryBySlug(slug: string): ProductCategory | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getProducts(options?: {
  categorySlug?: string;
  subcategorySlug?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  search?: string;
  sort?: "price-asc" | "price-desc" | "name" | "popular";
}): Product[] {
  let list = [...PRODUCTS];

  if (options?.categorySlug) {
    list = list.filter((p) => p.categorySlug === options.categorySlug);
  }

  if (options?.subcategorySlug) {
    list = list.filter((p) => p.subcategorySlug === options.subcategorySlug);
  }

  if (options?.brand) {
    list = list.filter((p) => p.brand.toLowerCase() === options.brand?.toLowerCase());
  }

  if (options?.minPrice !== undefined) {
    list = list.filter((p) => (p.salePrice ?? p.price) >= (options.minPrice ?? 0));
  }

  if (options?.maxPrice !== undefined) {
    list = list.filter((p) => (p.salePrice ?? p.price) <= (options.maxPrice ?? Infinity));
  }

  if (options?.inStockOnly) {
    list = list.filter((p) => p.inStock && p.stockQuantity > 0);
  }

  if (options?.search) {
    const q = options.search.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.categoryName.toLowerCase().includes(q)
    );
  }

  if (options?.sort) {
    switch (options.sort) {
      case "price-asc":
        list.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
        break;
      case "price-desc":
        list.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
        break;
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name, "sr"));
        break;
      case "popular":
      default:
        list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }
  }

  return list;
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return PRODUCTS.filter(
    (p) => p.id !== product.id && p.categorySlug === product.categorySlug
  ).slice(0, limit);
}
