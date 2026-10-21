"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  X,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  Check,
  AlertCircle,
  FileCheck,
  PackagePlus,
  Boxes,
  ShieldCheck,
} from "lucide-react";
import { parseProductCsv, downloadCsvTemplate } from "@/lib/product-csv-parser";
import { importProductsBatchAction } from "@/actions/product-import-actions";
import type { CsvParseResult, StockUpdateMode } from "@/lib/product-csv-types";

const BATCH_SIZE = 50;

export default function CsvImportModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<CsvParseResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Režim ažuriranja zaliha u magacinu (podrazumevano: "set" popis)
  const [stockMode, setStockMode] = useState<StockUpdateMode>("set");

  // Stanja tokom batch uvoza
  const [isImporting, setIsImporting] = useState(false);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [createdCount, setCreatedCount] = useState(0);
  const [updatedCount, setUpdatedCount] = useState(0);
  const [movementsCount, setMovementsCount] = useState(0);
  const [failedErrors, setFailedErrors] = useState<{ sku: string; error: string }[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Drag and drop stanje
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFile(null);
    setParseResult(null);
    setIsParsing(false);
    setParseError(null);
    setIsImporting(false);
    setCurrentBatchIndex(0);
    setTotalBatches(0);
    setCreatedCount(0);
    setUpdatedCount(0);
    setMovementsCount(0);
    setFailedErrors([]);
    setIsCompleted(false);
    setStockMode("set");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    if (isImporting) {
      if (!confirm("Uvoz je u toku. Da li ste sigurni da želite da prekinete proces?")) {
        return;
      }
    }
    setIsOpen(false);
    if (isCompleted) {
      router.refresh();
    }
    setTimeout(resetState, 200);
  };

  // Obrada izabranog fajla
  const handleFile = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".csv") && selectedFile.type !== "text/csv") {
      setParseError("Molimo izaberite ispravan CSV fajl (.csv ekstenzija).");
      return;
    }

    setFile(selectedFile);
    setIsParsing(true);
    setParseError(null);

    try {
      const result = await parseProductCsv(selectedFile);
      setParseResult(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Neuspešno čitanje CSV fajla.";
      setParseError(msg);
      setFile(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Pokretanje grupne (batch) obrade
  const handleStartImport = async () => {
    if (!parseResult || parseResult.validRows.length === 0) return;

    const rows = parseResult.validRows;
    const numBatches = Math.ceil(rows.length / BATCH_SIZE);

    setIsImporting(true);
    setTotalBatches(numBatches);
    setCurrentBatchIndex(0);
    setCreatedCount(0);
    setUpdatedCount(0);
    setMovementsCount(0);
    setFailedErrors([]);
    setIsCompleted(false);

    let runningCreated = 0;
    let runningUpdated = 0;
    let runningMovements = 0;
    const allErrors: { sku: string; error: string }[] = [];

    for (let i = 0; i < numBatches; i++) {
      setCurrentBatchIndex(i + 1);
      const start = i * BATCH_SIZE;
      const end = start + BATCH_SIZE;
      const batch = rows.slice(start, end);

      try {
        const res = await importProductsBatchAction(batch, stockMode);
        runningCreated += res.createdCount;
        runningUpdated += res.updatedCount;
        runningMovements += res.stockMovementsCount;
        setCreatedCount(runningCreated);
        setUpdatedCount(runningUpdated);
        setMovementsCount(runningMovements);

        if (res.errors && res.errors.length > 0) {
          allErrors.push(...res.errors);
          setFailedErrors([...allErrors]);
        }
      } catch (batchErr: unknown) {
        const errorText = batchErr instanceof Error ? batchErr.message : "Greška pri obradi serije.";
        batch.forEach((item) => {
          allErrors.push({ sku: item.sku, error: errorText });
        });
        setFailedErrors([...allErrors]);
      }
    }

    setIsImporting(false);
    setIsCompleted(true);
  };

  const progressPercentage =
    totalBatches > 0 ? Math.round((currentBatchIndex / totalBatches) * 100) : 0;

  return (
    <>
      {/* GLAVNO DUGME ZA OTVARANJE MODALA */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-white border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 active:scale-95"
      >
        <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
        <span>Uvezi proizvode (CSV)</span>
      </button>

      {/* MODAL DIJALOG */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* ZAGLAVLJE MODALA */}
            <div className="flex items-start justify-between border-b border-slate-100 p-6 bg-slate-50/70">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-cyan-100 text-cyan-800">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900">Masovni uvoz artikala</h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
                  Dodajte nove artikle ili masovno ažurirajte cene i zalihe postojećih pomoću CSV tabele.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={downloadCsvTemplate}
                  title="Preuzmite pripremljen CSV fajl sa pravilnim kolonama"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-600" />
                  <span className="hidden sm:inline">Preuzmi CSV šablon</span>
                  <span className="sm:hidden">Šablon</span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isImporting}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* TELO MODALA */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* OBAVEŠTENJE O GREŠCI PARSIRANJA */}
              {parseError && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Greška pri čitanju:</strong>
                    <span>{parseError}</span>
                  </div>
                </div>
              )}

              {/* 1. KORAK: DRAG & DROP ZONA */}
              {!parseResult && !isParsing && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-4 ${
                    isDragging
                      ? "border-cyan-500 bg-cyan-50/50 scale-[0.99]"
                      : "border-slate-200 hover:border-cyan-400 hover:bg-slate-50/50 bg-slate-50/30"
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center shadow-inner">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm sm:text-base font-bold text-slate-800">
                      Prevucite CSV fajl ovde ili <span className="text-cyan-600 underline">kliknite za izbor</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Podržani format: .csv sa UTF-8 enkripcijom (do 10.000 artikala)
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFile(e.target.files[0]);
                      }
                    }}
                  />
                </div>
              )}

              {/* UČITAVANJE / PARSIRANJE */}
              {isParsing && (
                <div className="py-16 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-cyan-600 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">Analiziram CSV tabelu...</p>
                </div>
              )}

              {/* 2. KORAK: DRY-RUN PREGLED I IZBOR REŽIMA ZALIHA */}
              {parseResult && !isImporting && !isCompleted && (
                <div className="space-y-6">
                  {/* KARTICA FAJLA I METRIKE */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-900">{file?.name}</div>
                        <div className="text-xs text-slate-500">
                          {((file?.size || 0) / 1024).toFixed(1)} KB · Ukupno redova: {parseResult.totalRows}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={resetState}
                      className="text-xs font-bold text-slate-500 hover:text-red-600 transition self-start sm:self-auto"
                    >
                      Ukloni / Izaberi drugi fajl
                    </button>
                  </div>

                  {/* KARTICE STATISTIKE */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                          Spremno za uvoz
                        </span>
                        <div className="text-2xl font-black text-emerald-900">
                          {parseResult.validRows.length}
                        </div>
                      </div>
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>

                    <div
                      className={`p-4 rounded-2xl border flex items-center justify-between ${
                        parseResult.invalidRows.length > 0
                          ? "bg-amber-50 border-amber-200"
                          : "bg-slate-50 border-slate-200 text-slate-400"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                          Redova sa greškom
                        </span>
                        <div className="text-2xl font-black text-amber-900">
                          {parseResult.invalidRows.length}
                        </div>
                      </div>
                      <AlertTriangle
                        className={`w-6 h-6 ${
                          parseResult.invalidRows.length > 0 ? "text-amber-600" : "text-slate-300"
                        }`}
                      />
                    </div>
                  </div>

                  {/* KLJUČNO: IZBOR REŽIMA AŽURIRANJA ZALIHA */}
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800">
                      <Boxes className="w-4 h-4 text-cyan-600" />
                      <span>Režim obrade zaliha u magacinu</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Odredite kako sistem postupa sa količinama iz CSV-a za artikle koji već postoje u bazi:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                      {/* 1. APSOLUTNO POSTAVLJANJE (POPIS) */}
                      <label
                        className={`flex flex-col justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          stockMode === "set"
                            ? "bg-white border-cyan-500 shadow-sm ring-2 ring-cyan-100"
                            : "bg-white/60 border-slate-200 hover:bg-white"
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
                              Popis (Apsolutno)
                            </span>
                            <input
                              type="radio"
                              name="stockMode"
                              value="set"
                              checked={stockMode === "set"}
                              onChange={() => setStockMode("set")}
                              className="text-cyan-600 focus:ring-cyan-500 h-3.5 w-3.5"
                            />
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            Zaliha se postavlja <strong>tačno na broj iz CSV-a</strong>. Razlika se beleži kao popisni zapis u skladištu.
                          </p>
                        </div>
                        <span className="mt-2 text-[10px] font-semibold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md self-start">
                          Preporučeno za inventar
                        </span>
                      </label>

                      {/* 2. UVEĆAVANJE (PRIJEM ROBE) */}
                      <label
                        className={`flex flex-col justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          stockMode === "increment"
                            ? "bg-white border-emerald-500 shadow-sm ring-2 ring-emerald-100"
                            : "bg-white/60 border-slate-200 hover:bg-white"
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                              <PackagePlus className="w-3.5 h-3.5 text-emerald-600" />
                              Prijem (Uvećavanje)
                            </span>
                            <input
                              type="radio"
                              name="stockMode"
                              value="increment"
                              checked={stockMode === "increment"}
                              onChange={() => setStockMode("increment")}
                              className="text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                            />
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            Količina iz CSV-a se <strong>sabira sa postojećim stanjem</strong> u magacinu. Beleži se prijemnica u skladištu.
                          </p>
                        </div>
                        <span className="mt-2 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md self-start">
                          Za novu isporuku robe
                        </span>
                      </label>

                      {/* 3. ZANEMARI ZALIHE */}
                      <label
                        className={`flex flex-col justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          stockMode === "ignore"
                            ? "bg-white border-slate-400 shadow-sm ring-2 ring-slate-100"
                            : "bg-white/60 border-slate-200 hover:bg-white"
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                              <Boxes className="w-3.5 h-3.5 text-slate-500" />
                              Zanemari zalihe
                            </span>
                            <input
                              type="radio"
                              name="stockMode"
                              value="ignore"
                              checked={stockMode === "ignore"}
                              onChange={() => setStockMode("ignore")}
                              className="text-slate-600 focus:ring-slate-500 h-3.5 w-3.5"
                            />
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            Stanje zaliha u magacinu ostaje <strong>potpuno netaknuto</strong>. Ažuriraju se isključivo cene, nazivi i opisi.
                          </p>
                        </div>
                        <span className="mt-2 text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md self-start">
                          Za ažuriranje cenovnika
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* UPOZORENJE AKO IMA NEVALIDNIH REDOVA */}
                  {parseResult.invalidRows.length > 0 && (
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-800 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Sledeći redovi će biti preskočeni zbog nepotpunih podataka:</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 pl-1 max-h-24 overflow-y-auto">
                        {parseResult.invalidRows.slice(0, 5).map((inv, idx) => (
                          <li key={idx}>
                            Red {inv.rowNumber} (SKU: {inv.sku || "nedostaje"}): {inv.reasons.join(", ")}
                          </li>
                        ))}
                        {parseResult.invalidRows.length > 5 && (
                          <li className="font-semibold">... i još {parseResult.invalidRows.length - 5} neispravnih redova.</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* DRY-RUN TABELA PREGLEDA (PRVIH 6 REDOVA) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                        <Eye className="w-3.5 h-3.5 text-cyan-600" />
                        <span>Pregled prvih {Math.min(6, parseResult.validRows.length)} artikala (Dry-run)</span>
                      </div>
                      <span className="text-[11px] text-slate-400">Prikaz formatiranih podataka pre slanja</span>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-400">
                            <th className="px-3 py-2.5">SKU</th>
                            <th className="px-3 py-2.5">Naziv</th>
                            <th className="px-3 py-2.5">Kategorija</th>
                            <th className="px-3 py-2.5">Brend</th>
                            <th className="px-3 py-2.5">Cena</th>
                            <th className="px-3 py-2.5">Stara cena</th>
                            <th className="px-3 py-2.5">
                              Zaliha u CSV-u
                              <span className="block text-[9px] font-normal lowercase">
                                ({stockMode === "set" ? "popis" : stockMode === "increment" ? "uvećanje" : "zanemaruje se"})
                              </span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {parseResult.validRows.slice(0, 6).map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="px-3 py-2 font-mono font-bold text-slate-700">{item.sku}</td>
                              <td className="px-3 py-2 font-medium text-slate-900 max-w-[200px] truncate">{item.name}</td>
                              <td className="px-3 py-2 text-slate-600">{item.category}</td>
                              <td className="px-3 py-2 text-slate-600">{item.brand}</td>
                              <td className="px-3 py-2 font-black text-slate-900">{item.price.toLocaleString("sr-RS")} RSD</td>
                              <td className="px-3 py-2 text-slate-400">
                                {item.salePrice ? `${item.salePrice.toLocaleString("sr-RS")} RSD` : "—"}
                              </td>
                              <td className="px-3 py-2 font-bold">
                                {item.stockQuantity === null ? (
                                  <span className="text-slate-400 font-normal">Nije navedeno (ne menja se)</span>
                                ) : stockMode === "ignore" ? (
                                  <span className="text-slate-400 line-through">{item.stockQuantity} {item.unit || "kom"}</span>
                                ) : stockMode === "increment" ? (
                                  <span className="text-emerald-700">+{item.stockQuantity} {item.unit || "kom"}</span>
                                ) : (
                                  <span className="text-slate-800">{item.stockQuantity} {item.unit || "kom"}</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. KORAK: U TOKU JE PROCES UVOZA (PROGRESS BAR) */}
              {isImporting && (
                <div className="py-10 space-y-6">
                  <div className="text-center space-y-2">
                    <RefreshCw className="w-10 h-10 animate-spin text-cyan-600 mx-auto" />
                    <h3 className="text-lg font-black text-slate-900">Uvoz artikala u toku...</h3>
                    <p className="text-xs text-slate-500">
                      Obrađujem seriju <strong>{currentBatchIndex}</strong> od <strong>{totalBatches}</strong> ({BATCH_SIZE} artikala po seriji)
                    </p>
                  </div>

                  {/* PROGRES BAR */}
                  <div className="space-y-1.5 max-w-lg mx-auto">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>Napredak uvoza</span>
                      <span>{progressPercentage}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300 rounded-full"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* STATISTIKA UŽIVO */}
                  <div className="grid grid-cols-4 gap-2.5 max-w-lg mx-auto text-center">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Kreirano</span>
                      <strong className="text-base font-black text-emerald-600">{createdCount}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Ažurirano</span>
                      <strong className="text-base font-black text-cyan-600">{updatedCount}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Kartica skladišta</span>
                      <strong className="text-base font-black text-indigo-600">{movementsCount}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Grešaka</span>
                      <strong className="text-base font-black text-red-600">{failedErrors.length}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. KORAK: ZAVRŠETAK UVOZA */}
              {isCompleted && (
                <div className="py-8 space-y-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                    <Check className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-900">Uvoz je uspešno završen!</h3>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                      Svi artikli su obrađeni u izabranom režimu zaliha (
                      <strong>{stockMode === "set" ? "popis" : stockMode === "increment" ? "prijem robe" : "bez menjanja zaliha"}</strong>).
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-lg mx-auto">
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                      <span className="text-[10px] uppercase font-bold text-emerald-700 block">Novih artikala</span>
                      <strong className="text-lg font-black text-emerald-900">{createdCount}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-center">
                      <span className="text-[10px] uppercase font-bold text-cyan-700 block">Ažuriranih</span>
                      <strong className="text-lg font-black text-cyan-900">{updatedCount}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-center">
                      <span className="text-[10px] uppercase font-bold text-indigo-700 block">Skladišnih promena</span>
                      <strong className="text-lg font-black text-indigo-900">{movementsCount}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Grešaka</span>
                      <strong className="text-lg font-black text-slate-700">{failedErrors.length}</strong>
                    </div>
                  </div>

                  {failedErrors.length > 0 && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-left text-xs text-red-800 max-w-md mx-auto space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>Artikli koji nisu mogli biti uvezeni:</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 max-h-24 overflow-y-auto pl-1">
                        {failedErrors.map((err, idx) => (
                          <li key={idx}>
                            SKU <strong>{err.sku}</strong>: {err.error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* PODNOŽJE MODALA (AKCIJE) */}
            <div className="border-t border-slate-100 p-4 sm:p-6 bg-slate-50 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isImporting}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
              >
                {isCompleted ? "Zatvori prozor" : "Otkaži"}
              </button>

              {parseResult && !isImporting && !isCompleted && (
                <button
                  type="button"
                  onClick={handleStartImport}
                  disabled={parseResult.validRows.length === 0}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 text-white text-xs sm:text-sm font-black shadow-md hover:bg-cyan-700 transition active:scale-95 disabled:opacity-50"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Potvrdi uvoz ({parseResult.validRows.length} artikala)</span>
                </button>
              )}

              {isCompleted && (
                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-black shadow-md hover:bg-emerald-700 transition active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Završi i osveži listu</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
