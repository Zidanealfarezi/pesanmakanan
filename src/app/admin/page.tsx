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
  status: string; // 'Baru Masuk', 'Selesai'
  paymentStatus: string; // 'Belum Bayar', 'Lunas'
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
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Poll every 5 seconds
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
    // Use setTimeout to allow React to render the print container first
    setTimeout(() => {
      window.print();
    }, 100);
  };

  if (loading) return <div className="min-h-screen p-8 text-center bg-slate-100">Memuat data...</div>;

  return (
    <>
      {/* Real UI: Hidden during printing */}
      <div className="min-h-screen bg-slate-100 font-sans text-slate-800 p-4 md:p-8 no-print">
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard Kasir & Dapur</h1>
            <p className="text-slate-500 text-sm">Kelola pesanan masuk secara real-time</p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari Order ID / Meja..."
                className="bg-slate-50 border border-slate-200 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className={`p-4 border-b border-slate-100 flex justify-between items-start ${order.status === 'Baru Masuk' ? 'bg-orange-50/50' : 'bg-slate-50'}`}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded">Meja {order.tableNumber}</span>
                    <span className="text-sm font-semibold text-slate-600">{order.orderNumber}</span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-slate-800">Rp{order.totalPrice.toLocaleString("id-ID")}</p>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${order.paymentStatus === 'Belum Bayar' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1">
                <ul className="space-y-3 mb-4">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between items-start text-sm">
                      <div className="flex gap-2">
                        <span className="font-semibold">{item.quantity}x</span>
                        <span className="text-slate-700">{item.name}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                {order.notes && (
                  <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm border border-yellow-200 mb-4">
                    <strong>Catatan:</strong> {order.notes}
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handlePrint(order)}
                  className="flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 py-2 rounded-xl font-medium hover:bg-slate-100 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Cetak Struk
                </button>
                
                {order.status === 'Baru Masuk' ? (
                  <button 
                    onClick={() => updateOrder(order.id, { status: 'Selesai' })}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-xl font-medium hover:bg-blue-700 transition cursor-pointer"
                  >
                    <Utensils className="w-4 h-4" /> Proses Makanan
                  </button>
                ) : (
                  <button 
                    onClick={() => updateOrder(order.id, { paymentStatus: 'Lunas' })}
                    disabled={order.paymentStatus === 'Lunas'}
                    className={`flex items-center justify-center gap-2 py-2 rounded-xl font-medium transition ${order.paymentStatus === 'Lunas' ? 'bg-green-100 text-green-600 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'}`}
                  >
                    <CheckCircle className="w-4 h-4" /> {order.paymentStatus === 'Lunas' ? 'Sudah Lunas' : 'Tandai Lunas'}
                  </button>
                )}
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-500">
              <Utensils className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p className="text-lg">Belum ada pesanan masuk hari ini.</p>
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
              <div>Waktu: {new Date(printingOrder.createdAt).toLocaleTimeString()}</div>
            </div>
            
            <div className="border-t border-b border-black border-dashed py-2 mb-2">
              {printingOrder.items.map((item, idx) => (
                <div key={idx} className="mb-1">
                  <div>{item.quantity}x {item.name}</div>
                  <div className="text-right">Rp{item.subtotal.toLocaleString("id-ID")}</div>
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
              <span>Rp{printingOrder.totalPrice.toLocaleString("id-ID")}</span>
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
