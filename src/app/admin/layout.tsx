import React from "react";
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
  LogOut, 
  ExternalLink 
} from "lucide-react";

const adminNavItems = [
  { name: "Kontrolna tabla", href: "/admin", icon: LayoutDashboard },
  { name: "Vizuelni editor", href: "/admin/editor", icon: FileEdit },
  { name: "Stranice", href: "/admin/pages", icon: FileText },
  { name: "Proizvodi", href: "/admin/products", icon: Package },
  { name: "Kategorije", href: "/admin/categories", icon: FolderTree },
  { name: "Brendovi", href: "/admin/brands", icon: Tag },
  { name: "Medijska biblioteka", href: "/admin/media", icon: ImageIcon },
  { name: "Navigacija", href: "/admin/navigation", icon: Menu },
  { name: "Porudžbine", href: "/admin/orders", icon: ShoppingCart },
  { name: "Kupci", href: "/admin/customers", icon: Users },
  { name: "SEO", href: "/admin/seo", icon: Search },
  { name: "Dizajn sajta", href: "/admin/design", icon: Palette },
  { name: "Podešavanja", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-900">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h1 className="text-base font-black tracking-wider text-white">AQUA STILL CMS</h1>
            <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mt-0.5">Admin Dashboard</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-cyan-600 hover:text-white transition-all group"
              >
                <Icon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
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
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
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
                <span className="text-[10px] text-slate-400 block">admin@aquastill.rs</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
