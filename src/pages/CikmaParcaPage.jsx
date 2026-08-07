import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '@/lib/CartContext.jsx';
import { toast } from '@/components/ui/use-toast';
import { Heart, Package, Search } from 'lucide-react';
import { Helmet } from 'react-helmet';

export default function CikmaParcaPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('default');
  
  const itemsPerPage = 20;

  useEffect(() => {
    fetch('/api/products.php')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Filtreleme: İçinde "çıkma" geçen veya product_condition = 'Çıkma' olan ürünleri al
          const filtered = data.filter(product => {
            if (product.product_condition === 'Çıkma') return true;
            const searchPool = `${product.name} ${product.brand} ${product.model || ''} ${product.partNumber || ''} ${product.description || ''} ${product.category || ''}`.toLowerCase();
            return searchPool.includes('çıkma') || searchPool.includes('cikma');
          });
          setProducts(filtered);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Çıkma parçalar yüklenemedi:', err);
        setLoading(false);
      });
  }, []);

  // Sıralama
  const sortedProducts = React.useMemo(() => {
    let sorted = [...products];
    if (sortOption === 'price-asc') sorted.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sortOption === 'price-desc') sorted.sort((a, b) => Number(b.price) - Number(a.price));
    else if (sortOption === 'newest') sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sorted;
  }, [products, sortOption]);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const currentProducts = sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatPrice = (price) => {
    const num = Number(price);
    if (isNaN(num) || num === 0) return null;
    return num.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' TL';
  };

  const getProductSlug = (p) => p.slug_name || p.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  const getBrandSlug = (p) => p.slug_brand || p.brand?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'marka';

  return (
    <>
      <Helmet>
        <title>Orijinal Çıkma Yedek Parçalar | Fırat Oto Yedek Parça</title>
      </Helmet>

      <div className="bg-gray-50 dark:bg-background min-h-screen">
        {/* Banner */}
        <div className="bg-[#18181b] py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10"></div>
          <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#374151 1px, transparent 1px), linear-gradient(90deg, #374151 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20 text-center">
            <Package className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Orijinal <span className="text-yellow-500">Çıkma</span> Parçalar</h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Sıfır parça kalitesinde, garantili ve uzman kontrolünden geçmiş orijinal çıkma yedek parçalarla aracınızın orijinalliğini ve bütçenizi koruyun.</p>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="text-gray-600 dark:text-gray-400 font-medium">Toplam <span className="text-gray-900 dark:text-foreground font-bold">{products.length}</span> ilan bulundu.</div>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="default">Varsayılan Sıralama</option>
              <option value="price-asc">En Düşük Fiyat</option>
              <option value="price-desc">En Yüksek Fiyat</option>
              <option value="newest">En Yeniler</option>
            </select>
          </div>

          {loading ? (
             <div className="flex justify-center items-center py-32">
                <div className="w-12 h-12 border-4 border-yellow-200 border-t-[#ffc107] rounded-full animate-spin"></div>
             </div>
          ) : currentProducts.length === 0 ? (
            <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-gray-100 dark:border-border p-16 text-center">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-foreground mb-2">Çıkma Parça Bulunamadı</h3>
              <p className="text-gray-500 dark:text-gray-400">Şu anda sistemde listelenen çıkma yedek parça bulunmuyor.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {currentProducts.map(product => (
                <div key={product.id} className="bg-white dark:bg-card border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group h-full">
                  <div className="relative aspect-square p-4 flex items-center justify-center bg-white dark:bg-card cursor-pointer" onClick={() => navigate(`/${getBrandSlug(product)}/${getProductSlug(product)}`)}>
                    <img
                      src={product.imageUrl || '/placeholder.png'}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    <div className="absolute top-2 right-2 bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                      ÇIKMA
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col border-t border-gray-100 dark:border-border">
                    <div className="text-xs text-gray-400 font-bold mb-1 truncate">{product.brand} • {product.model}</div>
                    <Link to={`/${getBrandSlug(product)}/${getProductSlug(product)}`} className="text-sm font-bold text-gray-800 dark:text-gray-200 line-clamp-2 hover:text-yellow-600 transition-colors mb-4 flex-1" title={product.name}>
                      {product.name}
                    </Link>
                    <div className="flex items-end justify-between mt-auto">
                      <div className="font-extrabold text-lg text-gray-900 dark:text-foreground">
                        {(!product.price || parseFloat(product.price) === 0) ? (
                          <span className="text-yellow-600 text-[11px] uppercase tracking-wide font-extrabold bg-yellow-50 px-2.5 py-1 rounded-md border border-yellow-200">
                            FİYAT SORUNUZ
                          </span>
                        ) : (
                          formatPrice(product.price)
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="w-10 h-10 rounded-full border border-gray-200 dark:border-border flex items-center justify-center text-gray-400 hover:text-yellow-500 hover:border-yellow-500 transition-colors bg-white dark:bg-card shadow-sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            let favs = JSON.parse(localStorage.getItem('favorites') || '[]');
                            if (favs.some(f => f.id === product.id)) {
                              favs = favs.filter(f => f.id !== product.id);
                              toast({ description: 'Favorilerden çıkarıldı', duration: 2000 });
                            } else {
                              favs.push(product);
                              toast({ description: 'Favorilere eklendi', duration: 2000 });
                            }
                            localStorage.setItem('favorites', JSON.stringify(favs));
                          }}
                        >
                           <Heart size={18} fill={JSON.parse(localStorage.getItem('favorites') || '[]').some(f => f.id === product.id) ? '#eab308' : 'none'} stroke={JSON.parse(localStorage.getItem('favorites') || '[]').some(f => f.id === product.id) ? '#eab308' : 'currentColor'} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12 gap-2">
              <button
                onClick={() => {
                  setCurrentPage(p => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-xl bg-white dark:bg-card text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:bg-background transition-colors font-medium shadow-sm"
              >
                Önceki
              </button>
              <div className="flex items-center gap-1 hidden sm:flex">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                  if (page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)) {
                    return (
                      <button
                        key={page}
                        onClick={() => {
                          setCurrentPage(page);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-10 h-10 border rounded-xl flex items-center justify-center transition-colors shadow-sm ${currentPage === page ? 'bg-[#ffc107] text-black font-bold border-[#ffc107]' : 'bg-white dark:bg-card text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-background'}`}
                      >
                        {page}
                      </button>
                    );
                  }
                  if (page === currentPage - 3 || page === currentPage + 3) return <span key={page} className="px-2 text-gray-400">...</span>;
                  return null;
                })}
              </div>
              <button
                onClick={() => {
                  setCurrentPage(p => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-xl bg-white dark:bg-card text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:bg-background transition-colors font-medium shadow-sm"
              >
                Sonraki
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
