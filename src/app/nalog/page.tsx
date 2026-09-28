import Link from "next/link";
import { ArrowRight, ClipboardList, ShoppingBag, UserRound } from "lucide-react";

export const metadata = {
  title: "Moj nalog | Aqua Still Zlatibor",
  description: "Informacije o kupovini i porudžbinama u Aqua Still webshopu.",
};

export default function AccountPage() {
  return (
    <main className="min-h-[60vh] bg-slate-50 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700"><UserRound className="h-7 w-7" /></div>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Aqua Still Zlatibor</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Moj nalog</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">Kupovinu možete obaviti i bez registracije. Trenutno je dostupna kupovina kao gost; prijava kupaca i pregled istorije porudžbina nisu aktivirani.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link href="/katalog" className="group flex items-center gap-4 rounded-2xl border border-slate-200 p-5 transition hover:border-cyan-300 hover:bg-cyan-50/50">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700"><ShoppingBag className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1"><span className="block font-bold text-slate-900">Nastavi kupovinu</span><span className="mt-1 block text-xs text-slate-500">Pregledajte katalog proizvoda</span></span><ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-cyan-700" />
            </Link>
            <Link href="/placanje" className="group flex items-center gap-4 rounded-2xl border border-slate-200 p-5 transition hover:border-cyan-300 hover:bg-cyan-50/50">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700"><ClipboardList className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1"><span className="block font-bold text-slate-900">Poruči kao gost</span><span className="mt-1 block text-xs text-slate-500">Unesite podatke za porudžbinu</span></span><ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-cyan-700" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
