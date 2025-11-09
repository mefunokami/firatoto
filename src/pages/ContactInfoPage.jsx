import React from "react";
import { Mail, MapPin, Phone, User2, Building2 } from "lucide-react";
import { Helmet } from 'react-helmet';

const ContactInfoPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Helmet>
        <title>İletişim | Fırat Oto Yedek Parça</title>
        <meta name="description" content="Fırat Oto Yedek Parça iletişim ve hesap bilgileri. Telefon, e-posta ve adres detayları burada." />
        <meta name="keywords" content="iletişim, firat oto, adana yedek parça, telefon, e-posta, adres" />
        <meta property="og:title" content="İletişim | Fırat Oto Yedek Parça" />
        <meta property="og:description" content="Fırat Oto Yedek Parça iletişim ve hesap bilgileri. Telefon, e-posta ve adres detayları burada." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://firatotoyedekparca.com/iletisim" />
        <meta property="og:image" content="https://firatotoyedekparca.com/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="İletişim | Fırat Oto Yedek Parça" />
        <meta name="twitter:description" content="Fırat Oto Yedek Parça iletişim ve hesap bilgileri. Telefon, e-posta ve adres detayları burada." />
        <meta name="twitter:image" content="https://firatotoyedekparca.com/logo.png" />
        <link rel="canonical" href="https://firatotoyedekparca.com/iletisim" />
      </Helmet>
      <div style={{display:'none'}}>
        BMW yedek parça, Mercedes yedek parça, Volkswagen yedek parça, Audi yedek parça, Skoda yedek parça, Seat yedek parça, Mini Cooper parça, orijinal yedek parça, çıkma parça, motor parçası, oto elektrik, oto mekanik, uygun fiyatlı yedek parça.
        Adana, Ankara, İstanbul, İzmir, Bursa, Antalya, Konya, Gaziantep, Mersin, Kayseri, Diyarbakır, Samsun, Eskişehir, Denizli, Şanlıurfa, Kocaeli, Trabzon, Sakarya, Malatya, Erzurum, Hatay, Balıkesir, Aydın, Manisa, Tekirdağ, Afyon, Van, Ordu, Batman, Elazığ, Çorum, Sivas, Isparta, Muğla, Uşak, Kütahya, Kırşehir, Osmaniye, Adıyaman, Tokat, Rize, Karabük, Giresun, Yozgat, Kars, Siirt, Bitlis, Bilecik, Düzce, Artvin, Nevşehir, Zonguldak, Niğde, Ağrı, Kilis, Tunceli, Bartın, Hakkari, Bayburt, Ardahan, Iğdır, Karaman, Aksaray, Çankırı, Kırıkkale, Bolu, Bingöl, Muş, Gümüşhane, Edirne.
      </div>
      <div className="bg-white rounded-2xl shadow-2xl p-12 border-t-4 border-yellow-400">
        <h2 className="text-3xl font-bold mb-10 text-gray-900 tracking-tight text-center">İLETİŞİM VE HESAP BİLGİLERİ</h2>
        <div className="flex flex-col gap-6 mb-12">
          <div className="flex items-center gap-4">
            <Building2 className="w-6 h-6 text-yellow-500" />
            <span className="font-semibold w-40">Firma Adı:</span>
            <span className="text-lg">FIRAT OTO YEDEK PARÇA</span>
          </div>
          <div className="flex items-center gap-4">
            <User2 className="w-6 h-6 text-yellow-500" />
            <span className="font-semibold w-40">Yetkili Kişi:</span>
            <span className="text-lg">Fırat Cengiz</span>
          </div>
          <div className="flex items-center gap-4">
            <Phone className="w-6 h-6 text-yellow-500" />
            <span className="font-semibold w-40">Telefon 1:</span>
            <a href="tel:+905439740121" className="text-lg text-blue-700 underline">+90 543 974 01 21</a>
          </div>
          <div className="flex items-center gap-4">
            <Phone className="w-6 h-6 text-yellow-500" />
            <span className="font-semibold w-40">Telefon 2:</span>
            <a href="tel:+905013530101" className="text-lg text-blue-700 underline">+90 501 353 01 01</a>
          </div>
          <div className="flex items-center gap-4">
            <Phone className="w-6 h-6 text-yellow-500" />
            <span className="font-semibold w-40">Telefon 3:</span>
            <a href="tel:+905551786221" className="text-lg text-blue-700 underline">+90 555 178 62 21</a>
          </div>
          <div className="flex items-center gap-4">
            <Mail className="w-6 h-6 text-yellow-500" />
            <span className="font-semibold w-40">E-mail:</span>
            <a href="mailto:eksaeticaret@gmail.com" className="text-lg text-blue-700 underline">eksaeticaret@gmail.com</a>
          </div>
          <div className="flex items-center gap-4">
            <MapPin className="w-6 h-6 text-yellow-500" />
            <span className="font-semibold w-40">Adres:</span>
            <div className="flex flex-col gap-1">
              <span className="text-lg">Fevzipaşa, 48046 sokak No: 29/A, 01190 Seyhan/Adana</span>
              <a href="https://share.google/Xbd8gaVyvr5t7W9Kf" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline text-sm">Konumu Görüntüle</a>
            </div>
          </div>
        </div>
        <div className="border-t pt-8 mt-4">
          <h3 className="font-bold mb-4 text-2xl flex items-center gap-3">
            <img src="/teb.png" alt="TEB Bank" className="h-8 w-auto rounded shadow inline-block mr-2" />
            Banka Hesapları
          </h3>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 max-w-2xl mx-auto">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base">IBAN:</span>
                <span className="font-mono tracking-wider text-gray-800 text-base whitespace-nowrap">TR43 0003 2000 0000 0113 9325 34</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base">Hesap Sahibi:</span>
                <span className="text-base whitespace-nowrap">ÖZGE ÖZDEMİR CENGİZ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfoPage; 