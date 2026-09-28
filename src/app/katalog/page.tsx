import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Filter, Search, ArrowUpDown, X, Check } from "lucide-react";
import { getDbProducts, getDbCategories, getDbBrands } from "@/services/product-service";
import ProductCard from "@/components/catalog/ProductCard";
import CatalogSortSelect from "@/components/catalog/CatalogSortSelect";

interface CatalogPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;

  const searchQuery = typeof params.q === "string" ? params.q : "";
  const selectedBrand = typeof params.brand === "string" ? params.brand : undefined;
  const selectedCategory = typeof params.category === "string" ? params.category : undefined;
  const selectedSubcategory = typeof params.subcategory === "string" ? params.subcategory : undefined;
  const sortOption = (typeof params.sort === "string" ? params.sort : "popular") as "popular" | "price-asc" | "price-desc" | "name";
  const inStockOnly = params.inStock === "true";

  const categories = await getDbCategories();
  const brands = await getDbBrands();
  const activeCategory = categories.find((category) => category.slug === selectedCategory);

  // Fetch filtered products using service layer with database/mock fallback
  const products = await getDbProducts({
    search: searchQuery,
    brand: selectedBrand,
    categorySlug: selectedCategory,
    subcategorySlug: selectedSubcategory,
    inStockOnly,
    sort: sortOption,
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Breadcrumbs & Header */}
      <div className="mb-8 space-y-2">
        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-cyan-600">Početna</Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">Katalog proizvoda</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900">
          {selectedCategory 
            ? categories.find(c => c.slug === selectedCategory)?.name ?? "Katalog" 
            : searchQuery 
            ? `Rezultati pretrage za: "${searchQuery}"` 
            : "Svi proizvodi"}
        </h1>
        <p className="text-sm text-slate-500">
          Prikazano <strong className="text-slate-900">{products.length}</strong> artikala iz našeg asortimana.
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* SIDEBAR FILTERS */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-black text-slate-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-cyan-600" /> Filteri
              </h3>
              {(searchQuery || selectedBrand || selectedCategory || inStockOnly) && (
                <Link 
                  href="/katalog" 
                  className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Poništi sve
                </Link>
              )}
            </div>

            {/* Search Input Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pretraga</label>
              <form method="GET" action="/katalog" className="relative">
                <input 
                  type="text" 
                  name="q" 
                  defaultValue={searchQuery}
                  placeholder="Pretraži po nazivu ili šifri..." 
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-cyan-500 outline-none"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                {selectedCategory && <input type="hidden" name="category" value={selectedCategory} />}
                {selectedBrand && <input type="hidden" name="brand" value={selectedBrand} />}
              </form>
            </div>

            {/* Categories Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Kategorije</label>
              <div className="space-y-1">
                <Link
                  href={`/katalog${selectedBrand ? `?brand=${selectedBrand}` : ""}`}
                  className={`block px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                    !selectedCategory ? "bg-cyan-50 text-cyan-700" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Sve kategorije
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/katalog?category=${cat.slug}${selectedBrand ? `&brand=${selectedBrand}` : ""}`}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      selectedCategory === cat.slug ? "bg-cyan-50 text-cyan-700 font-bold" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{cat.itemCount}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Brands Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Brendovi</label>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {brands.map((brand) => {
                  const isSelected = selectedBrand === brand;
                  const queryParams = new URLSearchParams();
                  if (searchQuery) queryParams.set("q", searchQuery);
                  if (selectedCategory) queryParams.set("category", selectedCategory);
                  if (!isSelected) queryParams.set("brand", brand);
                  if (inStockOnly) queryParams.set("inStock", "true");
                  if (sortOption) queryParams.set("sort", sortOption);

                  return (
                    <Link
                      key={brand}
                      href={`/katalog?${queryParams.toString()}`}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        isSelected ? "bg-cyan-600 text-white font-bold" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span>{brand}</span>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Stock Availability Filter */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 cursor-pointer">
                <input 
                  type="checkbox" 
                  defaultChecked={inStockOnly}
                  className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4"
                />
                <span>Samo artikli na stanju</span>
              </label>
            </div>
          </div>
        </div>

        {/* PRODUCTS MAIN AREA */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Bar (Sorting & Mobile filter trigger) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 font-medium">
              Prikaz <strong>{products.length}</strong> proizvoda
            </div>

            {/* Sort Selector using Client Component */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-500 shrink-0 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" /> Sortiraj po:
              </span>
              <CatalogSortSelect defaultValue={sortOption} />
            </div>
          </div>

          {/* Product Grid */}
          {products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Nema pronađenih proizvoda</h3>
                <p className="text-xs text-slate-500 mt-1">Pokušajte sa drugim kriterijumima pretrage ili uklonite filtere.</p>
              </div>
              <div>
                <Link 
                  href="/katalog" 
                  className="inline-block px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl transition-colors shadow-md"
                >
                  Prikaži sve proizvode
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
