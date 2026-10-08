"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";
import ShareButton from "./ShareButton";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [logoUrl, setLogoUrl] = useState("/images/aqua-still-logo.png");
  const [logoAlt, setLogoAlt] = useState("Aqua Still Zlatibor");

  useEffect(() => {
    let active = true;

    fetch("/api/site/logo", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Logo nije dostupan.");
        return response.json() as Promise<{ url: string; altText?: string | null }>;
      })
      .then((data) => {
        if (!active) return;
        if (data.url) setLogoUrl(data.url);
        if (data.altText) setLogoAlt(data.altText);
      })
      .catch((error) => console.error("Footer logo fetch failed:", error));

    return () => {
      active = false;
    };
  }, []);

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        <div className="grid grid-cols-2 gap-4 md:gap-12 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="col-span-2 space-y-4 pb-3 md:col-span-1 md:space-y-6 md:pb-0">
            <Link href="/" aria-label="Aqua Still Zlatibor — početna strana" className="relative flex h-12 w-[190px] items-center">
              <Image
                src={logoUrl}
                alt={logoAlt}
                fill
                sizes="190px"
                className="object-contain object-left"
              />
            </Link>
            <p className="text-sm leading-relaxed">
              Vaš pouzdan partner za vodovod, alate, kupatilsku opremu i sisteme za navodnjavanje na Zlatiboru i šire. Kvalitet i iskustvo od poverenja.
            </p>
            <div className="flex space-x-4">
              <ShareButton ariaLabel="Podeli Aqua Still sajt" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-6">Brzi linkovi</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/katalog" className="hover:text-white hover:underline transition-all">Svi proizvodi</Link></li>
              <li><Link href="/katalog/alati" className="hover:text-white hover:underline transition-all">Alati i oprema</Link></li>
              <li><Link href="/katalog/vodovod" className="hover:text-white hover:underline transition-all">Vodovod i kanalizacija</Link></li>
              <li><Link href="/katalog/kupatila" className="hover:text-white hover:underline transition-all">Kupatilska oprema</Link></li>
              <li><Link href="/katalog/navodnjavanje" className="hover:text-white hover:underline transition-all">Navodnjavanje</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-white font-bold mb-6">Korisnička podrška</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/o-nama" className="hover:text-white transition-all">O nama</Link></li>
              <li><Link href="/kontakt" className="hover:text-white transition-all">Kontakt</Link></li>
              <li><Link href="/isporuka" className="hover:text-white transition-all">Isporuka i plaćanje</Link></li>
              <li><Link href="/reklamacije" className="hover:text-white transition-all">Reklamacije</Link></li>
              <li><Link href="/politika-privatnosti" className="hover:text-white transition-all">Politika privatnosti</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-white font-bold mb-6">Kontakt podaci</h3>
            <div className="flex items-start space-x-3 text-sm">
              <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
              <span>Magistralni put bb,<br />31315 Zlatibor, Srbija</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Phone className="w-5 h-5 text-blue-500 shrink-0" />
              <span>+381 31 123 456</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Mail className="w-5 h-5 text-blue-500 shrink-0" />
              <span>info@aquastill-zlatibor.rs</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 flex flex-col items-center justify-between space-y-2 border-t border-slate-800 pt-5 text-center text-[10px] md:mt-12 md:flex-row md:space-y-0 md:pt-8 md:text-xs">
          <p>© {currentYear} Aqua Still Zlatibor. Sva prava zadržana.</p>
          <div className="flex space-x-6 uppercase tracking-tighter">
            <span>PIB: 123456789</span>
            <span>Matični broj: 01234567</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
