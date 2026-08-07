import React, { useEffect, useState } from "react";
import { Mail, MapPin, Phone, User2, Building2, MessageCircle, Map, CreditCard, ChevronRight, Instagram, Facebook, Youtube, Share2 } from "lucide-react";
import { Helmet } from 'react-helmet';
import GoogleMapsRating from '@/components/GoogleMapsRating';
import { motion } from 'framer-motion';

const ContactInfoPage = () => {
  const [googleMaps, setGoogleMaps] = useState({
    rating: 0,
    review_count: 0,
    maps_url: 'https://share.google/Sq5zO5TC6BcGLN7v6',
  });

  useEffect(() => {
    fetch('/api/google_maps_rating.php')
      .then((r) => r.json())
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

  const owners = [
    {
      name: "Fırat Cengiz",
      role: "Şirket Yetkilisi",
      phone: "+90 543 974 01 21",
      cleanPhone: "+905439740121"
    },
    {
      name: "Baran Cengiz",
      role: "Şirket Yetkilisi",
      phone: "+90 501 353 01 01",
      cleanPhone: "+905013530101"
    },
    {
      name: "Mazlum Cengiz",
      role: "Şirket Yetkilisi",
      phone: "+90 555 178 62 21",
      cleanPhone: "+905551786221"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#ffc107]/20 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#ffc107] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-32 -left-24 w-72 h-72 bg-[#ffc107] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

      <Helmet>
        <title>İletişim | Fırat Oto Yedek Parça</title>
        <meta name="description" content="Fırat Oto Yedek Parça iletişim ve hesap bilgileri. Telefon, e-posta ve adres detayları burada." />
      </Helmet>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-gray-900 dark:text-foreground tracking-tight mb-4"
          >
            BİZİMLE İLETİŞİME GEÇİN
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium"
          >
            Aklınıza takılan bir soru mu var veya bir parça mı arıyorsunuz?
            Fırat Oto Yedek Parça ekibi olarak size yardımcı olmaktan memnuniyet duyarız.
          </motion.p>
        </div>

        {/* 3 Owners Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {owners.map((owner, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              className="group relative bg-white/70 dark:bg-card/70 backdrop-blur-xl rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 dark:border-border/40 hover:shadow-[0_8px_40px_rgba(255,193,7,0.15)] transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
              
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-20 h-20 bg-[#ffc107] rounded-2xl flex items-center justify-center shadow-lg shadow-[#ffc107]/30 mb-4 transform group-hover:rotate-6 transition-transform duration-300">
                  <User2 className="w-10 h-10 text-gray-900 dark:text-foreground" />
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-foreground mb-1">{owner.name}</h3>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-6 uppercase tracking-wider">{owner.role}</p>
                
                <div className="w-full flex flex-col gap-3">
                  <a 
                    href={`tel:${owner.cleanPhone}`}
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold transition-colors shadow-md"
                  >
                    <Phone className="w-4 h-4" />
                    {owner.phone}
                  </a>
                  <a 
                    href={`https://wa.me/${owner.cleanPhone.replace('+', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] rounded-xl font-bold transition-colors border border-[#25D366]/20"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Info Blocks (Address, Email, Bank) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Adres & İletişim Kartı */}
          <div className="bg-white dark:bg-card rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-border flex flex-col h-full relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
              <MapPin className="w-64 h-64 -mb-16 -mr-16 transform group-hover:scale-110 transition-transform duration-700" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-foreground mb-8 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-[#ffc107]/20 text-gray-900 dark:text-foreground flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </span>
              Merkez Ofis & Mağaza
            </h2>
            
            <div className="flex flex-col gap-6 flex-1 relative z-10">
              <div className="flex items-start gap-4 group/item">
                <div className="mt-1 bg-gray-50 dark:bg-background p-3 rounded-xl group-hover/item:bg-[#ffc107]/20 transition-colors">
                  <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover/item:text-gray-900 dark:text-foreground transition-colors" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-foreground mb-1">Adres</h4>
                  <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed mb-3 max-w-md">
                    Fevzipaşa, 48046 sokak No: 29/A, 01190 Seyhan/Adana
                  </p>
                  <a 
                    href={googleMaps.maps_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Haritada Görüntüle <ChevronRight className="w-4 h-4" />
                  </a>
                  <div className="mt-4 inline-block">
                    <GoogleMapsRating
                      rating={googleMaps.rating}
                      reviewCount={googleMaps.review_count}
                      mapsUrl={googleMaps.maps_url}
                      size="sm"
                    />
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-gray-100 dark:bg-border" />

              <div className="flex items-center gap-4 group/item">
                <div className="bg-gray-50 dark:bg-background p-3 rounded-xl group-hover/item:bg-[#ffc107]/20 transition-colors">
                  <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover/item:text-gray-900 dark:text-foreground transition-colors" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-foreground mb-0.5">E-posta</h4>
                  <a href="mailto:eksaeticaret@gmail.com" className="text-gray-600 dark:text-gray-400 font-medium hover:text-gray-900 dark:text-foreground transition-colors">
                    eksaeticaret@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Banka Hesapları Kartı */}
          <div className="bg-gray-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
              <CreditCard className="w-64 h-64 -mt-16 -mr-16 transform group-hover:-rotate-12 transition-transform duration-700" />
            </div>
            
            <h2 className="text-2xl font-extrabold text-white mb-8 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center backdrop-blur-sm">
                <CreditCard className="w-5 h-5" />
              </span>
              Banka Hesap Bilgilerimiz
            </h2>

            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 relative z-10 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="bg-white dark:bg-card p-2 rounded-lg shadow-sm">
                    <img src="/teb.png" alt="TEB" className="h-6 w-auto object-contain" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Türk Ekonomi Bankası (TEB)</h3>
                    <p className="text-gray-400 text-sm font-medium">TL Vadesiz Hesap</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <div>
                  <span className="block text-gray-400 text-sm font-medium mb-1">Hesap Sahibi</span>
                  <span className="block text-white font-bold text-lg tracking-wide">ÖZGE ÖZDEMİR CENGİZ</span>
                </div>
                <div>
                  <span className="block text-gray-400 text-sm font-medium mb-1">IBAN Numarası</span>
                  <div className="flex items-center justify-between bg-black/40 rounded-xl p-4 border border-white/5">
                    <span className="font-mono text-[#ffc107] font-bold tracking-widest sm:text-lg">
                      TR43 0003 2000 0000 0113 9325 34
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 flex items-center gap-1.5">
                    * Lütfen havale/EFT yaparken açıklama kısmına sipariş numaranızı yazınız.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sosyal Medya Hesapları Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-12"
        >
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-foreground mb-8 text-center flex items-center justify-center gap-3">
            <Share2 className="w-8 h-8 text-[#ffc107]" />
            Sosyal Medya Hesaplarımız
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Instagram */}
            <a href="https://www.instagram.com/firatotoyedekparcafbm/" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-3 p-6 bg-white dark:bg-card rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-border hover:shadow-xl hover:border-pink-500 hover:-translate-y-1 transition-all group">
              <div className="w-14 h-14 bg-pink-50 dark:bg-pink-500/10 rounded-2xl flex items-center justify-center group-hover:bg-gradient-to-tr group-hover:from-yellow-400 group-hover:via-pink-500 group-hover:to-purple-500 group-hover:text-white transition-all text-pink-500 group-hover:rotate-6">
                <Instagram className="w-7 h-7" />
              </div>
              <span className="font-bold text-sm text-gray-800 dark:text-gray-200">Instagram</span>
            </a>

            {/* Facebook */}
            <a href="https://www.facebook.com/profile.php?id=61579219284531&locale=tr_TR" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-3 p-6 bg-white dark:bg-card rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-border hover:shadow-xl hover:border-blue-600 hover:-translate-y-1 transition-all group">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-600/10 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all text-blue-600 group-hover:-rotate-6">
                <Facebook className="w-7 h-7" />
              </div>
              <span className="font-bold text-sm text-gray-800 dark:text-gray-200">Facebook</span>
            </a>

            {/* YouTube */}
            <a href="https://www.youtube.com/@F%C4%B1ratOtoYedekPar%C3%A7aFBM" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-3 p-6 bg-white dark:bg-card rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-border hover:shadow-xl hover:border-red-600 hover:-translate-y-1 transition-all group">
              <div className="w-14 h-14 bg-red-50 dark:bg-red-600/10 rounded-2xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all text-red-600 group-hover:rotate-6">
                <Youtube className="w-7 h-7" />
              </div>
              <span className="font-bold text-sm text-gray-800 dark:text-gray-200">YouTube</span>
            </a>

            {/* TikTok */}
            <a href="https://www.tiktok.com/@firatotoyedekparcafbm" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-3 p-6 bg-white dark:bg-card rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-border hover:shadow-xl hover:border-black dark:hover:border-gray-500 hover:-translate-y-1 transition-all group">
              <div className="w-14 h-14 bg-gray-100 dark:bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all text-gray-800 dark:text-gray-200 group-hover:-rotate-6">
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.23-1.13 4.45-2.92 5.75-1.95 1.4-4.5 1.74-6.66.7-2.03-.96-3.4-2.85-3.66-5.06-.29-2.32.74-4.7 2.61-5.96 1.71-1.16 3.93-1.39 5.86-.71.13.04.28.1.41.13v4.13c-1.17-.46-2.58-.33-3.64.44-.8.56-1.17 1.6-1.04 2.56.12.92.86 1.76 1.75 2.06 1.05.37 2.33.15 3.12-.6.7-.65 1.02-1.6 1.02-2.56V.02z" />
                </svg>
              </div>
              <span className="font-bold text-sm text-gray-800 dark:text-gray-200">TikTok</span>
            </a>

            {/* X (Twitter) */}
            <a href="https://x.com/firatotoyedek" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-3 p-6 bg-white dark:bg-card rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-border hover:shadow-xl hover:border-black dark:hover:border-gray-500 hover:-translate-y-1 transition-all group">
              <div className="w-14 h-14 bg-gray-100 dark:bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all text-gray-800 dark:text-gray-200 group-hover:rotate-6">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                </svg>
              </div>
              <span className="font-bold text-sm text-gray-800 dark:text-gray-200">X (Twitter)</span>
            </a>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default ContactInfoPage;