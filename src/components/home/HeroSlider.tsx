"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, Wrench, Droplets, Bath, Sprout, Sparkles } from "lucide-react";
import { HeroSlideItem, DEFAULT_HERO_SLIDES } from "@/lib/home-content";

function SlideIcon({ idOrCategory, className }: { idOrCategory: string; className?: string }) {
  const text = (idOrCategory || "").toLowerCase();
  if (text.includes("alat")) return <Wrench className={className} />;
  if (text.includes("vodovod") || text.includes("cev")) return <Droplets className={className} />;
  if (text.includes("kupat")) return <Bath className={className} />;
  if (text.includes("navodnj") || text.includes("bast") || text.includes("pump")) return <Sprout className={className} />;
  return <Sparkles className={className} />;
}

interface HeroSliderProps {
  slides?: HeroSlideItem[];
}

export default function HeroSlider({ slides: propSlides }: HeroSliderProps) {
  const activeSlides = (propSlides && propSlides.length > 0) ? propSlides : DEFAULT_HERO_SLIDES;
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % activeSlides.length);
  }, [activeSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  }, [activeSlides.length]);

  // Automatska rotacija na svakih 6 sekundi (pauzira se na hover)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    setTouchStartX(null);
  };

  const activeSlide = activeSlides[current] || activeSlides[0];

  return (
    <div
      className="relative overflow-hidden bg-slate-950 text-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 1. Pozadinska fotografija sa glatkom tranzicijom */}
      {activeSlide.imageUrl ? (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <Image
            src={activeSlide.imageUrl}
            alt={activeSlide.category || activeSlide.title}
            fill
            priority={current === 0}
            sizes="100vw"
            unoptimized
            className="object-cover object-center transition-all duration-700 scale-100"
          />
          {/* Poluprovidni preliv: taman sa leve strane za čitljivost teksta, prozirniji sa desne da slika bude jasna */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/30" />
        </div>
      ) : (
        /* 2. Rezervni gradient preliv samo ukoliko nema slike */
        <div
          className={`absolute inset-0 z-0 bg-gradient-to-r ${activeSlide.bgGradient || "from-slate-950 via-slate-900 to-cyan-950"} transition-all duration-700 ease-in-out opacity-95`}
        />
      )}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
          {/* Tekstualni sadržaj slajda */}
          <div className="lg:col-span-8 space-y-3 sm:space-y-3.5">
            {/* Oznaka / Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300 backdrop-blur-sm sm:text-[11px]">
              <SlideIcon idOrCategory={activeSlide.id || activeSlide.category} className="h-3.5 w-3.5 text-cyan-400" />
              <span>{activeSlide.badge}</span>
            </div>

            {/* Glavni naslov */}
            <h1 className="text-2xl font-black leading-[1.12] tracking-tight sm:text-3xl md:text-4xl lg:text-[40px]">
              {activeSlide.title}{" "}
              <span
                className={`bg-gradient-to-r ${activeSlide.accentColor || "from-amber-400 to-cyan-400"} bg-clip-text text-transparent`}
              >
                {activeSlide.highlight}
              </span>
            </h1>

            {/* Opis */}
            <p className="max-w-xl text-xs leading-relaxed text-slate-300 sm:text-sm">
              {activeSlide.description}
            </p>

            {/* Dugmad za akciju */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <Link
                href={activeSlide.buttonHref || "/katalog"}
                className="group inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#F37021] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#F37021]/25 transition-all hover:bg-[#D95D13] active:scale-95"
              >
                <span>{activeSlide.buttonLabel || "POGLEDAJ PONUDU"}</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/katalog"
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                Ceo katalog
              </Link>
            </div>
          </div>

          {/* Desni panel sa preview karticom kategorije */}
          <div className="hidden lg:col-span-4 lg:flex lg:justify-end">
            <div className="w-full max-w-[280px] rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 backdrop-blur-md shadow-2xl overflow-hidden">
              {activeSlide.imageUrl ? (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-3 border border-white/10 shadow-inner bg-slate-900">
                  <Image
                    src={activeSlide.imageUrl}
                    alt={activeSlide.category}
                    fill
                    sizes="280px"
                    unoptimized
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-cyan-300 mb-3">
                  <SlideIcon idOrCategory={activeSlide.id || activeSlide.category} className="h-5 w-5" />
                </div>
              )}
              <h3 className="text-sm font-black text-white">{activeSlide.category}</h3>
              <p className="mt-1 text-[11px] text-slate-300 leading-relaxed">
                Istražite kompletan asortiman, proverite trenutno stanje lagera i poručite sa isporukom na adresu.
              </p>
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-bold text-cyan-300">
                <span>Aqua Still Zlatibor</span>
                <span>Deo ponude &rarr;</span>
              </div>
            </div>
          </div>
        </div>

        {/* Donja kontrolna traka: Tabovi i Strelice */}
        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-4 sm:flex-row">
          {/* Tab indikatori za teme */}
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            {activeSlides.map((slide, index) => {
              const isCurrent = index === current;
              return (
                <button
                  key={slide.id || index}
                  type="button"
                  onClick={() => setCurrent(index)}
                  className={`flex items-center gap-2 rounded-xl px-2.5 py-1 text-[11px] font-bold transition-all ${
                    isCurrent
                      ? "bg-white text-slate-900 shadow-md ring-2 ring-[#F37021]"
                      : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                  }`}
                  aria-label={`Prebaci na baner: ${slide.category}`}
                  aria-current={isCurrent ? "true" : undefined}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isCurrent ? "bg-[#F37021]" : "bg-slate-400"
                    }`}
                  />
                  <span>{slide.category}</span>
                </button>
              );
            })}
          </div>

          {/* Strelice levo / desno */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Prethodni baner"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Sledeći baner"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
