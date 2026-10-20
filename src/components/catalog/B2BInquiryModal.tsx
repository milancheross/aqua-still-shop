"use client";

import React, { useState } from "react";
import { X, Send, Building2, CheckCircle, FileText } from "lucide-react";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";

interface B2BInquiryModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function B2BInquiryModal({
  product,
  isOpen,
  onClose,
}: B2BInquiryModalProps) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [pib, setPib] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [quantity, setQuantity] = useState("10");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulacija slanja upita na server
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setSubmitted(false);
    setName("");
    setCompany("");
    setPib("");
    setPhone("");
    setEmail("");
    setQuantity("10");
    setNote("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="b2b-modal-title"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-sm">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h2 id="b2b-modal-title" className="text-sm font-black text-slate-900">
                B2B Upit / Zahtev za ponudu
              </h2>
              <p className="text-[11px] font-medium text-slate-500">
                Za majstore, izvođače radova i veće projekte
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Upit je uspešno poslat!</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Hvala vam. Naš komercijalni tim će pregledati vaš zahtev za{" "}
              <strong className="text-slate-800">{product.name}</strong> i javiti vam se u najkraćem roku sa ponudom i predračunom sa uračunatim B2B rabatom.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-6 rounded-xl bg-cyan-600 px-6 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-cyan-700"
            >
              Zatvori
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            {/* Pregled odabranog proizvoda */}
            <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 truncate max-w-[280px]">
                  {product.name}
                </span>
                <span className="font-black text-cyan-700">
                  {formatPrice(product.salePrice ?? product.price)}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-500">
                <span>Šifra: <strong className="text-slate-700">{product.sku}</strong></span>
                <span>&bull;</span>
                <span>Brend: <strong className="text-slate-700">{product.brand}</strong></span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-700">
                    Ime i prezime *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="npr. Marko Marković"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-700">
                    Firma / Preduzetnik (opciono)
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="npr. Gradnja Zlatibor d.o.o."
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-700">
                    PIB (za pravna lica)
                  </label>
                  <input
                    type="text"
                    value={pib}
                    onChange={(e) => setPib(e.target.value)}
                    placeholder="101234567"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-700">
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="064/123-4567"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-700">
                    Okvirna količina *
                  </label>
                  <input
                    type="text"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="npr. 20 kom"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-700">
                  Email za ponudu *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kontakt@primer.rs"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-700">
                  Dodatni spisak materijala ili napomena
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Unesite dodatne stavke ili specifikaciju ako vam je potreban kompletan predmer..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
              >
                Otkaži
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-600 px-5 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-cyan-700 disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{loading ? "Slanje..." : "Pošalji upit za ponudu"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

