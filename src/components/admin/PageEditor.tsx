"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Save,
  ArrowLeft,
  Trash2,
  MoveUp,
  MoveDown,
  Check,
  Settings,
  Layout,
  Type,
  Image as ImageIcon,
  Square,
  MousePointer,
  Sliders,
  ExternalLink,
  Loader2,
  FileText,
} from "lucide-react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import {
  savePage,
  getPageForEditor,
  type EditorPageData,
  type EditorPageOption,
} from "@/actions/page-cms-actions";
import {
  NEW_PAGE_BLOCKS,
  slugifyTitle,
  type CanvasBlock,
} from "@/lib/page-blocks";

export default function PageEditor({
  initialPageData,
  pages,
}: {
  initialPageData: EditorPageData | null;
  pages: EditorPageOption[];
}) {
  const router = useRouter();

  const [pageId, setPageId] = useState<string | undefined>(
    initialPageData?.id || undefined
  );
  const [title, setTitle] = useState(initialPageData?.title ?? "Nova stranica");
  const [slug, setSlug] = useState(initialPageData?.slug ?? "nova-stranica");
  const [slugTouched, setSlugTouched] = useState(Boolean(initialPageData));
  const [description, setDescription] = useState(
    initialPageData?.description || initialPageData?.seoDescription || ""
  );
  const [imageUrl, setImageUrl] = useState(initialPageData?.image || "");
  const [seoTitle, setSeoTitle] = useState(initialPageData?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(
    initialPageData?.seoDescription ?? ""
  );
  const [isPublished, setIsPublished] = useState(
    initialPageData?.isPublished ?? false
  );
  const [blocks, setBlocks] = useState<CanvasBlock[]>(
    initialPageData?.blocks && initialPageData.blocks.length > 0
      ? initialPageData.blocks
      : NEW_PAGE_BLOCKS
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(
    initialPageData?.blocks?.[0]?.id ?? NEW_PAGE_BLOCKS[0]?.id ?? null
  );

  const [isSaving, startTransition] = useTransition();
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  /**
   * Dinamički izbor stranice iz padajućeg menija.
   * Povlači podatke iz baze i popunjava polja (naslov, opis, slika, blokovi).
   */
  const handleSelectPage = async (selectedKey: string) => {
    if (selectedKey === "home") {
      router.push("/admin/editor?home=1");
      return;
    }
    if (selectedKey === "new") {
      router.push("/admin/editor?new=1");
      return;
    }

    setIsLoadingPage(true);
    try {
      const data = await getPageForEditor(selectedKey);
      if (data) {
        setPageId(data.id || undefined);
        setTitle(data.title);
        setSlug(data.slug);
        setSlugTouched(true);
        setDescription(data.description || data.seoDescription || "");
        setImageUrl(data.image || "");
        setSeoTitle(data.seoTitle || data.title);
        setSeoDescription(data.seoDescription || data.description || "");
        setIsPublished(data.isPublished);
        setBlocks(data.blocks);
        setSelectedBlockId(data.blocks[0]?.id || null);
        window.history.pushState(null, "", `/admin/editor?slug=${data.slug}`);
      }
    } catch (err) {
      console.error("Greška pri dinamičkom učitavanju stranice:", err);
    } finally {
      setIsLoadingPage(false);
    }
  };

  /**
   * Ažuriranje glavne slike stranice i sinhronizacija sa blokom slike u sadržaju.
   */
  const handleMainImageChange = (newUrl: string) => {
    setImageUrl(newUrl);
    setBlocks((currentBlocks) => {
      const imageBlockIndex = currentBlocks.findIndex((b) => b.type === "image");
      if (imageBlockIndex !== -1) {
        const next = [...currentBlocks];
        next[imageBlockIndex] = {
          ...next[imageBlockIndex],
          props: { ...next[imageBlockIndex].props, content: newUrl },
        };
        return next;
      }
      if (newUrl) {
        return [
          ...currentBlocks,
          {
            id: `block-${Date.now()}`,
            type: "image",
            props: { content: newUrl, alt: title },
            styles: { padding: "py-4", margin: "my-2" },
          },
        ];
      }
      return currentBlocks;
    });
  };

  /**
   * Ažuriranje opisa stranice i sinhronizacija sa SEO opisom.
   */
  const handleDescriptionChange = (newDesc: string) => {
    setDescription(newDesc);
    setSeoDescription(newDesc);
  };

  const addBlock = (type: CanvasBlock["type"]) => {
    const newBlock: CanvasBlock = {
      id: `block-${Date.now()}`,
      type,
      props: {
        content:
          type === "heading"
            ? "Novi naslov"
            : type === "text"
            ? "Unesite tekst ovde..."
            : type === "button"
            ? "Kliknite ovde"
            : type === "image"
            ? imageUrl || "/images/hero-1.webp"
            : "",
        level: "h2",
        align: "left",
        url: "#",
        height: "h-12",
      },
      styles: { color: "#0f172a", padding: "py-4", margin: "my-2" },
    };
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const updateSelectedBlockProps = (key: keyof CanvasBlock["props"], val: string) => {
    if (!selectedBlockId) return;
    setBlocks(
      blocks.map((block) =>
        block.id === selectedBlockId
          ? { ...block, props: { ...block.props, [key]: val } }
          : block
      )
    );
  };

  const updateSelectedBlockStyles = (key: keyof CanvasBlock["styles"], val: string) => {
    if (!selectedBlockId) return;
    setBlocks(
      blocks.map((block) =>
        block.id === selectedBlockId
          ? { ...block, styles: { ...block.styles, [key]: val } }
          : block
      )
    );
  };

  const removeBlock = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setBlocks(blocks.filter((block) => block.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const moveBlock = (index: number, direction: "up" | "down", event: React.MouseEvent) => {
    event.stopPropagation();
    const next = [...blocks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= next.length) return;
    const current = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = current;
    setBlocks(next);
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        const result = await savePage({
          id: pageId,
          title,
          slug,
          contentJson: JSON.parse(JSON.stringify(blocks)),
          seoTitle: seoTitle || title,
          seoDescription: seoDescription || description,
          isPublished,
        });

        setSuccessMsg(pageId ? "Izmene stranice su uspešno sačuvane." : "Stranica je sačuvana.");
        setTimeout(() => setSuccessMsg(""), 3500);

        if (!pageId && result.pageId) {
          setPageId(result.pageId);
          router.replace(`/admin/editor?id=${result.pageId}`);
        } else {
          router.refresh();
        }
      } catch (err: unknown) {
        alert((err instanceof Error ? err.message : null) || "Greška pri čuvanju stranice.");
      }
    });
  };

  const selectedBlock = blocks.find((block) => block.id === selectedBlockId);

  return (
    <div className="-m-3 flex min-h-screen flex-col bg-slate-900 text-white sm:-m-5 lg:-m-8">
      {/* Zaglavlje editora */}
      <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950 px-4 py-3 shrink-0">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Link
            href="/admin/pages"
            className="rounded-xl bg-slate-800 p-2 text-slate-400 transition-colors hover:text-white"
            aria-label="Nazad na stranice"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          {/* HTML <select> selektor stranica */}
          <div className="relative">
            <select
              value={slug || pageId || ""}
              onChange={(event) => handleSelectPage(event.target.value)}
              disabled={isLoadingPage}
              className="max-w-64 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-white outline-none focus:border-cyan-500 disabled:opacity-50"
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
            {isLoadingPage && (
              <Loader2 className="absolute right-8 top-2.5 h-3.5 w-3.5 animate-spin text-cyan-400" />
            )}
          </div>

          <div className="hidden min-w-0 items-center gap-2 sm:flex">
            <input
              type="text"
              value={title}
              aria-label="Naslov stranice"
              onChange={(event) => {
                const value = event.target.value;
                setTitle(value);
                if (!slugTouched) setSlug(slugifyTitle(value) || "stranica");
              }}
              className="w-40 border-b border-transparent bg-transparent px-1 text-sm font-black text-white outline-none hover:border-slate-700 focus:border-cyan-500 sm:w-56"
            />
            <span className="text-slate-500">/</span>
            <input
              type="text"
              value={slug}
              aria-label="Adresa stranice"
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(slugifyTitle(event.target.value));
              }}
              className="w-32 border-b border-transparent bg-transparent font-mono text-xs text-cyan-300 outline-none hover:border-slate-700 focus:border-cyan-500 sm:w-40"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {successMsg && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
              <Check className="h-3.5 w-3.5" /> {successMsg}
            </span>
          )}
          {slug && isPublished && (
            <Link
              href={`/${slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Pregled
            </Link>
          )}
          <label className="flex cursor-pointer items-center space-x-2 text-xs font-bold text-slate-300">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(event) => setIsPublished(event.target.checked)}
              className="h-4 w-4 rounded text-cyan-600 focus:ring-cyan-500"
            />
            <span>Objavljeno</span>
          </label>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-600/25 transition-all hover:bg-cyan-700 disabled:bg-slate-700"
          >
            <Save className="h-4 w-4" /> {isSaving ? "Čuvanje..." : "Sačuvaj izmene"}
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Leva traka: Osnovni podaci, Dodavanje elemenata i SEO */}
        <aside className="flex w-full shrink-0 flex-col space-y-6 overflow-y-auto border-r border-slate-800 bg-slate-950 p-6 lg:w-80">
          {/* SEKCIJA 1: OSNOVNI PODACI O STRANICI (Naslov, Opis, Slika) */}
          <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-400">
              <FileText className="h-4 w-4" />
              <span>Podaci o stranici</span>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Naslov stranice
              </label>
              <input
                type="text"
                value={title}
                onChange={(event) => {
                  const val = event.target.value;
                  setTitle(val);
                  if (!slugTouched) setSlug(slugifyTitle(val) || "stranica");
                }}
                placeholder="Unesite naslov..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-bold text-white outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Opis stranice
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(event) => handleDescriptionChange(event.target.value)}
                placeholder="Unesite kratak opis stranice..."
                className="w-full resize-none rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
              />
            </div>

            {/* DIREKTAN UPLOAD SLIKE */}
            <ImageUploadField
              label="Glavna slika stranice"
              value={imageUrl}
              onChange={handleMainImageChange}
              onRemove={() => handleMainImageChange("")}
            />
          </div>

          {/* SEKCIJA 2: DODAVANJE ELEMENATA */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Dodaj element (Widget)
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => addBlock("heading")}
                className="flex flex-col items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs font-bold transition-colors hover:bg-slate-800"
              >
                <Type className="h-4 w-4 text-cyan-400" /> Naslov
              </button>
              <button
                type="button"
                onClick={() => addBlock("text")}
                className="flex flex-col items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs font-bold transition-colors hover:bg-slate-800"
              >
                <Layout className="h-4 w-4 text-cyan-400" /> Tekst
              </button>
              <button
                type="button"
                onClick={() => addBlock("image")}
                className="flex flex-col items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs font-bold transition-colors hover:bg-slate-800"
              >
                <ImageIcon className="h-4 w-4 text-cyan-400" /> Slika
              </button>
              <button
                type="button"
                onClick={() => addBlock("button")}
                className="flex flex-col items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs font-bold transition-colors hover:bg-slate-800"
              >
                <MousePointer className="h-4 w-4 text-cyan-400" /> Dugme
              </button>
              <button
                type="button"
                onClick={() => addBlock("container")}
                className="flex flex-col items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs font-bold transition-colors hover:bg-slate-800"
              >
                <Square className="h-4 w-4 text-cyan-400" /> Sekcija
              </button>
              <button
                type="button"
                onClick={() => addBlock("spacer")}
                className="flex flex-col items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs font-bold transition-colors hover:bg-slate-800"
              >
                <Sliders className="h-4 w-4 text-cyan-400" /> Razdelnik
              </button>
            </div>
          </div>

          {/* SEKCIJA 3: SEO PODEŠAVANJA */}
          <div className="space-y-4 border-t border-slate-800 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              SEO Podešavanja
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <label className="mb-1 block text-slate-400">SEO Naslov</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(event) => setSeoTitle(event.target.value)}
                  placeholder="Naslov u pretraživačima..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-slate-400">Meta Opis</label>
                <textarea
                  rows={2}
                  value={seoDescription}
                  onChange={(event) => setSeoDescription(event.target.value)}
                  placeholder="Opis stranice..."
                  className="w-full resize-none rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Centralni Canvas: Pregled i uređivanje stranice uživo */}
        <main className="flex flex-1 flex-col items-center overflow-y-auto bg-slate-900 p-8">
          <div className="min-h-[600px] w-full max-w-3xl space-y-4 rounded-3xl bg-white p-8 text-slate-900 shadow-2xl">
            {blocks.length === 0 ? (
              <div className="py-32 text-center text-sm font-bold text-slate-400">
                Radna površina je prazna. Izaberite element sa leve strane.
              </div>
            ) : (
              blocks.map((block, index) => {
                const isSelected = block.id === selectedBlockId;
                return (
                  <div
                    key={block.id}
                    onClick={() => setSelectedBlockId(block.id)}
                    className={`relative cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                      isSelected
                        ? "border-cyan-500 bg-cyan-50/20 shadow-md"
                        : "border-transparent hover:border-slate-200"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute -top-3 right-4 z-10 flex items-center gap-2 rounded-full bg-cyan-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                        <span>{block.type.toUpperCase()}</span>
                        <div className="flex items-center gap-1 border-l border-cyan-500 pl-2">
                          <button
                            type="button"
                            onClick={(event) => moveBlock(index, "up", event)}
                            className="hover:text-cyan-200"
                            aria-label="Pomeri gore"
                          >
                            <MoveUp className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(event) => moveBlock(index, "down", event)}
                            className="hover:text-cyan-200"
                            aria-label="Pomeri dole"
                          >
                            <MoveDown className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(event) => removeBlock(block.id, event)}
                            className="hover:text-red-200"
                            aria-label="Obriši element"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}
                    <div
                      className={`${block.styles.padding || "py-2"} ${
                        block.styles.margin || "my-0"
                      }`}
                      style={{ color: block.styles.color }}
                    >
                      {block.type === "heading" && (
                        <h2
                          className="text-2xl font-black"
                          style={{ textAlign: block.props.align || "left" }}
                        >
                          {block.props.content}
                        </h2>
                      )}
                      {block.type === "text" && (
                        <p
                          className="whitespace-pre-line text-sm leading-relaxed"
                          style={{ textAlign: block.props.align || "left" }}
                        >
                          {block.props.content}
                        </p>
                      )}
                      {block.type === "button" && (
                        <div style={{ textAlign: block.props.align || "left" }}>
                          <span className="inline-block rounded-xl bg-cyan-600 px-6 py-3 text-xs font-bold text-white shadow-md">
                            {block.props.content}
                          </span>
                        </div>
                      )}
                      {block.type === "image" && (
                        <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={block.props.content || "/placeholder-tool.svg"}
                            alt={block.props.alt || "Slika"}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      {block.type === "container" && (
                        <div className="rounded-2xl border border-slate-200 bg-slate-100 p-6 text-center font-bold text-slate-500">
                          {block.props.content || "[Sekcija / Kontejner]"}
                        </div>
                      )}
                      {block.type === "spacer" && (
                        <div className="flex h-8 items-center justify-center border-b border-dashed border-slate-200 text-[10px] text-slate-400">
                          Razdelnik prostor
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>

        {/* Desna traka: Inspektor selektovanog elementa */}
        <aside className="flex w-full shrink-0 flex-col space-y-6 overflow-y-auto border-l border-slate-800 bg-slate-950 p-6 lg:w-80">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Settings className="h-4 w-4 text-cyan-400" /> Inspektor / Svojstva
          </h3>
          {selectedBlock ? (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                  Selektovani element
                </span>
                <span className="text-sm font-bold capitalize text-white">
                  {selectedBlock.type}
                </span>
              </div>

              {/* Ako je selektovan element SLIKA, prikaži ImageUploadField umesto tekstualnog polja */}
              {selectedBlock.type === "image" ? (
                <ImageUploadField
                  label="Otpremite ili zamenite sliku"
                  value={selectedBlock.props.content || ""}
                  onChange={(url) => {
                    updateSelectedBlockProps("content", url);
                    if (!imageUrl) setImageUrl(url);
                  }}
                  onRemove={() => updateSelectedBlockProps("content", "")}
                />
              ) : selectedBlock.type !== "spacer" ? (
                <div className="space-y-1">
                  <label className="block text-slate-400">Sadržaj</label>
                  <textarea
                    rows={3}
                    value={selectedBlock.props.content || ""}
                    onChange={(event) =>
                      updateSelectedBlockProps("content", event.target.value)
                    }
                    className="w-full resize-none rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                  />
                </div>
              ) : null}

              {selectedBlock.type === "button" && (
                <div className="space-y-1">
                  <label className="block text-slate-400">Link dugmeta</label>
                  <input
                    type="text"
                    value={selectedBlock.props.url || ""}
                    onChange={(event) =>
                      updateSelectedBlockProps("url", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 font-mono text-xs text-white outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-slate-400">Poravnanje</label>
                <select
                  value={selectedBlock.props.align || "left"}
                  onChange={(event) =>
                    updateSelectedBlockProps("align", event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                >
                  <option value="left">Levo</option>
                  <option value="center">Centrirano</option>
                  <option value="right">Desno</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-400">Boja teksta</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={selectedBlock.styles.color || "#0f172a"}
                    onChange={(event) =>
                      updateSelectedBlockStyles("color", event.target.value)
                    }
                    className="h-8 w-10 cursor-pointer rounded bg-transparent"
                  />
                  <input
                    type="text"
                    value={selectedBlock.styles.color || "#0f172a"}
                    onChange={(event) =>
                      updateSelectedBlockStyles("color", event.target.value)
                    }
                    className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 font-mono text-xs text-white"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">
              Kliknite na bilo koji element na radnoj površini da biste uredili njegova svojstva.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
