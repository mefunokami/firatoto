import React, { useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/categories.php')
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    const res = await fetch('/api/categories.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCategory.trim() })
    });
    if (res.ok) {
      toast({ description: 'Kategori eklendi.' });
      setNewCategory('');
      const cats = await fetch('/api/categories.php').then(r => r.json());
      setCategories(cats);
    } else {
      toast({ description: 'Kategori eklenemedi.', variant: 'destructive' });
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
    const res = await fetch(`/api/categories.php?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast({ description: 'Kategori silindi.' });
      const cats = await fetch('/api/categories.php').then(r => r.json());
      setCategories(cats);
    } else {
      toast({ description: 'Kategori silinemedi.', variant: 'destructive' });
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="flex items-center mb-8">
        <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-gray-700 hover:text-yellow-500 font-semibold px-3 py-2 rounded bg-gray-100 hover:bg-yellow-100 transition">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
          Panele Dön
        </button>
        <h2 className="text-2xl font-bold ml-6 border-b-2 border-yellow-400 pb-1">Kategorileri Yönet</h2>
      </div>
      <form onSubmit={handleAddCategory} className="flex gap-2 mb-8">
        <input
          type="text"
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
          placeholder="Yeni kategori adı"
          className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-6 py-2 rounded">Ekle</button>
      </form>
      <div className="bg-white rounded shadow p-4">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">#</th>
              <th className="p-3">Kategori Adı</th>
              <th className="p-3">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr><td colSpan={3} className="text-center p-6 text-gray-400">Hiç kategori yok.</td></tr>
            ) : categories.map((cat, i) => (
              <tr key={cat.id} className="border-b last:border-b-0">
                <td className="p-3 text-gray-500">{i + 1}</td>
                <td className="p-3 font-medium">{cat.name}</td>
                <td className="p-3">
                  <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-600 hover:underline">Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 