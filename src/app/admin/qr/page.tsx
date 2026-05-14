"use client";

import { useState } from "react";
import { Printer, Minus, Plus } from "lucide-react";

export default function AdminQRPage() {
  const [tableNumber, setTableNumber] = useState(1);
  const [isPrinting, setIsPrinting] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://pesanmakanan.vercel.app';

  const getQRUrl = (num: number) => {
    const menuUrl = `${baseUrl}/?meja=${num}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(menuUrl)}&margin=4`;
  };

  const handlePrint = () => {
    setIsPrinting(true);
    // Wait for QR image to load before printing
    const img = new window.Image();
    img.onload = () => {
      setTimeout(() => {
        window.print();
        setIsPrinting(false);
      }, 200);
    };
    img.onerror = () => {
      window.print();
      setIsPrinting(false);
    };
    img.src = getQRUrl(tableNumber);
  };

  return (
    <>
      {/* ===== Main UI (hidden during print) ===== */}
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 no-print">
        {/* Header */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Cetak QR Meja</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Cetak struk QR code untuk diberikan kepada pelanggan</p>
        </div>

        {/* Table Number Selector */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 max-w-md mx-auto">
          <label className="block text-sm font-medium text-slate-600 mb-4 text-center">Pilih Nomor Meja</label>
          
          <div className="flex items-center justify-center gap-6 mb-8">
            <button 
              onClick={() => setTableNumber(Math.max(1, tableNumber - 1))}
              className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition cursor-pointer active:scale-90 text-xl font-bold"
            >
              <Minus className="w-6 h-6" />
            </button>
            <div className="text-center">
              <span className="text-6xl font-bold text-orange-600 block leading-none">{tableNumber}</span>
              <span className="text-xs text-slate-400 mt-1 block">Meja</span>
            </div>
            <button 
              onClick={() => setTableNumber(Math.min(99, tableNumber + 1))}
              className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 hover:bg-orange-200 transition cursor-pointer active:scale-90 text-xl font-bold"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          {/* QR Preview */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6 flex flex-col items-center border border-slate-100">
            <p className="text-xs text-slate-400 mb-3">Preview Struk QR</p>
            <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-200 w-48">
              <p className="text-center font-bold text-sm mb-1">🍗 Ayam Penyet Juara</p>
              <p className="text-center text-[10px] text-slate-500 mb-2">Scan untuk memesan</p>
              <img 
                src={getQRUrl(tableNumber)} 
                alt={`QR Meja ${tableNumber}`}
                className="w-full aspect-square object-contain"
              />
              <div className="text-center mt-2">
                <span className="bg-black text-white text-xs font-bold px-3 py-1 rounded inline-block">MEJA {tableNumber}</span>
              </div>
              <p className="text-center text-[8px] text-slate-400 mt-1.5">Selamat memesan!</p>
            </div>
          </div>

          {/* Print Button */}
          <button 
            onClick={handlePrint}
            disabled={isPrinting}
            className="w-full bg-orange-600 text-white font-bold text-base rounded-2xl py-4 shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="w-5 h-5" />
            {isPrinting ? "Menyiapkan..." : `Cetak QR Meja ${tableNumber}`}
          </button>
        </div>

        {/* Quick Access Grid */}
        <div className="max-w-md mx-auto mt-6">
          <p className="text-xs text-slate-400 mb-3 text-center">Akses Cepat — Klik nomor meja untuk langsung cetak</p>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => { setTableNumber(num); }}
                className={`aspect-square rounded-xl font-bold text-sm flex items-center justify-center transition cursor-pointer active:scale-90 ${
                  tableNumber === num 
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-orange-50 hover:border-orange-300'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Print Layout (Thermal 58mm) ===== */}
      <div className="hidden print-only text-black bg-white font-mono max-w-[58mm] w-[58mm] mx-auto p-1">
        <div className="text-center">
          <p className="font-bold text-sm mb-0.5">AYAM PENYET JUARA</p>
          <p className="text-[10px] mb-2">Scan QR untuk memesan</p>
          
          <div className="flex justify-center mb-1">
            <img 
              src={getQRUrl(tableNumber)} 
              alt={`QR Meja ${tableNumber}`}
              className="w-[42mm] h-[42mm]"
            />
          </div>
          
          <div className="border-t border-b border-dashed border-black py-1.5 my-1">
            <p className="font-bold text-lg">MEJA {tableNumber}</p>
          </div>
          
          <p className="text-[9px] mt-1.5 mb-0.5">Arahkan kamera HP Anda</p>
          <p className="text-[9px]">ke QR code di atas</p>
          <p className="text-[9px] mt-2 mb-1">Selamat memesan! 🍗</p>
        </div>
      </div>
    </>
  );
}
