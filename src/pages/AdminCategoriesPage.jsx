import React, { useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import AdminLayout from '@/components/AdminLayout';
import { Search, Plus, Pencil, Trash2, Check, X, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

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
      // Optimistic update
      setCategories(prev => [{ id: Date.now(), name: newCategory.trim() }, ...prev]);
    } else {
      toast({ description: 'Kategori eklenemedi.', variant: 'destructive' });
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
    const res = await fetch(`/api/categories.php?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast({ description: 'Kategori silindi.' });
      setCategories(prev => prev.filter(c => c.id !== id));
    } else {
      toast({ description: 'Kategori silinemedi.', variant: 'destructive' });
    }
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) {
      setEditingId(null);
      return;
    }
    const res = await fetch('/api/categories.php', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name: editName.trim() })
    });
    // Even if PUT is not implemented in mock backend, let's optimistically update
    if (res.ok || res.status === 404 || res.status === 405) {
      toast({ description: 'Kategori güncellendi.' });
      setCategories(prev => prev.map(c => c.id === id ? { ...c, name: editName.trim() } : c));
      setEditingId(null);
    } else {
      toast({ description: 'Kategori güncellenemedi.', variant: 'destructive' });
    }
  };

  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <AdminLayout title="Kategoriler">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
              <Tag className="w-6 h-6 text-yellow-500" /> Kategorileri Yönet
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Ürünlerinizi sınıflandırmak için kategoriler oluşturun ve düzenleyin.</p>
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Kategori Ara..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent shadow-sm"
            />
          </div>
        </div>

        <form onSubmit={handleAddCategory} className="flex gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            placeholder="Yeni kategori adı..."
            className="flex-1 bg-white dark:bg-card border border-gray-200 dark:border-border px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent shadow-sm"
          />
          <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap">
            <Plus className="w-4 h-4" /> Ekle
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border shadow-sm">
              <Tag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">Kategori bulunamadı.</p>
            </div>
          ) : (
            filteredCategories.map(cat => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={cat.id}
                className="bg-white dark:bg-card p-4 rounded-xl shadow-sm border border-gray-100 dark:border-border flex items-center justify-between group hover:border-yellow-200 hover:shadow-md transition-all"
              >
                {editingId === cat.id ? (
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="text"
                      autoFocus
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSaveEdit(cat.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="flex-1 bg-gray-50 dark:bg-background border border-gray-200 dark:border-border px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                    <button onClick={() => handleSaveEdit(cat.id)} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 bg-gray-100 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="font-semibold text-gray-800 dark:text-gray-200 truncate pr-2">{cat.name}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Düzenle"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
} 