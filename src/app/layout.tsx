import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import SiteChrome from "@/components/layout/SiteChrome";
import PwaRegister from "@/components/pwa/PwaRegister";
import { getSystemSettings } from "@/services/settings-service";
import { isAdminAuthenticated } from "@/lib/admin-auth";

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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSystemSettings();
  const titleDefault = settings.defaultSeoTitle || "Aqua Still Zlatibor | Alati, vodovodni materijal i kupatilska oprema";
  const descDefault =
    settings.defaultSeoDescription ||
    "Aqua Still Zlatibor – alati, vodovodni i kanalizacioni materijal, kupatilska oprema, navodnjavanje i grejanje za svaki projekat.";
  const siteName = settings.siteShareName || "Aqua Still Shop";

  return {
    metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
    title: {
      default: titleDefault,
      template: `%s | ${siteName}`,
    },
    description: descDefault,
    applicationName: siteName,
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: siteName,
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
      index: !settings.maintenanceMode,
      follow: !settings.maintenanceMode,
    },
    openGraph: {
      type: "website",
      locale: "sr_RS",
      siteName: siteName,
      title: titleDefault,
      description: descDefault,
      images: settings.defaultOgImage ? [{ url: settings.defaultOgImage }] : undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSystemSettings();
  const isAdmin = await isAdminAuthenticated();

  return (
    <html lang="sr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 selection:bg-blue-100 selection:text-blue-900" suppressHydrationWarning>
        <CartProvider>
          <SiteChrome
            maintenanceMode={settings.maintenanceMode}
            maintenanceNotice={settings.maintenanceNotice}
            isAdmin={isAdmin}
            settings={settings}
          >
            {children}
          </SiteChrome>
          <PwaRegister />
        </CartProvider>
      </body>
    </html>
  );
}
