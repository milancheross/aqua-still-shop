"use client";

import React from "react";
import type { SystemSettingsValues } from "@/lib/settings-validations";
import { Activity, Share2, Truck, CreditCard, CheckCircle2 } from "lucide-react";

interface IntegrationsTabProps {
  values: SystemSettingsValues;
  errors: Record<string, string>;
  onChange: <K extends keyof SystemSettingsValues>(key: K, value: SystemSettingsValues[K]) => void;
}

export default function IntegrationsTab({ values, onChange }: IntegrationsTabProps) {
  return (
    <div className="space-y-6">
      {/* 1. Analitika i merenje poseta */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900">Analitika i praćenje konverzija</h2>
            <p className="text-[11px] text-slate-500">Povežite tracking ID-jeve za praćenje poseta i kupovina na sajtu.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {/* Google Analytics */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Google Analytics 4 (GA4)</span>
              {values.googleAnalyticsId ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  <CheckCircle2 className="h-3 w-3" /> Povezano
                </span>
              ) : (
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  Nije uneto
                </span>
              )}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">Measurement ID za praćenje događaja i porudžbina.</p>
            <input
              type="text"
              value={values.googleAnalyticsId}
              onChange={(e) => onChange("googleAnalyticsId", e.target.value)}
              placeholder="G-XXXXXXXXXX"
              className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 font-mono text-xs text-slate-900 outline-none transition focus:border-[#005B94] focus:ring-2 focus:ring-[#005B94]/20"
            />
          </div>

          {/* Meta Pixel */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Meta (Facebook/Instagram) Pixel</span>
              {values.metaPixelId ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  <CheckCircle2 className="h-3 w-3" /> Povezano
                </span>
              ) : (
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  Nije uneto
                </span>
              )}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">ID piksela za praćenje kampanja na društvenim mrežama.</p>
            <input
              type="text"
              value={values.metaPixelId}
              onChange={(e) => onChange("metaPixelId", e.target.value)}
              placeholder="123456789012345"
              className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 font-mono text-xs text-slate-900 outline-none transition focus:border-[#005B94] focus:ring-2 focus:ring-[#005B94]/20"
            />
          </div>
        </div>
      </div>

      {/* 2. Spoljne logističke i platne integracije (realan status) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
            <Share2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900">Spoljni servisi i integracije</h2>
            <p className="text-[11px] text-slate-500">Pregled stanja povezanih kurirskih službi i procesora plaćanja.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {/* Kurirske službe */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-slate-600" />
                <span className="text-xs font-bold text-slate-900">Kurirske službe (Bex / Post Express)</span>
              </div>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                Manuelna otprema
              </span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
              Adresnice se trenutno generišu manuelno iz kontrolne table porudžbina. Direktan API manifest za automatsko zakazivanje kurira je u pripremi.
            </p>
          </div>

          {/* Platni procesori */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-slate-600" />
                <span className="text-xs font-bold text-slate-900">Bankarski platni gateway</span>
              </div>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                U pripremi
              </span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
              Podrška za prihvatanje Dina, Visa i Mastercard platnih kartica biće aktivirana nakon potpisivanja ugovora sa procesorom.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
