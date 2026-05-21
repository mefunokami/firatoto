import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useOutletContext, useLocation } from 'react-router-dom';
import Hero from '@/components/Hero';
import PublicProductCard from '@/components/PublicProductCard';
import ProductDetailModal from '@/components/ProductDetailModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import Select from 'react-select';
import HomeSlider from '@/components/HomeSlider';
import WeeklyDealSlider from '@/components/WeeklyDealSlider';
import { ChevronDown, ChevronUp } from 'lucide-react';

const API_URL = '/api/products.php';

const SABIT_MARKALAR = [
  { value: "OPEL", label: "OPEL" },
  { value: "CHEVROLET", label: "CHEVROLET" },
  { value: "BMW", label: "BMW" },
  { value: "MERCEDES-BENZ", label: "MERCEDES-BENZ" },
  { value: "VOLKSWAGEN", label: "VOLKSWAGEN" },
  { value: "AUDİ", label: "AUDİ" },
  { value: "SEAT", label: "SEAT" },
  { value: "SKODA", label: "SKODA" },
  { value: "PEUGEOT", label: "PEUGEOT" },
  { value: "CİTROEN", label: "CİTROEN" },
  { value: "FORD", label: "FORD" }
];

// Vite ile tüm görselleri otomatik al
const images = Object.values(import.meta.glob('../img/*.{png,webp,jpg,jpeg,gif,svg}', { eager: true, import: 'default' }));

