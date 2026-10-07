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
      const items = await getMediaAssets();
      setMediaList(items);
    } catch (e) {
      console.error("Error loading media:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);


  const MAX_ORIGINAL_UPLOAD_SIZE = 12 * 1024 * 1024;
  const MAX_IMAGE_DIMENSION = 2400;
  const TARGET_COMPRESSED_SIZE = 1.8 * 1024 * 1024;

  const compressImageForUpload = async (file: File): Promise<File> => {
    if (file.size === 0) throw new Error("Fajl " + file.name + " je prazan.");
    if (file.size > MAX_ORIGINAL_UPLOAD_SIZE) {
      throw new Error("Fajl " + file.name + " je prevelik. Original može imati najviše 12MB.");
    }

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

      if (!blob || blob.size > TARGET_COMPRESSED_SIZE) {
        throw new Error("Slika " + file.name + " je i dalje prevelika nakon kompresije.");
      }

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
      // Compress in the browser before the request reaches Vercel.
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
      if (uploadedCount > 0) {
        setSuccessMessage(`Delimično otpremanje: sačuvano ${uploadedCount} slika.`);
      }
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

  const handleSetHero = async (item: MediaItem) => {
    startTransition(async () => {
      try {
        await updateMediaAssetAction(item.id, { folder: "hero" });
        setSuccessMessage("Fotografija je postavljena kao hero. Osvežite početnu stranicu da proverite prikaz.");
        await loadMedia();
      } catch (err: unknown) {
        setUploadError((err instanceof Error ? err.message : null) || "Nije moguće postaviti hero fotografiju.");
      }
    });
  };

  const handleCopyUrl = (url: string, id: string) => {
    const fullUrl = window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMedia = mediaList.filter((item) => {
    const matchesSearch = item.filename.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.altText && item.altText.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFolder = selectedFolder === "all" || item.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  return (
    <div className="space-y-8">
      {/* Header & Upload */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Medijska biblioteka</h1>
          <p className="text-slate-500 text-xs mt-1">Upravljajte slikama i medijskim fajlovima za proizvode i banere.</p>
        </div>

        <div>
          <label className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-2xl cursor-pointer transition-all shadow-lg shadow-cyan-600/20">
            <Upload className="w-4 h-4" />
            <span>{isUploading ? "Otpremanje..." : "Otpremi slike"}</span>
            <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleUpload} className="hidden" disabled={isUploading} />
          </label>
        </div>
      </div>

      {uploadError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3 text-xs font-bold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center gap-3 text-xs font-bold">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Pretraži po nazivu ili alt tekstu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-cyan-500 outline-none"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {["all", "general", "products", "logo", "hero"].map((folder) => (
            <button
              key={folder}
              onClick={() => setSelectedFolder(folder)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                selectedFolder === folder ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {folder === "all" ? "Sve slike" : folder}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-600 mx-auto" />
          <p className="text-xs text-slate-400 font-bold">Učitavanje medijske biblioteke...</p>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
            <ImageIcon className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Nema pronađenih slika</h3>
          <p className="text-xs text-slate-500">Otpremite nove fotografije pomoću dugmeta iznad.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredMedia.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col group">
              <div className="relative aspect-square bg-slate-50 p-4 flex items-center justify-center overflow-hidden border-b border-slate-100">
                <img
                  src={item.url}
                  alt={item.altText || item.filename}
                  className="absolute inset-0 h-full w-full object-contain p-2 group-hover:scale-105 transition-transform"
                  loading="lazy"
                />
              </div>

              <div className="p-4 flex flex-col flex-grow justify-between space-y-3">
                {item.folder !== "hero" && (
                  <button type="button" onClick={() => handleSetHero(item)} disabled={isPending} className="w-full rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-[11px] font-bold text-cyan-800 transition hover:bg-cyan-100 disabled:opacity-50">
                    Postavi kao hero fotografiju
                  </button>
                )}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider block">{item.folder}</span>
                  <h4 className="text-xs font-bold text-slate-800 truncate" title={item.filename}>{item.filename}</h4>
                  <span className="text-[10px] text-slate-400 block">{(item.size / 1024).toFixed(1)} KB</span>
                </div>

                {/* Inline Alt Edit */}
                {editingId === item.id ? (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <input
                      type="text"
                      value={editAlt}
                      onChange={(e) => setEditAlt(e.target.value)}
                      placeholder="Alt tekst..."
                      className="w-full px-2 py-1 text-xs border border-cyan-500 rounded outline-none"
                    />
                    <div className="flex gap-1">
                      <button onClick={() => handleSaveAlt(item.id)} className="px-2 py-1 bg-cyan-600 text-white text-[10px] font-bold rounded">Sačuvaj</button>
                      <button onClick={() => setEditingId(null)} className="px-2 py-1 bg-slate-200 text-slate-700 text-[10px] font-bold rounded">Otkaži</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      onClick={() => { setEditingId(item.id); setEditAlt(item.altText || ""); }}
                      className="text-[11px] text-slate-500 hover:text-cyan-600 font-medium truncate max-w-[120px]"
                      title="Izmeni alt tekst"
                    >
                      {item.altText || "Bez alt teksta"}
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleCopyUrl(item.url, item.id)}
                        className="p-1.5 text-slate-400 hover:text-cyan-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Kopiraj URL"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.url)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Obriši"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
