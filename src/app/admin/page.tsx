"use client";

import { useEffect, useState } from "react";
import { Search, Printer, CheckCircle, Clock, Utensils } from "lucide-react";

type OrderItem = {
  menuId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
};

type Order = {
  id: string;
  orderNumber: string;
  tableNumber: number;
  items: OrderItem[];
  notes: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);

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

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateOrder = async (id: string, updates: any) => {
    try {
      await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      fetchOrders();
    } catch (error) {
      alert("Gagal mengupdate pesanan");
    }
  };

  const handlePrint = (order: Order) => {
    setPrintingOrder(order);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-500 text-sm">Memuat pesanan...</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Real UI: Hidden during printing */}
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 no-print">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 bg-white p-4 sm:p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Dashboard Kasir & Dapur</h1>
            <p className="text-slate-500 text-xs sm:text-sm">Kelola pesanan masuk secara real-time</p>
          </div>
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Cari Order ID / Meja..."
              className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg py-2 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          </div>
        </header>

        {/* Order Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              {/* Order Header */}
              <div className={`p-3 sm:p-4 border-b border-slate-100 flex justify-between items-start ${order.status === 'Baru Masuk' ? 'bg-orange-50/50' : 'bg-slate-50'}`}>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded">Meja {order.tableNumber}</span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-600">{order.orderNumber}</span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : '-'}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className="font-bold text-base sm:text-lg text-slate-800">Rp{(order.totalPrice || 0).toLocaleString("id-ID")}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${order.paymentStatus === 'Belum Bayar' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-3 sm:p-4 flex-1">
                <ul className="space-y-2 mb-3">
                  {(order.items || []).map((item, idx) => (
                    <li key={idx} className="flex justify-between items-start text-sm">
                      <div className="flex gap-2">
                        <span className="font-semibold text-slate-700">{item.quantity}x</span>
                        <span className="text-slate-700">{item.name}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                {order.notes && (
                  <div className="bg-yellow-50 text-yellow-800 p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm border border-yellow-200">
                    <strong>Catatan:</strong> {order.notes}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handlePrint(order)}
                  className="flex items-center justify-center gap-1.5 bg-white border border-slate-300 text-slate-700 py-2 rounded-xl text-xs sm:text-sm font-medium hover:bg-slate-100 transition cursor-pointer active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Cetak Struk
                </button>
                
                {order.status === 'Baru Masuk' ? (
                  <button 
                    onClick={() => updateOrder(order.id, { status: 'Selesai' })}
                    className="flex items-center justify-center gap-1.5 bg-blue-600 text-white py-2 rounded-xl text-xs sm:text-sm font-medium hover:bg-blue-700 transition cursor-pointer active:scale-95"
                  >
                    <Utensils className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Proses
                  </button>
                ) : (
                  <button 
                    onClick={() => updateOrder(order.id, { paymentStatus: 'Lunas' })}
                    disabled={order.paymentStatus === 'Lunas'}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${order.paymentStatus === 'Lunas' ? 'bg-green-100 text-green-600 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 cursor-pointer active:scale-95'}`}
                  >
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {order.paymentStatus === 'Lunas' ? 'Lunas ✓' : 'Tandai Lunas'}
                  </button>
                )}
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div className="col-span-full py-16 sm:py-20 text-center text-slate-500">
              <Utensils className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-slate-300 mb-4" />
              <p className="text-base sm:text-lg">Belum ada pesanan masuk hari ini.</p>
            </div>
          )}
        </div>
      </div>

      {/* Print-only Receipt Format (58mm Thermal Style) */}
      <div className="hidden print-only text-[12px] font-mono leading-tight max-w-[58mm] w-[58mm] mx-auto p-2 bg-white text-black">
        {printingOrder && (
          <>
            <div className="text-center font-bold text-sm mb-2 border-b border-black pb-2 border-dashed">
              PECEL AYAM JUARA<br />
              <span className="text-xs font-normal">Sistem Pesanan QR</span>
            </div>
            
            <div className="mb-2">
              <div>Meja: {printingOrder.tableNumber}</div>
              <div>Order: {printingOrder.orderNumber}</div>
              <div>Waktu: {printingOrder.createdAt ? new Date(printingOrder.createdAt).toLocaleTimeString() : '-'}</div>
            </div>
            
            <div className="border-t border-b border-black border-dashed py-2 mb-2">
              {(printingOrder.items || []).map((item, idx) => (
                <div key={idx} className="mb-1">
                  <div>{item.quantity}x {item.name}</div>
                  <div className="text-right">Rp{(item.subtotal || 0).toLocaleString("id-ID")}</div>
                </div>
              ))}
            </div>

            {printingOrder.notes && (
              <div className="mb-2 p-1 border border-black border-dashed">
                <strong>Catatan:</strong><br />
                {printingOrder.notes}
              </div>
            )}

            <div className="flex justify-between font-bold text-sm mt-2">
              <span>TOTAL</span>
              <span>Rp{(printingOrder.totalPrice || 0).toLocaleString("id-ID")}</span>
            </div>
            <div className="mt-1">
              Status: {printingOrder.paymentStatus}
            </div>

            <div className="text-center text-xs mt-4 pt-2 border-t border-black border-dashed">
              Terima Kasih<br />
              Selamat Menikmati
            </div>
          </>
        )}
      </div>
    </>
  );
}
