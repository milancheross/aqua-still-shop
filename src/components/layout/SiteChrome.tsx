"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isStandaloneApp = pathname.startsWith("/admin") || pathname.startsWith("/magacin");

  if (isStandaloneApp) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <Header />
      <CartDrawer />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}
