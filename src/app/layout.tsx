import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../app/contexts/AuthContext"; // Perbaiki path ini
import FontErrorBoundary from "./components/FontErrorBoundary"; // Import FontErrorBoundary

// Gunakan font yang lebih reliable
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"], 
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: "HandmadeKnives",
    template: "%s | HandmadeKnives",
  },
  description: "HandmadeKnives — katalog pisau custom dan premium buatan tangan.",
  keywords: ["Handmade Knives", "Pisau Custom", "Pisau Premium", "Pisau Buatan Tangan"],
  openGraph: {
    title: "HandmadeKnives",
    description: "Katalog pisau custom dan premium buatan tangan.",
    url: "https://handmadeknives.com",
    siteName: "HandmadeKnives",
    locale: "id_ID",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <title>HandmadeKnives</title>
        {/* Fallback inline styles */}
        <style>{`
          /* System font fallbacks */
          .font-fallback {
            font-family: var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .font-mono-fallback {
            font-family: var(--font-roboto-mono), 'Monaco', 'Menlo', 'Consolas', monospace;
          }
        `}</style>
      </head>
      <body className={`${inter.variable} ${robotoMono.variable} antialiased font-fallback`}>
        <AuthProvider>
          <FontErrorBoundary>
            {children}
          </FontErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}