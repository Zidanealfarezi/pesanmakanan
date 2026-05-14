"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, LayoutList } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans text-slate-800">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-b md:border-r border-slate-200 p-4 shrink-0 no-print">
        <div className="font-bold text-xl text-orange-600 mb-8 px-4 mt-2">Admin Panel</div>
        <nav className="space-y-2">
          <Link 
            href="/admin" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
              pathname === '/admin' ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ClipboardList className="w-5 h-5" /> Pesanan Aktif
          </Link>
          <Link 
            href="/admin/menu" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
              pathname === '/admin/menu' ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <LayoutList className="w-5 h-5" /> Kelola Menu
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
