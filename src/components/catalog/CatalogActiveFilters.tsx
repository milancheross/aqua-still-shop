"use client";

import React, { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, RotateCcw } from "lucide-react";

interface CatalogActiveFiltersProps {
  categoryName?: string;
  subcategoryName?: string;
  filterDefinitions?: Array<{ key: string; label: string; unit?: string }>;
}

export default function CatalogActiveFilters({
  categoryName,
  subcategoryName,
  filterDefinitions = [],
}: CatalogActiveFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const searchQuery = searchParams.get("q") ?? "";
  const selectedCategory = searchParams.get("category");
  const selectedSubcategory = searchParams.get("subcategory");
  const selectedBrand = searchParams.get("brand");
  const inStockOnly = searchParams.get("inStock") === "true";
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  // Prikupljanje atributskih filtera (attr_*)
  const activeAttributes: Array<{ key: string; rawKey: string; label: string; value: string }> = [];
  searchParams.forEach((value, key) => {
    if (key.startsWith("attr_") && value) {
      const rawKey = key.slice(5);
      const def = filterDefinitions.find((d) => d.key === rawKey);
      const label = def ? def.label : rawKey;
      const displayValue = def?.unit ? `${value} ${def.unit}` : value;
      activeAttributes.push({ key, rawKey, label, value: displayValue });
    }
  });

  const hasAnyFilter = Boolean(
    searchQuery ||
    selectedCategory ||
    selectedSubcategory ||
    selectedBrand ||
    inStockOnly ||
    minPrice ||
    maxPrice ||
    activeAttributes.length > 0
  );

  if (!hasAnyFilter) return null;

  const removeFilter = (keysToRemove: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    keysToRemove.forEach((key) => params.delete(key));
    params.delete("page");
    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `/katalog?${qs}` : "/katalog");
    });
  };

  const resetAllFilters = () => {
    startTransition(() => {
      router.push("/katalog");
    });
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition-opacity ${
        isPending ? "opacity-60" : ""
      }`}
    >
      <span className="mr-1 text-xs font-black uppercase tracking-wider text-slate-500">
        Aktivni filteri:
      </span>

      {searchQuery && (
        <button
          type="button"
          onClick={() => removeFilter(["q"])}
          className="group inline-flex items-center gap-1.5 rounded-lg border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
          title="Ukloni pretragu"
        >
          <span>Pretraga: &ldquo;{searchQuery}&rdquo;</span>
          <X className="h-3.5 w-3.5 text-cyan-600 transition group-hover:text-red-600" />
        </button>
      )}

      {selectedCategory && (
        <button
          type="button"
          onClick={() => removeFilter(["category", "subcategory"])}
          className="group inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
          title="Ukloni kategoriju"
        >
          <span>Kategorija: {categoryName || selectedCategory}</span>
          <X className="h-3.5 w-3.5 text-slate-500 transition group-hover:text-red-600" />
        </button>
      )}

      {selectedSubcategory && (
        <button
          type="button"
          onClick={() => removeFilter(["subcategory"])}
          className="group inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
          title="Ukloni podkategoriju"
        >
          <span>Podkategorija: {subcategoryName || selectedSubcategory}</span>
          <X className="h-3.5 w-3.5 text-slate-500 transition group-hover:text-red-600" />
        </button>
      )}

      {selectedBrand && (
        <button
          type="button"
          onClick={() => removeFilter(["brand"])}
          className="group inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
          title="Ukloni brend"
        >
          <span>Brend: {selectedBrand}</span>
          <X className="h-3.5 w-3.5 text-slate-500 transition group-hover:text-red-600" />
        </button>
      )}

      {(minPrice || maxPrice) && (
        <button
          type="button"
          onClick={() => removeFilter(["minPrice", "maxPrice"])}
          className="group inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
          title="Ukloni filter cene"
        >
          <span>
            Cena: {minPrice ? `${Number(minPrice).toLocaleString("sr-RS")} RSD` : "0 RSD"} &ndash;{" "}
            {maxPrice ? `${Number(maxPrice).toLocaleString("sr-RS")} RSD` : "bilo koja"}
          </span>
          <X className="h-3.5 w-3.5 text-slate-500 transition group-hover:text-red-600" />
        </button>
      )}

      {inStockOnly && (
        <button
          type="button"
          onClick={() => removeFilter(["inStock"])}
          className="group inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
          title="Ukloni filter stanja"
        >
          <span>Samo na stanju</span>
          <X className="h-3.5 w-3.5 text-emerald-600 transition group-hover:text-red-600" />
        </button>
      )}

      {activeAttributes.map((attr) => (
        <button
          key={attr.key}
          type="button"
          onClick={() => removeFilter([attr.key])}
          className="group inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
          title={`Ukloni filter ${attr.label}`}
        >
          <span>
            {attr.label}: {attr.value}
          </span>
          <X className="h-3.5 w-3.5 text-slate-500 transition group-hover:text-red-600" />
        </button>
      ))}

      <button
        type="button"
        onClick={resetAllFilters}
        className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1 text-xs font-bold text-red-700 transition hover:bg-red-100 hover:text-red-800"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        <span>Poništi sve</span>
      </button>
    </div>
  );
}

