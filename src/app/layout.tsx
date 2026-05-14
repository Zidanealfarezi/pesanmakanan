import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pesan Makanan - Ayam Penyet",
  description: "Aplikasi pesan makanan QR untuk restoran Ayam Penyet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} antialiased h-full`}>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900">
        <main className="flex-1 max-w-md mx-auto w-full bg-white shadow-xl min-h-screen relative">
          {children}
        </main>
      </body>
    </html>
  );
}
