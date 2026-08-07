import React, { useEffect, useState, useContext } from 'react';
import { FaHeart } from 'react-icons/fa';
import { ShoppingCart, Flame } from 'lucide-react';
import { CartContext } from '@/lib/CartContext.jsx';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
        .then(res => {
          if (!res.ok) throw new Error('API bulunamadı');
          return res.json();
        })
        .then(data => {
          if (data && data.length > 0) {
            setProducts(data);
          } else {
            throw new Error('Veri boş');
          }
        })
        .catch(() => {
          // Geliştirici ortamı için mock data (API çalışmadığında görünmesi için)
          setProducts([
            { id: 999, name: "BMW 5 SERİ F10 LCİ M TECH ÖN TAMPON SET", brand: "BMW", price: "6500.00", imageUrl: "https://placehold.co/400x400/png?text=BMW+Tampon" },
            { id: 998, name: "Mercedes C Serisi W205 Far Seti", brand: "MERCEDES-BENZ", price: "12000.00", imageUrl: "https://placehold.co/400x400/png?text=Mercedes+Far" }
          ]);
        });
    };
    
    fetchProducts();
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(favs);
    
    const interval = setInterval(fetchProducts, 30000);
    
    const handleVisibilityChange = () => {
      if (!document.hidden) fetchProducts();
    };
    
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

  const prev = () => {
    if (products.length > 1) setCurrent(c => (c - 1 + products.length) % products.length);
  };
  const next = () => {
    if (products.length > 1) setCurrent(c => (c + 1) % products.length);
  };

  const isFavorite = products[current] && favorites.some(f => f.id === products[current].id);

  const toggleFavorite = (e) => {
    e.stopPropagation();
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

  function slugify(str) {
    return (str || "").toString().toLowerCase().replace(/\s+/g, '_').replace(/ı/g, 'i').replace(/ç/g, 'c').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/[^a-z0-9_]/g, '').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
  }

  const formatPrice = (price) => {
    if (!price || parseFloat(price) === 0) return 'Fiyatı Sorunuz.';
    return Number(price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });
  };

  const currentProduct = products[current];

  return (
    <div className="w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-soft hover:shadow-glow transition-shadow duration-300 bg-card border-none flex flex-col h-full">
      
      {/* Üst Bar (Sarı Siyah Tema) */}
      <div className="relative bg-[#ffc107] h-12 sm:h-14 flex items-center justify-between px-3 flex-shrink-0 shadow-sm border-b border-yellow-500 overflow-hidden">
        <div className="flex items-center gap-1.5 z-10">
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none" className="drop-shadow-sm opacity-50">
            <path d="M8 0L0 16H8L4 32L24 8H16L20 0H8Z" fill="#000000"/>
          </svg>
          <span className="text-black font-extrabold text-sm sm:text-base tracking-wide drop-shadow-sm whitespace-nowrap">
            HAFTANIN FIRSATLARI
          </span>
        </div>
        <div className="flex gap-0.5 z-10 shrink-0">
          <button onClick={prev} disabled={products.length <= 1} className={`text-black hover:bg-black/10 rounded-full p-1 transition-colors ${products.length <= 1 ? 'opacity-30 cursor-not-allowed' : ''}`}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button onClick={next} disabled={products.length <= 1} className={`text-black hover:bg-black/10 rounded-full p-1 transition-colors ${products.length <= 1 ? 'opacity-30 cursor-not-allowed' : ''}`}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>

      {/* Ürün Alanı */}
      <div 
        className="flex flex-col flex-1 px-4 pt-3 pb-3 justify-between relative cursor-pointer group min-h-0" 
        onClick={() => {
          if (currentProduct.brand && currentProduct.name) {
            navigate(`/${slugify(currentProduct.brand)}/${slugify(currentProduct.name)}`);
          } else {
            navigate(`/product/${currentProduct.id}`);
          }
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full"
          >
            {/* Fotoğraf (Beyaz arka plan sorununu çözen container) */}
            <div className="w-full h-[100px] sm:h-[120px] shrink-0 bg-white dark:bg-white/5 rounded-xl flex items-center justify-center p-2 mb-2 overflow-hidden relative">
              <motion.img
                src={currentProduct.imageUrl}
                alt={currentProduct.name}
                className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.4 }}
              />
              
              {/* Favori Butonu */}
              <button
                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-background/80 backdrop-blur-md rounded-full shadow-sm hover:bg-background border border-border transition-all z-10"
                onClick={toggleFavorite}
                title="Favorilere ekle/çıkar"
              >
                <FaHeart size={14} fill={isFavorite ? 'var(--primary)' : 'none'} stroke={isFavorite ? 'var(--primary)' : 'currentColor'} strokeWidth={isFavorite ? 0 : 30} color={isFavorite ? 'var(--primary)' : 'currentColor'} />
              </button>
            </div>

            {/* Metin ve Bilgiler */}
            <div className="flex-1 flex flex-col justify-center text-center min-h-0 overflow-hidden">
              <span className="inline-block self-center px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-bold tracking-wider rounded-md mb-1 uppercase shrink-0">
                  {currentProduct.brand || 'ÖZEL FIRSAT'}
              </span>
              <div
                className="text-foreground text-xs font-semibold mb-1 leading-snug line-clamp-2 group-hover:text-primary transition-colors shrink-0"
              >
                {currentProduct.name}
              </div>
              <div className="text-foreground text-lg sm:text-xl font-extrabold tracking-tight mb-2 shrink-0">
                {formatPrice(currentProduct.price)}
              </div>
            </div>
            
            {/* Sepete Ekle Butonu */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              animate={{ scale: [1, 1.02, 1], boxShadow: ["0px 0px 0px rgba(255,193,7,0)", "0px 0px 15px rgba(255,193,7,0.6)", "0px 0px 0px rgba(255,193,7,0)"] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-full flex items-center justify-center gap-2 bg-[#ffc107] hover:bg-[#e0a800] text-black font-extrabold py-2 rounded-xl transition-all shadow-md active:scale-95 z-10 border border-yellow-500 shrink-0 text-sm"
              onClick={(e) => {
                e.stopPropagation();
                addToCart({ ...currentProduct, quantity: 1, image: currentProduct.imageUrl });
                toast({ description: 'Ürün sepete eklendi', duration: 3000 });
              }}
            >
              <ShoppingCart className="w-5 h-5" />
              HEMEN AL
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}