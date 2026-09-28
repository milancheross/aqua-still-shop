"use client";

import React, { useState, useEffect, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Save, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  MoveUp, 
  MoveDown, 
  Eye, 
  Check, 
  Settings, 
  Layout, 
  Type, 
  Image as ImageIcon, 
  Square, 
  MousePointer, 
  Sliders 
} from "lucide-react";
import { savePage, getPages } from "@/actions/page-cms-actions";

export interface CanvasBlock {
  id: string;
  type: "heading" | "text" | "image" | "button" | "container" | "spacer";
  props: {
    content?: string;
    level?: "h1" | "h2" | "h3";
    url?: string;
    alt?: string;
    height?: string;
    align?: "left" | "center" | "right";
    variant?: "primary" | "secondary";
  };
  styles: {
    background?: string;
    color?: string;
    padding?: string;
    margin?: string;
    borderRadius?: string;
    fontSize?: string;
  };
}

function isCanvasBlock(value: unknown): value is CanvasBlock {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const block = value as Record<string, unknown>;
  const validTypes = ["heading", "text", "image", "button", "container", "spacer"];
  if (typeof block.id !== "string" || !validTypes.includes(String(block.type))) return false;
  if (!block.props || typeof block.props !== "object" || Array.isArray(block.props)) return false;
  if (!block.styles || typeof block.styles !== "object" || Array.isArray(block.styles)) return false;
  return true;
}

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageId = searchParams.get("id");

  const [title, setTitle] = useState("Nova stranica");
  const [slug, setSlug] = useState("nova-stranica");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  const [blocks, setBlocks] = useState<CanvasBlock[]>([
    {
      id: "block-1",
      type: "heading",
      props: { content: "Dobrodošli na novu stranicu", level: "h1", align: "center" },
      styles: { color: "#0f172a", padding: "py-8" }
    },
    {
      id: "block-2",
      type: "text",
      props: { content: "Ovo je vizuelno uređena sekcija kreirana pomoću Aqua Still CMS Editora.", align: "center" },
      styles: { color: "#475569", padding: "pb-6", fontSize: "text-base" }
    }
  ]);

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>("block-1");
  const [isSaving, startTransition] = useTransition();
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (pageId) {
      getPages().then((pages) => {
        const found = pages.find((p) => p.id === pageId);
        if (found) {
          setTitle(found.title);
          setSlug(found.slug);
          setSeoTitle(found.seoTitle || "");
          setSeoDescription(found.seoDescription || "");
          setIsPublished(found.isPublished);
          if (Array.isArray(found.contentJson) && found.contentJson.length > 0) {
            setBlocks(found.contentJson.filter((block) => isCanvasBlock(block)) as unknown as CanvasBlock[]);
          }
        }
      });
    }
  }, [pageId]);

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
      styles: {
        color: "#0f172a",
        padding: "py-4",
        margin: "my-2",
      }
    };
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const updateSelectedBlockProps = (key: keyof CanvasBlock["props"], val: string) => {
    if (!selectedBlockId) return;
    setBlocks(blocks.map(b => b.id === selectedBlockId ? { ...b, props: { ...b.props, [key]: val } } : b));
  };

  const updateSelectedBlockStyles = (key: keyof CanvasBlock["styles"], val: string) => {
    if (!selectedBlockId) return;
    setBlocks(blocks.map(b => b.id === selectedBlockId ? { ...b, styles: { ...b.styles, [key]: val } } : b));
  };

  const removeBlock = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBlocks(blocks.filter(b => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const moveBlock = (index: number, direction: "up" | "down", e: React.MouseEvent) => {
    e.stopPropagation();
    const newBlocks = [...blocks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;
    setBlocks(newBlocks);
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        await savePage({
          id: pageId || undefined,
          title,
          slug,
          contentJson: JSON.parse(JSON.stringify(blocks)),
          seoTitle,
          seoDescription,
          isPublished,
        });
        setSuccessMsg("Stranica je uspešno sačuvana!");
        setTimeout(() => setSuccessMsg(""), 3000);
      } catch (err: unknown) {
        alert((err instanceof Error ? err.message : null) || "Greška pri čuvanju stranice.");
      }
    });
  };

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col -m-6 md:-m-8">
      {/* Top Header Bar */}
      <header className="h-16 bg-slate-950 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/admin/pages" className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => {
                const val = e.target.value;
                setTitle(val);
                if (!pageId) {
                  setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                }
              }}
              className="bg-transparent text-sm font-black text-white outline-none border-b border-transparent hover:border-slate-700 focus:border-cyan-500 px-1"
            />
            <span className="text-xs font-mono text-slate-500">/{slug}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {successMsg && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> {successMsg}
            </span>
          )}

          <label className="flex items-center space-x-2 text-xs font-bold text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4"
            />
            <span>Objavljeno</span>
          </label>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-cyan-600/25 flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {isSaving ? "Čuvanje..." : "Sačuvaj izmene"}
          </button>
        </div>
      </header>

      {/* Main Builder Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar: Widgets */}
        <aside className="w-full lg:w-72 bg-slate-950 border-r border-slate-800 p-6 flex flex-col space-y-6 shrink-0 overflow-y-auto">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Dodaj element (Widget)</h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => addBlock("heading")} className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold flex flex-col items-center gap-2 transition-colors">
                <Type className="w-4 h-4 text-cyan-400" /> Naslov
              </button>
              <button onClick={() => addBlock("text")} className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold flex flex-col items-center gap-2 transition-colors">
                <Layout className="w-4 h-4 text-cyan-400" /> Tekst
              </button>
              <button onClick={() => addBlock("image")} className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold flex flex-col items-center gap-2 transition-colors">
                <ImageIcon className="w-4 h-4 text-cyan-400" /> Slika
              </button>
              <button onClick={() => addBlock("button")} className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold flex flex-col items-center gap-2 transition-colors">
                <MousePointer className="w-4 h-4 text-cyan-400" /> Dugme
              </button>
              <button onClick={() => addBlock("container")} className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold flex flex-col items-center gap-2 transition-colors">
                <Square className="w-4 h-4 text-cyan-400" /> Sekcija
              </button>
              <button onClick={() => addBlock("spacer")} className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold flex flex-col items-center gap-2 transition-colors">
                <Sliders className="w-4 h-4 text-cyan-400" /> Razdelnik
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">SEO Podešavanja</h3>
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">SEO Naslov</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Naslov u pretraživačima..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Meta Opis</label>
                <textarea
                  rows={2}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Opis stranice..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-cyan-500 resize-none"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Center Canvas */}
        <main className="flex-1 bg-slate-900 p-8 overflow-y-auto flex flex-col items-center">
          <div className="w-full max-w-3xl bg-white text-slate-900 rounded-3xl shadow-2xl min-h-[600px] p-8 space-y-4">
            {blocks.length === 0 ? (
              <div className="py-32 text-center text-slate-400 font-bold text-sm">
                Canvas je prazan. Izaberite element sa leve strane.
              </div>
            ) : (
              blocks.map((block, idx) => {
                const isSelected = block.id === selectedBlockId;
                return (
                  <div
                    key={block.id}
                    onClick={() => setSelectedBlockId(block.id)}
                    className={`relative p-4 rounded-2xl cursor-pointer transition-all border-2 ${
                      isSelected ? "border-cyan-500 bg-cyan-50/20 shadow-md" : "border-transparent hover:border-slate-200"
                    }`}
                  >
                    {/* Block Toolbar overlay */}
                    {isSelected && (
                      <div className="absolute -top-3 right-4 bg-cyan-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-2 shadow-sm z-10">
                        <span>{block.type.toUpperCase()}</span>
                        <div className="flex items-center gap-1 border-l border-cyan-500 pl-2">
                          <button onClick={(e) => moveBlock(idx, "up", e)} className="hover:text-cyan-200"><MoveUp className="w-3 h-3" /></button>
                          <button onClick={(e) => moveBlock(idx, "down", e)} className="hover:text-cyan-200"><MoveDown className="w-3 h-3" /></button>
                          <button onClick={(e) => removeBlock(block.id, e)} className="hover:text-red-200"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </div>
                    )}

                    {/* Render Block */}
                    <div className={`${block.styles.padding || "py-2"} ${block.styles.margin || "my-0"}`} style={{ color: block.styles.color }}>
                      {block.type === "heading" && (
                        <h2 className="text-2xl font-black" style={{ textAlign: block.props.align || "left" }}>
                          {block.props.content}
                        </h2>
                      )}
                      {block.type === "text" && (
                        <p className="text-sm leading-relaxed" style={{ textAlign: block.props.align || "left" }}>
                          {block.props.content}
                        </p>
                      )}
                      {block.type === "button" && (
                        <div style={{ textAlign: block.props.align || "left" }}>
                          <span className="inline-block px-6 py-3 bg-cyan-600 text-white font-bold text-xs rounded-xl shadow-md">
                            {block.props.content}
                          </span>
                        </div>
                      )}
                      {block.type === "image" && (
                        <div className="relative aspect-video bg-slate-100 rounded-xl overflow-hidden">
                          <img src={block.props.content || "/placeholder-tool.svg"} alt="Banner" className="object-cover w-full h-full" />
                        </div>
                      )}
                      {block.type === "container" && (
                        <div className="p-6 bg-slate-100 rounded-2xl border border-slate-200 text-center font-bold text-slate-500">
                          [Sekcija / Kontejner]
                        </div>
                      )}
                      {block.type === "spacer" && (
                        <div className="h-8 border-b border-dashed border-slate-200 flex items-center justify-center text-[10px] text-slate-400">
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

        {/* Right Sidebar: Inspector */}
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

              {(selectedBlock.type === "heading" || selectedBlock.type === "text" || selectedBlock.type === "button") && (
                <div className="space-y-1">
                  <label className="text-slate-400 block">Sadržaj teksta</label>
                  <textarea
                    rows={3}
                    value={selectedBlock.props.content || ""}
                    onChange={(e) => updateSelectedBlockProps("content", e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-cyan-500 resize-none"
                  />
                </div>
              )}

              {selectedBlock.type === "image" && (
                <div className="space-y-1">
                  <label className="text-slate-400 block">URL slike</label>
                  <input
                    type="text"
                    value={selectedBlock.props.content || ""}
                    onChange={(e) => updateSelectedBlockProps("content", e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-slate-400 block">Poravnanje</label>
                <select
                  value={selectedBlock.props.align || "left"}
                  onChange={(e) => updateSelectedBlockProps("align", e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-cyan-500"
                >
                  <option value="left">Levo</option>
                  <option value="center">Centrirano</option>
                  <option value="right">Desno</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block">Boja teksta</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={selectedBlock.styles.color || "#0f172a"}
                    onChange={(e) => updateSelectedBlockStyles("color", e.target.value)}
                    className="w-10 h-8 bg-transparent cursor-pointer rounded"
                  />
                  <input
                    type="text"
                    value={selectedBlock.styles.color || "#0f172a"}
                    onChange={(e) => updateSelectedBlockStyles("color", e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              Kliknite na bilo koji element na canvasu da biste uredili njegova svojstva.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default function AdminEditorPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-white">Učitavanje vizuelnog editora...</div>}>
      <EditorContent />
    </Suspense>
  );
}
