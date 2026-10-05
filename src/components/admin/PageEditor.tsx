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
} from "lucide-react";
import { savePage } from "@/actions/page-cms-actions";
import { NEW_PAGE_BLOCKS, normalizeBlocks, slugifyTitle, type CanvasBlock } from "@/lib/page-blocks";

export interface EditorPage {
  id: string;
  title: string;
  slug: string;
  contentJson: unknown;
  seoTitle: string | null;
  seoDescription: string | null;
  isPublished: boolean;
}

export interface EditorPageOption {
  id: string;
  title: string;
  slug: string;
}

export default function PageEditor({
  page,
  pages,
}: {
  page: EditorPage | null;
  pages: EditorPageOption[];
}) {
  const router = useRouter();
  const initialBlocks = page ? normalizeBlocks(page.contentJson) : NEW_PAGE_BLOCKS;

  const [pageId, setPageId] = useState(page?.id);
  const [title, setTitle] = useState(page?.title ?? "Nova stranica");
  const [slug, setSlug] = useState(page?.slug ?? "nova-stranica");
  const [slugTouched, setSlugTouched] = useState(Boolean(page));
  const [seoTitle, setSeoTitle] = useState(page?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(page?.seoDescription ?? "");
  const [isPublished, setIsPublished] = useState(page?.isPublished ?? false);
  const [blocks, setBlocks] = useState<CanvasBlock[]>(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(initialBlocks[0]?.id ?? null);
  const [isSaving, startTransition] = useTransition();
  const [successMsg, setSuccessMsg] = useState("");

  const openPage = (nextId: string) => {
    if (nextId === (pageId ?? "")) return;
    const ok = window.confirm("Nečuvane izmene će biti odbačene. Otvoriti izabranu stranicu?");
    if (!ok) return;
    router.push(nextId ? `/admin/editor?id=${nextId}` : "/admin/editor");
  };

  const addBlock = (type: CanvasBlock["type"]) => {
    const newBlock: CanvasBlock = {
      id: `block-${Date.now()}`,
      type,
      props: {
        content: type === "heading" ? "Novi naslov" : type === "text" ? "Unesite tekst ovde..." : type === "button" ? "Klikni ovde" : type === "image" ? "/placeholder-tool.svg" : "",
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
    setBlocks(blocks.map((block) => block.id === selectedBlockId ? { ...block, props: { ...block.props, [key]: val } } : block));
  };

  const updateSelectedBlockStyles = (key: keyof CanvasBlock["styles"], val: string) => {
    if (!selectedBlockId) return;
    setBlocks(blocks.map((block) => block.id === selectedBlockId ? { ...block, styles: { ...block.styles, [key]: val } } : block));
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
          seoTitle,
          seoDescription,
          isPublished,
        });
        setSuccessMsg(pageId ? "Izmene postojeće stranice su sačuvane." : "Stranica je sačuvana.");
        setTimeout(() => setSuccessMsg(""), 3000);
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
    <div className="min-h-screen bg-slate-900 text-white flex flex-col -m-3 sm:-m-5 lg:-m-8">
      <header className="min-h-16 bg-slate-950 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Link href="/admin/pages" className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors" aria-label="Nazad na stranice">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <label className="min-w-0">
            <span className="sr-only">Postojeća stranica</span>
            <select
              value={pageId ?? ""}
              onChange={(event) => openPage(event.target.value)}
              className="max-w-56 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-white outline-none focus:border-cyan-500"
            >
              <option value="">Nova stranica</option>
              {pages.map((item) => (
                <option key={item.id} value={item.id}>{item.title} /{item.slug}</option>
              ))}
            </select>
          </label>
          <div className="flex min-w-0 items-center gap-2">
            <input
              type="text"
              value={title}
              aria-label="Naslov stranice"
              onChange={(event) => {
                const value = event.target.value;
                setTitle(value);
                if (!slugTouched) setSlug(slugifyTitle(value) || "stranica");
              }}
              className="w-40 bg-transparent text-sm font-black text-white outline-none border-b border-transparent hover:border-slate-700 focus:border-cyan-500 px-1 sm:w-56"
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
              className="w-32 bg-transparent font-mono text-xs text-cyan-300 outline-none border-b border-transparent hover:border-slate-700 focus:border-cyan-500 sm:w-40"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {successMsg && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> {successMsg}
            </span>
          )}
          {pageId && isPublished && (
            <Link href={`/${slug}`} target="_blank" className="inline-flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white">
              <ExternalLink className="h-3.5 w-3.5" /> Pregled
            </Link>
          )}
          <label className="flex items-center space-x-2 text-xs font-bold text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(event) => setIsPublished(event.target.checked)}
              className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4"
            />
            <span>Objavljeno</span>
          </label>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-cyan-600/25 flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {isSaving ? "Čuvanje..." : "Sačuvaj izmene"}
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <aside className="w-full lg:w-72 bg-slate-950 border-r border-slate-800 p-6 flex flex-col space-y-6 shrink-0 overflow-y-auto">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Dodaj element (Widget)</h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => addBlock("heading")} className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold flex flex-col items-center gap-2 transition-colors"><Type className="w-4 h-4 text-cyan-400" /> Naslov</button>
              <button onClick={() => addBlock("text")} className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold flex flex-col items-center gap-2 transition-colors"><Layout className="w-4 h-4 text-cyan-400" /> Tekst</button>
              <button onClick={() => addBlock("image")} className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold flex flex-col items-center gap-2 transition-colors"><ImageIcon className="w-4 h-4 text-cyan-400" /> Slika</button>
              <button onClick={() => addBlock("button")} className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold flex flex-col items-center gap-2 transition-colors"><MousePointer className="w-4 h-4 text-cyan-400" /> Dugme</button>
              <button onClick={() => addBlock("container")} className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold flex flex-col items-center gap-2 transition-colors"><Square className="w-4 h-4 text-cyan-400" /> Sekcija</button>
              <button onClick={() => addBlock("spacer")} className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold flex flex-col items-center gap-2 transition-colors"><Sliders className="w-4 h-4 text-cyan-400" /> Razdelnik</button>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">SEO Podešavanja</h3>
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">SEO Naslov</label>
                <input type="text" value={seoTitle} onChange={(event) => setSeoTitle(event.target.value)} placeholder="Naslov u pretraživačima..." className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-cyan-500" />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Meta Opis</label>
                <textarea rows={2} value={seoDescription} onChange={(event) => setSeoDescription(event.target.value)} placeholder="Opis stranice..." className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-cyan-500 resize-none" />
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 bg-slate-900 p-8 overflow-y-auto flex flex-col items-center">
          <div className="w-full max-w-3xl bg-white text-slate-900 rounded-3xl shadow-2xl min-h-[600px] p-8 space-y-4">
            {blocks.length === 0 ? (
              <div className="py-32 text-center text-slate-400 font-bold text-sm">Canvas je prazan. Izaberite element sa leve strane.</div>
            ) : (
              blocks.map((block, index) => {
                const isSelected = block.id === selectedBlockId;
                return (
                  <div
                    key={block.id}
                    onClick={() => setSelectedBlockId(block.id)}
                    className={`relative p-4 rounded-2xl cursor-pointer transition-all border-2 ${isSelected ? "border-cyan-500 bg-cyan-50/20 shadow-md" : "border-transparent hover:border-slate-200"}`}
                  >
                    {isSelected && (
                      <div className="absolute -top-3 right-4 bg-cyan-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-2 shadow-sm z-10">
                        <span>{block.type.toUpperCase()}</span>
                        <div className="flex items-center gap-1 border-l border-cyan-500 pl-2">
                          <button onClick={(event) => moveBlock(index, "up", event)} className="hover:text-cyan-200" aria-label="Pomeri gore"><MoveUp className="w-3 h-3" /></button>
                          <button onClick={(event) => moveBlock(index, "down", event)} className="hover:text-cyan-200" aria-label="Pomeri dole"><MoveDown className="w-3 h-3" /></button>
                          <button onClick={(event) => removeBlock(block.id, event)} className="hover:text-red-200" aria-label="Obriši element"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </div>
                    )}
                    <div className={`${block.styles.padding || "py-2"} ${block.styles.margin || "my-0"}`} style={{ color: block.styles.color }}>
                      {block.type === "heading" && <h2 className="text-2xl font-black" style={{ textAlign: block.props.align || "left" }}>{block.props.content}</h2>}
                      {block.type === "text" && <p className="text-sm leading-relaxed whitespace-pre-line" style={{ textAlign: block.props.align || "left" }}>{block.props.content}</p>}
                      {block.type === "button" && (
                        <div style={{ textAlign: block.props.align || "left" }}>
                          <span className="inline-block px-6 py-3 bg-cyan-600 text-white font-bold text-xs rounded-xl shadow-md">{block.props.content}</span>
                        </div>
                      )}
                      {block.type === "image" && (
                        <div className="relative aspect-video bg-slate-100 rounded-xl overflow-hidden">
                          <img src={block.props.content || "/placeholder-tool.svg"} alt={block.props.alt || "Slika"} className="object-cover w-full h-full" />
                        </div>
                      )}
                      {block.type === "container" && <div className="p-6 bg-slate-100 rounded-2xl border border-slate-200 text-center font-bold text-slate-500">{block.props.content || "[Sekcija / Kontejner]"}</div>}
                      {block.type === "spacer" && <div className="h-8 border-b border-dashed border-slate-200 flex items-center justify-center text-[10px] text-slate-400">Razdelnik prostor</div>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>

        <aside className="w-full lg:w-80 bg-slate-950 border-l border-slate-800 p-6 flex flex-col space-y-6 shrink-0 overflow-y-auto">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Settings className="w-4 h-4 text-cyan-400" /> Inspektor / Stilovi
          </h3>
          {selectedBlock ? (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block mb-1">Selektovani element</span>
                <span className="font-bold text-white text-sm capitalize">{selectedBlock.type}</span>
              </div>
              {selectedBlock.type !== "spacer" && (
                <div className="space-y-1">
                  <label className="text-slate-400 block">{selectedBlock.type === "image" ? "URL slike" : "Sadržaj"}</label>
                  <textarea rows={3} value={selectedBlock.props.content || ""} onChange={(event) => updateSelectedBlockProps("content", event.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-cyan-500 resize-none" />
                </div>
              )}
              {selectedBlock.type === "button" && (
                <div className="space-y-1">
                  <label className="text-slate-400 block">Link dugmeta</label>
                  <input type="text" value={selectedBlock.props.url || ""} onChange={(event) => updateSelectedBlockProps("url", event.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white outline-none focus:border-cyan-500" />
                </div>
              )}
              <div className="space-y-1">
                <label className="text-slate-400 block">Poravnanje</label>
                <select value={selectedBlock.props.align || "left"} onChange={(event) => updateSelectedBlockProps("align", event.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-cyan-500">
                  <option value="left">Levo</option>
                  <option value="center">Centrirano</option>
                  <option value="right">Desno</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-slate-400 block">Boja teksta</label>
                <div className="flex gap-2">
                  <input type="color" value={selectedBlock.styles.color || "#0f172a"} onChange={(event) => updateSelectedBlockStyles("color", event.target.value)} className="w-10 h-8 bg-transparent cursor-pointer rounded" />
                  <input type="text" value={selectedBlock.styles.color || "#0f172a"} onChange={(event) => updateSelectedBlockStyles("color", event.target.value)} className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white" />
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">Kliknite na bilo koji element na canvasu da biste uredili njegova svojstva.</div>
          )}
        </aside>
      </div>
    </div>
  );
}
