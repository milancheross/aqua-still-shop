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

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:border-cyan-200 hover:shadow-xl sm:rounded-2xl">
      {/* Discount Badge */}
      {discount > 0 && (
        <span className="absolute top-3 left-3 z-10 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-md shadow-sm">
          -{discount}%
        </span>
      )}

      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-50 p-2 sm:p-6">
        <Image
          src={product.images?.find(Boolean) || "/placeholder-tool.svg"}
          alt={product.name}
          fill
          unoptimized
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Content */}
      <div className="flex flex-grow flex-col p-3 sm:p-5">
        <Link href={`/proizvod/${product.slug}`} className="mb-2 block">
          <h3 className="line-clamp-2 min-h-9 text-xs font-bold text-slate-900 transition-colors group-hover:text-cyan-600 sm:h-10 sm:text-sm">
            {product.name}
          </h3>
        </Link>

        <div className="mb-2 min-h-4 sm:mb-3">
          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold sm:text-xs ${product.inStock && product.stockQuantity > 0 ? "text-emerald-700" : "text-slate-500"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${product.inStock && product.stockQuantity > 0 ? "bg-emerald-500" : "bg-slate-400"}`} />
            {product.inStock && product.stockQuantity > 0 ? "Na stanju" : "Proverite dostupnost"}
          </span>
        </div>

        {/* Price & Cart */}
        <div className="mt-auto flex items-center justify-between gap-1 border-t border-slate-100 pt-2 sm:pt-3">
          <div>
            {product.salePrice ? (
              <div className="space-y-0.5">
                <span className="text-xs text-slate-400 line-through block">{formatPrice(product.price)}</span>
                <span className="block text-sm font-black text-red-600 sm:text-base">{formatPrice(product.salePrice)}</span>
              </div>
            ) : (
              <span className="block text-sm font-black text-slate-900 sm:text-base">{formatPrice(product.price)}</span>
            )}
          </div>

          <button
            onClick={() => addToCart(product)}
            className="shrink-0 rounded-lg bg-cyan-600 p-2 text-white shadow-md transition-all hover:bg-cyan-700 hover:shadow-cyan-200 active:scale-95 sm:rounded-xl sm:p-3"
            title="Dodaj u korpu"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
