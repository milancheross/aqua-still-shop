"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ArrowRight, Truck, ShieldCheck, CheckCircle2, AlertCircle, Store } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";
import { createOrderAction } from "@/actions/checkout-actions";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    postalCode: "",
    notes: "",
    paymentMethod: "cash_on_delivery",
    shippingMethod: "courier", // "courier" | "store_pickup"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isStorePickup = formData.shippingMethod === "store_pickup";
  const dynamicShippingCost = isStorePickup ? 0 : cart.shippingCost;
  const dynamicTotal = cart.subtotal + dynamicShippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (cart.items.length === 0) {
      setErrorMessage("Vaša korpa je prazna.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createOrderAction({
        ...formData,
        items: cart.items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      });

      if (result.success) {
        clearCart();
        router.push(`/porudzbina/${result.orderNumber}?key=${encodeURIComponent(result.confirmationToken)}`);
      }
    } catch (err: unknown) {
      setErrorMessage((err instanceof Error ? err.message : null) || "Došlo je do greške prilikom slanja porudžbine.");
      setIsSubmitting(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg space-y-6">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Vaša korpa je prazna</h1>
        <p className="text-slate-600 text-sm">Nemate artikala u korpi za proces naplate.</p>
        <Link 
          href="/katalog" 
          className="inline-block px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm rounded-2xl transition-colors shadow-lg"
        >
          Pregledaj katalog
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">Završetak kupovine (Checkout)</h1>
          <p className="text-slate-500 text-sm mt-1">Izaberite način preuzimanja i popunite podatke.</p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3 text-sm font-bold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* SHIPPING & CUSTOMER FORM */}
          <div className="lg:col-span-7 space-y-6">
            {/* SHIPPING METHOD SELECTION */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-lg font-black text-slate-900 pb-4 border-b border-slate-100 flex items-center gap-2">
                <Truck className="w-5 h-5 text-cyan-600" /> Način preuzimanja
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`flex flex-col p-4 border-2 rounded-2xl cursor-pointer transition-all ${!isStorePickup ? "border-cyan-500 bg-cyan-50/50" : "border-slate-200 hover:border-slate-300"}`}>
                  <div className="flex items-center space-x-3 mb-2">
                    <input 
                      type="radio" 
                      name="shippingMethod" 
                      value="courier" 
                      checked={!isStorePickup} 
                      onChange={handleChange}
                      className="w-4 h-4 text-cyan-600 focus:ring-cyan-500"
                    />
                    <span className="text-sm font-black text-slate-900">Dostava na adresu</span>
                  </div>
                  <span className="text-xs text-slate-500 pl-7">Brzom poštom na vašu kućnu adresu (besplatno preko 5.000 RSD).</span>
                </label>

                <label className={`flex flex-col p-4 border-2 rounded-2xl cursor-pointer transition-all ${isStorePickup ? "border-cyan-500 bg-cyan-50/50" : "border-slate-200 hover:border-slate-300"}`}>
                  <div className="flex items-center space-x-3 mb-2">
                    <input 
                      type="radio" 
                      name="shippingMethod" 
                      value="store_pickup" 
                      checked={isStorePickup} 
                      onChange={handleChange}
                      className="w-4 h-4 text-cyan-600 focus:ring-cyan-500"
                    />
                    <span className="text-sm font-black text-slate-900 flex items-center gap-1.5"><Store className="w-4 h-4 text-cyan-600" /> Preuzimanje u radnji</span>
                  </div>
                  <span className="text-xs text-slate-500 pl-7">Spremno za preuzimanje narednog dana u salonu (Besplatno).</span>
                </label>
              </div>
            </div>

            {/* CUSTOMER INFO FORM */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-slate-900 pb-4 border-b border-slate-100 flex items-center gap-2">
                {isStorePickup ? <Store className="w-5 h-5 text-cyan-600" /> : <Truck className="w-5 h-5 text-cyan-600" />} 
                {isStorePickup ? "Kontakt podaci za preuzimanje" : "Adresa za dostavu"}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Ime *</label>
                  <input 
                    type="text" 
                    name="firstName" 
                    required 
                    value={formData.firstName} 
                    onChange={handleChange}
                    placeholder="Petar" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-cyan-500 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Prezime *</label>
                  <input 
                    type="text" 
                    name="lastName" 
                    required 
                    value={formData.lastName} 
                    onChange={handleChange}
                    placeholder="Petrović" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Email adresa *</label>
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    value={formData.email} 
                    onChange={handleChange}
                    placeholder="petar@example.com" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-cyan-500 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Telefon *</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    required 
                    value={formData.phone} 
                    onChange={handleChange}
                    placeholder="064 123 4567" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              {!isStorePickup && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Ulica i broj *</label>
                    <input 
                      type="text" 
                      name="street" 
                      required={!isStorePickup}
                      value={formData.street} 
                      onChange={handleChange}
                      placeholder="Kralja Petra 15" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-cyan-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">Grad / Mesto *</label>
                      <input 
                        type="text" 
                        name="city" 
                        required={!isStorePickup}
                        value={formData.city} 
                        onChange={handleChange}
                        placeholder="Zlatibor / Užice" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-cyan-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">Poštanski broj *</label>
                      <input 
                        type="text" 
                        name="postalCode" 
                        required={!isStorePickup}
                        value={formData.postalCode} 
                        onChange={handleChange}
                        placeholder="31315" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-cyan-500 outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {isStorePickup && (
                <div className="p-4 bg-cyan-50 rounded-2xl border border-cyan-100 text-xs text-cyan-900 space-y-1">
                  <span className="font-bold block">Lokacija preuzimanja:</span>
                  <p>Aqua Still Zlatibor (Salon / Magacin). Porudžbina će biti spremna za preuzimanje narednog dana u toku radnog vremena.</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Napomena za porudžbinu (opciono)</label>
                <textarea 
                  name="notes" 
                  rows={3} 
                  value={formData.notes} 
                  onChange={handleChange}
                  placeholder="Npr. vreme preuzimanja / dostave..." 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-cyan-500 outline-none resize-none"
                />
              </div>
            </div>

            {/* PAYMENT METHOD */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-lg font-black text-slate-900 pb-4 border-b border-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-600" /> Način plaćanja
              </h2>

              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-4 bg-cyan-50 border-2 border-cyan-500 rounded-2xl cursor-pointer">
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="cash_on_delivery" 
                    defaultChecked 
                    className="w-4 h-4 text-cyan-600 focus:ring-cyan-500"
                  />
                  <div>
                    <span className="text-sm font-black text-slate-900 block">
                      {isStorePickup ? "Plaćanje prilikom preuzimanja u radnji" : "Plaćanje pouzećem (gotovinom kuriru)"}
                    </span>
                    <span className="text-xs text-slate-500">
                      {isStorePickup ? "Plaćate gotovinom ili karticom u salonu prilikom preuzimanja." : "Plaćate gotovinom kuriru brze pošte."}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* ORDER SUMMARY SIDEBAR */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 sticky top-28">
              <h2 className="text-lg font-black text-slate-900 pb-4 border-b border-slate-100">Pregled vaše porudžbine</h2>

              <div className="space-y-4 max-h-72 overflow-y-auto pr-2 divide-y divide-slate-100">
                {cart.items.map((item) => {
                  const currentPrice = item.product.salePrice ?? item.product.price;
                  return (
                    <div key={item.product.id} className="pt-4 first:pt-0 flex items-center gap-3">
                      <div className="relative w-14 h-14 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden shrink-0 p-1">
                        <Image src={item.product.images[0]} alt={item.product.name} fill className="object-contain p-0.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.product.name}</h4>
                        <p className="text-[11px] text-slate-500">Količina: {item.quantity} {item.product.unit}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-slate-900">{formatPrice(currentPrice * item.quantity)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2.5 pt-4 border-t border-slate-100 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Međuzbir</span>
                  <span className="font-bold text-slate-900">{formatPrice(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Dostava / Preuzimanje</span>
                  <span className="font-bold text-slate-900">
                    {dynamicShippingCost === 0 ? <strong className="text-emerald-600">Besplatno</strong> : formatPrice(dynamicShippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-black text-slate-900 pt-3 border-t border-slate-200">
                  <span>Ukupno</span>
                  <span className="text-cyan-700">{formatPrice(dynamicTotal)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 text-white font-bold rounded-2xl transition-all shadow-xl shadow-cyan-600/25 flex items-center justify-center gap-2 text-base"
              >
                {isSubmitting ? "Obrada u toku..." : "Potvrdi porudžbinu"} <ArrowRight className="w-5 h-5" />
              </button>

              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                Klikom na dugme potvrđujete da ste saglasni sa uslovima kupovine i politikom privatnosti Aqua Still Zlatibor.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
