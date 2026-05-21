import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

const AboutPage = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetch('/api/about_images.php')
      .then(res => res.json())
      .then(data => setImages(data))
      .catch(err => console.error('Hakkımızda resimleri çekilemedi:', err));
  }, []);
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
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
      </Helmet>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2 text-gray-900">HAKKIMIZDA</h1>
        <p className="text-gray-700 text-base mb-4">
          <b>Fırat Oto Yedek Parça</b>, 2021 yılında Adana'da kurulmuş olup, otomotiv yedek parça sektöründe yenilikçi ve güvenilir hizmet anlayışıyla faaliyet göstermektedir. Müşterilerimize sadece parça satışı değil, aynı zamanda doğru ürün seçimi ve teknik destek konusunda da profesyonel çözümler sunuyoruz.
        </p>
        <p className="text-gray-700 text-base">
          <b>Fırat Oto Yedek Parça</b> olarak Adana merkezli firmamızla, BMW, Mercedes, Audi, Volkswagen başta olmak üzere birçok marka için çıkma ve sıfır yedek parça temini sağlıyoruz. Tüm Türkiye'ye hızlı kargo imkanıyla hizmet verirken, ürünlerimize <a href="https://www.firatotoyedekparca.com" className="text-blue-600 hover:text-blue-800 underline">www.firatotoyedekparca.com</a> sitemizden, ayrıca <b>Oto Çıkma</b> ve <b>Çıkma Parça Market</b> mağazalarımız üzerinden ulaşabilirsiniz. <b>Trendyol</b> ve <b>Hepsiburada</b> platformlarında ise <b>Eksa E-Ticaret</b> adıyla faaliyet göstermekteyiz. Kaliteli parça, uygun fiyat ve güvenilir alışveriş ilkeleriyle, online yedek parça sektöründe sizlere en iyi hizmeti sunmayı hedefliyoruz.
        </p>
      </div>
      <div style={{display:'none'}}>
        BMW yedek parça, Mercedes yedek parça, Volkswagen yedek parça, Audi yedek parça, Skoda yedek parça, Seat yedek parça, Mini Cooper parça, orijinal yedek parça, çıkma parça, motor parçası, oto elektrik, oto mekanik, uygun fiyatlı yedek parça.
        Adana, Ankara, İstanbul, İzmir, Bursa, Antalya, Konya, Gaziantep, Mersin, Kayseri, Diyarbakır, Samsun, Eskişehir, Denizli, Şanlıurfa, Kocaeli, Trabzon, Sakarya, Malatya, Erzurum, Hatay, Balıkesir, Aydın, Manisa, Tekirdağ, Afyon, Van, Ordu, Batman, Elazığ, Çorum, Sivas, Isparta, Muğla, Uşak, Kütahya, Kırşehir, Osmaniye, Adıyaman, Tokat, Rize, Karabük, Giresun, Yozgat, Kars, Siirt, Bitlis, Bilecik, Düzce, Artvin, Nevşehir, Zonguldak, Niğde, Ağrı, Kilis, Tunceli, Bartın, Hakkari, Bayburt, Ardahan, Iğdır, Karaman, Aksaray, Çankırı, Kırıkkale, Bolu, Bingöl, Muş, Gümüşhane, Edirne.
      </div>
      {images.map(img => (
        <img
          key={img.id}
          src={img.image_url}
          alt="Hakkımızda"
          className="w-full mb-6 rounded shadow"
          loading="lazy"
        />
      ))}
    </div>
  );
};

export default AboutPage; 