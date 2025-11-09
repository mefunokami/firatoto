import React, { useEffect, useState, useContext } from 'react';
import { FaHeart } from 'react-icons/fa';
import { CartContext } from '@/lib/CartContext.jsx';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const WEEKLY_DEAL_API = '/api/products.php?weekly_deal=1';

export default function WeeklyDealSlider({ large }) {
  const [products, setProducts] = useState([]);
  const [current, setCurrent] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const { addToCart } = useContext(CartContext);
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = () => {
      fetch(WEEKLY_DEAL_API)
        .then(res => res.json())
        .then(setProducts);
    };
    
    fetchProducts();
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(favs);
    
    // Her 30 saniyede bir güncelle
    const interval = setInterval(fetchProducts, 30000);
    
    // Sayfa aktif olduğunda da güncelle
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchProducts();
      }
    };
    
    // Haftanın fırsatı değiştiğinde güncelle
    const handleWeeklyDealUpdate = () => {
      fetchProducts();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('weeklyDealUpdated', handleWeeklyDealUpdate);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('weeklyDealUpdated', handleWeeklyDealUpdate);
    };
  }, []);

  useEffect(() => {
    if (products.length > 1) {
      const id = setInterval(() => {
        setCurrent(c => (c + 1) % products.length);
      }, 6000);
      setIntervalId(id);
      return () => clearInterval(id);
    }
  }, [products]);

  if (!products.length) return null;

  const goTo = idx => {
    setCurrent(idx);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  // Slider okları için fonksiyonlar (düzgün çalışacak şekilde)
  const prev = () => {
    if (products.length > 1) setCurrent(c => (c - 1 + products.length) % products.length);
  };
  const next = () => {
    if (products.length > 1) setCurrent(c => (c + 1) % products.length);
  };

  const isFavorite = products[current] && favorites.some(f => f.id === products[current].id);

  const toggleFavorite = () => {
    if (!products[current]) return;
    let newFavs;
    if (isFavorite) {
      newFavs = favorites.filter(f => f.id !== products[current].id);
      toast({ description: 'Favorilerden çıkarıldı', duration: 2000 });
    } else {
      newFavs = [...favorites, products[current]];
      toast({ description: 'Favorilere eklendi', duration: 2000 });
    }
    setFavorites(newFavs);
    localStorage.setItem('favorites', JSON.stringify(newFavs));
  };

  // slugify fonksiyonu
  function slugify(str) {
    return (str || "")
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/ı/g, 'i')
      .replace(/ç/g, 'c')
      .replace(/ş/g, 's')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ö/g, 'o')
      .replace(/[^a-z0-9_]/g, '')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  return (
    <div className="w-full max-w-sm mx-auto rounded-xl overflow-hidden shadow bg-white border border-gray-200" style={{height: 370}}>
      {/* Üst Bar */}
      <div className="relative bg-black h-14 flex items-center px-4">
        <span className="absolute left-0 top-0 h-full flex items-center">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M8 0L0 16H8L4 32L24 8H16L20 0H8Z" fill="#FFC107"/>
          </svg>
        </span>
        <span className="flex-1 text-center text-white font-extrabold text-lg tracking-wide">HAFTANIN FIRSATI</span>
        <span className="absolute right-2 flex gap-2">
          <button onClick={prev} disabled={products.length <= 1} className={`text-white opacity-60 hover:opacity-100 p-1 ${products.length <= 1 ? 'cursor-not-allowed opacity-30' : ''}`}><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
          <button onClick={next} disabled={products.length <= 1} className={`text-white opacity-60 hover:opacity-100 p-1 ${products.length <= 1 ? 'cursor-not-allowed opacity-30' : ''}`}><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
        </span>
      </div>
      {/* Ürün Kartı */}
      <div className="flex flex-col items-center px-4 pt-6 pb-4 overflow-hidden h-[310px]" onClick={() => {
        const p = products[current];
        if (p && p.brand && p.name) {
          navigate(`/${slugify(p.brand)}/${slugify(p.name)}`);
        } else if (p && p.id) {
          navigate(`/product/${p.id}`);
        }
      }} style={{ cursor: 'pointer' }}>
        <img
          src={products[current].imageUrl}
          alt={products[current].name}
          className="object-contain w-[180px] h-[90px] mb-4"
        />
        <div className="flex items-center gap-2 mb-2 w-full justify-center">
          <button
            className="bg-white border border-gray-300 rounded px-4 py-1 text-gray-700 text-sm font-semibold shadow-sm hover:bg-gray-50"
            onClick={() => {
              addToCart({ ...products[current], quantity: 1, image: products[current].imageUrl });
              toast({ description: 'Ürün sepete eklendi', duration: 3000 });
            }}
          >
            Sepete Ekle
          </button>
          <button
            className="bg-white border border-gray-300 rounded p-2 hover:bg-gray-50"
            onClick={toggleFavorite}
            aria-label="Favorilere ekle/çıkar"
          >
            <FaHeart 
              size={18} 
              fill={isFavorite ? '#facc15' : 'none'} 
              stroke={isFavorite ? '#facc15' : '#6b7280'} 
              strokeWidth={1.5}
            />
          </button>
        </div>
        <div
          className="text-center text-gray-700 text-sm font-medium mb-2 leading-tight break-words max-w-[200px] line-clamp-2 overflow-hidden"
          style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', minHeight: '2.5em', maxHeight: '2.5em'}}
        >
          {products[current].name}
        </div>
        <div className="text-center text-black text-xl font-bold mt-2">
          {Number(products[current].price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
        </div>
      </div>
    </div>
  );
} 