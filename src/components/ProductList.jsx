import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { Search, ListFilter, SortAsc, SortDesc } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductList = ({ products, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterCategory, setFilterCategory] = useState('');
  const [showWeeklyDealOnly, setShowWeeklyDealOnly] = useState(false);

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredAndSortedProducts = products
    .filter(product => {
      const searchPool = `${product.name} ${product.brand} ${product.model || ''} ${product.partNumber || ''}`.toLowerCase();
      const isWeekly = showWeeklyDealOnly ? (product.is_weekly_deal == 1 || product.is_weekly_deal === "1") : true;
      return searchPool.includes(searchTerm.toLowerCase()) && (!filterCategory || product.category === filterCategory) && isWeekly;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      if (sortBy === 'createdAt') {
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const SortIndicator = ({ field }) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <SortAsc className="ml-2 h-4 w-4" /> : <SortDesc className="ml-2 h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <motion.div 
        className="bg-card p-4 rounded-lg border shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-6 items-center">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Ürün adı, marka, model veya parça no ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 text-base"
              />
            </div>
            <div className="relative w-full md:w-56">
              <ListFilter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full h-11 pl-10 pr-4 text-base rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
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
          </div>
          <div className="flex gap-3 min-w-max">
            <Button variant="outline" size="lg" onClick={() => toggleSort('price')} className="flex items-center justify-center px-6 py-2 text-base font-semibold">
              Fiyat <SortIndicator field="price" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => toggleSort('name')} className="flex items-center justify-center px-6 py-2 text-base font-semibold">
              Ad <SortIndicator field="name" />
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAndSortedProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <ProductCard product={product} onEdit={onEdit} onDelete={onDelete} />
          </motion.div>
        ))}
      </div>

      {filteredAndSortedProducts.length === 0 && (
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
    </div>
  );
};

export default ProductList;