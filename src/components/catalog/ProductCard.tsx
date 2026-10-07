"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Product } from "@/types";
import { formatPrice, calculateDiscountPercent } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const discount = calculateDiscountPercent(product.price, product.salePrice);
  const available = product.inStock && product.stockQuantity > 0;
  const displayPrice = product.salePrice ?? product.price;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-cyan-200 hover:shadow-xl sm:rounded-2xl">
      {discount > 0 && (
        <span className="absolute left-2 top-2 z-10 rounded-md bg-red-600 px-2 py-1 text-[10px] sm:left-3 sm:top-3 sm:px-2.5 sm:text-xs font-black text-white shadow-sm">
          -{discount}%
        </span>
      )}

      <Link href={`/proizvod/${product.slug}`} aria-label={product.name} className="block">
        <div className="relative aspect-square overflow-hidden bg-slate-50 p-1.5 sm:p-5">
          <Image
            src={product.images?.find(Boolean) || "/placeholder-tool.svg"}
            alt={product.name}
            fill
            unoptimized
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-2.5 transition-transform duration-500 group-hover:scale-105 sm:p-5"
          />
        </div>
      </Link>

      <div className="flex flex-grow flex-col p-2.5 sm:p-5">
        <div className="mb-1.5 flex items-center justify-between gap-1.5">
          <span className="truncate text-[10px] font-black uppercase tracking-wide text-cyan-700 sm:text-xs">
            {product.brand}
          </span>
          {product.isPromo && (
            <span className="shrink-0 rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
              AKCIJA
            </span>
          )}
        </div>

        <Link href={`/proizvod/${product.slug}`} className="mb-1.5 block">
          <h3 className="line-clamp-2 min-h-9 text-xs font-bold leading-5 text-slate-900 transition-colors group-hover:text-cyan-600 sm:min-h-10 sm:text-sm">
            {product.name}
          </h3>
        </Link>

        <div className="mb-2 space-y-1 sm:mb-3">
          <div className="text-[10px] font-medium text-slate-400 sm:text-[11px]">
            Šifra: <span className="font-semibold text-slate-500">{product.sku}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold sm:text-xs">
            <span className={`h-1.5 w-1.5 rounded-full ${available ? "bg-emerald-500" : "bg-slate-400"}`} />
            <span className={available ? "text-emerald-700" : "text-slate-500"}>
              {available ? `Na stanju · ${product.stockQuantity} ${product.unit}` : "Proverite dostupnost"}
            </span>
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 border-t border-slate-100 pt-3">
          <div>
            {product.salePrice ? (
              <div className="space-y-0.5">
                <span className="block text-xs text-slate-400 line-through">{formatPrice(product.price)}</span>
                <span className="block text-sm font-black text-red-600 sm:text-base">{formatPrice(product.salePrice)}</span>
              </div>
            ) : (
              <span className="block text-sm font-black text-slate-900 sm:text-base">{formatPrice(displayPrice)}</span>
            )}
          </div>

          <button
            type="button"
            disabled={!available}
            onClick={() => addToCart(product)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-600 p-2 text-white shadow-md transition-all hover:bg-cyan-700 hover:shadow-cyan-200 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none sm:rounded-xl sm:p-3"
            title={available ? "Dodaj u korpu" : "Proizvod trenutno nije dostupan"}
            aria-label={available ? `Dodaj ${product.name} u korpu` : `${product.name} nije dostupan`}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
