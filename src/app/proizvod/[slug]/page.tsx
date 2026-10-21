import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShoppingCart, Check, Truck, ShieldCheck, ArrowLeft, Wrench, MapPin } from "lucide-react";
import { getDbProductBySlug, getDbProducts } from "@/services/product-service";
import { productJsonLd, productVatLabel } from "@/lib/product-seo";
import { formatPrice } from "@/lib/utils";
import ProductCard from "@/components/catalog/ProductCard";
import AddToCartBox from "@/components/catalog/AddToCartBox";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getDbProductBySlug(slug);
  if (!product) return { title: "Proizvod nije pronađen" };
  const description = product.shortDescription || product.description || `${product.name} — ${product.brand}.`;
  const url = `/proizvod/${product.slug}`;
  return {
    title: product.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: product.name,
      description,
      url,
      images: product.images[0] ? [{ url: product.images[0] }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getDbProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = (await getDbProducts({ categorySlug: product.categorySlug, limit: 5 }))
    .filter((p) => p.id !== product.id)
    .slice(0, 4);
  const productUrl = `/proizvod/${product.slug}`;

  return (
    <div className="min-h-screen bg-slate-50 py-5 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product, productUrl)) }} />
      <div className="container mx-auto space-y-6 px-3 sm:space-y-12 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 overflow-hidden text-[10px] font-medium text-slate-500 sm:text-xs">
          <Link href="/" className="hover:text-[#005B94]">Početna</Link>
          <span>/</span>
          <Link href="/katalog" className="hover:text-[#005B94]">Katalog</Link>
          <span>/</span>
          <Link href={`/katalog/${product.categorySlug}`} className="hover:text-[#005B94]">{product.categoryName}</Link>
          <span>/</span>
          <span className="text-slate-900 font-bold truncate max-w-xs">{product.name}</span>
        </div>

        {/* Product Main Section */}
        <div className="grid grid-cols-1 gap-5 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:gap-10 sm:p-10 lg:grid-cols-12">
          {/* Images Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-3 sm:p-8">
              <Image
                src={product.images[0] || "/placeholder-tool.svg"}
                alt={product.name}
                fill
                className="object-contain p-2 sm:p-4"
                priority
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-5 lg:col-span-6 lg:space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black bg-blue-100 text-[#005B94] px-3 py-1 rounded-full uppercase tracking-wider">
                  {product.brand}
                </span>
                <span className="text-xs text-slate-400 font-mono">Šifra: {product.sku}</span>
              </div>
              <h1 className="text-xl font-black leading-tight text-slate-900 sm:text-3xl">
                {product.name}
              </h1>
            </div>

            {/* Price & Stock */}
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {product.salePrice ? (
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 line-through block">{formatPrice(product.price)}</span>
                    <span className="text-2xl font-black text-red-600 block">{formatPrice(product.salePrice)}</span>
                  </div>
                ) : (
                  <span className="text-2xl font-black text-slate-900 block">{formatPrice(product.price)}</span>
                )}
                <span className="text-[11px] text-slate-500 mt-0.5 block">{productVatLabel(product.vatRate)}</span>
              </div>

              <div className="text-left sm:text-right">
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

            {/* Add to Cart Component */}
            <AddToCartBox product={product} />

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-slate-600 text-sm leading-relaxed">{product.shortDescription}</p>
            )}

            {/* Attributes List */}
            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Tehničke karakteristike:</h4>
                <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
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
          <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-10">
            <h3 className="text-lg font-black text-slate-900">Detaljan opis proizvoda</h3>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-900">Slični proizvodi</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
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
