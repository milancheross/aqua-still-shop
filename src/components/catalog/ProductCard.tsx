"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star, Percent } from "lucide-react";
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
          src={product.images[0]}
          alt={product.name}
          fill
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

        {/* Rating Stars mock */}
        <div className="mb-2 flex items-center gap-1 sm:mb-3">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-amber-400 sm:h-3.5 sm:w-3.5" />
            ))}
          </div>
          <span className="text-xs text-slate-400">({product.stockQuantity > 10 ? 12 : 4})</span>
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
