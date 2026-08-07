import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, GripVertical, Pencil, X, Image as ImageIcon, Tag } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import MediaLibrary from '@/components/MediaLibrary';
import AdminLayout from '@/components/AdminLayout';

const SABIT_MARKALAR = [
  "OPEL", "CHEVROLET", "BMW", "MERCEDES-BENZ", "VOLKSWAGEN", "AUDİ", "TESLA", "SEAT", "SKODA", "PEUGEOT", "CİTROEN", "FORD", "PORSCHE", "MİNİ COOPER"
];

/* ─── Düzenleme Modalı ─────────────────────────────────────────────────────── */
function EditModal({ model, onClose, onSave }) {
  const [name, setName] = useState(model.model || '');
  const [imageUrl, setImageUrl] = useState(model.image_url || '');
  const [saving, setSaving] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);

  // İlk inputa otomatik focus
  const nameRef = useRef(null);
  useEffect(() => { nameRef.current?.focus(); }, []);

  // ESC ile kapat
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: 'Hata', description: 'Model adı boş olamaz.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/brand_models.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: model.id, model: name.trim(), image_url: imageUrl })
      });
      if (res.ok) {
        toast({ title: 'Model Güncellendi' });
        onSave({ ...model, model: name.trim(), image_url: imageUrl });
        onClose();
      } else {
        const d = await res.json();
        toast({ title: 'Hata', description: d.error || 'Güncellenemedi.', variant: 'destructive' });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    /* Backdrop */
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
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-400/20 flex items-center justify-center">
              <Pencil className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-foreground">Modeli Düzenle</h2>
              <p className="text-xs text-gray-400">Ad ve resim güncellenebilir</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 dark:text-gray-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Model Adı */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 flex items-center gap-1">
              <Tag className="h-3 w-3" /> Model Adı
            </label>
            <Input
              ref={nameRef}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Örn: ASTRA J"
              className="w-full h-10"
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
            />
          </div>

          {/* Resim URL */}
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

          {/* Resim Önizlemesi */}
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

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-5">
          <Button
            variant="outline"
            className="flex-1 h-10"
            onClick={onClose}
            disabled={saving}
          >
            İptal
          </Button>
          <Button
            className="flex-1 h-10 bg-yellow-500 hover:bg-yellow-600 text-white font-bold"
            onClick={handleSave}
            disabled={saving || !name.trim()}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a8 8 0 00-8 8h4z" />
                </svg>
                Kaydediliyor...
              </span>
            ) : 'Kaydet'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Ana Sayfa ─────────────────────────────────────────────────────────────── */
