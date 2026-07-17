import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";
import { PageTransition } from "@/components/motion/PageTransition";
import { CustomCursor } from "@/components/motion/CustomCursor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://atozgadgetz.com'),
  title: {
    default: "AtoZ Gadgetz — Shop Gadgets Worldwide | Electronics, Home, Beauty & More",
    template: "%s | AtoZ Gadgetz",
  },
  description:
    "Shop trending gadgets at AtoZ Gadgetz. Electronics, home & kitchen, beauty tools, fitness gear and 1,000+ products. Free worldwide shipping on qualifying orders. 100% trusted.",
  keywords: [
    "gadgets", "AtoZ Gadgetz", "electronics", "home gadgets", "kitchen gadgets",
    "beauty gadgets", "fitness gadgets", "smartwatches", "mobile accessories",
    "buy gadgets online", "worldwide shipping", "affordable gadgets",
  ],
  openGraph: {
    title: "AtoZ Gadgetz — Shop Gadgets Worldwide",
    description: "1,000+ curated gadgets. Electronics, home, beauty & more. Free shipping on qualifying orders. 100% trusted. Delivered worldwide.",
    siteName: "AtoZ Gadgetz",
    url: "https://atozgadgetz.com",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AtoZ Gadgetz — Shop Gadgets Worldwide",
    description: "You Deserve Gadgets Today!! Shop 1,000+ products with free worldwide shipping.",
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

import { AuthProvider } from "@/components/auth/AuthContext";
import { CartProvider } from "@/components/storefront/CartContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <CustomCursor />
        <AuthProvider>
          <CartProvider>
            <SmoothScrollProvider>
              <PageTransition>
                {children}
              </PageTransition>
            </SmoothScrollProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
