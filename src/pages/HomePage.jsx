import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useOutletContext, useLocation, Link, useNavigate } from 'react-router-dom';
import Hero from '@/components/Hero';
import PublicProductCard from '@/components/PublicProductCard';
import ProductDetailModal from '@/components/ProductDetailModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight, Truck, ShieldCheck, Tag, MessageCircle, Droplet, Disc, Settings, Zap, ArrowRight, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import Select from 'react-select';
import HomeSlider from '@/components/HomeSlider';
import WeeklyDealSlider from '@/components/WeeklyDealSlider';
import GuessThePartGame from '@/components/GuessThePartGame';
import Footer from '@/components/Footer';
import { ChevronDown, ChevronUp } from 'lucide-react';

const API_URL = '/api/products.php';

const SABIT_MARKALAR = [
  { value: "BMW", label: "BMW" },
  { value: "MERCEDES-BENZ", label: "MERCEDES-BENZ" },
  { value: "VOLKSWAGEN", label: "VOLKSWAGEN" },
  { value: "AUDİ", label: "AUDİ" },
  { value: "SEAT", label: "SEAT" },
  { value: "SKODA", label: "SKODA" },
  { value: "PORSCHE", label: "PORSCHE" },
  { value: "MİNİ COOPER", label: "MİNİ COOPER" },
  { value: "TESLA", label: "TESLA" },
  { value: "PEUGEOT", label: "PEUGEOT" },
  { value: "CİTROEN", label: "CİTROEN" },
  { value: "FORD", label: "FORD" },
  { value: "OPEL", label: "OPEL" },
  { value: "CHEVROLET", label: "CHEVROLET" }
];

// Vite ile tüm görselleri otomatik al (artık partnerler için değil, sadece yedek olarak durabilir)
const localImages = Object.values(import.meta.glob('../img/*.{png,webp,jpg,jpeg,gif,svg}', { eager: true, import: 'default' }));

// Ürünleri karıştırma fonksiyonu
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/* ─── Gönderilen Kargolar Slider ─────────────────────────────────────────── */
const CARGO_ITEM_W = 280; // px
const CARGO_GAP    = 16;  // px (gap-4)

