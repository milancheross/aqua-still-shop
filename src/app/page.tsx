import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ChevronRight, Truck, ShieldCheck, Headphones, Store, Wrench, Sparkles, Droplets, Home, Paintbrush } from "lucide-react";
import { getDbProducts, getDbBrands, getDbCategories } from "@/services/product-service";
import { db } from "@/lib/db";
import ProductCard from "@/components/catalog/ProductCard";
import { getHomeContent } from "@/actions/page-cms-actions";
import { DEFAULT_HOME } from "@/lib/home-content";

export async function generateMetadata(): Promise<Metadata> {
  const home = await getHomeContent();
  return {
    title: home?.seoTitle?.trim() || "Aqua Still Zlatibor | Alati, vodovodni materijal i kupatilska oprema",
    description: home?.seoDescription?.trim() || "Aqua Still Zlatibor – alati, vodovodni i kanalizacioni materijal, kupatilska oprema, navodnjavanje i grejanje za svaki projekat.",
  };
}

function titleWithAccent(title: string, accent: string) {
  const index = accent ? title.indexOf(accent) : -1;
  if (index < 0) return title;
  return (
    <>
      {title.slice(0, index)}
      <span className="text-cyan-400">{accent}</span>
      {title.slice(index + accent.length)}
    </>
  );
}

const projectIcons = [Home, Droplets, Wrench, Paintbrush];

