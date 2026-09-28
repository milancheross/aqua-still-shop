"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Tag, Plus, Trash2, Loader2, Check, AlertCircle } from "lucide-react";
import { getAdminBrands, createAdminBrand, deleteAdminBrand } from "@/actions/admin-cms-actions";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({ name: "", slug: "" });
  const [isPending, startTransition] = useTransition();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAdminBrands();
      setBrands(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    startTransition(async () => {
      try {
        await createAdminBrand(form);
        setSuccess("Brend je uspešno kreiran.");
        setForm({ name: "", slug: "" });
        await loadData();
      } catch (err: unknown) {
        setError((err instanceof Error ? err.message : null) || "Kreiranje brenda nije uspelo.");
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Da li ste sigurni da želite da obrišete ovaj brend?")) return;
    startTransition(async () => {
      try {
        await deleteAdminBrand(id);
        setSuccess("Brend je obrisan.");
        await loadData();
      } catch (err: unknown) {
        alert((err instanceof Error ? err.message : null) || "Brisanje nije uspelo.");
      }
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Upravljanje brendovima</h1>
        <p className="text-slate-500 text-xs mt-1">Pregledajte i dodajte brendove u asortiman.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" /> <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Create Form */}
        <div className="lg:col-span-5">
          <form onSubmit={handleCreate} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-black text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-600" /> Novi brend
            </h2>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Naziv *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => {
                  const val = e.target.value;
                  const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                  setForm({ ...form, name: val, slug });
                }}
                placeholder="Npr. Makita"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Slug *</label>
              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="makita"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 font-mono text-cyan-700"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-cyan-600/20"
            >
              {isPending ? "Kreiranje..." : "Sačuvaj brend"}
            </button>
          </form>
        </div>

        {/* Brands List Table */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-16 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-600 mx-auto" />
              </div>
            ) : brands.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">Nema kreiranih brendova.</div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Naziv</th>
                    <th className="py-3 px-4">Slug</th>
                    <th className="py-3 px-4 text-right">Akcije</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {brands.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{b.name}</td>
                      <td className="py-3 px-4 font-mono text-cyan-700">{b.slug}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Obriši"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
