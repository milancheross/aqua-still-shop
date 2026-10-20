"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, X, Check, ChevronDown, RotateCcw } from "lucide-react";
import { ProductCategory } from "@/types";
import { CatalogFilterDefinition, getFilterValues } from "@/lib/catalog-filters";
import { getCategoryIcon } from "@/lib/category-icons";

interface CatalogFiltersSidebarProps {
  categories: ProductCategory[];
  brands: string[];
  filterAttributes: Array<Record<string, unknown>>;
  filterDefinitions: CatalogFilterDefinition[];
}

export default function CatalogFiltersSidebar({
  categories,
  brands,
  filterAttributes,
  filterDefinitions,
}: CatalogFiltersSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // URL state
  const currentSearch = searchParams.get("q") ?? "";
  const selectedCategory = searchParams.get("category");
  const selectedSubcategory = searchParams.get("subcategory");
  const selectedBrand = searchParams.get("brand");
  const inStockOnly = searchParams.get("inStock") === "true";
  const currentMinPrice = searchParams.get("minPrice") ?? "";
  const currentMaxPrice = searchParams.get("maxPrice") ?? "";

  // Local state for debounced search and price inputs
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [minPriceInput, setMinPriceInput] = useState(currentMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(currentMaxPrice);

  // Sync local inputs when URL searchParams change
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    setMinPriceInput(currentMinPrice);
  }, [currentMinPrice]);

  useEffect(() => {
    setMaxPriceInput(currentMaxPrice);
  }, [currentMaxPrice]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== currentSearch) {
        updateFilters({ q: searchInput.trim() || null });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Helper to update query parameters in URL
  const updateFilters = (changes: Record<string, string | null | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    params.delete("page"); // reset pagination on filter change
    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `/katalog?${qs}` : "/katalog");
    });
  };

  const handlePriceApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateFilters({
      minPrice: minPriceInput.trim() || null,
      maxPrice: maxPriceInput.trim() || null,
    });
  };

  const handlePriceClear = () => {
    setMinPriceInput("");
    setMaxPriceInput("");
    updateFilters({ minPrice: null, maxPrice: null });
  };

  const resetAllFilters = () => {
    setSearchInput("");
    setMinPriceInput("");
    setMaxPriceInput("");
    startTransition(() => {
      router.push("/katalog");
    });
  };

  const hasAnyFilter = Boolean(
    currentSearch ||
    selectedCategory ||
    selectedSubcategory ||
    selectedBrand ||
    inStockOnly ||
    currentMinPrice ||
    currentMaxPrice ||
    Array.from(searchParams.keys()).some((k) => k.startsWith("attr_"))
  );

  return (
    <aside className="sticky top-24 space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header filtera */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="flex items-center gap-2 font-black text-slate-900">
          <Filter className="h-4 w-4 text-cyan-600" /> Filteri
          {isPending && (
            <span className="inline-block h-2 w-2 animate-ping rounded-full bg-cyan-600" />
          )}
        </h3>
        {hasAnyFilter && (
          <button
            type="button"
            onClick={resetAllFilters}
            className="flex items-center gap-1 text-xs font-bold text-red-600 transition hover:underline"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Poništi sve
          </button>
        )}
      </div>

      <div className={`space-y-5 transition-opacity duration-200 ${isPending ? "opacity-60" : ""}`}>
        {/* Pretraga */}
        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-700">
            Pretraga
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Naziv, SKU ili brend..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-8 text-xs outline-none transition focus:border-cyan-500 focus:bg-white"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  updateFilters({ q: null });
                }}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <p className="text-[10px] text-slate-400">Pretraga po nazivu, brendu, šifri i barkodu.</p>
        </div>

        {/* Kategorije */}
        <div className="space-y-2 border-t border-slate-100 pt-4">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-700">
            Kategorija
          </label>
          <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
            <button
              type="button"
              onClick={() => updateFilters({ category: null, subcategory: null })}
              className={`w-full rounded-lg px-3 py-2 text-left text-xs font-bold transition ${
                !selectedCategory
                  ? "bg-cyan-50 text-cyan-700 font-black"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Sve kategorije
            </button>
            {categories.map((cat) => {
              const CategoryIcon = getCategoryIcon(cat.slug || cat.name);
              const isCatSelected = selectedCategory === cat.slug;

              return (
                <div key={cat.id}>
                  <button
                    type="button"
                    onClick={() =>
                      updateFilters({
                        category: isCatSelected ? null : cat.slug,
                        subcategory: null,
                      })
                    }
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs transition ${
                      isCatSelected
                        ? "bg-cyan-50 font-bold text-cyan-700"
                        : "font-medium text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <CategoryIcon className="h-4 w-4 shrink-0 text-slate-500" strokeWidth={2} />
                      <span className="truncate">{cat.name}</span>
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                      {cat.itemCount}
                    </span>
                  </button>

                  {/* Podkategorije */}
                  {isCatSelected && cat.subcategories.length > 0 && (
                    <div className="ml-3 mt-1 space-y-0.5 border-l-2 border-cyan-200 pl-2">
                      {cat.subcategories.map((sub) => {
                        const isSubSelected = selectedSubcategory === sub.slug;
                        const SubcategoryIcon = getCategoryIcon(sub.slug || sub.name);

                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() =>
                              updateFilters({
                                category: cat.slug,
                                subcategory: isSubSelected ? null : sub.slug,
                              })
                            }
                            className={`flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-[11px] transition ${
                              isSubSelected
                                ? "bg-cyan-100 font-bold text-cyan-800"
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <span className="flex min-w-0 items-center gap-1.5">
                              <SubcategoryIcon
                                className="h-3.5 w-3.5 shrink-0 text-slate-400"
                                strokeWidth={2}
                              />
                              <span className="truncate">{sub.name}</span>
                            </span>
                            <span className="text-[10px] text-slate-400">{sub.itemCount}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Brendovi */}
        <div className="space-y-2 border-t border-slate-100 pt-4">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-700">
            Brendovi
          </label>
          <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
            {brands.map((brand) => {
              const isBrandSelected = selectedBrand === brand;

              return (
                <button
                  key={brand}
                  type="button"
                  onClick={() =>
                    updateFilters({
                      brand: isBrandSelected ? null : brand,
                    })
                  }
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs transition ${
                    isBrandSelected
                      ? "bg-cyan-600 font-bold text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{brand}</span>
                  {isBrandSelected && <Check className="h-3.5 w-3.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Raspon cena */}
        <div className="space-y-2 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-700">
              Cena (RSD)
            </label>
            {(currentMinPrice || currentMaxPrice) && (
              <button
                type="button"
                onClick={handlePriceClear}
                className="text-[10px] font-bold text-red-600 hover:underline"
              >
                Resetuj
              </button>
            )}
          </div>
          <form onSubmit={handlePriceApply} className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min="0"
                step="1"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                placeholder="Od"
                className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs outline-none focus:border-cyan-500"
              />
              <input
                type="number"
                min="0"
                step="1"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                placeholder="Do"
                className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs outline-none focus:border-cyan-500"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
            >
              Primeni cenu
            </button>
          </form>
        </div>

        {/* Dinamički atributi kategorije */}
        {filterDefinitions.map((definition) => {
          const values = getFilterValues(
            filterAttributes.map((attributes) => ({
              attributes: attributes as Record<string, string | number | boolean>,
            })),
            definition.key
          );
          if (values.length === 0) return null;

          const paramKey = `attr_${definition.key}`;
          const currentAttrValue = searchParams.get(paramKey);

          return (
            <div key={definition.key} className="space-y-2 border-t border-slate-100 pt-4">
              <label className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-700">
                <span>{definition.label}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </label>
              <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
                {values.map((value) => {
                  const isSelected = currentAttrValue === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        updateFilters({
                          [paramKey]: isSelected ? null : value,
                        })
                      }
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs transition ${
                        isSelected
                          ? "bg-cyan-50 font-bold text-cyan-700"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span>
                        {value}
                        {definition.unit ? ` ${definition.unit}` : ""}
                      </span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-cyan-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Samo na stanju toggle */}
        <div className="border-t border-slate-100 pt-4">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-800">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) =>
                updateFilters({
                  inStock: e.target.checked ? "true" : null,
                })
              }
              className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
            />
            Samo artikli na stanju
          </label>
        </div>
      </div>
    </aside>
  );
}

