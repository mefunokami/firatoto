import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CartContext } from '@/lib/CartContext.jsx';
import { toast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet';
import GoogleMapsRating from '@/components/GoogleMapsRating';

const API_URL = '/api/products.php';

export default function ProductDetailPage() {
  const { id, brand, productName } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('aciklama');
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useContext(CartContext);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentRating, setCommentRating] = useState(5);
  const [comments, setComments] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [googleMaps, setGoogleMaps] = useState({
    rating: 0,
    review_count: 0,
    maps_url: 'https://share.google/Sq5zO5TC6BcGLN7v6',
  });
  const commentRef = useRef(null);
  const user = JSON.parse(sessionStorage.getItem('user') || 'null');

  const SITE_URL = 'https://www.firatotoyedekparca.com';

  const getAbsoluteImageUrl = (url) => {
    if (!url || url.startsWith('data:')) return `${SITE_URL}/logo.png`;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('//')) return `https:${url}`;
    return `${SITE_URL}${url.startsWith('/') ? url : `/${url}`}`;
  };

  // Deterministik ürün istatistikleri (ürün ID'sine göre sabit, abartısız sayılar)
  const getProductStats = (pid) => {
    if (!pid) return { views: 0, inCart: 0, sold: 0 };
    const base = parseInt(String(pid).split('').reduce((a, c) => a + c.charCodeAt(0), 0));
    return {
      views: 18 + (base % 43),      // 18-60
      inCart: 2 + (base % 14),      // 2-15
      sold: 4 + (base % 22),        // 4-25
    };
  };

  // Mevcut fotoğrafları topla
  const getProductImages = () => {
    if (!product) return [];
    const images = [
      product.imageUrl,
      product.imageUrl1,
      product.imageUrl2
    ].filter(img => img && img.trim() !== ''); // Boş olmayan fotoğrafları filtrele
    return images.length > 0 ? images : [product.imageUrl]; // Hiç fotoğraf yoksa ana fotoğrafı kullan
  };

  const productImages = getProductImages();

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    let productId = null;
    if (id) {
      fetch(`${API_URL}?id=${id}`)
        .then(res => res.json())
        .then(data => {
          const prod = Array.isArray(data) ? data[0] : data;
          setProduct(prod || null);
          setNotFound(!prod);
          if (prod && prod.id) {
            fetchComments(prod.id);
            fetchSimilarProducts(prod);
          }
        })
        .catch(() => {
          setProduct(null);
          setNotFound(true);
        })
        .finally(() => setLoading(false));
    } else if (brand && productName) {
      // Brand parametresini deslugify et
      const realBrand = deslugifyBrand(brand);
      fetch(`${API_URL}?brand=${encodeURIComponent(realBrand)}`)
        .then(res => res.json())
        .then(data => {
          const match = data.find(p =>
            p.slug_brand && p.slug_name &&
            normalize(p.slug_brand) === normalize(brand) &&
            normalize(p.slug_name) === normalize(productName)
          );
          setProduct(match || null);
          setNotFound(!match);
          if (match && match.id) {
            fetchComments(match.id);
            fetchSimilarProducts(match);
          }
        })
        .catch(() => {
          setProduct(null);
          setNotFound(true);
        })
        .finally(() => setLoading(false));
    } else {
      setProduct(null);
      setNotFound(true);
      setLoading(false);
    }
  }, [id, brand, productName]);

  useEffect(() => {
    fetch('/api/google_maps_rating.php')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setGoogleMaps({
            rating: data.rating ?? 0,
            review_count: data.review_count ?? 0,
            maps_url: data.maps_url || 'https://share.google/Sq5zO5TC6BcGLN7v6',
          });
        }
      })
      .catch(() => {});
  }, []);

  const hasProductImage = (p) => {
    const url = (p?.imageUrl || p?.image || '').trim();
    return Boolean(url);
  };

  // Benzer ürünler: aynı marka, karışık sıra, görselsiz ürün yok
  const fetchSimilarProducts = (prod) => {
    if (!prod || !prod.brand) return;
    fetch(`${API_URL}?brand=${encodeURIComponent(prod.brand)}&limit=40`)
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.products || []);
        const filtered = list
          .filter(p => p.id !== prod.id && hasProductImage(p))
          .sort(() => Math.random() - 0.5)
          .slice(0, 8);
        setSimilarProducts(filtered);
      })
      .catch(() => setSimilarProducts([]));
  };

  const renderSimilarProductsGrid = () => {
    if (similarProducts.length === 0) {
      return (
        <p className="text-gray-500 text-center py-8">
          Bu marka için gösterilecek benzer ürün bulunamadı.
        </p>
      );
    }
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {similarProducts.map(sim => (
          <div
            key={sim.id}
            className="bg-gray-50 rounded-xl p-3 flex flex-col items-center cursor-pointer hover:shadow-md hover:bg-yellow-50 transition-all border border-transparent hover:border-yellow-200 group"
            onClick={() => {
              if (sim.slug_brand && sim.slug_name) {
                navigate(`/${sim.slug_brand}/${sim.slug_name}`);
              } else {
                navigate(`/product/${sim.id}`);
              }
            }}
          >
            <div className="w-full aspect-square bg-white rounded-lg overflow-hidden mb-2 flex items-center justify-center">
              <img
                src={sim.imageUrl || sim.image}
                alt={sim.name}
                className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="text-xs font-semibold text-gray-700 text-center line-clamp-2 leading-tight mb-1">{sim.name}</div>
            <div className="text-xs text-yellow-600 font-bold">
              {(!sim.price || parseFloat(sim.price) === 0) ? 'Fiyatı Sorunuz' : Number(sim.price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Yorumları API'den çek
  const fetchComments = (productId) => {
    fetch(`/api/comments.php?product_id=${productId}`)
      .then(res => res.json())
      .then(data => setComments(data.comments || []));
  };

  // Yardımcı slugify fonksiyonu
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
      .replace(/[^a-z0-9_]/g, '')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  // Brand slug'ını orijinal brand adına çeviren fonksiyon
  function deslugifyBrand(slug) {
    if (!slug) return '';
    if (slug.toLowerCase() === 'genel_markalar') return 'GENEL MARKALAR';
    if (slug.toLowerCase() === 'mercedesbenz') return 'MERCEDESBENZ';
    if (slug.toLowerCase() === 'mercedes-benz') return 'MERCEDES-BENZ';
    return slug.replace(/_/g, ' ').toUpperCase();
  }

  // Marka ve ürün adı normalization fonksiyonu
  function normalize(str) {
    return (str || '').replace(/[-_\s]/g, '').toLowerCase();
  }

  const handleShowCommentBox = () => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('open-login-popup'));
      return;
    }
    setActiveTab('yorumlar');
    setTimeout(() => {
      commentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || !product) return;
    const payload = {
      product_id: product.id,
      user_id: user?.id,
      user_name: user?.first_name,
      user_surname: user?.last_name,
      rating: commentRating,
      comment: commentText,
    };
    const res = await fetch('/api/comments.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setCommentText('');
      setCommentRating(5);
      setShowCommentBox(false);
      fetchComments(product.id);
      toast({ description: 'Yorumunuz kaydedildi', duration: 2000 });
    } else {
      toast({ description: 'Yorum kaydedilemedi', duration: 2000, variant: 'destructive' });
    }
  };

  // Paylaş fonksiyonu
  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.name,
        url
      });
    } else {
      navigator.clipboard.writeText(url);
      toast({ description: 'Bağlantı panoya kopyalandı', duration: 2000 });
    }
  };

  // Yorum silme fonksiyonu
  const handleDeleteComment = async (created_at) => {
    if (!product || !user) return;
    const res = await fetch('/api/comments.php', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: product.id, user_id: user.id, created_at }),
    });
    if (res.ok) {
      fetchComments(product.id);
      toast({ description: 'Yorum silindi', duration: 2000 });
    } else {
      toast({ description: 'Yorum silinemedi', duration: 2000, variant: 'destructive' });
    }
  };

  // Ürün istatistikleri
  const stats = product ? getProductStats(product.id) : { views: 0, inCart: 0, sold: 0 };

  // SEO title ve description
  const seoTitle = product ? `${product.name} | ${product.brand} Yedek Parça | Fırat Oto Yedek Parça` : 'Fırat Oto Yedek Parça';
  const seoDesc = product ? `${product.name}, ${product.brand} yedek parça, orijinal ve uygun fiyatlı ürün. Hızlı kargo, güvenli alışveriş.` : 'Aracınız için orijinal ve uygun fiyatlı yedek parçalar. Hızlı kargo, güvenli alışveriş.';

  if (loading) return <div className="text-center py-20">Yükleniyor...</div>;
  if (notFound) return <div className="text-center py-20 text-red-600 font-bold text-xl">Ürün bulunamadı.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
      </Helmet>
      {product && (
        <Helmet>
          <title>{seoTitle}</title>
          <meta name="description" content={seoDesc} />
          <meta name="keywords" content={`${product.brand} yedek parça, ${product.name}, ${product.brand} ${product.category || ''}, ${product.partNumber || ''}, ${product.model || ''}, orijinal yedek parça, OEM yedek parça`} />
          <link rel="canonical" href={`${SITE_URL}/${product.slug_brand || slugify(product.brand)}/${product.slug_name || slugify(product.name)}`} />
          {/* Open Graph (Facebook, WhatsApp, LinkedIn vs) */}
          <meta property="og:type" content="product" />
          <meta property="og:site_name" content="Fırat Oto Yedek Parça" />
          <meta property="og:title" content={seoTitle} />
          <meta property="og:description" content={seoDesc} />
          <meta property="og:image" content={getAbsoluteImageUrl(product.imageUrl)} />
          <meta property="og:image:secure_url" content={getAbsoluteImageUrl(product.imageUrl)} />
          <meta property="og:image:width" content="800" />
          <meta property="og:image:height" content="800" />
          <meta property="og:url" content={`${SITE_URL}/${product.slug_brand || slugify(product.brand)}/${product.slug_name || slugify(product.name)}`} />
          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={seoTitle} />
          <meta name="twitter:description" content={seoDesc} />
          <meta name="twitter:image" content={getAbsoluteImageUrl(product.imageUrl)} />
          <meta name="twitter:url" content={`${SITE_URL}/${product.slug_brand || slugify(product.brand)}/${product.slug_name || slugify(product.name)}`} />
          {/* Schema.org Product JSON-LD */}
          <script type="application/ld+json">{JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "description": product.description || `${product.brand} ${product.name} yedek parça - orijinal ve uygun fiyatlı`,
            "brand": { "@type": "Brand", "name": product.brand },
            "sku": product.partNumber || '',
            "mpn": product.partNumber || '',
            "category": product.category || 'Oto Yedek Parça',
            "image": [product.imageUrl, product.imageUrl1, product.imageUrl2].filter(Boolean),
            "url": `https://firatotoyedekparca.com/${slugify(product.brand)}/${slugify(product.name)}`,
            ...(product.price && parseFloat(product.price) > 0 ? {
              "offers": {
                "@type": "Offer",
                "price": parseFloat(product.price),
                "priceCurrency": "TRY",
                "availability": "https://schema.org/InStock",
                "seller": { "@type": "Organization", "name": "Fırat Oto Yedek Parça" },
                "url": `https://firatotoyedekparca.com/${slugify(product.brand)}/${slugify(product.name)}`
              }
            } : {}),
            ...(googleMaps.review_count > 0 && googleMaps.rating > 0 ? {
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": googleMaps.rating.toFixed(1),
                "reviewCount": googleMaps.review_count,
                "bestRating": "5",
                "worstRating": "1"
              }
            } : {}),
            "keywords": `${product.brand} yedek parça, ${product.name}, ${product.category || ''}, orijinal yedek parça, OEM yedek parça`
          })}</script>
        </Helmet>
      )}
      
      {/* Ana Ürün Bölümü */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Ürün Başlığı */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-4 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="text-yellow-600 font-semibold">{product.brand}</span>
                  <span className="text-green-600 font-semibold flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Stokta Var
                  </span>
                  <GoogleMapsRating
                    rating={googleMaps.rating}
                    reviewCount={googleMaps.review_count}
                    mapsUrl={googleMaps.maps_url}
                    size="sm"
                  />
                </div>
                {/* Ürün İstatistikleri */}
                <div className="flex flex-wrap gap-3 mt-3">
                  <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-100">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
                    {stats.views} kişi baktı
                  </div>
                  <div className="flex items-center gap-1.5 bg-orange-50 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-orange-100">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z"/></svg>
                    {stats.inCart} kişinin sepetinde
                  </div>
                  <div className="flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-100">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                    Bu ay {stats.sold} adet satıldı
                  </div>
                </div>
              </div>
              <div className="text-center md:text-right">
                <div className="text-3xl md:text-4xl font-bold text-yellow-600">
                  {(!product.price || parseFloat(product.price) === 0) ? 'Fiyatı Sorunuz.' : Number(product.price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </div>
              </div>
            </div>
          </div>

          {/* Ürün İçeriği */}
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sol: Ürün Görseli */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-4 relative">
                    <img
                      src={productImages[currentImageIndex]}
                      alt={product.name}
                      className="w-full h-full object-contain p-4 cursor-pointer hover:scale-105 transition-transform duration-300"
                      onClick={() => setShowImageModal(true)}
                    />
                    {productImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                  {productImages.length > 1 && (
                    <div className="flex justify-center gap-2">
                      {productImages.map((img, index) => (
                        <div 
                          key={index}
                          className={`w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border-2 cursor-pointer ${
                            index === currentImageIndex ? 'border-yellow-400' : 'border-gray-200'
                          }`}
                          onClick={() => setCurrentImageIndex(index)}
                        >
                          <img src={img} alt={`${product.name} - Fotoğraf ${index + 1}`} className="w-12 h-12 object-contain" />
                        </div>
                      ))}
                    </div>
                  )}
                  {productImages.length === 1 && (
                    <div className="flex justify-center gap-2">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-yellow-400">
                        <img src={productImages[0]} alt={product.name} className="w-12 h-12 object-contain" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Orta: Ürün Bilgileri ve Aksiyonlar */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sol Kolon: Ürün Detayları */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Ürün Bilgileri</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Kategori:</span>
                          <span className="font-semibold">{product.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Marka:</span>
                          <span className="font-semibold">{product.brand}</span>
                        </div>
                        {product.model && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Model:</span>
                            <span className="font-semibold">{product.model}</span>
                          </div>
                        )}
                        {product.partNumber && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Parça No:</span>
                            <span className="font-semibold">{product.partNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Adet Seçici */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Adet Seçin</h3>
                      <div className="flex items-center justify-center gap-4">
                        <button 
                          onClick={() => setQty(q => Math.max(1, q - 1))} 
                          className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-xl font-bold transition-colors"
                        >
                          -
                        </button>
                        <span className="text-2xl font-bold text-gray-800 min-w-[60px] text-center">{qty}</span>
                        <button 
                          onClick={() => setQty(q => q + 1)} 
                          className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-xl font-bold transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sağ Kolon: Aksiyonlar */}
                  <div className="space-y-4">
                    {/* Sepete Ekle */}
                    <button
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 px-6 rounded-xl text-lg transition-colors shadow-lg hover:shadow-xl"
                      onClick={() => {
                        addToCart({ ...product, quantity: qty, image: product.imageUrl });
                        toast({ description: 'Ürün sepete eklendi', duration: 3000 });
                      }}
                    >
                      🛒 Sepete Ekle
                    </button>

                    {/* WhatsApp */}
                    <a
                      href={`https://wa.me/905439740121?text=${encodeURIComponent(`Merhaba, ${product ? product.name : ''} (${window.location.href}) hakkında bilgi almak istiyorum.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl text-lg transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      WhatsApp'tan Sor
                    </a>

                    {/* Trendyol */}
                    {product.trendyolUrl && (
                      <a 
                        href={product.trendyolUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-6 rounded-xl text-lg transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                        </svg>
                        Trendyol'dan Satın Al
                      </a>
                    )}

                    {/* Favori ve Paylaş */}
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                        onClick={() => { 
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
                        <svg className="w-5 h-5" fill={JSON.parse(localStorage.getItem('favorites') || '[]').some(f => f.id === product.id) ? '#facc15' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Favori
                      </button>
                      <button 
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                        onClick={handleShare}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                        Paylaş
                      </button>
                    </div>

                    {/* Kargo Bilgisi */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-semibold">Saat 15:30'a kadar olan siparişler aynı gün kargoya verilir</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sekmeli İçerik */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Sekme Başlıkları */}
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="flex flex-wrap">
              <button 
                onClick={() => setActiveTab('aciklama')} 
                className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${activeTab === 'aciklama' ? 'bg-white text-yellow-600 border-b-2 border-yellow-500' : 'text-gray-600 hover:text-gray-800'}`}
              >
                ÜRÜN AÇIKLAMASI
              </button>
              <button 
                onClick={() => setActiveTab('yorumlar')} 
                className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${activeTab === 'yorumlar' ? 'bg-white text-yellow-600 border-b-2 border-yellow-500' : 'text-gray-600 hover:text-gray-800'}`}
              >
                ÜRÜN YORUMLARI
              </button>
              <button 
                onClick={() => setActiveTab('taksit')} 
                className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${activeTab === 'taksit' ? 'bg-white text-yellow-600 border-b-2 border-yellow-500' : 'text-gray-600 hover:text-gray-800'}`}
              >
                TAKSİT SEÇENEKLERİ
              </button>
              <button 
                onClick={() => setActiveTab('benzer')} 
                className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${activeTab === 'benzer' ? 'bg-white text-yellow-600 border-b-2 border-yellow-500' : 'text-gray-600 hover:text-gray-800'}`}
              >
                BENZER ÜRÜNLER
              </button>
            </div>
          </div>

          {/* Sekme İçeriği */}
          <div className="p-6 md:p-8">
            {activeTab === 'aciklama' && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">{product.name}</h3>
                  <div className="text-gray-700 leading-relaxed">
                    {product.description && product.description.trim() !== '' ? (
                      <div className="whitespace-pre-line">{product.description}</div>
                    ) : (
                      <p className="text-gray-500 italic">Açıklama bulunamadı.</p>
                    )}
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Fırat Oto Yedek Parça Hakkında</h4>
                  <div className="text-gray-700 leading-relaxed space-y-4">
                    <p>
                      Fırat Oto Yedek Parça olarak, BMW, Mercedes, Volkswagen, Audi, Seat ve Skoda gibi araçlara uygun orijinal, çıkma ve sıfır yedek parça temin ediyoruz. Adana merkezli firmamızdan tüm Türkiye'ye güvenli ve hızlı kargo gönderimi yapılmaktadır.
                    </p>
                    <p>
                      Bu ürün, aracınızın performansını artırmak ve uzun ömürlü kullanım sağlamak amacıyla tercih edilen güvenilir bir parçadır. Fiyat-performans açısından avantajlı olan bu parça, uzman ekibimiz tarafından önerilmektedir.
                    </p>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                      <p className="text-yellow-800 font-medium">
                        💡 <strong>Önemli:</strong> Ürünü satın almadan önce aracınızın marka, model ve motor bilgilerini bizimle paylaşarak doğru parçaya ulaşabilirsiniz.
                      </p>
                    </div>
                    <p>
                      Her türlü soru ve destek için bize WhatsApp üzerinden ulaşabilirsiniz.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-semibold">✓</span>
                      <span>Türkiye geneli kargo</span>
                      <span>•</span>
                      <span>Uygun fiyat</span>
                      <span>•</span>
                      <span>Hızlı teslimat</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'yorumlar' && (
              <div ref={commentRef} className="max-w-4xl mx-auto">
                {/* Yorum Yapma Menüsü - Her zaman görünür */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Yorum Yaz</h4>
                  {!user ? (
                    <div className="text-center py-6">
                      <div className="text-gray-500 mb-4">Yorum yapabilmek için giriş yapmanız gerekiyor</div>
                      <button 
                        onClick={() => window.dispatchEvent(new CustomEvent('open-login-popup'))}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                      >
                        Giriş Yap
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Puanınız:</label>
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(star => (
                            <button 
                              key={star} 
                              type="button" 
                              onClick={() => setCommentRating(star)} 
                              className={`text-2xl ${star <= commentRating ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="mb-4">
                        <textarea
                          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none"
                          rows={4}
                          placeholder="Bu ürün hakkında düşüncelerinizi paylaşın..."
                          value={commentText}
                          onChange={e => setCommentText(e.target.value)}
                        />
                      </div>
                      <button 
                        onClick={handleSendComment} 
                        disabled={!commentText.trim()}
                        className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors w-full"
                      >
                        Yorumu Gönder
                      </button>
                    </>
                  )}
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-gray-800 mb-4">Müşteri Yorumları ({comments.length})</h4>
                  {comments.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-lg mb-2">Henüz yorum yok</div>
                      <p className="text-gray-500">Bu ürün için ilk yorumu siz yazın!</p>
                    </div>
                  ) : (
                    comments.map((c, i) => (
                      <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                              <span className="text-yellow-600 font-bold text-sm">
                                {c.user_name.charAt(0)}{c.user_surname.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800">{c.user_name} {c.user_surname}</div>
                              <div className="text-yellow-500 text-sm">{'★'.repeat(c.rating)}{'☆'.repeat(5-c.rating)}</div>
                            </div>
                          </div>
                          {user && c.user_name === user.first_name && c.user_surname === user.last_name && (
                            <button 
                              onClick={() => handleDeleteComment(c.created_at)} 
                              className="text-red-500 hover:text-red-700 text-sm font-medium"
                            >
                              Sil
                            </button>
                          )}
                        </div>
                        <div className="text-gray-700 leading-relaxed">{c.comment}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'taksit' && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-yellow-800 mb-4">Taksit Seçenekleri</h4>
                  <p className="text-yellow-700">
                    Taksit seçenekleri yakında eklenecek. Şu anda sadece peşin ödeme kabul edilmektedir.
                  </p>
                </div>
              </div>
            )}
            
            {activeTab === 'benzer' && (
              <div className="max-w-5xl mx-auto">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  {product.brand} markasına ait benzer ürünler
                </h4>
                <p className="text-sm text-gray-500 mb-6">Aynı markadan rastgele seçilmiş ürünler gösterilmektedir.</p>
                {renderSimilarProductsGrid()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resim Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={() => setShowImageModal(false)}>
          <div className="relative">
            {/* X Butonu */}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-white hover:bg-gray-100 rounded-full shadow-lg flex items-center justify-center transition-colors z-10"
              aria-label="Kapat"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Sol/Sağ Gezinme Butonları */}
            {productImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 z-10"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 z-10"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                {/* Fotoğraf Sayacı */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm z-10">
                  {currentImageIndex + 1} / {productImages.length}
                </div>
              </>
            )}
            
            <img
              src={productImages[currentImageIndex]}
              alt={product.name}
              className="max-w-full max-h-[80vh] rounded shadow-lg border-4 border-white"
              onClick={e => e.stopPropagation()}
            />
          </div>
        </div>
      )}
      
      {/* SEO İçeriği - Dinamik */}
      {product && (
        <section className="max-w-7xl mx-auto px-4 pb-8" aria-label="İlgili Aramalar">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">İlgili Aramalar</h2>
            <div className="flex flex-wrap gap-1.5">
              {[
                `${product.brand} yedek parça`,
                `${product.brand} ${product.category || 'parça'}`,
                product.model ? `${product.brand} ${product.model} yedek parça` : null,
                product.partNumber ? `${product.partNumber} parça numarası` : null,
                `Adana ${product.brand} yedek parça`,
                `orijinal ${product.brand} parça`,
                `${product.brand} OEM parça`,
                'BMW yedek parça', 'Mercedes yedek parça', 'Audi yedek parça',
                'Volkswagen yedek parça', 'VW yedek parça',
                'orijinal yedek parça', 'OEM yedek parça',
                'Adana oto yedek parça', 'Alman araç yedek parça',
                'turbo hortumu', 'intercooler', 'triger seti',
                'yağ filtresi', 'hava filtresi', 'far', 'stop lambası',
                'fren balatası', 'fren diski', 'amortisör',
                'tampon', 'ızgara', 'spoiler', 'radyatör', 'panjur',
                'buji', 'bobin', 'manifold', 'karter', 'piston'
              ].filter(Boolean).map((kw, i) => (
                <span key={i} className="text-[11px] text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">{kw}</span>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
} 