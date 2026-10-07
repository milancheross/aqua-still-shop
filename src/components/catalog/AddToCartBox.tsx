"use client";

import React, { useState } from "react";
import { ShoppingCart, Plus, Minus, Check } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/lib/cart-context";

interface AddToCartBoxProps {
  product: Product;
}

export default function AddToCartBox({ product }: AddToCartBoxProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const isAvailable = product.inStock && product.stockQuantity > 0;

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    setQuantity((prev) => Math.min(product.stockQuantity || 99, prev + 1));
  };

  const handleAddToCart = async () => {
    if (!isAvailable) return;
    await addToCart(product, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  if (!isAvailable) {
    return (
      <div className="pt-4 border-t border-slate-100">
        <button
          disabled
          className="w-full py-4 bg-slate-200 text-slate-500 font-bold rounded-2xl cursor-not-allowed text-sm uppercase tracking-wider"
        >
          Proizvod trenutno rasprodat
        </button>
      </div>
    );
  }

  return (
    <div className="pt-4 border-t border-slate-100 space-y-4">
      <div className="grid grid-cols-[auto_1fr] gap-3 sm:flex sm:items-center sm:gap-4">
        {/* Quantity Selector */}
        <div className="flex h-12 items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-1">
          <button
            onClick={handleDecrease}
            className="flex h-10 w-10 items-center justify-center hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            title="Smanji količinu"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center font-bold text-slate-900 text-sm">{quantity}</span>
          <button
            onClick={handleIncrease}
            className="w-10 h-10 flex items-center justify-center hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            title="Povećaj količinu"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className={`min-h-12 flex-1 rounded-2xl px-4 py-3 font-bold text-sm uppercase tracking-wider transition-all shadow-xl flex items-center justify-center gap-2 ${
            addedSuccess
              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25"
              : "bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-600/25 active:scale-[0.98]"
          }`}
        >
          {addedSuccess ? (
            <>
              <Check className="w-5 h-5" /> Dodato u korpu!
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" /> Dodaj u korpu
            </>
          )}
        </button>
      </div>
    </div>
  );
}
