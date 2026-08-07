import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { ShieldCheck, Truck, Wrench, Package, Star, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const AboutPage = () => {
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [aboutText, setAboutText] = useState('');

  // Auto-slide effect
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    fetch('/api/about_images.php')
      .then(res => res.json())
      .then(data => setImages(data))
      .catch(err => console.error('Hakkımızda resimleri çekilemedi:', err));

    fetch('/api/about_text.php')
      .then(res => res.json())
      .then(data => {
        if (data.success) setAboutText(data.text);
      })
      .catch(err => console.error('Hakkımızda metni çekilemedi:', err));
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-background min-h-screen pb-16">
      <Helmet>
        <title>Hakkımızda | Fırat Oto Yedek Parça</title>
        <meta name="description" content="Fırat Oto Yedek Parça'nın kuruluşu, vizyonu ve müşteri odaklı hizmet anlayışı hakkında detaylı bilgi alın." />
        <meta name="keywords" content="hakkımızda, firat oto, adana yedek parça, firma bilgisi, otomotiv" />
        <meta property="og:title" content="Hakkımızda | Fırat Oto Yedek Parça" />
        <meta property="og:description" content="Fırat Oto Yedek Parça'nın kuruluşu, vizyonu ve müşteri odaklı hizmet anlayışı hakkında detaylı bilgi alın." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://firatotoyedekparca.com/hakkımızda" />
        <meta property="og:image" content="https://firatotoyedekparca.com/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Hakkımızda | Fırat Oto Yedek Parça" />
        <meta name="twitter:description" content="Fırat Oto Yedek Parça'nın kuruluşu, vizyonu ve müşteri odaklı hizmet anlayışı hakkında detaylı bilgi alın." />
        <meta name="twitter:image" content="https://firatotoyedekparca.com/logo.png" />
        <link rel="canonical" href="https://firatotoyedekparca.com/hakkımızda" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Hakkımızda",
          "url": "https://firatotoyedekparca.com/hakkımızda",
          "description": "Fırat Oto Yedek Parça'nın kuruluşu, vizyonu ve müşteri odaklı hizmet anlayışı hakkında detaylı bilgi alın."
        })}</script>
      </Helmet>

      {/* Hero Section */}
      <div className="relative bg-[#18181b] overflow-hidden pt-24 pb-32">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent z-10"></div>
          {/* Subtle grid pattern */}
          <div className="w-full h-full opacity-20" style={{ backgroundImage: 'linear-gradient(#374151 1px, transparent 1px), linear-gradient(90deg, #374151 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
              Otomotivde <span className="text-[#ffc107]">Güvenin</span> Yeni Adresi
            </h1>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl">
              2021 yılından bu yana yenilikçi ve müşteri odaklı hizmet anlayışımızla, aracınız için en doğru parçaları en hızlı şekilde ulaştırıyoruz.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content & Images */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-30">
        <div className="bg-white dark:bg-card rounded-2xl shadow-xl border border-gray-100 dark:border-border overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            
            <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
              <div className="w-16 h-1 bg-[#ffc107] rounded-full mb-8"></div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-foreground mb-6 tracking-tight">Hikayemiz</h2>
              <div className="prose prose-lg text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                {aboutText || 'Yükleniyor...'}
              </div>
            </div>

            <div className="bg-gray-100 dark:bg-background p-8 flex items-center justify-center relative min-h-[400px] overflow-hidden group">
              {images.length > 0 ? (
                <div className="relative w-full h-[400px] rounded-xl overflow-hidden shadow-lg border-4 border-white dark:border-border">
                  {images.map((img, idx) => (
                    <div 
                      key={img.id} 
                      className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                      style={{ opacity: idx === currentImageIndex ? 1 : 0, zIndex: idx === currentImageIndex ? 10 : 0 }}
                    >
                      <img
                        src={img.image_url}
                        alt={`Hakkımızda ${idx + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                  
                  {/* Slider Controls */}
                  {images.length > 1 && (
                    <>
                      <button 
                        onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 dark:bg-card/80 hover:bg-white dark:bg-card text-gray-800 dark:text-gray-200 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button 
                        onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 dark:bg-card/80 hover:bg-white dark:bg-card text-gray-800 dark:text-gray-200 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                      
                      {/* Dots */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                        {images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-[#ffc107] w-6' : 'bg-white/50 hover:bg-white dark:bg-card'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-muted rounded-xl flex flex-col items-center justify-center border-4 border-white dark:border-border shadow-lg p-6 text-center">
                  <Package className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Panelden eklenen fotoğraflar burada kayan galeri olarak gösterilecek.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Core Values / Features */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-24 mb-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-foreground tracking-tight">Neden Bizi Seçmelisiniz?</h2>
          <div className="w-20 h-1 bg-[#ffc107] rounded-full mx-auto mt-4"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: ShieldCheck, title: "Güvenilir & Garantili", desc: "Sıfır ve orijinal çıkma parçalarımız garantili olarak sizlere sunulmaktadır. Arızalı veya uyumsuz parça derdine son." },
            { icon: Truck, title: "Tüm Türkiye'ye Hızlı Kargo", desc: "Adana'dan tüm Türkiye'ye en hızlı kargo ağımızla parçalarınızı güvenle kapınıza kadar ulaştırıyoruz." },
            { icon: Wrench, title: "Profesyonel Destek", desc: "Sadece satış yapmıyor, uzman ekibimizle aracınız için en doğru parçayı seçmenize teknik destek sağlıyoruz." },
            { icon: Star, title: "Eksa E-Ticaret Güvencesi", desc: "Trendyol ve Hepsiburada gibi büyük pazaryerlerinde 'Eksa E-Ticaret' markamızla binlerce başarılı siparişe imza attık." },
            { icon: Clock, title: "7/24 İletişim", desc: "Whatsapp destek hattımız üzerinden sipariş öncesi ve sonrası aklınıza takılan tüm sorular için yanınızdayız." },
            { icon: Package, title: "Geniş Stok Ağı", desc: "BMW, Mercedes, Audi ve Volkswagen başta olmak üzere ihtiyacınız olan tüm parçalar devasa stoklarımızda mevcut." },
          ].map((feature, i) => (
            <div key={i} className="bg-white dark:bg-card p-8 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500 rounded-xl flex items-center justify-center mb-6 shadow-sm border border-yellow-100 dark:border-yellow-900/50">
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-foreground mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 