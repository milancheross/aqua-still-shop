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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Upravljanje proizvodima</h1>
          <p className="text-slate-500 text-xs mt-1">Pregledajte, dodajte, izmenite ili obrišite artikle iz kataloga.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-2xl transition-all shadow-lg shadow-cyan-600/20"
        >
          <Plus className="w-4 h-4" /> Dodaj proizvod
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        <form method="GET" action="/admin/products" className="relative">
          <input
            type="text"
            name="q"
            defaultValue={search}
            placeholder="Pretraži po nazivu ili SKU..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-cyan-500 outline-none"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        </form>

        <form method="GET" action="/admin/products" className="flex items-center gap-2">
          <ProductStatusSelect defaultValue={status} />
        </form>

        <div className="flex items-center justify-end text-xs text-slate-500 font-bold">
          Ukupno artikala: <span className="text-slate-900 ml-1">{products.length}</span>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {products.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Nema pronađenih proizvoda u bazi</h3>
            <p className="text-xs text-slate-500">Kliknite na dugme „Dodaj proizvod” da kreirate prvi artikal.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Proizvod</th>
                  <th className="py-3 px-4">SKU / Šifra</th>
                  <th className="py-3 px-4">Kategorija</th>
                  <th className="py-3 px-4">Cena</th>
                  <th className="py-3 px-4">Zalihe</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Akcije</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className="relative w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden shrink-0 p-1">
                        <Image src={p.images[0] || "/placeholder-tool.svg"} alt={p.name} fill className="object-contain p-1" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block line-clamp-1">{p.name}</span>
                        <span className="text-[10px] text-slate-400 block">{p.brand}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{p.sku}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{p.categoryName}</td>
                    <td className="py-3 px-4 font-black text-slate-900">
                      {p.salePrice ? (
                        <div>
                          <span className="text-red-600 block">{formatPrice(p.salePrice)}</span>
                          <span className="text-[10px] text-slate-400 line-through block">{formatPrice(p.price)}</span>
                        </div>
                      ) : (
                        formatPrice(p.price)
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{p.stockQuantity} {p.unit}</td>
                    <td className="py-3 px-4">
                      {p.inStock && p.stockQuantity > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-full text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> Aktivan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 font-bold rounded-full text-[10px]">
                          <XCircle className="w-3 h-3" /> Rasprodato
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="p-2 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-colors"
                          title="Uredi"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <DuplicateProductButton id={p.id} />
                        <DeleteProductButton id={p.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
