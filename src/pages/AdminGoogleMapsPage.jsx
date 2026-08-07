import React, { useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import GoogleMapsRating from '@/components/GoogleMapsRating';
import AdminLayout from '@/components/AdminLayout';

const API = '/api/google_maps_rating.php';

export default function AdminGoogleMapsPage() {
  const [form, setForm] = useState({
    rating: 5,
    review_count: 0,
    maps_url: 'https://share.google/Sq5zO5TC6BcGLN7v6',
    business_name: 'Fırat Oto Yedek Parça',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(API)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setForm({
            rating: data.rating ?? 5,
            review_count: data.review_count ?? 0,
            maps_url: data.maps_url ?? '',
            business_name: data.business_name ?? '',
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(API, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      toast({ description: 'Google Maps bilgileri kaydedildi', duration: 2000 });
      setForm({
        rating: data.rating,
        review_count: data.review_count,
        maps_url: data.maps_url,
        business_name: data.business_name,
      });
    } else {
      toast({ description: data.error || 'Kayıt başarısız', variant: 'destructive', duration: 2000 });
    }
    setLoading(false);
  };

  return (
    <AdminLayout title="Google Maps">
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-2 text-foreground">Google Maps Puanı</h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        Ürün sayfalarında gösterilen yıldız ve yorum sayısı Google Maps&apos;ten alınır.
        Google işletme sayfanızdaki puan ve yorum sayısını buraya girin (ara sıra güncelleyin).
      </p>

      <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow p-6 space-y-4 border border-gray-100 dark:border-border">
        <div>
          <label className="block text-sm font-semibold mb-1">Yıldız puanı (0–5)</label>
          <input
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={form.rating}
            onChange={(e) => setForm((p) => ({ ...p, rating: parseFloat(e.target.value) || 0 }))}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Yorum sayısı</label>
          <input
            type="number"
            min="0"
            value={form.review_count}
            onChange={(e) => setForm((p) => ({ ...p, review_count: parseInt(e.target.value, 10) || 0 }))}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Google Maps linki</label>
          <input
            type="url"
            value={form.maps_url}
            onChange={(e) => setForm((p) => ({ ...p, maps_url: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="https://share.google/..."
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">İşletme adı (isteğe bağlı)</label>
          <input
            type="text"
            value={form.business_name}
            onChange={(e) => setForm((p) => ({ ...p, business_name: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div className="bg-gray-50 dark:bg-background rounded-lg p-4 border">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Önizleme (ürün sayfasında böyle görünür)</div>
          <GoogleMapsRating
            rating={form.rating}
            reviewCount={form.review_count}
            mapsUrl={form.maps_url}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </form>
    </div>
    </AdminLayout>
  );
}
