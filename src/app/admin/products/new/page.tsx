"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Trash2, Upload, Check } from "lucide-react";
import { createAdminProduct } from "@/actions/product-admin-actions";
import { uploadMediaAction } from "@/actions/media-actions";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    sku: "",
    barcode: "",
    brand: "Makita",
    categorySlug: "alati",
    categoryName: "Alati i oprema",
    price: 0,
    salePrice: "" as string | number,
    stockQuantity: 10,
    inStock: true,
    wmsLocation: "A-01-01",
    shortDescription: "",
    description: "",
    images: ["/placeholder-tool.svg"],
    isFeatured: false,
    isPromo: false,
  });

  const [attributes, setAttributes] = useState<{ key: string; value: string }[]>([
    { key: "Napon", value: "18V" },
    { key: "Garancija", value: "3 godine" },
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }

    if (name === "name") {
      const autoSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      setForm((prev) => ({ ...prev, name: value, slug: autoSlug }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setError("");

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
      formData.append("folder", "products");

      const res = await uploadMediaAction(formData);
      if (res.success && res.uploaded.length > 0) {
        const newUrls = res.uploaded.map((item) => item.url);
        setForm((prev) => ({
          ...prev,
          images: prev.images[0] === "/placeholder-tool.svg" ? newUrls : [...prev.images, ...newUrls],
        }));
      }
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : null) || "Greška pri otpremanju slike.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    const updated = form.images.filter((_, i) => i !== index);
    setForm({ ...form, images: updated.length > 0 ? updated : ["/placeholder-tool.svg"] });
  };

  const setAsMainImage = (index: number) => {
    if (index === 0) return;
    const imgs = [...form.images];
    const [main] = imgs.splice(index, 1);
    imgs.unshift(main);
    setForm({ ...form, images: imgs });
  };

  const handleAttributeChange = (index: number, field: "key" | "value", val: string) => {
    const updated = [...attributes];
    updated[index][field] = val;
    setAttributes(updated);
  };

  const addAttributeRow = () => {
    setAttributes([...attributes, { key: "", value: "" }]);
  };

  const removeAttributeRow = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const attrObj: Record<string, string> = {};
      attributes.forEach((attr) => {
        if (attr.key.trim()) {
          attrObj[attr.key.trim()] = attr.value;
        }
      });

      await createAdminProduct({
        ...form,
        price: Number(form.price),
        salePrice: form.salePrice !== "" ? Number(form.salePrice) : null,
        stockQuantity: Number(form.stockQuantity),
        attributes: attrObj,
      });

      router.push("/admin/products");
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : null) || "Greška pri čuvanju proizvoda.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="p-2 text-slate-400 hover:text-slate-700 bg-white border border-slate-200 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Dodavanje novog proizvoda</h1>
            <p className="text-slate-500 text-xs mt-0.5">Unesite podatke o novom artiklu u katalogu.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-black text-slate-900 pb-4 border-b border-slate-100">Osnovni podaci</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Naziv proizvoda *</label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Npr. Makita Aku Bušilica..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-cyan-500 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Slug (URL) *</label>
              <input
                type="text"
                name="slug"
                required
                value={form.slug}
                onChange={handleChange}
                placeholder="makita-aku-busilica"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-cyan-500 outline-none font-mono text-cyan-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">SKU / Šifra *</label>
              <input
                type="text"
                name="sku"
                required
                value={form.sku}
                onChange={handleChange}
                placeholder="TOOL-M-001"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-cyan-500 outline-none font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Brend *</label>
              <input
                type="text"
                name="brand"
                required
                value={form.brand}
                onChange={handleChange}
                placeholder="Makita"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-cyan-500 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Kategorija *</label>
              <select
                name="categorySlug"
                value={form.categorySlug}
                onChange={(e) => {
                  const val = e.target.value;
                  const nameMap: Record<string, string> = {
                    alati: "Alati i oprema",
                    vodovod: "Vodovod i kanalizacija",
                    kupatila: "Kupatilska oprema i sanitarije",
                    navodnjavanje: "Sistemi za navodnjavanje",
                  };
                  setForm({ ...form, categorySlug: val, categoryName: nameMap[val] || val });
                }}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-cyan-500 outline-none"
              >
                <option value="alati">Alati i oprema</option>
                <option value="vodovod">Vodovod i kanalizacija</option>
                <option value="kupatila">Kupatilska oprema i sanitarije</option>
                <option value="navodnjavanje">Sistemi za navodnjavanje</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">Kratak opis</label>
            <input
              type="text"
              name="shortDescription"
              value={form.shortDescription}
              onChange={handleChange}
              placeholder="Kratak rezime proizvoda..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-cyan-500 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">Detaljan opis</label>
            <textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              placeholder="Detaljne specifikacije i opis..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-cyan-500 outline-none resize-none"
            />
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-black text-slate-900 pb-4 border-b border-slate-100">Cene i zalihe</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Redovna cena (RSD) *</label>
              <input
                type="number"
                name="price"
                required
                min={0}
                value={form.price}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-cyan-500 outline-none font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Akcijska cena (RSD)</label>
              <input
                type="number"
                name="salePrice"
                min={0}
                value={form.salePrice}
                onChange={handleChange}
                placeholder="Ostavite prazno ako nema akcije"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-cyan-500 outline-none font-bold text-red-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Količina na stanju *</label>
              <input
                type="number"
                name="stockQuantity"
                required
                min={0}
                value={form.stockQuantity}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-cyan-500 outline-none font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">WMS Lokacija u magacinu</label>
              <input
                type="text"
                name="wmsLocation"
                value={form.wmsLocation}
                onChange={handleChange}
                placeholder="Npr. A-03-02"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-cyan-500 outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Images with Direct File Upload */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-black text-slate-900 pb-4 border-b border-slate-100">Fotografije proizvoda</h2>
          
          <div className="space-y-4">
            {/* Upload Box */}
            <div className="border-2 border-dashed border-slate-200 hover:border-cyan-500 rounded-2xl p-6 text-center transition-colors bg-slate-50">
              <label className="cursor-pointer space-y-2 block">
                <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 block">
                  {uploadingImage ? "Otpremanje slika..." : "Kliknite ovde da izaberete slike sa računara"}
                </span>
                <span className="text-[10px] text-slate-400 block">Podržani formati: JPG, PNG, WebP (do 4MB po slici)</span>
                <input 
                  type="file" 
                  multiple 
                  accept="image/jpeg,image/png,image/webp" 
                  onChange={handleFileUpload} 
                  disabled={uploadingImage} 
                  className="hidden" 
                />
              </label>
            </div>

            {/* Images Preview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {form.images.map((url, idx) => (
                <div key={idx} className={`relative bg-slate-50 rounded-2xl border-2 p-3 flex flex-col items-center justify-center gap-2 group ${idx === 0 ? "border-cyan-600 bg-cyan-50/30" : "border-slate-200"}`}>
                  <div className="relative w-20 h-20">
                    <img src={url} alt={`Slika ${idx + 1}`} className="absolute inset-0 h-full w-full object-contain" loading="lazy" />
                  </div>
                  {idx === 0 ? (
                    <span className="text-[10px] font-black text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded-md">Glavna slika</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAsMainImage(idx)}
                      className="text-[10px] font-bold text-slate-600 hover:text-cyan-700 underline"
                    >
                      Postavi kao glavnu
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    title="Ukloni sliku"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Technical Characteristics */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-base font-black text-slate-900">Tehničke karakteristike</h2>
            <button
              type="button"
              onClick={addAttributeRow}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Dodaj karakteristiku
            </button>
          </div>

          <div className="space-y-3">
            {attributes.map((attr, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="text"
                  value={attr.key}
                  onChange={(e) => handleAttributeChange(idx, "key", e.target.value)}
                  placeholder="Naziv (npr. Napon)"
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                />
                <input
                  type="text"
                  value={attr.value}
                  onChange={(e) => handleAttributeChange(idx, "value", e.target.value)}
                  placeholder="Vrednost (npr. 18V)"
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeAttributeRow(idx)}
                  className="p-2.5 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/admin/products"
            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-2xl hover:bg-slate-100 transition-colors"
          >
            Otkaži
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-2xl transition-all shadow-lg shadow-cyan-600/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {loading ? "Čuvanje..." : "Sačuvaj proizvod"}
          </button>
        </div>
      </form>
    </div>
  );
}
