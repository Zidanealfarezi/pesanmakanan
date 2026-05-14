"use client";

import { useState, useEffect, Suspense } from "react";
import { Search, ShoppingCart, Plus, Minus, Info, X, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

type Menu = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
};

function MenuContent() {
  const [mounted, setMounted] = useState(false);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [notes, setNotes] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  
  const searchParams = useSearchParams();
  const tableParam = searchParams.get("meja");
  const tableNumber = tableParam ? parseInt(tableParam) : 1;

  useEffect(() => {
    setMounted(true);
    fetch("/api/menus")
      .then(res => res.json())
      .then(data => {
        setMenus(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setMenus([]);
        setLoading(false);
      });
  }, []);

  const handleAdd = (id: string) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleRemove = (id: string) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[id] > 1) {
        newCart[id]--;
      } else {
        delete newCart[id];
      }
      if (Object.keys(newCart).length === 0) {
        setShowCart(false);
      }
      return newCart;
    });
  };

  const handleCheckout = async () => {
    try {
      const orderItems = Object.entries(cart).map(([id, qty]) => {
        const item = menus.find((m) => m.id === id);
        return {
          menuId: id,
          name: item?.name,
          price: item?.price,
          quantity: qty,
          subtotal: (item?.price || 0) * qty
        };
      });

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber,
          items: orderItems,
          notes,
          totalPrice: Object.values(orderItems).reduce((sum, item) => sum + item.subtotal, 0)
        })
      });

      if (response.ok) {
        setOrderSuccess(true);
        setShowCart(false);
        setCart({});
        setNotes("");
      } else {
        alert("Gagal mengirim pesanan. Silakan coba lagi.");
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  if (!mounted || loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-500 text-sm">Memuat menu...</p>
      </div>
    </div>
  );

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Pesanan Diterima!</h2>
        <p className="text-slate-600 mb-8">
          Pesanan Anda untuk Meja {tableNumber} sedang disiapkan. Makanan akan segera diantar ke meja Anda.
        </p>
        <button
          onClick={() => setOrderSuccess(false)}
          className="w-full max-w-xs bg-orange-600 text-white font-semibold py-3 rounded-2xl hover:bg-orange-700 transition cursor-pointer"
        >
          Pesan Lagi
        </button>
      </div>
    );
  }

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((total, [id, qty]) => {
    const item = menus.find((m) => m.id === id);
    return total + (item?.price || 0) * qty;
  }, 0);

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen shadow-lg relative pb-28">
      {/* Header */}
      <header className="bg-gradient-to-br from-orange-600 to-orange-700 text-white p-4 sm:p-5 sticky top-0 z-10 shadow-md rounded-b-2xl">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold">🍗 Ayam Penyet Juara</h1>
            <p className="text-xs sm:text-sm text-orange-100 flex items-center gap-1 mt-0.5">
              <Info className="w-3.5 h-3.5" /> Meja {tableNumber}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Cari makanan..."
            className="w-full bg-white/20 border border-white/30 text-white placeholder:text-white/70 rounded-full py-2.5 px-4 pl-10 outline-none focus:bg-white/30 transition text-sm"
          />
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-white/70" />
        </div>
      </header>

      {/* Categories */}
      <div className="flex gap-2 p-3 sm:p-4 overflow-x-auto scrollbar-hide">
        {["Semua", "Makanan Utama", "Minuman", "Tambahan"].map((cat, i) => (
          <button
            key={cat}
            className={`whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition ${
              i === 0
                ? "bg-orange-600 text-white shadow-md shadow-orange-600/20"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu List */}
      <div className="px-3 sm:px-4 space-y-3">
        {menus.length === 0 && (
          <div className="py-16 text-center text-slate-400">
            <p className="text-lg mb-1">🍽️</p>
            <p className="text-sm">Belum ada menu tersedia.</p>
          </div>
        )}
        {menus.map((item) => (
          <div key={item.id} className={`flex gap-3 p-3 bg-white border border-slate-100 rounded-2xl shadow-sm transition ${!item.available ? 'opacity-50 grayscale-[60%]' : ''}`}>
            {/* Image */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill sizes="(max-width: 640px) 80px, 96px" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 text-2xl">🍽️</div>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div>
                <div className="flex items-start justify-between gap-1">
                  <h3 className="font-semibold text-slate-800 leading-tight text-sm sm:text-base truncate">{item.name}</h3>
                  {!item.available && <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0">Habis</span>}
                </div>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="font-bold text-orange-600 text-sm sm:text-base">
                  Rp{item.price.toLocaleString("id-ID")}
                </span>

                {!item.available ? (
                  <span className="bg-slate-100 text-slate-400 px-2.5 py-1 rounded-full text-xs font-medium">
                    Habis
                  </span>
                ) : !cart[item.id] ? (
                  <button
                    onClick={() => handleAdd(item.id)}
                    className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs sm:text-sm font-medium hover:bg-orange-100 transition cursor-pointer active:scale-95"
                  >
                    Tambah
                  </button>
                ) : (
                  <div className="flex items-center gap-2 sm:gap-3 bg-slate-50 rounded-full px-1.5 py-0.5 border border-slate-200">
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-slate-600 shadow-sm cursor-pointer active:scale-90"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-medium w-4 text-center">{cart[item.id]}</span>
                    <button
                      onClick={() => handleAdd(item.id)}
                      className="w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center text-white shadow-sm cursor-pointer active:scale-90"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Cart Button */}
      {totalItems > 0 && !showCart && (
        <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 z-20 max-w-lg mx-auto">
          <button 
            onClick={() => setShowCart(true)}
            className="w-full bg-orange-600 text-white rounded-2xl p-3.5 sm:p-4 flex items-center justify-between shadow-xl shadow-orange-600/30 hover:bg-orange-700 transition cursor-pointer active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="absolute -top-2 -right-2 bg-white text-orange-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-xs sm:text-sm text-orange-100">Total Pesanan</span>
                <span className="font-bold text-sm sm:text-base">Rp{totalPrice.toLocaleString("id-ID")}</span>
              </div>
            </div>
            <div className="font-semibold text-xs sm:text-sm flex items-center gap-1">
              Lihat Keranjang <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </button>
        </div>
      )}

      {/* Cart Modal / Checkout Overlay */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 max-w-lg mx-auto">
          <header className="bg-white p-4 flex items-center justify-between border-b border-slate-100 shadow-sm sticky top-0 z-10">
            <h2 className="text-lg font-bold text-slate-800">Keranjang Pesanan</h2>
            <button onClick={() => setShowCart(false)} className="p-2 bg-slate-100 rounded-full text-slate-600 cursor-pointer active:scale-90">
              <X className="w-5 h-5" />
            </button>
          </header>
          
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-500 font-medium text-sm">Nomor Meja</span>
                <span className="font-bold text-slate-800 text-lg">{tableNumber}</span>
              </div>
              
              {Object.entries(cart).map(([id, qty]) => {
                const item = menus.find((m) => m.id === id);
                if (!item) return null;
                return (
                  <div key={id} className="flex justify-between items-center py-2">
                    <div className="flex-1 min-w-0 mr-3">
                      <h4 className="font-semibold text-slate-800 text-sm sm:text-base truncate">{item.name}</h4>
                      <p className="text-orange-600 text-xs sm:text-sm font-medium">Rp{item.price.toLocaleString("id-ID")}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 rounded-full px-1.5 py-1 border border-slate-200 shrink-0">
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-slate-600 shadow-sm cursor-pointer active:scale-90"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-medium w-5 text-center">{qty}</span>
                      <button
                        onClick={() => handleAdd(item.id)}
                        className="w-7 h-7 rounded-full bg-orange-600 flex items-center justify-center text-white shadow-sm cursor-pointer active:scale-90"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <label className="block text-sm font-medium text-slate-700 mb-2">Catatan Pesanan (Opsional)</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Sambal dipisah, tidak pakai lalapan..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                rows={2}
              />
            </div>
            
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center text-slate-600 mb-2 text-sm">
                <span>Subtotal</span>
                <span>Rp{totalPrice.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-base sm:text-lg text-slate-800 border-t border-slate-100 pt-3">
                <span>Total Bayar</span>
                <span>Rp{totalPrice.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-4 bg-white border-t border-slate-100 safe-area-bottom">
            <button 
              onClick={handleCheckout}
              className="w-full bg-orange-600 text-white font-bold text-base sm:text-lg rounded-2xl py-3.5 sm:py-4 shadow-xl shadow-orange-600/30 hover:bg-orange-700 transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              Kirim Pesanan Sekarang
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Memuat menu...</div>}>
      <MenuContent />
    </Suspense>
  );
}
