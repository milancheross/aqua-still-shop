import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ChevronRight, MapPin, Truck, Store, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { getHomepageData } from "@/services/home-service";
import { getHomeContent } from "@/actions/page-cms-actions";
import { DEFAULT_HOME } from "@/lib/home-content";
import ProductCard from "@/components/catalog/ProductCard";

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
  if (!process.env.DATABASE_URL) return { hero: undefined, tips: [] };

  try {
    const [hero, tips] = await Promise.all([
      db.mediaAsset.findFirst({
        where: { folder: "hero" },
        orderBy: { createdAt: "desc" },
        select: { url: true, altText: true },
      }),
      db.mediaAsset.findMany({
        where: { filename: { in: tipFilenames } },
        select: { url: true, filename: true, altText: true },
      }),
    ]);

    return {
      hero,
      tips: tipFilenames
        .map((filename) => tips.find((item) => item.filename === filename))
        .filter((item): item is (typeof tips)[number] => Boolean(item)),
    };
  } catch (error) {
    console.warn("Homepage media fetch failed:", error);
    return { hero: undefined, tips: [] };
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
      <section className="relative overflow-hidden bg-slate-950 text-white">
        {media.hero ? (
          <Image
            src={media.hero.url}
            alt={media.hero.altText || "Aqua Still — alati, materijal i oprema"}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-55"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/92 via-slate-950/65 to-slate-950/20" />
        <div className="relative container mx-auto px-4 py-7 sm:px-6 lg:px-8 lg:py-8">
          <div className="flex items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="mb-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">
                <span className="h-px w-6 bg-cyan-400" /> Aqua Still · Zlatibor
              </div>
              <h1 className="text-2xl font-black leading-[1.04] tracking-tight sm:text-3xl lg:text-4xl">
                {home.title || "Sve za vaš dom, projekat i profesionalni rad."}
              </h1>
              <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-200 sm:text-sm">
                {home.description || "Alati, vodovod, kupatila, navodnjavanje, elektro-oprema i još mnogo toga."}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
              <Link href="/katalog" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-orange-500">
                Pogledaj katalog <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="mb-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
            <span>Brza pretraga</span><span className="h-px w-6 bg-slate-300" />
          </div>
          <div className="mb-3 flex flex-wrap gap-2">
            {["Makita", "Wilo pumpe", "Slavine", "Fiting 1/2\"","Brusne i rezne ploče"].map((tag) => (
              <Link key={tag} href={"/katalog?q=" + encodeURIComponent(tag)} className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-[11px] font-bold text-slate-700 transition hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-800">
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
            <div key={title as string} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
              <Icon className="h-5 w-5 shrink-0 text-slate-800" />
              <div>
                <p className="text-xs font-black text-slate-900">{title as string}</p>
                <p className="text-[10px] text-slate-500">{text as string}</p>
              </div>
            </div>
          ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pt-9 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-700">Istražite ponudu</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Kategorije</h2>
          </div>
          <Link href="/katalog" className="text-xs font-black text-cyan-700 hover:text-cyan-900">Sve kategorije <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {featuredCategories.slice(0, 8).map((category, index) => (
            <Link
              key={category.id}
              href={"/katalog/" + category.slug}
              className="group relative aspect-[1.35] overflow-hidden rounded-2xl bg-slate-900"
            >
              {category.imageUrl ? (
                <Image src={category.imageUrl} alt={category.name} fill sizes={index === 0 ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 1024px) 50vw, 25vw"} className="object-cover transition duration-500 group-hover:scale-105" />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="mb-1 text-[9px] font-black uppercase tracking-[0.16em] text-cyan-300">{category.itemCount} artikala</p>
                    <h3 className="text-base font-black text-white sm:text-lg">{category.name}</h3>
                    <p className="mt-1 line-clamp-1 text-[11px] text-slate-200/80">{category.description || "Pogledajte ponudu"}</p>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm transition group-hover:bg-orange-600 group-hover:text-white">
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pt-10 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-700">Brz pristup</p>
            <h2 className="mt-1 text-2xl font-black">Najtraženije grupe</h2>
          </div>
          <Link href="/katalog" className="text-xs font-bold text-cyan-700">Ceo katalog <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>
        </div>
        <div className="grid overflow-hidden rounded-xl border border-slate-200 bg-white sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map(([label, href], index) => (
            <Link key={label} href={href} className={"group flex items-center justify-between px-4 py-4 transition hover:bg-slate-50 " + (index > 0 ? "border-l border-slate-200" : "") + (index >= 3 ? "border-t border-slate-200" : "")}>
              <span>
                <span className="mb-1 block text-[9px] font-black uppercase tracking-[0.16em] text-orange-600">0{index + 1}</span>
                <span className="text-sm font-bold text-slate-800">{label}</span>
              </span>
              <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-orange-600" />
            </Link>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pt-10 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-700">Izdvojeno</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Najtraženiji proizvodi</h2>
            <p className="mt-1 text-xs text-slate-500">Provereni proizvodi koje kupci najčešće biraju.</p>
          </div>
          <Link href="/katalog" className="text-xs font-black text-cyan-700">Pogledaj sve <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {data.popularProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="container mx-auto grid gap-4 px-4 pt-9 sm:px-6 md:grid-cols-2 lg:px-8">
        <Link href="/katalog/akcija" className="group relative min-h-48 overflow-hidden rounded-2xl bg-gradient-to-r from-red-700 to-orange-500 p-6 text-white shadow-sm">
          <div className="relative z-10 max-w-[55%]">
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-red-100">Posebna ponuda</span>
            <h3 className="mt-2 text-2xl font-black leading-tight">Akcijska ponuda</h3>
            <p className="mt-2 text-sm text-red-50">Odabrani proizvodi po posebnim cenama.</p>
            <span className="mt-5 inline-flex items-center gap-2 text-xs font-black text-white/90">Otvori akcijsku ponudu <ArrowRight className="h-3.5 w-3.5" /></span>
          </div>
          {data.popularProducts[0]?.images?.[0] ? <Image src={data.popularProducts[0].images[0]} alt="Akcijska ponuda" fill sizes="50vw" className="object-cover object-right opacity-55 transition group-hover:scale-105" /> : null}
          <div className="absolute inset-0 bg-gradient-to-r from-red-800/95 via-orange-600/65 to-transparent" />
        </Link>

        <Link href="/katalog" className="group relative min-h-48 overflow-hidden rounded-2xl bg-cyan-800 p-6 text-white shadow-sm">
          <div className="relative z-10 max-w-[60%]">
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-100">Za majstore</span>
            <h3 className="mt-2 text-2xl font-black leading-tight">Profesionalni program</h3>
            <ul className="mt-3 space-y-1 text-xs text-cyan-50"><li>✓ Profesionalni alati</li><li>✓ Vodovodni materijal</li><li>✓ Pumpe i navodnjavanje</li><li>✓ Potrošni materijal</li></ul>
            <span className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-black text-cyan-800">Pogledaj ponudu <ArrowRight className="h-3.5 w-3.5" /></span>
          </div>
          {featuredCategories[0]?.imageUrl ? <Image src={featuredCategories[0].imageUrl} alt="Profesionalni program" fill sizes="50vw" className="object-cover object-right opacity-45 transition group-hover:scale-105" /> : null}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/95 via-cyan-800/65 to-transparent" />
        </Link>
      </section>

      {data.brands.length > 0 && (
        <section className="container mx-auto px-4 pt-10 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-700">Proizvođači</p>
              <h2 className="mt-1 text-2xl font-black">Brendovi</h2>
              <p className="mt-1 text-xs text-slate-500">Provereni proizvođači iz našeg asortimana.</p>
            </div>
            <Link href="/brendovi" className="text-xs font-black text-cyan-700">Svi brendovi <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {data.brands.slice(0, 18).map((brand) => (
              <Link key={brand.id} href={"/katalog?brand=" + encodeURIComponent(brand.name)} className="flex h-16 min-w-32 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition hover:border-cyan-300 hover:shadow-md">
                {brand.logoUrl ? (
                  <Image src={brand.logoUrl} alt={brand.name} width={110} height={42} className="max-h-9 w-auto object-contain" />
                ) : (
                  <span className="text-xs font-black uppercase tracking-wide text-slate-700">{brand.name}</span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {media.tips.length > 0 && (
        <section className="container mx-auto px-4 pt-10 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-700">Saveti i ideje</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Korisni vodiči za vaš projekat</h2>
              <p className="mt-1 text-xs text-slate-500">Kratki tekstovi, vodiči i preporuke za izbor proizvoda.</p>
            </div>
            <Link href="/saveti" className="text-xs font-black text-cyan-700">Pogledaj sve savete <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {media.tips.map((tip, index) => (
              <Link key={tip.url} href={"/saveti/" + tipLinks[index]} className="group relative aspect-[1.42] overflow-hidden rounded-xl bg-slate-900">
                <Image src={tip.url} alt={tip.altText || tipTitles[index]} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3 text-white sm:p-4">
                  <span className="rounded bg-white/90 px-1.5 py-1 text-[8px] font-black uppercase text-slate-800">{["Vodič", "Savet", "Inspiracija", "Uradi sam"][index]}</span>
                  <h3 className="mt-2 text-sm font-black leading-tight">{tipTitles[index]}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 pb-10 pt-10 sm:px-6 lg:px-8">
        <div className="border-t border-slate-200 pt-5">
          <p className="max-w-4xl text-xs leading-relaxed text-slate-500">{home.description}</p>
        </div>
      </section>
    </main>
  );
}
