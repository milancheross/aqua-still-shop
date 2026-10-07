import React from "react";
import Link from "next/link";
import { Plus, FileText, Edit, Trash2, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { getPages, deletePage } from "@/actions/page-cms-actions";

export default async function AdminPagesPage() {
  const pages = await getPages();

  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    if (id) {
      await deletePage(id);
    }
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Upravljanje stranicama</h1>
          <p className="text-slate-500 text-xs mt-1">Kreirajte i uredite statičke stranice i landing stranice pomoću vizuelnog editora.</p>
        </div>
        <Link
          href="/admin/editor?new=1"
          className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-2xl transition-all shadow-lg shadow-cyan-600/20"
        >
          <Plus className="w-4 h-4" /> Kreiraj novu stranicu
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {pages.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Nema kreiranih stranica</h3>
            <p className="text-xs text-slate-500">Kliknite na dugme gore da kreirate prvu stranicu.</p>
          </div>
        ) : (
          <div className="space-y-3 lg:hidden">
            {pages.map((p) => (
              <article key={p.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-black text-slate-900">{p.title}</h2>
                    <p className="mt-1 truncate font-mono text-[11px] text-cyan-700">/{p.slug}</p>
                  </div>
                  {p.isPublished ? (
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">Objavljeno</span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">Nacrt</span>
                  )}
                </div>
                <p className="mt-3 text-[11px] text-slate-400">Izmenjeno: {new Date(p.updatedAt).toLocaleDateString("sr-RS")}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
                  {p.isPublished && <Link href={`/${p.slug}`} target="_blank" className="inline-flex min-h-10 items-center justify-center rounded-xl bg-slate-50 text-xs font-bold text-slate-700">Pregled</Link>}
                  <Link href={p.slug === "pocetna" ? "/admin/editor?home=1" : `/admin/editor?id=${p.id}`} className="inline-flex min-h-10 items-center justify-center rounded-xl bg-cyan-50 text-xs font-bold text-cyan-700">Uredi</Link>
                  <form action={handleDelete} onSubmit={(e) => { if (!confirm("Da li ste sigurni da želite da obrišete ovu stranicu?")) e.preventDefault(); }}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="min-h-10 w-full rounded-xl bg-red-50 text-xs font-bold text-red-700">Obriši</button>
                  </form>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Naslov</th>
                  <th className="py-3 px-4">Slug / URL</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Poslednja izmena</th>
                  <th className="py-3 px-4 text-right">Akcije</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pages.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900">{p.title}</td>
                    <td className="py-4 px-4 font-mono text-cyan-700">/{p.slug}</td>
                    <td className="py-4 px-4">
                      {p.isPublished ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-full text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> Objavljeno
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 font-bold rounded-full text-[10px]">
                          <XCircle className="w-3 h-3" /> Nacrt (Draft)
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-500 text-[11px]">
                      {new Date(p.updatedAt).toLocaleDateString("sr-RS")}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {p.isPublished && (
                          <Link
                            href={`/${p.slug}`}
                            target="_blank"
                            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                            title="Pregledaj stranicu"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}
                        <Link
                          href={p.slug === "pocetna" ? "/admin/editor?home=1" : `/admin/editor?id=${p.id}`}
                          className="p-2 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-colors"
                          title="Uredi u vizuelnom editoru"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <form action={handleDelete} onSubmit={(e) => { if (!confirm("Da li ste sigurni da želite da obrišete ovu stranicu?")) e.preventDefault(); }}>
                          <input type="hidden" name="id" value={p.id} />
                          <button
                            type="submit"
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            title="Obriši"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
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
