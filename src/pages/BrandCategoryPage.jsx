import React, { useEffect, useState, useContext } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { CartContext } from '@/lib/CartContext.jsx';
import { toast } from '@/components/ui/use-toast';
import { Heart, Menu, X } from 'lucide-react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Select as ThemedSelect, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Helmet } from 'react-helmet';

export default function BrandCategoryPage() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  // Önce path parametrelerini, yoksa query parametrelerini kullan
  let brand = params.brand;
  let model = params.model;
  if (!brand || !model) {
    const searchParams = new URLSearchParams(location.search);
    brand = brand || searchParams.get('brand') || '';
    model = model || searchParams.get('model') || '';
  }
  // model slug'ını geri çevir (örn: 1_SERI_E81_2007-2011 -> 1 SERI E81 2007-2011)
  function unslugify(str) {
    return (str || '').replace(/_/g, ' ');
  }
  const realModel = unslugify(model).trim().toUpperCase();
  // Slug'ı orijinal brand adına çeviren fonksiyon
  function deslugifyBrand(slug) {
    if (!slug) return '';
    // Özel durum: genel_markalar
    if (slug.toLowerCase() === 'genel_markalar') return 'GENEL MARKALAR';
    // Özel durum: mercedes-benz
    if (slug.toLowerCase() === 'mercedes-benz') return 'MERCEDES-BENZ';
    // Diğer markalar için alt çizgi yerine boşluk, tireyi koru, büyük harf
    return slug.replace(/_/g, ' ').toUpperCase();
  }
  // brand parametresini orijinal brand adına çevir
  function normalizeBrand(str) {
    // MERCEDES-BENZ gibi özel durumlar için tire ve boşlukları koru
    if (str === 'MERCEDES-BENZ') return 'MERCEDES-BENZ';
    if (str === 'GENEL MARKALAR') return 'GENEL MARKALAR';
    // Diğer markalar için sadece alt çizgileri kaldır
    return (str || '').replace(/_/g, ' ').toUpperCase();
  }
  const realBrand = normalizeBrand(deslugifyBrand(brand));
  const [selectedModel, setSelectedModel] = useState(null);
  const [models, setModels] = useState([]);
  const [products, setProducts] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const { addToCart } = useContext(CartContext);
  const [sortOption, setSortOption] = useState('default');
  const [modelsOpen, setModelsOpen] = useState(true);
  const [modelsAnim, setModelsAnim] = useState(true);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modelleri API'den çek
  useEffect(() => {
    if (!brand) return;
    const brandForApi = deslugifyBrand(brand);
    fetch(`/api/brand_models.php?brand=${encodeURIComponent(brandForApi)}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setModels(data.map(m => m.model));
        } else {
          setModels([]);
        }
      })
      .catch(() => setModels([]));
  }, [brand]);

  // Ürünleri API'den çek
  useEffect(() => {
    if (!realBrand) return;
    
    // Eğer model varsa hem marka hem model ile filtrele
    if (realModel) {
      const url = `/api/products.php?brand=${encodeURIComponent(realBrand)}&model=${encodeURIComponent(realModel)}`;
      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setProducts(data);
          } else {
            setProducts([]);
          }
        })
        .catch(() => setProducts([]));
      setSelectedModel(realModel);
      return;
    }
    
    // Eğer sadece marka varsa, o markaya ait tüm ürünleri getir
    const url = `/api/products.php?brand=${encodeURIComponent(realBrand)}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]);
        }
      })
      .catch(() => setProducts([]));
    setSelectedModel(null);
  }, [realBrand, realModel]);

  useEffect(() => {
    fetch('/api/productbrands.php')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAllBrands(data.map(b => b.name));
        } else {
          setAllBrands([]);
        }
      })
      .catch(() => setAllBrands([]));
  }, []);

  // Sıralama fonksiyonu
  const sortedProducts = React.useMemo(() => {
    if (sortOption === 'price_desc') {
      return [...products].sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortOption === 'price_asc') {
      return [...products].sort((a, b) => (a.price || 0) - (b.price || 0));
    }
    return products;
  }, [products, sortOption]);



  // Model seçilince o modele ait kategorileri bul
  const modelCategories = React.useMemo(() => {
    if (!selectedModel) return [];
    const cats = products
      .filter(p => p.model === selectedModel && p.category)
      .map(p => p.category)
      .filter(Boolean);
    return Array.from(new Set(cats));
  }, [products, selectedModel]);

  // slugify fonksiyonu ekle
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
      .replace(/[^a-z0-9_\-]/g, '')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  // SEO title ve description için sabit markalar listesi
  const SABIT_MARKALAR = [
    'BMW', 'MERCEDES-BENZ', 'VOLKSWAGEN', 'AUDİ', 'TESLA', 'SEAT', 'SKODA', 'PEUGEOT', 'CİTROEN', 'FORD', 'OPEL', 'CHEVROLET', 'GENEL MARKALAR', 'SABİTMARKALAR'
  ];
  const isSabitMarka = SABIT_MARKALAR.includes(realBrand);
  const seoBrand = realBrand.charAt(0).toUpperCase() + realBrand.slice(1).toLowerCase();
  const seoTitle = isSabitMarka ? `${seoBrand} Yedek Parça | Fırat Oto Yedek Parça` : 'Fırat Oto Yedek Parça';
  const seoDesc = isSabitMarka
    ? `${seoBrand} yedek parça, orijinal ve uygun fiyatlı ${seoBrand} yedek parçaları burada. Hızlı kargo, güvenli alışveriş, geniş ürün yelpazesi.`
    : 'Aracınız için orijinal ve uygun fiyatlı yedek parçalar. Hızlı kargo, güvenli alışveriş.';

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
      </Helmet>
      <div className="bg-gray-50 min-h-screen py-4 px-2">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-4">
            <Link to="/" className="hover:underline">Anasayfa</Link> &gt; <span className="font-semibold text-gray-700">{deslugifyBrand(brand)}</span>
          </nav>
          {isSabitMarka && (
            <h1 className="text-3xl font-extrabold text-center mb-6">{seoBrand} Yedek Parça</h1>
          )}
          {/* Mobil Hamburger Menü Butonu */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              Filtreler
            </button>
          </div>

          {/* Mobil Menü Overlay */}
          {mobileMenuOpen && (
            <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setMobileMenuOpen(false)}>
              <div className="bg-white h-full w-80 max-w-[90vw] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800">Filtreler</h3>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-4 space-y-4">
                  {/* Araç Markaları */}
                  <div className="bg-white rounded shadow p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold">Araç Markaları</h4>
                      <button
                        onClick={() => {
                          if (modelsOpen) {
                            setModelsAnim(false);
                            setTimeout(() => setModelsOpen(false), 200);
                          } else {
                            setModelsOpen(true);
                            setTimeout(() => setModelsAnim(true), 10);
                          }
                        }}
                        aria-label={modelsOpen ? 'Modelleri gizle' : 'Modelleri göster'}
                        type="button"
                      >
                        {modelsOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </button>
                    </div>
                    <div
                      style={{
                        maxHeight: modelsOpen ? (modelsAnim ? 400 : 0) : 0,
                        opacity: modelsOpen ? (modelsAnim ? 1 : 0) : 0,
                        overflow: modelsOpen ? 'auto' : 'hidden',
                        transition: 'max-height 0.2s cubic-bezier(0.4,0,0.2,1), opacity 0.2s cubic-bezier(0.4,0,0.2,1)',
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#fde047 #f3f4f6'
                      }}
                      className="custom-scrollbar"
                    >
                      {modelsOpen && (
                        <>
                          <ul className="space-y-1 text-sm">
                            {models.map((model, i) => (
                              <li key={model}>
                                <button
                                  className={`block w-full text-left px-2 py-1 rounded hover:bg-yellow-100 ${selectedModel === model ? 'font-bold text-yellow-600' : ''}`}
                                  onClick={() => {
                                    setSelectedModel(model);
                                    setSelectedCategory('');
                                    setMobileMenuOpen(false);
                                    // URL'yi güncelle
                                    navigate(`/kategori/${slugify(realBrand)}/${slugify(model)}`);
                                  }}
                                >
                                  - {model}
                                </button>
                                {selectedModel === model && modelCategories.length > 0 && (
                                  <div className="mt-2 ml-4">
                                    <ThemedSelect value={selectedCategory} onValueChange={setSelectedCategory}>
                                      <SelectTrigger className="border border-gray-300 bg-white font-bold shadow-sm rounded-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 hover:bg-yellow-100 transition-colors">
                                        <SelectValue placeholder="Kategori seçin" />
                                      </SelectTrigger>
                                      <SelectContent className="border border-gray-200 shadow-lg rounded-sm bg-white">
                                        {modelCategories.map(cat => (
                                          <SelectItem key={cat} value={cat} className="font-bold hover:bg-yellow-100 rounded-sm cursor-pointer transition-colors">
                                            {cat}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </ThemedSelect>
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Tüm Markalar */}
                  <div className="bg-white rounded shadow p-4">
                    <h4 className="font-bold mb-2">Tüm Markalar</h4>
                    <div className="space-y-1 text-sm">
                      {allBrands.length === 0 ? (
                        <span className="text-gray-400">Marka bulunamadı</span>
                      ) : (
                        allBrands.map(brandName => {
                          const count = products.filter(p => normalizeBrand(p.product_brand) === normalizeBrand(brandName) || normalizeBrand(p.brand) === normalizeBrand(brandName)).length;
                          return (
                            <label key={brandName} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedBrands.includes(brandName)}
                                onChange={e => {
                                  setSelectedBrands(prev =>
                                    e.target.checked
                                      ? [...prev, brandName]
                                      : prev.filter(b => b !== brandName)
                                  );
                                }}
                              />
                              {brandName} <span className="text-gray-400">({count})</span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sol Panel: Modeller ve Filtreler - Sadece Desktop'ta görünür */}
            <aside className="hidden md:block md:col-span-1">
              <div className="bg-white rounded shadow p-4 mb-6">
                <h3 className="font-bold mb-2">Araç Markaları</h3>
                <div className="border rounded p-3">
                  <div className="font-semibold mb-2 flex items-center justify-between">
                    <span>{deslugifyBrand(brand)}</span>
                    <button
                      className="ml-2 p-1 rounded hover:bg-yellow-100 transition"
                      onClick={() => {
                        if (modelsOpen) {
                          setModelsAnim(false);
                          setTimeout(() => setModelsOpen(false), 200);
                        } else {
                          setModelsOpen(true);
                          setTimeout(() => setModelsAnim(true), 10);
                        }
                      }}
                      aria-label={modelsOpen ? 'Modelleri gizle' : 'Modelleri göster'}
                      type="button"
                    >
                      {modelsOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>
                  </div>
                  <div
                    style={{
                      maxHeight: modelsOpen ? (modelsAnim ? 400 : 0) : 0,
                      opacity: modelsOpen ? (modelsAnim ? 1 : 0) : 0,
                      overflow: modelsOpen ? 'auto' : 'hidden',
                      transition: 'max-height 0.2s cubic-bezier(0.4,0,0.2,1), opacity 0.2s cubic-bezier(0.4,0,0.2,1)',
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#fde047 #f3f4f6'
                    }}
                    className="custom-scrollbar"
                  >
                    {modelsOpen && (
                      <>
                        <ul className="space-y-1 text-sm">
                          {models.map((model, i) => (
                            <li key={model}>
                              <button
                                className={`block w-full text-left px-2 py-1 rounded hover:bg-yellow-100 ${selectedModel === model ? 'font-bold text-yellow-600' : ''}`}
                                onClick={() => {
                                  setSelectedModel(model);
                                  setSelectedCategory('');
                                  // URL'yi güncelle
                                  navigate(`/kategori/${slugify(realBrand)}/${slugify(model)}`);
                                }}
                              >
                                - {model}
                              </button>
                              {selectedModel === model && modelCategories.length > 0 && (
                                <div className="mt-2 ml-4">
                                  <ThemedSelect value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="border border-gray-300 bg-white font-bold shadow-sm rounded-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 hover:bg-yellow-100 transition-colors">
                                      <SelectValue placeholder="Kategori seçin" />
                                    </SelectTrigger>
                                    <SelectContent className="border border-gray-200 shadow-lg rounded-sm bg-white">
                                      {modelCategories.map(cat => (
                                        <SelectItem key={cat} value={cat} className="font-bold hover:bg-yellow-100 rounded-sm cursor-pointer transition-colors">
                                          {cat}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </ThemedSelect>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {/* Filtreler */}
              <div className="bg-white rounded shadow p-4">
                <h4 className="font-bold mb-2">Tüm Markalar</h4>
                <div className="space-y-1 text-sm">
                  {allBrands.length === 0 ? (
                    <span className="text-gray-400">Marka bulunamadı</span>
                  ) : (
                    allBrands.map(brandName => {
                      const count = products.filter(p => normalizeBrand(p.product_brand) === normalizeBrand(brandName) || normalizeBrand(p.brand) === normalizeBrand(brandName)).length;
                      return (
                        <label key={brandName} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brandName)}
                            onChange={e => {
                              setSelectedBrands(prev =>
                                e.target.checked
                                  ? [...prev, brandName]
                                  : prev.filter(b => b !== brandName)
                              );
                            }}
                          />
                          {brandName} <span className="text-gray-400">({count})</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            </aside>
            {/* Sağ Panel: Ürünler */}
            <main className="md:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="accent-yellow-500" />
                  <span className="text-sm">Stoktakiler</span>
                </div>
                <div className="text-sm text-gray-500">Toplam {sortedProducts.length} ürün</div>
                <div className="w-48">
                  <ThemedSelect value={sortOption} onValueChange={setSortOption}>
                    <SelectTrigger>
                      <SelectValue placeholder="Önerilen sıralama" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Önerilen sıralama</SelectItem>
                      <SelectItem value="price_desc">En yüksek fiyat</SelectItem>
                      <SelectItem value="price_asc">En düşük fiyat</SelectItem>
                    </SelectContent>
                  </ThemedSelect>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {sortedProducts.length === 0 ? (
                  <div className="col-span-full text-center text-gray-400 text-lg py-8">Ürün Bulunamadı.</div>
                                  ) : (
                    sortedProducts.map(product => (
                    <div
                      key={product.id}
                      className="bg-white rounded shadow p-4 flex flex-col items-center relative cursor-pointer hover:shadow-lg transition"
                      onClick={() => {
                        if (product.slug_brand && product.slug_name) {
                          navigate(`/${product.slug_brand}/${product.slug_name}`);
                        } else {
                          navigate(`/product/${product.id}`);
                        }
                      }}
                    >
                      <div className="text-center text-xs text-gray-700 mb-2 font-semibold w-full min-h-[32px]">{product.name}</div>
                      <img src={product.imageUrl || product.image} alt={product.name} className="w-32 h-32 object-contain mb-2" />
                      <div className="font-bold text-lg mb-4">{product.price?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</div>
                      <div className="flex w-full gap-2 mt-auto">
                        <button
                          className="flex-1 px-3 py-1 border rounded text-xs bg-yellow-400 hover:bg-yellow-500 text-white font-bold transition"
                          onClick={e => {
                            e.stopPropagation();
                            addToCart({ ...product, quantity: 1, image: product.imageUrl });
                            toast({ description: 'Ürün sepete eklendi', duration: 3000 });
                          }}
                        >
                          Sepete Ekle
                        </button>
                        <button
                          className="px-2 py-1 border rounded text-xs flex items-center justify-center text-gray-400 hover:text-red-500 transition"
                          onClick={e => { 
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
                          title="Favorilere ekle"
                        >
                          <Heart 
                            size={20} 
                            fill={JSON.parse(localStorage.getItem('favorites') || '[]').some(f => f.id === product.id) ? '#facc15' : 'none'} 
                            stroke={JSON.parse(localStorage.getItem('favorites') || '[]').some(f => f.id === product.id) ? '#facc15' : '#6b7280'} 
                            strokeWidth={1.5}
                          />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
} 