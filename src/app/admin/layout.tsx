import React from "react";
import { requireAdmin } from "@/lib/admin-auth";
import { logoutAdminAction } from "@/actions/admin-auth-actions";
import Link from "next/link";
import { 
  LayoutDashboard, 
  FileEdit, 
  FileText, 
  Package, 
  FolderTree, 
  Tag, 
  Image as ImageIcon, 
  Menu, 
  ShoppingCart, 
  Users, 
  Search, 
  Palette, 
  Settings, 
  Warehouse, 
  LogOut, 
  ExternalLink 
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
  { name: "Magacin", href: "/magacin", icon: Warehouse },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row text-slate-900">
      {/* Sidebar */}
      <aside className="w-full bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 lg:sticky lg:top-0 lg:h-screen lg:w-64">
        <div className="px-4 py-3 sm:px-6 sm:py-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h1 className="text-base font-black tracking-wider text-white">AQUA STILL CMS</h1>
            <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mt-0.5">Admin Dashboard</p>
          </div>
        </div>

        <nav aria-label="Administrativna navigacija" className="flex gap-1 overflow-x-auto px-2 py-2 lg:block lg:flex-1 lg:space-y-1 lg:overflow-x-hidden lg:overflow-y-auto lg:px-4 lg:py-6">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-300 hover:bg-cyan-600 hover:text-white transition-all group lg:mb-1 lg:w-full lg:gap-3 lg:px-3.5"
              >
                <Icon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden border-t border-slate-800 p-4 lg:block lg:space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <span>Poseti webshop</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="flex min-h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 py-3 shadow-sm sm:min-h-16 sm:px-6">
          <div className="flex items-center gap-4">
            <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 sm:inline-flex">
              Sistem aktivan (Mod: PostgreSQL + Prisma)
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 text-xs">
              <div className="w-8 h-8 rounded-full bg-cyan-600 text-white font-black flex items-center justify-center">
                A
              </div>
              <div className="hidden sm:block text-left">
                <span className="font-bold text-slate-900 block">Administrator</span>
                <span className="text-[10px] text-slate-400 block">{process.env.ADMIN_EMAIL}</span>
              </div>
            </div>
            <form action={logoutAdminAction}>
              <button type="submit" className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900" aria-label="Odjavi se">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Odjavi se</span>
              </button>
            </form>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-w-0 flex-1 overflow-x-hidden p-3 sm:p-5 lg:overflow-y-auto lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
