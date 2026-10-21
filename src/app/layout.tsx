import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import SiteChrome from "@/components/layout/SiteChrome";
import PwaRegister from "@/components/pwa/PwaRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#005B94",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
  title: {
    default: "Aqua Still Zlatibor | Alati, vodovodni materijal i kupatilska oprema",
    template: "%s | Aqua Still Zlatibor",
  },
  description: "Aqua Still Zlatibor – alati, vodovodni i kanalizacioni materijal, kupatilska oprema, navodnjavanje i grejanje za svaki projekat.",
  applicationName: "Aqua Still Shop",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Aqua Still",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/aqua-icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/aqua-icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.svg", type: "image/svg+xml" },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "sr_RS",
    siteName: "Aqua Still Shop",
    title: "Aqua Still Zlatibor | Alati, vodovodni materijal i kupatilska oprema",
    description: "Alati, vodovodni materijal, kupatilska oprema, navodnjavanje i grejanje na jednom mestu.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 selection:bg-blue-100 selection:text-blue-900" suppressHydrationWarning>
        <CartProvider>
          <SiteChrome>{children}</SiteChrome>
          <PwaRegister />
        </CartProvider>
      </body>
    </html>
  );
}
