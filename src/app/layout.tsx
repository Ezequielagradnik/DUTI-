import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getSession } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://duti.com.ar";
const TITULO = "DUTI — Pedí tu comida, retirá a horario";
const DESC =
  "Pedí en tus locales favoritos, pagá por transferencia y retirá en el horario que elijas. Verificación de pago automática.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: TITULO,
  description: DESC,
  openGraph: {
    title: TITULO,
    description: DESC,
    url: "/",
    siteName: "DUTI",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITULO,
    description: DESC,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-navy">
        <CartProvider>
          <Header rol={session?.rol ?? null} email={session?.email ?? null} />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
