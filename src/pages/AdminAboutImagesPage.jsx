import React, { useEffect, useRef, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import AdminLayout from '@/components/AdminLayout';

const API = '/api/about_images.php';

export default function AdminAboutImagesPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ image_url: '', display_order: 0 });
  const [file, setFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aboutText, setAboutText] = useState('');
  const [textLoading, setTextLoading] = useState(false);
  const fileInputRef = useRef();

  const fetchItems = () => {
    fetch(API).then(r => r.json()).then(setItems).catch(() => setItems([]));
  };

  const fetchText = () => {
    fetch('/api/about_text.php').then(r => r.json()).then(data => {
      if (data.success) setAboutText(data.text);
    }).catch(console.error);
  };

  useEffect(() => { 
    fetchItems(); 
    fetchText();
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f || null);
    if (f) {
      setForm(prev => ({ ...prev, image_url: URL.createObjectURL(f) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image_url.trim() && !file) {
      toast({ description: 'Görsel gerekli', variant: 'destructive', duration: 2000 });
      return;
    }
    setLoading(true);

    let finalImageUrl = form.image_url;

    if (file) {
      const formData = new FormData();
      formData.append('image', file);
      try {
        const res = await fetch('/api/upload_about_image.php', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
          finalImageUrl = data.url;
        } else {
          toast({ description: 'Yükleme hatası: ' + (data.error || 'Bilinmeyen hata'), variant: 'destructive' });
          setLoading(false);
          return;
        }
      } catch (err) {
        toast({ description: 'Sunucu bağlantı hatası oluştu.', variant: 'destructive' });
        setLoading(false);
        return;
      }
    }

    const method = editId ? 'PUT' : 'POST';
    const body = editId ? { ...form, image_url: finalImageUrl, id: editId } : { ...form, image_url: finalImageUrl };
    const res = await fetch(API, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      toast({ description: editId ? 'Güncellendi' : 'Eklendi', duration: 2000 });
      setForm({ image_url: '', display_order: 0 });
      setEditId(null);
      setFile(null);
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
    setForm({ image_url: item.image_url, display_order: item.display_order || 0 });
    setEditId(item.id);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    setTextLoading(true);
    try {
      const res = await fetch('/api/about_text.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: aboutText }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ description: 'Hakkımızda yazısı başarıyla güncellendi.', duration: 2000 });
      } else {
        toast({ description: 'Hata: ' + data.error, variant: 'destructive' });
      }
    } catch (err) {
      toast({ description: 'Bağlantı hatası.', variant: 'destructive' });
    }
    setTextLoading(false);
  };

  return (
    <AdminLayout title="Hakkımızda Fotoğrafları ve Yazısı">
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-2 text-foreground">Hakkımızda Bölümü Yönetimi</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Bu sayfadan "Hakkımızda" metnini ve yanında görünecek kayan fotoğrafları düzenleyebilirsiniz.</p>

      {/* Yazı Düzenleme Formu */}
      <form onSubmit={handleTextSubmit} className="bg-card rounded-xl shadow p-6 mb-8 space-y-4 border border-gray-100 dark:border-border">
        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">📝 Hakkımızda Yazısı</h3>
        <div>
          <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">
            Müşterilerinizin anasayfada göreceği metni buraya yazabilirsiniz. Satır atlamak için Enter'ı kullanabilirsiniz.
          </label>
          <textarea
            rows="6"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 dark:bg-background dark:border-border dark:text-foreground resize-y"
            placeholder="Hakkımızda metni..."
            value={aboutText}
            onChange={e => setAboutText(e.target.value)}
          ></textarea>
        </div>
        <div>
          <button
            type="submit"
            className="bg-[#18181b] hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
            disabled={textLoading}
          >
            {textLoading ? 'Kaydediliyor...' : 'Yazıyı Kaydet'}
          </button>
        </div>
      </form>

      <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow p-6 mb-8 space-y-4 border border-gray-100 dark:border-border">
        <h3 className="font-bold text-lg mb-2">{editId ? '✏️ Düzenle' : '➕ Yeni Ekle'}</h3>
        <div>
          <label className="block font-semibold mb-1 text-sm">Görsel Yükle</label>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="mb-2 block w-full text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
          />
          {!file && (
            <div className="mt-2">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Veya görsel URL linki girin:</label>
              <input
                type="text"
                placeholder="Görsel linki (örn: https://...)"
                value={form.image_url}
                onChange={e => setForm(prev => ({ ...prev, image_url: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>
          )}
          {form.image_url && (
            <img src={form.image_url} alt="Önizleme" className="mt-3 h-32 w-auto rounded-lg object-cover border p-1" />
          )}
        </div>
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
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 underline text-sm"
              onClick={() => {
                setEditId(null);
                setForm({ image_url: '', display_order: 0 });
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            >
              İptal
            </button>
          )}
        </div>
      </form>

      <div className="bg-card rounded-xl shadow p-6 border border-gray-100 dark:border-border">
        <h3 className="font-bold text-lg mb-4">Mevcut Fotoğraflar ({items.length})</h3>
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">📸</div>
            <p>Henüz fotoğraf eklenmemiş.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {items.map(item => (
              <div key={item.id} className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  <img
                    src={item.image_url}
                    alt="Hakkımızda"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
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
