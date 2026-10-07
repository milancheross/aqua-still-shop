import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Filter, Search, ArrowUpDown, X, Check, ChevronDown } from "lucide-react";
import { getDbProducts, getDbCategories, getDbBrands } from "@/services/product-service";
import { getCategoryFilterDefinitions, getFilterValues } from "@/lib/catalog-filters";
import ProductCard from "@/components/catalog/ProductCard";
import CatalogSortSelect from "@/components/catalog/CatalogSortSelect";
import CatalogFilterPanel from "@/components/catalog/CatalogFilterPanel";

interface CatalogPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export async function generateMetadata({
  searchParams,
}: CatalogPageProps): Promise<Metadata> {
  const params = await searchParams;
  const selectedCategory = firstParam(params.category);
  const selectedSubcategory = firstParam(params.subcategory);
  const categories = await getDbCategories();
  const category = categories.find((item) => item.slug === selectedCategory);
  const subcategory = category?.subcategories.find((item) => item.slug === selectedSubcategory);

  if (subcategory) {
    return {
      title: subcategory.seoTitle || `${subcategory.name} | Aqua Still Zlatibor`,
      description: subcategory.seoDescription || subcategory.description || category?.description || `Pogledajte ponudu proizvoda iz kategorije ${subcategory.name} u Aqua Still Zlatibor.`,
    };
  }

  if (category) {
    return {
      title: category.seoTitle || `${category.name} | Aqua Still Zlatibor`,
      description: category.seoDescription || category.description || `Pogledajte ponudu ${category.name} u Aqua Still Zlatibor.`,
    };
  }

  return {
    title: "Katalog proizvoda | Aqua Still Zlatibor",
    description: "Alati, vodovodni materijal, kupatilska oprema, elektro-oprema i ostali proizvodi Aqua Still Zlatibor.",
  };
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;

  const searchQuery = firstParam(params.q) ?? "";
  const selectedBrand = firstParam(params.brand);
  const selectedCategory = firstParam(params.category);
  const selectedSubcategory = firstParam(params.subcategory);
  const sortOption = (firstParam(params.sort) ?? "newest") as "popular" | "price-asc" | "price-desc" | "name" | "newest";
  const inStockOnly = params.inStock === "true";
  const minPrice = Number.isFinite(Number(params.minPrice)) && firstParam(params.minPrice) ? Number(params.minPrice) : undefined;
  const maxPrice = Number.isFinite(Number(params.maxPrice)) && firstParam(params.maxPrice) ? Number(params.maxPrice) : undefined;

  const selectedAttributes: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (key.startsWith("attr_")) {
      const selected = firstParam(value);
      if (selected) selectedAttributes[key.slice(5)] = selected;
    }
  }

  const [categories, brands, filterBaseProducts, products] = await Promise.all([
    getDbCategories(),
    getDbBrands(),
    getDbProducts({
      search: searchQuery,
      brand: selectedBrand,
      categorySlug: selectedCategory,
      subcategorySlug: selectedSubcategory,
      inStockOnly,
      sort: "newest",
    }),
    getDbProducts({
      search: searchQuery,
      brand: selectedBrand,
      categorySlug: selectedCategory,
      subcategorySlug: selectedSubcategory,
      inStockOnly,
      minPrice,
      maxPrice,
      attributes: selectedAttributes,
      sort: sortOption,
    }),
  ]);

  const activeCategory = categories.find((category) => category.slug === selectedCategory);
  const activeSubcategory = activeCategory?.subcategories.find((subcategory) => subcategory.slug === selectedSubcategory);
  const filterDefinitions = getCategoryFilterDefinitions(selectedCategory, selectedSubcategory);

  const buildUrl = (changes: Record<string, string | null | undefined>) => {
    const query = new URLSearchParams();
    const current: Record<string, string> = {
      ...(searchQuery ? { q: searchQuery } : {}),
      ...(selectedBrand ? { brand: selectedBrand } : {}),
      ...(selectedCategory ? { category: selectedCategory } : {}),
      ...(selectedSubcategory ? { subcategory: selectedSubcategory } : {}),
      ...(inStockOnly ? { inStock: "true" } : {}),
      ...(minPrice !== undefined ? { minPrice: String(minPrice) } : {}),
      ...(maxPrice !== undefined ? { maxPrice: String(maxPrice) } : {}),
      ...(sortOption ? { sort: sortOption } : {}),
      ...Object.fromEntries(Object.entries(selectedAttributes).map(([key, value]) => [`attr_${key}`, value])),
    };

    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === undefined || value === "") delete current[key];
      else current[key] = value;
    }

    Object.entries(current).forEach(([key, value]) => query.set(key, value));
    const qs = query.toString();
    return qs ? `/katalog?${qs}` : "/katalog";
  };

  const resetUrl = "/katalog";

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 md:py-12">
      <div className="mb-8 space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link href="/" className="hover:text-cyan-600">Početna</Link>
          <span>/</span>
          <span className="text-slate-900">Katalog</span>
          {activeCategory && <><span>/</span><span className="text-slate-900">{activeCategory.name}</span></>}
          {activeSubcategory && <><span>/</span><span className="font-bold text-slate-900">{activeSubcategory.name}</span></>}
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          {activeSubcategory?.name ?? activeCategory?.name ?? (searchQuery ? `Rezultati pretrage za: "${searchQuery}"` : "Svi proizvodi")}
        </h1>
        <p className="text-sm text-slate-500">
          Prikazano <strong className="text-slate-900">{products.length}</strong> artikala.
        </p>
      </div>

      {activeCategory?.imageUrl && (
        <div className="relative mb-8 min-h-36 overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 sm:min-h-48">
          <Image src={activeCategory.imageUrl} alt="" fill sizes="100vw" className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/45 to-transparent" />
          <div className="relative z-10 flex min-h-36 max-w-2xl flex-col justify-center p-5 text-white sm:min-h-48 sm:p-8">
            <h2 className="text-xl font-black sm:text-2xl">{activeCategory.name}</h2>
            {activeCategory.description && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/85">{activeCategory.description}</p>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <CatalogFilterPanel activeCount={[
          searchQuery,
          selectedBrand,
          selectedCategory,
          selectedSubcategory,
          inStockOnly ? "inStock" : "",
          minPrice !== undefined ? "minPrice" : "",
          maxPrice !== undefined ? "maxPrice" : "",
          ...Object.keys(selectedAttributes),
        ].filter(Boolean).length}>
        <aside>
          <div className="sticky top-24 space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="flex items-center gap-2 font-black text-slate-900">
                <Filter className="h-4 w-4 text-cyan-600" /> Filteri
              </h3>
              {(searchQuery || selectedBrand || selectedCategory || selectedSubcategory || inStockOnly || minPrice !== undefined || maxPrice !== undefined || Object.keys(selectedAttributes).length > 0) && (
                <Link href={resetUrl} className="flex items-center gap-1 text-xs font-bold text-red-600 hover:underline">
                  <X className="h-3.5 w-3.5" /> Poništi
                </Link>
              )}
            </div>

            <form method="GET" action="/katalog" className="space-y-5">
              {selectedCategory && <input type="hidden" name="category" value={selectedCategory} />}
              {selectedSubcategory && <input type="hidden" name="subcategory" value={selectedSubcategory} />}
              {selectedBrand && <input type="hidden" name="brand" value={selectedBrand} />}
              {sortOption && <input type="hidden" name="sort" value={sortOption} />}

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-700">Pretraga</label>
                <div className="relative">
                  <input
                    type="search"
                    name="q"
                    defaultValue={searchQuery}
                    placeholder="Naziv, SKU ili EAN..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs outline-none transition focus:border-cyan-500 focus:bg-white"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                </div>
                <p className="text-[10px] text-slate-400">Pretraga radi po nazivu, brendu, šifri i barkodu.</p>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-700">Kategorija</label>
                <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
                  <Link href={buildUrl({ category: null, subcategory: null })} className={`block rounded-lg px-3 py-2 text-xs font-bold ${!selectedCategory ? "bg-cyan-50 text-cyan-700" : "text-slate-600 hover:bg-slate-50"}`}>
                    Sve kategorije
                  </Link>
                  {categories.map((cat) => (
                    <div key={cat.id}>
                      <Link href={buildUrl({ category: cat.slug, subcategory: null })} className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs ${selectedCategory === cat.slug ? "bg-cyan-50 font-bold text-cyan-700" : "font-medium text-slate-700 hover:bg-slate-50"}`}>
                        <span>{cat.name}</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">{cat.itemCount}</span>
                      </Link>
                      {selectedCategory === cat.slug && cat.subcategories.length > 0 && (
                        <div className="ml-3 mt-1 space-y-0.5 border-l border-slate-200 pl-2">
                          {cat.subcategories.map((sub) => (
                            <Link key={sub.id} href={buildUrl({ category: cat.slug, subcategory: sub.slug })} className={`flex items-center justify-between rounded-md px-2 py-1.5 text-[11px] ${selectedSubcategory === sub.slug ? "bg-cyan-100 font-bold text-cyan-800" : "text-slate-600 hover:bg-slate-50"}`}>
                              <span>{sub.name}</span>
                              <span className="text-[10px] text-slate-400">{sub.itemCount}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-4">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-700">Brendovi</label>
                <div className="max-h-44 space-y-1 overflow-y-auto pr-1">
                  {brands.map((brand) => (
                    <Link key={brand} href={buildUrl({ brand: selectedBrand === brand ? null : brand })} className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-xs ${selectedBrand === brand ? "bg-cyan-600 font-bold text-white" : "text-slate-700 hover:bg-slate-50"}`}>
                      <span>{brand}</span>
                      {selectedBrand === brand && <Check className="h-3.5 w-3.5" />}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-4">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-700">Cena (RSD)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" name="minPrice" min="0" step="1" defaultValue={minPrice ?? ""} placeholder="Od" className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs outline-none focus:border-cyan-500" />
                  <input type="number" name="maxPrice" min="0" step="1" defaultValue={maxPrice ?? ""} placeholder="Do" className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs outline-none focus:border-cyan-500" />
                </div>
              </div>

              {filterDefinitions.map((definition) => {
                const values = getFilterValues(filterBaseProducts, definition.key);
                if (values.length === 0) return null;
                const selected = selectedAttributes[definition.key];
                return (
                  <div key={definition.key} className="space-y-2 border-t border-slate-100 pt-4">
                    <label className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-700">
                      <span>{definition.label}</span>
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                    </label>
                    <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
                      {values.map((value) => {
                        const isSelected = selected === value;
                        return (
                          <Link
                            key={value}
                            href={buildUrl({ [`attr_${definition.key}`]: isSelected ? null : value })}
                            className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-xs ${isSelected ? "bg-cyan-50 font-bold text-cyan-700" : "text-slate-700 hover:bg-slate-50"}`}
                          >
                            <span>{value}{definition.unit ? ` ${definition.unit}` : ""}</span>
                            {isSelected && <Check className="h-3.5 w-3.5" />}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <label className="flex cursor-pointer items-center gap-2 border-t border-slate-100 pt-4 text-xs font-bold text-slate-800">
                <input type="checkbox" name="inStock" value="true" defaultChecked={inStockOnly} className="h-4 w-4 rounded text-cyan-600 focus:ring-cyan-500" />
                Samo artikli na stanju
              </label>

              <button type="submit" className="w-full rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-cyan-700">
                Primeni filtere
              </button>
            </form>
          </div>
        </aside>
        </CatalogFilterPanel>

        <main className="space-y-6 lg:col-span-3">
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
            <div className="text-xs font-medium text-slate-500">
              Prikaz <strong className="text-slate-900">{products.length}</strong> proizvoda
            </div>
            <div className="flex w-full items-center space-x-2 sm:w-auto">
              <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-slate-500">
                <ArrowUpDown className="h-3.5 w-3.5" /> Sortiraj po:
              </span>
              <CatalogSortSelect defaultValue={sortOption} />
            </div>
          </div>

          {products.length === 0 ? (
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Search className="h-8 w-8" /></div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Nema pronađenih proizvoda</h3>
                <p className="mt-1 text-xs text-slate-500">Pokušajte sa drugim kriterijumima ili uklonite neki filter.</p>
              </div>
              <Link href={resetUrl} className="inline-block rounded-xl bg-cyan-600 px-6 py-3 text-xs font-bold text-white shadow-md transition-colors hover:bg-cyan-700">
                Prikaži sve proizvode
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
              {products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
