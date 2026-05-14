"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, LayoutList, Menu, X, QrCode, BarChart } from "lucide-react";
import { useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30 no-print">
        <span className="font-bold text-lg text-orange-600">Admin Panel</span>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)} 
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar - Desktop: always visible, Mobile: toggleable */}
        <aside className={`
          ${sidebarOpen ? 'block' : 'hidden'} md:block
          w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 
          p-4 shrink-0 no-print
          md:sticky md:top-0 md:h-screen md:overflow-y-auto
          z-20
        `}>
          <div className="font-bold text-xl text-orange-600 mb-6 px-4 mt-2 hidden md:block">Admin Panel</div>
          <nav className="space-y-1">
            <Link 
              href="/admin" 
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
                pathname === '/admin' ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ClipboardList className="w-5 h-5" /> Pesanan Aktif
            </Link>
            <Link 
              href="/admin/menu" 
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
                pathname === '/admin/menu' ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <LayoutList className="w-5 h-5" /> Kelola Menu
            </Link>
            <Link 
              href="/admin/qr" 
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
                pathname === '/admin/qr' ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <QrCode className="w-5 h-5" /> QR Code Meja
            </Link>
            <Link 
              href="/admin/laporan" 
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
                pathname === '/admin/laporan' ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <BarChart className="w-5 h-5" /> Laporan Omset
            </Link>
          </nav>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/30 z-10 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
