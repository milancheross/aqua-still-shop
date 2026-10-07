import React from "react";
import Link from "next/link";
import {
  LayoutDashboard, Package, ShoppingCart, Users, TrendingUp,
  ArrowUpRight, Warehouse, Plus, AlertTriangle
} from "lucide-react";
import { db } from "@/lib/db";

export default async function AdminDashboardPage() {
  let productCount = 0;
  let orderCount = 0;

  try {
    if (process.env.DATABASE_URL) {
      productCount = await db.product.count();
      orderCount = await db.order.count();
    }
  } catch (e) {
    console.warn("Could not fetch metrics from DB:", e);
  }

  const stats = [
    { title: "Proizvodi", value: productCount || 0, icon: Package },
    { title: "Porudžbine", value: orderCount, icon: ShoppingCart },
    { title: "Kupci", value: 1, icon: Users },
    { title: "Mesečni promet", value: "0 RSD", icon: TrendingUp },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 sm:space-y-7">
      <div>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-700">
          <LayoutDashboard className="h-3.5 w-3.5" />
          Aqua Still
        </div>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Kontrolna tabla</h1>
        <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm">
          Sve najvažnije informacije i akcije na jednom mestu.
        </p>
      </div>

      <section aria-label="Pregled poslovanja" className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-wide text-slate-400">{stat.title}</span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-3 text-xl font-black text-slate-900 sm:text-2xl">{stat.value}</div>
            </div>
          );
        })}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900 sm:text-lg">Brze akcije</h2>
            <p className="mt-1 text-xs text-slate-500">Najčešće radnje bez traženja kroz meni.</p>
          </div>
          <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[10px] font-black text-cyan-700">4 akcije</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Link href="/admin/products/new" className="group rounded-2xl border border-slate-200 p-4 transition hover:border-cyan-300 hover:bg-cyan-50">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600 text-white"><Plus className="h-5 w-5" /></span>
            <strong className="mt-3 block text-sm font-black">Dodaj proizvod</strong>
            <span className="mt-1 block text-[11px] leading-4 text-slate-500">Novi artikal u katalogu.</span>
          </Link>

          <Link href="/admin/orders" className="group rounded-2xl border border-slate-200 p-4 transition hover:border-cyan-300 hover:bg-cyan-50">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white"><ShoppingCart className="h-5 w-5" /></span>
            <strong className="mt-3 block text-sm font-black">Porudžbine</strong>
            <span className="mt-1 block text-[11px] leading-4 text-slate-500">Pregledaj i obradi porudžbine.</span>
          </Link>

          <Link href="/magacin" className="group rounded-2xl border border-slate-200 p-4 transition hover:border-cyan-300 hover:bg-cyan-50">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Warehouse className="h-5 w-5" /></span>
            <strong className="mt-3 block text-sm font-black">Otvori magacin</strong>
            <span className="mt-1 block text-[11px] leading-4 text-slate-500">Zalihe, lokacije i kretanje robe.</span>
          </Link>

          <Link href="/admin/editor?home=1" className="group rounded-2xl border border-slate-200 p-4 transition hover:border-cyan-300 hover:bg-cyan-50">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><ArrowUpRight className="h-5 w-5" /></span>
            <strong className="mt-3 block text-sm font-black">Uredi početnu</strong>
            <span className="mt-1 block text-[11px] leading-4 text-slate-500">Promeni banere i sekcije.</span>
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-amber-100 bg-amber-50 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <h2 className="text-sm font-black text-slate-900">Sistem je spreman za rad</h2>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Kada se uvedu porudžbine i magacinske operacije, ovde ćemo prikazivati samo stavke koje zahtevaju pažnju.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
