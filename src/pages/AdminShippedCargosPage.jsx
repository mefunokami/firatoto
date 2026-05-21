import React, { useEffect, useRef, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import AdminLayout from '@/components/AdminLayout';

const API = '/api/shipped_cargos.php';

export default function AdminShippedCargosPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ image_url: '', title: '', display_order: 0 });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  const fetchItems = () => {
    fetch(API).then(r => r.json()).then(setItems).catch(() => setItems([]));
  };

  useEffect(() => { fetchItems(); }, []);

  const handleFileChange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', f);
      const res = await fetch('/api/upload_slider_image.php', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setForm(prev => ({ ...prev, image_url: data.url }));
      } else {
        toast({ description: 'Yükleme hatası: ' + (data.error || 'Bilinmeyen hata'), variant: 'destructive' });
      }
    } catch (err) {
      toast({ description: 'Sunucu bağlantı hatası oluştu.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image_url.trim()) {
      toast({ description: 'Görsel gerekli', variant: 'destructive', duration: 2000 });
      return;
    }
    setLoading(true);
    const method = editId ? 'PUT' : 'POST';
    const body = editId ? { ...form, id: editId } : form;
    const res = await fetch(API, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      toast({ description: editId ? 'Güncellendi' : 'Eklendi', duration: 2000 });
      setForm({ image_url: '', title: '', display_order: 0 });
      setEditId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchItems();
    } else {
      toast({ description: 'Hata oluştu', variant: 'destructive', duration: 2000 });
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Silmek istediğinize emin misiniz?')) return;
    await fetch(`${API}?id=${id}`, { method: 'DELETE' });
    toast({ description: 'Silindi', duration: 2000 });
    fetchItems();
  };

  const handleEdit = (item) => {
    setForm({ image_url: item.image_url, title: item.title || '', display_order: item.display_order || 0 });
    setEditId(item.id);
    if (fileInputRef.current) fileInputRef.current.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AdminLayout title="Gönderilen Kargolar">
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-2 text-foreground">Gönderilen Kargolar</h2>
      <p className="text-gray-500 mb-6 text-sm">Bu bölüme eklediğiniz görseller anasayfada "Gönderilen Kargolar" bölümünde görünecektir.</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-8 space-y-4 border border-gray-100">
        <h3 className="font-bold text-lg mb-2">{editId ? '✏️ Düzenle' : '➕ Yeni Ekle'}</h3>
        <div>
          <label className="block font-semibold mb-1 text-sm">Görsel (Dosya yükle veya link gir)</label>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="mb-2 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
          />
          <input
            type="text"
            placeholder="Veya görsel URL linki girin..."
            value={form.image_url}
            onChange={e => setForm(prev => ({ ...prev, image_url: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
          />
          {form.image_url && (
            <img src={form.image_url} alt="Önizleme" className="mt-3 h-32 w-auto rounded-lg object-cover border" />
          )}
        </div>
        <input
          type="text"
          placeholder="Başlık (isteğe bağlı, örn: Ocak 2026 Kargoları)"
          value={form.title}
          onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
        />
        <input
          type="number"
          placeholder="Sıralama (küçük sayı önce görünür)"
          value={form.display_order}
          onChange={e => setForm(prev => ({ ...prev, display_order: Number(e.target.value) }))}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
        />
        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Kaydediliyor...' : editId ? 'Güncelle' : 'Ekle'}
          </button>
          {editId && (
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 underline text-sm"
              onClick={() => {
                setEditId(null);
                setForm({ image_url: '', title: '', display_order: 0 });
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            >
              İptal
            </button>
          )}
        </div>
      </form>

      <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
        <h3 className="font-bold text-lg mb-4">Mevcut Kargo Fotoğrafları ({items.length})</h3>
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">📭</div>
            <p>Henüz kargo fotoğrafı eklenmemiş.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {items.map(item => (
              <div key={item.id} className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title || 'Kargo'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  {item.title && <div className="font-semibold text-sm mb-1">{item.title}</div>}
                  <div className="text-xs text-gray-400 mb-3">Sıra: {item.display_order} | #{item.id}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex-1 text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-bold py-1.5 rounded-lg transition-colors"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 font-bold py-1.5 rounded-lg transition-colors"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </AdminLayout>
  );
}