function CargoSlider({ cargos, onSelect }) {
  const trackRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const checkBounds = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 2);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    checkBounds();
    el.addEventListener('scroll', checkBounds, { passive: true });
    window.addEventListener('resize', checkBounds);
    return () => {
      el.removeEventListener('scroll', checkBounds);
      window.removeEventListener('resize', checkBounds);
    };
  }, [cargos, checkBounds]);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (CARGO_ITEM_W + CARGO_GAP) * 3, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-8 border-t border-gray-100 dark:border-border">
      <h2 className="text-2xl font-bold mb-2 text-center">Gönderilen Kargolar</h2>
      <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-6">Müşterilerimize gönderdiğimiz kargolardan kareler.</p>

      <div className="relative max-w-6xl mx-auto">
        {/* Sol Ok */}
        <button
          onClick={() => scroll(-1)}
          disabled={!canPrev}
          className={`
            absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-3
            w-10 h-10 rounded-full flex items-center justify-center shadow-lg
            bg-card border border-gray-200 dark:border-border text-gray-600 dark:text-gray-400
            hover:bg-yellow-400 hover:border-yellow-400 hover:text-white
            transition-all duration-200
            disabled:opacity-0 disabled:pointer-events-none
          `}
          aria-label="Geri"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div
          ref={trackRef}
          className="cargo-track flex gap-4 overflow-x-auto py-4 px-2"
          style={{
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {cargos.map(cargo => (
            <div
              key={cargo.id}
              className="rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer group relative flex-shrink-0"
              style={{ width: CARGO_ITEM_W, scrollSnapAlign: 'center' }}
              onClick={() => onSelect(cargo)}
            >
              <div className="overflow-hidden bg-gray-100" style={{ width: CARGO_ITEM_W, height: CARGO_ITEM_W }}>
                <img
                  src={cargo.image_url}
                  alt={cargo.title || 'Kargo'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  width="280"
                  height="280"
                  loading="lazy"
                />
              </div>
              {cargo.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pt-12 pb-4">
                  <div className="text-white text-sm font-bold tracking-wide line-clamp-2">{cargo.title}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sağ Ok */}
        <button
          onClick={() => scroll(1)}
          disabled={!canNext}
          className={`
            absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-3
            w-10 h-10 rounded-full flex items-center justify-center shadow-lg
            bg-card border border-gray-200 dark:border-border text-gray-600 dark:text-gray-400
            hover:bg-yellow-400 hover:border-yellow-400 hover:text-white
            transition-all duration-200
            disabled:opacity-0 disabled:pointer-events-none
          `}
          aria-label="İleri"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

const HomePage = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const { searchTerm: headerSearchTerm, popularProductsRef, brandModelFilter } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [popularSearchTerm, setPopularSearchTerm] = useState('');
  const [partFinderFilters, setPartFinderFilters] = useState({ brand: '', model: '', partNumber: '' });
  const [modelOptions, setModelOptions] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [visibleCount, setVisibleCount] = useState(8);
  const [randomVisibleCount, setRandomVisibleCount] = useState(8);
  const [faqs, setFaqs] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [randomProducts, setRandomProducts] = useState([]);
  const [shippedCargos, setShippedCargos] = useState([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [partnerBrands, setPartnerBrands] = useState([]);

  // Fetch partner brands
  useEffect(() => {
    fetch('/api/productbrands.php')
      .then(r => r.json())
      .then(data => {
        const partners = data.filter(b => b.is_general == 1 && b.image_url);
        setPartnerBrands(partners);
      })
      .catch(() => {});
  }, []);
  const [selectedCargo, setSelectedCargo] = useState(null);
  const [faqVisibleCount, setFaqVisibleCount] = useState(3);
  const [blogVisibleCount, setBlogVisibleCount] = useState(3);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        setAllProducts(data);
        setDisplayedProducts(data);
        // Randomize ürünler oluştur
        setRandomProducts(shuffleArray(data));
        // TODO: Canlıya alırken setTimeout'u kaldır
        setTimeout(() => setIsLoadingProducts(false), 2000);
      })
      .catch(() => {
        setAllProducts([]);
        setDisplayedProducts([]);
        setRandomProducts([]);
        setTimeout(() => setIsLoadingProducts(false), 2000);
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
        const searchPool = `${product.name} ${product.brand} ${product.model || ''} ${product.partNumber || ''} ${product.description || ''} ${product.category || ''}`.toLowerCase();
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
      <div className="bg-card py-8 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
            {/* Hero (daha geniş ve kısa, dikdörtgen) */}
            <div className="flex flex-1 items-stretch col-span-1 md:col-span-9 lg:col-span-9">
              <Hero small />
            </div>
            {/* Sağ Kolon: Haftanın Fırsatı ve Mini Oyun */}
            <div className="flex flex-col gap-3 col-span-1 md:col-span-3 lg:col-span-3 md:h-[450px]">
              <div className="flex-1 min-h-0 overflow-hidden rounded-2xl bg-white dark:bg-card shadow-sm border border-gray-100 dark:border-border">
                <WeeklyDealSlider />
              </div>
              <div className="h-36 shrink-0">
                <GuessThePartGame />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Güven Rozetleri (İnce ve Kompakt Kartlar) */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
          
          <div className="bg-white dark:bg-card rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-3 lg:p-4 flex items-center gap-3 lg:gap-4 border-b-4 border-[#ffc107] group cursor-default transform hover:-translate-y-1">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-yellow-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <Truck className="w-5 h-5 lg:w-6 lg:h-6 text-[#ffc107]" />
            </div>
            <div className="flex flex-col text-left">
              <div className="text-gray-900 dark:text-foreground font-extrabold text-xs lg:text-sm tracking-tight leading-none mb-1">Aynı Gün Kargo</div>
              <div className="text-gray-500 dark:text-gray-400 text-[10px] lg:text-xs font-medium leading-tight">81 İl'e Hızlı Gönderim</div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-card rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-3 lg:p-4 flex items-center gap-3 lg:gap-4 border-b-4 border-[#ffc107] group cursor-default transform hover:-translate-y-1">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-yellow-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck className="w-5 h-5 lg:w-6 lg:h-6 text-[#ffc107]" />
            </div>
            <div className="flex flex-col text-left">
              <div className="text-gray-900 dark:text-foreground font-extrabold text-xs lg:text-sm tracking-tight leading-none mb-1">Güvenli Alışveriş</div>
              <div className="text-gray-500 dark:text-gray-400 text-[10px] lg:text-xs font-medium leading-tight">256 Bit SSL Şifreleme</div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-card rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-3 lg:p-4 flex items-center gap-3 lg:gap-4 border-b-4 border-[#ffc107] group cursor-default transform hover:-translate-y-1">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-yellow-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <Tag className="w-5 h-5 lg:w-6 lg:h-6 text-[#ffc107]" />
            </div>
            <div className="flex flex-col text-left">
              <div className="text-gray-900 dark:text-foreground font-extrabold text-xs lg:text-sm tracking-tight leading-none mb-1">Uygun Fiyatlar</div>
              <div className="text-gray-500 dark:text-gray-400 text-[10px] lg:text-xs font-medium leading-tight">En İyi Fiyat Avantajı</div>
            </div>
          </div>

          <div className="bg-white dark:bg-card rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-3 lg:p-4 flex items-center gap-3 lg:gap-4 border-b-4 border-[#ffc107] group cursor-default transform hover:-translate-y-1">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-yellow-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <MessageCircle className="w-5 h-5 lg:w-6 lg:h-6 text-[#ffc107]" />
            </div>
            <div className="flex flex-col text-left">
              <div className="text-gray-900 dark:text-foreground font-extrabold text-xs lg:text-sm tracking-tight leading-none mb-1">Canlı Destek</div>
              <div className="text-gray-500 dark:text-gray-400 text-[10px] lg:text-xs font-medium leading-tight">WhatsApp'tan Sorun</div>
            </div>
          </div>

        </div>
      </div>

      {/* KATEGORİ VİTRİNİ */}
      <div className="relative mt-12 mb-16 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-foreground tracking-tight mb-2">Hızlı Kategori Seçimi</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm md:text-base">Aradığınız parçayı doğrudan kategoriden bularak zamandan tasarruf edin.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          
          {/* Category 1 */}
          <Link to="/kategori/bakim/tumu" className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 p-6 flex flex-col items-center text-center group cursor-pointer hover:-translate-y-1">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#fef3c7] text-[#ffc107] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Droplet className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-foreground mb-1 group-hover:text-yellow-600 transition-colors text-sm md:text-base">Periyodik Bakım</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Yağ & Filtre Setleri</p>
          </Link>

          {/* Category 2 */}
          <Link to="/kategori/fren/tumu" className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 p-6 flex flex-col items-center text-center group cursor-pointer hover:-translate-y-1">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#fef3c7] text-[#ffc107] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Disc className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-foreground mb-1 group-hover:text-yellow-600 transition-colors text-sm md:text-base">Fren Sistemi</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Disk & Balata</p>
          </Link>

          {/* Category 3 */}
          <Link to="/kategori/motor/tumu" className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 p-6 flex flex-col items-center text-center group cursor-pointer hover:-translate-y-1">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#fef3c7] text-[#ffc107] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Settings className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-foreground mb-1 group-hover:text-yellow-600 transition-colors text-sm md:text-base">Motor Aksamı</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Triger & Conta</p>
          </Link>

          {/* Category 4 */}
          <Link to="/kategori/elektrik/tumu" className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 p-6 flex flex-col items-center text-center group cursor-pointer hover:-translate-y-1">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#fef3c7] text-[#ffc107] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-foreground mb-1 group-hover:text-yellow-600 transition-colors text-sm md:text-base">Elektrik Aksamı</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Sensör & Aydınlatma</p>
          </Link>
          
        </div>
      </div>


      {/* Çıkma Parça Banner */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div 
          onClick={() => navigate('/cikma-parcalar')}
          className="bg-[#18181b] rounded-3xl overflow-hidden relative shadow-2xl flex flex-col md:flex-row items-center cursor-pointer group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10"></div>
          {/* Subtle pattern background */}
          <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#374151 1px, transparent 1px), linear-gradient(90deg, #374151 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          
          <div className="p-8 md:p-12 z-20 md:w-2/3">
            <div className="inline-block bg-[#ffc107] text-black text-xs font-extrabold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">Özel Kategori</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 group-hover:text-yellow-400 transition-colors">Orijinal Çıkma Parçalar</h2>
            <p className="text-gray-300 mb-8 max-w-lg leading-relaxed">
              Sıfır parça kalitesinde, garantili ve uzman kontrolünden geçmiş orijinal çıkma yedek parçalarla aracınızın orijinalliğini ve bütçenizi koruyun.
            </p>
            <button className="flex items-center gap-2 bg-white dark:bg-card text-black px-6 py-3 rounded-xl font-bold hover:bg-yellow-400 transition-colors shadow-lg">
              Çıkma İlanlarını İncele <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="z-20 md:w-1/3 hidden md:flex items-center justify-center p-8">
            <Package className="w-40 h-40 text-white/10 group-hover:scale-110 group-hover:text-yellow-400/20 transition-all duration-700 transform group-hover:rotate-6" />
          </div>
        </div>
      </div>      {/* Ürünler bölümü (Randomize) */}
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
        {isLoadingProducts ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white/50 backdrop-blur-sm rounded-2xl mb-12 border border-gray-100 dark:border-border shadow-sm">
                <div className="w-16 h-16 border-4 border-gray-200 dark:border-border border-t-[#ffc107] rounded-full animate-spin mb-6"></div>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-foreground">Katalog Yükleniyor...</h3>
                <p className="mt-3 text-gray-500 dark:text-gray-400 font-medium">Binlerce yedek parça sizin için hazırlanıyor, lütfen bekleyin.</p>
            </div>
        ) : displayedProducts.length > 0 ? (
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
            </>
        ) : (
            <motion.div 
                className="text-center py-16 bg-secondary rounded-lg mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Search className="mx-auto h-16 w-16 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold text-foreground">Ürün Bulunamadı</h3>
                <p className="mt-2 text-muted-foreground">Aradığınız kriterlere uygun ürün bulunamadı veya henüz eklenmedi.</p>
            </motion.div>
        )}

        {/* Gönderilen Kargolar */}
        {shippedCargos.length > 0 && (
          <CargoSlider cargos={shippedCargos} onSelect={setSelectedCargo} />
        )}

            {/* SSS kutusu */}
            <div className="max-w-[1200px] mx-auto mt-20 mb-12 px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-foreground tracking-tight flex items-center justify-center gap-2">
                  <MessageCircle className="w-6 h-6 text-[#ffc107]" />
                  Sık Sorulan Sorular
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Müşterilerimizin en çok merak ettiği sorular ve cevapları.</p>
              </div>
              <div className="space-y-4 max-w-3xl mx-auto">
                {faqs.length === 0 && <div className="text-gray-400 text-center bg-white dark:bg-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-border">Henüz SSS eklenmemiş.</div>}
                {faqs.slice(0, faqVisibleCount).map((faq, idx) => (
                  <motion.div 
                    key={faq.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                    className="bg-white dark:bg-card rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 dark:border-border overflow-hidden transition-all duration-300 hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)]"
                  >
                    <button
                      className="w-full flex justify-between items-center text-left font-bold text-gray-800 dark:text-gray-200 p-5 focus:outline-none hover:bg-gray-50/50 transition-colors"
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      aria-expanded={openFaq === idx}
                    >
                      <span className="pr-4">{faq.question}</span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${openFaq === idx ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500 dark:text-gray-400'}`}>
                        {openFaq === idx ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </button>
                    <motion.div 
                      initial={false}
                      animate={{ height: openFaq === idx ? 'auto' : 0, opacity: openFaq === idx ? 1 : 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 pt-0 text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed text-sm border-t border-gray-50 mt-2">
                        {faq.answer}
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
                
                {faqVisibleCount < faqs.length && (
                  <div className="flex justify-center mt-6 pt-4">
                    <Button 
                      variant="outline" 
                      className="rounded-full px-8 font-bold border-gray-200 dark:border-border text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:bg-background hover:text-gray-900 dark:text-foreground shadow-sm"
                      onClick={() => setFaqVisibleCount(v => v + 5)}
                    >
                      Daha Fazla Göster ({faqs.length - faqVisibleCount})
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Son Eklenen Bloglar kutusu */}
            <div className="max-w-[1200px] mx-auto mt-16 mb-20 px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-foreground tracking-tight flex items-center justify-center gap-2">
                  <Tag className="w-6 h-6 text-[#ffc107]" />
                  Son Eklenen Bloglar
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Araç bakımı ve yedek parça hakkında güncel bilgiler.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
                {blogs.slice(0, blogVisibleCount).map((blog, idx) => (
                  <motion.div 
                    key={blog.id} 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    className="bg-white dark:bg-card rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-border flex flex-col items-center hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 cursor-pointer overflow-hidden group" 
                    onClick={() => window.location.href = `/blog/${blog.slug}` }
                  >
                    <div className="w-full h-48 overflow-hidden bg-gray-50 dark:bg-background relative">
                      {blog.image_url ? (
                        <img src={blog.image_url} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Tag className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 bg-[#ffc107] text-black text-xs font-black px-2 py-1 rounded shadow-sm">
                        YENİ
                      </div>
                    </div>
                    <div className="p-5 w-full">
                      <div className="font-bold text-lg text-gray-900 dark:text-foreground line-clamp-2 mb-3 group-hover:text-yellow-600 transition-colors leading-tight">
                        {blog.title}
                      </div>
                      <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        Devamını Oku <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>
                ))}
                {blogs.length === 0 && <div className="col-span-full text-gray-400 text-center bg-white dark:bg-card p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-border">Henüz blog eklenmemiş.</div>}
              </div>
              
              {blogVisibleCount < blogs.length && (
                <div className="flex justify-center mt-10">
                  <Button 
                    variant="outline" 
                    className="rounded-full px-8 font-bold border-gray-200 dark:border-border text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:bg-background hover:text-gray-900 dark:text-foreground shadow-sm"
                    onClick={() => setBlogVisibleCount(v => v + 3)}
                  >
                    Daha Fazla Göster ({blogs.length - blogVisibleCount})
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-card py-16 md:py-24 border-t border-gray-100 dark:border-border">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1200px]">
                <div className="flex flex-col items-center mb-12">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-foreground tracking-tight text-center">Güvenilir Çözüm Ortaklarımız</h2>
                  <div className="w-20 h-1 bg-[#ffc107] rounded-full mt-4"></div>
                  <p className="text-gray-500 dark:text-gray-400 mt-4 text-center max-w-2xl text-sm md:text-base font-medium">
                    Dünyanın en prestijli otomotiv yedek parça üreticileriyle çalışıyor, aracınız için sadece garantili ve üst düzey markaları sunuyoruz.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-5">
                  {(partnerBrands.length > 0 ? partnerBrands : localImages.map(img => ({ image_url: img }))).slice(0, showAllBrands ? 999 : 18).map((brand, i) => (
                    <div key={i} className="bg-white dark:bg-card border border-gray-100 dark:border-border shadow-[0_4px_15px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_25px_rgb(0,0,0,0.06)] rounded-2xl flex items-center justify-center p-4 h-20 md:h-24 hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
                      <img 
                        src={brand.image_url} 
                        alt={brand.name || `Marka ${i}`} 
                        className="max-h-8 md:max-h-12 max-w-[85%] object-contain filter grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" 
                        loading="lazy" 
                      />
                    </div>
                  ))}
                </div>

                {(partnerBrands.length > 18 || localImages.length > 18) && !showAllBrands && (
                   <div className="mt-10 text-center flex justify-center">
                     <button onClick={() => setShowAllBrands(true)} className="flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-yellow-600 transition-colors group cursor-pointer">
                       Tüm Markalarımızı İnceleyin 
                       <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                     </button>
                   </div>
                )}
              </div>
            </div>
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
              <div className="bg-white/90 text-gray-800 dark:text-gray-200 font-semibold text-center py-2 px-4 rounded-b-xl">
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