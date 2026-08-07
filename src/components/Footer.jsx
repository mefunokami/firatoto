import React, { useState } from 'react';
import { Instagram, MapPin, Mail, Phone, ChevronRight, Youtube, Facebook } from 'lucide-react';
import AgreementModal from './AgreementModal';
import logo from '../../logo.png';

const Footer = () => {
  const [modal, setModal] = useState(null);

  return (
    <footer className="bg-[#18181b] text-gray-400 pt-16 md:pt-24 pb-8 mt-16 relative border-t-4 border-[#ffc107]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* 1. Marka ve Sosyal Medya */}
          <div className="lg:col-span-3 pr-0 lg:pr-4">
            <div className="mb-6">
              <a href="https://firatotoyedekparca.com" target="_self" className="inline-block">
                <img src={logo} alt="Fırat Oto Logo" className="h-16 w-auto drop-shadow-lg" loading="lazy" />
              </a>
              <p className="mt-6 text-sm text-gray-400 leading-relaxed font-medium">
                Aradığınız tüm yedek parçalar güvenle ve en hızlı şekilde kapınızda. Binlerce orijinal ve garantili yan sanayi ürün seçeneği ile aracınıza en uygun parçayı anında bulun.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-8">               
                <a 
                  href="https://www.instagram.com/firatotoyedekparcafbm/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-11 h-11 flex items-center justify-center rounded-full bg-white/5 text-gray-300 hover:bg-[#ffc107] hover:text-black transition-all duration-300 shadow-md hover:shadow-[0_0_15px_rgba(255,193,7,0.4)] hover:-translate-y-1"
                  title="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.facebook.com/profile.php?id=61579219284531&locale=tr_TR" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-11 h-11 flex items-center justify-center rounded-full bg-white/5 text-gray-300 hover:bg-[#1877F2] hover:text-white transition-all duration-300 shadow-md hover:shadow-[0_0_15px_rgba(24,119,242,0.4)] hover:-translate-y-1"
                  title="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.youtube.com/@F%C4%B1ratOtoYedekPar%C3%A7aFBM" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-11 h-11 flex items-center justify-center rounded-full bg-white/5 text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-300 shadow-md hover:shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:-translate-y-1"
                  title="YouTube"
                >
                  <Youtube className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.tiktok.com/@firatotoyedekparcafbm" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-11 h-11 flex items-center justify-center rounded-full bg-white/5 text-gray-300 hover:bg-black hover:text-white transition-all duration-300 shadow-md hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] border border-transparent hover:border-gray-700 hover:-translate-y-1"
                  title="TikTok"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.23-1.13 4.45-2.92 5.75-1.95 1.4-4.5 1.74-6.66.7-2.03-.96-3.4-2.85-3.66-5.06-.29-2.32.74-4.7 2.61-5.96 1.71-1.16 3.93-1.39 5.86-.71.13.04.28.1.41.13v4.13c-1.17-.46-2.58-.33-3.64.44-.8.56-1.17 1.6-1.04 2.56.12.92.86 1.76 1.75 2.06 1.05.37 2.33.15 3.12-.6.7-.65 1.02-1.6 1.02-2.56V.02z" />
                  </svg>
                </a>
                <a 
                  href="https://x.com/firatotoyedek" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-11 h-11 flex items-center justify-center rounded-full bg-white/5 text-gray-300 hover:bg-black hover:text-white transition-all duration-300 shadow-md hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] border border-transparent hover:border-gray-700 hover:-translate-y-1"
                  title="X (Twitter)"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                  </svg>
                </a>
            </div>
          </div>

          {/* 2. Kurumsal */}
          <div className="lg:col-span-2">
            <h3 className="font-extrabold text-lg text-white mb-6 flex flex-col">
              Kurumsal
              <span className="block w-10 h-1 bg-[#ffc107] rounded-full mt-3"></span>
            </h3>
            <ul className="space-y-4 text-sm font-medium">
              <li><a href="/hakkımızda" className="hover:text-[#ffc107] transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />Hakkımızda</a></li>
              <li><a href="/blog" className="hover:text-[#ffc107] transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />Blog</a></li>
              <li><a href="/iletisim" className="hover:text-[#ffc107] transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />İletişim Bilgileri</a></li>
            </ul>
          </div>

          {/* 3. Müşteri Hizmetleri */}
          <div className="lg:col-span-2">
            <h3 className="font-extrabold text-lg text-white mb-6 flex flex-col">
              Sözleşmeler
              <span className="block w-10 h-1 bg-[#ffc107] rounded-full mt-3"></span>
            </h3>
            <ul className="space-y-4 text-sm font-medium">
              <li><button type="button" className="hover:text-[#ffc107] transition-colors text-left flex items-center gap-2" onClick={() => setModal('satis')}><ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />Satış Sözleşmesi</button></li>
              <li><button type="button" className="hover:text-[#ffc107] transition-colors text-left flex items-center gap-2" onClick={() => setModal('gizlilik')}><ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />Gizlilik ve Güvenlik</button></li>
              <li><button type="button" className="hover:text-[#ffc107] transition-colors text-left flex items-center gap-2" onClick={() => setModal('iade')}><ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />İade ve Değişim</button></li>
            </ul>
          </div>

          {/* 4. İletişim */}
          <div className="lg:col-span-3">
            <h3 className="font-extrabold text-lg text-white mb-6 flex flex-col">
              İletişim
              <span className="block w-10 h-1 bg-[#ffc107] rounded-full mt-3"></span>
            </h3>
            <div className="bg-white/5 rounded-2xl p-4 md:p-5 border border-white/5 shadow-inner">
              <ul className="space-y-4 text-sm font-medium">
                <li className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-[#ffc107]">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <span className="leading-relaxed text-gray-300">
                    Fevzipaşa, 48046 sokak No: 29/A, 01190 Seyhan/Adana
                    <a href="https://www.google.com/maps?ll=36.997894,35.274545&z=15&t=m&hl=tr&gl=TR&mapclient=embed&cid=10460540445391545626" target="_blank" rel="noopener noreferrer" className="block text-[#ffc107] hover:text-white transition-colors mt-1 underline underline-offset-4 decoration-[#ffc107]/30 font-bold">Haritada Yol Tarifi Al</a>
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-[#ffc107]">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <a href="mailto:eksaeticaret@gmail.com" className="hover:text-[#ffc107] transition-colors text-gray-300 truncate">eksaeticaret@gmail.com</a>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-[#ffc107]">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col space-y-1 text-gray-300 font-bold">
                    <a href="tel:+905013530101" className="hover:text-[#ffc107] transition-colors">0501 353 01 01</a>
                    <a href="tel:+905439740121" className="hover:text-[#ffc107] transition-colors">0543 974 01 21</a>
                    <a href="tel:+905551786221" className="hover:text-[#ffc107] transition-colors">0555 178 62 21</a>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* 5. Harita */}
          <div className="lg:col-span-2">
            <h3 className="font-extrabold text-lg text-white mb-6 flex flex-col">
              Konum
              <span className="block w-10 h-1 bg-[#ffc107] rounded-full mt-3"></span>
            </h3>
            <a href="https://www.google.com/maps?ll=36.997894,35.274545&z=15&t=m&hl=tr&gl=TR&mapclient=embed&cid=10460540445391545626" target="_blank" rel="noopener noreferrer" className="block w-full h-[180px] rounded-xl overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-white/10 group relative bg-white/5 flex flex-col items-center justify-center hover:border-[#ffc107] hover:shadow-[0_0_20px_rgba(255,193,7,0.2)] transition-all duration-300">
                <div className="absolute inset-0 opacity-20 flex items-center justify-center pointer-events-none transition-opacity duration-500 group-hover:opacity-30">
                  <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(#4b5563 1px, transparent 1px), linear-gradient(90deg, #4b5563 1px, transparent 1px)', backgroundSize: '15px 15px' }}></div>
                </div>
                
                <div className="w-14 h-14 rounded-full bg-[#ffc107]/10 border border-[#ffc107]/30 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-[#ffc107] transition-all duration-500 relative z-10 shadow-[0_0_15px_rgba(255,193,7,0.2)]">
                  <MapPin className="w-6 h-6 text-[#ffc107] group-hover:text-black transition-colors" />
                </div>
                <span className="text-white font-extrabold tracking-wide relative z-10 group-hover:text-[#ffc107] transition-colors">Haritayı Aç</span>
                <span className="text-gray-400 text-xs mt-1 relative z-10 font-medium">Google Haritalar</span>
            </a>
          </div>

        </div>
        
        {/* Alt Bilgi */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm font-medium text-gray-400">
            Diğer Tüm Parça ve Markalar İçin Bizi Arayın: <span className="font-bold text-[#ffc107]">+90 543 974 01 21</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            &copy; {new Date().getFullYear()} Fırat Oto Yedek Parça. Tüm hakları saklıdır. Designed by <a href="https://www.mefunet.com" target="_blank" rel="noopener noreferrer" className="font-bold text-gray-400 hover:text-[#ffc107] transition-colors">MefuNet</a>
          </p>
        </div>
      </div>

      {/* Modals */}
      <AgreementModal open={modal==='satis'} onClose={()=>setModal(null)} title="Satış Sözleşmesi">
        <p>Bu satış sözleşmesi, web sitemiz üzerinden yapılan alışverişlerde geçerlidir. Sipariş veren kullanıcı, aşağıdaki şartları kabul etmiş sayılır:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Ürünler, stok durumuna göre en kısa sürede kargoya verilir.</li>
          <li>Alıcı, teslimat adresini doğru ve eksiksiz bildirmekle yükümlüdür.</li>
          <li>İptal ve iade koşulları yasal mevzuata ve sitemizdeki iade politikalarına tabidir.</li>
          <li>Satıcı, fiyat ve kampanya koşullarında değişiklik yapma hakkını saklı tutar.</li>
        </ul>
      </AgreementModal>
      <AgreementModal open={modal==='gizlilik'} onClose={()=>setModal(null)} title="Gizlilik ve Güvenlik">
        <p>Kullanıcı bilgileriniz gizli tutulur ve üçüncü kişilerle paylaşılmaz. Tüm ödemeler güvenli altyapı ile gerçekleştirilir.</p>
      </AgreementModal>
      <AgreementModal open={modal==='iade'} onClose={()=>setModal(null)} title="İade ve Değişim">
        <p>İade ve değişim talepleriniz, teslimat tarihinden itibaren 14 gün içinde işleme alınır. Ürünlerin kullanılmamış ve orijinal ambalajında olması gerekmektedir.</p>
      </AgreementModal>
      <AgreementModal open={modal==='politikasi'} onClose={()=>setModal(null)} title="Gizlilik Politikası">
        <p>Kişisel verileriniz, KVKK kapsamında işlenir ve korunur. Detaylı bilgi için aydınlatma metnimizi inceleyebilirsiniz.</p>
      </AgreementModal>
      <AgreementModal open={modal==='kosullar'} onClose={()=>setModal(null)} title="Şartlar ve Koşullar">
        <p>Siteyi kullanan tüm ziyaretçiler, kullanım şartlarını ve gizlilik politikasını kabul etmiş sayılır.</p>
      </AgreementModal>
    </footer>
  );
};

export default Footer;