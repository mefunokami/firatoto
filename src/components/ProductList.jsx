import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import MediaLibrary from '@/components/MediaLibrary';
import ProductCard from '@/components/ProductCard';
import { Search, ListFilter, SortAsc, SortDesc, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, ImageOff, Zap, Check, X, Wrench, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

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
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Media selector state
  const [mediaSelectorOpen, setMediaSelectorOpen] = useState(false);
  const [activeMediaTarget, setActiveMediaTarget] = useState(null);

  const [sortBy, setSortBy]               = useState('createdAt');
  const [localCategory, setLocalCategory] = useState(filterCategory || '');
  const [showWeeklyDealOnly, setShowWeeklyDealOnly] = useState(false);
  const [isQuickEdit, setIsQuickEdit]     = useState(false);
  const [editingRows, setEditingRows]     = useState({}); // { id: { price, stock, saving } }
  const [fetchedCategories, setFetchedCategories] = useState([]);
  const searchDebounce = useRef(null);

  const SABIT_MARKALAR = [
    "OPEL", "CHEVROLET", "BMW", "MERCEDES-BENZ", "VOLKSWAGEN", "AUDİ", "SEAT", "SKODA", "PEUGEOT", "CİTROEN", "FORD"
  ];

  useEffect(() => {
    if (isQuickEdit && fetchedCategories.length === 0) {
      fetch('/api/categories.php')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setFetchedCategories(data);
        })
        .catch(() => {});
    }
  }, [isQuickEdit]);

  const ModelDropdown = ({ brand, defaultValue, onBlur }) => {
    const [options, setOptions] = useState([]);
    useEffect(() => {
      if (brand) {
        fetch(`/api/brand_models.php?brand=${encodeURIComponent(brand)}`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) setOptions(data);
          })
          .catch(() => setOptions([]));
      } else {
        setOptions([]);
      }
    }, [brand]);
    return (
      <select
        defaultValue={defaultValue}
        className="h-8 text-xs bg-yellow-50 border-yellow-300 border rounded px-1 min-w-[100px] max-w-full focus-visible:ring-yellow-400"
        onBlur={onBlur}
      >
        <option value="">Seçiniz</option>
        {options.map((o, i) => <option key={i} value={o.model}>{o.model}</option>)}
        {/* If the current model is not in the list, still show it as an option so it's not lost */}
        {defaultValue && !options.find(o => o.model === defaultValue) && (
          <option value={defaultValue}>{defaultValue}</option>
        )}
      </select>
    );
  };

  const handleQuickSave = async (product, field, value) => {
    // API request for quick save
    try {
      const updatedProduct = { ...product, [field]: value };
      const res = await fetch(`/api/products.php?id=${product.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: 'Başarılı', description: 'Değişiklik kaydedildi.', variant: 'default' });
      } else {
        toast({ title: 'Hata', description: data.error || 'Kaydedilemedi.', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Hata', description: 'Sunucu hatası.', variant: 'destructive' });
    }
  };

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

          {/* Sıralama ve Hızlı Düzenleme */}
          <div className="flex gap-3 min-w-max items-center">
            <Button 
              variant={isQuickEdit ? "default" : "outline"} 
              size="lg" 
              onClick={() => setIsQuickEdit(!isQuickEdit)} 
              className={`flex items-center justify-center px-4 py-2 text-sm font-semibold transition-all ${isQuickEdit ? 'bg-yellow-400 hover:bg-yellow-500 text-neutral-900 border-yellow-400' : ''}`}
            >
              <Zap className={`w-4 h-4 mr-2 ${isQuickEdit ? 'fill-neutral-900' : ''}`} /> 
              {isQuickEdit ? 'Hızlı Düzenleme Açık' : 'Hızlı Düzenleme'}
            </Button>
            <div className="w-px h-8 bg-gray-200 mx-1"></div>
            <Button variant="outline" size="lg" onClick={() => toggleSort('price')} className="flex items-center justify-center px-4 py-2 text-sm font-semibold">
              Fiyat <SortIndicator field="price" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => toggleSort('name')} className="flex items-center justify-center px-4 py-2 text-sm font-semibold">
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

      {/* Ürün Listesi - Veri Tablosu */}
      {!loading && (
        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-border overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-background text-gray-600 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-border">
                {isQuickEdit ? (
                  <tr>
                    <th className="px-4 py-3 border-r border-gray-100 dark:border-border min-w-[200px]">Ürün Adı</th>
                    <th className="px-4 py-3 border-r border-gray-100 dark:border-border min-w-[150px]">Kategori</th>
                    <th className="px-4 py-3 border-r border-gray-100 dark:border-border min-w-[120px]">Marka</th>
                    <th className="px-4 py-3 border-r border-gray-100 dark:border-border min-w-[120px]">Model</th>
                    <th className="px-4 py-3 border-r border-gray-100 dark:border-border min-w-[100px]">Yıl</th>
                    <th className="px-4 py-3 border-r border-gray-100 dark:border-border min-w-[150px]">Parça No</th>
                    <th className="px-4 py-3 border-r border-gray-100 dark:border-border min-w-[250px]">Açıklama</th>
                    <th className="px-4 py-3 border-r border-gray-100 dark:border-border min-w-[120px]">Fiyat</th>
                    <th className="px-4 py-3 border-r border-gray-100 dark:border-border min-w-[100px]">Stok</th>
                    <th className="px-4 py-3 border-r border-gray-100 dark:border-border min-w-[200px]">Ana Görsel URL</th>
                    <th className="px-4 py-3 border-r border-gray-100 dark:border-border min-w-[200px]">Görsel 2 URL</th>
                    <th className="px-4 py-3 border-r border-gray-100 dark:border-border min-w-[200px]">Görsel 3 URL</th>
                    <th className="px-4 py-3 border-r border-gray-100 dark:border-border min-w-[200px]">Trendyol URL</th>
                    <th className="px-4 py-3 border-r border-gray-100 dark:border-border min-w-[100px] text-center">Fırsat</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-4 py-3 w-16 text-center border-r border-gray-100 dark:border-border">Görsel</th>
                    <th className="px-4 py-3 border-r border-gray-100 dark:border-border">Ürün Adı</th>
                    <th className="px-4 py-3 border-r border-gray-100 dark:border-border">Marka / Model</th>
                    <th className="px-4 py-3 border-r border-gray-100 dark:border-border">Parça No</th>
                    <th className="px-4 py-3 text-right border-r border-gray-100 dark:border-border">Fiyat</th>
                    <th className="px-4 py-3 text-center border-r border-gray-100 dark:border-border">Stok</th>
                    <th className="px-4 py-3 text-right">İşlemler</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/80 transition-colors group">
                    {isQuickEdit ? (
                      <>
                        <td className="px-2 py-2 border-r border-gray-100 dark:border-border">
                          <Input type="text" defaultValue={product.name} className="h-8 text-xs bg-yellow-50 border-yellow-300 focus-visible:ring-yellow-400" onBlur={(e) => { if (e.target.value !== String(product.name)) handleQuickSave(product, 'name', e.target.value); }} />
                        </td>
                        <td className="px-2 py-2 border-r border-gray-100 dark:border-border">
                          <select 
                            defaultValue={product.category} 
                            className="h-8 text-xs bg-yellow-50 border-yellow-300 border rounded px-1 min-w-[120px] max-w-full focus-visible:ring-yellow-400" 
                            onBlur={(e) => { if (e.target.value !== String(product.category)) handleQuickSave(product, 'category', e.target.value); }}
                          >
                            <option value="">Seçiniz</option>
                            {fetchedCategories.map((c, i) => (
                              <option key={i} value={c.name}>{c.name}</option>
                            ))}
                            {product.category && !fetchedCategories.find(c => c.name === product.category) && (
                              <option value={product.category}>{product.category}</option>
                            )}
                          </select>
                        </td>
                        <td className="px-2 py-2 border-r border-gray-100 dark:border-border">
                          <select 
                            defaultValue={product.brand} 
                            className="h-8 text-xs bg-yellow-50 border-yellow-300 border rounded px-1 min-w-[120px] max-w-full focus-visible:ring-yellow-400" 
                            onBlur={(e) => { if (e.target.value !== String(product.brand)) handleQuickSave(product, 'brand', e.target.value); }}
                          >
                            <option value="">Seçiniz</option>
                            {SABIT_MARKALAR.map((b, i) => (
                              <option key={i} value={b}>{b}</option>
                            ))}
                            {product.brand && !SABIT_MARKALAR.includes(product.brand) && (
                              <option value={product.brand}>{product.brand}</option>
                            )}
                          </select>
                        </td>
                        <td className="px-2 py-2 border-r border-gray-100 dark:border-border">
                          <ModelDropdown 
                            brand={product.brand} 
                            defaultValue={product.model} 
                            onBlur={(e) => { if (e.target.value !== String(product.model)) handleQuickSave(product, 'model', e.target.value); }} 
                          />
                        </td>
                        <td className="px-2 py-2 border-r border-gray-100 dark:border-border">
                          <Input type="text" defaultValue={product.year} className="h-8 text-xs bg-yellow-50 border-yellow-300 focus-visible:ring-yellow-400" onBlur={(e) => { if (e.target.value !== String(product.year)) handleQuickSave(product, 'year', e.target.value); }} />
                        </td>
                        <td className="px-2 py-2 border-r border-gray-100 dark:border-border">
                          <Input type="text" defaultValue={product.partNumber} className="h-8 text-xs bg-yellow-50 border-yellow-300 focus-visible:ring-yellow-400" onBlur={(e) => { if (e.target.value !== String(product.partNumber)) handleQuickSave(product, 'partNumber', e.target.value); }} />
                        </td>
                        <td className="px-2 py-2 border-r border-gray-100 dark:border-border">
                          <textarea 
                            defaultValue={product.description} 
                            className="w-full min-h-[32px] max-h-[100px] text-xs bg-yellow-50 border border-yellow-300 rounded p-1 resize-y focus:outline-none focus:ring-1 focus:ring-yellow-400" 
                            onBlur={(e) => { if (e.target.value !== String(product.description || '')) handleQuickSave(product, 'description', e.target.value); }} 
                          />
                        </td>
                        <td className="px-2 py-2 border-r border-gray-100 dark:border-border">
                          <div className="flex items-center justify-end">
                            <Input type="number" defaultValue={product.price} className="w-20 h-8 text-right font-bold text-xs bg-yellow-50 border-yellow-300 focus-visible:ring-yellow-400" onBlur={(e) => { if (e.target.value !== String(product.price)) handleQuickSave(product, 'price', e.target.value); }} />
                            <span className="ml-1 text-gray-500 dark:text-gray-400 text-xs">₺</span>
                          </div>
                        </td>
                        <td className="px-2 py-2 border-r border-gray-100 dark:border-border">
                          <div className="flex justify-center">
                            <Input type="number" defaultValue={product.stock} className="w-16 h-8 text-center font-bold text-xs bg-yellow-50 border-yellow-300 focus-visible:ring-yellow-400" onBlur={(e) => { if (e.target.value !== String(product.stock)) handleQuickSave(product, 'stock', e.target.value); }} />
                          </div>
                        </td>
                        <td className="px-2 py-2 border-r border-gray-100 dark:border-border">
                          <div className="flex gap-1">
                            <Input type="text" defaultValue={product.imageUrl} className="h-8 text-xs bg-yellow-50 border-yellow-300 focus-visible:ring-yellow-400 flex-1" onBlur={(e) => { if (e.target.value !== String(product.imageUrl)) handleQuickSave(product, 'imageUrl', e.target.value); }} id={`img-${product.id}-imageUrl`} />
                            <Button type="button" variant="secondary" size="icon" className="h-8 w-8 shrink-0" onClick={() => { setActiveMediaTarget({ product, field: 'imageUrl' }); setMediaSelectorOpen(true); }}><ImageIcon className="w-3.5 h-3.5" /></Button>
                          </div>
                        </td>
                        <td className="px-2 py-2 border-r border-gray-100 dark:border-border">
                          <div className="flex gap-1">
                            <Input type="text" defaultValue={product.imageUrl1} className="h-8 text-xs bg-yellow-50 border-yellow-300 focus-visible:ring-yellow-400 flex-1" onBlur={(e) => { if (e.target.value !== String(product.imageUrl1)) handleQuickSave(product, 'imageUrl1', e.target.value); }} id={`img-${product.id}-imageUrl1`} />
                            <Button type="button" variant="secondary" size="icon" className="h-8 w-8 shrink-0" onClick={() => { setActiveMediaTarget({ product, field: 'imageUrl1' }); setMediaSelectorOpen(true); }}><ImageIcon className="w-3.5 h-3.5" /></Button>
                          </div>
                        </td>
                        <td className="px-2 py-2 border-r border-gray-100 dark:border-border">
                          <div className="flex gap-1">
                            <Input type="text" defaultValue={product.imageUrl2} className="h-8 text-xs bg-yellow-50 border-yellow-300 focus-visible:ring-yellow-400 flex-1" onBlur={(e) => { if (e.target.value !== String(product.imageUrl2)) handleQuickSave(product, 'imageUrl2', e.target.value); }} id={`img-${product.id}-imageUrl2`} />
                            <Button type="button" variant="secondary" size="icon" className="h-8 w-8 shrink-0" onClick={() => { setActiveMediaTarget({ product, field: 'imageUrl2' }); setMediaSelectorOpen(true); }}><ImageIcon className="w-3.5 h-3.5" /></Button>
                          </div>
                        </td>
                        <td className="px-2 py-2 border-r border-gray-100 dark:border-border">
                          <Input type="text" defaultValue={product.trendyolUrl} className="h-8 text-xs bg-yellow-50 border-yellow-300 focus-visible:ring-yellow-400" onBlur={(e) => { if (e.target.value !== String(product.trendyolUrl)) handleQuickSave(product, 'trendyolUrl', e.target.value); }} />
                        </td>
                        <td className="px-2 py-2 border-r border-gray-100 dark:border-border text-center">
                          <input type="checkbox" defaultChecked={product.is_weekly_deal == 1} className="w-5 h-5 accent-yellow-500 cursor-pointer" onChange={(e) => handleQuickSave(product, 'is_weekly_deal', e.target.checked ? 1 : 0)} />
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-2 text-center border-r border-gray-100 dark:border-border">
                          <div className="w-12 h-12 rounded border border-gray-100 dark:border-border overflow-hidden flex items-center justify-center bg-white dark:bg-card mx-auto">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" loading="lazy" />
                            ) : (
                              <ImageOff className="w-5 h-5 text-gray-300" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2 border-r border-gray-100 dark:border-border">
                          <div className="font-bold text-gray-900 dark:text-foreground max-w-[300px] truncate" title={product.name}>
                            {product.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="text-[11px] text-gray-400 uppercase tracking-wider">{product.category}</div>
                            {product.seoTitle && product.seoDescription ? (
                              <span className="inline-flex items-center gap-1 rounded bg-green-50 px-1.5 py-0.5 text-[9px] font-medium text-green-700 ring-1 ring-inset ring-green-600/20" title="SEO Optimize Edildi">
                                <Check className="w-2.5 h-2.5" /> SEO
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded bg-gray-50 dark:bg-background px-1.5 py-0.5 text-[9px] font-medium text-gray-500 dark:text-gray-400 ring-1 ring-inset ring-gray-500/20" title="SEO Eksik">
                                SEO Yok
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2 border-r border-gray-100 dark:border-border">
                          <div className="font-semibold text-gray-700 dark:text-gray-300">{product.brand || '-'}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{product.model || '-'}</div>
                        </td>
                        <td className="px-4 py-2 font-mono text-gray-600 dark:text-gray-400 text-xs border-r border-gray-100 dark:border-border">
                          {product.partNumber || '-'}
                        </td>
                        <td className="px-4 py-2 text-right font-bold text-gray-900 dark:text-foreground border-r border-gray-100 dark:border-border">
                          {Number(product.price) > 0 ? (
                            `${Number(product.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`
                          ) : (
                            <span className="text-yellow-600 text-[10px] uppercase tracking-wide font-extrabold bg-yellow-50 px-2 py-1 rounded">Fiyat Sorunuz</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-center border-r border-gray-100 dark:border-border">
                          {Number(product.stock) > 5 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                              {product.stock} Adet
                            </span>
                          ) : Number(product.stock) > 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
                              {product.stock} Adet
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                              0 Adet
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-right align-middle">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" onClick={() => onEdit(product)} className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                              <Wrench className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => onDelete(product.id)} className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
      
      <Dialog open={mediaSelectorOpen} onOpenChange={setMediaSelectorOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden">
          <MediaLibrary 
            isModal={true} 
            onClose={() => setMediaSelectorOpen(false)}
            onSelect={(url) => {
              if (activeMediaTarget) {
                // Update the input visually
                const inputEl = document.getElementById(`img-${activeMediaTarget.product.id}-${activeMediaTarget.field}`);
                if (inputEl) inputEl.value = url;
                // Trigger save
                handleQuickSave(activeMediaTarget.product, activeMediaTarget.field, url);
              }
              setMediaSelectorOpen(false);
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductList;