"use client";

import React from "react";
import type { SystemSettingsValues } from "@/lib/settings-validations";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { Search, Info } from "lucide-react";

interface SeoSettingsTabProps {
  values: SystemSettingsValues;
  errors: Record<string, string>;
  onChange: <K extends keyof SystemSettingsValues>(key: K, value: SystemSettingsValues[K]) => void;
}

export default function SeoSettingsTab({ values, onChange }: SeoSettingsTabProps) {
  const descLength = (values.defaultSeoDescription || "").length;

  return (
    <div className="space-y-6">
      {/* 1. Globalni SEO metapodaci */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#005B94]">
            <Search className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900">Podrazumevani SEO i Open Graph</h2>
            <p className="text-[11px] text-slate-500">Globalni naslov i opis koji se prikazuju u Google pretrazi i pri deljenju na mrežama.</p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">Podrazumevani SEO naslov (Title tag)</label>
              <span className="text-[10px] text-slate-400">{(values.defaultSeoTitle || "").length} / 70 karaktera</span>
            </div>
            <input
              type="text"
              value={values.defaultSeoTitle}
              onChange={(e) => onChange("defaultSeoTitle", e.target.value)}
              placeholder="Aqua Still Zlatibor | Alati, vodovodni materijal i kupatilska oprema"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-[#005B94] focus:ring-2 focus:ring-[#005B94]/20"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">Podrazumevani meta opis (Meta description)</label>
              <span className={`text-[10px] ${descLength > 160 ? "text-amber-600 font-bold" : "text-slate-400"}`}>
                {descLength} / 160 karaktera
              </span>
            </div>
            <textarea
              rows={3}
              value={values.defaultSeoDescription}
              onChange={(e) => onChange("defaultSeoDescription", e.target.value)}
              placeholder="Prodavnica profesionalnih alata, vodovodnog materijala, opreme za kupatila i navodnjavanje na Zlatiboru..."
              className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-[#005B94] focus:ring-2 focus:ring-[#005B94]/20"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700">Naziv sajta za deljenje (og:site_name)</label>
              <input
                type="text"
                value={values.siteShareName}
                onChange={(e) => onChange("siteShareName", e.target.value)}
                placeholder="Aqua Still Shop"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-[#005B94] focus:ring-2 focus:ring-[#005B94]/20"
              />
            </div>

            {/* Upload Open Graph slike */}
            <div>
              <ImageUploadField
                label="Podrazumevana slika za društvene mreže (og:image)"
                value={values.defaultOgImage}
                onChange={(url) => onChange("defaultOgImage", url)}
                onRemove={() => onChange("defaultOgImage", "")}
              />
            </div>
          </div>
        </div>

        {/* Pravila prioriteta */}
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-xs text-slate-700">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#005B94]" />
          <div>
            <span className="font-bold text-[#005B94]">Pravilo prioriteta metapodataka:</span>
            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">
              Ova globalna podešavanja služe kao rezervna osnova. Pojedinačni proizvodi, kategorije i CMS stranice sa unetim specifičnim SEO naslovom i opisom imaju <strong>uvek prioritet</strong> u pretraživačima i na društvenim mrežama.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
