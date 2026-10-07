"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Truck, Check } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();

  const freeShippingThreshold = cart.freeShippingThreshold;
  const progressPercent = Math.min(100, (cart.subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cart.subtotal);

  return (
    <div className="min-h-screen bg-slate-50 py-5 sm:py-12">
      <div className="container mx-auto max-w-5xl px-3 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Korpa proizvoda</h1>
            <p className="text-slate-500 text-sm mt-1">Pregledajte izabrane artikle pre prelaska na plaćanje.</p>
          </div>
          {cart.items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors self-start sm:self-auto"
            >
              Isprazni korpu
            </button>
          )}
        </div>

        {cart.items.length === 0 ? (
          <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-12">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">Vaša korpa je trenutno prazna</h2>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">Pregledajte naš bogat asortiman alata, vodovoda, kupatila i opreme i dodajte artikle.</p>
            </div>
            <div>
              <Link
                href="/katalog"
                className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm rounded-2xl transition-colors shadow-lg"
              >
                Započni kupovinu <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Items List */}
            <div className="lg:col-span-8 space-y-4">
              {/* Free Shipping Progress */}
              <div className="bg-cyan-50 border border-cyan-100 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-1.5 text-cyan-800">
                    <Truck className="w-4 h-4" /> Besplatna dostava
                  </span>
                  <span>
                    {cart.subtotal >= freeShippingThreshold ? (
                      <span className="text-emerald-600 font-black">Ostvarili ste besplatnu dostavu!</span>
                    ) : (
                      <span>Još <strong className="text-cyan-700">{formatPrice(remainingForFreeShipping)}</strong> do besplatne dostave</span>
                    )}
                  </span>
                </div>
                <div className="w-full bg-cyan-200/60 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-cyan-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Items Card */}
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white px-3 shadow-sm divide-y divide-slate-100 sm:px-6">
                {cart.items.map((item) => {
                  const currentPrice = item.product.salePrice ?? item.product.price;
                  return (
                    <div key={item.product.id} className="flex flex-col gap-3 py-4 first:pt-4 last:pb-4 sm:flex-row sm:items-center sm:gap-4 sm:py-6">
                      <div className="relative h-20 w-20 sm:h-24 sm:w-24 bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden shrink-0 p-2">
                        <Image src={item.product.images[0]} alt={item.product.name} fill className="object-contain p-2" />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.product.brand}</span>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.product.name}</h3>
                        <p className="text-xs font-mono text-slate-400">Šifra: {item.product.sku}</p>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0">
                        <span className="text-base font-black text-cyan-700">{formatPrice(currentPrice * item.quantity)}</span>
                        
                        <div className="flex items-center gap-3">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="p-2 hover:bg-slate-200 text-slate-600 transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-xs font-bold text-slate-900">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="p-2 hover:bg-slate-200 text-slate-600 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            title="Ukloni artikal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8 lg:sticky lg:top-28">
                <h2 className="text-base font-black text-slate-900 pb-4 border-b border-slate-100">Pregled troškova</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Međuzbir</span>
                    <span className="font-bold text-slate-900">{formatPrice(cart.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>PDV (uračunat)</span>
                    <span className="font-bold text-slate-900">{formatPrice(cart.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Dostava</span>
                    <span className="font-bold text-slate-900">
                      {cart.shippingCost === 0 ? <strong className="text-emerald-600">Besplatna</strong> : formatPrice(cart.shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-slate-900 pt-3 border-t border-slate-200">
                    <span>Ukupno</span>
                    <span className="text-cyan-700">{formatPrice(cart.total)}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Link
                    href="/placanje"
                    className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-cyan-600/25 flex items-center justify-center gap-2 text-sm text-center"
                  >
                    Nastavi na plaćanje <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/katalog"
                    className="w-full py-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-2xl transition-all text-xs text-center block"
                  >
                    Nastavi kupovinu
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
