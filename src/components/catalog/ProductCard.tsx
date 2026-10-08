"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { Product } from "@/types";
import { formatPrice, calculateDiscountPercent } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const discount = calculateDiscountPercent(product.price, product.salePrice);
  const available = product.inStock && product.stockQuantity > 0;
  const displayPrice = product.salePrice ?? product.price;

  const decrease = () => setQuantity((value) => Math.max(1, value - 1));
  const increase = () => setQuantity((value) => Math.min(product.stockQuantity, value + 1));

  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md">
      <Link href={`/proizvod/${product.slug}`} aria-label={product.name} className="block">
        <div className="relative aspect-[1.12] overflow-hidden bg-slate-50 sm:aspect-[1.08]">
          <Image
            src={product.images?.find(Boolean) || "/placeholder-tool.svg"}
            alt={product.name}
            fill
            sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 16.66vw"
            className="object-contain p-2.5 transition-transform duration-500 group-hover:scale-[1.03] sm:p-3.5"
          />

          <div className="absolute left-2 top-2 flex max-w-[calc(100%-2.75rem)] items-center gap-1.5 sm:left-2.5 sm:top-2.5">
            <span className="max-w-full truncate rounded bg-white/95 px-1.5 py-1 text-[8px] font-black uppercase tracking-wide text-cyan-700 shadow-sm sm:text-[9px]">
              {product.brand}
            </span>
            {product.isPromo && (
              <span className="shrink-0 rounded bg-amber-50 px-1.5 py-1 text-[8px] font-black text-amber-700 shadow-sm sm:text-[9px]">
                AKCIJA
              </span>
            )}
          </div>

          {discount > 0 && (
            <span className="absolute right-2 top-2 rounded bg-red-600 px-1.5 py-1 text-[8px] font-black text-white shadow-sm sm:right-2.5 sm:top-2.5 sm:text-[9px]">
              -{discount}%
            </span>
          )}
        </div>
      </Link>

      <div className="flex min-h-0 flex-1 flex-col p-2.5 sm:p-3.5">
        <Link href={`/proizvod/${product.slug}`} className="block min-w-0">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-[12px] font-extrabold leading-5 text-slate-900 transition-colors group-hover:text-cyan-700 sm:text-[13px]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1 truncate text-[8px] font-medium text-slate-400 sm:text-[9px]">
          Šifra: <span className="font-semibold text-slate-600">{product.sku}</span>
        </div>

        <div
          className={`mt-2.5 flex items-center gap-1.5 text-[9px] font-bold sm:text-[10px] ${
            available ? "text-emerald-700" : "text-red-600"
          }`}
          aria-label={available ? "Proizvod je na stanju" : "Proizvod nije na stanju"}
        >
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
              available ? "bg-emerald-500" : "bg-red-500"
            }`}
          />
          <span>{available ? "Na stanju" : "Nema na stanju"}</span>
        </div>

        <div className="mt-auto pt-3">
          <div className="border-t border-slate-100 pt-2.5">
            {product.salePrice ? (
              <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                <span className="text-[9px] text-slate-400 line-through sm:text-[10px]">
                  {formatPrice(product.price)}
                </span>
                <span className="truncate text-[15px] font-black leading-5 text-red-600 sm:text-base">
                  {formatPrice(product.salePrice)}
                </span>
              </div>
            ) : (
              <span className="text-[15px] font-black leading-5 text-slate-950 sm:text-base">
                {formatPrice(displayPrice)}
              </span>
            )}
          </div>

          <div className="mt-2.5 grid grid-cols-[auto_minmax(0,1fr)] gap-1.5">
            <div className="flex h-9 shrink-0 items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 sm:h-10">
              <button
                type="button"
                onClick={decrease}
                disabled={!available || quantity <= 1}
                aria-label="Smanji količinu"
                className="flex h-full w-6 items-center justify-center text-slate-500 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-30 sm:w-7"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-5 text-center text-[10px] font-black text-slate-900 sm:w-6 sm:text-[11px]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={increase}
                disabled={!available || quantity >= product.stockQuantity}
                aria-label="Povećaj količinu"
                className="flex h-full w-6 items-center justify-center text-slate-500 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-30 sm:w-7"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            <button
              type="button"
              disabled={!available}
              onClick={() => {
                void addToCart(product, quantity);
                setQuantity(1);
              }}
              className="flex h-9 min-w-0 items-center justify-center gap-1 rounded-lg bg-cyan-600 px-2 text-white shadow-sm transition-[background-color,transform] hover:bg-cyan-700 active:scale-[.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none sm:h-10 sm:gap-1.5 sm:px-2.5"
              title={available ? `Dodaj ${quantity} ${product.unit} u korpu` : "Proizvod trenutno nije dostupan"}
              aria-label={
                available
                  ? `Dodaj ${quantity} ${product.name} u korpu`
                  : `${product.name} nije dostupan`
              }
            >
              <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate text-[9px] font-black sm:text-[10px]">Dodaj</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
