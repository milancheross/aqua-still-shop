import Link from "next/link";
import { ArrowRight, Tags } from "lucide-react";
import { getDbBrands } from "@/services/product-service";

export const metadata = {
  title: "Brendovi | Aqua Still Zlatibor",
  description: "Pregled brendova alata, vodovodne i kupatilske opreme u ponudi Aqua Still.",
};

export default async function BrandsPage() {
  const brands = await getDbBrands();

  return (
    <main className="min-h-[60vh] bg-slate-50 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Aqua Still Zlatibor</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Naši brendovi</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">Izaberite brend i pregledajte proizvode iz naše ponude.</p>
        </div>
        {brands.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
            {brands.map((brand) => (
              <Link key={brand} href={`/katalog?brand=${encodeURIComponent(brand)}`} className="group flex min-h-28 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md sm:min-h-36 sm:p-6">
                <span className="break-words text-base font-black text-slate-800 transition-colors group-hover:text-cyan-700 sm:text-lg">{brand}</span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-cyan-700 transition group-hover:bg-cyan-600 group-hover:text-white"><ArrowRight className="h-4 w-4" /></span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <Tags className="mx-auto h-8 w-8 text-slate-400" />
            <h2 className="mt-3 font-bold text-slate-800">Brendovi će uskoro biti prikazani</h2>
            <p className="mt-1 text-sm text-slate-500">Kada proizvodi budu povezani sa brendovima, pojaviće se na ovoj stranici.</p>
          </div>
        )}
      </div>
    </main>
  );
}
