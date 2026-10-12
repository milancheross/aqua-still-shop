import React from "react";
import { requireAdmin } from "@/lib/admin-auth";
import { logoutAdminAction } from "@/actions/admin-auth-actions";
import Link from "next/link";
import {
  LayoutDashboard, FileEdit, FileText, Package, FolderTree, Tag,
  Image as ImageIcon, Menu, ShoppingCart, Users, Search, Palette,
  Settings, Warehouse, LogOut, ExternalLink, MoreHorizontal
} from "lucide-react";

const adminNavItems = [
  { name: "Kontrolna tabla", href: "/admin", icon: LayoutDashboard },
  { name: "Vizuelni editor", href: "/admin/editor?home=1", icon: FileEdit },
  { name: "Stranice", href: "/admin/pages", icon: FileText },
  { name: "Proizvodi", href: "/admin/products", icon: Package },
  { name: "Kategorije", href: "/admin/categories", icon: FolderTree },
  { name: "Brendovi", href: "/admin/brands", icon: Tag },
  { name: "Medijska biblioteka", href: "/admin/media", icon: ImageIcon },
  { name: "Navigacija", href: "/admin/navigation", icon: Menu },
  { name: "Porudžbine", href: "/admin/orders", icon: ShoppingCart },
  { name: "Kupci", href: "/admin/customers", icon: Users },
  { name: "Korisnici i pristup", href: "/admin/users", icon: Users },
  { name: "SEO", href: "/admin/seo", icon: Search },
  { name: "Dizajn sajta", href: "/admin/design", icon: Palette },
  { name: "Podešavanja", href: "/admin/settings", icon: Settings },
  { name: "Magacin", href: "/magacin", icon: Warehouse },\n  { name: "POS integracija", href: "/admin/integracije/pos", icon: RefreshCw },
];

const primaryMobileItems = [
  { name: "Početna", href: "/admin", icon: LayoutDashboard },
  { name: "Proizvodi", href: "/admin/products", icon: Package },
  { name: "Porudžbine", href: "/admin/orders", icon: ShoppingCart },
];

const secondaryMobileItems = adminNavItems.filter(
  (item) => !primaryMobileItems.some((primary) => primary.href === item.href)
);

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <aside className="hidden w-64 shrink-0 bg-slate-900 text-slate-300 lg:fixed lg:inset-y-0 lg:flex lg:flex-col lg:border-r lg:border-slate-800">
        <div className="border-b border-slate-800 px-5 py-5">
          <h1 className="text-base font-black tracking-wider text-white">AQUA STILL CMS</h1>
          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-cyan-400">Admin Dashboard</p>
        </div>

        <nav aria-label="Administrativna navigacija" className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-300 transition hover:bg-cyan-600 hover:text-white"
              >
                <Icon className="h-4 w-4 text-slate-400 transition-colors group-hover:text-white" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-slate-800 p-4">
          <Link href="/" target="_blank" className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-400 transition-colors hover:bg-slate-800 hover:text-white">
            <span>Poseti webshop</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <form action={logoutAdminAction}>
            <button type="submit" className="flex w-full items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-400 transition-colors hover:bg-slate-800 hover:text-white">
              <LogOut className="h-4 w-4" />
              Odjavi se
            </button>
          </form>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
          <div className="flex min-h-14 items-center justify-between gap-3 px-3 py-2 sm:min-h-16 sm:px-6">
            <div className="min-w-0">
              <p className="truncate text-xs font-black text-slate-900 sm:text-sm">Aqua Still CMS</p>
              <p className="hidden text-[10px] font-semibold text-slate-400 sm:block">Jednostavno upravljanje prodavnicom</p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/" target="_blank" aria-label="Otvori webshop" className="hidden rounded-xl p-2 text-slate-500 hover:bg-slate-100 sm:inline-flex">
                <ExternalLink className="h-4 w-4" />
              </Link>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-600 text-xs font-black text-white">A</div>
              <form action={logoutAdminAction}>
                <button type="submit" aria-label="Odjavi se" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100">
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>

          <nav aria-label="Brza administrativna navigacija" className="grid grid-cols-4 border-t border-slate-100 bg-white lg:hidden">
            {primaryMobileItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="flex min-h-11 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-bold text-slate-500 transition active:bg-cyan-50 active:text-cyan-700">
                  <Icon className="h-4 w-4" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}

            <details className="group relative">
              <summary className="flex min-h-11 cursor-pointer list-none flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-bold text-slate-500 transition active:bg-cyan-50 active:text-cyan-700">
                <MoreHorizontal className="h-4 w-4" />
                <span>Više</span>
              </summary>
              <div className="absolute right-2 top-full z-50 w-[calc(100vw-1rem)] max-w-sm rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                <div className="grid grid-cols-2 gap-2">
                  {secondaryMobileItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.href} href={item.href} className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 transition hover:bg-cyan-50">
                        <Icon className="h-4 w-4 shrink-0 text-cyan-600" />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </details>
          </nav>
        </header>

        <main className="min-w-0 overflow-x-hidden p-3 pb-8 sm:p-5 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
