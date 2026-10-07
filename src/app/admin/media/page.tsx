"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Upload, Search, Trash2, Copy, Edit2, Check, Image as ImageIcon, Loader2, AlertCircle } from "lucide-react";
import { getMediaAssets, uploadMediaAction, updateMediaAssetAction, deleteMediaAssetAction, MediaItem } from "@/actions/media-actions";

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAlt, setEditAlt] = useState("");
  const [isPending, startTransition] = useTransition();

  const loadMedia = async () => {
    setLoading(true);
    try {
      setMediaList(await getMediaAssets());
    } catch (e) {
      console.error("Error loading media:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMedia(); }, []);

  const MAX_ORIGINAL_UPLOAD_SIZE = 12 * 1024 * 1024;
  const MAX_IMAGE_DIMENSION = 2400;
  const TARGET_COMPRESSED_SIZE = 1.8 * 1024 * 1024;

  const compressImageForUpload = async (file: File): Promise<File> => {
    if (file.size === 0) throw new Error("Fajl " + file.name + " je prazan.");
    if (file.size > MAX_ORIGINAL_UPLOAD_SIZE) throw new Error("Fajl " + file.name + " je prevelik. Original može imati najviše 12MB.");

    const bitmap = await createImageBitmap(file);
    try {
      const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Pregledač ne može da pripremi sliku za upload.");
      context.drawImage(bitmap, 0, 0, width, height);

      let quality = 0.82;
      let blob: Blob | null = null;
      while (quality >= 0.55) {
        blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
        if (blob && blob.size <= TARGET_COMPRESSED_SIZE) break;
        quality -= 0.08;
      }
      if (!blob || blob.size > TARGET_COMPRESSED_SIZE) throw new Error("Slika " + file.name + " je i dalje prevelika nakon kompresije.");

      const parts = file.name.split(".");
      parts.pop();
      const baseName = (parts.join(".") || "image").replaceAll(" ", "-");
      return new File([blob], baseName + ".webp", { type: "image/webp", lastModified: Date.now() });
    } finally {
      bitmap.close();
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError("");
    setSuccessMessage("");
    setIsUploading(true);
    let uploadedCount = 0;
    let skippedCount = 0;

    try {
      for (const file of Array.from(files)) {
        const compressedFile = await compressImageForUpload(file);
        const formData = new FormData();
        formData.append("files", compressedFile);
        formData.append("folder", selectedFolder === "all" ? "general" : selectedFolder);
        const res = await uploadMediaAction(formData);
        uploadedCount += res.uploaded.length;
        skippedCount += res.skipped.length;
      }
      const duplicateText = skippedCount > 0 ? " " + skippedCount + " duplikata je preskočeno." : "";
      setSuccessMessage("Uspešno otpremljeno " + uploadedCount + " slika." + duplicateText);
    } catch (err: unknown) {
      setUploadError((err instanceof Error ? err.message : null) || "Greška pri otpremanju fajlova.");
      if (uploadedCount > 0) setSuccessMessage("Delimično otpremanje: sačuvano " + uploadedCount + " slika.");
    } finally {
      await loadMedia();
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (id: string, url: string) => {
    if (!confirm("Da li ste sigurni da želite da obrišete ovu fotografiju?")) return;
    startTransition(async () => {
      try {
        await deleteMediaAssetAction(id, url);
        setSuccessMessage("Fotografija je uspešno obrisana.");
        await loadMedia();
      } catch (err: unknown) {
        alert((err instanceof Error ? err.message : null) || "Brisanje nije uspelo.");
      }
    });
  };

  const handleSaveAlt = async (id: string) => {
    startTransition(async () => {
      await updateMediaAssetAction(id, { altText: editAlt });
      setEditingId(null);
      await loadMedia();
    });
  };

  const handleSetFolder = async (item: MediaItem, folder: "hero" | "hero-mobile") => {
    startTransition(async () => {
      try {
        await updateMediaAssetAction(item.id, { folder });
        setSuccessMessage(folder === "hero" ? "Postavljeno kao desktop hero." : "Postavljeno kao mobilni hero.");
        await loadMedia();
      } catch (err: unknown) {
        setUploadError((err instanceof Error ? err.message : null) || "Nije moguće postaviti hero fotografiju.");
      }
    });
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMedia = mediaList.filter((item) => {
    const matchesSearch = item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.altText && item.altText.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch && (selectedFolder === "all" || item.folder === selectedFolder);
  });

  const folders = ["all", "general", "products", "logo", "hero", "hero-mobile"];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Medijska biblioteka</h1>
          <p className="mt-1 text-xs text-slate-500">Upravljajte slikama i banerima. Hero za desktop i mobilni uređaj sada mogu biti odvojeni.</p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-cyan-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-700">
          <Upload className="h-4 w-4" />
          <span>{isUploading ? "Otpremanje..." : "Otpremi slike"}</span>
          <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleUpload} className="hidden" disabled={isUploading} />
        </label>
      </div>

      {uploadError && <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700"><AlertCircle className="h-4 w-4 shrink-0" /><span>{uploadError}</span></div>}
      {successMessage && <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-700"><Check className="h-4 w-4 shrink-0" /><span>{successMessage}</span></div>}

      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
        <div className="relative w-full sm:w-80">
          <input type="text" placeholder="Pretraži po nazivu ili alt tekstu..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs outline-none focus:border-cyan-500 focus:bg-white" />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        </div>
        <div className="flex w-full items-center gap-2 overflow-x-auto sm:w-auto">
          {folders.map((folder) => (
            <button key={folder} onClick={() => setSelectedFolder(folder)} className={"shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors " + (selectedFolder === folder ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>
              {folder === "all" ? "Sve slike" : folder === "hero-mobile" ? "Hero mobile" : folder}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 py-20 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-cyan-600" /><p className="text-xs font-bold text-slate-400">Učitavanje medijske biblioteke...</p></div>
      ) : filteredMedia.length === 0 ? (
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm"><ImageIcon className="mx-auto h-12 w-12 text-slate-300" /><h3 className="text-sm font-bold text-slate-900">Nema pronađenih slika</h3><p className="text-xs text-slate-500">Izaberite folder ili otpremite novu fotografiju.</p></div>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredMedia.map((item) => (
            <div key={item.id} className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="relative aspect-square overflow-hidden border-b border-slate-100 bg-slate-50 p-4">
                <img src={item.url} alt={item.altText || item.filename} className="absolute inset-0 h-full w-full object-contain p-2 transition-transform group-hover:scale-105" loading="lazy" />
              </div>
              <div className="flex flex-grow flex-col justify-between space-y-3 p-4">
                <div className="grid gap-2">
                  {item.folder !== "hero" && <button type="button" onClick={() => handleSetFolder(item, "hero")} disabled={isPending} className="w-full rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-[11px] font-bold text-cyan-800 hover:bg-cyan-100 disabled:opacity-50">Postavi kao desktop hero</button>}
                  {item.folder !== "hero-mobile" && <button type="button" onClick={() => handleSetFolder(item, "hero-mobile")} disabled={isPending} className="w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[11px] font-bold text-blue-800 hover:bg-blue-100 disabled:opacity-50">Postavi kao mobilni hero</button>}
                </div>
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-cyan-600">{item.folder}</span>
                  <h4 className="truncate text-xs font-bold text-slate-800" title={item.filename}>{item.filename}</h4>
                  <span className="block text-[10px] text-slate-400">{(item.size / 1024).toFixed(1)} KB</span>
                </div>

                {editingId === item.id ? (
                  <div className="space-y-2 border-t border-slate-100 pt-2">
                    <input type="text" value={editAlt} onChange={(e) => setEditAlt(e.target.value)} placeholder="Alt tekst..." className="w-full rounded border border-cyan-500 px-2 py-1 text-xs outline-none" />
                    <div className="flex gap-1"><button onClick={() => handleSaveAlt(item.id)} className="rounded bg-cyan-600 px-2 py-1 text-[10px] font-bold text-white">Sačuvaj</button><button onClick={() => setEditingId(null)} className="rounded bg-slate-200 px-2 py-1 text-[10px] font-bold text-slate-700">Otkaži</button></div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                    <button onClick={() => { setEditingId(item.id); setEditAlt(item.altText || ""); }} className="max-w-[120px] truncate text-[11px] font-medium text-slate-500 hover:text-cyan-600" title="Izmeni alt tekst">{item.altText || "Bez alt teksta"}</button>
                    <div className="flex items-center space-x-1">
                      <button onClick={() => handleCopyUrl(item.url, item.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-cyan-600" title="Kopiraj URL">{copiedId === item.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}</button>
                      <button onClick={() => handleDelete(item.id, item.url)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Obriši"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
