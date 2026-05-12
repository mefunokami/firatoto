import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Heart } from 'lucide-react';
import { CartContext } from '@/lib/CartContext.jsx';
import { toast } from '@/components/ui/use-toast';

export default function ModelCategoryPage() {
  const { brand, model } = useParams();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState([]);
  const [products, setProducts] = useState([]);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    // Tüm markalar
    fetch('/api/productbrands.php')
      .then(res => res.json())
      .then(data => setBrands(data));
  }, []);

  useEffect(() => {
    // Seçili marka ve modele ait ürünleri çek
    fetch('/api/products.php')
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(p =>
          (!brand || p.brand?.toLowerCase() === brand?.toLowerCase()) &&
          (!model || p.model?.toLowerCase() === model?.toLowerCase())
        );
        setProducts(filtered);
        // O ürünlerde geçen kategorileri çıkar
        const cats = Array.from(new Set(filtered.map(p => p.category).filter(Boolean)));
        setCategories(cats.map((name, i) => ({ id: i + 1, name })));
      });
  }, [brand, model]);

  // SEO title ve description
  const seoBrand = (brand || '').toUpperCase();
  const seoModel = (model || '').toUpperCase();
  const seoTitle = brand && model ? `${seoBrand} ${seoModel} Yedek Parça | Fırat Oto Yedek Parça` : 'Fırat Oto Yedek Parça';
  const seoDesc = brand && model
    ? `${seoBrand} ${seoModel} yedek parça, orijinal ve uygun fiyatlı ürünler burada. Hızlı kargo, güvenli alışveriş.`
    : 'Aracınız için orijinal ve uygun fiyatlı yedek parçalar. Hızlı kargo, güvenli alışveriş.';

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
      </Helmet>
      <div className="bg-gray-50 min-h-screen py-4 px-2">
        <div className="max-w-7xl mx-auto">
          {brand && model && (
            <h1 className="text-3xl font-extrabold text-center mb-6">{seoBrand} {seoModel} Yedek Parça</h1>
          )}
          {/* Sol Menü */}
          <div className="w-72 bg-white rounded shadow p-4 flex flex-col gap-6">
            <div>
              <h3 className="font-bold text-lg mb-2">{model?.toUpperCase() || 'MODEL'}</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                {categories.map(cat => (
                  <li key={cat.id}>- {cat.name}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-base mb-2">Tüm Markalar</h4>
              <div className="max-h-40 overflow-y-auto flex flex-col gap-1">
                {brands.map(b => (
                  <label key={b.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" value={b.name} checked={selectedBrand.includes(b.name)} onChange={e => {
                      setSelectedBrand(sel => e.target.checked ? [...sel, b.name] : sel.filter(x => x !== b.name));
                    }} />
                    {b.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
          {/* Ürünler */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products
              .filter(p => selectedBrand.length === 0 || selectedBrand.includes(p.brand))
              .map(p => (
                <div key={p.id} className="bg-white rounded shadow p-4 flex flex-col items-center">
                  <div className="h-32 w-full flex items-center justify-center mb-2 bg-gray-50 rounded">
                    {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="max-h-28" /> : <span className="text-gray-300">Görsel Yok</span>}
                  </div>
                  <div className="font-semibold text-center mb-2">{p.name}</div>
                  <div className="font-bold text-lg mb-2">{(!p.price || parseFloat(p.price) === 0) ? 'Fiyatı Sorunuz.' : Number(p.price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</div>
                  <button 
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-4 py-2 rounded w-full mb-2"
                    onClick={() => {
                      addToCart({ ...p, quantity: 1, image: p.imageUrl });
                      toast({ description: 'Ürün sepete eklendi', duration: 3000 });
                    }}
                  >
                    Sepete Ekle
                  </button>
                  <button 
                    className="w-full border border-gray-300 rounded py-2 text-gray-500 hover:text-red-500 flex items-center justify-center gap-2"
                    onClick={() => {
                      let favs = JSON.parse(localStorage.getItem('favorites') || '[]');
                      if (favs.some(f => f.id === p.id)) {
                        favs = favs.filter(f => f.id !== p.id);
                        toast({ description: 'Favorilerden çıkarıldı', duration: 2000 });
                      } else {
                        favs.push(p);
                        toast({ description: 'Favorilere eklendi', duration: 2000 });
                      }
                      localStorage.setItem('favorites', JSON.stringify(favs));
                    }}
                  >
                    <Heart 
                      size={16} 
                      fill={JSON.parse(localStorage.getItem('favorites') || '[]').some(f => f.id === p.id) ? '#facc15' : 'none'} 
                      stroke={JSON.parse(localStorage.getItem('favorites') || '[]').some(f => f.id === p.id) ? '#facc15' : '#6b7280'} 
                      strokeWidth={1.5}
                    />
                    Favorilere Ekle
                  </button>
                </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
} 