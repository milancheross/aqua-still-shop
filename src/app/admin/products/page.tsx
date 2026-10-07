import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Edit, CheckCircle2, XCircle, Package } from "lucide-react";
import ProductStatusSelect from "@/components/admin/ProductStatusSelect";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import DuplicateProductButton from "@/components/admin/DuplicateProductButton";
import { getAdminProducts } from "@/actions/product-admin-actions";
import { formatPrice } from "@/lib/utils";

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q : "";
  const category = typeof params.category === "string" ? params.category : "all";
  const brand = typeof params.brand === "string" ? params.brand : "all";
  const status = typeof params.status === "string" ? params.status : "all";
  const products = await getAdminProducts({ search, category, brand, status });

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 sm:space-y-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-700">Katalog</div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Proizvodi</h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">Dodajte, uređujte i kontrolišite artikle.</p>
        </div>
        <Link href="/admin/products/new" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-5 text-sm font-black text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-700">
          <Plus className="h-4 w-4" /> Dodaj proizvod
        </Link>
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-[1fr_auto_auto] sm:p-4">
        <form method="GET" action="/admin/products" className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            name="q"
            defaultValue={search}
            placeholder="Pretraži naziv ili šifru..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100"
          />
        </form>
        <form method="GET" action="/admin/products" className="min-w-0">
          <ProductStatusSelect defaultValue={status} />
        </form>
        <div className="flex items-center px-1 text-xs font-bold text-slate-500">
          Ukupno: <span className="ml-1 text-slate-900">{products.length}</span>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white py-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Package className="h-8 w-8" /></div>
          <h3 className="mt-4 text-sm font-bold text-slate-900">Nema pronađenih proizvoda</h3>
          <p className="mt-1 text-xs text-slate-500">Kliknite na „Dodaj proizvod” da kreirate prvi artikal.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 lg:hidden">
            {products.map((p) => (
              <article key={p.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex gap-3">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                    <Image src={p.images[0] || "/placeholder-tool.svg"} alt={p.name} fill sizes="80px" className="object-contain p-2" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="block text-[10px] font-black uppercase tracking-wide text-cyan-700">{p.brand}</span>
                        <h2 className="mt-0.5 line-clamp-2 text-sm font-black leading-5 text-slate-900">{p.name}</h2>
                      </div>
                      {p.inStock && p.stockQuantity > 0 ? (
                        <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-black text-emerald-700">Na stanju</span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-red-50 px-2 py-1 text-[9px] font-black text-red-700">Nema</span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500">
                      <span>Šifra: <strong className="font-mono text-slate-700">{p.sku}</strong></span>
                      <span>{p.categoryName}</span>
                    </div>
                    <div className="mt-2 flex items-end justify-between gap-3">
                      <div>
                        {p.salePrice ? (
                          <>
                            <span className="block text-[10px] text-slate-400 line-through">{formatPrice(p.price)}</span>
                            <span className="block text-sm font-black text-red-600">{formatPrice(p.salePrice)}</span>
                          </>
                        ) : (
                          <span className="block text-sm font-black text-slate-900">{formatPrice(p.price)}</span>
                        )}
                      </div>
                      <span className="text-xs font-black text-slate-700">{p.stockQuantity} {p.unit}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
                  <Link href={`/admin/products/${p.id}/edit`} className="inline-flex min-h-10 items-center justify-center gap-1 rounded-xl bg-cyan-50 text-xs font-black text-cyan-700">
                    <Edit className="h-3.5 w-3.5" /> Uredi
                  </Link>
                  <DuplicateProductButton id={p.id} />
                  <DeleteProductButton id={p.id} />
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-3">Proizvod</th>
                    <th className="px-4 py-3">SKU / Šifra</th>
                    <th className="px-4 py-3">Kategorija</th>
                    <th className="px-4 py-3">Cena</th>
                    <th className="px-4 py-3">Zalihe</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Akcije</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.id} className="transition-colors hover:bg-slate-50/80">
                      <td className="flex items-center gap-3 px-4 py-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                          <Image src={p.images[0] || "/placeholder-tool.svg"} alt={p.name} fill sizes="48px" className="object-contain p-1" />
                        </div>
                        <div><span className="block line-clamp-1 font-bold text-slate-900">{p.name}</span><span className="block text-[10px] text-slate-400">{p.brand}</span></div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">{p.sku}</td>
                      <td className="px-4 py-3 font-medium text-slate-700">{p.categoryName}</td>
                      <td className="px-4 py-3 font-black text-slate-900">{p.salePrice ? <div><span className="block text-red-600">{formatPrice(p.salePrice)}</span><span className="block text-[10px] text-slate-400 line-through">{formatPrice(p.price)}</span></div> : formatPrice(p.price)}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">{p.stockQuantity} {p.unit}</td>
                      <td className="px-4 py-3">{p.inStock && p.stockQuantity > 0 ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700"><CheckCircle2 className="h-3 w-3" /> Aktivan</span> : <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-700"><XCircle className="h-3 w-3" /> Rasprodato</span>}</td>
                      <td className="px-4 py-3 text-right"><div className="flex items-center justify-end gap-1"><Link href={`/admin/products/${p.id}/edit`} className="rounded-xl p-2 text-slate-500 hover:bg-cyan-50 hover:text-cyan-600" title="Uredi"><Edit className="h-4 w-4" /></Link><DuplicateProductButton id={p.id} /><DeleteProductButton id={p.id} /></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
