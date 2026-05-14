import React, { useState } from 'react';
import { Cog, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import AgreementModal from './AgreementModal';
import logo from '../../logo.png';

const Footer = () => {
  const [modal, setModal] = useState(null); // 'satis', 'gizlilik', 'iade', 'politikasi', 'kosullar', null

  return (
    <footer className="bg-neutral-800 text-white pt-10 md:pt-16 pb-6 md:pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* LOGO EN ÜSTE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
          {/* 1. Logo */}
          <div>
            <div className="mb-4">
              <a href="https://firatotoyedekparca.com" target="_self">
                <img src={logo} alt="Fırat Oto Logo" className="h-20 w-auto" />
              </a>
            </div>
            <div className="flex gap-4 mt-6">               
                <a href="https://www.instagram.com/firatotoyedekparcafbm/" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700"><Instagram /></a>
            </div>
          </div>
          {/* 2. Alışveriş */}
          <div>
            <p className="font-bold text-lg mb-2 flex items-center gap-2">
              ALIŞVERİŞ
              <span className="block w-8 h-1 bg-yellow-500 rounded ml-2"></span>
            </p>
            <ul className="space-y-1 text-sm">
              <li><a href="/iletisim" className="hover:text-yellow-400">İletişim Ve Hesap Numaraları</a></li>
              <li><a href="/hakkımızda" className="hover:text-yellow-400">Hakkımızda</a></li>
              <li><a href="/blog" className="hover:text-yellow-400">Blog</a></li>
            </ul>
          </div>
          {/* 3. Sipariş */}
          <div>
            <p className="font-bold text-lg mb-2 flex items-center gap-2">
              SİPARİŞ
              <span className="block w-8 h-1 bg-yellow-500 rounded ml-2"></span>
            </p>
            <ul className="space-y-1 text-sm">
              <li><button type="button" className="underline text-left" onClick={() => setModal('satis')}>Satış Sözleşmesi</button></li>
              <li><button type="button" className="underline text-left" onClick={() => setModal('gizlilik')}>Gizlilik ve Güvenlik</button></li>
              <li><button type="button" className="underline text-left" onClick={() => setModal('iade')}>İade ve Değişim</button></li>
              <li><button type="button" className="underline text-left" onClick={() => setModal('politikasi')}>Gizlilik Politikası</button></li>
              <li><button type="button" className="underline text-left" onClick={() => setModal('kosullar')}>Şartlar ve Koşullar</button></li>
            </ul>
          </div>
          {/* 4. Bize Ulaşın */}
          <div>
            <p className="font-bold text-lg mb-4">Bize Ulaşın</p>
            <address className="text-gray-400 not-italic space-y-2 text-sm">
                <p>Fırat Oto Yedek Parça</p>
                <div>
                  <p>Fevzipaşa, 48046 sokak No: 29/A, 01190 Seyhan/Adana</p>
                  <a href="https://share.google/Xbd8gaVyvr5t7W9Kf" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:text-yellow-300 underline text-xs">Konumu Görüntüle</a>
                </div>
                <p className="font-semibold text-white">Eposta: <a href="mailto:eksaeticaret@gmail.com" className="underline text-white">eksaeticaret@gmail.com</a></p>
                <p><strong className="text-white">Telefon:</strong> 0543 974 0121</p>
                <p><strong className="text-white">Telefon:</strong> 0501 353 0101</p>
                <p><strong className="text-white">Telefon:</strong> 0555 178 6221</p>
            </address>
          </div>
          {/* 5. Harita */}
          <div>
            <div className="w-full h-full min-h-[200px] rounded-lg overflow-hidden shadow-lg border border-gray-700">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3184.3591!2d35.3087!3d36.9822!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15288f6d38796da7%3A0x912b4e1cde2b651a!2zRsSxcmF0IE90byBZZWRlayBQYXLDp2E!5e0!3m2!1str!2str!4v1709971035652!5m2!1str!2str"
                title="Fırat Oto Yedek Parça Konum"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
        <div className="mt-8 md:mt-12">
          <div className="text-center mb-2">
            <span className="block text-xs text-gray-400">Diğer Tüm Parça ve Markalar İçin Telefon Numaramız: <span className="font-semibold">+90 543 974 01 21</span></span>
          </div>

          {/* SEO Anahtar Kelimeler */}
          <div className="border-t border-gray-700 pt-4 md:pt-6 mb-4">
            <p className="text-center text-gray-500 text-[10px] uppercase tracking-wider font-semibold mb-3">Popüler Aramalar</p>
            <div className="flex flex-wrap justify-center gap-1.5 max-w-4xl mx-auto">
              {[
                'BMW yedek parça', 'Mercedes yedek parça', 'Audi yedek parça',
                'Volkswagen yedek parça', 'VW yedek parça', 'Orijinal yedek parça',
                'Alman araç yedek parça', 'OEM yedek parça', 'Online yedek parça',
                'Adana BMW yedek parça', 'Adana Mercedes yedek parça',
                'Adana Audi yedek parça', 'Adana VW yedek parça',
                'Seyhan BMW parça', 'Çukurova Mercedes parça',
                'Adana Alman oto parça', 'Adana oto yedek parça',
                'turbo hortumu', 'intercooler', 'triger seti',
                'yağ filtresi', 'hava filtresi', 'far', 'stop lambası',
                'z rot', 'rotil', 'rot', 'fren balatası', 'fren diski',
                'amortisör', 'buji', 'bobin', 'kaput amortisörü',
                'şanzıman kulağı', 'salıncak', 'sinyal', 'radyatör',
                'karbüratör', 'yakıt pompası', 'manifold',
                'motor kaputu', 'bagaj kapağı', 'çamurluk',
                'tampon', 'm tampon', 'ızgara', 'spoiler',
                'karter', 'piston', 'braket', 'sis farı',
                'sis far çerçevesi', 'çeki kapağı', 'park sensörü', 'panjur'
              ].map((kw, i) => (
                <span key={i} className="text-[10px] text-gray-500 bg-neutral-700/50 px-2 py-0.5 rounded-full hover:text-yellow-400 hover:bg-neutral-600/50 transition-colors cursor-default">{kw}</span>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4 md:pt-6 text-center text-gray-500 text-xs md:text-sm">
            <p>&copy; {new Date().getFullYear()} Fırat Oto Yedek Parça. Tüm hakları saklıdır. Designed by <a href="https://www.mefunet.com" target="_blank" rel="noopener noreferrer" className="font-bold hover:text-primary">MefuNet</a></p>
          </div>
        </div>
      </div>
      {/* Modal */}
      <AgreementModal open={modal==='satis'} onClose={()=>setModal(null)} title="Satış Sözleşmesi">
        <p>Bu satış sözleşmesi, web sitemiz üzerinden yapılan alışverişlerde geçerlidir. Sipariş veren kullanıcı, aşağıdaki şartları kabul etmiş sayılır:</p>
        <ul className="list-disc pl-6">
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