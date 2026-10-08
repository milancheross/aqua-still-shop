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

function formatSpecLabel(key: string) {
  const labels: Record<string, string> = {
    power: "Snaga",
    wattage: "Snaga",
    voltage: "Napon",
    diameter: "Prečnik",
    discDiameter: "Prečnik ploče",
    connection: "Priključak",
    inlet: "Ulaz",
    outlet: "Izlaz",
    flow: "Protok",
    maxHead: "Hmax",
    rpm: "Obrtaji",
  };

  return labels[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const discount = calculateDiscountPercent(product.price, product.salePrice);
  const available = product.inStock && product.stockQuantity > 0;
  const displayPrice = product.salePrice ?? product.price;

  const technicalSpecs = Object.entries(product.attributes ?? {})
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .slice(0, 2);

  const decrease = () => setQuantity((value) => Math.max(1, value - 1));
  const increase = () => setQuantity((value) => Math.min(product.stockQuantity, value + 1));

  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-lg">
      <Link
        href={`/proizvod/${product.slug}`}
        aria-label={product.name}
        className="block"
      >
        <div className="relative aspect-[1.18] overflow-hidden bg-slate-50 sm:aspect-[1.12]">
          <Image
            src={product.images?.find(Boolean) || "/placeholder-tool.svg"}
            alt={product.name}
            fill
            sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 16.66vw"
            className="object-contain p-3 transition-transform duration-500 group-hover:scale-[1.03] sm:p-4"
          />

          <div className="absolute left-2 top-2 flex max-w-[calc(100%-1rem)] flex-wrap gap-1.5 sm:left-3 sm:top-3">
            <span className="max-w-full truncate rounded-md bg-white/95 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-cyan-700 shadow-sm sm:text-[10px]">
              {product.brand}
            </span>
            {product.isPromo && (
              <span className="shrink-0 rounded-md bg-amber-50 px-2 py-1 text-[9px] font-black text-amber-700 shadow-sm sm:text-[10px]">
                AKCIJA
              </span>
            )}
          </div>

          {discount > 0 && (
            <span className="absolute right-2 top-2 rounded-md bg-red-600 px-2 py-1 text-[9px] font-black text-white shadow-sm sm:right-3 sm:top-3 sm:text-[10px]">
              -{discount}%
            </span>
          )}
        </div>
      </Link>

      <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-4">
        <Link href={`/proizvod/${product.slug}`} className="block">
          <h3 className="line-clamp-2 min-h-10 text-[13px] font-extrabold leading-5 text-slate-900 transition-colors group-hover:text-cyan-700 sm:text-sm">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1.5 truncate text-[9px] font-medium text-slate-400 sm:text-[10px]">
          Šifra: <span className="font-semibold text-slate-600">{product.sku}</span>
        </div>

        {technicalSpecs.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2 border-y border-slate-100 py-2.5">
            {technicalSpecs.map(([key, value]) => (
              <div key={key} className="min-w-0">
                <span className="block truncate text-[8px] font-bold uppercase tracking-wide text-slate-400">
                  {formatSpecLabel(key)}
                </span>
                <span className="mt-0.5 block truncate text-[10px] font-extrabold text-slate-700 sm:text-[11px]">
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        )}

        <div
          className={`mt-3 flex items-center gap-1.5 text-[10px] font-bold sm:text-[11px] ${
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

        <div className="mt-auto pt-4">
          <div className="border-t border-slate-100 pt-3">
            {product.salePrice ? (
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-[11px] text-slate-400 line-through sm:text-xs">
                  {formatPrice(product.price)}
                </span>
                <span className="text-[17px] font-black leading-6 text-red-600 sm:text-lg">
                  {formatPrice(product.salePrice)}
                </span>
              </div>
            ) : (
              <span className="text-[17px] font-black leading-6 text-slate-950 sm:text-lg">
                {formatPrice(displayPrice)}
              </span>
            )}
          </div>

          <div className="mt-3 flex items-stretch gap-2">
            <div className="flex h-10 shrink-0 items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 sm:h-11">
              <button
                type="button"
                onClick={decrease}
                disabled={!available || quantity <= 1}
                aria-label="Smanji količinu"
                className="flex h-full w-7 items-center justify-center text-slate-500 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-30 sm:w-8"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-6 text-center text-[11px] font-black text-slate-900 sm:w-7 sm:text-xs">
                {quantity}
              </span>
              <button
                type="button"
                onClick={increase}
                disabled={!available || quantity >= product.stockQuantity}
                aria-label="Povećaj količinu"
                className="flex h-full w-7 items-center justify-center text-slate-500 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-30 sm:w-8"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              type="button"
              disabled={!available}
              onClick={() => {
                void addToCart(product, quantity);
                setQuantity(1);
              }}
              className="flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl bg-cyan-600 px-2.5 text-white shadow-sm transition-[background-color,transform] hover:bg-cyan-700 active:scale-[.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none sm:h-11 sm:gap-2 sm:px-3"
              title={available ? `Dodaj ${quantity} ${product.unit} u korpu` : "Proizvod trenutno nije dostupan"}
              aria-label={
                available
                  ? `Dodaj ${quantity} ${product.name} u korpu`
                  : `${product.name} nije dostupan`
              }
            >
              <ShoppingCart className="h-4 w-4 shrink-0" />
              <span className="text-[10px] font-black sm:text-[11px]">Dodaj</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
