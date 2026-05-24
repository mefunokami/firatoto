import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { toast } from '@/components/ui/use-toast';
import { Search, X, Star } from 'lucide-react';

const API = '/api/products.php';

export default function AdminWeeklyDealPage() {
  const [weeklyProducts, setWeeklyProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mevcut haftanın fırsatı ürünlerini çek
  const fetchWeeklyProducts = () => {
    setLoading(true);
    fetch(`${API}?weekly_deal=1`)
      .then(r => r.json())
      .then(data => setWeeklyProducts(Array.isArray(data) ? data : []))
      .catch(() => setWeeklyProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWeeklyProducts();
  }, []);

  // Ürün arama
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`${API}?page=1&limit=20&search=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        const products = data.products || (Array.isArray(data) ? data : []);
        // Zaten haftalık fırsatta olanları gösterme
        const weeklyIds = new Set(weeklyProducts.map(p => p.id));
        setSearchResults(products.filter(p => !weeklyIds.has(p.id)));
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, weeklyProducts]);

  const addToWeekly = async (product) => {
    try {
      const res = await fetch(`${API}?set_weekly_deal=1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, is_weekly_deal: 1 }),
      });
      if (res.ok) {
        toast({ description: `"${product.name}" haftanın fırsatına eklendi.`, duration: 2500 });
        setWeeklyProducts(prev => [...prev, { ...product, is_weekly_deal: 1 }]);
        setSearchResults(prev => prev.filter(p => p.id !== product.id));
      } else {
        toast({ description: 'Eklenemedi.', variant: 'destructive' });
      }
    } catch {
      toast({ description: 'Sunucu hatası.', variant: 'destructive' });
    }
  };

  const removeFromWeekly = async (product) => {
    try {
      const res = await fetch(`${API}?set_weekly_deal=1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, is_weekly_deal: 0 }),
      });
      if (res.ok) {
        toast({ description: `"${product.name}" haftanın fırsatından çıkarıldı.`, duration: 2500 });
        setWeeklyProducts(prev => prev.filter(p => p.id !== product.id));
      } else {
        toast({ description: 'Çıkarılamadı.', variant: 'destructive' });
      }
    } catch {
      toast({ description: 'Sunucu hatası.', variant: 'destructive' });
    }
  };

  return (
    <AdminLayout title="Haftanın Fırsatı">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-2 text-foreground">Haftanın Fırsatı Yönetimi</h2>
        <p className="text-gray-500 mb-6 text-sm">
          Anasayfada "Haftanın Fırsatı" bölümünde gösterilecek ürünleri buradan yönetin. Ürün ara ve ekle, veya mevcut ürünleri listeden çıkar.
        </p>

        {/* Ürün Arama */}
        <div className="bg-white rounded-xl shadow p-6 mb-6 border border-gray-100">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <Search className="w-5 h-5 text-yellow-500" />
            Ürün Ara ve Ekle
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Ürün adı veya parça numarası ara..."
              className="w-full border rounded-lg pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Arama sonuçları */}
          {searchQuery.trim() && (
            <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
              {searching ? (
                <div className="text-center py-4 text-gray-400 text-sm">Aranıyor...</div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-4 text-gray-400 text-sm">Sonuç bulunamadı veya tüm eşleşenler zaten eklenmiş.</div>
              ) : (
                searchResults.map(product => (
                  <div key={product.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition">
                    <img
                      src={product.imageUrl || product.image_url}
                      alt={product.name}
                      className="w-12 h-10 object-contain rounded border bg-gray-50 flex-shrink-0"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{product.name}</div>
                      <div className="text-xs text-gray-400">{product.brand} {product.model ? `· ${product.model}` : ''}</div>
                    </div>
                    <div className="text-sm font-bold text-gray-700 flex-shrink-0">
                      {(!product.price || parseFloat(product.price) === 0)
                        ? 'Fiyatı Sorunuz'
                        : Number(product.price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </div>
                    <button
                      onClick={() => addToWeekly(product)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors flex-shrink-0"
                    >
                      Ekle
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Mevcut Haftanın Fırsatı Ürünleri */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
            Mevcut Haftanın Fırsatı Ürünleri ({weeklyProducts.length})
          </h3>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Yükleniyor...</div>
          ) : weeklyProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Star className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>Henüz haftanın fırsatı ürünü eklenmemiş.</p>
              <p className="text-xs mt-1">Yukarıdan ürün arayarak ekleyebilirsiniz.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {weeklyProducts.map(product => (
                <div key={product.id} className="flex items-center gap-3 p-3 border rounded-xl hover:bg-yellow-50/50 transition group">
                  <img
                    src={product.imageUrl || product.image_url}
                    alt={product.name}
                    className="w-16 h-12 object-contain rounded border bg-gray-50 flex-shrink-0"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{product.name}</div>
                    <div className="text-xs text-gray-400">{product.brand} {product.model ? `· ${product.model}` : ''}</div>
                    <div className="text-xs font-bold text-yellow-600 mt-0.5">
                      {(!product.price || parseFloat(product.price) === 0)
                        ? 'Fiyatı Sorunuz'
                        : Number(product.price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </div>
                  </div>
                  <div className="text-xs text-gray-300 flex-shrink-0">#{product.id}</div>
                  <button
                    onClick={() => removeFromWeekly(product)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold py-1.5 px-3 rounded-lg transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                  >
                    Çıkar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
