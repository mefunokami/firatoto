import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { CartContext } from '@/lib/CartContext.jsx';
import { Heart } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

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
    if (!price || parseFloat(price) === 0) return 'Fiyatı Sorunuz.';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
  };

  // Fotoğraf URL'sini belirle (öncelik sırası: imageUrl, imageUrl1, imageUrl2)
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
    <motion.div 
        className="h-full cursor-pointer"
        whileHover={{ y: -5 }}
        onClick={handleClick}
    >
        <Card className="overflow-hidden group transition-all duration-300 hover:shadow-xl border h-full flex flex-col">
        <div className="aspect-square bg-secondary overflow-hidden">
            <img
              src={getImageUrl()}
              alt={`${product.brand} ${product.name} ${product.model ? product.model : ''} yedek parça`}
              className="w-full h-48 object-contain mb-2 bg-white rounded shadow"
              loading="lazy"
            />
        </div>
        <CardContent className="p-4 flex flex-col justify-between flex-grow">
            <div>
                <p className="text-xs text-muted-foreground">{product.brand}</p>
                <p className="font-semibold text-foreground line-clamp-2 mb-2 h-[40px]">{product.name}</p>
            </div>
            <div>
                <p className="text-2xl font-bold text-foreground mb-4">{formatPrice(product.price)}</p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={e => { 
                      e.stopPropagation(); 
                      addToCart({ ...product, quantity: 1, image: getImageUrl() }); 
                      toast({ description: 'Ürün sepete eklendi', duration: 2000 });
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-4 py-2 rounded"
                  >
                    Sepete Ekle
                  </button>
                  <button
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded bg-white hover:bg-gray-50"
                    title="Favorilere ekle"
                    onClick={toggleFavorite}
                  >
                    <Heart 
                      className="w-6 h-6" 
                      fill={isFavorite ? '#facc15' : 'none'} 
                      stroke={isFavorite ? '#facc15' : '#6b7280'} 
                      strokeWidth={1.5}
                    />
                  </button>
                </div>
            </div>
        </CardContent>
        </Card>
    </motion.div>
  );
};

export default PublicProductCard;