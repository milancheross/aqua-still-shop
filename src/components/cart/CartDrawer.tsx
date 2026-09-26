"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Truck } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart } = useCart();

  if (!isCartOpen) return null;

  const freeShippingThreshold = cart.freeShippingThreshold;
  const progressPercent = Math.min(100, (cart.subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cart.subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-cyan-600" />
              <h2 className="text-lg font-black text-slate-900">Vaša korpa</h2>
              <span className="text-xs bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded-full">
                {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="px-6 py-3 bg-cyan-50 border-b border-cyan-100 text-xs">
            <div className="flex items-center justify-between mb-1.5 font-bold text-slate-800">
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

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 divide-y divide-slate-100">
            {cart.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-slate-900 font-bold">Vaša korpa je prazna</p>
                  <p className="text-xs text-slate-500 mt-1">Pregledajte katalog i dodajte željene artikle.</p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl transition-colors shadow-md"
                >
                  Započni kupovinu
                </button>
              </div>
            ) : (
              cart.items.map((item) => {
                const currentPrice = item.product.salePrice ?? item.product.price;
                return (
                  <div key={item.product.id} className="pt-4 first:pt-0 flex gap-4 items-center">
                    <div className="relative w-20 h-20 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden shrink-0 p-2">
                      <Image 
                        src={item.product.images[0]} 
                        alt={item.product.name} 
                        fill 
                        className="object-contain p-1" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{item.product.name}</h4>
                      <p className="text-xs font-black text-cyan-700 mt-1">{formatPrice(currentPrice)}</p>

                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 hover:bg-slate-200 text-slate-600 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold text-slate-900">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 hover:bg-slate-200 text-slate-600 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Remove item */}
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-slate-400 hover:text-red-600 p-1.5 transition-colors"
                          title="Ukloni artikal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Summary */}
          {cart.items.length > 0 && (
            <div className="border-t border-slate-100 bg-slate-50 px-6 py-5 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Međuzbir</span>
                  <span className="font-bold text-slate-900">{formatPrice(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Dostava</span>
                  <span className="font-bold text-slate-900">
                    {cart.shippingCost === 0 ? "Besplatna" : formatPrice(cart.shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Ukupno za uplatu</span>
                  <span className="text-cyan-700">{formatPrice(cart.total)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  href="/korpa"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-3 bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-bold text-xs rounded-xl text-center transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  Pregled korpe
                </Link>
                <Link
                  href="/placanje"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl text-center transition-colors shadow-md flex items-center justify-center gap-1.5"
                >
                  Na plaćanje <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <button
                onClick={() => setIsCartOpen(false)}
                className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors pt-1"
              >
                Nastavi kupovinu
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
