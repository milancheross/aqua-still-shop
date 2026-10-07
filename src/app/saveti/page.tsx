import Link from "next/link";
import { ArrowRight, BookOpen, Droplets, Paintbrush, Wrench } from "lucide-react";

const guides = [
  { slug: "kako-izabrati-pravu-pumpu-za-vodu", type: "VODIČ", title: "Kako izabrati pravu pumpu za vodu?", text: "Šta proveriti pre kupovine: namena, visina dizanja, protok, cevi i zaštita.", icon: Droplets },
  { slug: "renoviranje-kupatila-od-cega-poceti", type: "KORISNI SAVET", title: "Renoviranje kupatila – od čega početi?", text: "Praktičan redosled radova, mere, instalacije i izbor opreme bez skupih grešaka.", icon: Wrench },
  { slug: "sistemi-za-navodnjavanje-za-vase-dvoriste", type: "INSPIRACIJA", title: "Sistemi za navodnjavanje za vaše dvorište", text: "Kako podeliti zone, izabrati prskalice ili kap po kap i proveriti pritisak.", icon: Droplets },
  { slug: "farbanje-zida-korak-po-korak", type: "URADI SAM", title: "Farbanje zida korak po korak", text: "Priprema zida, zaštita prostora, izbor valjka i pravilno nanošenje boje.", icon: Paintbrush },
];

export default function GuidesPage() {
  return <main className="bg-slate-50">
    <section className="border-b border-slate-200 bg-white">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Aqua Still vodiči</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">Korisni saveti, vodiči i inspiracija</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">Praktični tekstovi koji pomažu da izaberete pravi proizvod, isplanirate posao i izbegnete česte greške.</p>
      </div>
    </section>
    <section className="container mx-auto grid gap-5 px-4 py-10 sm:px-6 md:grid-cols-2 lg:px-8 lg:py-14">
      {guides.map(({slug,type,title,text,icon:Icon}) => <Link key={slug} href={"/saveti/"+slug} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md">
        <div className="flex items-start justify-between gap-4"><span className="rounded-md bg-cyan-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-cyan-800">{type}</span><Icon className="h-6 w-6 text-cyan-600"/></div>
        <h2 className="mt-5 text-xl font-black text-slate-900">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-xs font-black text-cyan-700">Pročitaj vodič <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1"/></span>
      </Link>)}
    </section>
    <section className="container mx-auto px-4 pb-14 sm:px-6 lg:px-8"><div className="rounded-2xl bg-slate-900 p-6 text-white"><h2 className="text-xl font-black">Tražite konkretan proizvod?</h2><p className="mt-2 text-sm text-slate-300">Posetite katalog i pronađite opremu za svoj projekat.</p><Link href="/katalog" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold">Otvori katalog <ArrowRight className="h-4 w-4"/></Link></div></section>
  </main>;
}
