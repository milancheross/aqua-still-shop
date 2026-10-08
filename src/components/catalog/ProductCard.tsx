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
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-cyan-200 hover:shadow-xl">
      {discount > 0 && (
        <span className="absolute left-2 top-2 z-10 rounded-md bg-red-600 px-2 py-1 text-[10px] font-black text-white shadow-sm sm:left-3 sm:top-3 sm:px-2.5 sm:text-xs">
          -{discount}%
        </span>
      )}

      <Link href={`/proizvod/${product.slug}`} aria-label={product.name} className="block">
        <div className="relative aspect-square overflow-hidden bg-slate-50 p-1.5 sm:p-5">
          <Image
            src={product.images?.find(Boolean) || "/placeholder-tool.svg"}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-2.5 transition-transform duration-500 group-hover:scale-105 sm:p-5"
          />
        </div>
      </Link>

      <div className="flex flex-grow flex-col p-2.5 sm:p-4">
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

        <div className="mb-2 text-[9px] font-medium text-slate-400 sm:text-[10px]">
          Šifra: <span className="font-semibold text-slate-600">{product.sku}</span>
        </div>

        {technicalSpecs.length > 0 && (
          <div className="mb-2 grid grid-cols-2 gap-x-2 border-y border-slate-100 py-2">
            {technicalSpecs.map(([key, value]) => (
              <div key={key} className="min-w-0">
                <span className="block truncate text-[8px] font-bold uppercase tracking-wide text-slate-400">
                  {formatSpecLabel(key)}
                </span>
                <span className="block truncate text-[10px] font-black text-slate-700">{String(value)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold sm:text-xs">
          <span className={`h-1.5 w-1.5 rounded-full ${available ? "bg-emerald-500" : "bg-slate-400"}`} />
          <span className={available ? "text-emerald-700" : "text-slate-500"}>
            {available ? `Na stanju · ${product.stockQuantity} ${product.unit}` : "Proverite dostupnost"}
          </span>
        </div>

        <div className="mt-auto border-t border-slate-100 pt-3">
          <div className="mb-2 flex items-end justify-between gap-2">
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
            <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Količina</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-10 items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <button type="button" onClick={decrease} disabled={!available || quantity <= 1} aria-label="Smanji količinu" className="flex h-full w-8 items-center justify-center text-slate-500 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35">
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-7 text-center text-xs font-black text-slate-800">{quantity}</span>
              <button type="button" onClick={increase} disabled={!available || quantity >= product.stockQuantity} aria-label="Povećaj količinu" className="flex h-full w-8 items-center justify-center text-slate-500 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35">
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
              className="flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-3 text-white shadow-md transition-all hover:bg-cyan-700 active:scale-[.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
              title={available ? `Dodaj ${quantity} ${product.unit} u korpu` : "Proizvod trenutno nije dostupan"}
              aria-label={available ? `Dodaj ${quantity} ${product.name} u korpu` : `${product.name} nije dostupan`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden text-[10px] font-black sm:inline">Dodaj</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
