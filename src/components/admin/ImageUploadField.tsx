"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Loader2, Trash2, RefreshCw } from "lucide-react";

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  className?: string;
}

/**
 * Interaktivna komponenta za direktan upload slika sa drag & drop podrškom,
 * automatskom WebP optimizacijom preko /api/upload i prikazom pregleda (thumbnail).
 */
export default function ImageUploadField({
  label,
  value,
  onChange,
  onRemove,
  className = "",
}: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/") && !file.name.toLowerCase().endsWith(".svg")) {
      setErrorMessage("Dozvoljene su samo slike (JPG, PNG, WebP, SVG, AVIF).");
      return;
    }

    setErrorMessage("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Otpremanje slike nije uspelo.");
      }

      onChange(data.url);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Došlo je do greške prilikom otpremanja i optimizacije slike."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void handleUpload(file);
    }
    // Resetuj vrednost inputa kako bi isti fajl mogao ponovo da se izabere
    event.target.value = "";
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      void handleUpload(file);
    }
  };

  const handleRemove = () => {
    onChange("");
    if (onRemove) onRemove();
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400 block">
        {label}
      </span>

      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileInputChange}
        accept="image/*,.svg"
        className="hidden"
        aria-hidden="true"
      />

      {/* Stanje: U toku je otpremanje i optimizacija */}
      {isUploading && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-cyan-800 bg-slate-900/90 p-6 text-center space-y-2">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
          <p className="text-xs font-bold text-white">Optimizacija i konverzija u WebP...</p>
          <p className="text-[10px] text-slate-400">Slika se kompresuje i šalje na Vercel Blob skladište.</p>
        </div>
      )}

      {/* Stanje: Slika je uspešno postavljena (prikaz pregleda) */}
      {!isUploading && value && (
        <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900 p-3">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Pregled slike"
              className="h-full w-full object-cover object-center"
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="truncate font-mono text-[10px] text-slate-400" title={value}>
              {value}
            </span>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-200 transition hover:bg-slate-700 hover:text-white"
                title="Izaberi drugu sliku sa računara"
              >
                <RefreshCw className="h-3 w-3" /> Zameni
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-1 rounded-lg border border-red-900/60 bg-red-950/40 px-2.5 py-1 text-[11px] font-bold text-red-300 transition hover:bg-red-900/60 hover:text-red-100"
                title="Ukloni sliku"
              >
                <Trash2 className="h-3 w-3" /> Ukloni
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stanje: Prazno polje za otpremanje (Drag & Drop zona) */}
      {!isUploading && !value && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition ${
            isDragging
              ? "border-cyan-400 bg-cyan-950/30"
              : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900"
          }`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-cyan-400 mb-2">
            <UploadCloud className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold text-slate-200">
            Prevucite sliku ovde ili <span className="text-cyan-400 underline">kliknite za izbor</span>
          </p>
          <p className="mt-1 text-[10px] text-slate-500">
            Automatska WebP optimizacija i kompresija (JPG, PNG, WebP)
          </p>
        </div>
      )}

      {/* Prikaz poruke o grešci */}
      {errorMessage && (
        <p className="text-[11px] font-bold text-red-400 pt-1">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
