import Link from "next/link";
import { ArrowRight, Heart, ShoppingBag, Sparkles } from "lucide-react";

export const metadata = {
  title: "Lista želja | Aqua Still Zlatibor",
  description: "Sačuvani omiljeni proizvodi i artikli u Aqua Still webshopu.",
};

export default function WishlistPage() {
  return (
    <main className="min-h-[60vh] bg-slate-50 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <Heart className="h-8 w-8" />
          </div>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Aqua Still Zlatibor</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Lista želja</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
            Funkcionalnost čuvanja omiljenih artikala je trenutno u pripremi. Do tada, željene artikle možete odmah dodati u korpu ili pregledati kompletan asortiman.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/katalog"
              className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-700"
            >
              <ShoppingBag className="h-4 w-4" /> Pregledaj katalog
            </Link>
            <Link
              href="/katalog/akcija"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50/50 hover:text-cyan-800"
            >
              <Sparkles className="h-4 w-4 text-amber-500" /> Pogledaj akcije <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

