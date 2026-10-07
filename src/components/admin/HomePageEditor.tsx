"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ExternalLink, Save } from "lucide-react";
import { saveHomePage } from "@/actions/page-cms-actions";
import type { EditorPageOption } from "@/components/admin/PageEditor";
import { DEFAULT_HOME, type HomeContent } from "@/lib/home-content";

function Field({ label, value, onChange, rows = 0 }: { label: string; value: string; onChange: (value: string) => void; rows?: number }) {
  const className = "w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500";
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</span>
      {rows > 0 ? (
        <textarea rows={rows} value={value} onChange={(event) => onChange(event.target.value)} className={className} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} className={className} />
      )}
    </label>
  );
}

export default function HomePageEditor({
  content,
  isPublished,
  pages,
}: {
  content: HomeContent;
  isPublished: boolean;
  pages: EditorPageOption[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(content);
  const [published, setPublished] = useState(isPublished);
  const [isSaving, startTransition] = useTransition();
  const [success, setSuccess] = useState("");

  const set = (key: keyof HomeContent) => (value: string) => setForm((current) => ({ ...current, [key]: value }));

  const openPage = (nextId: string) => {
    if (nextId === "home") return;
    if (!window.confirm("Nečuvane izmene početne stranice će biti odbačene. Nastaviti?")) return;
    router.push(nextId ? `/admin/editor?id=${nextId}` : "/admin/editor?new=1");
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        const result = await saveHomePage({ ...form, isPublished: published });
        if (!result.success) {
          throw new Error(result.error);
        }
        setSuccess("Početna stranica je sačuvana.");
        setTimeout(() => setSuccess(""), 3000);
      } catch (error: unknown) {
        alert(error instanceof Error ? error.message : "Čuvanje početne stranice nije uspelo.");
      }
    });
  };

  return (
    <div className="-m-3 flex min-h-screen flex-col bg-slate-900 text-white sm:-m-5 lg:-m-8">
      <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/pages" className="rounded-xl bg-slate-800 p-2 text-slate-400 hover:text-white" aria-label="Nazad na stranice">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <select value="home" onChange={(event) => openPage(event.target.value)} className="max-w-56 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold outline-none focus:border-cyan-500" aria-label="Stranica">
            <option value="home">Početna stranica</option>
            <option value="">Nova stranica</option>
            {pages.map((item) => (
              <option key={item.id} value={item.id}>{item.title} /{item.slug}</option>
            ))}
          </select>
          <span className="hidden text-xs text-slate-400 sm:inline">Ovo menja tekst na /</span>
        </div>
        <div className="flex items-center gap-3">
          {success && <span className="flex items-center gap-1 text-xs font-bold text-emerald-400"><Check className="h-3.5 w-3.5" /> {success}</span>}
          {published && (
            <Link href="/" target="_blank" className="inline-flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white">
              <ExternalLink className="h-3.5 w-3.5" /> Pregled
            </Link>
          )}
          <label className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} className="h-4 w-4 rounded text-cyan-600" />
            Objavljeno
          </label>
          <button onClick={handleSave} disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-xs font-bold hover:bg-cyan-700 disabled:bg-slate-700">
            <Save className="h-4 w-4" /> {isSaving ? "Čuvanje..." : "Sačuvaj početnu"}
          </button>
        </div>
      </header>

      <div className="grid flex-1 gap-0 lg:grid-cols-[420px_1fr]">
        <form className="space-y-5 overflow-y-auto border-r border-slate-800 bg-slate-950 p-6" onSubmit={(event) => { event.preventDefault(); handleSave(); }}>
          <p className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs leading-relaxed text-slate-400">
            Desktop hero dolazi iz foldera <span className="font-bold text-cyan-300">hero</span>, a mobilni iz <span className="font-bold text-blue-300">hero-mobile</span>. Oba se podešavaju u Medijskoj biblioteci. Ovde se menja tekst početne stranice.
          </p>
          <Field label="Natpis iznad naslova" value={form.eyebrow} onChange={set("eyebrow")} />
          <Field label="Glavni naslov" value={form.title} onChange={set("title")} />
          <Field label="Reč u naslovu koja je plava" value={form.titleAccent} onChange={set("titleAccent")} />
          <Field label="Opis ispod naslova" value={form.description} onChange={set("description")} rows={4} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Primarno dugme" value={form.primaryLabel} onChange={set("primaryLabel")} />
            <Field label="Link dugmeta" value={form.primaryHref} onChange={set("primaryHref")} />
            <Field label="Drugo dugme" value={form.secondaryLabel} onChange={set("secondaryLabel")} />
            <Field label="Link drugog dugmeta" value={form.secondaryHref} onChange={set("secondaryHref")} />
          </div>
          <Field label="Naslov izdvojene ponude" value={form.featuredTitle} onChange={set("featuredTitle")} />
          <Field label="Mali naslov iznad kategorija" value={form.exploreEyebrow} onChange={set("exploreEyebrow")} />
          <Field label="Naslov kategorija" value={form.exploreTitle} onChange={set("exploreTitle")} />
          <Field label="Opis kategorija" value={form.exploreText} onChange={set("exploreText")} rows={3} />
          <Field label="Naslov brendova" value={form.brandsTitle} onChange={set("brandsTitle")} />
          <Field label="Naslov popularnih kategorija" value={form.popularTitle} onChange={set("popularTitle")} />
          <Field label="SEO naslov" value={form.seoTitle} onChange={set("seoTitle")} />
          <Field label="SEO opis" value={form.seoDescription} onChange={set("seoDescription")} rows={3} />
          <button type="button" onClick={() => setForm(DEFAULT_HOME)} className="text-xs font-bold text-slate-400 underline">Vrati podrazumevani tekst</button>
        </form>

        <div className="bg-slate-950 p-6">
          <div className="overflow-hidden rounded-3xl bg-slate-900">
            <div className="bg-gradient-to-r from-slate-950 via-slate-950 to-cyan-950 px-8 py-16">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200">{form.eyebrow}</p>
              <h1 className="mt-4 max-w-xl text-4xl font-black leading-tight text-white">
                {form.titleAccent && form.title.includes(form.titleAccent) ? (
                  <>
                    {form.title.slice(0, form.title.indexOf(form.titleAccent))}
                    <span className="text-cyan-400">{form.titleAccent}</span>
                    {form.title.slice(form.title.indexOf(form.titleAccent) + form.titleAccent.length)}
                  </>
                ) : form.title}
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300">{form.description}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold">{form.primaryLabel}</span>
                <span className="rounded-xl border border-white/25 px-5 py-3 text-sm font-bold">{form.secondaryLabel}</span>
              </div>
            </div>
            <div className="space-y-3 bg-slate-100 px-8 py-6 text-slate-900">
              <h2 className="text-2xl font-black">{form.featuredTitle}</h2>
              <p className="text-xs font-bold uppercase tracking-wider text-cyan-700">{form.exploreEyebrow}</p>
              <h2 className="text-2xl font-black">{form.exploreTitle}</h2>
              <p className="text-sm text-slate-600">{form.exploreText}</p>
              <h2 className="text-xl font-black">{form.brandsTitle}</h2>
              <h2 className="text-xl font-black">{form.popularTitle}</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
