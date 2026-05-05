import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus, Package, TrendingUp, AlertCircle, Settings, Wrench, ArrowLeft, Car, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import ProductForm from '@/components/ProductForm';
import ProductList from '@/components/ProductList';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { CartProvider } from '@/lib/CartContext.jsx';

const API_URL = 'https://firatotoyedekparca.com/api/products.php';
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
  const navigate                        = useNavigate();
  const [categories, setCategories]     = useState([]);
  const [newCategory, setNewCategory]   = useState('');
  const [users, setUsers]               = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError]     = useState('');

  // ─── Ürünleri API'den çek (server-side sayfalama) ───
  const fetchProducts = useCallback((page = 1, search = searchTerm, category = filterCategory) => {
    setLoading(true);
    const params = new URLSearchParams({
      page:  String(page),
      limit: String(PAGE_SIZE),
    });
    if (search)   params.append('search',   search);
    if (category) params.append('category', category);

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
  }, [searchTerm, filterCategory]);

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
    fetchProducts(page, searchTerm, filterCategory);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    fetchProducts(1, val, filterCategory);
  };

  const handleCategoryChange = (val) => {
    setFilterCategory(val);
    fetchProducts(1, searchTerm, val);
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

      <div className="min-h-screen bg-secondary">
        <header className="bg-neutral-900 shadow-lg sticky top-0 z-40">
          <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between h-auto md:h-20 gap-4 md:gap-0 py-4 md:py-0">
              <div className="flex items-center gap-4 min-w-[320px]">
                <Link to="/" className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors text-sm md:text-base">
                  <ArrowLeft className="h-5 w-5" />
                  <span>Siteye Dön</span>
                </Link>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-400 rounded-md flex items-center justify-center ml-2 md:ml-4">
                  <Wrench className="h-6 w-6 md:h-7 md:w-7 text-neutral-800" />
                </div>
                <div>
                  <h1 className="text-lg md:text-2xl font-bold text-white leading-tight">Fırat Oto Yönetim</h1>
                  <p className="text-xs md:text-sm text-gray-400 leading-tight">Yönetim Paneli</p>
                </div>
              </div>
              <nav className="flex gap-0 md:gap-0 w-full md:w-auto items-center border-t-0 pt-0 mt-0 overflow-x-visible justify-center">
                <button onClick={() => { setActiveTab('list'); setShowForm(false); }} className={`px-4 py-2 font-semibold flex items-center gap-2 h-12 border-0 rounded-t-md transition-all duration-150 ${activeTab === 'list' && !showForm ? 'bg-yellow-400 text-black shadow' : 'bg-neutral-800 text-white hover:bg-neutral-700'} `}><Package className="h-4 w-4" />Ürün Listesi</button>
                <div className="h-8 w-px bg-gray-700 mx-1" />
                <button onClick={handleNewProduct} className={`px-4 py-2 font-semibold flex items-center gap-2 h-12 border-0 rounded-t-md transition-all duration-150 ${activeTab === 'add' || showForm ? 'bg-yellow-400 text-black shadow' : 'bg-neutral-800 text-white hover:bg-neutral-700'} `}><Plus className="h-4 w-4" />{editingProduct ? "Ürün Düzenle" : "Yeni Ürün Ekle"}</button>
                <div className="h-8 w-px bg-gray-700 mx-1" />
                <button onClick={() => { navigate('/admin/categories'); }} className={`px-4 py-2 font-semibold flex items-center gap-2 h-12 border-0 rounded-t-md transition-all duration-150 ${activeTab === 'categories' ? 'bg-yellow-400 text-black shadow' : 'bg-neutral-800 text-white hover:bg-neutral-700'} `}><Settings className="h-4 w-4" />Kategoriler</button>
                <div className="h-8 w-px bg-gray-700 mx-1" />
                <button onClick={() => navigate('/admin/models')} className={`px-4 py-2 font-semibold flex items-center gap-2 h-12 border-0 rounded-t-md transition-all duration-150 ${window.location.pathname === '/admin/models' ? 'bg-yellow-400 text-black shadow' : 'bg-neutral-800 text-white hover:bg-neutral-700'} `}><Wrench className="h-4 w-4" />Model Ekle</button>
                <div className="h-8 w-px bg-gray-700 mx-1" />
                <button onClick={() => { navigate('/admin/brands'); }} className={`px-4 py-2 font-semibold flex items-center gap-2 h-12 border-0 rounded-t-md transition-all duration-150 ${activeTab === 'brands' ? 'bg-yellow-400 text-black shadow' : 'bg-neutral-800 text-white hover:bg-neutral-700'} `}><Plus className="h-4 w-4" />Markalar</button>
                <div className="h-8 w-px bg-gray-700 mx-1" />
                <button onClick={() => { navigate('/admin/users'); setActiveTab('users'); setShowForm(false); }} className={`px-4 py-2 font-semibold flex items-center gap-2 h-12 border-0 rounded-t-md transition-all duration-150 ${window.location.pathname === '/admin/users' ? 'bg-yellow-400 text-black shadow' : 'bg-neutral-800 text-white hover:bg-neutral-700'} `}><Users className="h-4 w-4" />Kullanıcılar</button>
                <div className="h-8 w-px bg-gray-700 mx-1" />
                <button onClick={() => navigate('/admin/blog')} className="px-4 py-2 font-semibold flex items-center gap-2 h-12 border-0 rounded-t-md transition-all duration-150 bg-neutral-800 text-white hover:bg-neutral-700">
                  <span>Blog Düzenle</span>
                </button>
                <div className="h-8 w-px bg-gray-700 mx-1" />
                <button onClick={() => navigate('/admin/faq')} className="px-4 py-2 font-semibold flex items-center gap-2 h-12 border-0 rounded-t-md transition-all duration-150 bg-neutral-800 text-white hover:bg-neutral-700">
                  <span>SSS Düzenle</span>
                </button>
              </nav>
            </div>
          </div>
        </header>

        <main className="container mx-auto p-2 sm:p-4 md:p-6 lg:p-8">
          {/* İstatistik Kartları */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-card shadow-sm border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Ürün</CardTitle>
                <Package className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : totalProducts.toLocaleString('tr-TR')}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-sm border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Bu Sayfada</CardTitle>
                <Car className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold text-foreground">{products.length}</div></CardContent>
            </Card>

            <Card className="bg-card shadow-sm border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Düşük Stoklu</CardTitle>
                <AlertCircle className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold text-foreground">{stats.lowStock}</div></CardContent>
            </Card>

            <Card className="bg-card shadow-sm border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Sayfa</CardTitle>
                <Settings className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {currentPage} <span className="text-base text-muted-foreground">/ {totalPages}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            key={showForm ? 'form' : 'list'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {showForm ? (
              <ProductForm product={editingProduct} onSave={handleSaveProduct} onCancel={handleCancelEdit} />
            ) : (
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
              />
            )}
          </motion.div>

          {activeTab === 'categories' && (
            <div className="bg-white rounded shadow p-6 max-w-xl mx-auto">
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
        </main>
      </div>
    </CartProvider>
  );
}

export default AdminPage;