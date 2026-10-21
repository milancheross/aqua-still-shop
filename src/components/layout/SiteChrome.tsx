"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Wrench, Phone, Mail, ShieldAlert, ArrowRight } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import type { PublicSystemSettings } from "@/services/settings-service";

interface SiteChromeProps {
  children: ReactNode;
  maintenanceMode?: boolean;
  maintenanceNotice?: string;
  isAdmin?: boolean;
  settings?: PublicSystemSettings;
}

export default function SiteChrome({
  children,
  maintenanceMode = false,
  maintenanceNotice,
  isAdmin = false,
  settings,
}: SiteChromeProps) {
  const pathname = usePathname();
  const isStandaloneApp = pathname.startsWith("/admin") || pathname.startsWith("/magacin");
  const isAuthRoute = pathname.startsWith("/admin-login");

  if (isStandaloneApp) {
    return <main className="min-h-screen">{children}</main>;
  }

  // Ako je uključen režim održavanja, a posetilac nije administrator i nije na login stranici:
  if (maintenanceMode && !isAdmin && !isAuthRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a2540] to-slate-950 text-white flex flex-col justify-between p-6 sm:p-12 selection:bg-orange-500 selection:text-white">
        {/* Zaglavlje ekrana za održavanje */}
        <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-8 border-b border-slate-800">
          <div className="relative h-10 w-44">
            <Image
              src="/images/aqua-still-logo.png"
              alt="Aqua Still Zlatibor"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            Režim održavanja
          </span>
        </header>

        {/* Glavna poruka */}
        <main className="max-w-2xl mx-auto w-full my-auto py-12 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-xl">
            <Wrench className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Prodavnica je trenutno u pripremi i ažuriranju
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              {maintenanceNotice && maintenanceNotice.trim() !== ""
                ? maintenanceNotice
                : "Trenutno unapređujemo ponudu i vršimo tehničko održavanje sistema. Naša fizička prodavnica na Zlatiboru radi nesmetano. Hvala vam na razumevanju."}
            </p>
          </div>

          {/* Kontakt kartica u toku održavanja */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-left max-w-md mx-auto space-y-3 shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Direktan kontakt</h3>
            {settings?.phone && (
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <Phone className="w-4 h-4 text-orange-400 shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:text-white underline">
                  {settings.phone}
                </a>
              </div>
            )}
            {settings?.email && (
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <Mail className="w-4 h-4 text-orange-400 shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-white underline">
                  {settings.email}
                </a>
              </div>
            )}
            {settings?.address && (
              <div className="text-xs text-slate-400 pt-1">
                Lokacija: {settings.address}, {settings.city}
              </div>
            )}
          </div>
        </main>

        {/* Podnožje ekrana za održavanje */}
        <footer className="max-w-4xl mx-auto w-full pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Aqua Still Zlatibor. Sva prava zadržana.</p>
          <Link
            href="/admin-login"
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-orange-400 transition-colors"
          >
            <span>Administratorski pristup</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </footer>
      </div>
    );
  }

  return (
    <>
      <Header />
      <CartDrawer />
      <main className="flex-grow">{children}</main>
      <Footer settings={settings} />
    </>
  );
}
