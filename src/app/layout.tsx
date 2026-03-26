import type { Metadata } from "next";
import { Inter, Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://outils.cyber-rgpd.com'),
  title: {
    default: "Outils Cyber RGPD",
    template: "%s | Outils Cyber RGPD"
  },
  description: "Outils gratuits de cybersecurite et conformite RGPD pour les PME",
  keywords: ["cybersecurite", "RGPD", "outils gratuits", "PME", "audit email", "scan ports", "diagnostic IT"],
  authors: [{ name: "Cyber RGPD" }],
  creator: "Cyber RGPD",
  publisher: "Cyber RGPD",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://outils.cyber-rgpd.com",
    siteName: "Outils Cyber RGPD",
    title: "Outils Cyber RGPD",
    description: "Outils gratuits de cybersecurite et conformite RGPD pour les PME",
  },
  twitter: {
    card: "summary_large_image",
    title: "Outils Cyber RGPD",
    description: "Outils gratuits de cybersecurite et conformite RGPD pour les PME",
  },
  alternates: {
    canonical: "https://outils.cyber-rgpd.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <meta name="theme-color" content="#FAFBFC" />
      </head>
      <body className={`${inter.variable} ${sora.variable} ${jetbrainsMono.variable} antialiased bg-gray-50 text-gray-900 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900 font-sans`}>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg">
          Aller au contenu
        </a>

        {/* Minimal header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-6 py-4 text-center">
            <a href="/outils" className="text-lg font-display font-bold text-gray-900 hover:text-indigo-600 transition-colors">
              Outils Cyber RGPD
            </a>
          </div>
        </header>

        <div id="main">{children}</div>

        {/* Minimal footer */}
        <footer className="border-t border-gray-200 py-6 text-center">
          <span className="text-sm text-gray-500">cyber-rgpd.com</span>
        </footer>
      </body>
    </html>
  );
}
