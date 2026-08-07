import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShoppingCart, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const ProductDetailModal = ({ product, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  if (!product) return null;

  const formatPrice = (price) => {
    if (!price || parseFloat(price) === 0) return null;
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
  };

  // Mevcut fotoğrafları topla
  const images = [
    product.imageUrl,
    product.imageUrl1,
    product.imageUrl2
  ].filter(img => img && img.trim() !== ''); // Boş olmayan fotoğrafları filtrele

  const whatsappMessage = encodeURIComponent(`Merhaba, "${product.name}" isimli ürün hakkında bilgi almak istiyorum. (Parça No: ${product.partNumber || 'N/A'})`);
  const whatsappUrl = `https://wa.me/905439740121?text=${whatsappMessage}`;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full sm:max-w-[600px] p-2 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-2xl">{product.name}</DialogTitle>
          <DialogDescription className="text-xs sm:text-base">{product.brand} - {product.model} ({product.year})</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-6 py-2 sm:py-4">
          <div className="relative">
            {images.length > 0 ? (
              <>
                <img 
                  src={images[currentImageIndex] || 'https://via.placeholder.com/300'} 
                  alt={`${product.name} - Fotoğraf ${currentImageIndex + 1}`} 
                  className="w-full max-w-[250px] sm:max-w-full h-auto object-cover rounded-lg mx-auto"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {images.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full ${
                            index === currentImageIndex ? 'bg-card' : 'bg-card bg-opacity-50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <img 
                src="https://via.placeholder.com/300" 
                alt="Fotoğraf yok" 
                className="w-full max-w-[250px] sm:max-w-full h-auto object-cover rounded-lg mx-auto"
              />
            )}
          </div>
          <div className="flex flex-col">
            <p className="text-muted-foreground text-xs sm:text-sm">{product.description}</p>
            <div className="mt-2 sm:mt-4 space-y-1 sm:space-y-2">
              {product.brand && (
                <p className="text-xs sm:text-base"><strong>Ürün Markası:</strong> {product.brand}</p>
              )}
              <p className="text-xs sm:text-base"><strong>Parça Numarası:</strong> {product.partNumber || 'Belirtilmemiş'}</p>
              <p className="text-xs sm:text-base"><strong>Kategori:</strong> {product.category || 'Belirtilmemiş'}</p>
              <p className="text-xs sm:text-base"><strong>Stok:</strong> {product.stock > 0 ? `${product.stock} Adet` : 'Stokta Yok'}</p>
            </div>
            <div className="mt-auto pt-2 sm:pt-4">
              {(!product.price || parseFloat(product.price) === 0) ? (
                <div className="text-right mb-2 sm:mb-4">
                  <span className="inline-block text-yellow-600 text-sm uppercase tracking-wide font-extrabold bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-200">
                    Fiyat Sorunuz
                  </span>
                </div>
              ) : (
                <p className="text-2xl sm:text-3xl font-bold text-right mb-2 sm:mb-4">{formatPrice(product.price)}</p>
              )}
              <div className="space-y-2 sm:space-y-3">
                {product.trendyolUrl && (
                  <Button asChild size="lg" className="w-full font-bold bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-base">
                    <a href={product.trendyolUrl} target="_blank" rel="noopener noreferrer">
                      <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Trendyol'dan Satın Al
                    </a>
                  </Button>
                )}
                <Button asChild size="lg" className="w-full font-bold bg-green-500 hover:bg-green-600 text-white text-xs sm:text-base">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Whatsapp'tan İletişime Geç
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;