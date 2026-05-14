"use client";

import { useState, useEffect } from "react";
import { Plus, Minus, Search, Trash2, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Menu = {
  id: string;
  name: string;
  price: number;
  image: string;
  available: boolean;
};

export default function AdminKasirPage() {
  const router = useRouter();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Kasir states
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [tableNumber, setTableNumber] = useState(1);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/menus")
      .then(res => res.json())
      .then(data => {
        setMenus(Array.isArray(data) ? data : []);
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
      return newCart;
    });
  };

  const clearCart = () => {
    setCart({});
    setNotes("");
  };

  const submitOrder = async (isPaid: boolean) => {
    if (Object.keys(cart).length === 0) return;
    setIsSubmitting(true);
    
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

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber,
          items: orderItems,
          notes,
        })
      });

      if (res.ok) {
        const result = await res.json();
        
        // If cashier marked as paid immediately
        if (isPaid && result.order?.id) {
          await fetch(`/api/orders/${result.order.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentStatus: 'Lunas', status: 'Selesai' })
          });
        }
        
        alert(`Pesanan berhasil ditambahkan! (Meja ${tableNumber})`);
        clearCart();
        setTableNumber(tableNumber + 1); // Auto increment table
        router.push("/admin"); // Go back to dashboard
      } else {
        alert("Gagal mengirim pesanan");
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMenus = menus.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPrice = Object.entries(cart).reduce((total, [id, qty]) => {
    const item = menus.find((m) => m.id === id);
    return total + (item?.price || 0) * qty;
  }, 0);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 h-[calc(100vh-60px)] md:h-screen flex flex-col md:flex-row gap-4 md:gap-6 overflow-hidden">
      
      {/* Left Area: Menu Selection */}
      <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-3 items-center">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Cari menu..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredMenus.map(menu => (
              <button
                key={menu.id}
                onClick={() => menu.available && handleAdd(menu.id)}
                disabled={!menu.available}
                className={`flex flex-col items-center text-center p-3 rounded-xl border transition cursor-pointer ${
                  !menu.available 
                    ? 'opacity-50 grayscale cursor-not-allowed border-slate-200 bg-slate-50' 
                    : 'border-slate-200 bg-white hover:border-orange-500 hover:bg-orange-50 active:scale-95'
                }`}
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 mb-2 relative">
                  {menu.image ? (
                    <Image src={menu.image} alt={menu.name} fill sizes="64px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-xl">🍽️</div>
                  )}
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-2 leading-tight h-8 flex items-center">{menu.name}</h3>
                <p className="text-orange-600 font-bold text-xs mt-1">Rp{menu.price.toLocaleString("id-ID")}</p>
                {cart[menu.id] && (
                  <div className="absolute top-2 right-2 bg-orange-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm">
                    {cart[menu.id]}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Area: Cart / Bill */}
      <div className="w-full md:w-80 lg:w-96 flex flex-col min-h-0 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden shrink-0">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Keranjang Kasir</h2>
          {Object.keys(cart).length > 0 && (
            <button onClick={clearCart} className="text-red-500 text-xs font-medium hover:text-red-600 cursor-pointer">
              Kosongkan
            </button>
          )}
        </div>

        <div className="p-4 border-b border-slate-100">
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Nomor Meja / Nama</label>
          <div className="flex items-center gap-2">
            <button onClick={() => setTableNumber(Math.max(1, tableNumber - 1))} className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 cursor-pointer active:scale-95"><Minus className="w-4 h-4"/></button>
            <input 
              type="number" 
              value={tableNumber} 
              onChange={e => setTableNumber(parseInt(e.target.value) || 1)}
              className="flex-1 text-center font-bold text-lg border-x border-y border-slate-200 rounded-lg h-10 focus:outline-none focus:border-orange-500"
            />
            <button onClick={() => setTableNumber(tableNumber + 1)} className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 cursor-pointer active:scale-95"><Plus className="w-4 h-4"/></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {Object.keys(cart).length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <span className="text-4xl mb-2">🛒</span>
              <p className="text-sm">Belum ada pesanan</p>
            </div>
          ) : (
            Object.entries(cart).map(([id, qty]) => {
              const item = menus.find((m) => m.id === id);
              if (!item) return null;
              return (
                <div key={id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-800 truncate">{item.name}</p>
                    <p className="text-orange-600 text-xs font-bold">Rp{(item.price * qty).toLocaleString("id-ID")}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-1 py-1 border border-slate-200 shrink-0">
                    <button onClick={() => handleRemove(item.id)} className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer active:scale-95">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{qty}</span>
                    <button onClick={() => handleAdd(item.id)} className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer active:scale-95">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-white space-y-3">
          <input 
            type="text" 
            placeholder="Catatan (Opsional)..." 
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-orange-500"
          />
          
          <div className="flex justify-between items-center py-2">
            <span className="font-bold text-slate-600">Total Pembayaran</span>
            <span className="font-bold text-2xl text-slate-800">Rp{totalPrice.toLocaleString("id-ID")}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button 
              disabled={isSubmitting || Object.keys(cart).length === 0}
              onClick={() => submitOrder(false)}
              className="bg-slate-800 text-white font-semibold py-3 rounded-xl text-sm hover:bg-slate-900 transition cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              Simpan (Belum Bayar)
            </button>
            <button 
              disabled={isSubmitting || Object.keys(cart).length === 0}
              onClick={() => submitOrder(true)}
              className="bg-green-600 text-white font-semibold py-3 rounded-xl text-sm hover:bg-green-700 transition cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" /> Bayar Lunas
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
