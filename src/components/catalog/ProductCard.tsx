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
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-cyan-200 transition-all duration-300 flex flex-col h-full relative">
      {/* Discount Badge */}
      {discount > 0 && (
        <span className="absolute top-3 left-3 z-10 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-md shadow-sm">
          -{discount}%
        </span>
      )}

      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-50 p-6">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <Link href={`/proizvod/${product.slug}`} className="block mb-2">
          <h3 className="text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-cyan-600 transition-colors h-10">
            {product.name}
          </h3>
        </Link>

        {/* Rating Stars mock */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
            ))}
          </div>
          <span className="text-xs text-slate-400">({product.stockQuantity > 10 ? 12 : 4})</span>
        </div>

        {/* Price & Cart */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            {product.salePrice ? (
              <div className="space-y-0.5">
                <span className="text-xs text-slate-400 line-through block">{formatPrice(product.price)}</span>
                <span className="text-base font-black text-red-600 block">{formatPrice(product.salePrice)}</span>
              </div>
            ) : (
              <span className="text-base font-black text-slate-900 block">{formatPrice(product.price)}</span>
            )}
          </div>

          <button
            onClick={() => addToCart(product)}
            className="p-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl active:scale-95 transition-all shadow-md hover:shadow-cyan-200"
            title="Dodaj u korpu"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
