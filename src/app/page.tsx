import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ChevronRight, MapPin, Truck, Store, ShieldCheck } from "lucide-react";
import { getCategoryIcon } from "@/lib/category-icons";
import { db } from "@/lib/db";
import { getHomepageData } from "@/services/home-service";
import { getHomeContent } from "@/actions/page-cms-actions";
import { DEFAULT_HOME } from "@/lib/home-content";
import ProductCard from "@/components/catalog/ProductCard";
import HeroSlider from "@/components/home/HeroSlider";

export async function generateMetadata(): Promise<Metadata> {
  const home = await getHomeContent();
  return {
    title: home?.seoTitle?.trim() || "Aqua Still Zlatibor | Alati, vodovodni materijal i kupatilska oprema",
    description: home?.seoDescription?.trim() || "Aqua Still Zlatibor – alati, vodovodni i kanalizacioni materijal, kupatilska oprema, navodnjavanje i grejanje za svaki projekat.",
  };
}

const quickLinks = [
  ["Električne brusilice", "/katalog?category=alati&subcategory=elektricne-brusilice"],
  ["Pumpe za vodu", "/katalog?category=vodovod&subcategory=pumpe-za-vodu"],
  ["Slavine i baterije", "/katalog?category=kupatila&subcategory=slavine-i-baterije"],
  ["Fiting i spojnice", "/katalog?category=vodovod&subcategory=fiting"],
  ["Baštenska oprema", "/katalog?category=navodnjavanje&subcategory=basta-oprema"],
  ["Brusne i rezne ploče", "/katalog?category=alati&subcategory=brusne-rezne-ploce"],
] as const;

const tipFilenames = [
  "05-vodena-pumpa-vodic.webp",
  "06-renoviranje-kupatila-savet.webp",
  "07-navodnjavanje-inspiracija.webp",
  "08-farbanje-uradi-sam.webp",
];

const tipLinks = [
  "kako-izabrati-pravu-pumpu-za-vodu",
  "renoviranje-kupatila-od-cega-poceti",
  "sistemi-za-navodnjavanje-za-vase-dvoriste",
  "farbanje-zida-korak-po-korak",
];

const tipTitles = [
  "Kako izabrati pravu pumpu za vodu?",
  "Renoviranje kupatila – od čega početi?",
  "Sistemi za navodnjavanje za vaše dvorište",
  "Farbanje zida korak po korak",
];

async function getHomepageMedia() {
  if (!process.env.DATABASE_URL) return { tips: [] };

  try {
    const tips = await db.mediaAsset.findMany({
      where: { filename: { in: tipFilenames } },
      select: { url: true, filename: true, altText: true },
    });

    return {
      tips: tipFilenames
        .map((filename) => tips.find((item) => item.filename === filename))
        .filter((item): item is (typeof tips)[number] => Boolean(item)),
    };
  } catch (error) {
    console.warn("Homepage media fetch failed:", error);
    return { tips: [] };
  }
}

