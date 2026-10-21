import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Search, ArrowUpDown } from "lucide-react";
import { getDbCatalogAttributes, getDbCatalogPage, getDbCategories, getDbBrands } from "@/services/product-service";
import { getCategoryFilterDefinitions } from "@/lib/catalog-filters";
import { buildCatalogQuery, catalogCanonicalPath, catalogTotalPages, clampCatalogPage, parseCatalogPage, parseCatalogTake } from "@/lib/catalog-pagination";
import { redirect } from "next/navigation";
import ProductCard from "@/components/catalog/ProductCard";
import CatalogSortSelect from "@/components/catalog/CatalogSortSelect";
import CatalogFilterPanel from "@/components/catalog/CatalogFilterPanel";
import CatalogFiltersSidebar from "@/components/catalog/CatalogFiltersSidebar";
import CatalogActiveFilters from "@/components/catalog/CatalogActiveFilters";
import CatalogPagination from "@/components/catalog/CatalogPagination";

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

  const page = parseCatalogPage(firstParam(params.page));
  const current: Record<string, string> = {
    ...(selectedCategory ? { category: selectedCategory } : {}),
    ...(selectedSubcategory ? { subcategory: selectedSubcategory } : {}),
    ...(firstParam(params.q) ? { q: firstParam(params.q)! } : {}),
    ...(firstParam(params.brand) ? { brand: firstParam(params.brand)! } : {}),
  };
  const canonical = catalogCanonicalPath({ current, page });
  const titleBase = subcategory?.seoTitle || (subcategory ? `${subcategory.name} | Aqua Still Zlatibor` : category?.seoTitle || (category ? `${category.name} | Aqua Still Zlatibor` : "Katalog proizvoda | Aqua Still Zlatibor"));
  const description = subcategory?.seoDescription || subcategory?.description || category?.seoDescription || category?.description || "Alati, vodovodni materijal, kupatilska oprema, elektro-oprema i ostali proizvodi Aqua Still Zlatibor.";
  return {
    title: page > 1 ? `${titleBase} — strana ${page}` : titleBase,
    description,
    alternates: { canonical },
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

  const page = parseCatalogPage(firstParam(params.page));
  const take = parseCatalogTake(firstParam(params.take));

  const [categories, brands, filterAttributes, catalog] = await Promise.all([
    getDbCategories(),
    getDbBrands(),
    getDbCatalogAttributes({
      search: searchQuery,
      brand: selectedBrand,
      categorySlug: selectedCategory,
      subcategorySlug: selectedSubcategory,
      inStockOnly,
    }),
    getDbCatalogPage({
      search: searchQuery,
      brand: selectedBrand,
      categorySlug: selectedCategory,
      subcategorySlug: selectedSubcategory,
      inStockOnly,
      minPrice,
      maxPrice,
      attributes: selectedAttributes,
      sort: sortOption,
      page,
      take,
    }),
  ]);

  const totalPages = catalogTotalPages(catalog.total, take);
  const safePage = clampCatalogPage(page, catalog.total, take);

  const currentParams: Record<string, string> = {
    ...(searchQuery ? { q: searchQuery } : {}),
    ...(selectedBrand ? { brand: selectedBrand } : {}),
    ...(selectedCategory ? { category: selectedCategory } : {}),
    ...(selectedSubcategory ? { subcategory: selectedSubcategory } : {}),
    ...(inStockOnly ? { inStock: "true" } : {}),
    ...(minPrice !== undefined ? { minPrice: String(minPrice) } : {}),
    ...(maxPrice !== undefined ? { maxPrice: String(maxPrice) } : {}),
    ...(sortOption ? { sort: sortOption } : {}),
    ...(take !== 24 ? { take: String(take) } : {}),
    ...Object.fromEntries(Object.entries(selectedAttributes).map(([key, value]) => [`attr_${key}`, value])),
  };

  if (catalog.total > 0 && page !== safePage) {
    redirect(buildCatalogQuery({ current: currentParams, changes: { page: String(safePage) } }));
  }

  const products = catalog.products;
  const activeCategory = categories.find((category) => category.slug === selectedCategory);
  const activeSubcategory = activeCategory?.subcategories.find((subcategory) => subcategory.slug === selectedSubcategory);
  const filterDefinitions = getCategoryFilterDefinitions(selectedCategory, selectedSubcategory);

  const activeFilterCount = [
    searchQuery,
    selectedBrand,
    selectedCategory,
    selectedSubcategory,
    inStockOnly ? "inStock" : "",
    minPrice !== undefined ? "minPrice" : "",
    maxPrice !== undefined ? "maxPrice" : "",
    ...Object.keys(selectedAttributes),
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 md:py-8">
      {/* Breadcrumb i naslov */}
      <div className="mb-6 space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link href="/" className="hover:text-cyan-600">Početna</Link>
          <span>/</span>
          <span className="text-slate-900">Katalog</span>
          {activeCategory && <><span>/</span><span className="text-slate-900">{activeCategory.name}</span></>}
          {activeSubcategory && <><span>/</span><span className="font-bold text-slate-900">{activeSubcategory.name}</span></>}
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          {activeSubcategory?.name ?? activeCategory?.name ?? (selectedCategory === "akcija" ? "Akcijska ponuda" : (searchQuery ? `Rezultati pretrage za: "${searchQuery}"` : "Svi proizvodi"))}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Prikazano <strong className="text-slate-900">{products.length}</strong> od <strong className="text-slate-900">{catalog.total}</strong> artikala. Strana {safePage} od {totalPages}.
        </p>
        {activeSubcategory?.description && (
          <p className="max-w-3xl text-xs sm:text-sm leading-relaxed text-slate-600">{activeSubcategory.description}</p>
        )}
      </div>

      {/* Hero baner za selektovanu kategoriju */}
      {activeCategory?.imageUrl && (
        <div className="relative mb-6 min-h-32 overflow-hidden rounded-xl border border-slate-200 bg-slate-900 sm:min-h-40">
          <Image src={activeCategory.imageUrl} alt="" fill sizes="100vw" className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/45 to-transparent" />
          <div className="relative z-10 flex min-h-32 max-w-2xl flex-col justify-center p-4 text-white sm:min-h-40 sm:p-6">
            <h2 className="text-lg font-black sm:text-xl">{activeCategory.name}</h2>
            {activeCategory.description && <p className="mt-1.5 line-clamp-2 text-xs sm:text-sm leading-relaxed text-white/85">{activeCategory.description}</p>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Leva kolona: Reaktivni filter sidebar sa mobilnim drawer-om */}
        <CatalogFilterPanel activeCount={activeFilterCount}>
          <CatalogFiltersSidebar
            categories={categories}
            brands={brands}
            filterAttributes={filterAttributes}
            filterDefinitions={filterDefinitions}
          />
        </CatalogFilterPanel>

        {/* Desna kolona: Aktivni filteri, Sortiranje, Lista proizvoda i Paginacija */}
        <main className="space-y-6 lg:col-span-3">
          {/* Traka sa aktivnim filterima (chips) */}
          <CatalogActiveFilters
            categoryName={activeCategory?.name}
            subcategoryName={activeSubcategory?.name}
            filterDefinitions={filterDefinitions}
          />

          {/* Kontrolna traka: Broj rezultata i Sortiranje */}
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

          {/* Mreža proizvoda ili Empty State */}
          {products.length === 0 ? (
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Search className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Nema pronađenih proizvoda</h3>
                <p className="mt-1 text-xs text-slate-500">Pokušajte sa drugim kriterijumima ili uklonite neki filter.</p>
              </div>
              <Link
                href="/katalog"
                className="inline-block rounded-xl bg-cyan-600 px-6 py-3 text-xs font-bold text-white shadow-md transition-colors hover:bg-cyan-700"
              >
                Prikaži sve proizvode
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Komponenta paginacije */}
              <CatalogPagination
                currentPage={safePage}
                totalPages={totalPages}
                totalItems={catalog.total}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
