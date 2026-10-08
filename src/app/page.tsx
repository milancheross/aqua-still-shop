import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Search, ChevronRight, Tag, Package, Truck, Wrench, Plus } from "lucide-react";
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
    <main className="min-h-screen bg-[#f4f1eb] text-[#191817]">
      <section className="border-b border-[#d8d0c4] bg-[#f4f1eb]">
        <div className="container mx-auto px-4 pb-8 pt-7 sm:px-6 lg:px-8">
          <div className="mb-7 flex items-center justify-between border-b border-[#d8d0c4] pb-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#9b4d2f]">Aqua Still</p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[#817a70]">Zlatibor · alati · materijal · oprema</p>
            </div>
            <Link href="/katalog" className="hidden items-center gap-2 text-[11px] font-black uppercase tracking-[0.12em] text-[#191817] sm:flex">
              Katalog <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-7 lg:grid-cols-[1.05fr_.95fr] lg:gap-12">
            <div className="flex flex-col justify-between">
              <div>
                <p className="mb-3 text-[11px] font-black uppercase tracking-[0.2em] text-[#9b4d2f]">Prodavnica za majstore</p>
                <h1 className="max-w-2xl font-serif text-4xl font-black leading-[.95] tracking-[-0.04em] sm:text-5xl lg:text-6xl">Materijal koji<br /><em className="font-normal text-[#9b4d2f]">radi posao.</em></h1>
                <p className="mt-5 max-w-xl text-sm leading-6 text-[#625d55]">Od alata i vodovodnog materijala do opreme za kupatilo, baštu i radionicu. Pronađite tačan artikal po nazivu, šifri, barkodu ili brendu.</p>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#d8d0c4] pt-4 text-[10px] font-black uppercase tracking-[0.12em] text-[#817a70]">
                <span>01 Brza pretraga</span><span>02 Kategorije</span><span>03 Proizvodi</span><span>04 Brendovi</span>
              </div>
            </div>

            <div className="self-end">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#817a70]">Pretražite ponudu</span>
                <span className="text-[10px] text-[#9b4d2f]">01 / 04</span>
              </div>
              <form action="/katalog" method="GET" className="border-y-2 border-[#191817] py-2">
                <label htmlFor="home-search" className="sr-only">Pretražite proizvode</label>
                <div className="flex items-center gap-3">
                  <Search className="h-5 w-5 shrink-0 text-[#9b4d2f]" />
                  <input id="home-search" name="q" type="search" autoComplete="off" placeholder="Naziv, SKU, barkod ili brend..." className="h-14 min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#191817] outline-none sm:text-base" />
                  <button type="submit" className="h-10 bg-[#191817] px-4 text-[10px] font-black uppercase tracking-[0.1em] text-white transition hover:bg-[#9b4d2f] sm:px-6">Traži</button>
                </div>
              </form>
              <div className="mt-4 grid grid-cols-2 border-l border-[#d8d0c4]">
                {quickLinks.slice(0, 4).map(([label, href], index) => (
                  <Link key={label} href={href} className="flex items-center gap-2 border-b border-r border-[#d8d0c4] px-3 py-3 text-[11px] font-bold text-[#625d55] transition hover:bg-[#ebe6dd] hover:text-[#191817]">
                    <span className="text-[9px] text-[#9b4d2f]">0{index + 1}</span>{label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#d8d0c4] bg-[#ebe6dd]">
        <div className="container mx-auto grid grid-cols-2 divide-x divide-[#d8d0c4] sm:grid-cols-4">
          {featureRows.map(({ icon: Icon, title, text }) => (
            <div key={title} className="px-4 py-4 sm:px-5">
              <Icon className="mb-3 h-4 w-4 text-[#9b4d2f]" />
              <p className="text-xs font-black">{title}</p><p className="mt-0.5 text-[10px] text-[#817a70]">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pt-9 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between border-b border-[#d8d0c4] pb-3">
          <div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#9b4d2f]">01 / Istražite</p><h2 className="mt-1 font-serif text-2xl font-black tracking-tight sm:text-3xl">Kategorije</h2></div>
          <Link href="/katalog" className="text-[10px] font-black uppercase tracking-[0.12em] text-[#625d55] hover:text-[#9b4d2f]">Ceo katalog <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>
        </div>

        <div className="grid gap-px overflow-hidden border border-[#cfc6b8] bg-[#cfc6b8] sm:grid-cols-2 lg:grid-cols-4">
          {featuredCategories.map((category, index) => (
            <Link
              key={category.id}
              href={"/katalog/" + category.slug}
              className={`group relative min-h-[170px] overflow-hidden bg-[#d9d2c7] ${index === 0 ? "lg:col-span-2 lg:row-span-2 min-h-[344px]" : ""} ${index === 3 ? "lg:col-span-2" : ""}`}
            >
              {category.imageUrl ? (
                <Image src={category.imageUrl} alt={category.name} fill sizes={index === 0 ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 1024px) 50vw, 25vw"} className="object-cover transition duration-500 group-hover:scale-105" />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="mb-1 text-[9px] font-black uppercase tracking-[0.18em] text-[#e8b39f]">{category.itemCount} artikala</p>
                    <h3 className={`font-serif font-black text-white ${index === 0 ? "text-2xl" : "text-base"}`}>{category.name}</h3>
                    <p className="mt-1 line-clamp-1 max-w-xl text-[11px] text-white/65">{category.description || "Ponuda proizvoda"}</p>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/30 text-white transition group-hover:bg-[#9b4d2f] group-hover:border-[#9b4d2f]"><ChevronRight className="h-4 w-4" /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pt-10 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-end justify-between border-b border-[#d8d0c4] pb-3"><div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#9b4d2f]">02 / Brzi izbor</p><h2 className="mt-1 font-serif text-2xl font-black">Najtraženije grupe</h2></div></div>
        <div className="overflow-hidden border border-[#cfc6b8] bg-[#ebe6dd]">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map(([label, href], index) => (
              <Link key={label} href={href} className={`group flex items-center justify-between border-[#d0c7ba] px-5 py-5 transition hover:bg-[#e2dcd2] ${index > 0 ? "border-l" : ""} ${index >= 3 ? "border-t" : ""}`}>
                <span><span className="mb-1 block text-[9px] font-black uppercase tracking-[0.18em] text-[#9b4d2f]">0{index + 1}</span><span className="text-sm font-bold text-[#35312d] group-hover:text-black">{label}</span></span>
                <ChevronRight className="h-4 w-4 text-[#a69d90] transition group-hover:translate-x-1 group-hover:text-[#9b4d2f]" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pt-10 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-end justify-between border-b border-[#d8d0c4] pb-3">
          <div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#9b4d2f]">03 / Izdvojeno</p><h2 className="mt-1 font-serif text-2xl font-black tracking-tight sm:text-3xl">Proizvodi</h2></div>
          <Link href="/katalog" className="text-[10px] font-black uppercase tracking-[0.12em] text-[#625d55] hover:text-[#9b4d2f]">Pogledaj sve <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {data.popularProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="container mx-auto px-4 pt-10 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden border border-[#cfc6b8] lg:grid-cols-[1.3fr_1fr]">
          <Link href="/katalog/akcija" className="group relative min-h-48 overflow-hidden bg-[#191817] p-6 text-white">
            <div className="absolute right-[-5%] top-[-40%] h-64 w-64 rounded-full border-[28px] border-[#9b4d2f]/20" />
            <p className="relative text-[10px] font-black uppercase tracking-[0.2em] text-[#e8b39f]">Ponuda</p>
            <h2 className="relative mt-2 text-2xl font-black">Akcijski proizvodi</h2>
            <p className="relative mt-1 max-w-md text-xs leading-relaxed text-white/55">Odabrani artikli po posebnim cenama. Pregledajte ponudu pre nego što nestane sa lagera.</p>
            <span className="relative mt-5 inline-flex items-center gap-1 text-xs font-black text-[#e8b39f] group-hover:text-white">Pogledaj akcije <ArrowRight className="h-3.5 w-3.5" /></span>
          </Link>
          <div className="border-t border-[#3c3834] bg-[#ebe6dd] p-6 text-[#191817] lg:border-l lg:border-t-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e8b39f]">Za profesionalce</p>
            <h2 className="mt-2 text-xl font-black">Alat, materijal i oprema</h2>
            <p className="mt-2 text-xs leading-relaxed text-[#625d55]">Brz pristup kompletnom katalogu za radionicu, gradnju, vodovod i održavanje.</p>
            <Link href="/katalog" className="mt-5 inline-flex items-center gap-1 text-xs font-black text-[#e8b39f] hover:text-white">Otvori katalog <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
        </div>
      </section>

      {data.brands.length > 0 && (
        <section className="container mx-auto px-4 pt-10 sm:px-6 lg:px-8">
          <div className="border-y border-[#d8d0c4] bg-[#f4f1eb] py-6">
            <div className="mb-4 flex items-end justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#9b4d2f]">04 / Proizvođači</p><h2 className="mt-1 font-serif text-2xl font-black">Brendovi</h2></div><Link href="/brendovi" className="text-[10px] font-black uppercase tracking-[0.12em] text-[#625d55] hover:text-[#9b4d2f]">Svi brendovi <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link></div>
            <div className="flex flex-wrap gap-2">
              {data.brands.slice(0, 24).map((brand) => <Link key={brand} href={`/katalog?brand=${encodeURIComponent(brand)}`} className="border border-[#d8d0c4] bg-[#ebe6dd] px-3.5 py-2 text-xs font-bold text-[#625d55] transition hover:border-[#191817] hover:bg-[#191817] hover:text-white">{brand}</Link>)}
            </div>
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 pb-8 pt-10 sm:px-6 lg:px-8">
        <div className="border-t border-[#d8d0c4] px-1 py-5">
          <p className="max-w-4xl text-xs leading-relaxed text-[#817a70]">{home.description}</p>
        </div>
      </section>
    </main>
  );
}
