"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CatalogPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export default function CatalogPagination({
  currentPage,
  totalPages,
  totalItems,
}: CatalogPaginationProps) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (pageNumber <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(pageNumber));
    }
    const qs = params.toString();
    return qs ? `/katalog?${qs}` : "/katalog";
  };

  // Generisanje paginacije sa elipsama (...), npr: 1 ... 4 5 6 ... 12
  const getPageNumbers = () => {
    const delta = 1;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let prev: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (prev !== undefined) {
        if (i - prev === 2) {
          rangeWithDots.push(prev + 1);
        } else if (i - prev !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      prev = i;
    }

    return rangeWithDots;
  };

  const pages = getPageNumbers();
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav
      className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row"
      aria-label="Paginacija kataloga"
    >
      <p className="text-xs text-slate-500">
        Ukupno <strong className="text-slate-900">{totalItems}</strong> proizvoda &bull; Strana{" "}
        <strong className="text-slate-900">{currentPage}</strong> od{" "}
        <strong className="text-slate-900">{totalPages}</strong>
      </p>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {/* Prethodna strana */}
        <Link
          href={hasPrev ? createPageUrl(currentPage - 1) : "#"}
          aria-disabled={!hasPrev}
          tabIndex={hasPrev ? 0 : -1}
          className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold transition ${
            hasPrev
              ? "bg-white text-slate-700 ring-1 ring-slate-200 hover:border-[#005B94] hover:bg-slate-50"
              : "pointer-events-none bg-slate-100 text-slate-400"
          }`}
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Nazad</span>
        </Link>

        {/* Brojevi strana */}
        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <span
                key={`dots-${idx}`}
                className="select-none px-2 py-2 text-xs font-bold text-slate-400"
              >
                &hellip;
              </span>
            );
          }

          const pageNum = Number(p);
          const isCurrent = pageNum === currentPage;

          return (
            <Link
              key={pageNum}
              href={createPageUrl(pageNum)}
              aria-current={isCurrent ? "page" : undefined}
              className={`min-w-9 rounded-xl px-3 py-2 text-center text-xs font-bold transition ${
                isCurrent
                  ? "bg-[#005B94] text-white shadow-sm ring-1 ring-[#005B94]"
                  : "bg-white text-slate-700 ring-1 ring-slate-200 hover:border-[#005B94] hover:bg-blue-50/50"
              }`}
            >
              {pageNum}
            </Link>
          );
        })}

        {/* Sledeća strana */}
        <Link
          href={hasNext ? createPageUrl(currentPage + 1) : "#"}
          aria-disabled={!hasNext}
          tabIndex={hasNext ? 0 : -1}
          className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold transition ${
            hasNext
              ? "bg-white text-slate-700 ring-1 ring-slate-200 hover:border-[#005B94] hover:bg-slate-50"
              : "pointer-events-none bg-slate-100 text-slate-400"
          }`}
        >
          <span>Napred</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </nav>
  );
}

