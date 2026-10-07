"use client";

import React, { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { AlertCircle, Check, ImagePlus, Loader2, Plus, Save, Trash2, Upload, X } from "lucide-react";
import { createAdminCategory, deleteAdminCategory, getAdminCategories, updateAdminCategory, updateAdminSubcategory, updateAdminSubcategoryImage } from "@/actions/admin-cms-actions";
import { uploadMediaAction } from "@/actions/media-actions";

type Category = Awaited<ReturnType<typeof getAdminCategories>>[number];
type CategoryForm = { name: string; slug: string; description: string; seoTitle: string; seoDescription: string; imageUrl: string };
const emptyForm: CategoryForm = { name: "", slug: "", description: "", seoTitle: "", seoDescription: "", imageUrl: "" };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<string | null>(null);
  const [subcategoryForm, setSubcategoryForm] = useState({ name: "", slug: "", description: "", seoTitle: "", seoDescription: "", imageUrl: "" });
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

  const startSubcategoryEdit = (subcategory: Category["subcategories"][number]) => {
    setEditingSubcategoryId(subcategory.id);
    setSubcategoryForm({
      name: subcategory.name,
      slug: subcategory.slug,
      description: subcategory.description ?? "",
      seoTitle: subcategory.seoTitle ?? "",
      seoDescription: subcategory.seoDescription ?? "",
      imageUrl: subcategory.imageUrl ?? "",
    });
    setError("");
    setSuccess("");
  };

  const resetSubcategoryEdit = () => {
    setEditingSubcategoryId(null);
    setSubcategoryForm({ name: "", slug: "", description: "", seoTitle: "", seoDescription: "", imageUrl: "" });
  };

  const handleSubcategorySubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingSubcategoryId) return;
    setError("");
    setSuccess("");
    startTransition(async () => {
      try {
        await updateAdminSubcategory(editingSubcategoryId, subcategoryForm);
        setCategories((current) => current.map((category) => ({
          ...category,
          subcategories: category.subcategories.map((subcategory) =>
            subcategory.id === editingSubcategoryId
              ? { ...subcategory, ...subcategoryForm }
              : subcategory
          ),
        })));
        resetSubcategoryEdit();
        setSuccess("Podkategorija je uspešno ažurirana.");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Izmena podkategorije nije uspela.");
      }
    });
  };

  const handleSubcategoryImageUpload = async (subcategoryId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setSuccess("");
    setUploading(true);
    try {
      const data = new FormData();
      data.append("files", file);
      data.append("folder", "categories");
      const result = await uploadMediaAction(data);
      const imageUrl = result.uploaded[0]?.url;
      if (!imageUrl) throw new Error("Otpremanje slike nije vratilo adresu.");
      await updateAdminSubcategoryImage(subcategoryId, imageUrl);
      setCategories((current) => current.map((category) => ({
        ...category,
        subcategories: category.subcategories.map((subcategory) =>
          subcategory.id === subcategoryId ? { ...subcategory, imageUrl } : subcategory
        ),
      })));
      if (editingSubcategoryId === subcategoryId) setSubcategoryForm((current) => ({ ...current, imageUrl }));
      setSuccess("Fotografija podkategorije je sačuvana i prikazana na sajtu.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Otpremanje slike podkategorije nije uspelo.");
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
    setForm({ name: category.name, slug: category.slug, description: category.description ?? "", seoTitle: category.seoTitle ?? "", seoDescription: category.seoDescription ?? "", imageUrl: category.imageUrl ?? "" });
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
          <div className="space-y-3 rounded-xl border border-cyan-100 bg-cyan-50/40 p-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-cyan-800">SEO podešavanja</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">Opciono. Ako ostavite prazno, stranica može koristiti naziv i opis kategorije kao podrazumevane vrednosti.</p>
            </div>
            <label className="block space-y-1.5"><span className="text-xs font-bold uppercase tracking-wide text-slate-600">SEO naslov</span><input value={form.seoTitle} onChange={(e) => setForm((current) => ({ ...current, seoTitle: e.target.value }))} maxLength={60} placeholder="Npr. Vodovodni materijal | Aqua Still Zlatibor" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" /><p className="text-[10px] text-slate-400">{form.seoTitle.length}/60 karaktera</p></label>
            <label className="block space-y-1.5"><span className="text-xs font-bold uppercase tracking-wide text-slate-600">SEO opis</span><textarea rows={3} value={form.seoDescription} onChange={(e) => setForm((current) => ({ ...current, seoDescription: e.target.value }))} maxLength={160} placeholder="Kratak opis za Google rezultate pretrage..." className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" /><p className="text-[10px] text-slate-400">{form.seoDescription.length}/160 karaktera</p></label>
          </div>
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
              <div className="space-y-2 p-3 sm:p-4"><div><h3 className="line-clamp-2 text-sm font-bold text-slate-900">{category.name}</h3><p className="mt-1 truncate font-mono text-xs text-slate-500">/{category.slug}</p></div><div className="flex gap-2"><button type="button" onClick={() => startEdit(category)} className="min-h-10 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-800">Uredi kategoriju</button><button type="button" onClick={() => handleDelete(category.id)} aria-label={`Obriši kategoriju ${category.name}`} className="min-h-10 rounded-lg border border-red-100 px-3 py-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></div>
                {category.subcategories.length > 0 && <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                  <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">Podkategorije — zasebne fotografije</p>
                  {category.subcategories.map((subcategory) => editingSubcategoryId === subcategory.id ? (
                    <form key={subcategory.id} onSubmit={handleSubcategorySubmit} className="space-y-3 rounded-xl border border-cyan-200 bg-cyan-50/40 p-3">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <label className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wide text-slate-500">Naziv</span>
                          <input required value={subcategoryForm.name} onChange={(e) => setSubcategoryForm((current) => ({ ...current, name: e.target.value }))} className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-900 outline-none focus:border-cyan-500" />
                        </label>
                        <label className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wide text-slate-500">Slug</span>
                          <input required value={subcategoryForm.slug} onChange={(e) => setSubcategoryForm((current) => ({ ...current, slug: e.target.value }))} className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 font-mono text-xs text-slate-900 outline-none focus:border-cyan-500" />
                        </label>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <label className="space-y-1 sm:col-span-2">
                          <span className="text-[10px] font-black uppercase tracking-wide text-slate-500">Opis</span>
                          <textarea rows={2} value={subcategoryForm.description} onChange={(e) => setSubcategoryForm((current) => ({ ...current, description: e.target.value }))} placeholder="Kratak opis podkategorije..." className="w-full resize-y rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 outline-none focus:border-cyan-500" />
                        </label>
                        <label className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wide text-slate-500">SEO naslov</span>
                          <input value={subcategoryForm.seoTitle} maxLength={60} onChange={(e) => setSubcategoryForm((current) => ({ ...current, seoTitle: e.target.value }))} placeholder="SEO naslov" className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 outline-none focus:border-cyan-500" />
                        </label>
                        <label className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wide text-slate-500">SEO opis</span>
                          <textarea rows={2} value={subcategoryForm.seoDescription} maxLength={160} onChange={(e) => setSubcategoryForm((current) => ({ ...current, seoDescription: e.target.value }))} placeholder="Opis za Google" className="w-full resize-y rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 outline-none focus:border-cyan-500" />
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <label className={`inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-cyan-200 bg-white px-2.5 text-[11px] font-bold text-cyan-800 hover:bg-cyan-50 ${uploading ? "pointer-events-none opacity-50" : ""}`}>
                          <Upload className="h-3.5 w-3.5" />{subcategoryForm.imageUrl ? "Zameni sliku" : "Dodaj sliku"}
                          <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(event) => void handleSubcategoryImageUpload(subcategory.id, event)} className="sr-only" />
                        </label>
                        <button type="submit" disabled={isPending || uploading} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-cyan-700 px-3 text-[11px] font-bold text-white hover:bg-cyan-800 disabled:bg-slate-300">
                          <Save className="h-3.5 w-3.5" />Sačuvaj
                        </button>
                        <button type="button" onClick={resetSubcategoryEdit} className="inline-flex min-h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-600 hover:bg-slate-50">Otkaži</button>
                      </div>
                      <p className="text-[10px] text-slate-500">Izmena naziva ili slug-a ažurira podkategoriju u bazi i na katalogu.</p>
                    </form>
                  ) : (
                    <div key={subcategory.id} className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
                        {subcategory.imageUrl ? <Image src={subcategory.imageUrl} alt={subcategory.name} fill sizes="72px" className="object-contain p-1" /> : <div className="flex h-full items-center justify-center text-2xl font-black text-slate-300">{subcategory.name.slice(0,1)}</div>}
                      </div>
                      <div className="min-w-0">
                        <p className="break-words text-sm font-bold leading-snug text-slate-900">{subcategory.name}</p>
                        <p className="mt-1 text-[11px] text-slate-500">{subcategory.imageUrl ? "Ima fotografiju" : "Nema fotografiju"}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button type="button" onClick={() => startSubcategoryEdit(subcategory)} className="inline-flex min-h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-700 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-800">
                            Uredi
                          </button>
                          <label className={`inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-cyan-200 bg-white px-3 text-[11px] font-bold text-cyan-800 hover:bg-cyan-50 ${uploading ? "pointer-events-none opacity-50" : ""}`}>
                            <Upload className="h-3.5 w-3.5" />{subcategory.imageUrl ? "Zameni sliku" : "Dodaj sliku"}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(event) => void handleSubcategoryImageUpload(subcategory.id, event)} className="sr-only" />
                          </label>
                        </div>
                      </div>
                    </div>
                  )
                )}
                </div>}
              </div>
            </article>)}
          </div>}
        </section>
      </div>
    </div>
  );
}
