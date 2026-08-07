import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { CartContext } from '@/lib/CartContext.jsx';
import { Heart, ShoppingCart } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { slugify } from '@/lib/utils.js';

const PublicProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const [isFavorite, setIsFavorite] = useState(false);

  // Favoriler değiştikçe güncel tut
  useEffect(() => {
    const handleStorage = () => {
      const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFavorite(favs.some(f => f.id === product.id));
    };
    window.addEventListener('storage', handleStorage);
    handleStorage();
    return () => window.removeEventListener('storage', handleStorage);
  }, [product.id]);

  const toggleFavorite = (e) => {
    e.stopPropagation();
    let favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (favs.some(f => f.id === product.id)) {
      favs = favs.filter(f => f.id !== product.id);
      setIsFavorite(false);
      toast({ description: 'Favorilerden çıkarıldı', duration: 2000 });
    } else {
      favs.push(product);
      setIsFavorite(true);
      toast({ description: 'Favorilere eklendi', duration: 2000 });
    }
    localStorage.setItem('favorites', JSON.stringify(favs));
    window.dispatchEvent(new Event('storage'));
  };

  const formatPrice = (price) => {
    if (!price || parseFloat(price) === 0) return null;
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
  };

  // Fotoğraf URL'sini belirle
  const getImageUrl = () => {
    return product.imageUrl || product.imageUrl1 || product.imageUrl2 || '/placeholder-image.jpg';
  };

  const handleClick = () => {
    if (product.brand && product.name) {
      navigate(`/${slugify(product.brand)}/${slugify(product.name)}`);
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  return (
    <motion.div 
        className="h-full cursor-pointer group"
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        onClick={handleClick}
    >
        <Card className="relative overflow-hidden transition-all duration-300 border-none shadow-soft hover:shadow-glow bg-card h-full flex flex-col rounded-2xl">
        
        {/* Favori Butonu (Absolute, Ustte) */}
        <button
            className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-background/80 backdrop-blur-md shadow-sm border border-border hover:bg-background transition-all"
            title="Favorilere ekle"
            onClick={toggleFavorite}
        >
            <Heart 
              className="w-5 h-5 transition-colors" 
              fill={isFavorite ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              strokeWidth={1.5}
              color={isFavorite ? '#ef4444' : 'currentColor'}
            />
        </button>

        <div className="relative aspect-[4/3] w-full bg-white dark:bg-white/5 overflow-hidden flex items-center justify-center p-4">
            <motion.img
              src={getImageUrl()}
              alt={`${product.brand} ${product.name} ${product.model ? product.model : ''} yedek parça`}
              className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
              loading="lazy"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.4 }}
            />
        </div>
        
        <CardContent className="p-5 flex flex-col justify-between flex-grow bg-card">
            <div className="mb-4">
                <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold tracking-wider rounded-md mb-2 uppercase">
                    {product.brand}
                </span>
                <p className="font-semibold text-foreground text-sm leading-snug line-clamp-2 h-[40px] group-hover:text-primary transition-colors">
                    {product.name}
                </p>
            </div>
            
            <div className="flex flex-col gap-3 mt-auto">
                {(!product.price || parseFloat(product.price) === 0) ? (
                  <span className="self-start text-yellow-600 dark:text-yellow-500 text-[11px] uppercase tracking-wide font-extrabold bg-yellow-50 dark:bg-yellow-900/30 px-2.5 py-1 rounded-md border border-yellow-200 dark:border-yellow-700/50">
                    FİYAT SORUNUZ
                  </span>
                ) : (
                  <p className="text-xl font-extrabold text-foreground tracking-tight">
                      {formatPrice(product.price)}
                  </p>
                )}
                
                {/* Sepete Ekle Butonu - Hover'da beliren şık tasarım */}
                <button
                    onClick={e => { 
                      e.stopPropagation(); 
                      addToCart({ ...product, quantity: 1, image: getImageUrl() }); 
                      toast({ description: 'Ürün sepete eklendi', duration: 2000 });
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
                >
                    <ShoppingCart className="w-4 h-4" />
                    Sepete Ekle
                </button>
            </div>
        </CardContent>
        </Card>
    </motion.div>
  );
};

export default PublicProductCard;