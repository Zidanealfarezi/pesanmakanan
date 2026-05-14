"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Image as ImageIcon, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";

type Menu = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
};

export default function AdminMenuPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Makanan Utama",
    image: ""
  });

  const fetchMenus = async () => {
    try {
      const res = await fetch("/api/menus");
      const data = await res.json();
      setMenus(data);
    } catch (error) {
      console.error("Failed to fetch menus");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/menus/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !currentStatus }),
      });
      fetchMenus();
    } catch (error) {
      alert("Gagal mengupdate status menu");
    }
  };

  const deleteMenu = async (id: string) => {
    if (!confirm("Yakin ingin menghapus menu ini?")) return;
    try {
      await fetch(`/api/menus/${id}`, { method: "DELETE" });
      fetchMenus();
    } catch (error) {
      alert("Gagal menghapus menu");
    }
  };

  const handleAddMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setIsAdding(false);
      setFormData({ name: "", description: "", price: "", category: "Makanan Utama", image: "" });
      fetchMenus();
    } catch (error) {
      alert("Gagal menambahkan menu");
    }
  };

  if (loading) return <div className="p-8 text-center bg-slate-100">Memuat menu...</div>;

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kelola Menu</h1>
          <p className="text-slate-500 text-sm">Tambah, edit, atau nonaktifkan menu restoran Anda</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-orange-700 transition cursor-pointer"
        >
          {isAdding ? <XCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />} 
          {isAdding ? "Batal" : "Tambah Menu"}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddMenu} className="bg-white p-6 rounded-2xl shadow-sm mb-8 border border-slate-200">
          <h2 className="text-lg font-bold mb-4 text-slate-800">Tambah Menu Baru</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Menu</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-orange-500" placeholder="Misal: Lele Goreng" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Harga (Rp)</label>
              <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-orange-500" placeholder="Misal: 15000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-orange-500">
                <option>Makanan Utama</option>
                <option>Minuman</option>
                <option>Tambahan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">URL Gambar (Opsional)</label>
              <input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-orange-500" placeholder="/images/nama_file.png" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Singkat</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-orange-500" rows={2} placeholder="Deskripsi makanan..."></textarea>
            </div>
          </div>
          <button type="submit" className="bg-orange-600 text-white font-medium px-6 py-2.5 rounded-xl hover:bg-orange-700 transition cursor-pointer">Simpan Menu</button>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
              <th className="p-4 font-medium">Menu</th>
              <th className="p-4 font-medium hidden md:table-cell">Kategori</th>
              <th className="p-4 font-medium">Harga</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {menus.map((menu) => (
              <tr key={menu.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden shrink-0 relative flex items-center justify-center text-slate-400">
                      {menu.image ? <Image src={menu.image} alt={menu.name} fill sizes="48px" className="object-cover" /> : <ImageIcon className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{menu.name}</div>
                      <div className="text-xs text-slate-500 line-clamp-1 max-w-[200px]">{menu.description || "-"}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 hidden md:table-cell text-sm text-slate-600">{menu.category}</td>
                <td className="p-4 font-medium text-slate-800">Rp{menu.price.toLocaleString("id-ID")}</td>
                <td className="p-4">
                  <button 
                    onClick={() => toggleAvailability(menu.id, menu.available)}
                    className={`px-3 py-1 text-xs font-bold rounded-full transition cursor-pointer ${menu.available ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                  >
                    {menu.available ? 'Tersedia' : 'Habis'}
                  </button>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => deleteMenu(menu.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer" title="Hapus Menu">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {menus.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">Belum ada menu.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
