"use client";

import { useEffect, useState } from "react";
import { BarChart, Calendar, TrendingUp, Printer } from "lucide-react";

type Order = {
  id: string;
  totalPrice: number;
  paymentStatus: string;
  createdAt: string;
};

export default function AdminReportPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Filter only paid orders
  const paidOrders = orders.filter(o => o.paymentStatus === 'Lunas');

  const now = new Date();
  
  // Daily
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dailyOrders = paidOrders.filter(o => new Date(o.createdAt).getTime() >= startOfDay);
  const dailyTotal = dailyOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  // Weekly (Last 7 days)
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).getTime();
  const weeklyOrders = paidOrders.filter(o => new Date(o.createdAt).getTime() >= startOfWeek);
  const weeklyTotal = weeklyOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  // Monthly
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const monthlyOrders = paidOrders.filter(o => new Date(o.createdAt).getTime() >= startOfMonth);
  const monthlyTotal = monthlyOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  // All time
  const allTimeTotal = paidOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-500 text-sm">Memuat laporan...</p>
      </div>
    </div>
  );

  const formattedDate = new Intl.DateTimeFormat('id-ID', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  }).format(now);

  return (
    <>
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 no-print">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 bg-white p-4 sm:p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Laporan Omset</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">Ringkasan pendapatan dari pesanan yang sudah Lunas</p>
          </div>
          <button 
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 bg-slate-800 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-slate-900 transition cursor-pointer text-sm sm:text-base active:scale-95 w-full sm:w-auto"
          >
            <Printer className="w-5 h-5" /> Cetak Laporan
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
          {/* Daily */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-slate-500 text-sm font-medium">Hari Ini</h3>
                <p className="text-xs text-slate-400">Sejak 00:00</p>
              </div>
            </div>
            <div className="mt-auto">
              <p className="text-3xl font-bold text-slate-800">Rp{dailyTotal.toLocaleString("id-ID")}</p>
              <p className="text-sm text-slate-500 mt-2">{dailyOrders.length} Pesanan Selesai</p>
            </div>
          </div>

          {/* Weekly */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-slate-500 text-sm font-medium">7 Hari Terakhir</h3>
                <p className="text-xs text-slate-400">Mingguan</p>
              </div>
            </div>
            <div className="mt-auto">
              <p className="text-3xl font-bold text-slate-800">Rp{weeklyTotal.toLocaleString("id-ID")}</p>
              <p className="text-sm text-slate-500 mt-2">{weeklyOrders.length} Pesanan Selesai</p>
            </div>
          </div>

          {/* Monthly */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                <BarChart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-slate-500 text-sm font-medium">Bulan Ini</h3>
                <p className="text-xs text-slate-400">Sejak tanggal 1</p>
              </div>
            </div>
            <div className="mt-auto">
              <p className="text-3xl font-bold text-slate-800">Rp{monthlyTotal.toLocaleString("id-ID")}</p>
              <p className="text-sm text-slate-500 mt-2">{monthlyOrders.length} Pesanan Selesai</p>
            </div>
          </div>
        </div>

        {/* All Time */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl shadow-sm p-6 sm:p-8 text-white">
          <h2 className="text-orange-100 font-medium mb-1">Total Omset Keseluruhan (All Time)</h2>
          <p className="text-4xl sm:text-5xl font-bold mb-3">Rp{allTimeTotal.toLocaleString("id-ID")}</p>
          <p className="text-orange-200 text-sm">Total {paidOrders.length} pesanan berhasil diselesaikan sejak aplikasi digunakan.</p>
        </div>
      </div>

      {/* ===== Print Layout (Thermal 58mm) ===== */}
      <div className="hidden print-only text-black bg-white font-mono max-w-[58mm] w-[58mm] mx-auto p-2">
        <div className="text-center mb-3">
          <p className="font-bold text-sm mb-0.5">AYAM PENYET JUARA</p>
          <p className="text-[10px]">Laporan Omset Kasir</p>
        </div>
        
        <p className="text-[9px] mb-2 border-b border-black border-dashed pb-2">
          Tanggal Cetak:<br/>
          {formattedDate}<br/>
          Pukul: {now.toLocaleTimeString('id-ID')}
        </p>

        <div className="mb-3">
          <p className="font-bold text-[10px]">HARI INI</p>
          <div className="flex justify-between text-[11px] mb-0.5">
            <span>Pesanan:</span>
            <span>{dailyOrders.length}</span>
          </div>
          <div className="flex justify-between font-bold text-xs">
            <span>Omset:</span>
            <span>Rp{dailyTotal.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className="border-t border-black border-dashed pt-2 mb-3">
          <p className="font-bold text-[10px]">7 HARI TERAKHIR</p>
          <div className="flex justify-between text-[11px] mb-0.5">
            <span>Pesanan:</span>
            <span>{weeklyOrders.length}</span>
          </div>
          <div className="flex justify-between font-bold text-xs">
            <span>Omset:</span>
            <span>Rp{weeklyTotal.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className="border-t border-black border-dashed pt-2 mb-3">
          <p className="font-bold text-[10px]">BULAN INI</p>
          <div className="flex justify-between text-[11px] mb-0.5">
            <span>Pesanan:</span>
            <span>{monthlyOrders.length}</span>
          </div>
          <div className="flex justify-between font-bold text-xs">
            <span>Omset:</span>
            <span>Rp{monthlyTotal.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className="border-t border-b border-black border-dashed py-2 my-3">
          <p className="font-bold text-[10px]">TOTAL ALL TIME</p>
          <div className="flex justify-between font-bold text-[13px] mt-1">
            <span>Rp{allTimeTotal.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className="text-center text-[9px] mt-4">
          *** AKHIR LAPORAN ***
        </div>
      </div>
    </>
  );
}
