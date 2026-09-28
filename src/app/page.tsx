import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, Truck, ShieldCheck, Headphones, RefreshCw, Wrench, Sparkles } from "lucide-react";
import { getDbProducts, getDbBrands, getDbCategories } from "@/services/product-service";
import ProductCard from "@/components/catalog/ProductCard";

export default async function HomePage() {
  const featuredProducts = (await getDbProducts({ sort: "popular" })).slice(0, 5);
  const brandsList = await getDbBrands();
  const categories = await getDbCategories();

  const mainCategoriesGrid = categories.slice(0, 4);

  const popularCategoriesGrid = [
    { name: "Električni alati", slug: "alati", image: "/placeholder-tool.svg" },
    { name: "Ručni alati", slug: "alati", image: "/placeholder-tool.svg" },
    { name: "Cevi i fiting", slug: "vodovod", image: "/placeholder-pipe.svg" },
    { name: "Slavine i baterije", slug: "kupatila", image: "/placeholder-faucet.svg" },
    { name: "WC šolje", slug: "kupatila", image: "/placeholder-toilet.svg" },
    { name: "Tuš kabine", slug: "kupatila", image: "/placeholder-faucet.svg" },
    { name: "Creva i prskalice", slug: "navodnjavanje", image: "/placeholder-sprinkler.svg" },
    { name: "Pumpe", slug: "vodovod", image: "/placeholder-valve.svg" },
  ];

  const trustItems = [
    { title: "Brza dostava", subtitle: "na teritoriji Srbije", icon: Truck },
    { title: "Sigurna kupovina", subtitle: "i zaštita podataka", icon: ShieldCheck },
    { title: "Stručna podrška", subtitle: "za izbor proizvoda", icon: Headphones },
    { title: "Povrat robe", subtitle: "Jednostavno i brzo", icon: RefreshCw },
    { title: "Sve za majstore", subtitle: "na jednom mestu", icon: Wrench },
  ];

  return (
    <div className="flex flex-col space-y-12 md:space-y-16 pb-20 bg-slate-50 overflow-x-hidden">
      {/* 1. HERO SECTION - Enhanced Tool Showcase Space & Light Theme */}
      <section className="relative overflow-hidden bg-gradient-to-r from-slate-100 via-cyan-50/60 to-white py-12 md:py-24 border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-cyan-100 text-cyan-800 text-xs font-black tracking-widest uppercase rounded-lg shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" /> Profesionalni alati & oprema
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 leading-[1.15]">
                Snaga za <span className="text-cyan-600">svaki projekat</span>
              </h1>
              <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-xl">
                Veliki izbor električnih i aku alata vodećih svetskih brendova. Pouzdanost, kvalitet i stručna podrška – sve na jednom mestu.
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <Link 
                  href="/katalog" 
                  className="inline-flex items-center gap-3 px-8 py-4 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-2xl shadow-xl shadow-pink-600/25 transition-all text-base"
                >
                  Pogledaj ponudu <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  href="/katalog/alati" 
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 font-bold rounded-2xl transition-all text-base shadow-sm"
                >
                  Katalog alata
                </Link>
              </div>
            </div>
            
            {/* High-Quality Tool Showcase Container (Prepared for future high-res photo drop-in) */}
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/3] sm:aspect-[16/11] bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden p-6 md:p-8 flex flex-col items-center justify-center group">
                <div className="absolute top-4 left-4 bg-cyan-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-md shadow-sm z-10">
                  Top Preporuka
                </div>
                {/* Tool Image Container */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image 
                    src="/placeholder-tool.svg" 
                    alt="Profesionalna udarna bušilica" 
                    fill 
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    priority
                  />
                </div>
                <div className="absolute bottom-4 text-center">
                  <span className="text-xs font-bold text-slate-500">Aku udarna bušilica 18V</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 4 MAIN CATEGORY CARDS */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-8 md:-mt-10 relative z-30">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mainCategoriesGrid.map((cat, idx) => (
            <Link 
              key={idx}
              href={`/katalog/${cat.slug}`}
              className="group bg-white rounded-2xl shadow-lg border border-slate-200/80 p-6 flex flex-col justify-between hover:border-cyan-500 hover:shadow-xl transition-all duration-300"
            >
              <div className="relative aspect-[16/10] mb-4 overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-cyan-50">
                {cat.imageUrl ? (
                  <Image src={cat.imageUrl} alt={cat.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-cyan-800">
                    <span className="text-5xl font-black opacity-20">{cat.name.slice(0, 1)}</span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-cyan-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">{cat.desc}</p>
              </div>
              <div className="flex justify-end">
                <span className="w-9 h-9 bg-cyan-600 group-hover:bg-cyan-700 text-white rounded-full flex items-center justify-center transition-colors">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
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
                <Image src={category.imageUrl} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="absolute inset-0 -z-20 object-cover transition-transform duration-700 group-hover:scale-105" />
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
