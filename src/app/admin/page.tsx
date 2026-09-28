import React from "react";
import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Users, TrendingUp, ArrowUpRight } from "lucide-react";
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
    { title: "Ukupno proizvoda", value: productCount > 0 ? productCount : "14 (Mock/DB)", icon: Package, change: "+12%" },
    { title: "Porudžbine", value: orderCount, icon: ShoppingCart, change: "Aktivno" },
    { title: "Registrovani kupci", value: "1", icon: Users, change: "Stabilno" },
    { title: "Mesečni promet", value: "0 RSD", icon: TrendingUp, change: "U pripremi" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Kontrolna tabla</h1>
        <p className="text-slate-500 text-xs mt-1">Dobrodošli u Aqua Still CMS — upravljajte vašim webshopom na jednom mestu.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{stat.title}</span>
                <span className="text-2xl font-black text-slate-900 block">{stat.value}</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                  {stat.change}
                </span>
              </div>
              <div className="p-4 bg-cyan-50 text-cyan-600 rounded-2xl">
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Access Cards */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
        <h2 className="text-base font-black text-slate-900">Brze akcije i status sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-900">Vizuelni editor stranica</h3>
            <p className="text-slate-500 leading-relaxed">Uređujte raspored sekcija, banera i početne stranice bez kodiranja.</p>
            <Link href="/admin/editor" className="inline-flex items-center gap-1 font-bold text-cyan-600 hover:underline pt-1">
              Pokreni editor <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-900">Upravljanje proizvodima</h3>
            <p className="text-slate-500 leading-relaxed">Dodajte nove artikle, menjajte cene, zalihe i WMS lokacije u magacinu.</p>
            <Link href="/admin/products" className="inline-flex items-center gap-1 font-bold text-cyan-600 hover:underline pt-1">
              Otvori katalog <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-900">Pregled porudžbina</h3>
            <p className="text-slate-500 leading-relaxed">Pratite pristigle porudžbine, status dostave i preuzimanja u radnji.</p>
            <Link href="/admin/orders" className="inline-flex items-center gap-1 font-bold text-cyan-600 hover:underline pt-1">
              Pregledaj porudžbine <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
