"use client";

import React from "react";
import type { SystemSettingsValues } from "@/lib/settings-validations";
import { Building2, Phone, Mail, MapPin, Clock, CreditCard } from "lucide-react";

interface GeneralSettingsTabProps {
  values: SystemSettingsValues;
  errors: Record<string, string>;
  onChange: <K extends keyof SystemSettingsValues>(key: K, value: SystemSettingsValues[K]) => void;
}

export default function GeneralSettingsTab({ values, errors, onChange }: GeneralSettingsTabProps) {
  return (
    <div className="space-y-6">
      {/* 1. Pravni i identifikacioni podaci */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#005B94]">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900">Pravni i identifikacioni podaci</h2>
            <p className="text-[11px] text-slate-500">Podaci o firmi koji se prikazuju u podnožju, predračunima i potvrdama porudžbina.</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700">
              Naziv prodavnice <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={values.storeName}
              onChange={(e) => onChange("storeName", e.target.value)}
              placeholder="Aqua Still Shop Zlatibor"
              className={`mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-xs font-semibold outline-none transition focus:ring-2 focus:ring-[#005B94]/20 ${
                errors.storeName ? "border-red-500 bg-red-50/30 text-red-900" : "border-slate-200 bg-slate-50/50 text-slate-900 focus:border-[#005B94]"
              }`}
            />
            {errors.storeName && <p className="mt-1 text-[11px] font-bold text-red-600">{errors.storeName}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Puni pravni naziv firme</label>
            <input
              type="text"
              value={values.legalName}
              onChange={(e) => onChange("legalName", e.target.value)}
              placeholder="Aqua Still Zlatibor d.o.o."
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-[#005B94] focus:ring-2 focus:ring-[#005B94]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Broj tekućeg računa</label>
            <div className="relative mt-1.5">
              <input
                type="text"
                value={values.bankAccount}
                onChange={(e) => onChange("bankAccount", e.target.value)}
                placeholder="160-0000000123456-78"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 font-mono text-xs text-slate-900 outline-none transition focus:border-[#005B94] focus:ring-2 focus:ring-[#005B94]/20"
              />
              <CreditCard className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">PIB (Poreski identifikacioni broj)</label>
            <input
              type="text"
              value={values.pib}
              onChange={(e) => onChange("pib", e.target.value)}
              placeholder="112233445"
              maxLength={15}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 font-mono text-xs text-slate-900 outline-none transition focus:border-[#005B94] focus:ring-2 focus:ring-[#005B94]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Matični broj (MB)</label>
            <input
              type="text"
              value={values.registrationNumber}
              onChange={(e) => onChange("registrationNumber", e.target.value)}
              placeholder="21345678"
              maxLength={15}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 font-mono text-xs text-slate-900 outline-none transition focus:border-[#005B94] focus:ring-2 focus:ring-[#005B94]/20"
            />
          </div>
        </div>
      </div>

      {/* 2. Lokacija i kontakt podaci */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900">Lokacija i kontakt podaci</h2>
            <p className="text-[11px] text-slate-500">Adresa salona, brojevi telefona i zvanične e-mail adrese za kupce.</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700">Ulica i broj</label>
            <input
              type="text"
              value={values.address}
              onChange={(e) => onChange("address", e.target.value)}
              placeholder="Magistralni put bb"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-[#005B94] focus:ring-2 focus:ring-[#005B94]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Mesto / Grad</label>
            <input
              type="text"
              value={values.city}
              onChange={(e) => onChange("city", e.target.value)}
              placeholder="Zlatibor"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-[#005B94] focus:ring-2 focus:ring-[#005B94]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Poštanski broj</label>
            <input
              type="text"
              value={values.postalCode}
              onChange={(e) => onChange("postalCode", e.target.value)}
              placeholder="31315"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 font-mono text-xs text-slate-900 outline-none transition focus:border-[#005B94] focus:ring-2 focus:ring-[#005B94]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Država</label>
            <input
              type="text"
              value={values.country}
              onChange={(e) => onChange("country", e.target.value)}
              placeholder="Srbija"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-[#005B94] focus:ring-2 focus:ring-[#005B94]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Kontakt telefon</label>
            <div className="relative mt-1.5">
              <input
                type="text"
                value={values.phone}
                onChange={(e) => onChange("phone", e.target.value)}
                placeholder="+381 31 123 456"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-[#005B94] focus:ring-2 focus:ring-[#005B94]/20"
              />
              <Phone className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Glavna e-mail adresa</label>
            <div className="relative mt-1.5">
              <input
                type="email"
                value={values.email}
                onChange={(e) => onChange("email", e.target.value)}
                placeholder="info@aquastill-zlatibor.rs"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none transition focus:ring-2 focus:ring-[#005B94]/20 ${
                  errors.email ? "border-red-500 bg-red-50/30 text-red-900" : "border-slate-200 bg-slate-50/50 text-slate-900 focus:border-[#005B94]"
                }`}
              />
              <Mail className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
            </div>
            {errors.email && <p className="mt-1 text-[11px] font-bold text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">E-mail korisničke podrške</label>
            <div className="relative mt-1.5">
              <input
                type="email"
                value={values.supportEmail}
                onChange={(e) => onChange("supportEmail", e.target.value)}
                placeholder="podrska@aquastill-zlatibor.rs"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none transition focus:ring-2 focus:ring-[#005B94]/20 ${
                  errors.supportEmail ? "border-red-500 bg-red-50/30 text-red-900" : "border-slate-200 bg-slate-50/50 text-slate-900 focus:border-[#005B94]"
                }`}
              />
              <Mail className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
            </div>
            {errors.supportEmail && <p className="mt-1 text-[11px] font-bold text-red-600">{errors.supportEmail}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Radno vreme</label>
            <div className="relative mt-1.5">
              <input
                type="text"
                value={values.workingHours}
                onChange={(e) => onChange("workingHours", e.target.value)}
                placeholder="Pon - Sub: 07:00 - 18:00"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-[#005B94] focus:ring-2 focus:ring-[#005B94]/20"
              />
              <Clock className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Regionalna podešavanja i lokalizacija */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <h2 className="text-sm font-black text-slate-900 pb-3 border-b border-slate-100">Regionalna podešavanja</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-bold text-slate-700">Valuta sistema</label>
            <input
              type="text"
              value={values.currency}
              disabled
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 font-bold text-xs text-slate-600 cursor-not-allowed"
            />
            <p className="mt-1 text-[10px] text-slate-500">Zvanična valuta obračuna u Republici Srbiji je RSD.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Lokalizacija</label>
            <input
              type="text"
              value={values.locale}
              disabled
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 font-mono text-xs text-slate-600 cursor-not-allowed"
            />
            <p className="mt-1 text-[10px] text-slate-500">Srpski jezik (sr-RS, ekavica).</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Vremenska zona</label>
            <input
              type="text"
              value={values.timezone}
              disabled
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 font-mono text-xs text-slate-600 cursor-not-allowed"
            />
            <p className="mt-1 text-[10px] text-slate-500">Europe/Belgrade (UTC+1 / UTC+2 letnje vreme).</p>
          </div>
        </div>
      </div>
    </div>
  );
}

