"use client";

import { useState } from "react";
import { importPosCsvAction } from "@/actions/pos-integration-actions";

export default function PosIntegrationPage() {
  const [csv, setCsv] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [result, setResult] = useState<Awaited<ReturnType<typeof importPosCsvAction>> | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleImport() {
    setBusy(true); setStatus(null); setResult(null);
    try {
      setResult(await importPosCsvAction(csv));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Uvoz nije uspeo.");
    } finally { setBusy(false); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">POS integracija</h1>
        <p className="mt-1 text-sm text-slate-500">Privremeni univerzalni CSV uvoz dok ne utvrdimo koji POS program klijent koristi.</p>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>Važno:</strong> trenutno ne povezujemo konkretan POS. Овај модул припрема Aqua Still да прими податке из CSV/Excel извоза. Нови производи се намерно не креирају аутоматски.
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <div>
          <h2 className="font-bold text-slate-900">Очекивана поља</h2>
          <p className="text-xs text-slate-500 mt-1">Прихватају се називи као: Šifra, Barkod/EAN, Naziv, Cena, PDV, Jedinica, Zaliha, Brend, Kategorija.</p>
        </div>
        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          rows={12}
          placeholder={"Sifra;Barkod;Naziv;Cena;PDV;Jedinica;Zaliha\n123;8601234567890;Valvex ventil 1/2;690;20;kom;12"}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs outline-none focus:border-cyan-500"
        />
        <button
          type="button"
          onClick={handleImport}
          disabled={busy || !csv.trim()}
          className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {busy ? "Uvoz u toku..." : "Uvezi / sinhronizuj"}
        </button>
        {status && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{status}</p>}
        {result && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="rounded-xl bg-emerald-50 p-3"><b>{result.created}</b><span className="block text-xs">Novi</span></div>
            <div className="rounded-xl bg-cyan-50 p-3"><b>{result.updated}</b><span className="block text-xs">Ažurirani</span></div>
            <div className="rounded-xl bg-slate-50 p-3"><b>{result.unchanged}</b><span className="block text-xs">Bez promene</span></div>
            <div className="rounded-xl bg-amber-50 p-3"><b>{result.skipped}</b><span className="block text-xs">Preskočeni</span></div>
            {result.errors.length > 0 && <div className="col-span-full rounded-xl bg-red-50 p-3 text-xs text-red-700">{result.errors.slice(0, 20).map((e) => <div key={e}>{e}</div>)}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