const ModelManagementPage = () => {
  const [dynamicBrands, setDynamicBrands] = useState([...SABIT_MARKALAR]);
  const [selectedBrand, setSelectedBrand] = useState(SABIT_MARKALAR[0]);
  const [newTabName, setNewTabName] = useState('');
  const [isAddingTab, setIsAddingTab] = useState(false);
  const [models, setModels] = useState([]);
  const [newModel, setNewModel] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  useEffect(() => {
    fetch('/api/brand_models.php?action=brands')
      .then(res => res.json())
      .then(data => {
        // Merge fetched brands with SABIT_MARKALAR, ignoring GENEL MARKALAR
        if (Array.isArray(data)) {
          const fetched = data.filter(b => b && b !== 'GENEL MARKALAR');
          const merged = Array.from(new Set([...SABIT_MARKALAR, ...fetched]));
          setDynamicBrands(merged);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedBrand) {
      setLoading(true);
      fetch(`/api/brand_models.php?brand=${encodeURIComponent(selectedBrand)}`)
        .then(res => res.json())
        .then(data => {
          const sorted = [...data].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
          setModels(sorted.map(m => ({ id: m.id, model: m.model, image_url: m.image_url, display_order: m.display_order ?? 0 })));
        })
        .catch(() => setModels([]))
        .finally(() => setLoading(false));
    } else {
      setModels([]);
    }
  }, [selectedBrand]);

  const reloadModels = async () => {
    const data = await fetch(`/api/brand_models.php?brand=${encodeURIComponent(selectedBrand)}`).then(r => r.json());
    const sorted = [...data].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    setModels(sorted.map(m => ({ id: m.id, model: m.model, image_url: m.image_url, display_order: m.display_order ?? 0 })));
  };

  const handleAddModel = async (e) => {
    e.preventDefault();
    if (!selectedBrand || !newModel) {
      toast({ title: 'Hata', description: 'Marka ve model adı gereklidir.', variant: 'destructive' });
      return;
    }
    setIsAdding(true);
    try {
      const maxOrder = models.length > 0 ? Math.max(...models.map(m => m.display_order ?? 0)) + 1 : 0;
      const res = await fetch('/api/brand_models.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand: selectedBrand, model: newModel, image_url: newImageUrl, display_order: maxOrder })
      });
      if (res.ok) {
        toast({ title: 'Model Eklendi', description: `${selectedBrand} markasına "${newModel}" modeli eklendi.` });
        setNewModel('');
        setNewImageUrl('');
        await reloadModels();
      } else {
        const data = await res.json();
        toast({ title: 'Hata', description: data.error || 'Model eklenemedi.', variant: 'destructive' });
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteModel = async (id) => {
    if (!window.confirm('Bu modeli silmek istediğinizden emin misiniz?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/brand_models.php?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'Model Silindi' });
        setModels(prev => prev.filter(m => m.id !== id));
      } else {
        const data = await res.json();
        toast({ title: 'Hata', description: data.error || 'Model silinemedi.', variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Modal kaydet: local state'i güncelle
  const handleModalSave = (updated) => {
    setModels(prev => prev.map(m => m.id === updated.id ? { ...m, model: updated.model, image_url: updated.image_url } : m));
  };

  // Drag-and-drop
  const handleDragStart = (index) => { dragItem.current = index; };

  const handleDragEnter = (index) => {
    dragOverItem.current = index;
    const newModels = [...models];
    const dragged = newModels[dragItem.current];
    newModels.splice(dragItem.current, 1);
    newModels.splice(dragOverItem.current, 0, dragged);
    dragItem.current = dragOverItem.current;
    dragOverItem.current = null;
    setModels(newModels);
  };

  const handleDragEnd = async () => {
    const orders = models.map((m, i) => ({ id: m.id, display_order: i }));
    try {
      await fetch('/api/brand_models.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 0, orders })
      });
      setModels(prev => prev.map((m, i) => ({ ...m, display_order: i })));
      toast({ title: 'Sıralama kaydedildi', duration: 1500 });
    } catch {
      toast({ title: 'Hata', description: 'Sıralama kaydedilemedi.', variant: 'destructive' });
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  return (
    <AdminLayout title="Modeller">
      <Helmet>
        <title>Model Yönetimi - Fırat Oto</title>
      </Helmet>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingModel && (
          <EditModal
            model={editingModel}
            onClose={() => setEditingModel(null)}
            onSave={handleModalSave}
          />
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="bg-card shadow-lg border max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground">Model Yönetimi</CardTitle>
              <CardDescription>
                Yeni model ekleyin, ✏️ ikonuna tıklayarak ad &amp; resim düzenleyin, ya da sürükleyerek sıralayın.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Marka Seçimi */}
              <div className="flex flex-wrap gap-2 mb-6 justify-center items-center">
                {dynamicBrands.map(brand => (
                  <Button
                    key={brand}
                    variant={selectedBrand === brand ? 'default' : 'outline'}
                    className={selectedBrand === brand ? 'bg-primary text-white' : ''}
                    onClick={() => setSelectedBrand(brand)}
                  >
                    {brand}
                  </Button>
                ))}
                
                {isAddingTab ? (
                  <form 
                    onSubmit={e => {
                      e.preventDefault();
                      if (newTabName.trim()) {
                        const brandName = newTabName.trim().toUpperCase();
                        if (!dynamicBrands.includes(brandName)) {
                          setDynamicBrands([...dynamicBrands, brandName]);
                        }
                        setSelectedBrand(brandName);
                        setNewTabName('');
                        setIsAddingTab(false);
                      }
                    }}
                    className="flex items-center gap-1"
                  >
                    <Input 
                      value={newTabName} 
                      onChange={e => setNewTabName(e.target.value)} 
                      placeholder="Marka Adı..." 
                      className="w-32 h-9 text-sm uppercase"
                      autoFocus
                    />
                    <Button type="submit" size="sm" className="h-9 px-2">Ekle</Button>
                    <Button type="button" size="sm" variant="ghost" className="h-9 px-2 text-gray-400 hover:text-gray-600 dark:text-gray-400" onClick={() => setIsAddingTab(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </form>
                ) : (
                  <Button
                    variant="outline"
                    className="border-dashed text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-foreground"
                    onClick={() => setIsAddingTab(true)}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Yeni Marka
                  </Button>
                )}

                <div className="w-px h-6 bg-gray-200 mx-2 hidden md:block"></div>

                <Button
                  variant={selectedBrand === 'GENEL MARKALAR' ? 'default' : 'outline'}
                  className={selectedBrand === 'GENEL MARKALAR' ? 'bg-primary text-white' : 'border-yellow-500 text-yellow-600'}
                  onClick={() => setSelectedBrand('GENEL MARKALAR')}
                >
                  GENEL MARKALAR
                </Button>
              </div>

              {selectedBrand && (
                <>
                  {/* Yeni Model Ekle Formu */}
                  <form onSubmit={handleAddModel} className="flex flex-col gap-3 mb-6">
                    <div className="flex gap-2">
                      <Input
                        value={newModel}
                        onChange={e => setNewModel(e.target.value)}
                        placeholder="Yeni model adı (örn: ASTRA J)"
                        disabled={isAdding}
                        className="flex-1"
                      />
                      <Button type="submit" size="icon" disabled={!newModel || isAdding} className="shrink-0">
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Resim URL (Opsiyonel)</label>
                      <div className="flex gap-2">
                        <Input
                          value={newImageUrl}
                          onChange={e => setNewImageUrl(e.target.value)}
                          placeholder="https://... (Görsel linki)"
                          className="bg-gray-50 dark:bg-background flex-1"
                        />
                        <Button type="button" variant="secondary" onClick={() => setMediaOpen(true)}>
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
                            setNewImageUrl(url);
                            setMediaOpen(false);
                          }} 
                        />
                      </DialogContent>
                    </Dialog>

                    {newImageUrl && (
                      <img src={newImageUrl} alt="Önizleme" className="h-14 w-auto object-contain rounded border mt-1" />
                    )}
                  </form>

                  {/* Sıralama ipucu */}
                  {models.length > 1 && (
                    <p className="text-xs text-gray-400 mb-3 text-center flex items-center justify-center gap-1">
                      <GripVertical className="h-3 w-3" /> Satırı sürükleyerek sıralayabilirsiniz
                    </p>
                  )}

                  {/* Model Listesi */}
                  <div className="space-y-1.5">
                    {loading ? (
                      <div className="text-center text-muted-foreground py-6">Yükleniyor...</div>
                    ) : models.length > 0 ? (
                      models.map((m, index) => (
                        <div
                          key={m.id}
                          className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-card shadow-sm border border-gray-100 dark:border-border hover:border-yellow-200 hover:bg-yellow-50/30 transition-colors cursor-grab active:cursor-grabbing select-none group"
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragEnter={() => handleDragEnter(index)}
                          onDragEnd={handleDragEnd}
                          onDragOver={e => e.preventDefault()}
                        >
                          {/* Sürükleme tutamağı */}
                          <GripVertical className="h-4 w-4 text-gray-200 group-hover:text-gray-400 shrink-0 transition-colors" />

                          {/* Resim */}
                          <div className="w-12 h-9 shrink-0 flex items-center justify-center">
                            {m.image_url
                              ? <img src={m.image_url} alt={m.model} className="w-12 h-9 object-contain rounded" />
                              : <div className="w-12 h-9 bg-gray-100 rounded flex items-center justify-center">
                                  <ImageIcon className="h-4 w-4 text-gray-300" />
                                </div>
                            }
                          </div>

                          {/* Model Adı */}
                          <span className="font-medium text-sm text-gray-800 dark:text-gray-200 flex-1 truncate">{m.model}</span>

                          {/* Düzenle Butonu */}
                          <button
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-yellow-100 text-yellow-600 shrink-0"
                            title="Düzenle"
                            onClick={() => setEditingModel(m)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          {/* Sil Butonu */}
                          <button
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 text-red-400 shrink-0"
                            title="Sil"
                            onClick={() => handleDeleteModel(m.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-6">Bu markaya ait model yok.</div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default ModelManagementPage;