"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingCart, Menu, X, User, Heart, Globe, Share2, ChevronDown } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";
import type { ProductCategory } from "@/types";

export default function Header() {
  const { cart, setIsCartOpen } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<ProductCategory[]>([]);

  React.useEffect(() => {
    let active = true;
    fetch("/api/catalog/categories", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Kategorije nisu dostupne.");
        return response.json() as Promise<ProductCategory[]>;
      })
      .then((data) => {
        if (active) setCategories(data);
      })
      .catch((error) => console.error("Storefront categories fetch failed:", error));
    return () => { active = false; };
  }, []);

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
      {/* Top Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <p className="hidden md:block">Dobro došli u Aqua Still Shop — Deo Aqua Still Group</p>
          <div className="flex items-center space-x-6 ml-auto">
            <div className="hidden lg:flex items-center space-x-4">
              <Link href="/o-nama" className="hover:text-white transition-colors">O nama</Link>
              <span>|</span>
              <Link href="/isporuka" className="hover:text-white transition-colors">Dostava</Link>
              <span>|</span>
              <Link href="/reklamacije" className="hover:text-white transition-colors">Povrat i reklamacije</Link>
              <span>|</span>
              <Link href="/kontakt" className="hover:text-white transition-colors">Kontakt</Link>
            </div>
            <div className="flex items-center space-x-3 text-slate-400">
              <button type="button" aria-label="Izbor jezika" title="Izbor jezika" className="hover:text-white transition-colors"><Globe className="w-3.5 h-3.5" /></button>
              <button type="button" aria-label="Podeli Aqua Still Shop" title="Podeli" className="hover:text-white transition-colors"><Share2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4 md:gap-8">
          {/* Logo Image */}
          <Link href="/" className="flex items-center shrink-0">
            <div className="relative h-9 w-[132px] sm:h-12 sm:w-[200px]">
              <Image 
                src="/images/aqua-still-logo.png" 
                alt="Aqua Still Zlatibor Logo" 
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          {/* Search Bar */}
          <form action="/katalog" method="GET" className="hidden md:flex flex-1 max-w-2xl relative">
            <input
              type="text"
              name="q"
              placeholder="Pretražite proizvode, brendove, kategorije..."
              className="w-full pl-4 pr-28 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-full text-sm transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-1 top-1 bottom-1 px-6 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-full text-sm flex items-center gap-2 transition-colors shadow-sm">
              <Search className="w-4 h-4" /> Pretraži
            </button>
          </form>

          {/* User Actions */}
          <div className="flex items-center space-x-4 md:space-x-6">
            <Link href="/nalog" className="hidden lg:flex items-center space-x-2 text-slate-700 hover:text-cyan-600 transition-colors">
              <User className="w-5 h-5" />
              <div className="text-left text-xs">
                <span className="block text-slate-400">Prijava</span>
                <span className="font-bold">Moj nalog</span>
              </div>
            </Link>

            <Link href="/zelje" className="hidden lg:flex items-center space-x-2 text-slate-700 hover:text-cyan-600 transition-colors">
              <Heart className="w-5 h-5" />
              <div className="text-left text-xs">
                <span className="block text-slate-400">Omiljeno</span>
                <span className="font-bold">Lista želja</span>
              </div>
            </Link>

            <button 
              type="button"
              aria-label={totalItems > 0 ? `Otvori korpu, ${totalItems} artikala` : "Otvori praznu korpu"}
              onClick={() => setIsCartOpen(true)}
              className="flex min-h-10 items-center space-x-2 rounded-xl bg-slate-900 px-3 py-2 text-white transition-colors shadow-sm group sm:space-x-3 sm:rounded-full sm:px-4 sm:py-2.5"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 flex items-center justify-center w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full">
                    {totalItems}
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <span className="block text-slate-400 group-hover:text-cyan-100">Korpa</span>
                <span className="font-bold">{totalItems === 0 ? "0 RSD" : formatPrice(cart.total)}</span>
              </div>
            </button>

            <button 
              type="button"
              aria-label={isMenuOpen ? "Zatvori mobilni meni" : "Otvori mobilni meni"}
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-full"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <form action="/katalog" method="GET" className="flex gap-2 border-t border-slate-100 bg-white px-3 pb-3 pt-2 md:hidden">
        <label htmlFor="mobile-store-search" className="sr-only">Pretraga proizvoda</label>
        <input id="mobile-store-search" type="search" name="q" placeholder="Pretraži proizvode..." className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100" />
        <button type="submit" aria-label="Pretraži" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 text-sm font-bold text-white hover:bg-cyan-700"><Search className="h-4 w-4" /><span>Traži</span></button>
      </form>
      {/* Main category navigation */}
      <div className="relative z-40 hidden bg-slate-900 text-white md:block">
        <div className="container mx-auto px-4 flex items-center gap-3">
          <div className="relative py-2">
            <button
              type="button"
              aria-expanded={isCategoriesOpen}
              aria-controls="desktop-category-menu"
              onClick={() => setIsCategoriesOpen((open) => !open)}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors whitespace-nowrap"
            >
              <Menu className="w-4 h-4" />
              Sve kategorije
              <ChevronDown className={`w-4 h-4 transition-transform ${isCategoriesOpen ? "rotate-180" : ""}`} />
            </button>
            {isCategoriesOpen && (
              <div id="desktop-category-menu" className="absolute left-0 top-full mt-2 w-[min(94vw,880px)] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-2xl shadow-slate-950/20">
                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_240px]">
                  <div className="p-4 sm:p-6">
                    <div className="mb-4 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-700">Aqua Still Shop</p>
                        <h2 className="mt-1 text-lg font-black text-slate-900">Istražite kategorije</h2>
                      </div>
                      <span className="hidden text-xs font-medium text-slate-400 sm:block">Izaberite grupu proizvoda</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {categories.map((category) => (
                        <Link
                          key={category.slug}
                          href={`/katalog/${category.slug}`}
                          onClick={() => setIsCategoriesOpen(false)}
                          className="group flex min-w-0 items-center gap-3 rounded-xl border border-transparent p-3 transition hover:border-cyan-100 hover:bg-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                        >
                          <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg font-black text-cyan-700 transition group-hover:bg-white">{category.name.slice(0, 1)}</span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-bold text-slate-800 group-hover:text-cyan-800">{category.name}</span>
                            <span className="mt-0.5 block truncate text-xs text-slate-500">{category.description}</span>
                          </span>
                          <ChevronDown className="ml-auto h-4 w-4 shrink-0 -rotate-90 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-cyan-600" />
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col justify-between bg-slate-950 p-5 text-white sm:p-6">
                    <div>
                      <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-cyan-200">Kompletna ponuda</span>
                      <h3 className="mt-4 text-xl font-black leading-tight">Sve za vaš sledeći projekat.</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300">Pronađite alat, materijal i opremu na jednom mestu.</p>
                    </div>
                    <Link href="/katalog" onClick={() => setIsCategoriesOpen(false)} className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-cyan-500">
                      Pogledaj ceo katalog <ChevronDown className="h-4 w-4 -rotate-90" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
          <nav aria-label="Glavna navigacija" className="flex min-w-0 items-center gap-1 overflow-x-auto py-2">
            <Link href="/katalog/akcija" className="rounded-lg px-4 py-2 text-sm font-semibold text-orange-400 hover:bg-slate-800 hover:text-orange-300 transition-colors whitespace-nowrap">
              Akcije
            </Link>
            <Link href="/brendovi" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap">
              Brendovi
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute left-0 top-full z-[60] max-h-[80vh] w-full overflow-y-auto border-b border-slate-200 bg-white text-slate-800 shadow-xl">
          <nav aria-label="Mobilna navigacija" className="flex flex-col gap-1 p-3">
            <Link href="/katalog" onClick={() => setIsMenuOpen(false)} className="mb-1 flex min-h-12 items-center rounded-xl bg-cyan-50 px-4 py-3 text-sm font-black text-cyan-800">
              Sve kategorije — ceo katalog
            </Link>
            <Link href="/katalog/akcija" onClick={() => setIsMenuOpen(false)} className="border-b border-slate-100 px-3 py-3 text-sm font-bold text-orange-600">Akcije</Link>
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/katalog/${category.slug}`}
                onClick={() => setIsMenuOpen(false)}
                className="border-b border-slate-100 px-3 py-3 text-sm font-medium text-slate-800 hover:bg-cyan-50 hover:text-cyan-800"
              >
                {category.name}
              </Link>
            ))}
            <Link href="/brendovi" onClick={() => setIsMenuOpen(false)} className="px-3 py-3 text-sm font-medium text-slate-800">Brendovi</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
