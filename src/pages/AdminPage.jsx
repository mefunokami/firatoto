import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus, Package, AlertCircle, Settings, Wrench, Car, Loader2, Image as ImageIcon } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import ProductForm from '@/components/ProductForm';
import ProductList from '@/components/ProductList';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { CartProvider } from '@/lib/CartContext.jsx';
import MediaLibrary from '@/components/MediaLibrary';

const API_URL = '/api/products.php';
const PAGE_SIZE = 50; // Sayfa başı ürün sayısı

const SABIT_MARKALAR = [
  "OPEL", "CHEVROLET", "BMW", "MERCEDES-BENZ", "VOLKSWAGEN", "AUDİ", "SEAT", "SKODA", "PEUGEOT", "CİTROEN", "FORD"
];

function AdminPage() {
  // Ürün listesi state
  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(false);
  const [currentPage, setCurrentPage]   = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchTerm, setSearchTerm]     = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterNoImage, setFilterNoImage] = useState(false);
  const [sortField, setSortField]       = useState('createdAt');
  const [sortOrder, setSortOrder]       = useState('desc');

  // Form / UI state
  const [showForm, setShowForm]         = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeTab, setActiveTab]       = useState('list');
  const [showModelModal, setShowModelModal] = useState(false);
  const [selectedBrand, setSelectedBrand]   = useState('');
  const [newModel, setNewModel]         = useState('');
  const [isAdding, setIsAdding]         = useState(false);
  const [categories, setCategories]     = useState([]);
  const [newCategory, setNewCategory]   = useState('');
  const [users, setUsers]               = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError]     = useState('');
  // ─── Ürünleri API'den çek (server-side sayfalama) ───
  const fetchProducts = useCallback((page = 1, search = searchTerm, category = filterCategory, noImage = filterNoImage) => {
    setLoading(true);
    const params = new URLSearchParams({
      page:  String(page),
      limit: String(PAGE_SIZE),
    });
    if (search)   params.append('search',   search);
    if (category) params.append('category', category);
    if (noImage)  params.append('no_image', '1');

    fetch(`${API_URL}?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object' && !Array.isArray(data) && data.products) {
          setProducts(data.products);
          setCurrentPage(data.page);
          setTotalPages(data.pages);
          setTotalProducts(data.total);
        } else {
          // Eski format (fallback)
          setProducts(Array.isArray(data) ? data : []);
          setTotalPages(1);
          setTotalProducts(Array.isArray(data) ? data.length : 0);
        }
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [searchTerm, filterCategory, filterNoImage]);

  // Kategorileri çek
  useEffect(() => {
    if (activeTab === 'categories') {
      fetch('/api/categories.php')
        .then(res => res.json())
        .then(data => setCategories(data));
    }
  }, [activeTab]);

  // İlk yükleme
  useEffect(() => {
    fetchProducts(1);
  }, []);

  // Kullanıcılar sekmesi
  useEffect(() => {
    if (activeTab === 'users') {
      setUsersLoading(true);
      fetch('/api/admin_users.php', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data.success) setUsers(data.users);
          else setUsersError(data.error || 'Kullanıcılar alınamadı.');
        })
        .catch(() => setUsersError('Sunucu hatası.'))
        .finally(() => setUsersLoading(false));
    }
  }, [activeTab]);

  // ─── Sayfalama callback'leri ───
  const handlePageChange = (page) => {
    fetchProducts(page, searchTerm, filterCategory, filterNoImage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    fetchProducts(1, val, filterCategory, filterNoImage);
  };

  const handleCategoryChange = (val) => {
    setFilterCategory(val);
    fetchProducts(1, searchTerm, val, filterNoImage);
  };

  const handleNoImageChange = (val) => {
    setFilterNoImage(val);
    fetchProducts(1, searchTerm, filterCategory, val);
  };

  const handleSortChange = (field, order) => {
    setSortField(field);
    setSortOrder(order);
    // Sıralama server-side desteklendiğinde buraya parametre eklenebilir
  };

  // ─── CRUD ───
  const handleSaveProduct = async (productData) => {
    const url    = editingProduct ? `${API_URL}?id=${editingProduct.id}` : API_URL;
    const method = 'POST';

    try {
      const res  = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      const data = await res.json();
      if (res.ok && (data.success || data.id)) {
        toast({ title: 'Başarılı!', description: editingProduct ? 'Ürün güncellendi.' : 'Ürün eklendi.' });
        fetchProducts(currentPage);
        setShowForm(false);
        setActiveTab('list');
        setEditingProduct(null);
      } else {
        toast({ title: 'Hata!', description: data.error || 'Bir hata oluştu.', variant: 'destructive' });
        setShowForm(false);
        setActiveTab('list');
        setEditingProduct(null);
      }
    } catch (err) {
      toast({ title: 'Hata!', description: 'Sunucuya ulaşılamadı.', variant: 'destructive' });
      setShowForm(false);
      setActiveTab('list');
      setEditingProduct(null);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowForm(true);
    setActiveTab('add');
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      fetch(`${API_URL}?id=${productId}`, { method: 'DELETE' })
        .then(res => res.json())
        .then((res) => {
          if (res.success) {
            toast({ title: 'Ürün Silindi', description: 'Ürün başarıyla silindi.' });
            // Silme sonrası mevcut sayfayı yenile (son ürünse bir önceki sayfaya git)
            const newPage = products.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
            fetchProducts(newPage);
          } else {
            toast({ title: 'Hata!', description: res.error || 'Bir hata oluştu.', variant: 'destructive' });
          }
        });
    }
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
    setActiveTab('add');
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setShowForm(false);
    setActiveTab('list');
  };

  // İstatistikler (mevcut sayfadan değil, toplam sayıdan)
  const stats = {
    totalProducts,
    lowStock:   products.filter(p => (p.stock || 0) < 5).length,
    categories: new Set(products.map(p => p.category).filter(Boolean)).size
  };

  const handleAddModel = async (e) => {
    e.preventDefault();
    if (!selectedBrand || !newModel) {
      toast({ title: 'Hata', description: 'Marka ve model seçmelisiniz.', variant: 'destructive' });
      return;
    }
    setIsAdding(true);
    try {
      const res = await fetch('/api/brand_models.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand: selectedBrand, model: newModel })
      });
      if (res.ok) {
        toast({ title: 'Model Eklendi', description: `${selectedBrand} markasına ${newModel} modeli eklendi.` });
        setNewModel('');
        setSelectedBrand('');
        setShowModelModal(false);
      } else {
        const data = await res.json();
        toast({ title: 'Hata', description: data.error || 'Model eklenemedi.', variant: 'destructive' });
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    const res = await fetch('/api/categories.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCategory.trim() })
    });
    if (res.ok) {
      toast({ description: 'Kategori eklendi.' });
      setNewCategory('');
      const cats = await fetch('/api/categories.php').then(r => r.json());
      setCategories(cats);
    } else {
      toast({ description: 'Kategori eklenemedi.', variant: 'destructive' });
    }
  };

  return (
    <CartProvider>
      <Helmet>
        <title>Fırat Oto - Yönetim Paneli</title>
        <meta name="description" content="Fırat Oto Yedek Parça için ürün yönetim sistemi." />
      </Helmet>


      <AdminLayout
        title="Ürün Yönetimi"
        activeTab={activeTab}
        showForm={showForm}
        onNewProduct={handleNewProduct}
        onMediaLibrary={() => setActiveTab('media')}
        onProductList={() => {
          setActiveTab('list');
          setShowForm(false);
          setEditingProduct(null);
        }}
      >
          {/* İstatistik Kartları */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Toplam Ürün Kartı */}
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-card border border-gray-100 dark:border-border shadow-sm p-6 group hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">Toplam Ürün</h3>
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Package className="h-5 w-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-gray-900 dark:text-foreground relative z-10">
                {loading ? <Loader2 className="h-6 w-6 animate-spin text-blue-500" /> : totalProducts.toLocaleString('tr-TR')}
              </div>
              <p className="text-xs text-gray-400 mt-2 font-medium">Sistemde kayıtlı toplam parça</p>
            </div>

            {/* Bu Sayfada Kartı */}
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-card border border-gray-100 dark:border-border shadow-sm p-6 group hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">Görüntülenen</h3>
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <Car className="h-5 w-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-gray-900 dark:text-foreground relative z-10">
                {products.length}
              </div>
              <p className="text-xs text-gray-400 mt-2 font-medium">Bu sayfadaki ürün sayısı</p>
            </div>

            {/* Düşük Stok Kartı */}
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-card border border-gray-100 dark:border-border shadow-sm p-6 group hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">Kritik Stok</h3>
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                  <AlertCircle className="h-5 w-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-gray-900 dark:text-foreground relative z-10">
                {stats.lowStock}
              </div>
              <p className="text-xs text-red-400 mt-2 font-medium">5 adetin altındaki (bu sayfada)</p>
            </div>

            {/* Sayfa Bilgisi Kartı */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-500 border border-yellow-300 shadow-md p-6 group hover:shadow-lg transition-all duration-300 text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="text-sm font-bold tracking-wide uppercase text-yellow-900/80">Geçerli Sayfa</h3>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                  <Settings className="h-5 w-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold relative z-10 drop-shadow-sm flex items-baseline gap-2">
                {currentPage} <span className="text-lg font-bold text-yellow-900/60">/ {totalPages}</span>
              </div>
              <p className="text-xs text-yellow-900/80 mt-2 font-bold">Sayfa navigasyonu alttadır</p>
            </div>
          </motion.div>

          <motion.div
            key={activeTab + (showForm ? '-form' : '')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {showForm ? (
              <ProductForm product={editingProduct} onSave={handleSaveProduct} onCancel={handleCancelEdit} />
            ) : activeTab === 'list' ? (
              <ProductList
                products={products}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                // Server-side sayfalama props
                currentPage={currentPage}
                totalPages={totalPages}
                totalProducts={totalProducts}
                limit={PAGE_SIZE}
                loading={loading}
                onPageChange={handlePageChange}
                onSearchChange={handleSearchChange}
                onCategoryChange={handleCategoryChange}
                onSortChange={handleSortChange}
                filterCategory={filterCategory}
                externalSearch={searchTerm}
                filterNoImage={filterNoImage}
                onNoImageChange={handleNoImageChange}
              />
            ) : null}
          </motion.div>

          {activeTab === 'media' && (
            <div className="h-[800px] max-h-[80vh]">
              <MediaLibrary />
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="bg-card rounded shadow p-6 max-w-xl mx-auto">
              <h2 className="text-xl font-bold mb-4">Kategorileri Yönet</h2>
              <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  placeholder="Yeni kategori adı"
                  className="border px-3 py-2 rounded w-full"
                />
                <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-4 py-2 rounded">Ekle</button>
              </form>
              <ul className="divide-y">
                {categories.map(cat => (
                  <li key={cat.id} className="py-2">{cat.name}</li>
                ))}
              </ul>
            </div>
          )}

          {showModelModal && (
            <Dialog open={showModelModal} onOpenChange={setShowModelModal}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Model Ekle</DialogTitle>
                  <DialogDescription>Sabit markalardan birini seçip model ekleyin.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddModel} className="flex flex-col gap-4 mt-2">
                  <div className="flex flex-wrap gap-2">
                    {SABIT_MARKALAR.map((brand) => (
                      <Button
                        key={brand}
                        type="button"
                        variant={selectedBrand === brand ? 'default' : 'outline'}
                        className={selectedBrand === brand ? 'bg-primary text-white' : ''}
                        onClick={() => setSelectedBrand(brand)}
                      >
                        {brand}
                      </Button>
                    ))}
                  </div>
                  <Input
                    placeholder="Model adı (örn: Astra)"
                    value={newModel}
                    onChange={e => setNewModel(e.target.value)}
                    disabled={!selectedBrand || isAdding}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={() => setShowModelModal(false)}>İptal</Button>
                    <Button type="submit" disabled={!selectedBrand || !newModel || isAdding}>
                      {isAdding ? 'Ekleniyor...' : 'Model Ekle'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}

          {/* Kullanıcılar sekmesi kaldırıldı, yönlendirme ile ayrı sayfada açılıyor */}
      </AdminLayout>
    </CartProvider>
  );
}

export default AdminPage;