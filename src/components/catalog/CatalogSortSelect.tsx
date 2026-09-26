"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface CatalogSortSelectProps {
  defaultValue: string;
}

export default function CatalogSortSelect({ defaultValue }: CatalogSortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    router.push(`/katalog?${params.toString()}`);
  };

  return (
    <select
      name="sort"
      defaultValue={defaultValue}
      onChange={handleChange}
      className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-cyan-500 outline-none cursor-pointer"
    >
      <option value="popular">Najpopularnije</option>
      <option value="price-asc">Cena: od niže ka višoj</option>
      <option value="price-desc">Cena: od više ka nižoj</option>
      <option value="name">Naziv (A-Z)</option>
    </select>
  );
}
