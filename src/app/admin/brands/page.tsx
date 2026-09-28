"use client";

import React, { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { AlertCircle, Check, ImagePlus, Loader2, Plus, Save, Trash2, Upload, X } from "lucide-react";
import { getAdminBrands, createAdminBrand, updateAdminBrand, deleteAdminBrand } from "@/actions/admin-cms-actions";
import { uploadMediaAction } from "@/actions/media-actions";

type Brand = Awaited<ReturnType<typeof getAdminBrands>>[number];
type BrandForm = { name: string; slug: string; logoUrl: string };
const emptyForm: BrandForm = { name: "", slug: "", logoUrl: "" };

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [form, setForm] = useState<BrandForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  const loadData = async () => {
    setLoading(true);
    try {
      setBrands(await getAdminBrands());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Učitavanje brendova nije uspelo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadData(); }, []);

  const resetForm = () => { setForm(emptyForm); setEditingId(null); };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const data = new FormData();
      data.append("files", file);
      data.append("folder", "brands");
      const result = await uploadMediaAction(data);
      setForm((current) => ({ ...current, logoUrl: result.uploaded[0]?.url ?? current.logoUrl }));
      setSuccess("Logo je otpremljen. Sačuvajte brend da biste objavili izmenu.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Otpremanje logotipa nije uspelo.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    startTransition(async () => {
      try {
        if (editingId) {
          await updateAdminBrand(editingId, form);
          setSuccess("Brend je uspešno ažuriran.");
        } else {
          await createAdminBrand(form);
          setSuccess("Brend je uspešno kreiran.");
        }
        resetForm();
        await loadData();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Čuvanje brenda nije uspelo.");
      }
    });
  };

  const startEdit = (brand: Brand) => {
    setEditingId(brand.id);
    setForm({ name: brand.name, slug: brand.slug, logoUrl: brand.logoUrl ?? "" });
    setError("");
    setSuccess("");
  };

  const handleDelete = (id: string) => {
    if (!confirm("Da li ste sigurni da želite da obrišete ovaj brend?")) return;
    startTransition(async () => {
      try {
        await deleteAdminBrand(id);
        setSuccess("Brend je obrisan.");
        if (editingId === id) resetForm();
        await loadData();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Brisanje nije uspelo.");
      }
    });
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl font-black text-slate-900 sm:text-2xl">Upravljanje brendovima</h1>
        <p className="mt-1 text-sm text-slate-500">Dodajte logotipe i uredite brendove koji se prikazuju na webshopu.</p>
      </div>

      {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
      {success && <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700"><Check className="mt-0.5 h-4 w-4 shrink-0" />{success}</div>}

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-5 lg:gap-6">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="flex items-center gap-2 text-base font-black text-slate-900">{editingId ? <Save className="h-4 w-4 text-cyan-600" /> : <Plus className="h-4 w-4 text-cyan-600" />}{editingId ? "Izmena brenda" : "Novi brend"}</h2>
            {editingId && <button type="button" onClick={resetForm} aria-label="Otkaži izmenu" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button>}
          </div>
          <label className="block space-y-1.5"><span className="text-xs font-bold uppercase tracking-wide text-slate-600">Naziv *</span><input type="text" required value={form.name} onChange={(e) => { const name=e.target.value; const slug=name.toLowerCase().normalize("NFKD").replace(/[\\u0300-\\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); setForm((current) => ({ ...current, name, slug: editingId ? current.slug : slug })); }} placeholder="Npr. Makita" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100" /></label>
          <label className="block space-y-1.5"><span className="text-xs font-bold uppercase tracking-wide text-slate-600">Slug *</span><input type="text" required value={form.slug} onChange={(e) => setForm((current) => ({ ...current, slug: e.target.value }))} placeholder="makita" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 font-mono text-sm text-cyan-800 outline-none focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100" /></label>
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-600">Logo brenda</span>
            {form.logoUrl ? <div className="relative flex h-36 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-4"><Image src={form.logoUrl} alt="Pregled logotipa" fill unoptimized sizes="(max-width: 1024px) 100vw, 40vw" className="object-contain p-4" /><button type="button" onClick={() => setForm((current) => ({ ...current, logoUrl: "" }))} aria-label="Ukloni logo" className="absolute right-2 top-2 z-10 rounded-lg bg-white/95 p-2 text-red-600 shadow"><X className="h-4 w-4" /></button></div> : <div className="flex h-36 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400"><ImagePlus className="h-8 w-8" /></div>}
            <label className={`flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-800 hover:bg-cyan-100 ${uploading ? "pointer-events-none opacity-60" : ""}`}><Upload className="h-4 w-4" />{uploading ? "Otpremanje..." : form.logoUrl ? "Zameni logo" : "Izaberi logo"}<input type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" onChange={handleLogoUpload} disabled={uploading} className="sr-only" /></label>
            <p className="text-xs leading-relaxed text-slate-500">PNG, JPG, WebP ili SVG. Preporučen je PNG/WebP sa providnom pozadinom. Sačuvajte brend nakon otpremanja.</p>
          </div>
          <div className="flex flex-col gap-2 pt-1 sm:flex-row">
            <button type="submit" disabled={isPending || uploading} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-700 px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-300"><Save className="h-4 w-4" />{isPending ? "Čuvanje..." : editingId ? "Sačuvaj izmene" : "Sačuvaj brend"}</button>
            {editingId && <button type="button" onClick={resetForm} className="min-h-11 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">Otkaži</button>}
          </div>
        </form>

        <section className="min-w-0 space-y-3 lg:col-span-3">
          <div className="flex items-end justify-between gap-3"><h2 className="text-base font-black text-slate-900">Postojeći brendovi</h2><span className="text-xs text-slate-500">{brands.length} ukupno</span></div>
          {loading ? <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-cyan-600" /></div> : brands.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Još nema kreiranih brendova.</div> : <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {brands.map((brand) => <article key={brand.id} className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${editingId === brand.id ? "border-cyan-500 ring-2 ring-cyan-100" : "border-slate-200"}`}>
              <div className="flex h-28 items-center justify-center border-b border-slate-100 bg-slate-50 p-4">{brand.logoUrl ? <Image src={brand.logoUrl} alt={`Logo ${brand.name}`} width={220} height={90} unoptimized className="max-h-20 w-auto max-w-full object-contain" /> : <span className="text-3xl font-black text-slate-300">{brand.name.slice(0,1)}</span>}</div>
              <div className="space-y-2 p-3 sm:p-4"><div><h3 className="text-sm font-bold text-slate-900">{brand.name}</h3><p className="mt-1 truncate font-mono text-xs text-slate-500">/{brand.slug}</p></div><div className="flex gap-2"><button type="button" onClick={() => startEdit(brand)} className="min-h-10 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-800">Uredi</button><button type="button" onClick={() => handleDelete(brand.id)} aria-label={`Obriši brend ${brand.name}`} className="min-h-10 rounded-lg border border-red-100 px-3 py-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></div></div>
            </article>)}
          </div>}
        </section>
      </div>
    </div>
  );
}
