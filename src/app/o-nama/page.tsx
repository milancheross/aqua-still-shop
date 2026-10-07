import Link from "next/link";
import { ArrowRight, ShieldCheck, Wrench, Droplets } from "lucide-react";

export default function AboutPage() {
  return <main className="bg-slate-50">
    <section className="border-b border-slate-200 bg-white"><div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Aqua Still Zlatibor</p>
      <h1 className="mt-2 max-w-3xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">Pouzdan partner za svaki projekat.</h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">Aqua Still je prodavnica alata, vodovodnog materijala, kupatilske opreme, navodnjavanja, boja i druge opreme za kuću, radionicu i profesionalne projekte.</p>
    </div></section>
    <section className="container mx-auto grid gap-5 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8 lg:py-14">
      {[
        { icon: Wrench, title: "Alati i oprema", text: "Električni i ručni alati, potrošni materijal i oprema za radionicu." },
        { icon: Droplets, title: "Vodovod i navodnjavanje", text: "Cevni materijal, fiting, pumpe, slavine i sistemi za navodnjavanje." },
        { icon: ShieldCheck, title: "Proverena kupovina", text: "Jasne informacije o proizvodima, dostupnosti i mogućnostima preuzimanja." },
      ].map(({icon: Icon,title,text}) => <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><Icon className="h-7 w-7 text-cyan-600"/><h2 className="mt-4 text-lg font-black text-slate-900">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div>)}
    </section>
    <section className="bg-slate-900 text-white"><div className="container mx-auto flex flex-col gap-5 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8"><div><h2 className="text-2xl font-black">Istražite naš asortiman</h2><p className="mt-1 text-sm text-slate-300">Pronađite opremu za kuću, radionicu i profesionalne poslove.</p></div><Link href="/katalog" className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold">Pogledaj katalog <ArrowRight className="h-4 w-4"/></Link></div></section>
  </main>;
}