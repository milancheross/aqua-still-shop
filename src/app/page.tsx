import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Search, ChevronRight } from "lucide-react";
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

export default async function HomePage() {
  const data = await getHomepageData();
  const home = (await getHomeContent()) ?? DEFAULT_HOME;
  const featuredCategories = data.categories.filter((category) => category.featured).length
    ? data.categories.filter((category) => category.featured).slice(0, 8)
    : data.categories.slice(0, 8);

  return (
    <main className="bg-slate-50 pb-14">
      <section className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-700">Aqua Still Shop</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Šta vam treba?</h1>
              <p className="mt-1 max-w-2xl text-xs text-slate-500 sm:text-sm">Pretražite po nazivu, šifri, barkodu ili brendu.</p>
            </div>
            <Link href="/katalog" className="hidden items-center gap-1 text-xs font-bold text-cyan-700 sm:inline-flex">Ceo katalog <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          <form action="/katalog" method="GET" className="relative">
            <label htmlFor="home-search" className="sr-only">Pretražite proizvode</label>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input id="home-search" name="q" type="search" autoComplete="off" placeholder="Proizvod, SKU, barkod ili brend..." className="h-14 w-full rounded-xl border border-slate-300 bg-slate-50 pl-12 pr-28 text-sm font-medium text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100 sm:h-16 sm:text-base" />
            <button type="submit" className="absolute right-1.5 top-1.5 bottom-1.5 rounded-lg bg-slate-950 px-4 text-xs font-black text-white transition hover:bg-cyan-700 sm:px-6 sm:text-sm">Pretraži</button>
          </form>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {featuredCategories.map((category) => (
              <Link key={category.id} href={"/katalog/" + category.slug} className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-800">
                {category.name}<span className="text-[10px] font-medium text-slate-400">{category.itemCount}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pt-8 sm:px-6 lg:px-8">
        <div className="mb-3 flex items-center justify-between">
          <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-700">Brzi pristup</p><h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Najtraženije grupe</h2></div>
          <Link href="/katalog" className="text-xs font-bold text-cyan-700">Sve kategorije <ChevronRight className="inline h-3.5 w-3.5" /></Link>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {quickLinks.map(([label, href], index) => (
              <Link key={label} href={href} className={`group flex min-h-14 items-center justify-between gap-2 px-3.5 py-3 transition hover:bg-slate-50 ${index > 0 ? "border-l border-slate-200" : ""} ${index >= 2 ? "border-t border-slate-200 lg:border-t-0" : ""}`}>
                <span className="text-xs font-bold leading-snug text-slate-700 group-hover:text-slate-950">{label}</span><ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 group-hover:text-cyan-600" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pt-8 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-700">Popularno</p><h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">Najprodavaniji proizvodi</h2></div>
          <Link href="/katalog" className="text-xs font-bold text-cyan-700">Pogledaj sve <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {data.popularProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="container mx-auto px-4 pt-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="grid lg:grid-cols-[1.4fr_1fr]">
            <Link href="/katalog/akcija" className="group border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-600">Ponuda</p><h2 className="mt-1 text-xl font-black text-slate-950">Akcijski proizvodi</h2><p className="mt-1 text-xs text-slate-500">Odabrani artikli po posebnim cenama.</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-red-600">Pogledaj akcije <ArrowRight className="h-3.5 w-3.5" /></span>
            </Link>
            <div className="p-5 sm:p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Za profesionalce</p><h2 className="mt-1 text-xl font-black text-slate-950">Alat, materijal i oprema</h2><p className="mt-1 text-xs leading-relaxed text-slate-500">Brz pristup kompletnom katalogu za radionicu, gradnju, vodovod i održavanje.</p>
              <Link href="/katalog" className="mt-4 inline-flex items-center gap-1 text-xs font-black text-cyan-700">Otvori katalog <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pt-8 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-700">Katalog</p><h2 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">{home.exploreTitle || "Kategorije proizvoda"}</h2></div>
          <Link href="/katalog" className="text-xs font-bold text-cyan-700">Sve kategorije <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>
        </div>
        <div className="grid gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
          {featuredCategories.map((category) => (
            <Link key={category.id} href={"/katalog/" + category.slug} className="group relative min-h-36 bg-white p-4 transition hover:bg-slate-50">
              {category.imageUrl ? <Image src={category.imageUrl} alt={category.name} fill sizes="(max-width: 640px) 100vw, 25vw" className="object-cover opacity-0 transition-opacity group-hover:opacity-10" /> : null}
              <div className="relative">
                <div className="flex items-start justify-between gap-3"><h3 className="text-sm font-black text-slate-900">{category.name}</h3><ChevronRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-cyan-600" /></div>
                <p className="mt-1 text-xs text-slate-500">{category.description || "Ponuda proizvoda"}</p>
                <p className="mt-5 text-[11px] font-black text-slate-400">{category.itemCount} artikala</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {data.brands.length > 0 && (
        <section className="container mx-auto px-4 pt-8 sm:px-6 lg:px-8">
          <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-black text-slate-950">Brendovi</h2><Link href="/brendovi" className="text-xs font-bold text-cyan-700">Svi brendovi <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link></div>
          <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {data.brands.slice(0, 18).map((brand) => <Link key={brand} href={`/katalog?brand=${encodeURIComponent(brand)}`} className="flex h-11 shrink-0 items-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:border-cyan-300 hover:text-cyan-800">{brand}</Link>)}
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 pt-8 sm:px-6 lg:px-8">
        <div className="border-t border-slate-200 pt-6"><p className="max-w-3xl text-xs leading-relaxed text-slate-500">{home.description}</p></div>
      </section>
    </main>
  );
}