export default async function HomePage() {
  const featuredProducts = (await getDbProducts({ sort: "popular" })).slice(0, 6);
  const brandsList = await getDbBrands();
  const categories = await getDbCategories();
  const home = (await getHomeContent()) ?? DEFAULT_HOME;

  const projectFilenames = [
    "01-kupatilo-projekat.webp",
    "02-dvoriste-navodnjavanje.webp",
    "03-radionica-alati.webp",
    "04-obnova-doma-farbanje.webp",
  ];
  const tipFilenames = [
    "05-vodena-pumpa-vodic.webp",
    "06-renoviranje-kupatila-savet.webp",
    "07-navodnjavanje-inspiracija.webp",
    "08-farbanje-uradi-sam.webp",
  ];

  const [projectMedia, tipMedia] = await Promise.all([
    db.mediaAsset.findMany({
      where: { filename: { in: projectFilenames } },
      select: { url: true, filename: true, altText: true },
    }),
    db.mediaAsset.findMany({
      where: { filename: { in: tipFilenames } },
      select: { url: true, filename: true, altText: true },
    }),
  ]);

  const projectImages = projectFilenames
    .map((filename) => projectMedia.find((item) => item.filename === filename))
    .filter((item): item is (typeof projectMedia)[number] => Boolean(item));

  const tipImages = tipFilenames
    .map((filename) => tipMedia.find((item) => item.filename === filename))
    .filter((item): item is (typeof tipMedia)[number] => Boolean(item));

  const featuredCategories = categories.filter((category) => category.featured).length > 0
    ? categories.filter((category) => category.featured).slice(0, 8)
    : categories.slice(0, 8);

  let managedHeroImage: string | undefined;
  let managedMobileHeroImage: string | undefined;

  try {
    if (process.env.DATABASE_URL) {
      const [desktopHero, mobileHero] = await Promise.all([
        db.mediaAsset.findFirst({ where: { folder: "hero" }, orderBy: { createdAt: "desc" }, select: { url: true } }),
        db.mediaAsset.findFirst({ where: { folder: "hero-mobile" }, orderBy: { createdAt: "desc" }, select: { url: true } }),
      ]);
      managedHeroImage = desktopHero?.url;
      managedMobileHeroImage = mobileHero?.url;
    }
  } catch (error) {
    console.warn("Could not load managed hero images:", error);
  }

  const heroProduct = featuredProducts.find((product) => product.images?.some(Boolean));
  const heroImage = managedHeroImage || heroProduct?.images.find(Boolean);
  const mobileHeroImage = managedMobileHeroImage || managedHeroImage || heroImage;

  const trustItems = [
    { title: "Brza isporuka", subtitle: "na adresu", icon: Truck },
    { title: "Preuzimanje u radnji", subtitle: "Poručite online, preuzmite sutra", icon: Store },
    { title: "Proverena dostupnost", subtitle: "Tačne informacije o stanju", icon: ShieldCheck },
    { title: "Sigurna kupovina", subtitle: "Više načina plaćanja", icon: ShieldCheck },
    { title: "Podrška kupcima", subtitle: "Tu smo za sva pitanja", icon: Headphones },
  ];

  const projectCards = projectImages.map((image, index) => ({
    image,
    title: ["Uredite svoje kupatilo", "Sredite svoje dvorište", "Dopunite svoj alat", "Obnovite svoj dom"][index],
    text: [
      "Od slavina do tuš kabina — sve za moderno i funkcionalno kupatilo.",
      "Sistemi za navodnjavanje, baštenski alat i oprema za svaki dan.",
      "Električni i ručni alati za radionicu, montažu i svaki posao.",
      "Boje, lakovi, lepkovi i materijal za renoviranje.",
    ][index],
    icon: projectIcons[index],
  }));


  return (
    <div className="flex flex-col bg-slate-50 pb-16 overflow-x-hidden">
      <section className="relative isolate min-h-[430px] overflow-hidden bg-slate-950 sm:min-h-[500px] lg:min-h-[560px]">
        {managedHeroImage ? (
          <Image src={managedHeroImage} alt="Aqua Still — profesionalni alati i oprema" fill priority sizes="100vw" className="absolute inset-0 z-0 hidden object-cover object-center md:block" />
        ) : null}
        {mobileHeroImage ? (
          <Image src={mobileHeroImage} alt="Aqua Still — alati, oprema i materijal" fill sizes="100vw" className="absolute inset-0 z-0 object-cover object-[68%_center] md:hidden" />
        ) : null}
        <div className={"absolute inset-0 z-10 " + (heroImage ? "bg-gradient-to-r from-slate-950/95 via-slate-950/72 to-slate-950/15 md:from-slate-950/95 md:via-slate-950/65 md:to-slate-950/10" : "bg-slate-950")} />
        <div className="container relative z-20 mx-auto flex min-h-[430px] items-center px-4 py-12 sm:min-h-[500px] sm:px-6 sm:py-16 lg:min-h-[560px] lg:px-8">
          <div className="max-w-2xl space-y-5 sm:space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100 sm:text-xs">
              <Sparkles className="h-3.5 w-3.5" /> {home.eyebrow}
            </span>
            <h1 className="max-w-xl text-4xl font-black leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {titleWithAccent(home.title, home.titleAccent)}
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-100 sm:text-base lg:text-lg">{home.description}</p>
            <div className="flex flex-col gap-3 pt-1 sm:flex-row">
              <Link href={home.primaryHref} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-cyan-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-500 sm:px-8 sm:text-base">
                {home.primaryLabel} <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href={home.secondaryHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20 sm:px-8 sm:text-base">
                {home.secondaryLabel}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-30 border-b border-slate-200 bg-white">
        <div className="container mx-auto grid grid-cols-2 gap-0 px-4 py-4 sm:px-6 md:grid-cols-3 lg:grid-cols-5 lg:px-8">
          {trustItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className={"flex items-center gap-3 px-3 py-3 lg:px-4 " + (index > 0 ? "border-l border-slate-100 " : "") + (index === 4 ? "col-span-2 md:col-span-1" : "")}>
                <Icon className="h-6 w-6 shrink-0 text-slate-800" />
                <div className="min-w-0">
                  <h4 className="text-[11px] font-black text-slate-900 sm:text-xs">{item.title}</h4>
                  <p className="text-[10px] leading-snug text-slate-500">{item.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="container mx-auto px-4 pt-10 sm:px-6 lg:px-8 lg:pt-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">{home.exploreEyebrow}</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{home.exploreTitle}</h2>
          </div>
          <Link href="/katalog" className="hidden items-center gap-1 text-xs font-bold text-cyan-700 sm:inline-flex">Pogledaj sve kategorije <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
          {featuredCategories.map((category) => (
            <Link key={category.id} href={"/katalog/" + category.slug} className="group relative aspect-[1.42] overflow-hidden rounded-xl bg-slate-900 shadow-sm">
              {category.imageUrl ? <Image src={category.imageUrl} alt={category.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover transition duration-500 group-hover:scale-105" /> : <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-cyan-950" />}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                <h3 className="text-sm font-black text-white sm:text-base">{category.name}</h3>
                <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-200 sm:text-xs">{category.description || "Pogledajte ponudu"}</p>
              </div>
              <span className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm transition group-hover:bg-cyan-500 group-hover:text-white"><ChevronRight className="h-4 w-4" /></span>
            </Link>
          ))}
        </div>
      </section>

      {projectCards.length > 0 && (
        <section className="container mx-auto px-4 pt-12 sm:px-6 lg:px-8">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Pronađite rešenje</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Ideje i rešenja za vaš projekat</h2>
            <p className="mt-1 max-w-2xl text-xs text-slate-500 sm:text-sm">Pronađite sve što vam treba za jednu konkretnu stvar.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {projectCards.map(({ image, title, text, icon: Icon }) => (
              <Link key={image.url} href="/katalog" className="group relative min-h-48 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                <Image src={image.url} alt={image.altText || title} fill sizes="(max-width: 640px) 100vw, 25vw" className="object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <Icon className="mb-2 h-5 w-5 text-cyan-300" />
                  <h3 className="text-base font-black">{title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-200">{text}</p>
                  <span className="mt-3 inline-flex items-center gap-1 rounded-lg border border-white/40 bg-white/10 px-3 py-1.5 text-[10px] font-black backdrop-blur-sm">Pogledaj ponudu <ArrowRight className="h-3 w-3" /></span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {featuredCategories.length > 0 && (
        <section className="container mx-auto px-4 pt-10 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 sm:text-2xl">{home.popularTitle}</h2>
            <Link href="/katalog" className="text-xs font-bold text-cyan-700">Pogledaj sve <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {featuredCategories.map((category) => (
              <Link key={category.id} href={"/katalog/" + category.slug} className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-cyan-300 hover:text-cyan-700">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-cyan-700">{category.name.slice(0, 1)}</span>
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 pt-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Najprodavaniji proizvodi</h2>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">Provereni proizvodi koje kupci najčešće biraju.</p>
          </div>
          <Link href="/katalog" className="text-xs font-bold text-cyan-700">Pogledaj sve <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
          {featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="container mx-auto grid gap-4 px-4 pt-8 sm:px-6 md:grid-cols-2 lg:px-8">
        <Link href="/katalog/akcija" className="group relative min-h-48 overflow-hidden rounded-2xl bg-gradient-to-r from-red-700 to-red-500 p-6 text-white shadow-sm">
          <div className="relative z-10 max-w-[52%]">
            <span className="text-xs font-black uppercase tracking-[0.15em] text-red-100">Posebna ponuda</span>
            <h3 className="mt-2 text-2xl font-black leading-tight">Akcijska ponuda</h3>
            <p className="mt-2 text-sm text-red-50">Odabrani proizvodi po posebnim cenama.</p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-black text-red-700">Pogledaj akcije <ArrowRight className="h-3.5 w-3.5" /></span>
          </div>
          {featuredProducts[0]?.images?.[0] ? <Image src={featuredProducts[0].images[0]} alt="Akcijska ponuda" fill sizes="50vw" className="object-cover object-right opacity-60 transition group-hover:scale-105" /> : null}
          <div className="absolute inset-0 bg-gradient-to-r from-red-800/95 via-red-700/65 to-transparent" />
        </Link>
        <Link href="/katalog" className="group relative min-h-48 overflow-hidden rounded-2xl bg-cyan-800 p-6 text-white shadow-sm">
          <div className="relative z-10 max-w-[60%]">
            <span className="text-xs font-black uppercase tracking-[0.15em] text-cyan-100">Za majstore</span>
            <h3 className="mt-2 text-2xl font-black leading-tight">Profesionalni program</h3>
            <ul className="mt-3 space-y-1 text-xs text-cyan-50"><li>✓ Profesionalni alati</li><li>✓ Vodovodni materijal</li><li>✓ Pumpe i navodnjavanje</li><li>✓ Potrošni materijal</li></ul>
            <span className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-black text-cyan-800">Pogledaj ponudu <ArrowRight className="h-3.5 w-3.5" /></span>
          </div>
          {featuredCategories[0]?.imageUrl ? <Image src={featuredCategories[0].imageUrl} alt="Profesionalni program" fill sizes="50vw" className="object-cover object-right opacity-45 transition group-hover:scale-105" /> : null}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/95 via-cyan-800/65 to-transparent" />
        </Link>
      </section>

      <section className="container mx-auto px-4 pt-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 sm:text-2xl">{home.brandsTitle}</h2>
          <Link href="/brendovi" className="text-xs font-bold text-cyan-700">Pogledaj sve brendove <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {brandsList.map((brand, index) => <div key={index} className="flex h-16 min-w-28 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-center text-xs font-black uppercase tracking-wide text-slate-700 shadow-sm">{brand}</div>)}
        </div>
      </section>

      {tipImages.length > 0 && (
        <section className="container mx-auto px-4 pt-8 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 sm:text-2xl">Korisni saveti, vodiči i inspiracija</h2>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">Kratki vodiči koji pomažu pri izboru proizvoda.</p>
            </div>
            <Link href="/saveti" className="text-xs font-bold text-cyan-700">Pogledaj sve savete <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {tipImages.map((image, index) => (
              <Link key={image.url} href={"/saveti/" + [
  "kako-izabrati-pravu-pumpu-za-vodu",
  "renoviranje-kupatila-od-cega-poceti",
  "sistemi-za-navodnjavanje-za-vase-dvoriste",
  "farbanje-zida-korak-po-korak",
][index]} className="group relative aspect-[1.45] overflow-hidden rounded-xl">
                <Image src={image.url} alt={image.altText || "Aqua Still savet"} fill sizes="25vw" className="object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent" />
                <div className="absolute bottom-0 p-3 text-white sm:p-4">
                  <span className="rounded bg-white/90 px-1.5 py-1 text-[8px] font-black uppercase text-slate-800">{["Vodič", "Korisni savet", "Inspiracija", "Uradi sam"][index]}</span>
                  <h3 className="mt-2 text-sm font-black leading-tight">{["Kako izabrati pravu pumpu za vodu?", "Renoviranje kupatila – od čega početi?", "Sistemi za navodnjavanje za vaše dvorište", "Farbanje zida korak po korak"][index]}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
