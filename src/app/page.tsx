import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, Truck, ShieldCheck, Headphones, RefreshCw, Wrench, Sparkles } from "lucide-react";
import { getDbProducts, getDbBrands, getDbCategories } from "@/services/product-service";
import { db } from "@/lib/db";
import ProductCard from "@/components/catalog/ProductCard";

export default async function HomePage() {
  const featuredProducts = (await getDbProducts({ sort: "popular" })).slice(0, 5);
  const brandsList = await getDbBrands();
  const categories = await getDbCategories();

  const mainCategoriesGrid = categories.slice(0, 4);
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

  const popularCategoryItems = [
    { name: "Električni alati", slug: "alati", image: "/placeholder-tool.svg" },
    { name: "Ručni alati", slug: "alati", image: "/placeholder-tool.svg" },
    { name: "Cevi i fiting", slug: "vodovod", image: "/placeholder-pipe.svg" },
    { name: "Slavine i baterije", slug: "kupatila", image: "/placeholder-faucet.svg" },
    { name: "WC šolje", slug: "kupatila", image: "/placeholder-toilet.svg" },
    { name: "Tuš kabine", slug: "kupatila", image: "/placeholder-faucet.svg" },
    { name: "Creva i prskalice", slug: "navodnjavanje", image: "/placeholder-sprinkler.svg" },
    { name: "Pumpe", slug: "vodovod", image: "/placeholder-valve.svg" },
  ];
  const popularCategoriesGrid = popularCategoryItems.map((item) => ({
    ...item,
    image: categories.find((category) => category.slug === item.slug)?.imageUrl || item.image,
  }));

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
            className="absolute inset-0 -z-20 object-cover object-center"
          />
        ) : null}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/20" />
        <div className="container mx-auto flex min-h-[420px] items-center px-4 py-12 sm:min-h-[480px] sm:px-6 sm:py-16 lg:min-h-[560px] lg:px-8">
          <div className="max-w-2xl space-y-5 sm:space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200 sm:text-xs">
              <Sparkles className="h-3.5 w-3.5" /> Profesionalni alati & oprema
            </span>
            <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Snaga za <span className="text-cyan-400">svaki projekat</span>
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-200 sm:text-base lg:text-lg">
              Veliki izbor električnih i aku alata, vodovodnog materijala i opreme za dom i baštu. Pouzdanost, kvalitet i stručna podrška — sve na jednom mestu.
            </p>
            <div className="flex flex-col gap-3 pt-1 sm:flex-row">
              <Link href="/katalog" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-cyan-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:px-8 sm:text-base">
                Pogledaj ponudu <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/katalog/alati" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:px-8 sm:text-base">
                Katalog alata
              </Link>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2 text-xs font-medium text-slate-300 sm:text-sm">
              <span className="inline-flex items-center gap-2"><Truck className="h-4 w-4 text-cyan-300" /> Dostava širom Srbije</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-cyan-300" /> Sigurna kupovina</span>
            </div>
          </div>
        </div>
        {!managedHeroImage && heroImage ? (
          <div className="pointer-events-none absolute bottom-5 right-5 hidden h-36 w-44 overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-sm lg:block">
            <Image src={heroImage} alt={heroProduct?.name || "Proizvod iz ponude"} fill sizes="176px" unoptimized className="object-contain p-3" />
          </div>
        ) : null}
      </section>

      {/* 2. 4 MAIN CATEGORY CARDS */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-8 md:-mt-10 relative z-30">
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
          {mainCategoriesGrid.map((cat, idx) => (
            <Link 
              key={idx}
              href={`/katalog/${cat.slug}`}
              className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm transition-all duration-300 hover:border-cyan-500 hover:shadow-xl sm:rounded-2xl sm:p-6"
            >
              <div className="relative aspect-[16/10] mb-4 overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-cyan-50">
                {cat.imageUrl ? (
                  <Image src={cat.imageUrl} alt={cat.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" unoptimized className="object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-cyan-800">
                    <span className="text-5xl font-black opacity-20">{cat.name.slice(0, 1)}</span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 transition-colors group-hover:text-cyan-600 sm:text-lg">
                  {cat.name}
                </h3>
                <p className="mb-3 mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-500 sm:mb-4 sm:text-xs">{cat.description}</p>
              </div>
              <div className="flex justify-end">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-600 text-white transition-colors group-hover:bg-cyan-700 sm:h-9 sm:w-9">
                  <ChevronRight className="w-5 h-5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
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
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">Izdvajamo iz ponude</h2>
          </div>
          <div className="flex items-center space-x-2 bg-white border border-slate-200 p-1 rounded-xl text-sm font-bold shadow-sm">
            <button className="px-4 py-2 bg-cyan-600 text-white shadow-sm rounded-lg">Najprodavanije</button>
            <button className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors">Akcije</button>
            <button className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors">Novo u ponudi</button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-5">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. Premium category feature cards — imagery managed in admin */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">Istražite ponudu</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Oprema za svaki projekat</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">Izaberite kategoriju i pronađite opremu za dom, radionicu i baštu.</p>
          </div>
          <Link href="/katalog" className="inline-flex w-fit items-center gap-2 text-sm font-bold text-cyan-700 hover:text-cyan-900">
            Ceo katalog <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {categories.filter((category) => ["kupatila", "navodnjavanje"].includes(category.slug)).map((category) => (
            <Link key={category.id} href={`/katalog/${category.slug}`} className="group relative isolate flex min-h-[260px] flex-col justify-end overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:min-h-[320px] sm:p-8 md:min-h-[360px]">
              {category.imageUrl ? (
                <Image src={category.imageUrl} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" unoptimized className="absolute inset-0 -z-20 object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="absolute inset-0 -z-20 bg-gradient-to-br from-slate-800 via-cyan-950 to-slate-950" />
              )}
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-slate-950/5" />
              <span className="mb-3 w-fit rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">Aqua Still • Kategorija</span>
              <h3 className="max-w-lg text-2xl font-black leading-tight sm:text-3xl">{category.name}</h3>
              {category.description && <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/85">{category.description}</p>}
              <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white transition-colors group-hover:bg-cyan-500">Pogledaj ponudu <ArrowRight className="h-4 w-4" /></span>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. "NAŠI BRENDOVI" SECTION */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-slate-900">Naši brendovi</h2>
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

      {/* 7. "NAJPULARNIJE KATEGORIJE" SECTION */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-slate-900">Najpopularnije kategorije</h2>
          <Link href="/katalog" className="text-xs font-bold text-cyan-600 hover:underline flex items-center gap-1">
            Pogledaj sve kategorije <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {popularCategoriesGrid.map((cat, idx) => (
            <Link key={idx} href={`/katalog/${cat.slug}`} className="group bg-white rounded-2xl border border-slate-200 p-4 text-center hover:border-cyan-500 hover:shadow-lg transition-all shadow-sm">
              <div className="relative aspect-square mb-3 bg-slate-50 rounded-xl overflow-hidden p-2">
                <Image src={cat.image} alt={cat.name} fill className="object-contain p-2 group-hover:scale-105 transition-transform" />
              </div>
              <h3 className="text-xs font-bold text-slate-800 group-hover:text-cyan-600 transition-colors line-clamp-1">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
