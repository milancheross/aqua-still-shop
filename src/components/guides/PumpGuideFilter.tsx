"use client";

import { useState } from "react";
import { ArrowRight, SlidersHorizontal } from "lucide-react";

const options = {
  source: [["bunar", "Bunar / cisterna"], ["mreza", "Vodovodna mreža"]],
  depth: [["do-8m", "Do 8 m"], ["preko-8m", "Preko 8 m"]],
  purpose: [["zalivanje", "Zalivanje"], ["kuca", "Vodosnabdevanje kuće"], ["drenaza", "Prljava / otpadna voda"]],
} as const;

export default function PumpGuideFilter() {
  const [source, setSource] = useState("bunar");
  const [depth, setDepth] = useState("do-8m");
  const [purpose, setPurpose] = useState("kuca");

  function getHref() {
    if (purpose === "drenaza") return "/katalog?q=potapajuća+pumpa";
    if (depth === "preko-8m") return "/katalog?category=navodnjavanje&subcategory=pumpe-za-vodu&q=potapajuća";
    if (purpose === "kuca") return "/katalog?category=navodnjavanje&subcategory=pumpe-za-vodu&q=hidropak";
    if (source === "mreza") return "/katalog?q=pumpa+za+povećanje+pritiska";
    return "/katalog?category=navodnjavanje&subcategory=pumpe-za-vodu";
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-cyan-500/10 p-2.5 text-cyan-300"><SlidersHorizontal className="h-5 w-5" /></div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">Brzi izbor</p>
          <h2 className="mt-1 text-lg font-black">Koja pumpa vam je potrebna?</h2>
          <p className="mt-1 text-xs leading-5 text-slate-400">Izaberite tri osnovna parametra. Rezultat vas vodi direktno na relevantnu grupu proizvoda.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <label className="text-xs font-bold text-slate-300">Izvor vode
          <select value={source} onChange={(e) => setSource(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-cyan-400">
            {options.source.map(([value, label]) => <option key={value} value={value} className="bg-slate-900">{label}</option>)}
          </select>
        </label>
        <label className="text-xs font-bold text-slate-300">Dubina
          <select value={depth} onChange={(e) => setDepth(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-cyan-400">
            {options.depth.map(([value, label]) => <option key={value} value={value} className="bg-slate-900">{label}</option>)}
          </select>
        </label>
        <label className="text-xs font-bold text-slate-300">Namena
          <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-cyan-400">
            {options.purpose.map(([value, label]) => <option key={value} value={value} className="bg-slate-900">{label}</option>)}
          </select>
        </label>
      </div>
      <a href={getHref()} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-black text-white transition hover:bg-cyan-500">
        Prikaži odgovarajuće pumpe <ArrowRight className="h-4 w-4" />
      </a>
    </section>
  );
}
