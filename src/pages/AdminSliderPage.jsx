import React, { useEffect, useRef, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';

// API endpointleri örnek olarak verilmiştir
const SLIDER_API = '/api/homepage_sliders.php';

export default function AdminSliderPage() {
  const [sliders, setSliders] = useState([]);
  const [form, setForm] = useState({
    image_url: '',
    title: '',
    description: '',
    link: '',
    slider_order: 0,
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const fileInputRef = useRef();

  // Sliderları çek
  useEffect(() => {
    fetch(SLIDER_API)
      .then(res => res.json())
      .then(setSliders);
  }, []);

  const handleFileChange = async (e) => {
    const f = e.target.files[0];
    setFile(f);
    if (f) {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('image', f);
        const res = await fetch('/api/upload_slider_image.php', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
          setForm({ ...form, image_url: data.url });
        } else {
          alert('Yükleme hatası: ' + (data.error || 'Bilinmeyen hata'));
        }
      } catch (err) {
        alert('Sunucu bağlantı hatası oluştu.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Form submit (yeni ekle veya güncelle)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const method = editId ? 'PUT' : 'POST';
    const body = editId ? { ...form, id: editId } : form;
    await fetch(SLIDER_API, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setForm({ image_url: '', title: '', description: '', link: '', slider_order: 0 });
    setEditId(null);
    setFile(null);
    fileInputRef.current.value = '';
    // Yeniden çek
    fetch(SLIDER_API)
      .then(res => res.json())
      .then(setSliders);
    setLoading(false);
  };

  // Sil
  const handleDelete = async (id) => {
    if (!window.confirm('Silmek istediğinize emin misiniz?')) return;
    await fetch(`${SLIDER_API}?id=${id}`, { method: 'DELETE' });
    setSliders(sliders.filter(s => s.id !== id));
  };

  // Düzenle
  const handleEdit = (slider) => {
    setForm({
      image_url: slider.image_url,
      title: slider.title,
      description: slider.description,
      link: slider.link,
      slider_order: slider.slider_order,
    });
    setEditId(slider.id);
    setFile(null);
    fileInputRef.current.value = '';
  };

  return (
    <AdminLayout title="Hero Slider">
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-2 text-foreground">Hero Slider Yönetimi</h2>
      <p className="text-gray-500 text-sm mb-6">Anasayfadaki büyük banner görsellerini buradan ekleyip güncelleyebilirsiniz. Sık değişecek fotoğraflar için idealdir.</p>
      <form onSubmit={handleSubmit} className="bg-white rounded shadow p-6 mb-8 space-y-4">
        <div>
          <label className="block font-semibold mb-1">Görsel (Dosya yükle veya link gir)</label>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="mb-2" />
          <input
            type="text"
            placeholder="Veya görsel linki"
            value={form.image_url}
            onChange={e => setForm({ ...form, image_url: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
          {form.image_url && <img src={form.image_url} alt="Önizleme" className="mt-2 h-24" />}
        </div>
        <input
          type="text"
          placeholder="Başlık"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
        <textarea
          placeholder="Açıklama"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="text"
          placeholder="Tıklanınca gidilecek link (isteğe bağlı)"
          value={form.link}
          onChange={e => setForm({ ...form, link: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="number"
          placeholder="Sıralama (küçükten büyüğe)"
          value={form.slider_order}
          onChange={e => setForm({ ...form, slider_order: Number(e.target.value) })}
          className="w-full border rounded px-3 py-2"
        />
        <button
          type="submit"
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded"
          disabled={loading}
        >
          {editId ? 'Güncelle' : 'Ekle'}
        </button>
        {editId && (
          <button type="button" className="ml-4 text-gray-500 underline" onClick={() => { setEditId(null); setForm({ image_url: '', title: '', description: '', link: '', slider_order: 0 }); setFile(null); fileInputRef.current.value = ''; }}>
            İptal
          </button>
        )}
      </form>
      <div className="bg-white rounded shadow p-6">
        <h3 className="font-bold mb-4">Mevcut Sliderlar</h3>
        <div className="space-y-4">
          {sliders.map(slider => (
            <div key={slider.id} className="flex items-center gap-4 border-b pb-4">
              <img src={slider.image_url} alt={slider.title} className="h-16 w-24 object-cover rounded" />
              <div className="flex-1">
                <div className="font-semibold">{slider.title}</div>
                <div className="text-xs text-gray-500">{slider.description}</div>
                <div className="text-xs text-blue-500">{slider.link}</div>
                <div className="text-xs text-gray-400">Sıra: {slider.slider_order}</div>
              </div>
              <button onClick={() => handleEdit(slider)} className="text-yellow-600 font-bold mr-2">Düzenle</button>
              <button onClick={() => handleDelete(slider.id)} className="text-red-500 font-bold">Sil</button>
            </div>
          ))}
        </div>
      </div>
    </div>
    </AdminLayout>
  );
} 