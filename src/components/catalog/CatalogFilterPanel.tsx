"use client";

import { useState, type ReactNode } from "react";
import { Filter, X } from "lucide-react";

interface CatalogFilterPanelProps {
  children: ReactNode;
  activeCount: number;
}

export default function CatalogFilterPanel({ children, activeCount }: CatalogFilterPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:col-span-1">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="sticky top-[116px] z-20 mb-3 flex min-h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-900 shadow-sm lg:hidden"
        aria-expanded={open}
        aria-controls="catalog-filter-panel"
      >
        <span className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-cyan-600" />
          Filteri
          {activeCount > 0 && (
            <span className="rounded-full bg-cyan-600 px-2 py-0.5 text-[10px] font-black text-white">
              {activeCount}
            </span>
          )}
        </span>
        {open ? <X className="h-4 w-4 text-slate-500" /> : <span className="text-xs text-slate-500">Otvori</span>}
      </button>

      <div id="catalog-filter-panel" className={open ? "block" : "hidden lg:block"}>
        {children}
      </div>
    </div>
  );
}