// Ürünleri karıştırma fonksiyonu
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const HomePage = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const { searchTerm: headerSearchTerm, popularProductsRef, brandModelFilter } = useOutletContext();
  const location = useLocation();
  
  const [popularSearchTerm, setPopularSearchTerm] = useState('');
  const [partFinderFilters, setPartFinderFilters] = useState({ brand: '', model: '', partNumber: '' });
  const [modelOptions, setModelOptions] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [visibleCount, setVisibleCount] = useState(8);
  const [randomVisibleCount, setRandomVisibleCount] = useState(8);
  const [cargosVisibleCount, setCargosVisibleCount] = useState(5);
  const [faqs, setFaqs] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [randomProducts, setRandomProducts] = useState([]);
  const [shippedCargos, setShippedCargos] = useState([]);
  const [selectedCargo, setSelectedCargo] = useState(null);

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        setAllProducts(data);
        setDisplayedProducts(data);
        // Randomize ürünler oluştur
        setRandomProducts(shuffleArray(data));
      })
      .catch(() => {
        setAllProducts([]);
        setDisplayedProducts([]);
        setRandomProducts([]);
      });
  }, []);

  useEffect(() => {
    // Yılları ürünlerden unique olarak çek
    const years = Array.from(new Set(allProducts.map(p => p.year).filter(Boolean))).sort();
    setYearOptions(years.map(y => ({ value: y, label: y })));
  }, [allProducts]);

  useEffect(() => {
    if (partFinderFilters.brand) {
      fetch(`/api/brand_models.php?brand=${encodeURIComponent(partFinderFilters.brand)}`)
        .then(res => res.json())
        .then(data => setModelOptions(data.map(m => ({ value: m.model, label: m.model }))))
        .catch(() => setModelOptions([]));
    } else {
      setModelOptions([]);
    }
  }, [partFinderFilters.brand]);

  useEffect(() => {
    fetch('/api/faq.php')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.faqs)) setFaqs(data.faqs);
        else setFaqs([]);
      })
      .catch(() => setFaqs([]));
  }, []);

  useEffect(() => {
    fetch('/api/blog.php')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.blogs)) setBlogs(data.blogs);
        else setBlogs([]);
      })
      .catch(() => setBlogs([]));
  }, []);

  useEffect(() => {
    fetch('/api/shipped_cargos.php')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setShippedCargos(data);
        else setShippedCargos([]);
      })
      .catch(() => setShippedCargos([]));
  }, []);

  const finalSearchTerm = useMemo(() => headerSearchTerm || popularSearchTerm, [headerSearchTerm, popularSearchTerm]);

  useEffect(() => {
    let filtered = [...allProducts];
    // Sadece anasayfada brandModelFilter ile filtrele
    if (location.pathname === '/' && brandModelFilter.brand && brandModelFilter.model) {
      filtered = filtered.filter(p =>
        p.brand === brandModelFilter.brand && p.model === brandModelFilter.model
      );
    } else if (finalSearchTerm) {
      filtered = filtered.filter(product => {
        const searchPool = `${product.name} ${product.brand} ${product.model || ''} ${product.partNumber || ''}`.toLowerCase();
        return searchPool.includes(finalSearchTerm.toLowerCase());
      });
    }
    setDisplayedProducts(filtered);
  }, [finalSearchTerm, allProducts, brandModelFilter, location.pathname]);

  const handlePartFinderSearch = () => {
    let filtered = [...allProducts];
    if (partFinderFilters.brand) {
      filtered = filtered.filter(p => p.brand === partFinderFilters.brand);
    }
    if (partFinderFilters.model) {
      filtered = filtered.filter(p => p.model === partFinderFilters.model);
    }
    if (partFinderFilters.year) {
      filtered = filtered.filter(p => p.year === partFinderFilters.year);
    }
    if (partFinderFilters.partNumber) {
      filtered = filtered.filter(p => (p.partNumber || '').toLowerCase().includes(partFinderFilters.partNumber.toLowerCase()));
    }
    setDisplayedProducts(filtered);
    popularProductsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleFilterChange = (e) => {
    setPartFinderFilters(prev => ({...prev, [e.target.name]: e.target.value}));
  }

  return (
    <>
      <Helmet>
        <title>Fırat Oto Yedek Parça | Adana Oto Yedek Parça ve Otomotiv Ürünleri</title>
        <meta name="description" content="Adana'nın lider oto yedek parça firması. Orijinal ve uygun fiyatlı otomotiv yedek parçaları, hızlı kargo ve güvenilir hizmet." />
        <meta name="keywords" content="adana oto yedek parça, otomotiv, yedek parça, firat oto, uygun fiyat, hızlı kargo, güvenilir hizmet" />
        <meta property="og:title" content="Fırat Oto Yedek Parça" />
        <meta property="og:description" content="Adana'nın lider oto yedek parça firması. Orijinal ve uygun fiyatlı otomotiv yedek parçaları, hızlı kargo ve güvenilir hizmet." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://firatotoyedekparca.com/" />
        <meta property="og:image" content="https://firatotoyedekparca.com/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Fırat Oto Yedek Parça" />
        <meta name="twitter:description" content="Adana'nın lider oto yedek parça firması. Orijinal ve uygun fiyatlı otomotiv yedek parçaları, hızlı kargo ve güvenilir hizmet." />
        <meta name="twitter:image" content="https://firatotoyedekparca.com/logo.png" />
        <link rel="canonical" href="https://firatotoyedekparca.com/" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "AutoPartsStore",
            "name": "Fırat Oto Yedek Parça",
            "image": "https://firatotoyedekparca.com/logo.png",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Fevzipaşa, 48046 sokak No: 29/A",
              "addressLocality": "Seyhan",
              "addressRegion": "Adana",
              "postalCode": "01190",
              "addressCountry": "TR"
            },
            "telephone": "+90 543 974 01 21",
            "email": "eksaeticaret@gmail.com",
            "url": "https://firatotoyedekparca.com/"
          }
        `}</script>
      </Helmet>
      {/* Hero ve Haftanın Fırsatı yan yana */}
      <div className="bg-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
            {/* Hero (daha geniş ve kısa, dikdörtgen) */}
            <div className="flex flex-1 items-stretch col-span-1 md:col-span-8">
              <Hero small />
            </div>
            {/* Haftanın Fırsatı (daha dar, sağda, eski yükseklik) */}
            <div className="flex items-stretch justify-center col-span-1 md:col-span-4">
              <WeeklyDealSlider />
            </div>
          </div>
        </div>
      </div>
      {/* Avantajlar */}
      {/* Öne Çıkan Markalar */}
      {/* Bu iki bölümü en alta taşıyoruz */}
      <div className="bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h2 className="text-3xl font-extrabold text-foreground mb-2">YEDEK PARÇA BULUCU</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">İstediğiniz marka ve modeli girerek aracınıza uygun parçaları hemen bulun.</p>
            <div className="w-full flex flex-col items-center gap-4 px-2">
                <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
                    <Select
                        name="brand"
                        options={SABIT_MARKALAR}
                        value={SABIT_MARKALAR.find(opt => opt.value === partFinderFilters.brand) || null}
                        onChange={opt => setPartFinderFilters(prev => ({ ...prev, brand: opt ? opt.value : '', model: '' }))}
                        placeholder="Marka seçin"
                        isClearable
                        classNamePrefix="react-select"
                        className="w-full"
                    />
                    <Select
                        name="model"
                        options={modelOptions}
                        value={modelOptions.find(opt => opt.value === partFinderFilters.model) || null}
                        onChange={opt => setPartFinderFilters(prev => ({ ...prev, model: opt ? opt.value : '' }))}
                        placeholder={partFinderFilters.brand ? "Model seçin" : "Önce marka seçin"}
                        isClearable
                        isDisabled={!partFinderFilters.brand}
                        classNamePrefix="react-select"
                        className="w-full"
                    />
                    <Select
                        name="year"
                        options={yearOptions}
                        value={yearOptions.find(opt => opt.value === partFinderFilters.year) || null}
                        onChange={opt => setPartFinderFilters(prev => ({ ...prev, year: opt ? opt.value : '' }))}
                        placeholder="Yıl seçin"
                        isClearable
                        classNamePrefix="react-select"
                        className="w-full"
                    />
                    <Input name="partNumber" value={partFinderFilters.partNumber} onChange={handleFilterChange} placeholder="Parça Numarası (opsiyonel)" className="h-12 text-base w-full"/>
                </div>
                <Button size="lg" className="h-12 text-base font-bold mt-4 w-full md:w-60" onClick={handlePartFinderSearch}>Parçaları Bul</Button>
            </div>
        </div>
      </div>
      {/* Ürünler bölümü (Randomize) */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">Ürünler</h2>
        </div>
        {randomProducts.length > 0 ? (
            <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
                {randomProducts.slice(0, randomVisibleCount).map((product, index) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                        <PublicProductCard product={product} onClick={() => setSelectedProduct(product)} />
                    </motion.div>
                ))}
            </div>
            {randomVisibleCount < randomProducts.length && (
              <div className="flex justify-center mt-8">
                <Button size="lg" className="px-8 py-3 text-base font-bold" onClick={() => setRandomVisibleCount(v => v + 8)}>
                  Daha fazla görüntüle
                </Button>
              </div>
            )}
            </>
        ) : (
            <motion.div 
                className="text-center py-16 bg-secondary rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Search className="mx-auto h-16 w-16 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold text-foreground">Ürün Bulunamadı</h3>
                <p className="mt-2 text-muted-foreground">Henüz ürün eklenmemiş.</p>
            </motion.div>
        )}
      </div>

      {/* Yeni Ürünler bölümü */}
      <div ref={popularProductsRef} className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-24">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">Yeni Ürünler</h2>
            <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                placeholder="Ürün ara..."
                value={popularSearchTerm}
                onChange={(e) => setPopularSearchTerm(e.target.value)}
                className="pl-10 h-11 text-base"
                />
            </div>
        </div>
        {displayedProducts.length > 0 ? (
            <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
                {displayedProducts.slice(0, visibleCount).map((product, index) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                        <PublicProductCard product={product} onClick={() => setSelectedProduct(product)} />
                    </motion.div>
                ))}
            </div>
            {visibleCount < displayedProducts.length && (
              <div className="flex justify-center mt-8">
                <Button size="lg" className="px-8 py-3 text-base font-bold" onClick={() => setVisibleCount(v => v + 8)}>
                  Daha fazla görüntüle
                </Button>
              </div>
            )}
            {/* Gönderilen Kargolar */}
            {shippedCargos.length > 0 && (
              <div className="container mx-auto px-0 sm:px-6 lg:px-8 py-12 mt-8 border-t border-gray-100">
                <h2 className="text-2xl font-bold mb-2 text-center">Gönderilen Kargolar</h2>
                <p className="text-center text-gray-500 text-sm mb-6">Müşterilerimize gönderdiğimiz kargolardan kareler.</p>
                <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {shippedCargos.slice(0, cargosVisibleCount).map(cargo => (
                    <div
                      key={cargo.id}
                      className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer group relative"
                      onClick={() => setSelectedCargo(cargo)}
                    >
                      <div className="aspect-square bg-gray-100 overflow-hidden">
                        <img
                          src={cargo.image_url}
                          alt={cargo.title || 'Kargo'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      {cargo.title && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                          <div className="text-white text-xs font-semibold line-clamp-1">{cargo.title}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {cargosVisibleCount < shippedCargos.length && (
                  <div className="flex justify-center mt-8">
                    <Button size="lg" className="px-8 py-3 text-base font-bold" onClick={() => setCargosVisibleCount(v => v + 5)}>
                      Daha fazla görüntüle
                    </Button>
                  </div>
                )}
              </div>
            )}
            {/* SSS kutusu */}
            <div className="max-w-4xl mx-auto mt-16 mb-10">
              <h2 className="text-2xl font-bold mb-4 text-center">Sık Sorulan Sorular</h2>
              <div className="space-y-4">
                {faqs.length === 0 && <div className="text-gray-400 text-center">Henüz SSS eklenmemiş.</div>}
                {faqs.map((faq, idx) => (
                  <div key={faq.id} className="bg-white rounded-lg shadow border p-4">
                    <button
                      className="w-full flex justify-between items-center text-left font-semibold text-lg text-gray-900 focus:outline-none"
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      aria-expanded={openFaq === idx}
                    >
                      <span>{faq.question}</span>
                      {openFaq === idx ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    {openFaq === idx && (
                      <div className="mt-2 text-gray-700 whitespace-pre-line">{faq.answer}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Son Eklenen Bloglar kutusu */}
            <div className="max-w-4xl mx-auto mt-10 mb-10">
              <h2 className="text-xl font-bold mb-4 text-center">Son Eklenen Bloglar</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {blogs.slice(0, 3).map(blog => (
                  <div key={blog.id} className="bg-white rounded-lg shadow border p-3 flex flex-col items-center hover:shadow-lg transition cursor-pointer" onClick={() => window.location.href = `/blog/${blog.slug}` }>
                    {blog.image_url && <img src={blog.image_url} alt={blog.title} className="w-full h-28 object-cover rounded mb-2" />}
                    <div className="font-semibold text-base text-gray-900 text-center line-clamp-2 mb-1">{blog.title}</div>
                  </div>
                ))}
                {blogs.length === 0 && <div className="col-span-full text-gray-400 text-center">Henüz blog eklenmemiş.</div>}
              </div>
            </div>
            {/* Avantajlar ve Markalar tam burada */}
            <div className="bg-white py-10 mt-12">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                  <div>
                    <div className="flex justify-center mb-2">
                      <img src="/icons/free-shipping.png" alt="Aynı Gün Kargo" className="h-12" />
                    </div>
                    <div className="font-bold text-lg">Aynı Gün Kargo</div>
                    <div className="text-muted-foreground text-sm">81 İl'e Aynı Gün Kargo</div>
                  </div>
                  <div>
                    <div className="flex justify-center mb-2">
                      <img src="/icons/support.png" alt="7/24 Destek" className="h-12" />
                    </div>
                    <div className="font-bold text-lg">7/24 Destek</div>
                    <div className="text-muted-foreground text-sm">Sormaktan çekinmeyin</div>
                  </div>
                  <div>
                    <div className="flex justify-center mb-2">
                      <img src="/icons/secure.png" alt="Güvenli Alışveriş" className="h-12" />
                    </div>
                    <div className="font-bold text-lg">Güvenli Alışveriş</div>
                    <div className="text-muted-foreground text-sm">256Bit SSL Sertifikası</div>
                  </div>
                  <div>
                    <div className="flex justify-center mb-2">
                      <img src="/icons/price.png" alt="Uygun Fiyatlar" className="h-12" />
                    </div>
                    <div className="font-bold text-lg">Uygun Fiyatlar</div>
                    <div className="text-muted-foreground text-sm">En iyi Fiyat avantajı</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white py-8">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold text-center mb-6">Öne Çıkan Markalar</h2>
                <div className="relative w-full overflow-hidden" style={{height: 110}}>
                  <div
                    className="flex gap-6 animate-marquee"
                    style={{
                      width: 'max-content',
                      animation: 'marquee 60s linear infinite',
                    }}
                  >
                    {images.map((img, i) => (
                      <div key={img} className="bg-gray-100 rounded-lg flex flex-col items-center py-6 min-w-[140px] max-w-[140px]">
                        <img src={img} alt="" className="h-10 mb-2 object-contain" />
                      </div>
                    ))}
                    {/* Sonsuz döngü için bir kopya daha */}
                    {images.map((img, i) => (
                      <div key={img + '-copy'} className="bg-gray-100 rounded-lg flex flex-col items-center py-6 min-w-[140px] max-w-[140px]">
                        <img src={img} alt="" className="h-10 mb-2 object-contain" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            </>
        ) : (
            <motion.div 
                className="text-center py-16 bg-secondary rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Search className="mx-auto h-16 w-16 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold text-foreground">Ürün Bulunamadı</h3>
                <p className="mt-2 text-muted-foreground">Aradığınız kriterlere uygun ürün bulunamadı veya henüz eklenmedi.</p>
            </motion.div>
        )}
      </div>

      {selectedProduct && <ProductDetailModal product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} />}
      {/* Kargo Foto\u011f Lightbox */}
      {selectedCargo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedCargo(null)}
        >
          <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <button
              className="absolute -top-10 right-0 text-white hover:text-yellow-400 transition-colors font-bold text-lg flex items-center gap-2"
              onClick={() => setSelectedCargo(null)}
            >
              ✕ Kapat
            </button>
            <img
              src={selectedCargo.image_url}
              alt={selectedCargo.title || 'Kargo'}
              className="w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
            />
            {selectedCargo.title && (
              <div className="bg-white/90 text-gray-800 font-semibold text-center py-2 px-4 rounded-b-xl">
                {selectedCargo.title}
              </div>
            )}
          </div>
        </div>
      )}
      <div style={{display:'none'}}>
        BMW yedek parça, Mercedes yedek parça, Volkswagen yedek parça, Audi yedek parça, Skoda yedek parça, Seat yedek parça, Mini Cooper parça, orijinal yedek parça, çıkma parça, motor parçası, oto elektrik, oto mekanik, uygun fiyatlı yedek parça.
        Adana, Ankara, İstanbul, İzmir, Bursa, Antalya, Konya, Gaziantep, Mersin, Kayseri, Diyarbakır, Samsun, Eskişehir, Denizli, Şanlıurfa, Kocaeli, Trabzon, Sakarya, Malatya, Erzurum, Hatay, Balıkesir, Aydın, Manisa, Tekirdağ, Afyon, Van, Ordu, Batman, Elazığ, Çorum, Sivas, Isparta, Muğla, Uşak, Kütahya, Kırşehir, Osmaniye, Adıyaman, Tokat, Rize, Karabük, Giresun, Yozgat, Kars, Siirt, Bitlis, Bilecik, Düzce, Artvin, Nevşehir, Zonguldak, Niğde, Ağrı, Kilis, Tunceli, Bartın, Hakkari, Bayburt, Ardahan, Iğdır, Karaman, Aksaray, Çankırı, Kırıkkale, Bolu, Bingöl, Muş, Gümüşhane, Edirne.
      </div>
    </>
  );
};

export default HomePage;