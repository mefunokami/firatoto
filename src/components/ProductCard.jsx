import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Tag, Hash } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductCard = ({ product, onEdit, onDelete }) => {
  const formatPrice = (price) => {
    if (!price || parseFloat(price) === 0) return 'Fiyatı Sorunuz.';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
      className="h-full"
    >
      <Card className="bg-card h-full flex flex-col border shadow-sm transition-all duration-300">
        <CardHeader>
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-base font-bold text-foreground line-clamp-2">{product.name}</CardTitle>
            <div className="flex flex-shrink-0">
              <Button size="icon" variant="ghost" onClick={() => onEdit(product)} className="h-8 w-8 text-muted-foreground hover:bg-secondary"><Edit className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => onDelete(product.id)} className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
          <div className="text-sm font-semibold text-primary">{product.brand}</div>
        </CardHeader>
        
        {product.imageUrl && (
          <div className="aspect-video w-full bg-secondary overflow-hidden">
            <img
              src={product.imageUrl}
              alt={`${product.brand} ${product.name} ${product.model ? product.model : ''} yedek parça`}
              className="w-full h-48 object-contain mb-2 bg-white rounded shadow"
              width="400"
              height="300"
              loading="lazy"
            />
          </div>
        )}
        
        <CardContent className="space-y-3 pt-4 flex-grow">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-foreground">{formatPrice(product.price)}</span>
            <span className={`text-sm font-bold px-2 py-1 rounded-full ${product.stock > 10 ? 'bg-green-100 text-green-800' : product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
              {product.stock || 0} Adet
            </span>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-2">
            {product.model && <div><strong>Model:</strong> {product.model} {product.year && `(${product.year})`}</div>}
            {product.category && <div className="flex items-center gap-2"><Tag className="h-4 w-4" />{product.category}</div>}
            {product.partNumber && <div className="flex items-center gap-2"><Hash className="h-4 w-4" />{product.partNumber}</div>}
          </div>
        </CardContent>

        <div className="p-4 pt-0 text-xs text-muted-foreground border-t mt-auto">
          <div className="flex items-center justify-between">
            <span>Ekleme Tarihi</span>
            <span>{formatDate(product.createdAt)}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ProductCard;