export default async function HomePage() {
  const [data, homeContent, media] = await Promise.all([
    getHomepageData(),
    getHomeContent(),
    getHomepageMedia(),
  ]);

  const home = homeContent ?? DEFAULT_HOME;
  const featuredCategories = data.categories.filter((category) => category.featured).length
    ? data.categories.filter((category) => category.featured).slice(0, 9)
    : data.categories.slice(0, 9);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f6f4] text-slate-950">
      {/* 1. Interaktivni Hero slajder sa tematskim banerima (iz CMS-a ili predefinisani) */}
      <HeroSlider slides={home.heroSlides} />

      {/* 2. Brza pretraga i benefiti kupovine */}
      <section className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="mb-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
            <span>Brza pretraga</span>
            <span className="h-px w-6 bg-slate-300" />
          </div>
          <div className="mb-2.5 flex flex-wrap gap-1.5">
            {["Makita", "Wilo pumpe", "Slavine", "Fiting 1/2\"", "Brusne i rezne ploče"].map((tag) => (
              <Link
                key={tag}
                href={"/katalog?q=" + encodeURIComponent(tag)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10.5px] font-bold text-slate-700 transition hover:border-[#005B94]/40 hover:bg-blue-50/50 hover:text-[#005B94]"
              >
                {tag}
              </Link>
            ))}
          </div>
          <div className="grid grid-cols-2 divide-x divide-slate-200 sm:grid-cols-4">
            {[
              [Truck, "Brza isporuka", "na teritoriji Srbije"],
              [Store, "Preuzimanje u radnji", "Zlatibor"],
              [ShieldCheck, "Proverena dostupnost", "informacije o stanju"],
              [MapPin, "Preuzimanje", "Milanđane Pecića 4"],
            ].map(([Icon, title, text]) => (
              <div key={title as string} className="flex items-center gap-2.5 px-3 py-2 sm:px-4">
                <Icon className="h-4 w-4 shrink-0 text-slate-800" />
                <div>
                  <p className="text-[11px] font-black text-slate-900">{title as string}</p>
                  <p className="text-[9.5px] text-slate-500">{text as string}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Izdvojene kategorije */}
      <section className="max-w-7xl mx-auto px-4 pt-6 sm:px-6 lg:px-8 sm:pt-8">
        <div className="mb-3.5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#005B94]">Istražite ponudu</p>
            <h2 className="mt-0.5 text-xl font-black tracking-tight sm:text-2xl">Kategorije</h2>
          </div>
          <Link href="/katalog" className="text-xs font-black text-[#005B94] hover:text-[#004570]">
            Sve kategorije <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3.5 lg:grid-cols-4">
          {featuredCategories.slice(0, 8).map((category, index) => {
            const CategoryIcon = getCategoryIcon(category.slug || category.name);
            return (
              <Link
                key={category.id}
                href={"/katalog?category=" + category.slug}
                className="group relative aspect-[1.55] sm:aspect-[1.5] overflow-hidden rounded-xl bg-slate-900"
              >
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    sizes={index === 0 ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 1024px) 50vw, 25vw"}
                    className="object-cover brightness-[0.78] saturate-[0.82] transition duration-500 group-hover:scale-105 group-hover:brightness-[0.86]"
                  />
                ) : null}
                <div className="absolute inset-0 bg-slate-950/32" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/88 via-slate-950/35 to-slate-950/10" />
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-3.5">
                  <div className="flex items-end justify-between gap-2.5">
                    <div>
                      <div className="mb-1.5 flex h-7 w-7 items-center justify-center rounded-md bg-white/15 text-cyan-200 backdrop-blur-sm">
                        <CategoryIcon className="h-3.5 w-3.5" strokeWidth={2} />
                      </div>
                      <p className="mb-0.5 text-[8.5px] font-black uppercase tracking-[0.16em] text-cyan-300">
                        {category.itemCount} artikala
                      </p>
                      <h3 className="text-sm font-black text-white sm:text-base leading-snug">{category.name}</h3>
                      <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-200/80">
                        {category.description || "Pogledajte ponudu"}
                      </p>
                    </div>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm transition group-hover:bg-[#005B94] group-hover:text-white">
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Najtraženije grupe */}
      <section className="max-w-7xl mx-auto px-4 pt-6 sm:px-6 lg:px-8 sm:pt-8">
        <div className="mb-3.5 flex items-end justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#005B94]">Brz pristup</p>
            <h2 className="mt-0.5 text-xl font-black tracking-tight sm:text-2xl">Najtraženije grupe</h2>
          </div>
          <Link href="/katalog" className="text-xs font-bold text-[#005B94]">
            Ceo katalog <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid overflow-hidden rounded-xl border border-slate-200 bg-white sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map(([label, href], index) => {
            const Icon = getCategoryIcon(label);
            return (
              <Link
                key={label}
                href={href}
                className={
                  "group flex items-center justify-between px-3.5 py-3 transition hover:bg-slate-50 " +
                  (index > 0 ? "border-l border-slate-200" : "") +
                  (index >= 3 ? "border-t border-slate-200" : "")
                }
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition-colors group-hover:bg-cyan-50 group-hover:text-cyan-700">
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <span className="min-w-0">
                    <span className="mb-0.5 block text-[8.5px] font-black uppercase tracking-[0.16em] text-cyan-700">
                      0{index + 1}
                    </span>
                    <span className="block truncate text-xs sm:text-sm font-bold text-slate-800">{label}</span>
                  </span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-cyan-700" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5. Najtraženiji proizvodi */}
      <section className="max-w-7xl mx-auto px-4 pt-6 sm:px-6 lg:px-8 sm:pt-8">
        <div className="mb-3.5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#005B94]">Izdvojeno</p>
            <h2 className="mt-0.5 text-xl font-black tracking-tight sm:text-2xl">Najtraženiji proizvodi</h2>
            <p className="mt-0.5 text-xs text-slate-500">Provereni proizvodi koje kupci najčešće biraju.</p>
          </div>
          <Link href="/katalog" className="text-xs font-black text-[#005B94] hover:text-[#004570]">
            Pogledaj sve <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
          {data.popularProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. Dva velika promo banera: Akcija & B2B Profesionalni program */}
      <section className="max-w-7xl mx-auto grid gap-3.5 px-4 pt-6 sm:px-6 sm:pt-8 md:grid-cols-2 lg:px-8">
        <Link
          href="/katalog?category=akcija"
          className="group relative min-h-40 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-4 sm:p-5 text-white shadow-sm"
        >
          <div className="relative z-10 max-w-[58%]">
            <span className="text-[9px] font-black uppercase tracking-[0.16em] text-cyan-300">Posebna ponuda</span>
            <h3 className="mt-1 text-lg sm:text-xl font-black leading-tight">Akcijska ponuda</h3>
            <p className="mt-1 text-xs text-slate-300">Odabrani proizvodi po posebnim cenama.</p>
            <span className="mt-3.5 inline-flex items-center gap-1.5 text-xs font-black text-white/90">
              Otvori akcijsku ponudu <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
          {data.popularProducts[0]?.images?.[0] ? (
            <Image
              src={data.popularProducts[0].images[0]}
              alt="Akcijska ponuda"
              fill
              sizes="50vw"
              className="object-cover object-right opacity-35 transition group-hover:scale-105"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-950/35" />
        </Link>

        <Link
          href="/katalog"
          className="group relative min-h-40 overflow-hidden rounded-xl border border-cyan-900 bg-slate-900 p-4 sm:p-5 text-white shadow-sm"
        >
          <div className="relative z-10 max-w-[62%]">
            <span className="text-[9px] font-black uppercase tracking-[0.16em] text-cyan-300">Za majstore</span>
            <h3 className="mt-1 text-lg sm:text-xl font-black leading-tight">Profesionalni program</h3>
            <ul className="mt-2 space-y-0.5 text-xs text-slate-300">
              <li>✓ Profesionalni alati (Bosch, Makita, DeWalt)</li>
              <li>✓ Vodovodni materijal (Peštan, Valvex)</li>
              <li>✓ Pumpe i navodnjavanje (Pedrollo)</li>
              <li>✓ B2B cene i rabati na predračun</li>
            </ul>
            <span className="mt-3.5 inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-black text-white backdrop-blur-sm">
              Pogledaj ponudu <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
          {featuredCategories[0]?.imageUrl ? (
            <Image
              src={featuredCategories[0].imageUrl}
              alt="Profesionalni program"
              fill
              sizes="50vw"
              className="object-cover object-right opacity-30 transition group-hover:scale-105"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-950/35" />
        </Link>
      </section>

      {/* 7. Brendovi */}
      {data.brands.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pt-6 sm:px-6 lg:px-8 sm:pt-8">
          <div className="mb-3.5 flex items-end justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-700">Proizvođači</p>
              <h2 className="mt-0.5 text-xl font-black sm:text-2xl">Brendovi</h2>
              <p className="mt-0.5 text-xs text-slate-500">Provereni proizvođači iz našeg asortimana.</p>
            </div>
            <Link href="/brendovi" className="text-xs font-black text-cyan-700">
              Svi brendovi <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {data.brands.slice(0, 18).map((brand) => (
              <Link
                key={brand.id}
                href={"/katalog?brand=" + encodeURIComponent(brand.name)}
                className="flex h-13 min-w-28 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 shadow-sm transition hover:border-cyan-300 hover:shadow-md"
              >
                {brand.logoUrl ? (
                  <Image
                    src={brand.logoUrl}
                    alt={brand.name}
                    width={110}
                    height={42}
                    className="max-h-7 w-auto object-contain"
                  />
                ) : (
                  <span className="text-xs font-black uppercase tracking-wide text-slate-700">
                    {brand.name}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 8. Saveti i vodiči */}
      {media.tips.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pt-6 sm:px-6 lg:px-8 sm:pt-8">
          <div className="mb-3.5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-700">Saveti i ideje</p>
              <h2 className="mt-0.5 text-xl font-black tracking-tight sm:text-2xl">
                Korisni vodiči za vaš projekat
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Kratki tekstovi, vodiči i preporuke za izbor proizvoda.
              </p>
            </div>
            <Link href="/saveti" className="text-xs font-black text-cyan-700">
              Pogledaj sve savete <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
            {media.tips.map((tip, index) => (
              <Link
                key={tip.url}
                href={"/saveti/" + tipLinks[index]}
                className="group relative aspect-[1.5] overflow-hidden rounded-lg bg-slate-900"
              >
                <Image
                  src={tip.url}
                  alt={tip.altText || tipTitles[index]}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                  <span className="rounded bg-white/90 px-1.5 py-0.5 text-[8px] font-black uppercase text-slate-800">
                    {["Vodič", "Savet", "Inspiracija", "Uradi sam"][index]}
                  </span>
                  <h3 className="mt-1 text-xs sm:text-sm font-extrabold leading-tight">{tipTitles[index]}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 9. SEO Footer opis */}
      <section className="max-w-7xl mx-auto px-4 pb-8 pt-6 sm:px-6 lg:px-8 sm:pt-8">
        <div className="border-t border-slate-200 pt-4">
          <p className="max-w-4xl text-xs leading-relaxed text-slate-500">{home.description}</p>
        </div>
      </section>
    </main>
  );
}
