import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShoppingCart, Check, Truck, ShieldCheck, ArrowLeft, Star, Wrench, MapPin } from "lucide-react";
import { getDbProductBySlug, getDbProducts } from "@/services/product-service";
import { formatPrice } from "@/lib/utils";
import ProductCard from "@/components/catalog/ProductCard";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getDbProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = (await getDbProducts({ categorySlug: product.categorySlug }))
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-cyan-600">Početna</Link>
          <span>/</span>
          <Link href="/katalog" className="hover:text-cyan-600">Katalog</Link>
          <span>/</span>
          <Link href={`/katalog/${product.categorySlug}`} className="hover:text-cyan-600">{product.categoryName}</Link>
          <span>/</span>
          <span className="text-slate-900 font-bold truncate max-w-xs">{product.name}</span>
        </div>

        {/* Product Main Section */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Images Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden p-8 flex items-center justify-center">
              <Image
                src={product.images[0] || "/placeholder-tool.svg"}
                alt={product.name}
                fill
                className="object-contain p-4"
                priority
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full uppercase tracking-wider">
                  {product.brand}
                </span>
                <span className="text-xs text-slate-400 font-mono">Šifra: {product.sku}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs text-slate-500">(14 recenzija)</span>
            </div>

            {/* Price & Stock */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                {product.salePrice ? (
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 line-through block">{formatPrice(product.price)}</span>
                    <span className="text-2xl font-black text-red-600 block">{formatPrice(product.salePrice)}</span>
                  </div>
                ) : (
                  <span className="text-2xl font-black text-slate-900 block">{formatPrice(product.price)}</span>
                )}
                <span className="text-[11px] text-slate-500 mt-0.5 block">Cena je sa uračunatim PDV-om (20%)</span>
              </div>

              <div className="text-right">
                {product.inStock && product.stockQuantity > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                    <Check className="w-3.5 h-3.5" /> Na stanju ({product.stockQuantity} {product.unit})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                    Rasprodato
                  </span>
                )}
                {product.wmsLocation && (
                  <span className="text-[10px] text-slate-400 block mt-1 flex items-center justify-end gap-1">
                    <MapPin className="w-3 h-3" /> Magacin: {product.wmsLocation}
                  </span>
                )}
              </div>
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-slate-600 text-sm leading-relaxed">{product.shortDescription}</p>
            )}

            {/* Attributes List */}
            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Tehničke karakteristike:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(product.attributes).map(([key, val]) => (
                    <div key={key} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-slate-400 uppercase text-[10px] block">{key}</span>
                      <span className="font-bold text-slate-800">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Long Description */}
        {product.description && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-4">
            <h3 className="text-lg font-black text-slate-900">Detaljan opis proizvoda</h3>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-900">Slični proizvodi</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
