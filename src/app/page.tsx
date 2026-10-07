import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ChevronRight, Truck, ShieldCheck, Headphones, RefreshCw, Wrench, Sparkles } from "lucide-react";
import { getDbProducts, getDbBrands, getDbCategories } from "@/services/product-service";
import { db } from "@/lib/db";
import ProductCard from "@/components/catalog/ProductCard";
import { getHomeContent } from "@/actions/page-cms-actions";
import { DEFAULT_HOME } from "@/lib/home-content";

export async function generateMetadata(): Promise<Metadata> {
  const home = await getHomeContent();
  return {
    title: home?.seoTitle || undefined,
    description: home?.seoDescription || undefined,
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

export default async function HomePage() {
  const featuredProducts = (await getDbProducts({ sort: "popular" })).slice(0, 5);
  const brandsList = await getDbBrands();
  const categories = await getDbCategories();
  const home = (await getHomeContent()) ?? DEFAULT_HOME;

  const heroProduct = featuredProducts.find((product) => product.images?.some(Boolean));
  let managedHeroImage: string | undefined;
  try {
    if (process.env.DATABASE_URL) {
      const heroAsset = await db.mediaAsset.findFirst({
        where: { folder: "hero" },
        orderBy: { createdAt: "desc" },
        select: { url: true },
      });
      managedHeroImage = heroAsset?.url;
    }
  } catch (error) {
    console.warn("Could not load managed hero image:", error);
  }
  const heroImage = managedHeroImage || heroProduct?.images.find(Boolean);

  // Popular tiles are subcategories, not parent categories. Each uses its own admin-managed image.
  const popularCategoriesGrid = categories
    .flatMap((category) => category.subcategories.map((subcategory) => ({
      id: subcategory.id,
      name: subcategory.name,
      slug: subcategory.slug,
      categorySlug: category.slug,
      imageUrl: subcategory.imageUrl,
    })))
    .slice(0, 8);

  const trustItems = [
    { title: "Brza dostava", subtitle: "na teritoriji Srbije", icon: Truck },
    { title: "Sigurna kupovina", subtitle: "i zaštita podataka", icon: ShieldCheck },
    { title: "Stručna podrška", subtitle: "za izbor proizvoda", icon: Headphones },
    { title: "Povrat robe", subtitle: "Jednostavno i brzo", icon: RefreshCw },
    { title: "Sve za majstore", subtitle: "na jednom mestu", icon: Wrench },
  ];

  return (
    <div className="flex flex-col space-y-12 md:space-y-16 pb-20 bg-slate-50 overflow-x-hidden">
      {/* 1. HERO — wide editorial banner; the newest media asset in the "hero" folder is used automatically. */}
      <section className="relative isolate min-h-[420px] overflow-hidden bg-slate-950 sm:min-h-[480px] lg:min-h-[560px]">
        {managedHeroImage ? (
          <Image
            src={managedHeroImage}
            alt="Aqua Still — profesionalni alati i vodovodna oprema"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="absolute inset-0 z-0 object-cover object-center"
          />
        ) : null}
        <div className={`absolute inset-0 z-10 ${managedHeroImage ? "bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-slate-950/10" : "bg-slate-950"}`} />
        <div className="container relative z-20 mx-auto flex min-h-[420px] items-center px-4 py-12 sm:min-h-[480px] sm:px-6 sm:py-16 lg:min-h-[560px] lg:px-8">
          <div className="max-w-2xl space-y-5 sm:space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200 sm:text-xs">
              <Sparkles className="h-3.5 w-3.5" /> {home.eyebrow}
            </span>
            <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {titleWithAccent(home.title, home.titleAccent)}
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-200 sm:text-base lg:text-lg">
              {home.description}
            </p>
            <div className="flex flex-col gap-3 pt-1 sm:flex-row">
              <Link href={home.primaryHref} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-cyan-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:px-8 sm:text-base">
                {home.primaryLabel} <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href={home.secondaryHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:px-8 sm:text-base">
                {home.secondaryLabel}
              </Link>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2 text-xs font-medium text-slate-300 sm:text-sm">
              <span className="inline-flex items-center gap-2"><Truck className="h-4 w-4 text-cyan-300" /> Dostava širom Srbije</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-cyan-300" /> Sigurna kupovina</span>
            </div>
          </div>
        </div>
        {!managedHeroImage && heroImage ? (
          <div className="pointer-events-none absolute bottom-5 right-5 z-20 hidden h-36 w-44 overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-sm lg:block">
            <Image src={heroImage} alt={heroProduct?.name || "Proizvod iz ponude"} fill sizes="176px" unoptimized className="object-contain p-3" />
          </div>
        ) : null}
      </section>

      {/* 2. SVE KATEGORIJE — isti izvor kao Admin */}
      <section className="container relative z-30 mx-auto -mt-8 px-4 sm:px-6 lg:px-8 md:-mt-10">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Katalog</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Sve kategorije</h2>
            <p className="mt-2 text-sm text-slate-600">Kompletna ponuda kategorija i podkategorija. Prikaz je direktno povezan sa administracijom.</p>
          </div>
          <span className="w-fit rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-500 shadow-sm ring-1 ring-slate-200">{categories.length} kategorija</span>
        </div>

        {categories.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <article key={category.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-cyan-300 hover:shadow-md">
                <Link href={`/katalog/${category.slug}`} className="group block">
                  <div className="relative aspect-[16/7] overflow-hidden bg-gradient-to-br from-slate-100 to-cyan-50">
                    {category.imageUrl ? (
                      <Image src={category.imageUrl} alt={category.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" unoptimized className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-5xl font-black text-cyan-800/15">{category.name.slice(0, 1)}</div>
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black text-slate-700 shadow-sm">
                      {category.subcategories.length} podkategorija
                    </span>
                  </div>
                  <div className="p-4 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-base font-black text-slate-900 group-hover:text-cyan-700 sm:text-lg">{category.name}</h3>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">{category.description || "Pogledajte kompletnu ponudu proizvoda."}</p>
                      </div>
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-600 text-white"><ChevronRight className="h-4 w-4" /></span>
                    </div>
                  </div>
                </Link>

                {category.subcategories.length > 0 && (
                  <div className="border-t border-slate-100 px-4 pb-4 pt-3">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400">Podkategorije</p>
                    <div className="flex flex-wrap gap-1.5">
                      {category.subcategories.map((subcategory) => (
                        <Link
                          key={subcategory.id}
                          href={`/katalog?category=${encodeURIComponent(category.slug)}&subcategory=${encodeURIComponent(subcategory.slug)}`}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-800"
                        >
                          {subcategory.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Kategorije će biti prikazane kada budu dodate u administraciji.</div>
        )}
      </section>

      {/* 3. TRUST BAR (5 items) */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 py-6 px-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100 shadow-sm">
          {trustItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center space-x-4 pt-4 md:pt-0 md:px-4 first:pt-0">
                <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  <p className="text-[11px] text-slate-500">{item.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. "IZDVAJAMO IZ PONUDE" SECTION */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">{home.featuredTitle}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-cyan-50 px-3 py-2 text-xs font-bold text-cyan-800">Izdvojeni proizvodi</span>
            <Link href="/katalog/akcija" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-cyan-300 hover:text-cyan-700">Akcije</Link>
            <Link href="/katalog" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-cyan-300 hover:text-cyan-700">Ceo katalog <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-5">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. "NAŠI BRENDOVI" SECTION */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-slate-900">{home.brandsTitle}</h2>
          <Link href="/brendovi" className="text-xs font-bold text-cyan-600 hover:underline flex items-center gap-1">
            Pogledaj sve brendove <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-4 items-center justify-center text-center shadow-sm">
          {brandsList.map((brand, idx) => (
            <div key={idx} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 text-xs font-black text-slate-700 tracking-wider uppercase transition-colors">
              {brand}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
