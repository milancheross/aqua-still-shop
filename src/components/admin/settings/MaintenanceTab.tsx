"use client";

import React, { useState, useTransition } from "react";
import type { SystemSettingsValues } from "@/lib/settings-validations";
import { revalidateSiteCacheAction } from "@/actions/settings-actions";
import {
  Wrench,
  RefreshCw,
  Database,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Layers,
} from "lucide-react";

interface MaintenanceTabProps {
  values: SystemSettingsValues;
  errors: Record<string, string>;
  onChange: <K extends keyof SystemSettingsValues>(key: K, value: SystemSettingsValues[K]) => void;
}

export default function MaintenanceTab({ values, onChange }: MaintenanceTabProps) {
  const [revalidateResult, setRevalidateResult] = useState<{ success: boolean; message: string; timestamp?: string } | null>(null);
  const [isRevalidating, startRevalidate] = useTransition();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleRevalidateCache = () => {
    setRevalidateResult(null);
    startRevalidate(async () => {
      const res = await revalidateSiteCacheAction();
      setRevalidateResult(res);
    });
  };

  const handleToggleMaintenance = () => {
    if (!values.maintenanceMode) {
      // Korisnik želi da UKLJUČI režim održavanja — tražimo potvrdu
      setShowConfirmModal(true);
    } else {
      // Isključivanje je bezbedno
      onChange("maintenanceMode", false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Režim održavanja */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900">Režim održavanja (Maintenance Mode)</h2>
            <p className="text-[11px] text-slate-500">Privremeno zatvaranje javnog webshopa za posetioce tokom radova i ažuriranja.</p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4.5 transition ${
              values.maintenanceMode
                ? "border-amber-300 bg-amber-50/60"
                : "border-slate-200 bg-slate-50/60"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold ${
                  values.maintenanceMode ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-600"
                }`}
              >
                <Wrench className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900">Status režima održavanja:</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                      values.maintenanceMode
                        ? "bg-amber-200 text-amber-900"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {values.maintenanceMode ? "Aktivno (Sajt zatvoren)" : "Isključeno (Sajt aktivan)"}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-600">
                  {values.maintenanceMode
                    ? "Anonimni posetioci vide obaveštenje o radovima. Prijavljeni administratori i dalje mogu normalno da pristupaju administraciji i testiraju prodavnicu."
                    : "Javni webshop je u potpunosti dostupan svim kupcima."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleMaintenance}
              className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-black transition active:scale-95 ${
                values.maintenanceMode
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                  : "bg-amber-600 text-white hover:bg-amber-700 shadow-md shadow-amber-600/20"
              }`}
            >
              {values.maintenanceMode ? "Isključi režim održavanja" : "Uključi režim održavanja"}
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Poruka za posetioce tokom održavanja</label>
            <textarea
              rows={2}
              value={values.maintenanceNotice}
              onChange={(e) => onChange("maintenanceNotice", e.target.value)}
              placeholder="U toku su planirani radovi na održavanju sistema. Vraćamo se uskoro!"
              className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-[#005B94] focus:ring-2 focus:ring-[#005B94]/20"
            />
          </div>
        </div>
      </div>

      {/* 2. Keš i performanse sajta */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
            <RefreshCw className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900">Osvežavanje keša sajta</h2>
            <p className="text-[11px] text-slate-500">Forsirana revalidacija statičkih Next.js stranica i keširanih podataka.</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div>
            <h3 className="text-xs font-bold text-slate-900">Revalidacija javnih ruta (On-Demand Revalidation)</h3>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Primenjuje promene na početnoj stranici, katalogu, brendovima i layout-u bez čekanja na istek TTL-a.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRevalidateCache}
            disabled={isRevalidating}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#005B94] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#005B94]/20 transition hover:bg-[#004775] disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRevalidating ? "animate-spin" : ""}`} />
            <span>{isRevalidating ? "Osvežavanje..." : "Osveži keš sajta"}</span>
          </button>
        </div>

        {revalidateResult && (
          <div
            className={`mt-4 flex items-start gap-2.5 rounded-xl p-3.5 text-xs ${
              revalidateResult.success
                ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border border-red-200 bg-red-50 text-red-900"
            }`}
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <div>
              <p className="font-bold">{revalidateResult.message}</p>
              {revalidateResult.timestamp && (
                <p className="text-[10px] text-slate-500 mt-0.5">Vreme osvežavanja: {revalidateResult.timestamp}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Dijagnostika i status sistema */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <h2 className="text-sm font-black text-slate-900 pb-3 border-b border-slate-100">Dijagnostika sistema</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-[#005B94]" />
              <span className="text-[11px] font-bold text-slate-500">Baza podataka</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-900">PostgreSQL (Prisma)</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#005B94]" />
              <span className="text-[11px] font-bold text-slate-500">Aplikacioni frejmvork</span>
            </div>
            <div className="mt-2">
              <span className="text-xs font-bold text-slate-900">Next.js 16 (App Router)</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#005B94]" />
              <span className="text-[11px] font-bold text-slate-500">Vremenska zona</span>
            </div>
            <div className="mt-2">
              <span className="text-xs font-bold text-slate-900">Europe/Belgrade</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#005B94]" />
              <span className="text-[11px] font-bold text-slate-500">Verzija zapisa (Lock)</span>
            </div>
            <div className="mt-2">
              <span className="text-xs font-mono font-bold text-slate-900">v{values.version}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal potvrde za uključivanje režima održavanja */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">Uključiti režim održavanja?</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Uključivanjem ovog režima, svi posetioci javnog dela webshopa videće ekran sa obaveštenjem o radovima.
              Administratorski panel i magacin ostaju <strong>potpuno dostupni</strong> prijavljenom administrativnom osoblju.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
              >
                Otkaži
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange("maintenanceMode", true);
                  setShowConfirmModal(false);
                }}
                className="rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-600/25 transition hover:bg-amber-700"
              >
                Potvrdi i uključi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
