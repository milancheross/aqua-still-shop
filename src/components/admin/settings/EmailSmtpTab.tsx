"use client";

import React, { useState, useTransition } from "react";
import type { SystemSettingsValues } from "@/lib/settings-validations";
import { testSmtpConnectionAction } from "@/actions/settings-actions";
import { Mail, KeyRound, Server, CheckCircle2, AlertCircle, Loader2, SendHorizontal, Trash2 } from "lucide-react";

interface EmailSmtpTabProps {
  values: SystemSettingsValues;
  errors: Record<string, string>;
  onChange: <K extends keyof SystemSettingsValues>(key: K, value: SystemSettingsValues[K]) => void;
}

export default function EmailSmtpTab({ values, errors, onChange }: EmailSmtpTabProps) {
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isTesting, startTransition] = useTransition();

  const handleTestConnection = () => {
    setTestResult(null);
    startTransition(async () => {
      try {
        const res = await testSmtpConnectionAction(values.smtpHost, values.smtpPort);
        setTestResult(res);
      } catch (err) {
        setTestResult({
          success: false,
          message: err instanceof Error ? err.message : "Testiranje konekcije nije uspelo.",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. SMTP server parametri */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900">Konfiguracija SMTP servera</h2>
            <p className="text-[11px] text-slate-500">Povezivanje sa mail serverom za slanje obaveštenja o porudžbinama i upitima.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700">SMTP Host / Server</label>
            <input
              type="text"
              value={values.smtpHost}
              onChange={(e) => onChange("smtpHost", e.target.value)}
              placeholder="mail.aquastill-zlatibor.rs ili smtp.gmail.com"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 font-mono text-xs text-slate-900 outline-none transition focus:border-[#005B94] focus:ring-2 focus:ring-[#005B94]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">SMTP Port</label>
            <input
              type="number"
              value={values.smtpPort}
              onChange={(e) => onChange("smtpPort", Number(e.target.value) || 587)}
              placeholder="587"
              className={`mt-1.5 w-full rounded-xl border px-3.5 py-2.5 font-mono text-xs text-slate-900 outline-none transition focus:ring-2 focus:ring-[#005B94]/20 ${
                errors.smtpPort ? "border-red-500 bg-red-50/30 text-red-900" : "border-slate-200 bg-slate-50/50 focus:border-[#005B94]"
              }`}
            />
            {errors.smtpPort && <p className="mt-1 text-[11px] font-bold text-red-600">{errors.smtpPort}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">SMTP Korisničko ime</label>
            <input
              type="text"
              value={values.smtpUser}
              onChange={(e) => onChange("smtpUser", e.target.value)}
              placeholder="info@aquastill-zlatibor.rs"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-[#005B94] focus:ring-2 focus:ring-[#005B94]/20"
            />
          </div>

          {/* SMTP Lozinka sa strogim bezbednosnim pravilima */}
          <div>
            <label className="block text-xs font-bold text-slate-700">
              SMTP Lozinka
              {values.hasSmtpPassword && !values.clearSmtpPassword && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" /> Podešena
                </span>
              )}
            </label>
            <div className="relative mt-1.5">
              <input
                type="password"
                value={values.newSmtpPassword || ""}
                onChange={(e) => {
                  onChange("newSmtpPassword", e.target.value);
                  if (values.clearSmtpPassword) onChange("clearSmtpPassword", false);
                }}
                placeholder={values.hasSmtpPassword && !values.clearSmtpPassword ? "•••••••••••• (zadrži postojeću)" : "Unesite novu lozinku"}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-[#005B94] focus:ring-2 focus:ring-[#005B94]/20"
              />
              <KeyRound className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
            </div>
            {values.hasSmtpPassword && !values.clearSmtpPassword && (
              <button
                type="button"
                onClick={() => onChange("clearSmtpPassword", true)}
                className="mt-1 inline-flex items-center gap-1 text-[10.5px] font-bold text-red-600 hover:underline"
              >
                <Trash2 className="h-3 w-3" /> Ukloni sačuvanu lozinku
              </button>
            )}
            {values.clearSmtpPassword && (
              <p className="mt-1 text-[11px] font-bold text-amber-700">
                Lozinka će biti uklonjena nakon čuvanja podešavanja.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Bezbednosni protokol</label>
            <select
              value={values.smtpSecure}
              onChange={(e) => onChange("smtpSecure", e.target.value as "tls" | "starttls" | "none")}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-[#005B94] focus:ring-2 focus:ring-[#005B94]/20"
            >
              <option value="tls">TLS / SSL (Preporučeno za port 465)</option>
              <option value="starttls">STARTTLS (Preporučeno za port 587)</option>
              <option value="none">Bez enkripcije (Samo lokalni server)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Podaci pošiljaoca */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#005B94]">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900">Zaglavlje poruka pošiljaoca</h2>
            <p className="text-[11px] text-slate-500">Ime i adrese koje kupci vide u sandučetu kada prime potvrdu porudžbine.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-bold text-slate-700">Naziv pošiljaoca (Ime)</label>
            <input
              type="text"
              value={values.senderName}
              onChange={(e) => onChange("senderName", e.target.value)}
              placeholder="Aqua Still Shop Zlatibor"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-[#005B94] focus:ring-2 focus:ring-[#005B94]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Adresa pošiljaoca (From)</label>
            <input
              type="email"
              value={values.senderEmail}
              onChange={(e) => onChange("senderEmail", e.target.value)}
              placeholder="noreply@aquastill-zlatibor.rs"
              className={`mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:ring-2 focus:ring-[#005B94]/20 ${
                errors.senderEmail ? "border-red-500 bg-red-50/30 text-red-900" : "border-slate-200 bg-slate-50/50 focus:border-[#005B94]"
              }`}
            />
            {errors.senderEmail && <p className="mt-1 text-[11px] font-bold text-red-600">{errors.senderEmail}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Adresa za odgovore (Reply-To)</label>
            <input
              type="email"
              value={values.replyToEmail}
              onChange={(e) => onChange("replyToEmail", e.target.value)}
              placeholder="info@aquastill-zlatibor.rs"
              className={`mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:ring-2 focus:ring-[#005B94]/20 ${
                errors.replyToEmail ? "border-red-500 bg-red-50/30 text-red-900" : "border-slate-200 bg-slate-50/50 focus:border-[#005B94]"
              }`}
            />
            {errors.replyToEmail && <p className="mt-1 text-[11px] font-bold text-red-600">{errors.replyToEmail}</p>}
          </div>
        </div>
      </div>

      {/* 3. Testiranje SMTP konekcije */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Dijagnostika SMTP servera</h3>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Proverite da li je uneti SMTP server dostupan na zadatom portu pre aktiviranja slanja.
            </p>
          </div>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting || !values.smtpHost}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            {isTesting ? <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" /> : <SendHorizontal className="h-3.5 w-3.5 text-cyan-400" />}
            <span>{isTesting ? "Testiranje..." : "Testiraj konekciju"}</span>
          </button>
        </div>

        {testResult && (
          <div
            className={`mt-4 flex items-start gap-2.5 rounded-xl p-3.5 text-xs ${
              testResult.success
                ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border border-red-200 bg-red-50 text-red-900"
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            )}
            <div className="font-semibold">{testResult.message}</div>
          </div>
        )}
      </div>
    </div>
  );
}
