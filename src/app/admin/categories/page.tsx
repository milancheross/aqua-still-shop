"use client";

import React, { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { AlertCircle, Check, ImagePlus, Loader2, Plus, Save, Trash2, Upload, X } from "lucide-react";
import { createAdminCategory, deleteAdminCategory, getAdminCategories, updateAdminCategory } from "@/actions/admin-cms-actions";
import { uploadMediaAction } from "@/actions/media-actions";

type Category = Awaited<ReturnType<typeof getAdminCategories>>[number];
type CategoryForm = { name: string; slug: string; description: string; imageUrl: string };
const emptyForm: CategoryForm = { name: "", slug: "", description: "", imageUrl: "" };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  const loadData = async () => {
    setLoading(true);
    try {
      setCategories(await getAdminCategories());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Učitavanje kategorija nije uspelo.");
    } finally {
      setLoading(false);
    }
  };

  // Initial data loading is an intentional effect; state updates happen after the async request resolves.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void loadData(); }, []);

  const resetForm = () => { setForm(emptyForm); setEditingId(null); };

  const handleNameChange = (name: string) => {
    setForm((current) => ({
      ...current,
      name,
      slug: editingId ? current.slug : name.toLowerCase().normalize("NFKD").replace(/[\\u0300-\\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const data = new FormData();
      data.append("files", file);
      data.append("folder", "categories");
      const result = await uploadMediaAction(data);
      setForm((current) => ({ ...current, imageUrl: result.uploaded[0]?.url ?? current.imageUrl }));
      setSuccess("Slika je otpremljena. Sačuvajte kategoriju da biste je prikazali na sajtu.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Otpremanje slike nije uspelo.");
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
          await updateAdminCategory(editingId, form);
          setSuccess("Kategorija je uspešno ažurirana.");
        } else {
          await createAdminCategory(form);
          setSuccess("Kategorija je uspešno kreirana.");
        }
        resetForm();
        await loadData();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Čuvanje kategorije nije uspelo.");
      }
    });
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setForm({ name: category.name, slug: category.slug, description: category.description ?? "", imageUrl: category.imageUrl ?? "" });
    setError("");
    setSuccess("");
  };

  const handleDelete = (id: string) => {
    if (!confirm("Da li ste sigurni da želite da obrišete ovu kategoriju?")) return;
    startTransition(async () => {
      try {
        await deleteAdminCategory(id);
        setSuccess("Kategorija je obrisana.");
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
        <h1 className="text-xl font-black text-slate-900 sm:text-2xl">Upravljanje kategorijama</h1>
        <p className="mt-1 text-sm text-slate-500">Dodajte fotografije i uredite sadržaj kategorija prikazan na webshopu.</p>
      </div>
      {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
      {success && <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700"><Check className="mt-0.5 h-4 w-4 shrink-0" />{success}</div>}

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-5 lg:gap-6">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="flex items-center gap-2 text-base font-black text-slate-900">{editingId ? <Save className="h-4 w-4 text-cyan-600" /> : <Plus className="h-4 w-4 text-cyan-600" />}{editingId ? "Izmena kategorije" : "Nova kategorija"}</h2>
            {editingId && <button type="button" onClick={resetForm} aria-label="Otkaži izmenu" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button>}
          </div>
          <label className="block space-y-1.5"><span className="text-xs font-bold uppercase tracking-wide text-slate-600">Naziv *</span><input required value={form.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Npr. Kupatilska oprema" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100" /></label>
          <label className="block space-y-1.5"><span className="text-xs font-bold uppercase tracking-wide text-slate-600">Slug *</span><input required value={form.slug} onChange={(e) => setForm((current) => ({ ...current, slug: e.target.value }))} placeholder="kupatila" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 font-mono text-sm text-cyan-800 outline-none focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100" /></label>
          <label className="block space-y-1.5"><span className="text-xs font-bold uppercase tracking-wide text-slate-600">Opis</span><textarea rows={3} value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} placeholder="Kratak opis kategorije..." className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100" /></label>
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-600">Fotografija kategorije</span>
            {form.imageUrl ? <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-slate-200 bg-slate-50"><Image src={form.imageUrl} alt="Pregled fotografije kategorije" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" /><button type="button" onClick={() => setForm((current) => ({ ...current, imageUrl: "" }))} aria-label="Ukloni fotografiju" className="absolute right-2 top-2 rounded-lg bg-white/95 p-2 text-red-600 shadow"><X className="h-4 w-4" /></button></div> : <div className="flex aspect-[16/9] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400"><ImagePlus className="h-8 w-8" /></div>}
            <label className={`flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-800 hover:bg-cyan-100 ${uploading ? "pointer-events-none opacity-60" : ""}`}><Upload className="h-4 w-4" />{uploading ? "Otpremanje..." : form.imageUrl ? "Zameni fotografiju" : "Izaberi fotografiju"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} disabled={uploading} className="sr-only" /></label>
            <p className="text-xs leading-relaxed text-slate-500">JPG, PNG ili WebP. Preporučena široka fotografija. Čuvanje kategorije objavljuje sliku na sajtu.</p>
          </div>
          <div className="flex flex-col gap-2 pt-1 sm:flex-row">
            <button type="submit" disabled={isPending || uploading} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-700 px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-300"><Save className="h-4 w-4" />{isPending ? "Čuvanje..." : editingId ? "Sačuvaj izmene" : "Kreiraj kategoriju"}</button>
            {editingId && <button type="button" onClick={resetForm} className="min-h-11 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">Otkaži</button>}
          </div>
        </form>

        <section className="min-w-0 space-y-3 lg:col-span-3">
          <div className="flex items-end justify-between gap-3"><h2 className="text-base font-black text-slate-900">Postojeće kategorije</h2><span className="text-xs text-slate-500">{categories.length} ukupno</span></div>
          {loading ? <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-cyan-600" /></div> : categories.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Još nema kreiranih kategorija.</div> : <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {categories.map((category) => <article key={category.id} className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${editingId === category.id ? "border-cyan-500 ring-2 ring-cyan-100" : "border-slate-200"}`}>
              <div className="relative aspect-[16/8] bg-gradient-to-br from-slate-100 to-cyan-50">{category.imageUrl ? <Image src={category.imageUrl} alt={category.name} fill sizes="(max-width: 640px) 100vw, 30vw" className="object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-4xl font-black text-cyan-800/20">{category.name.slice(0,1)}</div>}<span className="absolute bottom-2 left-2 rounded-lg bg-white/90 px-2 py-1 text-[10px] font-bold text-slate-600">{category.imageUrl ? "Ima fotografiju" : "Bez fotografije"}</span></div>
              <div className="space-y-2 p-3 sm:p-4"><div><h3 className="line-clamp-2 text-sm font-bold text-slate-900">{category.name}</h3><p className="mt-1 truncate font-mono text-xs text-slate-500">/{category.slug}</p></div><div className="flex gap-2"><button type="button" onClick={() => startEdit(category)} className="min-h-10 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-800">Uredi</button><button type="button" onClick={() => handleDelete(category.id)} aria-label={`Obriši kategoriju ${category.name}`} className="min-h-10 rounded-lg border border-red-100 px-3 py-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></div></div>
            </article>)}
          </div>}
        </section>
      </div>
    </div>
  );
}
