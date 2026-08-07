import React, { useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(favs);
  }, []);

  const removeFavorite = (id) => {
    const newFavs = favorites.filter(f => f.id !== id);
    setFavorites(newFavs);
    localStorage.setItem('favorites', JSON.stringify(newFavs));
    toast({ description: 'Ürün favorilerden çıkarıldı.', duration: 2000 });
  };

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6 border-b-2 border-yellow-400 inline-block">FAVORİ ÜRÜNLERİM</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-card border rounded shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">Ürün Adı</th>
              <th className="p-3 text-left">Fiyat (KDV Dahil)</th>
              <th className="p-3 text-left"></th>
            </tr>
          </thead>
          <tbody>
            {favorites.length === 0 ? (
              <tr><td colSpan={3} className="text-center p-6 text-gray-400">Favori ürününüz yok.</td></tr>
            ) : favorites.map(item => (
              <tr key={item.id} className="border-b">
                <td className="p-3 flex items-center gap-3">
                  <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-contain border rounded" />
                  <span>{item.name}</span>
                </td>
                <td className="p-3">{Number(item.price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</td>
                <td className="p-3">
                  <button className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold px-4 py-2 rounded" onClick={() => removeFavorite(item.id)}>Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 