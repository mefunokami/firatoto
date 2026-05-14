import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { Search, ListFilter, SortAsc, SortDesc, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, ImageOff } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductList = ({
  products,
  onEdit,
  onDelete,
  // Sayfalama & arama (AdminPage'den gelir)
  currentPage,
  totalPages,
  totalProducts,
  limit,
  loading,
  onPageChange,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  filterCategory,
  externalSearch,
  filterNoImage,
  onNoImageChange,
}) => {
  const [searchTerm, setSearchTerm]       = useState(externalSearch || '');
  const [sortBy, setSortBy]               = useState('createdAt');
  const [sortOrder, setSortOrder]         = useState('desc');
  const [localCategory, setLocalCategory] = useState(filterCategory || '');
  const [showWeeklyDealOnly, setShowWeeklyDealOnly] = useState(false);
  const searchDebounce = useRef(null);

  // Server-side modda çalışıyor muyuz?
  const isServerSide = typeof onPageChange === 'function';

  // Arama debounce
  const handleSearchInput = (val) => {
    setSearchTerm(val);
    if (isServerSide) {
      clearTimeout(searchDebounce.current);
      searchDebounce.current = setTimeout(() => {
        onSearchChange && onSearchChange(val);
      }, 400);
    }
  };

  const handleCategorySelect = (val) => {
    setLocalCategory(val);
    if (isServerSide) onCategoryChange && onCategoryChange(val);
  };

  const toggleSort = (field) => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortOrder(newOrder);
    if (isServerSide) onSortChange && onSortChange(field, newOrder);
  };

  const SortIndicator = ({ field }) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <SortAsc className="ml-1 h-4 w-4" /> : <SortDesc className="ml-1 h-4 w-4" />;
  };

  // Client-side filtreleme (server-side değilse)
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  const displayedProducts = isServerSide
    ? products // Server zaten filtreledi
    : products
        .filter(product => {
          const pool = `${product.name} ${product.brand} ${product.model || ''} ${product.partNumber || ''}`.toLowerCase();
          const weekly = showWeeklyDealOnly ? (product.is_weekly_deal == 1 || product.is_weekly_deal === '1') : true;
          return pool.includes(searchTerm.toLowerCase())
            && (!localCategory || product.category === localCategory)
            && weekly;
        })
        .sort((a, b) => {
          let av = a[sortBy], bv = b[sortBy];
          if (sortBy === 'createdAt') { av = new Date(a.createdAt); bv = new Date(b.createdAt); }
          else if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase(); }
          return sortOrder === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
        });

  // Sayfa numarası üretici
  const pageNumbers = () => {
    if (!totalPages || totalPages <= 1) return [];
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }
    if (currentPage - delta > 2) range.unshift('...');
    if (currentPage + delta < totalPages - 1) range.push('...');
    range.unshift(1);
    if (totalPages > 1) range.push(totalPages);
    return range;
  };

  return (
    <div className="space-y-6">
      {/* Arama & Filtre Çubuğu */}
      <motion.div
        className="bg-card p-4 rounded-lg border shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-6 items-center">
            {/* Arama */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Ürün adı, marka, model veya parça no ara..."
                value={searchTerm}
                onChange={e => handleSearchInput(e.target.value)}
                className="pl-10 h-11 text-base"
              />
              {isServerSide && loading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            {/* Kategori filtresi */}
            <div className="relative w-full md:w-56">
              <ListFilter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <select
                value={localCategory}
                onChange={e => handleCategorySelect(e.target.value)}
                className="w-full h-11 pl-10 pr-4 text-base rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Tüm Kategoriler</option>
                {(isServerSide ? [] : categories).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Haftanın fırsatı (sadece client-side modda) */}
            {!isServerSide && (
              <div className="flex items-center gap-2 min-w-max">
                <input
                  type="checkbox"
                  id="weeklyDealOnly"
                  checked={showWeeklyDealOnly}
                  onChange={e => setShowWeeklyDealOnly(e.target.checked)}
                  className="accent-yellow-500 w-5 h-5"
                />
                <label htmlFor="weeklyDealOnly" className="text-yellow-700 font-medium select-none cursor-pointer text-sm">
                  Haftanın Fırsatları
                </label>
              </div>
            )}

            {/* Fotoğrafsız Ürünler filtresi (server-side modda) */}
            {isServerSide && typeof onNoImageChange === 'function' && (
              <div className="flex items-center gap-2 min-w-max">
                <input
                  type="checkbox"
                  id="noImageFilter"
                  checked={filterNoImage || false}
                  onChange={e => onNoImageChange(e.target.checked)}
                  className="accent-red-500 w-5 h-5"
                />
                <label htmlFor="noImageFilter" className="text-red-600 font-medium select-none cursor-pointer text-sm flex items-center gap-1">
                  <ImageOff className="h-4 w-4" />
                  Fotoğrafsız Ürünler
                </label>
              </div>
            )}
          </div>

          {/* Sıralama */}
          <div className="flex gap-3 min-w-max">
            <Button variant="outline" size="lg" onClick={() => toggleSort('price')} className="flex items-center justify-center px-6 py-2 text-base font-semibold">
              Fiyat <SortIndicator field="price" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => toggleSort('name')} className="flex items-center justify-center px-6 py-2 text-base font-semibold">
              Ad <SortIndicator field="name" />
            </Button>
          </div>
        </div>

        {/* Toplam ürün bilgisi (server-side modda) */}
        {isServerSide && (
          <div className="mt-3 text-sm text-muted-foreground">
            Toplam <span className="font-bold text-foreground">{totalProducts?.toLocaleString('tr-TR')}</span> ürün
            {searchTerm && <> — "<span className="font-medium">{searchTerm}</span>" araması</>}
            {' · '}Sayfa <span className="font-bold text-foreground">{currentPage}</span> / {totalPages}
          </div>
        )}
      </motion.div>

      {/* Yükleniyor Overlay */}
      {isServerSide && loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
          <span className="text-muted-foreground text-lg">Ürünler yükleniyor...</span>
        </div>
      )}

      {/* Ürün Listesi */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.5) }}
            >
              <ProductCard product={product} onEdit={onEdit} onDelete={onDelete} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Boş Durum */}
      {!loading && displayedProducts.length === 0 && (
        <motion.div
          className="text-center py-16 bg-card rounded-lg border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Search className="mx-auto h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold text-foreground">Ürün Bulunamadı</h3>
          <p className="mt-2 text-muted-foreground">Arama kriterlerinizi değiştirerek tekrar deneyin.</p>
        </motion.div>
      )}

      {/* Sayfalama Kontrolleri */}
      {isServerSide && totalPages > 1 && !loading && (
        <motion.div
          className="flex items-center justify-center gap-1 py-4 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* İlk sayfa */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            title="İlk Sayfa"
            className="w-9 h-9 p-0"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Önceki sayfa */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            title="Önceki Sayfa"
            className="w-9 h-9 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Sayfa numaraları */}
          {pageNumbers().map((num, idx) =>
            num === '...' ? (
              <span key={`dots-${idx}`} className="px-2 text-muted-foreground">…</span>
            ) : (
              <Button
                key={num}
                variant={num === currentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(num)}
                className={`w-9 h-9 p-0 font-semibold ${num === currentPage ? 'bg-yellow-400 text-black hover:bg-yellow-500 border-yellow-400' : ''}`}
              >
                {num}
              </Button>
            )
          )}

          {/* Sonraki sayfa */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            title="Sonraki Sayfa"
            className="w-9 h-9 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Son sayfa */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            title="Son Sayfa"
            className="w-9 h-9 p-0"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>

          {/* Sayfa atlama input'u */}
          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm text-muted-foreground">Git:</span>
            <Input
              type="number"
              min={1}
              max={totalPages}
              className="w-16 h-9 text-center text-sm"
              placeholder={String(currentPage)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const v = parseInt(e.target.value);
                  if (v >= 1 && v <= totalPages) {
                    onPageChange(v);
                    e.target.value = '';
                  }
                }
              }}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProductList;