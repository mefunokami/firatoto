import React, { useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import AdminLayout from '@/components/AdminLayout';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState([]);
  const [newBrand, setNewBrand] = useState('');
  useEffect(() => {
    fetch('/api/productbrands.php')
      .then(res => res.json())
      .then(data => setBrands(data));
  }, []);

  const handleAddBrand = async (e) => {
    e.preventDefault();
    if (!newBrand.trim()) return;
    const res = await fetch('/api/productbrands.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newBrand.trim() })
    });
    if (res.ok) {
      toast({ description: 'Marka eklendi.' });
      setNewBrand('');
      const brs = await fetch('/api/productbrands.php').then(r => r.json());
      setBrands(brs);
    } else {
      toast({ description: 'Marka eklenemedi.', variant: 'destructive' });
    }
  };

  return (
    <AdminLayout title="Markalar">
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-foreground border-b-2 border-yellow-400 pb-2 inline-block">Ürün Markalarını Yönet</h2>
      <form onSubmit={handleAddBrand} className="flex gap-2 mb-8">
        <input
          type="text"
          value={newBrand}
          onChange={e => setNewBrand(e.target.value)}
          placeholder="Yeni marka adı"
          className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-6 py-2 rounded">Ekle</button>
      </form>
      <div className="bg-white rounded shadow p-4">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">#</th>
              <th className="p-3">Marka Adı</th>
            </tr>
          </thead>
          <tbody>
            {brands.length === 0 ? (
              <tr><td colSpan={2} className="text-center p-6 text-gray-400">Hiç marka yok.</td></tr>
            ) : brands.map((brand, i) => (
              <tr key={brand.id} className="border-b last:border-b-0">
                <td className="p-3 text-gray-500">{i + 1}</td>
                <td className="p-3 font-medium">{brand.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </AdminLayout>
  );
} 