import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Search, ChevronRight, Tag, Package, Truck, Wrench } from "lucide-react";
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

const featureRows = [
  { icon: Package, title: "Širok katalog", text: "Alat i materijal" },
  { icon: Tag, title: "Akcijske cene", text: "Odabrani artikli" },
  { icon: Truck, title: "Za radionice", text: "Profesionalna oprema" },
  { icon: Wrench, title: "Brz izbor", text: "Po kategoriji i brendu" },
];

export default async function HomePage() {
  const data = await getHomepageData();
  const home = (await getHomeContent()) ?? DEFAULT_HOME;
  const featuredCategories = data.categories.filter((category) => category.featured).length
    ? data.categories.filter((category) => category.featured).slice(0, 8)
    : data.categories.slice(0, 8);

  return (
    <main
      className="min-h-screen bg-[#e9ece7] text-slate-950"
      style={{
        backgroundImage:
          "linear-gradient(rgba(15,23,42,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,.035) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    >
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "radial-gradient(circle at 80% 10%, rgba(6,182,212,.24), transparent 34%), radial-gradient(circle at 15% 90%, rgba(255,255,255,.07), transparent 30%)" }} />
        <div className="relative container mx-auto px-4 pb-7 pt-6 sm:px-6 lg:px-8 lg:pb-9 lg:pt-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-300">Aqua Still / Zlatibor</p>
              <p className="mt-1 text-xs font-medium text-slate-400">Alati · vodovod · kupatila · bašta · oprema</p>
            </div>
            <Link href="/katalog" className="hidden items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-slate-200 transition hover:border-cyan-400 hover:text-white sm:inline-flex">
              Otvori katalog <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid items-end gap-6 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Brza kupovina</p>
              <h1 className="max-w-xl text-3xl font-black leading-[1.02] tracking-tight sm:text-4xl lg:text-5xl">Pronađite materijal bez kopanja po katalogu.</h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-400">Pretraga radi po nazivu, šifri, barkodu i brendu. Kategorije i brze grupe su odmah ispod.</p>
            </div>

            <div>
              <form action="/katalog" method="GET" className="rounded-2xl bg-white p-2 shadow-2xl shadow-black/25">
                <label htmlFor="home-search" className="sr-only">Pretražite proizvode</label>
                <div className="flex items-center gap-2">
                  <Search className="ml-3 h-5 w-5 shrink-0 text-slate-400" />
                  <input id="home-search" name="q" type="search" autoComplete="off" placeholder="Proizvod, SKU, barkod ili brend..." className="h-12 min-w-0 flex-1 bg-transparent px-1 text-sm font-semibold text-slate-900 outline-none sm:text-base" />
                  <button type="submit" className="h-12 rounded-xl bg-cyan-600 px-5 text-xs font-black text-white transition hover:bg-cyan-500 sm:px-7 sm:text-sm">Pretraži</button>
                </div>
              </form>
              <div className="mt-3 flex flex-wrap gap-2">
                {quickLinks.slice(0, 4).map(([label, href]) => (
                  <Link key={label} href={href} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-slate-300 transition hover:bg-white/10 hover:text-white">{label}</Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300/80 bg-white/85 backdrop-blur">
        <div className="container mx-auto grid grid-cols-2 divide-x divide-slate-200 sm:grid-cols-4 lg:grid-cols-4">
          {featureRows.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700"><Icon className="h-4 w-4" /></div>
              <div><p className="text-xs font-black text-slate-900">{title}</p><p className="text-[10px] text-slate-500">{text}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pt-7 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-end justify-between">
          <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-700">Istražite</p><h2 className="mt-1 text-2xl font-black tracking-tight">Kategorije</h2></div>
          <Link href="/katalog" className="text-xs font-black text-slate-700 transition hover:text-cyan-700">Ceo katalog <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>
        </div>

        <div className="grid auto-rows-[155px] gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {featuredCategories.map((category, index) => (
            <Link
              key={category.id}
              href={"/katalog/" + category.slug}
              className={`group relative overflow-hidden rounded-xl bg-slate-900 ${index === 0 ? "lg:col-span-2 lg:row-span-2" : ""} ${index === 3 ? "lg:col-span-2" : ""}`}
            >
              {category.imageUrl ? (
                <Image src={category.imageUrl} alt={category.name} fill sizes={index === 0 ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 1024px) 50vw, 25vw"} className="object-cover transition duration-500 group-hover:scale-105" />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="mb-1 text-[9px] font-black uppercase tracking-[0.18em] text-cyan-300">{category.itemCount} artikala</p>
                    <h3 className={`font-black text-white ${index === 0 ? "text-2xl" : "text-base"}`}>{category.name}</h3>
                    <p className="mt-1 line-clamp-1 max-w-xl text-[11px] text-white/65">{category.description || "Ponuda proizvoda"}</p>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition group-hover:bg-cyan-500"><ChevronRight className="h-4 w-4" /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pt-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-xl bg-slate-950 text-white shadow-xl shadow-slate-900/10">
          <div className="border-b border-white/10 px-5 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">Brzi pristup</p><h2 className="mt-1 text-lg font-black">Najtraženije grupe</h2></div>
              <Link href="/katalog" className="text-xs font-bold text-slate-400 hover:text-white">Sve kategorije <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map(([label, href], index) => (
              <Link key={label} href={href} className={`group flex items-center justify-between border-white/10 px-5 py-4 transition hover:bg-white/5 ${index > 0 ? "border-l" : ""} ${index >= 3 ? "border-t" : ""}`}>
                <span><span className="mb-1 block text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">0{index + 1}</span><span className="text-sm font-bold text-slate-200 group-hover:text-white">{label}</span></span>
                <ChevronRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-1 group-hover:text-cyan-300" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pt-8 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-end justify-between">
          <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-700">Izdvojeno</p><h2 className="mt-1 text-2xl font-black tracking-tight">Proizvodi</h2></div>
          <Link href="/katalog" className="text-xs font-black text-slate-700 hover:text-cyan-700">Pogledaj sve <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {data.popularProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="container mx-auto px-4 pt-8 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-lg lg:grid-cols-[1.3fr_1fr]">
          <Link href="/katalog/akcija" className="group relative min-h-48 overflow-hidden bg-gradient-to-br from-red-950 via-slate-900 to-slate-950 p-6 text-white">
            <div className="absolute right-[-5%] top-[-40%] h-64 w-64 rounded-full border-[28px] border-red-500/10" />
            <p className="relative text-[10px] font-black uppercase tracking-[0.2em] text-red-300">Ponuda</p>
            <h2 className="relative mt-2 text-2xl font-black">Akcijski proizvodi</h2>
            <p className="relative mt-1 max-w-md text-xs leading-relaxed text-white/55">Odabrani artikli po posebnim cenama. Pregledajte ponudu pre nego što nestane sa lagera.</p>
            <span className="relative mt-5 inline-flex items-center gap-1 text-xs font-black text-red-300 group-hover:text-white">Pogledaj akcije <ArrowRight className="h-3.5 w-3.5" /></span>
          </Link>
          <div className="border-t border-white/10 bg-white/[.03] p-6 text-white lg:border-l lg:border-t-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">Za profesionalce</p>
            <h2 className="mt-2 text-xl font-black">Alat, materijal i oprema</h2>
            <p className="mt-2 text-xs leading-relaxed text-white/55">Brz pristup kompletnom katalogu za radionicu, gradnju, vodovod i održavanje.</p>
            <Link href="/katalog" className="mt-5 inline-flex items-center gap-1 text-xs font-black text-cyan-300 hover:text-white">Otvori katalog <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
        </div>
      </section>

      {data.brands.length > 0 && (
        <section className="container mx-auto px-4 pt-8 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-slate-300 bg-white/90 p-5 shadow-sm">
            <div className="mb-4 flex items-end justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Proizvođači</p><h2 className="mt-1 text-xl font-black">Brendovi</h2></div><Link href="/brendovi" className="text-xs font-black text-slate-700 hover:text-cyan-700">Svi brendovi <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link></div>
            <div className="flex flex-wrap gap-2">
              {data.brands.slice(0, 24).map((brand) => <Link key={brand} href={`/katalog?brand=${encodeURIComponent(brand)}`} className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white">{brand}</Link>)}
            </div>
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 pb-8 pt-8 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-300/80 bg-white/70 px-5 py-5">
          <p className="max-w-4xl text-xs leading-relaxed text-slate-500">{home.description}</p>
        </div>
      </section>
    </main>
  );
}
