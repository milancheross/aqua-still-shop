"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ShoppingCart, Menu, X, Droplets, User, Heart, Globe, Share2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { CATEGORIES } from "@/lib/mock-data";
import { formatPrice } from "@/lib/utils";

export default function Header() {
  const { cart, setIsCartOpen } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 shrink-0">
            <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <Droplets className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tighter text-slate-900 block leading-none">
                AQUA STILL <span className="text-cyan-500">SHOP</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mt-1">
                Deo Aqua Still Group
              </span>
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

      {/* Navigation Bar matching dizajn.png */}
      <div className="bg-slate-900 text-white">
        <div className="container mx-auto px-4 flex items-center justify-between overflow-x-auto no-scrollbar">
          <div className="flex items-center space-x-1 py-2">
            <button className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors shrink-0 mr-4">
              <Menu className="w-4 h-4" /> Sve kategorije
            </button>

            <Link href="/katalog/akcija" className="px-4 py-2 text-sm font-medium text-orange-400 hover:text-white transition-colors whitespace-nowrap">
              Akcije
            </Link>
            <Link href="/katalog/alati" className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white transition-colors whitespace-nowrap">
              Alati
            </Link>
            <Link href="/katalog/vodovod" className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white transition-colors whitespace-nowrap">
              Vodovod
            </Link>
            <Link href="/katalog/kupatila" className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white transition-colors whitespace-nowrap">
              Kupatila
            </Link>
            <Link href="/katalog/navodnjavanje" className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white transition-colors whitespace-nowrap">
              Navodnjavanje
            </Link>
            <Link href="/katalog/grejanje" className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white transition-colors whitespace-nowrap">
              Grejanje
            </Link>
            <Link href="/katalog/elektromaterijal" className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white transition-colors whitespace-nowrap">
              Elektromaterijal
            </Link>
            <Link href="/katalog/majstori" className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white transition-colors whitespace-nowrap">
              Oprema za majstore
            </Link>
            <Link href="/brendovi" className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white transition-colors whitespace-nowrap">
              Brendovi
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl overflow-y-auto max-h-[80vh]">
          <nav className="flex flex-col p-4 space-y-3">
            <Link href="/katalog/akcija" className="text-lg font-bold text-orange-600 px-2 py-1">Akcije</Link>
            {CATEGORIES.map((cat) => (
              <Link 
                key={cat.id} 
                href={`/katalog/${cat.slug}`}
                onClick={() => setIsMenuOpen(false)}
                className="px-2 py-1.5 text-base font-medium text-slate-800 hover:text-cyan-600 flex justify-between items-center border-b border-slate-100"
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
