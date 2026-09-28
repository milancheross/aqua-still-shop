"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingCart, Menu, X, User, Heart, Globe, Share2, ChevronDown } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { CATEGORIES } from "@/lib/mock-data";
import { formatPrice } from "@/lib/utils";

export default function Header() {
  const { cart, setIsCartOpen } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
              <Link href="#" className="hover:text-white transition-colors" title="Global"><Globe className="w-3.5 h-3.5" /></Link>
              <Link href="#" className="hover:text-white transition-colors" title="Social"><Share2 className="w-3.5 h-3.5" /></Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4 md:gap-8">
          {/* Logo Image */}
          <Link href="/" className="flex items-center shrink-0">
            <div className="relative h-10 sm:h-12 w-[150px] sm:w-[200px]">
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
          <div className="hidden md:flex flex-1 max-w-2xl relative">
            <input
              type="text"
              placeholder="Pretražite proizvode, brendove, kategorije..."
              className="w-full pl-4 pr-28 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-full text-sm transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="absolute right-1 top-1 bottom-1 px-6 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-full text-sm flex items-center gap-2 transition-colors shadow-sm">
              <Search className="w-4 h-4" /> Pretraži
            </button>
          </div>

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
              onClick={() => setIsCartOpen(true)}
              className="flex items-center space-x-3 bg-slate-900 hover:bg-cyan-600 text-white px-4 py-2.5 rounded-full transition-colors shadow-sm group"
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
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-full"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main category navigation */}
      <div className="relative z-40 bg-slate-900 text-white">
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
              <div id="desktop-category-menu" className="absolute left-0 top-full mt-1 w-[min(92vw,720px)] rounded-xl border border-slate-200 bg-white p-3 text-slate-800 shadow-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
                  {[
                    { name: "Alati i oprema", slug: "alati" },
                    { name: "Vodovod i kanalizacija", slug: "vodovod" },
                    { name: "Kupatilska oprema i sanitarije", slug: "kupatila" },
                    { name: "Sistemi za navodnjavanje", slug: "navodnjavanje" },
                    { name: "Grejanje", slug: "grejanje" },
                    { name: "Elektromaterijal", slug: "elektromaterijal" },
                    { name: "Oprema za majstore", slug: "majstori" },
                  ].map((category) => (
                    <Link
                      key={category.slug}
                      href={`/katalog/${category.slug}`}
                      onClick={() => setIsCategoriesOpen(false)}
                      className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-cyan-50 hover:text-cyan-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
                <div className="mt-2 border-t border-slate-100 pt-2">
                  <Link href="/katalog" onClick={() => setIsCategoriesOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-bold text-cyan-700 hover:bg-cyan-50">
                    Pogledaj ceo katalog →
                  </Link>
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
        <div className="lg:hidden absolute left-0 top-full z-50 max-h-[80vh] w-full overflow-y-auto border-b border-slate-200 bg-white text-slate-800 shadow-xl">
          <nav aria-label="Mobilna navigacija" className="flex flex-col p-4">
            <Link href="/katalog" onClick={() => setIsMenuOpen(false)} className="mb-2 rounded-lg bg-cyan-50 px-3 py-3 text-sm font-bold text-cyan-800">
              Sve kategorije — ceo katalog
            </Link>
            <Link href="/katalog/akcija" onClick={() => setIsMenuOpen(false)} className="border-b border-slate-100 px-3 py-3 text-sm font-bold text-orange-600">Akcije</Link>
            {[
              { name: "Alati i oprema", slug: "alati" },
              { name: "Vodovod i kanalizacija", slug: "vodovod" },
              { name: "Kupatilska oprema i sanitarije", slug: "kupatila" },
              { name: "Sistemi za navodnjavanje", slug: "navodnjavanje" },
              { name: "Grejanje", slug: "grejanje" },
              { name: "Elektromaterijal", slug: "elektromaterijal" },
              { name: "Oprema za majstore", slug: "majstori" },
            ].map((category) => (
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
