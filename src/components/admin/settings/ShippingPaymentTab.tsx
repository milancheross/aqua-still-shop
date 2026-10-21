"use client";

import React from "react";
import type { SystemSettingsValues } from "@/lib/settings-validations";
import { Truck, Store, CreditCard, Banknote, ShieldAlert, CheckCircle2 } from "lucide-react";

interface ShippingPaymentTabProps {
  values: SystemSettingsValues;
  errors: Record<string, string>;
  onChange: <K extends keyof SystemSettingsValues>(key: K, value: SystemSettingsValues[K]) => void;
}

export default function ShippingPaymentTab({ values, errors, onChange }: ShippingPaymentTabProps) {
  return (
    <div className="space-y-6">
      {/* 1. Podešavanja dostave */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#F37021]">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900">Pravila dostave i transporta</h2>
            <p className="text-[11px] text-slate-500">Cene i uslovi isporuke kurirskom službom na teritoriji Srbije.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {/* Osnovna cena dostave */}
          <div>
            <label className="block text-xs font-bold text-slate-700">
              Osnovna cena dostave (RSD) <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1.5">
              <input
                type="number"
                min={0}
                step={10}
                value={values.shippingPrice}
                onChange={(e) => onChange("shippingPrice", Math.max(0, Number(e.target.value) || 0))}
                className={`w-full rounded-xl border px-3.5 py-2.5 font-bold text-xs outline-none transition focus:ring-2 focus:ring-[#005B94]/20 ${
                  errors.shippingPrice
                    ? "border-red-500 bg-red-50/30 text-red-900"
                    : "border-slate-200 bg-slate-50/50 text-slate-900 focus:border-[#005B94]"
                }`}
              />
              <span className="pointer-events-none absolute right-3 top-2.5 text-xs font-bold text-slate-400">RSD</span>
            </div>
            {errors.shippingPrice ? (
              <p className="mt-1 text-[11px] font-bold text-red-600">{errors.shippingPrice}</p>
            ) : (
              <p className="mt-1 text-[10.5px] text-slate-500">Primenjuje se na sve porudžbine koje ne ispunjavaju uslov besplatne dostave.</p>
            )}
          </div>

          {/* Prag za besplatnu dostavu */}
          <div>
            <label className="block text-xs font-bold text-slate-700">Prag za besplatnu dostavu (RSD)</label>
            <div className="relative mt-1.5">
              <input
                type="number"
                min={0}
                step={100}
                disabled={!values.enableFreeShipping}
                value={values.freeShippingThreshold ?? ""}
                onChange={(e) =>
                  onChange("freeShippingThreshold", e.target.value === "" ? null : Math.max(0, Number(e.target.value)))
                }
                placeholder="5000"
                className={`w-full rounded-xl border px-3.5 py-2.5 font-bold text-xs outline-none transition focus:ring-2 focus:ring-[#005B94]/20 ${
                  !values.enableFreeShipping
                    ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                    : errors.freeShippingThreshold
                    ? "border-red-500 bg-red-50/30 text-red-900"
                    : "border-slate-200 bg-slate-50/50 text-slate-900 focus:border-[#005B94]"
                }`}
              />
              <span className="pointer-events-none absolute right-3 top-2.5 text-xs font-bold text-slate-400">RSD</span>
            </div>
            {errors.freeShippingThreshold && (
              <p className="mt-1 text-[11px] font-bold text-red-600">{errors.freeShippingThreshold}</p>
            )}
          </div>

          {/* Prekidač: Omogući besplatnu dostavu */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={values.enableFreeShipping}
                onChange={(e) => onChange("enableFreeShipping", e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded text-[#005B94] focus:ring-[#005B94]"
              />
              <div>
                <span className="text-xs font-bold text-slate-900">Uključi besplatnu dostavu preko praga</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Kada je uključeno, kupcima čija korpa prelazi definisani iznos neće se naplaćivati trošak dostave.
                </p>
              </div>
            </label>
          </div>

          {/* Prekidač: Lično preuzimanje u radnji */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={values.allowStorePickup}
                onChange={(e) => onChange("allowStorePickup", e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded text-[#005B94] focus:ring-[#005B94]"
              />
              <div>
                <span className="text-xs font-bold text-slate-900">Opcija: Preuzimanje u radnji (Zlatibor)</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Kupci mogu izabrati preuzimanje u prodavnici narednog radnog dana (trošak dostave je uvek 0 RSD).
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Primer obračuna */}
        <div className="mt-5 rounded-xl border border-cyan-100 bg-cyan-50/50 p-4 text-xs text-slate-700">
          <p className="font-bold text-cyan-900">Trenutni algoritam obračuna porudžbine na serveru:</p>
          <ul className="mt-1.5 list-inside list-disc space-y-1 text-[11px] text-slate-600">
            <li>
              Porudžbina za dostavu kurirskom službom ispod {values.freeShippingThreshold || 0} RSD obračunava se sa{" "}
              <strong>{values.shippingPrice} RSD</strong> dostave.
            </li>
            <li>
              {values.enableFreeShipping && values.freeShippingThreshold ? (
                <span>
                  Porudžbina od <strong>{values.freeShippingThreshold} RSD</strong> ili više dobija{" "}
                  <strong className="text-emerald-700">besplatnu dostavu (0 RSD)</strong>.
                </span>
              ) : (
                <span>Besplatna dostava je trenutno isključena.</span>
              )}
            </li>
            <li>Lično preuzimanje u radnji uvek ima cenu dostave <strong>0 RSD</strong>.</li>
          </ul>
        </div>
      </div>

      {/* 2. Metode plaćanja */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900">Metode plaćanja</h2>
            <p className="text-[11px] text-slate-500">Upravljanje podržanim opcijama plaćanja na stranici za naplatu (Checkout).</p>
          </div>
        </div>

        <div className="mt-5 space-y-3.5">
          {/* Metoda 1: Plaćanje pouzećem */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm text-slate-700 border border-slate-200">
                <Banknote className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Plaćanje pouzećem (gotovinom)</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    <CheckCircle2 className="h-3 w-3" /> Aktivno
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Kupac plaća gotovinom kuriru pri preuzimanju pošiljke ili na kasi u prodavnici.
                </p>
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer self-start sm:self-auto">
              <input
                type="checkbox"
                checked={values.cashOnDeliveryEnabled}
                onChange={(e) => onChange("cashOnDeliveryEnabled", e.target.checked)}
                className="h-4 w-4 rounded text-[#005B94] focus:ring-[#005B94]"
              />
              <span>Dozvoljeno</span>
            </label>
          </div>

          {/* Metoda 2: Virmansko plaćanje */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm text-slate-700 border border-slate-200">
                <Store className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Uplata na račun / Predračun za pravna lica</span>
                  {values.wireTransferEnabled ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      <CheckCircle2 className="h-3 w-3" /> Aktivno
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      Isključeno
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Automatski generiše instrukcije za plaćanje na račun {values.bankAccount || "160-..."}.
                </p>
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer self-start sm:self-auto">
              <input
                type="checkbox"
                checked={values.wireTransferEnabled}
                onChange={(e) => onChange("wireTransferEnabled", e.target.checked)}
                className="h-4 w-4 rounded text-[#005B94] focus:ring-[#005B94]"
              />
              <span>Dozvoljeno</span>
            </label>
          </div>

          {/* Metoda 3: Platne kartice online */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 p-4 opacity-80">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm text-slate-400 border border-slate-200">
                <CreditCard className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Online plaćanje platnim karticama</span>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                    U pripremi
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Integracija sa bankarskim procesorom (Banca Intesa / ChipCard / AllSecure) je u fazi razvoja.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-500" /> Nije dostupno
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

