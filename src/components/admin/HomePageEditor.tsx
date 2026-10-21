"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ExternalLink, Save, Sliders } from "lucide-react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { saveHomePage, type EditorPageOption } from "@/actions/page-cms-actions";
import { DEFAULT_HOME, DEFAULT_HERO_SLIDES, type HomeContent, type HeroSlideItem } from "@/lib/home-content";

function Field({
  label,
  value,
  onChange,
  rows = 0,
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  const className =
    "w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500 placeholder:text-slate-600";
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</span>
      {rows > 0 ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={className}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={className}
        />
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
  const [activeSlideTab, setActiveSlideTab] = useState(0);

  const heroSlides = (form.heroSlides && form.heroSlides.length > 0) ? form.heroSlides : DEFAULT_HERO_SLIDES;

  const set = (key: keyof HomeContent) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const updateSlideField = (index: number, field: keyof HeroSlideItem, value: string) => {
    setForm((current) => {
      const updatedSlides = [...(current.heroSlides || DEFAULT_HERO_SLIDES)];
      updatedSlides[index] = { ...updatedSlides[index], [field]: value };
      return { ...current, heroSlides: updatedSlides };
    });
  };

  const openPage = (nextKey: string) => {
    if (nextKey === "home") return;
    if (!window.confirm("Nečuvane izmene početne stranice će biti odbačene. Nastaviti?")) return;
    if (nextKey === "new") {
      router.push("/admin/editor?new=1");
      return;
    }
    router.push(`/admin/editor?slug=${nextKey}`);
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        const result = await saveHomePage({ ...form, heroSlides, isPublished: published });
        if (!result.success) {
          throw new Error(result.error);
        }
        setSuccess("Početna stranica i baneri su uspešno sačuvani!");
        setTimeout(() => setSuccess(""), 3500);
      } catch (error: unknown) {
        alert(error instanceof Error ? error.message : "Čuvanje početne stranice nije uspelo.");
      }
    });
  };

  const activeSlide = heroSlides[activeSlideTab] || heroSlides[0];

  return (
    <div className="-m-3 flex min-h-screen flex-col bg-slate-900 text-white sm:-m-5 lg:-m-8">
      {/* Header editora */}
      <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pages"
            className="rounded-xl bg-slate-800 p-2 text-slate-400 hover:text-white"
            aria-label="Nazad na stranice"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <select
            value="home"
            onChange={(event) => openPage(event.target.value)}
            className="max-w-64 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-white outline-none focus:border-cyan-500"
            aria-label="Izbor stranice"
          >
            <option value="home">Početna stranica (/)</option>
            <option value="new">+ Nova stranica</option>
            <optgroup label="Stranice sajta">
              {pages.map((item) => (
                <option key={item.id || item.slug} value={item.slug || item.id}>
                  {item.title} (/{item.slug})
                </option>
              ))}
            </optgroup>
          </select>
          <span className="hidden text-xs text-slate-400 sm:inline">Uređivanje početne i Hero banera</span>
        </div>
        <div className="flex items-center gap-3">
          {success && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
              <Check className="h-3.5 w-3.5" /> {success}
            </span>
          )}
          {published && (
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Poseti sajt
            </Link>
          )}
          <label className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <input
              type="checkbox"
              checked={published}
              onChange={(event) => setPublished(event.target.checked)}
              className="h-4 w-4 rounded text-cyan-600"
            />
            Objavljeno
          </label>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-xs font-bold hover:bg-cyan-700 disabled:bg-slate-700"
          >
            <Save className="h-4 w-4" /> {isSaving ? "Čuvanje..." : "Sačuvaj početnu"}
          </button>
        </div>
      </header>

      <div className="grid flex-1 gap-0 lg:grid-cols-[460px_1fr]">
        {/* Leva kolona: Formular */}
        <form
          className="space-y-6 overflow-y-auto border-r border-slate-800 bg-slate-950 p-6"
          onSubmit={(event) => {
            event.preventDefault();
            handleSave();
          }}
        >
          {/* SEKCIJA: HERO SLAJDER BANERI */}
          <div className="space-y-4 rounded-2xl border border-cyan-900/60 bg-cyan-950/20 p-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-400">
              <Sliders className="h-4 w-4" />
              <span>Hero Slajder (4 tematska banera)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Izaberite baner i prilagodite njegov naslov, istaknuti tekst, link i sliku.
            </p>

            {/* Tabovi banera */}
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {heroSlides.map((slide, idx) => (
                <button
                  key={slide.id || idx}
                  type="button"
                  onClick={() => setActiveSlideTab(idx)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                    activeSlideTab === idx
                      ? "bg-cyan-600 text-white shadow"
                      : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {slide.category || `Baner ${idx + 1}`}
                </button>
              ))}
            </div>

            {/* Polja aktivnog banera */}
            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
              <div className="text-[11px] font-bold text-cyan-300">
                Podešavanje za: <span className="text-white">{activeSlide.category}</span>
              </div>

              <Field
                label="Oznaka / Badge (gore)"
                value={activeSlide.badge}
                onChange={(val) => updateSlideField(activeSlideTab, "badge", val)}
              />

              <div className="grid grid-cols-2 gap-2">
                <Field
                  label="Glavni naslov"
                  value={activeSlide.title}
                  onChange={(val) => updateSlideField(activeSlideTab, "title", val)}
                />
                <Field
                  label="Istaknuta reč (u boji)"
                  value={activeSlide.highlight}
                  onChange={(val) => updateSlideField(activeSlideTab, "highlight", val)}
                />
              </div>

              <Field
                label="Opis banera"
                value={activeSlide.description}
                onChange={(val) => updateSlideField(activeSlideTab, "description", val)}
                rows={2}
              />

              <div className="grid grid-cols-2 gap-2">
                <Field
                  label="Tekst dugmeta"
                  value={activeSlide.buttonLabel}
                  onChange={(val) => updateSlideField(activeSlideTab, "buttonLabel", val)}
                  placeholder="POGLEDAJ PONUDU"
                />
                <Field
                  label="Link dugmeta"
                  value={activeSlide.buttonHref}
                  onChange={(val) => updateSlideField(activeSlideTab, "buttonHref", val)}
                  placeholder="/katalog/alati"
                />
              </div>

              <ImageUploadField
                label="Pozadinska slika banera"
                value={activeSlide.imageUrl || ""}
                onChange={(val) => updateSlideField(activeSlideTab, "imageUrl", val)}
                onRemove={() => updateSlideField(activeSlideTab, "imageUrl", "")}
              />
            </div>
          </div>

          {/* SEKCIJA: OSTALI TEKSTOVI POČETNE */}
          <div className="space-y-4 border-t border-slate-800 pt-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
              Opšti tekstovi i SEO
            </h3>

            <Field label="Naslov izdvojene ponude" value={form.featuredTitle} onChange={set("featuredTitle")} />
            <Field label="Mali naslov iznad kategorija" value={form.exploreEyebrow} onChange={set("exploreEyebrow")} />
            <Field label="Naslov kategorija" value={form.exploreTitle} onChange={set("exploreTitle")} />
            <Field label="Opis kategorija" value={form.exploreText} onChange={set("exploreText")} rows={2} />
            <Field label="Naslov brendova" value={form.brandsTitle} onChange={set("brandsTitle")} />
            <Field label="Naslov popularnih kategorija" value={form.popularTitle} onChange={set("popularTitle")} />

            <div className="border-t border-slate-800 pt-4">
              <Field label="SEO naslov" value={form.seoTitle} onChange={set("seoTitle")} />
              <Field label="SEO opis" value={form.seoDescription} onChange={set("seoDescription")} rows={3} />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setForm(DEFAULT_HOME)}
            className="text-xs font-bold text-slate-400 underline hover:text-white"
          >
            Vrati podrazumevani tekst i banere
          </button>
        </form>

        {/* Desna kolona: Pregled uživo */}
        <div className="bg-slate-950 p-6">
          <div className="overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
            {/* Pregled aktivnog banera */}
            <div className={`relative overflow-hidden bg-gradient-to-r ${activeSlide.bgGradient || "from-slate-950 via-slate-900 to-cyan-950"} p-8`}>
              <div className="relative z-10 max-w-xl space-y-4">
                <span className="inline-block rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-cyan-300">
                  {activeSlide.badge}
                </span>

                <h1 className="text-3xl font-black text-white">
                  {activeSlide.title}{" "}
                  <span className={`bg-gradient-to-r ${activeSlide.accentColor || "from-amber-400 to-cyan-400"} bg-clip-text text-transparent`}>
                    {activeSlide.highlight}
                  </span>
                </h1>

                <p className="text-xs leading-relaxed text-slate-300">{activeSlide.description}</p>

                <div className="flex gap-3 pt-2">
                  <span className="rounded-xl bg-cyan-600 px-5 py-2.5 text-xs font-black text-white uppercase tracking-wider">
                    {activeSlide.buttonLabel || "POGLEDAJ PONUDU"}
                  </span>
                  <span className="rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-bold text-white">
                    Ceo katalog
                  </span>
                </div>
              </div>
            </div>

            {/* Pregled ostatka stranice */}
            <div className="space-y-4 bg-slate-100 p-8 text-slate-900">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-700">
                  {form.exploreEyebrow}
                </p>
                <h2 className="text-xl font-black">{form.exploreTitle}</h2>
                <p className="text-xs text-slate-600">{form.exploreText}</p>
              </div>
              <div className="pt-2">
                <h3 className="text-lg font-black">{form.featuredTitle}</h3>
              </div>
              <div className="pt-2">
                <h3 className="text-base font-black">{form.brandsTitle}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
