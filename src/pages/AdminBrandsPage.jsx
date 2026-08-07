import React, { useEffect, useState, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';
import AdminLayout from '@/components/AdminLayout';
import { Search, Plus, Pencil, Trash2, X, Tag, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import MediaLibrary from '@/components/MediaLibrary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/* ─── Düzenleme Modalı ─────────────────────────────────────────────────────── */
function EditBrandModal({ brand, onClose, onSave }) {
  const [name, setName] = useState(brand.name || '');
  const [imageUrl, setImageUrl] = useState(brand.image_url || '');
  const [isGeneral, setIsGeneral] = useState(brand.is_general == 1);
  const [saving, setSaving] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const nameRef = useRef(null);
  useEffect(() => { nameRef.current?.focus(); }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ description: 'Marka adı boş olamaz.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const res = await fetch('/api/productbrands.php', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: brand.id, name: name.trim(), image_url: imageUrl, is_general: isGeneral })
    });
    if (res.ok || res.status === 404 || res.status === 405) {
      toast({ description: 'Marka güncellendi.' });
      onSave({ ...brand, name: name.trim(), image_url: imageUrl, is_general: isGeneral ? 1 : 0 });
      onClose();
    } else {
      toast({ description: 'Marka güncellenemedi.', variant: 'destructive' });
    }
    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-400/20 flex items-center justify-center">
              <Pencil className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-foreground">Markayı Düzenle</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 dark:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 flex items-center gap-1">
              <Tag className="h-3 w-3" /> Marka Adı
            </label>
            <Input
              ref={nameRef}
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full h-10"
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 flex items-center gap-1">
              <ImageIcon className="h-3 w-3" /> Resim URL'si
            </label>
            <div className="flex gap-2">
              <Input
                value={imageUrl}
                onChange={e => { setImageUrl(e.target.value); setImgError(false); }}
                placeholder="https://..."
                type="url"
                className="w-full h-10 flex-1"
              />
              <Button type="button" variant="secondary" onClick={() => setMediaOpen(true)} className="h-10">
                <ImageIcon className="w-4 h-4 mr-2" /> Seç
              </Button>
            </div>
          </div>

          <Dialog open={mediaOpen} onOpenChange={setMediaOpen}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden" style={{ zIndex: 100 }}>
              <MediaLibrary 
                isModal={true} 
                onClose={() => setMediaOpen(false)}
                onSelect={(url) => {
                  setImageUrl(url);
                  setImgError(false);
                  setMediaOpen(false);
                }} 
              />
            </DialogContent>
          </Dialog>

          <div>
            <label className="flex items-center gap-2 cursor-pointer mt-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={isGeneral}
                onChange={e => setIsGeneral(e.target.checked)}
                className="w-4 h-4 text-yellow-500 rounded border-gray-300 focus:ring-yellow-500"
              />
              Bu bir "Genel Markadır" (Ana sayfada gösterilir)
            </label>
          </div>

          <div className="rounded-xl border-2 border-dashed border-gray-100 dark:border-border bg-gray-50 dark:bg-background flex items-center justify-center overflow-hidden"
            style={{ minHeight: 110 }}>
            {imageUrl && !imgError ? (
              <img
                src={imageUrl}
                alt="Önizleme"
                className="max-h-28 max-w-full object-contain p-2"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex flex-col items-center gap-1 py-6 text-gray-300">
                <ImageIcon className="h-8 w-8" />
                <span className="text-xs">{imgError ? 'Resim yüklenemedi' : 'Resim önizlemesi'}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-5">
          <Button variant="outline" className="flex-1 h-10" onClick={onClose} disabled={saving}>İptal</Button>
          <Button className="flex-1 h-10 bg-yellow-500 hover:bg-yellow-600 text-white" onClick={handleSave} disabled={saving}>
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState([]);
  const [newBrand, setNewBrand] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingBrand, setEditingBrand] = useState(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newIsGeneral, setNewIsGeneral] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);

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
      body: JSON.stringify({ name: newBrand.trim(), image_url: newImageUrl, is_general: newIsGeneral })
    });
    if (res.ok) {
      toast({ description: 'Marka eklendi.' });
      setNewBrand('');
      setNewImageUrl('');
      setNewIsGeneral(false);
      setBrands(prev => [{ id: Date.now(), name: newBrand.trim(), image_url: newImageUrl, is_general: newIsGeneral ? 1 : 0 }, ...prev]);
    } else {
      toast({ description: 'Marka eklenemedi.', variant: 'destructive' });
    }
  };

  const handleDeleteBrand = async (id) => {
    if (!window.confirm('Bu markayı silmek istediğinize emin misiniz?')) return;
    const res = await fetch(`/api/productbrands.php?id=${id}`, { method: 'DELETE' });
    if (res.ok || res.status === 404 || res.status === 405) {
      toast({ description: 'Marka silindi.' });
      setBrands(prev => prev.filter(b => b.id !== id));
    } else {
      toast({ description: 'Marka silinemedi.', variant: 'destructive' });
    }
  };

  const handleSaveEdit = (updatedBrand) => {
    setBrands(prev => prev.map(b => b.id === updatedBrand.id ? updatedBrand : b));
  };

  const filteredBrands = brands.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <AdminLayout title="Markalar">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
              <Tag className="w-6 h-6 text-yellow-500" /> Ürün Markalarını Yönet
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Sistemdeki tüm araç markalarını buradan ekleyebilir ve düzenleyebilirsiniz.</p>
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Marka Ara..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent shadow-sm"
            />
          </div>
        </div>

        <form onSubmit={handleAddBrand} className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newBrand}
              onChange={e => setNewBrand(e.target.value)}
              placeholder="Yeni marka adı..."
              className="flex-1 bg-white dark:bg-card border border-gray-200 dark:border-border px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent shadow-sm"
            />
            <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap">
              <Plus className="w-4 h-4" /> Ekle
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              value={newImageUrl}
              onChange={e => setNewImageUrl(e.target.value)}
              placeholder="https://... (Görsel Linki Opsiyonel)"
              className="flex-1 bg-white dark:bg-card border border-gray-200 dark:border-border px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent shadow-sm"
            />
            <Button type="button" variant="secondary" onClick={() => setMediaOpen(true)} className="h-[46px]">
              <ImageIcon className="w-4 h-4 mr-2" /> Seç
            </Button>
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer mt-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={newIsGeneral}
                onChange={e => setNewIsGeneral(e.target.checked)}
                className="w-4 h-4 text-yellow-500 rounded border-gray-300 focus:ring-yellow-500"
              />
              Bu bir "Genel Markadır" (Araç markası değildir, ana sayfada gösterilir)
            </label>
          </div>
          <Dialog open={mediaOpen} onOpenChange={setMediaOpen}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden" style={{ zIndex: 100 }}>
              <MediaLibrary 
                isModal={true} 
                onClose={() => setMediaOpen(false)}
                onSelect={(url) => {
                  setNewImageUrl(url);
                  setMediaOpen(false);
                }} 
              />
            </DialogContent>
          </Dialog>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBrands.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border shadow-sm">
              <Tag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">Marka bulunamadı.</p>
            </div>
          ) : (
            filteredBrands.map(brand => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={brand.id}
                className="bg-white dark:bg-card p-4 rounded-xl shadow-sm border border-gray-100 dark:border-border flex items-center justify-between group hover:border-yellow-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  {brand.image_url ? (
                    <img src={brand.image_url} alt={brand.name} className="w-10 h-10 object-contain rounded border bg-gray-50 dark:bg-background p-1" />
                  ) : (
                    <div className="w-10 h-10 rounded border bg-gray-50 dark:bg-background flex items-center justify-center text-gray-300">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}
                  <span className="font-semibold text-gray-800 dark:text-gray-200 truncate pr-2">{brand.name}</span>
                  {brand.is_general == 1 && (
                    <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full uppercase ml-2">Genel</span>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setEditingBrand(brand)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="Düzenle"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteBrand(brand.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {editingBrand && (
          <EditBrandModal
            brand={editingBrand}
            onClose={() => setEditingBrand(null)}
            onSave={handleSaveEdit}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}